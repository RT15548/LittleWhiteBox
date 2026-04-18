var Wh = Object.create, Cc = Object.defineProperty, Kh = Object.getOwnPropertyDescriptor, zh = Object.getOwnPropertyNames, Yh = Object.getPrototypeOf, Xh = Object.prototype.hasOwnProperty, bs = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), Qh = (e, t, n, o) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var s = zh(t), i = 0, a = s.length, u; i < a; i++)
      u = s[i], !Xh.call(e, u) && u !== n && Cc(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(o = Kh(t, u)) || o.enumerable
      });
  return e;
}, Zh = (e, t, n) => (n = e != null ? Wh(Yh(e)) : {}, Qh(t || !e || !e.__esModule ? Cc(n, "default", {
  value: e,
  enumerable: !0
}) : n, e));
function z(e, t, n, o, s) {
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
var Ic = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Ic = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function xi(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Ri = (e) => {
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
}, we = class Pi extends W {
  constructor(t, n, o, s) {
    super(`${Pi.makeMessage(t, n, o)}`), this.status = t, this.headers = s, this.requestID = s?.get("x-request-id"), this.error = n;
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
      cause: Ri(n)
    });
    const i = n?.error;
    return t === 400 ? new xc(t, i, o, s) : t === 401 ? new Rc(t, i, o, s) : t === 403 ? new Pc(t, i, o, s) : t === 404 ? new Mc(t, i, o, s) : t === 409 ? new Nc(t, i, o, s) : t === 422 ? new kc(t, i, o, s) : t === 429 ? new Lc(t, i, o, s) : t >= 500 ? new Dc(t, i, o, s) : new Pi(t, i, o, s);
  }
}, Ve = class extends we {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, ws = class extends we {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Er = class extends ws {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, xc = class extends we {
}, Rc = class extends we {
}, Pc = class extends we {
}, Mc = class extends we {
}, Nc = class extends we {
}, kc = class extends we {
}, Lc = class extends we {
}, Dc = class extends we {
}, $c = class extends W {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, Uc = class extends W {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, kn = class extends Error {
  constructor(e) {
    super(e);
  }
}, Fc = class extends we {
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
}, jh = class extends W {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, em = /^[a-z][a-z0-9+.-]*:/i, tm = (e) => em.test(e), Me = (e) => (Me = Array.isArray, Me(e)), ba = Me;
function Bc(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function wa(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function nm(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function Zs(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var om = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new W(`${e} must be an integer`);
  if (t < 0) throw new W(`${e} must be a positive integer`);
  return t;
}, sm = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, io = (e) => new Promise((t) => setTimeout(t, e)), Wt = "6.34.0", im = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function rm() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var am = () => {
  const e = rm();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Wt,
    "X-Stainless-OS": Ca(Deno.build.os),
    "X-Stainless-Arch": Aa(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Wt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Wt,
    "X-Stainless-OS": Ca(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": Aa(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = lm();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Wt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Wt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function lm() {
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
var Aa = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Ca = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), Ia, um = () => Ia ?? (Ia = am());
function Gc() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function qc(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Oc(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return qc({
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
function Vc(e) {
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
async function xa(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var cm = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), Hc = "RFC3986", Jc = (e) => String(e), Ra = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: Jc
};
var Mi = (e, t) => (Mi = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), Mi(e, t)), et = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), js = 1024, dm = (e, t, n, o, s) => {
  if (e.length === 0) return e;
  let i = e;
  if (typeof e == "symbol" ? i = Symbol.prototype.toString.call(e) : typeof e != "string" && (i = String(e)), n === "iso-8859-1") return escape(i).replace(/%u[0-9a-f]{4}/gi, function(u) {
    return "%26%23" + parseInt(u.slice(2), 16) + "%3B";
  });
  let a = "";
  for (let u = 0; u < i.length; u += js) {
    const c = i.length >= js ? i.slice(u, u + js) : i, d = [];
    for (let p = 0; p < c.length; ++p) {
      let f = c.charCodeAt(p);
      if (f === 45 || f === 46 || f === 95 || f === 126 || f >= 48 && f <= 57 || f >= 65 && f <= 90 || f >= 97 && f <= 122 || s === "RFC1738" && (f === 40 || f === 41)) {
        d[d.length] = c.charAt(p);
        continue;
      }
      if (f < 128) {
        d[d.length] = et[f];
        continue;
      }
      if (f < 2048) {
        d[d.length] = et[192 | f >> 6] + et[128 | f & 63];
        continue;
      }
      if (f < 55296 || f >= 57344) {
        d[d.length] = et[224 | f >> 12] + et[128 | f >> 6 & 63] + et[128 | f & 63];
        continue;
      }
      p += 1, f = 65536 + ((f & 1023) << 10 | c.charCodeAt(p) & 1023), d[d.length] = et[240 | f >> 18] + et[128 | f >> 12 & 63] + et[128 | f >> 6 & 63] + et[128 | f & 63];
    }
    a += d.join("");
  }
  return a;
};
function fm(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function Pa(e, t) {
  if (Me(e)) {
    const n = [];
    for (let o = 0; o < e.length; o += 1) n.push(t(e[o]));
    return n;
  }
  return t(e);
}
var Wc = {
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
}, Kc = function(e, t) {
  Array.prototype.push.apply(e, Me(t) ? t : [t]);
}, Ma, ge = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: dm,
  encodeValuesOnly: !1,
  format: Hc,
  formatter: Jc,
  indices: !1,
  serializeDate(e) {
    return (Ma ?? (Ma = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function pm(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var ei = {};
function zc(e, t, n, o, s, i, a, u, c, d, p, f, h, m, g, y, _, S) {
  let b = e, A = S, R = 0, $ = !1;
  for (; (A = A.get(ei)) !== void 0 && !$; ) {
    const U = A.get(e);
    if (R += 1, typeof U < "u") {
      if (U === R) throw new RangeError("Cyclic object value");
      $ = !0;
    }
    typeof A.get(ei) > "u" && (R = 0);
  }
  if (typeof d == "function" ? b = d(t, b) : b instanceof Date ? b = h?.(b) : n === "comma" && Me(b) && (b = Pa(b, function(U) {
    return U instanceof Date ? h?.(U) : U;
  })), b === null) {
    if (i) return c && !y ? c(t, ge.encoder, _, "key", m) : t;
    b = "";
  }
  if (pm(b) || fm(b)) {
    if (c) {
      const U = y ? t : c(t, ge.encoder, _, "key", m);
      return [g?.(U) + "=" + g?.(c(b, ge.encoder, _, "value", m))];
    }
    return [g?.(t) + "=" + g?.(String(b))];
  }
  const w = [];
  if (typeof b > "u") return w;
  let v;
  if (n === "comma" && Me(b))
    y && c && (b = Pa(b, c)), v = [{ value: b.length > 0 ? b.join(",") || null : void 0 }];
  else if (Me(d)) v = d;
  else {
    const U = Object.keys(b);
    v = p ? U.sort(p) : U;
  }
  const I = u ? String(t).replace(/\./g, "%2E") : String(t), P = o && Me(b) && b.length === 1 ? I + "[]" : I;
  if (s && Me(b) && b.length === 0) return P + "[]";
  for (let U = 0; U < v.length; ++U) {
    const O = v[U], ne = typeof O == "object" && typeof O.value < "u" ? O.value : b[O];
    if (a && ne === null) continue;
    const Z = f && u ? O.replace(/\./g, "%2E") : O, ee = Me(b) ? typeof n == "function" ? n(P, Z) : P : P + (f ? "." + Z : "[" + Z + "]");
    S.set(e, R);
    const L = /* @__PURE__ */ new WeakMap();
    L.set(ei, S), Kc(w, zc(ne, ee, n, o, s, i, a, u, n === "comma" && y && Me(b) ? null : c, d, p, f, h, m, g, y, _, L));
  }
  return w;
}
function hm(e = ge) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || ge.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = Hc;
  if (typeof e.format < "u") {
    if (!Mi(Ra, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const o = Ra[n];
  let s = ge.filter;
  (typeof e.filter == "function" || Me(e.filter)) && (s = e.filter);
  let i;
  if (e.arrayFormat && e.arrayFormat in Wc ? i = e.arrayFormat : "indices" in e ? i = e.indices ? "indices" : "repeat" : i = ge.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  const a = typeof e.allowDots > "u" ? e.encodeDotInKeys ? !0 : ge.allowDots : !!e.allowDots;
  return {
    addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : ge.addQueryPrefix,
    allowDots: a,
    allowEmptyArrays: typeof e.allowEmptyArrays == "boolean" ? !!e.allowEmptyArrays : ge.allowEmptyArrays,
    arrayFormat: i,
    charset: t,
    charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : ge.charsetSentinel,
    commaRoundTrip: !!e.commaRoundTrip,
    delimiter: typeof e.delimiter > "u" ? ge.delimiter : e.delimiter,
    encode: typeof e.encode == "boolean" ? e.encode : ge.encode,
    encodeDotInKeys: typeof e.encodeDotInKeys == "boolean" ? e.encodeDotInKeys : ge.encodeDotInKeys,
    encoder: typeof e.encoder == "function" ? e.encoder : ge.encoder,
    encodeValuesOnly: typeof e.encodeValuesOnly == "boolean" ? e.encodeValuesOnly : ge.encodeValuesOnly,
    filter: s,
    format: n,
    formatter: o,
    serializeDate: typeof e.serializeDate == "function" ? e.serializeDate : ge.serializeDate,
    skipNulls: typeof e.skipNulls == "boolean" ? e.skipNulls : ge.skipNulls,
    sort: typeof e.sort == "function" ? e.sort : null,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : ge.strictNullHandling
  };
}
function mm(e, t = {}) {
  let n = e;
  const o = hm(t);
  let s, i;
  typeof o.filter == "function" ? (i = o.filter, n = i("", n)) : Me(o.filter) && (i = o.filter, s = i);
  const a = [];
  if (typeof n != "object" || n === null) return "";
  const u = Wc[o.arrayFormat], c = u === "comma" && o.commaRoundTrip;
  s || (s = Object.keys(n)), o.sort && s.sort(o.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let h = 0; h < s.length; ++h) {
    const m = s[h];
    o.skipNulls && n[m] === null || Kc(a, zc(n[m], m, u, c, o.allowEmptyArrays, o.strictNullHandling, o.skipNulls, o.encodeDotInKeys, o.encode ? o.encoder : null, o.filter, o.sort, o.allowDots, o.serializeDate, o.format, o.formatter, o.encodeValuesOnly, o.charset, d));
  }
  const p = a.join(o.delimiter);
  let f = o.addQueryPrefix === !0 ? "?" : "";
  return o.charsetSentinel && (o.charset === "iso-8859-1" ? f += "utf8=%26%2310003%3B&" : f += "utf8=%E2%9C%93&"), p.length > 0 ? f + p : "";
}
function gm(e) {
  return mm(e, { arrayFormat: "brackets" });
}
function ym(e) {
  let t = 0;
  for (const s of e) t += s.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const s of e)
    n.set(s, o), o += s.length;
  return n;
}
var Na;
function br(e) {
  let t;
  return (Na ?? (t = new globalThis.TextEncoder(), Na = t.encode.bind(t)))(e);
}
var ka;
function La(e) {
  let t;
  return (ka ?? (t = new globalThis.TextDecoder(), ka = t.decode.bind(t)))(e);
}
var Le, De, As = class {
  constructor() {
    Le.set(this, void 0), De.set(this, void 0), z(this, Le, new Uint8Array(), "f"), z(this, De, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? br(e) : e;
    z(this, Le, ym([E(this, Le, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = _m(E(this, Le, "f"), E(this, De, "f"))) != null; ) {
      if (o.carriage && E(this, De, "f") == null) {
        z(this, De, o.index, "f");
        continue;
      }
      if (E(this, De, "f") != null && (o.index !== E(this, De, "f") + 1 || o.carriage)) {
        n.push(La(E(this, Le, "f").subarray(0, E(this, De, "f") - 1))), z(this, Le, E(this, Le, "f").subarray(E(this, De, "f")), "f"), z(this, De, null, "f");
        continue;
      }
      const s = E(this, De, "f") !== null ? o.preceding - 1 : o.preceding, i = La(E(this, Le, "f").subarray(0, s));
      n.push(i), z(this, Le, E(this, Le, "f").subarray(o.index), "f"), z(this, De, null, "f");
    }
    return n;
  }
  flush() {
    return E(this, Le, "f").length ? this.decode(`
`) : [];
  }
};
Le = /* @__PURE__ */ new WeakMap(), De = /* @__PURE__ */ new WeakMap();
As.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
As.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function _m(e, t) {
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
function vm(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var as = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Da = (e, t, n) => {
  if (e) {
    if (nm(as, e)) return e;
    Ee(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(as))}`);
  }
};
function Ln() {
}
function yo(e, t, n) {
  return !t || as[e] > as[n] ? Ln : t[e].bind(t);
}
var Sm = {
  error: Ln,
  warn: Ln,
  info: Ln,
  debug: Ln
}, $a = /* @__PURE__ */ new WeakMap();
function Ee(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return Sm;
  const o = $a.get(t);
  if (o && o[0] === n) return o[1];
  const s = {
    error: yo("error", t, n),
    warn: yo("warn", t, n),
    info: yo("info", t, n),
    debug: yo("debug", t, n)
  };
  return $a.set(t, [n, s]), s;
}
var xt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), hn, jn = class Dn {
  constructor(t, n, o) {
    this.iterator = t, hn.set(this, void 0), this.controller = n, z(this, hn, o, "f");
  }
  static fromSSEResponse(t, n, o, s) {
    let i = !1;
    const a = o ? Ee(o) : console;
    async function* u() {
      if (i) throw new W("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let c = !1;
      try {
        for await (const d of Tm(t, n))
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
              if (p && p.error) throw new we(void 0, p.error, void 0, t.headers);
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
              if (d.event == "error") throw new we(void 0, p.error, p.message, void 0);
              yield {
                event: d.event,
                data: p
              };
            }
          }
        c = !0;
      } catch (d) {
        if (xi(d)) return;
        throw d;
      } finally {
        c || n.abort();
      }
    }
    return new Dn(u, n, o);
  }
  static fromReadableStream(t, n, o) {
    let s = !1;
    async function* i() {
      const u = new As(), c = Vc(t);
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
        if (xi(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Dn(a, n, o);
  }
  [(hn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new Dn(() => s(t), this.controller, E(this, hn, "f")), new Dn(() => s(n), this.controller, E(this, hn, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return qc({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: s, done: i } = await n.next();
          if (i) return o.close();
          const a = br(JSON.stringify(s) + `
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
async function* Tm(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new W("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new W("Attempted to iterate over a response with no body");
  const n = new bm(), o = new As(), s = Vc(e.body);
  for await (const i of Em(s)) for (const a of o.decode(i)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const i of o.flush()) {
    const a = n.decode(i);
    a && (yield a);
  }
}
async function* Em(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? br(n) : n;
    let s = new Uint8Array(t.length + o.length);
    s.set(t), s.set(o, t.length), t = s;
    let i;
    for (; (i = vm(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var bm = class {
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
    let [t, n, o] = wm(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function wm(e, t) {
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
async function Yc(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: s, startTime: i } = t, a = await (async () => {
    if (t.options.stream)
      return Ee(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : jn.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Xc(await n.json(), n) : await n.text();
  })();
  return Ee(e).debug(`[${o}] response parsed`, xt({
    retryOfRequestLogID: s,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
function Xc(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var $n, Qc = class Zc extends Promise {
  constructor(t, n, o = Yc) {
    super((s) => {
      s(null);
    }), this.responsePromise = n, this.parseResponse = o, $n.set(this, void 0), z(this, $n, t, "f");
  }
  _thenUnwrap(t) {
    return new Zc(E(this, $n, "f"), this.responsePromise, async (n, o) => Xc(t(await this.parseResponse(n, o), o), o.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(E(this, $n, "f"), t))), this.parsedPromise;
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
$n = /* @__PURE__ */ new WeakMap();
var _o, wr = class {
  constructor(e, t, n, o) {
    _o.set(this, void 0), z(this, _o, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new W("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await E(this, _o, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(_o = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, Am = class extends Qc {
  constructor(e, t, n) {
    super(e, t, async (o, s) => new n(o, s.response, await Yc(o, s), s.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, Cs = class extends wr {
  constructor(e, t, n, o) {
    super(e, t, n, o), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, de = class extends wr {
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
        ...Bc(this.options.query),
        after: t
      }
    } : null;
  }
}, eo = class extends wr {
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
        ...Bc(this.options.query),
        after: e
      }
    } : null;
  }
}, Cm = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, Im = "urn:ietf:params:oauth:grant-type:token-exchange", xm = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? Gc();
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
        grant_type: Im,
        client_id: this.config.clientId,
        subject_token: e,
        subject_token_type: Cm[this.config.provider.tokenType],
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
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new Fc(t.status, a, t.headers) : we.generate(t.status, a, `Token exchange failed with status ${t.status}`, t.headers);
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
}, jc = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function zn(e, t, n) {
  return jc(), new File(e, t ?? "unknown_file", n);
}
function Jo(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var Ar = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Is = async (e, t) => Ni(e.body) ? {
  ...e,
  body: await ed(e.body, t)
} : e, nt = async (e, t) => ({
  ...e,
  body: await ed(e.body, t)
}), Ua = /* @__PURE__ */ new WeakMap();
function Rm(e) {
  const t = typeof e == "function" ? e : e.fetch, n = Ua.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const s = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new s(i).text();
    } catch {
      return !0;
    }
  })();
  return Ua.set(t, o), o;
}
var ed = async (e, t) => {
  if (!await Rm(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([o, s]) => ki(n, o, s))), n;
}, td = (e) => e instanceof Blob && "name" in e, Pm = (e) => typeof e == "object" && e !== null && (e instanceof Response || Ar(e) || td(e)), Ni = (e) => {
  if (Pm(e)) return !0;
  if (Array.isArray(e)) return e.some(Ni);
  if (e && typeof e == "object") {
    for (const t in e) if (Ni(e[t])) return !0;
  }
  return !1;
}, ki = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, zn([await n.blob()], Jo(n)));
    else if (Ar(n)) e.append(t, zn([await new Response(Oc(n)).blob()], Jo(n)));
    else if (td(n)) e.append(t, n, Jo(n));
    else if (Array.isArray(n)) await Promise.all(n.map((o) => ki(e, t + "[]", o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([o, s]) => ki(e, `${t}[${o}]`, s)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, nd = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", Mm = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && nd(e), Nm = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function km(e, t, n) {
  if (jc(), e = await e, Mm(e))
    return e instanceof File ? e : zn([await e.arrayBuffer()], e.name);
  if (Nm(e)) {
    const s = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), zn(await Li(s), t, n);
  }
  const o = await Li(e);
  if (t || (t = Jo(e)), !n?.type) {
    const s = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof s == "string" && (n = {
      ...n,
      type: s
    });
  }
  return zn(o, t, n);
}
async function Li(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (nd(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Ar(e)) for await (const n of e) t.push(...await Li(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${Lm(e)}`);
  }
  return t;
}
function Lm(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var H = class {
  constructor(e) {
    this._client = e;
  }
};
function od(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Fa = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Dm = (e = od) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let s = !1;
  const i = [], a = n.reduce((p, f, h) => {
    /[?#]/.test(f) && (s = !0);
    const m = o[h];
    let g = (s ? encodeURIComponent : e)("" + m);
    return h !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? Fa) ?? Fa)?.toString) && (g = m + "", i.push({
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
}, k = /* @__PURE__ */ Dm(od), sd = class extends H {
  list(e, t = {}, n) {
    return this._client.getAPIList(k`/chat/completions/${e}/messages`, de, {
      query: t,
      ...n
    });
  }
};
function ls(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function Cr(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function ro(e) {
  return e?.$brand === "auto-parseable-tool";
}
function $m(e, t) {
  return !t || !id(t) ? {
    ...e,
    choices: e.choices.map((n) => (rd(n.message.tool_calls), {
      ...n,
      message: {
        ...n.message,
        parsed: null,
        ...n.message.tool_calls ? { tool_calls: n.message.tool_calls } : void 0
      }
    }))
  } : Ir(e, t);
}
function Ir(e, t) {
  const n = e.choices.map((o) => {
    if (o.finish_reason === "length") throw new $c();
    if (o.finish_reason === "content_filter") throw new Uc();
    return rd(o.message.tool_calls), {
      ...o,
      message: {
        ...o.message,
        ...o.message.tool_calls ? { tool_calls: o.message.tool_calls?.map((s) => Fm(t, s)) ?? void 0 } : void 0,
        parsed: o.message.content && !o.message.refusal ? Um(t, o.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function Um(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function Fm(e, t) {
  const n = e.tools?.find((o) => ls(o) && o.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: ro(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function Bm(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((o) => ls(o) && o.function?.name === t.function.name);
  return ls(n) && (ro(n) || n?.function.strict || !1);
}
function id(e) {
  return Cr(e.response_format) ? !0 : e.tools?.some((t) => ro(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function rd(e) {
  for (const t of e || []) if (t.type !== "function") throw new W(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function Gm(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new W(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new W(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var us = (e) => e?.role === "assistant", ad = (e) => e?.role === "tool", Di, Wo, Ko, Un, Fn, zo, Bn, lt, Gn, cs, ds, Kt, ld, xr = class {
  constructor() {
    Di.add(this), this.controller = new AbortController(), Wo.set(this, void 0), Ko.set(this, () => {
    }), Un.set(this, () => {
    }), Fn.set(this, void 0), zo.set(this, () => {
    }), Bn.set(this, () => {
    }), lt.set(this, {}), Gn.set(this, !1), cs.set(this, !1), ds.set(this, !1), Kt.set(this, !1), z(this, Wo, new Promise((e, t) => {
      z(this, Ko, e, "f"), z(this, Un, t, "f");
    }), "f"), z(this, Fn, new Promise((e, t) => {
      z(this, zo, e, "f"), z(this, Bn, t, "f");
    }), "f"), E(this, Wo, "f").catch(() => {
    }), E(this, Fn, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, E(this, Di, "m", ld).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (E(this, Ko, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return E(this, Gn, "f");
  }
  get errored() {
    return E(this, cs, "f");
  }
  get aborted() {
    return E(this, ds, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(e, t) {
    return (E(this, lt, "f")[e] || (E(this, lt, "f")[e] = [])).push({ listener: t }), this;
  }
  off(e, t) {
    const n = E(this, lt, "f")[e];
    if (!n) return this;
    const o = n.findIndex((s) => s.listener === t);
    return o >= 0 && n.splice(o, 1), this;
  }
  once(e, t) {
    return (E(this, lt, "f")[e] || (E(this, lt, "f")[e] = [])).push({
      listener: t,
      once: !0
    }), this;
  }
  emitted(e) {
    return new Promise((t, n) => {
      z(this, Kt, !0, "f"), e !== "error" && this.once("error", n), this.once(e, t);
    });
  }
  async done() {
    z(this, Kt, !0, "f"), await E(this, Fn, "f");
  }
  _emit(e, ...t) {
    if (E(this, Gn, "f")) return;
    e === "end" && (z(this, Gn, !0, "f"), E(this, zo, "f").call(this));
    const n = E(this, lt, "f")[e];
    if (n && (E(this, lt, "f")[e] = n.filter((o) => !o.once), n.forEach(({ listener: o }) => o(...t))), e === "abort") {
      const o = t[0];
      !E(this, Kt, "f") && !n?.length && Promise.reject(o), E(this, Un, "f").call(this, o), E(this, Bn, "f").call(this, o), this._emit("end");
      return;
    }
    if (e === "error") {
      const o = t[0];
      !E(this, Kt, "f") && !n?.length && Promise.reject(o), E(this, Un, "f").call(this, o), E(this, Bn, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
Wo = /* @__PURE__ */ new WeakMap(), Ko = /* @__PURE__ */ new WeakMap(), Un = /* @__PURE__ */ new WeakMap(), Fn = /* @__PURE__ */ new WeakMap(), zo = /* @__PURE__ */ new WeakMap(), Bn = /* @__PURE__ */ new WeakMap(), lt = /* @__PURE__ */ new WeakMap(), Gn = /* @__PURE__ */ new WeakMap(), cs = /* @__PURE__ */ new WeakMap(), ds = /* @__PURE__ */ new WeakMap(), Kt = /* @__PURE__ */ new WeakMap(), Di = /* @__PURE__ */ new WeakSet(), ld = function(t) {
  if (z(this, cs, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new Ve()), t instanceof Ve)
    return z(this, ds, !0, "f"), this._emit("abort", t);
  if (t instanceof W) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new W(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new W(String(t)));
};
function qm(e) {
  return typeof e.parse == "function";
}
var Ce, $i, fs, Ui, Fi, Bi, ud, cd, Om = 10, dd = class extends xr {
  constructor() {
    super(...arguments), Ce.add(this), this._chatCompletions = [], this.messages = [];
  }
  _addChatCompletion(e) {
    this._chatCompletions.push(e), this._emit("chatCompletion", e);
    const t = e.choices[0]?.message;
    return t && this._addMessage(t), e;
  }
  _addMessage(e, t = !0) {
    if ("content" in e || (e.content = null), this.messages.push(e), t) {
      if (this._emit("message", e), ad(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (us(e) && e.tool_calls)
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
    return await this.done(), E(this, Ce, "m", $i).call(this);
  }
  async finalMessage() {
    return await this.done(), E(this, Ce, "m", fs).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), E(this, Ce, "m", Ui).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), E(this, Ce, "m", Fi).call(this);
  }
  async totalUsage() {
    return await this.done(), E(this, Ce, "m", Bi).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = E(this, Ce, "m", fs).call(this);
    t && this._emit("finalMessage", t);
    const n = E(this, Ce, "m", $i).call(this);
    n && this._emit("finalContent", n);
    const o = E(this, Ce, "m", Ui).call(this);
    o && this._emit("finalFunctionToolCall", o);
    const s = E(this, Ce, "m", Fi).call(this);
    s != null && this._emit("finalFunctionToolCallResult", s), this._chatCompletions.some((i) => i.usage) && this._emit("totalUsage", E(this, Ce, "m", Bi).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), E(this, Ce, "m", ud).call(this, t);
    const s = await e.chat.completions.create({
      ...t,
      stream: !1
    }, {
      ...n,
      signal: this.controller.signal
    });
    return this._connected(), this._addChatCompletion(Ir(s, t));
  }
  async _runChatCompletion(e, t, n) {
    for (const o of t.messages) this._addMessage(o, !1);
    return await this._createChatCompletion(e, t, n);
  }
  async _runTools(e, t, n) {
    const o = "tool", { tool_choice: s = "auto", stream: i, ...a } = t, u = typeof s != "string" && s.type === "function" && s?.function?.name, { maxChatCompletions: c = Om } = n || {}, d = t.tools.map((h) => {
      if (ro(h)) {
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
        const y = g.id, { name: _, arguments: S } = g.function, b = p[_];
        if (b) {
          if (u && u !== _) {
            const w = `Invalid tool_call: ${JSON.stringify(_)}. ${JSON.stringify(u)} requested. Please try again`;
            this._addMessage({
              role: o,
              tool_call_id: y,
              content: w
            });
            continue;
          }
        } else {
          const w = `Invalid tool_call: ${JSON.stringify(_)}. Available options are: ${Object.keys(p).map((v) => JSON.stringify(v)).join(", ")}. Please try again`;
          this._addMessage({
            role: o,
            tool_call_id: y,
            content: w
          });
          continue;
        }
        let A;
        try {
          A = qm(b) ? await b.parse(S) : S;
        } catch (w) {
          const v = w instanceof Error ? w.message : String(w);
          this._addMessage({
            role: o,
            tool_call_id: y,
            content: v
          });
          continue;
        }
        const R = await b.function(A, this), $ = E(this, Ce, "m", cd).call(this, R);
        if (this._addMessage({
          role: o,
          tool_call_id: y,
          content: $
        }), u) return;
      }
    }
  }
};
Ce = /* @__PURE__ */ new WeakSet(), $i = function() {
  return E(this, Ce, "m", fs).call(this).content ?? null;
}, fs = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (us(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new W("stream ended without producing a ChatCompletionMessage with role=assistant");
}, Ui = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (us(n) && n?.tool_calls?.length) return n.tool_calls.filter((o) => o.type === "function").at(-1)?.function;
  }
}, Fi = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (ad(n) && n.content != null && typeof n.content == "string" && this.messages.some((o) => o.role === "assistant" && o.tool_calls?.some((s) => s.type === "function" && s.id === n.tool_call_id))) return n.content;
  }
}, Bi = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, ud = function(t) {
  if (t.n != null && t.n > 1) throw new W("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, cd = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var Vm = class fd extends dd {
  static runTools(t, n, o) {
    const s = new fd(), i = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return s._run(() => s._runTools(t, n, i)), s;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), us(t) && t.content && this._emit("content", t.content);
  }
}, Hm = 1, pd = 2, hd = 4, md = 8, Jm = 16, Wm = 32, Km = 64, gd = 128, yd = 256, zm = gd | yd, Ym = 496, Ba = pd | 497, Ga = hd | md, ve = {
  STR: Hm,
  NUM: pd,
  ARR: hd,
  OBJ: md,
  NULL: Jm,
  BOOL: Wm,
  NAN: Km,
  INFINITY: gd,
  MINUS_INFINITY: yd,
  INF: zm,
  SPECIAL: Ym,
  ATOM: Ba,
  COLLECTION: Ga,
  ALL: Ba | Ga
}, Xm = class extends Error {
}, Qm = class extends Error {
};
function Zm(e, t = ve.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return jm(e.trim(), t);
}
var jm = (e, t) => {
  const n = e.length;
  let o = 0;
  const s = (h) => {
    throw new Xm(`${h} at position ${o}`);
  }, i = (h) => {
    throw new Qm(`${h} at position ${o}`);
  }, a = () => (f(), o >= n && s("Unexpected end of input"), e[o] === '"' ? u() : e[o] === "{" ? c() : e[o] === "[" ? d() : e.substring(o, o + 4) === "null" || ve.NULL & t && n - o < 4 && "null".startsWith(e.substring(o)) ? (o += 4, null) : e.substring(o, o + 4) === "true" || ve.BOOL & t && n - o < 4 && "true".startsWith(e.substring(o)) ? (o += 4, !0) : e.substring(o, o + 5) === "false" || ve.BOOL & t && n - o < 5 && "false".startsWith(e.substring(o)) ? (o += 5, !1) : e.substring(o, o + 8) === "Infinity" || ve.INFINITY & t && n - o < 8 && "Infinity".startsWith(e.substring(o)) ? (o += 8, 1 / 0) : e.substring(o, o + 9) === "-Infinity" || ve.MINUS_INFINITY & t && 1 < n - o && n - o < 9 && "-Infinity".startsWith(e.substring(o)) ? (o += 9, -1 / 0) : e.substring(o, o + 3) === "NaN" || ve.NAN & t && n - o < 3 && "NaN".startsWith(e.substring(o)) ? (o += 3, NaN) : p()), u = () => {
    const h = o;
    let m = !1;
    for (o++; o < n && (e[o] !== '"' || m && e[o - 1] === "\\"); )
      m = e[o] === "\\" ? !m : !1, o++;
    if (e.charAt(o) == '"') try {
      return JSON.parse(e.substring(h, ++o - Number(m)));
    } catch (g) {
      i(String(g));
    }
    else if (ve.STR & t) try {
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
        if (f(), o >= n && ve.OBJ & t) return h;
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
          if (ve.OBJ & t) return h;
          throw g;
        }
        f(), e[o] === "," && o++;
      }
    } catch {
      if (ve.OBJ & t) return h;
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
      if (ve.ARR & t) return h;
      s("Expected ']' at end of array");
    }
    return o++, h;
  }, p = () => {
    if (o === 0) {
      e === "-" && ve.NUM & t && s("Not sure what '-' is");
      try {
        return JSON.parse(e);
      } catch (m) {
        if (ve.NUM & t) try {
          return e[e.length - 1] === "." ? JSON.parse(e.substring(0, e.lastIndexOf("."))) : JSON.parse(e.substring(0, e.lastIndexOf("e")));
        } catch {
        }
        i(String(m));
      }
    }
    const h = o;
    for (e[o] === "-" && o++; e[o] && !",]}".includes(e[o]); ) o++;
    o == n && !(ve.NUM & t) && s("Unterminated number literal");
    try {
      return JSON.parse(e.substring(h, o));
    } catch {
      e.substring(h, o) === "-" && ve.NUM & t && s("Not sure what '-' is");
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
}, qa = (e) => Zm(e, ve.ALL ^ ve.NUM), he, it, Gt, mt, ti, vo, ni, oi, si, So, ii, Oa, _d = class Gi extends dd {
  constructor(t) {
    super(), he.add(this), it.set(this, void 0), Gt.set(this, void 0), mt.set(this, void 0), z(this, it, t, "f"), z(this, Gt, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return E(this, mt, "f");
  }
  static fromReadableStream(t) {
    const n = new Gi(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createChatCompletion(t, n, o) {
    const s = new Gi(n);
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
    s && (s.aborted && this.controller.abort(), s.addEventListener("abort", () => this.controller.abort())), E(this, he, "m", ti).call(this);
    const i = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const a of i) E(this, he, "m", ni).call(this, a);
    if (i.controller.signal?.aborted) throw new Ve();
    return this._addChatCompletion(E(this, he, "m", So).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), E(this, he, "m", ti).call(this), this._connected();
    const s = jn.fromReadableStream(t, this.controller);
    let i;
    for await (const a of s)
      i && i !== a.id && this._addChatCompletion(E(this, he, "m", So).call(this)), E(this, he, "m", ni).call(this, a), i = a.id;
    if (s.controller.signal?.aborted) throw new Ve();
    return this._addChatCompletion(E(this, he, "m", So).call(this));
  }
  [(it = /* @__PURE__ */ new WeakMap(), Gt = /* @__PURE__ */ new WeakMap(), mt = /* @__PURE__ */ new WeakMap(), he = /* @__PURE__ */ new WeakSet(), ti = function() {
    this.ended || z(this, mt, void 0, "f");
  }, vo = function(n) {
    let o = E(this, Gt, "f")[n.index];
    return o || (o = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, E(this, Gt, "f")[n.index] = o, o);
  }, ni = function(n) {
    if (this.ended) return;
    const o = E(this, he, "m", Oa).call(this, n);
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
      const a = E(this, he, "m", vo).call(this, i);
      i.finish_reason && (E(this, he, "m", si).call(this, i), a.current_tool_call_index != null && E(this, he, "m", oi).call(this, i, a.current_tool_call_index));
      for (const u of s.delta.tool_calls ?? [])
        a.current_tool_call_index !== u.index && (E(this, he, "m", si).call(this, i), a.current_tool_call_index != null && E(this, he, "m", oi).call(this, i, a.current_tool_call_index)), a.current_tool_call_index = u.index;
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
  }, oi = function(n, o) {
    if (E(this, he, "m", vo).call(this, n).done_tool_calls.has(o)) return;
    const s = n.message.tool_calls?.[o];
    if (!s) throw new Error("no tool call snapshot");
    if (!s.type) throw new Error("tool call snapshot missing `type`");
    if (s.type === "function") {
      const i = E(this, it, "f")?.tools?.find((a) => ls(a) && a.function.name === s.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: s.function.name,
        index: o,
        arguments: s.function.arguments,
        parsed_arguments: ro(i) ? i.$parseRaw(s.function.arguments) : i?.function.strict ? JSON.parse(s.function.arguments) : null
      });
    } else s.type;
  }, si = function(n) {
    const o = E(this, he, "m", vo).call(this, n);
    if (n.message.content && !o.content_done) {
      o.content_done = !0;
      const s = E(this, he, "m", ii).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: s ? s.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !o.refusal_done && (o.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !o.logprobs_content_done && (o.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !o.logprobs_refusal_done && (o.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, So = function() {
    if (this.ended) throw new W("stream has ended, this shouldn't happen");
    const n = E(this, mt, "f");
    if (!n) throw new W("request ended without sending any chunks");
    return z(this, mt, void 0, "f"), z(this, Gt, [], "f"), eg(n, E(this, it, "f"));
  }, ii = function() {
    const n = E(this, it, "f")?.response_format;
    return Cr(n) ? n : null;
  }, Oa = function(n) {
    var o, s, i, a;
    let u = E(this, mt, "f");
    const { choices: c, ...d } = n;
    u ? Object.assign(u, d) : u = z(this, mt, {
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
        const { content: w, refusal: v, ...I } = m;
        Object.assign(y.logprobs, I), w && ((o = y.logprobs).content ?? (o.content = []), y.logprobs.content.push(...w)), v && ((s = y.logprobs).refusal ?? (s.refusal = []), y.logprobs.refusal.push(...v));
      }
      if (f && (y.finish_reason = f, E(this, it, "f") && id(E(this, it, "f")))) {
        if (f === "length") throw new $c();
        if (f === "content_filter") throw new Uc();
      }
      if (Object.assign(y, g), !p) continue;
      const { content: _, refusal: S, function_call: b, role: A, tool_calls: R, ...$ } = p;
      if (Object.assign(y.message, $), S && (y.message.refusal = (y.message.refusal || "") + S), A && (y.message.role = A), b && (y.message.function_call ? (b.name && (y.message.function_call.name = b.name), b.arguments && ((i = y.message.function_call).arguments ?? (i.arguments = ""), y.message.function_call.arguments += b.arguments)) : y.message.function_call = b), _ && (y.message.content = (y.message.content || "") + _, !y.message.refusal && E(this, he, "m", ii).call(this) && (y.message.parsed = qa(y.message.content))), R) {
        y.message.tool_calls || (y.message.tool_calls = []);
        for (const { index: w, id: v, type: I, function: P, ...U } of R) {
          const O = (a = y.message.tool_calls)[w] ?? (a[w] = {});
          Object.assign(O, U), v && (O.id = v), I && (O.type = I), P && (O.function ?? (O.function = {
            name: P.name ?? "",
            arguments: ""
          })), P?.name && (O.function.name = P.name), P?.arguments && (O.function.arguments += P.arguments, Bm(E(this, it, "f"), O) && (O.function.parsed_arguments = qa(O.function.arguments)));
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
    return new jn(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
function eg(e, t) {
  const { id: n, choices: o, created: s, model: i, system_fingerprint: a, ...u } = e;
  return $m({
    ...u,
    id: n,
    choices: o.map(({ message: c, finish_reason: d, index: p, logprobs: f, ...h }) => {
      if (!d) throw new W(`missing finish_reason for choice ${p}`);
      const { content: m = null, function_call: g, tool_calls: y, ..._ } = c, S = c.role;
      if (!S) throw new W(`missing role for choice ${p}`);
      if (g) {
        const { arguments: b, name: A } = g;
        if (b == null) throw new W(`missing function_call.arguments for choice ${p}`);
        if (!A) throw new W(`missing function_call.name for choice ${p}`);
        return {
          ...h,
          message: {
            content: m,
            function_call: {
              arguments: b,
              name: A
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
          tool_calls: y.map((b, A) => {
            const { function: R, type: $, id: w, ...v } = b, { arguments: I, name: P, ...U } = R || {};
            if (w == null) throw new W(`missing choices[${p}].tool_calls[${A}].id
${To(e)}`);
            if ($ == null) throw new W(`missing choices[${p}].tool_calls[${A}].type
${To(e)}`);
            if (P == null) throw new W(`missing choices[${p}].tool_calls[${A}].function.name
${To(e)}`);
            if (I == null) throw new W(`missing choices[${p}].tool_calls[${A}].function.arguments
${To(e)}`);
            return {
              ...v,
              id: w,
              type: $,
              function: {
                ...U,
                name: P,
                arguments: I
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
function To(e) {
  return JSON.stringify(e);
}
var tg = class qi extends _d {
  static fromReadableStream(t) {
    const n = new qi(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static runTools(t, n, o) {
    const s = new qi(n), i = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return s._run(() => s._runTools(t, n, i)), s;
  }
}, Rr = class extends H {
  constructor() {
    super(...arguments), this.messages = new sd(this._client);
  }
  create(e, t) {
    return this._client.post("/chat/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    });
  }
  retrieve(e, t) {
    return this._client.get(k`/chat/completions/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(k`/chat/completions/${e}`, {
      body: t,
      ...n
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chat/completions", de, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(k`/chat/completions/${e}`, t);
  }
  parse(e, t) {
    return Gm(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => Ir(n, e));
  }
  runTools(e, t) {
    return e.stream ? tg.runTools(this._client, e, t) : Vm.runTools(this._client, e, t);
  }
  stream(e, t) {
    return _d.createChatCompletion(this._client, e, t);
  }
};
Rr.Messages = sd;
var Pr = class extends H {
  constructor() {
    super(...arguments), this.completions = new Rr(this._client);
  }
};
Pr.Completions = Rr;
var vd = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* ng(e) {
  if (!e) return;
  if (vd in e) {
    const { values: o, nulls: s } = e;
    yield* o.entries();
    for (const i of s) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : ba(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const s = o[0];
    if (typeof s != "string") throw new TypeError("expected header name to be a string");
    const i = ba(o[1]) ? o[1] : [o[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [s, null]), yield [s, u]);
  }
}
var q = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const s = /* @__PURE__ */ new Set();
    for (const [i, a] of ng(o)) {
      const u = i.toLowerCase();
      s.has(u) || (t.delete(i), s.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [vd]: !0,
    values: t,
    nulls: n
  };
}, Sd = class extends H {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: q([{ Accept: "application/octet-stream" }, t?.headers]),
      __binaryResponse: !0
    });
  }
}, Td = class extends H {
  create(e, t) {
    return this._client.post("/audio/transcriptions", nt({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model }
    }, this._client));
  }
}, Ed = class extends H {
  create(e, t) {
    return this._client.post("/audio/translations", nt({
      body: e,
      ...t,
      __metadata: { model: e.model }
    }, this._client));
  }
}, ao = class extends H {
  constructor() {
    super(...arguments), this.transcriptions = new Td(this._client), this.translations = new Ed(this._client), this.speech = new Sd(this._client);
  }
};
ao.Transcriptions = Td;
ao.Translations = Ed;
ao.Speech = Sd;
var bd = class extends H {
  create(e, t) {
    return this._client.post("/batches", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(k`/batches/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/batches", de, {
      query: e,
      ...t
    });
  }
  cancel(e, t) {
    return this._client.post(k`/batches/${e}/cancel`, t);
  }
}, wd = class extends H {
  create(e, t) {
    return this._client.post("/assistants", {
      body: e,
      ...t,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  retrieve(e, t) {
    return this._client.get(k`/assistants/${e}`, {
      ...t,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  update(e, t, n) {
    return this._client.post(k`/assistants/${e}`, {
      body: t,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/assistants", de, {
      query: e,
      ...t,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(k`/assistants/${e}`, {
      ...t,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, Ad = class extends H {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, Cd = class extends H {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, xs = class extends H {
  constructor() {
    super(...arguments), this.sessions = new Ad(this._client), this.transcriptionSessions = new Cd(this._client);
  }
};
xs.Sessions = Ad;
xs.TranscriptionSessions = Cd;
var Id = class extends H {
  create(e, t) {
    return this._client.post("/chatkit/sessions", {
      body: e,
      ...t,
      headers: q([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  cancel(e, t) {
    return this._client.post(k`/chatkit/sessions/${e}/cancel`, {
      ...t,
      headers: q([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
}, xd = class extends H {
  retrieve(e, t) {
    return this._client.get(k`/chatkit/threads/${e}`, {
      ...t,
      headers: q([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chatkit/threads", eo, {
      query: e,
      ...t,
      headers: q([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(k`/chatkit/threads/${e}`, {
      ...t,
      headers: q([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  listItems(e, t = {}, n) {
    return this._client.getAPIList(k`/chatkit/threads/${e}/items`, eo, {
      query: t,
      ...n,
      headers: q([{ "OpenAI-Beta": "chatkit_beta=v1" }, n?.headers])
    });
  }
}, Rs = class extends H {
  constructor() {
    super(...arguments), this.sessions = new Id(this._client), this.threads = new xd(this._client);
  }
};
Rs.Sessions = Id;
Rs.Threads = xd;
var Rd = class extends H {
  create(e, t, n) {
    return this._client.post(k`/threads/${e}/messages`, {
      body: t,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { thread_id: o } = t;
    return this._client.get(k`/threads/${o}/messages/${e}`, {
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  update(e, t, n) {
    const { thread_id: o, ...s } = t;
    return this._client.post(k`/threads/${o}/messages/${e}`, {
      body: s,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(k`/threads/${e}/messages`, de, {
      query: t,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { thread_id: o } = t;
    return this._client.delete(k`/threads/${o}/messages/${e}`, {
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, Pd = class extends H {
  retrieve(e, t, n) {
    const { thread_id: o, run_id: s, ...i } = t;
    return this._client.get(k`/threads/${o}/runs/${s}/steps/${e}`, {
      query: i,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t, n) {
    const { thread_id: o, ...s } = t;
    return this._client.getAPIList(k`/threads/${o}/runs/${e}/steps`, de, {
      query: s,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, og = (e) => {
  if (typeof Buffer < "u") {
    const t = Buffer.from(e, "base64");
    return Array.from(new Float32Array(t.buffer, t.byteOffset, t.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const t = atob(e), n = t.length, o = new Uint8Array(n);
    for (let s = 0; s < n; s++) o[s] = t.charCodeAt(s);
    return Array.from(new Float32Array(o.buffer));
  }
}, qt = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() ?? void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim();
}, be, kt, Oi, tt, Yo, Ke, Lt, Qt, Nt, ps, Fe, Xo, Qo, Yn, qn, On, Va, Ha, Ja, Wa, Ka, za, Ya, Xn = class extends xr {
  constructor() {
    super(...arguments), be.add(this), Oi.set(this, []), tt.set(this, {}), Yo.set(this, {}), Ke.set(this, void 0), Lt.set(this, void 0), Qt.set(this, void 0), Nt.set(this, void 0), ps.set(this, void 0), Fe.set(this, void 0), Xo.set(this, void 0), Qo.set(this, void 0), Yn.set(this, void 0);
  }
  [(Oi = /* @__PURE__ */ new WeakMap(), tt = /* @__PURE__ */ new WeakMap(), Yo = /* @__PURE__ */ new WeakMap(), Ke = /* @__PURE__ */ new WeakMap(), Lt = /* @__PURE__ */ new WeakMap(), Qt = /* @__PURE__ */ new WeakMap(), Nt = /* @__PURE__ */ new WeakMap(), ps = /* @__PURE__ */ new WeakMap(), Fe = /* @__PURE__ */ new WeakMap(), Xo = /* @__PURE__ */ new WeakMap(), Qo = /* @__PURE__ */ new WeakMap(), Yn = /* @__PURE__ */ new WeakMap(), be = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
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
    const t = new kt();
    return t._run(() => t._fromReadableStream(e)), t;
  }
  async _fromReadableStream(e, t) {
    const n = t?.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const o = jn.fromReadableStream(e, this.controller);
    for await (const s of o) E(this, be, "m", qn).call(this, s);
    if (o.controller.signal?.aborted) throw new Ve();
    return this._addRun(E(this, be, "m", On).call(this));
  }
  toReadableStream() {
    return new jn(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, t, n, o) {
    const s = new kt();
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
    for await (const u of a) E(this, be, "m", qn).call(this, u);
    if (a.controller.signal?.aborted) throw new Ve();
    return this._addRun(E(this, be, "m", On).call(this));
  }
  static createThreadAssistantStream(e, t, n) {
    const o = new kt();
    return o._run(() => o._threadAssistantStream(e, t, {
      ...n,
      headers: {
        ...n?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  static createAssistantStream(e, t, n, o) {
    const s = new kt();
    return s._run(() => s._runAssistantStream(e, t, n, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), s;
  }
  currentEvent() {
    return E(this, Xo, "f");
  }
  currentRun() {
    return E(this, Qo, "f");
  }
  currentMessageSnapshot() {
    return E(this, Ke, "f");
  }
  currentRunStepSnapshot() {
    return E(this, Yn, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(E(this, tt, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(E(this, Yo, "f"));
  }
  async finalRun() {
    if (await this.done(), !E(this, Lt, "f")) throw Error("Final run was not received.");
    return E(this, Lt, "f");
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
    for await (const a of i) E(this, be, "m", qn).call(this, a);
    if (i.controller.signal?.aborted) throw new Ve();
    return this._addRun(E(this, be, "m", On).call(this));
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
    for await (const u of a) E(this, be, "m", qn).call(this, u);
    if (a.controller.signal?.aborted) throw new Ve();
    return this._addRun(E(this, be, "m", On).call(this));
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
      else if (Zs(s) && Zs(o)) s = this.accumulateDelta(s, o);
      else if (Array.isArray(s) && Array.isArray(o)) {
        if (s.every((i) => typeof i == "string" || typeof i == "number")) {
          s.push(...o);
          continue;
        }
        for (const i of o) {
          if (!Zs(i)) throw new Error(`Expected array delta entry to be an object but got: ${i}`);
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
kt = Xn, qn = function(t) {
  if (!this.ended)
    switch (z(this, Xo, t, "f"), E(this, be, "m", Ja).call(this, t), t.event) {
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
        E(this, be, "m", Ya).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        E(this, be, "m", Ha).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        E(this, be, "m", Va).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, On = function() {
  if (this.ended) throw new W("stream has ended, this shouldn't happen");
  if (!E(this, Lt, "f")) throw Error("Final run has not been received");
  return E(this, Lt, "f");
}, Va = function(t) {
  const [n, o] = E(this, be, "m", Ka).call(this, t, E(this, Ke, "f"));
  z(this, Ke, n, "f"), E(this, Yo, "f")[n.id] = n;
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
        if (s.index != E(this, Qt, "f")) {
          if (E(this, Nt, "f")) switch (E(this, Nt, "f").type) {
            case "text":
              this._emit("textDone", E(this, Nt, "f").text, E(this, Ke, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", E(this, Nt, "f").image_file, E(this, Ke, "f"));
              break;
          }
          z(this, Qt, s.index, "f");
        }
        z(this, Nt, n.content[s.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (E(this, Qt, "f") !== void 0) {
        const s = t.data.content[E(this, Qt, "f")];
        if (s) switch (s.type) {
          case "image_file":
            this._emit("imageFileDone", s.image_file, E(this, Ke, "f"));
            break;
          case "text":
            this._emit("textDone", s.text, E(this, Ke, "f"));
            break;
        }
      }
      E(this, Ke, "f") && this._emit("messageDone", t.data), z(this, Ke, void 0, "f");
  }
}, Ha = function(t) {
  const n = E(this, be, "m", Wa).call(this, t);
  switch (z(this, Yn, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const o = t.data.delta;
      if (o.step_details && o.step_details.type == "tool_calls" && o.step_details.tool_calls && n.step_details.type == "tool_calls") for (const s of o.step_details.tool_calls) s.index == E(this, ps, "f") ? this._emit("toolCallDelta", s, n.step_details.tool_calls[s.index]) : (E(this, Fe, "f") && this._emit("toolCallDone", E(this, Fe, "f")), z(this, ps, s.index, "f"), z(this, Fe, n.step_details.tool_calls[s.index], "f"), E(this, Fe, "f") && this._emit("toolCallCreated", E(this, Fe, "f")));
      this._emit("runStepDelta", t.data.delta, n);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      z(this, Yn, void 0, "f"), t.data.step_details.type == "tool_calls" && E(this, Fe, "f") && (this._emit("toolCallDone", E(this, Fe, "f")), z(this, Fe, void 0, "f")), this._emit("runStepDone", t.data, n);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, Ja = function(t) {
  E(this, Oi, "f").push(t), this._emit("event", t);
}, Wa = function(t) {
  switch (t.event) {
    case "thread.run.step.created":
      return E(this, tt, "f")[t.data.id] = t.data, t.data;
    case "thread.run.step.delta":
      let n = E(this, tt, "f")[t.data.id];
      if (!n) throw Error("Received a RunStepDelta before creation of a snapshot");
      let o = t.data;
      if (o.delta) {
        const s = kt.accumulateDelta(n, o.delta);
        E(this, tt, "f")[t.data.id] = s;
      }
      return E(this, tt, "f")[t.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      E(this, tt, "f")[t.data.id] = t.data;
      break;
  }
  if (E(this, tt, "f")[t.data.id]) return E(this, tt, "f")[t.data.id];
  throw new Error("No snapshot available");
}, Ka = function(t, n) {
  let o = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, o];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let s = t.data;
      if (s.delta.content) for (const i of s.delta.content) if (i.index in n.content) {
        let a = n.content[i.index];
        n.content[i.index] = E(this, be, "m", za).call(this, i, a);
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
}, za = function(t, n) {
  return kt.accumulateDelta(n, t);
}, Ya = function(t) {
  switch (z(this, Qo, t.data, "f"), t.event) {
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
      z(this, Lt, t.data, "f"), E(this, Fe, "f") && (this._emit("toolCallDone", E(this, Fe, "f")), z(this, Fe, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var Mr = class extends H {
  constructor() {
    super(...arguments), this.steps = new Pd(this._client);
  }
  create(e, t, n) {
    const { include: o, ...s } = t;
    return this._client.post(k`/threads/${e}/runs`, {
      query: { include: o },
      body: s,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0
    });
  }
  retrieve(e, t, n) {
    const { thread_id: o } = t;
    return this._client.get(k`/threads/${o}/runs/${e}`, {
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  update(e, t, n) {
    const { thread_id: o, ...s } = t;
    return this._client.post(k`/threads/${o}/runs/${e}`, {
      body: s,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(k`/threads/${e}/runs`, de, {
      query: t,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  cancel(e, t, n) {
    const { thread_id: o } = t;
    return this._client.post(k`/threads/${o}/runs/${e}/cancel`, {
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t, n);
    return await this.poll(o.id, { thread_id: e }, n);
  }
  createAndStream(e, t, n) {
    return Xn.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  async poll(e, t, n) {
    const o = q([n?.headers, {
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
          await io(a);
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
    return Xn.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  submitToolOutputs(e, t, n) {
    const { thread_id: o, ...s } = t;
    return this._client.post(k`/threads/${o}/runs/${e}/submit_tool_outputs`, {
      body: s,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0
    });
  }
  async submitToolOutputsAndPoll(e, t, n) {
    const o = await this.submitToolOutputs(e, t, n);
    return await this.poll(o.id, t, n);
  }
  submitToolOutputsStream(e, t, n) {
    return Xn.createToolAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
};
Mr.Steps = Pd;
var Ps = class extends H {
  constructor() {
    super(...arguments), this.runs = new Mr(this._client), this.messages = new Rd(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/threads", {
      body: e,
      ...t,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  retrieve(e, t) {
    return this._client.get(k`/threads/${e}`, {
      ...t,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  update(e, t, n) {
    return this._client.post(k`/threads/${e}`, {
      body: t,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(k`/threads/${e}`, {
      ...t,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  createAndRun(e, t) {
    return this._client.post("/threads/runs", {
      body: e,
      ...t,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      stream: e.stream ?? !1,
      __synthesizeEventData: !0
    });
  }
  async createAndRunPoll(e, t) {
    const n = await this.createAndRun(e, t);
    return await this.runs.poll(n.id, { thread_id: n.thread_id }, t);
  }
  createAndRunStream(e, t) {
    return Xn.createThreadAssistantStream(e, this._client.beta.threads, t);
  }
};
Ps.Runs = Mr;
Ps.Messages = Rd;
var sn = class extends H {
  constructor() {
    super(...arguments), this.realtime = new xs(this._client), this.chatkit = new Rs(this._client), this.assistants = new wd(this._client), this.threads = new Ps(this._client);
  }
};
sn.Realtime = xs;
sn.ChatKit = Rs;
sn.Assistants = wd;
sn.Threads = Ps;
var Md = class extends H {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    });
  }
}, Nd = class extends H {
  retrieve(e, t, n) {
    const { container_id: o } = t;
    return this._client.get(k`/containers/${o}/files/${e}/content`, {
      ...n,
      headers: q([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
}, Nr = class extends H {
  constructor() {
    super(...arguments), this.content = new Nd(this._client);
  }
  create(e, t, n) {
    return this._client.post(k`/containers/${e}/files`, Is({
      body: t,
      ...n
    }, this._client));
  }
  retrieve(e, t, n) {
    const { container_id: o } = t;
    return this._client.get(k`/containers/${o}/files/${e}`, n);
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(k`/containers/${e}/files`, de, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { container_id: o } = t;
    return this._client.delete(k`/containers/${o}/files/${e}`, {
      ...n,
      headers: q([{ Accept: "*/*" }, n?.headers])
    });
  }
};
Nr.Content = Nd;
var kr = class extends H {
  constructor() {
    super(...arguments), this.files = new Nr(this._client);
  }
  create(e, t) {
    return this._client.post("/containers", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(k`/containers/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/containers", de, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(k`/containers/${e}`, {
      ...t,
      headers: q([{ Accept: "*/*" }, t?.headers])
    });
  }
};
kr.Files = Nr;
var kd = class extends H {
  create(e, t, n) {
    const { include: o, ...s } = t;
    return this._client.post(k`/conversations/${e}/items`, {
      query: { include: o },
      body: s,
      ...n
    });
  }
  retrieve(e, t, n) {
    const { conversation_id: o, ...s } = t;
    return this._client.get(k`/conversations/${o}/items/${e}`, {
      query: s,
      ...n
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(k`/conversations/${e}/items`, eo, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { conversation_id: o } = t;
    return this._client.delete(k`/conversations/${o}/items/${e}`, n);
  }
}, Lr = class extends H {
  constructor() {
    super(...arguments), this.items = new kd(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/conversations", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(k`/conversations/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(k`/conversations/${e}`, {
      body: t,
      ...n
    });
  }
  delete(e, t) {
    return this._client.delete(k`/conversations/${e}`, t);
  }
};
Lr.Items = kd;
var Ld = class extends H {
  create(e, t) {
    const n = !!e.encoding_format;
    let o = n ? e.encoding_format : "base64";
    n && Ee(this._client).debug("embeddings/user defined encoding_format:", e.encoding_format);
    const s = this._client.post("/embeddings", {
      body: {
        ...e,
        encoding_format: o
      },
      ...t
    });
    return n ? s : (Ee(this._client).debug("embeddings/decoding base64 embeddings from base64"), s._thenUnwrap((i) => (i && i.data && i.data.forEach((a) => {
      const u = a.embedding;
      a.embedding = og(u);
    }), i)));
  }
}, Dd = class extends H {
  retrieve(e, t, n) {
    const { eval_id: o, run_id: s } = t;
    return this._client.get(k`/evals/${o}/runs/${s}/output_items/${e}`, n);
  }
  list(e, t, n) {
    const { eval_id: o, ...s } = t;
    return this._client.getAPIList(k`/evals/${o}/runs/${e}/output_items`, de, {
      query: s,
      ...n
    });
  }
}, Dr = class extends H {
  constructor() {
    super(...arguments), this.outputItems = new Dd(this._client);
  }
  create(e, t, n) {
    return this._client.post(k`/evals/${e}/runs`, {
      body: t,
      ...n
    });
  }
  retrieve(e, t, n) {
    const { eval_id: o } = t;
    return this._client.get(k`/evals/${o}/runs/${e}`, n);
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(k`/evals/${e}/runs`, de, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { eval_id: o } = t;
    return this._client.delete(k`/evals/${o}/runs/${e}`, n);
  }
  cancel(e, t, n) {
    const { eval_id: o } = t;
    return this._client.post(k`/evals/${o}/runs/${e}`, n);
  }
};
Dr.OutputItems = Dd;
var $r = class extends H {
  constructor() {
    super(...arguments), this.runs = new Dr(this._client);
  }
  create(e, t) {
    return this._client.post("/evals", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(k`/evals/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(k`/evals/${e}`, {
      body: t,
      ...n
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/evals", de, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(k`/evals/${e}`, t);
  }
};
$r.Runs = Dr;
var $d = class extends H {
  create(e, t) {
    return this._client.post("/files", nt({
      body: e,
      ...t
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(k`/files/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/files", de, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(k`/files/${e}`, t);
  }
  content(e, t) {
    return this._client.get(k`/files/${e}/content`, {
      ...t,
      headers: q([{ Accept: "application/binary" }, t?.headers]),
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
      if (await io(t), i = await this.retrieve(e), Date.now() - s > n) throw new Er({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return i;
  }
}, Ud = class extends H {
}, Fd = class extends H {
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
}, Ur = class extends H {
  constructor() {
    super(...arguments), this.graders = new Fd(this._client);
  }
};
Ur.Graders = Fd;
var Bd = class extends H {
  create(e, t, n) {
    return this._client.getAPIList(k`/fine_tuning/checkpoints/${e}/permissions`, Cs, {
      body: t,
      method: "post",
      ...n
    });
  }
  retrieve(e, t = {}, n) {
    return this._client.get(k`/fine_tuning/checkpoints/${e}/permissions`, {
      query: t,
      ...n
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(k`/fine_tuning/checkpoints/${e}/permissions`, eo, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { fine_tuned_model_checkpoint: o } = t;
    return this._client.delete(k`/fine_tuning/checkpoints/${o}/permissions/${e}`, n);
  }
}, Fr = class extends H {
  constructor() {
    super(...arguments), this.permissions = new Bd(this._client);
  }
};
Fr.Permissions = Bd;
var Gd = class extends H {
  list(e, t = {}, n) {
    return this._client.getAPIList(k`/fine_tuning/jobs/${e}/checkpoints`, de, {
      query: t,
      ...n
    });
  }
}, Br = class extends H {
  constructor() {
    super(...arguments), this.checkpoints = new Gd(this._client);
  }
  create(e, t) {
    return this._client.post("/fine_tuning/jobs", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(k`/fine_tuning/jobs/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/fine_tuning/jobs", de, {
      query: e,
      ...t
    });
  }
  cancel(e, t) {
    return this._client.post(k`/fine_tuning/jobs/${e}/cancel`, t);
  }
  listEvents(e, t = {}, n) {
    return this._client.getAPIList(k`/fine_tuning/jobs/${e}/events`, de, {
      query: t,
      ...n
    });
  }
  pause(e, t) {
    return this._client.post(k`/fine_tuning/jobs/${e}/pause`, t);
  }
  resume(e, t) {
    return this._client.post(k`/fine_tuning/jobs/${e}/resume`, t);
  }
};
Br.Checkpoints = Gd;
var rn = class extends H {
  constructor() {
    super(...arguments), this.methods = new Ud(this._client), this.jobs = new Br(this._client), this.checkpoints = new Fr(this._client), this.alpha = new Ur(this._client);
  }
};
rn.Methods = Ud;
rn.Jobs = Br;
rn.Checkpoints = Fr;
rn.Alpha = Ur;
var qd = class extends H {
}, Gr = class extends H {
  constructor() {
    super(...arguments), this.graderModels = new qd(this._client);
  }
};
Gr.GraderModels = qd;
var Od = class extends H {
  createVariation(e, t) {
    return this._client.post("/images/variations", nt({
      body: e,
      ...t
    }, this._client));
  }
  edit(e, t) {
    return this._client.post("/images/edits", nt({
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
}, Vd = class extends H {
  retrieve(e, t) {
    return this._client.get(k`/models/${e}`, t);
  }
  list(e) {
    return this._client.getAPIList("/models", Cs, e);
  }
  delete(e, t) {
    return this._client.delete(k`/models/${e}`, t);
  }
}, Hd = class extends H {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t
    });
  }
}, Jd = class extends H {
  accept(e, t, n) {
    return this._client.post(k`/realtime/calls/${e}/accept`, {
      body: t,
      ...n,
      headers: q([{ Accept: "*/*" }, n?.headers])
    });
  }
  hangup(e, t) {
    return this._client.post(k`/realtime/calls/${e}/hangup`, {
      ...t,
      headers: q([{ Accept: "*/*" }, t?.headers])
    });
  }
  refer(e, t, n) {
    return this._client.post(k`/realtime/calls/${e}/refer`, {
      body: t,
      ...n,
      headers: q([{ Accept: "*/*" }, n?.headers])
    });
  }
  reject(e, t = {}, n) {
    return this._client.post(k`/realtime/calls/${e}/reject`, {
      body: t,
      ...n,
      headers: q([{ Accept: "*/*" }, n?.headers])
    });
  }
}, Wd = class extends H {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t
    });
  }
}, Ms = class extends H {
  constructor() {
    super(...arguments), this.clientSecrets = new Wd(this._client), this.calls = new Jd(this._client);
  }
};
Ms.ClientSecrets = Wd;
Ms.Calls = Jd;
function sg(e, t) {
  return !t || !rg(t) ? {
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
  } : Kd(e, t);
}
function Kd(e, t) {
  const n = e.output.map((s) => {
    if (s.type === "function_call") return {
      ...s,
      parsed_arguments: ug(t, s)
    };
    if (s.type === "message") {
      const i = s.content.map((a) => a.type === "output_text" ? {
        ...a,
        parsed: ig(t, a.text)
      } : a);
      return {
        ...s,
        content: i
      };
    }
    return s;
  }), o = Object.assign({}, e, { output: n });
  return Object.getOwnPropertyDescriptor(e, "output_text") || Vi(o), Object.defineProperty(o, "output_parsed", {
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
function ig(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function rg(e) {
  return !!Cr(e.text?.format);
}
function ag(e) {
  return e?.$brand === "auto-parseable-tool";
}
function lg(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function ug(e, t) {
  const n = lg(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: ag(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function Vi(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const o of n.content) o.type === "output_text" && t.push(o.text);
  e.output_text = t.join("");
}
var Ot, Eo, gt, bo, Xa, Qa, Za, ja, cg = class zd extends xr {
  constructor(t) {
    super(), Ot.add(this), Eo.set(this, void 0), gt.set(this, void 0), bo.set(this, void 0), z(this, Eo, t, "f");
  }
  static createResponse(t, n, o) {
    const s = new zd(n);
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
    s && (s.aborted && this.controller.abort(), s.addEventListener("abort", () => this.controller.abort())), E(this, Ot, "m", Xa).call(this);
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
    for await (const u of i) E(this, Ot, "m", Qa).call(this, u, a);
    if (i.controller.signal?.aborted) throw new Ve();
    return E(this, Ot, "m", Za).call(this);
  }
  [(Eo = /* @__PURE__ */ new WeakMap(), gt = /* @__PURE__ */ new WeakMap(), bo = /* @__PURE__ */ new WeakMap(), Ot = /* @__PURE__ */ new WeakSet(), Xa = function() {
    this.ended || z(this, gt, void 0, "f");
  }, Qa = function(n, o) {
    if (this.ended) return;
    const s = (a, u) => {
      (o == null || u.sequence_number > o) && this._emit(a, u);
    }, i = E(this, Ot, "m", ja).call(this, n);
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
  }, Za = function() {
    if (this.ended) throw new W("stream has ended, this shouldn't happen");
    const n = E(this, gt, "f");
    if (!n) throw new W("request ended without sending any events");
    z(this, gt, void 0, "f");
    const o = dg(n, E(this, Eo, "f"));
    return z(this, bo, o, "f"), o;
  }, ja = function(n) {
    let o = E(this, gt, "f");
    if (!o) {
      if (n.type !== "response.created") throw new W(`When snapshot hasn't been set yet, expected 'response.created' event, got ${n.type}`);
      return o = z(this, gt, n.response, "f"), o;
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
        z(this, gt, n.response, "f");
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
    const t = E(this, bo, "f");
    if (!t) throw new W("stream ended without producing a ChatCompletion");
    return t;
  }
};
function dg(e, t) {
  return sg(e, t);
}
var Yd = class extends H {
  list(e, t = {}, n) {
    return this._client.getAPIList(k`/responses/${e}/input_items`, de, {
      query: t,
      ...n
    });
  }
}, Xd = class extends H {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t
    });
  }
}, Ns = class extends H {
  constructor() {
    super(...arguments), this.inputItems = new Yd(this._client), this.inputTokens = new Xd(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && Vi(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(k`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1
    })._thenUnwrap((o) => ("object" in o && o.object === "response" && Vi(o), o));
  }
  delete(e, t) {
    return this._client.delete(k`/responses/${e}`, {
      ...t,
      headers: q([{ Accept: "*/*" }, t?.headers])
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => Kd(n, e));
  }
  stream(e, t) {
    return cg.createResponse(this._client, e, t);
  }
  cancel(e, t) {
    return this._client.post(k`/responses/${e}/cancel`, t);
  }
  compact(e, t) {
    return this._client.post("/responses/compact", {
      body: e,
      ...t
    });
  }
};
Ns.InputItems = Yd;
Ns.InputTokens = Xd;
var Qd = class extends H {
  retrieve(e, t) {
    return this._client.get(k`/skills/${e}/content`, {
      ...t,
      headers: q([{ Accept: "application/binary" }, t?.headers]),
      __binaryResponse: !0
    });
  }
}, Zd = class extends H {
  retrieve(e, t, n) {
    const { skill_id: o } = t;
    return this._client.get(k`/skills/${o}/versions/${e}/content`, {
      ...n,
      headers: q([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
}, qr = class extends H {
  constructor() {
    super(...arguments), this.content = new Zd(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(k`/skills/${e}/versions`, Is({
      body: t,
      ...n
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: o } = t;
    return this._client.get(k`/skills/${o}/versions/${e}`, n);
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(k`/skills/${e}/versions`, de, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { skill_id: o } = t;
    return this._client.delete(k`/skills/${o}/versions/${e}`, n);
  }
};
qr.Content = Zd;
var ks = class extends H {
  constructor() {
    super(...arguments), this.content = new Qd(this._client), this.versions = new qr(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", Is({
      body: e,
      ...t
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(k`/skills/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(k`/skills/${e}`, {
      body: t,
      ...n
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/skills", de, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(k`/skills/${e}`, t);
  }
};
ks.Content = Qd;
ks.Versions = qr;
var jd = class extends H {
  create(e, t, n) {
    return this._client.post(k`/uploads/${e}/parts`, nt({
      body: t,
      ...n
    }, this._client));
  }
}, Or = class extends H {
  constructor() {
    super(...arguments), this.parts = new jd(this._client);
  }
  create(e, t) {
    return this._client.post("/uploads", {
      body: e,
      ...t
    });
  }
  cancel(e, t) {
    return this._client.post(k`/uploads/${e}/cancel`, t);
  }
  complete(e, t, n) {
    return this._client.post(k`/uploads/${e}/complete`, {
      body: t,
      ...n
    });
  }
};
Or.Parts = jd;
var fg = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((s) => s.status === "rejected");
  if (n.length) {
    for (const s of n) console.error(s.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const o = [];
  for (const s of t) s.status === "fulfilled" && o.push(s.value);
  return o;
}, ef = class extends H {
  create(e, t, n) {
    return this._client.post(k`/vector_stores/${e}/file_batches`, {
      body: t,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.get(k`/vector_stores/${o}/file_batches/${e}`, {
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  cancel(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.post(k`/vector_stores/${o}/file_batches/${e}/cancel`, {
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t);
    return await this.poll(e, o.id, n);
  }
  listFiles(e, t, n) {
    const { vector_store_id: o, ...s } = t;
    return this._client.getAPIList(k`/vector_stores/${o}/file_batches/${e}/files`, de, {
      query: s,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async poll(e, t, n) {
    const o = q([n?.headers, {
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
          await io(a);
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
    return await fg(Array(i).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, tf = class extends H {
  create(e, t, n) {
    return this._client.post(k`/vector_stores/${e}/files`, {
      body: t,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.get(k`/vector_stores/${o}/files/${e}`, {
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vector_store_id: o, ...s } = t;
    return this._client.post(k`/vector_stores/${o}/files/${e}`, {
      body: s,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(k`/vector_stores/${e}/files`, de, {
      query: t,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.delete(k`/vector_stores/${o}/files/${e}`, {
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t, n);
    return await this.poll(e, o.id, n);
  }
  async poll(e, t, n) {
    const o = q([n?.headers, {
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
          await io(a);
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
    return this._client.getAPIList(k`/vector_stores/${o}/files/${e}/content`, Cs, {
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, Ls = class extends H {
  constructor() {
    super(...arguments), this.files = new tf(this._client), this.fileBatches = new ef(this._client);
  }
  create(e, t) {
    return this._client.post("/vector_stores", {
      body: e,
      ...t,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  retrieve(e, t) {
    return this._client.get(k`/vector_stores/${e}`, {
      ...t,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  update(e, t, n) {
    return this._client.post(k`/vector_stores/${e}`, {
      body: t,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/vector_stores", de, {
      query: e,
      ...t,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(k`/vector_stores/${e}`, {
      ...t,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  search(e, t, n) {
    return this._client.getAPIList(k`/vector_stores/${e}/search`, Cs, {
      body: t,
      method: "post",
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
};
Ls.Files = tf;
Ls.FileBatches = ef;
var nf = class extends H {
  create(e, t) {
    return this._client.post("/videos", nt({
      body: e,
      ...t
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(k`/videos/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/videos", eo, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(k`/videos/${e}`, t);
  }
  createCharacter(e, t) {
    return this._client.post("/videos/characters", nt({
      body: e,
      ...t
    }, this._client));
  }
  downloadContent(e, t = {}, n) {
    return this._client.get(k`/videos/${e}/content`, {
      query: t,
      ...n,
      headers: q([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
  edit(e, t) {
    return this._client.post("/videos/edits", nt({
      body: e,
      ...t
    }, this._client));
  }
  extend(e, t) {
    return this._client.post("/videos/extensions", nt({
      body: e,
      ...t
    }, this._client));
  }
  getCharacter(e, t) {
    return this._client.get(k`/videos/characters/${e}`, t);
  }
  remix(e, t, n) {
    return this._client.post(k`/videos/${e}/remix`, Is({
      body: t,
      ...n
    }, this._client));
  }
}, zt, of, Zo, sf = class extends H {
  constructor() {
    super(...arguments), zt.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, o = 300) {
    return await this.verifySignature(e, t, n, o), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, o = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    E(this, zt, "m", of).call(this, n);
    const s = q([t]).values, i = E(this, zt, "m", Zo).call(this, s, "webhook-signature"), a = E(this, zt, "m", Zo).call(this, s, "webhook-timestamp"), u = E(this, zt, "m", Zo).call(this, s, "webhook-id"), c = parseInt(a, 10);
    if (isNaN(c)) throw new kn("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > o) throw new kn("Webhook timestamp is too old");
    if (c > d + o) throw new kn("Webhook timestamp is too new");
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
    throw new kn("The given webhook signature does not match the expected signature");
  }
};
zt = /* @__PURE__ */ new WeakSet(), of = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, Zo = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const o = t.get(n);
  if (o == null) throw new Error(`Missing required header: ${n}`);
  return o;
};
var Hi, Vr, jo, rf, ri = "workload-identity-auth", te = class {
  constructor({ baseURL: e = qt("OPENAI_BASE_URL"), apiKey: t = qt("OPENAI_API_KEY"), organization: n = qt("OPENAI_ORG_ID") ?? null, project: o = qt("OPENAI_PROJECT_ID") ?? null, webhookSecret: s = qt("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: i, ...a } = {}) {
    if (Hi.add(this), jo.set(this, void 0), this.completions = new Md(this), this.chat = new Pr(this), this.embeddings = new Ld(this), this.files = new $d(this), this.images = new Od(this), this.audio = new ao(this), this.moderations = new Hd(this), this.models = new Vd(this), this.fineTuning = new rn(this), this.graders = new Gr(this), this.vectorStores = new Ls(this), this.webhooks = new sf(this), this.beta = new sn(this), this.batches = new bd(this), this.uploads = new Or(this), this.responses = new Ns(this), this.realtime = new Ms(this), this.conversations = new Lr(this), this.evals = new $r(this), this.containers = new kr(this), this.skills = new ks(this), this.videos = new nf(this), i) {
      if (t && t !== ri) throw new W("The `apiKey` and `workloadIdentity` arguments are mutually exclusive; only one can be passed at a time.");
      t = ri;
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
    if (!u.dangerouslyAllowBrowser && im()) throw new W(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = u.baseURL, this.timeout = u.timeout ?? Vr.DEFAULT_TIMEOUT, this.logger = u.logger ?? console;
    const c = "warn";
    this.logLevel = c, this.logLevel = Da(u.logLevel, "ClientOptions.logLevel", this) ?? Da(qt("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? c, this.fetchOptions = u.fetchOptions, this.maxRetries = u.maxRetries ?? 2, this.fetch = u.fetch ?? Gc(), z(this, jo, cm, "f"), this._options = u, i && (this._workloadIdentityAuth = new xm(i, this.fetch)), this.apiKey = typeof t == "string" ? t : "Missing Key", this.organization = n, this.project = o, this.webhookSecret = s;
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
    return q([{ Authorization: `Bearer ${this.apiKey}` }]);
  }
  stringifyQuery(e) {
    return gm(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Wt}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Ic()}`;
  }
  makeStatusError(e, t, n, o) {
    return we.generate(e, t, n, o);
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
    const o = !E(this, Hi, "m", rf).call(this) && n || this.baseURL, s = tm(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), a = Object.fromEntries(s.searchParams);
    return (!wa(i) || !wa(a)) && (t = {
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
    return new Qc(this, this.makeRequest(e, t, void 0));
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
    if (Ee(this).debug(`[${c}] sending request`, xt({
      retryOfRequestLogID: n,
      method: o.method,
      url: a,
      options: o,
      headers: i.headers
    })), o.signal?.aborted) throw new Ve();
    const f = new AbortController(), h = await this.fetchWithAuth(a, i, u, f).catch(Ri), m = Date.now();
    if (h instanceof globalThis.Error) {
      const y = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new Ve();
      const _ = xi(h) || /timed? ?out/i.test(String(h) + ("cause" in h ? String(h.cause) : ""));
      if (t)
        return Ee(this).info(`[${c}] connection ${_ ? "timed out" : "failed"} - ${y}`), Ee(this).debug(`[${c}] connection ${_ ? "timed out" : "failed"} (${y})`, xt({
          retryOfRequestLogID: n,
          url: a,
          durationMs: m - p,
          message: h.message
        })), this.retryRequest(o, t, n ?? c);
      throw Ee(this).info(`[${c}] connection ${_ ? "timed out" : "failed"} - error; no more retries left`), Ee(this).debug(`[${c}] connection ${_ ? "timed out" : "failed"} (error; no more retries left)`, xt({
        retryOfRequestLogID: n,
        url: a,
        durationMs: m - p,
        message: h.message
      })), h instanceof Fc || h instanceof jh ? h : _ ? new Er() : new ws({ cause: h });
    }
    const g = `[${c}${d}${[...h.headers.entries()].filter(([y]) => y === "x-request-id").map(([y, _]) => ", " + y + ": " + JSON.stringify(_)).join("")}] ${i.method} ${a} ${h.ok ? "succeeded" : "failed"} with status ${h.status} in ${m - p}ms`;
    if (!h.ok) {
      if (h.status === 401 && this._workloadIdentityAuth && !o.__metadata?.hasStreamingBody && !o.__metadata?.workloadIdentityTokenRefreshed)
        return await xa(h.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
          ...o,
          __metadata: {
            ...o.__metadata,
            workloadIdentityTokenRefreshed: !0
          }
        }, t, n ?? c);
      const y = await this.shouldRetry(h);
      if (t && y) {
        const R = `retrying, ${t} attempts remaining`;
        return await xa(h.body), Ee(this).info(`${g} - ${R}`), Ee(this).debug(`[${c}] response error (${R})`, xt({
          retryOfRequestLogID: n,
          url: h.url,
          status: h.status,
          headers: h.headers,
          durationMs: m - p
        })), this.retryRequest(o, t, n ?? c, h.headers);
      }
      const _ = y ? "error; no more retries left" : "error; not retryable";
      Ee(this).info(`${g} - ${_}`);
      const S = await h.text().catch((R) => Ri(R).message), b = sm(S), A = b ? void 0 : S;
      throw Ee(this).debug(`[${c}] response error (${_})`, xt({
        retryOfRequestLogID: n,
        url: h.url,
        status: h.status,
        headers: h.headers,
        message: A,
        durationMs: Date.now() - p
      })), this.makeStatusError(h.status, b, A, h.headers);
    }
    return Ee(this).info(g), Ee(this).debug(`[${c}] response start`, xt({
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
    return new Am(this, n, e);
  }
  async fetchWithAuth(e, t, n, o) {
    if (this._workloadIdentityAuth) {
      const s = t.headers, i = s.get("Authorization");
      if (!i || i === `Bearer ${ri}`) {
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
    return await io(s), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const s = t - e;
    return Math.min(0.5 * Math.pow(2, s), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: o, path: s, query: i, defaultBaseURL: a } = n, u = this.buildURL(s, i, a);
    "timeout" in n && om("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    const i = q([
      s,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(o),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...um(),
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
    const n = q([t]), o = typeof globalThis.ReadableStream < "u" && e instanceof globalThis.ReadableStream, s = !o && (typeof e == "string" || e instanceof ArrayBuffer || ArrayBuffer.isView(e) || typeof globalThis.Blob < "u" && e instanceof globalThis.Blob || e instanceof URLSearchParams || e instanceof FormData);
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
      ...E(this, jo, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
Vr = te, jo = /* @__PURE__ */ new WeakMap(), Hi = /* @__PURE__ */ new WeakSet(), rf = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
te.OpenAI = Vr;
te.DEFAULT_TIMEOUT = 6e5;
te.OpenAIError = W;
te.APIError = we;
te.APIConnectionError = ws;
te.APIConnectionTimeoutError = Er;
te.APIUserAbortError = Ve;
te.NotFoundError = Mc;
te.ConflictError = Nc;
te.RateLimitError = Lc;
te.BadRequestError = xc;
te.AuthenticationError = Rc;
te.InternalServerError = Dc;
te.PermissionDeniedError = Pc;
te.UnprocessableEntityError = kc;
te.InvalidWebhookSignatureError = kn;
te.toFile = km;
te.Completions = Md;
te.Chat = Pr;
te.Embeddings = Ld;
te.Files = $d;
te.Images = Od;
te.Audio = ao;
te.Moderations = Hd;
te.Models = Vd;
te.FineTuning = rn;
te.Graders = Gr;
te.VectorStores = Ls;
te.Webhooks = sf;
te.Beta = sn;
te.Batches = bd;
te.Uploads = Or;
te.Responses = Ns;
te.Realtime = Ms;
te.Conversations = Lr;
te.Evals = $r;
te.Containers = kr;
te.Skills = ks;
te.Videos = nf;
function pg(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function ze(e, t, n) {
  const o = String(n || "").trim();
  o && e.push({
    label: t,
    text: o
  });
}
function hg(e) {
  return typeof e == "string" ? e : Array.isArray(e) ? e.map((t) => t ? typeof t == "string" ? t : t.text || t.content || "" : "").filter(Boolean).join(`
`) : "";
}
function ai(e = "") {
  const t = [];
  return {
    cleaned: String(e || "").replace(/<think>([\s\S]*?)<\/think>/gi, (n, o) => (ze(t, "思考块", o), "")).trim(),
    thoughts: t
  };
}
function Rt(e, t, n) {
  if (t) {
    if (typeof t == "string") {
      ze(e, n, t);
      return;
    }
    if (Array.isArray(t)) {
      t.forEach((o) => Rt(e, o, n));
      return;
    }
    typeof t == "object" && (typeof t.text == "string" && ze(e, n, t.text), typeof t.content == "string" && ze(e, n, t.content), typeof t.reasoning_content == "string" && ze(e, n, t.reasoning_content), typeof t.thinking == "string" && ze(e, n, t.thinking), Array.isArray(t.summary) && t.summary.forEach((o) => {
      if (typeof o == "string") {
        ze(e, "推理摘要", o);
        return;
      }
      o && typeof o == "object" && ze(e, "推理摘要", o.text || o.content || "");
    }));
  }
}
function mg(e = {}, t = {}) {
  const n = [];
  return Rt(n, e.reasoning_content, "推理文本"), Rt(n, e.reasoning, "推理文本"), Rt(n, e.reasoning_text, "推理文本"), Rt(n, e.thinking, "思考块"), Rt(n, t.reasoning_content, "推理文本"), Rt(n, t.reasoning, "推理文本"), Array.isArray(e.content) && e.content.forEach((o) => {
    if (!(!o || typeof o != "object")) {
      if (o.type === "reasoning_text") {
        ze(n, "推理文本", o.text);
        return;
      }
      if (o.type === "summary_text") {
        ze(n, "推理摘要", o.text);
        return;
      }
      (o.type === "thinking" || o.type === "reasoning" || o.type === "reasoning_content") && ze(n, "思考块", o.text || o.content || o.reasoning || "");
    }
  }), n;
}
function el(e = "") {
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
function tl(e) {
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
function gg(e) {
  const t = /* @__PURE__ */ new Map(), n = [];
  for (const o of e.messages || []) {
    if (o.role === "assistant" && Array.isArray(o.tool_calls) && o.tool_calls.length) {
      const s = o.tool_calls.map((i, a) => {
        const u = i.function?.name || "", c = i.id || `tool-call-${a + 1}`;
        return u && t.set(c, u), `<<TOOL_CALL>>${JSON.stringify({
          id: c,
          name: u,
          arguments: pg(i.function?.arguments || "{}")
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
    content: tl(e)
  }) : n[0] = {
    ...n[0],
    content: tl({
      ...e,
      systemPrompt: n[0].content || e.systemPrompt
    })
  }, n;
}
function yg(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
var _g = class {
  constructor(e) {
    this.config = e, this.client = new te({
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
      messages: t ? gg(e) : e.messages,
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
    }), typeof e.onStreamProgress == "function") {
      const f = await this.client.chat.completions.create({
        ...n,
        stream: !0
      }, { signal: e.signal }), h = {
        content: "",
        toolCalls: []
      };
      let m = "stop", g = this.config.model;
      for await (const A of f) {
        g = A.model || g;
        const R = A.choices?.[0], $ = R?.delta || {};
        R?.finish_reason && (m = R.finish_reason), typeof $.content == "string" && (h.content += $.content), Array.isArray($.tool_calls) && $.tool_calls.forEach((v) => {
          const I = Number(v.index ?? 0), P = h.toolCalls[I] || {
            id: "",
            type: "function",
            function: {
              name: "",
              arguments: ""
            }
          };
          h.toolCalls[I] = {
            ...P,
            id: v.id || P.id,
            type: v.type || P.type,
            function: {
              name: v.function?.name || P.function?.name || "",
              arguments: `${P.function?.arguments || ""}${v.function?.arguments || ""}`
            }
          };
        });
        const w = ai(h.content);
        yg(e, {
          text: h.toolCalls.filter((v) => v?.function?.name).length ? w.cleaned : w.cleaned.replace(/<<TOOL_CALL>>[\s\S]*?<<\/TOOL_CALL>>/g, "").replace(/<tool_call>[\s\S]*?<\/tool_call>/g, "").trim(),
          thoughts: w.thoughts
        });
      }
      const y = h.toolCalls.map((A) => ({
        id: A.id || `openai-tool-${Date.now()}`,
        name: A.function?.name || "",
        arguments: A.function?.arguments || "{}"
      })).filter((A) => A.name), _ = ai(h.content), S = y.length ? [] : el(_.cleaned), b = [...y, ...S];
      return {
        text: y.length ? _.cleaned : _.cleaned.replace(/<<TOOL_CALL>>[\s\S]*?<<\/TOOL_CALL>>/g, "").replace(/<tool_call>[\s\S]*?<\/tool_call>/g, "").trim(),
        toolCalls: b,
        thoughts: _.thoughts,
        finishReason: m,
        model: g,
        provider: "openai-compatible"
      };
    }
    const o = await this.client.chat.completions.create(n, { signal: e.signal }), s = o.choices?.[0] || {}, i = s.message || {}, a = mg(i, s), u = (i.tool_calls || []).map((f) => ({
      id: f.id || `openai-tool-${Date.now()}`,
      name: f.function?.name || "",
      arguments: f.function?.arguments || "{}"
    })).filter((f) => f.name), c = ai(hg(i.content));
    c.thoughts.forEach((f) => a.push(f));
    const d = u.length ? [] : el(c.cleaned), p = [...u, ...d];
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
function af(e, t) {
  return {
    type: "message",
    role: e,
    content: vg(t)
  };
}
function hs(e) {
  return {
    role: "assistant",
    content: typeof e == "string" ? e : ""
  };
}
function vg(e) {
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
function ms(e, t, n) {
  const o = String(n || "").trim();
  o && e.push({
    label: t,
    text: o
  });
}
function nl(e, t = [], n = {}) {
  (t || []).forEach((o) => {
    if (!(!o || typeof o != "object")) {
      if (o.type === "reasoning_text") {
        ms(e, n.reasoning || "推理文本", o.text);
        return;
      }
      o.type === "summary_text" && ms(e, n.summary || "推理摘要", o.text);
    }
  });
}
function Sg(e = []) {
  const t = [];
  return (e || []).forEach((n) => {
    !n || typeof n != "object" || n.type === "reasoning" && (nl(t, n.content, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }), nl(t, n.summary, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }));
  }), t;
}
function Tg(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function Eg(e) {
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
function bg(e) {
  const t = e?.choices?.[0], n = t?.message?.content, o = String(t?.finish_reason || "");
  if (typeof n != "string" || !n.trim()) return null;
  const s = n.toLowerCase();
  return !s.includes("proxy error") || !s.includes("/responses") && !o.toLowerCase().includes("proxy error") ? null : n.trim();
}
function wg(e) {
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
        n.content?.trim() && t.push(hs(n.content)), n.tool_calls.forEach((o, s) => {
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
        t.push(hs(n.content || ""));
        continue;
      }
      t.push(n.role === "user" ? af(n.role, n.content || "") : {
        role: n.role,
        content: typeof n.content == "string" ? n.content : ""
      });
    }
  return t;
}
function Ag(e) {
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
      n.content?.trim() && t.push(hs(n.content)), n.tool_calls.forEach((o, s) => {
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
      t.push(hs(n.content || ""));
      continue;
    }
    t.push(n.role === "user" ? af(n.role, n.content || "") : {
      role: n.role,
      content: typeof n.content == "string" ? n.content : ""
    });
  }
  return t;
}
function Cg(e) {
  try {
    return new URL(String(e || "https://api.openai.com/v1")).hostname === "api.openai.com";
  } catch {
    return !1;
  }
}
function Ig(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return t.includes("instructions") || t.includes("unsupported") || t.includes("unknown parameter") || t.includes("invalid input");
}
function xg(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function li(e, t) {
  const [n = "0", o = "0"] = String(e || "").split(":"), [s = "0", i = "0"] = String(t || "").split(":");
  return Number(n) - Number(s) || Number(o) - Number(i);
}
var Rg = class {
  constructor(e) {
    this.config = e, this.client = new te({
      apiKey: e.apiKey,
      baseURL: String(e.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 18e4,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  async chat(e) {
    const t = (c) => {
      const d = bg(c);
      if (d) {
        const f = new Error(d);
        throw f.name = "ProxyEndpointError", f.rawDisplay = d, f;
      }
      const p = Array.isArray(c.output) ? c.output : [];
      return {
        output: p,
        thoughts: Sg(p),
        toolCalls: p.filter((f) => f.type === "function_call" && f.name).map((f, h) => ({
          id: f.call_id || `response-tool-${h + 1}`,
          name: f.name || "",
          arguments: f.arguments || "{}"
        })),
        text: Eg(c)
      };
    }, n = (c = !1) => {
      const d = {
        model: this.config.model,
        instructions: c ? void 0 : Tg(e) || void 0,
        input: c ? Ag(e) : wg(e),
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
      return await this.client.responses.create(d, { signal: e.signal });
    }, s = async (c = !1) => {
      const d = n(c), p = this.client.responses.stream(d, { signal: e.signal }), f = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), g = () => {
        const y = [];
        Array.from(h.entries()).sort(([_], [S]) => li(_, S)).forEach(([, _]) => ms(y, "推理文本", _)), Array.from(m.entries()).sort(([_], [S]) => li(_, S)).forEach(([, _]) => ms(y, "推理摘要", _)), xg(e, {
          text: Array.from(f.entries()).sort(([_], [S]) => li(_, S)).map(([, _]) => _).join(`
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
    }, i = !Cg(this.config.baseUrl);
    let a, u;
    try {
      a = typeof e.onStreamProgress == "function" ? await s(!1) : await o(!1), u = t(a), i && !u.text && !u.toolCalls.length && (a = typeof e.onStreamProgress == "function" ? await s(!0) : await o(!0), u = t(a));
    } catch (c) {
      if (!i || !Ig(c)) throw c;
      a = typeof e.onStreamProgress == "function" ? await s(!0) : await o(!0), u = t(a);
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
function G(e, t, n, o, s) {
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
var lf = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return lf = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function to(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Ji = (e) => {
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
}, X = class extends Error {
}, Be = class Wi extends X {
  constructor(t, n, o, s, i) {
    super(`${Wi.makeMessage(t, n, o)}`), this.status = t, this.headers = s, this.requestID = s?.get("request-id"), this.error = n, this.type = i ?? null;
  }
  static makeMessage(t, n, o) {
    const s = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && s ? `${t} ${s}` : t ? `${t} status code (no body)` : s || "(no status code or body)";
  }
  static generate(t, n, o, s) {
    if (!t || !s) return new Ds({
      message: o,
      cause: Ji(n)
    });
    const i = n, a = i?.error?.type;
    return t === 400 ? new cf(t, i, o, s, a) : t === 401 ? new df(t, i, o, s, a) : t === 403 ? new ff(t, i, o, s, a) : t === 404 ? new pf(t, i, o, s, a) : t === 409 ? new hf(t, i, o, s, a) : t === 422 ? new mf(t, i, o, s, a) : t === 429 ? new gf(t, i, o, s, a) : t >= 500 ? new yf(t, i, o, s, a) : new Wi(t, i, o, s, a);
  }
}, Xe = class extends Be {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Ds = class extends Be {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, uf = class extends Ds {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, cf = class extends Be {
}, df = class extends Be {
}, ff = class extends Be {
}, pf = class extends Be {
}, hf = class extends Be {
}, mf = class extends Be {
}, gf = class extends Be {
}, yf = class extends Be {
}, Pg = /^[a-z][a-z0-9+.-]*:/i, Mg = (e) => Pg.test(e), Ki = (e) => (Ki = Array.isArray, Ki(e)), ol = Ki;
function zi(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function sl(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Ng(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var kg = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new X(`${e} must be an integer`);
  if (t < 0) throw new X(`${e} must be a positive integer`);
  return t;
}, _f = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Lg = (e) => new Promise((t) => setTimeout(t, e)), Yt = "0.89.0", Dg = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function $g() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var Ug = () => {
  const e = $g();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Yt,
    "X-Stainless-OS": rl(Deno.build.os),
    "X-Stainless-Arch": il(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Yt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Yt,
    "X-Stainless-OS": rl(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": il(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = Fg();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Yt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Yt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function Fg() {
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
var il = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", rl = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), al, Bg = () => al ?? (al = Ug());
function Gg() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function vf(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Sf(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return vf({
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
function Hr(e) {
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
async function qg(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var Og = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function Vg(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new X(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function Hg(e) {
  let t = 0;
  for (const s of e) t += s.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const s of e)
    n.set(s, o), o += s.length;
  return n;
}
var ll;
function Jr(e) {
  let t;
  return (ll ?? (t = new globalThis.TextEncoder(), ll = t.encode.bind(t)))(e);
}
var ul;
function cl(e) {
  let t;
  return (ul ?? (t = new globalThis.TextDecoder(), ul = t.decode.bind(t)))(e);
}
var $e, Ue, lo = class {
  constructor() {
    $e.set(this, void 0), Ue.set(this, void 0), G(this, $e, new Uint8Array(), "f"), G(this, Ue, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Jr(e) : e;
    G(this, $e, Hg([T(this, $e, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = Jg(T(this, $e, "f"), T(this, Ue, "f"))) != null; ) {
      if (o.carriage && T(this, Ue, "f") == null) {
        G(this, Ue, o.index, "f");
        continue;
      }
      if (T(this, Ue, "f") != null && (o.index !== T(this, Ue, "f") + 1 || o.carriage)) {
        n.push(cl(T(this, $e, "f").subarray(0, T(this, Ue, "f") - 1))), G(this, $e, T(this, $e, "f").subarray(T(this, Ue, "f")), "f"), G(this, Ue, null, "f");
        continue;
      }
      const s = T(this, Ue, "f") !== null ? o.preceding - 1 : o.preceding, i = cl(T(this, $e, "f").subarray(0, s));
      n.push(i), G(this, $e, T(this, $e, "f").subarray(o.index), "f"), G(this, Ue, null, "f");
    }
    return n;
  }
  flush() {
    return T(this, $e, "f").length ? this.decode(`
`) : [];
  }
};
$e = /* @__PURE__ */ new WeakMap(), Ue = /* @__PURE__ */ new WeakMap();
lo.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
lo.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function Jg(e, t) {
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
function Wg(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var gs = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, dl = (e, t, n) => {
  if (e) {
    if (Ng(gs, e)) return e;
    Ie(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(gs))}`);
  }
};
function Vn() {
}
function wo(e, t, n) {
  return !t || gs[e] > gs[n] ? Vn : t[e].bind(t);
}
var Kg = {
  error: Vn,
  warn: Vn,
  info: Vn,
  debug: Vn
}, fl = /* @__PURE__ */ new WeakMap();
function Ie(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return Kg;
  const o = fl.get(t);
  if (o && o[0] === n) return o[1];
  const s = {
    error: wo("error", t, n),
    warn: wo("warn", t, n),
    info: wo("info", t, n),
    debug: wo("debug", t, n)
  };
  return fl.set(t, [n, s]), s;
}
var Pt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), mn, no = class Hn {
  constructor(t, n, o) {
    this.iterator = t, mn.set(this, void 0), this.controller = n, G(this, mn, o, "f");
  }
  static fromSSEResponse(t, n, o) {
    let s = !1;
    const i = o ? Ie(o) : console;
    async function* a() {
      if (s) throw new X("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      s = !0;
      let u = !1;
      try {
        for await (const c of zg(t, n)) {
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
            const d = _f(c.data) ?? c.data, p = d?.error?.type;
            throw new Be(void 0, d, void 0, t.headers, p);
          }
        }
        u = !0;
      } catch (c) {
        if (to(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Hn(a, n, o);
  }
  static fromReadableStream(t, n, o) {
    let s = !1;
    async function* i() {
      const u = new lo(), c = Hr(t);
      for await (const d of c) for (const p of u.decode(d)) yield p;
      for (const d of u.flush()) yield d;
    }
    async function* a() {
      if (s) throw new X("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      s = !0;
      let u = !1;
      try {
        for await (const c of i())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (to(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Hn(a, n, o);
  }
  [(mn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new Hn(() => s(t), this.controller, T(this, mn, "f")), new Hn(() => s(n), this.controller, T(this, mn, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return vf({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: s, done: i } = await n.next();
          if (i) return o.close();
          const a = Jr(JSON.stringify(s) + `
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
async function* zg(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new X("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new X("Attempted to iterate over a response with no body");
  const n = new Xg(), o = new lo(), s = Hr(e.body);
  for await (const i of Yg(s)) for (const a of o.decode(i)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const i of o.flush()) {
    const a = n.decode(i);
    a && (yield a);
  }
}
async function* Yg(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Jr(n) : n;
    let s = new Uint8Array(t.length + o.length);
    s.set(t), s.set(o, t.length), t = s;
    let i;
    for (; (i = Wg(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var Xg = class {
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
    let [t, n, o] = Qg(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function Qg(e, t) {
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
async function Tf(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: s, startTime: i } = t, a = await (async () => {
    if (t.options.stream)
      return Ie(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : no.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Ef(await n.json(), n) : await n.text();
  })();
  return Ie(e).debug(`[${o}] response parsed`, Pt({
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
var Jn, bf = class wf extends Promise {
  constructor(t, n, o = Tf) {
    super((s) => {
      s(null);
    }), this.responsePromise = n, this.parseResponse = o, Jn.set(this, void 0), G(this, Jn, t, "f");
  }
  _thenUnwrap(t) {
    return new wf(T(this, Jn, "f"), this.responsePromise, async (n, o) => Ef(t(await this.parseResponse(n, o), o), o.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(T(this, Jn, "f"), t))), this.parsedPromise;
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
Jn = /* @__PURE__ */ new WeakMap();
var Ao, Af = class {
  constructor(e, t, n, o) {
    Ao.set(this, void 0), G(this, Ao, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new X("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await T(this, Ao, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(Ao = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, Zg = class extends bf {
  constructor(e, t, n) {
    super(e, t, async (o, s) => new n(o, s.response, await Tf(o, s), s.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, uo = class extends Af {
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
          ...zi(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...zi(this.options.query),
        after_id: e
      }
    } : null;
  }
}, ot = class extends Af {
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
        ...zi(this.options.query),
        page: e
      }
    } : null;
  }
}, Cf = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function tn(e, t, n) {
  return Cf(), new File(e, t ?? "unknown_file", n);
}
function es(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var If = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Wr = async (e, t, n = !0) => ({
  ...e,
  body: await ey(e.body, t, n)
}), pl = /* @__PURE__ */ new WeakMap();
function jg(e) {
  const t = typeof e == "function" ? e : e.fetch, n = pl.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const s = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new s(i).text();
    } catch {
      return !0;
    }
  })();
  return pl.set(t, o), o;
}
var ey = async (e, t, n = !0) => {
  if (!await jg(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const o = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([s, i]) => Yi(o, s, i, n))), o;
}, ty = (e) => e instanceof Blob && "name" in e, Yi = async (e, t, n, o) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let s = {};
      const i = n.headers.get("Content-Type");
      i && (s = { type: i }), e.append(t, tn([await n.blob()], es(n, o), s));
    } else if (If(n)) e.append(t, tn([await new Response(Sf(n)).blob()], es(n, o)));
    else if (ty(n)) e.append(t, tn([n], es(n, o), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((s) => Yi(e, t + "[]", s, o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([s, i]) => Yi(e, `${t}[${s}]`, i, o)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, xf = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", ny = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && xf(e), oy = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function sy(e, t, n) {
  if (Cf(), e = await e, t || (t = es(e, !0)), ny(e))
    return e instanceof File && t == null && n == null ? e : tn([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if (oy(e)) {
    const s = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), tn(await Xi(s), t, n);
  }
  const o = await Xi(e);
  if (!n?.type) {
    const s = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof s == "string" && (n = {
      ...n,
      type: s
    });
  }
  return tn(o, t, n);
}
async function Xi(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (xf(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (If(e)) for await (const n of e) t.push(...await Xi(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${iy(e)}`);
  }
  return t;
}
function iy(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var ye = class {
  constructor(e) {
    this._client = e;
  }
}, Rf = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* ry(e) {
  if (!e) return;
  if (Rf in e) {
    const { values: o, nulls: s } = e;
    yield* o.entries();
    for (const i of s) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : ol(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const s = o[0];
    if (typeof s != "string") throw new TypeError("expected header name to be a string");
    const i = ol(o[1]) ? o[1] : [o[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [s, null]), yield [s, u]);
  }
}
var B = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const s = /* @__PURE__ */ new Set();
    for (const [i, a] of ry(o)) {
      const u = i.toLowerCase();
      s.has(u) || (t.delete(i), s.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [Rf]: !0,
    values: t,
    nulls: n
  };
};
function Pf(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var hl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), ay = (e = Pf) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let s = !1;
  const i = [], a = n.reduce((p, f, h) => {
    /[?#]/.test(f) && (s = !0);
    const m = o[h];
    let g = (s ? encodeURIComponent : e)("" + m);
    return h !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? hl) ?? hl)?.toString) && (g = m + "", i.push({
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
    throw new X(`Path parameters result in path with invalid segments:
${i.map((h) => h.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}, Y = /* @__PURE__ */ ay(Pf), Mf = class extends ye {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/environments?beta=true", {
      body: o,
      ...t,
      headers: B([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(Y`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(Y`/v1/environments/${e}?beta=true`, {
      body: s,
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/environments?beta=true", ot, {
      query: o,
      ...t,
      headers: B([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(Y`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(Y`/v1/environments/${e}/archive?beta=true`, {
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Qn = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function ts(e) {
  return typeof e == "object" && e !== null && Qn in e;
}
function Nf(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const o of e) ts(o) && n.add(o[Qn]);
  if (t) {
    for (const o of t)
      if (ts(o) && n.add(o[Qn]), Array.isArray(o.content))
        for (const s of o.content) ts(s) && n.add(s[Qn]);
  }
  return Array.from(n);
}
function kf(e, t) {
  const n = Nf(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function ly(e) {
  return ts(e) ? { "x-stainless-helper": e[Qn] } : {};
}
var Lf = class extends ye {
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/files", uo, {
      query: o,
      ...t,
      headers: B([{ "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(Y`/v1/files/${e}`, {
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  download(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(Y`/v1/files/${e}/content`, {
      ...n,
      headers: B([{
        "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      __binaryResponse: !0
    });
  }
  retrieveMetadata(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(Y`/v1/files/${e}`, {
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  upload(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/files", Wr({
      body: o,
      ...t,
      headers: B([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        ly(o.file),
        t?.headers
      ])
    }, this._client));
  }
}, Df = class extends ye {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(Y`/v1/models/${e}?beta=true`, {
      ...n,
      headers: B([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", uo, {
      query: o,
      ...t,
      headers: B([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, $f = class extends ye {
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(Y`/v1/agents/${e}/versions?beta=true`, ot, {
      query: s,
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Kr = class extends ye {
  constructor() {
    super(...arguments), this.versions = new $f(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/agents?beta=true", {
      body: o,
      ...t,
      headers: B([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.get(Y`/v1/agents/${e}?beta=true`, {
      query: s,
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(Y`/v1/agents/${e}?beta=true`, {
      body: s,
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/agents?beta=true", ot, {
      query: o,
      ...t,
      headers: B([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(Y`/v1/agents/${e}/archive?beta=true`, {
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Kr.Versions = $f;
var Uf = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};
function Ff(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function ml(e, t, n) {
  const o = Ff(t);
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
  } : Bf(e, t, n);
}
function Bf(e, t, n) {
  let o = null;
  const s = e.content.map((i) => {
    if (i.type === "text") {
      const a = uy(t, i.text);
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
function uy(e, t) {
  const n = Ff(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new X(`Failed to parse structured output: ${o}`);
  }
}
var cy = (e) => {
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
}, Xt = (e) => {
  if (e.length === 0) return e;
  let t = e[e.length - 1];
  switch (t.type) {
    case "separator":
      return e = e.slice(0, e.length - 1), Xt(e);
    case "number":
      let n = t.value[t.value.length - 1];
      if (n === "." || n === "-")
        return e = e.slice(0, e.length - 1), Xt(e);
    case "string":
      let o = e[e.length - 2];
      if (o?.type === "delimiter")
        return e = e.slice(0, e.length - 1), Xt(e);
      if (o?.type === "brace" && o.value === "{")
        return e = e.slice(0, e.length - 1), Xt(e);
      break;
    case "delimiter":
      return e = e.slice(0, e.length - 1), Xt(e);
  }
  return e;
}, dy = (e) => {
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
}, fy = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, Gf = (e) => JSON.parse(fy(dy(Xt(cy(e))))), qe, yt, Vt, gn, Co, yn, _n, Io, vn, rt, Sn, xo, Ro, At, Po, Mo, Tn, ui, gl, No, ci, di, fi, yl, _l = "__json_buf";
function vl(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var py = class Qi {
  constructor(t, n) {
    qe.add(this), this.messages = [], this.receivedMessages = [], yt.set(this, void 0), Vt.set(this, null), this.controller = new AbortController(), gn.set(this, void 0), Co.set(this, () => {
    }), yn.set(this, () => {
    }), _n.set(this, void 0), Io.set(this, () => {
    }), vn.set(this, () => {
    }), rt.set(this, {}), Sn.set(this, !1), xo.set(this, !1), Ro.set(this, !1), At.set(this, !1), Po.set(this, void 0), Mo.set(this, void 0), Tn.set(this, void 0), No.set(this, (o) => {
      if (G(this, xo, !0, "f"), to(o) && (o = new Xe()), o instanceof Xe)
        return G(this, Ro, !0, "f"), this._emit("abort", o);
      if (o instanceof X) return this._emit("error", o);
      if (o instanceof Error) {
        const s = new X(o.message);
        return s.cause = o, this._emit("error", s);
      }
      return this._emit("error", new X(String(o)));
    }), G(this, gn, new Promise((o, s) => {
      G(this, Co, o, "f"), G(this, yn, s, "f");
    }), "f"), G(this, _n, new Promise((o, s) => {
      G(this, Io, o, "f"), G(this, vn, s, "f");
    }), "f"), T(this, gn, "f").catch(() => {
    }), T(this, _n, "f").catch(() => {
    }), G(this, Vt, t, "f"), G(this, Tn, n?.logger ?? console, "f");
  }
  get response() {
    return T(this, Po, "f");
  }
  get request_id() {
    return T(this, Mo, "f");
  }
  async withResponse() {
    G(this, At, !0, "f");
    const t = await T(this, gn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Qi(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, o, { logger: s } = {}) {
    const i = new Qi(n, { logger: s });
    for (const a of n.messages) i._addMessageParam(a);
    return G(i, Vt, {
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
    }, T(this, No, "f"));
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
      T(this, qe, "m", ci).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) T(this, qe, "m", di).call(this, c);
      if (u.controller.signal?.aborted) throw new Xe();
      T(this, qe, "m", fi).call(this);
    } finally {
      s && i && s.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (G(this, Po, t, "f"), G(this, Mo, t?.headers.get("request-id"), "f"), T(this, Co, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return T(this, Sn, "f");
  }
  get errored() {
    return T(this, xo, "f");
  }
  get aborted() {
    return T(this, Ro, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (T(this, rt, "f")[t] || (T(this, rt, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const o = T(this, rt, "f")[t];
    if (!o) return this;
    const s = o.findIndex((i) => i.listener === n);
    return s >= 0 && o.splice(s, 1), this;
  }
  once(t, n) {
    return (T(this, rt, "f")[t] || (T(this, rt, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      G(this, At, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    G(this, At, !0, "f"), await T(this, _n, "f");
  }
  get currentMessage() {
    return T(this, yt, "f");
  }
  async finalMessage() {
    return await this.done(), T(this, qe, "m", ui).call(this);
  }
  async finalText() {
    return await this.done(), T(this, qe, "m", gl).call(this);
  }
  _emit(t, ...n) {
    if (T(this, Sn, "f")) return;
    t === "end" && (G(this, Sn, !0, "f"), T(this, Io, "f").call(this));
    const o = T(this, rt, "f")[t];
    if (o && (T(this, rt, "f")[t] = o.filter((s) => !s.once), o.forEach(({ listener: s }) => s(...n))), t === "abort") {
      const s = n[0];
      !T(this, At, "f") && !o?.length && Promise.reject(s), T(this, yn, "f").call(this, s), T(this, vn, "f").call(this, s), this._emit("end");
      return;
    }
    if (t === "error") {
      const s = n[0];
      !T(this, At, "f") && !o?.length && Promise.reject(s), T(this, yn, "f").call(this, s), T(this, vn, "f").call(this, s), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", T(this, qe, "m", ui).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let s;
    o && (o.aborted && this.controller.abort(), s = this.controller.abort.bind(this.controller), o.addEventListener("abort", s));
    try {
      T(this, qe, "m", ci).call(this), this._connected(null);
      const i = no.fromReadableStream(t, this.controller);
      for await (const a of i) T(this, qe, "m", di).call(this, a);
      if (i.controller.signal?.aborted) throw new Xe();
      T(this, qe, "m", fi).call(this);
    } finally {
      o && s && o.removeEventListener("abort", s);
    }
  }
  [(yt = /* @__PURE__ */ new WeakMap(), Vt = /* @__PURE__ */ new WeakMap(), gn = /* @__PURE__ */ new WeakMap(), Co = /* @__PURE__ */ new WeakMap(), yn = /* @__PURE__ */ new WeakMap(), _n = /* @__PURE__ */ new WeakMap(), Io = /* @__PURE__ */ new WeakMap(), vn = /* @__PURE__ */ new WeakMap(), rt = /* @__PURE__ */ new WeakMap(), Sn = /* @__PURE__ */ new WeakMap(), xo = /* @__PURE__ */ new WeakMap(), Ro = /* @__PURE__ */ new WeakMap(), At = /* @__PURE__ */ new WeakMap(), Po = /* @__PURE__ */ new WeakMap(), Mo = /* @__PURE__ */ new WeakMap(), Tn = /* @__PURE__ */ new WeakMap(), No = /* @__PURE__ */ new WeakMap(), qe = /* @__PURE__ */ new WeakSet(), ui = function() {
    if (this.receivedMessages.length === 0) throw new X("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, gl = function() {
    if (this.receivedMessages.length === 0) throw new X("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new X("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, ci = function() {
    this.ended || G(this, yt, void 0, "f");
  }, di = function(n) {
    if (this.ended) return;
    const o = T(this, qe, "m", yl).call(this, n);
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
            vl(s) && s.input && this._emit("inputJson", n.delta.partial_json, s.input);
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
        this._addMessageParam(o), this._addMessage(ml(o, T(this, Vt, "f"), { logger: T(this, Tn, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        G(this, yt, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, fi = function() {
    if (this.ended) throw new X("stream has ended, this shouldn't happen");
    const n = T(this, yt, "f");
    if (!n) throw new X("request ended without sending any chunks");
    return G(this, yt, void 0, "f"), ml(n, T(this, Vt, "f"), { logger: T(this, Tn, "f") });
  }, yl = function(n) {
    let o = T(this, yt, "f");
    if (n.type === "message_start") {
      if (o) throw new X(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!o) throw new X(`Unexpected event order, got ${n.type} before "message_start"`);
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
            if (s && vl(s)) {
              let i = s[_l] || "";
              i += n.delta.partial_json;
              const a = { ...s };
              if (Object.defineProperty(a, _l, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i) try {
                a.input = Gf(i);
              } catch (u) {
                const c = new X(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${i}`);
                T(this, No, "f").call(this, c);
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
    return new no(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
var qf = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var hy = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
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
Wrap your summary in <summary></summary> tags.`, En, Ht, Ct, me, Pe, ke, ut, _t, bn, Sl, Zi;
function Tl() {
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
    En.add(this), this.client = e, Ht.set(this, !1), Ct.set(this, !1), me.set(this, void 0), Pe.set(this, void 0), ke.set(this, void 0), ut.set(this, void 0), _t.set(this, void 0), bn.set(this, 0), G(this, me, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const o = ["BetaToolRunner", ...Nf(t.tools, t.messages)].join(", ");
    G(this, Pe, {
      ...n,
      headers: B([{ "x-stainless-helper": o }, n?.headers])
    }, "f"), G(this, _t, Tl(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(Ht = /* @__PURE__ */ new WeakMap(), Ct = /* @__PURE__ */ new WeakMap(), me = /* @__PURE__ */ new WeakMap(), Pe = /* @__PURE__ */ new WeakMap(), ke = /* @__PURE__ */ new WeakMap(), ut = /* @__PURE__ */ new WeakMap(), _t = /* @__PURE__ */ new WeakMap(), bn = /* @__PURE__ */ new WeakMap(), En = /* @__PURE__ */ new WeakSet(), Sl = async function() {
    const t = T(this, me, "f").params.compactionControl;
    if (!t || !t.enabled) return !1;
    let n = 0;
    if (T(this, ke, "f") !== void 0) try {
      const c = await T(this, ke, "f");
      n = c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0) + c.usage.output_tokens;
    } catch {
      return !1;
    }
    const o = t.contextTokenThreshold ?? 1e5;
    if (n < o) return !1;
    const s = t.model ?? T(this, me, "f").params.model, i = t.summaryPrompt ?? hy, a = T(this, me, "f").params.messages;
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
      max_tokens: T(this, me, "f").params.max_tokens
    }, {
      signal: T(this, Pe, "f").signal,
      headers: B([T(this, Pe, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (u.content[0]?.type !== "text") throw new X("Expected text response for compaction");
    return T(this, me, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (T(this, Ht, "f")) throw new X("Cannot iterate over a consumed stream");
    G(this, Ht, !0, "f"), G(this, Ct, !0, "f"), G(this, ut, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (T(this, me, "f").params.max_iterations && T(this, bn, "f") >= T(this, me, "f").params.max_iterations) break;
          G(this, Ct, !1, "f"), G(this, ut, void 0, "f"), G(this, bn, (e = T(this, bn, "f"), e++, e), "f"), G(this, ke, void 0, "f");
          const { max_iterations: n, compactionControl: o, ...s } = T(this, me, "f").params;
          if (s.stream ? (t = this.client.beta.messages.stream({ ...s }, T(this, Pe, "f")), G(this, ke, t.finalMessage(), "f"), T(this, ke, "f").catch(() => {
          }), yield t) : (G(this, ke, this.client.beta.messages.create({
            ...s,
            stream: !1
          }, T(this, Pe, "f")), "f"), yield T(this, ke, "f")), !await T(this, En, "m", Sl).call(this)) {
            if (!T(this, Ct, "f")) {
              const { role: a, content: u } = await T(this, ke, "f");
              T(this, me, "f").params.messages.push({
                role: a,
                content: u
              });
            }
            const i = await T(this, En, "m", Zi).call(this, T(this, me, "f").params.messages.at(-1));
            if (i) T(this, me, "f").params.messages.push(i);
            else if (!T(this, Ct, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!T(this, ke, "f")) throw new X("ToolRunner concluded without a message from the server");
      T(this, _t, "f").resolve(await T(this, ke, "f"));
    } catch (t) {
      throw G(this, Ht, !1, "f"), T(this, _t, "f").promise.catch(() => {
      }), T(this, _t, "f").reject(t), G(this, _t, Tl(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? T(this, me, "f").params = e(T(this, me, "f").params) : T(this, me, "f").params = e, G(this, Ct, !0, "f"), G(this, ut, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? G(this, Pe, e(T(this, Pe, "f")), "f") : G(this, Pe, {
      ...T(this, Pe, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = T(this, Pe, "f").signal) {
    const t = await T(this, ke, "f") ?? this.params.messages.at(-1);
    return t ? T(this, En, "m", Zi).call(this, t, e) : null;
  }
  done() {
    return T(this, _t, "f").promise;
  }
  async runUntilDone() {
    if (!T(this, Ht, "f")) for await (const e of this) ;
    return this.done();
  }
  get params() {
    return T(this, me, "f").params;
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
Zi = async function(t, n = T(this, Pe, "f").signal) {
  return T(this, ut, "f") !== void 0 ? T(this, ut, "f") : (G(this, ut, my(T(this, me, "f").params, t, {
    ...T(this, Pe, "f"),
    signal: n
  }), "f"), T(this, ut, "f"));
};
async function my(e, t = e.messages.at(-1), n) {
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
          content: a instanceof qf ? a.content : `Error: ${a instanceof Error ? a.message : String(a)}`,
          is_error: !0
        };
      }
    }))
  };
}
var Vf = class Hf {
  constructor(t, n) {
    this.iterator = t, this.controller = n;
  }
  async *decoder() {
    const t = new lo();
    for await (const n of this.iterator) for (const o of t.decode(n)) yield JSON.parse(o);
    for (const n of t.flush()) yield JSON.parse(n);
  }
  [Symbol.asyncIterator]() {
    return this.decoder();
  }
  static fromResponse(t, n) {
    if (!t.body)
      throw n.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new X("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new X("Attempted to iterate over a response with no body");
    return new Hf(Hr(t.body), n);
  }
}, Jf = class extends ye {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/messages/batches?beta=true", {
      body: o,
      ...t,
      headers: B([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(Y`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/messages/batches?beta=true", uo, {
      query: o,
      ...t,
      headers: B([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(Y`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  cancel(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(Y`/v1/messages/batches/${e}/cancel?beta=true`, {
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  async results(e, t = {}, n) {
    const o = await this.retrieve(e);
    if (!o.results_url) throw new X(`No batch \`results_url\`; Has it finished processing? ${o.processing_status} - ${o.id}`);
    const { betas: s } = t ?? {};
    return this._client.get(o.results_url, {
      ...n,
      headers: B([{
        "anthropic-beta": [...s ?? [], "message-batches-2024-09-24"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((i, a) => Vf.fromResponse(a.response, a.controller));
  }
}, El = {
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
}, gy = ["claude-opus-4-6"], co = class extends ye {
  constructor() {
    super(...arguments), this.batches = new Jf(this._client);
  }
  create(e, t) {
    const n = bl(e), { betas: o, ...s } = n;
    s.model in El && console.warn(`The model '${s.model}' is deprecated and will reach end-of-life on ${El[s.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), s.model in gy && s.thinking && s.thinking.type === "enabled" && console.warn(`Using Claude with ${s.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let i = this._client._options.timeout;
    if (!s.stream && i == null) {
      const u = Uf[s.model] ?? void 0;
      i = this._client.calculateNonstreamingTimeout(s.max_tokens, u);
    }
    const a = kf(s.tools, s.messages);
    return this._client.post("/v1/messages?beta=true", {
      body: s,
      timeout: i ?? 6e5,
      ...t,
      headers: B([
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
      headers: B([{ "anthropic-beta": [...e.betas ?? [], "structured-outputs-2025-12-15"].toString() }, t?.headers])
    }, this.create(e, t).then((n) => Bf(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return py.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...o } = bl(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: o,
      ...t,
      headers: B([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new Of(this._client, e, t);
  }
};
function bl(e) {
  if (!e.output_format) return e;
  if (e.output_config?.format) throw new X("Both output_format and output_config.format were provided. Please use only output_config.format (output_format is deprecated).");
  const { output_format: t, ...n } = e;
  return {
    ...n,
    output_config: {
      ...e.output_config,
      format: t
    }
  };
}
co.Batches = Jf;
co.BetaToolRunner = Of;
co.ToolError = qf;
var Wf = class extends ye {
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(Y`/v1/sessions/${e}/events?beta=true`, ot, {
      query: s,
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  send(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(Y`/v1/sessions/${e}/events?beta=true`, {
      body: s,
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  stream(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(Y`/v1/sessions/${e}/events/stream?beta=true`, {
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers]),
      stream: !0
    });
  }
}, Kf = class extends ye {
  retrieve(e, t, n) {
    const { session_id: o, betas: s } = t;
    return this._client.get(Y`/v1/sessions/${o}/resources/${e}?beta=true`, {
      ...n,
      headers: B([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { session_id: o, betas: s, ...i } = t;
    return this._client.post(Y`/v1/sessions/${o}/resources/${e}?beta=true`, {
      body: i,
      ...n,
      headers: B([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(Y`/v1/sessions/${e}/resources?beta=true`, ot, {
      query: s,
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { session_id: o, betas: s } = t;
    return this._client.delete(Y`/v1/sessions/${o}/resources/${e}?beta=true`, {
      ...n,
      headers: B([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  add(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(Y`/v1/sessions/${e}/resources?beta=true`, {
      body: s,
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, $s = class extends ye {
  constructor() {
    super(...arguments), this.events = new Wf(this._client), this.resources = new Kf(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/sessions?beta=true", {
      body: o,
      ...t,
      headers: B([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(Y`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(Y`/v1/sessions/${e}?beta=true`, {
      body: s,
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/sessions?beta=true", ot, {
      query: o,
      ...t,
      headers: B([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(Y`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(Y`/v1/sessions/${e}/archive?beta=true`, {
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
$s.Events = Wf;
$s.Resources = Kf;
var zf = class extends ye {
  create(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.post(Y`/v1/skills/${e}/versions?beta=true`, Wr({
      body: s,
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: o, betas: s } = t;
    return this._client.get(Y`/v1/skills/${o}/versions/${e}?beta=true`, {
      ...n,
      headers: B([{ "anthropic-beta": [...s ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(Y`/v1/skills/${e}/versions?beta=true`, ot, {
      query: s,
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { skill_id: o, betas: s } = t;
    return this._client.delete(Y`/v1/skills/${o}/versions/${e}?beta=true`, {
      ...n,
      headers: B([{ "anthropic-beta": [...s ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
}, zr = class extends ye {
  constructor() {
    super(...arguments), this.versions = new zf(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.post("/v1/skills?beta=true", Wr({
      body: o,
      ...t,
      headers: B([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    }, this._client, !1));
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(Y`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/skills?beta=true", ot, {
      query: o,
      ...t,
      headers: B([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(Y`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
};
zr.Versions = zf;
var Yf = class extends ye {
  create(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(Y`/v1/vaults/${e}/credentials?beta=true`, {
      body: s,
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vault_id: o, betas: s } = t;
    return this._client.get(Y`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      ...n,
      headers: B([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vault_id: o, betas: s, ...i } = t;
    return this._client.post(Y`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      body: i,
      ...n,
      headers: B([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(Y`/v1/vaults/${e}/credentials?beta=true`, ot, {
      query: s,
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vault_id: o, betas: s } = t;
    return this._client.delete(Y`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      ...n,
      headers: B([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t, n) {
    const { vault_id: o, betas: s } = t;
    return this._client.post(Y`/v1/vaults/${o}/credentials/${e}/archive?beta=true`, {
      ...n,
      headers: B([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Yr = class extends ye {
  constructor() {
    super(...arguments), this.credentials = new Yf(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/vaults?beta=true", {
      body: o,
      ...t,
      headers: B([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(Y`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(Y`/v1/vaults/${e}?beta=true`, {
      body: s,
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/vaults?beta=true", ot, {
      query: o,
      ...t,
      headers: B([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(Y`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(Y`/v1/vaults/${e}/archive?beta=true`, {
      ...n,
      headers: B([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Yr.Credentials = Yf;
var st = class extends ye {
  constructor() {
    super(...arguments), this.models = new Df(this._client), this.messages = new co(this._client), this.agents = new Kr(this._client), this.environments = new Mf(this._client), this.sessions = new $s(this._client), this.vaults = new Yr(this._client), this.files = new Lf(this._client), this.skills = new zr(this._client);
  }
};
st.Models = Df;
st.Messages = co;
st.Agents = Kr;
st.Environments = Mf;
st.Sessions = $s;
st.Vaults = Yr;
st.Files = Lf;
st.Skills = zr;
var Xf = class extends ye {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/complete", {
      body: o,
      timeout: this._client._options.timeout ?? 6e5,
      ...t,
      headers: B([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers]),
      stream: e.stream ?? !1
    });
  }
};
function Qf(e) {
  return e?.output_config?.format;
}
function wl(e, t, n) {
  const o = Qf(t);
  return !t || !("parse" in (o ?? {})) ? {
    ...e,
    content: e.content.map((s) => s.type === "text" ? Object.defineProperty({ ...s }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : s),
    parsed_output: null
  } : Zf(e, t, n);
}
function Zf(e, t, n) {
  let o = null;
  const s = e.content.map((i) => {
    if (i.type === "text") {
      const a = yy(t, i.text);
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
function yy(e, t) {
  const n = Qf(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new X(`Failed to parse structured output: ${o}`);
  }
}
var Oe, vt, Jt, wn, ko, An, Cn, Lo, In, at, xn, Do, $o, It, Uo, Fo, Rn, pi, Al, hi, mi, gi, yi, Cl, Il = "__json_buf";
function xl(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var _y = class ji {
  constructor(t, n) {
    Oe.add(this), this.messages = [], this.receivedMessages = [], vt.set(this, void 0), Jt.set(this, null), this.controller = new AbortController(), wn.set(this, void 0), ko.set(this, () => {
    }), An.set(this, () => {
    }), Cn.set(this, void 0), Lo.set(this, () => {
    }), In.set(this, () => {
    }), at.set(this, {}), xn.set(this, !1), Do.set(this, !1), $o.set(this, !1), It.set(this, !1), Uo.set(this, void 0), Fo.set(this, void 0), Rn.set(this, void 0), hi.set(this, (o) => {
      if (G(this, Do, !0, "f"), to(o) && (o = new Xe()), o instanceof Xe)
        return G(this, $o, !0, "f"), this._emit("abort", o);
      if (o instanceof X) return this._emit("error", o);
      if (o instanceof Error) {
        const s = new X(o.message);
        return s.cause = o, this._emit("error", s);
      }
      return this._emit("error", new X(String(o)));
    }), G(this, wn, new Promise((o, s) => {
      G(this, ko, o, "f"), G(this, An, s, "f");
    }), "f"), G(this, Cn, new Promise((o, s) => {
      G(this, Lo, o, "f"), G(this, In, s, "f");
    }), "f"), T(this, wn, "f").catch(() => {
    }), T(this, Cn, "f").catch(() => {
    }), G(this, Jt, t, "f"), G(this, Rn, n?.logger ?? console, "f");
  }
  get response() {
    return T(this, Uo, "f");
  }
  get request_id() {
    return T(this, Fo, "f");
  }
  async withResponse() {
    G(this, It, !0, "f");
    const t = await T(this, wn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new ji(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, o, { logger: s } = {}) {
    const i = new ji(n, { logger: s });
    for (const a of n.messages) i._addMessageParam(a);
    return G(i, Jt, {
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
    }, T(this, hi, "f"));
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
      T(this, Oe, "m", mi).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) T(this, Oe, "m", gi).call(this, c);
      if (u.controller.signal?.aborted) throw new Xe();
      T(this, Oe, "m", yi).call(this);
    } finally {
      s && i && s.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (G(this, Uo, t, "f"), G(this, Fo, t?.headers.get("request-id"), "f"), T(this, ko, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return T(this, xn, "f");
  }
  get errored() {
    return T(this, Do, "f");
  }
  get aborted() {
    return T(this, $o, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (T(this, at, "f")[t] || (T(this, at, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const o = T(this, at, "f")[t];
    if (!o) return this;
    const s = o.findIndex((i) => i.listener === n);
    return s >= 0 && o.splice(s, 1), this;
  }
  once(t, n) {
    return (T(this, at, "f")[t] || (T(this, at, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      G(this, It, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    G(this, It, !0, "f"), await T(this, Cn, "f");
  }
  get currentMessage() {
    return T(this, vt, "f");
  }
  async finalMessage() {
    return await this.done(), T(this, Oe, "m", pi).call(this);
  }
  async finalText() {
    return await this.done(), T(this, Oe, "m", Al).call(this);
  }
  _emit(t, ...n) {
    if (T(this, xn, "f")) return;
    t === "end" && (G(this, xn, !0, "f"), T(this, Lo, "f").call(this));
    const o = T(this, at, "f")[t];
    if (o && (T(this, at, "f")[t] = o.filter((s) => !s.once), o.forEach(({ listener: s }) => s(...n))), t === "abort") {
      const s = n[0];
      !T(this, It, "f") && !o?.length && Promise.reject(s), T(this, An, "f").call(this, s), T(this, In, "f").call(this, s), this._emit("end");
      return;
    }
    if (t === "error") {
      const s = n[0];
      !T(this, It, "f") && !o?.length && Promise.reject(s), T(this, An, "f").call(this, s), T(this, In, "f").call(this, s), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", T(this, Oe, "m", pi).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let s;
    o && (o.aborted && this.controller.abort(), s = this.controller.abort.bind(this.controller), o.addEventListener("abort", s));
    try {
      T(this, Oe, "m", mi).call(this), this._connected(null);
      const i = no.fromReadableStream(t, this.controller);
      for await (const a of i) T(this, Oe, "m", gi).call(this, a);
      if (i.controller.signal?.aborted) throw new Xe();
      T(this, Oe, "m", yi).call(this);
    } finally {
      o && s && o.removeEventListener("abort", s);
    }
  }
  [(vt = /* @__PURE__ */ new WeakMap(), Jt = /* @__PURE__ */ new WeakMap(), wn = /* @__PURE__ */ new WeakMap(), ko = /* @__PURE__ */ new WeakMap(), An = /* @__PURE__ */ new WeakMap(), Cn = /* @__PURE__ */ new WeakMap(), Lo = /* @__PURE__ */ new WeakMap(), In = /* @__PURE__ */ new WeakMap(), at = /* @__PURE__ */ new WeakMap(), xn = /* @__PURE__ */ new WeakMap(), Do = /* @__PURE__ */ new WeakMap(), $o = /* @__PURE__ */ new WeakMap(), It = /* @__PURE__ */ new WeakMap(), Uo = /* @__PURE__ */ new WeakMap(), Fo = /* @__PURE__ */ new WeakMap(), Rn = /* @__PURE__ */ new WeakMap(), hi = /* @__PURE__ */ new WeakMap(), Oe = /* @__PURE__ */ new WeakSet(), pi = function() {
    if (this.receivedMessages.length === 0) throw new X("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, Al = function() {
    if (this.receivedMessages.length === 0) throw new X("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new X("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, mi = function() {
    this.ended || G(this, vt, void 0, "f");
  }, gi = function(n) {
    if (this.ended) return;
    const o = T(this, Oe, "m", Cl).call(this, n);
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
            xl(s) && s.input && this._emit("inputJson", n.delta.partial_json, s.input);
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
        this._addMessageParam(o), this._addMessage(wl(o, T(this, Jt, "f"), { logger: T(this, Rn, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        G(this, vt, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, yi = function() {
    if (this.ended) throw new X("stream has ended, this shouldn't happen");
    const n = T(this, vt, "f");
    if (!n) throw new X("request ended without sending any chunks");
    return G(this, vt, void 0, "f"), wl(n, T(this, Jt, "f"), { logger: T(this, Rn, "f") });
  }, Cl = function(n) {
    let o = T(this, vt, "f");
    if (n.type === "message_start") {
      if (o) throw new X(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!o) throw new X(`Unexpected event order, got ${n.type} before "message_start"`);
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
            if (s && xl(s)) {
              let i = s[Il] || "";
              i += n.delta.partial_json;
              const a = { ...s };
              Object.defineProperty(a, Il, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i && (a.input = Gf(i)), o.content[n.index] = a;
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
    return new no(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
var jf = class extends ye {
  create(e, t) {
    return this._client.post("/v1/messages/batches", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(Y`/v1/messages/batches/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/v1/messages/batches", uo, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(Y`/v1/messages/batches/${e}`, t);
  }
  cancel(e, t) {
    return this._client.post(Y`/v1/messages/batches/${e}/cancel`, t);
  }
  async results(e, t) {
    const n = await this.retrieve(e);
    if (!n.results_url) throw new X(`No batch \`results_url\`; Has it finished processing? ${n.processing_status} - ${n.id}`);
    return this._client.get(n.results_url, {
      ...t,
      headers: B([{ Accept: "application/binary" }, t?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((o, s) => Vf.fromResponse(s.response, s.controller));
  }
}, Xr = class extends ye {
  constructor() {
    super(...arguments), this.batches = new jf(this._client);
  }
  create(e, t) {
    e.model in Rl && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${Rl[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), e.model in vy && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const s = Uf[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, s);
    }
    const o = kf(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: B([o, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => Zf(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return _y.createMessage(this, e, t, { logger: this._client.logger ?? console });
  }
  countTokens(e, t) {
    return this._client.post("/v1/messages/count_tokens", {
      body: e,
      ...t
    });
  }
}, Rl = {
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
}, vy = ["claude-opus-4-6"];
Xr.Batches = jf;
var ep = class extends ye {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(Y`/v1/models/${e}`, {
      ...n,
      headers: B([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models", uo, {
      query: o,
      ...t,
      headers: B([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Bo = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, er, Qr, ns, tp, Sy = "\\n\\nHuman:", Ty = "\\n\\nAssistant:", pe = class {
  constructor({ baseURL: e = Bo("ANTHROPIC_BASE_URL"), apiKey: t = Bo("ANTHROPIC_API_KEY") ?? null, authToken: n = Bo("ANTHROPIC_AUTH_TOKEN") ?? null, ...o } = {}) {
    er.add(this), ns.set(this, void 0);
    const s = {
      apiKey: t,
      authToken: n,
      ...o,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!s.dangerouslyAllowBrowser && Dg()) throw new X(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = s.baseURL, this.timeout = s.timeout ?? Qr.DEFAULT_TIMEOUT, this.logger = s.logger ?? console;
    const i = "warn";
    this.logLevel = i, this.logLevel = dl(s.logLevel, "ClientOptions.logLevel", this) ?? dl(Bo("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? i, this.fetchOptions = s.fetchOptions, this.maxRetries = s.maxRetries ?? 2, this.fetch = s.fetch ?? Gg(), G(this, ns, Og, "f"), this._options = s, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
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
    return B([await this.apiKeyAuth(e), await this.bearerAuth(e)]);
  }
  async apiKeyAuth(e) {
    if (this.apiKey != null)
      return B([{ "X-Api-Key": this.apiKey }]);
  }
  async bearerAuth(e) {
    if (this.authToken != null)
      return B([{ Authorization: `Bearer ${this.authToken}` }]);
  }
  stringifyQuery(e) {
    return Vg(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Yt}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${lf()}`;
  }
  makeStatusError(e, t, n, o) {
    return Be.generate(e, t, n, o);
  }
  buildURL(e, t, n) {
    const o = !T(this, er, "m", tp).call(this) && n || this.baseURL, s = Mg(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), a = Object.fromEntries(s.searchParams);
    return (!sl(i) || !sl(a)) && (t = {
      ...a,
      ...i,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (s.search = this.stringifyQuery(t)), s.toString();
  }
  _calculateNonstreamingTimeout(e) {
    if (3600 * e / 128e3 > 600) throw new X("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#streaming-responses for more details");
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
    return new bf(this, this.makeRequest(e, t, void 0));
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
    if (Ie(this).debug(`[${c}] sending request`, Pt({
      retryOfRequestLogID: n,
      method: o.method,
      url: a,
      options: o,
      headers: i.headers
    })), o.signal?.aborted) throw new Xe();
    const f = new AbortController(), h = await this.fetchWithTimeout(a, i, u, f).catch(Ji), m = Date.now();
    if (h instanceof globalThis.Error) {
      const y = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new Xe();
      const _ = to(h) || /timed? ?out/i.test(String(h) + ("cause" in h ? String(h.cause) : ""));
      if (t)
        return Ie(this).info(`[${c}] connection ${_ ? "timed out" : "failed"} - ${y}`), Ie(this).debug(`[${c}] connection ${_ ? "timed out" : "failed"} (${y})`, Pt({
          retryOfRequestLogID: n,
          url: a,
          durationMs: m - p,
          message: h.message
        })), this.retryRequest(o, t, n ?? c);
      throw Ie(this).info(`[${c}] connection ${_ ? "timed out" : "failed"} - error; no more retries left`), Ie(this).debug(`[${c}] connection ${_ ? "timed out" : "failed"} (error; no more retries left)`, Pt({
        retryOfRequestLogID: n,
        url: a,
        durationMs: m - p,
        message: h.message
      })), _ ? new uf() : new Ds({ cause: h });
    }
    const g = `[${c}${d}${[...h.headers.entries()].filter(([y]) => y === "request-id").map(([y, _]) => ", " + y + ": " + JSON.stringify(_)).join("")}] ${i.method} ${a} ${h.ok ? "succeeded" : "failed"} with status ${h.status} in ${m - p}ms`;
    if (!h.ok) {
      const y = await this.shouldRetry(h);
      if (t && y) {
        const R = `retrying, ${t} attempts remaining`;
        return await qg(h.body), Ie(this).info(`${g} - ${R}`), Ie(this).debug(`[${c}] response error (${R})`, Pt({
          retryOfRequestLogID: n,
          url: h.url,
          status: h.status,
          headers: h.headers,
          durationMs: m - p
        })), this.retryRequest(o, t, n ?? c, h.headers);
      }
      const _ = y ? "error; no more retries left" : "error; not retryable";
      Ie(this).info(`${g} - ${_}`);
      const S = await h.text().catch((R) => Ji(R).message), b = _f(S), A = b ? void 0 : S;
      throw Ie(this).debug(`[${c}] response error (${_})`, Pt({
        retryOfRequestLogID: n,
        url: h.url,
        status: h.status,
        headers: h.headers,
        message: A,
        durationMs: Date.now() - p
      })), this.makeStatusError(h.status, b, A, h.headers);
    }
    return Ie(this).info(g), Ie(this).debug(`[${c}] response start`, Pt({
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
    return new Zg(this, n, e);
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
    return await Lg(s), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const s = t - e;
    return Math.min(0.5 * Math.pow(2, s), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  calculateNonstreamingTimeout(e, t) {
    if (36e5 * e / 128e3 > 6e5 || t != null && e > t) throw new X("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details");
    return 6e5;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: o, path: s, query: i, defaultBaseURL: a } = n, u = this.buildURL(s, i, a);
    "timeout" in n && kg("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    const i = B([
      s,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(o),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...Bg(),
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
    const n = B([t]);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || globalThis.ReadableStream && e instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: e
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: Sf(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : T(this, ns, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
Qr = pe, ns = /* @__PURE__ */ new WeakMap(), er = /* @__PURE__ */ new WeakSet(), tp = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
pe.Anthropic = Qr;
pe.HUMAN_PROMPT = Sy;
pe.AI_PROMPT = Ty;
pe.DEFAULT_TIMEOUT = 6e5;
pe.AnthropicError = X;
pe.APIError = Be;
pe.APIConnectionError = Ds;
pe.APIConnectionTimeoutError = uf;
pe.APIUserAbortError = Xe;
pe.NotFoundError = pf;
pe.ConflictError = hf;
pe.RateLimitError = gf;
pe.BadRequestError = cf;
pe.AuthenticationError = df;
pe.InternalServerError = yf;
pe.PermissionDeniedError = ff;
pe.UnprocessableEntityError = mf;
pe.toFile = sy;
var fo = class extends pe {
  constructor() {
    super(...arguments), this.completions = new Xf(this), this.messages = new Xr(this), this.models = new ep(this), this.beta = new st(this);
  }
};
fo.Completions = Xf;
fo.Messages = Xr;
fo.Models = ep;
fo.Beta = st;
function Ey(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function by(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? {
    mediaType: t[1],
    data: t[2]
  } : {
    mediaType: "",
    data: ""
  };
}
function np(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function wy(e) {
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
      const o = by(n.image_url.url);
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
function Ay(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function Cy(e) {
  const t = e?.providerPayload?.anthropicContent;
  return Array.isArray(t) && t.length && np(t) || null;
}
function Iy(e) {
  return Array.isArray(e?.content) && e.content.length ? { anthropicContent: np(e.content) || [] } : void 0;
}
function xy(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  e.forEach((o) => {
    (o.tool_calls || []).forEach((s) => {
      s.id && s.function?.name && n.set(s.id, s.function.name);
    });
  });
  for (const o of e)
    if (o.role !== "system") {
      if (o.role === "assistant") {
        const s = Cy(o);
        if (s) {
          t.push({
            role: "assistant",
            content: s
          });
          continue;
        }
      }
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
            input: Ey(s.function.arguments)
          }))]
        });
        continue;
      }
      t.push({
        role: o.role,
        content: wy(o.content)
      });
    }
  return t;
}
function _i(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
var Ry = class {
  constructor(e) {
    this.config = e, this.client = new fo({
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
    })), n = Ay(e), o = {
      model: this.config.model,
      system: n,
      messages: xy(e.messages),
      tools: t,
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    !e.reasoning?.enabled && typeof e.temperature == "number" && (o.temperature = e.temperature), e.reasoning?.enabled && (o.thinking = {
      type: "adaptive",
      display: "summarized"
    });
    let s;
    if (typeof e.onStreamProgress == "function") {
      const a = this.client.messages.stream(o, { signal: e.signal }), u = /* @__PURE__ */ new Map(), c = () => Array.from(u.entries()).sort(([d], [p]) => d.localeCompare(p)).map(([d, p]) => ({
        label: d.startsWith("redacted:") ? "已脱敏思考块" : "思考块",
        text: p
      })).filter((d) => d.text);
      a.on("text", (d, p) => {
        _i(e, {
          text: p || "",
          thoughts: c()
        });
      }), a.on("thinking", (d, p) => {
        u.set("thinking:0", p || ""), _i(e, { thoughts: c() });
      }), a.on("contentBlock", (d) => {
        d?.type === "redacted_thinking" && (u.set("redacted:0", d.data || ""), _i(e, { thoughts: c() }));
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
      provider: "anthropic",
      providerPayload: Iy(s)
    };
  }
}, Py = /* @__PURE__ */ bs(((e, t) => {
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
    this.attempt(o);
  }, n.prototype.start = function(o) {
    this.attempt(o);
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
})), My = /* @__PURE__ */ bs(((e) => {
  var t = Py();
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
})), Ny = /* @__PURE__ */ bs(((e, t) => {
  t.exports = My();
})), ky = /* @__PURE__ */ bs(((e, t) => {
  var n = Ny(), o = [
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
})), Pl = /* @__PURE__ */ Zh(ky(), 1), Ly = void 0, Dy = void 0;
function $y() {
  return {
    geminiUrl: Ly,
    vertexUrl: Dy
  };
}
function Uy(e, t, n, o) {
  var s, i;
  if (!e?.baseUrl) {
    const a = $y();
    return t ? (s = a.vertexUrl) !== null && s !== void 0 ? s : n : (i = a.geminiUrl) !== null && i !== void 0 ? i : o;
  }
  return e.baseUrl;
}
var dt = class {
};
function F(e, t) {
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
function Fy(e, t) {
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
    tr(e, s, i, 0, a);
  }
}
function tr(e, t, n, o, s) {
  if (o >= t.length || typeof e != "object" || e === null) return;
  const i = t[o];
  if (i.endsWith("[]")) {
    const a = i.slice(0, -2), u = e;
    if (a in u && Array.isArray(u[a])) for (const c of u[a]) tr(c, t, n, o + 1, s);
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
    i in a && tr(a[i], t, n, o + 1, s);
  }
}
function Zr(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function By(e) {
  const t = {}, n = r(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const o = r(e, ["resourceName"]);
  return o != null && l(t, ["_url", "resourceName"], o), t;
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
  const a = r(e, ["response", "generateVideoResponse"]);
  return a != null && l(t, ["response"], Oy(a)), t;
}
function qy(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = r(e, ["response"]);
  return a != null && l(t, ["response"], Vy(a)), t;
}
function Oy(e) {
  const t = {}, n = r(e, ["generatedSamples"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((a) => Hy(a))), l(t, ["generatedVideos"], i);
  }
  const o = r(e, ["raiMediaFilteredCount"]);
  o != null && l(t, ["raiMediaFilteredCount"], o);
  const s = r(e, ["raiMediaFilteredReasons"]);
  return s != null && l(t, ["raiMediaFilteredReasons"], s), t;
}
function Vy(e) {
  const t = {}, n = r(e, ["videos"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((a) => Jy(a))), l(t, ["generatedVideos"], i);
  }
  const o = r(e, ["raiMediaFilteredCount"]);
  o != null && l(t, ["raiMediaFilteredCount"], o);
  const s = r(e, ["raiMediaFilteredReasons"]);
  return s != null && l(t, ["raiMediaFilteredReasons"], s), t;
}
function Hy(e) {
  const t = {}, n = r(e, ["video"]);
  return n != null && l(t, ["video"], Qy(n)), t;
}
function Jy(e) {
  const t = {}, n = r(e, ["_self"]);
  return n != null && l(t, ["video"], Zy(n)), t;
}
function Wy(e) {
  const t = {}, n = r(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function Ky(e) {
  const t = {}, n = r(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function zy(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = r(e, ["response"]);
  return a != null && l(t, ["response"], Yy(a)), t;
}
function Yy(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const s = r(e, ["documentName"]);
  return s != null && l(t, ["documentName"], s), t;
}
function op(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = r(e, ["response"]);
  return a != null && l(t, ["response"], Xy(a)), t;
}
function Xy(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const s = r(e, ["documentName"]);
  return s != null && l(t, ["documentName"], s), t;
}
function Qy(e) {
  const t = {}, n = r(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const o = r(e, ["encodedVideo"]);
  o != null && l(t, ["videoBytes"], Zr(o));
  const s = r(e, ["encoding"]);
  return s != null && l(t, ["mimeType"], s), t;
}
function Zy(e) {
  const t = {}, n = r(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const o = r(e, ["bytesBase64Encoded"]);
  o != null && l(t, ["videoBytes"], Zr(o));
  const s = r(e, ["mimeType"]);
  return s != null && l(t, ["mimeType"], s), t;
}
var Ml;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(Ml || (Ml = {}));
var Nl;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(Nl || (Nl = {}));
var kl;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(kl || (kl = {}));
var St;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(St || (St = {}));
var Ll;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(Ll || (Ll = {}));
var Dl;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})(Dl || (Dl = {}));
var $l;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})($l || ($l = {}));
var Ul;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(Ul || (Ul = {}));
var Fl;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(Fl || (Fl = {}));
var Bl;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})(Bl || (Bl = {}));
var Gl;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})(Gl || (Gl = {}));
var nr;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(nr || (nr = {}));
var Zn;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Zn || (Zn = {}));
var ql;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(ql || (ql = {}));
var Ol;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})(Ol || (Ol = {}));
var Vl;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(Vl || (Vl = {}));
var Hl;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(Hl || (Hl = {}));
var Jl;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(Jl || (Jl = {}));
var Wl;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})(Wl || (Wl = {}));
var Kl;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Kl || (Kl = {}));
var zl;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(zl || (zl = {}));
var Yl;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(Yl || (Yl = {}));
var Xl;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(Xl || (Xl = {}));
var Ql;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(Ql || (Ql = {}));
var ys;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(ys || (ys = {}));
var Zl;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(Zl || (Zl = {}));
var jl;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(jl || (jl = {}));
var eu;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(eu || (eu = {}));
var tu;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(tu || (tu = {}));
var or;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(or || (or = {}));
var nu;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})(nu || (nu = {}));
var ou;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})(ou || (ou = {}));
var su;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(su || (su = {}));
var iu;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(iu || (iu = {}));
var ru;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(ru || (ru = {}));
var au;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})(au || (au = {}));
var lu;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})(lu || (lu = {}));
var sr;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(sr || (sr = {}));
var uu;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})(uu || (uu = {}));
var cu;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(cu || (cu = {}));
var _s;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(_s || (_s = {}));
var du;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(du || (du = {}));
var fu;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(fu || (fu = {}));
var pu;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(pu || (pu = {}));
var hu;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(hu || (hu = {}));
var mu;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(mu || (mu = {}));
var gu;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(gu || (gu = {}));
var yu;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(yu || (yu = {}));
var _u;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(_u || (_u = {}));
var vu;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})(vu || (vu = {}));
var Su;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(Su || (Su = {}));
var Tu;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})(Tu || (Tu = {}));
var Eu;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(Eu || (Eu = {}));
var bu;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(bu || (bu = {}));
var wu;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(wu || (wu = {}));
var Au;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(Au || (Au = {}));
var Cu;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(Cu || (Cu = {}));
var Iu;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(Iu || (Iu = {}));
var xu;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(xu || (xu = {}));
var Ru;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(Ru || (Ru = {}));
var Pu;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(Pu || (Pu = {}));
var Mu;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(Mu || (Mu = {}));
var Nu;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(Nu || (Nu = {}));
var ku;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(ku || (ku = {}));
var Zt;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(Zt || (Zt = {}));
var ir = class {
  constructor(e) {
    const t = {};
    for (const n of e.headers.entries()) t[n[0]] = n[1];
    this.headers = t, this.responseInternal = e;
  }
  json() {
    return this.responseInternal.json();
  }
}, Pn = class {
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
}, Lu = class {
}, Du = class {
}, jy = class {
}, e_ = class {
}, t_ = class {
}, n_ = class {
}, $u = class {
}, Uu = class {
}, Fu = class {
}, o_ = class {
}, Bu = class sp {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new sp();
    let s;
    const i = t;
    return n ? s = qy(i) : s = Gy(i), Object.assign(o, s), o;
  }
}, Gu = class {
}, qu = class {
}, Ou = class {
}, Vu = class {
}, s_ = class {
}, i_ = class {
}, r_ = class {
}, a_ = class ip {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new ip(), s = zy(t);
    return Object.assign(o, s), o;
  }
}, l_ = class {
}, u_ = class {
}, c_ = class {
}, d_ = class {
}, Hu = class {
}, f_ = class {
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
}, p_ = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, h_ = class rp {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new rp(), s = op(t);
    return Object.assign(o, s), o;
  }
};
function se(e, t) {
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
function ap(e, t) {
  const n = se(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function lp(e) {
  return Array.isArray(e) ? e.map((t) => vs(t)) : [vs(e)];
}
function vs(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function up(e) {
  const t = vs(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function cp(e) {
  const t = vs(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function Ju(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function dp(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => Ju(t)) : [Ju(e)];
}
function rr(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function Wu(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function Ku(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function Se(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return rr(e) ? e : {
    role: "user",
    parts: dp(e)
  };
}
function jr(e, t) {
  if (!t) return [];
  if (e.isVertexAI() && Array.isArray(t)) return t.flatMap((n) => {
    const o = Se(n);
    return o.parts && o.parts.length > 0 && o.parts[0].text !== void 0 ? [o.parts[0].text] : [];
  });
  if (e.isVertexAI()) {
    const n = Se(t);
    return n.parts && n.parts.length > 0 && n.parts[0].text !== void 0 ? [n.parts[0].text] : [];
  }
  return Array.isArray(t) ? t.map((n) => Se(n)) : [Se(t)];
}
function Ne(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("contents are required");
  if (!Array.isArray(e)) {
    if (Wu(e) || Ku(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [Se(e)];
  }
  const t = [], n = [], o = rr(e[0]);
  for (const s of e) {
    const i = rr(s);
    if (i != o) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (i) t.push(s);
    else {
      if (Wu(s) || Ku(s)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(s);
    }
  }
  return o || t.push({
    role: "user",
    parts: dp(n)
  }), t;
}
function m_(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((o) => o !== "null");
  if (n.length === 1) t.type = Object.values(St).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : St.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const o of n) t.anyOf.push({ type: Object.values(St).includes(o.toUpperCase()) ? o.toUpperCase() : St.TYPE_UNSPECIFIED });
  }
}
function nn(e) {
  const t = {}, n = ["items"], o = ["anyOf"], s = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const i = e.anyOf;
  i != null && i.length == 2 && (i[0].type === "null" ? (t.nullable = !0, e = i[1]) : i[1].type === "null" && (t.nullable = !0, e = i[0])), e.type instanceof Array && m_(e.type, t);
  for (const [a, u] of Object.entries(e))
    if (u != null)
      if (a == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(St).includes(u.toUpperCase()) ? u.toUpperCase() : St.TYPE_UNSPECIFIED;
      } else if (n.includes(a)) t[a] = nn(u);
      else if (o.includes(a)) {
        const c = [];
        for (const d of u) {
          if (d.type == "null") {
            t.nullable = !0;
            continue;
          }
          c.push(nn(d));
        }
        t[a] = c;
      } else if (s.includes(a)) {
        const c = {};
        for (const [d, p] of Object.entries(u)) c[d] = nn(p);
        t[a] = c;
      } else {
        if (a === "additionalProperties") continue;
        t[a] = u;
      }
  return t;
}
function ea(e) {
  return nn(e);
}
function ta(e) {
  if (typeof e == "object") return e;
  if (typeof e == "string") return { voiceConfig: { prebuiltVoiceConfig: { voiceName: e } } };
  throw new Error(`Unsupported speechConfig type: ${typeof e}`);
}
function na(e) {
  if ("multiSpeakerVoiceConfig" in e) throw new Error("multiSpeakerVoiceConfig is not supported in the live API.");
  return e;
}
function an(e) {
  if (e.functionDeclarations) for (const t of e.functionDeclarations)
    t.parameters && (Object.keys(t.parameters).includes("$schema") ? t.parametersJsonSchema || (t.parametersJsonSchema = t.parameters, delete t.parameters) : t.parameters = nn(t.parameters)), t.response && (Object.keys(t.response).includes("$schema") ? t.responseJsonSchema || (t.responseJsonSchema = t.response, delete t.response) : t.response = nn(t.response));
  return e;
}
function ln(e) {
  if (e == null) throw new Error("tools is required");
  if (!Array.isArray(e)) throw new Error("tools is required and must be an array of Tools");
  const t = [];
  for (const n of e) t.push(n);
  return t;
}
function g_(e, t, n, o = 1) {
  const s = !t.startsWith(`${n}/`) && t.split("/").length === o;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : s ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : s ? `${n}/${t}` : t;
}
function ft(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return g_(e, t, "cachedContents");
}
function fp(e) {
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
function bt(e) {
  return Zr(e);
}
function y_(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function __(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function v_(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function pp(e) {
  var t;
  let n;
  if (y_(e) && (n = e.name), !(v_(e) && (n = e.uri, n === void 0)) && !(__(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const o = n.split("files/")[1].match(/[a-z0-9]+/);
      if (o === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = o[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function hp(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function mp(e) {
  for (const t of [
    "models",
    "tunedModels",
    "publisherModels"
  ]) if (S_(e, t)) return e[t];
  return [];
}
function S_(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function T_(e, t = {}) {
  const n = e, o = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (o.responseJsonSchema = n.outputSchema), t.behavior && (o.behavior = t.behavior), { functionDeclarations: [o] };
}
function E_(e, t = {}) {
  const n = [], o = /* @__PURE__ */ new Set();
  for (const s of e) {
    const i = s.name;
    if (o.has(i)) throw new Error(`Duplicate function name ${i} found in MCP tools. Please ensure function names are unique.`);
    o.add(i);
    const a = T_(s, t);
    a.functionDeclarations && n.push(...a.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function gp(e, t) {
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
function b_(e) {
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
function yp(e) {
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
function un(e, t) {
  const n = t;
  if (!e.isVertexAI()) {
    if (/batches\/[^/]+$/.test(n)) return n.split("/").pop();
    throw new Error(`Invalid batch job name: ${n}.`);
  }
  if (/^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/.test(n)) return n.split("/").pop();
  if (/^\d+$/.test(n)) return n;
  throw new Error(`Invalid batch job name: ${n}.`);
}
function _p(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function w_(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function A_(e) {
  const t = {}, n = r(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function C_(e) {
  const t = {}, n = r(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const o = r(e, ["inlinedResponses", "inlinedResponses"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => rv(a))), l(t, ["inlinedResponses"], i);
  }
  const s = r(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["inlinedEmbedContentResponses"], i);
  }
  return t;
}
function I_(e) {
  const t = {}, n = r(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const o = r(e, ["gcsDestination", "outputUriPrefix"]);
  o != null && l(t, ["gcsUri"], o);
  const s = r(e, ["bigqueryDestination", "outputUri"]);
  return s != null && l(t, ["bigqueryUri"], s), t;
}
function x_(e) {
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
function os(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["metadata", "displayName"]);
  o != null && l(t, ["displayName"], o);
  const s = r(e, ["metadata", "state"]);
  s != null && l(t, ["state"], _p(s));
  const i = r(e, ["metadata", "createTime"]);
  i != null && l(t, ["createTime"], i);
  const a = r(e, ["metadata", "endTime"]);
  a != null && l(t, ["endTime"], a);
  const u = r(e, ["metadata", "updateTime"]);
  u != null && l(t, ["updateTime"], u);
  const c = r(e, ["metadata", "model"]);
  c != null && l(t, ["model"], c);
  const d = r(e, ["metadata", "output"]);
  return d != null && l(t, ["dest"], C_(yp(d))), t;
}
function ar(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["displayName"]);
  o != null && l(t, ["displayName"], o);
  const s = r(e, ["state"]);
  s != null && l(t, ["state"], _p(s));
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
  f != null && l(t, ["src"], R_(f));
  const h = r(e, ["outputConfig"]);
  h != null && l(t, ["dest"], I_(yp(h)));
  const m = r(e, ["completionStats"]);
  return m != null && l(t, ["completionStats"], m), t;
}
function R_(e) {
  const t = {}, n = r(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const o = r(e, ["gcsSource", "uris"]);
  o != null && l(t, ["gcsUri"], o);
  const s = r(e, ["bigquerySource", "inputUri"]);
  return s != null && l(t, ["bigqueryUri"], s), t;
}
function P_(e, t) {
  const n = {};
  if (r(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (r(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (r(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const o = r(t, ["fileName"]);
  o != null && l(n, ["fileName"], o);
  const s = r(t, ["inlinedRequests"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => iv(e, a))), l(n, ["requests", "requests"], i);
  }
  return n;
}
function M_(e) {
  const t = {}, n = r(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const o = r(e, ["gcsUri"]);
  o != null && l(t, ["gcsSource", "uris"], o);
  const s = r(e, ["bigqueryUri"]);
  if (s != null && l(t, ["bigquerySource", "inputUri"], s), r(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (r(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function N_(e) {
  const t = {}, n = r(e, ["data"]);
  if (n != null && l(t, ["data"], n), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function k_(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], un(e, o)), n;
}
function L_(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], un(e, o)), n;
}
function D_(e) {
  const t = {}, n = r(e, ["content"]);
  n != null && l(t, ["content"], n);
  const o = r(e, ["citationMetadata"]);
  o != null && l(t, ["citationMetadata"], $_(o));
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
function $_(e) {
  const t = {}, n = r(e, ["citationSources"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["citations"], o);
  }
  return t;
}
function vp(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((i) => pv(i))), l(t, ["parts"], s);
  }
  const o = r(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function U_(e, t) {
  const n = {}, o = r(e, ["displayName"]);
  if (t !== void 0 && o != null && l(t, ["batch", "displayName"], o), r(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const s = r(e, ["webhookConfig"]);
  return t !== void 0 && s != null && l(t, ["batch", "webhookConfig"], s), n;
}
function F_(e, t) {
  const n = {}, o = r(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const s = r(e, ["dest"]);
  if (t !== void 0 && s != null && l(t, ["outputConfig"], x_(b_(s))), r(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function zu(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["_url", "model"], se(e, o));
  const s = r(t, ["src"]);
  s != null && l(n, ["batch", "inputConfig"], P_(e, gp(e, s)));
  const i = r(t, ["config"]);
  return i != null && U_(i, n), n;
}
function B_(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["model"], se(e, o));
  const s = r(t, ["src"]);
  s != null && l(n, ["inputConfig"], M_(gp(e, s)));
  const i = r(t, ["config"]);
  return i != null && F_(i, n), n;
}
function G_(e, t) {
  const n = {}, o = r(e, ["displayName"]);
  return t !== void 0 && o != null && l(t, ["batch", "displayName"], o), n;
}
function q_(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["_url", "model"], se(e, o));
  const s = r(t, ["src"]);
  s != null && l(n, ["batch", "inputConfig"], z_(e, s));
  const i = r(t, ["config"]);
  return i != null && G_(i, n), n;
}
function O_(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], un(e, o)), n;
}
function V_(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], un(e, o)), n;
}
function H_(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["name"]);
  o != null && l(t, ["name"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function J_(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["name"]);
  o != null && l(t, ["name"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function W_(e, t) {
  const n = {}, o = r(t, ["contents"]);
  if (o != null) {
    let i = jr(e, o);
    Array.isArray(i) && (i = i.map((a) => a)), l(n, [
      "requests[]",
      "request",
      "content"
    ], i);
  }
  const s = r(t, ["config"]);
  return s != null && (l(n, ["_self"], K_(s, n)), Fy(n, { "requests[].*": "requests[].request.*" })), n;
}
function K_(e, t) {
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
function z_(e, t) {
  const n = {}, o = r(t, ["fileName"]);
  o != null && l(n, ["file_name"], o);
  const s = r(t, ["inlinedRequests"]);
  return s != null && l(n, ["requests"], W_(e, s)), n;
}
function Y_(e) {
  const t = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = r(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function X_(e) {
  const t = {}, n = r(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = r(e, ["args"]);
  o != null && l(t, ["args"], o);
  const s = r(e, ["name"]);
  if (s != null && l(t, ["name"], s), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Q_(e) {
  const t = {}, n = r(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const o = r(e, ["mode"]);
  if (o != null && l(t, ["mode"], o), r(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function Z_(e, t, n) {
  const o = {}, s = r(t, ["systemInstruction"]);
  n !== void 0 && s != null && l(n, ["systemInstruction"], vp(Se(s)));
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
  S != null && l(o, ["responseSchema"], ea(S));
  const b = r(t, ["responseJsonSchema"]);
  if (b != null && l(o, ["responseJsonSchema"], b), r(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (r(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const A = r(t, ["safetySettings"]);
  if (n !== void 0 && A != null) {
    let ee = A;
    Array.isArray(ee) && (ee = ee.map((L) => hv(L))), l(n, ["safetySettings"], ee);
  }
  const R = r(t, ["tools"]);
  if (n !== void 0 && R != null) {
    let ee = ln(R);
    Array.isArray(ee) && (ee = ee.map((L) => gv(an(L)))), l(n, ["tools"], ee);
  }
  const $ = r(t, ["toolConfig"]);
  if (n !== void 0 && $ != null && l(n, ["toolConfig"], mv($)), r(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const w = r(t, ["cachedContent"]);
  n !== void 0 && w != null && l(n, ["cachedContent"], ft(e, w));
  const v = r(t, ["responseModalities"]);
  v != null && l(o, ["responseModalities"], v);
  const I = r(t, ["mediaResolution"]);
  I != null && l(o, ["mediaResolution"], I);
  const P = r(t, ["speechConfig"]);
  if (P != null && l(o, ["speechConfig"], ta(P)), r(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const U = r(t, ["thinkingConfig"]);
  U != null && l(o, ["thinkingConfig"], U);
  const O = r(t, ["imageConfig"]);
  O != null && l(o, ["imageConfig"], sv(O));
  const ne = r(t, ["enableEnhancedCivicAnswers"]);
  if (ne != null && l(o, ["enableEnhancedCivicAnswers"], ne), r(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const Z = r(t, ["serviceTier"]);
  return n !== void 0 && Z != null && l(n, ["serviceTier"], Z), o;
}
function j_(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["candidates"]);
  if (o != null) {
    let d = o;
    Array.isArray(d) && (d = d.map((p) => D_(p))), l(t, ["candidates"], d);
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
function ev(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], un(e, o)), n;
}
function tv(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], un(e, o)), n;
}
function nv(e) {
  const t = {}, n = r(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], A_(n));
  const o = r(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function ov(e) {
  const t = {}, n = r(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = r(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function sv(e) {
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
function iv(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["request", "model"], se(e, o));
  const s = r(t, ["contents"]);
  if (s != null) {
    let u = Ne(s);
    Array.isArray(u) && (u = u.map((c) => vp(c))), l(n, ["request", "contents"], u);
  }
  const i = r(t, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const a = r(t, ["config"]);
  return a != null && l(n, ["request", "generationConfig"], Z_(e, a, r(n, ["request"], {}))), n;
}
function rv(e) {
  const t = {}, n = r(e, ["response"]);
  n != null && l(t, ["response"], j_(n));
  const o = r(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = r(e, ["error"]);
  return s != null && l(t, ["error"], s), t;
}
function av(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  if (t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), r(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function lv(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  t !== void 0 && s != null && l(t, ["_query", "pageToken"], s);
  const i = r(e, ["filter"]);
  return t !== void 0 && i != null && l(t, ["_query", "filter"], i), n;
}
function uv(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && av(n, t), t;
}
function cv(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && lv(n, t), t;
}
function dv(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const s = r(e, ["operations"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => os(a))), l(t, ["batchJobs"], i);
  }
  return t;
}
function fv(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const s = r(e, ["batchPredictionJobs"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => ar(a))), l(t, ["batchJobs"], i);
  }
  return t;
}
function pv(e) {
  const t = {}, n = r(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = r(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const s = r(e, ["executableCode"]);
  s != null && l(t, ["executableCode"], s);
  const i = r(e, ["fileData"]);
  i != null && l(t, ["fileData"], Y_(i));
  const a = r(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], X_(a));
  const u = r(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = r(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], N_(c));
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
function hv(e) {
  const t = {}, n = r(e, ["category"]);
  if (n != null && l(t, ["category"], n), r(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = r(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function mv(e) {
  const t = {}, n = r(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = r(e, ["functionCallingConfig"]);
  o != null && l(t, ["functionCallingConfig"], Q_(o));
  const s = r(e, ["includeServerSideToolInvocations"]);
  return s != null && l(t, ["includeServerSideToolInvocations"], s), t;
}
function gv(e) {
  const t = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = r(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = r(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const s = r(e, ["googleSearch"]);
  s != null && l(t, ["googleSearch"], ov(s));
  const i = r(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], nv(i));
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
var Ut = class {
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
}, yv = class extends dt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Ut(ct.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = zu(this.apiClient, e), n = t._url, o = F("{model}:batchGenerateContent", n), s = t.batch.inputConfig.requests, i = s.requests, a = [];
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
      const c = B_(this.apiClient, e);
      return a = F("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => ar(d));
    } else {
      const c = zu(this.apiClient, e);
      return a = F("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), i.then((d) => os(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = q_(this.apiClient, e);
      return s = F("{model}:asyncBatchEmbedContent", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => os(u));
    }
  }
  async get(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = tv(this.apiClient, e);
      return a = F("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => ar(d));
    } else {
      const c = ev(this.apiClient, e);
      return a = F("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), i.then((d) => os(d));
    }
  }
  async cancel(e) {
    var t, n, o, s;
    let i = "", a = {};
    if (this.apiClient.isVertexAI()) {
      const u = L_(this.apiClient, e);
      i = F("batchPredictionJobs/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: i,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = k_(this.apiClient, e);
      i = F("batches/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
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
      const c = cv(e);
      return a = F("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = fv(d), f = new Hu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = uv(e);
      return a = F("batches", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = dv(d), f = new Hu();
        return Object.assign(f, p), f;
      });
    }
  }
  async delete(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = V_(this.apiClient, e);
      return a = F("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => J_(d));
    } else {
      const c = O_(this.apiClient, e);
      return a = F("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => H_(d));
    }
  }
};
function _v(e) {
  const t = {}, n = r(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function vv(e) {
  const t = {}, n = r(e, ["data"]);
  if (n != null && l(t, ["data"], n), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Yu(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((i) => Ov(i))), l(t, ["parts"], s);
  }
  const o = r(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function Xu(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((i) => Vv(i))), l(t, ["parts"], s);
  }
  const o = r(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function Sv(e, t) {
  const n = {}, o = r(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const s = r(e, ["expireTime"]);
  t !== void 0 && s != null && l(t, ["expireTime"], s);
  const i = r(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const a = r(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let p = Ne(a);
    Array.isArray(p) && (p = p.map((f) => Yu(f))), l(t, ["contents"], p);
  }
  const u = r(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Yu(Se(u)));
  const c = r(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((f) => Wv(f))), l(t, ["tools"], p);
  }
  const d = r(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], Hv(d)), r(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function Tv(e, t) {
  const n = {}, o = r(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const s = r(e, ["expireTime"]);
  t !== void 0 && s != null && l(t, ["expireTime"], s);
  const i = r(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const a = r(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let f = Ne(a);
    Array.isArray(f) && (f = f.map((h) => Xu(h))), l(t, ["contents"], f);
  }
  const u = r(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Xu(Se(u)));
  const c = r(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((h) => Kv(h))), l(t, ["tools"], f);
  }
  const d = r(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], Jv(d));
  const p = r(e, ["kmsKeyName"]);
  return t !== void 0 && p != null && l(t, ["encryption_spec", "kmsKeyName"], p), n;
}
function Ev(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["model"], ap(e, o));
  const s = r(t, ["config"]);
  return s != null && Sv(s, n), n;
}
function bv(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["model"], ap(e, o));
  const s = r(t, ["config"]);
  return s != null && Tv(s, n), n;
}
function wv(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ft(e, o)), n;
}
function Av(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ft(e, o)), n;
}
function Cv(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Iv(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function xv(e) {
  const t = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = r(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Rv(e) {
  const t = {}, n = r(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = r(e, ["args"]);
  o != null && l(t, ["args"], o);
  const s = r(e, ["name"]);
  if (s != null && l(t, ["name"], s), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Pv(e) {
  const t = {}, n = r(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const o = r(e, ["mode"]);
  if (o != null && l(t, ["mode"], o), r(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function Mv(e) {
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
function Nv(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ft(e, o)), n;
}
function kv(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ft(e, o)), n;
}
function Lv(e) {
  const t = {}, n = r(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], _v(n));
  const o = r(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function Dv(e) {
  const t = {}, n = r(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = r(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function $v(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function Uv(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function Fv(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && $v(n, t), t;
}
function Bv(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && Uv(n, t), t;
}
function Gv(e) {
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
function qv(e) {
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
function Ov(e) {
  const t = {}, n = r(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = r(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const s = r(e, ["executableCode"]);
  s != null && l(t, ["executableCode"], s);
  const i = r(e, ["fileData"]);
  i != null && l(t, ["fileData"], xv(i));
  const a = r(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], Rv(a));
  const u = r(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = r(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], vv(c));
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
function Vv(e) {
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
function Hv(e) {
  const t = {}, n = r(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = r(e, ["functionCallingConfig"]);
  o != null && l(t, ["functionCallingConfig"], Pv(o));
  const s = r(e, ["includeServerSideToolInvocations"]);
  return s != null && l(t, ["includeServerSideToolInvocations"], s), t;
}
function Jv(e) {
  const t = {}, n = r(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = r(e, ["functionCallingConfig"]);
  if (o != null && l(t, ["functionCallingConfig"], o), r(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function Wv(e) {
  const t = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = r(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = r(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const s = r(e, ["googleSearch"]);
  s != null && l(t, ["googleSearch"], Dv(s));
  const i = r(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], Lv(i));
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
function Kv(e) {
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
    Array.isArray(h) && (h = h.map((m) => Mv(m))), l(t, ["functionDeclarations"], h);
  }
  const d = r(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const p = r(e, ["parallelAiSearch"]);
  p != null && l(t, ["parallelAiSearch"], p);
  const f = r(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), r(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function zv(e, t) {
  const n = {}, o = r(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const s = r(e, ["expireTime"]);
  return t !== void 0 && s != null && l(t, ["expireTime"], s), n;
}
function Yv(e, t) {
  const n = {}, o = r(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const s = r(e, ["expireTime"]);
  return t !== void 0 && s != null && l(t, ["expireTime"], s), n;
}
function Xv(e, t) {
  const n = {}, o = r(t, ["name"]);
  o != null && l(n, ["_url", "name"], ft(e, o));
  const s = r(t, ["config"]);
  return s != null && zv(s, n), n;
}
function Qv(e, t) {
  const n = {}, o = r(t, ["name"]);
  o != null && l(n, ["_url", "name"], ft(e, o));
  const s = r(t, ["config"]);
  return s != null && Yv(s, n), n;
}
var Zv = class extends dt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Ut(ct.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = bv(this.apiClient, e);
      return a = F("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = Ev(this.apiClient, e);
      return a = F("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
      const c = kv(this.apiClient, e);
      return a = F("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = Nv(this.apiClient, e);
      return a = F("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
      const c = Av(this.apiClient, e);
      return a = F("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = Iv(d), f = new Ou();
        return Object.assign(f, p), f;
      });
    } else {
      const c = wv(this.apiClient, e);
      return a = F("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = Cv(d), f = new Ou();
        return Object.assign(f, p), f;
      });
    }
  }
  async update(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Qv(this.apiClient, e);
      return a = F("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = Xv(this.apiClient, e);
      return a = F("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
      const c = Bv(e);
      return a = F("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = qv(d), f = new Vu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = Fv(e);
      return a = F("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = Gv(d), f = new Vu();
        return Object.assign(f, p), f;
      });
    }
  }
};
function Tt(e, t) {
  var n = {};
  for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var s = 0, o = Object.getOwnPropertySymbols(e); s < o.length; s++) t.indexOf(o[s]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[s]) && (n[o[s]] = e[o[s]]);
  return n;
}
function Qu(e) {
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
function Q(e) {
  return this instanceof Q ? (this.v = e, this) : new Q(e);
}
function Qe(e, t, n) {
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
    m.value instanceof Q ? Promise.resolve(m.value.v).then(p, f) : h(i[0][2], m);
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
function Ze(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof Qu == "function" ? Qu(e) : e[Symbol.iterator](), n = {}, o("next"), o("throw"), o("return"), n[Symbol.asyncIterator] = function() {
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
function jv(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : Sp(n);
}
function Sp(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function eS(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function Zu(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let o = 0;
  for (; o < n; ) if (e[o].role === "user")
    t.push(e[o]), o++;
  else {
    const s = [];
    let i = !0;
    for (; o < n && e[o].role === "model"; )
      s.push(e[o]), i && !Sp(e[o]) && (i = !1), o++;
    i ? t.push(...s) : t.pop();
  }
  return t;
}
var tS = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new nS(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, nS = class {
  constructor(e, t, n, o = {}, s = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = o, this.history = s, this.sendPromise = Promise.resolve(), eS(s);
  }
  async sendMessage(e) {
    var t;
    await this.sendPromise;
    const n = Se(e.message), o = this.modelsModule.generateContent({
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
    const n = Se(e.message), o = this.modelsModule.generateContentStream({
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
    const t = e ? Zu(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return Qe(this, arguments, function* () {
      var o, s, i, a, u, c;
      const d = [];
      try {
        for (var p = !0, f = Ze(e), h; h = yield Q(f.next()), o = h.done, !o; p = !0) {
          a = h.value, p = !1;
          const m = a;
          if (jv(m)) {
            const g = (c = (u = m.candidates) === null || u === void 0 ? void 0 : u[0]) === null || c === void 0 ? void 0 : c.content;
            g !== void 0 && d.push(g);
          }
          yield yield Q(m);
        }
      } catch (m) {
        s = { error: m };
      } finally {
        try {
          !p && !o && (i = f.return) && (yield Q(i.call(f)));
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
    }), n && n.length > 0 ? this.history.push(...Zu(n)) : this.history.push(e), this.history.push(...o);
  }
}, Tp = class Ep extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, Ep.prototype);
  }
};
function oS(e) {
  const t = {}, n = r(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function sS(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function iS(e) {
  const t = {}, n = r(e, ["name"]);
  return n != null && l(t, ["_url", "file"], pp(n)), t;
}
function rS(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function aS(e) {
  const t = {}, n = r(e, ["name"]);
  return n != null && l(t, ["_url", "file"], pp(n)), t;
}
function lS(e) {
  const t = {}, n = r(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function uS(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function cS(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && uS(n, t), t;
}
function dS(e) {
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
function fS(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["files"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((i) => i)), l(t, ["files"], s);
  }
  return t;
}
var pS = class extends dt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Ut(ct.PAGED_ITEM_FILES, (n) => this.listInternal(n), await this.listInternal(t), t);
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
      const a = cS(e);
      return s = F("files", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
        const c = dS(u), d = new l_();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = oS(e);
      return s = F("upload/v1beta/files", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = sS(u), d = new u_();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = aS(e);
      return s = F("files/{file}", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
      const a = iS(e);
      return s = F("files/{file}", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
        const c = rS(u), d = new c_();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = lS(e);
      return s = F("files:register", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = fS(u), d = new d_();
        return Object.assign(d, c), d;
      });
    }
  }
};
function ju(e) {
  const t = {};
  if (r(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function hS(e) {
  const t = {}, n = r(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function ss(e) {
  const t = {}, n = r(e, ["data"]);
  if (n != null && l(t, ["data"], n), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function mS(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((i) => NS(i))), l(t, ["parts"], s);
  }
  const o = r(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function gS(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((i) => kS(i))), l(t, ["parts"], s);
  }
  const o = r(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function yS(e) {
  const t = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = r(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function _S(e) {
  const t = {}, n = r(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = r(e, ["args"]);
  o != null && l(t, ["args"], o);
  const s = r(e, ["name"]);
  if (s != null && l(t, ["name"], s), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function vS(e) {
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
function SS(e) {
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
  const b = r(e, ["speechConfig"]);
  b != null && l(t, ["speechConfig"], b);
  const A = r(e, ["stopSequences"]);
  A != null && l(t, ["stopSequences"], A);
  const R = r(e, ["temperature"]);
  R != null && l(t, ["temperature"], R);
  const $ = r(e, ["thinkingConfig"]);
  $ != null && l(t, ["thinkingConfig"], $);
  const w = r(e, ["topK"]);
  w != null && l(t, ["topK"], w);
  const v = r(e, ["topP"]);
  if (v != null && l(t, ["topP"], v), r(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return t;
}
function TS(e) {
  const t = {}, n = r(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], hS(n));
  const o = r(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function ES(e) {
  const t = {}, n = r(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = r(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function bS(e, t) {
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
  ], na(f));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], mS(Se(g)));
  const y = r(e, ["tools"]);
  if (t !== void 0 && y != null) {
    let I = ln(y);
    Array.isArray(I) && (I = I.map((P) => $S(an(P)))), l(t, ["setup", "tools"], I);
  }
  const _ = r(e, ["sessionResumption"]);
  t !== void 0 && _ != null && l(t, ["setup", "sessionResumption"], DS(_));
  const S = r(e, ["inputAudioTranscription"]);
  t !== void 0 && S != null && l(t, ["setup", "inputAudioTranscription"], ju(S));
  const b = r(e, ["outputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "outputAudioTranscription"], ju(b));
  const A = r(e, ["realtimeInputConfig"]);
  t !== void 0 && A != null && l(t, ["setup", "realtimeInputConfig"], A);
  const R = r(e, ["contextWindowCompression"]);
  t !== void 0 && R != null && l(t, ["setup", "contextWindowCompression"], R);
  const $ = r(e, ["proactivity"]);
  if (t !== void 0 && $ != null && l(t, ["setup", "proactivity"], $), r(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const w = r(e, ["avatarConfig"]);
  t !== void 0 && w != null && l(t, ["setup", "avatarConfig"], w);
  const v = r(e, ["safetySettings"]);
  if (t !== void 0 && v != null) {
    let I = v;
    Array.isArray(I) && (I = I.map((P) => LS(P))), l(t, ["setup", "safetySettings"], I);
  }
  return n;
}
function wS(e, t) {
  const n = {}, o = r(e, ["generationConfig"]);
  t !== void 0 && o != null && l(t, ["setup", "generationConfig"], SS(o));
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
  ], na(f));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], gS(Se(g)));
  const y = r(e, ["tools"]);
  if (t !== void 0 && y != null) {
    let P = ln(y);
    Array.isArray(P) && (P = P.map((U) => US(an(U)))), l(t, ["setup", "tools"], P);
  }
  const _ = r(e, ["sessionResumption"]);
  t !== void 0 && _ != null && l(t, ["setup", "sessionResumption"], _);
  const S = r(e, ["inputAudioTranscription"]);
  t !== void 0 && S != null && l(t, ["setup", "inputAudioTranscription"], S);
  const b = r(e, ["outputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "outputAudioTranscription"], b);
  const A = r(e, ["realtimeInputConfig"]);
  t !== void 0 && A != null && l(t, ["setup", "realtimeInputConfig"], A);
  const R = r(e, ["contextWindowCompression"]);
  t !== void 0 && R != null && l(t, ["setup", "contextWindowCompression"], R);
  const $ = r(e, ["proactivity"]);
  t !== void 0 && $ != null && l(t, ["setup", "proactivity"], $);
  const w = r(e, ["explicitVadSignal"]);
  t !== void 0 && w != null && l(t, ["setup", "explicitVadSignal"], w);
  const v = r(e, ["avatarConfig"]);
  t !== void 0 && v != null && l(t, ["setup", "avatarConfig"], v);
  const I = r(e, ["safetySettings"]);
  if (t !== void 0 && I != null) {
    let P = I;
    Array.isArray(P) && (P = P.map((U) => U)), l(t, ["setup", "safetySettings"], P);
  }
  return n;
}
function AS(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["setup", "model"], se(e, o));
  const s = r(t, ["config"]);
  return s != null && l(n, ["config"], bS(s, n)), n;
}
function CS(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["setup", "model"], se(e, o));
  const s = r(t, ["config"]);
  return s != null && l(n, ["config"], wS(s, n)), n;
}
function IS(e) {
  const t = {}, n = r(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function xS(e) {
  const t = {}, n = r(e, ["weightedPrompts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["weightedPrompts"], o);
  }
  return t;
}
function RS(e) {
  const t = {}, n = r(e, ["media"]);
  if (n != null) {
    let d = lp(n);
    Array.isArray(d) && (d = d.map((p) => ss(p))), l(t, ["mediaChunks"], d);
  }
  const o = r(e, ["audio"]);
  o != null && l(t, ["audio"], ss(cp(o)));
  const s = r(e, ["audioStreamEnd"]);
  s != null && l(t, ["audioStreamEnd"], s);
  const i = r(e, ["video"]);
  i != null && l(t, ["video"], ss(up(i)));
  const a = r(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = r(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = r(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function PS(e) {
  const t = {}, n = r(e, ["media"]);
  if (n != null) {
    let d = lp(n);
    Array.isArray(d) && (d = d.map((p) => p)), l(t, ["mediaChunks"], d);
  }
  const o = r(e, ["audio"]);
  o != null && l(t, ["audio"], cp(o));
  const s = r(e, ["audioStreamEnd"]);
  s != null && l(t, ["audioStreamEnd"], s);
  const i = r(e, ["video"]);
  i != null && l(t, ["video"], up(i));
  const a = r(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = r(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = r(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function MS(e) {
  const t = {}, n = r(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const o = r(e, ["serverContent"]);
  o != null && l(t, ["serverContent"], o);
  const s = r(e, ["toolCall"]);
  s != null && l(t, ["toolCall"], s);
  const i = r(e, ["toolCallCancellation"]);
  i != null && l(t, ["toolCallCancellation"], i);
  const a = r(e, ["usageMetadata"]);
  a != null && l(t, ["usageMetadata"], FS(a));
  const u = r(e, ["goAway"]);
  u != null && l(t, ["goAway"], u);
  const c = r(e, ["sessionResumptionUpdate"]);
  c != null && l(t, ["sessionResumptionUpdate"], c);
  const d = r(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const p = r(e, ["voiceActivity"]);
  return p != null && l(t, ["voiceActivity"], BS(p)), t;
}
function NS(e) {
  const t = {}, n = r(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = r(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const s = r(e, ["executableCode"]);
  s != null && l(t, ["executableCode"], s);
  const i = r(e, ["fileData"]);
  i != null && l(t, ["fileData"], yS(i));
  const a = r(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], _S(a));
  const u = r(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = r(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], ss(c));
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
function kS(e) {
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
function LS(e) {
  const t = {}, n = r(e, ["category"]);
  if (n != null && l(t, ["category"], n), r(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = r(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function DS(e) {
  const t = {}, n = r(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), r(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function $S(e) {
  const t = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = r(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = r(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const s = r(e, ["googleSearch"]);
  s != null && l(t, ["googleSearch"], ES(s));
  const i = r(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], TS(i));
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
function US(e) {
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
    Array.isArray(h) && (h = h.map((m) => vS(m))), l(t, ["functionDeclarations"], h);
  }
  const d = r(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const p = r(e, ["parallelAiSearch"]);
  p != null && l(t, ["parallelAiSearch"], p);
  const f = r(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), r(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function FS(e) {
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
function BS(e) {
  const t = {}, n = r(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function GS(e, t) {
  const n = {}, o = r(e, ["apiKey"]);
  if (o != null && l(n, ["apiKey"], o), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function qS(e, t) {
  const n = {}, o = r(e, ["data"]);
  if (o != null && l(n, ["data"], o), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const s = r(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function OS(e, t) {
  const n = {}, o = r(e, ["content"]);
  o != null && l(n, ["content"], o);
  const s = r(e, ["citationMetadata"]);
  s != null && l(n, ["citationMetadata"], VS(s));
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
function VS(e, t) {
  const n = {}, o = r(e, ["citationSources"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((i) => i)), l(n, ["citations"], s);
  }
  return n;
}
function HS(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], se(e, s));
  const i = r(t, ["contents"]);
  if (i != null) {
    let a = Ne(i);
    Array.isArray(a) && (a = a.map((u) => cn(u))), l(o, ["contents"], a);
  }
  return o;
}
function JS(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["tokensInfo"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => a)), l(n, ["tokensInfo"], i);
  }
  return n;
}
function WS(e, t) {
  const n = {}, o = r(e, ["values"]);
  o != null && l(n, ["values"], o);
  const s = r(e, ["statistics"]);
  return s != null && l(n, ["statistics"], KS(s)), n;
}
function KS(e, t) {
  const n = {}, o = r(e, ["truncated"]);
  o != null && l(n, ["truncated"], o);
  const s = r(e, ["token_count"]);
  return s != null && l(n, ["tokenCount"], s), n;
}
function po(e, t) {
  const n = {}, o = r(e, ["parts"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => nE(a))), l(n, ["parts"], i);
  }
  const s = r(e, ["role"]);
  return s != null && l(n, ["role"], s), n;
}
function cn(e, t) {
  const n = {}, o = r(e, ["parts"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => oE(a))), l(n, ["parts"], i);
  }
  const s = r(e, ["role"]);
  return s != null && l(n, ["role"], s), n;
}
function zS(e, t) {
  const n = {}, o = r(e, ["controlType"]);
  o != null && l(n, ["controlType"], o);
  const s = r(e, ["enableControlImageComputation"]);
  return s != null && l(n, ["computeControl"], s), n;
}
function YS(e, t) {
  const n = {};
  if (r(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (r(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (r(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function XS(e, t, n) {
  const o = {}, s = r(e, ["systemInstruction"]);
  t !== void 0 && s != null && l(t, ["systemInstruction"], cn(Se(s)));
  const i = r(e, ["tools"]);
  if (t !== void 0 && i != null) {
    let u = i;
    Array.isArray(u) && (u = u.map((c) => Cp(c))), l(t, ["tools"], u);
  }
  const a = r(e, ["generationConfig"]);
  return t !== void 0 && a != null && l(t, ["generationConfig"], qT(a)), o;
}
function QS(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], se(e, s));
  const i = r(t, ["contents"]);
  if (i != null) {
    let u = Ne(i);
    Array.isArray(u) && (u = u.map((c) => po(c))), l(o, ["contents"], u);
  }
  const a = r(t, ["config"]);
  return a != null && YS(a), o;
}
function ZS(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], se(e, s));
  const i = r(t, ["contents"]);
  if (i != null) {
    let u = Ne(i);
    Array.isArray(u) && (u = u.map((c) => cn(c))), l(o, ["contents"], u);
  }
  const a = r(t, ["config"]);
  return a != null && XS(a, o), o;
}
function jS(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["totalTokens"]);
  s != null && l(n, ["totalTokens"], s);
  const i = r(e, ["cachedContentTokenCount"]);
  return i != null && l(n, ["cachedContentTokenCount"], i), n;
}
function eT(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["totalTokens"]);
  return s != null && l(n, ["totalTokens"], s), n;
}
function tT(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  return s != null && l(o, ["_url", "name"], se(e, s)), o;
}
function nT(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  return s != null && l(o, ["_url", "name"], se(e, s)), o;
}
function oT(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function sT(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function iT(e, t, n) {
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
  const b = r(e, ["labels"]);
  t !== void 0 && b != null && l(t, ["labels"], b);
  const A = r(e, ["editMode"]);
  t !== void 0 && A != null && l(t, ["parameters", "editMode"], A);
  const R = r(e, ["baseSteps"]);
  return t !== void 0 && R != null && l(t, [
    "parameters",
    "editConfig",
    "baseSteps"
  ], R), o;
}
function rT(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], se(e, s));
  const i = r(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = r(t, ["referenceImages"]);
  if (a != null) {
    let c = a;
    Array.isArray(c) && (c = c.map((d) => uE(d))), l(o, ["instances[0]", "referenceImages"], c);
  }
  const u = r(t, ["config"]);
  return u != null && iT(u, o), o;
}
function aT(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["predictions"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => Us(a))), l(n, ["generatedImages"], i);
  }
  return n;
}
function lT(e, t, n) {
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
function uT(e, t, n) {
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
function cT(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], se(e, s));
  const i = r(t, ["contents"]);
  if (i != null) {
    let d = jr(e, i);
    Array.isArray(d) && (d = d.map((p) => p)), l(o, ["requests[]", "content"], d);
  }
  const a = r(t, ["content"]);
  a != null && po(Se(a));
  const u = r(t, ["config"]);
  u != null && lT(u, o);
  const c = r(t, ["model"]);
  return c !== void 0 && l(o, ["requests[]", "model"], se(e, c)), o;
}
function dT(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], se(e, s));
  let i = r(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const c = r(t, ["contents"]);
    if (c != null) {
      let d = jr(e, c);
      Array.isArray(d) && (d = d.map((p) => p)), l(o, ["instances[]", "content"], d);
    }
  }
  let a = r(n, ["embeddingApiType"]);
  if (a === void 0 && (a = "PREDICT"), a === "EMBED_CONTENT") {
    const c = r(t, ["content"]);
    c != null && l(o, ["content"], cn(Se(c)));
  }
  const u = r(t, ["config"]);
  return u != null && uT(u, o, n), o;
}
function fT(e, t) {
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
function pT(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["predictions[]", "embeddings"]);
  if (s != null) {
    let a = s;
    Array.isArray(a) && (a = a.map((u) => WS(u))), l(n, ["embeddings"], a);
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
function hT(e, t) {
  const n = {}, o = r(e, ["endpoint"]);
  o != null && l(n, ["name"], o);
  const s = r(e, ["deployedModelId"]);
  return s != null && l(n, ["deployedModelId"], s), n;
}
function mT(e, t) {
  const n = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["fileUri"]);
  o != null && l(n, ["fileUri"], o);
  const s = r(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function gT(e, t) {
  const n = {}, o = r(e, ["id"]);
  o != null && l(n, ["id"], o);
  const s = r(e, ["args"]);
  s != null && l(n, ["args"], s);
  const i = r(e, ["name"]);
  if (i != null && l(n, ["name"], i), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function yT(e, t) {
  const n = {}, o = r(e, ["allowedFunctionNames"]);
  o != null && l(n, ["allowedFunctionNames"], o);
  const s = r(e, ["mode"]);
  if (s != null && l(n, ["mode"], s), r(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function _T(e, t) {
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
function vT(e, t, n, o) {
  const s = {}, i = r(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], po(Se(i)));
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
  const b = r(t, ["responseSchema"]);
  b != null && l(s, ["responseSchema"], ea(b));
  const A = r(t, ["responseJsonSchema"]);
  if (A != null && l(s, ["responseJsonSchema"], A), r(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (r(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const R = r(t, ["safetySettings"]);
  if (n !== void 0 && R != null) {
    let L = R;
    Array.isArray(L) && (L = L.map((V) => cE(V))), l(n, ["safetySettings"], L);
  }
  const $ = r(t, ["tools"]);
  if (n !== void 0 && $ != null) {
    let L = ln($);
    Array.isArray(L) && (L = L.map((V) => _E(an(V)))), l(n, ["tools"], L);
  }
  const w = r(t, ["toolConfig"]);
  if (n !== void 0 && w != null && l(n, ["toolConfig"], gE(w)), r(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const v = r(t, ["cachedContent"]);
  n !== void 0 && v != null && l(n, ["cachedContent"], ft(e, v));
  const I = r(t, ["responseModalities"]);
  I != null && l(s, ["responseModalities"], I);
  const P = r(t, ["mediaResolution"]);
  P != null && l(s, ["mediaResolution"], P);
  const U = r(t, ["speechConfig"]);
  if (U != null && l(s, ["speechConfig"], ta(U)), r(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const O = r(t, ["thinkingConfig"]);
  O != null && l(s, ["thinkingConfig"], O);
  const ne = r(t, ["imageConfig"]);
  ne != null && l(s, ["imageConfig"], WT(ne));
  const Z = r(t, ["enableEnhancedCivicAnswers"]);
  if (Z != null && l(s, ["enableEnhancedCivicAnswers"], Z), r(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const ee = r(t, ["serviceTier"]);
  return n !== void 0 && ee != null && l(n, ["serviceTier"], ee), s;
}
function ST(e, t, n, o) {
  const s = {}, i = r(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], cn(Se(i)));
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
  const b = r(t, ["responseSchema"]);
  b != null && l(s, ["responseSchema"], ea(b));
  const A = r(t, ["responseJsonSchema"]);
  A != null && l(s, ["responseJsonSchema"], A);
  const R = r(t, ["routingConfig"]);
  R != null && l(s, ["routingConfig"], R);
  const $ = r(t, ["modelSelectionConfig"]);
  $ != null && l(s, ["modelConfig"], $);
  const w = r(t, ["safetySettings"]);
  if (n !== void 0 && w != null) {
    let le = w;
    Array.isArray(le) && (le = le.map((Ge) => Ge)), l(n, ["safetySettings"], le);
  }
  const v = r(t, ["tools"]);
  if (n !== void 0 && v != null) {
    let le = ln(v);
    Array.isArray(le) && (le = le.map((Ge) => Cp(an(Ge)))), l(n, ["tools"], le);
  }
  const I = r(t, ["toolConfig"]);
  n !== void 0 && I != null && l(n, ["toolConfig"], yE(I));
  const P = r(t, ["labels"]);
  n !== void 0 && P != null && l(n, ["labels"], P);
  const U = r(t, ["cachedContent"]);
  n !== void 0 && U != null && l(n, ["cachedContent"], ft(e, U));
  const O = r(t, ["responseModalities"]);
  O != null && l(s, ["responseModalities"], O);
  const ne = r(t, ["mediaResolution"]);
  ne != null && l(s, ["mediaResolution"], ne);
  const Z = r(t, ["speechConfig"]);
  Z != null && l(s, ["speechConfig"], ta(Z));
  const ee = r(t, ["audioTimestamp"]);
  ee != null && l(s, ["audioTimestamp"], ee);
  const L = r(t, ["thinkingConfig"]);
  L != null && l(s, ["thinkingConfig"], L);
  const V = r(t, ["imageConfig"]);
  if (V != null && l(s, ["imageConfig"], KT(V)), r(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const K = r(t, ["modelArmorConfig"]);
  n !== void 0 && K != null && l(n, ["modelArmorConfig"], K);
  const ie = r(t, ["serviceTier"]);
  return n !== void 0 && ie != null && l(n, ["serviceTier"], ie), s;
}
function ec(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], se(e, s));
  const i = r(t, ["contents"]);
  if (i != null) {
    let u = Ne(i);
    Array.isArray(u) && (u = u.map((c) => po(c))), l(o, ["contents"], u);
  }
  const a = r(t, ["config"]);
  return a != null && l(o, ["generationConfig"], vT(e, a, o)), o;
}
function tc(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], se(e, s));
  const i = r(t, ["contents"]);
  if (i != null) {
    let u = Ne(i);
    Array.isArray(u) && (u = u.map((c) => cn(c))), l(o, ["contents"], u);
  }
  const a = r(t, ["config"]);
  return a != null && l(o, ["generationConfig"], ST(e, a, o)), o;
}
function nc(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["candidates"]);
  if (s != null) {
    let p = s;
    Array.isArray(p) && (p = p.map((f) => OS(f))), l(n, ["candidates"], p);
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
function oc(e, t) {
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
function TT(e, t, n) {
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
function ET(e, t, n) {
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
  const b = r(e, ["labels"]);
  t !== void 0 && b != null && l(t, ["labels"], b);
  const A = r(e, ["imageSize"]);
  t !== void 0 && A != null && l(t, ["parameters", "sampleImageSize"], A);
  const R = r(e, ["enhancePrompt"]);
  return t !== void 0 && R != null && l(t, ["parameters", "enhancePrompt"], R), o;
}
function bT(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], se(e, s));
  const i = r(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = r(t, ["config"]);
  return a != null && TT(a, o), o;
}
function wT(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], se(e, s));
  const i = r(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = r(t, ["config"]);
  return a != null && ET(a, o), o;
}
function AT(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["predictions"]);
  if (s != null) {
    let a = s;
    Array.isArray(a) && (a = a.map((u) => UT(u))), l(n, ["generatedImages"], a);
  }
  const i = r(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], wp(i)), n;
}
function CT(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["predictions"]);
  if (s != null) {
    let a = s;
    Array.isArray(a) && (a = a.map((u) => Us(u))), l(n, ["generatedImages"], a);
  }
  const i = r(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], Ap(i)), n;
}
function IT(e, t, n) {
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
  t !== void 0 && f != null && l(t, ["instances[0]", "lastFrame"], Fs(f));
  const h = r(e, ["referenceImages"]);
  if (t !== void 0 && h != null) {
    let g = h;
    Array.isArray(g) && (g = g.map((y) => ME(y))), l(t, ["instances[0]", "referenceImages"], g);
  }
  if (r(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (r(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (r(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = r(e, ["webhookConfig"]);
  return t !== void 0 && m != null && l(t, ["webhookConfig"], m), o;
}
function xT(e, t, n) {
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
  t !== void 0 && _ != null && l(t, ["instances[0]", "lastFrame"], je(_));
  const S = r(e, ["referenceImages"]);
  if (t !== void 0 && S != null) {
    let $ = S;
    Array.isArray($) && ($ = $.map((w) => NE(w))), l(t, ["instances[0]", "referenceImages"], $);
  }
  const b = r(e, ["mask"]);
  t !== void 0 && b != null && l(t, ["instances[0]", "mask"], PE(b));
  const A = r(e, ["compressionQuality"]);
  t !== void 0 && A != null && l(t, ["parameters", "compressionQuality"], A);
  const R = r(e, ["labels"]);
  if (t !== void 0 && R != null && l(t, ["labels"], R), r(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return o;
}
function RT(e, t) {
  const n = {}, o = r(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = r(e, ["metadata"]);
  s != null && l(n, ["metadata"], s);
  const i = r(e, ["done"]);
  i != null && l(n, ["done"], i);
  const a = r(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = r(e, ["response", "generateVideoResponse"]);
  return u != null && l(n, ["response"], kT(u)), n;
}
function PT(e, t) {
  const n = {}, o = r(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = r(e, ["metadata"]);
  s != null && l(n, ["metadata"], s);
  const i = r(e, ["done"]);
  i != null && l(n, ["done"], i);
  const a = r(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = r(e, ["response"]);
  return u != null && l(n, ["response"], LT(u)), n;
}
function MT(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], se(e, s));
  const i = r(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = r(t, ["image"]);
  a != null && l(o, ["instances[0]", "image"], Fs(a));
  const u = r(t, ["video"]);
  u != null && l(o, ["instances[0]", "video"], Ip(u));
  const c = r(t, ["source"]);
  c != null && DT(c, o);
  const d = r(t, ["config"]);
  return d != null && IT(d, o), o;
}
function NT(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], se(e, s));
  const i = r(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = r(t, ["image"]);
  a != null && l(o, ["instances[0]", "image"], je(a));
  const u = r(t, ["video"]);
  u != null && l(o, ["instances[0]", "video"], xp(u));
  const c = r(t, ["source"]);
  c != null && $T(c, o);
  const d = r(t, ["config"]);
  return d != null && xT(d, o), o;
}
function kT(e, t) {
  const n = {}, o = r(e, ["generatedSamples"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => BT(u))), l(n, ["generatedVideos"], a);
  }
  const s = r(e, ["raiMediaFilteredCount"]);
  s != null && l(n, ["raiMediaFilteredCount"], s);
  const i = r(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function LT(e, t) {
  const n = {}, o = r(e, ["videos"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => GT(u))), l(n, ["generatedVideos"], a);
  }
  const s = r(e, ["raiMediaFilteredCount"]);
  s != null && l(n, ["raiMediaFilteredCount"], s);
  const i = r(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function DT(e, t, n) {
  const o = {}, s = r(e, ["prompt"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "prompt"], s);
  const i = r(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Fs(i));
  const a = r(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], Ip(a)), o;
}
function $T(e, t, n) {
  const o = {}, s = r(e, ["prompt"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "prompt"], s);
  const i = r(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], je(i));
  const a = r(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], xp(a)), o;
}
function UT(e, t) {
  const n = {}, o = r(e, ["_self"]);
  o != null && l(n, ["image"], zT(o));
  const s = r(e, ["raiFilteredReason"]);
  s != null && l(n, ["raiFilteredReason"], s);
  const i = r(e, ["_self"]);
  return i != null && l(n, ["safetyAttributes"], wp(i)), n;
}
function Us(e, t) {
  const n = {}, o = r(e, ["_self"]);
  o != null && l(n, ["image"], bp(o));
  const s = r(e, ["raiFilteredReason"]);
  s != null && l(n, ["raiFilteredReason"], s);
  const i = r(e, ["_self"]);
  i != null && l(n, ["safetyAttributes"], Ap(i));
  const a = r(e, ["prompt"]);
  return a != null && l(n, ["enhancedPrompt"], a), n;
}
function FT(e, t) {
  const n = {}, o = r(e, ["_self"]);
  o != null && l(n, ["mask"], bp(o));
  const s = r(e, ["labels"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => a)), l(n, ["labels"], i);
  }
  return n;
}
function BT(e, t) {
  const n = {}, o = r(e, ["video"]);
  return o != null && l(n, ["video"], xE(o)), n;
}
function GT(e, t) {
  const n = {}, o = r(e, ["_self"]);
  return o != null && l(n, ["video"], RE(o)), n;
}
function qT(e, t) {
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
  const b = r(e, ["seed"]);
  b != null && l(n, ["seed"], b);
  const A = r(e, ["speechConfig"]);
  A != null && l(n, ["speechConfig"], A);
  const R = r(e, ["stopSequences"]);
  R != null && l(n, ["stopSequences"], R);
  const $ = r(e, ["temperature"]);
  $ != null && l(n, ["temperature"], $);
  const w = r(e, ["thinkingConfig"]);
  w != null && l(n, ["thinkingConfig"], w);
  const v = r(e, ["topK"]);
  v != null && l(n, ["topK"], v);
  const I = r(e, ["topP"]);
  if (I != null && l(n, ["topP"], I), r(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return n;
}
function OT(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  return s != null && l(o, ["_url", "name"], se(e, s)), o;
}
function VT(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  return s != null && l(o, ["_url", "name"], se(e, s)), o;
}
function HT(e, t) {
  const n = {}, o = r(e, ["authConfig"]);
  o != null && l(n, ["authConfig"], GS(o));
  const s = r(e, ["enableWidget"]);
  return s != null && l(n, ["enableWidget"], s), n;
}
function JT(e, t) {
  const n = {}, o = r(e, ["searchTypes"]);
  if (o != null && l(n, ["searchTypes"], o), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const s = r(e, ["timeRangeFilter"]);
  return s != null && l(n, ["timeRangeFilter"], s), n;
}
function WT(e, t) {
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
function KT(e, t) {
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
function zT(e, t) {
  const n = {}, o = r(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["imageBytes"], bt(o));
  const s = r(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function bp(e, t) {
  const n = {}, o = r(e, ["gcsUri"]);
  o != null && l(n, ["gcsUri"], o);
  const s = r(e, ["bytesBase64Encoded"]);
  s != null && l(n, ["imageBytes"], bt(s));
  const i = r(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function Fs(e, t) {
  const n = {};
  if (r(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  const o = r(e, ["imageBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], bt(o));
  const s = r(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function je(e, t) {
  const n = {}, o = r(e, ["gcsUri"]);
  o != null && l(n, ["gcsUri"], o);
  const s = r(e, ["imageBytes"]);
  s != null && l(n, ["bytesBase64Encoded"], bt(s));
  const i = r(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function YT(e, t, n, o) {
  const s = {}, i = r(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const a = r(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = r(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = r(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], hp(e, c)), s;
}
function XT(e, t, n, o) {
  const s = {}, i = r(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const a = r(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = r(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = r(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], hp(e, c)), s;
}
function QT(e, t, n) {
  const o = {}, s = r(t, ["config"]);
  return s != null && YT(e, s, o), o;
}
function ZT(e, t, n) {
  const o = {}, s = r(t, ["config"]);
  return s != null && XT(e, s, o), o;
}
function jT(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["nextPageToken"]);
  s != null && l(n, ["nextPageToken"], s);
  const i = r(e, ["_self"]);
  if (i != null) {
    let a = mp(i);
    Array.isArray(a) && (a = a.map((u) => lr(u))), l(n, ["models"], a);
  }
  return n;
}
function eE(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["nextPageToken"]);
  s != null && l(n, ["nextPageToken"], s);
  const i = r(e, ["_self"]);
  if (i != null) {
    let a = mp(i);
    Array.isArray(a) && (a = a.map((u) => ur(u))), l(n, ["models"], a);
  }
  return n;
}
function tE(e, t) {
  const n = {}, o = r(e, ["maskMode"]);
  o != null && l(n, ["maskMode"], o);
  const s = r(e, ["segmentationClasses"]);
  s != null && l(n, ["maskClasses"], s);
  const i = r(e, ["maskDilation"]);
  return i != null && l(n, ["dilation"], i), n;
}
function lr(e, t) {
  const n = {}, o = r(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = r(e, ["displayName"]);
  s != null && l(n, ["displayName"], s);
  const i = r(e, ["description"]);
  i != null && l(n, ["description"], i);
  const a = r(e, ["version"]);
  a != null && l(n, ["version"], a);
  const u = r(e, ["_self"]);
  u != null && l(n, ["tunedModelInfo"], vE(u));
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
function ur(e, t) {
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
    Array.isArray(h) && (h = h.map((m) => hT(m))), l(n, ["endpoints"], h);
  }
  const c = r(e, ["labels"]);
  c != null && l(n, ["labels"], c);
  const d = r(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], SE(d));
  const p = r(e, ["defaultCheckpointId"]);
  p != null && l(n, ["defaultCheckpointId"], p);
  const f = r(e, ["checkpoints"]);
  if (f != null) {
    let h = f;
    Array.isArray(h) && (h = h.map((m) => m)), l(n, ["checkpoints"], h);
  }
  return n;
}
function nE(e, t) {
  const n = {}, o = r(e, ["mediaResolution"]);
  o != null && l(n, ["mediaResolution"], o);
  const s = r(e, ["codeExecutionResult"]);
  s != null && l(n, ["codeExecutionResult"], s);
  const i = r(e, ["executableCode"]);
  i != null && l(n, ["executableCode"], i);
  const a = r(e, ["fileData"]);
  a != null && l(n, ["fileData"], mT(a));
  const u = r(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], gT(u));
  const c = r(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = r(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], qS(d));
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
function oE(e, t) {
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
function sE(e, t) {
  const n = {}, o = r(e, ["productImage"]);
  return o != null && l(n, ["image"], je(o)), n;
}
function iE(e, t, n) {
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
function rE(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], se(e, s));
  const i = r(t, ["source"]);
  i != null && lE(i, o);
  const a = r(t, ["config"]);
  return a != null && iE(a, o), o;
}
function aE(e, t) {
  const n = {}, o = r(e, ["predictions"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((i) => Us(i))), l(n, ["generatedImages"], s);
  }
  return n;
}
function lE(e, t, n) {
  const o = {}, s = r(e, ["prompt"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "prompt"], s);
  const i = r(e, ["personImage"]);
  t !== void 0 && i != null && l(t, [
    "instances[0]",
    "personImage",
    "image"
  ], je(i));
  const a = r(e, ["productImages"]);
  if (t !== void 0 && a != null) {
    let u = a;
    Array.isArray(u) && (u = u.map((c) => sE(c))), l(t, ["instances[0]", "productImages"], u);
  }
  return o;
}
function uE(e, t) {
  const n = {}, o = r(e, ["referenceImage"]);
  o != null && l(n, ["referenceImage"], je(o));
  const s = r(e, ["referenceId"]);
  s != null && l(n, ["referenceId"], s);
  const i = r(e, ["referenceType"]);
  i != null && l(n, ["referenceType"], i);
  const a = r(e, ["maskImageConfig"]);
  a != null && l(n, ["maskImageConfig"], tE(a));
  const u = r(e, ["controlImageConfig"]);
  u != null && l(n, ["controlImageConfig"], zS(u));
  const c = r(e, ["styleImageConfig"]);
  c != null && l(n, ["styleImageConfig"], c);
  const d = r(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function wp(e, t) {
  const n = {}, o = r(e, ["safetyAttributes", "categories"]);
  o != null && l(n, ["categories"], o);
  const s = r(e, ["safetyAttributes", "scores"]);
  s != null && l(n, ["scores"], s);
  const i = r(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function Ap(e, t) {
  const n = {}, o = r(e, ["safetyAttributes", "categories"]);
  o != null && l(n, ["categories"], o);
  const s = r(e, ["safetyAttributes", "scores"]);
  s != null && l(n, ["scores"], s);
  const i = r(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function cE(e, t) {
  const n = {}, o = r(e, ["category"]);
  if (o != null && l(n, ["category"], o), r(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const s = r(e, ["threshold"]);
  return s != null && l(n, ["threshold"], s), n;
}
function dE(e, t) {
  const n = {}, o = r(e, ["image"]);
  return o != null && l(n, ["image"], je(o)), n;
}
function fE(e, t, n) {
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
function pE(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], se(e, s));
  const i = r(t, ["source"]);
  i != null && mE(i, o);
  const a = r(t, ["config"]);
  return a != null && fE(a, o), o;
}
function hE(e, t) {
  const n = {}, o = r(e, ["predictions"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((i) => FT(i))), l(n, ["generatedMasks"], s);
  }
  return n;
}
function mE(e, t, n) {
  const o = {}, s = r(e, ["prompt"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "prompt"], s);
  const i = r(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], je(i));
  const a = r(e, ["scribbleImage"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "scribble"], dE(a)), o;
}
function gE(e, t) {
  const n = {}, o = r(e, ["retrievalConfig"]);
  o != null && l(n, ["retrievalConfig"], o);
  const s = r(e, ["functionCallingConfig"]);
  s != null && l(n, ["functionCallingConfig"], yT(s));
  const i = r(e, ["includeServerSideToolInvocations"]);
  return i != null && l(n, ["includeServerSideToolInvocations"], i), n;
}
function yE(e, t) {
  const n = {}, o = r(e, ["retrievalConfig"]);
  o != null && l(n, ["retrievalConfig"], o);
  const s = r(e, ["functionCallingConfig"]);
  if (s != null && l(n, ["functionCallingConfig"], s), r(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function _E(e, t) {
  const n = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const o = r(e, ["computerUse"]);
  o != null && l(n, ["computerUse"], o);
  const s = r(e, ["fileSearch"]);
  s != null && l(n, ["fileSearch"], s);
  const i = r(e, ["googleSearch"]);
  i != null && l(n, ["googleSearch"], JT(i));
  const a = r(e, ["googleMaps"]);
  a != null && l(n, ["googleMaps"], HT(a));
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
function Cp(e, t) {
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
    Array.isArray(m) && (m = m.map((g) => _T(g))), l(n, ["functionDeclarations"], m);
  }
  const p = r(e, ["googleSearchRetrieval"]);
  p != null && l(n, ["googleSearchRetrieval"], p);
  const f = r(e, ["parallelAiSearch"]);
  f != null && l(n, ["parallelAiSearch"], f);
  const h = r(e, ["urlContext"]);
  if (h != null && l(n, ["urlContext"], h), r(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function vE(e, t) {
  const n = {}, o = r(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const s = r(e, ["createTime"]);
  s != null && l(n, ["createTime"], s);
  const i = r(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function SE(e, t) {
  const n = {}, o = r(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  o != null && l(n, ["baseModel"], o);
  const s = r(e, ["createTime"]);
  s != null && l(n, ["createTime"], s);
  const i = r(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function TE(e, t, n) {
  const o = {}, s = r(e, ["displayName"]);
  t !== void 0 && s != null && l(t, ["displayName"], s);
  const i = r(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const a = r(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), o;
}
function EE(e, t, n) {
  const o = {}, s = r(e, ["displayName"]);
  t !== void 0 && s != null && l(t, ["displayName"], s);
  const i = r(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const a = r(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), o;
}
function bE(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "name"], se(e, s));
  const i = r(t, ["config"]);
  return i != null && TE(i, o), o;
}
function wE(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], se(e, s));
  const i = r(t, ["config"]);
  return i != null && EE(i, o), o;
}
function AE(e, t, n) {
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
function CE(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], se(e, s));
  const i = r(t, ["image"]);
  i != null && l(o, ["instances[0]", "image"], je(i));
  const a = r(t, ["upscaleFactor"]);
  a != null && l(o, [
    "parameters",
    "upscaleConfig",
    "upscaleFactor"
  ], a);
  const u = r(t, ["config"]);
  return u != null && AE(u, o), o;
}
function IE(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["predictions"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => Us(a))), l(n, ["generatedImages"], i);
  }
  return n;
}
function xE(e, t) {
  const n = {}, o = r(e, ["uri"]);
  o != null && l(n, ["uri"], o);
  const s = r(e, ["encodedVideo"]);
  s != null && l(n, ["videoBytes"], bt(s));
  const i = r(e, ["encoding"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function RE(e, t) {
  const n = {}, o = r(e, ["gcsUri"]);
  o != null && l(n, ["uri"], o);
  const s = r(e, ["bytesBase64Encoded"]);
  s != null && l(n, ["videoBytes"], bt(s));
  const i = r(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function PE(e, t) {
  const n = {}, o = r(e, ["image"]);
  o != null && l(n, ["_self"], je(o));
  const s = r(e, ["maskMode"]);
  return s != null && l(n, ["maskMode"], s), n;
}
function ME(e, t) {
  const n = {}, o = r(e, ["image"]);
  o != null && l(n, ["image"], Fs(o));
  const s = r(e, ["referenceType"]);
  return s != null && l(n, ["referenceType"], s), n;
}
function NE(e, t) {
  const n = {}, o = r(e, ["image"]);
  o != null && l(n, ["image"], je(o));
  const s = r(e, ["referenceType"]);
  return s != null && l(n, ["referenceType"], s), n;
}
function Ip(e, t) {
  const n = {}, o = r(e, ["uri"]);
  o != null && l(n, ["uri"], o);
  const s = r(e, ["videoBytes"]);
  s != null && l(n, ["encodedVideo"], bt(s));
  const i = r(e, ["mimeType"]);
  return i != null && l(n, ["encoding"], i), n;
}
function xp(e, t) {
  const n = {}, o = r(e, ["uri"]);
  o != null && l(n, ["gcsUri"], o);
  const s = r(e, ["videoBytes"]);
  s != null && l(n, ["bytesBase64Encoded"], bt(s));
  const i = r(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function kE(e, t) {
  const n = {}, o = r(e, ["displayName"]);
  return t !== void 0 && o != null && l(t, ["displayName"], o), n;
}
function LE(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && kE(n, t), t;
}
function DE(e, t) {
  const n = {}, o = r(e, ["force"]);
  return t !== void 0 && o != null && l(t, ["_query", "force"], o), n;
}
function $E(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const o = r(e, ["config"]);
  return o != null && DE(o, t), t;
}
function UE(e) {
  const t = {}, n = r(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function FE(e, t) {
  const n = {}, o = r(e, ["customMetadata"]);
  if (t !== void 0 && o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["customMetadata"], i);
  }
  const s = r(e, ["chunkingConfig"]);
  return t !== void 0 && s != null && l(t, ["chunkingConfig"], s), n;
}
function BE(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = r(e, ["response"]);
  return a != null && l(t, ["response"], qE(a)), t;
}
function GE(e) {
  const t = {}, n = r(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const o = r(e, ["fileName"]);
  o != null && l(t, ["fileName"], o);
  const s = r(e, ["config"]);
  return s != null && FE(s, t), t;
}
function qE(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const s = r(e, ["documentName"]);
  return s != null && l(t, ["documentName"], s), t;
}
function OE(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function VE(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && OE(n, t), t;
}
function HE(e) {
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
function Rp(e, t) {
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
function JE(e) {
  const t = {}, n = r(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const o = r(e, ["config"]);
  return o != null && Rp(o, t), t;
}
function WE(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var KE = "Content-Type", zE = "X-Server-Timeout", YE = "User-Agent", cr = "x-goog-api-client", XE = "google-genai-sdk/1.50.1", QE = "v1beta1", ZE = "v1beta", jE = /* @__PURE__ */ new Set(["us", "eu"]), eb = 5, tb = [
  408,
  429,
  500,
  502,
  503,
  504
], nb = class {
  constructor(e) {
    var t, n, o;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const s = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const i = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !i ? (s.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? s.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && jE.has(this.clientOptions.location) ? s.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (s.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), s.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : QE;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), s.apiVersion = (o = this.clientOptions.apiVersion) !== null && o !== void 0 ? o : ZE, s.baseUrl = "https://generativelanguage.googleapis.com/";
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
    return !(t.baseUrl && t.baseUrlResourceScope === sr.COLLECTION || this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
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
    return t && t.extraBody !== null && ob(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await sc(o), new ir(o))).catch((o) => {
      throw o instanceof Error ? o : new Error(JSON.stringify(o));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await sc(o), this.processStreamResponse(o))).catch((o) => {
      throw o instanceof Error ? o : new Error(JSON.stringify(o));
    });
  }
  processStreamResponse(e) {
    return Qe(this, arguments, function* () {
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
          const { done: c, value: d } = yield Q(o.read());
          if (c) {
            if (i.trim().length > 0) throw new Error("Incomplete JSON segment at the end");
            break;
          }
          const p = s.decode(d, { stream: !0 });
          try {
            const m = JSON.parse(p);
            if ("error" in m) {
              const g = JSON.parse(JSON.stringify(m.error)), y = g.status, _ = g.code, S = `got status: ${y}. ${JSON.stringify(m)}`;
              if (_ >= 400 && _ < 600) throw new Tp({
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
                yield yield Q(new ir(new Response(y, {
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
      throw tb.includes(i.status) ? new Error(`Retryable HTTP Error: ${i.statusText}`) : new Pl.AbortError(`Non-retryable exception ${i.statusText} sending request`);
    };
    return (0, Pl.default)(s, { retries: ((n = o.attempts) !== null && n !== void 0 ? n : eb) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = XE + " " + this.clientOptions.userAgentExtra;
    return e[YE] = t, e[cr] = t, e[KE] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [o, s] of Object.entries(e.headers)) n.append(o, s);
      e.timeout && e.timeout > 0 && n.append(zE, String(Math.ceil(e.timeout / 1e3)));
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
    const u = { file: o }, c = this.getFileName(e), d = F("upload/v1beta/files", u._url), p = await this.fetchUploadUrl(d, o.sizeBytes, o.mimeType, c, u, t?.httpOptions);
    return s.upload(e, p, this);
  }
  async uploadFileToFileSearchStore(e, t, n) {
    var o;
    const s = this.clientOptions.uploader, i = await s.stat(t), a = String(i.size), u = (o = n?.mimeType) !== null && o !== void 0 ? o : i.type;
    if (u === void 0 || u === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    const c = `upload/v1beta/${e}:uploadToFileSearchStore`, d = this.getFileName(t), p = {};
    n != null && Rp(n, p);
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
async function sc(e) {
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
    throw n >= 400 && n < 600 ? new Tp({
      message: s,
      status: n
    }) : new Error(s);
  }
}
function ob(e, t) {
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
var sb = "mcp_used/unknown", ib = !1;
function Pp(e) {
  for (const t of e)
    if (rb(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return ib;
}
function Mp(e) {
  var t;
  e[cr] = (((t = e[cr]) !== null && t !== void 0 ? t : "") + ` ${sb}`).trimStart();
}
function rb(e) {
  return e !== null && typeof e == "object" && e instanceof lb;
}
function ab(e) {
  return Qe(this, arguments, function* (n, o = 100) {
    let s, i = 0;
    for (; i < o; ) {
      const a = yield Q(n.listTools({ cursor: s }));
      for (const u of a.tools)
        yield yield Q(u), i++;
      if (!a.nextCursor) break;
      s = a.nextCursor;
    }
  });
}
var lb = class Np {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new Np(t, n);
  }
  async initialize() {
    var t, n, o, s;
    if (this.mcpTools.length > 0) return;
    const i = {}, a = [];
    for (const p of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, Ze(ab(p))), d; d = await c.next(), t = d.done, !t; u = !0) {
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
    return await this.initialize(), E_(this.mcpTools, this.config);
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
async function ub(e, t, n) {
  const o = new p_();
  let s;
  n.data instanceof Blob ? s = JSON.parse(await n.data.text()) : s = JSON.parse(n.data), Object.assign(o, s), t(o);
}
var cb = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const o = this.apiClient.getWebsocketBaseUrl(), s = this.apiClient.getApiVersion(), i = pb(this.apiClient.getDefaultHeaders()), a = `${o}/ws/google.ai.generativelanguage.${s}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((y) => {
      u = y;
    }), d = e.callbacks, p = function() {
      u({});
    }, f = this.apiClient, h = {
      onopen: p,
      onmessage: (y) => {
        ub(f, d.onmessage, y);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(y) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(y) {
      }
    }, m = this.webSocketFactory.create(a, fb(i), h);
    m.connect(), await c;
    const g = { setup: { model: se(this.apiClient, e.model) } };
    return m.send(JSON.stringify(g)), new db(m, this.apiClient);
  }
}, db = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = xS(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = IS(e);
    this.conn.send(JSON.stringify(t));
  }
  sendPlaybackControl(e) {
    const t = { playbackControl: e };
    this.conn.send(JSON.stringify(t));
  }
  play() {
    this.sendPlaybackControl(Zt.PLAY);
  }
  pause() {
    this.sendPlaybackControl(Zt.PAUSE);
  }
  stop() {
    this.sendPlaybackControl(Zt.STOP);
  }
  resetContext() {
    this.sendPlaybackControl(Zt.RESET_CONTEXT);
  }
  close() {
    this.conn.close();
  }
};
function fb(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function pb(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var hb = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function mb(e, t, n) {
  const o = new f_();
  let s;
  n.data instanceof Blob ? s = await n.data.text() : n.data instanceof ArrayBuffer ? s = new TextDecoder().decode(n.data) : s = n.data;
  const i = JSON.parse(s);
  if (e.isVertexAI()) {
    const a = MS(i);
    Object.assign(o, a);
  } else Object.assign(o, i);
  t(o);
}
var gb = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new cb(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, o, s, i, a;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const p = this.apiClient.getHeaders();
    e.config && e.config.tools && Pp(e.config.tools) && Mp(p);
    const f = Sb(p);
    if (this.apiClient.isVertexAI()) {
      const I = this.apiClient.getProject(), P = this.apiClient.getLocation(), U = this.apiClient.getApiKey(), O = !!I && !!P || !!U;
      this.apiClient.getCustomBaseUrl() && !O ? d = u : (d = `${u}/ws/google.cloud.aiplatform.${c}.LlmBidiService/BidiGenerateContent`, await this.auth.addAuthHeaders(f, d));
    } else {
      const I = this.apiClient.getApiKey();
      let P = "BidiGenerateContent", U = "key";
      I?.startsWith("auth_tokens/") && (console.warn("Warning: Ephemeral token support is experimental and may change in future versions."), c !== "v1alpha" && console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection."), P = "BidiGenerateContentConstrained", U = "access_token"), d = `${u}/ws/google.ai.generativelanguage.${c}.GenerativeService.${P}?${U}=${I}`;
    }
    let h = () => {
    };
    const m = new Promise((I) => {
      h = I;
    }), g = e.callbacks, y = function() {
      var I;
      (I = g?.onopen) === null || I === void 0 || I.call(g), h({});
    }, _ = this.apiClient, S = {
      onopen: y,
      onmessage: (I) => {
        mb(_, g.onmessage, I);
      },
      onerror: (t = g?.onerror) !== null && t !== void 0 ? t : function(I) {
      },
      onclose: (n = g?.onclose) !== null && n !== void 0 ? n : function(I) {
      }
    }, b = this.webSocketFactory.create(d, vb(f), S);
    b.connect(), await m;
    let A = se(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && A.startsWith("publishers/")) {
      const I = this.apiClient.getProject(), P = this.apiClient.getLocation();
      I && P && (A = `projects/${I}/locations/${P}/` + A);
    }
    let R = {};
    this.apiClient.isVertexAI() && ((o = e.config) === null || o === void 0 ? void 0 : o.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [ys.AUDIO] } : e.config.responseModalities = [ys.AUDIO]), !((s = e.config) === null || s === void 0) && s.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    const $ = (a = (i = e.config) === null || i === void 0 ? void 0 : i.tools) !== null && a !== void 0 ? a : [], w = [];
    for (const I of $) if (this.isCallableTool(I)) {
      const P = I;
      w.push(await P.tool());
    } else w.push(I);
    w.length > 0 && (e.config.tools = w);
    const v = {
      model: A,
      config: e.config,
      callbacks: e.callbacks
    };
    return this.apiClient.isVertexAI() ? R = CS(this.apiClient, v) : R = AS(this.apiClient, v), delete R.config, b.send(JSON.stringify(R)), new _b(b, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, yb = { turnComplete: !0 }, _b = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let n = [];
      try {
        n = Ne(t.turns), e.isVertexAI() || (n = n.map((o) => po(o)));
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
      if (!e.isVertexAI() && !("id" in o)) throw new Error(hb);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, yb), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: PS(e) } : t = { realtimeInput: RS(e) }, this.conn.send(JSON.stringify(t));
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
function vb(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function Sb(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var ic = 10;
function rc(e) {
  var t, n, o;
  if (!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.disable) return !0;
  let s = !1;
  for (const a of (n = e?.tools) !== null && n !== void 0 ? n : []) if (on(a)) {
    s = !0;
    break;
  }
  if (!s) return !0;
  const i = (o = e?.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls;
  return i && (i < 0 || !Number.isInteger(i)) || i == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", i), !0) : !1;
}
function on(e) {
  return "callTool" in e && typeof e.callTool == "function";
}
function Tb(e) {
  var t, n, o;
  return (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((s) => on(s))) !== null && o !== void 0 ? o : !1;
}
function ac(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((o, s) => {
    if (on(o)) return;
    const i = o;
    i.functionDeclarations && i.functionDeclarations.length > 0 && n.push(s);
  }), n;
}
function lc(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var Eb = class extends dt {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = Ne(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = Ne(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const o = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: _s.EMBED_CONTENT
        });
        return await this.embedContentInternal(o);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: _s.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, o, s, i, a;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !Tb(t) || rc(t.config)) return await this.generateContentInternal(u);
      const c = ac(t);
      if (c.length > 0) {
        const g = c.map((y) => `tools[${y}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${g}.`);
      }
      let d, p;
      const f = Ne(u.contents), h = (s = (o = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls) !== null && s !== void 0 ? s : ic;
      let m = 0;
      for (; m < h && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const g = d.candidates[0].content, y = [];
        for (const _ of (a = (i = t.config) === null || i === void 0 ? void 0 : i.tools) !== null && a !== void 0 ? a : []) if (on(_)) {
          const S = await _.callTool(d.functionCalls);
          y.push(...S);
        }
        m++, p = {
          role: "user",
          parts: y
        }, u.contents = Ne(u.contents), u.contents.push(g), u.contents.push(p), lc(u.config) && (f.push(g), f.push(p));
      }
      return lc(u.config) && (d.automaticFunctionCallingHistory = f), d;
    }, this.generateContentStream = async (t) => {
      var n, o, s, i, a;
      if (this.maybeMoveToResponseJsonSchem(t), rc(t.config)) {
        const p = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(p);
      }
      const u = ac(t);
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
      return new Ut(ct.PAGED_ITEM_MODELS, (s) => this.listInternal(s), await this.listInternal(o), o);
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
    const i = await Promise.all(s.map(async (u) => on(u) ? await u.tool() : u)), a = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: i })
    };
    if (a.config.tools = i, e.config && e.config.tools && Pp(e.config.tools)) {
      const u = (o = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && o !== void 0 ? o : {};
      let c = Object.assign({}, u);
      Object.keys(c).length === 0 && (c = this.apiClient.getDefaultHeaders()), Mp(c), a.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: c });
    }
    return a;
  }
  async initAfcToolsMap(e) {
    var t, n, o;
    const s = /* @__PURE__ */ new Map();
    for (const i of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (on(i)) {
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
    const s = (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && o !== void 0 ? o : ic;
    let i = !1, a = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, p) {
      return Qe(this, arguments, function* () {
        for (var f, h, m, g, y, _; a < s; ) {
          i && (a++, i = !1);
          const R = yield Q(c.processParamsMaybeAddMcpUsage(p)), $ = yield Q(c.generateContentStreamInternal(R)), w = [], v = [];
          try {
            for (var S = !0, b = (h = void 0, Ze($)), A; A = yield Q(b.next()), f = A.done, !f; S = !0) {
              g = A.value, S = !1;
              const I = g;
              if (yield yield Q(I), I.candidates && (!((y = I.candidates[0]) === null || y === void 0) && y.content)) {
                v.push(I.candidates[0].content);
                for (const P of (_ = I.candidates[0].content.parts) !== null && _ !== void 0 ? _ : []) if (a < s && P.functionCall) {
                  if (!P.functionCall.name) throw new Error("Function call name was not returned by the model.");
                  if (d.has(P.functionCall.name)) {
                    const U = yield Q(d.get(P.functionCall.name).callTool([P.functionCall]));
                    w.push(...U);
                  } else
                    throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${d.keys()}, mising tool: ${P.functionCall.name}`);
                }
              }
            }
          } catch (I) {
            h = { error: I };
          } finally {
            try {
              !S && !f && (m = b.return) && (yield Q(m.call(b)));
            } finally {
              if (h) throw h.error;
            }
          }
          if (w.length > 0) {
            i = !0;
            const I = new Pn();
            I.candidates = [{ content: {
              role: "user",
              parts: w
            } }], yield yield Q(I);
            const P = [];
            P.push(...v), P.push({
              role: "user",
              parts: w
            }), p.contents = Ne(p.contents).concat(P);
          } else break;
        }
      });
    })(this, u, e);
  }
  async generateContentInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = tc(this.apiClient, e);
      return a = F("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = oc(d), f = new Pn();
        return Object.assign(f, p), f;
      });
    } else {
      const c = ec(this.apiClient, e);
      return a = F("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = nc(d), f = new Pn();
        return Object.assign(f, p), f;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = tc(this.apiClient, e);
      return a = F("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }), i.then(function(d) {
        return Qe(this, arguments, function* () {
          var p, f, h, m;
          try {
            for (var g = !0, y = Ze(d), _; _ = yield Q(y.next()), p = _.done, !p; g = !0) {
              m = _.value, g = !1;
              const S = m, b = oc(yield Q(S.json()), e);
              b.sdkHttpResponse = { headers: S.headers };
              const A = new Pn();
              Object.assign(A, b), yield yield Q(A);
            }
          } catch (S) {
            f = { error: S };
          } finally {
            try {
              !g && !p && (h = y.return) && (yield Q(h.call(y)));
            } finally {
              if (f) throw f.error;
            }
          }
        });
      });
    } else {
      const c = ec(this.apiClient, e);
      return a = F("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }), i.then(function(d) {
        return Qe(this, arguments, function* () {
          var p, f, h, m;
          try {
            for (var g = !0, y = Ze(d), _; _ = yield Q(y.next()), p = _.done, !p; g = !0) {
              m = _.value, g = !1;
              const S = m, b = nc(yield Q(S.json()), e);
              b.sdkHttpResponse = { headers: S.headers };
              const A = new Pn();
              Object.assign(A, b), yield yield Q(A);
            }
          } catch (S) {
            f = { error: S };
          } finally {
            try {
              !g && !p && (h = y.return) && (yield Q(h.call(y)));
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
      const c = dT(this.apiClient, e, e);
      return a = F(w_(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = pT(d, e), f = new Lu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = cT(this.apiClient, e);
      return a = F("{model}:batchEmbedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = fT(d), f = new Lu();
        return Object.assign(f, p), f;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = wT(this.apiClient, e);
      return a = F("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = CT(d), f = new Du();
        return Object.assign(f, p), f;
      });
    } else {
      const c = bT(this.apiClient, e);
      return a = F("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = AT(d), f = new Du();
        return Object.assign(f, p), f;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = rT(this.apiClient, e);
      return s = F("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
        const c = aT(u), d = new jy();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = CE(this.apiClient, e);
      return s = F("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
        const c = IE(u), d = new e_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = rE(this.apiClient, e);
      return s = F("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = aE(u), d = new t_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = pE(this.apiClient, e);
      return s = F("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = hE(u), d = new n_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = VT(this.apiClient, e);
      return a = F("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => ur(d));
    } else {
      const c = OT(this.apiClient, e);
      return a = F("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), i.then((d) => lr(d));
    }
  }
  async listInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ZT(this.apiClient, e);
      return a = F("{models_url}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = eE(d), f = new $u();
        return Object.assign(f, p), f;
      });
    } else {
      const c = QT(this.apiClient, e);
      return a = F("{models_url}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = jT(d), f = new $u();
        return Object.assign(f, p), f;
      });
    }
  }
  async update(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = wE(this.apiClient, e);
      return a = F("{model}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => ur(d));
    } else {
      const c = bE(this.apiClient, e);
      return a = F("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), i.then((d) => lr(d));
    }
  }
  async delete(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = nT(this.apiClient, e);
      return a = F("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = sT(d), f = new Uu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = tT(this.apiClient, e);
      return a = F("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = oT(d), f = new Uu();
        return Object.assign(f, p), f;
      });
    }
  }
  async countTokens(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ZS(this.apiClient, e);
      return a = F("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = eT(d), f = new Fu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = QS(this.apiClient, e);
      return a = F("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = jS(d), f = new Fu();
        return Object.assign(f, p), f;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = HS(this.apiClient, e);
      return s = F("{model}:computeTokens", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
        const c = JS(u), d = new o_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = NT(this.apiClient, e);
      return a = F("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const p = PT(d), f = new Bu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = MT(this.apiClient, e);
      return a = F("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const p = RT(d), f = new Bu();
        return Object.assign(f, p), f;
      });
    }
  }
}, bb = class extends dt {
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
      const c = Ky(e);
      return a = F("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i;
    } else {
      const c = Wy(e);
      return a = F("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
      const a = By(e);
      return s = F("{resourceName}:fetchPredictOperation", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
function uc(e) {
  const t = {};
  if (r(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function wb(e) {
  const t = {}, n = r(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Ab(e) {
  const t = {}, n = r(e, ["data"]);
  if (n != null && l(t, ["data"], n), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Cb(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((i) => Db(i))), l(t, ["parts"], s);
  }
  const o = r(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function Ib(e, t, n) {
  const o = {}, s = r(t, ["expireTime"]);
  n !== void 0 && s != null && l(n, ["expireTime"], s);
  const i = r(t, ["newSessionExpireTime"]);
  n !== void 0 && i != null && l(n, ["newSessionExpireTime"], i);
  const a = r(t, ["uses"]);
  n !== void 0 && a != null && l(n, ["uses"], a);
  const u = r(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && l(n, ["bidiGenerateContentSetup"], Lb(e, u));
  const c = r(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && l(n, ["fieldMask"], c), o;
}
function xb(e, t) {
  const n = {}, o = r(t, ["config"]);
  return o != null && l(n, ["config"], Ib(e, o, n)), n;
}
function Rb(e) {
  const t = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = r(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Pb(e) {
  const t = {}, n = r(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = r(e, ["args"]);
  o != null && l(t, ["args"], o);
  const s = r(e, ["name"]);
  if (s != null && l(t, ["name"], s), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Mb(e) {
  const t = {}, n = r(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], wb(n));
  const o = r(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function Nb(e) {
  const t = {}, n = r(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = r(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function kb(e, t) {
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
  ], na(f));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], Cb(Se(g)));
  const y = r(e, ["tools"]);
  if (t !== void 0 && y != null) {
    let I = ln(y);
    Array.isArray(I) && (I = I.map((P) => Fb(an(P)))), l(t, ["setup", "tools"], I);
  }
  const _ = r(e, ["sessionResumption"]);
  t !== void 0 && _ != null && l(t, ["setup", "sessionResumption"], Ub(_));
  const S = r(e, ["inputAudioTranscription"]);
  t !== void 0 && S != null && l(t, ["setup", "inputAudioTranscription"], uc(S));
  const b = r(e, ["outputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "outputAudioTranscription"], uc(b));
  const A = r(e, ["realtimeInputConfig"]);
  t !== void 0 && A != null && l(t, ["setup", "realtimeInputConfig"], A);
  const R = r(e, ["contextWindowCompression"]);
  t !== void 0 && R != null && l(t, ["setup", "contextWindowCompression"], R);
  const $ = r(e, ["proactivity"]);
  if (t !== void 0 && $ != null && l(t, ["setup", "proactivity"], $), r(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const w = r(e, ["avatarConfig"]);
  t !== void 0 && w != null && l(t, ["setup", "avatarConfig"], w);
  const v = r(e, ["safetySettings"]);
  if (t !== void 0 && v != null) {
    let I = v;
    Array.isArray(I) && (I = I.map((P) => $b(P))), l(t, ["setup", "safetySettings"], I);
  }
  return n;
}
function Lb(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["setup", "model"], se(e, o));
  const s = r(t, ["config"]);
  return s != null && l(n, ["config"], kb(s, n)), n;
}
function Db(e) {
  const t = {}, n = r(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = r(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const s = r(e, ["executableCode"]);
  s != null && l(t, ["executableCode"], s);
  const i = r(e, ["fileData"]);
  i != null && l(t, ["fileData"], Rb(i));
  const a = r(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], Pb(a));
  const u = r(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = r(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], Ab(c));
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
function $b(e) {
  const t = {}, n = r(e, ["category"]);
  if (n != null && l(t, ["category"], n), r(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = r(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function Ub(e) {
  const t = {}, n = r(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), r(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function Fb(e) {
  const t = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = r(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = r(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const s = r(e, ["googleSearch"]);
  s != null && l(t, ["googleSearch"], Nb(s));
  const i = r(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], Mb(i));
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
function Bb(e) {
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
function Gb(e, t) {
  let n = null;
  const o = e.bidiGenerateContentSetup;
  if (typeof o == "object" && o !== null && "setup" in o) {
    const i = o.setup;
    typeof i == "object" && i !== null ? (e.bidiGenerateContentSetup = i, n = i) : delete e.bidiGenerateContentSetup;
  } else o !== void 0 && delete e.bidiGenerateContentSetup;
  const s = e.fieldMask;
  if (n) {
    const i = Bb(n);
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
var qb = class extends dt {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const a = xb(this.apiClient, e);
      s = F("auth_tokens", a._url), i = a._query, delete a.config, delete a._url, delete a._query;
      const u = Gb(a, e.config);
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
function Ob(e, t) {
  const n = {}, o = r(e, ["force"]);
  return t !== void 0 && o != null && l(t, ["_query", "force"], o), n;
}
function Vb(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const o = r(e, ["config"]);
  return o != null && Ob(o, t), t;
}
function Hb(e) {
  const t = {}, n = r(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function Jb(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function Wb(e) {
  const t = {}, n = r(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const o = r(e, ["config"]);
  return o != null && Jb(o, t), t;
}
function Kb(e) {
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
var zb = class extends dt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new Ut(ct.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Hb(e);
      return s = F("{name}", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
      const i = Vb(e);
      o = F("{name}", i._url), s = i._query, delete i._url, delete i._query, await this.apiClient.request({
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
      const a = Wb(e);
      return s = F("{parent}/documents", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = Kb(u), d = new s_();
        return Object.assign(d, c), d;
      });
    }
  }
}, Yb = class extends dt {
  constructor(e, t = new zb(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new Ut(ct.PAGED_ITEM_FILE_SEARCH_STORES, (o) => this.listInternal(o), await this.listInternal(n), n);
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
      const a = LE(e);
      return s = F("fileSearchStores", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
      const a = UE(e);
      return s = F("{name}", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
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
      const i = $E(e);
      o = F("{name}", i._url), s = i._query, delete i._url, delete i._query, await this.apiClient.request({
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
      const a = VE(e);
      return s = F("fileSearchStores", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = HE(u), d = new i_();
        return Object.assign(d, c), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = JE(e);
      return s = F("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = WE(u), d = new r_();
        return Object.assign(d, c), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = GE(e);
      return s = F("{file_search_store_name}:importFile", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = BE(u), d = new a_();
        return Object.assign(d, c), d;
      });
    }
  }
}, kp = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return kp = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
}, Xb = () => kp();
function dr(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var fr = (e) => {
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
}, He = class extends Error {
}, Je = class pr extends He {
  constructor(t, n, o, s) {
    super(`${pr.makeMessage(t, n, o)}`), this.status = t, this.headers = s, this.error = n;
  }
  static makeMessage(t, n, o) {
    const s = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && s ? `${t} ${s}` : t ? `${t} status code (no body)` : s || "(no status code or body)";
  }
  static generate(t, n, o, s) {
    if (!t || !s) return new Bs({
      message: o,
      cause: fr(n)
    });
    const i = n;
    return t === 400 ? new Dp(t, i, o, s) : t === 401 ? new $p(t, i, o, s) : t === 403 ? new Up(t, i, o, s) : t === 404 ? new Fp(t, i, o, s) : t === 409 ? new Bp(t, i, o, s) : t === 422 ? new Gp(t, i, o, s) : t === 429 ? new qp(t, i, o, s) : t >= 500 ? new Op(t, i, o, s) : new pr(t, i, o, s);
  }
}, hr = class extends Je {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Bs = class extends Je {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Lp = class extends Bs {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Dp = class extends Je {
}, $p = class extends Je {
}, Up = class extends Je {
}, Fp = class extends Je {
}, Bp = class extends Je {
}, Gp = class extends Je {
}, qp = class extends Je {
}, Op = class extends Je {
}, Qb = /^[a-z][a-z0-9+.-]*:/i, Zb = (e) => Qb.test(e), mr = (e) => (mr = Array.isArray, mr(e)), cc = mr;
function dc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function jb(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var ew = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new He(`${e} must be an integer`);
  if (t < 0) throw new He(`${e} must be a positive integer`);
  return t;
}, tw = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, nw = (e) => new Promise((t) => setTimeout(t, e));
function ow() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Vp(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function sw(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Vp({
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
function Hp(e) {
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
async function iw(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const o = e.getReader(), s = o.cancel();
  o.releaseLock(), await s;
}
var rw = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function aw(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new He(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var lw = "0.0.1", Jp = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function vi(e, t, n) {
  return Jp(), new File(e, t ?? "unknown_file", n);
}
function uw(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var cw = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Wp = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", dw = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Wp(e), fw = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function pw(e, t, n) {
  if (Jp(), e = await e, dw(e))
    return e instanceof File ? e : vi([await e.arrayBuffer()], e.name);
  if (fw(e)) {
    const s = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), vi(await gr(s), t, n);
  }
  const o = await gr(e);
  if (t || (t = uw(e)), !n?.type) {
    const s = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof s == "string" && (n = Object.assign(Object.assign({}, n), { type: s }));
  }
  return vi(o, t, n);
}
async function gr(e) {
  var t, n, o, s, i;
  let a = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) a.push(e);
  else if (Wp(e)) a.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (cw(e)) try {
    for (var u = !0, c = Ze(e), d; d = await c.next(), t = d.done, !t; u = !0) {
      s = d.value, u = !1;
      const p = s;
      a.push(...await gr(p));
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
    throw new Error(`Unexpected data type: ${typeof e}${p ? `; constructor: ${p}` : ""}${hw(e)}`);
  }
  return a;
}
function hw(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var oa = class {
  constructor(e) {
    this._client = e;
  }
};
oa._key = [];
function Kp(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var fc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), mw = (e = Kp) => (function(n, ...o) {
  if (n.length === 1) return n[0];
  let s = !1;
  const i = [], a = n.reduce((p, f, h) => {
    var m, g, y;
    /[?#]/.test(f) && (s = !0);
    const _ = o[h];
    let S = (s ? encodeURIComponent : e)("" + _);
    return h !== o.length && (_ == null || typeof _ == "object" && _.toString === ((y = Object.getPrototypeOf((g = Object.getPrototypeOf((m = _.hasOwnProperty) !== null && m !== void 0 ? m : fc)) !== null && g !== void 0 ? g : fc)) === null || y === void 0 ? void 0 : y.toString)) && (S = _ + "", i.push({
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
    throw new He(`Path parameters result in path with invalid segments:
${i.map((h) => h.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}), Ye = /* @__PURE__ */ mw(Kp), zp = class extends oa {
  create(e, t) {
    var n;
    const { api_version: o = this._client.apiVersion } = e, s = Tt(e, ["api_version"]);
    if ("model" in s && "agent_config" in s) throw new He("Invalid request: specified `model` and `agent_config`. If specifying `model`, use `generation_config`.");
    if ("agent" in s && "generation_config" in s) throw new He("Invalid request: specified `agent` and `generation_config`. If specifying `agent`, use `agent_config`.");
    return this._client.post(Ye`/${o}/interactions`, Object.assign(Object.assign({ body: s }, t), { stream: (n = e.stream) !== null && n !== void 0 ? n : !1 }));
  }
  delete(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.delete(Ye`/${o}/interactions/${e}`, n);
  }
  cancel(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.post(Ye`/${o}/interactions/${e}/cancel`, n);
  }
  get(e, t = {}, n) {
    var o;
    const s = t ?? {}, { api_version: i = this._client.apiVersion } = s, a = Tt(s, ["api_version"]);
    return this._client.get(Ye`/${i}/interactions/${e}`, Object.assign(Object.assign({ query: a }, n), { stream: (o = t?.stream) !== null && o !== void 0 ? o : !1 }));
  }
};
zp._key = Object.freeze(["interactions"]);
var Yp = class extends zp {
}, Xp = class extends oa {
  create(e, t) {
    const { api_version: n = this._client.apiVersion, webhook_id: o } = e, s = Tt(e, ["api_version", "webhook_id"]);
    return this._client.post(Ye`/${n}/webhooks`, Object.assign({
      query: { webhook_id: o },
      body: s
    }, t));
  }
  update(e, t, n) {
    const { api_version: o = this._client.apiVersion, update_mask: s } = t, i = Tt(t, ["api_version", "update_mask"]);
    return this._client.patch(Ye`/${o}/webhooks/${e}`, Object.assign({
      query: { update_mask: s },
      body: i
    }, n));
  }
  list(e = {}, t) {
    const n = e ?? {}, { api_version: o = this._client.apiVersion } = n, s = Tt(n, ["api_version"]);
    return this._client.get(Ye`/${o}/webhooks`, Object.assign({ query: s }, t));
  }
  delete(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.delete(Ye`/${o}/webhooks/${e}`, n);
  }
  get(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.get(Ye`/${o}/webhooks/${e}`, n);
  }
  ping(e, t = void 0, n) {
    const { api_version: o = this._client.apiVersion, body: s } = t ?? {};
    return this._client.post(Ye`/${o}/webhooks/${e}:ping`, Object.assign({ body: s }, n));
  }
  rotateSigningSecret(e, t = {}, n) {
    const o = t ?? {}, { api_version: s = this._client.apiVersion } = o, i = Tt(o, ["api_version"]);
    return this._client.post(Ye`/${s}/webhooks/${e}:rotateSigningSecret`, Object.assign({ body: i }, n));
  }
};
Xp._key = Object.freeze(["webhooks"]);
var Qp = class extends Xp {
};
function gw(e) {
  let t = 0;
  for (const s of e) t += s.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const s of e)
    n.set(s, o), o += s.length;
  return n;
}
var Go;
function sa(e) {
  let t;
  return (Go ?? (t = new globalThis.TextEncoder(), Go = t.encode.bind(t)))(e);
}
var qo;
function pc(e) {
  let t;
  return (qo ?? (t = new globalThis.TextDecoder(), qo = t.decode.bind(t)))(e);
}
var Gs = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? sa(e) : e;
    this.buffer = gw([this.buffer, n]);
    const o = [];
    let s;
    for (; (s = yw(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (s.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = s.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (s.index !== this.carriageReturnIndex + 1 || s.carriage)) {
        o.push(pc(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const i = this.carriageReturnIndex !== null ? s.preceding - 1 : s.preceding, a = pc(this.buffer.subarray(0, i));
      o.push(a), this.buffer = this.buffer.subarray(s.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), o;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
Gs.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Gs.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function yw(e, t) {
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
var Ss = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, hc = (e, t, n) => {
  if (e) {
    if (jb(Ss, e)) return e;
    xe(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Ss))}`);
  }
};
function Wn() {
}
function Oo(e, t, n) {
  return !t || Ss[e] > Ss[n] ? Wn : t[e].bind(t);
}
var _w = {
  error: Wn,
  warn: Wn,
  info: Wn,
  debug: Wn
}, mc = /* @__PURE__ */ new WeakMap();
function xe(e) {
  var t;
  const n = e.logger, o = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return _w;
  const s = mc.get(n);
  if (s && s[0] === o) return s[1];
  const i = {
    error: Oo("error", n, o),
    warn: Oo("warn", n, o),
    info: Oo("info", n, o),
    debug: Oo("debug", n, o)
  };
  return mc.set(n, [o, i]), i;
}
var Mt = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), vw = class Kn {
  constructor(t, n, o) {
    this.iterator = t, this.controller = n, this.client = o;
  }
  static fromSSEResponse(t, n, o) {
    let s = !1;
    const i = o ? xe(o) : console;
    function a() {
      return Qe(this, arguments, function* () {
        var c, d, p, f;
        if (s) throw new He("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        s = !0;
        let h = !1;
        try {
          try {
            for (var m = !0, g = Ze(Sw(t, n)), y; y = yield Q(g.next()), c = y.done, !c; m = !0) {
              f = y.value, m = !1;
              const _ = f;
              if (!h)
                if (_.data.startsWith("[DONE]")) {
                  h = !0;
                  continue;
                } else try {
                  yield yield Q(JSON.parse(_.data));
                } catch (S) {
                  throw i.error("Could not parse message into JSON:", _.data), i.error("From chunk:", _.raw), S;
                }
            }
          } catch (_) {
            d = { error: _ };
          } finally {
            try {
              !m && !c && (p = g.return) && (yield Q(p.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          h = !0;
        } catch (_) {
          if (dr(_)) return yield Q(void 0);
          throw _;
        } finally {
          h || n.abort();
        }
      });
    }
    return new Kn(a, n, o);
  }
  static fromReadableStream(t, n, o) {
    let s = !1;
    function i() {
      return Qe(this, arguments, function* () {
        var c, d, p, f;
        const h = new Gs(), m = Hp(t);
        try {
          for (var g = !0, y = Ze(m), _; _ = yield Q(y.next()), c = _.done, !c; g = !0) {
            f = _.value, g = !1;
            const S = f;
            for (const b of h.decode(S)) yield yield Q(b);
          }
        } catch (S) {
          d = { error: S };
        } finally {
          try {
            !g && !c && (p = y.return) && (yield Q(p.call(y)));
          } finally {
            if (d) throw d.error;
          }
        }
        for (const S of h.flush()) yield yield Q(S);
      });
    }
    function a() {
      return Qe(this, arguments, function* () {
        var c, d, p, f;
        if (s) throw new He("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        s = !0;
        let h = !1;
        try {
          try {
            for (var m = !0, g = Ze(i()), y; y = yield Q(g.next()), c = y.done, !c; m = !0) {
              f = y.value, m = !1;
              const _ = f;
              h || _ && (yield yield Q(JSON.parse(_)));
            }
          } catch (_) {
            d = { error: _ };
          } finally {
            try {
              !m && !c && (p = g.return) && (yield Q(p.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          h = !0;
        } catch (_) {
          if (dr(_)) return yield Q(void 0);
          throw _;
        } finally {
          h || n.abort();
        }
      });
    }
    return new Kn(a, n, o);
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
    return [new Kn(() => s(t), this.controller, this.client), new Kn(() => s(n), this.controller, this.client)];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Vp({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: s, done: i } = await n.next();
          if (i) return o.close();
          const a = sa(JSON.stringify(s) + `
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
function Sw(e, t) {
  return Qe(this, arguments, function* () {
    var o, s, i, a;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new He("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new He("Attempted to iterate over a response with no body");
    const u = new Ew(), c = new Gs(), d = Hp(e.body);
    try {
      for (var p = !0, f = Ze(Tw(d)), h; h = yield Q(f.next()), o = h.done, !o; p = !0) {
        a = h.value, p = !1;
        const m = a;
        for (const g of c.decode(m)) {
          const y = u.decode(g);
          y && (yield yield Q(y));
        }
      }
    } catch (m) {
      s = { error: m };
    } finally {
      try {
        !p && !o && (i = f.return) && (yield Q(i.call(f)));
      } finally {
        if (s) throw s.error;
      }
    }
    for (const m of c.flush()) {
      const g = u.decode(m);
      g && (yield yield Q(g));
    }
  });
}
function Tw(e) {
  return Qe(this, arguments, function* () {
    var n, o, s, i;
    try {
      for (var a = !0, u = Ze(e), c; c = yield Q(u.next()), n = c.done, !n; a = !0) {
        i = c.value, a = !1;
        const d = i;
        d != null && (yield yield Q(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? sa(d) : d));
      }
    } catch (d) {
      o = { error: d };
    } finally {
      try {
        !a && !n && (s = u.return) && (yield Q(s.call(u)));
      } finally {
        if (o) throw o.error;
      }
    }
  });
}
var Ew = class {
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
    let [t, n, o] = bw(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function bw(e, t) {
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
async function ww(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: s, startTime: i } = t, a = await (async () => {
    var u;
    if (t.options.stream)
      return xe(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : vw.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type"), d = (u = c?.split(";")[0]) === null || u === void 0 ? void 0 : u.trim();
    return d?.includes("application/json") || d?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
  })();
  return xe(e).debug(`[${o}] response parsed`, Mt({
    retryOfRequestLogID: s,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
var Aw = class Zp extends Promise {
  constructor(t, n, o = ww) {
    super((s) => {
      s(null);
    }), this.responsePromise = n, this.parseResponse = o, this.client = t;
  }
  _thenUnwrap(t) {
    return new Zp(this.client, this.responsePromise, async (n, o) => t(await this.parseResponse(n, o), o));
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
}, jp = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* Cw(e) {
  if (!e) return;
  if (jp in e) {
    const { values: o, nulls: s } = e;
    yield* o.entries();
    for (const i of s) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : cc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const s = o[0];
    if (typeof s != "string") throw new TypeError("expected header name to be a string");
    const i = cc(o[1]) ? o[1] : [o[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [s, null]), yield [s, u]);
  }
}
var Mn = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const s = /* @__PURE__ */ new Set();
    for (const [i, a] of Cw(o)) {
      const u = i.toLowerCase();
      s.has(u) || (t.delete(i), s.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [jp]: !0,
    values: t,
    nulls: n
  };
}, Si = (e) => {
  var t, n, o, s, i;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((i = (s = (o = globalThis.Deno.env) === null || o === void 0 ? void 0 : o.get) === null || s === void 0 ? void 0 : s.call(o, e)) === null || i === void 0 ? void 0 : i.trim()) || void 0;
}, eh, th = class nh {
  constructor(t) {
    var n, o, s, i, a, u, c, { baseURL: d = Si("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: p = (n = Si("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: f = "v1beta" } = t, h = Tt(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: p,
      apiVersion: f
    }, h), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (o = m.timeout) !== null && o !== void 0 ? o : nh.DEFAULT_TIMEOUT, this.logger = (s = m.logger) !== null && s !== void 0 ? s : console;
    const g = "warn";
    this.logLevel = g, this.logLevel = (a = (i = hc(m.logLevel, "ClientOptions.logLevel", this)) !== null && i !== void 0 ? i : hc(Si("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && a !== void 0 ? a : g, this.fetchOptions = m.fetchOptions, this.maxRetries = (u = m.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = m.fetch) !== null && c !== void 0 ? c : ow(), this.encoder = rw, this._options = m, this.apiKey = p, this.apiVersion = f, this.clientAdapter = m.clientAdapter;
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
    const n = Mn([t.headers]);
    if (!(n.values.has("authorization") || n.values.has("x-goog-api-key"))) {
      if (this.apiKey) return Mn([{ "x-goog-api-key": this.apiKey }]);
      if (this.clientAdapter && this.clientAdapter.isVertexAI()) return Mn([await this.clientAdapter.getAuthHeaders()]);
    }
  }
  stringifyQuery(t) {
    return aw(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${lw}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Xb()}`;
  }
  makeStatusError(t, n, o, s) {
    return Je.generate(t, n, o, s);
  }
  buildURL(t, n, o) {
    const s = !this.baseURLOverridden() && o || this.baseURL, i = Zb(t) ? new URL(t) : new URL(s + (s.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), a = this.defaultQuery(), u = Object.fromEntries(i.searchParams);
    return (!dc(a) || !dc(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), a), n)), typeof n == "object" && n && !Array.isArray(n) && (i.search = this.stringifyQuery(n)), i.toString();
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
    return new Aw(this, this.makeRequest(t, n, void 0));
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
    if (xe(this).debug(`[${h}] sending request`, Mt({
      retryOfRequestLogID: o,
      method: u.method,
      url: p,
      options: u,
      headers: d.headers
    })), !((i = u.signal) === null || i === void 0) && i.aborted) throw new hr();
    const y = new AbortController(), _ = await this.fetchWithTimeout(p, d, f, y).catch(fr), S = Date.now();
    if (_ instanceof globalThis.Error) {
      const A = `retrying, ${n} attempts remaining`;
      if (!((a = u.signal) === null || a === void 0) && a.aborted) throw new hr();
      const R = dr(_) || /timed? ?out/i.test(String(_) + ("cause" in _ ? String(_.cause) : ""));
      if (n)
        return xe(this).info(`[${h}] connection ${R ? "timed out" : "failed"} - ${A}`), xe(this).debug(`[${h}] connection ${R ? "timed out" : "failed"} (${A})`, Mt({
          retryOfRequestLogID: o,
          url: p,
          durationMs: S - g,
          message: _.message
        })), this.retryRequest(u, n, o ?? h);
      throw xe(this).info(`[${h}] connection ${R ? "timed out" : "failed"} - error; no more retries left`), xe(this).debug(`[${h}] connection ${R ? "timed out" : "failed"} (error; no more retries left)`, Mt({
        retryOfRequestLogID: o,
        url: p,
        durationMs: S - g,
        message: _.message
      })), R ? new Lp() : new Bs({ cause: _ });
    }
    const b = `[${h}${m}] ${d.method} ${p} ${_.ok ? "succeeded" : "failed"} with status ${_.status} in ${S - g}ms`;
    if (!_.ok) {
      const A = await this.shouldRetry(_);
      if (n && A) {
        const I = `retrying, ${n} attempts remaining`;
        return await iw(_.body), xe(this).info(`${b} - ${I}`), xe(this).debug(`[${h}] response error (${I})`, Mt({
          retryOfRequestLogID: o,
          url: _.url,
          status: _.status,
          headers: _.headers,
          durationMs: S - g
        })), this.retryRequest(u, n, o ?? h, _.headers);
      }
      const R = A ? "error; no more retries left" : "error; not retryable";
      xe(this).info(`${b} - ${R}`);
      const $ = await _.text().catch((I) => fr(I).message), w = tw($), v = w ? void 0 : $;
      throw xe(this).debug(`[${h}] response error (${R})`, Mt({
        retryOfRequestLogID: o,
        url: _.url,
        status: _.status,
        headers: _.headers,
        message: v,
        durationMs: Date.now() - g
      })), this.makeStatusError(_.status, w, v, _.headers);
    }
    return xe(this).info(b), xe(this).debug(`[${h}] response start`, Mt({
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
    const i = n || {}, { signal: a, method: u } = i, c = Tt(i, ["signal", "method"]), d = this._makeAbort(s);
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
    return await nw(a), this.makeRequest(t, n - 1, o);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const i = n - t;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var o, s, i;
    const a = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: p } = a, f = this.buildURL(c, d, p);
    "timeout" in a && ew("timeout", a.timeout), a.timeout = (o = a.timeout) !== null && o !== void 0 ? o : this.timeout;
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
    let u = Mn([
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
    const o = Mn([n]);
    return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && o.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: t
    } : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
      bodyHeaders: void 0,
      body: sw(t)
    } : typeof t == "object" && o.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: o
    });
  }
};
th.DEFAULT_TIMEOUT = 6e4;
var _e = class extends th {
  constructor() {
    super(...arguments), this.interactions = new Yp(this), this.webhooks = new Qp(this);
  }
};
eh = _e;
_e.GeminiNextGenAPIClient = eh;
_e.GeminiNextGenAPIClientError = He;
_e.APIError = Je;
_e.APIConnectionError = Bs;
_e.APIConnectionTimeoutError = Lp;
_e.APIUserAbortError = hr;
_e.NotFoundError = Fp;
_e.ConflictError = Bp;
_e.RateLimitError = qp;
_e.BadRequestError = Dp;
_e.AuthenticationError = $p;
_e.InternalServerError = Op;
_e.PermissionDeniedError = Up;
_e.UnprocessableEntityError = Gp;
_e.toFile = pw;
_e.Interactions = Yp;
_e.Webhooks = Qp;
function Iw(e, t) {
  const n = {}, o = r(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function xw(e, t) {
  const n = {}, o = r(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function Rw(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function Pw(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function Mw(e, t, n) {
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
function Nw(e, t, n) {
  const o = {};
  let s = r(n, ["config", "method"]);
  if (s === void 0 && (s = "SUPERVISED_FINE_TUNING"), s === "SUPERVISED_FINE_TUNING") {
    const w = r(e, ["validationDataset"]);
    t !== void 0 && w != null && l(t, ["supervisedTuningSpec"], Ti(w));
  } else if (s === "PREFERENCE_TUNING") {
    const w = r(e, ["validationDataset"]);
    t !== void 0 && w != null && l(t, ["preferenceOptimizationSpec"], Ti(w));
  } else if (s === "DISTILLATION") {
    const w = r(e, ["validationDataset"]);
    t !== void 0 && w != null && l(t, ["distillationSpec"], Ti(w));
  }
  const i = r(e, ["tunedModelDisplayName"]);
  t !== void 0 && i != null && l(t, ["tunedModelDisplayName"], i);
  const a = r(e, ["description"]);
  t !== void 0 && a != null && l(t, ["description"], a);
  let u = r(n, ["config", "method"]);
  if (u === void 0 && (u = "SUPERVISED_FINE_TUNING"), u === "SUPERVISED_FINE_TUNING") {
    const w = r(e, ["epochCount"]);
    t !== void 0 && w != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "epochCount"
    ], w);
  } else if (u === "PREFERENCE_TUNING") {
    const w = r(e, ["epochCount"]);
    t !== void 0 && w != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "epochCount"
    ], w);
  } else if (u === "DISTILLATION") {
    const w = r(e, ["epochCount"]);
    t !== void 0 && w != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "epochCount"
    ], w);
  }
  let c = r(n, ["config", "method"]);
  if (c === void 0 && (c = "SUPERVISED_FINE_TUNING"), c === "SUPERVISED_FINE_TUNING") {
    const w = r(e, ["learningRateMultiplier"]);
    t !== void 0 && w != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], w);
  } else if (c === "PREFERENCE_TUNING") {
    const w = r(e, ["learningRateMultiplier"]);
    t !== void 0 && w != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], w);
  } else if (c === "DISTILLATION") {
    const w = r(e, ["learningRateMultiplier"]);
    t !== void 0 && w != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], w);
  }
  let d = r(n, ["config", "method"]);
  if (d === void 0 && (d = "SUPERVISED_FINE_TUNING"), d === "SUPERVISED_FINE_TUNING") {
    const w = r(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && w != null && l(t, ["supervisedTuningSpec", "exportLastCheckpointOnly"], w);
  } else if (d === "PREFERENCE_TUNING") {
    const w = r(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && w != null && l(t, ["preferenceOptimizationSpec", "exportLastCheckpointOnly"], w);
  } else if (d === "DISTILLATION") {
    const w = r(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && w != null && l(t, ["distillationSpec", "exportLastCheckpointOnly"], w);
  }
  let p = r(n, ["config", "method"]);
  if (p === void 0 && (p = "SUPERVISED_FINE_TUNING"), p === "SUPERVISED_FINE_TUNING") {
    const w = r(e, ["adapterSize"]);
    t !== void 0 && w != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "adapterSize"
    ], w);
  } else if (p === "PREFERENCE_TUNING") {
    const w = r(e, ["adapterSize"]);
    t !== void 0 && w != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "adapterSize"
    ], w);
  } else if (p === "DISTILLATION") {
    const w = r(e, ["adapterSize"]);
    t !== void 0 && w != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "adapterSize"
    ], w);
  }
  let f = r(n, ["config", "method"]);
  if (f === void 0 && (f = "SUPERVISED_FINE_TUNING"), f === "SUPERVISED_FINE_TUNING") {
    const w = r(e, ["tuningMode"]);
    t !== void 0 && w != null && l(t, ["supervisedTuningSpec", "tuningMode"], w);
  } else if (f === "DISTILLATION") {
    const w = r(e, ["tuningMode"]);
    t !== void 0 && w != null && l(t, ["distillationSpec", "tuningMode"], w);
  }
  const h = r(e, ["customBaseModel"]);
  t !== void 0 && h != null && l(t, ["customBaseModel"], h);
  let m = r(n, ["config", "method"]);
  if (m === void 0 && (m = "SUPERVISED_FINE_TUNING"), m === "SUPERVISED_FINE_TUNING") {
    const w = r(e, ["batchSize"]);
    t !== void 0 && w != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "batchSize"
    ], w);
  } else if (m === "DISTILLATION") {
    const w = r(e, ["batchSize"]);
    t !== void 0 && w != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "batchSize"
    ], w);
  }
  let g = r(n, ["config", "method"]);
  if (g === void 0 && (g = "SUPERVISED_FINE_TUNING"), g === "SUPERVISED_FINE_TUNING") {
    const w = r(e, ["learningRate"]);
    t !== void 0 && w != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRate"
    ], w);
  } else if (g === "DISTILLATION") {
    const w = r(e, ["learningRate"]);
    t !== void 0 && w != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRate"
    ], w);
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
  const b = r(e, ["tunedTeacherModelSource"]);
  t !== void 0 && b != null && l(t, ["distillationSpec", "tunedTeacherModelSource"], b);
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
function kw(e, t) {
  const n = {}, o = r(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const s = r(e, ["preTunedModel"]);
  s != null && l(n, ["preTunedModel"], s);
  const i = r(e, ["trainingDataset"]);
  i != null && Hw(i);
  const a = r(e, ["config"]);
  return a != null && Mw(a, n), n;
}
function Lw(e, t) {
  const n = {}, o = r(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const s = r(e, ["preTunedModel"]);
  s != null && l(n, ["preTunedModel"], s);
  const i = r(e, ["trainingDataset"]);
  i != null && Jw(i, n, t);
  const a = r(e, ["config"]);
  return a != null && Nw(a, n, t), n;
}
function Dw(e, t) {
  const n = {}, o = r(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function $w(e, t) {
  const n = {}, o = r(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function Uw(e, t, n) {
  const o = {}, s = r(e, ["pageSize"]);
  t !== void 0 && s != null && l(t, ["_query", "pageSize"], s);
  const i = r(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const a = r(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), o;
}
function Fw(e, t, n) {
  const o = {}, s = r(e, ["pageSize"]);
  t !== void 0 && s != null && l(t, ["_query", "pageSize"], s);
  const i = r(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const a = r(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), o;
}
function Bw(e, t) {
  const n = {}, o = r(e, ["config"]);
  return o != null && Uw(o, n), n;
}
function Gw(e, t) {
  const n = {}, o = r(e, ["config"]);
  return o != null && Fw(o, n), n;
}
function qw(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["nextPageToken"]);
  s != null && l(n, ["nextPageToken"], s);
  const i = r(e, ["tunedModels"]);
  if (i != null) {
    let a = i;
    Array.isArray(a) && (a = a.map((u) => oh(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function Ow(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["nextPageToken"]);
  s != null && l(n, ["nextPageToken"], s);
  const i = r(e, ["tuningJobs"]);
  if (i != null) {
    let a = i;
    Array.isArray(a) && (a = a.map((u) => yr(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function Vw(e, t) {
  const n = {}, o = r(e, ["name"]);
  o != null && l(n, ["model"], o);
  const s = r(e, ["name"]);
  return s != null && l(n, ["endpoint"], s), n;
}
function Hw(e, t) {
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
function Jw(e, t, n) {
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
function oh(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["name"]);
  s != null && l(n, ["name"], s);
  const i = r(e, ["state"]);
  i != null && l(n, ["state"], fp(i));
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
  return h != null && l(n, ["tunedModel"], Vw(h)), n;
}
function yr(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["name"]);
  s != null && l(n, ["name"], s);
  const i = r(e, ["state"]);
  i != null && l(n, ["state"], fp(i));
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
  const b = r(e, ["tuningDataStats"]);
  b != null && l(n, ["tuningDataStats"], b);
  const A = r(e, ["encryptionSpec"]);
  A != null && l(n, ["encryptionSpec"], A);
  const R = r(e, ["partnerModelTuningSpec"]);
  R != null && l(n, ["partnerModelTuningSpec"], R);
  const $ = r(e, ["customBaseModel"]);
  $ != null && l(n, ["customBaseModel"], $);
  const w = r(e, ["evaluateDatasetRuns"]);
  if (w != null) {
    let ie = w;
    Array.isArray(ie) && (ie = ie.map((le) => le)), l(n, ["evaluateDatasetRuns"], ie);
  }
  const v = r(e, ["experiment"]);
  v != null && l(n, ["experiment"], v);
  const I = r(e, ["fullFineTuningSpec"]);
  I != null && l(n, ["fullFineTuningSpec"], I);
  const P = r(e, ["labels"]);
  P != null && l(n, ["labels"], P);
  const U = r(e, ["outputUri"]);
  U != null && l(n, ["outputUri"], U);
  const O = r(e, ["pipelineJob"]);
  O != null && l(n, ["pipelineJob"], O);
  const ne = r(e, ["serviceAccount"]);
  ne != null && l(n, ["serviceAccount"], ne);
  const Z = r(e, ["tunedModelDisplayName"]);
  Z != null && l(n, ["tunedModelDisplayName"], Z);
  const ee = r(e, ["tuningJobState"]);
  ee != null && l(n, ["tuningJobState"], ee);
  const L = r(e, ["veoTuningSpec"]);
  L != null && l(n, ["veoTuningSpec"], L);
  const V = r(e, ["distillationSamplingSpec"]);
  V != null && l(n, ["distillationSamplingSpec"], V);
  const K = r(e, ["tuningJobMetadata"]);
  return K != null && l(n, ["tuningJobMetadata"], K), n;
}
function Ww(e, t) {
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
function Ti(e, t) {
  const n = {}, o = r(e, ["gcsUri"]);
  o != null && l(n, ["validationDatasetUri"], o);
  const s = r(e, ["vertexDatasetResource"]);
  return s != null && l(n, ["validationDatasetUri"], s), n;
}
var Kw = class extends dt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Ut(ct.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
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
          state: or.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = $w(e);
      return a = F("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => yr(d));
    } else {
      const c = Dw(e);
      return a = F("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => oh(d));
    }
  }
  async listInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Gw(e);
      return a = F("tuningJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = Ow(d), f = new Gu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = Bw(e);
      return a = F("tunedModels", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = qw(d), f = new Gu();
        return Object.assign(f, p), f;
      });
    }
  }
  async cancel(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = xw(e);
      return a = F("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = Pw(d), f = new qu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = Iw(e);
      return a = F("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const p = Rw(d), f = new qu();
        return Object.assign(f, p), f;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = Lw(e, e);
      return s = F("tuningJobs", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => yr(u));
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async tuneMldevInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = kw(e);
      return s = F("tunedModels", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => Ww(u));
    }
  }
}, zw = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, Yw = 1024 * 1024 * 8, Xw = 3, Qw = 1e3, Zw = 2, Ts = "x-goog-upload-status";
async function jw(e, t, n, o) {
  var s;
  const i = await sh(e, t, n, o), a = await i?.json();
  if (((s = i?.headers) === null || s === void 0 ? void 0 : s[Ts]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return a.file;
}
async function e0(e, t, n, o) {
  var s;
  const i = await sh(e, t, n, o), a = await i?.json();
  if (((s = i?.headers) === null || s === void 0 ? void 0 : s[Ts]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = op(a), c = new h_();
  return Object.assign(c, u), c;
}
async function sh(e, t, n, o) {
  var s, i, a;
  let u = t;
  const c = o?.baseUrl || ((s = n.clientOptions.httpOptions) === null || s === void 0 ? void 0 : s.baseUrl);
  if (c) {
    const m = new URL(c), g = new URL(t);
    g.protocol = m.protocol, g.host = m.host, g.port = m.port, u = g.toString();
  }
  let d = 0, p = 0, f = new ir(new Response()), h = "upload";
  for (d = e.size; p < d; ) {
    const m = Math.min(Yw, d - p), g = e.slice(p, p + m);
    p + m >= d && (h += ", finalize");
    let y = 0, _ = Qw;
    for (; y < Xw; ) {
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
      }), !((i = f?.headers) === null || i === void 0) && i[Ts]) break;
      y++, await n0(_), _ = _ * Zw;
    }
    if (p += m, ((a = f?.headers) === null || a === void 0 ? void 0 : a[Ts]) !== "active") break;
    if (d <= p) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return f;
}
async function t0(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function n0(e) {
  return new Promise((t) => setTimeout(t, e));
}
var o0 = class {
  async upload(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await jw(e, t, n, o);
  }
  async uploadToFileSearchStore(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await e0(e, t, n, o);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await t0(e);
  }
}, s0 = class {
  create(e, t, n) {
    return new i0(e, t, n);
  }
}, i0 = class {
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
}, gc = "x-goog-api-key", r0 = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(gc) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(gc, this.apiKey);
    }
  }
}, a0 = "gl-node/", l0 = class {
  getNextGenClient() {
    var e;
    const t = this.httpOptions;
    if (this._nextGenClient === void 0) {
      const n = this.httpOptions;
      this._nextGenClient = new _e({
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
    const n = Uy(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const o = new r0(this.apiKey);
    this.apiClient = new nb({
      auth: o,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: a0 + "web",
      uploader: new o0(),
      downloader: new zw()
    }), this.models = new Eb(this.apiClient), this.live = new gb(this.apiClient, o, new s0()), this.batches = new yv(this.apiClient), this.chats = new tS(this.models, this.apiClient), this.caches = new Zv(this.apiClient), this.files = new pS(this.apiClient), this.operations = new bb(this.apiClient), this.authTokens = new qb(this.apiClient), this.tunings = new Kw(this.apiClient), this.fileSearchStores = new Yb(this.apiClient);
  }
};
function yc(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function jt(e) {
  return { text: String(e || "") };
}
function u0(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? { inlineData: {
    mimeType: t[1],
    data: t[2]
  } } : null;
}
function c0(e) {
  if (typeof e == "string") return [jt(e)];
  if (!Array.isArray(e)) return [jt("")];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "text" ? jt(n.text || "") : n.type === "image_url" && n.image_url?.url ? u0(n.image_url.url) : null).filter(Boolean);
  return t.length ? t : [jt("")];
}
function _c() {
  return {
    role: "user",
    parts: [jt("继续。")]
  };
}
function vc(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => !t?.thought && typeof t?.text == "string" && t.text).map((t) => t.text).join(`
`);
}
function d0(e) {
  switch (e) {
    case "high":
      return Zn.HIGH;
    case "medium":
      return Zn.MEDIUM;
    default:
      return Zn.LOW;
  }
}
function Sc(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function f0(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  if (t.length)
    return [...new Set(t)].join(`

`);
}
function p0(e = []) {
  return {
    role: "user",
    parts: e.filter((t) => t && t.name).map((t) => ({ functionResponse: {
      name: t.name,
      response: t.response || {}
    } }))
  };
}
function h0(e) {
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
          response: yc(d.content)
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
        parts: [...a.content ? [jt(a.content)] : [], ...a.tool_calls.map((u) => ({ functionCall: {
          name: u.function.name,
          args: yc(u.function.arguments)
        } }))]
      });
      continue;
    }
    n.push({
      role: a.role === "assistant" ? "model" : "user",
      parts: c0(a.content)
    });
  }
  if (!n.length) return {
    history: [],
    latestMessage: _c().parts
  };
  const s = n[n.length - 1];
  return s.role === "user" && s.parts?.length ? {
    history: n.slice(0, -1),
    latestMessage: s.parts
  } : {
    history: n,
    latestMessage: _c().parts
  };
}
function m0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function Tc(e, t) {
  const n = String(t || ""), o = String(e || "");
  return n ? !o || n.startsWith(o) ? n : o.endsWith(n) ? o : `${o}${n}` : o;
}
var g0 = class {
  constructor(e) {
    this.config = e, this.supportsSessionToolLoop = !0, this.activeChat = null, this.client = new l0({
      apiKey: e.apiKey,
      httpOptions: {
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 18e4
      }
    });
  }
  createChat(e) {
    const t = h0(e.messages), n = Array.isArray(e.tools) ? e.tools : [], o = f0(e), s = {
      ...o ? { systemInstruction: o } : {},
      temperature: e.temperature,
      ...e.maxTokens ? { maxOutputTokens: e.maxTokens } : {}
    };
    e.reasoning?.enabled && (s.thinkingConfig = {
      includeThoughts: !0,
      thinkingLevel: d0(e.reasoning.effort)
    }), n.length && (s.tools = [{ functionDeclarations: n.map((a) => ({
      name: a.function.name,
      description: a.function.description,
      parameters: a.function.parameters
    })) }]), n.length && e.toolChoice && e.toolChoice !== "auto" && e.toolChoice !== "none" && (s.toolConfig = { functionCallingConfig: { mode: nr.ANY } });
    const i = {
      model: this.config.model,
      history: t.history,
      config: s
    };
    return {
      chat: this.client.chats.create(i),
      sendPayload: { message: t.latestMessage }
    };
  }
  async sendThroughChat(e, t, n) {
    let o, s, i, a = [];
    if (typeof n.onStreamProgress == "function") {
      const d = await e.sendMessageStream(t), p = /* @__PURE__ */ new Map();
      let f = "", h = [], m = null;
      for await (const g of d) {
        if (m = g, Sc(g).forEach((y, _) => {
          const S = `${y.label}:${_}`;
          p.set(S, Tc(p.get(S) || "", y.text));
        }), h = (g.functionCalls || []).map((y, _) => ({
          id: y.id || `google-tool-${_ + 1}`,
          name: y.name || "",
          arguments: JSON.stringify(y.args || {})
        })).filter((y) => y.name), a = h, h.length) f = "";
        else {
          const y = vc(g);
          f = Tc(f, y);
        }
        m0(n, {
          text: f,
          thoughts: Array.from(p.values()).filter(Boolean).map((y, _) => ({
            label: `思考块 ${_ + 1}`,
            text: y
          }))
        });
      }
      o = m || { functionCalls: h }, s = Array.from(p.values()).filter(Boolean).map((g, y) => ({
        label: `思考块 ${y + 1}`,
        text: g
      })), i = a.length ? "" : f;
    } else
      o = await e.sendMessage(t), s = Sc(o), i = o.functionCalls?.length ? "" : vc(o);
    const u = (o.functionCalls || []).map((d, p) => ({
      id: d.id || `google-tool-${p + 1}`,
      name: d.name || "",
      arguments: JSON.stringify(d.args || {})
    })).filter((d) => d.name), c = u.length ? u : a;
    return {
      text: c.length ? "" : i,
      toolCalls: c,
      thoughts: s,
      finishReason: o.candidates?.[0]?.finishReason || "STOP",
      model: o.modelVersion || this.config.model,
      provider: "google"
    };
  }
  async chat(e) {
    if (Array.isArray(e.toolResponses) && e.toolResponses.length) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const n = { message: p0(e.toolResponses) };
      return await this.sendThroughChat(this.activeChat, n, e);
    }
    const t = this.createChat(e);
    return this.activeChat = t.chat, await this.sendThroughChat(this.activeChat, t.sendPayload, e);
  }
}, re = {
  LS: "LS",
  GLOB: "Glob",
  GREP: "Grep",
  READ: "Read",
  RUN_SLASH_COMMAND: "RunSlashCommand",
  READ_IDENTITY: "ReadIdentity",
  WRITE_IDENTITY: "WriteIdentity",
  READ_WORKLOG: "ReadWorklog",
  WRITE_WORKLOG: "WriteWorklog"
}, y0 = [
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
], _0 = [
  {
    type: "function",
    function: {
      name: re.LS,
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
      name: re.GLOB,
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
      name: re.GREP,
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
      name: re.READ,
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
      name: re.RUN_SLASH_COMMAND,
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
      name: re.READ_IDENTITY,
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
      name: re.WRITE_IDENTITY,
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
      name: re.READ_WORKLOG,
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
      name: re.WRITE_WORKLOG,
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
function v0(e, t = null) {
  try {
    return JSON.parse(e || "null");
  } catch {
    return t;
  }
}
function Ec(e = [], t) {
  const n = e.slice(0, 3), o = [];
  return n.forEach((s) => o.push(t(s))), e.length > n.length && o.push(`……其余 ${e.length - n.length} 项见详细结果`), o;
}
function S0(e, t = {}) {
  switch (e) {
    case re.LS:
      return `查看目录 ${t.path || ""}`.trim();
    case re.GLOB:
      return `匹配文件 ${t.pattern || ""}`.trim();
    case re.GREP:
      return `搜索内容 ${t.pattern || ""}`.trim();
    case re.READ:
      return `读取文件 ${t.path || ""}${t.startLine ? `:${t.startLine}` : ""}${t.endLine ? `-${t.endLine}` : ""}`.trim();
    case re.RUN_SLASH_COMMAND:
      return `执行斜杠命令 ${t.command || ""}`.trim();
    case re.READ_IDENTITY:
      return "读取身份设定";
    case re.WRITE_IDENTITY:
      return "写入身份设定";
    case re.READ_WORKLOG:
      return "读取工作记录";
    case re.WRITE_WORKLOG:
      return `写入工作记录 ${t.name || ""}`.trim();
    default:
      return `调用工具 ${e}`;
  }
}
function ih(e) {
  const t = v0(e.content, null);
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
  if (e.toolName === re.GLOB) {
    const n = Array.isArray(t.items) ? t.items : [], o = [`glob“${t.pattern || ""}”命中 ${t.total || 0} 个文件，当前展示 ${n.length} 个。`];
    t.truncated && o.push("结果已截断，可以把模式或路径范围再收窄一点。"), n.length && (o.push(""), o.push(...Ec(n, (i) => `- ${i.publicPath}${i.source ? ` [${i.source}]` : ""}`)));
    const s = n.map((i) => `- ${i.publicPath}${i.source ? ` [${i.source}]` : ""}`);
    return {
      summary: o.join(`
`),
      details: s.join(`
`)
    };
  }
  if (e.toolName === re.LS) {
    const n = Array.isArray(t.items) ? t.items : [], o = [`目录 ${t.directoryPath || ""} 下找到 ${t.total || 0} 个一级子项，当前展示 ${n.length} 个。`];
    t.truncated && o.push("结果已截断，可以把目录范围再收窄一点。"), n.length && (o.push(""), o.push(...Ec(n, (i) => `- ${i.publicPath}${i.type === "directory" ? " [目录]" : ""}`)));
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
  if (e.toolName === re.GREP) {
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
  if (e.toolName === re.READ) {
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
  if (e.toolName === re.RUN_SLASH_COMMAND) {
    const n = [`已执行斜杠命令：${t.command || ""}`, t.ok === !1 ? "状态：失败" : "状态：成功"];
    t.error && n.push(`错误：${t.error}`), t.note && n.push(`说明：${t.note}`);
    let o = "";
    return t.result !== void 0 ? o = typeof t.result == "string" ? t.result : JSON.stringify(t.result, null, 2) : t.raw && (o = typeof t.raw == "string" ? t.raw : JSON.stringify(t.raw, null, 2)), {
      summary: n.filter(Boolean).join(`
`),
      details: o
    };
  }
  return e.toolName === re.WRITE_IDENTITY ? {
    summary: [`身份设定已写入 ${t.name || "LittleWhiteBox_Assistant_Identity.md"}`.trim(), t.hotUpdated ? "当前会话身份已同步刷新。" : ""].filter(Boolean).join(`
`),
    details: ""
  } : e.toolName === re.READ_IDENTITY ? {
    summary: t.exists ? `已读取身份设定：${t.name || "LittleWhiteBox_Assistant_Identity.md"}` : `身份设定还不存在：${t.name || "LittleWhiteBox_Assistant_Identity.md"}`,
    details: t.exists ? String(t.content || "") : ""
  } : e.toolName === re.WRITE_WORKLOG ? {
    summary: `工作记录已写入 ${t.name || ""}`.trim(),
    details: ""
  } : e.toolName === re.READ_WORKLOG ? {
    summary: t.exists ? `已读取工作记录：${t.name || "LittleWhiteBox_Assistant_Worklog.md"}` : `工作记录还不存在：${t.name || "LittleWhiteBox_Assistant_Worklog.md"}`,
    details: t.exists ? String(t.content || "") : ""
  } : {
    summary: JSON.stringify(t, null, 2),
    details: ""
  };
}
var T0 = 3.35, E0 = /* @__PURE__ */ new Set(["openai-compatible", "openai-responses"]), b0 = new TextEncoder();
function w0(e) {
  const { state: t, pendingToolCalls: n, pendingApprovals: o, persistSession: s, render: i, showToast: a, post: u, createRequestId: c, safeJsonParse: d, describeError: p, describeToolCall: f, formatToolResultDisplay: h, buildTextWithAttachmentSummary: m, buildUserContentParts: g, normalizeAttachments: y, normalizeThoughtBlocks: _, normalizeSlashCommand: S, shouldRequireSlashCommandApproval: b, setApprovalStatus: A, buildSlashApprovalResult: R, isAbortError: $, createAdapter: w, getActiveProviderConfig: v, getSystemPrompt: I, SYSTEM_PROMPT: P, SUMMARY_SYSTEM_PROMPT: U, HISTORY_SUMMARY_PREFIX: O, MAX_CONTEXT_TOKENS: ne, SUMMARY_TRIGGER_TOKENS: Z, DEFAULT_PRESERVED_TURNS: ee, MIN_PRESERVED_TURNS: L, MAX_TOOL_ROUNDS: V, REQUEST_TIMEOUT_MS: K, TOOL_DEFINITIONS: ie, TOOL_NAMES: le } = e;
  let Ge = !1, pt = 0, dn = "", ht = "", Ft = 0, fn = 0;
  function ho() {
    const C = typeof I == "function" ? I() : P;
    return String(C || P).trim() || P;
  }
  function Js() {
    t.historySummary = "", t.archivedTurnCount = 0, t.contextStats = {
      usedTokens: 0,
      budgetTokens: ne,
      summaryActive: !1
    };
  }
  function pn() {
    return t.historySummary?.trim() ? {
      role: "system",
      content: `${O}
${t.historySummary.trim()}`
    } : null;
  }
  function wt() {
    const C = t.activeRun?.lightBrakeMessage;
    return C ? {
      role: "system",
      content: C
    } : null;
  }
  function pa(C) {
    return `${Math.max(0, Math.round((Number(C) || 0) / 1e3))}k`;
  }
  function Ws(C = t.contextStats) {
    return `${pa(C.usedTokens)}/${pa(C.budgetTokens)}`;
  }
  function mo(C, x = 1800) {
    const M = String(C || "").replace(/\s+/g, " ").trim();
    return M.length <= x ? M : `${M.slice(0, x)}…`;
  }
  function ha(C) {
    if (C.role === "tool") return mo(h(C).summary || C.content || "", 1400);
    if (C.role === "assistant" && Array.isArray(C.toolCalls) && C.toolCalls.length) {
      const x = C.toolCalls.map((M) => `工具: ${M.name} ${M.arguments || "{}"}`.trim());
      return mo([C.content || "", ...x].filter(Boolean).join(`
`), 1600);
    }
    return mo(m(C.content || "", C.attachments), 1600);
  }
  function Ks(C = t.messages) {
    const x = [];
    let M = [];
    return (C || []).forEach((D) => {
      if (D.role === "user" && M.length) {
        x.push(M), M = [D];
        return;
      }
      M.push(D);
    }), M.length && x.push(M), x.filter((D) => D.length);
  }
  function wh(C, x = "") {
    const M = [];
    return x?.trim() && (M.push("已有历史摘要:"), M.push(x.trim()), M.push("")), C.forEach((D, J) => {
      M.push(`第 ${J + 1} 段历史:`), D.forEach((j) => {
        const ae = j.role === "user" ? "用户" : j.role === "assistant" ? "助手" : `工具${j.toolName ? `(${j.toolName})` : ""}`;
        M.push(`${ae}: ${ha(j) || "[空]"}`);
      }), M.push("");
    }), M.join(`
`).trim();
  }
  function Ah(C, x = "") {
    const M = [];
    return x?.trim() && M.push(x.trim()), C.forEach((D, J) => {
      const j = D.map((ae) => `${ae.role === "user" ? "用户" : ae.role === "assistant" ? "助手" : `工具${ae.toolName ? `(${ae.toolName})` : ""}`}: ${ha(ae) || "[空]"}`).join(`
`);
      M.push(`补充历史 ${J + 1}:
${j}`);
    }), mo(M.join(`

`), 6e3);
  }
  function Ch() {
    let C = !1;
    return t.messages = t.messages.map((x) => {
      if (x?.role !== "assistant") return x;
      const M = Array.isArray(x.thoughts) && x.thoughts.length, D = !!x.providerPayload;
      return !M && !D ? x : (C = !0, {
        ...x,
        thoughts: [],
        providerPayload: void 0
      });
    }), C;
  }
  function Ih() {
    const C = Ks();
    return C.length ? C[C.length - 1] : [];
  }
  function ma(C = [], x = null) {
    const M = _(C);
    if (!M.length) return M;
    const D = /* @__PURE__ */ new Set();
    return Ih().forEach((J) => {
      J === x || J?.role !== "assistant" || _(J.thoughts).forEach((j) => {
        D.add(`${j.label}\0${j.text}`);
      });
    }), M.filter((J) => !D.has(`${J.label}\0${J.text}`));
  }
  function xh(C = []) {
    return C.map((x) => {
      const M = Array.isArray(x.content) ? x.content.map((D) => !D || typeof D != "object" ? "" : D.type === "text" ? D.text || "" : D.type === "image_url" ? `[image:${D.name || D.mimeType || "image"}]` : "").filter(Boolean).join(`
`) : x.content || "";
      return x.role === "assistant" && Array.isArray(x.tool_calls) && x.tool_calls.length ? {
        role: "assistant",
        content: [M, x.tool_calls.map((D) => JSON.stringify({
          id: D.id,
          name: D.function?.name || "",
          arguments: D.function?.arguments || "{}"
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
  function zs(C = [], x = []) {
    return [...xh(C), {
      role: "system",
      content: x.length ? `TOOLS
${JSON.stringify(x)}` : ""
    }].filter((M) => M.content);
  }
  function Rh(C) {
    return Math.ceil(b0.encode(String(C || "")).length / T0);
  }
  function go({ messages: C = [], tools: x = [] } = {}) {
    return Rh(JSON.stringify(zs(C, x)));
  }
  function ga(C = [], x = ie) {
    const M = v();
    return JSON.stringify({
      provider: String(M?.provider || ""),
      model: String(M?.model || ""),
      messages: zs(C, x)
    });
  }
  function Ph(C) {
    const x = String(C?.model || "").trim();
    return x || (C?.provider === "anthropic" ? "claude" : "gpt-4o");
  }
  async function ya(C, x) {
    const M = await fetch(C, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(x)
    });
    if (!M.ok) throw new Error(`tokenizer_http_${M.status}`);
    return await M.json();
  }
  async function Mh(C = [], x = "") {
    if (!C.length) return 0;
    const M = `/api/tokenizers/openai/count?model=${encodeURIComponent(x || "gpt-4o")}`;
    let D = -1;
    for (const J of C) {
      const j = await ya(M, [J]), ae = Number(j?.token_count);
      if (!Number.isFinite(ae)) throw new Error("tokenizer_invalid_response");
      D += ae;
    }
    return Math.max(0, D);
  }
  async function Nh(C, x) {
    const M = await ya(C, { text: x }), D = Number(M?.count);
    if (!Number.isFinite(D)) throw new Error("tokenizer_invalid_response");
    return D;
  }
  async function _a({ messages: C = [], tools: x = [] } = {}) {
    const M = v(), D = String(M?.provider || ""), J = zs(C, x), j = JSON.stringify(J);
    try {
      if (E0.has(D)) return await Mh(J, Ph(M));
      if (D === "anthropic") return await Nh("/api/tokenizers/claude/encode", j);
    } catch {
      return go({
        messages: C,
        tools: x
      });
    }
    return go({
      messages: C,
      tools: x
    });
  }
  async function va(C = [], x = ie) {
    const M = ga(C, x), D = !!t.historySummary;
    let J = ht === M ? Ft : await _a({
      messages: C,
      tools: x
    });
    return Number.isFinite(J) || (J = go({
      messages: C,
      tools: x
    })), ht = M, Ft = J, dn = M, t.contextStats = {
      usedTokens: J,
      budgetTokens: ne,
      summaryActive: D
    }, J;
  }
  function kh(C = [], x = ie) {
    const M = ga(C, x), D = !!t.historySummary, J = ht === M ? Ft : go({
      messages: C,
      tools: x
    });
    if (dn = M, t.contextStats = {
      usedTokens: J,
      budgetTokens: ne,
      summaryActive: D
    }, ht === M) return;
    const j = ++fn;
    _a({
      messages: C,
      tools: x
    }).then((ae) => {
      if (j !== fn || dn !== M || !Number.isFinite(ae)) return;
      ht = M, Ft = ae;
      const oe = t.contextStats.usedTokens !== ae || t.contextStats.summaryActive !== D || t.contextStats.budgetTokens !== ne;
      t.contextStats = {
        usedTokens: ae,
        budgetTokens: ne,
        summaryActive: D
      }, oe && i();
    }).catch(() => {
    });
  }
  function Bt(C) {
    C?.role === "user" && Ch(), t.messages.push({
      ...C,
      attachments: y(C.attachments),
      thoughts: C?.role === "assistant" ? ma(C.thoughts) : _(C.thoughts)
    }), s();
  }
  function Lh(C) {
    return Array.isArray(C) ? C.filter((x) => x && typeof x == "object" && x.name).map((x, M) => ({
      id: String(x.id || c(`tool-${M + 1}`)),
      name: String(x.name || ""),
      arguments: typeof x.arguments == "string" ? x.arguments : JSON.stringify(x.arguments || {})
    })) : [];
  }
  function Sa({ persist: C = !1 } = {}) {
    const x = Date.now();
    if ((C || x - pt >= 1500) && (s(), pt = x), Ge) return;
    Ge = !0;
    const M = () => {
      Ge = !1, i();
    };
    if (typeof requestAnimationFrame == "function") {
      requestAnimationFrame(M);
      return;
    }
    setTimeout(M, 16);
  }
  function Dh() {
    const C = {
      role: "assistant",
      content: "",
      thoughts: [],
      streaming: !0
    };
    return t.messages.push(C), i(), C;
  }
  function Ta(C, x = {}) {
    C && (typeof x.content == "string" && (C.content = x.content), x.providerPayload && typeof x.providerPayload == "object" && (C.providerPayload = x.providerPayload), Array.isArray(x.thoughts) && (C.thoughts = ma(x.thoughts, C)), Array.isArray(x.toolCalls) && (C.toolCalls = Lh(x.toolCalls)), typeof x.streaming == "boolean" && (C.streaming = x.streaming));
  }
  function Ys(C, x = {}) {
    C && (Ta(C, {
      ...x,
      streaming: !1
    }), Sa({ persist: !0 }));
  }
  function $h(C, x) {
    for (const [M, D] of n.entries())
      D.runId === C && (n.delete(M), D.cleanup?.(), D.reject(x));
  }
  function Uh(C, x) {
    for (const [M, D] of o.entries())
      D.runId === C && (o.delete(M), A(M, "cancelled"), D.cleanup?.(), D.reject(x));
  }
  function Fh(C = "本轮请求已终止。") {
    const x = t.activeRun;
    x && (x.cancelNotice = C, t.progressLabel = "正在终止…", $h(x.id, /* @__PURE__ */ new Error("tool_aborted")), Uh(x.id, /* @__PURE__ */ new Error("tool_aborted")), x.controller.abort(), i());
  }
  function Xs(C = t.messages) {
    const x = [{
      role: "system",
      content: ho()
    }], M = pn(), D = wt();
    M && x.push(M), D && x.push(D);
    for (const J of C) {
      if (J.role === "assistant" && Array.isArray(J.toolCalls) && J.toolCalls.length) {
        x.push({
          role: "assistant",
          content: J.content || "",
          providerPayload: J.providerPayload,
          tool_calls: J.toolCalls.map((j) => ({
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
      if (J.role === "tool") {
        x.push({
          role: "tool",
          tool_call_id: J.toolCallId,
          content: J.content
        });
        continue;
      }
      x.push({
        role: J.role,
        providerPayload: J.providerPayload,
        content: J.role === "user" ? g(J) : J.content
      });
    }
    return x;
  }
  function Qs() {
    const C = Ks(), x = Math.min(t.archivedTurnCount, C.length);
    return C.slice(x).flat();
  }
  function Bh(C, x, M) {
    const D = String(M?.message || M || "tool_failed"), [J] = D.split(":");
    return {
      ok: !1,
      toolName: C,
      path: typeof x?.path == "string" ? x.path : "",
      error: J || "tool_failed",
      raw: D,
      message: p(M)
    };
  }
  function Ea(C, x, M) {
    if (!C || !x || !M) return;
    const D = `${x}::${M}`;
    C.toolErrorStreakKey === D ? C.toolErrorStreakCount += 1 : (C.toolErrorStreakKey = D, C.toolErrorStreakCount = 1), C.toolErrorStreakCount >= 3 && C.lastLightBrakeKey !== D && (C.lightBrakeMessage = `系统提醒：刚刚连续三次调用工具 \`${x}\` 都返回了同一个错误：\`${M}\`。请不要继续重复同一路径，改用别的工具、缩小范围，或先向用户确认缺失信息。`, C.lastLightBrakeKey = D);
  }
  function Gh(C) {
    C && (C.toolErrorStreakKey = "", C.toolErrorStreakCount = 0);
  }
  async function qh(C, x, M) {
    if (!x.length) return;
    const D = wh(x, t.historySummary), J = Ah(x, t.historySummary), j = v();
    try {
      const ae = await C.chat({
        systemPrompt: U,
        messages: [{
          role: "user",
          content: D
        }],
        tools: [],
        toolChoice: "none",
        temperature: Math.min(j.temperature ?? 0.2, 0.2),
        maxTokens: null,
        signal: M
      });
      t.historySummary = String(ae.text || "").trim() || J;
    } catch {
      t.historySummary = J;
    }
  }
  async function Oh(C, x) {
    const M = Ks(), D = [ee, L];
    let J = Qs(), j = Xs(J);
    if (await va(j), t.contextStats.usedTokens <= Z) return j;
    for (const ae of D) {
      const oe = Math.max(t.archivedTurnCount, M.length - Math.min(ae, M.length));
      if (oe > t.archivedTurnCount && (await qh(C, M.slice(t.archivedTurnCount, oe), x), t.archivedTurnCount = oe, s()), J = Qs(), j = Xs(J), await va(j), t.contextStats.usedTokens <= Z)
        return a(`已压缩较早历史，当前上下文 ${Ws()}`), i(), j;
    }
    return a(`最近对话本身已接近上限，当前上下文 ${Ws()}`), i(), j;
  }
  function Vh(C, x, M = {}) {
    const D = c("tool"), J = t.activeRun;
    return J && J.id === M.runId && J.toolRequestIds.add(D), new Promise((j, ae) => {
      let oe = !1, ce = null, ue = null;
      const Re = () => {
        ce && (clearTimeout(ce), ce = null), M.signal && ue && M.signal.removeEventListener("abort", ue);
        const We = t.activeRun;
        We && We.id === M.runId && We.toolRequestIds.delete(D);
      }, Te = (We) => {
        oe || (oe = !0, n.delete(D), Re(), ae(We));
      }, Ae = (We) => {
        oe || (oe = !0, n.delete(D), Re(), j(We));
      };
      if (ue = () => {
        u("xb-assistant:tool-abort", { requestId: D }), Te(/* @__PURE__ */ new Error("tool_aborted"));
      }, ce = setTimeout(() => {
        u("xb-assistant:tool-abort", { requestId: D }), Te(/* @__PURE__ */ new Error("tool_timeout"));
      }, K), n.set(D, {
        runId: M.runId,
        cleanup: Re,
        resolve: Ae,
        reject: Te
      }), M.signal) {
        if (M.signal.aborted) {
          ue();
          return;
        }
        M.signal.addEventListener("abort", ue, { once: !0 });
      }
      u("xb-assistant:tool-call", {
        requestId: D,
        name: C,
        arguments: x
      });
    });
  }
  function Hh(C, x = {}) {
    const M = c("approval"), D = t.activeRun?.id === x.runId ? t.activeRun : null;
    return Bt({
      role: "assistant",
      content: "这条斜杠命令会直接作用于你当前打开的真实酒馆实例。请确认是否继续执行。",
      approvalRequest: {
        id: M,
        kind: "slash-command",
        command: C,
        status: "pending"
      }
    }), i(), new Promise((J, j) => {
      let ae = !1, oe = null;
      const ce = () => {
        D && D.toolRequestIds.delete(M), x.signal && oe && x.signal.removeEventListener("abort", oe);
      }, ue = (Te) => {
        ae || (ae = !0, o.delete(M), ce(), J(Te));
      }, Re = (Te) => {
        ae || (ae = !0, o.delete(M), ce(), j(Te));
      };
      if (oe = () => {
        A(M, "cancelled"), Re(/* @__PURE__ */ new Error("tool_aborted"));
      }, D && D.toolRequestIds.add(M), o.set(M, {
        runId: x.runId,
        cleanup: ce,
        resolve: (Te) => {
          A(M, Te ? "approved" : "declined"), ue(Te);
        },
        reject: Re
      }), x.signal) {
        if (x.signal.aborted) {
          oe();
          return;
        }
        x.signal.addEventListener("abort", oe, { once: !0 });
      }
    });
  }
  async function Jh(C) {
    const x = w();
    let M = 0, D = null;
    for (; M < V; ) {
      if (C.controller.signal.aborted) throw new Error("assistant_aborted");
      M += 1, t.currentRound = M, t.progressLabel = "正在请求模型…", i();
      const J = v();
      let j = null;
      const ae = (ce = {}) => {
        const ue = typeof ce.text == "string", Re = Array.isArray(ce.thoughts);
        !ue && !Re || (j || (j = Dh()), Ta(j, {
          ...ue ? { content: ce.text } : {},
          ...Re ? { thoughts: ce.thoughts } : {}
        }), Sa());
      };
      let oe;
      try {
        const ce = {
          systemPrompt: ho(),
          tools: ie,
          toolChoice: "auto",
          temperature: J.temperature,
          maxTokens: J.maxTokens,
          reasoning: {
            enabled: J.reasoningEnabled,
            effort: J.reasoningEffort
          },
          signal: C.controller.signal,
          onStreamProgress: ae
        };
        Array.isArray(D) && D.length && x?.supportsSessionToolLoop ? ce.toolResponses = D : ce.messages = await Oh(x, C.controller.signal), oe = await x.chat(ce);
      } catch (ce) {
        throw j && Ys(j), ce;
      }
      if (Array.isArray(oe.toolCalls) && oe.toolCalls.length) {
        D = null, j ? Ys(j, {
          content: oe.text || "",
          thoughts: oe.thoughts,
          toolCalls: oe.toolCalls,
          providerPayload: oe.providerPayload
        }) : Bt({
          role: "assistant",
          content: oe.text || "",
          toolCalls: oe.toolCalls,
          thoughts: oe.thoughts,
          providerPayload: oe.providerPayload
        }), i();
        const ce = [];
        for (const ue of oe.toolCalls) {
          if (C.controller.signal.aborted) throw new Error("assistant_aborted");
          const Re = d(ue.arguments, {}), Te = ue.name === le.RUN_SLASH_COMMAND ? S(Re.command) : "";
          t.progressLabel = `正在${f(ue.name, Re)}…`, i();
          let Ae = null;
          try {
            ue.name === le.RUN_SLASH_COMMAND && b(Te) && (t.progressLabel = "等待你确认斜杠命令…", i(), await Hh(Te, {
              runId: C.id,
              signal: C.controller.signal
            }) || (Ae = R(Te, !1))), Ae || (Ae = await Vh(ue.name, Re, {
              runId: C.id,
              signal: C.controller.signal
            })), ue.name === le.RUN_SLASH_COMMAND && Te && Ae?.ok !== !1 && b(Te) && (Ae = {
              ...Ae,
              approval: R(Te, !0)
            }), Ae?.ok === !1 && Ae.error !== "user_declined" ? Ea(C, ue.name, Ae.error || "tool_failed") : Gh(C);
          } catch (We) {
            if ($(We)) throw We;
            Ae = Bh(ue.name, Re, We), Ea(C, ue.name, Ae.error);
          }
          Bt({
            role: "tool",
            toolCallId: ue.id,
            toolName: ue.name,
            content: JSON.stringify(Ae, null, 2)
          }), ce.push({
            id: ue.id,
            name: ue.name,
            response: Ae
          }), i();
        }
        x?.supportsSessionToolLoop && (D = ce);
        continue;
      }
      D = null, j ? Ys(j, {
        content: oe.text || "没有拿到有效回复。",
        thoughts: oe.thoughts,
        providerPayload: oe.providerPayload
      }) : Bt({
        role: "assistant",
        content: oe.text || "没有拿到有效回复。",
        thoughts: oe.thoughts,
        providerPayload: oe.providerPayload
      }), t.progressLabel = "", i();
      return;
    }
    Bt({
      role: "assistant",
      content: `这轮工具调用已经到上限了（${V}/${V}）。你可以把问题再收窄一点，比如直接给我模块名、设置项名或报错文本。`
    }), t.progressLabel = "", i();
  }
  return {
    resetCompactionState: Js,
    buildContextMeterLabel: Ws,
    updateContextStats: kh,
    pushMessage: Bt,
    cancelActiveRun: Fh,
    toProviderMessages: Xs,
    getActiveContextMessages: Qs,
    runAssistantLoop: Jh
  };
}
var rh = "openai-compatible", ah = "默认", _r = {
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
function ia() {
  return JSON.parse(JSON.stringify(_r));
}
function ra() {
  return {
    provider: rh,
    modelConfigs: ia()
  };
}
function oo(e) {
  return String(e || "").trim() || "默认";
}
function A0(e = {}) {
  const t = ia();
  return Object.keys(_r).forEach((n) => {
    t[n] = {
      ..._r[n],
      ...e && typeof e[n] == "object" ? e[n] : {}
    };
  }), t;
}
function C0(e) {
  return typeof e == "string" && e.trim() ? e : rh;
}
function I0(e = {}, t) {
  return e && typeof e.presets == "object" && e.presets ? e.presets : e?.modelConfigs ? { [t]: {
    provider: e.provider || "openai-compatible",
    modelConfigs: e.modelConfigs
  } } : {};
}
function x0(e = {}, t) {
  const n = {}, o = I0(e, t);
  return Object.entries(o).forEach(([s, i]) => {
    if (!i || typeof i != "object") return;
    const a = oo(s);
    n[a] = {
      provider: C0(i.provider),
      modelConfigs: A0(i.modelConfigs || {})
    };
  }), Object.keys(n).length || (n[ah] = ra()), n;
}
function R0(e, t) {
  const n = oo(t);
  return e[n] ? n : Object.keys(e)[0];
}
function lh(e = {}) {
  const t = x0(e, oo(e.currentPresetName || e.presetDraftName || "默认")), n = R0(t, e.currentPresetName), o = t[n] || ra();
  return {
    workspaceFileName: String(e.workspaceFileName || ""),
    currentPresetName: n,
    presetDraftName: oo(e.presetDraftName || n),
    presetNames: Object.keys(t),
    presets: t,
    provider: o.provider,
    modelConfigs: o.modelConfigs
  };
}
var P0 = /* @__PURE__ */ new Set([
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
]), M0 = /* @__PURE__ */ new Set([
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
function aa(e) {
  const t = String(e || "").trim();
  return t ? t.startsWith("/") ? t : `/${t}` : "";
}
function uh(e) {
  const t = aa(e);
  if (!t) return "";
  const n = t.slice(1).trim();
  return n ? n.split(/\s+/)[0].toLowerCase() : "";
}
function N0(e) {
  const t = aa(e);
  if (!t) return "";
  const n = t.slice(1).trim();
  if (!n) return "";
  const o = n.search(/\s/);
  return o < 0 ? "" : n.slice(o + 1).trim();
}
function vr(e) {
  const t = String(e || "").trim();
  return t ? t.match(/(?:[^\s"]+|"[^"]*")+/g) || [] : [];
}
function is(e) {
  const t = vr(e), n = /* @__PURE__ */ new Map(), o = [];
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
function k0(e) {
  const t = String(e || "").trim();
  return t.length >= 2 && (t.startsWith('"') && t.endsWith('"') || t.startsWith("'") && t.endsWith("'")) ? t.slice(1, -1) : t;
}
function Ei(e) {
  const t = k0(e).toLowerCase();
  return [
    "false",
    "off",
    "0",
    "no"
  ].includes(t);
}
function bi(e, t = [], n = {}) {
  const { allowPositional: o = !1 } = n, s = is(e);
  return !o && s.positional.length ? !1 : Array.from(s.named.keys()).every((i) => t.includes(i));
}
function L0(e) {
  const t = uh(e);
  if (!t) return !1;
  if (P0.has(t)) return !0;
  const n = N0(e);
  if (!M0.has(t)) return !1;
  switch (t) {
    case "api":
    case "context":
    case "model":
      return bi(n, ["quiet"]);
    case "tokenizer":
      return vr(n).length === 0;
    case "api-url":
      return bi(n, [
        "api",
        "connect",
        "quiet"
      ]);
    case "instruct":
      return bi(n, ["quiet", "forceGet"]);
    case "instruct-state":
      return vr(n).length === 0;
    case "getchatbook": {
      const o = is(n);
      return !o.positional.length && !o.named.has("name") && o.named.has("create") && Ei(o.named.get("create"));
    }
    case "getpersonabook": {
      const o = is(n);
      return o.positional.length || o.named.has("name") ? !1 : o.named.size ? o.named.size === 1 && o.named.has("create") && Ei(o.named.get("create")) : !0;
    }
    case "getcharbook": {
      const o = is(n), s = ["type", "create"];
      return !Array.from(o.named.keys()).every((i) => s.includes(i)) || o.named.has("name") || o.named.has("create") && !Ei(o.named.get("create")) ? !1 : o.positional.length <= 1;
    }
    default:
      return !1;
  }
}
function D0(e) {
  return uh(e) ? !L0(e) : !1;
}
var wi = "littlewhitebox.assistant.session.v2", $0 = 60, bc = 16e3;
function ch(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function U0(e) {
  const t = ch(e?.providerPayload);
  if (!(!t || typeof t != "object" || !Object.keys(t).length))
    return t;
}
function F0(e) {
  const t = ch(e?.providerPayload);
  if (!(!t || typeof t != "object" || !Object.keys(t).length))
    return t;
}
function rs(e) {
  const t = String(e || "");
  return t.length <= bc ? t : `${t.slice(0, bc)}

[内容过长，已截断保存]`;
}
function B0(e, t, n) {
  const o = e?.approvalRequest && typeof e.approvalRequest == "object" ? {
    id: String(e.approvalRequest.id || ""),
    kind: String(e.approvalRequest.kind || ""),
    command: String(e.approvalRequest.command || ""),
    status: String(e.approvalRequest.status || "")
  } : null;
  return {
    role: e.role,
    content: rs(e.content),
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
      arguments: rs(s.arguments || "{}")
    })) : [],
    thoughts: n(e.thoughts).map((s) => ({
      label: s.label,
      text: rs(s.text)
    })),
    providerPayload: U0(e),
    approvalRequest: o && o.status && o.status !== "pending" ? o : void 0
  };
}
function G0(e, t) {
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
    providerPayload: F0(e),
    approvalRequest: i?.status && i.status !== "pending" ? i : void 0
  };
}
function q0(e) {
  return !(!e || typeof e != "object" || e.streaming || e.approvalRequest?.status === "pending");
}
function O0(e) {
  const { state: t, storage: n = globalThis.localStorage, safeJsonParse: o, createRequestId: s, normalizeAttachments: i, normalizeThoughtBlocks: a, getActiveContextMessages: u } = e;
  function c() {
    try {
      const p = u().filter(q0).slice(-$0), f = rs(t.historySummary || "");
      if (!p.length && !f) {
        n.removeItem(wi);
        return;
      }
      n.setItem(wi, JSON.stringify({
        messages: p.map((h) => B0(h, i, a)),
        historySummary: f,
        sidebarCollapsed: t.sidebarCollapsed
      }));
    } catch {
    }
  }
  function d() {
    try {
      const p = o(n.getItem(wi), {});
      t.messages = Array.isArray(p.messages) ? p.messages.map((f) => G0(f, {
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
function V0(e) {
  const { state: t, showToast: n, render: o, acceptedImageMimeTypes: s, maxImageAttachments: i, maxImageFileBytes: a } = e;
  function u(S) {
    return Array.isArray(S) ? S.map((b) => {
      if (!b || typeof b != "object" || b.kind !== "image") return null;
      const A = String(b.type || "").trim().toLowerCase(), R = typeof b.dataUrl == "string" ? b.dataUrl.trim() : "", $ = R.startsWith("data:image/");
      return A && !s.includes(A) ? null : {
        kind: "image",
        name: String(b.name || "image").trim() || "image",
        type: A || "image/png",
        dataUrl: $ ? R : "",
        size: Math.max(0, Number(b.size) || 0)
      };
    }).filter(Boolean) : [];
  }
  function c(S) {
    const b = u(S);
    if (!b.length) return "";
    const A = b.map((R) => R.name).join("、");
    return `[附图 ${b.length} 张：${A}]`;
  }
  function d(S, b) {
    const A = c(b), R = String(S || "").trim();
    return A ? [R, A].filter(Boolean).join(`
`) : R;
  }
  function p(S = {}) {
    const b = u(S.attachments).filter((R) => R.dataUrl), A = [];
    return S.content?.trim() && A.push({
      type: "text",
      text: S.content.trim()
    }), b.forEach((R) => {
      A.push({
        type: "image_url",
        image_url: { url: R.dataUrl },
        mimeType: R.type,
        name: R.name
      });
    }), A.length ? A : [{
      type: "text",
      text: ""
    }];
  }
  function f(S) {
    return new Promise((b, A) => {
      const R = new FileReader();
      R.onerror = () => A(/* @__PURE__ */ new Error(`读取图片失败：${S.name || "未命名图片"}`)), R.onload = () => {
        b({
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
    const b = typeof S?.name == "string" ? S.name.trim() : "";
    if (b) return b;
    const A = m(S?.type);
    return `clipboard-image-${Date.now()}.${A}`;
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
    const b = Array.isArray(S) ? S.filter(Boolean) : [], A = Math.max(0, i - t.draftAttachments.length);
    if (!A) return {
      validFiles: [],
      rejectedReason: `最多只能附 ${i} 张图片`,
      reachedLimit: !0,
      hadOverflow: !1
    };
    const R = b.slice(0, A), $ = [];
    let w = "";
    return R.forEach((v) => {
      if (!s.includes(v.type)) {
        w = "只支持 PNG、JPG、WEBP、GIF 图片";
        return;
      }
      if ((Number(v.size) || 0) > a) {
        w = `单张图片不能超过 ${Math.round(a / (1024 * 1024))}MB`;
        return;
      }
      $.push(v);
    }), {
      validFiles: $,
      rejectedReason: w,
      reachedLimit: !1,
      hadOverflow: b.length > A
    };
  }
  async function y(S) {
    const b = Array.isArray(S) ? S.filter(Boolean) : [];
    if (!b.length) return !1;
    const { validFiles: A, rejectedReason: R, reachedLimit: $, hadOverflow: w } = g(b);
    if (!A.length)
      return n(R || "没有可添加的图片"), $ || !!R;
    try {
      const v = await Promise.all(A.map((I) => f(I)));
      return t.draftAttachments = [...t.draftAttachments, ...v].slice(0, i), o(), (R || w) && n(R || `最多只能附 ${i} 张图片`), !0;
    } catch (v) {
      return n(String(v?.message || "读取图片失败")), !0;
    }
  }
  function _(S, b = [], A = {}) {
    const R = u(b);
    S.replaceChildren(), S.style.display = R.length ? "" : "none", R.length && R.forEach(($, w) => {
      const v = document.createElement("div");
      if (v.className = A.compact ? "xb-assistant-attachment-card compact" : "xb-assistant-attachment-card", $.dataUrl) {
        const P = document.createElement("img");
        P.className = "xb-assistant-attachment-image", P.src = $.dataUrl, P.alt = $.name, v.appendChild(P);
      } else {
        const P = document.createElement("div");
        P.className = "xb-assistant-attachment-placeholder", P.textContent = "图片", v.appendChild(P);
      }
      const I = document.createElement("div");
      if (I.className = "xb-assistant-attachment-name", I.textContent = $.name, v.appendChild(I), typeof A.onRemove == "function") {
        const P = document.createElement("button");
        P.type = "button", P.className = "xb-assistant-attachment-remove", P.textContent = "×", P.title = "移除图片", P.addEventListener("click", () => A.onRemove(w)), v.appendChild(P);
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
var H0 = { chat: { exclude: [
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
function Vo(e, t, n = "") {
  if (e.replaceChildren(), n) {
    const o = document.createElement("option");
    o.value = "", o.textContent = n, e.appendChild(o);
  }
  t.forEach((o) => {
    const s = document.createElement("option");
    s.value = o.value, s.textContent = o.label, e.appendChild(s);
  });
}
function la(e = []) {
  const t = [...new Set(e.filter(Boolean).map((s) => String(s).trim()).filter(Boolean))], n = H0.chat, o = t.filter((s) => {
    const i = s.toLowerCase();
    return !n.exclude.some((a) => i.includes(a));
  });
  return o.length ? o : t;
}
function qs(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function so(e = []) {
  return [...new Set(e.filter(Boolean).map((t) => String(t).trim()).filter(Boolean))];
}
function J0(e) {
  const t = qs(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return so([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return so([`${t}/v1/models`, `${t}/models`]);
}
function W0(e) {
  const t = qs(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return so([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return so([`${t}/v1/models`, `${t}/models`]);
}
function K0(e, t) {
  const n = qs(e);
  if (!n) return [];
  const o = n.endsWith("/v1beta") ? n.slice(0, -7) : n;
  return so([
    `${n}/models?key=${encodeURIComponent(t)}`,
    `${n}/models`,
    `${o}/v1beta/models?key=${encodeURIComponent(t)}`,
    `${o}/v1beta/models`,
    `${o}/models?key=${encodeURIComponent(t)}`,
    `${o}/models`
  ]);
}
function z0(e, t) {
  const n = [
    e?.error?.message,
    e?.message,
    e?.detail,
    e?.details,
    e?.error
  ].find((o) => typeof o == "string" && o.trim());
  return n ? n.trim() : String(t || "").trim().slice(0, 160);
}
async function Y0(e, t = {}) {
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
    errorSnippet: z0(s, o)
  };
}
function X0(e) {
  return la((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function Q0(e) {
  return la((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function Z0(e) {
  return la((e?.models || e?.data || []).map((t) => String(t?.id || t?.name || "")).map((t) => t.split("/").pop() || "").filter(Boolean));
}
async function Ai({ urls: e, requestOptionsList: t, extractModels: n, providerLabel: o }) {
  let s = null;
  for (const i of e) for (const a of t) {
    const u = await Y0(i, a);
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
async function j0(e) {
  const t = e.provider, n = qs(e.baseUrl || ""), o = String(e.apiKey || "").trim();
  if (!o) throw new Error("请先填写 API Key。");
  if (!n) throw new Error("请先填写 Base URL。");
  return t === "google" ? await Ai({
    urls: K0(n, o),
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
    extractModels: Z0,
    providerLabel: "Google AI"
  }) : t === "anthropic" ? await Ai({
    urls: W0(n),
    requestOptionsList: [{ headers: {
      "x-api-key": o,
      "anthropic-version": "2023-06-01",
      Accept: "application/json"
    } }],
    extractModels: Q0,
    providerLabel: "Anthropic"
  }) : await Ai({
    urls: J0(n),
    requestOptionsList: [{ headers: {
      Authorization: `Bearer ${o}`,
      Accept: "application/json"
    } }],
    extractModels: X0,
    providerLabel: t === "openai-responses" ? "OpenAI Responses" : "OpenAI-Compatible"
  });
}
function eA(e) {
  const { state: t, post: n, render: o, showToast: s, beginConfigSave: i, requestConfigFormSync: a, describeError: u, getPullState: c, setPullState: d, setProviderModels: p, getProviderModels: f, getProviderLabel: h, normalizeReasoningEffort: m, normalizeAssistantConfig: g, normalizePresetName: y, buildDefaultPreset: _, cloneDefaultModelConfigs: S, createRequestId: b, defaultPresetName: A, requestTimeoutMs: R, toolModeOptions: $, reasoningEffortOptions: w } = e;
  function v() {
    const L = t.config || {}, V = L.provider || "openai-compatible", K = (L.modelConfigs || {})[V] || {};
    return {
      provider: V,
      baseUrl: K.baseUrl || "",
      model: K.model || "",
      apiKey: K.apiKey || "",
      temperature: Number(K.temperature ?? 0.2),
      maxTokens: null,
      timeoutMs: R,
      toolMode: K.toolMode || "native",
      reasoningEnabled: !!K.reasoningEnabled,
      reasoningEffort: m(K.reasoningEffort)
    };
  }
  function I(L, V) {
    return {
      baseUrl: L.querySelector("#xb-assistant-base-url").value.trim(),
      model: L.querySelector("#xb-assistant-model").value.trim(),
      apiKey: L.querySelector("#xb-assistant-api-key").value.trim(),
      temperature: Number(((t.config?.modelConfigs || {})[V] || {}).temperature ?? 0.2),
      reasoningEnabled: L.querySelector("#xb-assistant-reasoning-enabled")?.checked || !1,
      reasoningEffort: m(L.querySelector("#xb-assistant-reasoning-effort")?.value),
      toolMode: V === "openai-compatible" ? L.querySelector("#xb-assistant-tool-mode")?.value || "native" : void 0
    };
  }
  function P(L) {
    t.config && (t.config.presetDraftName = y(L.querySelector("#xb-assistant-preset-name")?.value));
  }
  function U(L, V = {}) {
    if (!t.config) return;
    P(L);
    const K = V.providerOverride || L.querySelector("#xb-assistant-provider").value, ie = y(t.config.currentPresetName);
    t.config = {
      ...g({
        ...t.config,
        currentPresetName: ie,
        presetDraftName: t.config.presetDraftName,
        presets: {
          ...t.config.presets || {},
          [ie]: {
            ...(t.config.presets || {})[ie] || _(),
            provider: K,
            modelConfigs: {
              ...((t.config.presets || {})[ie] || {}).modelConfigs || S(),
              [K]: {
                ...(((t.config.presets || {})[ie] || {}).modelConfigs || S())[K] || {},
                ...I(L, K)
              }
            }
          }
        }
      }),
      provider: K
    };
  }
  function O(L) {
    if (!t.config) return;
    const V = t.config.provider || "openai-compatible", K = (t.config.modelConfigs || {})[V] || {}, ie = f(V), le = L.querySelector("#xb-assistant-tool-mode-wrap"), Ge = L.querySelector("#xb-assistant-tool-mode"), pt = L.querySelector("#xb-assistant-reasoning-enabled"), dn = L.querySelector("#xb-assistant-reasoning-effort-wrap"), ht = L.querySelector("#xb-assistant-reasoning-effort"), Ft = L.querySelector("#xb-assistant-model-pulled"), fn = L.querySelector("#xb-assistant-preset-select"), ho = L.querySelector("#xb-assistant-preset-name");
    Vo(fn, (t.config.presetNames || []).map((wt) => ({
      value: wt,
      label: wt
    }))), fn.value = t.config.currentPresetName || A, ho.value = t.config.presetDraftName || t.config.currentPresetName || A, L.querySelector("#xb-assistant-provider").value = V, L.querySelector("#xb-assistant-base-url").value = K.baseUrl || "", L.querySelector("#xb-assistant-model").value = K.model || "", L.querySelector("#xb-assistant-api-key").value = K.apiKey || "", le.style.display = V === "openai-compatible" ? "" : "none", Vo(Ge, $), Ge.value = K.toolMode || "native", Vo(ht, w), pt.checked = !!K.reasoningEnabled, ht.value = m(K.reasoningEffort), dn.style.display = pt.checked ? "" : "none", Vo(Ft, ie.map((wt) => ({
      value: wt,
      label: wt
    })), "手动填写");
    const Js = L.querySelector("#xb-assistant-runtime"), pn = c(V);
    Js.textContent = t.runtime ? `预设「${t.config.currentPresetName || A}」 · ${h(V)} · 已索引 ${t.runtime.indexedFileCount || 0} 个前端源码文件${pn.message ? ` · ${pn.message}` : ""}` : pn.message || "";
  }
  function ne(L) {
    U(L);
    const V = y(L.querySelector("#xb-assistant-preset-name")?.value), K = y(t.config?.currentPresetName || A), ie = (t.config?.presets || {})[V];
    if (V !== K && ie) {
      s(`预设「${V}」已存在，请从下拉切换到它；如果要新建，请换个名字。`), o();
      return;
    }
    const le = (t.config?.presets || {})[K] || _(), Ge = {
      ...t.config?.presets || {},
      [V]: le
    };
    t.config = g({
      ...t.config,
      currentPresetName: V,
      presetDraftName: V,
      presets: Ge
    }), a();
    const pt = b("save-config");
    i(pt), n("xb-assistant:save-config", {
      requestId: pt,
      workspaceFileName: t.config?.workspaceFileName || "",
      currentPresetName: t.config?.currentPresetName || A,
      presets: t.config?.presets || {}
    });
  }
  function Z(L) {
    if (U(L), Object.keys(t.config?.presets || {}).length <= 1) {
      s("至少要保留一套预设");
      return;
    }
    const V = y(t.config?.currentPresetName || A), K = { ...t.config?.presets || {} };
    delete K[V];
    const ie = Object.keys(K)[0] || A;
    t.config = g({
      ...t.config,
      currentPresetName: ie,
      presetDraftName: ie,
      presets: K
    }), a(), n("xb-assistant:save-config", {
      workspaceFileName: t.config?.workspaceFileName || "",
      currentPresetName: t.config?.currentPresetName || A,
      presets: t.config?.presets || {}
    }), o();
  }
  function ee(L) {
    L.querySelector("#xb-assistant-provider").addEventListener("change", (V) => {
      const K = t.config?.provider || "openai-compatible", ie = V.currentTarget.value;
      U(L, { providerOverride: K });
      const le = y(t.config?.currentPresetName || A);
      t.config = g({
        ...t.config,
        currentPresetName: le,
        presetDraftName: t.config?.presetDraftName || le,
        presets: {
          ...t.config?.presets || {},
          [le]: {
            ...(t.config?.presets || {})[le] || _(),
            provider: ie
          }
        }
      }), a(), o();
    }), L.querySelector("#xb-assistant-preset-select").addEventListener("change", (V) => {
      U(L);
      const K = y(V.currentTarget.value), ie = (t.config?.presets || {})[K] || _();
      t.config = g({
        ...t.config,
        currentPresetName: K,
        presetDraftName: K,
        provider: ie.provider,
        modelConfigs: ie.modelConfigs
      }), a(), o();
    }), L.querySelector("#xb-assistant-preset-name").addEventListener("input", () => {
      P(L);
    }), L.querySelector("#xb-assistant-base-url").addEventListener("input", () => {
      U(L);
    }), L.querySelector("#xb-assistant-model").addEventListener("input", () => {
      U(L);
    }), L.querySelector("#xb-assistant-api-key").addEventListener("input", () => {
      U(L);
    }), L.querySelector("#xb-assistant-model-pulled").addEventListener("change", (V) => {
      const K = V.currentTarget.value;
      K && (L.querySelector("#xb-assistant-model").value = K, U(L));
    }), L.querySelector("#xb-assistant-toggle-key").addEventListener("click", () => {
      const V = L.querySelector("#xb-assistant-api-key");
      V.type = V.type === "password" ? "text" : "password", o();
    }), L.querySelector("#xb-assistant-reasoning-enabled").addEventListener("change", () => {
      U(L), a(), o();
    }), L.querySelector("#xb-assistant-reasoning-effort").addEventListener("change", () => {
      U(L);
    }), L.querySelector("#xb-assistant-pull-models").addEventListener("click", async () => {
      U(L), a();
      const V = v();
      d(V.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }), o();
      try {
        const K = await j0(V);
        p(V.provider, K), d(V.provider, {
          status: "success",
          message: `已拉取 ${K.length} 个模型`
        });
      } catch (K) {
        p(V.provider, []), d(V.provider, {
          status: "error",
          message: u(K)
        });
      }
      a(), o();
    }), L.querySelector("#xb-assistant-save").addEventListener("click", () => {
      ne(L);
    }), L.querySelector("#xb-assistant-delete-preset").addEventListener("click", () => {
      Z(L);
    });
  }
  return {
    getActiveProviderConfig: v,
    syncCurrentProviderDraft: U,
    syncConfigToForm: O,
    bindSettingsPanelEvents: ee
  };
}
function tA(e) {
  const { state: t, examplePrompts: n, toolNames: o, formatToolResultDisplay: s, normalizeThoughtBlocks: i, normalizeAttachments: a, renderAttachmentGallery: u } = e;
  let c = !1, d = null;
  function p(v) {
    return String(v || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function f(v) {
    const I = String(v || "").trim();
    if (!I) return "";
    try {
      const P = globalThis.parent?.showdown || globalThis.showdown, U = globalThis.parent?.DOMPurify || globalThis.DOMPurify;
      if (P?.Converter && U?.sanitize) {
        const O = new P.Converter({
          simpleLineBreaks: !0,
          strikethrough: !0,
          tables: !0,
          tasklists: !0,
          ghCodeBlocks: !0,
          simplifiedAutoLink: !0,
          openLinksInNewWindow: !0,
          emoji: !1
        }).makeHtml(I);
        return U.sanitize(O, {
          USE_PROFILES: { html: !0 },
          FORBID_TAGS: ["style", "script"]
        });
      }
    } catch {
    }
    return p(I).replace(/\n/g, "<br>");
  }
  function h(v) {
    const I = new DOMParser().parseFromString(`<body>${String(v || "")}</body>`, "text/html"), P = document.createDocumentFragment();
    return Array.from(I.body.childNodes).forEach((U) => {
      P.appendChild(document.importNode(U, !0));
    }), P;
  }
  function m(v) {
    return JSON.stringify({
      role: v.role,
      content: String(v.content || ""),
      toolCallId: String(v.toolCallId || ""),
      toolName: String(v.toolName || ""),
      toolCalls: Array.isArray(v.toolCalls) ? v.toolCalls.map((I) => ({
        id: String(I.id || ""),
        name: String(I.name || ""),
        arguments: String(I.arguments || "")
      })) : [],
      thoughts: i(v.thoughts),
      attachments: a(v.attachments).map((I) => ({
        kind: I.kind,
        name: I.name,
        type: I.type,
        size: I.size
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
    const I = document.createElement("div");
    I.className = `xb-assistant-bubble role-${v.role}`;
    const P = document.createElement("div");
    if (P.className = "xb-assistant-meta", P.textContent = v.role === "user" ? "你" : v.role === "assistant" ? Array.isArray(v.toolCalls) && v.toolCalls.length ? `小白助手 · 已发起 ${v.toolCalls.length} 个工具调用${Array.isArray(v.thoughts) && v.thoughts.length ? ` · 含 ${v.thoughts.length} 段思考` : ""}` : `小白助手${v.streaming ? " · 正在生成" : ""}${Array.isArray(v.thoughts) && v.thoughts.length ? ` · 含 ${v.thoughts.length} 段思考` : ""}` : `工具结果${v.toolName ? ` · ${v.toolName}` : ""}`, v.role === "tool") {
      const O = s(v), ne = document.createElement("pre");
      if (ne.className = "xb-assistant-content tool-summary", ne.textContent = O.summary || "工具已返回结果。", I.append(P, ne), O.details) {
        const Z = document.createElement("details");
        Z.className = "xb-assistant-tool-details";
        const ee = document.createElement("summary");
        ee.textContent = v.toolName === o.READ ? "展开文件内容" : "展开详细结果";
        const L = document.createElement("pre");
        L.className = "xb-assistant-content tool-detail", L.textContent = O.details, Z.append(ee, L), I.appendChild(Z);
      }
      return I;
    }
    const U = document.createElement("div");
    if (U.className = "xb-assistant-content xb-assistant-markdown", U.appendChild(h(f(v.content || (v.role === "assistant" ? v.streaming ? "思考中…" : "我先查一下相关代码。" : "")))), I.append(P, U), Array.isArray(v.attachments) && v.attachments.length) {
      const O = document.createElement("div");
      O.className = "xb-assistant-attachment-gallery", u(O, v.attachments, { compact: !0 }), I.appendChild(O);
    }
    if (v.role === "assistant" && v.approvalRequest?.kind === "slash-command") {
      const O = document.createElement("div");
      O.className = "xb-assistant-approval";
      const ne = document.createElement("div");
      ne.className = "xb-assistant-approval-title", ne.textContent = "待确认的斜杠命令";
      const Z = document.createElement("pre");
      Z.className = "xb-assistant-content xb-assistant-approval-command", Z.textContent = v.approvalRequest.command || "";
      const ee = document.createElement("div");
      if (ee.className = "xb-assistant-approval-note", ee.textContent = v.approvalRequest.status === "approved" ? "已同意，命令已进入执行流程。" : v.approvalRequest.status === "declined" ? "已拒绝，本次不会执行这条命令。" : v.approvalRequest.status === "cancelled" ? "本轮请求已终止，这条命令未执行。" : "这条命令可能改动真实实例状态；点“是”后才会真正执行。", O.append(ne, Z, ee), v.approvalRequest.status === "pending") {
        const L = document.createElement("div");
        L.className = "xb-assistant-approval-actions";
        const V = document.createElement("button");
        V.type = "button", V.className = "xb-assistant-approval-button", V.dataset.approvalId = v.approvalRequest.id, V.dataset.approvalDecision = "approve", V.textContent = "是，执行";
        const K = document.createElement("button");
        K.type = "button", K.className = "xb-assistant-approval-button secondary", K.dataset.approvalId = v.approvalRequest.id, K.dataset.approvalDecision = "decline", K.textContent = "否，跳过", L.append(V, K), O.appendChild(L);
      }
      I.appendChild(O);
    }
    if (v.role === "assistant" && Array.isArray(v.thoughts) && v.thoughts.length) {
      const O = document.createElement("details");
      O.className = "xb-assistant-thought-details";
      const ne = document.createElement("summary");
      ne.textContent = v.thoughts.length > 1 ? `展开思考块（${v.thoughts.length} 段）` : "展开思考块", O.appendChild(ne), v.thoughts.forEach((Z) => {
        const ee = document.createElement("div");
        ee.className = "xb-assistant-thought-block";
        const L = document.createElement("div");
        L.className = "xb-assistant-thought-label", L.textContent = Z.label;
        const V = document.createElement("pre");
        V.className = "xb-assistant-content xb-assistant-thought-content", V.textContent = Z.text, ee.append(L, V), O.appendChild(ee);
      }), I.appendChild(O);
    }
    return I;
  }
  function y(v) {
    const I = Array.from(v.querySelectorAll(".xb-assistant-bubble"));
    if (!t.messages.length) {
      v.innerHTML = "";
      const U = document.createElement("div");
      U.className = "xb-assistant-empty", U.innerHTML = "<h2>你好，我是小白助手</h2><p>我运行在你当前打开的 SillyTavern 酒馆里，专门帮你解答 LittleWhiteBox 和酒馆前端的问题。</p><p><strong>我能做什么：</strong></p><ul><li><strong>查看源码</strong>：读取 LittleWhiteBox 和酒馆前端的代码快照（构建时索引），帮你找按钮位置、设置逻辑、报错链路。</li><li><strong>查询实例</strong>：执行斜杠命令查询你当前酒馆的实时状态，比如当前 API、模型、角色、扩展开关等。</li><li><strong>记录工作</strong>：把排查结论写到 <code>user/files/LittleWhiteBox_Assistant_Worklog.md</code>，方便你后续查看。</li></ul><p><strong>我不能做什么：</strong></p><ul><li>不能访问后端代码、数据库、API Key 存储位置。</li><li>不能修改你的源码或配置文件。</li><li>代码快照可能不包含你最新的修改；如需确认当前实例状态，我会用斜杠命令查询。</li></ul><p>下面是一些示例问题，点击后会填入输入框（不会自动发送）：</p>";
      const O = document.createElement("div");
      O.className = "xb-assistant-examples", n.forEach((ne) => {
        const Z = document.createElement("button");
        Z.type = "button", Z.className = "xb-assistant-example-chip", Z.dataset.prompt = ne, Z.textContent = ne, O.appendChild(Z);
      }), U.appendChild(O), v.appendChild(U);
      return;
    }
    const P = v.querySelector(".xb-assistant-empty");
    P && P.remove(), t.messages.forEach((U, O) => {
      const ne = m(U), Z = I[O] || null;
      if (Z?.dataset.renderSignature === ne) return;
      const ee = g(U);
      ee.dataset.renderSignature = ne, Z ? v.replaceChild(ee, Z) : v.appendChild(ee);
    }), I.slice(t.messages.length).forEach((U) => U.remove()), t.autoScroll && (v.scrollTop = v.scrollHeight);
  }
  function _(v) {
    if (!v) return;
    const I = () => {
      v.scrollTop = v.scrollHeight;
    };
    I(), requestAnimationFrame(() => {
      I(), requestAnimationFrame(I);
    });
  }
  function S(v) {
    v && v.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
  function b(v) {
    const I = v.querySelector("#xb-assistant-chat"), P = v.querySelector("#xb-assistant-scroll-top"), U = v.querySelector("#xb-assistant-scroll-bottom");
    if (!I || !P || !U) return;
    const O = I.scrollTop, ne = I.scrollHeight, Z = I.clientHeight, ee = 80;
    P.classList.toggle("visible", O > ee), U.classList.toggle("visible", ne - O - Z > ee);
  }
  function A(v) {
    v.querySelector("#xb-assistant-scroll-helpers")?.classList.add("active");
  }
  function R(v) {
    v.querySelector("#xb-assistant-scroll-helpers")?.classList.remove("active");
  }
  function $(v) {
    d && clearTimeout(d), d = setTimeout(() => {
      R(v), d = null;
    }, 1500);
  }
  function w(v) {
    c || (c = !0, requestAnimationFrame(() => {
      b(v), A(v), $(v), c = !1;
    }));
  }
  return {
    renderMessages: y,
    scrollChatToBottom: _,
    scrollChatToTop: S,
    updateChatScrollButtonsVisibility: b,
    handleAssistantChatScroll: w
  };
}
var nA = [
  "这个功能的代码入口在哪个文件？",
  "我当前用的是什么 API 和模型？",
  "为什么某个设置勾上后刷新又没了？",
  "帮我查一下某个报错是从哪条链路抛出来的。"
], oA = [
  "项目结构提示：",
  "你当前运行在 SillyTavern 的 LittleWhiteBox 插件里；LittleWhiteBox 位于 public/scripts/extensions/third-party/LittleWhiteBox/。",
  "你的可读范围是已索引公开前端文件，重点包括 LittleWhiteBox 自身，以及 SillyTavern 的 public/scripts/*；不要假装自己能看到后端、数据库、账号密码或未索引文件。",
  "你用读文件工具时，路径要写成站点根相对公开路径，例如 scripts/extensions/third-party/LittleWhiteBox/index.js，而不是磁盘绝对路径。",
  "如果你需要快速建立 SillyTavern 和 LittleWhiteBox 的目录心智，请优先读取：scripts/extensions/third-party/LittleWhiteBox/modules/assistant/references/project-structure.md 。",
  "如果用户问小白X插件功能使用问题，也优先读取结构目录后再精准查找对应文件：scripts/extensions/third-party/LittleWhiteBox/modules/assistant/references/project-structure.md 。",
  "如果用户问 STscript、斜杠命令语法或脚本语言行为，请优先读取：scripts/extensions/third-party/LittleWhiteBox/modules/assistant/references/stscript-language-reference.md 。",
  "如果用户问 SillyTavern 前端 API、页面脚本接口、前端扩展调用方式或如何写插件，请优先读取：scripts/extensions/third-party/LittleWhiteBox/modules/assistant/references/sillytavern-javascript-api-reference.md 。"
].join(`
`), dh = [
  "你是“小白助手”，是 SillyTavern 中 LittleWhiteBox（中文一般称“小白X”）插件的内置技术支持助手，当前正在这个界面中为用户提供帮助。",
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
  "- 可读写身份设定（user/files/LittleWhiteBox_Assistant_Identity.md）；需要调整你的长期身份、习惯、语气或工作方式时，可直接读取或写入这份文件。写入成功后，当前会话后续回合会立即使用新的身份内容。",
  "- 可读写工作记录（user/files/LittleWhiteBox_Assistant_Worklog.md），需要写入时直接调用写入工具，文件不存在就创建，用它保存长期排查结论和用户指定要你记住的事情。",
  "- 不能访问后端、数据库、未索引文件。",
  "",
  "**重要区分 - 静态快照 vs 动态实例**：",
  "- LS/Glob/Grep/Read 工具读取的是**静态代码快照**（构建时索引），用于查看源码实现、配置逻辑、模块结构。",
  "- RunSlashCommand 工具查询的是**动态运行实例**（用户当前打开的酒馆），用于获取实时状态、设置值、角色数据。",
  "- 先判断问题属于动态实例还是静态代码：动态实例优先用 RunSlashCommand；静态代码优先先看结构参考，或先用 LS/Grep 做低成本定位，再用 Read 精读。",
  '- 当用户问"我的 API 是什么""我当前用的什么模型"这类实时状态时，用 RunSlashCommand；当用户问"API 设置的代码在哪""这个功能入口在哪"这类源码问题时，先结合 project-structure.md 或 LS/Grep 定位，再用 Read。',
  "- 索引快照可能不包含用户最新修改的代码或配置文件；如需确认用户当前实例的实际状态，必须用 RunSlashCommand。",
  "",
  oA,
  "",
  ...y0,
  "",
  "回答要求：",
  "- 具体、可核对，热情主动，必要时引用文件路径。",
  "- 使用 RunSlashCommand 查询真实实例状态时，可以直接执行查询类命令。",
  "- 如果 RunSlashCommand 可能创建、修改、删除、发送消息、切换状态或重载页面，必须先明确告诉用户准备执行的命令和预期结果，并在用户同意后再执行。",
  "- 执行 RunSlashCommand 后，要如实说明实际执行的命令和工具返回结果，不要美化或改写失败原因。"
].join(`
`), sA = "[历史摘要]", iA = [
  "你要把一段较早的技术支持对话压缩成后续可继续接话的历史摘要。",
  "只保留真正对后续排查有帮助的信息，不要寒暄，不要复述大段源码，不要保留大段 JSON。",
  "必须覆盖这些点：当前目标/问题、已确认结论、未解决点、关键文件路径、关键设置/API/报错文本、用户明确偏好或限制。",
  "如果某项信息不存在，就不要编造。",
  "尽量紧凑清晰，适合直接作为后续上下文继续使用。"
].join(`
`), rA = "xb-assistant-app", fh = "xb-assistant-root", ph = 18e4, aA = 64, hh = 128e3, lA = 98e3, uA = 2, cA = 1, Es = 3, dA = 4 * 1024 * 1024, fA = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif"
], pA = 2600, hA = 1800, mA = 4200, gA = 3e3, yA = 1800, _A = [{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}], mh = [
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
], vA = [
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
], N = {
  config: null,
  runtime: null,
  messages: [],
  historySummary: "",
  archivedTurnCount: 0,
  contextStats: {
    usedTokens: 0,
    budgetTokens: hh,
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
}, Sr = /* @__PURE__ */ new Map(), gh = /* @__PURE__ */ new Map(), Ho = null, Nn = null, Et = null, Dt = null;
function Os(e, t = {}) {
  parent.postMessage({
    source: rA,
    type: e,
    payload: t
  }, window.location.origin);
}
function Vs(e) {
  return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function yh(e, t = {}) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return t;
  }
}
var ua = null;
function en() {
  ua?.persistSession();
}
function SA() {
  ua?.restoreSession();
}
function TA() {
  if (Nn !== null) return Nn;
  try {
    Nn = globalThis.Bowser?.parse?.(navigator.userAgent) || {};
  } catch {
    Nn = {};
  }
  return Nn;
}
function EA() {
  return ["mobile", "tablet"].includes(TA()?.platform?.type) ? !0 : window.matchMedia("(pointer: coarse)").matches && window.matchMedia("(max-width: 900px)").matches;
}
function bA(e) {
  return N.messages.find((t) => t?.approvalRequest?.id === e) || null;
}
function wA(e, t) {
  const n = bA(e);
  n?.approvalRequest && (n.approvalRequest.status = t, en());
}
function AA(e, t) {
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
function CA(e) {
  return mh.some((t) => t.value === e) ? e : "medium";
}
function ca(e) {
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
function $t(e) {
  if (N.toast = String(e || "").trim(), Ho && clearTimeout(Ho), !N.toast) {
    fe();
    return;
  }
  const t = Math.max(hA, Math.min(mA, pA + N.toast.length * 18));
  Ho = setTimeout(() => {
    Ho = null, N.toast = "", fe();
  }, t), fe();
}
function IA() {
  Et && (clearTimeout(Et), Et = null), Dt && (clearTimeout(Dt), Dt = null);
}
function _h(e = yA) {
  Dt && clearTimeout(Dt), Dt = setTimeout(() => {
    Dt = null, N.configSave = {
      status: "idle",
      requestId: "",
      error: ""
    }, fe();
  }, e);
}
function xA(e) {
  IA(), N.configSave = {
    status: "saving",
    requestId: e,
    error: ""
  }, Et = setTimeout(() => {
    Et = null, !(N.configSave.requestId !== e || N.configSave.status !== "saving") && (N.configSave = {
      status: "error",
      requestId: e,
      error: "保存超时，请重试"
    }, fe(), _h());
  }, gA), fe();
}
function wc(e, { ok: t, error: n = "" } = {}) {
  e && N.configSave.requestId && N.configSave.requestId !== e || (Et && (clearTimeout(Et), Et = null), N.configSave = {
    status: t ? "success" : "error",
    requestId: e || N.configSave.requestId || "",
    error: t ? "" : String(n || "保存失败")
  }, fe(), _h());
}
function vh() {
  N.configFormSyncPending = !0;
}
function da(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return e?.name === "AbortError" || t === "assistant_aborted" || t === "tool_aborted" || t.includes("aborted");
}
function RA(e) {
  return vA.find((t) => t.value === e)?.label || e;
}
function PA(e) {
  return N.pullStateByProvider[e] || {
    status: "idle",
    message: ""
  };
}
function MA(e, t) {
  N.pullStateByProvider = {
    ...N.pullStateByProvider,
    [e]: t
  };
}
function NA(e, t) {
  N.modelOptionsByProvider = {
    ...N.modelOptionsByProvider,
    [e]: Array.isArray(t) ? t : []
  };
}
function kA(e) {
  return Array.isArray(N.modelOptionsByProvider[e]) ? N.modelOptionsByProvider[e] : [];
}
var { normalizeAttachments: Hs, buildTextWithAttachmentSummary: LA, buildUserContentParts: DA, appendDraftImageFiles: Ac, renderAttachmentGallery: Sh } = V0({
  state: N,
  showToast: $t,
  render: fe,
  acceptedImageMimeTypes: fA,
  maxImageAttachments: Es,
  maxImageFileBytes: dA
});
function fa(e) {
  const t = String(e?.message || e || "unknown_error"), n = t.toLowerCase();
  return e?.rawDisplay ? String(e.rawDisplay) : da(e) ? "本轮请求已终止。" : n === "tool_timeout" ? "工具调用超时了（180 秒），可以重试，或把问题收窄一点。" : n.startsWith("workspace_write_failed:") ? "工作区写入失败，请检查酒馆文件权限或稍后重试。" : n.startsWith("manifest_load_failed:") ? "助手索引文件清单加载失败，请刷新页面后再试。" : n.startsWith("file_read_failed:") ? "读取源码文件失败了，请换个文件再试，或刷新页面重试。" : n === "file_not_indexed" ? "这个文件不在当前助手索引范围里。" : n === "directory_path_required" ? "还没有提供要查看的目录路径。" : n === "glob_pattern_required" ? "还没有提供 glob 路径模式。" : n === "empty_query" ? "搜索词是空的，换一个明确点的关键词就行。" : t;
}
var { getActiveProviderConfig: Th, syncCurrentProviderDraft: $A, syncConfigToForm: UA, bindSettingsPanelEvents: FA } = eA({
  state: N,
  post: Os,
  render: fe,
  showToast: $t,
  beginConfigSave: xA,
  requestConfigFormSync: vh,
  createRequestId: Vs,
  describeError: fa,
  getPullState: PA,
  setPullState: MA,
  setProviderModels: NA,
  getProviderModels: kA,
  getProviderLabel: RA,
  normalizeReasoningEffort: CA,
  normalizeAssistantConfig: lh,
  normalizePresetName: oo,
  buildDefaultPreset: ra,
  cloneDefaultModelConfigs: ia,
  defaultPresetName: ah,
  requestTimeoutMs: ph,
  toolModeOptions: _A,
  reasoningEffortOptions: mh
}), { renderMessages: BA, scrollChatToBottom: Tr, scrollChatToTop: GA, updateChatScrollButtonsVisibility: Eh, handleAssistantChatScroll: qA } = tA({
  state: N,
  examplePrompts: nA,
  toolNames: re,
  formatToolResultDisplay: ih,
  normalizeThoughtBlocks: ca,
  normalizeAttachments: Hs,
  renderAttachmentGallery: Sh
});
function OA() {
  const e = Th();
  if (!e.apiKey) throw new Error("请先在小白助手里填写当前提供商的 API Key。");
  switch (e.provider) {
    case "openai-responses":
      return new Rg(e);
    case "anthropic":
      return new Ry(e);
    case "google":
      return new g0(e);
    default:
      return new _g(e);
  }
}
function VA() {
  return [dh, String(N.runtime?.identityContent || "").trim()].filter(Boolean).join(`

`);
}
var { resetCompactionState: HA, buildContextMeterLabel: JA, updateContextStats: WA, pushMessage: Ci, cancelActiveRun: KA, toProviderMessages: zA, getActiveContextMessages: bh, runAssistantLoop: YA } = w0({
  state: N,
  pendingToolCalls: Sr,
  pendingApprovals: gh,
  persistSession: en,
  render: fe,
  showToast: $t,
  post: Os,
  createRequestId: Vs,
  safeJsonParse: yh,
  describeError: fa,
  describeToolCall: S0,
  formatToolResultDisplay: ih,
  buildTextWithAttachmentSummary: LA,
  buildUserContentParts: DA,
  normalizeAttachments: Hs,
  normalizeThoughtBlocks: ca,
  normalizeSlashCommand: aa,
  shouldRequireSlashCommandApproval: D0,
  setApprovalStatus: wA,
  buildSlashApprovalResult: AA,
  isAbortError: da,
  createAdapter: OA,
  getActiveProviderConfig: Th,
  getSystemPrompt: VA,
  SYSTEM_PROMPT: dh,
  SUMMARY_SYSTEM_PROMPT: iA,
  HISTORY_SUMMARY_PREFIX: sA,
  MAX_CONTEXT_TOKENS: hh,
  SUMMARY_TRIGGER_TOKENS: lA,
  DEFAULT_PRESERVED_TURNS: uA,
  MIN_PRESERVED_TURNS: cA,
  MAX_TOOL_ROUNDS: aA,
  REQUEST_TIMEOUT_MS: ph,
  TOOL_DEFINITIONS: _0,
  TOOL_NAMES: re
});
ua = O0({
  state: N,
  safeJsonParse: yh,
  createRequestId: Vs,
  normalizeAttachments: Hs,
  normalizeThoughtBlocks: ca,
  getActiveContextMessages: bh
});
function Ii(e) {
  N.config = lh(e || {}), vh(), fe();
}
function XA(e) {
  const t = new DOMParser().parseFromString(`<body>${String(e || "")}</body>`, "text/html"), n = document.createDocumentFragment();
  return Array.from(t.body.childNodes).forEach((o) => {
    n.appendChild(document.importNode(o, !0));
  }), n;
}
function QA(e) {
  const t = `
        <div class="xb-assistant-shell ${N.sidebarCollapsed ? "sidebar-collapsed" : ""}">
            <aside class="xb-assistant-sidebar ${N.sidebarCollapsed ? "is-collapsed" : ""}">
                <div class="xb-assistant-sidebar-header">
                    <div class="xb-assistant-badge">API配置</div>
                    <button id="xb-assistant-sidebar-toggle" type="button" class="xb-assistant-sidebar-toggle" aria-expanded="${N.sidebarCollapsed ? "false" : "true"}" aria-label="${N.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置"}" title="${N.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置"}">
                        <span class="xb-assistant-sidebar-toggle-text"></span>
                        <span class="xb-assistant-sidebar-toggle-icon"></span>
                    </button>
                </div>
                <div class="xb-assistant-sidebar-content" ${N.sidebarCollapsed ? "hidden" : ""}>
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
            <div class="xb-assistant-mobile-backdrop" id="xb-assistant-mobile-backdrop" ${N.sidebarCollapsed ? "hidden" : ""}></div>
            <main class="xb-assistant-main">
                <section class="xb-assistant-toolbar">
                    <div class="xb-assistant-toolbar-cluster">
                        <div class="xb-assistant-status" id="xb-assistant-status"></div>
                        <div class="xb-assistant-context-meter" id="xb-assistant-context-meter" title="当前实际送模上下文 / 最大上下文"></div>
                        <button id="xb-assistant-clear" type="button" class="secondary ghost">清空对话</button>
                    </div>
                    <button id="xb-assistant-mobile-settings" type="button" class="secondary ghost xb-assistant-mobile-settings">设置</button>
                    <button id="xb-assistant-mobile-close" type="button" class="secondary ghost xb-assistant-mobile-close">关闭</button>
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
  e.replaceChildren(XA(t));
}
function ZA() {
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
        #${fh} { width: 100%; height: 100%; overflow: hidden; box-sizing: border-box; }
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
            .xb-assistant-mobile-close {
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
            .xb-assistant-main {
                padding: 12px;
                min-height: 0;
                height: 100%;
                gap: 12px;
            }
            .xb-assistant-compose {
                grid-template-columns: 1fr;
                padding: 12px;
                padding-bottom: calc(12px + env(safe-area-inset-bottom));
            }
            .xb-assistant-compose-actions { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .xb-assistant-toolbar {
                display: grid;
                grid-template-columns: repeat(5, minmax(0, 1fr));
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
                min-height: 88px;
                max-height: min(220px, 32vh);
                resize: none;
                overflow-y: auto;
            }
        }
    `, document.head.appendChild(e);
}
function fe() {
  const e = document.getElementById(fh);
  if (!e) return;
  e.firstChild || (QA(e), jA(e)), N.configFormSyncPending && (UA(e), N.configFormSyncPending = !1), WA(zA(bh()));
  const t = e.querySelector("#xb-assistant-chat");
  BA(t), N.autoScroll && Tr(t), Eh(e);
  const n = e.querySelector("#xb-assistant-send");
  n.disabled = !1, n.classList.toggle("is-busy", N.isBusy), n.textContent = N.isBusy ? "终止" : "发送";
  const o = e.querySelector("#xb-assistant-add-image");
  o.disabled = N.isBusy || N.draftAttachments.length >= Es, o.textContent = N.draftAttachments.length ? `发图（${N.draftAttachments.length}/${Es}）` : "发图";
  const s = e.querySelector("#xb-assistant-clear");
  s.disabled = N.isBusy || !N.messages.length, s.textContent = window.matchMedia("(max-width: 900px)").matches ? "清空" : "清空对话";
  const i = e.querySelector("#xb-assistant-delete-preset");
  i.disabled = N.isBusy || (N.config?.presetNames || []).length <= 1;
  const a = e.querySelector("#xb-assistant-save"), u = N.configSave.status;
  a.classList.add("xb-assistant-save-button"), a.classList.toggle("is-saving", u === "saving"), a.classList.toggle("is-success", u === "success"), a.classList.toggle("is-error", u === "error"), a.disabled = N.isBusy || u === "saving", u === "saving" ? (a.innerHTML = '<span class="xb-assistant-save-spinner" aria-hidden="true"></span>保存中...', a.title = "正在保存配置") : u === "success" ? (a.textContent = "已保存", a.title = "配置已保存") : u === "error" ? (a.textContent = "保存失败", a.title = N.configSave.error || "保存失败") : (a.textContent = "保存配置", a.title = "保存配置");
  const c = e.querySelector("#xb-assistant-pull-models");
  c.disabled = N.isBusy;
  const d = e.querySelector("#xb-assistant-status");
  d.textContent = N.progressLabel || "就绪", d.classList.toggle("busy", N.isBusy);
  const p = e.querySelector("#xb-assistant-context-meter");
  p.textContent = JA(), p.classList.toggle("summary-active", !!N.contextStats.summaryActive), p.title = N.contextStats.summaryActive ? "当前实际送模上下文 / 128k（已压缩较早历史）" : "当前实际送模上下文 / 128k";
  const f = e.querySelector("#xb-assistant-toast");
  f.textContent = N.toast || "", f.classList.toggle("visible", !!N.toast);
  const h = e.querySelector(".xb-assistant-shell"), m = e.querySelector(".xb-assistant-sidebar"), g = e.querySelector("#xb-assistant-sidebar-toggle"), y = e.querySelector(".xb-assistant-sidebar-content"), _ = e.querySelector("#xb-assistant-mobile-settings"), S = e.querySelector("#xb-assistant-mobile-close"), b = e.querySelector("#xb-assistant-mobile-backdrop"), A = window.matchMedia("(max-width: 900px)").matches;
  if (h?.classList.toggle("sidebar-collapsed", !!N.sidebarCollapsed), m?.classList.toggle("is-collapsed", !!N.sidebarCollapsed), y?.toggleAttribute("hidden", !!N.sidebarCollapsed), b?.toggleAttribute("hidden", !A || !!N.sidebarCollapsed), _?.toggleAttribute("hidden", !A), S?.toggleAttribute("hidden", !A), g) {
    g.setAttribute("aria-expanded", N.sidebarCollapsed ? "false" : "true"), g.setAttribute("aria-label", N.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置"), g.title = N.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置";
    const $ = g.querySelector(".xb-assistant-sidebar-toggle-text"), w = g.querySelector(".xb-assistant-sidebar-toggle-icon");
    $ && ($.textContent = A ? N.sidebarCollapsed ? "展开设置" : "收起设置" : ""), w && (w.textContent = A ? N.sidebarCollapsed ? "▼" : "▲" : N.sidebarCollapsed ? "⚙" : "‹");
  }
  _ && (_.textContent = N.sidebarCollapsed ? "设置" : "关闭设置", _.setAttribute("aria-expanded", N.sidebarCollapsed ? "false" : "true"), _.title = N.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置"), S && (S.textContent = "关闭", S.title = "关闭小白助手"), Sh(e.querySelector("#xb-assistant-draft-gallery"), N.draftAttachments, { onRemove: ($) => {
    N.draftAttachments = N.draftAttachments.filter((w, v) => v !== $), fe();
  } });
  const R = e.querySelector("#xb-assistant-toggle-key");
  R.textContent = e.querySelector("#xb-assistant-api-key").type === "password" ? "显示" : "隐藏";
}
function jA(e) {
  const t = e.querySelector("#xb-assistant-input"), n = e.querySelector("#xb-assistant-image-input"), o = () => {
    t.style.height = "auto", t.style.height = `${Math.min(Math.max(t.scrollHeight, 92), 240)}px`;
  };
  e.querySelector("#xb-assistant-sidebar-toggle")?.addEventListener("click", () => {
    N.sidebarCollapsed = !N.sidebarCollapsed, en(), fe();
  }), e.querySelector("#xb-assistant-mobile-settings")?.addEventListener("click", () => {
    N.sidebarCollapsed = !N.sidebarCollapsed, en(), fe();
  }), e.querySelector("#xb-assistant-mobile-close")?.addEventListener("click", () => {
    Os("xb-assistant:close");
  }), e.querySelector("#xb-assistant-mobile-backdrop")?.addEventListener("click", () => {
    N.sidebarCollapsed || (N.sidebarCollapsed = !0, en(), fe());
  }), e.querySelector("#xb-assistant-chat").addEventListener("scroll", (s) => {
    const i = s.currentTarget;
    N.autoScroll = i.scrollHeight - i.scrollTop - i.clientHeight <= 48, qA(e);
  }), e.querySelector("#xb-assistant-chat").addEventListener("click", (s) => {
    const i = s.target.closest(".xb-assistant-example-chip");
    if (i) {
      t.value = i.dataset.prompt || "", o(), t.focus(), N.autoScroll = !0, Tr(e.querySelector("#xb-assistant-chat"));
      return;
    }
    const a = s.target.closest("[data-approval-id][data-approval-decision]");
    if (!a) return;
    const u = a.dataset.approvalId || "", c = a.dataset.approvalDecision || "", d = gh.get(u);
    d && (c === "approve" ? d.resolve(!0) : d.resolve(!1), fe());
  }), FA(e), e.querySelector("#xb-assistant-clear").addEventListener("click", () => {
    N.isBusy || (N.messages = [], N.draftAttachments = [], HA(), en(), $t("对话已清空"), fe());
  }), e.querySelector("#xb-assistant-add-image").addEventListener("click", () => {
    N.isBusy || N.draftAttachments.length >= Es || n.click();
  }), e.querySelector("#xb-assistant-scroll-top").addEventListener("click", () => {
    N.autoScroll = !1, GA(e.querySelector("#xb-assistant-chat"));
  }), e.querySelector("#xb-assistant-scroll-bottom").addEventListener("click", () => {
    N.autoScroll = !0, Tr(e.querySelector("#xb-assistant-chat")), Eh(e);
  }), n.addEventListener("change", async (s) => {
    const i = Array.from(s.currentTarget.files || []);
    if (i.length)
      try {
        await Ac(i);
      } finally {
        s.currentTarget.value = "";
      }
  }), t.addEventListener("paste", async (s) => {
    if (N.isBusy) return;
    const i = Array.from(s.clipboardData?.items || []);
    if (!i.length) return;
    const a = i.filter((u) => u.kind === "file" && String(u.type || "").startsWith("image/")).map((u) => u.getAsFile()).filter(Boolean);
    a.length && (s.preventDefault(), await Ac(a));
  }), e.querySelector("#xb-assistant-form").addEventListener("submit", async (s) => {
    if (s.preventDefault(), N.isBusy) {
      KA("本轮请求已终止。");
      return;
    }
    const i = t.value.trim(), a = Hs(N.draftAttachments);
    if (!i && !a.length) return;
    $A(e), Ci({
      role: "user",
      content: i,
      attachments: a
    }), t.value = "", N.draftAttachments = [], o(), fe();
    const u = {
      id: Vs("run"),
      controller: new AbortController(),
      toolRequestIds: /* @__PURE__ */ new Set(),
      cancelNotice: "",
      lightBrakeMessage: "",
      lastLightBrakeKey: "",
      toolErrorStreakKey: "",
      toolErrorStreakCount: 0
    };
    N.activeRun = u, N.isBusy = !0, N.currentRound = 0, N.progressLabel = "正在请求模型…", N.autoScroll = !0, fe();
    try {
      await YA(u);
    } catch (c) {
      da(c) ? u.cancelNotice && Ci({
        role: "assistant",
        content: u.cancelNotice
      }) : Ci({
        role: "assistant",
        content: fa(c)
      });
    } finally {
      N.activeRun?.id === u.id && (N.activeRun = null), N.isBusy = !1, N.currentRound = 0, N.progressLabel = "", fe();
    }
  }), t.addEventListener("input", o), t.addEventListener("keydown", (s) => {
    const i = !EA();
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
    N.runtime = t.payload?.runtime || null, Ii(t.payload?.config || {});
    return;
  }
  if (t.type === "xb-assistant:config-saved") {
    Ii(t.payload?.config || {}), wc(t.payload?.requestId || "", { ok: !0 }), $t("配置已保存");
    return;
  }
  if (t.type === "xb-assistant:identity-updated") {
    N.runtime = {
      ...N.runtime || {},
      identityContent: String(t.payload?.identityContent || "").trim()
    }, $t("身份设定已更新");
    return;
  }
  if (t.type === "xb-assistant:config-save-error") {
    Ii(t.payload?.config || {}), wc(t.payload?.requestId || "", {
      ok: !1,
      error: t.payload?.error || "网络异常"
    }), $t(`保存失败：${t.payload?.error || "网络异常"}`);
    return;
  }
  if (t.type === "xb-assistant:tool-result") {
    const n = Sr.get(t.payload?.requestId || "");
    if (!n) return;
    n.resolve(t.payload.result);
    return;
  }
  if (t.type === "xb-assistant:tool-error") {
    const n = Sr.get(t.payload?.requestId || "");
    if (!n) return;
    n.reject(new Error(t.payload.error || "tool_failed"));
  }
});
SA();
ZA();
fe();
Os("xb-assistant:ready");
