/* eslint-disable */
var jp = Object.create, bc = Object.defineProperty, em = Object.getOwnPropertyDescriptor, tm = Object.getOwnPropertyNames, nm = Object.getPrototypeOf, om = Object.prototype.hasOwnProperty, Rr = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), rm = (e, t, n, o) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var r = tm(t), i = 0, a = r.length, u; i < a; i++)
      u = r[i], !om.call(e, u) && u !== n && bc(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(o = em(t, u)) || o.enumerable
      });
  return e;
}, im = (e, t, n) => (n = e != null ? jp(nm(e)) : {}, rm(t || !e || !e.__esModule ? bc(n, "default", {
  value: e,
  enumerable: !0
}) : n, e));
function k(e, t, n, o, r) {
  if (o === "m") throw new TypeError("Private method is not writable");
  if (o === "a" && !r) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return o === "a" ? r.call(e, n) : r ? r.value = n : t.set(e, n), n;
}
function T(e, t, n, o) {
  if (n === "a" && !o) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !o : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? o : n === "a" ? o.call(e) : o ? o.value : t.get(e);
}
var Pc = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Pc = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function jn(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Ai = (e) => {
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
}, G = class extends Error {
}, Ie = class Ti extends G {
  constructor(t, n, o, r, i) {
    super(`${Ti.makeMessage(t, n, o)}`), this.status = t, this.headers = r, this.requestID = r?.get("request-id"), this.error = n, this.type = i ?? null;
  }
  static makeMessage(t, n, o) {
    const r = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && r ? `${t} ${r}` : t ? `${t} status code (no body)` : r || "(no status code or body)";
  }
  static generate(t, n, o, r) {
    if (!t || !r) return new br({
      message: o,
      cause: Ai(n)
    });
    const i = n, a = i?.error?.type;
    return t === 400 ? new xc(t, i, o, r, a) : t === 401 ? new Nc(t, i, o, r, a) : t === 403 ? new kc(t, i, o, r, a) : t === 404 ? new Dc(t, i, o, r, a) : t === 409 ? new $c(t, i, o, r, a) : t === 422 ? new Lc(t, i, o, r, a) : t === 429 ? new Uc(t, i, o, r, a) : t >= 500 ? new Fc(t, i, o, r, a) : new Ti(t, i, o, r, a);
  }
}, Be = class extends Ie {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, br = class extends Ie {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Mc = class extends br {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, xc = class extends Ie {
}, Nc = class extends Ie {
}, kc = class extends Ie {
}, Dc = class extends Ie {
}, $c = class extends Ie {
}, Lc = class extends Ie {
}, Uc = class extends Ie {
}, Fc = class extends Ie {
}, sm = /^[a-z][a-z0-9+.-]*:/i, am = (e) => sm.test(e), Si = (e) => (Si = Array.isArray, Si(e)), Aa = Si;
function Ei(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function Ta(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function lm(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var um = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new G(`${e} must be an integer`);
  if (t < 0) throw new G(`${e} must be a positive integer`);
  return t;
}, Oc = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, cm = (e) => new Promise((t) => setTimeout(t, e)), Gt = "0.91.1", dm = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function fm() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var hm = () => {
  const e = fm();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Gt,
    "X-Stainless-OS": Ea(Deno.build.os),
    "X-Stainless-Arch": Sa(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Gt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Gt,
    "X-Stainless-OS": Ea(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": Sa(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = pm();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Gt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Gt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function pm() {
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
var Sa = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Ea = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), wa, mm = () => wa ?? (wa = hm());
function gm() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Gc(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Bc(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Gc({
    start() {
    },
    async pull(n) {
      const { done: o, value: r } = await t.next();
      o ? n.close() : n.enqueue(r);
    },
    async cancel() {
      await t.return?.();
    }
  });
}
function ms(e) {
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
async function _m(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var ym = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function vm(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new G(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function Am(e) {
  let t = 0;
  for (const r of e) t += r.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const r of e)
    n.set(r, o), o += r.length;
  return n;
}
var Ca;
function gs(e) {
  let t;
  return (Ca ?? (t = new globalThis.TextEncoder(), Ca = t.encode.bind(t)))(e);
}
var Ia;
function Ra(e) {
  let t;
  return (Ia ?? (t = new globalThis.TextDecoder(), Ia = t.decode.bind(t)))(e);
}
var Te, Se, ao = class {
  constructor() {
    Te.set(this, void 0), Se.set(this, void 0), k(this, Te, new Uint8Array(), "f"), k(this, Se, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? gs(e) : e;
    k(this, Te, Am([T(this, Te, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = Tm(T(this, Te, "f"), T(this, Se, "f"))) != null; ) {
      if (o.carriage && T(this, Se, "f") == null) {
        k(this, Se, o.index, "f");
        continue;
      }
      if (T(this, Se, "f") != null && (o.index !== T(this, Se, "f") + 1 || o.carriage)) {
        n.push(Ra(T(this, Te, "f").subarray(0, T(this, Se, "f") - 1))), k(this, Te, T(this, Te, "f").subarray(T(this, Se, "f")), "f"), k(this, Se, null, "f");
        continue;
      }
      const r = T(this, Se, "f") !== null ? o.preceding - 1 : o.preceding, i = Ra(T(this, Te, "f").subarray(0, r));
      n.push(i), k(this, Te, T(this, Te, "f").subarray(o.index), "f"), k(this, Se, null, "f");
    }
    return n;
  }
  flush() {
    return T(this, Te, "f").length ? this.decode(`
`) : [];
  }
};
Te = /* @__PURE__ */ new WeakMap(), Se = /* @__PURE__ */ new WeakMap();
ao.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
ao.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function Tm(e, t) {
  for (let r = t ?? 0; r < e.length; r++) {
    if (e[r] === 10) return {
      preceding: r,
      index: r + 1,
      carriage: !1
    };
    if (e[r] === 13) return {
      preceding: r,
      index: r + 1,
      carriage: !0
    };
  }
  return null;
}
function Sm(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var ur = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, ba = (e, t, n) => {
  if (e) {
    if (lm(ur, e)) return e;
    fe(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(ur))}`);
  }
};
function xn() {
}
function Ao(e, t, n) {
  return !t || ur[e] > ur[n] ? xn : t[e].bind(t);
}
var Em = {
  error: xn,
  warn: xn,
  info: xn,
  debug: xn
}, Pa = /* @__PURE__ */ new WeakMap();
function fe(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return Em;
  const o = Pa.get(t);
  if (o && o[0] === n) return o[1];
  const r = {
    error: Ao("error", t, n),
    warn: Ao("warn", t, n),
    info: Ao("info", t, n),
    debug: Ao("debug", t, n)
  };
  return Pa.set(t, [n, r]), r;
}
var St = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), fn, eo = class Nn {
  constructor(t, n, o) {
    this.iterator = t, fn.set(this, void 0), this.controller = n, k(this, fn, o, "f");
  }
  static fromSSEResponse(t, n, o) {
    let r = !1;
    const i = o ? fe(o) : console;
    async function* a() {
      if (r) throw new G("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      r = !0;
      let u = !1;
      try {
        for await (const c of wm(t, n)) {
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
            const d = Oc(c.data) ?? c.data, h = d?.error?.type;
            throw new Ie(void 0, d, void 0, t.headers, h);
          }
        }
        u = !0;
      } catch (c) {
        if (jn(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Nn(a, n, o);
  }
  static fromReadableStream(t, n, o) {
    let r = !1;
    async function* i() {
      const u = new ao(), c = ms(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
      for (const d of u.flush()) yield d;
    }
    async function* a() {
      if (r) throw new G("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      r = !0;
      let u = !1;
      try {
        for await (const c of i())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (jn(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Nn(a, n, o);
  }
  [(fn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], o = this.iterator(), r = (i) => ({ next: () => {
      if (i.length === 0) {
        const a = o.next();
        t.push(a), n.push(a);
      }
      return i.shift();
    } });
    return [new Nn(() => r(t), this.controller, T(this, fn, "f")), new Nn(() => r(n), this.controller, T(this, fn, "f"))];
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
          const { value: r, done: i } = await n.next();
          if (i) return o.close();
          const a = gs(JSON.stringify(r) + `
`);
          o.enqueue(a);
        } catch (r) {
          o.error(r);
        }
      },
      async cancel() {
        await n.return?.();
      }
    });
  }
};
async function* wm(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new G("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new G("Attempted to iterate over a response with no body");
  const n = new Im(), o = new ao(), r = ms(e.body);
  for await (const i of Cm(r)) for (const a of o.decode(i)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const i of o.flush()) {
    const a = n.decode(i);
    a && (yield a);
  }
}
async function* Cm(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? gs(n) : n;
    let r = new Uint8Array(t.length + o.length);
    r.set(t), r.set(o, t.length), t = r;
    let i;
    for (; (i = Sm(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var Im = class {
  constructor() {
    this.event = null, this.data = [], this.chunks = [];
  }
  decode(e) {
    if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
      if (!this.event && !this.data.length) return null;
      const r = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      return this.event = null, this.data = [], this.chunks = [], r;
    }
    if (this.chunks.push(e), e.startsWith(":")) return null;
    let [t, n, o] = Rm(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function Rm(e, t) {
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
async function qc(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: r, startTime: i } = t, a = await (async () => {
    if (t.options.stream)
      return fe(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : eo.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Hc(await n.json(), n) : await n.text();
  })();
  return fe(e).debug(`[${o}] response parsed`, St({
    retryOfRequestLogID: r,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
function Hc(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("request-id"),
    enumerable: !1
  });
}
var kn, Vc = class Jc extends Promise {
  constructor(t, n, o = qc) {
    super((r) => {
      r(null);
    }), this.responsePromise = n, this.parseResponse = o, kn.set(this, void 0), k(this, kn, t, "f");
  }
  _thenUnwrap(t) {
    return new Jc(T(this, kn, "f"), this.responsePromise, async (n, o) => Hc(t(await this.parseResponse(n, o), o), o.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(T(this, kn, "f"), t))), this.parsedPromise;
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
var To, Kc = class {
  constructor(e, t, n, o) {
    To.set(this, void 0), k(this, To, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new G("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await T(this, To, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(To = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, bm = class extends Vc {
  constructor(e, t, n) {
    super(e, t, async (o, r) => new n(o, r.response, await qc(o, r), r.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, lo = class extends Kc {
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
          ...Ei(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...Ei(this.options.query),
        after_id: e
      }
    } : null;
  }
}, ve = class extends Kc {
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
        ...Ei(this.options.query),
        page: e
      }
    } : null;
  }
}, Wc = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Zt(e, t, n) {
  return Wc(), new File(e, t ?? "unknown_file", n);
}
function zo(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var zc = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", _s = async (e, t, n = !0) => ({
  ...e,
  body: await Mm(e.body, t, n)
}), Ma = /* @__PURE__ */ new WeakMap();
function Pm(e) {
  const t = typeof e == "function" ? e : e.fetch, n = Ma.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const r = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new r(i).text();
    } catch {
      return !0;
    }
  })();
  return Ma.set(t, o), o;
}
var Mm = async (e, t, n = !0) => {
  if (!await Pm(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const o = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([r, i]) => wi(o, r, i, n))), o;
}, xm = (e) => e instanceof Blob && "name" in e, wi = async (e, t, n, o) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let r = {};
      const i = n.headers.get("Content-Type");
      i && (r = { type: i }), e.append(t, Zt([await n.blob()], zo(n, o), r));
    } else if (zc(n)) e.append(t, Zt([await new Response(Bc(n)).blob()], zo(n, o)));
    else if (xm(n)) e.append(t, Zt([n], zo(n, o), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((r) => wi(e, t + "[]", r, o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([r, i]) => wi(e, `${t}[${r}]`, i, o)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, Yc = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", Nm = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Yc(e), km = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function Dm(e, t, n) {
  if (Wc(), e = await e, t || (t = zo(e, !0)), Nm(e))
    return e instanceof File && t == null && n == null ? e : Zt([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if (km(e)) {
    const r = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Zt(await Ci(r), t, n);
  }
  const o = await Ci(e);
  if (!n?.type) {
    const r = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof r == "string" && (n = {
      ...n,
      type: r
    });
  }
  return Zt(o, t, n);
}
async function Ci(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (Yc(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (zc(e)) for await (const n of e) t.push(...await Ci(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${$m(e)}`);
  }
  return t;
}
function $m(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var X = class {
  constructor(e) {
    this._client = e;
  }
}, Xc = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* Lm(e) {
  if (!e) return;
  if (Xc in e) {
    const { values: o, nulls: r } = e;
    yield* o.entries();
    for (const i of r) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Aa(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const r = o[0];
    if (typeof r != "string") throw new TypeError("expected header name to be a string");
    const i = Aa(o[1]) ? o[1] : [o[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [r, null]), yield [r, u]);
  }
}
var R = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const r = /* @__PURE__ */ new Set();
    for (const [i, a] of Lm(o)) {
      const u = i.toLowerCase();
      r.has(u) || (t.delete(i), r.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [Xc]: !0,
    values: t,
    nulls: n
  };
};
function Qc(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var xa = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Um = (e = Qc) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let r = !1;
  const i = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (r = !0);
    const m = o[p];
    let g = (r ? encodeURIComponent : e)("" + m);
    return p !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? xa) ?? xa)?.toString) && (g = m + "", i.push({
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
    throw new G(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}, L = /* @__PURE__ */ Um(Qc), Zc = class extends X {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/environments?beta=true", {
      body: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(L`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(L`/v1/environments/${e}?beta=true`, {
      body: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/environments?beta=true", ve, {
      query: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(L`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(L`/v1/environments/${e}/archive?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Wn = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function Yo(e) {
  return typeof e == "object" && e !== null && Wn in e;
}
function jc(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const o of e) Yo(o) && n.add(o[Wn]);
  if (t) {
    for (const o of t)
      if (Yo(o) && n.add(o[Wn]), Array.isArray(o.content))
        for (const r of o.content) Yo(r) && n.add(r[Wn]);
  }
  return Array.from(n);
}
function ed(e, t) {
  const n = jc(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function Fm(e) {
  return Yo(e) ? { "x-stainless-helper": e[Wn] } : {};
}
var td = class extends X {
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/files?beta=true", lo, {
      query: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(L`/v1/files/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  download(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(L`/v1/files/${e}/content?beta=true`, {
      ...n,
      headers: R([{
        "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      __binaryResponse: !0
    });
  }
  retrieveMetadata(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(L`/v1/files/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  upload(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/files?beta=true", _s({
      body: o,
      ...t,
      headers: R([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        Fm(o.file),
        t?.headers
      ])
    }, this._client));
  }
}, nd = class extends X {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(L`/v1/models/${e}?beta=true`, {
      ...n,
      headers: R([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", lo, {
      query: o,
      ...t,
      headers: R([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, od = class extends X {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/user_profiles?beta=true", {
      body: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "user-profiles-2026-03-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(L`/v1/user_profiles/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(L`/v1/user_profiles/${e}?beta=true`, {
      body: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/user_profiles?beta=true", ve, {
      query: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "user-profiles-2026-03-24"].toString() }, t?.headers])
    });
  }
  createEnrollmentURL(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(L`/v1/user_profiles/${e}/enrollment_url?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
}, rd = class extends X {
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(L`/v1/agents/${e}/versions?beta=true`, ve, {
      query: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, ys = class extends X {
  constructor() {
    super(...arguments), this.versions = new rd(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/agents?beta=true", {
      body: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.get(L`/v1/agents/${e}?beta=true`, {
      query: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(L`/v1/agents/${e}?beta=true`, {
      body: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/agents?beta=true", ve, {
      query: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(L`/v1/agents/${e}/archive?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
ys.Versions = rd;
var id = class extends X {
  create(e, t, n) {
    const { view: o, betas: r, ...i } = t;
    return this._client.post(L`/v1/memory_stores/${e}/memories?beta=true`, {
      query: { view: o },
      body: i,
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { memory_store_id: o, betas: r, ...i } = t;
    return this._client.get(L`/v1/memory_stores/${o}/memories/${e}?beta=true`, {
      query: i,
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { memory_store_id: o, view: r, betas: i, ...a } = t;
    return this._client.post(L`/v1/memory_stores/${o}/memories/${e}?beta=true`, {
      query: { view: r },
      body: a,
      ...n,
      headers: R([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(L`/v1/memory_stores/${e}/memories?beta=true`, ve, {
      query: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { memory_store_id: o, expected_content_sha256: r, betas: i } = t;
    return this._client.delete(L`/v1/memory_stores/${o}/memories/${e}?beta=true`, {
      query: { expected_content_sha256: r },
      ...n,
      headers: R([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, sd = class extends X {
  retrieve(e, t, n) {
    const { memory_store_id: o, betas: r, ...i } = t;
    return this._client.get(L`/v1/memory_stores/${o}/memory_versions/${e}?beta=true`, {
      query: i,
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(L`/v1/memory_stores/${e}/memory_versions?beta=true`, ve, {
      query: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  redact(e, t, n) {
    const { memory_store_id: o, betas: r } = t;
    return this._client.post(L`/v1/memory_stores/${o}/memory_versions/${e}/redact?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Pr = class extends X {
  constructor() {
    super(...arguments), this.memories = new id(this._client), this.memoryVersions = new sd(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/memory_stores?beta=true", {
      body: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(L`/v1/memory_stores/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(L`/v1/memory_stores/${e}?beta=true`, {
      body: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/memory_stores?beta=true", ve, {
      query: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(L`/v1/memory_stores/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(L`/v1/memory_stores/${e}/archive?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Pr.Memories = id;
Pr.MemoryVersions = sd;
var ad = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};
function ld(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function Na(e, t, n) {
  const o = ld(t);
  return !t || !("parse" in (o ?? {})) ? {
    ...e,
    content: e.content.map((r) => {
      if (r.type === "text") {
        const i = Object.defineProperty({ ...r }, "parsed_output", {
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
      return r;
    }),
    parsed_output: null
  } : ud(e, t, n);
}
function ud(e, t, n) {
  let o = null;
  const r = e.content.map((i) => {
    if (i.type === "text") {
      const a = Om(t, i.text);
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
    content: r,
    parsed_output: o
  };
}
function Om(e, t) {
  const n = ld(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new G(`Failed to parse structured output: ${o}`);
  }
}
var Gm = (e) => {
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
    let r = /[0-9]/;
    if (o && r.test(o) || o === "-" || o === ".") {
      let a = "";
      for (o === "-" && (a += o, o = e[++t]); o && r.test(o) || o === "."; )
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
}, Bt = (e) => {
  if (e.length === 0) return e;
  let t = e[e.length - 1];
  switch (t.type) {
    case "separator":
      return e = e.slice(0, e.length - 1), Bt(e);
    case "number":
      let n = t.value[t.value.length - 1];
      if (n === "." || n === "-")
        return e = e.slice(0, e.length - 1), Bt(e);
    case "string":
      let o = e[e.length - 2];
      if (o?.type === "delimiter")
        return e = e.slice(0, e.length - 1), Bt(e);
      if (o?.type === "brace" && o.value === "{")
        return e = e.slice(0, e.length - 1), Bt(e);
      break;
    case "delimiter":
      return e = e.slice(0, e.length - 1), Bt(e);
  }
  return e;
}, Bm = (e) => {
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
}, qm = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, cd = (e) => JSON.parse(qm(Bm(Bt(Gm(e))))), Pe, st, $t, hn, So, pn, mn, Eo, gn, Xe, _n, wo, Co, vt, Io, Ro, yn, Yr, ka, bo, Xr, Qr, Zr, Da, $a = "__json_buf";
function La(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var Hm = class Ii {
  constructor(t, n) {
    Pe.add(this), this.messages = [], this.receivedMessages = [], st.set(this, void 0), $t.set(this, null), this.controller = new AbortController(), hn.set(this, void 0), So.set(this, () => {
    }), pn.set(this, () => {
    }), mn.set(this, void 0), Eo.set(this, () => {
    }), gn.set(this, () => {
    }), Xe.set(this, {}), _n.set(this, !1), wo.set(this, !1), Co.set(this, !1), vt.set(this, !1), Io.set(this, void 0), Ro.set(this, void 0), yn.set(this, void 0), bo.set(this, (o) => {
      if (k(this, wo, !0, "f"), jn(o) && (o = new Be()), o instanceof Be)
        return k(this, Co, !0, "f"), this._emit("abort", o);
      if (o instanceof G) return this._emit("error", o);
      if (o instanceof Error) {
        const r = new G(o.message);
        return r.cause = o, this._emit("error", r);
      }
      return this._emit("error", new G(String(o)));
    }), k(this, hn, new Promise((o, r) => {
      k(this, So, o, "f"), k(this, pn, r, "f");
    }), "f"), k(this, mn, new Promise((o, r) => {
      k(this, Eo, o, "f"), k(this, gn, r, "f");
    }), "f"), T(this, hn, "f").catch(() => {
    }), T(this, mn, "f").catch(() => {
    }), k(this, $t, t, "f"), k(this, yn, n?.logger ?? console, "f");
  }
  get response() {
    return T(this, Io, "f");
  }
  get request_id() {
    return T(this, Ro, "f");
  }
  async withResponse() {
    k(this, vt, !0, "f");
    const t = await T(this, hn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Ii(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, o, { logger: r } = {}) {
    const i = new Ii(n, { logger: r });
    for (const a of n.messages) i._addMessageParam(a);
    return k(i, $t, {
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
    }, T(this, bo, "f"));
  }
  _addMessageParam(t) {
    this.messages.push(t);
  }
  _addMessage(t, n = !0) {
    this.receivedMessages.push(t), n && this._emit("message", t);
  }
  async _createMessage(t, n, o) {
    const r = o?.signal;
    let i;
    r && (r.aborted && this.controller.abort(), i = this.controller.abort.bind(this.controller), r.addEventListener("abort", i));
    try {
      T(this, Pe, "m", Xr).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) T(this, Pe, "m", Qr).call(this, c);
      if (u.controller.signal?.aborted) throw new Be();
      T(this, Pe, "m", Zr).call(this);
    } finally {
      r && i && r.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (k(this, Io, t, "f"), k(this, Ro, t?.headers.get("request-id"), "f"), T(this, So, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return T(this, _n, "f");
  }
  get errored() {
    return T(this, wo, "f");
  }
  get aborted() {
    return T(this, Co, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (T(this, Xe, "f")[t] || (T(this, Xe, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const o = T(this, Xe, "f")[t];
    if (!o) return this;
    const r = o.findIndex((i) => i.listener === n);
    return r >= 0 && o.splice(r, 1), this;
  }
  once(t, n) {
    return (T(this, Xe, "f")[t] || (T(this, Xe, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      k(this, vt, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    k(this, vt, !0, "f"), await T(this, mn, "f");
  }
  get currentMessage() {
    return T(this, st, "f");
  }
  async finalMessage() {
    return await this.done(), T(this, Pe, "m", Yr).call(this);
  }
  async finalText() {
    return await this.done(), T(this, Pe, "m", ka).call(this);
  }
  _emit(t, ...n) {
    if (T(this, _n, "f")) return;
    t === "end" && (k(this, _n, !0, "f"), T(this, Eo, "f").call(this));
    const o = T(this, Xe, "f")[t];
    if (o && (T(this, Xe, "f")[t] = o.filter((r) => !r.once), o.forEach(({ listener: r }) => r(...n))), t === "abort") {
      const r = n[0];
      !T(this, vt, "f") && !o?.length && Promise.reject(r), T(this, pn, "f").call(this, r), T(this, gn, "f").call(this, r), this._emit("end");
      return;
    }
    if (t === "error") {
      const r = n[0];
      !T(this, vt, "f") && !o?.length && Promise.reject(r), T(this, pn, "f").call(this, r), T(this, gn, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", T(this, Pe, "m", Yr).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let r;
    o && (o.aborted && this.controller.abort(), r = this.controller.abort.bind(this.controller), o.addEventListener("abort", r));
    try {
      T(this, Pe, "m", Xr).call(this), this._connected(null);
      const i = eo.fromReadableStream(t, this.controller);
      for await (const a of i) T(this, Pe, "m", Qr).call(this, a);
      if (i.controller.signal?.aborted) throw new Be();
      T(this, Pe, "m", Zr).call(this);
    } finally {
      o && r && o.removeEventListener("abort", r);
    }
  }
  [(st = /* @__PURE__ */ new WeakMap(), $t = /* @__PURE__ */ new WeakMap(), hn = /* @__PURE__ */ new WeakMap(), So = /* @__PURE__ */ new WeakMap(), pn = /* @__PURE__ */ new WeakMap(), mn = /* @__PURE__ */ new WeakMap(), Eo = /* @__PURE__ */ new WeakMap(), gn = /* @__PURE__ */ new WeakMap(), Xe = /* @__PURE__ */ new WeakMap(), _n = /* @__PURE__ */ new WeakMap(), wo = /* @__PURE__ */ new WeakMap(), Co = /* @__PURE__ */ new WeakMap(), vt = /* @__PURE__ */ new WeakMap(), Io = /* @__PURE__ */ new WeakMap(), Ro = /* @__PURE__ */ new WeakMap(), yn = /* @__PURE__ */ new WeakMap(), bo = /* @__PURE__ */ new WeakMap(), Pe = /* @__PURE__ */ new WeakSet(), Yr = function() {
    if (this.receivedMessages.length === 0) throw new G("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, ka = function() {
    if (this.receivedMessages.length === 0) throw new G("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new G("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, Xr = function() {
    this.ended || k(this, st, void 0, "f");
  }, Qr = function(n) {
    if (this.ended) return;
    const o = T(this, Pe, "m", Da).call(this, n);
    switch (this._emit("streamEvent", n, o), n.type) {
      case "content_block_delta": {
        const r = o.content.at(-1);
        switch (n.delta.type) {
          case "text_delta":
            r.type === "text" && this._emit("text", n.delta.text, r.text || "");
            break;
          case "citations_delta":
            r.type === "text" && this._emit("citation", n.delta.citation, r.citations ?? []);
            break;
          case "input_json_delta":
            La(r) && r.input && this._emit("inputJson", n.delta.partial_json, r.input);
            break;
          case "thinking_delta":
            r.type === "thinking" && this._emit("thinking", n.delta.thinking, r.thinking);
            break;
          case "signature_delta":
            r.type === "thinking" && this._emit("signature", r.signature);
            break;
          case "compaction_delta":
            r.type === "compaction" && r.content && this._emit("compaction", r.content);
            break;
          default:
            n.delta;
        }
        break;
      }
      case "message_stop":
        this._addMessageParam(o), this._addMessage(Na(o, T(this, $t, "f"), { logger: T(this, yn, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        k(this, st, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, Zr = function() {
    if (this.ended) throw new G("stream has ended, this shouldn't happen");
    const n = T(this, st, "f");
    if (!n) throw new G("request ended without sending any chunks");
    return k(this, st, void 0, "f"), Na(n, T(this, $t, "f"), { logger: T(this, yn, "f") });
  }, Da = function(n) {
    let o = T(this, st, "f");
    if (n.type === "message_start") {
      if (o) throw new G(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!o) throw new G(`Unexpected event order, got ${n.type} before "message_start"`);
    switch (n.type) {
      case "message_stop":
        return o;
      case "message_delta":
        return o.container = n.delta.container, o.stop_reason = n.delta.stop_reason, o.stop_sequence = n.delta.stop_sequence, o.usage.output_tokens = n.usage.output_tokens, o.context_management = n.context_management, n.usage.input_tokens != null && (o.usage.input_tokens = n.usage.input_tokens), n.usage.cache_creation_input_tokens != null && (o.usage.cache_creation_input_tokens = n.usage.cache_creation_input_tokens), n.usage.cache_read_input_tokens != null && (o.usage.cache_read_input_tokens = n.usage.cache_read_input_tokens), n.usage.server_tool_use != null && (o.usage.server_tool_use = n.usage.server_tool_use), n.usage.iterations != null && (o.usage.iterations = n.usage.iterations), o;
      case "content_block_start":
        return o.content.push(n.content_block), o;
      case "content_block_delta": {
        const r = o.content.at(n.index);
        switch (n.delta.type) {
          case "text_delta":
            r?.type === "text" && (o.content[n.index] = {
              ...r,
              text: (r.text || "") + n.delta.text
            });
            break;
          case "citations_delta":
            r?.type === "text" && (o.content[n.index] = {
              ...r,
              citations: [...r.citations ?? [], n.delta.citation]
            });
            break;
          case "input_json_delta":
            if (r && La(r)) {
              let i = r[$a] || "";
              i += n.delta.partial_json;
              const a = { ...r };
              if (Object.defineProperty(a, $a, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i) try {
                a.input = cd(i);
              } catch (u) {
                const c = new G(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${i}`);
                T(this, bo, "f").call(this, c);
              }
              o.content[n.index] = a;
            }
            break;
          case "thinking_delta":
            r?.type === "thinking" && (o.content[n.index] = {
              ...r,
              thinking: r.thinking + n.delta.thinking
            });
            break;
          case "signature_delta":
            r?.type === "thinking" && (o.content[n.index] = {
              ...r,
              signature: n.delta.signature
            });
            break;
          case "compaction_delta":
            r?.type === "compaction" && (o.content[n.index] = {
              ...r,
              content: (r.content || "") + n.delta.content
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
    return this.on("streamEvent", (r) => {
      const i = n.shift();
      i ? i.resolve(r) : t.push(r);
    }), this.on("end", () => {
      o = !0;
      for (const r of n) r.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (r) => {
      o = !0;
      for (const i of n) i.reject(r);
      n.length = 0;
    }), this.on("error", (r) => {
      o = !0;
      for (const i of n) i.reject(r);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : o ? {
        value: void 0,
        done: !0
      } : new Promise((r, i) => n.push({
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
  toReadableStream() {
    return new eo(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, dd = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var Vm = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
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
Wrap your summary in <summary></summary> tags.`, vn, Lt, At, ee, me, Ae, tt, at, An, Ua, Ri;
function Fa() {
  let e, t;
  return {
    promise: new Promise((n, o) => {
      e = n, t = o;
    }),
    resolve: e,
    reject: t
  };
}
var fd = class {
  constructor(e, t, n) {
    vn.add(this), this.client = e, Lt.set(this, !1), At.set(this, !1), ee.set(this, void 0), me.set(this, void 0), Ae.set(this, void 0), tt.set(this, void 0), at.set(this, void 0), An.set(this, 0), k(this, ee, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const o = ["BetaToolRunner", ...jc(t.tools, t.messages)].join(", ");
    k(this, me, {
      ...n,
      headers: R([{ "x-stainless-helper": o }, n?.headers])
    }, "f"), k(this, at, Fa(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(Lt = /* @__PURE__ */ new WeakMap(), At = /* @__PURE__ */ new WeakMap(), ee = /* @__PURE__ */ new WeakMap(), me = /* @__PURE__ */ new WeakMap(), Ae = /* @__PURE__ */ new WeakMap(), tt = /* @__PURE__ */ new WeakMap(), at = /* @__PURE__ */ new WeakMap(), An = /* @__PURE__ */ new WeakMap(), vn = /* @__PURE__ */ new WeakSet(), Ua = async function() {
    const t = T(this, ee, "f").params.compactionControl;
    if (!t || !t.enabled) return !1;
    let n = 0;
    if (T(this, Ae, "f") !== void 0) try {
      const c = await T(this, Ae, "f");
      n = c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0) + c.usage.output_tokens;
    } catch {
      return !1;
    }
    const o = t.contextTokenThreshold ?? 1e5;
    if (n < o) return !1;
    const r = t.model ?? T(this, ee, "f").params.model, i = t.summaryPrompt ?? Vm, a = T(this, ee, "f").params.messages;
    if (a[a.length - 1].role === "assistant") {
      const c = a[a.length - 1];
      if (Array.isArray(c.content)) {
        const d = c.content.filter((h) => h.type !== "tool_use");
        d.length === 0 ? a.pop() : c.content = d;
      }
    }
    const u = await this.client.beta.messages.create({
      model: r,
      messages: [...a, {
        role: "user",
        content: [{
          type: "text",
          text: i
        }]
      }],
      max_tokens: T(this, ee, "f").params.max_tokens
    }, {
      signal: T(this, me, "f").signal,
      headers: R([T(this, me, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (u.content[0]?.type !== "text") throw new G("Expected text response for compaction");
    return T(this, ee, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (T(this, Lt, "f")) throw new G("Cannot iterate over a consumed stream");
    k(this, Lt, !0, "f"), k(this, At, !0, "f"), k(this, tt, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (T(this, ee, "f").params.max_iterations && T(this, An, "f") >= T(this, ee, "f").params.max_iterations) break;
          k(this, At, !1, "f"), k(this, tt, void 0, "f"), k(this, An, (e = T(this, An, "f"), e++, e), "f"), k(this, Ae, void 0, "f");
          const { max_iterations: n, compactionControl: o, ...r } = T(this, ee, "f").params;
          if (r.stream ? (t = this.client.beta.messages.stream({ ...r }, T(this, me, "f")), k(this, Ae, t.finalMessage(), "f"), T(this, Ae, "f").catch(() => {
          }), yield t) : (k(this, Ae, this.client.beta.messages.create({
            ...r,
            stream: !1
          }, T(this, me, "f")), "f"), yield T(this, Ae, "f")), !await T(this, vn, "m", Ua).call(this)) {
            if (!T(this, At, "f")) {
              const { role: a, content: u } = await T(this, Ae, "f");
              T(this, ee, "f").params.messages.push({
                role: a,
                content: u
              });
            }
            const i = await T(this, vn, "m", Ri).call(this, T(this, ee, "f").params.messages.at(-1));
            if (i) T(this, ee, "f").params.messages.push(i);
            else if (!T(this, At, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!T(this, Ae, "f")) throw new G("ToolRunner concluded without a message from the server");
      T(this, at, "f").resolve(await T(this, Ae, "f"));
    } catch (t) {
      throw k(this, Lt, !1, "f"), T(this, at, "f").promise.catch(() => {
      }), T(this, at, "f").reject(t), k(this, at, Fa(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? T(this, ee, "f").params = e(T(this, ee, "f").params) : T(this, ee, "f").params = e, k(this, At, !0, "f"), k(this, tt, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? k(this, me, e(T(this, me, "f")), "f") : k(this, me, {
      ...T(this, me, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = T(this, me, "f").signal) {
    const t = await T(this, Ae, "f") ?? this.params.messages.at(-1);
    return t ? T(this, vn, "m", Ri).call(this, t, e) : null;
  }
  done() {
    return T(this, at, "f").promise;
  }
  async runUntilDone() {
    if (!T(this, Lt, "f")) for await (const e of this) ;
    return this.done();
  }
  get params() {
    return T(this, ee, "f").params;
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
Ri = async function(t, n = T(this, me, "f").signal) {
  return T(this, tt, "f") !== void 0 ? T(this, tt, "f") : (k(this, tt, Jm(T(this, ee, "f").params, t, {
    ...T(this, me, "f"),
    signal: n
  }), "f"), T(this, tt, "f"));
};
async function Jm(e, t = e.messages.at(-1), n) {
  if (!t || t.role !== "assistant" || !t.content || typeof t.content == "string") return null;
  const o = t.content.filter((r) => r.type === "tool_use");
  return o.length === 0 ? null : {
    role: "user",
    content: await Promise.all(o.map(async (r) => {
      const i = e.tools.find((a) => ("name" in a ? a.name : a.mcp_server_name) === r.name);
      if (!i || !("run" in i)) return {
        type: "tool_result",
        tool_use_id: r.id,
        content: `Error: Tool '${r.name}' not found`,
        is_error: !0
      };
      try {
        let a = r.input;
        "parse" in i && i.parse && (a = i.parse(a));
        const u = await i.run(a, {
          toolUseBlock: r,
          signal: n?.signal
        });
        return {
          type: "tool_result",
          tool_use_id: r.id,
          content: u
        };
      } catch (a) {
        return {
          type: "tool_result",
          tool_use_id: r.id,
          content: a instanceof dd ? a.content : `Error: ${a instanceof Error ? a.message : String(a)}`,
          is_error: !0
        };
      }
    }))
  };
}
var hd = class pd {
  constructor(t, n) {
    this.iterator = t, this.controller = n;
  }
  async *decoder() {
    const t = new ao();
    for await (const n of this.iterator) for (const o of t.decode(n)) yield JSON.parse(o);
    for (const n of t.flush()) yield JSON.parse(n);
  }
  [Symbol.asyncIterator]() {
    return this.decoder();
  }
  static fromResponse(t, n) {
    if (!t.body)
      throw n.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new G("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new G("Attempted to iterate over a response with no body");
    return new pd(ms(t.body), n);
  }
}, md = class extends X {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/messages/batches?beta=true", {
      body: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(L`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/messages/batches?beta=true", lo, {
      query: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(L`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  cancel(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(L`/v1/messages/batches/${e}/cancel?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  async results(e, t = {}, n) {
    const o = await this.retrieve(e);
    if (!o.results_url) throw new G(`No batch \`results_url\`; Has it finished processing? ${o.processing_status} - ${o.id}`);
    const { betas: r } = t ?? {};
    return this._client.get(o.results_url, {
      ...n,
      headers: R([{
        "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((i, a) => hd.fromResponse(a.response, a.controller));
  }
}, Oa = {
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
}, Km = ["claude-mythos-preview", "claude-opus-4-6"], uo = class extends X {
  constructor() {
    super(...arguments), this.batches = new md(this._client);
  }
  create(e, t) {
    const n = Ga(e), { betas: o, ...r } = n;
    r.model in Oa && console.warn(`The model '${r.model}' is deprecated and will reach end-of-life on ${Oa[r.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), Km.includes(r.model) && r.thinking && r.thinking.type === "enabled" && console.warn(`Using Claude with ${r.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let i = this._client._options.timeout;
    if (!r.stream && i == null) {
      const u = ad[r.model] ?? void 0;
      i = this._client.calculateNonstreamingTimeout(r.max_tokens, u);
    }
    const a = ed(r.tools, r.messages);
    return this._client.post("/v1/messages?beta=true", {
      body: r,
      timeout: i ?? 6e5,
      ...t,
      headers: R([
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
      headers: R([{ "anthropic-beta": [...e.betas ?? [], "structured-outputs-2025-12-15"].toString() }, t?.headers])
    }, this.create(e, t).then((n) => ud(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Hm.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...o } = Ga(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new fd(this._client, e, t);
  }
};
function Ga(e) {
  if (!e.output_format) return e;
  if (e.output_config?.format) throw new G("Both output_format and output_config.format were provided. Please use only output_config.format (output_format is deprecated).");
  const { output_format: t, ...n } = e;
  return {
    ...n,
    output_config: {
      ...e.output_config,
      format: t
    }
  };
}
uo.Batches = md;
uo.BetaToolRunner = fd;
uo.ToolError = dd;
var gd = class extends X {
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(L`/v1/sessions/${e}/events?beta=true`, ve, {
      query: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  send(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(L`/v1/sessions/${e}/events?beta=true`, {
      body: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  stream(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(L`/v1/sessions/${e}/events/stream?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers]),
      stream: !0
    });
  }
}, _d = class extends X {
  retrieve(e, t, n) {
    const { session_id: o, betas: r } = t;
    return this._client.get(L`/v1/sessions/${o}/resources/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { session_id: o, betas: r, ...i } = t;
    return this._client.post(L`/v1/sessions/${o}/resources/${e}?beta=true`, {
      body: i,
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(L`/v1/sessions/${e}/resources?beta=true`, ve, {
      query: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { session_id: o, betas: r } = t;
    return this._client.delete(L`/v1/sessions/${o}/resources/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  add(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(L`/v1/sessions/${e}/resources?beta=true`, {
      body: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Mr = class extends X {
  constructor() {
    super(...arguments), this.events = new gd(this._client), this.resources = new _d(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/sessions?beta=true", {
      body: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(L`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(L`/v1/sessions/${e}?beta=true`, {
      body: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/sessions?beta=true", ve, {
      query: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(L`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(L`/v1/sessions/${e}/archive?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Mr.Events = gd;
Mr.Resources = _d;
var yd = class extends X {
  create(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.post(L`/v1/skills/${e}/versions?beta=true`, _s({
      body: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: o, betas: r } = t;
    return this._client.get(L`/v1/skills/${o}/versions/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(L`/v1/skills/${e}/versions?beta=true`, ve, {
      query: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { skill_id: o, betas: r } = t;
    return this._client.delete(L`/v1/skills/${o}/versions/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
}, vs = class extends X {
  constructor() {
    super(...arguments), this.versions = new yd(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.post("/v1/skills?beta=true", _s({
      body: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    }, this._client, !1));
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(L`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/skills?beta=true", ve, {
      query: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(L`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
};
vs.Versions = yd;
var vd = class extends X {
  create(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(L`/v1/vaults/${e}/credentials?beta=true`, {
      body: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vault_id: o, betas: r } = t;
    return this._client.get(L`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vault_id: o, betas: r, ...i } = t;
    return this._client.post(L`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      body: i,
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(L`/v1/vaults/${e}/credentials?beta=true`, ve, {
      query: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vault_id: o, betas: r } = t;
    return this._client.delete(L`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t, n) {
    const { vault_id: o, betas: r } = t;
    return this._client.post(L`/v1/vaults/${o}/credentials/${e}/archive?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, As = class extends X {
  constructor() {
    super(...arguments), this.credentials = new vd(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/vaults?beta=true", {
      body: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(L`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(L`/v1/vaults/${e}?beta=true`, {
      body: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/vaults?beta=true", ve, {
      query: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(L`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(L`/v1/vaults/${e}/archive?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
As.Credentials = vd;
var ke = class extends X {
  constructor() {
    super(...arguments), this.models = new nd(this._client), this.messages = new uo(this._client), this.agents = new ys(this._client), this.environments = new Zc(this._client), this.sessions = new Mr(this._client), this.vaults = new As(this._client), this.memoryStores = new Pr(this._client), this.files = new td(this._client), this.skills = new vs(this._client), this.userProfiles = new od(this._client);
  }
};
ke.Models = nd;
ke.Messages = uo;
ke.Agents = ys;
ke.Environments = Zc;
ke.Sessions = Mr;
ke.Vaults = As;
ke.MemoryStores = Pr;
ke.Files = td;
ke.Skills = vs;
ke.UserProfiles = od;
var Ad = class extends X {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/complete", {
      body: o,
      timeout: this._client._options.timeout ?? 6e5,
      ...t,
      headers: R([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers]),
      stream: e.stream ?? !1
    });
  }
};
function Td(e) {
  return e?.output_config?.format;
}
function Ba(e, t, n) {
  const o = Td(t);
  return !t || !("parse" in (o ?? {})) ? {
    ...e,
    content: e.content.map((r) => r.type === "text" ? Object.defineProperty({ ...r }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : r),
    parsed_output: null
  } : Sd(e, t, n);
}
function Sd(e, t, n) {
  let o = null;
  const r = e.content.map((i) => {
    if (i.type === "text") {
      const a = Wm(t, i.text);
      return o === null && (o = a), Object.defineProperty({ ...i }, "parsed_output", {
        value: a,
        enumerable: !1
      });
    }
    return i;
  });
  return {
    ...e,
    content: r,
    parsed_output: o
  };
}
function Wm(e, t) {
  const n = Td(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new G(`Failed to parse structured output: ${o}`);
  }
}
var Me, lt, Ut, Tn, Po, Sn, En, Mo, wn, Qe, Cn, xo, No, Tt, ko, Do, In, jr, qa, ei, ti, ni, oi, Ha, Va = "__json_buf";
function Ja(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var zm = class bi {
  constructor(t, n) {
    Me.add(this), this.messages = [], this.receivedMessages = [], lt.set(this, void 0), Ut.set(this, null), this.controller = new AbortController(), Tn.set(this, void 0), Po.set(this, () => {
    }), Sn.set(this, () => {
    }), En.set(this, void 0), Mo.set(this, () => {
    }), wn.set(this, () => {
    }), Qe.set(this, {}), Cn.set(this, !1), xo.set(this, !1), No.set(this, !1), Tt.set(this, !1), ko.set(this, void 0), Do.set(this, void 0), In.set(this, void 0), ei.set(this, (o) => {
      if (k(this, xo, !0, "f"), jn(o) && (o = new Be()), o instanceof Be)
        return k(this, No, !0, "f"), this._emit("abort", o);
      if (o instanceof G) return this._emit("error", o);
      if (o instanceof Error) {
        const r = new G(o.message);
        return r.cause = o, this._emit("error", r);
      }
      return this._emit("error", new G(String(o)));
    }), k(this, Tn, new Promise((o, r) => {
      k(this, Po, o, "f"), k(this, Sn, r, "f");
    }), "f"), k(this, En, new Promise((o, r) => {
      k(this, Mo, o, "f"), k(this, wn, r, "f");
    }), "f"), T(this, Tn, "f").catch(() => {
    }), T(this, En, "f").catch(() => {
    }), k(this, Ut, t, "f"), k(this, In, n?.logger ?? console, "f");
  }
  get response() {
    return T(this, ko, "f");
  }
  get request_id() {
    return T(this, Do, "f");
  }
  async withResponse() {
    k(this, Tt, !0, "f");
    const t = await T(this, Tn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new bi(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, o, { logger: r } = {}) {
    const i = new bi(n, { logger: r });
    for (const a of n.messages) i._addMessageParam(a);
    return k(i, Ut, {
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
    }, T(this, ei, "f"));
  }
  _addMessageParam(t) {
    this.messages.push(t);
  }
  _addMessage(t, n = !0) {
    this.receivedMessages.push(t), n && this._emit("message", t);
  }
  async _createMessage(t, n, o) {
    const r = o?.signal;
    let i;
    r && (r.aborted && this.controller.abort(), i = this.controller.abort.bind(this.controller), r.addEventListener("abort", i));
    try {
      T(this, Me, "m", ti).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) T(this, Me, "m", ni).call(this, c);
      if (u.controller.signal?.aborted) throw new Be();
      T(this, Me, "m", oi).call(this);
    } finally {
      r && i && r.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (k(this, ko, t, "f"), k(this, Do, t?.headers.get("request-id"), "f"), T(this, Po, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return T(this, Cn, "f");
  }
  get errored() {
    return T(this, xo, "f");
  }
  get aborted() {
    return T(this, No, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (T(this, Qe, "f")[t] || (T(this, Qe, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const o = T(this, Qe, "f")[t];
    if (!o) return this;
    const r = o.findIndex((i) => i.listener === n);
    return r >= 0 && o.splice(r, 1), this;
  }
  once(t, n) {
    return (T(this, Qe, "f")[t] || (T(this, Qe, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      k(this, Tt, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    k(this, Tt, !0, "f"), await T(this, En, "f");
  }
  get currentMessage() {
    return T(this, lt, "f");
  }
  async finalMessage() {
    return await this.done(), T(this, Me, "m", jr).call(this);
  }
  async finalText() {
    return await this.done(), T(this, Me, "m", qa).call(this);
  }
  _emit(t, ...n) {
    if (T(this, Cn, "f")) return;
    t === "end" && (k(this, Cn, !0, "f"), T(this, Mo, "f").call(this));
    const o = T(this, Qe, "f")[t];
    if (o && (T(this, Qe, "f")[t] = o.filter((r) => !r.once), o.forEach(({ listener: r }) => r(...n))), t === "abort") {
      const r = n[0];
      !T(this, Tt, "f") && !o?.length && Promise.reject(r), T(this, Sn, "f").call(this, r), T(this, wn, "f").call(this, r), this._emit("end");
      return;
    }
    if (t === "error") {
      const r = n[0];
      !T(this, Tt, "f") && !o?.length && Promise.reject(r), T(this, Sn, "f").call(this, r), T(this, wn, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", T(this, Me, "m", jr).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let r;
    o && (o.aborted && this.controller.abort(), r = this.controller.abort.bind(this.controller), o.addEventListener("abort", r));
    try {
      T(this, Me, "m", ti).call(this), this._connected(null);
      const i = eo.fromReadableStream(t, this.controller);
      for await (const a of i) T(this, Me, "m", ni).call(this, a);
      if (i.controller.signal?.aborted) throw new Be();
      T(this, Me, "m", oi).call(this);
    } finally {
      o && r && o.removeEventListener("abort", r);
    }
  }
  [(lt = /* @__PURE__ */ new WeakMap(), Ut = /* @__PURE__ */ new WeakMap(), Tn = /* @__PURE__ */ new WeakMap(), Po = /* @__PURE__ */ new WeakMap(), Sn = /* @__PURE__ */ new WeakMap(), En = /* @__PURE__ */ new WeakMap(), Mo = /* @__PURE__ */ new WeakMap(), wn = /* @__PURE__ */ new WeakMap(), Qe = /* @__PURE__ */ new WeakMap(), Cn = /* @__PURE__ */ new WeakMap(), xo = /* @__PURE__ */ new WeakMap(), No = /* @__PURE__ */ new WeakMap(), Tt = /* @__PURE__ */ new WeakMap(), ko = /* @__PURE__ */ new WeakMap(), Do = /* @__PURE__ */ new WeakMap(), In = /* @__PURE__ */ new WeakMap(), ei = /* @__PURE__ */ new WeakMap(), Me = /* @__PURE__ */ new WeakSet(), jr = function() {
    if (this.receivedMessages.length === 0) throw new G("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, qa = function() {
    if (this.receivedMessages.length === 0) throw new G("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new G("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, ti = function() {
    this.ended || k(this, lt, void 0, "f");
  }, ni = function(n) {
    if (this.ended) return;
    const o = T(this, Me, "m", Ha).call(this, n);
    switch (this._emit("streamEvent", n, o), n.type) {
      case "content_block_delta": {
        const r = o.content.at(-1);
        switch (n.delta.type) {
          case "text_delta":
            r.type === "text" && this._emit("text", n.delta.text, r.text || "");
            break;
          case "citations_delta":
            r.type === "text" && this._emit("citation", n.delta.citation, r.citations ?? []);
            break;
          case "input_json_delta":
            Ja(r) && r.input && this._emit("inputJson", n.delta.partial_json, r.input);
            break;
          case "thinking_delta":
            r.type === "thinking" && this._emit("thinking", n.delta.thinking, r.thinking);
            break;
          case "signature_delta":
            r.type === "thinking" && this._emit("signature", r.signature);
            break;
          default:
            n.delta;
        }
        break;
      }
      case "message_stop":
        this._addMessageParam(o), this._addMessage(Ba(o, T(this, Ut, "f"), { logger: T(this, In, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        k(this, lt, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, oi = function() {
    if (this.ended) throw new G("stream has ended, this shouldn't happen");
    const n = T(this, lt, "f");
    if (!n) throw new G("request ended without sending any chunks");
    return k(this, lt, void 0, "f"), Ba(n, T(this, Ut, "f"), { logger: T(this, In, "f") });
  }, Ha = function(n) {
    let o = T(this, lt, "f");
    if (n.type === "message_start") {
      if (o) throw new G(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!o) throw new G(`Unexpected event order, got ${n.type} before "message_start"`);
    switch (n.type) {
      case "message_stop":
        return o;
      case "message_delta":
        return o.stop_reason = n.delta.stop_reason, o.stop_sequence = n.delta.stop_sequence, o.usage.output_tokens = n.usage.output_tokens, n.usage.input_tokens != null && (o.usage.input_tokens = n.usage.input_tokens), n.usage.cache_creation_input_tokens != null && (o.usage.cache_creation_input_tokens = n.usage.cache_creation_input_tokens), n.usage.cache_read_input_tokens != null && (o.usage.cache_read_input_tokens = n.usage.cache_read_input_tokens), n.usage.server_tool_use != null && (o.usage.server_tool_use = n.usage.server_tool_use), o;
      case "content_block_start":
        return o.content.push({ ...n.content_block }), o;
      case "content_block_delta": {
        const r = o.content.at(n.index);
        switch (n.delta.type) {
          case "text_delta":
            r?.type === "text" && (o.content[n.index] = {
              ...r,
              text: (r.text || "") + n.delta.text
            });
            break;
          case "citations_delta":
            r?.type === "text" && (o.content[n.index] = {
              ...r,
              citations: [...r.citations ?? [], n.delta.citation]
            });
            break;
          case "input_json_delta":
            if (r && Ja(r)) {
              let i = r[Va] || "";
              i += n.delta.partial_json;
              const a = { ...r };
              Object.defineProperty(a, Va, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i && (a.input = cd(i)), o.content[n.index] = a;
            }
            break;
          case "thinking_delta":
            r?.type === "thinking" && (o.content[n.index] = {
              ...r,
              thinking: r.thinking + n.delta.thinking
            });
            break;
          case "signature_delta":
            r?.type === "thinking" && (o.content[n.index] = {
              ...r,
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
    return this.on("streamEvent", (r) => {
      const i = n.shift();
      i ? i.resolve(r) : t.push(r);
    }), this.on("end", () => {
      o = !0;
      for (const r of n) r.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (r) => {
      o = !0;
      for (const i of n) i.reject(r);
      n.length = 0;
    }), this.on("error", (r) => {
      o = !0;
      for (const i of n) i.reject(r);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : o ? {
        value: void 0,
        done: !0
      } : new Promise((r, i) => n.push({
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
  toReadableStream() {
    return new eo(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, Ed = class extends X {
  create(e, t) {
    return this._client.post("/v1/messages/batches", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(L`/v1/messages/batches/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/v1/messages/batches", lo, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(L`/v1/messages/batches/${e}`, t);
  }
  cancel(e, t) {
    return this._client.post(L`/v1/messages/batches/${e}/cancel`, t);
  }
  async results(e, t) {
    const n = await this.retrieve(e);
    if (!n.results_url) throw new G(`No batch \`results_url\`; Has it finished processing? ${n.processing_status} - ${n.id}`);
    return this._client.get(n.results_url, {
      ...t,
      headers: R([{ Accept: "application/binary" }, t?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((o, r) => hd.fromResponse(r.response, r.controller));
  }
}, Ts = class extends X {
  constructor() {
    super(...arguments), this.batches = new Ed(this._client);
  }
  create(e, t) {
    e.model in Ka && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${Ka[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), Ym.includes(e.model) && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const r = ad[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, r);
    }
    const o = ed(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: R([o, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => Sd(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return zm.createMessage(this, e, t, { logger: this._client.logger ?? console });
  }
  countTokens(e, t) {
    return this._client.post("/v1/messages/count_tokens", {
      body: e,
      ...t
    });
  }
}, Ka = {
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
}, Ym = ["claude-mythos-preview", "claude-opus-4-6"];
Ts.Batches = Ed;
var wd = class extends X {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(L`/v1/models/${e}`, {
      ...n,
      headers: R([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models", lo, {
      query: o,
      ...t,
      headers: R([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, $o = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, Pi, Ss, Xo, Cd, Xm = "\\n\\nHuman:", Qm = "\\n\\nAssistant:", Z = class {
  constructor({ baseURL: e = $o("ANTHROPIC_BASE_URL"), apiKey: t = $o("ANTHROPIC_API_KEY") ?? null, authToken: n = $o("ANTHROPIC_AUTH_TOKEN") ?? null, ...o } = {}) {
    Pi.add(this), Xo.set(this, void 0);
    const r = {
      apiKey: t,
      authToken: n,
      ...o,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!r.dangerouslyAllowBrowser && dm()) throw new G(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = r.baseURL, this.timeout = r.timeout ?? Ss.DEFAULT_TIMEOUT, this.logger = r.logger ?? console;
    const i = "warn";
    this.logLevel = i, this.logLevel = ba(r.logLevel, "ClientOptions.logLevel", this) ?? ba($o("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? i, this.fetchOptions = r.fetchOptions, this.maxRetries = r.maxRetries ?? 2, this.fetch = r.fetch ?? gm(), k(this, Xo, ym, "f"), this._options = r, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
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
    return R([await this.apiKeyAuth(e), await this.bearerAuth(e)]);
  }
  async apiKeyAuth(e) {
    if (this.apiKey != null)
      return R([{ "X-Api-Key": this.apiKey }]);
  }
  async bearerAuth(e) {
    if (this.authToken != null)
      return R([{ Authorization: `Bearer ${this.authToken}` }]);
  }
  stringifyQuery(e) {
    return vm(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Gt}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Pc()}`;
  }
  makeStatusError(e, t, n, o) {
    return Ie.generate(e, t, n, o);
  }
  buildURL(e, t, n) {
    const o = !T(this, Pi, "m", Cd).call(this) && n || this.baseURL, r = am(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), a = Object.fromEntries(r.searchParams);
    return (!Ta(i) || !Ta(a)) && (t = {
      ...a,
      ...i,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (r.search = this.stringifyQuery(t)), r.toString();
  }
  _calculateNonstreamingTimeout(e) {
    if (3600 * e / 128e3 > 600) throw new G("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#streaming-responses for more details");
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
    return new Vc(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const o = await e, r = o.maxRetries ?? this.maxRetries;
    t == null && (t = r), await this.prepareOptions(o);
    const { req: i, url: a, timeout: u } = await this.buildRequest(o, { retryCount: r - t });
    await this.prepareRequest(i, {
      url: a,
      options: o
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, h = Date.now();
    if (fe(this).debug(`[${c}] sending request`, St({
      retryOfRequestLogID: n,
      method: o.method,
      url: a,
      options: o,
      headers: i.headers
    })), o.signal?.aborted) throw new Be();
    const f = new AbortController(), p = await this.fetchWithTimeout(a, i, u, f).catch(Ai), m = Date.now();
    if (p instanceof globalThis.Error) {
      const _ = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new Be();
      const y = jn(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (t)
        return fe(this).info(`[${c}] connection ${y ? "timed out" : "failed"} - ${_}`), fe(this).debug(`[${c}] connection ${y ? "timed out" : "failed"} (${_})`, St({
          retryOfRequestLogID: n,
          url: a,
          durationMs: m - h,
          message: p.message
        })), this.retryRequest(o, t, n ?? c);
      throw fe(this).info(`[${c}] connection ${y ? "timed out" : "failed"} - error; no more retries left`), fe(this).debug(`[${c}] connection ${y ? "timed out" : "failed"} (error; no more retries left)`, St({
        retryOfRequestLogID: n,
        url: a,
        durationMs: m - h,
        message: p.message
      })), y ? new Mc() : new br({ cause: p });
    }
    const g = `[${c}${d}${[...p.headers.entries()].filter(([_]) => _ === "request-id").map(([_, y]) => ", " + _ + ": " + JSON.stringify(y)).join("")}] ${i.method} ${a} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - h}ms`;
    if (!p.ok) {
      const _ = await this.shouldRetry(p);
      if (t && _) {
        const P = `retrying, ${t} attempts remaining`;
        return await _m(p.body), fe(this).info(`${g} - ${P}`), fe(this).debug(`[${c}] response error (${P})`, St({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: m - h
        })), this.retryRequest(o, t, n ?? c, p.headers);
      }
      const y = _ ? "error; no more retries left" : "error; not retryable";
      fe(this).info(`${g} - ${y}`);
      const E = await p.text().catch((P) => Ai(P).message), w = Oc(E), C = w ? void 0 : E;
      throw fe(this).debug(`[${c}] response error (${y})`, St({
        retryOfRequestLogID: n,
        url: p.url,
        status: p.status,
        headers: p.headers,
        message: C,
        durationMs: Date.now() - h
      })), this.makeStatusError(p.status, w, C, p.headers);
    }
    return fe(this).info(g), fe(this).debug(`[${c}] response start`, St({
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
    return new bm(this, n, e);
  }
  async fetchWithTimeout(e, t, n, o) {
    const { signal: r, method: i, ...a } = t || {}, u = this._makeAbort(o);
    r && r.addEventListener("abort", u, { once: !0 });
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
    let r;
    const i = o?.get("retry-after-ms");
    if (i) {
      const u = parseFloat(i);
      Number.isNaN(u) || (r = u);
    }
    const a = o?.get("retry-after");
    if (a && !r) {
      const u = parseFloat(a);
      Number.isNaN(u) ? r = Date.parse(a) - Date.now() : r = u * 1e3;
    }
    if (r === void 0) {
      const u = e.maxRetries ?? this.maxRetries;
      r = this.calculateDefaultRetryTimeoutMillis(t, u);
    }
    return await cm(r), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const r = t - e;
    return Math.min(0.5 * Math.pow(2, r), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  calculateNonstreamingTimeout(e, t) {
    if (36e5 * e / 128e3 > 6e5 || t != null && e > t) throw new G("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details");
    return 6e5;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: o, path: r, query: i, defaultBaseURL: a } = n, u = this.buildURL(r, i, a);
    "timeout" in n && um("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    let r = {};
    this.idempotencyHeader && t !== "get" && (e.idempotencyKey || (e.idempotencyKey = this.defaultIdempotencyKey()), r[this.idempotencyHeader] = e.idempotencyKey);
    const i = R([
      r,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(o),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...mm(),
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
    const n = R([t]);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || globalThis.ReadableStream && e instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: e
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: Bc(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : T(this, Xo, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
Ss = Z, Xo = /* @__PURE__ */ new WeakMap(), Pi = /* @__PURE__ */ new WeakSet(), Cd = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
Z.Anthropic = Ss;
Z.HUMAN_PROMPT = Xm;
Z.AI_PROMPT = Qm;
Z.DEFAULT_TIMEOUT = 6e5;
Z.AnthropicError = G;
Z.APIError = Ie;
Z.APIConnectionError = br;
Z.APIConnectionTimeoutError = Mc;
Z.APIUserAbortError = Be;
Z.NotFoundError = Dc;
Z.ConflictError = $c;
Z.RateLimitError = Uc;
Z.BadRequestError = xc;
Z.AuthenticationError = Nc;
Z.InternalServerError = Fc;
Z.PermissionDeniedError = kc;
Z.UnprocessableEntityError = Lc;
Z.toFile = Dm;
var co = class extends Z {
  constructor() {
    super(...arguments), this.completions = new Ad(this), this.messages = new Ts(this), this.models = new wd(this), this.beta = new ke(this);
  }
};
co.Completions = Ad;
co.Messages = Ts;
co.Models = wd;
co.Beta = ke;
function Nt(e) {
  if (Array.isArray(e)) return e.map((n) => Nt(n));
  if (!e || typeof e != "object") return e;
  const t = {};
  return Object.entries(e).forEach(([n, o]) => {
    t[n] = /^(?:authorization|proxy[-_]?authorization|(?:x[-_])?csrf(?:[-_]?token)?|token|access[-_]?token|refresh[-_]?token|id[-_]?token|api[-_]?key|x[-_](?:goog[-_])?api[-_]?key|proxy[-_]?password|password|client[-_]?secret)$/i.test(n) ? "[redacted]" : Nt(o);
  }), t;
}
function mt(e = {}, t = {}) {
  const n = t.reasoning && typeof t.reasoning == "object" ? t.reasoning : {}, o = String(e.reasoning?.mode || "inherit"), r = e.reasoning?.output === "show" || e.reasoning?.output === "hide" ? e.reasoning.output : n.output === "show" ? "show" : "hide", i = String(n.mode || t.effectiveMode || o);
  return {
    reasoningRequestedMode: o,
    reasoningRequestedOutput: r,
    reasoningProfileId: String(n.profileId || t.profileId || e.reasoning?.profileId || "unsupported"),
    reasoningEffectiveMode: i,
    reasoningEffort: i === "on" ? String(t.effort ?? n.effort ?? e.reasoning?.effort ?? "") : "",
    reasoningBudgetTokens: i === "on" && Number.isFinite(Number(t.budgetTokens ?? n.budgetTokens ?? e.reasoning?.budgetTokens)) ? Number(t.budgetTokens ?? n.budgetTokens ?? e.reasoning?.budgetTokens) : null,
    reasoningControlFields: Nt(t.controlFields || {}),
    reasoningOutputVisible: i !== "off" && n.output === "show"
  };
}
function to(e = {}) {
  return {
    provider: e.provider || "",
    model: e.model || "",
    transport: e.transport || "sdk",
    request: Nt({
      url: e.url || "",
      method: e.method || "POST",
      headers: e.headers || {},
      body: e.body || {},
      sdk: e.sdk || void 0
    }),
    ...e.effectiveConfig ? { effectiveConfig: e.effectiveConfig } : {}
  };
}
var F0 = Object.freeze([
  Object.freeze({
    value: "inherit",
    label: "跟随模型默认"
  }),
  Object.freeze({
    value: "on",
    label: "开启"
  }),
  Object.freeze({
    value: "off",
    label: "关闭"
  })
]);
function Zm(e = "") {
  return e === "on" || e === "off" ? e : "inherit";
}
function jm(e) {
  return String(e ?? "").trim().toLowerCase() || void 0;
}
function eg(e) {
  if (e == null || e === "") return;
  const t = Number(e);
  return Number.isFinite(t) ? Math.floor(t) : void 0;
}
function Id(e = {}) {
  const t = e && typeof e == "object" ? e : {}, n = jm(t.effort), o = eg(t.budgetTokens);
  return {
    mode: Zm(t.mode),
    ...n ? { effort: n } : {},
    ...o !== void 0 ? { budgetTokens: o } : {}
  };
}
function K(e = {}) {
  return e?.mode !== "off" && e?.output === "show";
}
function tg(e = "") {
  return String(e || "").trim().toLowerCase();
}
function Es(e = "") {
  const t = tg(e);
  return t.includes("deepseek") ? "deepseek" : t.includes("kimi") || t.includes("moonshot") ? "kimi" : t.includes("gemini") ? "gemini" : t.includes("claude") ? "claude" : /(?:^|[/_.-])gpt(?:\d|[/_.-]|$)/.test(t) || /(?:^|[/_.-])o\d+(?:[/_.-]|$)/.test(t) ? "openai" : "";
}
var O0 = Object.freeze({
  minimal: "最小",
  low: "低",
  medium: "中",
  high: "高",
  xhigh: "超高",
  max: "最大",
  min: "最小"
});
function Rd(e) {
  const t = e.intensity || { kind: "none" };
  return Object.freeze({
    ...e,
    modes: Object.freeze([...e.modes || ["inherit"]]),
    outputModes: Object.freeze([...e.outputModes || ["hide", "show"]]),
    temperatureOmitModes: Object.freeze([...e.temperatureOmitModes || []]),
    intensity: Object.freeze({
      ...t,
      ...Array.isArray(t.values) ? { values: Object.freeze([...t.values]) } : {}
    })
  });
}
function Ye(e, t, n, o, r = {}) {
  return Rd({
    profileId: e,
    modes: t,
    intensity: {
      kind: "effort",
      values: n,
      defaultValue: o
    },
    outputModes: r.outputModes,
    temperatureOmitModes: r.temperatureOmitModes
  });
}
var ng = Rd({
  profileId: "unsupported",
  modes: ["inherit"],
  outputModes: ["hide"],
  intensity: { kind: "none" },
  unsupportedReason: "当前 Provider、传输方式与模型组合没有已验证的 Reasoning 控制协议。"
}), fo = Object.freeze(["on"]), ws = Object.freeze([
  "inherit",
  "on",
  "off"
]), bd = Ye("openai-gpt-5.6", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "medium", { temperatureOmitModes: ws }), og = Ye("kimi-k3", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "max", { temperatureOmitModes: fo }), rg = Ye("deepseek-thinking", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "high", { temperatureOmitModes: fo }), ig = Ye("openai-compatible-gemini-latest", [
  "inherit",
  "on",
  "off"
], [
  "minimal",
  "low",
  "medium",
  "high"
], "high", { temperatureOmitModes: fo }), sg = Ye("openai-compatible-claude-latest", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { temperatureOmitModes: fo }), ag = Ye("openai-compatible-default", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high"
], "medium", { temperatureOmitModes: fo }), lg = Ye("anthropic-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { temperatureOmitModes: ws }), ug = Ye("sillytavern-claude-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "max"
], "high", { temperatureOmitModes: ws }), cg = Ye("google-gemini-3-flash", ["inherit", "on"], [
  "minimal",
  "low",
  "medium",
  "high"
], "high"), dg = Ye("sillytavern-google-3-flash", ["inherit", "on"], [
  "min",
  "low",
  "medium",
  "high"
], "high");
function fg(e = "") {
  switch (Es(e)) {
    case "deepseek":
      return rg;
    case "kimi":
      return og;
    case "gemini":
      return ig;
    case "claude":
      return sg;
    case "openai":
      return bd;
    default:
      return ag;
  }
}
function Cs(e = {}) {
  const t = String(e.provider || "").trim(), n = String(e.model || "").trim().toLowerCase();
  switch (t) {
    case "openai-responses":
      return bd;
    case "openai-compatible":
    case "sillytavern-openai-compatible":
      return fg(n);
    case "anthropic":
      return lg;
    case "sillytavern-claude":
      return ug;
    case "google":
      return cg;
    case "sillytavern-google":
      return dg;
    default:
      return ng;
  }
}
function ri(e, t, n, o = "REASONING_CAPABILITY_UNSUPPORTED") {
  return {
    ...e,
    profileId: t.profileId,
    valid: !1,
    error: n,
    code: o
  };
}
function hg(e, t) {
  const n = { ...e };
  return delete n.effort, delete n.budgetTokens, t.intensity?.kind === "effort" ? {
    ...n,
    ...e.effort ? { effort: e.effort } : {}
  } : n;
}
function pg(e = {}, t = {}) {
  const n = Cs(e), o = Id(t), r = t?.output === "show" || t?.output === "hide" ? t.output : null, i = hg({
    ...o,
    output: o.mode === "off" ? "hide" : r || (n.outputModes.includes("show") ? "show" : "hide")
  }, n);
  if (!n.outputModes.includes(i.output)) return ri(i, n, "当前任务要求返回 Reasoning 内容，但所选模型不支持。");
  if (!n.modes.includes(i.mode)) return ri(i, n, i.mode === "off" ? "当前模型不支持显式关闭 Reasoning。请选择“跟随模型默认”。" : n.unsupportedReason || "当前模型不支持显式开启 Reasoning。");
  if (i.mode !== "on") return {
    ...i,
    profileId: n.profileId,
    valid: !0
  };
  if (n.intensity.kind === "effort") {
    const a = i.effort || n.intensity.defaultValue;
    return n.intensity.values.includes(a) ? {
      ...i,
      effort: a,
      profileId: n.profileId,
      valid: !0
    } : ri(i, n, `当前模型不支持 Reasoning 强度“${a}”。`, "REASONING_CONFIG_INVALID");
  }
  return {
    ...i,
    profileId: n.profileId,
    valid: !0
  };
}
var mg = class extends Error {
  constructor(e = {}) {
    super(e.error || "当前模型不支持所选 Reasoning 配置。"), this.name = "ReasoningCapabilityError", this.code = e.code || "REASONING_CAPABILITY_UNSUPPORTED", this.profileId = e.profileId || "unsupported", this.reasoning = e;
  }
};
function Pd(e = {}) {
  if (e.valid === !1) throw new mg(e);
  return e;
}
function Q(e = "", t = {}, n = {}, o = {}) {
  return Pd(pg({
    provider: e,
    baseUrl: t.baseUrl,
    model: t.model,
    maxTokens: o.maxTokens ?? t.maxTokens
  }, n));
}
function ho(e = {}, t = {}) {
  return Cs(e).temperatureOmitModes.includes(t.mode);
}
function gg(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function _g(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? {
    mediaType: t[1],
    data: t[2]
  } : {
    mediaType: "",
    data: ""
  };
}
function Md(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function yg(e) {
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
      const o = _g(n.image_url.url);
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
function vg(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function Ag(e) {
  const t = e?.providerPayload?.anthropicContent;
  return Array.isArray(t) && t.length && Md(t) || null;
}
function Tg(e) {
  return Array.isArray(e?.content) && e.content.length ? { anthropicContent: Md(e.content) || [] } : void 0;
}
function Wa(e = {}) {
  return {
    type: "tool_result",
    tool_use_id: e.tool_call_id,
    content: e.content
  };
}
function za(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    return n ? {
      type: "tool_use",
      id: t.id,
      name: n,
      input: gg(t.function.arguments)
    } : null;
  }).filter(Boolean);
}
function Sg(e) {
  const t = [];
  for (let n = 0; n < e.length; n += 1) {
    const o = e[n];
    if (o.role !== "system") {
      if (o.role === "assistant") {
        const r = Ag(o), i = za(o.tool_calls);
        if (r && i.length) {
          t.push({
            role: "assistant",
            content: r.filter((a) => a?.type !== "tool_use").concat(i)
          });
          continue;
        }
        if (r) {
          t.push({
            role: "assistant",
            content: r
          });
          continue;
        }
      }
      if (o.role === "tool") {
        const r = [Wa(o)];
        for (; e[n + 1]?.role === "tool"; )
          n += 1, r.push(Wa(e[n]));
        t.push({
          role: "user",
          content: r
        });
        continue;
      }
      if (o.role === "assistant" && Array.isArray(o.tool_calls) && o.tool_calls.length) {
        t.push({
          role: "assistant",
          content: [...o.content ? [{
            type: "text",
            text: o.content
          }] : [], ...za(o.tool_calls)]
        });
        continue;
      }
      t.push({
        role: o.role,
        content: yg(o.content)
      });
    }
  }
  return t;
}
function Lo(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Ya(e = "") {
  return String(e || "https://api.anthropic.com").trim().replace(/\/+$/, "").replace(/\/v1$/i, "");
}
function Eg(e = "auto", t = []) {
  const n = new Set((Array.isArray(t) ? t : []).map((r) => String(r?.function?.name || "").trim()).filter(Boolean)), o = String(e || "auto").trim() || "auto";
  if (o === "auto") return { type: "auto" };
  if (o === "required") return { type: "any" };
  if (o === "none") return { type: "none" };
  if (!n.has(o)) throw new Error(`Anthropic toolChoice 指定了不存在的工具：${o}`);
  return {
    type: "tool",
    name: o
  };
}
var wg = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function ii(e = {}, t = {}) {
  const n = Array.isArray(t.tools) ? t.tools : [], o = n.length ? Eg(t.toolChoice, n) : void 0, r = t.reasoning?.output, i = {
    ...Id(t.reasoning),
    ...r === "show" || r === "hide" ? { output: r } : {}
  }, a = Cs({
    provider: "anthropic",
    baseUrl: e.baseUrl,
    model: e.model
  }), u = i.mode === "on" && a.profileId === "anthropic-manual" && (o?.type === "any" || o?.type === "tool");
  return {
    toolChoice: o,
    effectiveReasoning: Q("anthropic", e, {
      ...i,
      ...u ? { mode: "off" } : {}
    }, { maxTokens: t.maxTokens }),
    reasoningDisabledForForcedTool: u
  };
}
var Cg = class {
  constructor(e) {
    this.config = e, this.client = new co({
      apiKey: e.apiKey,
      baseURL: Ya(e.baseUrl),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e, t = ii(this.config, e)) {
    const n = t.effectiveReasoning, o = (Array.isArray(e.tools) ? e.tools : []).map((a) => ({
      name: a.function.name,
      description: a.function.description,
      input_schema: a.function.parameters
    })), r = vg(e), i = {
      model: this.config.model,
      system: r,
      messages: Sg(e.messages),
      ...o.length ? {
        tools: o,
        tool_choice: t.toolChoice
      } : {},
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    return !ho({
      ...this.config,
      provider: "anthropic"
    }, n) && typeof e.temperature == "number" && (i.temperature = e.temperature), n.mode === "off" ? i.thinking = { type: "disabled" } : n.mode === "on" && n.profileId === "anthropic-adaptive" ? (i.thinking = {
      type: "adaptive",
      display: K(n) ? "summarized" : "omitted"
    }, i.output_config = { effort: n.effort }) : n.mode === "on" && n.profileId === "anthropic-manual" && (i.thinking = {
      type: "enabled",
      budget_tokens: n.budgetTokens,
      display: K(n) ? "summarized" : "omitted"
    }), i;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", o = Ya(this.config.baseUrl), r = t.protocol || ii(this.config, e), i = t.body || this.buildRequestBody(e, r), a = r.effectiveReasoning;
    return {
      ...to({
        provider: "anthropic",
        model: this.config.model,
        transport: "anthropic-sdk",
        url: `${o}/v1/messages`,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.config.apiKey || ""
        },
        body: i,
        sdk: n ? "client.messages.stream" : "client.messages.create",
        effectiveConfig: mt(e, {
          reasoning: a,
          effort: i.output_config?.effort,
          budgetTokens: i.thinking?.budget_tokens,
          controlFields: {
            ...i.thinking ? { thinking: i.thinking } : {},
            ...i.output_config ? { output_config: i.output_config } : {}
          }
        })
      }),
      ...r.reasoningDisabledForForcedTool ? { notices: [wg] } : {}
    };
  }
  async chat(e) {
    const t = ii(this.config, e), n = t.effectiveReasoning, o = this.buildRequestBody(e, t), r = this.inspectRequest(e, {
      body: o,
      protocol: t
    });
    let i;
    if (typeof e.onStreamProgress == "function") {
      const u = this.client.messages.stream(o, { signal: e.signal }), c = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map();
      let h = "";
      const f = () => K(n) ? Array.from(c.entries()).sort(([g], [_]) => g.localeCompare(_)).map(([g, _]) => ({
        label: g.startsWith("redacted:") ? "已脱敏思考块" : "思考块",
        text: _
      })).filter((g) => g.text) : [], p = () => Array.from(d.entries()).sort(([g], [_]) => Number(g) - Number(_)).map(([, g]) => ({
        id: g.id || "anthropic-tool-draft",
        name: g.name || "工具调用",
        arguments: g.inputJson || "{}",
        draft: !0
      })).filter((g) => g.name), m = () => {
        const g = p();
        g.length && Lo(e, {
          text: h,
          thoughts: f(),
          toolCalls: g,
          toolCallDraft: !0
        });
      };
      u.on("text", (g, _) => {
        h = _ || "", Lo(e, {
          text: h,
          thoughts: f(),
          ...p().length ? {
            toolCalls: p(),
            toolCallDraft: !0
          } : {}
        });
      }), u.on("thinking", (g, _) => {
        c.set("thinking:0", _ || ""), Lo(e, {
          thoughts: f(),
          ...p().length ? {
            text: h,
            toolCalls: p(),
            toolCallDraft: !0
          } : {}
        });
      }), u.on("streamEvent", (g) => {
        if (g?.type === "content_block_start" && g.content_block?.type === "tool_use") {
          const _ = g.content_block.input && typeof g.content_block.input == "object" ? g.content_block.input : {};
          d.set(g.index, {
            id: g.content_block.id || `anthropic-tool-draft-${g.index + 1}`,
            name: g.content_block.name || "工具调用",
            inputJson: Object.keys(_).length ? JSON.stringify(_) : ""
          }), m();
          return;
        }
        if (g?.type === "content_block_delta" && g.delta?.type === "input_json_delta") {
          const _ = d.get(g.index) || {
            id: `anthropic-tool-draft-${g.index + 1}`,
            name: "工具调用",
            inputJson: ""
          };
          d.set(g.index, {
            ..._,
            inputJson: `${_.inputJson || ""}${g.delta.partial_json || ""}`
          }), m();
        }
      }), u.on("contentBlock", (g) => {
        g?.type === "redacted_thinking" && (c.set("redacted:0", g.data || ""), Lo(e, {
          thoughts: f(),
          ...p().length ? {
            text: h,
            toolCalls: p(),
            toolCallDraft: !0
          } : {}
        }));
      }), i = await u.finalMessage();
    } else i = await this.client.messages.create(o, { signal: e.signal });
    const a = (i.content || []).filter((u) => u.type === "tool_use" && u.name).map((u, c) => ({
      id: u.id || `anthropic-tool-${c + 1}`,
      name: u.name,
      arguments: JSON.stringify(u.input || {})
    }));
    return {
      text: (i.content || []).filter((u) => u.type === "text").map((u) => u.text || "").join(`
`),
      toolCalls: a,
      thoughts: K(n) ? (i.content || []).filter((u) => u.type === "thinking" || u.type === "redacted_thinking").map((u) => ({
        label: u.type === "thinking" ? "思考块" : "已脱敏思考块",
        text: u.type === "thinking" ? u.thinking || "" : u.data || ""
      })).filter((u) => u.text) : [],
      finishReason: i.stop_reason || "stop",
      model: i.model || this.config.model,
      provider: "anthropic",
      providerPayload: Tg(i),
      requestInspection: r
    };
  }
}, Ig = /* @__PURE__ */ Rr(((e, t) => {
  function n(o, r) {
    typeof r == "boolean" && (r = { forever: r }), this._originalTimeouts = JSON.parse(JSON.stringify(o)), this._timeouts = o, this._options = r || {}, this._maxRetryTime = r && r.maxRetryTime || 1 / 0, this._fn = null, this._errors = [], this._attempts = 1, this._operationTimeout = null, this._operationTimeoutCb = null, this._timeout = null, this._operationStart = null, this._timer = null, this._options.forever && (this._cachedTimeouts = this._timeouts.slice(0));
  }
  t.exports = n, n.prototype.reset = function() {
    this._attempts = 1, this._timeouts = this._originalTimeouts.slice(0);
  }, n.prototype.stop = function() {
    this._timeout && clearTimeout(this._timeout), this._timer && clearTimeout(this._timer), this._timeouts = [], this._cachedTimeouts = null;
  }, n.prototype.retry = function(o) {
    if (this._timeout && clearTimeout(this._timeout), !o) return !1;
    var r = (/* @__PURE__ */ new Date()).getTime();
    if (o && r - this._operationStart >= this._maxRetryTime)
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
  }, n.prototype.attempt = function(o, r) {
    this._fn = o, r && (r.timeout && (this._operationTimeout = r.timeout), r.cb && (this._operationTimeoutCb = r.cb));
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
    for (var o = {}, r = null, i = 0, a = 0; a < this._errors.length; a++) {
      var u = this._errors[a], c = u.message, d = (o[c] || 0) + 1;
      o[c] = d, d >= i && (r = u, i = d);
    }
    return r;
  };
})), Rg = /* @__PURE__ */ Rr(((e) => {
  var t = Ig();
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
    for (var r in n) o[r] = n[r];
    if (o.minTimeout > o.maxTimeout) throw new Error("minTimeout is greater than maxTimeout");
    for (var i = [], a = 0; a < o.retries; a++) i.push(this.createTimeout(a, o));
    return n && n.forever && !i.length && i.push(this.createTimeout(a, o)), i.sort(function(u, c) {
      return u - c;
    }), i;
  }, e.createTimeout = function(n, o) {
    var r = o.randomize ? Math.random() + 1 : 1, i = Math.round(r * Math.max(o.minTimeout, 1) * Math.pow(o.factor, n));
    return i = Math.min(i, o.maxTimeout), i;
  }, e.wrap = function(n, o, r) {
    if (o instanceof Array && (r = o, o = null), !r) {
      r = [];
      for (var i in n) typeof n[i] == "function" && r.push(i);
    }
    for (var a = 0; a < r.length; a++) {
      var u = r[a], c = n[u];
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
})), bg = /* @__PURE__ */ Rr(((e, t) => {
  t.exports = Rg();
})), Pg = /* @__PURE__ */ Rr(((e, t) => {
  var n = bg(), o = [
    "Failed to fetch",
    "NetworkError when attempting to fetch resource.",
    "The Internet connection appears to be offline.",
    "Network request failed"
  ], r = class extends Error {
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
        if (g instanceof r)
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
  t.exports = u, t.exports.default = u, t.exports.AbortError = r;
})), Xa = /* @__PURE__ */ im(Pg(), 1), Mg = void 0, xg = void 0;
function Ng() {
  return {
    geminiUrl: Mg,
    vertexUrl: xg
  };
}
function kg(e, t, n, o) {
  var r, i;
  if (!e?.baseUrl) {
    const a = Ng();
    return t ? (r = a.vertexUrl) !== null && r !== void 0 ? r : n : (i = a.geminiUrl) !== null && i !== void 0 ? i : o;
  }
  return e.baseUrl;
}
var ot = class {
};
function N(e, t) {
  return e.replace(/\{([^}]+)\}/g, (n, o) => {
    if (Object.prototype.hasOwnProperty.call(t, o)) {
      const r = t[o];
      return r != null ? String(r) : "";
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
  const o = t[t.length - 1], r = e[o];
  if (r !== void 0) {
    if (!n || typeof n == "object" && Object.keys(n).length === 0 || n === r) return;
    if (typeof r == "object" && typeof n == "object" && r !== null && n !== null) Object.assign(r, n);
    else throw new Error(`Cannot set value for an existing key. Key: ${o}`);
  } else o === "_self" && typeof n == "object" && n !== null && !Array.isArray(n) ? Object.assign(e, n) : e[o] = n;
}
function s(e, t, n = void 0) {
  try {
    if (t.length === 1 && t[0] === "_self") return e;
    for (let o = 0; o < t.length; o++) {
      if (typeof e != "object" || e === null) return n;
      const r = t[o];
      if (r.endsWith("[]")) {
        const i = r.slice(0, -2);
        if (i in e) {
          const a = e[i];
          return Array.isArray(a) ? a.map((u) => s(u, t.slice(o + 1), n)) : n;
        } else return n;
      } else e = e[r];
    }
    return e;
  } catch (o) {
    if (o instanceof TypeError) return n;
    throw o;
  }
}
function Dg(e, t) {
  for (const [n, o] of Object.entries(t)) {
    const r = n.split("."), i = o.split("."), a = /* @__PURE__ */ new Set();
    let u = -1;
    for (let c = 0; c < r.length; c++) if (r[c] === "*") {
      u = c;
      break;
    }
    if (u !== -1 && i.length > u) for (let c = u; c < i.length; c++) {
      const d = i[c];
      d !== "*" && !d.endsWith("[]") && !d.endsWith("[0]") && a.add(d);
    }
    Mi(e, r, i, 0, a);
  }
}
function Mi(e, t, n, o, r) {
  if (o >= t.length || typeof e != "object" || e === null) return;
  const i = t[o];
  if (i.endsWith("[]")) {
    const a = i.slice(0, -2), u = e;
    if (a in u && Array.isArray(u[a])) for (const c of u[a]) Mi(c, t, n, o + 1, r);
  } else if (i === "*") {
    if (typeof e == "object" && e !== null && !Array.isArray(e)) {
      const a = e, u = Object.keys(a).filter((d) => !d.startsWith("_") && !r.has(d)), c = {};
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
    i in a && Mi(a[i], t, n, o + 1, r);
  }
}
function Is(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function $g(e) {
  const t = {}, n = s(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const o = s(e, ["resourceName"]);
  return o != null && l(t, ["_url", "resourceName"], o), t;
}
function Lg(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = s(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = s(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response", "generateVideoResponse"]);
  return a != null && l(t, ["response"], Fg(a)), t;
}
function Ug(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = s(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = s(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], Og(a)), t;
}
function Fg(e) {
  const t = {}, n = s(e, ["generatedSamples"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((a) => Gg(a))), l(t, ["generatedVideos"], i);
  }
  const o = s(e, ["raiMediaFilteredCount"]);
  o != null && l(t, ["raiMediaFilteredCount"], o);
  const r = s(e, ["raiMediaFilteredReasons"]);
  return r != null && l(t, ["raiMediaFilteredReasons"], r), t;
}
function Og(e) {
  const t = {}, n = s(e, ["videos"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((a) => Bg(a))), l(t, ["generatedVideos"], i);
  }
  const o = s(e, ["raiMediaFilteredCount"]);
  o != null && l(t, ["raiMediaFilteredCount"], o);
  const r = s(e, ["raiMediaFilteredReasons"]);
  return r != null && l(t, ["raiMediaFilteredReasons"], r), t;
}
function Gg(e) {
  const t = {}, n = s(e, ["video"]);
  return n != null && l(t, ["video"], Wg(n)), t;
}
function Bg(e) {
  const t = {}, n = s(e, ["_self"]);
  return n != null && l(t, ["video"], zg(n)), t;
}
function qg(e) {
  const t = {}, n = s(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function Hg(e) {
  const t = {}, n = s(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function Vg(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = s(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = s(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], Jg(a)), t;
}
function Jg(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const r = s(e, ["documentName"]);
  return r != null && l(t, ["documentName"], r), t;
}
function xd(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = s(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = s(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], Kg(a)), t;
}
function Kg(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const r = s(e, ["documentName"]);
  return r != null && l(t, ["documentName"], r), t;
}
function Wg(e) {
  const t = {}, n = s(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const o = s(e, ["encodedVideo"]);
  o != null && l(t, ["videoBytes"], Is(o));
  const r = s(e, ["encoding"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function zg(e) {
  const t = {}, n = s(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const o = s(e, ["bytesBase64Encoded"]);
  o != null && l(t, ["videoBytes"], Is(o));
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
var Qa;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(Qa || (Qa = {}));
var Za;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(Za || (Za = {}));
var ja;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(ja || (ja = {}));
var ht;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(ht || (ht = {}));
var el;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(el || (el = {}));
var tl;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})(tl || (tl = {}));
var nl;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})(nl || (nl = {}));
var ol;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(ol || (ol = {}));
var rl;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(rl || (rl = {}));
var il;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})(il || (il = {}));
var sl;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})(sl || (sl = {}));
var Jt;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(Jt || (Jt = {}));
var Kt;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Kt || (Kt = {}));
var al;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(al || (al = {}));
var ll;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})(ll || (ll = {}));
var ul;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(ul || (ul = {}));
var cl;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(cl || (cl = {}));
var dl;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(dl || (dl = {}));
var fl;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})(fl || (fl = {}));
var hl;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(hl || (hl = {}));
var pl;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(pl || (pl = {}));
var ml;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(ml || (ml = {}));
var gl;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(gl || (gl = {}));
var _l;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(_l || (_l = {}));
var cr;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(cr || (cr = {}));
var yl;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(yl || (yl = {}));
var vl;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(vl || (vl = {}));
var Al;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(Al || (Al = {}));
var Tl;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(Tl || (Tl = {}));
var xi;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(xi || (xi = {}));
var Sl;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})(Sl || (Sl = {}));
var El;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})(El || (El = {}));
var wl;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(wl || (wl = {}));
var Cl;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(Cl || (Cl = {}));
var Il;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(Il || (Il = {}));
var Rl;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})(Rl || (Rl = {}));
var bl;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})(bl || (bl = {}));
var Ni;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(Ni || (Ni = {}));
var Pl;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})(Pl || (Pl = {}));
var Ml;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(Ml || (Ml = {}));
var dr;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(dr || (dr = {}));
var xl;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(xl || (xl = {}));
var Nl;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(Nl || (Nl = {}));
var kl;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(kl || (kl = {}));
var Dl;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(Dl || (Dl = {}));
var $l;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})($l || ($l = {}));
var Ll;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(Ll || (Ll = {}));
var Ul;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(Ul || (Ul = {}));
var Fl;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(Fl || (Fl = {}));
var Ol;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})(Ol || (Ol = {}));
var Gl;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(Gl || (Gl = {}));
var Bl;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})(Bl || (Bl = {}));
var ql;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(ql || (ql = {}));
var Hl;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(Hl || (Hl = {}));
var Vl;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(Vl || (Vl = {}));
var Jl;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(Jl || (Jl = {}));
var Kl;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(Kl || (Kl = {}));
var Wl;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(Wl || (Wl = {}));
var zl;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(zl || (zl = {}));
var Yl;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(Yl || (Yl = {}));
var Xl;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(Xl || (Xl = {}));
var Ql;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(Ql || (Ql = {}));
var Zl;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(Zl || (Zl = {}));
var jl;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(jl || (jl = {}));
var Wt;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(Wt || (Wt = {}));
var ki = class {
  constructor(e) {
    const t = {};
    for (const n of e.headers.entries()) t[n[0]] = n[1];
    this.headers = t, this.responseInternal = e;
  }
  json() {
    return this.responseInternal.json();
  }
}, Rn = class {
  get text() {
    var e, t, n, o, r, i, a, u;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning text from the first one.");
    let c = "", d = !1;
    const h = [];
    for (const f of (u = (a = (i = (r = this.candidates) === null || r === void 0 ? void 0 : r[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) !== null && u !== void 0 ? u : []) {
      for (const [p, m] of Object.entries(f)) p !== "text" && p !== "thought" && p !== "thoughtSignature" && (m !== null || m !== void 0) && h.push(p);
      if (typeof f.text == "string") {
        if (typeof f.thought == "boolean" && f.thought) continue;
        d = !0, c += f.text;
      }
    }
    return h.length > 0 && console.warn(`there are non-text parts ${h} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), d ? c : void 0;
  }
  get data() {
    var e, t, n, o, r, i, a, u;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning data from the first one.");
    let c = "";
    const d = [];
    for (const h of (u = (a = (i = (r = this.candidates) === null || r === void 0 ? void 0 : r[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) !== null && u !== void 0 ? u : []) {
      for (const [f, p] of Object.entries(h)) f !== "inlineData" && (p !== null || p !== void 0) && d.push(f);
      h.inlineData && typeof h.inlineData.data == "string" && (c += atob(h.inlineData.data));
    }
    return d.length > 0 && console.warn(`there are non-data parts ${d} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), c.length > 0 ? btoa(c) : void 0;
  }
  get functionCalls() {
    var e, t, n, o, r, i, a, u;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning function calls from the first one.");
    const c = (u = (a = (i = (r = this.candidates) === null || r === void 0 ? void 0 : r[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) === null || u === void 0 ? void 0 : u.filter((d) => d.functionCall).map((d) => d.functionCall).filter((d) => d !== void 0);
    if (c?.length !== 0)
      return c;
  }
  get executableCode() {
    var e, t, n, o, r, i, a, u, c;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning executable code from the first one.");
    const d = (u = (a = (i = (r = this.candidates) === null || r === void 0 ? void 0 : r[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) === null || u === void 0 ? void 0 : u.filter((h) => h.executableCode).map((h) => h.executableCode).filter((h) => h !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.code;
  }
  get codeExecutionResult() {
    var e, t, n, o, r, i, a, u, c;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning code execution result from the first one.");
    const d = (u = (a = (i = (r = this.candidates) === null || r === void 0 ? void 0 : r[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) === null || u === void 0 ? void 0 : u.filter((h) => h.codeExecutionResult).map((h) => h.codeExecutionResult).filter((h) => h !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.output;
  }
}, eu = class {
}, tu = class {
}, Yg = class {
}, Xg = class {
}, Qg = class {
}, Zg = class {
}, nu = class {
}, ou = class {
}, ru = class {
}, jg = class {
}, iu = class Nd {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new Nd();
    let r;
    const i = t;
    return n ? r = Ug(i) : r = Lg(i), Object.assign(o, r), o;
  }
}, su = class {
}, au = class {
}, lu = class {
}, uu = class {
}, e_ = class {
}, t_ = class {
}, n_ = class {
}, o_ = class kd {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new kd(), r = Vg(t);
    return Object.assign(o, r), o;
  }
}, r_ = class {
}, i_ = class {
}, s_ = class {
}, a_ = class {
}, cu = class {
}, l_ = class {
  get text() {
    var e, t, n;
    let o = "", r = !1;
    const i = [];
    for (const a of (n = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && n !== void 0 ? n : []) {
      for (const [u, c] of Object.entries(a)) u !== "text" && u !== "thought" && c !== null && i.push(u);
      if (typeof a.text == "string") {
        if (typeof a.thought == "boolean" && a.thought) continue;
        r = !0, o += a.text;
      }
    }
    return i.length > 0 && console.warn(`there are non-text parts ${i} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), r ? o : void 0;
  }
  get data() {
    var e, t, n;
    let o = "";
    const r = [];
    for (const i of (n = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && n !== void 0 ? n : []) {
      for (const [a, u] of Object.entries(i)) a !== "inlineData" && u !== null && r.push(a);
      i.inlineData && typeof i.inlineData.data == "string" && (o += atob(i.inlineData.data));
    }
    return r.length > 0 && console.warn(`there are non-data parts ${r} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), o.length > 0 ? btoa(o) : void 0;
  }
}, u_ = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, c_ = class Dd {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new Dd(), r = xd(t);
    return Object.assign(o, r), o;
  }
};
function V(e, t) {
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
  const n = V(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function Ld(e) {
  return Array.isArray(e) ? e.map((t) => fr(t)) : [fr(e)];
}
function fr(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function Ud(e) {
  const t = fr(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function Fd(e) {
  const t = fr(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function du(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function Od(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => du(t)) : [du(e)];
}
function Di(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function fu(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function hu(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function re(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return Di(e) ? e : {
    role: "user",
    parts: Od(e)
  };
}
function Rs(e, t) {
  if (!t) return [];
  if (e.isVertexAI() && Array.isArray(t)) return t.flatMap((n) => {
    const o = re(n);
    return o.parts && o.parts.length > 0 && o.parts[0].text !== void 0 ? [o.parts[0].text] : [];
  });
  if (e.isVertexAI()) {
    const n = re(t);
    return n.parts && n.parts.length > 0 && n.parts[0].text !== void 0 ? [n.parts[0].text] : [];
  }
  return Array.isArray(t) ? t.map((n) => re(n)) : [re(t)];
}
function _e(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("contents are required");
  if (!Array.isArray(e)) {
    if (fu(e) || hu(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [re(e)];
  }
  const t = [], n = [], o = Di(e[0]);
  for (const r of e) {
    const i = Di(r);
    if (i != o) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (i) t.push(r);
    else {
      if (fu(r) || hu(r)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(r);
    }
  }
  return o || t.push({
    role: "user",
    parts: Od(n)
  }), t;
}
function d_(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((o) => o !== "null");
  if (n.length === 1) t.type = Object.values(ht).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : ht.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const o of n) t.anyOf.push({ type: Object.values(ht).includes(o.toUpperCase()) ? o.toUpperCase() : ht.TYPE_UNSPECIFIED });
  }
}
function jt(e) {
  const t = {}, n = ["items"], o = ["anyOf"], r = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const i = e.anyOf;
  i != null && i.length == 2 && (i[0].type === "null" ? (t.nullable = !0, e = i[1]) : i[1].type === "null" && (t.nullable = !0, e = i[0])), e.type instanceof Array && d_(e.type, t);
  for (const [a, u] of Object.entries(e))
    if (u != null)
      if (a == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(ht).includes(u.toUpperCase()) ? u.toUpperCase() : ht.TYPE_UNSPECIFIED;
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
      } else if (r.includes(a)) {
        const c = {};
        for (const [d, h] of Object.entries(u)) c[d] = jt(h);
        t[a] = c;
      } else {
        if (a === "additionalProperties") continue;
        t[a] = u;
      }
  return t;
}
function bs(e) {
  return jt(e);
}
function Ps(e) {
  if (typeof e == "object") return e;
  if (typeof e == "string") return { voiceConfig: { prebuiltVoiceConfig: { voiceName: e } } };
  throw new Error(`Unsupported speechConfig type: ${typeof e}`);
}
function Ms(e) {
  if ("multiSpeakerVoiceConfig" in e) throw new Error("multiSpeakerVoiceConfig is not supported in the live API.");
  return e;
}
function rn(e) {
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
  const r = !t.startsWith(`${n}/`) && t.split("/").length === o;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : r ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : r ? `${n}/${t}` : t;
}
function rt(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return f_(e, t, "cachedContents");
}
function Gd(e) {
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
function _t(e) {
  return Is(e);
}
function h_(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function p_(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function m_(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function Bd(e) {
  var t;
  let n;
  if (h_(e) && (n = e.name), !(m_(e) && (n = e.uri, n === void 0)) && !(p_(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const o = n.split("files/")[1].match(/[a-z0-9]+/);
      if (o === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = o[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function qd(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function Hd(e) {
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
function __(e, t = {}) {
  const n = e, o = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (o.responseJsonSchema = n.outputSchema), t.behavior && (o.behavior = t.behavior), { functionDeclarations: [o] };
}
function y_(e, t = {}) {
  const n = [], o = /* @__PURE__ */ new Set();
  for (const r of e) {
    const i = r.name;
    if (o.has(i)) throw new Error(`Duplicate function name ${i} found in MCP tools. Please ensure function names are unique.`);
    o.add(i);
    const a = __(r, t);
    a.functionDeclarations && n.push(...a.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function Vd(e, t) {
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
  const o = [n.gcsUri, n.bigqueryUri].filter(Boolean).length, r = [n.inlinedRequests, n.fileName].filter(Boolean).length;
  if (e.isVertexAI()) {
    if (r > 0 || o !== 1) throw new Error("Exactly one of `gcsUri` or `bigqueryUri` must be set for Vertex AI.");
  } else if (o > 0 || r !== 1) throw new Error("Exactly one of `inlinedRequests`, `fileName`, must be set for Gemini API.");
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
function Jd(e) {
  if (typeof e != "object" || e === null) return {};
  const t = e, n = t.inlinedResponses;
  if (typeof n != "object" || n === null) return e;
  const o = n.inlinedResponses;
  if (!Array.isArray(o) || o.length === 0) return e;
  let r = !1;
  for (const i of o) {
    if (typeof i != "object" || i === null) continue;
    const a = i.response;
    if (!(typeof a != "object" || a === null) && a.embedding !== void 0) {
      r = !0;
      break;
    }
  }
  return r && (t.inlinedEmbedContentResponses = t.inlinedResponses, delete t.inlinedResponses), e;
}
function an(e, t) {
  const n = t;
  if (!e.isVertexAI()) {
    if (/batches\/[^/]+$/.test(n)) return n.split("/").pop();
    throw new Error(`Invalid batch job name: ${n}.`);
  }
  if (/^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/.test(n)) return n.split("/").pop();
  if (/^\d+$/.test(n)) return n;
  throw new Error(`Invalid batch job name: ${n}.`);
}
function Kd(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function A_(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function T_(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function S_(e) {
  const t = {}, n = s(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const o = s(e, ["inlinedResponses", "inlinedResponses"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => ny(a))), l(t, ["inlinedResponses"], i);
  }
  const r = s(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["inlinedEmbedContentResponses"], i);
  }
  return t;
}
function E_(e) {
  const t = {}, n = s(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const o = s(e, ["gcsDestination", "outputUriPrefix"]);
  o != null && l(t, ["gcsUri"], o);
  const r = s(e, ["bigqueryDestination", "outputUri"]);
  return r != null && l(t, ["bigqueryUri"], r), t;
}
function w_(e) {
  const t = {}, n = s(e, ["format"]);
  n != null && l(t, ["predictionsFormat"], n);
  const o = s(e, ["gcsUri"]);
  o != null && l(t, ["gcsDestination", "outputUriPrefix"], o);
  const r = s(e, ["bigqueryUri"]);
  if (r != null && l(t, ["bigqueryDestination", "outputUri"], r), s(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (s(e, ["inlinedResponses"]) !== void 0) throw new Error("inlinedResponses parameter is not supported in Vertex AI.");
  if (s(e, ["inlinedEmbedContentResponses"]) !== void 0) throw new Error("inlinedEmbedContentResponses parameter is not supported in Vertex AI.");
  return t;
}
function Qo(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = s(e, ["metadata", "displayName"]);
  o != null && l(t, ["displayName"], o);
  const r = s(e, ["metadata", "state"]);
  r != null && l(t, ["state"], Kd(r));
  const i = s(e, ["metadata", "createTime"]);
  i != null && l(t, ["createTime"], i);
  const a = s(e, ["metadata", "endTime"]);
  a != null && l(t, ["endTime"], a);
  const u = s(e, ["metadata", "updateTime"]);
  u != null && l(t, ["updateTime"], u);
  const c = s(e, ["metadata", "model"]);
  c != null && l(t, ["model"], c);
  const d = s(e, ["metadata", "output"]);
  return d != null && l(t, ["dest"], S_(Jd(d))), t;
}
function $i(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = s(e, ["displayName"]);
  o != null && l(t, ["displayName"], o);
  const r = s(e, ["state"]);
  r != null && l(t, ["state"], Kd(r));
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["createTime"]);
  a != null && l(t, ["createTime"], a);
  const u = s(e, ["startTime"]);
  u != null && l(t, ["startTime"], u);
  const c = s(e, ["endTime"]);
  c != null && l(t, ["endTime"], c);
  const d = s(e, ["updateTime"]);
  d != null && l(t, ["updateTime"], d);
  const h = s(e, ["model"]);
  h != null && l(t, ["model"], h);
  const f = s(e, ["inputConfig"]);
  f != null && l(t, ["src"], C_(f));
  const p = s(e, ["outputConfig"]);
  p != null && l(t, ["dest"], E_(Jd(p)));
  const m = s(e, ["completionStats"]);
  return m != null && l(t, ["completionStats"], m), t;
}
function C_(e) {
  const t = {}, n = s(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const o = s(e, ["gcsSource", "uris"]);
  o != null && l(t, ["gcsUri"], o);
  const r = s(e, ["bigquerySource", "inputUri"]);
  return r != null && l(t, ["bigqueryUri"], r), t;
}
function I_(e, t) {
  const n = {};
  if (s(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (s(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (s(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const o = s(t, ["fileName"]);
  o != null && l(n, ["fileName"], o);
  const r = s(t, ["inlinedRequests"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => ty(e, a))), l(n, ["requests", "requests"], i);
  }
  return n;
}
function R_(e) {
  const t = {}, n = s(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const o = s(e, ["gcsUri"]);
  o != null && l(t, ["gcsSource", "uris"], o);
  const r = s(e, ["bigqueryUri"]);
  if (r != null && l(t, ["bigquerySource", "inputUri"], r), s(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (s(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function b_(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function P_(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], an(e, o)), n;
}
function M_(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], an(e, o)), n;
}
function x_(e) {
  const t = {}, n = s(e, ["content"]);
  n != null && l(t, ["content"], n);
  const o = s(e, ["citationMetadata"]);
  o != null && l(t, ["citationMetadata"], N_(o));
  const r = s(e, ["tokenCount"]);
  r != null && l(t, ["tokenCount"], r);
  const i = s(e, ["finishReason"]);
  i != null && l(t, ["finishReason"], i);
  const a = s(e, ["groundingMetadata"]);
  a != null && l(t, ["groundingMetadata"], a);
  const u = s(e, ["avgLogprobs"]);
  u != null && l(t, ["avgLogprobs"], u);
  const c = s(e, ["index"]);
  c != null && l(t, ["index"], c);
  const d = s(e, ["logprobsResult"]);
  d != null && l(t, ["logprobsResult"], d);
  const h = s(e, ["safetyRatings"]);
  if (h != null) {
    let p = h;
    Array.isArray(p) && (p = p.map((m) => m)), l(t, ["safetyRatings"], p);
  }
  const f = s(e, ["urlContextMetadata"]);
  return f != null && l(t, ["urlContextMetadata"], f), t;
}
function N_(e) {
  const t = {}, n = s(e, ["citationSources"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((r) => r)), l(t, ["citations"], o);
  }
  return t;
}
function Wd(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => uy(i))), l(t, ["parts"], r);
  }
  const o = s(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function k_(e, t) {
  const n = {}, o = s(e, ["displayName"]);
  if (t !== void 0 && o != null && l(t, ["batch", "displayName"], o), s(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const r = s(e, ["webhookConfig"]);
  return t !== void 0 && r != null && l(t, ["batch", "webhookConfig"], r), n;
}
function D_(e, t) {
  const n = {}, o = s(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const r = s(e, ["dest"]);
  if (t !== void 0 && r != null && l(t, ["outputConfig"], w_(v_(r))), s(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function pu(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["_url", "model"], V(e, o));
  const r = s(t, ["src"]);
  r != null && l(n, ["batch", "inputConfig"], I_(e, Vd(e, r)));
  const i = s(t, ["config"]);
  return i != null && k_(i, n), n;
}
function $_(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["model"], V(e, o));
  const r = s(t, ["src"]);
  r != null && l(n, ["inputConfig"], R_(Vd(e, r)));
  const i = s(t, ["config"]);
  return i != null && D_(i, n), n;
}
function L_(e, t) {
  const n = {}, o = s(e, ["displayName"]);
  return t !== void 0 && o != null && l(t, ["batch", "displayName"], o), n;
}
function U_(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["_url", "model"], V(e, o));
  const r = s(t, ["src"]);
  r != null && l(n, ["batch", "inputConfig"], V_(e, r));
  const i = s(t, ["config"]);
  return i != null && L_(i, n), n;
}
function F_(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], an(e, o)), n;
}
function O_(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], an(e, o)), n;
}
function G_(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["name"]);
  o != null && l(t, ["name"], o);
  const r = s(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = s(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function B_(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["name"]);
  o != null && l(t, ["name"], o);
  const r = s(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = s(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function q_(e, t) {
  const n = {}, o = s(t, ["contents"]);
  if (o != null) {
    let i = Rs(e, o);
    Array.isArray(i) && (i = i.map((a) => a)), l(n, [
      "requests[]",
      "request",
      "content"
    ], i);
  }
  const r = s(t, ["config"]);
  return r != null && (l(n, ["_self"], H_(r, n)), Dg(n, { "requests[].*": "requests[].request.*" })), n;
}
function H_(e, t) {
  const n = {}, o = s(e, ["taskType"]);
  t !== void 0 && o != null && l(t, ["requests[]", "taskType"], o);
  const r = s(e, ["title"]);
  t !== void 0 && r != null && l(t, ["requests[]", "title"], r);
  const i = s(e, ["outputDimensionality"]);
  if (t !== void 0 && i != null && l(t, ["requests[]", "outputDimensionality"], i), s(e, ["mimeType"]) !== void 0) throw new Error("mimeType parameter is not supported in Gemini API.");
  if (s(e, ["autoTruncate"]) !== void 0) throw new Error("autoTruncate parameter is not supported in Gemini API.");
  if (s(e, ["documentOcr"]) !== void 0) throw new Error("documentOcr parameter is not supported in Gemini API.");
  if (s(e, ["audioTrackExtraction"]) !== void 0) throw new Error("audioTrackExtraction parameter is not supported in Gemini API.");
  return n;
}
function V_(e, t) {
  const n = {}, o = s(t, ["fileName"]);
  o != null && l(n, ["file_name"], o);
  const r = s(t, ["inlinedRequests"]);
  return r != null && l(n, ["requests"], q_(e, r)), n;
}
function J_(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function K_(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = s(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = s(e, ["name"]);
  if (r != null && l(t, ["name"], r), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function W_(e) {
  const t = {}, n = s(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const o = s(e, ["mode"]);
  if (o != null && l(t, ["mode"], o), s(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function z_(e, t, n) {
  const o = {}, r = s(t, ["systemInstruction"]);
  n !== void 0 && r != null && l(n, ["systemInstruction"], Wd(re(r)));
  const i = s(t, ["temperature"]);
  i != null && l(o, ["temperature"], i);
  const a = s(t, ["topP"]);
  a != null && l(o, ["topP"], a);
  const u = s(t, ["topK"]);
  u != null && l(o, ["topK"], u);
  const c = s(t, ["candidateCount"]);
  c != null && l(o, ["candidateCount"], c);
  const d = s(t, ["maxOutputTokens"]);
  d != null && l(o, ["maxOutputTokens"], d);
  const h = s(t, ["stopSequences"]);
  h != null && l(o, ["stopSequences"], h);
  const f = s(t, ["responseLogprobs"]);
  f != null && l(o, ["responseLogprobs"], f);
  const p = s(t, ["logprobs"]);
  p != null && l(o, ["logprobs"], p);
  const m = s(t, ["presencePenalty"]);
  m != null && l(o, ["presencePenalty"], m);
  const g = s(t, ["frequencyPenalty"]);
  g != null && l(o, ["frequencyPenalty"], g);
  const _ = s(t, ["seed"]);
  _ != null && l(o, ["seed"], _);
  const y = s(t, ["responseMimeType"]);
  y != null && l(o, ["responseMimeType"], y);
  const E = s(t, ["responseSchema"]);
  E != null && l(o, ["responseSchema"], bs(E));
  const w = s(t, ["responseJsonSchema"]);
  if (w != null && l(o, ["responseJsonSchema"], w), s(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (s(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const C = s(t, ["safetySettings"]);
  if (n !== void 0 && C != null) {
    let J = C;
    Array.isArray(J) && (J = J.map((W) => cy(W))), l(n, ["safetySettings"], J);
  }
  const P = s(t, ["tools"]);
  if (n !== void 0 && P != null) {
    let J = sn(P);
    Array.isArray(J) && (J = J.map((W) => fy(rn(W)))), l(n, ["tools"], J);
  }
  const M = s(t, ["toolConfig"]);
  if (n !== void 0 && M != null && l(n, ["toolConfig"], dy(M)), s(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const A = s(t, ["cachedContent"]);
  n !== void 0 && A != null && l(n, ["cachedContent"], rt(e, A));
  const $ = s(t, ["responseModalities"]);
  $ != null && l(o, ["responseModalities"], $);
  const I = s(t, ["mediaResolution"]);
  I != null && l(o, ["mediaResolution"], I);
  const x = s(t, ["speechConfig"]);
  if (x != null && l(o, ["speechConfig"], Ps(x)), s(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const F = s(t, ["thinkingConfig"]);
  F != null && l(o, ["thinkingConfig"], F);
  const H = s(t, ["imageConfig"]);
  H != null && l(o, ["imageConfig"], ey(H));
  const ue = s(t, ["enableEnhancedCivicAnswers"]);
  if (ue != null && l(o, ["enableEnhancedCivicAnswers"], ue), s(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const ie = s(t, ["serviceTier"]);
  return n !== void 0 && ie != null && l(n, ["serviceTier"], ie), o;
}
function Y_(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["candidates"]);
  if (o != null) {
    let d = o;
    Array.isArray(d) && (d = d.map((h) => x_(h))), l(t, ["candidates"], d);
  }
  const r = s(e, ["modelVersion"]);
  r != null && l(t, ["modelVersion"], r);
  const i = s(e, ["promptFeedback"]);
  i != null && l(t, ["promptFeedback"], i);
  const a = s(e, ["responseId"]);
  a != null && l(t, ["responseId"], a);
  const u = s(e, ["usageMetadata"]);
  u != null && l(t, ["usageMetadata"], u);
  const c = s(e, ["modelStatus"]);
  return c != null && l(t, ["modelStatus"], c), t;
}
function X_(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], an(e, o)), n;
}
function Q_(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], an(e, o)), n;
}
function Z_(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], T_(n));
  const o = s(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function j_(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = s(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function ey(e) {
  const t = {}, n = s(e, ["aspectRatio"]);
  n != null && l(t, ["aspectRatio"], n);
  const o = s(e, ["imageSize"]);
  if (o != null && l(t, ["imageSize"], o), s(e, ["personGeneration"]) !== void 0) throw new Error("personGeneration parameter is not supported in Gemini API.");
  if (s(e, ["prominentPeople"]) !== void 0) throw new Error("prominentPeople parameter is not supported in Gemini API.");
  if (s(e, ["outputMimeType"]) !== void 0) throw new Error("outputMimeType parameter is not supported in Gemini API.");
  if (s(e, ["outputCompressionQuality"]) !== void 0) throw new Error("outputCompressionQuality parameter is not supported in Gemini API.");
  if (s(e, ["imageOutputOptions"]) !== void 0) throw new Error("imageOutputOptions parameter is not supported in Gemini API.");
  return t;
}
function ty(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["request", "model"], V(e, o));
  const r = s(t, ["contents"]);
  if (r != null) {
    let u = _e(r);
    Array.isArray(u) && (u = u.map((c) => Wd(c))), l(n, ["request", "contents"], u);
  }
  const i = s(t, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const a = s(t, ["config"]);
  return a != null && l(n, ["request", "generationConfig"], z_(e, a, s(n, ["request"], {}))), n;
}
function ny(e) {
  const t = {}, n = s(e, ["response"]);
  n != null && l(t, ["response"], Y_(n));
  const o = s(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = s(e, ["error"]);
  return r != null && l(t, ["error"], r), t;
}
function oy(e, t) {
  const n = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = s(e, ["pageToken"]);
  if (t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), s(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function ry(e, t) {
  const n = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = s(e, ["pageToken"]);
  t !== void 0 && r != null && l(t, ["_query", "pageToken"], r);
  const i = s(e, ["filter"]);
  return t !== void 0 && i != null && l(t, ["_query", "filter"], i), n;
}
function iy(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && oy(n, t), t;
}
function sy(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && ry(n, t), t;
}
function ay(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = s(e, ["operations"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => Qo(a))), l(t, ["batchJobs"], i);
  }
  return t;
}
function ly(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = s(e, ["batchPredictionJobs"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => $i(a))), l(t, ["batchJobs"], i);
  }
  return t;
}
function uy(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = s(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = s(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], J_(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], K_(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], b_(c));
  const d = s(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = s(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = s(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = s(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = s(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = s(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = s(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function cy(e) {
  const t = {}, n = s(e, ["category"]);
  if (n != null && l(t, ["category"], n), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = s(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function dy(e) {
  const t = {}, n = s(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = s(e, ["functionCallingConfig"]);
  o != null && l(t, ["functionCallingConfig"], W_(o));
  const r = s(e, ["includeServerSideToolInvocations"]);
  return r != null && l(t, ["includeServerSideToolInvocations"], r), t;
}
function fy(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = s(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = s(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], j_(r));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], Z_(i));
  const a = s(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), s(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = s(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const c = s(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), s(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = s(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = s(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
var nt;
(function(e) {
  e.PAGED_ITEM_BATCH_JOBS = "batchJobs", e.PAGED_ITEM_MODELS = "models", e.PAGED_ITEM_TUNING_JOBS = "tuningJobs", e.PAGED_ITEM_FILES = "files", e.PAGED_ITEM_CACHED_CONTENTS = "cachedContents", e.PAGED_ITEM_FILE_SEARCH_STORES = "fileSearchStores", e.PAGED_ITEM_DOCUMENTS = "documents";
})(nt || (nt = {}));
var Dt = class {
  constructor(e, t, n, o) {
    this.pageInternal = [], this.paramsInternal = {}, this.requestInternal = t, this.init(e, n, o);
  }
  init(e, t, n) {
    var o, r;
    this.nameInternal = e, this.pageInternal = t[this.nameInternal] || [], this.sdkHttpResponseInternal = t?.sdkHttpResponse, this.idxInternal = 0;
    let i = { config: {} };
    !n || Object.keys(n).length === 0 ? i = { config: {} } : typeof n == "object" ? i = Object.assign({}, n) : i = n, i.config && (i.config.pageToken = t.nextPageToken), this.paramsInternal = i, this.pageInternalSize = (r = (o = i.config) === null || o === void 0 ? void 0 : o.pageSize) !== null && r !== void 0 ? r : this.pageInternal.length;
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
}, hy = class extends ot {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Dt(nt.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = pu(this.apiClient, e), n = t._url, o = N("{model}:batchGenerateContent", n), r = t.batch.inputConfig.requests, i = r.requests, a = [];
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
    return r.requests = a, delete t.config, delete t._url, delete t._query, {
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
      const r = this.getGcsUri(e), i = this.getBigqueryUri(e);
      if (r) r.endsWith(".jsonl") ? n.dest = `${r.slice(0, -6)}/dest` : n.dest = `${r}_dest_${o}`;
      else if (i) n.dest = `${i}_dest_${o}`;
      else throw new Error("Unsupported source for Vertex AI: No GCS or BigQuery URI found.");
    }
    return n;
  }
  async createInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = $_(this.apiClient, e);
      return a = N("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => $i(d));
    } else {
      const c = pu(this.apiClient, e);
      return a = N("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => Qo(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = U_(this.apiClient, e);
      return r = N("{model}:asyncBatchEmbedContent", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => Qo(u));
    }
  }
  async get(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Q_(this.apiClient, e);
      return a = N("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => $i(d));
    } else {
      const c = X_(this.apiClient, e);
      return a = N("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => Qo(d));
    }
  }
  async cancel(e) {
    var t, n, o, r;
    let i = "", a = {};
    if (this.apiClient.isVertexAI()) {
      const u = M_(this.apiClient, e);
      i = N("batchPredictionJobs/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: i,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = P_(this.apiClient, e);
      i = N("batches/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: i,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = sy(e);
      return a = N("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = ly(d), f = new cu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = iy(e);
      return a = N("batches", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = ay(d), f = new cu();
        return Object.assign(f, h), f;
      });
    }
  }
  async delete(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = O_(this.apiClient, e);
      return a = N("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => B_(d));
    } else {
      const c = F_(this.apiClient, e);
      return a = N("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => G_(d));
    }
  }
};
function py(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function my(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function mu(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => Fy(i))), l(t, ["parts"], r);
  }
  const o = s(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function gu(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => Oy(i))), l(t, ["parts"], r);
  }
  const o = s(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function gy(e, t) {
  const n = {}, o = s(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = s(e, ["expireTime"]);
  t !== void 0 && r != null && l(t, ["expireTime"], r);
  const i = s(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const a = s(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let h = _e(a);
    Array.isArray(h) && (h = h.map((f) => mu(f))), l(t, ["contents"], h);
  }
  const u = s(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], mu(re(u)));
  const c = s(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((f) => qy(f))), l(t, ["tools"], h);
  }
  const d = s(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], Gy(d)), s(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function _y(e, t) {
  const n = {}, o = s(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = s(e, ["expireTime"]);
  t !== void 0 && r != null && l(t, ["expireTime"], r);
  const i = s(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const a = s(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let f = _e(a);
    Array.isArray(f) && (f = f.map((p) => gu(p))), l(t, ["contents"], f);
  }
  const u = s(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], gu(re(u)));
  const c = s(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((p) => Hy(p))), l(t, ["tools"], f);
  }
  const d = s(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], By(d));
  const h = s(e, ["kmsKeyName"]);
  return t !== void 0 && h != null && l(t, ["encryption_spec", "kmsKeyName"], h), n;
}
function yy(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["model"], $d(e, o));
  const r = s(t, ["config"]);
  return r != null && gy(r, n), n;
}
function vy(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["model"], $d(e, o));
  const r = s(t, ["config"]);
  return r != null && _y(r, n), n;
}
function Ay(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], rt(e, o)), n;
}
function Ty(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], rt(e, o)), n;
}
function Sy(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Ey(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function wy(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Cy(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = s(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = s(e, ["name"]);
  if (r != null && l(t, ["name"], r), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Iy(e) {
  const t = {}, n = s(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const o = s(e, ["mode"]);
  if (o != null && l(t, ["mode"], o), s(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function Ry(e) {
  const t = {}, n = s(e, ["description"]);
  n != null && l(t, ["description"], n);
  const o = s(e, ["name"]);
  o != null && l(t, ["name"], o);
  const r = s(e, ["parameters"]);
  r != null && l(t, ["parameters"], r);
  const i = s(e, ["parametersJsonSchema"]);
  i != null && l(t, ["parametersJsonSchema"], i);
  const a = s(e, ["response"]);
  a != null && l(t, ["response"], a);
  const u = s(e, ["responseJsonSchema"]);
  if (u != null && l(t, ["responseJsonSchema"], u), s(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return t;
}
function by(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], rt(e, o)), n;
}
function Py(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], rt(e, o)), n;
}
function My(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], py(n));
  const o = s(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function xy(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = s(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function Ny(e, t) {
  const n = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = s(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function ky(e, t) {
  const n = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = s(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function Dy(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && Ny(n, t), t;
}
function $y(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && ky(n, t), t;
}
function Ly(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = s(e, ["cachedContents"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["cachedContents"], i);
  }
  return t;
}
function Uy(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = s(e, ["cachedContents"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["cachedContents"], i);
  }
  return t;
}
function Fy(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = s(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = s(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], wy(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], Cy(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], my(c));
  const d = s(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = s(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = s(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = s(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = s(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = s(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = s(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function Oy(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = s(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = s(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], i);
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], a);
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], c);
  const d = s(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = s(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = s(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = s(e, ["videoMetadata"]);
  if (p != null && l(t, ["videoMetadata"], p), s(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (s(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (s(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return t;
}
function Gy(e) {
  const t = {}, n = s(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = s(e, ["functionCallingConfig"]);
  o != null && l(t, ["functionCallingConfig"], Iy(o));
  const r = s(e, ["includeServerSideToolInvocations"]);
  return r != null && l(t, ["includeServerSideToolInvocations"], r), t;
}
function By(e) {
  const t = {}, n = s(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = s(e, ["functionCallingConfig"]);
  if (o != null && l(t, ["functionCallingConfig"], o), s(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function qy(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = s(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = s(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], xy(r));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], My(i));
  const a = s(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), s(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = s(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const c = s(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), s(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = s(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = s(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
function Hy(e) {
  const t = {}, n = s(e, ["retrieval"]);
  n != null && l(t, ["retrieval"], n);
  const o = s(e, ["computerUse"]);
  if (o != null && l(t, ["computerUse"], o), s(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const r = s(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], r);
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], i);
  const a = s(e, ["codeExecution"]);
  a != null && l(t, ["codeExecution"], a);
  const u = s(e, ["enterpriseWebSearch"]);
  u != null && l(t, ["enterpriseWebSearch"], u);
  const c = s(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => Ry(m))), l(t, ["functionDeclarations"], p);
  }
  const d = s(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = s(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = s(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), s(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function Vy(e, t) {
  const n = {}, o = s(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = s(e, ["expireTime"]);
  return t !== void 0 && r != null && l(t, ["expireTime"], r), n;
}
function Jy(e, t) {
  const n = {}, o = s(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = s(e, ["expireTime"]);
  return t !== void 0 && r != null && l(t, ["expireTime"], r), n;
}
function Ky(e, t) {
  const n = {}, o = s(t, ["name"]);
  o != null && l(n, ["_url", "name"], rt(e, o));
  const r = s(t, ["config"]);
  return r != null && Vy(r, n), n;
}
function Wy(e, t) {
  const n = {}, o = s(t, ["name"]);
  o != null && l(n, ["_url", "name"], rt(e, o));
  const r = s(t, ["config"]);
  return r != null && Jy(r, n), n;
}
var zy = class extends ot {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Dt(nt.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = vy(this.apiClient, e);
      return a = N("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = yy(this.apiClient, e);
      return a = N("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    }
  }
  async get(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Py(this.apiClient, e);
      return a = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = by(this.apiClient, e);
      return a = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    }
  }
  async delete(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Ty(this.apiClient, e);
      return a = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = Ey(d), f = new lu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Ay(this.apiClient, e);
      return a = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = Sy(d), f = new lu();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Wy(this.apiClient, e);
      return a = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = Ky(this.apiClient, e);
      return a = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    }
  }
  async listInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = $y(e);
      return a = N("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = Uy(d), f = new uu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Dy(e);
      return a = N("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = Ly(d), f = new uu();
        return Object.assign(f, h), f;
      });
    }
  }
};
function pt(e, t) {
  var n = {};
  for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var r = 0, o = Object.getOwnPropertySymbols(e); r < o.length; r++) t.indexOf(o[r]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[r]) && (n[o[r]] = e[o[r]]);
  return n;
}
function _u(e) {
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
function B(e) {
  return this instanceof B ? (this.v = e, this) : new B(e);
}
function qe(e, t, n) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var o = n.apply(e, t || []), r, i = [];
  return r = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), u("next"), u("throw"), u("return", a), r[Symbol.asyncIterator] = function() {
    return this;
  }, r;
  function a(m) {
    return function(g) {
      return Promise.resolve(g).then(m, f);
    };
  }
  function u(m, g) {
    o[m] && (r[m] = function(_) {
      return new Promise(function(y, E) {
        i.push([
          m,
          _,
          y,
          E
        ]) > 1 || c(m, _);
      });
    }, g && (r[m] = g(r[m])));
  }
  function c(m, g) {
    try {
      d(o[m](g));
    } catch (_) {
      p(i[0][3], _);
    }
  }
  function d(m) {
    m.value instanceof B ? Promise.resolve(m.value.v).then(h, f) : p(i[0][2], m);
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
function He(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof _u == "function" ? _u(e) : e[Symbol.iterator](), n = {}, o("next"), o("throw"), o("return"), n[Symbol.asyncIterator] = function() {
    return this;
  }, n);
  function o(i) {
    n[i] = e[i] && function(a) {
      return new Promise(function(u, c) {
        a = e[i](a), r(u, c, a.done, a.value);
      });
    };
  }
  function r(i, a, u, c) {
    Promise.resolve(c).then(function(d) {
      i({
        value: d,
        done: u
      });
    }, a);
  }
}
function Yy(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : zd(n);
}
function zd(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function Xy(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function yu(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let o = 0;
  for (; o < n; ) if (e[o].role === "user")
    t.push(e[o]), o++;
  else {
    const r = [];
    let i = !0;
    for (; o < n && e[o].role === "model"; )
      r.push(e[o]), i && !zd(e[o]) && (i = !1), o++;
    i ? t.push(...r) : t.pop();
  }
  return t;
}
var Qy = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new Zy(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, Zy = class {
  constructor(e, t, n, o = {}, r = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = o, this.history = r, this.sendPromise = Promise.resolve(), Xy(r);
  }
  async sendMessage(e) {
    var t;
    await this.sendPromise;
    const n = re(e.message), o = this.modelsModule.generateContent({
      model: this.model,
      contents: this.getHistory(!0).concat(n),
      config: (t = e.config) !== null && t !== void 0 ? t : this.config
    });
    return this.sendPromise = (async () => {
      var r, i, a;
      const u = await o, c = (i = (r = u.candidates) === null || r === void 0 ? void 0 : r[0]) === null || i === void 0 ? void 0 : i.content, d = u.automaticFunctionCallingHistory, h = this.getHistory(!0).length;
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
    const n = re(e.message), o = this.modelsModule.generateContentStream({
      model: this.model,
      contents: this.getHistory(!0).concat(n),
      config: (t = e.config) !== null && t !== void 0 ? t : this.config
    });
    this.sendPromise = o.then(() => {
    }).catch(() => {
    });
    const r = await o;
    return this.processStreamResponse(r, n);
  }
  getHistory(e = !1) {
    const t = e ? yu(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return qe(this, arguments, function* () {
      var o, r, i, a, u, c;
      const d = [];
      try {
        for (var h = !0, f = He(e), p; p = yield B(f.next()), o = p.done, !o; h = !0) {
          a = p.value, h = !1;
          const m = a;
          if (Yy(m)) {
            const g = (c = (u = m.candidates) === null || u === void 0 ? void 0 : u[0]) === null || c === void 0 ? void 0 : c.content;
            g !== void 0 && d.push(g);
          }
          yield yield B(m);
        }
      } catch (m) {
        r = { error: m };
      } finally {
        try {
          !h && !o && (i = f.return) && (yield B(i.call(f)));
        } finally {
          if (r) throw r.error;
        }
      }
      this.recordHistory(t, d);
    });
  }
  recordHistory(e, t, n) {
    let o = [];
    t.length > 0 && t.every((r) => r.role !== void 0) ? o = t : o.push({
      role: "model",
      parts: []
    }), n && n.length > 0 ? this.history.push(...yu(n)) : this.history.push(e), this.history.push(...o);
  }
}, Yd = class Xd extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, Xd.prototype);
  }
};
function jy(e) {
  const t = {}, n = s(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function ev(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function tv(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "file"], Bd(n)), t;
}
function nv(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function ov(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "file"], Bd(n)), t;
}
function rv(e) {
  const t = {}, n = s(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function iv(e, t) {
  const n = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = s(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function sv(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && iv(n, t), t;
}
function av(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = s(e, ["files"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["files"], i);
  }
  return t;
}
function lv(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["files"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => i)), l(t, ["files"], r);
  }
  return t;
}
var uv = class extends ot {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Dt(nt.PAGED_ITEM_FILES, (n) => this.listInternal(n), await this.listInternal(t), t);
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
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = sv(e);
      return r = N("files", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = av(u), d = new r_();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = jy(e);
      return r = N("upload/v1beta/files", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = ev(u), d = new i_();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = ov(e);
      return r = N("files/{file}", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
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
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = tv(e);
      return r = N("files/{file}", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = nv(u), d = new s_();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = rv(e);
      return r = N("files:register", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = lv(u), d = new a_();
        return Object.assign(d, c), d;
      });
    }
  }
};
function vu(e) {
  const t = {};
  if (s(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function cv(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Zo(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function dv(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => bv(i))), l(t, ["parts"], r);
  }
  const o = s(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function fv(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => Pv(i))), l(t, ["parts"], r);
  }
  const o = s(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function hv(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function pv(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = s(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = s(e, ["name"]);
  if (r != null && l(t, ["name"], r), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function mv(e) {
  const t = {}, n = s(e, ["description"]);
  n != null && l(t, ["description"], n);
  const o = s(e, ["name"]);
  o != null && l(t, ["name"], o);
  const r = s(e, ["parameters"]);
  r != null && l(t, ["parameters"], r);
  const i = s(e, ["parametersJsonSchema"]);
  i != null && l(t, ["parametersJsonSchema"], i);
  const a = s(e, ["response"]);
  a != null && l(t, ["response"], a);
  const u = s(e, ["responseJsonSchema"]);
  if (u != null && l(t, ["responseJsonSchema"], u), s(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return t;
}
function gv(e) {
  const t = {}, n = s(e, ["modelSelectionConfig"]);
  n != null && l(t, ["modelConfig"], n);
  const o = s(e, ["responseJsonSchema"]);
  o != null && l(t, ["responseJsonSchema"], o);
  const r = s(e, ["audioTimestamp"]);
  r != null && l(t, ["audioTimestamp"], r);
  const i = s(e, ["candidateCount"]);
  i != null && l(t, ["candidateCount"], i);
  const a = s(e, ["enableAffectiveDialog"]);
  a != null && l(t, ["enableAffectiveDialog"], a);
  const u = s(e, ["frequencyPenalty"]);
  u != null && l(t, ["frequencyPenalty"], u);
  const c = s(e, ["logprobs"]);
  c != null && l(t, ["logprobs"], c);
  const d = s(e, ["maxOutputTokens"]);
  d != null && l(t, ["maxOutputTokens"], d);
  const h = s(e, ["mediaResolution"]);
  h != null && l(t, ["mediaResolution"], h);
  const f = s(e, ["presencePenalty"]);
  f != null && l(t, ["presencePenalty"], f);
  const p = s(e, ["responseLogprobs"]);
  p != null && l(t, ["responseLogprobs"], p);
  const m = s(e, ["responseMimeType"]);
  m != null && l(t, ["responseMimeType"], m);
  const g = s(e, ["responseModalities"]);
  g != null && l(t, ["responseModalities"], g);
  const _ = s(e, ["responseSchema"]);
  _ != null && l(t, ["responseSchema"], _);
  const y = s(e, ["routingConfig"]);
  y != null && l(t, ["routingConfig"], y);
  const E = s(e, ["seed"]);
  E != null && l(t, ["seed"], E);
  const w = s(e, ["speechConfig"]);
  w != null && l(t, ["speechConfig"], w);
  const C = s(e, ["stopSequences"]);
  C != null && l(t, ["stopSequences"], C);
  const P = s(e, ["temperature"]);
  P != null && l(t, ["temperature"], P);
  const M = s(e, ["thinkingConfig"]);
  M != null && l(t, ["thinkingConfig"], M);
  const A = s(e, ["topK"]);
  A != null && l(t, ["topK"], A);
  const $ = s(e, ["topP"]);
  if ($ != null && l(t, ["topP"], $), s(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return t;
}
function _v(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], cv(n));
  const o = s(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function yv(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = s(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function vv(e, t) {
  const n = {}, o = s(e, ["generationConfig"]);
  t !== void 0 && o != null && l(t, ["setup", "generationConfig"], o);
  const r = s(e, ["responseModalities"]);
  t !== void 0 && r != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], r);
  const i = s(e, ["temperature"]);
  t !== void 0 && i != null && l(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], i);
  const a = s(e, ["topP"]);
  t !== void 0 && a != null && l(t, [
    "setup",
    "generationConfig",
    "topP"
  ], a);
  const u = s(e, ["topK"]);
  t !== void 0 && u != null && l(t, [
    "setup",
    "generationConfig",
    "topK"
  ], u);
  const c = s(e, ["maxOutputTokens"]);
  t !== void 0 && c != null && l(t, [
    "setup",
    "generationConfig",
    "maxOutputTokens"
  ], c);
  const d = s(e, ["mediaResolution"]);
  t !== void 0 && d != null && l(t, [
    "setup",
    "generationConfig",
    "mediaResolution"
  ], d);
  const h = s(e, ["seed"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], h);
  const f = s(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], Ms(f));
  const p = s(e, ["thinkingConfig"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], p);
  const m = s(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const g = s(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], dv(re(g)));
  const _ = s(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let I = sn(_);
    Array.isArray(I) && (I = I.map((x) => Nv(rn(x)))), l(t, ["setup", "tools"], I);
  }
  const y = s(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], xv(y));
  const E = s(e, ["inputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "inputAudioTranscription"], vu(E));
  const w = s(e, ["outputAudioTranscription"]);
  t !== void 0 && w != null && l(t, ["setup", "outputAudioTranscription"], vu(w));
  const C = s(e, ["realtimeInputConfig"]);
  t !== void 0 && C != null && l(t, ["setup", "realtimeInputConfig"], C);
  const P = s(e, ["contextWindowCompression"]);
  t !== void 0 && P != null && l(t, ["setup", "contextWindowCompression"], P);
  const M = s(e, ["proactivity"]);
  if (t !== void 0 && M != null && l(t, ["setup", "proactivity"], M), s(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const A = s(e, ["avatarConfig"]);
  t !== void 0 && A != null && l(t, ["setup", "avatarConfig"], A);
  const $ = s(e, ["safetySettings"]);
  if (t !== void 0 && $ != null) {
    let I = $;
    Array.isArray(I) && (I = I.map((x) => Mv(x))), l(t, ["setup", "safetySettings"], I);
  }
  return n;
}
function Av(e, t) {
  const n = {}, o = s(e, ["generationConfig"]);
  t !== void 0 && o != null && l(t, ["setup", "generationConfig"], gv(o));
  const r = s(e, ["responseModalities"]);
  t !== void 0 && r != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], r);
  const i = s(e, ["temperature"]);
  t !== void 0 && i != null && l(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], i);
  const a = s(e, ["topP"]);
  t !== void 0 && a != null && l(t, [
    "setup",
    "generationConfig",
    "topP"
  ], a);
  const u = s(e, ["topK"]);
  t !== void 0 && u != null && l(t, [
    "setup",
    "generationConfig",
    "topK"
  ], u);
  const c = s(e, ["maxOutputTokens"]);
  t !== void 0 && c != null && l(t, [
    "setup",
    "generationConfig",
    "maxOutputTokens"
  ], c);
  const d = s(e, ["mediaResolution"]);
  t !== void 0 && d != null && l(t, [
    "setup",
    "generationConfig",
    "mediaResolution"
  ], d);
  const h = s(e, ["seed"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], h);
  const f = s(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], Ms(f));
  const p = s(e, ["thinkingConfig"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], p);
  const m = s(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const g = s(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], fv(re(g)));
  const _ = s(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let x = sn(_);
    Array.isArray(x) && (x = x.map((F) => kv(rn(F)))), l(t, ["setup", "tools"], x);
  }
  const y = s(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], y);
  const E = s(e, ["inputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "inputAudioTranscription"], E);
  const w = s(e, ["outputAudioTranscription"]);
  t !== void 0 && w != null && l(t, ["setup", "outputAudioTranscription"], w);
  const C = s(e, ["realtimeInputConfig"]);
  t !== void 0 && C != null && l(t, ["setup", "realtimeInputConfig"], C);
  const P = s(e, ["contextWindowCompression"]);
  t !== void 0 && P != null && l(t, ["setup", "contextWindowCompression"], P);
  const M = s(e, ["proactivity"]);
  t !== void 0 && M != null && l(t, ["setup", "proactivity"], M);
  const A = s(e, ["explicitVadSignal"]);
  t !== void 0 && A != null && l(t, ["setup", "explicitVadSignal"], A);
  const $ = s(e, ["avatarConfig"]);
  t !== void 0 && $ != null && l(t, ["setup", "avatarConfig"], $);
  const I = s(e, ["safetySettings"]);
  if (t !== void 0 && I != null) {
    let x = I;
    Array.isArray(x) && (x = x.map((F) => F)), l(t, ["setup", "safetySettings"], x);
  }
  return n;
}
function Tv(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["setup", "model"], V(e, o));
  const r = s(t, ["config"]);
  return r != null && l(n, ["config"], vv(r, n)), n;
}
function Sv(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["setup", "model"], V(e, o));
  const r = s(t, ["config"]);
  return r != null && l(n, ["config"], Av(r, n)), n;
}
function Ev(e) {
  const t = {}, n = s(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function wv(e) {
  const t = {}, n = s(e, ["weightedPrompts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((r) => r)), l(t, ["weightedPrompts"], o);
  }
  return t;
}
function Cv(e) {
  const t = {}, n = s(e, ["media"]);
  if (n != null) {
    let d = Ld(n);
    Array.isArray(d) && (d = d.map((h) => Zo(h))), l(t, ["mediaChunks"], d);
  }
  const o = s(e, ["audio"]);
  o != null && l(t, ["audio"], Zo(Fd(o)));
  const r = s(e, ["audioStreamEnd"]);
  r != null && l(t, ["audioStreamEnd"], r);
  const i = s(e, ["video"]);
  i != null && l(t, ["video"], Zo(Ud(i)));
  const a = s(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = s(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = s(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function Iv(e) {
  const t = {}, n = s(e, ["media"]);
  if (n != null) {
    let d = Ld(n);
    Array.isArray(d) && (d = d.map((h) => h)), l(t, ["mediaChunks"], d);
  }
  const o = s(e, ["audio"]);
  o != null && l(t, ["audio"], Fd(o));
  const r = s(e, ["audioStreamEnd"]);
  r != null && l(t, ["audioStreamEnd"], r);
  const i = s(e, ["video"]);
  i != null && l(t, ["video"], Ud(i));
  const a = s(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = s(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = s(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function Rv(e) {
  const t = {}, n = s(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const o = s(e, ["serverContent"]);
  o != null && l(t, ["serverContent"], o);
  const r = s(e, ["toolCall"]);
  r != null && l(t, ["toolCall"], r);
  const i = s(e, ["toolCallCancellation"]);
  i != null && l(t, ["toolCallCancellation"], i);
  const a = s(e, ["usageMetadata"]);
  a != null && l(t, ["usageMetadata"], Dv(a));
  const u = s(e, ["goAway"]);
  u != null && l(t, ["goAway"], u);
  const c = s(e, ["sessionResumptionUpdate"]);
  c != null && l(t, ["sessionResumptionUpdate"], c);
  const d = s(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const h = s(e, ["voiceActivity"]);
  return h != null && l(t, ["voiceActivity"], $v(h)), t;
}
function bv(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = s(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = s(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], hv(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], pv(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], Zo(c));
  const d = s(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = s(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = s(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = s(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = s(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = s(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = s(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function Pv(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = s(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = s(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], i);
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], a);
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], c);
  const d = s(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = s(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = s(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = s(e, ["videoMetadata"]);
  if (p != null && l(t, ["videoMetadata"], p), s(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (s(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (s(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return t;
}
function Mv(e) {
  const t = {}, n = s(e, ["category"]);
  if (n != null && l(t, ["category"], n), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = s(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function xv(e) {
  const t = {}, n = s(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), s(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function Nv(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = s(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = s(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], yv(r));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], _v(i));
  const a = s(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), s(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = s(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const c = s(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), s(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = s(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = s(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
function kv(e) {
  const t = {}, n = s(e, ["retrieval"]);
  n != null && l(t, ["retrieval"], n);
  const o = s(e, ["computerUse"]);
  if (o != null && l(t, ["computerUse"], o), s(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const r = s(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], r);
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], i);
  const a = s(e, ["codeExecution"]);
  a != null && l(t, ["codeExecution"], a);
  const u = s(e, ["enterpriseWebSearch"]);
  u != null && l(t, ["enterpriseWebSearch"], u);
  const c = s(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => mv(m))), l(t, ["functionDeclarations"], p);
  }
  const d = s(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = s(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = s(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), s(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function Dv(e) {
  const t = {}, n = s(e, ["promptTokenCount"]);
  n != null && l(t, ["promptTokenCount"], n);
  const o = s(e, ["cachedContentTokenCount"]);
  o != null && l(t, ["cachedContentTokenCount"], o);
  const r = s(e, ["candidatesTokenCount"]);
  r != null && l(t, ["responseTokenCount"], r);
  const i = s(e, ["toolUsePromptTokenCount"]);
  i != null && l(t, ["toolUsePromptTokenCount"], i);
  const a = s(e, ["thoughtsTokenCount"]);
  a != null && l(t, ["thoughtsTokenCount"], a);
  const u = s(e, ["totalTokenCount"]);
  u != null && l(t, ["totalTokenCount"], u);
  const c = s(e, ["promptTokensDetails"]);
  if (c != null) {
    let m = c;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["promptTokensDetails"], m);
  }
  const d = s(e, ["cacheTokensDetails"]);
  if (d != null) {
    let m = d;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["cacheTokensDetails"], m);
  }
  const h = s(e, ["candidatesTokensDetails"]);
  if (h != null) {
    let m = h;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["responseTokensDetails"], m);
  }
  const f = s(e, ["toolUsePromptTokensDetails"]);
  if (f != null) {
    let m = f;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["toolUsePromptTokensDetails"], m);
  }
  const p = s(e, ["trafficType"]);
  return p != null && l(t, ["trafficType"], p), t;
}
function $v(e) {
  const t = {}, n = s(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function Lv(e, t) {
  const n = {}, o = s(e, ["apiKey"]);
  if (o != null && l(n, ["apiKey"], o), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function Uv(e, t) {
  const n = {}, o = s(e, ["data"]);
  if (o != null && l(n, ["data"], o), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function Fv(e, t) {
  const n = {}, o = s(e, ["content"]);
  o != null && l(n, ["content"], o);
  const r = s(e, ["citationMetadata"]);
  r != null && l(n, ["citationMetadata"], Ov(r));
  const i = s(e, ["tokenCount"]);
  i != null && l(n, ["tokenCount"], i);
  const a = s(e, ["finishReason"]);
  a != null && l(n, ["finishReason"], a);
  const u = s(e, ["groundingMetadata"]);
  u != null && l(n, ["groundingMetadata"], u);
  const c = s(e, ["avgLogprobs"]);
  c != null && l(n, ["avgLogprobs"], c);
  const d = s(e, ["index"]);
  d != null && l(n, ["index"], d);
  const h = s(e, ["logprobsResult"]);
  h != null && l(n, ["logprobsResult"], h);
  const f = s(e, ["safetyRatings"]);
  if (f != null) {
    let m = f;
    Array.isArray(m) && (m = m.map((g) => g)), l(n, ["safetyRatings"], m);
  }
  const p = s(e, ["urlContextMetadata"]);
  return p != null && l(n, ["urlContextMetadata"], p), n;
}
function Ov(e, t) {
  const n = {}, o = s(e, ["citationSources"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => i)), l(n, ["citations"], r);
  }
  return n;
}
function Gv(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["contents"]);
  if (i != null) {
    let a = _e(i);
    Array.isArray(a) && (a = a.map((u) => ln(u))), l(o, ["contents"], a);
  }
  return o;
}
function Bv(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["tokensInfo"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => a)), l(n, ["tokensInfo"], i);
  }
  return n;
}
function qv(e, t) {
  const n = {}, o = s(e, ["values"]);
  o != null && l(n, ["values"], o);
  const r = s(e, ["statistics"]);
  return r != null && l(n, ["statistics"], Hv(r)), n;
}
function Hv(e, t) {
  const n = {}, o = s(e, ["truncated"]);
  o != null && l(n, ["truncated"], o);
  const r = s(e, ["token_count"]);
  return r != null && l(n, ["tokenCount"], r), n;
}
function po(e, t) {
  const n = {}, o = s(e, ["parts"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => ZA(a))), l(n, ["parts"], i);
  }
  const r = s(e, ["role"]);
  return r != null && l(n, ["role"], r), n;
}
function ln(e, t) {
  const n = {}, o = s(e, ["parts"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => jA(a))), l(n, ["parts"], i);
  }
  const r = s(e, ["role"]);
  return r != null && l(n, ["role"], r), n;
}
function Vv(e, t) {
  const n = {}, o = s(e, ["controlType"]);
  o != null && l(n, ["controlType"], o);
  const r = s(e, ["enableControlImageComputation"]);
  return r != null && l(n, ["computeControl"], r), n;
}
function Jv(e, t) {
  const n = {};
  if (s(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (s(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (s(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function Kv(e, t, n) {
  const o = {}, r = s(e, ["systemInstruction"]);
  t !== void 0 && r != null && l(t, ["systemInstruction"], ln(re(r)));
  const i = s(e, ["tools"]);
  if (t !== void 0 && i != null) {
    let u = i;
    Array.isArray(u) && (u = u.map((c) => ef(c))), l(t, ["tools"], u);
  }
  const a = s(e, ["generationConfig"]);
  return t !== void 0 && a != null && l(t, ["generationConfig"], UA(a)), o;
}
function Wv(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = _e(i);
    Array.isArray(u) && (u = u.map((c) => po(c))), l(o, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && Jv(a), o;
}
function zv(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = _e(i);
    Array.isArray(u) && (u = u.map((c) => ln(c))), l(o, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && Kv(a, o), o;
}
function Yv(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["totalTokens"]);
  r != null && l(n, ["totalTokens"], r);
  const i = s(e, ["cachedContentTokenCount"]);
  return i != null && l(n, ["cachedContentTokenCount"], i), n;
}
function Xv(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["totalTokens"]);
  return r != null && l(n, ["totalTokens"], r), n;
}
function Qv(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  return r != null && l(o, ["_url", "name"], V(e, r)), o;
}
function Zv(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  return r != null && l(o, ["_url", "name"], V(e, r)), o;
}
function jv(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function eA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function tA(e, t, n) {
  const o = {}, r = s(e, ["outputGcsUri"]);
  t !== void 0 && r != null && l(t, ["parameters", "storageUri"], r);
  const i = s(e, ["negativePrompt"]);
  t !== void 0 && i != null && l(t, ["parameters", "negativePrompt"], i);
  const a = s(e, ["numberOfImages"]);
  t !== void 0 && a != null && l(t, ["parameters", "sampleCount"], a);
  const u = s(e, ["aspectRatio"]);
  t !== void 0 && u != null && l(t, ["parameters", "aspectRatio"], u);
  const c = s(e, ["guidanceScale"]);
  t !== void 0 && c != null && l(t, ["parameters", "guidanceScale"], c);
  const d = s(e, ["seed"]);
  t !== void 0 && d != null && l(t, ["parameters", "seed"], d);
  const h = s(e, ["safetyFilterLevel"]);
  t !== void 0 && h != null && l(t, ["parameters", "safetySetting"], h);
  const f = s(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const p = s(e, ["includeSafetyAttributes"]);
  t !== void 0 && p != null && l(t, ["parameters", "includeSafetyAttributes"], p);
  const m = s(e, ["includeRaiReason"]);
  t !== void 0 && m != null && l(t, ["parameters", "includeRaiReason"], m);
  const g = s(e, ["language"]);
  t !== void 0 && g != null && l(t, ["parameters", "language"], g);
  const _ = s(e, ["outputMimeType"]);
  t !== void 0 && _ != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], _);
  const y = s(e, ["outputCompressionQuality"]);
  t !== void 0 && y != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], y);
  const E = s(e, ["addWatermark"]);
  t !== void 0 && E != null && l(t, ["parameters", "addWatermark"], E);
  const w = s(e, ["labels"]);
  t !== void 0 && w != null && l(t, ["labels"], w);
  const C = s(e, ["editMode"]);
  t !== void 0 && C != null && l(t, ["parameters", "editMode"], C);
  const P = s(e, ["baseSteps"]);
  return t !== void 0 && P != null && l(t, [
    "parameters",
    "editConfig",
    "baseSteps"
  ], P), o;
}
function nA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = s(t, ["referenceImages"]);
  if (a != null) {
    let c = a;
    Array.isArray(c) && (c = c.map((d) => iT(d))), l(o, ["instances[0]", "referenceImages"], c);
  }
  const u = s(t, ["config"]);
  return u != null && tA(u, o), o;
}
function oA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["predictions"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => xr(a))), l(n, ["generatedImages"], i);
  }
  return n;
}
function rA(e, t, n) {
  const o = {}, r = s(e, ["taskType"]);
  t !== void 0 && r != null && l(t, ["requests[]", "taskType"], r);
  const i = s(e, ["title"]);
  t !== void 0 && i != null && l(t, ["requests[]", "title"], i);
  const a = s(e, ["outputDimensionality"]);
  if (t !== void 0 && a != null && l(t, ["requests[]", "outputDimensionality"], a), s(e, ["mimeType"]) !== void 0) throw new Error("mimeType parameter is not supported in Gemini API.");
  if (s(e, ["autoTruncate"]) !== void 0) throw new Error("autoTruncate parameter is not supported in Gemini API.");
  if (s(e, ["documentOcr"]) !== void 0) throw new Error("documentOcr parameter is not supported in Gemini API.");
  if (s(e, ["audioTrackExtraction"]) !== void 0) throw new Error("audioTrackExtraction parameter is not supported in Gemini API.");
  return o;
}
function iA(e, t, n) {
  const o = {};
  let r = s(n, ["embeddingApiType"]);
  if (r === void 0 && (r = "PREDICT"), r === "PREDICT") {
    const f = s(e, ["taskType"]);
    t !== void 0 && f != null && l(t, ["instances[]", "task_type"], f);
  } else if (r === "EMBED_CONTENT") {
    const f = s(e, ["taskType"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "taskType"], f);
  }
  let i = s(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const f = s(e, ["title"]);
    t !== void 0 && f != null && l(t, ["instances[]", "title"], f);
  } else if (i === "EMBED_CONTENT") {
    const f = s(e, ["title"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "title"], f);
  }
  let a = s(n, ["embeddingApiType"]);
  if (a === void 0 && (a = "PREDICT"), a === "PREDICT") {
    const f = s(e, ["outputDimensionality"]);
    t !== void 0 && f != null && l(t, ["parameters", "outputDimensionality"], f);
  } else if (a === "EMBED_CONTENT") {
    const f = s(e, ["outputDimensionality"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "outputDimensionality"], f);
  }
  let u = s(n, ["embeddingApiType"]);
  if (u === void 0 && (u = "PREDICT"), u === "PREDICT") {
    const f = s(e, ["mimeType"]);
    t !== void 0 && f != null && l(t, ["instances[]", "mimeType"], f);
  }
  let c = s(n, ["embeddingApiType"]);
  if (c === void 0 && (c = "PREDICT"), c === "PREDICT") {
    const f = s(e, ["autoTruncate"]);
    t !== void 0 && f != null && l(t, ["parameters", "autoTruncate"], f);
  } else if (c === "EMBED_CONTENT") {
    const f = s(e, ["autoTruncate"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "autoTruncate"], f);
  }
  let d = s(n, ["embeddingApiType"]);
  if (d === void 0 && (d = "PREDICT"), d === "EMBED_CONTENT") {
    const f = s(e, ["documentOcr"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "documentOcr"], f);
  }
  let h = s(n, ["embeddingApiType"]);
  if (h === void 0 && (h = "PREDICT"), h === "EMBED_CONTENT") {
    const f = s(e, ["audioTrackExtraction"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "audioTrackExtraction"], f);
  }
  return o;
}
function sA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["contents"]);
  if (i != null) {
    let d = Rs(e, i);
    Array.isArray(d) && (d = d.map((h) => h)), l(o, ["requests[]", "content"], d);
  }
  const a = s(t, ["content"]);
  a != null && po(re(a));
  const u = s(t, ["config"]);
  u != null && rA(u, o);
  const c = s(t, ["model"]);
  return c !== void 0 && l(o, ["requests[]", "model"], V(e, c)), o;
}
function aA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  let i = s(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const c = s(t, ["contents"]);
    if (c != null) {
      let d = Rs(e, c);
      Array.isArray(d) && (d = d.map((h) => h)), l(o, ["instances[]", "content"], d);
    }
  }
  let a = s(n, ["embeddingApiType"]);
  if (a === void 0 && (a = "PREDICT"), a === "EMBED_CONTENT") {
    const c = s(t, ["content"]);
    c != null && l(o, ["content"], ln(re(c)));
  }
  const u = s(t, ["config"]);
  return u != null && iA(u, o, n), o;
}
function lA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["embeddings"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => u)), l(n, ["embeddings"], a);
  }
  const i = s(e, ["metadata"]);
  return i != null && l(n, ["metadata"], i), n;
}
function uA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["predictions[]", "embeddings"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => qv(u))), l(n, ["embeddings"], a);
  }
  const i = s(e, ["metadata"]);
  if (i != null && l(n, ["metadata"], i), t && s(t, ["embeddingApiType"]) === "EMBED_CONTENT") {
    const a = s(e, ["embedding"]), u = s(e, ["usageMetadata"]), c = s(e, ["truncated"]);
    if (a) {
      const d = {};
      u && u.promptTokenCount && (d.tokenCount = u.promptTokenCount), c && (d.truncated = c), a.statistics = d, l(n, ["embeddings"], [a]);
    }
  }
  return n;
}
function cA(e, t) {
  const n = {}, o = s(e, ["endpoint"]);
  o != null && l(n, ["name"], o);
  const r = s(e, ["deployedModelId"]);
  return r != null && l(n, ["deployedModelId"], r), n;
}
function dA(e, t) {
  const n = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = s(e, ["fileUri"]);
  o != null && l(n, ["fileUri"], o);
  const r = s(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function fA(e, t) {
  const n = {}, o = s(e, ["id"]);
  o != null && l(n, ["id"], o);
  const r = s(e, ["args"]);
  r != null && l(n, ["args"], r);
  const i = s(e, ["name"]);
  if (i != null && l(n, ["name"], i), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function hA(e, t) {
  const n = {}, o = s(e, ["allowedFunctionNames"]);
  o != null && l(n, ["allowedFunctionNames"], o);
  const r = s(e, ["mode"]);
  if (r != null && l(n, ["mode"], r), s(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function pA(e, t) {
  const n = {}, o = s(e, ["description"]);
  o != null && l(n, ["description"], o);
  const r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = s(e, ["parameters"]);
  i != null && l(n, ["parameters"], i);
  const a = s(e, ["parametersJsonSchema"]);
  a != null && l(n, ["parametersJsonSchema"], a);
  const u = s(e, ["response"]);
  u != null && l(n, ["response"], u);
  const c = s(e, ["responseJsonSchema"]);
  if (c != null && l(n, ["responseJsonSchema"], c), s(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return n;
}
function mA(e, t, n, o) {
  const r = {}, i = s(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], po(re(i)));
  const a = s(t, ["temperature"]);
  a != null && l(r, ["temperature"], a);
  const u = s(t, ["topP"]);
  u != null && l(r, ["topP"], u);
  const c = s(t, ["topK"]);
  c != null && l(r, ["topK"], c);
  const d = s(t, ["candidateCount"]);
  d != null && l(r, ["candidateCount"], d);
  const h = s(t, ["maxOutputTokens"]);
  h != null && l(r, ["maxOutputTokens"], h);
  const f = s(t, ["stopSequences"]);
  f != null && l(r, ["stopSequences"], f);
  const p = s(t, ["responseLogprobs"]);
  p != null && l(r, ["responseLogprobs"], p);
  const m = s(t, ["logprobs"]);
  m != null && l(r, ["logprobs"], m);
  const g = s(t, ["presencePenalty"]);
  g != null && l(r, ["presencePenalty"], g);
  const _ = s(t, ["frequencyPenalty"]);
  _ != null && l(r, ["frequencyPenalty"], _);
  const y = s(t, ["seed"]);
  y != null && l(r, ["seed"], y);
  const E = s(t, ["responseMimeType"]);
  E != null && l(r, ["responseMimeType"], E);
  const w = s(t, ["responseSchema"]);
  w != null && l(r, ["responseSchema"], bs(w));
  const C = s(t, ["responseJsonSchema"]);
  if (C != null && l(r, ["responseJsonSchema"], C), s(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (s(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const P = s(t, ["safetySettings"]);
  if (n !== void 0 && P != null) {
    let W = P;
    Array.isArray(W) && (W = W.map((pe) => sT(pe))), l(n, ["safetySettings"], W);
  }
  const M = s(t, ["tools"]);
  if (n !== void 0 && M != null) {
    let W = sn(M);
    Array.isArray(W) && (W = W.map((pe) => pT(rn(pe)))), l(n, ["tools"], W);
  }
  const A = s(t, ["toolConfig"]);
  if (n !== void 0 && A != null && l(n, ["toolConfig"], fT(A)), s(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const $ = s(t, ["cachedContent"]);
  n !== void 0 && $ != null && l(n, ["cachedContent"], rt(e, $));
  const I = s(t, ["responseModalities"]);
  I != null && l(r, ["responseModalities"], I);
  const x = s(t, ["mediaResolution"]);
  x != null && l(r, ["mediaResolution"], x);
  const F = s(t, ["speechConfig"]);
  if (F != null && l(r, ["speechConfig"], Ps(F)), s(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const H = s(t, ["thinkingConfig"]);
  H != null && l(r, ["thinkingConfig"], H);
  const ue = s(t, ["imageConfig"]);
  ue != null && l(r, ["imageConfig"], qA(ue));
  const ie = s(t, ["enableEnhancedCivicAnswers"]);
  if (ie != null && l(r, ["enableEnhancedCivicAnswers"], ie), s(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const J = s(t, ["serviceTier"]);
  return n !== void 0 && J != null && l(n, ["serviceTier"], J), r;
}
function gA(e, t, n, o) {
  const r = {}, i = s(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], ln(re(i)));
  const a = s(t, ["temperature"]);
  a != null && l(r, ["temperature"], a);
  const u = s(t, ["topP"]);
  u != null && l(r, ["topP"], u);
  const c = s(t, ["topK"]);
  c != null && l(r, ["topK"], c);
  const d = s(t, ["candidateCount"]);
  d != null && l(r, ["candidateCount"], d);
  const h = s(t, ["maxOutputTokens"]);
  h != null && l(r, ["maxOutputTokens"], h);
  const f = s(t, ["stopSequences"]);
  f != null && l(r, ["stopSequences"], f);
  const p = s(t, ["responseLogprobs"]);
  p != null && l(r, ["responseLogprobs"], p);
  const m = s(t, ["logprobs"]);
  m != null && l(r, ["logprobs"], m);
  const g = s(t, ["presencePenalty"]);
  g != null && l(r, ["presencePenalty"], g);
  const _ = s(t, ["frequencyPenalty"]);
  _ != null && l(r, ["frequencyPenalty"], _);
  const y = s(t, ["seed"]);
  y != null && l(r, ["seed"], y);
  const E = s(t, ["responseMimeType"]);
  E != null && l(r, ["responseMimeType"], E);
  const w = s(t, ["responseSchema"]);
  w != null && l(r, ["responseSchema"], bs(w));
  const C = s(t, ["responseJsonSchema"]);
  C != null && l(r, ["responseJsonSchema"], C);
  const P = s(t, ["routingConfig"]);
  P != null && l(r, ["routingConfig"], P);
  const M = s(t, ["modelSelectionConfig"]);
  M != null && l(r, ["modelConfig"], M);
  const A = s(t, ["safetySettings"]);
  if (n !== void 0 && A != null) {
    let Le = A;
    Array.isArray(Le) && (Le = Le.map((zr) => zr)), l(n, ["safetySettings"], Le);
  }
  const $ = s(t, ["tools"]);
  if (n !== void 0 && $ != null) {
    let Le = sn($);
    Array.isArray(Le) && (Le = Le.map((zr) => ef(rn(zr)))), l(n, ["tools"], Le);
  }
  const I = s(t, ["toolConfig"]);
  n !== void 0 && I != null && l(n, ["toolConfig"], hT(I));
  const x = s(t, ["labels"]);
  n !== void 0 && x != null && l(n, ["labels"], x);
  const F = s(t, ["cachedContent"]);
  n !== void 0 && F != null && l(n, ["cachedContent"], rt(e, F));
  const H = s(t, ["responseModalities"]);
  H != null && l(r, ["responseModalities"], H);
  const ue = s(t, ["mediaResolution"]);
  ue != null && l(r, ["mediaResolution"], ue);
  const ie = s(t, ["speechConfig"]);
  ie != null && l(r, ["speechConfig"], Ps(ie));
  const J = s(t, ["audioTimestamp"]);
  J != null && l(r, ["audioTimestamp"], J);
  const W = s(t, ["thinkingConfig"]);
  W != null && l(r, ["thinkingConfig"], W);
  const pe = s(t, ["imageConfig"]);
  if (pe != null && l(r, ["imageConfig"], HA(pe)), s(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const Je = s(t, ["modelArmorConfig"]);
  n !== void 0 && Je != null && l(n, ["modelArmorConfig"], Je);
  const $e = s(t, ["serviceTier"]);
  return n !== void 0 && $e != null && l(n, ["serviceTier"], $e), r;
}
function Au(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = _e(i);
    Array.isArray(u) && (u = u.map((c) => po(c))), l(o, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && l(o, ["generationConfig"], mA(e, a, o)), o;
}
function Tu(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = _e(i);
    Array.isArray(u) && (u = u.map((c) => ln(c))), l(o, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && l(o, ["generationConfig"], gA(e, a, o)), o;
}
function Su(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["candidates"]);
  if (r != null) {
    let h = r;
    Array.isArray(h) && (h = h.map((f) => Fv(f))), l(n, ["candidates"], h);
  }
  const i = s(e, ["modelVersion"]);
  i != null && l(n, ["modelVersion"], i);
  const a = s(e, ["promptFeedback"]);
  a != null && l(n, ["promptFeedback"], a);
  const u = s(e, ["responseId"]);
  u != null && l(n, ["responseId"], u);
  const c = s(e, ["usageMetadata"]);
  c != null && l(n, ["usageMetadata"], c);
  const d = s(e, ["modelStatus"]);
  return d != null && l(n, ["modelStatus"], d), n;
}
function Eu(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["candidates"]);
  if (r != null) {
    let h = r;
    Array.isArray(h) && (h = h.map((f) => f)), l(n, ["candidates"], h);
  }
  const i = s(e, ["createTime"]);
  i != null && l(n, ["createTime"], i);
  const a = s(e, ["modelVersion"]);
  a != null && l(n, ["modelVersion"], a);
  const u = s(e, ["promptFeedback"]);
  u != null && l(n, ["promptFeedback"], u);
  const c = s(e, ["responseId"]);
  c != null && l(n, ["responseId"], c);
  const d = s(e, ["usageMetadata"]);
  return d != null && l(n, ["usageMetadata"], d), n;
}
function _A(e, t, n) {
  const o = {};
  if (s(e, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  if (s(e, ["negativePrompt"]) !== void 0) throw new Error("negativePrompt parameter is not supported in Gemini API.");
  const r = s(e, ["numberOfImages"]);
  t !== void 0 && r != null && l(t, ["parameters", "sampleCount"], r);
  const i = s(e, ["aspectRatio"]);
  t !== void 0 && i != null && l(t, ["parameters", "aspectRatio"], i);
  const a = s(e, ["guidanceScale"]);
  if (t !== void 0 && a != null && l(t, ["parameters", "guidanceScale"], a), s(e, ["seed"]) !== void 0) throw new Error("seed parameter is not supported in Gemini API.");
  const u = s(e, ["safetyFilterLevel"]);
  t !== void 0 && u != null && l(t, ["parameters", "safetySetting"], u);
  const c = s(e, ["personGeneration"]);
  t !== void 0 && c != null && l(t, ["parameters", "personGeneration"], c);
  const d = s(e, ["includeSafetyAttributes"]);
  t !== void 0 && d != null && l(t, ["parameters", "includeSafetyAttributes"], d);
  const h = s(e, ["includeRaiReason"]);
  t !== void 0 && h != null && l(t, ["parameters", "includeRaiReason"], h);
  const f = s(e, ["language"]);
  t !== void 0 && f != null && l(t, ["parameters", "language"], f);
  const p = s(e, ["outputMimeType"]);
  t !== void 0 && p != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], p);
  const m = s(e, ["outputCompressionQuality"]);
  if (t !== void 0 && m != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], m), s(e, ["addWatermark"]) !== void 0) throw new Error("addWatermark parameter is not supported in Gemini API.");
  if (s(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const g = s(e, ["imageSize"]);
  if (t !== void 0 && g != null && l(t, ["parameters", "sampleImageSize"], g), s(e, ["enhancePrompt"]) !== void 0) throw new Error("enhancePrompt parameter is not supported in Gemini API.");
  return o;
}
function yA(e, t, n) {
  const o = {}, r = s(e, ["outputGcsUri"]);
  t !== void 0 && r != null && l(t, ["parameters", "storageUri"], r);
  const i = s(e, ["negativePrompt"]);
  t !== void 0 && i != null && l(t, ["parameters", "negativePrompt"], i);
  const a = s(e, ["numberOfImages"]);
  t !== void 0 && a != null && l(t, ["parameters", "sampleCount"], a);
  const u = s(e, ["aspectRatio"]);
  t !== void 0 && u != null && l(t, ["parameters", "aspectRatio"], u);
  const c = s(e, ["guidanceScale"]);
  t !== void 0 && c != null && l(t, ["parameters", "guidanceScale"], c);
  const d = s(e, ["seed"]);
  t !== void 0 && d != null && l(t, ["parameters", "seed"], d);
  const h = s(e, ["safetyFilterLevel"]);
  t !== void 0 && h != null && l(t, ["parameters", "safetySetting"], h);
  const f = s(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const p = s(e, ["includeSafetyAttributes"]);
  t !== void 0 && p != null && l(t, ["parameters", "includeSafetyAttributes"], p);
  const m = s(e, ["includeRaiReason"]);
  t !== void 0 && m != null && l(t, ["parameters", "includeRaiReason"], m);
  const g = s(e, ["language"]);
  t !== void 0 && g != null && l(t, ["parameters", "language"], g);
  const _ = s(e, ["outputMimeType"]);
  t !== void 0 && _ != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], _);
  const y = s(e, ["outputCompressionQuality"]);
  t !== void 0 && y != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], y);
  const E = s(e, ["addWatermark"]);
  t !== void 0 && E != null && l(t, ["parameters", "addWatermark"], E);
  const w = s(e, ["labels"]);
  t !== void 0 && w != null && l(t, ["labels"], w);
  const C = s(e, ["imageSize"]);
  t !== void 0 && C != null && l(t, ["parameters", "sampleImageSize"], C);
  const P = s(e, ["enhancePrompt"]);
  return t !== void 0 && P != null && l(t, ["parameters", "enhancePrompt"], P), o;
}
function vA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = s(t, ["config"]);
  return a != null && _A(a, o), o;
}
function AA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = s(t, ["config"]);
  return a != null && yA(a, o), o;
}
function TA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["predictions"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => kA(u))), l(n, ["generatedImages"], a);
  }
  const i = s(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], Zd(i)), n;
}
function SA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["predictions"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => xr(u))), l(n, ["generatedImages"], a);
  }
  const i = s(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], jd(i)), n;
}
function EA(e, t, n) {
  const o = {}, r = s(e, ["numberOfVideos"]);
  if (t !== void 0 && r != null && l(t, ["parameters", "sampleCount"], r), s(e, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  if (s(e, ["fps"]) !== void 0) throw new Error("fps parameter is not supported in Gemini API.");
  const i = s(e, ["durationSeconds"]);
  if (t !== void 0 && i != null && l(t, ["parameters", "durationSeconds"], i), s(e, ["seed"]) !== void 0) throw new Error("seed parameter is not supported in Gemini API.");
  const a = s(e, ["aspectRatio"]);
  t !== void 0 && a != null && l(t, ["parameters", "aspectRatio"], a);
  const u = s(e, ["resolution"]);
  t !== void 0 && u != null && l(t, ["parameters", "resolution"], u);
  const c = s(e, ["personGeneration"]);
  if (t !== void 0 && c != null && l(t, ["parameters", "personGeneration"], c), s(e, ["pubsubTopic"]) !== void 0) throw new Error("pubsubTopic parameter is not supported in Gemini API.");
  const d = s(e, ["negativePrompt"]);
  t !== void 0 && d != null && l(t, ["parameters", "negativePrompt"], d);
  const h = s(e, ["enhancePrompt"]);
  if (t !== void 0 && h != null && l(t, ["parameters", "enhancePrompt"], h), s(e, ["generateAudio"]) !== void 0) throw new Error("generateAudio parameter is not supported in Gemini API.");
  const f = s(e, ["lastFrame"]);
  t !== void 0 && f != null && l(t, ["instances[0]", "lastFrame"], Nr(f));
  const p = s(e, ["referenceImages"]);
  if (t !== void 0 && p != null) {
    let g = p;
    Array.isArray(g) && (g = g.map((_) => RT(_))), l(t, ["instances[0]", "referenceImages"], g);
  }
  if (s(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (s(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (s(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = s(e, ["webhookConfig"]);
  return t !== void 0 && m != null && l(t, ["webhookConfig"], m), o;
}
function wA(e, t, n) {
  const o = {}, r = s(e, ["numberOfVideos"]);
  t !== void 0 && r != null && l(t, ["parameters", "sampleCount"], r);
  const i = s(e, ["outputGcsUri"]);
  t !== void 0 && i != null && l(t, ["parameters", "storageUri"], i);
  const a = s(e, ["fps"]);
  t !== void 0 && a != null && l(t, ["parameters", "fps"], a);
  const u = s(e, ["durationSeconds"]);
  t !== void 0 && u != null && l(t, ["parameters", "durationSeconds"], u);
  const c = s(e, ["seed"]);
  t !== void 0 && c != null && l(t, ["parameters", "seed"], c);
  const d = s(e, ["aspectRatio"]);
  t !== void 0 && d != null && l(t, ["parameters", "aspectRatio"], d);
  const h = s(e, ["resolution"]);
  t !== void 0 && h != null && l(t, ["parameters", "resolution"], h);
  const f = s(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const p = s(e, ["pubsubTopic"]);
  t !== void 0 && p != null && l(t, ["parameters", "pubsubTopic"], p);
  const m = s(e, ["negativePrompt"]);
  t !== void 0 && m != null && l(t, ["parameters", "negativePrompt"], m);
  const g = s(e, ["enhancePrompt"]);
  t !== void 0 && g != null && l(t, ["parameters", "enhancePrompt"], g);
  const _ = s(e, ["generateAudio"]);
  t !== void 0 && _ != null && l(t, ["parameters", "generateAudio"], _);
  const y = s(e, ["lastFrame"]);
  t !== void 0 && y != null && l(t, ["instances[0]", "lastFrame"], Ve(y));
  const E = s(e, ["referenceImages"]);
  if (t !== void 0 && E != null) {
    let M = E;
    Array.isArray(M) && (M = M.map((A) => bT(A))), l(t, ["instances[0]", "referenceImages"], M);
  }
  const w = s(e, ["mask"]);
  t !== void 0 && w != null && l(t, ["instances[0]", "mask"], IT(w));
  const C = s(e, ["compressionQuality"]);
  t !== void 0 && C != null && l(t, ["parameters", "compressionQuality"], C);
  const P = s(e, ["labels"]);
  if (t !== void 0 && P != null && l(t, ["labels"], P), s(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return o;
}
function CA(e, t) {
  const n = {}, o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
  const r = s(e, ["metadata"]);
  r != null && l(n, ["metadata"], r);
  const i = s(e, ["done"]);
  i != null && l(n, ["done"], i);
  const a = s(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = s(e, ["response", "generateVideoResponse"]);
  return u != null && l(n, ["response"], PA(u)), n;
}
function IA(e, t) {
  const n = {}, o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
  const r = s(e, ["metadata"]);
  r != null && l(n, ["metadata"], r);
  const i = s(e, ["done"]);
  i != null && l(n, ["done"], i);
  const a = s(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = s(e, ["response"]);
  return u != null && l(n, ["response"], MA(u)), n;
}
function RA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = s(t, ["image"]);
  a != null && l(o, ["instances[0]", "image"], Nr(a));
  const u = s(t, ["video"]);
  u != null && l(o, ["instances[0]", "video"], tf(u));
  const c = s(t, ["source"]);
  c != null && xA(c, o);
  const d = s(t, ["config"]);
  return d != null && EA(d, o), o;
}
function bA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = s(t, ["image"]);
  a != null && l(o, ["instances[0]", "image"], Ve(a));
  const u = s(t, ["video"]);
  u != null && l(o, ["instances[0]", "video"], nf(u));
  const c = s(t, ["source"]);
  c != null && NA(c, o);
  const d = s(t, ["config"]);
  return d != null && wA(d, o), o;
}
function PA(e, t) {
  const n = {}, o = s(e, ["generatedSamples"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => $A(u))), l(n, ["generatedVideos"], a);
  }
  const r = s(e, ["raiMediaFilteredCount"]);
  r != null && l(n, ["raiMediaFilteredCount"], r);
  const i = s(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function MA(e, t) {
  const n = {}, o = s(e, ["videos"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => LA(u))), l(n, ["generatedVideos"], a);
  }
  const r = s(e, ["raiMediaFilteredCount"]);
  r != null && l(n, ["raiMediaFilteredCount"], r);
  const i = s(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function xA(e, t, n) {
  const o = {}, r = s(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = s(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Nr(i));
  const a = s(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], tf(a)), o;
}
function NA(e, t, n) {
  const o = {}, r = s(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = s(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Ve(i));
  const a = s(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], nf(a)), o;
}
function kA(e, t) {
  const n = {}, o = s(e, ["_self"]);
  o != null && l(n, ["image"], VA(o));
  const r = s(e, ["raiFilteredReason"]);
  r != null && l(n, ["raiFilteredReason"], r);
  const i = s(e, ["_self"]);
  return i != null && l(n, ["safetyAttributes"], Zd(i)), n;
}
function xr(e, t) {
  const n = {}, o = s(e, ["_self"]);
  o != null && l(n, ["image"], Qd(o));
  const r = s(e, ["raiFilteredReason"]);
  r != null && l(n, ["raiFilteredReason"], r);
  const i = s(e, ["_self"]);
  i != null && l(n, ["safetyAttributes"], jd(i));
  const a = s(e, ["prompt"]);
  return a != null && l(n, ["enhancedPrompt"], a), n;
}
function DA(e, t) {
  const n = {}, o = s(e, ["_self"]);
  o != null && l(n, ["mask"], Qd(o));
  const r = s(e, ["labels"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => a)), l(n, ["labels"], i);
  }
  return n;
}
function $A(e, t) {
  const n = {}, o = s(e, ["video"]);
  return o != null && l(n, ["video"], wT(o)), n;
}
function LA(e, t) {
  const n = {}, o = s(e, ["_self"]);
  return o != null && l(n, ["video"], CT(o)), n;
}
function UA(e, t) {
  const n = {}, o = s(e, ["modelSelectionConfig"]);
  o != null && l(n, ["modelConfig"], o);
  const r = s(e, ["responseJsonSchema"]);
  r != null && l(n, ["responseJsonSchema"], r);
  const i = s(e, ["audioTimestamp"]);
  i != null && l(n, ["audioTimestamp"], i);
  const a = s(e, ["candidateCount"]);
  a != null && l(n, ["candidateCount"], a);
  const u = s(e, ["enableAffectiveDialog"]);
  u != null && l(n, ["enableAffectiveDialog"], u);
  const c = s(e, ["frequencyPenalty"]);
  c != null && l(n, ["frequencyPenalty"], c);
  const d = s(e, ["logprobs"]);
  d != null && l(n, ["logprobs"], d);
  const h = s(e, ["maxOutputTokens"]);
  h != null && l(n, ["maxOutputTokens"], h);
  const f = s(e, ["mediaResolution"]);
  f != null && l(n, ["mediaResolution"], f);
  const p = s(e, ["presencePenalty"]);
  p != null && l(n, ["presencePenalty"], p);
  const m = s(e, ["responseLogprobs"]);
  m != null && l(n, ["responseLogprobs"], m);
  const g = s(e, ["responseMimeType"]);
  g != null && l(n, ["responseMimeType"], g);
  const _ = s(e, ["responseModalities"]);
  _ != null && l(n, ["responseModalities"], _);
  const y = s(e, ["responseSchema"]);
  y != null && l(n, ["responseSchema"], y);
  const E = s(e, ["routingConfig"]);
  E != null && l(n, ["routingConfig"], E);
  const w = s(e, ["seed"]);
  w != null && l(n, ["seed"], w);
  const C = s(e, ["speechConfig"]);
  C != null && l(n, ["speechConfig"], C);
  const P = s(e, ["stopSequences"]);
  P != null && l(n, ["stopSequences"], P);
  const M = s(e, ["temperature"]);
  M != null && l(n, ["temperature"], M);
  const A = s(e, ["thinkingConfig"]);
  A != null && l(n, ["thinkingConfig"], A);
  const $ = s(e, ["topK"]);
  $ != null && l(n, ["topK"], $);
  const I = s(e, ["topP"]);
  if (I != null && l(n, ["topP"], I), s(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return n;
}
function FA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  return r != null && l(o, ["_url", "name"], V(e, r)), o;
}
function OA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  return r != null && l(o, ["_url", "name"], V(e, r)), o;
}
function GA(e, t) {
  const n = {}, o = s(e, ["authConfig"]);
  o != null && l(n, ["authConfig"], Lv(o));
  const r = s(e, ["enableWidget"]);
  return r != null && l(n, ["enableWidget"], r), n;
}
function BA(e, t) {
  const n = {}, o = s(e, ["searchTypes"]);
  if (o != null && l(n, ["searchTypes"], o), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = s(e, ["timeRangeFilter"]);
  return r != null && l(n, ["timeRangeFilter"], r), n;
}
function qA(e, t) {
  const n = {}, o = s(e, ["aspectRatio"]);
  o != null && l(n, ["aspectRatio"], o);
  const r = s(e, ["imageSize"]);
  if (r != null && l(n, ["imageSize"], r), s(e, ["personGeneration"]) !== void 0) throw new Error("personGeneration parameter is not supported in Gemini API.");
  if (s(e, ["prominentPeople"]) !== void 0) throw new Error("prominentPeople parameter is not supported in Gemini API.");
  if (s(e, ["outputMimeType"]) !== void 0) throw new Error("outputMimeType parameter is not supported in Gemini API.");
  if (s(e, ["outputCompressionQuality"]) !== void 0) throw new Error("outputCompressionQuality parameter is not supported in Gemini API.");
  if (s(e, ["imageOutputOptions"]) !== void 0) throw new Error("imageOutputOptions parameter is not supported in Gemini API.");
  return n;
}
function HA(e, t) {
  const n = {}, o = s(e, ["aspectRatio"]);
  o != null && l(n, ["aspectRatio"], o);
  const r = s(e, ["imageSize"]);
  r != null && l(n, ["imageSize"], r);
  const i = s(e, ["personGeneration"]);
  i != null && l(n, ["personGeneration"], i);
  const a = s(e, ["prominentPeople"]);
  a != null && l(n, ["prominentPeople"], a);
  const u = s(e, ["outputMimeType"]);
  u != null && l(n, ["imageOutputOptions", "mimeType"], u);
  const c = s(e, ["outputCompressionQuality"]);
  c != null && l(n, ["imageOutputOptions", "compressionQuality"], c);
  const d = s(e, ["imageOutputOptions"]);
  return d != null && l(n, ["imageOutputOptions"], d), n;
}
function VA(e, t) {
  const n = {}, o = s(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["imageBytes"], _t(o));
  const r = s(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function Qd(e, t) {
  const n = {}, o = s(e, ["gcsUri"]);
  o != null && l(n, ["gcsUri"], o);
  const r = s(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["imageBytes"], _t(r));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function Nr(e, t) {
  const n = {};
  if (s(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  const o = s(e, ["imageBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], _t(o));
  const r = s(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function Ve(e, t) {
  const n = {}, o = s(e, ["gcsUri"]);
  o != null && l(n, ["gcsUri"], o);
  const r = s(e, ["imageBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], _t(r));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function JA(e, t, n, o) {
  const r = {}, i = s(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const a = s(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = s(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = s(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], qd(e, c)), r;
}
function KA(e, t, n, o) {
  const r = {}, i = s(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const a = s(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = s(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = s(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], qd(e, c)), r;
}
function WA(e, t, n) {
  const o = {}, r = s(t, ["config"]);
  return r != null && JA(e, r, o), o;
}
function zA(e, t, n) {
  const o = {}, r = s(t, ["config"]);
  return r != null && KA(e, r, o), o;
}
function YA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = s(e, ["_self"]);
  if (i != null) {
    let a = Hd(i);
    Array.isArray(a) && (a = a.map((u) => Li(u))), l(n, ["models"], a);
  }
  return n;
}
function XA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = s(e, ["_self"]);
  if (i != null) {
    let a = Hd(i);
    Array.isArray(a) && (a = a.map((u) => Ui(u))), l(n, ["models"], a);
  }
  return n;
}
function QA(e, t) {
  const n = {}, o = s(e, ["maskMode"]);
  o != null && l(n, ["maskMode"], o);
  const r = s(e, ["segmentationClasses"]);
  r != null && l(n, ["maskClasses"], r);
  const i = s(e, ["maskDilation"]);
  return i != null && l(n, ["dilation"], i), n;
}
function Li(e, t) {
  const n = {}, o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
  const r = s(e, ["displayName"]);
  r != null && l(n, ["displayName"], r);
  const i = s(e, ["description"]);
  i != null && l(n, ["description"], i);
  const a = s(e, ["version"]);
  a != null && l(n, ["version"], a);
  const u = s(e, ["_self"]);
  u != null && l(n, ["tunedModelInfo"], mT(u));
  const c = s(e, ["inputTokenLimit"]);
  c != null && l(n, ["inputTokenLimit"], c);
  const d = s(e, ["outputTokenLimit"]);
  d != null && l(n, ["outputTokenLimit"], d);
  const h = s(e, ["supportedGenerationMethods"]);
  h != null && l(n, ["supportedActions"], h);
  const f = s(e, ["temperature"]);
  f != null && l(n, ["temperature"], f);
  const p = s(e, ["maxTemperature"]);
  p != null && l(n, ["maxTemperature"], p);
  const m = s(e, ["topP"]);
  m != null && l(n, ["topP"], m);
  const g = s(e, ["topK"]);
  g != null && l(n, ["topK"], g);
  const _ = s(e, ["thinking"]);
  return _ != null && l(n, ["thinking"], _), n;
}
function Ui(e, t) {
  const n = {}, o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
  const r = s(e, ["displayName"]);
  r != null && l(n, ["displayName"], r);
  const i = s(e, ["description"]);
  i != null && l(n, ["description"], i);
  const a = s(e, ["versionId"]);
  a != null && l(n, ["version"], a);
  const u = s(e, ["deployedModels"]);
  if (u != null) {
    let p = u;
    Array.isArray(p) && (p = p.map((m) => cA(m))), l(n, ["endpoints"], p);
  }
  const c = s(e, ["labels"]);
  c != null && l(n, ["labels"], c);
  const d = s(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], gT(d));
  const h = s(e, ["defaultCheckpointId"]);
  h != null && l(n, ["defaultCheckpointId"], h);
  const f = s(e, ["checkpoints"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["checkpoints"], p);
  }
  return n;
}
function ZA(e, t) {
  const n = {}, o = s(e, ["mediaResolution"]);
  o != null && l(n, ["mediaResolution"], o);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(n, ["codeExecutionResult"], r);
  const i = s(e, ["executableCode"]);
  i != null && l(n, ["executableCode"], i);
  const a = s(e, ["fileData"]);
  a != null && l(n, ["fileData"], dA(a));
  const u = s(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], fA(u));
  const c = s(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = s(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], Uv(d));
  const h = s(e, ["text"]);
  h != null && l(n, ["text"], h);
  const f = s(e, ["thought"]);
  f != null && l(n, ["thought"], f);
  const p = s(e, ["thoughtSignature"]);
  p != null && l(n, ["thoughtSignature"], p);
  const m = s(e, ["videoMetadata"]);
  m != null && l(n, ["videoMetadata"], m);
  const g = s(e, ["toolCall"]);
  g != null && l(n, ["toolCall"], g);
  const _ = s(e, ["toolResponse"]);
  _ != null && l(n, ["toolResponse"], _);
  const y = s(e, ["partMetadata"]);
  return y != null && l(n, ["partMetadata"], y), n;
}
function jA(e, t) {
  const n = {}, o = s(e, ["mediaResolution"]);
  o != null && l(n, ["mediaResolution"], o);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(n, ["codeExecutionResult"], r);
  const i = s(e, ["executableCode"]);
  i != null && l(n, ["executableCode"], i);
  const a = s(e, ["fileData"]);
  a != null && l(n, ["fileData"], a);
  const u = s(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], u);
  const c = s(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = s(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], d);
  const h = s(e, ["text"]);
  h != null && l(n, ["text"], h);
  const f = s(e, ["thought"]);
  f != null && l(n, ["thought"], f);
  const p = s(e, ["thoughtSignature"]);
  p != null && l(n, ["thoughtSignature"], p);
  const m = s(e, ["videoMetadata"]);
  if (m != null && l(n, ["videoMetadata"], m), s(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (s(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (s(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return n;
}
function eT(e, t) {
  const n = {}, o = s(e, ["productImage"]);
  return o != null && l(n, ["image"], Ve(o)), n;
}
function tT(e, t, n) {
  const o = {}, r = s(e, ["numberOfImages"]);
  t !== void 0 && r != null && l(t, ["parameters", "sampleCount"], r);
  const i = s(e, ["baseSteps"]);
  t !== void 0 && i != null && l(t, ["parameters", "baseSteps"], i);
  const a = s(e, ["outputGcsUri"]);
  t !== void 0 && a != null && l(t, ["parameters", "storageUri"], a);
  const u = s(e, ["seed"]);
  t !== void 0 && u != null && l(t, ["parameters", "seed"], u);
  const c = s(e, ["safetyFilterLevel"]);
  t !== void 0 && c != null && l(t, ["parameters", "safetySetting"], c);
  const d = s(e, ["personGeneration"]);
  t !== void 0 && d != null && l(t, ["parameters", "personGeneration"], d);
  const h = s(e, ["addWatermark"]);
  t !== void 0 && h != null && l(t, ["parameters", "addWatermark"], h);
  const f = s(e, ["outputMimeType"]);
  t !== void 0 && f != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], f);
  const p = s(e, ["outputCompressionQuality"]);
  t !== void 0 && p != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], p);
  const m = s(e, ["enhancePrompt"]);
  t !== void 0 && m != null && l(t, ["parameters", "enhancePrompt"], m);
  const g = s(e, ["labels"]);
  return t !== void 0 && g != null && l(t, ["labels"], g), o;
}
function nT(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["source"]);
  i != null && rT(i, o);
  const a = s(t, ["config"]);
  return a != null && tT(a, o), o;
}
function oT(e, t) {
  const n = {}, o = s(e, ["predictions"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => xr(i))), l(n, ["generatedImages"], r);
  }
  return n;
}
function rT(e, t, n) {
  const o = {}, r = s(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = s(e, ["personImage"]);
  t !== void 0 && i != null && l(t, [
    "instances[0]",
    "personImage",
    "image"
  ], Ve(i));
  const a = s(e, ["productImages"]);
  if (t !== void 0 && a != null) {
    let u = a;
    Array.isArray(u) && (u = u.map((c) => eT(c))), l(t, ["instances[0]", "productImages"], u);
  }
  return o;
}
function iT(e, t) {
  const n = {}, o = s(e, ["referenceImage"]);
  o != null && l(n, ["referenceImage"], Ve(o));
  const r = s(e, ["referenceId"]);
  r != null && l(n, ["referenceId"], r);
  const i = s(e, ["referenceType"]);
  i != null && l(n, ["referenceType"], i);
  const a = s(e, ["maskImageConfig"]);
  a != null && l(n, ["maskImageConfig"], QA(a));
  const u = s(e, ["controlImageConfig"]);
  u != null && l(n, ["controlImageConfig"], Vv(u));
  const c = s(e, ["styleImageConfig"]);
  c != null && l(n, ["styleImageConfig"], c);
  const d = s(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function Zd(e, t) {
  const n = {}, o = s(e, ["safetyAttributes", "categories"]);
  o != null && l(n, ["categories"], o);
  const r = s(e, ["safetyAttributes", "scores"]);
  r != null && l(n, ["scores"], r);
  const i = s(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function jd(e, t) {
  const n = {}, o = s(e, ["safetyAttributes", "categories"]);
  o != null && l(n, ["categories"], o);
  const r = s(e, ["safetyAttributes", "scores"]);
  r != null && l(n, ["scores"], r);
  const i = s(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function sT(e, t) {
  const n = {}, o = s(e, ["category"]);
  if (o != null && l(n, ["category"], o), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = s(e, ["threshold"]);
  return r != null && l(n, ["threshold"], r), n;
}
function aT(e, t) {
  const n = {}, o = s(e, ["image"]);
  return o != null && l(n, ["image"], Ve(o)), n;
}
function lT(e, t, n) {
  const o = {}, r = s(e, ["mode"]);
  t !== void 0 && r != null && l(t, ["parameters", "mode"], r);
  const i = s(e, ["maxPredictions"]);
  t !== void 0 && i != null && l(t, ["parameters", "maxPredictions"], i);
  const a = s(e, ["confidenceThreshold"]);
  t !== void 0 && a != null && l(t, ["parameters", "confidenceThreshold"], a);
  const u = s(e, ["maskDilation"]);
  t !== void 0 && u != null && l(t, ["parameters", "maskDilation"], u);
  const c = s(e, ["binaryColorThreshold"]);
  t !== void 0 && c != null && l(t, ["parameters", "binaryColorThreshold"], c);
  const d = s(e, ["labels"]);
  return t !== void 0 && d != null && l(t, ["labels"], d), o;
}
function uT(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["source"]);
  i != null && dT(i, o);
  const a = s(t, ["config"]);
  return a != null && lT(a, o), o;
}
function cT(e, t) {
  const n = {}, o = s(e, ["predictions"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => DA(i))), l(n, ["generatedMasks"], r);
  }
  return n;
}
function dT(e, t, n) {
  const o = {}, r = s(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = s(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Ve(i));
  const a = s(e, ["scribbleImage"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "scribble"], aT(a)), o;
}
function fT(e, t) {
  const n = {}, o = s(e, ["retrievalConfig"]);
  o != null && l(n, ["retrievalConfig"], o);
  const r = s(e, ["functionCallingConfig"]);
  r != null && l(n, ["functionCallingConfig"], hA(r));
  const i = s(e, ["includeServerSideToolInvocations"]);
  return i != null && l(n, ["includeServerSideToolInvocations"], i), n;
}
function hT(e, t) {
  const n = {}, o = s(e, ["retrievalConfig"]);
  o != null && l(n, ["retrievalConfig"], o);
  const r = s(e, ["functionCallingConfig"]);
  if (r != null && l(n, ["functionCallingConfig"], r), s(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function pT(e, t) {
  const n = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const o = s(e, ["computerUse"]);
  o != null && l(n, ["computerUse"], o);
  const r = s(e, ["fileSearch"]);
  r != null && l(n, ["fileSearch"], r);
  const i = s(e, ["googleSearch"]);
  i != null && l(n, ["googleSearch"], BA(i));
  const a = s(e, ["googleMaps"]);
  a != null && l(n, ["googleMaps"], GA(a));
  const u = s(e, ["codeExecution"]);
  if (u != null && l(n, ["codeExecution"], u), s(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const c = s(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["functionDeclarations"], p);
  }
  const d = s(e, ["googleSearchRetrieval"]);
  if (d != null && l(n, ["googleSearchRetrieval"], d), s(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const h = s(e, ["urlContext"]);
  h != null && l(n, ["urlContext"], h);
  const f = s(e, ["mcpServers"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["mcpServers"], p);
  }
  return n;
}
function ef(e, t) {
  const n = {}, o = s(e, ["retrieval"]);
  o != null && l(n, ["retrieval"], o);
  const r = s(e, ["computerUse"]);
  if (r != null && l(n, ["computerUse"], r), s(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const i = s(e, ["googleSearch"]);
  i != null && l(n, ["googleSearch"], i);
  const a = s(e, ["googleMaps"]);
  a != null && l(n, ["googleMaps"], a);
  const u = s(e, ["codeExecution"]);
  u != null && l(n, ["codeExecution"], u);
  const c = s(e, ["enterpriseWebSearch"]);
  c != null && l(n, ["enterpriseWebSearch"], c);
  const d = s(e, ["functionDeclarations"]);
  if (d != null) {
    let m = d;
    Array.isArray(m) && (m = m.map((g) => pA(g))), l(n, ["functionDeclarations"], m);
  }
  const h = s(e, ["googleSearchRetrieval"]);
  h != null && l(n, ["googleSearchRetrieval"], h);
  const f = s(e, ["parallelAiSearch"]);
  f != null && l(n, ["parallelAiSearch"], f);
  const p = s(e, ["urlContext"]);
  if (p != null && l(n, ["urlContext"], p), s(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function mT(e, t) {
  const n = {}, o = s(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const r = s(e, ["createTime"]);
  r != null && l(n, ["createTime"], r);
  const i = s(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function gT(e, t) {
  const n = {}, o = s(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  o != null && l(n, ["baseModel"], o);
  const r = s(e, ["createTime"]);
  r != null && l(n, ["createTime"], r);
  const i = s(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function _T(e, t, n) {
  const o = {}, r = s(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const i = s(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const a = s(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), o;
}
function yT(e, t, n) {
  const o = {}, r = s(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const i = s(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const a = s(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), o;
}
function vT(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "name"], V(e, r));
  const i = s(t, ["config"]);
  return i != null && _T(i, o), o;
}
function AT(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["config"]);
  return i != null && yT(i, o), o;
}
function TT(e, t, n) {
  const o = {}, r = s(e, ["outputGcsUri"]);
  t !== void 0 && r != null && l(t, ["parameters", "storageUri"], r);
  const i = s(e, ["safetyFilterLevel"]);
  t !== void 0 && i != null && l(t, ["parameters", "safetySetting"], i);
  const a = s(e, ["personGeneration"]);
  t !== void 0 && a != null && l(t, ["parameters", "personGeneration"], a);
  const u = s(e, ["includeRaiReason"]);
  t !== void 0 && u != null && l(t, ["parameters", "includeRaiReason"], u);
  const c = s(e, ["outputMimeType"]);
  t !== void 0 && c != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], c);
  const d = s(e, ["outputCompressionQuality"]);
  t !== void 0 && d != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], d);
  const h = s(e, ["enhanceInputImage"]);
  t !== void 0 && h != null && l(t, [
    "parameters",
    "upscaleConfig",
    "enhanceInputImage"
  ], h);
  const f = s(e, ["imagePreservationFactor"]);
  t !== void 0 && f != null && l(t, [
    "parameters",
    "upscaleConfig",
    "imagePreservationFactor"
  ], f);
  const p = s(e, ["labels"]);
  t !== void 0 && p != null && l(t, ["labels"], p);
  const m = s(e, ["numberOfImages"]);
  t !== void 0 && m != null && l(t, ["parameters", "sampleCount"], m);
  const g = s(e, ["mode"]);
  return t !== void 0 && g != null && l(t, ["parameters", "mode"], g), o;
}
function ST(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["image"]);
  i != null && l(o, ["instances[0]", "image"], Ve(i));
  const a = s(t, ["upscaleFactor"]);
  a != null && l(o, [
    "parameters",
    "upscaleConfig",
    "upscaleFactor"
  ], a);
  const u = s(t, ["config"]);
  return u != null && TT(u, o), o;
}
function ET(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["predictions"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => xr(a))), l(n, ["generatedImages"], i);
  }
  return n;
}
function wT(e, t) {
  const n = {}, o = s(e, ["uri"]);
  o != null && l(n, ["uri"], o);
  const r = s(e, ["encodedVideo"]);
  r != null && l(n, ["videoBytes"], _t(r));
  const i = s(e, ["encoding"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function CT(e, t) {
  const n = {}, o = s(e, ["gcsUri"]);
  o != null && l(n, ["uri"], o);
  const r = s(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["videoBytes"], _t(r));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function IT(e, t) {
  const n = {}, o = s(e, ["image"]);
  o != null && l(n, ["_self"], Ve(o));
  const r = s(e, ["maskMode"]);
  return r != null && l(n, ["maskMode"], r), n;
}
function RT(e, t) {
  const n = {}, o = s(e, ["image"]);
  o != null && l(n, ["image"], Nr(o));
  const r = s(e, ["referenceType"]);
  return r != null && l(n, ["referenceType"], r), n;
}
function bT(e, t) {
  const n = {}, o = s(e, ["image"]);
  o != null && l(n, ["image"], Ve(o));
  const r = s(e, ["referenceType"]);
  return r != null && l(n, ["referenceType"], r), n;
}
function tf(e, t) {
  const n = {}, o = s(e, ["uri"]);
  o != null && l(n, ["uri"], o);
  const r = s(e, ["videoBytes"]);
  r != null && l(n, ["encodedVideo"], _t(r));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["encoding"], i), n;
}
function nf(e, t) {
  const n = {}, o = s(e, ["uri"]);
  o != null && l(n, ["gcsUri"], o);
  const r = s(e, ["videoBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], _t(r));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function PT(e, t) {
  const n = {}, o = s(e, ["displayName"]);
  return t !== void 0 && o != null && l(t, ["displayName"], o), n;
}
function MT(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && PT(n, t), t;
}
function xT(e, t) {
  const n = {}, o = s(e, ["force"]);
  return t !== void 0 && o != null && l(t, ["_query", "force"], o), n;
}
function NT(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const o = s(e, ["config"]);
  return o != null && xT(o, t), t;
}
function kT(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function DT(e, t) {
  const n = {}, o = s(e, ["customMetadata"]);
  if (t !== void 0 && o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["customMetadata"], i);
  }
  const r = s(e, ["chunkingConfig"]);
  return t !== void 0 && r != null && l(t, ["chunkingConfig"], r), n;
}
function $T(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = s(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = s(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], UT(a)), t;
}
function LT(e) {
  const t = {}, n = s(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const o = s(e, ["fileName"]);
  o != null && l(t, ["fileName"], o);
  const r = s(e, ["config"]);
  return r != null && DT(r, t), t;
}
function UT(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const r = s(e, ["documentName"]);
  return r != null && l(t, ["documentName"], r), t;
}
function FT(e, t) {
  const n = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = s(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function OT(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && FT(n, t), t;
}
function GT(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = s(e, ["fileSearchStores"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["fileSearchStores"], i);
  }
  return t;
}
function of(e, t) {
  const n = {}, o = s(e, ["mimeType"]);
  t !== void 0 && o != null && l(t, ["mimeType"], o);
  const r = s(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const i = s(e, ["customMetadata"]);
  if (t !== void 0 && i != null) {
    let u = i;
    Array.isArray(u) && (u = u.map((c) => c)), l(t, ["customMetadata"], u);
  }
  const a = s(e, ["chunkingConfig"]);
  return t !== void 0 && a != null && l(t, ["chunkingConfig"], a), n;
}
function BT(e) {
  const t = {}, n = s(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const o = s(e, ["config"]);
  return o != null && of(o, t), t;
}
function qT(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var HT = "Content-Type", VT = "X-Server-Timeout", JT = "User-Agent", Fi = "x-goog-api-client", KT = "google-genai-sdk/1.50.1", WT = "v1beta1", zT = "v1beta", YT = /* @__PURE__ */ new Set(["us", "eu"]), XT = 5, QT = [
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
    const r = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const i = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !i ? (r.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? r.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && YT.has(this.clientOptions.location) ? r.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (r.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), r.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : WT;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), r.apiVersion = (o = this.clientOptions.apiVersion) !== null && o !== void 0 ? o : zT, r.baseUrl = "https://generativelanguage.googleapis.com/";
    r.headers = this.getDefaultHeaders(), this.clientOptions.httpOptions = r, e.httpOptions && (this.clientOptions.httpOptions = this.patchHttpOptions(r, e.httpOptions));
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
    return !(t.baseUrl && t.baseUrlResourceScope === Ni.COLLECTION || this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
  }
  async request(e) {
    let t = this.clientOptions.httpOptions;
    e.httpOptions && (t = this.patchHttpOptions(this.clientOptions.httpOptions, e.httpOptions));
    const n = this.shouldPrependVertexProjectPath(e, t), o = this.constructUrl(e.path, t, n);
    if (e.queryParams) for (const [i, a] of Object.entries(e.queryParams)) o.searchParams.append(i, String(a));
    let r = {};
    if (e.httpMethod === "GET") {
      if (e.body && e.body !== "{}") throw new Error("Request body should be empty for GET request, but got non empty request body");
    } else r.body = e.body;
    return r = await this.includeExtraHttpOptionsToRequestInit(r, t, o.toString(), e.abortSignal), this.unaryApiCall(o, r, e.httpMethod);
  }
  patchHttpOptions(e, t) {
    const n = JSON.parse(JSON.stringify(e));
    for (const [o, r] of Object.entries(t)) typeof r == "object" ? n[o] = Object.assign(Object.assign({}, n[o]), r) : r !== void 0 && (n[o] = r);
    return n;
  }
  async requestStream(e) {
    let t = this.clientOptions.httpOptions;
    e.httpOptions && (t = this.patchHttpOptions(this.clientOptions.httpOptions, e.httpOptions));
    const n = this.shouldPrependVertexProjectPath(e, t), o = this.constructUrl(e.path, t, n);
    (!o.searchParams.has("alt") || o.searchParams.get("alt") !== "sse") && o.searchParams.set("alt", "sse");
    let r = {};
    return r.body = e.body, r = await this.includeExtraHttpOptionsToRequestInit(r, t, o.toString(), e.abortSignal), this.streamApiCall(o, r, e.httpMethod);
  }
  async includeExtraHttpOptionsToRequestInit(e, t, n, o) {
    if (t && t.timeout || o) {
      const r = new AbortController(), i = r.signal;
      if (t.timeout && t?.timeout > 0) {
        const a = setTimeout(() => r.abort(), t.timeout);
        a && typeof a.unref == "function" && a.unref();
      }
      o && o.addEventListener("abort", () => {
        r.abort();
      }), e.signal = i;
    }
    return t && t.extraBody !== null && jT(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await wu(o), new ki(o))).catch((o) => {
      throw o instanceof Error ? o : new Error(JSON.stringify(o));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await wu(o), this.processStreamResponse(o))).catch((o) => {
      throw o instanceof Error ? o : new Error(JSON.stringify(o));
    });
  }
  processStreamResponse(e) {
    return qe(this, arguments, function* () {
      var n;
      const o = (n = e?.body) === null || n === void 0 ? void 0 : n.getReader(), r = new TextDecoder("utf-8");
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
          const { done: c, value: d } = yield B(o.read());
          if (c) {
            if (i.trim().length > 0) throw new Error("Incomplete JSON segment at the end");
            break;
          }
          const h = r.decode(d, { stream: !0 });
          try {
            const m = JSON.parse(h);
            if ("error" in m) {
              const g = JSON.parse(JSON.stringify(m.error)), _ = g.status, y = g.code, E = `got status: ${_}. ${JSON.stringify(m)}`;
              if (y >= 400 && y < 600) throw new Yd({
                message: E,
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
                yield yield B(new ki(new Response(_, {
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
    const o = this.clientOptions.httpOptions.retryOptions, r = async () => {
      const i = await fetch(e, t);
      if (i.ok) return i;
      throw QT.includes(i.status) ? new Error(`Retryable HTTP Error: ${i.statusText}`) : new Xa.AbortError(`Non-retryable exception ${i.statusText} sending request`);
    };
    return (0, Xa.default)(r, { retries: ((n = o.attempts) !== null && n !== void 0 ? n : XT) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = KT + " " + this.clientOptions.userAgentExtra;
    return e[JT] = t, e[Fi] = t, e[HT] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [o, r] of Object.entries(e.headers)) n.append(o, r);
      e.timeout && e.timeout > 0 && n.append(VT, String(Math.ceil(e.timeout / 1e3)));
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
    const r = this.clientOptions.uploader, i = await r.stat(e);
    o.sizeBytes = String(i.size);
    const a = (n = t?.mimeType) !== null && n !== void 0 ? n : i.type;
    if (a === void 0 || a === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    o.mimeType = a;
    const u = { file: o }, c = this.getFileName(e), d = N("upload/v1beta/files", u._url), h = await this.fetchUploadUrl(d, o.sizeBytes, o.mimeType, c, u, t?.httpOptions);
    return r.upload(e, h, this);
  }
  async uploadFileToFileSearchStore(e, t, n) {
    var o;
    const r = this.clientOptions.uploader, i = await r.stat(t), a = String(i.size), u = (o = n?.mimeType) !== null && o !== void 0 ? o : i.type;
    if (u === void 0 || u === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    const c = `upload/v1beta/${e}:uploadToFileSearchStore`, d = this.getFileName(t), h = {};
    n != null && of(n, h);
    const f = await this.fetchUploadUrl(c, a, u, d, h, n?.httpOptions);
    return r.uploadToFileSearchStore(t, f, this);
  }
  async downloadFile(e) {
    await this.clientOptions.downloader.download(e, this);
  }
  async fetchUploadUrl(e, t, n, o, r, i) {
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
      body: JSON.stringify(r),
      httpMethod: "POST",
      httpOptions: u
    });
    if (!c || !c?.headers) throw new Error("Server did not return an HttpResponse or the returned HttpResponse did not have headers.");
    const d = (a = c?.headers) === null || a === void 0 ? void 0 : a["x-goog-upload-url"];
    if (d === void 0) throw new Error("Failed to get upload url. Server did not return the x-google-upload-url in the headers");
    return d;
  }
};
async function wu(e) {
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
    const r = JSON.stringify(o);
    throw n >= 400 && n < 600 ? new Yd({
      message: r,
      status: n
    }) : new Error(r);
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
      const d = a[c], h = u[c];
      d && typeof d == "object" && !Array.isArray(d) && h && typeof h == "object" && !Array.isArray(h) ? u[c] = o(h, d) : (h && d && typeof h != typeof d && console.warn(`includeExtraBodyToRequestInit:deepMerge: Type mismatch for key "${c}". Original type: ${typeof h}, New type: ${typeof d}. Overwriting.`), u[c] = d);
    }
    return u;
  }
  const r = o(n, t);
  e.body = JSON.stringify(r);
}
var eS = "mcp_used/unknown", tS = !1;
function rf(e) {
  for (const t of e)
    if (nS(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return tS;
}
function sf(e) {
  var t;
  e[Fi] = (((t = e[Fi]) !== null && t !== void 0 ? t : "") + ` ${eS}`).trimStart();
}
function nS(e) {
  return e !== null && typeof e == "object" && e instanceof rS;
}
function oS(e) {
  return qe(this, arguments, function* (n, o = 100) {
    let r, i = 0;
    for (; i < o; ) {
      const a = yield B(n.listTools({ cursor: r }));
      for (const u of a.tools)
        yield yield B(u), i++;
      if (!a.nextCursor) break;
      r = a.nextCursor;
    }
  });
}
var rS = class af {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new af(t, n);
  }
  async initialize() {
    var t, n, o, r;
    if (this.mcpTools.length > 0) return;
    const i = {}, a = [];
    for (const h of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, He(oS(h))), d; d = await c.next(), t = d.done, !t; u = !0) {
        r = d.value, u = !1;
        const f = r;
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
    return await this.initialize(), y_(this.mcpTools, this.config);
  }
  async callTool(t) {
    await this.initialize();
    const n = [];
    for (const o of t) if (o.name in this.functionNameToMcpClient) {
      const r = this.functionNameToMcpClient[o.name];
      let i;
      this.config.timeout && (i = { timeout: this.config.timeout });
      const a = await r.callTool({
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
async function iS(e, t, n) {
  const o = new u_();
  let r;
  n.data instanceof Blob ? r = JSON.parse(await n.data.text()) : r = JSON.parse(n.data), Object.assign(o, r), t(o);
}
var sS = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const o = this.apiClient.getWebsocketBaseUrl(), r = this.apiClient.getApiVersion(), i = uS(this.apiClient.getDefaultHeaders()), a = `${o}/ws/google.ai.generativelanguage.${r}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((_) => {
      u = _;
    }), d = e.callbacks, h = function() {
      u({});
    }, f = this.apiClient, p = {
      onopen: h,
      onmessage: (_) => {
        iS(f, d.onmessage, _);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(_) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(_) {
      }
    }, m = this.webSocketFactory.create(a, lS(i), p);
    m.connect(), await c;
    const g = { setup: { model: V(this.apiClient, e.model) } };
    return m.send(JSON.stringify(g)), new aS(m, this.apiClient);
  }
}, aS = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = wv(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = Ev(e);
    this.conn.send(JSON.stringify(t));
  }
  sendPlaybackControl(e) {
    const t = { playbackControl: e };
    this.conn.send(JSON.stringify(t));
  }
  play() {
    this.sendPlaybackControl(Wt.PLAY);
  }
  pause() {
    this.sendPlaybackControl(Wt.PAUSE);
  }
  stop() {
    this.sendPlaybackControl(Wt.STOP);
  }
  resetContext() {
    this.sendPlaybackControl(Wt.RESET_CONTEXT);
  }
  close() {
    this.conn.close();
  }
};
function lS(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function uS(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var cS = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function dS(e, t, n) {
  const o = new l_();
  let r;
  n.data instanceof Blob ? r = await n.data.text() : n.data instanceof ArrayBuffer ? r = new TextDecoder().decode(n.data) : r = n.data;
  const i = JSON.parse(r);
  if (e.isVertexAI()) {
    const a = Rv(i);
    Object.assign(o, a);
  } else Object.assign(o, i);
  t(o);
}
var fS = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new sS(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, o, r, i, a;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const h = this.apiClient.getHeaders();
    e.config && e.config.tools && rf(e.config.tools) && sf(h);
    const f = gS(h);
    if (this.apiClient.isVertexAI()) {
      const I = this.apiClient.getProject(), x = this.apiClient.getLocation(), F = this.apiClient.getApiKey(), H = !!I && !!x || !!F;
      this.apiClient.getCustomBaseUrl() && !H ? d = u : (d = `${u}/ws/google.cloud.aiplatform.${c}.LlmBidiService/BidiGenerateContent`, await this.auth.addAuthHeaders(f, d));
    } else {
      const I = this.apiClient.getApiKey();
      let x = "BidiGenerateContent", F = "key";
      I?.startsWith("auth_tokens/") && (console.warn("Warning: Ephemeral token support is experimental and may change in future versions."), c !== "v1alpha" && console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection."), x = "BidiGenerateContentConstrained", F = "access_token"), d = `${u}/ws/google.ai.generativelanguage.${c}.GenerativeService.${x}?${F}=${I}`;
    }
    let p = () => {
    };
    const m = new Promise((I) => {
      p = I;
    }), g = e.callbacks, _ = function() {
      var I;
      (I = g?.onopen) === null || I === void 0 || I.call(g), p({});
    }, y = this.apiClient, E = {
      onopen: _,
      onmessage: (I) => {
        dS(y, g.onmessage, I);
      },
      onerror: (t = g?.onerror) !== null && t !== void 0 ? t : function(I) {
      },
      onclose: (n = g?.onclose) !== null && n !== void 0 ? n : function(I) {
      }
    }, w = this.webSocketFactory.create(d, mS(f), E);
    w.connect(), await m;
    let C = V(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && C.startsWith("publishers/")) {
      const I = this.apiClient.getProject(), x = this.apiClient.getLocation();
      I && x && (C = `projects/${I}/locations/${x}/` + C);
    }
    let P = {};
    this.apiClient.isVertexAI() && ((o = e.config) === null || o === void 0 ? void 0 : o.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [cr.AUDIO] } : e.config.responseModalities = [cr.AUDIO]), !((r = e.config) === null || r === void 0) && r.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    const M = (a = (i = e.config) === null || i === void 0 ? void 0 : i.tools) !== null && a !== void 0 ? a : [], A = [];
    for (const I of M) if (this.isCallableTool(I)) {
      const x = I;
      A.push(await x.tool());
    } else A.push(I);
    A.length > 0 && (e.config.tools = A);
    const $ = {
      model: C,
      config: e.config,
      callbacks: e.callbacks
    };
    return this.apiClient.isVertexAI() ? P = Sv(this.apiClient, $) : P = Tv(this.apiClient, $), delete P.config, w.send(JSON.stringify(P)), new pS(w, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, hS = { turnComplete: !0 }, pS = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let n = [];
      try {
        n = _e(t.turns), e.isVertexAI() || (n = n.map((o) => po(o)));
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
      if (!e.isVertexAI() && !("id" in o)) throw new Error(cS);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, hS), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: Iv(e) } : t = { realtimeInput: Cv(e) }, this.conn.send(JSON.stringify(t));
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
function mS(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function gS(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var Cu = 10;
function Iu(e) {
  var t, n, o;
  if (!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.disable) return !0;
  let r = !1;
  for (const a of (n = e?.tools) !== null && n !== void 0 ? n : []) if (en(a)) {
    r = !0;
    break;
  }
  if (!r) return !0;
  const i = (o = e?.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls;
  return i && (i < 0 || !Number.isInteger(i)) || i == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", i), !0) : !1;
}
function en(e) {
  return "callTool" in e && typeof e.callTool == "function";
}
function _S(e) {
  var t, n, o;
  return (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((r) => en(r))) !== null && o !== void 0 ? o : !1;
}
function Ru(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((o, r) => {
    if (en(o)) return;
    const i = o;
    i.functionDeclarations && i.functionDeclarations.length > 0 && n.push(r);
  }), n;
}
function bu(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var yS = class extends ot {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = _e(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = _e(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const o = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: dr.EMBED_CONTENT
        });
        return await this.embedContentInternal(o);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: dr.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, o, r, i, a;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !_S(t) || Iu(t.config)) return await this.generateContentInternal(u);
      const c = Ru(t);
      if (c.length > 0) {
        const g = c.map((_) => `tools[${_}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${g}.`);
      }
      let d, h;
      const f = _e(u.contents), p = (r = (o = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls) !== null && r !== void 0 ? r : Cu;
      let m = 0;
      for (; m < p && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const g = d.candidates[0].content, _ = [];
        for (const y of (a = (i = t.config) === null || i === void 0 ? void 0 : i.tools) !== null && a !== void 0 ? a : []) if (en(y)) {
          const E = await y.callTool(d.functionCalls);
          _.push(...E);
        }
        m++, h = {
          role: "user",
          parts: _
        }, u.contents = _e(u.contents), u.contents.push(g), u.contents.push(h), bu(u.config) && (f.push(g), f.push(h));
      }
      return bu(u.config) && (d.automaticFunctionCallingHistory = f), d;
    }, this.generateContentStream = async (t) => {
      var n, o, r, i, a;
      if (this.maybeMoveToResponseJsonSchem(t), Iu(t.config)) {
        const h = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(h);
      }
      const u = Ru(t);
      if (u.length > 0) {
        const h = u.map((f) => `tools[${f}]`).join(", ");
        throw new Error(`Incompatible tools found at ${h}. Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations" is not yet supported.`);
      }
      const c = (r = (o = (n = t?.config) === null || n === void 0 ? void 0 : n.toolConfig) === null || o === void 0 ? void 0 : o.functionCallingConfig) === null || r === void 0 ? void 0 : r.streamFunctionCallArguments, d = (a = (i = t?.config) === null || i === void 0 ? void 0 : i.automaticFunctionCalling) === null || a === void 0 ? void 0 : a.disable;
      if (c && !d) throw new Error("Running in streaming mode with 'streamFunctionCallArguments' enabled, this feature is not compatible with automatic function calling (AFC). Please set 'config.automaticFunctionCalling.disable' to true to disable AFC or leave 'config.toolConfig.functionCallingConfig.streamFunctionCallArguments' to be undefined or set to false to disable streaming function call arguments feature.");
      return await this.processAfcStream(t);
    }, this.generateImages = async (t) => await this.generateImagesInternal(t).then((n) => {
      var o;
      let r;
      const i = [];
      if (n?.generatedImages) for (const u of n.generatedImages) u && u?.safetyAttributes && ((o = u?.safetyAttributes) === null || o === void 0 ? void 0 : o.contentType) === "Positive Prompt" ? r = u?.safetyAttributes : i.push(u);
      let a;
      return r ? a = {
        generatedImages: i,
        positivePromptSafetyAttributes: r,
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
      return new Dt(nt.PAGED_ITEM_MODELS, (r) => this.listInternal(r), await this.listInternal(o), o);
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
      var n, o, r, i, a, u;
      if ((t.prompt || t.image || t.video) && t.source) throw new Error("Source and prompt/image/video are mutually exclusive. Please only use source.");
      return this.apiClient.isVertexAI() || (!((n = t.video) === null || n === void 0) && n.uri && (!((o = t.video) === null || o === void 0) && o.videoBytes) ? t.video = {
        uri: t.video.uri,
        mimeType: t.video.mimeType
      } : !((i = (r = t.source) === null || r === void 0 ? void 0 : r.video) === null || i === void 0) && i.uri && (!((u = (a = t.source) === null || a === void 0 ? void 0 : a.video) === null || u === void 0) && u.videoBytes) && (t.source.video = {
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
    const r = (t = e.config) === null || t === void 0 ? void 0 : t.tools;
    if (!r) return e;
    const i = await Promise.all(r.map(async (u) => en(u) ? await u.tool() : u)), a = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: i })
    };
    if (a.config.tools = i, e.config && e.config.tools && rf(e.config.tools)) {
      const u = (o = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && o !== void 0 ? o : {};
      let c = Object.assign({}, u);
      Object.keys(c).length === 0 && (c = this.apiClient.getDefaultHeaders()), sf(c), a.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: c });
    }
    return a;
  }
  async initAfcToolsMap(e) {
    var t, n, o;
    const r = /* @__PURE__ */ new Map();
    for (const i of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (en(i)) {
      const a = i, u = await a.tool();
      for (const c of (o = u.functionDeclarations) !== null && o !== void 0 ? o : []) {
        if (!c.name) throw new Error("Function declaration name is required.");
        if (r.has(c.name)) throw new Error(`Duplicate tool declaration name: ${c.name}`);
        r.set(c.name, a);
      }
    }
    return r;
  }
  async processAfcStream(e) {
    var t, n, o;
    const r = (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && o !== void 0 ? o : Cu;
    let i = !1, a = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, h) {
      return qe(this, arguments, function* () {
        for (var f, p, m, g, _, y; a < r; ) {
          i && (a++, i = !1);
          const P = yield B(c.processParamsMaybeAddMcpUsage(h)), M = yield B(c.generateContentStreamInternal(P)), A = [], $ = [];
          try {
            for (var E = !0, w = (p = void 0, He(M)), C; C = yield B(w.next()), f = C.done, !f; E = !0) {
              g = C.value, E = !1;
              const I = g;
              if (yield yield B(I), I.candidates && (!((_ = I.candidates[0]) === null || _ === void 0) && _.content)) {
                $.push(I.candidates[0].content);
                for (const x of (y = I.candidates[0].content.parts) !== null && y !== void 0 ? y : []) if (a < r && x.functionCall) {
                  if (!x.functionCall.name) throw new Error("Function call name was not returned by the model.");
                  if (d.has(x.functionCall.name)) {
                    const F = yield B(d.get(x.functionCall.name).callTool([x.functionCall]));
                    A.push(...F);
                  } else
                    throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${d.keys()}, mising tool: ${x.functionCall.name}`);
                }
              }
            }
          } catch (I) {
            p = { error: I };
          } finally {
            try {
              !E && !f && (m = w.return) && (yield B(m.call(w)));
            } finally {
              if (p) throw p.error;
            }
          }
          if (A.length > 0) {
            i = !0;
            const I = new Rn();
            I.candidates = [{ content: {
              role: "user",
              parts: A
            } }], yield yield B(I);
            const x = [];
            x.push(...$), x.push({
              role: "user",
              parts: A
            }), h.contents = _e(h.contents).concat(x);
          } else break;
        }
      });
    })(this, u, e);
  }
  async generateContentInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Tu(this.apiClient, e);
      return a = N("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = Eu(d), f = new Rn();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Au(this.apiClient, e);
      return a = N("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = Su(d), f = new Rn();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Tu(this.apiClient, e);
      return a = N("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }), i.then(function(d) {
        return qe(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var g = !0, _ = He(d), y; y = yield B(_.next()), h = y.done, !h; g = !0) {
              m = y.value, g = !1;
              const E = m, w = Eu(yield B(E.json()), e);
              w.sdkHttpResponse = { headers: E.headers };
              const C = new Rn();
              Object.assign(C, w), yield yield B(C);
            }
          } catch (E) {
            f = { error: E };
          } finally {
            try {
              !g && !h && (p = _.return) && (yield B(p.call(_)));
            } finally {
              if (f) throw f.error;
            }
          }
        });
      });
    } else {
      const c = Au(this.apiClient, e);
      return a = N("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }), i.then(function(d) {
        return qe(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var g = !0, _ = He(d), y; y = yield B(_.next()), h = y.done, !h; g = !0) {
              m = y.value, g = !1;
              const E = m, w = Su(yield B(E.json()), e);
              w.sdkHttpResponse = { headers: E.headers };
              const C = new Rn();
              Object.assign(C, w), yield yield B(C);
            }
          } catch (E) {
            f = { error: E };
          } finally {
            try {
              !g && !h && (p = _.return) && (yield B(p.call(_)));
            } finally {
              if (f) throw f.error;
            }
          }
        });
      });
    }
  }
  async embedContentInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = aA(this.apiClient, e, e);
      return a = N(A_(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = uA(d, e), f = new eu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = sA(this.apiClient, e);
      return a = N("{model}:batchEmbedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = lA(d), f = new eu();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = AA(this.apiClient, e);
      return a = N("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = SA(d), f = new tu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = vA(this.apiClient, e);
      return a = N("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = TA(d), f = new tu();
        return Object.assign(f, h), f;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = nA(this.apiClient, e);
      return r = N("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = oA(u), d = new Yg();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = ST(this.apiClient, e);
      return r = N("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = ET(u), d = new Xg();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = nT(this.apiClient, e);
      return r = N("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = oT(u), d = new Qg();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = uT(this.apiClient, e);
      return r = N("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = cT(u), d = new Zg();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = OA(this.apiClient, e);
      return a = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Ui(d));
    } else {
      const c = FA(this.apiClient, e);
      return a = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => Li(d));
    }
  }
  async listInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = zA(this.apiClient, e);
      return a = N("{models_url}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = XA(d), f = new nu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = WA(this.apiClient, e);
      return a = N("{models_url}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = YA(d), f = new nu();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = AT(this.apiClient, e);
      return a = N("{model}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Ui(d));
    } else {
      const c = vT(this.apiClient, e);
      return a = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => Li(d));
    }
  }
  async delete(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Zv(this.apiClient, e);
      return a = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = eA(d), f = new ou();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Qv(this.apiClient, e);
      return a = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = jv(d), f = new ou();
        return Object.assign(f, h), f;
      });
    }
  }
  async countTokens(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = zv(this.apiClient, e);
      return a = N("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = Xv(d), f = new ru();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Wv(this.apiClient, e);
      return a = N("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = Yv(d), f = new ru();
        return Object.assign(f, h), f;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = Gv(this.apiClient, e);
      return r = N("{model}:computeTokens", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = Bv(u), d = new jg();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = bA(this.apiClient, e);
      return a = N("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const h = IA(d), f = new iu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = RA(this.apiClient, e);
      return a = N("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const h = CA(d), f = new iu();
        return Object.assign(f, h), f;
      });
    }
  }
}, vS = class extends ot {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async getVideosOperation(e) {
    const t = e.operation, n = e.config;
    if (t.name === void 0 || t.name === "") throw new Error("Operation name is required.");
    if (this.apiClient.isVertexAI()) {
      const o = t.name.split("/operations/")[0];
      let r;
      n && "httpOptions" in n && (r = n.httpOptions);
      const i = await this.fetchPredictVideosOperationInternal({
        operationName: t.name,
        resourceName: o,
        config: { httpOptions: r }
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
      let r;
      n && "httpOptions" in n && (r = n.httpOptions);
      const i = await this.fetchPredictVideosOperationInternal({
        operationName: t.name,
        resourceName: o,
        config: { httpOptions: r }
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
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Hg(e);
      return a = N("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i;
    } else {
      const c = qg(e);
      return a = N("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i;
    }
  }
  async fetchPredictVideosOperationInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = $g(e);
      return r = N("{resourceName}:fetchPredictOperation", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o;
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
};
function Pu(e) {
  const t = {};
  if (s(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function AS(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function TS(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function SS(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => xS(i))), l(t, ["parts"], r);
  }
  const o = s(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function ES(e, t, n) {
  const o = {}, r = s(t, ["expireTime"]);
  n !== void 0 && r != null && l(n, ["expireTime"], r);
  const i = s(t, ["newSessionExpireTime"]);
  n !== void 0 && i != null && l(n, ["newSessionExpireTime"], i);
  const a = s(t, ["uses"]);
  n !== void 0 && a != null && l(n, ["uses"], a);
  const u = s(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && l(n, ["bidiGenerateContentSetup"], MS(e, u));
  const c = s(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && l(n, ["fieldMask"], c), o;
}
function wS(e, t) {
  const n = {}, o = s(t, ["config"]);
  return o != null && l(n, ["config"], ES(e, o, n)), n;
}
function CS(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function IS(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = s(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = s(e, ["name"]);
  if (r != null && l(t, ["name"], r), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function RS(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], AS(n));
  const o = s(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function bS(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = s(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function PS(e, t) {
  const n = {}, o = s(e, ["generationConfig"]);
  t !== void 0 && o != null && l(t, ["setup", "generationConfig"], o);
  const r = s(e, ["responseModalities"]);
  t !== void 0 && r != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], r);
  const i = s(e, ["temperature"]);
  t !== void 0 && i != null && l(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], i);
  const a = s(e, ["topP"]);
  t !== void 0 && a != null && l(t, [
    "setup",
    "generationConfig",
    "topP"
  ], a);
  const u = s(e, ["topK"]);
  t !== void 0 && u != null && l(t, [
    "setup",
    "generationConfig",
    "topK"
  ], u);
  const c = s(e, ["maxOutputTokens"]);
  t !== void 0 && c != null && l(t, [
    "setup",
    "generationConfig",
    "maxOutputTokens"
  ], c);
  const d = s(e, ["mediaResolution"]);
  t !== void 0 && d != null && l(t, [
    "setup",
    "generationConfig",
    "mediaResolution"
  ], d);
  const h = s(e, ["seed"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], h);
  const f = s(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], Ms(f));
  const p = s(e, ["thinkingConfig"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], p);
  const m = s(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const g = s(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], SS(re(g)));
  const _ = s(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let I = sn(_);
    Array.isArray(I) && (I = I.map((x) => DS(rn(x)))), l(t, ["setup", "tools"], I);
  }
  const y = s(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], kS(y));
  const E = s(e, ["inputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "inputAudioTranscription"], Pu(E));
  const w = s(e, ["outputAudioTranscription"]);
  t !== void 0 && w != null && l(t, ["setup", "outputAudioTranscription"], Pu(w));
  const C = s(e, ["realtimeInputConfig"]);
  t !== void 0 && C != null && l(t, ["setup", "realtimeInputConfig"], C);
  const P = s(e, ["contextWindowCompression"]);
  t !== void 0 && P != null && l(t, ["setup", "contextWindowCompression"], P);
  const M = s(e, ["proactivity"]);
  if (t !== void 0 && M != null && l(t, ["setup", "proactivity"], M), s(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const A = s(e, ["avatarConfig"]);
  t !== void 0 && A != null && l(t, ["setup", "avatarConfig"], A);
  const $ = s(e, ["safetySettings"]);
  if (t !== void 0 && $ != null) {
    let I = $;
    Array.isArray(I) && (I = I.map((x) => NS(x))), l(t, ["setup", "safetySettings"], I);
  }
  return n;
}
function MS(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["setup", "model"], V(e, o));
  const r = s(t, ["config"]);
  return r != null && l(n, ["config"], PS(r, n)), n;
}
function xS(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = s(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = s(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], CS(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], IS(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], TS(c));
  const d = s(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = s(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = s(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = s(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = s(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = s(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = s(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function NS(e) {
  const t = {}, n = s(e, ["category"]);
  if (n != null && l(t, ["category"], n), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = s(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function kS(e) {
  const t = {}, n = s(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), s(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function DS(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = s(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = s(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], bS(r));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], RS(i));
  const a = s(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), s(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = s(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const c = s(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), s(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = s(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = s(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
function $S(e) {
  const t = [];
  for (const n in e) if (Object.prototype.hasOwnProperty.call(e, n)) {
    const o = e[n];
    if (typeof o == "object" && o != null && Object.keys(o).length > 0) {
      const r = Object.keys(o).map((i) => `${n}.${i}`);
      t.push(...r);
    } else t.push(n);
  }
  return t.join(",");
}
function LS(e, t) {
  let n = null;
  const o = e.bidiGenerateContentSetup;
  if (typeof o == "object" && o !== null && "setup" in o) {
    const i = o.setup;
    typeof i == "object" && i !== null ? (e.bidiGenerateContentSetup = i, n = i) : delete e.bidiGenerateContentSetup;
  } else o !== void 0 && delete e.bidiGenerateContentSetup;
  const r = e.fieldMask;
  if (n) {
    const i = $S(n);
    if (Array.isArray(t?.lockAdditionalFields) && t?.lockAdditionalFields.length === 0) i ? e.fieldMask = i : delete e.fieldMask;
    else if (t?.lockAdditionalFields && t.lockAdditionalFields.length > 0 && r !== null && Array.isArray(r) && r.length > 0) {
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
      r.length > 0 && (u = r.map((d) => a.includes(d) ? `generationConfig.${d}` : d));
      const c = [];
      i && c.push(i), u.length > 0 && c.push(...u), c.length > 0 ? e.fieldMask = c.join(",") : delete e.fieldMask;
    } else delete e.fieldMask;
  } else r !== null && Array.isArray(r) && r.length > 0 ? e.fieldMask = r.join(",") : delete e.fieldMask;
  return e;
}
var US = class extends ot {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const a = wS(this.apiClient, e);
      r = N("auth_tokens", a._url), i = a._query, delete a.config, delete a._url, delete a._query;
      const u = LS(a, e.config);
      return o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json()), o.then((c) => c);
    }
  }
};
function FS(e, t) {
  const n = {}, o = s(e, ["force"]);
  return t !== void 0 && o != null && l(t, ["_query", "force"], o), n;
}
function OS(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const o = s(e, ["config"]);
  return o != null && FS(o, t), t;
}
function GS(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function BS(e, t) {
  const n = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = s(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function qS(e) {
  const t = {}, n = s(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const o = s(e, ["config"]);
  return o != null && BS(o, t), t;
}
function HS(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = s(e, ["documents"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["documents"], i);
  }
  return t;
}
var VS = class extends ot {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new Dt(nt.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = GS(e);
      return r = N("{name}", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
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
    let o = "", r = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const i = OS(e);
      o = N("{name}", i._url), r = i._query, delete i._url, delete i._query, await this.apiClient.request({
        path: o,
        queryParams: r,
        body: JSON.stringify(i),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = qS(e);
      return r = N("{parent}/documents", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = HS(u), d = new e_();
        return Object.assign(d, c), d;
      });
    }
  }
}, JS = class extends ot {
  constructor(e, t = new VS(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new Dt(nt.PAGED_ITEM_FILE_SEARCH_STORES, (o) => this.listInternal(o), await this.listInternal(n), n);
  }
  async uploadToFileSearchStore(e) {
    if (this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support uploading files to a file search store.");
    return this.apiClient.uploadFileToFileSearchStore(e.fileSearchStoreName, e.file, e.config);
  }
  async create(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = MT(e);
      return r = N("fileSearchStores", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
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
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = kT(e);
      return r = N("{name}", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
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
    let o = "", r = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const i = NT(e);
      o = N("{name}", i._url), r = i._query, delete i._url, delete i._query, await this.apiClient.request({
        path: o,
        queryParams: r,
        body: JSON.stringify(i),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = OT(e);
      return r = N("fileSearchStores", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
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
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = BT(e);
      return r = N("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
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
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = LT(e);
      return r = N("{file_search_store_name}:importFile", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = $T(u), d = new o_();
        return Object.assign(d, c), d;
      });
    }
  }
}, lf = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return lf = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
}, KS = () => lf();
function Oi(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Gi = (e) => {
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
}, Ne = class extends Error {
}, De = class Bi extends Ne {
  constructor(t, n, o, r) {
    super(`${Bi.makeMessage(t, n, o)}`), this.status = t, this.headers = r, this.error = n;
  }
  static makeMessage(t, n, o) {
    const r = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && r ? `${t} ${r}` : t ? `${t} status code (no body)` : r || "(no status code or body)";
  }
  static generate(t, n, o, r) {
    if (!t || !r) return new kr({
      message: o,
      cause: Gi(n)
    });
    const i = n;
    return t === 400 ? new cf(t, i, o, r) : t === 401 ? new df(t, i, o, r) : t === 403 ? new ff(t, i, o, r) : t === 404 ? new hf(t, i, o, r) : t === 409 ? new pf(t, i, o, r) : t === 422 ? new mf(t, i, o, r) : t === 429 ? new gf(t, i, o, r) : t >= 500 ? new _f(t, i, o, r) : new Bi(t, i, o, r);
  }
}, qi = class extends De {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, kr = class extends De {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, uf = class extends kr {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, cf = class extends De {
}, df = class extends De {
}, ff = class extends De {
}, hf = class extends De {
}, pf = class extends De {
}, mf = class extends De {
}, gf = class extends De {
}, _f = class extends De {
}, WS = /^[a-z][a-z0-9+.-]*:/i, zS = (e) => WS.test(e), Hi = (e) => (Hi = Array.isArray, Hi(e)), Mu = Hi;
function xu(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function YS(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var XS = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new Ne(`${e} must be an integer`);
  if (t < 0) throw new Ne(`${e} must be a positive integer`);
  return t;
}, QS = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, ZS = (e) => new Promise((t) => setTimeout(t, e));
function jS() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function yf(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function eE(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return yf({
    start() {
    },
    async pull(n) {
      const { done: o, value: r } = await t.next();
      o ? n.close() : n.enqueue(r);
    },
    async cancel() {
      var n;
      await ((n = t.return) === null || n === void 0 ? void 0 : n.call(t));
    }
  });
}
function vf(e) {
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
async function tE(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const o = e.getReader(), r = o.cancel();
  o.releaseLock(), await r;
}
var nE = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function oE(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new Ne(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var rE = "0.0.1", Af = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function si(e, t, n) {
  return Af(), new File(e, t ?? "unknown_file", n);
}
function iE(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var sE = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Tf = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", aE = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Tf(e), lE = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function uE(e, t, n) {
  if (Af(), e = await e, aE(e))
    return e instanceof File ? e : si([await e.arrayBuffer()], e.name);
  if (lE(e)) {
    const r = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), si(await Vi(r), t, n);
  }
  const o = await Vi(e);
  if (t || (t = iE(e)), !n?.type) {
    const r = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof r == "string" && (n = Object.assign(Object.assign({}, n), { type: r }));
  }
  return si(o, t, n);
}
async function Vi(e) {
  var t, n, o, r, i;
  let a = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) a.push(e);
  else if (Tf(e)) a.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (sE(e)) try {
    for (var u = !0, c = He(e), d; d = await c.next(), t = d.done, !t; u = !0) {
      r = d.value, u = !1;
      const h = r;
      a.push(...await Vi(h));
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
    throw new Error(`Unexpected data type: ${typeof e}${h ? `; constructor: ${h}` : ""}${cE(e)}`);
  }
  return a;
}
function cE(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var xs = class {
  constructor(e) {
    this._client = e;
  }
};
xs._key = [];
function Sf(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Nu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), dE = (e = Sf) => (function(n, ...o) {
  if (n.length === 1) return n[0];
  let r = !1;
  const i = [], a = n.reduce((h, f, p) => {
    var m, g, _;
    /[?#]/.test(f) && (r = !0);
    const y = o[p];
    let E = (r ? encodeURIComponent : e)("" + y);
    return p !== o.length && (y == null || typeof y == "object" && y.toString === ((_ = Object.getPrototypeOf((g = Object.getPrototypeOf((m = y.hasOwnProperty) !== null && m !== void 0 ? m : Nu)) !== null && g !== void 0 ? g : Nu)) === null || _ === void 0 ? void 0 : _.toString)) && (E = y + "", i.push({
      start: h.length + f.length,
      length: E.length,
      error: `Value of type ${Object.prototype.toString.call(y).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === o.length ? "" : E);
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
    throw new Ne(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}), Fe = /* @__PURE__ */ dE(Sf), Ef = class extends xs {
  create(e, t) {
    var n;
    const { api_version: o = this._client.apiVersion } = e, r = pt(e, ["api_version"]);
    if ("model" in r && "agent_config" in r) throw new Ne("Invalid request: specified `model` and `agent_config`. If specifying `model`, use `generation_config`.");
    if ("agent" in r && "generation_config" in r) throw new Ne("Invalid request: specified `agent` and `generation_config`. If specifying `agent`, use `agent_config`.");
    return this._client.post(Fe`/${o}/interactions`, Object.assign(Object.assign({ body: r }, t), { stream: (n = e.stream) !== null && n !== void 0 ? n : !1 }));
  }
  delete(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.delete(Fe`/${o}/interactions/${e}`, n);
  }
  cancel(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.post(Fe`/${o}/interactions/${e}/cancel`, n);
  }
  get(e, t = {}, n) {
    var o;
    const r = t ?? {}, { api_version: i = this._client.apiVersion } = r, a = pt(r, ["api_version"]);
    return this._client.get(Fe`/${i}/interactions/${e}`, Object.assign(Object.assign({ query: a }, n), { stream: (o = t?.stream) !== null && o !== void 0 ? o : !1 }));
  }
};
Ef._key = Object.freeze(["interactions"]);
var wf = class extends Ef {
}, Cf = class extends xs {
  create(e, t) {
    const { api_version: n = this._client.apiVersion, webhook_id: o } = e, r = pt(e, ["api_version", "webhook_id"]);
    return this._client.post(Fe`/${n}/webhooks`, Object.assign({
      query: { webhook_id: o },
      body: r
    }, t));
  }
  update(e, t, n) {
    const { api_version: o = this._client.apiVersion, update_mask: r } = t, i = pt(t, ["api_version", "update_mask"]);
    return this._client.patch(Fe`/${o}/webhooks/${e}`, Object.assign({
      query: { update_mask: r },
      body: i
    }, n));
  }
  list(e = {}, t) {
    const n = e ?? {}, { api_version: o = this._client.apiVersion } = n, r = pt(n, ["api_version"]);
    return this._client.get(Fe`/${o}/webhooks`, Object.assign({ query: r }, t));
  }
  delete(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.delete(Fe`/${o}/webhooks/${e}`, n);
  }
  get(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.get(Fe`/${o}/webhooks/${e}`, n);
  }
  ping(e, t = void 0, n) {
    const { api_version: o = this._client.apiVersion, body: r } = t ?? {};
    return this._client.post(Fe`/${o}/webhooks/${e}:ping`, Object.assign({ body: r }, n));
  }
  rotateSigningSecret(e, t = {}, n) {
    const o = t ?? {}, { api_version: r = this._client.apiVersion } = o, i = pt(o, ["api_version"]);
    return this._client.post(Fe`/${r}/webhooks/${e}:rotateSigningSecret`, Object.assign({ body: i }, n));
  }
};
Cf._key = Object.freeze(["webhooks"]);
var If = class extends Cf {
};
function fE(e) {
  let t = 0;
  for (const r of e) t += r.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const r of e)
    n.set(r, o), o += r.length;
  return n;
}
var Uo;
function Ns(e) {
  let t;
  return (Uo ?? (t = new globalThis.TextEncoder(), Uo = t.encode.bind(t)))(e);
}
var Fo;
function ku(e) {
  let t;
  return (Fo ?? (t = new globalThis.TextDecoder(), Fo = t.decode.bind(t)))(e);
}
var Dr = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Ns(e) : e;
    this.buffer = fE([this.buffer, n]);
    const o = [];
    let r;
    for (; (r = hE(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (r.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = r.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (r.index !== this.carriageReturnIndex + 1 || r.carriage)) {
        o.push(ku(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const i = this.carriageReturnIndex !== null ? r.preceding - 1 : r.preceding, a = ku(this.buffer.subarray(0, i));
      o.push(a), this.buffer = this.buffer.subarray(r.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), o;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
Dr.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Dr.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function hE(e, t) {
  const r = t ?? 0, i = e.indexOf(10, r), a = e.indexOf(13, r);
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
var hr = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Du = (e, t, n) => {
  if (e) {
    if (YS(hr, e)) return e;
    he(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(hr))}`);
  }
};
function Dn() {
}
function Oo(e, t, n) {
  return !t || hr[e] > hr[n] ? Dn : t[e].bind(t);
}
var pE = {
  error: Dn,
  warn: Dn,
  info: Dn,
  debug: Dn
}, $u = /* @__PURE__ */ new WeakMap();
function he(e) {
  var t;
  const n = e.logger, o = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return pE;
  const r = $u.get(n);
  if (r && r[0] === o) return r[1];
  const i = {
    error: Oo("error", n, o),
    warn: Oo("warn", n, o),
    info: Oo("info", n, o),
    debug: Oo("debug", n, o)
  };
  return $u.set(n, [o, i]), i;
}
var Et = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), mE = class $n {
  constructor(t, n, o) {
    this.iterator = t, this.controller = n, this.client = o;
  }
  static fromSSEResponse(t, n, o) {
    let r = !1;
    const i = o ? he(o) : console;
    function a() {
      return qe(this, arguments, function* () {
        var c, d, h, f;
        if (r) throw new Ne("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        r = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = He(gE(t, n)), _; _ = yield B(g.next()), c = _.done, !c; m = !0) {
              f = _.value, m = !1;
              const y = f;
              if (!p)
                if (y.data.startsWith("[DONE]")) {
                  p = !0;
                  continue;
                } else try {
                  yield yield B(JSON.parse(y.data));
                } catch (E) {
                  throw i.error("Could not parse message into JSON:", y.data), i.error("From chunk:", y.raw), E;
                }
            }
          } catch (y) {
            d = { error: y };
          } finally {
            try {
              !m && !c && (h = g.return) && (yield B(h.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (y) {
          if (Oi(y)) return yield B(void 0);
          throw y;
        } finally {
          p || n.abort();
        }
      });
    }
    return new $n(a, n, o);
  }
  static fromReadableStream(t, n, o) {
    let r = !1;
    function i() {
      return qe(this, arguments, function* () {
        var c, d, h, f;
        const p = new Dr(), m = vf(t);
        try {
          for (var g = !0, _ = He(m), y; y = yield B(_.next()), c = y.done, !c; g = !0) {
            f = y.value, g = !1;
            const E = f;
            for (const w of p.decode(E)) yield yield B(w);
          }
        } catch (E) {
          d = { error: E };
        } finally {
          try {
            !g && !c && (h = _.return) && (yield B(h.call(_)));
          } finally {
            if (d) throw d.error;
          }
        }
        for (const E of p.flush()) yield yield B(E);
      });
    }
    function a() {
      return qe(this, arguments, function* () {
        var c, d, h, f;
        if (r) throw new Ne("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        r = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = He(i()), _; _ = yield B(g.next()), c = _.done, !c; m = !0) {
              f = _.value, m = !1;
              const y = f;
              p || y && (yield yield B(JSON.parse(y)));
            }
          } catch (y) {
            d = { error: y };
          } finally {
            try {
              !m && !c && (h = g.return) && (yield B(h.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (y) {
          if (Oi(y)) return yield B(void 0);
          throw y;
        } finally {
          p || n.abort();
        }
      });
    }
    return new $n(a, n, o);
  }
  [Symbol.asyncIterator]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], o = this.iterator(), r = (i) => ({ next: () => {
      if (i.length === 0) {
        const a = o.next();
        t.push(a), n.push(a);
      }
      return i.shift();
    } });
    return [new $n(() => r(t), this.controller, this.client), new $n(() => r(n), this.controller, this.client)];
  }
  toReadableStream() {
    const t = this;
    let n;
    return yf({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: r, done: i } = await n.next();
          if (i) return o.close();
          const a = Ns(JSON.stringify(r) + `
`);
          o.enqueue(a);
        } catch (r) {
          o.error(r);
        }
      },
      async cancel() {
        var o;
        await ((o = n.return) === null || o === void 0 ? void 0 : o.call(n));
      }
    });
  }
};
function gE(e, t) {
  return qe(this, arguments, function* () {
    var o, r, i, a;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new Ne("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new Ne("Attempted to iterate over a response with no body");
    const u = new yE(), c = new Dr(), d = vf(e.body);
    try {
      for (var h = !0, f = He(_E(d)), p; p = yield B(f.next()), o = p.done, !o; h = !0) {
        a = p.value, h = !1;
        const m = a;
        for (const g of c.decode(m)) {
          const _ = u.decode(g);
          _ && (yield yield B(_));
        }
      }
    } catch (m) {
      r = { error: m };
    } finally {
      try {
        !h && !o && (i = f.return) && (yield B(i.call(f)));
      } finally {
        if (r) throw r.error;
      }
    }
    for (const m of c.flush()) {
      const g = u.decode(m);
      g && (yield yield B(g));
    }
  });
}
function _E(e) {
  return qe(this, arguments, function* () {
    var n, o, r, i;
    try {
      for (var a = !0, u = He(e), c; c = yield B(u.next()), n = c.done, !n; a = !0) {
        i = c.value, a = !1;
        const d = i;
        d != null && (yield yield B(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? Ns(d) : d));
      }
    } catch (d) {
      o = { error: d };
    } finally {
      try {
        !a && !n && (r = u.return) && (yield B(r.call(u)));
      } finally {
        if (o) throw o.error;
      }
    }
  });
}
var yE = class {
  constructor() {
    this.event = null, this.data = [], this.chunks = [];
  }
  decode(e) {
    if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
      if (!this.event && !this.data.length) return null;
      const r = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      return this.event = null, this.data = [], this.chunks = [], r;
    }
    if (this.chunks.push(e), e.startsWith(":")) return null;
    let [t, n, o] = vE(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function vE(e, t) {
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
async function AE(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: r, startTime: i } = t, a = await (async () => {
    var u;
    if (t.options.stream)
      return he(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : mE.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type"), d = (u = c?.split(";")[0]) === null || u === void 0 ? void 0 : u.trim();
    return d?.includes("application/json") || d?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
  })();
  return he(e).debug(`[${o}] response parsed`, Et({
    retryOfRequestLogID: r,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
var TE = class Rf extends Promise {
  constructor(t, n, o = AE) {
    super((r) => {
      r(null);
    }), this.responsePromise = n, this.parseResponse = o, this.client = t;
  }
  _thenUnwrap(t) {
    return new Rf(this.client, this.responsePromise, async (n, o) => t(await this.parseResponse(n, o), o));
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
}, bf = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* SE(e) {
  if (!e) return;
  if (bf in e) {
    const { values: o, nulls: r } = e;
    yield* o.entries();
    for (const i of r) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Mu(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const r = o[0];
    if (typeof r != "string") throw new TypeError("expected header name to be a string");
    const i = Mu(o[1]) ? o[1] : [o[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [r, null]), yield [r, u]);
  }
}
var bn = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const r = /* @__PURE__ */ new Set();
    for (const [i, a] of SE(o)) {
      const u = i.toLowerCase();
      r.has(u) || (t.delete(i), r.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [bf]: !0,
    values: t,
    nulls: n
  };
}, ai = (e) => {
  var t, n, o, r, i;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((i = (r = (o = globalThis.Deno.env) === null || o === void 0 ? void 0 : o.get) === null || r === void 0 ? void 0 : r.call(o, e)) === null || i === void 0 ? void 0 : i.trim()) || void 0;
}, Pf, Mf = class xf {
  constructor(t) {
    var n, o, r, i, a, u, c, { baseURL: d = ai("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: h = (n = ai("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: f = "v1beta" } = t, p = pt(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: h,
      apiVersion: f
    }, p), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (o = m.timeout) !== null && o !== void 0 ? o : xf.DEFAULT_TIMEOUT, this.logger = (r = m.logger) !== null && r !== void 0 ? r : console;
    const g = "warn";
    this.logLevel = g, this.logLevel = (a = (i = Du(m.logLevel, "ClientOptions.logLevel", this)) !== null && i !== void 0 ? i : Du(ai("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && a !== void 0 ? a : g, this.fetchOptions = m.fetchOptions, this.maxRetries = (u = m.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = m.fetch) !== null && c !== void 0 ? c : jS(), this.encoder = nE, this._options = m, this.apiKey = h, this.apiVersion = f, this.clientAdapter = m.clientAdapter;
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
    const n = bn([t.headers]);
    if (!(n.values.has("authorization") || n.values.has("x-goog-api-key"))) {
      if (this.apiKey) return bn([{ "x-goog-api-key": this.apiKey }]);
      if (this.clientAdapter && this.clientAdapter.isVertexAI()) return bn([await this.clientAdapter.getAuthHeaders()]);
    }
  }
  stringifyQuery(t) {
    return oE(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${rE}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${KS()}`;
  }
  makeStatusError(t, n, o, r) {
    return De.generate(t, n, o, r);
  }
  buildURL(t, n, o) {
    const r = !this.baseURLOverridden() && o || this.baseURL, i = zS(t) ? new URL(t) : new URL(r + (r.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), a = this.defaultQuery(), u = Object.fromEntries(i.searchParams);
    return (!xu(a) || !xu(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), a), n)), typeof n == "object" && n && !Array.isArray(n) && (i.search = this.stringifyQuery(n)), i.toString();
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
    return this.request(Promise.resolve(o).then((r) => Object.assign({
      method: t,
      path: n
    }, r)));
  }
  request(t, n = null) {
    return new TE(this, this.makeRequest(t, n, void 0));
  }
  async makeRequest(t, n, o) {
    var r, i, a;
    const u = await t, c = (r = u.maxRetries) !== null && r !== void 0 ? r : this.maxRetries;
    n == null && (n = c), await this.prepareOptions(u);
    const { req: d, url: h, timeout: f } = await this.buildRequest(u, { retryCount: c - n });
    await this.prepareRequest(d, {
      url: h,
      options: u
    });
    const p = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), m = o === void 0 ? "" : `, retryOf: ${o}`, g = Date.now();
    if (he(this).debug(`[${p}] sending request`, Et({
      retryOfRequestLogID: o,
      method: u.method,
      url: h,
      options: u,
      headers: d.headers
    })), !((i = u.signal) === null || i === void 0) && i.aborted) throw new qi();
    const _ = new AbortController(), y = await this.fetchWithTimeout(h, d, f, _).catch(Gi), E = Date.now();
    if (y instanceof globalThis.Error) {
      const C = `retrying, ${n} attempts remaining`;
      if (!((a = u.signal) === null || a === void 0) && a.aborted) throw new qi();
      const P = Oi(y) || /timed? ?out/i.test(String(y) + ("cause" in y ? String(y.cause) : ""));
      if (n)
        return he(this).info(`[${p}] connection ${P ? "timed out" : "failed"} - ${C}`), he(this).debug(`[${p}] connection ${P ? "timed out" : "failed"} (${C})`, Et({
          retryOfRequestLogID: o,
          url: h,
          durationMs: E - g,
          message: y.message
        })), this.retryRequest(u, n, o ?? p);
      throw he(this).info(`[${p}] connection ${P ? "timed out" : "failed"} - error; no more retries left`), he(this).debug(`[${p}] connection ${P ? "timed out" : "failed"} (error; no more retries left)`, Et({
        retryOfRequestLogID: o,
        url: h,
        durationMs: E - g,
        message: y.message
      })), P ? new uf() : new kr({ cause: y });
    }
    const w = `[${p}${m}] ${d.method} ${h} ${y.ok ? "succeeded" : "failed"} with status ${y.status} in ${E - g}ms`;
    if (!y.ok) {
      const C = await this.shouldRetry(y);
      if (n && C) {
        const I = `retrying, ${n} attempts remaining`;
        return await tE(y.body), he(this).info(`${w} - ${I}`), he(this).debug(`[${p}] response error (${I})`, Et({
          retryOfRequestLogID: o,
          url: y.url,
          status: y.status,
          headers: y.headers,
          durationMs: E - g
        })), this.retryRequest(u, n, o ?? p, y.headers);
      }
      const P = C ? "error; no more retries left" : "error; not retryable";
      he(this).info(`${w} - ${P}`);
      const M = await y.text().catch((I) => Gi(I).message), A = QS(M), $ = A ? void 0 : M;
      throw he(this).debug(`[${p}] response error (${P})`, Et({
        retryOfRequestLogID: o,
        url: y.url,
        status: y.status,
        headers: y.headers,
        message: $,
        durationMs: Date.now() - g
      })), this.makeStatusError(y.status, A, $, y.headers);
    }
    return he(this).info(w), he(this).debug(`[${p}] response start`, Et({
      retryOfRequestLogID: o,
      url: y.url,
      status: y.status,
      headers: y.headers,
      durationMs: E - g
    })), {
      response: y,
      options: u,
      controller: _,
      requestLogID: p,
      retryOfRequestLogID: o,
      startTime: g
    };
  }
  async fetchWithTimeout(t, n, o, r) {
    const i = n || {}, { signal: a, method: u } = i, c = pt(i, ["signal", "method"]), d = this._makeAbort(r);
    a && a.addEventListener("abort", d, { once: !0 });
    const h = setTimeout(d, o), f = globalThis.ReadableStream && c.body instanceof globalThis.ReadableStream || typeof c.body == "object" && c.body !== null && Symbol.asyncIterator in c.body, p = Object.assign(Object.assign(Object.assign({ signal: r.signal }, f ? { duplex: "half" } : {}), { method: "GET" }), c);
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
  async retryRequest(t, n, o, r) {
    var i;
    let a;
    const u = r?.get("retry-after-ms");
    if (u) {
      const d = parseFloat(u);
      Number.isNaN(d) || (a = d);
    }
    const c = r?.get("retry-after");
    if (c && !a) {
      const d = parseFloat(c);
      Number.isNaN(d) ? a = Date.parse(c) - Date.now() : a = d * 1e3;
    }
    if (a === void 0) {
      const d = (i = t.maxRetries) !== null && i !== void 0 ? i : this.maxRetries;
      a = this.calculateDefaultRetryTimeoutMillis(n, d);
    }
    return await ZS(a), this.makeRequest(t, n - 1, o);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const i = n - t;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var o, r, i;
    const a = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: h } = a, f = this.buildURL(c, d, h);
    "timeout" in a && XS("timeout", a.timeout), a.timeout = (o = a.timeout) !== null && o !== void 0 ? o : this.timeout;
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
      }, a.signal && { signal: a.signal }), globalThis.ReadableStream && m instanceof globalThis.ReadableStream && { duplex: "half" }), m && { body: m }), (r = this.fetchOptions) !== null && r !== void 0 ? r : {}), (i = a.fetchOptions) !== null && i !== void 0 ? i : {}),
      url: f,
      timeout: a.timeout
    };
  }
  async buildHeaders({ options: t, method: n, bodyHeaders: o, retryCount: r }) {
    let i = {};
    this.idempotencyHeader && n !== "get" && (t.idempotencyKey || (t.idempotencyKey = this.defaultIdempotencyKey()), i[this.idempotencyHeader] = t.idempotencyKey);
    const a = await this.authHeaders(t);
    let u = bn([
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
    const o = bn([n]);
    return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && o.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: t
    } : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
      bodyHeaders: void 0,
      body: eE(t)
    } : typeof t == "object" && o.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: o
    });
  }
};
Mf.DEFAULT_TIMEOUT = 6e4;
var ne = class extends Mf {
  constructor() {
    super(...arguments), this.interactions = new wf(this), this.webhooks = new If(this);
  }
};
Pf = ne;
ne.GeminiNextGenAPIClient = Pf;
ne.GeminiNextGenAPIClientError = Ne;
ne.APIError = De;
ne.APIConnectionError = kr;
ne.APIConnectionTimeoutError = uf;
ne.APIUserAbortError = qi;
ne.NotFoundError = hf;
ne.ConflictError = pf;
ne.RateLimitError = gf;
ne.BadRequestError = cf;
ne.AuthenticationError = df;
ne.InternalServerError = _f;
ne.PermissionDeniedError = ff;
ne.UnprocessableEntityError = mf;
ne.toFile = uE;
ne.Interactions = wf;
ne.Webhooks = If;
function EE(e, t) {
  const n = {}, o = s(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function wE(e, t) {
  const n = {}, o = s(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function CE(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function IE(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function RE(e, t, n) {
  const o = {};
  if (s(e, ["validationDataset"]) !== void 0) throw new Error("validationDataset parameter is not supported in Gemini API.");
  const r = s(e, ["tunedModelDisplayName"]);
  if (t !== void 0 && r != null && l(t, ["displayName"], r), s(e, ["description"]) !== void 0) throw new Error("description parameter is not supported in Gemini API.");
  const i = s(e, ["epochCount"]);
  t !== void 0 && i != null && l(t, [
    "tuningTask",
    "hyperparameters",
    "epochCount"
  ], i);
  const a = s(e, ["learningRateMultiplier"]);
  if (a != null && l(o, [
    "tuningTask",
    "hyperparameters",
    "learningRateMultiplier"
  ], a), s(e, ["exportLastCheckpointOnly"]) !== void 0) throw new Error("exportLastCheckpointOnly parameter is not supported in Gemini API.");
  if (s(e, ["preTunedModelCheckpointId"]) !== void 0) throw new Error("preTunedModelCheckpointId parameter is not supported in Gemini API.");
  if (s(e, ["adapterSize"]) !== void 0) throw new Error("adapterSize parameter is not supported in Gemini API.");
  if (s(e, ["tuningMode"]) !== void 0) throw new Error("tuningMode parameter is not supported in Gemini API.");
  if (s(e, ["customBaseModel"]) !== void 0) throw new Error("customBaseModel parameter is not supported in Gemini API.");
  const u = s(e, ["batchSize"]);
  t !== void 0 && u != null && l(t, [
    "tuningTask",
    "hyperparameters",
    "batchSize"
  ], u);
  const c = s(e, ["learningRate"]);
  if (t !== void 0 && c != null && l(t, [
    "tuningTask",
    "hyperparameters",
    "learningRate"
  ], c), s(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  if (s(e, ["beta"]) !== void 0) throw new Error("beta parameter is not supported in Gemini API.");
  if (s(e, ["baseTeacherModel"]) !== void 0) throw new Error("baseTeacherModel parameter is not supported in Gemini API.");
  if (s(e, ["tunedTeacherModelSource"]) !== void 0) throw new Error("tunedTeacherModelSource parameter is not supported in Gemini API.");
  if (s(e, ["sftLossWeightMultiplier"]) !== void 0) throw new Error("sftLossWeightMultiplier parameter is not supported in Gemini API.");
  if (s(e, ["outputUri"]) !== void 0) throw new Error("outputUri parameter is not supported in Gemini API.");
  if (s(e, ["encryptionSpec"]) !== void 0) throw new Error("encryptionSpec parameter is not supported in Gemini API.");
  return o;
}
function bE(e, t, n) {
  const o = {};
  let r = s(n, ["config", "method"]);
  if (r === void 0 && (r = "SUPERVISED_FINE_TUNING"), r === "SUPERVISED_FINE_TUNING") {
    const A = s(e, ["validationDataset"]);
    t !== void 0 && A != null && l(t, ["supervisedTuningSpec"], li(A));
  } else if (r === "PREFERENCE_TUNING") {
    const A = s(e, ["validationDataset"]);
    t !== void 0 && A != null && l(t, ["preferenceOptimizationSpec"], li(A));
  } else if (r === "DISTILLATION") {
    const A = s(e, ["validationDataset"]);
    t !== void 0 && A != null && l(t, ["distillationSpec"], li(A));
  }
  const i = s(e, ["tunedModelDisplayName"]);
  t !== void 0 && i != null && l(t, ["tunedModelDisplayName"], i);
  const a = s(e, ["description"]);
  t !== void 0 && a != null && l(t, ["description"], a);
  let u = s(n, ["config", "method"]);
  if (u === void 0 && (u = "SUPERVISED_FINE_TUNING"), u === "SUPERVISED_FINE_TUNING") {
    const A = s(e, ["epochCount"]);
    t !== void 0 && A != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "epochCount"
    ], A);
  } else if (u === "PREFERENCE_TUNING") {
    const A = s(e, ["epochCount"]);
    t !== void 0 && A != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "epochCount"
    ], A);
  } else if (u === "DISTILLATION") {
    const A = s(e, ["epochCount"]);
    t !== void 0 && A != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "epochCount"
    ], A);
  }
  let c = s(n, ["config", "method"]);
  if (c === void 0 && (c = "SUPERVISED_FINE_TUNING"), c === "SUPERVISED_FINE_TUNING") {
    const A = s(e, ["learningRateMultiplier"]);
    t !== void 0 && A != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], A);
  } else if (c === "PREFERENCE_TUNING") {
    const A = s(e, ["learningRateMultiplier"]);
    t !== void 0 && A != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], A);
  } else if (c === "DISTILLATION") {
    const A = s(e, ["learningRateMultiplier"]);
    t !== void 0 && A != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], A);
  }
  let d = s(n, ["config", "method"]);
  if (d === void 0 && (d = "SUPERVISED_FINE_TUNING"), d === "SUPERVISED_FINE_TUNING") {
    const A = s(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && A != null && l(t, ["supervisedTuningSpec", "exportLastCheckpointOnly"], A);
  } else if (d === "PREFERENCE_TUNING") {
    const A = s(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && A != null && l(t, ["preferenceOptimizationSpec", "exportLastCheckpointOnly"], A);
  } else if (d === "DISTILLATION") {
    const A = s(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && A != null && l(t, ["distillationSpec", "exportLastCheckpointOnly"], A);
  }
  let h = s(n, ["config", "method"]);
  if (h === void 0 && (h = "SUPERVISED_FINE_TUNING"), h === "SUPERVISED_FINE_TUNING") {
    const A = s(e, ["adapterSize"]);
    t !== void 0 && A != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "adapterSize"
    ], A);
  } else if (h === "PREFERENCE_TUNING") {
    const A = s(e, ["adapterSize"]);
    t !== void 0 && A != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "adapterSize"
    ], A);
  } else if (h === "DISTILLATION") {
    const A = s(e, ["adapterSize"]);
    t !== void 0 && A != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "adapterSize"
    ], A);
  }
  let f = s(n, ["config", "method"]);
  if (f === void 0 && (f = "SUPERVISED_FINE_TUNING"), f === "SUPERVISED_FINE_TUNING") {
    const A = s(e, ["tuningMode"]);
    t !== void 0 && A != null && l(t, ["supervisedTuningSpec", "tuningMode"], A);
  } else if (f === "DISTILLATION") {
    const A = s(e, ["tuningMode"]);
    t !== void 0 && A != null && l(t, ["distillationSpec", "tuningMode"], A);
  }
  const p = s(e, ["customBaseModel"]);
  t !== void 0 && p != null && l(t, ["customBaseModel"], p);
  let m = s(n, ["config", "method"]);
  if (m === void 0 && (m = "SUPERVISED_FINE_TUNING"), m === "SUPERVISED_FINE_TUNING") {
    const A = s(e, ["batchSize"]);
    t !== void 0 && A != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "batchSize"
    ], A);
  } else if (m === "DISTILLATION") {
    const A = s(e, ["batchSize"]);
    t !== void 0 && A != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "batchSize"
    ], A);
  }
  let g = s(n, ["config", "method"]);
  if (g === void 0 && (g = "SUPERVISED_FINE_TUNING"), g === "SUPERVISED_FINE_TUNING") {
    const A = s(e, ["learningRate"]);
    t !== void 0 && A != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRate"
    ], A);
  } else if (g === "DISTILLATION") {
    const A = s(e, ["learningRate"]);
    t !== void 0 && A != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRate"
    ], A);
  }
  const _ = s(e, ["labels"]);
  t !== void 0 && _ != null && l(t, ["labels"], _);
  const y = s(e, ["beta"]);
  t !== void 0 && y != null && l(t, [
    "preferenceOptimizationSpec",
    "hyperParameters",
    "beta"
  ], y);
  const E = s(e, ["baseTeacherModel"]);
  t !== void 0 && E != null && l(t, ["distillationSpec", "baseTeacherModel"], E);
  const w = s(e, ["tunedTeacherModelSource"]);
  t !== void 0 && w != null && l(t, ["distillationSpec", "tunedTeacherModelSource"], w);
  const C = s(e, ["sftLossWeightMultiplier"]);
  t !== void 0 && C != null && l(t, [
    "distillationSpec",
    "hyperParameters",
    "sftLossWeightMultiplier"
  ], C);
  const P = s(e, ["outputUri"]);
  t !== void 0 && P != null && l(t, ["outputUri"], P);
  const M = s(e, ["encryptionSpec"]);
  return t !== void 0 && M != null && l(t, ["encryptionSpec"], M), o;
}
function PE(e, t) {
  const n = {}, o = s(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const r = s(e, ["preTunedModel"]);
  r != null && l(n, ["preTunedModel"], r);
  const i = s(e, ["trainingDataset"]);
  i != null && GE(i);
  const a = s(e, ["config"]);
  return a != null && RE(a, n), n;
}
function ME(e, t) {
  const n = {}, o = s(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const r = s(e, ["preTunedModel"]);
  r != null && l(n, ["preTunedModel"], r);
  const i = s(e, ["trainingDataset"]);
  i != null && BE(i, n, t);
  const a = s(e, ["config"]);
  return a != null && bE(a, n, t), n;
}
function xE(e, t) {
  const n = {}, o = s(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function NE(e, t) {
  const n = {}, o = s(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function kE(e, t, n) {
  const o = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = s(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const a = s(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), o;
}
function DE(e, t, n) {
  const o = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = s(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const a = s(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), o;
}
function $E(e, t) {
  const n = {}, o = s(e, ["config"]);
  return o != null && kE(o, n), n;
}
function LE(e, t) {
  const n = {}, o = s(e, ["config"]);
  return o != null && DE(o, n), n;
}
function UE(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = s(e, ["tunedModels"]);
  if (i != null) {
    let a = i;
    Array.isArray(a) && (a = a.map((u) => Nf(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function FE(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = s(e, ["tuningJobs"]);
  if (i != null) {
    let a = i;
    Array.isArray(a) && (a = a.map((u) => Ji(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function OE(e, t) {
  const n = {}, o = s(e, ["name"]);
  o != null && l(n, ["model"], o);
  const r = s(e, ["name"]);
  return r != null && l(n, ["endpoint"], r), n;
}
function GE(e, t) {
  const n = {};
  if (s(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (s(e, ["vertexDatasetResource"]) !== void 0) throw new Error("vertexDatasetResource parameter is not supported in Gemini API.");
  const o = s(e, ["examples"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => i)), l(n, ["examples", "examples"], r);
  }
  return n;
}
function BE(e, t, n) {
  const o = {};
  let r = s(n, ["config", "method"]);
  if (r === void 0 && (r = "SUPERVISED_FINE_TUNING"), r === "SUPERVISED_FINE_TUNING") {
    const a = s(e, ["gcsUri"]);
    t !== void 0 && a != null && l(t, ["supervisedTuningSpec", "trainingDatasetUri"], a);
  } else if (r === "PREFERENCE_TUNING") {
    const a = s(e, ["gcsUri"]);
    t !== void 0 && a != null && l(t, ["preferenceOptimizationSpec", "trainingDatasetUri"], a);
  } else if (r === "DISTILLATION") {
    const a = s(e, ["gcsUri"]);
    t !== void 0 && a != null && l(t, ["distillationSpec", "promptDatasetUri"], a);
  }
  let i = s(n, ["config", "method"]);
  if (i === void 0 && (i = "SUPERVISED_FINE_TUNING"), i === "SUPERVISED_FINE_TUNING") {
    const a = s(e, ["vertexDatasetResource"]);
    t !== void 0 && a != null && l(t, ["supervisedTuningSpec", "trainingDatasetUri"], a);
  } else if (i === "PREFERENCE_TUNING") {
    const a = s(e, ["vertexDatasetResource"]);
    t !== void 0 && a != null && l(t, ["preferenceOptimizationSpec", "trainingDatasetUri"], a);
  } else if (i === "DISTILLATION") {
    const a = s(e, ["vertexDatasetResource"]);
    t !== void 0 && a != null && l(t, ["distillationSpec", "promptDatasetUri"], a);
  }
  if (s(e, ["examples"]) !== void 0) throw new Error("examples parameter is not supported in Vertex AI.");
  return o;
}
function Nf(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = s(e, ["state"]);
  i != null && l(n, ["state"], Gd(i));
  const a = s(e, ["createTime"]);
  a != null && l(n, ["createTime"], a);
  const u = s(e, ["tuningTask", "startTime"]);
  u != null && l(n, ["startTime"], u);
  const c = s(e, ["tuningTask", "completeTime"]);
  c != null && l(n, ["endTime"], c);
  const d = s(e, ["updateTime"]);
  d != null && l(n, ["updateTime"], d);
  const h = s(e, ["description"]);
  h != null && l(n, ["description"], h);
  const f = s(e, ["baseModel"]);
  f != null && l(n, ["baseModel"], f);
  const p = s(e, ["_self"]);
  return p != null && l(n, ["tunedModel"], OE(p)), n;
}
function Ji(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = s(e, ["state"]);
  i != null && l(n, ["state"], Gd(i));
  const a = s(e, ["createTime"]);
  a != null && l(n, ["createTime"], a);
  const u = s(e, ["startTime"]);
  u != null && l(n, ["startTime"], u);
  const c = s(e, ["endTime"]);
  c != null && l(n, ["endTime"], c);
  const d = s(e, ["updateTime"]);
  d != null && l(n, ["updateTime"], d);
  const h = s(e, ["error"]);
  h != null && l(n, ["error"], h);
  const f = s(e, ["description"]);
  f != null && l(n, ["description"], f);
  const p = s(e, ["baseModel"]);
  p != null && l(n, ["baseModel"], p);
  const m = s(e, ["tunedModel"]);
  m != null && l(n, ["tunedModel"], m);
  const g = s(e, ["preTunedModel"]);
  g != null && l(n, ["preTunedModel"], g);
  const _ = s(e, ["supervisedTuningSpec"]);
  _ != null && l(n, ["supervisedTuningSpec"], _);
  const y = s(e, ["preferenceOptimizationSpec"]);
  y != null && l(n, ["preferenceOptimizationSpec"], y);
  const E = s(e, ["distillationSpec"]);
  E != null && l(n, ["distillationSpec"], E);
  const w = s(e, ["tuningDataStats"]);
  w != null && l(n, ["tuningDataStats"], w);
  const C = s(e, ["encryptionSpec"]);
  C != null && l(n, ["encryptionSpec"], C);
  const P = s(e, ["partnerModelTuningSpec"]);
  P != null && l(n, ["partnerModelTuningSpec"], P);
  const M = s(e, ["customBaseModel"]);
  M != null && l(n, ["customBaseModel"], M);
  const A = s(e, ["evaluateDatasetRuns"]);
  if (A != null) {
    let $e = A;
    Array.isArray($e) && ($e = $e.map((Le) => Le)), l(n, ["evaluateDatasetRuns"], $e);
  }
  const $ = s(e, ["experiment"]);
  $ != null && l(n, ["experiment"], $);
  const I = s(e, ["fullFineTuningSpec"]);
  I != null && l(n, ["fullFineTuningSpec"], I);
  const x = s(e, ["labels"]);
  x != null && l(n, ["labels"], x);
  const F = s(e, ["outputUri"]);
  F != null && l(n, ["outputUri"], F);
  const H = s(e, ["pipelineJob"]);
  H != null && l(n, ["pipelineJob"], H);
  const ue = s(e, ["serviceAccount"]);
  ue != null && l(n, ["serviceAccount"], ue);
  const ie = s(e, ["tunedModelDisplayName"]);
  ie != null && l(n, ["tunedModelDisplayName"], ie);
  const J = s(e, ["tuningJobState"]);
  J != null && l(n, ["tuningJobState"], J);
  const W = s(e, ["veoTuningSpec"]);
  W != null && l(n, ["veoTuningSpec"], W);
  const pe = s(e, ["distillationSamplingSpec"]);
  pe != null && l(n, ["distillationSamplingSpec"], pe);
  const Je = s(e, ["tuningJobMetadata"]);
  return Je != null && l(n, ["tuningJobMetadata"], Je), n;
}
function qE(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = s(e, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const a = s(e, ["done"]);
  a != null && l(n, ["done"], a);
  const u = s(e, ["error"]);
  return u != null && l(n, ["error"], u), n;
}
function li(e, t) {
  const n = {}, o = s(e, ["gcsUri"]);
  o != null && l(n, ["validationDatasetUri"], o);
  const r = s(e, ["vertexDatasetResource"]);
  return r != null && l(n, ["validationDatasetUri"], r), n;
}
var HE = class extends ot {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Dt(nt.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
      var n;
      if (this.apiClient.isVertexAI()) if (t.baseModel.startsWith("projects/")) {
        const o = { tunedModelName: t.baseModel };
        !((n = t.config) === null || n === void 0) && n.preTunedModelCheckpointId && (o.checkpointId = t.config.preTunedModelCheckpointId);
        const r = Object.assign(Object.assign({}, t), { preTunedModel: o });
        return r.baseModel = void 0, await this.tuneInternal(r);
      } else {
        const o = Object.assign({}, t);
        return await this.tuneInternal(o);
      }
      else {
        const o = Object.assign({}, t), r = await this.tuneMldevInternal(o);
        let i = "";
        return r.metadata !== void 0 && r.metadata.tunedModel !== void 0 ? i = r.metadata.tunedModel : r.name !== void 0 && r.name.includes("/operations/") && (i = r.name.split("/operations/")[0]), {
          name: i,
          state: xi.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = NE(e);
      return a = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => Ji(d));
    } else {
      const c = xE(e);
      return a = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => Nf(d));
    }
  }
  async listInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = LE(e);
      return a = N("tuningJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = FE(d), f = new su();
        return Object.assign(f, h), f;
      });
    } else {
      const c = $E(e);
      return a = N("tunedModels", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = UE(d), f = new su();
        return Object.assign(f, h), f;
      });
    }
  }
  async cancel(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = wE(e);
      return a = N("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = IE(d), f = new au();
        return Object.assign(f, h), f;
      });
    } else {
      const c = EE(e);
      return a = N("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = CE(d), f = new au();
        return Object.assign(f, h), f;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = ME(e, e);
      return r = N("tuningJobs", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => Ji(u));
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async tuneMldevInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = PE(e);
      return r = N("tunedModels", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => qE(u));
    }
  }
}, VE = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, JE = 1024 * 1024 * 8, KE = 3, WE = 1e3, zE = 2, pr = "x-goog-upload-status";
async function YE(e, t, n, o) {
  var r;
  const i = await kf(e, t, n, o), a = await i?.json();
  if (((r = i?.headers) === null || r === void 0 ? void 0 : r[pr]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return a.file;
}
async function XE(e, t, n, o) {
  var r;
  const i = await kf(e, t, n, o), a = await i?.json();
  if (((r = i?.headers) === null || r === void 0 ? void 0 : r[pr]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = xd(a), c = new c_();
  return Object.assign(c, u), c;
}
async function kf(e, t, n, o) {
  var r, i, a;
  let u = t;
  const c = o?.baseUrl || ((r = n.clientOptions.httpOptions) === null || r === void 0 ? void 0 : r.baseUrl);
  if (c) {
    const m = new URL(c), g = new URL(t);
    g.protocol = m.protocol, g.host = m.host, g.port = m.port, u = g.toString();
  }
  let d = 0, h = 0, f = new ki(new Response()), p = "upload";
  for (d = e.size; h < d; ) {
    const m = Math.min(JE, d - h), g = e.slice(h, h + m);
    h + m >= d && (p += ", finalize");
    let _ = 0, y = WE;
    for (; _ < KE; ) {
      const E = Object.assign(Object.assign({}, o?.headers || {}), {
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
          headers: E
        })
      }), !((i = f?.headers) === null || i === void 0) && i[pr]) break;
      _++, await ZE(y), y = y * zE;
    }
    if (h += m, ((a = f?.headers) === null || a === void 0 ? void 0 : a[pr]) !== "active") break;
    if (d <= h) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return f;
}
async function QE(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function ZE(e) {
  return new Promise((t) => setTimeout(t, e));
}
var jE = class {
  async upload(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await YE(e, t, n, o);
  }
  async uploadToFileSearchStore(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await XE(e, t, n, o);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await QE(e);
  }
}, ew = class {
  create(e, t, n) {
    return new tw(e, t, n);
  }
}, tw = class {
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
}, Lu = "x-goog-api-key", nw = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(Lu) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(Lu, this.apiKey);
    }
  }
}, ow = class {
  getNextGenClient() {
    var e;
    const t = this.httpOptions;
    if (this._nextGenClient === void 0) {
      const n = this.httpOptions;
      this._nextGenClient = new ne({
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
    const n = kg(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const o = new nw(this.apiKey);
    this.apiClient = new ZT({
      auth: o,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: "gl-node/web",
      uploader: new jE(),
      downloader: new VE()
    }), this.models = new yS(this.apiClient), this.live = new fS(this.apiClient, o, new ew()), this.batches = new hy(this.apiClient), this.chats = new Qy(this.models, this.apiClient), this.caches = new zy(this.apiClient), this.files = new uv(this.apiClient), this.operations = new vS(this.apiClient), this.authTokens = new US(this.apiClient), this.tunings = new HE(this.apiClient), this.fileSearchStores = new JS(this.apiClient);
  }
};
function Uu(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function mr(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function Pt(e) {
  return { text: String(e || "") };
}
function rw(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? { inlineData: {
    mimeType: t[1],
    data: t[2]
  } } : null;
}
function iw(e) {
  if (typeof e == "string") return [Pt(e)];
  if (!Array.isArray(e)) return [Pt("")];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "text" ? Pt(n.text || "") : n.type === "image_url" && n.image_url?.url ? rw(n.image_url.url) : null).filter(Boolean);
  return t.length ? t : [Pt("")];
}
function Fu() {
  return {
    role: "user",
    parts: [Pt("")]
  };
}
function mo(e, t = "model") {
  if (!e?.parts?.length) return null;
  const n = mr(e);
  return n ? (n.role || (n.role = t), n) : null;
}
function sw(e) {
  return !!e?.parts?.some((t) => typeof t?.thoughtSignature == "string" && t.thoughtSignature);
}
function aw(e) {
  return !!e?.parts?.some((t) => t?.functionCall?.name);
}
function Ou(e, t, n = 0) {
  if (!e?.functionCall?.name) return "";
  const o = String(e.functionCall.id || "").trim();
  return o ? `id:${o}` : [
    String(n),
    String(e.functionCall.name || ""),
    String(t)
  ].join("\0");
}
function lw(e, t) {
  const n = e?.functionCall || {}, o = t?.functionCall || {}, r = n.args && typeof n.args == "object" && !Array.isArray(n.args) ? n.args : {}, i = o.args && typeof o.args == "object" && !Array.isArray(o.args) ? o.args : {};
  return {
    ...e,
    ...t,
    ...e?.thoughtSignature && !t?.thoughtSignature ? { thoughtSignature: e.thoughtSignature } : {},
    functionCall: {
      ...n,
      ...o,
      args: {
        ...r,
        ...i
      }
    }
  };
}
function uw(e = [], t = "") {
  const n = e.map((h) => mo(h, "model")).filter(Boolean);
  if (!n.length) return null;
  const o = [...n].reverse().find((h) => sw(h)) || null, r = [...n].reverse().find((h) => aw(h)) || null, i = o || r || n[n.length - 1], a = n.indexOf(i), u = mr(i);
  if (!u?.parts?.length) return n[n.length - 1];
  if (r) {
    const h = /* @__PURE__ */ new Map(), f = [];
    n.forEach((m, g) => {
      m.parts.forEach((_, y) => {
        const E = Ou(_, y, g);
        if (!E) return;
        h.has(E) || f.push(E);
        const w = h.get(E);
        w ? h.set(E, lw(w, _)) : h.set(E, mr(_));
      });
    });
    const p = /* @__PURE__ */ new Set();
    u.parts = u.parts.map((m, g) => {
      const _ = Ou(m, g, a);
      return _ ? (p.add(_), h.get(_) || m) : m;
    }), f.forEach((m) => {
      p.has(m) || (u.parts.push(h.get(m)), p.add(m));
    });
  }
  const c = String(t || ""), d = u.parts.filter((h) => !(typeof h?.text == "string" && !h?.thought));
  return u.parts = c ? [{ text: c }, ...d] : d, u.parts.length ? u : n[n.length - 1];
}
function Gu(e) {
  const t = e?.candidates?.[0]?.content?.parts || [], n = t.filter((o) => !o?.thought && typeof o?.text == "string" && o.text).map((o) => o.text).join(`
`);
  return n || t.length ? n : typeof e?.text == "string" && e.text ? e.text : "";
}
function Df(e) {
  const t = Array.isArray(e?.functionCalls) ? e.functionCalls : [], n = (e?.candidates?.[0]?.content?.parts || []).map((o) => o?.functionCall || o).filter((o) => o && o.name);
  return t.length ? t : n;
}
function $f(e) {
  try {
    return JSON.stringify(e?.args || {});
  } catch {
    return "{}";
  }
}
function Bu(e) {
  try {
    const t = JSON.parse(String(e || "{}"));
    return t && typeof t == "object" && !Array.isArray(t) ? t : null;
  } catch {
    return null;
  }
}
function cw(e, t) {
  const n = Bu(e), o = Bu(t);
  return n && o ? JSON.stringify({
    ...n,
    ...o
  }) : String(t || "").trim() || String(e || "{}");
}
function dw(e, t = "google-tool") {
  return Df(e).map((n, o) => {
    const r = String(n.id || "").trim();
    return {
      id: r || `${t}-${o + 1}`,
      name: n.name || "",
      arguments: $f(n),
      ...r ? {} : { providerId: "" }
    };
  }).filter((n) => n.name);
}
function fw(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  let o = 0;
  function r(a, u, c, d) {
    return a.name = String(u.name || a.name || "").trim(), a.arguments = cw(a.arguments, d), c && (n.set(c, a), a.id !== c ? a.providerId = c : delete a.providerId), a;
  }
  function i(a) {
    return Df(a).forEach((u) => {
      const c = String(u?.name || "").trim();
      if (!c) return;
      const d = String(u?.id || "").trim(), h = $f(u);
      let f = d ? n.get(d) : null;
      f ? r(f, u, d, h) : (f = {
        id: d || `${e}-${++o}`,
        name: c,
        arguments: h,
        ...d ? {} : { providerId: "" }
      }, t.push(f)), d && n.set(d, f);
    }), t.map((u) => ({ ...u }));
  }
  return { append: i };
}
function hw(e = []) {
  return {
    role: "user",
    parts: e.filter((t) => t && t.name).map((t) => {
      const n = Object.prototype.hasOwnProperty.call(t, "providerId") ? String(t.providerId || "").trim() : String(t.id || "").trim();
      return { functionResponse: {
        ...n ? { id: n } : {},
        name: t.name,
        response: t.response || {}
      } };
    })
  };
}
function pw(e) {
  switch (e) {
    case "minimal":
      return Kt.MINIMAL;
    case "high":
      return Kt.HIGH;
    case "medium":
      return Kt.MEDIUM;
    default:
      return Kt.LOW;
  }
}
function qu(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function mw(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  if (t.length)
    return [...new Set(t)].join(`

`);
}
function gw(e) {
  const t = e?.providerPayload?.googleContent;
  return mo(t, "model");
}
function _w(e) {
  const t = e?.providerPayload?.googleContents;
  if (!Array.isArray(t) || !t.length) {
    const n = gw(e);
    return n ? [n] : [];
  }
  return t.map((n) => mo(n, "model")).filter(Boolean);
}
function ks(e = []) {
  const t = (Array.isArray(e) ? e : []).map((n) => mo(n, "model")).filter(Boolean);
  if (t.length)
    return {
      googleContent: t[t.length - 1],
      googleContents: t
    };
}
function yw(e) {
  const t = e?.candidates?.[0]?.content;
  return ks(t ? [t] : []);
}
function vw(e) {
  return ks(e ? [e] : []);
}
function Lf(e) {
  try {
    if (typeof e?.getHistory == "function") return e.getHistory(!1);
  } catch {
    return [];
  }
  return Array.isArray(e?.history) ? mr(e.history) || [] : [];
}
function Aw(e, t = 0) {
  return Lf(e).slice(Math.max(0, t)).filter((n) => n?.role === "model").map((n) => mo(n, "model")).filter(Boolean);
}
function Tw(e) {
  const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), o = [], r = (e || []).filter((a) => a.role === "user" || a.role === "assistant" || a.role === "tool");
  r.forEach((a) => {
    (a.tool_calls || []).forEach((u) => {
      u.id && u.function?.name && t.set(u.id, u.function.name), u.id && Object.prototype.hasOwnProperty.call(u, "providerToolCallId") && n.set(u.id, String(u.providerToolCallId || "").trim());
    });
  });
  for (let a = 0; a < r.length; a += 1) {
    const u = r[a];
    if (u.role === "tool") {
      const c = [];
      let d = a;
      for (; d < r.length && r[d].role === "tool"; ) {
        const h = r[d], f = String(h.tool_call_id || "").trim(), p = n.has(f) ? n.get(f) : f;
        c.push({ functionResponse: {
          ...p ? { id: p } : {},
          name: String(h.toolName || h.tool_name || "").trim() || t.get(f) || "tool_result",
          response: Uu(h.content)
        } }), d += 1;
      }
      o.push({
        role: "user",
        parts: c
      }), a = d - 1;
      continue;
    }
    if (u.role === "assistant") {
      const c = _w(u);
      if (c.length) {
        o.push(...c);
        continue;
      }
    }
    if (u.role === "assistant" && Array.isArray(u.tool_calls) && u.tool_calls.length) {
      o.push({
        role: "model",
        parts: [...u.content ? [Pt(u.content)] : [], ...u.tool_calls.map((c) => ({ functionCall: {
          ...(() => {
            const d = Object.prototype.hasOwnProperty.call(c, "providerToolCallId") ? String(c.providerToolCallId || "").trim() : String(c.id || "").trim();
            return d ? { id: d } : {};
          })(),
          name: c.function.name,
          args: Uu(c.function.arguments)
        } }))]
      });
      continue;
    }
    o.push({
      role: u.role === "assistant" ? "model" : "user",
      parts: iw(u.content)
    });
  }
  if (!o.length) return {
    history: [],
    latestMessage: Fu().parts
  };
  const i = o[o.length - 1];
  return i.role === "user" && i.parts?.length ? {
    history: o.slice(0, -1),
    latestMessage: i.parts
  } : {
    history: o,
    latestMessage: Fu().parts
  };
}
function Sw(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Hu(e, t) {
  return `${String(e || "")}${String(t || "")}`;
}
var Ew = class {
  constructor(e) {
    this.config = e, this.supportsSessionToolLoop = !0, this.activeChat = null, this.sessionReasoning = null, this.toolCallResponseSequence = 0, this.client = new ow({
      apiKey: e.apiKey,
      httpOptions: {
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 900 * 1e3
      }
    });
  }
  buildChatPayload(e, t = Q("google", this.config, e.reasoning)) {
    const n = t, o = Tw(e.messages), r = Array.isArray(e.tools) ? e.tools : [], i = mw(e), a = {
      ...i ? { systemInstruction: i } : {},
      temperature: e.temperature,
      ...e.maxTokens ? { maxOutputTokens: e.maxTokens } : {}
    };
    if (n.mode === "off" ? a.thinkingConfig = {
      includeThoughts: !1,
      thinkingBudget: 0
    } : n.mode === "on" && n.profileId.startsWith("google-gemini-2.5-") ? a.thinkingConfig = {
      includeThoughts: K(n),
      thinkingBudget: n.budgetTokens
    } : n.mode === "on" ? a.thinkingConfig = {
      includeThoughts: K(n),
      thinkingLevel: pw(n.effort)
    } : K(n) && (a.thinkingConfig = { includeThoughts: !0 }), r.length && (a.tools = [{ functionDeclarations: r.map((u) => ({
      name: u.function.name,
      description: u.function.description,
      parameters: u.function.parameters
    })) }]), r.length) {
      const u = String(e.toolChoice || "auto").trim();
      a.toolConfig = { functionCallingConfig: u === "none" ? { mode: Jt.NONE } : u === "auto" ? { mode: Jt.AUTO } : u === "required" ? { mode: Jt.ANY } : {
        mode: Jt.ANY,
        allowedFunctionNames: [u]
      } };
    }
    return {
      createPayload: {
        model: this.config.model,
        history: o.history,
        config: a
      },
      sendPayload: { message: o.latestMessage }
    };
  }
  inspectRequest(e, t = {}) {
    const n = t.effectiveReasoning || Q("google", this.config, e.reasoning), o = t.payload || this.buildChatPayload(e, n), r = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return to({
      provider: "google",
      model: this.config.model,
      transport: "google-genai-sdk",
      url: `${r}/models/${encodeURIComponent(this.config.model || "")}:generateContent`,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.config.apiKey || ""
      },
      body: {
        chatCreate: o.createPayload,
        sendMessage: o.sendPayload,
        stream: typeof e.onStreamProgress == "function"
      },
      sdk: typeof e.onStreamProgress == "function" ? "client.chats.create(...).sendMessageStream" : "client.chats.create(...).sendMessage",
      effectiveConfig: mt(e, {
        reasoning: n,
        effort: o.createPayload.config?.thinkingConfig?.thinkingLevel,
        budgetTokens: o.createPayload.config?.thinkingConfig?.thinkingBudget,
        controlFields: o.createPayload.config?.thinkingConfig ? { thinkingConfig: o.createPayload.config.thinkingConfig } : {}
      })
    });
  }
  inspectSendRequest(e, t, n) {
    const o = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return to({
      provider: "google",
      model: this.config.model,
      transport: "google-genai-sdk",
      url: `${o}/models/${encodeURIComponent(this.config.model || "")}:generateContent`,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.config.apiKey || ""
      },
      body: {
        sendMessage: e,
        stream: typeof t.onStreamProgress == "function"
      },
      sdk: typeof t.onStreamProgress == "function" ? "activeChat.sendMessageStream" : "activeChat.sendMessage",
      effectiveConfig: mt(t, {
        reasoning: n,
        effort: this.sessionConfig?.thinkingConfig?.thinkingLevel,
        budgetTokens: this.sessionConfig?.thinkingConfig?.thinkingBudget,
        controlFields: this.sessionConfig?.thinkingConfig ? { thinkingConfig: this.sessionConfig.thinkingConfig } : {}
      })
    });
  }
  createChat(e, t) {
    const n = this.buildChatPayload(e, t);
    return {
      chat: this.client.chats.create(n.createPayload),
      sessionConfig: n.createPayload.config,
      sendPayload: n.sendPayload,
      requestInspection: this.inspectRequest(e, {
        payload: n,
        effectiveReasoning: t
      })
    };
  }
  async sendThroughChat(e, t, n, o) {
    let r, i, a, u = [];
    const c = `google-tool-${++this.toolCallResponseSequence}`, d = fw(c);
    let h = null;
    const f = n.signal ? {
      ...this.sessionConfig || {},
      abortSignal: n.signal
    } : void 0, p = {
      ...t,
      ...f ? { config: f } : {}
    }, m = typeof n.onStreamProgress == "function", g = Lf(e).length;
    if (m) {
      const E = await e.sendMessageStream(p), w = /* @__PURE__ */ new Map();
      let C = "", P = null;
      const M = [];
      for await (const A of E) {
        P = A;
        const $ = A?.candidates?.[0]?.content;
        $?.parts?.length && M.push($), K(o) && qu(A).forEach((x, F) => {
          const H = `${x.label}:${F}`;
          w.set(H, Hu(w.get(H) || "", x.text));
        }), u = d.append(A);
        const I = Gu(A);
        C = Hu(C, I), Sw(n, {
          text: C,
          thoughts: Array.from(w.values()).filter(Boolean).map((x, F) => ({
            label: `思考块 ${F + 1}`,
            text: x
          })),
          ...u.length ? {
            toolCalls: u,
            toolCallDraft: !0
          } : {}
        });
      }
      r = {
        ...P || {},
        functionCalls: u
      }, h = uw(M, C) || r?.candidates?.[0]?.content || null, i = Array.from(w.values()).filter(Boolean).map((A, $) => ({
        label: `思考块 ${$ + 1}`,
        text: A
      })), a = C;
    } else
      r = await e.sendMessage(p), i = K(o) ? qu(r) : [], a = Gu(r);
    const _ = m ? u : dw(r, c), y = Aw(e, g);
    return {
      text: a,
      toolCalls: _,
      thoughts: i,
      finishReason: r.candidates?.[0]?.finishReason || "STOP",
      model: r.modelVersion || this.config.model,
      provider: "google",
      providerPayload: ks(y) || vw(h) || yw(r)
    };
  }
  async chat(e) {
    const t = Q("google", this.config, e.reasoning), n = (Array.isArray(e.toolResponses) && e.toolResponses.length || String(e.finalAnswerReminderText || "").trim()) && this.sessionReasoning ? this.sessionReasoning : t;
    if (Array.isArray(e.toolResponses) && e.toolResponses.length) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const i = { message: hw(e.toolResponses) };
      return {
        ...await this.sendThroughChat(this.activeChat, i, e, n),
        requestInspection: this.inspectSendRequest(i, e, n)
      };
    }
    const o = String(e.finalAnswerReminderText || "").trim();
    if (o) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const i = { message: [Pt(o)] };
      return {
        ...await this.sendThroughChat(this.activeChat, i, e, n),
        requestInspection: this.inspectSendRequest(i, e, n)
      };
    }
    const r = this.createChat(e, n);
    return this.activeChat = r.chat, this.sessionConfig = r.sessionConfig, this.sessionReasoning = n, {
      ...await this.sendThroughChat(this.activeChat, r.sendPayload, e, n),
      requestInspection: r.requestInspection
    };
  }
};
function O(e, t, n, o, r) {
  if (o === "m") throw new TypeError("Private method is not writable");
  if (o === "a" && !r) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return o === "a" ? r.call(e, n) : r ? r.value = n : t.set(e, n), n;
}
function S(e, t, n, o) {
  if (n === "a" && !o) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !o : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? o : n === "a" ? o.call(e) : o ? o.value : t.get(e);
}
var Uf = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Uf = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function Ki(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Wi = (e) => {
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
}, U = class extends Error {
}, ce = class zi extends U {
  constructor(t, n, o, r) {
    super(`${zi.makeMessage(t, n, o)}`), this.status = t, this.headers = r, this.requestID = r?.get("x-request-id"), this.error = n;
    const i = n;
    this.code = i?.code, this.param = i?.param, this.type = i?.type;
  }
  static makeMessage(t, n, o) {
    const r = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && r ? `${t} ${r}` : t ? `${t} status code (no body)` : r || "(no status code or body)";
  }
  static generate(t, n, o, r) {
    if (!t || !r) return new $r({
      message: o,
      cause: Wi(n)
    });
    const i = n?.error;
    return t === 400 ? new Ff(t, i, o, r) : t === 401 ? new Of(t, i, o, r) : t === 403 ? new Gf(t, i, o, r) : t === 404 ? new Bf(t, i, o, r) : t === 409 ? new qf(t, i, o, r) : t === 422 ? new Hf(t, i, o, r) : t === 429 ? new Vf(t, i, o, r) : t >= 500 ? new Jf(t, i, o, r) : new zi(t, i, o, r);
  }
}, xe = class extends ce {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, $r = class extends ce {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Ds = class extends $r {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Ff = class extends ce {
}, Of = class extends ce {
}, Gf = class extends ce {
}, Bf = class extends ce {
}, qf = class extends ce {
}, Hf = class extends ce {
}, Vf = class extends ce {
}, Jf = class extends ce {
}, Kf = class extends U {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, Wf = class extends U {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, Ln = class extends Error {
  constructor(e) {
    super(e);
  }
}, zf = class extends ce {
  constructor(e, t, n) {
    let o = "OAuth2 authentication error", r;
    if (t && typeof t == "object") {
      const i = t;
      r = i.error;
      const a = i.error_description;
      a && typeof a == "string" ? o = a : r && (o = r);
    }
    super(e, t, o, n), this.error_code = r;
  }
}, ww = class extends U {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, Cw = /^[a-z][a-z0-9+.-]*:/i, Iw = (e) => Cw.test(e), ge = (e) => (ge = Array.isArray, ge(e)), Vu = ge;
function $s(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function Ju(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Rw(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function ui(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var bw = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new U(`${e} must be an integer`);
  if (t < 0) throw new U(`${e} must be a positive integer`);
  return t;
}, Pw = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, go = (e) => new Promise((t) => setTimeout(t, e)), qt = "6.44.0", Mw = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function xw() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var Nw = () => {
  const e = xw();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": qt,
    "X-Stainless-OS": Wu(Deno.build.os),
    "X-Stainless-Arch": Ku(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": qt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": qt,
    "X-Stainless-OS": Wu(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": Ku(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = kw();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": qt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": qt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function kw() {
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
var Ku = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Wu = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), zu, Dw = () => zu ?? (zu = Nw());
function Yf() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Xf(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Qf(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Xf({
    start() {
    },
    async pull(n) {
      const { done: o, value: r } = await t.next();
      o ? n.close() : n.enqueue(r);
    },
    async cancel() {
      await t.return?.();
    }
  });
}
function Zf(e) {
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
async function Yu(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var $w = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), jf = "RFC3986", eh = (e) => String(e), Xu = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: eh
};
var Yi = (e, t) => (Yi = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), Yi(e, t)), Ke = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), ci = 1024, Lw = (e, t, n, o, r) => {
  if (e.length === 0) return e;
  let i = e;
  if (typeof e == "symbol" ? i = Symbol.prototype.toString.call(e) : typeof e != "string" && (i = String(e)), n === "iso-8859-1") return escape(i).replace(/%u[0-9a-f]{4}/gi, function(u) {
    return "%26%23" + parseInt(u.slice(2), 16) + "%3B";
  });
  let a = "";
  for (let u = 0; u < i.length; u += ci) {
    const c = i.length >= ci ? i.slice(u, u + ci) : i, d = [];
    for (let h = 0; h < c.length; ++h) {
      let f = c.charCodeAt(h);
      if (f === 45 || f === 46 || f === 95 || f === 126 || f >= 48 && f <= 57 || f >= 65 && f <= 90 || f >= 97 && f <= 122 || r === "RFC1738" && (f === 40 || f === 41)) {
        d[d.length] = c.charAt(h);
        continue;
      }
      if (f < 128) {
        d[d.length] = Ke[f];
        continue;
      }
      if (f < 2048) {
        d[d.length] = Ke[192 | f >> 6] + Ke[128 | f & 63];
        continue;
      }
      if (f < 55296 || f >= 57344) {
        d[d.length] = Ke[224 | f >> 12] + Ke[128 | f >> 6 & 63] + Ke[128 | f & 63];
        continue;
      }
      h += 1, f = 65536 + ((f & 1023) << 10 | c.charCodeAt(h) & 1023), d[d.length] = Ke[240 | f >> 18] + Ke[128 | f >> 12 & 63] + Ke[128 | f >> 6 & 63] + Ke[128 | f & 63];
    }
    a += d.join("");
  }
  return a;
};
function Uw(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function Qu(e, t) {
  if (ge(e)) {
    const n = [];
    for (let o = 0; o < e.length; o += 1) n.push(t(e[o]));
    return n;
  }
  return t(e);
}
var th = {
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
}, nh = function(e, t) {
  Array.prototype.push.apply(e, ge(t) ? t : [t]);
}, Zu, te = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: Lw,
  encodeValuesOnly: !1,
  format: jf,
  formatter: eh,
  indices: !1,
  serializeDate(e) {
    return (Zu ?? (Zu = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function Fw(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var di = {};
function oh(e, t, n, o, r, i, a, u, c, d, h, f, p, m, g, _, y, E) {
  let w = e, C = E, P = 0, M = !1;
  for (; (C = C.get(di)) !== void 0 && !M; ) {
    const F = C.get(e);
    if (P += 1, typeof F < "u") {
      if (F === P) throw new RangeError("Cyclic object value");
      M = !0;
    }
    typeof C.get(di) > "u" && (P = 0);
  }
  if (typeof d == "function" ? w = d(t, w) : w instanceof Date ? w = p?.(w) : n === "comma" && ge(w) && (w = Qu(w, function(F) {
    return F instanceof Date ? p?.(F) : F;
  })), w === null) {
    if (i) return c && !_ ? c(t, te.encoder, y, "key", m) : t;
    w = "";
  }
  if (Fw(w) || Uw(w)) {
    if (c) {
      const F = _ ? t : c(t, te.encoder, y, "key", m);
      return [g?.(F) + "=" + g?.(c(w, te.encoder, y, "value", m))];
    }
    return [g?.(t) + "=" + g?.(String(w))];
  }
  const A = [];
  if (typeof w > "u") return A;
  let $;
  if (n === "comma" && ge(w))
    _ && c && (w = Qu(w, c)), $ = [{ value: w.length > 0 ? w.join(",") || null : void 0 }];
  else if (ge(d)) $ = d;
  else {
    const F = Object.keys(w);
    $ = h ? F.sort(h) : F;
  }
  const I = u ? String(t).replace(/\./g, "%2E") : String(t), x = o && ge(w) && w.length === 1 ? I + "[]" : I;
  if (r && ge(w) && w.length === 0) return x + "[]";
  for (let F = 0; F < $.length; ++F) {
    const H = $[F], ue = typeof H == "object" && typeof H.value < "u" ? H.value : w[H];
    if (a && ue === null) continue;
    const ie = f && u ? H.replace(/\./g, "%2E") : H, J = ge(w) ? typeof n == "function" ? n(x, ie) : x : x + (f ? "." + ie : "[" + ie + "]");
    E.set(e, P);
    const W = /* @__PURE__ */ new WeakMap();
    W.set(di, E), nh(A, oh(ue, J, n, o, r, i, a, u, n === "comma" && _ && ge(w) ? null : c, d, h, f, p, m, g, _, y, W));
  }
  return A;
}
function Ow(e = te) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || te.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = jf;
  if (typeof e.format < "u") {
    if (!Yi(Xu, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const o = Xu[n];
  let r = te.filter;
  (typeof e.filter == "function" || ge(e.filter)) && (r = e.filter);
  let i;
  if (e.arrayFormat && e.arrayFormat in th ? i = e.arrayFormat : "indices" in e ? i = e.indices ? "indices" : "repeat" : i = te.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  const a = typeof e.allowDots > "u" ? e.encodeDotInKeys ? !0 : te.allowDots : !!e.allowDots;
  return {
    addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : te.addQueryPrefix,
    allowDots: a,
    allowEmptyArrays: typeof e.allowEmptyArrays == "boolean" ? !!e.allowEmptyArrays : te.allowEmptyArrays,
    arrayFormat: i,
    charset: t,
    charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : te.charsetSentinel,
    commaRoundTrip: !!e.commaRoundTrip,
    delimiter: typeof e.delimiter > "u" ? te.delimiter : e.delimiter,
    encode: typeof e.encode == "boolean" ? e.encode : te.encode,
    encodeDotInKeys: typeof e.encodeDotInKeys == "boolean" ? e.encodeDotInKeys : te.encodeDotInKeys,
    encoder: typeof e.encoder == "function" ? e.encoder : te.encoder,
    encodeValuesOnly: typeof e.encodeValuesOnly == "boolean" ? e.encodeValuesOnly : te.encodeValuesOnly,
    filter: r,
    format: n,
    formatter: o,
    serializeDate: typeof e.serializeDate == "function" ? e.serializeDate : te.serializeDate,
    skipNulls: typeof e.skipNulls == "boolean" ? e.skipNulls : te.skipNulls,
    sort: typeof e.sort == "function" ? e.sort : null,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : te.strictNullHandling
  };
}
function Gw(e, t = {}) {
  let n = e;
  const o = Ow(t);
  let r, i;
  typeof o.filter == "function" ? (i = o.filter, n = i("", n)) : ge(o.filter) && (i = o.filter, r = i);
  const a = [];
  if (typeof n != "object" || n === null) return "";
  const u = th[o.arrayFormat], c = u === "comma" && o.commaRoundTrip;
  r || (r = Object.keys(n)), o.sort && r.sort(o.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let p = 0; p < r.length; ++p) {
    const m = r[p];
    o.skipNulls && n[m] === null || nh(a, oh(n[m], m, u, c, o.allowEmptyArrays, o.strictNullHandling, o.skipNulls, o.encodeDotInKeys, o.encode ? o.encoder : null, o.filter, o.sort, o.allowDots, o.serializeDate, o.format, o.formatter, o.encodeValuesOnly, o.charset, d));
  }
  const h = a.join(o.delimiter);
  let f = o.addQueryPrefix === !0 ? "?" : "";
  return o.charsetSentinel && (o.charset === "iso-8859-1" ? f += "utf8=%26%2310003%3B&" : f += "utf8=%E2%9C%93&"), h.length > 0 ? f + h : "";
}
function Bw(e) {
  return Gw(e, { arrayFormat: "brackets" });
}
function qw(e) {
  let t = 0;
  for (const r of e) t += r.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const r of e)
    n.set(r, o), o += r.length;
  return n;
}
var ju;
function Ls(e) {
  let t;
  return (ju ?? (t = new globalThis.TextEncoder(), ju = t.encode.bind(t)))(e);
}
var ec;
function tc(e) {
  let t;
  return (ec ?? (t = new globalThis.TextDecoder(), ec = t.decode.bind(t)))(e);
}
var Ee, we, Lr = class {
  constructor() {
    Ee.set(this, void 0), we.set(this, void 0), O(this, Ee, new Uint8Array(), "f"), O(this, we, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Ls(e) : e;
    O(this, Ee, qw([S(this, Ee, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = Hw(S(this, Ee, "f"), S(this, we, "f"))) != null; ) {
      if (o.carriage && S(this, we, "f") == null) {
        O(this, we, o.index, "f");
        continue;
      }
      if (S(this, we, "f") != null && (o.index !== S(this, we, "f") + 1 || o.carriage)) {
        n.push(tc(S(this, Ee, "f").subarray(0, S(this, we, "f") - 1))), O(this, Ee, S(this, Ee, "f").subarray(S(this, we, "f")), "f"), O(this, we, null, "f");
        continue;
      }
      const r = S(this, we, "f") !== null ? o.preceding - 1 : o.preceding, i = tc(S(this, Ee, "f").subarray(0, r));
      n.push(i), O(this, Ee, S(this, Ee, "f").subarray(o.index), "f"), O(this, we, null, "f");
    }
    return n;
  }
  flush() {
    return S(this, Ee, "f").length ? this.decode(`
`) : [];
  }
};
Ee = /* @__PURE__ */ new WeakMap(), we = /* @__PURE__ */ new WeakMap();
Lr.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Lr.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function Hw(e, t) {
  for (let r = t ?? 0; r < e.length; r++) {
    if (e[r] === 10) return {
      preceding: r,
      index: r + 1,
      carriage: !1
    };
    if (e[r] === 13) return {
      preceding: r,
      index: r + 1,
      carriage: !0
    };
  }
  return null;
}
function Vw(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var gr = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, nc = (e, t, n) => {
  if (e) {
    if (Rw(gr, e)) return e;
    se(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(gr))}`);
  }
};
function Un() {
}
function Go(e, t, n) {
  return !t || gr[e] > gr[n] ? Un : t[e].bind(t);
}
var Jw = {
  error: Un,
  warn: Un,
  info: Un,
  debug: Un
}, oc = /* @__PURE__ */ new WeakMap();
function se(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return Jw;
  const o = oc.get(t);
  if (o && o[0] === n) return o[1];
  const r = {
    error: Go("error", t, n),
    warn: Go("warn", t, n),
    info: Go("info", t, n),
    debug: Go("debug", t, n)
  };
  return oc.set(t, [n, r]), r;
}
var wt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "api-key" || t.toLowerCase() === "x-api-key" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), Pn, no = class Fn {
  constructor(t, n, o) {
    this.iterator = t, Pn.set(this, void 0), this.controller = n, O(this, Pn, o, "f");
  }
  static fromSSEResponse(t, n, o, r) {
    let i = !1;
    const a = o ? se(o) : console;
    async function* u() {
      if (i) throw new U("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let c = !1;
      try {
        for await (const d of Kw(t, n))
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
              if (h && h.error) throw new ce(void 0, h.error, void 0, t.headers);
              yield r ? {
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
              if (d.event == "error") throw new ce(void 0, h.error, h.message, void 0);
              yield {
                event: d.event,
                data: h
              };
            }
          }
        c = !0;
      } catch (d) {
        if (Ki(d)) return;
        throw d;
      } finally {
        c || n.abort();
      }
    }
    return new Fn(u, n, o);
  }
  static fromReadableStream(t, n, o) {
    let r = !1;
    async function* i() {
      const u = new Lr(), c = Zf(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
      for (const d of u.flush()) yield d;
    }
    async function* a() {
      if (r) throw new U("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      r = !0;
      let u = !1;
      try {
        for await (const c of i())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (Ki(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Fn(a, n, o);
  }
  [(Pn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], o = this.iterator(), r = (i) => ({ next: () => {
      if (i.length === 0) {
        const a = o.next();
        t.push(a), n.push(a);
      }
      return i.shift();
    } });
    return [new Fn(() => r(t), this.controller, S(this, Pn, "f")), new Fn(() => r(n), this.controller, S(this, Pn, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Xf({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: r, done: i } = await n.next();
          if (i) return o.close();
          const a = Ls(JSON.stringify(r) + `
`);
          o.enqueue(a);
        } catch (r) {
          o.error(r);
        }
      },
      async cancel() {
        await n.return?.();
      }
    });
  }
};
async function* Kw(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new U("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new U("Attempted to iterate over a response with no body");
  const n = new zw(), o = new Lr(), r = Zf(e.body);
  for await (const i of Ww(r)) for (const a of o.decode(i)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const i of o.flush()) {
    const a = n.decode(i);
    a && (yield a);
  }
}
async function* Ww(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Ls(n) : n;
    let r = new Uint8Array(t.length + o.length);
    r.set(t), r.set(o, t.length), t = r;
    let i;
    for (; (i = Vw(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var zw = class {
  constructor() {
    this.event = null, this.data = [], this.chunks = [];
  }
  decode(e) {
    if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
      if (!this.event && !this.data.length) return null;
      const r = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      return this.event = null, this.data = [], this.chunks = [], r;
    }
    if (this.chunks.push(e), e.startsWith(":")) return null;
    let [t, n, o] = Yw(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function Yw(e, t) {
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
async function rh(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: r, startTime: i } = t, a = await (async () => {
    if (t.options.stream)
      return se(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : no.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : ih(await n.json(), n) : await n.text();
  })();
  return se(e).debug(`[${o}] response parsed`, wt({
    retryOfRequestLogID: r,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
function ih(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var On, sh = class ah extends Promise {
  constructor(t, n, o = rh) {
    super((r) => {
      r(null);
    }), this.responsePromise = n, this.parseResponse = o, On.set(this, void 0), O(this, On, t, "f");
  }
  _thenUnwrap(t) {
    return new ah(S(this, On, "f"), this.responsePromise, async (n, o) => ih(t(await this.parseResponse(n, o), o), o.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(S(this, On, "f"), t))), this.parsedPromise;
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
var Bo, Ur = class {
  constructor(e, t, n, o) {
    Bo.set(this, void 0), O(this, Bo, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new U("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await S(this, Bo, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(Bo = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, Xw = class extends sh {
  constructor(e, t, n) {
    super(e, t, async (o, r) => new n(o, r.response, await rh(o, r), r.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, gt = class extends Ur {
  constructor(e, t, n, o) {
    super(e, t, n, o), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, Y = class extends Ur {
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
        ...$s(this.options.query),
        after: t
      }
    } : null;
  }
}, le = class extends Ur {
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
        ...$s(this.options.query),
        after: e
      }
    } : null;
  }
}, it = class extends Ur {
  constructor(e, t, n, o) {
    super(e, t, n, o), this.data = n.data || [], this.has_more = n.has_more || !1, this.next = n.next || null;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  hasNextPage() {
    return this.has_more === !1 ? !1 : super.hasNextPage();
  }
  nextPageRequestOptions() {
    const e = this.next;
    return e ? {
      ...this.options,
      query: {
        ...$s(this.options.query),
        after: e
      }
    } : null;
  }
}, Qw = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, Zw = "urn:ietf:params:oauth:grant-type:token-exchange", jw = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? Yf();
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
    const e = {
      grant_type: Zw,
      subject_token: await this.config.provider.getToken(),
      subject_token_type: Qw[this.config.provider.tokenType],
      identity_provider_id: this.config.identityProviderId,
      service_account_id: this.config.serviceAccountId
    };
    this.config.clientId && (e.client_id = this.config.clientId);
    const t = await this.fetch(this.tokenExchangeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(e)
    });
    if (!t.ok) {
      const i = await t.text();
      let a;
      try {
        a = JSON.parse(i);
      } catch {
      }
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new zf(t.status, a, t.headers) : ce.generate(t.status, a, `Token exchange failed with status ${t.status}`, t.headers);
    }
    const n = await t.json(), o = n.expires_in || 3600, r = Date.now() + o * 1e3;
    return this.cachedToken = {
      token: n.access_token,
      expiresAt: r
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
}, lh = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function zn(e, t, n) {
  return lh(), new File(e, t ?? "unknown_file", n);
}
function jo(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var Us = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Fr = async (e, t) => Xi(e.body) ? {
  ...e,
  body: await uh(e.body, t)
} : e, ze = async (e, t) => ({
  ...e,
  body: await uh(e.body, t)
}), rc = /* @__PURE__ */ new WeakMap();
function eC(e) {
  const t = typeof e == "function" ? e : e.fetch, n = rc.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const r = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new r(i).text();
    } catch {
      return !0;
    }
  })();
  return rc.set(t, o), o;
}
var uh = async (e, t) => {
  if (!await eC(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([o, r]) => Qi(n, o, r))), n;
}, ch = (e) => e instanceof Blob && "name" in e, tC = (e) => typeof e == "object" && e !== null && (e instanceof Response || Us(e) || ch(e)), Xi = (e) => {
  if (tC(e)) return !0;
  if (Array.isArray(e)) return e.some(Xi);
  if (e && typeof e == "object") {
    for (const t in e) if (Xi(e[t])) return !0;
  }
  return !1;
}, Qi = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, zn([await n.blob()], jo(n)));
    else if (Us(n)) e.append(t, zn([await new Response(Qf(n)).blob()], jo(n)));
    else if (ch(n)) e.append(t, n, jo(n));
    else if (Array.isArray(n)) await Promise.all(n.map((o) => Qi(e, t + "[]", o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([o, r]) => Qi(e, `${t}[${o}]`, r)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, dh = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", nC = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && dh(e), oC = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function rC(e, t, n) {
  if (lh(), e = await e, nC(e))
    return e instanceof File ? e : zn([await e.arrayBuffer()], e.name);
  if (oC(e)) {
    const r = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), zn(await Zi(r), t, n);
  }
  const o = await Zi(e);
  if (t || (t = jo(e)), !n?.type) {
    const r = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof r == "string" && (n = {
      ...n,
      type: r
    });
  }
  return zn(o, t, n);
}
async function Zi(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (dh(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Us(e)) for await (const n of e) t.push(...await Zi(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${iC(e)}`);
  }
  return t;
}
function iC(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var b = class {
  constructor(e) {
    this._client = e;
  }
};
function fh(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var ic = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), sC = (e = fh) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let r = !1;
  const i = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (r = !0);
    const m = o[p];
    let g = (r ? encodeURIComponent : e)("" + m);
    return p !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? ic) ?? ic)?.toString) && (g = m + "", i.push({
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
    throw new U(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}, v = /* @__PURE__ */ sC(fh), hh = class extends b {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/chat/completions/${e}/messages`, Y, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
function _r(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function Fs(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function _o(e) {
  return e?.$brand === "auto-parseable-tool";
}
function aC(e, t) {
  return !t || !ph(t) ? {
    ...e,
    choices: e.choices.map((n) => (mh(n.message.tool_calls), {
      ...n,
      message: {
        ...n.message,
        parsed: null,
        ...n.message.tool_calls ? { tool_calls: n.message.tool_calls } : void 0
      }
    }))
  } : Os(e, t);
}
function Os(e, t) {
  const n = e.choices.map((o) => {
    if (o.finish_reason === "length") throw new Kf();
    if (o.finish_reason === "content_filter") throw new Wf();
    return mh(o.message.tool_calls), {
      ...o,
      message: {
        ...o.message,
        ...o.message.tool_calls ? { tool_calls: o.message.tool_calls?.map((r) => uC(t, r)) ?? void 0 } : void 0,
        parsed: o.message.content && !o.message.refusal ? lC(t, o.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function lC(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function uC(e, t) {
  const n = e.tools?.find((o) => _r(o) && o.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: _o(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function cC(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((o) => _r(o) && o.function?.name === t.function.name);
  return _r(n) && (_o(n) || n?.function.strict || !1);
}
function ph(e) {
  return Fs(e.response_format) ? !0 : e.tools?.some((t) => _o(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function mh(e) {
  for (const t of e || []) if (t.type !== "function") throw new U(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function dC(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new U(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new U(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var yr = (e) => e?.role === "assistant", gh = (e) => e?.role === "tool", ji, er, tr, Gn, Bn, nr, qn, je, Hn, vr, Ar, Ht, _h, Gs = class {
  constructor() {
    ji.add(this), this.controller = new AbortController(), er.set(this, void 0), tr.set(this, () => {
    }), Gn.set(this, () => {
    }), Bn.set(this, void 0), nr.set(this, () => {
    }), qn.set(this, () => {
    }), je.set(this, {}), Hn.set(this, !1), vr.set(this, !1), Ar.set(this, !1), Ht.set(this, !1), O(this, er, new Promise((e, t) => {
      O(this, tr, e, "f"), O(this, Gn, t, "f");
    }), "f"), O(this, Bn, new Promise((e, t) => {
      O(this, nr, e, "f"), O(this, qn, t, "f");
    }), "f"), S(this, er, "f").catch(() => {
    }), S(this, Bn, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, S(this, ji, "m", _h).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (S(this, tr, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return S(this, Hn, "f");
  }
  get errored() {
    return S(this, vr, "f");
  }
  get aborted() {
    return S(this, Ar, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(e, t) {
    return (S(this, je, "f")[e] || (S(this, je, "f")[e] = [])).push({ listener: t }), this;
  }
  off(e, t) {
    const n = S(this, je, "f")[e];
    if (!n) return this;
    const o = n.findIndex((r) => r.listener === t);
    return o >= 0 && n.splice(o, 1), this;
  }
  once(e, t) {
    return (S(this, je, "f")[e] || (S(this, je, "f")[e] = [])).push({
      listener: t,
      once: !0
    }), this;
  }
  emitted(e) {
    return new Promise((t, n) => {
      O(this, Ht, !0, "f"), e !== "error" && this.once("error", n), this.once(e, t);
    });
  }
  async done() {
    O(this, Ht, !0, "f"), await S(this, Bn, "f");
  }
  _emit(e, ...t) {
    if (S(this, Hn, "f")) return;
    e === "end" && (O(this, Hn, !0, "f"), S(this, nr, "f").call(this));
    const n = S(this, je, "f")[e];
    if (n && (S(this, je, "f")[e] = n.filter((o) => !o.once), n.forEach(({ listener: o }) => o(...t))), e === "abort") {
      const o = t[0];
      !S(this, Ht, "f") && !n?.length && Promise.reject(o), S(this, Gn, "f").call(this, o), S(this, qn, "f").call(this, o), this._emit("end");
      return;
    }
    if (e === "error") {
      const o = t[0];
      !S(this, Ht, "f") && !n?.length && Promise.reject(o), S(this, Gn, "f").call(this, o), S(this, qn, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
er = /* @__PURE__ */ new WeakMap(), tr = /* @__PURE__ */ new WeakMap(), Gn = /* @__PURE__ */ new WeakMap(), Bn = /* @__PURE__ */ new WeakMap(), nr = /* @__PURE__ */ new WeakMap(), qn = /* @__PURE__ */ new WeakMap(), je = /* @__PURE__ */ new WeakMap(), Hn = /* @__PURE__ */ new WeakMap(), vr = /* @__PURE__ */ new WeakMap(), Ar = /* @__PURE__ */ new WeakMap(), Ht = /* @__PURE__ */ new WeakMap(), ji = /* @__PURE__ */ new WeakSet(), _h = function(t) {
  if (O(this, vr, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new xe()), t instanceof xe)
    return O(this, Ar, !0, "f"), this._emit("abort", t);
  if (t instanceof U) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new U(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new U(String(t)));
};
function fC(e) {
  return typeof e.parse == "function";
}
var de, es, Tr, ts, ns, os, yh, vh, hC = 10, Ah = class extends Gs {
  constructor() {
    super(...arguments), de.add(this), this._chatCompletions = [], this.messages = [];
  }
  _addChatCompletion(e) {
    this._chatCompletions.push(e), this._emit("chatCompletion", e);
    const t = e.choices[0]?.message;
    return t && this._addMessage(t), e;
  }
  _addMessage(e, t = !0) {
    if ("content" in e || (e.content = null), this.messages.push(e), t) {
      if (this._emit("message", e), gh(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (yr(e) && e.tool_calls)
        for (const n of e.tool_calls) n.type === "function" && this._emit("functionToolCall", n.function);
    }
  }
  async finalChatCompletion() {
    await this.done();
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    if (!e) throw new U("stream ended without producing a ChatCompletion");
    return e;
  }
  async finalContent() {
    return await this.done(), S(this, de, "m", es).call(this);
  }
  async finalMessage() {
    return await this.done(), S(this, de, "m", Tr).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), S(this, de, "m", ts).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), S(this, de, "m", ns).call(this);
  }
  async totalUsage() {
    return await this.done(), S(this, de, "m", os).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = S(this, de, "m", Tr).call(this);
    t && this._emit("finalMessage", t);
    const n = S(this, de, "m", es).call(this);
    n && this._emit("finalContent", n);
    const o = S(this, de, "m", ts).call(this);
    o && this._emit("finalFunctionToolCall", o);
    const r = S(this, de, "m", ns).call(this);
    r != null && this._emit("finalFunctionToolCallResult", r), this._chatCompletions.some((i) => i.usage) && this._emit("totalUsage", S(this, de, "m", os).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), S(this, de, "m", yh).call(this, t);
    const r = await e.chat.completions.create({
      ...t,
      stream: !1
    }, {
      ...n,
      signal: this.controller.signal
    });
    return this._connected(), this._addChatCompletion(Os(r, t));
  }
  async _runChatCompletion(e, t, n) {
    for (const o of t.messages) this._addMessage(o, !1);
    return await this._createChatCompletion(e, t, n);
  }
  async _runTools(e, t, n) {
    const o = "tool", { tool_choice: r = "auto", stream: i, ...a } = t, u = typeof r != "string" && r.type === "function" && r?.function?.name, { maxChatCompletions: c = hC } = n || {}, d = t.tools.map((p) => {
      if (_o(p)) {
        if (!p.$callback) throw new U("Tool given to `.runTools()` that does not have an associated function");
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
        tool_choice: r,
        tools: f,
        messages: [...this.messages]
      }, n)).choices[0]?.message;
      if (!m) throw new U("missing message in ChatCompletion response");
      if (!m.tool_calls?.length) return;
      for (const g of m.tool_calls) {
        if (g.type !== "function") continue;
        const _ = g.id, { name: y, arguments: E } = g.function, w = h[y];
        if (w) {
          if (u && u !== y) {
            const A = `Invalid tool_call: ${JSON.stringify(y)}. ${JSON.stringify(u)} requested. Please try again`;
            this._addMessage({
              role: o,
              tool_call_id: _,
              content: A
            });
            continue;
          }
        } else {
          const A = `Invalid tool_call: ${JSON.stringify(y)}. Available options are: ${Object.keys(h).map(($) => JSON.stringify($)).join(", ")}. Please try again`;
          this._addMessage({
            role: o,
            tool_call_id: _,
            content: A
          });
          continue;
        }
        let C;
        try {
          C = fC(w) ? await w.parse(E) : E;
        } catch (A) {
          const $ = A instanceof Error ? A.message : String(A);
          this._addMessage({
            role: o,
            tool_call_id: _,
            content: $
          });
          continue;
        }
        const P = await w.function(C, this), M = S(this, de, "m", vh).call(this, P);
        if (this._addMessage({
          role: o,
          tool_call_id: _,
          content: M
        }), u) return;
      }
    }
  }
};
de = /* @__PURE__ */ new WeakSet(), es = function() {
  return S(this, de, "m", Tr).call(this).content ?? null;
}, Tr = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (yr(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new U("stream ended without producing a ChatCompletionMessage with role=assistant");
}, ts = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (yr(n) && n?.tool_calls?.length) for (let o = n.tool_calls.length - 1; o >= 0; o--) {
      const r = n.tool_calls[o];
      if (r?.type === "function") return r.function;
    }
  }
}, ns = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (gh(n) && n.content != null && typeof n.content == "string" && this.messages.some((o) => o.role === "assistant" && o.tool_calls?.some((r) => r.type === "function" && r.id === n.tool_call_id))) return n.content;
  }
}, os = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, yh = function(t) {
  if (t.n != null && t.n > 1) throw new U("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, vh = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var pC = class Th extends Ah {
  static runTools(t, n, o) {
    const r = new Th(), i = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return r._run(() => r._runTools(t, n, i)), r;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), yr(t) && t.content && this._emit("content", t.content);
  }
}, oe = {
  STR: 1,
  NUM: 2,
  ARR: 4,
  OBJ: 8,
  NULL: 16,
  BOOL: 32,
  NAN: 64,
  INFINITY: 128,
  MINUS_INFINITY: 256,
  INF: 384,
  SPECIAL: 496,
  ATOM: 499,
  COLLECTION: 12,
  ALL: 511
}, mC = class extends Error {
}, gC = class extends Error {
};
function _C(e, t = oe.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return yC(e.trim(), t);
}
var yC = (e, t) => {
  const n = e.length;
  let o = 0;
  const r = (p) => {
    throw new mC(`${p} at position ${o}`);
  }, i = (p) => {
    throw new gC(`${p} at position ${o}`);
  }, a = () => (f(), o >= n && r("Unexpected end of input"), e[o] === '"' ? u() : e[o] === "{" ? c() : e[o] === "[" ? d() : e.substring(o, o + 4) === "null" || oe.NULL & t && n - o < 4 && "null".startsWith(e.substring(o)) ? (o += 4, null) : e.substring(o, o + 4) === "true" || oe.BOOL & t && n - o < 4 && "true".startsWith(e.substring(o)) ? (o += 4, !0) : e.substring(o, o + 5) === "false" || oe.BOOL & t && n - o < 5 && "false".startsWith(e.substring(o)) ? (o += 5, !1) : e.substring(o, o + 8) === "Infinity" || oe.INFINITY & t && n - o < 8 && "Infinity".startsWith(e.substring(o)) ? (o += 8, 1 / 0) : e.substring(o, o + 9) === "-Infinity" || oe.MINUS_INFINITY & t && 1 < n - o && n - o < 9 && "-Infinity".startsWith(e.substring(o)) ? (o += 9, -1 / 0) : e.substring(o, o + 3) === "NaN" || oe.NAN & t && n - o < 3 && "NaN".startsWith(e.substring(o)) ? (o += 3, NaN) : h()), u = () => {
    const p = o;
    let m = !1;
    for (o++; o < n && (e[o] !== '"' || m && e[o - 1] === "\\"); )
      m = e[o] === "\\" ? !m : !1, o++;
    if (e.charAt(o) == '"') try {
      return JSON.parse(e.substring(p, ++o - Number(m)));
    } catch (g) {
      i(String(g));
    }
    else if (oe.STR & t) try {
      return JSON.parse(e.substring(p, o - Number(m)) + '"');
    } catch {
      return JSON.parse(e.substring(p, e.lastIndexOf("\\")) + '"');
    }
    r("Unterminated string literal");
  }, c = () => {
    o++, f();
    const p = {};
    try {
      for (; e[o] !== "}"; ) {
        if (f(), o >= n && oe.OBJ & t) return p;
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
          if (oe.OBJ & t) return p;
          throw g;
        }
        f(), e[o] === "," && o++;
      }
    } catch {
      if (oe.OBJ & t) return p;
      r("Expected '}' at end of object");
    }
    return o++, p;
  }, d = () => {
    o++;
    const p = [];
    try {
      for (; e[o] !== "]"; )
        p.push(a()), f(), e[o] === "," && o++;
    } catch {
      if (oe.ARR & t) return p;
      r("Expected ']' at end of array");
    }
    return o++, p;
  }, h = () => {
    if (o === 0) {
      e === "-" && oe.NUM & t && r("Not sure what '-' is");
      try {
        return JSON.parse(e);
      } catch (m) {
        if (oe.NUM & t) try {
          return e[e.length - 1] === "." ? JSON.parse(e.substring(0, e.lastIndexOf("."))) : JSON.parse(e.substring(0, e.lastIndexOf("e")));
        } catch {
        }
        i(String(m));
      }
    }
    const p = o;
    for (e[o] === "-" && o++; e[o] && !",]}".includes(e[o]); ) o++;
    o == n && !(oe.NUM & t) && r("Unterminated number literal");
    try {
      return JSON.parse(e.substring(p, o));
    } catch {
      e.substring(p, o) === "-" && oe.NUM & t && r("Not sure what '-' is");
      try {
        return JSON.parse(e.substring(p, e.lastIndexOf("e")));
      } catch (g) {
        i(String(g));
      }
    }
  }, f = () => {
    for (; o < n && [
      32,
      10,
      13,
      9
    ].includes(e.charCodeAt(o)); ) o++;
  };
  return a();
}, sc = (e) => _C(e, oe.ALL ^ oe.NUM), j, Ze, Ft, ut, fi, qo, hi, pi, mi, Ho, gi, ac, Sh = class rs extends Ah {
  constructor(t) {
    super(), j.add(this), Ze.set(this, void 0), Ft.set(this, void 0), ut.set(this, void 0), O(this, Ze, t, "f"), O(this, Ft, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return S(this, ut, "f");
  }
  static fromReadableStream(t) {
    const n = new rs(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createChatCompletion(t, n, o) {
    const r = new rs(n);
    return r._run(() => r._runChatCompletion(t, {
      ...n,
      stream: !0
    }, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), r;
  }
  async _createChatCompletion(t, n, o) {
    super._createChatCompletion;
    const r = o?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), S(this, j, "m", fi).call(this);
    const i = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const a of i) S(this, j, "m", hi).call(this, a);
    if (i.controller.signal?.aborted) throw new xe();
    return this._addChatCompletion(S(this, j, "m", Ho).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), S(this, j, "m", fi).call(this), this._connected();
    const r = no.fromReadableStream(t, this.controller);
    let i;
    for await (const a of r)
      i && i !== a.id && this._addChatCompletion(S(this, j, "m", Ho).call(this)), S(this, j, "m", hi).call(this, a), i = a.id;
    if (r.controller.signal?.aborted) throw new xe();
    return this._addChatCompletion(S(this, j, "m", Ho).call(this));
  }
  [(Ze = /* @__PURE__ */ new WeakMap(), Ft = /* @__PURE__ */ new WeakMap(), ut = /* @__PURE__ */ new WeakMap(), j = /* @__PURE__ */ new WeakSet(), fi = function() {
    this.ended || O(this, ut, void 0, "f");
  }, qo = function(n) {
    let o = S(this, Ft, "f")[n.index];
    return o || (o = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, S(this, Ft, "f")[n.index] = o, o);
  }, hi = function(n) {
    if (this.ended) return;
    const o = S(this, j, "m", ac).call(this, n);
    this._emit("chunk", n, o);
    for (const r of n.choices) {
      const i = o.choices[r.index];
      r.delta.content != null && i.message?.role === "assistant" && i.message?.content && (this._emit("content", r.delta.content, i.message.content), this._emit("content.delta", {
        delta: r.delta.content,
        snapshot: i.message.content,
        parsed: i.message.parsed
      })), r.delta.refusal != null && i.message?.role === "assistant" && i.message?.refusal && this._emit("refusal.delta", {
        delta: r.delta.refusal,
        snapshot: i.message.refusal
      }), r.logprobs?.content != null && i.message?.role === "assistant" && this._emit("logprobs.content.delta", {
        content: r.logprobs?.content,
        snapshot: i.logprobs?.content ?? []
      }), r.logprobs?.refusal != null && i.message?.role === "assistant" && this._emit("logprobs.refusal.delta", {
        refusal: r.logprobs?.refusal,
        snapshot: i.logprobs?.refusal ?? []
      });
      const a = S(this, j, "m", qo).call(this, i);
      i.finish_reason && (S(this, j, "m", mi).call(this, i), a.current_tool_call_index != null && S(this, j, "m", pi).call(this, i, a.current_tool_call_index));
      for (const u of r.delta.tool_calls ?? [])
        a.current_tool_call_index !== u.index && (S(this, j, "m", mi).call(this, i), a.current_tool_call_index != null && S(this, j, "m", pi).call(this, i, a.current_tool_call_index)), a.current_tool_call_index = u.index;
      for (const u of r.delta.tool_calls ?? []) {
        const c = i.message.tool_calls?.[u.index];
        c?.type && (c?.type === "function" ? this._emit("tool_calls.function.arguments.delta", {
          name: c.function?.name,
          index: u.index,
          arguments: c.function.arguments,
          parsed_arguments: c.function.parsed_arguments,
          arguments_delta: u.function?.arguments ?? ""
        }) : c?.type);
      }
    }
  }, pi = function(n, o) {
    if (S(this, j, "m", qo).call(this, n).done_tool_calls.has(o)) return;
    const r = n.message.tool_calls?.[o];
    if (!r) throw new Error("no tool call snapshot");
    if (!r.type) throw new Error("tool call snapshot missing `type`");
    if (r.type === "function") {
      const i = S(this, Ze, "f")?.tools?.find((a) => _r(a) && a.function.name === r.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: r.function.name,
        index: o,
        arguments: r.function.arguments,
        parsed_arguments: _o(i) ? i.$parseRaw(r.function.arguments) : i?.function.strict ? JSON.parse(r.function.arguments) : null
      });
    } else r.type;
  }, mi = function(n) {
    const o = S(this, j, "m", qo).call(this, n);
    if (n.message.content && !o.content_done) {
      o.content_done = !0;
      const r = S(this, j, "m", gi).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: r ? r.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !o.refusal_done && (o.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !o.logprobs_content_done && (o.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !o.logprobs_refusal_done && (o.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, Ho = function() {
    if (this.ended) throw new U("stream has ended, this shouldn't happen");
    const n = S(this, ut, "f");
    if (!n) throw new U("request ended without sending any chunks");
    return O(this, ut, void 0, "f"), O(this, Ft, [], "f"), vC(n, S(this, Ze, "f"));
  }, gi = function() {
    const n = S(this, Ze, "f")?.response_format;
    return Fs(n) ? n : null;
  }, ac = function(n) {
    var o, r, i, a;
    let u = S(this, ut, "f");
    const { choices: c, ...d } = n;
    u ? Object.assign(u, d) : u = O(this, ut, {
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
        const { content: A, refusal: $, ...I } = m;
        Object.assign(_.logprobs, I), A && ((o = _.logprobs).content ?? (o.content = []), _.logprobs.content.push(...A)), $ && ((r = _.logprobs).refusal ?? (r.refusal = []), _.logprobs.refusal.push(...$));
      }
      if (f && (_.finish_reason = f, S(this, Ze, "f") && ph(S(this, Ze, "f")))) {
        if (f === "length") throw new Kf();
        if (f === "content_filter") throw new Wf();
      }
      if (Object.assign(_, g), !h) continue;
      const { content: y, refusal: E, function_call: w, role: C, tool_calls: P, ...M } = h;
      if (Object.assign(_.message, M), E && (_.message.refusal = (_.message.refusal || "") + E), C && (_.message.role = C), w && (_.message.function_call ? (w.name && (_.message.function_call.name = w.name), w.arguments && ((i = _.message.function_call).arguments ?? (i.arguments = ""), _.message.function_call.arguments += w.arguments)) : _.message.function_call = w), y && (_.message.content = (_.message.content || "") + y, !_.message.refusal && S(this, j, "m", gi).call(this) && (_.message.parsed = sc(_.message.content))), P) {
        _.message.tool_calls || (_.message.tool_calls = []);
        for (const { index: A, id: $, type: I, function: x, ...F } of P) {
          const H = (a = _.message.tool_calls)[A] ?? (a[A] = {});
          Object.assign(H, F), $ && (H.id = $), I && (H.type = I), x && (H.function ?? (H.function = {
            name: x.name ?? "",
            arguments: ""
          })), x?.name && (H.function.name = x.name), x?.arguments && (H.function.arguments += x.arguments, cC(S(this, Ze, "f"), H) && (H.function.parsed_arguments = sc(H.function.arguments)));
        }
      }
    }
    return u;
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let o = !1;
    return this.on("chunk", (r) => {
      const i = n.shift();
      i ? i.resolve(r) : t.push(r);
    }), this.on("end", () => {
      o = !0;
      for (const r of n) r.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (r) => {
      o = !0;
      for (const i of n) i.reject(r);
      n.length = 0;
    }), this.on("error", (r) => {
      o = !0;
      for (const i of n) i.reject(r);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : o ? {
        value: void 0,
        done: !0
      } : new Promise((r, i) => n.push({
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
  toReadableStream() {
    return new no(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
function vC(e, t) {
  const { id: n, choices: o, created: r, model: i, system_fingerprint: a, ...u } = e;
  return aC({
    ...u,
    id: n,
    choices: o.map(({ message: c, finish_reason: d, index: h, logprobs: f, ...p }) => {
      if (!d) throw new U(`missing finish_reason for choice ${h}`);
      const { content: m = null, function_call: g, tool_calls: _, ...y } = c, E = c.role;
      if (!E) throw new U(`missing role for choice ${h}`);
      if (g) {
        const { arguments: w, name: C } = g;
        if (w == null) throw new U(`missing function_call.arguments for choice ${h}`);
        if (!C) throw new U(`missing function_call.name for choice ${h}`);
        return {
          ...p,
          message: {
            content: m,
            function_call: {
              arguments: w,
              name: C
            },
            role: E,
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
          role: E,
          content: m,
          refusal: c.refusal ?? null,
          tool_calls: _.map((w, C) => {
            const { function: P, type: M, id: A, ...$ } = w, { arguments: I, name: x, ...F } = P || {};
            if (A == null) throw new U(`missing choices[${h}].tool_calls[${C}].id
${Vo(e)}`);
            if (M == null) throw new U(`missing choices[${h}].tool_calls[${C}].type
${Vo(e)}`);
            if (x == null) throw new U(`missing choices[${h}].tool_calls[${C}].function.name
${Vo(e)}`);
            if (I == null) throw new U(`missing choices[${h}].tool_calls[${C}].function.arguments
${Vo(e)}`);
            return {
              ...$,
              id: A,
              type: M,
              function: {
                ...F,
                name: x,
                arguments: I
              }
            };
          })
        }
      } : {
        ...p,
        message: {
          ...y,
          content: m,
          role: E,
          refusal: c.refusal ?? null
        },
        finish_reason: d,
        index: h,
        logprobs: f
      };
    }),
    created: r,
    model: i,
    object: "chat.completion",
    ...a ? { system_fingerprint: a } : {}
  }, t);
}
function Vo(e) {
  return JSON.stringify(e);
}
var AC = class is extends Sh {
  static fromReadableStream(t) {
    const n = new is(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static runTools(t, n, o) {
    const r = new is(n), i = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return r._run(() => r._runTools(t, n, i)), r;
  }
}, Bs = class extends b {
  constructor() {
    super(...arguments), this.messages = new hh(this._client);
  }
  create(e, t) {
    return this._client.post("/chat/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/chat/completions/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/chat/completions/${e}`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chat/completions", Y, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/chat/completions/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  parse(e, t) {
    return dC(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => Os(n, e));
  }
  runTools(e, t) {
    return e.stream ? AC.runTools(this._client, e, t) : pC.runTools(this._client, e, t);
  }
  stream(e, t) {
    return Sh.createChatCompletion(this._client, e, t);
  }
};
Bs.Messages = hh;
var qs = class extends b {
  constructor() {
    super(...arguments), this.completions = new Bs(this._client);
  }
};
qs.Completions = Bs;
var Eh = class extends b {
  create(e, t) {
    return this._client.post("/organization/admin_api_keys", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/organization/admin_api_keys/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/admin_api_keys", Y, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/organization/admin_api_keys/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, wh = class extends b {
  list(e = {}, t) {
    return this._client.getAPIList("/organization/audit_logs", le, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Ch = class extends b {
  create(e, t) {
    return this._client.post("/organization/certificates", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t = {}, n) {
    return this._client.get(v`/organization/certificates/${e}`, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/organization/certificates/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/certificates", le, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/organization/certificates/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  activate(e, t) {
    return this._client.getAPIList("/organization/certificates/activate", gt, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t) {
    return this._client.getAPIList("/organization/certificates/deactivate", gt, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Ih = class extends b {
  retrieve(e) {
    return this._client.get("/organization/data_retention", {
      ...e,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t) {
    return this._client.post("/organization/data_retention", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Rh = class extends b {
  create(e, t) {
    return this._client.post("/organization/invites", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/organization/invites/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/invites", le, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/organization/invites/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, bh = class extends b {
  create(e, t) {
    return this._client.post("/organization/roles", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/organization/roles/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/organization/roles/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/roles", it, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/organization/roles/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Ph = class extends b {
  create(e, t) {
    return this._client.post("/organization/spend_alerts", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/organization/spend_alerts/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/organization/spend_alerts/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/spend_alerts", le, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/organization/spend_alerts/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Mh = class extends b {
  audioSpeeches(e, t) {
    return this._client.get("/organization/usage/audio_speeches", {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  audioTranscriptions(e, t) {
    return this._client.get("/organization/usage/audio_transcriptions", {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  codeInterpreterSessions(e, t) {
    return this._client.get("/organization/usage/code_interpreter_sessions", {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  completions(e, t) {
    return this._client.get("/organization/usage/completions", {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  costs(e, t) {
    return this._client.get("/organization/costs", {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  embeddings(e, t) {
    return this._client.get("/organization/usage/embeddings", {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  fileSearchCalls(e, t) {
    return this._client.get("/organization/usage/file_search_calls", {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  images(e, t) {
    return this._client.get("/organization/usage/images", {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  moderations(e, t) {
    return this._client.get("/organization/usage/moderations", {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  vectorStores(e, t) {
    return this._client.get("/organization/usage/vector_stores", {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  webSearchCalls(e, t) {
    return this._client.get("/organization/usage/web_search_calls", {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, xh = class extends b {
  create(e, t, n) {
    return this._client.post(v`/organization/groups/${e}/roles`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { group_id: o } = t;
    return this._client.get(v`/organization/groups/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/groups/${e}/roles`, it, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { group_id: o } = t;
    return this._client.delete(v`/organization/groups/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Nh = class extends b {
  create(e, t, n) {
    return this._client.post(v`/organization/groups/${e}/users`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { group_id: o } = t;
    return this._client.get(v`/organization/groups/${o}/users/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/groups/${e}/users`, it, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { group_id: o } = t;
    return this._client.delete(v`/organization/groups/${o}/users/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Or = class extends b {
  constructor() {
    super(...arguments), this.users = new Nh(this._client), this.roles = new xh(this._client);
  }
  create(e, t) {
    return this._client.post("/organization/groups", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/organization/groups/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/organization/groups/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/groups", it, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/organization/groups/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
Or.Users = Nh;
Or.Roles = xh;
var kh = class extends b {
  retrieve(e, t, n) {
    const { project_id: o } = t;
    return this._client.get(v`/organization/projects/${o}/api_keys/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/api_keys`, le, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: o } = t;
    return this._client.delete(v`/organization/projects/${o}/api_keys/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Dh = class extends b {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/certificates`, le, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  activate(e, t, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/certificates/activate`, gt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/certificates/deactivate`, gt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, $h = class extends b {
  retrieve(e, t) {
    return this._client.get(v`/organization/projects/${e}/data_retention`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/organization/projects/${e}/data_retention`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Lh = class extends b {
  retrieve(e, t) {
    return this._client.get(v`/organization/projects/${e}/hosted_tool_permissions`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/organization/projects/${e}/hosted_tool_permissions`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Uh = class extends b {
  retrieve(e, t) {
    return this._client.get(v`/organization/projects/${e}/model_permissions`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/organization/projects/${e}/model_permissions`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/organization/projects/${e}/model_permissions`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Fh = class extends b {
  listRateLimits(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/rate_limits`, le, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  updateRateLimit(e, t, n) {
    const { project_id: o, ...r } = t;
    return this._client.post(v`/organization/projects/${o}/rate_limits/${e}`, {
      body: r,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Oh = class extends b {
  create(e, t, n) {
    return this._client.post(v`/projects/${e}/roles`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: o } = t;
    return this._client.get(v`/projects/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    const { project_id: o, ...r } = t;
    return this._client.post(v`/projects/${o}/roles/${e}`, {
      body: r,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/projects/${e}/roles`, it, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: o } = t;
    return this._client.delete(v`/projects/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Gh = class extends b {
  create(e, t, n) {
    return this._client.post(v`/organization/projects/${e}/service_accounts`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: o } = t;
    return this._client.get(v`/organization/projects/${o}/service_accounts/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    const { project_id: o, ...r } = t;
    return this._client.post(v`/organization/projects/${o}/service_accounts/${e}`, {
      body: r,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/service_accounts`, le, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: o } = t;
    return this._client.delete(v`/organization/projects/${o}/service_accounts/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Bh = class extends b {
  create(e, t, n) {
    return this._client.post(v`/organization/projects/${e}/spend_alerts`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: o } = t;
    return this._client.get(v`/organization/projects/${o}/spend_alerts/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    const { project_id: o, ...r } = t;
    return this._client.post(v`/organization/projects/${o}/spend_alerts/${e}`, {
      body: r,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/spend_alerts`, le, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: o } = t;
    return this._client.delete(v`/organization/projects/${o}/spend_alerts/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, qh = class extends b {
  create(e, t, n) {
    const { project_id: o, ...r } = t;
    return this._client.post(v`/projects/${o}/groups/${e}/roles`, {
      body: r,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: o, group_id: r } = t;
    return this._client.get(v`/projects/${o}/groups/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t, n) {
    const { project_id: o, ...r } = t;
    return this._client.getAPIList(v`/projects/${o}/groups/${e}/roles`, it, {
      query: r,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: o, group_id: r } = t;
    return this._client.delete(v`/projects/${o}/groups/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Hs = class extends b {
  constructor() {
    super(...arguments), this.roles = new qh(this._client);
  }
  create(e, t, n) {
    return this._client.post(v`/organization/projects/${e}/groups`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: o, ...r } = t;
    return this._client.get(v`/organization/projects/${o}/groups/${e}`, {
      query: r,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/groups`, it, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: o } = t;
    return this._client.delete(v`/organization/projects/${o}/groups/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
Hs.Roles = qh;
var Hh = class extends b {
  create(e, t, n) {
    const { project_id: o, ...r } = t;
    return this._client.post(v`/projects/${o}/users/${e}/roles`, {
      body: r,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: o, user_id: r } = t;
    return this._client.get(v`/projects/${o}/users/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t, n) {
    const { project_id: o, ...r } = t;
    return this._client.getAPIList(v`/projects/${o}/users/${e}/roles`, it, {
      query: r,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: o, user_id: r } = t;
    return this._client.delete(v`/projects/${o}/users/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Vs = class extends b {
  constructor() {
    super(...arguments), this.roles = new Hh(this._client);
  }
  create(e, t, n) {
    return this._client.post(v`/organization/projects/${e}/users`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: o } = t;
    return this._client.get(v`/organization/projects/${o}/users/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    const { project_id: o, ...r } = t;
    return this._client.post(v`/organization/projects/${o}/users/${e}`, {
      body: r,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/users`, le, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: o } = t;
    return this._client.delete(v`/organization/projects/${o}/users/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
Vs.Roles = Hh;
var Re = class extends b {
  constructor() {
    super(...arguments), this.users = new Vs(this._client), this.serviceAccounts = new Gh(this._client), this.apiKeys = new kh(this._client), this.rateLimits = new Fh(this._client), this.modelPermissions = new Uh(this._client), this.hostedToolPermissions = new Lh(this._client), this.groups = new Hs(this._client), this.roles = new Oh(this._client), this.dataRetention = new $h(this._client), this.spendAlerts = new Bh(this._client), this.certificates = new Dh(this._client);
  }
  create(e, t) {
    return this._client.post("/organization/projects", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/organization/projects/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/organization/projects/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/projects", le, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  archive(e, t) {
    return this._client.post(v`/organization/projects/${e}/archive`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
Re.Users = Vs;
Re.ServiceAccounts = Gh;
Re.APIKeys = kh;
Re.RateLimits = Fh;
Re.ModelPermissions = Uh;
Re.HostedToolPermissions = Lh;
Re.Groups = Hs;
Re.Roles = Oh;
Re.DataRetention = $h;
Re.SpendAlerts = Bh;
Re.Certificates = Dh;
var Vh = class extends b {
  create(e, t, n) {
    return this._client.post(v`/organization/users/${e}/roles`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { user_id: o } = t;
    return this._client.get(v`/organization/users/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/users/${e}/roles`, it, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { user_id: o } = t;
    return this._client.delete(v`/organization/users/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Js = class extends b {
  constructor() {
    super(...arguments), this.roles = new Vh(this._client);
  }
  retrieve(e, t) {
    return this._client.get(v`/organization/users/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/organization/users/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/users", le, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/organization/users/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
Js.Roles = Vh;
var be = class extends b {
  constructor() {
    super(...arguments), this.auditLogs = new wh(this._client), this.adminAPIKeys = new Eh(this._client), this.usage = new Mh(this._client), this.invites = new Rh(this._client), this.users = new Js(this._client), this.groups = new Or(this._client), this.roles = new bh(this._client), this.dataRetention = new Ih(this._client), this.spendAlerts = new Ph(this._client), this.certificates = new Ch(this._client), this.projects = new Re(this._client);
  }
};
be.AuditLogs = wh;
be.AdminAPIKeys = Eh;
be.Usage = Mh;
be.Invites = Rh;
be.Users = Js;
be.Groups = Or;
be.Roles = bh;
be.DataRetention = Ih;
be.SpendAlerts = Ph;
be.Certificates = Ch;
be.Projects = Re;
var Ks = class extends b {
  constructor() {
    super(...arguments), this.organization = new be(this._client);
  }
};
Ks.Organization = be;
var Jh = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* TC(e) {
  if (!e) return;
  if (Jh in e) {
    const { values: o, nulls: r } = e;
    yield* o.entries();
    for (const i of r) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Vu(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const r = o[0];
    if (typeof r != "string") throw new TypeError("expected header name to be a string");
    const i = Vu(o[1]) ? o[1] : [o[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [r, null]), yield [r, u]);
  }
}
var D = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const r = /* @__PURE__ */ new Set();
    for (const [i, a] of TC(o)) {
      const u = i.toLowerCase();
      r.has(u) || (t.delete(i), r.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [Jh]: !0,
    values: t,
    nulls: n
  };
}, Kh = class extends b {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: D([{ Accept: "application/octet-stream" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Wh = class extends b {
  create(e, t) {
    return this._client.post("/audio/transcriptions", ze({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, zh = class extends b {
  create(e, t) {
    return this._client.post("/audio/translations", ze({
      body: e,
      ...t,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, yo = class extends b {
  constructor() {
    super(...arguments), this.transcriptions = new Wh(this._client), this.translations = new zh(this._client), this.speech = new Kh(this._client);
  }
};
yo.Transcriptions = Wh;
yo.Translations = zh;
yo.Speech = Kh;
var Yh = class extends b {
  create(e, t) {
    return this._client.post("/batches", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/batches/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/batches", Y, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(v`/batches/${e}/cancel`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Xh = class extends b {
  create(e, t) {
    return this._client.post("/assistants", {
      body: e,
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/assistants/${e}`, {
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/assistants/${e}`, {
      body: t,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/assistants", Y, {
      query: e,
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/assistants/${e}`, {
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Qh = class extends b {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Zh = class extends b {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Gr = class extends b {
  constructor() {
    super(...arguments), this.sessions = new Qh(this._client), this.transcriptionSessions = new Zh(this._client);
  }
};
Gr.Sessions = Qh;
Gr.TranscriptionSessions = Zh;
var jh = class extends b {
  create(e, t) {
    return this._client.post("/chatkit/sessions", {
      body: e,
      ...t,
      headers: D([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(v`/chatkit/sessions/${e}/cancel`, {
      ...t,
      headers: D([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, ep = class extends b {
  retrieve(e, t) {
    return this._client.get(v`/chatkit/threads/${e}`, {
      ...t,
      headers: D([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chatkit/threads", le, {
      query: e,
      ...t,
      headers: D([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/chatkit/threads/${e}`, {
      ...t,
      headers: D([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  listItems(e, t = {}, n) {
    return this._client.getAPIList(v`/chatkit/threads/${e}/items`, le, {
      query: t,
      ...n,
      headers: D([{ "OpenAI-Beta": "chatkit_beta=v1" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Br = class extends b {
  constructor() {
    super(...arguments), this.sessions = new jh(this._client), this.threads = new ep(this._client);
  }
};
Br.Sessions = jh;
Br.Threads = ep;
var tp = class extends b {
  create(e, t, n) {
    return this._client.post(v`/threads/${e}/messages`, {
      body: t,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { thread_id: o } = t;
    return this._client.get(v`/threads/${o}/messages/${e}`, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { thread_id: o, ...r } = t;
    return this._client.post(v`/threads/${o}/messages/${e}`, {
      body: r,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/threads/${e}/messages`, Y, {
      query: t,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { thread_id: o } = t;
    return this._client.delete(v`/threads/${o}/messages/${e}`, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, np = class extends b {
  retrieve(e, t, n) {
    const { thread_id: o, run_id: r, ...i } = t;
    return this._client.get(v`/threads/${o}/runs/${r}/steps/${e}`, {
      query: i,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t, n) {
    const { thread_id: o, ...r } = t;
    return this._client.getAPIList(v`/threads/${o}/runs/${e}/steps`, Y, {
      query: r,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, SC = (e) => {
  if (typeof Buffer < "u") {
    const t = Buffer.from(e, "base64");
    return Array.from(new Float32Array(t.buffer, t.byteOffset, t.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const t = atob(e), n = t.length, o = new Uint8Array(n);
    for (let r = 0; r < n; r++) o[r] = t.charCodeAt(r);
    return Array.from(new Float32Array(o.buffer));
  }
}, ct = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, ae, Mt, ss, We, or, Ue, xt, zt, It, Sr, Ce, rr, ir, Yn, Vn, Jn, lc, uc, cc, dc, fc, hc, pc, Xn = class extends Gs {
  constructor() {
    super(...arguments), ae.add(this), ss.set(this, []), We.set(this, {}), or.set(this, {}), Ue.set(this, void 0), xt.set(this, void 0), zt.set(this, void 0), It.set(this, void 0), Sr.set(this, void 0), Ce.set(this, void 0), rr.set(this, void 0), ir.set(this, void 0), Yn.set(this, void 0);
  }
  [(ss = /* @__PURE__ */ new WeakMap(), We = /* @__PURE__ */ new WeakMap(), or = /* @__PURE__ */ new WeakMap(), Ue = /* @__PURE__ */ new WeakMap(), xt = /* @__PURE__ */ new WeakMap(), zt = /* @__PURE__ */ new WeakMap(), It = /* @__PURE__ */ new WeakMap(), Sr = /* @__PURE__ */ new WeakMap(), Ce = /* @__PURE__ */ new WeakMap(), rr = /* @__PURE__ */ new WeakMap(), ir = /* @__PURE__ */ new WeakMap(), Yn = /* @__PURE__ */ new WeakMap(), ae = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
    const e = [], t = [];
    let n = !1;
    return this.on("event", (o) => {
      const r = t.shift();
      r ? r.resolve(o) : e.push(o);
    }), this.on("end", () => {
      n = !0;
      for (const o of t) o.resolve(void 0);
      t.length = 0;
    }), this.on("abort", (o) => {
      n = !0;
      for (const r of t) r.reject(o);
      t.length = 0;
    }), this.on("error", (o) => {
      n = !0;
      for (const r of t) r.reject(o);
      t.length = 0;
    }), {
      next: async () => e.length ? {
        value: e.shift(),
        done: !1
      } : n ? {
        value: void 0,
        done: !0
      } : new Promise((o, r) => t.push({
        resolve: o,
        reject: r
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
    const t = new Mt();
    return t._run(() => t._fromReadableStream(e)), t;
  }
  async _fromReadableStream(e, t) {
    const n = t?.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const o = no.fromReadableStream(e, this.controller);
    for await (const r of o) S(this, ae, "m", Vn).call(this, r);
    if (o.controller.signal?.aborted) throw new xe();
    return this._addRun(S(this, ae, "m", Jn).call(this));
  }
  toReadableStream() {
    return new no(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, t, n, o) {
    const r = new Mt();
    return r._run(() => r._runToolAssistantStream(e, t, n, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), r;
  }
  async _createToolAssistantStream(e, t, n, o) {
    const r = o?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort()));
    const i = {
      ...n,
      stream: !0
    }, a = await e.submitToolOutputs(t, i, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const u of a) S(this, ae, "m", Vn).call(this, u);
    if (a.controller.signal?.aborted) throw new xe();
    return this._addRun(S(this, ae, "m", Jn).call(this));
  }
  static createThreadAssistantStream(e, t, n) {
    const o = new Mt();
    return o._run(() => o._threadAssistantStream(e, t, {
      ...n,
      headers: {
        ...n?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  static createAssistantStream(e, t, n, o) {
    const r = new Mt();
    return r._run(() => r._runAssistantStream(e, t, n, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), r;
  }
  currentEvent() {
    return S(this, rr, "f");
  }
  currentRun() {
    return S(this, ir, "f");
  }
  currentMessageSnapshot() {
    return S(this, Ue, "f");
  }
  currentRunStepSnapshot() {
    return S(this, Yn, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(S(this, We, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(S(this, or, "f"));
  }
  async finalRun() {
    if (await this.done(), !S(this, xt, "f")) throw Error("Final run was not received.");
    return S(this, xt, "f");
  }
  async _createThreadAssistantStream(e, t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort()));
    const r = {
      ...t,
      stream: !0
    }, i = await e.createAndRun(r, {
      ...n,
      signal: this.controller.signal
    });
    this._connected();
    for await (const a of i) S(this, ae, "m", Vn).call(this, a);
    if (i.controller.signal?.aborted) throw new xe();
    return this._addRun(S(this, ae, "m", Jn).call(this));
  }
  async _createAssistantStream(e, t, n, o) {
    const r = o?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort()));
    const i = {
      ...n,
      stream: !0
    }, a = await e.create(t, i, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const u of a) S(this, ae, "m", Vn).call(this, u);
    if (a.controller.signal?.aborted) throw new xe();
    return this._addRun(S(this, ae, "m", Jn).call(this));
  }
  static accumulateDelta(e, t) {
    for (const [n, o] of Object.entries(t)) {
      if (!e.hasOwnProperty(n)) {
        e[n] = o;
        continue;
      }
      let r = e[n];
      if (r == null) {
        e[n] = o;
        continue;
      }
      if (n === "index" || n === "type") {
        e[n] = o;
        continue;
      }
      if (typeof r == "string" && typeof o == "string") r += o;
      else if (typeof r == "number" && typeof o == "number") r += o;
      else if (ui(r) && ui(o)) r = this.accumulateDelta(r, o);
      else if (Array.isArray(r) && Array.isArray(o)) {
        if (r.every((i) => typeof i == "string" || typeof i == "number")) {
          r.push(...o);
          continue;
        }
        for (const i of o) {
          if (!ui(i)) throw new Error(`Expected array delta entry to be an object but got: ${i}`);
          const a = i.index;
          if (a == null)
            throw console.error(i), new Error("Expected array delta entry to have an `index` property");
          if (typeof a != "number") throw new Error(`Expected array delta entry \`index\` property to be a number but got ${a}`);
          const u = r[a];
          u == null ? r.push(i) : r[a] = this.accumulateDelta(u, i);
        }
        continue;
      } else throw Error(`Unhandled record type: ${n}, deltaValue: ${o}, accValue: ${r}`);
      e[n] = r;
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
Mt = Xn, Vn = function(t) {
  if (!this.ended)
    switch (O(this, rr, t, "f"), S(this, ae, "m", cc).call(this, t), t.event) {
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
        S(this, ae, "m", pc).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        S(this, ae, "m", uc).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        S(this, ae, "m", lc).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, Jn = function() {
  if (this.ended) throw new U("stream has ended, this shouldn't happen");
  if (!S(this, xt, "f")) throw Error("Final run has not been received");
  return S(this, xt, "f");
}, lc = function(t) {
  const [n, o] = S(this, ae, "m", fc).call(this, t, S(this, Ue, "f"));
  O(this, Ue, n, "f"), S(this, or, "f")[n.id] = n;
  for (const r of o) {
    const i = n.content[r.index];
    i?.type == "text" && this._emit("textCreated", i.text);
  }
  switch (t.event) {
    case "thread.message.created":
      this._emit("messageCreated", t.data);
      break;
    case "thread.message.in_progress":
      break;
    case "thread.message.delta":
      if (this._emit("messageDelta", t.data.delta, n), t.data.delta.content) for (const r of t.data.delta.content) {
        if (r.type == "text" && r.text) {
          let i = r.text, a = n.content[r.index];
          if (a && a.type == "text") this._emit("textDelta", i, a.text);
          else throw Error("The snapshot associated with this text delta is not text or missing");
        }
        if (r.index != S(this, zt, "f")) {
          if (S(this, It, "f")) switch (S(this, It, "f").type) {
            case "text":
              this._emit("textDone", S(this, It, "f").text, S(this, Ue, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", S(this, It, "f").image_file, S(this, Ue, "f"));
              break;
          }
          O(this, zt, r.index, "f");
        }
        O(this, It, n.content[r.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (S(this, zt, "f") !== void 0) {
        const r = t.data.content[S(this, zt, "f")];
        if (r) switch (r.type) {
          case "image_file":
            this._emit("imageFileDone", r.image_file, S(this, Ue, "f"));
            break;
          case "text":
            this._emit("textDone", r.text, S(this, Ue, "f"));
            break;
        }
      }
      S(this, Ue, "f") && this._emit("messageDone", t.data), O(this, Ue, void 0, "f");
  }
}, uc = function(t) {
  const n = S(this, ae, "m", dc).call(this, t);
  switch (O(this, Yn, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const o = t.data.delta;
      if (o.step_details && o.step_details.type == "tool_calls" && o.step_details.tool_calls && n.step_details.type == "tool_calls") for (const r of o.step_details.tool_calls) r.index == S(this, Sr, "f") ? this._emit("toolCallDelta", r, n.step_details.tool_calls[r.index]) : (S(this, Ce, "f") && this._emit("toolCallDone", S(this, Ce, "f")), O(this, Sr, r.index, "f"), O(this, Ce, n.step_details.tool_calls[r.index], "f"), S(this, Ce, "f") && this._emit("toolCallCreated", S(this, Ce, "f")));
      this._emit("runStepDelta", t.data.delta, n);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      O(this, Yn, void 0, "f"), t.data.step_details.type == "tool_calls" && S(this, Ce, "f") && (this._emit("toolCallDone", S(this, Ce, "f")), O(this, Ce, void 0, "f")), this._emit("runStepDone", t.data, n);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, cc = function(t) {
  S(this, ss, "f").push(t), this._emit("event", t);
}, dc = function(t) {
  switch (t.event) {
    case "thread.run.step.created":
      return S(this, We, "f")[t.data.id] = t.data, t.data;
    case "thread.run.step.delta":
      let n = S(this, We, "f")[t.data.id];
      if (!n) throw Error("Received a RunStepDelta before creation of a snapshot");
      let o = t.data;
      if (o.delta) {
        const r = Mt.accumulateDelta(n, o.delta);
        S(this, We, "f")[t.data.id] = r;
      }
      return S(this, We, "f")[t.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      S(this, We, "f")[t.data.id] = t.data;
      break;
  }
  if (S(this, We, "f")[t.data.id]) return S(this, We, "f")[t.data.id];
  throw new Error("No snapshot available");
}, fc = function(t, n) {
  let o = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, o];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let r = t.data;
      if (r.delta.content) for (const i of r.delta.content) if (i.index in n.content) {
        let a = n.content[i.index];
        n.content[i.index] = S(this, ae, "m", hc).call(this, i, a);
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
}, hc = function(t, n) {
  return Mt.accumulateDelta(n, t);
}, pc = function(t) {
  switch (O(this, ir, t.data, "f"), t.event) {
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
      O(this, xt, t.data, "f"), S(this, Ce, "f") && (this._emit("toolCallDone", S(this, Ce, "f")), O(this, Ce, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var Ws = class extends b {
  constructor() {
    super(...arguments), this.steps = new np(this._client);
  }
  create(e, t, n) {
    const { include: o, ...r } = t;
    return this._client.post(v`/threads/${e}/runs`, {
      query: { include: o },
      body: r,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { thread_id: o } = t;
    return this._client.get(v`/threads/${o}/runs/${e}`, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { thread_id: o, ...r } = t;
    return this._client.post(v`/threads/${o}/runs/${e}`, {
      body: r,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/threads/${e}/runs`, Y, {
      query: t,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { thread_id: o } = t;
    return this._client.post(v`/threads/${o}/runs/${e}/cancel`, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
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
    const o = D([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const { data: r, response: i } = await this.retrieve(e, t, {
        ...n,
        headers: {
          ...n?.headers,
          ...o
        }
      }).withResponse();
      switch (r.status) {
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
          await go(a);
          break;
        case "requires_action":
        case "incomplete":
        case "cancelled":
        case "completed":
        case "failed":
        case "expired":
          return r;
      }
    }
  }
  stream(e, t, n) {
    return Xn.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  submitToolOutputs(e, t, n) {
    const { thread_id: o, ...r } = t;
    return this._client.post(v`/threads/${o}/runs/${e}/submit_tool_outputs`, {
      body: r,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0,
      __security: { bearerAuth: !0 }
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
Ws.Steps = np;
var qr = class extends b {
  constructor() {
    super(...arguments), this.runs = new Ws(this._client), this.messages = new tp(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/threads", {
      body: e,
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/threads/${e}`, {
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/threads/${e}`, {
      body: t,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/threads/${e}`, {
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  createAndRun(e, t) {
    return this._client.post("/threads/runs", {
      body: e,
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      stream: e.stream ?? !1,
      __synthesizeEventData: !0,
      __security: { bearerAuth: !0 }
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
qr.Runs = Ws;
qr.Messages = tp;
var un = class extends b {
  constructor() {
    super(...arguments), this.realtime = new Gr(this._client), this.chatkit = new Br(this._client), this.assistants = new Xh(this._client), this.threads = new qr(this._client);
  }
};
un.Realtime = Gr;
un.ChatKit = Br;
un.Assistants = Xh;
un.Threads = qr;
var op = class extends b {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    });
  }
}, rp = class extends b {
  retrieve(e, t, n) {
    const { container_id: o } = t;
    return this._client.get(v`/containers/${o}/files/${e}/content`, {
      ...n,
      headers: D([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, zs = class extends b {
  constructor() {
    super(...arguments), this.content = new rp(this._client);
  }
  create(e, t, n) {
    return this._client.post(v`/containers/${e}/files`, Fr({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t, n) {
    const { container_id: o } = t;
    return this._client.get(v`/containers/${o}/files/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/containers/${e}/files`, Y, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { container_id: o } = t;
    return this._client.delete(v`/containers/${o}/files/${e}`, {
      ...n,
      headers: D([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
zs.Content = rp;
var Ys = class extends b {
  constructor() {
    super(...arguments), this.files = new zs(this._client);
  }
  create(e, t) {
    return this._client.post("/containers", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/containers/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/containers", Y, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/containers/${e}`, {
      ...t,
      headers: D([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
Ys.Files = zs;
var ip = class extends b {
  create(e, t, n) {
    const { include: o, ...r } = t;
    return this._client.post(v`/conversations/${e}/items`, {
      query: { include: o },
      body: r,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { conversation_id: o, ...r } = t;
    return this._client.get(v`/conversations/${o}/items/${e}`, {
      query: r,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/conversations/${e}/items`, le, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { conversation_id: o } = t;
    return this._client.delete(v`/conversations/${o}/items/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Xs = class extends b {
  constructor() {
    super(...arguments), this.items = new ip(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/conversations", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/conversations/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/conversations/${e}`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/conversations/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
};
Xs.Items = ip;
var sp = class extends b {
  create(e, t) {
    const n = !!e.encoding_format;
    let o = n ? e.encoding_format : "base64";
    n && se(this._client).debug("embeddings/user defined encoding_format:", e.encoding_format);
    const r = this._client.post("/embeddings", {
      body: {
        ...e,
        encoding_format: o
      },
      ...t,
      __security: { bearerAuth: !0 }
    });
    return n ? r : (se(this._client).debug("embeddings/decoding base64 embeddings from base64"), r._thenUnwrap((i) => (i && i.data && i.data.forEach((a) => {
      const u = a.embedding;
      a.embedding = SC(u);
    }), i)));
  }
}, ap = class extends b {
  retrieve(e, t, n) {
    const { eval_id: o, run_id: r } = t;
    return this._client.get(v`/evals/${o}/runs/${r}/output_items/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t, n) {
    const { eval_id: o, ...r } = t;
    return this._client.getAPIList(v`/evals/${o}/runs/${e}/output_items`, Y, {
      query: r,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Qs = class extends b {
  constructor() {
    super(...arguments), this.outputItems = new ap(this._client);
  }
  create(e, t, n) {
    return this._client.post(v`/evals/${e}/runs`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { eval_id: o } = t;
    return this._client.get(v`/evals/${o}/runs/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/evals/${e}/runs`, Y, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { eval_id: o } = t;
    return this._client.delete(v`/evals/${o}/runs/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { eval_id: o } = t;
    return this._client.post(v`/evals/${o}/runs/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
Qs.OutputItems = ap;
var Zs = class extends b {
  constructor() {
    super(...arguments), this.runs = new Qs(this._client);
  }
  create(e, t) {
    return this._client.post("/evals", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/evals/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/evals/${e}`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/evals", Y, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/evals/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
};
Zs.Runs = Qs;
var lp = class extends b {
  create(e, t) {
    return this._client.post("/files", ze({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(v`/files/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/files", Y, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/files/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  content(e, t) {
    return this._client.get(v`/files/${e}/content`, {
      ...t,
      headers: D([{ Accept: "application/binary" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
  async waitForProcessing(e, { pollInterval: t = 5e3, maxWait: n = 1800 * 1e3 } = {}) {
    const o = /* @__PURE__ */ new Set([
      "processed",
      "error",
      "deleted"
    ]), r = Date.now();
    let i = await this.retrieve(e);
    for (; !i.status || !o.has(i.status); )
      if (await go(t), i = await this.retrieve(e), Date.now() - r > n) throw new Ds({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return i;
  }
}, up = class extends b {
}, cp = class extends b {
  run(e, t) {
    return this._client.post("/fine_tuning/alpha/graders/run", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  validate(e, t) {
    return this._client.post("/fine_tuning/alpha/graders/validate", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, js = class extends b {
  constructor() {
    super(...arguments), this.graders = new cp(this._client);
  }
};
js.Graders = cp;
var dp = class extends b {
  create(e, t, n) {
    return this._client.getAPIList(v`/fine_tuning/checkpoints/${e}/permissions`, gt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t = {}, n) {
    return this._client.get(v`/fine_tuning/checkpoints/${e}/permissions`, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/fine_tuning/checkpoints/${e}/permissions`, le, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { fine_tuned_model_checkpoint: o } = t;
    return this._client.delete(v`/fine_tuning/checkpoints/${o}/permissions/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, ea = class extends b {
  constructor() {
    super(...arguments), this.permissions = new dp(this._client);
  }
};
ea.Permissions = dp;
var fp = class extends b {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/fine_tuning/jobs/${e}/checkpoints`, Y, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, ta = class extends b {
  constructor() {
    super(...arguments), this.checkpoints = new fp(this._client);
  }
  create(e, t) {
    return this._client.post("/fine_tuning/jobs", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/fine_tuning/jobs/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/fine_tuning/jobs", Y, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(v`/fine_tuning/jobs/${e}/cancel`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  listEvents(e, t = {}, n) {
    return this._client.getAPIList(v`/fine_tuning/jobs/${e}/events`, Y, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  pause(e, t) {
    return this._client.post(v`/fine_tuning/jobs/${e}/pause`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  resume(e, t) {
    return this._client.post(v`/fine_tuning/jobs/${e}/resume`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
};
ta.Checkpoints = fp;
var cn = class extends b {
  constructor() {
    super(...arguments), this.methods = new up(this._client), this.jobs = new ta(this._client), this.checkpoints = new ea(this._client), this.alpha = new js(this._client);
  }
};
cn.Methods = up;
cn.Jobs = ta;
cn.Checkpoints = ea;
cn.Alpha = js;
var hp = class extends b {
}, na = class extends b {
  constructor() {
    super(...arguments), this.graderModels = new hp(this._client);
  }
};
na.GraderModels = hp;
var pp = class extends b {
  createVariation(e, t) {
    return this._client.post("/images/variations", ze({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  edit(e, t) {
    return this._client.post("/images/edits", ze({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  generate(e, t) {
    return this._client.post("/images/generations", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    });
  }
}, mp = class extends b {
  retrieve(e, t) {
    return this._client.get(v`/models/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e) {
    return this._client.getAPIList("/models", gt, {
      ...e,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/models/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, gp = class extends b {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, _p = class extends b {
  accept(e, t, n) {
    return this._client.post(v`/realtime/calls/${e}/accept`, {
      body: t,
      ...n,
      headers: D([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  hangup(e, t) {
    return this._client.post(v`/realtime/calls/${e}/hangup`, {
      ...t,
      headers: D([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  refer(e, t, n) {
    return this._client.post(v`/realtime/calls/${e}/refer`, {
      body: t,
      ...n,
      headers: D([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  reject(e, t = {}, n) {
    return this._client.post(v`/realtime/calls/${e}/reject`, {
      body: t,
      ...n,
      headers: D([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, yp = class extends b {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Hr = class extends b {
  constructor() {
    super(...arguments), this.clientSecrets = new yp(this._client), this.calls = new _p(this._client);
  }
};
Hr.ClientSecrets = yp;
Hr.Calls = _p;
function EC(e, t) {
  return !t || !CC(t) ? {
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
  } : vp(e, t);
}
function vp(e, t) {
  const n = e.output.map((r) => {
    if (r.type === "function_call") return {
      ...r,
      parsed_arguments: bC(t, r)
    };
    if (r.type === "message") {
      const i = r.content.map((a) => a.type === "output_text" ? {
        ...a,
        parsed: wC(t, a.text)
      } : a);
      return {
        ...r,
        content: i
      };
    }
    return r;
  }), o = Object.assign({}, e, { output: n });
  return Object.getOwnPropertyDescriptor(e, "output_text") || as(o), Object.defineProperty(o, "output_parsed", {
    enumerable: !0,
    get() {
      for (const r of o.output)
        if (r.type === "message") {
          for (const i of r.content) if (i.type === "output_text" && i.parsed !== null) return i.parsed;
        }
      return null;
    }
  }), o;
}
function wC(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function CC(e) {
  return !!Fs(e.text?.format);
}
function IC(e) {
  return e?.$brand === "auto-parseable-tool";
}
function RC(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function bC(e, t) {
  const n = RC(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: IC(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function as(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const o of n.content) o.type === "output_text" && t.push(o.text);
  e.output_text = t.join("");
}
var Ot, Jo, dt, Ko, mc, gc, _c, yc, PC = class Ap extends Gs {
  constructor(t) {
    super(), Ot.add(this), Jo.set(this, void 0), dt.set(this, void 0), Ko.set(this, void 0), O(this, Jo, t, "f");
  }
  static createResponse(t, n, o) {
    const r = new Ap(n);
    return r._run(() => r._createOrRetrieveResponse(t, n, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), r;
  }
  async _createOrRetrieveResponse(t, n, o) {
    const r = o?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), S(this, Ot, "m", mc).call(this);
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
    for await (const u of i) S(this, Ot, "m", gc).call(this, u, a);
    if (i.controller.signal?.aborted) throw new xe();
    return S(this, Ot, "m", _c).call(this);
  }
  [(Jo = /* @__PURE__ */ new WeakMap(), dt = /* @__PURE__ */ new WeakMap(), Ko = /* @__PURE__ */ new WeakMap(), Ot = /* @__PURE__ */ new WeakSet(), mc = function() {
    this.ended || O(this, dt, void 0, "f");
  }, gc = function(n, o) {
    if (this.ended) return;
    const r = (a, u) => {
      (o == null || u.sequence_number > o) && this._emit(a, u);
    }, i = S(this, Ot, "m", yc).call(this, n);
    switch (r("event", n), n.type) {
      case "response.output_text.delta": {
        const a = i.output[n.output_index];
        if (!a) throw new U(`missing output at index ${n.output_index}`);
        if (a.type === "message") {
          const u = a.content[n.content_index];
          if (!u) throw new U(`missing content at index ${n.content_index}`);
          if (u.type !== "output_text") throw new U(`expected content to be 'output_text', got ${u.type}`);
          r("response.output_text.delta", {
            ...n,
            snapshot: u.text
          });
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const a = i.output[n.output_index];
        if (!a) throw new U(`missing output at index ${n.output_index}`);
        a.type === "function_call" && r("response.function_call_arguments.delta", {
          ...n,
          snapshot: a.arguments
        });
        break;
      }
      default:
        r(n.type, n);
        break;
    }
  }, _c = function() {
    if (this.ended) throw new U("stream has ended, this shouldn't happen");
    const n = S(this, dt, "f");
    if (!n) throw new U("request ended without sending any events");
    O(this, dt, void 0, "f");
    const o = MC(n, S(this, Jo, "f"));
    return O(this, Ko, o, "f"), o;
  }, yc = function(n) {
    let o = S(this, dt, "f");
    if (!o) {
      if (n.type !== "response.created") throw new U(`When snapshot hasn't been set yet, expected 'response.created' event, got ${n.type}`);
      return o = O(this, dt, n.response, "f"), o;
    }
    switch (n.type) {
      case "response.output_item.added":
        o.output.push(n.item);
        break;
      case "response.content_part.added": {
        const r = o.output[n.output_index];
        if (!r) throw new U(`missing output at index ${n.output_index}`);
        const i = r.type, a = n.part;
        i === "message" && a.type !== "reasoning_text" ? r.content.push(a) : i === "reasoning" && a.type === "reasoning_text" && (r.content || (r.content = []), r.content.push(a));
        break;
      }
      case "response.output_text.delta": {
        const r = o.output[n.output_index];
        if (!r) throw new U(`missing output at index ${n.output_index}`);
        if (r.type === "message") {
          const i = r.content[n.content_index];
          if (!i) throw new U(`missing content at index ${n.content_index}`);
          if (i.type !== "output_text") throw new U(`expected content to be 'output_text', got ${i.type}`);
          i.text += n.delta;
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const r = o.output[n.output_index];
        if (!r) throw new U(`missing output at index ${n.output_index}`);
        r.type === "function_call" && (r.arguments += n.delta);
        break;
      }
      case "response.reasoning_text.delta": {
        const r = o.output[n.output_index];
        if (!r) throw new U(`missing output at index ${n.output_index}`);
        if (r.type === "reasoning") {
          const i = r.content?.[n.content_index];
          if (!i) throw new U(`missing content at index ${n.content_index}`);
          if (i.type !== "reasoning_text") throw new U(`expected content to be 'reasoning_text', got ${i.type}`);
          i.text += n.delta;
        }
        break;
      }
      case "response.completed":
        O(this, dt, n.response, "f");
        break;
    }
    return o;
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let o = !1;
    return this.on("event", (r) => {
      const i = n.shift();
      i ? i.resolve(r) : t.push(r);
    }), this.on("end", () => {
      o = !0;
      for (const r of n) r.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (r) => {
      o = !0;
      for (const i of n) i.reject(r);
      n.length = 0;
    }), this.on("error", (r) => {
      o = !0;
      for (const i of n) i.reject(r);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : o ? {
        value: void 0,
        done: !0
      } : new Promise((r, i) => n.push({
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
  async finalResponse() {
    await this.done();
    const t = S(this, Ko, "f");
    if (!t) throw new U("stream ended without producing a ChatCompletion");
    return t;
  }
};
function MC(e, t) {
  return EC(e, t);
}
var Tp = class extends b {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/responses/${e}/input_items`, Y, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Sp = class extends b {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Vr = class extends b {
  constructor() {
    super(...arguments), this.inputItems = new Tp(this._client), this.inputTokens = new Sp(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && as(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(v`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((o) => ("object" in o && o.object === "response" && as(o), o));
  }
  delete(e, t) {
    return this._client.delete(v`/responses/${e}`, {
      ...t,
      headers: D([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => vp(n, e));
  }
  stream(e, t) {
    return PC.createResponse(this._client, e, t);
  }
  cancel(e, t) {
    return this._client.post(v`/responses/${e}/cancel`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  compact(e, t) {
    return this._client.post("/responses/compact", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
};
Vr.InputItems = Tp;
Vr.InputTokens = Sp;
var Ep = class extends b {
  retrieve(e, t) {
    return this._client.get(v`/skills/${e}/content`, {
      ...t,
      headers: D([{ Accept: "application/binary" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, wp = class extends b {
  retrieve(e, t, n) {
    const { skill_id: o } = t;
    return this._client.get(v`/skills/${o}/versions/${e}/content`, {
      ...n,
      headers: D([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, oa = class extends b {
  constructor() {
    super(...arguments), this.content = new wp(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(v`/skills/${e}/versions`, Fr({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: o } = t;
    return this._client.get(v`/skills/${o}/versions/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/skills/${e}/versions`, Y, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { skill_id: o } = t;
    return this._client.delete(v`/skills/${o}/versions/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
oa.Content = wp;
var Jr = class extends b {
  constructor() {
    super(...arguments), this.content = new Ep(this._client), this.versions = new oa(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", Fr({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(v`/skills/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/skills/${e}`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/skills", Y, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/skills/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
};
Jr.Content = Ep;
Jr.Versions = oa;
var Cp = class extends b {
  create(e, t, n) {
    return this._client.post(v`/uploads/${e}/parts`, ze({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, ra = class extends b {
  constructor() {
    super(...arguments), this.parts = new Cp(this._client);
  }
  create(e, t) {
    return this._client.post("/uploads", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(v`/uploads/${e}/cancel`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  complete(e, t, n) {
    return this._client.post(v`/uploads/${e}/complete`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
ra.Parts = Cp;
var xC = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((r) => r.status === "rejected");
  if (n.length) {
    for (const r of n) console.error(r.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const o = [];
  for (const r of t) r.status === "fulfilled" && o.push(r.value);
  return o;
}, Ip = class extends b {
  create(e, t, n) {
    return this._client.post(v`/vector_stores/${e}/file_batches`, {
      body: t,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.get(v`/vector_stores/${o}/file_batches/${e}`, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.post(v`/vector_stores/${o}/file_batches/${e}/cancel`, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t);
    return await this.poll(e, o.id, n);
  }
  listFiles(e, t, n) {
    const { vector_store_id: o, ...r } = t;
    return this._client.getAPIList(v`/vector_stores/${o}/file_batches/${e}/files`, Y, {
      query: r,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async poll(e, t, n) {
    const o = D([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const { data: r, response: i } = await this.retrieve(t, { vector_store_id: e }, {
        ...n,
        headers: o
      }).withResponse();
      switch (r.status) {
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
          await go(a);
          break;
        case "failed":
        case "cancelled":
        case "completed":
          return r;
      }
    }
  }
  async uploadAndPoll(e, { files: t, fileIds: n = [] }, o) {
    if (t == null || t.length == 0) throw new Error("No `files` provided to process. If you've already uploaded files you should use `.createAndPoll()` instead");
    const r = o?.maxConcurrency ?? 5, i = Math.min(r, t.length), a = this._client, u = t.values(), c = [...n];
    async function d(h) {
      for (let f of h) {
        const p = await a.files.create({
          file: f,
          purpose: "assistants"
        }, o);
        c.push(p.id);
      }
    }
    return await xC(Array(i).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, Rp = class extends b {
  create(e, t, n) {
    return this._client.post(v`/vector_stores/${e}/files`, {
      body: t,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.get(v`/vector_stores/${o}/files/${e}`, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { vector_store_id: o, ...r } = t;
    return this._client.post(v`/vector_stores/${o}/files/${e}`, {
      body: r,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/vector_stores/${e}/files`, Y, {
      query: t,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.delete(v`/vector_stores/${o}/files/${e}`, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t, n);
    return await this.poll(e, o.id, n);
  }
  async poll(e, t, n) {
    const o = D([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const r = await this.retrieve(t, { vector_store_id: e }, {
        ...n,
        headers: o
      }).withResponse(), i = r.data;
      switch (i.status) {
        case "in_progress":
          let a = 5e3;
          if (n?.pollIntervalMs) a = n.pollIntervalMs;
          else {
            const u = r.response.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (a = c);
            }
          }
          await go(a);
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
    return this._client.getAPIList(v`/vector_stores/${o}/files/${e}/content`, gt, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Kr = class extends b {
  constructor() {
    super(...arguments), this.files = new Rp(this._client), this.fileBatches = new Ip(this._client);
  }
  create(e, t) {
    return this._client.post("/vector_stores", {
      body: e,
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/vector_stores/${e}`, {
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/vector_stores/${e}`, {
      body: t,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/vector_stores", Y, {
      query: e,
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/vector_stores/${e}`, {
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  search(e, t, n) {
    return this._client.getAPIList(v`/vector_stores/${e}/search`, gt, {
      body: t,
      method: "post",
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
Kr.Files = Rp;
Kr.FileBatches = Ip;
var bp = class extends b {
  create(e, t) {
    return this._client.post("/videos", ze({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(v`/videos/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/videos", le, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/videos/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  createCharacter(e, t) {
    return this._client.post("/videos/characters", ze({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  downloadContent(e, t = {}, n) {
    return this._client.get(v`/videos/${e}/content`, {
      query: t,
      ...n,
      headers: D([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
  edit(e, t) {
    return this._client.post("/videos/edits", ze({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  extend(e, t) {
    return this._client.post("/videos/extensions", ze({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  getCharacter(e, t) {
    return this._client.get(v`/videos/characters/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  remix(e, t, n) {
    return this._client.post(v`/videos/${e}/remix`, Fr({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Vt, Pp, sr, Mp = class extends b {
  constructor() {
    super(...arguments), Vt.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, o = 300) {
    return await this.verifySignature(e, t, n, o), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, o = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    S(this, Vt, "m", Pp).call(this, n);
    const r = D([t]).values, i = S(this, Vt, "m", sr).call(this, r, "webhook-signature"), a = S(this, Vt, "m", sr).call(this, r, "webhook-timestamp"), u = S(this, Vt, "m", sr).call(this, r, "webhook-id"), c = parseInt(a, 10);
    if (isNaN(c)) throw new Ln("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > o) throw new Ln("Webhook timestamp is too old");
    if (c > d + o) throw new Ln("Webhook timestamp is too new");
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
    throw new Ln("The given webhook signature does not match the expected signature");
  }
};
Vt = /* @__PURE__ */ new WeakSet(), Pp = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, sr = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const o = t.get(n);
  if (o == null) throw new Error(`Missing required header: ${n}`);
  return o;
};
var ls, ia, ar, xp, NC = "workload-identity-auth", q = class {
  constructor({ baseURL: e = ct("OPENAI_BASE_URL"), apiKey: t = ct("OPENAI_API_KEY") ?? null, adminAPIKey: n = ct("OPENAI_ADMIN_KEY") ?? null, organization: o = ct("OPENAI_ORG_ID") ?? null, project: r = ct("OPENAI_PROJECT_ID") ?? null, webhookSecret: i = ct("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: a, ...u } = {}) {
    ls.add(this), ar.set(this, void 0), this.completions = new op(this), this.chat = new qs(this), this.embeddings = new sp(this), this.files = new lp(this), this.images = new pp(this), this.audio = new yo(this), this.moderations = new gp(this), this.models = new mp(this), this.fineTuning = new cn(this), this.graders = new na(this), this.vectorStores = new Kr(this), this.webhooks = new Mp(this), this.beta = new un(this), this.batches = new Yh(this), this.uploads = new ra(this), this.admin = new Ks(this), this.responses = new Vr(this), this.realtime = new Hr(this), this.conversations = new Xs(this), this.evals = new Zs(this), this.containers = new Ys(this), this.skills = new Jr(this), this.videos = new bp(this);
    const c = {
      apiKey: t,
      adminAPIKey: n,
      organization: o,
      project: r,
      webhookSecret: i,
      workloadIdentity: a,
      ...u,
      baseURL: e || "https://api.openai.com/v1"
    };
    if (t && a) throw new U("The `apiKey` and `workloadIdentity` options are mutually exclusive");
    if (!t && !n && !a) throw new U("Missing credentials. Please pass an `apiKey`, `workloadIdentity`, `adminAPIKey`, or set the `OPENAI_API_KEY` or `OPENAI_ADMIN_KEY` environment variable.");
    if (!c.dangerouslyAllowBrowser && Mw()) throw new U(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = c.baseURL, this.timeout = c.timeout ?? ia.DEFAULT_TIMEOUT, this.logger = c.logger ?? console;
    const d = "warn";
    this.logLevel = d, this.logLevel = nc(c.logLevel, "ClientOptions.logLevel", this) ?? nc(ct("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? d, this.fetchOptions = c.fetchOptions, this.maxRetries = c.maxRetries ?? 2, this.fetch = c.fetch ?? Yf(), O(this, ar, $w, "f");
    const h = ct("OPENAI_CUSTOM_HEADERS");
    if (h) {
      const f = {};
      for (const p of h.split(`
`)) {
        const m = p.indexOf(":");
        m >= 0 && (f[p.substring(0, m).trim()] = p.substring(m + 1).trim());
      }
      c.defaultHeaders = D([f, c.defaultHeaders]);
    }
    this._options = c, a && (this._workloadIdentityAuth = new jw(a, this.fetch)), this.apiKey = typeof t == "string" ? t : null, this.adminAPIKey = n, this.organization = o, this.project = r, this.webhookSecret = i;
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
      apiKey: this._options.apiKey,
      adminAPIKey: this.adminAPIKey,
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
  validateHeaders({ values: e, nulls: t }, n = {
    bearerAuth: !0,
    adminAPIKeyAuth: !0
  }) {
    if (!(e.get("authorization") || e.get("api-key")) && !(t.has("authorization") || t.has("api-key")) && !(this._workloadIdentityAuth && n.bearerAuth))
      throw new Error('Could not resolve authentication method. Expected either apiKey or adminAPIKey to be set. Or for one of the "Authorization" or "api-key" headers to be explicitly omitted');
  }
  async authHeaders(e, t = {
    bearerAuth: !0,
    adminAPIKeyAuth: !0
  }) {
    return D([t.bearerAuth ? await this.bearerAuth(e) : null, t.adminAPIKeyAuth ? await this.adminAPIKeyAuth(e) : null]);
  }
  async bearerAuth(e) {
    if (this._workloadIdentityAuth) return D([{ Authorization: `Bearer ${await this._workloadIdentityAuth.getToken()}` }]);
    if (this.apiKey != null)
      return D([{ Authorization: `Bearer ${this.apiKey}` }]);
  }
  async adminAPIKeyAuth(e) {
    if (this.adminAPIKey != null)
      return D([{ Authorization: `Bearer ${this.adminAPIKey}` }]);
  }
  stringifyQuery(e) {
    return Bw(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${qt}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Uf()}`;
  }
  makeStatusError(e, t, n, o) {
    return ce.generate(e, t, n, o);
  }
  async _callApiKey() {
    const e = this._options.apiKey;
    if (typeof e != "function") return !1;
    let t;
    try {
      t = await e();
    } catch (n) {
      throw n instanceof U ? n : new U(`Failed to get token from 'apiKey' function: ${n.message}`, { cause: n });
    }
    if (typeof t != "string" || !t) throw new U(`Expected 'apiKey' function argument to return a string but it returned ${t}`);
    return this.apiKey = t, !0;
  }
  buildURL(e, t, n) {
    const o = !S(this, ls, "m", xp).call(this) && n || this.baseURL, r = Iw(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), a = Object.fromEntries(r.searchParams);
    return (!Ju(i) || !Ju(a)) && (t = {
      ...a,
      ...i,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (r.search = this.stringifyQuery(t)), r.toString();
  }
  async prepareOptions(e) {
    (e.__security ?? { bearerAuth: !0 }).bearerAuth && await this._callApiKey();
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
    return new sh(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const o = await e, r = o.maxRetries ?? this.maxRetries;
    t == null && (t = r), await this.prepareOptions(o);
    const { req: i, url: a, timeout: u } = await this.buildRequest(o, { retryCount: r - t });
    await this.prepareRequest(i, {
      url: a,
      options: o
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, h = Date.now();
    if (se(this).debug(`[${c}] sending request`, wt({
      retryOfRequestLogID: n,
      method: o.method,
      url: a,
      options: o,
      headers: i.headers
    })), o.signal?.aborted) throw new xe();
    const f = o.__security ?? { bearerAuth: !0 }, p = new AbortController(), m = await this.fetchWithAuth(a, i, u, p, f).catch(Wi), g = Date.now();
    if (m instanceof globalThis.Error) {
      const y = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new xe();
      const E = Ki(m) || /timed? ?out/i.test(String(m) + ("cause" in m ? String(m.cause) : ""));
      if (t)
        return se(this).info(`[${c}] connection ${E ? "timed out" : "failed"} - ${y}`), se(this).debug(`[${c}] connection ${E ? "timed out" : "failed"} (${y})`, wt({
          retryOfRequestLogID: n,
          url: a,
          durationMs: g - h,
          message: m.message
        })), this.retryRequest(o, t, n ?? c);
      throw se(this).info(`[${c}] connection ${E ? "timed out" : "failed"} - error; no more retries left`), se(this).debug(`[${c}] connection ${E ? "timed out" : "failed"} (error; no more retries left)`, wt({
        retryOfRequestLogID: n,
        url: a,
        durationMs: g - h,
        message: m.message
      })), m instanceof zf || m instanceof ww ? m : E ? new Ds() : new $r({
        message: kC(m),
        cause: m
      });
    }
    const _ = `[${c}${d}${[...m.headers.entries()].filter(([y]) => y === "x-request-id").map(([y, E]) => ", " + y + ": " + JSON.stringify(E)).join("")}] ${i.method} ${a} ${m.ok ? "succeeded" : "failed"} with status ${m.status} in ${g - h}ms`;
    if (!m.ok) {
      if (m.status === 401 && this._workloadIdentityAuth && f.bearerAuth && !o.__metadata?.hasStreamingBody && !o.__metadata?.workloadIdentityTokenRefreshed)
        return await Yu(m.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
          ...o,
          __metadata: {
            ...o.__metadata,
            workloadIdentityTokenRefreshed: !0
          }
        }, t, n ?? c);
      const y = await this.shouldRetry(m);
      if (t && y) {
        const M = `retrying, ${t} attempts remaining`;
        return await Yu(m.body), se(this).info(`${_} - ${M}`), se(this).debug(`[${c}] response error (${M})`, wt({
          retryOfRequestLogID: n,
          url: m.url,
          status: m.status,
          headers: m.headers,
          durationMs: g - h
        })), this.retryRequest(o, t, n ?? c, m.headers);
      }
      const E = y ? "error; no more retries left" : "error; not retryable";
      se(this).info(`${_} - ${E}`);
      const w = await m.text().catch((M) => Wi(M).message), C = Pw(w), P = C ? void 0 : w;
      throw se(this).debug(`[${c}] response error (${E})`, wt({
        retryOfRequestLogID: n,
        url: m.url,
        status: m.status,
        headers: m.headers,
        message: P,
        durationMs: Date.now() - h
      })), this.makeStatusError(m.status, C, P, m.headers);
    }
    return se(this).info(_), se(this).debug(`[${c}] response start`, wt({
      retryOfRequestLogID: n,
      url: m.url,
      status: m.status,
      headers: m.headers,
      durationMs: g - h
    })), {
      response: m,
      options: o,
      controller: p,
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
    return new Xw(this, n, e);
  }
  async fetchWithAuth(e, t, n, o, r = {
    bearerAuth: !0,
    adminAPIKeyAuth: !0
  }) {
    if (this._workloadIdentityAuth && r.bearerAuth) {
      const i = t.headers, a = i.get("Authorization");
      if (!a || a === `Bearer ${NC}`) {
        const u = await this._workloadIdentityAuth.getToken();
        i.set("Authorization", `Bearer ${u}`);
      }
    }
    return await this.fetchWithTimeout(e, t, n, o);
  }
  async fetchWithTimeout(e, t, n, o) {
    const { signal: r, method: i, ...a } = t || {}, u = this._makeAbort(o);
    r && r.addEventListener("abort", u, { once: !0 });
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
    let r;
    const i = o?.get("retry-after-ms");
    if (i) {
      const u = parseFloat(i);
      Number.isNaN(u) || (r = u);
    }
    const a = o?.get("retry-after");
    if (a && !r) {
      const u = parseFloat(a);
      Number.isNaN(u) ? r = Date.parse(a) - Date.now() : r = u * 1e3;
    }
    if (r === void 0) {
      const u = e.maxRetries ?? this.maxRetries;
      r = this.calculateDefaultRetryTimeoutMillis(t, u);
    }
    return await go(r), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const r = t - e;
    return Math.min(0.5 * Math.pow(2, r), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: o, path: r, query: i, defaultBaseURL: a } = n, u = this.buildURL(r, i, a);
    "timeout" in n && bw("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    let r = {};
    this.idempotencyHeader && t !== "get" && (e.idempotencyKey || (e.idempotencyKey = this.defaultIdempotencyKey()), r[this.idempotencyHeader] = e.idempotencyKey);
    const i = D([
      r,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(o),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...Dw(),
        "OpenAI-Organization": this.organization,
        "OpenAI-Project": this.project
      },
      await this.authHeaders(e, e.__security ?? { bearerAuth: !0 }),
      this._options.defaultHeaders,
      n,
      e.headers
    ]);
    return this.validateHeaders(i, e.__security ?? { bearerAuth: !0 }), i.values;
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
    const n = D([t]), o = typeof globalThis.ReadableStream < "u" && e instanceof globalThis.ReadableStream, r = !o && (typeof e == "string" || e instanceof ArrayBuffer || ArrayBuffer.isView(e) || typeof globalThis.Blob < "u" && e instanceof globalThis.Blob || e instanceof URLSearchParams || e instanceof FormData);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || o ? {
      bodyHeaders: void 0,
      body: e,
      isStreamingBody: !r
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: Qf(e),
      isStreamingBody: !0
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e),
      isStreamingBody: !1
    } : {
      ...S(this, ar, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
ia = q, ar = /* @__PURE__ */ new WeakMap(), ls = /* @__PURE__ */ new WeakSet(), xp = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
q.OpenAI = ia;
q.DEFAULT_TIMEOUT = 6e5;
q.OpenAIError = U;
q.APIError = ce;
q.APIConnectionError = $r;
q.APIConnectionTimeoutError = Ds;
q.APIUserAbortError = xe;
q.NotFoundError = Bf;
q.ConflictError = qf;
q.RateLimitError = Vf;
q.BadRequestError = Ff;
q.AuthenticationError = Of;
q.InternalServerError = Jf;
q.PermissionDeniedError = Gf;
q.UnprocessableEntityError = Hf;
q.InvalidWebhookSignatureError = Ln;
q.toFile = rC;
q.Completions = op;
q.Chat = qs;
q.Embeddings = sp;
q.Files = lp;
q.Images = pp;
q.Audio = yo;
q.Moderations = gp;
q.Models = mp;
q.FineTuning = cn;
q.Graders = na;
q.VectorStores = Kr;
q.Webhooks = Mp;
q.Beta = un;
q.Batches = Yh;
q.Uploads = ra;
q.Admin = Ks;
q.Responses = Vr;
q.Realtime = Hr;
q.Conversations = Xs;
q.Evals = Zs;
q.Containers = Ys;
q.Skills = Jr;
q.Videos = bp;
function kC(e) {
  if (DC(e)) return "Connection error. This may be caused by passing an undici dispatcher, such as ProxyAgent, that is incompatible with the fetch implementation. If you are using undici's ProxyAgent, pass the fetch implementation from the same undici package: import { fetch, ProxyAgent } from 'undici'; new OpenAI({ fetch, fetchOptions: { dispatcher: new ProxyAgent(...) } });";
}
function DC(e) {
  let t = e;
  for (let n = 0; n < 8 && t && typeof t == "object"; n++) {
    const o = t;
    if (o.code === "UND_ERR_INVALID_ARG" && typeof o.message == "string" && o.message.includes("invalid onRequestStart method")) return !0;
    t = o.cause;
  }
  return !1;
}
function vc(e = "", t = 0) {
  let n = 0;
  for (let o = t - 1; o >= 0 && e[o] === "\\"; o -= 1) n += 1;
  return n % 2 === 1;
}
function $C(e = "") {
  return /^[0-9a-fA-F]{4}$/.test(e);
}
function LC(e = "") {
  return /^[dD][89a-bA-B][0-9a-fA-F]{2}$/.test(e);
}
function UC(e = "") {
  return /^[dD][c-fC-F][0-9a-fA-F]{2}$/.test(e);
}
function FC(e = "") {
  const t = String(e ?? "");
  let n = "", o = 0;
  for (; o < t.length; ) {
    const r = t.slice(o, o + 2), i = t.slice(o + 2, o + 6);
    if (r !== "\\u" || vc(t, o) || !$C(i)) {
      n += t[o] || "", o += 1;
      continue;
    }
    const a = o + 6, u = t.slice(a + 2, a + 6);
    if (LC(i) && t.slice(a, a + 2) === "\\u" && !vc(t, a) && UC(u)) {
      const c = Number.parseInt(i, 16), d = Number.parseInt(u, 16), h = 65536 + (c - 55296 << 10) + (d - 56320);
      n += String.fromCodePoint(h), o += 12;
      continue;
    }
    n += String.fromCharCode(Number.parseInt(i, 16)), o += 6;
  }
  return n;
}
function OC(e = "") {
  let t = String(e ?? "").trim();
  return t.endsWith(",") && (t = t.slice(0, -1).trimEnd()), t.startsWith('\\"') && (t = t.slice(2)), t.endsWith('\\"') && (t = t.slice(0, -2)), t.startsWith('"') && (t = t.slice(1)), t.endsWith('"') && (t = t.slice(0, -1)), FC(t.replace(/\r\n/g, `
`).replace(/\\r/g, "\r").replace(/\\n/g, `
`).replace(/\\t/g, "	").replace(/\\"/g, '"')).replace(/\\\\/g, "\\");
}
function GC(e = "") {
  return String(e || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function sa(e = "", t = "", n = 0) {
  const o = new RegExp(`(^|[^A-Za-z0-9_])(?:\\\\?")?${GC(t)}(?:\\\\?")?\\s*:`, "i"), r = String(e || "").slice(Math.max(0, n)).match(o);
  if (!r || r.index === void 0) return null;
  const i = r[1]?.length || 0;
  return {
    key: t,
    index: Math.max(0, n) + r.index + i,
    end: Math.max(0, n) + r.index + r[0].length
  };
}
function BC(e = "", t = [], n = 0) {
  return t.map((o) => sa(e, o, n)).filter(Boolean).sort((o, r) => o.index - r.index)[0] || null;
}
function Ge(e = "", t = "", n = []) {
  const o = String(e || ""), r = sa(o, t);
  if (!r) return;
  let i = r.end;
  for (; /\s/.test(o[i] || ""); ) i += 1;
  o[i] === '"' && (i += 1);
  const a = BC(o, n.filter((d) => d !== t), i);
  let u = a ? a.index : o.length;
  if (a) {
    const d = o.lastIndexOf(",", a.index);
    d >= i && (u = d);
  }
  let c = o.slice(i, u).trim();
  return a || (c = c.replace(/\}\s*$/, "").trimEnd()), OC(c);
}
function et(e = "") {
  const t = String(e ?? "").trim();
  return /^-?\d+(?:\.\d+)?$/.test(t) ? Number(t) : /^true$/i.test(t) ? !0 : /^false$/i.test(t) ? !1 : /^null$/i.test(t) ? null : t;
}
var Kn = {
  Read: [
    "filePath",
    "path",
    "scope",
    "fromLine",
    "toLine",
    "tail",
    "offset",
    "limit",
    "outputMode",
    "contentFormat"
  ],
  Write: [
    "filePath",
    "path",
    "content"
  ],
  Edit: [
    "filePath",
    "path",
    "edits"
  ],
  Delete: ["filePath", "path"],
  Move: [
    "fromPath",
    "toPath",
    "filePath",
    "path"
  ],
  RenameBook: ["title", "name"],
  ImportMaterial: [
    "title",
    "content",
    "source"
  ],
  Glob: [
    "pattern",
    "path",
    "scope"
  ],
  Grep: [
    "pattern",
    "query",
    "path",
    "scope",
    "include",
    "outputMode",
    "limit",
    "offset",
    "contextLines",
    "useRegex"
  ],
  MapDocs: [
    "docType",
    "docId",
    "limit",
    "offset"
  ],
  MapInspect: [
    "docType",
    "docId",
    "mode",
    "elementId",
    "locationKey",
    "actorKey",
    "from",
    "to",
    "kind",
    "status",
    "query",
    "parent",
    "limit",
    "offset"
  ],
  MapPatch: [
    "docType",
    "docId",
    "expectedRevision",
    "activate",
    "dryRun",
    "ops"
  ],
  MemoryRead: [
    "filePath",
    "path",
    "offset",
    "limit",
    "tail"
  ],
  MemoryWrite: [
    "filePath",
    "path",
    "content"
  ],
  MemoryEdit: [
    "filePath",
    "path",
    "edits"
  ],
  MemoryGrep: [
    "pattern",
    "query",
    "filePath",
    "path",
    "scope",
    "outputMode",
    "limit",
    "offset",
    "contextLines",
    "regex",
    "useRegex"
  ],
  ChatHistory: [
    "mode",
    "limit",
    "offset",
    "startOrder",
    "endOrder",
    "pattern",
    "query",
    "regex",
    "useRegex",
    "full"
  ],
  WebSearch: ["query", "maxResults"],
  DelegateRun: ["task"],
  PlanCreate: [
    "title",
    "details",
    "priority",
    "owner",
    "blockedBy"
  ],
  PlanUpdate: [
    "id",
    "status",
    "details",
    "priority",
    "owner",
    "blockedBy"
  ],
  PlanList: ["status"],
  apply_patch: ["patchText"]
}, qC = [
  "filePath",
  "path",
  "fromPath",
  "toPath",
  "content",
  "edits",
  "patchText",
  "query",
  "task",
  "title",
  "details",
  "pattern",
  "scope",
  "include",
  "status",
  "priority",
  "owner",
  "blockedBy",
  "fromLine",
  "toLine",
  "tail",
  "maxResults",
  "outputMode",
  "contentFormat",
  "limit",
  "offset",
  "contextLines",
  "useRegex",
  "regex",
  "mode",
  "docType",
  "docId",
  "expectedRevision",
  "activate",
  "dryRun",
  "ops",
  "op",
  "eventId",
  "fingerprint",
  "vision",
  "doneWhen",
  "hookForModel",
  "startOrder",
  "endOrder",
  "full"
];
function Ac(e = "", t = [], n = []) {
  for (const o of t) {
    const r = Ge(e, o, n);
    if (r !== void 0) return r;
  }
}
function HC(e = "", t = "") {
  if (t === "Read") {
    const n = Kn.Read, o = {};
    return n.forEach((r, i) => {
      const a = Ge(e, r, n.slice(i + 1));
      a !== void 0 && (o[r] = et(a));
    }), o.filePath === void 0 && o.path !== void 0 && (o.filePath = o.path, delete o.path), o.filePath === void 0 && o.scope !== void 0 && (o.filePath = o.scope, delete o.scope), Object.keys(o).length ? o : null;
  }
  if (t === "Write") {
    const n = {}, o = Ac(e, ["filePath", "path"], ["content"]), r = Ge(e, "content", []);
    return o !== void 0 && (n.filePath = et(o)), r !== void 0 && (n.content = et(r)), Object.keys(n).length ? n : null;
  }
  if (t === "Edit") {
    const n = {}, o = Ac(e, ["filePath", "path"], ["edits"]), r = Ge(e, "edits", []);
    return o !== void 0 && (n.filePath = et(o)), r !== void 0 && (n.edits = et(r)), Object.keys(n).length ? n : null;
  }
  if (t === "Grep") {
    const n = Kn.Grep, o = {};
    return n.forEach((r) => {
      const i = Ge(e, r, n.filter((a) => a !== r));
      i !== void 0 && (o[r] = et(i));
    }), o.pattern === void 0 && o.query !== void 0 && (o.pattern = o.query), o.path === void 0 && o.scope !== void 0 && (o.path = o.scope), Object.keys(o).length ? o : null;
  }
  if (t === "MemoryGrep") {
    const n = Kn.MemoryGrep, o = {};
    return n.forEach((r) => {
      const i = Ge(e, r, n.filter((a) => a !== r));
      i !== void 0 && (o[r] = et(i));
    }), o.pattern === void 0 && o.query !== void 0 && (o.pattern = o.query), o.path === void 0 && o.scope !== void 0 && (o.path = o.scope), o.regex === void 0 && o.useRegex !== void 0 && (o.regex = o.useRegex), Object.keys(o).length ? o : null;
  }
  if (t === "ChatHistory") {
    const n = Kn.ChatHistory, o = {};
    return n.forEach((r) => {
      const i = Ge(e, r, n.filter((a) => a !== r));
      i !== void 0 && (o[r] = et(i));
    }), o.pattern === void 0 && o.query !== void 0 && (o.pattern = o.query), o.regex === void 0 && o.useRegex !== void 0 && (o.regex = o.useRegex), Object.keys(o).length ? o : null;
  }
  return null;
}
function VC(e = "", t = "") {
  const n = String(e || "").trim();
  if (!n) return null;
  try {
    const a = JSON.parse(n);
    if (a && typeof a == "object" && !Array.isArray(a)) return a;
  } catch {
  }
  const o = HC(n, t);
  if (o) return o;
  const r = Kn[t] || qC, i = {};
  return r.forEach((a, u) => {
    const c = Ge(n, a, r.slice(u + 1));
    c !== void 0 && (i[a] = et(c));
  }), Object.keys(i).length ? i : null;
}
function JC(e = "", t = "") {
  const n = VC(e, t);
  return n ? JSON.stringify(n) : "";
}
function Np(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function Oe(e, t, n) {
  const o = String(n || "").trim();
  o && e.push({
    label: t,
    text: o
  });
}
function ye(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function z(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function kp(e) {
  if (typeof e == "string") return e;
  if (e == null) return "{}";
  try {
    return JSON.stringify(e);
  } catch {
    return "{}";
  }
}
function Dp(e, t = "") {
  if (e && typeof e == "object" && !Array.isArray(e)) return JSON.stringify(e);
  const n = typeof e == "string" ? e : kp(e);
  return JC(n, t) || JSON.stringify(Np(n));
}
function KC(e = "") {
  const t = String(e || ""), n = sa(t, "arguments");
  if (!n) return "";
  let o = n.end;
  for (; /\s/.test(t[o] || ""); ) o += 1;
  const r = t[o] || "";
  return r === "{" ? t.slice(o).replace(/\}\s*$/, "").trimEnd() : r === '"' ? t.slice(o + 1).replace(/"\s*\}\s*$/, "").trimEnd() : t.slice(o).replace(/\}\s*$/, "").trimEnd();
}
function WC(e = "", t = 0) {
  const n = String(e || "").trim(), o = Ge(n, "name", ["id", "arguments"]) || Ge(n, "toolName", ["id", "arguments"]) || "", r = Ge(n, "id", [
    "name",
    "toolName",
    "arguments"
  ]) || `tool-call-${t + 1}`, i = KC(n);
  return !o || !i ? null : {
    id: r,
    name: o,
    arguments: Dp(i, o)
  };
}
function zC(e, t = 0, n = "openai-tool") {
  if (!z(e)) return null;
  const o = z(e.function) ? e.function : null, r = String(o?.name || "").trim();
  if (!r) return null;
  const i = ye(e) || {};
  return delete i.index, i.id = String(i.id || `${n}-${t + 1}`), i.type = "function", i.function = {
    ...ye(o) || {},
    name: r,
    arguments: kp(o.arguments)
  }, i;
}
function oo(e = [], t = "openai-tool") {
  return (Array.isArray(e) ? e : []).map((n, o) => zC(n, o, t)).filter(Boolean);
}
function ro(e, t) {
  return Array.isArray(e) ? e.some((n) => ro(n, t)) : z(e) ? Object.entries(e).some(([n, o]) => String(n || "").replace(/[_-]/g, "").toLowerCase() === "thoughtsignature" ? t(o) : (Array.isArray(o) || z(o)) && ro(o, t)) : !1;
}
function YC(e) {
  return ro(e, (t) => typeof t == "string" && t.length > 0);
}
function us(e) {
  return ro(e, () => !0);
}
function XC(e) {
  return ro(e, (t) => typeof t != "string" || t.length === 0);
}
function QC(e = {}) {
  return Array.isArray(e?.tool_calls) && e.tool_calls.some((t) => YC(t));
}
var Tc = /* @__PURE__ */ new WeakSet();
function aa(e) {
  if (!z(e)) return null;
  const t = ye(e) || {};
  if (typeof t.content == "string" && /<tool_call\b/i.test(t.content) && (t.content = bt(Rt(t.content).cleaned)), Array.isArray(t.tool_calls)) {
    const n = oo(t.tool_calls);
    n.length ? t.tool_calls = n : delete t.tool_calls;
  }
  return t;
}
function la(e = [], t = "openai-tool") {
  return oo(e, t).map((n, o) => ({
    id: n.id || `${t}-${Date.now()}-${o + 1}`,
    name: n.function.name,
    arguments: n.function.arguments
  }));
}
function ua(e) {
  return typeof e == "string" ? e : Array.isArray(e) ? e.map((t) => t ? typeof t == "string" ? t : t.text || t.content || "" : "").filter(Boolean).join(`
`) : "";
}
function Rt(e = "") {
  const t = [];
  return {
    cleaned: String(e || "").replace(/<think>([\s\S]*?)<\/think>/gi, (n, o) => (Oe(t, "思考块", o), "")).trim(),
    thoughts: t
  };
}
function bt(e = "") {
  const t = String(e || ""), n = t.search(/<tool_call\b/i);
  return n < 0 ? t.trim() : t.slice(0, n).trim();
}
function cs(e = "") {
  const t = String(e || "");
  return /<tool_call\b/i.test(t) ? [{
    id: "tagged-json-draft",
    name: t.match(/["']?name["']?\s*:\s*["']([^"']+)/i)?.[1] || "工具调用",
    arguments: "{}",
    draft: !0
  }] : [];
}
function Ct(e, t, n) {
  if (t) {
    if (typeof t == "string") {
      Oe(e, n, t);
      return;
    }
    if (Array.isArray(t)) {
      t.forEach((o) => Ct(e, o, n));
      return;
    }
    typeof t == "object" && (typeof t.text == "string" && Oe(e, n, t.text), typeof t.content == "string" && Oe(e, n, t.content), typeof t.reasoning_content == "string" && Oe(e, n, t.reasoning_content), typeof t.thinking == "string" && Oe(e, n, t.thinking), Array.isArray(t.summary) && t.summary.forEach((o) => {
      if (typeof o == "string") {
        Oe(e, "推理摘要", o);
        return;
      }
      o && typeof o == "object" && Oe(e, "推理摘要", o.text || o.content || "");
    }));
  }
}
function ft(e = {}, t = {}) {
  const n = [];
  return Ct(n, e.reasoning_content, "推理文本"), Ct(n, e.reasoning, "推理文本"), Ct(n, e.reasoning_text, "推理文本"), Ct(n, e.thinking, "思考块"), Ct(n, t.reasoning_content, "推理文本"), Ct(n, t.reasoning, "推理文本"), Array.isArray(e.content) && e.content.forEach((o) => {
    if (!(!o || typeof o != "object")) {
      if (o.type === "reasoning_text") {
        Oe(n, "推理文本", o.text);
        return;
      }
      if (o.type === "summary_text") {
        Oe(n, "推理摘要", o.text);
        return;
      }
      (o.type === "thinking" || o.type === "reasoning" || o.type === "reasoning_content") && Oe(n, "思考块", o.text || o.content || o.reasoning || "");
    }
  }), n;
}
function Qn(e = "") {
  const t = [/<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g], n = [];
  return t.forEach((o) => {
    [...e.matchAll(o)].forEach((r, i) => {
      try {
        const a = JSON.parse(r[1]);
        n.push({
          id: a.id || `tool-call-${i + 1}`,
          name: String(a.name || ""),
          arguments: Dp(a.arguments, a.name)
        });
      } catch {
        const a = WC(r[1], i);
        a && n.push(a);
      }
    });
  }), n.filter((o) => o.name);
}
function ca(e) {
  const t = e?.providerPayload?.openaiCompatibleMessage;
  return !t || typeof t != "object" || Array.isArray(t) ? null : aa(t);
}
function ZC(e = []) {
  for (let t = e.length - 1; t >= 0; t -= 1) if (e[t]?.role === "user") return t;
  return -1;
}
function jC(e = {}) {
  const t = oo(e?.tool_calls);
  if (t.length) return t;
  const n = oo(ca(e)?.tool_calls);
  return n.length ? n : [];
}
function eI(e = "") {
  return /deepseek/i.test(String(e || ""));
}
function tI(e = "") {
  return /claude/i.test(String(e || ""));
}
function nI(e = "") {
  return Es(e) === "openai";
}
function $p(e = {}, t = {}) {
  return t.mode !== "on" && t.mode !== "off" ? e : t.profileId === "kimi-k3" ? (e.reasoning_effort = t.mode === "off" ? "off" : t.effort, e) : t.profileId === "deepseek-thinking" ? (e.thinking = { type: t.mode === "off" ? "disabled" : "enabled" }, t.mode === "on" && (e.reasoning_effort = t.effort), e) : (String(t.profileId || "").startsWith("openai-") && (e.reasoning_effort = t.mode === "off" ? "none" : t.effort), e);
}
function Lp(e = [], t = "") {
  if (!tI(t)) return e;
  let n = -1;
  for (let r = e.length - 1; r >= 0; r -= 1) if (typeof e[r]?.role == "string") {
    n = r;
    break;
  }
  const o = e[n]?.role;
  return n < 0 || o === "user" || o !== "system" && o !== "assistant" ? e : e.map((r, i) => i === n ? {
    ...r,
    role: "user"
  } : r);
}
function Sc(e, t = "") {
  return !z(e) || !eI(t) || !Array.isArray(e.tool_calls) || !e.tool_calls.length || Object.prototype.hasOwnProperty.call(e, "reasoning_content") ? e : {
    ...e,
    reasoning_content: ""
  };
}
var ds = /* @__PURE__ */ new Set([
  "content",
  "refusal",
  "arguments",
  "reasoning_content",
  "reasoning_text",
  "thinking",
  "text"
]);
function oI(e = [], t = []) {
  const n = Array.isArray(e) ? e.map((o) => ye(o) || {}) : [];
  return (Array.isArray(t) ? t : []).forEach((o, r) => {
    const i = ye(o) || {}, a = Number.isInteger(Number(o?.index)) ? Number(o.index) : r, u = n[a];
    n[a] = z(u) ? vo(u, i, "tool_call") : i;
  }), n.filter((o) => o !== void 0);
}
function vo(e, t, n = "") {
  if (t === void 0) return e;
  if (e === void 0) return ye(t);
  if (t === null && ds.has(String(n || ""))) return e;
  if (n === "tool_calls" && Array.isArray(e) && Array.isArray(t)) return oI(e, t);
  if (typeof e == "string" && typeof t == "string")
    return ds.has(String(n || "")) ? e === t ? e : t.startsWith(e) ? t : e.startsWith(t) ? e : `${e}${t}` : e === t ? e : ye(t);
  if (Array.isArray(e) && Array.isArray(t)) return e.concat(ye(t) || []);
  if (z(e) && z(t)) {
    const o = { ...e };
    return Object.entries(t).forEach(([r, i]) => {
      o[r] = vo(o[r], i, r);
    }), o;
  }
  return ye(t);
}
function Er(e = {}, t = {}) {
  const n = z(e) ? ye(e) || {} : {}, o = z(t) ? ye(t) || {} : {};
  return delete o.message, delete o.finish_reason, delete o.index, delete o.logprobs, delete o.delta, Object.entries(o).forEach(([r, i]) => {
    n[r] = vo(n[r], i, r);
  }), n.role || (n.role = "assistant"), aa(n) || { role: "assistant" };
}
function Zn(e, t = {}) {
  const n = aa(Er(e, t));
  if (!(!n || typeof n != "object" || Array.isArray(n)))
    return { openaiCompatibleMessage: n };
}
function rI(e = {}, t = {}) {
  return z(e) ? z(t) ? vo(ye(e) || {}, t, "") : ye(e) : ye(t);
}
function fs(e, t = "") {
  const n = Array.isArray(e.messages) ? e.messages : [], o = ZC(n), r = [];
  let i = !1;
  n.forEach((u, c) => {
    if (i) {
      if (u?.role === "tool") return;
      i = !1;
    }
    const d = u?.role === "assistant", h = d ? u?.providerPayload?.openaiCompatibleMessage : null, f = Fp(Array.isArray(h?.tool_calls) && h.tool_calls.some((E) => us(E)) ? h.tool_calls : d && Array.isArray(u?.tool_calls) && u.tool_calls.some((E) => us(E)) ? u.tool_calls : null);
    if (f) {
      const E = z(h) ? h : u;
      (!z(E) || !Tc.has(E)) && (z(E) && Tc.add(E), console.warn("[LittleWhiteBox/OpenAI-compatible] skipped corrupted signed tool-call history", {
        code: "openai_compatible_signed_tool_call_history_corrupted",
        toolIndex: f.index,
        toolName: f.toolName,
        reason: f.reason
      })), i = !0;
      return;
    }
    const p = d ? oo(u?.tool_calls) : [], m = d ? ca(u) : null, g = Array.isArray(m?.tool_calls) ? m.tool_calls : [], _ = g.length > 0 && QC(m);
    if (g.length && c > o) {
      r.push(Sc({
        ...m,
        ...p.length && !_ ? { tool_calls: p } : {}
      }, t));
      return;
    }
    const y = {
      role: u.role,
      content: u.content
    };
    u.role === "tool" && u.tool_call_id && (y.tool_call_id = u.tool_call_id), _ ? y.tool_calls = g : p.length && (y.tool_calls = p), r.push(Sc(y, t));
  });
  const a = String(e.systemPrompt || "").trim();
  if (a) if (r[0]?.role === "system") {
    const u = String(r[0].content || "").trim();
    r[0] = {
      ...r[0],
      content: [a, u === a ? "" : u].filter(Boolean).join(`

`)
    };
  } else r.unshift({
    role: "system",
    content: a
  });
  return Lp(r, t);
}
function Ec(e) {
  const t = (e.tools || []).map((r) => [`- ${r.function.name}: ${r.function.description || ""}`.trim(), `  参数 JSON Schema: ${JSON.stringify(r.function.parameters || {})}`].join(`
`)).join(`
`), n = String(e.toolChoice || "auto").trim() || "auto", o = n === "required" ? "本轮必须调用工具，不得只返回正文。" : n === "none" ? "本轮不得调用工具，不得输出 <tool_call> 标签。" : n === "auto" ? "请根据任务判断是否需要调用工具。" : `本轮必须调用工具 ${n}，不得调用其他工具，也不得只返回正文。`;
  return [
    e.systemPrompt || "",
    "如果你需要调用工具，不要使用原生 tool calling 字段。",
    o,
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
function hs(e, t = "") {
  const n = /* @__PURE__ */ new Map(), o = [];
  if ((Array.isArray(e.messages) ? e.messages : []).forEach((r) => {
    if (r.role === "assistant") {
      const i = jC(r);
      if (i.length) {
        const a = ca(r), u = typeof a?.content == "string" ? a.content : String(r.content || ""), c = i.map((d, h) => {
          const f = d.function?.name || "", p = d.id || `tool-call-${h + 1}`;
          return f && n.set(p, f), `<tool_call>${JSON.stringify({
            id: p,
            name: f,
            arguments: Np(d.function?.arguments || "{}")
          })}</tool_call>`;
        }).join(`
`);
        o.push({
          role: "assistant",
          content: [u, c].filter(Boolean).join(`

`)
        });
        return;
      }
    }
    if (r.role === "tool") {
      const i = String(r.toolName || r.tool_name || "").trim() || n.get(r.tool_call_id || "") || "unknown_tool";
      r.tool_call_id && n.delete(r.tool_call_id);
      const a = String(r.content || "");
      o.push({
        role: "user",
        content: [
          "<tool_result>",
          "这是系统工具执行结果，不是用户新发言。",
          `name: ${i}`,
          "content:",
          a,
          "</tool_result>"
        ].join(`
`)
      });
      return;
    }
    o.push({
      role: r.role,
      content: r.content
    });
  }), !o.length || o[0].role !== "system") o.unshift({
    role: "system",
    content: Ec(e)
  });
  else {
    const r = String(o[0].content || "").trim(), i = String(e.systemPrompt || "").trim();
    o[0] = {
      ...o[0],
      content: [Ec(e), r === i ? "" : r].filter(Boolean).join(`

`)
    };
  }
  return Lp(o, t);
}
function wc(e, t, n) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: K(n) ? t.thoughts : [] } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Mn(e, t = []) {
  return K(e) ? t : [];
}
function Up(e, t, n) {
  !e || !t || n === void 0 || (e[t] = vo(e[t], n, t));
}
function wr(e, t, n) {
  if (!(!e || !t || n === void 0)) {
    if (z(n)) {
      const o = z(e[t]) ? { ...e[t] } : {};
      Object.entries(n).forEach(([r, i]) => {
        wr(o, r, i);
      }), e[t] = o;
      return;
    }
    if (typeof n == "string" && ds.has(t)) {
      e[t] = typeof e[t] == "string" ? `${e[t]}${n}` : n;
      return;
    }
    n === "" && e[t] || Up(e, t, n);
  }
}
function iI(e, t = []) {
  !Array.isArray(t) || !t.length || (Array.isArray(e.tool_calls) || (e.tool_calls = []), t.forEach((n) => {
    const o = Number(n?.index ?? 0), r = { ...e.tool_calls[o] || {} };
    Object.entries(n || {}).forEach(([i, a]) => {
      if (i !== "index" && !(i === "function" && a == null)) {
        if (i === "function" && z(a)) {
          r.function = z(r.function) ? { ...r.function } : {}, Object.entries(a).forEach(([u, c]) => {
            wr(r.function, u, c);
          });
          return;
        }
        wr(r, i, a);
      }
    }), e.tool_calls[o] = r;
  }));
}
function ps(e, t = {}) {
  if (!e || !t || typeof t != "object") return;
  Object.entries(t).forEach(([o, r]) => {
    o === "delta" || o === "finish_reason" || o === "index" || o === "logprobs" || Up(e, o, r);
  });
  const n = z(t.delta) ? t.delta : {};
  Object.entries(n).forEach(([o, r]) => {
    if (o === "tool_calls") {
      iI(e, r);
      return;
    }
    wr(e, o, r);
  });
}
function Yt(e = {}) {
  return ua(e?.content);
}
function Xt(e = {}) {
  return la(e?.tool_calls || []);
}
function sI(e) {
  if (typeof e != "string" || !e.trim()) return !1;
  try {
    return z(JSON.parse(e));
  } catch {
    return !1;
  }
}
function Fp(e) {
  if (!Array.isArray(e) || !e.some((t) => us(t))) return null;
  for (let t = 0; t < e.length; t += 1) {
    const n = e[t], o = z(n?.function) ? n.function : null, r = String(o?.name || "").trim();
    let i = "";
    if (!z(n) || !o ? i = "invalid_function_shape" : r ? sI(o.arguments) ? XC(n) && (i = "invalid_thought_signature") : i = "invalid_function_arguments" : i = "missing_function_name", i) return {
      index: t,
      toolName: r,
      reason: i
    };
  }
  return null;
}
function Qt(e = {}) {
  const t = Fp(e?.tool_calls);
  if (!t) return;
  const n = /* @__PURE__ */ new Error("openai_compatible_signed_tool_call_corrupted");
  throw n.toolIndex = t.index, n.toolName = t.toolName, n.reason = t.reason, n;
}
async function aI(e, t) {
  const n = e.body?.getReader?.();
  if (!n) throw new Error("openai_compatible_stream_missing_body");
  const o = new TextDecoder();
  let r = "";
  const i = /\r?\n\r?\n/;
  for (; ; ) {
    const { done: u, value: c } = await n.read();
    if (u) break;
    for (r += o.decode(c, { stream: !0 }); ; ) {
      const d = r.match(i);
      if (!d || typeof d.index != "number") break;
      const h = d.index, f = r.slice(0, h);
      r = r.slice(h + d[0].length);
      const p = f.split(/\r?\n/).filter((m) => m.startsWith("data:")).map((m) => m.slice(5).trimStart()).join(`
`).trim();
      !p || p === "[DONE]" || t(JSON.parse(p));
    }
  }
  const a = r.trim();
  if (a && a !== "[DONE]") {
    const u = a.split(/\r?\n/).filter((c) => c.startsWith("data:")).map((c) => c.slice(5).trimStart()).join(`
`).trim();
    u && u !== "[DONE]" && t(JSON.parse(u));
  }
}
function lI(e, t) {
  const n = String(e || "").trim();
  if (n && (n.startsWith("{") || n.startsWith("["))) try {
    const o = JSON.parse(n), r = o?.error?.message || o?.message;
    if (typeof r == "string" && r.trim()) return r.trim();
  } catch {
  }
  return n || `OpenAI 兼容流式请求失败（HTTP ${t}）`;
}
var uI = class {
  constructor(e) {
    this.config = e, this.client = new q({
      apiKey: e.apiKey,
      baseURL: String(e.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e, t = Q("openai-compatible", this.config, e.reasoning)) {
    const n = t, o = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, r = !o && Array.isArray(e.tools) && e.tools.length ? e.tools : null, i = {
      model: this.config.model,
      messages: o ? hs(e, this.config.model) : fs(e, this.config.model),
      ...r ? {
        tools: r,
        tool_choice: e.toolChoice || "auto"
      } : {},
      ...e.maxTokens ? nI(this.config.model) ? { max_completion_tokens: e.maxTokens } : { max_tokens: e.maxTokens } : {}
    };
    return !ho({
      ...this.config,
      provider: "openai-compatible"
    }, n) && typeof e.temperature == "number" && (i.temperature = e.temperature), $p(i, n);
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", o = t.effectiveReasoning || Q("openai-compatible", this.config, e.reasoning), r = {
      ...t.body || this.buildRequestBody(e, o),
      ...n ? { stream: !0 } : {}
    }, i = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), a = {
      ...Object.hasOwn(r, "reasoning_effort") ? { reasoning_effort: r.reasoning_effort } : {},
      ...Object.hasOwn(r, "thinking") ? { thinking: r.thinking } : {}
    };
    return { ...to({
      provider: "openai-compatible",
      model: this.config.model,
      transport: "openai-compatible",
      url: `${i}/chat/completions`,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.config.apiKey ? `Bearer ${this.config.apiKey}` : ""
      },
      body: r,
      sdk: n ? "client.chat.completions.create(..., { stream: true })" : "client.chat.completions.create",
      effectiveConfig: mt(e, {
        reasoning: o,
        effort: r.reasoning_effort,
        controlFields: a
      })
    }) };
  }
  async streamNativeChatCompletions(e, t, n) {
    const o = `${String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, "")}/chat/completions`, r = await fetch(o, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        ...t,
        stream: !0
      }),
      signal: e.signal
    });
    if (!r.ok) {
      const g = await r.text().catch(() => ""), _ = new Error(lI(g, r.status));
      throw _.status = r.status, _.body = g, _;
    }
    const i = { role: "assistant" };
    let a = "stop", u = this.config.model;
    await aI(r, (g) => {
      u = g?.model || u;
      const _ = g?.choices?.[0];
      ps(i, _), _?.finish_reason && (a = _.finish_reason);
      const y = Rt(Yt(i)), E = Xt(i), w = E.length ? E : cs(y.cleaned);
      wc(e, {
        text: E.length ? y.cleaned : bt(y.cleaned),
        thoughts: Mn(n, ft(i, _).concat(y.thoughts)),
        ...w.length ? { toolCalls: w } : {},
        ...!E.length && w.length ? { toolCallDraft: !0 } : {}
      }, n);
    }), Qt(i);
    const c = Zn(i), d = Xt(i), h = Rt(Yt(i)), f = ft(i, {});
    h.thoughts.forEach((g) => f.push(g));
    const p = d.length ? [] : Qn(h.cleaned), m = [...d, ...p];
    return {
      text: d.length ? h.cleaned : bt(h.cleaned),
      toolCalls: m,
      thoughts: Mn(n, f),
      finishReason: a,
      model: u,
      provider: "openai-compatible",
      providerPayload: c
    };
  }
  async chat(e) {
    const t = Q("openai-compatible", this.config, e.reasoning), n = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, o = typeof e.onStreamProgress == "function", r = this.buildRequestBody(e, t), i = this.inspectRequest(e, {
      body: r,
      effectiveReasoning: t
    }), a = async (E) => {
      try {
        return await E(r);
      } catch (w) {
        throw w && typeof w == "object" && (w.requestInspection = i), w;
      }
    };
    if (o) {
      if (!n) return {
        ...await a((J) => this.streamNativeChatCompletions(e, J, t)),
        requestInspection: i
      };
      const E = await a((J) => this.client.chat.completions.create({
        ...J,
        stream: !0
      }, { signal: e.signal })), w = { role: "assistant" };
      let C = "stop", P = this.config.model, M;
      for await (const J of E) {
        P = J.model || P;
        const W = J.choices?.[0];
        ps(w, W), W?.finish_reason && (C = W.finish_reason);
        const pe = Rt(Yt(w)), Je = Xt(w), $e = Je.length ? Je : cs(pe.cleaned);
        wc(e, {
          text: Je.length ? pe.cleaned : bt(pe.cleaned),
          thoughts: Mn(t, ft(w, W).concat(pe.thoughts)),
          ...$e.length ? { toolCalls: $e } : {},
          ...!Je.length && $e.length ? { toolCallDraft: !0 } : {}
        }, t);
      }
      const A = (typeof E.finalChatCompletion == "function" ? await E.finalChatCompletion() : null)?.choices?.[0] || null, $ = A?.message || w;
      Qt($);
      const I = rI(w, Er($, A || {}));
      Qt(I), M = Zn(I);
      const x = Xt(I), F = Rt(Yt(I)), H = ft(I, A || {});
      F.thoughts.forEach((J) => H.push(J));
      const ue = x.length ? [] : Qn(F.cleaned), ie = [...x, ...ue];
      return {
        text: x.length ? F.cleaned : bt(F.cleaned),
        toolCalls: ie,
        thoughts: Mn(t, H),
        finishReason: C,
        model: P,
        provider: "openai-compatible",
        providerPayload: M,
        requestInspection: i
      };
    }
    const u = await a((E) => this.client.chat.completions.create(E, { signal: e.signal })), c = u.choices?.[0] || {}, d = c.message || {};
    Qt(d);
    const h = ft(d, c), f = la(d.tool_calls || []), p = Rt(ua(d.content));
    p.thoughts.forEach((E) => h.push(E));
    const m = f.length ? [] : Qn(p.cleaned), g = [...f, ...m], _ = f.length ? p.cleaned : bt(p.cleaned), y = Er(d, c);
    return {
      text: _,
      toolCalls: g,
      thoughts: Mn(t, h),
      finishReason: c.finish_reason || "stop",
      model: u.model || this.config.model,
      provider: "openai-compatible",
      providerPayload: Zn(y),
      requestInspection: i
    };
  }
};
function cI(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function da(e) {
  const t = cI(Array.isArray(e) ? e : []);
  return Array.isArray(t) ? (t.forEach((n) => {
    !n || typeof n != "object" || Array.isArray(n) || (n.type === "function_call" && delete n.parsed_arguments, n.type === "message" && Array.isArray(n.content) && n.content.forEach((o) => {
      !o || typeof o != "object" || Array.isArray(o) || delete o.parsed;
    }));
  }), t) : [];
}
function Op(e, t) {
  return {
    type: "message",
    role: e,
    content: dI(t)
  };
}
function Cr(e) {
  return {
    role: "assistant",
    content: typeof e == "string" ? e : ""
  };
}
function dI(e) {
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
function Ir(e, t, n) {
  const o = String(n || "").trim();
  o && e.push({
    label: t,
    text: o
  });
}
function Cc(e, t = [], n = {}) {
  (t || []).forEach((o) => {
    if (!(!o || typeof o != "object")) {
      if (o.type === "reasoning_text") {
        Ir(e, n.reasoning || "推理文本", o.text);
        return;
      }
      o.type === "summary_text" && Ir(e, n.summary || "推理摘要", o.text);
    }
  });
}
function fI(e = []) {
  const t = [];
  return (e || []).forEach((n) => {
    !n || typeof n != "object" || n.type === "reasoning" && (Cc(t, n.content, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }), Cc(t, n.summary, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }));
  }), t;
}
function hI(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function pI(e) {
  if (typeof e?.output_text == "string" && e.output_text.trim()) return e.output_text.trim();
  const t = [];
  return (Array.isArray(e?.output) ? e.output : []).forEach((n) => {
    if (!(!n || typeof n != "object")) {
      if (n.type === "message" && Array.isArray(n.content)) {
        n.content.forEach((o) => {
          if (!(!o || typeof o != "object")) {
            if (o.type === "output_text" && typeof o.text == "string" && o.text.trim()) {
              t.push(o.text.trim());
              return;
            }
            o.type === "refusal" && typeof o.refusal == "string" && o.refusal.trim() && t.push(o.refusal.trim());
          }
        });
        return;
      }
      typeof n.text == "string" && n.text.trim() && t.push(n.text.trim());
    }
  }), t.join(`
`).trim();
}
function mI(e) {
  if (e && typeof e == "object" && !Array.isArray(e) && !Object.prototype.hasOwnProperty.call(e, "choices") && Array.isArray(e.output)) return;
  const t = /* @__PURE__ */ new Error("当前端点返回的不是 Responses API，请改用 OpenAI 兼容。");
  throw t.name = "OpenAIResponsesEndpointMismatchError", t.code = "OPENAI_RESPONSES_ENDPOINT_MISMATCH", t;
}
function gI(e) {
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
      if (n.role === "assistant" && Array.isArray(n?.providerPayload?.openAIResponseOutput) && n.providerPayload.openAIResponseOutput.length) {
        t.push(...da(n.providerPayload.openAIResponseOutput));
        continue;
      }
      if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
        n.content?.trim() && t.push(Cr(n.content)), n.tool_calls.forEach((o, r) => {
          t.push({
            type: "function_call",
            call_id: o.id || `function_call_${r + 1}`,
            name: o.function?.name || "",
            arguments: o.function?.arguments || "{}",
            status: "completed"
          });
        });
        continue;
      }
      if (n.role === "assistant") {
        t.push(Cr(n.content || ""));
        continue;
      }
      t.push(n.role === "user" ? Op(n.role, n.content || "") : {
        role: n.role,
        content: typeof n.content == "string" ? n.content : ""
      });
    }
  return t;
}
function _I(e) {
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
    if (n.role === "assistant" && Array.isArray(n?.providerPayload?.openAIResponseOutput) && n.providerPayload.openAIResponseOutput.length) {
      t.push(...da(n.providerPayload.openAIResponseOutput));
      continue;
    }
    if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
      n.content?.trim() && t.push(Cr(n.content)), n.tool_calls.forEach((o, r) => {
        t.push({
          type: "function_call",
          call_id: o.id || `function_call_${r + 1}`,
          name: o.function?.name || "",
          arguments: o.function?.arguments || "{}",
          status: "completed"
        });
      });
      continue;
    }
    if (n.role === "assistant") {
      t.push(Cr(n.content || ""));
      continue;
    }
    t.push(n.role === "user" ? Op(n.role, n.content || "") : {
      role: n.role,
      content: typeof n.content == "string" ? n.content : ""
    });
  }
  return t;
}
function yI(e) {
  try {
    return new URL(String(e || "https://api.openai.com/v1")).hostname === "api.openai.com";
  } catch {
    return !1;
  }
}
function vI(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return t.includes("instructions") || t.includes("unsupported") || t.includes("unknown parameter") || t.includes("invalid input");
}
function AI(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function _i(e, t) {
  const [n = "0", o = "0"] = String(e || "").split(":"), [r = "0", i = "0"] = String(t || "").split(":");
  return Number(n) - Number(r) || Number(o) - Number(i);
}
var TI = class {
  constructor(e) {
    this.config = e, this.client = new q({
      apiKey: e.apiKey,
      baseURL: String(e.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e, t = !1, n = Q("openai-responses", this.config, e.reasoning)) {
    const o = n, r = {
      model: this.config.model,
      instructions: t ? void 0 : hI(e) || void 0,
      input: t ? _I(e) : gI(e),
      ...Array.isArray(e.tools) && e.tools.length ? {
        tools: e.tools.map((i) => ({
          type: "function",
          name: i.function.name,
          description: i.function.description,
          parameters: i.function.parameters
        })),
        tool_choice: e.toolChoice || "auto"
      } : {},
      ...e.maxTokens ? { max_output_tokens: e.maxTokens } : {}
    };
    return !ho({
      ...this.config,
      provider: "openai-responses"
    }, o) && typeof e.temperature == "number" && (r.temperature = e.temperature), o.mode === "on" || o.mode === "off" ? r.reasoning = {
      effort: o.mode === "off" ? "none" : o.effort,
      ...o.mode === "on" && K(o) ? { summary: "auto" } : {}
    } : K(o) && (r.reasoning = { summary: "auto" }), o.mode !== "off" && o.profileId.startsWith("openai-") && (r.include = ["reasoning.encrypted_content"]), r;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", o = t.legacySystemInInput === !0, r = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), i = t.effectiveReasoning || Q("openai-responses", this.config, e.reasoning), a = t.body || this.buildRequestBody(e, o, i);
    return to({
      provider: "openai-responses",
      model: this.config.model,
      transport: "openai-responses",
      url: `${r}/responses`,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.config.apiKey ? `Bearer ${this.config.apiKey}` : ""
      },
      body: a,
      sdk: n ? "client.responses.stream" : "client.responses.create",
      effectiveConfig: mt(e, {
        reasoning: i,
        effort: a.reasoning?.effort,
        controlFields: {
          ...a.reasoning ? { reasoning: a.reasoning } : {},
          ...a.include ? { include: a.include } : {}
        }
      })
    });
  }
  async chat(e) {
    const t = Q("openai-responses", this.config, e.reasoning), n = [], o = () => ({
      ...n.at(-1)?.inspection || {},
      requestCount: n.length,
      fallbackCount: Math.max(0, n.length - 1),
      requests: n.map(({ reason: m, inspection: g }, _) => ({
        index: _ + 1,
        reason: m,
        request: g.request,
        effectiveConfig: g.effectiveConfig
      }))
    }), r = (m) => (m && typeof m == "object" && (m.requestInspection = o()), m), i = (m) => {
      mI(m);
      const g = m.output;
      return {
        output: g,
        thoughts: K(t) ? fI(g) : [],
        toolCalls: g.filter((_) => _.type === "function_call" && _.name).map((_, y) => ({
          id: _.call_id || `response-tool-${y + 1}`,
          name: _.name || "",
          arguments: _.arguments || "{}"
        })),
        text: pI(m)
      };
    }, a = (m, g, _) => {
      const y = this.inspectRequest(e, {
        body: m,
        legacySystemInInput: g,
        effectiveReasoning: t
      });
      n.push({
        reason: _,
        inspection: y
      });
    }, u = async (m = !1, g = "initial") => {
      const _ = this.buildRequestBody(e, m, t);
      a(_, m, g);
      try {
        return await this.client.responses.create(_, { signal: e.signal });
      } catch (y) {
        throw r(y);
      }
    }, c = async (m = !1, g = "initial") => {
      const _ = this.buildRequestBody(e, m, t);
      a(_, m, g);
      try {
        const y = this.client.responses.stream(_, { signal: e.signal }), E = /* @__PURE__ */ new Map(), w = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Map(), P = () => {
          const M = [];
          K(t) && (Array.from(w.entries()).sort(([A], [$]) => _i(A, $)).forEach(([, A]) => Ir(M, "推理文本", A)), Array.from(C.entries()).sort(([A], [$]) => _i(A, $)).forEach(([, A]) => Ir(M, "推理摘要", A))), AI(e, {
            text: Array.from(E.entries()).sort(([A], [$]) => _i(A, $)).map(([, A]) => A).join(`
`).trim(),
            thoughts: M
          });
        };
        return y.on("response.output_text.delta", (M) => {
          const A = `${M.output_index}:${M.content_index}`;
          E.set(A, `${E.get(A) || ""}${M.delta}`), P();
        }), y.on("response.reasoning_text.delta", (M) => {
          const A = `${M.output_index}:${M.content_index}`;
          w.set(A, `${w.get(A) || ""}${M.delta}`), P();
        }), y.on("response.reasoning_summary_text.delta", (M) => {
          const A = `${M.output_index}:${M.summary_index}`;
          C.set(A, `${C.get(A) || ""}${M.delta}`), P();
        }), await y.finalResponse();
      } catch (y) {
        throw r(y);
      }
    }, d = !yI(this.config.baseUrl), h = typeof e.onStreamProgress == "function" ? c : u;
    let f, p;
    try {
      f = await h(!1, "initial"), p = i(f);
    } catch (m) {
      if (!d || !vI(m)) throw r(m);
      f = await h(!0, "legacy_system_error");
      try {
        p = i(f);
      } catch (g) {
        throw r(g);
      }
    }
    if (d && n.length < 2 && !p.text && !p.toolCalls.length) {
      f = await h(!0, "empty_response");
      try {
        p = i(f);
      } catch (m) {
        throw r(m);
      }
    }
    return {
      text: p.text,
      toolCalls: p.toolCalls,
      thoughts: p.thoughts,
      finishReason: f.incomplete_details?.reason || f.status || "stop",
      refused: p.output.some((m) => m?.type === "message" && Array.isArray(m.content) && m.content.some((g) => g?.type === "refusal")),
      model: f.model || this.config.model,
      provider: "openai-responses",
      providerPayload: p.output.length ? { openAIResponseOutput: da(p.output) } : void 0,
      requestInspection: o()
    };
  }
};
async function SI(e, t) {
  const n = e.body?.getReader?.();
  if (!n) throw new Error("host_chat_completions_stream_missing_body");
  const o = new TextDecoder();
  let r = "";
  const i = /\r?\n\r?\n/, a = (c) => {
    const d = c.split(/\r?\n/).filter((h) => h.startsWith("data:")).map((h) => h.slice(5).trimStart()).join(`
`).trim();
    !d || d === "[DONE]" || t(JSON.parse(d));
  };
  for (; ; ) {
    const { done: c, value: d } = await n.read();
    if (c) break;
    for (r += o.decode(d, { stream: !0 }); ; ) {
      const h = r.match(i);
      if (!h || typeof h.index != "number") break;
      const f = r.slice(0, h.index);
      r = r.slice(h.index + h[0].length), a(f);
    }
  }
  const u = r.trim();
  u && a(u);
}
var yt = "openai", fa = "claude", ha = "makersuite", EI = "/api/backends/chat-completions/status", wI = "/api/backends/chat-completions/generate", Gp = Object.freeze({
  [fa]: "https://api.anthropic.com/v1",
  [ha]: "https://generativelanguage.googleapis.com"
}), dn = null;
function CI(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function II(e = "") {
  return Es(e) === "openai";
}
function RI(e, t) {
  const n = CI(e);
  return t === "claude" ? !n || /\/v\d[\w.-]*$/i.test(n) ? n : `${n}/v1` : t === "makersuite" ? n.replace(/\/v\d[\w.-]*$/i, "") : n;
}
function bI(e) {
  dn = typeof e == "function" ? e : null;
}
async function Bp(e = dn) {
  if (typeof e != "function") throw new Error("宿主请求头未注册，无法调用酒馆后端。");
  return {
    "Content-Type": "application/json",
    ...await Promise.resolve(e() || {}),
    Accept: "application/json"
  };
}
function PI(e = {}) {
  const t = {};
  return Object.entries(e || {}).forEach(([n, o]) => {
    t[n] = /authorization|cookie|csrf|token|api[-_]?key/i.test(n) ? "[redacted]" : o;
  }), t;
}
async function pa(e = {}, t = !1, n = dn) {
  const o = await Bp(n), r = {
    url: wI,
    method: "POST",
    headers: PI(o),
    body: {
      ...e,
      stream: !!t
    }
  };
  return Object.defineProperty(r, "rawHeaders", {
    value: o,
    enumerable: !1
  }), r;
}
async function MI(e = {}, t = !1) {
  return await pa(e, t);
}
function xI(e = "") {
  return /^\s*(?:<!DOCTYPE\s+html\b|<html\b)/i.test(String(e || ""));
}
function NI(e = "") {
  return /invalid csrf token/i.test(String(e || ""));
}
function kI() {
  return "酒馆当前页面的 CSRF token 已失效，请按 F5 刷新并重新进入酒馆后再试。";
}
function Ic(e = "", t = 10) {
  const n = Number.parseInt(String(e || ""), t);
  return Number.isInteger(n) && n >= 0 && n <= 1114111 ? String.fromCodePoint(n) : "";
}
function Rc(e = "") {
  return String(e || "").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#x([0-9a-f]+);?/gi, (t, n) => Ic(n, 16)).replace(/&#([0-9]+);?/g, (t, n) => Ic(n));
}
function DI(e = "") {
  const t = String(e || ""), n = Rc((t.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/\s+/g, " ").trim(), o = Rc(t.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(), r = n || o;
  return r.length > 240 ? `${r.slice(0, 237)}...` : r;
}
function $I(e = null) {
  const t = Number(e?.status), n = String(e?.statusText || "").trim();
  let o = "";
  try {
    o = String(e?.headers?.get?.("content-type") || "").trim();
  } catch {
    o = "";
  }
  return {
    status: Number.isFinite(t) && t > 0 ? t : 0,
    statusText: n,
    contentType: o
  };
}
function LI(e = {}) {
  return e.status ? `HTTP ${e.status}${e.statusText ? ` ${e.statusText}` : ""}` : "";
}
function UI(e = "") {
  const t = String(e || "").trim();
  if (!t || t[0] !== "{" && t[0] !== "[") return "";
  try {
    const n = JSON.parse(t), o = n?.error?.message;
    if (typeof o == "string" && o.trim()) return o.trim();
    if (typeof n?.message == "string" && n.message.trim()) return n.message.trim();
  } catch {
    return "";
  }
  return "";
}
function tn(e = "", t = "", n = null) {
  if (NI(e)) return kI();
  const o = $I(n);
  if (xI(e) || /\btext\/html\b/i.test(o.contentType)) {
    const r = LI(o), i = DI(e);
    return [
      "酒馆后端返回了非 JSON 的 HTML 页面",
      r ? `（${r}）` : "",
      i ? `：${i}` : ""
    ].join("");
  }
  return UI(e) || String(e || t || "").trim();
}
function qp(e = {}, t = yt) {
  const n = RI(e.baseUrl, t), o = String(e.apiKey || "").trim(), r = Gp[t] || "", i = n || (o ? r : ""), a = { chat_completion_source: t || "openai" };
  return i && (a.reverse_proxy = i), o && (a.proxy_password = o), a;
}
function FI(e = {}) {
  return Object.keys(e).forEach((t) => {
    (e[t] === void 0 || e[t] === "") && delete e[t];
  }), e;
}
function OI(e = {}, t = yt) {
  return qp(e, t);
}
function ma(e = {}, t = {}, n = [], o = !1, r = yt) {
  const i = t.maxTokens, a = r === "openai" && II(e.model);
  return FI({
    ...qp(e, r),
    stream: !!o,
    messages: n,
    model: e.model,
    max_tokens: a ? void 0 : i,
    max_completion_tokens: a ? i : void 0,
    temperature: t.temperature,
    tools: Array.isArray(t.tools) && t.tools.length ? t.tools : void 0,
    tool_choice: Array.isArray(t.tools) && t.tools.length ? t.toolChoice || "auto" : void 0,
    use_sysprompt: r === "openai" ? void 0 : !0
  });
}
function GI(e = {}, t = {}, n = [], o = !1) {
  return ma(e, t, n, o, yt);
}
function BI(e = {}, t = {}, n = [], o = !1) {
  return ma(e, t, n, o, fa);
}
function qI(e = {}, t = {}, n = [], o = !1) {
  return ma(e, t, n, o, ha);
}
function ga(e) {
  const t = e || globalThis.fetch;
  if (typeof t != "function") throw new Error("当前运行环境没有可用的 fetch，无法调用酒馆后端。");
  return t;
}
async function HI(e = {}, t = yt, n = {}, o = {}) {
  const r = await ga(o.fetch)(EI, {
    method: "POST",
    headers: await Bp(o.requestHeadersProvider),
    body: JSON.stringify(OI(e, t)),
    signal: n.signal
  }), i = await r.text();
  let a = null;
  try {
    a = i ? JSON.parse(i) : {};
  } catch (c) {
    throw new Error(`酒馆后端模型列表拉取失败：${tn(i, String(c?.message || c), r)}`);
  }
  if (!r.ok || a?.error) {
    const c = tn(a?.message || a?.error?.message || i, `HTTP ${r.status}`, r);
    throw new Error(`酒馆后端模型列表拉取失败：${c}`);
  }
  const u = Array.isArray(a?.data) ? a.data.map((c) => String(c?.id || c?.name || "").trim()).filter(Boolean) : [];
  return [...new Set(u)];
}
async function _a(e = {}, t = yt, n = {}) {
  return await HI(e, t, n, { requestHeadersProvider: dn });
}
async function VI(e = {}, t = {}) {
  return await _a(e, yt, t);
}
async function JI(e = {}, t = {}, n = {}) {
  const o = await pa(e, !1, n.requestHeadersProvider);
  typeof t.onRequest == "function" && t.onRequest(o);
  const r = await ga(n.fetch)(o.url, {
    method: o.method,
    headers: o.rawHeaders || o.headers,
    body: JSON.stringify(o.body),
    signal: t.signal
  }), i = await r.text();
  let a = null;
  try {
    a = i ? JSON.parse(i) : {};
  } catch (u) {
    const c = /* @__PURE__ */ new Error(`酒馆后端生成失败：${tn(i, String(u?.message || u), r)}`);
    throw c.status = r.status, c.body = i, c;
  }
  if (!r.ok || a?.error) {
    const u = tn(a?.error?.message || a?.message || i, `HTTP ${r.status}`, r), c = /* @__PURE__ */ new Error(`酒馆后端生成失败：${u}`);
    throw c.status = r.status, c.error = a?.error, c;
  }
  return a;
}
async function KI(e = {}, t = {}) {
  return await JI(e, t, { requestHeadersProvider: dn });
}
async function WI(e = {}, t, n = {}, o = {}) {
  const r = await pa(e, !0, o.requestHeadersProvider);
  typeof n.onRequest == "function" && n.onRequest(r);
  const i = await ga(o.fetch)(r.url, {
    method: r.method,
    headers: r.rawHeaders || r.headers,
    body: JSON.stringify(r.body),
    signal: n.signal
  });
  if (!i.ok) {
    const a = await i.text().catch(() => ""), u = new Error(tn(a, `酒馆后端流式生成失败：HTTP ${i.status}`, i));
    throw u.status = i.status, u.body = a, u;
  }
  typeof n.onResponseAccepted == "function" && n.onResponseAccepted(), await SI(i, (a) => {
    if (a?.error) {
      const u = tn(a.error?.message || a.message || JSON.stringify(a.error), "酒馆后端流式生成失败");
      throw new Error(u);
    }
    t(a);
  });
}
async function zI(e = {}, t, n = {}) {
  return await WI(e, t, n, { requestHeadersProvider: dn });
}
var YI = Object.freeze([
  "buildHostChatCompletionGenerateRequest",
  "createHostChatCompletion",
  "streamHostChatCompletion"
]);
function Wr(e) {
  if (!e || !YI.every((t) => typeof e[t] == "function")) throw new TypeError("酒馆渠道必须注入有效的 Host Client。");
  return e;
}
var ya = Object.freeze({
  buildHostChatCompletionGenerateRequest: MI,
  fetchHostChatCompletionsModels: _a,
  fetchHostOpenAICompatibleModels: VI,
  createHostChatCompletion: KI,
  streamHostChatCompletion: zI
});
function kt(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function XI(e) {
  const t = String(e || "").trim();
  if (!t || t === "auto") return "auto";
  if (t === "required") return "any";
  if (t === "none") return "none";
  throw new Error(`酒馆托管 Claude 不支持 tool_choice：${t}。仅支持 auto/required/none。`);
}
function QI(e = {}, t = {}, n = Q("sillytavern-claude", e, t.reasoning)) {
  if (!(Array.isArray(t.tools) && t.tools.length > 0)) return {
    toolChoice: void 0,
    reasoningDisabledForForcedTool: !1
  };
  const o = XI(t.toolChoice), r = n.profileId === "sillytavern-claude-manual" || n.profileId === "sillytavern-claude-adaptive-conditional";
  return {
    toolChoice: o,
    reasoningDisabledForForcedTool: o === "any" && n.mode === "on" && r
  };
}
var ZI = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function Wo(e = {}, t = {}, n = {}, o) {
  const r = o || Q("sillytavern-claude", e, t.reasoning);
  return n.reasoningDisabledForForcedTool ? {
    ...r,
    mode: "off",
    output: "hide"
  } : r;
}
function jI(e = {}, t = {}, n = {}) {
  return mt(e, {
    reasoning: n,
    effort: n.mode === "on" ? n.effort : "",
    controlFields: t.controlFields || {}
  });
}
function e0(e = {}, t = {}) {
  return { toolChoice: String(t.toolChoice || "") };
}
function Hp(e = "") {
  try {
    return {
      ok: !0,
      input: JSON.parse(String(e || ""))
    };
  } catch (t) {
    return {
      ok: !1,
      input: {},
      raw: String(e || ""),
      error: t instanceof Error ? t.message : String(t || "invalid_tool_input_json")
    };
  }
}
function t0(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    if (!n) return null;
    const o = Hp(t.function.arguments || "{}");
    return {
      type: "tool_use",
      id: String(t.id || n),
      name: n,
      input: o.input,
      ...o.ok ? {} : {
        invalidInputJson: o.raw,
        inputParseError: o.error
      }
    };
  }).filter(Boolean);
}
function n0(e = []) {
  const t = Array.isArray(e) ? kt(e) : null;
  return Array.isArray(t) && t.length ? t : null;
}
function o0(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((r) => {
    if (!r || typeof r != "object") return;
    const i = kt(r) || {}, a = n0(i?.providerPayload?.anthropicContent), u = t0(i.tool_calls);
    delete i.providerPayload, i.role === "assistant" && a && u.length ? (delete i.tool_calls, i.content = a.filter((c) => c?.type !== "tool_use").concat(u)) : i.role === "assistant" && a && (delete i.tool_calls, i.content = a), n.push(i);
  });
  const o = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return o.trim() && !(n[0]?.role === "system" && n[0]?.content === o) && n.unshift({
    role: "system",
    content: o
  }), n;
}
function r0(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    if (!t || typeof t != "object") return null;
    if (t.type === "text") return {
      type: "text",
      text: String(t.text || "")
    };
    if (t.type === "tool_use" && t.name) {
      if (t.inputJson !== void 0) {
        const o = Hp(t.inputJson);
        return {
          type: "tool_use",
          id: String(t.id || t.name),
          name: String(t.name),
          input: o.input,
          ...o.ok ? {} : {
            invalidInputJson: o.raw,
            inputParseError: o.error
          }
        };
      }
      const n = kt(t.input);
      return n !== void 0 ? {
        type: "tool_use",
        id: String(t.id || t.name),
        name: String(t.name),
        input: n
      } : {
        type: "tool_use",
        id: String(t.id || t.name),
        name: String(t.name),
        input: {}
      };
    }
    return t.type === "thinking" ? {
      type: "thinking",
      thinking: String(t.thinking || t.text || ""),
      ...typeof t.signature == "string" ? { signature: t.signature } : {}
    } : t.type === "redacted_thinking" ? {
      type: "redacted_thinking",
      data: String(t.data || "")
    } : kt(t) || null;
  }).filter(Boolean);
}
function i0(e = []) {
  return e.map((t) => !t || typeof t != "object" ? null : t.type === "tool_use" && t.name ? {
    type: "tool_use",
    id: t.id,
    name: t.name,
    input: kt(t.input) || {}
  } : kt(t) || null).filter(Boolean);
}
function s0(e = []) {
  const t = Array.isArray(e) ? e : [], n = t.filter((i) => i?.type === "text").map((i) => i.text || "").join(`
`), o = t.filter((i) => i?.type === "thinking" || i?.type === "redacted_thinking").map((i) => ({
    label: i.type === "thinking" ? "思考块" : "已脱敏思考块",
    text: i.type === "thinking" ? i.thinking || "" : i.data || ""
  })).filter((i) => i.text), r = t.filter((i) => i?.type === "tool_use" && i.name).map((i, a) => ({
    id: i.id || `st-claude-tool-${a + 1}`,
    name: i.name,
    arguments: i.inputJson !== void 0 ? i.inputJson : JSON.stringify(i.input || {})
  }));
  return {
    text: n,
    thoughts: o,
    ...r.length ? {
      toolCalls: r,
      toolCallDraft: !0
    } : {}
  };
}
function Vp(e = [], t = {}) {
  const n = r0(e), o = n.filter((r) => r.type === "tool_use" && r.name).map((r, i) => ({
    id: r.id || `st-claude-tool-${i + 1}`,
    name: r.name,
    arguments: r.invalidInputJson !== void 0 ? r.invalidInputJson : JSON.stringify(r.input || {})
  }));
  return {
    text: n.filter((r) => r.type === "text").map((r) => r.text || "").join(`
`),
    toolCalls: o,
    thoughts: t.includeReasoningOutput === !1 ? [] : n.filter((r) => r.type === "thinking" || r.type === "redacted_thinking").map((r) => ({
      label: r.type === "thinking" ? "思考块" : "已脱敏思考块",
      text: r.type === "thinking" ? r.thinking || "" : r.data || ""
    })).filter((r) => r.text),
    finishReason: t.finishReason || "stop",
    model: t.model || "",
    provider: "sillytavern-claude",
    providerPayload: n.length ? { anthropicContent: i0(n) } : void 0
  };
}
function a0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function l0(e, t, n = {}) {
  const o = [];
  let r = "stop", i = n.model || "";
  const a = (c, d = {}) => {
    const h = Number.isInteger(Number(c)) ? Number(c) : o.length;
    return o[h] ? o[h] = {
      ...o[h],
      ...d
    } : o[h] = { ...d }, o[h];
  }, u = () => {
    const c = s0(o);
    a0(e, {
      text: c.text,
      thoughts: K(t) ? c.thoughts : [],
      ...Array.isArray(c.toolCalls) ? { toolCalls: c.toolCalls } : {},
      ...c.toolCallDraft ? { toolCallDraft: !0 } : {}
    });
  };
  return {
    accept(c = {}) {
      if (c?.message?.model && (i = c.message.model), c.type === "content_block_start") {
        a(c.index, kt(c.content_block) || {}), u();
        return;
      }
      if (c.type === "content_block_delta") {
        const d = a(c.index), h = c.delta || {};
        h.type === "text_delta" ? (d.type = d.type || "text", d.text = `${d.text || ""}${h.text || ""}`) : h.type === "input_json_delta" ? (d.type = d.type || "tool_use", d.inputJson = `${d.inputJson || ""}${h.partial_json || ""}`) : h.type === "thinking_delta" ? (d.type = d.type || "thinking", d.thinking = `${d.thinking || ""}${h.thinking || ""}`) : h.type === "signature_delta" && (d.signature = `${d.signature || ""}${h.signature || ""}`), u();
        return;
      }
      c.type === "message_delta" && (r = c.delta?.stop_reason || r);
    },
    result() {
      return Vp(o, {
        finishReason: r,
        model: i,
        includeReasoningOutput: K(t)
      });
    }
  };
}
var u0 = class {
  constructor(e, t = ya) {
    this.config = e, this.hostClient = Wr(t);
  }
  buildMessages(e) {
    return o0(e);
  }
  resolveToolProtocol(e, t) {
    return QI(this.config, e, t);
  }
  buildPayload(e, t = this.resolveToolProtocol(e), n = Wo(this.config, e, t)) {
    const o = typeof e.onStreamProgress == "function", r = this.buildMessages(e), i = {
      ...e,
      toolChoice: t.toolChoice,
      reasoning: n,
      temperature: ho({
        ...this.config,
        provider: "sillytavern-claude"
      }, n) ? void 0 : e.temperature
    }, a = BI(this.config, i, r, o);
    return n.mode === "on" ? (a.reasoning_effort = n.effort, a.include_reasoning = K(n)) : n.mode === "off" ? (a.reasoning_effort = "auto", a.include_reasoning = !1) : (a.reasoning_effort = "auto", a.include_reasoning = K(n)), a;
  }
  async inspectRequest(e, t = {}) {
    const n = Q("sillytavern-claude", this.config, e.reasoning), o = t.protocol || this.resolveToolProtocol(e, n), r = t.effectiveReasoning || Wo(this.config, e, o, n), i = t.payload || this.buildPayload(e, o, r), a = await this.hostClient.buildHostChatCompletionGenerateRequest(i, typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(a, o, e, r);
  }
  buildRequestInspection(e, t = {}, n = {}, o = Wo(this.config, n, t)) {
    const r = {
      ...Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {},
      ...Object.hasOwn(e?.body || {}, "include_reasoning") ? { include_reasoning: e.body.include_reasoning } : {}
    };
    return {
      provider: "sillytavern-claude",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: Nt(e),
      effectiveConfig: {
        ...e0(n, t),
        ...jI(n, {
          ...t,
          controlFields: r
        }, o)
      },
      ...t.reasoningDisabledForForcedTool ? { notices: [ZI] } : {}
    };
  }
  async chat(e) {
    const t = Q("sillytavern-claude", this.config, e.reasoning), n = typeof e.onStreamProgress == "function", o = this.resolveToolProtocol(e, t), r = Wo(this.config, e, o, t), i = this.buildPayload(e, o, r);
    let a = null;
    const u = (c) => {
      a = this.buildRequestInspection(c, o, e, r);
    };
    try {
      if (n) {
        const d = l0(e, r, this.config);
        return await this.hostClient.streamHostChatCompletion(i, (h) => {
          d.accept(h);
        }, {
          signal: e.signal,
          onRequest: u
        }), {
          ...d.result(),
          requestInspection: a
        };
      }
      const c = await this.hostClient.createHostChatCompletion(i, {
        signal: e.signal,
        onRequest: u
      });
      return {
        ...Vp(Array.isArray(c?.content) ? c.content : [{
          type: "text",
          text: c?.choices?.[0]?.message?.content || ""
        }], {
          finishReason: c?.stop_reason || c?.choices?.[0]?.finish_reason || "stop",
          model: c?.model || this.config.model,
          includeReasoningOutput: K(r)
        }),
        requestInspection: a
      };
    } catch (c) {
      throw a && c && typeof c == "object" && (c.requestInspection = a), c;
    }
  }
};
function va(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function nn(e) {
  if (typeof e == "string") return {
    role: "model",
    parts: e ? [{ text: e }] : []
  };
  if (!e || typeof e != "object") return {
    role: "model",
    parts: []
  };
  const t = va(e) || {};
  return t.role = t.role || "model", t.parts = Array.isArray(t.parts) ? t.parts : [], t;
}
function c0(e) {
  const t = Array.isArray(e?.providerPayload?.googleContents) ? e.providerPayload.googleContents : [];
  if (t.length) return t.map((r) => nn(r)).filter((r) => Array.isArray(r.parts) && r.parts.length);
  const n = e?.providerPayload?.googleContent, o = nn(n);
  return o.parts.length ? [o] : [];
}
function d0(e = {}) {
  const t = String(e?.mimeType || "").trim(), n = String(e?.data || "").trim();
  if (!t || !n) return null;
  const o = `data:${t};base64,${n}`;
  return t.startsWith("image/") ? {
    type: "image_url",
    image_url: { url: o }
  } : t.startsWith("video/") ? {
    type: "video_url",
    video_url: { url: o }
  } : t.startsWith("audio/") ? {
    type: "audio_url",
    audio_url: { url: o }
  } : null;
}
function f0(e = {}, t = 0) {
  const n = nn(e);
  if (!n.parts.length) return null;
  const o = {
    role: n.role === "user" ? "user" : "assistant",
    content: []
  }, r = n.parts.find((a) => !a?.thought && typeof a?.text == "string" && typeof a?.thoughtSignature == "string" && a.thoughtSignature)?.thoughtSignature || "", i = [];
  return n.parts.forEach((a) => {
    if (!a || typeof a != "object") return;
    if (!a.thought && typeof a.text == "string" && a.text) {
      o.content.push({
        type: "text",
        text: a.text
      });
      return;
    }
    if (a.functionCall?.name) {
      i.push({
        id: String(a.functionCall.id || `st-google-tool-${t + 1}-${i.length + 1}`),
        type: "function",
        function: {
          name: String(a.functionCall.name || ""),
          arguments: JSON.stringify(a.functionCall.args || {})
        },
        ...typeof a.thoughtSignature == "string" && a.thoughtSignature ? { signature: a.thoughtSignature } : {}
      });
      return;
    }
    const u = d0(a.inlineData);
    u && o.content.push(u);
  }), i.length && o.content.push({
    type: "tool_calls",
    tool_calls: i
  }), r && o.content.some((a) => a?.type === "text") && (o.signature = r), o.content.length ? o : null;
}
function h0(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((r) => {
    if (!r || typeof r != "object") return;
    const i = c0(r);
    if (r.role === "assistant" && i.length) {
      i.forEach((u, c) => {
        const d = f0(u, c);
        d && n.push(d);
      });
      return;
    }
    const a = va(r) || {};
    delete a.providerPayload, n.push(a);
  });
  const o = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return o.trim() && !(n[0]?.role === "system" && n[0]?.content === o) && n.unshift({
    role: "system",
    content: o
  }), n;
}
function Jp(e = {}) {
  return nn(e?.responseContent || e?.candidates?.[0]?.content || "");
}
function Kp(e = {}) {
  return (e.parts || []).filter((t) => !t?.thought && typeof t?.text == "string" && t.text).map((t) => t.text).join(`
`);
}
function Wp(e = {}) {
  return (e.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function zp(e = {}) {
  return (e.parts || []).map((t) => t?.functionCall || null).filter((t) => t?.name).map((t, n) => ({
    id: t.id || `st-google-tool-${n + 1}`,
    name: t.name,
    arguments: JSON.stringify(t.args || {})
  }));
}
function p0(e, t) {
  const n = String(t || ""), o = String(e || "");
  return n ? !o || n.startsWith(o) ? n : o.endsWith(n) ? o : `${o}${n}` : o;
}
function m0(e = [], t = []) {
  const n = Array.isArray(e) ? [...e] : [];
  return t.forEach((o) => {
    const r = [
      o.id || "",
      o.name || "",
      o.arguments || ""
    ].join("\0");
    n.some((i) => [
      i.id || "",
      i.name || "",
      i.arguments || ""
    ].join("\0") === r) || n.push(o);
  }), n;
}
function Yp(e) {
  const t = nn(e);
  return t.parts.length ? {
    googleContent: t,
    googleContents: [t]
  } : void 0;
}
function g0(e = {}, t = {}) {
  const n = Jp(e), o = e?.choices?.[0]?.message?.content || "";
  return {
    text: Kp(n) || o,
    toolCalls: zp(n),
    thoughts: t.includeReasoningOutput === !1 ? [] : Wp(n),
    finishReason: e?.candidates?.[0]?.finishReason || e?.choices?.[0]?.finish_reason || t.finishReason || "STOP",
    model: e?.model || e?.modelVersion || t.model || "",
    provider: "sillytavern-google",
    providerPayload: Yp(n)
  };
}
function _0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function y0(e, t, n = {}) {
  let o = "", r = [], i = [], a = "STOP", u = n.model || "";
  const c = [];
  return {
    accept(d = {}) {
      u = d.model || d.modelVersion || u, a = d?.candidates?.[0]?.finishReason || a;
      const h = Jp(d);
      h.parts.length && c.push(...va(h.parts) || []), o = p0(o, Kp(h)), r = m0(r, zp(h));
      const f = K(t) ? Wp(h) : [];
      f.length && (i = f), _0(e, {
        text: o,
        thoughts: i,
        ...r.length ? {
          toolCalls: r,
          toolCallDraft: !0
        } : {}
      });
    },
    result() {
      const d = nn({
        role: "model",
        parts: c.length ? c : o ? [{ text: o }] : []
      });
      return {
        text: o,
        toolCalls: r,
        thoughts: i,
        finishReason: a,
        model: u,
        provider: "sillytavern-google",
        providerPayload: Yp(d)
      };
    }
  };
}
var v0 = class {
  constructor(e, t = ya) {
    this.config = e, this.hostClient = Wr(t);
  }
  buildMessages(e) {
    return h0(e);
  }
  buildPayload(e, t = Q("sillytavern-google", this.config, e.reasoning)) {
    const n = t, o = typeof e.onStreamProgress == "function", r = this.buildMessages(e), i = qI(this.config, e, r, o);
    return n.mode === "on" ? (i.reasoning_effort = n.effort, i.include_reasoning = K(n)) : n.mode === "off" ? (i.reasoning_effort = "min", i.include_reasoning = !1) : (i.reasoning_effort = "auto", i.include_reasoning = K(n)), i;
  }
  async inspectRequest(e, t = {}) {
    const n = t.effectiveReasoning || Q("sillytavern-google", this.config, e.reasoning), o = t.payload || this.buildPayload(e, n), r = await this.hostClient.buildHostChatCompletionGenerateRequest(o, typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(r, e, n);
  }
  buildRequestInspection(e, t = {}, n = Q("sillytavern-google", this.config, t.reasoning)) {
    const o = {
      ...Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {},
      ...Object.hasOwn(e?.body || {}, "include_reasoning") ? { include_reasoning: e.body.include_reasoning } : {}
    };
    return {
      provider: "sillytavern-google",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: Nt(e),
      effectiveConfig: mt(t, {
        reasoning: n,
        effort: e?.body?.reasoning_effort,
        controlFields: o
      })
    };
  }
  async chat(e) {
    const t = Q("sillytavern-google", this.config, e.reasoning), n = typeof e.onStreamProgress == "function", o = this.buildPayload(e, t);
    let r = null;
    const i = (a) => {
      r = this.buildRequestInspection(a, e, t);
    };
    try {
      if (n) {
        const a = y0(e, t, this.config);
        return await this.hostClient.streamHostChatCompletion(o, (u) => {
          a.accept(u);
        }, {
          signal: e.signal,
          onRequest: i
        }), {
          ...a.result(),
          requestInspection: r
        };
      }
      return {
        ...g0(await this.hostClient.createHostChatCompletion(o, {
          signal: e.signal,
          onRequest: i
        }), {
          model: this.config.model,
          includeReasoningOutput: K(t)
        }),
        requestInspection: r
      };
    } catch (a) {
      throw r && a && typeof a == "object" && (a.requestInspection = r), a;
    }
  }
};
function A0(e, t, n) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: K(n) ? t.thoughts : [] } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function yi(e, t = []) {
  const n = Rt(e);
  return {
    thinkTagged: n,
    cleanedText: t.length ? n.cleaned : bt(n.cleaned)
  };
}
function T0(e) {
  const t = String(e?.message || e || "");
  return /Cannot read properties of null \(reading ['"]function['"]\)/i.test(t) || /reading ['"]function['"]/i.test(t) || /badresponsestatuscode/i.test(t);
}
var S0 = class {
  constructor(e, t = ya) {
    this.config = e, this.hostClient = Wr(t);
  }
  buildMessages(e) {
    return (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0 ? hs(e, this.config.model) : fs(e, this.config.model);
  }
  buildPayload(e, t = !1, n = Q("sillytavern-openai-compatible", this.config, e.reasoning)) {
    const o = n, r = t ? hs(e, this.config.model) : fs(e, this.config.model), i = {
      ...e,
      temperature: ho({
        ...this.config,
        provider: "sillytavern-openai-compatible"
      }, o) ? void 0 : e.temperature
    };
    return $p(GI(this.config, t ? {
      ...i,
      tools: void 0,
      toolChoice: void 0
    } : i, r, typeof e.onStreamProgress == "function"), o);
  }
  async inspectRequest(e, t = {}) {
    const n = t.effectiveReasoning || Q("sillytavern-openai-compatible", this.config, e.reasoning), o = t.payload || this.buildPayload(e, !!t.taggedMode, n), r = await this.hostClient.buildHostChatCompletionGenerateRequest(o, typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(r, e, n);
  }
  buildRequestInspection(e, t = {}, n = Q("sillytavern-openai-compatible", this.config, t.reasoning)) {
    const o = {
      ...Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {},
      ...Object.hasOwn(e?.body || {}, "thinking") ? { thinking: e.body.thinking } : {}
    };
    return {
      provider: "sillytavern-openai-compatible",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: Nt(e),
      effectiveConfig: mt(t, {
        reasoning: n,
        effort: e?.body?.reasoning_effort,
        controlFields: o
      })
    };
  }
  async streamChat(e, t, n, o = {}) {
    const r = { role: "assistant" };
    let i = "stop", a = this.config.model;
    await this.hostClient.streamHostChatCompletion(t, (p) => {
      a = p?.model || a;
      const m = p?.choices?.[0] || {};
      ps(r, m), m.finish_reason && (i = m.finish_reason);
      const g = Xt(r), { thinkTagged: _, cleanedText: y } = yi(Yt(r), g), E = g.length ? g : cs(_.cleaned);
      A0(e, {
        text: y,
        thoughts: K(n) ? ft(r, m).concat(_.thoughts) : [],
        ...E.length ? { toolCalls: E } : {},
        ...!g.length && E.length ? { toolCallDraft: !0 } : {}
      }, n);
    }, {
      signal: e.signal,
      onRequest: o.onRequest,
      onResponseAccepted: o.onResponseAccepted
    }), Qt(r);
    const u = Xt(r), { thinkTagged: c, cleanedText: d } = yi(Yt(r), u), h = ft(r, {});
    c.thoughts.forEach((p) => h.push(p));
    const f = u.length ? [] : Qn(c.cleaned);
    return {
      text: d,
      toolCalls: [...u, ...f],
      thoughts: K(n) ? h : [],
      finishReason: i,
      model: a,
      provider: "sillytavern-openai-compatible",
      providerPayload: Zn(r)
    };
  }
  async nonStreamingChat(e, t, n, o = {}) {
    const r = await this.hostClient.createHostChatCompletion(t, {
      signal: e.signal,
      onRequest: o.onRequest
    }), i = r.choices?.[0] || {}, a = i.message || {};
    Qt(a);
    const u = ft(a, i), c = la(a.tool_calls || []), { thinkTagged: d, cleanedText: h } = yi(ua(a.content), c);
    d.thoughts.forEach((m) => u.push(m));
    const f = c.length ? [] : Qn(d.cleaned), p = Er(a, i);
    return {
      text: h,
      toolCalls: [...c, ...f],
      thoughts: K(n) ? u : [],
      finishReason: i.finish_reason || "stop",
      model: r.model || this.config.model,
      provider: "sillytavern-openai-compatible",
      providerPayload: Zn(p)
    };
  }
  async chat(e) {
    const t = Q("sillytavern-openai-compatible", this.config, e.reasoning), n = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, o = Array.isArray(e.tools) && e.tools.length > 0, r = async (a, u = {}) => {
      let c = null;
      const d = (h) => {
        c = this.buildRequestInspection(h, e, t);
      };
      try {
        return {
          ...typeof e.onStreamProgress == "function" ? await this.streamChat(e, a, t, {
            onRequest: d,
            onResponseAccepted: u.onResponseAccepted
          }) : await this.nonStreamingChat(e, a, t, { onRequest: d }),
          requestInspection: c
        };
      } catch (h) {
        throw c && h && typeof h == "object" && (h.requestInspection = c), h;
      }
    }, i = this.buildPayload(e, n, t);
    try {
      return await r(i);
    } catch (a) {
      if (e.allowToolProtocolFallback === !1 || n || !o || !T0(a)) throw a;
    }
    return typeof e.onToolProtocolFallback == "function" && e.onToolProtocolFallback({
      provider: "sillytavern-openai-compatible",
      fromToolMode: "native",
      toToolMode: "tagged-json",
      reason: "malformed_native_tool_host_error"
    }), await r(this.buildPayload(e, !0, t));
  }
}, G0 = Object.freeze([{
  value: "default",
  label: "默认权限"
}, {
  value: "full",
  label: "完全权限"
}]), B0 = Object.freeze([{
  value: "deny",
  label: "禁止"
}, {
  value: "allow",
  label: "允许"
}]), q0 = Object.freeze([{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}]), H0 = Object.freeze([
  {
    value: "openai-responses",
    label: "OpenAI Responses"
  },
  {
    value: "openai-compatible",
    label: "OpenAI 兼容"
  },
  {
    value: "sillytavern-openai-compatible",
    label: "酒馆 OpenAI 兼容"
  },
  {
    value: "sillytavern-claude",
    label: "酒馆 Claude"
  },
  {
    value: "sillytavern-google",
    label: "酒馆 Google AI"
  },
  {
    value: "anthropic",
    label: "Anthropic"
  },
  {
    value: "google",
    label: "Google AI"
  }
]);
function E0(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function vi(e, t, n) {
  return Object.hasOwn(n, "hostClient") ? new e(t, Wr(n.hostClient)) : new e(t);
}
function Xp(e = {}, t = {}) {
  if (!e.apiKey && !E0(e.provider)) throw new Error(t.missingApiKeyMessage || "请先填写当前模型配置的 API Key。");
  switch (Pd(e.reasoning || {}), e.provider) {
    case "sillytavern-openai-compatible":
      return vi(S0, e, t);
    case "sillytavern-claude":
      return vi(u0, e, t);
    case "sillytavern-google":
      return vi(v0, e, t);
    case "openai-responses":
      return new TI(e);
    case "anthropic":
      return new Cg(e);
    case "google":
      return new Ew(e);
    default:
      return new uI(e);
  }
}
var w0 = { chat: { exclude: [
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
] } }, C0 = Object.freeze([
  "claude-opus-4-7",
  "claude-opus-4-6",
  "claude-opus-4-5",
  "claude-opus-4-5-20251101",
  "claude-sonnet-4-6",
  "claude-sonnet-4-5",
  "claude-sonnet-4-5-20250929",
  "claude-opus-4-1",
  "claude-opus-4-1-20250805",
  "claude-opus-4-0",
  "claude-opus-4-20250514",
  "claude-sonnet-4-0",
  "claude-sonnet-4-20250514"
]);
function io(e = []) {
  const t = [...new Set(e.filter(Boolean).map((r) => String(r).trim()).filter(Boolean))], n = w0.chat, o = t.filter((r) => {
    const i = r.toLowerCase();
    return !n.exclude.some((a) => i.includes(a));
  });
  return o.length ? o : t;
}
function on(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function I0(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function R0(e = "") {
  return e === "anthropic" || e === "sillytavern-claude";
}
function b0(e = "") {
  return e === "sillytavern-claude" ? fa : e === "sillytavern-google" ? ha : yt;
}
function so(e = []) {
  return [...new Set(e.filter(Boolean).map((t) => String(t).trim()).filter(Boolean))];
}
function P0(e) {
  const t = on(e);
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
function Qp(e) {
  const t = on(e);
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
function M0(e, t) {
  const n = on(e);
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
function x0(e, t) {
  const n = [
    e?.error?.message,
    e?.message,
    e?.detail,
    e?.details,
    e?.error
  ].find((o) => typeof o == "string" && o.trim());
  return n ? n.trim() : String(t || "").trim().slice(0, 160);
}
async function N0(e, t = {}) {
  const n = await fetch(e, t), o = await n.text();
  let r = null, i = null;
  try {
    r = o ? JSON.parse(o) : {};
  } catch (a) {
    i = a;
  }
  return {
    ok: n.ok,
    status: n.status,
    url: e,
    data: r,
    rawText: o,
    parseError: i,
    errorSnippet: x0(r, o)
  };
}
function k0(e) {
  return io((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function Zp(e) {
  return io((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function D0(e) {
  return io((e?.models || e?.data || []).map((t) => String(t?.id || t?.name || "")).map((t) => t.split("/").pop() || "").filter(Boolean));
}
async function lr({ urls: e, requestOptionsList: t, extractModels: n, providerLabel: o }) {
  let r = null;
  for (const i of e) for (const a of t) {
    const u = await N0(i, a);
    if (!u.ok) {
      r = u;
      continue;
    }
    if (u.parseError) {
      r = {
        ...u,
        errorSnippet: "返回的不是 JSON"
      };
      continue;
    }
    const c = n(u.data);
    if (c.length) return c;
    r = {
      ...u,
      errorSnippet: "返回成功，但模型列表为空"
    };
  }
  if (r) {
    const i = r.url ? ` (${r.url})` : "", a = r.errorSnippet ? `：${r.errorSnippet}` : "";
    throw new Error(`${o} 拉取模型失败：${r.status || "unknown"}${a}${i}`);
  }
  throw new Error(`${o} 拉取模型失败：未获取到模型列表。`);
}
async function $0(e, t = {}) {
  const n = String(e.apiKey || "").trim(), o = on(e.baseUrl || ""), r = on(o || Gp.claude);
  if (n && r) try {
    return await lr({
      urls: Qp(r),
      requestOptionsList: [{
        headers: {
          "x-api-key": n,
          "anthropic-version": "2023-06-01",
          Accept: "application/json"
        },
        signal: t.signal
      }],
      extractModels: Zp,
      providerLabel: "Anthropic"
    });
  } catch (i) {
    if (o) throw i;
  }
  return [...C0];
}
async function L0(e, t = {}) {
  const n = e.provider, o = on(e.baseUrl || ""), r = String(e.apiKey || "").trim();
  if (n === "sillytavern-claude") return io(await $0(e, t));
  if (I0(n)) return io(await _a(e, b0(n), { signal: t.signal }));
  if (!r) throw new Error("请先填写 API Key。");
  if (!o) throw new Error("请先填写 Base URL。");
  return n === "google" ? await lr({
    urls: M0(o, r),
    requestOptionsList: [
      {
        headers: {
          Accept: "application/json",
          "x-goog-api-key": r
        },
        signal: t.signal
      },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${r}`
        },
        signal: t.signal
      },
      {
        headers: { Accept: "application/json" },
        signal: t.signal
      }
    ],
    extractModels: D0,
    providerLabel: "Google AI"
  }) : R0(n) ? await lr({
    urls: Qp(o),
    requestOptionsList: [{
      headers: {
        "x-api-key": r,
        "anthropic-version": "2023-06-01",
        Accept: "application/json"
      },
      signal: t.signal
    }],
    extractModels: Zp,
    providerLabel: "Anthropic"
  }) : await lr({
    urls: P0(o),
    requestOptionsList: [{
      headers: {
        Authorization: `Bearer ${r}`,
        Accept: "application/json"
      },
      signal: t.signal
    }],
    extractModels: k0,
    providerLabel: n === "openai-responses" ? "OpenAI Responses" : "OpenAI-Compatible"
  });
}
function V0(e = {}) {
  bI(typeof e.requestHeadersProvider == "function" ? e.requestHeadersProvider : null);
}
function U0(e) {
  const t = Xp(e || {}, { missingApiKeyMessage: "请先在共享 Agent API 配置中填写当前预设的 API Key。" });
  return Object.freeze({
    supportsSessionToolLoop: t.supportsSessionToolLoop === !0,
    async run(n) {
      return await t.chat({
        systemPrompt: String(n.systemPrompt || ""),
        messages: Array.isArray(n.messages) ? n.messages : [],
        tools: Array.isArray(n.tools) ? n.tools : [],
        temperature: n.temperature,
        maxTokens: n.maxTokens,
        reasoning: n.reasoning,
        signal: n.signal,
        onStreamProgress: n.onStreamProgress,
        toolResponses: n.toolResponses,
        finalAnswerReminderText: n.finalAnswerReminderText
      });
    }
  });
}
async function J0(e) {
  return await U0(e.providerConfig).run(e);
}
async function K0(e, t = {}) {
  return await L0(e, { signal: t.signal });
}
async function W0(e, t = {}) {
  const n = globalThis.performance?.now?.() ?? Date.now(), o = await Xp(e, { missingApiKeyMessage: "请先填写当前预设的 API Key。" }).chat({
    systemPrompt: "这是一次由用户主动发起的连接测试。只回复 OK。",
    messages: [{
      role: "user",
      content: "OK"
    }],
    tools: [],
    temperature: void 0,
    maxTokens: 16,
    reasoning: e.reasoning,
    signal: t.signal
  }), r = globalThis.performance?.now?.() ?? Date.now();
  return {
    provider: String(o.provider || e.provider || ""),
    model: String(o.model || e.model || ""),
    latencyMs: Math.max(0, Math.round(r - n))
  };
}
export {
  V0 as configureXiaobaiOsAgent,
  U0 as openXiaobaiOsAgentSession,
  K0 as pullXiaobaiOsAgentModels,
  J0 as runXiaobaiOsAgent,
  W0 as testXiaobaiOsAgentConnection
};
