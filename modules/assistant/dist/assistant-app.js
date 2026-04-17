var Oh = Object.create, bc = Object.defineProperty, qh = Object.getOwnPropertyDescriptor, Vh = Object.getOwnPropertyNames, Hh = Object.getPrototypeOf, Jh = Object.prototype.hasOwnProperty, Ts = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), Wh = (e, t, n, o) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var s = Vh(t), i = 0, a = s.length, u; i < a; i++)
      u = s[i], !Jh.call(e, u) && u !== n && bc(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(o = qh(t, u)) || o.enumerable
      });
  return e;
}, Kh = (e, t, n) => (n = e != null ? Oh(Hh(e)) : {}, Wh(t || !e || !e.__esModule ? bc(n, "default", {
  value: e,
  enumerable: !0
}) : n, e));
function q(e, t, n, o, s) {
  if (o === "m") throw new TypeError("Private method is not writable");
  if (o === "a" && !s) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !s : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return o === "a" ? s.call(e, n) : s ? s.value = n : t.set(e, n), n;
}
function S(e, t, n, o) {
  if (n === "a" && !o) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !o : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? o : n === "a" ? o.call(e) : o ? o.value : t.get(e);
}
var Cc = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Cc = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function bi(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Ci = (e) => {
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
}, O = class extends Error {
}, Se = class Ii extends O {
  constructor(t, n, o, s) {
    super(`${Ii.makeMessage(t, n, o)}`), this.status = t, this.headers = s, this.requestID = s?.get("x-request-id"), this.error = n;
    const i = n;
    this.code = i?.code, this.param = i?.param, this.type = i?.type;
  }
  static makeMessage(t, n, o) {
    const s = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && s ? `${t} ${s}` : t ? `${t} status code (no body)` : s || "(no status code or body)";
  }
  static generate(t, n, o, s) {
    if (!t || !s) return new ws({
      message: o,
      cause: Ci(n)
    });
    const i = n?.error;
    return t === 400 ? new Ic(t, i, o, s) : t === 401 ? new xc(t, i, o, s) : t === 403 ? new Rc(t, i, o, s) : t === 404 ? new Pc(t, i, o, s) : t === 409 ? new Mc(t, i, o, s) : t === 422 ? new Nc(t, i, o, s) : t === 429 ? new kc(t, i, o, s) : t >= 500 ? new Lc(t, i, o, s) : new Ii(t, i, o, s);
  }
}, Fe = class extends Se {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, ws = class extends Se {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Sr = class extends ws {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Ic = class extends Se {
}, xc = class extends Se {
}, Rc = class extends Se {
}, Pc = class extends Se {
}, Mc = class extends Se {
}, Nc = class extends Se {
}, kc = class extends Se {
}, Lc = class extends Se {
}, Dc = class extends O {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, $c = class extends O {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, Pn = class extends Error {
  constructor(e) {
    super(e);
  }
}, Uc = class extends Se {
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
}, zh = class extends O {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, Yh = /^[a-z][a-z0-9+.-]*:/i, Xh = (e) => Yh.test(e), Ie = (e) => (Ie = Array.isArray, Ie(e)), Sa = Ie;
function Fc(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function Ea(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Qh(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function Ys(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var Zh = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new O(`${e} must be an integer`);
  if (t < 0) throw new O(`${e} must be a positive integer`);
  return t;
}, jh = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, no = (e) => new Promise((t) => setTimeout(t, e)), Ht = "6.34.0", em = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function tm() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var nm = () => {
  const e = tm();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ht,
    "X-Stainless-OS": wa(Deno.build.os),
    "X-Stainless-Arch": Ta(Deno.build.arch),
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
    "X-Stainless-OS": wa(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": Ta(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = om();
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
function om() {
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
var Ta = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", wa = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), Aa, sm = () => Aa ?? (Aa = nm());
function Bc() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Gc(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Oc(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Gc({
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
function qc(e) {
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
var im = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), Vc = "RFC3986", Hc = (e) => String(e), Ca = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: Hc
};
var xi = (e, t) => (xi = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), xi(e, t)), je = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), Xs = 1024, rm = (e, t, n, o, s) => {
  if (e.length === 0) return e;
  let i = e;
  if (typeof e == "symbol" ? i = Symbol.prototype.toString.call(e) : typeof e != "string" && (i = String(e)), n === "iso-8859-1") return escape(i).replace(/%u[0-9a-f]{4}/gi, function(u) {
    return "%26%23" + parseInt(u.slice(2), 16) + "%3B";
  });
  let a = "";
  for (let u = 0; u < i.length; u += Xs) {
    const c = i.length >= Xs ? i.slice(u, u + Xs) : i, d = [];
    for (let p = 0; p < c.length; ++p) {
      let f = c.charCodeAt(p);
      if (f === 45 || f === 46 || f === 95 || f === 126 || f >= 48 && f <= 57 || f >= 65 && f <= 90 || f >= 97 && f <= 122 || s === "RFC1738" && (f === 40 || f === 41)) {
        d[d.length] = c.charAt(p);
        continue;
      }
      if (f < 128) {
        d[d.length] = je[f];
        continue;
      }
      if (f < 2048) {
        d[d.length] = je[192 | f >> 6] + je[128 | f & 63];
        continue;
      }
      if (f < 55296 || f >= 57344) {
        d[d.length] = je[224 | f >> 12] + je[128 | f >> 6 & 63] + je[128 | f & 63];
        continue;
      }
      p += 1, f = 65536 + ((f & 1023) << 10 | c.charCodeAt(p) & 1023), d[d.length] = je[240 | f >> 18] + je[128 | f >> 12 & 63] + je[128 | f >> 6 & 63] + je[128 | f & 63];
    }
    a += d.join("");
  }
  return a;
};
function am(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function Ia(e, t) {
  if (Ie(e)) {
    const n = [];
    for (let o = 0; o < e.length; o += 1) n.push(t(e[o]));
    return n;
  }
  return t(e);
}
var Jc = {
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
}, Wc = function(e, t) {
  Array.prototype.push.apply(e, Ie(t) ? t : [t]);
}, xa, ce = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: rm,
  encodeValuesOnly: !1,
  format: Vc,
  formatter: Hc,
  indices: !1,
  serializeDate(e) {
    return (xa ?? (xa = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function lm(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var Qs = {};
function Kc(e, t, n, o, s, i, a, u, c, d, p, f, h, m, g, y, _, C) {
  let b = e, x = C, M = 0, $ = !1;
  for (; (x = x.get(Qs)) !== void 0 && !$; ) {
    const W = x.get(e);
    if (M += 1, typeof W < "u") {
      if (W === M) throw new RangeError("Cyclic object value");
      $ = !0;
    }
    typeof x.get(Qs) > "u" && (M = 0);
  }
  if (typeof d == "function" ? b = d(t, b) : b instanceof Date ? b = h?.(b) : n === "comma" && Ie(b) && (b = Ia(b, function(W) {
    return W instanceof Date ? h?.(W) : W;
  })), b === null) {
    if (i) return c && !y ? c(t, ce.encoder, _, "key", m) : t;
    b = "";
  }
  if (lm(b) || am(b)) {
    if (c) {
      const W = y ? t : c(t, ce.encoder, _, "key", m);
      return [g?.(W) + "=" + g?.(c(b, ce.encoder, _, "value", m))];
    }
    return [g?.(t) + "=" + g?.(String(b))];
  }
  const T = [];
  if (typeof b > "u") return T;
  let F;
  if (n === "comma" && Ie(b))
    y && c && (b = Ia(b, c)), F = [{ value: b.length > 0 ? b.join(",") || null : void 0 }];
  else if (Ie(d)) F = d;
  else {
    const W = Object.keys(b);
    F = p ? W.sort(p) : W;
  }
  const P = u ? String(t).replace(/\./g, "%2E") : String(t), D = o && Ie(b) && b.length === 1 ? P + "[]" : P;
  if (s && Ie(b) && b.length === 0) return D + "[]";
  for (let W = 0; W < F.length; ++W) {
    const X = F[W], me = typeof X == "object" && typeof X.value < "u" ? X.value : b[X];
    if (a && me === null) continue;
    const ge = f && u ? X.replace(/\./g, "%2E") : X, se = Ie(b) ? typeof n == "function" ? n(D, ge) : D : D + (f ? "." + ge : "[" + ge + "]");
    C.set(e, M);
    const te = /* @__PURE__ */ new WeakMap();
    te.set(Qs, C), Wc(T, Kc(me, se, n, o, s, i, a, u, n === "comma" && y && Ie(b) ? null : c, d, p, f, h, m, g, y, _, te));
  }
  return T;
}
function um(e = ce) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || ce.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = Vc;
  if (typeof e.format < "u") {
    if (!xi(Ca, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const o = Ca[n];
  let s = ce.filter;
  (typeof e.filter == "function" || Ie(e.filter)) && (s = e.filter);
  let i;
  if (e.arrayFormat && e.arrayFormat in Jc ? i = e.arrayFormat : "indices" in e ? i = e.indices ? "indices" : "repeat" : i = ce.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  const a = typeof e.allowDots > "u" ? e.encodeDotInKeys ? !0 : ce.allowDots : !!e.allowDots;
  return {
    addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : ce.addQueryPrefix,
    allowDots: a,
    allowEmptyArrays: typeof e.allowEmptyArrays == "boolean" ? !!e.allowEmptyArrays : ce.allowEmptyArrays,
    arrayFormat: i,
    charset: t,
    charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : ce.charsetSentinel,
    commaRoundTrip: !!e.commaRoundTrip,
    delimiter: typeof e.delimiter > "u" ? ce.delimiter : e.delimiter,
    encode: typeof e.encode == "boolean" ? e.encode : ce.encode,
    encodeDotInKeys: typeof e.encodeDotInKeys == "boolean" ? e.encodeDotInKeys : ce.encodeDotInKeys,
    encoder: typeof e.encoder == "function" ? e.encoder : ce.encoder,
    encodeValuesOnly: typeof e.encodeValuesOnly == "boolean" ? e.encodeValuesOnly : ce.encodeValuesOnly,
    filter: s,
    format: n,
    formatter: o,
    serializeDate: typeof e.serializeDate == "function" ? e.serializeDate : ce.serializeDate,
    skipNulls: typeof e.skipNulls == "boolean" ? e.skipNulls : ce.skipNulls,
    sort: typeof e.sort == "function" ? e.sort : null,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : ce.strictNullHandling
  };
}
function cm(e, t = {}) {
  let n = e;
  const o = um(t);
  let s, i;
  typeof o.filter == "function" ? (i = o.filter, n = i("", n)) : Ie(o.filter) && (i = o.filter, s = i);
  const a = [];
  if (typeof n != "object" || n === null) return "";
  const u = Jc[o.arrayFormat], c = u === "comma" && o.commaRoundTrip;
  s || (s = Object.keys(n)), o.sort && s.sort(o.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let h = 0; h < s.length; ++h) {
    const m = s[h];
    o.skipNulls && n[m] === null || Wc(a, Kc(n[m], m, u, c, o.allowEmptyArrays, o.strictNullHandling, o.skipNulls, o.encodeDotInKeys, o.encode ? o.encoder : null, o.filter, o.sort, o.allowDots, o.serializeDate, o.format, o.formatter, o.encodeValuesOnly, o.charset, d));
  }
  const p = a.join(o.delimiter);
  let f = o.addQueryPrefix === !0 ? "?" : "";
  return o.charsetSentinel && (o.charset === "iso-8859-1" ? f += "utf8=%26%2310003%3B&" : f += "utf8=%E2%9C%93&"), p.length > 0 ? f + p : "";
}
function dm(e) {
  return cm(e, { arrayFormat: "brackets" });
}
function fm(e) {
  let t = 0;
  for (const s of e) t += s.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const s of e)
    n.set(s, o), o += s.length;
  return n;
}
var Ra;
function Er(e) {
  let t;
  return (Ra ?? (t = new globalThis.TextEncoder(), Ra = t.encode.bind(t)))(e);
}
var Pa;
function Ma(e) {
  let t;
  return (Pa ?? (t = new globalThis.TextDecoder(), Pa = t.decode.bind(t)))(e);
}
var Pe, Me, As = class {
  constructor() {
    Pe.set(this, void 0), Me.set(this, void 0), q(this, Pe, new Uint8Array(), "f"), q(this, Me, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Er(e) : e;
    q(this, Pe, fm([S(this, Pe, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = pm(S(this, Pe, "f"), S(this, Me, "f"))) != null; ) {
      if (o.carriage && S(this, Me, "f") == null) {
        q(this, Me, o.index, "f");
        continue;
      }
      if (S(this, Me, "f") != null && (o.index !== S(this, Me, "f") + 1 || o.carriage)) {
        n.push(Ma(S(this, Pe, "f").subarray(0, S(this, Me, "f") - 1))), q(this, Pe, S(this, Pe, "f").subarray(S(this, Me, "f")), "f"), q(this, Me, null, "f");
        continue;
      }
      const s = S(this, Me, "f") !== null ? o.preceding - 1 : o.preceding, i = Ma(S(this, Pe, "f").subarray(0, s));
      n.push(i), q(this, Pe, S(this, Pe, "f").subarray(o.index), "f"), q(this, Me, null, "f");
    }
    return n;
  }
  flush() {
    return S(this, Pe, "f").length ? this.decode(`
`) : [];
  }
};
Pe = /* @__PURE__ */ new WeakMap(), Me = /* @__PURE__ */ new WeakMap();
As.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
As.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function pm(e, t) {
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
function hm(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var is = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Na = (e, t, n) => {
  if (e) {
    if (Qh(is, e)) return e;
    ye(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(is))}`);
  }
};
function Mn() {
}
function mo(e, t, n) {
  return !t || is[e] > is[n] ? Mn : t[e].bind(t);
}
var mm = {
  error: Mn,
  warn: Mn,
  info: Mn,
  debug: Mn
}, ka = /* @__PURE__ */ new WeakMap();
function ye(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return mm;
  const o = ka.get(t);
  if (o && o[0] === n) return o[1];
  const s = {
    error: mo("error", t, n),
    warn: mo("warn", t, n),
    info: mo("info", t, n),
    debug: mo("debug", t, n)
  };
  return ka.set(t, [n, s]), s;
}
var It = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), cn, Xn = class Nn {
  constructor(t, n, o) {
    this.iterator = t, cn.set(this, void 0), this.controller = n, q(this, cn, o, "f");
  }
  static fromSSEResponse(t, n, o, s) {
    let i = !1;
    const a = o ? ye(o) : console;
    async function* u() {
      if (i) throw new O("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let c = !1;
      try {
        for await (const d of gm(t, n))
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
              if (p && p.error) throw new Se(void 0, p.error, void 0, t.headers);
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
              if (d.event == "error") throw new Se(void 0, p.error, p.message, void 0);
              yield {
                event: d.event,
                data: p
              };
            }
          }
        c = !0;
      } catch (d) {
        if (bi(d)) return;
        throw d;
      } finally {
        c || n.abort();
      }
    }
    return new Nn(u, n, o);
  }
  static fromReadableStream(t, n, o) {
    let s = !1;
    async function* i() {
      const u = new As(), c = qc(t);
      for await (const d of c) for (const p of u.decode(d)) yield p;
      for (const d of u.flush()) yield d;
    }
    async function* a() {
      if (s) throw new O("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      s = !0;
      let u = !1;
      try {
        for await (const c of i())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (bi(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Nn(a, n, o);
  }
  [(cn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new Nn(() => s(t), this.controller, S(this, cn, "f")), new Nn(() => s(n), this.controller, S(this, cn, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Gc({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: s, done: i } = await n.next();
          if (i) return o.close();
          const a = Er(JSON.stringify(s) + `
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
async function* gm(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new O("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new O("Attempted to iterate over a response with no body");
  const n = new _m(), o = new As(), s = qc(e.body);
  for await (const i of ym(s)) for (const a of o.decode(i)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const i of o.flush()) {
    const a = n.decode(i);
    a && (yield a);
  }
}
async function* ym(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Er(n) : n;
    let s = new Uint8Array(t.length + o.length);
    s.set(t), s.set(o, t.length), t = s;
    let i;
    for (; (i = hm(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var _m = class {
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
    let [t, n, o] = vm(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function vm(e, t) {
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
async function zc(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: s, startTime: i } = t, a = await (async () => {
    if (t.options.stream)
      return ye(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : Xn.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Yc(await n.json(), n) : await n.text();
  })();
  return ye(e).debug(`[${o}] response parsed`, It({
    retryOfRequestLogID: s,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
function Yc(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var kn, Xc = class Qc extends Promise {
  constructor(t, n, o = zc) {
    super((s) => {
      s(null);
    }), this.responsePromise = n, this.parseResponse = o, kn.set(this, void 0), q(this, kn, t, "f");
  }
  _thenUnwrap(t) {
    return new Qc(S(this, kn, "f"), this.responsePromise, async (n, o) => Yc(t(await this.parseResponse(n, o), o), o.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(S(this, kn, "f"), t))), this.parsedPromise;
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
kn = /* @__PURE__ */ new WeakMap();
var go, Tr = class {
  constructor(e, t, n, o) {
    go.set(this, void 0), q(this, go, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new O("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await S(this, go, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(go = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, Sm = class extends Xc {
  constructor(e, t, n) {
    super(e, t, async (o, s) => new n(o, s.response, await zc(o, s), s.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, bs = class extends Tr {
  constructor(e, t, n, o) {
    super(e, t, n, o), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, re = class extends Tr {
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
        ...Fc(this.options.query),
        after: t
      }
    } : null;
  }
}, Qn = class extends Tr {
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
        ...Fc(this.options.query),
        after: e
      }
    } : null;
  }
}, Em = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, Tm = "urn:ietf:params:oauth:grant-type:token-exchange", wm = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? Bc();
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
        grant_type: Tm,
        client_id: this.config.clientId,
        subject_token: e,
        subject_token_type: Em[this.config.provider.tokenType],
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
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new Uc(t.status, a, t.headers) : Se.generate(t.status, a, `Token exchange failed with status ${t.status}`, t.headers);
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
}, Zc = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Jn(e, t, n) {
  return Zc(), new File(e, t ?? "unknown_file", n);
}
function Vo(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var wr = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Cs = async (e, t) => Ri(e.body) ? {
  ...e,
  body: await jc(e.body, t)
} : e, tt = async (e, t) => ({
  ...e,
  body: await jc(e.body, t)
}), La = /* @__PURE__ */ new WeakMap();
function Am(e) {
  const t = typeof e == "function" ? e : e.fetch, n = La.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const s = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new s(i).text();
    } catch {
      return !0;
    }
  })();
  return La.set(t, o), o;
}
var jc = async (e, t) => {
  if (!await Am(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([o, s]) => Pi(n, o, s))), n;
}, ed = (e) => e instanceof Blob && "name" in e, bm = (e) => typeof e == "object" && e !== null && (e instanceof Response || wr(e) || ed(e)), Ri = (e) => {
  if (bm(e)) return !0;
  if (Array.isArray(e)) return e.some(Ri);
  if (e && typeof e == "object") {
    for (const t in e) if (Ri(e[t])) return !0;
  }
  return !1;
}, Pi = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, Jn([await n.blob()], Vo(n)));
    else if (wr(n)) e.append(t, Jn([await new Response(Oc(n)).blob()], Vo(n)));
    else if (ed(n)) e.append(t, n, Vo(n));
    else if (Array.isArray(n)) await Promise.all(n.map((o) => Pi(e, t + "[]", o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([o, s]) => Pi(e, `${t}[${o}]`, s)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, td = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", Cm = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && td(e), Im = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function xm(e, t, n) {
  if (Zc(), e = await e, Cm(e))
    return e instanceof File ? e : Jn([await e.arrayBuffer()], e.name);
  if (Im(e)) {
    const s = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Jn(await Mi(s), t, n);
  }
  const o = await Mi(e);
  if (t || (t = Vo(e)), !n?.type) {
    const s = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof s == "string" && (n = {
      ...n,
      type: s
    });
  }
  return Jn(o, t, n);
}
async function Mi(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (td(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (wr(e)) for await (const n of e) t.push(...await Mi(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${Rm(e)}`);
  }
  return t;
}
function Rm(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var G = class {
  constructor(e) {
    this._client = e;
  }
};
function nd(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Da = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Pm = (e = nd) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let s = !1;
  const i = [], a = n.reduce((p, f, h) => {
    /[?#]/.test(f) && (s = !0);
    const m = o[h];
    let g = (s ? encodeURIComponent : e)("" + m);
    return h !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? Da) ?? Da)?.toString) && (g = m + "", i.push({
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
    throw new O(`Path parameters result in path with invalid segments:
${i.map((h) => h.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}, I = /* @__PURE__ */ Pm(nd), od = class extends G {
  list(e, t = {}, n) {
    return this._client.getAPIList(I`/chat/completions/${e}/messages`, re, {
      query: t,
      ...n
    });
  }
};
function rs(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function Ar(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function oo(e) {
  return e?.$brand === "auto-parseable-tool";
}
function Mm(e, t) {
  return !t || !sd(t) ? {
    ...e,
    choices: e.choices.map((n) => (id(n.message.tool_calls), {
      ...n,
      message: {
        ...n.message,
        parsed: null,
        ...n.message.tool_calls ? { tool_calls: n.message.tool_calls } : void 0
      }
    }))
  } : br(e, t);
}
function br(e, t) {
  const n = e.choices.map((o) => {
    if (o.finish_reason === "length") throw new Dc();
    if (o.finish_reason === "content_filter") throw new $c();
    return id(o.message.tool_calls), {
      ...o,
      message: {
        ...o.message,
        ...o.message.tool_calls ? { tool_calls: o.message.tool_calls?.map((s) => km(t, s)) ?? void 0 } : void 0,
        parsed: o.message.content && !o.message.refusal ? Nm(t, o.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function Nm(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function km(e, t) {
  const n = e.tools?.find((o) => rs(o) && o.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: oo(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function Lm(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((o) => rs(o) && o.function?.name === t.function.name);
  return rs(n) && (oo(n) || n?.function.strict || !1);
}
function sd(e) {
  return Ar(e.response_format) ? !0 : e.tools?.some((t) => oo(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function id(e) {
  for (const t of e || []) if (t.type !== "function") throw new O(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function Dm(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new O(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new O(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var as = (e) => e?.role === "assistant", rd = (e) => e?.role === "tool", Ni, Ho, Jo, Ln, Dn, Wo, $n, at, Un, ls, us, Jt, ad, Cr = class {
  constructor() {
    Ni.add(this), this.controller = new AbortController(), Ho.set(this, void 0), Jo.set(this, () => {
    }), Ln.set(this, () => {
    }), Dn.set(this, void 0), Wo.set(this, () => {
    }), $n.set(this, () => {
    }), at.set(this, {}), Un.set(this, !1), ls.set(this, !1), us.set(this, !1), Jt.set(this, !1), q(this, Ho, new Promise((e, t) => {
      q(this, Jo, e, "f"), q(this, Ln, t, "f");
    }), "f"), q(this, Dn, new Promise((e, t) => {
      q(this, Wo, e, "f"), q(this, $n, t, "f");
    }), "f"), S(this, Ho, "f").catch(() => {
    }), S(this, Dn, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, S(this, Ni, "m", ad).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (S(this, Jo, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return S(this, Un, "f");
  }
  get errored() {
    return S(this, ls, "f");
  }
  get aborted() {
    return S(this, us, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(e, t) {
    return (S(this, at, "f")[e] || (S(this, at, "f")[e] = [])).push({ listener: t }), this;
  }
  off(e, t) {
    const n = S(this, at, "f")[e];
    if (!n) return this;
    const o = n.findIndex((s) => s.listener === t);
    return o >= 0 && n.splice(o, 1), this;
  }
  once(e, t) {
    return (S(this, at, "f")[e] || (S(this, at, "f")[e] = [])).push({
      listener: t,
      once: !0
    }), this;
  }
  emitted(e) {
    return new Promise((t, n) => {
      q(this, Jt, !0, "f"), e !== "error" && this.once("error", n), this.once(e, t);
    });
  }
  async done() {
    q(this, Jt, !0, "f"), await S(this, Dn, "f");
  }
  _emit(e, ...t) {
    if (S(this, Un, "f")) return;
    e === "end" && (q(this, Un, !0, "f"), S(this, Wo, "f").call(this));
    const n = S(this, at, "f")[e];
    if (n && (S(this, at, "f")[e] = n.filter((o) => !o.once), n.forEach(({ listener: o }) => o(...t))), e === "abort") {
      const o = t[0];
      !S(this, Jt, "f") && !n?.length && Promise.reject(o), S(this, Ln, "f").call(this, o), S(this, $n, "f").call(this, o), this._emit("end");
      return;
    }
    if (e === "error") {
      const o = t[0];
      !S(this, Jt, "f") && !n?.length && Promise.reject(o), S(this, Ln, "f").call(this, o), S(this, $n, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
Ho = /* @__PURE__ */ new WeakMap(), Jo = /* @__PURE__ */ new WeakMap(), Ln = /* @__PURE__ */ new WeakMap(), Dn = /* @__PURE__ */ new WeakMap(), Wo = /* @__PURE__ */ new WeakMap(), $n = /* @__PURE__ */ new WeakMap(), at = /* @__PURE__ */ new WeakMap(), Un = /* @__PURE__ */ new WeakMap(), ls = /* @__PURE__ */ new WeakMap(), us = /* @__PURE__ */ new WeakMap(), Jt = /* @__PURE__ */ new WeakMap(), Ni = /* @__PURE__ */ new WeakSet(), ad = function(t) {
  if (q(this, ls, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new Fe()), t instanceof Fe)
    return q(this, us, !0, "f"), this._emit("abort", t);
  if (t instanceof O) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new O(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new O(String(t)));
};
function $m(e) {
  return typeof e.parse == "function";
}
var we, ki, cs, Li, Di, $i, ld, ud, Um = 10, cd = class extends Cr {
  constructor() {
    super(...arguments), we.add(this), this._chatCompletions = [], this.messages = [];
  }
  _addChatCompletion(e) {
    this._chatCompletions.push(e), this._emit("chatCompletion", e);
    const t = e.choices[0]?.message;
    return t && this._addMessage(t), e;
  }
  _addMessage(e, t = !0) {
    if ("content" in e || (e.content = null), this.messages.push(e), t) {
      if (this._emit("message", e), rd(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (as(e) && e.tool_calls)
        for (const n of e.tool_calls) n.type === "function" && this._emit("functionToolCall", n.function);
    }
  }
  async finalChatCompletion() {
    await this.done();
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    if (!e) throw new O("stream ended without producing a ChatCompletion");
    return e;
  }
  async finalContent() {
    return await this.done(), S(this, we, "m", ki).call(this);
  }
  async finalMessage() {
    return await this.done(), S(this, we, "m", cs).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), S(this, we, "m", Li).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), S(this, we, "m", Di).call(this);
  }
  async totalUsage() {
    return await this.done(), S(this, we, "m", $i).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = S(this, we, "m", cs).call(this);
    t && this._emit("finalMessage", t);
    const n = S(this, we, "m", ki).call(this);
    n && this._emit("finalContent", n);
    const o = S(this, we, "m", Li).call(this);
    o && this._emit("finalFunctionToolCall", o);
    const s = S(this, we, "m", Di).call(this);
    s != null && this._emit("finalFunctionToolCallResult", s), this._chatCompletions.some((i) => i.usage) && this._emit("totalUsage", S(this, we, "m", $i).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), S(this, we, "m", ld).call(this, t);
    const s = await e.chat.completions.create({
      ...t,
      stream: !1
    }, {
      ...n,
      signal: this.controller.signal
    });
    return this._connected(), this._addChatCompletion(br(s, t));
  }
  async _runChatCompletion(e, t, n) {
    for (const o of t.messages) this._addMessage(o, !1);
    return await this._createChatCompletion(e, t, n);
  }
  async _runTools(e, t, n) {
    const o = "tool", { tool_choice: s = "auto", stream: i, ...a } = t, u = typeof s != "string" && s.type === "function" && s?.function?.name, { maxChatCompletions: c = Um } = n || {}, d = t.tools.map((h) => {
      if (oo(h)) {
        if (!h.$callback) throw new O("Tool given to `.runTools()` that does not have an associated function");
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
      if (!m) throw new O("missing message in ChatCompletion response");
      if (!m.tool_calls?.length) return;
      for (const g of m.tool_calls) {
        if (g.type !== "function") continue;
        const y = g.id, { name: _, arguments: C } = g.function, b = p[_];
        if (b) {
          if (u && u !== _) {
            const T = `Invalid tool_call: ${JSON.stringify(_)}. ${JSON.stringify(u)} requested. Please try again`;
            this._addMessage({
              role: o,
              tool_call_id: y,
              content: T
            });
            continue;
          }
        } else {
          const T = `Invalid tool_call: ${JSON.stringify(_)}. Available options are: ${Object.keys(p).map((F) => JSON.stringify(F)).join(", ")}. Please try again`;
          this._addMessage({
            role: o,
            tool_call_id: y,
            content: T
          });
          continue;
        }
        let x;
        try {
          x = $m(b) ? await b.parse(C) : C;
        } catch (T) {
          const F = T instanceof Error ? T.message : String(T);
          this._addMessage({
            role: o,
            tool_call_id: y,
            content: F
          });
          continue;
        }
        const M = await b.function(x, this), $ = S(this, we, "m", ud).call(this, M);
        if (this._addMessage({
          role: o,
          tool_call_id: y,
          content: $
        }), u) return;
      }
    }
  }
};
we = /* @__PURE__ */ new WeakSet(), ki = function() {
  return S(this, we, "m", cs).call(this).content ?? null;
}, cs = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (as(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new O("stream ended without producing a ChatCompletionMessage with role=assistant");
}, Li = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (as(n) && n?.tool_calls?.length) return n.tool_calls.filter((o) => o.type === "function").at(-1)?.function;
  }
}, Di = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (rd(n) && n.content != null && typeof n.content == "string" && this.messages.some((o) => o.role === "assistant" && o.tool_calls?.some((s) => s.type === "function" && s.id === n.tool_call_id))) return n.content;
  }
}, $i = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, ld = function(t) {
  if (t.n != null && t.n > 1) throw new O("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, ud = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var Fm = class dd extends cd {
  static runTools(t, n, o) {
    const s = new dd(), i = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return s._run(() => s._runTools(t, n, i)), s;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), as(t) && t.content && this._emit("content", t.content);
  }
}, Bm = 1, fd = 2, pd = 4, hd = 8, Gm = 16, Om = 32, qm = 64, md = 128, gd = 256, Vm = md | gd, Hm = 496, $a = fd | 497, Ua = pd | hd, pe = {
  STR: Bm,
  NUM: fd,
  ARR: pd,
  OBJ: hd,
  NULL: Gm,
  BOOL: Om,
  NAN: qm,
  INFINITY: md,
  MINUS_INFINITY: gd,
  INF: Vm,
  SPECIAL: Hm,
  ATOM: $a,
  COLLECTION: Ua,
  ALL: $a | Ua
}, Jm = class extends Error {
}, Wm = class extends Error {
};
function Km(e, t = pe.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return zm(e.trim(), t);
}
var zm = (e, t) => {
  const n = e.length;
  let o = 0;
  const s = (h) => {
    throw new Jm(`${h} at position ${o}`);
  }, i = (h) => {
    throw new Wm(`${h} at position ${o}`);
  }, a = () => (f(), o >= n && s("Unexpected end of input"), e[o] === '"' ? u() : e[o] === "{" ? c() : e[o] === "[" ? d() : e.substring(o, o + 4) === "null" || pe.NULL & t && n - o < 4 && "null".startsWith(e.substring(o)) ? (o += 4, null) : e.substring(o, o + 4) === "true" || pe.BOOL & t && n - o < 4 && "true".startsWith(e.substring(o)) ? (o += 4, !0) : e.substring(o, o + 5) === "false" || pe.BOOL & t && n - o < 5 && "false".startsWith(e.substring(o)) ? (o += 5, !1) : e.substring(o, o + 8) === "Infinity" || pe.INFINITY & t && n - o < 8 && "Infinity".startsWith(e.substring(o)) ? (o += 8, 1 / 0) : e.substring(o, o + 9) === "-Infinity" || pe.MINUS_INFINITY & t && 1 < n - o && n - o < 9 && "-Infinity".startsWith(e.substring(o)) ? (o += 9, -1 / 0) : e.substring(o, o + 3) === "NaN" || pe.NAN & t && n - o < 3 && "NaN".startsWith(e.substring(o)) ? (o += 3, NaN) : p()), u = () => {
    const h = o;
    let m = !1;
    for (o++; o < n && (e[o] !== '"' || m && e[o - 1] === "\\"); )
      m = e[o] === "\\" ? !m : !1, o++;
    if (e.charAt(o) == '"') try {
      return JSON.parse(e.substring(h, ++o - Number(m)));
    } catch (g) {
      i(String(g));
    }
    else if (pe.STR & t) try {
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
        if (f(), o >= n && pe.OBJ & t) return h;
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
          if (pe.OBJ & t) return h;
          throw g;
        }
        f(), e[o] === "," && o++;
      }
    } catch {
      if (pe.OBJ & t) return h;
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
      if (pe.ARR & t) return h;
      s("Expected ']' at end of array");
    }
    return o++, h;
  }, p = () => {
    if (o === 0) {
      e === "-" && pe.NUM & t && s("Not sure what '-' is");
      try {
        return JSON.parse(e);
      } catch (m) {
        if (pe.NUM & t) try {
          return e[e.length - 1] === "." ? JSON.parse(e.substring(0, e.lastIndexOf("."))) : JSON.parse(e.substring(0, e.lastIndexOf("e")));
        } catch {
        }
        i(String(m));
      }
    }
    const h = o;
    for (e[o] === "-" && o++; e[o] && !",]}".includes(e[o]); ) o++;
    o == n && !(pe.NUM & t) && s("Unterminated number literal");
    try {
      return JSON.parse(e.substring(h, o));
    } catch {
      e.substring(h, o) === "-" && pe.NUM & t && s("Not sure what '-' is");
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
}, Fa = (e) => Km(e, pe.ALL ^ pe.NUM), le, st, Ft, pt, Zs, yo, js, ei, ti, _o, ni, Ba, yd = class Ui extends cd {
  constructor(t) {
    super(), le.add(this), st.set(this, void 0), Ft.set(this, void 0), pt.set(this, void 0), q(this, st, t, "f"), q(this, Ft, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return S(this, pt, "f");
  }
  static fromReadableStream(t) {
    const n = new Ui(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createChatCompletion(t, n, o) {
    const s = new Ui(n);
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
    s && (s.aborted && this.controller.abort(), s.addEventListener("abort", () => this.controller.abort())), S(this, le, "m", Zs).call(this);
    const i = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const a of i) S(this, le, "m", js).call(this, a);
    if (i.controller.signal?.aborted) throw new Fe();
    return this._addChatCompletion(S(this, le, "m", _o).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), S(this, le, "m", Zs).call(this), this._connected();
    const s = Xn.fromReadableStream(t, this.controller);
    let i;
    for await (const a of s)
      i && i !== a.id && this._addChatCompletion(S(this, le, "m", _o).call(this)), S(this, le, "m", js).call(this, a), i = a.id;
    if (s.controller.signal?.aborted) throw new Fe();
    return this._addChatCompletion(S(this, le, "m", _o).call(this));
  }
  [(st = /* @__PURE__ */ new WeakMap(), Ft = /* @__PURE__ */ new WeakMap(), pt = /* @__PURE__ */ new WeakMap(), le = /* @__PURE__ */ new WeakSet(), Zs = function() {
    this.ended || q(this, pt, void 0, "f");
  }, yo = function(n) {
    let o = S(this, Ft, "f")[n.index];
    return o || (o = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, S(this, Ft, "f")[n.index] = o, o);
  }, js = function(n) {
    if (this.ended) return;
    const o = S(this, le, "m", Ba).call(this, n);
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
      const a = S(this, le, "m", yo).call(this, i);
      i.finish_reason && (S(this, le, "m", ti).call(this, i), a.current_tool_call_index != null && S(this, le, "m", ei).call(this, i, a.current_tool_call_index));
      for (const u of s.delta.tool_calls ?? [])
        a.current_tool_call_index !== u.index && (S(this, le, "m", ti).call(this, i), a.current_tool_call_index != null && S(this, le, "m", ei).call(this, i, a.current_tool_call_index)), a.current_tool_call_index = u.index;
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
  }, ei = function(n, o) {
    if (S(this, le, "m", yo).call(this, n).done_tool_calls.has(o)) return;
    const s = n.message.tool_calls?.[o];
    if (!s) throw new Error("no tool call snapshot");
    if (!s.type) throw new Error("tool call snapshot missing `type`");
    if (s.type === "function") {
      const i = S(this, st, "f")?.tools?.find((a) => rs(a) && a.function.name === s.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: s.function.name,
        index: o,
        arguments: s.function.arguments,
        parsed_arguments: oo(i) ? i.$parseRaw(s.function.arguments) : i?.function.strict ? JSON.parse(s.function.arguments) : null
      });
    } else s.type;
  }, ti = function(n) {
    const o = S(this, le, "m", yo).call(this, n);
    if (n.message.content && !o.content_done) {
      o.content_done = !0;
      const s = S(this, le, "m", ni).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: s ? s.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !o.refusal_done && (o.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !o.logprobs_content_done && (o.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !o.logprobs_refusal_done && (o.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, _o = function() {
    if (this.ended) throw new O("stream has ended, this shouldn't happen");
    const n = S(this, pt, "f");
    if (!n) throw new O("request ended without sending any chunks");
    return q(this, pt, void 0, "f"), q(this, Ft, [], "f"), Ym(n, S(this, st, "f"));
  }, ni = function() {
    const n = S(this, st, "f")?.response_format;
    return Ar(n) ? n : null;
  }, Ba = function(n) {
    var o, s, i, a;
    let u = S(this, pt, "f");
    const { choices: c, ...d } = n;
    u ? Object.assign(u, d) : u = q(this, pt, {
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
        const { content: T, refusal: F, ...P } = m;
        Object.assign(y.logprobs, P), T && ((o = y.logprobs).content ?? (o.content = []), y.logprobs.content.push(...T)), F && ((s = y.logprobs).refusal ?? (s.refusal = []), y.logprobs.refusal.push(...F));
      }
      if (f && (y.finish_reason = f, S(this, st, "f") && sd(S(this, st, "f")))) {
        if (f === "length") throw new Dc();
        if (f === "content_filter") throw new $c();
      }
      if (Object.assign(y, g), !p) continue;
      const { content: _, refusal: C, function_call: b, role: x, tool_calls: M, ...$ } = p;
      if (Object.assign(y.message, $), C && (y.message.refusal = (y.message.refusal || "") + C), x && (y.message.role = x), b && (y.message.function_call ? (b.name && (y.message.function_call.name = b.name), b.arguments && ((i = y.message.function_call).arguments ?? (i.arguments = ""), y.message.function_call.arguments += b.arguments)) : y.message.function_call = b), _ && (y.message.content = (y.message.content || "") + _, !y.message.refusal && S(this, le, "m", ni).call(this) && (y.message.parsed = Fa(y.message.content))), M) {
        y.message.tool_calls || (y.message.tool_calls = []);
        for (const { index: T, id: F, type: P, function: D, ...W } of M) {
          const X = (a = y.message.tool_calls)[T] ?? (a[T] = {});
          Object.assign(X, W), F && (X.id = F), P && (X.type = P), D && (X.function ?? (X.function = {
            name: D.name ?? "",
            arguments: ""
          })), D?.name && (X.function.name = D.name), D?.arguments && (X.function.arguments += D.arguments, Lm(S(this, st, "f"), X) && (X.function.parsed_arguments = Fa(X.function.arguments)));
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
    return new Xn(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
function Ym(e, t) {
  const { id: n, choices: o, created: s, model: i, system_fingerprint: a, ...u } = e;
  return Mm({
    ...u,
    id: n,
    choices: o.map(({ message: c, finish_reason: d, index: p, logprobs: f, ...h }) => {
      if (!d) throw new O(`missing finish_reason for choice ${p}`);
      const { content: m = null, function_call: g, tool_calls: y, ..._ } = c, C = c.role;
      if (!C) throw new O(`missing role for choice ${p}`);
      if (g) {
        const { arguments: b, name: x } = g;
        if (b == null) throw new O(`missing function_call.arguments for choice ${p}`);
        if (!x) throw new O(`missing function_call.name for choice ${p}`);
        return {
          ...h,
          message: {
            content: m,
            function_call: {
              arguments: b,
              name: x
            },
            role: C,
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
          role: C,
          content: m,
          refusal: c.refusal ?? null,
          tool_calls: y.map((b, x) => {
            const { function: M, type: $, id: T, ...F } = b, { arguments: P, name: D, ...W } = M || {};
            if (T == null) throw new O(`missing choices[${p}].tool_calls[${x}].id
${vo(e)}`);
            if ($ == null) throw new O(`missing choices[${p}].tool_calls[${x}].type
${vo(e)}`);
            if (D == null) throw new O(`missing choices[${p}].tool_calls[${x}].function.name
${vo(e)}`);
            if (P == null) throw new O(`missing choices[${p}].tool_calls[${x}].function.arguments
${vo(e)}`);
            return {
              ...F,
              id: T,
              type: $,
              function: {
                ...W,
                name: D,
                arguments: P
              }
            };
          })
        }
      } : {
        ...h,
        message: {
          ..._,
          content: m,
          role: C,
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
function vo(e) {
  return JSON.stringify(e);
}
var Xm = class Fi extends yd {
  static fromReadableStream(t) {
    const n = new Fi(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static runTools(t, n, o) {
    const s = new Fi(n), i = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return s._run(() => s._runTools(t, n, i)), s;
  }
}, Ir = class extends G {
  constructor() {
    super(...arguments), this.messages = new od(this._client);
  }
  create(e, t) {
    return this._client.post("/chat/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    });
  }
  retrieve(e, t) {
    return this._client.get(I`/chat/completions/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(I`/chat/completions/${e}`, {
      body: t,
      ...n
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chat/completions", re, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(I`/chat/completions/${e}`, t);
  }
  parse(e, t) {
    return Dm(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => br(n, e));
  }
  runTools(e, t) {
    return e.stream ? Xm.runTools(this._client, e, t) : Fm.runTools(this._client, e, t);
  }
  stream(e, t) {
    return yd.createChatCompletion(this._client, e, t);
  }
};
Ir.Messages = od;
var xr = class extends G {
  constructor() {
    super(...arguments), this.completions = new Ir(this._client);
  }
};
xr.Completions = Ir;
var _d = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* Qm(e) {
  if (!e) return;
  if (_d in e) {
    const { values: o, nulls: s } = e;
    yield* o.entries();
    for (const i of s) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Sa(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const s = o[0];
    if (typeof s != "string") throw new TypeError("expected header name to be a string");
    const i = Sa(o[1]) ? o[1] : [o[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [s, null]), yield [s, u]);
  }
}
var B = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const s = /* @__PURE__ */ new Set();
    for (const [i, a] of Qm(o)) {
      const u = i.toLowerCase();
      s.has(u) || (t.delete(i), s.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [_d]: !0,
    values: t,
    nulls: n
  };
}, vd = class extends G {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: B([{ Accept: "application/octet-stream" }, t?.headers]),
      __binaryResponse: !0
    });
  }
}, Sd = class extends G {
  create(e, t) {
    return this._client.post("/audio/transcriptions", tt({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model }
    }, this._client));
  }
}, Ed = class extends G {
  create(e, t) {
    return this._client.post("/audio/translations", tt({
      body: e,
      ...t,
      __metadata: { model: e.model }
    }, this._client));
  }
}, so = class extends G {
  constructor() {
    super(...arguments), this.transcriptions = new Sd(this._client), this.translations = new Ed(this._client), this.speech = new vd(this._client);
  }
};
so.Transcriptions = Sd;
so.Translations = Ed;
so.Speech = vd;
var Td = class extends G {
  create(e, t) {
    return this._client.post("/batches", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(I`/batches/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/batches", re, {
      query: e,
      ...t
    });
  }
  cancel(e, t) {
    return this._client.post(I`/batches/${e}/cancel`, t);
  }
}, wd = class extends G {
  create(e, t) {
    return this._client.post("/assistants", {
      body: e,
      ...t,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  retrieve(e, t) {
    return this._client.get(I`/assistants/${e}`, {
      ...t,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  update(e, t, n) {
    return this._client.post(I`/assistants/${e}`, {
      body: t,
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/assistants", re, {
      query: e,
      ...t,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(I`/assistants/${e}`, {
      ...t,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, Ad = class extends G {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, bd = class extends G {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, Is = class extends G {
  constructor() {
    super(...arguments), this.sessions = new Ad(this._client), this.transcriptionSessions = new bd(this._client);
  }
};
Is.Sessions = Ad;
Is.TranscriptionSessions = bd;
var Cd = class extends G {
  create(e, t) {
    return this._client.post("/chatkit/sessions", {
      body: e,
      ...t,
      headers: B([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  cancel(e, t) {
    return this._client.post(I`/chatkit/sessions/${e}/cancel`, {
      ...t,
      headers: B([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
}, Id = class extends G {
  retrieve(e, t) {
    return this._client.get(I`/chatkit/threads/${e}`, {
      ...t,
      headers: B([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chatkit/threads", Qn, {
      query: e,
      ...t,
      headers: B([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(I`/chatkit/threads/${e}`, {
      ...t,
      headers: B([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  listItems(e, t = {}, n) {
    return this._client.getAPIList(I`/chatkit/threads/${e}/items`, Qn, {
      query: t,
      ...n,
      headers: B([{ "OpenAI-Beta": "chatkit_beta=v1" }, n?.headers])
    });
  }
}, xs = class extends G {
  constructor() {
    super(...arguments), this.sessions = new Cd(this._client), this.threads = new Id(this._client);
  }
};
xs.Sessions = Cd;
xs.Threads = Id;
var xd = class extends G {
  create(e, t, n) {
    return this._client.post(I`/threads/${e}/messages`, {
      body: t,
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { thread_id: o } = t;
    return this._client.get(I`/threads/${o}/messages/${e}`, {
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  update(e, t, n) {
    const { thread_id: o, ...s } = t;
    return this._client.post(I`/threads/${o}/messages/${e}`, {
      body: s,
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(I`/threads/${e}/messages`, re, {
      query: t,
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { thread_id: o } = t;
    return this._client.delete(I`/threads/${o}/messages/${e}`, {
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, Rd = class extends G {
  retrieve(e, t, n) {
    const { thread_id: o, run_id: s, ...i } = t;
    return this._client.get(I`/threads/${o}/runs/${s}/steps/${e}`, {
      query: i,
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t, n) {
    const { thread_id: o, ...s } = t;
    return this._client.getAPIList(I`/threads/${o}/runs/${e}/steps`, re, {
      query: s,
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, Zm = (e) => {
  if (typeof Buffer < "u") {
    const t = Buffer.from(e, "base64");
    return Array.from(new Float32Array(t.buffer, t.byteOffset, t.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const t = atob(e), n = t.length, o = new Uint8Array(n);
    for (let s = 0; s < n; s++) o[s] = t.charCodeAt(s);
    return Array.from(new Float32Array(o.buffer));
  }
}, Bt = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() ?? void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim();
}, _e, Nt, Bi, et, Ko, Ve, kt, Yt, Mt, ds, Le, zo, Yo, Wn, Fn, Bn, Ga, Oa, qa, Va, Ha, Ja, Wa, Kn = class extends Cr {
  constructor() {
    super(...arguments), _e.add(this), Bi.set(this, []), et.set(this, {}), Ko.set(this, {}), Ve.set(this, void 0), kt.set(this, void 0), Yt.set(this, void 0), Mt.set(this, void 0), ds.set(this, void 0), Le.set(this, void 0), zo.set(this, void 0), Yo.set(this, void 0), Wn.set(this, void 0);
  }
  [(Bi = /* @__PURE__ */ new WeakMap(), et = /* @__PURE__ */ new WeakMap(), Ko = /* @__PURE__ */ new WeakMap(), Ve = /* @__PURE__ */ new WeakMap(), kt = /* @__PURE__ */ new WeakMap(), Yt = /* @__PURE__ */ new WeakMap(), Mt = /* @__PURE__ */ new WeakMap(), ds = /* @__PURE__ */ new WeakMap(), Le = /* @__PURE__ */ new WeakMap(), zo = /* @__PURE__ */ new WeakMap(), Yo = /* @__PURE__ */ new WeakMap(), Wn = /* @__PURE__ */ new WeakMap(), _e = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
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
    const t = new Nt();
    return t._run(() => t._fromReadableStream(e)), t;
  }
  async _fromReadableStream(e, t) {
    const n = t?.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const o = Xn.fromReadableStream(e, this.controller);
    for await (const s of o) S(this, _e, "m", Fn).call(this, s);
    if (o.controller.signal?.aborted) throw new Fe();
    return this._addRun(S(this, _e, "m", Bn).call(this));
  }
  toReadableStream() {
    return new Xn(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, t, n, o) {
    const s = new Nt();
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
    for await (const u of a) S(this, _e, "m", Fn).call(this, u);
    if (a.controller.signal?.aborted) throw new Fe();
    return this._addRun(S(this, _e, "m", Bn).call(this));
  }
  static createThreadAssistantStream(e, t, n) {
    const o = new Nt();
    return o._run(() => o._threadAssistantStream(e, t, {
      ...n,
      headers: {
        ...n?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  static createAssistantStream(e, t, n, o) {
    const s = new Nt();
    return s._run(() => s._runAssistantStream(e, t, n, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), s;
  }
  currentEvent() {
    return S(this, zo, "f");
  }
  currentRun() {
    return S(this, Yo, "f");
  }
  currentMessageSnapshot() {
    return S(this, Ve, "f");
  }
  currentRunStepSnapshot() {
    return S(this, Wn, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(S(this, et, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(S(this, Ko, "f"));
  }
  async finalRun() {
    if (await this.done(), !S(this, kt, "f")) throw Error("Final run was not received.");
    return S(this, kt, "f");
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
    for await (const a of i) S(this, _e, "m", Fn).call(this, a);
    if (i.controller.signal?.aborted) throw new Fe();
    return this._addRun(S(this, _e, "m", Bn).call(this));
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
    for await (const u of a) S(this, _e, "m", Fn).call(this, u);
    if (a.controller.signal?.aborted) throw new Fe();
    return this._addRun(S(this, _e, "m", Bn).call(this));
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
      else if (Ys(s) && Ys(o)) s = this.accumulateDelta(s, o);
      else if (Array.isArray(s) && Array.isArray(o)) {
        if (s.every((i) => typeof i == "string" || typeof i == "number")) {
          s.push(...o);
          continue;
        }
        for (const i of o) {
          if (!Ys(i)) throw new Error(`Expected array delta entry to be an object but got: ${i}`);
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
Nt = Kn, Fn = function(t) {
  if (!this.ended)
    switch (q(this, zo, t, "f"), S(this, _e, "m", qa).call(this, t), t.event) {
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
        S(this, _e, "m", Wa).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        S(this, _e, "m", Oa).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        S(this, _e, "m", Ga).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, Bn = function() {
  if (this.ended) throw new O("stream has ended, this shouldn't happen");
  if (!S(this, kt, "f")) throw Error("Final run has not been received");
  return S(this, kt, "f");
}, Ga = function(t) {
  const [n, o] = S(this, _e, "m", Ha).call(this, t, S(this, Ve, "f"));
  q(this, Ve, n, "f"), S(this, Ko, "f")[n.id] = n;
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
        if (s.index != S(this, Yt, "f")) {
          if (S(this, Mt, "f")) switch (S(this, Mt, "f").type) {
            case "text":
              this._emit("textDone", S(this, Mt, "f").text, S(this, Ve, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", S(this, Mt, "f").image_file, S(this, Ve, "f"));
              break;
          }
          q(this, Yt, s.index, "f");
        }
        q(this, Mt, n.content[s.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (S(this, Yt, "f") !== void 0) {
        const s = t.data.content[S(this, Yt, "f")];
        if (s) switch (s.type) {
          case "image_file":
            this._emit("imageFileDone", s.image_file, S(this, Ve, "f"));
            break;
          case "text":
            this._emit("textDone", s.text, S(this, Ve, "f"));
            break;
        }
      }
      S(this, Ve, "f") && this._emit("messageDone", t.data), q(this, Ve, void 0, "f");
  }
}, Oa = function(t) {
  const n = S(this, _e, "m", Va).call(this, t);
  switch (q(this, Wn, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const o = t.data.delta;
      if (o.step_details && o.step_details.type == "tool_calls" && o.step_details.tool_calls && n.step_details.type == "tool_calls") for (const s of o.step_details.tool_calls) s.index == S(this, ds, "f") ? this._emit("toolCallDelta", s, n.step_details.tool_calls[s.index]) : (S(this, Le, "f") && this._emit("toolCallDone", S(this, Le, "f")), q(this, ds, s.index, "f"), q(this, Le, n.step_details.tool_calls[s.index], "f"), S(this, Le, "f") && this._emit("toolCallCreated", S(this, Le, "f")));
      this._emit("runStepDelta", t.data.delta, n);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      q(this, Wn, void 0, "f"), t.data.step_details.type == "tool_calls" && S(this, Le, "f") && (this._emit("toolCallDone", S(this, Le, "f")), q(this, Le, void 0, "f")), this._emit("runStepDone", t.data, n);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, qa = function(t) {
  S(this, Bi, "f").push(t), this._emit("event", t);
}, Va = function(t) {
  switch (t.event) {
    case "thread.run.step.created":
      return S(this, et, "f")[t.data.id] = t.data, t.data;
    case "thread.run.step.delta":
      let n = S(this, et, "f")[t.data.id];
      if (!n) throw Error("Received a RunStepDelta before creation of a snapshot");
      let o = t.data;
      if (o.delta) {
        const s = Nt.accumulateDelta(n, o.delta);
        S(this, et, "f")[t.data.id] = s;
      }
      return S(this, et, "f")[t.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      S(this, et, "f")[t.data.id] = t.data;
      break;
  }
  if (S(this, et, "f")[t.data.id]) return S(this, et, "f")[t.data.id];
  throw new Error("No snapshot available");
}, Ha = function(t, n) {
  let o = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, o];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let s = t.data;
      if (s.delta.content) for (const i of s.delta.content) if (i.index in n.content) {
        let a = n.content[i.index];
        n.content[i.index] = S(this, _e, "m", Ja).call(this, i, a);
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
}, Ja = function(t, n) {
  return Nt.accumulateDelta(n, t);
}, Wa = function(t) {
  switch (q(this, Yo, t.data, "f"), t.event) {
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
      q(this, kt, t.data, "f"), S(this, Le, "f") && (this._emit("toolCallDone", S(this, Le, "f")), q(this, Le, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var Rr = class extends G {
  constructor() {
    super(...arguments), this.steps = new Rd(this._client);
  }
  create(e, t, n) {
    const { include: o, ...s } = t;
    return this._client.post(I`/threads/${e}/runs`, {
      query: { include: o },
      body: s,
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0
    });
  }
  retrieve(e, t, n) {
    const { thread_id: o } = t;
    return this._client.get(I`/threads/${o}/runs/${e}`, {
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  update(e, t, n) {
    const { thread_id: o, ...s } = t;
    return this._client.post(I`/threads/${o}/runs/${e}`, {
      body: s,
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(I`/threads/${e}/runs`, re, {
      query: t,
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  cancel(e, t, n) {
    const { thread_id: o } = t;
    return this._client.post(I`/threads/${o}/runs/${e}/cancel`, {
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t, n);
    return await this.poll(o.id, { thread_id: e }, n);
  }
  createAndStream(e, t, n) {
    return Kn.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  async poll(e, t, n) {
    const o = B([n?.headers, {
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
          await no(a);
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
    return Kn.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  submitToolOutputs(e, t, n) {
    const { thread_id: o, ...s } = t;
    return this._client.post(I`/threads/${o}/runs/${e}/submit_tool_outputs`, {
      body: s,
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0
    });
  }
  async submitToolOutputsAndPoll(e, t, n) {
    const o = await this.submitToolOutputs(e, t, n);
    return await this.poll(o.id, t, n);
  }
  submitToolOutputsStream(e, t, n) {
    return Kn.createToolAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
};
Rr.Steps = Rd;
var Rs = class extends G {
  constructor() {
    super(...arguments), this.runs = new Rr(this._client), this.messages = new xd(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/threads", {
      body: e,
      ...t,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  retrieve(e, t) {
    return this._client.get(I`/threads/${e}`, {
      ...t,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  update(e, t, n) {
    return this._client.post(I`/threads/${e}`, {
      body: t,
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(I`/threads/${e}`, {
      ...t,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  createAndRun(e, t) {
    return this._client.post("/threads/runs", {
      body: e,
      ...t,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      stream: e.stream ?? !1,
      __synthesizeEventData: !0
    });
  }
  async createAndRunPoll(e, t) {
    const n = await this.createAndRun(e, t);
    return await this.runs.poll(n.id, { thread_id: n.thread_id }, t);
  }
  createAndRunStream(e, t) {
    return Kn.createThreadAssistantStream(e, this._client.beta.threads, t);
  }
};
Rs.Runs = Rr;
Rs.Messages = xd;
var tn = class extends G {
  constructor() {
    super(...arguments), this.realtime = new Is(this._client), this.chatkit = new xs(this._client), this.assistants = new wd(this._client), this.threads = new Rs(this._client);
  }
};
tn.Realtime = Is;
tn.ChatKit = xs;
tn.Assistants = wd;
tn.Threads = Rs;
var Pd = class extends G {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    });
  }
}, Md = class extends G {
  retrieve(e, t, n) {
    const { container_id: o } = t;
    return this._client.get(I`/containers/${o}/files/${e}/content`, {
      ...n,
      headers: B([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
}, Pr = class extends G {
  constructor() {
    super(...arguments), this.content = new Md(this._client);
  }
  create(e, t, n) {
    return this._client.post(I`/containers/${e}/files`, Cs({
      body: t,
      ...n
    }, this._client));
  }
  retrieve(e, t, n) {
    const { container_id: o } = t;
    return this._client.get(I`/containers/${o}/files/${e}`, n);
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(I`/containers/${e}/files`, re, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { container_id: o } = t;
    return this._client.delete(I`/containers/${o}/files/${e}`, {
      ...n,
      headers: B([{ Accept: "*/*" }, n?.headers])
    });
  }
};
Pr.Content = Md;
var Mr = class extends G {
  constructor() {
    super(...arguments), this.files = new Pr(this._client);
  }
  create(e, t) {
    return this._client.post("/containers", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(I`/containers/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/containers", re, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(I`/containers/${e}`, {
      ...t,
      headers: B([{ Accept: "*/*" }, t?.headers])
    });
  }
};
Mr.Files = Pr;
var Nd = class extends G {
  create(e, t, n) {
    const { include: o, ...s } = t;
    return this._client.post(I`/conversations/${e}/items`, {
      query: { include: o },
      body: s,
      ...n
    });
  }
  retrieve(e, t, n) {
    const { conversation_id: o, ...s } = t;
    return this._client.get(I`/conversations/${o}/items/${e}`, {
      query: s,
      ...n
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(I`/conversations/${e}/items`, Qn, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { conversation_id: o } = t;
    return this._client.delete(I`/conversations/${o}/items/${e}`, n);
  }
}, Nr = class extends G {
  constructor() {
    super(...arguments), this.items = new Nd(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/conversations", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(I`/conversations/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(I`/conversations/${e}`, {
      body: t,
      ...n
    });
  }
  delete(e, t) {
    return this._client.delete(I`/conversations/${e}`, t);
  }
};
Nr.Items = Nd;
var kd = class extends G {
  create(e, t) {
    const n = !!e.encoding_format;
    let o = n ? e.encoding_format : "base64";
    n && ye(this._client).debug("embeddings/user defined encoding_format:", e.encoding_format);
    const s = this._client.post("/embeddings", {
      body: {
        ...e,
        encoding_format: o
      },
      ...t
    });
    return n ? s : (ye(this._client).debug("embeddings/decoding base64 embeddings from base64"), s._thenUnwrap((i) => (i && i.data && i.data.forEach((a) => {
      const u = a.embedding;
      a.embedding = Zm(u);
    }), i)));
  }
}, Ld = class extends G {
  retrieve(e, t, n) {
    const { eval_id: o, run_id: s } = t;
    return this._client.get(I`/evals/${o}/runs/${s}/output_items/${e}`, n);
  }
  list(e, t, n) {
    const { eval_id: o, ...s } = t;
    return this._client.getAPIList(I`/evals/${o}/runs/${e}/output_items`, re, {
      query: s,
      ...n
    });
  }
}, kr = class extends G {
  constructor() {
    super(...arguments), this.outputItems = new Ld(this._client);
  }
  create(e, t, n) {
    return this._client.post(I`/evals/${e}/runs`, {
      body: t,
      ...n
    });
  }
  retrieve(e, t, n) {
    const { eval_id: o } = t;
    return this._client.get(I`/evals/${o}/runs/${e}`, n);
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(I`/evals/${e}/runs`, re, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { eval_id: o } = t;
    return this._client.delete(I`/evals/${o}/runs/${e}`, n);
  }
  cancel(e, t, n) {
    const { eval_id: o } = t;
    return this._client.post(I`/evals/${o}/runs/${e}`, n);
  }
};
kr.OutputItems = Ld;
var Lr = class extends G {
  constructor() {
    super(...arguments), this.runs = new kr(this._client);
  }
  create(e, t) {
    return this._client.post("/evals", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(I`/evals/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(I`/evals/${e}`, {
      body: t,
      ...n
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/evals", re, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(I`/evals/${e}`, t);
  }
};
Lr.Runs = kr;
var Dd = class extends G {
  create(e, t) {
    return this._client.post("/files", tt({
      body: e,
      ...t
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(I`/files/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/files", re, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(I`/files/${e}`, t);
  }
  content(e, t) {
    return this._client.get(I`/files/${e}/content`, {
      ...t,
      headers: B([{ Accept: "application/binary" }, t?.headers]),
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
      if (await no(t), i = await this.retrieve(e), Date.now() - s > n) throw new Sr({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return i;
  }
}, $d = class extends G {
}, Ud = class extends G {
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
}, Dr = class extends G {
  constructor() {
    super(...arguments), this.graders = new Ud(this._client);
  }
};
Dr.Graders = Ud;
var Fd = class extends G {
  create(e, t, n) {
    return this._client.getAPIList(I`/fine_tuning/checkpoints/${e}/permissions`, bs, {
      body: t,
      method: "post",
      ...n
    });
  }
  retrieve(e, t = {}, n) {
    return this._client.get(I`/fine_tuning/checkpoints/${e}/permissions`, {
      query: t,
      ...n
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(I`/fine_tuning/checkpoints/${e}/permissions`, Qn, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { fine_tuned_model_checkpoint: o } = t;
    return this._client.delete(I`/fine_tuning/checkpoints/${o}/permissions/${e}`, n);
  }
}, $r = class extends G {
  constructor() {
    super(...arguments), this.permissions = new Fd(this._client);
  }
};
$r.Permissions = Fd;
var Bd = class extends G {
  list(e, t = {}, n) {
    return this._client.getAPIList(I`/fine_tuning/jobs/${e}/checkpoints`, re, {
      query: t,
      ...n
    });
  }
}, Ur = class extends G {
  constructor() {
    super(...arguments), this.checkpoints = new Bd(this._client);
  }
  create(e, t) {
    return this._client.post("/fine_tuning/jobs", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(I`/fine_tuning/jobs/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/fine_tuning/jobs", re, {
      query: e,
      ...t
    });
  }
  cancel(e, t) {
    return this._client.post(I`/fine_tuning/jobs/${e}/cancel`, t);
  }
  listEvents(e, t = {}, n) {
    return this._client.getAPIList(I`/fine_tuning/jobs/${e}/events`, re, {
      query: t,
      ...n
    });
  }
  pause(e, t) {
    return this._client.post(I`/fine_tuning/jobs/${e}/pause`, t);
  }
  resume(e, t) {
    return this._client.post(I`/fine_tuning/jobs/${e}/resume`, t);
  }
};
Ur.Checkpoints = Bd;
var nn = class extends G {
  constructor() {
    super(...arguments), this.methods = new $d(this._client), this.jobs = new Ur(this._client), this.checkpoints = new $r(this._client), this.alpha = new Dr(this._client);
  }
};
nn.Methods = $d;
nn.Jobs = Ur;
nn.Checkpoints = $r;
nn.Alpha = Dr;
var Gd = class extends G {
}, Fr = class extends G {
  constructor() {
    super(...arguments), this.graderModels = new Gd(this._client);
  }
};
Fr.GraderModels = Gd;
var Od = class extends G {
  createVariation(e, t) {
    return this._client.post("/images/variations", tt({
      body: e,
      ...t
    }, this._client));
  }
  edit(e, t) {
    return this._client.post("/images/edits", tt({
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
}, qd = class extends G {
  retrieve(e, t) {
    return this._client.get(I`/models/${e}`, t);
  }
  list(e) {
    return this._client.getAPIList("/models", bs, e);
  }
  delete(e, t) {
    return this._client.delete(I`/models/${e}`, t);
  }
}, Vd = class extends G {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t
    });
  }
}, Hd = class extends G {
  accept(e, t, n) {
    return this._client.post(I`/realtime/calls/${e}/accept`, {
      body: t,
      ...n,
      headers: B([{ Accept: "*/*" }, n?.headers])
    });
  }
  hangup(e, t) {
    return this._client.post(I`/realtime/calls/${e}/hangup`, {
      ...t,
      headers: B([{ Accept: "*/*" }, t?.headers])
    });
  }
  refer(e, t, n) {
    return this._client.post(I`/realtime/calls/${e}/refer`, {
      body: t,
      ...n,
      headers: B([{ Accept: "*/*" }, n?.headers])
    });
  }
  reject(e, t = {}, n) {
    return this._client.post(I`/realtime/calls/${e}/reject`, {
      body: t,
      ...n,
      headers: B([{ Accept: "*/*" }, n?.headers])
    });
  }
}, Jd = class extends G {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t
    });
  }
}, Ps = class extends G {
  constructor() {
    super(...arguments), this.clientSecrets = new Jd(this._client), this.calls = new Hd(this._client);
  }
};
Ps.ClientSecrets = Jd;
Ps.Calls = Hd;
function jm(e, t) {
  return !t || !tg(t) ? {
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
  } : Wd(e, t);
}
function Wd(e, t) {
  const n = e.output.map((s) => {
    if (s.type === "function_call") return {
      ...s,
      parsed_arguments: sg(t, s)
    };
    if (s.type === "message") {
      const i = s.content.map((a) => a.type === "output_text" ? {
        ...a,
        parsed: eg(t, a.text)
      } : a);
      return {
        ...s,
        content: i
      };
    }
    return s;
  }), o = Object.assign({}, e, { output: n });
  return Object.getOwnPropertyDescriptor(e, "output_text") || Gi(o), Object.defineProperty(o, "output_parsed", {
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
function eg(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function tg(e) {
  return !!Ar(e.text?.format);
}
function ng(e) {
  return e?.$brand === "auto-parseable-tool";
}
function og(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function sg(e, t) {
  const n = og(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: ng(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function Gi(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const o of n.content) o.type === "output_text" && t.push(o.text);
  e.output_text = t.join("");
}
var Gt, So, ht, Eo, Ka, za, Ya, Xa, ig = class Kd extends Cr {
  constructor(t) {
    super(), Gt.add(this), So.set(this, void 0), ht.set(this, void 0), Eo.set(this, void 0), q(this, So, t, "f");
  }
  static createResponse(t, n, o) {
    const s = new Kd(n);
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
    s && (s.aborted && this.controller.abort(), s.addEventListener("abort", () => this.controller.abort())), S(this, Gt, "m", Ka).call(this);
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
    for await (const u of i) S(this, Gt, "m", za).call(this, u, a);
    if (i.controller.signal?.aborted) throw new Fe();
    return S(this, Gt, "m", Ya).call(this);
  }
  [(So = /* @__PURE__ */ new WeakMap(), ht = /* @__PURE__ */ new WeakMap(), Eo = /* @__PURE__ */ new WeakMap(), Gt = /* @__PURE__ */ new WeakSet(), Ka = function() {
    this.ended || q(this, ht, void 0, "f");
  }, za = function(n, o) {
    if (this.ended) return;
    const s = (a, u) => {
      (o == null || u.sequence_number > o) && this._emit(a, u);
    }, i = S(this, Gt, "m", Xa).call(this, n);
    switch (s("event", n), n.type) {
      case "response.output_text.delta": {
        const a = i.output[n.output_index];
        if (!a) throw new O(`missing output at index ${n.output_index}`);
        if (a.type === "message") {
          const u = a.content[n.content_index];
          if (!u) throw new O(`missing content at index ${n.content_index}`);
          if (u.type !== "output_text") throw new O(`expected content to be 'output_text', got ${u.type}`);
          s("response.output_text.delta", {
            ...n,
            snapshot: u.text
          });
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const a = i.output[n.output_index];
        if (!a) throw new O(`missing output at index ${n.output_index}`);
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
  }, Ya = function() {
    if (this.ended) throw new O("stream has ended, this shouldn't happen");
    const n = S(this, ht, "f");
    if (!n) throw new O("request ended without sending any events");
    q(this, ht, void 0, "f");
    const o = rg(n, S(this, So, "f"));
    return q(this, Eo, o, "f"), o;
  }, Xa = function(n) {
    let o = S(this, ht, "f");
    if (!o) {
      if (n.type !== "response.created") throw new O(`When snapshot hasn't been set yet, expected 'response.created' event, got ${n.type}`);
      return o = q(this, ht, n.response, "f"), o;
    }
    switch (n.type) {
      case "response.output_item.added":
        o.output.push(n.item);
        break;
      case "response.content_part.added": {
        const s = o.output[n.output_index];
        if (!s) throw new O(`missing output at index ${n.output_index}`);
        const i = s.type, a = n.part;
        i === "message" && a.type !== "reasoning_text" ? s.content.push(a) : i === "reasoning" && a.type === "reasoning_text" && (s.content || (s.content = []), s.content.push(a));
        break;
      }
      case "response.output_text.delta": {
        const s = o.output[n.output_index];
        if (!s) throw new O(`missing output at index ${n.output_index}`);
        if (s.type === "message") {
          const i = s.content[n.content_index];
          if (!i) throw new O(`missing content at index ${n.content_index}`);
          if (i.type !== "output_text") throw new O(`expected content to be 'output_text', got ${i.type}`);
          i.text += n.delta;
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const s = o.output[n.output_index];
        if (!s) throw new O(`missing output at index ${n.output_index}`);
        s.type === "function_call" && (s.arguments += n.delta);
        break;
      }
      case "response.reasoning_text.delta": {
        const s = o.output[n.output_index];
        if (!s) throw new O(`missing output at index ${n.output_index}`);
        if (s.type === "reasoning") {
          const i = s.content?.[n.content_index];
          if (!i) throw new O(`missing content at index ${n.content_index}`);
          if (i.type !== "reasoning_text") throw new O(`expected content to be 'reasoning_text', got ${i.type}`);
          i.text += n.delta;
        }
        break;
      }
      case "response.completed":
        q(this, ht, n.response, "f");
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
    const t = S(this, Eo, "f");
    if (!t) throw new O("stream ended without producing a ChatCompletion");
    return t;
  }
};
function rg(e, t) {
  return jm(e, t);
}
var zd = class extends G {
  list(e, t = {}, n) {
    return this._client.getAPIList(I`/responses/${e}/input_items`, re, {
      query: t,
      ...n
    });
  }
}, Yd = class extends G {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t
    });
  }
}, Ms = class extends G {
  constructor() {
    super(...arguments), this.inputItems = new zd(this._client), this.inputTokens = new Yd(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && Gi(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(I`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1
    })._thenUnwrap((o) => ("object" in o && o.object === "response" && Gi(o), o));
  }
  delete(e, t) {
    return this._client.delete(I`/responses/${e}`, {
      ...t,
      headers: B([{ Accept: "*/*" }, t?.headers])
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => Wd(n, e));
  }
  stream(e, t) {
    return ig.createResponse(this._client, e, t);
  }
  cancel(e, t) {
    return this._client.post(I`/responses/${e}/cancel`, t);
  }
  compact(e, t) {
    return this._client.post("/responses/compact", {
      body: e,
      ...t
    });
  }
};
Ms.InputItems = zd;
Ms.InputTokens = Yd;
var Xd = class extends G {
  retrieve(e, t) {
    return this._client.get(I`/skills/${e}/content`, {
      ...t,
      headers: B([{ Accept: "application/binary" }, t?.headers]),
      __binaryResponse: !0
    });
  }
}, Qd = class extends G {
  retrieve(e, t, n) {
    const { skill_id: o } = t;
    return this._client.get(I`/skills/${o}/versions/${e}/content`, {
      ...n,
      headers: B([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
}, Br = class extends G {
  constructor() {
    super(...arguments), this.content = new Qd(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(I`/skills/${e}/versions`, Cs({
      body: t,
      ...n
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: o } = t;
    return this._client.get(I`/skills/${o}/versions/${e}`, n);
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(I`/skills/${e}/versions`, re, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { skill_id: o } = t;
    return this._client.delete(I`/skills/${o}/versions/${e}`, n);
  }
};
Br.Content = Qd;
var Ns = class extends G {
  constructor() {
    super(...arguments), this.content = new Xd(this._client), this.versions = new Br(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", Cs({
      body: e,
      ...t
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(I`/skills/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(I`/skills/${e}`, {
      body: t,
      ...n
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/skills", re, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(I`/skills/${e}`, t);
  }
};
Ns.Content = Xd;
Ns.Versions = Br;
var Zd = class extends G {
  create(e, t, n) {
    return this._client.post(I`/uploads/${e}/parts`, tt({
      body: t,
      ...n
    }, this._client));
  }
}, Gr = class extends G {
  constructor() {
    super(...arguments), this.parts = new Zd(this._client);
  }
  create(e, t) {
    return this._client.post("/uploads", {
      body: e,
      ...t
    });
  }
  cancel(e, t) {
    return this._client.post(I`/uploads/${e}/cancel`, t);
  }
  complete(e, t, n) {
    return this._client.post(I`/uploads/${e}/complete`, {
      body: t,
      ...n
    });
  }
};
Gr.Parts = Zd;
var ag = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((s) => s.status === "rejected");
  if (n.length) {
    for (const s of n) console.error(s.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const o = [];
  for (const s of t) s.status === "fulfilled" && o.push(s.value);
  return o;
}, jd = class extends G {
  create(e, t, n) {
    return this._client.post(I`/vector_stores/${e}/file_batches`, {
      body: t,
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.get(I`/vector_stores/${o}/file_batches/${e}`, {
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  cancel(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.post(I`/vector_stores/${o}/file_batches/${e}/cancel`, {
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t);
    return await this.poll(e, o.id, n);
  }
  listFiles(e, t, n) {
    const { vector_store_id: o, ...s } = t;
    return this._client.getAPIList(I`/vector_stores/${o}/file_batches/${e}/files`, re, {
      query: s,
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async poll(e, t, n) {
    const o = B([n?.headers, {
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
          await no(a);
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
    return await ag(Array(i).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, ef = class extends G {
  create(e, t, n) {
    return this._client.post(I`/vector_stores/${e}/files`, {
      body: t,
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.get(I`/vector_stores/${o}/files/${e}`, {
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vector_store_id: o, ...s } = t;
    return this._client.post(I`/vector_stores/${o}/files/${e}`, {
      body: s,
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(I`/vector_stores/${e}/files`, re, {
      query: t,
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.delete(I`/vector_stores/${o}/files/${e}`, {
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t, n);
    return await this.poll(e, o.id, n);
  }
  async poll(e, t, n) {
    const o = B([n?.headers, {
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
          await no(a);
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
    return this._client.getAPIList(I`/vector_stores/${o}/files/${e}/content`, bs, {
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, ks = class extends G {
  constructor() {
    super(...arguments), this.files = new ef(this._client), this.fileBatches = new jd(this._client);
  }
  create(e, t) {
    return this._client.post("/vector_stores", {
      body: e,
      ...t,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  retrieve(e, t) {
    return this._client.get(I`/vector_stores/${e}`, {
      ...t,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  update(e, t, n) {
    return this._client.post(I`/vector_stores/${e}`, {
      body: t,
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/vector_stores", re, {
      query: e,
      ...t,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(I`/vector_stores/${e}`, {
      ...t,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  search(e, t, n) {
    return this._client.getAPIList(I`/vector_stores/${e}/search`, bs, {
      body: t,
      method: "post",
      ...n,
      headers: B([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
};
ks.Files = ef;
ks.FileBatches = jd;
var tf = class extends G {
  create(e, t) {
    return this._client.post("/videos", tt({
      body: e,
      ...t
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(I`/videos/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/videos", Qn, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(I`/videos/${e}`, t);
  }
  createCharacter(e, t) {
    return this._client.post("/videos/characters", tt({
      body: e,
      ...t
    }, this._client));
  }
  downloadContent(e, t = {}, n) {
    return this._client.get(I`/videos/${e}/content`, {
      query: t,
      ...n,
      headers: B([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
  edit(e, t) {
    return this._client.post("/videos/edits", tt({
      body: e,
      ...t
    }, this._client));
  }
  extend(e, t) {
    return this._client.post("/videos/extensions", tt({
      body: e,
      ...t
    }, this._client));
  }
  getCharacter(e, t) {
    return this._client.get(I`/videos/characters/${e}`, t);
  }
  remix(e, t, n) {
    return this._client.post(I`/videos/${e}/remix`, Cs({
      body: t,
      ...n
    }, this._client));
  }
}, Wt, nf, Xo, of = class extends G {
  constructor() {
    super(...arguments), Wt.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, o = 300) {
    return await this.verifySignature(e, t, n, o), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, o = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    S(this, Wt, "m", nf).call(this, n);
    const s = B([t]).values, i = S(this, Wt, "m", Xo).call(this, s, "webhook-signature"), a = S(this, Wt, "m", Xo).call(this, s, "webhook-timestamp"), u = S(this, Wt, "m", Xo).call(this, s, "webhook-id"), c = parseInt(a, 10);
    if (isNaN(c)) throw new Pn("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > o) throw new Pn("Webhook timestamp is too old");
    if (c > d + o) throw new Pn("Webhook timestamp is too new");
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
    throw new Pn("The given webhook signature does not match the expected signature");
  }
};
Wt = /* @__PURE__ */ new WeakSet(), nf = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, Xo = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const o = t.get(n);
  if (o == null) throw new Error(`Missing required header: ${n}`);
  return o;
};
var Oi, Or, Qo, sf, oi = "workload-identity-auth", z = class {
  constructor({ baseURL: e = Bt("OPENAI_BASE_URL"), apiKey: t = Bt("OPENAI_API_KEY"), organization: n = Bt("OPENAI_ORG_ID") ?? null, project: o = Bt("OPENAI_PROJECT_ID") ?? null, webhookSecret: s = Bt("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: i, ...a } = {}) {
    if (Oi.add(this), Qo.set(this, void 0), this.completions = new Pd(this), this.chat = new xr(this), this.embeddings = new kd(this), this.files = new Dd(this), this.images = new Od(this), this.audio = new so(this), this.moderations = new Vd(this), this.models = new qd(this), this.fineTuning = new nn(this), this.graders = new Fr(this), this.vectorStores = new ks(this), this.webhooks = new of(this), this.beta = new tn(this), this.batches = new Td(this), this.uploads = new Gr(this), this.responses = new Ms(this), this.realtime = new Ps(this), this.conversations = new Nr(this), this.evals = new Lr(this), this.containers = new Mr(this), this.skills = new Ns(this), this.videos = new tf(this), i) {
      if (t && t !== oi) throw new O("The `apiKey` and `workloadIdentity` arguments are mutually exclusive; only one can be passed at a time.");
      t = oi;
    } else if (t === void 0) throw new O("Missing credentials. Please pass an `apiKey`, `workloadIdentity`, or set the `OPENAI_API_KEY` environment variable.");
    const u = {
      apiKey: t,
      organization: n,
      project: o,
      webhookSecret: s,
      workloadIdentity: i,
      ...a,
      baseURL: e || "https://api.openai.com/v1"
    };
    if (!u.dangerouslyAllowBrowser && em()) throw new O(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = u.baseURL, this.timeout = u.timeout ?? Or.DEFAULT_TIMEOUT, this.logger = u.logger ?? console;
    const c = "warn";
    this.logLevel = c, this.logLevel = Na(u.logLevel, "ClientOptions.logLevel", this) ?? Na(Bt("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? c, this.fetchOptions = u.fetchOptions, this.maxRetries = u.maxRetries ?? 2, this.fetch = u.fetch ?? Bc(), q(this, Qo, im, "f"), this._options = u, i && (this._workloadIdentityAuth = new wm(i, this.fetch)), this.apiKey = typeof t == "string" ? t : "Missing Key", this.organization = n, this.project = o, this.webhookSecret = s;
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
    return B([{ Authorization: `Bearer ${this.apiKey}` }]);
  }
  stringifyQuery(e) {
    return dm(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Ht}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Cc()}`;
  }
  makeStatusError(e, t, n, o) {
    return Se.generate(e, t, n, o);
  }
  async _callApiKey() {
    const e = this._options.apiKey;
    if (typeof e != "function") return !1;
    let t;
    try {
      t = await e();
    } catch (n) {
      throw n instanceof O ? n : new O(`Failed to get token from 'apiKey' function: ${n.message}`, { cause: n });
    }
    if (typeof t != "string" || !t) throw new O(`Expected 'apiKey' function argument to return a string but it returned ${t}`);
    return this.apiKey = t, !0;
  }
  buildURL(e, t, n) {
    const o = !S(this, Oi, "m", sf).call(this) && n || this.baseURL, s = Xh(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), a = Object.fromEntries(s.searchParams);
    return (!Ea(i) || !Ea(a)) && (t = {
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
    return new Xc(this, this.makeRequest(e, t, void 0));
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
    if (ye(this).debug(`[${c}] sending request`, It({
      retryOfRequestLogID: n,
      method: o.method,
      url: a,
      options: o,
      headers: i.headers
    })), o.signal?.aborted) throw new Fe();
    const f = new AbortController(), h = await this.fetchWithAuth(a, i, u, f).catch(Ci), m = Date.now();
    if (h instanceof globalThis.Error) {
      const y = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new Fe();
      const _ = bi(h) || /timed? ?out/i.test(String(h) + ("cause" in h ? String(h.cause) : ""));
      if (t)
        return ye(this).info(`[${c}] connection ${_ ? "timed out" : "failed"} - ${y}`), ye(this).debug(`[${c}] connection ${_ ? "timed out" : "failed"} (${y})`, It({
          retryOfRequestLogID: n,
          url: a,
          durationMs: m - p,
          message: h.message
        })), this.retryRequest(o, t, n ?? c);
      throw ye(this).info(`[${c}] connection ${_ ? "timed out" : "failed"} - error; no more retries left`), ye(this).debug(`[${c}] connection ${_ ? "timed out" : "failed"} (error; no more retries left)`, It({
        retryOfRequestLogID: n,
        url: a,
        durationMs: m - p,
        message: h.message
      })), h instanceof Uc || h instanceof zh ? h : _ ? new Sr() : new ws({ cause: h });
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
        const M = `retrying, ${t} attempts remaining`;
        return await ba(h.body), ye(this).info(`${g} - ${M}`), ye(this).debug(`[${c}] response error (${M})`, It({
          retryOfRequestLogID: n,
          url: h.url,
          status: h.status,
          headers: h.headers,
          durationMs: m - p
        })), this.retryRequest(o, t, n ?? c, h.headers);
      }
      const _ = y ? "error; no more retries left" : "error; not retryable";
      ye(this).info(`${g} - ${_}`);
      const C = await h.text().catch((M) => Ci(M).message), b = jh(C), x = b ? void 0 : C;
      throw ye(this).debug(`[${c}] response error (${_})`, It({
        retryOfRequestLogID: n,
        url: h.url,
        status: h.status,
        headers: h.headers,
        message: x,
        durationMs: Date.now() - p
      })), this.makeStatusError(h.status, b, x, h.headers);
    }
    return ye(this).info(g), ye(this).debug(`[${c}] response start`, It({
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
    return new Sm(this, n, e);
  }
  async fetchWithAuth(e, t, n, o) {
    if (this._workloadIdentityAuth) {
      const s = t.headers, i = s.get("Authorization");
      if (!i || i === `Bearer ${oi}`) {
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
    return await no(s), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const s = t - e;
    return Math.min(0.5 * Math.pow(2, s), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: o, path: s, query: i, defaultBaseURL: a } = n, u = this.buildURL(s, i, a);
    "timeout" in n && Zh("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    const i = B([
      s,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(o),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...sm(),
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
    const n = B([t]), o = typeof globalThis.ReadableStream < "u" && e instanceof globalThis.ReadableStream, s = !o && (typeof e == "string" || e instanceof ArrayBuffer || ArrayBuffer.isView(e) || typeof globalThis.Blob < "u" && e instanceof globalThis.Blob || e instanceof URLSearchParams || e instanceof FormData);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || o ? {
      bodyHeaders: void 0,
      body: e,
      isStreamingBody: !s
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: Oc(e),
      isStreamingBody: !0
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e),
      isStreamingBody: !1
    } : {
      ...S(this, Qo, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
Or = z, Qo = /* @__PURE__ */ new WeakMap(), Oi = /* @__PURE__ */ new WeakSet(), sf = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
z.OpenAI = Or;
z.DEFAULT_TIMEOUT = 6e5;
z.OpenAIError = O;
z.APIError = Se;
z.APIConnectionError = ws;
z.APIConnectionTimeoutError = Sr;
z.APIUserAbortError = Fe;
z.NotFoundError = Pc;
z.ConflictError = Mc;
z.RateLimitError = kc;
z.BadRequestError = Ic;
z.AuthenticationError = xc;
z.InternalServerError = Lc;
z.PermissionDeniedError = Rc;
z.UnprocessableEntityError = Nc;
z.InvalidWebhookSignatureError = Pn;
z.toFile = xm;
z.Completions = Pd;
z.Chat = xr;
z.Embeddings = kd;
z.Files = Dd;
z.Images = Od;
z.Audio = so;
z.Moderations = Vd;
z.Models = qd;
z.FineTuning = nn;
z.Graders = Fr;
z.VectorStores = ks;
z.Webhooks = of;
z.Beta = tn;
z.Batches = Td;
z.Uploads = Gr;
z.Responses = Ms;
z.Realtime = Ps;
z.Conversations = Nr;
z.Evals = Lr;
z.Containers = Mr;
z.Skills = Ns;
z.Videos = tf;
function lg(e, t) {
  const n = globalThis.top?.console || console;
  try {
    n.groupCollapsed(e), n.log(JSON.parse(JSON.stringify(t))), n.groupEnd();
  } catch {
    n.log(e, t);
  }
}
function ug(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function He(e, t, n) {
  const o = String(n || "").trim();
  o && e.push({
    label: t,
    text: o
  });
}
function cg(e) {
  return typeof e == "string" ? e : Array.isArray(e) ? e.map((t) => t ? typeof t == "string" ? t : t.text || t.content || "" : "").filter(Boolean).join(`
`) : "";
}
function si(e = "") {
  const t = [];
  return {
    cleaned: String(e || "").replace(/<think>([\s\S]*?)<\/think>/gi, (n, o) => (He(t, "思考块", o), "")).trim(),
    thoughts: t
  };
}
function xt(e, t, n) {
  if (t) {
    if (typeof t == "string") {
      He(e, n, t);
      return;
    }
    if (Array.isArray(t)) {
      t.forEach((o) => xt(e, o, n));
      return;
    }
    typeof t == "object" && (typeof t.text == "string" && He(e, n, t.text), typeof t.content == "string" && He(e, n, t.content), typeof t.reasoning_content == "string" && He(e, n, t.reasoning_content), typeof t.thinking == "string" && He(e, n, t.thinking), Array.isArray(t.summary) && t.summary.forEach((o) => {
      if (typeof o == "string") {
        He(e, "推理摘要", o);
        return;
      }
      o && typeof o == "object" && He(e, "推理摘要", o.text || o.content || "");
    }));
  }
}
function dg(e = {}, t = {}) {
  const n = [];
  return xt(n, e.reasoning_content, "推理文本"), xt(n, e.reasoning, "推理文本"), xt(n, e.reasoning_text, "推理文本"), xt(n, e.thinking, "思考块"), xt(n, t.reasoning_content, "推理文本"), xt(n, t.reasoning, "推理文本"), Array.isArray(e.content) && e.content.forEach((o) => {
    if (!(!o || typeof o != "object")) {
      if (o.type === "reasoning_text") {
        He(n, "推理文本", o.text);
        return;
      }
      if (o.type === "summary_text") {
        He(n, "推理摘要", o.text);
        return;
      }
      (o.type === "thinking" || o.type === "reasoning" || o.type === "reasoning_content") && He(n, "思考块", o.text || o.content || o.reasoning || "");
    }
  }), n;
}
function Qa(e = "") {
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
function Za(e) {
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
function fg(e) {
  const t = /* @__PURE__ */ new Map(), n = [];
  for (const o of e.messages || []) {
    if (o.role === "assistant" && Array.isArray(o.tool_calls) && o.tool_calls.length) {
      const s = o.tool_calls.map((i, a) => {
        const u = i.function?.name || "", c = i.id || `tool-call-${a + 1}`;
        return u && t.set(c, u), `<<TOOL_CALL>>${JSON.stringify({
          id: c,
          name: u,
          arguments: ug(i.function?.arguments || "{}")
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
    content: Za(e)
  }) : n[0] = {
    ...n[0],
    content: Za({
      ...e,
      systemPrompt: n[0].content || e.systemPrompt
    })
  }, n;
}
function pg(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
var hg = class {
  constructor(e) {
    this.config = e, this.client = new z({
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
      messages: t ? fg(e) : e.messages,
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
    }), lg("[LittleWhiteBox Assistant] OpenAI-Compatible outgoing request", n), typeof e.onStreamProgress == "function") {
      const f = await this.client.chat.completions.create({
        ...n,
        stream: !0
      }, { signal: e.signal }), h = {
        content: "",
        toolCalls: []
      };
      let m = "stop", g = this.config.model;
      for await (const x of f) {
        g = x.model || g;
        const M = x.choices?.[0], $ = M?.delta || {};
        M?.finish_reason && (m = M.finish_reason), typeof $.content == "string" && (h.content += $.content), Array.isArray($.tool_calls) && $.tool_calls.forEach((F) => {
          const P = Number(F.index ?? 0), D = h.toolCalls[P] || {
            id: "",
            type: "function",
            function: {
              name: "",
              arguments: ""
            }
          };
          h.toolCalls[P] = {
            ...D,
            id: F.id || D.id,
            type: F.type || D.type,
            function: {
              name: F.function?.name || D.function?.name || "",
              arguments: `${D.function?.arguments || ""}${F.function?.arguments || ""}`
            }
          };
        });
        const T = si(h.content);
        pg(e, {
          text: h.toolCalls.filter((F) => F?.function?.name).length ? T.cleaned : T.cleaned.replace(/<<TOOL_CALL>>[\s\S]*?<<\/TOOL_CALL>>/g, "").replace(/<tool_call>[\s\S]*?<\/tool_call>/g, "").trim(),
          thoughts: T.thoughts
        });
      }
      const y = h.toolCalls.map((x) => ({
        id: x.id || `openai-tool-${Date.now()}`,
        name: x.function?.name || "",
        arguments: x.function?.arguments || "{}"
      })).filter((x) => x.name), _ = si(h.content), C = y.length ? [] : Qa(_.cleaned), b = [...y, ...C];
      return {
        text: y.length ? _.cleaned : _.cleaned.replace(/<<TOOL_CALL>>[\s\S]*?<<\/TOOL_CALL>>/g, "").replace(/<tool_call>[\s\S]*?<\/tool_call>/g, "").trim(),
        toolCalls: b,
        thoughts: _.thoughts,
        finishReason: m,
        model: g,
        provider: "openai-compatible"
      };
    }
    const o = await this.client.chat.completions.create(n, { signal: e.signal }), s = o.choices?.[0] || {}, i = s.message || {}, a = dg(i, s), u = (i.tool_calls || []).map((f) => ({
      id: f.id || `openai-tool-${Date.now()}`,
      name: f.function?.name || "",
      arguments: f.function?.arguments || "{}"
    })).filter((f) => f.name), c = si(cg(i.content));
    c.thoughts.forEach((f) => a.push(f));
    const d = u.length ? [] : Qa(c.cleaned), p = [...u, ...d];
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
function dn(e, t) {
  const n = globalThis.top?.console || console;
  try {
    n.groupCollapsed(e), n.log(JSON.parse(JSON.stringify(t))), n.groupEnd();
  } catch {
    n.log(e, t);
  }
}
function rf(e, t) {
  return {
    type: "message",
    role: e,
    content: mg(t)
  };
}
function fs(e) {
  return {
    role: "assistant",
    content: typeof e == "string" ? e : ""
  };
}
function mg(e) {
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
function ps(e, t, n) {
  const o = String(n || "").trim();
  o && e.push({
    label: t,
    text: o
  });
}
function ja(e, t = [], n = {}) {
  (t || []).forEach((o) => {
    if (!(!o || typeof o != "object")) {
      if (o.type === "reasoning_text") {
        ps(e, n.reasoning || "推理文本", o.text);
        return;
      }
      o.type === "summary_text" && ps(e, n.summary || "推理摘要", o.text);
    }
  });
}
function gg(e = []) {
  const t = [];
  return (e || []).forEach((n) => {
    !n || typeof n != "object" || n.type === "reasoning" && (ja(t, n.content, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }), ja(t, n.summary, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }));
  }), t;
}
function yg(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function _g(e) {
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
function vg(e) {
  const t = e?.choices?.[0], n = t?.message?.content, o = String(t?.finish_reason || "");
  if (typeof n != "string" || !n.trim()) return null;
  const s = n.toLowerCase();
  return !s.includes("proxy error") || !s.includes("/responses") && !o.toLowerCase().includes("proxy error") ? null : n.trim();
}
function Sg(e) {
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
        n.content?.trim() && t.push(fs(n.content)), n.tool_calls.forEach((o, s) => {
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
        t.push(fs(n.content || ""));
        continue;
      }
      t.push(n.role === "user" ? rf(n.role, n.content || "") : {
        role: n.role,
        content: typeof n.content == "string" ? n.content : ""
      });
    }
  return t;
}
function Eg(e) {
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
      n.content?.trim() && t.push(fs(n.content)), n.tool_calls.forEach((o, s) => {
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
      t.push(fs(n.content || ""));
      continue;
    }
    t.push(n.role === "user" ? rf(n.role, n.content || "") : {
      role: n.role,
      content: typeof n.content == "string" ? n.content : ""
    });
  }
  return t;
}
function Tg(e) {
  try {
    return new URL(String(e || "https://api.openai.com/v1")).hostname === "api.openai.com";
  } catch {
    return !1;
  }
}
function wg(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return t.includes("instructions") || t.includes("unsupported") || t.includes("unknown parameter") || t.includes("invalid input");
}
function Ag(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function ii(e, t) {
  const [n = "0", o = "0"] = String(e || "").split(":"), [s = "0", i = "0"] = String(t || "").split(":");
  return Number(n) - Number(s) || Number(o) - Number(i);
}
var bg = class {
  constructor(e) {
    this.config = e, this.client = new z({
      apiKey: e.apiKey,
      baseURL: String(e.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 18e4,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  async chat(e) {
    const t = (c) => {
      const d = vg(c);
      if (d) {
        const f = new Error(d);
        throw f.name = "ProxyEndpointError", f.rawDisplay = d, f;
      }
      const p = Array.isArray(c.output) ? c.output : [];
      return {
        output: p,
        thoughts: gg(p),
        toolCalls: p.filter((f) => f.type === "function_call" && f.name).map((f, h) => ({
          id: f.call_id || `response-tool-${h + 1}`,
          name: f.name || "",
          arguments: f.arguments || "{}"
        })),
        text: _g(c)
      };
    }, n = (c = !1) => {
      const d = {
        model: this.config.model,
        instructions: c ? void 0 : yg(e) || void 0,
        input: c ? Eg(e) : Sg(e),
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
      return dn(c ? "[LittleWhiteBox Assistant] OpenAI Responses outgoing request (legacy system-in-input fallback)" : "[LittleWhiteBox Assistant] OpenAI Responses outgoing request", d), await this.client.responses.create(d, { signal: e.signal });
    }, s = async (c = !1) => {
      const d = n(c);
      dn(c ? "[LittleWhiteBox Assistant] OpenAI Responses outgoing stream request (legacy system-in-input fallback)" : "[LittleWhiteBox Assistant] OpenAI Responses outgoing stream request", d);
      const p = this.client.responses.stream(d, { signal: e.signal }), f = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), g = () => {
        const y = [];
        Array.from(h.entries()).sort(([_], [C]) => ii(_, C)).forEach(([, _]) => ps(y, "推理文本", _)), Array.from(m.entries()).sort(([_], [C]) => ii(_, C)).forEach(([, _]) => ps(y, "推理摘要", _)), Ag(e, {
          text: Array.from(f.entries()).sort(([_], [C]) => ii(_, C)).map(([, _]) => _).join(`
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
    }, i = !Tg(this.config.baseUrl);
    let a, u;
    try {
      a = typeof e.onStreamProgress == "function" ? await s(!1) : await o(!1), u = t(a), !u.text && !u.toolCalls.length && dn("[LittleWhiteBox Assistant] OpenAI Responses raw empty response", a), i && !u.text && !u.toolCalls.length && (a = typeof e.onStreamProgress == "function" ? await s(!0) : await o(!0), u = t(a), !u.text && !u.toolCalls.length && dn("[LittleWhiteBox Assistant] OpenAI Responses raw empty response after legacy fallback", a));
    } catch (c) {
      if (!i || !wg(c)) throw c;
      a = typeof e.onStreamProgress == "function" ? await s(!0) : await o(!0), u = t(a), !u.text && !u.toolCalls.length && dn("[LittleWhiteBox Assistant] OpenAI Responses raw empty response after legacy fallback", a);
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
function U(e, t, n, o, s) {
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
var af = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return af = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function Zn(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var qi = (e) => {
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
}, J = class extends Error {
}, De = class Vi extends J {
  constructor(t, n, o, s, i) {
    super(`${Vi.makeMessage(t, n, o)}`), this.status = t, this.headers = s, this.requestID = s?.get("request-id"), this.error = n, this.type = i ?? null;
  }
  static makeMessage(t, n, o) {
    const s = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && s ? `${t} ${s}` : t ? `${t} status code (no body)` : s || "(no status code or body)";
  }
  static generate(t, n, o, s) {
    if (!t || !s) return new Ls({
      message: o,
      cause: qi(n)
    });
    const i = n, a = i?.error?.type;
    return t === 400 ? new uf(t, i, o, s, a) : t === 401 ? new cf(t, i, o, s, a) : t === 403 ? new df(t, i, o, s, a) : t === 404 ? new ff(t, i, o, s, a) : t === 409 ? new pf(t, i, o, s, a) : t === 422 ? new hf(t, i, o, s, a) : t === 429 ? new mf(t, i, o, s, a) : t >= 500 ? new gf(t, i, o, s, a) : new Vi(t, i, o, s, a);
  }
}, Ke = class extends De {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Ls = class extends De {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, lf = class extends Ls {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, uf = class extends De {
}, cf = class extends De {
}, df = class extends De {
}, ff = class extends De {
}, pf = class extends De {
}, hf = class extends De {
}, mf = class extends De {
}, gf = class extends De {
}, Cg = /^[a-z][a-z0-9+.-]*:/i, Ig = (e) => Cg.test(e), Hi = (e) => (Hi = Array.isArray, Hi(e)), el = Hi;
function Ji(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function tl(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function xg(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var Rg = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new J(`${e} must be an integer`);
  if (t < 0) throw new J(`${e} must be a positive integer`);
  return t;
}, yf = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Pg = (e) => new Promise((t) => setTimeout(t, e)), Kt = "0.89.0", Mg = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function Ng() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var kg = () => {
  const e = Ng();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Kt,
    "X-Stainless-OS": ol(Deno.build.os),
    "X-Stainless-Arch": nl(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Kt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Kt,
    "X-Stainless-OS": ol(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": nl(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = Lg();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Kt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Kt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function Lg() {
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
var nl = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", ol = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), sl, Dg = () => sl ?? (sl = kg());
function $g() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function _f(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function vf(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return _f({
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
function qr(e) {
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
async function Ug(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var Fg = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function Bg(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new J(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function Gg(e) {
  let t = 0;
  for (const s of e) t += s.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const s of e)
    n.set(s, o), o += s.length;
  return n;
}
var il;
function Vr(e) {
  let t;
  return (il ?? (t = new globalThis.TextEncoder(), il = t.encode.bind(t)))(e);
}
var rl;
function al(e) {
  let t;
  return (rl ?? (t = new globalThis.TextDecoder(), rl = t.decode.bind(t)))(e);
}
var Ne, ke, io = class {
  constructor() {
    Ne.set(this, void 0), ke.set(this, void 0), U(this, Ne, new Uint8Array(), "f"), U(this, ke, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Vr(e) : e;
    U(this, Ne, Gg([v(this, Ne, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = Og(v(this, Ne, "f"), v(this, ke, "f"))) != null; ) {
      if (o.carriage && v(this, ke, "f") == null) {
        U(this, ke, o.index, "f");
        continue;
      }
      if (v(this, ke, "f") != null && (o.index !== v(this, ke, "f") + 1 || o.carriage)) {
        n.push(al(v(this, Ne, "f").subarray(0, v(this, ke, "f") - 1))), U(this, Ne, v(this, Ne, "f").subarray(v(this, ke, "f")), "f"), U(this, ke, null, "f");
        continue;
      }
      const s = v(this, ke, "f") !== null ? o.preceding - 1 : o.preceding, i = al(v(this, Ne, "f").subarray(0, s));
      n.push(i), U(this, Ne, v(this, Ne, "f").subarray(o.index), "f"), U(this, ke, null, "f");
    }
    return n;
  }
  flush() {
    return v(this, Ne, "f").length ? this.decode(`
`) : [];
  }
};
Ne = /* @__PURE__ */ new WeakMap(), ke = /* @__PURE__ */ new WeakMap();
io.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
io.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function Og(e, t) {
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
function qg(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var hs = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, ll = (e, t, n) => {
  if (e) {
    if (xg(hs, e)) return e;
    Ae(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(hs))}`);
  }
};
function Gn() {
}
function To(e, t, n) {
  return !t || hs[e] > hs[n] ? Gn : t[e].bind(t);
}
var Vg = {
  error: Gn,
  warn: Gn,
  info: Gn,
  debug: Gn
}, ul = /* @__PURE__ */ new WeakMap();
function Ae(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return Vg;
  const o = ul.get(t);
  if (o && o[0] === n) return o[1];
  const s = {
    error: To("error", t, n),
    warn: To("warn", t, n),
    info: To("info", t, n),
    debug: To("debug", t, n)
  };
  return ul.set(t, [n, s]), s;
}
var Rt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), fn, jn = class On {
  constructor(t, n, o) {
    this.iterator = t, fn.set(this, void 0), this.controller = n, U(this, fn, o, "f");
  }
  static fromSSEResponse(t, n, o) {
    let s = !1;
    const i = o ? Ae(o) : console;
    async function* a() {
      if (s) throw new J("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      s = !0;
      let u = !1;
      try {
        for await (const c of Hg(t, n)) {
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
            const d = yf(c.data) ?? c.data, p = d?.error?.type;
            throw new De(void 0, d, void 0, t.headers, p);
          }
        }
        u = !0;
      } catch (c) {
        if (Zn(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new On(a, n, o);
  }
  static fromReadableStream(t, n, o) {
    let s = !1;
    async function* i() {
      const u = new io(), c = qr(t);
      for await (const d of c) for (const p of u.decode(d)) yield p;
      for (const d of u.flush()) yield d;
    }
    async function* a() {
      if (s) throw new J("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      s = !0;
      let u = !1;
      try {
        for await (const c of i())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (Zn(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new On(a, n, o);
  }
  [(fn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new On(() => s(t), this.controller, v(this, fn, "f")), new On(() => s(n), this.controller, v(this, fn, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return _f({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: s, done: i } = await n.next();
          if (i) return o.close();
          const a = Vr(JSON.stringify(s) + `
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
async function* Hg(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new J("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new J("Attempted to iterate over a response with no body");
  const n = new Wg(), o = new io(), s = qr(e.body);
  for await (const i of Jg(s)) for (const a of o.decode(i)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const i of o.flush()) {
    const a = n.decode(i);
    a && (yield a);
  }
}
async function* Jg(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Vr(n) : n;
    let s = new Uint8Array(t.length + o.length);
    s.set(t), s.set(o, t.length), t = s;
    let i;
    for (; (i = qg(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var Wg = class {
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
    let [t, n, o] = Kg(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function Kg(e, t) {
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
async function Sf(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: s, startTime: i } = t, a = await (async () => {
    if (t.options.stream)
      return Ae(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : jn.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Ef(await n.json(), n) : await n.text();
  })();
  return Ae(e).debug(`[${o}] response parsed`, Rt({
    retryOfRequestLogID: s,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
function Ef(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("request-id"),
    enumerable: !1
  });
}
var qn, Tf = class wf extends Promise {
  constructor(t, n, o = Sf) {
    super((s) => {
      s(null);
    }), this.responsePromise = n, this.parseResponse = o, qn.set(this, void 0), U(this, qn, t, "f");
  }
  _thenUnwrap(t) {
    return new wf(v(this, qn, "f"), this.responsePromise, async (n, o) => Ef(t(await this.parseResponse(n, o), o), o.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(v(this, qn, "f"), t))), this.parsedPromise;
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
qn = /* @__PURE__ */ new WeakMap();
var wo, Af = class {
  constructor(e, t, n, o) {
    wo.set(this, void 0), U(this, wo, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new J("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await v(this, wo, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(wo = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, zg = class extends Tf {
  constructor(e, t, n) {
    super(e, t, async (o, s) => new n(o, s.response, await Sf(o, s), s.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, ro = class extends Af {
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
          ...Ji(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...Ji(this.options.query),
        after_id: e
      }
    } : null;
  }
}, nt = class extends Af {
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
        ...Ji(this.options.query),
        page: e
      }
    } : null;
  }
}, bf = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Zt(e, t, n) {
  return bf(), new File(e, t ?? "unknown_file", n);
}
function Zo(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var Cf = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Hr = async (e, t, n = !0) => ({
  ...e,
  body: await Xg(e.body, t, n)
}), cl = /* @__PURE__ */ new WeakMap();
function Yg(e) {
  const t = typeof e == "function" ? e : e.fetch, n = cl.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const s = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new s(i).text();
    } catch {
      return !0;
    }
  })();
  return cl.set(t, o), o;
}
var Xg = async (e, t, n = !0) => {
  if (!await Yg(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const o = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([s, i]) => Wi(o, s, i, n))), o;
}, Qg = (e) => e instanceof Blob && "name" in e, Wi = async (e, t, n, o) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let s = {};
      const i = n.headers.get("Content-Type");
      i && (s = { type: i }), e.append(t, Zt([await n.blob()], Zo(n, o), s));
    } else if (Cf(n)) e.append(t, Zt([await new Response(vf(n)).blob()], Zo(n, o)));
    else if (Qg(n)) e.append(t, Zt([n], Zo(n, o), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((s) => Wi(e, t + "[]", s, o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([s, i]) => Wi(e, `${t}[${s}]`, i, o)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, If = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", Zg = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && If(e), jg = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function ey(e, t, n) {
  if (bf(), e = await e, t || (t = Zo(e, !0)), Zg(e))
    return e instanceof File && t == null && n == null ? e : Zt([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if (jg(e)) {
    const s = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Zt(await Ki(s), t, n);
  }
  const o = await Ki(e);
  if (!n?.type) {
    const s = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof s == "string" && (n = {
      ...n,
      type: s
    });
  }
  return Zt(o, t, n);
}
async function Ki(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (If(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Cf(e)) for await (const n of e) t.push(...await Ki(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${ty(e)}`);
  }
  return t;
}
function ty(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var de = class {
  constructor(e) {
    this._client = e;
  }
}, xf = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* ny(e) {
  if (!e) return;
  if (xf in e) {
    const { values: o, nulls: s } = e;
    yield* o.entries();
    for (const i of s) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : el(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const s = o[0];
    if (typeof s != "string") throw new TypeError("expected header name to be a string");
    const i = el(o[1]) ? o[1] : [o[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [s, null]), yield [s, u]);
  }
}
var L = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const s = /* @__PURE__ */ new Set();
    for (const [i, a] of ny(o)) {
      const u = i.toLowerCase();
      s.has(u) || (t.delete(i), s.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [xf]: !0,
    values: t,
    nulls: n
  };
};
function Rf(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var dl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), oy = (e = Rf) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let s = !1;
  const i = [], a = n.reduce((p, f, h) => {
    /[?#]/.test(f) && (s = !0);
    const m = o[h];
    let g = (s ? encodeURIComponent : e)("" + m);
    return h !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? dl) ?? dl)?.toString) && (g = m + "", i.push({
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
    throw new J(`Path parameters result in path with invalid segments:
${i.map((h) => h.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}, V = /* @__PURE__ */ oy(Rf), Pf = class extends de {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/environments?beta=true", {
      body: o,
      ...t,
      headers: L([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(V`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(V`/v1/environments/${e}?beta=true`, {
      body: s,
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/environments?beta=true", nt, {
      query: o,
      ...t,
      headers: L([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(V`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(V`/v1/environments/${e}/archive?beta=true`, {
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, zn = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function jo(e) {
  return typeof e == "object" && e !== null && zn in e;
}
function Mf(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const o of e) jo(o) && n.add(o[zn]);
  if (t) {
    for (const o of t)
      if (jo(o) && n.add(o[zn]), Array.isArray(o.content))
        for (const s of o.content) jo(s) && n.add(s[zn]);
  }
  return Array.from(n);
}
function Nf(e, t) {
  const n = Mf(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function sy(e) {
  return jo(e) ? { "x-stainless-helper": e[zn] } : {};
}
var kf = class extends de {
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/files", ro, {
      query: o,
      ...t,
      headers: L([{ "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(V`/v1/files/${e}`, {
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  download(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(V`/v1/files/${e}/content`, {
      ...n,
      headers: L([{
        "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      __binaryResponse: !0
    });
  }
  retrieveMetadata(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(V`/v1/files/${e}`, {
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  upload(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/files", Hr({
      body: o,
      ...t,
      headers: L([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        sy(o.file),
        t?.headers
      ])
    }, this._client));
  }
}, Lf = class extends de {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(V`/v1/models/${e}?beta=true`, {
      ...n,
      headers: L([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", ro, {
      query: o,
      ...t,
      headers: L([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Df = class extends de {
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(V`/v1/agents/${e}/versions?beta=true`, nt, {
      query: s,
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Jr = class extends de {
  constructor() {
    super(...arguments), this.versions = new Df(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/agents?beta=true", {
      body: o,
      ...t,
      headers: L([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.get(V`/v1/agents/${e}?beta=true`, {
      query: s,
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(V`/v1/agents/${e}?beta=true`, {
      body: s,
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/agents?beta=true", nt, {
      query: o,
      ...t,
      headers: L([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(V`/v1/agents/${e}/archive?beta=true`, {
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Jr.Versions = Df;
var $f = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};
function Uf(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function fl(e, t, n) {
  const o = Uf(t);
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
  } : Ff(e, t, n);
}
function Ff(e, t, n) {
  let o = null;
  const s = e.content.map((i) => {
    if (i.type === "text") {
      const a = iy(t, i.text);
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
function iy(e, t) {
  const n = Uf(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new J(`Failed to parse structured output: ${o}`);
  }
}
var ry = (e) => {
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
}, zt = (e) => {
  if (e.length === 0) return e;
  let t = e[e.length - 1];
  switch (t.type) {
    case "separator":
      return e = e.slice(0, e.length - 1), zt(e);
    case "number":
      let n = t.value[t.value.length - 1];
      if (n === "." || n === "-")
        return e = e.slice(0, e.length - 1), zt(e);
    case "string":
      let o = e[e.length - 2];
      if (o?.type === "delimiter")
        return e = e.slice(0, e.length - 1), zt(e);
      if (o?.type === "brace" && o.value === "{")
        return e = e.slice(0, e.length - 1), zt(e);
      break;
    case "delimiter":
      return e = e.slice(0, e.length - 1), zt(e);
  }
  return e;
}, ay = (e) => {
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
}, ly = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, Bf = (e) => JSON.parse(ly(ay(zt(ry(e))))), $e, mt, Ot, pn, Ao, hn, mn, bo, gn, it, yn, Co, Io, At, xo, Ro, _n, ri, pl, Po, ai, li, ui, hl, ml = "__json_buf";
function gl(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var uy = class zi {
  constructor(t, n) {
    $e.add(this), this.messages = [], this.receivedMessages = [], mt.set(this, void 0), Ot.set(this, null), this.controller = new AbortController(), pn.set(this, void 0), Ao.set(this, () => {
    }), hn.set(this, () => {
    }), mn.set(this, void 0), bo.set(this, () => {
    }), gn.set(this, () => {
    }), it.set(this, {}), yn.set(this, !1), Co.set(this, !1), Io.set(this, !1), At.set(this, !1), xo.set(this, void 0), Ro.set(this, void 0), _n.set(this, void 0), Po.set(this, (o) => {
      if (U(this, Co, !0, "f"), Zn(o) && (o = new Ke()), o instanceof Ke)
        return U(this, Io, !0, "f"), this._emit("abort", o);
      if (o instanceof J) return this._emit("error", o);
      if (o instanceof Error) {
        const s = new J(o.message);
        return s.cause = o, this._emit("error", s);
      }
      return this._emit("error", new J(String(o)));
    }), U(this, pn, new Promise((o, s) => {
      U(this, Ao, o, "f"), U(this, hn, s, "f");
    }), "f"), U(this, mn, new Promise((o, s) => {
      U(this, bo, o, "f"), U(this, gn, s, "f");
    }), "f"), v(this, pn, "f").catch(() => {
    }), v(this, mn, "f").catch(() => {
    }), U(this, Ot, t, "f"), U(this, _n, n?.logger ?? console, "f");
  }
  get response() {
    return v(this, xo, "f");
  }
  get request_id() {
    return v(this, Ro, "f");
  }
  async withResponse() {
    U(this, At, !0, "f");
    const t = await v(this, pn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new zi(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, o, { logger: s } = {}) {
    const i = new zi(n, { logger: s });
    for (const a of n.messages) i._addMessageParam(a);
    return U(i, Ot, {
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
    }, v(this, Po, "f"));
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
      v(this, $e, "m", ai).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) v(this, $e, "m", li).call(this, c);
      if (u.controller.signal?.aborted) throw new Ke();
      v(this, $e, "m", ui).call(this);
    } finally {
      s && i && s.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (U(this, xo, t, "f"), U(this, Ro, t?.headers.get("request-id"), "f"), v(this, Ao, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return v(this, yn, "f");
  }
  get errored() {
    return v(this, Co, "f");
  }
  get aborted() {
    return v(this, Io, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (v(this, it, "f")[t] || (v(this, it, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const o = v(this, it, "f")[t];
    if (!o) return this;
    const s = o.findIndex((i) => i.listener === n);
    return s >= 0 && o.splice(s, 1), this;
  }
  once(t, n) {
    return (v(this, it, "f")[t] || (v(this, it, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      U(this, At, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    U(this, At, !0, "f"), await v(this, mn, "f");
  }
  get currentMessage() {
    return v(this, mt, "f");
  }
  async finalMessage() {
    return await this.done(), v(this, $e, "m", ri).call(this);
  }
  async finalText() {
    return await this.done(), v(this, $e, "m", pl).call(this);
  }
  _emit(t, ...n) {
    if (v(this, yn, "f")) return;
    t === "end" && (U(this, yn, !0, "f"), v(this, bo, "f").call(this));
    const o = v(this, it, "f")[t];
    if (o && (v(this, it, "f")[t] = o.filter((s) => !s.once), o.forEach(({ listener: s }) => s(...n))), t === "abort") {
      const s = n[0];
      !v(this, At, "f") && !o?.length && Promise.reject(s), v(this, hn, "f").call(this, s), v(this, gn, "f").call(this, s), this._emit("end");
      return;
    }
    if (t === "error") {
      const s = n[0];
      !v(this, At, "f") && !o?.length && Promise.reject(s), v(this, hn, "f").call(this, s), v(this, gn, "f").call(this, s), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", v(this, $e, "m", ri).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let s;
    o && (o.aborted && this.controller.abort(), s = this.controller.abort.bind(this.controller), o.addEventListener("abort", s));
    try {
      v(this, $e, "m", ai).call(this), this._connected(null);
      const i = jn.fromReadableStream(t, this.controller);
      for await (const a of i) v(this, $e, "m", li).call(this, a);
      if (i.controller.signal?.aborted) throw new Ke();
      v(this, $e, "m", ui).call(this);
    } finally {
      o && s && o.removeEventListener("abort", s);
    }
  }
  [(mt = /* @__PURE__ */ new WeakMap(), Ot = /* @__PURE__ */ new WeakMap(), pn = /* @__PURE__ */ new WeakMap(), Ao = /* @__PURE__ */ new WeakMap(), hn = /* @__PURE__ */ new WeakMap(), mn = /* @__PURE__ */ new WeakMap(), bo = /* @__PURE__ */ new WeakMap(), gn = /* @__PURE__ */ new WeakMap(), it = /* @__PURE__ */ new WeakMap(), yn = /* @__PURE__ */ new WeakMap(), Co = /* @__PURE__ */ new WeakMap(), Io = /* @__PURE__ */ new WeakMap(), At = /* @__PURE__ */ new WeakMap(), xo = /* @__PURE__ */ new WeakMap(), Ro = /* @__PURE__ */ new WeakMap(), _n = /* @__PURE__ */ new WeakMap(), Po = /* @__PURE__ */ new WeakMap(), $e = /* @__PURE__ */ new WeakSet(), ri = function() {
    if (this.receivedMessages.length === 0) throw new J("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, pl = function() {
    if (this.receivedMessages.length === 0) throw new J("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new J("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, ai = function() {
    this.ended || U(this, mt, void 0, "f");
  }, li = function(n) {
    if (this.ended) return;
    const o = v(this, $e, "m", hl).call(this, n);
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
            gl(s) && s.input && this._emit("inputJson", n.delta.partial_json, s.input);
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
        this._addMessageParam(o), this._addMessage(fl(o, v(this, Ot, "f"), { logger: v(this, _n, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        U(this, mt, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, ui = function() {
    if (this.ended) throw new J("stream has ended, this shouldn't happen");
    const n = v(this, mt, "f");
    if (!n) throw new J("request ended without sending any chunks");
    return U(this, mt, void 0, "f"), fl(n, v(this, Ot, "f"), { logger: v(this, _n, "f") });
  }, hl = function(n) {
    let o = v(this, mt, "f");
    if (n.type === "message_start") {
      if (o) throw new J(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!o) throw new J(`Unexpected event order, got ${n.type} before "message_start"`);
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
            if (s && gl(s)) {
              let i = s[ml] || "";
              i += n.delta.partial_json;
              const a = { ...s };
              if (Object.defineProperty(a, ml, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i) try {
                a.input = Bf(i);
              } catch (u) {
                const c = new J(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${i}`);
                v(this, Po, "f").call(this, c);
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
    return new jn(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
var Gf = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var cy = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
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
Wrap your summary in <summary></summary> tags.`, vn, qt, bt, ue, Ce, Re, lt, gt, Sn, yl, Yi;
function _l() {
  let e, t;
  return {
    promise: new Promise((n, o) => {
      e = n, t = o;
    }),
    resolve: e,
    reject: t
  };
}
var Of = class {
  constructor(e, t, n) {
    vn.add(this), this.client = e, qt.set(this, !1), bt.set(this, !1), ue.set(this, void 0), Ce.set(this, void 0), Re.set(this, void 0), lt.set(this, void 0), gt.set(this, void 0), Sn.set(this, 0), U(this, ue, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const o = ["BetaToolRunner", ...Mf(t.tools, t.messages)].join(", ");
    U(this, Ce, {
      ...n,
      headers: L([{ "x-stainless-helper": o }, n?.headers])
    }, "f"), U(this, gt, _l(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(qt = /* @__PURE__ */ new WeakMap(), bt = /* @__PURE__ */ new WeakMap(), ue = /* @__PURE__ */ new WeakMap(), Ce = /* @__PURE__ */ new WeakMap(), Re = /* @__PURE__ */ new WeakMap(), lt = /* @__PURE__ */ new WeakMap(), gt = /* @__PURE__ */ new WeakMap(), Sn = /* @__PURE__ */ new WeakMap(), vn = /* @__PURE__ */ new WeakSet(), yl = async function() {
    const t = v(this, ue, "f").params.compactionControl;
    if (!t || !t.enabled) return !1;
    let n = 0;
    if (v(this, Re, "f") !== void 0) try {
      const c = await v(this, Re, "f");
      n = c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0) + c.usage.output_tokens;
    } catch {
      return !1;
    }
    const o = t.contextTokenThreshold ?? 1e5;
    if (n < o) return !1;
    const s = t.model ?? v(this, ue, "f").params.model, i = t.summaryPrompt ?? cy, a = v(this, ue, "f").params.messages;
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
      max_tokens: v(this, ue, "f").params.max_tokens
    }, {
      signal: v(this, Ce, "f").signal,
      headers: L([v(this, Ce, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (u.content[0]?.type !== "text") throw new J("Expected text response for compaction");
    return v(this, ue, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (v(this, qt, "f")) throw new J("Cannot iterate over a consumed stream");
    U(this, qt, !0, "f"), U(this, bt, !0, "f"), U(this, lt, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (v(this, ue, "f").params.max_iterations && v(this, Sn, "f") >= v(this, ue, "f").params.max_iterations) break;
          U(this, bt, !1, "f"), U(this, lt, void 0, "f"), U(this, Sn, (e = v(this, Sn, "f"), e++, e), "f"), U(this, Re, void 0, "f");
          const { max_iterations: n, compactionControl: o, ...s } = v(this, ue, "f").params;
          if (s.stream ? (t = this.client.beta.messages.stream({ ...s }, v(this, Ce, "f")), U(this, Re, t.finalMessage(), "f"), v(this, Re, "f").catch(() => {
          }), yield t) : (U(this, Re, this.client.beta.messages.create({
            ...s,
            stream: !1
          }, v(this, Ce, "f")), "f"), yield v(this, Re, "f")), !await v(this, vn, "m", yl).call(this)) {
            if (!v(this, bt, "f")) {
              const { role: a, content: u } = await v(this, Re, "f");
              v(this, ue, "f").params.messages.push({
                role: a,
                content: u
              });
            }
            const i = await v(this, vn, "m", Yi).call(this, v(this, ue, "f").params.messages.at(-1));
            if (i) v(this, ue, "f").params.messages.push(i);
            else if (!v(this, bt, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!v(this, Re, "f")) throw new J("ToolRunner concluded without a message from the server");
      v(this, gt, "f").resolve(await v(this, Re, "f"));
    } catch (t) {
      throw U(this, qt, !1, "f"), v(this, gt, "f").promise.catch(() => {
      }), v(this, gt, "f").reject(t), U(this, gt, _l(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? v(this, ue, "f").params = e(v(this, ue, "f").params) : v(this, ue, "f").params = e, U(this, bt, !0, "f"), U(this, lt, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? U(this, Ce, e(v(this, Ce, "f")), "f") : U(this, Ce, {
      ...v(this, Ce, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = v(this, Ce, "f").signal) {
    const t = await v(this, Re, "f") ?? this.params.messages.at(-1);
    return t ? v(this, vn, "m", Yi).call(this, t, e) : null;
  }
  done() {
    return v(this, gt, "f").promise;
  }
  async runUntilDone() {
    if (!v(this, qt, "f")) for await (const e of this) ;
    return this.done();
  }
  get params() {
    return v(this, ue, "f").params;
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
Yi = async function(t, n = v(this, Ce, "f").signal) {
  return v(this, lt, "f") !== void 0 ? v(this, lt, "f") : (U(this, lt, dy(v(this, ue, "f").params, t, {
    ...v(this, Ce, "f"),
    signal: n
  }), "f"), v(this, lt, "f"));
};
async function dy(e, t = e.messages.at(-1), n) {
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
          content: a instanceof Gf ? a.content : `Error: ${a instanceof Error ? a.message : String(a)}`,
          is_error: !0
        };
      }
    }))
  };
}
var qf = class Vf {
  constructor(t, n) {
    this.iterator = t, this.controller = n;
  }
  async *decoder() {
    const t = new io();
    for await (const n of this.iterator) for (const o of t.decode(n)) yield JSON.parse(o);
    for (const n of t.flush()) yield JSON.parse(n);
  }
  [Symbol.asyncIterator]() {
    return this.decoder();
  }
  static fromResponse(t, n) {
    if (!t.body)
      throw n.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new J("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new J("Attempted to iterate over a response with no body");
    return new Vf(qr(t.body), n);
  }
}, Hf = class extends de {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/messages/batches?beta=true", {
      body: o,
      ...t,
      headers: L([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(V`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/messages/batches?beta=true", ro, {
      query: o,
      ...t,
      headers: L([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(V`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  cancel(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(V`/v1/messages/batches/${e}/cancel?beta=true`, {
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  async results(e, t = {}, n) {
    const o = await this.retrieve(e);
    if (!o.results_url) throw new J(`No batch \`results_url\`; Has it finished processing? ${o.processing_status} - ${o.id}`);
    const { betas: s } = t ?? {};
    return this._client.get(o.results_url, {
      ...n,
      headers: L([{
        "anthropic-beta": [...s ?? [], "message-batches-2024-09-24"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((i, a) => qf.fromResponse(a.response, a.controller));
  }
}, vl = {
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
}, fy = ["claude-opus-4-6"], ao = class extends de {
  constructor() {
    super(...arguments), this.batches = new Hf(this._client);
  }
  create(e, t) {
    const n = Sl(e), { betas: o, ...s } = n;
    s.model in vl && console.warn(`The model '${s.model}' is deprecated and will reach end-of-life on ${vl[s.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), s.model in fy && s.thinking && s.thinking.type === "enabled" && console.warn(`Using Claude with ${s.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let i = this._client._options.timeout;
    if (!s.stream && i == null) {
      const u = $f[s.model] ?? void 0;
      i = this._client.calculateNonstreamingTimeout(s.max_tokens, u);
    }
    const a = Nf(s.tools, s.messages);
    return this._client.post("/v1/messages?beta=true", {
      body: s,
      timeout: i ?? 6e5,
      ...t,
      headers: L([
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
      headers: L([{ "anthropic-beta": [...e.betas ?? [], "structured-outputs-2025-12-15"].toString() }, t?.headers])
    }, this.create(e, t).then((n) => Ff(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return uy.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...o } = Sl(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: o,
      ...t,
      headers: L([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new Of(this._client, e, t);
  }
};
function Sl(e) {
  if (!e.output_format) return e;
  if (e.output_config?.format) throw new J("Both output_format and output_config.format were provided. Please use only output_config.format (output_format is deprecated).");
  const { output_format: t, ...n } = e;
  return {
    ...n,
    output_config: {
      ...e.output_config,
      format: t
    }
  };
}
ao.Batches = Hf;
ao.BetaToolRunner = Of;
ao.ToolError = Gf;
var Jf = class extends de {
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(V`/v1/sessions/${e}/events?beta=true`, nt, {
      query: s,
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  send(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(V`/v1/sessions/${e}/events?beta=true`, {
      body: s,
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  stream(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(V`/v1/sessions/${e}/events/stream?beta=true`, {
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers]),
      stream: !0
    });
  }
}, Wf = class extends de {
  retrieve(e, t, n) {
    const { session_id: o, betas: s } = t;
    return this._client.get(V`/v1/sessions/${o}/resources/${e}?beta=true`, {
      ...n,
      headers: L([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { session_id: o, betas: s, ...i } = t;
    return this._client.post(V`/v1/sessions/${o}/resources/${e}?beta=true`, {
      body: i,
      ...n,
      headers: L([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(V`/v1/sessions/${e}/resources?beta=true`, nt, {
      query: s,
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { session_id: o, betas: s } = t;
    return this._client.delete(V`/v1/sessions/${o}/resources/${e}?beta=true`, {
      ...n,
      headers: L([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  add(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(V`/v1/sessions/${e}/resources?beta=true`, {
      body: s,
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Ds = class extends de {
  constructor() {
    super(...arguments), this.events = new Jf(this._client), this.resources = new Wf(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/sessions?beta=true", {
      body: o,
      ...t,
      headers: L([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(V`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(V`/v1/sessions/${e}?beta=true`, {
      body: s,
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/sessions?beta=true", nt, {
      query: o,
      ...t,
      headers: L([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(V`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(V`/v1/sessions/${e}/archive?beta=true`, {
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Ds.Events = Jf;
Ds.Resources = Wf;
var Kf = class extends de {
  create(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.post(V`/v1/skills/${e}/versions?beta=true`, Hr({
      body: s,
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: o, betas: s } = t;
    return this._client.get(V`/v1/skills/${o}/versions/${e}?beta=true`, {
      ...n,
      headers: L([{ "anthropic-beta": [...s ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(V`/v1/skills/${e}/versions?beta=true`, nt, {
      query: s,
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { skill_id: o, betas: s } = t;
    return this._client.delete(V`/v1/skills/${o}/versions/${e}?beta=true`, {
      ...n,
      headers: L([{ "anthropic-beta": [...s ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
}, Wr = class extends de {
  constructor() {
    super(...arguments), this.versions = new Kf(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.post("/v1/skills?beta=true", Hr({
      body: o,
      ...t,
      headers: L([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    }, this._client, !1));
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(V`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/skills?beta=true", nt, {
      query: o,
      ...t,
      headers: L([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(V`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
};
Wr.Versions = Kf;
var zf = class extends de {
  create(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(V`/v1/vaults/${e}/credentials?beta=true`, {
      body: s,
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vault_id: o, betas: s } = t;
    return this._client.get(V`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      ...n,
      headers: L([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vault_id: o, betas: s, ...i } = t;
    return this._client.post(V`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      body: i,
      ...n,
      headers: L([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(V`/v1/vaults/${e}/credentials?beta=true`, nt, {
      query: s,
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vault_id: o, betas: s } = t;
    return this._client.delete(V`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      ...n,
      headers: L([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t, n) {
    const { vault_id: o, betas: s } = t;
    return this._client.post(V`/v1/vaults/${o}/credentials/${e}/archive?beta=true`, {
      ...n,
      headers: L([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Kr = class extends de {
  constructor() {
    super(...arguments), this.credentials = new zf(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/vaults?beta=true", {
      body: o,
      ...t,
      headers: L([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(V`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(V`/v1/vaults/${e}?beta=true`, {
      body: s,
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/vaults?beta=true", nt, {
      query: o,
      ...t,
      headers: L([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(V`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(V`/v1/vaults/${e}/archive?beta=true`, {
      ...n,
      headers: L([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Kr.Credentials = zf;
var ot = class extends de {
  constructor() {
    super(...arguments), this.models = new Lf(this._client), this.messages = new ao(this._client), this.agents = new Jr(this._client), this.environments = new Pf(this._client), this.sessions = new Ds(this._client), this.vaults = new Kr(this._client), this.files = new kf(this._client), this.skills = new Wr(this._client);
  }
};
ot.Models = Lf;
ot.Messages = ao;
ot.Agents = Jr;
ot.Environments = Pf;
ot.Sessions = Ds;
ot.Vaults = Kr;
ot.Files = kf;
ot.Skills = Wr;
var Yf = class extends de {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/complete", {
      body: o,
      timeout: this._client._options.timeout ?? 6e5,
      ...t,
      headers: L([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers]),
      stream: e.stream ?? !1
    });
  }
};
function Xf(e) {
  return e?.output_config?.format;
}
function El(e, t, n) {
  const o = Xf(t);
  return !t || !("parse" in (o ?? {})) ? {
    ...e,
    content: e.content.map((s) => s.type === "text" ? Object.defineProperty({ ...s }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : s),
    parsed_output: null
  } : Qf(e, t, n);
}
function Qf(e, t, n) {
  let o = null;
  const s = e.content.map((i) => {
    if (i.type === "text") {
      const a = py(t, i.text);
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
function py(e, t) {
  const n = Xf(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new J(`Failed to parse structured output: ${o}`);
  }
}
var Ue, yt, Vt, En, Mo, Tn, wn, No, An, rt, bn, ko, Lo, Ct, Do, $o, Cn, ci, Tl, di, fi, pi, hi, wl, Al = "__json_buf";
function bl(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var hy = class Xi {
  constructor(t, n) {
    Ue.add(this), this.messages = [], this.receivedMessages = [], yt.set(this, void 0), Vt.set(this, null), this.controller = new AbortController(), En.set(this, void 0), Mo.set(this, () => {
    }), Tn.set(this, () => {
    }), wn.set(this, void 0), No.set(this, () => {
    }), An.set(this, () => {
    }), rt.set(this, {}), bn.set(this, !1), ko.set(this, !1), Lo.set(this, !1), Ct.set(this, !1), Do.set(this, void 0), $o.set(this, void 0), Cn.set(this, void 0), di.set(this, (o) => {
      if (U(this, ko, !0, "f"), Zn(o) && (o = new Ke()), o instanceof Ke)
        return U(this, Lo, !0, "f"), this._emit("abort", o);
      if (o instanceof J) return this._emit("error", o);
      if (o instanceof Error) {
        const s = new J(o.message);
        return s.cause = o, this._emit("error", s);
      }
      return this._emit("error", new J(String(o)));
    }), U(this, En, new Promise((o, s) => {
      U(this, Mo, o, "f"), U(this, Tn, s, "f");
    }), "f"), U(this, wn, new Promise((o, s) => {
      U(this, No, o, "f"), U(this, An, s, "f");
    }), "f"), v(this, En, "f").catch(() => {
    }), v(this, wn, "f").catch(() => {
    }), U(this, Vt, t, "f"), U(this, Cn, n?.logger ?? console, "f");
  }
  get response() {
    return v(this, Do, "f");
  }
  get request_id() {
    return v(this, $o, "f");
  }
  async withResponse() {
    U(this, Ct, !0, "f");
    const t = await v(this, En, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Xi(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, o, { logger: s } = {}) {
    const i = new Xi(n, { logger: s });
    for (const a of n.messages) i._addMessageParam(a);
    return U(i, Vt, {
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
    }, v(this, di, "f"));
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
      v(this, Ue, "m", fi).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) v(this, Ue, "m", pi).call(this, c);
      if (u.controller.signal?.aborted) throw new Ke();
      v(this, Ue, "m", hi).call(this);
    } finally {
      s && i && s.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (U(this, Do, t, "f"), U(this, $o, t?.headers.get("request-id"), "f"), v(this, Mo, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return v(this, bn, "f");
  }
  get errored() {
    return v(this, ko, "f");
  }
  get aborted() {
    return v(this, Lo, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (v(this, rt, "f")[t] || (v(this, rt, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const o = v(this, rt, "f")[t];
    if (!o) return this;
    const s = o.findIndex((i) => i.listener === n);
    return s >= 0 && o.splice(s, 1), this;
  }
  once(t, n) {
    return (v(this, rt, "f")[t] || (v(this, rt, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      U(this, Ct, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    U(this, Ct, !0, "f"), await v(this, wn, "f");
  }
  get currentMessage() {
    return v(this, yt, "f");
  }
  async finalMessage() {
    return await this.done(), v(this, Ue, "m", ci).call(this);
  }
  async finalText() {
    return await this.done(), v(this, Ue, "m", Tl).call(this);
  }
  _emit(t, ...n) {
    if (v(this, bn, "f")) return;
    t === "end" && (U(this, bn, !0, "f"), v(this, No, "f").call(this));
    const o = v(this, rt, "f")[t];
    if (o && (v(this, rt, "f")[t] = o.filter((s) => !s.once), o.forEach(({ listener: s }) => s(...n))), t === "abort") {
      const s = n[0];
      !v(this, Ct, "f") && !o?.length && Promise.reject(s), v(this, Tn, "f").call(this, s), v(this, An, "f").call(this, s), this._emit("end");
      return;
    }
    if (t === "error") {
      const s = n[0];
      !v(this, Ct, "f") && !o?.length && Promise.reject(s), v(this, Tn, "f").call(this, s), v(this, An, "f").call(this, s), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", v(this, Ue, "m", ci).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let s;
    o && (o.aborted && this.controller.abort(), s = this.controller.abort.bind(this.controller), o.addEventListener("abort", s));
    try {
      v(this, Ue, "m", fi).call(this), this._connected(null);
      const i = jn.fromReadableStream(t, this.controller);
      for await (const a of i) v(this, Ue, "m", pi).call(this, a);
      if (i.controller.signal?.aborted) throw new Ke();
      v(this, Ue, "m", hi).call(this);
    } finally {
      o && s && o.removeEventListener("abort", s);
    }
  }
  [(yt = /* @__PURE__ */ new WeakMap(), Vt = /* @__PURE__ */ new WeakMap(), En = /* @__PURE__ */ new WeakMap(), Mo = /* @__PURE__ */ new WeakMap(), Tn = /* @__PURE__ */ new WeakMap(), wn = /* @__PURE__ */ new WeakMap(), No = /* @__PURE__ */ new WeakMap(), An = /* @__PURE__ */ new WeakMap(), rt = /* @__PURE__ */ new WeakMap(), bn = /* @__PURE__ */ new WeakMap(), ko = /* @__PURE__ */ new WeakMap(), Lo = /* @__PURE__ */ new WeakMap(), Ct = /* @__PURE__ */ new WeakMap(), Do = /* @__PURE__ */ new WeakMap(), $o = /* @__PURE__ */ new WeakMap(), Cn = /* @__PURE__ */ new WeakMap(), di = /* @__PURE__ */ new WeakMap(), Ue = /* @__PURE__ */ new WeakSet(), ci = function() {
    if (this.receivedMessages.length === 0) throw new J("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, Tl = function() {
    if (this.receivedMessages.length === 0) throw new J("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new J("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, fi = function() {
    this.ended || U(this, yt, void 0, "f");
  }, pi = function(n) {
    if (this.ended) return;
    const o = v(this, Ue, "m", wl).call(this, n);
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
        this._addMessageParam(o), this._addMessage(El(o, v(this, Vt, "f"), { logger: v(this, Cn, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        U(this, yt, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, hi = function() {
    if (this.ended) throw new J("stream has ended, this shouldn't happen");
    const n = v(this, yt, "f");
    if (!n) throw new J("request ended without sending any chunks");
    return U(this, yt, void 0, "f"), El(n, v(this, Vt, "f"), { logger: v(this, Cn, "f") });
  }, wl = function(n) {
    let o = v(this, yt, "f");
    if (n.type === "message_start") {
      if (o) throw new J(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!o) throw new J(`Unexpected event order, got ${n.type} before "message_start"`);
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
              let i = s[Al] || "";
              i += n.delta.partial_json;
              const a = { ...s };
              Object.defineProperty(a, Al, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i && (a.input = Bf(i)), o.content[n.index] = a;
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
    return new jn(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
var Zf = class extends de {
  create(e, t) {
    return this._client.post("/v1/messages/batches", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(V`/v1/messages/batches/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/v1/messages/batches", ro, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(V`/v1/messages/batches/${e}`, t);
  }
  cancel(e, t) {
    return this._client.post(V`/v1/messages/batches/${e}/cancel`, t);
  }
  async results(e, t) {
    const n = await this.retrieve(e);
    if (!n.results_url) throw new J(`No batch \`results_url\`; Has it finished processing? ${n.processing_status} - ${n.id}`);
    return this._client.get(n.results_url, {
      ...t,
      headers: L([{ Accept: "application/binary" }, t?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((o, s) => qf.fromResponse(s.response, s.controller));
  }
}, zr = class extends de {
  constructor() {
    super(...arguments), this.batches = new Zf(this._client);
  }
  create(e, t) {
    e.model in Cl && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${Cl[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), e.model in my && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const s = $f[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, s);
    }
    const o = Nf(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: L([o, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => Qf(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return hy.createMessage(this, e, t, { logger: this._client.logger ?? console });
  }
  countTokens(e, t) {
    return this._client.post("/v1/messages/count_tokens", {
      body: e,
      ...t
    });
  }
}, Cl = {
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
}, my = ["claude-opus-4-6"];
zr.Batches = Zf;
var jf = class extends de {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(V`/v1/models/${e}`, {
      ...n,
      headers: L([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models", ro, {
      query: o,
      ...t,
      headers: L([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Uo = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, Qi, Yr, es, ep, gy = "\\n\\nHuman:", yy = "\\n\\nAssistant:", ae = class {
  constructor({ baseURL: e = Uo("ANTHROPIC_BASE_URL"), apiKey: t = Uo("ANTHROPIC_API_KEY") ?? null, authToken: n = Uo("ANTHROPIC_AUTH_TOKEN") ?? null, ...o } = {}) {
    Qi.add(this), es.set(this, void 0);
    const s = {
      apiKey: t,
      authToken: n,
      ...o,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!s.dangerouslyAllowBrowser && Mg()) throw new J(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = s.baseURL, this.timeout = s.timeout ?? Yr.DEFAULT_TIMEOUT, this.logger = s.logger ?? console;
    const i = "warn";
    this.logLevel = i, this.logLevel = ll(s.logLevel, "ClientOptions.logLevel", this) ?? ll(Uo("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? i, this.fetchOptions = s.fetchOptions, this.maxRetries = s.maxRetries ?? 2, this.fetch = s.fetch ?? $g(), U(this, es, Fg, "f"), this._options = s, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
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
    return L([await this.apiKeyAuth(e), await this.bearerAuth(e)]);
  }
  async apiKeyAuth(e) {
    if (this.apiKey != null)
      return L([{ "X-Api-Key": this.apiKey }]);
  }
  async bearerAuth(e) {
    if (this.authToken != null)
      return L([{ Authorization: `Bearer ${this.authToken}` }]);
  }
  stringifyQuery(e) {
    return Bg(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Kt}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${af()}`;
  }
  makeStatusError(e, t, n, o) {
    return De.generate(e, t, n, o);
  }
  buildURL(e, t, n) {
    const o = !v(this, Qi, "m", ep).call(this) && n || this.baseURL, s = Ig(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), a = Object.fromEntries(s.searchParams);
    return (!tl(i) || !tl(a)) && (t = {
      ...a,
      ...i,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (s.search = this.stringifyQuery(t)), s.toString();
  }
  _calculateNonstreamingTimeout(e) {
    if (3600 * e / 128e3 > 600) throw new J("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#streaming-responses for more details");
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
    return new Tf(this, this.makeRequest(e, t, void 0));
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
    if (Ae(this).debug(`[${c}] sending request`, Rt({
      retryOfRequestLogID: n,
      method: o.method,
      url: a,
      options: o,
      headers: i.headers
    })), o.signal?.aborted) throw new Ke();
    const f = new AbortController(), h = await this.fetchWithTimeout(a, i, u, f).catch(qi), m = Date.now();
    if (h instanceof globalThis.Error) {
      const y = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new Ke();
      const _ = Zn(h) || /timed? ?out/i.test(String(h) + ("cause" in h ? String(h.cause) : ""));
      if (t)
        return Ae(this).info(`[${c}] connection ${_ ? "timed out" : "failed"} - ${y}`), Ae(this).debug(`[${c}] connection ${_ ? "timed out" : "failed"} (${y})`, Rt({
          retryOfRequestLogID: n,
          url: a,
          durationMs: m - p,
          message: h.message
        })), this.retryRequest(o, t, n ?? c);
      throw Ae(this).info(`[${c}] connection ${_ ? "timed out" : "failed"} - error; no more retries left`), Ae(this).debug(`[${c}] connection ${_ ? "timed out" : "failed"} (error; no more retries left)`, Rt({
        retryOfRequestLogID: n,
        url: a,
        durationMs: m - p,
        message: h.message
      })), _ ? new lf() : new Ls({ cause: h });
    }
    const g = `[${c}${d}${[...h.headers.entries()].filter(([y]) => y === "request-id").map(([y, _]) => ", " + y + ": " + JSON.stringify(_)).join("")}] ${i.method} ${a} ${h.ok ? "succeeded" : "failed"} with status ${h.status} in ${m - p}ms`;
    if (!h.ok) {
      const y = await this.shouldRetry(h);
      if (t && y) {
        const M = `retrying, ${t} attempts remaining`;
        return await Ug(h.body), Ae(this).info(`${g} - ${M}`), Ae(this).debug(`[${c}] response error (${M})`, Rt({
          retryOfRequestLogID: n,
          url: h.url,
          status: h.status,
          headers: h.headers,
          durationMs: m - p
        })), this.retryRequest(o, t, n ?? c, h.headers);
      }
      const _ = y ? "error; no more retries left" : "error; not retryable";
      Ae(this).info(`${g} - ${_}`);
      const C = await h.text().catch((M) => qi(M).message), b = yf(C), x = b ? void 0 : C;
      throw Ae(this).debug(`[${c}] response error (${_})`, Rt({
        retryOfRequestLogID: n,
        url: h.url,
        status: h.status,
        headers: h.headers,
        message: x,
        durationMs: Date.now() - p
      })), this.makeStatusError(h.status, b, x, h.headers);
    }
    return Ae(this).info(g), Ae(this).debug(`[${c}] response start`, Rt({
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
    return new zg(this, n, e);
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
    return await Pg(s), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const s = t - e;
    return Math.min(0.5 * Math.pow(2, s), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  calculateNonstreamingTimeout(e, t) {
    if (36e5 * e / 128e3 > 6e5 || t != null && e > t) throw new J("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details");
    return 6e5;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: o, path: s, query: i, defaultBaseURL: a } = n, u = this.buildURL(s, i, a);
    "timeout" in n && Rg("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    const i = L([
      s,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(o),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...Dg(),
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
    const n = L([t]);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || globalThis.ReadableStream && e instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: e
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: vf(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : v(this, es, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
Yr = ae, es = /* @__PURE__ */ new WeakMap(), Qi = /* @__PURE__ */ new WeakSet(), ep = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
ae.Anthropic = Yr;
ae.HUMAN_PROMPT = gy;
ae.AI_PROMPT = yy;
ae.DEFAULT_TIMEOUT = 6e5;
ae.AnthropicError = J;
ae.APIError = De;
ae.APIConnectionError = Ls;
ae.APIConnectionTimeoutError = lf;
ae.APIUserAbortError = Ke;
ae.NotFoundError = ff;
ae.ConflictError = pf;
ae.RateLimitError = mf;
ae.BadRequestError = uf;
ae.AuthenticationError = cf;
ae.InternalServerError = gf;
ae.PermissionDeniedError = df;
ae.UnprocessableEntityError = hf;
ae.toFile = ey;
var lo = class extends ae {
  constructor() {
    super(...arguments), this.completions = new Yf(this), this.messages = new zr(this), this.models = new jf(this), this.beta = new ot(this);
  }
};
lo.Completions = Yf;
lo.Messages = zr;
lo.Models = jf;
lo.Beta = ot;
function _y(e, t) {
  const n = globalThis.top?.console || console;
  try {
    n.groupCollapsed(e), n.log(JSON.parse(JSON.stringify(t))), n.groupEnd();
  } catch {
    n.log(e, t);
  }
}
function vy(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function Sy(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? {
    mediaType: t[1],
    data: t[2]
  } : {
    mediaType: "",
    data: ""
  };
}
function Ey(e) {
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
      const o = Sy(n.image_url.url);
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
function Ty(e) {
  switch (e) {
    case "high":
      return 4096;
    case "medium":
      return 2048;
    default:
      return 1024;
  }
}
function wy(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function Ay(e) {
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
            input: vy(s.function.arguments)
          }))]
        });
        continue;
      }
      t.push({
        role: o.role,
        content: Ey(o.content)
      });
    }
  return t;
}
function mi(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
var by = class {
  constructor(e) {
    this.config = e, this.client = new lo({
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
    })), n = wy(e), o = {
      model: this.config.model,
      system: n,
      messages: Ay(e.messages),
      tools: t,
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    !e.reasoning?.enabled && typeof e.temperature == "number" && (o.temperature = e.temperature), e.reasoning?.enabled && (o.thinking = {
      type: "enabled",
      budget_tokens: Ty(e.reasoning.effort),
      display: "summarized"
    }), _y("[LittleWhiteBox Assistant] Anthropic outgoing request", o);
    let s;
    if (typeof e.onStreamProgress == "function") {
      const a = this.client.messages.stream(o, { signal: e.signal }), u = /* @__PURE__ */ new Map(), c = () => Array.from(u.entries()).sort(([d], [p]) => d.localeCompare(p)).map(([d, p]) => ({
        label: d.startsWith("redacted:") ? "已脱敏思考块" : "思考块",
        text: p
      })).filter((d) => d.text);
      a.on("text", (d, p) => {
        mi(e, {
          text: p || "",
          thoughts: c()
        });
      }), a.on("thinking", (d, p) => {
        u.set("thinking:0", p || ""), mi(e, { thoughts: c() });
      }), a.on("contentBlock", (d) => {
        d?.type === "redacted_thinking" && (u.set("redacted:0", d.data || ""), mi(e, { thoughts: c() }));
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
}, Cy = /* @__PURE__ */ Ts(((e, t) => {
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
})), Iy = /* @__PURE__ */ Ts(((e) => {
  var t = Cy();
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
})), xy = /* @__PURE__ */ Ts(((e, t) => {
  t.exports = Iy();
})), Ry = /* @__PURE__ */ Ts(((e, t) => {
  var n = xy(), o = [
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
})), Il = /* @__PURE__ */ Kh(Ry(), 1), Py = void 0, My = void 0;
function Ny() {
  return {
    geminiUrl: Py,
    vertexUrl: My
  };
}
function ky(e, t, n, o) {
  var s, i;
  if (!e?.baseUrl) {
    const a = Ny();
    return t ? (s = a.vertexUrl) !== null && s !== void 0 ? s : n : (i = a.geminiUrl) !== null && i !== void 0 ? i : o;
  }
  return e.baseUrl;
}
var dt = class {
};
function k(e, t) {
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
function Ly(e, t) {
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
    Zi(e, s, i, 0, a);
  }
}
function Zi(e, t, n, o, s) {
  if (o >= t.length || typeof e != "object" || e === null) return;
  const i = t[o];
  if (i.endsWith("[]")) {
    const a = i.slice(0, -2), u = e;
    if (a in u && Array.isArray(u[a])) for (const c of u[a]) Zi(c, t, n, o + 1, s);
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
    i in a && Zi(a[i], t, n, o + 1, s);
  }
}
function Xr(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function Dy(e) {
  const t = {}, n = r(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const o = r(e, ["resourceName"]);
  return o != null && l(t, ["_url", "resourceName"], o), t;
}
function $y(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = r(e, ["response", "generateVideoResponse"]);
  return a != null && l(t, ["response"], Fy(a)), t;
}
function Uy(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = r(e, ["response"]);
  return a != null && l(t, ["response"], By(a)), t;
}
function Fy(e) {
  const t = {}, n = r(e, ["generatedSamples"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((a) => Gy(a))), l(t, ["generatedVideos"], i);
  }
  const o = r(e, ["raiMediaFilteredCount"]);
  o != null && l(t, ["raiMediaFilteredCount"], o);
  const s = r(e, ["raiMediaFilteredReasons"]);
  return s != null && l(t, ["raiMediaFilteredReasons"], s), t;
}
function By(e) {
  const t = {}, n = r(e, ["videos"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((a) => Oy(a))), l(t, ["generatedVideos"], i);
  }
  const o = r(e, ["raiMediaFilteredCount"]);
  o != null && l(t, ["raiMediaFilteredCount"], o);
  const s = r(e, ["raiMediaFilteredReasons"]);
  return s != null && l(t, ["raiMediaFilteredReasons"], s), t;
}
function Gy(e) {
  const t = {}, n = r(e, ["video"]);
  return n != null && l(t, ["video"], Ky(n)), t;
}
function Oy(e) {
  const t = {}, n = r(e, ["_self"]);
  return n != null && l(t, ["video"], zy(n)), t;
}
function qy(e) {
  const t = {}, n = r(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function Vy(e) {
  const t = {}, n = r(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function Hy(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = r(e, ["response"]);
  return a != null && l(t, ["response"], Jy(a)), t;
}
function Jy(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const s = r(e, ["documentName"]);
  return s != null && l(t, ["documentName"], s), t;
}
function tp(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = r(e, ["response"]);
  return a != null && l(t, ["response"], Wy(a)), t;
}
function Wy(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const s = r(e, ["documentName"]);
  return s != null && l(t, ["documentName"], s), t;
}
function Ky(e) {
  const t = {}, n = r(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const o = r(e, ["encodedVideo"]);
  o != null && l(t, ["videoBytes"], Xr(o));
  const s = r(e, ["encoding"]);
  return s != null && l(t, ["mimeType"], s), t;
}
function zy(e) {
  const t = {}, n = r(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const o = r(e, ["bytesBase64Encoded"]);
  o != null && l(t, ["videoBytes"], Xr(o));
  const s = r(e, ["mimeType"]);
  return s != null && l(t, ["mimeType"], s), t;
}
var xl;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(xl || (xl = {}));
var Rl;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(Rl || (Rl = {}));
var Pl;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(Pl || (Pl = {}));
var vt;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(vt || (vt = {}));
var Ml;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(Ml || (Ml = {}));
var Nl;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})(Nl || (Nl = {}));
var kl;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})(kl || (kl = {}));
var Ll;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(Ll || (Ll = {}));
var Dl;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(Dl || (Dl = {}));
var $l;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})($l || ($l = {}));
var Ul;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})(Ul || (Ul = {}));
var ji;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(ji || (ji = {}));
var Yn;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Yn || (Yn = {}));
var Fl;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(Fl || (Fl = {}));
var Bl;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})(Bl || (Bl = {}));
var Gl;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(Gl || (Gl = {}));
var Ol;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(Ol || (Ol = {}));
var ql;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(ql || (ql = {}));
var Vl;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})(Vl || (Vl = {}));
var Hl;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Hl || (Hl = {}));
var Jl;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(Jl || (Jl = {}));
var Wl;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(Wl || (Wl = {}));
var Kl;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(Kl || (Kl = {}));
var zl;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(zl || (zl = {}));
var ms;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(ms || (ms = {}));
var Yl;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(Yl || (Yl = {}));
var Xl;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(Xl || (Xl = {}));
var Ql;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(Ql || (Ql = {}));
var Zl;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(Zl || (Zl = {}));
var er;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(er || (er = {}));
var jl;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})(jl || (jl = {}));
var eu;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})(eu || (eu = {}));
var tu;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(tu || (tu = {}));
var nu;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(nu || (nu = {}));
var ou;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(ou || (ou = {}));
var su;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})(su || (su = {}));
var iu;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})(iu || (iu = {}));
var tr;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(tr || (tr = {}));
var ru;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})(ru || (ru = {}));
var au;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(au || (au = {}));
var gs;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(gs || (gs = {}));
var lu;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(lu || (lu = {}));
var uu;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(uu || (uu = {}));
var cu;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(cu || (cu = {}));
var du;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(du || (du = {}));
var fu;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(fu || (fu = {}));
var pu;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(pu || (pu = {}));
var hu;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(hu || (hu = {}));
var mu;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(mu || (mu = {}));
var gu;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})(gu || (gu = {}));
var yu;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(yu || (yu = {}));
var _u;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})(_u || (_u = {}));
var vu;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(vu || (vu = {}));
var Su;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(Su || (Su = {}));
var Eu;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(Eu || (Eu = {}));
var Tu;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(Tu || (Tu = {}));
var wu;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(wu || (wu = {}));
var Au;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(Au || (Au = {}));
var bu;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(bu || (bu = {}));
var Cu;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(Cu || (Cu = {}));
var Iu;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(Iu || (Iu = {}));
var xu;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(xu || (xu = {}));
var Ru;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(Ru || (Ru = {}));
var Pu;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(Pu || (Pu = {}));
var Xt;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(Xt || (Xt = {}));
var nr = class {
  constructor(e) {
    const t = {};
    for (const n of e.headers.entries()) t[n[0]] = n[1];
    this.headers = t, this.responseInternal = e;
  }
  json() {
    return this.responseInternal.json();
  }
}, In = class {
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
}, Mu = class {
}, Nu = class {
}, Yy = class {
}, Xy = class {
}, Qy = class {
}, Zy = class {
}, ku = class {
}, Lu = class {
}, Du = class {
}, jy = class {
}, $u = class np {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new np();
    let s;
    const i = t;
    return n ? s = Uy(i) : s = $y(i), Object.assign(o, s), o;
  }
}, Uu = class {
}, Fu = class {
}, Bu = class {
}, Gu = class {
}, e_ = class {
}, t_ = class {
}, n_ = class {
}, o_ = class op {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new op(), s = Hy(t);
    return Object.assign(o, s), o;
  }
}, s_ = class {
}, i_ = class {
}, r_ = class {
}, a_ = class {
}, Ou = class {
}, l_ = class {
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
}, u_ = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, c_ = class sp {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new sp(), s = tp(t);
    return Object.assign(o, s), o;
  }
};
function Q(e, t) {
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
function ip(e, t) {
  const n = Q(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function rp(e) {
  return Array.isArray(e) ? e.map((t) => ys(t)) : [ys(e)];
}
function ys(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function ap(e) {
  const t = ys(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function lp(e) {
  const t = ys(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function qu(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function up(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => qu(t)) : [qu(e)];
}
function or(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function Vu(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function Hu(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function he(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return or(e) ? e : {
    role: "user",
    parts: up(e)
  };
}
function Qr(e, t) {
  if (!t) return [];
  if (e.isVertexAI() && Array.isArray(t)) return t.flatMap((n) => {
    const o = he(n);
    return o.parts && o.parts.length > 0 && o.parts[0].text !== void 0 ? [o.parts[0].text] : [];
  });
  if (e.isVertexAI()) {
    const n = he(t);
    return n.parts && n.parts.length > 0 && n.parts[0].text !== void 0 ? [n.parts[0].text] : [];
  }
  return Array.isArray(t) ? t.map((n) => he(n)) : [he(t)];
}
function xe(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("contents are required");
  if (!Array.isArray(e)) {
    if (Vu(e) || Hu(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [he(e)];
  }
  const t = [], n = [], o = or(e[0]);
  for (const s of e) {
    const i = or(s);
    if (i != o) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (i) t.push(s);
    else {
      if (Vu(s) || Hu(s)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(s);
    }
  }
  return o || t.push({
    role: "user",
    parts: up(n)
  }), t;
}
function d_(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((o) => o !== "null");
  if (n.length === 1) t.type = Object.values(vt).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : vt.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const o of n) t.anyOf.push({ type: Object.values(vt).includes(o.toUpperCase()) ? o.toUpperCase() : vt.TYPE_UNSPECIFIED });
  }
}
function jt(e) {
  const t = {}, n = ["items"], o = ["anyOf"], s = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const i = e.anyOf;
  i != null && i.length == 2 && (i[0].type === "null" ? (t.nullable = !0, e = i[1]) : i[1].type === "null" && (t.nullable = !0, e = i[0])), e.type instanceof Array && d_(e.type, t);
  for (const [a, u] of Object.entries(e))
    if (u != null)
      if (a == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(vt).includes(u.toUpperCase()) ? u.toUpperCase() : vt.TYPE_UNSPECIFIED;
      } else if (n.includes(a)) t[a] = jt(u);
      else if (o.includes(a)) {
        const c = [];
        for (const d of u) {
          if (d.type == "null") {
            t.nullable = !0;
            continue;
          }
          c.push(jt(d));
        }
        t[a] = c;
      } else if (s.includes(a)) {
        const c = {};
        for (const [d, p] of Object.entries(u)) c[d] = jt(p);
        t[a] = c;
      } else {
        if (a === "additionalProperties") continue;
        t[a] = u;
      }
  return t;
}
function Zr(e) {
  return jt(e);
}
function jr(e) {
  if (typeof e == "object") return e;
  if (typeof e == "string") return { voiceConfig: { prebuiltVoiceConfig: { voiceName: e } } };
  throw new Error(`Unsupported speechConfig type: ${typeof e}`);
}
function ea(e) {
  if ("multiSpeakerVoiceConfig" in e) throw new Error("multiSpeakerVoiceConfig is not supported in the live API.");
  return e;
}
function on(e) {
  if (e.functionDeclarations) for (const t of e.functionDeclarations)
    t.parameters && (Object.keys(t.parameters).includes("$schema") ? t.parametersJsonSchema || (t.parametersJsonSchema = t.parameters, delete t.parameters) : t.parameters = jt(t.parameters)), t.response && (Object.keys(t.response).includes("$schema") ? t.responseJsonSchema || (t.responseJsonSchema = t.response, delete t.response) : t.response = jt(t.response));
  return e;
}
function sn(e) {
  if (e == null) throw new Error("tools is required");
  if (!Array.isArray(e)) throw new Error("tools is required and must be an array of Tools");
  const t = [];
  for (const n of e) t.push(n);
  return t;
}
function f_(e, t, n, o = 1) {
  const s = !t.startsWith(`${n}/`) && t.split("/").length === o;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : s ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : s ? `${n}/${t}` : t;
}
function ft(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return f_(e, t, "cachedContents");
}
function cp(e) {
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
function Et(e) {
  return Xr(e);
}
function p_(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function h_(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function m_(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function dp(e) {
  var t;
  let n;
  if (p_(e) && (n = e.name), !(m_(e) && (n = e.uri, n === void 0)) && !(h_(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const o = n.split("files/")[1].match(/[a-z0-9]+/);
      if (o === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = o[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function fp(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function pp(e) {
  for (const t of [
    "models",
    "tunedModels",
    "publisherModels"
  ]) if (g_(e, t)) return e[t];
  return [];
}
function g_(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function y_(e, t = {}) {
  const n = e, o = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (o.responseJsonSchema = n.outputSchema), t.behavior && (o.behavior = t.behavior), { functionDeclarations: [o] };
}
function __(e, t = {}) {
  const n = [], o = /* @__PURE__ */ new Set();
  for (const s of e) {
    const i = s.name;
    if (o.has(i)) throw new Error(`Duplicate function name ${i} found in MCP tools. Please ensure function names are unique.`);
    o.add(i);
    const a = y_(s, t);
    a.functionDeclarations && n.push(...a.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function hp(e, t) {
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
function v_(e) {
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
function mp(e) {
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
function rn(e, t) {
  const n = t;
  if (!e.isVertexAI()) {
    if (/batches\/[^/]+$/.test(n)) return n.split("/").pop();
    throw new Error(`Invalid batch job name: ${n}.`);
  }
  if (/^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/.test(n)) return n.split("/").pop();
  if (/^\d+$/.test(n)) return n;
  throw new Error(`Invalid batch job name: ${n}.`);
}
function gp(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function S_(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function E_(e) {
  const t = {}, n = r(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function T_(e) {
  const t = {}, n = r(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const o = r(e, ["inlinedResponses", "inlinedResponses"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => nv(a))), l(t, ["inlinedResponses"], i);
  }
  const s = r(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["inlinedEmbedContentResponses"], i);
  }
  return t;
}
function w_(e) {
  const t = {}, n = r(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const o = r(e, ["gcsDestination", "outputUriPrefix"]);
  o != null && l(t, ["gcsUri"], o);
  const s = r(e, ["bigqueryDestination", "outputUri"]);
  return s != null && l(t, ["bigqueryUri"], s), t;
}
function A_(e) {
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
function ts(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["metadata", "displayName"]);
  o != null && l(t, ["displayName"], o);
  const s = r(e, ["metadata", "state"]);
  s != null && l(t, ["state"], gp(s));
  const i = r(e, ["metadata", "createTime"]);
  i != null && l(t, ["createTime"], i);
  const a = r(e, ["metadata", "endTime"]);
  a != null && l(t, ["endTime"], a);
  const u = r(e, ["metadata", "updateTime"]);
  u != null && l(t, ["updateTime"], u);
  const c = r(e, ["metadata", "model"]);
  c != null && l(t, ["model"], c);
  const d = r(e, ["metadata", "output"]);
  return d != null && l(t, ["dest"], T_(mp(d))), t;
}
function sr(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["displayName"]);
  o != null && l(t, ["displayName"], o);
  const s = r(e, ["state"]);
  s != null && l(t, ["state"], gp(s));
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
  f != null && l(t, ["src"], b_(f));
  const h = r(e, ["outputConfig"]);
  h != null && l(t, ["dest"], w_(mp(h)));
  const m = r(e, ["completionStats"]);
  return m != null && l(t, ["completionStats"], m), t;
}
function b_(e) {
  const t = {}, n = r(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const o = r(e, ["gcsSource", "uris"]);
  o != null && l(t, ["gcsUri"], o);
  const s = r(e, ["bigquerySource", "inputUri"]);
  return s != null && l(t, ["bigqueryUri"], s), t;
}
function C_(e, t) {
  const n = {};
  if (r(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (r(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (r(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const o = r(t, ["fileName"]);
  o != null && l(n, ["fileName"], o);
  const s = r(t, ["inlinedRequests"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => tv(e, a))), l(n, ["requests", "requests"], i);
  }
  return n;
}
function I_(e) {
  const t = {}, n = r(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const o = r(e, ["gcsUri"]);
  o != null && l(t, ["gcsSource", "uris"], o);
  const s = r(e, ["bigqueryUri"]);
  if (s != null && l(t, ["bigquerySource", "inputUri"], s), r(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (r(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function x_(e) {
  const t = {}, n = r(e, ["data"]);
  if (n != null && l(t, ["data"], n), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function R_(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], rn(e, o)), n;
}
function P_(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], rn(e, o)), n;
}
function M_(e) {
  const t = {}, n = r(e, ["content"]);
  n != null && l(t, ["content"], n);
  const o = r(e, ["citationMetadata"]);
  o != null && l(t, ["citationMetadata"], N_(o));
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
function N_(e) {
  const t = {}, n = r(e, ["citationSources"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["citations"], o);
  }
  return t;
}
function yp(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((i) => uv(i))), l(t, ["parts"], s);
  }
  const o = r(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function k_(e, t) {
  const n = {}, o = r(e, ["displayName"]);
  if (t !== void 0 && o != null && l(t, ["batch", "displayName"], o), r(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const s = r(e, ["webhookConfig"]);
  return t !== void 0 && s != null && l(t, ["batch", "webhookConfig"], s), n;
}
function L_(e, t) {
  const n = {}, o = r(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const s = r(e, ["dest"]);
  if (t !== void 0 && s != null && l(t, ["outputConfig"], A_(v_(s))), r(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function Ju(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["_url", "model"], Q(e, o));
  const s = r(t, ["src"]);
  s != null && l(n, ["batch", "inputConfig"], C_(e, hp(e, s)));
  const i = r(t, ["config"]);
  return i != null && k_(i, n), n;
}
function D_(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["model"], Q(e, o));
  const s = r(t, ["src"]);
  s != null && l(n, ["inputConfig"], I_(hp(e, s)));
  const i = r(t, ["config"]);
  return i != null && L_(i, n), n;
}
function $_(e, t) {
  const n = {}, o = r(e, ["displayName"]);
  return t !== void 0 && o != null && l(t, ["batch", "displayName"], o), n;
}
function U_(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["_url", "model"], Q(e, o));
  const s = r(t, ["src"]);
  s != null && l(n, ["batch", "inputConfig"], H_(e, s));
  const i = r(t, ["config"]);
  return i != null && $_(i, n), n;
}
function F_(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], rn(e, o)), n;
}
function B_(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], rn(e, o)), n;
}
function G_(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["name"]);
  o != null && l(t, ["name"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function O_(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["name"]);
  o != null && l(t, ["name"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function q_(e, t) {
  const n = {}, o = r(t, ["contents"]);
  if (o != null) {
    let i = Qr(e, o);
    Array.isArray(i) && (i = i.map((a) => a)), l(n, [
      "requests[]",
      "request",
      "content"
    ], i);
  }
  const s = r(t, ["config"]);
  return s != null && (l(n, ["_self"], V_(s, n)), Ly(n, { "requests[].*": "requests[].request.*" })), n;
}
function V_(e, t) {
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
function H_(e, t) {
  const n = {}, o = r(t, ["fileName"]);
  o != null && l(n, ["file_name"], o);
  const s = r(t, ["inlinedRequests"]);
  return s != null && l(n, ["requests"], q_(e, s)), n;
}
function J_(e) {
  const t = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = r(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function W_(e) {
  const t = {}, n = r(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = r(e, ["args"]);
  o != null && l(t, ["args"], o);
  const s = r(e, ["name"]);
  if (s != null && l(t, ["name"], s), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function K_(e) {
  const t = {}, n = r(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const o = r(e, ["mode"]);
  if (o != null && l(t, ["mode"], o), r(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function z_(e, t, n) {
  const o = {}, s = r(t, ["systemInstruction"]);
  n !== void 0 && s != null && l(n, ["systemInstruction"], yp(he(s)));
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
  const C = r(t, ["responseSchema"]);
  C != null && l(o, ["responseSchema"], Zr(C));
  const b = r(t, ["responseJsonSchema"]);
  if (b != null && l(o, ["responseJsonSchema"], b), r(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (r(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const x = r(t, ["safetySettings"]);
  if (n !== void 0 && x != null) {
    let se = x;
    Array.isArray(se) && (se = se.map((te) => cv(te))), l(n, ["safetySettings"], se);
  }
  const M = r(t, ["tools"]);
  if (n !== void 0 && M != null) {
    let se = sn(M);
    Array.isArray(se) && (se = se.map((te) => fv(on(te)))), l(n, ["tools"], se);
  }
  const $ = r(t, ["toolConfig"]);
  if (n !== void 0 && $ != null && l(n, ["toolConfig"], dv($)), r(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const T = r(t, ["cachedContent"]);
  n !== void 0 && T != null && l(n, ["cachedContent"], ft(e, T));
  const F = r(t, ["responseModalities"]);
  F != null && l(o, ["responseModalities"], F);
  const P = r(t, ["mediaResolution"]);
  P != null && l(o, ["mediaResolution"], P);
  const D = r(t, ["speechConfig"]);
  if (D != null && l(o, ["speechConfig"], jr(D)), r(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const W = r(t, ["thinkingConfig"]);
  W != null && l(o, ["thinkingConfig"], W);
  const X = r(t, ["imageConfig"]);
  X != null && l(o, ["imageConfig"], ev(X));
  const me = r(t, ["enableEnhancedCivicAnswers"]);
  if (me != null && l(o, ["enableEnhancedCivicAnswers"], me), r(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const ge = r(t, ["serviceTier"]);
  return n !== void 0 && ge != null && l(n, ["serviceTier"], ge), o;
}
function Y_(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["candidates"]);
  if (o != null) {
    let d = o;
    Array.isArray(d) && (d = d.map((p) => M_(p))), l(t, ["candidates"], d);
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
function X_(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], rn(e, o)), n;
}
function Q_(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], rn(e, o)), n;
}
function Z_(e) {
  const t = {}, n = r(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], E_(n));
  const o = r(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function j_(e) {
  const t = {}, n = r(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = r(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function ev(e) {
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
function tv(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["request", "model"], Q(e, o));
  const s = r(t, ["contents"]);
  if (s != null) {
    let u = xe(s);
    Array.isArray(u) && (u = u.map((c) => yp(c))), l(n, ["request", "contents"], u);
  }
  const i = r(t, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const a = r(t, ["config"]);
  return a != null && l(n, ["request", "generationConfig"], z_(e, a, r(n, ["request"], {}))), n;
}
function nv(e) {
  const t = {}, n = r(e, ["response"]);
  n != null && l(t, ["response"], Y_(n));
  const o = r(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = r(e, ["error"]);
  return s != null && l(t, ["error"], s), t;
}
function ov(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  if (t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), r(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function sv(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  t !== void 0 && s != null && l(t, ["_query", "pageToken"], s);
  const i = r(e, ["filter"]);
  return t !== void 0 && i != null && l(t, ["_query", "filter"], i), n;
}
function iv(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && ov(n, t), t;
}
function rv(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && sv(n, t), t;
}
function av(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const s = r(e, ["operations"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => ts(a))), l(t, ["batchJobs"], i);
  }
  return t;
}
function lv(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const s = r(e, ["batchPredictionJobs"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => sr(a))), l(t, ["batchJobs"], i);
  }
  return t;
}
function uv(e) {
  const t = {}, n = r(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = r(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const s = r(e, ["executableCode"]);
  s != null && l(t, ["executableCode"], s);
  const i = r(e, ["fileData"]);
  i != null && l(t, ["fileData"], J_(i));
  const a = r(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], W_(a));
  const u = r(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = r(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], x_(c));
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
function cv(e) {
  const t = {}, n = r(e, ["category"]);
  if (n != null && l(t, ["category"], n), r(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = r(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function dv(e) {
  const t = {}, n = r(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = r(e, ["functionCallingConfig"]);
  o != null && l(t, ["functionCallingConfig"], K_(o));
  const s = r(e, ["includeServerSideToolInvocations"]);
  return s != null && l(t, ["includeServerSideToolInvocations"], s), t;
}
function fv(e) {
  const t = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = r(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = r(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const s = r(e, ["googleSearch"]);
  s != null && l(t, ["googleSearch"], j_(s));
  const i = r(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], Z_(i));
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
var ct;
(function(e) {
  e.PAGED_ITEM_BATCH_JOBS = "batchJobs", e.PAGED_ITEM_MODELS = "models", e.PAGED_ITEM_TUNING_JOBS = "tuningJobs", e.PAGED_ITEM_FILES = "files", e.PAGED_ITEM_CACHED_CONTENTS = "cachedContents", e.PAGED_ITEM_FILE_SEARCH_STORES = "fileSearchStores", e.PAGED_ITEM_DOCUMENTS = "documents";
})(ct || (ct = {}));
var Dt = class {
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
}, pv = class extends dt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Dt(ct.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = Ju(this.apiClient, e), n = t._url, o = k("{model}:batchGenerateContent", n), s = t.batch.inputConfig.requests, i = s.requests, a = [];
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
      const c = D_(this.apiClient, e);
      return a = k("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => sr(d));
    } else {
      const c = Ju(this.apiClient, e);
      return a = k("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), i.then((d) => ts(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = U_(this.apiClient, e);
      return s = k("{model}:asyncBatchEmbedContent", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => ts(u));
    }
  }
  async get(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Q_(this.apiClient, e);
      return a = k("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => sr(d));
    } else {
      const c = X_(this.apiClient, e);
      return a = k("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), i.then((d) => ts(d));
    }
  }
  async cancel(e) {
    var t, n, o, s;
    let i = "", a = {};
    if (this.apiClient.isVertexAI()) {
      const u = P_(this.apiClient, e);
      i = k("batchPredictionJobs/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: i,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = R_(this.apiClient, e);
      i = k("batches/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
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
      const c = rv(e);
      return a = k("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = lv(d), f = new Ou();
        return Object.assign(f, p), f;
      });
    } else {
      const c = iv(e);
      return a = k("batches", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = av(d), f = new Ou();
        return Object.assign(f, p), f;
      });
    }
  }
  async delete(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = B_(this.apiClient, e);
      return a = k("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => O_(d));
    } else {
      const c = F_(this.apiClient, e);
      return a = k("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => G_(d));
    }
  }
};
function hv(e) {
  const t = {}, n = r(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function mv(e) {
  const t = {}, n = r(e, ["data"]);
  if (n != null && l(t, ["data"], n), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Wu(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((i) => Fv(i))), l(t, ["parts"], s);
  }
  const o = r(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function Ku(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((i) => Bv(i))), l(t, ["parts"], s);
  }
  const o = r(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function gv(e, t) {
  const n = {}, o = r(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const s = r(e, ["expireTime"]);
  t !== void 0 && s != null && l(t, ["expireTime"], s);
  const i = r(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const a = r(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let p = xe(a);
    Array.isArray(p) && (p = p.map((f) => Wu(f))), l(t, ["contents"], p);
  }
  const u = r(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Wu(he(u)));
  const c = r(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((f) => qv(f))), l(t, ["tools"], p);
  }
  const d = r(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], Gv(d)), r(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function yv(e, t) {
  const n = {}, o = r(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const s = r(e, ["expireTime"]);
  t !== void 0 && s != null && l(t, ["expireTime"], s);
  const i = r(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const a = r(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let f = xe(a);
    Array.isArray(f) && (f = f.map((h) => Ku(h))), l(t, ["contents"], f);
  }
  const u = r(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Ku(he(u)));
  const c = r(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((h) => Vv(h))), l(t, ["tools"], f);
  }
  const d = r(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], Ov(d));
  const p = r(e, ["kmsKeyName"]);
  return t !== void 0 && p != null && l(t, ["encryption_spec", "kmsKeyName"], p), n;
}
function _v(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["model"], ip(e, o));
  const s = r(t, ["config"]);
  return s != null && gv(s, n), n;
}
function vv(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["model"], ip(e, o));
  const s = r(t, ["config"]);
  return s != null && yv(s, n), n;
}
function Sv(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ft(e, o)), n;
}
function Ev(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ft(e, o)), n;
}
function Tv(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function wv(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Av(e) {
  const t = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = r(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function bv(e) {
  const t = {}, n = r(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = r(e, ["args"]);
  o != null && l(t, ["args"], o);
  const s = r(e, ["name"]);
  if (s != null && l(t, ["name"], s), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Cv(e) {
  const t = {}, n = r(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const o = r(e, ["mode"]);
  if (o != null && l(t, ["mode"], o), r(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function Iv(e) {
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
function xv(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ft(e, o)), n;
}
function Rv(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ft(e, o)), n;
}
function Pv(e) {
  const t = {}, n = r(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], hv(n));
  const o = r(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function Mv(e) {
  const t = {}, n = r(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = r(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function Nv(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function kv(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function Lv(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && Nv(n, t), t;
}
function Dv(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && kv(n, t), t;
}
function $v(e) {
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
function Uv(e) {
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
function Fv(e) {
  const t = {}, n = r(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = r(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const s = r(e, ["executableCode"]);
  s != null && l(t, ["executableCode"], s);
  const i = r(e, ["fileData"]);
  i != null && l(t, ["fileData"], Av(i));
  const a = r(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], bv(a));
  const u = r(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = r(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], mv(c));
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
function Bv(e) {
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
function Gv(e) {
  const t = {}, n = r(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = r(e, ["functionCallingConfig"]);
  o != null && l(t, ["functionCallingConfig"], Cv(o));
  const s = r(e, ["includeServerSideToolInvocations"]);
  return s != null && l(t, ["includeServerSideToolInvocations"], s), t;
}
function Ov(e) {
  const t = {}, n = r(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = r(e, ["functionCallingConfig"]);
  if (o != null && l(t, ["functionCallingConfig"], o), r(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function qv(e) {
  const t = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = r(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = r(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const s = r(e, ["googleSearch"]);
  s != null && l(t, ["googleSearch"], Mv(s));
  const i = r(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], Pv(i));
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
function Vv(e) {
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
    Array.isArray(h) && (h = h.map((m) => Iv(m))), l(t, ["functionDeclarations"], h);
  }
  const d = r(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const p = r(e, ["parallelAiSearch"]);
  p != null && l(t, ["parallelAiSearch"], p);
  const f = r(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), r(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function Hv(e, t) {
  const n = {}, o = r(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const s = r(e, ["expireTime"]);
  return t !== void 0 && s != null && l(t, ["expireTime"], s), n;
}
function Jv(e, t) {
  const n = {}, o = r(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const s = r(e, ["expireTime"]);
  return t !== void 0 && s != null && l(t, ["expireTime"], s), n;
}
function Wv(e, t) {
  const n = {}, o = r(t, ["name"]);
  o != null && l(n, ["_url", "name"], ft(e, o));
  const s = r(t, ["config"]);
  return s != null && Hv(s, n), n;
}
function Kv(e, t) {
  const n = {}, o = r(t, ["name"]);
  o != null && l(n, ["_url", "name"], ft(e, o));
  const s = r(t, ["config"]);
  return s != null && Jv(s, n), n;
}
var zv = class extends dt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Dt(ct.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = vv(this.apiClient, e);
      return a = k("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = _v(this.apiClient, e);
      return a = k("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
      const c = Rv(this.apiClient, e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = xv(this.apiClient, e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
      const c = Ev(this.apiClient, e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = wv(d), f = new Bu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = Sv(this.apiClient, e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = Tv(d), f = new Bu();
        return Object.assign(f, p), f;
      });
    }
  }
  async update(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Kv(this.apiClient, e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = Wv(this.apiClient, e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
      const c = Dv(e);
      return a = k("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = Uv(d), f = new Gu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = Lv(e);
      return a = k("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = $v(d), f = new Gu();
        return Object.assign(f, p), f;
      });
    }
  }
};
function St(e, t) {
  var n = {};
  for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var s = 0, o = Object.getOwnPropertySymbols(e); s < o.length; s++) t.indexOf(o[s]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[s]) && (n[o[s]] = e[o[s]]);
  return n;
}
function zu(e) {
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
function K(e) {
  return this instanceof K ? (this.v = e, this) : new K(e);
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
      return new Promise(function(_, C) {
        i.push([
          m,
          y,
          _,
          C
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
    m.value instanceof K ? Promise.resolve(m.value.v).then(p, f) : h(i[0][2], m);
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
  return t ? t.call(e) : (e = typeof zu == "function" ? zu(e) : e[Symbol.iterator](), n = {}, o("next"), o("throw"), o("return"), n[Symbol.asyncIterator] = function() {
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
function Yv(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : _p(n);
}
function _p(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function Xv(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function Yu(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let o = 0;
  for (; o < n; ) if (e[o].role === "user")
    t.push(e[o]), o++;
  else {
    const s = [];
    let i = !0;
    for (; o < n && e[o].role === "model"; )
      s.push(e[o]), i && !_p(e[o]) && (i = !1), o++;
    i ? t.push(...s) : t.pop();
  }
  return t;
}
var Qv = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new Zv(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, Zv = class {
  constructor(e, t, n, o = {}, s = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = o, this.history = s, this.sendPromise = Promise.resolve(), Xv(s);
  }
  async sendMessage(e) {
    var t;
    await this.sendPromise;
    const n = he(e.message), o = this.modelsModule.generateContent({
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
    const n = he(e.message), o = this.modelsModule.generateContentStream({
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
    const t = e ? Yu(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return ze(this, arguments, function* () {
      var o, s, i, a, u, c;
      const d = [];
      try {
        for (var p = !0, f = Ye(e), h; h = yield K(f.next()), o = h.done, !o; p = !0) {
          a = h.value, p = !1;
          const m = a;
          if (Yv(m)) {
            const g = (c = (u = m.candidates) === null || u === void 0 ? void 0 : u[0]) === null || c === void 0 ? void 0 : c.content;
            g !== void 0 && d.push(g);
          }
          yield yield K(m);
        }
      } catch (m) {
        s = { error: m };
      } finally {
        try {
          !p && !o && (i = f.return) && (yield K(i.call(f)));
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
    }), n && n.length > 0 ? this.history.push(...Yu(n)) : this.history.push(e), this.history.push(...o);
  }
}, vp = class Sp extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, Sp.prototype);
  }
};
function jv(e) {
  const t = {}, n = r(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function eS(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function tS(e) {
  const t = {}, n = r(e, ["name"]);
  return n != null && l(t, ["_url", "file"], dp(n)), t;
}
function nS(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function oS(e) {
  const t = {}, n = r(e, ["name"]);
  return n != null && l(t, ["_url", "file"], dp(n)), t;
}
function sS(e) {
  const t = {}, n = r(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function iS(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function rS(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && iS(n, t), t;
}
function aS(e) {
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
function lS(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["files"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((i) => i)), l(t, ["files"], s);
  }
  return t;
}
var uS = class extends dt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Dt(ct.PAGED_ITEM_FILES, (n) => this.listInternal(n), await this.listInternal(t), t);
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
      const a = rS(e);
      return s = k("files", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
        const c = aS(u), d = new s_();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = jv(e);
      return s = k("upload/v1beta/files", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = eS(u), d = new i_();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = oS(e);
      return s = k("files/{file}", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
      const a = tS(e);
      return s = k("files/{file}", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
        const c = nS(u), d = new r_();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = sS(e);
      return s = k("files:register", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = lS(u), d = new a_();
        return Object.assign(d, c), d;
      });
    }
  }
};
function Xu(e) {
  const t = {};
  if (r(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function cS(e) {
  const t = {}, n = r(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function ns(e) {
  const t = {}, n = r(e, ["data"]);
  if (n != null && l(t, ["data"], n), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function dS(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((i) => xS(i))), l(t, ["parts"], s);
  }
  const o = r(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function fS(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((i) => RS(i))), l(t, ["parts"], s);
  }
  const o = r(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function pS(e) {
  const t = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = r(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function hS(e) {
  const t = {}, n = r(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = r(e, ["args"]);
  o != null && l(t, ["args"], o);
  const s = r(e, ["name"]);
  if (s != null && l(t, ["name"], s), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function mS(e) {
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
function gS(e) {
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
  const C = r(e, ["seed"]);
  C != null && l(t, ["seed"], C);
  const b = r(e, ["speechConfig"]);
  b != null && l(t, ["speechConfig"], b);
  const x = r(e, ["stopSequences"]);
  x != null && l(t, ["stopSequences"], x);
  const M = r(e, ["temperature"]);
  M != null && l(t, ["temperature"], M);
  const $ = r(e, ["thinkingConfig"]);
  $ != null && l(t, ["thinkingConfig"], $);
  const T = r(e, ["topK"]);
  T != null && l(t, ["topK"], T);
  const F = r(e, ["topP"]);
  if (F != null && l(t, ["topP"], F), r(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return t;
}
function yS(e) {
  const t = {}, n = r(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], cS(n));
  const o = r(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function _S(e) {
  const t = {}, n = r(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = r(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function vS(e, t) {
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
  ], ea(f));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], dS(he(g)));
  const y = r(e, ["tools"]);
  if (t !== void 0 && y != null) {
    let P = sn(y);
    Array.isArray(P) && (P = P.map((D) => NS(on(D)))), l(t, ["setup", "tools"], P);
  }
  const _ = r(e, ["sessionResumption"]);
  t !== void 0 && _ != null && l(t, ["setup", "sessionResumption"], MS(_));
  const C = r(e, ["inputAudioTranscription"]);
  t !== void 0 && C != null && l(t, ["setup", "inputAudioTranscription"], Xu(C));
  const b = r(e, ["outputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "outputAudioTranscription"], Xu(b));
  const x = r(e, ["realtimeInputConfig"]);
  t !== void 0 && x != null && l(t, ["setup", "realtimeInputConfig"], x);
  const M = r(e, ["contextWindowCompression"]);
  t !== void 0 && M != null && l(t, ["setup", "contextWindowCompression"], M);
  const $ = r(e, ["proactivity"]);
  if (t !== void 0 && $ != null && l(t, ["setup", "proactivity"], $), r(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const T = r(e, ["avatarConfig"]);
  t !== void 0 && T != null && l(t, ["setup", "avatarConfig"], T);
  const F = r(e, ["safetySettings"]);
  if (t !== void 0 && F != null) {
    let P = F;
    Array.isArray(P) && (P = P.map((D) => PS(D))), l(t, ["setup", "safetySettings"], P);
  }
  return n;
}
function SS(e, t) {
  const n = {}, o = r(e, ["generationConfig"]);
  t !== void 0 && o != null && l(t, ["setup", "generationConfig"], gS(o));
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
  ], ea(f));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], fS(he(g)));
  const y = r(e, ["tools"]);
  if (t !== void 0 && y != null) {
    let D = sn(y);
    Array.isArray(D) && (D = D.map((W) => kS(on(W)))), l(t, ["setup", "tools"], D);
  }
  const _ = r(e, ["sessionResumption"]);
  t !== void 0 && _ != null && l(t, ["setup", "sessionResumption"], _);
  const C = r(e, ["inputAudioTranscription"]);
  t !== void 0 && C != null && l(t, ["setup", "inputAudioTranscription"], C);
  const b = r(e, ["outputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "outputAudioTranscription"], b);
  const x = r(e, ["realtimeInputConfig"]);
  t !== void 0 && x != null && l(t, ["setup", "realtimeInputConfig"], x);
  const M = r(e, ["contextWindowCompression"]);
  t !== void 0 && M != null && l(t, ["setup", "contextWindowCompression"], M);
  const $ = r(e, ["proactivity"]);
  t !== void 0 && $ != null && l(t, ["setup", "proactivity"], $);
  const T = r(e, ["explicitVadSignal"]);
  t !== void 0 && T != null && l(t, ["setup", "explicitVadSignal"], T);
  const F = r(e, ["avatarConfig"]);
  t !== void 0 && F != null && l(t, ["setup", "avatarConfig"], F);
  const P = r(e, ["safetySettings"]);
  if (t !== void 0 && P != null) {
    let D = P;
    Array.isArray(D) && (D = D.map((W) => W)), l(t, ["setup", "safetySettings"], D);
  }
  return n;
}
function ES(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["setup", "model"], Q(e, o));
  const s = r(t, ["config"]);
  return s != null && l(n, ["config"], vS(s, n)), n;
}
function TS(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["setup", "model"], Q(e, o));
  const s = r(t, ["config"]);
  return s != null && l(n, ["config"], SS(s, n)), n;
}
function wS(e) {
  const t = {}, n = r(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function AS(e) {
  const t = {}, n = r(e, ["weightedPrompts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["weightedPrompts"], o);
  }
  return t;
}
function bS(e) {
  const t = {}, n = r(e, ["media"]);
  if (n != null) {
    let d = rp(n);
    Array.isArray(d) && (d = d.map((p) => ns(p))), l(t, ["mediaChunks"], d);
  }
  const o = r(e, ["audio"]);
  o != null && l(t, ["audio"], ns(lp(o)));
  const s = r(e, ["audioStreamEnd"]);
  s != null && l(t, ["audioStreamEnd"], s);
  const i = r(e, ["video"]);
  i != null && l(t, ["video"], ns(ap(i)));
  const a = r(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = r(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = r(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function CS(e) {
  const t = {}, n = r(e, ["media"]);
  if (n != null) {
    let d = rp(n);
    Array.isArray(d) && (d = d.map((p) => p)), l(t, ["mediaChunks"], d);
  }
  const o = r(e, ["audio"]);
  o != null && l(t, ["audio"], lp(o));
  const s = r(e, ["audioStreamEnd"]);
  s != null && l(t, ["audioStreamEnd"], s);
  const i = r(e, ["video"]);
  i != null && l(t, ["video"], ap(i));
  const a = r(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = r(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = r(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function IS(e) {
  const t = {}, n = r(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const o = r(e, ["serverContent"]);
  o != null && l(t, ["serverContent"], o);
  const s = r(e, ["toolCall"]);
  s != null && l(t, ["toolCall"], s);
  const i = r(e, ["toolCallCancellation"]);
  i != null && l(t, ["toolCallCancellation"], i);
  const a = r(e, ["usageMetadata"]);
  a != null && l(t, ["usageMetadata"], LS(a));
  const u = r(e, ["goAway"]);
  u != null && l(t, ["goAway"], u);
  const c = r(e, ["sessionResumptionUpdate"]);
  c != null && l(t, ["sessionResumptionUpdate"], c);
  const d = r(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const p = r(e, ["voiceActivity"]);
  return p != null && l(t, ["voiceActivity"], DS(p)), t;
}
function xS(e) {
  const t = {}, n = r(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = r(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const s = r(e, ["executableCode"]);
  s != null && l(t, ["executableCode"], s);
  const i = r(e, ["fileData"]);
  i != null && l(t, ["fileData"], pS(i));
  const a = r(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], hS(a));
  const u = r(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = r(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], ns(c));
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
function RS(e) {
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
function PS(e) {
  const t = {}, n = r(e, ["category"]);
  if (n != null && l(t, ["category"], n), r(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = r(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function MS(e) {
  const t = {}, n = r(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), r(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function NS(e) {
  const t = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = r(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = r(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const s = r(e, ["googleSearch"]);
  s != null && l(t, ["googleSearch"], _S(s));
  const i = r(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], yS(i));
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
function kS(e) {
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
    Array.isArray(h) && (h = h.map((m) => mS(m))), l(t, ["functionDeclarations"], h);
  }
  const d = r(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const p = r(e, ["parallelAiSearch"]);
  p != null && l(t, ["parallelAiSearch"], p);
  const f = r(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), r(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function LS(e) {
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
function DS(e) {
  const t = {}, n = r(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function $S(e, t) {
  const n = {}, o = r(e, ["apiKey"]);
  if (o != null && l(n, ["apiKey"], o), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function US(e, t) {
  const n = {}, o = r(e, ["data"]);
  if (o != null && l(n, ["data"], o), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const s = r(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function FS(e, t) {
  const n = {}, o = r(e, ["content"]);
  o != null && l(n, ["content"], o);
  const s = r(e, ["citationMetadata"]);
  s != null && l(n, ["citationMetadata"], BS(s));
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
function BS(e, t) {
  const n = {}, o = r(e, ["citationSources"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((i) => i)), l(n, ["citations"], s);
  }
  return n;
}
function GS(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], Q(e, s));
  const i = r(t, ["contents"]);
  if (i != null) {
    let a = xe(i);
    Array.isArray(a) && (a = a.map((u) => an(u))), l(o, ["contents"], a);
  }
  return o;
}
function OS(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["tokensInfo"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => a)), l(n, ["tokensInfo"], i);
  }
  return n;
}
function qS(e, t) {
  const n = {}, o = r(e, ["values"]);
  o != null && l(n, ["values"], o);
  const s = r(e, ["statistics"]);
  return s != null && l(n, ["statistics"], VS(s)), n;
}
function VS(e, t) {
  const n = {}, o = r(e, ["truncated"]);
  o != null && l(n, ["truncated"], o);
  const s = r(e, ["token_count"]);
  return s != null && l(n, ["tokenCount"], s), n;
}
function uo(e, t) {
  const n = {}, o = r(e, ["parts"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => ZE(a))), l(n, ["parts"], i);
  }
  const s = r(e, ["role"]);
  return s != null && l(n, ["role"], s), n;
}
function an(e, t) {
  const n = {}, o = r(e, ["parts"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => jE(a))), l(n, ["parts"], i);
  }
  const s = r(e, ["role"]);
  return s != null && l(n, ["role"], s), n;
}
function HS(e, t) {
  const n = {}, o = r(e, ["controlType"]);
  o != null && l(n, ["controlType"], o);
  const s = r(e, ["enableControlImageComputation"]);
  return s != null && l(n, ["computeControl"], s), n;
}
function JS(e, t) {
  const n = {};
  if (r(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (r(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (r(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function WS(e, t, n) {
  const o = {}, s = r(e, ["systemInstruction"]);
  t !== void 0 && s != null && l(t, ["systemInstruction"], an(he(s)));
  const i = r(e, ["tools"]);
  if (t !== void 0 && i != null) {
    let u = i;
    Array.isArray(u) && (u = u.map((c) => Ap(c))), l(t, ["tools"], u);
  }
  const a = r(e, ["generationConfig"]);
  return t !== void 0 && a != null && l(t, ["generationConfig"], UE(a)), o;
}
function KS(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], Q(e, s));
  const i = r(t, ["contents"]);
  if (i != null) {
    let u = xe(i);
    Array.isArray(u) && (u = u.map((c) => uo(c))), l(o, ["contents"], u);
  }
  const a = r(t, ["config"]);
  return a != null && JS(a), o;
}
function zS(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], Q(e, s));
  const i = r(t, ["contents"]);
  if (i != null) {
    let u = xe(i);
    Array.isArray(u) && (u = u.map((c) => an(c))), l(o, ["contents"], u);
  }
  const a = r(t, ["config"]);
  return a != null && WS(a, o), o;
}
function YS(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["totalTokens"]);
  s != null && l(n, ["totalTokens"], s);
  const i = r(e, ["cachedContentTokenCount"]);
  return i != null && l(n, ["cachedContentTokenCount"], i), n;
}
function XS(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["totalTokens"]);
  return s != null && l(n, ["totalTokens"], s), n;
}
function QS(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  return s != null && l(o, ["_url", "name"], Q(e, s)), o;
}
function ZS(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  return s != null && l(o, ["_url", "name"], Q(e, s)), o;
}
function jS(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function eE(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function tE(e, t, n) {
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
  const C = r(e, ["addWatermark"]);
  t !== void 0 && C != null && l(t, ["parameters", "addWatermark"], C);
  const b = r(e, ["labels"]);
  t !== void 0 && b != null && l(t, ["labels"], b);
  const x = r(e, ["editMode"]);
  t !== void 0 && x != null && l(t, ["parameters", "editMode"], x);
  const M = r(e, ["baseSteps"]);
  return t !== void 0 && M != null && l(t, [
    "parameters",
    "editConfig",
    "baseSteps"
  ], M), o;
}
function nE(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], Q(e, s));
  const i = r(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = r(t, ["referenceImages"]);
  if (a != null) {
    let c = a;
    Array.isArray(c) && (c = c.map((d) => iT(d))), l(o, ["instances[0]", "referenceImages"], c);
  }
  const u = r(t, ["config"]);
  return u != null && tE(u, o), o;
}
function oE(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["predictions"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => $s(a))), l(n, ["generatedImages"], i);
  }
  return n;
}
function sE(e, t, n) {
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
function iE(e, t, n) {
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
function rE(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], Q(e, s));
  const i = r(t, ["contents"]);
  if (i != null) {
    let d = Qr(e, i);
    Array.isArray(d) && (d = d.map((p) => p)), l(o, ["requests[]", "content"], d);
  }
  const a = r(t, ["content"]);
  a != null && uo(he(a));
  const u = r(t, ["config"]);
  u != null && sE(u, o);
  const c = r(t, ["model"]);
  return c !== void 0 && l(o, ["requests[]", "model"], Q(e, c)), o;
}
function aE(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], Q(e, s));
  let i = r(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const c = r(t, ["contents"]);
    if (c != null) {
      let d = Qr(e, c);
      Array.isArray(d) && (d = d.map((p) => p)), l(o, ["instances[]", "content"], d);
    }
  }
  let a = r(n, ["embeddingApiType"]);
  if (a === void 0 && (a = "PREDICT"), a === "EMBED_CONTENT") {
    const c = r(t, ["content"]);
    c != null && l(o, ["content"], an(he(c)));
  }
  const u = r(t, ["config"]);
  return u != null && iE(u, o, n), o;
}
function lE(e, t) {
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
function uE(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["predictions[]", "embeddings"]);
  if (s != null) {
    let a = s;
    Array.isArray(a) && (a = a.map((u) => qS(u))), l(n, ["embeddings"], a);
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
function cE(e, t) {
  const n = {}, o = r(e, ["endpoint"]);
  o != null && l(n, ["name"], o);
  const s = r(e, ["deployedModelId"]);
  return s != null && l(n, ["deployedModelId"], s), n;
}
function dE(e, t) {
  const n = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["fileUri"]);
  o != null && l(n, ["fileUri"], o);
  const s = r(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function fE(e, t) {
  const n = {}, o = r(e, ["id"]);
  o != null && l(n, ["id"], o);
  const s = r(e, ["args"]);
  s != null && l(n, ["args"], s);
  const i = r(e, ["name"]);
  if (i != null && l(n, ["name"], i), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function pE(e, t) {
  const n = {}, o = r(e, ["allowedFunctionNames"]);
  o != null && l(n, ["allowedFunctionNames"], o);
  const s = r(e, ["mode"]);
  if (s != null && l(n, ["mode"], s), r(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function hE(e, t) {
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
function mE(e, t, n, o) {
  const s = {}, i = r(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], uo(he(i)));
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
  const C = r(t, ["responseMimeType"]);
  C != null && l(s, ["responseMimeType"], C);
  const b = r(t, ["responseSchema"]);
  b != null && l(s, ["responseSchema"], Zr(b));
  const x = r(t, ["responseJsonSchema"]);
  if (x != null && l(s, ["responseJsonSchema"], x), r(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (r(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const M = r(t, ["safetySettings"]);
  if (n !== void 0 && M != null) {
    let te = M;
    Array.isArray(te) && (te = te.map((Oe) => rT(Oe))), l(n, ["safetySettings"], te);
  }
  const $ = r(t, ["tools"]);
  if (n !== void 0 && $ != null) {
    let te = sn($);
    Array.isArray(te) && (te = te.map((Oe) => hT(on(Oe)))), l(n, ["tools"], te);
  }
  const T = r(t, ["toolConfig"]);
  if (n !== void 0 && T != null && l(n, ["toolConfig"], fT(T)), r(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const F = r(t, ["cachedContent"]);
  n !== void 0 && F != null && l(n, ["cachedContent"], ft(e, F));
  const P = r(t, ["responseModalities"]);
  P != null && l(s, ["responseModalities"], P);
  const D = r(t, ["mediaResolution"]);
  D != null && l(s, ["mediaResolution"], D);
  const W = r(t, ["speechConfig"]);
  if (W != null && l(s, ["speechConfig"], jr(W)), r(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const X = r(t, ["thinkingConfig"]);
  X != null && l(s, ["thinkingConfig"], X);
  const me = r(t, ["imageConfig"]);
  me != null && l(s, ["imageConfig"], qE(me));
  const ge = r(t, ["enableEnhancedCivicAnswers"]);
  if (ge != null && l(s, ["enableEnhancedCivicAnswers"], ge), r(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const se = r(t, ["serviceTier"]);
  return n !== void 0 && se != null && l(n, ["serviceTier"], se), s;
}
function gE(e, t, n, o) {
  const s = {}, i = r(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], an(he(i)));
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
  const C = r(t, ["responseMimeType"]);
  C != null && l(s, ["responseMimeType"], C);
  const b = r(t, ["responseSchema"]);
  b != null && l(s, ["responseSchema"], Zr(b));
  const x = r(t, ["responseJsonSchema"]);
  x != null && l(s, ["responseJsonSchema"], x);
  const M = r(t, ["routingConfig"]);
  M != null && l(s, ["routingConfig"], M);
  const $ = r(t, ["modelSelectionConfig"]);
  $ != null && l(s, ["modelConfig"], $);
  const T = r(t, ["safetySettings"]);
  if (n !== void 0 && T != null) {
    let Ee = T;
    Array.isArray(Ee) && (Ee = Ee.map(($t) => $t)), l(n, ["safetySettings"], Ee);
  }
  const F = r(t, ["tools"]);
  if (n !== void 0 && F != null) {
    let Ee = sn(F);
    Array.isArray(Ee) && (Ee = Ee.map(($t) => Ap(on($t)))), l(n, ["tools"], Ee);
  }
  const P = r(t, ["toolConfig"]);
  n !== void 0 && P != null && l(n, ["toolConfig"], pT(P));
  const D = r(t, ["labels"]);
  n !== void 0 && D != null && l(n, ["labels"], D);
  const W = r(t, ["cachedContent"]);
  n !== void 0 && W != null && l(n, ["cachedContent"], ft(e, W));
  const X = r(t, ["responseModalities"]);
  X != null && l(s, ["responseModalities"], X);
  const me = r(t, ["mediaResolution"]);
  me != null && l(s, ["mediaResolution"], me);
  const ge = r(t, ["speechConfig"]);
  ge != null && l(s, ["speechConfig"], jr(ge));
  const se = r(t, ["audioTimestamp"]);
  se != null && l(s, ["audioTimestamp"], se);
  const te = r(t, ["thinkingConfig"]);
  te != null && l(s, ["thinkingConfig"], te);
  const Oe = r(t, ["imageConfig"]);
  if (Oe != null && l(s, ["imageConfig"], VE(Oe)), r(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const Ze = r(t, ["modelArmorConfig"]);
  n !== void 0 && Ze != null && l(n, ["modelArmorConfig"], Ze);
  const qe = r(t, ["serviceTier"]);
  return n !== void 0 && qe != null && l(n, ["serviceTier"], qe), s;
}
function Qu(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], Q(e, s));
  const i = r(t, ["contents"]);
  if (i != null) {
    let u = xe(i);
    Array.isArray(u) && (u = u.map((c) => uo(c))), l(o, ["contents"], u);
  }
  const a = r(t, ["config"]);
  return a != null && l(o, ["generationConfig"], mE(e, a, o)), o;
}
function Zu(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], Q(e, s));
  const i = r(t, ["contents"]);
  if (i != null) {
    let u = xe(i);
    Array.isArray(u) && (u = u.map((c) => an(c))), l(o, ["contents"], u);
  }
  const a = r(t, ["config"]);
  return a != null && l(o, ["generationConfig"], gE(e, a, o)), o;
}
function ju(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["candidates"]);
  if (s != null) {
    let p = s;
    Array.isArray(p) && (p = p.map((f) => FS(f))), l(n, ["candidates"], p);
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
function ec(e, t) {
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
function yE(e, t, n) {
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
function _E(e, t, n) {
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
  const C = r(e, ["addWatermark"]);
  t !== void 0 && C != null && l(t, ["parameters", "addWatermark"], C);
  const b = r(e, ["labels"]);
  t !== void 0 && b != null && l(t, ["labels"], b);
  const x = r(e, ["imageSize"]);
  t !== void 0 && x != null && l(t, ["parameters", "sampleImageSize"], x);
  const M = r(e, ["enhancePrompt"]);
  return t !== void 0 && M != null && l(t, ["parameters", "enhancePrompt"], M), o;
}
function vE(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], Q(e, s));
  const i = r(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = r(t, ["config"]);
  return a != null && yE(a, o), o;
}
function SE(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], Q(e, s));
  const i = r(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = r(t, ["config"]);
  return a != null && _E(a, o), o;
}
function EE(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["predictions"]);
  if (s != null) {
    let a = s;
    Array.isArray(a) && (a = a.map((u) => kE(u))), l(n, ["generatedImages"], a);
  }
  const i = r(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], Tp(i)), n;
}
function TE(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["predictions"]);
  if (s != null) {
    let a = s;
    Array.isArray(a) && (a = a.map((u) => $s(u))), l(n, ["generatedImages"], a);
  }
  const i = r(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], wp(i)), n;
}
function wE(e, t, n) {
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
  t !== void 0 && f != null && l(t, ["instances[0]", "lastFrame"], Us(f));
  const h = r(e, ["referenceImages"]);
  if (t !== void 0 && h != null) {
    let g = h;
    Array.isArray(g) && (g = g.map((y) => IT(y))), l(t, ["instances[0]", "referenceImages"], g);
  }
  if (r(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (r(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (r(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = r(e, ["webhookConfig"]);
  return t !== void 0 && m != null && l(t, ["webhookConfig"], m), o;
}
function AE(e, t, n) {
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
  t !== void 0 && _ != null && l(t, ["instances[0]", "lastFrame"], Qe(_));
  const C = r(e, ["referenceImages"]);
  if (t !== void 0 && C != null) {
    let $ = C;
    Array.isArray($) && ($ = $.map((T) => xT(T))), l(t, ["instances[0]", "referenceImages"], $);
  }
  const b = r(e, ["mask"]);
  t !== void 0 && b != null && l(t, ["instances[0]", "mask"], CT(b));
  const x = r(e, ["compressionQuality"]);
  t !== void 0 && x != null && l(t, ["parameters", "compressionQuality"], x);
  const M = r(e, ["labels"]);
  if (t !== void 0 && M != null && l(t, ["labels"], M), r(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return o;
}
function bE(e, t) {
  const n = {}, o = r(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = r(e, ["metadata"]);
  s != null && l(n, ["metadata"], s);
  const i = r(e, ["done"]);
  i != null && l(n, ["done"], i);
  const a = r(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = r(e, ["response", "generateVideoResponse"]);
  return u != null && l(n, ["response"], RE(u)), n;
}
function CE(e, t) {
  const n = {}, o = r(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = r(e, ["metadata"]);
  s != null && l(n, ["metadata"], s);
  const i = r(e, ["done"]);
  i != null && l(n, ["done"], i);
  const a = r(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = r(e, ["response"]);
  return u != null && l(n, ["response"], PE(u)), n;
}
function IE(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], Q(e, s));
  const i = r(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = r(t, ["image"]);
  a != null && l(o, ["instances[0]", "image"], Us(a));
  const u = r(t, ["video"]);
  u != null && l(o, ["instances[0]", "video"], bp(u));
  const c = r(t, ["source"]);
  c != null && ME(c, o);
  const d = r(t, ["config"]);
  return d != null && wE(d, o), o;
}
function xE(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], Q(e, s));
  const i = r(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = r(t, ["image"]);
  a != null && l(o, ["instances[0]", "image"], Qe(a));
  const u = r(t, ["video"]);
  u != null && l(o, ["instances[0]", "video"], Cp(u));
  const c = r(t, ["source"]);
  c != null && NE(c, o);
  const d = r(t, ["config"]);
  return d != null && AE(d, o), o;
}
function RE(e, t) {
  const n = {}, o = r(e, ["generatedSamples"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => DE(u))), l(n, ["generatedVideos"], a);
  }
  const s = r(e, ["raiMediaFilteredCount"]);
  s != null && l(n, ["raiMediaFilteredCount"], s);
  const i = r(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function PE(e, t) {
  const n = {}, o = r(e, ["videos"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => $E(u))), l(n, ["generatedVideos"], a);
  }
  const s = r(e, ["raiMediaFilteredCount"]);
  s != null && l(n, ["raiMediaFilteredCount"], s);
  const i = r(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function ME(e, t, n) {
  const o = {}, s = r(e, ["prompt"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "prompt"], s);
  const i = r(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Us(i));
  const a = r(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], bp(a)), o;
}
function NE(e, t, n) {
  const o = {}, s = r(e, ["prompt"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "prompt"], s);
  const i = r(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Qe(i));
  const a = r(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], Cp(a)), o;
}
function kE(e, t) {
  const n = {}, o = r(e, ["_self"]);
  o != null && l(n, ["image"], HE(o));
  const s = r(e, ["raiFilteredReason"]);
  s != null && l(n, ["raiFilteredReason"], s);
  const i = r(e, ["_self"]);
  return i != null && l(n, ["safetyAttributes"], Tp(i)), n;
}
function $s(e, t) {
  const n = {}, o = r(e, ["_self"]);
  o != null && l(n, ["image"], Ep(o));
  const s = r(e, ["raiFilteredReason"]);
  s != null && l(n, ["raiFilteredReason"], s);
  const i = r(e, ["_self"]);
  i != null && l(n, ["safetyAttributes"], wp(i));
  const a = r(e, ["prompt"]);
  return a != null && l(n, ["enhancedPrompt"], a), n;
}
function LE(e, t) {
  const n = {}, o = r(e, ["_self"]);
  o != null && l(n, ["mask"], Ep(o));
  const s = r(e, ["labels"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => a)), l(n, ["labels"], i);
  }
  return n;
}
function DE(e, t) {
  const n = {}, o = r(e, ["video"]);
  return o != null && l(n, ["video"], AT(o)), n;
}
function $E(e, t) {
  const n = {}, o = r(e, ["_self"]);
  return o != null && l(n, ["video"], bT(o)), n;
}
function UE(e, t) {
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
  const C = r(e, ["routingConfig"]);
  C != null && l(n, ["routingConfig"], C);
  const b = r(e, ["seed"]);
  b != null && l(n, ["seed"], b);
  const x = r(e, ["speechConfig"]);
  x != null && l(n, ["speechConfig"], x);
  const M = r(e, ["stopSequences"]);
  M != null && l(n, ["stopSequences"], M);
  const $ = r(e, ["temperature"]);
  $ != null && l(n, ["temperature"], $);
  const T = r(e, ["thinkingConfig"]);
  T != null && l(n, ["thinkingConfig"], T);
  const F = r(e, ["topK"]);
  F != null && l(n, ["topK"], F);
  const P = r(e, ["topP"]);
  if (P != null && l(n, ["topP"], P), r(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return n;
}
function FE(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  return s != null && l(o, ["_url", "name"], Q(e, s)), o;
}
function BE(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  return s != null && l(o, ["_url", "name"], Q(e, s)), o;
}
function GE(e, t) {
  const n = {}, o = r(e, ["authConfig"]);
  o != null && l(n, ["authConfig"], $S(o));
  const s = r(e, ["enableWidget"]);
  return s != null && l(n, ["enableWidget"], s), n;
}
function OE(e, t) {
  const n = {}, o = r(e, ["searchTypes"]);
  if (o != null && l(n, ["searchTypes"], o), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const s = r(e, ["timeRangeFilter"]);
  return s != null && l(n, ["timeRangeFilter"], s), n;
}
function qE(e, t) {
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
function VE(e, t) {
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
function HE(e, t) {
  const n = {}, o = r(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["imageBytes"], Et(o));
  const s = r(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function Ep(e, t) {
  const n = {}, o = r(e, ["gcsUri"]);
  o != null && l(n, ["gcsUri"], o);
  const s = r(e, ["bytesBase64Encoded"]);
  s != null && l(n, ["imageBytes"], Et(s));
  const i = r(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function Us(e, t) {
  const n = {};
  if (r(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  const o = r(e, ["imageBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], Et(o));
  const s = r(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function Qe(e, t) {
  const n = {}, o = r(e, ["gcsUri"]);
  o != null && l(n, ["gcsUri"], o);
  const s = r(e, ["imageBytes"]);
  s != null && l(n, ["bytesBase64Encoded"], Et(s));
  const i = r(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function JE(e, t, n, o) {
  const s = {}, i = r(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const a = r(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = r(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = r(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], fp(e, c)), s;
}
function WE(e, t, n, o) {
  const s = {}, i = r(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const a = r(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = r(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = r(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], fp(e, c)), s;
}
function KE(e, t, n) {
  const o = {}, s = r(t, ["config"]);
  return s != null && JE(e, s, o), o;
}
function zE(e, t, n) {
  const o = {}, s = r(t, ["config"]);
  return s != null && WE(e, s, o), o;
}
function YE(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["nextPageToken"]);
  s != null && l(n, ["nextPageToken"], s);
  const i = r(e, ["_self"]);
  if (i != null) {
    let a = pp(i);
    Array.isArray(a) && (a = a.map((u) => ir(u))), l(n, ["models"], a);
  }
  return n;
}
function XE(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["nextPageToken"]);
  s != null && l(n, ["nextPageToken"], s);
  const i = r(e, ["_self"]);
  if (i != null) {
    let a = pp(i);
    Array.isArray(a) && (a = a.map((u) => rr(u))), l(n, ["models"], a);
  }
  return n;
}
function QE(e, t) {
  const n = {}, o = r(e, ["maskMode"]);
  o != null && l(n, ["maskMode"], o);
  const s = r(e, ["segmentationClasses"]);
  s != null && l(n, ["maskClasses"], s);
  const i = r(e, ["maskDilation"]);
  return i != null && l(n, ["dilation"], i), n;
}
function ir(e, t) {
  const n = {}, o = r(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = r(e, ["displayName"]);
  s != null && l(n, ["displayName"], s);
  const i = r(e, ["description"]);
  i != null && l(n, ["description"], i);
  const a = r(e, ["version"]);
  a != null && l(n, ["version"], a);
  const u = r(e, ["_self"]);
  u != null && l(n, ["tunedModelInfo"], mT(u));
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
function rr(e, t) {
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
    Array.isArray(h) && (h = h.map((m) => cE(m))), l(n, ["endpoints"], h);
  }
  const c = r(e, ["labels"]);
  c != null && l(n, ["labels"], c);
  const d = r(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], gT(d));
  const p = r(e, ["defaultCheckpointId"]);
  p != null && l(n, ["defaultCheckpointId"], p);
  const f = r(e, ["checkpoints"]);
  if (f != null) {
    let h = f;
    Array.isArray(h) && (h = h.map((m) => m)), l(n, ["checkpoints"], h);
  }
  return n;
}
function ZE(e, t) {
  const n = {}, o = r(e, ["mediaResolution"]);
  o != null && l(n, ["mediaResolution"], o);
  const s = r(e, ["codeExecutionResult"]);
  s != null && l(n, ["codeExecutionResult"], s);
  const i = r(e, ["executableCode"]);
  i != null && l(n, ["executableCode"], i);
  const a = r(e, ["fileData"]);
  a != null && l(n, ["fileData"], dE(a));
  const u = r(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], fE(u));
  const c = r(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = r(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], US(d));
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
function jE(e, t) {
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
function eT(e, t) {
  const n = {}, o = r(e, ["productImage"]);
  return o != null && l(n, ["image"], Qe(o)), n;
}
function tT(e, t, n) {
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
function nT(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], Q(e, s));
  const i = r(t, ["source"]);
  i != null && sT(i, o);
  const a = r(t, ["config"]);
  return a != null && tT(a, o), o;
}
function oT(e, t) {
  const n = {}, o = r(e, ["predictions"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((i) => $s(i))), l(n, ["generatedImages"], s);
  }
  return n;
}
function sT(e, t, n) {
  const o = {}, s = r(e, ["prompt"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "prompt"], s);
  const i = r(e, ["personImage"]);
  t !== void 0 && i != null && l(t, [
    "instances[0]",
    "personImage",
    "image"
  ], Qe(i));
  const a = r(e, ["productImages"]);
  if (t !== void 0 && a != null) {
    let u = a;
    Array.isArray(u) && (u = u.map((c) => eT(c))), l(t, ["instances[0]", "productImages"], u);
  }
  return o;
}
function iT(e, t) {
  const n = {}, o = r(e, ["referenceImage"]);
  o != null && l(n, ["referenceImage"], Qe(o));
  const s = r(e, ["referenceId"]);
  s != null && l(n, ["referenceId"], s);
  const i = r(e, ["referenceType"]);
  i != null && l(n, ["referenceType"], i);
  const a = r(e, ["maskImageConfig"]);
  a != null && l(n, ["maskImageConfig"], QE(a));
  const u = r(e, ["controlImageConfig"]);
  u != null && l(n, ["controlImageConfig"], HS(u));
  const c = r(e, ["styleImageConfig"]);
  c != null && l(n, ["styleImageConfig"], c);
  const d = r(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function Tp(e, t) {
  const n = {}, o = r(e, ["safetyAttributes", "categories"]);
  o != null && l(n, ["categories"], o);
  const s = r(e, ["safetyAttributes", "scores"]);
  s != null && l(n, ["scores"], s);
  const i = r(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function wp(e, t) {
  const n = {}, o = r(e, ["safetyAttributes", "categories"]);
  o != null && l(n, ["categories"], o);
  const s = r(e, ["safetyAttributes", "scores"]);
  s != null && l(n, ["scores"], s);
  const i = r(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function rT(e, t) {
  const n = {}, o = r(e, ["category"]);
  if (o != null && l(n, ["category"], o), r(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const s = r(e, ["threshold"]);
  return s != null && l(n, ["threshold"], s), n;
}
function aT(e, t) {
  const n = {}, o = r(e, ["image"]);
  return o != null && l(n, ["image"], Qe(o)), n;
}
function lT(e, t, n) {
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
function uT(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], Q(e, s));
  const i = r(t, ["source"]);
  i != null && dT(i, o);
  const a = r(t, ["config"]);
  return a != null && lT(a, o), o;
}
function cT(e, t) {
  const n = {}, o = r(e, ["predictions"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((i) => LE(i))), l(n, ["generatedMasks"], s);
  }
  return n;
}
function dT(e, t, n) {
  const o = {}, s = r(e, ["prompt"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "prompt"], s);
  const i = r(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Qe(i));
  const a = r(e, ["scribbleImage"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "scribble"], aT(a)), o;
}
function fT(e, t) {
  const n = {}, o = r(e, ["retrievalConfig"]);
  o != null && l(n, ["retrievalConfig"], o);
  const s = r(e, ["functionCallingConfig"]);
  s != null && l(n, ["functionCallingConfig"], pE(s));
  const i = r(e, ["includeServerSideToolInvocations"]);
  return i != null && l(n, ["includeServerSideToolInvocations"], i), n;
}
function pT(e, t) {
  const n = {}, o = r(e, ["retrievalConfig"]);
  o != null && l(n, ["retrievalConfig"], o);
  const s = r(e, ["functionCallingConfig"]);
  if (s != null && l(n, ["functionCallingConfig"], s), r(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function hT(e, t) {
  const n = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const o = r(e, ["computerUse"]);
  o != null && l(n, ["computerUse"], o);
  const s = r(e, ["fileSearch"]);
  s != null && l(n, ["fileSearch"], s);
  const i = r(e, ["googleSearch"]);
  i != null && l(n, ["googleSearch"], OE(i));
  const a = r(e, ["googleMaps"]);
  a != null && l(n, ["googleMaps"], GE(a));
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
function Ap(e, t) {
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
    Array.isArray(m) && (m = m.map((g) => hE(g))), l(n, ["functionDeclarations"], m);
  }
  const p = r(e, ["googleSearchRetrieval"]);
  p != null && l(n, ["googleSearchRetrieval"], p);
  const f = r(e, ["parallelAiSearch"]);
  f != null && l(n, ["parallelAiSearch"], f);
  const h = r(e, ["urlContext"]);
  if (h != null && l(n, ["urlContext"], h), r(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function mT(e, t) {
  const n = {}, o = r(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const s = r(e, ["createTime"]);
  s != null && l(n, ["createTime"], s);
  const i = r(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function gT(e, t) {
  const n = {}, o = r(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  o != null && l(n, ["baseModel"], o);
  const s = r(e, ["createTime"]);
  s != null && l(n, ["createTime"], s);
  const i = r(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function yT(e, t, n) {
  const o = {}, s = r(e, ["displayName"]);
  t !== void 0 && s != null && l(t, ["displayName"], s);
  const i = r(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const a = r(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), o;
}
function _T(e, t, n) {
  const o = {}, s = r(e, ["displayName"]);
  t !== void 0 && s != null && l(t, ["displayName"], s);
  const i = r(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const a = r(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), o;
}
function vT(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "name"], Q(e, s));
  const i = r(t, ["config"]);
  return i != null && yT(i, o), o;
}
function ST(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], Q(e, s));
  const i = r(t, ["config"]);
  return i != null && _T(i, o), o;
}
function ET(e, t, n) {
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
function TT(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], Q(e, s));
  const i = r(t, ["image"]);
  i != null && l(o, ["instances[0]", "image"], Qe(i));
  const a = r(t, ["upscaleFactor"]);
  a != null && l(o, [
    "parameters",
    "upscaleConfig",
    "upscaleFactor"
  ], a);
  const u = r(t, ["config"]);
  return u != null && ET(u, o), o;
}
function wT(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["predictions"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => $s(a))), l(n, ["generatedImages"], i);
  }
  return n;
}
function AT(e, t) {
  const n = {}, o = r(e, ["uri"]);
  o != null && l(n, ["uri"], o);
  const s = r(e, ["encodedVideo"]);
  s != null && l(n, ["videoBytes"], Et(s));
  const i = r(e, ["encoding"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function bT(e, t) {
  const n = {}, o = r(e, ["gcsUri"]);
  o != null && l(n, ["uri"], o);
  const s = r(e, ["bytesBase64Encoded"]);
  s != null && l(n, ["videoBytes"], Et(s));
  const i = r(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function CT(e, t) {
  const n = {}, o = r(e, ["image"]);
  o != null && l(n, ["_self"], Qe(o));
  const s = r(e, ["maskMode"]);
  return s != null && l(n, ["maskMode"], s), n;
}
function IT(e, t) {
  const n = {}, o = r(e, ["image"]);
  o != null && l(n, ["image"], Us(o));
  const s = r(e, ["referenceType"]);
  return s != null && l(n, ["referenceType"], s), n;
}
function xT(e, t) {
  const n = {}, o = r(e, ["image"]);
  o != null && l(n, ["image"], Qe(o));
  const s = r(e, ["referenceType"]);
  return s != null && l(n, ["referenceType"], s), n;
}
function bp(e, t) {
  const n = {}, o = r(e, ["uri"]);
  o != null && l(n, ["uri"], o);
  const s = r(e, ["videoBytes"]);
  s != null && l(n, ["encodedVideo"], Et(s));
  const i = r(e, ["mimeType"]);
  return i != null && l(n, ["encoding"], i), n;
}
function Cp(e, t) {
  const n = {}, o = r(e, ["uri"]);
  o != null && l(n, ["gcsUri"], o);
  const s = r(e, ["videoBytes"]);
  s != null && l(n, ["bytesBase64Encoded"], Et(s));
  const i = r(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function RT(e, t) {
  const n = {}, o = r(e, ["displayName"]);
  return t !== void 0 && o != null && l(t, ["displayName"], o), n;
}
function PT(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && RT(n, t), t;
}
function MT(e, t) {
  const n = {}, o = r(e, ["force"]);
  return t !== void 0 && o != null && l(t, ["_query", "force"], o), n;
}
function NT(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const o = r(e, ["config"]);
  return o != null && MT(o, t), t;
}
function kT(e) {
  const t = {}, n = r(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function LT(e, t) {
  const n = {}, o = r(e, ["customMetadata"]);
  if (t !== void 0 && o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["customMetadata"], i);
  }
  const s = r(e, ["chunkingConfig"]);
  return t !== void 0 && s != null && l(t, ["chunkingConfig"], s), n;
}
function DT(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = r(e, ["response"]);
  return a != null && l(t, ["response"], UT(a)), t;
}
function $T(e) {
  const t = {}, n = r(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const o = r(e, ["fileName"]);
  o != null && l(t, ["fileName"], o);
  const s = r(e, ["config"]);
  return s != null && LT(s, t), t;
}
function UT(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const s = r(e, ["documentName"]);
  return s != null && l(t, ["documentName"], s), t;
}
function FT(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function BT(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && FT(n, t), t;
}
function GT(e) {
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
function Ip(e, t) {
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
function OT(e) {
  const t = {}, n = r(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const o = r(e, ["config"]);
  return o != null && Ip(o, t), t;
}
function qT(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var VT = "Content-Type", HT = "X-Server-Timeout", JT = "User-Agent", ar = "x-goog-api-client", WT = "google-genai-sdk/1.50.1", KT = "v1beta1", zT = "v1beta", YT = /* @__PURE__ */ new Set(["us", "eu"]), XT = 5, QT = [
  408,
  429,
  500,
  502,
  503,
  504
], ZT = class {
  constructor(e) {
    var t, n, o;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const s = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const i = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !i ? (s.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? s.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && YT.has(this.clientOptions.location) ? s.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (s.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), s.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : KT;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), s.apiVersion = (o = this.clientOptions.apiVersion) !== null && o !== void 0 ? o : zT, s.baseUrl = "https://generativelanguage.googleapis.com/";
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
    return !(t.baseUrl && t.baseUrlResourceScope === tr.COLLECTION || this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
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
    return t && t.extraBody !== null && jT(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await tc(o), new nr(o))).catch((o) => {
      throw o instanceof Error ? o : new Error(JSON.stringify(o));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await tc(o), this.processStreamResponse(o))).catch((o) => {
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
          const { done: c, value: d } = yield K(o.read());
          if (c) {
            if (i.trim().length > 0) throw new Error("Incomplete JSON segment at the end");
            break;
          }
          const p = s.decode(d, { stream: !0 });
          try {
            const m = JSON.parse(p);
            if ("error" in m) {
              const g = JSON.parse(JSON.stringify(m.error)), y = g.status, _ = g.code, C = `got status: ${y}. ${JSON.stringify(m)}`;
              if (_ >= 400 && _ < 600) throw new vp({
                message: C,
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
                yield yield K(new nr(new Response(y, {
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
      throw QT.includes(i.status) ? new Error(`Retryable HTTP Error: ${i.statusText}`) : new Il.AbortError(`Non-retryable exception ${i.statusText} sending request`);
    };
    return (0, Il.default)(s, { retries: ((n = o.attempts) !== null && n !== void 0 ? n : XT) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = WT + " " + this.clientOptions.userAgentExtra;
    return e[JT] = t, e[ar] = t, e[VT] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [o, s] of Object.entries(e.headers)) n.append(o, s);
      e.timeout && e.timeout > 0 && n.append(HT, String(Math.ceil(e.timeout / 1e3)));
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
    const u = { file: o }, c = this.getFileName(e), d = k("upload/v1beta/files", u._url), p = await this.fetchUploadUrl(d, o.sizeBytes, o.mimeType, c, u, t?.httpOptions);
    return s.upload(e, p, this);
  }
  async uploadFileToFileSearchStore(e, t, n) {
    var o;
    const s = this.clientOptions.uploader, i = await s.stat(t), a = String(i.size), u = (o = n?.mimeType) !== null && o !== void 0 ? o : i.type;
    if (u === void 0 || u === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    const c = `upload/v1beta/${e}:uploadToFileSearchStore`, d = this.getFileName(t), p = {};
    n != null && Ip(n, p);
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
async function tc(e) {
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
    throw n >= 400 && n < 600 ? new vp({
      message: s,
      status: n
    }) : new Error(s);
  }
}
function jT(e, t) {
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
var ew = "mcp_used/unknown", tw = !1;
function xp(e) {
  for (const t of e)
    if (nw(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return tw;
}
function Rp(e) {
  var t;
  e[ar] = (((t = e[ar]) !== null && t !== void 0 ? t : "") + ` ${ew}`).trimStart();
}
function nw(e) {
  return e !== null && typeof e == "object" && e instanceof sw;
}
function ow(e) {
  return ze(this, arguments, function* (n, o = 100) {
    let s, i = 0;
    for (; i < o; ) {
      const a = yield K(n.listTools({ cursor: s }));
      for (const u of a.tools)
        yield yield K(u), i++;
      if (!a.nextCursor) break;
      s = a.nextCursor;
    }
  });
}
var sw = class Pp {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new Pp(t, n);
  }
  async initialize() {
    var t, n, o, s;
    if (this.mcpTools.length > 0) return;
    const i = {}, a = [];
    for (const p of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, Ye(ow(p))), d; d = await c.next(), t = d.done, !t; u = !0) {
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
    return await this.initialize(), __(this.mcpTools, this.config);
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
async function iw(e, t, n) {
  const o = new u_();
  let s;
  n.data instanceof Blob ? s = JSON.parse(await n.data.text()) : s = JSON.parse(n.data), Object.assign(o, s), t(o);
}
var rw = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const o = this.apiClient.getWebsocketBaseUrl(), s = this.apiClient.getApiVersion(), i = uw(this.apiClient.getDefaultHeaders()), a = `${o}/ws/google.ai.generativelanguage.${s}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((y) => {
      u = y;
    }), d = e.callbacks, p = function() {
      u({});
    }, f = this.apiClient, h = {
      onopen: p,
      onmessage: (y) => {
        iw(f, d.onmessage, y);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(y) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(y) {
      }
    }, m = this.webSocketFactory.create(a, lw(i), h);
    m.connect(), await c;
    const g = { setup: { model: Q(this.apiClient, e.model) } };
    return m.send(JSON.stringify(g)), new aw(m, this.apiClient);
  }
}, aw = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = AS(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = wS(e);
    this.conn.send(JSON.stringify(t));
  }
  sendPlaybackControl(e) {
    const t = { playbackControl: e };
    this.conn.send(JSON.stringify(t));
  }
  play() {
    this.sendPlaybackControl(Xt.PLAY);
  }
  pause() {
    this.sendPlaybackControl(Xt.PAUSE);
  }
  stop() {
    this.sendPlaybackControl(Xt.STOP);
  }
  resetContext() {
    this.sendPlaybackControl(Xt.RESET_CONTEXT);
  }
  close() {
    this.conn.close();
  }
};
function lw(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function uw(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var cw = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function dw(e, t, n) {
  const o = new l_();
  let s;
  n.data instanceof Blob ? s = await n.data.text() : n.data instanceof ArrayBuffer ? s = new TextDecoder().decode(n.data) : s = n.data;
  const i = JSON.parse(s);
  if (e.isVertexAI()) {
    const a = IS(i);
    Object.assign(o, a);
  } else Object.assign(o, i);
  t(o);
}
var fw = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new rw(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, o, s, i, a;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const p = this.apiClient.getHeaders();
    e.config && e.config.tools && xp(e.config.tools) && Rp(p);
    const f = gw(p);
    if (this.apiClient.isVertexAI()) {
      const P = this.apiClient.getProject(), D = this.apiClient.getLocation(), W = this.apiClient.getApiKey(), X = !!P && !!D || !!W;
      this.apiClient.getCustomBaseUrl() && !X ? d = u : (d = `${u}/ws/google.cloud.aiplatform.${c}.LlmBidiService/BidiGenerateContent`, await this.auth.addAuthHeaders(f, d));
    } else {
      const P = this.apiClient.getApiKey();
      let D = "BidiGenerateContent", W = "key";
      P?.startsWith("auth_tokens/") && (console.warn("Warning: Ephemeral token support is experimental and may change in future versions."), c !== "v1alpha" && console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection."), D = "BidiGenerateContentConstrained", W = "access_token"), d = `${u}/ws/google.ai.generativelanguage.${c}.GenerativeService.${D}?${W}=${P}`;
    }
    let h = () => {
    };
    const m = new Promise((P) => {
      h = P;
    }), g = e.callbacks, y = function() {
      var P;
      (P = g?.onopen) === null || P === void 0 || P.call(g), h({});
    }, _ = this.apiClient, C = {
      onopen: y,
      onmessage: (P) => {
        dw(_, g.onmessage, P);
      },
      onerror: (t = g?.onerror) !== null && t !== void 0 ? t : function(P) {
      },
      onclose: (n = g?.onclose) !== null && n !== void 0 ? n : function(P) {
      }
    }, b = this.webSocketFactory.create(d, mw(f), C);
    b.connect(), await m;
    let x = Q(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && x.startsWith("publishers/")) {
      const P = this.apiClient.getProject(), D = this.apiClient.getLocation();
      P && D && (x = `projects/${P}/locations/${D}/` + x);
    }
    let M = {};
    this.apiClient.isVertexAI() && ((o = e.config) === null || o === void 0 ? void 0 : o.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [ms.AUDIO] } : e.config.responseModalities = [ms.AUDIO]), !((s = e.config) === null || s === void 0) && s.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    const $ = (a = (i = e.config) === null || i === void 0 ? void 0 : i.tools) !== null && a !== void 0 ? a : [], T = [];
    for (const P of $) if (this.isCallableTool(P)) {
      const D = P;
      T.push(await D.tool());
    } else T.push(P);
    T.length > 0 && (e.config.tools = T);
    const F = {
      model: x,
      config: e.config,
      callbacks: e.callbacks
    };
    return this.apiClient.isVertexAI() ? M = TS(this.apiClient, F) : M = ES(this.apiClient, F), delete M.config, b.send(JSON.stringify(M)), new hw(b, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, pw = { turnComplete: !0 }, hw = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let n = [];
      try {
        n = xe(t.turns), e.isVertexAI() || (n = n.map((o) => uo(o)));
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
      if (!e.isVertexAI() && !("id" in o)) throw new Error(cw);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, pw), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: CS(e) } : t = { realtimeInput: bS(e) }, this.conn.send(JSON.stringify(t));
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
function mw(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function gw(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var nc = 10;
function oc(e) {
  var t, n, o;
  if (!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.disable) return !0;
  let s = !1;
  for (const a of (n = e?.tools) !== null && n !== void 0 ? n : []) if (en(a)) {
    s = !0;
    break;
  }
  if (!s) return !0;
  const i = (o = e?.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls;
  return i && (i < 0 || !Number.isInteger(i)) || i == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", i), !0) : !1;
}
function en(e) {
  return "callTool" in e && typeof e.callTool == "function";
}
function yw(e) {
  var t, n, o;
  return (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((s) => en(s))) !== null && o !== void 0 ? o : !1;
}
function sc(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((o, s) => {
    if (en(o)) return;
    const i = o;
    i.functionDeclarations && i.functionDeclarations.length > 0 && n.push(s);
  }), n;
}
function ic(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var _w = class extends dt {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = xe(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = xe(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const o = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: gs.EMBED_CONTENT
        });
        return await this.embedContentInternal(o);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: gs.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, o, s, i, a;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !yw(t) || oc(t.config)) return await this.generateContentInternal(u);
      const c = sc(t);
      if (c.length > 0) {
        const g = c.map((y) => `tools[${y}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${g}.`);
      }
      let d, p;
      const f = xe(u.contents), h = (s = (o = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls) !== null && s !== void 0 ? s : nc;
      let m = 0;
      for (; m < h && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const g = d.candidates[0].content, y = [];
        for (const _ of (a = (i = t.config) === null || i === void 0 ? void 0 : i.tools) !== null && a !== void 0 ? a : []) if (en(_)) {
          const C = await _.callTool(d.functionCalls);
          y.push(...C);
        }
        m++, p = {
          role: "user",
          parts: y
        }, u.contents = xe(u.contents), u.contents.push(g), u.contents.push(p), ic(u.config) && (f.push(g), f.push(p));
      }
      return ic(u.config) && (d.automaticFunctionCallingHistory = f), d;
    }, this.generateContentStream = async (t) => {
      var n, o, s, i, a;
      if (this.maybeMoveToResponseJsonSchem(t), oc(t.config)) {
        const p = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(p);
      }
      const u = sc(t);
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
      return new Dt(ct.PAGED_ITEM_MODELS, (s) => this.listInternal(s), await this.listInternal(o), o);
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
    const i = await Promise.all(s.map(async (u) => en(u) ? await u.tool() : u)), a = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: i })
    };
    if (a.config.tools = i, e.config && e.config.tools && xp(e.config.tools)) {
      const u = (o = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && o !== void 0 ? o : {};
      let c = Object.assign({}, u);
      Object.keys(c).length === 0 && (c = this.apiClient.getDefaultHeaders()), Rp(c), a.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: c });
    }
    return a;
  }
  async initAfcToolsMap(e) {
    var t, n, o;
    const s = /* @__PURE__ */ new Map();
    for (const i of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (en(i)) {
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
    const s = (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && o !== void 0 ? o : nc;
    let i = !1, a = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, p) {
      return ze(this, arguments, function* () {
        for (var f, h, m, g, y, _; a < s; ) {
          i && (a++, i = !1);
          const M = yield K(c.processParamsMaybeAddMcpUsage(p)), $ = yield K(c.generateContentStreamInternal(M)), T = [], F = [];
          try {
            for (var C = !0, b = (h = void 0, Ye($)), x; x = yield K(b.next()), f = x.done, !f; C = !0) {
              g = x.value, C = !1;
              const P = g;
              if (yield yield K(P), P.candidates && (!((y = P.candidates[0]) === null || y === void 0) && y.content)) {
                F.push(P.candidates[0].content);
                for (const D of (_ = P.candidates[0].content.parts) !== null && _ !== void 0 ? _ : []) if (a < s && D.functionCall) {
                  if (!D.functionCall.name) throw new Error("Function call name was not returned by the model.");
                  if (d.has(D.functionCall.name)) {
                    const W = yield K(d.get(D.functionCall.name).callTool([D.functionCall]));
                    T.push(...W);
                  } else
                    throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${d.keys()}, mising tool: ${D.functionCall.name}`);
                }
              }
            }
          } catch (P) {
            h = { error: P };
          } finally {
            try {
              !C && !f && (m = b.return) && (yield K(m.call(b)));
            } finally {
              if (h) throw h.error;
            }
          }
          if (T.length > 0) {
            i = !0;
            const P = new In();
            P.candidates = [{ content: {
              role: "user",
              parts: T
            } }], yield yield K(P);
            const D = [];
            D.push(...F), D.push({
              role: "user",
              parts: T
            }), p.contents = xe(p.contents).concat(D);
          } else break;
        }
      });
    })(this, u, e);
  }
  async generateContentInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Zu(this.apiClient, e);
      return a = k("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = ec(d), f = new In();
        return Object.assign(f, p), f;
      });
    } else {
      const c = Qu(this.apiClient, e);
      return a = k("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = ju(d), f = new In();
        return Object.assign(f, p), f;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Zu(this.apiClient, e);
      return a = k("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
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
            for (var g = !0, y = Ye(d), _; _ = yield K(y.next()), p = _.done, !p; g = !0) {
              m = _.value, g = !1;
              const C = m, b = ec(yield K(C.json()), e);
              b.sdkHttpResponse = { headers: C.headers };
              const x = new In();
              Object.assign(x, b), yield yield K(x);
            }
          } catch (C) {
            f = { error: C };
          } finally {
            try {
              !g && !p && (h = y.return) && (yield K(h.call(y)));
            } finally {
              if (f) throw f.error;
            }
          }
        });
      });
    } else {
      const c = Qu(this.apiClient, e);
      return a = k("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
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
            for (var g = !0, y = Ye(d), _; _ = yield K(y.next()), p = _.done, !p; g = !0) {
              m = _.value, g = !1;
              const C = m, b = ju(yield K(C.json()), e);
              b.sdkHttpResponse = { headers: C.headers };
              const x = new In();
              Object.assign(x, b), yield yield K(x);
            }
          } catch (C) {
            f = { error: C };
          } finally {
            try {
              !g && !p && (h = y.return) && (yield K(h.call(y)));
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
      const c = aE(this.apiClient, e, e);
      return a = k(S_(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = uE(d, e), f = new Mu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = rE(this.apiClient, e);
      return a = k("{model}:batchEmbedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = lE(d), f = new Mu();
        return Object.assign(f, p), f;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = SE(this.apiClient, e);
      return a = k("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = TE(d), f = new Nu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = vE(this.apiClient, e);
      return a = k("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = EE(d), f = new Nu();
        return Object.assign(f, p), f;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = nE(this.apiClient, e);
      return s = k("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
        const c = oE(u), d = new Yy();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = TT(this.apiClient, e);
      return s = k("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
        const c = wT(u), d = new Xy();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = nT(this.apiClient, e);
      return s = k("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = oT(u), d = new Qy();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = uT(this.apiClient, e);
      return s = k("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = cT(u), d = new Zy();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = BE(this.apiClient, e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => rr(d));
    } else {
      const c = FE(this.apiClient, e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), i.then((d) => ir(d));
    }
  }
  async listInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = zE(this.apiClient, e);
      return a = k("{models_url}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = XE(d), f = new ku();
        return Object.assign(f, p), f;
      });
    } else {
      const c = KE(this.apiClient, e);
      return a = k("{models_url}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = YE(d), f = new ku();
        return Object.assign(f, p), f;
      });
    }
  }
  async update(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ST(this.apiClient, e);
      return a = k("{model}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => rr(d));
    } else {
      const c = vT(this.apiClient, e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), i.then((d) => ir(d));
    }
  }
  async delete(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ZS(this.apiClient, e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = eE(d), f = new Lu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = QS(this.apiClient, e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = jS(d), f = new Lu();
        return Object.assign(f, p), f;
      });
    }
  }
  async countTokens(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = zS(this.apiClient, e);
      return a = k("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = XS(d), f = new Du();
        return Object.assign(f, p), f;
      });
    } else {
      const c = KS(this.apiClient, e);
      return a = k("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = YS(d), f = new Du();
        return Object.assign(f, p), f;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = GS(this.apiClient, e);
      return s = k("{model}:computeTokens", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
        const c = OS(u), d = new jy();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = xE(this.apiClient, e);
      return a = k("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const p = CE(d), f = new $u();
        return Object.assign(f, p), f;
      });
    } else {
      const c = IE(this.apiClient, e);
      return a = k("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const p = bE(d), f = new $u();
        return Object.assign(f, p), f;
      });
    }
  }
}, vw = class extends dt {
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
      const c = Vy(e);
      return a = k("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i;
    } else {
      const c = qy(e);
      return a = k("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
      const a = Dy(e);
      return s = k("{resourceName}:fetchPredictOperation", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
function rc(e) {
  const t = {};
  if (r(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function Sw(e) {
  const t = {}, n = r(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Ew(e) {
  const t = {}, n = r(e, ["data"]);
  if (n != null && l(t, ["data"], n), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Tw(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((i) => Mw(i))), l(t, ["parts"], s);
  }
  const o = r(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function ww(e, t, n) {
  const o = {}, s = r(t, ["expireTime"]);
  n !== void 0 && s != null && l(n, ["expireTime"], s);
  const i = r(t, ["newSessionExpireTime"]);
  n !== void 0 && i != null && l(n, ["newSessionExpireTime"], i);
  const a = r(t, ["uses"]);
  n !== void 0 && a != null && l(n, ["uses"], a);
  const u = r(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && l(n, ["bidiGenerateContentSetup"], Pw(e, u));
  const c = r(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && l(n, ["fieldMask"], c), o;
}
function Aw(e, t) {
  const n = {}, o = r(t, ["config"]);
  return o != null && l(n, ["config"], ww(e, o, n)), n;
}
function bw(e) {
  const t = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = r(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Cw(e) {
  const t = {}, n = r(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = r(e, ["args"]);
  o != null && l(t, ["args"], o);
  const s = r(e, ["name"]);
  if (s != null && l(t, ["name"], s), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Iw(e) {
  const t = {}, n = r(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], Sw(n));
  const o = r(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function xw(e) {
  const t = {}, n = r(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = r(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function Rw(e, t) {
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
  ], ea(f));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], Tw(he(g)));
  const y = r(e, ["tools"]);
  if (t !== void 0 && y != null) {
    let P = sn(y);
    Array.isArray(P) && (P = P.map((D) => Lw(on(D)))), l(t, ["setup", "tools"], P);
  }
  const _ = r(e, ["sessionResumption"]);
  t !== void 0 && _ != null && l(t, ["setup", "sessionResumption"], kw(_));
  const C = r(e, ["inputAudioTranscription"]);
  t !== void 0 && C != null && l(t, ["setup", "inputAudioTranscription"], rc(C));
  const b = r(e, ["outputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "outputAudioTranscription"], rc(b));
  const x = r(e, ["realtimeInputConfig"]);
  t !== void 0 && x != null && l(t, ["setup", "realtimeInputConfig"], x);
  const M = r(e, ["contextWindowCompression"]);
  t !== void 0 && M != null && l(t, ["setup", "contextWindowCompression"], M);
  const $ = r(e, ["proactivity"]);
  if (t !== void 0 && $ != null && l(t, ["setup", "proactivity"], $), r(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const T = r(e, ["avatarConfig"]);
  t !== void 0 && T != null && l(t, ["setup", "avatarConfig"], T);
  const F = r(e, ["safetySettings"]);
  if (t !== void 0 && F != null) {
    let P = F;
    Array.isArray(P) && (P = P.map((D) => Nw(D))), l(t, ["setup", "safetySettings"], P);
  }
  return n;
}
function Pw(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["setup", "model"], Q(e, o));
  const s = r(t, ["config"]);
  return s != null && l(n, ["config"], Rw(s, n)), n;
}
function Mw(e) {
  const t = {}, n = r(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = r(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const s = r(e, ["executableCode"]);
  s != null && l(t, ["executableCode"], s);
  const i = r(e, ["fileData"]);
  i != null && l(t, ["fileData"], bw(i));
  const a = r(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], Cw(a));
  const u = r(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = r(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], Ew(c));
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
function Nw(e) {
  const t = {}, n = r(e, ["category"]);
  if (n != null && l(t, ["category"], n), r(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = r(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function kw(e) {
  const t = {}, n = r(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), r(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function Lw(e) {
  const t = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = r(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = r(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const s = r(e, ["googleSearch"]);
  s != null && l(t, ["googleSearch"], xw(s));
  const i = r(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], Iw(i));
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
function Dw(e) {
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
function $w(e, t) {
  let n = null;
  const o = e.bidiGenerateContentSetup;
  if (typeof o == "object" && o !== null && "setup" in o) {
    const i = o.setup;
    typeof i == "object" && i !== null ? (e.bidiGenerateContentSetup = i, n = i) : delete e.bidiGenerateContentSetup;
  } else o !== void 0 && delete e.bidiGenerateContentSetup;
  const s = e.fieldMask;
  if (n) {
    const i = Dw(n);
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
var Uw = class extends dt {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const a = Aw(this.apiClient, e);
      s = k("auth_tokens", a._url), i = a._query, delete a.config, delete a._url, delete a._query;
      const u = $w(a, e.config);
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
function Fw(e, t) {
  const n = {}, o = r(e, ["force"]);
  return t !== void 0 && o != null && l(t, ["_query", "force"], o), n;
}
function Bw(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const o = r(e, ["config"]);
  return o != null && Fw(o, t), t;
}
function Gw(e) {
  const t = {}, n = r(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function Ow(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function qw(e) {
  const t = {}, n = r(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const o = r(e, ["config"]);
  return o != null && Ow(o, t), t;
}
function Vw(e) {
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
var Hw = class extends dt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new Dt(ct.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Gw(e);
      return s = k("{name}", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
      const i = Bw(e);
      o = k("{name}", i._url), s = i._query, delete i._url, delete i._query, await this.apiClient.request({
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
      const a = qw(e);
      return s = k("{parent}/documents", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = Vw(u), d = new e_();
        return Object.assign(d, c), d;
      });
    }
  }
}, Jw = class extends dt {
  constructor(e, t = new Hw(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new Dt(ct.PAGED_ITEM_FILE_SEARCH_STORES, (o) => this.listInternal(o), await this.listInternal(n), n);
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
      const a = PT(e);
      return s = k("fileSearchStores", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
      const a = kT(e);
      return s = k("{name}", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
      const i = NT(e);
      o = k("{name}", i._url), s = i._query, delete i._url, delete i._query, await this.apiClient.request({
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
      const a = BT(e);
      return s = k("fileSearchStores", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = GT(u), d = new t_();
        return Object.assign(d, c), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = OT(e);
      return s = k("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = qT(u), d = new n_();
        return Object.assign(d, c), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = $T(e);
      return s = k("{file_search_store_name}:importFile", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = DT(u), d = new o_();
        return Object.assign(d, c), d;
      });
    }
  }
}, Mp = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Mp = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
}, Ww = () => Mp();
function lr(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var ur = (e) => {
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
}, Be = class extends Error {
}, Ge = class cr extends Be {
  constructor(t, n, o, s) {
    super(`${cr.makeMessage(t, n, o)}`), this.status = t, this.headers = s, this.error = n;
  }
  static makeMessage(t, n, o) {
    const s = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && s ? `${t} ${s}` : t ? `${t} status code (no body)` : s || "(no status code or body)";
  }
  static generate(t, n, o, s) {
    if (!t || !s) return new Fs({
      message: o,
      cause: ur(n)
    });
    const i = n;
    return t === 400 ? new kp(t, i, o, s) : t === 401 ? new Lp(t, i, o, s) : t === 403 ? new Dp(t, i, o, s) : t === 404 ? new $p(t, i, o, s) : t === 409 ? new Up(t, i, o, s) : t === 422 ? new Fp(t, i, o, s) : t === 429 ? new Bp(t, i, o, s) : t >= 500 ? new Gp(t, i, o, s) : new cr(t, i, o, s);
  }
}, dr = class extends Ge {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Fs = class extends Ge {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Np = class extends Fs {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, kp = class extends Ge {
}, Lp = class extends Ge {
}, Dp = class extends Ge {
}, $p = class extends Ge {
}, Up = class extends Ge {
}, Fp = class extends Ge {
}, Bp = class extends Ge {
}, Gp = class extends Ge {
}, Kw = /^[a-z][a-z0-9+.-]*:/i, zw = (e) => Kw.test(e), fr = (e) => (fr = Array.isArray, fr(e)), ac = fr;
function lc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Yw(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var Xw = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new Be(`${e} must be an integer`);
  if (t < 0) throw new Be(`${e} must be a positive integer`);
  return t;
}, Qw = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Zw = (e) => new Promise((t) => setTimeout(t, e));
function jw() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Op(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function e0(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Op({
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
function qp(e) {
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
async function t0(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const o = e.getReader(), s = o.cancel();
  o.releaseLock(), await s;
}
var n0 = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function o0(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new Be(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var s0 = "0.0.1", Vp = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function gi(e, t, n) {
  return Vp(), new File(e, t ?? "unknown_file", n);
}
function i0(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var r0 = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Hp = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", a0 = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Hp(e), l0 = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function u0(e, t, n) {
  if (Vp(), e = await e, a0(e))
    return e instanceof File ? e : gi([await e.arrayBuffer()], e.name);
  if (l0(e)) {
    const s = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), gi(await pr(s), t, n);
  }
  const o = await pr(e);
  if (t || (t = i0(e)), !n?.type) {
    const s = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof s == "string" && (n = Object.assign(Object.assign({}, n), { type: s }));
  }
  return gi(o, t, n);
}
async function pr(e) {
  var t, n, o, s, i;
  let a = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) a.push(e);
  else if (Hp(e)) a.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (r0(e)) try {
    for (var u = !0, c = Ye(e), d; d = await c.next(), t = d.done, !t; u = !0) {
      s = d.value, u = !1;
      const p = s;
      a.push(...await pr(p));
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
    throw new Error(`Unexpected data type: ${typeof e}${p ? `; constructor: ${p}` : ""}${c0(e)}`);
  }
  return a;
}
function c0(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var ta = class {
  constructor(e) {
    this._client = e;
  }
};
ta._key = [];
function Jp(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var uc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), d0 = (e = Jp) => (function(n, ...o) {
  if (n.length === 1) return n[0];
  let s = !1;
  const i = [], a = n.reduce((p, f, h) => {
    var m, g, y;
    /[?#]/.test(f) && (s = !0);
    const _ = o[h];
    let C = (s ? encodeURIComponent : e)("" + _);
    return h !== o.length && (_ == null || typeof _ == "object" && _.toString === ((y = Object.getPrototypeOf((g = Object.getPrototypeOf((m = _.hasOwnProperty) !== null && m !== void 0 ? m : uc)) !== null && g !== void 0 ? g : uc)) === null || y === void 0 ? void 0 : y.toString)) && (C = _ + "", i.push({
      start: p.length + f.length,
      length: C.length,
      error: `Value of type ${Object.prototype.toString.call(_).slice(8, -1)} is not a valid path parameter`
    })), p + f + (h === o.length ? "" : C);
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
    throw new Be(`Path parameters result in path with invalid segments:
${i.map((h) => h.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}), Je = /* @__PURE__ */ d0(Jp), Wp = class extends ta {
  create(e, t) {
    var n;
    const { api_version: o = this._client.apiVersion } = e, s = St(e, ["api_version"]);
    if ("model" in s && "agent_config" in s) throw new Be("Invalid request: specified `model` and `agent_config`. If specifying `model`, use `generation_config`.");
    if ("agent" in s && "generation_config" in s) throw new Be("Invalid request: specified `agent` and `generation_config`. If specifying `agent`, use `agent_config`.");
    return this._client.post(Je`/${o}/interactions`, Object.assign(Object.assign({ body: s }, t), { stream: (n = e.stream) !== null && n !== void 0 ? n : !1 }));
  }
  delete(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.delete(Je`/${o}/interactions/${e}`, n);
  }
  cancel(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.post(Je`/${o}/interactions/${e}/cancel`, n);
  }
  get(e, t = {}, n) {
    var o;
    const s = t ?? {}, { api_version: i = this._client.apiVersion } = s, a = St(s, ["api_version"]);
    return this._client.get(Je`/${i}/interactions/${e}`, Object.assign(Object.assign({ query: a }, n), { stream: (o = t?.stream) !== null && o !== void 0 ? o : !1 }));
  }
};
Wp._key = Object.freeze(["interactions"]);
var Kp = class extends Wp {
}, zp = class extends ta {
  create(e, t) {
    const { api_version: n = this._client.apiVersion, webhook_id: o } = e, s = St(e, ["api_version", "webhook_id"]);
    return this._client.post(Je`/${n}/webhooks`, Object.assign({
      query: { webhook_id: o },
      body: s
    }, t));
  }
  update(e, t, n) {
    const { api_version: o = this._client.apiVersion, update_mask: s } = t, i = St(t, ["api_version", "update_mask"]);
    return this._client.patch(Je`/${o}/webhooks/${e}`, Object.assign({
      query: { update_mask: s },
      body: i
    }, n));
  }
  list(e = {}, t) {
    const n = e ?? {}, { api_version: o = this._client.apiVersion } = n, s = St(n, ["api_version"]);
    return this._client.get(Je`/${o}/webhooks`, Object.assign({ query: s }, t));
  }
  delete(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.delete(Je`/${o}/webhooks/${e}`, n);
  }
  get(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.get(Je`/${o}/webhooks/${e}`, n);
  }
  ping(e, t = void 0, n) {
    const { api_version: o = this._client.apiVersion, body: s } = t ?? {};
    return this._client.post(Je`/${o}/webhooks/${e}:ping`, Object.assign({ body: s }, n));
  }
  rotateSigningSecret(e, t = {}, n) {
    const o = t ?? {}, { api_version: s = this._client.apiVersion } = o, i = St(o, ["api_version"]);
    return this._client.post(Je`/${s}/webhooks/${e}:rotateSigningSecret`, Object.assign({ body: i }, n));
  }
};
zp._key = Object.freeze(["webhooks"]);
var Yp = class extends zp {
};
function f0(e) {
  let t = 0;
  for (const s of e) t += s.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const s of e)
    n.set(s, o), o += s.length;
  return n;
}
var Fo;
function na(e) {
  let t;
  return (Fo ?? (t = new globalThis.TextEncoder(), Fo = t.encode.bind(t)))(e);
}
var Bo;
function cc(e) {
  let t;
  return (Bo ?? (t = new globalThis.TextDecoder(), Bo = t.decode.bind(t)))(e);
}
var Bs = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? na(e) : e;
    this.buffer = f0([this.buffer, n]);
    const o = [];
    let s;
    for (; (s = p0(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (s.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = s.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (s.index !== this.carriageReturnIndex + 1 || s.carriage)) {
        o.push(cc(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const i = this.carriageReturnIndex !== null ? s.preceding - 1 : s.preceding, a = cc(this.buffer.subarray(0, i));
      o.push(a), this.buffer = this.buffer.subarray(s.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), o;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
Bs.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Bs.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function p0(e, t) {
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
var _s = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, dc = (e, t, n) => {
  if (e) {
    if (Yw(_s, e)) return e;
    be(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(_s))}`);
  }
};
function Vn() {
}
function Go(e, t, n) {
  return !t || _s[e] > _s[n] ? Vn : t[e].bind(t);
}
var h0 = {
  error: Vn,
  warn: Vn,
  info: Vn,
  debug: Vn
}, fc = /* @__PURE__ */ new WeakMap();
function be(e) {
  var t;
  const n = e.logger, o = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return h0;
  const s = fc.get(n);
  if (s && s[0] === o) return s[1];
  const i = {
    error: Go("error", n, o),
    warn: Go("warn", n, o),
    info: Go("info", n, o),
    debug: Go("debug", n, o)
  };
  return fc.set(n, [o, i]), i;
}
var Pt = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), m0 = class Hn {
  constructor(t, n, o) {
    this.iterator = t, this.controller = n, this.client = o;
  }
  static fromSSEResponse(t, n, o) {
    let s = !1;
    const i = o ? be(o) : console;
    function a() {
      return ze(this, arguments, function* () {
        var c, d, p, f;
        if (s) throw new Be("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        s = !0;
        let h = !1;
        try {
          try {
            for (var m = !0, g = Ye(g0(t, n)), y; y = yield K(g.next()), c = y.done, !c; m = !0) {
              f = y.value, m = !1;
              const _ = f;
              if (!h)
                if (_.data.startsWith("[DONE]")) {
                  h = !0;
                  continue;
                } else try {
                  yield yield K(JSON.parse(_.data));
                } catch (C) {
                  throw i.error("Could not parse message into JSON:", _.data), i.error("From chunk:", _.raw), C;
                }
            }
          } catch (_) {
            d = { error: _ };
          } finally {
            try {
              !m && !c && (p = g.return) && (yield K(p.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          h = !0;
        } catch (_) {
          if (lr(_)) return yield K(void 0);
          throw _;
        } finally {
          h || n.abort();
        }
      });
    }
    return new Hn(a, n, o);
  }
  static fromReadableStream(t, n, o) {
    let s = !1;
    function i() {
      return ze(this, arguments, function* () {
        var c, d, p, f;
        const h = new Bs(), m = qp(t);
        try {
          for (var g = !0, y = Ye(m), _; _ = yield K(y.next()), c = _.done, !c; g = !0) {
            f = _.value, g = !1;
            const C = f;
            for (const b of h.decode(C)) yield yield K(b);
          }
        } catch (C) {
          d = { error: C };
        } finally {
          try {
            !g && !c && (p = y.return) && (yield K(p.call(y)));
          } finally {
            if (d) throw d.error;
          }
        }
        for (const C of h.flush()) yield yield K(C);
      });
    }
    function a() {
      return ze(this, arguments, function* () {
        var c, d, p, f;
        if (s) throw new Be("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        s = !0;
        let h = !1;
        try {
          try {
            for (var m = !0, g = Ye(i()), y; y = yield K(g.next()), c = y.done, !c; m = !0) {
              f = y.value, m = !1;
              const _ = f;
              h || _ && (yield yield K(JSON.parse(_)));
            }
          } catch (_) {
            d = { error: _ };
          } finally {
            try {
              !m && !c && (p = g.return) && (yield K(p.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          h = !0;
        } catch (_) {
          if (lr(_)) return yield K(void 0);
          throw _;
        } finally {
          h || n.abort();
        }
      });
    }
    return new Hn(a, n, o);
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
    return [new Hn(() => s(t), this.controller, this.client), new Hn(() => s(n), this.controller, this.client)];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Op({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: s, done: i } = await n.next();
          if (i) return o.close();
          const a = na(JSON.stringify(s) + `
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
function g0(e, t) {
  return ze(this, arguments, function* () {
    var o, s, i, a;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new Be("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new Be("Attempted to iterate over a response with no body");
    const u = new _0(), c = new Bs(), d = qp(e.body);
    try {
      for (var p = !0, f = Ye(y0(d)), h; h = yield K(f.next()), o = h.done, !o; p = !0) {
        a = h.value, p = !1;
        const m = a;
        for (const g of c.decode(m)) {
          const y = u.decode(g);
          y && (yield yield K(y));
        }
      }
    } catch (m) {
      s = { error: m };
    } finally {
      try {
        !p && !o && (i = f.return) && (yield K(i.call(f)));
      } finally {
        if (s) throw s.error;
      }
    }
    for (const m of c.flush()) {
      const g = u.decode(m);
      g && (yield yield K(g));
    }
  });
}
function y0(e) {
  return ze(this, arguments, function* () {
    var n, o, s, i;
    try {
      for (var a = !0, u = Ye(e), c; c = yield K(u.next()), n = c.done, !n; a = !0) {
        i = c.value, a = !1;
        const d = i;
        d != null && (yield yield K(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? na(d) : d));
      }
    } catch (d) {
      o = { error: d };
    } finally {
      try {
        !a && !n && (s = u.return) && (yield K(s.call(u)));
      } finally {
        if (o) throw o.error;
      }
    }
  });
}
var _0 = class {
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
    let [t, n, o] = v0(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function v0(e, t) {
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
async function S0(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: s, startTime: i } = t, a = await (async () => {
    var u;
    if (t.options.stream)
      return be(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : m0.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type"), d = (u = c?.split(";")[0]) === null || u === void 0 ? void 0 : u.trim();
    return d?.includes("application/json") || d?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
  })();
  return be(e).debug(`[${o}] response parsed`, Pt({
    retryOfRequestLogID: s,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
var E0 = class Xp extends Promise {
  constructor(t, n, o = S0) {
    super((s) => {
      s(null);
    }), this.responsePromise = n, this.parseResponse = o, this.client = t;
  }
  _thenUnwrap(t) {
    return new Xp(this.client, this.responsePromise, async (n, o) => t(await this.parseResponse(n, o), o));
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
}, Qp = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* T0(e) {
  if (!e) return;
  if (Qp in e) {
    const { values: o, nulls: s } = e;
    yield* o.entries();
    for (const i of s) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : ac(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const s = o[0];
    if (typeof s != "string") throw new TypeError("expected header name to be a string");
    const i = ac(o[1]) ? o[1] : [o[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [s, null]), yield [s, u]);
  }
}
var xn = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const s = /* @__PURE__ */ new Set();
    for (const [i, a] of T0(o)) {
      const u = i.toLowerCase();
      s.has(u) || (t.delete(i), s.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [Qp]: !0,
    values: t,
    nulls: n
  };
}, yi = (e) => {
  var t, n, o, s, i;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((i = (s = (o = globalThis.Deno.env) === null || o === void 0 ? void 0 : o.get) === null || s === void 0 ? void 0 : s.call(o, e)) === null || i === void 0 ? void 0 : i.trim()) || void 0;
}, Zp, jp = class eh {
  constructor(t) {
    var n, o, s, i, a, u, c, { baseURL: d = yi("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: p = (n = yi("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: f = "v1beta" } = t, h = St(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: p,
      apiVersion: f
    }, h), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (o = m.timeout) !== null && o !== void 0 ? o : eh.DEFAULT_TIMEOUT, this.logger = (s = m.logger) !== null && s !== void 0 ? s : console;
    const g = "warn";
    this.logLevel = g, this.logLevel = (a = (i = dc(m.logLevel, "ClientOptions.logLevel", this)) !== null && i !== void 0 ? i : dc(yi("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && a !== void 0 ? a : g, this.fetchOptions = m.fetchOptions, this.maxRetries = (u = m.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = m.fetch) !== null && c !== void 0 ? c : jw(), this.encoder = n0, this._options = m, this.apiKey = p, this.apiVersion = f, this.clientAdapter = m.clientAdapter;
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
    const n = xn([t.headers]);
    if (!(n.values.has("authorization") || n.values.has("x-goog-api-key"))) {
      if (this.apiKey) return xn([{ "x-goog-api-key": this.apiKey }]);
      if (this.clientAdapter && this.clientAdapter.isVertexAI()) return xn([await this.clientAdapter.getAuthHeaders()]);
    }
  }
  stringifyQuery(t) {
    return o0(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${s0}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Ww()}`;
  }
  makeStatusError(t, n, o, s) {
    return Ge.generate(t, n, o, s);
  }
  buildURL(t, n, o) {
    const s = !this.baseURLOverridden() && o || this.baseURL, i = zw(t) ? new URL(t) : new URL(s + (s.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), a = this.defaultQuery(), u = Object.fromEntries(i.searchParams);
    return (!lc(a) || !lc(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), a), n)), typeof n == "object" && n && !Array.isArray(n) && (i.search = this.stringifyQuery(n)), i.toString();
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
    return new E0(this, this.makeRequest(t, n, void 0));
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
    if (be(this).debug(`[${h}] sending request`, Pt({
      retryOfRequestLogID: o,
      method: u.method,
      url: p,
      options: u,
      headers: d.headers
    })), !((i = u.signal) === null || i === void 0) && i.aborted) throw new dr();
    const y = new AbortController(), _ = await this.fetchWithTimeout(p, d, f, y).catch(ur), C = Date.now();
    if (_ instanceof globalThis.Error) {
      const x = `retrying, ${n} attempts remaining`;
      if (!((a = u.signal) === null || a === void 0) && a.aborted) throw new dr();
      const M = lr(_) || /timed? ?out/i.test(String(_) + ("cause" in _ ? String(_.cause) : ""));
      if (n)
        return be(this).info(`[${h}] connection ${M ? "timed out" : "failed"} - ${x}`), be(this).debug(`[${h}] connection ${M ? "timed out" : "failed"} (${x})`, Pt({
          retryOfRequestLogID: o,
          url: p,
          durationMs: C - g,
          message: _.message
        })), this.retryRequest(u, n, o ?? h);
      throw be(this).info(`[${h}] connection ${M ? "timed out" : "failed"} - error; no more retries left`), be(this).debug(`[${h}] connection ${M ? "timed out" : "failed"} (error; no more retries left)`, Pt({
        retryOfRequestLogID: o,
        url: p,
        durationMs: C - g,
        message: _.message
      })), M ? new Np() : new Fs({ cause: _ });
    }
    const b = `[${h}${m}] ${d.method} ${p} ${_.ok ? "succeeded" : "failed"} with status ${_.status} in ${C - g}ms`;
    if (!_.ok) {
      const x = await this.shouldRetry(_);
      if (n && x) {
        const P = `retrying, ${n} attempts remaining`;
        return await t0(_.body), be(this).info(`${b} - ${P}`), be(this).debug(`[${h}] response error (${P})`, Pt({
          retryOfRequestLogID: o,
          url: _.url,
          status: _.status,
          headers: _.headers,
          durationMs: C - g
        })), this.retryRequest(u, n, o ?? h, _.headers);
      }
      const M = x ? "error; no more retries left" : "error; not retryable";
      be(this).info(`${b} - ${M}`);
      const $ = await _.text().catch((P) => ur(P).message), T = Qw($), F = T ? void 0 : $;
      throw be(this).debug(`[${h}] response error (${M})`, Pt({
        retryOfRequestLogID: o,
        url: _.url,
        status: _.status,
        headers: _.headers,
        message: F,
        durationMs: Date.now() - g
      })), this.makeStatusError(_.status, T, F, _.headers);
    }
    return be(this).info(b), be(this).debug(`[${h}] response start`, Pt({
      retryOfRequestLogID: o,
      url: _.url,
      status: _.status,
      headers: _.headers,
      durationMs: C - g
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
    const i = n || {}, { signal: a, method: u } = i, c = St(i, ["signal", "method"]), d = this._makeAbort(s);
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
    return await Zw(a), this.makeRequest(t, n - 1, o);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const i = n - t;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var o, s, i;
    const a = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: p } = a, f = this.buildURL(c, d, p);
    "timeout" in a && Xw("timeout", a.timeout), a.timeout = (o = a.timeout) !== null && o !== void 0 ? o : this.timeout;
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
    let u = xn([
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
    const o = xn([n]);
    return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && o.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: t
    } : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
      bodyHeaders: void 0,
      body: e0(t)
    } : typeof t == "object" && o.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: o
    });
  }
};
jp.DEFAULT_TIMEOUT = 6e4;
var fe = class extends jp {
  constructor() {
    super(...arguments), this.interactions = new Kp(this), this.webhooks = new Yp(this);
  }
};
Zp = fe;
fe.GeminiNextGenAPIClient = Zp;
fe.GeminiNextGenAPIClientError = Be;
fe.APIError = Ge;
fe.APIConnectionError = Fs;
fe.APIConnectionTimeoutError = Np;
fe.APIUserAbortError = dr;
fe.NotFoundError = $p;
fe.ConflictError = Up;
fe.RateLimitError = Bp;
fe.BadRequestError = kp;
fe.AuthenticationError = Lp;
fe.InternalServerError = Gp;
fe.PermissionDeniedError = Dp;
fe.UnprocessableEntityError = Fp;
fe.toFile = u0;
fe.Interactions = Kp;
fe.Webhooks = Yp;
function w0(e, t) {
  const n = {}, o = r(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function A0(e, t) {
  const n = {}, o = r(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function b0(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function C0(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function I0(e, t, n) {
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
function x0(e, t, n) {
  const o = {};
  let s = r(n, ["config", "method"]);
  if (s === void 0 && (s = "SUPERVISED_FINE_TUNING"), s === "SUPERVISED_FINE_TUNING") {
    const T = r(e, ["validationDataset"]);
    t !== void 0 && T != null && l(t, ["supervisedTuningSpec"], _i(T));
  } else if (s === "PREFERENCE_TUNING") {
    const T = r(e, ["validationDataset"]);
    t !== void 0 && T != null && l(t, ["preferenceOptimizationSpec"], _i(T));
  } else if (s === "DISTILLATION") {
    const T = r(e, ["validationDataset"]);
    t !== void 0 && T != null && l(t, ["distillationSpec"], _i(T));
  }
  const i = r(e, ["tunedModelDisplayName"]);
  t !== void 0 && i != null && l(t, ["tunedModelDisplayName"], i);
  const a = r(e, ["description"]);
  t !== void 0 && a != null && l(t, ["description"], a);
  let u = r(n, ["config", "method"]);
  if (u === void 0 && (u = "SUPERVISED_FINE_TUNING"), u === "SUPERVISED_FINE_TUNING") {
    const T = r(e, ["epochCount"]);
    t !== void 0 && T != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "epochCount"
    ], T);
  } else if (u === "PREFERENCE_TUNING") {
    const T = r(e, ["epochCount"]);
    t !== void 0 && T != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "epochCount"
    ], T);
  } else if (u === "DISTILLATION") {
    const T = r(e, ["epochCount"]);
    t !== void 0 && T != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "epochCount"
    ], T);
  }
  let c = r(n, ["config", "method"]);
  if (c === void 0 && (c = "SUPERVISED_FINE_TUNING"), c === "SUPERVISED_FINE_TUNING") {
    const T = r(e, ["learningRateMultiplier"]);
    t !== void 0 && T != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], T);
  } else if (c === "PREFERENCE_TUNING") {
    const T = r(e, ["learningRateMultiplier"]);
    t !== void 0 && T != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], T);
  } else if (c === "DISTILLATION") {
    const T = r(e, ["learningRateMultiplier"]);
    t !== void 0 && T != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], T);
  }
  let d = r(n, ["config", "method"]);
  if (d === void 0 && (d = "SUPERVISED_FINE_TUNING"), d === "SUPERVISED_FINE_TUNING") {
    const T = r(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && T != null && l(t, ["supervisedTuningSpec", "exportLastCheckpointOnly"], T);
  } else if (d === "PREFERENCE_TUNING") {
    const T = r(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && T != null && l(t, ["preferenceOptimizationSpec", "exportLastCheckpointOnly"], T);
  } else if (d === "DISTILLATION") {
    const T = r(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && T != null && l(t, ["distillationSpec", "exportLastCheckpointOnly"], T);
  }
  let p = r(n, ["config", "method"]);
  if (p === void 0 && (p = "SUPERVISED_FINE_TUNING"), p === "SUPERVISED_FINE_TUNING") {
    const T = r(e, ["adapterSize"]);
    t !== void 0 && T != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "adapterSize"
    ], T);
  } else if (p === "PREFERENCE_TUNING") {
    const T = r(e, ["adapterSize"]);
    t !== void 0 && T != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "adapterSize"
    ], T);
  } else if (p === "DISTILLATION") {
    const T = r(e, ["adapterSize"]);
    t !== void 0 && T != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "adapterSize"
    ], T);
  }
  let f = r(n, ["config", "method"]);
  if (f === void 0 && (f = "SUPERVISED_FINE_TUNING"), f === "SUPERVISED_FINE_TUNING") {
    const T = r(e, ["tuningMode"]);
    t !== void 0 && T != null && l(t, ["supervisedTuningSpec", "tuningMode"], T);
  } else if (f === "DISTILLATION") {
    const T = r(e, ["tuningMode"]);
    t !== void 0 && T != null && l(t, ["distillationSpec", "tuningMode"], T);
  }
  const h = r(e, ["customBaseModel"]);
  t !== void 0 && h != null && l(t, ["customBaseModel"], h);
  let m = r(n, ["config", "method"]);
  if (m === void 0 && (m = "SUPERVISED_FINE_TUNING"), m === "SUPERVISED_FINE_TUNING") {
    const T = r(e, ["batchSize"]);
    t !== void 0 && T != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "batchSize"
    ], T);
  } else if (m === "DISTILLATION") {
    const T = r(e, ["batchSize"]);
    t !== void 0 && T != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "batchSize"
    ], T);
  }
  let g = r(n, ["config", "method"]);
  if (g === void 0 && (g = "SUPERVISED_FINE_TUNING"), g === "SUPERVISED_FINE_TUNING") {
    const T = r(e, ["learningRate"]);
    t !== void 0 && T != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRate"
    ], T);
  } else if (g === "DISTILLATION") {
    const T = r(e, ["learningRate"]);
    t !== void 0 && T != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRate"
    ], T);
  }
  const y = r(e, ["labels"]);
  t !== void 0 && y != null && l(t, ["labels"], y);
  const _ = r(e, ["beta"]);
  t !== void 0 && _ != null && l(t, [
    "preferenceOptimizationSpec",
    "hyperParameters",
    "beta"
  ], _);
  const C = r(e, ["baseTeacherModel"]);
  t !== void 0 && C != null && l(t, ["distillationSpec", "baseTeacherModel"], C);
  const b = r(e, ["tunedTeacherModelSource"]);
  t !== void 0 && b != null && l(t, ["distillationSpec", "tunedTeacherModelSource"], b);
  const x = r(e, ["sftLossWeightMultiplier"]);
  t !== void 0 && x != null && l(t, [
    "distillationSpec",
    "hyperParameters",
    "sftLossWeightMultiplier"
  ], x);
  const M = r(e, ["outputUri"]);
  t !== void 0 && M != null && l(t, ["outputUri"], M);
  const $ = r(e, ["encryptionSpec"]);
  return t !== void 0 && $ != null && l(t, ["encryptionSpec"], $), o;
}
function R0(e, t) {
  const n = {}, o = r(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const s = r(e, ["preTunedModel"]);
  s != null && l(n, ["preTunedModel"], s);
  const i = r(e, ["trainingDataset"]);
  i != null && G0(i);
  const a = r(e, ["config"]);
  return a != null && I0(a, n), n;
}
function P0(e, t) {
  const n = {}, o = r(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const s = r(e, ["preTunedModel"]);
  s != null && l(n, ["preTunedModel"], s);
  const i = r(e, ["trainingDataset"]);
  i != null && O0(i, n, t);
  const a = r(e, ["config"]);
  return a != null && x0(a, n, t), n;
}
function M0(e, t) {
  const n = {}, o = r(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function N0(e, t) {
  const n = {}, o = r(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function k0(e, t, n) {
  const o = {}, s = r(e, ["pageSize"]);
  t !== void 0 && s != null && l(t, ["_query", "pageSize"], s);
  const i = r(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const a = r(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), o;
}
function L0(e, t, n) {
  const o = {}, s = r(e, ["pageSize"]);
  t !== void 0 && s != null && l(t, ["_query", "pageSize"], s);
  const i = r(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const a = r(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), o;
}
function D0(e, t) {
  const n = {}, o = r(e, ["config"]);
  return o != null && k0(o, n), n;
}
function $0(e, t) {
  const n = {}, o = r(e, ["config"]);
  return o != null && L0(o, n), n;
}
function U0(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["nextPageToken"]);
  s != null && l(n, ["nextPageToken"], s);
  const i = r(e, ["tunedModels"]);
  if (i != null) {
    let a = i;
    Array.isArray(a) && (a = a.map((u) => th(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function F0(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["nextPageToken"]);
  s != null && l(n, ["nextPageToken"], s);
  const i = r(e, ["tuningJobs"]);
  if (i != null) {
    let a = i;
    Array.isArray(a) && (a = a.map((u) => hr(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function B0(e, t) {
  const n = {}, o = r(e, ["name"]);
  o != null && l(n, ["model"], o);
  const s = r(e, ["name"]);
  return s != null && l(n, ["endpoint"], s), n;
}
function G0(e, t) {
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
function O0(e, t, n) {
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
function th(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["name"]);
  s != null && l(n, ["name"], s);
  const i = r(e, ["state"]);
  i != null && l(n, ["state"], cp(i));
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
  return h != null && l(n, ["tunedModel"], B0(h)), n;
}
function hr(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["name"]);
  s != null && l(n, ["name"], s);
  const i = r(e, ["state"]);
  i != null && l(n, ["state"], cp(i));
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
  const C = r(e, ["distillationSpec"]);
  C != null && l(n, ["distillationSpec"], C);
  const b = r(e, ["tuningDataStats"]);
  b != null && l(n, ["tuningDataStats"], b);
  const x = r(e, ["encryptionSpec"]);
  x != null && l(n, ["encryptionSpec"], x);
  const M = r(e, ["partnerModelTuningSpec"]);
  M != null && l(n, ["partnerModelTuningSpec"], M);
  const $ = r(e, ["customBaseModel"]);
  $ != null && l(n, ["customBaseModel"], $);
  const T = r(e, ["evaluateDatasetRuns"]);
  if (T != null) {
    let qe = T;
    Array.isArray(qe) && (qe = qe.map((Ee) => Ee)), l(n, ["evaluateDatasetRuns"], qe);
  }
  const F = r(e, ["experiment"]);
  F != null && l(n, ["experiment"], F);
  const P = r(e, ["fullFineTuningSpec"]);
  P != null && l(n, ["fullFineTuningSpec"], P);
  const D = r(e, ["labels"]);
  D != null && l(n, ["labels"], D);
  const W = r(e, ["outputUri"]);
  W != null && l(n, ["outputUri"], W);
  const X = r(e, ["pipelineJob"]);
  X != null && l(n, ["pipelineJob"], X);
  const me = r(e, ["serviceAccount"]);
  me != null && l(n, ["serviceAccount"], me);
  const ge = r(e, ["tunedModelDisplayName"]);
  ge != null && l(n, ["tunedModelDisplayName"], ge);
  const se = r(e, ["tuningJobState"]);
  se != null && l(n, ["tuningJobState"], se);
  const te = r(e, ["veoTuningSpec"]);
  te != null && l(n, ["veoTuningSpec"], te);
  const Oe = r(e, ["distillationSamplingSpec"]);
  Oe != null && l(n, ["distillationSamplingSpec"], Oe);
  const Ze = r(e, ["tuningJobMetadata"]);
  return Ze != null && l(n, ["tuningJobMetadata"], Ze), n;
}
function q0(e, t) {
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
function _i(e, t) {
  const n = {}, o = r(e, ["gcsUri"]);
  o != null && l(n, ["validationDatasetUri"], o);
  const s = r(e, ["vertexDatasetResource"]);
  return s != null && l(n, ["validationDatasetUri"], s), n;
}
var V0 = class extends dt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Dt(ct.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
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
          state: er.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = N0(e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => hr(d));
    } else {
      const c = M0(e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => th(d));
    }
  }
  async listInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = $0(e);
      return a = k("tuningJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = F0(d), f = new Uu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = D0(e);
      return a = k("tunedModels", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = U0(d), f = new Uu();
        return Object.assign(f, p), f;
      });
    }
  }
  async cancel(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = A0(e);
      return a = k("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = C0(d), f = new Fu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = w0(e);
      return a = k("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = b0(d), f = new Fu();
        return Object.assign(f, p), f;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = P0(e, e);
      return s = k("tuningJobs", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => hr(u));
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async tuneMldevInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = R0(e);
      return s = k("tunedModels", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => q0(u));
    }
  }
}, H0 = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, J0 = 1024 * 1024 * 8, W0 = 3, K0 = 1e3, z0 = 2, vs = "x-goog-upload-status";
async function Y0(e, t, n, o) {
  var s;
  const i = await nh(e, t, n, o), a = await i?.json();
  if (((s = i?.headers) === null || s === void 0 ? void 0 : s[vs]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return a.file;
}
async function X0(e, t, n, o) {
  var s;
  const i = await nh(e, t, n, o), a = await i?.json();
  if (((s = i?.headers) === null || s === void 0 ? void 0 : s[vs]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = tp(a), c = new c_();
  return Object.assign(c, u), c;
}
async function nh(e, t, n, o) {
  var s, i, a;
  let u = t;
  const c = o?.baseUrl || ((s = n.clientOptions.httpOptions) === null || s === void 0 ? void 0 : s.baseUrl);
  if (c) {
    const m = new URL(c), g = new URL(t);
    g.protocol = m.protocol, g.host = m.host, g.port = m.port, u = g.toString();
  }
  let d = 0, p = 0, f = new nr(new Response()), h = "upload";
  for (d = e.size; p < d; ) {
    const m = Math.min(J0, d - p), g = e.slice(p, p + m);
    p + m >= d && (h += ", finalize");
    let y = 0, _ = K0;
    for (; y < W0; ) {
      const C = Object.assign(Object.assign({}, o?.headers || {}), {
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
          headers: C
        })
      }), !((i = f?.headers) === null || i === void 0) && i[vs]) break;
      y++, await Z0(_), _ = _ * z0;
    }
    if (p += m, ((a = f?.headers) === null || a === void 0 ? void 0 : a[vs]) !== "active") break;
    if (d <= p) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return f;
}
async function Q0(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function Z0(e) {
  return new Promise((t) => setTimeout(t, e));
}
var j0 = class {
  async upload(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await Y0(e, t, n, o);
  }
  async uploadToFileSearchStore(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await X0(e, t, n, o);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await Q0(e);
  }
}, eA = class {
  create(e, t, n) {
    return new tA(e, t, n);
  }
}, tA = class {
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
}, pc = "x-goog-api-key", nA = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(pc) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(pc, this.apiKey);
    }
  }
}, oA = "gl-node/", sA = class {
  getNextGenClient() {
    var e;
    const t = this.httpOptions;
    if (this._nextGenClient === void 0) {
      const n = this.httpOptions;
      this._nextGenClient = new fe({
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
    const n = ky(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const o = new nA(this.apiKey);
    this.apiClient = new ZT({
      auth: o,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: oA + "web",
      uploader: new j0(),
      downloader: new H0()
    }), this.models = new _w(this.apiClient), this.live = new fw(this.apiClient, o, new eA()), this.batches = new pv(this.apiClient), this.chats = new Qv(this.models, this.apiClient), this.caches = new zv(this.apiClient), this.files = new uS(this.apiClient), this.operations = new vw(this.apiClient), this.authTokens = new Uw(this.apiClient), this.tunings = new V0(this.apiClient), this.fileSearchStores = new Jw(this.apiClient);
  }
};
function hc(e, t) {
  const n = globalThis.top?.console || console;
  try {
    n.groupCollapsed(e), n.log(JSON.parse(JSON.stringify(t))), n.groupEnd();
  } catch {
    n.log(e, t);
  }
}
function mc(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function Qt(e) {
  return { text: String(e || "") };
}
function iA(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? { inlineData: {
    mimeType: t[1],
    data: t[2]
  } } : null;
}
function rA(e) {
  if (typeof e == "string") return [Qt(e)];
  if (!Array.isArray(e)) return [Qt("")];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "text" ? Qt(n.text || "") : n.type === "image_url" && n.image_url?.url ? iA(n.image_url.url) : null).filter(Boolean);
  return t.length ? t : [Qt("")];
}
function gc() {
  return {
    role: "user",
    parts: [Qt("继续。")]
  };
}
function aA(e) {
  switch (e) {
    case "high":
      return Yn.HIGH;
    case "medium":
      return Yn.MEDIUM;
    default:
      return Yn.LOW;
  }
}
function yc(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function lA(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  if (t.length)
    return [...new Set(t)].join(`

`);
}
function uA(e) {
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
          response: mc(d.content)
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
        parts: [...a.content ? [Qt(a.content)] : [], ...a.tool_calls.map((u) => ({ functionCall: {
          name: u.function.name,
          args: mc(u.function.arguments)
        } }))]
      });
      continue;
    }
    n.push({
      role: a.role === "assistant" ? "model" : "user",
      parts: rA(a.content)
    });
  }
  if (!n.length) return {
    history: [],
    latestMessage: gc().parts
  };
  const s = n[n.length - 1];
  return s.role === "user" && s.parts?.length ? {
    history: n.slice(0, -1),
    latestMessage: s.parts
  } : {
    history: n,
    latestMessage: gc().parts
  };
}
function cA(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function _c(e, t) {
  const n = String(t || ""), o = String(e || "");
  return n ? !o || n.startsWith(o) ? n : o.endsWith(n) ? o : `${o}${n}` : o;
}
var dA = class {
  constructor(e) {
    this.config = e, this.client = new sA({
      apiKey: e.apiKey,
      httpOptions: {
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 18e4
      }
    });
  }
  async chat(e) {
    const t = uA(e.messages), n = Array.isArray(e.tools) ? e.tools : [], o = lA(e), s = {
      ...o ? { systemInstruction: o } : {},
      temperature: e.temperature,
      ...e.maxTokens ? { maxOutputTokens: e.maxTokens } : {}
    };
    e.reasoning?.enabled && (s.thinkingConfig = {
      includeThoughts: !0,
      thinkingLevel: aA(e.reasoning.effort)
    }), n.length && (s.tools = [{ functionDeclarations: n.map((g) => ({
      name: g.function.name,
      description: g.function.description,
      parameters: g.function.parameters
    })) }]), n.length && e.toolChoice && e.toolChoice !== "auto" && e.toolChoice !== "none" && (s.toolConfig = { functionCallingConfig: { mode: ji.ANY } });
    const i = {
      model: this.config.model,
      history: t.history,
      config: s
    };
    hc("[LittleWhiteBox Assistant] Google AI outgoing create payload", i);
    const a = this.client.chats.create(i), u = {
      message: t.latestMessage,
      config: { abortSignal: e.signal }
    };
    hc("[LittleWhiteBox Assistant] Google AI outgoing send payload", u);
    let c, d, p, f = [];
    if (typeof e.onStreamProgress == "function") {
      const g = await a.sendMessageStream(u), y = /* @__PURE__ */ new Map();
      let _ = "", C = [], b = null;
      for await (const x of g) {
        b = x;
        const M = typeof x.text == "string" ? x.text : (x.candidates?.[0]?.content?.parts || []).map(($) => $.text || "").filter(Boolean).join(`
`);
        _ = _c(_, M), yc(x).forEach(($, T) => {
          const F = `${$.label}:${T}`;
          y.set(F, _c(y.get(F) || "", $.text));
        }), C = (x.functionCalls || []).map(($, T) => ({
          id: $.id || `google-tool-${T + 1}`,
          name: $.name || "",
          arguments: JSON.stringify($.args || {})
        })).filter(($) => $.name), f = C, cA(e, {
          text: _,
          thoughts: Array.from(y.values()).filter(Boolean).map(($, T) => ({
            label: `思考块 ${T + 1}`,
            text: $
          }))
        });
      }
      c = b || { functionCalls: C }, d = Array.from(y.values()).filter(Boolean).map((x, M) => ({
        label: `思考块 ${M + 1}`,
        text: x
      })), p = _;
    } else
      c = await a.sendMessage(u), d = yc(c), p = typeof c.text == "string" ? c.text : (c.candidates?.[0]?.content?.parts || []).map((g) => g.text || "").filter(Boolean).join(`
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
}, oe = {
  LS: "LS",
  GLOB: "Glob",
  GREP: "Grep",
  READ: "Read",
  RUN_SLASH_COMMAND: "RunSlashCommand",
  READ_WORKLOG: "ReadWorklog",
  WRITE_WORKLOG: "WriteWorklog"
}, fA = [
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
], pA = [
  {
    type: "function",
    function: {
      name: oe.LS,
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
      name: oe.GLOB,
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
      name: oe.GREP,
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
      name: oe.READ,
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
      name: oe.RUN_SLASH_COMMAND,
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
      name: oe.READ_WORKLOG,
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
      name: oe.WRITE_WORKLOG,
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
function hA(e, t = null) {
  try {
    return JSON.parse(e || "null");
  } catch {
    return t;
  }
}
function vc(e = [], t) {
  const n = e.slice(0, 3), o = [];
  return n.forEach((s) => o.push(t(s))), e.length > n.length && o.push(`……其余 ${e.length - n.length} 项见详细结果`), o;
}
function mA(e, t = {}) {
  switch (e) {
    case oe.LS:
      return `查看目录 ${t.path || ""}`.trim();
    case oe.GLOB:
      return `匹配文件 ${t.pattern || ""}`.trim();
    case oe.GREP:
      return `搜索内容 ${t.pattern || ""}`.trim();
    case oe.READ:
      return `读取文件 ${t.path || ""}${t.startLine ? `:${t.startLine}` : ""}${t.endLine ? `-${t.endLine}` : ""}`.trim();
    case oe.RUN_SLASH_COMMAND:
      return `执行斜杠命令 ${t.command || ""}`.trim();
    case oe.READ_WORKLOG:
      return "读取工作记录";
    case oe.WRITE_WORKLOG:
      return `写入工作记录 ${t.name || ""}`.trim();
    default:
      return `调用工具 ${e}`;
  }
}
function oh(e) {
  const t = hA(e.content, null);
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
  if (e.toolName === oe.GLOB) {
    const n = Array.isArray(t.items) ? t.items : [], o = [`glob“${t.pattern || ""}”命中 ${t.total || 0} 个文件，当前展示 ${n.length} 个。`];
    t.truncated && o.push("结果已截断，可以把模式或路径范围再收窄一点。"), n.length && (o.push(""), o.push(...vc(n, (i) => `- ${i.publicPath}${i.source ? ` [${i.source}]` : ""}`)));
    const s = n.map((i) => `- ${i.publicPath}${i.source ? ` [${i.source}]` : ""}`);
    return {
      summary: o.join(`
`),
      details: s.join(`
`)
    };
  }
  if (e.toolName === oe.LS) {
    const n = Array.isArray(t.items) ? t.items : [], o = [`目录 ${t.directoryPath || ""} 下找到 ${t.total || 0} 个一级子项，当前展示 ${n.length} 个。`];
    t.truncated && o.push("结果已截断，可以把目录范围再收窄一点。"), n.length && (o.push(""), o.push(...vc(n, (i) => `- ${i.publicPath}${i.type === "directory" ? " [目录]" : ""}`)));
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
  if (e.toolName === oe.GREP) {
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
  if (e.toolName === oe.READ) {
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
  if (e.toolName === oe.RUN_SLASH_COMMAND) {
    const n = [`已执行斜杠命令：${t.command || ""}`, t.ok === !1 ? "状态：失败" : "状态：成功"];
    t.error && n.push(`错误：${t.error}`), t.note && n.push(`说明：${t.note}`);
    let o = "";
    return t.result !== void 0 ? o = typeof t.result == "string" ? t.result : JSON.stringify(t.result, null, 2) : t.raw && (o = typeof t.raw == "string" ? t.raw : JSON.stringify(t.raw, null, 2)), {
      summary: n.filter(Boolean).join(`
`),
      details: o
    };
  }
  return e.toolName === oe.WRITE_WORKLOG ? {
    summary: `工作记录已写入 ${t.name || ""}`.trim(),
    details: ""
  } : e.toolName === oe.READ_WORKLOG ? {
    summary: t.exists ? `已读取工作记录：${t.name || "LittleWhiteBox_Assistant_Worklog.md"}` : `工作记录还不存在：${t.name || "LittleWhiteBox_Assistant_Worklog.md"}`,
    details: t.exists ? String(t.content || "") : ""
  } : {
    summary: JSON.stringify(t, null, 2),
    details: ""
  };
}
var gA = 3.35, yA = /* @__PURE__ */ new Set(["openai-compatible", "openai-responses"]), _A = new TextEncoder();
function vA(e) {
  const { state: t, pendingToolCalls: n, pendingApprovals: o, persistSession: s, render: i, showToast: a, post: u, createRequestId: c, safeJsonParse: d, describeError: p, describeToolCall: f, formatToolResultDisplay: h, buildTextWithAttachmentSummary: m, buildUserContentParts: g, normalizeAttachments: y, normalizeThoughtBlocks: _, normalizeSlashCommand: C, shouldRequireSlashCommandApproval: b, setApprovalStatus: x, buildSlashApprovalResult: M, isAbortError: $, createAdapter: T, getActiveProviderConfig: F, SYSTEM_PROMPT: P, SUMMARY_SYSTEM_PROMPT: D, HISTORY_SUMMARY_PREFIX: W, MAX_CONTEXT_TOKENS: X, SUMMARY_TRIGGER_TOKENS: me, DEFAULT_PRESERVED_TURNS: ge, MIN_PRESERVED_TURNS: se, MAX_TOOL_ROUNDS: te, REQUEST_TIMEOUT_MS: Oe, TOOL_DEFINITIONS: Ze, TOOL_NAMES: qe } = e;
  let Ee = !1, $t = 0, Vs = "", ln = "", fo = 0, ua = 0;
  function yh() {
    t.historySummary = "", t.archivedTurnCount = 0, t.contextStats = {
      usedTokens: 0,
      budgetTokens: X,
      summaryActive: !1
    };
  }
  function _h() {
    return t.historySummary?.trim() ? {
      role: "system",
      content: `${W}
${t.historySummary.trim()}`
    } : null;
  }
  function vh() {
    const w = t.activeRun?.lightBrakeMessage;
    return w ? {
      role: "system",
      content: w
    } : null;
  }
  function ca(w) {
    return `${Math.max(0, Math.round((Number(w) || 0) / 1e3))}k`;
  }
  function Hs(w = t.contextStats) {
    return `${ca(w.usedTokens)}/${ca(w.budgetTokens)}`;
  }
  function po(w, A = 1800) {
    const R = String(w || "").replace(/\s+/g, " ").trim();
    return R.length <= A ? R : `${R.slice(0, A)}…`;
  }
  function da(w) {
    if (w.role === "tool") return po(h(w).summary || w.content || "", 1400);
    if (w.role === "assistant" && Array.isArray(w.toolCalls) && w.toolCalls.length) {
      const A = w.toolCalls.map((R) => `工具: ${R.name} ${R.arguments || "{}"}`.trim());
      return po([w.content || "", ...A].filter(Boolean).join(`
`), 1600);
    }
    return po(m(w.content || "", w.attachments), 1600);
  }
  function fa(w = t.messages) {
    const A = [];
    let R = [];
    return (w || []).forEach((N) => {
      if (N.role === "user" && R.length) {
        A.push(R), R = [N];
        return;
      }
      R.push(N);
    }), R.length && A.push(R), A.filter((N) => N.length);
  }
  function Sh(w, A = "") {
    const R = [];
    return A?.trim() && (R.push("已有历史摘要:"), R.push(A.trim()), R.push("")), w.forEach((N, H) => {
      R.push(`第 ${H + 1} 段历史:`), N.forEach((Y) => {
        const j = Y.role === "user" ? "用户" : Y.role === "assistant" ? "助手" : `工具${Y.toolName ? `(${Y.toolName})` : ""}`;
        R.push(`${j}: ${da(Y) || "[空]"}`);
      }), R.push("");
    }), R.join(`
`).trim();
  }
  function Eh(w, A = "") {
    const R = [];
    return A?.trim() && R.push(A.trim()), w.forEach((N, H) => {
      const Y = N.map((j) => `${j.role === "user" ? "用户" : j.role === "assistant" ? "助手" : `工具${j.toolName ? `(${j.toolName})` : ""}`}: ${da(j) || "[空]"}`).join(`
`);
      R.push(`补充历史 ${H + 1}:
${Y}`);
    }), po(R.join(`

`), 6e3);
  }
  function Th() {
    let w = !1;
    return t.messages = t.messages.map((A) => A?.role !== "assistant" || !Array.isArray(A.thoughts) || !A.thoughts.length ? A : (w = !0, {
      ...A,
      thoughts: []
    })), w;
  }
  function wh(w = []) {
    return w.map((A) => {
      const R = Array.isArray(A.content) ? A.content.map((N) => !N || typeof N != "object" ? "" : N.type === "text" ? N.text || "" : N.type === "image_url" ? `[image:${N.name || N.mimeType || "image"}]` : "").filter(Boolean).join(`
`) : A.content || "";
      return A.role === "assistant" && Array.isArray(A.tool_calls) && A.tool_calls.length ? {
        role: "assistant",
        content: [R, A.tool_calls.map((N) => JSON.stringify({
          id: N.id,
          name: N.function?.name || "",
          arguments: N.function?.arguments || "{}"
        })).join(`
`)].filter(Boolean).join(`
`)
      } : A.role === "tool" ? {
        role: "tool",
        content: [A.tool_call_id || "", A.content || ""].filter(Boolean).join(`
`)
      } : {
        role: A.role,
        content: R
      };
    });
  }
  function Js(w = [], A = []) {
    return [...wh(w), {
      role: "system",
      content: A.length ? `TOOLS
${JSON.stringify(A)}` : ""
    }].filter((R) => R.content);
  }
  function Ah(w) {
    return Math.ceil(_A.encode(String(w || "")).length / gA);
  }
  function ho({ messages: w = [], tools: A = [] } = {}) {
    return Ah(JSON.stringify(Js(w, A)));
  }
  function pa(w = [], A = Ze) {
    const R = F();
    return JSON.stringify({
      provider: String(R?.provider || ""),
      model: String(R?.model || ""),
      messages: Js(w, A)
    });
  }
  function bh(w) {
    const A = String(w?.model || "").trim();
    return A || (w?.provider === "anthropic" ? "claude" : "gpt-4o");
  }
  async function ha(w, A) {
    const R = await fetch(w, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(A)
    });
    if (!R.ok) throw new Error(`tokenizer_http_${R.status}`);
    return await R.json();
  }
  async function Ch(w = [], A = "") {
    if (!w.length) return 0;
    const R = `/api/tokenizers/openai/count?model=${encodeURIComponent(A || "gpt-4o")}`;
    let N = -1;
    for (const H of w) {
      const Y = await ha(R, [H]), j = Number(Y?.token_count);
      if (!Number.isFinite(j)) throw new Error("tokenizer_invalid_response");
      N += j;
    }
    return Math.max(0, N);
  }
  async function Ih(w, A) {
    const R = await ha(w, { text: A }), N = Number(R?.count);
    if (!Number.isFinite(N)) throw new Error("tokenizer_invalid_response");
    return N;
  }
  async function ma({ messages: w = [], tools: A = [] } = {}) {
    const R = F(), N = String(R?.provider || ""), H = Js(w, A), Y = JSON.stringify(H);
    try {
      if (yA.has(N)) return await Ch(H, bh(R));
      if (N === "anthropic") return await Ih("/api/tokenizers/claude/encode", Y);
    } catch {
      return ho({
        messages: w,
        tools: A
      });
    }
    return ho({
      messages: w,
      tools: A
    });
  }
  async function ga(w = [], A = Ze) {
    const R = pa(w, A), N = !!t.historySummary;
    let H = ln === R ? fo : await ma({
      messages: w,
      tools: A
    });
    return Number.isFinite(H) || (H = ho({
      messages: w,
      tools: A
    })), ln = R, fo = H, Vs = R, t.contextStats = {
      usedTokens: H,
      budgetTokens: X,
      summaryActive: N
    }, H;
  }
  function xh(w = [], A = Ze) {
    const R = pa(w, A), N = !!t.historySummary, H = ln === R ? fo : ho({
      messages: w,
      tools: A
    });
    if (Vs = R, t.contextStats = {
      usedTokens: H,
      budgetTokens: X,
      summaryActive: N
    }, ln === R) return;
    const Y = ++ua;
    ma({
      messages: w,
      tools: A
    }).then((j) => {
      if (Y !== ua || Vs !== R || !Number.isFinite(j)) return;
      ln = R, fo = j;
      const Z = t.contextStats.usedTokens !== j || t.contextStats.summaryActive !== N || t.contextStats.budgetTokens !== X;
      t.contextStats = {
        usedTokens: j,
        budgetTokens: X,
        summaryActive: N
      }, Z && i();
    }).catch(() => {
    });
  }
  function Ut(w) {
    w?.role === "user" && Th(), t.messages.push({
      ...w,
      attachments: y(w.attachments),
      thoughts: _(w.thoughts)
    }), t.autoScroll = !0, s();
  }
  function Rh(w) {
    return Array.isArray(w) ? w.filter((A) => A && typeof A == "object" && A.name).map((A, R) => ({
      id: String(A.id || c(`tool-${R + 1}`)),
      name: String(A.name || ""),
      arguments: typeof A.arguments == "string" ? A.arguments : JSON.stringify(A.arguments || {})
    })) : [];
  }
  function ya({ persist: w = !1 } = {}) {
    t.autoScroll = !0;
    const A = Date.now();
    if ((w || A - $t >= 1500) && (s(), $t = A), Ee) return;
    Ee = !0;
    const R = () => {
      Ee = !1, i();
    };
    if (typeof requestAnimationFrame == "function") {
      requestAnimationFrame(R);
      return;
    }
    setTimeout(R, 16);
  }
  function Ph() {
    const w = {
      role: "assistant",
      content: "",
      thoughts: [],
      streaming: !0
    };
    return t.messages.push(w), t.autoScroll = !0, i(), w;
  }
  function _a(w, A = {}) {
    w && (typeof A.content == "string" && (w.content = A.content), Array.isArray(A.thoughts) && (w.thoughts = _(A.thoughts)), Array.isArray(A.toolCalls) && (w.toolCalls = Rh(A.toolCalls)), typeof A.streaming == "boolean" && (w.streaming = A.streaming));
  }
  function Ws(w, A = {}) {
    w && (_a(w, {
      ...A,
      streaming: !1
    }), ya({ persist: !0 }));
  }
  function Mh(w, A) {
    for (const [R, N] of n.entries())
      N.runId === w && (n.delete(R), N.cleanup?.(), N.reject(A));
  }
  function Nh(w, A) {
    for (const [R, N] of o.entries())
      N.runId === w && (o.delete(R), x(R, "cancelled"), N.cleanup?.(), N.reject(A));
  }
  function kh(w = "本轮请求已终止。") {
    const A = t.activeRun;
    A && (A.cancelNotice = w, t.progressLabel = "正在终止…", Mh(A.id, /* @__PURE__ */ new Error("tool_aborted")), Nh(A.id, /* @__PURE__ */ new Error("tool_aborted")), A.controller.abort(), i());
  }
  function Ks(w = t.messages) {
    const A = [{
      role: "system",
      content: P
    }], R = _h(), N = vh();
    R && A.push(R), N && A.push(N);
    for (const H of w) {
      if (H.role === "assistant" && Array.isArray(H.toolCalls) && H.toolCalls.length) {
        A.push({
          role: "assistant",
          content: H.content || "",
          tool_calls: H.toolCalls.map((Y) => ({
            id: Y.id,
            type: "function",
            function: {
              name: Y.name,
              arguments: Y.arguments
            }
          }))
        });
        continue;
      }
      if (H.role === "tool") {
        A.push({
          role: "tool",
          tool_call_id: H.toolCallId,
          content: H.content
        });
        continue;
      }
      A.push({
        role: H.role,
        content: H.role === "user" ? g(H) : H.content
      });
    }
    return A;
  }
  function zs() {
    const w = fa(), A = Math.min(t.archivedTurnCount, w.length);
    return w.slice(A).flat();
  }
  function Lh(w, A, R) {
    const N = String(R?.message || R || "tool_failed"), [H] = N.split(":");
    return {
      ok: !1,
      toolName: w,
      path: typeof A?.path == "string" ? A.path : "",
      error: H || "tool_failed",
      raw: N,
      message: p(R)
    };
  }
  function va(w, A, R) {
    if (!w || !A || !R) return;
    const N = `${A}::${R}`;
    w.toolErrorStreakKey === N ? w.toolErrorStreakCount += 1 : (w.toolErrorStreakKey = N, w.toolErrorStreakCount = 1), w.toolErrorStreakCount >= 3 && w.lastLightBrakeKey !== N && (w.lightBrakeMessage = `系统提醒：刚刚连续三次调用工具 \`${A}\` 都返回了同一个错误：\`${R}\`。请不要继续重复同一路径，改用别的工具、缩小范围，或先向用户确认缺失信息。`, w.lastLightBrakeKey = N);
  }
  function Dh(w) {
    w && (w.toolErrorStreakKey = "", w.toolErrorStreakCount = 0);
  }
  async function $h(w, A, R) {
    if (!A.length) return;
    const N = Sh(A, t.historySummary), H = Eh(A, t.historySummary), Y = F();
    try {
      const j = await w.chat({
        systemPrompt: D,
        messages: [{
          role: "user",
          content: N
        }],
        tools: [],
        toolChoice: "none",
        temperature: Math.min(Y.temperature ?? 0.2, 0.2),
        maxTokens: null,
        signal: R
      });
      t.historySummary = String(j.text || "").trim() || H;
    } catch {
      t.historySummary = H;
    }
  }
  async function Uh(w, A) {
    const R = fa(), N = [ge, se];
    let H = zs(), Y = Ks(H);
    if (await ga(Y), t.contextStats.usedTokens <= me) return Y;
    for (const j of N) {
      const Z = Math.max(t.archivedTurnCount, R.length - Math.min(j, R.length));
      if (Z > t.archivedTurnCount && (await $h(w, R.slice(t.archivedTurnCount, Z), A), t.archivedTurnCount = Z, s()), H = zs(), Y = Ks(H), await ga(Y), t.contextStats.usedTokens <= me)
        return a(`已压缩较早历史，当前上下文 ${Hs()}`), i(), Y;
    }
    return a(`最近对话本身已接近上限，当前上下文 ${Hs()}`), i(), Y;
  }
  function Fh(w, A, R = {}) {
    const N = c("tool"), H = t.activeRun;
    return H && H.id === R.runId && H.toolRequestIds.add(N), new Promise((Y, j) => {
      let Z = !1, ee = null, Te = null;
      const ve = () => {
        ee && (clearTimeout(ee), ee = null), R.signal && Te && R.signal.removeEventListener("abort", Te);
        const wt = t.activeRun;
        wt && wt.id === R.runId && wt.toolRequestIds.delete(N);
      }, ne = (wt) => {
        Z || (Z = !0, n.delete(N), ve(), j(wt));
      }, un = (wt) => {
        Z || (Z = !0, n.delete(N), ve(), Y(wt));
      };
      if (Te = () => {
        u("xb-assistant:tool-abort", { requestId: N }), ne(/* @__PURE__ */ new Error("tool_aborted"));
      }, ee = setTimeout(() => {
        u("xb-assistant:tool-abort", { requestId: N }), ne(/* @__PURE__ */ new Error("tool_timeout"));
      }, Oe), n.set(N, {
        runId: R.runId,
        cleanup: ve,
        resolve: un,
        reject: ne
      }), R.signal) {
        if (R.signal.aborted) {
          Te();
          return;
        }
        R.signal.addEventListener("abort", Te, { once: !0 });
      }
      u("xb-assistant:tool-call", {
        requestId: N,
        name: w,
        arguments: A
      });
    });
  }
  function Bh(w, A = {}) {
    const R = c("approval"), N = t.activeRun?.id === A.runId ? t.activeRun : null;
    return Ut({
      role: "assistant",
      content: "这条斜杠命令会直接作用于你当前打开的真实酒馆实例。请确认是否继续执行。",
      approvalRequest: {
        id: R,
        kind: "slash-command",
        command: w,
        status: "pending"
      }
    }), i(), new Promise((H, Y) => {
      let j = !1, Z = null;
      const ee = () => {
        N && N.toolRequestIds.delete(R), A.signal && Z && A.signal.removeEventListener("abort", Z);
      }, Te = (ne) => {
        j || (j = !0, o.delete(R), ee(), H(ne));
      }, ve = (ne) => {
        j || (j = !0, o.delete(R), ee(), Y(ne));
      };
      if (Z = () => {
        x(R, "cancelled"), ve(/* @__PURE__ */ new Error("tool_aborted"));
      }, N && N.toolRequestIds.add(R), o.set(R, {
        runId: A.runId,
        cleanup: ee,
        resolve: (ne) => {
          x(R, ne ? "approved" : "declined"), Te(ne);
        },
        reject: ve
      }), A.signal) {
        if (A.signal.aborted) {
          Z();
          return;
        }
        A.signal.addEventListener("abort", Z, { once: !0 });
      }
    });
  }
  async function Gh(w) {
    const A = T();
    let R = 0;
    for (; R < te; ) {
      if (w.controller.signal.aborted) throw new Error("assistant_aborted");
      R += 1, t.currentRound = R, t.progressLabel = "正在请求模型…", i();
      const N = F(), H = await Uh(A, w.controller.signal);
      let Y = null;
      const j = (ee = {}) => {
        const Te = typeof ee.text == "string", ve = Array.isArray(ee.thoughts);
        !Te && !ve || (Y || (Y = Ph()), _a(Y, {
          ...Te ? { content: ee.text } : {},
          ...ve ? { thoughts: ee.thoughts } : {}
        }), ya());
      };
      let Z;
      try {
        Z = await A.chat({
          systemPrompt: P,
          messages: H,
          tools: Ze,
          toolChoice: "auto",
          temperature: N.temperature,
          maxTokens: N.maxTokens,
          reasoning: {
            enabled: N.reasoningEnabled,
            effort: N.reasoningEffort
          },
          signal: w.controller.signal,
          onStreamProgress: j
        });
      } catch (ee) {
        throw Y && Ws(Y), ee;
      }
      if (Array.isArray(Z.toolCalls) && Z.toolCalls.length) {
        Y ? Ws(Y, {
          content: Z.text || "",
          thoughts: Z.thoughts,
          toolCalls: Z.toolCalls
        }) : Ut({
          role: "assistant",
          content: Z.text || "",
          toolCalls: Z.toolCalls,
          thoughts: Z.thoughts
        }), i();
        for (const ee of Z.toolCalls) {
          if (w.controller.signal.aborted) throw new Error("assistant_aborted");
          const Te = d(ee.arguments, {}), ve = ee.name === qe.RUN_SLASH_COMMAND ? C(Te.command) : "";
          t.progressLabel = `正在${f(ee.name, Te)}…`, i();
          let ne = null;
          try {
            ee.name === qe.RUN_SLASH_COMMAND && b(ve) && (t.progressLabel = "等待你确认斜杠命令…", i(), await Bh(ve, {
              runId: w.id,
              signal: w.controller.signal
            }) || (ne = M(ve, !1))), ne || (ne = await Fh(ee.name, Te, {
              runId: w.id,
              signal: w.controller.signal
            })), ee.name === qe.RUN_SLASH_COMMAND && ve && ne?.ok !== !1 && b(ve) && (ne = {
              ...ne,
              approval: M(ve, !0)
            }), ne?.ok === !1 && ne.error !== "user_declined" ? va(w, ee.name, ne.error || "tool_failed") : Dh(w);
          } catch (un) {
            if ($(un)) throw un;
            ne = Lh(ee.name, Te, un), va(w, ee.name, ne.error);
          }
          Ut({
            role: "tool",
            toolCallId: ee.id,
            toolName: ee.name,
            content: JSON.stringify(ne, null, 2)
          }), i();
        }
        continue;
      }
      Y ? Ws(Y, {
        content: Z.text || "没有拿到有效回复。",
        thoughts: Z.thoughts
      }) : Ut({
        role: "assistant",
        content: Z.text || "没有拿到有效回复。",
        thoughts: Z.thoughts
      }), t.progressLabel = "", i();
      return;
    }
    Ut({
      role: "assistant",
      content: `这轮工具调用已经到上限了（${te}/${te}）。你可以把问题再收窄一点，比如直接给我模块名、设置项名或报错文本。`
    }), t.progressLabel = "", i();
  }
  return {
    resetCompactionState: yh,
    buildContextMeterLabel: Hs,
    updateContextStats: xh,
    pushMessage: Ut,
    cancelActiveRun: kh,
    toProviderMessages: Ks,
    getActiveContextMessages: zs,
    runAssistantLoop: Gh
  };
}
var SA = "xb-assistant-app", sh = "xb-assistant-root", ih = 18e4, EA = 64, rh = 128e3, TA = 98e3, wA = 2, AA = 1, mr = "littlewhitebox.assistant.session.v2", bA = 60, Sc = 16e3, Lt = 3, Ec = 4 * 1024 * 1024, CA = /* @__PURE__ */ new Set([
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
]), IA = /* @__PURE__ */ new Set([
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
]), ah = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif"
], xA = 2600, RA = 1800, PA = 4200, MA = [{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}], lh = [
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
], NA = [
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
], Xe = "默认", gr = {
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
}, kA = [
  "这个功能的代码入口在哪个文件？",
  "我当前用的是什么 API 和模型？",
  "为什么某个设置勾上后刷新又没了？",
  "帮我查一下某个报错是从哪条链路抛出来的。"
], LA = { chat: {
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
} }, DA = [
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
  [
    "项目结构提示：",
    "你当前运行在 SillyTavern 的 LittleWhiteBox 插件里；LittleWhiteBox 位于 public/scripts/extensions/third-party/LittleWhiteBox/。",
    "你的可读范围是已索引公开前端文件，重点包括 LittleWhiteBox 自身，以及 SillyTavern 的 public/scripts/*；不要假装自己能看到后端、数据库、账号密码或未索引文件。",
    "你用读文件工具时，路径要写成站点根相对公开路径，例如 scripts/extensions/third-party/LittleWhiteBox/index.js，而不是磁盘绝对路径。",
    "如果你需要快速建立 SillyTavern 和 LittleWhiteBox 的目录心智、模块分层和常见入口，请优先读取：scripts/extensions/third-party/LittleWhiteBox/modules/assistant/references/project-structure.md 。",
    "如果用户问 STscript 或 SillyTavern 前端 API，可以优先查看这两份参考资料：scripts/extensions/third-party/LittleWhiteBox/modules/assistant/references/stscript-language-reference.md 与 scripts/extensions/third-party/LittleWhiteBox/modules/assistant/references/sillytavern-javascript-api-reference.md 。"
  ].join(`
`),
  "",
  ...fA,
  "",
  "回答要求：",
  "- 具体、可核对，热情主动，必要时引用文件路径。",
  "- 使用 RunSlashCommand 查询真实实例状态时，可以直接执行查询类命令。",
  "- 如果 RunSlashCommand 可能创建、修改、删除、发送消息、切换状态或重载页面，必须先明确告诉用户准备执行的命令和预期结果，并在用户同意后再执行。",
  "- 执行 RunSlashCommand 后，要如实说明实际执行的命令和工具返回结果，不要美化或改写失败原因。"
].join(`
`), $A = "[历史摘要]", UA = [
  "你要把一段较早的技术支持对话压缩成后续可继续接话的历史摘要。",
  "只保留真正对后续排查有帮助的信息，不要寒暄，不要复述大段源码，不要保留大段 JSON。",
  "必须覆盖这些点：当前目标/问题、已确认结论、未解决点、关键文件路径、关键设置/API/报错文本、用户明确偏好或限制。",
  "如果某项信息不存在，就不要编造。",
  "尽量紧凑清晰，适合直接作为后续上下文继续使用。"
].join(`
`), E = {
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
}, yr = /* @__PURE__ */ new Map(), uh = /* @__PURE__ */ new Map(), Oo = null, Tc = 0, Rn = null;
function Gs(e, t = {}) {
  parent.postMessage({
    source: SA,
    type: e,
    payload: t
  }, window.location.origin);
}
function oa(e) {
  return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function ch(e, t = {}) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return t;
  }
}
function FA() {
  if (Rn !== null) return Rn;
  try {
    Rn = globalThis.Bowser?.parse?.(navigator.userAgent) || {};
  } catch {
    Rn = {};
  }
  return Rn;
}
function BA() {
  return ["mobile", "tablet"].includes(FA()?.platform?.type) ? !0 : window.matchMedia("(pointer: coarse)").matches && window.matchMedia("(max-width: 900px)").matches;
}
function sa(e) {
  const t = String(e || "").trim();
  return t ? t.startsWith("/") ? t : `/${t}` : "";
}
function dh(e) {
  const t = sa(e);
  if (!t) return "";
  const n = t.slice(1).trim();
  return n ? n.split(/\s+/)[0].toLowerCase() : "";
}
function GA(e) {
  const t = sa(e);
  if (!t) return "";
  const n = t.slice(1).trim();
  if (!n) return "";
  const o = n.search(/\s/);
  return o < 0 ? "" : n.slice(o + 1).trim();
}
function _r(e) {
  const t = String(e || "").trim();
  return t ? t.match(/(?:[^\s"]+|"[^"]*")+/g) || [] : [];
}
function os(e) {
  const t = _r(e), n = /* @__PURE__ */ new Map(), o = [];
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
function OA(e) {
  const t = String(e || "").trim();
  return t.length >= 2 && (t.startsWith('"') && t.endsWith('"') || t.startsWith("'") && t.endsWith("'")) ? t.slice(1, -1) : t;
}
function vi(e) {
  const t = OA(e).toLowerCase();
  return [
    "false",
    "off",
    "0",
    "no"
  ].includes(t);
}
function Si(e, t = [], n = {}) {
  const { allowPositional: o = !1 } = n, s = os(e);
  return !o && s.positional.length ? !1 : Array.from(s.named.keys()).every((i) => t.includes(i));
}
function qA(e) {
  const t = dh(e);
  if (!t) return !1;
  if (CA.has(t)) return !0;
  const n = GA(e);
  if (!IA.has(t)) return !1;
  switch (t) {
    case "api":
    case "context":
    case "model":
      return Si(n, ["quiet"]);
    case "tokenizer":
      return _r(n).length === 0;
    case "api-url":
      return Si(n, [
        "api",
        "connect",
        "quiet"
      ]);
    case "instruct":
      return Si(n, ["quiet", "forceGet"]);
    case "instruct-state":
      return _r(n).length === 0;
    case "getchatbook": {
      const o = os(n);
      return !o.positional.length && !o.named.has("name") && o.named.has("create") && vi(o.named.get("create"));
    }
    case "getpersonabook": {
      const o = os(n);
      return o.positional.length || o.named.has("name") ? !1 : o.named.size ? o.named.size === 1 && o.named.has("create") && vi(o.named.get("create")) : !0;
    }
    case "getcharbook": {
      const o = os(n), s = ["type", "create"];
      return !Array.from(o.named.keys()).every((i) => s.includes(i)) || o.named.has("name") || o.named.has("create") && !vi(o.named.get("create")) ? !1 : o.positional.length <= 1;
    }
    default:
      return !1;
  }
}
function VA(e) {
  return dh(e) ? !qA(e) : !1;
}
function HA(e) {
  return E.messages.find((t) => t?.approvalRequest?.id === e) || null;
}
function JA(e, t) {
  const n = HA(e);
  n?.approvalRequest && (n.approvalRequest.status = t, Es());
}
function WA(e, t) {
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
function ss(e) {
  const t = String(e || "");
  return t.length <= Sc ? t : `${t.slice(0, Sc)}

[内容过长，已截断保存]`;
}
function ia(e) {
  return lh.some((t) => t.value === e) ? e : "medium";
}
function Ss() {
  return JSON.parse(JSON.stringify(gr));
}
function We(e) {
  return String(e || "").trim() || Xe;
}
function KA(e = {}) {
  const t = Ss();
  return Object.keys(gr).forEach((n) => {
    t[n] = {
      ...gr[n],
      ...e && typeof e[n] == "object" ? e[n] : {}
    };
  }), t;
}
function eo() {
  return {
    provider: "openai-compatible",
    modelConfigs: Ss()
  };
}
function co(e = {}) {
  const t = e && typeof e.presets == "object" && e.presets ? e.presets : e?.modelConfigs ? { [We(e.currentPresetName || e.presetDraftName || Xe)]: {
    provider: e.provider || "openai-compatible",
    modelConfigs: e.modelConfigs
  } } : {}, n = {};
  Object.entries(t).forEach(([i, a]) => {
    if (!a || typeof a != "object") return;
    const u = We(i);
    n[u] = {
      provider: typeof a.provider == "string" && a.provider.trim() ? a.provider : "openai-compatible",
      modelConfigs: KA(a.modelConfigs || {})
    };
  }), Object.keys(n).length || (n[Xe] = eo());
  const o = n[We(e.currentPresetName)] ? We(e.currentPresetName) : Object.keys(n)[0], s = n[o] || eo();
  return {
    workspaceFileName: String(e.workspaceFileName || ""),
    currentPresetName: o,
    presetDraftName: We(e.presetDraftName || o),
    presetNames: Object.keys(n),
    presets: n,
    provider: s.provider,
    modelConfigs: s.modelConfigs
  };
}
function Os(e) {
  return Array.isArray(e) ? e.map((t) => {
    if (!t || typeof t != "object") return null;
    const n = String(t.text || "").trim();
    return n ? {
      label: String(t.label || "思考块").trim() || "思考块",
      text: n
    } : null;
  }).filter(Boolean) : [];
}
function Tt(e) {
  return Array.isArray(e) ? e.map((t) => {
    if (!t || typeof t != "object" || t.kind !== "image") return null;
    const n = String(t.type || "").trim().toLowerCase(), o = typeof t.dataUrl == "string" ? t.dataUrl.trim() : "", s = o.startsWith("data:image/");
    return n && !ah.includes(n) ? null : {
      kind: "image",
      name: String(t.name || "image").trim() || "image",
      type: n || "image/png",
      dataUrl: s ? o : "",
      size: Math.max(0, Number(t.size) || 0)
    };
  }).filter(Boolean) : [];
}
function zA(e) {
  const t = Tt(e);
  if (!t.length) return "";
  const n = t.map((o) => o.name).join("、");
  return `[附图 ${t.length} 张：${n}]`;
}
function YA(e, t) {
  const n = zA(t), o = String(e || "").trim();
  return n ? [o, n].filter(Boolean).join(`
`) : o;
}
function XA(e = {}) {
  const t = Tt(e.attachments).filter((o) => o.dataUrl), n = [];
  return e.content?.trim() && n.push({
    type: "text",
    text: e.content.trim()
  }), t.forEach((o) => {
    n.push({
      type: "image_url",
      image_url: { url: o.dataUrl },
      mimeType: o.type,
      name: o.name
    });
  }), n.length ? n : [{
    type: "text",
    text: ""
  }];
}
function QA(e) {
  return new Promise((t, n) => {
    const o = new FileReader();
    o.onerror = () => n(/* @__PURE__ */ new Error(`读取图片失败：${e.name || "未命名图片"}`)), o.onload = () => {
      t({
        kind: "image",
        name: ZA(e),
        type: e.type || "image/png",
        size: Number(e.size) || 0,
        dataUrl: typeof o.result == "string" ? o.result : ""
      });
    }, o.readAsDataURL(e);
  });
}
function ZA(e) {
  const t = typeof e?.name == "string" ? e.name.trim() : "";
  if (t) return t;
  const n = jA(e?.type);
  return `clipboard-image-${Date.now()}.${n}`;
}
function jA(e) {
  switch (String(e || "").toLowerCase()) {
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
function eb(e) {
  const t = Array.isArray(e) ? e.filter(Boolean) : [], n = Math.max(0, Lt - E.draftAttachments.length);
  if (!n) return {
    validFiles: [],
    rejectedReason: `最多只能附 ${Lt} 张图片`,
    reachedLimit: !0,
    hadOverflow: !1
  };
  const o = t.slice(0, n), s = [];
  let i = "";
  return o.forEach((a) => {
    if (!ah.includes(a.type)) {
      i = "只支持 PNG、JPG、WEBP、GIF 图片";
      return;
    }
    if ((Number(a.size) || 0) > Ec) {
      i = `单张图片不能超过 ${Math.round(Ec / (1024 * 1024))}MB`;
      return;
    }
    s.push(a);
  }), {
    validFiles: s,
    rejectedReason: i,
    reachedLimit: !1,
    hadOverflow: t.length > n
  };
}
async function wc(e) {
  const t = Array.isArray(e) ? e.filter(Boolean) : [];
  if (!t.length) return !1;
  const { validFiles: n, rejectedReason: o, reachedLimit: s, hadOverflow: i } = eb(t);
  if (!n.length)
    return ut(o || "没有可添加的图片"), s || !!o;
  try {
    const a = await Promise.all(n.map((u) => QA(u)));
    return E.draftAttachments = [...E.draftAttachments, ...a].slice(0, Lt), ie(), (o || i) && ut(o || `最多只能附 ${Lt} 张图片`), !0;
  } catch (a) {
    return ut(String(a?.message || "读取图片失败")), !0;
  }
}
function tb(e) {
  const t = e?.approvalRequest && typeof e.approvalRequest == "object" ? {
    id: String(e.approvalRequest.id || ""),
    kind: String(e.approvalRequest.kind || ""),
    command: String(e.approvalRequest.command || ""),
    status: String(e.approvalRequest.status || "")
  } : null;
  return {
    role: e.role,
    content: ss(e.content),
    attachments: Tt(e.attachments).map((n) => ({
      kind: n.kind,
      name: n.name,
      type: n.type,
      size: n.size
    })),
    toolCallId: e.toolCallId || "",
    toolName: e.toolName || "",
    toolCalls: Array.isArray(e.toolCalls) ? e.toolCalls.map((n) => ({
      id: n.id || "",
      name: n.name || "",
      arguments: ss(n.arguments || "{}")
    })) : [],
    thoughts: Os(e.thoughts).map((n) => ({
      label: n.label,
      text: ss(n.text)
    })),
    approvalRequest: t && t.status && t.status !== "pending" ? t : void 0
  };
}
function nb(e) {
  if (!e || typeof e != "object" || ![
    "user",
    "assistant",
    "tool"
  ].includes(e.role)) return null;
  const t = e.approvalRequest && typeof e.approvalRequest == "object" ? {
    id: String(e.approvalRequest.id || ""),
    kind: String(e.approvalRequest.kind || ""),
    command: String(e.approvalRequest.command || ""),
    status: String(e.approvalRequest.status || "")
  } : void 0;
  return {
    role: e.role,
    content: String(e.content || ""),
    attachments: Tt(e.attachments),
    toolCallId: e.toolCallId ? String(e.toolCallId) : void 0,
    toolName: e.toolName ? String(e.toolName) : void 0,
    toolCalls: Array.isArray(e.toolCalls) ? e.toolCalls.filter((n) => n && typeof n == "object" && n.name).map((n) => ({
      id: String(n.id || oa("tool")),
      name: String(n.name || ""),
      arguments: String(n.arguments || "{}")
    })) : void 0,
    thoughts: Os(e.thoughts),
    approvalRequest: t?.status && t.status !== "pending" ? t : void 0
  };
}
function ob(e) {
  return !(!e || typeof e != "object" || e.streaming || e.approvalRequest?.status === "pending");
}
function Es() {
  try {
    const e = hh().filter(ob).slice(-bA), t = ss(E.historySummary || "");
    if (!e.length && !t) {
      localStorage.removeItem(mr);
      return;
    }
    localStorage.setItem(mr, JSON.stringify({
      messages: e.map(tb),
      historySummary: t,
      sidebarCollapsed: E.sidebarCollapsed
    }));
  } catch {
  }
}
function sb() {
  try {
    const e = ch(localStorage.getItem(mr), {});
    E.messages = Array.isArray(e.messages) ? e.messages.map(nb).filter(Boolean) : [], E.historySummary = String(e.historySummary || ""), E.archivedTurnCount = 0, E.sidebarCollapsed = e.sidebarCollapsed !== void 0 ? !!e.sidebarCollapsed : !0;
  } catch {
    E.messages = [], E.historySummary = "", E.archivedTurnCount = 0, E.sidebarCollapsed = !0;
  }
}
function ut(e) {
  if (E.toast = String(e || "").trim(), Oo && clearTimeout(Oo), !E.toast) {
    ie();
    return;
  }
  const t = Math.max(RA, Math.min(PA, xA + E.toast.length * 18));
  Oo = setTimeout(() => {
    Oo = null, E.toast = "", ie();
  }, t), ie();
}
function ra(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return e?.name === "AbortError" || t === "assistant_aborted" || t === "tool_aborted" || t.includes("aborted");
}
function ib(e) {
  return NA.find((t) => t.value === e)?.label || e;
}
function rb(e) {
  return E.pullStateByProvider[e] || {
    status: "idle",
    message: ""
  };
}
function Ei(e, t) {
  E.pullStateByProvider = {
    ...E.pullStateByProvider,
    [e]: t
  };
}
function Ac(e, t) {
  E.modelOptionsByProvider = {
    ...E.modelOptionsByProvider,
    [e]: Array.isArray(t) ? t : []
  };
}
function ab(e) {
  return Array.isArray(E.modelOptionsByProvider[e]) ? E.modelOptionsByProvider[e] : [];
}
function qo(e, t, n = "") {
  if (e.replaceChildren(), n) {
    const o = document.createElement("option");
    o.value = "", o.textContent = n, e.appendChild(o);
  }
  t.forEach((o) => {
    const s = document.createElement("option");
    s.value = o.value, s.textContent = o.label, e.appendChild(s);
  });
}
function aa(e = []) {
  const t = [...new Set(e.filter(Boolean).map((s) => String(s).trim()).filter(Boolean))], n = LA.chat, o = t.filter((s) => {
    const i = s.toLowerCase();
    return !n.exclude.some((a) => i.includes(a));
  });
  return o.length ? o : t;
}
function qs(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function to(e = []) {
  return [...new Set(e.filter(Boolean).map((t) => String(t).trim()).filter(Boolean))];
}
function lb(e) {
  const t = qs(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return to([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return to([`${t}/v1/models`, `${t}/models`]);
}
function ub(e) {
  const t = qs(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return to([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return to([`${t}/v1/models`, `${t}/models`]);
}
function cb(e, t) {
  const n = qs(e);
  if (!n) return [];
  const o = n.endsWith("/v1beta") ? n.slice(0, -7) : n;
  return to([
    `${n}/models?key=${encodeURIComponent(t)}`,
    `${n}/models`,
    `${o}/v1beta/models?key=${encodeURIComponent(t)}`,
    `${o}/v1beta/models`,
    `${o}/models?key=${encodeURIComponent(t)}`,
    `${o}/models`
  ]);
}
function db(e, t) {
  const n = [
    e?.error?.message,
    e?.message,
    e?.detail,
    e?.details,
    e?.error
  ].find((o) => typeof o == "string" && o.trim());
  return n ? n.trim() : String(t || "").trim().slice(0, 160);
}
async function fb(e, t = {}) {
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
    errorSnippet: db(s, o)
  };
}
function pb(e) {
  return aa((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function hb(e) {
  return aa((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function mb(e) {
  return aa((e?.models || e?.data || []).map((t) => String(t?.id || t?.name || "")).map((t) => t.split("/").pop() || "").filter(Boolean));
}
async function Ti({ urls: e, requestOptionsList: t, extractModels: n, providerLabel: o }) {
  let s = null;
  for (const i of e) for (const a of t) {
    const u = await fb(i, a);
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
async function gb(e) {
  const t = e.provider, n = qs(e.baseUrl || ""), o = String(e.apiKey || "").trim();
  if (!o) throw new Error("请先填写 API Key。");
  if (!n) throw new Error("请先填写 Base URL。");
  return t === "google" ? await Ti({
    urls: cb(n, o),
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
    extractModels: mb,
    providerLabel: "Google AI"
  }) : t === "anthropic" ? await Ti({
    urls: ub(n),
    requestOptionsList: [{ headers: {
      "x-api-key": o,
      "anthropic-version": "2023-06-01",
      Accept: "application/json"
    } }],
    extractModels: hb,
    providerLabel: "Anthropic"
  }) : await Ti({
    urls: lb(n),
    requestOptionsList: [{ headers: {
      Authorization: `Bearer ${o}`,
      Accept: "application/json"
    } }],
    extractModels: pb,
    providerLabel: t === "openai-responses" ? "OpenAI Responses" : "OpenAI-Compatible"
  });
}
function vr(e) {
  const t = String(e?.message || e || "unknown_error"), n = t.toLowerCase();
  return e?.rawDisplay ? String(e.rawDisplay) : ra(e) ? "本轮请求已终止。" : n === "tool_timeout" ? "工具调用超时了（180 秒），可以重试，或把问题收窄一点。" : n.startsWith("workspace_write_failed:") ? "工作区写入失败，请检查酒馆文件权限或稍后重试。" : n.startsWith("manifest_load_failed:") ? "助手索引文件清单加载失败，请刷新页面后再试。" : n.startsWith("file_read_failed:") ? "读取源码文件失败了，请换个文件再试，或刷新页面重试。" : n === "file_not_indexed" ? "这个文件不在当前助手索引范围里。" : n === "directory_path_required" ? "还没有提供要查看的目录路径。" : n === "glob_pattern_required" ? "还没有提供 glob 路径模式。" : n === "empty_query" ? "搜索词是空的，换一个明确点的关键词就行。" : t;
}
function yb(e) {
  return String(e || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function _b(e) {
  const t = String(e || "").trim();
  if (!t) return "";
  try {
    const n = globalThis.parent?.showdown || globalThis.showdown, o = globalThis.parent?.DOMPurify || globalThis.DOMPurify;
    if (n?.Converter && o?.sanitize) {
      const s = new n.Converter({
        simpleLineBreaks: !0,
        strikethrough: !0,
        tables: !0,
        tasklists: !0,
        ghCodeBlocks: !0,
        simplifiedAutoLink: !0,
        openLinksInNewWindow: !0,
        emoji: !1
      }).makeHtml(t);
      return o.sanitize(s, {
        USE_PROFILES: { html: !0 },
        FORBID_TAGS: ["style", "script"]
      });
    }
  } catch {
  }
  return yb(t).replace(/\n/g, "<br>");
}
function fh(e) {
  const t = new DOMParser().parseFromString(`<body>${String(e || "")}</body>`, "text/html"), n = document.createDocumentFragment();
  return Array.from(t.body.childNodes).forEach((o) => {
    n.appendChild(document.importNode(o, !0));
  }), n;
}
function ph(e, t = [], n = {}) {
  const o = Tt(t);
  e.replaceChildren(), e.style.display = o.length ? "" : "none", o.length && o.forEach((s, i) => {
    const a = document.createElement("div");
    if (a.className = n.compact ? "xb-assistant-attachment-card compact" : "xb-assistant-attachment-card", s.dataUrl) {
      const c = document.createElement("img");
      c.className = "xb-assistant-attachment-image", c.src = s.dataUrl, c.alt = s.name, a.appendChild(c);
    } else {
      const c = document.createElement("div");
      c.className = "xb-assistant-attachment-placeholder", c.textContent = "图片", a.appendChild(c);
    }
    const u = document.createElement("div");
    if (u.className = "xb-assistant-attachment-name", u.textContent = s.name, a.appendChild(u), typeof n.onRemove == "function") {
      const c = document.createElement("button");
      c.type = "button", c.className = "xb-assistant-attachment-remove", c.textContent = "×", c.title = "移除图片", c.addEventListener("click", () => n.onRemove(i)), a.appendChild(c);
    }
    e.appendChild(a);
  });
}
function la() {
  const e = E.config || {}, t = e.provider || "openai-compatible", n = (e.modelConfigs || {})[t] || {};
  return {
    provider: t,
    baseUrl: n.baseUrl || "",
    model: n.model || "",
    apiKey: n.apiKey || "",
    temperature: Number(n.temperature ?? 0.2),
    maxTokens: null,
    timeoutMs: ih,
    toolMode: n.toolMode || "native",
    reasoningEnabled: !!n.reasoningEnabled,
    reasoningEffort: ia(n.reasoningEffort)
  };
}
function vb() {
  const e = la();
  if (!e.apiKey) throw new Error("请先在小白助手里填写当前提供商的 API Key。");
  switch (e.provider) {
    case "openai-responses":
      return new bg(e);
    case "anthropic":
      return new by(e);
    case "google":
      return new dA(e);
    default:
      return new hg(e);
  }
}
var { resetCompactionState: Sb, buildContextMeterLabel: Eb, updateContextStats: Tb, pushMessage: wi, cancelActiveRun: wb, toProviderMessages: Ab, getActiveContextMessages: hh, runAssistantLoop: bb } = vA({
  state: E,
  pendingToolCalls: yr,
  pendingApprovals: uh,
  persistSession: Es,
  render: ie,
  showToast: ut,
  post: Gs,
  createRequestId: oa,
  safeJsonParse: ch,
  describeError: vr,
  describeToolCall: mA,
  formatToolResultDisplay: oh,
  buildTextWithAttachmentSummary: YA,
  buildUserContentParts: XA,
  normalizeAttachments: Tt,
  normalizeThoughtBlocks: Os,
  normalizeSlashCommand: sa,
  shouldRequireSlashCommandApproval: VA,
  setApprovalStatus: JA,
  buildSlashApprovalResult: WA,
  isAbortError: ra,
  createAdapter: vb,
  getActiveProviderConfig: la,
  SYSTEM_PROMPT: DA,
  SUMMARY_SYSTEM_PROMPT: UA,
  HISTORY_SUMMARY_PREFIX: $A,
  MAX_CONTEXT_TOKENS: rh,
  SUMMARY_TRIGGER_TOKENS: TA,
  DEFAULT_PRESERVED_TURNS: wA,
  MIN_PRESERVED_TURNS: AA,
  MAX_TOOL_ROUNDS: EA,
  REQUEST_TIMEOUT_MS: ih,
  TOOL_DEFINITIONS: pA,
  TOOL_NAMES: oe
});
function Ai(e) {
  E.config = co(e || {}), ie();
}
function Cb(e, t) {
  return {
    baseUrl: e.querySelector("#xb-assistant-base-url").value.trim(),
    model: e.querySelector("#xb-assistant-model").value.trim(),
    apiKey: e.querySelector("#xb-assistant-api-key").value.trim(),
    temperature: Number(((E.config?.modelConfigs || {})[t] || {}).temperature ?? 0.2),
    reasoningEnabled: e.querySelector("#xb-assistant-reasoning-enabled")?.checked || !1,
    reasoningEffort: ia(e.querySelector("#xb-assistant-reasoning-effort")?.value),
    toolMode: t === "openai-compatible" ? e.querySelector("#xb-assistant-tool-mode")?.value || "native" : void 0
  };
}
function mh(e) {
  E.config && (E.config.presetDraftName = We(e.querySelector("#xb-assistant-preset-name")?.value));
}
function _t(e) {
  if (!E.config) return;
  mh(e);
  const t = e.querySelector("#xb-assistant-provider").value, n = We(E.config.currentPresetName);
  E.config = {
    ...co({
      ...E.config,
      currentPresetName: n,
      presetDraftName: E.config.presetDraftName,
      presets: {
        ...E.config.presets || {},
        [n]: {
          ...(E.config.presets || {})[n] || eo(),
          provider: t,
          modelConfigs: {
            ...((E.config.presets || {})[n] || {}).modelConfigs || Ss(),
            [t]: {
              ...(((E.config.presets || {})[n] || {}).modelConfigs || Ss())[t] || {},
              ...Cb(e, t)
            }
          }
        }
      }
    }),
    provider: t
  };
}
function Ib(e) {
  return JSON.stringify({
    role: e.role,
    content: String(e.content || ""),
    toolCallId: String(e.toolCallId || ""),
    toolName: String(e.toolName || ""),
    toolCalls: Array.isArray(e.toolCalls) ? e.toolCalls.map((t) => ({
      id: String(t.id || ""),
      name: String(t.name || ""),
      arguments: String(t.arguments || "")
    })) : [],
    thoughts: Os(e.thoughts),
    attachments: Tt(e.attachments).map((t) => ({
      kind: t.kind,
      name: t.name,
      type: t.type,
      size: t.size
    })),
    approvalRequest: e.approvalRequest ? {
      id: String(e.approvalRequest.id || ""),
      kind: String(e.approvalRequest.kind || ""),
      command: String(e.approvalRequest.command || ""),
      status: String(e.approvalRequest.status || "")
    } : null,
    streaming: !!e.streaming
  });
}
function xb(e) {
  const t = document.createElement("div");
  t.className = `xb-assistant-bubble role-${e.role}`;
  const n = document.createElement("div");
  if (n.className = "xb-assistant-meta", n.textContent = e.role === "user" ? "你" : e.role === "assistant" ? Array.isArray(e.toolCalls) && e.toolCalls.length ? `小白助手 · 已发起 ${e.toolCalls.length} 个工具调用${Array.isArray(e.thoughts) && e.thoughts.length ? ` · 含 ${e.thoughts.length} 段思考` : ""}` : `小白助手${e.streaming ? " · 正在生成" : ""}${Array.isArray(e.thoughts) && e.thoughts.length ? ` · 含 ${e.thoughts.length} 段思考` : ""}` : `工具结果${e.toolName ? ` · ${e.toolName}` : ""}`, e.role === "tool") {
    const s = oh(e), i = document.createElement("pre");
    if (i.className = "xb-assistant-content tool-summary", i.textContent = s.summary || "工具已返回结果。", t.append(n, i), s.details) {
      const a = document.createElement("details");
      a.className = "xb-assistant-tool-details";
      const u = document.createElement("summary");
      u.textContent = e.toolName === oe.READ ? "展开文件内容" : "展开详细结果";
      const c = document.createElement("pre");
      c.className = "xb-assistant-content tool-detail", c.textContent = s.details, a.append(u, c), t.appendChild(a);
    }
    return t;
  }
  const o = document.createElement("div");
  if (o.className = "xb-assistant-content xb-assistant-markdown", o.appendChild(fh(_b(e.content || (e.role === "assistant" ? e.streaming ? "思考中…" : "我先查一下相关代码。" : "")))), t.append(n, o), Array.isArray(e.attachments) && e.attachments.length) {
    const s = document.createElement("div");
    s.className = "xb-assistant-attachment-gallery", ph(s, e.attachments, { compact: !0 }), t.appendChild(s);
  }
  if (e.role === "assistant" && e.approvalRequest?.kind === "slash-command") {
    const s = document.createElement("div");
    s.className = "xb-assistant-approval";
    const i = document.createElement("div");
    i.className = "xb-assistant-approval-title", i.textContent = "待确认的斜杠命令";
    const a = document.createElement("pre");
    a.className = "xb-assistant-content xb-assistant-approval-command", a.textContent = e.approvalRequest.command || "";
    const u = document.createElement("div");
    if (u.className = "xb-assistant-approval-note", u.textContent = e.approvalRequest.status === "approved" ? "已同意，命令已进入执行流程。" : e.approvalRequest.status === "declined" ? "已拒绝，本次不会执行这条命令。" : e.approvalRequest.status === "cancelled" ? "本轮请求已终止，这条命令未执行。" : "这条命令可能改动真实实例状态；点“是”后才会真正执行。", s.append(i, a, u), e.approvalRequest.status === "pending") {
      const c = document.createElement("div");
      c.className = "xb-assistant-approval-actions";
      const d = document.createElement("button");
      d.type = "button", d.className = "xb-assistant-approval-button", d.dataset.approvalId = e.approvalRequest.id, d.dataset.approvalDecision = "approve", d.textContent = "是，执行";
      const p = document.createElement("button");
      p.type = "button", p.className = "xb-assistant-approval-button secondary", p.dataset.approvalId = e.approvalRequest.id, p.dataset.approvalDecision = "decline", p.textContent = "否，跳过", c.append(d, p), s.appendChild(c);
    }
    t.appendChild(s);
  }
  if (e.role === "assistant" && Array.isArray(e.thoughts) && e.thoughts.length) {
    const s = document.createElement("details");
    s.className = "xb-assistant-thought-details";
    const i = document.createElement("summary");
    i.textContent = e.thoughts.length > 1 ? `展开思考块（${e.thoughts.length} 段）` : "展开思考块", s.appendChild(i), e.thoughts.forEach((a) => {
      const u = document.createElement("div");
      u.className = "xb-assistant-thought-block";
      const c = document.createElement("div");
      c.className = "xb-assistant-thought-label", c.textContent = a.label;
      const d = document.createElement("pre");
      d.className = "xb-assistant-content xb-assistant-thought-content", d.textContent = a.text, u.append(c, d), s.appendChild(u);
    }), t.appendChild(s);
  }
  return t;
}
function Rb(e) {
  const t = Array.from(e.querySelectorAll(".xb-assistant-bubble"));
  if (!E.messages.length) {
    e.innerHTML = "";
    const o = document.createElement("div");
    o.className = "xb-assistant-empty", o.innerHTML = "<h2>你好，我是小白助手</h2><p>我运行在你当前打开的 SillyTavern 酒馆里，专门帮你解答 LittleWhiteBox 和酒馆前端的问题。</p><p><strong>我能做什么：</strong></p><ul><li><strong>查看源码</strong>：读取 LittleWhiteBox 和酒馆前端的代码快照（构建时索引），帮你找按钮位置、设置逻辑、报错链路。</li><li><strong>查询实例</strong>：执行斜杠命令查询你当前酒馆的实时状态，比如当前 API、模型、角色、扩展开关等。</li><li><strong>记录工作</strong>：把排查结论写到 <code>user/files/LittleWhiteBox_Assistant_Worklog.md</code>，方便你后续查看。</li></ul><p><strong>我不能做什么：</strong></p><ul><li>不能访问后端代码、数据库、API Key 存储位置。</li><li>不能修改你的源码或配置文件。</li><li>代码快照可能不包含你最新的修改；如需确认当前实例状态，我会用斜杠命令查询。</li></ul><p>下面是一些示例问题，点击后会填入输入框（不会自动发送）：</p>";
    const s = document.createElement("div");
    s.className = "xb-assistant-examples", kA.forEach((i) => {
      const a = document.createElement("button");
      a.type = "button", a.className = "xb-assistant-example-chip", a.dataset.prompt = i, a.textContent = i, s.appendChild(a);
    }), o.appendChild(s), e.appendChild(o);
    return;
  }
  const n = e.querySelector(".xb-assistant-empty");
  n && n.remove(), E.messages.forEach((o, s) => {
    const i = Ib(o), a = t[s] || null;
    if (a?.dataset.renderSignature === i) return;
    const u = xb(o);
    u.dataset.renderSignature = i, a ? e.replaceChild(u, a) : e.appendChild(u);
  }), t.slice(E.messages.length).forEach((o) => o.remove()), E.autoScroll && (e.scrollTop = e.scrollHeight);
}
function gh(e) {
  if (!e) return;
  const t = () => {
    e.scrollTop = e.scrollHeight;
  };
  t(), requestAnimationFrame(() => {
    t(), requestAnimationFrame(t);
  });
}
function Pb(e) {
  const t = `
        <div class="xb-assistant-shell ${E.sidebarCollapsed ? "sidebar-collapsed" : ""}">
            <aside class="xb-assistant-sidebar ${E.sidebarCollapsed ? "is-collapsed" : ""}">
                <div class="xb-assistant-sidebar-header">
                    <div class="xb-assistant-badge">API配置</div>
                    <button id="xb-assistant-sidebar-toggle" type="button" class="xb-assistant-sidebar-toggle" aria-expanded="${E.sidebarCollapsed ? "false" : "true"}" aria-label="${E.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置"}" title="${E.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置"}">
                        <span class="xb-assistant-sidebar-toggle-text"></span>
                        <span class="xb-assistant-sidebar-toggle-icon"></span>
                    </button>
                </div>
                <div class="xb-assistant-sidebar-content" ${E.sidebarCollapsed ? "hidden" : ""}>
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
                <section class="xb-assistant-chat" id="xb-assistant-chat"></section>
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
  e.replaceChildren(fh(t));
}
function Mb(e) {
  if (!E.config) return;
  const t = E.config.provider || "openai-compatible", n = (E.config.modelConfigs || {})[t] || {}, o = ab(t), s = e.querySelector("#xb-assistant-tool-mode-wrap"), i = e.querySelector("#xb-assistant-tool-mode"), a = e.querySelector("#xb-assistant-reasoning-enabled"), u = e.querySelector("#xb-assistant-reasoning-effort-wrap"), c = e.querySelector("#xb-assistant-reasoning-effort"), d = e.querySelector("#xb-assistant-model-pulled"), p = e.querySelector("#xb-assistant-preset-select"), f = e.querySelector("#xb-assistant-preset-name");
  qo(p, (E.config.presetNames || []).map((g) => ({
    value: g,
    label: g
  }))), p.value = E.config.currentPresetName || Xe, f.value = E.config.presetDraftName || E.config.currentPresetName || Xe, e.querySelector("#xb-assistant-provider").value = t, e.querySelector("#xb-assistant-base-url").value = n.baseUrl || "", e.querySelector("#xb-assistant-model").value = n.model || "", e.querySelector("#xb-assistant-api-key").value = n.apiKey || "", s.style.display = t === "openai-compatible" ? "" : "none", qo(i, MA), i.value = n.toolMode || "native", qo(c, lh), a.checked = !!n.reasoningEnabled, c.value = ia(n.reasoningEffort), u.style.display = a.checked ? "" : "none", qo(d, o.map((g) => ({
    value: g,
    label: g
  })), "手动填写");
  const h = e.querySelector("#xb-assistant-runtime"), m = rb(t);
  h.textContent = E.runtime ? `预设「${E.config.currentPresetName || Xe}」 · ${ib(t)} · 已索引 ${E.runtime.indexedFileCount || 0} 个前端源码文件${m.message ? ` · ${m.message}` : ""}` : m.message || "";
}
function Nb(e) {
  _t(e);
  const t = We(e.querySelector("#xb-assistant-preset-name")?.value), n = We(E.config?.currentPresetName || Xe), o = (E.config?.presets || {})[t];
  if (t !== n && o) {
    ut(`预设「${t}」已存在，请从下拉切换到它；如果要新建，请换个名字。`), ie();
    return;
  }
  const s = (E.config?.presets || {})[n] || eo(), i = {
    ...E.config?.presets || {},
    [t]: s
  };
  E.config = co({
    ...E.config,
    currentPresetName: t,
    presetDraftName: t,
    presets: i
  }), Gs("xb-assistant:save-config", {
    workspaceFileName: E.config?.workspaceFileName || "",
    currentPresetName: E.config?.currentPresetName || Xe,
    presets: E.config?.presets || {}
  });
}
function kb(e) {
  if (_t(e), Object.keys(E.config?.presets || {}).length <= 1) {
    ut("至少要保留一套预设");
    return;
  }
  const t = We(E.config?.currentPresetName || Xe), n = { ...E.config?.presets || {} };
  delete n[t];
  const o = Object.keys(n)[0] || Xe;
  E.config = co({
    ...E.config,
    currentPresetName: o,
    presetDraftName: o,
    presets: n
  }), Gs("xb-assistant:save-config", {
    workspaceFileName: E.config?.workspaceFileName || "",
    currentPresetName: E.config?.currentPresetName || Xe,
    presets: E.config?.presets || {}
  }), ie();
}
function Lb() {
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
            .xb-assistant-actions {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }
    `, document.head.appendChild(e);
}
function ie() {
  const e = document.getElementById(sh);
  if (!e) return;
  e.firstChild || (Pb(e), Db(e)), Mb(e), Tb(Ab(hh()));
  const t = e.querySelector("#xb-assistant-chat");
  Rb(t);
  const n = E.messages.length !== Tc;
  Tc = E.messages.length, (E.autoScroll || n) && gh(t);
  const o = e.querySelector("#xb-assistant-send");
  o.disabled = !1, o.classList.toggle("is-busy", E.isBusy), o.textContent = E.isBusy ? "终止" : "发送";
  const s = e.querySelector("#xb-assistant-add-image");
  s.disabled = E.isBusy || E.draftAttachments.length >= Lt, s.textContent = E.draftAttachments.length ? `发图（${E.draftAttachments.length}/${Lt}）` : "发图";
  const i = e.querySelector("#xb-assistant-clear");
  i.disabled = E.isBusy || !E.messages.length;
  const a = e.querySelector("#xb-assistant-delete-preset");
  a.disabled = E.isBusy || (E.config?.presetNames || []).length <= 1;
  const u = e.querySelector("#xb-assistant-pull-models");
  u.disabled = E.isBusy;
  const c = e.querySelector("#xb-assistant-status");
  c.textContent = E.progressLabel || "就绪", c.classList.toggle("busy", E.isBusy);
  const d = e.querySelector("#xb-assistant-context-meter");
  d.textContent = Eb(), d.classList.toggle("summary-active", !!E.contextStats.summaryActive), d.title = E.contextStats.summaryActive ? "当前实际送模上下文 / 128k（已压缩较早历史）" : "当前实际送模上下文 / 128k";
  const p = e.querySelector("#xb-assistant-toast");
  p.textContent = E.toast || "", p.classList.toggle("visible", !!E.toast);
  const f = e.querySelector(".xb-assistant-shell"), h = e.querySelector(".xb-assistant-sidebar"), m = e.querySelector("#xb-assistant-sidebar-toggle"), g = e.querySelector(".xb-assistant-sidebar-content");
  if (f?.classList.toggle("sidebar-collapsed", !!E.sidebarCollapsed), h?.classList.toggle("is-collapsed", !!E.sidebarCollapsed), g?.toggleAttribute("hidden", !!E.sidebarCollapsed), m) {
    const _ = window.matchMedia("(max-width: 900px)").matches;
    m.setAttribute("aria-expanded", E.sidebarCollapsed ? "false" : "true"), m.setAttribute("aria-label", E.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置"), m.title = E.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置";
    const C = m.querySelector(".xb-assistant-sidebar-toggle-text"), b = m.querySelector(".xb-assistant-sidebar-toggle-icon");
    C && (C.textContent = _ ? E.sidebarCollapsed ? "展开设置" : "收起设置" : ""), b && (b.textContent = _ ? E.sidebarCollapsed ? "▼" : "▲" : E.sidebarCollapsed ? "⚙" : "‹");
  }
  ph(e.querySelector("#xb-assistant-draft-gallery"), E.draftAttachments, { onRemove: (_) => {
    E.draftAttachments = E.draftAttachments.filter((C, b) => b !== _), ie();
  } });
  const y = e.querySelector("#xb-assistant-toggle-key");
  y.textContent = e.querySelector("#xb-assistant-api-key").type === "password" ? "显示" : "隐藏";
}
function Db(e) {
  const t = e.querySelector("#xb-assistant-input"), n = e.querySelector("#xb-assistant-image-input"), o = () => {
    t.style.height = "auto", t.style.height = `${Math.min(Math.max(t.scrollHeight, 92), 240)}px`;
  };
  e.querySelector("#xb-assistant-sidebar-toggle")?.addEventListener("click", () => {
    E.sidebarCollapsed = !E.sidebarCollapsed, Es(), ie();
  }), e.querySelector("#xb-assistant-chat").addEventListener("scroll", (s) => {
    const i = s.currentTarget;
    E.autoScroll = i.scrollHeight - i.scrollTop - i.clientHeight <= 48;
  }), e.querySelector("#xb-assistant-chat").addEventListener("click", (s) => {
    const i = s.target.closest(".xb-assistant-example-chip");
    if (i) {
      t.value = i.dataset.prompt || "", o(), t.focus(), E.autoScroll = !0, gh(e.querySelector("#xb-assistant-chat"));
      return;
    }
    const a = s.target.closest("[data-approval-id][data-approval-decision]");
    if (!a) return;
    const u = a.dataset.approvalId || "", c = a.dataset.approvalDecision || "", d = uh.get(u);
    d && (c === "approve" ? d.resolve(!0) : d.resolve(!1), ie());
  }), e.querySelector("#xb-assistant-provider").addEventListener("change", () => {
    _t(e), E.config = {
      ...E.config || {},
      provider: e.querySelector("#xb-assistant-provider").value
    }, ie();
  }), e.querySelector("#xb-assistant-preset-select").addEventListener("change", (s) => {
    _t(e);
    const i = We(s.currentTarget.value), a = (E.config?.presets || {})[i] || eo();
    E.config = co({
      ...E.config,
      currentPresetName: i,
      presetDraftName: i,
      provider: a.provider,
      modelConfigs: a.modelConfigs
    }), ie();
  }), e.querySelector("#xb-assistant-preset-name").addEventListener("input", () => {
    mh(e);
  }), e.querySelector("#xb-assistant-model-pulled").addEventListener("change", (s) => {
    const i = s.currentTarget.value;
    i && (e.querySelector("#xb-assistant-model").value = i);
  }), e.querySelector("#xb-assistant-toggle-key").addEventListener("click", () => {
    const s = e.querySelector("#xb-assistant-api-key");
    s.type = s.type === "password" ? "text" : "password", ie();
  }), e.querySelector("#xb-assistant-reasoning-enabled").addEventListener("change", () => {
    _t(e), ie();
  }), e.querySelector("#xb-assistant-reasoning-effort").addEventListener("change", () => {
    _t(e);
  }), e.querySelector("#xb-assistant-pull-models").addEventListener("click", async () => {
    _t(e);
    const s = la();
    Ei(s.provider, {
      status: "loading",
      message: "正在拉取模型列表…"
    }), ie();
    try {
      const i = await gb(s);
      Ac(s.provider, i), Ei(s.provider, {
        status: "success",
        message: `已拉取 ${i.length} 个模型`
      });
    } catch (i) {
      Ac(s.provider, []), Ei(s.provider, {
        status: "error",
        message: vr(i)
      });
    }
    ie();
  }), e.querySelector("#xb-assistant-save").addEventListener("click", () => {
    Nb(e);
  }), e.querySelector("#xb-assistant-delete-preset").addEventListener("click", () => {
    kb(e);
  }), e.querySelector("#xb-assistant-clear").addEventListener("click", () => {
    E.isBusy || (E.messages = [], E.draftAttachments = [], Sb(), Es(), ut("对话已清空"), ie());
  }), e.querySelector("#xb-assistant-add-image").addEventListener("click", () => {
    E.isBusy || E.draftAttachments.length >= Lt || n.click();
  }), n.addEventListener("change", async (s) => {
    const i = Array.from(s.currentTarget.files || []);
    if (i.length)
      try {
        await wc(i);
      } finally {
        s.currentTarget.value = "";
      }
  }), t.addEventListener("paste", async (s) => {
    if (E.isBusy) return;
    const i = Array.from(s.clipboardData?.items || []);
    if (!i.length) return;
    const a = i.filter((u) => u.kind === "file" && String(u.type || "").startsWith("image/")).map((u) => u.getAsFile()).filter(Boolean);
    a.length && (s.preventDefault(), await wc(a));
  }), e.querySelector("#xb-assistant-form").addEventListener("submit", async (s) => {
    if (s.preventDefault(), E.isBusy) {
      wb("本轮请求已终止。");
      return;
    }
    const i = t.value.trim(), a = Tt(E.draftAttachments);
    if (!i && !a.length) return;
    _t(e), wi({
      role: "user",
      content: i,
      attachments: a
    }), t.value = "", E.draftAttachments = [], o(), ie();
    const u = {
      id: oa("run"),
      controller: new AbortController(),
      toolRequestIds: /* @__PURE__ */ new Set(),
      cancelNotice: "",
      lightBrakeMessage: "",
      lastLightBrakeKey: "",
      toolErrorStreakKey: "",
      toolErrorStreakCount: 0
    };
    E.activeRun = u, E.isBusy = !0, E.currentRound = 0, E.progressLabel = "正在请求模型…", E.autoScroll = !0, ie();
    try {
      await bb(u);
    } catch (c) {
      ra(c) ? u.cancelNotice && wi({
        role: "assistant",
        content: u.cancelNotice
      }) : wi({
        role: "assistant",
        content: vr(c)
      });
    } finally {
      E.activeRun?.id === u.id && (E.activeRun = null), E.isBusy = !1, E.currentRound = 0, E.progressLabel = "", ie();
    }
  }), t.addEventListener("input", o), t.addEventListener("keydown", (s) => {
    const i = !BA();
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
    E.runtime = t.payload?.runtime || null, Ai(t.payload?.config || {});
    return;
  }
  if (t.type === "xb-assistant:config-saved") {
    Ai(t.payload?.config || {}), ut("配置已保存");
    return;
  }
  if (t.type === "xb-assistant:config-save-error") {
    Ai(t.payload?.config || {}), ut(`保存失败：${t.payload?.error || "网络异常"}`);
    return;
  }
  if (t.type === "xb-assistant:tool-result") {
    const n = yr.get(t.payload?.requestId || "");
    if (!n) return;
    n.resolve(t.payload.result);
    return;
  }
  if (t.type === "xb-assistant:tool-error") {
    const n = yr.get(t.payload?.requestId || "");
    if (!n) return;
    n.reject(new Error(t.payload.error || "tool_failed"));
  }
});
sb();
Lb();
ie();
Gs("xb-assistant:ready");
