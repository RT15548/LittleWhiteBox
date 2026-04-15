var Df = Object.create, Ql = Object.defineProperty, Lf = Object.getOwnPropertyDescriptor, Uf = Object.getOwnPropertyNames, $f = Object.getPrototypeOf, Ff = Object.prototype.hasOwnProperty, $o = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), Gf = (e, t, n, o) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var i = Uf(t), s = 0, l = i.length, u; s < l; s++)
      u = i[s], !Ff.call(e, u) && u !== n && Ql(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(o = Lf(t, u)) || o.enumerable
      });
  return e;
}, Bf = (e, t, n) => (n = e != null ? Df($f(e)) : {}, Gf(t || !e || !e.__esModule ? Ql(n, "default", {
  value: e,
  enumerable: !0
}) : n, e));
function F(e, t, n, o, i) {
  if (o === "m") throw new TypeError("Private method is not writable");
  if (o === "a" && !i) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !i : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return o === "a" ? i.call(e, n) : i ? i.value = n : t.set(e, n), n;
}
function E(e, t, n, o) {
  if (n === "a" && !o) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !o : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? o : n === "a" ? o.call(e) : o ? o.value : t.get(e);
}
var Zl = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Zl = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function wi(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Ii = (e) => {
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
}, L = class extends Error {
}, re = class Ci extends L {
  constructor(t, n, o, i) {
    super(`${Ci.makeMessage(t, n, o)}`), this.status = t, this.headers = i, this.requestID = i?.get("x-request-id"), this.error = n;
    const s = n;
    this.code = s?.code, this.param = s?.param, this.type = s?.type;
  }
  static makeMessage(t, n, o) {
    const i = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && i ? `${t} ${i}` : t ? `${t} status code (no body)` : i || "(no status code or body)";
  }
  static generate(t, n, o, i) {
    if (!t || !i) return new Fo({
      message: o,
      cause: Ii(n)
    });
    const s = n?.error;
    return t === 400 ? new jl(t, s, o, i) : t === 401 ? new eu(t, s, o, i) : t === 403 ? new tu(t, s, o, i) : t === 404 ? new nu(t, s, o, i) : t === 409 ? new ou(t, s, o, i) : t === 422 ? new iu(t, s, o, i) : t === 429 ? new su(t, s, o, i) : t >= 500 ? new ru(t, s, o, i) : new Ci(t, s, o, i);
  }
}, Ie = class extends re {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Fo = class extends re {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, ms = class extends Fo {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, jl = class extends re {
}, eu = class extends re {
}, tu = class extends re {
}, nu = class extends re {
}, ou = class extends re {
}, iu = class extends re {
}, su = class extends re {
}, ru = class extends re {
}, au = class extends L {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, lu = class extends L {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, sn = class extends Error {
  constructor(e) {
    super(e);
  }
}, uu = class extends re {
  constructor(e, t, n) {
    let o = "OAuth2 authentication error", i;
    if (t && typeof t == "object") {
      const s = t;
      i = s.error;
      const l = s.error_description;
      l && typeof l == "string" ? o = l : i && (o = i);
    }
    super(e, t, o, n), this.error_code = i;
  }
}, qf = class extends L {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, Vf = /^[a-z][a-z0-9+.-]*:/i, Hf = (e) => Vf.test(e), he = (e) => (he = Array.isArray, he(e)), er = he;
function cu(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function tr(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Of(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function ni(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var Jf = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new L(`${e} must be an integer`);
  if (t < 0) throw new L(`${e} must be a positive integer`);
  return t;
}, Wf = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, bn = (e) => new Promise((t) => setTimeout(t, e)), Tt = "6.34.0", Kf = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function Yf() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var zf = () => {
  const e = Yf();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Tt,
    "X-Stainless-OS": or(Deno.build.os),
    "X-Stainless-Arch": nr(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Tt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Tt,
    "X-Stainless-OS": or(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": nr(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = Xf();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Tt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Tt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function Xf() {
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
var nr = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", or = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), ir, Qf = () => ir ?? (ir = zf());
function du() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function fu(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function hu(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return fu({
    start() {
    },
    async pull(n) {
      const { done: o, value: i } = await t.next();
      o ? n.close() : n.enqueue(i);
    },
    async cancel() {
      await t.return?.();
    }
  });
}
function pu(e) {
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
async function sr(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var Zf = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), mu = "RFC3986", gu = (e) => String(e), rr = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: gu
};
var Ai = (e, t) => (Ai = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), Ai(e, t)), De = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), oi = 1024, jf = (e, t, n, o, i) => {
  if (e.length === 0) return e;
  let s = e;
  if (typeof e == "symbol" ? s = Symbol.prototype.toString.call(e) : typeof e != "string" && (s = String(e)), n === "iso-8859-1") return escape(s).replace(/%u[0-9a-f]{4}/gi, function(u) {
    return "%26%23" + parseInt(u.slice(2), 16) + "%3B";
  });
  let l = "";
  for (let u = 0; u < s.length; u += oi) {
    const c = s.length >= oi ? s.slice(u, u + oi) : s, d = [];
    for (let h = 0; h < c.length; ++h) {
      let f = c.charCodeAt(h);
      if (f === 45 || f === 46 || f === 95 || f === 126 || f >= 48 && f <= 57 || f >= 65 && f <= 90 || f >= 97 && f <= 122 || i === "RFC1738" && (f === 40 || f === 41)) {
        d[d.length] = c.charAt(h);
        continue;
      }
      if (f < 128) {
        d[d.length] = De[f];
        continue;
      }
      if (f < 2048) {
        d[d.length] = De[192 | f >> 6] + De[128 | f & 63];
        continue;
      }
      if (f < 55296 || f >= 57344) {
        d[d.length] = De[224 | f >> 12] + De[128 | f >> 6 & 63] + De[128 | f & 63];
        continue;
      }
      h += 1, f = 65536 + ((f & 1023) << 10 | c.charCodeAt(h) & 1023), d[d.length] = De[240 | f >> 18] + De[128 | f >> 12 & 63] + De[128 | f >> 6 & 63] + De[128 | f & 63];
    }
    l += d.join("");
  }
  return l;
};
function eh(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function ar(e, t) {
  if (he(e)) {
    const n = [];
    for (let o = 0; o < e.length; o += 1) n.push(t(e[o]));
    return n;
  }
  return t(e);
}
var _u = {
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
}, yu = function(e, t) {
  Array.prototype.push.apply(e, he(t) ? t : [t]);
}, lr, Z = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: jf,
  encodeValuesOnly: !1,
  format: mu,
  formatter: gu,
  indices: !1,
  serializeDate(e) {
    return (lr ?? (lr = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function th(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var ii = {};
function vu(e, t, n, o, i, s, l, u, c, d, h, f, p, m, g, _, y, I) {
  let S = e, A = I, R = 0, $ = !1;
  for (; (A = A.get(ii)) !== void 0 && !$; ) {
    const V = A.get(e);
    if (R += 1, typeof V < "u") {
      if (V === R) throw new RangeError("Cyclic object value");
      $ = !0;
    }
    typeof A.get(ii) > "u" && (R = 0);
  }
  if (typeof d == "function" ? S = d(t, S) : S instanceof Date ? S = p?.(S) : n === "comma" && he(S) && (S = ar(S, function(V) {
    return V instanceof Date ? p?.(V) : V;
  })), S === null) {
    if (s) return c && !_ ? c(t, Z.encoder, y, "key", m) : t;
    S = "";
  }
  if (th(S) || eh(S)) {
    if (c) {
      const V = _ ? t : c(t, Z.encoder, y, "key", m);
      return [g?.(V) + "=" + g?.(c(S, Z.encoder, y, "value", m))];
    }
    return [g?.(t) + "=" + g?.(String(S))];
  }
  const T = [];
  if (typeof S > "u") return T;
  let U;
  if (n === "comma" && he(S))
    _ && c && (S = ar(S, c)), U = [{ value: S.length > 0 ? S.join(",") || null : void 0 }];
  else if (he(d)) U = d;
  else {
    const V = Object.keys(S);
    U = h ? V.sort(h) : V;
  }
  const C = u ? String(t).replace(/\./g, "%2E") : String(t), k = o && he(S) && S.length === 1 ? C + "[]" : C;
  if (i && he(S) && S.length === 0) return k + "[]";
  for (let V = 0; V < U.length; ++V) {
    const J = U[V], de = typeof J == "object" && typeof J.value < "u" ? J.value : S[J];
    if (l && de === null) continue;
    const ae = f && u ? J.replace(/\./g, "%2E") : J, Y = he(S) ? typeof n == "function" ? n(k, ae) : k : k + (f ? "." + ae : "[" + ae + "]");
    I.set(e, R);
    const W = /* @__PURE__ */ new WeakMap();
    W.set(ii, I), yu(T, vu(de, Y, n, o, i, s, l, u, n === "comma" && _ && he(S) ? null : c, d, h, f, p, m, g, _, y, W));
  }
  return T;
}
function nh(e = Z) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || Z.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = mu;
  if (typeof e.format < "u") {
    if (!Ai(rr, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const o = rr[n];
  let i = Z.filter;
  (typeof e.filter == "function" || he(e.filter)) && (i = e.filter);
  let s;
  if (e.arrayFormat && e.arrayFormat in _u ? s = e.arrayFormat : "indices" in e ? s = e.indices ? "indices" : "repeat" : s = Z.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  const l = typeof e.allowDots > "u" ? e.encodeDotInKeys ? !0 : Z.allowDots : !!e.allowDots;
  return {
    addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : Z.addQueryPrefix,
    allowDots: l,
    allowEmptyArrays: typeof e.allowEmptyArrays == "boolean" ? !!e.allowEmptyArrays : Z.allowEmptyArrays,
    arrayFormat: s,
    charset: t,
    charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : Z.charsetSentinel,
    commaRoundTrip: !!e.commaRoundTrip,
    delimiter: typeof e.delimiter > "u" ? Z.delimiter : e.delimiter,
    encode: typeof e.encode == "boolean" ? e.encode : Z.encode,
    encodeDotInKeys: typeof e.encodeDotInKeys == "boolean" ? e.encodeDotInKeys : Z.encodeDotInKeys,
    encoder: typeof e.encoder == "function" ? e.encoder : Z.encoder,
    encodeValuesOnly: typeof e.encodeValuesOnly == "boolean" ? e.encodeValuesOnly : Z.encodeValuesOnly,
    filter: i,
    format: n,
    formatter: o,
    serializeDate: typeof e.serializeDate == "function" ? e.serializeDate : Z.serializeDate,
    skipNulls: typeof e.skipNulls == "boolean" ? e.skipNulls : Z.skipNulls,
    sort: typeof e.sort == "function" ? e.sort : null,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : Z.strictNullHandling
  };
}
function oh(e, t = {}) {
  let n = e;
  const o = nh(t);
  let i, s;
  typeof o.filter == "function" ? (s = o.filter, n = s("", n)) : he(o.filter) && (s = o.filter, i = s);
  const l = [];
  if (typeof n != "object" || n === null) return "";
  const u = _u[o.arrayFormat], c = u === "comma" && o.commaRoundTrip;
  i || (i = Object.keys(n)), o.sort && i.sort(o.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let p = 0; p < i.length; ++p) {
    const m = i[p];
    o.skipNulls && n[m] === null || yu(l, vu(n[m], m, u, c, o.allowEmptyArrays, o.strictNullHandling, o.skipNulls, o.encodeDotInKeys, o.encode ? o.encoder : null, o.filter, o.sort, o.allowDots, o.serializeDate, o.format, o.formatter, o.encodeValuesOnly, o.charset, d));
  }
  const h = l.join(o.delimiter);
  let f = o.addQueryPrefix === !0 ? "?" : "";
  return o.charsetSentinel && (o.charset === "iso-8859-1" ? f += "utf8=%26%2310003%3B&" : f += "utf8=%E2%9C%93&"), h.length > 0 ? f + h : "";
}
function ih(e) {
  return oh(e, { arrayFormat: "brackets" });
}
function sh(e) {
  let t = 0;
  for (const i of e) t += i.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const i of e)
    n.set(i, o), o += i.length;
  return n;
}
var ur;
function gs(e) {
  let t;
  return (ur ?? (t = new globalThis.TextEncoder(), ur = t.encode.bind(t)))(e);
}
var cr;
function dr(e) {
  let t;
  return (cr ?? (t = new globalThis.TextDecoder(), cr = t.decode.bind(t)))(e);
}
var ge, _e, Go = class {
  constructor() {
    ge.set(this, void 0), _e.set(this, void 0), F(this, ge, new Uint8Array(), "f"), F(this, _e, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? gs(e) : e;
    F(this, ge, sh([E(this, ge, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = rh(E(this, ge, "f"), E(this, _e, "f"))) != null; ) {
      if (o.carriage && E(this, _e, "f") == null) {
        F(this, _e, o.index, "f");
        continue;
      }
      if (E(this, _e, "f") != null && (o.index !== E(this, _e, "f") + 1 || o.carriage)) {
        n.push(dr(E(this, ge, "f").subarray(0, E(this, _e, "f") - 1))), F(this, ge, E(this, ge, "f").subarray(E(this, _e, "f")), "f"), F(this, _e, null, "f");
        continue;
      }
      const i = E(this, _e, "f") !== null ? o.preceding - 1 : o.preceding, s = dr(E(this, ge, "f").subarray(0, i));
      n.push(s), F(this, ge, E(this, ge, "f").subarray(o.index), "f"), F(this, _e, null, "f");
    }
    return n;
  }
  flush() {
    return E(this, ge, "f").length ? this.decode(`
`) : [];
  }
};
ge = /* @__PURE__ */ new WeakMap(), _e = /* @__PURE__ */ new WeakMap();
Go.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Go.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function rh(e, t) {
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
function ah(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var Io = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, fr = (e, t, n) => {
  if (e) {
    if (Of(Io, e)) return e;
    oe(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Io))}`);
  }
};
function rn() {
}
function Un(e, t, n) {
  return !t || Io[e] > Io[n] ? rn : t[e].bind(t);
}
var lh = {
  error: rn,
  warn: rn,
  info: rn,
  debug: rn
}, hr = /* @__PURE__ */ new WeakMap();
function oe(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return lh;
  const o = hr.get(t);
  if (o && o[0] === n) return o[1];
  const i = {
    error: Un("error", t, n),
    warn: Un("warn", t, n),
    info: Un("info", t, n),
    debug: Un("debug", t, n)
  };
  return hr.set(t, [n, i]), i;
}
var rt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), Bt, In = class an {
  constructor(t, n, o) {
    this.iterator = t, Bt.set(this, void 0), this.controller = n, F(this, Bt, o, "f");
  }
  static fromSSEResponse(t, n, o, i) {
    let s = !1;
    const l = o ? oe(o) : console;
    async function* u() {
      if (s) throw new L("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      s = !0;
      let c = !1;
      try {
        for await (const d of uh(t, n))
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
                throw l.error("Could not parse message into JSON:", d.data), l.error("From chunk:", d.raw), f;
              }
              if (h && h.error) throw new re(void 0, h.error, void 0, t.headers);
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
              if (d.event == "error") throw new re(void 0, h.error, h.message, void 0);
              yield {
                event: d.event,
                data: h
              };
            }
          }
        c = !0;
      } catch (d) {
        if (wi(d)) return;
        throw d;
      } finally {
        c || n.abort();
      }
    }
    return new an(u, n, o);
  }
  static fromReadableStream(t, n, o) {
    let i = !1;
    async function* s() {
      const u = new Go(), c = pu(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
      for (const d of u.flush()) yield d;
    }
    async function* l() {
      if (i) throw new L("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let u = !1;
      try {
        for await (const c of s())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (wi(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new an(l, n, o);
  }
  [(Bt = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], o = this.iterator(), i = (s) => ({ next: () => {
      if (s.length === 0) {
        const l = o.next();
        t.push(l), n.push(l);
      }
      return s.shift();
    } });
    return [new an(() => i(t), this.controller, E(this, Bt, "f")), new an(() => i(n), this.controller, E(this, Bt, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return fu({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: i, done: s } = await n.next();
          if (s) return o.close();
          const l = gs(JSON.stringify(i) + `
`);
          o.enqueue(l);
        } catch (i) {
          o.error(i);
        }
      },
      async cancel() {
        await n.return?.();
      }
    });
  }
};
async function* uh(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new L("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new L("Attempted to iterate over a response with no body");
  const n = new dh(), o = new Go(), i = pu(e.body);
  for await (const s of ch(i)) for (const l of o.decode(s)) {
    const u = n.decode(l);
    u && (yield u);
  }
  for (const s of o.flush()) {
    const l = n.decode(s);
    l && (yield l);
  }
}
async function* ch(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? gs(n) : n;
    let i = new Uint8Array(t.length + o.length);
    i.set(t), i.set(o, t.length), t = i;
    let s;
    for (; (s = ah(t)) !== -1; )
      yield t.slice(0, s), t = t.slice(s);
  }
  t.length > 0 && (yield t);
}
var dh = class {
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
    let [t, n, o] = fh(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function fh(e, t) {
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
async function Eu(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: i, startTime: s } = t, l = await (async () => {
    if (t.options.stream)
      return oe(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : In.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Tu(await n.json(), n) : await n.text();
  })();
  return oe(e).debug(`[${o}] response parsed`, rt({
    retryOfRequestLogID: i,
    url: n.url,
    status: n.status,
    body: l,
    durationMs: Date.now() - s
  })), l;
}
function Tu(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var ln, Su = class wu extends Promise {
  constructor(t, n, o = Eu) {
    super((i) => {
      i(null);
    }), this.responsePromise = n, this.parseResponse = o, ln.set(this, void 0), F(this, ln, t, "f");
  }
  _thenUnwrap(t) {
    return new wu(E(this, ln, "f"), this.responsePromise, async (n, o) => Tu(t(await this.parseResponse(n, o), o), o.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(E(this, ln, "f"), t))), this.parsedPromise;
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
ln = /* @__PURE__ */ new WeakMap();
var $n, _s = class {
  constructor(e, t, n, o) {
    $n.set(this, void 0), F(this, $n, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new L("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await E(this, $n, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[($n = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, hh = class extends Su {
  constructor(e, t, n) {
    super(e, t, async (o, i) => new n(o, i.response, await Eu(o, i), i.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, Bo = class extends _s {
  constructor(e, t, n, o) {
    super(e, t, n, o), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, K = class extends _s {
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
        ...cu(this.options.query),
        after: t
      }
    } : null;
  }
}, Cn = class extends _s {
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
        ...cu(this.options.query),
        after: e
      }
    } : null;
  }
}, ph = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, mh = "urn:ietf:params:oauth:grant-type:token-exchange", gh = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? du();
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
        grant_type: mh,
        client_id: this.config.clientId,
        subject_token: e,
        subject_token_type: ph[this.config.provider.tokenType],
        identity_provider_id: this.config.identityProviderId,
        service_account_id: this.config.serviceAccountId
      })
    });
    if (!t.ok) {
      const s = await t.text();
      let l;
      try {
        l = JSON.parse(s);
      } catch {
      }
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new uu(t.status, l, t.headers) : re.generate(t.status, l, `Token exchange failed with status ${t.status}`, t.headers);
    }
    const n = await t.json(), o = n.expires_in || 3600, i = Date.now() + o * 1e3;
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
}, Iu = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function En(e, t, n) {
  return Iu(), new File(e, t ?? "unknown_file", n);
}
function uo(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var ys = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", qo = async (e, t) => Ri(e.body) ? {
  ...e,
  body: await Cu(e.body, t)
} : e, Ue = async (e, t) => ({
  ...e,
  body: await Cu(e.body, t)
}), pr = /* @__PURE__ */ new WeakMap();
function _h(e) {
  const t = typeof e == "function" ? e : e.fetch, n = pr.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const i = "Response" in t ? t.Response : (await t("data:,")).constructor, s = new FormData();
      return s.toString() !== await new i(s).text();
    } catch {
      return !0;
    }
  })();
  return pr.set(t, o), o;
}
var Cu = async (e, t) => {
  if (!await _h(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([o, i]) => bi(n, o, i))), n;
}, Au = (e) => e instanceof Blob && "name" in e, yh = (e) => typeof e == "object" && e !== null && (e instanceof Response || ys(e) || Au(e)), Ri = (e) => {
  if (yh(e)) return !0;
  if (Array.isArray(e)) return e.some(Ri);
  if (e && typeof e == "object") {
    for (const t in e) if (Ri(e[t])) return !0;
  }
  return !1;
}, bi = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, En([await n.blob()], uo(n)));
    else if (ys(n)) e.append(t, En([await new Response(hu(n)).blob()], uo(n)));
    else if (Au(n)) e.append(t, n, uo(n));
    else if (Array.isArray(n)) await Promise.all(n.map((o) => bi(e, t + "[]", o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([o, i]) => bi(e, `${t}[${o}]`, i)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, Ru = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", vh = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Ru(e), Eh = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function Th(e, t, n) {
  if (Iu(), e = await e, vh(e))
    return e instanceof File ? e : En([await e.arrayBuffer()], e.name);
  if (Eh(e)) {
    const i = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), En(await Pi(i), t, n);
  }
  const o = await Pi(e);
  if (t || (t = uo(e)), !n?.type) {
    const i = o.find((s) => typeof s == "object" && "type" in s && s.type);
    typeof i == "string" && (n = {
      ...n,
      type: i
    });
  }
  return En(o, t, n);
}
async function Pi(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (Ru(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (ys(e)) for await (const n of e) t.push(...await Pi(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${Sh(e)}`);
  }
  return t;
}
function Sh(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var D = class {
  constructor(e) {
    this._client = e;
  }
};
function bu(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var mr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), wh = (e = bu) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let i = !1;
  const s = [], l = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (i = !0);
    const m = o[p];
    let g = (i ? encodeURIComponent : e)("" + m);
    return p !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? mr) ?? mr)?.toString) && (g = m + "", s.push({
      start: h.length + f.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === o.length ? "" : g);
  }, ""), u = l.split(/[?#]/, 1)[0], c = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) s.push({
    start: d.index,
    length: d[0].length,
    error: `Value "${d[0]}" can't be safely passed as a path parameter`
  });
  if (s.sort((h, f) => h.start - f.start), s.length > 0) {
    let h = 0;
    const f = s.reduce((p, m) => {
      const g = " ".repeat(m.start - h), _ = "^".repeat(m.length);
      return h = m.start + m.length, p + g + _;
    }, "");
    throw new L(`Path parameters result in path with invalid segments:
${s.map((p) => p.error).join(`
`)}
${l}
${f}`);
  }
  return l;
}, w = /* @__PURE__ */ wh(bu), Pu = class extends D {
  list(e, t = {}, n) {
    return this._client.getAPIList(w`/chat/completions/${e}/messages`, K, {
      query: t,
      ...n
    });
  }
};
function Co(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function vs(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function Pn(e) {
  return e?.$brand === "auto-parseable-tool";
}
function Ih(e, t) {
  return !t || !xu(t) ? {
    ...e,
    choices: e.choices.map((n) => (Mu(n.message.tool_calls), {
      ...n,
      message: {
        ...n.message,
        parsed: null,
        ...n.message.tool_calls ? { tool_calls: n.message.tool_calls } : void 0
      }
    }))
  } : Es(e, t);
}
function Es(e, t) {
  const n = e.choices.map((o) => {
    if (o.finish_reason === "length") throw new au();
    if (o.finish_reason === "content_filter") throw new lu();
    return Mu(o.message.tool_calls), {
      ...o,
      message: {
        ...o.message,
        ...o.message.tool_calls ? { tool_calls: o.message.tool_calls?.map((i) => Ah(t, i)) ?? void 0 } : void 0,
        parsed: o.message.content && !o.message.refusal ? Ch(t, o.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function Ch(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function Ah(e, t) {
  const n = e.tools?.find((o) => Co(o) && o.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: Pn(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function Rh(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((o) => Co(o) && o.function?.name === t.function.name);
  return Co(n) && (Pn(n) || n?.function.strict || !1);
}
function xu(e) {
  return vs(e.response_format) ? !0 : e.tools?.some((t) => Pn(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function Mu(e) {
  for (const t of e || []) if (t.type !== "function") throw new L(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function bh(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new L(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new L(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var Ao = (e) => e?.role === "assistant", Nu = (e) => e?.role === "tool", xi, co, fo, un, cn, ho, dn, He, fn, Ro, bo, St, ku, Ts = class {
  constructor() {
    xi.add(this), this.controller = new AbortController(), co.set(this, void 0), fo.set(this, () => {
    }), un.set(this, () => {
    }), cn.set(this, void 0), ho.set(this, () => {
    }), dn.set(this, () => {
    }), He.set(this, {}), fn.set(this, !1), Ro.set(this, !1), bo.set(this, !1), St.set(this, !1), F(this, co, new Promise((e, t) => {
      F(this, fo, e, "f"), F(this, un, t, "f");
    }), "f"), F(this, cn, new Promise((e, t) => {
      F(this, ho, e, "f"), F(this, dn, t, "f");
    }), "f"), E(this, co, "f").catch(() => {
    }), E(this, cn, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, E(this, xi, "m", ku).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (E(this, fo, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return E(this, fn, "f");
  }
  get errored() {
    return E(this, Ro, "f");
  }
  get aborted() {
    return E(this, bo, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(e, t) {
    return (E(this, He, "f")[e] || (E(this, He, "f")[e] = [])).push({ listener: t }), this;
  }
  off(e, t) {
    const n = E(this, He, "f")[e];
    if (!n) return this;
    const o = n.findIndex((i) => i.listener === t);
    return o >= 0 && n.splice(o, 1), this;
  }
  once(e, t) {
    return (E(this, He, "f")[e] || (E(this, He, "f")[e] = [])).push({
      listener: t,
      once: !0
    }), this;
  }
  emitted(e) {
    return new Promise((t, n) => {
      F(this, St, !0, "f"), e !== "error" && this.once("error", n), this.once(e, t);
    });
  }
  async done() {
    F(this, St, !0, "f"), await E(this, cn, "f");
  }
  _emit(e, ...t) {
    if (E(this, fn, "f")) return;
    e === "end" && (F(this, fn, !0, "f"), E(this, ho, "f").call(this));
    const n = E(this, He, "f")[e];
    if (n && (E(this, He, "f")[e] = n.filter((o) => !o.once), n.forEach(({ listener: o }) => o(...t))), e === "abort") {
      const o = t[0];
      !E(this, St, "f") && !n?.length && Promise.reject(o), E(this, un, "f").call(this, o), E(this, dn, "f").call(this, o), this._emit("end");
      return;
    }
    if (e === "error") {
      const o = t[0];
      !E(this, St, "f") && !n?.length && Promise.reject(o), E(this, un, "f").call(this, o), E(this, dn, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
co = /* @__PURE__ */ new WeakMap(), fo = /* @__PURE__ */ new WeakMap(), un = /* @__PURE__ */ new WeakMap(), cn = /* @__PURE__ */ new WeakMap(), ho = /* @__PURE__ */ new WeakMap(), dn = /* @__PURE__ */ new WeakMap(), He = /* @__PURE__ */ new WeakMap(), fn = /* @__PURE__ */ new WeakMap(), Ro = /* @__PURE__ */ new WeakMap(), bo = /* @__PURE__ */ new WeakMap(), St = /* @__PURE__ */ new WeakMap(), xi = /* @__PURE__ */ new WeakSet(), ku = function(t) {
  if (F(this, Ro, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new Ie()), t instanceof Ie)
    return F(this, bo, !0, "f"), this._emit("abort", t);
  if (t instanceof L) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new L(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new L(String(t)));
};
function Ph(e) {
  return typeof e.parse == "function";
}
var le, Mi, Po, Ni, ki, Di, Du, Lu, xh = 10, Uu = class extends Ts {
  constructor() {
    super(...arguments), le.add(this), this._chatCompletions = [], this.messages = [];
  }
  _addChatCompletion(e) {
    this._chatCompletions.push(e), this._emit("chatCompletion", e);
    const t = e.choices[0]?.message;
    return t && this._addMessage(t), e;
  }
  _addMessage(e, t = !0) {
    if ("content" in e || (e.content = null), this.messages.push(e), t) {
      if (this._emit("message", e), Nu(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (Ao(e) && e.tool_calls)
        for (const n of e.tool_calls) n.type === "function" && this._emit("functionToolCall", n.function);
    }
  }
  async finalChatCompletion() {
    await this.done();
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    if (!e) throw new L("stream ended without producing a ChatCompletion");
    return e;
  }
  async finalContent() {
    return await this.done(), E(this, le, "m", Mi).call(this);
  }
  async finalMessage() {
    return await this.done(), E(this, le, "m", Po).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), E(this, le, "m", Ni).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), E(this, le, "m", ki).call(this);
  }
  async totalUsage() {
    return await this.done(), E(this, le, "m", Di).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = E(this, le, "m", Po).call(this);
    t && this._emit("finalMessage", t);
    const n = E(this, le, "m", Mi).call(this);
    n && this._emit("finalContent", n);
    const o = E(this, le, "m", Ni).call(this);
    o && this._emit("finalFunctionToolCall", o);
    const i = E(this, le, "m", ki).call(this);
    i != null && this._emit("finalFunctionToolCallResult", i), this._chatCompletions.some((s) => s.usage) && this._emit("totalUsage", E(this, le, "m", Di).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), E(this, le, "m", Du).call(this, t);
    const i = await e.chat.completions.create({
      ...t,
      stream: !1
    }, {
      ...n,
      signal: this.controller.signal
    });
    return this._connected(), this._addChatCompletion(Es(i, t));
  }
  async _runChatCompletion(e, t, n) {
    for (const o of t.messages) this._addMessage(o, !1);
    return await this._createChatCompletion(e, t, n);
  }
  async _runTools(e, t, n) {
    const o = "tool", { tool_choice: i = "auto", stream: s, ...l } = t, u = typeof i != "string" && i.type === "function" && i?.function?.name, { maxChatCompletions: c = xh } = n || {}, d = t.tools.map((p) => {
      if (Pn(p)) {
        if (!p.$callback) throw new L("Tool given to `.runTools()` that does not have an associated function");
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
        ...l,
        tool_choice: i,
        tools: f,
        messages: [...this.messages]
      }, n)).choices[0]?.message;
      if (!m) throw new L("missing message in ChatCompletion response");
      if (!m.tool_calls?.length) return;
      for (const g of m.tool_calls) {
        if (g.type !== "function") continue;
        const _ = g.id, { name: y, arguments: I } = g.function, S = h[y];
        if (S) {
          if (u && u !== y) {
            const T = `Invalid tool_call: ${JSON.stringify(y)}. ${JSON.stringify(u)} requested. Please try again`;
            this._addMessage({
              role: o,
              tool_call_id: _,
              content: T
            });
            continue;
          }
        } else {
          const T = `Invalid tool_call: ${JSON.stringify(y)}. Available options are: ${Object.keys(h).map((U) => JSON.stringify(U)).join(", ")}. Please try again`;
          this._addMessage({
            role: o,
            tool_call_id: _,
            content: T
          });
          continue;
        }
        let A;
        try {
          A = Ph(S) ? await S.parse(I) : I;
        } catch (T) {
          const U = T instanceof Error ? T.message : String(T);
          this._addMessage({
            role: o,
            tool_call_id: _,
            content: U
          });
          continue;
        }
        const R = await S.function(A, this), $ = E(this, le, "m", Lu).call(this, R);
        if (this._addMessage({
          role: o,
          tool_call_id: _,
          content: $
        }), u) return;
      }
    }
  }
};
le = /* @__PURE__ */ new WeakSet(), Mi = function() {
  return E(this, le, "m", Po).call(this).content ?? null;
}, Po = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (Ao(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new L("stream ended without producing a ChatCompletionMessage with role=assistant");
}, Ni = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (Ao(n) && n?.tool_calls?.length) return n.tool_calls.filter((o) => o.type === "function").at(-1)?.function;
  }
}, ki = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (Nu(n) && n.content != null && typeof n.content == "string" && this.messages.some((o) => o.role === "assistant" && o.tool_calls?.some((i) => i.type === "function" && i.id === n.tool_call_id))) return n.content;
  }
}, Di = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, Du = function(t) {
  if (t.n != null && t.n > 1) throw new L("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, Lu = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var Mh = class $u extends Uu {
  static runTools(t, n, o) {
    const i = new $u(), s = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return i._run(() => i._runTools(t, n, s)), i;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), Ao(t) && t.content && this._emit("content", t.content);
  }
}, Nh = 1, Fu = 2, Gu = 4, Bu = 8, kh = 16, Dh = 32, Lh = 64, qu = 128, Vu = 256, Uh = qu | Vu, $h = 496, gr = Fu | 497, _r = Gu | Bu, te = {
  STR: Nh,
  NUM: Fu,
  ARR: Gu,
  OBJ: Bu,
  NULL: kh,
  BOOL: Dh,
  NAN: Lh,
  INFINITY: qu,
  MINUS_INFINITY: Vu,
  INF: Uh,
  SPECIAL: $h,
  ATOM: gr,
  COLLECTION: _r,
  ALL: gr | _r
}, Fh = class extends Error {
}, Gh = class extends Error {
};
function Bh(e, t = te.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return qh(e.trim(), t);
}
var qh = (e, t) => {
  const n = e.length;
  let o = 0;
  const i = (p) => {
    throw new Fh(`${p} at position ${o}`);
  }, s = (p) => {
    throw new Gh(`${p} at position ${o}`);
  }, l = () => (f(), o >= n && i("Unexpected end of input"), e[o] === '"' ? u() : e[o] === "{" ? c() : e[o] === "[" ? d() : e.substring(o, o + 4) === "null" || te.NULL & t && n - o < 4 && "null".startsWith(e.substring(o)) ? (o += 4, null) : e.substring(o, o + 4) === "true" || te.BOOL & t && n - o < 4 && "true".startsWith(e.substring(o)) ? (o += 4, !0) : e.substring(o, o + 5) === "false" || te.BOOL & t && n - o < 5 && "false".startsWith(e.substring(o)) ? (o += 5, !1) : e.substring(o, o + 8) === "Infinity" || te.INFINITY & t && n - o < 8 && "Infinity".startsWith(e.substring(o)) ? (o += 8, 1 / 0) : e.substring(o, o + 9) === "-Infinity" || te.MINUS_INFINITY & t && 1 < n - o && n - o < 9 && "-Infinity".startsWith(e.substring(o)) ? (o += 9, -1 / 0) : e.substring(o, o + 3) === "NaN" || te.NAN & t && n - o < 3 && "NaN".startsWith(e.substring(o)) ? (o += 3, NaN) : h()), u = () => {
    const p = o;
    let m = !1;
    for (o++; o < n && (e[o] !== '"' || m && e[o - 1] === "\\"); )
      m = e[o] === "\\" ? !m : !1, o++;
    if (e.charAt(o) == '"') try {
      return JSON.parse(e.substring(p, ++o - Number(m)));
    } catch (g) {
      s(String(g));
    }
    else if (te.STR & t) try {
      return JSON.parse(e.substring(p, o - Number(m)) + '"');
    } catch {
      return JSON.parse(e.substring(p, e.lastIndexOf("\\")) + '"');
    }
    i("Unterminated string literal");
  }, c = () => {
    o++, f();
    const p = {};
    try {
      for (; e[o] !== "}"; ) {
        if (f(), o >= n && te.OBJ & t) return p;
        const m = u();
        f(), o++;
        try {
          const g = l();
          Object.defineProperty(p, m, {
            value: g,
            writable: !0,
            enumerable: !0,
            configurable: !0
          });
        } catch (g) {
          if (te.OBJ & t) return p;
          throw g;
        }
        f(), e[o] === "," && o++;
      }
    } catch {
      if (te.OBJ & t) return p;
      i("Expected '}' at end of object");
    }
    return o++, p;
  }, d = () => {
    o++;
    const p = [];
    try {
      for (; e[o] !== "]"; )
        p.push(l()), f(), e[o] === "," && o++;
    } catch {
      if (te.ARR & t) return p;
      i("Expected ']' at end of array");
    }
    return o++, p;
  }, h = () => {
    if (o === 0) {
      e === "-" && te.NUM & t && i("Not sure what '-' is");
      try {
        return JSON.parse(e);
      } catch (m) {
        if (te.NUM & t) try {
          return e[e.length - 1] === "." ? JSON.parse(e.substring(0, e.lastIndexOf("."))) : JSON.parse(e.substring(0, e.lastIndexOf("e")));
        } catch {
        }
        s(String(m));
      }
    }
    const p = o;
    for (e[o] === "-" && o++; e[o] && !",]}".includes(e[o]); ) o++;
    o == n && !(te.NUM & t) && i("Unterminated number literal");
    try {
      return JSON.parse(e.substring(p, o));
    } catch {
      e.substring(p, o) === "-" && te.NUM & t && i("Not sure what '-' is");
      try {
        return JSON.parse(e.substring(p, e.lastIndexOf("e")));
      } catch (g) {
        s(String(g));
      }
    }
  }, f = () => {
    for (; o < n && ` 
\r	`.includes(e[o]); ) o++;
  };
  return l();
}, yr = (e) => Bh(e, te.ALL ^ te.NUM), X, Be, mt, Ye, si, Fn, ri, ai, li, Gn, ui, vr, Hu = class Li extends Uu {
  constructor(t) {
    super(), X.add(this), Be.set(this, void 0), mt.set(this, void 0), Ye.set(this, void 0), F(this, Be, t, "f"), F(this, mt, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return E(this, Ye, "f");
  }
  static fromReadableStream(t) {
    const n = new Li(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createChatCompletion(t, n, o) {
    const i = new Li(n);
    return i._run(() => i._runChatCompletion(t, {
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
  async _createChatCompletion(t, n, o) {
    super._createChatCompletion;
    const i = o?.signal;
    i && (i.aborted && this.controller.abort(), i.addEventListener("abort", () => this.controller.abort())), E(this, X, "m", si).call(this);
    const s = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const l of s) E(this, X, "m", ri).call(this, l);
    if (s.controller.signal?.aborted) throw new Ie();
    return this._addChatCompletion(E(this, X, "m", Gn).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), E(this, X, "m", si).call(this), this._connected();
    const i = In.fromReadableStream(t, this.controller);
    let s;
    for await (const l of i)
      s && s !== l.id && this._addChatCompletion(E(this, X, "m", Gn).call(this)), E(this, X, "m", ri).call(this, l), s = l.id;
    if (i.controller.signal?.aborted) throw new Ie();
    return this._addChatCompletion(E(this, X, "m", Gn).call(this));
  }
  [(Be = /* @__PURE__ */ new WeakMap(), mt = /* @__PURE__ */ new WeakMap(), Ye = /* @__PURE__ */ new WeakMap(), X = /* @__PURE__ */ new WeakSet(), si = function() {
    this.ended || F(this, Ye, void 0, "f");
  }, Fn = function(n) {
    let o = E(this, mt, "f")[n.index];
    return o || (o = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, E(this, mt, "f")[n.index] = o, o);
  }, ri = function(n) {
    if (this.ended) return;
    const o = E(this, X, "m", vr).call(this, n);
    this._emit("chunk", n, o);
    for (const i of n.choices) {
      const s = o.choices[i.index];
      i.delta.content != null && s.message?.role === "assistant" && s.message?.content && (this._emit("content", i.delta.content, s.message.content), this._emit("content.delta", {
        delta: i.delta.content,
        snapshot: s.message.content,
        parsed: s.message.parsed
      })), i.delta.refusal != null && s.message?.role === "assistant" && s.message?.refusal && this._emit("refusal.delta", {
        delta: i.delta.refusal,
        snapshot: s.message.refusal
      }), i.logprobs?.content != null && s.message?.role === "assistant" && this._emit("logprobs.content.delta", {
        content: i.logprobs?.content,
        snapshot: s.logprobs?.content ?? []
      }), i.logprobs?.refusal != null && s.message?.role === "assistant" && this._emit("logprobs.refusal.delta", {
        refusal: i.logprobs?.refusal,
        snapshot: s.logprobs?.refusal ?? []
      });
      const l = E(this, X, "m", Fn).call(this, s);
      s.finish_reason && (E(this, X, "m", li).call(this, s), l.current_tool_call_index != null && E(this, X, "m", ai).call(this, s, l.current_tool_call_index));
      for (const u of i.delta.tool_calls ?? [])
        l.current_tool_call_index !== u.index && (E(this, X, "m", li).call(this, s), l.current_tool_call_index != null && E(this, X, "m", ai).call(this, s, l.current_tool_call_index)), l.current_tool_call_index = u.index;
      for (const u of i.delta.tool_calls ?? []) {
        const c = s.message.tool_calls?.[u.index];
        c?.type && (c?.type === "function" ? this._emit("tool_calls.function.arguments.delta", {
          name: c.function?.name,
          index: u.index,
          arguments: c.function.arguments,
          parsed_arguments: c.function.parsed_arguments,
          arguments_delta: u.function?.arguments ?? ""
        }) : (c?.type, void 0));
      }
    }
  }, ai = function(n, o) {
    if (E(this, X, "m", Fn).call(this, n).done_tool_calls.has(o)) return;
    const i = n.message.tool_calls?.[o];
    if (!i) throw new Error("no tool call snapshot");
    if (!i.type) throw new Error("tool call snapshot missing `type`");
    if (i.type === "function") {
      const s = E(this, Be, "f")?.tools?.find((l) => Co(l) && l.function.name === i.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: i.function.name,
        index: o,
        arguments: i.function.arguments,
        parsed_arguments: Pn(s) ? s.$parseRaw(i.function.arguments) : s?.function.strict ? JSON.parse(i.function.arguments) : null
      });
    } else i.type;
  }, li = function(n) {
    const o = E(this, X, "m", Fn).call(this, n);
    if (n.message.content && !o.content_done) {
      o.content_done = !0;
      const i = E(this, X, "m", ui).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: i ? i.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !o.refusal_done && (o.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !o.logprobs_content_done && (o.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !o.logprobs_refusal_done && (o.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, Gn = function() {
    if (this.ended) throw new L("stream has ended, this shouldn't happen");
    const n = E(this, Ye, "f");
    if (!n) throw new L("request ended without sending any chunks");
    return F(this, Ye, void 0, "f"), F(this, mt, [], "f"), Vh(n, E(this, Be, "f"));
  }, ui = function() {
    const n = E(this, Be, "f")?.response_format;
    return vs(n) ? n : null;
  }, vr = function(n) {
    var o, i, s, l;
    let u = E(this, Ye, "f");
    const { choices: c, ...d } = n;
    u ? Object.assign(u, d) : u = F(this, Ye, {
      ...d,
      choices: []
    }, "f");
    for (const { delta: h, finish_reason: f, index: p, logprobs: m = null, ...g } of n.choices) {
      let _ = u.choices[p];
      if (_ || (_ = u.choices[p] = {
        finish_reason: f,
        index: p,
        message: {},
        logprobs: m,
        ...g
      }), m) if (!_.logprobs) _.logprobs = Object.assign({}, m);
      else {
        const { content: T, refusal: U, ...C } = m;
        Object.assign(_.logprobs, C), T && ((o = _.logprobs).content ?? (o.content = []), _.logprobs.content.push(...T)), U && ((i = _.logprobs).refusal ?? (i.refusal = []), _.logprobs.refusal.push(...U));
      }
      if (f && (_.finish_reason = f, E(this, Be, "f") && xu(E(this, Be, "f")))) {
        if (f === "length") throw new au();
        if (f === "content_filter") throw new lu();
      }
      if (Object.assign(_, g), !h) continue;
      const { content: y, refusal: I, function_call: S, role: A, tool_calls: R, ...$ } = h;
      if (Object.assign(_.message, $), I && (_.message.refusal = (_.message.refusal || "") + I), A && (_.message.role = A), S && (_.message.function_call ? (S.name && (_.message.function_call.name = S.name), S.arguments && ((s = _.message.function_call).arguments ?? (s.arguments = ""), _.message.function_call.arguments += S.arguments)) : _.message.function_call = S), y && (_.message.content = (_.message.content || "") + y, !_.message.refusal && E(this, X, "m", ui).call(this) && (_.message.parsed = yr(_.message.content))), R) {
        _.message.tool_calls || (_.message.tool_calls = []);
        for (const { index: T, id: U, type: C, function: k, ...V } of R) {
          const J = (l = _.message.tool_calls)[T] ?? (l[T] = {});
          Object.assign(J, V), U && (J.id = U), C && (J.type = C), k && (J.function ?? (J.function = {
            name: k.name ?? "",
            arguments: ""
          })), k?.name && (J.function.name = k.name), k?.arguments && (J.function.arguments += k.arguments, Rh(E(this, Be, "f"), J) && (J.function.parsed_arguments = yr(J.function.arguments)));
        }
      }
    }
    return u;
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let o = !1;
    return this.on("chunk", (i) => {
      const s = n.shift();
      s ? s.resolve(i) : t.push(i);
    }), this.on("end", () => {
      o = !0;
      for (const i of n) i.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (i) => {
      o = !0;
      for (const s of n) s.reject(i);
      n.length = 0;
    }), this.on("error", (i) => {
      o = !0;
      for (const s of n) s.reject(i);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : o ? {
        value: void 0,
        done: !0
      } : new Promise((i, s) => n.push({
        resolve: i,
        reject: s
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
    return new In(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
function Vh(e, t) {
  const { id: n, choices: o, created: i, model: s, system_fingerprint: l, ...u } = e;
  return Ih({
    ...u,
    id: n,
    choices: o.map(({ message: c, finish_reason: d, index: h, logprobs: f, ...p }) => {
      if (!d) throw new L(`missing finish_reason for choice ${h}`);
      const { content: m = null, function_call: g, tool_calls: _, ...y } = c, I = c.role;
      if (!I) throw new L(`missing role for choice ${h}`);
      if (g) {
        const { arguments: S, name: A } = g;
        if (S == null) throw new L(`missing function_call.arguments for choice ${h}`);
        if (!A) throw new L(`missing function_call.name for choice ${h}`);
        return {
          ...p,
          message: {
            content: m,
            function_call: {
              arguments: S,
              name: A
            },
            role: I,
            refusal: c.refusal ?? null
          },
          finish_reason: d,
          index: h,
          logprobs: f
        };
      }
      return _ ? {
        ...p,
        index: h,
        finish_reason: d,
        logprobs: f,
        message: {
          ...y,
          role: I,
          content: m,
          refusal: c.refusal ?? null,
          tool_calls: _.map((S, A) => {
            const { function: R, type: $, id: T, ...U } = S, { arguments: C, name: k, ...V } = R || {};
            if (T == null) throw new L(`missing choices[${h}].tool_calls[${A}].id
${Bn(e)}`);
            if ($ == null) throw new L(`missing choices[${h}].tool_calls[${A}].type
${Bn(e)}`);
            if (k == null) throw new L(`missing choices[${h}].tool_calls[${A}].function.name
${Bn(e)}`);
            if (C == null) throw new L(`missing choices[${h}].tool_calls[${A}].function.arguments
${Bn(e)}`);
            return {
              ...U,
              id: T,
              type: $,
              function: {
                ...V,
                name: k,
                arguments: C
              }
            };
          })
        }
      } : {
        ...p,
        message: {
          ...y,
          content: m,
          role: I,
          refusal: c.refusal ?? null
        },
        finish_reason: d,
        index: h,
        logprobs: f
      };
    }),
    created: i,
    model: s,
    object: "chat.completion",
    ...l ? { system_fingerprint: l } : {}
  }, t);
}
function Bn(e) {
  return JSON.stringify(e);
}
var Hh = class Ui extends Hu {
  static fromReadableStream(t) {
    const n = new Ui(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static runTools(t, n, o) {
    const i = new Ui(n), s = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return i._run(() => i._runTools(t, n, s)), i;
  }
}, Ss = class extends D {
  constructor() {
    super(...arguments), this.messages = new Pu(this._client);
  }
  create(e, t) {
    return this._client.post("/chat/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    });
  }
  retrieve(e, t) {
    return this._client.get(w`/chat/completions/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(w`/chat/completions/${e}`, {
      body: t,
      ...n
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chat/completions", K, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(w`/chat/completions/${e}`, t);
  }
  parse(e, t) {
    return bh(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => Es(n, e));
  }
  runTools(e, t) {
    return e.stream ? Hh.runTools(this._client, e, t) : Mh.runTools(this._client, e, t);
  }
  stream(e, t) {
    return Hu.createChatCompletion(this._client, e, t);
  }
};
Ss.Messages = Pu;
var ws = class extends D {
  constructor() {
    super(...arguments), this.completions = new Ss(this._client);
  }
};
ws.Completions = Ss;
var Ou = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* Oh(e) {
  if (!e) return;
  if (Ou in e) {
    const { values: o, nulls: i } = e;
    yield* o.entries();
    for (const s of i) yield [s, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : er(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const i = o[0];
    if (typeof i != "string") throw new TypeError("expected header name to be a string");
    const s = er(o[1]) ? o[1] : [o[1]];
    let l = !1;
    for (const u of s)
      u !== void 0 && (t && !l && (l = !0, yield [i, null]), yield [i, u]);
  }
}
var M = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const i = /* @__PURE__ */ new Set();
    for (const [s, l] of Oh(o)) {
      const u = s.toLowerCase();
      i.has(u) || (t.delete(s), i.add(u)), l === null ? (t.delete(s), n.add(u)) : (t.append(s, l), n.delete(u));
    }
  }
  return {
    [Ou]: !0,
    values: t,
    nulls: n
  };
}, Ju = class extends D {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: M([{ Accept: "application/octet-stream" }, t?.headers]),
      __binaryResponse: !0
    });
  }
}, Wu = class extends D {
  create(e, t) {
    return this._client.post("/audio/transcriptions", Ue({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model }
    }, this._client));
  }
}, Ku = class extends D {
  create(e, t) {
    return this._client.post("/audio/translations", Ue({
      body: e,
      ...t,
      __metadata: { model: e.model }
    }, this._client));
  }
}, xn = class extends D {
  constructor() {
    super(...arguments), this.transcriptions = new Wu(this._client), this.translations = new Ku(this._client), this.speech = new Ju(this._client);
  }
};
xn.Transcriptions = Wu;
xn.Translations = Ku;
xn.Speech = Ju;
var Yu = class extends D {
  create(e, t) {
    return this._client.post("/batches", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(w`/batches/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/batches", K, {
      query: e,
      ...t
    });
  }
  cancel(e, t) {
    return this._client.post(w`/batches/${e}/cancel`, t);
  }
}, zu = class extends D {
  create(e, t) {
    return this._client.post("/assistants", {
      body: e,
      ...t,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  retrieve(e, t) {
    return this._client.get(w`/assistants/${e}`, {
      ...t,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  update(e, t, n) {
    return this._client.post(w`/assistants/${e}`, {
      body: t,
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/assistants", K, {
      query: e,
      ...t,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(w`/assistants/${e}`, {
      ...t,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, Xu = class extends D {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, Qu = class extends D {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, Vo = class extends D {
  constructor() {
    super(...arguments), this.sessions = new Xu(this._client), this.transcriptionSessions = new Qu(this._client);
  }
};
Vo.Sessions = Xu;
Vo.TranscriptionSessions = Qu;
var Zu = class extends D {
  create(e, t) {
    return this._client.post("/chatkit/sessions", {
      body: e,
      ...t,
      headers: M([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  cancel(e, t) {
    return this._client.post(w`/chatkit/sessions/${e}/cancel`, {
      ...t,
      headers: M([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
}, ju = class extends D {
  retrieve(e, t) {
    return this._client.get(w`/chatkit/threads/${e}`, {
      ...t,
      headers: M([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chatkit/threads", Cn, {
      query: e,
      ...t,
      headers: M([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(w`/chatkit/threads/${e}`, {
      ...t,
      headers: M([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  listItems(e, t = {}, n) {
    return this._client.getAPIList(w`/chatkit/threads/${e}/items`, Cn, {
      query: t,
      ...n,
      headers: M([{ "OpenAI-Beta": "chatkit_beta=v1" }, n?.headers])
    });
  }
}, Ho = class extends D {
  constructor() {
    super(...arguments), this.sessions = new Zu(this._client), this.threads = new ju(this._client);
  }
};
Ho.Sessions = Zu;
Ho.Threads = ju;
var ec = class extends D {
  create(e, t, n) {
    return this._client.post(w`/threads/${e}/messages`, {
      body: t,
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { thread_id: o } = t;
    return this._client.get(w`/threads/${o}/messages/${e}`, {
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  update(e, t, n) {
    const { thread_id: o, ...i } = t;
    return this._client.post(w`/threads/${o}/messages/${e}`, {
      body: i,
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(w`/threads/${e}/messages`, K, {
      query: t,
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { thread_id: o } = t;
    return this._client.delete(w`/threads/${o}/messages/${e}`, {
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, tc = class extends D {
  retrieve(e, t, n) {
    const { thread_id: o, run_id: i, ...s } = t;
    return this._client.get(w`/threads/${o}/runs/${i}/steps/${e}`, {
      query: s,
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t, n) {
    const { thread_id: o, ...i } = t;
    return this._client.getAPIList(w`/threads/${o}/runs/${e}/steps`, K, {
      query: i,
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, Jh = (e) => {
  if (typeof Buffer < "u") {
    const t = Buffer.from(e, "base64");
    return Array.from(new Float32Array(t.buffer, t.byteOffset, t.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const t = atob(e), n = t.length, o = new Uint8Array(n);
    for (let i = 0; i < n; i++) o[i] = t.charCodeAt(i);
    return Array.from(new Float32Array(o.buffer));
  }
}, gt = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() ?? void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim();
}, ie, ct, $i, Le, po, be, dt, Rt, ut, xo, Ee, mo, go, Tn, hn, pn, Er, Tr, Sr, wr, Ir, Cr, Ar, Sn = class extends Ts {
  constructor() {
    super(...arguments), ie.add(this), $i.set(this, []), Le.set(this, {}), po.set(this, {}), be.set(this, void 0), dt.set(this, void 0), Rt.set(this, void 0), ut.set(this, void 0), xo.set(this, void 0), Ee.set(this, void 0), mo.set(this, void 0), go.set(this, void 0), Tn.set(this, void 0);
  }
  [($i = /* @__PURE__ */ new WeakMap(), Le = /* @__PURE__ */ new WeakMap(), po = /* @__PURE__ */ new WeakMap(), be = /* @__PURE__ */ new WeakMap(), dt = /* @__PURE__ */ new WeakMap(), Rt = /* @__PURE__ */ new WeakMap(), ut = /* @__PURE__ */ new WeakMap(), xo = /* @__PURE__ */ new WeakMap(), Ee = /* @__PURE__ */ new WeakMap(), mo = /* @__PURE__ */ new WeakMap(), go = /* @__PURE__ */ new WeakMap(), Tn = /* @__PURE__ */ new WeakMap(), ie = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
    const e = [], t = [];
    let n = !1;
    return this.on("event", (o) => {
      const i = t.shift();
      i ? i.resolve(o) : e.push(o);
    }), this.on("end", () => {
      n = !0;
      for (const o of t) o.resolve(void 0);
      t.length = 0;
    }), this.on("abort", (o) => {
      n = !0;
      for (const i of t) i.reject(o);
      t.length = 0;
    }), this.on("error", (o) => {
      n = !0;
      for (const i of t) i.reject(o);
      t.length = 0;
    }), {
      next: async () => e.length ? {
        value: e.shift(),
        done: !1
      } : n ? {
        value: void 0,
        done: !0
      } : new Promise((o, i) => t.push({
        resolve: o,
        reject: i
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
    const t = new ct();
    return t._run(() => t._fromReadableStream(e)), t;
  }
  async _fromReadableStream(e, t) {
    const n = t?.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const o = In.fromReadableStream(e, this.controller);
    for await (const i of o) E(this, ie, "m", hn).call(this, i);
    if (o.controller.signal?.aborted) throw new Ie();
    return this._addRun(E(this, ie, "m", pn).call(this));
  }
  toReadableStream() {
    return new In(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, t, n, o) {
    const i = new ct();
    return i._run(() => i._runToolAssistantStream(e, t, n, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), i;
  }
  async _createToolAssistantStream(e, t, n, o) {
    const i = o?.signal;
    i && (i.aborted && this.controller.abort(), i.addEventListener("abort", () => this.controller.abort()));
    const s = {
      ...n,
      stream: !0
    }, l = await e.submitToolOutputs(t, s, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const u of l) E(this, ie, "m", hn).call(this, u);
    if (l.controller.signal?.aborted) throw new Ie();
    return this._addRun(E(this, ie, "m", pn).call(this));
  }
  static createThreadAssistantStream(e, t, n) {
    const o = new ct();
    return o._run(() => o._threadAssistantStream(e, t, {
      ...n,
      headers: {
        ...n?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  static createAssistantStream(e, t, n, o) {
    const i = new ct();
    return i._run(() => i._runAssistantStream(e, t, n, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), i;
  }
  currentEvent() {
    return E(this, mo, "f");
  }
  currentRun() {
    return E(this, go, "f");
  }
  currentMessageSnapshot() {
    return E(this, be, "f");
  }
  currentRunStepSnapshot() {
    return E(this, Tn, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(E(this, Le, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(E(this, po, "f"));
  }
  async finalRun() {
    if (await this.done(), !E(this, dt, "f")) throw Error("Final run was not received.");
    return E(this, dt, "f");
  }
  async _createThreadAssistantStream(e, t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort()));
    const i = {
      ...t,
      stream: !0
    }, s = await e.createAndRun(i, {
      ...n,
      signal: this.controller.signal
    });
    this._connected();
    for await (const l of s) E(this, ie, "m", hn).call(this, l);
    if (s.controller.signal?.aborted) throw new Ie();
    return this._addRun(E(this, ie, "m", pn).call(this));
  }
  async _createAssistantStream(e, t, n, o) {
    const i = o?.signal;
    i && (i.aborted && this.controller.abort(), i.addEventListener("abort", () => this.controller.abort()));
    const s = {
      ...n,
      stream: !0
    }, l = await e.create(t, s, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const u of l) E(this, ie, "m", hn).call(this, u);
    if (l.controller.signal?.aborted) throw new Ie();
    return this._addRun(E(this, ie, "m", pn).call(this));
  }
  static accumulateDelta(e, t) {
    for (const [n, o] of Object.entries(t)) {
      if (!e.hasOwnProperty(n)) {
        e[n] = o;
        continue;
      }
      let i = e[n];
      if (i == null) {
        e[n] = o;
        continue;
      }
      if (n === "index" || n === "type") {
        e[n] = o;
        continue;
      }
      if (typeof i == "string" && typeof o == "string") i += o;
      else if (typeof i == "number" && typeof o == "number") i += o;
      else if (ni(i) && ni(o)) i = this.accumulateDelta(i, o);
      else if (Array.isArray(i) && Array.isArray(o)) {
        if (i.every((s) => typeof s == "string" || typeof s == "number")) {
          i.push(...o);
          continue;
        }
        for (const s of o) {
          if (!ni(s)) throw new Error(`Expected array delta entry to be an object but got: ${s}`);
          const l = s.index;
          if (l == null)
            throw console.error(s), new Error("Expected array delta entry to have an `index` property");
          if (typeof l != "number") throw new Error(`Expected array delta entry \`index\` property to be a number but got ${l}`);
          const u = i[l];
          u == null ? i.push(s) : i[l] = this.accumulateDelta(u, s);
        }
        continue;
      } else throw Error(`Unhandled record type: ${n}, deltaValue: ${o}, accValue: ${i}`);
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
  async _runAssistantStream(e, t, n, o) {
    return await this._createAssistantStream(t, e, n, o);
  }
  async _runToolAssistantStream(e, t, n, o) {
    return await this._createToolAssistantStream(t, e, n, o);
  }
};
ct = Sn, hn = function(t) {
  if (!this.ended)
    switch (F(this, mo, t, "f"), E(this, ie, "m", Sr).call(this, t), t.event) {
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
        E(this, ie, "m", Ar).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        E(this, ie, "m", Tr).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        E(this, ie, "m", Er).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, pn = function() {
  if (this.ended) throw new L("stream has ended, this shouldn't happen");
  if (!E(this, dt, "f")) throw Error("Final run has not been received");
  return E(this, dt, "f");
}, Er = function(t) {
  const [n, o] = E(this, ie, "m", Ir).call(this, t, E(this, be, "f"));
  F(this, be, n, "f"), E(this, po, "f")[n.id] = n;
  for (const i of o) {
    const s = n.content[i.index];
    s?.type == "text" && this._emit("textCreated", s.text);
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
          let s = i.text, l = n.content[i.index];
          if (l && l.type == "text") this._emit("textDelta", s, l.text);
          else throw Error("The snapshot associated with this text delta is not text or missing");
        }
        if (i.index != E(this, Rt, "f")) {
          if (E(this, ut, "f")) switch (E(this, ut, "f").type) {
            case "text":
              this._emit("textDone", E(this, ut, "f").text, E(this, be, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", E(this, ut, "f").image_file, E(this, be, "f"));
              break;
          }
          F(this, Rt, i.index, "f");
        }
        F(this, ut, n.content[i.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (E(this, Rt, "f") !== void 0) {
        const i = t.data.content[E(this, Rt, "f")];
        if (i) switch (i.type) {
          case "image_file":
            this._emit("imageFileDone", i.image_file, E(this, be, "f"));
            break;
          case "text":
            this._emit("textDone", i.text, E(this, be, "f"));
            break;
        }
      }
      E(this, be, "f") && this._emit("messageDone", t.data), F(this, be, void 0, "f");
  }
}, Tr = function(t) {
  const n = E(this, ie, "m", wr).call(this, t);
  switch (F(this, Tn, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const o = t.data.delta;
      if (o.step_details && o.step_details.type == "tool_calls" && o.step_details.tool_calls && n.step_details.type == "tool_calls") for (const i of o.step_details.tool_calls) i.index == E(this, xo, "f") ? this._emit("toolCallDelta", i, n.step_details.tool_calls[i.index]) : (E(this, Ee, "f") && this._emit("toolCallDone", E(this, Ee, "f")), F(this, xo, i.index, "f"), F(this, Ee, n.step_details.tool_calls[i.index], "f"), E(this, Ee, "f") && this._emit("toolCallCreated", E(this, Ee, "f")));
      this._emit("runStepDelta", t.data.delta, n);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      F(this, Tn, void 0, "f"), t.data.step_details.type == "tool_calls" && E(this, Ee, "f") && (this._emit("toolCallDone", E(this, Ee, "f")), F(this, Ee, void 0, "f")), this._emit("runStepDone", t.data, n);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, Sr = function(t) {
  E(this, $i, "f").push(t), this._emit("event", t);
}, wr = function(t) {
  switch (t.event) {
    case "thread.run.step.created":
      return E(this, Le, "f")[t.data.id] = t.data, t.data;
    case "thread.run.step.delta":
      let n = E(this, Le, "f")[t.data.id];
      if (!n) throw Error("Received a RunStepDelta before creation of a snapshot");
      let o = t.data;
      if (o.delta) {
        const i = ct.accumulateDelta(n, o.delta);
        E(this, Le, "f")[t.data.id] = i;
      }
      return E(this, Le, "f")[t.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      E(this, Le, "f")[t.data.id] = t.data;
      break;
  }
  if (E(this, Le, "f")[t.data.id]) return E(this, Le, "f")[t.data.id];
  throw new Error("No snapshot available");
}, Ir = function(t, n) {
  let o = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, o];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let i = t.data;
      if (i.delta.content) for (const s of i.delta.content) if (s.index in n.content) {
        let l = n.content[s.index];
        n.content[s.index] = E(this, ie, "m", Cr).call(this, s, l);
      } else
        n.content[s.index] = s, o.push(s);
      return [n, o];
    case "thread.message.in_progress":
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (n) return [n, o];
      throw Error("Received thread message event with no existing snapshot");
  }
  throw Error("Tried to accumulate a non-message event");
}, Cr = function(t, n) {
  return ct.accumulateDelta(n, t);
}, Ar = function(t) {
  switch (F(this, go, t.data, "f"), t.event) {
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
      F(this, dt, t.data, "f"), E(this, Ee, "f") && (this._emit("toolCallDone", E(this, Ee, "f")), F(this, Ee, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var Is = class extends D {
  constructor() {
    super(...arguments), this.steps = new tc(this._client);
  }
  create(e, t, n) {
    const { include: o, ...i } = t;
    return this._client.post(w`/threads/${e}/runs`, {
      query: { include: o },
      body: i,
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0
    });
  }
  retrieve(e, t, n) {
    const { thread_id: o } = t;
    return this._client.get(w`/threads/${o}/runs/${e}`, {
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  update(e, t, n) {
    const { thread_id: o, ...i } = t;
    return this._client.post(w`/threads/${o}/runs/${e}`, {
      body: i,
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(w`/threads/${e}/runs`, K, {
      query: t,
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  cancel(e, t, n) {
    const { thread_id: o } = t;
    return this._client.post(w`/threads/${o}/runs/${e}/cancel`, {
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t, n);
    return await this.poll(o.id, { thread_id: e }, n);
  }
  createAndStream(e, t, n) {
    return Sn.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  async poll(e, t, n) {
    const o = M([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const { data: i, response: s } = await this.retrieve(e, t, {
        ...n,
        headers: {
          ...n?.headers,
          ...o
        }
      }).withResponse();
      switch (i.status) {
        case "queued":
        case "in_progress":
        case "cancelling":
          let l = 5e3;
          if (n?.pollIntervalMs) l = n.pollIntervalMs;
          else {
            const u = s.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (l = c);
            }
          }
          await bn(l);
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
    return Sn.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  submitToolOutputs(e, t, n) {
    const { thread_id: o, ...i } = t;
    return this._client.post(w`/threads/${o}/runs/${e}/submit_tool_outputs`, {
      body: i,
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0
    });
  }
  async submitToolOutputsAndPoll(e, t, n) {
    const o = await this.submitToolOutputs(e, t, n);
    return await this.poll(o.id, t, n);
  }
  submitToolOutputsStream(e, t, n) {
    return Sn.createToolAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
};
Is.Steps = tc;
var Oo = class extends D {
  constructor() {
    super(...arguments), this.runs = new Is(this._client), this.messages = new ec(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/threads", {
      body: e,
      ...t,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  retrieve(e, t) {
    return this._client.get(w`/threads/${e}`, {
      ...t,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  update(e, t, n) {
    return this._client.post(w`/threads/${e}`, {
      body: t,
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(w`/threads/${e}`, {
      ...t,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  createAndRun(e, t) {
    return this._client.post("/threads/runs", {
      body: e,
      ...t,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      stream: e.stream ?? !1,
      __synthesizeEventData: !0
    });
  }
  async createAndRunPoll(e, t) {
    const n = await this.createAndRun(e, t);
    return await this.runs.poll(n.id, { thread_id: n.thread_id }, t);
  }
  createAndRunStream(e, t) {
    return Sn.createThreadAssistantStream(e, this._client.beta.threads, t);
  }
};
Oo.Runs = Is;
Oo.Messages = ec;
var kt = class extends D {
  constructor() {
    super(...arguments), this.realtime = new Vo(this._client), this.chatkit = new Ho(this._client), this.assistants = new zu(this._client), this.threads = new Oo(this._client);
  }
};
kt.Realtime = Vo;
kt.ChatKit = Ho;
kt.Assistants = zu;
kt.Threads = Oo;
var nc = class extends D {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    });
  }
}, oc = class extends D {
  retrieve(e, t, n) {
    const { container_id: o } = t;
    return this._client.get(w`/containers/${o}/files/${e}/content`, {
      ...n,
      headers: M([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
}, Cs = class extends D {
  constructor() {
    super(...arguments), this.content = new oc(this._client);
  }
  create(e, t, n) {
    return this._client.post(w`/containers/${e}/files`, qo({
      body: t,
      ...n
    }, this._client));
  }
  retrieve(e, t, n) {
    const { container_id: o } = t;
    return this._client.get(w`/containers/${o}/files/${e}`, n);
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(w`/containers/${e}/files`, K, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { container_id: o } = t;
    return this._client.delete(w`/containers/${o}/files/${e}`, {
      ...n,
      headers: M([{ Accept: "*/*" }, n?.headers])
    });
  }
};
Cs.Content = oc;
var As = class extends D {
  constructor() {
    super(...arguments), this.files = new Cs(this._client);
  }
  create(e, t) {
    return this._client.post("/containers", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(w`/containers/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/containers", K, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(w`/containers/${e}`, {
      ...t,
      headers: M([{ Accept: "*/*" }, t?.headers])
    });
  }
};
As.Files = Cs;
var ic = class extends D {
  create(e, t, n) {
    const { include: o, ...i } = t;
    return this._client.post(w`/conversations/${e}/items`, {
      query: { include: o },
      body: i,
      ...n
    });
  }
  retrieve(e, t, n) {
    const { conversation_id: o, ...i } = t;
    return this._client.get(w`/conversations/${o}/items/${e}`, {
      query: i,
      ...n
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(w`/conversations/${e}/items`, Cn, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { conversation_id: o } = t;
    return this._client.delete(w`/conversations/${o}/items/${e}`, n);
  }
}, Rs = class extends D {
  constructor() {
    super(...arguments), this.items = new ic(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/conversations", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(w`/conversations/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(w`/conversations/${e}`, {
      body: t,
      ...n
    });
  }
  delete(e, t) {
    return this._client.delete(w`/conversations/${e}`, t);
  }
};
Rs.Items = ic;
var sc = class extends D {
  create(e, t) {
    const n = !!e.encoding_format;
    let o = n ? e.encoding_format : "base64";
    n && oe(this._client).debug("embeddings/user defined encoding_format:", e.encoding_format);
    const i = this._client.post("/embeddings", {
      body: {
        ...e,
        encoding_format: o
      },
      ...t
    });
    return n ? i : (oe(this._client).debug("embeddings/decoding base64 embeddings from base64"), i._thenUnwrap((s) => (s && s.data && s.data.forEach((l) => {
      const u = l.embedding;
      l.embedding = Jh(u);
    }), s)));
  }
}, rc = class extends D {
  retrieve(e, t, n) {
    const { eval_id: o, run_id: i } = t;
    return this._client.get(w`/evals/${o}/runs/${i}/output_items/${e}`, n);
  }
  list(e, t, n) {
    const { eval_id: o, ...i } = t;
    return this._client.getAPIList(w`/evals/${o}/runs/${e}/output_items`, K, {
      query: i,
      ...n
    });
  }
}, bs = class extends D {
  constructor() {
    super(...arguments), this.outputItems = new rc(this._client);
  }
  create(e, t, n) {
    return this._client.post(w`/evals/${e}/runs`, {
      body: t,
      ...n
    });
  }
  retrieve(e, t, n) {
    const { eval_id: o } = t;
    return this._client.get(w`/evals/${o}/runs/${e}`, n);
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(w`/evals/${e}/runs`, K, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { eval_id: o } = t;
    return this._client.delete(w`/evals/${o}/runs/${e}`, n);
  }
  cancel(e, t, n) {
    const { eval_id: o } = t;
    return this._client.post(w`/evals/${o}/runs/${e}`, n);
  }
};
bs.OutputItems = rc;
var Ps = class extends D {
  constructor() {
    super(...arguments), this.runs = new bs(this._client);
  }
  create(e, t) {
    return this._client.post("/evals", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(w`/evals/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(w`/evals/${e}`, {
      body: t,
      ...n
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/evals", K, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(w`/evals/${e}`, t);
  }
};
Ps.Runs = bs;
var ac = class extends D {
  create(e, t) {
    return this._client.post("/files", Ue({
      body: e,
      ...t
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(w`/files/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/files", K, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(w`/files/${e}`, t);
  }
  content(e, t) {
    return this._client.get(w`/files/${e}/content`, {
      ...t,
      headers: M([{ Accept: "application/binary" }, t?.headers]),
      __binaryResponse: !0
    });
  }
  async waitForProcessing(e, { pollInterval: t = 5e3, maxWait: n = 1800 * 1e3 } = {}) {
    const o = /* @__PURE__ */ new Set([
      "processed",
      "error",
      "deleted"
    ]), i = Date.now();
    let s = await this.retrieve(e);
    for (; !s.status || !o.has(s.status); )
      if (await bn(t), s = await this.retrieve(e), Date.now() - i > n) throw new ms({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return s;
  }
}, lc = class extends D {
}, uc = class extends D {
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
}, xs = class extends D {
  constructor() {
    super(...arguments), this.graders = new uc(this._client);
  }
};
xs.Graders = uc;
var cc = class extends D {
  create(e, t, n) {
    return this._client.getAPIList(w`/fine_tuning/checkpoints/${e}/permissions`, Bo, {
      body: t,
      method: "post",
      ...n
    });
  }
  retrieve(e, t = {}, n) {
    return this._client.get(w`/fine_tuning/checkpoints/${e}/permissions`, {
      query: t,
      ...n
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(w`/fine_tuning/checkpoints/${e}/permissions`, Cn, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { fine_tuned_model_checkpoint: o } = t;
    return this._client.delete(w`/fine_tuning/checkpoints/${o}/permissions/${e}`, n);
  }
}, Ms = class extends D {
  constructor() {
    super(...arguments), this.permissions = new cc(this._client);
  }
};
Ms.Permissions = cc;
var dc = class extends D {
  list(e, t = {}, n) {
    return this._client.getAPIList(w`/fine_tuning/jobs/${e}/checkpoints`, K, {
      query: t,
      ...n
    });
  }
}, Ns = class extends D {
  constructor() {
    super(...arguments), this.checkpoints = new dc(this._client);
  }
  create(e, t) {
    return this._client.post("/fine_tuning/jobs", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(w`/fine_tuning/jobs/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/fine_tuning/jobs", K, {
      query: e,
      ...t
    });
  }
  cancel(e, t) {
    return this._client.post(w`/fine_tuning/jobs/${e}/cancel`, t);
  }
  listEvents(e, t = {}, n) {
    return this._client.getAPIList(w`/fine_tuning/jobs/${e}/events`, K, {
      query: t,
      ...n
    });
  }
  pause(e, t) {
    return this._client.post(w`/fine_tuning/jobs/${e}/pause`, t);
  }
  resume(e, t) {
    return this._client.post(w`/fine_tuning/jobs/${e}/resume`, t);
  }
};
Ns.Checkpoints = dc;
var Dt = class extends D {
  constructor() {
    super(...arguments), this.methods = new lc(this._client), this.jobs = new Ns(this._client), this.checkpoints = new Ms(this._client), this.alpha = new xs(this._client);
  }
};
Dt.Methods = lc;
Dt.Jobs = Ns;
Dt.Checkpoints = Ms;
Dt.Alpha = xs;
var fc = class extends D {
}, ks = class extends D {
  constructor() {
    super(...arguments), this.graderModels = new fc(this._client);
  }
};
ks.GraderModels = fc;
var hc = class extends D {
  createVariation(e, t) {
    return this._client.post("/images/variations", Ue({
      body: e,
      ...t
    }, this._client));
  }
  edit(e, t) {
    return this._client.post("/images/edits", Ue({
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
}, pc = class extends D {
  retrieve(e, t) {
    return this._client.get(w`/models/${e}`, t);
  }
  list(e) {
    return this._client.getAPIList("/models", Bo, e);
  }
  delete(e, t) {
    return this._client.delete(w`/models/${e}`, t);
  }
}, mc = class extends D {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t
    });
  }
}, gc = class extends D {
  accept(e, t, n) {
    return this._client.post(w`/realtime/calls/${e}/accept`, {
      body: t,
      ...n,
      headers: M([{ Accept: "*/*" }, n?.headers])
    });
  }
  hangup(e, t) {
    return this._client.post(w`/realtime/calls/${e}/hangup`, {
      ...t,
      headers: M([{ Accept: "*/*" }, t?.headers])
    });
  }
  refer(e, t, n) {
    return this._client.post(w`/realtime/calls/${e}/refer`, {
      body: t,
      ...n,
      headers: M([{ Accept: "*/*" }, n?.headers])
    });
  }
  reject(e, t = {}, n) {
    return this._client.post(w`/realtime/calls/${e}/reject`, {
      body: t,
      ...n,
      headers: M([{ Accept: "*/*" }, n?.headers])
    });
  }
}, _c = class extends D {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t
    });
  }
}, Jo = class extends D {
  constructor() {
    super(...arguments), this.clientSecrets = new _c(this._client), this.calls = new gc(this._client);
  }
};
Jo.ClientSecrets = _c;
Jo.Calls = gc;
function Wh(e, t) {
  return !t || !Yh(t) ? {
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
  } : yc(e, t);
}
function yc(e, t) {
  const n = e.output.map((i) => {
    if (i.type === "function_call") return {
      ...i,
      parsed_arguments: Qh(t, i)
    };
    if (i.type === "message") {
      const s = i.content.map((l) => l.type === "output_text" ? {
        ...l,
        parsed: Kh(t, l.text)
      } : l);
      return {
        ...i,
        content: s
      };
    }
    return i;
  }), o = Object.assign({}, e, { output: n });
  return Object.getOwnPropertyDescriptor(e, "output_text") || Fi(o), Object.defineProperty(o, "output_parsed", {
    enumerable: !0,
    get() {
      for (const i of o.output)
        if (i.type === "message") {
          for (const s of i.content) if (s.type === "output_text" && s.parsed !== null) return s.parsed;
        }
      return null;
    }
  }), o;
}
function Kh(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function Yh(e) {
  return !!vs(e.text?.format);
}
function zh(e) {
  return e?.$brand === "auto-parseable-tool";
}
function Xh(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function Qh(e, t) {
  const n = Xh(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: zh(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function Fi(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const o of n.content) o.type === "output_text" && t.push(o.text);
  e.output_text = t.join("");
}
var _t, qn, ze, Vn, Rr, br, Pr, xr, Zh = class vc extends Ts {
  constructor(t) {
    super(), _t.add(this), qn.set(this, void 0), ze.set(this, void 0), Vn.set(this, void 0), F(this, qn, t, "f");
  }
  static createResponse(t, n, o) {
    const i = new vc(n);
    return i._run(() => i._createOrRetrieveResponse(t, n, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), i;
  }
  async _createOrRetrieveResponse(t, n, o) {
    const i = o?.signal;
    i && (i.aborted && this.controller.abort(), i.addEventListener("abort", () => this.controller.abort())), E(this, _t, "m", Rr).call(this);
    let s, l = null;
    "response_id" in n ? (s = await t.responses.retrieve(n.response_id, { stream: !0 }, {
      ...o,
      signal: this.controller.signal,
      stream: !0
    }), l = n.starting_after ?? null) : s = await t.responses.create({
      ...n,
      stream: !0
    }, {
      ...o,
      signal: this.controller.signal
    }), this._connected();
    for await (const u of s) E(this, _t, "m", br).call(this, u, l);
    if (s.controller.signal?.aborted) throw new Ie();
    return E(this, _t, "m", Pr).call(this);
  }
  [(qn = /* @__PURE__ */ new WeakMap(), ze = /* @__PURE__ */ new WeakMap(), Vn = /* @__PURE__ */ new WeakMap(), _t = /* @__PURE__ */ new WeakSet(), Rr = function() {
    this.ended || F(this, ze, void 0, "f");
  }, br = function(n, o) {
    if (this.ended) return;
    const i = (l, u) => {
      (o == null || u.sequence_number > o) && this._emit(l, u);
    }, s = E(this, _t, "m", xr).call(this, n);
    switch (i("event", n), n.type) {
      case "response.output_text.delta": {
        const l = s.output[n.output_index];
        if (!l) throw new L(`missing output at index ${n.output_index}`);
        if (l.type === "message") {
          const u = l.content[n.content_index];
          if (!u) throw new L(`missing content at index ${n.content_index}`);
          if (u.type !== "output_text") throw new L(`expected content to be 'output_text', got ${u.type}`);
          i("response.output_text.delta", {
            ...n,
            snapshot: u.text
          });
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const l = s.output[n.output_index];
        if (!l) throw new L(`missing output at index ${n.output_index}`);
        l.type === "function_call" && i("response.function_call_arguments.delta", {
          ...n,
          snapshot: l.arguments
        });
        break;
      }
      default:
        i(n.type, n);
        break;
    }
  }, Pr = function() {
    if (this.ended) throw new L("stream has ended, this shouldn't happen");
    const n = E(this, ze, "f");
    if (!n) throw new L("request ended without sending any events");
    F(this, ze, void 0, "f");
    const o = jh(n, E(this, qn, "f"));
    return F(this, Vn, o, "f"), o;
  }, xr = function(n) {
    let o = E(this, ze, "f");
    if (!o) {
      if (n.type !== "response.created") throw new L(`When snapshot hasn't been set yet, expected 'response.created' event, got ${n.type}`);
      return o = F(this, ze, n.response, "f"), o;
    }
    switch (n.type) {
      case "response.output_item.added":
        o.output.push(n.item);
        break;
      case "response.content_part.added": {
        const i = o.output[n.output_index];
        if (!i) throw new L(`missing output at index ${n.output_index}`);
        const s = i.type, l = n.part;
        s === "message" && l.type !== "reasoning_text" ? i.content.push(l) : s === "reasoning" && l.type === "reasoning_text" && (i.content || (i.content = []), i.content.push(l));
        break;
      }
      case "response.output_text.delta": {
        const i = o.output[n.output_index];
        if (!i) throw new L(`missing output at index ${n.output_index}`);
        if (i.type === "message") {
          const s = i.content[n.content_index];
          if (!s) throw new L(`missing content at index ${n.content_index}`);
          if (s.type !== "output_text") throw new L(`expected content to be 'output_text', got ${s.type}`);
          s.text += n.delta;
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const i = o.output[n.output_index];
        if (!i) throw new L(`missing output at index ${n.output_index}`);
        i.type === "function_call" && (i.arguments += n.delta);
        break;
      }
      case "response.reasoning_text.delta": {
        const i = o.output[n.output_index];
        if (!i) throw new L(`missing output at index ${n.output_index}`);
        if (i.type === "reasoning") {
          const s = i.content?.[n.content_index];
          if (!s) throw new L(`missing content at index ${n.content_index}`);
          if (s.type !== "reasoning_text") throw new L(`expected content to be 'reasoning_text', got ${s.type}`);
          s.text += n.delta;
        }
        break;
      }
      case "response.completed":
        F(this, ze, n.response, "f");
        break;
    }
    return o;
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let o = !1;
    return this.on("event", (i) => {
      const s = n.shift();
      s ? s.resolve(i) : t.push(i);
    }), this.on("end", () => {
      o = !0;
      for (const i of n) i.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (i) => {
      o = !0;
      for (const s of n) s.reject(i);
      n.length = 0;
    }), this.on("error", (i) => {
      o = !0;
      for (const s of n) s.reject(i);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : o ? {
        value: void 0,
        done: !0
      } : new Promise((i, s) => n.push({
        resolve: i,
        reject: s
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
    const t = E(this, Vn, "f");
    if (!t) throw new L("stream ended without producing a ChatCompletion");
    return t;
  }
};
function jh(e, t) {
  return Wh(e, t);
}
var Ec = class extends D {
  list(e, t = {}, n) {
    return this._client.getAPIList(w`/responses/${e}/input_items`, K, {
      query: t,
      ...n
    });
  }
}, Tc = class extends D {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t
    });
  }
}, Wo = class extends D {
  constructor() {
    super(...arguments), this.inputItems = new Ec(this._client), this.inputTokens = new Tc(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && Fi(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(w`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1
    })._thenUnwrap((o) => ("object" in o && o.object === "response" && Fi(o), o));
  }
  delete(e, t) {
    return this._client.delete(w`/responses/${e}`, {
      ...t,
      headers: M([{ Accept: "*/*" }, t?.headers])
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => yc(n, e));
  }
  stream(e, t) {
    return Zh.createResponse(this._client, e, t);
  }
  cancel(e, t) {
    return this._client.post(w`/responses/${e}/cancel`, t);
  }
  compact(e, t) {
    return this._client.post("/responses/compact", {
      body: e,
      ...t
    });
  }
};
Wo.InputItems = Ec;
Wo.InputTokens = Tc;
var Sc = class extends D {
  retrieve(e, t) {
    return this._client.get(w`/skills/${e}/content`, {
      ...t,
      headers: M([{ Accept: "application/binary" }, t?.headers]),
      __binaryResponse: !0
    });
  }
}, wc = class extends D {
  retrieve(e, t, n) {
    const { skill_id: o } = t;
    return this._client.get(w`/skills/${o}/versions/${e}/content`, {
      ...n,
      headers: M([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
}, Ds = class extends D {
  constructor() {
    super(...arguments), this.content = new wc(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(w`/skills/${e}/versions`, qo({
      body: t,
      ...n
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: o } = t;
    return this._client.get(w`/skills/${o}/versions/${e}`, n);
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(w`/skills/${e}/versions`, K, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { skill_id: o } = t;
    return this._client.delete(w`/skills/${o}/versions/${e}`, n);
  }
};
Ds.Content = wc;
var Ko = class extends D {
  constructor() {
    super(...arguments), this.content = new Sc(this._client), this.versions = new Ds(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", qo({
      body: e,
      ...t
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(w`/skills/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(w`/skills/${e}`, {
      body: t,
      ...n
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/skills", K, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(w`/skills/${e}`, t);
  }
};
Ko.Content = Sc;
Ko.Versions = Ds;
var Ic = class extends D {
  create(e, t, n) {
    return this._client.post(w`/uploads/${e}/parts`, Ue({
      body: t,
      ...n
    }, this._client));
  }
}, Ls = class extends D {
  constructor() {
    super(...arguments), this.parts = new Ic(this._client);
  }
  create(e, t) {
    return this._client.post("/uploads", {
      body: e,
      ...t
    });
  }
  cancel(e, t) {
    return this._client.post(w`/uploads/${e}/cancel`, t);
  }
  complete(e, t, n) {
    return this._client.post(w`/uploads/${e}/complete`, {
      body: t,
      ...n
    });
  }
};
Ls.Parts = Ic;
var ep = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((i) => i.status === "rejected");
  if (n.length) {
    for (const i of n) console.error(i.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const o = [];
  for (const i of t) i.status === "fulfilled" && o.push(i.value);
  return o;
}, Cc = class extends D {
  create(e, t, n) {
    return this._client.post(w`/vector_stores/${e}/file_batches`, {
      body: t,
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.get(w`/vector_stores/${o}/file_batches/${e}`, {
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  cancel(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.post(w`/vector_stores/${o}/file_batches/${e}/cancel`, {
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t);
    return await this.poll(e, o.id, n);
  }
  listFiles(e, t, n) {
    const { vector_store_id: o, ...i } = t;
    return this._client.getAPIList(w`/vector_stores/${o}/file_batches/${e}/files`, K, {
      query: i,
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async poll(e, t, n) {
    const o = M([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const { data: i, response: s } = await this.retrieve(t, { vector_store_id: e }, {
        ...n,
        headers: o
      }).withResponse();
      switch (i.status) {
        case "in_progress":
          let l = 5e3;
          if (n?.pollIntervalMs) l = n.pollIntervalMs;
          else {
            const u = s.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (l = c);
            }
          }
          await bn(l);
          break;
        case "failed":
        case "cancelled":
        case "completed":
          return i;
      }
    }
  }
  async uploadAndPoll(e, { files: t, fileIds: n = [] }, o) {
    if (t == null || t.length == 0) throw new Error("No `files` provided to process. If you've already uploaded files you should use `.createAndPoll()` instead");
    const i = o?.maxConcurrency ?? 5, s = Math.min(i, t.length), l = this._client, u = t.values(), c = [...n];
    async function d(h) {
      for (let f of h) {
        const p = await l.files.create({
          file: f,
          purpose: "assistants"
        }, o);
        c.push(p.id);
      }
    }
    return await ep(Array(s).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, Ac = class extends D {
  create(e, t, n) {
    return this._client.post(w`/vector_stores/${e}/files`, {
      body: t,
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.get(w`/vector_stores/${o}/files/${e}`, {
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vector_store_id: o, ...i } = t;
    return this._client.post(w`/vector_stores/${o}/files/${e}`, {
      body: i,
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(w`/vector_stores/${e}/files`, K, {
      query: t,
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.delete(w`/vector_stores/${o}/files/${e}`, {
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t, n);
    return await this.poll(e, o.id, n);
  }
  async poll(e, t, n) {
    const o = M([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const i = await this.retrieve(t, { vector_store_id: e }, {
        ...n,
        headers: o
      }).withResponse(), s = i.data;
      switch (s.status) {
        case "in_progress":
          let l = 5e3;
          if (n?.pollIntervalMs) l = n.pollIntervalMs;
          else {
            const u = i.response.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (l = c);
            }
          }
          await bn(l);
          break;
        case "failed":
        case "completed":
          return s;
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
    return this._client.getAPIList(w`/vector_stores/${o}/files/${e}/content`, Bo, {
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, Yo = class extends D {
  constructor() {
    super(...arguments), this.files = new Ac(this._client), this.fileBatches = new Cc(this._client);
  }
  create(e, t) {
    return this._client.post("/vector_stores", {
      body: e,
      ...t,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  retrieve(e, t) {
    return this._client.get(w`/vector_stores/${e}`, {
      ...t,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  update(e, t, n) {
    return this._client.post(w`/vector_stores/${e}`, {
      body: t,
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/vector_stores", K, {
      query: e,
      ...t,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(w`/vector_stores/${e}`, {
      ...t,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  search(e, t, n) {
    return this._client.getAPIList(w`/vector_stores/${e}/search`, Bo, {
      body: t,
      method: "post",
      ...n,
      headers: M([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
};
Yo.Files = Ac;
Yo.FileBatches = Cc;
var Rc = class extends D {
  create(e, t) {
    return this._client.post("/videos", Ue({
      body: e,
      ...t
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(w`/videos/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/videos", Cn, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(w`/videos/${e}`, t);
  }
  createCharacter(e, t) {
    return this._client.post("/videos/characters", Ue({
      body: e,
      ...t
    }, this._client));
  }
  downloadContent(e, t = {}, n) {
    return this._client.get(w`/videos/${e}/content`, {
      query: t,
      ...n,
      headers: M([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
  edit(e, t) {
    return this._client.post("/videos/edits", Ue({
      body: e,
      ...t
    }, this._client));
  }
  extend(e, t) {
    return this._client.post("/videos/extensions", Ue({
      body: e,
      ...t
    }, this._client));
  }
  getCharacter(e, t) {
    return this._client.get(w`/videos/characters/${e}`, t);
  }
  remix(e, t, n) {
    return this._client.post(w`/videos/${e}/remix`, qo({
      body: t,
      ...n
    }, this._client));
  }
}, wt, bc, _o, Pc = class extends D {
  constructor() {
    super(...arguments), wt.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, o = 300) {
    return await this.verifySignature(e, t, n, o), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, o = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    E(this, wt, "m", bc).call(this, n);
    const i = M([t]).values, s = E(this, wt, "m", _o).call(this, i, "webhook-signature"), l = E(this, wt, "m", _o).call(this, i, "webhook-timestamp"), u = E(this, wt, "m", _o).call(this, i, "webhook-id"), c = parseInt(l, 10);
    if (isNaN(c)) throw new sn("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > o) throw new sn("Webhook timestamp is too old");
    if (c > d + o) throw new sn("Webhook timestamp is too new");
    const h = s.split(" ").map((g) => g.startsWith("v1,") ? g.substring(3) : g), f = n.startsWith("whsec_") ? Buffer.from(n.replace("whsec_", ""), "base64") : Buffer.from(n, "utf-8"), p = u ? `${u}.${l}.${e}` : `${l}.${e}`, m = await crypto.subtle.importKey("raw", f, {
      name: "HMAC",
      hash: "SHA-256"
    }, !1, ["verify"]);
    for (const g of h) try {
      const _ = Buffer.from(g, "base64");
      if (await crypto.subtle.verify("HMAC", m, _, new TextEncoder().encode(p))) return;
    } catch {
      continue;
    }
    throw new sn("The given webhook signature does not match the expected signature");
  }
};
wt = /* @__PURE__ */ new WeakSet(), bc = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, _o = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const o = t.get(n);
  if (o == null) throw new Error(`Missing required header: ${n}`);
  return o;
};
var Gi, Us, yo, xc, ci = "workload-identity-auth", H = class {
  constructor({ baseURL: e = gt("OPENAI_BASE_URL"), apiKey: t = gt("OPENAI_API_KEY"), organization: n = gt("OPENAI_ORG_ID") ?? null, project: o = gt("OPENAI_PROJECT_ID") ?? null, webhookSecret: i = gt("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: s, ...l } = {}) {
    if (Gi.add(this), yo.set(this, void 0), this.completions = new nc(this), this.chat = new ws(this), this.embeddings = new sc(this), this.files = new ac(this), this.images = new hc(this), this.audio = new xn(this), this.moderations = new mc(this), this.models = new pc(this), this.fineTuning = new Dt(this), this.graders = new ks(this), this.vectorStores = new Yo(this), this.webhooks = new Pc(this), this.beta = new kt(this), this.batches = new Yu(this), this.uploads = new Ls(this), this.responses = new Wo(this), this.realtime = new Jo(this), this.conversations = new Rs(this), this.evals = new Ps(this), this.containers = new As(this), this.skills = new Ko(this), this.videos = new Rc(this), s) {
      if (t && t !== ci) throw new L("The `apiKey` and `workloadIdentity` arguments are mutually exclusive; only one can be passed at a time.");
      t = ci;
    } else if (t === void 0) throw new L("Missing credentials. Please pass an `apiKey`, `workloadIdentity`, or set the `OPENAI_API_KEY` environment variable.");
    const u = {
      apiKey: t,
      organization: n,
      project: o,
      webhookSecret: i,
      workloadIdentity: s,
      ...l,
      baseURL: e || "https://api.openai.com/v1"
    };
    if (!u.dangerouslyAllowBrowser && Kf()) throw new L(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = u.baseURL, this.timeout = u.timeout ?? Us.DEFAULT_TIMEOUT, this.logger = u.logger ?? console;
    const c = "warn";
    this.logLevel = c, this.logLevel = fr(u.logLevel, "ClientOptions.logLevel", this) ?? fr(gt("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? c, this.fetchOptions = u.fetchOptions, this.maxRetries = u.maxRetries ?? 2, this.fetch = u.fetch ?? du(), F(this, yo, Zf, "f"), this._options = u, s && (this._workloadIdentityAuth = new gh(s, this.fetch)), this.apiKey = typeof t == "string" ? t : "Missing Key", this.organization = n, this.project = o, this.webhookSecret = i;
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
    return M([{ Authorization: `Bearer ${this.apiKey}` }]);
  }
  stringifyQuery(e) {
    return ih(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Tt}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Zl()}`;
  }
  makeStatusError(e, t, n, o) {
    return re.generate(e, t, n, o);
  }
  async _callApiKey() {
    const e = this._options.apiKey;
    if (typeof e != "function") return !1;
    let t;
    try {
      t = await e();
    } catch (n) {
      throw n instanceof L ? n : new L(`Failed to get token from 'apiKey' function: ${n.message}`, { cause: n });
    }
    if (typeof t != "string" || !t) throw new L(`Expected 'apiKey' function argument to return a string but it returned ${t}`);
    return this.apiKey = t, !0;
  }
  buildURL(e, t, n) {
    const o = !E(this, Gi, "m", xc).call(this) && n || this.baseURL, i = Hf(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), s = this.defaultQuery(), l = Object.fromEntries(i.searchParams);
    return (!tr(s) || !tr(l)) && (t = {
      ...l,
      ...s,
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
    return this.request(Promise.resolve(n).then((o) => ({
      method: e,
      path: t,
      ...o
    })));
  }
  request(e, t = null) {
    return new Su(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const o = await e, i = o.maxRetries ?? this.maxRetries;
    t == null && (t = i), await this.prepareOptions(o);
    const { req: s, url: l, timeout: u } = await this.buildRequest(o, { retryCount: i - t });
    await this.prepareRequest(s, {
      url: l,
      options: o
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, h = Date.now();
    if (oe(this).debug(`[${c}] sending request`, rt({
      retryOfRequestLogID: n,
      method: o.method,
      url: l,
      options: o,
      headers: s.headers
    })), o.signal?.aborted) throw new Ie();
    const f = new AbortController(), p = await this.fetchWithAuth(l, s, u, f).catch(Ii), m = Date.now();
    if (p instanceof globalThis.Error) {
      const _ = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new Ie();
      const y = wi(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (t)
        return oe(this).info(`[${c}] connection ${y ? "timed out" : "failed"} - ${_}`), oe(this).debug(`[${c}] connection ${y ? "timed out" : "failed"} (${_})`, rt({
          retryOfRequestLogID: n,
          url: l,
          durationMs: m - h,
          message: p.message
        })), this.retryRequest(o, t, n ?? c);
      throw oe(this).info(`[${c}] connection ${y ? "timed out" : "failed"} - error; no more retries left`), oe(this).debug(`[${c}] connection ${y ? "timed out" : "failed"} (error; no more retries left)`, rt({
        retryOfRequestLogID: n,
        url: l,
        durationMs: m - h,
        message: p.message
      })), p instanceof uu || p instanceof qf ? p : y ? new ms() : new Fo({ cause: p });
    }
    const g = `[${c}${d}${[...p.headers.entries()].filter(([_]) => _ === "x-request-id").map(([_, y]) => ", " + _ + ": " + JSON.stringify(y)).join("")}] ${s.method} ${l} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - h}ms`;
    if (!p.ok) {
      if (p.status === 401 && this._workloadIdentityAuth && !o.__metadata?.hasStreamingBody && !o.__metadata?.workloadIdentityTokenRefreshed)
        return await sr(p.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
          ...o,
          __metadata: {
            ...o.__metadata,
            workloadIdentityTokenRefreshed: !0
          }
        }, t, n ?? c);
      const _ = await this.shouldRetry(p);
      if (t && _) {
        const R = `retrying, ${t} attempts remaining`;
        return await sr(p.body), oe(this).info(`${g} - ${R}`), oe(this).debug(`[${c}] response error (${R})`, rt({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: m - h
        })), this.retryRequest(o, t, n ?? c, p.headers);
      }
      const y = _ ? "error; no more retries left" : "error; not retryable";
      oe(this).info(`${g} - ${y}`);
      const I = await p.text().catch((R) => Ii(R).message), S = Wf(I), A = S ? void 0 : I;
      throw oe(this).debug(`[${c}] response error (${y})`, rt({
        retryOfRequestLogID: n,
        url: p.url,
        status: p.status,
        headers: p.headers,
        message: A,
        durationMs: Date.now() - h
      })), this.makeStatusError(p.status, S, A, p.headers);
    }
    return oe(this).info(g), oe(this).debug(`[${c}] response start`, rt({
      retryOfRequestLogID: n,
      url: p.url,
      status: p.status,
      headers: p.headers,
      durationMs: m - h
    })), {
      response: p,
      options: o,
      controller: f,
      requestLogID: c,
      retryOfRequestLogID: n,
      startTime: h
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
    return new hh(this, n, e);
  }
  async fetchWithAuth(e, t, n, o) {
    if (this._workloadIdentityAuth) {
      const i = t.headers, s = i.get("Authorization");
      if (!s || s === `Bearer ${ci}`) {
        const l = await this._workloadIdentityAuth.getToken();
        i.set("Authorization", `Bearer ${l}`);
      }
    }
    return await this.fetchWithTimeout(e, t, n, o);
  }
  async fetchWithTimeout(e, t, n, o) {
    const { signal: i, method: s, ...l } = t || {}, u = this._makeAbort(o);
    i && i.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && l.body instanceof globalThis.ReadableStream || typeof l.body == "object" && l.body !== null && Symbol.asyncIterator in l.body, h = {
      signal: o.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...l
    };
    s && (h.method = s.toUpperCase());
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
  async retryRequest(e, t, n, o) {
    let i;
    const s = o?.get("retry-after-ms");
    if (s) {
      const u = parseFloat(s);
      Number.isNaN(u) || (i = u);
    }
    const l = o?.get("retry-after");
    if (l && !i) {
      const u = parseFloat(l);
      Number.isNaN(u) ? i = Date.parse(l) - Date.now() : i = u * 1e3;
    }
    if (i === void 0) {
      const u = e.maxRetries ?? this.maxRetries;
      i = this.calculateDefaultRetryTimeoutMillis(t, u);
    }
    return await bn(i), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const i = t - e;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: o, path: i, query: s, defaultBaseURL: l } = n, u = this.buildURL(i, s, l);
    "timeout" in n && Jf("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
    const { bodyHeaders: c, body: d, isStreamingBody: h } = this.buildBody({ options: n });
    return h && (e.__metadata = {
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
    let i = {};
    this.idempotencyHeader && t !== "get" && (e.idempotencyKey || (e.idempotencyKey = this.defaultIdempotencyKey()), i[this.idempotencyHeader] = e.idempotencyKey);
    const s = M([
      i,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(o),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...Qf(),
        "OpenAI-Organization": this.organization,
        "OpenAI-Project": this.project
      },
      await this.authHeaders(e),
      this._options.defaultHeaders,
      n,
      e.headers
    ]);
    return this.validateHeaders(s), s.values;
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
    const n = M([t]), o = typeof globalThis.ReadableStream < "u" && e instanceof globalThis.ReadableStream, i = !o && (typeof e == "string" || e instanceof ArrayBuffer || ArrayBuffer.isView(e) || typeof globalThis.Blob < "u" && e instanceof globalThis.Blob || e instanceof URLSearchParams || e instanceof FormData);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || o ? {
      bodyHeaders: void 0,
      body: e,
      isStreamingBody: !i
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: hu(e),
      isStreamingBody: !0
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e),
      isStreamingBody: !1
    } : {
      ...E(this, yo, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
Us = H, yo = /* @__PURE__ */ new WeakMap(), Gi = /* @__PURE__ */ new WeakSet(), xc = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
H.OpenAI = Us;
H.DEFAULT_TIMEOUT = 6e5;
H.OpenAIError = L;
H.APIError = re;
H.APIConnectionError = Fo;
H.APIConnectionTimeoutError = ms;
H.APIUserAbortError = Ie;
H.NotFoundError = nu;
H.ConflictError = ou;
H.RateLimitError = su;
H.BadRequestError = jl;
H.AuthenticationError = eu;
H.InternalServerError = ru;
H.PermissionDeniedError = tu;
H.UnprocessableEntityError = iu;
H.InvalidWebhookSignatureError = sn;
H.toFile = Th;
H.Completions = nc;
H.Chat = ws;
H.Embeddings = sc;
H.Files = ac;
H.Images = hc;
H.Audio = xn;
H.Moderations = mc;
H.Models = pc;
H.FineTuning = Dt;
H.Graders = ks;
H.VectorStores = Yo;
H.Webhooks = Pc;
H.Beta = kt;
H.Batches = Yu;
H.Uploads = Ls;
H.Responses = Wo;
H.Realtime = Jo;
H.Conversations = Rs;
H.Evals = Ps;
H.Containers = As;
H.Skills = Ko;
H.Videos = Rc;
var tp = class {
  constructor(e) {
    this.config = e, this.client = new H({
      apiKey: e.apiKey,
      baseURL: String(e.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 18e4,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  async chat(e) {
    const t = await this.client.chat.completions.create({
      model: this.config.model,
      messages: e.messages,
      tools: e.tools,
      tool_choice: e.toolChoice || "auto",
      temperature: e.temperature,
      max_tokens: e.maxTokens
    }, { signal: e.signal }), n = t.choices?.[0] || {}, o = n.message || {}, i = (o.tool_calls || []).map((s) => ({
      id: s.id || `openai-tool-${Date.now()}`,
      name: s.function?.name || "",
      arguments: s.function?.arguments || "{}"
    })).filter((s) => s.name);
    return {
      text: o.content || "",
      toolCalls: i,
      finishReason: n.finish_reason || "stop",
      model: t.model || this.config.model,
      provider: "openai-compatible"
    };
  }
};
function x(e, t, n, o, i) {
  if (o === "m") throw new TypeError("Private method is not writable");
  if (o === "a" && !i) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !i : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return o === "a" ? i.call(e, n) : i ? i.value = n : t.set(e, n), n;
}
function v(e, t, n, o) {
  if (n === "a" && !o) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !o : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? o : n === "a" ? o.call(e) : o ? o.value : t.get(e);
}
var Mc = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Mc = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function An(e) {
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
}, B = class extends Error {
}, Te = class qi extends B {
  constructor(t, n, o, i, s) {
    super(`${qi.makeMessage(t, n, o)}`), this.status = t, this.headers = i, this.requestID = i?.get("request-id"), this.error = n, this.type = s ?? null;
  }
  static makeMessage(t, n, o) {
    const i = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && i ? `${t} ${i}` : t ? `${t} status code (no body)` : i || "(no status code or body)";
  }
  static generate(t, n, o, i) {
    if (!t || !i) return new zo({
      message: o,
      cause: Bi(n)
    });
    const s = n, l = s?.error?.type;
    return t === 400 ? new kc(t, s, o, i, l) : t === 401 ? new Dc(t, s, o, i, l) : t === 403 ? new Lc(t, s, o, i, l) : t === 404 ? new Uc(t, s, o, i, l) : t === 409 ? new $c(t, s, o, i, l) : t === 422 ? new Fc(t, s, o, i, l) : t === 429 ? new Gc(t, s, o, i, l) : t >= 500 ? new Bc(t, s, o, i, l) : new qi(t, s, o, i, l);
  }
}, xe = class extends Te {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, zo = class extends Te {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Nc = class extends zo {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, kc = class extends Te {
}, Dc = class extends Te {
}, Lc = class extends Te {
}, Uc = class extends Te {
}, $c = class extends Te {
}, Fc = class extends Te {
}, Gc = class extends Te {
}, Bc = class extends Te {
}, np = /^[a-z][a-z0-9+.-]*:/i, op = (e) => np.test(e), Vi = (e) => (Vi = Array.isArray, Vi(e)), Mr = Vi;
function Hi(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function Nr(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function ip(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var sp = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new B(`${e} must be an integer`);
  if (t < 0) throw new B(`${e} must be a positive integer`);
  return t;
}, qc = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, rp = (e) => new Promise((t) => setTimeout(t, e)), It = "0.89.0", ap = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function lp() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var up = () => {
  const e = lp();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": It,
    "X-Stainless-OS": Dr(Deno.build.os),
    "X-Stainless-Arch": kr(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": It,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": It,
    "X-Stainless-OS": Dr(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": kr(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = cp();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": It,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": It,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function cp() {
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
var kr = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Dr = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), Lr, dp = () => Lr ?? (Lr = up());
function fp() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Vc(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Hc(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Vc({
    start() {
    },
    async pull(n) {
      const { done: o, value: i } = await t.next();
      o ? n.close() : n.enqueue(i);
    },
    async cancel() {
      await t.return?.();
    }
  });
}
function $s(e) {
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
async function hp(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var pp = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function mp(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new B(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function gp(e) {
  let t = 0;
  for (const i of e) t += i.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const i of e)
    n.set(i, o), o += i.length;
  return n;
}
var Ur;
function Fs(e) {
  let t;
  return (Ur ?? (t = new globalThis.TextEncoder(), Ur = t.encode.bind(t)))(e);
}
var $r;
function Fr(e) {
  let t;
  return ($r ?? (t = new globalThis.TextDecoder(), $r = t.decode.bind(t)))(e);
}
var ye, ve, Mn = class {
  constructor() {
    ye.set(this, void 0), ve.set(this, void 0), x(this, ye, new Uint8Array(), "f"), x(this, ve, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Fs(e) : e;
    x(this, ye, gp([v(this, ye, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = _p(v(this, ye, "f"), v(this, ve, "f"))) != null; ) {
      if (o.carriage && v(this, ve, "f") == null) {
        x(this, ve, o.index, "f");
        continue;
      }
      if (v(this, ve, "f") != null && (o.index !== v(this, ve, "f") + 1 || o.carriage)) {
        n.push(Fr(v(this, ye, "f").subarray(0, v(this, ve, "f") - 1))), x(this, ye, v(this, ye, "f").subarray(v(this, ve, "f")), "f"), x(this, ve, null, "f");
        continue;
      }
      const i = v(this, ve, "f") !== null ? o.preceding - 1 : o.preceding, s = Fr(v(this, ye, "f").subarray(0, i));
      n.push(s), x(this, ye, v(this, ye, "f").subarray(o.index), "f"), x(this, ve, null, "f");
    }
    return n;
  }
  flush() {
    return v(this, ye, "f").length ? this.decode(`
`) : [];
  }
};
ye = /* @__PURE__ */ new WeakMap(), ve = /* @__PURE__ */ new WeakMap();
Mn.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Mn.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function _p(e, t) {
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
function yp(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var Mo = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Gr = (e, t, n) => {
  if (e) {
    if (ip(Mo, e)) return e;
    ue(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Mo))}`);
  }
};
function mn() {
}
function Hn(e, t, n) {
  return !t || Mo[e] > Mo[n] ? mn : t[e].bind(t);
}
var vp = {
  error: mn,
  warn: mn,
  info: mn,
  debug: mn
}, Br = /* @__PURE__ */ new WeakMap();
function ue(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return vp;
  const o = Br.get(t);
  if (o && o[0] === n) return o[1];
  const i = {
    error: Hn("error", t, n),
    warn: Hn("warn", t, n),
    info: Hn("info", t, n),
    debug: Hn("debug", t, n)
  };
  return Br.set(t, [n, i]), i;
}
var at = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), qt, Rn = class gn {
  constructor(t, n, o) {
    this.iterator = t, qt.set(this, void 0), this.controller = n, x(this, qt, o, "f");
  }
  static fromSSEResponse(t, n, o) {
    let i = !1;
    const s = o ? ue(o) : console;
    async function* l() {
      if (i) throw new B("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let u = !1;
      try {
        for await (const c of Ep(t, n)) {
          if (c.event === "completion") try {
            yield JSON.parse(c.data);
          } catch (d) {
            throw s.error("Could not parse message into JSON:", c.data), s.error("From chunk:", c.raw), d;
          }
          if (c.event === "message_start" || c.event === "message_delta" || c.event === "message_stop" || c.event === "content_block_start" || c.event === "content_block_delta" || c.event === "content_block_stop" || c.event === "message" || c.event === "user.message" || c.event === "user.interrupt" || c.event === "user.tool_confirmation" || c.event === "user.custom_tool_result" || c.event === "agent.message" || c.event === "agent.thinking" || c.event === "agent.tool_use" || c.event === "agent.tool_result" || c.event === "agent.mcp_tool_use" || c.event === "agent.mcp_tool_result" || c.event === "agent.custom_tool_use" || c.event === "agent.thread_context_compacted" || c.event === "session.status_running" || c.event === "session.status_idle" || c.event === "session.status_rescheduled" || c.event === "session.status_terminated" || c.event === "session.error" || c.event === "session.deleted" || c.event === "span.model_request_start" || c.event === "span.model_request_end") try {
            yield JSON.parse(c.data);
          } catch (d) {
            throw s.error("Could not parse message into JSON:", c.data), s.error("From chunk:", c.raw), d;
          }
          if (c.event !== "ping" && c.event === "error") {
            const d = qc(c.data) ?? c.data, h = d?.error?.type;
            throw new Te(void 0, d, void 0, t.headers, h);
          }
        }
        u = !0;
      } catch (c) {
        if (An(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new gn(l, n, o);
  }
  static fromReadableStream(t, n, o) {
    let i = !1;
    async function* s() {
      const u = new Mn(), c = $s(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
      for (const d of u.flush()) yield d;
    }
    async function* l() {
      if (i) throw new B("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let u = !1;
      try {
        for await (const c of s())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (An(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new gn(l, n, o);
  }
  [(qt = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], o = this.iterator(), i = (s) => ({ next: () => {
      if (s.length === 0) {
        const l = o.next();
        t.push(l), n.push(l);
      }
      return s.shift();
    } });
    return [new gn(() => i(t), this.controller, v(this, qt, "f")), new gn(() => i(n), this.controller, v(this, qt, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Vc({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: i, done: s } = await n.next();
          if (s) return o.close();
          const l = Fs(JSON.stringify(i) + `
`);
          o.enqueue(l);
        } catch (i) {
          o.error(i);
        }
      },
      async cancel() {
        await n.return?.();
      }
    });
  }
};
async function* Ep(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new B("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new B("Attempted to iterate over a response with no body");
  const n = new Sp(), o = new Mn(), i = $s(e.body);
  for await (const s of Tp(i)) for (const l of o.decode(s)) {
    const u = n.decode(l);
    u && (yield u);
  }
  for (const s of o.flush()) {
    const l = n.decode(s);
    l && (yield l);
  }
}
async function* Tp(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Fs(n) : n;
    let i = new Uint8Array(t.length + o.length);
    i.set(t), i.set(o, t.length), t = i;
    let s;
    for (; (s = yp(t)) !== -1; )
      yield t.slice(0, s), t = t.slice(s);
  }
  t.length > 0 && (yield t);
}
var Sp = class {
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
    let [t, n, o] = wp(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function wp(e, t) {
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
async function Oc(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: i, startTime: s } = t, l = await (async () => {
    if (t.options.stream)
      return ue(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : Rn.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Jc(await n.json(), n) : await n.text();
  })();
  return ue(e).debug(`[${o}] response parsed`, at({
    retryOfRequestLogID: i,
    url: n.url,
    status: n.status,
    body: l,
    durationMs: Date.now() - s
  })), l;
}
function Jc(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("request-id"),
    enumerable: !1
  });
}
var _n, Wc = class Kc extends Promise {
  constructor(t, n, o = Oc) {
    super((i) => {
      i(null);
    }), this.responsePromise = n, this.parseResponse = o, _n.set(this, void 0), x(this, _n, t, "f");
  }
  _thenUnwrap(t) {
    return new Kc(v(this, _n, "f"), this.responsePromise, async (n, o) => Jc(t(await this.parseResponse(n, o), o), o.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(v(this, _n, "f"), t))), this.parsedPromise;
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
_n = /* @__PURE__ */ new WeakMap();
var On, Yc = class {
  constructor(e, t, n, o) {
    On.set(this, void 0), x(this, On, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new B("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await v(this, On, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(On = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, Ip = class extends Wc {
  constructor(e, t, n) {
    super(e, t, async (o, i) => new n(o, i.response, await Oc(o, i), i.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, Nn = class extends Yc {
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
          ...Hi(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...Hi(this.options.query),
        after_id: e
      }
    } : null;
  }
}, $e = class extends Yc {
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
        ...Hi(this.options.query),
        page: e
      }
    } : null;
  }
}, zc = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Pt(e, t, n) {
  return zc(), new File(e, t ?? "unknown_file", n);
}
function vo(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var Xc = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Gs = async (e, t, n = !0) => ({
  ...e,
  body: await Ap(e.body, t, n)
}), qr = /* @__PURE__ */ new WeakMap();
function Cp(e) {
  const t = typeof e == "function" ? e : e.fetch, n = qr.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const i = "Response" in t ? t.Response : (await t("data:,")).constructor, s = new FormData();
      return s.toString() !== await new i(s).text();
    } catch {
      return !0;
    }
  })();
  return qr.set(t, o), o;
}
var Ap = async (e, t, n = !0) => {
  if (!await Cp(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const o = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([i, s]) => Oi(o, i, s, n))), o;
}, Rp = (e) => e instanceof Blob && "name" in e, Oi = async (e, t, n, o) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let i = {};
      const s = n.headers.get("Content-Type");
      s && (i = { type: s }), e.append(t, Pt([await n.blob()], vo(n, o), i));
    } else if (Xc(n)) e.append(t, Pt([await new Response(Hc(n)).blob()], vo(n, o)));
    else if (Rp(n)) e.append(t, Pt([n], vo(n, o), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((i) => Oi(e, t + "[]", i, o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([i, s]) => Oi(e, `${t}[${i}]`, s, o)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, Qc = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", bp = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Qc(e), Pp = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function xp(e, t, n) {
  if (zc(), e = await e, t || (t = vo(e, !0)), bp(e))
    return e instanceof File && t == null && n == null ? e : Pt([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if (Pp(e)) {
    const i = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Pt(await Ji(i), t, n);
  }
  const o = await Ji(e);
  if (!n?.type) {
    const i = o.find((s) => typeof s == "object" && "type" in s && s.type);
    typeof i == "string" && (n = {
      ...n,
      type: i
    });
  }
  return Pt(o, t, n);
}
async function Ji(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (Qc(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Xc(e)) for await (const n of e) t.push(...await Ji(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${Mp(e)}`);
  }
  return t;
}
function Mp(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var j = class {
  constructor(e) {
    this._client = e;
  }
}, Zc = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* Np(e) {
  if (!e) return;
  if (Zc in e) {
    const { values: o, nulls: i } = e;
    yield* o.entries();
    for (const s of i) yield [s, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Mr(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const i = o[0];
    if (typeof i != "string") throw new TypeError("expected header name to be a string");
    const s = Mr(o[1]) ? o[1] : [o[1]];
    let l = !1;
    for (const u of s)
      u !== void 0 && (t && !l && (l = !0, yield [i, null]), yield [i, u]);
  }
}
var P = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const i = /* @__PURE__ */ new Set();
    for (const [s, l] of Np(o)) {
      const u = s.toLowerCase();
      i.has(u) || (t.delete(s), i.add(u)), l === null ? (t.delete(s), n.add(u)) : (t.append(s, l), n.delete(u));
    }
  }
  return {
    [Zc]: !0,
    values: t,
    nulls: n
  };
};
function jc(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Vr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), kp = (e = jc) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let i = !1;
  const s = [], l = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (i = !0);
    const m = o[p];
    let g = (i ? encodeURIComponent : e)("" + m);
    return p !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? Vr) ?? Vr)?.toString) && (g = m + "", s.push({
      start: h.length + f.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === o.length ? "" : g);
  }, ""), u = l.split(/[?#]/, 1)[0], c = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) s.push({
    start: d.index,
    length: d[0].length,
    error: `Value "${d[0]}" can't be safely passed as a path parameter`
  });
  if (s.sort((h, f) => h.start - f.start), s.length > 0) {
    let h = 0;
    const f = s.reduce((p, m) => {
      const g = " ".repeat(m.start - h), _ = "^".repeat(m.length);
      return h = m.start + m.length, p + g + _;
    }, "");
    throw new B(`Path parameters result in path with invalid segments:
${s.map((p) => p.error).join(`
`)}
${l}
${f}`);
  }
  return l;
}, G = /* @__PURE__ */ kp(jc), ed = class extends j {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/environments?beta=true", {
      body: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(G`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...i } = t;
    return this._client.post(G`/v1/environments/${e}?beta=true`, {
      body: i,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/environments?beta=true", $e, {
      query: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(G`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(G`/v1/environments/${e}/archive?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, wn = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function Eo(e) {
  return typeof e == "object" && e !== null && wn in e;
}
function td(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const o of e) Eo(o) && n.add(o[wn]);
  if (t) {
    for (const o of t)
      if (Eo(o) && n.add(o[wn]), Array.isArray(o.content))
        for (const i of o.content) Eo(i) && n.add(i[wn]);
  }
  return Array.from(n);
}
function nd(e, t) {
  const n = td(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function Dp(e) {
  return Eo(e) ? { "x-stainless-helper": e[wn] } : {};
}
var od = class extends j {
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/files", Nn, {
      query: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(G`/v1/files/${e}`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  download(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(G`/v1/files/${e}/content`, {
      ...n,
      headers: P([{
        "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      __binaryResponse: !0
    });
  }
  retrieveMetadata(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(G`/v1/files/${e}`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  upload(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/files", Gs({
      body: o,
      ...t,
      headers: P([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        Dp(o.file),
        t?.headers
      ])
    }, this._client));
  }
}, id = class extends j {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(G`/v1/models/${e}?beta=true`, {
      ...n,
      headers: P([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", Nn, {
      query: o,
      ...t,
      headers: P([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, sd = class extends j {
  list(e, t = {}, n) {
    const { betas: o, ...i } = t ?? {};
    return this._client.getAPIList(G`/v1/agents/${e}/versions?beta=true`, $e, {
      query: i,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Bs = class extends j {
  constructor() {
    super(...arguments), this.versions = new sd(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/agents?beta=true", {
      body: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o, ...i } = t ?? {};
    return this._client.get(G`/v1/agents/${e}?beta=true`, {
      query: i,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...i } = t;
    return this._client.post(G`/v1/agents/${e}?beta=true`, {
      body: i,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/agents?beta=true", $e, {
      query: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(G`/v1/agents/${e}/archive?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Bs.Versions = sd;
var rd = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};
function ad(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function Hr(e, t, n) {
  const o = ad(t);
  return !t || !("parse" in (o ?? {})) ? {
    ...e,
    content: e.content.map((i) => {
      if (i.type === "text") {
        const s = Object.defineProperty({ ...i }, "parsed_output", {
          value: null,
          enumerable: !1
        });
        return Object.defineProperty(s, "parsed", {
          get() {
            return n.logger.warn("The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead."), null;
          },
          enumerable: !1
        });
      }
      return i;
    }),
    parsed_output: null
  } : ld(e, t, n);
}
function ld(e, t, n) {
  let o = null;
  const i = e.content.map((s) => {
    if (s.type === "text") {
      const l = Lp(t, s.text);
      o === null && (o = l);
      const u = Object.defineProperty({ ...s }, "parsed_output", {
        value: l,
        enumerable: !1
      });
      return Object.defineProperty(u, "parsed", {
        get() {
          return n.logger.warn("The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead."), l;
        },
        enumerable: !1
      });
    }
    return s;
  });
  return {
    ...e,
    content: i,
    parsed_output: o
  };
}
function Lp(e, t) {
  const n = ad(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new B(`Failed to parse structured output: ${o}`);
  }
}
var Up = (e) => {
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
      let l = "", u = !1;
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
          l += o + e[t], o = e[++t];
        } else
          l += o, o = e[++t];
      }
      o = e[++t], u || n.push({
        type: "string",
        value: l
      });
      continue;
    }
    if (o && /\s/.test(o)) {
      t++;
      continue;
    }
    let i = /[0-9]/;
    if (o && i.test(o) || o === "-" || o === ".") {
      let l = "";
      for (o === "-" && (l += o, o = e[++t]); o && i.test(o) || o === "."; )
        l += o, o = e[++t];
      n.push({
        type: "number",
        value: l
      });
      continue;
    }
    let s = /[a-z]/i;
    if (o && s.test(o)) {
      let l = "";
      for (; o && s.test(o) && t !== e.length; )
        l += o, o = e[++t];
      if (l == "true" || l == "false" || l === "null") n.push({
        type: "name",
        value: l
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
}, Ct = (e) => {
  if (e.length === 0) return e;
  let t = e[e.length - 1];
  switch (t.type) {
    case "separator":
      return e = e.slice(0, e.length - 1), Ct(e);
    case "number":
      let n = t.value[t.value.length - 1];
      if (n === "." || n === "-")
        return e = e.slice(0, e.length - 1), Ct(e);
    case "string":
      let o = e[e.length - 2];
      if (o?.type === "delimiter")
        return e = e.slice(0, e.length - 1), Ct(e);
      if (o?.type === "brace" && o.value === "{")
        return e = e.slice(0, e.length - 1), Ct(e);
      break;
    case "delimiter":
      return e = e.slice(0, e.length - 1), Ct(e);
  }
  return e;
}, $p = (e) => {
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
}, Fp = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, ud = (e) => JSON.parse(Fp($p(Ct(Up(e))))), Se, Xe, yt, Vt, Jn, Ht, Ot, Wn, Jt, qe, Wt, Kn, Yn, ot, zn, Xn, Kt, di, Or, Qn, fi, hi, pi, Jr, Wr = "__json_buf";
function Kr(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var Gp = class Wi {
  constructor(t, n) {
    Se.add(this), this.messages = [], this.receivedMessages = [], Xe.set(this, void 0), yt.set(this, null), this.controller = new AbortController(), Vt.set(this, void 0), Jn.set(this, () => {
    }), Ht.set(this, () => {
    }), Ot.set(this, void 0), Wn.set(this, () => {
    }), Jt.set(this, () => {
    }), qe.set(this, {}), Wt.set(this, !1), Kn.set(this, !1), Yn.set(this, !1), ot.set(this, !1), zn.set(this, void 0), Xn.set(this, void 0), Kt.set(this, void 0), Qn.set(this, (o) => {
      if (x(this, Kn, !0, "f"), An(o) && (o = new xe()), o instanceof xe)
        return x(this, Yn, !0, "f"), this._emit("abort", o);
      if (o instanceof B) return this._emit("error", o);
      if (o instanceof Error) {
        const i = new B(o.message);
        return i.cause = o, this._emit("error", i);
      }
      return this._emit("error", new B(String(o)));
    }), x(this, Vt, new Promise((o, i) => {
      x(this, Jn, o, "f"), x(this, Ht, i, "f");
    }), "f"), x(this, Ot, new Promise((o, i) => {
      x(this, Wn, o, "f"), x(this, Jt, i, "f");
    }), "f"), v(this, Vt, "f").catch(() => {
    }), v(this, Ot, "f").catch(() => {
    }), x(this, yt, t, "f"), x(this, Kt, n?.logger ?? console, "f");
  }
  get response() {
    return v(this, zn, "f");
  }
  get request_id() {
    return v(this, Xn, "f");
  }
  async withResponse() {
    x(this, ot, !0, "f");
    const t = await v(this, Vt, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Wi(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, o, { logger: i } = {}) {
    const s = new Wi(n, { logger: i });
    for (const l of n.messages) s._addMessageParam(l);
    return x(s, yt, {
      ...n,
      stream: !0
    }, "f"), s._run(() => s._createMessage(t, {
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
  _run(t) {
    t().then(() => {
      this._emitFinal(), this._emit("end");
    }, v(this, Qn, "f"));
  }
  _addMessageParam(t) {
    this.messages.push(t);
  }
  _addMessage(t, n = !0) {
    this.receivedMessages.push(t), n && this._emit("message", t);
  }
  async _createMessage(t, n, o) {
    const i = o?.signal;
    let s;
    i && (i.aborted && this.controller.abort(), s = this.controller.abort.bind(this.controller), i.addEventListener("abort", s));
    try {
      v(this, Se, "m", fi).call(this);
      const { response: l, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(l);
      for await (const c of u) v(this, Se, "m", hi).call(this, c);
      if (u.controller.signal?.aborted) throw new xe();
      v(this, Se, "m", pi).call(this);
    } finally {
      i && s && i.removeEventListener("abort", s);
    }
  }
  _connected(t) {
    this.ended || (x(this, zn, t, "f"), x(this, Xn, t?.headers.get("request-id"), "f"), v(this, Jn, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return v(this, Wt, "f");
  }
  get errored() {
    return v(this, Kn, "f");
  }
  get aborted() {
    return v(this, Yn, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (v(this, qe, "f")[t] || (v(this, qe, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const o = v(this, qe, "f")[t];
    if (!o) return this;
    const i = o.findIndex((s) => s.listener === n);
    return i >= 0 && o.splice(i, 1), this;
  }
  once(t, n) {
    return (v(this, qe, "f")[t] || (v(this, qe, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      x(this, ot, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    x(this, ot, !0, "f"), await v(this, Ot, "f");
  }
  get currentMessage() {
    return v(this, Xe, "f");
  }
  async finalMessage() {
    return await this.done(), v(this, Se, "m", di).call(this);
  }
  async finalText() {
    return await this.done(), v(this, Se, "m", Or).call(this);
  }
  _emit(t, ...n) {
    if (v(this, Wt, "f")) return;
    t === "end" && (x(this, Wt, !0, "f"), v(this, Wn, "f").call(this));
    const o = v(this, qe, "f")[t];
    if (o && (v(this, qe, "f")[t] = o.filter((i) => !i.once), o.forEach(({ listener: i }) => i(...n))), t === "abort") {
      const i = n[0];
      !v(this, ot, "f") && !o?.length && Promise.reject(i), v(this, Ht, "f").call(this, i), v(this, Jt, "f").call(this, i), this._emit("end");
      return;
    }
    if (t === "error") {
      const i = n[0];
      !v(this, ot, "f") && !o?.length && Promise.reject(i), v(this, Ht, "f").call(this, i), v(this, Jt, "f").call(this, i), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", v(this, Se, "m", di).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let i;
    o && (o.aborted && this.controller.abort(), i = this.controller.abort.bind(this.controller), o.addEventListener("abort", i));
    try {
      v(this, Se, "m", fi).call(this), this._connected(null);
      const s = Rn.fromReadableStream(t, this.controller);
      for await (const l of s) v(this, Se, "m", hi).call(this, l);
      if (s.controller.signal?.aborted) throw new xe();
      v(this, Se, "m", pi).call(this);
    } finally {
      o && i && o.removeEventListener("abort", i);
    }
  }
  [(Xe = /* @__PURE__ */ new WeakMap(), yt = /* @__PURE__ */ new WeakMap(), Vt = /* @__PURE__ */ new WeakMap(), Jn = /* @__PURE__ */ new WeakMap(), Ht = /* @__PURE__ */ new WeakMap(), Ot = /* @__PURE__ */ new WeakMap(), Wn = /* @__PURE__ */ new WeakMap(), Jt = /* @__PURE__ */ new WeakMap(), qe = /* @__PURE__ */ new WeakMap(), Wt = /* @__PURE__ */ new WeakMap(), Kn = /* @__PURE__ */ new WeakMap(), Yn = /* @__PURE__ */ new WeakMap(), ot = /* @__PURE__ */ new WeakMap(), zn = /* @__PURE__ */ new WeakMap(), Xn = /* @__PURE__ */ new WeakMap(), Kt = /* @__PURE__ */ new WeakMap(), Qn = /* @__PURE__ */ new WeakMap(), Se = /* @__PURE__ */ new WeakSet(), di = function() {
    if (this.receivedMessages.length === 0) throw new B("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, Or = function() {
    if (this.receivedMessages.length === 0) throw new B("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new B("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, fi = function() {
    this.ended || x(this, Xe, void 0, "f");
  }, hi = function(n) {
    if (this.ended) return;
    const o = v(this, Se, "m", Jr).call(this, n);
    switch (this._emit("streamEvent", n, o), n.type) {
      case "content_block_delta": {
        const i = o.content.at(-1);
        switch (n.delta.type) {
          case "text_delta":
            i.type === "text" && this._emit("text", n.delta.text, i.text || "");
            break;
          case "citations_delta":
            i.type === "text" && this._emit("citation", n.delta.citation, i.citations ?? []);
            break;
          case "input_json_delta":
            Kr(i) && i.input && this._emit("inputJson", n.delta.partial_json, i.input);
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
        this._addMessageParam(o), this._addMessage(Hr(o, v(this, yt, "f"), { logger: v(this, Kt, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        x(this, Xe, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, pi = function() {
    if (this.ended) throw new B("stream has ended, this shouldn't happen");
    const n = v(this, Xe, "f");
    if (!n) throw new B("request ended without sending any chunks");
    return x(this, Xe, void 0, "f"), Hr(n, v(this, yt, "f"), { logger: v(this, Kt, "f") });
  }, Jr = function(n) {
    let o = v(this, Xe, "f");
    if (n.type === "message_start") {
      if (o) throw new B(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!o) throw new B(`Unexpected event order, got ${n.type} before "message_start"`);
    switch (n.type) {
      case "message_stop":
        return o;
      case "message_delta":
        return o.container = n.delta.container, o.stop_reason = n.delta.stop_reason, o.stop_sequence = n.delta.stop_sequence, o.usage.output_tokens = n.usage.output_tokens, o.context_management = n.context_management, n.usage.input_tokens != null && (o.usage.input_tokens = n.usage.input_tokens), n.usage.cache_creation_input_tokens != null && (o.usage.cache_creation_input_tokens = n.usage.cache_creation_input_tokens), n.usage.cache_read_input_tokens != null && (o.usage.cache_read_input_tokens = n.usage.cache_read_input_tokens), n.usage.server_tool_use != null && (o.usage.server_tool_use = n.usage.server_tool_use), n.usage.iterations != null && (o.usage.iterations = n.usage.iterations), o;
      case "content_block_start":
        return o.content.push(n.content_block), o;
      case "content_block_delta": {
        const i = o.content.at(n.index);
        switch (n.delta.type) {
          case "text_delta":
            i?.type === "text" && (o.content[n.index] = {
              ...i,
              text: (i.text || "") + n.delta.text
            });
            break;
          case "citations_delta":
            i?.type === "text" && (o.content[n.index] = {
              ...i,
              citations: [...i.citations ?? [], n.delta.citation]
            });
            break;
          case "input_json_delta":
            if (i && Kr(i)) {
              let s = i[Wr] || "";
              s += n.delta.partial_json;
              const l = { ...i };
              if (Object.defineProperty(l, Wr, {
                value: s,
                enumerable: !1,
                writable: !0
              }), s) try {
                l.input = ud(s);
              } catch (u) {
                const c = new B(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${s}`);
                v(this, Qn, "f").call(this, c);
              }
              o.content[n.index] = l;
            }
            break;
          case "thinking_delta":
            i?.type === "thinking" && (o.content[n.index] = {
              ...i,
              thinking: i.thinking + n.delta.thinking
            });
            break;
          case "signature_delta":
            i?.type === "thinking" && (o.content[n.index] = {
              ...i,
              signature: n.delta.signature
            });
            break;
          case "compaction_delta":
            i?.type === "compaction" && (o.content[n.index] = {
              ...i,
              content: (i.content || "") + n.delta.content
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
    return this.on("streamEvent", (i) => {
      const s = n.shift();
      s ? s.resolve(i) : t.push(i);
    }), this.on("end", () => {
      o = !0;
      for (const i of n) i.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (i) => {
      o = !0;
      for (const s of n) s.reject(i);
      n.length = 0;
    }), this.on("error", (i) => {
      o = !0;
      for (const s of n) s.reject(i);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : o ? {
        value: void 0,
        done: !0
      } : new Promise((i, s) => n.push({
        resolve: i,
        reject: s
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
    return new Rn(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
var cd = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var Bp = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
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
Wrap your summary in <summary></summary> tags.`, Yt, vt, it, Q, fe, me, Oe, Qe, zt, Yr, Ki;
function zr() {
  let e, t;
  return {
    promise: new Promise((n, o) => {
      e = n, t = o;
    }),
    resolve: e,
    reject: t
  };
}
var dd = class {
  constructor(e, t, n) {
    Yt.add(this), this.client = e, vt.set(this, !1), it.set(this, !1), Q.set(this, void 0), fe.set(this, void 0), me.set(this, void 0), Oe.set(this, void 0), Qe.set(this, void 0), zt.set(this, 0), x(this, Q, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const o = ["BetaToolRunner", ...td(t.tools, t.messages)].join(", ");
    x(this, fe, {
      ...n,
      headers: P([{ "x-stainless-helper": o }, n?.headers])
    }, "f"), x(this, Qe, zr(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(vt = /* @__PURE__ */ new WeakMap(), it = /* @__PURE__ */ new WeakMap(), Q = /* @__PURE__ */ new WeakMap(), fe = /* @__PURE__ */ new WeakMap(), me = /* @__PURE__ */ new WeakMap(), Oe = /* @__PURE__ */ new WeakMap(), Qe = /* @__PURE__ */ new WeakMap(), zt = /* @__PURE__ */ new WeakMap(), Yt = /* @__PURE__ */ new WeakSet(), Yr = async function() {
    const t = v(this, Q, "f").params.compactionControl;
    if (!t || !t.enabled) return !1;
    let n = 0;
    if (v(this, me, "f") !== void 0) try {
      const c = await v(this, me, "f");
      n = c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0) + c.usage.output_tokens;
    } catch {
      return !1;
    }
    const o = t.contextTokenThreshold ?? 1e5;
    if (n < o) return !1;
    const i = t.model ?? v(this, Q, "f").params.model, s = t.summaryPrompt ?? Bp, l = v(this, Q, "f").params.messages;
    if (l[l.length - 1].role === "assistant") {
      const c = l[l.length - 1];
      if (Array.isArray(c.content)) {
        const d = c.content.filter((h) => h.type !== "tool_use");
        d.length === 0 ? l.pop() : c.content = d;
      }
    }
    const u = await this.client.beta.messages.create({
      model: i,
      messages: [...l, {
        role: "user",
        content: [{
          type: "text",
          text: s
        }]
      }],
      max_tokens: v(this, Q, "f").params.max_tokens
    }, {
      signal: v(this, fe, "f").signal,
      headers: P([v(this, fe, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (u.content[0]?.type !== "text") throw new B("Expected text response for compaction");
    return v(this, Q, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (v(this, vt, "f")) throw new B("Cannot iterate over a consumed stream");
    x(this, vt, !0, "f"), x(this, it, !0, "f"), x(this, Oe, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (v(this, Q, "f").params.max_iterations && v(this, zt, "f") >= v(this, Q, "f").params.max_iterations) break;
          x(this, it, !1, "f"), x(this, Oe, void 0, "f"), x(this, zt, (e = v(this, zt, "f"), e++, e), "f"), x(this, me, void 0, "f");
          const { max_iterations: n, compactionControl: o, ...i } = v(this, Q, "f").params;
          if (i.stream ? (t = this.client.beta.messages.stream({ ...i }, v(this, fe, "f")), x(this, me, t.finalMessage(), "f"), v(this, me, "f").catch(() => {
          }), yield t) : (x(this, me, this.client.beta.messages.create({
            ...i,
            stream: !1
          }, v(this, fe, "f")), "f"), yield v(this, me, "f")), !await v(this, Yt, "m", Yr).call(this)) {
            if (!v(this, it, "f")) {
              const { role: l, content: u } = await v(this, me, "f");
              v(this, Q, "f").params.messages.push({
                role: l,
                content: u
              });
            }
            const s = await v(this, Yt, "m", Ki).call(this, v(this, Q, "f").params.messages.at(-1));
            if (s) v(this, Q, "f").params.messages.push(s);
            else if (!v(this, it, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!v(this, me, "f")) throw new B("ToolRunner concluded without a message from the server");
      v(this, Qe, "f").resolve(await v(this, me, "f"));
    } catch (t) {
      throw x(this, vt, !1, "f"), v(this, Qe, "f").promise.catch(() => {
      }), v(this, Qe, "f").reject(t), x(this, Qe, zr(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? v(this, Q, "f").params = e(v(this, Q, "f").params) : v(this, Q, "f").params = e, x(this, it, !0, "f"), x(this, Oe, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? x(this, fe, e(v(this, fe, "f")), "f") : x(this, fe, {
      ...v(this, fe, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = v(this, fe, "f").signal) {
    const t = await v(this, me, "f") ?? this.params.messages.at(-1);
    return t ? v(this, Yt, "m", Ki).call(this, t, e) : null;
  }
  done() {
    return v(this, Qe, "f").promise;
  }
  async runUntilDone() {
    if (!v(this, vt, "f")) for await (const e of this) ;
    return this.done();
  }
  get params() {
    return v(this, Q, "f").params;
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
Ki = async function(t, n = v(this, fe, "f").signal) {
  return v(this, Oe, "f") !== void 0 ? v(this, Oe, "f") : (x(this, Oe, qp(v(this, Q, "f").params, t, {
    ...v(this, fe, "f"),
    signal: n
  }), "f"), v(this, Oe, "f"));
};
async function qp(e, t = e.messages.at(-1), n) {
  if (!t || t.role !== "assistant" || !t.content || typeof t.content == "string") return null;
  const o = t.content.filter((i) => i.type === "tool_use");
  return o.length === 0 ? null : {
    role: "user",
    content: await Promise.all(o.map(async (i) => {
      const s = e.tools.find((l) => ("name" in l ? l.name : l.mcp_server_name) === i.name);
      if (!s || !("run" in s)) return {
        type: "tool_result",
        tool_use_id: i.id,
        content: `Error: Tool '${i.name}' not found`,
        is_error: !0
      };
      try {
        let l = i.input;
        "parse" in s && s.parse && (l = s.parse(l));
        const u = await s.run(l, {
          toolUseBlock: i,
          signal: n?.signal
        });
        return {
          type: "tool_result",
          tool_use_id: i.id,
          content: u
        };
      } catch (l) {
        return {
          type: "tool_result",
          tool_use_id: i.id,
          content: l instanceof cd ? l.content : `Error: ${l instanceof Error ? l.message : String(l)}`,
          is_error: !0
        };
      }
    }))
  };
}
var fd = class hd {
  constructor(t, n) {
    this.iterator = t, this.controller = n;
  }
  async *decoder() {
    const t = new Mn();
    for await (const n of this.iterator) for (const o of t.decode(n)) yield JSON.parse(o);
    for (const n of t.flush()) yield JSON.parse(n);
  }
  [Symbol.asyncIterator]() {
    return this.decoder();
  }
  static fromResponse(t, n) {
    if (!t.body)
      throw n.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new B("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new B("Attempted to iterate over a response with no body");
    return new hd($s(t.body), n);
  }
}, pd = class extends j {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/messages/batches?beta=true", {
      body: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(G`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/messages/batches?beta=true", Nn, {
      query: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(G`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  cancel(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(G`/v1/messages/batches/${e}/cancel?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  async results(e, t = {}, n) {
    const o = await this.retrieve(e);
    if (!o.results_url) throw new B(`No batch \`results_url\`; Has it finished processing? ${o.processing_status} - ${o.id}`);
    const { betas: i } = t ?? {};
    return this._client.get(o.results_url, {
      ...n,
      headers: P([{
        "anthropic-beta": [...i ?? [], "message-batches-2024-09-24"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((s, l) => fd.fromResponse(l.response, l.controller));
  }
}, Xr = {
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
}, Vp = ["claude-opus-4-6"], kn = class extends j {
  constructor() {
    super(...arguments), this.batches = new pd(this._client);
  }
  create(e, t) {
    const n = Qr(e), { betas: o, ...i } = n;
    i.model in Xr && console.warn(`The model '${i.model}' is deprecated and will reach end-of-life on ${Xr[i.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), i.model in Vp && i.thinking && i.thinking.type === "enabled" && console.warn(`Using Claude with ${i.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let s = this._client._options.timeout;
    if (!i.stream && s == null) {
      const u = rd[i.model] ?? void 0;
      s = this._client.calculateNonstreamingTimeout(i.max_tokens, u);
    }
    const l = nd(i.tools, i.messages);
    return this._client.post("/v1/messages?beta=true", {
      body: i,
      timeout: s ?? 6e5,
      ...t,
      headers: P([
        { ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 },
        l,
        t?.headers
      ]),
      stream: n.stream ?? !1
    });
  }
  parse(e, t) {
    return t = {
      ...t,
      headers: P([{ "anthropic-beta": [...e.betas ?? [], "structured-outputs-2025-12-15"].toString() }, t?.headers])
    }, this.create(e, t).then((n) => ld(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Gp.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...o } = Qr(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new dd(this._client, e, t);
  }
};
function Qr(e) {
  if (!e.output_format) return e;
  if (e.output_config?.format) throw new B("Both output_format and output_config.format were provided. Please use only output_config.format (output_format is deprecated).");
  const { output_format: t, ...n } = e;
  return {
    ...n,
    output_config: {
      ...e.output_config,
      format: t
    }
  };
}
kn.Batches = pd;
kn.BetaToolRunner = dd;
kn.ToolError = cd;
var md = class extends j {
  list(e, t = {}, n) {
    const { betas: o, ...i } = t ?? {};
    return this._client.getAPIList(G`/v1/sessions/${e}/events?beta=true`, $e, {
      query: i,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  send(e, t, n) {
    const { betas: o, ...i } = t;
    return this._client.post(G`/v1/sessions/${e}/events?beta=true`, {
      body: i,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  stream(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(G`/v1/sessions/${e}/events/stream?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers]),
      stream: !0
    });
  }
}, gd = class extends j {
  retrieve(e, t, n) {
    const { session_id: o, betas: i } = t;
    return this._client.get(G`/v1/sessions/${o}/resources/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { session_id: o, betas: i, ...s } = t;
    return this._client.post(G`/v1/sessions/${o}/resources/${e}?beta=true`, {
      body: s,
      ...n,
      headers: P([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...i } = t ?? {};
    return this._client.getAPIList(G`/v1/sessions/${e}/resources?beta=true`, $e, {
      query: i,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { session_id: o, betas: i } = t;
    return this._client.delete(G`/v1/sessions/${o}/resources/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  add(e, t, n) {
    const { betas: o, ...i } = t;
    return this._client.post(G`/v1/sessions/${e}/resources?beta=true`, {
      body: i,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Xo = class extends j {
  constructor() {
    super(...arguments), this.events = new md(this._client), this.resources = new gd(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/sessions?beta=true", {
      body: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(G`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...i } = t;
    return this._client.post(G`/v1/sessions/${e}?beta=true`, {
      body: i,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/sessions?beta=true", $e, {
      query: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(G`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(G`/v1/sessions/${e}/archive?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Xo.Events = md;
Xo.Resources = gd;
var _d = class extends j {
  create(e, t = {}, n) {
    const { betas: o, ...i } = t ?? {};
    return this._client.post(G`/v1/skills/${e}/versions?beta=true`, Gs({
      body: i,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: o, betas: i } = t;
    return this._client.get(G`/v1/skills/${o}/versions/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...i ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...i } = t ?? {};
    return this._client.getAPIList(G`/v1/skills/${e}/versions?beta=true`, $e, {
      query: i,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { skill_id: o, betas: i } = t;
    return this._client.delete(G`/v1/skills/${o}/versions/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...i ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
}, qs = class extends j {
  constructor() {
    super(...arguments), this.versions = new _d(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.post("/v1/skills?beta=true", Gs({
      body: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    }, this._client, !1));
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(G`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/skills?beta=true", $e, {
      query: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(G`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
};
qs.Versions = _d;
var yd = class extends j {
  create(e, t, n) {
    const { betas: o, ...i } = t;
    return this._client.post(G`/v1/vaults/${e}/credentials?beta=true`, {
      body: i,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vault_id: o, betas: i } = t;
    return this._client.get(G`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vault_id: o, betas: i, ...s } = t;
    return this._client.post(G`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      body: s,
      ...n,
      headers: P([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...i } = t ?? {};
    return this._client.getAPIList(G`/v1/vaults/${e}/credentials?beta=true`, $e, {
      query: i,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vault_id: o, betas: i } = t;
    return this._client.delete(G`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t, n) {
    const { vault_id: o, betas: i } = t;
    return this._client.post(G`/v1/vaults/${o}/credentials/${e}/archive?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Vs = class extends j {
  constructor() {
    super(...arguments), this.credentials = new yd(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/vaults?beta=true", {
      body: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(G`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...i } = t;
    return this._client.post(G`/v1/vaults/${e}?beta=true`, {
      body: i,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/vaults?beta=true", $e, {
      query: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(G`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(G`/v1/vaults/${e}/archive?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Vs.Credentials = yd;
var Fe = class extends j {
  constructor() {
    super(...arguments), this.models = new id(this._client), this.messages = new kn(this._client), this.agents = new Bs(this._client), this.environments = new ed(this._client), this.sessions = new Xo(this._client), this.vaults = new Vs(this._client), this.files = new od(this._client), this.skills = new qs(this._client);
  }
};
Fe.Models = id;
Fe.Messages = kn;
Fe.Agents = Bs;
Fe.Environments = ed;
Fe.Sessions = Xo;
Fe.Vaults = Vs;
Fe.Files = od;
Fe.Skills = qs;
var vd = class extends j {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/complete", {
      body: o,
      timeout: this._client._options.timeout ?? 6e5,
      ...t,
      headers: P([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers]),
      stream: e.stream ?? !1
    });
  }
};
function Ed(e) {
  return e?.output_config?.format;
}
function Zr(e, t, n) {
  const o = Ed(t);
  return !t || !("parse" in (o ?? {})) ? {
    ...e,
    content: e.content.map((i) => i.type === "text" ? Object.defineProperty({ ...i }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : i),
    parsed_output: null
  } : Td(e, t, n);
}
function Td(e, t, n) {
  let o = null;
  const i = e.content.map((s) => {
    if (s.type === "text") {
      const l = Hp(t, s.text);
      return o === null && (o = l), Object.defineProperty({ ...s }, "parsed_output", {
        value: l,
        enumerable: !1
      });
    }
    return s;
  });
  return {
    ...e,
    content: i,
    parsed_output: o
  };
}
function Hp(e, t) {
  const n = Ed(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new B(`Failed to parse structured output: ${o}`);
  }
}
var we, Ze, Et, Xt, Zn, Qt, Zt, jn, jt, Ve, en, eo, to, st, no, oo, tn, mi, jr, gi, _i, yi, vi, ea, ta = "__json_buf";
function na(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var Op = class Yi {
  constructor(t, n) {
    we.add(this), this.messages = [], this.receivedMessages = [], Ze.set(this, void 0), Et.set(this, null), this.controller = new AbortController(), Xt.set(this, void 0), Zn.set(this, () => {
    }), Qt.set(this, () => {
    }), Zt.set(this, void 0), jn.set(this, () => {
    }), jt.set(this, () => {
    }), Ve.set(this, {}), en.set(this, !1), eo.set(this, !1), to.set(this, !1), st.set(this, !1), no.set(this, void 0), oo.set(this, void 0), tn.set(this, void 0), gi.set(this, (o) => {
      if (x(this, eo, !0, "f"), An(o) && (o = new xe()), o instanceof xe)
        return x(this, to, !0, "f"), this._emit("abort", o);
      if (o instanceof B) return this._emit("error", o);
      if (o instanceof Error) {
        const i = new B(o.message);
        return i.cause = o, this._emit("error", i);
      }
      return this._emit("error", new B(String(o)));
    }), x(this, Xt, new Promise((o, i) => {
      x(this, Zn, o, "f"), x(this, Qt, i, "f");
    }), "f"), x(this, Zt, new Promise((o, i) => {
      x(this, jn, o, "f"), x(this, jt, i, "f");
    }), "f"), v(this, Xt, "f").catch(() => {
    }), v(this, Zt, "f").catch(() => {
    }), x(this, Et, t, "f"), x(this, tn, n?.logger ?? console, "f");
  }
  get response() {
    return v(this, no, "f");
  }
  get request_id() {
    return v(this, oo, "f");
  }
  async withResponse() {
    x(this, st, !0, "f");
    const t = await v(this, Xt, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Yi(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, o, { logger: i } = {}) {
    const s = new Yi(n, { logger: i });
    for (const l of n.messages) s._addMessageParam(l);
    return x(s, Et, {
      ...n,
      stream: !0
    }, "f"), s._run(() => s._createMessage(t, {
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
  _run(t) {
    t().then(() => {
      this._emitFinal(), this._emit("end");
    }, v(this, gi, "f"));
  }
  _addMessageParam(t) {
    this.messages.push(t);
  }
  _addMessage(t, n = !0) {
    this.receivedMessages.push(t), n && this._emit("message", t);
  }
  async _createMessage(t, n, o) {
    const i = o?.signal;
    let s;
    i && (i.aborted && this.controller.abort(), s = this.controller.abort.bind(this.controller), i.addEventListener("abort", s));
    try {
      v(this, we, "m", _i).call(this);
      const { response: l, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(l);
      for await (const c of u) v(this, we, "m", yi).call(this, c);
      if (u.controller.signal?.aborted) throw new xe();
      v(this, we, "m", vi).call(this);
    } finally {
      i && s && i.removeEventListener("abort", s);
    }
  }
  _connected(t) {
    this.ended || (x(this, no, t, "f"), x(this, oo, t?.headers.get("request-id"), "f"), v(this, Zn, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return v(this, en, "f");
  }
  get errored() {
    return v(this, eo, "f");
  }
  get aborted() {
    return v(this, to, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (v(this, Ve, "f")[t] || (v(this, Ve, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const o = v(this, Ve, "f")[t];
    if (!o) return this;
    const i = o.findIndex((s) => s.listener === n);
    return i >= 0 && o.splice(i, 1), this;
  }
  once(t, n) {
    return (v(this, Ve, "f")[t] || (v(this, Ve, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      x(this, st, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    x(this, st, !0, "f"), await v(this, Zt, "f");
  }
  get currentMessage() {
    return v(this, Ze, "f");
  }
  async finalMessage() {
    return await this.done(), v(this, we, "m", mi).call(this);
  }
  async finalText() {
    return await this.done(), v(this, we, "m", jr).call(this);
  }
  _emit(t, ...n) {
    if (v(this, en, "f")) return;
    t === "end" && (x(this, en, !0, "f"), v(this, jn, "f").call(this));
    const o = v(this, Ve, "f")[t];
    if (o && (v(this, Ve, "f")[t] = o.filter((i) => !i.once), o.forEach(({ listener: i }) => i(...n))), t === "abort") {
      const i = n[0];
      !v(this, st, "f") && !o?.length && Promise.reject(i), v(this, Qt, "f").call(this, i), v(this, jt, "f").call(this, i), this._emit("end");
      return;
    }
    if (t === "error") {
      const i = n[0];
      !v(this, st, "f") && !o?.length && Promise.reject(i), v(this, Qt, "f").call(this, i), v(this, jt, "f").call(this, i), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", v(this, we, "m", mi).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let i;
    o && (o.aborted && this.controller.abort(), i = this.controller.abort.bind(this.controller), o.addEventListener("abort", i));
    try {
      v(this, we, "m", _i).call(this), this._connected(null);
      const s = Rn.fromReadableStream(t, this.controller);
      for await (const l of s) v(this, we, "m", yi).call(this, l);
      if (s.controller.signal?.aborted) throw new xe();
      v(this, we, "m", vi).call(this);
    } finally {
      o && i && o.removeEventListener("abort", i);
    }
  }
  [(Ze = /* @__PURE__ */ new WeakMap(), Et = /* @__PURE__ */ new WeakMap(), Xt = /* @__PURE__ */ new WeakMap(), Zn = /* @__PURE__ */ new WeakMap(), Qt = /* @__PURE__ */ new WeakMap(), Zt = /* @__PURE__ */ new WeakMap(), jn = /* @__PURE__ */ new WeakMap(), jt = /* @__PURE__ */ new WeakMap(), Ve = /* @__PURE__ */ new WeakMap(), en = /* @__PURE__ */ new WeakMap(), eo = /* @__PURE__ */ new WeakMap(), to = /* @__PURE__ */ new WeakMap(), st = /* @__PURE__ */ new WeakMap(), no = /* @__PURE__ */ new WeakMap(), oo = /* @__PURE__ */ new WeakMap(), tn = /* @__PURE__ */ new WeakMap(), gi = /* @__PURE__ */ new WeakMap(), we = /* @__PURE__ */ new WeakSet(), mi = function() {
    if (this.receivedMessages.length === 0) throw new B("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, jr = function() {
    if (this.receivedMessages.length === 0) throw new B("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new B("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, _i = function() {
    this.ended || x(this, Ze, void 0, "f");
  }, yi = function(n) {
    if (this.ended) return;
    const o = v(this, we, "m", ea).call(this, n);
    switch (this._emit("streamEvent", n, o), n.type) {
      case "content_block_delta": {
        const i = o.content.at(-1);
        switch (n.delta.type) {
          case "text_delta":
            i.type === "text" && this._emit("text", n.delta.text, i.text || "");
            break;
          case "citations_delta":
            i.type === "text" && this._emit("citation", n.delta.citation, i.citations ?? []);
            break;
          case "input_json_delta":
            na(i) && i.input && this._emit("inputJson", n.delta.partial_json, i.input);
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
        this._addMessageParam(o), this._addMessage(Zr(o, v(this, Et, "f"), { logger: v(this, tn, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        x(this, Ze, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, vi = function() {
    if (this.ended) throw new B("stream has ended, this shouldn't happen");
    const n = v(this, Ze, "f");
    if (!n) throw new B("request ended without sending any chunks");
    return x(this, Ze, void 0, "f"), Zr(n, v(this, Et, "f"), { logger: v(this, tn, "f") });
  }, ea = function(n) {
    let o = v(this, Ze, "f");
    if (n.type === "message_start") {
      if (o) throw new B(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!o) throw new B(`Unexpected event order, got ${n.type} before "message_start"`);
    switch (n.type) {
      case "message_stop":
        return o;
      case "message_delta":
        return o.stop_reason = n.delta.stop_reason, o.stop_sequence = n.delta.stop_sequence, o.usage.output_tokens = n.usage.output_tokens, n.usage.input_tokens != null && (o.usage.input_tokens = n.usage.input_tokens), n.usage.cache_creation_input_tokens != null && (o.usage.cache_creation_input_tokens = n.usage.cache_creation_input_tokens), n.usage.cache_read_input_tokens != null && (o.usage.cache_read_input_tokens = n.usage.cache_read_input_tokens), n.usage.server_tool_use != null && (o.usage.server_tool_use = n.usage.server_tool_use), o;
      case "content_block_start":
        return o.content.push({ ...n.content_block }), o;
      case "content_block_delta": {
        const i = o.content.at(n.index);
        switch (n.delta.type) {
          case "text_delta":
            i?.type === "text" && (o.content[n.index] = {
              ...i,
              text: (i.text || "") + n.delta.text
            });
            break;
          case "citations_delta":
            i?.type === "text" && (o.content[n.index] = {
              ...i,
              citations: [...i.citations ?? [], n.delta.citation]
            });
            break;
          case "input_json_delta":
            if (i && na(i)) {
              let s = i[ta] || "";
              s += n.delta.partial_json;
              const l = { ...i };
              Object.defineProperty(l, ta, {
                value: s,
                enumerable: !1,
                writable: !0
              }), s && (l.input = ud(s)), o.content[n.index] = l;
            }
            break;
          case "thinking_delta":
            i?.type === "thinking" && (o.content[n.index] = {
              ...i,
              thinking: i.thinking + n.delta.thinking
            });
            break;
          case "signature_delta":
            i?.type === "thinking" && (o.content[n.index] = {
              ...i,
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
    return this.on("streamEvent", (i) => {
      const s = n.shift();
      s ? s.resolve(i) : t.push(i);
    }), this.on("end", () => {
      o = !0;
      for (const i of n) i.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (i) => {
      o = !0;
      for (const s of n) s.reject(i);
      n.length = 0;
    }), this.on("error", (i) => {
      o = !0;
      for (const s of n) s.reject(i);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : o ? {
        value: void 0,
        done: !0
      } : new Promise((i, s) => n.push({
        resolve: i,
        reject: s
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
    return new Rn(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
var Sd = class extends j {
  create(e, t) {
    return this._client.post("/v1/messages/batches", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(G`/v1/messages/batches/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/v1/messages/batches", Nn, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(G`/v1/messages/batches/${e}`, t);
  }
  cancel(e, t) {
    return this._client.post(G`/v1/messages/batches/${e}/cancel`, t);
  }
  async results(e, t) {
    const n = await this.retrieve(e);
    if (!n.results_url) throw new B(`No batch \`results_url\`; Has it finished processing? ${n.processing_status} - ${n.id}`);
    return this._client.get(n.results_url, {
      ...t,
      headers: P([{ Accept: "application/binary" }, t?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((o, i) => fd.fromResponse(i.response, i.controller));
  }
}, Hs = class extends j {
  constructor() {
    super(...arguments), this.batches = new Sd(this._client);
  }
  create(e, t) {
    e.model in oa && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${oa[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), e.model in Jp && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const i = rd[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, i);
    }
    const o = nd(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: P([o, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => Td(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Op.createMessage(this, e, t, { logger: this._client.logger ?? console });
  }
  countTokens(e, t) {
    return this._client.post("/v1/messages/count_tokens", {
      body: e,
      ...t
    });
  }
}, oa = {
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
}, Jp = ["claude-opus-4-6"];
Hs.Batches = Sd;
var wd = class extends j {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(G`/v1/models/${e}`, {
      ...n,
      headers: P([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models", Nn, {
      query: o,
      ...t,
      headers: P([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, io = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, zi, Os, To, Id, Wp = "\\n\\nHuman:", Kp = "\\n\\nAssistant:", z = class {
  constructor({ baseURL: e = io("ANTHROPIC_BASE_URL"), apiKey: t = io("ANTHROPIC_API_KEY") ?? null, authToken: n = io("ANTHROPIC_AUTH_TOKEN") ?? null, ...o } = {}) {
    zi.add(this), To.set(this, void 0);
    const i = {
      apiKey: t,
      authToken: n,
      ...o,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!i.dangerouslyAllowBrowser && ap()) throw new B(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = i.baseURL, this.timeout = i.timeout ?? Os.DEFAULT_TIMEOUT, this.logger = i.logger ?? console;
    const s = "warn";
    this.logLevel = s, this.logLevel = Gr(i.logLevel, "ClientOptions.logLevel", this) ?? Gr(io("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? s, this.fetchOptions = i.fetchOptions, this.maxRetries = i.maxRetries ?? 2, this.fetch = i.fetch ?? fp(), x(this, To, pp, "f"), this._options = i, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
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
    return P([await this.apiKeyAuth(e), await this.bearerAuth(e)]);
  }
  async apiKeyAuth(e) {
    if (this.apiKey != null)
      return P([{ "X-Api-Key": this.apiKey }]);
  }
  async bearerAuth(e) {
    if (this.authToken != null)
      return P([{ Authorization: `Bearer ${this.authToken}` }]);
  }
  stringifyQuery(e) {
    return mp(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${It}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Mc()}`;
  }
  makeStatusError(e, t, n, o) {
    return Te.generate(e, t, n, o);
  }
  buildURL(e, t, n) {
    const o = !v(this, zi, "m", Id).call(this) && n || this.baseURL, i = op(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), s = this.defaultQuery(), l = Object.fromEntries(i.searchParams);
    return (!Nr(s) || !Nr(l)) && (t = {
      ...l,
      ...s,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (i.search = this.stringifyQuery(t)), i.toString();
  }
  _calculateNonstreamingTimeout(e) {
    if (3600 * e / 128e3 > 600) throw new B("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#streaming-responses for more details");
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
    return new Wc(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const o = await e, i = o.maxRetries ?? this.maxRetries;
    t == null && (t = i), await this.prepareOptions(o);
    const { req: s, url: l, timeout: u } = await this.buildRequest(o, { retryCount: i - t });
    await this.prepareRequest(s, {
      url: l,
      options: o
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, h = Date.now();
    if (ue(this).debug(`[${c}] sending request`, at({
      retryOfRequestLogID: n,
      method: o.method,
      url: l,
      options: o,
      headers: s.headers
    })), o.signal?.aborted) throw new xe();
    const f = new AbortController(), p = await this.fetchWithTimeout(l, s, u, f).catch(Bi), m = Date.now();
    if (p instanceof globalThis.Error) {
      const _ = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new xe();
      const y = An(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (t)
        return ue(this).info(`[${c}] connection ${y ? "timed out" : "failed"} - ${_}`), ue(this).debug(`[${c}] connection ${y ? "timed out" : "failed"} (${_})`, at({
          retryOfRequestLogID: n,
          url: l,
          durationMs: m - h,
          message: p.message
        })), this.retryRequest(o, t, n ?? c);
      throw ue(this).info(`[${c}] connection ${y ? "timed out" : "failed"} - error; no more retries left`), ue(this).debug(`[${c}] connection ${y ? "timed out" : "failed"} (error; no more retries left)`, at({
        retryOfRequestLogID: n,
        url: l,
        durationMs: m - h,
        message: p.message
      })), y ? new Nc() : new zo({ cause: p });
    }
    const g = `[${c}${d}${[...p.headers.entries()].filter(([_]) => _ === "request-id").map(([_, y]) => ", " + _ + ": " + JSON.stringify(y)).join("")}] ${s.method} ${l} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - h}ms`;
    if (!p.ok) {
      const _ = await this.shouldRetry(p);
      if (t && _) {
        const R = `retrying, ${t} attempts remaining`;
        return await hp(p.body), ue(this).info(`${g} - ${R}`), ue(this).debug(`[${c}] response error (${R})`, at({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: m - h
        })), this.retryRequest(o, t, n ?? c, p.headers);
      }
      const y = _ ? "error; no more retries left" : "error; not retryable";
      ue(this).info(`${g} - ${y}`);
      const I = await p.text().catch((R) => Bi(R).message), S = qc(I), A = S ? void 0 : I;
      throw ue(this).debug(`[${c}] response error (${y})`, at({
        retryOfRequestLogID: n,
        url: p.url,
        status: p.status,
        headers: p.headers,
        message: A,
        durationMs: Date.now() - h
      })), this.makeStatusError(p.status, S, A, p.headers);
    }
    return ue(this).info(g), ue(this).debug(`[${c}] response start`, at({
      retryOfRequestLogID: n,
      url: p.url,
      status: p.status,
      headers: p.headers,
      durationMs: m - h
    })), {
      response: p,
      options: o,
      controller: f,
      requestLogID: c,
      retryOfRequestLogID: n,
      startTime: h
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
    return new Ip(this, n, e);
  }
  async fetchWithTimeout(e, t, n, o) {
    const { signal: i, method: s, ...l } = t || {}, u = this._makeAbort(o);
    i && i.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && l.body instanceof globalThis.ReadableStream || typeof l.body == "object" && l.body !== null && Symbol.asyncIterator in l.body, h = {
      signal: o.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...l
    };
    s && (h.method = s.toUpperCase());
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
  async retryRequest(e, t, n, o) {
    let i;
    const s = o?.get("retry-after-ms");
    if (s) {
      const u = parseFloat(s);
      Number.isNaN(u) || (i = u);
    }
    const l = o?.get("retry-after");
    if (l && !i) {
      const u = parseFloat(l);
      Number.isNaN(u) ? i = Date.parse(l) - Date.now() : i = u * 1e3;
    }
    if (i === void 0) {
      const u = e.maxRetries ?? this.maxRetries;
      i = this.calculateDefaultRetryTimeoutMillis(t, u);
    }
    return await rp(i), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const i = t - e;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  calculateNonstreamingTimeout(e, t) {
    if (36e5 * e / 128e3 > 6e5 || t != null && e > t) throw new B("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details");
    return 6e5;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: o, path: i, query: s, defaultBaseURL: l } = n, u = this.buildURL(i, s, l);
    "timeout" in n && sp("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    let i = {};
    this.idempotencyHeader && t !== "get" && (e.idempotencyKey || (e.idempotencyKey = this.defaultIdempotencyKey()), i[this.idempotencyHeader] = e.idempotencyKey);
    const s = P([
      i,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(o),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...dp(),
        ...this._options.dangerouslyAllowBrowser ? { "anthropic-dangerous-direct-browser-access": "true" } : void 0,
        "anthropic-version": "2023-06-01"
      },
      await this.authHeaders(e),
      this._options.defaultHeaders,
      n,
      e.headers
    ]);
    return this.validateHeaders(s), s.values;
  }
  _makeAbort(e) {
    return () => e.abort();
  }
  buildBody({ options: { body: e, headers: t } }) {
    if (!e) return {
      bodyHeaders: void 0,
      body: void 0
    };
    const n = P([t]);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || globalThis.ReadableStream && e instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: e
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: Hc(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : v(this, To, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
Os = z, To = /* @__PURE__ */ new WeakMap(), zi = /* @__PURE__ */ new WeakSet(), Id = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
z.Anthropic = Os;
z.HUMAN_PROMPT = Wp;
z.AI_PROMPT = Kp;
z.DEFAULT_TIMEOUT = 6e5;
z.AnthropicError = B;
z.APIError = Te;
z.APIConnectionError = zo;
z.APIConnectionTimeoutError = Nc;
z.APIUserAbortError = xe;
z.NotFoundError = Uc;
z.ConflictError = $c;
z.RateLimitError = Gc;
z.BadRequestError = kc;
z.AuthenticationError = Dc;
z.InternalServerError = Bc;
z.PermissionDeniedError = Lc;
z.UnprocessableEntityError = Fc;
z.toFile = xp;
var Dn = class extends z {
  constructor() {
    super(...arguments), this.completions = new vd(this), this.messages = new Hs(this), this.models = new wd(this), this.beta = new Fe(this);
  }
};
Dn.Completions = vd;
Dn.Messages = Hs;
Dn.Models = wd;
Dn.Beta = Fe;
function Yp(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function zp(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  e.forEach((o) => {
    (o.tool_calls || []).forEach((i) => {
      i.id && i.function?.name && n.set(i.id, i.function.name);
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
          }] : [], ...o.tool_calls.map((i) => ({
            type: "tool_use",
            id: i.id,
            name: i.function.name,
            input: Yp(i.function.arguments)
          }))]
        });
        continue;
      }
      t.push({
        role: o.role,
        content: [{
          type: "text",
          text: o.content || ""
        }]
      });
    }
  return t;
}
var Xp = class {
  constructor(e) {
    this.config = e, this.client = new Dn({
      apiKey: e.apiKey,
      baseURL: String(e.baseUrl || "https://api.anthropic.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 18e4,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  async chat(e) {
    const t = (e.tools || []).map((i) => ({
      name: i.function.name,
      description: i.function.description,
      input_schema: i.function.parameters
    })), n = await this.client.messages.create({
      model: this.config.model,
      system: e.systemPrompt,
      messages: zp(e.messages),
      tools: t,
      temperature: e.temperature,
      max_tokens: e.maxTokens
    }, { signal: e.signal }), o = (n.content || []).filter((i) => i.type === "tool_use" && i.name).map((i, s) => ({
      id: i.id || `anthropic-tool-${s + 1}`,
      name: i.name,
      arguments: JSON.stringify(i.input || {})
    }));
    return {
      text: (n.content || []).filter((i) => i.type === "text").map((i) => i.text || "").join(`
`),
      toolCalls: o,
      finishReason: n.stop_reason || "stop",
      model: n.model || this.config.model,
      provider: "anthropic"
    };
  }
}, Qp = /* @__PURE__ */ $o(((e, t) => {
  function n(o, i) {
    typeof i == "boolean" && (i = { forever: i }), this._originalTimeouts = JSON.parse(JSON.stringify(o)), this._timeouts = o, this._options = i || {}, this._maxRetryTime = i && i.maxRetryTime || 1 / 0, this._fn = null, this._errors = [], this._attempts = 1, this._operationTimeout = null, this._operationTimeoutCb = null, this._timeout = null, this._operationStart = null, this._timer = null, this._options.forever && (this._cachedTimeouts = this._timeouts.slice(0));
  }
  t.exports = n, n.prototype.reset = function() {
    this._attempts = 1, this._timeouts = this._originalTimeouts.slice(0);
  }, n.prototype.stop = function() {
    this._timeout && clearTimeout(this._timeout), this._timer && clearTimeout(this._timer), this._timeouts = [], this._cachedTimeouts = null;
  }, n.prototype.retry = function(o) {
    if (this._timeout && clearTimeout(this._timeout), !o) return !1;
    var i = (/* @__PURE__ */ new Date()).getTime();
    if (o && i - this._operationStart >= this._maxRetryTime)
      return this._errors.push(o), this._errors.unshift(/* @__PURE__ */ new Error("RetryOperation timeout occurred")), !1;
    this._errors.push(o);
    var s = this._timeouts.shift();
    if (s === void 0) if (this._cachedTimeouts)
      this._errors.splice(0, this._errors.length - 1), s = this._cachedTimeouts.slice(-1);
    else return !1;
    var l = this;
    return this._timer = setTimeout(function() {
      l._attempts++, l._operationTimeoutCb && (l._timeout = setTimeout(function() {
        l._operationTimeoutCb(l._attempts);
      }, l._operationTimeout), l._options.unref && l._timeout.unref()), l._fn(l._attempts);
    }, s), this._options.unref && this._timer.unref(), !0;
  }, n.prototype.attempt = function(o, i) {
    this._fn = o, i && (i.timeout && (this._operationTimeout = i.timeout), i.cb && (this._operationTimeoutCb = i.cb));
    var s = this;
    this._operationTimeoutCb && (this._timeout = setTimeout(function() {
      s._operationTimeoutCb();
    }, s._operationTimeout)), this._operationStart = (/* @__PURE__ */ new Date()).getTime(), this._fn(this._attempts);
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
    for (var o = {}, i = null, s = 0, l = 0; l < this._errors.length; l++) {
      var u = this._errors[l], c = u.message, d = (o[c] || 0) + 1;
      o[c] = d, d >= s && (i = u, s = d);
    }
    return i;
  };
})), Zp = /* @__PURE__ */ $o(((e) => {
  var t = Qp();
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
    for (var i in n) o[i] = n[i];
    if (o.minTimeout > o.maxTimeout) throw new Error("minTimeout is greater than maxTimeout");
    for (var s = [], l = 0; l < o.retries; l++) s.push(this.createTimeout(l, o));
    return n && n.forever && !s.length && s.push(this.createTimeout(l, o)), s.sort(function(u, c) {
      return u - c;
    }), s;
  }, e.createTimeout = function(n, o) {
    var i = o.randomize ? Math.random() + 1 : 1, s = Math.round(i * Math.max(o.minTimeout, 1) * Math.pow(o.factor, n));
    return s = Math.min(s, o.maxTimeout), s;
  }, e.wrap = function(n, o, i) {
    if (o instanceof Array && (i = o, o = null), !i) {
      i = [];
      for (var s in n) typeof n[s] == "function" && i.push(s);
    }
    for (var l = 0; l < i.length; l++) {
      var u = i[l], c = n[u];
      n[u] = function(h) {
        var f = e.operation(o), p = Array.prototype.slice.call(arguments, 1), m = p.pop();
        p.push(function(g) {
          f.retry(g) || (g && (arguments[0] = f.mainError()), m.apply(this, arguments));
        }), f.attempt(function() {
          h.apply(n, p);
        });
      }.bind(n, c), n[u].options = o;
    }
  };
})), jp = /* @__PURE__ */ $o(((e, t) => {
  t.exports = Zp();
})), em = /* @__PURE__ */ $o(((e, t) => {
  var n = jp(), o = [
    "Failed to fetch",
    "NetworkError when attempting to fetch resource.",
    "The Internet connection appears to be offline.",
    "Network request failed"
  ], i = class extends Error {
    constructor(c) {
      super(), c instanceof Error ? (this.originalError = c, { message: c } = c) : (this.originalError = new Error(c), this.originalError.stack = this.stack), this.name = "AbortError", this.message = c;
    }
  }, s = (c, d, h) => {
    const f = h.retries - (d - 1);
    return c.attemptNumber = d, c.retriesLeft = f, c;
  }, l = (c) => o.includes(c), u = (c, d) => new Promise((h, f) => {
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
        else if (g instanceof TypeError && !l(g.message))
          p.stop(), f(g);
        else {
          s(g, m, d);
          try {
            await d.onFailedAttempt(g);
          } catch (_) {
            f(_);
            return;
          }
          p.retry(g) || f(p.mainError());
        }
      }
    });
  });
  t.exports = u, t.exports.default = u, t.exports.AbortError = i;
})), ia = /* @__PURE__ */ Bf(em(), 1), tm = void 0, nm = void 0;
function om() {
  return {
    geminiUrl: tm,
    vertexUrl: nm
  };
}
function im(e, t, n, o) {
  var i, s;
  if (!e?.baseUrl) {
    const l = om();
    return t ? (i = l.vertexUrl) !== null && i !== void 0 ? i : n : (s = l.geminiUrl) !== null && s !== void 0 ? s : o;
  }
  return e.baseUrl;
}
var We = class {
};
function b(e, t) {
  return e.replace(/\{([^}]+)\}/g, (n, o) => {
    if (Object.prototype.hasOwnProperty.call(t, o)) {
      const i = t[o];
      return i != null ? String(i) : "";
    } else throw new Error(`Key '${o}' not found in valueMap.`);
  });
}
function a(e, t, n) {
  for (let s = 0; s < t.length - 1; s++) {
    const l = t[s];
    if (l.endsWith("[]")) {
      const u = l.slice(0, -2);
      if (!(u in e)) if (Array.isArray(n)) e[u] = Array.from({ length: n.length }, () => ({}));
      else throw new Error(`Value must be a list given an array path ${l}`);
      if (Array.isArray(e[u])) {
        const c = e[u];
        if (Array.isArray(n)) for (let d = 0; d < c.length; d++) {
          const h = c[d];
          a(h, t.slice(s + 1), n[d]);
        }
        else for (const d of c) a(d, t.slice(s + 1), n);
      }
      return;
    } else if (l.endsWith("[0]")) {
      const u = l.slice(0, -3);
      u in e || (e[u] = [{}]);
      const c = e[u];
      a(c[0], t.slice(s + 1), n);
      return;
    }
    (!e[l] || typeof e[l] != "object") && (e[l] = {}), e = e[l];
  }
  const o = t[t.length - 1], i = e[o];
  if (i !== void 0) {
    if (!n || typeof n == "object" && Object.keys(n).length === 0 || n === i) return;
    if (typeof i == "object" && typeof n == "object" && i !== null && n !== null) Object.assign(i, n);
    else throw new Error(`Cannot set value for an existing key. Key: ${o}`);
  } else o === "_self" && typeof n == "object" && n !== null && !Array.isArray(n) ? Object.assign(e, n) : e[o] = n;
}
function r(e, t, n = void 0) {
  try {
    if (t.length === 1 && t[0] === "_self") return e;
    for (let o = 0; o < t.length; o++) {
      if (typeof e != "object" || e === null) return n;
      const i = t[o];
      if (i.endsWith("[]")) {
        const s = i.slice(0, -2);
        if (s in e) {
          const l = e[s];
          return Array.isArray(l) ? l.map((u) => r(u, t.slice(o + 1), n)) : n;
        } else return n;
      } else e = e[i];
    }
    return e;
  } catch (o) {
    if (o instanceof TypeError) return n;
    throw o;
  }
}
function sm(e, t) {
  for (const [n, o] of Object.entries(t)) {
    const i = n.split("."), s = o.split("."), l = /* @__PURE__ */ new Set();
    let u = -1;
    for (let c = 0; c < i.length; c++) if (i[c] === "*") {
      u = c;
      break;
    }
    if (u !== -1 && s.length > u) for (let c = u; c < s.length; c++) {
      const d = s[c];
      d !== "*" && !d.endsWith("[]") && !d.endsWith("[0]") && l.add(d);
    }
    Xi(e, i, s, 0, l);
  }
}
function Xi(e, t, n, o, i) {
  if (o >= t.length || typeof e != "object" || e === null) return;
  const s = t[o];
  if (s.endsWith("[]")) {
    const l = s.slice(0, -2), u = e;
    if (l in u && Array.isArray(u[l])) for (const c of u[l]) Xi(c, t, n, o + 1, i);
  } else if (s === "*") {
    if (typeof e == "object" && e !== null && !Array.isArray(e)) {
      const l = e, u = Object.keys(l).filter((d) => !d.startsWith("_") && !i.has(d)), c = {};
      for (const d of u) c[d] = l[d];
      for (const [d, h] of Object.entries(c)) {
        const f = [];
        for (const p of n.slice(o)) p === "*" ? f.push(d) : f.push(p);
        a(l, f, h);
      }
      for (const d of u) delete l[d];
    }
  } else {
    const l = e;
    s in l && Xi(l[s], t, n, o + 1, i);
  }
}
function Js(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function rm(e) {
  const t = {}, n = r(e, ["operationName"]);
  n != null && a(t, ["operationName"], n);
  const o = r(e, ["resourceName"]);
  return o != null && a(t, ["_url", "resourceName"], o), t;
}
function am(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && a(t, ["name"], n);
  const o = r(e, ["metadata"]);
  o != null && a(t, ["metadata"], o);
  const i = r(e, ["done"]);
  i != null && a(t, ["done"], i);
  const s = r(e, ["error"]);
  s != null && a(t, ["error"], s);
  const l = r(e, ["response", "generateVideoResponse"]);
  return l != null && a(t, ["response"], um(l)), t;
}
function lm(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && a(t, ["name"], n);
  const o = r(e, ["metadata"]);
  o != null && a(t, ["metadata"], o);
  const i = r(e, ["done"]);
  i != null && a(t, ["done"], i);
  const s = r(e, ["error"]);
  s != null && a(t, ["error"], s);
  const l = r(e, ["response"]);
  return l != null && a(t, ["response"], cm(l)), t;
}
function um(e) {
  const t = {}, n = r(e, ["generatedSamples"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((l) => dm(l))), a(t, ["generatedVideos"], s);
  }
  const o = r(e, ["raiMediaFilteredCount"]);
  o != null && a(t, ["raiMediaFilteredCount"], o);
  const i = r(e, ["raiMediaFilteredReasons"]);
  return i != null && a(t, ["raiMediaFilteredReasons"], i), t;
}
function cm(e) {
  const t = {}, n = r(e, ["videos"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((l) => fm(l))), a(t, ["generatedVideos"], s);
  }
  const o = r(e, ["raiMediaFilteredCount"]);
  o != null && a(t, ["raiMediaFilteredCount"], o);
  const i = r(e, ["raiMediaFilteredReasons"]);
  return i != null && a(t, ["raiMediaFilteredReasons"], i), t;
}
function dm(e) {
  const t = {}, n = r(e, ["video"]);
  return n != null && a(t, ["video"], ym(n)), t;
}
function fm(e) {
  const t = {}, n = r(e, ["_self"]);
  return n != null && a(t, ["video"], vm(n)), t;
}
function hm(e) {
  const t = {}, n = r(e, ["operationName"]);
  return n != null && a(t, ["_url", "operationName"], n), t;
}
function pm(e) {
  const t = {}, n = r(e, ["operationName"]);
  return n != null && a(t, ["_url", "operationName"], n), t;
}
function mm(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && a(t, ["name"], n);
  const o = r(e, ["metadata"]);
  o != null && a(t, ["metadata"], o);
  const i = r(e, ["done"]);
  i != null && a(t, ["done"], i);
  const s = r(e, ["error"]);
  s != null && a(t, ["error"], s);
  const l = r(e, ["response"]);
  return l != null && a(t, ["response"], gm(l)), t;
}
function gm(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && a(t, ["sdkHttpResponse"], n);
  const o = r(e, ["parent"]);
  o != null && a(t, ["parent"], o);
  const i = r(e, ["documentName"]);
  return i != null && a(t, ["documentName"], i), t;
}
function Cd(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && a(t, ["name"], n);
  const o = r(e, ["metadata"]);
  o != null && a(t, ["metadata"], o);
  const i = r(e, ["done"]);
  i != null && a(t, ["done"], i);
  const s = r(e, ["error"]);
  s != null && a(t, ["error"], s);
  const l = r(e, ["response"]);
  return l != null && a(t, ["response"], _m(l)), t;
}
function _m(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && a(t, ["sdkHttpResponse"], n);
  const o = r(e, ["parent"]);
  o != null && a(t, ["parent"], o);
  const i = r(e, ["documentName"]);
  return i != null && a(t, ["documentName"], i), t;
}
function ym(e) {
  const t = {}, n = r(e, ["uri"]);
  n != null && a(t, ["uri"], n);
  const o = r(e, ["encodedVideo"]);
  o != null && a(t, ["videoBytes"], Js(o));
  const i = r(e, ["encoding"]);
  return i != null && a(t, ["mimeType"], i), t;
}
function vm(e) {
  const t = {}, n = r(e, ["gcsUri"]);
  n != null && a(t, ["uri"], n);
  const o = r(e, ["bytesBase64Encoded"]);
  o != null && a(t, ["videoBytes"], Js(o));
  const i = r(e, ["mimeType"]);
  return i != null && a(t, ["mimeType"], i), t;
}
var sa;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(sa || (sa = {}));
var ra;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(ra || (ra = {}));
var aa;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(aa || (aa = {}));
var je;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(je || (je = {}));
var la;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(la || (la = {}));
var ua;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})(ua || (ua = {}));
var ca;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})(ca || (ca = {}));
var da;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(da || (da = {}));
var fa;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(fa || (fa = {}));
var ha;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})(ha || (ha = {}));
var pa;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})(pa || (pa = {}));
var Qi;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(Qi || (Qi = {}));
var ma;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(ma || (ma = {}));
var ga;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(ga || (ga = {}));
var _a;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})(_a || (_a = {}));
var ya;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(ya || (ya = {}));
var va;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(va || (va = {}));
var Ea;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(Ea || (Ea = {}));
var Ta;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})(Ta || (Ta = {}));
var Sa;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Sa || (Sa = {}));
var wa;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(wa || (wa = {}));
var Ia;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(Ia || (Ia = {}));
var Ca;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(Ca || (Ca = {}));
var Aa;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(Aa || (Aa = {}));
var No;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(No || (No = {}));
var Ra;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(Ra || (Ra = {}));
var ba;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(ba || (ba = {}));
var Pa;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(Pa || (Pa = {}));
var xa;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(xa || (xa = {}));
var Zi;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(Zi || (Zi = {}));
var Ma;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})(Ma || (Ma = {}));
var Na;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})(Na || (Na = {}));
var ka;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(ka || (ka = {}));
var Da;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(Da || (Da = {}));
var La;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(La || (La = {}));
var Ua;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})(Ua || (Ua = {}));
var $a;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})($a || ($a = {}));
var ji;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(ji || (ji = {}));
var Fa;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})(Fa || (Fa = {}));
var Ga;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(Ga || (Ga = {}));
var ko;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(ko || (ko = {}));
var Ba;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(Ba || (Ba = {}));
var qa;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(qa || (qa = {}));
var Va;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(Va || (Va = {}));
var Ha;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(Ha || (Ha = {}));
var Oa;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(Oa || (Oa = {}));
var Ja;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(Ja || (Ja = {}));
var Wa;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(Wa || (Wa = {}));
var Ka;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(Ka || (Ka = {}));
var Ya;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})(Ya || (Ya = {}));
var za;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(za || (za = {}));
var Xa;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})(Xa || (Xa = {}));
var Qa;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(Qa || (Qa = {}));
var Za;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(Za || (Za = {}));
var ja;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(ja || (ja = {}));
var el;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(el || (el = {}));
var tl;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(tl || (tl = {}));
var nl;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(nl || (nl = {}));
var ol;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(ol || (ol = {}));
var il;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(il || (il = {}));
var sl;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(sl || (sl = {}));
var rl;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(rl || (rl = {}));
var al;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(al || (al = {}));
var ll;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(ll || (ll = {}));
var bt;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(bt || (bt = {}));
var es = class {
  constructor(e) {
    const t = {};
    for (const n of e.headers.entries()) t[n[0]] = n[1];
    this.headers = t, this.responseInternal = e;
  }
  json() {
    return this.responseInternal.json();
  }
}, nn = class {
  get text() {
    var e, t, n, o, i, s, l, u;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning text from the first one.");
    let c = "", d = !1;
    const h = [];
    for (const f of (u = (l = (s = (i = this.candidates) === null || i === void 0 ? void 0 : i[0]) === null || s === void 0 ? void 0 : s.content) === null || l === void 0 ? void 0 : l.parts) !== null && u !== void 0 ? u : []) {
      for (const [p, m] of Object.entries(f)) p !== "text" && p !== "thought" && p !== "thoughtSignature" && (m !== null || m !== void 0) && h.push(p);
      if (typeof f.text == "string") {
        if (typeof f.thought == "boolean" && f.thought) continue;
        d = !0, c += f.text;
      }
    }
    return h.length > 0 && console.warn(`there are non-text parts ${h} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), d ? c : void 0;
  }
  get data() {
    var e, t, n, o, i, s, l, u;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning data from the first one.");
    let c = "";
    const d = [];
    for (const h of (u = (l = (s = (i = this.candidates) === null || i === void 0 ? void 0 : i[0]) === null || s === void 0 ? void 0 : s.content) === null || l === void 0 ? void 0 : l.parts) !== null && u !== void 0 ? u : []) {
      for (const [f, p] of Object.entries(h)) f !== "inlineData" && (p !== null || p !== void 0) && d.push(f);
      h.inlineData && typeof h.inlineData.data == "string" && (c += atob(h.inlineData.data));
    }
    return d.length > 0 && console.warn(`there are non-data parts ${d} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), c.length > 0 ? btoa(c) : void 0;
  }
  get functionCalls() {
    var e, t, n, o, i, s, l, u;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning function calls from the first one.");
    const c = (u = (l = (s = (i = this.candidates) === null || i === void 0 ? void 0 : i[0]) === null || s === void 0 ? void 0 : s.content) === null || l === void 0 ? void 0 : l.parts) === null || u === void 0 ? void 0 : u.filter((d) => d.functionCall).map((d) => d.functionCall).filter((d) => d !== void 0);
    if (c?.length !== 0)
      return c;
  }
  get executableCode() {
    var e, t, n, o, i, s, l, u, c;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning executable code from the first one.");
    const d = (u = (l = (s = (i = this.candidates) === null || i === void 0 ? void 0 : i[0]) === null || s === void 0 ? void 0 : s.content) === null || l === void 0 ? void 0 : l.parts) === null || u === void 0 ? void 0 : u.filter((h) => h.executableCode).map((h) => h.executableCode).filter((h) => h !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.code;
  }
  get codeExecutionResult() {
    var e, t, n, o, i, s, l, u, c;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning code execution result from the first one.");
    const d = (u = (l = (s = (i = this.candidates) === null || i === void 0 ? void 0 : i[0]) === null || s === void 0 ? void 0 : s.content) === null || l === void 0 ? void 0 : l.parts) === null || u === void 0 ? void 0 : u.filter((h) => h.codeExecutionResult).map((h) => h.codeExecutionResult).filter((h) => h !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.output;
  }
}, ul = class {
}, cl = class {
}, Em = class {
}, Tm = class {
}, Sm = class {
}, wm = class {
}, dl = class {
}, fl = class {
}, hl = class {
}, Im = class {
}, pl = class Ad {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new Ad();
    let i;
    const s = t;
    return n ? i = lm(s) : i = am(s), Object.assign(o, i), o;
  }
}, ml = class {
}, gl = class {
}, _l = class {
}, yl = class {
}, Cm = class {
}, Am = class {
}, Rm = class {
}, bm = class Rd {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new Rd(), i = mm(t);
    return Object.assign(o, i), o;
  }
}, Pm = class {
}, xm = class {
}, Mm = class {
}, Nm = class {
}, vl = class {
}, km = class {
  get text() {
    var e, t, n;
    let o = "", i = !1;
    const s = [];
    for (const l of (n = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && n !== void 0 ? n : []) {
      for (const [u, c] of Object.entries(l)) u !== "text" && u !== "thought" && c !== null && s.push(u);
      if (typeof l.text == "string") {
        if (typeof l.thought == "boolean" && l.thought) continue;
        i = !0, o += l.text;
      }
    }
    return s.length > 0 && console.warn(`there are non-text parts ${s} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), i ? o : void 0;
  }
  get data() {
    var e, t, n;
    let o = "";
    const i = [];
    for (const s of (n = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && n !== void 0 ? n : []) {
      for (const [l, u] of Object.entries(s)) l !== "inlineData" && u !== null && i.push(l);
      s.inlineData && typeof s.inlineData.data == "string" && (o += atob(s.inlineData.data));
    }
    return i.length > 0 && console.warn(`there are non-data parts ${i} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), o.length > 0 ? btoa(o) : void 0;
  }
}, Dm = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, Lm = class bd {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new bd(), i = Cd(t);
    return Object.assign(o, i), o;
  }
};
function O(e, t) {
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
function Pd(e, t) {
  const n = O(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function xd(e) {
  return Array.isArray(e) ? e.map((t) => Do(t)) : [Do(e)];
}
function Do(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function Md(e) {
  const t = Do(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function Nd(e) {
  const t = Do(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function El(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function kd(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => El(t)) : [El(e)];
}
function ts(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function Tl(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function Sl(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function ne(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return ts(e) ? e : {
    role: "user",
    parts: kd(e)
  };
}
function Ws(e, t) {
  if (!t) return [];
  if (e.isVertexAI() && Array.isArray(t)) return t.flatMap((n) => {
    const o = ne(n);
    return o.parts && o.parts.length > 0 && o.parts[0].text !== void 0 ? [o.parts[0].text] : [];
  });
  if (e.isVertexAI()) {
    const n = ne(t);
    return n.parts && n.parts.length > 0 && n.parts[0].text !== void 0 ? [n.parts[0].text] : [];
  }
  return Array.isArray(t) ? t.map((n) => ne(n)) : [ne(t)];
}
function pe(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("contents are required");
  if (!Array.isArray(e)) {
    if (Tl(e) || Sl(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [ne(e)];
  }
  const t = [], n = [], o = ts(e[0]);
  for (const i of e) {
    const s = ts(i);
    if (s != o) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (s) t.push(i);
    else {
      if (Tl(i) || Sl(i)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(i);
    }
  }
  return o || t.push({
    role: "user",
    parts: kd(n)
  }), t;
}
function Um(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((o) => o !== "null");
  if (n.length === 1) t.type = Object.values(je).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : je.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const o of n) t.anyOf.push({ type: Object.values(je).includes(o.toUpperCase()) ? o.toUpperCase() : je.TYPE_UNSPECIFIED });
  }
}
function xt(e) {
  const t = {}, n = ["items"], o = ["anyOf"], i = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const s = e.anyOf;
  s != null && s.length == 2 && (s[0].type === "null" ? (t.nullable = !0, e = s[1]) : s[1].type === "null" && (t.nullable = !0, e = s[0])), e.type instanceof Array && Um(e.type, t);
  for (const [l, u] of Object.entries(e))
    if (u != null)
      if (l == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(je).includes(u.toUpperCase()) ? u.toUpperCase() : je.TYPE_UNSPECIFIED;
      } else if (n.includes(l)) t[l] = xt(u);
      else if (o.includes(l)) {
        const c = [];
        for (const d of u) {
          if (d.type == "null") {
            t.nullable = !0;
            continue;
          }
          c.push(xt(d));
        }
        t[l] = c;
      } else if (i.includes(l)) {
        const c = {};
        for (const [d, h] of Object.entries(u)) c[d] = xt(h);
        t[l] = c;
      } else {
        if (l === "additionalProperties") continue;
        t[l] = u;
      }
  return t;
}
function Ks(e) {
  return xt(e);
}
function Ys(e) {
  if (typeof e == "object") return e;
  if (typeof e == "string") return { voiceConfig: { prebuiltVoiceConfig: { voiceName: e } } };
  throw new Error(`Unsupported speechConfig type: ${typeof e}`);
}
function zs(e) {
  if ("multiSpeakerVoiceConfig" in e) throw new Error("multiSpeakerVoiceConfig is not supported in the live API.");
  return e;
}
function Lt(e) {
  if (e.functionDeclarations) for (const t of e.functionDeclarations)
    t.parameters && (Object.keys(t.parameters).includes("$schema") ? t.parametersJsonSchema || (t.parametersJsonSchema = t.parameters, delete t.parameters) : t.parameters = xt(t.parameters)), t.response && (Object.keys(t.response).includes("$schema") ? t.responseJsonSchema || (t.responseJsonSchema = t.response, delete t.response) : t.response = xt(t.response));
  return e;
}
function Ut(e) {
  if (e == null) throw new Error("tools is required");
  if (!Array.isArray(e)) throw new Error("tools is required and must be an array of Tools");
  const t = [];
  for (const n of e) t.push(n);
  return t;
}
function $m(e, t, n, o = 1) {
  const i = !t.startsWith(`${n}/`) && t.split("/").length === o;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : i ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : i ? `${n}/${t}` : t;
}
function Ke(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return $m(e, t, "cachedContents");
}
function Dd(e) {
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
function tt(e) {
  return Js(e);
}
function Fm(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function Gm(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function Bm(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function Ld(e) {
  var t;
  let n;
  if (Fm(e) && (n = e.name), !(Bm(e) && (n = e.uri, n === void 0)) && !(Gm(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const o = n.split("files/")[1].match(/[a-z0-9]+/);
      if (o === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = o[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function Ud(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function $d(e) {
  for (const t of [
    "models",
    "tunedModels",
    "publisherModels"
  ]) if (qm(e, t)) return e[t];
  return [];
}
function qm(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function Vm(e, t = {}) {
  const n = e, o = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (o.responseJsonSchema = n.outputSchema), t.behavior && (o.behavior = t.behavior), { functionDeclarations: [o] };
}
function Hm(e, t = {}) {
  const n = [], o = /* @__PURE__ */ new Set();
  for (const i of e) {
    const s = i.name;
    if (o.has(s)) throw new Error(`Duplicate function name ${s} found in MCP tools. Please ensure function names are unique.`);
    o.add(s);
    const l = Vm(i, t);
    l.functionDeclarations && n.push(...l.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function Fd(e, t) {
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
  const o = [n.gcsUri, n.bigqueryUri].filter(Boolean).length, i = [n.inlinedRequests, n.fileName].filter(Boolean).length;
  if (e.isVertexAI()) {
    if (i > 0 || o !== 1) throw new Error("Exactly one of `gcsUri` or `bigqueryUri` must be set for Vertex AI.");
  } else if (o > 0 || i !== 1) throw new Error("Exactly one of `inlinedRequests`, `fileName`, must be set for Gemini API.");
  return n;
}
function Om(e) {
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
function Gd(e) {
  if (typeof e != "object" || e === null) return {};
  const t = e, n = t.inlinedResponses;
  if (typeof n != "object" || n === null) return e;
  const o = n.inlinedResponses;
  if (!Array.isArray(o) || o.length === 0) return e;
  let i = !1;
  for (const s of o) {
    if (typeof s != "object" || s === null) continue;
    const l = s.response;
    if (!(typeof l != "object" || l === null) && l.embedding !== void 0) {
      i = !0;
      break;
    }
  }
  return i && (t.inlinedEmbedContentResponses = t.inlinedResponses, delete t.inlinedResponses), e;
}
function $t(e, t) {
  const n = t;
  if (!e.isVertexAI()) {
    if (/batches\/[^/]+$/.test(n)) return n.split("/").pop();
    throw new Error(`Invalid batch job name: ${n}.`);
  }
  if (/^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/.test(n)) return n.split("/").pop();
  if (/^\d+$/.test(n)) return n;
  throw new Error(`Invalid batch job name: ${n}.`);
}
function Bd(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function Jm(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function Wm(e) {
  const t = {}, n = r(e, ["apiKey"]);
  if (n != null && a(t, ["apiKey"], n), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Km(e) {
  const t = {}, n = r(e, ["responsesFile"]);
  n != null && a(t, ["fileName"], n);
  const o = r(e, ["inlinedResponses", "inlinedResponses"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((l) => Rg(l))), a(t, ["inlinedResponses"], s);
  }
  const i = r(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((l) => l)), a(t, ["inlinedEmbedContentResponses"], s);
  }
  return t;
}
function Ym(e) {
  const t = {}, n = r(e, ["predictionsFormat"]);
  n != null && a(t, ["format"], n);
  const o = r(e, ["gcsDestination", "outputUriPrefix"]);
  o != null && a(t, ["gcsUri"], o);
  const i = r(e, ["bigqueryDestination", "outputUri"]);
  return i != null && a(t, ["bigqueryUri"], i), t;
}
function zm(e) {
  const t = {}, n = r(e, ["format"]);
  n != null && a(t, ["predictionsFormat"], n);
  const o = r(e, ["gcsUri"]);
  o != null && a(t, ["gcsDestination", "outputUriPrefix"], o);
  const i = r(e, ["bigqueryUri"]);
  if (i != null && a(t, ["bigqueryDestination", "outputUri"], i), r(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (r(e, ["inlinedResponses"]) !== void 0) throw new Error("inlinedResponses parameter is not supported in Vertex AI.");
  if (r(e, ["inlinedEmbedContentResponses"]) !== void 0) throw new Error("inlinedEmbedContentResponses parameter is not supported in Vertex AI.");
  return t;
}
function So(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && a(t, ["name"], n);
  const o = r(e, ["metadata", "displayName"]);
  o != null && a(t, ["displayName"], o);
  const i = r(e, ["metadata", "state"]);
  i != null && a(t, ["state"], Bd(i));
  const s = r(e, ["metadata", "createTime"]);
  s != null && a(t, ["createTime"], s);
  const l = r(e, ["metadata", "endTime"]);
  l != null && a(t, ["endTime"], l);
  const u = r(e, ["metadata", "updateTime"]);
  u != null && a(t, ["updateTime"], u);
  const c = r(e, ["metadata", "model"]);
  c != null && a(t, ["model"], c);
  const d = r(e, ["metadata", "output"]);
  return d != null && a(t, ["dest"], Km(Gd(d))), t;
}
function ns(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && a(t, ["name"], n);
  const o = r(e, ["displayName"]);
  o != null && a(t, ["displayName"], o);
  const i = r(e, ["state"]);
  i != null && a(t, ["state"], Bd(i));
  const s = r(e, ["error"]);
  s != null && a(t, ["error"], s);
  const l = r(e, ["createTime"]);
  l != null && a(t, ["createTime"], l);
  const u = r(e, ["startTime"]);
  u != null && a(t, ["startTime"], u);
  const c = r(e, ["endTime"]);
  c != null && a(t, ["endTime"], c);
  const d = r(e, ["updateTime"]);
  d != null && a(t, ["updateTime"], d);
  const h = r(e, ["model"]);
  h != null && a(t, ["model"], h);
  const f = r(e, ["inputConfig"]);
  f != null && a(t, ["src"], Xm(f));
  const p = r(e, ["outputConfig"]);
  p != null && a(t, ["dest"], Ym(Gd(p)));
  const m = r(e, ["completionStats"]);
  return m != null && a(t, ["completionStats"], m), t;
}
function Xm(e) {
  const t = {}, n = r(e, ["instancesFormat"]);
  n != null && a(t, ["format"], n);
  const o = r(e, ["gcsSource", "uris"]);
  o != null && a(t, ["gcsUri"], o);
  const i = r(e, ["bigquerySource", "inputUri"]);
  return i != null && a(t, ["bigqueryUri"], i), t;
}
function Qm(e, t) {
  const n = {};
  if (r(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (r(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (r(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const o = r(t, ["fileName"]);
  o != null && a(n, ["fileName"], o);
  const i = r(t, ["inlinedRequests"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((l) => Ag(e, l))), a(n, ["requests", "requests"], s);
  }
  return n;
}
function Zm(e) {
  const t = {}, n = r(e, ["format"]);
  n != null && a(t, ["instancesFormat"], n);
  const o = r(e, ["gcsUri"]);
  o != null && a(t, ["gcsSource", "uris"], o);
  const i = r(e, ["bigqueryUri"]);
  if (i != null && a(t, ["bigquerySource", "inputUri"], i), r(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (r(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function jm(e) {
  const t = {}, n = r(e, ["data"]);
  if (n != null && a(t, ["data"], n), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["mimeType"]);
  return o != null && a(t, ["mimeType"], o), t;
}
function eg(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && a(n, ["_url", "name"], $t(e, o)), n;
}
function tg(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && a(n, ["_url", "name"], $t(e, o)), n;
}
function ng(e) {
  const t = {}, n = r(e, ["content"]);
  n != null && a(t, ["content"], n);
  const o = r(e, ["citationMetadata"]);
  o != null && a(t, ["citationMetadata"], og(o));
  const i = r(e, ["tokenCount"]);
  i != null && a(t, ["tokenCount"], i);
  const s = r(e, ["finishReason"]);
  s != null && a(t, ["finishReason"], s);
  const l = r(e, ["groundingMetadata"]);
  l != null && a(t, ["groundingMetadata"], l);
  const u = r(e, ["avgLogprobs"]);
  u != null && a(t, ["avgLogprobs"], u);
  const c = r(e, ["index"]);
  c != null && a(t, ["index"], c);
  const d = r(e, ["logprobsResult"]);
  d != null && a(t, ["logprobsResult"], d);
  const h = r(e, ["safetyRatings"]);
  if (h != null) {
    let p = h;
    Array.isArray(p) && (p = p.map((m) => m)), a(t, ["safetyRatings"], p);
  }
  const f = r(e, ["urlContextMetadata"]);
  return f != null && a(t, ["urlContextMetadata"], f), t;
}
function og(e) {
  const t = {}, n = r(e, ["citationSources"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => i)), a(t, ["citations"], o);
  }
  return t;
}
function qd(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((s) => Dg(s))), a(t, ["parts"], i);
  }
  const o = r(e, ["role"]);
  return o != null && a(t, ["role"], o), t;
}
function ig(e, t) {
  const n = {}, o = r(e, ["displayName"]);
  if (t !== void 0 && o != null && a(t, ["batch", "displayName"], o), r(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const i = r(e, ["webhookConfig"]);
  return t !== void 0 && i != null && a(t, ["batch", "webhookConfig"], i), n;
}
function sg(e, t) {
  const n = {}, o = r(e, ["displayName"]);
  t !== void 0 && o != null && a(t, ["displayName"], o);
  const i = r(e, ["dest"]);
  if (t !== void 0 && i != null && a(t, ["outputConfig"], zm(Om(i))), r(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function wl(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && a(n, ["_url", "model"], O(e, o));
  const i = r(t, ["src"]);
  i != null && a(n, ["batch", "inputConfig"], Qm(e, Fd(e, i)));
  const s = r(t, ["config"]);
  return s != null && ig(s, n), n;
}
function rg(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && a(n, ["model"], O(e, o));
  const i = r(t, ["src"]);
  i != null && a(n, ["inputConfig"], Zm(Fd(e, i)));
  const s = r(t, ["config"]);
  return s != null && sg(s, n), n;
}
function ag(e, t) {
  const n = {}, o = r(e, ["displayName"]);
  return t !== void 0 && o != null && a(t, ["batch", "displayName"], o), n;
}
function lg(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && a(n, ["_url", "model"], O(e, o));
  const i = r(t, ["src"]);
  i != null && a(n, ["batch", "inputConfig"], mg(e, i));
  const s = r(t, ["config"]);
  return s != null && ag(s, n), n;
}
function ug(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && a(n, ["_url", "name"], $t(e, o)), n;
}
function cg(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && a(n, ["_url", "name"], $t(e, o)), n;
}
function dg(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && a(t, ["sdkHttpResponse"], n);
  const o = r(e, ["name"]);
  o != null && a(t, ["name"], o);
  const i = r(e, ["done"]);
  i != null && a(t, ["done"], i);
  const s = r(e, ["error"]);
  return s != null && a(t, ["error"], s), t;
}
function fg(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && a(t, ["sdkHttpResponse"], n);
  const o = r(e, ["name"]);
  o != null && a(t, ["name"], o);
  const i = r(e, ["done"]);
  i != null && a(t, ["done"], i);
  const s = r(e, ["error"]);
  return s != null && a(t, ["error"], s), t;
}
function hg(e, t) {
  const n = {}, o = r(t, ["contents"]);
  if (o != null) {
    let s = Ws(e, o);
    Array.isArray(s) && (s = s.map((l) => l)), a(n, [
      "requests[]",
      "request",
      "content"
    ], s);
  }
  const i = r(t, ["config"]);
  return i != null && (a(n, ["_self"], pg(i, n)), sm(n, { "requests[].*": "requests[].request.*" })), n;
}
function pg(e, t) {
  const n = {}, o = r(e, ["taskType"]);
  t !== void 0 && o != null && a(t, ["requests[]", "taskType"], o);
  const i = r(e, ["title"]);
  t !== void 0 && i != null && a(t, ["requests[]", "title"], i);
  const s = r(e, ["outputDimensionality"]);
  if (t !== void 0 && s != null && a(t, ["requests[]", "outputDimensionality"], s), r(e, ["mimeType"]) !== void 0) throw new Error("mimeType parameter is not supported in Gemini API.");
  if (r(e, ["autoTruncate"]) !== void 0) throw new Error("autoTruncate parameter is not supported in Gemini API.");
  if (r(e, ["documentOcr"]) !== void 0) throw new Error("documentOcr parameter is not supported in Gemini API.");
  if (r(e, ["audioTrackExtraction"]) !== void 0) throw new Error("audioTrackExtraction parameter is not supported in Gemini API.");
  return n;
}
function mg(e, t) {
  const n = {}, o = r(t, ["fileName"]);
  o != null && a(n, ["file_name"], o);
  const i = r(t, ["inlinedRequests"]);
  return i != null && a(n, ["requests"], hg(e, i)), n;
}
function gg(e) {
  const t = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = r(e, ["fileUri"]);
  n != null && a(t, ["fileUri"], n);
  const o = r(e, ["mimeType"]);
  return o != null && a(t, ["mimeType"], o), t;
}
function _g(e) {
  const t = {}, n = r(e, ["id"]);
  n != null && a(t, ["id"], n);
  const o = r(e, ["args"]);
  o != null && a(t, ["args"], o);
  const i = r(e, ["name"]);
  if (i != null && a(t, ["name"], i), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function yg(e) {
  const t = {}, n = r(e, ["allowedFunctionNames"]);
  n != null && a(t, ["allowedFunctionNames"], n);
  const o = r(e, ["mode"]);
  if (o != null && a(t, ["mode"], o), r(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function vg(e, t, n) {
  const o = {}, i = r(t, ["systemInstruction"]);
  n !== void 0 && i != null && a(n, ["systemInstruction"], qd(ne(i)));
  const s = r(t, ["temperature"]);
  s != null && a(o, ["temperature"], s);
  const l = r(t, ["topP"]);
  l != null && a(o, ["topP"], l);
  const u = r(t, ["topK"]);
  u != null && a(o, ["topK"], u);
  const c = r(t, ["candidateCount"]);
  c != null && a(o, ["candidateCount"], c);
  const d = r(t, ["maxOutputTokens"]);
  d != null && a(o, ["maxOutputTokens"], d);
  const h = r(t, ["stopSequences"]);
  h != null && a(o, ["stopSequences"], h);
  const f = r(t, ["responseLogprobs"]);
  f != null && a(o, ["responseLogprobs"], f);
  const p = r(t, ["logprobs"]);
  p != null && a(o, ["logprobs"], p);
  const m = r(t, ["presencePenalty"]);
  m != null && a(o, ["presencePenalty"], m);
  const g = r(t, ["frequencyPenalty"]);
  g != null && a(o, ["frequencyPenalty"], g);
  const _ = r(t, ["seed"]);
  _ != null && a(o, ["seed"], _);
  const y = r(t, ["responseMimeType"]);
  y != null && a(o, ["responseMimeType"], y);
  const I = r(t, ["responseSchema"]);
  I != null && a(o, ["responseSchema"], Ks(I));
  const S = r(t, ["responseJsonSchema"]);
  if (S != null && a(o, ["responseJsonSchema"], S), r(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (r(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const A = r(t, ["safetySettings"]);
  if (n !== void 0 && A != null) {
    let Y = A;
    Array.isArray(Y) && (Y = Y.map((W) => Lg(W))), a(n, ["safetySettings"], Y);
  }
  const R = r(t, ["tools"]);
  if (n !== void 0 && R != null) {
    let Y = Ut(R);
    Array.isArray(Y) && (Y = Y.map((W) => $g(Lt(W)))), a(n, ["tools"], Y);
  }
  const $ = r(t, ["toolConfig"]);
  if (n !== void 0 && $ != null && a(n, ["toolConfig"], Ug($)), r(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const T = r(t, ["cachedContent"]);
  n !== void 0 && T != null && a(n, ["cachedContent"], Ke(e, T));
  const U = r(t, ["responseModalities"]);
  U != null && a(o, ["responseModalities"], U);
  const C = r(t, ["mediaResolution"]);
  C != null && a(o, ["mediaResolution"], C);
  const k = r(t, ["speechConfig"]);
  if (k != null && a(o, ["speechConfig"], Ys(k)), r(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const V = r(t, ["thinkingConfig"]);
  V != null && a(o, ["thinkingConfig"], V);
  const J = r(t, ["imageConfig"]);
  J != null && a(o, ["imageConfig"], Cg(J));
  const de = r(t, ["enableEnhancedCivicAnswers"]);
  if (de != null && a(o, ["enableEnhancedCivicAnswers"], de), r(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const ae = r(t, ["serviceTier"]);
  return n !== void 0 && ae != null && a(n, ["serviceTier"], ae), o;
}
function Eg(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && a(t, ["sdkHttpResponse"], n);
  const o = r(e, ["candidates"]);
  if (o != null) {
    let d = o;
    Array.isArray(d) && (d = d.map((h) => ng(h))), a(t, ["candidates"], d);
  }
  const i = r(e, ["modelVersion"]);
  i != null && a(t, ["modelVersion"], i);
  const s = r(e, ["promptFeedback"]);
  s != null && a(t, ["promptFeedback"], s);
  const l = r(e, ["responseId"]);
  l != null && a(t, ["responseId"], l);
  const u = r(e, ["usageMetadata"]);
  u != null && a(t, ["usageMetadata"], u);
  const c = r(e, ["modelStatus"]);
  return c != null && a(t, ["modelStatus"], c), t;
}
function Tg(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && a(n, ["_url", "name"], $t(e, o)), n;
}
function Sg(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && a(n, ["_url", "name"], $t(e, o)), n;
}
function wg(e) {
  const t = {}, n = r(e, ["authConfig"]);
  n != null && a(t, ["authConfig"], Wm(n));
  const o = r(e, ["enableWidget"]);
  return o != null && a(t, ["enableWidget"], o), t;
}
function Ig(e) {
  const t = {}, n = r(e, ["searchTypes"]);
  if (n != null && a(t, ["searchTypes"], n), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = r(e, ["timeRangeFilter"]);
  return o != null && a(t, ["timeRangeFilter"], o), t;
}
function Cg(e) {
  const t = {}, n = r(e, ["aspectRatio"]);
  n != null && a(t, ["aspectRatio"], n);
  const o = r(e, ["imageSize"]);
  if (o != null && a(t, ["imageSize"], o), r(e, ["personGeneration"]) !== void 0) throw new Error("personGeneration parameter is not supported in Gemini API.");
  if (r(e, ["prominentPeople"]) !== void 0) throw new Error("prominentPeople parameter is not supported in Gemini API.");
  if (r(e, ["outputMimeType"]) !== void 0) throw new Error("outputMimeType parameter is not supported in Gemini API.");
  if (r(e, ["outputCompressionQuality"]) !== void 0) throw new Error("outputCompressionQuality parameter is not supported in Gemini API.");
  if (r(e, ["imageOutputOptions"]) !== void 0) throw new Error("imageOutputOptions parameter is not supported in Gemini API.");
  return t;
}
function Ag(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && a(n, ["request", "model"], O(e, o));
  const i = r(t, ["contents"]);
  if (i != null) {
    let u = pe(i);
    Array.isArray(u) && (u = u.map((c) => qd(c))), a(n, ["request", "contents"], u);
  }
  const s = r(t, ["metadata"]);
  s != null && a(n, ["metadata"], s);
  const l = r(t, ["config"]);
  return l != null && a(n, ["request", "generationConfig"], vg(e, l, r(n, ["request"], {}))), n;
}
function Rg(e) {
  const t = {}, n = r(e, ["response"]);
  n != null && a(t, ["response"], Eg(n));
  const o = r(e, ["metadata"]);
  o != null && a(t, ["metadata"], o);
  const i = r(e, ["error"]);
  return i != null && a(t, ["error"], i), t;
}
function bg(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && a(t, ["_query", "pageSize"], o);
  const i = r(e, ["pageToken"]);
  if (t !== void 0 && i != null && a(t, ["_query", "pageToken"], i), r(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function Pg(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && a(t, ["_query", "pageSize"], o);
  const i = r(e, ["pageToken"]);
  t !== void 0 && i != null && a(t, ["_query", "pageToken"], i);
  const s = r(e, ["filter"]);
  return t !== void 0 && s != null && a(t, ["_query", "filter"], s), n;
}
function xg(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && bg(n, t), t;
}
function Mg(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && Pg(n, t), t;
}
function Ng(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && a(t, ["sdkHttpResponse"], n);
  const o = r(e, ["nextPageToken"]);
  o != null && a(t, ["nextPageToken"], o);
  const i = r(e, ["operations"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((l) => So(l))), a(t, ["batchJobs"], s);
  }
  return t;
}
function kg(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && a(t, ["sdkHttpResponse"], n);
  const o = r(e, ["nextPageToken"]);
  o != null && a(t, ["nextPageToken"], o);
  const i = r(e, ["batchPredictionJobs"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((l) => ns(l))), a(t, ["batchJobs"], s);
  }
  return t;
}
function Dg(e) {
  const t = {}, n = r(e, ["mediaResolution"]);
  n != null && a(t, ["mediaResolution"], n);
  const o = r(e, ["codeExecutionResult"]);
  o != null && a(t, ["codeExecutionResult"], o);
  const i = r(e, ["executableCode"]);
  i != null && a(t, ["executableCode"], i);
  const s = r(e, ["fileData"]);
  s != null && a(t, ["fileData"], gg(s));
  const l = r(e, ["functionCall"]);
  l != null && a(t, ["functionCall"], _g(l));
  const u = r(e, ["functionResponse"]);
  u != null && a(t, ["functionResponse"], u);
  const c = r(e, ["inlineData"]);
  c != null && a(t, ["inlineData"], jm(c));
  const d = r(e, ["text"]);
  d != null && a(t, ["text"], d);
  const h = r(e, ["thought"]);
  h != null && a(t, ["thought"], h);
  const f = r(e, ["thoughtSignature"]);
  f != null && a(t, ["thoughtSignature"], f);
  const p = r(e, ["videoMetadata"]);
  p != null && a(t, ["videoMetadata"], p);
  const m = r(e, ["toolCall"]);
  m != null && a(t, ["toolCall"], m);
  const g = r(e, ["toolResponse"]);
  g != null && a(t, ["toolResponse"], g);
  const _ = r(e, ["partMetadata"]);
  return _ != null && a(t, ["partMetadata"], _), t;
}
function Lg(e) {
  const t = {}, n = r(e, ["category"]);
  if (n != null && a(t, ["category"], n), r(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = r(e, ["threshold"]);
  return o != null && a(t, ["threshold"], o), t;
}
function Ug(e) {
  const t = {}, n = r(e, ["retrievalConfig"]);
  n != null && a(t, ["retrievalConfig"], n);
  const o = r(e, ["functionCallingConfig"]);
  o != null && a(t, ["functionCallingConfig"], yg(o));
  const i = r(e, ["includeServerSideToolInvocations"]);
  return i != null && a(t, ["includeServerSideToolInvocations"], i), t;
}
function $g(e) {
  const t = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = r(e, ["computerUse"]);
  n != null && a(t, ["computerUse"], n);
  const o = r(e, ["fileSearch"]);
  o != null && a(t, ["fileSearch"], o);
  const i = r(e, ["googleSearch"]);
  i != null && a(t, ["googleSearch"], Ig(i));
  const s = r(e, ["googleMaps"]);
  s != null && a(t, ["googleMaps"], wg(s));
  const l = r(e, ["codeExecution"]);
  if (l != null && a(t, ["codeExecution"], l), r(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = r(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), a(t, ["functionDeclarations"], f);
  }
  const c = r(e, ["googleSearchRetrieval"]);
  if (c != null && a(t, ["googleSearchRetrieval"], c), r(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = r(e, ["urlContext"]);
  d != null && a(t, ["urlContext"], d);
  const h = r(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), a(t, ["mcpServers"], f);
  }
  return t;
}
var Je;
(function(e) {
  e.PAGED_ITEM_BATCH_JOBS = "batchJobs", e.PAGED_ITEM_MODELS = "models", e.PAGED_ITEM_TUNING_JOBS = "tuningJobs", e.PAGED_ITEM_FILES = "files", e.PAGED_ITEM_CACHED_CONTENTS = "cachedContents", e.PAGED_ITEM_FILE_SEARCH_STORES = "fileSearchStores", e.PAGED_ITEM_DOCUMENTS = "documents";
})(Je || (Je = {}));
var pt = class {
  constructor(e, t, n, o) {
    this.pageInternal = [], this.paramsInternal = {}, this.requestInternal = t, this.init(e, n, o);
  }
  init(e, t, n) {
    var o, i;
    this.nameInternal = e, this.pageInternal = t[this.nameInternal] || [], this.sdkHttpResponseInternal = t?.sdkHttpResponse, this.idxInternal = 0;
    let s = { config: {} };
    !n || Object.keys(n).length === 0 ? s = { config: {} } : typeof n == "object" ? s = Object.assign({}, n) : s = n, s.config && (s.config.pageToken = t.nextPageToken), this.paramsInternal = s, this.pageInternalSize = (i = (o = s.config) === null || o === void 0 ? void 0 : o.pageSize) !== null && i !== void 0 ? i : this.pageInternal.length;
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
}, Fg = class extends We {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new pt(Je.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = wl(this.apiClient, e), n = t._url, o = b("{model}:batchGenerateContent", n), i = t.batch.inputConfig.requests, s = i.requests, l = [];
    for (const u of s) {
      const c = Object.assign({}, u);
      if (c.systemInstruction) {
        const d = c.systemInstruction;
        delete c.systemInstruction;
        const h = c.request;
        h.systemInstruction = d, c.request = h;
      }
      l.push(c);
    }
    return i.requests = l, delete t.config, delete t._url, delete t._query, {
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
      const i = this.getGcsUri(e), s = this.getBigqueryUri(e);
      if (i) i.endsWith(".jsonl") ? n.dest = `${i.slice(0, -6)}/dest` : n.dest = `${i}_dest_${o}`;
      else if (s) n.dest = `${s}_dest_${o}`;
      else throw new Error("Unsupported source for Vertex AI: No GCS or BigQuery URI found.");
    }
    return n;
  }
  async createInternal(e) {
    var t, n, o, i;
    let s, l = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = rg(this.apiClient, e);
      return l = b("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => ns(d));
    } else {
      const c = wl(this.apiClient, e);
      return l = b("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), s.then((d) => So(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let o, i = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const l = lg(this.apiClient, e);
      return i = b("{model}:asyncBatchEmbedContent", l._url), s = l._query, delete l._url, delete l._query, o = this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(l),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => So(u));
    }
  }
  async get(e) {
    var t, n, o, i;
    let s, l = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Sg(this.apiClient, e);
      return l = b("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => ns(d));
    } else {
      const c = Tg(this.apiClient, e);
      return l = b("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), s.then((d) => So(d));
    }
  }
  async cancel(e) {
    var t, n, o, i;
    let s = "", l = {};
    if (this.apiClient.isVertexAI()) {
      const u = tg(this.apiClient, e);
      s = b("batchPredictionJobs/{name}:cancel", u._url), l = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: s,
        queryParams: l,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = eg(this.apiClient, e);
      s = b("batches/{name}:cancel", u._url), l = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: s,
        queryParams: l,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n, o, i;
    let s, l = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Mg(e);
      return l = b("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = kg(d), f = new vl();
        return Object.assign(f, h), f;
      });
    } else {
      const c = xg(e);
      return l = b("batches", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Ng(d), f = new vl();
        return Object.assign(f, h), f;
      });
    }
  }
  async delete(e) {
    var t, n, o, i;
    let s, l = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = cg(this.apiClient, e);
      return l = b("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => fg(d));
    } else {
      const c = ug(this.apiClient, e);
      return l = b("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => dg(d));
    }
  }
};
function Gg(e) {
  const t = {}, n = r(e, ["apiKey"]);
  if (n != null && a(t, ["apiKey"], n), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Bg(e) {
  const t = {}, n = r(e, ["data"]);
  if (n != null && a(t, ["data"], n), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["mimeType"]);
  return o != null && a(t, ["mimeType"], o), t;
}
function Il(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((s) => u_(s))), a(t, ["parts"], i);
  }
  const o = r(e, ["role"]);
  return o != null && a(t, ["role"], o), t;
}
function Cl(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((s) => c_(s))), a(t, ["parts"], i);
  }
  const o = r(e, ["role"]);
  return o != null && a(t, ["role"], o), t;
}
function qg(e, t) {
  const n = {}, o = r(e, ["ttl"]);
  t !== void 0 && o != null && a(t, ["ttl"], o);
  const i = r(e, ["expireTime"]);
  t !== void 0 && i != null && a(t, ["expireTime"], i);
  const s = r(e, ["displayName"]);
  t !== void 0 && s != null && a(t, ["displayName"], s);
  const l = r(e, ["contents"]);
  if (t !== void 0 && l != null) {
    let h = pe(l);
    Array.isArray(h) && (h = h.map((f) => Il(f))), a(t, ["contents"], h);
  }
  const u = r(e, ["systemInstruction"]);
  t !== void 0 && u != null && a(t, ["systemInstruction"], Il(ne(u)));
  const c = r(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((f) => h_(f))), a(t, ["tools"], h);
  }
  const d = r(e, ["toolConfig"]);
  if (t !== void 0 && d != null && a(t, ["toolConfig"], d_(d)), r(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function Vg(e, t) {
  const n = {}, o = r(e, ["ttl"]);
  t !== void 0 && o != null && a(t, ["ttl"], o);
  const i = r(e, ["expireTime"]);
  t !== void 0 && i != null && a(t, ["expireTime"], i);
  const s = r(e, ["displayName"]);
  t !== void 0 && s != null && a(t, ["displayName"], s);
  const l = r(e, ["contents"]);
  if (t !== void 0 && l != null) {
    let f = pe(l);
    Array.isArray(f) && (f = f.map((p) => Cl(p))), a(t, ["contents"], f);
  }
  const u = r(e, ["systemInstruction"]);
  t !== void 0 && u != null && a(t, ["systemInstruction"], Cl(ne(u)));
  const c = r(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((p) => p_(p))), a(t, ["tools"], f);
  }
  const d = r(e, ["toolConfig"]);
  t !== void 0 && d != null && a(t, ["toolConfig"], f_(d));
  const h = r(e, ["kmsKeyName"]);
  return t !== void 0 && h != null && a(t, ["encryption_spec", "kmsKeyName"], h), n;
}
function Hg(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && a(n, ["model"], Pd(e, o));
  const i = r(t, ["config"]);
  return i != null && qg(i, n), n;
}
function Og(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && a(n, ["model"], Pd(e, o));
  const i = r(t, ["config"]);
  return i != null && Vg(i, n), n;
}
function Jg(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && a(n, ["_url", "name"], Ke(e, o)), n;
}
function Wg(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && a(n, ["_url", "name"], Ke(e, o)), n;
}
function Kg(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && a(t, ["sdkHttpResponse"], n), t;
}
function Yg(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && a(t, ["sdkHttpResponse"], n), t;
}
function zg(e) {
  const t = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = r(e, ["fileUri"]);
  n != null && a(t, ["fileUri"], n);
  const o = r(e, ["mimeType"]);
  return o != null && a(t, ["mimeType"], o), t;
}
function Xg(e) {
  const t = {}, n = r(e, ["id"]);
  n != null && a(t, ["id"], n);
  const o = r(e, ["args"]);
  o != null && a(t, ["args"], o);
  const i = r(e, ["name"]);
  if (i != null && a(t, ["name"], i), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Qg(e) {
  const t = {}, n = r(e, ["allowedFunctionNames"]);
  n != null && a(t, ["allowedFunctionNames"], n);
  const o = r(e, ["mode"]);
  if (o != null && a(t, ["mode"], o), r(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function Zg(e) {
  const t = {}, n = r(e, ["description"]);
  n != null && a(t, ["description"], n);
  const o = r(e, ["name"]);
  o != null && a(t, ["name"], o);
  const i = r(e, ["parameters"]);
  i != null && a(t, ["parameters"], i);
  const s = r(e, ["parametersJsonSchema"]);
  s != null && a(t, ["parametersJsonSchema"], s);
  const l = r(e, ["response"]);
  l != null && a(t, ["response"], l);
  const u = r(e, ["responseJsonSchema"]);
  if (u != null && a(t, ["responseJsonSchema"], u), r(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return t;
}
function jg(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && a(n, ["_url", "name"], Ke(e, o)), n;
}
function e_(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && a(n, ["_url", "name"], Ke(e, o)), n;
}
function t_(e) {
  const t = {}, n = r(e, ["authConfig"]);
  n != null && a(t, ["authConfig"], Gg(n));
  const o = r(e, ["enableWidget"]);
  return o != null && a(t, ["enableWidget"], o), t;
}
function n_(e) {
  const t = {}, n = r(e, ["searchTypes"]);
  if (n != null && a(t, ["searchTypes"], n), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = r(e, ["timeRangeFilter"]);
  return o != null && a(t, ["timeRangeFilter"], o), t;
}
function o_(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && a(t, ["_query", "pageSize"], o);
  const i = r(e, ["pageToken"]);
  return t !== void 0 && i != null && a(t, ["_query", "pageToken"], i), n;
}
function i_(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && a(t, ["_query", "pageSize"], o);
  const i = r(e, ["pageToken"]);
  return t !== void 0 && i != null && a(t, ["_query", "pageToken"], i), n;
}
function s_(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && o_(n, t), t;
}
function r_(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && i_(n, t), t;
}
function a_(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && a(t, ["sdkHttpResponse"], n);
  const o = r(e, ["nextPageToken"]);
  o != null && a(t, ["nextPageToken"], o);
  const i = r(e, ["cachedContents"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((l) => l)), a(t, ["cachedContents"], s);
  }
  return t;
}
function l_(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && a(t, ["sdkHttpResponse"], n);
  const o = r(e, ["nextPageToken"]);
  o != null && a(t, ["nextPageToken"], o);
  const i = r(e, ["cachedContents"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((l) => l)), a(t, ["cachedContents"], s);
  }
  return t;
}
function u_(e) {
  const t = {}, n = r(e, ["mediaResolution"]);
  n != null && a(t, ["mediaResolution"], n);
  const o = r(e, ["codeExecutionResult"]);
  o != null && a(t, ["codeExecutionResult"], o);
  const i = r(e, ["executableCode"]);
  i != null && a(t, ["executableCode"], i);
  const s = r(e, ["fileData"]);
  s != null && a(t, ["fileData"], zg(s));
  const l = r(e, ["functionCall"]);
  l != null && a(t, ["functionCall"], Xg(l));
  const u = r(e, ["functionResponse"]);
  u != null && a(t, ["functionResponse"], u);
  const c = r(e, ["inlineData"]);
  c != null && a(t, ["inlineData"], Bg(c));
  const d = r(e, ["text"]);
  d != null && a(t, ["text"], d);
  const h = r(e, ["thought"]);
  h != null && a(t, ["thought"], h);
  const f = r(e, ["thoughtSignature"]);
  f != null && a(t, ["thoughtSignature"], f);
  const p = r(e, ["videoMetadata"]);
  p != null && a(t, ["videoMetadata"], p);
  const m = r(e, ["toolCall"]);
  m != null && a(t, ["toolCall"], m);
  const g = r(e, ["toolResponse"]);
  g != null && a(t, ["toolResponse"], g);
  const _ = r(e, ["partMetadata"]);
  return _ != null && a(t, ["partMetadata"], _), t;
}
function c_(e) {
  const t = {}, n = r(e, ["mediaResolution"]);
  n != null && a(t, ["mediaResolution"], n);
  const o = r(e, ["codeExecutionResult"]);
  o != null && a(t, ["codeExecutionResult"], o);
  const i = r(e, ["executableCode"]);
  i != null && a(t, ["executableCode"], i);
  const s = r(e, ["fileData"]);
  s != null && a(t, ["fileData"], s);
  const l = r(e, ["functionCall"]);
  l != null && a(t, ["functionCall"], l);
  const u = r(e, ["functionResponse"]);
  u != null && a(t, ["functionResponse"], u);
  const c = r(e, ["inlineData"]);
  c != null && a(t, ["inlineData"], c);
  const d = r(e, ["text"]);
  d != null && a(t, ["text"], d);
  const h = r(e, ["thought"]);
  h != null && a(t, ["thought"], h);
  const f = r(e, ["thoughtSignature"]);
  f != null && a(t, ["thoughtSignature"], f);
  const p = r(e, ["videoMetadata"]);
  if (p != null && a(t, ["videoMetadata"], p), r(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (r(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (r(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return t;
}
function d_(e) {
  const t = {}, n = r(e, ["retrievalConfig"]);
  n != null && a(t, ["retrievalConfig"], n);
  const o = r(e, ["functionCallingConfig"]);
  o != null && a(t, ["functionCallingConfig"], Qg(o));
  const i = r(e, ["includeServerSideToolInvocations"]);
  return i != null && a(t, ["includeServerSideToolInvocations"], i), t;
}
function f_(e) {
  const t = {}, n = r(e, ["retrievalConfig"]);
  n != null && a(t, ["retrievalConfig"], n);
  const o = r(e, ["functionCallingConfig"]);
  if (o != null && a(t, ["functionCallingConfig"], o), r(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function h_(e) {
  const t = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = r(e, ["computerUse"]);
  n != null && a(t, ["computerUse"], n);
  const o = r(e, ["fileSearch"]);
  o != null && a(t, ["fileSearch"], o);
  const i = r(e, ["googleSearch"]);
  i != null && a(t, ["googleSearch"], n_(i));
  const s = r(e, ["googleMaps"]);
  s != null && a(t, ["googleMaps"], t_(s));
  const l = r(e, ["codeExecution"]);
  if (l != null && a(t, ["codeExecution"], l), r(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = r(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), a(t, ["functionDeclarations"], f);
  }
  const c = r(e, ["googleSearchRetrieval"]);
  if (c != null && a(t, ["googleSearchRetrieval"], c), r(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = r(e, ["urlContext"]);
  d != null && a(t, ["urlContext"], d);
  const h = r(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), a(t, ["mcpServers"], f);
  }
  return t;
}
function p_(e) {
  const t = {}, n = r(e, ["retrieval"]);
  n != null && a(t, ["retrieval"], n);
  const o = r(e, ["computerUse"]);
  if (o != null && a(t, ["computerUse"], o), r(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const i = r(e, ["googleSearch"]);
  i != null && a(t, ["googleSearch"], i);
  const s = r(e, ["googleMaps"]);
  s != null && a(t, ["googleMaps"], s);
  const l = r(e, ["codeExecution"]);
  l != null && a(t, ["codeExecution"], l);
  const u = r(e, ["enterpriseWebSearch"]);
  u != null && a(t, ["enterpriseWebSearch"], u);
  const c = r(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => Zg(m))), a(t, ["functionDeclarations"], p);
  }
  const d = r(e, ["googleSearchRetrieval"]);
  d != null && a(t, ["googleSearchRetrieval"], d);
  const h = r(e, ["parallelAiSearch"]);
  h != null && a(t, ["parallelAiSearch"], h);
  const f = r(e, ["urlContext"]);
  if (f != null && a(t, ["urlContext"], f), r(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function m_(e, t) {
  const n = {}, o = r(e, ["ttl"]);
  t !== void 0 && o != null && a(t, ["ttl"], o);
  const i = r(e, ["expireTime"]);
  return t !== void 0 && i != null && a(t, ["expireTime"], i), n;
}
function g_(e, t) {
  const n = {}, o = r(e, ["ttl"]);
  t !== void 0 && o != null && a(t, ["ttl"], o);
  const i = r(e, ["expireTime"]);
  return t !== void 0 && i != null && a(t, ["expireTime"], i), n;
}
function __(e, t) {
  const n = {}, o = r(t, ["name"]);
  o != null && a(n, ["_url", "name"], Ke(e, o));
  const i = r(t, ["config"]);
  return i != null && m_(i, n), n;
}
function y_(e, t) {
  const n = {}, o = r(t, ["name"]);
  o != null && a(n, ["_url", "name"], Ke(e, o));
  const i = r(t, ["config"]);
  return i != null && g_(i, n), n;
}
var v_ = class extends We {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new pt(Je.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, o, i;
    let s, l = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Og(this.apiClient, e);
      return l = b("cachedContents", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => d);
    } else {
      const c = Hg(this.apiClient, e);
      return l = b("cachedContents", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), s.then((d) => d);
    }
  }
  async get(e) {
    var t, n, o, i;
    let s, l = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = e_(this.apiClient, e);
      return l = b("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => d);
    } else {
      const c = jg(this.apiClient, e);
      return l = b("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), s.then((d) => d);
    }
  }
  async delete(e) {
    var t, n, o, i;
    let s, l = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Wg(this.apiClient, e);
      return l = b("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Yg(d), f = new _l();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Jg(this.apiClient, e);
      return l = b("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Kg(d), f = new _l();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, o, i;
    let s, l = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = y_(this.apiClient, e);
      return l = b("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => d);
    } else {
      const c = __(this.apiClient, e);
      return l = b("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), s.then((d) => d);
    }
  }
  async listInternal(e) {
    var t, n, o, i;
    let s, l = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = r_(e);
      return l = b("cachedContents", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = l_(d), f = new yl();
        return Object.assign(f, h), f;
      });
    } else {
      const c = s_(e);
      return l = b("cachedContents", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = a_(d), f = new yl();
        return Object.assign(f, h), f;
      });
    }
  }
};
function et(e, t) {
  var n = {};
  for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var i = 0, o = Object.getOwnPropertySymbols(e); i < o.length; i++) t.indexOf(o[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[i]) && (n[o[i]] = e[o[i]]);
  return n;
}
function Al(e) {
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
function q(e) {
  return this instanceof q ? (this.v = e, this) : new q(e);
}
function Me(e, t, n) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var o = n.apply(e, t || []), i, s = [];
  return i = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), u("next"), u("throw"), u("return", l), i[Symbol.asyncIterator] = function() {
    return this;
  }, i;
  function l(m) {
    return function(g) {
      return Promise.resolve(g).then(m, f);
    };
  }
  function u(m, g) {
    o[m] && (i[m] = function(_) {
      return new Promise(function(y, I) {
        s.push([
          m,
          _,
          y,
          I
        ]) > 1 || c(m, _);
      });
    }, g && (i[m] = g(i[m])));
  }
  function c(m, g) {
    try {
      d(o[m](g));
    } catch (_) {
      p(s[0][3], _);
    }
  }
  function d(m) {
    m.value instanceof q ? Promise.resolve(m.value.v).then(h, f) : p(s[0][2], m);
  }
  function h(m) {
    c("next", m);
  }
  function f(m) {
    c("throw", m);
  }
  function p(m, g) {
    m(g), s.shift(), s.length && c(s[0][0], s[0][1]);
  }
}
function Ne(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof Al == "function" ? Al(e) : e[Symbol.iterator](), n = {}, o("next"), o("throw"), o("return"), n[Symbol.asyncIterator] = function() {
    return this;
  }, n);
  function o(s) {
    n[s] = e[s] && function(l) {
      return new Promise(function(u, c) {
        l = e[s](l), i(u, c, l.done, l.value);
      });
    };
  }
  function i(s, l, u, c) {
    Promise.resolve(c).then(function(d) {
      s({
        value: d,
        done: u
      });
    }, l);
  }
}
function E_(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : Vd(n);
}
function Vd(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function T_(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function Rl(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let o = 0;
  for (; o < n; ) if (e[o].role === "user")
    t.push(e[o]), o++;
  else {
    const i = [];
    let s = !0;
    for (; o < n && e[o].role === "model"; )
      i.push(e[o]), s && !Vd(e[o]) && (s = !1), o++;
    s ? t.push(...i) : t.pop();
  }
  return t;
}
var S_ = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new w_(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, w_ = class {
  constructor(e, t, n, o = {}, i = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = o, this.history = i, this.sendPromise = Promise.resolve(), T_(i);
  }
  async sendMessage(e) {
    var t;
    await this.sendPromise;
    const n = ne(e.message), o = this.modelsModule.generateContent({
      model: this.model,
      contents: this.getHistory(!0).concat(n),
      config: (t = e.config) !== null && t !== void 0 ? t : this.config
    });
    return this.sendPromise = (async () => {
      var i, s, l;
      const u = await o, c = (s = (i = u.candidates) === null || i === void 0 ? void 0 : i[0]) === null || s === void 0 ? void 0 : s.content, d = u.automaticFunctionCallingHistory, h = this.getHistory(!0).length;
      let f = [];
      d != null && (f = (l = d.slice(h)) !== null && l !== void 0 ? l : []);
      const p = c ? [c] : [];
      this.recordHistory(n, p, f);
    })(), await this.sendPromise.catch(() => {
      this.sendPromise = Promise.resolve();
    }), o;
  }
  async sendMessageStream(e) {
    var t;
    await this.sendPromise;
    const n = ne(e.message), o = this.modelsModule.generateContentStream({
      model: this.model,
      contents: this.getHistory(!0).concat(n),
      config: (t = e.config) !== null && t !== void 0 ? t : this.config
    });
    this.sendPromise = o.then(() => {
    }).catch(() => {
    });
    const i = await o;
    return this.processStreamResponse(i, n);
  }
  getHistory(e = !1) {
    const t = e ? Rl(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return Me(this, arguments, function* () {
      var o, i, s, l, u, c;
      const d = [];
      try {
        for (var h = !0, f = Ne(e), p; p = yield q(f.next()), o = p.done, !o; h = !0) {
          l = p.value, h = !1;
          const m = l;
          if (E_(m)) {
            const g = (c = (u = m.candidates) === null || u === void 0 ? void 0 : u[0]) === null || c === void 0 ? void 0 : c.content;
            g !== void 0 && d.push(g);
          }
          yield yield q(m);
        }
      } catch (m) {
        i = { error: m };
      } finally {
        try {
          !h && !o && (s = f.return) && (yield q(s.call(f)));
        } finally {
          if (i) throw i.error;
        }
      }
      this.recordHistory(t, d);
    });
  }
  recordHistory(e, t, n) {
    let o = [];
    t.length > 0 && t.every((i) => i.role !== void 0) ? o = t : o.push({
      role: "model",
      parts: []
    }), n && n.length > 0 ? this.history.push(...Rl(n)) : this.history.push(e), this.history.push(...o);
  }
}, Hd = class Od extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, Od.prototype);
  }
};
function I_(e) {
  const t = {}, n = r(e, ["file"]);
  return n != null && a(t, ["file"], n), t;
}
function C_(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && a(t, ["sdkHttpResponse"], n), t;
}
function A_(e) {
  const t = {}, n = r(e, ["name"]);
  return n != null && a(t, ["_url", "file"], Ld(n)), t;
}
function R_(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && a(t, ["sdkHttpResponse"], n), t;
}
function b_(e) {
  const t = {}, n = r(e, ["name"]);
  return n != null && a(t, ["_url", "file"], Ld(n)), t;
}
function P_(e) {
  const t = {}, n = r(e, ["uris"]);
  return n != null && a(t, ["uris"], n), t;
}
function x_(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && a(t, ["_query", "pageSize"], o);
  const i = r(e, ["pageToken"]);
  return t !== void 0 && i != null && a(t, ["_query", "pageToken"], i), n;
}
function M_(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && x_(n, t), t;
}
function N_(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && a(t, ["sdkHttpResponse"], n);
  const o = r(e, ["nextPageToken"]);
  o != null && a(t, ["nextPageToken"], o);
  const i = r(e, ["files"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((l) => l)), a(t, ["files"], s);
  }
  return t;
}
function k_(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && a(t, ["sdkHttpResponse"], n);
  const o = r(e, ["files"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => s)), a(t, ["files"], i);
  }
  return t;
}
var D_ = class extends We {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new pt(Je.PAGED_ITEM_FILES, (n) => this.listInternal(n), await this.listInternal(t), t);
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
    let o, i = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const l = M_(e);
      return i = b("files", l._url), s = l._query, delete l._url, delete l._query, o = this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(l),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = N_(u), d = new Pm();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let o, i = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const l = I_(e);
      return i = b("upload/v1beta/files", l._url), s = l._query, delete l._url, delete l._query, o = this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(l),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = C_(u), d = new xm();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let o, i = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const l = b_(e);
      return i = b("files/{file}", l._url), s = l._query, delete l._url, delete l._query, o = this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(l),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => u);
    }
  }
  async delete(e) {
    var t, n;
    let o, i = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const l = A_(e);
      return i = b("files/{file}", l._url), s = l._query, delete l._url, delete l._query, o = this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(l),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = R_(u), d = new Mm();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let o, i = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const l = P_(e);
      return i = b("files:register", l._url), s = l._query, delete l._url, delete l._query, o = this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(l),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = k_(u), d = new Nm();
        return Object.assign(d, c), d;
      });
    }
  }
};
function bl(e) {
  const t = {};
  if (r(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function L_(e) {
  const t = {}, n = r(e, ["apiKey"]);
  if (n != null && a(t, ["apiKey"], n), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function wo(e) {
  const t = {}, n = r(e, ["data"]);
  if (n != null && a(t, ["data"], n), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["mimeType"]);
  return o != null && a(t, ["mimeType"], o), t;
}
function U_(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((s) => j_(s))), a(t, ["parts"], i);
  }
  const o = r(e, ["role"]);
  return o != null && a(t, ["role"], o), t;
}
function $_(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((s) => ey(s))), a(t, ["parts"], i);
  }
  const o = r(e, ["role"]);
  return o != null && a(t, ["role"], o), t;
}
function F_(e) {
  const t = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = r(e, ["fileUri"]);
  n != null && a(t, ["fileUri"], n);
  const o = r(e, ["mimeType"]);
  return o != null && a(t, ["mimeType"], o), t;
}
function G_(e) {
  const t = {}, n = r(e, ["id"]);
  n != null && a(t, ["id"], n);
  const o = r(e, ["args"]);
  o != null && a(t, ["args"], o);
  const i = r(e, ["name"]);
  if (i != null && a(t, ["name"], i), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function B_(e) {
  const t = {}, n = r(e, ["description"]);
  n != null && a(t, ["description"], n);
  const o = r(e, ["name"]);
  o != null && a(t, ["name"], o);
  const i = r(e, ["parameters"]);
  i != null && a(t, ["parameters"], i);
  const s = r(e, ["parametersJsonSchema"]);
  s != null && a(t, ["parametersJsonSchema"], s);
  const l = r(e, ["response"]);
  l != null && a(t, ["response"], l);
  const u = r(e, ["responseJsonSchema"]);
  if (u != null && a(t, ["responseJsonSchema"], u), r(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return t;
}
function q_(e) {
  const t = {}, n = r(e, ["modelSelectionConfig"]);
  n != null && a(t, ["modelConfig"], n);
  const o = r(e, ["responseJsonSchema"]);
  o != null && a(t, ["responseJsonSchema"], o);
  const i = r(e, ["audioTimestamp"]);
  i != null && a(t, ["audioTimestamp"], i);
  const s = r(e, ["candidateCount"]);
  s != null && a(t, ["candidateCount"], s);
  const l = r(e, ["enableAffectiveDialog"]);
  l != null && a(t, ["enableAffectiveDialog"], l);
  const u = r(e, ["frequencyPenalty"]);
  u != null && a(t, ["frequencyPenalty"], u);
  const c = r(e, ["logprobs"]);
  c != null && a(t, ["logprobs"], c);
  const d = r(e, ["maxOutputTokens"]);
  d != null && a(t, ["maxOutputTokens"], d);
  const h = r(e, ["mediaResolution"]);
  h != null && a(t, ["mediaResolution"], h);
  const f = r(e, ["presencePenalty"]);
  f != null && a(t, ["presencePenalty"], f);
  const p = r(e, ["responseLogprobs"]);
  p != null && a(t, ["responseLogprobs"], p);
  const m = r(e, ["responseMimeType"]);
  m != null && a(t, ["responseMimeType"], m);
  const g = r(e, ["responseModalities"]);
  g != null && a(t, ["responseModalities"], g);
  const _ = r(e, ["responseSchema"]);
  _ != null && a(t, ["responseSchema"], _);
  const y = r(e, ["routingConfig"]);
  y != null && a(t, ["routingConfig"], y);
  const I = r(e, ["seed"]);
  I != null && a(t, ["seed"], I);
  const S = r(e, ["speechConfig"]);
  S != null && a(t, ["speechConfig"], S);
  const A = r(e, ["stopSequences"]);
  A != null && a(t, ["stopSequences"], A);
  const R = r(e, ["temperature"]);
  R != null && a(t, ["temperature"], R);
  const $ = r(e, ["thinkingConfig"]);
  $ != null && a(t, ["thinkingConfig"], $);
  const T = r(e, ["topK"]);
  T != null && a(t, ["topK"], T);
  const U = r(e, ["topP"]);
  if (U != null && a(t, ["topP"], U), r(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return t;
}
function V_(e) {
  const t = {}, n = r(e, ["authConfig"]);
  n != null && a(t, ["authConfig"], L_(n));
  const o = r(e, ["enableWidget"]);
  return o != null && a(t, ["enableWidget"], o), t;
}
function H_(e) {
  const t = {}, n = r(e, ["searchTypes"]);
  if (n != null && a(t, ["searchTypes"], n), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = r(e, ["timeRangeFilter"]);
  return o != null && a(t, ["timeRangeFilter"], o), t;
}
function O_(e, t) {
  const n = {}, o = r(e, ["generationConfig"]);
  t !== void 0 && o != null && a(t, ["setup", "generationConfig"], o);
  const i = r(e, ["responseModalities"]);
  t !== void 0 && i != null && a(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], i);
  const s = r(e, ["temperature"]);
  t !== void 0 && s != null && a(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], s);
  const l = r(e, ["topP"]);
  t !== void 0 && l != null && a(t, [
    "setup",
    "generationConfig",
    "topP"
  ], l);
  const u = r(e, ["topK"]);
  t !== void 0 && u != null && a(t, [
    "setup",
    "generationConfig",
    "topK"
  ], u);
  const c = r(e, ["maxOutputTokens"]);
  t !== void 0 && c != null && a(t, [
    "setup",
    "generationConfig",
    "maxOutputTokens"
  ], c);
  const d = r(e, ["mediaResolution"]);
  t !== void 0 && d != null && a(t, [
    "setup",
    "generationConfig",
    "mediaResolution"
  ], d);
  const h = r(e, ["seed"]);
  t !== void 0 && h != null && a(t, [
    "setup",
    "generationConfig",
    "seed"
  ], h);
  const f = r(e, ["speechConfig"]);
  t !== void 0 && f != null && a(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], zs(f));
  const p = r(e, ["thinkingConfig"]);
  t !== void 0 && p != null && a(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], p);
  const m = r(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && a(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const g = r(e, ["systemInstruction"]);
  t !== void 0 && g != null && a(t, ["setup", "systemInstruction"], U_(ne(g)));
  const _ = r(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let C = Ut(_);
    Array.isArray(C) && (C = C.map((k) => oy(Lt(k)))), a(t, ["setup", "tools"], C);
  }
  const y = r(e, ["sessionResumption"]);
  t !== void 0 && y != null && a(t, ["setup", "sessionResumption"], ny(y));
  const I = r(e, ["inputAudioTranscription"]);
  t !== void 0 && I != null && a(t, ["setup", "inputAudioTranscription"], bl(I));
  const S = r(e, ["outputAudioTranscription"]);
  t !== void 0 && S != null && a(t, ["setup", "outputAudioTranscription"], bl(S));
  const A = r(e, ["realtimeInputConfig"]);
  t !== void 0 && A != null && a(t, ["setup", "realtimeInputConfig"], A);
  const R = r(e, ["contextWindowCompression"]);
  t !== void 0 && R != null && a(t, ["setup", "contextWindowCompression"], R);
  const $ = r(e, ["proactivity"]);
  if (t !== void 0 && $ != null && a(t, ["setup", "proactivity"], $), r(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const T = r(e, ["avatarConfig"]);
  t !== void 0 && T != null && a(t, ["setup", "avatarConfig"], T);
  const U = r(e, ["safetySettings"]);
  if (t !== void 0 && U != null) {
    let C = U;
    Array.isArray(C) && (C = C.map((k) => ty(k))), a(t, ["setup", "safetySettings"], C);
  }
  return n;
}
function J_(e, t) {
  const n = {}, o = r(e, ["generationConfig"]);
  t !== void 0 && o != null && a(t, ["setup", "generationConfig"], q_(o));
  const i = r(e, ["responseModalities"]);
  t !== void 0 && i != null && a(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], i);
  const s = r(e, ["temperature"]);
  t !== void 0 && s != null && a(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], s);
  const l = r(e, ["topP"]);
  t !== void 0 && l != null && a(t, [
    "setup",
    "generationConfig",
    "topP"
  ], l);
  const u = r(e, ["topK"]);
  t !== void 0 && u != null && a(t, [
    "setup",
    "generationConfig",
    "topK"
  ], u);
  const c = r(e, ["maxOutputTokens"]);
  t !== void 0 && c != null && a(t, [
    "setup",
    "generationConfig",
    "maxOutputTokens"
  ], c);
  const d = r(e, ["mediaResolution"]);
  t !== void 0 && d != null && a(t, [
    "setup",
    "generationConfig",
    "mediaResolution"
  ], d);
  const h = r(e, ["seed"]);
  t !== void 0 && h != null && a(t, [
    "setup",
    "generationConfig",
    "seed"
  ], h);
  const f = r(e, ["speechConfig"]);
  t !== void 0 && f != null && a(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], zs(f));
  const p = r(e, ["thinkingConfig"]);
  t !== void 0 && p != null && a(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], p);
  const m = r(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && a(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const g = r(e, ["systemInstruction"]);
  t !== void 0 && g != null && a(t, ["setup", "systemInstruction"], $_(ne(g)));
  const _ = r(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let k = Ut(_);
    Array.isArray(k) && (k = k.map((V) => iy(Lt(V)))), a(t, ["setup", "tools"], k);
  }
  const y = r(e, ["sessionResumption"]);
  t !== void 0 && y != null && a(t, ["setup", "sessionResumption"], y);
  const I = r(e, ["inputAudioTranscription"]);
  t !== void 0 && I != null && a(t, ["setup", "inputAudioTranscription"], I);
  const S = r(e, ["outputAudioTranscription"]);
  t !== void 0 && S != null && a(t, ["setup", "outputAudioTranscription"], S);
  const A = r(e, ["realtimeInputConfig"]);
  t !== void 0 && A != null && a(t, ["setup", "realtimeInputConfig"], A);
  const R = r(e, ["contextWindowCompression"]);
  t !== void 0 && R != null && a(t, ["setup", "contextWindowCompression"], R);
  const $ = r(e, ["proactivity"]);
  t !== void 0 && $ != null && a(t, ["setup", "proactivity"], $);
  const T = r(e, ["explicitVadSignal"]);
  t !== void 0 && T != null && a(t, ["setup", "explicitVadSignal"], T);
  const U = r(e, ["avatarConfig"]);
  t !== void 0 && U != null && a(t, ["setup", "avatarConfig"], U);
  const C = r(e, ["safetySettings"]);
  if (t !== void 0 && C != null) {
    let k = C;
    Array.isArray(k) && (k = k.map((V) => V)), a(t, ["setup", "safetySettings"], k);
  }
  return n;
}
function W_(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && a(n, ["setup", "model"], O(e, o));
  const i = r(t, ["config"]);
  return i != null && a(n, ["config"], O_(i, n)), n;
}
function K_(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && a(n, ["setup", "model"], O(e, o));
  const i = r(t, ["config"]);
  return i != null && a(n, ["config"], J_(i, n)), n;
}
function Y_(e) {
  const t = {}, n = r(e, ["musicGenerationConfig"]);
  return n != null && a(t, ["musicGenerationConfig"], n), t;
}
function z_(e) {
  const t = {}, n = r(e, ["weightedPrompts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => i)), a(t, ["weightedPrompts"], o);
  }
  return t;
}
function X_(e) {
  const t = {}, n = r(e, ["media"]);
  if (n != null) {
    let d = xd(n);
    Array.isArray(d) && (d = d.map((h) => wo(h))), a(t, ["mediaChunks"], d);
  }
  const o = r(e, ["audio"]);
  o != null && a(t, ["audio"], wo(Nd(o)));
  const i = r(e, ["audioStreamEnd"]);
  i != null && a(t, ["audioStreamEnd"], i);
  const s = r(e, ["video"]);
  s != null && a(t, ["video"], wo(Md(s)));
  const l = r(e, ["text"]);
  l != null && a(t, ["text"], l);
  const u = r(e, ["activityStart"]);
  u != null && a(t, ["activityStart"], u);
  const c = r(e, ["activityEnd"]);
  return c != null && a(t, ["activityEnd"], c), t;
}
function Q_(e) {
  const t = {}, n = r(e, ["media"]);
  if (n != null) {
    let d = xd(n);
    Array.isArray(d) && (d = d.map((h) => h)), a(t, ["mediaChunks"], d);
  }
  const o = r(e, ["audio"]);
  o != null && a(t, ["audio"], Nd(o));
  const i = r(e, ["audioStreamEnd"]);
  i != null && a(t, ["audioStreamEnd"], i);
  const s = r(e, ["video"]);
  s != null && a(t, ["video"], Md(s));
  const l = r(e, ["text"]);
  l != null && a(t, ["text"], l);
  const u = r(e, ["activityStart"]);
  u != null && a(t, ["activityStart"], u);
  const c = r(e, ["activityEnd"]);
  return c != null && a(t, ["activityEnd"], c), t;
}
function Z_(e) {
  const t = {}, n = r(e, ["setupComplete"]);
  n != null && a(t, ["setupComplete"], n);
  const o = r(e, ["serverContent"]);
  o != null && a(t, ["serverContent"], o);
  const i = r(e, ["toolCall"]);
  i != null && a(t, ["toolCall"], i);
  const s = r(e, ["toolCallCancellation"]);
  s != null && a(t, ["toolCallCancellation"], s);
  const l = r(e, ["usageMetadata"]);
  l != null && a(t, ["usageMetadata"], sy(l));
  const u = r(e, ["goAway"]);
  u != null && a(t, ["goAway"], u);
  const c = r(e, ["sessionResumptionUpdate"]);
  c != null && a(t, ["sessionResumptionUpdate"], c);
  const d = r(e, ["voiceActivityDetectionSignal"]);
  d != null && a(t, ["voiceActivityDetectionSignal"], d);
  const h = r(e, ["voiceActivity"]);
  return h != null && a(t, ["voiceActivity"], ry(h)), t;
}
function j_(e) {
  const t = {}, n = r(e, ["mediaResolution"]);
  n != null && a(t, ["mediaResolution"], n);
  const o = r(e, ["codeExecutionResult"]);
  o != null && a(t, ["codeExecutionResult"], o);
  const i = r(e, ["executableCode"]);
  i != null && a(t, ["executableCode"], i);
  const s = r(e, ["fileData"]);
  s != null && a(t, ["fileData"], F_(s));
  const l = r(e, ["functionCall"]);
  l != null && a(t, ["functionCall"], G_(l));
  const u = r(e, ["functionResponse"]);
  u != null && a(t, ["functionResponse"], u);
  const c = r(e, ["inlineData"]);
  c != null && a(t, ["inlineData"], wo(c));
  const d = r(e, ["text"]);
  d != null && a(t, ["text"], d);
  const h = r(e, ["thought"]);
  h != null && a(t, ["thought"], h);
  const f = r(e, ["thoughtSignature"]);
  f != null && a(t, ["thoughtSignature"], f);
  const p = r(e, ["videoMetadata"]);
  p != null && a(t, ["videoMetadata"], p);
  const m = r(e, ["toolCall"]);
  m != null && a(t, ["toolCall"], m);
  const g = r(e, ["toolResponse"]);
  g != null && a(t, ["toolResponse"], g);
  const _ = r(e, ["partMetadata"]);
  return _ != null && a(t, ["partMetadata"], _), t;
}
function ey(e) {
  const t = {}, n = r(e, ["mediaResolution"]);
  n != null && a(t, ["mediaResolution"], n);
  const o = r(e, ["codeExecutionResult"]);
  o != null && a(t, ["codeExecutionResult"], o);
  const i = r(e, ["executableCode"]);
  i != null && a(t, ["executableCode"], i);
  const s = r(e, ["fileData"]);
  s != null && a(t, ["fileData"], s);
  const l = r(e, ["functionCall"]);
  l != null && a(t, ["functionCall"], l);
  const u = r(e, ["functionResponse"]);
  u != null && a(t, ["functionResponse"], u);
  const c = r(e, ["inlineData"]);
  c != null && a(t, ["inlineData"], c);
  const d = r(e, ["text"]);
  d != null && a(t, ["text"], d);
  const h = r(e, ["thought"]);
  h != null && a(t, ["thought"], h);
  const f = r(e, ["thoughtSignature"]);
  f != null && a(t, ["thoughtSignature"], f);
  const p = r(e, ["videoMetadata"]);
  if (p != null && a(t, ["videoMetadata"], p), r(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (r(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (r(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return t;
}
function ty(e) {
  const t = {}, n = r(e, ["category"]);
  if (n != null && a(t, ["category"], n), r(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = r(e, ["threshold"]);
  return o != null && a(t, ["threshold"], o), t;
}
function ny(e) {
  const t = {}, n = r(e, ["handle"]);
  if (n != null && a(t, ["handle"], n), r(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function oy(e) {
  const t = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = r(e, ["computerUse"]);
  n != null && a(t, ["computerUse"], n);
  const o = r(e, ["fileSearch"]);
  o != null && a(t, ["fileSearch"], o);
  const i = r(e, ["googleSearch"]);
  i != null && a(t, ["googleSearch"], H_(i));
  const s = r(e, ["googleMaps"]);
  s != null && a(t, ["googleMaps"], V_(s));
  const l = r(e, ["codeExecution"]);
  if (l != null && a(t, ["codeExecution"], l), r(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = r(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), a(t, ["functionDeclarations"], f);
  }
  const c = r(e, ["googleSearchRetrieval"]);
  if (c != null && a(t, ["googleSearchRetrieval"], c), r(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = r(e, ["urlContext"]);
  d != null && a(t, ["urlContext"], d);
  const h = r(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), a(t, ["mcpServers"], f);
  }
  return t;
}
function iy(e) {
  const t = {}, n = r(e, ["retrieval"]);
  n != null && a(t, ["retrieval"], n);
  const o = r(e, ["computerUse"]);
  if (o != null && a(t, ["computerUse"], o), r(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const i = r(e, ["googleSearch"]);
  i != null && a(t, ["googleSearch"], i);
  const s = r(e, ["googleMaps"]);
  s != null && a(t, ["googleMaps"], s);
  const l = r(e, ["codeExecution"]);
  l != null && a(t, ["codeExecution"], l);
  const u = r(e, ["enterpriseWebSearch"]);
  u != null && a(t, ["enterpriseWebSearch"], u);
  const c = r(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => B_(m))), a(t, ["functionDeclarations"], p);
  }
  const d = r(e, ["googleSearchRetrieval"]);
  d != null && a(t, ["googleSearchRetrieval"], d);
  const h = r(e, ["parallelAiSearch"]);
  h != null && a(t, ["parallelAiSearch"], h);
  const f = r(e, ["urlContext"]);
  if (f != null && a(t, ["urlContext"], f), r(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function sy(e) {
  const t = {}, n = r(e, ["promptTokenCount"]);
  n != null && a(t, ["promptTokenCount"], n);
  const o = r(e, ["cachedContentTokenCount"]);
  o != null && a(t, ["cachedContentTokenCount"], o);
  const i = r(e, ["candidatesTokenCount"]);
  i != null && a(t, ["responseTokenCount"], i);
  const s = r(e, ["toolUsePromptTokenCount"]);
  s != null && a(t, ["toolUsePromptTokenCount"], s);
  const l = r(e, ["thoughtsTokenCount"]);
  l != null && a(t, ["thoughtsTokenCount"], l);
  const u = r(e, ["totalTokenCount"]);
  u != null && a(t, ["totalTokenCount"], u);
  const c = r(e, ["promptTokensDetails"]);
  if (c != null) {
    let m = c;
    Array.isArray(m) && (m = m.map((g) => g)), a(t, ["promptTokensDetails"], m);
  }
  const d = r(e, ["cacheTokensDetails"]);
  if (d != null) {
    let m = d;
    Array.isArray(m) && (m = m.map((g) => g)), a(t, ["cacheTokensDetails"], m);
  }
  const h = r(e, ["candidatesTokensDetails"]);
  if (h != null) {
    let m = h;
    Array.isArray(m) && (m = m.map((g) => g)), a(t, ["responseTokensDetails"], m);
  }
  const f = r(e, ["toolUsePromptTokensDetails"]);
  if (f != null) {
    let m = f;
    Array.isArray(m) && (m = m.map((g) => g)), a(t, ["toolUsePromptTokensDetails"], m);
  }
  const p = r(e, ["trafficType"]);
  return p != null && a(t, ["trafficType"], p), t;
}
function ry(e) {
  const t = {}, n = r(e, ["type"]);
  return n != null && a(t, ["voiceActivityType"], n), t;
}
function ay(e, t) {
  const n = {}, o = r(e, ["apiKey"]);
  if (o != null && a(n, ["apiKey"], o), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function ly(e, t) {
  const n = {}, o = r(e, ["data"]);
  if (o != null && a(n, ["data"], o), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const i = r(e, ["mimeType"]);
  return i != null && a(n, ["mimeType"], i), n;
}
function uy(e, t) {
  const n = {}, o = r(e, ["content"]);
  o != null && a(n, ["content"], o);
  const i = r(e, ["citationMetadata"]);
  i != null && a(n, ["citationMetadata"], cy(i));
  const s = r(e, ["tokenCount"]);
  s != null && a(n, ["tokenCount"], s);
  const l = r(e, ["finishReason"]);
  l != null && a(n, ["finishReason"], l);
  const u = r(e, ["groundingMetadata"]);
  u != null && a(n, ["groundingMetadata"], u);
  const c = r(e, ["avgLogprobs"]);
  c != null && a(n, ["avgLogprobs"], c);
  const d = r(e, ["index"]);
  d != null && a(n, ["index"], d);
  const h = r(e, ["logprobsResult"]);
  h != null && a(n, ["logprobsResult"], h);
  const f = r(e, ["safetyRatings"]);
  if (f != null) {
    let m = f;
    Array.isArray(m) && (m = m.map((g) => g)), a(n, ["safetyRatings"], m);
  }
  const p = r(e, ["urlContextMetadata"]);
  return p != null && a(n, ["urlContextMetadata"], p), n;
}
function cy(e, t) {
  const n = {}, o = r(e, ["citationSources"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => s)), a(n, ["citations"], i);
  }
  return n;
}
function dy(e, t, n) {
  const o = {}, i = r(t, ["model"]);
  i != null && a(o, ["_url", "model"], O(e, i));
  const s = r(t, ["contents"]);
  if (s != null) {
    let l = pe(s);
    Array.isArray(l) && (l = l.map((u) => Ft(u))), a(o, ["contents"], l);
  }
  return o;
}
function fy(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && a(n, ["sdkHttpResponse"], o);
  const i = r(e, ["tokensInfo"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((l) => l)), a(n, ["tokensInfo"], s);
  }
  return n;
}
function hy(e, t) {
  const n = {}, o = r(e, ["values"]);
  o != null && a(n, ["values"], o);
  const i = r(e, ["statistics"]);
  return i != null && a(n, ["statistics"], py(i)), n;
}
function py(e, t) {
  const n = {}, o = r(e, ["truncated"]);
  o != null && a(n, ["truncated"], o);
  const i = r(e, ["token_count"]);
  return i != null && a(n, ["tokenCount"], i), n;
}
function Ln(e, t) {
  const n = {}, o = r(e, ["parts"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((l) => wv(l))), a(n, ["parts"], s);
  }
  const i = r(e, ["role"]);
  return i != null && a(n, ["role"], i), n;
}
function Ft(e, t) {
  const n = {}, o = r(e, ["parts"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((l) => Iv(l))), a(n, ["parts"], s);
  }
  const i = r(e, ["role"]);
  return i != null && a(n, ["role"], i), n;
}
function my(e, t) {
  const n = {}, o = r(e, ["controlType"]);
  o != null && a(n, ["controlType"], o);
  const i = r(e, ["enableControlImageComputation"]);
  return i != null && a(n, ["computeControl"], i), n;
}
function gy(e, t) {
  const n = {};
  if (r(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (r(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (r(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function _y(e, t, n) {
  const o = {}, i = r(e, ["systemInstruction"]);
  t !== void 0 && i != null && a(t, ["systemInstruction"], Ft(ne(i)));
  const s = r(e, ["tools"]);
  if (t !== void 0 && s != null) {
    let u = s;
    Array.isArray(u) && (u = u.map((c) => Yd(c))), a(t, ["tools"], u);
  }
  const l = r(e, ["generationConfig"]);
  return t !== void 0 && l != null && a(t, ["generationConfig"], lv(l)), o;
}
function yy(e, t, n) {
  const o = {}, i = r(t, ["model"]);
  i != null && a(o, ["_url", "model"], O(e, i));
  const s = r(t, ["contents"]);
  if (s != null) {
    let u = pe(s);
    Array.isArray(u) && (u = u.map((c) => Ln(c))), a(o, ["contents"], u);
  }
  const l = r(t, ["config"]);
  return l != null && gy(l), o;
}
function vy(e, t, n) {
  const o = {}, i = r(t, ["model"]);
  i != null && a(o, ["_url", "model"], O(e, i));
  const s = r(t, ["contents"]);
  if (s != null) {
    let u = pe(s);
    Array.isArray(u) && (u = u.map((c) => Ft(c))), a(o, ["contents"], u);
  }
  const l = r(t, ["config"]);
  return l != null && _y(l, o), o;
}
function Ey(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && a(n, ["sdkHttpResponse"], o);
  const i = r(e, ["totalTokens"]);
  i != null && a(n, ["totalTokens"], i);
  const s = r(e, ["cachedContentTokenCount"]);
  return s != null && a(n, ["cachedContentTokenCount"], s), n;
}
function Ty(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && a(n, ["sdkHttpResponse"], o);
  const i = r(e, ["totalTokens"]);
  return i != null && a(n, ["totalTokens"], i), n;
}
function Sy(e, t, n) {
  const o = {}, i = r(t, ["model"]);
  return i != null && a(o, ["_url", "name"], O(e, i)), o;
}
function wy(e, t, n) {
  const o = {}, i = r(t, ["model"]);
  return i != null && a(o, ["_url", "name"], O(e, i)), o;
}
function Iy(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  return o != null && a(n, ["sdkHttpResponse"], o), n;
}
function Cy(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  return o != null && a(n, ["sdkHttpResponse"], o), n;
}
function Ay(e, t, n) {
  const o = {}, i = r(e, ["outputGcsUri"]);
  t !== void 0 && i != null && a(t, ["parameters", "storageUri"], i);
  const s = r(e, ["negativePrompt"]);
  t !== void 0 && s != null && a(t, ["parameters", "negativePrompt"], s);
  const l = r(e, ["numberOfImages"]);
  t !== void 0 && l != null && a(t, ["parameters", "sampleCount"], l);
  const u = r(e, ["aspectRatio"]);
  t !== void 0 && u != null && a(t, ["parameters", "aspectRatio"], u);
  const c = r(e, ["guidanceScale"]);
  t !== void 0 && c != null && a(t, ["parameters", "guidanceScale"], c);
  const d = r(e, ["seed"]);
  t !== void 0 && d != null && a(t, ["parameters", "seed"], d);
  const h = r(e, ["safetyFilterLevel"]);
  t !== void 0 && h != null && a(t, ["parameters", "safetySetting"], h);
  const f = r(e, ["personGeneration"]);
  t !== void 0 && f != null && a(t, ["parameters", "personGeneration"], f);
  const p = r(e, ["includeSafetyAttributes"]);
  t !== void 0 && p != null && a(t, ["parameters", "includeSafetyAttributes"], p);
  const m = r(e, ["includeRaiReason"]);
  t !== void 0 && m != null && a(t, ["parameters", "includeRaiReason"], m);
  const g = r(e, ["language"]);
  t !== void 0 && g != null && a(t, ["parameters", "language"], g);
  const _ = r(e, ["outputMimeType"]);
  t !== void 0 && _ != null && a(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], _);
  const y = r(e, ["outputCompressionQuality"]);
  t !== void 0 && y != null && a(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], y);
  const I = r(e, ["addWatermark"]);
  t !== void 0 && I != null && a(t, ["parameters", "addWatermark"], I);
  const S = r(e, ["labels"]);
  t !== void 0 && S != null && a(t, ["labels"], S);
  const A = r(e, ["editMode"]);
  t !== void 0 && A != null && a(t, ["parameters", "editMode"], A);
  const R = r(e, ["baseSteps"]);
  return t !== void 0 && R != null && a(t, [
    "parameters",
    "editConfig",
    "baseSteps"
  ], R), o;
}
function Ry(e, t, n) {
  const o = {}, i = r(t, ["model"]);
  i != null && a(o, ["_url", "model"], O(e, i));
  const s = r(t, ["prompt"]);
  s != null && a(o, ["instances[0]", "prompt"], s);
  const l = r(t, ["referenceImages"]);
  if (l != null) {
    let c = l;
    Array.isArray(c) && (c = c.map((d) => xv(d))), a(o, ["instances[0]", "referenceImages"], c);
  }
  const u = r(t, ["config"]);
  return u != null && Ay(u, o), o;
}
function by(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && a(n, ["sdkHttpResponse"], o);
  const i = r(e, ["predictions"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((l) => Qo(l))), a(n, ["generatedImages"], s);
  }
  return n;
}
function Py(e, t, n) {
  const o = {}, i = r(e, ["taskType"]);
  t !== void 0 && i != null && a(t, ["requests[]", "taskType"], i);
  const s = r(e, ["title"]);
  t !== void 0 && s != null && a(t, ["requests[]", "title"], s);
  const l = r(e, ["outputDimensionality"]);
  if (t !== void 0 && l != null && a(t, ["requests[]", "outputDimensionality"], l), r(e, ["mimeType"]) !== void 0) throw new Error("mimeType parameter is not supported in Gemini API.");
  if (r(e, ["autoTruncate"]) !== void 0) throw new Error("autoTruncate parameter is not supported in Gemini API.");
  if (r(e, ["documentOcr"]) !== void 0) throw new Error("documentOcr parameter is not supported in Gemini API.");
  if (r(e, ["audioTrackExtraction"]) !== void 0) throw new Error("audioTrackExtraction parameter is not supported in Gemini API.");
  return o;
}
function xy(e, t, n) {
  const o = {};
  let i = r(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const f = r(e, ["taskType"]);
    t !== void 0 && f != null && a(t, ["instances[]", "task_type"], f);
  } else if (i === "EMBED_CONTENT") {
    const f = r(e, ["taskType"]);
    t !== void 0 && f != null && a(t, ["embedContentConfig", "taskType"], f);
  }
  let s = r(n, ["embeddingApiType"]);
  if (s === void 0 && (s = "PREDICT"), s === "PREDICT") {
    const f = r(e, ["title"]);
    t !== void 0 && f != null && a(t, ["instances[]", "title"], f);
  } else if (s === "EMBED_CONTENT") {
    const f = r(e, ["title"]);
    t !== void 0 && f != null && a(t, ["embedContentConfig", "title"], f);
  }
  let l = r(n, ["embeddingApiType"]);
  if (l === void 0 && (l = "PREDICT"), l === "PREDICT") {
    const f = r(e, ["outputDimensionality"]);
    t !== void 0 && f != null && a(t, ["parameters", "outputDimensionality"], f);
  } else if (l === "EMBED_CONTENT") {
    const f = r(e, ["outputDimensionality"]);
    t !== void 0 && f != null && a(t, ["embedContentConfig", "outputDimensionality"], f);
  }
  let u = r(n, ["embeddingApiType"]);
  if (u === void 0 && (u = "PREDICT"), u === "PREDICT") {
    const f = r(e, ["mimeType"]);
    t !== void 0 && f != null && a(t, ["instances[]", "mimeType"], f);
  }
  let c = r(n, ["embeddingApiType"]);
  if (c === void 0 && (c = "PREDICT"), c === "PREDICT") {
    const f = r(e, ["autoTruncate"]);
    t !== void 0 && f != null && a(t, ["parameters", "autoTruncate"], f);
  } else if (c === "EMBED_CONTENT") {
    const f = r(e, ["autoTruncate"]);
    t !== void 0 && f != null && a(t, ["embedContentConfig", "autoTruncate"], f);
  }
  let d = r(n, ["embeddingApiType"]);
  if (d === void 0 && (d = "PREDICT"), d === "EMBED_CONTENT") {
    const f = r(e, ["documentOcr"]);
    t !== void 0 && f != null && a(t, ["embedContentConfig", "documentOcr"], f);
  }
  let h = r(n, ["embeddingApiType"]);
  if (h === void 0 && (h = "PREDICT"), h === "EMBED_CONTENT") {
    const f = r(e, ["audioTrackExtraction"]);
    t !== void 0 && f != null && a(t, ["embedContentConfig", "audioTrackExtraction"], f);
  }
  return o;
}
function My(e, t, n) {
  const o = {}, i = r(t, ["model"]);
  i != null && a(o, ["_url", "model"], O(e, i));
  const s = r(t, ["contents"]);
  if (s != null) {
    let d = Ws(e, s);
    Array.isArray(d) && (d = d.map((h) => h)), a(o, ["requests[]", "content"], d);
  }
  const l = r(t, ["content"]);
  l != null && Ln(ne(l));
  const u = r(t, ["config"]);
  u != null && Py(u, o);
  const c = r(t, ["model"]);
  return c !== void 0 && a(o, ["requests[]", "model"], O(e, c)), o;
}
function Ny(e, t, n) {
  const o = {}, i = r(t, ["model"]);
  i != null && a(o, ["_url", "model"], O(e, i));
  let s = r(n, ["embeddingApiType"]);
  if (s === void 0 && (s = "PREDICT"), s === "PREDICT") {
    const c = r(t, ["contents"]);
    if (c != null) {
      let d = Ws(e, c);
      Array.isArray(d) && (d = d.map((h) => h)), a(o, ["instances[]", "content"], d);
    }
  }
  let l = r(n, ["embeddingApiType"]);
  if (l === void 0 && (l = "PREDICT"), l === "EMBED_CONTENT") {
    const c = r(t, ["content"]);
    c != null && a(o, ["content"], Ft(ne(c)));
  }
  const u = r(t, ["config"]);
  return u != null && xy(u, o, n), o;
}
function ky(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && a(n, ["sdkHttpResponse"], o);
  const i = r(e, ["embeddings"]);
  if (i != null) {
    let l = i;
    Array.isArray(l) && (l = l.map((u) => u)), a(n, ["embeddings"], l);
  }
  const s = r(e, ["metadata"]);
  return s != null && a(n, ["metadata"], s), n;
}
function Dy(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && a(n, ["sdkHttpResponse"], o);
  const i = r(e, ["predictions[]", "embeddings"]);
  if (i != null) {
    let l = i;
    Array.isArray(l) && (l = l.map((u) => hy(u))), a(n, ["embeddings"], l);
  }
  const s = r(e, ["metadata"]);
  if (s != null && a(n, ["metadata"], s), t && r(t, ["embeddingApiType"]) === "EMBED_CONTENT") {
    const l = r(e, ["embedding"]), u = r(e, ["usageMetadata"]), c = r(e, ["truncated"]);
    if (l) {
      const d = {};
      u && u.promptTokenCount && (d.tokenCount = u.promptTokenCount), c && (d.truncated = c), l.statistics = d, a(n, ["embeddings"], [l]);
    }
  }
  return n;
}
function Ly(e, t) {
  const n = {}, o = r(e, ["endpoint"]);
  o != null && a(n, ["name"], o);
  const i = r(e, ["deployedModelId"]);
  return i != null && a(n, ["deployedModelId"], i), n;
}
function Uy(e, t) {
  const n = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["fileUri"]);
  o != null && a(n, ["fileUri"], o);
  const i = r(e, ["mimeType"]);
  return i != null && a(n, ["mimeType"], i), n;
}
function $y(e, t) {
  const n = {}, o = r(e, ["id"]);
  o != null && a(n, ["id"], o);
  const i = r(e, ["args"]);
  i != null && a(n, ["args"], i);
  const s = r(e, ["name"]);
  if (s != null && a(n, ["name"], s), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function Fy(e, t) {
  const n = {}, o = r(e, ["allowedFunctionNames"]);
  o != null && a(n, ["allowedFunctionNames"], o);
  const i = r(e, ["mode"]);
  if (i != null && a(n, ["mode"], i), r(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function Gy(e, t) {
  const n = {}, o = r(e, ["description"]);
  o != null && a(n, ["description"], o);
  const i = r(e, ["name"]);
  i != null && a(n, ["name"], i);
  const s = r(e, ["parameters"]);
  s != null && a(n, ["parameters"], s);
  const l = r(e, ["parametersJsonSchema"]);
  l != null && a(n, ["parametersJsonSchema"], l);
  const u = r(e, ["response"]);
  u != null && a(n, ["response"], u);
  const c = r(e, ["responseJsonSchema"]);
  if (c != null && a(n, ["responseJsonSchema"], c), r(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return n;
}
function By(e, t, n, o) {
  const i = {}, s = r(t, ["systemInstruction"]);
  n !== void 0 && s != null && a(n, ["systemInstruction"], Ln(ne(s)));
  const l = r(t, ["temperature"]);
  l != null && a(i, ["temperature"], l);
  const u = r(t, ["topP"]);
  u != null && a(i, ["topP"], u);
  const c = r(t, ["topK"]);
  c != null && a(i, ["topK"], c);
  const d = r(t, ["candidateCount"]);
  d != null && a(i, ["candidateCount"], d);
  const h = r(t, ["maxOutputTokens"]);
  h != null && a(i, ["maxOutputTokens"], h);
  const f = r(t, ["stopSequences"]);
  f != null && a(i, ["stopSequences"], f);
  const p = r(t, ["responseLogprobs"]);
  p != null && a(i, ["responseLogprobs"], p);
  const m = r(t, ["logprobs"]);
  m != null && a(i, ["logprobs"], m);
  const g = r(t, ["presencePenalty"]);
  g != null && a(i, ["presencePenalty"], g);
  const _ = r(t, ["frequencyPenalty"]);
  _ != null && a(i, ["frequencyPenalty"], _);
  const y = r(t, ["seed"]);
  y != null && a(i, ["seed"], y);
  const I = r(t, ["responseMimeType"]);
  I != null && a(i, ["responseMimeType"], I);
  const S = r(t, ["responseSchema"]);
  S != null && a(i, ["responseSchema"], Ks(S));
  const A = r(t, ["responseJsonSchema"]);
  if (A != null && a(i, ["responseJsonSchema"], A), r(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (r(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const R = r(t, ["safetySettings"]);
  if (n !== void 0 && R != null) {
    let W = R;
    Array.isArray(W) && (W = W.map((Ge) => Mv(Ge))), a(n, ["safetySettings"], W);
  }
  const $ = r(t, ["tools"]);
  if (n !== void 0 && $ != null) {
    let W = Ut($);
    Array.isArray(W) && (W = W.map((Ge) => Gv(Lt(Ge)))), a(n, ["tools"], W);
  }
  const T = r(t, ["toolConfig"]);
  if (n !== void 0 && T != null && a(n, ["toolConfig"], $v(T)), r(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const U = r(t, ["cachedContent"]);
  n !== void 0 && U != null && a(n, ["cachedContent"], Ke(e, U));
  const C = r(t, ["responseModalities"]);
  C != null && a(i, ["responseModalities"], C);
  const k = r(t, ["mediaResolution"]);
  k != null && a(i, ["mediaResolution"], k);
  const V = r(t, ["speechConfig"]);
  if (V != null && a(i, ["speechConfig"], Ys(V)), r(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const J = r(t, ["thinkingConfig"]);
  J != null && a(i, ["thinkingConfig"], J);
  const de = r(t, ["imageConfig"]);
  de != null && a(i, ["imageConfig"], hv(de));
  const ae = r(t, ["enableEnhancedCivicAnswers"]);
  if (ae != null && a(i, ["enableEnhancedCivicAnswers"], ae), r(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const Y = r(t, ["serviceTier"]);
  return n !== void 0 && Y != null && a(n, ["serviceTier"], Y), i;
}
function qy(e, t, n, o) {
  const i = {}, s = r(t, ["systemInstruction"]);
  n !== void 0 && s != null && a(n, ["systemInstruction"], Ft(ne(s)));
  const l = r(t, ["temperature"]);
  l != null && a(i, ["temperature"], l);
  const u = r(t, ["topP"]);
  u != null && a(i, ["topP"], u);
  const c = r(t, ["topK"]);
  c != null && a(i, ["topK"], c);
  const d = r(t, ["candidateCount"]);
  d != null && a(i, ["candidateCount"], d);
  const h = r(t, ["maxOutputTokens"]);
  h != null && a(i, ["maxOutputTokens"], h);
  const f = r(t, ["stopSequences"]);
  f != null && a(i, ["stopSequences"], f);
  const p = r(t, ["responseLogprobs"]);
  p != null && a(i, ["responseLogprobs"], p);
  const m = r(t, ["logprobs"]);
  m != null && a(i, ["logprobs"], m);
  const g = r(t, ["presencePenalty"]);
  g != null && a(i, ["presencePenalty"], g);
  const _ = r(t, ["frequencyPenalty"]);
  _ != null && a(i, ["frequencyPenalty"], _);
  const y = r(t, ["seed"]);
  y != null && a(i, ["seed"], y);
  const I = r(t, ["responseMimeType"]);
  I != null && a(i, ["responseMimeType"], I);
  const S = r(t, ["responseSchema"]);
  S != null && a(i, ["responseSchema"], Ks(S));
  const A = r(t, ["responseJsonSchema"]);
  A != null && a(i, ["responseJsonSchema"], A);
  const R = r(t, ["routingConfig"]);
  R != null && a(i, ["routingConfig"], R);
  const $ = r(t, ["modelSelectionConfig"]);
  $ != null && a(i, ["modelConfig"], $);
  const T = r(t, ["safetySettings"]);
  if (n !== void 0 && T != null) {
    let Re = T;
    Array.isArray(Re) && (Re = Re.map((ti) => ti)), a(n, ["safetySettings"], Re);
  }
  const U = r(t, ["tools"]);
  if (n !== void 0 && U != null) {
    let Re = Ut(U);
    Array.isArray(Re) && (Re = Re.map((ti) => Yd(Lt(ti)))), a(n, ["tools"], Re);
  }
  const C = r(t, ["toolConfig"]);
  n !== void 0 && C != null && a(n, ["toolConfig"], Fv(C));
  const k = r(t, ["labels"]);
  n !== void 0 && k != null && a(n, ["labels"], k);
  const V = r(t, ["cachedContent"]);
  n !== void 0 && V != null && a(n, ["cachedContent"], Ke(e, V));
  const J = r(t, ["responseModalities"]);
  J != null && a(i, ["responseModalities"], J);
  const de = r(t, ["mediaResolution"]);
  de != null && a(i, ["mediaResolution"], de);
  const ae = r(t, ["speechConfig"]);
  ae != null && a(i, ["speechConfig"], Ys(ae));
  const Y = r(t, ["audioTimestamp"]);
  Y != null && a(i, ["audioTimestamp"], Y);
  const W = r(t, ["thinkingConfig"]);
  W != null && a(i, ["thinkingConfig"], W);
  const Ge = r(t, ["imageConfig"]);
  if (Ge != null && a(i, ["imageConfig"], pv(Ge)), r(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const Gt = r(t, ["modelArmorConfig"]);
  n !== void 0 && Gt != null && a(n, ["modelArmorConfig"], Gt);
  const nt = r(t, ["serviceTier"]);
  return n !== void 0 && nt != null && a(n, ["serviceTier"], nt), i;
}
function Pl(e, t, n) {
  const o = {}, i = r(t, ["model"]);
  i != null && a(o, ["_url", "model"], O(e, i));
  const s = r(t, ["contents"]);
  if (s != null) {
    let u = pe(s);
    Array.isArray(u) && (u = u.map((c) => Ln(c))), a(o, ["contents"], u);
  }
  const l = r(t, ["config"]);
  return l != null && a(o, ["generationConfig"], By(e, l, o)), o;
}
function xl(e, t, n) {
  const o = {}, i = r(t, ["model"]);
  i != null && a(o, ["_url", "model"], O(e, i));
  const s = r(t, ["contents"]);
  if (s != null) {
    let u = pe(s);
    Array.isArray(u) && (u = u.map((c) => Ft(c))), a(o, ["contents"], u);
  }
  const l = r(t, ["config"]);
  return l != null && a(o, ["generationConfig"], qy(e, l, o)), o;
}
function Ml(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && a(n, ["sdkHttpResponse"], o);
  const i = r(e, ["candidates"]);
  if (i != null) {
    let h = i;
    Array.isArray(h) && (h = h.map((f) => uy(f))), a(n, ["candidates"], h);
  }
  const s = r(e, ["modelVersion"]);
  s != null && a(n, ["modelVersion"], s);
  const l = r(e, ["promptFeedback"]);
  l != null && a(n, ["promptFeedback"], l);
  const u = r(e, ["responseId"]);
  u != null && a(n, ["responseId"], u);
  const c = r(e, ["usageMetadata"]);
  c != null && a(n, ["usageMetadata"], c);
  const d = r(e, ["modelStatus"]);
  return d != null && a(n, ["modelStatus"], d), n;
}
function Nl(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && a(n, ["sdkHttpResponse"], o);
  const i = r(e, ["candidates"]);
  if (i != null) {
    let h = i;
    Array.isArray(h) && (h = h.map((f) => f)), a(n, ["candidates"], h);
  }
  const s = r(e, ["createTime"]);
  s != null && a(n, ["createTime"], s);
  const l = r(e, ["modelVersion"]);
  l != null && a(n, ["modelVersion"], l);
  const u = r(e, ["promptFeedback"]);
  u != null && a(n, ["promptFeedback"], u);
  const c = r(e, ["responseId"]);
  c != null && a(n, ["responseId"], c);
  const d = r(e, ["usageMetadata"]);
  return d != null && a(n, ["usageMetadata"], d), n;
}
function Vy(e, t, n) {
  const o = {};
  if (r(e, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  if (r(e, ["negativePrompt"]) !== void 0) throw new Error("negativePrompt parameter is not supported in Gemini API.");
  const i = r(e, ["numberOfImages"]);
  t !== void 0 && i != null && a(t, ["parameters", "sampleCount"], i);
  const s = r(e, ["aspectRatio"]);
  t !== void 0 && s != null && a(t, ["parameters", "aspectRatio"], s);
  const l = r(e, ["guidanceScale"]);
  if (t !== void 0 && l != null && a(t, ["parameters", "guidanceScale"], l), r(e, ["seed"]) !== void 0) throw new Error("seed parameter is not supported in Gemini API.");
  const u = r(e, ["safetyFilterLevel"]);
  t !== void 0 && u != null && a(t, ["parameters", "safetySetting"], u);
  const c = r(e, ["personGeneration"]);
  t !== void 0 && c != null && a(t, ["parameters", "personGeneration"], c);
  const d = r(e, ["includeSafetyAttributes"]);
  t !== void 0 && d != null && a(t, ["parameters", "includeSafetyAttributes"], d);
  const h = r(e, ["includeRaiReason"]);
  t !== void 0 && h != null && a(t, ["parameters", "includeRaiReason"], h);
  const f = r(e, ["language"]);
  t !== void 0 && f != null && a(t, ["parameters", "language"], f);
  const p = r(e, ["outputMimeType"]);
  t !== void 0 && p != null && a(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], p);
  const m = r(e, ["outputCompressionQuality"]);
  if (t !== void 0 && m != null && a(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], m), r(e, ["addWatermark"]) !== void 0) throw new Error("addWatermark parameter is not supported in Gemini API.");
  if (r(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const g = r(e, ["imageSize"]);
  if (t !== void 0 && g != null && a(t, ["parameters", "sampleImageSize"], g), r(e, ["enhancePrompt"]) !== void 0) throw new Error("enhancePrompt parameter is not supported in Gemini API.");
  return o;
}
function Hy(e, t, n) {
  const o = {}, i = r(e, ["outputGcsUri"]);
  t !== void 0 && i != null && a(t, ["parameters", "storageUri"], i);
  const s = r(e, ["negativePrompt"]);
  t !== void 0 && s != null && a(t, ["parameters", "negativePrompt"], s);
  const l = r(e, ["numberOfImages"]);
  t !== void 0 && l != null && a(t, ["parameters", "sampleCount"], l);
  const u = r(e, ["aspectRatio"]);
  t !== void 0 && u != null && a(t, ["parameters", "aspectRatio"], u);
  const c = r(e, ["guidanceScale"]);
  t !== void 0 && c != null && a(t, ["parameters", "guidanceScale"], c);
  const d = r(e, ["seed"]);
  t !== void 0 && d != null && a(t, ["parameters", "seed"], d);
  const h = r(e, ["safetyFilterLevel"]);
  t !== void 0 && h != null && a(t, ["parameters", "safetySetting"], h);
  const f = r(e, ["personGeneration"]);
  t !== void 0 && f != null && a(t, ["parameters", "personGeneration"], f);
  const p = r(e, ["includeSafetyAttributes"]);
  t !== void 0 && p != null && a(t, ["parameters", "includeSafetyAttributes"], p);
  const m = r(e, ["includeRaiReason"]);
  t !== void 0 && m != null && a(t, ["parameters", "includeRaiReason"], m);
  const g = r(e, ["language"]);
  t !== void 0 && g != null && a(t, ["parameters", "language"], g);
  const _ = r(e, ["outputMimeType"]);
  t !== void 0 && _ != null && a(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], _);
  const y = r(e, ["outputCompressionQuality"]);
  t !== void 0 && y != null && a(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], y);
  const I = r(e, ["addWatermark"]);
  t !== void 0 && I != null && a(t, ["parameters", "addWatermark"], I);
  const S = r(e, ["labels"]);
  t !== void 0 && S != null && a(t, ["labels"], S);
  const A = r(e, ["imageSize"]);
  t !== void 0 && A != null && a(t, ["parameters", "sampleImageSize"], A);
  const R = r(e, ["enhancePrompt"]);
  return t !== void 0 && R != null && a(t, ["parameters", "enhancePrompt"], R), o;
}
function Oy(e, t, n) {
  const o = {}, i = r(t, ["model"]);
  i != null && a(o, ["_url", "model"], O(e, i));
  const s = r(t, ["prompt"]);
  s != null && a(o, ["instances[0]", "prompt"], s);
  const l = r(t, ["config"]);
  return l != null && Vy(l, o), o;
}
function Jy(e, t, n) {
  const o = {}, i = r(t, ["model"]);
  i != null && a(o, ["_url", "model"], O(e, i));
  const s = r(t, ["prompt"]);
  s != null && a(o, ["instances[0]", "prompt"], s);
  const l = r(t, ["config"]);
  return l != null && Hy(l, o), o;
}
function Wy(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && a(n, ["sdkHttpResponse"], o);
  const i = r(e, ["predictions"]);
  if (i != null) {
    let l = i;
    Array.isArray(l) && (l = l.map((u) => iv(u))), a(n, ["generatedImages"], l);
  }
  const s = r(e, ["positivePromptSafetyAttributes"]);
  return s != null && a(n, ["positivePromptSafetyAttributes"], Wd(s)), n;
}
function Ky(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && a(n, ["sdkHttpResponse"], o);
  const i = r(e, ["predictions"]);
  if (i != null) {
    let l = i;
    Array.isArray(l) && (l = l.map((u) => Qo(u))), a(n, ["generatedImages"], l);
  }
  const s = r(e, ["positivePromptSafetyAttributes"]);
  return s != null && a(n, ["positivePromptSafetyAttributes"], Kd(s)), n;
}
function Yy(e, t, n) {
  const o = {}, i = r(e, ["numberOfVideos"]);
  if (t !== void 0 && i != null && a(t, ["parameters", "sampleCount"], i), r(e, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  if (r(e, ["fps"]) !== void 0) throw new Error("fps parameter is not supported in Gemini API.");
  const s = r(e, ["durationSeconds"]);
  if (t !== void 0 && s != null && a(t, ["parameters", "durationSeconds"], s), r(e, ["seed"]) !== void 0) throw new Error("seed parameter is not supported in Gemini API.");
  const l = r(e, ["aspectRatio"]);
  t !== void 0 && l != null && a(t, ["parameters", "aspectRatio"], l);
  const u = r(e, ["resolution"]);
  t !== void 0 && u != null && a(t, ["parameters", "resolution"], u);
  const c = r(e, ["personGeneration"]);
  if (t !== void 0 && c != null && a(t, ["parameters", "personGeneration"], c), r(e, ["pubsubTopic"]) !== void 0) throw new Error("pubsubTopic parameter is not supported in Gemini API.");
  const d = r(e, ["negativePrompt"]);
  t !== void 0 && d != null && a(t, ["parameters", "negativePrompt"], d);
  const h = r(e, ["enhancePrompt"]);
  if (t !== void 0 && h != null && a(t, ["parameters", "enhancePrompt"], h), r(e, ["generateAudio"]) !== void 0) throw new Error("generateAudio parameter is not supported in Gemini API.");
  const f = r(e, ["lastFrame"]);
  t !== void 0 && f != null && a(t, ["instances[0]", "lastFrame"], Zo(f));
  const p = r(e, ["referenceImages"]);
  if (t !== void 0 && p != null) {
    let g = p;
    Array.isArray(g) && (g = g.map((_) => Zv(_))), a(t, ["instances[0]", "referenceImages"], g);
  }
  if (r(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (r(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (r(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = r(e, ["webhookConfig"]);
  return t !== void 0 && m != null && a(t, ["webhookConfig"], m), o;
}
function zy(e, t, n) {
  const o = {}, i = r(e, ["numberOfVideos"]);
  t !== void 0 && i != null && a(t, ["parameters", "sampleCount"], i);
  const s = r(e, ["outputGcsUri"]);
  t !== void 0 && s != null && a(t, ["parameters", "storageUri"], s);
  const l = r(e, ["fps"]);
  t !== void 0 && l != null && a(t, ["parameters", "fps"], l);
  const u = r(e, ["durationSeconds"]);
  t !== void 0 && u != null && a(t, ["parameters", "durationSeconds"], u);
  const c = r(e, ["seed"]);
  t !== void 0 && c != null && a(t, ["parameters", "seed"], c);
  const d = r(e, ["aspectRatio"]);
  t !== void 0 && d != null && a(t, ["parameters", "aspectRatio"], d);
  const h = r(e, ["resolution"]);
  t !== void 0 && h != null && a(t, ["parameters", "resolution"], h);
  const f = r(e, ["personGeneration"]);
  t !== void 0 && f != null && a(t, ["parameters", "personGeneration"], f);
  const p = r(e, ["pubsubTopic"]);
  t !== void 0 && p != null && a(t, ["parameters", "pubsubTopic"], p);
  const m = r(e, ["negativePrompt"]);
  t !== void 0 && m != null && a(t, ["parameters", "negativePrompt"], m);
  const g = r(e, ["enhancePrompt"]);
  t !== void 0 && g != null && a(t, ["parameters", "enhancePrompt"], g);
  const _ = r(e, ["generateAudio"]);
  t !== void 0 && _ != null && a(t, ["parameters", "generateAudio"], _);
  const y = r(e, ["lastFrame"]);
  t !== void 0 && y != null && a(t, ["instances[0]", "lastFrame"], ke(y));
  const I = r(e, ["referenceImages"]);
  if (t !== void 0 && I != null) {
    let $ = I;
    Array.isArray($) && ($ = $.map((T) => jv(T))), a(t, ["instances[0]", "referenceImages"], $);
  }
  const S = r(e, ["mask"]);
  t !== void 0 && S != null && a(t, ["instances[0]", "mask"], Qv(S));
  const A = r(e, ["compressionQuality"]);
  t !== void 0 && A != null && a(t, ["parameters", "compressionQuality"], A);
  const R = r(e, ["labels"]);
  if (t !== void 0 && R != null && a(t, ["labels"], R), r(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return o;
}
function Xy(e, t) {
  const n = {}, o = r(e, ["name"]);
  o != null && a(n, ["name"], o);
  const i = r(e, ["metadata"]);
  i != null && a(n, ["metadata"], i);
  const s = r(e, ["done"]);
  s != null && a(n, ["done"], s);
  const l = r(e, ["error"]);
  l != null && a(n, ["error"], l);
  const u = r(e, ["response", "generateVideoResponse"]);
  return u != null && a(n, ["response"], ev(u)), n;
}
function Qy(e, t) {
  const n = {}, o = r(e, ["name"]);
  o != null && a(n, ["name"], o);
  const i = r(e, ["metadata"]);
  i != null && a(n, ["metadata"], i);
  const s = r(e, ["done"]);
  s != null && a(n, ["done"], s);
  const l = r(e, ["error"]);
  l != null && a(n, ["error"], l);
  const u = r(e, ["response"]);
  return u != null && a(n, ["response"], tv(u)), n;
}
function Zy(e, t, n) {
  const o = {}, i = r(t, ["model"]);
  i != null && a(o, ["_url", "model"], O(e, i));
  const s = r(t, ["prompt"]);
  s != null && a(o, ["instances[0]", "prompt"], s);
  const l = r(t, ["image"]);
  l != null && a(o, ["instances[0]", "image"], Zo(l));
  const u = r(t, ["video"]);
  u != null && a(o, ["instances[0]", "video"], zd(u));
  const c = r(t, ["source"]);
  c != null && nv(c, o);
  const d = r(t, ["config"]);
  return d != null && Yy(d, o), o;
}
function jy(e, t, n) {
  const o = {}, i = r(t, ["model"]);
  i != null && a(o, ["_url", "model"], O(e, i));
  const s = r(t, ["prompt"]);
  s != null && a(o, ["instances[0]", "prompt"], s);
  const l = r(t, ["image"]);
  l != null && a(o, ["instances[0]", "image"], ke(l));
  const u = r(t, ["video"]);
  u != null && a(o, ["instances[0]", "video"], Xd(u));
  const c = r(t, ["source"]);
  c != null && ov(c, o);
  const d = r(t, ["config"]);
  return d != null && zy(d, o), o;
}
function ev(e, t) {
  const n = {}, o = r(e, ["generatedSamples"]);
  if (o != null) {
    let l = o;
    Array.isArray(l) && (l = l.map((u) => rv(u))), a(n, ["generatedVideos"], l);
  }
  const i = r(e, ["raiMediaFilteredCount"]);
  i != null && a(n, ["raiMediaFilteredCount"], i);
  const s = r(e, ["raiMediaFilteredReasons"]);
  return s != null && a(n, ["raiMediaFilteredReasons"], s), n;
}
function tv(e, t) {
  const n = {}, o = r(e, ["videos"]);
  if (o != null) {
    let l = o;
    Array.isArray(l) && (l = l.map((u) => av(u))), a(n, ["generatedVideos"], l);
  }
  const i = r(e, ["raiMediaFilteredCount"]);
  i != null && a(n, ["raiMediaFilteredCount"], i);
  const s = r(e, ["raiMediaFilteredReasons"]);
  return s != null && a(n, ["raiMediaFilteredReasons"], s), n;
}
function nv(e, t, n) {
  const o = {}, i = r(e, ["prompt"]);
  t !== void 0 && i != null && a(t, ["instances[0]", "prompt"], i);
  const s = r(e, ["image"]);
  t !== void 0 && s != null && a(t, ["instances[0]", "image"], Zo(s));
  const l = r(e, ["video"]);
  return t !== void 0 && l != null && a(t, ["instances[0]", "video"], zd(l)), o;
}
function ov(e, t, n) {
  const o = {}, i = r(e, ["prompt"]);
  t !== void 0 && i != null && a(t, ["instances[0]", "prompt"], i);
  const s = r(e, ["image"]);
  t !== void 0 && s != null && a(t, ["instances[0]", "image"], ke(s));
  const l = r(e, ["video"]);
  return t !== void 0 && l != null && a(t, ["instances[0]", "video"], Xd(l)), o;
}
function iv(e, t) {
  const n = {}, o = r(e, ["_self"]);
  o != null && a(n, ["image"], mv(o));
  const i = r(e, ["raiFilteredReason"]);
  i != null && a(n, ["raiFilteredReason"], i);
  const s = r(e, ["_self"]);
  return s != null && a(n, ["safetyAttributes"], Wd(s)), n;
}
function Qo(e, t) {
  const n = {}, o = r(e, ["_self"]);
  o != null && a(n, ["image"], Jd(o));
  const i = r(e, ["raiFilteredReason"]);
  i != null && a(n, ["raiFilteredReason"], i);
  const s = r(e, ["_self"]);
  s != null && a(n, ["safetyAttributes"], Kd(s));
  const l = r(e, ["prompt"]);
  return l != null && a(n, ["enhancedPrompt"], l), n;
}
function sv(e, t) {
  const n = {}, o = r(e, ["_self"]);
  o != null && a(n, ["mask"], Jd(o));
  const i = r(e, ["labels"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((l) => l)), a(n, ["labels"], s);
  }
  return n;
}
function rv(e, t) {
  const n = {}, o = r(e, ["video"]);
  return o != null && a(n, ["video"], zv(o)), n;
}
function av(e, t) {
  const n = {}, o = r(e, ["_self"]);
  return o != null && a(n, ["video"], Xv(o)), n;
}
function lv(e, t) {
  const n = {}, o = r(e, ["modelSelectionConfig"]);
  o != null && a(n, ["modelConfig"], o);
  const i = r(e, ["responseJsonSchema"]);
  i != null && a(n, ["responseJsonSchema"], i);
  const s = r(e, ["audioTimestamp"]);
  s != null && a(n, ["audioTimestamp"], s);
  const l = r(e, ["candidateCount"]);
  l != null && a(n, ["candidateCount"], l);
  const u = r(e, ["enableAffectiveDialog"]);
  u != null && a(n, ["enableAffectiveDialog"], u);
  const c = r(e, ["frequencyPenalty"]);
  c != null && a(n, ["frequencyPenalty"], c);
  const d = r(e, ["logprobs"]);
  d != null && a(n, ["logprobs"], d);
  const h = r(e, ["maxOutputTokens"]);
  h != null && a(n, ["maxOutputTokens"], h);
  const f = r(e, ["mediaResolution"]);
  f != null && a(n, ["mediaResolution"], f);
  const p = r(e, ["presencePenalty"]);
  p != null && a(n, ["presencePenalty"], p);
  const m = r(e, ["responseLogprobs"]);
  m != null && a(n, ["responseLogprobs"], m);
  const g = r(e, ["responseMimeType"]);
  g != null && a(n, ["responseMimeType"], g);
  const _ = r(e, ["responseModalities"]);
  _ != null && a(n, ["responseModalities"], _);
  const y = r(e, ["responseSchema"]);
  y != null && a(n, ["responseSchema"], y);
  const I = r(e, ["routingConfig"]);
  I != null && a(n, ["routingConfig"], I);
  const S = r(e, ["seed"]);
  S != null && a(n, ["seed"], S);
  const A = r(e, ["speechConfig"]);
  A != null && a(n, ["speechConfig"], A);
  const R = r(e, ["stopSequences"]);
  R != null && a(n, ["stopSequences"], R);
  const $ = r(e, ["temperature"]);
  $ != null && a(n, ["temperature"], $);
  const T = r(e, ["thinkingConfig"]);
  T != null && a(n, ["thinkingConfig"], T);
  const U = r(e, ["topK"]);
  U != null && a(n, ["topK"], U);
  const C = r(e, ["topP"]);
  if (C != null && a(n, ["topP"], C), r(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return n;
}
function uv(e, t, n) {
  const o = {}, i = r(t, ["model"]);
  return i != null && a(o, ["_url", "name"], O(e, i)), o;
}
function cv(e, t, n) {
  const o = {}, i = r(t, ["model"]);
  return i != null && a(o, ["_url", "name"], O(e, i)), o;
}
function dv(e, t) {
  const n = {}, o = r(e, ["authConfig"]);
  o != null && a(n, ["authConfig"], ay(o));
  const i = r(e, ["enableWidget"]);
  return i != null && a(n, ["enableWidget"], i), n;
}
function fv(e, t) {
  const n = {}, o = r(e, ["searchTypes"]);
  if (o != null && a(n, ["searchTypes"], o), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const i = r(e, ["timeRangeFilter"]);
  return i != null && a(n, ["timeRangeFilter"], i), n;
}
function hv(e, t) {
  const n = {}, o = r(e, ["aspectRatio"]);
  o != null && a(n, ["aspectRatio"], o);
  const i = r(e, ["imageSize"]);
  if (i != null && a(n, ["imageSize"], i), r(e, ["personGeneration"]) !== void 0) throw new Error("personGeneration parameter is not supported in Gemini API.");
  if (r(e, ["prominentPeople"]) !== void 0) throw new Error("prominentPeople parameter is not supported in Gemini API.");
  if (r(e, ["outputMimeType"]) !== void 0) throw new Error("outputMimeType parameter is not supported in Gemini API.");
  if (r(e, ["outputCompressionQuality"]) !== void 0) throw new Error("outputCompressionQuality parameter is not supported in Gemini API.");
  if (r(e, ["imageOutputOptions"]) !== void 0) throw new Error("imageOutputOptions parameter is not supported in Gemini API.");
  return n;
}
function pv(e, t) {
  const n = {}, o = r(e, ["aspectRatio"]);
  o != null && a(n, ["aspectRatio"], o);
  const i = r(e, ["imageSize"]);
  i != null && a(n, ["imageSize"], i);
  const s = r(e, ["personGeneration"]);
  s != null && a(n, ["personGeneration"], s);
  const l = r(e, ["prominentPeople"]);
  l != null && a(n, ["prominentPeople"], l);
  const u = r(e, ["outputMimeType"]);
  u != null && a(n, ["imageOutputOptions", "mimeType"], u);
  const c = r(e, ["outputCompressionQuality"]);
  c != null && a(n, ["imageOutputOptions", "compressionQuality"], c);
  const d = r(e, ["imageOutputOptions"]);
  return d != null && a(n, ["imageOutputOptions"], d), n;
}
function mv(e, t) {
  const n = {}, o = r(e, ["bytesBase64Encoded"]);
  o != null && a(n, ["imageBytes"], tt(o));
  const i = r(e, ["mimeType"]);
  return i != null && a(n, ["mimeType"], i), n;
}
function Jd(e, t) {
  const n = {}, o = r(e, ["gcsUri"]);
  o != null && a(n, ["gcsUri"], o);
  const i = r(e, ["bytesBase64Encoded"]);
  i != null && a(n, ["imageBytes"], tt(i));
  const s = r(e, ["mimeType"]);
  return s != null && a(n, ["mimeType"], s), n;
}
function Zo(e, t) {
  const n = {};
  if (r(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  const o = r(e, ["imageBytes"]);
  o != null && a(n, ["bytesBase64Encoded"], tt(o));
  const i = r(e, ["mimeType"]);
  return i != null && a(n, ["mimeType"], i), n;
}
function ke(e, t) {
  const n = {}, o = r(e, ["gcsUri"]);
  o != null && a(n, ["gcsUri"], o);
  const i = r(e, ["imageBytes"]);
  i != null && a(n, ["bytesBase64Encoded"], tt(i));
  const s = r(e, ["mimeType"]);
  return s != null && a(n, ["mimeType"], s), n;
}
function gv(e, t, n, o) {
  const i = {}, s = r(t, ["pageSize"]);
  n !== void 0 && s != null && a(n, ["_query", "pageSize"], s);
  const l = r(t, ["pageToken"]);
  n !== void 0 && l != null && a(n, ["_query", "pageToken"], l);
  const u = r(t, ["filter"]);
  n !== void 0 && u != null && a(n, ["_query", "filter"], u);
  const c = r(t, ["queryBase"]);
  return n !== void 0 && c != null && a(n, ["_url", "models_url"], Ud(e, c)), i;
}
function _v(e, t, n, o) {
  const i = {}, s = r(t, ["pageSize"]);
  n !== void 0 && s != null && a(n, ["_query", "pageSize"], s);
  const l = r(t, ["pageToken"]);
  n !== void 0 && l != null && a(n, ["_query", "pageToken"], l);
  const u = r(t, ["filter"]);
  n !== void 0 && u != null && a(n, ["_query", "filter"], u);
  const c = r(t, ["queryBase"]);
  return n !== void 0 && c != null && a(n, ["_url", "models_url"], Ud(e, c)), i;
}
function yv(e, t, n) {
  const o = {}, i = r(t, ["config"]);
  return i != null && gv(e, i, o), o;
}
function vv(e, t, n) {
  const o = {}, i = r(t, ["config"]);
  return i != null && _v(e, i, o), o;
}
function Ev(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && a(n, ["sdkHttpResponse"], o);
  const i = r(e, ["nextPageToken"]);
  i != null && a(n, ["nextPageToken"], i);
  const s = r(e, ["_self"]);
  if (s != null) {
    let l = $d(s);
    Array.isArray(l) && (l = l.map((u) => os(u))), a(n, ["models"], l);
  }
  return n;
}
function Tv(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && a(n, ["sdkHttpResponse"], o);
  const i = r(e, ["nextPageToken"]);
  i != null && a(n, ["nextPageToken"], i);
  const s = r(e, ["_self"]);
  if (s != null) {
    let l = $d(s);
    Array.isArray(l) && (l = l.map((u) => is(u))), a(n, ["models"], l);
  }
  return n;
}
function Sv(e, t) {
  const n = {}, o = r(e, ["maskMode"]);
  o != null && a(n, ["maskMode"], o);
  const i = r(e, ["segmentationClasses"]);
  i != null && a(n, ["maskClasses"], i);
  const s = r(e, ["maskDilation"]);
  return s != null && a(n, ["dilation"], s), n;
}
function os(e, t) {
  const n = {}, o = r(e, ["name"]);
  o != null && a(n, ["name"], o);
  const i = r(e, ["displayName"]);
  i != null && a(n, ["displayName"], i);
  const s = r(e, ["description"]);
  s != null && a(n, ["description"], s);
  const l = r(e, ["version"]);
  l != null && a(n, ["version"], l);
  const u = r(e, ["_self"]);
  u != null && a(n, ["tunedModelInfo"], Bv(u));
  const c = r(e, ["inputTokenLimit"]);
  c != null && a(n, ["inputTokenLimit"], c);
  const d = r(e, ["outputTokenLimit"]);
  d != null && a(n, ["outputTokenLimit"], d);
  const h = r(e, ["supportedGenerationMethods"]);
  h != null && a(n, ["supportedActions"], h);
  const f = r(e, ["temperature"]);
  f != null && a(n, ["temperature"], f);
  const p = r(e, ["maxTemperature"]);
  p != null && a(n, ["maxTemperature"], p);
  const m = r(e, ["topP"]);
  m != null && a(n, ["topP"], m);
  const g = r(e, ["topK"]);
  g != null && a(n, ["topK"], g);
  const _ = r(e, ["thinking"]);
  return _ != null && a(n, ["thinking"], _), n;
}
function is(e, t) {
  const n = {}, o = r(e, ["name"]);
  o != null && a(n, ["name"], o);
  const i = r(e, ["displayName"]);
  i != null && a(n, ["displayName"], i);
  const s = r(e, ["description"]);
  s != null && a(n, ["description"], s);
  const l = r(e, ["versionId"]);
  l != null && a(n, ["version"], l);
  const u = r(e, ["deployedModels"]);
  if (u != null) {
    let p = u;
    Array.isArray(p) && (p = p.map((m) => Ly(m))), a(n, ["endpoints"], p);
  }
  const c = r(e, ["labels"]);
  c != null && a(n, ["labels"], c);
  const d = r(e, ["_self"]);
  d != null && a(n, ["tunedModelInfo"], qv(d));
  const h = r(e, ["defaultCheckpointId"]);
  h != null && a(n, ["defaultCheckpointId"], h);
  const f = r(e, ["checkpoints"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), a(n, ["checkpoints"], p);
  }
  return n;
}
function wv(e, t) {
  const n = {}, o = r(e, ["mediaResolution"]);
  o != null && a(n, ["mediaResolution"], o);
  const i = r(e, ["codeExecutionResult"]);
  i != null && a(n, ["codeExecutionResult"], i);
  const s = r(e, ["executableCode"]);
  s != null && a(n, ["executableCode"], s);
  const l = r(e, ["fileData"]);
  l != null && a(n, ["fileData"], Uy(l));
  const u = r(e, ["functionCall"]);
  u != null && a(n, ["functionCall"], $y(u));
  const c = r(e, ["functionResponse"]);
  c != null && a(n, ["functionResponse"], c);
  const d = r(e, ["inlineData"]);
  d != null && a(n, ["inlineData"], ly(d));
  const h = r(e, ["text"]);
  h != null && a(n, ["text"], h);
  const f = r(e, ["thought"]);
  f != null && a(n, ["thought"], f);
  const p = r(e, ["thoughtSignature"]);
  p != null && a(n, ["thoughtSignature"], p);
  const m = r(e, ["videoMetadata"]);
  m != null && a(n, ["videoMetadata"], m);
  const g = r(e, ["toolCall"]);
  g != null && a(n, ["toolCall"], g);
  const _ = r(e, ["toolResponse"]);
  _ != null && a(n, ["toolResponse"], _);
  const y = r(e, ["partMetadata"]);
  return y != null && a(n, ["partMetadata"], y), n;
}
function Iv(e, t) {
  const n = {}, o = r(e, ["mediaResolution"]);
  o != null && a(n, ["mediaResolution"], o);
  const i = r(e, ["codeExecutionResult"]);
  i != null && a(n, ["codeExecutionResult"], i);
  const s = r(e, ["executableCode"]);
  s != null && a(n, ["executableCode"], s);
  const l = r(e, ["fileData"]);
  l != null && a(n, ["fileData"], l);
  const u = r(e, ["functionCall"]);
  u != null && a(n, ["functionCall"], u);
  const c = r(e, ["functionResponse"]);
  c != null && a(n, ["functionResponse"], c);
  const d = r(e, ["inlineData"]);
  d != null && a(n, ["inlineData"], d);
  const h = r(e, ["text"]);
  h != null && a(n, ["text"], h);
  const f = r(e, ["thought"]);
  f != null && a(n, ["thought"], f);
  const p = r(e, ["thoughtSignature"]);
  p != null && a(n, ["thoughtSignature"], p);
  const m = r(e, ["videoMetadata"]);
  if (m != null && a(n, ["videoMetadata"], m), r(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (r(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (r(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return n;
}
function Cv(e, t) {
  const n = {}, o = r(e, ["productImage"]);
  return o != null && a(n, ["image"], ke(o)), n;
}
function Av(e, t, n) {
  const o = {}, i = r(e, ["numberOfImages"]);
  t !== void 0 && i != null && a(t, ["parameters", "sampleCount"], i);
  const s = r(e, ["baseSteps"]);
  t !== void 0 && s != null && a(t, ["parameters", "baseSteps"], s);
  const l = r(e, ["outputGcsUri"]);
  t !== void 0 && l != null && a(t, ["parameters", "storageUri"], l);
  const u = r(e, ["seed"]);
  t !== void 0 && u != null && a(t, ["parameters", "seed"], u);
  const c = r(e, ["safetyFilterLevel"]);
  t !== void 0 && c != null && a(t, ["parameters", "safetySetting"], c);
  const d = r(e, ["personGeneration"]);
  t !== void 0 && d != null && a(t, ["parameters", "personGeneration"], d);
  const h = r(e, ["addWatermark"]);
  t !== void 0 && h != null && a(t, ["parameters", "addWatermark"], h);
  const f = r(e, ["outputMimeType"]);
  t !== void 0 && f != null && a(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], f);
  const p = r(e, ["outputCompressionQuality"]);
  t !== void 0 && p != null && a(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], p);
  const m = r(e, ["enhancePrompt"]);
  t !== void 0 && m != null && a(t, ["parameters", "enhancePrompt"], m);
  const g = r(e, ["labels"]);
  return t !== void 0 && g != null && a(t, ["labels"], g), o;
}
function Rv(e, t, n) {
  const o = {}, i = r(t, ["model"]);
  i != null && a(o, ["_url", "model"], O(e, i));
  const s = r(t, ["source"]);
  s != null && Pv(s, o);
  const l = r(t, ["config"]);
  return l != null && Av(l, o), o;
}
function bv(e, t) {
  const n = {}, o = r(e, ["predictions"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => Qo(s))), a(n, ["generatedImages"], i);
  }
  return n;
}
function Pv(e, t, n) {
  const o = {}, i = r(e, ["prompt"]);
  t !== void 0 && i != null && a(t, ["instances[0]", "prompt"], i);
  const s = r(e, ["personImage"]);
  t !== void 0 && s != null && a(t, [
    "instances[0]",
    "personImage",
    "image"
  ], ke(s));
  const l = r(e, ["productImages"]);
  if (t !== void 0 && l != null) {
    let u = l;
    Array.isArray(u) && (u = u.map((c) => Cv(c))), a(t, ["instances[0]", "productImages"], u);
  }
  return o;
}
function xv(e, t) {
  const n = {}, o = r(e, ["referenceImage"]);
  o != null && a(n, ["referenceImage"], ke(o));
  const i = r(e, ["referenceId"]);
  i != null && a(n, ["referenceId"], i);
  const s = r(e, ["referenceType"]);
  s != null && a(n, ["referenceType"], s);
  const l = r(e, ["maskImageConfig"]);
  l != null && a(n, ["maskImageConfig"], Sv(l));
  const u = r(e, ["controlImageConfig"]);
  u != null && a(n, ["controlImageConfig"], my(u));
  const c = r(e, ["styleImageConfig"]);
  c != null && a(n, ["styleImageConfig"], c);
  const d = r(e, ["subjectImageConfig"]);
  return d != null && a(n, ["subjectImageConfig"], d), n;
}
function Wd(e, t) {
  const n = {}, o = r(e, ["safetyAttributes", "categories"]);
  o != null && a(n, ["categories"], o);
  const i = r(e, ["safetyAttributes", "scores"]);
  i != null && a(n, ["scores"], i);
  const s = r(e, ["contentType"]);
  return s != null && a(n, ["contentType"], s), n;
}
function Kd(e, t) {
  const n = {}, o = r(e, ["safetyAttributes", "categories"]);
  o != null && a(n, ["categories"], o);
  const i = r(e, ["safetyAttributes", "scores"]);
  i != null && a(n, ["scores"], i);
  const s = r(e, ["contentType"]);
  return s != null && a(n, ["contentType"], s), n;
}
function Mv(e, t) {
  const n = {}, o = r(e, ["category"]);
  if (o != null && a(n, ["category"], o), r(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const i = r(e, ["threshold"]);
  return i != null && a(n, ["threshold"], i), n;
}
function Nv(e, t) {
  const n = {}, o = r(e, ["image"]);
  return o != null && a(n, ["image"], ke(o)), n;
}
function kv(e, t, n) {
  const o = {}, i = r(e, ["mode"]);
  t !== void 0 && i != null && a(t, ["parameters", "mode"], i);
  const s = r(e, ["maxPredictions"]);
  t !== void 0 && s != null && a(t, ["parameters", "maxPredictions"], s);
  const l = r(e, ["confidenceThreshold"]);
  t !== void 0 && l != null && a(t, ["parameters", "confidenceThreshold"], l);
  const u = r(e, ["maskDilation"]);
  t !== void 0 && u != null && a(t, ["parameters", "maskDilation"], u);
  const c = r(e, ["binaryColorThreshold"]);
  t !== void 0 && c != null && a(t, ["parameters", "binaryColorThreshold"], c);
  const d = r(e, ["labels"]);
  return t !== void 0 && d != null && a(t, ["labels"], d), o;
}
function Dv(e, t, n) {
  const o = {}, i = r(t, ["model"]);
  i != null && a(o, ["_url", "model"], O(e, i));
  const s = r(t, ["source"]);
  s != null && Uv(s, o);
  const l = r(t, ["config"]);
  return l != null && kv(l, o), o;
}
function Lv(e, t) {
  const n = {}, o = r(e, ["predictions"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => sv(s))), a(n, ["generatedMasks"], i);
  }
  return n;
}
function Uv(e, t, n) {
  const o = {}, i = r(e, ["prompt"]);
  t !== void 0 && i != null && a(t, ["instances[0]", "prompt"], i);
  const s = r(e, ["image"]);
  t !== void 0 && s != null && a(t, ["instances[0]", "image"], ke(s));
  const l = r(e, ["scribbleImage"]);
  return t !== void 0 && l != null && a(t, ["instances[0]", "scribble"], Nv(l)), o;
}
function $v(e, t) {
  const n = {}, o = r(e, ["retrievalConfig"]);
  o != null && a(n, ["retrievalConfig"], o);
  const i = r(e, ["functionCallingConfig"]);
  i != null && a(n, ["functionCallingConfig"], Fy(i));
  const s = r(e, ["includeServerSideToolInvocations"]);
  return s != null && a(n, ["includeServerSideToolInvocations"], s), n;
}
function Fv(e, t) {
  const n = {}, o = r(e, ["retrievalConfig"]);
  o != null && a(n, ["retrievalConfig"], o);
  const i = r(e, ["functionCallingConfig"]);
  if (i != null && a(n, ["functionCallingConfig"], i), r(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function Gv(e, t) {
  const n = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const o = r(e, ["computerUse"]);
  o != null && a(n, ["computerUse"], o);
  const i = r(e, ["fileSearch"]);
  i != null && a(n, ["fileSearch"], i);
  const s = r(e, ["googleSearch"]);
  s != null && a(n, ["googleSearch"], fv(s));
  const l = r(e, ["googleMaps"]);
  l != null && a(n, ["googleMaps"], dv(l));
  const u = r(e, ["codeExecution"]);
  if (u != null && a(n, ["codeExecution"], u), r(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const c = r(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => m)), a(n, ["functionDeclarations"], p);
  }
  const d = r(e, ["googleSearchRetrieval"]);
  if (d != null && a(n, ["googleSearchRetrieval"], d), r(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const h = r(e, ["urlContext"]);
  h != null && a(n, ["urlContext"], h);
  const f = r(e, ["mcpServers"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), a(n, ["mcpServers"], p);
  }
  return n;
}
function Yd(e, t) {
  const n = {}, o = r(e, ["retrieval"]);
  o != null && a(n, ["retrieval"], o);
  const i = r(e, ["computerUse"]);
  if (i != null && a(n, ["computerUse"], i), r(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const s = r(e, ["googleSearch"]);
  s != null && a(n, ["googleSearch"], s);
  const l = r(e, ["googleMaps"]);
  l != null && a(n, ["googleMaps"], l);
  const u = r(e, ["codeExecution"]);
  u != null && a(n, ["codeExecution"], u);
  const c = r(e, ["enterpriseWebSearch"]);
  c != null && a(n, ["enterpriseWebSearch"], c);
  const d = r(e, ["functionDeclarations"]);
  if (d != null) {
    let m = d;
    Array.isArray(m) && (m = m.map((g) => Gy(g))), a(n, ["functionDeclarations"], m);
  }
  const h = r(e, ["googleSearchRetrieval"]);
  h != null && a(n, ["googleSearchRetrieval"], h);
  const f = r(e, ["parallelAiSearch"]);
  f != null && a(n, ["parallelAiSearch"], f);
  const p = r(e, ["urlContext"]);
  if (p != null && a(n, ["urlContext"], p), r(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function Bv(e, t) {
  const n = {}, o = r(e, ["baseModel"]);
  o != null && a(n, ["baseModel"], o);
  const i = r(e, ["createTime"]);
  i != null && a(n, ["createTime"], i);
  const s = r(e, ["updateTime"]);
  return s != null && a(n, ["updateTime"], s), n;
}
function qv(e, t) {
  const n = {}, o = r(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  o != null && a(n, ["baseModel"], o);
  const i = r(e, ["createTime"]);
  i != null && a(n, ["createTime"], i);
  const s = r(e, ["updateTime"]);
  return s != null && a(n, ["updateTime"], s), n;
}
function Vv(e, t, n) {
  const o = {}, i = r(e, ["displayName"]);
  t !== void 0 && i != null && a(t, ["displayName"], i);
  const s = r(e, ["description"]);
  t !== void 0 && s != null && a(t, ["description"], s);
  const l = r(e, ["defaultCheckpointId"]);
  return t !== void 0 && l != null && a(t, ["defaultCheckpointId"], l), o;
}
function Hv(e, t, n) {
  const o = {}, i = r(e, ["displayName"]);
  t !== void 0 && i != null && a(t, ["displayName"], i);
  const s = r(e, ["description"]);
  t !== void 0 && s != null && a(t, ["description"], s);
  const l = r(e, ["defaultCheckpointId"]);
  return t !== void 0 && l != null && a(t, ["defaultCheckpointId"], l), o;
}
function Ov(e, t, n) {
  const o = {}, i = r(t, ["model"]);
  i != null && a(o, ["_url", "name"], O(e, i));
  const s = r(t, ["config"]);
  return s != null && Vv(s, o), o;
}
function Jv(e, t, n) {
  const o = {}, i = r(t, ["model"]);
  i != null && a(o, ["_url", "model"], O(e, i));
  const s = r(t, ["config"]);
  return s != null && Hv(s, o), o;
}
function Wv(e, t, n) {
  const o = {}, i = r(e, ["outputGcsUri"]);
  t !== void 0 && i != null && a(t, ["parameters", "storageUri"], i);
  const s = r(e, ["safetyFilterLevel"]);
  t !== void 0 && s != null && a(t, ["parameters", "safetySetting"], s);
  const l = r(e, ["personGeneration"]);
  t !== void 0 && l != null && a(t, ["parameters", "personGeneration"], l);
  const u = r(e, ["includeRaiReason"]);
  t !== void 0 && u != null && a(t, ["parameters", "includeRaiReason"], u);
  const c = r(e, ["outputMimeType"]);
  t !== void 0 && c != null && a(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], c);
  const d = r(e, ["outputCompressionQuality"]);
  t !== void 0 && d != null && a(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], d);
  const h = r(e, ["enhanceInputImage"]);
  t !== void 0 && h != null && a(t, [
    "parameters",
    "upscaleConfig",
    "enhanceInputImage"
  ], h);
  const f = r(e, ["imagePreservationFactor"]);
  t !== void 0 && f != null && a(t, [
    "parameters",
    "upscaleConfig",
    "imagePreservationFactor"
  ], f);
  const p = r(e, ["labels"]);
  t !== void 0 && p != null && a(t, ["labels"], p);
  const m = r(e, ["numberOfImages"]);
  t !== void 0 && m != null && a(t, ["parameters", "sampleCount"], m);
  const g = r(e, ["mode"]);
  return t !== void 0 && g != null && a(t, ["parameters", "mode"], g), o;
}
function Kv(e, t, n) {
  const o = {}, i = r(t, ["model"]);
  i != null && a(o, ["_url", "model"], O(e, i));
  const s = r(t, ["image"]);
  s != null && a(o, ["instances[0]", "image"], ke(s));
  const l = r(t, ["upscaleFactor"]);
  l != null && a(o, [
    "parameters",
    "upscaleConfig",
    "upscaleFactor"
  ], l);
  const u = r(t, ["config"]);
  return u != null && Wv(u, o), o;
}
function Yv(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && a(n, ["sdkHttpResponse"], o);
  const i = r(e, ["predictions"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((l) => Qo(l))), a(n, ["generatedImages"], s);
  }
  return n;
}
function zv(e, t) {
  const n = {}, o = r(e, ["uri"]);
  o != null && a(n, ["uri"], o);
  const i = r(e, ["encodedVideo"]);
  i != null && a(n, ["videoBytes"], tt(i));
  const s = r(e, ["encoding"]);
  return s != null && a(n, ["mimeType"], s), n;
}
function Xv(e, t) {
  const n = {}, o = r(e, ["gcsUri"]);
  o != null && a(n, ["uri"], o);
  const i = r(e, ["bytesBase64Encoded"]);
  i != null && a(n, ["videoBytes"], tt(i));
  const s = r(e, ["mimeType"]);
  return s != null && a(n, ["mimeType"], s), n;
}
function Qv(e, t) {
  const n = {}, o = r(e, ["image"]);
  o != null && a(n, ["_self"], ke(o));
  const i = r(e, ["maskMode"]);
  return i != null && a(n, ["maskMode"], i), n;
}
function Zv(e, t) {
  const n = {}, o = r(e, ["image"]);
  o != null && a(n, ["image"], Zo(o));
  const i = r(e, ["referenceType"]);
  return i != null && a(n, ["referenceType"], i), n;
}
function jv(e, t) {
  const n = {}, o = r(e, ["image"]);
  o != null && a(n, ["image"], ke(o));
  const i = r(e, ["referenceType"]);
  return i != null && a(n, ["referenceType"], i), n;
}
function zd(e, t) {
  const n = {}, o = r(e, ["uri"]);
  o != null && a(n, ["uri"], o);
  const i = r(e, ["videoBytes"]);
  i != null && a(n, ["encodedVideo"], tt(i));
  const s = r(e, ["mimeType"]);
  return s != null && a(n, ["encoding"], s), n;
}
function Xd(e, t) {
  const n = {}, o = r(e, ["uri"]);
  o != null && a(n, ["gcsUri"], o);
  const i = r(e, ["videoBytes"]);
  i != null && a(n, ["bytesBase64Encoded"], tt(i));
  const s = r(e, ["mimeType"]);
  return s != null && a(n, ["mimeType"], s), n;
}
function eE(e, t) {
  const n = {}, o = r(e, ["displayName"]);
  return t !== void 0 && o != null && a(t, ["displayName"], o), n;
}
function tE(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && eE(n, t), t;
}
function nE(e, t) {
  const n = {}, o = r(e, ["force"]);
  return t !== void 0 && o != null && a(t, ["_query", "force"], o), n;
}
function oE(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && a(t, ["_url", "name"], n);
  const o = r(e, ["config"]);
  return o != null && nE(o, t), t;
}
function iE(e) {
  const t = {}, n = r(e, ["name"]);
  return n != null && a(t, ["_url", "name"], n), t;
}
function sE(e, t) {
  const n = {}, o = r(e, ["customMetadata"]);
  if (t !== void 0 && o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((l) => l)), a(t, ["customMetadata"], s);
  }
  const i = r(e, ["chunkingConfig"]);
  return t !== void 0 && i != null && a(t, ["chunkingConfig"], i), n;
}
function rE(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && a(t, ["name"], n);
  const o = r(e, ["metadata"]);
  o != null && a(t, ["metadata"], o);
  const i = r(e, ["done"]);
  i != null && a(t, ["done"], i);
  const s = r(e, ["error"]);
  s != null && a(t, ["error"], s);
  const l = r(e, ["response"]);
  return l != null && a(t, ["response"], lE(l)), t;
}
function aE(e) {
  const t = {}, n = r(e, ["fileSearchStoreName"]);
  n != null && a(t, ["_url", "file_search_store_name"], n);
  const o = r(e, ["fileName"]);
  o != null && a(t, ["fileName"], o);
  const i = r(e, ["config"]);
  return i != null && sE(i, t), t;
}
function lE(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && a(t, ["sdkHttpResponse"], n);
  const o = r(e, ["parent"]);
  o != null && a(t, ["parent"], o);
  const i = r(e, ["documentName"]);
  return i != null && a(t, ["documentName"], i), t;
}
function uE(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && a(t, ["_query", "pageSize"], o);
  const i = r(e, ["pageToken"]);
  return t !== void 0 && i != null && a(t, ["_query", "pageToken"], i), n;
}
function cE(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && uE(n, t), t;
}
function dE(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && a(t, ["sdkHttpResponse"], n);
  const o = r(e, ["nextPageToken"]);
  o != null && a(t, ["nextPageToken"], o);
  const i = r(e, ["fileSearchStores"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((l) => l)), a(t, ["fileSearchStores"], s);
  }
  return t;
}
function Qd(e, t) {
  const n = {}, o = r(e, ["mimeType"]);
  t !== void 0 && o != null && a(t, ["mimeType"], o);
  const i = r(e, ["displayName"]);
  t !== void 0 && i != null && a(t, ["displayName"], i);
  const s = r(e, ["customMetadata"]);
  if (t !== void 0 && s != null) {
    let u = s;
    Array.isArray(u) && (u = u.map((c) => c)), a(t, ["customMetadata"], u);
  }
  const l = r(e, ["chunkingConfig"]);
  return t !== void 0 && l != null && a(t, ["chunkingConfig"], l), n;
}
function fE(e) {
  const t = {}, n = r(e, ["fileSearchStoreName"]);
  n != null && a(t, ["_url", "file_search_store_name"], n);
  const o = r(e, ["config"]);
  return o != null && Qd(o, t), t;
}
function hE(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && a(t, ["sdkHttpResponse"], n), t;
}
var pE = "Content-Type", mE = "X-Server-Timeout", gE = "User-Agent", ss = "x-goog-api-client", _E = "google-genai-sdk/1.50.1", yE = "v1beta1", vE = "v1beta", EE = /* @__PURE__ */ new Set(["us", "eu"]), TE = 5, SE = [
  408,
  429,
  500,
  502,
  503,
  504
], wE = class {
  constructor(e) {
    var t, n, o;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const i = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const s = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !s ? (i.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? i.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && EE.has(this.clientOptions.location) ? i.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (i.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), i.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : yE;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), i.apiVersion = (o = this.clientOptions.apiVersion) !== null && o !== void 0 ? o : vE, i.baseUrl = "https://generativelanguage.googleapis.com/";
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
    const o = [this.getRequestUrlInternal(t)];
    return n && o.push(this.getBaseResourcePath()), e !== "" && o.push(e), new URL(`${o.join("/")}`);
  }
  shouldPrependVertexProjectPath(e, t) {
    return !(t.baseUrl && t.baseUrlResourceScope === ji.COLLECTION || this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
  }
  async request(e) {
    let t = this.clientOptions.httpOptions;
    e.httpOptions && (t = this.patchHttpOptions(this.clientOptions.httpOptions, e.httpOptions));
    const n = this.shouldPrependVertexProjectPath(e, t), o = this.constructUrl(e.path, t, n);
    if (e.queryParams) for (const [s, l] of Object.entries(e.queryParams)) o.searchParams.append(s, String(l));
    let i = {};
    if (e.httpMethod === "GET") {
      if (e.body && e.body !== "{}") throw new Error("Request body should be empty for GET request, but got non empty request body");
    } else i.body = e.body;
    return i = await this.includeExtraHttpOptionsToRequestInit(i, t, o.toString(), e.abortSignal), this.unaryApiCall(o, i, e.httpMethod);
  }
  patchHttpOptions(e, t) {
    const n = JSON.parse(JSON.stringify(e));
    for (const [o, i] of Object.entries(t)) typeof i == "object" ? n[o] = Object.assign(Object.assign({}, n[o]), i) : i !== void 0 && (n[o] = i);
    return n;
  }
  async requestStream(e) {
    let t = this.clientOptions.httpOptions;
    e.httpOptions && (t = this.patchHttpOptions(this.clientOptions.httpOptions, e.httpOptions));
    const n = this.shouldPrependVertexProjectPath(e, t), o = this.constructUrl(e.path, t, n);
    (!o.searchParams.has("alt") || o.searchParams.get("alt") !== "sse") && o.searchParams.set("alt", "sse");
    let i = {};
    return i.body = e.body, i = await this.includeExtraHttpOptionsToRequestInit(i, t, o.toString(), e.abortSignal), this.streamApiCall(o, i, e.httpMethod);
  }
  async includeExtraHttpOptionsToRequestInit(e, t, n, o) {
    if (t && t.timeout || o) {
      const i = new AbortController(), s = i.signal;
      if (t.timeout && t?.timeout > 0) {
        const l = setTimeout(() => i.abort(), t.timeout);
        l && typeof l.unref == "function" && l.unref();
      }
      o && o.addEventListener("abort", () => {
        i.abort();
      }), e.signal = s;
    }
    return t && t.extraBody !== null && IE(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await kl(o), new es(o))).catch((o) => {
      throw o instanceof Error ? o : new Error(JSON.stringify(o));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await kl(o), this.processStreamResponse(o))).catch((o) => {
      throw o instanceof Error ? o : new Error(JSON.stringify(o));
    });
  }
  processStreamResponse(e) {
    return Me(this, arguments, function* () {
      var n;
      const o = (n = e?.body) === null || n === void 0 ? void 0 : n.getReader(), i = new TextDecoder("utf-8");
      if (!o) throw new Error("Response body is empty");
      try {
        let s = "";
        const l = "data:", u = [
          `

`,
          "\r\r",
          `\r
\r
`
        ];
        for (; ; ) {
          const { done: c, value: d } = yield q(o.read());
          if (c) {
            if (s.trim().length > 0) throw new Error("Incomplete JSON segment at the end");
            break;
          }
          const h = i.decode(d, { stream: !0 });
          try {
            const m = JSON.parse(h);
            if ("error" in m) {
              const g = JSON.parse(JSON.stringify(m.error)), _ = g.status, y = g.code, I = `got status: ${_}. ${JSON.stringify(m)}`;
              if (y >= 400 && y < 600) throw new Hd({
                message: I,
                status: y
              });
            }
          } catch (m) {
            if (m.name === "ApiError") throw m;
          }
          s += h;
          let f = -1, p = 0;
          for (; ; ) {
            f = -1, p = 0;
            for (const _ of u) {
              const y = s.indexOf(_);
              y !== -1 && (f === -1 || y < f) && (f = y, p = _.length);
            }
            if (f === -1) break;
            const m = s.substring(0, f);
            s = s.substring(f + p);
            const g = m.trim();
            if (g.startsWith(l)) {
              const _ = g.substring(5).trim();
              try {
                yield yield q(new es(new Response(_, {
                  headers: e?.headers,
                  status: e?.status,
                  statusText: e?.statusText
                })));
              } catch (y) {
                throw new Error(`exception parsing stream chunk ${_}. ${y}`);
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
    const o = this.clientOptions.httpOptions.retryOptions, i = async () => {
      const s = await fetch(e, t);
      if (s.ok) return s;
      throw SE.includes(s.status) ? new Error(`Retryable HTTP Error: ${s.statusText}`) : new ia.AbortError(`Non-retryable exception ${s.statusText} sending request`);
    };
    return (0, ia.default)(i, { retries: ((n = o.attempts) !== null && n !== void 0 ? n : TE) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = _E + " " + this.clientOptions.userAgentExtra;
    return e[gE] = t, e[ss] = t, e[pE] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [o, i] of Object.entries(e.headers)) n.append(o, i);
      e.timeout && e.timeout > 0 && n.append(mE, String(Math.ceil(e.timeout / 1e3)));
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
    const i = this.clientOptions.uploader, s = await i.stat(e);
    o.sizeBytes = String(s.size);
    const l = (n = t?.mimeType) !== null && n !== void 0 ? n : s.type;
    if (l === void 0 || l === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    o.mimeType = l;
    const u = { file: o }, c = this.getFileName(e), d = b("upload/v1beta/files", u._url), h = await this.fetchUploadUrl(d, o.sizeBytes, o.mimeType, c, u, t?.httpOptions);
    return i.upload(e, h, this);
  }
  async uploadFileToFileSearchStore(e, t, n) {
    var o;
    const i = this.clientOptions.uploader, s = await i.stat(t), l = String(s.size), u = (o = n?.mimeType) !== null && o !== void 0 ? o : s.type;
    if (u === void 0 || u === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    const c = `upload/v1beta/${e}:uploadToFileSearchStore`, d = this.getFileName(t), h = {};
    n != null && Qd(n, h);
    const f = await this.fetchUploadUrl(c, l, u, d, h, n?.httpOptions);
    return i.uploadToFileSearchStore(t, f, this);
  }
  async downloadFile(e) {
    await this.clientOptions.downloader.download(e, this);
  }
  async fetchUploadUrl(e, t, n, o, i, s) {
    var l;
    let u = {};
    s ? u = s : u = {
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
      body: JSON.stringify(i),
      httpMethod: "POST",
      httpOptions: u
    });
    if (!c || !c?.headers) throw new Error("Server did not return an HttpResponse or the returned HttpResponse did not have headers.");
    const d = (l = c?.headers) === null || l === void 0 ? void 0 : l["x-goog-upload-url"];
    if (d === void 0) throw new Error("Failed to get upload url. Server did not return the x-google-upload-url in the headers");
    return d;
  }
};
async function kl(e) {
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
    const i = JSON.stringify(o);
    throw n >= 400 && n < 600 ? new Hd({
      message: i,
      status: n
    }) : new Error(i);
  }
}
function IE(e, t) {
  if (!t || Object.keys(t).length === 0) return;
  if (e.body instanceof Blob) {
    console.warn("includeExtraBodyToRequestInit: extraBody provided but current request body is a Blob. extraBody will be ignored as merging is not supported for Blob bodies.");
    return;
  }
  let n = {};
  if (typeof e.body == "string" && e.body.length > 0) try {
    const s = JSON.parse(e.body);
    if (typeof s == "object" && s !== null && !Array.isArray(s)) n = s;
    else {
      console.warn("includeExtraBodyToRequestInit: Original request body is valid JSON but not a non-array object. Skip applying extraBody to the request body.");
      return;
    }
  } catch {
    console.warn("includeExtraBodyToRequestInit: Original request body is not valid JSON. Skip applying extraBody to the request body.");
    return;
  }
  function o(s, l) {
    const u = Object.assign({}, s);
    for (const c in l) if (Object.prototype.hasOwnProperty.call(l, c)) {
      const d = l[c], h = u[c];
      d && typeof d == "object" && !Array.isArray(d) && h && typeof h == "object" && !Array.isArray(h) ? u[c] = o(h, d) : (h && d && typeof h != typeof d && console.warn(`includeExtraBodyToRequestInit:deepMerge: Type mismatch for key "${c}". Original type: ${typeof h}, New type: ${typeof d}. Overwriting.`), u[c] = d);
    }
    return u;
  }
  const i = o(n, t);
  e.body = JSON.stringify(i);
}
var CE = "mcp_used/unknown", AE = !1;
function Zd(e) {
  for (const t of e)
    if (RE(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return AE;
}
function jd(e) {
  var t;
  e[ss] = (((t = e[ss]) !== null && t !== void 0 ? t : "") + ` ${CE}`).trimStart();
}
function RE(e) {
  return e !== null && typeof e == "object" && e instanceof PE;
}
function bE(e) {
  return Me(this, arguments, function* (n, o = 100) {
    let i, s = 0;
    for (; s < o; ) {
      const l = yield q(n.listTools({ cursor: i }));
      for (const u of l.tools)
        yield yield q(u), s++;
      if (!l.nextCursor) break;
      i = l.nextCursor;
    }
  });
}
var PE = class ef {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new ef(t, n);
  }
  async initialize() {
    var t, n, o, i;
    if (this.mcpTools.length > 0) return;
    const s = {}, l = [];
    for (const h of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, Ne(bE(h))), d; d = await c.next(), t = d.done, !t; u = !0) {
        i = d.value, u = !1;
        const f = i;
        l.push(f);
        const p = f.name;
        if (s[p]) throw new Error(`Duplicate function name ${p} found in MCP tools. Please ensure function names are unique.`);
        s[p] = h;
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
    this.mcpTools = l, this.functionNameToMcpClient = s;
  }
  async tool() {
    return await this.initialize(), Hm(this.mcpTools, this.config);
  }
  async callTool(t) {
    await this.initialize();
    const n = [];
    for (const o of t) if (o.name in this.functionNameToMcpClient) {
      const i = this.functionNameToMcpClient[o.name];
      let s;
      this.config.timeout && (s = { timeout: this.config.timeout });
      const l = await i.callTool({
        name: o.name,
        arguments: o.args
      }, void 0, s);
      n.push({ functionResponse: {
        name: o.name,
        response: l.isError ? { error: l } : l
      } });
    }
    return n;
  }
};
async function xE(e, t, n) {
  const o = new Dm();
  let i;
  n.data instanceof Blob ? i = JSON.parse(await n.data.text()) : i = JSON.parse(n.data), Object.assign(o, i), t(o);
}
var ME = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const o = this.apiClient.getWebsocketBaseUrl(), i = this.apiClient.getApiVersion(), s = DE(this.apiClient.getDefaultHeaders()), l = `${o}/ws/google.ai.generativelanguage.${i}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((_) => {
      u = _;
    }), d = e.callbacks, h = function() {
      u({});
    }, f = this.apiClient, p = {
      onopen: h,
      onmessage: (_) => {
        xE(f, d.onmessage, _);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(_) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(_) {
      }
    }, m = this.webSocketFactory.create(l, kE(s), p);
    m.connect(), await c;
    const g = { setup: { model: O(this.apiClient, e.model) } };
    return m.send(JSON.stringify(g)), new NE(m, this.apiClient);
  }
}, NE = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = z_(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = Y_(e);
    this.conn.send(JSON.stringify(t));
  }
  sendPlaybackControl(e) {
    const t = { playbackControl: e };
    this.conn.send(JSON.stringify(t));
  }
  play() {
    this.sendPlaybackControl(bt.PLAY);
  }
  pause() {
    this.sendPlaybackControl(bt.PAUSE);
  }
  stop() {
    this.sendPlaybackControl(bt.STOP);
  }
  resetContext() {
    this.sendPlaybackControl(bt.RESET_CONTEXT);
  }
  close() {
    this.conn.close();
  }
};
function kE(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function DE(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var LE = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function UE(e, t, n) {
  const o = new km();
  let i;
  n.data instanceof Blob ? i = await n.data.text() : n.data instanceof ArrayBuffer ? i = new TextDecoder().decode(n.data) : i = n.data;
  const s = JSON.parse(i);
  if (e.isVertexAI()) {
    const l = Z_(s);
    Object.assign(o, l);
  } else Object.assign(o, s);
  t(o);
}
var $E = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new ME(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, o, i, s, l;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const h = this.apiClient.getHeaders();
    e.config && e.config.tools && Zd(e.config.tools) && jd(h);
    const f = qE(h);
    if (this.apiClient.isVertexAI()) {
      const C = this.apiClient.getProject(), k = this.apiClient.getLocation(), V = this.apiClient.getApiKey(), J = !!C && !!k || !!V;
      this.apiClient.getCustomBaseUrl() && !J ? d = u : (d = `${u}/ws/google.cloud.aiplatform.${c}.LlmBidiService/BidiGenerateContent`, await this.auth.addAuthHeaders(f, d));
    } else {
      const C = this.apiClient.getApiKey();
      let k = "BidiGenerateContent", V = "key";
      C?.startsWith("auth_tokens/") && (console.warn("Warning: Ephemeral token support is experimental and may change in future versions."), c !== "v1alpha" && console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection."), k = "BidiGenerateContentConstrained", V = "access_token"), d = `${u}/ws/google.ai.generativelanguage.${c}.GenerativeService.${k}?${V}=${C}`;
    }
    let p = () => {
    };
    const m = new Promise((C) => {
      p = C;
    }), g = e.callbacks, _ = function() {
      var C;
      (C = g?.onopen) === null || C === void 0 || C.call(g), p({});
    }, y = this.apiClient, I = {
      onopen: _,
      onmessage: (C) => {
        UE(y, g.onmessage, C);
      },
      onerror: (t = g?.onerror) !== null && t !== void 0 ? t : function(C) {
      },
      onclose: (n = g?.onclose) !== null && n !== void 0 ? n : function(C) {
      }
    }, S = this.webSocketFactory.create(d, BE(f), I);
    S.connect(), await m;
    let A = O(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && A.startsWith("publishers/")) {
      const C = this.apiClient.getProject(), k = this.apiClient.getLocation();
      C && k && (A = `projects/${C}/locations/${k}/` + A);
    }
    let R = {};
    this.apiClient.isVertexAI() && ((o = e.config) === null || o === void 0 ? void 0 : o.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [No.AUDIO] } : e.config.responseModalities = [No.AUDIO]), !((i = e.config) === null || i === void 0) && i.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    const $ = (l = (s = e.config) === null || s === void 0 ? void 0 : s.tools) !== null && l !== void 0 ? l : [], T = [];
    for (const C of $) if (this.isCallableTool(C)) {
      const k = C;
      T.push(await k.tool());
    } else T.push(C);
    T.length > 0 && (e.config.tools = T);
    const U = {
      model: A,
      config: e.config,
      callbacks: e.callbacks
    };
    return this.apiClient.isVertexAI() ? R = K_(this.apiClient, U) : R = W_(this.apiClient, U), delete R.config, S.send(JSON.stringify(R)), new GE(S, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, FE = { turnComplete: !0 }, GE = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let n = [];
      try {
        n = pe(t.turns), e.isVertexAI() || (n = n.map((o) => Ln(o)));
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
      if (!e.isVertexAI() && !("id" in o)) throw new Error(LE);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, FE), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: Q_(e) } : t = { realtimeInput: X_(e) }, this.conn.send(JSON.stringify(t));
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
function BE(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function qE(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var Dl = 10;
function Ll(e) {
  var t, n, o;
  if (!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.disable) return !0;
  let i = !1;
  for (const l of (n = e?.tools) !== null && n !== void 0 ? n : []) if (Mt(l)) {
    i = !0;
    break;
  }
  if (!i) return !0;
  const s = (o = e?.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls;
  return s && (s < 0 || !Number.isInteger(s)) || s == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", s), !0) : !1;
}
function Mt(e) {
  return "callTool" in e && typeof e.callTool == "function";
}
function VE(e) {
  var t, n, o;
  return (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((i) => Mt(i))) !== null && o !== void 0 ? o : !1;
}
function Ul(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((o, i) => {
    if (Mt(o)) return;
    const s = o;
    s.functionDeclarations && s.functionDeclarations.length > 0 && n.push(i);
  }), n;
}
function $l(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var HE = class extends We {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = pe(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = pe(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const o = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: ko.EMBED_CONTENT
        });
        return await this.embedContentInternal(o);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: ko.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, o, i, s, l;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !VE(t) || Ll(t.config)) return await this.generateContentInternal(u);
      const c = Ul(t);
      if (c.length > 0) {
        const g = c.map((_) => `tools[${_}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${g}.`);
      }
      let d, h;
      const f = pe(u.contents), p = (i = (o = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls) !== null && i !== void 0 ? i : Dl;
      let m = 0;
      for (; m < p && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const g = d.candidates[0].content, _ = [];
        for (const y of (l = (s = t.config) === null || s === void 0 ? void 0 : s.tools) !== null && l !== void 0 ? l : []) if (Mt(y)) {
          const I = await y.callTool(d.functionCalls);
          _.push(...I);
        }
        m++, h = {
          role: "user",
          parts: _
        }, u.contents = pe(u.contents), u.contents.push(g), u.contents.push(h), $l(u.config) && (f.push(g), f.push(h));
      }
      return $l(u.config) && (d.automaticFunctionCallingHistory = f), d;
    }, this.generateContentStream = async (t) => {
      var n, o, i, s, l;
      if (this.maybeMoveToResponseJsonSchem(t), Ll(t.config)) {
        const h = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(h);
      }
      const u = Ul(t);
      if (u.length > 0) {
        const h = u.map((f) => `tools[${f}]`).join(", ");
        throw new Error(`Incompatible tools found at ${h}. Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations" is not yet supported.`);
      }
      const c = (i = (o = (n = t?.config) === null || n === void 0 ? void 0 : n.toolConfig) === null || o === void 0 ? void 0 : o.functionCallingConfig) === null || i === void 0 ? void 0 : i.streamFunctionCallArguments, d = (l = (s = t?.config) === null || s === void 0 ? void 0 : s.automaticFunctionCalling) === null || l === void 0 ? void 0 : l.disable;
      if (c && !d) throw new Error("Running in streaming mode with 'streamFunctionCallArguments' enabled, this feature is not compatible with automatic function calling (AFC). Please set 'config.automaticFunctionCalling.disable' to true to disable AFC or leave 'config.toolConfig.functionCallingConfig.streamFunctionCallArguments' to be undefined or set to false to disable streaming function call arguments feature.");
      return await this.processAfcStream(t);
    }, this.generateImages = async (t) => await this.generateImagesInternal(t).then((n) => {
      var o;
      let i;
      const s = [];
      if (n?.generatedImages) for (const u of n.generatedImages) u && u?.safetyAttributes && ((o = u?.safetyAttributes) === null || o === void 0 ? void 0 : o.contentType) === "Positive Prompt" ? i = u?.safetyAttributes : s.push(u);
      let l;
      return i ? l = {
        generatedImages: s,
        positivePromptSafetyAttributes: i,
        sdkHttpResponse: n.sdkHttpResponse
      } : l = {
        generatedImages: s,
        sdkHttpResponse: n.sdkHttpResponse
      }, l;
    }), this.list = async (t) => {
      var n;
      const o = { config: Object.assign(Object.assign({}, { queryBase: !0 }), t?.config) };
      if (this.apiClient.isVertexAI() && !o.config.queryBase) {
        if (!((n = o.config) === null || n === void 0) && n.filter) throw new Error("Filtering tuned models list for Vertex AI is not currently supported");
        o.config.filter = "labels.tune-type:*";
      }
      return new pt(Je.PAGED_ITEM_MODELS, (i) => this.listInternal(i), await this.listInternal(o), o);
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
      var n, o, i, s, l, u;
      if ((t.prompt || t.image || t.video) && t.source) throw new Error("Source and prompt/image/video are mutually exclusive. Please only use source.");
      return this.apiClient.isVertexAI() || (!((n = t.video) === null || n === void 0) && n.uri && (!((o = t.video) === null || o === void 0) && o.videoBytes) ? t.video = {
        uri: t.video.uri,
        mimeType: t.video.mimeType
      } : !((s = (i = t.source) === null || i === void 0 ? void 0 : i.video) === null || s === void 0) && s.uri && (!((u = (l = t.source) === null || l === void 0 ? void 0 : l.video) === null || u === void 0) && u.videoBytes) && (t.source.video = {
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
    const i = (t = e.config) === null || t === void 0 ? void 0 : t.tools;
    if (!i) return e;
    const s = await Promise.all(i.map(async (u) => Mt(u) ? await u.tool() : u)), l = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: s })
    };
    if (l.config.tools = s, e.config && e.config.tools && Zd(e.config.tools)) {
      const u = (o = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && o !== void 0 ? o : {};
      let c = Object.assign({}, u);
      Object.keys(c).length === 0 && (c = this.apiClient.getDefaultHeaders()), jd(c), l.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: c });
    }
    return l;
  }
  async initAfcToolsMap(e) {
    var t, n, o;
    const i = /* @__PURE__ */ new Map();
    for (const s of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (Mt(s)) {
      const l = s, u = await l.tool();
      for (const c of (o = u.functionDeclarations) !== null && o !== void 0 ? o : []) {
        if (!c.name) throw new Error("Function declaration name is required.");
        if (i.has(c.name)) throw new Error(`Duplicate tool declaration name: ${c.name}`);
        i.set(c.name, l);
      }
    }
    return i;
  }
  async processAfcStream(e) {
    var t, n, o;
    const i = (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && o !== void 0 ? o : Dl;
    let s = !1, l = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, h) {
      return Me(this, arguments, function* () {
        for (var f, p, m, g, _, y; l < i; ) {
          s && (l++, s = !1);
          const R = yield q(c.processParamsMaybeAddMcpUsage(h)), $ = yield q(c.generateContentStreamInternal(R)), T = [], U = [];
          try {
            for (var I = !0, S = (p = void 0, Ne($)), A; A = yield q(S.next()), f = A.done, !f; I = !0) {
              g = A.value, I = !1;
              const C = g;
              if (yield yield q(C), C.candidates && (!((_ = C.candidates[0]) === null || _ === void 0) && _.content)) {
                U.push(C.candidates[0].content);
                for (const k of (y = C.candidates[0].content.parts) !== null && y !== void 0 ? y : []) if (l < i && k.functionCall) {
                  if (!k.functionCall.name) throw new Error("Function call name was not returned by the model.");
                  if (d.has(k.functionCall.name)) {
                    const V = yield q(d.get(k.functionCall.name).callTool([k.functionCall]));
                    T.push(...V);
                  } else
                    throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${d.keys()}, mising tool: ${k.functionCall.name}`);
                }
              }
            }
          } catch (C) {
            p = { error: C };
          } finally {
            try {
              !I && !f && (m = S.return) && (yield q(m.call(S)));
            } finally {
              if (p) throw p.error;
            }
          }
          if (T.length > 0) {
            s = !0;
            const C = new nn();
            C.candidates = [{ content: {
              role: "user",
              parts: T
            } }], yield yield q(C);
            const k = [];
            k.push(...U), k.push({
              role: "user",
              parts: T
            }), h.contents = pe(h.contents).concat(k);
          } else break;
        }
      });
    })(this, u, e);
  }
  async generateContentInternal(e) {
    var t, n, o, i;
    let s, l = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = xl(this.apiClient, e);
      return l = b("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Nl(d), f = new nn();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Pl(this.apiClient, e);
      return l = b("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Ml(d), f = new nn();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, o, i;
    let s, l = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = xl(this.apiClient, e);
      return l = b("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.requestStream({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }), s.then(function(d) {
        return Me(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var g = !0, _ = Ne(d), y; y = yield q(_.next()), h = y.done, !h; g = !0) {
              m = y.value, g = !1;
              const I = m, S = Nl(yield q(I.json()), e);
              S.sdkHttpResponse = { headers: I.headers };
              const A = new nn();
              Object.assign(A, S), yield yield q(A);
            }
          } catch (I) {
            f = { error: I };
          } finally {
            try {
              !g && !h && (p = _.return) && (yield q(p.call(_)));
            } finally {
              if (f) throw f.error;
            }
          }
        });
      });
    } else {
      const c = Pl(this.apiClient, e);
      return l = b("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.requestStream({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }), s.then(function(d) {
        return Me(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var g = !0, _ = Ne(d), y; y = yield q(_.next()), h = y.done, !h; g = !0) {
              m = y.value, g = !1;
              const I = m, S = Ml(yield q(I.json()), e);
              S.sdkHttpResponse = { headers: I.headers };
              const A = new nn();
              Object.assign(A, S), yield yield q(A);
            }
          } catch (I) {
            f = { error: I };
          } finally {
            try {
              !g && !h && (p = _.return) && (yield q(p.call(_)));
            } finally {
              if (f) throw f.error;
            }
          }
        });
      });
    }
  }
  async embedContentInternal(e) {
    var t, n, o, i;
    let s, l = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Ny(this.apiClient, e, e);
      return l = b(Jm(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Dy(d, e), f = new ul();
        return Object.assign(f, h), f;
      });
    } else {
      const c = My(this.apiClient, e);
      return l = b("{model}:batchEmbedContents", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = ky(d), f = new ul();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, o, i;
    let s, l = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Jy(this.apiClient, e);
      return l = b("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Ky(d), f = new cl();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Oy(this.apiClient, e);
      return l = b("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Wy(d), f = new cl();
        return Object.assign(f, h), f;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let o, i = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const l = Ry(this.apiClient, e);
      return i = b("{model}:predict", l._url), s = l._query, delete l._url, delete l._query, o = this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(l),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = by(u), d = new Em();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let o, i = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const l = Kv(this.apiClient, e);
      return i = b("{model}:predict", l._url), s = l._query, delete l._url, delete l._query, o = this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(l),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = Yv(u), d = new Tm();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let o, i = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const l = Rv(this.apiClient, e);
      return i = b("{model}:predict", l._url), s = l._query, delete l._url, delete l._query, o = this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(l),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = bv(u), d = new Sm();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let o, i = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const l = Dv(this.apiClient, e);
      return i = b("{model}:predict", l._url), s = l._query, delete l._url, delete l._query, o = this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(l),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = Lv(u), d = new wm();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, o, i;
    let s, l = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = cv(this.apiClient, e);
      return l = b("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => is(d));
    } else {
      const c = uv(this.apiClient, e);
      return l = b("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), s.then((d) => os(d));
    }
  }
  async listInternal(e) {
    var t, n, o, i;
    let s, l = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = vv(this.apiClient, e);
      return l = b("{models_url}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Tv(d), f = new dl();
        return Object.assign(f, h), f;
      });
    } else {
      const c = yv(this.apiClient, e);
      return l = b("{models_url}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Ev(d), f = new dl();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, o, i;
    let s, l = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Jv(this.apiClient, e);
      return l = b("{model}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => is(d));
    } else {
      const c = Ov(this.apiClient, e);
      return l = b("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), s.then((d) => os(d));
    }
  }
  async delete(e) {
    var t, n, o, i;
    let s, l = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = wy(this.apiClient, e);
      return l = b("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Cy(d), f = new fl();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Sy(this.apiClient, e);
      return l = b("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Iy(d), f = new fl();
        return Object.assign(f, h), f;
      });
    }
  }
  async countTokens(e) {
    var t, n, o, i;
    let s, l = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = vy(this.apiClient, e);
      return l = b("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Ty(d), f = new hl();
        return Object.assign(f, h), f;
      });
    } else {
      const c = yy(this.apiClient, e);
      return l = b("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Ey(d), f = new hl();
        return Object.assign(f, h), f;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let o, i = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const l = dy(this.apiClient, e);
      return i = b("{model}:computeTokens", l._url), s = l._query, delete l._url, delete l._query, o = this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(l),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = fy(u), d = new Im();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, o, i;
    let s, l = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = jy(this.apiClient, e);
      return l = b("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => {
        const h = Qy(d), f = new pl();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Zy(this.apiClient, e);
      return l = b("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), s.then((d) => {
        const h = Xy(d), f = new pl();
        return Object.assign(f, h), f;
      });
    }
  }
}, OE = class extends We {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async getVideosOperation(e) {
    const t = e.operation, n = e.config;
    if (t.name === void 0 || t.name === "") throw new Error("Operation name is required.");
    if (this.apiClient.isVertexAI()) {
      const o = t.name.split("/operations/")[0];
      let i;
      n && "httpOptions" in n && (i = n.httpOptions);
      const s = await this.fetchPredictVideosOperationInternal({
        operationName: t.name,
        resourceName: o,
        config: { httpOptions: i }
      });
      return t._fromAPIResponse({
        apiResponse: s,
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
      let i;
      n && "httpOptions" in n && (i = n.httpOptions);
      const s = await this.fetchPredictVideosOperationInternal({
        operationName: t.name,
        resourceName: o,
        config: { httpOptions: i }
      });
      return t._fromAPIResponse({
        apiResponse: s,
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
    var t, n, o, i;
    let s, l = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = pm(e);
      return l = b("{operationName}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s;
    } else {
      const c = hm(e);
      return l = b("{operationName}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), s;
    }
  }
  async fetchPredictVideosOperationInternal(e) {
    var t, n;
    let o, i = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const l = rm(e);
      return i = b("{resourceName}:fetchPredictOperation", l._url), s = l._query, delete l._url, delete l._query, o = this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(l),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o;
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
};
function Fl(e) {
  const t = {};
  if (r(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function JE(e) {
  const t = {}, n = r(e, ["apiKey"]);
  if (n != null && a(t, ["apiKey"], n), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function WE(e) {
  const t = {}, n = r(e, ["data"]);
  if (n != null && a(t, ["data"], n), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["mimeType"]);
  return o != null && a(t, ["mimeType"], o), t;
}
function KE(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((s) => nT(s))), a(t, ["parts"], i);
  }
  const o = r(e, ["role"]);
  return o != null && a(t, ["role"], o), t;
}
function YE(e, t, n) {
  const o = {}, i = r(t, ["expireTime"]);
  n !== void 0 && i != null && a(n, ["expireTime"], i);
  const s = r(t, ["newSessionExpireTime"]);
  n !== void 0 && s != null && a(n, ["newSessionExpireTime"], s);
  const l = r(t, ["uses"]);
  n !== void 0 && l != null && a(n, ["uses"], l);
  const u = r(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && a(n, ["bidiGenerateContentSetup"], tT(e, u));
  const c = r(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && a(n, ["fieldMask"], c), o;
}
function zE(e, t) {
  const n = {}, o = r(t, ["config"]);
  return o != null && a(n, ["config"], YE(e, o, n)), n;
}
function XE(e) {
  const t = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = r(e, ["fileUri"]);
  n != null && a(t, ["fileUri"], n);
  const o = r(e, ["mimeType"]);
  return o != null && a(t, ["mimeType"], o), t;
}
function QE(e) {
  const t = {}, n = r(e, ["id"]);
  n != null && a(t, ["id"], n);
  const o = r(e, ["args"]);
  o != null && a(t, ["args"], o);
  const i = r(e, ["name"]);
  if (i != null && a(t, ["name"], i), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function ZE(e) {
  const t = {}, n = r(e, ["authConfig"]);
  n != null && a(t, ["authConfig"], JE(n));
  const o = r(e, ["enableWidget"]);
  return o != null && a(t, ["enableWidget"], o), t;
}
function jE(e) {
  const t = {}, n = r(e, ["searchTypes"]);
  if (n != null && a(t, ["searchTypes"], n), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = r(e, ["timeRangeFilter"]);
  return o != null && a(t, ["timeRangeFilter"], o), t;
}
function eT(e, t) {
  const n = {}, o = r(e, ["generationConfig"]);
  t !== void 0 && o != null && a(t, ["setup", "generationConfig"], o);
  const i = r(e, ["responseModalities"]);
  t !== void 0 && i != null && a(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], i);
  const s = r(e, ["temperature"]);
  t !== void 0 && s != null && a(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], s);
  const l = r(e, ["topP"]);
  t !== void 0 && l != null && a(t, [
    "setup",
    "generationConfig",
    "topP"
  ], l);
  const u = r(e, ["topK"]);
  t !== void 0 && u != null && a(t, [
    "setup",
    "generationConfig",
    "topK"
  ], u);
  const c = r(e, ["maxOutputTokens"]);
  t !== void 0 && c != null && a(t, [
    "setup",
    "generationConfig",
    "maxOutputTokens"
  ], c);
  const d = r(e, ["mediaResolution"]);
  t !== void 0 && d != null && a(t, [
    "setup",
    "generationConfig",
    "mediaResolution"
  ], d);
  const h = r(e, ["seed"]);
  t !== void 0 && h != null && a(t, [
    "setup",
    "generationConfig",
    "seed"
  ], h);
  const f = r(e, ["speechConfig"]);
  t !== void 0 && f != null && a(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], zs(f));
  const p = r(e, ["thinkingConfig"]);
  t !== void 0 && p != null && a(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], p);
  const m = r(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && a(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const g = r(e, ["systemInstruction"]);
  t !== void 0 && g != null && a(t, ["setup", "systemInstruction"], KE(ne(g)));
  const _ = r(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let C = Ut(_);
    Array.isArray(C) && (C = C.map((k) => sT(Lt(k)))), a(t, ["setup", "tools"], C);
  }
  const y = r(e, ["sessionResumption"]);
  t !== void 0 && y != null && a(t, ["setup", "sessionResumption"], iT(y));
  const I = r(e, ["inputAudioTranscription"]);
  t !== void 0 && I != null && a(t, ["setup", "inputAudioTranscription"], Fl(I));
  const S = r(e, ["outputAudioTranscription"]);
  t !== void 0 && S != null && a(t, ["setup", "outputAudioTranscription"], Fl(S));
  const A = r(e, ["realtimeInputConfig"]);
  t !== void 0 && A != null && a(t, ["setup", "realtimeInputConfig"], A);
  const R = r(e, ["contextWindowCompression"]);
  t !== void 0 && R != null && a(t, ["setup", "contextWindowCompression"], R);
  const $ = r(e, ["proactivity"]);
  if (t !== void 0 && $ != null && a(t, ["setup", "proactivity"], $), r(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const T = r(e, ["avatarConfig"]);
  t !== void 0 && T != null && a(t, ["setup", "avatarConfig"], T);
  const U = r(e, ["safetySettings"]);
  if (t !== void 0 && U != null) {
    let C = U;
    Array.isArray(C) && (C = C.map((k) => oT(k))), a(t, ["setup", "safetySettings"], C);
  }
  return n;
}
function tT(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && a(n, ["setup", "model"], O(e, o));
  const i = r(t, ["config"]);
  return i != null && a(n, ["config"], eT(i, n)), n;
}
function nT(e) {
  const t = {}, n = r(e, ["mediaResolution"]);
  n != null && a(t, ["mediaResolution"], n);
  const o = r(e, ["codeExecutionResult"]);
  o != null && a(t, ["codeExecutionResult"], o);
  const i = r(e, ["executableCode"]);
  i != null && a(t, ["executableCode"], i);
  const s = r(e, ["fileData"]);
  s != null && a(t, ["fileData"], XE(s));
  const l = r(e, ["functionCall"]);
  l != null && a(t, ["functionCall"], QE(l));
  const u = r(e, ["functionResponse"]);
  u != null && a(t, ["functionResponse"], u);
  const c = r(e, ["inlineData"]);
  c != null && a(t, ["inlineData"], WE(c));
  const d = r(e, ["text"]);
  d != null && a(t, ["text"], d);
  const h = r(e, ["thought"]);
  h != null && a(t, ["thought"], h);
  const f = r(e, ["thoughtSignature"]);
  f != null && a(t, ["thoughtSignature"], f);
  const p = r(e, ["videoMetadata"]);
  p != null && a(t, ["videoMetadata"], p);
  const m = r(e, ["toolCall"]);
  m != null && a(t, ["toolCall"], m);
  const g = r(e, ["toolResponse"]);
  g != null && a(t, ["toolResponse"], g);
  const _ = r(e, ["partMetadata"]);
  return _ != null && a(t, ["partMetadata"], _), t;
}
function oT(e) {
  const t = {}, n = r(e, ["category"]);
  if (n != null && a(t, ["category"], n), r(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = r(e, ["threshold"]);
  return o != null && a(t, ["threshold"], o), t;
}
function iT(e) {
  const t = {}, n = r(e, ["handle"]);
  if (n != null && a(t, ["handle"], n), r(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function sT(e) {
  const t = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = r(e, ["computerUse"]);
  n != null && a(t, ["computerUse"], n);
  const o = r(e, ["fileSearch"]);
  o != null && a(t, ["fileSearch"], o);
  const i = r(e, ["googleSearch"]);
  i != null && a(t, ["googleSearch"], jE(i));
  const s = r(e, ["googleMaps"]);
  s != null && a(t, ["googleMaps"], ZE(s));
  const l = r(e, ["codeExecution"]);
  if (l != null && a(t, ["codeExecution"], l), r(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = r(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), a(t, ["functionDeclarations"], f);
  }
  const c = r(e, ["googleSearchRetrieval"]);
  if (c != null && a(t, ["googleSearchRetrieval"], c), r(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = r(e, ["urlContext"]);
  d != null && a(t, ["urlContext"], d);
  const h = r(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), a(t, ["mcpServers"], f);
  }
  return t;
}
function rT(e) {
  const t = [];
  for (const n in e) if (Object.prototype.hasOwnProperty.call(e, n)) {
    const o = e[n];
    if (typeof o == "object" && o != null && Object.keys(o).length > 0) {
      const i = Object.keys(o).map((s) => `${n}.${s}`);
      t.push(...i);
    } else t.push(n);
  }
  return t.join(",");
}
function aT(e, t) {
  let n = null;
  const o = e.bidiGenerateContentSetup;
  if (typeof o == "object" && o !== null && "setup" in o) {
    const s = o.setup;
    typeof s == "object" && s !== null ? (e.bidiGenerateContentSetup = s, n = s) : delete e.bidiGenerateContentSetup;
  } else o !== void 0 && delete e.bidiGenerateContentSetup;
  const i = e.fieldMask;
  if (n) {
    const s = rT(n);
    if (Array.isArray(t?.lockAdditionalFields) && t?.lockAdditionalFields.length === 0) s ? e.fieldMask = s : delete e.fieldMask;
    else if (t?.lockAdditionalFields && t.lockAdditionalFields.length > 0 && i !== null && Array.isArray(i) && i.length > 0) {
      const l = [
        "temperature",
        "topK",
        "topP",
        "maxOutputTokens",
        "responseModalities",
        "seed",
        "speechConfig"
      ];
      let u = [];
      i.length > 0 && (u = i.map((d) => l.includes(d) ? `generationConfig.${d}` : d));
      const c = [];
      s && c.push(s), u.length > 0 && c.push(...u), c.length > 0 ? e.fieldMask = c.join(",") : delete e.fieldMask;
    } else delete e.fieldMask;
  } else i !== null && Array.isArray(i) && i.length > 0 ? e.fieldMask = i.join(",") : delete e.fieldMask;
  return e;
}
var lT = class extends We {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let o, i = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const l = zE(this.apiClient, e);
      i = b("auth_tokens", l._url), s = l._query, delete l.config, delete l._url, delete l._query;
      const u = aT(l, e.config);
      return o = this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json()), o.then((c) => c);
    }
  }
};
function uT(e, t) {
  const n = {}, o = r(e, ["force"]);
  return t !== void 0 && o != null && a(t, ["_query", "force"], o), n;
}
function cT(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && a(t, ["_url", "name"], n);
  const o = r(e, ["config"]);
  return o != null && uT(o, t), t;
}
function dT(e) {
  const t = {}, n = r(e, ["name"]);
  return n != null && a(t, ["_url", "name"], n), t;
}
function fT(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && a(t, ["_query", "pageSize"], o);
  const i = r(e, ["pageToken"]);
  return t !== void 0 && i != null && a(t, ["_query", "pageToken"], i), n;
}
function hT(e) {
  const t = {}, n = r(e, ["parent"]);
  n != null && a(t, ["_url", "parent"], n);
  const o = r(e, ["config"]);
  return o != null && fT(o, t), t;
}
function pT(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && a(t, ["sdkHttpResponse"], n);
  const o = r(e, ["nextPageToken"]);
  o != null && a(t, ["nextPageToken"], o);
  const i = r(e, ["documents"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((l) => l)), a(t, ["documents"], s);
  }
  return t;
}
var mT = class extends We {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new pt(Je.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let o, i = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const l = dT(e);
      return i = b("{name}", l._url), s = l._query, delete l._url, delete l._query, o = this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(l),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => u);
    }
  }
  async delete(e) {
    var t, n;
    let o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = cT(e);
      o = b("{name}", s._url), i = s._query, delete s._url, delete s._query, await this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n;
    let o, i = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const l = hT(e);
      return i = b("{parent}/documents", l._url), s = l._query, delete l._url, delete l._query, o = this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(l),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = pT(u), d = new Cm();
        return Object.assign(d, c), d;
      });
    }
  }
}, gT = class extends We {
  constructor(e, t = new mT(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new pt(Je.PAGED_ITEM_FILE_SEARCH_STORES, (o) => this.listInternal(o), await this.listInternal(n), n);
  }
  async uploadToFileSearchStore(e) {
    if (this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support uploading files to a file search store.");
    return this.apiClient.uploadFileToFileSearchStore(e.fileSearchStoreName, e.file, e.config);
  }
  async create(e) {
    var t, n;
    let o, i = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const l = tE(e);
      return i = b("fileSearchStores", l._url), s = l._query, delete l._url, delete l._query, o = this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(l),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => u);
    }
  }
  async get(e) {
    var t, n;
    let o, i = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const l = iE(e);
      return i = b("{name}", l._url), s = l._query, delete l._url, delete l._query, o = this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(l),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => u);
    }
  }
  async delete(e) {
    var t, n;
    let o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = oE(e);
      o = b("{name}", s._url), i = s._query, delete s._url, delete s._query, await this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n;
    let o, i = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const l = cE(e);
      return i = b("fileSearchStores", l._url), s = l._query, delete l._url, delete l._query, o = this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(l),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = dE(u), d = new Am();
        return Object.assign(d, c), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let o, i = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const l = fE(e);
      return i = b("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", l._url), s = l._query, delete l._url, delete l._query, o = this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(l),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = hE(u), d = new Rm();
        return Object.assign(d, c), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let o, i = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const l = aE(e);
      return i = b("{file_search_store_name}:importFile", l._url), s = l._query, delete l._url, delete l._query, o = this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(l),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = rE(u), d = new bm();
        return Object.assign(d, c), d;
      });
    }
  }
}, tf = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return tf = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
}, _T = () => tf();
function rs(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var as = (e) => {
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
}, Ce = class extends Error {
}, Ae = class ls extends Ce {
  constructor(t, n, o, i) {
    super(`${ls.makeMessage(t, n, o)}`), this.status = t, this.headers = i, this.error = n;
  }
  static makeMessage(t, n, o) {
    const i = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && i ? `${t} ${i}` : t ? `${t} status code (no body)` : i || "(no status code or body)";
  }
  static generate(t, n, o, i) {
    if (!t || !i) return new jo({
      message: o,
      cause: as(n)
    });
    const s = n;
    return t === 400 ? new of(t, s, o, i) : t === 401 ? new sf(t, s, o, i) : t === 403 ? new rf(t, s, o, i) : t === 404 ? new af(t, s, o, i) : t === 409 ? new lf(t, s, o, i) : t === 422 ? new uf(t, s, o, i) : t === 429 ? new cf(t, s, o, i) : t >= 500 ? new df(t, s, o, i) : new ls(t, s, o, i);
  }
}, us = class extends Ae {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, jo = class extends Ae {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, nf = class extends jo {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, of = class extends Ae {
}, sf = class extends Ae {
}, rf = class extends Ae {
}, af = class extends Ae {
}, lf = class extends Ae {
}, uf = class extends Ae {
}, cf = class extends Ae {
}, df = class extends Ae {
}, yT = /^[a-z][a-z0-9+.-]*:/i, vT = (e) => yT.test(e), cs = (e) => (cs = Array.isArray, cs(e)), Gl = cs;
function Bl(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function ET(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var TT = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new Ce(`${e} must be an integer`);
  if (t < 0) throw new Ce(`${e} must be a positive integer`);
  return t;
}, ST = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, wT = (e) => new Promise((t) => setTimeout(t, e));
function IT() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function ff(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function CT(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return ff({
    start() {
    },
    async pull(n) {
      const { done: o, value: i } = await t.next();
      o ? n.close() : n.enqueue(i);
    },
    async cancel() {
      var n;
      await ((n = t.return) === null || n === void 0 ? void 0 : n.call(t));
    }
  });
}
function hf(e) {
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
async function AT(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const o = e.getReader(), i = o.cancel();
  o.releaseLock(), await i;
}
var RT = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function bT(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new Ce(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var PT = "0.0.1", pf = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Ei(e, t, n) {
  return pf(), new File(e, t ?? "unknown_file", n);
}
function xT(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var MT = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", mf = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", NT = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && mf(e), kT = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function DT(e, t, n) {
  if (pf(), e = await e, NT(e))
    return e instanceof File ? e : Ei([await e.arrayBuffer()], e.name);
  if (kT(e)) {
    const i = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Ei(await ds(i), t, n);
  }
  const o = await ds(e);
  if (t || (t = xT(e)), !n?.type) {
    const i = o.find((s) => typeof s == "object" && "type" in s && s.type);
    typeof i == "string" && (n = Object.assign(Object.assign({}, n), { type: i }));
  }
  return Ei(o, t, n);
}
async function ds(e) {
  var t, n, o, i, s;
  let l = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) l.push(e);
  else if (mf(e)) l.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (MT(e)) try {
    for (var u = !0, c = Ne(e), d; d = await c.next(), t = d.done, !t; u = !0) {
      i = d.value, u = !1;
      const h = i;
      l.push(...await ds(h));
    }
  } catch (h) {
    n = { error: h };
  } finally {
    try {
      !u && !t && (o = c.return) && await o.call(c);
    } finally {
      if (n) throw n.error;
    }
  }
  else {
    const h = (s = e?.constructor) === null || s === void 0 ? void 0 : s.name;
    throw new Error(`Unexpected data type: ${typeof e}${h ? `; constructor: ${h}` : ""}${LT(e)}`);
  }
  return l;
}
function LT(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var Xs = class {
  constructor(e) {
    this._client = e;
  }
};
Xs._key = [];
function gf(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var ql = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), UT = (e = gf) => (function(n, ...o) {
  if (n.length === 1) return n[0];
  let i = !1;
  const s = [], l = n.reduce((h, f, p) => {
    var m, g, _;
    /[?#]/.test(f) && (i = !0);
    const y = o[p];
    let I = (i ? encodeURIComponent : e)("" + y);
    return p !== o.length && (y == null || typeof y == "object" && y.toString === ((_ = Object.getPrototypeOf((g = Object.getPrototypeOf((m = y.hasOwnProperty) !== null && m !== void 0 ? m : ql)) !== null && g !== void 0 ? g : ql)) === null || _ === void 0 ? void 0 : _.toString)) && (I = y + "", s.push({
      start: h.length + f.length,
      length: I.length,
      error: `Value of type ${Object.prototype.toString.call(y).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === o.length ? "" : I);
  }, ""), u = l.split(/[?#]/, 1)[0], c = /(^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) {
    const h = d[0].startsWith("/"), f = h ? 1 : 0, p = h ? d[0].slice(1) : d[0];
    s.push({
      start: d.index + f,
      length: p.length,
      error: `Value "${p}" can't be safely passed as a path parameter`
    });
  }
  if (s.sort((h, f) => h.start - f.start), s.length > 0) {
    let h = 0;
    const f = s.reduce((p, m) => {
      const g = " ".repeat(m.start - h), _ = "^".repeat(m.length);
      return h = m.start + m.length, p + g + _;
    }, "");
    throw new Ce(`Path parameters result in path with invalid segments:
${s.map((p) => p.error).join(`
`)}
${l}
${f}`);
  }
  return l;
}), Pe = /* @__PURE__ */ UT(gf), _f = class extends Xs {
  create(e, t) {
    var n;
    const { api_version: o = this._client.apiVersion } = e, i = et(e, ["api_version"]);
    if ("model" in i && "agent_config" in i) throw new Ce("Invalid request: specified `model` and `agent_config`. If specifying `model`, use `generation_config`.");
    if ("agent" in i && "generation_config" in i) throw new Ce("Invalid request: specified `agent` and `generation_config`. If specifying `agent`, use `agent_config`.");
    return this._client.post(Pe`/${o}/interactions`, Object.assign(Object.assign({ body: i }, t), { stream: (n = e.stream) !== null && n !== void 0 ? n : !1 }));
  }
  delete(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.delete(Pe`/${o}/interactions/${e}`, n);
  }
  cancel(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.post(Pe`/${o}/interactions/${e}/cancel`, n);
  }
  get(e, t = {}, n) {
    var o;
    const i = t ?? {}, { api_version: s = this._client.apiVersion } = i, l = et(i, ["api_version"]);
    return this._client.get(Pe`/${s}/interactions/${e}`, Object.assign(Object.assign({ query: l }, n), { stream: (o = t?.stream) !== null && o !== void 0 ? o : !1 }));
  }
};
_f._key = Object.freeze(["interactions"]);
var yf = class extends _f {
}, vf = class extends Xs {
  create(e, t) {
    const { api_version: n = this._client.apiVersion, webhook_id: o } = e, i = et(e, ["api_version", "webhook_id"]);
    return this._client.post(Pe`/${n}/webhooks`, Object.assign({
      query: { webhook_id: o },
      body: i
    }, t));
  }
  update(e, t, n) {
    const { api_version: o = this._client.apiVersion, update_mask: i } = t, s = et(t, ["api_version", "update_mask"]);
    return this._client.patch(Pe`/${o}/webhooks/${e}`, Object.assign({
      query: { update_mask: i },
      body: s
    }, n));
  }
  list(e = {}, t) {
    const n = e ?? {}, { api_version: o = this._client.apiVersion } = n, i = et(n, ["api_version"]);
    return this._client.get(Pe`/${o}/webhooks`, Object.assign({ query: i }, t));
  }
  delete(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.delete(Pe`/${o}/webhooks/${e}`, n);
  }
  get(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.get(Pe`/${o}/webhooks/${e}`, n);
  }
  ping(e, t = void 0, n) {
    const { api_version: o = this._client.apiVersion, body: i } = t ?? {};
    return this._client.post(Pe`/${o}/webhooks/${e}:ping`, Object.assign({ body: i }, n));
  }
  rotateSigningSecret(e, t = {}, n) {
    const o = t ?? {}, { api_version: i = this._client.apiVersion } = o, s = et(o, ["api_version"]);
    return this._client.post(Pe`/${i}/webhooks/${e}:rotateSigningSecret`, Object.assign({ body: s }, n));
  }
};
vf._key = Object.freeze(["webhooks"]);
var Ef = class extends vf {
};
function $T(e) {
  let t = 0;
  for (const i of e) t += i.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const i of e)
    n.set(i, o), o += i.length;
  return n;
}
var so;
function Qs(e) {
  let t;
  return (so ?? (t = new globalThis.TextEncoder(), so = t.encode.bind(t)))(e);
}
var ro;
function Vl(e) {
  let t;
  return (ro ?? (t = new globalThis.TextDecoder(), ro = t.decode.bind(t)))(e);
}
var ei = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Qs(e) : e;
    this.buffer = $T([this.buffer, n]);
    const o = [];
    let i;
    for (; (i = FT(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (i.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = i.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (i.index !== this.carriageReturnIndex + 1 || i.carriage)) {
        o.push(Vl(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const s = this.carriageReturnIndex !== null ? i.preceding - 1 : i.preceding, l = Vl(this.buffer.subarray(0, s));
      o.push(l), this.buffer = this.buffer.subarray(i.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), o;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
ei.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
ei.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function FT(e, t) {
  const i = t ?? 0, s = e.indexOf(10, i), l = e.indexOf(13, i);
  if (s === -1 && l === -1) return null;
  let u;
  return s !== -1 && l !== -1 ? u = Math.min(s, l) : u = s !== -1 ? s : l, e[u] === 10 ? {
    preceding: u,
    index: u + 1,
    carriage: !1
  } : {
    preceding: u,
    index: u + 1,
    carriage: !0
  };
}
var Lo = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Hl = (e, t, n) => {
  if (e) {
    if (ET(Lo, e)) return e;
    ce(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Lo))}`);
  }
};
function yn() {
}
function ao(e, t, n) {
  return !t || Lo[e] > Lo[n] ? yn : t[e].bind(t);
}
var GT = {
  error: yn,
  warn: yn,
  info: yn,
  debug: yn
}, Ol = /* @__PURE__ */ new WeakMap();
function ce(e) {
  var t;
  const n = e.logger, o = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return GT;
  const i = Ol.get(n);
  if (i && i[0] === o) return i[1];
  const s = {
    error: ao("error", n, o),
    warn: ao("warn", n, o),
    info: ao("info", n, o),
    debug: ao("debug", n, o)
  };
  return Ol.set(n, [o, s]), s;
}
var lt = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), BT = class vn {
  constructor(t, n, o) {
    this.iterator = t, this.controller = n, this.client = o;
  }
  static fromSSEResponse(t, n, o) {
    let i = !1;
    const s = o ? ce(o) : console;
    function l() {
      return Me(this, arguments, function* () {
        var c, d, h, f;
        if (i) throw new Ce("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        i = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = Ne(qT(t, n)), _; _ = yield q(g.next()), c = _.done, !c; m = !0) {
              f = _.value, m = !1;
              const y = f;
              if (!p)
                if (y.data.startsWith("[DONE]")) {
                  p = !0;
                  continue;
                } else try {
                  yield yield q(JSON.parse(y.data));
                } catch (I) {
                  throw s.error("Could not parse message into JSON:", y.data), s.error("From chunk:", y.raw), I;
                }
            }
          } catch (y) {
            d = { error: y };
          } finally {
            try {
              !m && !c && (h = g.return) && (yield q(h.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (y) {
          if (rs(y)) return yield q(void 0);
          throw y;
        } finally {
          p || n.abort();
        }
      });
    }
    return new vn(l, n, o);
  }
  static fromReadableStream(t, n, o) {
    let i = !1;
    function s() {
      return Me(this, arguments, function* () {
        var c, d, h, f;
        const p = new ei(), m = hf(t);
        try {
          for (var g = !0, _ = Ne(m), y; y = yield q(_.next()), c = y.done, !c; g = !0) {
            f = y.value, g = !1;
            const I = f;
            for (const S of p.decode(I)) yield yield q(S);
          }
        } catch (I) {
          d = { error: I };
        } finally {
          try {
            !g && !c && (h = _.return) && (yield q(h.call(_)));
          } finally {
            if (d) throw d.error;
          }
        }
        for (const I of p.flush()) yield yield q(I);
      });
    }
    function l() {
      return Me(this, arguments, function* () {
        var c, d, h, f;
        if (i) throw new Ce("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        i = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = Ne(s()), _; _ = yield q(g.next()), c = _.done, !c; m = !0) {
              f = _.value, m = !1;
              const y = f;
              p || y && (yield yield q(JSON.parse(y)));
            }
          } catch (y) {
            d = { error: y };
          } finally {
            try {
              !m && !c && (h = g.return) && (yield q(h.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (y) {
          if (rs(y)) return yield q(void 0);
          throw y;
        } finally {
          p || n.abort();
        }
      });
    }
    return new vn(l, n, o);
  }
  [Symbol.asyncIterator]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], o = this.iterator(), i = (s) => ({ next: () => {
      if (s.length === 0) {
        const l = o.next();
        t.push(l), n.push(l);
      }
      return s.shift();
    } });
    return [new vn(() => i(t), this.controller, this.client), new vn(() => i(n), this.controller, this.client)];
  }
  toReadableStream() {
    const t = this;
    let n;
    return ff({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: i, done: s } = await n.next();
          if (s) return o.close();
          const l = Qs(JSON.stringify(i) + `
`);
          o.enqueue(l);
        } catch (i) {
          o.error(i);
        }
      },
      async cancel() {
        var o;
        await ((o = n.return) === null || o === void 0 ? void 0 : o.call(n));
      }
    });
  }
};
function qT(e, t) {
  return Me(this, arguments, function* () {
    var o, i, s, l;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new Ce("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new Ce("Attempted to iterate over a response with no body");
    const u = new HT(), c = new ei(), d = hf(e.body);
    try {
      for (var h = !0, f = Ne(VT(d)), p; p = yield q(f.next()), o = p.done, !o; h = !0) {
        l = p.value, h = !1;
        const m = l;
        for (const g of c.decode(m)) {
          const _ = u.decode(g);
          _ && (yield yield q(_));
        }
      }
    } catch (m) {
      i = { error: m };
    } finally {
      try {
        !h && !o && (s = f.return) && (yield q(s.call(f)));
      } finally {
        if (i) throw i.error;
      }
    }
    for (const m of c.flush()) {
      const g = u.decode(m);
      g && (yield yield q(g));
    }
  });
}
function VT(e) {
  return Me(this, arguments, function* () {
    var n, o, i, s;
    try {
      for (var l = !0, u = Ne(e), c; c = yield q(u.next()), n = c.done, !n; l = !0) {
        s = c.value, l = !1;
        const d = s;
        d != null && (yield yield q(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? Qs(d) : d));
      }
    } catch (d) {
      o = { error: d };
    } finally {
      try {
        !l && !n && (i = u.return) && (yield q(i.call(u)));
      } finally {
        if (o) throw o.error;
      }
    }
  });
}
var HT = class {
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
    let [t, n, o] = OT(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function OT(e, t) {
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
async function JT(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: i, startTime: s } = t, l = await (async () => {
    var u;
    if (t.options.stream)
      return ce(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : BT.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type"), d = (u = c?.split(";")[0]) === null || u === void 0 ? void 0 : u.trim();
    return d?.includes("application/json") || d?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
  })();
  return ce(e).debug(`[${o}] response parsed`, lt({
    retryOfRequestLogID: i,
    url: n.url,
    status: n.status,
    body: l,
    durationMs: Date.now() - s
  })), l;
}
var WT = class Tf extends Promise {
  constructor(t, n, o = JT) {
    super((i) => {
      i(null);
    }), this.responsePromise = n, this.parseResponse = o, this.client = t;
  }
  _thenUnwrap(t) {
    return new Tf(this.client, this.responsePromise, async (n, o) => t(await this.parseResponse(n, o), o));
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
}, Sf = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* KT(e) {
  if (!e) return;
  if (Sf in e) {
    const { values: o, nulls: i } = e;
    yield* o.entries();
    for (const s of i) yield [s, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Gl(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const i = o[0];
    if (typeof i != "string") throw new TypeError("expected header name to be a string");
    const s = Gl(o[1]) ? o[1] : [o[1]];
    let l = !1;
    for (const u of s)
      u !== void 0 && (t && !l && (l = !0, yield [i, null]), yield [i, u]);
  }
}
var on = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const i = /* @__PURE__ */ new Set();
    for (const [s, l] of KT(o)) {
      const u = s.toLowerCase();
      i.has(u) || (t.delete(s), i.add(u)), l === null ? (t.delete(s), n.add(u)) : (t.append(s, l), n.delete(u));
    }
  }
  return {
    [Sf]: !0,
    values: t,
    nulls: n
  };
}, Ti = (e) => {
  var t, n, o, i, s;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((s = (i = (o = globalThis.Deno.env) === null || o === void 0 ? void 0 : o.get) === null || i === void 0 ? void 0 : i.call(o, e)) === null || s === void 0 ? void 0 : s.trim()) || void 0;
}, wf, If = class Cf {
  constructor(t) {
    var n, o, i, s, l, u, c, { baseURL: d = Ti("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: h = (n = Ti("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: f = "v1beta" } = t, p = et(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: h,
      apiVersion: f
    }, p), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (o = m.timeout) !== null && o !== void 0 ? o : Cf.DEFAULT_TIMEOUT, this.logger = (i = m.logger) !== null && i !== void 0 ? i : console;
    const g = "warn";
    this.logLevel = g, this.logLevel = (l = (s = Hl(m.logLevel, "ClientOptions.logLevel", this)) !== null && s !== void 0 ? s : Hl(Ti("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && l !== void 0 ? l : g, this.fetchOptions = m.fetchOptions, this.maxRetries = (u = m.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = m.fetch) !== null && c !== void 0 ? c : IT(), this.encoder = RT, this._options = m, this.apiKey = h, this.apiVersion = f, this.clientAdapter = m.clientAdapter;
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
    const n = on([t.headers]);
    if (!(n.values.has("authorization") || n.values.has("x-goog-api-key"))) {
      if (this.apiKey) return on([{ "x-goog-api-key": this.apiKey }]);
      if (this.clientAdapter && this.clientAdapter.isVertexAI()) return on([await this.clientAdapter.getAuthHeaders()]);
    }
  }
  stringifyQuery(t) {
    return bT(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${PT}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${_T()}`;
  }
  makeStatusError(t, n, o, i) {
    return Ae.generate(t, n, o, i);
  }
  buildURL(t, n, o) {
    const i = !this.baseURLOverridden() && o || this.baseURL, s = vT(t) ? new URL(t) : new URL(i + (i.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), l = this.defaultQuery(), u = Object.fromEntries(s.searchParams);
    return (!Bl(l) || !Bl(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), l), n)), typeof n == "object" && n && !Array.isArray(n) && (s.search = this.stringifyQuery(n)), s.toString();
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
    return this.request(Promise.resolve(o).then((i) => Object.assign({
      method: t,
      path: n
    }, i)));
  }
  request(t, n = null) {
    return new WT(this, this.makeRequest(t, n, void 0));
  }
  async makeRequest(t, n, o) {
    var i, s, l;
    const u = await t, c = (i = u.maxRetries) !== null && i !== void 0 ? i : this.maxRetries;
    n == null && (n = c), await this.prepareOptions(u);
    const { req: d, url: h, timeout: f } = await this.buildRequest(u, { retryCount: c - n });
    await this.prepareRequest(d, {
      url: h,
      options: u
    });
    const p = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), m = o === void 0 ? "" : `, retryOf: ${o}`, g = Date.now();
    if (ce(this).debug(`[${p}] sending request`, lt({
      retryOfRequestLogID: o,
      method: u.method,
      url: h,
      options: u,
      headers: d.headers
    })), !((s = u.signal) === null || s === void 0) && s.aborted) throw new us();
    const _ = new AbortController(), y = await this.fetchWithTimeout(h, d, f, _).catch(as), I = Date.now();
    if (y instanceof globalThis.Error) {
      const A = `retrying, ${n} attempts remaining`;
      if (!((l = u.signal) === null || l === void 0) && l.aborted) throw new us();
      const R = rs(y) || /timed? ?out/i.test(String(y) + ("cause" in y ? String(y.cause) : ""));
      if (n)
        return ce(this).info(`[${p}] connection ${R ? "timed out" : "failed"} - ${A}`), ce(this).debug(`[${p}] connection ${R ? "timed out" : "failed"} (${A})`, lt({
          retryOfRequestLogID: o,
          url: h,
          durationMs: I - g,
          message: y.message
        })), this.retryRequest(u, n, o ?? p);
      throw ce(this).info(`[${p}] connection ${R ? "timed out" : "failed"} - error; no more retries left`), ce(this).debug(`[${p}] connection ${R ? "timed out" : "failed"} (error; no more retries left)`, lt({
        retryOfRequestLogID: o,
        url: h,
        durationMs: I - g,
        message: y.message
      })), R ? new nf() : new jo({ cause: y });
    }
    const S = `[${p}${m}] ${d.method} ${h} ${y.ok ? "succeeded" : "failed"} with status ${y.status} in ${I - g}ms`;
    if (!y.ok) {
      const A = await this.shouldRetry(y);
      if (n && A) {
        const C = `retrying, ${n} attempts remaining`;
        return await AT(y.body), ce(this).info(`${S} - ${C}`), ce(this).debug(`[${p}] response error (${C})`, lt({
          retryOfRequestLogID: o,
          url: y.url,
          status: y.status,
          headers: y.headers,
          durationMs: I - g
        })), this.retryRequest(u, n, o ?? p, y.headers);
      }
      const R = A ? "error; no more retries left" : "error; not retryable";
      ce(this).info(`${S} - ${R}`);
      const $ = await y.text().catch((C) => as(C).message), T = ST($), U = T ? void 0 : $;
      throw ce(this).debug(`[${p}] response error (${R})`, lt({
        retryOfRequestLogID: o,
        url: y.url,
        status: y.status,
        headers: y.headers,
        message: U,
        durationMs: Date.now() - g
      })), this.makeStatusError(y.status, T, U, y.headers);
    }
    return ce(this).info(S), ce(this).debug(`[${p}] response start`, lt({
      retryOfRequestLogID: o,
      url: y.url,
      status: y.status,
      headers: y.headers,
      durationMs: I - g
    })), {
      response: y,
      options: u,
      controller: _,
      requestLogID: p,
      retryOfRequestLogID: o,
      startTime: g
    };
  }
  async fetchWithTimeout(t, n, o, i) {
    const s = n || {}, { signal: l, method: u } = s, c = et(s, ["signal", "method"]), d = this._makeAbort(i);
    l && l.addEventListener("abort", d, { once: !0 });
    const h = setTimeout(d, o), f = globalThis.ReadableStream && c.body instanceof globalThis.ReadableStream || typeof c.body == "object" && c.body !== null && Symbol.asyncIterator in c.body, p = Object.assign(Object.assign(Object.assign({ signal: i.signal }, f ? { duplex: "half" } : {}), { method: "GET" }), c);
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
  async retryRequest(t, n, o, i) {
    var s;
    let l;
    const u = i?.get("retry-after-ms");
    if (u) {
      const d = parseFloat(u);
      Number.isNaN(d) || (l = d);
    }
    const c = i?.get("retry-after");
    if (c && !l) {
      const d = parseFloat(c);
      Number.isNaN(d) ? l = Date.parse(c) - Date.now() : l = d * 1e3;
    }
    if (l === void 0) {
      const d = (s = t.maxRetries) !== null && s !== void 0 ? s : this.maxRetries;
      l = this.calculateDefaultRetryTimeoutMillis(n, d);
    }
    return await wT(l), this.makeRequest(t, n - 1, o);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const s = n - t;
    return Math.min(0.5 * Math.pow(2, s), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var o, i, s;
    const l = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: h } = l, f = this.buildURL(c, d, h);
    "timeout" in l && TT("timeout", l.timeout), l.timeout = (o = l.timeout) !== null && o !== void 0 ? o : this.timeout;
    const { bodyHeaders: p, body: m } = this.buildBody({ options: l }), g = await this.buildHeaders({
      options: t,
      method: u,
      bodyHeaders: p,
      retryCount: n
    });
    return {
      req: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({
        method: u,
        headers: g
      }, l.signal && { signal: l.signal }), globalThis.ReadableStream && m instanceof globalThis.ReadableStream && { duplex: "half" }), m && { body: m }), (i = this.fetchOptions) !== null && i !== void 0 ? i : {}), (s = l.fetchOptions) !== null && s !== void 0 ? s : {}),
      url: f,
      timeout: l.timeout
    };
  }
  async buildHeaders({ options: t, method: n, bodyHeaders: o, retryCount: i }) {
    let s = {};
    this.idempotencyHeader && n !== "get" && (t.idempotencyKey || (t.idempotencyKey = this.defaultIdempotencyKey()), s[this.idempotencyHeader] = t.idempotencyKey);
    const l = await this.authHeaders(t);
    let u = on([
      s,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent()
      },
      this._options.defaultHeaders,
      o,
      t.headers,
      l
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
    const o = on([n]);
    return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && o.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: t
    } : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
      bodyHeaders: void 0,
      body: CT(t)
    } : typeof t == "object" && o.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: o
    });
  }
};
If.DEFAULT_TIMEOUT = 6e4;
var ee = class extends If {
  constructor() {
    super(...arguments), this.interactions = new yf(this), this.webhooks = new Ef(this);
  }
};
wf = ee;
ee.GeminiNextGenAPIClient = wf;
ee.GeminiNextGenAPIClientError = Ce;
ee.APIError = Ae;
ee.APIConnectionError = jo;
ee.APIConnectionTimeoutError = nf;
ee.APIUserAbortError = us;
ee.NotFoundError = af;
ee.ConflictError = lf;
ee.RateLimitError = cf;
ee.BadRequestError = of;
ee.AuthenticationError = sf;
ee.InternalServerError = df;
ee.PermissionDeniedError = rf;
ee.UnprocessableEntityError = uf;
ee.toFile = DT;
ee.Interactions = yf;
ee.Webhooks = Ef;
function YT(e, t) {
  const n = {}, o = r(e, ["name"]);
  return o != null && a(n, ["_url", "name"], o), n;
}
function zT(e, t) {
  const n = {}, o = r(e, ["name"]);
  return o != null && a(n, ["_url", "name"], o), n;
}
function XT(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  return o != null && a(n, ["sdkHttpResponse"], o), n;
}
function QT(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  return o != null && a(n, ["sdkHttpResponse"], o), n;
}
function ZT(e, t, n) {
  const o = {};
  if (r(e, ["validationDataset"]) !== void 0) throw new Error("validationDataset parameter is not supported in Gemini API.");
  const i = r(e, ["tunedModelDisplayName"]);
  if (t !== void 0 && i != null && a(t, ["displayName"], i), r(e, ["description"]) !== void 0) throw new Error("description parameter is not supported in Gemini API.");
  const s = r(e, ["epochCount"]);
  t !== void 0 && s != null && a(t, [
    "tuningTask",
    "hyperparameters",
    "epochCount"
  ], s);
  const l = r(e, ["learningRateMultiplier"]);
  if (l != null && a(o, [
    "tuningTask",
    "hyperparameters",
    "learningRateMultiplier"
  ], l), r(e, ["exportLastCheckpointOnly"]) !== void 0) throw new Error("exportLastCheckpointOnly parameter is not supported in Gemini API.");
  if (r(e, ["preTunedModelCheckpointId"]) !== void 0) throw new Error("preTunedModelCheckpointId parameter is not supported in Gemini API.");
  if (r(e, ["adapterSize"]) !== void 0) throw new Error("adapterSize parameter is not supported in Gemini API.");
  if (r(e, ["tuningMode"]) !== void 0) throw new Error("tuningMode parameter is not supported in Gemini API.");
  if (r(e, ["customBaseModel"]) !== void 0) throw new Error("customBaseModel parameter is not supported in Gemini API.");
  const u = r(e, ["batchSize"]);
  t !== void 0 && u != null && a(t, [
    "tuningTask",
    "hyperparameters",
    "batchSize"
  ], u);
  const c = r(e, ["learningRate"]);
  if (t !== void 0 && c != null && a(t, [
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
function jT(e, t, n) {
  const o = {};
  let i = r(n, ["config", "method"]);
  if (i === void 0 && (i = "SUPERVISED_FINE_TUNING"), i === "SUPERVISED_FINE_TUNING") {
    const T = r(e, ["validationDataset"]);
    t !== void 0 && T != null && a(t, ["supervisedTuningSpec"], Si(T));
  } else if (i === "PREFERENCE_TUNING") {
    const T = r(e, ["validationDataset"]);
    t !== void 0 && T != null && a(t, ["preferenceOptimizationSpec"], Si(T));
  } else if (i === "DISTILLATION") {
    const T = r(e, ["validationDataset"]);
    t !== void 0 && T != null && a(t, ["distillationSpec"], Si(T));
  }
  const s = r(e, ["tunedModelDisplayName"]);
  t !== void 0 && s != null && a(t, ["tunedModelDisplayName"], s);
  const l = r(e, ["description"]);
  t !== void 0 && l != null && a(t, ["description"], l);
  let u = r(n, ["config", "method"]);
  if (u === void 0 && (u = "SUPERVISED_FINE_TUNING"), u === "SUPERVISED_FINE_TUNING") {
    const T = r(e, ["epochCount"]);
    t !== void 0 && T != null && a(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "epochCount"
    ], T);
  } else if (u === "PREFERENCE_TUNING") {
    const T = r(e, ["epochCount"]);
    t !== void 0 && T != null && a(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "epochCount"
    ], T);
  } else if (u === "DISTILLATION") {
    const T = r(e, ["epochCount"]);
    t !== void 0 && T != null && a(t, [
      "distillationSpec",
      "hyperParameters",
      "epochCount"
    ], T);
  }
  let c = r(n, ["config", "method"]);
  if (c === void 0 && (c = "SUPERVISED_FINE_TUNING"), c === "SUPERVISED_FINE_TUNING") {
    const T = r(e, ["learningRateMultiplier"]);
    t !== void 0 && T != null && a(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], T);
  } else if (c === "PREFERENCE_TUNING") {
    const T = r(e, ["learningRateMultiplier"]);
    t !== void 0 && T != null && a(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], T);
  } else if (c === "DISTILLATION") {
    const T = r(e, ["learningRateMultiplier"]);
    t !== void 0 && T != null && a(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], T);
  }
  let d = r(n, ["config", "method"]);
  if (d === void 0 && (d = "SUPERVISED_FINE_TUNING"), d === "SUPERVISED_FINE_TUNING") {
    const T = r(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && T != null && a(t, ["supervisedTuningSpec", "exportLastCheckpointOnly"], T);
  } else if (d === "PREFERENCE_TUNING") {
    const T = r(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && T != null && a(t, ["preferenceOptimizationSpec", "exportLastCheckpointOnly"], T);
  } else if (d === "DISTILLATION") {
    const T = r(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && T != null && a(t, ["distillationSpec", "exportLastCheckpointOnly"], T);
  }
  let h = r(n, ["config", "method"]);
  if (h === void 0 && (h = "SUPERVISED_FINE_TUNING"), h === "SUPERVISED_FINE_TUNING") {
    const T = r(e, ["adapterSize"]);
    t !== void 0 && T != null && a(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "adapterSize"
    ], T);
  } else if (h === "PREFERENCE_TUNING") {
    const T = r(e, ["adapterSize"]);
    t !== void 0 && T != null && a(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "adapterSize"
    ], T);
  } else if (h === "DISTILLATION") {
    const T = r(e, ["adapterSize"]);
    t !== void 0 && T != null && a(t, [
      "distillationSpec",
      "hyperParameters",
      "adapterSize"
    ], T);
  }
  let f = r(n, ["config", "method"]);
  if (f === void 0 && (f = "SUPERVISED_FINE_TUNING"), f === "SUPERVISED_FINE_TUNING") {
    const T = r(e, ["tuningMode"]);
    t !== void 0 && T != null && a(t, ["supervisedTuningSpec", "tuningMode"], T);
  } else if (f === "DISTILLATION") {
    const T = r(e, ["tuningMode"]);
    t !== void 0 && T != null && a(t, ["distillationSpec", "tuningMode"], T);
  }
  const p = r(e, ["customBaseModel"]);
  t !== void 0 && p != null && a(t, ["customBaseModel"], p);
  let m = r(n, ["config", "method"]);
  if (m === void 0 && (m = "SUPERVISED_FINE_TUNING"), m === "SUPERVISED_FINE_TUNING") {
    const T = r(e, ["batchSize"]);
    t !== void 0 && T != null && a(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "batchSize"
    ], T);
  } else if (m === "DISTILLATION") {
    const T = r(e, ["batchSize"]);
    t !== void 0 && T != null && a(t, [
      "distillationSpec",
      "hyperParameters",
      "batchSize"
    ], T);
  }
  let g = r(n, ["config", "method"]);
  if (g === void 0 && (g = "SUPERVISED_FINE_TUNING"), g === "SUPERVISED_FINE_TUNING") {
    const T = r(e, ["learningRate"]);
    t !== void 0 && T != null && a(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRate"
    ], T);
  } else if (g === "DISTILLATION") {
    const T = r(e, ["learningRate"]);
    t !== void 0 && T != null && a(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRate"
    ], T);
  }
  const _ = r(e, ["labels"]);
  t !== void 0 && _ != null && a(t, ["labels"], _);
  const y = r(e, ["beta"]);
  t !== void 0 && y != null && a(t, [
    "preferenceOptimizationSpec",
    "hyperParameters",
    "beta"
  ], y);
  const I = r(e, ["baseTeacherModel"]);
  t !== void 0 && I != null && a(t, ["distillationSpec", "baseTeacherModel"], I);
  const S = r(e, ["tunedTeacherModelSource"]);
  t !== void 0 && S != null && a(t, ["distillationSpec", "tunedTeacherModelSource"], S);
  const A = r(e, ["sftLossWeightMultiplier"]);
  t !== void 0 && A != null && a(t, [
    "distillationSpec",
    "hyperParameters",
    "sftLossWeightMultiplier"
  ], A);
  const R = r(e, ["outputUri"]);
  t !== void 0 && R != null && a(t, ["outputUri"], R);
  const $ = r(e, ["encryptionSpec"]);
  return t !== void 0 && $ != null && a(t, ["encryptionSpec"], $), o;
}
function eS(e, t) {
  const n = {}, o = r(e, ["baseModel"]);
  o != null && a(n, ["baseModel"], o);
  const i = r(e, ["preTunedModel"]);
  i != null && a(n, ["preTunedModel"], i);
  const s = r(e, ["trainingDataset"]);
  s != null && dS(s);
  const l = r(e, ["config"]);
  return l != null && ZT(l, n), n;
}
function tS(e, t) {
  const n = {}, o = r(e, ["baseModel"]);
  o != null && a(n, ["baseModel"], o);
  const i = r(e, ["preTunedModel"]);
  i != null && a(n, ["preTunedModel"], i);
  const s = r(e, ["trainingDataset"]);
  s != null && fS(s, n, t);
  const l = r(e, ["config"]);
  return l != null && jT(l, n, t), n;
}
function nS(e, t) {
  const n = {}, o = r(e, ["name"]);
  return o != null && a(n, ["_url", "name"], o), n;
}
function oS(e, t) {
  const n = {}, o = r(e, ["name"]);
  return o != null && a(n, ["_url", "name"], o), n;
}
function iS(e, t, n) {
  const o = {}, i = r(e, ["pageSize"]);
  t !== void 0 && i != null && a(t, ["_query", "pageSize"], i);
  const s = r(e, ["pageToken"]);
  t !== void 0 && s != null && a(t, ["_query", "pageToken"], s);
  const l = r(e, ["filter"]);
  return t !== void 0 && l != null && a(t, ["_query", "filter"], l), o;
}
function sS(e, t, n) {
  const o = {}, i = r(e, ["pageSize"]);
  t !== void 0 && i != null && a(t, ["_query", "pageSize"], i);
  const s = r(e, ["pageToken"]);
  t !== void 0 && s != null && a(t, ["_query", "pageToken"], s);
  const l = r(e, ["filter"]);
  return t !== void 0 && l != null && a(t, ["_query", "filter"], l), o;
}
function rS(e, t) {
  const n = {}, o = r(e, ["config"]);
  return o != null && iS(o, n), n;
}
function aS(e, t) {
  const n = {}, o = r(e, ["config"]);
  return o != null && sS(o, n), n;
}
function lS(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && a(n, ["sdkHttpResponse"], o);
  const i = r(e, ["nextPageToken"]);
  i != null && a(n, ["nextPageToken"], i);
  const s = r(e, ["tunedModels"]);
  if (s != null) {
    let l = s;
    Array.isArray(l) && (l = l.map((u) => Af(u))), a(n, ["tuningJobs"], l);
  }
  return n;
}
function uS(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && a(n, ["sdkHttpResponse"], o);
  const i = r(e, ["nextPageToken"]);
  i != null && a(n, ["nextPageToken"], i);
  const s = r(e, ["tuningJobs"]);
  if (s != null) {
    let l = s;
    Array.isArray(l) && (l = l.map((u) => fs(u))), a(n, ["tuningJobs"], l);
  }
  return n;
}
function cS(e, t) {
  const n = {}, o = r(e, ["name"]);
  o != null && a(n, ["model"], o);
  const i = r(e, ["name"]);
  return i != null && a(n, ["endpoint"], i), n;
}
function dS(e, t) {
  const n = {};
  if (r(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (r(e, ["vertexDatasetResource"]) !== void 0) throw new Error("vertexDatasetResource parameter is not supported in Gemini API.");
  const o = r(e, ["examples"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => s)), a(n, ["examples", "examples"], i);
  }
  return n;
}
function fS(e, t, n) {
  const o = {};
  let i = r(n, ["config", "method"]);
  if (i === void 0 && (i = "SUPERVISED_FINE_TUNING"), i === "SUPERVISED_FINE_TUNING") {
    const l = r(e, ["gcsUri"]);
    t !== void 0 && l != null && a(t, ["supervisedTuningSpec", "trainingDatasetUri"], l);
  } else if (i === "PREFERENCE_TUNING") {
    const l = r(e, ["gcsUri"]);
    t !== void 0 && l != null && a(t, ["preferenceOptimizationSpec", "trainingDatasetUri"], l);
  } else if (i === "DISTILLATION") {
    const l = r(e, ["gcsUri"]);
    t !== void 0 && l != null && a(t, ["distillationSpec", "promptDatasetUri"], l);
  }
  let s = r(n, ["config", "method"]);
  if (s === void 0 && (s = "SUPERVISED_FINE_TUNING"), s === "SUPERVISED_FINE_TUNING") {
    const l = r(e, ["vertexDatasetResource"]);
    t !== void 0 && l != null && a(t, ["supervisedTuningSpec", "trainingDatasetUri"], l);
  } else if (s === "PREFERENCE_TUNING") {
    const l = r(e, ["vertexDatasetResource"]);
    t !== void 0 && l != null && a(t, ["preferenceOptimizationSpec", "trainingDatasetUri"], l);
  } else if (s === "DISTILLATION") {
    const l = r(e, ["vertexDatasetResource"]);
    t !== void 0 && l != null && a(t, ["distillationSpec", "promptDatasetUri"], l);
  }
  if (r(e, ["examples"]) !== void 0) throw new Error("examples parameter is not supported in Vertex AI.");
  return o;
}
function Af(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && a(n, ["sdkHttpResponse"], o);
  const i = r(e, ["name"]);
  i != null && a(n, ["name"], i);
  const s = r(e, ["state"]);
  s != null && a(n, ["state"], Dd(s));
  const l = r(e, ["createTime"]);
  l != null && a(n, ["createTime"], l);
  const u = r(e, ["tuningTask", "startTime"]);
  u != null && a(n, ["startTime"], u);
  const c = r(e, ["tuningTask", "completeTime"]);
  c != null && a(n, ["endTime"], c);
  const d = r(e, ["updateTime"]);
  d != null && a(n, ["updateTime"], d);
  const h = r(e, ["description"]);
  h != null && a(n, ["description"], h);
  const f = r(e, ["baseModel"]);
  f != null && a(n, ["baseModel"], f);
  const p = r(e, ["_self"]);
  return p != null && a(n, ["tunedModel"], cS(p)), n;
}
function fs(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && a(n, ["sdkHttpResponse"], o);
  const i = r(e, ["name"]);
  i != null && a(n, ["name"], i);
  const s = r(e, ["state"]);
  s != null && a(n, ["state"], Dd(s));
  const l = r(e, ["createTime"]);
  l != null && a(n, ["createTime"], l);
  const u = r(e, ["startTime"]);
  u != null && a(n, ["startTime"], u);
  const c = r(e, ["endTime"]);
  c != null && a(n, ["endTime"], c);
  const d = r(e, ["updateTime"]);
  d != null && a(n, ["updateTime"], d);
  const h = r(e, ["error"]);
  h != null && a(n, ["error"], h);
  const f = r(e, ["description"]);
  f != null && a(n, ["description"], f);
  const p = r(e, ["baseModel"]);
  p != null && a(n, ["baseModel"], p);
  const m = r(e, ["tunedModel"]);
  m != null && a(n, ["tunedModel"], m);
  const g = r(e, ["preTunedModel"]);
  g != null && a(n, ["preTunedModel"], g);
  const _ = r(e, ["supervisedTuningSpec"]);
  _ != null && a(n, ["supervisedTuningSpec"], _);
  const y = r(e, ["preferenceOptimizationSpec"]);
  y != null && a(n, ["preferenceOptimizationSpec"], y);
  const I = r(e, ["distillationSpec"]);
  I != null && a(n, ["distillationSpec"], I);
  const S = r(e, ["tuningDataStats"]);
  S != null && a(n, ["tuningDataStats"], S);
  const A = r(e, ["encryptionSpec"]);
  A != null && a(n, ["encryptionSpec"], A);
  const R = r(e, ["partnerModelTuningSpec"]);
  R != null && a(n, ["partnerModelTuningSpec"], R);
  const $ = r(e, ["customBaseModel"]);
  $ != null && a(n, ["customBaseModel"], $);
  const T = r(e, ["evaluateDatasetRuns"]);
  if (T != null) {
    let nt = T;
    Array.isArray(nt) && (nt = nt.map((Re) => Re)), a(n, ["evaluateDatasetRuns"], nt);
  }
  const U = r(e, ["experiment"]);
  U != null && a(n, ["experiment"], U);
  const C = r(e, ["fullFineTuningSpec"]);
  C != null && a(n, ["fullFineTuningSpec"], C);
  const k = r(e, ["labels"]);
  k != null && a(n, ["labels"], k);
  const V = r(e, ["outputUri"]);
  V != null && a(n, ["outputUri"], V);
  const J = r(e, ["pipelineJob"]);
  J != null && a(n, ["pipelineJob"], J);
  const de = r(e, ["serviceAccount"]);
  de != null && a(n, ["serviceAccount"], de);
  const ae = r(e, ["tunedModelDisplayName"]);
  ae != null && a(n, ["tunedModelDisplayName"], ae);
  const Y = r(e, ["tuningJobState"]);
  Y != null && a(n, ["tuningJobState"], Y);
  const W = r(e, ["veoTuningSpec"]);
  W != null && a(n, ["veoTuningSpec"], W);
  const Ge = r(e, ["distillationSamplingSpec"]);
  Ge != null && a(n, ["distillationSamplingSpec"], Ge);
  const Gt = r(e, ["tuningJobMetadata"]);
  return Gt != null && a(n, ["tuningJobMetadata"], Gt), n;
}
function hS(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && a(n, ["sdkHttpResponse"], o);
  const i = r(e, ["name"]);
  i != null && a(n, ["name"], i);
  const s = r(e, ["metadata"]);
  s != null && a(n, ["metadata"], s);
  const l = r(e, ["done"]);
  l != null && a(n, ["done"], l);
  const u = r(e, ["error"]);
  return u != null && a(n, ["error"], u), n;
}
function Si(e, t) {
  const n = {}, o = r(e, ["gcsUri"]);
  o != null && a(n, ["validationDatasetUri"], o);
  const i = r(e, ["vertexDatasetResource"]);
  return i != null && a(n, ["validationDatasetUri"], i), n;
}
var pS = class extends We {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new pt(Je.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
      var n;
      if (this.apiClient.isVertexAI()) if (t.baseModel.startsWith("projects/")) {
        const o = { tunedModelName: t.baseModel };
        !((n = t.config) === null || n === void 0) && n.preTunedModelCheckpointId && (o.checkpointId = t.config.preTunedModelCheckpointId);
        const i = Object.assign(Object.assign({}, t), { preTunedModel: o });
        return i.baseModel = void 0, await this.tuneInternal(i);
      } else {
        const o = Object.assign({}, t);
        return await this.tuneInternal(o);
      }
      else {
        const o = Object.assign({}, t), i = await this.tuneMldevInternal(o);
        let s = "";
        return i.metadata !== void 0 && i.metadata.tunedModel !== void 0 ? s = i.metadata.tunedModel : i.name !== void 0 && i.name.includes("/operations/") && (s = i.name.split("/operations/")[0]), {
          name: s,
          state: Zi.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, n, o, i;
    let s, l = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = oS(e);
      return l = b("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => fs(d));
    } else {
      const c = nS(e);
      return l = b("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => Af(d));
    }
  }
  async listInternal(e) {
    var t, n, o, i;
    let s, l = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = aS(e);
      return l = b("tuningJobs", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = uS(d), f = new ml();
        return Object.assign(f, h), f;
      });
    } else {
      const c = rS(e);
      return l = b("tunedModels", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = lS(d), f = new ml();
        return Object.assign(f, h), f;
      });
    }
  }
  async cancel(e) {
    var t, n, o, i;
    let s, l = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = zT(e);
      return l = b("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = QT(d), f = new gl();
        return Object.assign(f, h), f;
      });
    } else {
      const c = YT(e);
      return l = b("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: l,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = XT(d), f = new gl();
        return Object.assign(f, h), f;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let o, i = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const l = tS(e, e);
      return i = b("tuningJobs", l._url), s = l._query, delete l._url, delete l._query, o = this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(l),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => fs(u));
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async tuneMldevInternal(e) {
    var t, n;
    let o, i = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const l = eS(e);
      return i = b("tunedModels", l._url), s = l._query, delete l._url, delete l._query, o = this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(l),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => hS(u));
    }
  }
}, mS = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, gS = 1024 * 1024 * 8, _S = 3, yS = 1e3, vS = 2, Uo = "x-goog-upload-status";
async function ES(e, t, n, o) {
  var i;
  const s = await Rf(e, t, n, o), l = await s?.json();
  if (((i = s?.headers) === null || i === void 0 ? void 0 : i[Uo]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return l.file;
}
async function TS(e, t, n, o) {
  var i;
  const s = await Rf(e, t, n, o), l = await s?.json();
  if (((i = s?.headers) === null || i === void 0 ? void 0 : i[Uo]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = Cd(l), c = new Lm();
  return Object.assign(c, u), c;
}
async function Rf(e, t, n, o) {
  var i, s, l;
  let u = t;
  const c = o?.baseUrl || ((i = n.clientOptions.httpOptions) === null || i === void 0 ? void 0 : i.baseUrl);
  if (c) {
    const m = new URL(c), g = new URL(t);
    g.protocol = m.protocol, g.host = m.host, g.port = m.port, u = g.toString();
  }
  let d = 0, h = 0, f = new es(new Response()), p = "upload";
  for (d = e.size; h < d; ) {
    const m = Math.min(gS, d - h), g = e.slice(h, h + m);
    h + m >= d && (p += ", finalize");
    let _ = 0, y = yS;
    for (; _ < _S; ) {
      const I = Object.assign(Object.assign({}, o?.headers || {}), {
        "X-Goog-Upload-Command": p,
        "X-Goog-Upload-Offset": String(h),
        "Content-Length": String(m)
      });
      if (f = await n.request({
        path: "",
        body: g,
        httpMethod: "POST",
        httpOptions: Object.assign(Object.assign({}, o), {
          apiVersion: "",
          baseUrl: u,
          headers: I
        })
      }), !((s = f?.headers) === null || s === void 0) && s[Uo]) break;
      _++, await wS(y), y = y * vS;
    }
    if (h += m, ((l = f?.headers) === null || l === void 0 ? void 0 : l[Uo]) !== "active") break;
    if (d <= h) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return f;
}
async function SS(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function wS(e) {
  return new Promise((t) => setTimeout(t, e));
}
var IS = class {
  async upload(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await ES(e, t, n, o);
  }
  async uploadToFileSearchStore(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await TS(e, t, n, o);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await SS(e);
  }
}, CS = class {
  create(e, t, n) {
    return new AS(e, t, n);
  }
}, AS = class {
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
}, Jl = "x-goog-api-key", RS = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(Jl) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(Jl, this.apiKey);
    }
  }
}, bS = "gl-node/", PS = class {
  getNextGenClient() {
    var e;
    const t = this.httpOptions;
    if (this._nextGenClient === void 0) {
      const n = this.httpOptions;
      this._nextGenClient = new ee({
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
    const n = im(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const o = new RS(this.apiKey);
    this.apiClient = new wE({
      auth: o,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: bS + "web",
      uploader: new IS(),
      downloader: new mS()
    }), this.models = new HE(this.apiClient), this.live = new $E(this.apiClient, o, new CS()), this.batches = new Fg(this.apiClient), this.chats = new S_(this.models, this.apiClient), this.caches = new v_(this.apiClient), this.files = new D_(this.apiClient), this.operations = new OE(this.apiClient), this.authTokens = new lT(this.apiClient), this.tunings = new pS(this.apiClient), this.fileSearchStores = new gT(this.apiClient);
  }
};
function Wl(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function xS(e) {
  const t = /* @__PURE__ */ new Map(), n = [];
  e.forEach((i) => {
    (i.tool_calls || []).forEach((s) => {
      s.id && s.function?.name && t.set(s.id, s.function.name);
    });
  });
  for (const i of e)
    if (i.role !== "system") {
      if (i.role === "tool") {
        n.push({
          role: "user",
          parts: [{ functionResponse: {
            name: t.get(i.tool_call_id || "") || "tool_result",
            response: Wl(i.content)
          } }]
        });
        continue;
      }
      if (i.role === "assistant" && Array.isArray(i.tool_calls) && i.tool_calls.length) {
        n.push({
          role: "model",
          parts: [...i.content ? [{ text: i.content }] : [], ...i.tool_calls.map((s) => ({ functionCall: {
            name: s.function.name,
            args: Wl(s.function.arguments)
          } }))]
        });
        continue;
      }
      n.push({
        role: i.role === "assistant" ? "model" : "user",
        parts: [{ text: i.content || "" }]
      });
    }
  if (!n.length) return {
    history: [],
    latestMessage: [{ text: "" }]
  };
  const o = n[n.length - 1];
  return o.role === "user" ? {
    history: n.slice(0, -1),
    latestMessage: o.parts
  } : {
    history: n,
    latestMessage: [{ text: "" }]
  };
}
var MS = class {
  constructor(e) {
    this.config = e, this.client = new PS({
      apiKey: e.apiKey,
      httpOptions: {
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 18e4
      }
    });
  }
  async chat(e) {
    const t = xS(e.messages), n = await this.client.chats.create({
      model: this.config.model,
      history: t.history,
      config: {
        systemInstruction: e.systemPrompt,
        temperature: e.temperature,
        maxOutputTokens: e.maxTokens,
        tools: [{ functionDeclarations: (e.tools || []).map((i) => ({
          name: i.function.name,
          description: i.function.description,
          parameters: i.function.parameters
        })) }],
        toolConfig: { functionCallingConfig: { mode: Qi.AUTO } }
      }
    }).sendMessage({
      message: t.latestMessage,
      config: { abortSignal: e.signal }
    }), o = (n.functionCalls || []).map((i, s) => ({
      id: i.id || `google-tool-${s + 1}`,
      name: i.name || "",
      arguments: JSON.stringify(i.args || {})
    })).filter((i) => i.name);
    return {
      text: typeof n.text == "string" ? n.text : (n.candidates?.[0]?.content?.parts || []).map((i) => i.text || "").filter(Boolean).join(`
`),
      toolCalls: o,
      finishReason: n.candidates?.[0]?.finishReason || "STOP",
      model: n.modelVersion || this.config.model,
      provider: "google"
    };
  }
}, NS = "xb-assistant-app", kS = "xb-assistant-root", bf = 18e4, At = 10, hs = "littlewhitebox.assistant.session.v1", DS = 60, Kl = 16e3, LS = 2600, US = 1800, $S = 4200, FS = [
  "为什么某个设置勾上后刷新又没了？",
  "向量生成时报 429 是哪一层限流？",
  "这个功能的代码入口在哪个文件？",
  "帮我查一下某个报错是从哪条链路抛出来的。"
], Pf = [
  "你是“小白助手”，是 LittleWhiteBox 内置的技术支持助手。",
  "你的主要任务是帮助用户理解 LittleWhiteBox 与 SillyTavern 前端公开代码、设置项、模块行为和常见报错。",
  "当问题涉及具体实现、文件路径、设置逻辑或错误原因时，优先使用工具查证后再回答。",
  "默认只读代码与资料；如果需要写入，只能写工作记录，不允许改代码。",
  "回答尽量具体、可核对、说人话，必要时引用文件路径。"
].join(`
`), GS = [
  {
    type: "function",
    function: {
      name: "list_files",
      description: "按文件名、路径名或来源列出候选文件。",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "用于过滤文件路径的关键词。"
          },
          limit: {
            type: "number",
            description: "最多返回多少个文件。"
          }
        },
        additionalProperties: !1
      }
    }
  },
  {
    type: "function",
    function: {
      name: "read_file",
      description: "读取某个已索引公开文本文件的完整内容。",
      parameters: {
        type: "object",
        properties: { path: {
          type: "string",
          description: "文件公开路径，例如 scripts/extensions/third-party/LittleWhiteBox/index.js。"
        } },
        required: ["path"],
        additionalProperties: !1
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_files",
      description: "在可读源码文件中搜索关键词。",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "要搜索的关键词。"
          },
          limit: {
            type: "number",
            description: "最多返回多少条命中。"
          }
        },
        required: ["query"],
        additionalProperties: !1
      }
    }
  },
  {
    type: "function",
    function: {
      name: "write_workspace_note",
      description: "将排查结果或工作记录写入助手工作区文档。",
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
        required: ["name", "content"],
        additionalProperties: !1
      }
    }
  }
], N = {
  config: null,
  runtime: null,
  messages: [],
  isBusy: !1,
  currentRound: 0,
  progressLabel: "",
  activeRun: null,
  autoScroll: !0,
  toast: ""
}, ht = /* @__PURE__ */ new Map(), lo = null;
function Nt(e, t = {}) {
  parent.postMessage({
    source: NS,
    type: e,
    payload: t
  }, window.location.origin);
}
function Zs(e) {
  return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function js(e, t = {}) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return t;
  }
}
function Yl(e) {
  const t = String(e || "");
  return t.length <= Kl ? t : `${t.slice(0, Kl)}

[内容过长，已截断保存]`;
}
function BS(e) {
  return {
    role: e.role,
    content: Yl(e.content),
    toolCallId: e.toolCallId || "",
    toolName: e.toolName || "",
    toolCalls: Array.isArray(e.toolCalls) ? e.toolCalls.map((t) => ({
      id: t.id || "",
      name: t.name || "",
      arguments: Yl(t.arguments || "{}")
    })) : []
  };
}
function qS(e) {
  return !e || typeof e != "object" || ![
    "user",
    "assistant",
    "tool"
  ].includes(e.role) ? null : {
    role: e.role,
    content: String(e.content || ""),
    toolCallId: e.toolCallId ? String(e.toolCallId) : void 0,
    toolName: e.toolName ? String(e.toolName) : void 0,
    toolCalls: Array.isArray(e.toolCalls) ? e.toolCalls.filter((t) => t && typeof t == "object" && t.name).map((t) => ({
      id: String(t.id || Zs("tool")),
      name: String(t.name || ""),
      arguments: String(t.arguments || "{}")
    })) : void 0
  };
}
function xf() {
  try {
    if (!N.messages.length) {
      localStorage.removeItem(hs);
      return;
    }
    localStorage.setItem(hs, JSON.stringify({ messages: N.messages.slice(-DS).map(BS) }));
  } catch {
  }
}
function VS() {
  try {
    const e = js(localStorage.getItem(hs), {});
    N.messages = Array.isArray(e.messages) ? e.messages.map(qS).filter(Boolean) : [];
  } catch {
    N.messages = [];
  }
}
function Mf(e) {
  if (N.toast = String(e || "").trim(), lo && clearTimeout(lo), !N.toast) {
    se();
    return;
  }
  const t = Math.max(US, Math.min($S, LS + N.toast.length * 18));
  lo = setTimeout(() => {
    lo = null, N.toast = "", se();
  }, t), se();
}
function Nf(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return e?.name === "AbortError" || t === "assistant_aborted" || t === "tool_aborted" || t.includes("aborted");
}
function HS(e) {
  const t = String(e?.message || e || "unknown_error"), n = t.toLowerCase();
  return Nf(e) ? "本轮请求已终止。" : n === "tool_timeout" ? "工具调用超时了（180 秒），可以重试，或把问题收窄一点。" : n.startsWith("workspace_write_failed:") ? "工作区写入失败，请检查酒馆文件权限或稍后重试。" : n.startsWith("manifest_load_failed:") ? "助手索引文件清单加载失败，请刷新页面后再试。" : n.startsWith("file_read_failed:") ? "读取源码文件失败了，请换个文件再试，或刷新页面重试。" : n === "file_not_indexed" ? "这个文件不在当前助手索引范围里。" : n === "empty_query" ? "搜索词是空的，换一个明确点的关键词就行。" : n.includes("401") || n.includes("authentication") ? "认证失败了，请检查当前 Provider 的 API Key。" : n.includes("403") || n.includes("permission") ? "请求被拒绝了，请检查 API Key 权限、模型权限或站点限制。" : n.includes("429") || n.includes("rate limit") ? "请求太频繁了，接口触发了限流，请稍后再试。" : n.includes("timeout") || n.includes("timed out") ? "请求超时了，请稍后再试。" : n.includes("failed to fetch") || n.includes("network") ? "网络请求失败了，请检查 Base URL、代理或跨域设置。" : `请求失败：${t}`;
}
function OS(e, t = {}) {
  switch (e) {
    case "list_files":
      return `列出文件${t.query ? `（${t.query}）` : ""}`;
    case "read_file":
      return `读取文件 ${t.path || ""}`.trim();
    case "search_files":
      return `搜索关键词 ${t.query || ""}`.trim();
    case "write_workspace_note":
      return `写入工作记录 ${t.name || ""}`.trim();
    default:
      return `调用工具 ${e}`;
  }
}
function JS(e) {
  const t = js(e.content, null);
  if (!t || typeof t != "object") return {
    summary: e.content || "",
    details: ""
  };
  if (e.toolName === "list_files") {
    const n = Array.isArray(t.items) ? t.items : [], o = [`找到 ${t.total || 0} 个候选文件，当前展示 ${n.length} 个。`];
    return t.truncated && o.push("结果已截断，可以把关键词再收窄一点。"), n.length && (o.push(""), n.forEach((i) => {
      o.push(`- ${i.publicPath}${i.source ? ` [${i.source}]` : ""}`);
    })), {
      summary: o.join(`
`),
      details: ""
    };
  }
  if (e.toolName === "search_files") {
    const n = Array.isArray(t.items) ? t.items : [], o = [`关键词“${t.query || ""}”命中 ${t.total || 0} 个文件。`];
    return t.truncated && o.push(`已达到返回上限；本次扫描 ${t.scannedFiles || 0}/${t.indexedFiles || 0} 个文件。`), n.length && (o.push(""), n.forEach((i) => {
      o.push(`- ${i.path}`);
    })), {
      summary: o.join(`
`),
      details: ""
    };
  }
  return e.toolName === "read_file" ? {
    summary: [
      `已读取文件：${t.path || ""}`,
      t.source ? `来源：${t.source}` : "",
      "文件内容已提供给助手分析，本轮不直接展开原文。"
    ].filter(Boolean).join(`
`),
    details: ""
  } : e.toolName === "write_workspace_note" ? {
    summary: `工作记录已写入 ${t.name || ""}`.trim(),
    details: ""
  } : {
    summary: JSON.stringify(t, null, 2),
    details: ""
  };
}
function ft(e) {
  N.messages.push(e), xf();
}
function WS(e, t) {
  for (const [n, o] of ht.entries())
    o.runId === e && (ht.delete(n), o.cleanup?.(), o.reject(t));
}
function zl(e = "本轮请求已终止。") {
  const t = N.activeRun;
  t && (t.cancelNotice = e, N.progressLabel = "正在终止…", WS(t.id, /* @__PURE__ */ new Error("tool_aborted")), t.controller.abort(), se());
}
function kf() {
  const e = N.config || {}, t = e.provider || "openai-compatible", n = (e.modelConfigs || {})[t] || {};
  return {
    provider: t,
    baseUrl: n.baseUrl || "",
    model: n.model || "",
    apiKey: n.apiKey || "",
    temperature: Number(n.temperature ?? 0.2),
    maxTokens: Number(n.maxTokens ?? 1600),
    timeoutMs: bf
  };
}
function KS() {
  const e = kf();
  if (!e.apiKey) throw new Error("请先在小白助手里填写当前提供商的 API Key。");
  switch (e.provider) {
    case "anthropic":
      return new Xp(e);
    case "google":
      return new MS(e);
    default:
      return new tp(e);
  }
}
function YS() {
  const e = [{
    role: "system",
    content: Pf
  }];
  for (const t of N.messages) {
    if (t.role === "assistant" && Array.isArray(t.toolCalls) && t.toolCalls.length) {
      e.push({
        role: "assistant",
        content: t.content || "",
        tool_calls: t.toolCalls.map((n) => ({
          id: n.id,
          type: "function",
          function: {
            name: n.name,
            arguments: n.arguments
          }
        }))
      });
      continue;
    }
    if (t.role === "tool") {
      e.push({
        role: "tool",
        tool_call_id: t.toolCallId,
        content: t.content
      });
      continue;
    }
    e.push({
      role: t.role,
      content: t.content
    });
  }
  return e;
}
function zS(e, t, n = {}) {
  const o = Zs("tool"), i = N.activeRun;
  return i && i.id === n.runId && i.toolRequestIds.add(o), new Promise((s, l) => {
    let u = !1, c = null;
    const d = () => {
      c && (clearTimeout(c), c = null), n.signal && p && n.signal.removeEventListener("abort", p);
      const m = N.activeRun;
      m && m.id === n.runId && m.toolRequestIds.delete(o);
    }, h = (m) => {
      u || (u = !0, ht.delete(o), d(), l(m));
    }, f = (m) => {
      u || (u = !0, ht.delete(o), d(), s(m));
    }, p = () => {
      Nt("xb-assistant:tool-abort", { requestId: o }), h(/* @__PURE__ */ new Error("tool_aborted"));
    };
    if (c = setTimeout(() => {
      Nt("xb-assistant:tool-abort", { requestId: o }), h(/* @__PURE__ */ new Error("tool_timeout"));
    }, bf), ht.set(o, {
      runId: n.runId,
      cleanup: d,
      resolve: f,
      reject: h
    }), n.signal) {
      if (n.signal.aborted) {
        p();
        return;
      }
      n.signal.addEventListener("abort", p, { once: !0 });
    }
    Nt("xb-assistant:tool-call", {
      requestId: o,
      name: e,
      arguments: t
    });
  });
}
async function XS(e) {
  const t = KS();
  let n = 0;
  for (; n < At; ) {
    if (e.controller.signal.aborted) throw new Error("assistant_aborted");
    n += 1, N.currentRound = n, N.progressLabel = `第 ${n}/${At} 轮：正在请求模型…`, se();
    const o = kf(), i = await t.chat({
      systemPrompt: Pf,
      messages: YS(),
      tools: GS,
      toolChoice: "auto",
      temperature: o.temperature,
      maxTokens: o.maxTokens,
      signal: e.controller.signal
    });
    if (Array.isArray(i.toolCalls) && i.toolCalls.length) {
      ft({
        role: "assistant",
        content: i.text || "",
        toolCalls: i.toolCalls
      }), se();
      for (const s of i.toolCalls) {
        if (e.controller.signal.aborted) throw new Error("assistant_aborted");
        const l = js(s.arguments, {});
        N.progressLabel = `第 ${n}/${At} 轮：正在${OS(s.name, l)}…`, se();
        const u = await zS(s.name, l, {
          runId: e.id,
          signal: e.controller.signal
        });
        ft({
          role: "tool",
          toolCallId: s.id,
          toolName: s.name,
          content: JSON.stringify(u, null, 2)
        }), se();
      }
      continue;
    }
    ft({
      role: "assistant",
      content: i.text || "没有拿到有效回复。"
    }), N.progressLabel = "", se();
    return;
  }
  ft({
    role: "assistant",
    content: `这轮工具调用已经到上限了（${At}/${At}）。你可以把问题再收窄一点，比如直接给我模块名、设置项名或报错文本。`
  }), N.progressLabel = "", se();
}
function Xl(e) {
  N.config = e, se();
}
function QS(e, t) {
  return {
    baseUrl: e.querySelector("#xb-assistant-base-url").value.trim(),
    model: e.querySelector("#xb-assistant-model").value.trim(),
    apiKey: e.querySelector("#xb-assistant-api-key").value.trim(),
    temperature: Number(((N.config?.modelConfigs || {})[t] || {}).temperature ?? 0.2),
    maxTokens: Number(((N.config?.modelConfigs || {})[t] || {}).maxTokens ?? 1600)
  };
}
function ps(e) {
  if (!N.config) return;
  const t = e.querySelector("#xb-assistant-provider").value;
  N.config = {
    ...N.config,
    provider: t,
    workspaceFileName: e.querySelector("#xb-assistant-workspace").value.trim(),
    modelConfigs: {
      ...N.config.modelConfigs || {},
      [t]: {
        ...(N.config.modelConfigs || {})[t] || {},
        ...QS(e, t)
      }
    }
  };
}
function ZS(e) {
  if (e.innerHTML = "", !N.messages.length) {
    const t = document.createElement("div");
    t.className = "xb-assistant-empty", t.innerHTML = "<h2>开始提问吧</h2><p>你可以直接问我：某个设置为什么不生效、某个报错代表什么、某个功能从哪条代码链路走。</p><p>我会优先自己查 LittleWhiteBox 和 SillyTavern 的前端代码，再给你结论。</p><p>下面的示例问题点击后会填入输入框，不会自动发送。</p>";
    const n = document.createElement("div");
    n.className = "xb-assistant-examples", FS.forEach((o) => {
      const i = document.createElement("button");
      i.type = "button", i.className = "xb-assistant-example-chip", i.dataset.prompt = o, i.textContent = o, n.appendChild(i);
    }), t.appendChild(n), e.appendChild(t);
    return;
  }
  for (const t of N.messages) {
    const n = document.createElement("div");
    n.className = `xb-assistant-bubble role-${t.role}`;
    const o = document.createElement("div");
    if (o.className = "xb-assistant-meta", o.textContent = t.role === "user" ? "你" : t.role === "assistant" ? Array.isArray(t.toolCalls) && t.toolCalls.length ? `小白助手 · 已发起 ${t.toolCalls.length} 个工具调用` : "小白助手" : `工具结果${t.toolName ? ` · ${t.toolName}` : ""}`, t.role === "tool") {
      const i = JS(t), s = document.createElement("pre");
      if (s.className = "xb-assistant-content", s.textContent = i.summary || "工具已返回结果。", n.append(o, s), i.details) {
        const l = document.createElement("details");
        l.className = "xb-assistant-tool-details";
        const u = document.createElement("summary");
        u.textContent = t.toolName === "read_file" ? "查看文件内容" : "查看详细结果";
        const c = document.createElement("pre");
        c.className = "xb-assistant-content tool-detail", c.textContent = i.details, l.append(u, c), n.appendChild(l);
      }
    } else {
      const i = document.createElement("pre");
      i.className = "xb-assistant-content", i.textContent = t.content || (t.role === "assistant" ? "我先查一下相关代码。" : ""), n.append(o, i);
    }
    e.appendChild(n);
  }
  N.autoScroll && (e.scrollTop = e.scrollHeight);
}
function jS(e) {
  e.innerHTML = `
        <div class="xb-assistant-shell">
            <aside class="xb-assistant-sidebar">
                <div class="xb-assistant-brand">
                    <div class="xb-assistant-badge">小白助手</div>
                    <h1>技术支持 Agent</h1>
                    <p>查代码、看设置、做排查记录。</p>
                </div>
                <section class="xb-assistant-config">
                    <label>
                        <span>Provider</span>
                        <select id="xb-assistant-provider">
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
                        <span>Model</span>
                        <input id="xb-assistant-model" type="text" />
                    </label>
                    <label>
                        <span>API Key</span>
                        <div class="xb-assistant-inline-input">
                            <input id="xb-assistant-api-key" type="password" />
                            <button id="xb-assistant-toggle-key" type="button" class="secondary ghost">显示</button>
                        </div>
                    </label>
                    <label>
                        <span>Workspace 文件</span>
                        <input id="xb-assistant-workspace" type="text" />
                    </label>
                    <div class="xb-assistant-actions">
                        <button id="xb-assistant-save" type="button">保存配置</button>
                        <button id="xb-assistant-close" type="button" class="secondary">关闭</button>
                    </div>
                    <div class="xb-assistant-runtime" id="xb-assistant-runtime"></div>
                </section>
            </aside>
            <main class="xb-assistant-main">
                <section class="xb-assistant-toolbar">
                    <div class="xb-assistant-status" id="xb-assistant-status"></div>
                    <button id="xb-assistant-clear" type="button" class="secondary">清空对话</button>
                </section>
                <section class="xb-assistant-chat" id="xb-assistant-chat"></section>
                <form class="xb-assistant-compose" id="xb-assistant-form">
                    <textarea id="xb-assistant-input" placeholder="问我：某个设置为什么不生效、某个报错代表什么、某个功能从哪条代码链路走……"></textarea>
                    <button id="xb-assistant-send" type="submit">发送</button>
                </form>
                <div class="xb-assistant-toast" id="xb-assistant-toast" aria-live="polite"></div>
            </main>
        </div>
    `;
}
function ew(e) {
  if (!N.config) return;
  const t = N.config.provider || "openai-compatible", n = (N.config.modelConfigs || {})[t] || {};
  e.querySelector("#xb-assistant-provider").value = t, e.querySelector("#xb-assistant-base-url").value = n.baseUrl || "", e.querySelector("#xb-assistant-model").value = n.model || "", e.querySelector("#xb-assistant-api-key").value = n.apiKey || "", e.querySelector("#xb-assistant-workspace").value = N.config.workspaceFileName || "";
  const o = e.querySelector("#xb-assistant-runtime");
  o.textContent = N.runtime ? `已索引 ${N.runtime.indexedFileCount || 0} 个前端源码文件` : "";
}
function tw(e) {
  ps(e), Nt("xb-assistant:save-config", {
    provider: N.config?.provider || "openai-compatible",
    workspaceFileName: e.querySelector("#xb-assistant-workspace").value.trim(),
    modelConfigs: N.config?.modelConfigs || {}
  });
}
function nw() {
  const e = document.createElement("style");
  e.textContent = `
        :root { color-scheme: light; font-family: "Noto Sans SC", "Microsoft YaHei", sans-serif; }
        body {
            margin: 0;
            background:
                radial-gradient(circle at top left, rgba(255, 223, 178, 0.72), transparent 34%),
                radial-gradient(circle at top right, rgba(154, 210, 255, 0.58), transparent 28%),
                linear-gradient(180deg, #f6f8fb 0%, #eef3f8 100%);
            color: #142033;
        }
        .xb-assistant-shell { display: grid; grid-template-columns: 340px minmax(0, 1fr); height: 100vh; }
        .xb-assistant-sidebar {
            padding: 24px 20px;
            background: rgba(255, 255, 255, 0.76);
            border-right: 1px solid rgba(20, 32, 51, 0.08);
            backdrop-filter: blur(14px);
            overflow: auto;
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
        .xb-assistant-actions,
        .xb-assistant-toolbar {
            display: flex;
            gap: 10px;
            align-items: center;
            justify-content: space-between;
        }
        .xb-assistant-actions button,
        .xb-assistant-toolbar button,
        .xb-assistant-compose button {
            border: none;
            border-radius: 14px;
            padding: 12px 16px;
            background: #1b3758;
            color: #fff;
            cursor: pointer;
            font: inherit;
        }
        .xb-assistant-actions button.secondary,
        .xb-assistant-toolbar button.secondary {
            background: #dbe3ee;
            color: #1b3758;
        }
        .xb-assistant-actions button.ghost,
        .xb-assistant-toolbar button.ghost,
        .xb-assistant-inline-input button.ghost {
            padding-inline: 14px;
            background: rgba(219, 227, 238, 0.82);
            color: #1b3758;
        }
        .xb-assistant-runtime { font-size: 12px; color: #5a6a81; min-height: 18px; }
        .xb-assistant-main {
            display: grid;
            grid-template-rows: auto minmax(0, 1fr) auto auto;
            padding: 20px;
            gap: 16px;
            min-width: 0;
        }
        .xb-assistant-status {
            min-height: 20px;
            padding: 8px 12px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.78);
            color: #41526a;
            font-size: 13px;
            box-shadow: 0 10px 24px rgba(17, 31, 51, 0.06);
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
        .xb-assistant-chat { overflow: auto; padding: 4px; display: grid; gap: 12px; }
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
            max-width: min(860px, 100%);
            border-radius: 18px;
            padding: 14px 16px;
            box-shadow: 0 12px 30px rgba(17, 31, 51, 0.07);
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
        .xb-assistant-tool-details {
            margin-top: 10px;
            border-top: 1px dashed rgba(27, 55, 88, 0.12);
            padding-top: 10px;
        }
        .xb-assistant-tool-details summary {
            cursor: pointer;
            color: #36567b;
            font-size: 13px;
        }
        .xb-assistant-content.tool-detail {
            margin-top: 10px;
            max-height: 360px;
            overflow: auto;
            background: rgba(255, 255, 255, 0.72);
            border-radius: 12px;
            padding: 12px;
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
        }
        .xb-assistant-compose textarea { min-height: 92px; resize: vertical; }
        .xb-assistant-compose button.is-busy { background: #8d442b; }
        .xb-assistant-toast {
            min-height: 24px;
            color: #1b3758;
            font-size: 13px;
            opacity: 0;
            transform: translateY(4px);
            transition: opacity 0.18s ease, transform 0.18s ease;
        }
        .xb-assistant-toast.visible {
            opacity: 1;
            transform: translateY(0);
        }
        @keyframes xb-assistant-pulse {
            0% { box-shadow: 0 0 0 0 rgba(201, 107, 51, 0.35); }
            70% { box-shadow: 0 0 0 8px rgba(201, 107, 51, 0); }
            100% { box-shadow: 0 0 0 0 rgba(201, 107, 51, 0); }
        }
        @media (max-width: 900px) {
            .xb-assistant-shell { grid-template-columns: 1fr; grid-template-rows: auto minmax(0, 1fr); }
            .xb-assistant-sidebar { border-right: none; border-bottom: 1px solid rgba(20, 32, 51, 0.08); }
            .xb-assistant-main { padding: 14px; }
            .xb-assistant-compose { grid-template-columns: 1fr; }
            .xb-assistant-toolbar { flex-direction: column; align-items: stretch; }
        }
    `, document.head.appendChild(e);
}
function se() {
  const e = document.getElementById(kS);
  if (!e) return;
  e.firstChild || (jS(e), ow(e)), ew(e), ZS(e.querySelector("#xb-assistant-chat"));
  const t = e.querySelector("#xb-assistant-send");
  t.disabled = !1, t.classList.toggle("is-busy", N.isBusy), t.textContent = N.isBusy ? `终止 (${Math.max(1, N.currentRound)}/${At})` : "发送";
  const n = e.querySelector("#xb-assistant-clear");
  n.disabled = N.isBusy || !N.messages.length;
  const o = e.querySelector("#xb-assistant-status");
  o.textContent = N.progressLabel || "就绪", o.classList.toggle("busy", N.isBusy);
  const i = e.querySelector("#xb-assistant-toast");
  i.textContent = N.toast || "", i.classList.toggle("visible", !!N.toast);
  const s = e.querySelector("#xb-assistant-toggle-key");
  s.textContent = e.querySelector("#xb-assistant-api-key").type === "password" ? "显示" : "隐藏";
}
function ow(e) {
  const t = e.querySelector("#xb-assistant-input"), n = () => {
    t.style.height = "auto", t.style.height = `${Math.min(Math.max(t.scrollHeight, 92), 240)}px`;
  };
  e.querySelector("#xb-assistant-chat").addEventListener("scroll", (o) => {
    const i = o.currentTarget;
    N.autoScroll = i.scrollHeight - i.scrollTop - i.clientHeight <= 48;
  }), e.querySelector("#xb-assistant-chat").addEventListener("click", (o) => {
    const i = o.target.closest(".xb-assistant-example-chip");
    i && (t.value = i.dataset.prompt || "", n(), t.focus());
  }), e.querySelector("#xb-assistant-provider").addEventListener("change", () => {
    ps(e), N.config = {
      ...N.config || {},
      provider: e.querySelector("#xb-assistant-provider").value
    }, se();
  }), e.querySelector("#xb-assistant-toggle-key").addEventListener("click", () => {
    const o = e.querySelector("#xb-assistant-api-key");
    o.type = o.type === "password" ? "text" : "password", se();
  }), e.querySelector("#xb-assistant-save").addEventListener("click", () => {
    tw(e);
  }), e.querySelector("#xb-assistant-clear").addEventListener("click", () => {
    N.isBusy || (N.messages = [], xf(), Mf("对话已清空"), se());
  }), e.querySelector("#xb-assistant-close").addEventListener("click", () => {
    N.isBusy && zl(""), Nt("xb-assistant:close");
  }), e.querySelector("#xb-assistant-form").addEventListener("submit", async (o) => {
    if (o.preventDefault(), N.isBusy) {
      zl("本轮请求已终止。");
      return;
    }
    const i = t.value.trim();
    if (!i) return;
    ps(e), ft({
      role: "user",
      content: i
    }), t.value = "", n();
    const s = {
      id: Zs("run"),
      controller: new AbortController(),
      toolRequestIds: /* @__PURE__ */ new Set(),
      cancelNotice: ""
    };
    N.activeRun = s, N.isBusy = !0, N.currentRound = 0, N.progressLabel = "正在请求模型…", N.autoScroll = !0, se();
    try {
      await XS(s);
    } catch (l) {
      Nf(l) ? s.cancelNotice && ft({
        role: "assistant",
        content: s.cancelNotice
      }) : ft({
        role: "assistant",
        content: HS(l)
      });
    } finally {
      N.activeRun?.id === s.id && (N.activeRun = null), N.isBusy = !1, N.currentRound = 0, N.progressLabel = "", se();
    }
  }), t.addEventListener("input", n), n();
}
window.addEventListener("message", (e) => {
  if (e.origin !== window.location.origin || e.source !== parent) return;
  const t = e.data || {};
  if (t.type === "xb-assistant:config") {
    N.runtime = t.payload?.runtime || null, Xl(t.payload?.config || {});
    return;
  }
  if (t.type === "xb-assistant:config-saved") {
    Xl(t.payload?.config || {}), Mf("配置已保存");
    return;
  }
  if (t.type === "xb-assistant:tool-result") {
    const n = ht.get(t.payload?.requestId || "");
    if (!n) return;
    n.resolve(t.payload.result);
    return;
  }
  if (t.type === "xb-assistant:tool-error") {
    const n = ht.get(t.payload?.requestId || "");
    if (!n) return;
    n.reject(new Error(t.payload.error || "tool_failed"));
  }
});
VS();
nw();
se();
Nt("xb-assistant:ready");
