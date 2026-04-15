var qf = Object.create, iu = Object.defineProperty, Of = Object.getOwnPropertyDescriptor, Vf = Object.getOwnPropertyNames, Hf = Object.getPrototypeOf, Jf = Object.prototype.hasOwnProperty, Fo = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), Wf = (e, t, n, o) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var s = Vf(t), i = 0, a = s.length, u; i < a; i++)
      u = s[i], !Jf.call(e, u) && u !== n && iu(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(o = Of(t, u)) || o.enumerable
      });
  return e;
}, Kf = (e, t, n) => (n = e != null ? qf(Hf(e)) : {}, Wf(t || !e || !e.__esModule ? iu(n, "default", {
  value: e,
  enumerable: !0
}) : n, e));
function F(e, t, n, o, s) {
  if (o === "m") throw new TypeError("Private method is not writable");
  if (o === "a" && !s) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !s : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return o === "a" ? s.call(e, n) : s ? s.value = n : t.set(e, n), n;
}
function T(e, t, n, o) {
  if (n === "a" && !o) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !o : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? o : n === "a" ? o.call(e) : o ? o.value : t.get(e);
}
var ru = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return ru = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function As(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Rs = (e) => {
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
}, re = class bs extends L {
  constructor(t, n, o, s) {
    super(`${bs.makeMessage(t, n, o)}`), this.status = t, this.headers = s, this.requestID = s?.get("x-request-id"), this.error = n;
    const i = n;
    this.code = i?.code, this.param = i?.param, this.type = i?.type;
  }
  static makeMessage(t, n, o) {
    const s = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && s ? `${t} ${s}` : t ? `${t} status code (no body)` : s || "(no status code or body)";
  }
  static generate(t, n, o, s) {
    if (!t || !s) return new Go({
      message: o,
      cause: Rs(n)
    });
    const i = n?.error;
    return t === 400 ? new au(t, i, o, s) : t === 401 ? new lu(t, i, o, s) : t === 403 ? new uu(t, i, o, s) : t === 404 ? new cu(t, i, o, s) : t === 409 ? new du(t, i, o, s) : t === 422 ? new fu(t, i, o, s) : t === 429 ? new hu(t, i, o, s) : t >= 500 ? new pu(t, i, o, s) : new bs(t, i, o, s);
  }
}, Ie = class extends re {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Go = class extends re {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, _i = class extends Go {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, au = class extends re {
}, lu = class extends re {
}, uu = class extends re {
}, cu = class extends re {
}, du = class extends re {
}, fu = class extends re {
}, hu = class extends re {
}, pu = class extends re {
}, mu = class extends L {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, gu = class extends L {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, sn = class extends Error {
  constructor(e) {
    super(e);
  }
}, _u = class extends re {
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
}, Yf = class extends L {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, zf = /^[a-z][a-z0-9+.-]*:/i, Xf = (e) => zf.test(e), he = (e) => (he = Array.isArray, he(e)), or = he;
function yu(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function sr(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Qf(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function os(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var Zf = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new L(`${e} must be an integer`);
  if (t < 0) throw new L(`${e} must be a positive integer`);
  return t;
}, jf = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, bn = (e) => new Promise((t) => setTimeout(t, e)), Et = "6.34.0", eh = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function th() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var nh = () => {
  const e = th();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Et,
    "X-Stainless-OS": rr(Deno.build.os),
    "X-Stainless-Arch": ir(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Et,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Et,
    "X-Stainless-OS": rr(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": ir(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = oh();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Et,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Et,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function oh() {
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
var ir = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", rr = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), ar, sh = () => ar ?? (ar = nh());
function vu() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Tu(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Eu(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Tu({
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
function Su(e) {
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
async function lr(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var ih = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), wu = "RFC3986", Iu = (e) => String(e), ur = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: Iu
};
var Ps = (e, t) => (Ps = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), Ps(e, t)), De = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), ss = 1024, rh = (e, t, n, o, s) => {
  if (e.length === 0) return e;
  let i = e;
  if (typeof e == "symbol" ? i = Symbol.prototype.toString.call(e) : typeof e != "string" && (i = String(e)), n === "iso-8859-1") return escape(i).replace(/%u[0-9a-f]{4}/gi, function(u) {
    return "%26%23" + parseInt(u.slice(2), 16) + "%3B";
  });
  let a = "";
  for (let u = 0; u < i.length; u += ss) {
    const c = i.length >= ss ? i.slice(u, u + ss) : i, d = [];
    for (let h = 0; h < c.length; ++h) {
      let f = c.charCodeAt(h);
      if (f === 45 || f === 46 || f === 95 || f === 126 || f >= 48 && f <= 57 || f >= 65 && f <= 90 || f >= 97 && f <= 122 || s === "RFC1738" && (f === 40 || f === 41)) {
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
    a += d.join("");
  }
  return a;
};
function ah(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function cr(e, t) {
  if (he(e)) {
    const n = [];
    for (let o = 0; o < e.length; o += 1) n.push(t(e[o]));
    return n;
  }
  return t(e);
}
var Cu = {
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
}, Au = function(e, t) {
  Array.prototype.push.apply(e, he(t) ? t : [t]);
}, dr, Z = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: rh,
  encodeValuesOnly: !1,
  format: wu,
  formatter: Iu,
  indices: !1,
  serializeDate(e) {
    return (dr ?? (dr = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function lh(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var is = {};
function Ru(e, t, n, o, s, i, a, u, c, d, h, f, p, m, g, _, y, I) {
  let S = e, A = I, R = 0, $ = !1;
  for (; (A = A.get(is)) !== void 0 && !$; ) {
    const O = A.get(e);
    if (R += 1, typeof O < "u") {
      if (O === R) throw new RangeError("Cyclic object value");
      $ = !0;
    }
    typeof A.get(is) > "u" && (R = 0);
  }
  if (typeof d == "function" ? S = d(t, S) : S instanceof Date ? S = p?.(S) : n === "comma" && he(S) && (S = cr(S, function(O) {
    return O instanceof Date ? p?.(O) : O;
  })), S === null) {
    if (i) return c && !_ ? c(t, Z.encoder, y, "key", m) : t;
    S = "";
  }
  if (lh(S) || ah(S)) {
    if (c) {
      const O = _ ? t : c(t, Z.encoder, y, "key", m);
      return [g?.(O) + "=" + g?.(c(S, Z.encoder, y, "value", m))];
    }
    return [g?.(t) + "=" + g?.(String(S))];
  }
  const E = [];
  if (typeof S > "u") return E;
  let U;
  if (n === "comma" && he(S))
    _ && c && (S = cr(S, c)), U = [{ value: S.length > 0 ? S.join(",") || null : void 0 }];
  else if (he(d)) U = d;
  else {
    const O = Object.keys(S);
    U = h ? O.sort(h) : O;
  }
  const C = u ? String(t).replace(/\./g, "%2E") : String(t), k = o && he(S) && S.length === 1 ? C + "[]" : C;
  if (s && he(S) && S.length === 0) return k + "[]";
  for (let O = 0; O < U.length; ++O) {
    const J = U[O], de = typeof J == "object" && typeof J.value < "u" ? J.value : S[J];
    if (a && de === null) continue;
    const ae = f && u ? J.replace(/\./g, "%2E") : J, Y = he(S) ? typeof n == "function" ? n(k, ae) : k : k + (f ? "." + ae : "[" + ae + "]");
    I.set(e, R);
    const W = /* @__PURE__ */ new WeakMap();
    W.set(is, I), Au(E, Ru(de, Y, n, o, s, i, a, u, n === "comma" && _ && he(S) ? null : c, d, h, f, p, m, g, _, y, W));
  }
  return E;
}
function uh(e = Z) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || Z.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = wu;
  if (typeof e.format < "u") {
    if (!Ps(ur, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const o = ur[n];
  let s = Z.filter;
  (typeof e.filter == "function" || he(e.filter)) && (s = e.filter);
  let i;
  if (e.arrayFormat && e.arrayFormat in Cu ? i = e.arrayFormat : "indices" in e ? i = e.indices ? "indices" : "repeat" : i = Z.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  const a = typeof e.allowDots > "u" ? e.encodeDotInKeys ? !0 : Z.allowDots : !!e.allowDots;
  return {
    addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : Z.addQueryPrefix,
    allowDots: a,
    allowEmptyArrays: typeof e.allowEmptyArrays == "boolean" ? !!e.allowEmptyArrays : Z.allowEmptyArrays,
    arrayFormat: i,
    charset: t,
    charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : Z.charsetSentinel,
    commaRoundTrip: !!e.commaRoundTrip,
    delimiter: typeof e.delimiter > "u" ? Z.delimiter : e.delimiter,
    encode: typeof e.encode == "boolean" ? e.encode : Z.encode,
    encodeDotInKeys: typeof e.encodeDotInKeys == "boolean" ? e.encodeDotInKeys : Z.encodeDotInKeys,
    encoder: typeof e.encoder == "function" ? e.encoder : Z.encoder,
    encodeValuesOnly: typeof e.encodeValuesOnly == "boolean" ? e.encodeValuesOnly : Z.encodeValuesOnly,
    filter: s,
    format: n,
    formatter: o,
    serializeDate: typeof e.serializeDate == "function" ? e.serializeDate : Z.serializeDate,
    skipNulls: typeof e.skipNulls == "boolean" ? e.skipNulls : Z.skipNulls,
    sort: typeof e.sort == "function" ? e.sort : null,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : Z.strictNullHandling
  };
}
function ch(e, t = {}) {
  let n = e;
  const o = uh(t);
  let s, i;
  typeof o.filter == "function" ? (i = o.filter, n = i("", n)) : he(o.filter) && (i = o.filter, s = i);
  const a = [];
  if (typeof n != "object" || n === null) return "";
  const u = Cu[o.arrayFormat], c = u === "comma" && o.commaRoundTrip;
  s || (s = Object.keys(n)), o.sort && s.sort(o.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let p = 0; p < s.length; ++p) {
    const m = s[p];
    o.skipNulls && n[m] === null || Au(a, Ru(n[m], m, u, c, o.allowEmptyArrays, o.strictNullHandling, o.skipNulls, o.encodeDotInKeys, o.encode ? o.encoder : null, o.filter, o.sort, o.allowDots, o.serializeDate, o.format, o.formatter, o.encodeValuesOnly, o.charset, d));
  }
  const h = a.join(o.delimiter);
  let f = o.addQueryPrefix === !0 ? "?" : "";
  return o.charsetSentinel && (o.charset === "iso-8859-1" ? f += "utf8=%26%2310003%3B&" : f += "utf8=%E2%9C%93&"), h.length > 0 ? f + h : "";
}
function dh(e) {
  return ch(e, { arrayFormat: "brackets" });
}
function fh(e) {
  let t = 0;
  for (const s of e) t += s.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const s of e)
    n.set(s, o), o += s.length;
  return n;
}
var fr;
function yi(e) {
  let t;
  return (fr ?? (t = new globalThis.TextEncoder(), fr = t.encode.bind(t)))(e);
}
var hr;
function pr(e) {
  let t;
  return (hr ?? (t = new globalThis.TextDecoder(), hr = t.decode.bind(t)))(e);
}
var ge, _e, Bo = class {
  constructor() {
    ge.set(this, void 0), _e.set(this, void 0), F(this, ge, new Uint8Array(), "f"), F(this, _e, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? yi(e) : e;
    F(this, ge, fh([T(this, ge, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = hh(T(this, ge, "f"), T(this, _e, "f"))) != null; ) {
      if (o.carriage && T(this, _e, "f") == null) {
        F(this, _e, o.index, "f");
        continue;
      }
      if (T(this, _e, "f") != null && (o.index !== T(this, _e, "f") + 1 || o.carriage)) {
        n.push(pr(T(this, ge, "f").subarray(0, T(this, _e, "f") - 1))), F(this, ge, T(this, ge, "f").subarray(T(this, _e, "f")), "f"), F(this, _e, null, "f");
        continue;
      }
      const s = T(this, _e, "f") !== null ? o.preceding - 1 : o.preceding, i = pr(T(this, ge, "f").subarray(0, s));
      n.push(i), F(this, ge, T(this, ge, "f").subarray(o.index), "f"), F(this, _e, null, "f");
    }
    return n;
  }
  flush() {
    return T(this, ge, "f").length ? this.decode(`
`) : [];
  }
};
ge = /* @__PURE__ */ new WeakMap(), _e = /* @__PURE__ */ new WeakMap();
Bo.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Bo.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function hh(e, t) {
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
function ph(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var Co = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, mr = (e, t, n) => {
  if (e) {
    if (Qf(Co, e)) return e;
    se(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Co))}`);
  }
};
function rn() {
}
function Un(e, t, n) {
  return !t || Co[e] > Co[n] ? rn : t[e].bind(t);
}
var mh = {
  error: rn,
  warn: rn,
  info: rn,
  debug: rn
}, gr = /* @__PURE__ */ new WeakMap();
function se(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return mh;
  const o = gr.get(t);
  if (o && o[0] === n) return o[1];
  const s = {
    error: Un("error", t, n),
    warn: Un("warn", t, n),
    info: Un("info", t, n),
    debug: Un("debug", t, n)
  };
  return gr.set(t, [n, s]), s;
}
var rt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), Bt, In = class an {
  constructor(t, n, o) {
    this.iterator = t, Bt.set(this, void 0), this.controller = n, F(this, Bt, o, "f");
  }
  static fromSSEResponse(t, n, o, s) {
    let i = !1;
    const a = o ? se(o) : console;
    async function* u() {
      if (i) throw new L("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let c = !1;
      try {
        for await (const d of gh(t, n))
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
                throw a.error("Could not parse message into JSON:", d.data), a.error("From chunk:", d.raw), f;
              }
              if (h && h.error) throw new re(void 0, h.error, void 0, t.headers);
              yield s ? {
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
        if (As(d)) return;
        throw d;
      } finally {
        c || n.abort();
      }
    }
    return new an(u, n, o);
  }
  static fromReadableStream(t, n, o) {
    let s = !1;
    async function* i() {
      const u = new Bo(), c = Su(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
      for (const d of u.flush()) yield d;
    }
    async function* a() {
      if (s) throw new L("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      s = !0;
      let u = !1;
      try {
        for await (const c of i())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (As(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new an(a, n, o);
  }
  [(Bt = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new an(() => s(t), this.controller, T(this, Bt, "f")), new an(() => s(n), this.controller, T(this, Bt, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Tu({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: s, done: i } = await n.next();
          if (i) return o.close();
          const a = yi(JSON.stringify(s) + `
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
async function* gh(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new L("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new L("Attempted to iterate over a response with no body");
  const n = new yh(), o = new Bo(), s = Su(e.body);
  for await (const i of _h(s)) for (const a of o.decode(i)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const i of o.flush()) {
    const a = n.decode(i);
    a && (yield a);
  }
}
async function* _h(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? yi(n) : n;
    let s = new Uint8Array(t.length + o.length);
    s.set(t), s.set(o, t.length), t = s;
    let i;
    for (; (i = ph(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var yh = class {
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
    let [t, n, o] = vh(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function vh(e, t) {
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
async function bu(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: s, startTime: i } = t, a = await (async () => {
    if (t.options.stream)
      return se(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : In.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Pu(await n.json(), n) : await n.text();
  })();
  return se(e).debug(`[${o}] response parsed`, rt({
    retryOfRequestLogID: s,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
function Pu(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var ln, xu = class Mu extends Promise {
  constructor(t, n, o = bu) {
    super((s) => {
      s(null);
    }), this.responsePromise = n, this.parseResponse = o, ln.set(this, void 0), F(this, ln, t, "f");
  }
  _thenUnwrap(t) {
    return new Mu(T(this, ln, "f"), this.responsePromise, async (n, o) => Pu(t(await this.parseResponse(n, o), o), o.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(T(this, ln, "f"), t))), this.parsedPromise;
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
var $n, vi = class {
  constructor(e, t, n, o) {
    $n.set(this, void 0), F(this, $n, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new L("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await T(this, $n, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[($n = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, Th = class extends xu {
  constructor(e, t, n) {
    super(e, t, async (o, s) => new n(o, s.response, await bu(o, s), s.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, qo = class extends vi {
  constructor(e, t, n, o) {
    super(e, t, n, o), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, K = class extends vi {
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
        ...yu(this.options.query),
        after: t
      }
    } : null;
  }
}, Cn = class extends vi {
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
        ...yu(this.options.query),
        after: e
      }
    } : null;
  }
}, Eh = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, Sh = "urn:ietf:params:oauth:grant-type:token-exchange", wh = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? vu();
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
        grant_type: Sh,
        client_id: this.config.clientId,
        subject_token: e,
        subject_token_type: Eh[this.config.provider.tokenType],
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
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new _u(t.status, a, t.headers) : re.generate(t.status, a, `Token exchange failed with status ${t.status}`, t.headers);
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
}, Nu = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Tn(e, t, n) {
  return Nu(), new File(e, t ?? "unknown_file", n);
}
function uo(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var Ti = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Oo = async (e, t) => xs(e.body) ? {
  ...e,
  body: await ku(e.body, t)
} : e, Ue = async (e, t) => ({
  ...e,
  body: await ku(e.body, t)
}), _r = /* @__PURE__ */ new WeakMap();
function Ih(e) {
  const t = typeof e == "function" ? e : e.fetch, n = _r.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const s = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new s(i).text();
    } catch {
      return !0;
    }
  })();
  return _r.set(t, o), o;
}
var ku = async (e, t) => {
  if (!await Ih(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([o, s]) => Ms(n, o, s))), n;
}, Du = (e) => e instanceof Blob && "name" in e, Ch = (e) => typeof e == "object" && e !== null && (e instanceof Response || Ti(e) || Du(e)), xs = (e) => {
  if (Ch(e)) return !0;
  if (Array.isArray(e)) return e.some(xs);
  if (e && typeof e == "object") {
    for (const t in e) if (xs(e[t])) return !0;
  }
  return !1;
}, Ms = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, Tn([await n.blob()], uo(n)));
    else if (Ti(n)) e.append(t, Tn([await new Response(Eu(n)).blob()], uo(n)));
    else if (Du(n)) e.append(t, n, uo(n));
    else if (Array.isArray(n)) await Promise.all(n.map((o) => Ms(e, t + "[]", o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([o, s]) => Ms(e, `${t}[${o}]`, s)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, Lu = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", Ah = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Lu(e), Rh = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function bh(e, t, n) {
  if (Nu(), e = await e, Ah(e))
    return e instanceof File ? e : Tn([await e.arrayBuffer()], e.name);
  if (Rh(e)) {
    const s = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Tn(await Ns(s), t, n);
  }
  const o = await Ns(e);
  if (t || (t = uo(e)), !n?.type) {
    const s = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof s == "string" && (n = {
      ...n,
      type: s
    });
  }
  return Tn(o, t, n);
}
async function Ns(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (Lu(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Ti(e)) for await (const n of e) t.push(...await Ns(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${Ph(e)}`);
  }
  return t;
}
function Ph(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var D = class {
  constructor(e) {
    this._client = e;
  }
};
function Uu(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var yr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), xh = (e = Uu) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let s = !1;
  const i = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (s = !0);
    const m = o[p];
    let g = (s ? encodeURIComponent : e)("" + m);
    return p !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? yr) ?? yr)?.toString) && (g = m + "", i.push({
      start: h.length + f.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === o.length ? "" : g);
  }, ""), u = a.split(/[?#]/, 1)[0], c = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) i.push({
    start: d.index,
    length: d[0].length,
    error: `Value "${d[0]}" can't be safely passed as a path parameter`
  });
  if (i.sort((h, f) => h.start - f.start), i.length > 0) {
    let h = 0;
    const f = i.reduce((p, m) => {
      const g = " ".repeat(m.start - h), _ = "^".repeat(m.length);
      return h = m.start + m.length, p + g + _;
    }, "");
    throw new L(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}, w = /* @__PURE__ */ xh(Uu), $u = class extends D {
  list(e, t = {}, n) {
    return this._client.getAPIList(w`/chat/completions/${e}/messages`, K, {
      query: t,
      ...n
    });
  }
};
function Ao(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function Ei(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function Pn(e) {
  return e?.$brand === "auto-parseable-tool";
}
function Mh(e, t) {
  return !t || !Fu(t) ? {
    ...e,
    choices: e.choices.map((n) => (Gu(n.message.tool_calls), {
      ...n,
      message: {
        ...n.message,
        parsed: null,
        ...n.message.tool_calls ? { tool_calls: n.message.tool_calls } : void 0
      }
    }))
  } : Si(e, t);
}
function Si(e, t) {
  const n = e.choices.map((o) => {
    if (o.finish_reason === "length") throw new mu();
    if (o.finish_reason === "content_filter") throw new gu();
    return Gu(o.message.tool_calls), {
      ...o,
      message: {
        ...o.message,
        ...o.message.tool_calls ? { tool_calls: o.message.tool_calls?.map((s) => kh(t, s)) ?? void 0 } : void 0,
        parsed: o.message.content && !o.message.refusal ? Nh(t, o.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function Nh(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function kh(e, t) {
  const n = e.tools?.find((o) => Ao(o) && o.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: Pn(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function Dh(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((o) => Ao(o) && o.function?.name === t.function.name);
  return Ao(n) && (Pn(n) || n?.function.strict || !1);
}
function Fu(e) {
  return Ei(e.response_format) ? !0 : e.tools?.some((t) => Pn(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function Gu(e) {
  for (const t of e || []) if (t.type !== "function") throw new L(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function Lh(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new L(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new L(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var Ro = (e) => e?.role === "assistant", Bu = (e) => e?.role === "tool", ks, co, fo, un, cn, ho, dn, Ve, fn, bo, Po, St, qu, wi = class {
  constructor() {
    ks.add(this), this.controller = new AbortController(), co.set(this, void 0), fo.set(this, () => {
    }), un.set(this, () => {
    }), cn.set(this, void 0), ho.set(this, () => {
    }), dn.set(this, () => {
    }), Ve.set(this, {}), fn.set(this, !1), bo.set(this, !1), Po.set(this, !1), St.set(this, !1), F(this, co, new Promise((e, t) => {
      F(this, fo, e, "f"), F(this, un, t, "f");
    }), "f"), F(this, cn, new Promise((e, t) => {
      F(this, ho, e, "f"), F(this, dn, t, "f");
    }), "f"), T(this, co, "f").catch(() => {
    }), T(this, cn, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, T(this, ks, "m", qu).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (T(this, fo, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return T(this, fn, "f");
  }
  get errored() {
    return T(this, bo, "f");
  }
  get aborted() {
    return T(this, Po, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(e, t) {
    return (T(this, Ve, "f")[e] || (T(this, Ve, "f")[e] = [])).push({ listener: t }), this;
  }
  off(e, t) {
    const n = T(this, Ve, "f")[e];
    if (!n) return this;
    const o = n.findIndex((s) => s.listener === t);
    return o >= 0 && n.splice(o, 1), this;
  }
  once(e, t) {
    return (T(this, Ve, "f")[e] || (T(this, Ve, "f")[e] = [])).push({
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
    F(this, St, !0, "f"), await T(this, cn, "f");
  }
  _emit(e, ...t) {
    if (T(this, fn, "f")) return;
    e === "end" && (F(this, fn, !0, "f"), T(this, ho, "f").call(this));
    const n = T(this, Ve, "f")[e];
    if (n && (T(this, Ve, "f")[e] = n.filter((o) => !o.once), n.forEach(({ listener: o }) => o(...t))), e === "abort") {
      const o = t[0];
      !T(this, St, "f") && !n?.length && Promise.reject(o), T(this, un, "f").call(this, o), T(this, dn, "f").call(this, o), this._emit("end");
      return;
    }
    if (e === "error") {
      const o = t[0];
      !T(this, St, "f") && !n?.length && Promise.reject(o), T(this, un, "f").call(this, o), T(this, dn, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
co = /* @__PURE__ */ new WeakMap(), fo = /* @__PURE__ */ new WeakMap(), un = /* @__PURE__ */ new WeakMap(), cn = /* @__PURE__ */ new WeakMap(), ho = /* @__PURE__ */ new WeakMap(), dn = /* @__PURE__ */ new WeakMap(), Ve = /* @__PURE__ */ new WeakMap(), fn = /* @__PURE__ */ new WeakMap(), bo = /* @__PURE__ */ new WeakMap(), Po = /* @__PURE__ */ new WeakMap(), St = /* @__PURE__ */ new WeakMap(), ks = /* @__PURE__ */ new WeakSet(), qu = function(t) {
  if (F(this, bo, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new Ie()), t instanceof Ie)
    return F(this, Po, !0, "f"), this._emit("abort", t);
  if (t instanceof L) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new L(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new L(String(t)));
};
function Uh(e) {
  return typeof e.parse == "function";
}
var le, Ds, xo, Ls, Us, $s, Ou, Vu, $h = 10, Hu = class extends wi {
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
      if (this._emit("message", e), Bu(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (Ro(e) && e.tool_calls)
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
    return await this.done(), T(this, le, "m", Ds).call(this);
  }
  async finalMessage() {
    return await this.done(), T(this, le, "m", xo).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), T(this, le, "m", Ls).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), T(this, le, "m", Us).call(this);
  }
  async totalUsage() {
    return await this.done(), T(this, le, "m", $s).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = T(this, le, "m", xo).call(this);
    t && this._emit("finalMessage", t);
    const n = T(this, le, "m", Ds).call(this);
    n && this._emit("finalContent", n);
    const o = T(this, le, "m", Ls).call(this);
    o && this._emit("finalFunctionToolCall", o);
    const s = T(this, le, "m", Us).call(this);
    s != null && this._emit("finalFunctionToolCallResult", s), this._chatCompletions.some((i) => i.usage) && this._emit("totalUsage", T(this, le, "m", $s).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), T(this, le, "m", Ou).call(this, t);
    const s = await e.chat.completions.create({
      ...t,
      stream: !1
    }, {
      ...n,
      signal: this.controller.signal
    });
    return this._connected(), this._addChatCompletion(Si(s, t));
  }
  async _runChatCompletion(e, t, n) {
    for (const o of t.messages) this._addMessage(o, !1);
    return await this._createChatCompletion(e, t, n);
  }
  async _runTools(e, t, n) {
    const o = "tool", { tool_choice: s = "auto", stream: i, ...a } = t, u = typeof s != "string" && s.type === "function" && s?.function?.name, { maxChatCompletions: c = $h } = n || {}, d = t.tools.map((p) => {
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
        ...a,
        tool_choice: s,
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
            const E = `Invalid tool_call: ${JSON.stringify(y)}. ${JSON.stringify(u)} requested. Please try again`;
            this._addMessage({
              role: o,
              tool_call_id: _,
              content: E
            });
            continue;
          }
        } else {
          const E = `Invalid tool_call: ${JSON.stringify(y)}. Available options are: ${Object.keys(h).map((U) => JSON.stringify(U)).join(", ")}. Please try again`;
          this._addMessage({
            role: o,
            tool_call_id: _,
            content: E
          });
          continue;
        }
        let A;
        try {
          A = Uh(S) ? await S.parse(I) : I;
        } catch (E) {
          const U = E instanceof Error ? E.message : String(E);
          this._addMessage({
            role: o,
            tool_call_id: _,
            content: U
          });
          continue;
        }
        const R = await S.function(A, this), $ = T(this, le, "m", Vu).call(this, R);
        if (this._addMessage({
          role: o,
          tool_call_id: _,
          content: $
        }), u) return;
      }
    }
  }
};
le = /* @__PURE__ */ new WeakSet(), Ds = function() {
  return T(this, le, "m", xo).call(this).content ?? null;
}, xo = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (Ro(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new L("stream ended without producing a ChatCompletionMessage with role=assistant");
}, Ls = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (Ro(n) && n?.tool_calls?.length) return n.tool_calls.filter((o) => o.type === "function").at(-1)?.function;
  }
}, Us = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (Bu(n) && n.content != null && typeof n.content == "string" && this.messages.some((o) => o.role === "assistant" && o.tool_calls?.some((s) => s.type === "function" && s.id === n.tool_call_id))) return n.content;
  }
}, $s = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, Ou = function(t) {
  if (t.n != null && t.n > 1) throw new L("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, Vu = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var Fh = class Ju extends Hu {
  static runTools(t, n, o) {
    const s = new Ju(), i = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return s._run(() => s._runTools(t, n, i)), s;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), Ro(t) && t.content && this._emit("content", t.content);
  }
}, Gh = 1, Wu = 2, Ku = 4, Yu = 8, Bh = 16, qh = 32, Oh = 64, zu = 128, Xu = 256, Vh = zu | Xu, Hh = 496, vr = Wu | 497, Tr = Ku | Yu, ne = {
  STR: Gh,
  NUM: Wu,
  ARR: Ku,
  OBJ: Yu,
  NULL: Bh,
  BOOL: qh,
  NAN: Oh,
  INFINITY: zu,
  MINUS_INFINITY: Xu,
  INF: Vh,
  SPECIAL: Hh,
  ATOM: vr,
  COLLECTION: Tr,
  ALL: vr | Tr
}, Jh = class extends Error {
}, Wh = class extends Error {
};
function Kh(e, t = ne.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return Yh(e.trim(), t);
}
var Yh = (e, t) => {
  const n = e.length;
  let o = 0;
  const s = (p) => {
    throw new Jh(`${p} at position ${o}`);
  }, i = (p) => {
    throw new Wh(`${p} at position ${o}`);
  }, a = () => (f(), o >= n && s("Unexpected end of input"), e[o] === '"' ? u() : e[o] === "{" ? c() : e[o] === "[" ? d() : e.substring(o, o + 4) === "null" || ne.NULL & t && n - o < 4 && "null".startsWith(e.substring(o)) ? (o += 4, null) : e.substring(o, o + 4) === "true" || ne.BOOL & t && n - o < 4 && "true".startsWith(e.substring(o)) ? (o += 4, !0) : e.substring(o, o + 5) === "false" || ne.BOOL & t && n - o < 5 && "false".startsWith(e.substring(o)) ? (o += 5, !1) : e.substring(o, o + 8) === "Infinity" || ne.INFINITY & t && n - o < 8 && "Infinity".startsWith(e.substring(o)) ? (o += 8, 1 / 0) : e.substring(o, o + 9) === "-Infinity" || ne.MINUS_INFINITY & t && 1 < n - o && n - o < 9 && "-Infinity".startsWith(e.substring(o)) ? (o += 9, -1 / 0) : e.substring(o, o + 3) === "NaN" || ne.NAN & t && n - o < 3 && "NaN".startsWith(e.substring(o)) ? (o += 3, NaN) : h()), u = () => {
    const p = o;
    let m = !1;
    for (o++; o < n && (e[o] !== '"' || m && e[o - 1] === "\\"); )
      m = e[o] === "\\" ? !m : !1, o++;
    if (e.charAt(o) == '"') try {
      return JSON.parse(e.substring(p, ++o - Number(m)));
    } catch (g) {
      i(String(g));
    }
    else if (ne.STR & t) try {
      return JSON.parse(e.substring(p, o - Number(m)) + '"');
    } catch {
      return JSON.parse(e.substring(p, e.lastIndexOf("\\")) + '"');
    }
    s("Unterminated string literal");
  }, c = () => {
    o++, f();
    const p = {};
    try {
      for (; e[o] !== "}"; ) {
        if (f(), o >= n && ne.OBJ & t) return p;
        const m = u();
        f(), o++;
        try {
          const g = a();
          Object.defineProperty(p, m, {
            value: g,
            writable: !0,
            enumerable: !0,
            configurable: !0
          });
        } catch (g) {
          if (ne.OBJ & t) return p;
          throw g;
        }
        f(), e[o] === "," && o++;
      }
    } catch {
      if (ne.OBJ & t) return p;
      s("Expected '}' at end of object");
    }
    return o++, p;
  }, d = () => {
    o++;
    const p = [];
    try {
      for (; e[o] !== "]"; )
        p.push(a()), f(), e[o] === "," && o++;
    } catch {
      if (ne.ARR & t) return p;
      s("Expected ']' at end of array");
    }
    return o++, p;
  }, h = () => {
    if (o === 0) {
      e === "-" && ne.NUM & t && s("Not sure what '-' is");
      try {
        return JSON.parse(e);
      } catch (m) {
        if (ne.NUM & t) try {
          return e[e.length - 1] === "." ? JSON.parse(e.substring(0, e.lastIndexOf("."))) : JSON.parse(e.substring(0, e.lastIndexOf("e")));
        } catch {
        }
        i(String(m));
      }
    }
    const p = o;
    for (e[o] === "-" && o++; e[o] && !",]}".includes(e[o]); ) o++;
    o == n && !(ne.NUM & t) && s("Unterminated number literal");
    try {
      return JSON.parse(e.substring(p, o));
    } catch {
      e.substring(p, o) === "-" && ne.NUM & t && s("Not sure what '-' is");
      try {
        return JSON.parse(e.substring(p, e.lastIndexOf("e")));
      } catch (g) {
        i(String(g));
      }
    }
  }, f = () => {
    for (; o < n && ` 
\r	`.includes(e[o]); ) o++;
  };
  return a();
}, Er = (e) => Kh(e, ne.ALL ^ ne.NUM), X, Be, mt, Ye, rs, Fn, as, ls, us, Gn, cs, Sr, Qu = class Fs extends Hu {
  constructor(t) {
    super(), X.add(this), Be.set(this, void 0), mt.set(this, void 0), Ye.set(this, void 0), F(this, Be, t, "f"), F(this, mt, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return T(this, Ye, "f");
  }
  static fromReadableStream(t) {
    const n = new Fs(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createChatCompletion(t, n, o) {
    const s = new Fs(n);
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
    s && (s.aborted && this.controller.abort(), s.addEventListener("abort", () => this.controller.abort())), T(this, X, "m", rs).call(this);
    const i = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const a of i) T(this, X, "m", as).call(this, a);
    if (i.controller.signal?.aborted) throw new Ie();
    return this._addChatCompletion(T(this, X, "m", Gn).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), T(this, X, "m", rs).call(this), this._connected();
    const s = In.fromReadableStream(t, this.controller);
    let i;
    for await (const a of s)
      i && i !== a.id && this._addChatCompletion(T(this, X, "m", Gn).call(this)), T(this, X, "m", as).call(this, a), i = a.id;
    if (s.controller.signal?.aborted) throw new Ie();
    return this._addChatCompletion(T(this, X, "m", Gn).call(this));
  }
  [(Be = /* @__PURE__ */ new WeakMap(), mt = /* @__PURE__ */ new WeakMap(), Ye = /* @__PURE__ */ new WeakMap(), X = /* @__PURE__ */ new WeakSet(), rs = function() {
    this.ended || F(this, Ye, void 0, "f");
  }, Fn = function(n) {
    let o = T(this, mt, "f")[n.index];
    return o || (o = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, T(this, mt, "f")[n.index] = o, o);
  }, as = function(n) {
    if (this.ended) return;
    const o = T(this, X, "m", Sr).call(this, n);
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
      const a = T(this, X, "m", Fn).call(this, i);
      i.finish_reason && (T(this, X, "m", us).call(this, i), a.current_tool_call_index != null && T(this, X, "m", ls).call(this, i, a.current_tool_call_index));
      for (const u of s.delta.tool_calls ?? [])
        a.current_tool_call_index !== u.index && (T(this, X, "m", us).call(this, i), a.current_tool_call_index != null && T(this, X, "m", ls).call(this, i, a.current_tool_call_index)), a.current_tool_call_index = u.index;
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
  }, ls = function(n, o) {
    if (T(this, X, "m", Fn).call(this, n).done_tool_calls.has(o)) return;
    const s = n.message.tool_calls?.[o];
    if (!s) throw new Error("no tool call snapshot");
    if (!s.type) throw new Error("tool call snapshot missing `type`");
    if (s.type === "function") {
      const i = T(this, Be, "f")?.tools?.find((a) => Ao(a) && a.function.name === s.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: s.function.name,
        index: o,
        arguments: s.function.arguments,
        parsed_arguments: Pn(i) ? i.$parseRaw(s.function.arguments) : i?.function.strict ? JSON.parse(s.function.arguments) : null
      });
    } else s.type;
  }, us = function(n) {
    const o = T(this, X, "m", Fn).call(this, n);
    if (n.message.content && !o.content_done) {
      o.content_done = !0;
      const s = T(this, X, "m", cs).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: s ? s.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !o.refusal_done && (o.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !o.logprobs_content_done && (o.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !o.logprobs_refusal_done && (o.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, Gn = function() {
    if (this.ended) throw new L("stream has ended, this shouldn't happen");
    const n = T(this, Ye, "f");
    if (!n) throw new L("request ended without sending any chunks");
    return F(this, Ye, void 0, "f"), F(this, mt, [], "f"), zh(n, T(this, Be, "f"));
  }, cs = function() {
    const n = T(this, Be, "f")?.response_format;
    return Ei(n) ? n : null;
  }, Sr = function(n) {
    var o, s, i, a;
    let u = T(this, Ye, "f");
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
        const { content: E, refusal: U, ...C } = m;
        Object.assign(_.logprobs, C), E && ((o = _.logprobs).content ?? (o.content = []), _.logprobs.content.push(...E)), U && ((s = _.logprobs).refusal ?? (s.refusal = []), _.logprobs.refusal.push(...U));
      }
      if (f && (_.finish_reason = f, T(this, Be, "f") && Fu(T(this, Be, "f")))) {
        if (f === "length") throw new mu();
        if (f === "content_filter") throw new gu();
      }
      if (Object.assign(_, g), !h) continue;
      const { content: y, refusal: I, function_call: S, role: A, tool_calls: R, ...$ } = h;
      if (Object.assign(_.message, $), I && (_.message.refusal = (_.message.refusal || "") + I), A && (_.message.role = A), S && (_.message.function_call ? (S.name && (_.message.function_call.name = S.name), S.arguments && ((i = _.message.function_call).arguments ?? (i.arguments = ""), _.message.function_call.arguments += S.arguments)) : _.message.function_call = S), y && (_.message.content = (_.message.content || "") + y, !_.message.refusal && T(this, X, "m", cs).call(this) && (_.message.parsed = Er(_.message.content))), R) {
        _.message.tool_calls || (_.message.tool_calls = []);
        for (const { index: E, id: U, type: C, function: k, ...O } of R) {
          const J = (a = _.message.tool_calls)[E] ?? (a[E] = {});
          Object.assign(J, O), U && (J.id = U), C && (J.type = C), k && (J.function ?? (J.function = {
            name: k.name ?? "",
            arguments: ""
          })), k?.name && (J.function.name = k.name), k?.arguments && (J.function.arguments += k.arguments, Dh(T(this, Be, "f"), J) && (J.function.parsed_arguments = Er(J.function.arguments)));
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
    return new In(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
function zh(e, t) {
  const { id: n, choices: o, created: s, model: i, system_fingerprint: a, ...u } = e;
  return Mh({
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
            const { function: R, type: $, id: E, ...U } = S, { arguments: C, name: k, ...O } = R || {};
            if (E == null) throw new L(`missing choices[${h}].tool_calls[${A}].id
${Bn(e)}`);
            if ($ == null) throw new L(`missing choices[${h}].tool_calls[${A}].type
${Bn(e)}`);
            if (k == null) throw new L(`missing choices[${h}].tool_calls[${A}].function.name
${Bn(e)}`);
            if (C == null) throw new L(`missing choices[${h}].tool_calls[${A}].function.arguments
${Bn(e)}`);
            return {
              ...U,
              id: E,
              type: $,
              function: {
                ...O,
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
    created: s,
    model: i,
    object: "chat.completion",
    ...a ? { system_fingerprint: a } : {}
  }, t);
}
function Bn(e) {
  return JSON.stringify(e);
}
var Xh = class Gs extends Qu {
  static fromReadableStream(t) {
    const n = new Gs(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static runTools(t, n, o) {
    const s = new Gs(n), i = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return s._run(() => s._runTools(t, n, i)), s;
  }
}, Ii = class extends D {
  constructor() {
    super(...arguments), this.messages = new $u(this._client);
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
    return Lh(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => Si(n, e));
  }
  runTools(e, t) {
    return e.stream ? Xh.runTools(this._client, e, t) : Fh.runTools(this._client, e, t);
  }
  stream(e, t) {
    return Qu.createChatCompletion(this._client, e, t);
  }
};
Ii.Messages = $u;
var Ci = class extends D {
  constructor() {
    super(...arguments), this.completions = new Ii(this._client);
  }
};
Ci.Completions = Ii;
var Zu = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* Qh(e) {
  if (!e) return;
  if (Zu in e) {
    const { values: o, nulls: s } = e;
    yield* o.entries();
    for (const i of s) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : or(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const s = o[0];
    if (typeof s != "string") throw new TypeError("expected header name to be a string");
    const i = or(o[1]) ? o[1] : [o[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [s, null]), yield [s, u]);
  }
}
var N = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const s = /* @__PURE__ */ new Set();
    for (const [i, a] of Qh(o)) {
      const u = i.toLowerCase();
      s.has(u) || (t.delete(i), s.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [Zu]: !0,
    values: t,
    nulls: n
  };
}, ju = class extends D {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: N([{ Accept: "application/octet-stream" }, t?.headers]),
      __binaryResponse: !0
    });
  }
}, ec = class extends D {
  create(e, t) {
    return this._client.post("/audio/transcriptions", Ue({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model }
    }, this._client));
  }
}, tc = class extends D {
  create(e, t) {
    return this._client.post("/audio/translations", Ue({
      body: e,
      ...t,
      __metadata: { model: e.model }
    }, this._client));
  }
}, xn = class extends D {
  constructor() {
    super(...arguments), this.transcriptions = new ec(this._client), this.translations = new tc(this._client), this.speech = new ju(this._client);
  }
};
xn.Transcriptions = ec;
xn.Translations = tc;
xn.Speech = ju;
var nc = class extends D {
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
}, oc = class extends D {
  create(e, t) {
    return this._client.post("/assistants", {
      body: e,
      ...t,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  retrieve(e, t) {
    return this._client.get(w`/assistants/${e}`, {
      ...t,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  update(e, t, n) {
    return this._client.post(w`/assistants/${e}`, {
      body: t,
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/assistants", K, {
      query: e,
      ...t,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(w`/assistants/${e}`, {
      ...t,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, sc = class extends D {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, ic = class extends D {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, Vo = class extends D {
  constructor() {
    super(...arguments), this.sessions = new sc(this._client), this.transcriptionSessions = new ic(this._client);
  }
};
Vo.Sessions = sc;
Vo.TranscriptionSessions = ic;
var rc = class extends D {
  create(e, t) {
    return this._client.post("/chatkit/sessions", {
      body: e,
      ...t,
      headers: N([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  cancel(e, t) {
    return this._client.post(w`/chatkit/sessions/${e}/cancel`, {
      ...t,
      headers: N([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
}, ac = class extends D {
  retrieve(e, t) {
    return this._client.get(w`/chatkit/threads/${e}`, {
      ...t,
      headers: N([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chatkit/threads", Cn, {
      query: e,
      ...t,
      headers: N([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(w`/chatkit/threads/${e}`, {
      ...t,
      headers: N([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  listItems(e, t = {}, n) {
    return this._client.getAPIList(w`/chatkit/threads/${e}/items`, Cn, {
      query: t,
      ...n,
      headers: N([{ "OpenAI-Beta": "chatkit_beta=v1" }, n?.headers])
    });
  }
}, Ho = class extends D {
  constructor() {
    super(...arguments), this.sessions = new rc(this._client), this.threads = new ac(this._client);
  }
};
Ho.Sessions = rc;
Ho.Threads = ac;
var lc = class extends D {
  create(e, t, n) {
    return this._client.post(w`/threads/${e}/messages`, {
      body: t,
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { thread_id: o } = t;
    return this._client.get(w`/threads/${o}/messages/${e}`, {
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  update(e, t, n) {
    const { thread_id: o, ...s } = t;
    return this._client.post(w`/threads/${o}/messages/${e}`, {
      body: s,
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(w`/threads/${e}/messages`, K, {
      query: t,
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { thread_id: o } = t;
    return this._client.delete(w`/threads/${o}/messages/${e}`, {
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, uc = class extends D {
  retrieve(e, t, n) {
    const { thread_id: o, run_id: s, ...i } = t;
    return this._client.get(w`/threads/${o}/runs/${s}/steps/${e}`, {
      query: i,
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t, n) {
    const { thread_id: o, ...s } = t;
    return this._client.getAPIList(w`/threads/${o}/runs/${e}/steps`, K, {
      query: s,
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, Zh = (e) => {
  if (typeof Buffer < "u") {
    const t = Buffer.from(e, "base64");
    return Array.from(new Float32Array(t.buffer, t.byteOffset, t.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const t = atob(e), n = t.length, o = new Uint8Array(n);
    for (let s = 0; s < n; s++) o[s] = t.charCodeAt(s);
    return Array.from(new Float32Array(o.buffer));
  }
}, gt = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() ?? void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim();
}, ie, ct, Bs, Le, po, be, dt, Rt, ut, Mo, Te, mo, go, En, hn, pn, wr, Ir, Cr, Ar, Rr, br, Pr, Sn = class extends wi {
  constructor() {
    super(...arguments), ie.add(this), Bs.set(this, []), Le.set(this, {}), po.set(this, {}), be.set(this, void 0), dt.set(this, void 0), Rt.set(this, void 0), ut.set(this, void 0), Mo.set(this, void 0), Te.set(this, void 0), mo.set(this, void 0), go.set(this, void 0), En.set(this, void 0);
  }
  [(Bs = /* @__PURE__ */ new WeakMap(), Le = /* @__PURE__ */ new WeakMap(), po = /* @__PURE__ */ new WeakMap(), be = /* @__PURE__ */ new WeakMap(), dt = /* @__PURE__ */ new WeakMap(), Rt = /* @__PURE__ */ new WeakMap(), ut = /* @__PURE__ */ new WeakMap(), Mo = /* @__PURE__ */ new WeakMap(), Te = /* @__PURE__ */ new WeakMap(), mo = /* @__PURE__ */ new WeakMap(), go = /* @__PURE__ */ new WeakMap(), En = /* @__PURE__ */ new WeakMap(), ie = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
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
    const t = new ct();
    return t._run(() => t._fromReadableStream(e)), t;
  }
  async _fromReadableStream(e, t) {
    const n = t?.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const o = In.fromReadableStream(e, this.controller);
    for await (const s of o) T(this, ie, "m", hn).call(this, s);
    if (o.controller.signal?.aborted) throw new Ie();
    return this._addRun(T(this, ie, "m", pn).call(this));
  }
  toReadableStream() {
    return new In(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, t, n, o) {
    const s = new ct();
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
    for await (const u of a) T(this, ie, "m", hn).call(this, u);
    if (a.controller.signal?.aborted) throw new Ie();
    return this._addRun(T(this, ie, "m", pn).call(this));
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
    const s = new ct();
    return s._run(() => s._runAssistantStream(e, t, n, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), s;
  }
  currentEvent() {
    return T(this, mo, "f");
  }
  currentRun() {
    return T(this, go, "f");
  }
  currentMessageSnapshot() {
    return T(this, be, "f");
  }
  currentRunStepSnapshot() {
    return T(this, En, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(T(this, Le, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(T(this, po, "f"));
  }
  async finalRun() {
    if (await this.done(), !T(this, dt, "f")) throw Error("Final run was not received.");
    return T(this, dt, "f");
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
    for await (const a of i) T(this, ie, "m", hn).call(this, a);
    if (i.controller.signal?.aborted) throw new Ie();
    return this._addRun(T(this, ie, "m", pn).call(this));
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
    for await (const u of a) T(this, ie, "m", hn).call(this, u);
    if (a.controller.signal?.aborted) throw new Ie();
    return this._addRun(T(this, ie, "m", pn).call(this));
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
      else if (os(s) && os(o)) s = this.accumulateDelta(s, o);
      else if (Array.isArray(s) && Array.isArray(o)) {
        if (s.every((i) => typeof i == "string" || typeof i == "number")) {
          s.push(...o);
          continue;
        }
        for (const i of o) {
          if (!os(i)) throw new Error(`Expected array delta entry to be an object but got: ${i}`);
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
ct = Sn, hn = function(t) {
  if (!this.ended)
    switch (F(this, mo, t, "f"), T(this, ie, "m", Cr).call(this, t), t.event) {
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
        T(this, ie, "m", Pr).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        T(this, ie, "m", Ir).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        T(this, ie, "m", wr).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, pn = function() {
  if (this.ended) throw new L("stream has ended, this shouldn't happen");
  if (!T(this, dt, "f")) throw Error("Final run has not been received");
  return T(this, dt, "f");
}, wr = function(t) {
  const [n, o] = T(this, ie, "m", Rr).call(this, t, T(this, be, "f"));
  F(this, be, n, "f"), T(this, po, "f")[n.id] = n;
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
        if (s.index != T(this, Rt, "f")) {
          if (T(this, ut, "f")) switch (T(this, ut, "f").type) {
            case "text":
              this._emit("textDone", T(this, ut, "f").text, T(this, be, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", T(this, ut, "f").image_file, T(this, be, "f"));
              break;
          }
          F(this, Rt, s.index, "f");
        }
        F(this, ut, n.content[s.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (T(this, Rt, "f") !== void 0) {
        const s = t.data.content[T(this, Rt, "f")];
        if (s) switch (s.type) {
          case "image_file":
            this._emit("imageFileDone", s.image_file, T(this, be, "f"));
            break;
          case "text":
            this._emit("textDone", s.text, T(this, be, "f"));
            break;
        }
      }
      T(this, be, "f") && this._emit("messageDone", t.data), F(this, be, void 0, "f");
  }
}, Ir = function(t) {
  const n = T(this, ie, "m", Ar).call(this, t);
  switch (F(this, En, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const o = t.data.delta;
      if (o.step_details && o.step_details.type == "tool_calls" && o.step_details.tool_calls && n.step_details.type == "tool_calls") for (const s of o.step_details.tool_calls) s.index == T(this, Mo, "f") ? this._emit("toolCallDelta", s, n.step_details.tool_calls[s.index]) : (T(this, Te, "f") && this._emit("toolCallDone", T(this, Te, "f")), F(this, Mo, s.index, "f"), F(this, Te, n.step_details.tool_calls[s.index], "f"), T(this, Te, "f") && this._emit("toolCallCreated", T(this, Te, "f")));
      this._emit("runStepDelta", t.data.delta, n);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      F(this, En, void 0, "f"), t.data.step_details.type == "tool_calls" && T(this, Te, "f") && (this._emit("toolCallDone", T(this, Te, "f")), F(this, Te, void 0, "f")), this._emit("runStepDone", t.data, n);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, Cr = function(t) {
  T(this, Bs, "f").push(t), this._emit("event", t);
}, Ar = function(t) {
  switch (t.event) {
    case "thread.run.step.created":
      return T(this, Le, "f")[t.data.id] = t.data, t.data;
    case "thread.run.step.delta":
      let n = T(this, Le, "f")[t.data.id];
      if (!n) throw Error("Received a RunStepDelta before creation of a snapshot");
      let o = t.data;
      if (o.delta) {
        const s = ct.accumulateDelta(n, o.delta);
        T(this, Le, "f")[t.data.id] = s;
      }
      return T(this, Le, "f")[t.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      T(this, Le, "f")[t.data.id] = t.data;
      break;
  }
  if (T(this, Le, "f")[t.data.id]) return T(this, Le, "f")[t.data.id];
  throw new Error("No snapshot available");
}, Rr = function(t, n) {
  let o = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, o];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let s = t.data;
      if (s.delta.content) for (const i of s.delta.content) if (i.index in n.content) {
        let a = n.content[i.index];
        n.content[i.index] = T(this, ie, "m", br).call(this, i, a);
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
}, br = function(t, n) {
  return ct.accumulateDelta(n, t);
}, Pr = function(t) {
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
      F(this, dt, t.data, "f"), T(this, Te, "f") && (this._emit("toolCallDone", T(this, Te, "f")), F(this, Te, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var Ai = class extends D {
  constructor() {
    super(...arguments), this.steps = new uc(this._client);
  }
  create(e, t, n) {
    const { include: o, ...s } = t;
    return this._client.post(w`/threads/${e}/runs`, {
      query: { include: o },
      body: s,
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0
    });
  }
  retrieve(e, t, n) {
    const { thread_id: o } = t;
    return this._client.get(w`/threads/${o}/runs/${e}`, {
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  update(e, t, n) {
    const { thread_id: o, ...s } = t;
    return this._client.post(w`/threads/${o}/runs/${e}`, {
      body: s,
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(w`/threads/${e}/runs`, K, {
      query: t,
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  cancel(e, t, n) {
    const { thread_id: o } = t;
    return this._client.post(w`/threads/${o}/runs/${e}/cancel`, {
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
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
    const o = N([n?.headers, {
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
          await bn(a);
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
    return Sn.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  submitToolOutputs(e, t, n) {
    const { thread_id: o, ...s } = t;
    return this._client.post(w`/threads/${o}/runs/${e}/submit_tool_outputs`, {
      body: s,
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
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
Ai.Steps = uc;
var Jo = class extends D {
  constructor() {
    super(...arguments), this.runs = new Ai(this._client), this.messages = new lc(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/threads", {
      body: e,
      ...t,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  retrieve(e, t) {
    return this._client.get(w`/threads/${e}`, {
      ...t,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  update(e, t, n) {
    return this._client.post(w`/threads/${e}`, {
      body: t,
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(w`/threads/${e}`, {
      ...t,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  createAndRun(e, t) {
    return this._client.post("/threads/runs", {
      body: e,
      ...t,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
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
Jo.Runs = Ai;
Jo.Messages = lc;
var kt = class extends D {
  constructor() {
    super(...arguments), this.realtime = new Vo(this._client), this.chatkit = new Ho(this._client), this.assistants = new oc(this._client), this.threads = new Jo(this._client);
  }
};
kt.Realtime = Vo;
kt.ChatKit = Ho;
kt.Assistants = oc;
kt.Threads = Jo;
var cc = class extends D {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    });
  }
}, dc = class extends D {
  retrieve(e, t, n) {
    const { container_id: o } = t;
    return this._client.get(w`/containers/${o}/files/${e}/content`, {
      ...n,
      headers: N([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
}, Ri = class extends D {
  constructor() {
    super(...arguments), this.content = new dc(this._client);
  }
  create(e, t, n) {
    return this._client.post(w`/containers/${e}/files`, Oo({
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
      headers: N([{ Accept: "*/*" }, n?.headers])
    });
  }
};
Ri.Content = dc;
var bi = class extends D {
  constructor() {
    super(...arguments), this.files = new Ri(this._client);
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
      headers: N([{ Accept: "*/*" }, t?.headers])
    });
  }
};
bi.Files = Ri;
var fc = class extends D {
  create(e, t, n) {
    const { include: o, ...s } = t;
    return this._client.post(w`/conversations/${e}/items`, {
      query: { include: o },
      body: s,
      ...n
    });
  }
  retrieve(e, t, n) {
    const { conversation_id: o, ...s } = t;
    return this._client.get(w`/conversations/${o}/items/${e}`, {
      query: s,
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
}, Pi = class extends D {
  constructor() {
    super(...arguments), this.items = new fc(this._client);
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
Pi.Items = fc;
var hc = class extends D {
  create(e, t) {
    const n = !!e.encoding_format;
    let o = n ? e.encoding_format : "base64";
    n && se(this._client).debug("embeddings/user defined encoding_format:", e.encoding_format);
    const s = this._client.post("/embeddings", {
      body: {
        ...e,
        encoding_format: o
      },
      ...t
    });
    return n ? s : (se(this._client).debug("embeddings/decoding base64 embeddings from base64"), s._thenUnwrap((i) => (i && i.data && i.data.forEach((a) => {
      const u = a.embedding;
      a.embedding = Zh(u);
    }), i)));
  }
}, pc = class extends D {
  retrieve(e, t, n) {
    const { eval_id: o, run_id: s } = t;
    return this._client.get(w`/evals/${o}/runs/${s}/output_items/${e}`, n);
  }
  list(e, t, n) {
    const { eval_id: o, ...s } = t;
    return this._client.getAPIList(w`/evals/${o}/runs/${e}/output_items`, K, {
      query: s,
      ...n
    });
  }
}, xi = class extends D {
  constructor() {
    super(...arguments), this.outputItems = new pc(this._client);
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
xi.OutputItems = pc;
var Mi = class extends D {
  constructor() {
    super(...arguments), this.runs = new xi(this._client);
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
Mi.Runs = xi;
var mc = class extends D {
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
      headers: N([{ Accept: "application/binary" }, t?.headers]),
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
      if (await bn(t), i = await this.retrieve(e), Date.now() - s > n) throw new _i({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return i;
  }
}, gc = class extends D {
}, _c = class extends D {
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
}, Ni = class extends D {
  constructor() {
    super(...arguments), this.graders = new _c(this._client);
  }
};
Ni.Graders = _c;
var yc = class extends D {
  create(e, t, n) {
    return this._client.getAPIList(w`/fine_tuning/checkpoints/${e}/permissions`, qo, {
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
}, ki = class extends D {
  constructor() {
    super(...arguments), this.permissions = new yc(this._client);
  }
};
ki.Permissions = yc;
var vc = class extends D {
  list(e, t = {}, n) {
    return this._client.getAPIList(w`/fine_tuning/jobs/${e}/checkpoints`, K, {
      query: t,
      ...n
    });
  }
}, Di = class extends D {
  constructor() {
    super(...arguments), this.checkpoints = new vc(this._client);
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
Di.Checkpoints = vc;
var Dt = class extends D {
  constructor() {
    super(...arguments), this.methods = new gc(this._client), this.jobs = new Di(this._client), this.checkpoints = new ki(this._client), this.alpha = new Ni(this._client);
  }
};
Dt.Methods = gc;
Dt.Jobs = Di;
Dt.Checkpoints = ki;
Dt.Alpha = Ni;
var Tc = class extends D {
}, Li = class extends D {
  constructor() {
    super(...arguments), this.graderModels = new Tc(this._client);
  }
};
Li.GraderModels = Tc;
var Ec = class extends D {
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
}, Sc = class extends D {
  retrieve(e, t) {
    return this._client.get(w`/models/${e}`, t);
  }
  list(e) {
    return this._client.getAPIList("/models", qo, e);
  }
  delete(e, t) {
    return this._client.delete(w`/models/${e}`, t);
  }
}, wc = class extends D {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t
    });
  }
}, Ic = class extends D {
  accept(e, t, n) {
    return this._client.post(w`/realtime/calls/${e}/accept`, {
      body: t,
      ...n,
      headers: N([{ Accept: "*/*" }, n?.headers])
    });
  }
  hangup(e, t) {
    return this._client.post(w`/realtime/calls/${e}/hangup`, {
      ...t,
      headers: N([{ Accept: "*/*" }, t?.headers])
    });
  }
  refer(e, t, n) {
    return this._client.post(w`/realtime/calls/${e}/refer`, {
      body: t,
      ...n,
      headers: N([{ Accept: "*/*" }, n?.headers])
    });
  }
  reject(e, t = {}, n) {
    return this._client.post(w`/realtime/calls/${e}/reject`, {
      body: t,
      ...n,
      headers: N([{ Accept: "*/*" }, n?.headers])
    });
  }
}, Cc = class extends D {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t
    });
  }
}, Wo = class extends D {
  constructor() {
    super(...arguments), this.clientSecrets = new Cc(this._client), this.calls = new Ic(this._client);
  }
};
Wo.ClientSecrets = Cc;
Wo.Calls = Ic;
function jh(e, t) {
  return !t || !tp(t) ? {
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
  } : Ac(e, t);
}
function Ac(e, t) {
  const n = e.output.map((s) => {
    if (s.type === "function_call") return {
      ...s,
      parsed_arguments: sp(t, s)
    };
    if (s.type === "message") {
      const i = s.content.map((a) => a.type === "output_text" ? {
        ...a,
        parsed: ep(t, a.text)
      } : a);
      return {
        ...s,
        content: i
      };
    }
    return s;
  }), o = Object.assign({}, e, { output: n });
  return Object.getOwnPropertyDescriptor(e, "output_text") || qs(o), Object.defineProperty(o, "output_parsed", {
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
function ep(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function tp(e) {
  return !!Ei(e.text?.format);
}
function np(e) {
  return e?.$brand === "auto-parseable-tool";
}
function op(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function sp(e, t) {
  const n = op(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: np(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function qs(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const o of n.content) o.type === "output_text" && t.push(o.text);
  e.output_text = t.join("");
}
var _t, qn, ze, On, xr, Mr, Nr, kr, ip = class Rc extends wi {
  constructor(t) {
    super(), _t.add(this), qn.set(this, void 0), ze.set(this, void 0), On.set(this, void 0), F(this, qn, t, "f");
  }
  static createResponse(t, n, o) {
    const s = new Rc(n);
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
    s && (s.aborted && this.controller.abort(), s.addEventListener("abort", () => this.controller.abort())), T(this, _t, "m", xr).call(this);
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
    for await (const u of i) T(this, _t, "m", Mr).call(this, u, a);
    if (i.controller.signal?.aborted) throw new Ie();
    return T(this, _t, "m", Nr).call(this);
  }
  [(qn = /* @__PURE__ */ new WeakMap(), ze = /* @__PURE__ */ new WeakMap(), On = /* @__PURE__ */ new WeakMap(), _t = /* @__PURE__ */ new WeakSet(), xr = function() {
    this.ended || F(this, ze, void 0, "f");
  }, Mr = function(n, o) {
    if (this.ended) return;
    const s = (a, u) => {
      (o == null || u.sequence_number > o) && this._emit(a, u);
    }, i = T(this, _t, "m", kr).call(this, n);
    switch (s("event", n), n.type) {
      case "response.output_text.delta": {
        const a = i.output[n.output_index];
        if (!a) throw new L(`missing output at index ${n.output_index}`);
        if (a.type === "message") {
          const u = a.content[n.content_index];
          if (!u) throw new L(`missing content at index ${n.content_index}`);
          if (u.type !== "output_text") throw new L(`expected content to be 'output_text', got ${u.type}`);
          s("response.output_text.delta", {
            ...n,
            snapshot: u.text
          });
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const a = i.output[n.output_index];
        if (!a) throw new L(`missing output at index ${n.output_index}`);
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
  }, Nr = function() {
    if (this.ended) throw new L("stream has ended, this shouldn't happen");
    const n = T(this, ze, "f");
    if (!n) throw new L("request ended without sending any events");
    F(this, ze, void 0, "f");
    const o = rp(n, T(this, qn, "f"));
    return F(this, On, o, "f"), o;
  }, kr = function(n) {
    let o = T(this, ze, "f");
    if (!o) {
      if (n.type !== "response.created") throw new L(`When snapshot hasn't been set yet, expected 'response.created' event, got ${n.type}`);
      return o = F(this, ze, n.response, "f"), o;
    }
    switch (n.type) {
      case "response.output_item.added":
        o.output.push(n.item);
        break;
      case "response.content_part.added": {
        const s = o.output[n.output_index];
        if (!s) throw new L(`missing output at index ${n.output_index}`);
        const i = s.type, a = n.part;
        i === "message" && a.type !== "reasoning_text" ? s.content.push(a) : i === "reasoning" && a.type === "reasoning_text" && (s.content || (s.content = []), s.content.push(a));
        break;
      }
      case "response.output_text.delta": {
        const s = o.output[n.output_index];
        if (!s) throw new L(`missing output at index ${n.output_index}`);
        if (s.type === "message") {
          const i = s.content[n.content_index];
          if (!i) throw new L(`missing content at index ${n.content_index}`);
          if (i.type !== "output_text") throw new L(`expected content to be 'output_text', got ${i.type}`);
          i.text += n.delta;
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const s = o.output[n.output_index];
        if (!s) throw new L(`missing output at index ${n.output_index}`);
        s.type === "function_call" && (s.arguments += n.delta);
        break;
      }
      case "response.reasoning_text.delta": {
        const s = o.output[n.output_index];
        if (!s) throw new L(`missing output at index ${n.output_index}`);
        if (s.type === "reasoning") {
          const i = s.content?.[n.content_index];
          if (!i) throw new L(`missing content at index ${n.content_index}`);
          if (i.type !== "reasoning_text") throw new L(`expected content to be 'reasoning_text', got ${i.type}`);
          i.text += n.delta;
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
    const t = T(this, On, "f");
    if (!t) throw new L("stream ended without producing a ChatCompletion");
    return t;
  }
};
function rp(e, t) {
  return jh(e, t);
}
var bc = class extends D {
  list(e, t = {}, n) {
    return this._client.getAPIList(w`/responses/${e}/input_items`, K, {
      query: t,
      ...n
    });
  }
}, Pc = class extends D {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t
    });
  }
}, Ko = class extends D {
  constructor() {
    super(...arguments), this.inputItems = new bc(this._client), this.inputTokens = new Pc(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && qs(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(w`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1
    })._thenUnwrap((o) => ("object" in o && o.object === "response" && qs(o), o));
  }
  delete(e, t) {
    return this._client.delete(w`/responses/${e}`, {
      ...t,
      headers: N([{ Accept: "*/*" }, t?.headers])
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => Ac(n, e));
  }
  stream(e, t) {
    return ip.createResponse(this._client, e, t);
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
Ko.InputItems = bc;
Ko.InputTokens = Pc;
var xc = class extends D {
  retrieve(e, t) {
    return this._client.get(w`/skills/${e}/content`, {
      ...t,
      headers: N([{ Accept: "application/binary" }, t?.headers]),
      __binaryResponse: !0
    });
  }
}, Mc = class extends D {
  retrieve(e, t, n) {
    const { skill_id: o } = t;
    return this._client.get(w`/skills/${o}/versions/${e}/content`, {
      ...n,
      headers: N([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
}, Ui = class extends D {
  constructor() {
    super(...arguments), this.content = new Mc(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(w`/skills/${e}/versions`, Oo({
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
Ui.Content = Mc;
var Yo = class extends D {
  constructor() {
    super(...arguments), this.content = new xc(this._client), this.versions = new Ui(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", Oo({
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
Yo.Content = xc;
Yo.Versions = Ui;
var Nc = class extends D {
  create(e, t, n) {
    return this._client.post(w`/uploads/${e}/parts`, Ue({
      body: t,
      ...n
    }, this._client));
  }
}, $i = class extends D {
  constructor() {
    super(...arguments), this.parts = new Nc(this._client);
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
$i.Parts = Nc;
var ap = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((s) => s.status === "rejected");
  if (n.length) {
    for (const s of n) console.error(s.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const o = [];
  for (const s of t) s.status === "fulfilled" && o.push(s.value);
  return o;
}, kc = class extends D {
  create(e, t, n) {
    return this._client.post(w`/vector_stores/${e}/file_batches`, {
      body: t,
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.get(w`/vector_stores/${o}/file_batches/${e}`, {
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  cancel(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.post(w`/vector_stores/${o}/file_batches/${e}/cancel`, {
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t);
    return await this.poll(e, o.id, n);
  }
  listFiles(e, t, n) {
    const { vector_store_id: o, ...s } = t;
    return this._client.getAPIList(w`/vector_stores/${o}/file_batches/${e}/files`, K, {
      query: s,
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async poll(e, t, n) {
    const o = N([n?.headers, {
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
          await bn(a);
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
    async function d(h) {
      for (let f of h) {
        const p = await a.files.create({
          file: f,
          purpose: "assistants"
        }, o);
        c.push(p.id);
      }
    }
    return await ap(Array(i).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, Dc = class extends D {
  create(e, t, n) {
    return this._client.post(w`/vector_stores/${e}/files`, {
      body: t,
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.get(w`/vector_stores/${o}/files/${e}`, {
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vector_store_id: o, ...s } = t;
    return this._client.post(w`/vector_stores/${o}/files/${e}`, {
      body: s,
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(w`/vector_stores/${e}/files`, K, {
      query: t,
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.delete(w`/vector_stores/${o}/files/${e}`, {
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t, n);
    return await this.poll(e, o.id, n);
  }
  async poll(e, t, n) {
    const o = N([n?.headers, {
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
          await bn(a);
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
    return this._client.getAPIList(w`/vector_stores/${o}/files/${e}/content`, qo, {
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, zo = class extends D {
  constructor() {
    super(...arguments), this.files = new Dc(this._client), this.fileBatches = new kc(this._client);
  }
  create(e, t) {
    return this._client.post("/vector_stores", {
      body: e,
      ...t,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  retrieve(e, t) {
    return this._client.get(w`/vector_stores/${e}`, {
      ...t,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  update(e, t, n) {
    return this._client.post(w`/vector_stores/${e}`, {
      body: t,
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/vector_stores", K, {
      query: e,
      ...t,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(w`/vector_stores/${e}`, {
      ...t,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  search(e, t, n) {
    return this._client.getAPIList(w`/vector_stores/${e}/search`, qo, {
      body: t,
      method: "post",
      ...n,
      headers: N([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
};
zo.Files = Dc;
zo.FileBatches = kc;
var Lc = class extends D {
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
      headers: N([{ Accept: "application/binary" }, n?.headers]),
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
    return this._client.post(w`/videos/${e}/remix`, Oo({
      body: t,
      ...n
    }, this._client));
  }
}, wt, Uc, _o, $c = class extends D {
  constructor() {
    super(...arguments), wt.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, o = 300) {
    return await this.verifySignature(e, t, n, o), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, o = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    T(this, wt, "m", Uc).call(this, n);
    const s = N([t]).values, i = T(this, wt, "m", _o).call(this, s, "webhook-signature"), a = T(this, wt, "m", _o).call(this, s, "webhook-timestamp"), u = T(this, wt, "m", _o).call(this, s, "webhook-id"), c = parseInt(a, 10);
    if (isNaN(c)) throw new sn("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > o) throw new sn("Webhook timestamp is too old");
    if (c > d + o) throw new sn("Webhook timestamp is too new");
    const h = i.split(" ").map((g) => g.startsWith("v1,") ? g.substring(3) : g), f = n.startsWith("whsec_") ? Buffer.from(n.replace("whsec_", ""), "base64") : Buffer.from(n, "utf-8"), p = u ? `${u}.${a}.${e}` : `${a}.${e}`, m = await crypto.subtle.importKey("raw", f, {
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
wt = /* @__PURE__ */ new WeakSet(), Uc = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, _o = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const o = t.get(n);
  if (o == null) throw new Error(`Missing required header: ${n}`);
  return o;
};
var Os, Fi, yo, Fc, ds = "workload-identity-auth", V = class {
  constructor({ baseURL: e = gt("OPENAI_BASE_URL"), apiKey: t = gt("OPENAI_API_KEY"), organization: n = gt("OPENAI_ORG_ID") ?? null, project: o = gt("OPENAI_PROJECT_ID") ?? null, webhookSecret: s = gt("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: i, ...a } = {}) {
    if (Os.add(this), yo.set(this, void 0), this.completions = new cc(this), this.chat = new Ci(this), this.embeddings = new hc(this), this.files = new mc(this), this.images = new Ec(this), this.audio = new xn(this), this.moderations = new wc(this), this.models = new Sc(this), this.fineTuning = new Dt(this), this.graders = new Li(this), this.vectorStores = new zo(this), this.webhooks = new $c(this), this.beta = new kt(this), this.batches = new nc(this), this.uploads = new $i(this), this.responses = new Ko(this), this.realtime = new Wo(this), this.conversations = new Pi(this), this.evals = new Mi(this), this.containers = new bi(this), this.skills = new Yo(this), this.videos = new Lc(this), i) {
      if (t && t !== ds) throw new L("The `apiKey` and `workloadIdentity` arguments are mutually exclusive; only one can be passed at a time.");
      t = ds;
    } else if (t === void 0) throw new L("Missing credentials. Please pass an `apiKey`, `workloadIdentity`, or set the `OPENAI_API_KEY` environment variable.");
    const u = {
      apiKey: t,
      organization: n,
      project: o,
      webhookSecret: s,
      workloadIdentity: i,
      ...a,
      baseURL: e || "https://api.openai.com/v1"
    };
    if (!u.dangerouslyAllowBrowser && eh()) throw new L(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = u.baseURL, this.timeout = u.timeout ?? Fi.DEFAULT_TIMEOUT, this.logger = u.logger ?? console;
    const c = "warn";
    this.logLevel = c, this.logLevel = mr(u.logLevel, "ClientOptions.logLevel", this) ?? mr(gt("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? c, this.fetchOptions = u.fetchOptions, this.maxRetries = u.maxRetries ?? 2, this.fetch = u.fetch ?? vu(), F(this, yo, ih, "f"), this._options = u, i && (this._workloadIdentityAuth = new wh(i, this.fetch)), this.apiKey = typeof t == "string" ? t : "Missing Key", this.organization = n, this.project = o, this.webhookSecret = s;
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
    return N([{ Authorization: `Bearer ${this.apiKey}` }]);
  }
  stringifyQuery(e) {
    return dh(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Et}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${ru()}`;
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
    const o = !T(this, Os, "m", Fc).call(this) && n || this.baseURL, s = Xf(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), a = Object.fromEntries(s.searchParams);
    return (!sr(i) || !sr(a)) && (t = {
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
    return new xu(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const o = await e, s = o.maxRetries ?? this.maxRetries;
    t == null && (t = s), await this.prepareOptions(o);
    const { req: i, url: a, timeout: u } = await this.buildRequest(o, { retryCount: s - t });
    await this.prepareRequest(i, {
      url: a,
      options: o
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, h = Date.now();
    if (se(this).debug(`[${c}] sending request`, rt({
      retryOfRequestLogID: n,
      method: o.method,
      url: a,
      options: o,
      headers: i.headers
    })), o.signal?.aborted) throw new Ie();
    const f = new AbortController(), p = await this.fetchWithAuth(a, i, u, f).catch(Rs), m = Date.now();
    if (p instanceof globalThis.Error) {
      const _ = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new Ie();
      const y = As(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (t)
        return se(this).info(`[${c}] connection ${y ? "timed out" : "failed"} - ${_}`), se(this).debug(`[${c}] connection ${y ? "timed out" : "failed"} (${_})`, rt({
          retryOfRequestLogID: n,
          url: a,
          durationMs: m - h,
          message: p.message
        })), this.retryRequest(o, t, n ?? c);
      throw se(this).info(`[${c}] connection ${y ? "timed out" : "failed"} - error; no more retries left`), se(this).debug(`[${c}] connection ${y ? "timed out" : "failed"} (error; no more retries left)`, rt({
        retryOfRequestLogID: n,
        url: a,
        durationMs: m - h,
        message: p.message
      })), p instanceof _u || p instanceof Yf ? p : y ? new _i() : new Go({ cause: p });
    }
    const g = `[${c}${d}${[...p.headers.entries()].filter(([_]) => _ === "x-request-id").map(([_, y]) => ", " + _ + ": " + JSON.stringify(y)).join("")}] ${i.method} ${a} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - h}ms`;
    if (!p.ok) {
      if (p.status === 401 && this._workloadIdentityAuth && !o.__metadata?.hasStreamingBody && !o.__metadata?.workloadIdentityTokenRefreshed)
        return await lr(p.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
          ...o,
          __metadata: {
            ...o.__metadata,
            workloadIdentityTokenRefreshed: !0
          }
        }, t, n ?? c);
      const _ = await this.shouldRetry(p);
      if (t && _) {
        const R = `retrying, ${t} attempts remaining`;
        return await lr(p.body), se(this).info(`${g} - ${R}`), se(this).debug(`[${c}] response error (${R})`, rt({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: m - h
        })), this.retryRequest(o, t, n ?? c, p.headers);
      }
      const y = _ ? "error; no more retries left" : "error; not retryable";
      se(this).info(`${g} - ${y}`);
      const I = await p.text().catch((R) => Rs(R).message), S = jf(I), A = S ? void 0 : I;
      throw se(this).debug(`[${c}] response error (${y})`, rt({
        retryOfRequestLogID: n,
        url: p.url,
        status: p.status,
        headers: p.headers,
        message: A,
        durationMs: Date.now() - h
      })), this.makeStatusError(p.status, S, A, p.headers);
    }
    return se(this).info(g), se(this).debug(`[${c}] response start`, rt({
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
    return new Th(this, n, e);
  }
  async fetchWithAuth(e, t, n, o) {
    if (this._workloadIdentityAuth) {
      const s = t.headers, i = s.get("Authorization");
      if (!i || i === `Bearer ${ds}`) {
        const a = await this._workloadIdentityAuth.getToken();
        s.set("Authorization", `Bearer ${a}`);
      }
    }
    return await this.fetchWithTimeout(e, t, n, o);
  }
  async fetchWithTimeout(e, t, n, o) {
    const { signal: s, method: i, ...a } = t || {}, u = this._makeAbort(o);
    s && s.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && a.body instanceof globalThis.ReadableStream || typeof a.body == "object" && a.body !== null && Symbol.asyncIterator in a.body, h = {
      signal: o.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...a
    };
    i && (h.method = i.toUpperCase());
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
    return await bn(s), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const s = t - e;
    return Math.min(0.5 * Math.pow(2, s), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: o, path: s, query: i, defaultBaseURL: a } = n, u = this.buildURL(s, i, a);
    "timeout" in n && Zf("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    let s = {};
    this.idempotencyHeader && t !== "get" && (e.idempotencyKey || (e.idempotencyKey = this.defaultIdempotencyKey()), s[this.idempotencyHeader] = e.idempotencyKey);
    const i = N([
      s,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(o),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...sh(),
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
    const n = N([t]), o = typeof globalThis.ReadableStream < "u" && e instanceof globalThis.ReadableStream, s = !o && (typeof e == "string" || e instanceof ArrayBuffer || ArrayBuffer.isView(e) || typeof globalThis.Blob < "u" && e instanceof globalThis.Blob || e instanceof URLSearchParams || e instanceof FormData);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || o ? {
      bodyHeaders: void 0,
      body: e,
      isStreamingBody: !s
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: Eu(e),
      isStreamingBody: !0
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e),
      isStreamingBody: !1
    } : {
      ...T(this, yo, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
Fi = V, yo = /* @__PURE__ */ new WeakMap(), Os = /* @__PURE__ */ new WeakSet(), Fc = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
V.OpenAI = Fi;
V.DEFAULT_TIMEOUT = 6e5;
V.OpenAIError = L;
V.APIError = re;
V.APIConnectionError = Go;
V.APIConnectionTimeoutError = _i;
V.APIUserAbortError = Ie;
V.NotFoundError = cu;
V.ConflictError = du;
V.RateLimitError = hu;
V.BadRequestError = au;
V.AuthenticationError = lu;
V.InternalServerError = pu;
V.PermissionDeniedError = uu;
V.UnprocessableEntityError = fu;
V.InvalidWebhookSignatureError = sn;
V.toFile = bh;
V.Completions = cc;
V.Chat = Ci;
V.Embeddings = hc;
V.Files = mc;
V.Images = Ec;
V.Audio = xn;
V.Moderations = wc;
V.Models = Sc;
V.FineTuning = Dt;
V.Graders = Li;
V.VectorStores = zo;
V.Webhooks = $c;
V.Beta = kt;
V.Batches = nc;
V.Uploads = $i;
V.Responses = Ko;
V.Realtime = Wo;
V.Conversations = Pi;
V.Evals = Mi;
V.Containers = bi;
V.Skills = Yo;
V.Videos = Lc;
function lp(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function up(e = "") {
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
function Dr(e) {
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
function cp(e) {
  const t = /* @__PURE__ */ new Map(), n = [];
  for (const o of e.messages || []) {
    if (o.role === "assistant" && Array.isArray(o.tool_calls) && o.tool_calls.length) {
      const s = o.tool_calls.map((i, a) => {
        const u = i.function?.name || "", c = i.id || `tool-call-${a + 1}`;
        return u && t.set(c, u), `<<TOOL_CALL>>${JSON.stringify({
          id: c,
          name: u,
          arguments: lp(i.function?.arguments || "{}")
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
    content: Dr(e)
  }) : n[0] = {
    ...n[0],
    content: Dr({
      ...e,
      systemPrompt: n[0].content || e.systemPrompt
    })
  }, n;
}
var dp = class {
  constructor(e) {
    this.config = e, this.client = new V({
      apiKey: e.apiKey,
      baseURL: String(e.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 18e4,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  async chat(e) {
    const t = (this.config.toolMode || "native") === "tagged-json", n = await this.client.chat.completions.create({
      model: this.config.model,
      messages: t ? cp(e) : e.messages,
      tools: t ? void 0 : e.tools,
      tool_choice: t ? void 0 : e.toolChoice || "auto",
      temperature: e.temperature,
      max_tokens: e.maxTokens
    }, { signal: e.signal }), o = n.choices?.[0] || {}, s = o.message || {}, i = (s.tool_calls || []).map((c) => ({
      id: c.id || `openai-tool-${Date.now()}`,
      name: c.function?.name || "",
      arguments: c.function?.arguments || "{}"
    })).filter((c) => c.name), a = i.length ? [] : up(s.content || ""), u = [...i, ...a];
    return {
      text: i.length ? s.content || "" : (s.content || "").replace(/<<TOOL_CALL>>[\s\S]*?<<\/TOOL_CALL>>/g, "").replace(/<tool_call>[\s\S]*?<\/tool_call>/g, "").trim(),
      toolCalls: u,
      finishReason: o.finish_reason || "stop",
      model: n.model || this.config.model,
      provider: "openai-compatible"
    };
  }
};
function fp(e, t) {
  return {
    type: "message",
    role: e,
    content: [{
      type: "input_text",
      text: t
    }]
  };
}
function Lr(e) {
  return {
    type: "message",
    role: "assistant",
    status: "completed",
    content: [{
      type: "output_text",
      text: e
    }]
  };
}
function hp(e) {
  const t = [];
  for (const n of e.messages || []) {
    if (n.role === "tool") {
      t.push({
        type: "function_call_output",
        call_id: n.tool_call_id || "missing_tool_call_id",
        output: n.content
      });
      continue;
    }
    if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
      n.content?.trim() && t.push(Lr(n.content)), n.tool_calls.forEach((o, s) => {
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
      t.push(Lr(n.content || ""));
      continue;
    }
    t.push(fp(n.role, n.content || ""));
  }
  return t;
}
var pp = class {
  constructor(e) {
    this.config = e, this.client = new V({
      apiKey: e.apiKey,
      baseURL: String(e.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 18e4,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  async chat(e) {
    const t = {
      model: this.config.model,
      input: hp(e),
      max_output_tokens: e.maxTokens,
      temperature: e.temperature,
      tools: (e.tools || []).map((i) => ({
        type: "function",
        name: i.function.name,
        description: i.function.description,
        parameters: i.function.parameters
      }))
    }, n = await this.client.responses.create(t, { signal: e.signal }), o = Array.isArray(n.output) ? n.output : [], s = o.filter((i) => i.type === "function_call" && i.name).map((i, a) => ({
      id: i.call_id || `response-tool-${a + 1}`,
      name: i.name || "",
      arguments: i.arguments || "{}"
    }));
    return {
      text: n.output_text || o.flatMap((i) => i.content || []).map((i) => i.text || "").join(`
`),
      toolCalls: s,
      finishReason: n.incomplete_details?.reason || n.status || "stop",
      model: n.model || this.config.model,
      provider: "openai-responses"
    };
  }
};
function M(e, t, n, o, s) {
  if (o === "m") throw new TypeError("Private method is not writable");
  if (o === "a" && !s) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !s : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return o === "a" ? s.call(e, n) : s ? s.value = n : t.set(e, n), n;
}
function v(e, t, n, o) {
  if (n === "a" && !o) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !o : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? o : n === "a" ? o.call(e) : o ? o.value : t.get(e);
}
var Gc = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Gc = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function An(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Vs = (e) => {
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
}, Ee = class Hs extends B {
  constructor(t, n, o, s, i) {
    super(`${Hs.makeMessage(t, n, o)}`), this.status = t, this.headers = s, this.requestID = s?.get("request-id"), this.error = n, this.type = i ?? null;
  }
  static makeMessage(t, n, o) {
    const s = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && s ? `${t} ${s}` : t ? `${t} status code (no body)` : s || "(no status code or body)";
  }
  static generate(t, n, o, s) {
    if (!t || !s) return new Xo({
      message: o,
      cause: Vs(n)
    });
    const i = n, a = i?.error?.type;
    return t === 400 ? new qc(t, i, o, s, a) : t === 401 ? new Oc(t, i, o, s, a) : t === 403 ? new Vc(t, i, o, s, a) : t === 404 ? new Hc(t, i, o, s, a) : t === 409 ? new Jc(t, i, o, s, a) : t === 422 ? new Wc(t, i, o, s, a) : t === 429 ? new Kc(t, i, o, s, a) : t >= 500 ? new Yc(t, i, o, s, a) : new Hs(t, i, o, s, a);
  }
}, xe = class extends Ee {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Xo = class extends Ee {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Bc = class extends Xo {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, qc = class extends Ee {
}, Oc = class extends Ee {
}, Vc = class extends Ee {
}, Hc = class extends Ee {
}, Jc = class extends Ee {
}, Wc = class extends Ee {
}, Kc = class extends Ee {
}, Yc = class extends Ee {
}, mp = /^[a-z][a-z0-9+.-]*:/i, gp = (e) => mp.test(e), Js = (e) => (Js = Array.isArray, Js(e)), Ur = Js;
function Ws(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function $r(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function _p(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var yp = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new B(`${e} must be an integer`);
  if (t < 0) throw new B(`${e} must be a positive integer`);
  return t;
}, zc = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, vp = (e) => new Promise((t) => setTimeout(t, e)), It = "0.89.0", Tp = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function Ep() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var Sp = () => {
  const e = Ep();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": It,
    "X-Stainless-OS": Gr(Deno.build.os),
    "X-Stainless-Arch": Fr(Deno.build.arch),
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
    "X-Stainless-OS": Gr(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": Fr(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = wp();
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
function wp() {
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
var Fr = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Gr = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), Br, Ip = () => Br ?? (Br = Sp());
function Cp() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Xc(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Qc(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Xc({
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
function Gi(e) {
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
async function Ap(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var Rp = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function bp(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new B(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function Pp(e) {
  let t = 0;
  for (const s of e) t += s.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const s of e)
    n.set(s, o), o += s.length;
  return n;
}
var qr;
function Bi(e) {
  let t;
  return (qr ?? (t = new globalThis.TextEncoder(), qr = t.encode.bind(t)))(e);
}
var Or;
function Vr(e) {
  let t;
  return (Or ?? (t = new globalThis.TextDecoder(), Or = t.decode.bind(t)))(e);
}
var ye, ve, Mn = class {
  constructor() {
    ye.set(this, void 0), ve.set(this, void 0), M(this, ye, new Uint8Array(), "f"), M(this, ve, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Bi(e) : e;
    M(this, ye, Pp([v(this, ye, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = xp(v(this, ye, "f"), v(this, ve, "f"))) != null; ) {
      if (o.carriage && v(this, ve, "f") == null) {
        M(this, ve, o.index, "f");
        continue;
      }
      if (v(this, ve, "f") != null && (o.index !== v(this, ve, "f") + 1 || o.carriage)) {
        n.push(Vr(v(this, ye, "f").subarray(0, v(this, ve, "f") - 1))), M(this, ye, v(this, ye, "f").subarray(v(this, ve, "f")), "f"), M(this, ve, null, "f");
        continue;
      }
      const s = v(this, ve, "f") !== null ? o.preceding - 1 : o.preceding, i = Vr(v(this, ye, "f").subarray(0, s));
      n.push(i), M(this, ye, v(this, ye, "f").subarray(o.index), "f"), M(this, ve, null, "f");
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
function xp(e, t) {
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
function Mp(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var No = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Hr = (e, t, n) => {
  if (e) {
    if (_p(No, e)) return e;
    ue(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(No))}`);
  }
};
function mn() {
}
function Vn(e, t, n) {
  return !t || No[e] > No[n] ? mn : t[e].bind(t);
}
var Np = {
  error: mn,
  warn: mn,
  info: mn,
  debug: mn
}, Jr = /* @__PURE__ */ new WeakMap();
function ue(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return Np;
  const o = Jr.get(t);
  if (o && o[0] === n) return o[1];
  const s = {
    error: Vn("error", t, n),
    warn: Vn("warn", t, n),
    info: Vn("info", t, n),
    debug: Vn("debug", t, n)
  };
  return Jr.set(t, [n, s]), s;
}
var at = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), qt, Rn = class gn {
  constructor(t, n, o) {
    this.iterator = t, qt.set(this, void 0), this.controller = n, M(this, qt, o, "f");
  }
  static fromSSEResponse(t, n, o) {
    let s = !1;
    const i = o ? ue(o) : console;
    async function* a() {
      if (s) throw new B("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      s = !0;
      let u = !1;
      try {
        for await (const c of kp(t, n)) {
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
            const d = zc(c.data) ?? c.data, h = d?.error?.type;
            throw new Ee(void 0, d, void 0, t.headers, h);
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
    return new gn(a, n, o);
  }
  static fromReadableStream(t, n, o) {
    let s = !1;
    async function* i() {
      const u = new Mn(), c = Gi(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
      for (const d of u.flush()) yield d;
    }
    async function* a() {
      if (s) throw new B("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      s = !0;
      let u = !1;
      try {
        for await (const c of i())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (An(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new gn(a, n, o);
  }
  [(qt = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new gn(() => s(t), this.controller, v(this, qt, "f")), new gn(() => s(n), this.controller, v(this, qt, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Xc({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: s, done: i } = await n.next();
          if (i) return o.close();
          const a = Bi(JSON.stringify(s) + `
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
async function* kp(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new B("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new B("Attempted to iterate over a response with no body");
  const n = new Lp(), o = new Mn(), s = Gi(e.body);
  for await (const i of Dp(s)) for (const a of o.decode(i)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const i of o.flush()) {
    const a = n.decode(i);
    a && (yield a);
  }
}
async function* Dp(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Bi(n) : n;
    let s = new Uint8Array(t.length + o.length);
    s.set(t), s.set(o, t.length), t = s;
    let i;
    for (; (i = Mp(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var Lp = class {
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
    let [t, n, o] = Up(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function Up(e, t) {
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
async function Zc(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: s, startTime: i } = t, a = await (async () => {
    if (t.options.stream)
      return ue(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : Rn.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : jc(await n.json(), n) : await n.text();
  })();
  return ue(e).debug(`[${o}] response parsed`, at({
    retryOfRequestLogID: s,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
function jc(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("request-id"),
    enumerable: !1
  });
}
var _n, ed = class td extends Promise {
  constructor(t, n, o = Zc) {
    super((s) => {
      s(null);
    }), this.responsePromise = n, this.parseResponse = o, _n.set(this, void 0), M(this, _n, t, "f");
  }
  _thenUnwrap(t) {
    return new td(v(this, _n, "f"), this.responsePromise, async (n, o) => jc(t(await this.parseResponse(n, o), o), o.response));
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
var Hn, nd = class {
  constructor(e, t, n, o) {
    Hn.set(this, void 0), M(this, Hn, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new B("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await v(this, Hn, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(Hn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, $p = class extends ed {
  constructor(e, t, n) {
    super(e, t, async (o, s) => new n(o, s.response, await Zc(o, s), s.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, Nn = class extends nd {
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
          ...Ws(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...Ws(this.options.query),
        after_id: e
      }
    } : null;
  }
}, $e = class extends nd {
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
        ...Ws(this.options.query),
        page: e
      }
    } : null;
  }
}, od = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Pt(e, t, n) {
  return od(), new File(e, t ?? "unknown_file", n);
}
function vo(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var sd = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", qi = async (e, t, n = !0) => ({
  ...e,
  body: await Gp(e.body, t, n)
}), Wr = /* @__PURE__ */ new WeakMap();
function Fp(e) {
  const t = typeof e == "function" ? e : e.fetch, n = Wr.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const s = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new s(i).text();
    } catch {
      return !0;
    }
  })();
  return Wr.set(t, o), o;
}
var Gp = async (e, t, n = !0) => {
  if (!await Fp(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const o = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([s, i]) => Ks(o, s, i, n))), o;
}, Bp = (e) => e instanceof Blob && "name" in e, Ks = async (e, t, n, o) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let s = {};
      const i = n.headers.get("Content-Type");
      i && (s = { type: i }), e.append(t, Pt([await n.blob()], vo(n, o), s));
    } else if (sd(n)) e.append(t, Pt([await new Response(Qc(n)).blob()], vo(n, o)));
    else if (Bp(n)) e.append(t, Pt([n], vo(n, o), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((s) => Ks(e, t + "[]", s, o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([s, i]) => Ks(e, `${t}[${s}]`, i, o)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, id = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", qp = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && id(e), Op = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function Vp(e, t, n) {
  if (od(), e = await e, t || (t = vo(e, !0)), qp(e))
    return e instanceof File && t == null && n == null ? e : Pt([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if (Op(e)) {
    const s = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Pt(await Ys(s), t, n);
  }
  const o = await Ys(e);
  if (!n?.type) {
    const s = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof s == "string" && (n = {
      ...n,
      type: s
    });
  }
  return Pt(o, t, n);
}
async function Ys(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (id(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (sd(e)) for await (const n of e) t.push(...await Ys(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${Hp(e)}`);
  }
  return t;
}
function Hp(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var ee = class {
  constructor(e) {
    this._client = e;
  }
}, rd = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* Jp(e) {
  if (!e) return;
  if (rd in e) {
    const { values: o, nulls: s } = e;
    yield* o.entries();
    for (const i of s) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Ur(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const s = o[0];
    if (typeof s != "string") throw new TypeError("expected header name to be a string");
    const i = Ur(o[1]) ? o[1] : [o[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [s, null]), yield [s, u]);
  }
}
var x = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const s = /* @__PURE__ */ new Set();
    for (const [i, a] of Jp(o)) {
      const u = i.toLowerCase();
      s.has(u) || (t.delete(i), s.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [rd]: !0,
    values: t,
    nulls: n
  };
};
function ad(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Kr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Wp = (e = ad) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let s = !1;
  const i = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (s = !0);
    const m = o[p];
    let g = (s ? encodeURIComponent : e)("" + m);
    return p !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? Kr) ?? Kr)?.toString) && (g = m + "", i.push({
      start: h.length + f.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === o.length ? "" : g);
  }, ""), u = a.split(/[?#]/, 1)[0], c = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) i.push({
    start: d.index,
    length: d[0].length,
    error: `Value "${d[0]}" can't be safely passed as a path parameter`
  });
  if (i.sort((h, f) => h.start - f.start), i.length > 0) {
    let h = 0;
    const f = i.reduce((p, m) => {
      const g = " ".repeat(m.start - h), _ = "^".repeat(m.length);
      return h = m.start + m.length, p + g + _;
    }, "");
    throw new B(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}, G = /* @__PURE__ */ Wp(ad), ld = class extends ee {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/environments?beta=true", {
      body: o,
      ...t,
      headers: x([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(G`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(G`/v1/environments/${e}?beta=true`, {
      body: s,
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/environments?beta=true", $e, {
      query: o,
      ...t,
      headers: x([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(G`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(G`/v1/environments/${e}/archive?beta=true`, {
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, wn = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function To(e) {
  return typeof e == "object" && e !== null && wn in e;
}
function ud(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const o of e) To(o) && n.add(o[wn]);
  if (t) {
    for (const o of t)
      if (To(o) && n.add(o[wn]), Array.isArray(o.content))
        for (const s of o.content) To(s) && n.add(s[wn]);
  }
  return Array.from(n);
}
function cd(e, t) {
  const n = ud(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function Kp(e) {
  return To(e) ? { "x-stainless-helper": e[wn] } : {};
}
var dd = class extends ee {
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/files", Nn, {
      query: o,
      ...t,
      headers: x([{ "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(G`/v1/files/${e}`, {
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  download(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(G`/v1/files/${e}/content`, {
      ...n,
      headers: x([{
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
      headers: x([{ "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  upload(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/files", qi({
      body: o,
      ...t,
      headers: x([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        Kp(o.file),
        t?.headers
      ])
    }, this._client));
  }
}, fd = class extends ee {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(G`/v1/models/${e}?beta=true`, {
      ...n,
      headers: x([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", Nn, {
      query: o,
      ...t,
      headers: x([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, hd = class extends ee {
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(G`/v1/agents/${e}/versions?beta=true`, $e, {
      query: s,
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Oi = class extends ee {
  constructor() {
    super(...arguments), this.versions = new hd(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/agents?beta=true", {
      body: o,
      ...t,
      headers: x([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.get(G`/v1/agents/${e}?beta=true`, {
      query: s,
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(G`/v1/agents/${e}?beta=true`, {
      body: s,
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/agents?beta=true", $e, {
      query: o,
      ...t,
      headers: x([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(G`/v1/agents/${e}/archive?beta=true`, {
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Oi.Versions = hd;
var pd = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};
function md(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function Yr(e, t, n) {
  const o = md(t);
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
  } : gd(e, t, n);
}
function gd(e, t, n) {
  let o = null;
  const s = e.content.map((i) => {
    if (i.type === "text") {
      const a = Yp(t, i.text);
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
function Yp(e, t) {
  const n = md(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new B(`Failed to parse structured output: ${o}`);
  }
}
var zp = (e) => {
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
}, Xp = (e) => {
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
}, Qp = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, _d = (e) => JSON.parse(Qp(Xp(Ct(zp(e))))), Se, Xe, yt, Ot, Jn, Vt, Ht, Wn, Jt, qe, Wt, Kn, Yn, ot, zn, Xn, Kt, fs, zr, Qn, hs, ps, ms, Xr, Qr = "__json_buf";
function Zr(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var Zp = class zs {
  constructor(t, n) {
    Se.add(this), this.messages = [], this.receivedMessages = [], Xe.set(this, void 0), yt.set(this, null), this.controller = new AbortController(), Ot.set(this, void 0), Jn.set(this, () => {
    }), Vt.set(this, () => {
    }), Ht.set(this, void 0), Wn.set(this, () => {
    }), Jt.set(this, () => {
    }), qe.set(this, {}), Wt.set(this, !1), Kn.set(this, !1), Yn.set(this, !1), ot.set(this, !1), zn.set(this, void 0), Xn.set(this, void 0), Kt.set(this, void 0), Qn.set(this, (o) => {
      if (M(this, Kn, !0, "f"), An(o) && (o = new xe()), o instanceof xe)
        return M(this, Yn, !0, "f"), this._emit("abort", o);
      if (o instanceof B) return this._emit("error", o);
      if (o instanceof Error) {
        const s = new B(o.message);
        return s.cause = o, this._emit("error", s);
      }
      return this._emit("error", new B(String(o)));
    }), M(this, Ot, new Promise((o, s) => {
      M(this, Jn, o, "f"), M(this, Vt, s, "f");
    }), "f"), M(this, Ht, new Promise((o, s) => {
      M(this, Wn, o, "f"), M(this, Jt, s, "f");
    }), "f"), v(this, Ot, "f").catch(() => {
    }), v(this, Ht, "f").catch(() => {
    }), M(this, yt, t, "f"), M(this, Kt, n?.logger ?? console, "f");
  }
  get response() {
    return v(this, zn, "f");
  }
  get request_id() {
    return v(this, Xn, "f");
  }
  async withResponse() {
    M(this, ot, !0, "f");
    const t = await v(this, Ot, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new zs(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, o, { logger: s } = {}) {
    const i = new zs(n, { logger: s });
    for (const a of n.messages) i._addMessageParam(a);
    return M(i, yt, {
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
    }, v(this, Qn, "f"));
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
      v(this, Se, "m", hs).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) v(this, Se, "m", ps).call(this, c);
      if (u.controller.signal?.aborted) throw new xe();
      v(this, Se, "m", ms).call(this);
    } finally {
      s && i && s.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (M(this, zn, t, "f"), M(this, Xn, t?.headers.get("request-id"), "f"), v(this, Jn, "f").call(this, t), this._emit("connect"));
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
    const s = o.findIndex((i) => i.listener === n);
    return s >= 0 && o.splice(s, 1), this;
  }
  once(t, n) {
    return (v(this, qe, "f")[t] || (v(this, qe, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      M(this, ot, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    M(this, ot, !0, "f"), await v(this, Ht, "f");
  }
  get currentMessage() {
    return v(this, Xe, "f");
  }
  async finalMessage() {
    return await this.done(), v(this, Se, "m", fs).call(this);
  }
  async finalText() {
    return await this.done(), v(this, Se, "m", zr).call(this);
  }
  _emit(t, ...n) {
    if (v(this, Wt, "f")) return;
    t === "end" && (M(this, Wt, !0, "f"), v(this, Wn, "f").call(this));
    const o = v(this, qe, "f")[t];
    if (o && (v(this, qe, "f")[t] = o.filter((s) => !s.once), o.forEach(({ listener: s }) => s(...n))), t === "abort") {
      const s = n[0];
      !v(this, ot, "f") && !o?.length && Promise.reject(s), v(this, Vt, "f").call(this, s), v(this, Jt, "f").call(this, s), this._emit("end");
      return;
    }
    if (t === "error") {
      const s = n[0];
      !v(this, ot, "f") && !o?.length && Promise.reject(s), v(this, Vt, "f").call(this, s), v(this, Jt, "f").call(this, s), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", v(this, Se, "m", fs).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let s;
    o && (o.aborted && this.controller.abort(), s = this.controller.abort.bind(this.controller), o.addEventListener("abort", s));
    try {
      v(this, Se, "m", hs).call(this), this._connected(null);
      const i = Rn.fromReadableStream(t, this.controller);
      for await (const a of i) v(this, Se, "m", ps).call(this, a);
      if (i.controller.signal?.aborted) throw new xe();
      v(this, Se, "m", ms).call(this);
    } finally {
      o && s && o.removeEventListener("abort", s);
    }
  }
  [(Xe = /* @__PURE__ */ new WeakMap(), yt = /* @__PURE__ */ new WeakMap(), Ot = /* @__PURE__ */ new WeakMap(), Jn = /* @__PURE__ */ new WeakMap(), Vt = /* @__PURE__ */ new WeakMap(), Ht = /* @__PURE__ */ new WeakMap(), Wn = /* @__PURE__ */ new WeakMap(), Jt = /* @__PURE__ */ new WeakMap(), qe = /* @__PURE__ */ new WeakMap(), Wt = /* @__PURE__ */ new WeakMap(), Kn = /* @__PURE__ */ new WeakMap(), Yn = /* @__PURE__ */ new WeakMap(), ot = /* @__PURE__ */ new WeakMap(), zn = /* @__PURE__ */ new WeakMap(), Xn = /* @__PURE__ */ new WeakMap(), Kt = /* @__PURE__ */ new WeakMap(), Qn = /* @__PURE__ */ new WeakMap(), Se = /* @__PURE__ */ new WeakSet(), fs = function() {
    if (this.receivedMessages.length === 0) throw new B("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, zr = function() {
    if (this.receivedMessages.length === 0) throw new B("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new B("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, hs = function() {
    this.ended || M(this, Xe, void 0, "f");
  }, ps = function(n) {
    if (this.ended) return;
    const o = v(this, Se, "m", Xr).call(this, n);
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
            Zr(s) && s.input && this._emit("inputJson", n.delta.partial_json, s.input);
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
        this._addMessageParam(o), this._addMessage(Yr(o, v(this, yt, "f"), { logger: v(this, Kt, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        M(this, Xe, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, ms = function() {
    if (this.ended) throw new B("stream has ended, this shouldn't happen");
    const n = v(this, Xe, "f");
    if (!n) throw new B("request ended without sending any chunks");
    return M(this, Xe, void 0, "f"), Yr(n, v(this, yt, "f"), { logger: v(this, Kt, "f") });
  }, Xr = function(n) {
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
            if (s && Zr(s)) {
              let i = s[Qr] || "";
              i += n.delta.partial_json;
              const a = { ...s };
              if (Object.defineProperty(a, Qr, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i) try {
                a.input = _d(i);
              } catch (u) {
                const c = new B(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${i}`);
                v(this, Qn, "f").call(this, c);
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
    return new Rn(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
var yd = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var jp = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
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
Wrap your summary in <summary></summary> tags.`, Yt, vt, st, Q, fe, me, He, Qe, zt, jr, Xs;
function ea() {
  let e, t;
  return {
    promise: new Promise((n, o) => {
      e = n, t = o;
    }),
    resolve: e,
    reject: t
  };
}
var vd = class {
  constructor(e, t, n) {
    Yt.add(this), this.client = e, vt.set(this, !1), st.set(this, !1), Q.set(this, void 0), fe.set(this, void 0), me.set(this, void 0), He.set(this, void 0), Qe.set(this, void 0), zt.set(this, 0), M(this, Q, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const o = ["BetaToolRunner", ...ud(t.tools, t.messages)].join(", ");
    M(this, fe, {
      ...n,
      headers: x([{ "x-stainless-helper": o }, n?.headers])
    }, "f"), M(this, Qe, ea(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(vt = /* @__PURE__ */ new WeakMap(), st = /* @__PURE__ */ new WeakMap(), Q = /* @__PURE__ */ new WeakMap(), fe = /* @__PURE__ */ new WeakMap(), me = /* @__PURE__ */ new WeakMap(), He = /* @__PURE__ */ new WeakMap(), Qe = /* @__PURE__ */ new WeakMap(), zt = /* @__PURE__ */ new WeakMap(), Yt = /* @__PURE__ */ new WeakSet(), jr = async function() {
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
    const s = t.model ?? v(this, Q, "f").params.model, i = t.summaryPrompt ?? jp, a = v(this, Q, "f").params.messages;
    if (a[a.length - 1].role === "assistant") {
      const c = a[a.length - 1];
      if (Array.isArray(c.content)) {
        const d = c.content.filter((h) => h.type !== "tool_use");
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
      max_tokens: v(this, Q, "f").params.max_tokens
    }, {
      signal: v(this, fe, "f").signal,
      headers: x([v(this, fe, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (u.content[0]?.type !== "text") throw new B("Expected text response for compaction");
    return v(this, Q, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (v(this, vt, "f")) throw new B("Cannot iterate over a consumed stream");
    M(this, vt, !0, "f"), M(this, st, !0, "f"), M(this, He, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (v(this, Q, "f").params.max_iterations && v(this, zt, "f") >= v(this, Q, "f").params.max_iterations) break;
          M(this, st, !1, "f"), M(this, He, void 0, "f"), M(this, zt, (e = v(this, zt, "f"), e++, e), "f"), M(this, me, void 0, "f");
          const { max_iterations: n, compactionControl: o, ...s } = v(this, Q, "f").params;
          if (s.stream ? (t = this.client.beta.messages.stream({ ...s }, v(this, fe, "f")), M(this, me, t.finalMessage(), "f"), v(this, me, "f").catch(() => {
          }), yield t) : (M(this, me, this.client.beta.messages.create({
            ...s,
            stream: !1
          }, v(this, fe, "f")), "f"), yield v(this, me, "f")), !await v(this, Yt, "m", jr).call(this)) {
            if (!v(this, st, "f")) {
              const { role: a, content: u } = await v(this, me, "f");
              v(this, Q, "f").params.messages.push({
                role: a,
                content: u
              });
            }
            const i = await v(this, Yt, "m", Xs).call(this, v(this, Q, "f").params.messages.at(-1));
            if (i) v(this, Q, "f").params.messages.push(i);
            else if (!v(this, st, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!v(this, me, "f")) throw new B("ToolRunner concluded without a message from the server");
      v(this, Qe, "f").resolve(await v(this, me, "f"));
    } catch (t) {
      throw M(this, vt, !1, "f"), v(this, Qe, "f").promise.catch(() => {
      }), v(this, Qe, "f").reject(t), M(this, Qe, ea(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? v(this, Q, "f").params = e(v(this, Q, "f").params) : v(this, Q, "f").params = e, M(this, st, !0, "f"), M(this, He, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? M(this, fe, e(v(this, fe, "f")), "f") : M(this, fe, {
      ...v(this, fe, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = v(this, fe, "f").signal) {
    const t = await v(this, me, "f") ?? this.params.messages.at(-1);
    return t ? v(this, Yt, "m", Xs).call(this, t, e) : null;
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
Xs = async function(t, n = v(this, fe, "f").signal) {
  return v(this, He, "f") !== void 0 ? v(this, He, "f") : (M(this, He, em(v(this, Q, "f").params, t, {
    ...v(this, fe, "f"),
    signal: n
  }), "f"), v(this, He, "f"));
};
async function em(e, t = e.messages.at(-1), n) {
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
          content: a instanceof yd ? a.content : `Error: ${a instanceof Error ? a.message : String(a)}`,
          is_error: !0
        };
      }
    }))
  };
}
var Td = class Ed {
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
    return new Ed(Gi(t.body), n);
  }
}, Sd = class extends ee {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/messages/batches?beta=true", {
      body: o,
      ...t,
      headers: x([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(G`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/messages/batches?beta=true", Nn, {
      query: o,
      ...t,
      headers: x([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(G`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  cancel(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(G`/v1/messages/batches/${e}/cancel?beta=true`, {
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  async results(e, t = {}, n) {
    const o = await this.retrieve(e);
    if (!o.results_url) throw new B(`No batch \`results_url\`; Has it finished processing? ${o.processing_status} - ${o.id}`);
    const { betas: s } = t ?? {};
    return this._client.get(o.results_url, {
      ...n,
      headers: x([{
        "anthropic-beta": [...s ?? [], "message-batches-2024-09-24"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((i, a) => Td.fromResponse(a.response, a.controller));
  }
}, ta = {
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
}, tm = ["claude-opus-4-6"], kn = class extends ee {
  constructor() {
    super(...arguments), this.batches = new Sd(this._client);
  }
  create(e, t) {
    const n = na(e), { betas: o, ...s } = n;
    s.model in ta && console.warn(`The model '${s.model}' is deprecated and will reach end-of-life on ${ta[s.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), s.model in tm && s.thinking && s.thinking.type === "enabled" && console.warn(`Using Claude with ${s.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let i = this._client._options.timeout;
    if (!s.stream && i == null) {
      const u = pd[s.model] ?? void 0;
      i = this._client.calculateNonstreamingTimeout(s.max_tokens, u);
    }
    const a = cd(s.tools, s.messages);
    return this._client.post("/v1/messages?beta=true", {
      body: s,
      timeout: i ?? 6e5,
      ...t,
      headers: x([
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
      headers: x([{ "anthropic-beta": [...e.betas ?? [], "structured-outputs-2025-12-15"].toString() }, t?.headers])
    }, this.create(e, t).then((n) => gd(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Zp.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...o } = na(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: o,
      ...t,
      headers: x([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new vd(this._client, e, t);
  }
};
function na(e) {
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
kn.Batches = Sd;
kn.BetaToolRunner = vd;
kn.ToolError = yd;
var wd = class extends ee {
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(G`/v1/sessions/${e}/events?beta=true`, $e, {
      query: s,
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  send(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(G`/v1/sessions/${e}/events?beta=true`, {
      body: s,
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  stream(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(G`/v1/sessions/${e}/events/stream?beta=true`, {
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers]),
      stream: !0
    });
  }
}, Id = class extends ee {
  retrieve(e, t, n) {
    const { session_id: o, betas: s } = t;
    return this._client.get(G`/v1/sessions/${o}/resources/${e}?beta=true`, {
      ...n,
      headers: x([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { session_id: o, betas: s, ...i } = t;
    return this._client.post(G`/v1/sessions/${o}/resources/${e}?beta=true`, {
      body: i,
      ...n,
      headers: x([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(G`/v1/sessions/${e}/resources?beta=true`, $e, {
      query: s,
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { session_id: o, betas: s } = t;
    return this._client.delete(G`/v1/sessions/${o}/resources/${e}?beta=true`, {
      ...n,
      headers: x([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  add(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(G`/v1/sessions/${e}/resources?beta=true`, {
      body: s,
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Qo = class extends ee {
  constructor() {
    super(...arguments), this.events = new wd(this._client), this.resources = new Id(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/sessions?beta=true", {
      body: o,
      ...t,
      headers: x([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(G`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(G`/v1/sessions/${e}?beta=true`, {
      body: s,
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/sessions?beta=true", $e, {
      query: o,
      ...t,
      headers: x([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(G`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(G`/v1/sessions/${e}/archive?beta=true`, {
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Qo.Events = wd;
Qo.Resources = Id;
var Cd = class extends ee {
  create(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.post(G`/v1/skills/${e}/versions?beta=true`, qi({
      body: s,
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: o, betas: s } = t;
    return this._client.get(G`/v1/skills/${o}/versions/${e}?beta=true`, {
      ...n,
      headers: x([{ "anthropic-beta": [...s ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(G`/v1/skills/${e}/versions?beta=true`, $e, {
      query: s,
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { skill_id: o, betas: s } = t;
    return this._client.delete(G`/v1/skills/${o}/versions/${e}?beta=true`, {
      ...n,
      headers: x([{ "anthropic-beta": [...s ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
}, Vi = class extends ee {
  constructor() {
    super(...arguments), this.versions = new Cd(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.post("/v1/skills?beta=true", qi({
      body: o,
      ...t,
      headers: x([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    }, this._client, !1));
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(G`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/skills?beta=true", $e, {
      query: o,
      ...t,
      headers: x([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(G`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
};
Vi.Versions = Cd;
var Ad = class extends ee {
  create(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(G`/v1/vaults/${e}/credentials?beta=true`, {
      body: s,
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vault_id: o, betas: s } = t;
    return this._client.get(G`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      ...n,
      headers: x([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vault_id: o, betas: s, ...i } = t;
    return this._client.post(G`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      body: i,
      ...n,
      headers: x([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(G`/v1/vaults/${e}/credentials?beta=true`, $e, {
      query: s,
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vault_id: o, betas: s } = t;
    return this._client.delete(G`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      ...n,
      headers: x([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t, n) {
    const { vault_id: o, betas: s } = t;
    return this._client.post(G`/v1/vaults/${o}/credentials/${e}/archive?beta=true`, {
      ...n,
      headers: x([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Hi = class extends ee {
  constructor() {
    super(...arguments), this.credentials = new Ad(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/vaults?beta=true", {
      body: o,
      ...t,
      headers: x([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(G`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(G`/v1/vaults/${e}?beta=true`, {
      body: s,
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/vaults?beta=true", $e, {
      query: o,
      ...t,
      headers: x([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(G`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(G`/v1/vaults/${e}/archive?beta=true`, {
      ...n,
      headers: x([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Hi.Credentials = Ad;
var Fe = class extends ee {
  constructor() {
    super(...arguments), this.models = new fd(this._client), this.messages = new kn(this._client), this.agents = new Oi(this._client), this.environments = new ld(this._client), this.sessions = new Qo(this._client), this.vaults = new Hi(this._client), this.files = new dd(this._client), this.skills = new Vi(this._client);
  }
};
Fe.Models = fd;
Fe.Messages = kn;
Fe.Agents = Oi;
Fe.Environments = ld;
Fe.Sessions = Qo;
Fe.Vaults = Hi;
Fe.Files = dd;
Fe.Skills = Vi;
var Rd = class extends ee {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/complete", {
      body: o,
      timeout: this._client._options.timeout ?? 6e5,
      ...t,
      headers: x([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers]),
      stream: e.stream ?? !1
    });
  }
};
function bd(e) {
  return e?.output_config?.format;
}
function oa(e, t, n) {
  const o = bd(t);
  return !t || !("parse" in (o ?? {})) ? {
    ...e,
    content: e.content.map((s) => s.type === "text" ? Object.defineProperty({ ...s }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : s),
    parsed_output: null
  } : Pd(e, t, n);
}
function Pd(e, t, n) {
  let o = null;
  const s = e.content.map((i) => {
    if (i.type === "text") {
      const a = nm(t, i.text);
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
function nm(e, t) {
  const n = bd(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new B(`Failed to parse structured output: ${o}`);
  }
}
var we, Ze, Tt, Xt, Zn, Qt, Zt, jn, jt, Oe, en, eo, to, it, no, oo, tn, gs, sa, _s, ys, vs, Ts, ia, ra = "__json_buf";
function aa(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var om = class Qs {
  constructor(t, n) {
    we.add(this), this.messages = [], this.receivedMessages = [], Ze.set(this, void 0), Tt.set(this, null), this.controller = new AbortController(), Xt.set(this, void 0), Zn.set(this, () => {
    }), Qt.set(this, () => {
    }), Zt.set(this, void 0), jn.set(this, () => {
    }), jt.set(this, () => {
    }), Oe.set(this, {}), en.set(this, !1), eo.set(this, !1), to.set(this, !1), it.set(this, !1), no.set(this, void 0), oo.set(this, void 0), tn.set(this, void 0), _s.set(this, (o) => {
      if (M(this, eo, !0, "f"), An(o) && (o = new xe()), o instanceof xe)
        return M(this, to, !0, "f"), this._emit("abort", o);
      if (o instanceof B) return this._emit("error", o);
      if (o instanceof Error) {
        const s = new B(o.message);
        return s.cause = o, this._emit("error", s);
      }
      return this._emit("error", new B(String(o)));
    }), M(this, Xt, new Promise((o, s) => {
      M(this, Zn, o, "f"), M(this, Qt, s, "f");
    }), "f"), M(this, Zt, new Promise((o, s) => {
      M(this, jn, o, "f"), M(this, jt, s, "f");
    }), "f"), v(this, Xt, "f").catch(() => {
    }), v(this, Zt, "f").catch(() => {
    }), M(this, Tt, t, "f"), M(this, tn, n?.logger ?? console, "f");
  }
  get response() {
    return v(this, no, "f");
  }
  get request_id() {
    return v(this, oo, "f");
  }
  async withResponse() {
    M(this, it, !0, "f");
    const t = await v(this, Xt, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Qs(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, o, { logger: s } = {}) {
    const i = new Qs(n, { logger: s });
    for (const a of n.messages) i._addMessageParam(a);
    return M(i, Tt, {
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
    }, v(this, _s, "f"));
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
      v(this, we, "m", ys).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) v(this, we, "m", vs).call(this, c);
      if (u.controller.signal?.aborted) throw new xe();
      v(this, we, "m", Ts).call(this);
    } finally {
      s && i && s.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (M(this, no, t, "f"), M(this, oo, t?.headers.get("request-id"), "f"), v(this, Zn, "f").call(this, t), this._emit("connect"));
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
    return (v(this, Oe, "f")[t] || (v(this, Oe, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const o = v(this, Oe, "f")[t];
    if (!o) return this;
    const s = o.findIndex((i) => i.listener === n);
    return s >= 0 && o.splice(s, 1), this;
  }
  once(t, n) {
    return (v(this, Oe, "f")[t] || (v(this, Oe, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      M(this, it, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    M(this, it, !0, "f"), await v(this, Zt, "f");
  }
  get currentMessage() {
    return v(this, Ze, "f");
  }
  async finalMessage() {
    return await this.done(), v(this, we, "m", gs).call(this);
  }
  async finalText() {
    return await this.done(), v(this, we, "m", sa).call(this);
  }
  _emit(t, ...n) {
    if (v(this, en, "f")) return;
    t === "end" && (M(this, en, !0, "f"), v(this, jn, "f").call(this));
    const o = v(this, Oe, "f")[t];
    if (o && (v(this, Oe, "f")[t] = o.filter((s) => !s.once), o.forEach(({ listener: s }) => s(...n))), t === "abort") {
      const s = n[0];
      !v(this, it, "f") && !o?.length && Promise.reject(s), v(this, Qt, "f").call(this, s), v(this, jt, "f").call(this, s), this._emit("end");
      return;
    }
    if (t === "error") {
      const s = n[0];
      !v(this, it, "f") && !o?.length && Promise.reject(s), v(this, Qt, "f").call(this, s), v(this, jt, "f").call(this, s), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", v(this, we, "m", gs).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let s;
    o && (o.aborted && this.controller.abort(), s = this.controller.abort.bind(this.controller), o.addEventListener("abort", s));
    try {
      v(this, we, "m", ys).call(this), this._connected(null);
      const i = Rn.fromReadableStream(t, this.controller);
      for await (const a of i) v(this, we, "m", vs).call(this, a);
      if (i.controller.signal?.aborted) throw new xe();
      v(this, we, "m", Ts).call(this);
    } finally {
      o && s && o.removeEventListener("abort", s);
    }
  }
  [(Ze = /* @__PURE__ */ new WeakMap(), Tt = /* @__PURE__ */ new WeakMap(), Xt = /* @__PURE__ */ new WeakMap(), Zn = /* @__PURE__ */ new WeakMap(), Qt = /* @__PURE__ */ new WeakMap(), Zt = /* @__PURE__ */ new WeakMap(), jn = /* @__PURE__ */ new WeakMap(), jt = /* @__PURE__ */ new WeakMap(), Oe = /* @__PURE__ */ new WeakMap(), en = /* @__PURE__ */ new WeakMap(), eo = /* @__PURE__ */ new WeakMap(), to = /* @__PURE__ */ new WeakMap(), it = /* @__PURE__ */ new WeakMap(), no = /* @__PURE__ */ new WeakMap(), oo = /* @__PURE__ */ new WeakMap(), tn = /* @__PURE__ */ new WeakMap(), _s = /* @__PURE__ */ new WeakMap(), we = /* @__PURE__ */ new WeakSet(), gs = function() {
    if (this.receivedMessages.length === 0) throw new B("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, sa = function() {
    if (this.receivedMessages.length === 0) throw new B("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new B("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, ys = function() {
    this.ended || M(this, Ze, void 0, "f");
  }, vs = function(n) {
    if (this.ended) return;
    const o = v(this, we, "m", ia).call(this, n);
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
            aa(s) && s.input && this._emit("inputJson", n.delta.partial_json, s.input);
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
        this._addMessageParam(o), this._addMessage(oa(o, v(this, Tt, "f"), { logger: v(this, tn, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        M(this, Ze, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, Ts = function() {
    if (this.ended) throw new B("stream has ended, this shouldn't happen");
    const n = v(this, Ze, "f");
    if (!n) throw new B("request ended without sending any chunks");
    return M(this, Ze, void 0, "f"), oa(n, v(this, Tt, "f"), { logger: v(this, tn, "f") });
  }, ia = function(n) {
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
            if (s && aa(s)) {
              let i = s[ra] || "";
              i += n.delta.partial_json;
              const a = { ...s };
              Object.defineProperty(a, ra, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i && (a.input = _d(i)), o.content[n.index] = a;
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
    return new Rn(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
var xd = class extends ee {
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
      headers: x([{ Accept: "application/binary" }, t?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((o, s) => Td.fromResponse(s.response, s.controller));
  }
}, Ji = class extends ee {
  constructor() {
    super(...arguments), this.batches = new xd(this._client);
  }
  create(e, t) {
    e.model in la && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${la[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), e.model in sm && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const s = pd[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, s);
    }
    const o = cd(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: x([o, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => Pd(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return om.createMessage(this, e, t, { logger: this._client.logger ?? console });
  }
  countTokens(e, t) {
    return this._client.post("/v1/messages/count_tokens", {
      body: e,
      ...t
    });
  }
}, la = {
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
}, sm = ["claude-opus-4-6"];
Ji.Batches = xd;
var Md = class extends ee {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(G`/v1/models/${e}`, {
      ...n,
      headers: x([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models", Nn, {
      query: o,
      ...t,
      headers: x([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, so = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, Zs, Wi, Eo, Nd, im = "\\n\\nHuman:", rm = "\\n\\nAssistant:", z = class {
  constructor({ baseURL: e = so("ANTHROPIC_BASE_URL"), apiKey: t = so("ANTHROPIC_API_KEY") ?? null, authToken: n = so("ANTHROPIC_AUTH_TOKEN") ?? null, ...o } = {}) {
    Zs.add(this), Eo.set(this, void 0);
    const s = {
      apiKey: t,
      authToken: n,
      ...o,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!s.dangerouslyAllowBrowser && Tp()) throw new B(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = s.baseURL, this.timeout = s.timeout ?? Wi.DEFAULT_TIMEOUT, this.logger = s.logger ?? console;
    const i = "warn";
    this.logLevel = i, this.logLevel = Hr(s.logLevel, "ClientOptions.logLevel", this) ?? Hr(so("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? i, this.fetchOptions = s.fetchOptions, this.maxRetries = s.maxRetries ?? 2, this.fetch = s.fetch ?? Cp(), M(this, Eo, Rp, "f"), this._options = s, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
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
    return x([await this.apiKeyAuth(e), await this.bearerAuth(e)]);
  }
  async apiKeyAuth(e) {
    if (this.apiKey != null)
      return x([{ "X-Api-Key": this.apiKey }]);
  }
  async bearerAuth(e) {
    if (this.authToken != null)
      return x([{ Authorization: `Bearer ${this.authToken}` }]);
  }
  stringifyQuery(e) {
    return bp(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${It}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Gc()}`;
  }
  makeStatusError(e, t, n, o) {
    return Ee.generate(e, t, n, o);
  }
  buildURL(e, t, n) {
    const o = !v(this, Zs, "m", Nd).call(this) && n || this.baseURL, s = gp(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), a = Object.fromEntries(s.searchParams);
    return (!$r(i) || !$r(a)) && (t = {
      ...a,
      ...i,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (s.search = this.stringifyQuery(t)), s.toString();
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
    return new ed(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const o = await e, s = o.maxRetries ?? this.maxRetries;
    t == null && (t = s), await this.prepareOptions(o);
    const { req: i, url: a, timeout: u } = await this.buildRequest(o, { retryCount: s - t });
    await this.prepareRequest(i, {
      url: a,
      options: o
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, h = Date.now();
    if (ue(this).debug(`[${c}] sending request`, at({
      retryOfRequestLogID: n,
      method: o.method,
      url: a,
      options: o,
      headers: i.headers
    })), o.signal?.aborted) throw new xe();
    const f = new AbortController(), p = await this.fetchWithTimeout(a, i, u, f).catch(Vs), m = Date.now();
    if (p instanceof globalThis.Error) {
      const _ = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new xe();
      const y = An(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (t)
        return ue(this).info(`[${c}] connection ${y ? "timed out" : "failed"} - ${_}`), ue(this).debug(`[${c}] connection ${y ? "timed out" : "failed"} (${_})`, at({
          retryOfRequestLogID: n,
          url: a,
          durationMs: m - h,
          message: p.message
        })), this.retryRequest(o, t, n ?? c);
      throw ue(this).info(`[${c}] connection ${y ? "timed out" : "failed"} - error; no more retries left`), ue(this).debug(`[${c}] connection ${y ? "timed out" : "failed"} (error; no more retries left)`, at({
        retryOfRequestLogID: n,
        url: a,
        durationMs: m - h,
        message: p.message
      })), y ? new Bc() : new Xo({ cause: p });
    }
    const g = `[${c}${d}${[...p.headers.entries()].filter(([_]) => _ === "request-id").map(([_, y]) => ", " + _ + ": " + JSON.stringify(y)).join("")}] ${i.method} ${a} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - h}ms`;
    if (!p.ok) {
      const _ = await this.shouldRetry(p);
      if (t && _) {
        const R = `retrying, ${t} attempts remaining`;
        return await Ap(p.body), ue(this).info(`${g} - ${R}`), ue(this).debug(`[${c}] response error (${R})`, at({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: m - h
        })), this.retryRequest(o, t, n ?? c, p.headers);
      }
      const y = _ ? "error; no more retries left" : "error; not retryable";
      ue(this).info(`${g} - ${y}`);
      const I = await p.text().catch((R) => Vs(R).message), S = zc(I), A = S ? void 0 : I;
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
    return new $p(this, n, e);
  }
  async fetchWithTimeout(e, t, n, o) {
    const { signal: s, method: i, ...a } = t || {}, u = this._makeAbort(o);
    s && s.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && a.body instanceof globalThis.ReadableStream || typeof a.body == "object" && a.body !== null && Symbol.asyncIterator in a.body, h = {
      signal: o.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...a
    };
    i && (h.method = i.toUpperCase());
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
    return await vp(s), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const s = t - e;
    return Math.min(0.5 * Math.pow(2, s), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  calculateNonstreamingTimeout(e, t) {
    if (36e5 * e / 128e3 > 6e5 || t != null && e > t) throw new B("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details");
    return 6e5;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: o, path: s, query: i, defaultBaseURL: a } = n, u = this.buildURL(s, i, a);
    "timeout" in n && yp("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    const i = x([
      s,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(o),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...Ip(),
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
    const n = x([t]);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || globalThis.ReadableStream && e instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: e
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: Qc(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : v(this, Eo, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
Wi = z, Eo = /* @__PURE__ */ new WeakMap(), Zs = /* @__PURE__ */ new WeakSet(), Nd = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
z.Anthropic = Wi;
z.HUMAN_PROMPT = im;
z.AI_PROMPT = rm;
z.DEFAULT_TIMEOUT = 6e5;
z.AnthropicError = B;
z.APIError = Ee;
z.APIConnectionError = Xo;
z.APIConnectionTimeoutError = Bc;
z.APIUserAbortError = xe;
z.NotFoundError = Hc;
z.ConflictError = Jc;
z.RateLimitError = Kc;
z.BadRequestError = qc;
z.AuthenticationError = Oc;
z.InternalServerError = Yc;
z.PermissionDeniedError = Vc;
z.UnprocessableEntityError = Wc;
z.toFile = Vp;
var Dn = class extends z {
  constructor() {
    super(...arguments), this.completions = new Rd(this), this.messages = new Ji(this), this.models = new Md(this), this.beta = new Fe(this);
  }
};
Dn.Completions = Rd;
Dn.Messages = Ji;
Dn.Models = Md;
Dn.Beta = Fe;
function am(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function lm(e) {
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
            input: am(s.function.arguments)
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
var um = class {
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
    const t = (e.tools || []).map((s) => ({
      name: s.function.name,
      description: s.function.description,
      input_schema: s.function.parameters
    })), n = await this.client.messages.create({
      model: this.config.model,
      system: e.systemPrompt,
      messages: lm(e.messages),
      tools: t,
      temperature: e.temperature,
      max_tokens: e.maxTokens
    }, { signal: e.signal }), o = (n.content || []).filter((s) => s.type === "tool_use" && s.name).map((s, i) => ({
      id: s.id || `anthropic-tool-${i + 1}`,
      name: s.name,
      arguments: JSON.stringify(s.input || {})
    }));
    return {
      text: (n.content || []).filter((s) => s.type === "text").map((s) => s.text || "").join(`
`),
      toolCalls: o,
      finishReason: n.stop_reason || "stop",
      model: n.model || this.config.model,
      provider: "anthropic"
    };
  }
}, cm = /* @__PURE__ */ Fo(((e, t) => {
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
})), dm = /* @__PURE__ */ Fo(((e) => {
  var t = cm();
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
})), fm = /* @__PURE__ */ Fo(((e, t) => {
  t.exports = dm();
})), hm = /* @__PURE__ */ Fo(((e, t) => {
  var n = fm(), o = [
    "Failed to fetch",
    "NetworkError when attempting to fetch resource.",
    "The Internet connection appears to be offline.",
    "Network request failed"
  ], s = class extends Error {
    constructor(c) {
      super(), c instanceof Error ? (this.originalError = c, { message: c } = c) : (this.originalError = new Error(c), this.originalError.stack = this.stack), this.name = "AbortError", this.message = c;
    }
  }, i = (c, d, h) => {
    const f = h.retries - (d - 1);
    return c.attemptNumber = d, c.retriesLeft = f, c;
  }, a = (c) => o.includes(c), u = (c, d) => new Promise((h, f) => {
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
        if (g instanceof s)
          p.stop(), f(g.originalError);
        else if (g instanceof TypeError && !a(g.message))
          p.stop(), f(g);
        else {
          i(g, m, d);
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
  t.exports = u, t.exports.default = u, t.exports.AbortError = s;
})), ua = /* @__PURE__ */ Kf(hm(), 1), pm = void 0, mm = void 0;
function gm() {
  return {
    geminiUrl: pm,
    vertexUrl: mm
  };
}
function _m(e, t, n, o) {
  var s, i;
  if (!e?.baseUrl) {
    const a = gm();
    return t ? (s = a.vertexUrl) !== null && s !== void 0 ? s : n : (i = a.geminiUrl) !== null && i !== void 0 ? i : o;
  }
  return e.baseUrl;
}
var We = class {
};
function b(e, t) {
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
          const h = c[d];
          l(h, t.slice(i + 1), n[d]);
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
function ym(e, t) {
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
    js(e, s, i, 0, a);
  }
}
function js(e, t, n, o, s) {
  if (o >= t.length || typeof e != "object" || e === null) return;
  const i = t[o];
  if (i.endsWith("[]")) {
    const a = i.slice(0, -2), u = e;
    if (a in u && Array.isArray(u[a])) for (const c of u[a]) js(c, t, n, o + 1, s);
  } else if (i === "*") {
    if (typeof e == "object" && e !== null && !Array.isArray(e)) {
      const a = e, u = Object.keys(a).filter((d) => !d.startsWith("_") && !s.has(d)), c = {};
      for (const d of u) c[d] = a[d];
      for (const [d, h] of Object.entries(c)) {
        const f = [];
        for (const p of n.slice(o)) p === "*" ? f.push(d) : f.push(p);
        l(a, f, h);
      }
      for (const d of u) delete a[d];
    }
  } else {
    const a = e;
    i in a && js(a[i], t, n, o + 1, s);
  }
}
function Ki(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function vm(e) {
  const t = {}, n = r(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const o = r(e, ["resourceName"]);
  return o != null && l(t, ["_url", "resourceName"], o), t;
}
function Tm(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = r(e, ["response", "generateVideoResponse"]);
  return a != null && l(t, ["response"], Sm(a)), t;
}
function Em(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = r(e, ["response"]);
  return a != null && l(t, ["response"], wm(a)), t;
}
function Sm(e) {
  const t = {}, n = r(e, ["generatedSamples"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((a) => Im(a))), l(t, ["generatedVideos"], i);
  }
  const o = r(e, ["raiMediaFilteredCount"]);
  o != null && l(t, ["raiMediaFilteredCount"], o);
  const s = r(e, ["raiMediaFilteredReasons"]);
  return s != null && l(t, ["raiMediaFilteredReasons"], s), t;
}
function wm(e) {
  const t = {}, n = r(e, ["videos"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((a) => Cm(a))), l(t, ["generatedVideos"], i);
  }
  const o = r(e, ["raiMediaFilteredCount"]);
  o != null && l(t, ["raiMediaFilteredCount"], o);
  const s = r(e, ["raiMediaFilteredReasons"]);
  return s != null && l(t, ["raiMediaFilteredReasons"], s), t;
}
function Im(e) {
  const t = {}, n = r(e, ["video"]);
  return n != null && l(t, ["video"], Mm(n)), t;
}
function Cm(e) {
  const t = {}, n = r(e, ["_self"]);
  return n != null && l(t, ["video"], Nm(n)), t;
}
function Am(e) {
  const t = {}, n = r(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function Rm(e) {
  const t = {}, n = r(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function bm(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = r(e, ["response"]);
  return a != null && l(t, ["response"], Pm(a)), t;
}
function Pm(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const s = r(e, ["documentName"]);
  return s != null && l(t, ["documentName"], s), t;
}
function kd(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = r(e, ["response"]);
  return a != null && l(t, ["response"], xm(a)), t;
}
function xm(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const s = r(e, ["documentName"]);
  return s != null && l(t, ["documentName"], s), t;
}
function Mm(e) {
  const t = {}, n = r(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const o = r(e, ["encodedVideo"]);
  o != null && l(t, ["videoBytes"], Ki(o));
  const s = r(e, ["encoding"]);
  return s != null && l(t, ["mimeType"], s), t;
}
function Nm(e) {
  const t = {}, n = r(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const o = r(e, ["bytesBase64Encoded"]);
  o != null && l(t, ["videoBytes"], Ki(o));
  const s = r(e, ["mimeType"]);
  return s != null && l(t, ["mimeType"], s), t;
}
var ca;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(ca || (ca = {}));
var da;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(da || (da = {}));
var fa;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(fa || (fa = {}));
var je;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(je || (je = {}));
var ha;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(ha || (ha = {}));
var pa;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})(pa || (pa = {}));
var ma;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})(ma || (ma = {}));
var ga;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(ga || (ga = {}));
var _a;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(_a || (_a = {}));
var ya;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})(ya || (ya = {}));
var va;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})(va || (va = {}));
var ei;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(ei || (ei = {}));
var Ta;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Ta || (Ta = {}));
var Ea;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(Ea || (Ea = {}));
var Sa;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})(Sa || (Sa = {}));
var wa;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(wa || (wa = {}));
var Ia;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(Ia || (Ia = {}));
var Ca;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(Ca || (Ca = {}));
var Aa;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})(Aa || (Aa = {}));
var Ra;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Ra || (Ra = {}));
var ba;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(ba || (ba = {}));
var Pa;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(Pa || (Pa = {}));
var xa;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(xa || (xa = {}));
var Ma;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(Ma || (Ma = {}));
var ko;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(ko || (ko = {}));
var Na;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(Na || (Na = {}));
var ka;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(ka || (ka = {}));
var Da;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(Da || (Da = {}));
var La;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(La || (La = {}));
var ti;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(ti || (ti = {}));
var Ua;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})(Ua || (Ua = {}));
var $a;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})($a || ($a = {}));
var Fa;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(Fa || (Fa = {}));
var Ga;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(Ga || (Ga = {}));
var Ba;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(Ba || (Ba = {}));
var qa;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})(qa || (qa = {}));
var Oa;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})(Oa || (Oa = {}));
var ni;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(ni || (ni = {}));
var Va;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})(Va || (Va = {}));
var Ha;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(Ha || (Ha = {}));
var Do;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(Do || (Do = {}));
var Ja;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(Ja || (Ja = {}));
var Wa;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(Wa || (Wa = {}));
var Ka;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(Ka || (Ka = {}));
var Ya;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(Ya || (Ya = {}));
var za;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(za || (za = {}));
var Xa;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(Xa || (Xa = {}));
var Qa;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(Qa || (Qa = {}));
var Za;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(Za || (Za = {}));
var ja;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})(ja || (ja = {}));
var el;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(el || (el = {}));
var tl;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})(tl || (tl = {}));
var nl;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(nl || (nl = {}));
var ol;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(ol || (ol = {}));
var sl;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(sl || (sl = {}));
var il;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(il || (il = {}));
var rl;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(rl || (rl = {}));
var al;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(al || (al = {}));
var ll;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(ll || (ll = {}));
var ul;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(ul || (ul = {}));
var cl;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(cl || (cl = {}));
var dl;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(dl || (dl = {}));
var fl;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(fl || (fl = {}));
var hl;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(hl || (hl = {}));
var bt;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(bt || (bt = {}));
var oi = class {
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
    var e, t, n, o, s, i, a, u;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning text from the first one.");
    let c = "", d = !1;
    const h = [];
    for (const f of (u = (a = (i = (s = this.candidates) === null || s === void 0 ? void 0 : s[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) !== null && u !== void 0 ? u : []) {
      for (const [p, m] of Object.entries(f)) p !== "text" && p !== "thought" && p !== "thoughtSignature" && (m !== null || m !== void 0) && h.push(p);
      if (typeof f.text == "string") {
        if (typeof f.thought == "boolean" && f.thought) continue;
        d = !0, c += f.text;
      }
    }
    return h.length > 0 && console.warn(`there are non-text parts ${h} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), d ? c : void 0;
  }
  get data() {
    var e, t, n, o, s, i, a, u;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning data from the first one.");
    let c = "";
    const d = [];
    for (const h of (u = (a = (i = (s = this.candidates) === null || s === void 0 ? void 0 : s[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) !== null && u !== void 0 ? u : []) {
      for (const [f, p] of Object.entries(h)) f !== "inlineData" && (p !== null || p !== void 0) && d.push(f);
      h.inlineData && typeof h.inlineData.data == "string" && (c += atob(h.inlineData.data));
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
    const d = (u = (a = (i = (s = this.candidates) === null || s === void 0 ? void 0 : s[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) === null || u === void 0 ? void 0 : u.filter((h) => h.executableCode).map((h) => h.executableCode).filter((h) => h !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.code;
  }
  get codeExecutionResult() {
    var e, t, n, o, s, i, a, u, c;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning code execution result from the first one.");
    const d = (u = (a = (i = (s = this.candidates) === null || s === void 0 ? void 0 : s[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) === null || u === void 0 ? void 0 : u.filter((h) => h.codeExecutionResult).map((h) => h.codeExecutionResult).filter((h) => h !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.output;
  }
}, pl = class {
}, ml = class {
}, km = class {
}, Dm = class {
}, Lm = class {
}, Um = class {
}, gl = class {
}, _l = class {
}, yl = class {
}, $m = class {
}, vl = class Dd {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new Dd();
    let s;
    const i = t;
    return n ? s = Em(i) : s = Tm(i), Object.assign(o, s), o;
  }
}, Tl = class {
}, El = class {
}, Sl = class {
}, wl = class {
}, Fm = class {
}, Gm = class {
}, Bm = class {
}, qm = class Ld {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new Ld(), s = bm(t);
    return Object.assign(o, s), o;
  }
}, Om = class {
}, Vm = class {
}, Hm = class {
}, Jm = class {
}, Il = class {
}, Wm = class {
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
}, Km = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, Ym = class Ud {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new Ud(), s = kd(t);
    return Object.assign(o, s), o;
  }
};
function H(e, t) {
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
function $d(e, t) {
  const n = H(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function Fd(e) {
  return Array.isArray(e) ? e.map((t) => Lo(t)) : [Lo(e)];
}
function Lo(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function Gd(e) {
  const t = Lo(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function Bd(e) {
  const t = Lo(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function Cl(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function qd(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => Cl(t)) : [Cl(e)];
}
function si(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function Al(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function Rl(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function oe(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return si(e) ? e : {
    role: "user",
    parts: qd(e)
  };
}
function Yi(e, t) {
  if (!t) return [];
  if (e.isVertexAI() && Array.isArray(t)) return t.flatMap((n) => {
    const o = oe(n);
    return o.parts && o.parts.length > 0 && o.parts[0].text !== void 0 ? [o.parts[0].text] : [];
  });
  if (e.isVertexAI()) {
    const n = oe(t);
    return n.parts && n.parts.length > 0 && n.parts[0].text !== void 0 ? [n.parts[0].text] : [];
  }
  return Array.isArray(t) ? t.map((n) => oe(n)) : [oe(t)];
}
function pe(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("contents are required");
  if (!Array.isArray(e)) {
    if (Al(e) || Rl(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [oe(e)];
  }
  const t = [], n = [], o = si(e[0]);
  for (const s of e) {
    const i = si(s);
    if (i != o) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (i) t.push(s);
    else {
      if (Al(s) || Rl(s)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(s);
    }
  }
  return o || t.push({
    role: "user",
    parts: qd(n)
  }), t;
}
function zm(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((o) => o !== "null");
  if (n.length === 1) t.type = Object.values(je).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : je.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const o of n) t.anyOf.push({ type: Object.values(je).includes(o.toUpperCase()) ? o.toUpperCase() : je.TYPE_UNSPECIFIED });
  }
}
function xt(e) {
  const t = {}, n = ["items"], o = ["anyOf"], s = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const i = e.anyOf;
  i != null && i.length == 2 && (i[0].type === "null" ? (t.nullable = !0, e = i[1]) : i[1].type === "null" && (t.nullable = !0, e = i[0])), e.type instanceof Array && zm(e.type, t);
  for (const [a, u] of Object.entries(e))
    if (u != null)
      if (a == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(je).includes(u.toUpperCase()) ? u.toUpperCase() : je.TYPE_UNSPECIFIED;
      } else if (n.includes(a)) t[a] = xt(u);
      else if (o.includes(a)) {
        const c = [];
        for (const d of u) {
          if (d.type == "null") {
            t.nullable = !0;
            continue;
          }
          c.push(xt(d));
        }
        t[a] = c;
      } else if (s.includes(a)) {
        const c = {};
        for (const [d, h] of Object.entries(u)) c[d] = xt(h);
        t[a] = c;
      } else {
        if (a === "additionalProperties") continue;
        t[a] = u;
      }
  return t;
}
function zi(e) {
  return xt(e);
}
function Xi(e) {
  if (typeof e == "object") return e;
  if (typeof e == "string") return { voiceConfig: { prebuiltVoiceConfig: { voiceName: e } } };
  throw new Error(`Unsupported speechConfig type: ${typeof e}`);
}
function Qi(e) {
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
function Xm(e, t, n, o = 1) {
  const s = !t.startsWith(`${n}/`) && t.split("/").length === o;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : s ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : s ? `${n}/${t}` : t;
}
function Ke(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return Xm(e, t, "cachedContents");
}
function Od(e) {
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
  return Ki(e);
}
function Qm(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function Zm(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function jm(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function Vd(e) {
  var t;
  let n;
  if (Qm(e) && (n = e.name), !(jm(e) && (n = e.uri, n === void 0)) && !(Zm(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const o = n.split("files/")[1].match(/[a-z0-9]+/);
      if (o === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = o[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function Hd(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function Jd(e) {
  for (const t of [
    "models",
    "tunedModels",
    "publisherModels"
  ]) if (eg(e, t)) return e[t];
  return [];
}
function eg(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function tg(e, t = {}) {
  const n = e, o = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (o.responseJsonSchema = n.outputSchema), t.behavior && (o.behavior = t.behavior), { functionDeclarations: [o] };
}
function ng(e, t = {}) {
  const n = [], o = /* @__PURE__ */ new Set();
  for (const s of e) {
    const i = s.name;
    if (o.has(i)) throw new Error(`Duplicate function name ${i} found in MCP tools. Please ensure function names are unique.`);
    o.add(i);
    const a = tg(s, t);
    a.functionDeclarations && n.push(...a.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function Wd(e, t) {
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
function og(e) {
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
function Kd(e) {
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
function Yd(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function sg(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function ig(e) {
  const t = {}, n = r(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function rg(e) {
  const t = {}, n = r(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const o = r(e, ["inlinedResponses", "inlinedResponses"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Bg(a))), l(t, ["inlinedResponses"], i);
  }
  const s = r(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["inlinedEmbedContentResponses"], i);
  }
  return t;
}
function ag(e) {
  const t = {}, n = r(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const o = r(e, ["gcsDestination", "outputUriPrefix"]);
  o != null && l(t, ["gcsUri"], o);
  const s = r(e, ["bigqueryDestination", "outputUri"]);
  return s != null && l(t, ["bigqueryUri"], s), t;
}
function lg(e) {
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
function So(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["metadata", "displayName"]);
  o != null && l(t, ["displayName"], o);
  const s = r(e, ["metadata", "state"]);
  s != null && l(t, ["state"], Yd(s));
  const i = r(e, ["metadata", "createTime"]);
  i != null && l(t, ["createTime"], i);
  const a = r(e, ["metadata", "endTime"]);
  a != null && l(t, ["endTime"], a);
  const u = r(e, ["metadata", "updateTime"]);
  u != null && l(t, ["updateTime"], u);
  const c = r(e, ["metadata", "model"]);
  c != null && l(t, ["model"], c);
  const d = r(e, ["metadata", "output"]);
  return d != null && l(t, ["dest"], rg(Kd(d))), t;
}
function ii(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["displayName"]);
  o != null && l(t, ["displayName"], o);
  const s = r(e, ["state"]);
  s != null && l(t, ["state"], Yd(s));
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
  const h = r(e, ["model"]);
  h != null && l(t, ["model"], h);
  const f = r(e, ["inputConfig"]);
  f != null && l(t, ["src"], ug(f));
  const p = r(e, ["outputConfig"]);
  p != null && l(t, ["dest"], ag(Kd(p)));
  const m = r(e, ["completionStats"]);
  return m != null && l(t, ["completionStats"], m), t;
}
function ug(e) {
  const t = {}, n = r(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const o = r(e, ["gcsSource", "uris"]);
  o != null && l(t, ["gcsUri"], o);
  const s = r(e, ["bigquerySource", "inputUri"]);
  return s != null && l(t, ["bigqueryUri"], s), t;
}
function cg(e, t) {
  const n = {};
  if (r(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (r(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (r(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const o = r(t, ["fileName"]);
  o != null && l(n, ["fileName"], o);
  const s = r(t, ["inlinedRequests"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => Gg(e, a))), l(n, ["requests", "requests"], i);
  }
  return n;
}
function dg(e) {
  const t = {}, n = r(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const o = r(e, ["gcsUri"]);
  o != null && l(t, ["gcsSource", "uris"], o);
  const s = r(e, ["bigqueryUri"]);
  if (s != null && l(t, ["bigquerySource", "inputUri"], s), r(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (r(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function fg(e) {
  const t = {}, n = r(e, ["data"]);
  if (n != null && l(t, ["data"], n), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function hg(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], $t(e, o)), n;
}
function pg(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], $t(e, o)), n;
}
function mg(e) {
  const t = {}, n = r(e, ["content"]);
  n != null && l(t, ["content"], n);
  const o = r(e, ["citationMetadata"]);
  o != null && l(t, ["citationMetadata"], gg(o));
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
  const h = r(e, ["safetyRatings"]);
  if (h != null) {
    let p = h;
    Array.isArray(p) && (p = p.map((m) => m)), l(t, ["safetyRatings"], p);
  }
  const f = r(e, ["urlContextMetadata"]);
  return f != null && l(t, ["urlContextMetadata"], f), t;
}
function gg(e) {
  const t = {}, n = r(e, ["citationSources"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["citations"], o);
  }
  return t;
}
function zd(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((i) => Kg(i))), l(t, ["parts"], s);
  }
  const o = r(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function _g(e, t) {
  const n = {}, o = r(e, ["displayName"]);
  if (t !== void 0 && o != null && l(t, ["batch", "displayName"], o), r(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const s = r(e, ["webhookConfig"]);
  return t !== void 0 && s != null && l(t, ["batch", "webhookConfig"], s), n;
}
function yg(e, t) {
  const n = {}, o = r(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const s = r(e, ["dest"]);
  if (t !== void 0 && s != null && l(t, ["outputConfig"], lg(og(s))), r(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function bl(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["_url", "model"], H(e, o));
  const s = r(t, ["src"]);
  s != null && l(n, ["batch", "inputConfig"], cg(e, Wd(e, s)));
  const i = r(t, ["config"]);
  return i != null && _g(i, n), n;
}
function vg(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["model"], H(e, o));
  const s = r(t, ["src"]);
  s != null && l(n, ["inputConfig"], dg(Wd(e, s)));
  const i = r(t, ["config"]);
  return i != null && yg(i, n), n;
}
function Tg(e, t) {
  const n = {}, o = r(e, ["displayName"]);
  return t !== void 0 && o != null && l(t, ["batch", "displayName"], o), n;
}
function Eg(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["_url", "model"], H(e, o));
  const s = r(t, ["src"]);
  s != null && l(n, ["batch", "inputConfig"], bg(e, s));
  const i = r(t, ["config"]);
  return i != null && Tg(i, n), n;
}
function Sg(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], $t(e, o)), n;
}
function wg(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], $t(e, o)), n;
}
function Ig(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["name"]);
  o != null && l(t, ["name"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function Cg(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["name"]);
  o != null && l(t, ["name"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function Ag(e, t) {
  const n = {}, o = r(t, ["contents"]);
  if (o != null) {
    let i = Yi(e, o);
    Array.isArray(i) && (i = i.map((a) => a)), l(n, [
      "requests[]",
      "request",
      "content"
    ], i);
  }
  const s = r(t, ["config"]);
  return s != null && (l(n, ["_self"], Rg(s, n)), ym(n, { "requests[].*": "requests[].request.*" })), n;
}
function Rg(e, t) {
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
function bg(e, t) {
  const n = {}, o = r(t, ["fileName"]);
  o != null && l(n, ["file_name"], o);
  const s = r(t, ["inlinedRequests"]);
  return s != null && l(n, ["requests"], Ag(e, s)), n;
}
function Pg(e) {
  const t = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = r(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function xg(e) {
  const t = {}, n = r(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = r(e, ["args"]);
  o != null && l(t, ["args"], o);
  const s = r(e, ["name"]);
  if (s != null && l(t, ["name"], s), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Mg(e) {
  const t = {}, n = r(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const o = r(e, ["mode"]);
  if (o != null && l(t, ["mode"], o), r(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function Ng(e, t, n) {
  const o = {}, s = r(t, ["systemInstruction"]);
  n !== void 0 && s != null && l(n, ["systemInstruction"], zd(oe(s)));
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
  const h = r(t, ["stopSequences"]);
  h != null && l(o, ["stopSequences"], h);
  const f = r(t, ["responseLogprobs"]);
  f != null && l(o, ["responseLogprobs"], f);
  const p = r(t, ["logprobs"]);
  p != null && l(o, ["logprobs"], p);
  const m = r(t, ["presencePenalty"]);
  m != null && l(o, ["presencePenalty"], m);
  const g = r(t, ["frequencyPenalty"]);
  g != null && l(o, ["frequencyPenalty"], g);
  const _ = r(t, ["seed"]);
  _ != null && l(o, ["seed"], _);
  const y = r(t, ["responseMimeType"]);
  y != null && l(o, ["responseMimeType"], y);
  const I = r(t, ["responseSchema"]);
  I != null && l(o, ["responseSchema"], zi(I));
  const S = r(t, ["responseJsonSchema"]);
  if (S != null && l(o, ["responseJsonSchema"], S), r(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (r(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const A = r(t, ["safetySettings"]);
  if (n !== void 0 && A != null) {
    let Y = A;
    Array.isArray(Y) && (Y = Y.map((W) => Yg(W))), l(n, ["safetySettings"], Y);
  }
  const R = r(t, ["tools"]);
  if (n !== void 0 && R != null) {
    let Y = Ut(R);
    Array.isArray(Y) && (Y = Y.map((W) => Xg(Lt(W)))), l(n, ["tools"], Y);
  }
  const $ = r(t, ["toolConfig"]);
  if (n !== void 0 && $ != null && l(n, ["toolConfig"], zg($)), r(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const E = r(t, ["cachedContent"]);
  n !== void 0 && E != null && l(n, ["cachedContent"], Ke(e, E));
  const U = r(t, ["responseModalities"]);
  U != null && l(o, ["responseModalities"], U);
  const C = r(t, ["mediaResolution"]);
  C != null && l(o, ["mediaResolution"], C);
  const k = r(t, ["speechConfig"]);
  if (k != null && l(o, ["speechConfig"], Xi(k)), r(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const O = r(t, ["thinkingConfig"]);
  O != null && l(o, ["thinkingConfig"], O);
  const J = r(t, ["imageConfig"]);
  J != null && l(o, ["imageConfig"], Fg(J));
  const de = r(t, ["enableEnhancedCivicAnswers"]);
  if (de != null && l(o, ["enableEnhancedCivicAnswers"], de), r(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const ae = r(t, ["serviceTier"]);
  return n !== void 0 && ae != null && l(n, ["serviceTier"], ae), o;
}
function kg(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["candidates"]);
  if (o != null) {
    let d = o;
    Array.isArray(d) && (d = d.map((h) => mg(h))), l(t, ["candidates"], d);
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
function Dg(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], $t(e, o)), n;
}
function Lg(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], $t(e, o)), n;
}
function Ug(e) {
  const t = {}, n = r(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], ig(n));
  const o = r(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function $g(e) {
  const t = {}, n = r(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = r(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function Fg(e) {
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
function Gg(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["request", "model"], H(e, o));
  const s = r(t, ["contents"]);
  if (s != null) {
    let u = pe(s);
    Array.isArray(u) && (u = u.map((c) => zd(c))), l(n, ["request", "contents"], u);
  }
  const i = r(t, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const a = r(t, ["config"]);
  return a != null && l(n, ["request", "generationConfig"], Ng(e, a, r(n, ["request"], {}))), n;
}
function Bg(e) {
  const t = {}, n = r(e, ["response"]);
  n != null && l(t, ["response"], kg(n));
  const o = r(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = r(e, ["error"]);
  return s != null && l(t, ["error"], s), t;
}
function qg(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  if (t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), r(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function Og(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  t !== void 0 && s != null && l(t, ["_query", "pageToken"], s);
  const i = r(e, ["filter"]);
  return t !== void 0 && i != null && l(t, ["_query", "filter"], i), n;
}
function Vg(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && qg(n, t), t;
}
function Hg(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && Og(n, t), t;
}
function Jg(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const s = r(e, ["operations"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => So(a))), l(t, ["batchJobs"], i);
  }
  return t;
}
function Wg(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const s = r(e, ["batchPredictionJobs"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => ii(a))), l(t, ["batchJobs"], i);
  }
  return t;
}
function Kg(e) {
  const t = {}, n = r(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = r(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const s = r(e, ["executableCode"]);
  s != null && l(t, ["executableCode"], s);
  const i = r(e, ["fileData"]);
  i != null && l(t, ["fileData"], Pg(i));
  const a = r(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], xg(a));
  const u = r(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = r(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], fg(c));
  const d = r(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = r(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = r(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = r(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = r(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = r(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = r(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function Yg(e) {
  const t = {}, n = r(e, ["category"]);
  if (n != null && l(t, ["category"], n), r(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = r(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function zg(e) {
  const t = {}, n = r(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = r(e, ["functionCallingConfig"]);
  o != null && l(t, ["functionCallingConfig"], Mg(o));
  const s = r(e, ["includeServerSideToolInvocations"]);
  return s != null && l(t, ["includeServerSideToolInvocations"], s), t;
}
function Xg(e) {
  const t = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = r(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = r(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const s = r(e, ["googleSearch"]);
  s != null && l(t, ["googleSearch"], $g(s));
  const i = r(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], Ug(i));
  const a = r(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), r(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = r(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const c = r(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), r(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = r(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = r(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
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
}, Qg = class extends We {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new pt(Je.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = bl(this.apiClient, e), n = t._url, o = b("{model}:batchGenerateContent", n), s = t.batch.inputConfig.requests, i = s.requests, a = [];
    for (const u of i) {
      const c = Object.assign({}, u);
      if (c.systemInstruction) {
        const d = c.systemInstruction;
        delete c.systemInstruction;
        const h = c.request;
        h.systemInstruction = d, c.request = h;
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
      const c = vg(this.apiClient, e);
      return a = b("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => ii(d));
    } else {
      const c = bl(this.apiClient, e);
      return a = b("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), i.then((d) => So(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Eg(this.apiClient, e);
      return s = b("{model}:asyncBatchEmbedContent", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => So(u));
    }
  }
  async get(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Lg(this.apiClient, e);
      return a = b("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => ii(d));
    } else {
      const c = Dg(this.apiClient, e);
      return a = b("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), i.then((d) => So(d));
    }
  }
  async cancel(e) {
    var t, n, o, s;
    let i = "", a = {};
    if (this.apiClient.isVertexAI()) {
      const u = pg(this.apiClient, e);
      i = b("batchPredictionJobs/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: i,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = hg(this.apiClient, e);
      i = b("batches/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
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
      const c = Hg(e);
      return a = b("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = Wg(d), f = new Il();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Vg(e);
      return a = b("batches", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = Jg(d), f = new Il();
        return Object.assign(f, h), f;
      });
    }
  }
  async delete(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = wg(this.apiClient, e);
      return a = b("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => Cg(d));
    } else {
      const c = Sg(this.apiClient, e);
      return a = b("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => Ig(d));
    }
  }
};
function Zg(e) {
  const t = {}, n = r(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function jg(e) {
  const t = {}, n = r(e, ["data"]);
  if (n != null && l(t, ["data"], n), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Pl(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((i) => S_(i))), l(t, ["parts"], s);
  }
  const o = r(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function xl(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((i) => w_(i))), l(t, ["parts"], s);
  }
  const o = r(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function e_(e, t) {
  const n = {}, o = r(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const s = r(e, ["expireTime"]);
  t !== void 0 && s != null && l(t, ["expireTime"], s);
  const i = r(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const a = r(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let h = pe(a);
    Array.isArray(h) && (h = h.map((f) => Pl(f))), l(t, ["contents"], h);
  }
  const u = r(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Pl(oe(u)));
  const c = r(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((f) => A_(f))), l(t, ["tools"], h);
  }
  const d = r(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], I_(d)), r(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function t_(e, t) {
  const n = {}, o = r(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const s = r(e, ["expireTime"]);
  t !== void 0 && s != null && l(t, ["expireTime"], s);
  const i = r(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const a = r(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let f = pe(a);
    Array.isArray(f) && (f = f.map((p) => xl(p))), l(t, ["contents"], f);
  }
  const u = r(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], xl(oe(u)));
  const c = r(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((p) => R_(p))), l(t, ["tools"], f);
  }
  const d = r(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], C_(d));
  const h = r(e, ["kmsKeyName"]);
  return t !== void 0 && h != null && l(t, ["encryption_spec", "kmsKeyName"], h), n;
}
function n_(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["model"], $d(e, o));
  const s = r(t, ["config"]);
  return s != null && e_(s, n), n;
}
function o_(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["model"], $d(e, o));
  const s = r(t, ["config"]);
  return s != null && t_(s, n), n;
}
function s_(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], Ke(e, o)), n;
}
function i_(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], Ke(e, o)), n;
}
function r_(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function a_(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function l_(e) {
  const t = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = r(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function u_(e) {
  const t = {}, n = r(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = r(e, ["args"]);
  o != null && l(t, ["args"], o);
  const s = r(e, ["name"]);
  if (s != null && l(t, ["name"], s), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function c_(e) {
  const t = {}, n = r(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const o = r(e, ["mode"]);
  if (o != null && l(t, ["mode"], o), r(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function d_(e) {
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
function f_(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], Ke(e, o)), n;
}
function h_(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], Ke(e, o)), n;
}
function p_(e) {
  const t = {}, n = r(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], Zg(n));
  const o = r(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function m_(e) {
  const t = {}, n = r(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = r(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function g_(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function __(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function y_(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && g_(n, t), t;
}
function v_(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && __(n, t), t;
}
function T_(e) {
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
function E_(e) {
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
function S_(e) {
  const t = {}, n = r(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = r(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const s = r(e, ["executableCode"]);
  s != null && l(t, ["executableCode"], s);
  const i = r(e, ["fileData"]);
  i != null && l(t, ["fileData"], l_(i));
  const a = r(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], u_(a));
  const u = r(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = r(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], jg(c));
  const d = r(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = r(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = r(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = r(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = r(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = r(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = r(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function w_(e) {
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
  const h = r(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = r(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = r(e, ["videoMetadata"]);
  if (p != null && l(t, ["videoMetadata"], p), r(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (r(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (r(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return t;
}
function I_(e) {
  const t = {}, n = r(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = r(e, ["functionCallingConfig"]);
  o != null && l(t, ["functionCallingConfig"], c_(o));
  const s = r(e, ["includeServerSideToolInvocations"]);
  return s != null && l(t, ["includeServerSideToolInvocations"], s), t;
}
function C_(e) {
  const t = {}, n = r(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = r(e, ["functionCallingConfig"]);
  if (o != null && l(t, ["functionCallingConfig"], o), r(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function A_(e) {
  const t = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = r(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = r(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const s = r(e, ["googleSearch"]);
  s != null && l(t, ["googleSearch"], m_(s));
  const i = r(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], p_(i));
  const a = r(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), r(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = r(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const c = r(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), r(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = r(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = r(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
function R_(e) {
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
    let p = c;
    Array.isArray(p) && (p = p.map((m) => d_(m))), l(t, ["functionDeclarations"], p);
  }
  const d = r(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = r(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = r(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), r(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function b_(e, t) {
  const n = {}, o = r(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const s = r(e, ["expireTime"]);
  return t !== void 0 && s != null && l(t, ["expireTime"], s), n;
}
function P_(e, t) {
  const n = {}, o = r(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const s = r(e, ["expireTime"]);
  return t !== void 0 && s != null && l(t, ["expireTime"], s), n;
}
function x_(e, t) {
  const n = {}, o = r(t, ["name"]);
  o != null && l(n, ["_url", "name"], Ke(e, o));
  const s = r(t, ["config"]);
  return s != null && b_(s, n), n;
}
function M_(e, t) {
  const n = {}, o = r(t, ["name"]);
  o != null && l(n, ["_url", "name"], Ke(e, o));
  const s = r(t, ["config"]);
  return s != null && P_(s, n), n;
}
var N_ = class extends We {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new pt(Je.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = o_(this.apiClient, e);
      return a = b("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = n_(this.apiClient, e);
      return a = b("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
      const c = h_(this.apiClient, e);
      return a = b("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = f_(this.apiClient, e);
      return a = b("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
      const c = i_(this.apiClient, e);
      return a = b("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = a_(d), f = new Sl();
        return Object.assign(f, h), f;
      });
    } else {
      const c = s_(this.apiClient, e);
      return a = b("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = r_(d), f = new Sl();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = M_(this.apiClient, e);
      return a = b("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = x_(this.apiClient, e);
      return a = b("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
      const c = v_(e);
      return a = b("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = E_(d), f = new wl();
        return Object.assign(f, h), f;
      });
    } else {
      const c = y_(e);
      return a = b("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = T_(d), f = new wl();
        return Object.assign(f, h), f;
      });
    }
  }
};
function et(e, t) {
  var n = {};
  for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var s = 0, o = Object.getOwnPropertySymbols(e); s < o.length; s++) t.indexOf(o[s]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[s]) && (n[o[s]] = e[o[s]]);
  return n;
}
function Ml(e) {
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
    o[m] && (s[m] = function(_) {
      return new Promise(function(y, I) {
        i.push([
          m,
          _,
          y,
          I
        ]) > 1 || c(m, _);
      });
    }, g && (s[m] = g(s[m])));
  }
  function c(m, g) {
    try {
      d(o[m](g));
    } catch (_) {
      p(i[0][3], _);
    }
  }
  function d(m) {
    m.value instanceof q ? Promise.resolve(m.value.v).then(h, f) : p(i[0][2], m);
  }
  function h(m) {
    c("next", m);
  }
  function f(m) {
    c("throw", m);
  }
  function p(m, g) {
    m(g), i.shift(), i.length && c(i[0][0], i[0][1]);
  }
}
function Ne(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof Ml == "function" ? Ml(e) : e[Symbol.iterator](), n = {}, o("next"), o("throw"), o("return"), n[Symbol.asyncIterator] = function() {
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
function k_(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : Xd(n);
}
function Xd(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function D_(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function Nl(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let o = 0;
  for (; o < n; ) if (e[o].role === "user")
    t.push(e[o]), o++;
  else {
    const s = [];
    let i = !0;
    for (; o < n && e[o].role === "model"; )
      s.push(e[o]), i && !Xd(e[o]) && (i = !1), o++;
    i ? t.push(...s) : t.pop();
  }
  return t;
}
var L_ = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new U_(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, U_ = class {
  constructor(e, t, n, o = {}, s = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = o, this.history = s, this.sendPromise = Promise.resolve(), D_(s);
  }
  async sendMessage(e) {
    var t;
    await this.sendPromise;
    const n = oe(e.message), o = this.modelsModule.generateContent({
      model: this.model,
      contents: this.getHistory(!0).concat(n),
      config: (t = e.config) !== null && t !== void 0 ? t : this.config
    });
    return this.sendPromise = (async () => {
      var s, i, a;
      const u = await o, c = (i = (s = u.candidates) === null || s === void 0 ? void 0 : s[0]) === null || i === void 0 ? void 0 : i.content, d = u.automaticFunctionCallingHistory, h = this.getHistory(!0).length;
      let f = [];
      d != null && (f = (a = d.slice(h)) !== null && a !== void 0 ? a : []);
      const p = c ? [c] : [];
      this.recordHistory(n, p, f);
    })(), await this.sendPromise.catch(() => {
      this.sendPromise = Promise.resolve();
    }), o;
  }
  async sendMessageStream(e) {
    var t;
    await this.sendPromise;
    const n = oe(e.message), o = this.modelsModule.generateContentStream({
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
    const t = e ? Nl(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return Me(this, arguments, function* () {
      var o, s, i, a, u, c;
      const d = [];
      try {
        for (var h = !0, f = Ne(e), p; p = yield q(f.next()), o = p.done, !o; h = !0) {
          a = p.value, h = !1;
          const m = a;
          if (k_(m)) {
            const g = (c = (u = m.candidates) === null || u === void 0 ? void 0 : u[0]) === null || c === void 0 ? void 0 : c.content;
            g !== void 0 && d.push(g);
          }
          yield yield q(m);
        }
      } catch (m) {
        s = { error: m };
      } finally {
        try {
          !h && !o && (i = f.return) && (yield q(i.call(f)));
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
    }), n && n.length > 0 ? this.history.push(...Nl(n)) : this.history.push(e), this.history.push(...o);
  }
}, Qd = class Zd extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, Zd.prototype);
  }
};
function $_(e) {
  const t = {}, n = r(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function F_(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function G_(e) {
  const t = {}, n = r(e, ["name"]);
  return n != null && l(t, ["_url", "file"], Vd(n)), t;
}
function B_(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function q_(e) {
  const t = {}, n = r(e, ["name"]);
  return n != null && l(t, ["_url", "file"], Vd(n)), t;
}
function O_(e) {
  const t = {}, n = r(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function V_(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function H_(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && V_(n, t), t;
}
function J_(e) {
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
function W_(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["files"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((i) => i)), l(t, ["files"], s);
  }
  return t;
}
var K_ = class extends We {
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
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = H_(e);
      return s = b("files", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
        const c = J_(u), d = new Om();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = $_(e);
      return s = b("upload/v1beta/files", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = F_(u), d = new Vm();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = q_(e);
      return s = b("files/{file}", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
      const a = G_(e);
      return s = b("files/{file}", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
        const c = B_(u), d = new Hm();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = O_(e);
      return s = b("files:register", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = W_(u), d = new Jm();
        return Object.assign(d, c), d;
      });
    }
  }
};
function kl(e) {
  const t = {};
  if (r(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function Y_(e) {
  const t = {}, n = r(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function wo(e) {
  const t = {}, n = r(e, ["data"]);
  if (n != null && l(t, ["data"], n), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function z_(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((i) => fy(i))), l(t, ["parts"], s);
  }
  const o = r(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function X_(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((i) => hy(i))), l(t, ["parts"], s);
  }
  const o = r(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function Q_(e) {
  const t = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = r(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Z_(e) {
  const t = {}, n = r(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = r(e, ["args"]);
  o != null && l(t, ["args"], o);
  const s = r(e, ["name"]);
  if (s != null && l(t, ["name"], s), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function j_(e) {
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
function ey(e) {
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
  const h = r(e, ["mediaResolution"]);
  h != null && l(t, ["mediaResolution"], h);
  const f = r(e, ["presencePenalty"]);
  f != null && l(t, ["presencePenalty"], f);
  const p = r(e, ["responseLogprobs"]);
  p != null && l(t, ["responseLogprobs"], p);
  const m = r(e, ["responseMimeType"]);
  m != null && l(t, ["responseMimeType"], m);
  const g = r(e, ["responseModalities"]);
  g != null && l(t, ["responseModalities"], g);
  const _ = r(e, ["responseSchema"]);
  _ != null && l(t, ["responseSchema"], _);
  const y = r(e, ["routingConfig"]);
  y != null && l(t, ["routingConfig"], y);
  const I = r(e, ["seed"]);
  I != null && l(t, ["seed"], I);
  const S = r(e, ["speechConfig"]);
  S != null && l(t, ["speechConfig"], S);
  const A = r(e, ["stopSequences"]);
  A != null && l(t, ["stopSequences"], A);
  const R = r(e, ["temperature"]);
  R != null && l(t, ["temperature"], R);
  const $ = r(e, ["thinkingConfig"]);
  $ != null && l(t, ["thinkingConfig"], $);
  const E = r(e, ["topK"]);
  E != null && l(t, ["topK"], E);
  const U = r(e, ["topP"]);
  if (U != null && l(t, ["topP"], U), r(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return t;
}
function ty(e) {
  const t = {}, n = r(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], Y_(n));
  const o = r(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function ny(e) {
  const t = {}, n = r(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = r(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function oy(e, t) {
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
  const h = r(e, ["seed"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], h);
  const f = r(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], Qi(f));
  const p = r(e, ["thinkingConfig"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], p);
  const m = r(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const g = r(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], z_(oe(g)));
  const _ = r(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let C = Ut(_);
    Array.isArray(C) && (C = C.map((k) => gy(Lt(k)))), l(t, ["setup", "tools"], C);
  }
  const y = r(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], my(y));
  const I = r(e, ["inputAudioTranscription"]);
  t !== void 0 && I != null && l(t, ["setup", "inputAudioTranscription"], kl(I));
  const S = r(e, ["outputAudioTranscription"]);
  t !== void 0 && S != null && l(t, ["setup", "outputAudioTranscription"], kl(S));
  const A = r(e, ["realtimeInputConfig"]);
  t !== void 0 && A != null && l(t, ["setup", "realtimeInputConfig"], A);
  const R = r(e, ["contextWindowCompression"]);
  t !== void 0 && R != null && l(t, ["setup", "contextWindowCompression"], R);
  const $ = r(e, ["proactivity"]);
  if (t !== void 0 && $ != null && l(t, ["setup", "proactivity"], $), r(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const E = r(e, ["avatarConfig"]);
  t !== void 0 && E != null && l(t, ["setup", "avatarConfig"], E);
  const U = r(e, ["safetySettings"]);
  if (t !== void 0 && U != null) {
    let C = U;
    Array.isArray(C) && (C = C.map((k) => py(k))), l(t, ["setup", "safetySettings"], C);
  }
  return n;
}
function sy(e, t) {
  const n = {}, o = r(e, ["generationConfig"]);
  t !== void 0 && o != null && l(t, ["setup", "generationConfig"], ey(o));
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
  const h = r(e, ["seed"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], h);
  const f = r(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], Qi(f));
  const p = r(e, ["thinkingConfig"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], p);
  const m = r(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const g = r(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], X_(oe(g)));
  const _ = r(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let k = Ut(_);
    Array.isArray(k) && (k = k.map((O) => _y(Lt(O)))), l(t, ["setup", "tools"], k);
  }
  const y = r(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], y);
  const I = r(e, ["inputAudioTranscription"]);
  t !== void 0 && I != null && l(t, ["setup", "inputAudioTranscription"], I);
  const S = r(e, ["outputAudioTranscription"]);
  t !== void 0 && S != null && l(t, ["setup", "outputAudioTranscription"], S);
  const A = r(e, ["realtimeInputConfig"]);
  t !== void 0 && A != null && l(t, ["setup", "realtimeInputConfig"], A);
  const R = r(e, ["contextWindowCompression"]);
  t !== void 0 && R != null && l(t, ["setup", "contextWindowCompression"], R);
  const $ = r(e, ["proactivity"]);
  t !== void 0 && $ != null && l(t, ["setup", "proactivity"], $);
  const E = r(e, ["explicitVadSignal"]);
  t !== void 0 && E != null && l(t, ["setup", "explicitVadSignal"], E);
  const U = r(e, ["avatarConfig"]);
  t !== void 0 && U != null && l(t, ["setup", "avatarConfig"], U);
  const C = r(e, ["safetySettings"]);
  if (t !== void 0 && C != null) {
    let k = C;
    Array.isArray(k) && (k = k.map((O) => O)), l(t, ["setup", "safetySettings"], k);
  }
  return n;
}
function iy(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["setup", "model"], H(e, o));
  const s = r(t, ["config"]);
  return s != null && l(n, ["config"], oy(s, n)), n;
}
function ry(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["setup", "model"], H(e, o));
  const s = r(t, ["config"]);
  return s != null && l(n, ["config"], sy(s, n)), n;
}
function ay(e) {
  const t = {}, n = r(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function ly(e) {
  const t = {}, n = r(e, ["weightedPrompts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["weightedPrompts"], o);
  }
  return t;
}
function uy(e) {
  const t = {}, n = r(e, ["media"]);
  if (n != null) {
    let d = Fd(n);
    Array.isArray(d) && (d = d.map((h) => wo(h))), l(t, ["mediaChunks"], d);
  }
  const o = r(e, ["audio"]);
  o != null && l(t, ["audio"], wo(Bd(o)));
  const s = r(e, ["audioStreamEnd"]);
  s != null && l(t, ["audioStreamEnd"], s);
  const i = r(e, ["video"]);
  i != null && l(t, ["video"], wo(Gd(i)));
  const a = r(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = r(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = r(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function cy(e) {
  const t = {}, n = r(e, ["media"]);
  if (n != null) {
    let d = Fd(n);
    Array.isArray(d) && (d = d.map((h) => h)), l(t, ["mediaChunks"], d);
  }
  const o = r(e, ["audio"]);
  o != null && l(t, ["audio"], Bd(o));
  const s = r(e, ["audioStreamEnd"]);
  s != null && l(t, ["audioStreamEnd"], s);
  const i = r(e, ["video"]);
  i != null && l(t, ["video"], Gd(i));
  const a = r(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = r(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = r(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function dy(e) {
  const t = {}, n = r(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const o = r(e, ["serverContent"]);
  o != null && l(t, ["serverContent"], o);
  const s = r(e, ["toolCall"]);
  s != null && l(t, ["toolCall"], s);
  const i = r(e, ["toolCallCancellation"]);
  i != null && l(t, ["toolCallCancellation"], i);
  const a = r(e, ["usageMetadata"]);
  a != null && l(t, ["usageMetadata"], yy(a));
  const u = r(e, ["goAway"]);
  u != null && l(t, ["goAway"], u);
  const c = r(e, ["sessionResumptionUpdate"]);
  c != null && l(t, ["sessionResumptionUpdate"], c);
  const d = r(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const h = r(e, ["voiceActivity"]);
  return h != null && l(t, ["voiceActivity"], vy(h)), t;
}
function fy(e) {
  const t = {}, n = r(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = r(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const s = r(e, ["executableCode"]);
  s != null && l(t, ["executableCode"], s);
  const i = r(e, ["fileData"]);
  i != null && l(t, ["fileData"], Q_(i));
  const a = r(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], Z_(a));
  const u = r(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = r(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], wo(c));
  const d = r(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = r(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = r(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = r(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = r(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = r(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = r(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function hy(e) {
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
  const h = r(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = r(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = r(e, ["videoMetadata"]);
  if (p != null && l(t, ["videoMetadata"], p), r(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (r(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (r(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return t;
}
function py(e) {
  const t = {}, n = r(e, ["category"]);
  if (n != null && l(t, ["category"], n), r(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = r(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function my(e) {
  const t = {}, n = r(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), r(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function gy(e) {
  const t = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = r(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = r(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const s = r(e, ["googleSearch"]);
  s != null && l(t, ["googleSearch"], ny(s));
  const i = r(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], ty(i));
  const a = r(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), r(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = r(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const c = r(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), r(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = r(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = r(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
function _y(e) {
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
    let p = c;
    Array.isArray(p) && (p = p.map((m) => j_(m))), l(t, ["functionDeclarations"], p);
  }
  const d = r(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = r(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = r(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), r(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function yy(e) {
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
  const h = r(e, ["candidatesTokensDetails"]);
  if (h != null) {
    let m = h;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["responseTokensDetails"], m);
  }
  const f = r(e, ["toolUsePromptTokensDetails"]);
  if (f != null) {
    let m = f;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["toolUsePromptTokensDetails"], m);
  }
  const p = r(e, ["trafficType"]);
  return p != null && l(t, ["trafficType"], p), t;
}
function vy(e) {
  const t = {}, n = r(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function Ty(e, t) {
  const n = {}, o = r(e, ["apiKey"]);
  if (o != null && l(n, ["apiKey"], o), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function Ey(e, t) {
  const n = {}, o = r(e, ["data"]);
  if (o != null && l(n, ["data"], o), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const s = r(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function Sy(e, t) {
  const n = {}, o = r(e, ["content"]);
  o != null && l(n, ["content"], o);
  const s = r(e, ["citationMetadata"]);
  s != null && l(n, ["citationMetadata"], wy(s));
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
  const h = r(e, ["logprobsResult"]);
  h != null && l(n, ["logprobsResult"], h);
  const f = r(e, ["safetyRatings"]);
  if (f != null) {
    let m = f;
    Array.isArray(m) && (m = m.map((g) => g)), l(n, ["safetyRatings"], m);
  }
  const p = r(e, ["urlContextMetadata"]);
  return p != null && l(n, ["urlContextMetadata"], p), n;
}
function wy(e, t) {
  const n = {}, o = r(e, ["citationSources"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((i) => i)), l(n, ["citations"], s);
  }
  return n;
}
function Iy(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], H(e, s));
  const i = r(t, ["contents"]);
  if (i != null) {
    let a = pe(i);
    Array.isArray(a) && (a = a.map((u) => Ft(u))), l(o, ["contents"], a);
  }
  return o;
}
function Cy(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["tokensInfo"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => a)), l(n, ["tokensInfo"], i);
  }
  return n;
}
function Ay(e, t) {
  const n = {}, o = r(e, ["values"]);
  o != null && l(n, ["values"], o);
  const s = r(e, ["statistics"]);
  return s != null && l(n, ["statistics"], Ry(s)), n;
}
function Ry(e, t) {
  const n = {}, o = r(e, ["truncated"]);
  o != null && l(n, ["truncated"], o);
  const s = r(e, ["token_count"]);
  return s != null && l(n, ["tokenCount"], s), n;
}
function Ln(e, t) {
  const n = {}, o = r(e, ["parts"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Uv(a))), l(n, ["parts"], i);
  }
  const s = r(e, ["role"]);
  return s != null && l(n, ["role"], s), n;
}
function Ft(e, t) {
  const n = {}, o = r(e, ["parts"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => $v(a))), l(n, ["parts"], i);
  }
  const s = r(e, ["role"]);
  return s != null && l(n, ["role"], s), n;
}
function by(e, t) {
  const n = {}, o = r(e, ["controlType"]);
  o != null && l(n, ["controlType"], o);
  const s = r(e, ["enableControlImageComputation"]);
  return s != null && l(n, ["computeControl"], s), n;
}
function Py(e, t) {
  const n = {};
  if (r(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (r(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (r(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function xy(e, t, n) {
  const o = {}, s = r(e, ["systemInstruction"]);
  t !== void 0 && s != null && l(t, ["systemInstruction"], Ft(oe(s)));
  const i = r(e, ["tools"]);
  if (t !== void 0 && i != null) {
    let u = i;
    Array.isArray(u) && (u = u.map((c) => nf(c))), l(t, ["tools"], u);
  }
  const a = r(e, ["generationConfig"]);
  return t !== void 0 && a != null && l(t, ["generationConfig"], Ev(a)), o;
}
function My(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], H(e, s));
  const i = r(t, ["contents"]);
  if (i != null) {
    let u = pe(i);
    Array.isArray(u) && (u = u.map((c) => Ln(c))), l(o, ["contents"], u);
  }
  const a = r(t, ["config"]);
  return a != null && Py(a), o;
}
function Ny(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], H(e, s));
  const i = r(t, ["contents"]);
  if (i != null) {
    let u = pe(i);
    Array.isArray(u) && (u = u.map((c) => Ft(c))), l(o, ["contents"], u);
  }
  const a = r(t, ["config"]);
  return a != null && xy(a, o), o;
}
function ky(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["totalTokens"]);
  s != null && l(n, ["totalTokens"], s);
  const i = r(e, ["cachedContentTokenCount"]);
  return i != null && l(n, ["cachedContentTokenCount"], i), n;
}
function Dy(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["totalTokens"]);
  return s != null && l(n, ["totalTokens"], s), n;
}
function Ly(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  return s != null && l(o, ["_url", "name"], H(e, s)), o;
}
function Uy(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  return s != null && l(o, ["_url", "name"], H(e, s)), o;
}
function $y(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function Fy(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function Gy(e, t, n) {
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
  const h = r(e, ["safetyFilterLevel"]);
  t !== void 0 && h != null && l(t, ["parameters", "safetySetting"], h);
  const f = r(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const p = r(e, ["includeSafetyAttributes"]);
  t !== void 0 && p != null && l(t, ["parameters", "includeSafetyAttributes"], p);
  const m = r(e, ["includeRaiReason"]);
  t !== void 0 && m != null && l(t, ["parameters", "includeRaiReason"], m);
  const g = r(e, ["language"]);
  t !== void 0 && g != null && l(t, ["parameters", "language"], g);
  const _ = r(e, ["outputMimeType"]);
  t !== void 0 && _ != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], _);
  const y = r(e, ["outputCompressionQuality"]);
  t !== void 0 && y != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], y);
  const I = r(e, ["addWatermark"]);
  t !== void 0 && I != null && l(t, ["parameters", "addWatermark"], I);
  const S = r(e, ["labels"]);
  t !== void 0 && S != null && l(t, ["labels"], S);
  const A = r(e, ["editMode"]);
  t !== void 0 && A != null && l(t, ["parameters", "editMode"], A);
  const R = r(e, ["baseSteps"]);
  return t !== void 0 && R != null && l(t, [
    "parameters",
    "editConfig",
    "baseSteps"
  ], R), o;
}
function By(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], H(e, s));
  const i = r(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = r(t, ["referenceImages"]);
  if (a != null) {
    let c = a;
    Array.isArray(c) && (c = c.map((d) => Vv(d))), l(o, ["instances[0]", "referenceImages"], c);
  }
  const u = r(t, ["config"]);
  return u != null && Gy(u, o), o;
}
function qy(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["predictions"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => Zo(a))), l(n, ["generatedImages"], i);
  }
  return n;
}
function Oy(e, t, n) {
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
function Vy(e, t, n) {
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
  let h = r(n, ["embeddingApiType"]);
  if (h === void 0 && (h = "PREDICT"), h === "EMBED_CONTENT") {
    const f = r(e, ["audioTrackExtraction"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "audioTrackExtraction"], f);
  }
  return o;
}
function Hy(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], H(e, s));
  const i = r(t, ["contents"]);
  if (i != null) {
    let d = Yi(e, i);
    Array.isArray(d) && (d = d.map((h) => h)), l(o, ["requests[]", "content"], d);
  }
  const a = r(t, ["content"]);
  a != null && Ln(oe(a));
  const u = r(t, ["config"]);
  u != null && Oy(u, o);
  const c = r(t, ["model"]);
  return c !== void 0 && l(o, ["requests[]", "model"], H(e, c)), o;
}
function Jy(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], H(e, s));
  let i = r(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const c = r(t, ["contents"]);
    if (c != null) {
      let d = Yi(e, c);
      Array.isArray(d) && (d = d.map((h) => h)), l(o, ["instances[]", "content"], d);
    }
  }
  let a = r(n, ["embeddingApiType"]);
  if (a === void 0 && (a = "PREDICT"), a === "EMBED_CONTENT") {
    const c = r(t, ["content"]);
    c != null && l(o, ["content"], Ft(oe(c)));
  }
  const u = r(t, ["config"]);
  return u != null && Vy(u, o, n), o;
}
function Wy(e, t) {
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
function Ky(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["predictions[]", "embeddings"]);
  if (s != null) {
    let a = s;
    Array.isArray(a) && (a = a.map((u) => Ay(u))), l(n, ["embeddings"], a);
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
function Yy(e, t) {
  const n = {}, o = r(e, ["endpoint"]);
  o != null && l(n, ["name"], o);
  const s = r(e, ["deployedModelId"]);
  return s != null && l(n, ["deployedModelId"], s), n;
}
function zy(e, t) {
  const n = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["fileUri"]);
  o != null && l(n, ["fileUri"], o);
  const s = r(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function Xy(e, t) {
  const n = {}, o = r(e, ["id"]);
  o != null && l(n, ["id"], o);
  const s = r(e, ["args"]);
  s != null && l(n, ["args"], s);
  const i = r(e, ["name"]);
  if (i != null && l(n, ["name"], i), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function Qy(e, t) {
  const n = {}, o = r(e, ["allowedFunctionNames"]);
  o != null && l(n, ["allowedFunctionNames"], o);
  const s = r(e, ["mode"]);
  if (s != null && l(n, ["mode"], s), r(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function Zy(e, t) {
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
function jy(e, t, n, o) {
  const s = {}, i = r(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], Ln(oe(i)));
  const a = r(t, ["temperature"]);
  a != null && l(s, ["temperature"], a);
  const u = r(t, ["topP"]);
  u != null && l(s, ["topP"], u);
  const c = r(t, ["topK"]);
  c != null && l(s, ["topK"], c);
  const d = r(t, ["candidateCount"]);
  d != null && l(s, ["candidateCount"], d);
  const h = r(t, ["maxOutputTokens"]);
  h != null && l(s, ["maxOutputTokens"], h);
  const f = r(t, ["stopSequences"]);
  f != null && l(s, ["stopSequences"], f);
  const p = r(t, ["responseLogprobs"]);
  p != null && l(s, ["responseLogprobs"], p);
  const m = r(t, ["logprobs"]);
  m != null && l(s, ["logprobs"], m);
  const g = r(t, ["presencePenalty"]);
  g != null && l(s, ["presencePenalty"], g);
  const _ = r(t, ["frequencyPenalty"]);
  _ != null && l(s, ["frequencyPenalty"], _);
  const y = r(t, ["seed"]);
  y != null && l(s, ["seed"], y);
  const I = r(t, ["responseMimeType"]);
  I != null && l(s, ["responseMimeType"], I);
  const S = r(t, ["responseSchema"]);
  S != null && l(s, ["responseSchema"], zi(S));
  const A = r(t, ["responseJsonSchema"]);
  if (A != null && l(s, ["responseJsonSchema"], A), r(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (r(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const R = r(t, ["safetySettings"]);
  if (n !== void 0 && R != null) {
    let W = R;
    Array.isArray(W) && (W = W.map((Ge) => Hv(Ge))), l(n, ["safetySettings"], W);
  }
  const $ = r(t, ["tools"]);
  if (n !== void 0 && $ != null) {
    let W = Ut($);
    Array.isArray(W) && (W = W.map((Ge) => Zv(Lt(Ge)))), l(n, ["tools"], W);
  }
  const E = r(t, ["toolConfig"]);
  if (n !== void 0 && E != null && l(n, ["toolConfig"], Xv(E)), r(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const U = r(t, ["cachedContent"]);
  n !== void 0 && U != null && l(n, ["cachedContent"], Ke(e, U));
  const C = r(t, ["responseModalities"]);
  C != null && l(s, ["responseModalities"], C);
  const k = r(t, ["mediaResolution"]);
  k != null && l(s, ["mediaResolution"], k);
  const O = r(t, ["speechConfig"]);
  if (O != null && l(s, ["speechConfig"], Xi(O)), r(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const J = r(t, ["thinkingConfig"]);
  J != null && l(s, ["thinkingConfig"], J);
  const de = r(t, ["imageConfig"]);
  de != null && l(s, ["imageConfig"], Av(de));
  const ae = r(t, ["enableEnhancedCivicAnswers"]);
  if (ae != null && l(s, ["enableEnhancedCivicAnswers"], ae), r(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const Y = r(t, ["serviceTier"]);
  return n !== void 0 && Y != null && l(n, ["serviceTier"], Y), s;
}
function ev(e, t, n, o) {
  const s = {}, i = r(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], Ft(oe(i)));
  const a = r(t, ["temperature"]);
  a != null && l(s, ["temperature"], a);
  const u = r(t, ["topP"]);
  u != null && l(s, ["topP"], u);
  const c = r(t, ["topK"]);
  c != null && l(s, ["topK"], c);
  const d = r(t, ["candidateCount"]);
  d != null && l(s, ["candidateCount"], d);
  const h = r(t, ["maxOutputTokens"]);
  h != null && l(s, ["maxOutputTokens"], h);
  const f = r(t, ["stopSequences"]);
  f != null && l(s, ["stopSequences"], f);
  const p = r(t, ["responseLogprobs"]);
  p != null && l(s, ["responseLogprobs"], p);
  const m = r(t, ["logprobs"]);
  m != null && l(s, ["logprobs"], m);
  const g = r(t, ["presencePenalty"]);
  g != null && l(s, ["presencePenalty"], g);
  const _ = r(t, ["frequencyPenalty"]);
  _ != null && l(s, ["frequencyPenalty"], _);
  const y = r(t, ["seed"]);
  y != null && l(s, ["seed"], y);
  const I = r(t, ["responseMimeType"]);
  I != null && l(s, ["responseMimeType"], I);
  const S = r(t, ["responseSchema"]);
  S != null && l(s, ["responseSchema"], zi(S));
  const A = r(t, ["responseJsonSchema"]);
  A != null && l(s, ["responseJsonSchema"], A);
  const R = r(t, ["routingConfig"]);
  R != null && l(s, ["routingConfig"], R);
  const $ = r(t, ["modelSelectionConfig"]);
  $ != null && l(s, ["modelConfig"], $);
  const E = r(t, ["safetySettings"]);
  if (n !== void 0 && E != null) {
    let Re = E;
    Array.isArray(Re) && (Re = Re.map((ns) => ns)), l(n, ["safetySettings"], Re);
  }
  const U = r(t, ["tools"]);
  if (n !== void 0 && U != null) {
    let Re = Ut(U);
    Array.isArray(Re) && (Re = Re.map((ns) => nf(Lt(ns)))), l(n, ["tools"], Re);
  }
  const C = r(t, ["toolConfig"]);
  n !== void 0 && C != null && l(n, ["toolConfig"], Qv(C));
  const k = r(t, ["labels"]);
  n !== void 0 && k != null && l(n, ["labels"], k);
  const O = r(t, ["cachedContent"]);
  n !== void 0 && O != null && l(n, ["cachedContent"], Ke(e, O));
  const J = r(t, ["responseModalities"]);
  J != null && l(s, ["responseModalities"], J);
  const de = r(t, ["mediaResolution"]);
  de != null && l(s, ["mediaResolution"], de);
  const ae = r(t, ["speechConfig"]);
  ae != null && l(s, ["speechConfig"], Xi(ae));
  const Y = r(t, ["audioTimestamp"]);
  Y != null && l(s, ["audioTimestamp"], Y);
  const W = r(t, ["thinkingConfig"]);
  W != null && l(s, ["thinkingConfig"], W);
  const Ge = r(t, ["imageConfig"]);
  if (Ge != null && l(s, ["imageConfig"], Rv(Ge)), r(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const Gt = r(t, ["modelArmorConfig"]);
  n !== void 0 && Gt != null && l(n, ["modelArmorConfig"], Gt);
  const nt = r(t, ["serviceTier"]);
  return n !== void 0 && nt != null && l(n, ["serviceTier"], nt), s;
}
function Dl(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], H(e, s));
  const i = r(t, ["contents"]);
  if (i != null) {
    let u = pe(i);
    Array.isArray(u) && (u = u.map((c) => Ln(c))), l(o, ["contents"], u);
  }
  const a = r(t, ["config"]);
  return a != null && l(o, ["generationConfig"], jy(e, a, o)), o;
}
function Ll(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], H(e, s));
  const i = r(t, ["contents"]);
  if (i != null) {
    let u = pe(i);
    Array.isArray(u) && (u = u.map((c) => Ft(c))), l(o, ["contents"], u);
  }
  const a = r(t, ["config"]);
  return a != null && l(o, ["generationConfig"], ev(e, a, o)), o;
}
function Ul(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["candidates"]);
  if (s != null) {
    let h = s;
    Array.isArray(h) && (h = h.map((f) => Sy(f))), l(n, ["candidates"], h);
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
function $l(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["candidates"]);
  if (s != null) {
    let h = s;
    Array.isArray(h) && (h = h.map((f) => f)), l(n, ["candidates"], h);
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
function tv(e, t, n) {
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
  const h = r(e, ["includeRaiReason"]);
  t !== void 0 && h != null && l(t, ["parameters", "includeRaiReason"], h);
  const f = r(e, ["language"]);
  t !== void 0 && f != null && l(t, ["parameters", "language"], f);
  const p = r(e, ["outputMimeType"]);
  t !== void 0 && p != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], p);
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
function nv(e, t, n) {
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
  const h = r(e, ["safetyFilterLevel"]);
  t !== void 0 && h != null && l(t, ["parameters", "safetySetting"], h);
  const f = r(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const p = r(e, ["includeSafetyAttributes"]);
  t !== void 0 && p != null && l(t, ["parameters", "includeSafetyAttributes"], p);
  const m = r(e, ["includeRaiReason"]);
  t !== void 0 && m != null && l(t, ["parameters", "includeRaiReason"], m);
  const g = r(e, ["language"]);
  t !== void 0 && g != null && l(t, ["parameters", "language"], g);
  const _ = r(e, ["outputMimeType"]);
  t !== void 0 && _ != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], _);
  const y = r(e, ["outputCompressionQuality"]);
  t !== void 0 && y != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], y);
  const I = r(e, ["addWatermark"]);
  t !== void 0 && I != null && l(t, ["parameters", "addWatermark"], I);
  const S = r(e, ["labels"]);
  t !== void 0 && S != null && l(t, ["labels"], S);
  const A = r(e, ["imageSize"]);
  t !== void 0 && A != null && l(t, ["parameters", "sampleImageSize"], A);
  const R = r(e, ["enhancePrompt"]);
  return t !== void 0 && R != null && l(t, ["parameters", "enhancePrompt"], R), o;
}
function ov(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], H(e, s));
  const i = r(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = r(t, ["config"]);
  return a != null && tv(a, o), o;
}
function sv(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], H(e, s));
  const i = r(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = r(t, ["config"]);
  return a != null && nv(a, o), o;
}
function iv(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["predictions"]);
  if (s != null) {
    let a = s;
    Array.isArray(a) && (a = a.map((u) => _v(u))), l(n, ["generatedImages"], a);
  }
  const i = r(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], ef(i)), n;
}
function rv(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["predictions"]);
  if (s != null) {
    let a = s;
    Array.isArray(a) && (a = a.map((u) => Zo(u))), l(n, ["generatedImages"], a);
  }
  const i = r(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], tf(i)), n;
}
function av(e, t, n) {
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
  const h = r(e, ["enhancePrompt"]);
  if (t !== void 0 && h != null && l(t, ["parameters", "enhancePrompt"], h), r(e, ["generateAudio"]) !== void 0) throw new Error("generateAudio parameter is not supported in Gemini API.");
  const f = r(e, ["lastFrame"]);
  t !== void 0 && f != null && l(t, ["instances[0]", "lastFrame"], jo(f));
  const p = r(e, ["referenceImages"]);
  if (t !== void 0 && p != null) {
    let g = p;
    Array.isArray(g) && (g = g.map((_) => dT(_))), l(t, ["instances[0]", "referenceImages"], g);
  }
  if (r(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (r(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (r(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = r(e, ["webhookConfig"]);
  return t !== void 0 && m != null && l(t, ["webhookConfig"], m), o;
}
function lv(e, t, n) {
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
  const h = r(e, ["resolution"]);
  t !== void 0 && h != null && l(t, ["parameters", "resolution"], h);
  const f = r(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const p = r(e, ["pubsubTopic"]);
  t !== void 0 && p != null && l(t, ["parameters", "pubsubTopic"], p);
  const m = r(e, ["negativePrompt"]);
  t !== void 0 && m != null && l(t, ["parameters", "negativePrompt"], m);
  const g = r(e, ["enhancePrompt"]);
  t !== void 0 && g != null && l(t, ["parameters", "enhancePrompt"], g);
  const _ = r(e, ["generateAudio"]);
  t !== void 0 && _ != null && l(t, ["parameters", "generateAudio"], _);
  const y = r(e, ["lastFrame"]);
  t !== void 0 && y != null && l(t, ["instances[0]", "lastFrame"], ke(y));
  const I = r(e, ["referenceImages"]);
  if (t !== void 0 && I != null) {
    let $ = I;
    Array.isArray($) && ($ = $.map((E) => fT(E))), l(t, ["instances[0]", "referenceImages"], $);
  }
  const S = r(e, ["mask"]);
  t !== void 0 && S != null && l(t, ["instances[0]", "mask"], cT(S));
  const A = r(e, ["compressionQuality"]);
  t !== void 0 && A != null && l(t, ["parameters", "compressionQuality"], A);
  const R = r(e, ["labels"]);
  if (t !== void 0 && R != null && l(t, ["labels"], R), r(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return o;
}
function uv(e, t) {
  const n = {}, o = r(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = r(e, ["metadata"]);
  s != null && l(n, ["metadata"], s);
  const i = r(e, ["done"]);
  i != null && l(n, ["done"], i);
  const a = r(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = r(e, ["response", "generateVideoResponse"]);
  return u != null && l(n, ["response"], hv(u)), n;
}
function cv(e, t) {
  const n = {}, o = r(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = r(e, ["metadata"]);
  s != null && l(n, ["metadata"], s);
  const i = r(e, ["done"]);
  i != null && l(n, ["done"], i);
  const a = r(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = r(e, ["response"]);
  return u != null && l(n, ["response"], pv(u)), n;
}
function dv(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], H(e, s));
  const i = r(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = r(t, ["image"]);
  a != null && l(o, ["instances[0]", "image"], jo(a));
  const u = r(t, ["video"]);
  u != null && l(o, ["instances[0]", "video"], of(u));
  const c = r(t, ["source"]);
  c != null && mv(c, o);
  const d = r(t, ["config"]);
  return d != null && av(d, o), o;
}
function fv(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], H(e, s));
  const i = r(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = r(t, ["image"]);
  a != null && l(o, ["instances[0]", "image"], ke(a));
  const u = r(t, ["video"]);
  u != null && l(o, ["instances[0]", "video"], sf(u));
  const c = r(t, ["source"]);
  c != null && gv(c, o);
  const d = r(t, ["config"]);
  return d != null && lv(d, o), o;
}
function hv(e, t) {
  const n = {}, o = r(e, ["generatedSamples"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => vv(u))), l(n, ["generatedVideos"], a);
  }
  const s = r(e, ["raiMediaFilteredCount"]);
  s != null && l(n, ["raiMediaFilteredCount"], s);
  const i = r(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function pv(e, t) {
  const n = {}, o = r(e, ["videos"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => Tv(u))), l(n, ["generatedVideos"], a);
  }
  const s = r(e, ["raiMediaFilteredCount"]);
  s != null && l(n, ["raiMediaFilteredCount"], s);
  const i = r(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function mv(e, t, n) {
  const o = {}, s = r(e, ["prompt"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "prompt"], s);
  const i = r(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], jo(i));
  const a = r(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], of(a)), o;
}
function gv(e, t, n) {
  const o = {}, s = r(e, ["prompt"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "prompt"], s);
  const i = r(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], ke(i));
  const a = r(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], sf(a)), o;
}
function _v(e, t) {
  const n = {}, o = r(e, ["_self"]);
  o != null && l(n, ["image"], bv(o));
  const s = r(e, ["raiFilteredReason"]);
  s != null && l(n, ["raiFilteredReason"], s);
  const i = r(e, ["_self"]);
  return i != null && l(n, ["safetyAttributes"], ef(i)), n;
}
function Zo(e, t) {
  const n = {}, o = r(e, ["_self"]);
  o != null && l(n, ["image"], jd(o));
  const s = r(e, ["raiFilteredReason"]);
  s != null && l(n, ["raiFilteredReason"], s);
  const i = r(e, ["_self"]);
  i != null && l(n, ["safetyAttributes"], tf(i));
  const a = r(e, ["prompt"]);
  return a != null && l(n, ["enhancedPrompt"], a), n;
}
function yv(e, t) {
  const n = {}, o = r(e, ["_self"]);
  o != null && l(n, ["mask"], jd(o));
  const s = r(e, ["labels"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => a)), l(n, ["labels"], i);
  }
  return n;
}
function vv(e, t) {
  const n = {}, o = r(e, ["video"]);
  return o != null && l(n, ["video"], lT(o)), n;
}
function Tv(e, t) {
  const n = {}, o = r(e, ["_self"]);
  return o != null && l(n, ["video"], uT(o)), n;
}
function Ev(e, t) {
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
  const h = r(e, ["maxOutputTokens"]);
  h != null && l(n, ["maxOutputTokens"], h);
  const f = r(e, ["mediaResolution"]);
  f != null && l(n, ["mediaResolution"], f);
  const p = r(e, ["presencePenalty"]);
  p != null && l(n, ["presencePenalty"], p);
  const m = r(e, ["responseLogprobs"]);
  m != null && l(n, ["responseLogprobs"], m);
  const g = r(e, ["responseMimeType"]);
  g != null && l(n, ["responseMimeType"], g);
  const _ = r(e, ["responseModalities"]);
  _ != null && l(n, ["responseModalities"], _);
  const y = r(e, ["responseSchema"]);
  y != null && l(n, ["responseSchema"], y);
  const I = r(e, ["routingConfig"]);
  I != null && l(n, ["routingConfig"], I);
  const S = r(e, ["seed"]);
  S != null && l(n, ["seed"], S);
  const A = r(e, ["speechConfig"]);
  A != null && l(n, ["speechConfig"], A);
  const R = r(e, ["stopSequences"]);
  R != null && l(n, ["stopSequences"], R);
  const $ = r(e, ["temperature"]);
  $ != null && l(n, ["temperature"], $);
  const E = r(e, ["thinkingConfig"]);
  E != null && l(n, ["thinkingConfig"], E);
  const U = r(e, ["topK"]);
  U != null && l(n, ["topK"], U);
  const C = r(e, ["topP"]);
  if (C != null && l(n, ["topP"], C), r(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return n;
}
function Sv(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  return s != null && l(o, ["_url", "name"], H(e, s)), o;
}
function wv(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  return s != null && l(o, ["_url", "name"], H(e, s)), o;
}
function Iv(e, t) {
  const n = {}, o = r(e, ["authConfig"]);
  o != null && l(n, ["authConfig"], Ty(o));
  const s = r(e, ["enableWidget"]);
  return s != null && l(n, ["enableWidget"], s), n;
}
function Cv(e, t) {
  const n = {}, o = r(e, ["searchTypes"]);
  if (o != null && l(n, ["searchTypes"], o), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const s = r(e, ["timeRangeFilter"]);
  return s != null && l(n, ["timeRangeFilter"], s), n;
}
function Av(e, t) {
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
function Rv(e, t) {
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
function bv(e, t) {
  const n = {}, o = r(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["imageBytes"], tt(o));
  const s = r(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function jd(e, t) {
  const n = {}, o = r(e, ["gcsUri"]);
  o != null && l(n, ["gcsUri"], o);
  const s = r(e, ["bytesBase64Encoded"]);
  s != null && l(n, ["imageBytes"], tt(s));
  const i = r(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function jo(e, t) {
  const n = {};
  if (r(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  const o = r(e, ["imageBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], tt(o));
  const s = r(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function ke(e, t) {
  const n = {}, o = r(e, ["gcsUri"]);
  o != null && l(n, ["gcsUri"], o);
  const s = r(e, ["imageBytes"]);
  s != null && l(n, ["bytesBase64Encoded"], tt(s));
  const i = r(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function Pv(e, t, n, o) {
  const s = {}, i = r(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const a = r(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = r(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = r(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], Hd(e, c)), s;
}
function xv(e, t, n, o) {
  const s = {}, i = r(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const a = r(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = r(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = r(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], Hd(e, c)), s;
}
function Mv(e, t, n) {
  const o = {}, s = r(t, ["config"]);
  return s != null && Pv(e, s, o), o;
}
function Nv(e, t, n) {
  const o = {}, s = r(t, ["config"]);
  return s != null && xv(e, s, o), o;
}
function kv(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["nextPageToken"]);
  s != null && l(n, ["nextPageToken"], s);
  const i = r(e, ["_self"]);
  if (i != null) {
    let a = Jd(i);
    Array.isArray(a) && (a = a.map((u) => ri(u))), l(n, ["models"], a);
  }
  return n;
}
function Dv(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["nextPageToken"]);
  s != null && l(n, ["nextPageToken"], s);
  const i = r(e, ["_self"]);
  if (i != null) {
    let a = Jd(i);
    Array.isArray(a) && (a = a.map((u) => ai(u))), l(n, ["models"], a);
  }
  return n;
}
function Lv(e, t) {
  const n = {}, o = r(e, ["maskMode"]);
  o != null && l(n, ["maskMode"], o);
  const s = r(e, ["segmentationClasses"]);
  s != null && l(n, ["maskClasses"], s);
  const i = r(e, ["maskDilation"]);
  return i != null && l(n, ["dilation"], i), n;
}
function ri(e, t) {
  const n = {}, o = r(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = r(e, ["displayName"]);
  s != null && l(n, ["displayName"], s);
  const i = r(e, ["description"]);
  i != null && l(n, ["description"], i);
  const a = r(e, ["version"]);
  a != null && l(n, ["version"], a);
  const u = r(e, ["_self"]);
  u != null && l(n, ["tunedModelInfo"], jv(u));
  const c = r(e, ["inputTokenLimit"]);
  c != null && l(n, ["inputTokenLimit"], c);
  const d = r(e, ["outputTokenLimit"]);
  d != null && l(n, ["outputTokenLimit"], d);
  const h = r(e, ["supportedGenerationMethods"]);
  h != null && l(n, ["supportedActions"], h);
  const f = r(e, ["temperature"]);
  f != null && l(n, ["temperature"], f);
  const p = r(e, ["maxTemperature"]);
  p != null && l(n, ["maxTemperature"], p);
  const m = r(e, ["topP"]);
  m != null && l(n, ["topP"], m);
  const g = r(e, ["topK"]);
  g != null && l(n, ["topK"], g);
  const _ = r(e, ["thinking"]);
  return _ != null && l(n, ["thinking"], _), n;
}
function ai(e, t) {
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
    let p = u;
    Array.isArray(p) && (p = p.map((m) => Yy(m))), l(n, ["endpoints"], p);
  }
  const c = r(e, ["labels"]);
  c != null && l(n, ["labels"], c);
  const d = r(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], eT(d));
  const h = r(e, ["defaultCheckpointId"]);
  h != null && l(n, ["defaultCheckpointId"], h);
  const f = r(e, ["checkpoints"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["checkpoints"], p);
  }
  return n;
}
function Uv(e, t) {
  const n = {}, o = r(e, ["mediaResolution"]);
  o != null && l(n, ["mediaResolution"], o);
  const s = r(e, ["codeExecutionResult"]);
  s != null && l(n, ["codeExecutionResult"], s);
  const i = r(e, ["executableCode"]);
  i != null && l(n, ["executableCode"], i);
  const a = r(e, ["fileData"]);
  a != null && l(n, ["fileData"], zy(a));
  const u = r(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], Xy(u));
  const c = r(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = r(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], Ey(d));
  const h = r(e, ["text"]);
  h != null && l(n, ["text"], h);
  const f = r(e, ["thought"]);
  f != null && l(n, ["thought"], f);
  const p = r(e, ["thoughtSignature"]);
  p != null && l(n, ["thoughtSignature"], p);
  const m = r(e, ["videoMetadata"]);
  m != null && l(n, ["videoMetadata"], m);
  const g = r(e, ["toolCall"]);
  g != null && l(n, ["toolCall"], g);
  const _ = r(e, ["toolResponse"]);
  _ != null && l(n, ["toolResponse"], _);
  const y = r(e, ["partMetadata"]);
  return y != null && l(n, ["partMetadata"], y), n;
}
function $v(e, t) {
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
  const h = r(e, ["text"]);
  h != null && l(n, ["text"], h);
  const f = r(e, ["thought"]);
  f != null && l(n, ["thought"], f);
  const p = r(e, ["thoughtSignature"]);
  p != null && l(n, ["thoughtSignature"], p);
  const m = r(e, ["videoMetadata"]);
  if (m != null && l(n, ["videoMetadata"], m), r(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (r(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (r(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return n;
}
function Fv(e, t) {
  const n = {}, o = r(e, ["productImage"]);
  return o != null && l(n, ["image"], ke(o)), n;
}
function Gv(e, t, n) {
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
  const h = r(e, ["addWatermark"]);
  t !== void 0 && h != null && l(t, ["parameters", "addWatermark"], h);
  const f = r(e, ["outputMimeType"]);
  t !== void 0 && f != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], f);
  const p = r(e, ["outputCompressionQuality"]);
  t !== void 0 && p != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], p);
  const m = r(e, ["enhancePrompt"]);
  t !== void 0 && m != null && l(t, ["parameters", "enhancePrompt"], m);
  const g = r(e, ["labels"]);
  return t !== void 0 && g != null && l(t, ["labels"], g), o;
}
function Bv(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], H(e, s));
  const i = r(t, ["source"]);
  i != null && Ov(i, o);
  const a = r(t, ["config"]);
  return a != null && Gv(a, o), o;
}
function qv(e, t) {
  const n = {}, o = r(e, ["predictions"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((i) => Zo(i))), l(n, ["generatedImages"], s);
  }
  return n;
}
function Ov(e, t, n) {
  const o = {}, s = r(e, ["prompt"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "prompt"], s);
  const i = r(e, ["personImage"]);
  t !== void 0 && i != null && l(t, [
    "instances[0]",
    "personImage",
    "image"
  ], ke(i));
  const a = r(e, ["productImages"]);
  if (t !== void 0 && a != null) {
    let u = a;
    Array.isArray(u) && (u = u.map((c) => Fv(c))), l(t, ["instances[0]", "productImages"], u);
  }
  return o;
}
function Vv(e, t) {
  const n = {}, o = r(e, ["referenceImage"]);
  o != null && l(n, ["referenceImage"], ke(o));
  const s = r(e, ["referenceId"]);
  s != null && l(n, ["referenceId"], s);
  const i = r(e, ["referenceType"]);
  i != null && l(n, ["referenceType"], i);
  const a = r(e, ["maskImageConfig"]);
  a != null && l(n, ["maskImageConfig"], Lv(a));
  const u = r(e, ["controlImageConfig"]);
  u != null && l(n, ["controlImageConfig"], by(u));
  const c = r(e, ["styleImageConfig"]);
  c != null && l(n, ["styleImageConfig"], c);
  const d = r(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function ef(e, t) {
  const n = {}, o = r(e, ["safetyAttributes", "categories"]);
  o != null && l(n, ["categories"], o);
  const s = r(e, ["safetyAttributes", "scores"]);
  s != null && l(n, ["scores"], s);
  const i = r(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function tf(e, t) {
  const n = {}, o = r(e, ["safetyAttributes", "categories"]);
  o != null && l(n, ["categories"], o);
  const s = r(e, ["safetyAttributes", "scores"]);
  s != null && l(n, ["scores"], s);
  const i = r(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function Hv(e, t) {
  const n = {}, o = r(e, ["category"]);
  if (o != null && l(n, ["category"], o), r(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const s = r(e, ["threshold"]);
  return s != null && l(n, ["threshold"], s), n;
}
function Jv(e, t) {
  const n = {}, o = r(e, ["image"]);
  return o != null && l(n, ["image"], ke(o)), n;
}
function Wv(e, t, n) {
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
function Kv(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], H(e, s));
  const i = r(t, ["source"]);
  i != null && zv(i, o);
  const a = r(t, ["config"]);
  return a != null && Wv(a, o), o;
}
function Yv(e, t) {
  const n = {}, o = r(e, ["predictions"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((i) => yv(i))), l(n, ["generatedMasks"], s);
  }
  return n;
}
function zv(e, t, n) {
  const o = {}, s = r(e, ["prompt"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "prompt"], s);
  const i = r(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], ke(i));
  const a = r(e, ["scribbleImage"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "scribble"], Jv(a)), o;
}
function Xv(e, t) {
  const n = {}, o = r(e, ["retrievalConfig"]);
  o != null && l(n, ["retrievalConfig"], o);
  const s = r(e, ["functionCallingConfig"]);
  s != null && l(n, ["functionCallingConfig"], Qy(s));
  const i = r(e, ["includeServerSideToolInvocations"]);
  return i != null && l(n, ["includeServerSideToolInvocations"], i), n;
}
function Qv(e, t) {
  const n = {}, o = r(e, ["retrievalConfig"]);
  o != null && l(n, ["retrievalConfig"], o);
  const s = r(e, ["functionCallingConfig"]);
  if (s != null && l(n, ["functionCallingConfig"], s), r(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function Zv(e, t) {
  const n = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const o = r(e, ["computerUse"]);
  o != null && l(n, ["computerUse"], o);
  const s = r(e, ["fileSearch"]);
  s != null && l(n, ["fileSearch"], s);
  const i = r(e, ["googleSearch"]);
  i != null && l(n, ["googleSearch"], Cv(i));
  const a = r(e, ["googleMaps"]);
  a != null && l(n, ["googleMaps"], Iv(a));
  const u = r(e, ["codeExecution"]);
  if (u != null && l(n, ["codeExecution"], u), r(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const c = r(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["functionDeclarations"], p);
  }
  const d = r(e, ["googleSearchRetrieval"]);
  if (d != null && l(n, ["googleSearchRetrieval"], d), r(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const h = r(e, ["urlContext"]);
  h != null && l(n, ["urlContext"], h);
  const f = r(e, ["mcpServers"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["mcpServers"], p);
  }
  return n;
}
function nf(e, t) {
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
    Array.isArray(m) && (m = m.map((g) => Zy(g))), l(n, ["functionDeclarations"], m);
  }
  const h = r(e, ["googleSearchRetrieval"]);
  h != null && l(n, ["googleSearchRetrieval"], h);
  const f = r(e, ["parallelAiSearch"]);
  f != null && l(n, ["parallelAiSearch"], f);
  const p = r(e, ["urlContext"]);
  if (p != null && l(n, ["urlContext"], p), r(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function jv(e, t) {
  const n = {}, o = r(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const s = r(e, ["createTime"]);
  s != null && l(n, ["createTime"], s);
  const i = r(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function eT(e, t) {
  const n = {}, o = r(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  o != null && l(n, ["baseModel"], o);
  const s = r(e, ["createTime"]);
  s != null && l(n, ["createTime"], s);
  const i = r(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function tT(e, t, n) {
  const o = {}, s = r(e, ["displayName"]);
  t !== void 0 && s != null && l(t, ["displayName"], s);
  const i = r(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const a = r(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), o;
}
function nT(e, t, n) {
  const o = {}, s = r(e, ["displayName"]);
  t !== void 0 && s != null && l(t, ["displayName"], s);
  const i = r(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const a = r(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), o;
}
function oT(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "name"], H(e, s));
  const i = r(t, ["config"]);
  return i != null && tT(i, o), o;
}
function sT(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], H(e, s));
  const i = r(t, ["config"]);
  return i != null && nT(i, o), o;
}
function iT(e, t, n) {
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
  const h = r(e, ["enhanceInputImage"]);
  t !== void 0 && h != null && l(t, [
    "parameters",
    "upscaleConfig",
    "enhanceInputImage"
  ], h);
  const f = r(e, ["imagePreservationFactor"]);
  t !== void 0 && f != null && l(t, [
    "parameters",
    "upscaleConfig",
    "imagePreservationFactor"
  ], f);
  const p = r(e, ["labels"]);
  t !== void 0 && p != null && l(t, ["labels"], p);
  const m = r(e, ["numberOfImages"]);
  t !== void 0 && m != null && l(t, ["parameters", "sampleCount"], m);
  const g = r(e, ["mode"]);
  return t !== void 0 && g != null && l(t, ["parameters", "mode"], g), o;
}
function rT(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], H(e, s));
  const i = r(t, ["image"]);
  i != null && l(o, ["instances[0]", "image"], ke(i));
  const a = r(t, ["upscaleFactor"]);
  a != null && l(o, [
    "parameters",
    "upscaleConfig",
    "upscaleFactor"
  ], a);
  const u = r(t, ["config"]);
  return u != null && iT(u, o), o;
}
function aT(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["predictions"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => Zo(a))), l(n, ["generatedImages"], i);
  }
  return n;
}
function lT(e, t) {
  const n = {}, o = r(e, ["uri"]);
  o != null && l(n, ["uri"], o);
  const s = r(e, ["encodedVideo"]);
  s != null && l(n, ["videoBytes"], tt(s));
  const i = r(e, ["encoding"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function uT(e, t) {
  const n = {}, o = r(e, ["gcsUri"]);
  o != null && l(n, ["uri"], o);
  const s = r(e, ["bytesBase64Encoded"]);
  s != null && l(n, ["videoBytes"], tt(s));
  const i = r(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function cT(e, t) {
  const n = {}, o = r(e, ["image"]);
  o != null && l(n, ["_self"], ke(o));
  const s = r(e, ["maskMode"]);
  return s != null && l(n, ["maskMode"], s), n;
}
function dT(e, t) {
  const n = {}, o = r(e, ["image"]);
  o != null && l(n, ["image"], jo(o));
  const s = r(e, ["referenceType"]);
  return s != null && l(n, ["referenceType"], s), n;
}
function fT(e, t) {
  const n = {}, o = r(e, ["image"]);
  o != null && l(n, ["image"], ke(o));
  const s = r(e, ["referenceType"]);
  return s != null && l(n, ["referenceType"], s), n;
}
function of(e, t) {
  const n = {}, o = r(e, ["uri"]);
  o != null && l(n, ["uri"], o);
  const s = r(e, ["videoBytes"]);
  s != null && l(n, ["encodedVideo"], tt(s));
  const i = r(e, ["mimeType"]);
  return i != null && l(n, ["encoding"], i), n;
}
function sf(e, t) {
  const n = {}, o = r(e, ["uri"]);
  o != null && l(n, ["gcsUri"], o);
  const s = r(e, ["videoBytes"]);
  s != null && l(n, ["bytesBase64Encoded"], tt(s));
  const i = r(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function hT(e, t) {
  const n = {}, o = r(e, ["displayName"]);
  return t !== void 0 && o != null && l(t, ["displayName"], o), n;
}
function pT(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && hT(n, t), t;
}
function mT(e, t) {
  const n = {}, o = r(e, ["force"]);
  return t !== void 0 && o != null && l(t, ["_query", "force"], o), n;
}
function gT(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const o = r(e, ["config"]);
  return o != null && mT(o, t), t;
}
function _T(e) {
  const t = {}, n = r(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function yT(e, t) {
  const n = {}, o = r(e, ["customMetadata"]);
  if (t !== void 0 && o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["customMetadata"], i);
  }
  const s = r(e, ["chunkingConfig"]);
  return t !== void 0 && s != null && l(t, ["chunkingConfig"], s), n;
}
function vT(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = r(e, ["response"]);
  return a != null && l(t, ["response"], ET(a)), t;
}
function TT(e) {
  const t = {}, n = r(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const o = r(e, ["fileName"]);
  o != null && l(t, ["fileName"], o);
  const s = r(e, ["config"]);
  return s != null && yT(s, t), t;
}
function ET(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const s = r(e, ["documentName"]);
  return s != null && l(t, ["documentName"], s), t;
}
function ST(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function wT(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && ST(n, t), t;
}
function IT(e) {
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
function rf(e, t) {
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
function CT(e) {
  const t = {}, n = r(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const o = r(e, ["config"]);
  return o != null && rf(o, t), t;
}
function AT(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var RT = "Content-Type", bT = "X-Server-Timeout", PT = "User-Agent", li = "x-goog-api-client", xT = "google-genai-sdk/1.50.1", MT = "v1beta1", NT = "v1beta", kT = /* @__PURE__ */ new Set(["us", "eu"]), DT = 5, LT = [
  408,
  429,
  500,
  502,
  503,
  504
], UT = class {
  constructor(e) {
    var t, n, o;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const s = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const i = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !i ? (s.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? s.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && kT.has(this.clientOptions.location) ? s.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (s.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), s.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : MT;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), s.apiVersion = (o = this.clientOptions.apiVersion) !== null && o !== void 0 ? o : NT, s.baseUrl = "https://generativelanguage.googleapis.com/";
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
    return !(t.baseUrl && t.baseUrlResourceScope === ni.COLLECTION || this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
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
    return t && t.extraBody !== null && $T(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await Fl(o), new oi(o))).catch((o) => {
      throw o instanceof Error ? o : new Error(JSON.stringify(o));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await Fl(o), this.processStreamResponse(o))).catch((o) => {
      throw o instanceof Error ? o : new Error(JSON.stringify(o));
    });
  }
  processStreamResponse(e) {
    return Me(this, arguments, function* () {
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
          const { done: c, value: d } = yield q(o.read());
          if (c) {
            if (i.trim().length > 0) throw new Error("Incomplete JSON segment at the end");
            break;
          }
          const h = s.decode(d, { stream: !0 });
          try {
            const m = JSON.parse(h);
            if ("error" in m) {
              const g = JSON.parse(JSON.stringify(m.error)), _ = g.status, y = g.code, I = `got status: ${_}. ${JSON.stringify(m)}`;
              if (y >= 400 && y < 600) throw new Qd({
                message: I,
                status: y
              });
            }
          } catch (m) {
            if (m.name === "ApiError") throw m;
          }
          i += h;
          let f = -1, p = 0;
          for (; ; ) {
            f = -1, p = 0;
            for (const _ of u) {
              const y = i.indexOf(_);
              y !== -1 && (f === -1 || y < f) && (f = y, p = _.length);
            }
            if (f === -1) break;
            const m = i.substring(0, f);
            i = i.substring(f + p);
            const g = m.trim();
            if (g.startsWith(a)) {
              const _ = g.substring(5).trim();
              try {
                yield yield q(new oi(new Response(_, {
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
    const o = this.clientOptions.httpOptions.retryOptions, s = async () => {
      const i = await fetch(e, t);
      if (i.ok) return i;
      throw LT.includes(i.status) ? new Error(`Retryable HTTP Error: ${i.statusText}`) : new ua.AbortError(`Non-retryable exception ${i.statusText} sending request`);
    };
    return (0, ua.default)(s, { retries: ((n = o.attempts) !== null && n !== void 0 ? n : DT) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = xT + " " + this.clientOptions.userAgentExtra;
    return e[PT] = t, e[li] = t, e[RT] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [o, s] of Object.entries(e.headers)) n.append(o, s);
      e.timeout && e.timeout > 0 && n.append(bT, String(Math.ceil(e.timeout / 1e3)));
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
    const u = { file: o }, c = this.getFileName(e), d = b("upload/v1beta/files", u._url), h = await this.fetchUploadUrl(d, o.sizeBytes, o.mimeType, c, u, t?.httpOptions);
    return s.upload(e, h, this);
  }
  async uploadFileToFileSearchStore(e, t, n) {
    var o;
    const s = this.clientOptions.uploader, i = await s.stat(t), a = String(i.size), u = (o = n?.mimeType) !== null && o !== void 0 ? o : i.type;
    if (u === void 0 || u === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    const c = `upload/v1beta/${e}:uploadToFileSearchStore`, d = this.getFileName(t), h = {};
    n != null && rf(n, h);
    const f = await this.fetchUploadUrl(c, a, u, d, h, n?.httpOptions);
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
async function Fl(e) {
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
    throw n >= 400 && n < 600 ? new Qd({
      message: s,
      status: n
    }) : new Error(s);
  }
}
function $T(e, t) {
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
      const d = a[c], h = u[c];
      d && typeof d == "object" && !Array.isArray(d) && h && typeof h == "object" && !Array.isArray(h) ? u[c] = o(h, d) : (h && d && typeof h != typeof d && console.warn(`includeExtraBodyToRequestInit:deepMerge: Type mismatch for key "${c}". Original type: ${typeof h}, New type: ${typeof d}. Overwriting.`), u[c] = d);
    }
    return u;
  }
  const s = o(n, t);
  e.body = JSON.stringify(s);
}
var FT = "mcp_used/unknown", GT = !1;
function af(e) {
  for (const t of e)
    if (BT(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return GT;
}
function lf(e) {
  var t;
  e[li] = (((t = e[li]) !== null && t !== void 0 ? t : "") + ` ${FT}`).trimStart();
}
function BT(e) {
  return e !== null && typeof e == "object" && e instanceof OT;
}
function qT(e) {
  return Me(this, arguments, function* (n, o = 100) {
    let s, i = 0;
    for (; i < o; ) {
      const a = yield q(n.listTools({ cursor: s }));
      for (const u of a.tools)
        yield yield q(u), i++;
      if (!a.nextCursor) break;
      s = a.nextCursor;
    }
  });
}
var OT = class uf {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new uf(t, n);
  }
  async initialize() {
    var t, n, o, s;
    if (this.mcpTools.length > 0) return;
    const i = {}, a = [];
    for (const h of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, Ne(qT(h))), d; d = await c.next(), t = d.done, !t; u = !0) {
        s = d.value, u = !1;
        const f = s;
        a.push(f);
        const p = f.name;
        if (i[p]) throw new Error(`Duplicate function name ${p} found in MCP tools. Please ensure function names are unique.`);
        i[p] = h;
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
    return await this.initialize(), ng(this.mcpTools, this.config);
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
async function VT(e, t, n) {
  const o = new Km();
  let s;
  n.data instanceof Blob ? s = JSON.parse(await n.data.text()) : s = JSON.parse(n.data), Object.assign(o, s), t(o);
}
var HT = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const o = this.apiClient.getWebsocketBaseUrl(), s = this.apiClient.getApiVersion(), i = KT(this.apiClient.getDefaultHeaders()), a = `${o}/ws/google.ai.generativelanguage.${s}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((_) => {
      u = _;
    }), d = e.callbacks, h = function() {
      u({});
    }, f = this.apiClient, p = {
      onopen: h,
      onmessage: (_) => {
        VT(f, d.onmessage, _);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(_) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(_) {
      }
    }, m = this.webSocketFactory.create(a, WT(i), p);
    m.connect(), await c;
    const g = { setup: { model: H(this.apiClient, e.model) } };
    return m.send(JSON.stringify(g)), new JT(m, this.apiClient);
  }
}, JT = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = ly(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = ay(e);
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
function WT(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function KT(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var YT = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function zT(e, t, n) {
  const o = new Wm();
  let s;
  n.data instanceof Blob ? s = await n.data.text() : n.data instanceof ArrayBuffer ? s = new TextDecoder().decode(n.data) : s = n.data;
  const i = JSON.parse(s);
  if (e.isVertexAI()) {
    const a = dy(i);
    Object.assign(o, a);
  } else Object.assign(o, i);
  t(o);
}
var XT = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new HT(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, o, s, i, a;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const h = this.apiClient.getHeaders();
    e.config && e.config.tools && af(e.config.tools) && lf(h);
    const f = eE(h);
    if (this.apiClient.isVertexAI()) {
      const C = this.apiClient.getProject(), k = this.apiClient.getLocation(), O = this.apiClient.getApiKey(), J = !!C && !!k || !!O;
      this.apiClient.getCustomBaseUrl() && !J ? d = u : (d = `${u}/ws/google.cloud.aiplatform.${c}.LlmBidiService/BidiGenerateContent`, await this.auth.addAuthHeaders(f, d));
    } else {
      const C = this.apiClient.getApiKey();
      let k = "BidiGenerateContent", O = "key";
      C?.startsWith("auth_tokens/") && (console.warn("Warning: Ephemeral token support is experimental and may change in future versions."), c !== "v1alpha" && console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection."), k = "BidiGenerateContentConstrained", O = "access_token"), d = `${u}/ws/google.ai.generativelanguage.${c}.GenerativeService.${k}?${O}=${C}`;
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
        zT(y, g.onmessage, C);
      },
      onerror: (t = g?.onerror) !== null && t !== void 0 ? t : function(C) {
      },
      onclose: (n = g?.onclose) !== null && n !== void 0 ? n : function(C) {
      }
    }, S = this.webSocketFactory.create(d, jT(f), I);
    S.connect(), await m;
    let A = H(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && A.startsWith("publishers/")) {
      const C = this.apiClient.getProject(), k = this.apiClient.getLocation();
      C && k && (A = `projects/${C}/locations/${k}/` + A);
    }
    let R = {};
    this.apiClient.isVertexAI() && ((o = e.config) === null || o === void 0 ? void 0 : o.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [ko.AUDIO] } : e.config.responseModalities = [ko.AUDIO]), !((s = e.config) === null || s === void 0) && s.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    const $ = (a = (i = e.config) === null || i === void 0 ? void 0 : i.tools) !== null && a !== void 0 ? a : [], E = [];
    for (const C of $) if (this.isCallableTool(C)) {
      const k = C;
      E.push(await k.tool());
    } else E.push(C);
    E.length > 0 && (e.config.tools = E);
    const U = {
      model: A,
      config: e.config,
      callbacks: e.callbacks
    };
    return this.apiClient.isVertexAI() ? R = ry(this.apiClient, U) : R = iy(this.apiClient, U), delete R.config, S.send(JSON.stringify(R)), new ZT(S, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, QT = { turnComplete: !0 }, ZT = class {
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
      if (!e.isVertexAI() && !("id" in o)) throw new Error(YT);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, QT), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: cy(e) } : t = { realtimeInput: uy(e) }, this.conn.send(JSON.stringify(t));
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
function jT(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function eE(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var Gl = 10;
function Bl(e) {
  var t, n, o;
  if (!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.disable) return !0;
  let s = !1;
  for (const a of (n = e?.tools) !== null && n !== void 0 ? n : []) if (Mt(a)) {
    s = !0;
    break;
  }
  if (!s) return !0;
  const i = (o = e?.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls;
  return i && (i < 0 || !Number.isInteger(i)) || i == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", i), !0) : !1;
}
function Mt(e) {
  return "callTool" in e && typeof e.callTool == "function";
}
function tE(e) {
  var t, n, o;
  return (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((s) => Mt(s))) !== null && o !== void 0 ? o : !1;
}
function ql(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((o, s) => {
    if (Mt(o)) return;
    const i = o;
    i.functionDeclarations && i.functionDeclarations.length > 0 && n.push(s);
  }), n;
}
function Ol(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var nE = class extends We {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = pe(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = pe(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const o = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: Do.EMBED_CONTENT
        });
        return await this.embedContentInternal(o);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: Do.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, o, s, i, a;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !tE(t) || Bl(t.config)) return await this.generateContentInternal(u);
      const c = ql(t);
      if (c.length > 0) {
        const g = c.map((_) => `tools[${_}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${g}.`);
      }
      let d, h;
      const f = pe(u.contents), p = (s = (o = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls) !== null && s !== void 0 ? s : Gl;
      let m = 0;
      for (; m < p && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const g = d.candidates[0].content, _ = [];
        for (const y of (a = (i = t.config) === null || i === void 0 ? void 0 : i.tools) !== null && a !== void 0 ? a : []) if (Mt(y)) {
          const I = await y.callTool(d.functionCalls);
          _.push(...I);
        }
        m++, h = {
          role: "user",
          parts: _
        }, u.contents = pe(u.contents), u.contents.push(g), u.contents.push(h), Ol(u.config) && (f.push(g), f.push(h));
      }
      return Ol(u.config) && (d.automaticFunctionCallingHistory = f), d;
    }, this.generateContentStream = async (t) => {
      var n, o, s, i, a;
      if (this.maybeMoveToResponseJsonSchem(t), Bl(t.config)) {
        const h = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(h);
      }
      const u = ql(t);
      if (u.length > 0) {
        const h = u.map((f) => `tools[${f}]`).join(", ");
        throw new Error(`Incompatible tools found at ${h}. Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations" is not yet supported.`);
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
      return new pt(Je.PAGED_ITEM_MODELS, (s) => this.listInternal(s), await this.listInternal(o), o);
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
    const i = await Promise.all(s.map(async (u) => Mt(u) ? await u.tool() : u)), a = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: i })
    };
    if (a.config.tools = i, e.config && e.config.tools && af(e.config.tools)) {
      const u = (o = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && o !== void 0 ? o : {};
      let c = Object.assign({}, u);
      Object.keys(c).length === 0 && (c = this.apiClient.getDefaultHeaders()), lf(c), a.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: c });
    }
    return a;
  }
  async initAfcToolsMap(e) {
    var t, n, o;
    const s = /* @__PURE__ */ new Map();
    for (const i of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (Mt(i)) {
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
    const s = (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && o !== void 0 ? o : Gl;
    let i = !1, a = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, h) {
      return Me(this, arguments, function* () {
        for (var f, p, m, g, _, y; a < s; ) {
          i && (a++, i = !1);
          const R = yield q(c.processParamsMaybeAddMcpUsage(h)), $ = yield q(c.generateContentStreamInternal(R)), E = [], U = [];
          try {
            for (var I = !0, S = (p = void 0, Ne($)), A; A = yield q(S.next()), f = A.done, !f; I = !0) {
              g = A.value, I = !1;
              const C = g;
              if (yield yield q(C), C.candidates && (!((_ = C.candidates[0]) === null || _ === void 0) && _.content)) {
                U.push(C.candidates[0].content);
                for (const k of (y = C.candidates[0].content.parts) !== null && y !== void 0 ? y : []) if (a < s && k.functionCall) {
                  if (!k.functionCall.name) throw new Error("Function call name was not returned by the model.");
                  if (d.has(k.functionCall.name)) {
                    const O = yield q(d.get(k.functionCall.name).callTool([k.functionCall]));
                    E.push(...O);
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
          if (E.length > 0) {
            i = !0;
            const C = new nn();
            C.candidates = [{ content: {
              role: "user",
              parts: E
            } }], yield yield q(C);
            const k = [];
            k.push(...U), k.push({
              role: "user",
              parts: E
            }), h.contents = pe(h.contents).concat(k);
          } else break;
        }
      });
    })(this, u, e);
  }
  async generateContentInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Ll(this.apiClient, e);
      return a = b("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = $l(d), f = new nn();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Dl(this.apiClient, e);
      return a = b("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = Ul(d), f = new nn();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Ll(this.apiClient, e);
      return a = b("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }), i.then(function(d) {
        return Me(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var g = !0, _ = Ne(d), y; y = yield q(_.next()), h = y.done, !h; g = !0) {
              m = y.value, g = !1;
              const I = m, S = $l(yield q(I.json()), e);
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
      const c = Dl(this.apiClient, e);
      return a = b("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }), i.then(function(d) {
        return Me(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var g = !0, _ = Ne(d), y; y = yield q(_.next()), h = y.done, !h; g = !0) {
              m = y.value, g = !1;
              const I = m, S = Ul(yield q(I.json()), e);
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
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Jy(this.apiClient, e, e);
      return a = b(sg(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = Ky(d, e), f = new pl();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Hy(this.apiClient, e);
      return a = b("{model}:batchEmbedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = Wy(d), f = new pl();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = sv(this.apiClient, e);
      return a = b("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = rv(d), f = new ml();
        return Object.assign(f, h), f;
      });
    } else {
      const c = ov(this.apiClient, e);
      return a = b("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = iv(d), f = new ml();
        return Object.assign(f, h), f;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = By(this.apiClient, e);
      return s = b("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
        const c = qy(u), d = new km();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = rT(this.apiClient, e);
      return s = b("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
        const c = aT(u), d = new Dm();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = Bv(this.apiClient, e);
      return s = b("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = qv(u), d = new Lm();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = Kv(this.apiClient, e);
      return s = b("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = Yv(u), d = new Um();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = wv(this.apiClient, e);
      return a = b("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => ai(d));
    } else {
      const c = Sv(this.apiClient, e);
      return a = b("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), i.then((d) => ri(d));
    }
  }
  async listInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Nv(this.apiClient, e);
      return a = b("{models_url}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = Dv(d), f = new gl();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Mv(this.apiClient, e);
      return a = b("{models_url}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = kv(d), f = new gl();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = sT(this.apiClient, e);
      return a = b("{model}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => ai(d));
    } else {
      const c = oT(this.apiClient, e);
      return a = b("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), i.then((d) => ri(d));
    }
  }
  async delete(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Uy(this.apiClient, e);
      return a = b("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = Fy(d), f = new _l();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Ly(this.apiClient, e);
      return a = b("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = $y(d), f = new _l();
        return Object.assign(f, h), f;
      });
    }
  }
  async countTokens(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Ny(this.apiClient, e);
      return a = b("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = Dy(d), f = new yl();
        return Object.assign(f, h), f;
      });
    } else {
      const c = My(this.apiClient, e);
      return a = b("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = ky(d), f = new yl();
        return Object.assign(f, h), f;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = Iy(this.apiClient, e);
      return s = b("{model}:computeTokens", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
        const c = Cy(u), d = new $m();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = fv(this.apiClient, e);
      return a = b("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const h = cv(d), f = new vl();
        return Object.assign(f, h), f;
      });
    } else {
      const c = dv(this.apiClient, e);
      return a = b("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const h = uv(d), f = new vl();
        return Object.assign(f, h), f;
      });
    }
  }
}, oE = class extends We {
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
      const c = Rm(e);
      return a = b("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i;
    } else {
      const c = Am(e);
      return a = b("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
      const a = vm(e);
      return s = b("{resourceName}:fetchPredictOperation", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
function Vl(e) {
  const t = {};
  if (r(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function sE(e) {
  const t = {}, n = r(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function iE(e) {
  const t = {}, n = r(e, ["data"]);
  if (n != null && l(t, ["data"], n), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function rE(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((i) => mE(i))), l(t, ["parts"], s);
  }
  const o = r(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function aE(e, t, n) {
  const o = {}, s = r(t, ["expireTime"]);
  n !== void 0 && s != null && l(n, ["expireTime"], s);
  const i = r(t, ["newSessionExpireTime"]);
  n !== void 0 && i != null && l(n, ["newSessionExpireTime"], i);
  const a = r(t, ["uses"]);
  n !== void 0 && a != null && l(n, ["uses"], a);
  const u = r(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && l(n, ["bidiGenerateContentSetup"], pE(e, u));
  const c = r(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && l(n, ["fieldMask"], c), o;
}
function lE(e, t) {
  const n = {}, o = r(t, ["config"]);
  return o != null && l(n, ["config"], aE(e, o, n)), n;
}
function uE(e) {
  const t = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = r(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function cE(e) {
  const t = {}, n = r(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = r(e, ["args"]);
  o != null && l(t, ["args"], o);
  const s = r(e, ["name"]);
  if (s != null && l(t, ["name"], s), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function dE(e) {
  const t = {}, n = r(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], sE(n));
  const o = r(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function fE(e) {
  const t = {}, n = r(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = r(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function hE(e, t) {
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
  const h = r(e, ["seed"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], h);
  const f = r(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], Qi(f));
  const p = r(e, ["thinkingConfig"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], p);
  const m = r(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const g = r(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], rE(oe(g)));
  const _ = r(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let C = Ut(_);
    Array.isArray(C) && (C = C.map((k) => yE(Lt(k)))), l(t, ["setup", "tools"], C);
  }
  const y = r(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], _E(y));
  const I = r(e, ["inputAudioTranscription"]);
  t !== void 0 && I != null && l(t, ["setup", "inputAudioTranscription"], Vl(I));
  const S = r(e, ["outputAudioTranscription"]);
  t !== void 0 && S != null && l(t, ["setup", "outputAudioTranscription"], Vl(S));
  const A = r(e, ["realtimeInputConfig"]);
  t !== void 0 && A != null && l(t, ["setup", "realtimeInputConfig"], A);
  const R = r(e, ["contextWindowCompression"]);
  t !== void 0 && R != null && l(t, ["setup", "contextWindowCompression"], R);
  const $ = r(e, ["proactivity"]);
  if (t !== void 0 && $ != null && l(t, ["setup", "proactivity"], $), r(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const E = r(e, ["avatarConfig"]);
  t !== void 0 && E != null && l(t, ["setup", "avatarConfig"], E);
  const U = r(e, ["safetySettings"]);
  if (t !== void 0 && U != null) {
    let C = U;
    Array.isArray(C) && (C = C.map((k) => gE(k))), l(t, ["setup", "safetySettings"], C);
  }
  return n;
}
function pE(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["setup", "model"], H(e, o));
  const s = r(t, ["config"]);
  return s != null && l(n, ["config"], hE(s, n)), n;
}
function mE(e) {
  const t = {}, n = r(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = r(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const s = r(e, ["executableCode"]);
  s != null && l(t, ["executableCode"], s);
  const i = r(e, ["fileData"]);
  i != null && l(t, ["fileData"], uE(i));
  const a = r(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], cE(a));
  const u = r(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = r(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], iE(c));
  const d = r(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = r(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = r(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = r(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = r(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = r(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = r(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function gE(e) {
  const t = {}, n = r(e, ["category"]);
  if (n != null && l(t, ["category"], n), r(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = r(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function _E(e) {
  const t = {}, n = r(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), r(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function yE(e) {
  const t = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = r(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = r(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const s = r(e, ["googleSearch"]);
  s != null && l(t, ["googleSearch"], fE(s));
  const i = r(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], dE(i));
  const a = r(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), r(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = r(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const c = r(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), r(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = r(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = r(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
function vE(e) {
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
function TE(e, t) {
  let n = null;
  const o = e.bidiGenerateContentSetup;
  if (typeof o == "object" && o !== null && "setup" in o) {
    const i = o.setup;
    typeof i == "object" && i !== null ? (e.bidiGenerateContentSetup = i, n = i) : delete e.bidiGenerateContentSetup;
  } else o !== void 0 && delete e.bidiGenerateContentSetup;
  const s = e.fieldMask;
  if (n) {
    const i = vE(n);
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
var EE = class extends We {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const a = lE(this.apiClient, e);
      s = b("auth_tokens", a._url), i = a._query, delete a.config, delete a._url, delete a._query;
      const u = TE(a, e.config);
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
function SE(e, t) {
  const n = {}, o = r(e, ["force"]);
  return t !== void 0 && o != null && l(t, ["_query", "force"], o), n;
}
function wE(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const o = r(e, ["config"]);
  return o != null && SE(o, t), t;
}
function IE(e) {
  const t = {}, n = r(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function CE(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function AE(e) {
  const t = {}, n = r(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const o = r(e, ["config"]);
  return o != null && CE(o, t), t;
}
function RE(e) {
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
var bE = class extends We {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new pt(Je.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = IE(e);
      return s = b("{name}", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
      const i = wE(e);
      o = b("{name}", i._url), s = i._query, delete i._url, delete i._query, await this.apiClient.request({
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
      const a = AE(e);
      return s = b("{parent}/documents", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = RE(u), d = new Fm();
        return Object.assign(d, c), d;
      });
    }
  }
}, PE = class extends We {
  constructor(e, t = new bE(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new pt(Je.PAGED_ITEM_FILE_SEARCH_STORES, (o) => this.listInternal(o), await this.listInternal(n), n);
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
      const a = pT(e);
      return s = b("fileSearchStores", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
      const a = _T(e);
      return s = b("{name}", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
      const i = gT(e);
      o = b("{name}", i._url), s = i._query, delete i._url, delete i._query, await this.apiClient.request({
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
      const a = wT(e);
      return s = b("fileSearchStores", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = IT(u), d = new Gm();
        return Object.assign(d, c), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = CT(e);
      return s = b("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = AT(u), d = new Bm();
        return Object.assign(d, c), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = TT(e);
      return s = b("{file_search_store_name}:importFile", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = vT(u), d = new qm();
        return Object.assign(d, c), d;
      });
    }
  }
}, cf = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return cf = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
}, xE = () => cf();
function ui(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var ci = (e) => {
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
}, Ae = class di extends Ce {
  constructor(t, n, o, s) {
    super(`${di.makeMessage(t, n, o)}`), this.status = t, this.headers = s, this.error = n;
  }
  static makeMessage(t, n, o) {
    const s = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && s ? `${t} ${s}` : t ? `${t} status code (no body)` : s || "(no status code or body)";
  }
  static generate(t, n, o, s) {
    if (!t || !s) return new es({
      message: o,
      cause: ci(n)
    });
    const i = n;
    return t === 400 ? new ff(t, i, o, s) : t === 401 ? new hf(t, i, o, s) : t === 403 ? new pf(t, i, o, s) : t === 404 ? new mf(t, i, o, s) : t === 409 ? new gf(t, i, o, s) : t === 422 ? new _f(t, i, o, s) : t === 429 ? new yf(t, i, o, s) : t >= 500 ? new vf(t, i, o, s) : new di(t, i, o, s);
  }
}, fi = class extends Ae {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, es = class extends Ae {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, df = class extends es {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, ff = class extends Ae {
}, hf = class extends Ae {
}, pf = class extends Ae {
}, mf = class extends Ae {
}, gf = class extends Ae {
}, _f = class extends Ae {
}, yf = class extends Ae {
}, vf = class extends Ae {
}, ME = /^[a-z][a-z0-9+.-]*:/i, NE = (e) => ME.test(e), hi = (e) => (hi = Array.isArray, hi(e)), Hl = hi;
function Jl(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function kE(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var DE = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new Ce(`${e} must be an integer`);
  if (t < 0) throw new Ce(`${e} must be a positive integer`);
  return t;
}, LE = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, UE = (e) => new Promise((t) => setTimeout(t, e));
function $E() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Tf(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function FE(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Tf({
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
function Ef(e) {
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
async function GE(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const o = e.getReader(), s = o.cancel();
  o.releaseLock(), await s;
}
var BE = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function qE(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new Ce(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var OE = "0.0.1", Sf = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Es(e, t, n) {
  return Sf(), new File(e, t ?? "unknown_file", n);
}
function VE(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var HE = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", wf = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", JE = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && wf(e), WE = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function KE(e, t, n) {
  if (Sf(), e = await e, JE(e))
    return e instanceof File ? e : Es([await e.arrayBuffer()], e.name);
  if (WE(e)) {
    const s = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Es(await pi(s), t, n);
  }
  const o = await pi(e);
  if (t || (t = VE(e)), !n?.type) {
    const s = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof s == "string" && (n = Object.assign(Object.assign({}, n), { type: s }));
  }
  return Es(o, t, n);
}
async function pi(e) {
  var t, n, o, s, i;
  let a = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) a.push(e);
  else if (wf(e)) a.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (HE(e)) try {
    for (var u = !0, c = Ne(e), d; d = await c.next(), t = d.done, !t; u = !0) {
      s = d.value, u = !1;
      const h = s;
      a.push(...await pi(h));
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
    const h = (i = e?.constructor) === null || i === void 0 ? void 0 : i.name;
    throw new Error(`Unexpected data type: ${typeof e}${h ? `; constructor: ${h}` : ""}${YE(e)}`);
  }
  return a;
}
function YE(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var Zi = class {
  constructor(e) {
    this._client = e;
  }
};
Zi._key = [];
function If(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Wl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), zE = (e = If) => (function(n, ...o) {
  if (n.length === 1) return n[0];
  let s = !1;
  const i = [], a = n.reduce((h, f, p) => {
    var m, g, _;
    /[?#]/.test(f) && (s = !0);
    const y = o[p];
    let I = (s ? encodeURIComponent : e)("" + y);
    return p !== o.length && (y == null || typeof y == "object" && y.toString === ((_ = Object.getPrototypeOf((g = Object.getPrototypeOf((m = y.hasOwnProperty) !== null && m !== void 0 ? m : Wl)) !== null && g !== void 0 ? g : Wl)) === null || _ === void 0 ? void 0 : _.toString)) && (I = y + "", i.push({
      start: h.length + f.length,
      length: I.length,
      error: `Value of type ${Object.prototype.toString.call(y).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === o.length ? "" : I);
  }, ""), u = a.split(/[?#]/, 1)[0], c = /(^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) {
    const h = d[0].startsWith("/"), f = h ? 1 : 0, p = h ? d[0].slice(1) : d[0];
    i.push({
      start: d.index + f,
      length: p.length,
      error: `Value "${p}" can't be safely passed as a path parameter`
    });
  }
  if (i.sort((h, f) => h.start - f.start), i.length > 0) {
    let h = 0;
    const f = i.reduce((p, m) => {
      const g = " ".repeat(m.start - h), _ = "^".repeat(m.length);
      return h = m.start + m.length, p + g + _;
    }, "");
    throw new Ce(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}), Pe = /* @__PURE__ */ zE(If), Cf = class extends Zi {
  create(e, t) {
    var n;
    const { api_version: o = this._client.apiVersion } = e, s = et(e, ["api_version"]);
    if ("model" in s && "agent_config" in s) throw new Ce("Invalid request: specified `model` and `agent_config`. If specifying `model`, use `generation_config`.");
    if ("agent" in s && "generation_config" in s) throw new Ce("Invalid request: specified `agent` and `generation_config`. If specifying `agent`, use `agent_config`.");
    return this._client.post(Pe`/${o}/interactions`, Object.assign(Object.assign({ body: s }, t), { stream: (n = e.stream) !== null && n !== void 0 ? n : !1 }));
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
    const s = t ?? {}, { api_version: i = this._client.apiVersion } = s, a = et(s, ["api_version"]);
    return this._client.get(Pe`/${i}/interactions/${e}`, Object.assign(Object.assign({ query: a }, n), { stream: (o = t?.stream) !== null && o !== void 0 ? o : !1 }));
  }
};
Cf._key = Object.freeze(["interactions"]);
var Af = class extends Cf {
}, Rf = class extends Zi {
  create(e, t) {
    const { api_version: n = this._client.apiVersion, webhook_id: o } = e, s = et(e, ["api_version", "webhook_id"]);
    return this._client.post(Pe`/${n}/webhooks`, Object.assign({
      query: { webhook_id: o },
      body: s
    }, t));
  }
  update(e, t, n) {
    const { api_version: o = this._client.apiVersion, update_mask: s } = t, i = et(t, ["api_version", "update_mask"]);
    return this._client.patch(Pe`/${o}/webhooks/${e}`, Object.assign({
      query: { update_mask: s },
      body: i
    }, n));
  }
  list(e = {}, t) {
    const n = e ?? {}, { api_version: o = this._client.apiVersion } = n, s = et(n, ["api_version"]);
    return this._client.get(Pe`/${o}/webhooks`, Object.assign({ query: s }, t));
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
    const { api_version: o = this._client.apiVersion, body: s } = t ?? {};
    return this._client.post(Pe`/${o}/webhooks/${e}:ping`, Object.assign({ body: s }, n));
  }
  rotateSigningSecret(e, t = {}, n) {
    const o = t ?? {}, { api_version: s = this._client.apiVersion } = o, i = et(o, ["api_version"]);
    return this._client.post(Pe`/${s}/webhooks/${e}:rotateSigningSecret`, Object.assign({ body: i }, n));
  }
};
Rf._key = Object.freeze(["webhooks"]);
var bf = class extends Rf {
};
function XE(e) {
  let t = 0;
  for (const s of e) t += s.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const s of e)
    n.set(s, o), o += s.length;
  return n;
}
var io;
function ji(e) {
  let t;
  return (io ?? (t = new globalThis.TextEncoder(), io = t.encode.bind(t)))(e);
}
var ro;
function Kl(e) {
  let t;
  return (ro ?? (t = new globalThis.TextDecoder(), ro = t.decode.bind(t)))(e);
}
var ts = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? ji(e) : e;
    this.buffer = XE([this.buffer, n]);
    const o = [];
    let s;
    for (; (s = QE(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (s.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = s.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (s.index !== this.carriageReturnIndex + 1 || s.carriage)) {
        o.push(Kl(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const i = this.carriageReturnIndex !== null ? s.preceding - 1 : s.preceding, a = Kl(this.buffer.subarray(0, i));
      o.push(a), this.buffer = this.buffer.subarray(s.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), o;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
ts.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
ts.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function QE(e, t) {
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
var Uo = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Yl = (e, t, n) => {
  if (e) {
    if (kE(Uo, e)) return e;
    ce(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Uo))}`);
  }
};
function yn() {
}
function ao(e, t, n) {
  return !t || Uo[e] > Uo[n] ? yn : t[e].bind(t);
}
var ZE = {
  error: yn,
  warn: yn,
  info: yn,
  debug: yn
}, zl = /* @__PURE__ */ new WeakMap();
function ce(e) {
  var t;
  const n = e.logger, o = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return ZE;
  const s = zl.get(n);
  if (s && s[0] === o) return s[1];
  const i = {
    error: ao("error", n, o),
    warn: ao("warn", n, o),
    info: ao("info", n, o),
    debug: ao("debug", n, o)
  };
  return zl.set(n, [o, i]), i;
}
var lt = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), jE = class vn {
  constructor(t, n, o) {
    this.iterator = t, this.controller = n, this.client = o;
  }
  static fromSSEResponse(t, n, o) {
    let s = !1;
    const i = o ? ce(o) : console;
    function a() {
      return Me(this, arguments, function* () {
        var c, d, h, f;
        if (s) throw new Ce("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        s = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = Ne(eS(t, n)), _; _ = yield q(g.next()), c = _.done, !c; m = !0) {
              f = _.value, m = !1;
              const y = f;
              if (!p)
                if (y.data.startsWith("[DONE]")) {
                  p = !0;
                  continue;
                } else try {
                  yield yield q(JSON.parse(y.data));
                } catch (I) {
                  throw i.error("Could not parse message into JSON:", y.data), i.error("From chunk:", y.raw), I;
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
          if (ui(y)) return yield q(void 0);
          throw y;
        } finally {
          p || n.abort();
        }
      });
    }
    return new vn(a, n, o);
  }
  static fromReadableStream(t, n, o) {
    let s = !1;
    function i() {
      return Me(this, arguments, function* () {
        var c, d, h, f;
        const p = new ts(), m = Ef(t);
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
    function a() {
      return Me(this, arguments, function* () {
        var c, d, h, f;
        if (s) throw new Ce("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        s = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = Ne(i()), _; _ = yield q(g.next()), c = _.done, !c; m = !0) {
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
          if (ui(y)) return yield q(void 0);
          throw y;
        } finally {
          p || n.abort();
        }
      });
    }
    return new vn(a, n, o);
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
    return [new vn(() => s(t), this.controller, this.client), new vn(() => s(n), this.controller, this.client)];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Tf({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: s, done: i } = await n.next();
          if (i) return o.close();
          const a = ji(JSON.stringify(s) + `
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
function eS(e, t) {
  return Me(this, arguments, function* () {
    var o, s, i, a;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new Ce("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new Ce("Attempted to iterate over a response with no body");
    const u = new nS(), c = new ts(), d = Ef(e.body);
    try {
      for (var h = !0, f = Ne(tS(d)), p; p = yield q(f.next()), o = p.done, !o; h = !0) {
        a = p.value, h = !1;
        const m = a;
        for (const g of c.decode(m)) {
          const _ = u.decode(g);
          _ && (yield yield q(_));
        }
      }
    } catch (m) {
      s = { error: m };
    } finally {
      try {
        !h && !o && (i = f.return) && (yield q(i.call(f)));
      } finally {
        if (s) throw s.error;
      }
    }
    for (const m of c.flush()) {
      const g = u.decode(m);
      g && (yield yield q(g));
    }
  });
}
function tS(e) {
  return Me(this, arguments, function* () {
    var n, o, s, i;
    try {
      for (var a = !0, u = Ne(e), c; c = yield q(u.next()), n = c.done, !n; a = !0) {
        i = c.value, a = !1;
        const d = i;
        d != null && (yield yield q(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? ji(d) : d));
      }
    } catch (d) {
      o = { error: d };
    } finally {
      try {
        !a && !n && (s = u.return) && (yield q(s.call(u)));
      } finally {
        if (o) throw o.error;
      }
    }
  });
}
var nS = class {
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
    let [t, n, o] = oS(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function oS(e, t) {
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
async function sS(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: s, startTime: i } = t, a = await (async () => {
    var u;
    if (t.options.stream)
      return ce(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : jE.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type"), d = (u = c?.split(";")[0]) === null || u === void 0 ? void 0 : u.trim();
    return d?.includes("application/json") || d?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
  })();
  return ce(e).debug(`[${o}] response parsed`, lt({
    retryOfRequestLogID: s,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
var iS = class Pf extends Promise {
  constructor(t, n, o = sS) {
    super((s) => {
      s(null);
    }), this.responsePromise = n, this.parseResponse = o, this.client = t;
  }
  _thenUnwrap(t) {
    return new Pf(this.client, this.responsePromise, async (n, o) => t(await this.parseResponse(n, o), o));
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
}, xf = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* rS(e) {
  if (!e) return;
  if (xf in e) {
    const { values: o, nulls: s } = e;
    yield* o.entries();
    for (const i of s) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Hl(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const s = o[0];
    if (typeof s != "string") throw new TypeError("expected header name to be a string");
    const i = Hl(o[1]) ? o[1] : [o[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [s, null]), yield [s, u]);
  }
}
var on = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const s = /* @__PURE__ */ new Set();
    for (const [i, a] of rS(o)) {
      const u = i.toLowerCase();
      s.has(u) || (t.delete(i), s.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [xf]: !0,
    values: t,
    nulls: n
  };
}, Ss = (e) => {
  var t, n, o, s, i;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((i = (s = (o = globalThis.Deno.env) === null || o === void 0 ? void 0 : o.get) === null || s === void 0 ? void 0 : s.call(o, e)) === null || i === void 0 ? void 0 : i.trim()) || void 0;
}, Mf, Nf = class kf {
  constructor(t) {
    var n, o, s, i, a, u, c, { baseURL: d = Ss("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: h = (n = Ss("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: f = "v1beta" } = t, p = et(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: h,
      apiVersion: f
    }, p), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (o = m.timeout) !== null && o !== void 0 ? o : kf.DEFAULT_TIMEOUT, this.logger = (s = m.logger) !== null && s !== void 0 ? s : console;
    const g = "warn";
    this.logLevel = g, this.logLevel = (a = (i = Yl(m.logLevel, "ClientOptions.logLevel", this)) !== null && i !== void 0 ? i : Yl(Ss("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && a !== void 0 ? a : g, this.fetchOptions = m.fetchOptions, this.maxRetries = (u = m.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = m.fetch) !== null && c !== void 0 ? c : $E(), this.encoder = BE, this._options = m, this.apiKey = h, this.apiVersion = f, this.clientAdapter = m.clientAdapter;
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
    return qE(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${OE}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${xE()}`;
  }
  makeStatusError(t, n, o, s) {
    return Ae.generate(t, n, o, s);
  }
  buildURL(t, n, o) {
    const s = !this.baseURLOverridden() && o || this.baseURL, i = NE(t) ? new URL(t) : new URL(s + (s.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), a = this.defaultQuery(), u = Object.fromEntries(i.searchParams);
    return (!Jl(a) || !Jl(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), a), n)), typeof n == "object" && n && !Array.isArray(n) && (i.search = this.stringifyQuery(n)), i.toString();
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
    return new iS(this, this.makeRequest(t, n, void 0));
  }
  async makeRequest(t, n, o) {
    var s, i, a;
    const u = await t, c = (s = u.maxRetries) !== null && s !== void 0 ? s : this.maxRetries;
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
    })), !((i = u.signal) === null || i === void 0) && i.aborted) throw new fi();
    const _ = new AbortController(), y = await this.fetchWithTimeout(h, d, f, _).catch(ci), I = Date.now();
    if (y instanceof globalThis.Error) {
      const A = `retrying, ${n} attempts remaining`;
      if (!((a = u.signal) === null || a === void 0) && a.aborted) throw new fi();
      const R = ui(y) || /timed? ?out/i.test(String(y) + ("cause" in y ? String(y.cause) : ""));
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
      })), R ? new df() : new es({ cause: y });
    }
    const S = `[${p}${m}] ${d.method} ${h} ${y.ok ? "succeeded" : "failed"} with status ${y.status} in ${I - g}ms`;
    if (!y.ok) {
      const A = await this.shouldRetry(y);
      if (n && A) {
        const C = `retrying, ${n} attempts remaining`;
        return await GE(y.body), ce(this).info(`${S} - ${C}`), ce(this).debug(`[${p}] response error (${C})`, lt({
          retryOfRequestLogID: o,
          url: y.url,
          status: y.status,
          headers: y.headers,
          durationMs: I - g
        })), this.retryRequest(u, n, o ?? p, y.headers);
      }
      const R = A ? "error; no more retries left" : "error; not retryable";
      ce(this).info(`${S} - ${R}`);
      const $ = await y.text().catch((C) => ci(C).message), E = LE($), U = E ? void 0 : $;
      throw ce(this).debug(`[${p}] response error (${R})`, lt({
        retryOfRequestLogID: o,
        url: y.url,
        status: y.status,
        headers: y.headers,
        message: U,
        durationMs: Date.now() - g
      })), this.makeStatusError(y.status, E, U, y.headers);
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
  async fetchWithTimeout(t, n, o, s) {
    const i = n || {}, { signal: a, method: u } = i, c = et(i, ["signal", "method"]), d = this._makeAbort(s);
    a && a.addEventListener("abort", d, { once: !0 });
    const h = setTimeout(d, o), f = globalThis.ReadableStream && c.body instanceof globalThis.ReadableStream || typeof c.body == "object" && c.body !== null && Symbol.asyncIterator in c.body, p = Object.assign(Object.assign(Object.assign({ signal: s.signal }, f ? { duplex: "half" } : {}), { method: "GET" }), c);
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
    return await UE(a), this.makeRequest(t, n - 1, o);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const i = n - t;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var o, s, i;
    const a = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: h } = a, f = this.buildURL(c, d, h);
    "timeout" in a && DE("timeout", a.timeout), a.timeout = (o = a.timeout) !== null && o !== void 0 ? o : this.timeout;
    const { bodyHeaders: p, body: m } = this.buildBody({ options: a }), g = await this.buildHeaders({
      options: t,
      method: u,
      bodyHeaders: p,
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
    let u = on([
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
    const o = on([n]);
    return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && o.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: t
    } : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
      bodyHeaders: void 0,
      body: FE(t)
    } : typeof t == "object" && o.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: o
    });
  }
};
Nf.DEFAULT_TIMEOUT = 6e4;
var te = class extends Nf {
  constructor() {
    super(...arguments), this.interactions = new Af(this), this.webhooks = new bf(this);
  }
};
Mf = te;
te.GeminiNextGenAPIClient = Mf;
te.GeminiNextGenAPIClientError = Ce;
te.APIError = Ae;
te.APIConnectionError = es;
te.APIConnectionTimeoutError = df;
te.APIUserAbortError = fi;
te.NotFoundError = mf;
te.ConflictError = gf;
te.RateLimitError = yf;
te.BadRequestError = ff;
te.AuthenticationError = hf;
te.InternalServerError = vf;
te.PermissionDeniedError = pf;
te.UnprocessableEntityError = _f;
te.toFile = KE;
te.Interactions = Af;
te.Webhooks = bf;
function aS(e, t) {
  const n = {}, o = r(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function lS(e, t) {
  const n = {}, o = r(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function uS(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function cS(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function dS(e, t, n) {
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
function fS(e, t, n) {
  const o = {};
  let s = r(n, ["config", "method"]);
  if (s === void 0 && (s = "SUPERVISED_FINE_TUNING"), s === "SUPERVISED_FINE_TUNING") {
    const E = r(e, ["validationDataset"]);
    t !== void 0 && E != null && l(t, ["supervisedTuningSpec"], ws(E));
  } else if (s === "PREFERENCE_TUNING") {
    const E = r(e, ["validationDataset"]);
    t !== void 0 && E != null && l(t, ["preferenceOptimizationSpec"], ws(E));
  } else if (s === "DISTILLATION") {
    const E = r(e, ["validationDataset"]);
    t !== void 0 && E != null && l(t, ["distillationSpec"], ws(E));
  }
  const i = r(e, ["tunedModelDisplayName"]);
  t !== void 0 && i != null && l(t, ["tunedModelDisplayName"], i);
  const a = r(e, ["description"]);
  t !== void 0 && a != null && l(t, ["description"], a);
  let u = r(n, ["config", "method"]);
  if (u === void 0 && (u = "SUPERVISED_FINE_TUNING"), u === "SUPERVISED_FINE_TUNING") {
    const E = r(e, ["epochCount"]);
    t !== void 0 && E != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "epochCount"
    ], E);
  } else if (u === "PREFERENCE_TUNING") {
    const E = r(e, ["epochCount"]);
    t !== void 0 && E != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "epochCount"
    ], E);
  } else if (u === "DISTILLATION") {
    const E = r(e, ["epochCount"]);
    t !== void 0 && E != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "epochCount"
    ], E);
  }
  let c = r(n, ["config", "method"]);
  if (c === void 0 && (c = "SUPERVISED_FINE_TUNING"), c === "SUPERVISED_FINE_TUNING") {
    const E = r(e, ["learningRateMultiplier"]);
    t !== void 0 && E != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], E);
  } else if (c === "PREFERENCE_TUNING") {
    const E = r(e, ["learningRateMultiplier"]);
    t !== void 0 && E != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], E);
  } else if (c === "DISTILLATION") {
    const E = r(e, ["learningRateMultiplier"]);
    t !== void 0 && E != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], E);
  }
  let d = r(n, ["config", "method"]);
  if (d === void 0 && (d = "SUPERVISED_FINE_TUNING"), d === "SUPERVISED_FINE_TUNING") {
    const E = r(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && E != null && l(t, ["supervisedTuningSpec", "exportLastCheckpointOnly"], E);
  } else if (d === "PREFERENCE_TUNING") {
    const E = r(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && E != null && l(t, ["preferenceOptimizationSpec", "exportLastCheckpointOnly"], E);
  } else if (d === "DISTILLATION") {
    const E = r(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && E != null && l(t, ["distillationSpec", "exportLastCheckpointOnly"], E);
  }
  let h = r(n, ["config", "method"]);
  if (h === void 0 && (h = "SUPERVISED_FINE_TUNING"), h === "SUPERVISED_FINE_TUNING") {
    const E = r(e, ["adapterSize"]);
    t !== void 0 && E != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "adapterSize"
    ], E);
  } else if (h === "PREFERENCE_TUNING") {
    const E = r(e, ["adapterSize"]);
    t !== void 0 && E != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "adapterSize"
    ], E);
  } else if (h === "DISTILLATION") {
    const E = r(e, ["adapterSize"]);
    t !== void 0 && E != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "adapterSize"
    ], E);
  }
  let f = r(n, ["config", "method"]);
  if (f === void 0 && (f = "SUPERVISED_FINE_TUNING"), f === "SUPERVISED_FINE_TUNING") {
    const E = r(e, ["tuningMode"]);
    t !== void 0 && E != null && l(t, ["supervisedTuningSpec", "tuningMode"], E);
  } else if (f === "DISTILLATION") {
    const E = r(e, ["tuningMode"]);
    t !== void 0 && E != null && l(t, ["distillationSpec", "tuningMode"], E);
  }
  const p = r(e, ["customBaseModel"]);
  t !== void 0 && p != null && l(t, ["customBaseModel"], p);
  let m = r(n, ["config", "method"]);
  if (m === void 0 && (m = "SUPERVISED_FINE_TUNING"), m === "SUPERVISED_FINE_TUNING") {
    const E = r(e, ["batchSize"]);
    t !== void 0 && E != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "batchSize"
    ], E);
  } else if (m === "DISTILLATION") {
    const E = r(e, ["batchSize"]);
    t !== void 0 && E != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "batchSize"
    ], E);
  }
  let g = r(n, ["config", "method"]);
  if (g === void 0 && (g = "SUPERVISED_FINE_TUNING"), g === "SUPERVISED_FINE_TUNING") {
    const E = r(e, ["learningRate"]);
    t !== void 0 && E != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRate"
    ], E);
  } else if (g === "DISTILLATION") {
    const E = r(e, ["learningRate"]);
    t !== void 0 && E != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRate"
    ], E);
  }
  const _ = r(e, ["labels"]);
  t !== void 0 && _ != null && l(t, ["labels"], _);
  const y = r(e, ["beta"]);
  t !== void 0 && y != null && l(t, [
    "preferenceOptimizationSpec",
    "hyperParameters",
    "beta"
  ], y);
  const I = r(e, ["baseTeacherModel"]);
  t !== void 0 && I != null && l(t, ["distillationSpec", "baseTeacherModel"], I);
  const S = r(e, ["tunedTeacherModelSource"]);
  t !== void 0 && S != null && l(t, ["distillationSpec", "tunedTeacherModelSource"], S);
  const A = r(e, ["sftLossWeightMultiplier"]);
  t !== void 0 && A != null && l(t, [
    "distillationSpec",
    "hyperParameters",
    "sftLossWeightMultiplier"
  ], A);
  const R = r(e, ["outputUri"]);
  t !== void 0 && R != null && l(t, ["outputUri"], R);
  const $ = r(e, ["encryptionSpec"]);
  return t !== void 0 && $ != null && l(t, ["encryptionSpec"], $), o;
}
function hS(e, t) {
  const n = {}, o = r(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const s = r(e, ["preTunedModel"]);
  s != null && l(n, ["preTunedModel"], s);
  const i = r(e, ["trainingDataset"]);
  i != null && IS(i);
  const a = r(e, ["config"]);
  return a != null && dS(a, n), n;
}
function pS(e, t) {
  const n = {}, o = r(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const s = r(e, ["preTunedModel"]);
  s != null && l(n, ["preTunedModel"], s);
  const i = r(e, ["trainingDataset"]);
  i != null && CS(i, n, t);
  const a = r(e, ["config"]);
  return a != null && fS(a, n, t), n;
}
function mS(e, t) {
  const n = {}, o = r(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function gS(e, t) {
  const n = {}, o = r(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function _S(e, t, n) {
  const o = {}, s = r(e, ["pageSize"]);
  t !== void 0 && s != null && l(t, ["_query", "pageSize"], s);
  const i = r(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const a = r(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), o;
}
function yS(e, t, n) {
  const o = {}, s = r(e, ["pageSize"]);
  t !== void 0 && s != null && l(t, ["_query", "pageSize"], s);
  const i = r(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const a = r(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), o;
}
function vS(e, t) {
  const n = {}, o = r(e, ["config"]);
  return o != null && _S(o, n), n;
}
function TS(e, t) {
  const n = {}, o = r(e, ["config"]);
  return o != null && yS(o, n), n;
}
function ES(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["nextPageToken"]);
  s != null && l(n, ["nextPageToken"], s);
  const i = r(e, ["tunedModels"]);
  if (i != null) {
    let a = i;
    Array.isArray(a) && (a = a.map((u) => Df(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function SS(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["nextPageToken"]);
  s != null && l(n, ["nextPageToken"], s);
  const i = r(e, ["tuningJobs"]);
  if (i != null) {
    let a = i;
    Array.isArray(a) && (a = a.map((u) => mi(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function wS(e, t) {
  const n = {}, o = r(e, ["name"]);
  o != null && l(n, ["model"], o);
  const s = r(e, ["name"]);
  return s != null && l(n, ["endpoint"], s), n;
}
function IS(e, t) {
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
function CS(e, t, n) {
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
function Df(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["name"]);
  s != null && l(n, ["name"], s);
  const i = r(e, ["state"]);
  i != null && l(n, ["state"], Od(i));
  const a = r(e, ["createTime"]);
  a != null && l(n, ["createTime"], a);
  const u = r(e, ["tuningTask", "startTime"]);
  u != null && l(n, ["startTime"], u);
  const c = r(e, ["tuningTask", "completeTime"]);
  c != null && l(n, ["endTime"], c);
  const d = r(e, ["updateTime"]);
  d != null && l(n, ["updateTime"], d);
  const h = r(e, ["description"]);
  h != null && l(n, ["description"], h);
  const f = r(e, ["baseModel"]);
  f != null && l(n, ["baseModel"], f);
  const p = r(e, ["_self"]);
  return p != null && l(n, ["tunedModel"], wS(p)), n;
}
function mi(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["name"]);
  s != null && l(n, ["name"], s);
  const i = r(e, ["state"]);
  i != null && l(n, ["state"], Od(i));
  const a = r(e, ["createTime"]);
  a != null && l(n, ["createTime"], a);
  const u = r(e, ["startTime"]);
  u != null && l(n, ["startTime"], u);
  const c = r(e, ["endTime"]);
  c != null && l(n, ["endTime"], c);
  const d = r(e, ["updateTime"]);
  d != null && l(n, ["updateTime"], d);
  const h = r(e, ["error"]);
  h != null && l(n, ["error"], h);
  const f = r(e, ["description"]);
  f != null && l(n, ["description"], f);
  const p = r(e, ["baseModel"]);
  p != null && l(n, ["baseModel"], p);
  const m = r(e, ["tunedModel"]);
  m != null && l(n, ["tunedModel"], m);
  const g = r(e, ["preTunedModel"]);
  g != null && l(n, ["preTunedModel"], g);
  const _ = r(e, ["supervisedTuningSpec"]);
  _ != null && l(n, ["supervisedTuningSpec"], _);
  const y = r(e, ["preferenceOptimizationSpec"]);
  y != null && l(n, ["preferenceOptimizationSpec"], y);
  const I = r(e, ["distillationSpec"]);
  I != null && l(n, ["distillationSpec"], I);
  const S = r(e, ["tuningDataStats"]);
  S != null && l(n, ["tuningDataStats"], S);
  const A = r(e, ["encryptionSpec"]);
  A != null && l(n, ["encryptionSpec"], A);
  const R = r(e, ["partnerModelTuningSpec"]);
  R != null && l(n, ["partnerModelTuningSpec"], R);
  const $ = r(e, ["customBaseModel"]);
  $ != null && l(n, ["customBaseModel"], $);
  const E = r(e, ["evaluateDatasetRuns"]);
  if (E != null) {
    let nt = E;
    Array.isArray(nt) && (nt = nt.map((Re) => Re)), l(n, ["evaluateDatasetRuns"], nt);
  }
  const U = r(e, ["experiment"]);
  U != null && l(n, ["experiment"], U);
  const C = r(e, ["fullFineTuningSpec"]);
  C != null && l(n, ["fullFineTuningSpec"], C);
  const k = r(e, ["labels"]);
  k != null && l(n, ["labels"], k);
  const O = r(e, ["outputUri"]);
  O != null && l(n, ["outputUri"], O);
  const J = r(e, ["pipelineJob"]);
  J != null && l(n, ["pipelineJob"], J);
  const de = r(e, ["serviceAccount"]);
  de != null && l(n, ["serviceAccount"], de);
  const ae = r(e, ["tunedModelDisplayName"]);
  ae != null && l(n, ["tunedModelDisplayName"], ae);
  const Y = r(e, ["tuningJobState"]);
  Y != null && l(n, ["tuningJobState"], Y);
  const W = r(e, ["veoTuningSpec"]);
  W != null && l(n, ["veoTuningSpec"], W);
  const Ge = r(e, ["distillationSamplingSpec"]);
  Ge != null && l(n, ["distillationSamplingSpec"], Ge);
  const Gt = r(e, ["tuningJobMetadata"]);
  return Gt != null && l(n, ["tuningJobMetadata"], Gt), n;
}
function AS(e, t) {
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
function ws(e, t) {
  const n = {}, o = r(e, ["gcsUri"]);
  o != null && l(n, ["validationDatasetUri"], o);
  const s = r(e, ["vertexDatasetResource"]);
  return s != null && l(n, ["validationDatasetUri"], s), n;
}
var RS = class extends We {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new pt(Je.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
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
          state: ti.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = gS(e);
      return a = b("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => mi(d));
    } else {
      const c = mS(e);
      return a = b("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => Df(d));
    }
  }
  async listInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = TS(e);
      return a = b("tuningJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = SS(d), f = new Tl();
        return Object.assign(f, h), f;
      });
    } else {
      const c = vS(e);
      return a = b("tunedModels", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = ES(d), f = new Tl();
        return Object.assign(f, h), f;
      });
    }
  }
  async cancel(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = lS(e);
      return a = b("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = cS(d), f = new El();
        return Object.assign(f, h), f;
      });
    } else {
      const c = aS(e);
      return a = b("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = uS(d), f = new El();
        return Object.assign(f, h), f;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = pS(e, e);
      return s = b("tuningJobs", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => mi(u));
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async tuneMldevInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = hS(e);
      return s = b("tunedModels", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => AS(u));
    }
  }
}, bS = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, PS = 1024 * 1024 * 8, xS = 3, MS = 1e3, NS = 2, $o = "x-goog-upload-status";
async function kS(e, t, n, o) {
  var s;
  const i = await Lf(e, t, n, o), a = await i?.json();
  if (((s = i?.headers) === null || s === void 0 ? void 0 : s[$o]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return a.file;
}
async function DS(e, t, n, o) {
  var s;
  const i = await Lf(e, t, n, o), a = await i?.json();
  if (((s = i?.headers) === null || s === void 0 ? void 0 : s[$o]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = kd(a), c = new Ym();
  return Object.assign(c, u), c;
}
async function Lf(e, t, n, o) {
  var s, i, a;
  let u = t;
  const c = o?.baseUrl || ((s = n.clientOptions.httpOptions) === null || s === void 0 ? void 0 : s.baseUrl);
  if (c) {
    const m = new URL(c), g = new URL(t);
    g.protocol = m.protocol, g.host = m.host, g.port = m.port, u = g.toString();
  }
  let d = 0, h = 0, f = new oi(new Response()), p = "upload";
  for (d = e.size; h < d; ) {
    const m = Math.min(PS, d - h), g = e.slice(h, h + m);
    h + m >= d && (p += ", finalize");
    let _ = 0, y = MS;
    for (; _ < xS; ) {
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
      }), !((i = f?.headers) === null || i === void 0) && i[$o]) break;
      _++, await US(y), y = y * NS;
    }
    if (h += m, ((a = f?.headers) === null || a === void 0 ? void 0 : a[$o]) !== "active") break;
    if (d <= h) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return f;
}
async function LS(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function US(e) {
  return new Promise((t) => setTimeout(t, e));
}
var $S = class {
  async upload(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await kS(e, t, n, o);
  }
  async uploadToFileSearchStore(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await DS(e, t, n, o);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await LS(e);
  }
}, FS = class {
  create(e, t, n) {
    return new GS(e, t, n);
  }
}, GS = class {
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
}, Xl = "x-goog-api-key", BS = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(Xl) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(Xl, this.apiKey);
    }
  }
}, qS = "gl-node/", OS = class {
  getNextGenClient() {
    var e;
    const t = this.httpOptions;
    if (this._nextGenClient === void 0) {
      const n = this.httpOptions;
      this._nextGenClient = new te({
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
    const n = _m(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const o = new BS(this.apiKey);
    this.apiClient = new UT({
      auth: o,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: qS + "web",
      uploader: new $S(),
      downloader: new bS()
    }), this.models = new nE(this.apiClient), this.live = new XT(this.apiClient, o, new FS()), this.batches = new Qg(this.apiClient), this.chats = new L_(this.models, this.apiClient), this.caches = new N_(this.apiClient), this.files = new K_(this.apiClient), this.operations = new oE(this.apiClient), this.authTokens = new EE(this.apiClient), this.tunings = new RS(this.apiClient), this.fileSearchStores = new PE(this.apiClient);
  }
};
function Ql(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function VS(e) {
  const t = /* @__PURE__ */ new Map(), n = [];
  e.forEach((s) => {
    (s.tool_calls || []).forEach((i) => {
      i.id && i.function?.name && t.set(i.id, i.function.name);
    });
  });
  for (const s of e)
    if (s.role !== "system") {
      if (s.role === "tool") {
        n.push({
          role: "user",
          parts: [{ functionResponse: {
            name: t.get(s.tool_call_id || "") || "tool_result",
            response: Ql(s.content)
          } }]
        });
        continue;
      }
      if (s.role === "assistant" && Array.isArray(s.tool_calls) && s.tool_calls.length) {
        n.push({
          role: "model",
          parts: [...s.content ? [{ text: s.content }] : [], ...s.tool_calls.map((i) => ({ functionCall: {
            name: i.function.name,
            args: Ql(i.function.arguments)
          } }))]
        });
        continue;
      }
      n.push({
        role: s.role === "assistant" ? "model" : "user",
        parts: [{ text: s.content || "" }]
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
var HS = class {
  constructor(e) {
    this.config = e, this.client = new OS({
      apiKey: e.apiKey,
      httpOptions: {
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 18e4
      }
    });
  }
  async chat(e) {
    const t = VS(e.messages), n = await this.client.chats.create({
      model: this.config.model,
      history: t.history,
      config: {
        systemInstruction: e.systemPrompt,
        temperature: e.temperature,
        maxOutputTokens: e.maxTokens,
        tools: [{ functionDeclarations: (e.tools || []).map((s) => ({
          name: s.function.name,
          description: s.function.description,
          parameters: s.function.parameters
        })) }],
        toolConfig: { functionCallingConfig: { mode: ei.AUTO } }
      }
    }).sendMessage({
      message: t.latestMessage,
      config: { abortSignal: e.signal }
    }), o = (n.functionCalls || []).map((s, i) => ({
      id: s.id || `google-tool-${i + 1}`,
      name: s.name || "",
      arguments: JSON.stringify(s.args || {})
    })).filter((s) => s.name);
    return {
      text: typeof n.text == "string" ? n.text : (n.candidates?.[0]?.content?.parts || []).map((s) => s.text || "").filter(Boolean).join(`
`),
      toolCalls: o,
      finishReason: n.candidates?.[0]?.finishReason || "STOP",
      model: n.modelVersion || this.config.model,
      provider: "google"
    };
  }
}, JS = "xb-assistant-app", WS = "xb-assistant-root", Uf = 18e4, At = 10, gi = "littlewhitebox.assistant.session.v1", KS = 60, Zl = 16e3, YS = 2600, zS = 1800, XS = 4200, QS = [{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}], ZS = [
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
], jS = [
  "为什么某个设置勾上后刷新又没了？",
  "向量生成时报 429 是哪一层限流？",
  "这个功能的代码入口在哪个文件？",
  "帮我查一下某个报错是从哪条链路抛出来的。"
], ew = { chat: {
  include: [],
  exclude: [
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
  ]
} }, $f = [
  "你是“小白助手”，是 LittleWhiteBox 内置的技术支持助手。",
  "你的主要任务是帮助用户理解 LittleWhiteBox 与 SillyTavern 前端公开代码、设置项、模块行为和常见报错。",
  "当问题涉及具体实现、文件路径、设置逻辑或错误原因时，优先使用工具查证后再回答。",
  "默认只读代码与资料；如果需要写入，只能写工作记录，不允许改代码。",
  "回答尽量具体、可核对、说人话，必要时引用文件路径。"
].join(`
`), tw = [
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
], P = {
  config: null,
  runtime: null,
  messages: [],
  isBusy: !1,
  currentRound: 0,
  progressLabel: "",
  activeRun: null,
  autoScroll: !0,
  toast: "",
  modelOptionsByProvider: {},
  pullStateByProvider: {}
}, ht = /* @__PURE__ */ new Map(), lo = null;
function Nt(e, t = {}) {
  parent.postMessage({
    source: JS,
    type: e,
    payload: t
  }, window.location.origin);
}
function er(e) {
  return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function tr(e, t = {}) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return t;
  }
}
function jl(e) {
  const t = String(e || "");
  return t.length <= Zl ? t : `${t.slice(0, Zl)}

[内容过长，已截断保存]`;
}
function nw(e) {
  return {
    role: e.role,
    content: jl(e.content),
    toolCallId: e.toolCallId || "",
    toolName: e.toolName || "",
    toolCalls: Array.isArray(e.toolCalls) ? e.toolCalls.map((t) => ({
      id: t.id || "",
      name: t.name || "",
      arguments: jl(t.arguments || "{}")
    })) : []
  };
}
function ow(e) {
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
      id: String(t.id || er("tool")),
      name: String(t.name || ""),
      arguments: String(t.arguments || "{}")
    })) : void 0
  };
}
function Ff() {
  try {
    if (!P.messages.length) {
      localStorage.removeItem(gi);
      return;
    }
    localStorage.setItem(gi, JSON.stringify({ messages: P.messages.slice(-KS).map(nw) }));
  } catch {
  }
}
function sw() {
  try {
    const e = tr(localStorage.getItem(gi), {});
    P.messages = Array.isArray(e.messages) ? e.messages.map(ow).filter(Boolean) : [];
  } catch {
    P.messages = [];
  }
}
function Gf(e) {
  if (P.toast = String(e || "").trim(), lo && clearTimeout(lo), !P.toast) {
    j();
    return;
  }
  const t = Math.max(zS, Math.min(XS, YS + P.toast.length * 18));
  lo = setTimeout(() => {
    lo = null, P.toast = "", j();
  }, t), j();
}
function Bf(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return e?.name === "AbortError" || t === "assistant_aborted" || t === "tool_aborted" || t.includes("aborted");
}
function iw(e) {
  return ZS.find((t) => t.value === e)?.label || e;
}
function rw(e) {
  return P.pullStateByProvider[e] || {
    status: "idle",
    message: ""
  };
}
function Is(e, t) {
  P.pullStateByProvider = {
    ...P.pullStateByProvider,
    [e]: t
  };
}
function eu(e, t) {
  P.modelOptionsByProvider = {
    ...P.modelOptionsByProvider,
    [e]: Array.isArray(t) ? t : []
  };
}
function aw(e) {
  return Array.isArray(P.modelOptionsByProvider[e]) ? P.modelOptionsByProvider[e] : [];
}
function tu(e, t, n = "") {
  if (e.replaceChildren(), n) {
    const o = document.createElement("option");
    o.value = "", o.textContent = n, e.appendChild(o);
  }
  t.forEach((o) => {
    const s = document.createElement("option");
    s.value = o.value, s.textContent = o.label, e.appendChild(s);
  });
}
function Cs(e = []) {
  const t = [...new Set(e.filter(Boolean).map((s) => String(s).trim()).filter(Boolean))], n = ew.chat, o = t.filter((s) => {
    const i = s.toLowerCase();
    return !n.exclude.some((a) => i.includes(a));
  });
  return o.length ? o : t;
}
async function lw(e) {
  const t = e.provider;
  let n = String(e.baseUrl || "").trim();
  const o = String(e.apiKey || "").trim();
  if (!o) throw new Error("请先填写 API Key。");
  if (!n) throw new Error("请先填写 Base URL。");
  if (t === "google") {
    const a = await fetch(`${n.replace(/\/$/, "")}/models?key=${encodeURIComponent(o)}`, { headers: { Accept: "application/json" } });
    if (!a.ok) throw new Error(`Google AI 拉取模型失败：${a.status}`);
    return Cs(((await a.json()).models || []).map((u) => String(u?.id || u?.name || "").split("/").pop() || "").filter(Boolean));
  }
  if (t === "anthropic") {
    const a = await fetch(`${n.replace(/\/$/, "")}/models`, { headers: {
      "x-api-key": o,
      "anthropic-version": "2023-06-01",
      Accept: "application/json"
    } });
    if (!a.ok) throw new Error(`Anthropic 拉取模型失败：${a.status}`);
    return Cs(((await a.json()).data || []).map((u) => String(u?.id || "")).filter(Boolean));
  }
  n.endsWith("/v1") && (n = n.slice(0, -3));
  const s = async (a) => {
    const u = await fetch(a, { headers: {
      Authorization: `Bearer ${o}`,
      Accept: "application/json"
    } });
    return u.ok ? ((await u.json()).data || []).map((c) => String(c?.id || "")).filter(Boolean) : null;
  };
  let i = await s(`${n.replace(/\/$/, "")}/v1/models`);
  if (i || (i = await s(`${n.replace(/\/$/, "")}/models`)), !i?.length) throw new Error("未获取到模型列表。");
  return Cs(i);
}
function nu(e) {
  const t = String(e?.message || e || "unknown_error"), n = t.toLowerCase();
  return Bf(e) ? "本轮请求已终止。" : n === "tool_timeout" ? "工具调用超时了（180 秒），可以重试，或把问题收窄一点。" : n.startsWith("workspace_write_failed:") ? "工作区写入失败，请检查酒馆文件权限或稍后重试。" : n.startsWith("manifest_load_failed:") ? "助手索引文件清单加载失败，请刷新页面后再试。" : n.startsWith("file_read_failed:") ? "读取源码文件失败了，请换个文件再试，或刷新页面重试。" : n === "file_not_indexed" ? "这个文件不在当前助手索引范围里。" : n === "empty_query" ? "搜索词是空的，换一个明确点的关键词就行。" : n.includes("401") || n.includes("authentication") ? "认证失败了，请检查当前 Provider 的 API Key。" : n.includes("403") || n.includes("permission") ? "请求被拒绝了，请检查 API Key 权限、模型权限或站点限制。" : n.includes("429") || n.includes("rate limit") ? "请求太频繁了，接口触发了限流，请稍后再试。" : n.includes("timeout") || n.includes("timed out") ? "请求超时了，请稍后再试。" : n.includes("failed to fetch") || n.includes("network") ? "网络请求失败了，请检查 Base URL、代理或跨域设置。" : `请求失败：${t}`;
}
function uw(e, t = {}) {
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
function cw(e) {
  const t = tr(e.content, null);
  if (!t || typeof t != "object") return {
    summary: e.content || "",
    details: ""
  };
  if (e.toolName === "list_files") {
    const n = Array.isArray(t.items) ? t.items : [], o = [`找到 ${t.total || 0} 个候选文件，当前展示 ${n.length} 个。`];
    return t.truncated && o.push("结果已截断，可以把关键词再收窄一点。"), n.length && (o.push(""), n.forEach((s) => {
      o.push(`- ${s.publicPath}${s.source ? ` [${s.source}]` : ""}`);
    })), {
      summary: o.join(`
`),
      details: ""
    };
  }
  if (e.toolName === "search_files") {
    const n = Array.isArray(t.items) ? t.items : [], o = [`关键词“${t.query || ""}”命中 ${t.total || 0} 个文件。`];
    return t.truncated && o.push(`已达到返回上限；本次扫描 ${t.scannedFiles || 0}/${t.indexedFiles || 0} 个文件。`), n.length && (o.push(""), n.forEach((s) => {
      o.push(`- ${s.path}`);
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
  P.messages.push(e), Ff();
}
function dw(e, t) {
  for (const [n, o] of ht.entries())
    o.runId === e && (ht.delete(n), o.cleanup?.(), o.reject(t));
}
function ou(e = "本轮请求已终止。") {
  const t = P.activeRun;
  t && (t.cancelNotice = e, P.progressLabel = "正在终止…", dw(t.id, /* @__PURE__ */ new Error("tool_aborted")), t.controller.abort(), j());
}
function nr() {
  const e = P.config || {}, t = e.provider || "openai-compatible", n = (e.modelConfigs || {})[t] || {};
  return {
    provider: t,
    baseUrl: n.baseUrl || "",
    model: n.model || "",
    apiKey: n.apiKey || "",
    temperature: Number(n.temperature ?? 0.2),
    maxTokens: Number(n.maxTokens ?? 1600),
    timeoutMs: Uf,
    toolMode: n.toolMode || "native"
  };
}
function fw() {
  const e = nr();
  if (!e.apiKey) throw new Error("请先在小白助手里填写当前提供商的 API Key。");
  switch (e.provider) {
    case "openai-responses":
      return new pp(e);
    case "anthropic":
      return new um(e);
    case "google":
      return new HS(e);
    default:
      return new dp(e);
  }
}
function hw() {
  const e = [{
    role: "system",
    content: $f
  }];
  for (const t of P.messages) {
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
function pw(e, t, n = {}) {
  const o = er("tool"), s = P.activeRun;
  return s && s.id === n.runId && s.toolRequestIds.add(o), new Promise((i, a) => {
    let u = !1, c = null;
    const d = () => {
      c && (clearTimeout(c), c = null), n.signal && p && n.signal.removeEventListener("abort", p);
      const m = P.activeRun;
      m && m.id === n.runId && m.toolRequestIds.delete(o);
    }, h = (m) => {
      u || (u = !0, ht.delete(o), d(), a(m));
    }, f = (m) => {
      u || (u = !0, ht.delete(o), d(), i(m));
    }, p = () => {
      Nt("xb-assistant:tool-abort", { requestId: o }), h(/* @__PURE__ */ new Error("tool_aborted"));
    };
    if (c = setTimeout(() => {
      Nt("xb-assistant:tool-abort", { requestId: o }), h(/* @__PURE__ */ new Error("tool_timeout"));
    }, Uf), ht.set(o, {
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
async function mw(e) {
  const t = fw();
  let n = 0;
  for (; n < At; ) {
    if (e.controller.signal.aborted) throw new Error("assistant_aborted");
    n += 1, P.currentRound = n, P.progressLabel = `第 ${n}/${At} 轮：正在请求模型…`, j();
    const o = nr(), s = await t.chat({
      systemPrompt: $f,
      messages: hw(),
      tools: tw,
      toolChoice: "auto",
      temperature: o.temperature,
      maxTokens: o.maxTokens,
      signal: e.controller.signal
    });
    if (Array.isArray(s.toolCalls) && s.toolCalls.length) {
      ft({
        role: "assistant",
        content: s.text || "",
        toolCalls: s.toolCalls
      }), j();
      for (const i of s.toolCalls) {
        if (e.controller.signal.aborted) throw new Error("assistant_aborted");
        const a = tr(i.arguments, {});
        P.progressLabel = `第 ${n}/${At} 轮：正在${uw(i.name, a)}…`, j();
        const u = await pw(i.name, a, {
          runId: e.id,
          signal: e.controller.signal
        });
        ft({
          role: "tool",
          toolCallId: i.id,
          toolName: i.name,
          content: JSON.stringify(u, null, 2)
        }), j();
      }
      continue;
    }
    ft({
      role: "assistant",
      content: s.text || "没有拿到有效回复。"
    }), P.progressLabel = "", j();
    return;
  }
  ft({
    role: "assistant",
    content: `这轮工具调用已经到上限了（${At}/${At}）。你可以把问题再收窄一点，比如直接给我模块名、设置项名或报错文本。`
  }), P.progressLabel = "", j();
}
function su(e) {
  P.config = e, j();
}
function gw(e, t) {
  return {
    baseUrl: e.querySelector("#xb-assistant-base-url").value.trim(),
    model: e.querySelector("#xb-assistant-model").value.trim(),
    apiKey: e.querySelector("#xb-assistant-api-key").value.trim(),
    temperature: Number(((P.config?.modelConfigs || {})[t] || {}).temperature ?? 0.2),
    maxTokens: Number(((P.config?.modelConfigs || {})[t] || {}).maxTokens ?? 1600),
    toolMode: t === "openai-compatible" ? e.querySelector("#xb-assistant-tool-mode")?.value || "native" : void 0
  };
}
function Io(e) {
  if (!P.config) return;
  const t = e.querySelector("#xb-assistant-provider").value;
  P.config = {
    ...P.config,
    provider: t,
    workspaceFileName: e.querySelector("#xb-assistant-workspace").value.trim(),
    modelConfigs: {
      ...P.config.modelConfigs || {},
      [t]: {
        ...(P.config.modelConfigs || {})[t] || {},
        ...gw(e, t)
      }
    }
  };
}
function _w(e) {
  if (e.innerHTML = "", !P.messages.length) {
    const t = document.createElement("div");
    t.className = "xb-assistant-empty", t.innerHTML = "<h2>开始提问吧</h2><p>你可以直接问我：某个设置为什么不生效、某个报错代表什么、某个功能从哪条代码链路走。</p><p>我会优先自己查 LittleWhiteBox 和 SillyTavern 的前端代码，再给你结论。</p><p>下面的示例问题点击后会填入输入框，不会自动发送。</p>";
    const n = document.createElement("div");
    n.className = "xb-assistant-examples", jS.forEach((o) => {
      const s = document.createElement("button");
      s.type = "button", s.className = "xb-assistant-example-chip", s.dataset.prompt = o, s.textContent = o, n.appendChild(s);
    }), t.appendChild(n), e.appendChild(t);
    return;
  }
  for (const t of P.messages) {
    const n = document.createElement("div");
    n.className = `xb-assistant-bubble role-${t.role}`;
    const o = document.createElement("div");
    if (o.className = "xb-assistant-meta", o.textContent = t.role === "user" ? "你" : t.role === "assistant" ? Array.isArray(t.toolCalls) && t.toolCalls.length ? `小白助手 · 已发起 ${t.toolCalls.length} 个工具调用` : "小白助手" : `工具结果${t.toolName ? ` · ${t.toolName}` : ""}`, t.role === "tool") {
      const s = cw(t), i = document.createElement("pre");
      if (i.className = "xb-assistant-content", i.textContent = s.summary || "工具已返回结果。", n.append(o, i), s.details) {
        const a = document.createElement("details");
        a.className = "xb-assistant-tool-details";
        const u = document.createElement("summary");
        u.textContent = t.toolName === "read_file" ? "查看文件内容" : "查看详细结果";
        const c = document.createElement("pre");
        c.className = "xb-assistant-content tool-detail", c.textContent = s.details, a.append(u, c), n.appendChild(a);
      }
    } else {
      const s = document.createElement("pre");
      s.className = "xb-assistant-content", s.textContent = t.content || (t.role === "assistant" ? "我先查一下相关代码。" : ""), n.append(o, s);
    }
    e.appendChild(n);
  }
  P.autoScroll && (e.scrollTop = e.scrollHeight);
}
function yw(e) {
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
function vw(e) {
  if (!P.config) return;
  const t = P.config.provider || "openai-compatible", n = (P.config.modelConfigs || {})[t] || {}, o = aw(t), s = e.querySelector("#xb-assistant-tool-mode-wrap"), i = e.querySelector("#xb-assistant-tool-mode"), a = e.querySelector("#xb-assistant-model-pulled");
  e.querySelector("#xb-assistant-provider").value = t, e.querySelector("#xb-assistant-base-url").value = n.baseUrl || "", e.querySelector("#xb-assistant-model").value = n.model || "", e.querySelector("#xb-assistant-api-key").value = n.apiKey || "", e.querySelector("#xb-assistant-workspace").value = P.config.workspaceFileName || "", s.style.display = t === "openai-compatible" ? "" : "none", tu(i, QS), i.value = n.toolMode || "native", tu(a, o.map((d) => ({
    value: d,
    label: d
  })), "手动填写");
  const u = e.querySelector("#xb-assistant-runtime"), c = rw(t);
  u.textContent = P.runtime ? `${iw(t)} · 已索引 ${P.runtime.indexedFileCount || 0} 个前端源码文件${c.message ? ` · ${c.message}` : ""}` : c.message || "";
}
function Tw(e) {
  Io(e), Nt("xb-assistant:save-config", {
    provider: P.config?.provider || "openai-compatible",
    workspaceFileName: e.querySelector("#xb-assistant-workspace").value.trim(),
    modelConfigs: P.config?.modelConfigs || {}
  });
}
function Ew() {
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
        .xb-assistant-grow { min-width: 0; }
        .xb-assistant-model-row { align-items: end; }
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
            .xb-assistant-inline-input { grid-template-columns: 1fr; }
        }
    `, document.head.appendChild(e);
}
function j() {
  const e = document.getElementById(WS);
  if (!e) return;
  e.firstChild || (yw(e), Sw(e)), vw(e), _w(e.querySelector("#xb-assistant-chat"));
  const t = e.querySelector("#xb-assistant-send");
  t.disabled = !1, t.classList.toggle("is-busy", P.isBusy), t.textContent = P.isBusy ? `终止 (${Math.max(1, P.currentRound)}/${At})` : "发送";
  const n = e.querySelector("#xb-assistant-clear");
  n.disabled = P.isBusy || !P.messages.length;
  const o = e.querySelector("#xb-assistant-pull-models");
  o.disabled = P.isBusy;
  const s = e.querySelector("#xb-assistant-status");
  s.textContent = P.progressLabel || "就绪", s.classList.toggle("busy", P.isBusy);
  const i = e.querySelector("#xb-assistant-toast");
  i.textContent = P.toast || "", i.classList.toggle("visible", !!P.toast);
  const a = e.querySelector("#xb-assistant-toggle-key");
  a.textContent = e.querySelector("#xb-assistant-api-key").type === "password" ? "显示" : "隐藏";
}
function Sw(e) {
  const t = e.querySelector("#xb-assistant-input"), n = () => {
    t.style.height = "auto", t.style.height = `${Math.min(Math.max(t.scrollHeight, 92), 240)}px`;
  };
  e.querySelector("#xb-assistant-chat").addEventListener("scroll", (o) => {
    const s = o.currentTarget;
    P.autoScroll = s.scrollHeight - s.scrollTop - s.clientHeight <= 48;
  }), e.querySelector("#xb-assistant-chat").addEventListener("click", (o) => {
    const s = o.target.closest(".xb-assistant-example-chip");
    s && (t.value = s.dataset.prompt || "", n(), t.focus());
  }), e.querySelector("#xb-assistant-provider").addEventListener("change", () => {
    Io(e), P.config = {
      ...P.config || {},
      provider: e.querySelector("#xb-assistant-provider").value
    }, j();
  }), e.querySelector("#xb-assistant-model-pulled").addEventListener("change", (o) => {
    const s = o.currentTarget.value;
    s && (e.querySelector("#xb-assistant-model").value = s);
  }), e.querySelector("#xb-assistant-toggle-key").addEventListener("click", () => {
    const o = e.querySelector("#xb-assistant-api-key");
    o.type = o.type === "password" ? "text" : "password", j();
  }), e.querySelector("#xb-assistant-pull-models").addEventListener("click", async () => {
    Io(e);
    const o = nr();
    Is(o.provider, {
      status: "loading",
      message: "正在拉取模型列表…"
    }), j();
    try {
      const s = await lw(o);
      eu(o.provider, s), Is(o.provider, {
        status: "success",
        message: `已拉取 ${s.length} 个模型`
      });
    } catch (s) {
      eu(o.provider, []), Is(o.provider, {
        status: "error",
        message: nu(s)
      });
    }
    j();
  }), e.querySelector("#xb-assistant-save").addEventListener("click", () => {
    Tw(e);
  }), e.querySelector("#xb-assistant-clear").addEventListener("click", () => {
    P.isBusy || (P.messages = [], Ff(), Gf("对话已清空"), j());
  }), e.querySelector("#xb-assistant-close").addEventListener("click", () => {
    P.isBusy && ou(""), Nt("xb-assistant:close");
  }), e.querySelector("#xb-assistant-form").addEventListener("submit", async (o) => {
    if (o.preventDefault(), P.isBusy) {
      ou("本轮请求已终止。");
      return;
    }
    const s = t.value.trim();
    if (!s) return;
    Io(e), ft({
      role: "user",
      content: s
    }), t.value = "", n();
    const i = {
      id: er("run"),
      controller: new AbortController(),
      toolRequestIds: /* @__PURE__ */ new Set(),
      cancelNotice: ""
    };
    P.activeRun = i, P.isBusy = !0, P.currentRound = 0, P.progressLabel = "正在请求模型…", P.autoScroll = !0, j();
    try {
      await mw(i);
    } catch (a) {
      Bf(a) ? i.cancelNotice && ft({
        role: "assistant",
        content: i.cancelNotice
      }) : ft({
        role: "assistant",
        content: nu(a)
      });
    } finally {
      P.activeRun?.id === i.id && (P.activeRun = null), P.isBusy = !1, P.currentRound = 0, P.progressLabel = "", j();
    }
  }), t.addEventListener("input", n), n();
}
window.addEventListener("message", (e) => {
  if (e.origin !== window.location.origin || e.source !== parent) return;
  const t = e.data || {};
  if (t.type === "xb-assistant:config") {
    P.runtime = t.payload?.runtime || null, su(t.payload?.config || {});
    return;
  }
  if (t.type === "xb-assistant:config-saved") {
    su(t.payload?.config || {}), Gf("配置已保存");
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
sw();
Ew();
j();
Nt("xb-assistant:ready");
