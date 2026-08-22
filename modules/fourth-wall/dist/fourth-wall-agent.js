var wg = Object.create, Gd = Object.defineProperty, Ig = Object.getOwnPropertyDescriptor, bg = Object.getOwnPropertyNames, Pg = Object.getPrototypeOf, Rg = Object.prototype.hasOwnProperty, gi = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), xg = (e, t, n, r) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var o = bg(t), i = 0, s = o.length, u; i < s; i++)
      u = o[i], !Rg.call(e, u) && u !== n && Gd(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(r = Ig(t, u)) || r.enumerable
      });
  return e;
}, Mg = (e, t, n) => (n = e != null ? wg(Pg(e)) : {}, xg(t || !e || !e.__esModule ? Gd(n, "default", {
  value: e,
  enumerable: !0
}) : n, e)), Ng = "https://api.tavily.com";
function ds(e = "") {
  return String(e || "").trim();
}
function Qe(e = "") {
  return String(e || "").trim().replace(/\/+$/, "") || "https://api.tavily.com";
}
var mP = Object.freeze([
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
function kg(e = "") {
  return e === "on" || e === "off" ? e : "inherit";
}
function Dg(e) {
  return String(e ?? "").trim().toLowerCase() || void 0;
}
function $g(e) {
  if (e == null || e === "") return;
  const t = Number(e);
  return Number.isFinite(t) ? Math.floor(t) : void 0;
}
function on(e = {}) {
  const t = e && typeof e == "object" ? e : {}, n = Dg(t.effort), r = $g(t.budgetTokens);
  return {
    mode: kg(t.mode),
    ...n ? { effort: n } : {},
    ...r !== void 0 ? { budgetTokens: r } : {}
  };
}
function Z(e = {}) {
  return e?.mode !== "off" && e?.output === "show";
}
var Hd = "openai-compatible", yi = "默认", Vd = "default", Lg = "deny", Tt = 32e3;
var Ug = Object.freeze([{
  value: "default",
  label: "默认权限"
}, {
  value: "full",
  label: "完全权限"
}]), Fg = Object.freeze([{
  value: "deny",
  label: "禁止"
}, {
  value: "allow",
  label: "允许"
}]), fs = {
  "openai-responses": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: Tt,
    sendTemperature: !0
  },
  "openai-compatible": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: Tt,
    sendTemperature: !0,
    toolMode: "native"
  },
  "sillytavern-openai-compatible": {
    baseUrl: "",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: Tt,
    sendTemperature: !0,
    toolMode: "native"
  },
  "sillytavern-claude": {
    baseUrl: "",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 1,
    maxTokens: Tt,
    sendTemperature: !0
  },
  "sillytavern-google": {
    baseUrl: "",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: Tt,
    sendTemperature: !0
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 1,
    maxTokens: Tt,
    sendTemperature: !0
  },
  google: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: Tt,
    sendTemperature: !0
  }
};
function wn() {
  return JSON.parse(JSON.stringify(fs));
}
function Me() {
  return {
    provider: Hd,
    modelConfigs: wn(),
    permissionMode: Vd
  };
}
function Jd(e = Me()) {
  const t = e && typeof e == "object" ? e : Me();
  return {
    provider: ca(t.provider),
    modelConfigs: Je(t.modelConfigs || {})
  };
}
function In(e) {
  return e === "full" ? "full" : Vd;
}
function St(e) {
  return e === "allow" ? "allow" : Lg;
}
function ce(e, t = Tt) {
  const n = Number(e);
  if (!Number.isFinite(n) || n <= 0) {
    const r = Number(t);
    return Number.isFinite(r) && r > 0 ? Math.floor(r) : Tt;
  }
  return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n));
}
function oe(e) {
  return String(e || "").trim() || "默认";
}
function Je(e = {}) {
  const t = wn();
  return Object.keys(fs).forEach((n) => {
    const r = e && typeof e[n] == "object" ? e[n] : {}, o = fs[n];
    t[n] = {
      baseUrl: String(r.baseUrl ?? o.baseUrl ?? ""),
      model: String(r.model ?? o.model ?? ""),
      apiKey: String(r.apiKey ?? o.apiKey ?? ""),
      temperature: r.temperature ?? o.temperature,
      maxTokens: ce(r.maxTokens, o.maxTokens),
      sendTemperature: typeof r.sendTemperature == "boolean" ? r.sendTemperature : o.sendTemperature,
      ..."toolMode" in o ? { toolMode: String(r.toolMode || o.toolMode || "native") } : {},
      reasoning: on(r.reasoning)
    };
  }), t;
}
function ca(e) {
  return typeof e == "string" && e.trim() ? e : Hd;
}
function da(e = {}, t) {
  return e && typeof e.presets == "object" && e.presets ? e.presets : e?.modelConfigs ? { [t]: {
    provider: e.provider || "openai-compatible",
    modelConfigs: e.modelConfigs,
    permissionMode: e.permissionMode
  } } : {};
}
function Kd(e = {}, t) {
  const n = {}, r = da(e, t);
  return Object.entries(r).forEach(([o, i]) => {
    if (!i || typeof i != "object") return;
    const s = oe(o);
    n[s] = {
      provider: ca(i.provider),
      modelConfigs: Je(i.modelConfigs || {}),
      permissionMode: In(i.permissionMode)
    };
  }), Object.keys(n).length || (n[yi] = Me()), n;
}
function Wd(e, t) {
  const n = oe(t);
  return e[n] ? n : Object.keys(e)[0];
}
function zd(e, t, n) {
  const r = oe(t || n);
  return e[r] ? r : e[n] ? n : Object.keys(e)[0];
}
function fa(e = {}, t = Me()) {
  const n = Jd(t), r = e && typeof e == "object" ? e : {};
  return {
    provider: ca(r.provider || n.provider),
    modelConfigs: Je(r.modelConfigs || n.modelConfigs)
  };
}
function Yd(e = {}, t = {}, n = yi, r = n) {
  if (e?.delegateConfigured === !1) return !1;
  if (r !== n) return !0;
  const o = e?.delegateConfig;
  if (!o || typeof o != "object" || Array.isArray(o) || !(typeof o.provider == "string" && o.provider.trim() || o.modelConfigs && typeof o.modelConfigs == "object" && Object.keys(o.modelConfigs).length)) return !1;
  if (e?.delegateConfigured === !0) return !0;
  const i = t[n] || Me(), s = Jd(i), u = fa(o, i);
  return JSON.stringify(u) !== JSON.stringify(s);
}
function Og(e = {}, t, n, r, o) {
  const i = o(e?.[r]);
  if (i) return i;
  const s = da(e, t), u = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(s || {})
  ].map(oe), c = /* @__PURE__ */ new Set();
  for (const d of u) {
    if (c.has(d)) continue;
    c.add(d);
    const f = o(s?.[d]?.[r]);
    if (f) return f;
  }
  return o(e?.delegateConfig?.[r]);
}
function qg(e = {}, t, n) {
  const r = (u) => String(u || "").trim();
  if (r(e?.tavilyBaseUrl)) return Qe(e.tavilyBaseUrl);
  const o = da(e, t), i = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(o || {})
  ].map(oe), s = /* @__PURE__ */ new Set();
  for (const u of i) {
    if (s.has(u)) continue;
    s.add(u);
    const c = o?.[u]?.tavilyBaseUrl;
    if (r(c)) return Qe(c);
  }
  return r(e?.delegateConfig?.tavilyBaseUrl) ? Qe(e.delegateConfig.tavilyBaseUrl) : Ng;
}
function Xd(e = {}, t, n) {
  return {
    tavilyApiKey: Og(e, t, n, "tavilyApiKey", ds),
    tavilyBaseUrl: qg(e, t, n)
  };
}
function Bg(e = {}, t = {}) {
  const { defaultWorkspaceFileName: n = "", normalizeWorkspaceName: r = (p) => String(p || "") } = t, o = oe(e.currentPresetName || e.presetName || "默认"), i = Kd(e, o), s = Wd(i, e.currentPresetName), u = zd(i, e.delegatePresetName, s), c = i[u] || i[s] || Me(), d = fa(e.delegateConfig, c), f = Yd(e, i, s, u), h = Xd(e, o, s);
  return {
    enabled: !!e.enabled,
    workspaceFileName: r(e.workspaceFileName || n),
    jsApiPermission: St(e.jsApiPermission),
    currentPresetName: s,
    delegatePresetName: u,
    delegateConfig: d,
    delegateConfigured: f,
    presets: i,
    tavilyApiKey: h.tavilyApiKey,
    tavilyBaseUrl: h.tavilyBaseUrl,
    updatedAt: Number(e.updatedAt) || 0,
    configVersion: 1
  };
}
function hs(e = {}) {
  const t = oe(e.currentPresetName || e.presetDraftName || "默认"), n = Kd(e, t), r = Wd(n, e.currentPresetName), o = zd(n, e.delegatePresetName, r), i = n[r] || Me(), s = n[o] || i, u = fa(e.delegateConfig, s), c = Yd(e, n, r, o), d = Xd(e, t, r);
  return {
    workspaceFileName: String(e.workspaceFileName || ""),
    updatedAt: Number(e.updatedAt) || 0,
    jsApiPermission: St(e.jsApiPermission),
    currentPresetName: r,
    delegatePresetName: o,
    delegateConfig: u,
    delegateConfigured: c,
    presetDraftName: oe(e.presetDraftName || r),
    presetNames: Object.keys(n),
    presets: n,
    provider: i.provider,
    modelConfigs: i.modelConfigs,
    permissionMode: In(i.permissionMode),
    tavilyApiKey: d.tavilyApiKey,
    tavilyBaseUrl: d.tavilyBaseUrl
  };
}
function F(e, t, n, r, o) {
  if (r === "m") throw new TypeError("Private method is not writable");
  if (r === "a" && !o) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !o : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return r === "a" ? o.call(e, n) : o ? o.value = n : t.set(e, n), n;
}
function E(e, t, n, r) {
  if (n === "a" && !r) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? r : n === "a" ? r.call(e) : r ? r.value : t.get(e);
}
var Qd = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Qd = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
};
function Ur(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var ps = (e) => {
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
}, Ke = class ms extends J {
  constructor(t, n, r, o, i) {
    super(`${ms.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.requestID = o?.get("request-id"), this.error = n, this.type = i ?? null;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new _i({
      message: r,
      cause: ps(n)
    });
    const i = n, s = i?.error?.type;
    return t === 400 ? new jd(t, i, r, o, s) : t === 401 ? new ef(t, i, r, o, s) : t === 403 ? new tf(t, i, r, o, s) : t === 404 ? new nf(t, i, r, o, s) : t === 409 ? new rf(t, i, r, o, s) : t === 422 ? new of(t, i, r, o, s) : t === 429 ? new sf(t, i, r, o, s) : t >= 500 ? new af(t, i, r, o, s) : new ms(t, i, r, o, s);
  }
}, st = class extends Ke {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, _i = class extends Ke {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Zd = class extends _i {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, jd = class extends Ke {
}, ef = class extends Ke {
}, tf = class extends Ke {
}, nf = class extends Ke {
}, rf = class extends Ke {
}, of = class extends Ke {
}, sf = class extends Ke {
}, af = class extends Ke {
}, Gg = /^[a-z][a-z0-9+.-]*:/i, Hg = (e) => Gg.test(e), gs = (e) => (gs = Array.isArray, gs(e)), Pl = gs;
function ys(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function Rl(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Vg(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var Jg = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new J(`${e} must be an integer`);
  if (t < 0) throw new J(`${e} must be a positive integer`);
  return t;
}, lf = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Kg = (e) => new Promise((t) => setTimeout(t, e)), An = "0.91.1", Wg = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function zg() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var Yg = () => {
  const e = zg();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": An,
    "X-Stainless-OS": Ml(Deno.build.os),
    "X-Stainless-Arch": xl(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": An,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": An,
    "X-Stainless-OS": Ml(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": xl(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = Xg();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": An,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": An,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function Xg() {
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
var xl = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Ml = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), Nl, Qg = () => Nl ?? (Nl = Yg());
function Zg() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function uf(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function cf(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return uf({
    start() {
    },
    async pull(n) {
      const { done: r, value: o } = await t.next();
      r ? n.close() : n.enqueue(o);
    },
    async cancel() {
      await t.return?.();
    }
  });
}
function ha(e) {
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
async function jg(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var ey = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function ty(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new J(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function ny(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var kl;
function pa(e) {
  let t;
  return (kl ?? (t = new globalThis.TextEncoder(), kl = t.encode.bind(t)))(e);
}
var Dl;
function $l(e) {
  let t;
  return (Dl ?? (t = new globalThis.TextDecoder(), Dl = t.decode.bind(t)))(e);
}
var Oe, qe, Jr = class {
  constructor() {
    Oe.set(this, void 0), qe.set(this, void 0), F(this, Oe, new Uint8Array(), "f"), F(this, qe, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? pa(e) : e;
    F(this, Oe, ny([E(this, Oe, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = ry(E(this, Oe, "f"), E(this, qe, "f"))) != null; ) {
      if (r.carriage && E(this, qe, "f") == null) {
        F(this, qe, r.index, "f");
        continue;
      }
      if (E(this, qe, "f") != null && (r.index !== E(this, qe, "f") + 1 || r.carriage)) {
        n.push($l(E(this, Oe, "f").subarray(0, E(this, qe, "f") - 1))), F(this, Oe, E(this, Oe, "f").subarray(E(this, qe, "f")), "f"), F(this, qe, null, "f");
        continue;
      }
      const o = E(this, qe, "f") !== null ? r.preceding - 1 : r.preceding, i = $l(E(this, Oe, "f").subarray(0, o));
      n.push(i), F(this, Oe, E(this, Oe, "f").subarray(r.index), "f"), F(this, qe, null, "f");
    }
    return n;
  }
  flush() {
    return E(this, Oe, "f").length ? this.decode(`
`) : [];
  }
};
Oe = /* @__PURE__ */ new WeakMap(), qe = /* @__PURE__ */ new WeakMap();
Jr.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Jr.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function ry(e, t) {
  for (let o = t ?? 0; o < e.length; o++) {
    if (e[o] === 10) return {
      preceding: o,
      index: o + 1,
      carriage: !1
    };
    if (e[o] === 13) return {
      preceding: o,
      index: o + 1,
      carriage: !0
    };
  }
  return null;
}
function oy(e) {
  for (let r = 0; r < e.length - 1; r++) {
    if (e[r] === 10 && e[r + 1] === 10 || e[r] === 13 && e[r + 1] === 13) return r + 2;
    if (e[r] === 13 && e[r + 1] === 10 && r + 3 < e.length && e[r + 2] === 13 && e[r + 3] === 10) return r + 4;
  }
  return -1;
}
var Zo = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Ll = (e, t, n) => {
  if (e) {
    if (Vg(Zo, e)) return e;
    Re(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Zo))}`);
  }
};
function pr() {
}
function so(e, t, n) {
  return !t || Zo[e] > Zo[n] ? pr : t[e].bind(t);
}
var iy = {
  error: pr,
  warn: pr,
  info: pr,
  debug: pr
}, Ul = /* @__PURE__ */ new WeakMap();
function Re(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return iy;
  const r = Ul.get(t);
  if (r && r[0] === n) return r[1];
  const o = {
    error: so("error", t, n),
    warn: so("warn", t, n),
    info: so("info", t, n),
    debug: so("debug", t, n)
  };
  return Ul.set(t, [n, o]), o;
}
var Wt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), zn, Fr = class mr {
  constructor(t, n, r) {
    this.iterator = t, zn.set(this, void 0), this.controller = n, F(this, zn, r, "f");
  }
  static fromSSEResponse(t, n, r) {
    let o = !1;
    const i = r ? Re(r) : console;
    async function* s() {
      if (o) throw new J("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let u = !1;
      try {
        for await (const c of sy(t, n)) {
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
            const d = lf(c.data) ?? c.data, f = d?.error?.type;
            throw new Ke(void 0, d, void 0, t.headers, f);
          }
        }
        u = !0;
      } catch (c) {
        if (Ur(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new mr(s, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    async function* i() {
      const u = new Jr(), c = ha(t);
      for await (const d of c) for (const f of u.decode(d)) yield f;
      for (const d of u.flush()) yield d;
    }
    async function* s() {
      if (o) throw new J("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let u = !1;
      try {
        for await (const c of i())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (Ur(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new mr(s, n, r);
  }
  [(zn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], r = this.iterator(), o = (i) => ({ next: () => {
      if (i.length === 0) {
        const s = r.next();
        t.push(s), n.push(s);
      }
      return i.shift();
    } });
    return [new mr(() => o(t), this.controller, E(this, zn, "f")), new mr(() => o(n), this.controller, E(this, zn, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return uf({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: i } = await n.next();
          if (i) return r.close();
          const s = pa(JSON.stringify(o) + `
`);
          r.enqueue(s);
        } catch (o) {
          r.error(o);
        }
      },
      async cancel() {
        await n.return?.();
      }
    });
  }
};
async function* sy(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new J("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new J("Attempted to iterate over a response with no body");
  const n = new ly(), r = new Jr(), o = ha(e.body);
  for await (const i of ay(o)) for (const s of r.decode(i)) {
    const u = n.decode(s);
    u && (yield u);
  }
  for (const i of r.flush()) {
    const s = n.decode(i);
    s && (yield s);
  }
}
async function* ay(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? pa(n) : n;
    let o = new Uint8Array(t.length + r.length);
    o.set(t), o.set(r, t.length), t = o;
    let i;
    for (; (i = oy(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var ly = class {
  constructor() {
    this.event = null, this.data = [], this.chunks = [];
  }
  decode(e) {
    if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
      if (!this.event && !this.data.length) return null;
      const o = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      return this.event = null, this.data = [], this.chunks = [], o;
    }
    if (this.chunks.push(e), e.startsWith(":")) return null;
    let [t, n, r] = uy(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function uy(e, t) {
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
async function df(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: i } = t, s = await (async () => {
    if (t.options.stream)
      return Re(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : Fr.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : ff(await n.json(), n) : await n.text();
  })();
  return Re(e).debug(`[${r}] response parsed`, Wt({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: s,
    durationMs: Date.now() - i
  })), s;
}
function ff(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("request-id"),
    enumerable: !1
  });
}
var gr, hf = class pf extends Promise {
  constructor(t, n, r = df) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, gr.set(this, void 0), F(this, gr, t, "f");
  }
  _thenUnwrap(t) {
    return new pf(E(this, gr, "f"), this.responsePromise, async (n, r) => ff(t(await this.parseResponse(n, r), r), r.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(E(this, gr, "f"), t))), this.parsedPromise;
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
gr = /* @__PURE__ */ new WeakMap();
var ao, mf = class {
  constructor(e, t, n, r) {
    ao.set(this, void 0), F(this, ao, e, "f"), this.options = r, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new J("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await E(this, ao, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(ao = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, cy = class extends hf {
  constructor(e, t, n) {
    super(e, t, async (r, o) => new n(r, o.response, await df(r, o), o.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, Kr = class extends mf {
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
          ...ys(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...ys(this.options.query),
        after_id: e
      }
    } : null;
  }
}, Le = class extends mf {
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
        ...ys(this.options.query),
        page: e
      }
    } : null;
  }
}, gf = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Dn(e, t, n) {
  return gf(), new File(e, t ?? "unknown_file", n);
}
function Uo(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var yf = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", ma = async (e, t, n = !0) => ({
  ...e,
  body: await fy(e.body, t, n)
}), Fl = /* @__PURE__ */ new WeakMap();
function dy(e) {
  const t = typeof e == "function" ? e : e.fetch, n = Fl.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const o = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new o(i).text();
    } catch {
      return !0;
    }
  })();
  return Fl.set(t, r), r;
}
var fy = async (e, t, n = !0) => {
  if (!await dy(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const r = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([o, i]) => _s(r, o, i, n))), r;
}, hy = (e) => e instanceof Blob && "name" in e, _s = async (e, t, n, r) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let o = {};
      const i = n.headers.get("Content-Type");
      i && (o = { type: i }), e.append(t, Dn([await n.blob()], Uo(n, r), o));
    } else if (yf(n)) e.append(t, Dn([await new Response(cf(n)).blob()], Uo(n, r)));
    else if (hy(n)) e.append(t, Dn([n], Uo(n, r), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((o) => _s(e, t + "[]", o, r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([o, i]) => _s(e, `${t}[${o}]`, i, r)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, _f = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", py = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && _f(e), my = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function gy(e, t, n) {
  if (gf(), e = await e, t || (t = Uo(e, !0)), py(e))
    return e instanceof File && t == null && n == null ? e : Dn([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if (my(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Dn(await vs(o), t, n);
  }
  const r = await vs(e);
  if (!n?.type) {
    const o = r.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof o == "string" && (n = {
      ...n,
      type: o
    });
  }
  return Dn(r, t, n);
}
async function vs(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (_f(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (yf(e)) for await (const n of e) t.push(...await vs(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${yy(e)}`);
  }
  return t;
}
function yy(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var ne = class {
  constructor(e) {
    this._client = e;
  }
}, vf = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* _y(e) {
  if (!e) return;
  if (vf in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const i of o) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Pl(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const i = Pl(r[1]) ? r[1] : [r[1]];
    let s = !1;
    for (const u of i)
      u !== void 0 && (t && !s && (s = !0, yield [o, null]), yield [o, u]);
  }
}
var N = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [i, s] of _y(r)) {
      const u = i.toLowerCase();
      o.has(u) || (t.delete(i), o.add(u)), s === null ? (t.delete(i), n.add(u)) : (t.append(i, s), n.delete(u));
    }
  }
  return {
    [vf]: !0,
    values: t,
    nulls: n
  };
};
function Af(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Ol = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), vy = (e = Af) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const i = [], s = n.reduce((f, h, p) => {
    /[?#]/.test(h) && (o = !0);
    const m = r[p];
    let g = (o ? encodeURIComponent : e)("" + m);
    return p !== r.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? Ol) ?? Ol)?.toString) && (g = m + "", i.push({
      start: f.length + h.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), f + h + (p === r.length ? "" : g);
  }, ""), u = s.split(/[?#]/, 1)[0], c = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) i.push({
    start: d.index,
    length: d[0].length,
    error: `Value "${d[0]}" can't be safely passed as a path parameter`
  });
  if (i.sort((f, h) => f.start - h.start), i.length > 0) {
    let f = 0;
    const h = i.reduce((p, m) => {
      const g = " ".repeat(m.start - f), _ = "^".repeat(m.length);
      return f = m.start + m.length, p + g + _;
    }, "");
    throw new J(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${s}
${h}`);
  }
  return s;
}, q = /* @__PURE__ */ vy(Af), Tf = class extends ne {
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/environments?beta=true", {
      body: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/environments/${e}?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/environments?beta=true", Le, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(q`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(q`/v1/environments/${e}/archive?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Mr = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function Fo(e) {
  return typeof e == "object" && e !== null && Mr in e;
}
function Sf(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const r of e) Fo(r) && n.add(r[Mr]);
  if (t) {
    for (const r of t)
      if (Fo(r) && n.add(r[Mr]), Array.isArray(r.content))
        for (const o of r.content) Fo(o) && n.add(o[Mr]);
  }
  return Array.from(n);
}
function Ef(e, t) {
  const n = Sf(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function Ay(e) {
  return Fo(e) ? { "x-stainless-helper": e[Mr] } : {};
}
var Cf = class extends ne {
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/files?beta=true", Kr, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(q`/v1/files/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  download(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/files/${e}/content?beta=true`, {
      ...n,
      headers: N([{
        "anthropic-beta": [...r ?? [], "files-api-2025-04-14"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      __binaryResponse: !0
    });
  }
  retrieveMetadata(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/files/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  upload(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/files?beta=true", ma({
      body: r,
      ...t,
      headers: N([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        Ay(r.file),
        t?.headers
      ])
    }, this._client));
  }
}, wf = class extends ne {
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/models/${e}?beta=true`, {
      ...n,
      headers: N([{ ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", Kr, {
      query: r,
      ...t,
      headers: N([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, If = class extends ne {
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/user_profiles?beta=true", {
      body: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "user-profiles-2026-03-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/user_profiles/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/user_profiles/${e}?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/user_profiles?beta=true", Le, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "user-profiles-2026-03-24"].toString() }, t?.headers])
    });
  }
  createEnrollmentURL(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(q`/v1/user_profiles/${e}/enrollment_url?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
}, bf = class extends ne {
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/agents/${e}/versions?beta=true`, Le, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, ga = class extends ne {
  constructor() {
    super(...arguments), this.versions = new bf(this._client);
  }
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/agents?beta=true", {
      body: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.get(q`/v1/agents/${e}?beta=true`, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/agents/${e}?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/agents?beta=true", Le, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(q`/v1/agents/${e}/archive?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
ga.Versions = bf;
var Pf = class extends ne {
  create(e, t, n) {
    const { view: r, betas: o, ...i } = t;
    return this._client.post(q`/v1/memory_stores/${e}/memories?beta=true`, {
      query: { view: r },
      body: i,
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { memory_store_id: r, betas: o, ...i } = t;
    return this._client.get(q`/v1/memory_stores/${r}/memories/${e}?beta=true`, {
      query: i,
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { memory_store_id: r, view: o, betas: i, ...s } = t;
    return this._client.post(q`/v1/memory_stores/${r}/memories/${e}?beta=true`, {
      query: { view: o },
      body: s,
      ...n,
      headers: N([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/memory_stores/${e}/memories?beta=true`, Le, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { memory_store_id: r, expected_content_sha256: o, betas: i } = t;
    return this._client.delete(q`/v1/memory_stores/${r}/memories/${e}?beta=true`, {
      query: { expected_content_sha256: o },
      ...n,
      headers: N([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Rf = class extends ne {
  retrieve(e, t, n) {
    const { memory_store_id: r, betas: o, ...i } = t;
    return this._client.get(q`/v1/memory_stores/${r}/memory_versions/${e}?beta=true`, {
      query: i,
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/memory_stores/${e}/memory_versions?beta=true`, Le, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  redact(e, t, n) {
    const { memory_store_id: r, betas: o } = t;
    return this._client.post(q`/v1/memory_stores/${r}/memory_versions/${e}/redact?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, vi = class extends ne {
  constructor() {
    super(...arguments), this.memories = new Pf(this._client), this.memoryVersions = new Rf(this._client);
  }
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/memory_stores?beta=true", {
      body: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/memory_stores/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/memory_stores/${e}?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/memory_stores?beta=true", Le, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(q`/v1/memory_stores/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(q`/v1/memory_stores/${e}/archive?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
vi.Memories = Pf;
vi.MemoryVersions = Rf;
var xf = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};
function Mf(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function ql(e, t, n) {
  const r = Mf(t);
  return !t || !("parse" in (r ?? {})) ? {
    ...e,
    content: e.content.map((o) => {
      if (o.type === "text") {
        const i = Object.defineProperty({ ...o }, "parsed_output", {
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
      return o;
    }),
    parsed_output: null
  } : Nf(e, t, n);
}
function Nf(e, t, n) {
  let r = null;
  const o = e.content.map((i) => {
    if (i.type === "text") {
      const s = Ty(t, i.text);
      r === null && (r = s);
      const u = Object.defineProperty({ ...i }, "parsed_output", {
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
    return i;
  });
  return {
    ...e,
    content: o,
    parsed_output: r
  };
}
function Ty(e, t) {
  const n = Mf(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new J(`Failed to parse structured output: ${r}`);
  }
}
var Sy = (e) => {
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
    let o = /[0-9]/;
    if (r && o.test(r) || r === "-" || r === ".") {
      let s = "";
      for (r === "-" && (s += r, r = e[++t]); r && o.test(r) || r === "."; )
        s += r, r = e[++t];
      n.push({
        type: "number",
        value: s
      });
      continue;
    }
    let i = /[a-z]/i;
    if (r && i.test(r)) {
      let s = "";
      for (; r && i.test(r) && t !== e.length; )
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
}, Tn = (e) => {
  if (e.length === 0) return e;
  let t = e[e.length - 1];
  switch (t.type) {
    case "separator":
      return e = e.slice(0, e.length - 1), Tn(e);
    case "number":
      let n = t.value[t.value.length - 1];
      if (n === "." || n === "-")
        return e = e.slice(0, e.length - 1), Tn(e);
    case "string":
      let r = e[e.length - 2];
      if (r?.type === "delimiter")
        return e = e.slice(0, e.length - 1), Tn(e);
      if (r?.type === "brace" && r.value === "{")
        return e = e.slice(0, e.length - 1), Tn(e);
      break;
    case "delimiter":
      return e = e.slice(0, e.length - 1), Tn(e);
  }
  return e;
}, Ey = (e) => {
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
}, Cy = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, kf = (e) => JSON.parse(Cy(Ey(Tn(Sy(e))))), Ye, xt, pn, Yn, lo, Xn, Qn, uo, Zn, gt, jn, co, fo, Vt, ho, po, er, Bi, Bl, mo, Gi, Hi, Vi, Gl, Hl = "__json_buf";
function Vl(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var wy = class As {
  constructor(t, n) {
    Ye.add(this), this.messages = [], this.receivedMessages = [], xt.set(this, void 0), pn.set(this, null), this.controller = new AbortController(), Yn.set(this, void 0), lo.set(this, () => {
    }), Xn.set(this, () => {
    }), Qn.set(this, void 0), uo.set(this, () => {
    }), Zn.set(this, () => {
    }), gt.set(this, {}), jn.set(this, !1), co.set(this, !1), fo.set(this, !1), Vt.set(this, !1), ho.set(this, void 0), po.set(this, void 0), er.set(this, void 0), mo.set(this, (r) => {
      if (F(this, co, !0, "f"), Ur(r) && (r = new st()), r instanceof st)
        return F(this, fo, !0, "f"), this._emit("abort", r);
      if (r instanceof J) return this._emit("error", r);
      if (r instanceof Error) {
        const o = new J(r.message);
        return o.cause = r, this._emit("error", o);
      }
      return this._emit("error", new J(String(r)));
    }), F(this, Yn, new Promise((r, o) => {
      F(this, lo, r, "f"), F(this, Xn, o, "f");
    }), "f"), F(this, Qn, new Promise((r, o) => {
      F(this, uo, r, "f"), F(this, Zn, o, "f");
    }), "f"), E(this, Yn, "f").catch(() => {
    }), E(this, Qn, "f").catch(() => {
    }), F(this, pn, t, "f"), F(this, er, n?.logger ?? console, "f");
  }
  get response() {
    return E(this, ho, "f");
  }
  get request_id() {
    return E(this, po, "f");
  }
  async withResponse() {
    F(this, Vt, !0, "f");
    const t = await E(this, Yn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new As(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, r, { logger: o } = {}) {
    const i = new As(n, { logger: o });
    for (const s of n.messages) i._addMessageParam(s);
    return F(i, pn, {
      ...n,
      stream: !0
    }, "f"), i._run(() => i._createMessage(t, {
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
  _run(t) {
    t().then(() => {
      this._emitFinal(), this._emit("end");
    }, E(this, mo, "f"));
  }
  _addMessageParam(t) {
    this.messages.push(t);
  }
  _addMessage(t, n = !0) {
    this.receivedMessages.push(t), n && this._emit("message", t);
  }
  async _createMessage(t, n, r) {
    const o = r?.signal;
    let i;
    o && (o.aborted && this.controller.abort(), i = this.controller.abort.bind(this.controller), o.addEventListener("abort", i));
    try {
      E(this, Ye, "m", Gi).call(this);
      const { response: s, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(s);
      for await (const c of u) E(this, Ye, "m", Hi).call(this, c);
      if (u.controller.signal?.aborted) throw new st();
      E(this, Ye, "m", Vi).call(this);
    } finally {
      o && i && o.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (F(this, ho, t, "f"), F(this, po, t?.headers.get("request-id"), "f"), E(this, lo, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return E(this, jn, "f");
  }
  get errored() {
    return E(this, co, "f");
  }
  get aborted() {
    return E(this, fo, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (E(this, gt, "f")[t] || (E(this, gt, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const r = E(this, gt, "f")[t];
    if (!r) return this;
    const o = r.findIndex((i) => i.listener === n);
    return o >= 0 && r.splice(o, 1), this;
  }
  once(t, n) {
    return (E(this, gt, "f")[t] || (E(this, gt, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, r) => {
      F(this, Vt, !0, "f"), t !== "error" && this.once("error", r), this.once(t, n);
    });
  }
  async done() {
    F(this, Vt, !0, "f"), await E(this, Qn, "f");
  }
  get currentMessage() {
    return E(this, xt, "f");
  }
  async finalMessage() {
    return await this.done(), E(this, Ye, "m", Bi).call(this);
  }
  async finalText() {
    return await this.done(), E(this, Ye, "m", Bl).call(this);
  }
  _emit(t, ...n) {
    if (E(this, jn, "f")) return;
    t === "end" && (F(this, jn, !0, "f"), E(this, uo, "f").call(this));
    const r = E(this, gt, "f")[t];
    if (r && (E(this, gt, "f")[t] = r.filter((o) => !o.once), r.forEach(({ listener: o }) => o(...n))), t === "abort") {
      const o = n[0];
      !E(this, Vt, "f") && !r?.length && Promise.reject(o), E(this, Xn, "f").call(this, o), E(this, Zn, "f").call(this, o), this._emit("end");
      return;
    }
    if (t === "error") {
      const o = n[0];
      !E(this, Vt, "f") && !r?.length && Promise.reject(o), E(this, Xn, "f").call(this, o), E(this, Zn, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", E(this, Ye, "m", Bi).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let o;
    r && (r.aborted && this.controller.abort(), o = this.controller.abort.bind(this.controller), r.addEventListener("abort", o));
    try {
      E(this, Ye, "m", Gi).call(this), this._connected(null);
      const i = Fr.fromReadableStream(t, this.controller);
      for await (const s of i) E(this, Ye, "m", Hi).call(this, s);
      if (i.controller.signal?.aborted) throw new st();
      E(this, Ye, "m", Vi).call(this);
    } finally {
      r && o && r.removeEventListener("abort", o);
    }
  }
  [(xt = /* @__PURE__ */ new WeakMap(), pn = /* @__PURE__ */ new WeakMap(), Yn = /* @__PURE__ */ new WeakMap(), lo = /* @__PURE__ */ new WeakMap(), Xn = /* @__PURE__ */ new WeakMap(), Qn = /* @__PURE__ */ new WeakMap(), uo = /* @__PURE__ */ new WeakMap(), Zn = /* @__PURE__ */ new WeakMap(), gt = /* @__PURE__ */ new WeakMap(), jn = /* @__PURE__ */ new WeakMap(), co = /* @__PURE__ */ new WeakMap(), fo = /* @__PURE__ */ new WeakMap(), Vt = /* @__PURE__ */ new WeakMap(), ho = /* @__PURE__ */ new WeakMap(), po = /* @__PURE__ */ new WeakMap(), er = /* @__PURE__ */ new WeakMap(), mo = /* @__PURE__ */ new WeakMap(), Ye = /* @__PURE__ */ new WeakSet(), Bi = function() {
    if (this.receivedMessages.length === 0) throw new J("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, Bl = function() {
    if (this.receivedMessages.length === 0) throw new J("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new J("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, Gi = function() {
    this.ended || F(this, xt, void 0, "f");
  }, Hi = function(n) {
    if (this.ended) return;
    const r = E(this, Ye, "m", Gl).call(this, n);
    switch (this._emit("streamEvent", n, r), n.type) {
      case "content_block_delta": {
        const o = r.content.at(-1);
        switch (n.delta.type) {
          case "text_delta":
            o.type === "text" && this._emit("text", n.delta.text, o.text || "");
            break;
          case "citations_delta":
            o.type === "text" && this._emit("citation", n.delta.citation, o.citations ?? []);
            break;
          case "input_json_delta":
            Vl(o) && o.input && this._emit("inputJson", n.delta.partial_json, o.input);
            break;
          case "thinking_delta":
            o.type === "thinking" && this._emit("thinking", n.delta.thinking, o.thinking);
            break;
          case "signature_delta":
            o.type === "thinking" && this._emit("signature", o.signature);
            break;
          case "compaction_delta":
            o.type === "compaction" && o.content && this._emit("compaction", o.content);
            break;
          default:
            n.delta;
        }
        break;
      }
      case "message_stop":
        this._addMessageParam(r), this._addMessage(ql(r, E(this, pn, "f"), { logger: E(this, er, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", r.content.at(-1));
        break;
      case "message_start":
        F(this, xt, r, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, Vi = function() {
    if (this.ended) throw new J("stream has ended, this shouldn't happen");
    const n = E(this, xt, "f");
    if (!n) throw new J("request ended without sending any chunks");
    return F(this, xt, void 0, "f"), ql(n, E(this, pn, "f"), { logger: E(this, er, "f") });
  }, Gl = function(n) {
    let r = E(this, xt, "f");
    if (n.type === "message_start") {
      if (r) throw new J(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!r) throw new J(`Unexpected event order, got ${n.type} before "message_start"`);
    switch (n.type) {
      case "message_stop":
        return r;
      case "message_delta":
        return r.container = n.delta.container, r.stop_reason = n.delta.stop_reason, r.stop_sequence = n.delta.stop_sequence, r.usage.output_tokens = n.usage.output_tokens, r.context_management = n.context_management, n.usage.input_tokens != null && (r.usage.input_tokens = n.usage.input_tokens), n.usage.cache_creation_input_tokens != null && (r.usage.cache_creation_input_tokens = n.usage.cache_creation_input_tokens), n.usage.cache_read_input_tokens != null && (r.usage.cache_read_input_tokens = n.usage.cache_read_input_tokens), n.usage.server_tool_use != null && (r.usage.server_tool_use = n.usage.server_tool_use), n.usage.iterations != null && (r.usage.iterations = n.usage.iterations), r;
      case "content_block_start":
        return r.content.push(n.content_block), r;
      case "content_block_delta": {
        const o = r.content.at(n.index);
        switch (n.delta.type) {
          case "text_delta":
            o?.type === "text" && (r.content[n.index] = {
              ...o,
              text: (o.text || "") + n.delta.text
            });
            break;
          case "citations_delta":
            o?.type === "text" && (r.content[n.index] = {
              ...o,
              citations: [...o.citations ?? [], n.delta.citation]
            });
            break;
          case "input_json_delta":
            if (o && Vl(o)) {
              let i = o[Hl] || "";
              i += n.delta.partial_json;
              const s = { ...o };
              if (Object.defineProperty(s, Hl, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i) try {
                s.input = kf(i);
              } catch (u) {
                const c = new J(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${i}`);
                E(this, mo, "f").call(this, c);
              }
              r.content[n.index] = s;
            }
            break;
          case "thinking_delta":
            o?.type === "thinking" && (r.content[n.index] = {
              ...o,
              thinking: o.thinking + n.delta.thinking
            });
            break;
          case "signature_delta":
            o?.type === "thinking" && (r.content[n.index] = {
              ...o,
              signature: n.delta.signature
            });
            break;
          case "compaction_delta":
            o?.type === "compaction" && (r.content[n.index] = {
              ...o,
              content: (o.content || "") + n.delta.content
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
    return this.on("streamEvent", (o) => {
      const i = n.shift();
      i ? i.resolve(o) : t.push(o);
    }), this.on("end", () => {
      r = !0;
      for (const o of n) o.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (o) => {
      r = !0;
      for (const i of n) i.reject(o);
      n.length = 0;
    }), this.on("error", (o) => {
      r = !0;
      for (const i of n) i.reject(o);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : r ? {
        value: void 0,
        done: !0
      } : new Promise((o, i) => n.push({
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
  toReadableStream() {
    return new Fr(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, Df = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var Iy = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
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
Wrap your summary in <summary></summary> tags.`, tr, mn, Jt, he, Ne, Fe, Et, Mt, nr, Jl, Ts;
function Kl() {
  let e, t;
  return {
    promise: new Promise((n, r) => {
      e = n, t = r;
    }),
    resolve: e,
    reject: t
  };
}
var $f = class {
  constructor(e, t, n) {
    tr.add(this), this.client = e, mn.set(this, !1), Jt.set(this, !1), he.set(this, void 0), Ne.set(this, void 0), Fe.set(this, void 0), Et.set(this, void 0), Mt.set(this, void 0), nr.set(this, 0), F(this, he, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const r = ["BetaToolRunner", ...Sf(t.tools, t.messages)].join(", ");
    F(this, Ne, {
      ...n,
      headers: N([{ "x-stainless-helper": r }, n?.headers])
    }, "f"), F(this, Mt, Kl(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(mn = /* @__PURE__ */ new WeakMap(), Jt = /* @__PURE__ */ new WeakMap(), he = /* @__PURE__ */ new WeakMap(), Ne = /* @__PURE__ */ new WeakMap(), Fe = /* @__PURE__ */ new WeakMap(), Et = /* @__PURE__ */ new WeakMap(), Mt = /* @__PURE__ */ new WeakMap(), nr = /* @__PURE__ */ new WeakMap(), tr = /* @__PURE__ */ new WeakSet(), Jl = async function() {
    const t = E(this, he, "f").params.compactionControl;
    if (!t || !t.enabled) return !1;
    let n = 0;
    if (E(this, Fe, "f") !== void 0) try {
      const c = await E(this, Fe, "f");
      n = c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0) + c.usage.output_tokens;
    } catch {
      return !1;
    }
    const r = t.contextTokenThreshold ?? 1e5;
    if (n < r) return !1;
    const o = t.model ?? E(this, he, "f").params.model, i = t.summaryPrompt ?? Iy, s = E(this, he, "f").params.messages;
    if (s[s.length - 1].role === "assistant") {
      const c = s[s.length - 1];
      if (Array.isArray(c.content)) {
        const d = c.content.filter((f) => f.type !== "tool_use");
        d.length === 0 ? s.pop() : c.content = d;
      }
    }
    const u = await this.client.beta.messages.create({
      model: o,
      messages: [...s, {
        role: "user",
        content: [{
          type: "text",
          text: i
        }]
      }],
      max_tokens: E(this, he, "f").params.max_tokens
    }, {
      signal: E(this, Ne, "f").signal,
      headers: N([E(this, Ne, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (u.content[0]?.type !== "text") throw new J("Expected text response for compaction");
    return E(this, he, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (E(this, mn, "f")) throw new J("Cannot iterate over a consumed stream");
    F(this, mn, !0, "f"), F(this, Jt, !0, "f"), F(this, Et, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (E(this, he, "f").params.max_iterations && E(this, nr, "f") >= E(this, he, "f").params.max_iterations) break;
          F(this, Jt, !1, "f"), F(this, Et, void 0, "f"), F(this, nr, (e = E(this, nr, "f"), e++, e), "f"), F(this, Fe, void 0, "f");
          const { max_iterations: n, compactionControl: r, ...o } = E(this, he, "f").params;
          if (o.stream ? (t = this.client.beta.messages.stream({ ...o }, E(this, Ne, "f")), F(this, Fe, t.finalMessage(), "f"), E(this, Fe, "f").catch(() => {
          }), yield t) : (F(this, Fe, this.client.beta.messages.create({
            ...o,
            stream: !1
          }, E(this, Ne, "f")), "f"), yield E(this, Fe, "f")), !await E(this, tr, "m", Jl).call(this)) {
            if (!E(this, Jt, "f")) {
              const { role: s, content: u } = await E(this, Fe, "f");
              E(this, he, "f").params.messages.push({
                role: s,
                content: u
              });
            }
            const i = await E(this, tr, "m", Ts).call(this, E(this, he, "f").params.messages.at(-1));
            if (i) E(this, he, "f").params.messages.push(i);
            else if (!E(this, Jt, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!E(this, Fe, "f")) throw new J("ToolRunner concluded without a message from the server");
      E(this, Mt, "f").resolve(await E(this, Fe, "f"));
    } catch (t) {
      throw F(this, mn, !1, "f"), E(this, Mt, "f").promise.catch(() => {
      }), E(this, Mt, "f").reject(t), F(this, Mt, Kl(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? E(this, he, "f").params = e(E(this, he, "f").params) : E(this, he, "f").params = e, F(this, Jt, !0, "f"), F(this, Et, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? F(this, Ne, e(E(this, Ne, "f")), "f") : F(this, Ne, {
      ...E(this, Ne, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = E(this, Ne, "f").signal) {
    const t = await E(this, Fe, "f") ?? this.params.messages.at(-1);
    return t ? E(this, tr, "m", Ts).call(this, t, e) : null;
  }
  done() {
    return E(this, Mt, "f").promise;
  }
  async runUntilDone() {
    if (!E(this, mn, "f")) for await (const e of this) ;
    return this.done();
  }
  get params() {
    return E(this, he, "f").params;
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
Ts = async function(t, n = E(this, Ne, "f").signal) {
  return E(this, Et, "f") !== void 0 ? E(this, Et, "f") : (F(this, Et, by(E(this, he, "f").params, t, {
    ...E(this, Ne, "f"),
    signal: n
  }), "f"), E(this, Et, "f"));
};
async function by(e, t = e.messages.at(-1), n) {
  if (!t || t.role !== "assistant" || !t.content || typeof t.content == "string") return null;
  const r = t.content.filter((o) => o.type === "tool_use");
  return r.length === 0 ? null : {
    role: "user",
    content: await Promise.all(r.map(async (o) => {
      const i = e.tools.find((s) => ("name" in s ? s.name : s.mcp_server_name) === o.name);
      if (!i || !("run" in i)) return {
        type: "tool_result",
        tool_use_id: o.id,
        content: `Error: Tool '${o.name}' not found`,
        is_error: !0
      };
      try {
        let s = o.input;
        "parse" in i && i.parse && (s = i.parse(s));
        const u = await i.run(s, {
          toolUseBlock: o,
          signal: n?.signal
        });
        return {
          type: "tool_result",
          tool_use_id: o.id,
          content: u
        };
      } catch (s) {
        return {
          type: "tool_result",
          tool_use_id: o.id,
          content: s instanceof Df ? s.content : `Error: ${s instanceof Error ? s.message : String(s)}`,
          is_error: !0
        };
      }
    }))
  };
}
var Lf = class Uf {
  constructor(t, n) {
    this.iterator = t, this.controller = n;
  }
  async *decoder() {
    const t = new Jr();
    for await (const n of this.iterator) for (const r of t.decode(n)) yield JSON.parse(r);
    for (const n of t.flush()) yield JSON.parse(n);
  }
  [Symbol.asyncIterator]() {
    return this.decoder();
  }
  static fromResponse(t, n) {
    if (!t.body)
      throw n.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new J("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new J("Attempted to iterate over a response with no body");
    return new Uf(ha(t.body), n);
  }
}, Ff = class extends ne {
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/messages/batches?beta=true", {
      body: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/messages/batches?beta=true", Kr, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(q`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  cancel(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(q`/v1/messages/batches/${e}/cancel?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  async results(e, t = {}, n) {
    const r = await this.retrieve(e);
    if (!r.results_url) throw new J(`No batch \`results_url\`; Has it finished processing? ${r.processing_status} - ${r.id}`);
    const { betas: o } = t ?? {};
    return this._client.get(r.results_url, {
      ...n,
      headers: N([{
        "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((i, s) => Lf.fromResponse(s.response, s.controller));
  }
}, Wl = {
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
}, Py = ["claude-mythos-preview", "claude-opus-4-6"], Wr = class extends ne {
  constructor() {
    super(...arguments), this.batches = new Ff(this._client);
  }
  create(e, t) {
    const n = zl(e), { betas: r, ...o } = n;
    o.model in Wl && console.warn(`The model '${o.model}' is deprecated and will reach end-of-life on ${Wl[o.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), Py.includes(o.model) && o.thinking && o.thinking.type === "enabled" && console.warn(`Using Claude with ${o.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let i = this._client._options.timeout;
    if (!o.stream && i == null) {
      const u = xf[o.model] ?? void 0;
      i = this._client.calculateNonstreamingTimeout(o.max_tokens, u);
    }
    const s = Ef(o.tools, o.messages);
    return this._client.post("/v1/messages?beta=true", {
      body: o,
      timeout: i ?? 6e5,
      ...t,
      headers: N([
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
      headers: N([{ "anthropic-beta": [...e.betas ?? [], "structured-outputs-2025-12-15"].toString() }, t?.headers])
    }, this.create(e, t).then((n) => Nf(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return wy.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...r } = zl(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new $f(this._client, e, t);
  }
};
function zl(e) {
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
Wr.Batches = Ff;
Wr.BetaToolRunner = $f;
Wr.ToolError = Df;
var Of = class extends ne {
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/sessions/${e}/events?beta=true`, Le, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  send(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/sessions/${e}/events?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  stream(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/sessions/${e}/events/stream?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers]),
      stream: !0
    });
  }
}, qf = class extends ne {
  retrieve(e, t, n) {
    const { session_id: r, betas: o } = t;
    return this._client.get(q`/v1/sessions/${r}/resources/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { session_id: r, betas: o, ...i } = t;
    return this._client.post(q`/v1/sessions/${r}/resources/${e}?beta=true`, {
      body: i,
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/sessions/${e}/resources?beta=true`, Le, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { session_id: r, betas: o } = t;
    return this._client.delete(q`/v1/sessions/${r}/resources/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  add(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/sessions/${e}/resources?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Ai = class extends ne {
  constructor() {
    super(...arguments), this.events = new Of(this._client), this.resources = new qf(this._client);
  }
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/sessions?beta=true", {
      body: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/sessions/${e}?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/sessions?beta=true", Le, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(q`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(q`/v1/sessions/${e}/archive?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Ai.Events = Of;
Ai.Resources = qf;
var Bf = class extends ne {
  create(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.post(q`/v1/skills/${e}/versions?beta=true`, ma({
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: r, betas: o } = t;
    return this._client.get(q`/v1/skills/${r}/versions/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/skills/${e}/versions?beta=true`, Le, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { skill_id: r, betas: o } = t;
    return this._client.delete(q`/v1/skills/${r}/versions/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
}, ya = class extends ne {
  constructor() {
    super(...arguments), this.versions = new Bf(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.post("/v1/skills?beta=true", ma({
      body: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    }, this._client, !1));
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/skills?beta=true", Le, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(q`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
};
ya.Versions = Bf;
var Gf = class extends ne {
  create(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/vaults/${e}/credentials?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vault_id: r, betas: o } = t;
    return this._client.get(q`/v1/vaults/${r}/credentials/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vault_id: r, betas: o, ...i } = t;
    return this._client.post(q`/v1/vaults/${r}/credentials/${e}?beta=true`, {
      body: i,
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/vaults/${e}/credentials?beta=true`, Le, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vault_id: r, betas: o } = t;
    return this._client.delete(q`/v1/vaults/${r}/credentials/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t, n) {
    const { vault_id: r, betas: o } = t;
    return this._client.post(q`/v1/vaults/${r}/credentials/${e}/archive?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, _a = class extends ne {
  constructor() {
    super(...arguments), this.credentials = new Gf(this._client);
  }
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/vaults?beta=true", {
      body: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/vaults/${e}?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/vaults?beta=true", Le, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(q`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(q`/v1/vaults/${e}/archive?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
_a.Credentials = Gf;
var et = class extends ne {
  constructor() {
    super(...arguments), this.models = new wf(this._client), this.messages = new Wr(this._client), this.agents = new ga(this._client), this.environments = new Tf(this._client), this.sessions = new Ai(this._client), this.vaults = new _a(this._client), this.memoryStores = new vi(this._client), this.files = new Cf(this._client), this.skills = new ya(this._client), this.userProfiles = new If(this._client);
  }
};
et.Models = wf;
et.Messages = Wr;
et.Agents = ga;
et.Environments = Tf;
et.Sessions = Ai;
et.Vaults = _a;
et.MemoryStores = vi;
et.Files = Cf;
et.Skills = ya;
et.UserProfiles = If;
var Hf = class extends ne {
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/complete", {
      body: r,
      timeout: this._client._options.timeout ?? 6e5,
      ...t,
      headers: N([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers]),
      stream: e.stream ?? !1
    });
  }
};
function Vf(e) {
  return e?.output_config?.format;
}
function Yl(e, t, n) {
  const r = Vf(t);
  return !t || !("parse" in (r ?? {})) ? {
    ...e,
    content: e.content.map((o) => o.type === "text" ? Object.defineProperty({ ...o }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : o),
    parsed_output: null
  } : Jf(e, t, n);
}
function Jf(e, t, n) {
  let r = null;
  const o = e.content.map((i) => {
    if (i.type === "text") {
      const s = Ry(t, i.text);
      return r === null && (r = s), Object.defineProperty({ ...i }, "parsed_output", {
        value: s,
        enumerable: !1
      });
    }
    return i;
  });
  return {
    ...e,
    content: o,
    parsed_output: r
  };
}
function Ry(e, t) {
  const n = Vf(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new J(`Failed to parse structured output: ${r}`);
  }
}
var Xe, Nt, gn, rr, go, or, ir, yo, sr, yt, ar, _o, vo, Kt, Ao, To, lr, Ji, Xl, Ki, Wi, zi, Yi, Ql, Zl = "__json_buf";
function jl(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var xy = class Ss {
  constructor(t, n) {
    Xe.add(this), this.messages = [], this.receivedMessages = [], Nt.set(this, void 0), gn.set(this, null), this.controller = new AbortController(), rr.set(this, void 0), go.set(this, () => {
    }), or.set(this, () => {
    }), ir.set(this, void 0), yo.set(this, () => {
    }), sr.set(this, () => {
    }), yt.set(this, {}), ar.set(this, !1), _o.set(this, !1), vo.set(this, !1), Kt.set(this, !1), Ao.set(this, void 0), To.set(this, void 0), lr.set(this, void 0), Ki.set(this, (r) => {
      if (F(this, _o, !0, "f"), Ur(r) && (r = new st()), r instanceof st)
        return F(this, vo, !0, "f"), this._emit("abort", r);
      if (r instanceof J) return this._emit("error", r);
      if (r instanceof Error) {
        const o = new J(r.message);
        return o.cause = r, this._emit("error", o);
      }
      return this._emit("error", new J(String(r)));
    }), F(this, rr, new Promise((r, o) => {
      F(this, go, r, "f"), F(this, or, o, "f");
    }), "f"), F(this, ir, new Promise((r, o) => {
      F(this, yo, r, "f"), F(this, sr, o, "f");
    }), "f"), E(this, rr, "f").catch(() => {
    }), E(this, ir, "f").catch(() => {
    }), F(this, gn, t, "f"), F(this, lr, n?.logger ?? console, "f");
  }
  get response() {
    return E(this, Ao, "f");
  }
  get request_id() {
    return E(this, To, "f");
  }
  async withResponse() {
    F(this, Kt, !0, "f");
    const t = await E(this, rr, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Ss(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, r, { logger: o } = {}) {
    const i = new Ss(n, { logger: o });
    for (const s of n.messages) i._addMessageParam(s);
    return F(i, gn, {
      ...n,
      stream: !0
    }, "f"), i._run(() => i._createMessage(t, {
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
  _run(t) {
    t().then(() => {
      this._emitFinal(), this._emit("end");
    }, E(this, Ki, "f"));
  }
  _addMessageParam(t) {
    this.messages.push(t);
  }
  _addMessage(t, n = !0) {
    this.receivedMessages.push(t), n && this._emit("message", t);
  }
  async _createMessage(t, n, r) {
    const o = r?.signal;
    let i;
    o && (o.aborted && this.controller.abort(), i = this.controller.abort.bind(this.controller), o.addEventListener("abort", i));
    try {
      E(this, Xe, "m", Wi).call(this);
      const { response: s, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(s);
      for await (const c of u) E(this, Xe, "m", zi).call(this, c);
      if (u.controller.signal?.aborted) throw new st();
      E(this, Xe, "m", Yi).call(this);
    } finally {
      o && i && o.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (F(this, Ao, t, "f"), F(this, To, t?.headers.get("request-id"), "f"), E(this, go, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return E(this, ar, "f");
  }
  get errored() {
    return E(this, _o, "f");
  }
  get aborted() {
    return E(this, vo, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (E(this, yt, "f")[t] || (E(this, yt, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const r = E(this, yt, "f")[t];
    if (!r) return this;
    const o = r.findIndex((i) => i.listener === n);
    return o >= 0 && r.splice(o, 1), this;
  }
  once(t, n) {
    return (E(this, yt, "f")[t] || (E(this, yt, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, r) => {
      F(this, Kt, !0, "f"), t !== "error" && this.once("error", r), this.once(t, n);
    });
  }
  async done() {
    F(this, Kt, !0, "f"), await E(this, ir, "f");
  }
  get currentMessage() {
    return E(this, Nt, "f");
  }
  async finalMessage() {
    return await this.done(), E(this, Xe, "m", Ji).call(this);
  }
  async finalText() {
    return await this.done(), E(this, Xe, "m", Xl).call(this);
  }
  _emit(t, ...n) {
    if (E(this, ar, "f")) return;
    t === "end" && (F(this, ar, !0, "f"), E(this, yo, "f").call(this));
    const r = E(this, yt, "f")[t];
    if (r && (E(this, yt, "f")[t] = r.filter((o) => !o.once), r.forEach(({ listener: o }) => o(...n))), t === "abort") {
      const o = n[0];
      !E(this, Kt, "f") && !r?.length && Promise.reject(o), E(this, or, "f").call(this, o), E(this, sr, "f").call(this, o), this._emit("end");
      return;
    }
    if (t === "error") {
      const o = n[0];
      !E(this, Kt, "f") && !r?.length && Promise.reject(o), E(this, or, "f").call(this, o), E(this, sr, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", E(this, Xe, "m", Ji).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let o;
    r && (r.aborted && this.controller.abort(), o = this.controller.abort.bind(this.controller), r.addEventListener("abort", o));
    try {
      E(this, Xe, "m", Wi).call(this), this._connected(null);
      const i = Fr.fromReadableStream(t, this.controller);
      for await (const s of i) E(this, Xe, "m", zi).call(this, s);
      if (i.controller.signal?.aborted) throw new st();
      E(this, Xe, "m", Yi).call(this);
    } finally {
      r && o && r.removeEventListener("abort", o);
    }
  }
  [(Nt = /* @__PURE__ */ new WeakMap(), gn = /* @__PURE__ */ new WeakMap(), rr = /* @__PURE__ */ new WeakMap(), go = /* @__PURE__ */ new WeakMap(), or = /* @__PURE__ */ new WeakMap(), ir = /* @__PURE__ */ new WeakMap(), yo = /* @__PURE__ */ new WeakMap(), sr = /* @__PURE__ */ new WeakMap(), yt = /* @__PURE__ */ new WeakMap(), ar = /* @__PURE__ */ new WeakMap(), _o = /* @__PURE__ */ new WeakMap(), vo = /* @__PURE__ */ new WeakMap(), Kt = /* @__PURE__ */ new WeakMap(), Ao = /* @__PURE__ */ new WeakMap(), To = /* @__PURE__ */ new WeakMap(), lr = /* @__PURE__ */ new WeakMap(), Ki = /* @__PURE__ */ new WeakMap(), Xe = /* @__PURE__ */ new WeakSet(), Ji = function() {
    if (this.receivedMessages.length === 0) throw new J("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, Xl = function() {
    if (this.receivedMessages.length === 0) throw new J("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new J("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, Wi = function() {
    this.ended || F(this, Nt, void 0, "f");
  }, zi = function(n) {
    if (this.ended) return;
    const r = E(this, Xe, "m", Ql).call(this, n);
    switch (this._emit("streamEvent", n, r), n.type) {
      case "content_block_delta": {
        const o = r.content.at(-1);
        switch (n.delta.type) {
          case "text_delta":
            o.type === "text" && this._emit("text", n.delta.text, o.text || "");
            break;
          case "citations_delta":
            o.type === "text" && this._emit("citation", n.delta.citation, o.citations ?? []);
            break;
          case "input_json_delta":
            jl(o) && o.input && this._emit("inputJson", n.delta.partial_json, o.input);
            break;
          case "thinking_delta":
            o.type === "thinking" && this._emit("thinking", n.delta.thinking, o.thinking);
            break;
          case "signature_delta":
            o.type === "thinking" && this._emit("signature", o.signature);
            break;
          default:
            n.delta;
        }
        break;
      }
      case "message_stop":
        this._addMessageParam(r), this._addMessage(Yl(r, E(this, gn, "f"), { logger: E(this, lr, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", r.content.at(-1));
        break;
      case "message_start":
        F(this, Nt, r, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, Yi = function() {
    if (this.ended) throw new J("stream has ended, this shouldn't happen");
    const n = E(this, Nt, "f");
    if (!n) throw new J("request ended without sending any chunks");
    return F(this, Nt, void 0, "f"), Yl(n, E(this, gn, "f"), { logger: E(this, lr, "f") });
  }, Ql = function(n) {
    let r = E(this, Nt, "f");
    if (n.type === "message_start") {
      if (r) throw new J(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!r) throw new J(`Unexpected event order, got ${n.type} before "message_start"`);
    switch (n.type) {
      case "message_stop":
        return r;
      case "message_delta":
        return r.stop_reason = n.delta.stop_reason, r.stop_sequence = n.delta.stop_sequence, r.usage.output_tokens = n.usage.output_tokens, n.usage.input_tokens != null && (r.usage.input_tokens = n.usage.input_tokens), n.usage.cache_creation_input_tokens != null && (r.usage.cache_creation_input_tokens = n.usage.cache_creation_input_tokens), n.usage.cache_read_input_tokens != null && (r.usage.cache_read_input_tokens = n.usage.cache_read_input_tokens), n.usage.server_tool_use != null && (r.usage.server_tool_use = n.usage.server_tool_use), r;
      case "content_block_start":
        return r.content.push({ ...n.content_block }), r;
      case "content_block_delta": {
        const o = r.content.at(n.index);
        switch (n.delta.type) {
          case "text_delta":
            o?.type === "text" && (r.content[n.index] = {
              ...o,
              text: (o.text || "") + n.delta.text
            });
            break;
          case "citations_delta":
            o?.type === "text" && (r.content[n.index] = {
              ...o,
              citations: [...o.citations ?? [], n.delta.citation]
            });
            break;
          case "input_json_delta":
            if (o && jl(o)) {
              let i = o[Zl] || "";
              i += n.delta.partial_json;
              const s = { ...o };
              Object.defineProperty(s, Zl, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i && (s.input = kf(i)), r.content[n.index] = s;
            }
            break;
          case "thinking_delta":
            o?.type === "thinking" && (r.content[n.index] = {
              ...o,
              thinking: o.thinking + n.delta.thinking
            });
            break;
          case "signature_delta":
            o?.type === "thinking" && (r.content[n.index] = {
              ...o,
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
    return this.on("streamEvent", (o) => {
      const i = n.shift();
      i ? i.resolve(o) : t.push(o);
    }), this.on("end", () => {
      r = !0;
      for (const o of n) o.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (o) => {
      r = !0;
      for (const i of n) i.reject(o);
      n.length = 0;
    }), this.on("error", (o) => {
      r = !0;
      for (const i of n) i.reject(o);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : r ? {
        value: void 0,
        done: !0
      } : new Promise((o, i) => n.push({
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
  toReadableStream() {
    return new Fr(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, Kf = class extends ne {
  create(e, t) {
    return this._client.post("/v1/messages/batches", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(q`/v1/messages/batches/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/v1/messages/batches", Kr, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(q`/v1/messages/batches/${e}`, t);
  }
  cancel(e, t) {
    return this._client.post(q`/v1/messages/batches/${e}/cancel`, t);
  }
  async results(e, t) {
    const n = await this.retrieve(e);
    if (!n.results_url) throw new J(`No batch \`results_url\`; Has it finished processing? ${n.processing_status} - ${n.id}`);
    return this._client.get(n.results_url, {
      ...t,
      headers: N([{ Accept: "application/binary" }, t?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((r, o) => Lf.fromResponse(o.response, o.controller));
  }
}, va = class extends ne {
  constructor() {
    super(...arguments), this.batches = new Kf(this._client);
  }
  create(e, t) {
    e.model in eu && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${eu[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), My.includes(e.model) && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const o = xf[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, o);
    }
    const r = Ef(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: N([r, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => Jf(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return xy.createMessage(this, e, t, { logger: this._client.logger ?? console });
  }
  countTokens(e, t) {
    return this._client.post("/v1/messages/count_tokens", {
      body: e,
      ...t
    });
  }
}, eu = {
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
}, My = ["claude-mythos-preview", "claude-opus-4-6"];
va.Batches = Kf;
var Wf = class extends ne {
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/models/${e}`, {
      ...n,
      headers: N([{ ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/models", Kr, {
      query: r,
      ...t,
      headers: N([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, So = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, Es, Aa, Oo, zf, Ny = "\\n\\nHuman:", ky = "\\n\\nAssistant:", de = class {
  constructor({ baseURL: e = So("ANTHROPIC_BASE_URL"), apiKey: t = So("ANTHROPIC_API_KEY") ?? null, authToken: n = So("ANTHROPIC_AUTH_TOKEN") ?? null, ...r } = {}) {
    Es.add(this), Oo.set(this, void 0);
    const o = {
      apiKey: t,
      authToken: n,
      ...r,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!o.dangerouslyAllowBrowser && Wg()) throw new J(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = o.baseURL, this.timeout = o.timeout ?? Aa.DEFAULT_TIMEOUT, this.logger = o.logger ?? console;
    const i = "warn";
    this.logLevel = i, this.logLevel = Ll(o.logLevel, "ClientOptions.logLevel", this) ?? Ll(So("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? i, this.fetchOptions = o.fetchOptions, this.maxRetries = o.maxRetries ?? 2, this.fetch = o.fetch ?? Zg(), F(this, Oo, ey, "f"), this._options = o, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
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
    return N([await this.apiKeyAuth(e), await this.bearerAuth(e)]);
  }
  async apiKeyAuth(e) {
    if (this.apiKey != null)
      return N([{ "X-Api-Key": this.apiKey }]);
  }
  async bearerAuth(e) {
    if (this.authToken != null)
      return N([{ Authorization: `Bearer ${this.authToken}` }]);
  }
  stringifyQuery(e) {
    return ty(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${An}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Qd()}`;
  }
  makeStatusError(e, t, n, r) {
    return Ke.generate(e, t, n, r);
  }
  buildURL(e, t, n) {
    const r = !E(this, Es, "m", zf).call(this) && n || this.baseURL, o = Hg(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), s = Object.fromEntries(o.searchParams);
    return (!Rl(i) || !Rl(s)) && (t = {
      ...s,
      ...i,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (o.search = this.stringifyQuery(t)), o.toString();
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
    return this.request(Promise.resolve(n).then((r) => ({
      method: e,
      path: t,
      ...r
    })));
  }
  request(e, t = null) {
    return new hf(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const r = await e, o = r.maxRetries ?? this.maxRetries;
    t == null && (t = o), await this.prepareOptions(r);
    const { req: i, url: s, timeout: u } = await this.buildRequest(r, { retryCount: o - t });
    await this.prepareRequest(i, {
      url: s,
      options: r
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, f = Date.now();
    if (Re(this).debug(`[${c}] sending request`, Wt({
      retryOfRequestLogID: n,
      method: r.method,
      url: s,
      options: r,
      headers: i.headers
    })), r.signal?.aborted) throw new st();
    const h = new AbortController(), p = await this.fetchWithTimeout(s, i, u, h).catch(ps), m = Date.now();
    if (p instanceof globalThis.Error) {
      const _ = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new st();
      const v = Ur(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (t)
        return Re(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - ${_}`), Re(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (${_})`, Wt({
          retryOfRequestLogID: n,
          url: s,
          durationMs: m - f,
          message: p.message
        })), this.retryRequest(r, t, n ?? c);
      throw Re(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - error; no more retries left`), Re(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (error; no more retries left)`, Wt({
        retryOfRequestLogID: n,
        url: s,
        durationMs: m - f,
        message: p.message
      })), v ? new Zd() : new _i({ cause: p });
    }
    const g = `[${c}${d}${[...p.headers.entries()].filter(([_]) => _ === "request-id").map(([_, v]) => ", " + _ + ": " + JSON.stringify(v)).join("")}] ${i.method} ${s} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - f}ms`;
    if (!p.ok) {
      const _ = await this.shouldRetry(p);
      if (t && _) {
        const R = `retrying, ${t} attempts remaining`;
        return await jg(p.body), Re(this).info(`${g} - ${R}`), Re(this).debug(`[${c}] response error (${R})`, Wt({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: m - f
        })), this.retryRequest(r, t, n ?? c, p.headers);
      }
      const v = _ ? "error; no more retries left" : "error; not retryable";
      Re(this).info(`${g} - ${v}`);
      const C = await p.text().catch((R) => ps(R).message), b = lf(C), P = b ? void 0 : C;
      throw Re(this).debug(`[${c}] response error (${v})`, Wt({
        retryOfRequestLogID: n,
        url: p.url,
        status: p.status,
        headers: p.headers,
        message: P,
        durationMs: Date.now() - f
      })), this.makeStatusError(p.status, b, P, p.headers);
    }
    return Re(this).info(g), Re(this).debug(`[${c}] response start`, Wt({
      retryOfRequestLogID: n,
      url: p.url,
      status: p.status,
      headers: p.headers,
      durationMs: m - f
    })), {
      response: p,
      options: r,
      controller: h,
      requestLogID: c,
      retryOfRequestLogID: n,
      startTime: f
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
    return new cy(this, n, e);
  }
  async fetchWithTimeout(e, t, n, r) {
    const { signal: o, method: i, ...s } = t || {}, u = this._makeAbort(r);
    o && o.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && s.body instanceof globalThis.ReadableStream || typeof s.body == "object" && s.body !== null && Symbol.asyncIterator in s.body, f = {
      signal: r.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...s
    };
    i && (f.method = i.toUpperCase());
    try {
      return await this.fetch.call(void 0, e, f);
    } finally {
      clearTimeout(c);
    }
  }
  async shouldRetry(e) {
    const t = e.headers.get("x-should-retry");
    return t === "true" ? !0 : t === "false" ? !1 : e.status === 408 || e.status === 409 || e.status === 429 || e.status >= 500;
  }
  async retryRequest(e, t, n, r) {
    let o;
    const i = r?.get("retry-after-ms");
    if (i) {
      const u = parseFloat(i);
      Number.isNaN(u) || (o = u);
    }
    const s = r?.get("retry-after");
    if (s && !o) {
      const u = parseFloat(s);
      Number.isNaN(u) ? o = Date.parse(s) - Date.now() : o = u * 1e3;
    }
    if (o === void 0) {
      const u = e.maxRetries ?? this.maxRetries;
      o = this.calculateDefaultRetryTimeoutMillis(t, u);
    }
    return await Kg(o), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const o = t - e;
    return Math.min(0.5 * Math.pow(2, o), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  calculateNonstreamingTimeout(e, t) {
    if (36e5 * e / 128e3 > 6e5 || t != null && e > t) throw new J("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details");
    return 6e5;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: r, path: o, query: i, defaultBaseURL: s } = n, u = this.buildURL(o, i, s);
    "timeout" in n && Jg("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    let o = {};
    this.idempotencyHeader && t !== "get" && (e.idempotencyKey || (e.idempotencyKey = this.defaultIdempotencyKey()), o[this.idempotencyHeader] = e.idempotencyKey);
    const i = N([
      o,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(r),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...Qg(),
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
    const n = N([t]);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || globalThis.ReadableStream && e instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: e
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: cf(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : E(this, Oo, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
Aa = de, Oo = /* @__PURE__ */ new WeakMap(), Es = /* @__PURE__ */ new WeakSet(), zf = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
de.Anthropic = Aa;
de.HUMAN_PROMPT = Ny;
de.AI_PROMPT = ky;
de.DEFAULT_TIMEOUT = 6e5;
de.AnthropicError = J;
de.APIError = Ke;
de.APIConnectionError = _i;
de.APIConnectionTimeoutError = Zd;
de.APIUserAbortError = st;
de.NotFoundError = nf;
de.ConflictError = rf;
de.RateLimitError = sf;
de.BadRequestError = jd;
de.AuthenticationError = ef;
de.InternalServerError = af;
de.PermissionDeniedError = tf;
de.UnprocessableEntityError = of;
de.toFile = gy;
var zr = class extends de {
  constructor() {
    super(...arguments), this.completions = new Hf(this), this.messages = new va(this), this.models = new Wf(this), this.beta = new et(this);
  }
};
zr.Completions = Hf;
zr.Messages = va;
zr.Models = Wf;
zr.Beta = et;
function sn(e) {
  if (Array.isArray(e)) return e.map((n) => sn(n));
  if (!e || typeof e != "object") return e;
  const t = {};
  return Object.entries(e).forEach(([n, r]) => {
    t[n] = /^(?:authorization|proxy[-_]?authorization|(?:x[-_])?csrf(?:[-_]?token)?|token|access[-_]?token|refresh[-_]?token|id[-_]?token|api[-_]?key|x[-_](?:goog[-_])?api[-_]?key|proxy[-_]?password|password|client[-_]?secret)$/i.test(n) ? "[redacted]" : sn(r);
  }), t;
}
function Ot(e = {}, t = {}) {
  const n = t.reasoning && typeof t.reasoning == "object" ? t.reasoning : {}, r = String(e.reasoning?.mode || "inherit"), o = e.reasoning?.output === "show" || e.reasoning?.output === "hide" ? e.reasoning.output : n.output === "show" ? "show" : "hide", i = String(n.mode || t.effectiveMode || r);
  return {
    reasoningRequestedMode: r,
    reasoningRequestedOutput: o,
    reasoningProfileId: String(n.profileId || t.profileId || e.reasoning?.profileId || "unsupported"),
    reasoningEffectiveMode: i,
    reasoningEffort: i === "on" ? String(t.effort ?? n.effort ?? e.reasoning?.effort ?? "") : "",
    reasoningBudgetTokens: i === "on" && Number.isFinite(Number(t.budgetTokens ?? n.budgetTokens ?? e.reasoning?.budgetTokens)) ? Number(t.budgetTokens ?? n.budgetTokens ?? e.reasoning?.budgetTokens) : null,
    reasoningControlFields: sn(t.controlFields || {}),
    reasoningOutputVisible: i !== "off" && n.output === "show"
  };
}
function Or(e = {}) {
  return {
    provider: e.provider || "",
    model: e.model || "",
    transport: e.transport || "sdk",
    request: sn({
      url: e.url || "",
      method: e.method || "POST",
      headers: e.headers || {},
      body: e.body || {},
      sdk: e.sdk || void 0
    }),
    ...e.effectiveConfig ? { effectiveConfig: e.effectiveConfig } : {}
  };
}
function Dy(e = "") {
  return String(e || "").trim().toLowerCase();
}
function Ta(e = "") {
  const t = Dy(e);
  return t.includes("deepseek") ? "deepseek" : t.includes("kimi") || t.includes("moonshot") ? "kimi" : t.includes("gemini") ? "gemini" : t.includes("claude") ? "claude" : /(?:^|[/_.-])gpt(?:\d|[/_.-]|$)/.test(t) || /(?:^|[/_.-])o\d+(?:[/_.-]|$)/.test(t) ? "openai" : "";
}
var $y = Object.freeze({
  minimal: "最小",
  low: "低",
  medium: "中",
  high: "高",
  xhigh: "超高",
  max: "最大",
  min: "最小"
});
function Yf(e) {
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
function pt(e, t, n, r, o = {}) {
  return Yf({
    profileId: e,
    modes: t,
    intensity: {
      kind: "effort",
      values: n,
      defaultValue: r
    },
    outputModes: o.outputModes,
    temperatureOmitModes: o.temperatureOmitModes
  });
}
var Sa = Yf({
  profileId: "unsupported",
  modes: ["inherit"],
  outputModes: ["hide"],
  intensity: { kind: "none" },
  unsupportedReason: "当前 Provider、传输方式与模型组合没有已验证的 Reasoning 控制协议。"
}), Yr = Object.freeze(["on"]), Ea = Object.freeze([
  "inherit",
  "on",
  "off"
]), Xf = pt("openai-gpt-5.6", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "medium", { temperatureOmitModes: Ea }), Ly = pt("kimi-k3", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "max", { temperatureOmitModes: Yr }), Uy = pt("deepseek-thinking", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "high", { temperatureOmitModes: Yr }), Fy = pt("openai-compatible-gemini-latest", [
  "inherit",
  "on",
  "off"
], [
  "minimal",
  "low",
  "medium",
  "high"
], "high", { temperatureOmitModes: Yr }), Oy = pt("openai-compatible-claude-latest", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { temperatureOmitModes: Yr }), qy = pt("openai-compatible-default", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high"
], "medium", { temperatureOmitModes: Yr }), By = pt("anthropic-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { temperatureOmitModes: Ea }), Gy = pt("sillytavern-claude-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "max"
], "high", { temperatureOmitModes: Ea }), Hy = pt("google-gemini-3-flash", ["inherit", "on"], [
  "minimal",
  "low",
  "medium",
  "high"
], "high"), Vy = pt("sillytavern-google-3-flash", ["inherit", "on"], [
  "min",
  "low",
  "medium",
  "high"
], "high");
function Jy(e = "") {
  switch (Ta(e)) {
    case "deepseek":
      return Uy;
    case "kimi":
      return Ly;
    case "gemini":
      return Fy;
    case "claude":
      return Oy;
    case "openai":
      return Xf;
    default:
      return qy;
  }
}
function Xr(e = {}) {
  const t = String(e.provider || "").trim(), n = String(e.model || "").trim().toLowerCase();
  switch (t) {
    case "openai-responses":
      return Xf;
    case "openai-compatible":
    case "sillytavern-openai-compatible":
      return Jy(n);
    case "anthropic":
      return By;
    case "sillytavern-claude":
      return Gy;
    case "google":
      return Hy;
    case "sillytavern-google":
      return Vy;
    default:
      return Sa;
  }
}
function Ky(e = Sa) {
  const t = new Set(e.modes || ["inherit"]);
  return [
    {
      value: "inherit",
      label: "跟随模型默认",
      disabled: !1
    },
    {
      value: "on",
      label: "开启",
      disabled: !t.has("on")
    },
    {
      value: "off",
      label: "关闭",
      disabled: !t.has("off")
    }
  ];
}
function Wy(e = Sa) {
  return e.intensity?.kind !== "effort" ? [] : e.intensity.values.map((t) => ({
    value: t,
    label: $y[t] || t
  }));
}
function Xi(e, t, n, r = "REASONING_CAPABILITY_UNSUPPORTED") {
  return {
    ...e,
    profileId: t.profileId,
    valid: !1,
    error: n,
    code: r
  };
}
function zy(e, t) {
  const n = { ...e };
  return delete n.effort, delete n.budgetTokens, t.intensity?.kind === "effort" ? {
    ...n,
    ...e.effort ? { effort: e.effort } : {}
  } : n;
}
function en(e = {}, t = {}) {
  const n = Xr(e), r = on(t), o = t?.output === "show" || t?.output === "hide" ? t.output : null, i = zy({
    ...r,
    output: r.mode === "off" ? "hide" : o || (n.outputModes.includes("show") ? "show" : "hide")
  }, n);
  if (!n.outputModes.includes(i.output)) return Xi(i, n, "当前任务要求返回 Reasoning 内容，但所选模型不支持。");
  if (!n.modes.includes(i.mode)) return Xi(i, n, i.mode === "off" ? "当前模型不支持显式关闭 Reasoning。请选择“跟随模型默认”。" : n.unsupportedReason || "当前模型不支持显式开启 Reasoning。");
  if (i.mode !== "on") return {
    ...i,
    profileId: n.profileId,
    valid: !0
  };
  if (n.intensity.kind === "effort") {
    const s = i.effort || n.intensity.defaultValue;
    return n.intensity.values.includes(s) ? {
      ...i,
      effort: s,
      profileId: n.profileId,
      valid: !0
    } : Xi(i, n, `当前模型不支持 Reasoning 强度“${s}”。`, "REASONING_CONFIG_INVALID");
  }
  return {
    ...i,
    profileId: n.profileId,
    valid: !0
  };
}
var Yy = class extends Error {
  constructor(e = {}) {
    super(e.error || "当前模型不支持所选 Reasoning 配置。"), this.name = "ReasoningCapabilityError", this.code = e.code || "REASONING_CAPABILITY_UNSUPPORTED", this.profileId = e.profileId || "unsupported", this.reasoning = e;
  }
};
function Qf(e = {}) {
  if (e.valid === !1) throw new Yy(e);
  return e;
}
function ie(e = "", t = {}, n = {}, r = {}) {
  return Qf(en({
    provider: e,
    baseUrl: t.baseUrl,
    model: t.model,
    maxTokens: r.maxTokens ?? t.maxTokens
  }, n));
}
function Qr(e = {}, t = {}) {
  return Xr(e).temperatureOmitModes.includes(t.mode);
}
function Xy(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function Qy(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? {
    mediaType: t[1],
    data: t[2]
  } : {
    mediaType: "",
    data: ""
  };
}
function Zf(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function Zy(e) {
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
      const r = Qy(n.image_url.url);
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
function jy(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function e_(e) {
  const t = e?.providerPayload?.anthropicContent;
  return Array.isArray(t) && t.length && Zf(t) || null;
}
function t_(e) {
  return Array.isArray(e?.content) && e.content.length ? { anthropicContent: Zf(e.content) || [] } : void 0;
}
function tu(e = {}) {
  return {
    type: "tool_result",
    tool_use_id: e.tool_call_id,
    content: e.content
  };
}
function nu(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    return n ? {
      type: "tool_use",
      id: t.id,
      name: n,
      input: Xy(t.function.arguments)
    } : null;
  }).filter(Boolean);
}
function n_(e) {
  const t = [];
  for (let n = 0; n < e.length; n += 1) {
    const r = e[n];
    if (r.role !== "system") {
      if (r.role === "assistant") {
        const o = e_(r), i = nu(r.tool_calls);
        if (o && i.length) {
          t.push({
            role: "assistant",
            content: o.filter((s) => s?.type !== "tool_use").concat(i)
          });
          continue;
        }
        if (o) {
          t.push({
            role: "assistant",
            content: o
          });
          continue;
        }
      }
      if (r.role === "tool") {
        const o = [tu(r)];
        for (; e[n + 1]?.role === "tool"; )
          n += 1, o.push(tu(e[n]));
        t.push({
          role: "user",
          content: o
        });
        continue;
      }
      if (r.role === "assistant" && Array.isArray(r.tool_calls) && r.tool_calls.length) {
        t.push({
          role: "assistant",
          content: [...r.content ? [{
            type: "text",
            text: r.content
          }] : [], ...nu(r.tool_calls)]
        });
        continue;
      }
      t.push({
        role: r.role,
        content: Zy(r.content)
      });
    }
  }
  return t;
}
function Eo(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function ru(e = "") {
  return String(e || "https://api.anthropic.com").trim().replace(/\/+$/, "").replace(/\/v1$/i, "");
}
function r_(e = "auto", t = []) {
  const n = new Set((Array.isArray(t) ? t : []).map((o) => String(o?.function?.name || "").trim()).filter(Boolean)), r = String(e || "auto").trim() || "auto";
  if (r === "auto") return { type: "auto" };
  if (r === "required") return { type: "any" };
  if (r === "none") return { type: "none" };
  if (!n.has(r)) throw new Error(`Anthropic toolChoice 指定了不存在的工具：${r}`);
  return {
    type: "tool",
    name: r
  };
}
var o_ = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function Qi(e = {}, t = {}) {
  const n = Array.isArray(t.tools) ? t.tools : [], r = n.length ? r_(t.toolChoice, n) : void 0, o = t.reasoning?.output, i = {
    ...on(t.reasoning),
    ...o === "show" || o === "hide" ? { output: o } : {}
  }, s = Xr({
    provider: "anthropic",
    baseUrl: e.baseUrl,
    model: e.model
  }), u = i.mode === "on" && s.profileId === "anthropic-manual" && (r?.type === "any" || r?.type === "tool");
  return {
    toolChoice: r,
    effectiveReasoning: ie("anthropic", e, {
      ...i,
      ...u ? { mode: "off" } : {}
    }, { maxTokens: t.maxTokens }),
    reasoningDisabledForForcedTool: u
  };
}
var i_ = class {
  constructor(e) {
    this.config = e, this.client = new zr({
      apiKey: e.apiKey,
      baseURL: ru(e.baseUrl),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e, t = Qi(this.config, e)) {
    const n = t.effectiveReasoning, r = (Array.isArray(e.tools) ? e.tools : []).map((s) => ({
      name: s.function.name,
      description: s.function.description,
      input_schema: s.function.parameters
    })), o = jy(e), i = {
      model: this.config.model,
      system: o,
      messages: n_(e.messages),
      ...r.length ? {
        tools: r,
        tool_choice: t.toolChoice
      } : {},
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    return !Qr({
      ...this.config,
      provider: "anthropic"
    }, n) && typeof e.temperature == "number" && (i.temperature = e.temperature), n.mode === "off" ? i.thinking = { type: "disabled" } : n.mode === "on" && n.profileId === "anthropic-adaptive" ? (i.thinking = {
      type: "adaptive",
      display: Z(n) ? "summarized" : "omitted"
    }, i.output_config = { effort: n.effort }) : n.mode === "on" && n.profileId === "anthropic-manual" && (i.thinking = {
      type: "enabled",
      budget_tokens: n.budgetTokens,
      display: Z(n) ? "summarized" : "omitted"
    }), i;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", r = ru(this.config.baseUrl), o = t.protocol || Qi(this.config, e), i = t.body || this.buildRequestBody(e, o), s = o.effectiveReasoning;
    return {
      ...Or({
        provider: "anthropic",
        model: this.config.model,
        transport: "anthropic-sdk",
        url: `${r}/v1/messages`,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.config.apiKey || ""
        },
        body: i,
        sdk: n ? "client.messages.stream" : "client.messages.create",
        effectiveConfig: Ot(e, {
          reasoning: s,
          effort: i.output_config?.effort,
          budgetTokens: i.thinking?.budget_tokens,
          controlFields: {
            ...i.thinking ? { thinking: i.thinking } : {},
            ...i.output_config ? { output_config: i.output_config } : {}
          }
        })
      }),
      ...o.reasoningDisabledForForcedTool ? { notices: [o_] } : {}
    };
  }
  async chat(e) {
    const t = Qi(this.config, e), n = t.effectiveReasoning, r = this.buildRequestBody(e, t), o = this.inspectRequest(e, {
      body: r,
      protocol: t
    });
    let i;
    if (typeof e.onStreamProgress == "function") {
      const u = this.client.messages.stream(r, { signal: e.signal }), c = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map();
      let f = "";
      const h = () => Z(n) ? Array.from(c.entries()).sort(([g], [_]) => g.localeCompare(_)).map(([g, _]) => ({
        label: g.startsWith("redacted:") ? "已脱敏思考块" : "思考块",
        text: _
      })).filter((g) => g.text) : [], p = () => Array.from(d.entries()).sort(([g], [_]) => Number(g) - Number(_)).map(([, g]) => ({
        id: g.id || "anthropic-tool-draft",
        name: g.name || "工具调用",
        arguments: g.inputJson || "{}",
        draft: !0
      })).filter((g) => g.name), m = () => {
        const g = p();
        g.length && Eo(e, {
          text: f,
          thoughts: h(),
          toolCalls: g,
          toolCallDraft: !0
        });
      };
      u.on("text", (g, _) => {
        f = _ || "", Eo(e, {
          text: f,
          thoughts: h(),
          ...p().length ? {
            toolCalls: p(),
            toolCallDraft: !0
          } : {}
        });
      }), u.on("thinking", (g, _) => {
        c.set("thinking:0", _ || ""), Eo(e, {
          thoughts: h(),
          ...p().length ? {
            text: f,
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
        g?.type === "redacted_thinking" && (c.set("redacted:0", g.data || ""), Eo(e, {
          thoughts: h(),
          ...p().length ? {
            text: f,
            toolCalls: p(),
            toolCallDraft: !0
          } : {}
        }));
      }), i = await u.finalMessage();
    } else i = await this.client.messages.create(r, { signal: e.signal });
    const s = (i.content || []).filter((u) => u.type === "tool_use" && u.name).map((u, c) => ({
      id: u.id || `anthropic-tool-${c + 1}`,
      name: u.name,
      arguments: JSON.stringify(u.input || {})
    }));
    return {
      text: (i.content || []).filter((u) => u.type === "text").map((u) => u.text || "").join(`
`),
      toolCalls: s,
      thoughts: Z(n) ? (i.content || []).filter((u) => u.type === "thinking" || u.type === "redacted_thinking").map((u) => ({
        label: u.type === "thinking" ? "思考块" : "已脱敏思考块",
        text: u.type === "thinking" ? u.thinking || "" : u.data || ""
      })).filter((u) => u.text) : [],
      finishReason: i.stop_reason || "stop",
      model: i.model || this.config.model,
      provider: "anthropic",
      providerPayload: t_(i),
      requestInspection: o
    };
  }
}, s_ = /* @__PURE__ */ gi(((e, t) => {
  function n(r, o) {
    typeof o == "boolean" && (o = { forever: o }), this._originalTimeouts = JSON.parse(JSON.stringify(r)), this._timeouts = r, this._options = o || {}, this._maxRetryTime = o && o.maxRetryTime || 1 / 0, this._fn = null, this._errors = [], this._attempts = 1, this._operationTimeout = null, this._operationTimeoutCb = null, this._timeout = null, this._operationStart = null, this._timer = null, this._options.forever && (this._cachedTimeouts = this._timeouts.slice(0));
  }
  t.exports = n, n.prototype.reset = function() {
    this._attempts = 1, this._timeouts = this._originalTimeouts.slice(0);
  }, n.prototype.stop = function() {
    this._timeout && clearTimeout(this._timeout), this._timer && clearTimeout(this._timer), this._timeouts = [], this._cachedTimeouts = null;
  }, n.prototype.retry = function(r) {
    if (this._timeout && clearTimeout(this._timeout), !r) return !1;
    var o = (/* @__PURE__ */ new Date()).getTime();
    if (r && o - this._operationStart >= this._maxRetryTime)
      return this._errors.push(r), this._errors.unshift(/* @__PURE__ */ new Error("RetryOperation timeout occurred")), !1;
    this._errors.push(r);
    var i = this._timeouts.shift();
    if (i === void 0) if (this._cachedTimeouts)
      this._errors.splice(0, this._errors.length - 1), i = this._cachedTimeouts.slice(-1);
    else return !1;
    var s = this;
    return this._timer = setTimeout(function() {
      s._attempts++, s._operationTimeoutCb && (s._timeout = setTimeout(function() {
        s._operationTimeoutCb(s._attempts);
      }, s._operationTimeout), s._options.unref && s._timeout.unref()), s._fn(s._attempts);
    }, i), this._options.unref && this._timer.unref(), !0;
  }, n.prototype.attempt = function(r, o) {
    this._fn = r, o && (o.timeout && (this._operationTimeout = o.timeout), o.cb && (this._operationTimeoutCb = o.cb));
    var i = this;
    this._operationTimeoutCb && (this._timeout = setTimeout(function() {
      i._operationTimeoutCb();
    }, i._operationTimeout)), this._operationStart = (/* @__PURE__ */ new Date()).getTime(), this._fn(this._attempts);
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
    for (var r = {}, o = null, i = 0, s = 0; s < this._errors.length; s++) {
      var u = this._errors[s], c = u.message, d = (r[c] || 0) + 1;
      r[c] = d, d >= i && (o = u, i = d);
    }
    return o;
  };
})), a_ = /* @__PURE__ */ gi(((e) => {
  var t = s_();
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
    for (var o in n) r[o] = n[o];
    if (r.minTimeout > r.maxTimeout) throw new Error("minTimeout is greater than maxTimeout");
    for (var i = [], s = 0; s < r.retries; s++) i.push(this.createTimeout(s, r));
    return n && n.forever && !i.length && i.push(this.createTimeout(s, r)), i.sort(function(u, c) {
      return u - c;
    }), i;
  }, e.createTimeout = function(n, r) {
    var o = r.randomize ? Math.random() + 1 : 1, i = Math.round(o * Math.max(r.minTimeout, 1) * Math.pow(r.factor, n));
    return i = Math.min(i, r.maxTimeout), i;
  }, e.wrap = function(n, r, o) {
    if (r instanceof Array && (o = r, r = null), !o) {
      o = [];
      for (var i in n) typeof n[i] == "function" && o.push(i);
    }
    for (var s = 0; s < o.length; s++) {
      var u = o[s], c = n[u];
      n[u] = function(f) {
        var h = e.operation(r), p = Array.prototype.slice.call(arguments, 1), m = p.pop();
        p.push(function(g) {
          h.retry(g) || (g && (arguments[0] = h.mainError()), m.apply(this, arguments));
        }), h.attempt(function() {
          f.apply(n, p);
        });
      }.bind(n, c), n[u].options = r;
    }
  };
})), l_ = /* @__PURE__ */ gi(((e, t) => {
  t.exports = a_();
})), u_ = /* @__PURE__ */ gi(((e, t) => {
  var n = l_(), r = [
    "Failed to fetch",
    "NetworkError when attempting to fetch resource.",
    "The Internet connection appears to be offline.",
    "Network request failed"
  ], o = class extends Error {
    constructor(c) {
      super(), c instanceof Error ? (this.originalError = c, { message: c } = c) : (this.originalError = new Error(c), this.originalError.stack = this.stack), this.name = "AbortError", this.message = c;
    }
  }, i = (c, d, f) => {
    const h = f.retries - (d - 1);
    return c.attemptNumber = d, c.retriesLeft = h, c;
  }, s = (c) => r.includes(c), u = (c, d) => new Promise((f, h) => {
    d = {
      onFailedAttempt: () => {
      },
      retries: 10,
      ...d
    };
    const p = n.operation(d);
    p.attempt(async (m) => {
      try {
        f(await c(m));
      } catch (g) {
        if (!(g instanceof Error)) {
          h(/* @__PURE__ */ new TypeError(`Non-error was thrown: "${g}". You should only throw errors.`));
          return;
        }
        if (g instanceof o)
          p.stop(), h(g.originalError);
        else if (g instanceof TypeError && !s(g.message))
          p.stop(), h(g);
        else {
          i(g, m, d);
          try {
            await d.onFailedAttempt(g);
          } catch (_) {
            h(_);
            return;
          }
          p.retry(g) || h(p.mainError());
        }
      }
    });
  });
  t.exports = u, t.exports.default = u, t.exports.AbortError = o;
})), ou = /* @__PURE__ */ Mg(u_(), 1), c_ = void 0, d_ = void 0;
function f_() {
  return {
    geminiUrl: c_,
    vertexUrl: d_
  };
}
function h_(e, t, n, r) {
  var o, i;
  if (!e?.baseUrl) {
    const s = f_();
    return t ? (o = s.vertexUrl) !== null && o !== void 0 ? o : n : (i = s.geminiUrl) !== null && i !== void 0 ? i : r;
  }
  return e.baseUrl;
}
var wt = class {
};
function L(e, t) {
  return e.replace(/\{([^}]+)\}/g, (n, r) => {
    if (Object.prototype.hasOwnProperty.call(t, r)) {
      const o = t[r];
      return o != null ? String(o) : "";
    } else throw new Error(`Key '${r}' not found in valueMap.`);
  });
}
function l(e, t, n) {
  for (let i = 0; i < t.length - 1; i++) {
    const s = t[i];
    if (s.endsWith("[]")) {
      const u = s.slice(0, -2);
      if (!(u in e)) if (Array.isArray(n)) e[u] = Array.from({ length: n.length }, () => ({}));
      else throw new Error(`Value must be a list given an array path ${s}`);
      if (Array.isArray(e[u])) {
        const c = e[u];
        if (Array.isArray(n)) for (let d = 0; d < c.length; d++) {
          const f = c[d];
          l(f, t.slice(i + 1), n[d]);
        }
        else for (const d of c) l(d, t.slice(i + 1), n);
      }
      return;
    } else if (s.endsWith("[0]")) {
      const u = s.slice(0, -3);
      u in e || (e[u] = [{}]);
      const c = e[u];
      l(c[0], t.slice(i + 1), n);
      return;
    }
    (!e[s] || typeof e[s] != "object") && (e[s] = {}), e = e[s];
  }
  const r = t[t.length - 1], o = e[r];
  if (o !== void 0) {
    if (!n || typeof n == "object" && Object.keys(n).length === 0 || n === o) return;
    if (typeof o == "object" && typeof n == "object" && o !== null && n !== null) Object.assign(o, n);
    else throw new Error(`Cannot set value for an existing key. Key: ${r}`);
  } else r === "_self" && typeof n == "object" && n !== null && !Array.isArray(n) ? Object.assign(e, n) : e[r] = n;
}
function a(e, t, n = void 0) {
  try {
    if (t.length === 1 && t[0] === "_self") return e;
    for (let r = 0; r < t.length; r++) {
      if (typeof e != "object" || e === null) return n;
      const o = t[r];
      if (o.endsWith("[]")) {
        const i = o.slice(0, -2);
        if (i in e) {
          const s = e[i];
          return Array.isArray(s) ? s.map((u) => a(u, t.slice(r + 1), n)) : n;
        } else return n;
      } else e = e[o];
    }
    return e;
  } catch (r) {
    if (r instanceof TypeError) return n;
    throw r;
  }
}
function p_(e, t) {
  for (const [n, r] of Object.entries(t)) {
    const o = n.split("."), i = r.split("."), s = /* @__PURE__ */ new Set();
    let u = -1;
    for (let c = 0; c < o.length; c++) if (o[c] === "*") {
      u = c;
      break;
    }
    if (u !== -1 && i.length > u) for (let c = u; c < i.length; c++) {
      const d = i[c];
      d !== "*" && !d.endsWith("[]") && !d.endsWith("[0]") && s.add(d);
    }
    Cs(e, o, i, 0, s);
  }
}
function Cs(e, t, n, r, o) {
  if (r >= t.length || typeof e != "object" || e === null) return;
  const i = t[r];
  if (i.endsWith("[]")) {
    const s = i.slice(0, -2), u = e;
    if (s in u && Array.isArray(u[s])) for (const c of u[s]) Cs(c, t, n, r + 1, o);
  } else if (i === "*") {
    if (typeof e == "object" && e !== null && !Array.isArray(e)) {
      const s = e, u = Object.keys(s).filter((d) => !d.startsWith("_") && !o.has(d)), c = {};
      for (const d of u) c[d] = s[d];
      for (const [d, f] of Object.entries(c)) {
        const h = [];
        for (const p of n.slice(r)) p === "*" ? h.push(d) : h.push(p);
        l(s, h, f);
      }
      for (const d of u) delete s[d];
    }
  } else {
    const s = e;
    i in s && Cs(s[i], t, n, r + 1, o);
  }
}
function Ca(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function m_(e) {
  const t = {}, n = a(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const r = a(e, ["resourceName"]);
  return r != null && l(t, ["_url", "resourceName"], r), t;
}
function g_(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = a(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = a(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["response", "generateVideoResponse"]);
  return s != null && l(t, ["response"], __(s)), t;
}
function y_(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = a(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = a(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], v_(s)), t;
}
function __(e) {
  const t = {}, n = a(e, ["generatedSamples"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((s) => A_(s))), l(t, ["generatedVideos"], i);
  }
  const r = a(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const o = a(e, ["raiMediaFilteredReasons"]);
  return o != null && l(t, ["raiMediaFilteredReasons"], o), t;
}
function v_(e) {
  const t = {}, n = a(e, ["videos"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((s) => T_(s))), l(t, ["generatedVideos"], i);
  }
  const r = a(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const o = a(e, ["raiMediaFilteredReasons"]);
  return o != null && l(t, ["raiMediaFilteredReasons"], o), t;
}
function A_(e) {
  const t = {}, n = a(e, ["video"]);
  return n != null && l(t, ["video"], b_(n)), t;
}
function T_(e) {
  const t = {}, n = a(e, ["_self"]);
  return n != null && l(t, ["video"], P_(n)), t;
}
function S_(e) {
  const t = {}, n = a(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function E_(e) {
  const t = {}, n = a(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function C_(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = a(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = a(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], w_(s)), t;
}
function w_(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = a(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function jf(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = a(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = a(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], I_(s)), t;
}
function I_(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = a(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function b_(e) {
  const t = {}, n = a(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const r = a(e, ["encodedVideo"]);
  r != null && l(t, ["videoBytes"], Ca(r));
  const o = a(e, ["encoding"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function P_(e) {
  const t = {}, n = a(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const r = a(e, ["bytesBase64Encoded"]);
  r != null && l(t, ["videoBytes"], Ca(r));
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
var iu;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(iu || (iu = {}));
var su;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(su || (su = {}));
var au;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(au || (au = {}));
var Ut;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(Ut || (Ut = {}));
var lu;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(lu || (lu = {}));
var uu;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})(uu || (uu = {}));
var cu;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})(cu || (cu = {}));
var du;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(du || (du = {}));
var fu;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(fu || (fu = {}));
var hu;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})(hu || (hu = {}));
var pu;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})(pu || (pu = {}));
var bn;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(bn || (bn = {}));
var Pn;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Pn || (Pn = {}));
var mu;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(mu || (mu = {}));
var gu;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})(gu || (gu = {}));
var yu;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(yu || (yu = {}));
var _u;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(_u || (_u = {}));
var vu;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(vu || (vu = {}));
var Au;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})(Au || (Au = {}));
var Tu;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Tu || (Tu = {}));
var Su;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(Su || (Su = {}));
var Eu;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(Eu || (Eu = {}));
var Cu;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(Cu || (Cu = {}));
var wu;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(wu || (wu = {}));
var jo;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(jo || (jo = {}));
var Iu;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(Iu || (Iu = {}));
var bu;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(bu || (bu = {}));
var Pu;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(Pu || (Pu = {}));
var Ru;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(Ru || (Ru = {}));
var ws;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(ws || (ws = {}));
var xu;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})(xu || (xu = {}));
var Mu;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})(Mu || (Mu = {}));
var Nu;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(Nu || (Nu = {}));
var ku;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(ku || (ku = {}));
var Du;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(Du || (Du = {}));
var $u;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})($u || ($u = {}));
var Lu;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})(Lu || (Lu = {}));
var Is;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(Is || (Is = {}));
var Uu;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})(Uu || (Uu = {}));
var Fu;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(Fu || (Fu = {}));
var ei;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(ei || (ei = {}));
var Ou;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(Ou || (Ou = {}));
var qu;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(qu || (qu = {}));
var Bu;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(Bu || (Bu = {}));
var Gu;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(Gu || (Gu = {}));
var Hu;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(Hu || (Hu = {}));
var Vu;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(Vu || (Vu = {}));
var Ju;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(Ju || (Ju = {}));
var Ku;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(Ku || (Ku = {}));
var Wu;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})(Wu || (Wu = {}));
var zu;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(zu || (zu = {}));
var Yu;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})(Yu || (Yu = {}));
var Xu;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(Xu || (Xu = {}));
var Qu;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(Qu || (Qu = {}));
var Zu;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(Zu || (Zu = {}));
var ju;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(ju || (ju = {}));
var ec;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(ec || (ec = {}));
var tc;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(tc || (tc = {}));
var nc;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(nc || (nc = {}));
var rc;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(rc || (rc = {}));
var oc;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(oc || (oc = {}));
var ic;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(ic || (ic = {}));
var sc;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(sc || (sc = {}));
var ac;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(ac || (ac = {}));
var Rn;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(Rn || (Rn = {}));
var bs = class {
  constructor(e) {
    const t = {};
    for (const n of e.headers.entries()) t[n[0]] = n[1];
    this.headers = t, this.responseInternal = e;
  }
  json() {
    return this.responseInternal.json();
  }
}, ur = class {
  get text() {
    var e, t, n, r, o, i, s, u;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning text from the first one.");
    let c = "", d = !1;
    const f = [];
    for (const h of (u = (s = (i = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || i === void 0 ? void 0 : i.content) === null || s === void 0 ? void 0 : s.parts) !== null && u !== void 0 ? u : []) {
      for (const [p, m] of Object.entries(h)) p !== "text" && p !== "thought" && p !== "thoughtSignature" && (m !== null || m !== void 0) && f.push(p);
      if (typeof h.text == "string") {
        if (typeof h.thought == "boolean" && h.thought) continue;
        d = !0, c += h.text;
      }
    }
    return f.length > 0 && console.warn(`there are non-text parts ${f} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), d ? c : void 0;
  }
  get data() {
    var e, t, n, r, o, i, s, u;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning data from the first one.");
    let c = "";
    const d = [];
    for (const f of (u = (s = (i = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || i === void 0 ? void 0 : i.content) === null || s === void 0 ? void 0 : s.parts) !== null && u !== void 0 ? u : []) {
      for (const [h, p] of Object.entries(f)) h !== "inlineData" && (p !== null || p !== void 0) && d.push(h);
      f.inlineData && typeof f.inlineData.data == "string" && (c += atob(f.inlineData.data));
    }
    return d.length > 0 && console.warn(`there are non-data parts ${d} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), c.length > 0 ? btoa(c) : void 0;
  }
  get functionCalls() {
    var e, t, n, r, o, i, s, u;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning function calls from the first one.");
    const c = (u = (s = (i = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || i === void 0 ? void 0 : i.content) === null || s === void 0 ? void 0 : s.parts) === null || u === void 0 ? void 0 : u.filter((d) => d.functionCall).map((d) => d.functionCall).filter((d) => d !== void 0);
    if (c?.length !== 0)
      return c;
  }
  get executableCode() {
    var e, t, n, r, o, i, s, u, c;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning executable code from the first one.");
    const d = (u = (s = (i = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || i === void 0 ? void 0 : i.content) === null || s === void 0 ? void 0 : s.parts) === null || u === void 0 ? void 0 : u.filter((f) => f.executableCode).map((f) => f.executableCode).filter((f) => f !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.code;
  }
  get codeExecutionResult() {
    var e, t, n, r, o, i, s, u, c;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning code execution result from the first one.");
    const d = (u = (s = (i = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || i === void 0 ? void 0 : i.content) === null || s === void 0 ? void 0 : s.parts) === null || u === void 0 ? void 0 : u.filter((f) => f.codeExecutionResult).map((f) => f.codeExecutionResult).filter((f) => f !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.output;
  }
}, lc = class {
}, uc = class {
}, R_ = class {
}, x_ = class {
}, M_ = class {
}, N_ = class {
}, cc = class {
}, dc = class {
}, fc = class {
}, k_ = class {
}, hc = class eh {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new eh();
    let o;
    const i = t;
    return n ? o = y_(i) : o = g_(i), Object.assign(r, o), r;
  }
}, pc = class {
}, mc = class {
}, gc = class {
}, yc = class {
}, D_ = class {
}, $_ = class {
}, L_ = class {
}, U_ = class th {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new th(), o = C_(t);
    return Object.assign(r, o), r;
  }
}, F_ = class {
}, O_ = class {
}, q_ = class {
}, B_ = class {
}, _c = class {
}, G_ = class {
  get text() {
    var e, t, n;
    let r = "", o = !1;
    const i = [];
    for (const s of (n = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && n !== void 0 ? n : []) {
      for (const [u, c] of Object.entries(s)) u !== "text" && u !== "thought" && c !== null && i.push(u);
      if (typeof s.text == "string") {
        if (typeof s.thought == "boolean" && s.thought) continue;
        o = !0, r += s.text;
      }
    }
    return i.length > 0 && console.warn(`there are non-text parts ${i} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), o ? r : void 0;
  }
  get data() {
    var e, t, n;
    let r = "";
    const o = [];
    for (const i of (n = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && n !== void 0 ? n : []) {
      for (const [s, u] of Object.entries(i)) s !== "inlineData" && u !== null && o.push(s);
      i.inlineData && typeof i.inlineData.data == "string" && (r += atob(i.inlineData.data));
    }
    return o.length > 0 && console.warn(`there are non-data parts ${o} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), r.length > 0 ? btoa(r) : void 0;
  }
}, H_ = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, V_ = class nh {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new nh(), o = jf(t);
    return Object.assign(r, o), r;
  }
};
function Y(e, t) {
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
function rh(e, t) {
  const n = Y(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function oh(e) {
  return Array.isArray(e) ? e.map((t) => ti(t)) : [ti(e)];
}
function ti(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function ih(e) {
  const t = ti(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function sh(e) {
  const t = ti(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function vc(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function ah(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => vc(t)) : [vc(e)];
}
function Ps(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function Ac(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function Tc(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function Te(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return Ps(e) ? e : {
    role: "user",
    parts: ah(e)
  };
}
function wa(e, t) {
  if (!t) return [];
  if (e.isVertexAI() && Array.isArray(t)) return t.flatMap((n) => {
    const r = Te(n);
    return r.parts && r.parts.length > 0 && r.parts[0].text !== void 0 ? [r.parts[0].text] : [];
  });
  if (e.isVertexAI()) {
    const n = Te(t);
    return n.parts && n.parts.length > 0 && n.parts[0].text !== void 0 ? [n.parts[0].text] : [];
  }
  return Array.isArray(t) ? t.map((n) => Te(n)) : [Te(t)];
}
function De(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("contents are required");
  if (!Array.isArray(e)) {
    if (Ac(e) || Tc(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [Te(e)];
  }
  const t = [], n = [], r = Ps(e[0]);
  for (const o of e) {
    const i = Ps(o);
    if (i != r) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (i) t.push(o);
    else {
      if (Ac(o) || Tc(o)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(o);
    }
  }
  return r || t.push({
    role: "user",
    parts: ah(n)
  }), t;
}
function J_(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((r) => r !== "null");
  if (n.length === 1) t.type = Object.values(Ut).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : Ut.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const r of n) t.anyOf.push({ type: Object.values(Ut).includes(r.toUpperCase()) ? r.toUpperCase() : Ut.TYPE_UNSPECIFIED });
  }
}
function $n(e) {
  const t = {}, n = ["items"], r = ["anyOf"], o = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const i = e.anyOf;
  i != null && i.length == 2 && (i[0].type === "null" ? (t.nullable = !0, e = i[1]) : i[1].type === "null" && (t.nullable = !0, e = i[0])), e.type instanceof Array && J_(e.type, t);
  for (const [s, u] of Object.entries(e))
    if (u != null)
      if (s == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(Ut).includes(u.toUpperCase()) ? u.toUpperCase() : Ut.TYPE_UNSPECIFIED;
      } else if (n.includes(s)) t[s] = $n(u);
      else if (r.includes(s)) {
        const c = [];
        for (const d of u) {
          if (d.type == "null") {
            t.nullable = !0;
            continue;
          }
          c.push($n(d));
        }
        t[s] = c;
      } else if (o.includes(s)) {
        const c = {};
        for (const [d, f] of Object.entries(u)) c[d] = $n(f);
        t[s] = c;
      } else {
        if (s === "additionalProperties") continue;
        t[s] = u;
      }
  return t;
}
function Ia(e) {
  return $n(e);
}
function ba(e) {
  if (typeof e == "object") return e;
  if (typeof e == "string") return { voiceConfig: { prebuiltVoiceConfig: { voiceName: e } } };
  throw new Error(`Unsupported speechConfig type: ${typeof e}`);
}
function Pa(e) {
  if ("multiSpeakerVoiceConfig" in e) throw new Error("multiSpeakerVoiceConfig is not supported in the live API.");
  return e;
}
function Bn(e) {
  if (e.functionDeclarations) for (const t of e.functionDeclarations)
    t.parameters && (Object.keys(t.parameters).includes("$schema") ? t.parametersJsonSchema || (t.parametersJsonSchema = t.parameters, delete t.parameters) : t.parameters = $n(t.parameters)), t.response && (Object.keys(t.response).includes("$schema") ? t.responseJsonSchema || (t.responseJsonSchema = t.response, delete t.response) : t.response = $n(t.response));
  return e;
}
function Gn(e) {
  if (e == null) throw new Error("tools is required");
  if (!Array.isArray(e)) throw new Error("tools is required and must be an array of Tools");
  const t = [];
  for (const n of e) t.push(n);
  return t;
}
function K_(e, t, n, r = 1) {
  const o = !t.startsWith(`${n}/`) && t.split("/").length === r;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : o ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : o ? `${n}/${t}` : t;
}
function It(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return K_(e, t, "cachedContents");
}
function lh(e) {
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
function Bt(e) {
  return Ca(e);
}
function W_(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function z_(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function Y_(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function uh(e) {
  var t;
  let n;
  if (W_(e) && (n = e.name), !(Y_(e) && (n = e.uri, n === void 0)) && !(z_(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const r = n.split("files/")[1].match(/[a-z0-9]+/);
      if (r === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = r[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function ch(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function dh(e) {
  for (const t of [
    "models",
    "tunedModels",
    "publisherModels"
  ]) if (X_(e, t)) return e[t];
  return [];
}
function X_(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function Q_(e, t = {}) {
  const n = e, r = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (r.responseJsonSchema = n.outputSchema), t.behavior && (r.behavior = t.behavior), { functionDeclarations: [r] };
}
function Z_(e, t = {}) {
  const n = [], r = /* @__PURE__ */ new Set();
  for (const o of e) {
    const i = o.name;
    if (r.has(i)) throw new Error(`Duplicate function name ${i} found in MCP tools. Please ensure function names are unique.`);
    r.add(i);
    const s = Q_(o, t);
    s.functionDeclarations && n.push(...s.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function fh(e, t) {
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
  const r = [n.gcsUri, n.bigqueryUri].filter(Boolean).length, o = [n.inlinedRequests, n.fileName].filter(Boolean).length;
  if (e.isVertexAI()) {
    if (o > 0 || r !== 1) throw new Error("Exactly one of `gcsUri` or `bigqueryUri` must be set for Vertex AI.");
  } else if (r > 0 || o !== 1) throw new Error("Exactly one of `inlinedRequests`, `fileName`, must be set for Gemini API.");
  return n;
}
function j_(e) {
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
function hh(e) {
  if (typeof e != "object" || e === null) return {};
  const t = e, n = t.inlinedResponses;
  if (typeof n != "object" || n === null) return e;
  const r = n.inlinedResponses;
  if (!Array.isArray(r) || r.length === 0) return e;
  let o = !1;
  for (const i of r) {
    if (typeof i != "object" || i === null) continue;
    const s = i.response;
    if (!(typeof s != "object" || s === null) && s.embedding !== void 0) {
      o = !0;
      break;
    }
  }
  return o && (t.inlinedEmbedContentResponses = t.inlinedResponses, delete t.inlinedResponses), e;
}
function Hn(e, t) {
  const n = t;
  if (!e.isVertexAI()) {
    if (/batches\/[^/]+$/.test(n)) return n.split("/").pop();
    throw new Error(`Invalid batch job name: ${n}.`);
  }
  if (/^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/.test(n)) return n.split("/").pop();
  if (/^\d+$/.test(n)) return n;
  throw new Error(`Invalid batch job name: ${n}.`);
}
function ph(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function ev(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function tv(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function nv(e) {
  const t = {}, n = a(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const r = a(e, ["inlinedResponses", "inlinedResponses"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => Lv(s))), l(t, ["inlinedResponses"], i);
  }
  const o = a(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => s)), l(t, ["inlinedEmbedContentResponses"], i);
  }
  return t;
}
function rv(e) {
  const t = {}, n = a(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const r = a(e, ["gcsDestination", "outputUriPrefix"]);
  r != null && l(t, ["gcsUri"], r);
  const o = a(e, ["bigqueryDestination", "outputUri"]);
  return o != null && l(t, ["bigqueryUri"], o), t;
}
function ov(e) {
  const t = {}, n = a(e, ["format"]);
  n != null && l(t, ["predictionsFormat"], n);
  const r = a(e, ["gcsUri"]);
  r != null && l(t, ["gcsDestination", "outputUriPrefix"], r);
  const o = a(e, ["bigqueryUri"]);
  if (o != null && l(t, ["bigqueryDestination", "outputUri"], o), a(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (a(e, ["inlinedResponses"]) !== void 0) throw new Error("inlinedResponses parameter is not supported in Vertex AI.");
  if (a(e, ["inlinedEmbedContentResponses"]) !== void 0) throw new Error("inlinedEmbedContentResponses parameter is not supported in Vertex AI.");
  return t;
}
function qo(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = a(e, ["metadata", "displayName"]);
  r != null && l(t, ["displayName"], r);
  const o = a(e, ["metadata", "state"]);
  o != null && l(t, ["state"], ph(o));
  const i = a(e, ["metadata", "createTime"]);
  i != null && l(t, ["createTime"], i);
  const s = a(e, ["metadata", "endTime"]);
  s != null && l(t, ["endTime"], s);
  const u = a(e, ["metadata", "updateTime"]);
  u != null && l(t, ["updateTime"], u);
  const c = a(e, ["metadata", "model"]);
  c != null && l(t, ["model"], c);
  const d = a(e, ["metadata", "output"]);
  return d != null && l(t, ["dest"], nv(hh(d))), t;
}
function Rs(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = a(e, ["displayName"]);
  r != null && l(t, ["displayName"], r);
  const o = a(e, ["state"]);
  o != null && l(t, ["state"], ph(o));
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["createTime"]);
  s != null && l(t, ["createTime"], s);
  const u = a(e, ["startTime"]);
  u != null && l(t, ["startTime"], u);
  const c = a(e, ["endTime"]);
  c != null && l(t, ["endTime"], c);
  const d = a(e, ["updateTime"]);
  d != null && l(t, ["updateTime"], d);
  const f = a(e, ["model"]);
  f != null && l(t, ["model"], f);
  const h = a(e, ["inputConfig"]);
  h != null && l(t, ["src"], iv(h));
  const p = a(e, ["outputConfig"]);
  p != null && l(t, ["dest"], rv(hh(p)));
  const m = a(e, ["completionStats"]);
  return m != null && l(t, ["completionStats"], m), t;
}
function iv(e) {
  const t = {}, n = a(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const r = a(e, ["gcsSource", "uris"]);
  r != null && l(t, ["gcsUri"], r);
  const o = a(e, ["bigquerySource", "inputUri"]);
  return o != null && l(t, ["bigqueryUri"], o), t;
}
function sv(e, t) {
  const n = {};
  if (a(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (a(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (a(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const r = a(t, ["fileName"]);
  r != null && l(n, ["fileName"], r);
  const o = a(t, ["inlinedRequests"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => $v(e, s))), l(n, ["requests", "requests"], i);
  }
  return n;
}
function av(e) {
  const t = {}, n = a(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const r = a(e, ["gcsUri"]);
  r != null && l(t, ["gcsSource", "uris"], r);
  const o = a(e, ["bigqueryUri"]);
  if (o != null && l(t, ["bigquerySource", "inputUri"], o), a(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (a(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function lv(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function uv(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Hn(e, r)), n;
}
function cv(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Hn(e, r)), n;
}
function dv(e) {
  const t = {}, n = a(e, ["content"]);
  n != null && l(t, ["content"], n);
  const r = a(e, ["citationMetadata"]);
  r != null && l(t, ["citationMetadata"], fv(r));
  const o = a(e, ["tokenCount"]);
  o != null && l(t, ["tokenCount"], o);
  const i = a(e, ["finishReason"]);
  i != null && l(t, ["finishReason"], i);
  const s = a(e, ["groundingMetadata"]);
  s != null && l(t, ["groundingMetadata"], s);
  const u = a(e, ["avgLogprobs"]);
  u != null && l(t, ["avgLogprobs"], u);
  const c = a(e, ["index"]);
  c != null && l(t, ["index"], c);
  const d = a(e, ["logprobsResult"]);
  d != null && l(t, ["logprobsResult"], d);
  const f = a(e, ["safetyRatings"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), l(t, ["safetyRatings"], p);
  }
  const h = a(e, ["urlContextMetadata"]);
  return h != null && l(t, ["urlContextMetadata"], h), t;
}
function fv(e) {
  const t = {}, n = a(e, ["citationSources"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((o) => o)), l(t, ["citations"], r);
  }
  return t;
}
function mh(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => Hv(i))), l(t, ["parts"], o);
  }
  const r = a(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function hv(e, t) {
  const n = {}, r = a(e, ["displayName"]);
  if (t !== void 0 && r != null && l(t, ["batch", "displayName"], r), a(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const o = a(e, ["webhookConfig"]);
  return t !== void 0 && o != null && l(t, ["batch", "webhookConfig"], o), n;
}
function pv(e, t) {
  const n = {}, r = a(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const o = a(e, ["dest"]);
  if (t !== void 0 && o != null && l(t, ["outputConfig"], ov(j_(o))), a(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function Sc(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["_url", "model"], Y(e, r));
  const o = a(t, ["src"]);
  o != null && l(n, ["batch", "inputConfig"], sv(e, fh(e, o)));
  const i = a(t, ["config"]);
  return i != null && hv(i, n), n;
}
function mv(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["model"], Y(e, r));
  const o = a(t, ["src"]);
  o != null && l(n, ["inputConfig"], av(fh(e, o)));
  const i = a(t, ["config"]);
  return i != null && pv(i, n), n;
}
function gv(e, t) {
  const n = {}, r = a(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["batch", "displayName"], r), n;
}
function yv(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["_url", "model"], Y(e, r));
  const o = a(t, ["src"]);
  o != null && l(n, ["batch", "inputConfig"], Cv(e, o));
  const i = a(t, ["config"]);
  return i != null && gv(i, n), n;
}
function _v(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Hn(e, r)), n;
}
function vv(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Hn(e, r)), n;
}
function Av(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = a(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = a(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function Tv(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = a(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = a(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function Sv(e, t) {
  const n = {}, r = a(t, ["contents"]);
  if (r != null) {
    let i = wa(e, r);
    Array.isArray(i) && (i = i.map((s) => s)), l(n, [
      "requests[]",
      "request",
      "content"
    ], i);
  }
  const o = a(t, ["config"]);
  return o != null && (l(n, ["_self"], Ev(o, n)), p_(n, { "requests[].*": "requests[].request.*" })), n;
}
function Ev(e, t) {
  const n = {}, r = a(e, ["taskType"]);
  t !== void 0 && r != null && l(t, ["requests[]", "taskType"], r);
  const o = a(e, ["title"]);
  t !== void 0 && o != null && l(t, ["requests[]", "title"], o);
  const i = a(e, ["outputDimensionality"]);
  if (t !== void 0 && i != null && l(t, ["requests[]", "outputDimensionality"], i), a(e, ["mimeType"]) !== void 0) throw new Error("mimeType parameter is not supported in Gemini API.");
  if (a(e, ["autoTruncate"]) !== void 0) throw new Error("autoTruncate parameter is not supported in Gemini API.");
  if (a(e, ["documentOcr"]) !== void 0) throw new Error("documentOcr parameter is not supported in Gemini API.");
  if (a(e, ["audioTrackExtraction"]) !== void 0) throw new Error("audioTrackExtraction parameter is not supported in Gemini API.");
  return n;
}
function Cv(e, t) {
  const n = {}, r = a(t, ["fileName"]);
  r != null && l(n, ["file_name"], r);
  const o = a(t, ["inlinedRequests"]);
  return o != null && l(n, ["requests"], Sv(e, o)), n;
}
function wv(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function Iv(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = a(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = a(e, ["name"]);
  if (o != null && l(t, ["name"], o), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function bv(e) {
  const t = {}, n = a(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = a(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), a(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function Pv(e, t, n) {
  const r = {}, o = a(t, ["systemInstruction"]);
  n !== void 0 && o != null && l(n, ["systemInstruction"], mh(Te(o)));
  const i = a(t, ["temperature"]);
  i != null && l(r, ["temperature"], i);
  const s = a(t, ["topP"]);
  s != null && l(r, ["topP"], s);
  const u = a(t, ["topK"]);
  u != null && l(r, ["topK"], u);
  const c = a(t, ["candidateCount"]);
  c != null && l(r, ["candidateCount"], c);
  const d = a(t, ["maxOutputTokens"]);
  d != null && l(r, ["maxOutputTokens"], d);
  const f = a(t, ["stopSequences"]);
  f != null && l(r, ["stopSequences"], f);
  const h = a(t, ["responseLogprobs"]);
  h != null && l(r, ["responseLogprobs"], h);
  const p = a(t, ["logprobs"]);
  p != null && l(r, ["logprobs"], p);
  const m = a(t, ["presencePenalty"]);
  m != null && l(r, ["presencePenalty"], m);
  const g = a(t, ["frequencyPenalty"]);
  g != null && l(r, ["frequencyPenalty"], g);
  const _ = a(t, ["seed"]);
  _ != null && l(r, ["seed"], _);
  const v = a(t, ["responseMimeType"]);
  v != null && l(r, ["responseMimeType"], v);
  const C = a(t, ["responseSchema"]);
  C != null && l(r, ["responseSchema"], Ia(C));
  const b = a(t, ["responseJsonSchema"]);
  if (b != null && l(r, ["responseJsonSchema"], b), a(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (a(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const P = a(t, ["safetySettings"]);
  if (n !== void 0 && P != null) {
    let X = P;
    Array.isArray(X) && (X = X.map((Q) => Vv(Q))), l(n, ["safetySettings"], X);
  }
  const R = a(t, ["tools"]);
  if (n !== void 0 && R != null) {
    let X = Gn(R);
    Array.isArray(X) && (X = X.map((Q) => Kv(Bn(Q)))), l(n, ["tools"], X);
  }
  const D = a(t, ["toolConfig"]);
  if (n !== void 0 && D != null && l(n, ["toolConfig"], Jv(D)), a(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const A = a(t, ["cachedContent"]);
  n !== void 0 && A != null && l(n, ["cachedContent"], It(e, A));
  const U = a(t, ["responseModalities"]);
  U != null && l(r, ["responseModalities"], U);
  const x = a(t, ["mediaResolution"]);
  x != null && l(r, ["mediaResolution"], x);
  const $ = a(t, ["speechConfig"]);
  if ($ != null && l(r, ["speechConfig"], ba($)), a(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const H = a(t, ["thinkingConfig"]);
  H != null && l(r, ["thinkingConfig"], H);
  const z = a(t, ["imageConfig"]);
  z != null && l(r, ["imageConfig"], Dv(z));
  const ge = a(t, ["enableEnhancedCivicAnswers"]);
  if (ge != null && l(r, ["enableEnhancedCivicAnswers"], ge), a(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const se = a(t, ["serviceTier"]);
  return n !== void 0 && se != null && l(n, ["serviceTier"], se), r;
}
function Rv(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["candidates"]);
  if (r != null) {
    let d = r;
    Array.isArray(d) && (d = d.map((f) => dv(f))), l(t, ["candidates"], d);
  }
  const o = a(e, ["modelVersion"]);
  o != null && l(t, ["modelVersion"], o);
  const i = a(e, ["promptFeedback"]);
  i != null && l(t, ["promptFeedback"], i);
  const s = a(e, ["responseId"]);
  s != null && l(t, ["responseId"], s);
  const u = a(e, ["usageMetadata"]);
  u != null && l(t, ["usageMetadata"], u);
  const c = a(e, ["modelStatus"]);
  return c != null && l(t, ["modelStatus"], c), t;
}
function xv(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Hn(e, r)), n;
}
function Mv(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Hn(e, r)), n;
}
function Nv(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], tv(n));
  const r = a(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function kv(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = a(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function Dv(e) {
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
function $v(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["request", "model"], Y(e, r));
  const o = a(t, ["contents"]);
  if (o != null) {
    let u = De(o);
    Array.isArray(u) && (u = u.map((c) => mh(c))), l(n, ["request", "contents"], u);
  }
  const i = a(t, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const s = a(t, ["config"]);
  return s != null && l(n, ["request", "generationConfig"], Pv(e, s, a(n, ["request"], {}))), n;
}
function Lv(e) {
  const t = {}, n = a(e, ["response"]);
  n != null && l(t, ["response"], Rv(n));
  const r = a(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = a(e, ["error"]);
  return o != null && l(t, ["error"], o), t;
}
function Uv(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = a(e, ["pageToken"]);
  if (t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), a(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function Fv(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = a(e, ["pageToken"]);
  t !== void 0 && o != null && l(t, ["_query", "pageToken"], o);
  const i = a(e, ["filter"]);
  return t !== void 0 && i != null && l(t, ["_query", "filter"], i), n;
}
function Ov(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && Uv(n, t), t;
}
function qv(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && Fv(n, t), t;
}
function Bv(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = a(e, ["operations"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => qo(s))), l(t, ["batchJobs"], i);
  }
  return t;
}
function Gv(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = a(e, ["batchPredictionJobs"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => Rs(s))), l(t, ["batchJobs"], i);
  }
  return t;
}
function Hv(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = a(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = a(e, ["fileData"]);
  i != null && l(t, ["fileData"], wv(i));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], Iv(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], lv(c));
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const f = a(e, ["thought"]);
  f != null && l(t, ["thought"], f);
  const h = a(e, ["thoughtSignature"]);
  h != null && l(t, ["thoughtSignature"], h);
  const p = a(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = a(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = a(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = a(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function Vv(e) {
  const t = {}, n = a(e, ["category"]);
  if (n != null && l(t, ["category"], n), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = a(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function Jv(e) {
  const t = {}, n = a(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = a(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], bv(r));
  const o = a(e, ["includeServerSideToolInvocations"]);
  return o != null && l(t, ["includeServerSideToolInvocations"], o), t;
}
function Kv(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = a(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = a(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], kv(o));
  const i = a(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], Nv(i));
  const s = a(e, ["codeExecution"]);
  if (s != null && l(t, ["codeExecution"], s), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = a(e, ["functionDeclarations"]);
  if (u != null) {
    let h = u;
    Array.isArray(h) && (h = h.map((p) => p)), l(t, ["functionDeclarations"], h);
  }
  const c = a(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = a(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const f = a(e, ["mcpServers"]);
  if (f != null) {
    let h = f;
    Array.isArray(h) && (h = h.map((p) => p)), l(t, ["mcpServers"], h);
  }
  return t;
}
var Ct;
(function(e) {
  e.PAGED_ITEM_BATCH_JOBS = "batchJobs", e.PAGED_ITEM_MODELS = "models", e.PAGED_ITEM_TUNING_JOBS = "tuningJobs", e.PAGED_ITEM_FILES = "files", e.PAGED_ITEM_CACHED_CONTENTS = "cachedContents", e.PAGED_ITEM_FILE_SEARCH_STORES = "fileSearchStores", e.PAGED_ITEM_DOCUMENTS = "documents";
})(Ct || (Ct = {}));
var ln = class {
  constructor(e, t, n, r) {
    this.pageInternal = [], this.paramsInternal = {}, this.requestInternal = t, this.init(e, n, r);
  }
  init(e, t, n) {
    var r, o;
    this.nameInternal = e, this.pageInternal = t[this.nameInternal] || [], this.sdkHttpResponseInternal = t?.sdkHttpResponse, this.idxInternal = 0;
    let i = { config: {} };
    !n || Object.keys(n).length === 0 ? i = { config: {} } : typeof n == "object" ? i = Object.assign({}, n) : i = n, i.config && (i.config.pageToken = t.nextPageToken), this.paramsInternal = i, this.pageInternalSize = (o = (r = i.config) === null || r === void 0 ? void 0 : r.pageSize) !== null && o !== void 0 ? o : this.pageInternal.length;
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
}, Wv = class extends wt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new ln(Ct.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = Sc(this.apiClient, e), n = t._url, r = L("{model}:batchGenerateContent", n), o = t.batch.inputConfig.requests, i = o.requests, s = [];
    for (const u of i) {
      const c = Object.assign({}, u);
      if (c.systemInstruction) {
        const d = c.systemInstruction;
        delete c.systemInstruction;
        const f = c.request;
        f.systemInstruction = d, c.request = f;
      }
      s.push(c);
    }
    return o.requests = s, delete t.config, delete t._url, delete t._query, {
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
      const o = this.getGcsUri(e), i = this.getBigqueryUri(e);
      if (o) o.endsWith(".jsonl") ? n.dest = `${o.slice(0, -6)}/dest` : n.dest = `${o}_dest_${r}`;
      else if (i) n.dest = `${i}_dest_${r}`;
      else throw new Error("Unsupported source for Vertex AI: No GCS or BigQuery URI found.");
    }
    return n;
  }
  async createInternal(e) {
    var t, n, r, o;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = mv(this.apiClient, e);
      return s = L("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Rs(d));
    } else {
      const c = Sc(this.apiClient, e);
      return s = L("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => qo(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = yv(this.apiClient, e);
      return o = L("{model}:asyncBatchEmbedContent", s._url), i = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => qo(u));
    }
  }
  async get(e) {
    var t, n, r, o;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Mv(this.apiClient, e);
      return s = L("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Rs(d));
    } else {
      const c = xv(this.apiClient, e);
      return s = L("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => qo(d));
    }
  }
  async cancel(e) {
    var t, n, r, o;
    let i = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const u = cv(this.apiClient, e);
      i = L("batchPredictionJobs/{name}:cancel", u._url), s = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = uv(this.apiClient, e);
      i = L("batches/{name}:cancel", u._url), s = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = qv(e);
      return s = L("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = Gv(d), h = new _c();
        return Object.assign(h, f), h;
      });
    } else {
      const c = Ov(e);
      return s = L("batches", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = Bv(d), h = new _c();
        return Object.assign(h, f), h;
      });
    }
  }
  async delete(e) {
    var t, n, r, o;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = vv(this.apiClient, e);
      return s = L("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => Tv(d));
    } else {
      const c = _v(this.apiClient, e);
      return s = L("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => Av(d));
    }
  }
};
function zv(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Yv(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function Ec(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => _A(i))), l(t, ["parts"], o);
  }
  const r = a(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function Cc(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => vA(i))), l(t, ["parts"], o);
  }
  const r = a(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function Xv(e, t) {
  const n = {}, r = a(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = a(e, ["expireTime"]);
  t !== void 0 && o != null && l(t, ["expireTime"], o);
  const i = a(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const s = a(e, ["contents"]);
  if (t !== void 0 && s != null) {
    let f = De(s);
    Array.isArray(f) && (f = f.map((h) => Ec(h))), l(t, ["contents"], f);
  }
  const u = a(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Ec(Te(u)));
  const c = a(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((h) => SA(h))), l(t, ["tools"], f);
  }
  const d = a(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], AA(d)), a(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function Qv(e, t) {
  const n = {}, r = a(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = a(e, ["expireTime"]);
  t !== void 0 && o != null && l(t, ["expireTime"], o);
  const i = a(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const s = a(e, ["contents"]);
  if (t !== void 0 && s != null) {
    let h = De(s);
    Array.isArray(h) && (h = h.map((p) => Cc(p))), l(t, ["contents"], h);
  }
  const u = a(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Cc(Te(u)));
  const c = a(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((p) => EA(p))), l(t, ["tools"], h);
  }
  const d = a(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], TA(d));
  const f = a(e, ["kmsKeyName"]);
  return t !== void 0 && f != null && l(t, ["encryption_spec", "kmsKeyName"], f), n;
}
function Zv(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["model"], rh(e, r));
  const o = a(t, ["config"]);
  return o != null && Xv(o, n), n;
}
function jv(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["model"], rh(e, r));
  const o = a(t, ["config"]);
  return o != null && Qv(o, n), n;
}
function eA(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], It(e, r)), n;
}
function tA(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], It(e, r)), n;
}
function nA(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function rA(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function oA(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function iA(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = a(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = a(e, ["name"]);
  if (o != null && l(t, ["name"], o), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function sA(e) {
  const t = {}, n = a(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = a(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), a(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function aA(e) {
  const t = {}, n = a(e, ["description"]);
  n != null && l(t, ["description"], n);
  const r = a(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = a(e, ["parameters"]);
  o != null && l(t, ["parameters"], o);
  const i = a(e, ["parametersJsonSchema"]);
  i != null && l(t, ["parametersJsonSchema"], i);
  const s = a(e, ["response"]);
  s != null && l(t, ["response"], s);
  const u = a(e, ["responseJsonSchema"]);
  if (u != null && l(t, ["responseJsonSchema"], u), a(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return t;
}
function lA(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], It(e, r)), n;
}
function uA(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], It(e, r)), n;
}
function cA(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], zv(n));
  const r = a(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function dA(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = a(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function fA(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = a(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function hA(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = a(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function pA(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && fA(n, t), t;
}
function mA(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && hA(n, t), t;
}
function gA(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = a(e, ["cachedContents"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => s)), l(t, ["cachedContents"], i);
  }
  return t;
}
function yA(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = a(e, ["cachedContents"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => s)), l(t, ["cachedContents"], i);
  }
  return t;
}
function _A(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = a(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = a(e, ["fileData"]);
  i != null && l(t, ["fileData"], oA(i));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], iA(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], Yv(c));
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const f = a(e, ["thought"]);
  f != null && l(t, ["thought"], f);
  const h = a(e, ["thoughtSignature"]);
  h != null && l(t, ["thoughtSignature"], h);
  const p = a(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = a(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = a(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = a(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function vA(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = a(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = a(e, ["fileData"]);
  i != null && l(t, ["fileData"], i);
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], s);
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], c);
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const f = a(e, ["thought"]);
  f != null && l(t, ["thought"], f);
  const h = a(e, ["thoughtSignature"]);
  h != null && l(t, ["thoughtSignature"], h);
  const p = a(e, ["videoMetadata"]);
  if (p != null && l(t, ["videoMetadata"], p), a(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (a(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (a(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return t;
}
function AA(e) {
  const t = {}, n = a(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = a(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], sA(r));
  const o = a(e, ["includeServerSideToolInvocations"]);
  return o != null && l(t, ["includeServerSideToolInvocations"], o), t;
}
function TA(e) {
  const t = {}, n = a(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = a(e, ["functionCallingConfig"]);
  if (r != null && l(t, ["functionCallingConfig"], r), a(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function SA(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = a(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = a(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], dA(o));
  const i = a(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], cA(i));
  const s = a(e, ["codeExecution"]);
  if (s != null && l(t, ["codeExecution"], s), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = a(e, ["functionDeclarations"]);
  if (u != null) {
    let h = u;
    Array.isArray(h) && (h = h.map((p) => p)), l(t, ["functionDeclarations"], h);
  }
  const c = a(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = a(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const f = a(e, ["mcpServers"]);
  if (f != null) {
    let h = f;
    Array.isArray(h) && (h = h.map((p) => p)), l(t, ["mcpServers"], h);
  }
  return t;
}
function EA(e) {
  const t = {}, n = a(e, ["retrieval"]);
  n != null && l(t, ["retrieval"], n);
  const r = a(e, ["computerUse"]);
  if (r != null && l(t, ["computerUse"], r), a(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const o = a(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], o);
  const i = a(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], i);
  const s = a(e, ["codeExecution"]);
  s != null && l(t, ["codeExecution"], s);
  const u = a(e, ["enterpriseWebSearch"]);
  u != null && l(t, ["enterpriseWebSearch"], u);
  const c = a(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => aA(m))), l(t, ["functionDeclarations"], p);
  }
  const d = a(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const f = a(e, ["parallelAiSearch"]);
  f != null && l(t, ["parallelAiSearch"], f);
  const h = a(e, ["urlContext"]);
  if (h != null && l(t, ["urlContext"], h), a(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function CA(e, t) {
  const n = {}, r = a(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = a(e, ["expireTime"]);
  return t !== void 0 && o != null && l(t, ["expireTime"], o), n;
}
function wA(e, t) {
  const n = {}, r = a(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = a(e, ["expireTime"]);
  return t !== void 0 && o != null && l(t, ["expireTime"], o), n;
}
function IA(e, t) {
  const n = {}, r = a(t, ["name"]);
  r != null && l(n, ["_url", "name"], It(e, r));
  const o = a(t, ["config"]);
  return o != null && CA(o, n), n;
}
function bA(e, t) {
  const n = {}, r = a(t, ["name"]);
  r != null && l(n, ["_url", "name"], It(e, r));
  const o = a(t, ["config"]);
  return o != null && wA(o, n), n;
}
var PA = class extends wt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new ln(Ct.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, r, o;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = jv(this.apiClient, e);
      return s = L("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = Zv(this.apiClient, e);
      return s = L("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    }
  }
  async get(e) {
    var t, n, r, o;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = uA(this.apiClient, e);
      return s = L("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = lA(this.apiClient, e);
      return s = L("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    }
  }
  async delete(e) {
    var t, n, r, o;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = tA(this.apiClient, e);
      return s = L("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = rA(d), h = new gc();
        return Object.assign(h, f), h;
      });
    } else {
      const c = eA(this.apiClient, e);
      return s = L("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = nA(d), h = new gc();
        return Object.assign(h, f), h;
      });
    }
  }
  async update(e) {
    var t, n, r, o;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = bA(this.apiClient, e);
      return s = L("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = IA(this.apiClient, e);
      return s = L("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = mA(e);
      return s = L("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = yA(d), h = new yc();
        return Object.assign(h, f), h;
      });
    } else {
      const c = pA(e);
      return s = L("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = gA(d), h = new yc();
        return Object.assign(h, f), h;
      });
    }
  }
};
function Ft(e, t) {
  var n = {};
  for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var o = 0, r = Object.getOwnPropertySymbols(e); o < r.length; o++) t.indexOf(r[o]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[o]) && (n[r[o]] = e[r[o]]);
  return n;
}
function wc(e) {
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
function K(e) {
  return this instanceof K ? (this.v = e, this) : new K(e);
}
function at(e, t, n) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var r = n.apply(e, t || []), o, i = [];
  return o = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), u("next"), u("throw"), u("return", s), o[Symbol.asyncIterator] = function() {
    return this;
  }, o;
  function s(m) {
    return function(g) {
      return Promise.resolve(g).then(m, h);
    };
  }
  function u(m, g) {
    r[m] && (o[m] = function(_) {
      return new Promise(function(v, C) {
        i.push([
          m,
          _,
          v,
          C
        ]) > 1 || c(m, _);
      });
    }, g && (o[m] = g(o[m])));
  }
  function c(m, g) {
    try {
      d(r[m](g));
    } catch (_) {
      p(i[0][3], _);
    }
  }
  function d(m) {
    m.value instanceof K ? Promise.resolve(m.value.v).then(f, h) : p(i[0][2], m);
  }
  function f(m) {
    c("next", m);
  }
  function h(m) {
    c("throw", m);
  }
  function p(m, g) {
    m(g), i.shift(), i.length && c(i[0][0], i[0][1]);
  }
}
function lt(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof wc == "function" ? wc(e) : e[Symbol.iterator](), n = {}, r("next"), r("throw"), r("return"), n[Symbol.asyncIterator] = function() {
    return this;
  }, n);
  function r(i) {
    n[i] = e[i] && function(s) {
      return new Promise(function(u, c) {
        s = e[i](s), o(u, c, s.done, s.value);
      });
    };
  }
  function o(i, s, u, c) {
    Promise.resolve(c).then(function(d) {
      i({
        value: d,
        done: u
      });
    }, s);
  }
}
function RA(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : gh(n);
}
function gh(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function xA(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function Ic(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let r = 0;
  for (; r < n; ) if (e[r].role === "user")
    t.push(e[r]), r++;
  else {
    const o = [];
    let i = !0;
    for (; r < n && e[r].role === "model"; )
      o.push(e[r]), i && !gh(e[r]) && (i = !1), r++;
    i ? t.push(...o) : t.pop();
  }
  return t;
}
var MA = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new NA(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, NA = class {
  constructor(e, t, n, r = {}, o = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = r, this.history = o, this.sendPromise = Promise.resolve(), xA(o);
  }
  async sendMessage(e) {
    var t;
    await this.sendPromise;
    const n = Te(e.message), r = this.modelsModule.generateContent({
      model: this.model,
      contents: this.getHistory(!0).concat(n),
      config: (t = e.config) !== null && t !== void 0 ? t : this.config
    });
    return this.sendPromise = (async () => {
      var o, i, s;
      const u = await r, c = (i = (o = u.candidates) === null || o === void 0 ? void 0 : o[0]) === null || i === void 0 ? void 0 : i.content, d = u.automaticFunctionCallingHistory, f = this.getHistory(!0).length;
      let h = [];
      d != null && (h = (s = d.slice(f)) !== null && s !== void 0 ? s : []);
      const p = c ? [c] : [];
      this.recordHistory(n, p, h);
    })(), await this.sendPromise.catch(() => {
      this.sendPromise = Promise.resolve();
    }), r;
  }
  async sendMessageStream(e) {
    var t;
    await this.sendPromise;
    const n = Te(e.message), r = this.modelsModule.generateContentStream({
      model: this.model,
      contents: this.getHistory(!0).concat(n),
      config: (t = e.config) !== null && t !== void 0 ? t : this.config
    });
    this.sendPromise = r.then(() => {
    }).catch(() => {
    });
    const o = await r;
    return this.processStreamResponse(o, n);
  }
  getHistory(e = !1) {
    const t = e ? Ic(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return at(this, arguments, function* () {
      var r, o, i, s, u, c;
      const d = [];
      try {
        for (var f = !0, h = lt(e), p; p = yield K(h.next()), r = p.done, !r; f = !0) {
          s = p.value, f = !1;
          const m = s;
          if (RA(m)) {
            const g = (c = (u = m.candidates) === null || u === void 0 ? void 0 : u[0]) === null || c === void 0 ? void 0 : c.content;
            g !== void 0 && d.push(g);
          }
          yield yield K(m);
        }
      } catch (m) {
        o = { error: m };
      } finally {
        try {
          !f && !r && (i = h.return) && (yield K(i.call(h)));
        } finally {
          if (o) throw o.error;
        }
      }
      this.recordHistory(t, d);
    });
  }
  recordHistory(e, t, n) {
    let r = [];
    t.length > 0 && t.every((o) => o.role !== void 0) ? r = t : r.push({
      role: "model",
      parts: []
    }), n && n.length > 0 ? this.history.push(...Ic(n)) : this.history.push(e), this.history.push(...r);
  }
}, yh = class _h extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, _h.prototype);
  }
};
function kA(e) {
  const t = {}, n = a(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function DA(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function $A(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "file"], uh(n)), t;
}
function LA(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function UA(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "file"], uh(n)), t;
}
function FA(e) {
  const t = {}, n = a(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function OA(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = a(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function qA(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && OA(n, t), t;
}
function BA(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = a(e, ["files"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => s)), l(t, ["files"], i);
  }
  return t;
}
function GA(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["files"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => i)), l(t, ["files"], o);
  }
  return t;
}
var HA = class extends wt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new ln(Ct.PAGED_ITEM_FILES, (n) => this.listInternal(n), await this.listInternal(t), t);
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
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = qA(e);
      return o = L("files", s._url), i = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = BA(u), d = new F_();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = kA(e);
      return o = L("upload/v1beta/files", s._url), i = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = DA(u), d = new O_();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = UA(e);
      return o = L("files/{file}", s._url), i = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => u);
    }
  }
  async delete(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = $A(e);
      return o = L("files/{file}", s._url), i = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = LA(u), d = new q_();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = FA(e);
      return o = L("files:register", s._url), i = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = GA(u), d = new B_();
        return Object.assign(d, c), d;
      });
    }
  }
};
function bc(e) {
  const t = {};
  if (a(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function VA(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Bo(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function JA(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => lT(i))), l(t, ["parts"], o);
  }
  const r = a(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function KA(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => uT(i))), l(t, ["parts"], o);
  }
  const r = a(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function WA(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function zA(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = a(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = a(e, ["name"]);
  if (o != null && l(t, ["name"], o), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function YA(e) {
  const t = {}, n = a(e, ["description"]);
  n != null && l(t, ["description"], n);
  const r = a(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = a(e, ["parameters"]);
  o != null && l(t, ["parameters"], o);
  const i = a(e, ["parametersJsonSchema"]);
  i != null && l(t, ["parametersJsonSchema"], i);
  const s = a(e, ["response"]);
  s != null && l(t, ["response"], s);
  const u = a(e, ["responseJsonSchema"]);
  if (u != null && l(t, ["responseJsonSchema"], u), a(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return t;
}
function XA(e) {
  const t = {}, n = a(e, ["modelSelectionConfig"]);
  n != null && l(t, ["modelConfig"], n);
  const r = a(e, ["responseJsonSchema"]);
  r != null && l(t, ["responseJsonSchema"], r);
  const o = a(e, ["audioTimestamp"]);
  o != null && l(t, ["audioTimestamp"], o);
  const i = a(e, ["candidateCount"]);
  i != null && l(t, ["candidateCount"], i);
  const s = a(e, ["enableAffectiveDialog"]);
  s != null && l(t, ["enableAffectiveDialog"], s);
  const u = a(e, ["frequencyPenalty"]);
  u != null && l(t, ["frequencyPenalty"], u);
  const c = a(e, ["logprobs"]);
  c != null && l(t, ["logprobs"], c);
  const d = a(e, ["maxOutputTokens"]);
  d != null && l(t, ["maxOutputTokens"], d);
  const f = a(e, ["mediaResolution"]);
  f != null && l(t, ["mediaResolution"], f);
  const h = a(e, ["presencePenalty"]);
  h != null && l(t, ["presencePenalty"], h);
  const p = a(e, ["responseLogprobs"]);
  p != null && l(t, ["responseLogprobs"], p);
  const m = a(e, ["responseMimeType"]);
  m != null && l(t, ["responseMimeType"], m);
  const g = a(e, ["responseModalities"]);
  g != null && l(t, ["responseModalities"], g);
  const _ = a(e, ["responseSchema"]);
  _ != null && l(t, ["responseSchema"], _);
  const v = a(e, ["routingConfig"]);
  v != null && l(t, ["routingConfig"], v);
  const C = a(e, ["seed"]);
  C != null && l(t, ["seed"], C);
  const b = a(e, ["speechConfig"]);
  b != null && l(t, ["speechConfig"], b);
  const P = a(e, ["stopSequences"]);
  P != null && l(t, ["stopSequences"], P);
  const R = a(e, ["temperature"]);
  R != null && l(t, ["temperature"], R);
  const D = a(e, ["thinkingConfig"]);
  D != null && l(t, ["thinkingConfig"], D);
  const A = a(e, ["topK"]);
  A != null && l(t, ["topK"], A);
  const U = a(e, ["topP"]);
  if (U != null && l(t, ["topP"], U), a(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return t;
}
function QA(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], VA(n));
  const r = a(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function ZA(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = a(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function jA(e, t) {
  const n = {}, r = a(e, ["generationConfig"]);
  t !== void 0 && r != null && l(t, ["setup", "generationConfig"], r);
  const o = a(e, ["responseModalities"]);
  t !== void 0 && o != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], o);
  const i = a(e, ["temperature"]);
  t !== void 0 && i != null && l(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], i);
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
  const f = a(e, ["seed"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], f);
  const h = a(e, ["speechConfig"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], Pa(h));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], JA(Te(g)));
  const _ = a(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let x = Gn(_);
    Array.isArray(x) && (x = x.map(($) => fT(Bn($)))), l(t, ["setup", "tools"], x);
  }
  const v = a(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], dT(v));
  const C = a(e, ["inputAudioTranscription"]);
  t !== void 0 && C != null && l(t, ["setup", "inputAudioTranscription"], bc(C));
  const b = a(e, ["outputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "outputAudioTranscription"], bc(b));
  const P = a(e, ["realtimeInputConfig"]);
  t !== void 0 && P != null && l(t, ["setup", "realtimeInputConfig"], P);
  const R = a(e, ["contextWindowCompression"]);
  t !== void 0 && R != null && l(t, ["setup", "contextWindowCompression"], R);
  const D = a(e, ["proactivity"]);
  if (t !== void 0 && D != null && l(t, ["setup", "proactivity"], D), a(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const A = a(e, ["avatarConfig"]);
  t !== void 0 && A != null && l(t, ["setup", "avatarConfig"], A);
  const U = a(e, ["safetySettings"]);
  if (t !== void 0 && U != null) {
    let x = U;
    Array.isArray(x) && (x = x.map(($) => cT($))), l(t, ["setup", "safetySettings"], x);
  }
  return n;
}
function eT(e, t) {
  const n = {}, r = a(e, ["generationConfig"]);
  t !== void 0 && r != null && l(t, ["setup", "generationConfig"], XA(r));
  const o = a(e, ["responseModalities"]);
  t !== void 0 && o != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], o);
  const i = a(e, ["temperature"]);
  t !== void 0 && i != null && l(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], i);
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
  const f = a(e, ["seed"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], f);
  const h = a(e, ["speechConfig"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], Pa(h));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], KA(Te(g)));
  const _ = a(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let $ = Gn(_);
    Array.isArray($) && ($ = $.map((H) => hT(Bn(H)))), l(t, ["setup", "tools"], $);
  }
  const v = a(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], v);
  const C = a(e, ["inputAudioTranscription"]);
  t !== void 0 && C != null && l(t, ["setup", "inputAudioTranscription"], C);
  const b = a(e, ["outputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "outputAudioTranscription"], b);
  const P = a(e, ["realtimeInputConfig"]);
  t !== void 0 && P != null && l(t, ["setup", "realtimeInputConfig"], P);
  const R = a(e, ["contextWindowCompression"]);
  t !== void 0 && R != null && l(t, ["setup", "contextWindowCompression"], R);
  const D = a(e, ["proactivity"]);
  t !== void 0 && D != null && l(t, ["setup", "proactivity"], D);
  const A = a(e, ["explicitVadSignal"]);
  t !== void 0 && A != null && l(t, ["setup", "explicitVadSignal"], A);
  const U = a(e, ["avatarConfig"]);
  t !== void 0 && U != null && l(t, ["setup", "avatarConfig"], U);
  const x = a(e, ["safetySettings"]);
  if (t !== void 0 && x != null) {
    let $ = x;
    Array.isArray($) && ($ = $.map((H) => H)), l(t, ["setup", "safetySettings"], $);
  }
  return n;
}
function tT(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["setup", "model"], Y(e, r));
  const o = a(t, ["config"]);
  return o != null && l(n, ["config"], jA(o, n)), n;
}
function nT(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["setup", "model"], Y(e, r));
  const o = a(t, ["config"]);
  return o != null && l(n, ["config"], eT(o, n)), n;
}
function rT(e) {
  const t = {}, n = a(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function oT(e) {
  const t = {}, n = a(e, ["weightedPrompts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((o) => o)), l(t, ["weightedPrompts"], r);
  }
  return t;
}
function iT(e) {
  const t = {}, n = a(e, ["media"]);
  if (n != null) {
    let d = oh(n);
    Array.isArray(d) && (d = d.map((f) => Bo(f))), l(t, ["mediaChunks"], d);
  }
  const r = a(e, ["audio"]);
  r != null && l(t, ["audio"], Bo(sh(r)));
  const o = a(e, ["audioStreamEnd"]);
  o != null && l(t, ["audioStreamEnd"], o);
  const i = a(e, ["video"]);
  i != null && l(t, ["video"], Bo(ih(i)));
  const s = a(e, ["text"]);
  s != null && l(t, ["text"], s);
  const u = a(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = a(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function sT(e) {
  const t = {}, n = a(e, ["media"]);
  if (n != null) {
    let d = oh(n);
    Array.isArray(d) && (d = d.map((f) => f)), l(t, ["mediaChunks"], d);
  }
  const r = a(e, ["audio"]);
  r != null && l(t, ["audio"], sh(r));
  const o = a(e, ["audioStreamEnd"]);
  o != null && l(t, ["audioStreamEnd"], o);
  const i = a(e, ["video"]);
  i != null && l(t, ["video"], ih(i));
  const s = a(e, ["text"]);
  s != null && l(t, ["text"], s);
  const u = a(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = a(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function aT(e) {
  const t = {}, n = a(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const r = a(e, ["serverContent"]);
  r != null && l(t, ["serverContent"], r);
  const o = a(e, ["toolCall"]);
  o != null && l(t, ["toolCall"], o);
  const i = a(e, ["toolCallCancellation"]);
  i != null && l(t, ["toolCallCancellation"], i);
  const s = a(e, ["usageMetadata"]);
  s != null && l(t, ["usageMetadata"], pT(s));
  const u = a(e, ["goAway"]);
  u != null && l(t, ["goAway"], u);
  const c = a(e, ["sessionResumptionUpdate"]);
  c != null && l(t, ["sessionResumptionUpdate"], c);
  const d = a(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const f = a(e, ["voiceActivity"]);
  return f != null && l(t, ["voiceActivity"], mT(f)), t;
}
function lT(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = a(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = a(e, ["fileData"]);
  i != null && l(t, ["fileData"], WA(i));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], zA(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], Bo(c));
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const f = a(e, ["thought"]);
  f != null && l(t, ["thought"], f);
  const h = a(e, ["thoughtSignature"]);
  h != null && l(t, ["thoughtSignature"], h);
  const p = a(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = a(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = a(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = a(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function uT(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = a(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = a(e, ["fileData"]);
  i != null && l(t, ["fileData"], i);
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], s);
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], c);
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const f = a(e, ["thought"]);
  f != null && l(t, ["thought"], f);
  const h = a(e, ["thoughtSignature"]);
  h != null && l(t, ["thoughtSignature"], h);
  const p = a(e, ["videoMetadata"]);
  if (p != null && l(t, ["videoMetadata"], p), a(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (a(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (a(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return t;
}
function cT(e) {
  const t = {}, n = a(e, ["category"]);
  if (n != null && l(t, ["category"], n), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = a(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function dT(e) {
  const t = {}, n = a(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), a(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function fT(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = a(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = a(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], ZA(o));
  const i = a(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], QA(i));
  const s = a(e, ["codeExecution"]);
  if (s != null && l(t, ["codeExecution"], s), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = a(e, ["functionDeclarations"]);
  if (u != null) {
    let h = u;
    Array.isArray(h) && (h = h.map((p) => p)), l(t, ["functionDeclarations"], h);
  }
  const c = a(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = a(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const f = a(e, ["mcpServers"]);
  if (f != null) {
    let h = f;
    Array.isArray(h) && (h = h.map((p) => p)), l(t, ["mcpServers"], h);
  }
  return t;
}
function hT(e) {
  const t = {}, n = a(e, ["retrieval"]);
  n != null && l(t, ["retrieval"], n);
  const r = a(e, ["computerUse"]);
  if (r != null && l(t, ["computerUse"], r), a(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const o = a(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], o);
  const i = a(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], i);
  const s = a(e, ["codeExecution"]);
  s != null && l(t, ["codeExecution"], s);
  const u = a(e, ["enterpriseWebSearch"]);
  u != null && l(t, ["enterpriseWebSearch"], u);
  const c = a(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => YA(m))), l(t, ["functionDeclarations"], p);
  }
  const d = a(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const f = a(e, ["parallelAiSearch"]);
  f != null && l(t, ["parallelAiSearch"], f);
  const h = a(e, ["urlContext"]);
  if (h != null && l(t, ["urlContext"], h), a(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function pT(e) {
  const t = {}, n = a(e, ["promptTokenCount"]);
  n != null && l(t, ["promptTokenCount"], n);
  const r = a(e, ["cachedContentTokenCount"]);
  r != null && l(t, ["cachedContentTokenCount"], r);
  const o = a(e, ["candidatesTokenCount"]);
  o != null && l(t, ["responseTokenCount"], o);
  const i = a(e, ["toolUsePromptTokenCount"]);
  i != null && l(t, ["toolUsePromptTokenCount"], i);
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
  const f = a(e, ["candidatesTokensDetails"]);
  if (f != null) {
    let m = f;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["responseTokensDetails"], m);
  }
  const h = a(e, ["toolUsePromptTokensDetails"]);
  if (h != null) {
    let m = h;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["toolUsePromptTokensDetails"], m);
  }
  const p = a(e, ["trafficType"]);
  return p != null && l(t, ["trafficType"], p), t;
}
function mT(e) {
  const t = {}, n = a(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function gT(e, t) {
  const n = {}, r = a(e, ["apiKey"]);
  if (r != null && l(n, ["apiKey"], r), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function yT(e, t) {
  const n = {}, r = a(e, ["data"]);
  if (r != null && l(n, ["data"], r), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = a(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function _T(e, t) {
  const n = {}, r = a(e, ["content"]);
  r != null && l(n, ["content"], r);
  const o = a(e, ["citationMetadata"]);
  o != null && l(n, ["citationMetadata"], vT(o));
  const i = a(e, ["tokenCount"]);
  i != null && l(n, ["tokenCount"], i);
  const s = a(e, ["finishReason"]);
  s != null && l(n, ["finishReason"], s);
  const u = a(e, ["groundingMetadata"]);
  u != null && l(n, ["groundingMetadata"], u);
  const c = a(e, ["avgLogprobs"]);
  c != null && l(n, ["avgLogprobs"], c);
  const d = a(e, ["index"]);
  d != null && l(n, ["index"], d);
  const f = a(e, ["logprobsResult"]);
  f != null && l(n, ["logprobsResult"], f);
  const h = a(e, ["safetyRatings"]);
  if (h != null) {
    let m = h;
    Array.isArray(m) && (m = m.map((g) => g)), l(n, ["safetyRatings"], m);
  }
  const p = a(e, ["urlContextMetadata"]);
  return p != null && l(n, ["urlContextMetadata"], p), n;
}
function vT(e, t) {
  const n = {}, r = a(e, ["citationSources"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => i)), l(n, ["citations"], o);
  }
  return n;
}
function AT(e, t, n) {
  const r = {}, o = a(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = a(t, ["contents"]);
  if (i != null) {
    let s = De(i);
    Array.isArray(s) && (s = s.map((u) => Vn(u))), l(r, ["contents"], s);
  }
  return r;
}
function TT(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = a(e, ["tokensInfo"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => s)), l(n, ["tokensInfo"], i);
  }
  return n;
}
function ST(e, t) {
  const n = {}, r = a(e, ["values"]);
  r != null && l(n, ["values"], r);
  const o = a(e, ["statistics"]);
  return o != null && l(n, ["statistics"], ET(o)), n;
}
function ET(e, t) {
  const n = {}, r = a(e, ["truncated"]);
  r != null && l(n, ["truncated"], r);
  const o = a(e, ["token_count"]);
  return o != null && l(n, ["tokenCount"], o), n;
}
function Zr(e, t) {
  const n = {}, r = a(e, ["parts"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => NS(s))), l(n, ["parts"], i);
  }
  const o = a(e, ["role"]);
  return o != null && l(n, ["role"], o), n;
}
function Vn(e, t) {
  const n = {}, r = a(e, ["parts"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => kS(s))), l(n, ["parts"], i);
  }
  const o = a(e, ["role"]);
  return o != null && l(n, ["role"], o), n;
}
function CT(e, t) {
  const n = {}, r = a(e, ["controlType"]);
  r != null && l(n, ["controlType"], r);
  const o = a(e, ["enableControlImageComputation"]);
  return o != null && l(n, ["computeControl"], o), n;
}
function wT(e, t) {
  const n = {};
  if (a(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (a(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (a(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function IT(e, t, n) {
  const r = {}, o = a(e, ["systemInstruction"]);
  t !== void 0 && o != null && l(t, ["systemInstruction"], Vn(Te(o)));
  const i = a(e, ["tools"]);
  if (t !== void 0 && i != null) {
    let u = i;
    Array.isArray(u) && (u = u.map((c) => Sh(c))), l(t, ["tools"], u);
  }
  const s = a(e, ["generationConfig"]);
  return t !== void 0 && s != null && l(t, ["generationConfig"], yS(s)), r;
}
function bT(e, t, n) {
  const r = {}, o = a(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = a(t, ["contents"]);
  if (i != null) {
    let u = De(i);
    Array.isArray(u) && (u = u.map((c) => Zr(c))), l(r, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && wT(s), r;
}
function PT(e, t, n) {
  const r = {}, o = a(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = a(t, ["contents"]);
  if (i != null) {
    let u = De(i);
    Array.isArray(u) && (u = u.map((c) => Vn(c))), l(r, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && IT(s, r), r;
}
function RT(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = a(e, ["totalTokens"]);
  o != null && l(n, ["totalTokens"], o);
  const i = a(e, ["cachedContentTokenCount"]);
  return i != null && l(n, ["cachedContentTokenCount"], i), n;
}
function xT(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = a(e, ["totalTokens"]);
  return o != null && l(n, ["totalTokens"], o), n;
}
function MT(e, t, n) {
  const r = {}, o = a(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function NT(e, t, n) {
  const r = {}, o = a(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function kT(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function DT(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function $T(e, t, n) {
  const r = {}, o = a(e, ["outputGcsUri"]);
  t !== void 0 && o != null && l(t, ["parameters", "storageUri"], o);
  const i = a(e, ["negativePrompt"]);
  t !== void 0 && i != null && l(t, ["parameters", "negativePrompt"], i);
  const s = a(e, ["numberOfImages"]);
  t !== void 0 && s != null && l(t, ["parameters", "sampleCount"], s);
  const u = a(e, ["aspectRatio"]);
  t !== void 0 && u != null && l(t, ["parameters", "aspectRatio"], u);
  const c = a(e, ["guidanceScale"]);
  t !== void 0 && c != null && l(t, ["parameters", "guidanceScale"], c);
  const d = a(e, ["seed"]);
  t !== void 0 && d != null && l(t, ["parameters", "seed"], d);
  const f = a(e, ["safetyFilterLevel"]);
  t !== void 0 && f != null && l(t, ["parameters", "safetySetting"], f);
  const h = a(e, ["personGeneration"]);
  t !== void 0 && h != null && l(t, ["parameters", "personGeneration"], h);
  const p = a(e, ["includeSafetyAttributes"]);
  t !== void 0 && p != null && l(t, ["parameters", "includeSafetyAttributes"], p);
  const m = a(e, ["includeRaiReason"]);
  t !== void 0 && m != null && l(t, ["parameters", "includeRaiReason"], m);
  const g = a(e, ["language"]);
  t !== void 0 && g != null && l(t, ["parameters", "language"], g);
  const _ = a(e, ["outputMimeType"]);
  t !== void 0 && _ != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], _);
  const v = a(e, ["outputCompressionQuality"]);
  t !== void 0 && v != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], v);
  const C = a(e, ["addWatermark"]);
  t !== void 0 && C != null && l(t, ["parameters", "addWatermark"], C);
  const b = a(e, ["labels"]);
  t !== void 0 && b != null && l(t, ["labels"], b);
  const P = a(e, ["editMode"]);
  t !== void 0 && P != null && l(t, ["parameters", "editMode"], P);
  const R = a(e, ["baseSteps"]);
  return t !== void 0 && R != null && l(t, [
    "parameters",
    "editConfig",
    "baseSteps"
  ], R), r;
}
function LT(e, t, n) {
  const r = {}, o = a(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = a(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const s = a(t, ["referenceImages"]);
  if (s != null) {
    let c = s;
    Array.isArray(c) && (c = c.map((d) => OS(d))), l(r, ["instances[0]", "referenceImages"], c);
  }
  const u = a(t, ["config"]);
  return u != null && $T(u, r), r;
}
function UT(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = a(e, ["predictions"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => Ti(s))), l(n, ["generatedImages"], i);
  }
  return n;
}
function FT(e, t, n) {
  const r = {}, o = a(e, ["taskType"]);
  t !== void 0 && o != null && l(t, ["requests[]", "taskType"], o);
  const i = a(e, ["title"]);
  t !== void 0 && i != null && l(t, ["requests[]", "title"], i);
  const s = a(e, ["outputDimensionality"]);
  if (t !== void 0 && s != null && l(t, ["requests[]", "outputDimensionality"], s), a(e, ["mimeType"]) !== void 0) throw new Error("mimeType parameter is not supported in Gemini API.");
  if (a(e, ["autoTruncate"]) !== void 0) throw new Error("autoTruncate parameter is not supported in Gemini API.");
  if (a(e, ["documentOcr"]) !== void 0) throw new Error("documentOcr parameter is not supported in Gemini API.");
  if (a(e, ["audioTrackExtraction"]) !== void 0) throw new Error("audioTrackExtraction parameter is not supported in Gemini API.");
  return r;
}
function OT(e, t, n) {
  const r = {};
  let o = a(n, ["embeddingApiType"]);
  if (o === void 0 && (o = "PREDICT"), o === "PREDICT") {
    const h = a(e, ["taskType"]);
    t !== void 0 && h != null && l(t, ["instances[]", "task_type"], h);
  } else if (o === "EMBED_CONTENT") {
    const h = a(e, ["taskType"]);
    t !== void 0 && h != null && l(t, ["embedContentConfig", "taskType"], h);
  }
  let i = a(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const h = a(e, ["title"]);
    t !== void 0 && h != null && l(t, ["instances[]", "title"], h);
  } else if (i === "EMBED_CONTENT") {
    const h = a(e, ["title"]);
    t !== void 0 && h != null && l(t, ["embedContentConfig", "title"], h);
  }
  let s = a(n, ["embeddingApiType"]);
  if (s === void 0 && (s = "PREDICT"), s === "PREDICT") {
    const h = a(e, ["outputDimensionality"]);
    t !== void 0 && h != null && l(t, ["parameters", "outputDimensionality"], h);
  } else if (s === "EMBED_CONTENT") {
    const h = a(e, ["outputDimensionality"]);
    t !== void 0 && h != null && l(t, ["embedContentConfig", "outputDimensionality"], h);
  }
  let u = a(n, ["embeddingApiType"]);
  if (u === void 0 && (u = "PREDICT"), u === "PREDICT") {
    const h = a(e, ["mimeType"]);
    t !== void 0 && h != null && l(t, ["instances[]", "mimeType"], h);
  }
  let c = a(n, ["embeddingApiType"]);
  if (c === void 0 && (c = "PREDICT"), c === "PREDICT") {
    const h = a(e, ["autoTruncate"]);
    t !== void 0 && h != null && l(t, ["parameters", "autoTruncate"], h);
  } else if (c === "EMBED_CONTENT") {
    const h = a(e, ["autoTruncate"]);
    t !== void 0 && h != null && l(t, ["embedContentConfig", "autoTruncate"], h);
  }
  let d = a(n, ["embeddingApiType"]);
  if (d === void 0 && (d = "PREDICT"), d === "EMBED_CONTENT") {
    const h = a(e, ["documentOcr"]);
    t !== void 0 && h != null && l(t, ["embedContentConfig", "documentOcr"], h);
  }
  let f = a(n, ["embeddingApiType"]);
  if (f === void 0 && (f = "PREDICT"), f === "EMBED_CONTENT") {
    const h = a(e, ["audioTrackExtraction"]);
    t !== void 0 && h != null && l(t, ["embedContentConfig", "audioTrackExtraction"], h);
  }
  return r;
}
function qT(e, t, n) {
  const r = {}, o = a(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = a(t, ["contents"]);
  if (i != null) {
    let d = wa(e, i);
    Array.isArray(d) && (d = d.map((f) => f)), l(r, ["requests[]", "content"], d);
  }
  const s = a(t, ["content"]);
  s != null && Zr(Te(s));
  const u = a(t, ["config"]);
  u != null && FT(u, r);
  const c = a(t, ["model"]);
  return c !== void 0 && l(r, ["requests[]", "model"], Y(e, c)), r;
}
function BT(e, t, n) {
  const r = {}, o = a(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  let i = a(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const c = a(t, ["contents"]);
    if (c != null) {
      let d = wa(e, c);
      Array.isArray(d) && (d = d.map((f) => f)), l(r, ["instances[]", "content"], d);
    }
  }
  let s = a(n, ["embeddingApiType"]);
  if (s === void 0 && (s = "PREDICT"), s === "EMBED_CONTENT") {
    const c = a(t, ["content"]);
    c != null && l(r, ["content"], Vn(Te(c)));
  }
  const u = a(t, ["config"]);
  return u != null && OT(u, r, n), r;
}
function GT(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = a(e, ["embeddings"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((u) => u)), l(n, ["embeddings"], s);
  }
  const i = a(e, ["metadata"]);
  return i != null && l(n, ["metadata"], i), n;
}
function HT(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = a(e, ["predictions[]", "embeddings"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((u) => ST(u))), l(n, ["embeddings"], s);
  }
  const i = a(e, ["metadata"]);
  if (i != null && l(n, ["metadata"], i), t && a(t, ["embeddingApiType"]) === "EMBED_CONTENT") {
    const s = a(e, ["embedding"]), u = a(e, ["usageMetadata"]), c = a(e, ["truncated"]);
    if (s) {
      const d = {};
      u && u.promptTokenCount && (d.tokenCount = u.promptTokenCount), c && (d.truncated = c), s.statistics = d, l(n, ["embeddings"], [s]);
    }
  }
  return n;
}
function VT(e, t) {
  const n = {}, r = a(e, ["endpoint"]);
  r != null && l(n, ["name"], r);
  const o = a(e, ["deployedModelId"]);
  return o != null && l(n, ["deployedModelId"], o), n;
}
function JT(e, t) {
  const n = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = a(e, ["fileUri"]);
  r != null && l(n, ["fileUri"], r);
  const o = a(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function KT(e, t) {
  const n = {}, r = a(e, ["id"]);
  r != null && l(n, ["id"], r);
  const o = a(e, ["args"]);
  o != null && l(n, ["args"], o);
  const i = a(e, ["name"]);
  if (i != null && l(n, ["name"], i), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function WT(e, t) {
  const n = {}, r = a(e, ["allowedFunctionNames"]);
  r != null && l(n, ["allowedFunctionNames"], r);
  const o = a(e, ["mode"]);
  if (o != null && l(n, ["mode"], o), a(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function zT(e, t) {
  const n = {}, r = a(e, ["description"]);
  r != null && l(n, ["description"], r);
  const o = a(e, ["name"]);
  o != null && l(n, ["name"], o);
  const i = a(e, ["parameters"]);
  i != null && l(n, ["parameters"], i);
  const s = a(e, ["parametersJsonSchema"]);
  s != null && l(n, ["parametersJsonSchema"], s);
  const u = a(e, ["response"]);
  u != null && l(n, ["response"], u);
  const c = a(e, ["responseJsonSchema"]);
  if (c != null && l(n, ["responseJsonSchema"], c), a(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return n;
}
function YT(e, t, n, r) {
  const o = {}, i = a(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], Zr(Te(i)));
  const s = a(t, ["temperature"]);
  s != null && l(o, ["temperature"], s);
  const u = a(t, ["topP"]);
  u != null && l(o, ["topP"], u);
  const c = a(t, ["topK"]);
  c != null && l(o, ["topK"], c);
  const d = a(t, ["candidateCount"]);
  d != null && l(o, ["candidateCount"], d);
  const f = a(t, ["maxOutputTokens"]);
  f != null && l(o, ["maxOutputTokens"], f);
  const h = a(t, ["stopSequences"]);
  h != null && l(o, ["stopSequences"], h);
  const p = a(t, ["responseLogprobs"]);
  p != null && l(o, ["responseLogprobs"], p);
  const m = a(t, ["logprobs"]);
  m != null && l(o, ["logprobs"], m);
  const g = a(t, ["presencePenalty"]);
  g != null && l(o, ["presencePenalty"], g);
  const _ = a(t, ["frequencyPenalty"]);
  _ != null && l(o, ["frequencyPenalty"], _);
  const v = a(t, ["seed"]);
  v != null && l(o, ["seed"], v);
  const C = a(t, ["responseMimeType"]);
  C != null && l(o, ["responseMimeType"], C);
  const b = a(t, ["responseSchema"]);
  b != null && l(o, ["responseSchema"], Ia(b));
  const P = a(t, ["responseJsonSchema"]);
  if (P != null && l(o, ["responseJsonSchema"], P), a(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (a(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const R = a(t, ["safetySettings"]);
  if (n !== void 0 && R != null) {
    let Q = R;
    Array.isArray(Q) && (Q = Q.map((Se) => qS(Se))), l(n, ["safetySettings"], Q);
  }
  const D = a(t, ["tools"]);
  if (n !== void 0 && D != null) {
    let Q = Gn(D);
    Array.isArray(Q) && (Q = Q.map((Se) => zS(Bn(Se)))), l(n, ["tools"], Q);
  }
  const A = a(t, ["toolConfig"]);
  if (n !== void 0 && A != null && l(n, ["toolConfig"], KS(A)), a(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const U = a(t, ["cachedContent"]);
  n !== void 0 && U != null && l(n, ["cachedContent"], It(e, U));
  const x = a(t, ["responseModalities"]);
  x != null && l(o, ["responseModalities"], x);
  const $ = a(t, ["mediaResolution"]);
  $ != null && l(o, ["mediaResolution"], $);
  const H = a(t, ["speechConfig"]);
  if (H != null && l(o, ["speechConfig"], ba(H)), a(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const z = a(t, ["thinkingConfig"]);
  z != null && l(o, ["thinkingConfig"], z);
  const ge = a(t, ["imageConfig"]);
  ge != null && l(o, ["imageConfig"], SS(ge));
  const se = a(t, ["enableEnhancedCivicAnswers"]);
  if (se != null && l(o, ["enableEnhancedCivicAnswers"], se), a(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const X = a(t, ["serviceTier"]);
  return n !== void 0 && X != null && l(n, ["serviceTier"], X), o;
}
function XT(e, t, n, r) {
  const o = {}, i = a(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], Vn(Te(i)));
  const s = a(t, ["temperature"]);
  s != null && l(o, ["temperature"], s);
  const u = a(t, ["topP"]);
  u != null && l(o, ["topP"], u);
  const c = a(t, ["topK"]);
  c != null && l(o, ["topK"], c);
  const d = a(t, ["candidateCount"]);
  d != null && l(o, ["candidateCount"], d);
  const f = a(t, ["maxOutputTokens"]);
  f != null && l(o, ["maxOutputTokens"], f);
  const h = a(t, ["stopSequences"]);
  h != null && l(o, ["stopSequences"], h);
  const p = a(t, ["responseLogprobs"]);
  p != null && l(o, ["responseLogprobs"], p);
  const m = a(t, ["logprobs"]);
  m != null && l(o, ["logprobs"], m);
  const g = a(t, ["presencePenalty"]);
  g != null && l(o, ["presencePenalty"], g);
  const _ = a(t, ["frequencyPenalty"]);
  _ != null && l(o, ["frequencyPenalty"], _);
  const v = a(t, ["seed"]);
  v != null && l(o, ["seed"], v);
  const C = a(t, ["responseMimeType"]);
  C != null && l(o, ["responseMimeType"], C);
  const b = a(t, ["responseSchema"]);
  b != null && l(o, ["responseSchema"], Ia(b));
  const P = a(t, ["responseJsonSchema"]);
  P != null && l(o, ["responseJsonSchema"], P);
  const R = a(t, ["routingConfig"]);
  R != null && l(o, ["routingConfig"], R);
  const D = a(t, ["modelSelectionConfig"]);
  D != null && l(o, ["modelConfig"], D);
  const A = a(t, ["safetySettings"]);
  if (n !== void 0 && A != null) {
    let ae = A;
    Array.isArray(ae) && (ae = ae.map((un) => un)), l(n, ["safetySettings"], ae);
  }
  const U = a(t, ["tools"]);
  if (n !== void 0 && U != null) {
    let ae = Gn(U);
    Array.isArray(ae) && (ae = ae.map((un) => Sh(Bn(un)))), l(n, ["tools"], ae);
  }
  const x = a(t, ["toolConfig"]);
  n !== void 0 && x != null && l(n, ["toolConfig"], WS(x));
  const $ = a(t, ["labels"]);
  n !== void 0 && $ != null && l(n, ["labels"], $);
  const H = a(t, ["cachedContent"]);
  n !== void 0 && H != null && l(n, ["cachedContent"], It(e, H));
  const z = a(t, ["responseModalities"]);
  z != null && l(o, ["responseModalities"], z);
  const ge = a(t, ["mediaResolution"]);
  ge != null && l(o, ["mediaResolution"], ge);
  const se = a(t, ["speechConfig"]);
  se != null && l(o, ["speechConfig"], ba(se));
  const X = a(t, ["audioTimestamp"]);
  X != null && l(o, ["audioTimestamp"], X);
  const Q = a(t, ["thinkingConfig"]);
  Q != null && l(o, ["thinkingConfig"], Q);
  const Se = a(t, ["imageConfig"]);
  if (Se != null && l(o, ["imageConfig"], ES(Se)), a(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const Ue = a(t, ["modelArmorConfig"]);
  n !== void 0 && Ue != null && l(n, ["modelArmorConfig"], Ue);
  const re = a(t, ["serviceTier"]);
  return n !== void 0 && re != null && l(n, ["serviceTier"], re), o;
}
function Pc(e, t, n) {
  const r = {}, o = a(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = a(t, ["contents"]);
  if (i != null) {
    let u = De(i);
    Array.isArray(u) && (u = u.map((c) => Zr(c))), l(r, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && l(r, ["generationConfig"], YT(e, s, r)), r;
}
function Rc(e, t, n) {
  const r = {}, o = a(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = a(t, ["contents"]);
  if (i != null) {
    let u = De(i);
    Array.isArray(u) && (u = u.map((c) => Vn(c))), l(r, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && l(r, ["generationConfig"], XT(e, s, r)), r;
}
function xc(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = a(e, ["candidates"]);
  if (o != null) {
    let f = o;
    Array.isArray(f) && (f = f.map((h) => _T(h))), l(n, ["candidates"], f);
  }
  const i = a(e, ["modelVersion"]);
  i != null && l(n, ["modelVersion"], i);
  const s = a(e, ["promptFeedback"]);
  s != null && l(n, ["promptFeedback"], s);
  const u = a(e, ["responseId"]);
  u != null && l(n, ["responseId"], u);
  const c = a(e, ["usageMetadata"]);
  c != null && l(n, ["usageMetadata"], c);
  const d = a(e, ["modelStatus"]);
  return d != null && l(n, ["modelStatus"], d), n;
}
function Mc(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = a(e, ["candidates"]);
  if (o != null) {
    let f = o;
    Array.isArray(f) && (f = f.map((h) => h)), l(n, ["candidates"], f);
  }
  const i = a(e, ["createTime"]);
  i != null && l(n, ["createTime"], i);
  const s = a(e, ["modelVersion"]);
  s != null && l(n, ["modelVersion"], s);
  const u = a(e, ["promptFeedback"]);
  u != null && l(n, ["promptFeedback"], u);
  const c = a(e, ["responseId"]);
  c != null && l(n, ["responseId"], c);
  const d = a(e, ["usageMetadata"]);
  return d != null && l(n, ["usageMetadata"], d), n;
}
function QT(e, t, n) {
  const r = {};
  if (a(e, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  if (a(e, ["negativePrompt"]) !== void 0) throw new Error("negativePrompt parameter is not supported in Gemini API.");
  const o = a(e, ["numberOfImages"]);
  t !== void 0 && o != null && l(t, ["parameters", "sampleCount"], o);
  const i = a(e, ["aspectRatio"]);
  t !== void 0 && i != null && l(t, ["parameters", "aspectRatio"], i);
  const s = a(e, ["guidanceScale"]);
  if (t !== void 0 && s != null && l(t, ["parameters", "guidanceScale"], s), a(e, ["seed"]) !== void 0) throw new Error("seed parameter is not supported in Gemini API.");
  const u = a(e, ["safetyFilterLevel"]);
  t !== void 0 && u != null && l(t, ["parameters", "safetySetting"], u);
  const c = a(e, ["personGeneration"]);
  t !== void 0 && c != null && l(t, ["parameters", "personGeneration"], c);
  const d = a(e, ["includeSafetyAttributes"]);
  t !== void 0 && d != null && l(t, ["parameters", "includeSafetyAttributes"], d);
  const f = a(e, ["includeRaiReason"]);
  t !== void 0 && f != null && l(t, ["parameters", "includeRaiReason"], f);
  const h = a(e, ["language"]);
  t !== void 0 && h != null && l(t, ["parameters", "language"], h);
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
function ZT(e, t, n) {
  const r = {}, o = a(e, ["outputGcsUri"]);
  t !== void 0 && o != null && l(t, ["parameters", "storageUri"], o);
  const i = a(e, ["negativePrompt"]);
  t !== void 0 && i != null && l(t, ["parameters", "negativePrompt"], i);
  const s = a(e, ["numberOfImages"]);
  t !== void 0 && s != null && l(t, ["parameters", "sampleCount"], s);
  const u = a(e, ["aspectRatio"]);
  t !== void 0 && u != null && l(t, ["parameters", "aspectRatio"], u);
  const c = a(e, ["guidanceScale"]);
  t !== void 0 && c != null && l(t, ["parameters", "guidanceScale"], c);
  const d = a(e, ["seed"]);
  t !== void 0 && d != null && l(t, ["parameters", "seed"], d);
  const f = a(e, ["safetyFilterLevel"]);
  t !== void 0 && f != null && l(t, ["parameters", "safetySetting"], f);
  const h = a(e, ["personGeneration"]);
  t !== void 0 && h != null && l(t, ["parameters", "personGeneration"], h);
  const p = a(e, ["includeSafetyAttributes"]);
  t !== void 0 && p != null && l(t, ["parameters", "includeSafetyAttributes"], p);
  const m = a(e, ["includeRaiReason"]);
  t !== void 0 && m != null && l(t, ["parameters", "includeRaiReason"], m);
  const g = a(e, ["language"]);
  t !== void 0 && g != null && l(t, ["parameters", "language"], g);
  const _ = a(e, ["outputMimeType"]);
  t !== void 0 && _ != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], _);
  const v = a(e, ["outputCompressionQuality"]);
  t !== void 0 && v != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], v);
  const C = a(e, ["addWatermark"]);
  t !== void 0 && C != null && l(t, ["parameters", "addWatermark"], C);
  const b = a(e, ["labels"]);
  t !== void 0 && b != null && l(t, ["labels"], b);
  const P = a(e, ["imageSize"]);
  t !== void 0 && P != null && l(t, ["parameters", "sampleImageSize"], P);
  const R = a(e, ["enhancePrompt"]);
  return t !== void 0 && R != null && l(t, ["parameters", "enhancePrompt"], R), r;
}
function jT(e, t, n) {
  const r = {}, o = a(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = a(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const s = a(t, ["config"]);
  return s != null && QT(s, r), r;
}
function eS(e, t, n) {
  const r = {}, o = a(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = a(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const s = a(t, ["config"]);
  return s != null && ZT(s, r), r;
}
function tS(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = a(e, ["predictions"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((u) => hS(u))), l(n, ["generatedImages"], s);
  }
  const i = a(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], Ah(i)), n;
}
function nS(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = a(e, ["predictions"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((u) => Ti(u))), l(n, ["generatedImages"], s);
  }
  const i = a(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], Th(i)), n;
}
function rS(e, t, n) {
  const r = {}, o = a(e, ["numberOfVideos"]);
  if (t !== void 0 && o != null && l(t, ["parameters", "sampleCount"], o), a(e, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  if (a(e, ["fps"]) !== void 0) throw new Error("fps parameter is not supported in Gemini API.");
  const i = a(e, ["durationSeconds"]);
  if (t !== void 0 && i != null && l(t, ["parameters", "durationSeconds"], i), a(e, ["seed"]) !== void 0) throw new Error("seed parameter is not supported in Gemini API.");
  const s = a(e, ["aspectRatio"]);
  t !== void 0 && s != null && l(t, ["parameters", "aspectRatio"], s);
  const u = a(e, ["resolution"]);
  t !== void 0 && u != null && l(t, ["parameters", "resolution"], u);
  const c = a(e, ["personGeneration"]);
  if (t !== void 0 && c != null && l(t, ["parameters", "personGeneration"], c), a(e, ["pubsubTopic"]) !== void 0) throw new Error("pubsubTopic parameter is not supported in Gemini API.");
  const d = a(e, ["negativePrompt"]);
  t !== void 0 && d != null && l(t, ["parameters", "negativePrompt"], d);
  const f = a(e, ["enhancePrompt"]);
  if (t !== void 0 && f != null && l(t, ["parameters", "enhancePrompt"], f), a(e, ["generateAudio"]) !== void 0) throw new Error("generateAudio parameter is not supported in Gemini API.");
  const h = a(e, ["lastFrame"]);
  t !== void 0 && h != null && l(t, ["instances[0]", "lastFrame"], Si(h));
  const p = a(e, ["referenceImages"]);
  if (t !== void 0 && p != null) {
    let g = p;
    Array.isArray(g) && (g = g.map((_) => aE(_))), l(t, ["instances[0]", "referenceImages"], g);
  }
  if (a(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (a(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (a(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = a(e, ["webhookConfig"]);
  return t !== void 0 && m != null && l(t, ["webhookConfig"], m), r;
}
function oS(e, t, n) {
  const r = {}, o = a(e, ["numberOfVideos"]);
  t !== void 0 && o != null && l(t, ["parameters", "sampleCount"], o);
  const i = a(e, ["outputGcsUri"]);
  t !== void 0 && i != null && l(t, ["parameters", "storageUri"], i);
  const s = a(e, ["fps"]);
  t !== void 0 && s != null && l(t, ["parameters", "fps"], s);
  const u = a(e, ["durationSeconds"]);
  t !== void 0 && u != null && l(t, ["parameters", "durationSeconds"], u);
  const c = a(e, ["seed"]);
  t !== void 0 && c != null && l(t, ["parameters", "seed"], c);
  const d = a(e, ["aspectRatio"]);
  t !== void 0 && d != null && l(t, ["parameters", "aspectRatio"], d);
  const f = a(e, ["resolution"]);
  t !== void 0 && f != null && l(t, ["parameters", "resolution"], f);
  const h = a(e, ["personGeneration"]);
  t !== void 0 && h != null && l(t, ["parameters", "personGeneration"], h);
  const p = a(e, ["pubsubTopic"]);
  t !== void 0 && p != null && l(t, ["parameters", "pubsubTopic"], p);
  const m = a(e, ["negativePrompt"]);
  t !== void 0 && m != null && l(t, ["parameters", "negativePrompt"], m);
  const g = a(e, ["enhancePrompt"]);
  t !== void 0 && g != null && l(t, ["parameters", "enhancePrompt"], g);
  const _ = a(e, ["generateAudio"]);
  t !== void 0 && _ != null && l(t, ["parameters", "generateAudio"], _);
  const v = a(e, ["lastFrame"]);
  t !== void 0 && v != null && l(t, ["instances[0]", "lastFrame"], ut(v));
  const C = a(e, ["referenceImages"]);
  if (t !== void 0 && C != null) {
    let D = C;
    Array.isArray(D) && (D = D.map((A) => lE(A))), l(t, ["instances[0]", "referenceImages"], D);
  }
  const b = a(e, ["mask"]);
  t !== void 0 && b != null && l(t, ["instances[0]", "mask"], sE(b));
  const P = a(e, ["compressionQuality"]);
  t !== void 0 && P != null && l(t, ["parameters", "compressionQuality"], P);
  const R = a(e, ["labels"]);
  if (t !== void 0 && R != null && l(t, ["labels"], R), a(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return r;
}
function iS(e, t) {
  const n = {}, r = a(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = a(e, ["metadata"]);
  o != null && l(n, ["metadata"], o);
  const i = a(e, ["done"]);
  i != null && l(n, ["done"], i);
  const s = a(e, ["error"]);
  s != null && l(n, ["error"], s);
  const u = a(e, ["response", "generateVideoResponse"]);
  return u != null && l(n, ["response"], uS(u)), n;
}
function sS(e, t) {
  const n = {}, r = a(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = a(e, ["metadata"]);
  o != null && l(n, ["metadata"], o);
  const i = a(e, ["done"]);
  i != null && l(n, ["done"], i);
  const s = a(e, ["error"]);
  s != null && l(n, ["error"], s);
  const u = a(e, ["response"]);
  return u != null && l(n, ["response"], cS(u)), n;
}
function aS(e, t, n) {
  const r = {}, o = a(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = a(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const s = a(t, ["image"]);
  s != null && l(r, ["instances[0]", "image"], Si(s));
  const u = a(t, ["video"]);
  u != null && l(r, ["instances[0]", "video"], Eh(u));
  const c = a(t, ["source"]);
  c != null && dS(c, r);
  const d = a(t, ["config"]);
  return d != null && rS(d, r), r;
}
function lS(e, t, n) {
  const r = {}, o = a(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = a(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const s = a(t, ["image"]);
  s != null && l(r, ["instances[0]", "image"], ut(s));
  const u = a(t, ["video"]);
  u != null && l(r, ["instances[0]", "video"], Ch(u));
  const c = a(t, ["source"]);
  c != null && fS(c, r);
  const d = a(t, ["config"]);
  return d != null && oS(d, r), r;
}
function uS(e, t) {
  const n = {}, r = a(e, ["generatedSamples"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((u) => mS(u))), l(n, ["generatedVideos"], s);
  }
  const o = a(e, ["raiMediaFilteredCount"]);
  o != null && l(n, ["raiMediaFilteredCount"], o);
  const i = a(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function cS(e, t) {
  const n = {}, r = a(e, ["videos"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((u) => gS(u))), l(n, ["generatedVideos"], s);
  }
  const o = a(e, ["raiMediaFilteredCount"]);
  o != null && l(n, ["raiMediaFilteredCount"], o);
  const i = a(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function dS(e, t, n) {
  const r = {}, o = a(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const i = a(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Si(i));
  const s = a(e, ["video"]);
  return t !== void 0 && s != null && l(t, ["instances[0]", "video"], Eh(s)), r;
}
function fS(e, t, n) {
  const r = {}, o = a(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const i = a(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], ut(i));
  const s = a(e, ["video"]);
  return t !== void 0 && s != null && l(t, ["instances[0]", "video"], Ch(s)), r;
}
function hS(e, t) {
  const n = {}, r = a(e, ["_self"]);
  r != null && l(n, ["image"], CS(r));
  const o = a(e, ["raiFilteredReason"]);
  o != null && l(n, ["raiFilteredReason"], o);
  const i = a(e, ["_self"]);
  return i != null && l(n, ["safetyAttributes"], Ah(i)), n;
}
function Ti(e, t) {
  const n = {}, r = a(e, ["_self"]);
  r != null && l(n, ["image"], vh(r));
  const o = a(e, ["raiFilteredReason"]);
  o != null && l(n, ["raiFilteredReason"], o);
  const i = a(e, ["_self"]);
  i != null && l(n, ["safetyAttributes"], Th(i));
  const s = a(e, ["prompt"]);
  return s != null && l(n, ["enhancedPrompt"], s), n;
}
function pS(e, t) {
  const n = {}, r = a(e, ["_self"]);
  r != null && l(n, ["mask"], vh(r));
  const o = a(e, ["labels"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => s)), l(n, ["labels"], i);
  }
  return n;
}
function mS(e, t) {
  const n = {}, r = a(e, ["video"]);
  return r != null && l(n, ["video"], oE(r)), n;
}
function gS(e, t) {
  const n = {}, r = a(e, ["_self"]);
  return r != null && l(n, ["video"], iE(r)), n;
}
function yS(e, t) {
  const n = {}, r = a(e, ["modelSelectionConfig"]);
  r != null && l(n, ["modelConfig"], r);
  const o = a(e, ["responseJsonSchema"]);
  o != null && l(n, ["responseJsonSchema"], o);
  const i = a(e, ["audioTimestamp"]);
  i != null && l(n, ["audioTimestamp"], i);
  const s = a(e, ["candidateCount"]);
  s != null && l(n, ["candidateCount"], s);
  const u = a(e, ["enableAffectiveDialog"]);
  u != null && l(n, ["enableAffectiveDialog"], u);
  const c = a(e, ["frequencyPenalty"]);
  c != null && l(n, ["frequencyPenalty"], c);
  const d = a(e, ["logprobs"]);
  d != null && l(n, ["logprobs"], d);
  const f = a(e, ["maxOutputTokens"]);
  f != null && l(n, ["maxOutputTokens"], f);
  const h = a(e, ["mediaResolution"]);
  h != null && l(n, ["mediaResolution"], h);
  const p = a(e, ["presencePenalty"]);
  p != null && l(n, ["presencePenalty"], p);
  const m = a(e, ["responseLogprobs"]);
  m != null && l(n, ["responseLogprobs"], m);
  const g = a(e, ["responseMimeType"]);
  g != null && l(n, ["responseMimeType"], g);
  const _ = a(e, ["responseModalities"]);
  _ != null && l(n, ["responseModalities"], _);
  const v = a(e, ["responseSchema"]);
  v != null && l(n, ["responseSchema"], v);
  const C = a(e, ["routingConfig"]);
  C != null && l(n, ["routingConfig"], C);
  const b = a(e, ["seed"]);
  b != null && l(n, ["seed"], b);
  const P = a(e, ["speechConfig"]);
  P != null && l(n, ["speechConfig"], P);
  const R = a(e, ["stopSequences"]);
  R != null && l(n, ["stopSequences"], R);
  const D = a(e, ["temperature"]);
  D != null && l(n, ["temperature"], D);
  const A = a(e, ["thinkingConfig"]);
  A != null && l(n, ["thinkingConfig"], A);
  const U = a(e, ["topK"]);
  U != null && l(n, ["topK"], U);
  const x = a(e, ["topP"]);
  if (x != null && l(n, ["topP"], x), a(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return n;
}
function _S(e, t, n) {
  const r = {}, o = a(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function vS(e, t, n) {
  const r = {}, o = a(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function AS(e, t) {
  const n = {}, r = a(e, ["authConfig"]);
  r != null && l(n, ["authConfig"], gT(r));
  const o = a(e, ["enableWidget"]);
  return o != null && l(n, ["enableWidget"], o), n;
}
function TS(e, t) {
  const n = {}, r = a(e, ["searchTypes"]);
  if (r != null && l(n, ["searchTypes"], r), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = a(e, ["timeRangeFilter"]);
  return o != null && l(n, ["timeRangeFilter"], o), n;
}
function SS(e, t) {
  const n = {}, r = a(e, ["aspectRatio"]);
  r != null && l(n, ["aspectRatio"], r);
  const o = a(e, ["imageSize"]);
  if (o != null && l(n, ["imageSize"], o), a(e, ["personGeneration"]) !== void 0) throw new Error("personGeneration parameter is not supported in Gemini API.");
  if (a(e, ["prominentPeople"]) !== void 0) throw new Error("prominentPeople parameter is not supported in Gemini API.");
  if (a(e, ["outputMimeType"]) !== void 0) throw new Error("outputMimeType parameter is not supported in Gemini API.");
  if (a(e, ["outputCompressionQuality"]) !== void 0) throw new Error("outputCompressionQuality parameter is not supported in Gemini API.");
  if (a(e, ["imageOutputOptions"]) !== void 0) throw new Error("imageOutputOptions parameter is not supported in Gemini API.");
  return n;
}
function ES(e, t) {
  const n = {}, r = a(e, ["aspectRatio"]);
  r != null && l(n, ["aspectRatio"], r);
  const o = a(e, ["imageSize"]);
  o != null && l(n, ["imageSize"], o);
  const i = a(e, ["personGeneration"]);
  i != null && l(n, ["personGeneration"], i);
  const s = a(e, ["prominentPeople"]);
  s != null && l(n, ["prominentPeople"], s);
  const u = a(e, ["outputMimeType"]);
  u != null && l(n, ["imageOutputOptions", "mimeType"], u);
  const c = a(e, ["outputCompressionQuality"]);
  c != null && l(n, ["imageOutputOptions", "compressionQuality"], c);
  const d = a(e, ["imageOutputOptions"]);
  return d != null && l(n, ["imageOutputOptions"], d), n;
}
function CS(e, t) {
  const n = {}, r = a(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["imageBytes"], Bt(r));
  const o = a(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function vh(e, t) {
  const n = {}, r = a(e, ["gcsUri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = a(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["imageBytes"], Bt(o));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function Si(e, t) {
  const n = {};
  if (a(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  const r = a(e, ["imageBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], Bt(r));
  const o = a(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function ut(e, t) {
  const n = {}, r = a(e, ["gcsUri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = a(e, ["imageBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], Bt(o));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function wS(e, t, n, r) {
  const o = {}, i = a(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const s = a(t, ["pageToken"]);
  n !== void 0 && s != null && l(n, ["_query", "pageToken"], s);
  const u = a(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = a(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], ch(e, c)), o;
}
function IS(e, t, n, r) {
  const o = {}, i = a(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const s = a(t, ["pageToken"]);
  n !== void 0 && s != null && l(n, ["_query", "pageToken"], s);
  const u = a(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = a(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], ch(e, c)), o;
}
function bS(e, t, n) {
  const r = {}, o = a(t, ["config"]);
  return o != null && wS(e, o, r), r;
}
function PS(e, t, n) {
  const r = {}, o = a(t, ["config"]);
  return o != null && IS(e, o, r), r;
}
function RS(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = a(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const i = a(e, ["_self"]);
  if (i != null) {
    let s = dh(i);
    Array.isArray(s) && (s = s.map((u) => xs(u))), l(n, ["models"], s);
  }
  return n;
}
function xS(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = a(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const i = a(e, ["_self"]);
  if (i != null) {
    let s = dh(i);
    Array.isArray(s) && (s = s.map((u) => Ms(u))), l(n, ["models"], s);
  }
  return n;
}
function MS(e, t) {
  const n = {}, r = a(e, ["maskMode"]);
  r != null && l(n, ["maskMode"], r);
  const o = a(e, ["segmentationClasses"]);
  o != null && l(n, ["maskClasses"], o);
  const i = a(e, ["maskDilation"]);
  return i != null && l(n, ["dilation"], i), n;
}
function xs(e, t) {
  const n = {}, r = a(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = a(e, ["displayName"]);
  o != null && l(n, ["displayName"], o);
  const i = a(e, ["description"]);
  i != null && l(n, ["description"], i);
  const s = a(e, ["version"]);
  s != null && l(n, ["version"], s);
  const u = a(e, ["_self"]);
  u != null && l(n, ["tunedModelInfo"], YS(u));
  const c = a(e, ["inputTokenLimit"]);
  c != null && l(n, ["inputTokenLimit"], c);
  const d = a(e, ["outputTokenLimit"]);
  d != null && l(n, ["outputTokenLimit"], d);
  const f = a(e, ["supportedGenerationMethods"]);
  f != null && l(n, ["supportedActions"], f);
  const h = a(e, ["temperature"]);
  h != null && l(n, ["temperature"], h);
  const p = a(e, ["maxTemperature"]);
  p != null && l(n, ["maxTemperature"], p);
  const m = a(e, ["topP"]);
  m != null && l(n, ["topP"], m);
  const g = a(e, ["topK"]);
  g != null && l(n, ["topK"], g);
  const _ = a(e, ["thinking"]);
  return _ != null && l(n, ["thinking"], _), n;
}
function Ms(e, t) {
  const n = {}, r = a(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = a(e, ["displayName"]);
  o != null && l(n, ["displayName"], o);
  const i = a(e, ["description"]);
  i != null && l(n, ["description"], i);
  const s = a(e, ["versionId"]);
  s != null && l(n, ["version"], s);
  const u = a(e, ["deployedModels"]);
  if (u != null) {
    let p = u;
    Array.isArray(p) && (p = p.map((m) => VT(m))), l(n, ["endpoints"], p);
  }
  const c = a(e, ["labels"]);
  c != null && l(n, ["labels"], c);
  const d = a(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], XS(d));
  const f = a(e, ["defaultCheckpointId"]);
  f != null && l(n, ["defaultCheckpointId"], f);
  const h = a(e, ["checkpoints"]);
  if (h != null) {
    let p = h;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["checkpoints"], p);
  }
  return n;
}
function NS(e, t) {
  const n = {}, r = a(e, ["mediaResolution"]);
  r != null && l(n, ["mediaResolution"], r);
  const o = a(e, ["codeExecutionResult"]);
  o != null && l(n, ["codeExecutionResult"], o);
  const i = a(e, ["executableCode"]);
  i != null && l(n, ["executableCode"], i);
  const s = a(e, ["fileData"]);
  s != null && l(n, ["fileData"], JT(s));
  const u = a(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], KT(u));
  const c = a(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = a(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], yT(d));
  const f = a(e, ["text"]);
  f != null && l(n, ["text"], f);
  const h = a(e, ["thought"]);
  h != null && l(n, ["thought"], h);
  const p = a(e, ["thoughtSignature"]);
  p != null && l(n, ["thoughtSignature"], p);
  const m = a(e, ["videoMetadata"]);
  m != null && l(n, ["videoMetadata"], m);
  const g = a(e, ["toolCall"]);
  g != null && l(n, ["toolCall"], g);
  const _ = a(e, ["toolResponse"]);
  _ != null && l(n, ["toolResponse"], _);
  const v = a(e, ["partMetadata"]);
  return v != null && l(n, ["partMetadata"], v), n;
}
function kS(e, t) {
  const n = {}, r = a(e, ["mediaResolution"]);
  r != null && l(n, ["mediaResolution"], r);
  const o = a(e, ["codeExecutionResult"]);
  o != null && l(n, ["codeExecutionResult"], o);
  const i = a(e, ["executableCode"]);
  i != null && l(n, ["executableCode"], i);
  const s = a(e, ["fileData"]);
  s != null && l(n, ["fileData"], s);
  const u = a(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], u);
  const c = a(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = a(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], d);
  const f = a(e, ["text"]);
  f != null && l(n, ["text"], f);
  const h = a(e, ["thought"]);
  h != null && l(n, ["thought"], h);
  const p = a(e, ["thoughtSignature"]);
  p != null && l(n, ["thoughtSignature"], p);
  const m = a(e, ["videoMetadata"]);
  if (m != null && l(n, ["videoMetadata"], m), a(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (a(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (a(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return n;
}
function DS(e, t) {
  const n = {}, r = a(e, ["productImage"]);
  return r != null && l(n, ["image"], ut(r)), n;
}
function $S(e, t, n) {
  const r = {}, o = a(e, ["numberOfImages"]);
  t !== void 0 && o != null && l(t, ["parameters", "sampleCount"], o);
  const i = a(e, ["baseSteps"]);
  t !== void 0 && i != null && l(t, ["parameters", "baseSteps"], i);
  const s = a(e, ["outputGcsUri"]);
  t !== void 0 && s != null && l(t, ["parameters", "storageUri"], s);
  const u = a(e, ["seed"]);
  t !== void 0 && u != null && l(t, ["parameters", "seed"], u);
  const c = a(e, ["safetyFilterLevel"]);
  t !== void 0 && c != null && l(t, ["parameters", "safetySetting"], c);
  const d = a(e, ["personGeneration"]);
  t !== void 0 && d != null && l(t, ["parameters", "personGeneration"], d);
  const f = a(e, ["addWatermark"]);
  t !== void 0 && f != null && l(t, ["parameters", "addWatermark"], f);
  const h = a(e, ["outputMimeType"]);
  t !== void 0 && h != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], h);
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
function LS(e, t, n) {
  const r = {}, o = a(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = a(t, ["source"]);
  i != null && FS(i, r);
  const s = a(t, ["config"]);
  return s != null && $S(s, r), r;
}
function US(e, t) {
  const n = {}, r = a(e, ["predictions"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => Ti(i))), l(n, ["generatedImages"], o);
  }
  return n;
}
function FS(e, t, n) {
  const r = {}, o = a(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const i = a(e, ["personImage"]);
  t !== void 0 && i != null && l(t, [
    "instances[0]",
    "personImage",
    "image"
  ], ut(i));
  const s = a(e, ["productImages"]);
  if (t !== void 0 && s != null) {
    let u = s;
    Array.isArray(u) && (u = u.map((c) => DS(c))), l(t, ["instances[0]", "productImages"], u);
  }
  return r;
}
function OS(e, t) {
  const n = {}, r = a(e, ["referenceImage"]);
  r != null && l(n, ["referenceImage"], ut(r));
  const o = a(e, ["referenceId"]);
  o != null && l(n, ["referenceId"], o);
  const i = a(e, ["referenceType"]);
  i != null && l(n, ["referenceType"], i);
  const s = a(e, ["maskImageConfig"]);
  s != null && l(n, ["maskImageConfig"], MS(s));
  const u = a(e, ["controlImageConfig"]);
  u != null && l(n, ["controlImageConfig"], CT(u));
  const c = a(e, ["styleImageConfig"]);
  c != null && l(n, ["styleImageConfig"], c);
  const d = a(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function Ah(e, t) {
  const n = {}, r = a(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const o = a(e, ["safetyAttributes", "scores"]);
  o != null && l(n, ["scores"], o);
  const i = a(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function Th(e, t) {
  const n = {}, r = a(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const o = a(e, ["safetyAttributes", "scores"]);
  o != null && l(n, ["scores"], o);
  const i = a(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function qS(e, t) {
  const n = {}, r = a(e, ["category"]);
  if (r != null && l(n, ["category"], r), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = a(e, ["threshold"]);
  return o != null && l(n, ["threshold"], o), n;
}
function BS(e, t) {
  const n = {}, r = a(e, ["image"]);
  return r != null && l(n, ["image"], ut(r)), n;
}
function GS(e, t, n) {
  const r = {}, o = a(e, ["mode"]);
  t !== void 0 && o != null && l(t, ["parameters", "mode"], o);
  const i = a(e, ["maxPredictions"]);
  t !== void 0 && i != null && l(t, ["parameters", "maxPredictions"], i);
  const s = a(e, ["confidenceThreshold"]);
  t !== void 0 && s != null && l(t, ["parameters", "confidenceThreshold"], s);
  const u = a(e, ["maskDilation"]);
  t !== void 0 && u != null && l(t, ["parameters", "maskDilation"], u);
  const c = a(e, ["binaryColorThreshold"]);
  t !== void 0 && c != null && l(t, ["parameters", "binaryColorThreshold"], c);
  const d = a(e, ["labels"]);
  return t !== void 0 && d != null && l(t, ["labels"], d), r;
}
function HS(e, t, n) {
  const r = {}, o = a(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = a(t, ["source"]);
  i != null && JS(i, r);
  const s = a(t, ["config"]);
  return s != null && GS(s, r), r;
}
function VS(e, t) {
  const n = {}, r = a(e, ["predictions"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => pS(i))), l(n, ["generatedMasks"], o);
  }
  return n;
}
function JS(e, t, n) {
  const r = {}, o = a(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const i = a(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], ut(i));
  const s = a(e, ["scribbleImage"]);
  return t !== void 0 && s != null && l(t, ["instances[0]", "scribble"], BS(s)), r;
}
function KS(e, t) {
  const n = {}, r = a(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const o = a(e, ["functionCallingConfig"]);
  o != null && l(n, ["functionCallingConfig"], WT(o));
  const i = a(e, ["includeServerSideToolInvocations"]);
  return i != null && l(n, ["includeServerSideToolInvocations"], i), n;
}
function WS(e, t) {
  const n = {}, r = a(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const o = a(e, ["functionCallingConfig"]);
  if (o != null && l(n, ["functionCallingConfig"], o), a(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function zS(e, t) {
  const n = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const r = a(e, ["computerUse"]);
  r != null && l(n, ["computerUse"], r);
  const o = a(e, ["fileSearch"]);
  o != null && l(n, ["fileSearch"], o);
  const i = a(e, ["googleSearch"]);
  i != null && l(n, ["googleSearch"], TS(i));
  const s = a(e, ["googleMaps"]);
  s != null && l(n, ["googleMaps"], AS(s));
  const u = a(e, ["codeExecution"]);
  if (u != null && l(n, ["codeExecution"], u), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const c = a(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["functionDeclarations"], p);
  }
  const d = a(e, ["googleSearchRetrieval"]);
  if (d != null && l(n, ["googleSearchRetrieval"], d), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const f = a(e, ["urlContext"]);
  f != null && l(n, ["urlContext"], f);
  const h = a(e, ["mcpServers"]);
  if (h != null) {
    let p = h;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["mcpServers"], p);
  }
  return n;
}
function Sh(e, t) {
  const n = {}, r = a(e, ["retrieval"]);
  r != null && l(n, ["retrieval"], r);
  const o = a(e, ["computerUse"]);
  if (o != null && l(n, ["computerUse"], o), a(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const i = a(e, ["googleSearch"]);
  i != null && l(n, ["googleSearch"], i);
  const s = a(e, ["googleMaps"]);
  s != null && l(n, ["googleMaps"], s);
  const u = a(e, ["codeExecution"]);
  u != null && l(n, ["codeExecution"], u);
  const c = a(e, ["enterpriseWebSearch"]);
  c != null && l(n, ["enterpriseWebSearch"], c);
  const d = a(e, ["functionDeclarations"]);
  if (d != null) {
    let m = d;
    Array.isArray(m) && (m = m.map((g) => zT(g))), l(n, ["functionDeclarations"], m);
  }
  const f = a(e, ["googleSearchRetrieval"]);
  f != null && l(n, ["googleSearchRetrieval"], f);
  const h = a(e, ["parallelAiSearch"]);
  h != null && l(n, ["parallelAiSearch"], h);
  const p = a(e, ["urlContext"]);
  if (p != null && l(n, ["urlContext"], p), a(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function YS(e, t) {
  const n = {}, r = a(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = a(e, ["createTime"]);
  o != null && l(n, ["createTime"], o);
  const i = a(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function XS(e, t) {
  const n = {}, r = a(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  r != null && l(n, ["baseModel"], r);
  const o = a(e, ["createTime"]);
  o != null && l(n, ["createTime"], o);
  const i = a(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function QS(e, t, n) {
  const r = {}, o = a(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const i = a(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const s = a(e, ["defaultCheckpointId"]);
  return t !== void 0 && s != null && l(t, ["defaultCheckpointId"], s), r;
}
function ZS(e, t, n) {
  const r = {}, o = a(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const i = a(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const s = a(e, ["defaultCheckpointId"]);
  return t !== void 0 && s != null && l(t, ["defaultCheckpointId"], s), r;
}
function jS(e, t, n) {
  const r = {}, o = a(t, ["model"]);
  o != null && l(r, ["_url", "name"], Y(e, o));
  const i = a(t, ["config"]);
  return i != null && QS(i, r), r;
}
function eE(e, t, n) {
  const r = {}, o = a(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = a(t, ["config"]);
  return i != null && ZS(i, r), r;
}
function tE(e, t, n) {
  const r = {}, o = a(e, ["outputGcsUri"]);
  t !== void 0 && o != null && l(t, ["parameters", "storageUri"], o);
  const i = a(e, ["safetyFilterLevel"]);
  t !== void 0 && i != null && l(t, ["parameters", "safetySetting"], i);
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
  const f = a(e, ["enhanceInputImage"]);
  t !== void 0 && f != null && l(t, [
    "parameters",
    "upscaleConfig",
    "enhanceInputImage"
  ], f);
  const h = a(e, ["imagePreservationFactor"]);
  t !== void 0 && h != null && l(t, [
    "parameters",
    "upscaleConfig",
    "imagePreservationFactor"
  ], h);
  const p = a(e, ["labels"]);
  t !== void 0 && p != null && l(t, ["labels"], p);
  const m = a(e, ["numberOfImages"]);
  t !== void 0 && m != null && l(t, ["parameters", "sampleCount"], m);
  const g = a(e, ["mode"]);
  return t !== void 0 && g != null && l(t, ["parameters", "mode"], g), r;
}
function nE(e, t, n) {
  const r = {}, o = a(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = a(t, ["image"]);
  i != null && l(r, ["instances[0]", "image"], ut(i));
  const s = a(t, ["upscaleFactor"]);
  s != null && l(r, [
    "parameters",
    "upscaleConfig",
    "upscaleFactor"
  ], s);
  const u = a(t, ["config"]);
  return u != null && tE(u, r), r;
}
function rE(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = a(e, ["predictions"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => Ti(s))), l(n, ["generatedImages"], i);
  }
  return n;
}
function oE(e, t) {
  const n = {}, r = a(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const o = a(e, ["encodedVideo"]);
  o != null && l(n, ["videoBytes"], Bt(o));
  const i = a(e, ["encoding"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function iE(e, t) {
  const n = {}, r = a(e, ["gcsUri"]);
  r != null && l(n, ["uri"], r);
  const o = a(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["videoBytes"], Bt(o));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function sE(e, t) {
  const n = {}, r = a(e, ["image"]);
  r != null && l(n, ["_self"], ut(r));
  const o = a(e, ["maskMode"]);
  return o != null && l(n, ["maskMode"], o), n;
}
function aE(e, t) {
  const n = {}, r = a(e, ["image"]);
  r != null && l(n, ["image"], Si(r));
  const o = a(e, ["referenceType"]);
  return o != null && l(n, ["referenceType"], o), n;
}
function lE(e, t) {
  const n = {}, r = a(e, ["image"]);
  r != null && l(n, ["image"], ut(r));
  const o = a(e, ["referenceType"]);
  return o != null && l(n, ["referenceType"], o), n;
}
function Eh(e, t) {
  const n = {}, r = a(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const o = a(e, ["videoBytes"]);
  o != null && l(n, ["encodedVideo"], Bt(o));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["encoding"], i), n;
}
function Ch(e, t) {
  const n = {}, r = a(e, ["uri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = a(e, ["videoBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], Bt(o));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function uE(e, t) {
  const n = {}, r = a(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["displayName"], r), n;
}
function cE(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && uE(n, t), t;
}
function dE(e, t) {
  const n = {}, r = a(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function fE(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = a(e, ["config"]);
  return r != null && dE(r, t), t;
}
function hE(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function pE(e, t) {
  const n = {}, r = a(e, ["customMetadata"]);
  if (t !== void 0 && r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => s)), l(t, ["customMetadata"], i);
  }
  const o = a(e, ["chunkingConfig"]);
  return t !== void 0 && o != null && l(t, ["chunkingConfig"], o), n;
}
function mE(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = a(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = a(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], yE(s)), t;
}
function gE(e) {
  const t = {}, n = a(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = a(e, ["fileName"]);
  r != null && l(t, ["fileName"], r);
  const o = a(e, ["config"]);
  return o != null && pE(o, t), t;
}
function yE(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = a(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function _E(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = a(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function vE(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && _E(n, t), t;
}
function AE(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = a(e, ["fileSearchStores"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => s)), l(t, ["fileSearchStores"], i);
  }
  return t;
}
function wh(e, t) {
  const n = {}, r = a(e, ["mimeType"]);
  t !== void 0 && r != null && l(t, ["mimeType"], r);
  const o = a(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const i = a(e, ["customMetadata"]);
  if (t !== void 0 && i != null) {
    let u = i;
    Array.isArray(u) && (u = u.map((c) => c)), l(t, ["customMetadata"], u);
  }
  const s = a(e, ["chunkingConfig"]);
  return t !== void 0 && s != null && l(t, ["chunkingConfig"], s), n;
}
function TE(e) {
  const t = {}, n = a(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = a(e, ["config"]);
  return r != null && wh(r, t), t;
}
function SE(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var EE = "Content-Type", CE = "X-Server-Timeout", wE = "User-Agent", Ns = "x-goog-api-client", IE = "google-genai-sdk/1.50.1", bE = "v1beta1", PE = "v1beta", RE = /* @__PURE__ */ new Set(["us", "eu"]), xE = 5, ME = [
  408,
  429,
  500,
  502,
  503,
  504
], NE = class {
  constructor(e) {
    var t, n, r;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const o = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const i = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !i ? (o.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? o.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && RE.has(this.clientOptions.location) ? o.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (o.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), o.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : bE;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), o.apiVersion = (r = this.clientOptions.apiVersion) !== null && r !== void 0 ? r : PE, o.baseUrl = "https://generativelanguage.googleapis.com/";
    o.headers = this.getDefaultHeaders(), this.clientOptions.httpOptions = o, e.httpOptions && (this.clientOptions.httpOptions = this.patchHttpOptions(o, e.httpOptions));
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
    return !(t.baseUrl && t.baseUrlResourceScope === Is.COLLECTION || this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
  }
  async request(e) {
    let t = this.clientOptions.httpOptions;
    e.httpOptions && (t = this.patchHttpOptions(this.clientOptions.httpOptions, e.httpOptions));
    const n = this.shouldPrependVertexProjectPath(e, t), r = this.constructUrl(e.path, t, n);
    if (e.queryParams) for (const [i, s] of Object.entries(e.queryParams)) r.searchParams.append(i, String(s));
    let o = {};
    if (e.httpMethod === "GET") {
      if (e.body && e.body !== "{}") throw new Error("Request body should be empty for GET request, but got non empty request body");
    } else o.body = e.body;
    return o = await this.includeExtraHttpOptionsToRequestInit(o, t, r.toString(), e.abortSignal), this.unaryApiCall(r, o, e.httpMethod);
  }
  patchHttpOptions(e, t) {
    const n = JSON.parse(JSON.stringify(e));
    for (const [r, o] of Object.entries(t)) typeof o == "object" ? n[r] = Object.assign(Object.assign({}, n[r]), o) : o !== void 0 && (n[r] = o);
    return n;
  }
  async requestStream(e) {
    let t = this.clientOptions.httpOptions;
    e.httpOptions && (t = this.patchHttpOptions(this.clientOptions.httpOptions, e.httpOptions));
    const n = this.shouldPrependVertexProjectPath(e, t), r = this.constructUrl(e.path, t, n);
    (!r.searchParams.has("alt") || r.searchParams.get("alt") !== "sse") && r.searchParams.set("alt", "sse");
    let o = {};
    return o.body = e.body, o = await this.includeExtraHttpOptionsToRequestInit(o, t, r.toString(), e.abortSignal), this.streamApiCall(r, o, e.httpMethod);
  }
  async includeExtraHttpOptionsToRequestInit(e, t, n, r) {
    if (t && t.timeout || r) {
      const o = new AbortController(), i = o.signal;
      if (t.timeout && t?.timeout > 0) {
        const s = setTimeout(() => o.abort(), t.timeout);
        s && typeof s.unref == "function" && s.unref();
      }
      r && r.addEventListener("abort", () => {
        o.abort();
      }), e.signal = i;
    }
    return t && t.extraBody !== null && kE(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await Nc(r), new bs(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await Nc(r), this.processStreamResponse(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  processStreamResponse(e) {
    return at(this, arguments, function* () {
      var n;
      const r = (n = e?.body) === null || n === void 0 ? void 0 : n.getReader(), o = new TextDecoder("utf-8");
      if (!r) throw new Error("Response body is empty");
      try {
        let i = "";
        const s = "data:", u = [
          `

`,
          "\r\r",
          `\r
\r
`
        ];
        for (; ; ) {
          const { done: c, value: d } = yield K(r.read());
          if (c) {
            if (i.trim().length > 0) throw new Error("Incomplete JSON segment at the end");
            break;
          }
          const f = o.decode(d, { stream: !0 });
          try {
            const m = JSON.parse(f);
            if ("error" in m) {
              const g = JSON.parse(JSON.stringify(m.error)), _ = g.status, v = g.code, C = `got status: ${_}. ${JSON.stringify(m)}`;
              if (v >= 400 && v < 600) throw new yh({
                message: C,
                status: v
              });
            }
          } catch (m) {
            if (m.name === "ApiError") throw m;
          }
          i += f;
          let h = -1, p = 0;
          for (; ; ) {
            h = -1, p = 0;
            for (const _ of u) {
              const v = i.indexOf(_);
              v !== -1 && (h === -1 || v < h) && (h = v, p = _.length);
            }
            if (h === -1) break;
            const m = i.substring(0, h);
            i = i.substring(h + p);
            const g = m.trim();
            if (g.startsWith(s)) {
              const _ = g.substring(5).trim();
              try {
                yield yield K(new bs(new Response(_, {
                  headers: e?.headers,
                  status: e?.status,
                  statusText: e?.statusText
                })));
              } catch (v) {
                throw new Error(`exception parsing stream chunk ${_}. ${v}`);
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
    const r = this.clientOptions.httpOptions.retryOptions, o = async () => {
      const i = await fetch(e, t);
      if (i.ok) return i;
      throw ME.includes(i.status) ? new Error(`Retryable HTTP Error: ${i.statusText}`) : new ou.AbortError(`Non-retryable exception ${i.statusText} sending request`);
    };
    return (0, ou.default)(o, { retries: ((n = r.attempts) !== null && n !== void 0 ? n : xE) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = IE + " " + this.clientOptions.userAgentExtra;
    return e[wE] = t, e[Ns] = t, e[EE] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [r, o] of Object.entries(e.headers)) n.append(r, o);
      e.timeout && e.timeout > 0 && n.append(CE, String(Math.ceil(e.timeout / 1e3)));
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
    const o = this.clientOptions.uploader, i = await o.stat(e);
    r.sizeBytes = String(i.size);
    const s = (n = t?.mimeType) !== null && n !== void 0 ? n : i.type;
    if (s === void 0 || s === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    r.mimeType = s;
    const u = { file: r }, c = this.getFileName(e), d = L("upload/v1beta/files", u._url), f = await this.fetchUploadUrl(d, r.sizeBytes, r.mimeType, c, u, t?.httpOptions);
    return o.upload(e, f, this);
  }
  async uploadFileToFileSearchStore(e, t, n) {
    var r;
    const o = this.clientOptions.uploader, i = await o.stat(t), s = String(i.size), u = (r = n?.mimeType) !== null && r !== void 0 ? r : i.type;
    if (u === void 0 || u === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    const c = `upload/v1beta/${e}:uploadToFileSearchStore`, d = this.getFileName(t), f = {};
    n != null && wh(n, f);
    const h = await this.fetchUploadUrl(c, s, u, d, f, n?.httpOptions);
    return o.uploadToFileSearchStore(t, h, this);
  }
  async downloadFile(e) {
    await this.clientOptions.downloader.download(e, this);
  }
  async fetchUploadUrl(e, t, n, r, o, i) {
    var s;
    let u = {};
    i ? u = i : u = {
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
      body: JSON.stringify(o),
      httpMethod: "POST",
      httpOptions: u
    });
    if (!c || !c?.headers) throw new Error("Server did not return an HttpResponse or the returned HttpResponse did not have headers.");
    const d = (s = c?.headers) === null || s === void 0 ? void 0 : s["x-goog-upload-url"];
    if (d === void 0) throw new Error("Failed to get upload url. Server did not return the x-google-upload-url in the headers");
    return d;
  }
};
async function Nc(e) {
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
    const o = JSON.stringify(r);
    throw n >= 400 && n < 600 ? new yh({
      message: o,
      status: n
    }) : new Error(o);
  }
}
function kE(e, t) {
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
  function r(i, s) {
    const u = Object.assign({}, i);
    for (const c in s) if (Object.prototype.hasOwnProperty.call(s, c)) {
      const d = s[c], f = u[c];
      d && typeof d == "object" && !Array.isArray(d) && f && typeof f == "object" && !Array.isArray(f) ? u[c] = r(f, d) : (f && d && typeof f != typeof d && console.warn(`includeExtraBodyToRequestInit:deepMerge: Type mismatch for key "${c}". Original type: ${typeof f}, New type: ${typeof d}. Overwriting.`), u[c] = d);
    }
    return u;
  }
  const o = r(n, t);
  e.body = JSON.stringify(o);
}
var DE = "mcp_used/unknown", $E = !1;
function Ih(e) {
  for (const t of e)
    if (LE(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return $E;
}
function bh(e) {
  var t;
  e[Ns] = (((t = e[Ns]) !== null && t !== void 0 ? t : "") + ` ${DE}`).trimStart();
}
function LE(e) {
  return e !== null && typeof e == "object" && e instanceof FE;
}
function UE(e) {
  return at(this, arguments, function* (n, r = 100) {
    let o, i = 0;
    for (; i < r; ) {
      const s = yield K(n.listTools({ cursor: o }));
      for (const u of s.tools)
        yield yield K(u), i++;
      if (!s.nextCursor) break;
      o = s.nextCursor;
    }
  });
}
var FE = class Ph {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new Ph(t, n);
  }
  async initialize() {
    var t, n, r, o;
    if (this.mcpTools.length > 0) return;
    const i = {}, s = [];
    for (const f of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, lt(UE(f))), d; d = await c.next(), t = d.done, !t; u = !0) {
        o = d.value, u = !1;
        const h = o;
        s.push(h);
        const p = h.name;
        if (i[p]) throw new Error(`Duplicate function name ${p} found in MCP tools. Please ensure function names are unique.`);
        i[p] = f;
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
    this.mcpTools = s, this.functionNameToMcpClient = i;
  }
  async tool() {
    return await this.initialize(), Z_(this.mcpTools, this.config);
  }
  async callTool(t) {
    await this.initialize();
    const n = [];
    for (const r of t) if (r.name in this.functionNameToMcpClient) {
      const o = this.functionNameToMcpClient[r.name];
      let i;
      this.config.timeout && (i = { timeout: this.config.timeout });
      const s = await o.callTool({
        name: r.name,
        arguments: r.args
      }, void 0, i);
      n.push({ functionResponse: {
        name: r.name,
        response: s.isError ? { error: s } : s
      } });
    }
    return n;
  }
};
async function OE(e, t, n) {
  const r = new H_();
  let o;
  n.data instanceof Blob ? o = JSON.parse(await n.data.text()) : o = JSON.parse(n.data), Object.assign(r, o), t(r);
}
var qE = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const r = this.apiClient.getWebsocketBaseUrl(), o = this.apiClient.getApiVersion(), i = HE(this.apiClient.getDefaultHeaders()), s = `${r}/ws/google.ai.generativelanguage.${o}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((_) => {
      u = _;
    }), d = e.callbacks, f = function() {
      u({});
    }, h = this.apiClient, p = {
      onopen: f,
      onmessage: (_) => {
        OE(h, d.onmessage, _);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(_) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(_) {
      }
    }, m = this.webSocketFactory.create(s, GE(i), p);
    m.connect(), await c;
    const g = { setup: { model: Y(this.apiClient, e.model) } };
    return m.send(JSON.stringify(g)), new BE(m, this.apiClient);
  }
}, BE = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = oT(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = rT(e);
    this.conn.send(JSON.stringify(t));
  }
  sendPlaybackControl(e) {
    const t = { playbackControl: e };
    this.conn.send(JSON.stringify(t));
  }
  play() {
    this.sendPlaybackControl(Rn.PLAY);
  }
  pause() {
    this.sendPlaybackControl(Rn.PAUSE);
  }
  stop() {
    this.sendPlaybackControl(Rn.STOP);
  }
  resetContext() {
    this.sendPlaybackControl(Rn.RESET_CONTEXT);
  }
  close() {
    this.conn.close();
  }
};
function GE(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function HE(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var VE = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function JE(e, t, n) {
  const r = new G_();
  let o;
  n.data instanceof Blob ? o = await n.data.text() : n.data instanceof ArrayBuffer ? o = new TextDecoder().decode(n.data) : o = n.data;
  const i = JSON.parse(o);
  if (e.isVertexAI()) {
    const s = aT(i);
    Object.assign(r, s);
  } else Object.assign(r, i);
  t(r);
}
var KE = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new qE(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, r, o, i, s;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const f = this.apiClient.getHeaders();
    e.config && e.config.tools && Ih(e.config.tools) && bh(f);
    const h = XE(f);
    if (this.apiClient.isVertexAI()) {
      const x = this.apiClient.getProject(), $ = this.apiClient.getLocation(), H = this.apiClient.getApiKey(), z = !!x && !!$ || !!H;
      this.apiClient.getCustomBaseUrl() && !z ? d = u : (d = `${u}/ws/google.cloud.aiplatform.${c}.LlmBidiService/BidiGenerateContent`, await this.auth.addAuthHeaders(h, d));
    } else {
      const x = this.apiClient.getApiKey();
      let $ = "BidiGenerateContent", H = "key";
      x?.startsWith("auth_tokens/") && (console.warn("Warning: Ephemeral token support is experimental and may change in future versions."), c !== "v1alpha" && console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection."), $ = "BidiGenerateContentConstrained", H = "access_token"), d = `${u}/ws/google.ai.generativelanguage.${c}.GenerativeService.${$}?${H}=${x}`;
    }
    let p = () => {
    };
    const m = new Promise((x) => {
      p = x;
    }), g = e.callbacks, _ = function() {
      var x;
      (x = g?.onopen) === null || x === void 0 || x.call(g), p({});
    }, v = this.apiClient, C = {
      onopen: _,
      onmessage: (x) => {
        JE(v, g.onmessage, x);
      },
      onerror: (t = g?.onerror) !== null && t !== void 0 ? t : function(x) {
      },
      onclose: (n = g?.onclose) !== null && n !== void 0 ? n : function(x) {
      }
    }, b = this.webSocketFactory.create(d, YE(h), C);
    b.connect(), await m;
    let P = Y(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && P.startsWith("publishers/")) {
      const x = this.apiClient.getProject(), $ = this.apiClient.getLocation();
      x && $ && (P = `projects/${x}/locations/${$}/` + P);
    }
    let R = {};
    this.apiClient.isVertexAI() && ((r = e.config) === null || r === void 0 ? void 0 : r.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [jo.AUDIO] } : e.config.responseModalities = [jo.AUDIO]), !((o = e.config) === null || o === void 0) && o.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    const D = (s = (i = e.config) === null || i === void 0 ? void 0 : i.tools) !== null && s !== void 0 ? s : [], A = [];
    for (const x of D) if (this.isCallableTool(x)) {
      const $ = x;
      A.push(await $.tool());
    } else A.push(x);
    A.length > 0 && (e.config.tools = A);
    const U = {
      model: P,
      config: e.config,
      callbacks: e.callbacks
    };
    return this.apiClient.isVertexAI() ? R = nT(this.apiClient, U) : R = tT(this.apiClient, U), delete R.config, b.send(JSON.stringify(R)), new zE(b, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, WE = { turnComplete: !0 }, zE = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let n = [];
      try {
        n = De(t.turns), e.isVertexAI() || (n = n.map((r) => Zr(r)));
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
      if (!e.isVertexAI() && !("id" in r)) throw new Error(VE);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, WE), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: sT(e) } : t = { realtimeInput: iT(e) }, this.conn.send(JSON.stringify(t));
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
function YE(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function XE(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var kc = 10;
function Dc(e) {
  var t, n, r;
  if (!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.disable) return !0;
  let o = !1;
  for (const s of (n = e?.tools) !== null && n !== void 0 ? n : []) if (Ln(s)) {
    o = !0;
    break;
  }
  if (!o) return !0;
  const i = (r = e?.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls;
  return i && (i < 0 || !Number.isInteger(i)) || i == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", i), !0) : !1;
}
function Ln(e) {
  return "callTool" in e && typeof e.callTool == "function";
}
function QE(e) {
  var t, n, r;
  return (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((o) => Ln(o))) !== null && r !== void 0 ? r : !1;
}
function $c(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((r, o) => {
    if (Ln(r)) return;
    const i = r;
    i.functionDeclarations && i.functionDeclarations.length > 0 && n.push(o);
  }), n;
}
function Lc(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var ZE = class extends wt {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = De(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = De(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const r = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: ei.EMBED_CONTENT
        });
        return await this.embedContentInternal(r);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: ei.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, r, o, i, s;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !QE(t) || Dc(t.config)) return await this.generateContentInternal(u);
      const c = $c(t);
      if (c.length > 0) {
        const g = c.map((_) => `tools[${_}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${g}.`);
      }
      let d, f;
      const h = De(u.contents), p = (o = (r = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls) !== null && o !== void 0 ? o : kc;
      let m = 0;
      for (; m < p && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const g = d.candidates[0].content, _ = [];
        for (const v of (s = (i = t.config) === null || i === void 0 ? void 0 : i.tools) !== null && s !== void 0 ? s : []) if (Ln(v)) {
          const C = await v.callTool(d.functionCalls);
          _.push(...C);
        }
        m++, f = {
          role: "user",
          parts: _
        }, u.contents = De(u.contents), u.contents.push(g), u.contents.push(f), Lc(u.config) && (h.push(g), h.push(f));
      }
      return Lc(u.config) && (d.automaticFunctionCallingHistory = h), d;
    }, this.generateContentStream = async (t) => {
      var n, r, o, i, s;
      if (this.maybeMoveToResponseJsonSchem(t), Dc(t.config)) {
        const f = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(f);
      }
      const u = $c(t);
      if (u.length > 0) {
        const f = u.map((h) => `tools[${h}]`).join(", ");
        throw new Error(`Incompatible tools found at ${f}. Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations" is not yet supported.`);
      }
      const c = (o = (r = (n = t?.config) === null || n === void 0 ? void 0 : n.toolConfig) === null || r === void 0 ? void 0 : r.functionCallingConfig) === null || o === void 0 ? void 0 : o.streamFunctionCallArguments, d = (s = (i = t?.config) === null || i === void 0 ? void 0 : i.automaticFunctionCalling) === null || s === void 0 ? void 0 : s.disable;
      if (c && !d) throw new Error("Running in streaming mode with 'streamFunctionCallArguments' enabled, this feature is not compatible with automatic function calling (AFC). Please set 'config.automaticFunctionCalling.disable' to true to disable AFC or leave 'config.toolConfig.functionCallingConfig.streamFunctionCallArguments' to be undefined or set to false to disable streaming function call arguments feature.");
      return await this.processAfcStream(t);
    }, this.generateImages = async (t) => await this.generateImagesInternal(t).then((n) => {
      var r;
      let o;
      const i = [];
      if (n?.generatedImages) for (const u of n.generatedImages) u && u?.safetyAttributes && ((r = u?.safetyAttributes) === null || r === void 0 ? void 0 : r.contentType) === "Positive Prompt" ? o = u?.safetyAttributes : i.push(u);
      let s;
      return o ? s = {
        generatedImages: i,
        positivePromptSafetyAttributes: o,
        sdkHttpResponse: n.sdkHttpResponse
      } : s = {
        generatedImages: i,
        sdkHttpResponse: n.sdkHttpResponse
      }, s;
    }), this.list = async (t) => {
      var n;
      const r = { config: Object.assign(Object.assign({}, { queryBase: !0 }), t?.config) };
      if (this.apiClient.isVertexAI() && !r.config.queryBase) {
        if (!((n = r.config) === null || n === void 0) && n.filter) throw new Error("Filtering tuned models list for Vertex AI is not currently supported");
        r.config.filter = "labels.tune-type:*";
      }
      return new ln(Ct.PAGED_ITEM_MODELS, (o) => this.listInternal(o), await this.listInternal(r), r);
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
      var n, r, o, i, s, u;
      if ((t.prompt || t.image || t.video) && t.source) throw new Error("Source and prompt/image/video are mutually exclusive. Please only use source.");
      return this.apiClient.isVertexAI() || (!((n = t.video) === null || n === void 0) && n.uri && (!((r = t.video) === null || r === void 0) && r.videoBytes) ? t.video = {
        uri: t.video.uri,
        mimeType: t.video.mimeType
      } : !((i = (o = t.source) === null || o === void 0 ? void 0 : o.video) === null || i === void 0) && i.uri && (!((u = (s = t.source) === null || s === void 0 ? void 0 : s.video) === null || u === void 0) && u.videoBytes) && (t.source.video = {
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
    const o = (t = e.config) === null || t === void 0 ? void 0 : t.tools;
    if (!o) return e;
    const i = await Promise.all(o.map(async (u) => Ln(u) ? await u.tool() : u)), s = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: i })
    };
    if (s.config.tools = i, e.config && e.config.tools && Ih(e.config.tools)) {
      const u = (r = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && r !== void 0 ? r : {};
      let c = Object.assign({}, u);
      Object.keys(c).length === 0 && (c = this.apiClient.getDefaultHeaders()), bh(c), s.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: c });
    }
    return s;
  }
  async initAfcToolsMap(e) {
    var t, n, r;
    const o = /* @__PURE__ */ new Map();
    for (const i of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (Ln(i)) {
      const s = i, u = await s.tool();
      for (const c of (r = u.functionDeclarations) !== null && r !== void 0 ? r : []) {
        if (!c.name) throw new Error("Function declaration name is required.");
        if (o.has(c.name)) throw new Error(`Duplicate tool declaration name: ${c.name}`);
        o.set(c.name, s);
      }
    }
    return o;
  }
  async processAfcStream(e) {
    var t, n, r;
    const o = (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && r !== void 0 ? r : kc;
    let i = !1, s = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, f) {
      return at(this, arguments, function* () {
        for (var h, p, m, g, _, v; s < o; ) {
          i && (s++, i = !1);
          const R = yield K(c.processParamsMaybeAddMcpUsage(f)), D = yield K(c.generateContentStreamInternal(R)), A = [], U = [];
          try {
            for (var C = !0, b = (p = void 0, lt(D)), P; P = yield K(b.next()), h = P.done, !h; C = !0) {
              g = P.value, C = !1;
              const x = g;
              if (yield yield K(x), x.candidates && (!((_ = x.candidates[0]) === null || _ === void 0) && _.content)) {
                U.push(x.candidates[0].content);
                for (const $ of (v = x.candidates[0].content.parts) !== null && v !== void 0 ? v : []) if (s < o && $.functionCall) {
                  if (!$.functionCall.name) throw new Error("Function call name was not returned by the model.");
                  if (d.has($.functionCall.name)) {
                    const H = yield K(d.get($.functionCall.name).callTool([$.functionCall]));
                    A.push(...H);
                  } else
                    throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${d.keys()}, mising tool: ${$.functionCall.name}`);
                }
              }
            }
          } catch (x) {
            p = { error: x };
          } finally {
            try {
              !C && !h && (m = b.return) && (yield K(m.call(b)));
            } finally {
              if (p) throw p.error;
            }
          }
          if (A.length > 0) {
            i = !0;
            const x = new ur();
            x.candidates = [{ content: {
              role: "user",
              parts: A
            } }], yield yield K(x);
            const $ = [];
            $.push(...U), $.push({
              role: "user",
              parts: A
            }), f.contents = De(f.contents).concat($);
          } else break;
        }
      });
    })(this, u, e);
  }
  async generateContentInternal(e) {
    var t, n, r, o;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Rc(this.apiClient, e);
      return s = L("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = Mc(d), h = new ur();
        return Object.assign(h, f), h;
      });
    } else {
      const c = Pc(this.apiClient, e);
      return s = L("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = xc(d), h = new ur();
        return Object.assign(h, f), h;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, r, o;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Rc(this.apiClient, e);
      return s = L("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }), i.then(function(d) {
        return at(this, arguments, function* () {
          var f, h, p, m;
          try {
            for (var g = !0, _ = lt(d), v; v = yield K(_.next()), f = v.done, !f; g = !0) {
              m = v.value, g = !1;
              const C = m, b = Mc(yield K(C.json()), e);
              b.sdkHttpResponse = { headers: C.headers };
              const P = new ur();
              Object.assign(P, b), yield yield K(P);
            }
          } catch (C) {
            h = { error: C };
          } finally {
            try {
              !g && !f && (p = _.return) && (yield K(p.call(_)));
            } finally {
              if (h) throw h.error;
            }
          }
        });
      });
    } else {
      const c = Pc(this.apiClient, e);
      return s = L("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }), i.then(function(d) {
        return at(this, arguments, function* () {
          var f, h, p, m;
          try {
            for (var g = !0, _ = lt(d), v; v = yield K(_.next()), f = v.done, !f; g = !0) {
              m = v.value, g = !1;
              const C = m, b = xc(yield K(C.json()), e);
              b.sdkHttpResponse = { headers: C.headers };
              const P = new ur();
              Object.assign(P, b), yield yield K(P);
            }
          } catch (C) {
            h = { error: C };
          } finally {
            try {
              !g && !f && (p = _.return) && (yield K(p.call(_)));
            } finally {
              if (h) throw h.error;
            }
          }
        });
      });
    }
  }
  async embedContentInternal(e) {
    var t, n, r, o;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = BT(this.apiClient, e, e);
      return s = L(ev(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = HT(d, e), h = new lc();
        return Object.assign(h, f), h;
      });
    } else {
      const c = qT(this.apiClient, e);
      return s = L("{model}:batchEmbedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = GT(d), h = new lc();
        return Object.assign(h, f), h;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, r, o;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = eS(this.apiClient, e);
      return s = L("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = nS(d), h = new uc();
        return Object.assign(h, f), h;
      });
    } else {
      const c = jT(this.apiClient, e);
      return s = L("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = tS(d), h = new uc();
        return Object.assign(h, f), h;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = LT(this.apiClient, e);
      return o = L("{model}:predict", s._url), i = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = UT(u), d = new R_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = nE(this.apiClient, e);
      return o = L("{model}:predict", s._url), i = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = rE(u), d = new x_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = LS(this.apiClient, e);
      return o = L("{model}:predict", s._url), i = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = US(u), d = new M_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = HS(this.apiClient, e);
      return o = L("{model}:predict", s._url), i = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = VS(u), d = new N_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, r, o;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = vS(this.apiClient, e);
      return s = L("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Ms(d));
    } else {
      const c = _S(this.apiClient, e);
      return s = L("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => xs(d));
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = PS(this.apiClient, e);
      return s = L("{models_url}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = xS(d), h = new cc();
        return Object.assign(h, f), h;
      });
    } else {
      const c = bS(this.apiClient, e);
      return s = L("{models_url}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = RS(d), h = new cc();
        return Object.assign(h, f), h;
      });
    }
  }
  async update(e) {
    var t, n, r, o;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = eE(this.apiClient, e);
      return s = L("{model}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Ms(d));
    } else {
      const c = jS(this.apiClient, e);
      return s = L("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => xs(d));
    }
  }
  async delete(e) {
    var t, n, r, o;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = NT(this.apiClient, e);
      return s = L("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = DT(d), h = new dc();
        return Object.assign(h, f), h;
      });
    } else {
      const c = MT(this.apiClient, e);
      return s = L("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = kT(d), h = new dc();
        return Object.assign(h, f), h;
      });
    }
  }
  async countTokens(e) {
    var t, n, r, o;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = PT(this.apiClient, e);
      return s = L("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = xT(d), h = new fc();
        return Object.assign(h, f), h;
      });
    } else {
      const c = bT(this.apiClient, e);
      return s = L("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = RT(d), h = new fc();
        return Object.assign(h, f), h;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = AT(this.apiClient, e);
      return o = L("{model}:computeTokens", s._url), i = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = TT(u), d = new k_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, r, o;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = lS(this.apiClient, e);
      return s = L("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const f = sS(d), h = new hc();
        return Object.assign(h, f), h;
      });
    } else {
      const c = aS(this.apiClient, e);
      return s = L("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const f = iS(d), h = new hc();
        return Object.assign(h, f), h;
      });
    }
  }
}, jE = class extends wt {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async getVideosOperation(e) {
    const t = e.operation, n = e.config;
    if (t.name === void 0 || t.name === "") throw new Error("Operation name is required.");
    if (this.apiClient.isVertexAI()) {
      const r = t.name.split("/operations/")[0];
      let o;
      n && "httpOptions" in n && (o = n.httpOptions);
      const i = await this.fetchPredictVideosOperationInternal({
        operationName: t.name,
        resourceName: r,
        config: { httpOptions: o }
      });
      return t._fromAPIResponse({
        apiResponse: i,
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
      let o;
      n && "httpOptions" in n && (o = n.httpOptions);
      const i = await this.fetchPredictVideosOperationInternal({
        operationName: t.name,
        resourceName: r,
        config: { httpOptions: o }
      });
      return t._fromAPIResponse({
        apiResponse: i,
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
    var t, n, r, o;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = E_(e);
      return s = L("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i;
    } else {
      const c = S_(e);
      return s = L("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i;
    }
  }
  async fetchPredictVideosOperationInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = m_(e);
      return o = L("{resourceName}:fetchPredictOperation", s._url), i = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r;
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
};
function Uc(e) {
  const t = {};
  if (a(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function eC(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function tC(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function nC(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => dC(i))), l(t, ["parts"], o);
  }
  const r = a(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function rC(e, t, n) {
  const r = {}, o = a(t, ["expireTime"]);
  n !== void 0 && o != null && l(n, ["expireTime"], o);
  const i = a(t, ["newSessionExpireTime"]);
  n !== void 0 && i != null && l(n, ["newSessionExpireTime"], i);
  const s = a(t, ["uses"]);
  n !== void 0 && s != null && l(n, ["uses"], s);
  const u = a(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && l(n, ["bidiGenerateContentSetup"], cC(e, u));
  const c = a(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && l(n, ["fieldMask"], c), r;
}
function oC(e, t) {
  const n = {}, r = a(t, ["config"]);
  return r != null && l(n, ["config"], rC(e, r, n)), n;
}
function iC(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function sC(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = a(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = a(e, ["name"]);
  if (o != null && l(t, ["name"], o), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function aC(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], eC(n));
  const r = a(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function lC(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = a(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function uC(e, t) {
  const n = {}, r = a(e, ["generationConfig"]);
  t !== void 0 && r != null && l(t, ["setup", "generationConfig"], r);
  const o = a(e, ["responseModalities"]);
  t !== void 0 && o != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], o);
  const i = a(e, ["temperature"]);
  t !== void 0 && i != null && l(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], i);
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
  const f = a(e, ["seed"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], f);
  const h = a(e, ["speechConfig"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], Pa(h));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], nC(Te(g)));
  const _ = a(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let x = Gn(_);
    Array.isArray(x) && (x = x.map(($) => pC(Bn($)))), l(t, ["setup", "tools"], x);
  }
  const v = a(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], hC(v));
  const C = a(e, ["inputAudioTranscription"]);
  t !== void 0 && C != null && l(t, ["setup", "inputAudioTranscription"], Uc(C));
  const b = a(e, ["outputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "outputAudioTranscription"], Uc(b));
  const P = a(e, ["realtimeInputConfig"]);
  t !== void 0 && P != null && l(t, ["setup", "realtimeInputConfig"], P);
  const R = a(e, ["contextWindowCompression"]);
  t !== void 0 && R != null && l(t, ["setup", "contextWindowCompression"], R);
  const D = a(e, ["proactivity"]);
  if (t !== void 0 && D != null && l(t, ["setup", "proactivity"], D), a(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const A = a(e, ["avatarConfig"]);
  t !== void 0 && A != null && l(t, ["setup", "avatarConfig"], A);
  const U = a(e, ["safetySettings"]);
  if (t !== void 0 && U != null) {
    let x = U;
    Array.isArray(x) && (x = x.map(($) => fC($))), l(t, ["setup", "safetySettings"], x);
  }
  return n;
}
function cC(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["setup", "model"], Y(e, r));
  const o = a(t, ["config"]);
  return o != null && l(n, ["config"], uC(o, n)), n;
}
function dC(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = a(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = a(e, ["fileData"]);
  i != null && l(t, ["fileData"], iC(i));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], sC(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], tC(c));
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const f = a(e, ["thought"]);
  f != null && l(t, ["thought"], f);
  const h = a(e, ["thoughtSignature"]);
  h != null && l(t, ["thoughtSignature"], h);
  const p = a(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = a(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = a(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = a(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function fC(e) {
  const t = {}, n = a(e, ["category"]);
  if (n != null && l(t, ["category"], n), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = a(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function hC(e) {
  const t = {}, n = a(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), a(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function pC(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = a(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = a(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], lC(o));
  const i = a(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], aC(i));
  const s = a(e, ["codeExecution"]);
  if (s != null && l(t, ["codeExecution"], s), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = a(e, ["functionDeclarations"]);
  if (u != null) {
    let h = u;
    Array.isArray(h) && (h = h.map((p) => p)), l(t, ["functionDeclarations"], h);
  }
  const c = a(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = a(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const f = a(e, ["mcpServers"]);
  if (f != null) {
    let h = f;
    Array.isArray(h) && (h = h.map((p) => p)), l(t, ["mcpServers"], h);
  }
  return t;
}
function mC(e) {
  const t = [];
  for (const n in e) if (Object.prototype.hasOwnProperty.call(e, n)) {
    const r = e[n];
    if (typeof r == "object" && r != null && Object.keys(r).length > 0) {
      const o = Object.keys(r).map((i) => `${n}.${i}`);
      t.push(...o);
    } else t.push(n);
  }
  return t.join(",");
}
function gC(e, t) {
  let n = null;
  const r = e.bidiGenerateContentSetup;
  if (typeof r == "object" && r !== null && "setup" in r) {
    const i = r.setup;
    typeof i == "object" && i !== null ? (e.bidiGenerateContentSetup = i, n = i) : delete e.bidiGenerateContentSetup;
  } else r !== void 0 && delete e.bidiGenerateContentSetup;
  const o = e.fieldMask;
  if (n) {
    const i = mC(n);
    if (Array.isArray(t?.lockAdditionalFields) && t?.lockAdditionalFields.length === 0) i ? e.fieldMask = i : delete e.fieldMask;
    else if (t?.lockAdditionalFields && t.lockAdditionalFields.length > 0 && o !== null && Array.isArray(o) && o.length > 0) {
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
      o.length > 0 && (u = o.map((d) => s.includes(d) ? `generationConfig.${d}` : d));
      const c = [];
      i && c.push(i), u.length > 0 && c.push(...u), c.length > 0 ? e.fieldMask = c.join(",") : delete e.fieldMask;
    } else delete e.fieldMask;
  } else o !== null && Array.isArray(o) && o.length > 0 ? e.fieldMask = o.join(",") : delete e.fieldMask;
  return e;
}
var yC = class extends wt {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const s = oC(this.apiClient, e);
      o = L("auth_tokens", s._url), i = s._query, delete s.config, delete s._url, delete s._query;
      const u = gC(s, e.config);
      return r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json()), r.then((c) => c);
    }
  }
};
function _C(e, t) {
  const n = {}, r = a(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function vC(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = a(e, ["config"]);
  return r != null && _C(r, t), t;
}
function AC(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function TC(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = a(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function SC(e) {
  const t = {}, n = a(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const r = a(e, ["config"]);
  return r != null && TC(r, t), t;
}
function EC(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = a(e, ["documents"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => s)), l(t, ["documents"], i);
  }
  return t;
}
var CC = class extends wt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new ln(Ct.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = AC(e);
      return o = L("{name}", s._url), i = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => u);
    }
  }
  async delete(e) {
    var t, n;
    let r = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const i = vC(e);
      r = L("{name}", i._url), o = i._query, delete i._url, delete i._query, await this.apiClient.request({
        path: r,
        queryParams: o,
        body: JSON.stringify(i),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = SC(e);
      return o = L("{parent}/documents", s._url), i = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = EC(u), d = new D_();
        return Object.assign(d, c), d;
      });
    }
  }
}, wC = class extends wt {
  constructor(e, t = new CC(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new ln(Ct.PAGED_ITEM_FILE_SEARCH_STORES, (r) => this.listInternal(r), await this.listInternal(n), n);
  }
  async uploadToFileSearchStore(e) {
    if (this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support uploading files to a file search store.");
    return this.apiClient.uploadFileToFileSearchStore(e.fileSearchStoreName, e.file, e.config);
  }
  async create(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = cE(e);
      return o = L("fileSearchStores", s._url), i = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => u);
    }
  }
  async get(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = hE(e);
      return o = L("{name}", s._url), i = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => u);
    }
  }
  async delete(e) {
    var t, n;
    let r = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const i = fE(e);
      r = L("{name}", i._url), o = i._query, delete i._url, delete i._query, await this.apiClient.request({
        path: r,
        queryParams: o,
        body: JSON.stringify(i),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = vE(e);
      return o = L("fileSearchStores", s._url), i = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = AE(u), d = new $_();
        return Object.assign(d, c), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = TE(e);
      return o = L("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", s._url), i = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = SE(u), d = new L_();
        return Object.assign(d, c), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = gE(e);
      return o = L("{file_search_store_name}:importFile", s._url), i = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = mE(u), d = new U_();
        return Object.assign(d, c), d;
      });
    }
  }
}, Rh = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Rh = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
}, IC = () => Rh();
function ks(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Ds = (e) => {
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
}, je = class extends Error {
}, tt = class $s extends je {
  constructor(t, n, r, o) {
    super(`${$s.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.error = n;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new Ei({
      message: r,
      cause: Ds(n)
    });
    const i = n;
    return t === 400 ? new Mh(t, i, r, o) : t === 401 ? new Nh(t, i, r, o) : t === 403 ? new kh(t, i, r, o) : t === 404 ? new Dh(t, i, r, o) : t === 409 ? new $h(t, i, r, o) : t === 422 ? new Lh(t, i, r, o) : t === 429 ? new Uh(t, i, r, o) : t >= 500 ? new Fh(t, i, r, o) : new $s(t, i, r, o);
  }
}, Ls = class extends tt {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Ei = class extends tt {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, xh = class extends Ei {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Mh = class extends tt {
}, Nh = class extends tt {
}, kh = class extends tt {
}, Dh = class extends tt {
}, $h = class extends tt {
}, Lh = class extends tt {
}, Uh = class extends tt {
}, Fh = class extends tt {
}, bC = /^[a-z][a-z0-9+.-]*:/i, PC = (e) => bC.test(e), Us = (e) => (Us = Array.isArray, Us(e)), Fc = Us;
function Oc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function RC(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var xC = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new je(`${e} must be an integer`);
  if (t < 0) throw new je(`${e} must be a positive integer`);
  return t;
}, MC = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, NC = (e) => new Promise((t) => setTimeout(t, e));
function kC() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Oh(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function DC(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Oh({
    start() {
    },
    async pull(n) {
      const { done: r, value: o } = await t.next();
      r ? n.close() : n.enqueue(o);
    },
    async cancel() {
      var n;
      await ((n = t.return) === null || n === void 0 ? void 0 : n.call(t));
    }
  });
}
function qh(e) {
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
async function $C(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const r = e.getReader(), o = r.cancel();
  r.releaseLock(), await o;
}
var LC = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function UC(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new je(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var FC = "0.0.1", Bh = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Zi(e, t, n) {
  return Bh(), new File(e, t ?? "unknown_file", n);
}
function OC(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var qC = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Gh = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", BC = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Gh(e), GC = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function HC(e, t, n) {
  if (Bh(), e = await e, BC(e))
    return e instanceof File ? e : Zi([await e.arrayBuffer()], e.name);
  if (GC(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Zi(await Fs(o), t, n);
  }
  const r = await Fs(e);
  if (t || (t = OC(e)), !n?.type) {
    const o = r.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof o == "string" && (n = Object.assign(Object.assign({}, n), { type: o }));
  }
  return Zi(r, t, n);
}
async function Fs(e) {
  var t, n, r, o, i;
  let s = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) s.push(e);
  else if (Gh(e)) s.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (qC(e)) try {
    for (var u = !0, c = lt(e), d; d = await c.next(), t = d.done, !t; u = !0) {
      o = d.value, u = !1;
      const f = o;
      s.push(...await Fs(f));
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
  else {
    const f = (i = e?.constructor) === null || i === void 0 ? void 0 : i.name;
    throw new Error(`Unexpected data type: ${typeof e}${f ? `; constructor: ${f}` : ""}${VC(e)}`);
  }
  return s;
}
function VC(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var Ra = class {
  constructor(e) {
    this._client = e;
  }
};
Ra._key = [];
function Hh(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var qc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), JC = (e = Hh) => (function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const i = [], s = n.reduce((f, h, p) => {
    var m, g, _;
    /[?#]/.test(h) && (o = !0);
    const v = r[p];
    let C = (o ? encodeURIComponent : e)("" + v);
    return p !== r.length && (v == null || typeof v == "object" && v.toString === ((_ = Object.getPrototypeOf((g = Object.getPrototypeOf((m = v.hasOwnProperty) !== null && m !== void 0 ? m : qc)) !== null && g !== void 0 ? g : qc)) === null || _ === void 0 ? void 0 : _.toString)) && (C = v + "", i.push({
      start: f.length + h.length,
      length: C.length,
      error: `Value of type ${Object.prototype.toString.call(v).slice(8, -1)} is not a valid path parameter`
    })), f + h + (p === r.length ? "" : C);
  }, ""), u = s.split(/[?#]/, 1)[0], c = /(^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) {
    const f = d[0].startsWith("/"), h = f ? 1 : 0, p = f ? d[0].slice(1) : d[0];
    i.push({
      start: d.index + h,
      length: p.length,
      error: `Value "${p}" can't be safely passed as a path parameter`
    });
  }
  if (i.sort((f, h) => f.start - h.start), i.length > 0) {
    let f = 0;
    const h = i.reduce((p, m) => {
      const g = " ".repeat(m.start - f), _ = "^".repeat(m.length);
      return f = m.start + m.length, p + g + _;
    }, "");
    throw new je(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${s}
${h}`);
  }
  return s;
}), rt = /* @__PURE__ */ JC(Hh), Vh = class extends Ra {
  create(e, t) {
    var n;
    const { api_version: r = this._client.apiVersion } = e, o = Ft(e, ["api_version"]);
    if ("model" in o && "agent_config" in o) throw new je("Invalid request: specified `model` and `agent_config`. If specifying `model`, use `generation_config`.");
    if ("agent" in o && "generation_config" in o) throw new je("Invalid request: specified `agent` and `generation_config`. If specifying `agent`, use `agent_config`.");
    return this._client.post(rt`/${r}/interactions`, Object.assign(Object.assign({ body: o }, t), { stream: (n = e.stream) !== null && n !== void 0 ? n : !1 }));
  }
  delete(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.delete(rt`/${r}/interactions/${e}`, n);
  }
  cancel(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.post(rt`/${r}/interactions/${e}/cancel`, n);
  }
  get(e, t = {}, n) {
    var r;
    const o = t ?? {}, { api_version: i = this._client.apiVersion } = o, s = Ft(o, ["api_version"]);
    return this._client.get(rt`/${i}/interactions/${e}`, Object.assign(Object.assign({ query: s }, n), { stream: (r = t?.stream) !== null && r !== void 0 ? r : !1 }));
  }
};
Vh._key = Object.freeze(["interactions"]);
var Jh = class extends Vh {
}, Kh = class extends Ra {
  create(e, t) {
    const { api_version: n = this._client.apiVersion, webhook_id: r } = e, o = Ft(e, ["api_version", "webhook_id"]);
    return this._client.post(rt`/${n}/webhooks`, Object.assign({
      query: { webhook_id: r },
      body: o
    }, t));
  }
  update(e, t, n) {
    const { api_version: r = this._client.apiVersion, update_mask: o } = t, i = Ft(t, ["api_version", "update_mask"]);
    return this._client.patch(rt`/${r}/webhooks/${e}`, Object.assign({
      query: { update_mask: o },
      body: i
    }, n));
  }
  list(e = {}, t) {
    const n = e ?? {}, { api_version: r = this._client.apiVersion } = n, o = Ft(n, ["api_version"]);
    return this._client.get(rt`/${r}/webhooks`, Object.assign({ query: o }, t));
  }
  delete(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.delete(rt`/${r}/webhooks/${e}`, n);
  }
  get(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.get(rt`/${r}/webhooks/${e}`, n);
  }
  ping(e, t = void 0, n) {
    const { api_version: r = this._client.apiVersion, body: o } = t ?? {};
    return this._client.post(rt`/${r}/webhooks/${e}:ping`, Object.assign({ body: o }, n));
  }
  rotateSigningSecret(e, t = {}, n) {
    const r = t ?? {}, { api_version: o = this._client.apiVersion } = r, i = Ft(r, ["api_version"]);
    return this._client.post(rt`/${o}/webhooks/${e}:rotateSigningSecret`, Object.assign({ body: i }, n));
  }
};
Kh._key = Object.freeze(["webhooks"]);
var Wh = class extends Kh {
};
function KC(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var Co;
function xa(e) {
  let t;
  return (Co ?? (t = new globalThis.TextEncoder(), Co = t.encode.bind(t)))(e);
}
var wo;
function Bc(e) {
  let t;
  return (wo ?? (t = new globalThis.TextDecoder(), wo = t.decode.bind(t)))(e);
}
var Ci = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? xa(e) : e;
    this.buffer = KC([this.buffer, n]);
    const r = [];
    let o;
    for (; (o = WC(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (o.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = o.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (o.index !== this.carriageReturnIndex + 1 || o.carriage)) {
        r.push(Bc(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const i = this.carriageReturnIndex !== null ? o.preceding - 1 : o.preceding, s = Bc(this.buffer.subarray(0, i));
      r.push(s), this.buffer = this.buffer.subarray(o.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), r;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
Ci.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Ci.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function WC(e, t) {
  const o = t ?? 0, i = e.indexOf(10, o), s = e.indexOf(13, o);
  if (i === -1 && s === -1) return null;
  let u;
  return i !== -1 && s !== -1 ? u = Math.min(i, s) : u = i !== -1 ? i : s, e[u] === 10 ? {
    preceding: u,
    index: u + 1,
    carriage: !1
  } : {
    preceding: u,
    index: u + 1,
    carriage: !0
  };
}
var ni = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Gc = (e, t, n) => {
  if (e) {
    if (RC(ni, e)) return e;
    xe(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(ni))}`);
  }
};
function yr() {
}
function Io(e, t, n) {
  return !t || ni[e] > ni[n] ? yr : t[e].bind(t);
}
var zC = {
  error: yr,
  warn: yr,
  info: yr,
  debug: yr
}, Hc = /* @__PURE__ */ new WeakMap();
function xe(e) {
  var t;
  const n = e.logger, r = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return zC;
  const o = Hc.get(n);
  if (o && o[0] === r) return o[1];
  const i = {
    error: Io("error", n, r),
    warn: Io("warn", n, r),
    info: Io("info", n, r),
    debug: Io("debug", n, r)
  };
  return Hc.set(n, [r, i]), i;
}
var zt = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), YC = class _r {
  constructor(t, n, r) {
    this.iterator = t, this.controller = n, this.client = r;
  }
  static fromSSEResponse(t, n, r) {
    let o = !1;
    const i = r ? xe(r) : console;
    function s() {
      return at(this, arguments, function* () {
        var c, d, f, h;
        if (o) throw new je("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        o = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = lt(XC(t, n)), _; _ = yield K(g.next()), c = _.done, !c; m = !0) {
              h = _.value, m = !1;
              const v = h;
              if (!p)
                if (v.data.startsWith("[DONE]")) {
                  p = !0;
                  continue;
                } else try {
                  yield yield K(JSON.parse(v.data));
                } catch (C) {
                  throw i.error("Could not parse message into JSON:", v.data), i.error("From chunk:", v.raw), C;
                }
            }
          } catch (v) {
            d = { error: v };
          } finally {
            try {
              !m && !c && (f = g.return) && (yield K(f.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (v) {
          if (ks(v)) return yield K(void 0);
          throw v;
        } finally {
          p || n.abort();
        }
      });
    }
    return new _r(s, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    function i() {
      return at(this, arguments, function* () {
        var c, d, f, h;
        const p = new Ci(), m = qh(t);
        try {
          for (var g = !0, _ = lt(m), v; v = yield K(_.next()), c = v.done, !c; g = !0) {
            h = v.value, g = !1;
            const C = h;
            for (const b of p.decode(C)) yield yield K(b);
          }
        } catch (C) {
          d = { error: C };
        } finally {
          try {
            !g && !c && (f = _.return) && (yield K(f.call(_)));
          } finally {
            if (d) throw d.error;
          }
        }
        for (const C of p.flush()) yield yield K(C);
      });
    }
    function s() {
      return at(this, arguments, function* () {
        var c, d, f, h;
        if (o) throw new je("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        o = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = lt(i()), _; _ = yield K(g.next()), c = _.done, !c; m = !0) {
              h = _.value, m = !1;
              const v = h;
              p || v && (yield yield K(JSON.parse(v)));
            }
          } catch (v) {
            d = { error: v };
          } finally {
            try {
              !m && !c && (f = g.return) && (yield K(f.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (v) {
          if (ks(v)) return yield K(void 0);
          throw v;
        } finally {
          p || n.abort();
        }
      });
    }
    return new _r(s, n, r);
  }
  [Symbol.asyncIterator]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], r = this.iterator(), o = (i) => ({ next: () => {
      if (i.length === 0) {
        const s = r.next();
        t.push(s), n.push(s);
      }
      return i.shift();
    } });
    return [new _r(() => o(t), this.controller, this.client), new _r(() => o(n), this.controller, this.client)];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Oh({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: i } = await n.next();
          if (i) return r.close();
          const s = xa(JSON.stringify(o) + `
`);
          r.enqueue(s);
        } catch (o) {
          r.error(o);
        }
      },
      async cancel() {
        var r;
        await ((r = n.return) === null || r === void 0 ? void 0 : r.call(n));
      }
    });
  }
};
function XC(e, t) {
  return at(this, arguments, function* () {
    var r, o, i, s;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new je("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new je("Attempted to iterate over a response with no body");
    const u = new ZC(), c = new Ci(), d = qh(e.body);
    try {
      for (var f = !0, h = lt(QC(d)), p; p = yield K(h.next()), r = p.done, !r; f = !0) {
        s = p.value, f = !1;
        const m = s;
        for (const g of c.decode(m)) {
          const _ = u.decode(g);
          _ && (yield yield K(_));
        }
      }
    } catch (m) {
      o = { error: m };
    } finally {
      try {
        !f && !r && (i = h.return) && (yield K(i.call(h)));
      } finally {
        if (o) throw o.error;
      }
    }
    for (const m of c.flush()) {
      const g = u.decode(m);
      g && (yield yield K(g));
    }
  });
}
function QC(e) {
  return at(this, arguments, function* () {
    var n, r, o, i;
    try {
      for (var s = !0, u = lt(e), c; c = yield K(u.next()), n = c.done, !n; s = !0) {
        i = c.value, s = !1;
        const d = i;
        d != null && (yield yield K(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? xa(d) : d));
      }
    } catch (d) {
      r = { error: d };
    } finally {
      try {
        !s && !n && (o = u.return) && (yield K(o.call(u)));
      } finally {
        if (r) throw r.error;
      }
    }
  });
}
var ZC = class {
  constructor() {
    this.event = null, this.data = [], this.chunks = [];
  }
  decode(e) {
    if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
      if (!this.event && !this.data.length) return null;
      const o = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      return this.event = null, this.data = [], this.chunks = [], o;
    }
    if (this.chunks.push(e), e.startsWith(":")) return null;
    let [t, n, r] = jC(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function jC(e, t) {
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
async function ew(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: i } = t, s = await (async () => {
    var u;
    if (t.options.stream)
      return xe(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : YC.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type"), d = (u = c?.split(";")[0]) === null || u === void 0 ? void 0 : u.trim();
    return d?.includes("application/json") || d?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
  })();
  return xe(e).debug(`[${r}] response parsed`, zt({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: s,
    durationMs: Date.now() - i
  })), s;
}
var tw = class zh extends Promise {
  constructor(t, n, r = ew) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, this.client = t;
  }
  _thenUnwrap(t) {
    return new zh(this.client, this.responsePromise, async (n, r) => t(await this.parseResponse(n, r), r));
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
}, Yh = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* nw(e) {
  if (!e) return;
  if (Yh in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const i of o) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Fc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const i = Fc(r[1]) ? r[1] : [r[1]];
    let s = !1;
    for (const u of i)
      u !== void 0 && (t && !s && (s = !0, yield [o, null]), yield [o, u]);
  }
}
var cr = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [i, s] of nw(r)) {
      const u = i.toLowerCase();
      o.has(u) || (t.delete(i), o.add(u)), s === null ? (t.delete(i), n.add(u)) : (t.append(i, s), n.delete(u));
    }
  }
  return {
    [Yh]: !0,
    values: t,
    nulls: n
  };
}, ji = (e) => {
  var t, n, r, o, i;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((i = (o = (r = globalThis.Deno.env) === null || r === void 0 ? void 0 : r.get) === null || o === void 0 ? void 0 : o.call(r, e)) === null || i === void 0 ? void 0 : i.trim()) || void 0;
}, Xh, Qh = class Zh {
  constructor(t) {
    var n, r, o, i, s, u, c, { baseURL: d = ji("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: f = (n = ji("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: h = "v1beta" } = t, p = Ft(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: f,
      apiVersion: h
    }, p), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (r = m.timeout) !== null && r !== void 0 ? r : Zh.DEFAULT_TIMEOUT, this.logger = (o = m.logger) !== null && o !== void 0 ? o : console;
    const g = "warn";
    this.logLevel = g, this.logLevel = (s = (i = Gc(m.logLevel, "ClientOptions.logLevel", this)) !== null && i !== void 0 ? i : Gc(ji("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && s !== void 0 ? s : g, this.fetchOptions = m.fetchOptions, this.maxRetries = (u = m.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = m.fetch) !== null && c !== void 0 ? c : kC(), this.encoder = LC, this._options = m, this.apiKey = f, this.apiVersion = h, this.clientAdapter = m.clientAdapter;
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
    const n = cr([t.headers]);
    if (!(n.values.has("authorization") || n.values.has("x-goog-api-key"))) {
      if (this.apiKey) return cr([{ "x-goog-api-key": this.apiKey }]);
      if (this.clientAdapter && this.clientAdapter.isVertexAI()) return cr([await this.clientAdapter.getAuthHeaders()]);
    }
  }
  stringifyQuery(t) {
    return UC(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${FC}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${IC()}`;
  }
  makeStatusError(t, n, r, o) {
    return tt.generate(t, n, r, o);
  }
  buildURL(t, n, r) {
    const o = !this.baseURLOverridden() && r || this.baseURL, i = PC(t) ? new URL(t) : new URL(o + (o.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), s = this.defaultQuery(), u = Object.fromEntries(i.searchParams);
    return (!Oc(s) || !Oc(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), s), n)), typeof n == "object" && n && !Array.isArray(n) && (i.search = this.stringifyQuery(n)), i.toString();
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
    return this.request(Promise.resolve(r).then((o) => Object.assign({
      method: t,
      path: n
    }, o)));
  }
  request(t, n = null) {
    return new tw(this, this.makeRequest(t, n, void 0));
  }
  async makeRequest(t, n, r) {
    var o, i, s;
    const u = await t, c = (o = u.maxRetries) !== null && o !== void 0 ? o : this.maxRetries;
    n == null && (n = c), await this.prepareOptions(u);
    const { req: d, url: f, timeout: h } = await this.buildRequest(u, { retryCount: c - n });
    await this.prepareRequest(d, {
      url: f,
      options: u
    });
    const p = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), m = r === void 0 ? "" : `, retryOf: ${r}`, g = Date.now();
    if (xe(this).debug(`[${p}] sending request`, zt({
      retryOfRequestLogID: r,
      method: u.method,
      url: f,
      options: u,
      headers: d.headers
    })), !((i = u.signal) === null || i === void 0) && i.aborted) throw new Ls();
    const _ = new AbortController(), v = await this.fetchWithTimeout(f, d, h, _).catch(Ds), C = Date.now();
    if (v instanceof globalThis.Error) {
      const P = `retrying, ${n} attempts remaining`;
      if (!((s = u.signal) === null || s === void 0) && s.aborted) throw new Ls();
      const R = ks(v) || /timed? ?out/i.test(String(v) + ("cause" in v ? String(v.cause) : ""));
      if (n)
        return xe(this).info(`[${p}] connection ${R ? "timed out" : "failed"} - ${P}`), xe(this).debug(`[${p}] connection ${R ? "timed out" : "failed"} (${P})`, zt({
          retryOfRequestLogID: r,
          url: f,
          durationMs: C - g,
          message: v.message
        })), this.retryRequest(u, n, r ?? p);
      throw xe(this).info(`[${p}] connection ${R ? "timed out" : "failed"} - error; no more retries left`), xe(this).debug(`[${p}] connection ${R ? "timed out" : "failed"} (error; no more retries left)`, zt({
        retryOfRequestLogID: r,
        url: f,
        durationMs: C - g,
        message: v.message
      })), R ? new xh() : new Ei({ cause: v });
    }
    const b = `[${p}${m}] ${d.method} ${f} ${v.ok ? "succeeded" : "failed"} with status ${v.status} in ${C - g}ms`;
    if (!v.ok) {
      const P = await this.shouldRetry(v);
      if (n && P) {
        const x = `retrying, ${n} attempts remaining`;
        return await $C(v.body), xe(this).info(`${b} - ${x}`), xe(this).debug(`[${p}] response error (${x})`, zt({
          retryOfRequestLogID: r,
          url: v.url,
          status: v.status,
          headers: v.headers,
          durationMs: C - g
        })), this.retryRequest(u, n, r ?? p, v.headers);
      }
      const R = P ? "error; no more retries left" : "error; not retryable";
      xe(this).info(`${b} - ${R}`);
      const D = await v.text().catch((x) => Ds(x).message), A = MC(D), U = A ? void 0 : D;
      throw xe(this).debug(`[${p}] response error (${R})`, zt({
        retryOfRequestLogID: r,
        url: v.url,
        status: v.status,
        headers: v.headers,
        message: U,
        durationMs: Date.now() - g
      })), this.makeStatusError(v.status, A, U, v.headers);
    }
    return xe(this).info(b), xe(this).debug(`[${p}] response start`, zt({
      retryOfRequestLogID: r,
      url: v.url,
      status: v.status,
      headers: v.headers,
      durationMs: C - g
    })), {
      response: v,
      options: u,
      controller: _,
      requestLogID: p,
      retryOfRequestLogID: r,
      startTime: g
    };
  }
  async fetchWithTimeout(t, n, r, o) {
    const i = n || {}, { signal: s, method: u } = i, c = Ft(i, ["signal", "method"]), d = this._makeAbort(o);
    s && s.addEventListener("abort", d, { once: !0 });
    const f = setTimeout(d, r), h = globalThis.ReadableStream && c.body instanceof globalThis.ReadableStream || typeof c.body == "object" && c.body !== null && Symbol.asyncIterator in c.body, p = Object.assign(Object.assign(Object.assign({ signal: o.signal }, h ? { duplex: "half" } : {}), { method: "GET" }), c);
    u && (p.method = u.toUpperCase());
    try {
      return await this.fetch.call(void 0, t, p);
    } finally {
      clearTimeout(f);
    }
  }
  async shouldRetry(t) {
    const n = t.headers.get("x-should-retry");
    return n === "true" ? !0 : n === "false" ? !1 : t.status === 408 || t.status === 409 || t.status === 429 || t.status >= 500;
  }
  async retryRequest(t, n, r, o) {
    var i;
    let s;
    const u = o?.get("retry-after-ms");
    if (u) {
      const d = parseFloat(u);
      Number.isNaN(d) || (s = d);
    }
    const c = o?.get("retry-after");
    if (c && !s) {
      const d = parseFloat(c);
      Number.isNaN(d) ? s = Date.parse(c) - Date.now() : s = d * 1e3;
    }
    if (s === void 0) {
      const d = (i = t.maxRetries) !== null && i !== void 0 ? i : this.maxRetries;
      s = this.calculateDefaultRetryTimeoutMillis(n, d);
    }
    return await NC(s), this.makeRequest(t, n - 1, r);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const i = n - t;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var r, o, i;
    const s = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: f } = s, h = this.buildURL(c, d, f);
    "timeout" in s && xC("timeout", s.timeout), s.timeout = (r = s.timeout) !== null && r !== void 0 ? r : this.timeout;
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
      }, s.signal && { signal: s.signal }), globalThis.ReadableStream && m instanceof globalThis.ReadableStream && { duplex: "half" }), m && { body: m }), (o = this.fetchOptions) !== null && o !== void 0 ? o : {}), (i = s.fetchOptions) !== null && i !== void 0 ? i : {}),
      url: h,
      timeout: s.timeout
    };
  }
  async buildHeaders({ options: t, method: n, bodyHeaders: r, retryCount: o }) {
    let i = {};
    this.idempotencyHeader && n !== "get" && (t.idempotencyKey || (t.idempotencyKey = this.defaultIdempotencyKey()), i[this.idempotencyHeader] = t.idempotencyKey);
    const s = await this.authHeaders(t);
    let u = cr([
      i,
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
    const r = cr([n]);
    return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && r.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: t
    } : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
      bodyHeaders: void 0,
      body: DC(t)
    } : typeof t == "object" && r.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: r
    });
  }
};
Qh.DEFAULT_TIMEOUT = 6e4;
var me = class extends Qh {
  constructor() {
    super(...arguments), this.interactions = new Jh(this), this.webhooks = new Wh(this);
  }
};
Xh = me;
me.GeminiNextGenAPIClient = Xh;
me.GeminiNextGenAPIClientError = je;
me.APIError = tt;
me.APIConnectionError = Ei;
me.APIConnectionTimeoutError = xh;
me.APIUserAbortError = Ls;
me.NotFoundError = Dh;
me.ConflictError = $h;
me.RateLimitError = Uh;
me.BadRequestError = Mh;
me.AuthenticationError = Nh;
me.InternalServerError = Fh;
me.PermissionDeniedError = kh;
me.UnprocessableEntityError = Lh;
me.toFile = HC;
me.Interactions = Jh;
me.Webhooks = Wh;
function rw(e, t) {
  const n = {}, r = a(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function ow(e, t) {
  const n = {}, r = a(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function iw(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function sw(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function aw(e, t, n) {
  const r = {};
  if (a(e, ["validationDataset"]) !== void 0) throw new Error("validationDataset parameter is not supported in Gemini API.");
  const o = a(e, ["tunedModelDisplayName"]);
  if (t !== void 0 && o != null && l(t, ["displayName"], o), a(e, ["description"]) !== void 0) throw new Error("description parameter is not supported in Gemini API.");
  const i = a(e, ["epochCount"]);
  t !== void 0 && i != null && l(t, [
    "tuningTask",
    "hyperparameters",
    "epochCount"
  ], i);
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
function lw(e, t, n) {
  const r = {};
  let o = a(n, ["config", "method"]);
  if (o === void 0 && (o = "SUPERVISED_FINE_TUNING"), o === "SUPERVISED_FINE_TUNING") {
    const A = a(e, ["validationDataset"]);
    t !== void 0 && A != null && l(t, ["supervisedTuningSpec"], es(A));
  } else if (o === "PREFERENCE_TUNING") {
    const A = a(e, ["validationDataset"]);
    t !== void 0 && A != null && l(t, ["preferenceOptimizationSpec"], es(A));
  } else if (o === "DISTILLATION") {
    const A = a(e, ["validationDataset"]);
    t !== void 0 && A != null && l(t, ["distillationSpec"], es(A));
  }
  const i = a(e, ["tunedModelDisplayName"]);
  t !== void 0 && i != null && l(t, ["tunedModelDisplayName"], i);
  const s = a(e, ["description"]);
  t !== void 0 && s != null && l(t, ["description"], s);
  let u = a(n, ["config", "method"]);
  if (u === void 0 && (u = "SUPERVISED_FINE_TUNING"), u === "SUPERVISED_FINE_TUNING") {
    const A = a(e, ["epochCount"]);
    t !== void 0 && A != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "epochCount"
    ], A);
  } else if (u === "PREFERENCE_TUNING") {
    const A = a(e, ["epochCount"]);
    t !== void 0 && A != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "epochCount"
    ], A);
  } else if (u === "DISTILLATION") {
    const A = a(e, ["epochCount"]);
    t !== void 0 && A != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "epochCount"
    ], A);
  }
  let c = a(n, ["config", "method"]);
  if (c === void 0 && (c = "SUPERVISED_FINE_TUNING"), c === "SUPERVISED_FINE_TUNING") {
    const A = a(e, ["learningRateMultiplier"]);
    t !== void 0 && A != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], A);
  } else if (c === "PREFERENCE_TUNING") {
    const A = a(e, ["learningRateMultiplier"]);
    t !== void 0 && A != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], A);
  } else if (c === "DISTILLATION") {
    const A = a(e, ["learningRateMultiplier"]);
    t !== void 0 && A != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], A);
  }
  let d = a(n, ["config", "method"]);
  if (d === void 0 && (d = "SUPERVISED_FINE_TUNING"), d === "SUPERVISED_FINE_TUNING") {
    const A = a(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && A != null && l(t, ["supervisedTuningSpec", "exportLastCheckpointOnly"], A);
  } else if (d === "PREFERENCE_TUNING") {
    const A = a(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && A != null && l(t, ["preferenceOptimizationSpec", "exportLastCheckpointOnly"], A);
  } else if (d === "DISTILLATION") {
    const A = a(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && A != null && l(t, ["distillationSpec", "exportLastCheckpointOnly"], A);
  }
  let f = a(n, ["config", "method"]);
  if (f === void 0 && (f = "SUPERVISED_FINE_TUNING"), f === "SUPERVISED_FINE_TUNING") {
    const A = a(e, ["adapterSize"]);
    t !== void 0 && A != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "adapterSize"
    ], A);
  } else if (f === "PREFERENCE_TUNING") {
    const A = a(e, ["adapterSize"]);
    t !== void 0 && A != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "adapterSize"
    ], A);
  } else if (f === "DISTILLATION") {
    const A = a(e, ["adapterSize"]);
    t !== void 0 && A != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "adapterSize"
    ], A);
  }
  let h = a(n, ["config", "method"]);
  if (h === void 0 && (h = "SUPERVISED_FINE_TUNING"), h === "SUPERVISED_FINE_TUNING") {
    const A = a(e, ["tuningMode"]);
    t !== void 0 && A != null && l(t, ["supervisedTuningSpec", "tuningMode"], A);
  } else if (h === "DISTILLATION") {
    const A = a(e, ["tuningMode"]);
    t !== void 0 && A != null && l(t, ["distillationSpec", "tuningMode"], A);
  }
  const p = a(e, ["customBaseModel"]);
  t !== void 0 && p != null && l(t, ["customBaseModel"], p);
  let m = a(n, ["config", "method"]);
  if (m === void 0 && (m = "SUPERVISED_FINE_TUNING"), m === "SUPERVISED_FINE_TUNING") {
    const A = a(e, ["batchSize"]);
    t !== void 0 && A != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "batchSize"
    ], A);
  } else if (m === "DISTILLATION") {
    const A = a(e, ["batchSize"]);
    t !== void 0 && A != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "batchSize"
    ], A);
  }
  let g = a(n, ["config", "method"]);
  if (g === void 0 && (g = "SUPERVISED_FINE_TUNING"), g === "SUPERVISED_FINE_TUNING") {
    const A = a(e, ["learningRate"]);
    t !== void 0 && A != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRate"
    ], A);
  } else if (g === "DISTILLATION") {
    const A = a(e, ["learningRate"]);
    t !== void 0 && A != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRate"
    ], A);
  }
  const _ = a(e, ["labels"]);
  t !== void 0 && _ != null && l(t, ["labels"], _);
  const v = a(e, ["beta"]);
  t !== void 0 && v != null && l(t, [
    "preferenceOptimizationSpec",
    "hyperParameters",
    "beta"
  ], v);
  const C = a(e, ["baseTeacherModel"]);
  t !== void 0 && C != null && l(t, ["distillationSpec", "baseTeacherModel"], C);
  const b = a(e, ["tunedTeacherModelSource"]);
  t !== void 0 && b != null && l(t, ["distillationSpec", "tunedTeacherModelSource"], b);
  const P = a(e, ["sftLossWeightMultiplier"]);
  t !== void 0 && P != null && l(t, [
    "distillationSpec",
    "hyperParameters",
    "sftLossWeightMultiplier"
  ], P);
  const R = a(e, ["outputUri"]);
  t !== void 0 && R != null && l(t, ["outputUri"], R);
  const D = a(e, ["encryptionSpec"]);
  return t !== void 0 && D != null && l(t, ["encryptionSpec"], D), r;
}
function uw(e, t) {
  const n = {}, r = a(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = a(e, ["preTunedModel"]);
  o != null && l(n, ["preTunedModel"], o);
  const i = a(e, ["trainingDataset"]);
  i != null && Aw(i);
  const s = a(e, ["config"]);
  return s != null && aw(s, n), n;
}
function cw(e, t) {
  const n = {}, r = a(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = a(e, ["preTunedModel"]);
  o != null && l(n, ["preTunedModel"], o);
  const i = a(e, ["trainingDataset"]);
  i != null && Tw(i, n, t);
  const s = a(e, ["config"]);
  return s != null && lw(s, n, t), n;
}
function dw(e, t) {
  const n = {}, r = a(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function fw(e, t) {
  const n = {}, r = a(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function hw(e, t, n) {
  const r = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const i = a(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const s = a(e, ["filter"]);
  return t !== void 0 && s != null && l(t, ["_query", "filter"], s), r;
}
function pw(e, t, n) {
  const r = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const i = a(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const s = a(e, ["filter"]);
  return t !== void 0 && s != null && l(t, ["_query", "filter"], s), r;
}
function mw(e, t) {
  const n = {}, r = a(e, ["config"]);
  return r != null && hw(r, n), n;
}
function gw(e, t) {
  const n = {}, r = a(e, ["config"]);
  return r != null && pw(r, n), n;
}
function yw(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = a(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const i = a(e, ["tunedModels"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((u) => jh(u))), l(n, ["tuningJobs"], s);
  }
  return n;
}
function _w(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = a(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const i = a(e, ["tuningJobs"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((u) => Os(u))), l(n, ["tuningJobs"], s);
  }
  return n;
}
function vw(e, t) {
  const n = {}, r = a(e, ["name"]);
  r != null && l(n, ["model"], r);
  const o = a(e, ["name"]);
  return o != null && l(n, ["endpoint"], o), n;
}
function Aw(e, t) {
  const n = {};
  if (a(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (a(e, ["vertexDatasetResource"]) !== void 0) throw new Error("vertexDatasetResource parameter is not supported in Gemini API.");
  const r = a(e, ["examples"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => i)), l(n, ["examples", "examples"], o);
  }
  return n;
}
function Tw(e, t, n) {
  const r = {};
  let o = a(n, ["config", "method"]);
  if (o === void 0 && (o = "SUPERVISED_FINE_TUNING"), o === "SUPERVISED_FINE_TUNING") {
    const s = a(e, ["gcsUri"]);
    t !== void 0 && s != null && l(t, ["supervisedTuningSpec", "trainingDatasetUri"], s);
  } else if (o === "PREFERENCE_TUNING") {
    const s = a(e, ["gcsUri"]);
    t !== void 0 && s != null && l(t, ["preferenceOptimizationSpec", "trainingDatasetUri"], s);
  } else if (o === "DISTILLATION") {
    const s = a(e, ["gcsUri"]);
    t !== void 0 && s != null && l(t, ["distillationSpec", "promptDatasetUri"], s);
  }
  let i = a(n, ["config", "method"]);
  if (i === void 0 && (i = "SUPERVISED_FINE_TUNING"), i === "SUPERVISED_FINE_TUNING") {
    const s = a(e, ["vertexDatasetResource"]);
    t !== void 0 && s != null && l(t, ["supervisedTuningSpec", "trainingDatasetUri"], s);
  } else if (i === "PREFERENCE_TUNING") {
    const s = a(e, ["vertexDatasetResource"]);
    t !== void 0 && s != null && l(t, ["preferenceOptimizationSpec", "trainingDatasetUri"], s);
  } else if (i === "DISTILLATION") {
    const s = a(e, ["vertexDatasetResource"]);
    t !== void 0 && s != null && l(t, ["distillationSpec", "promptDatasetUri"], s);
  }
  if (a(e, ["examples"]) !== void 0) throw new Error("examples parameter is not supported in Vertex AI.");
  return r;
}
function jh(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = a(e, ["name"]);
  o != null && l(n, ["name"], o);
  const i = a(e, ["state"]);
  i != null && l(n, ["state"], lh(i));
  const s = a(e, ["createTime"]);
  s != null && l(n, ["createTime"], s);
  const u = a(e, ["tuningTask", "startTime"]);
  u != null && l(n, ["startTime"], u);
  const c = a(e, ["tuningTask", "completeTime"]);
  c != null && l(n, ["endTime"], c);
  const d = a(e, ["updateTime"]);
  d != null && l(n, ["updateTime"], d);
  const f = a(e, ["description"]);
  f != null && l(n, ["description"], f);
  const h = a(e, ["baseModel"]);
  h != null && l(n, ["baseModel"], h);
  const p = a(e, ["_self"]);
  return p != null && l(n, ["tunedModel"], vw(p)), n;
}
function Os(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = a(e, ["name"]);
  o != null && l(n, ["name"], o);
  const i = a(e, ["state"]);
  i != null && l(n, ["state"], lh(i));
  const s = a(e, ["createTime"]);
  s != null && l(n, ["createTime"], s);
  const u = a(e, ["startTime"]);
  u != null && l(n, ["startTime"], u);
  const c = a(e, ["endTime"]);
  c != null && l(n, ["endTime"], c);
  const d = a(e, ["updateTime"]);
  d != null && l(n, ["updateTime"], d);
  const f = a(e, ["error"]);
  f != null && l(n, ["error"], f);
  const h = a(e, ["description"]);
  h != null && l(n, ["description"], h);
  const p = a(e, ["baseModel"]);
  p != null && l(n, ["baseModel"], p);
  const m = a(e, ["tunedModel"]);
  m != null && l(n, ["tunedModel"], m);
  const g = a(e, ["preTunedModel"]);
  g != null && l(n, ["preTunedModel"], g);
  const _ = a(e, ["supervisedTuningSpec"]);
  _ != null && l(n, ["supervisedTuningSpec"], _);
  const v = a(e, ["preferenceOptimizationSpec"]);
  v != null && l(n, ["preferenceOptimizationSpec"], v);
  const C = a(e, ["distillationSpec"]);
  C != null && l(n, ["distillationSpec"], C);
  const b = a(e, ["tuningDataStats"]);
  b != null && l(n, ["tuningDataStats"], b);
  const P = a(e, ["encryptionSpec"]);
  P != null && l(n, ["encryptionSpec"], P);
  const R = a(e, ["partnerModelTuningSpec"]);
  R != null && l(n, ["partnerModelTuningSpec"], R);
  const D = a(e, ["customBaseModel"]);
  D != null && l(n, ["customBaseModel"], D);
  const A = a(e, ["evaluateDatasetRuns"]);
  if (A != null) {
    let re = A;
    Array.isArray(re) && (re = re.map((ae) => ae)), l(n, ["evaluateDatasetRuns"], re);
  }
  const U = a(e, ["experiment"]);
  U != null && l(n, ["experiment"], U);
  const x = a(e, ["fullFineTuningSpec"]);
  x != null && l(n, ["fullFineTuningSpec"], x);
  const $ = a(e, ["labels"]);
  $ != null && l(n, ["labels"], $);
  const H = a(e, ["outputUri"]);
  H != null && l(n, ["outputUri"], H);
  const z = a(e, ["pipelineJob"]);
  z != null && l(n, ["pipelineJob"], z);
  const ge = a(e, ["serviceAccount"]);
  ge != null && l(n, ["serviceAccount"], ge);
  const se = a(e, ["tunedModelDisplayName"]);
  se != null && l(n, ["tunedModelDisplayName"], se);
  const X = a(e, ["tuningJobState"]);
  X != null && l(n, ["tuningJobState"], X);
  const Q = a(e, ["veoTuningSpec"]);
  Q != null && l(n, ["veoTuningSpec"], Q);
  const Se = a(e, ["distillationSamplingSpec"]);
  Se != null && l(n, ["distillationSamplingSpec"], Se);
  const Ue = a(e, ["tuningJobMetadata"]);
  return Ue != null && l(n, ["tuningJobMetadata"], Ue), n;
}
function Sw(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = a(e, ["name"]);
  o != null && l(n, ["name"], o);
  const i = a(e, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const s = a(e, ["done"]);
  s != null && l(n, ["done"], s);
  const u = a(e, ["error"]);
  return u != null && l(n, ["error"], u), n;
}
function es(e, t) {
  const n = {}, r = a(e, ["gcsUri"]);
  r != null && l(n, ["validationDatasetUri"], r);
  const o = a(e, ["vertexDatasetResource"]);
  return o != null && l(n, ["validationDatasetUri"], o), n;
}
var Ew = class extends wt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new ln(Ct.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
      var n;
      if (this.apiClient.isVertexAI()) if (t.baseModel.startsWith("projects/")) {
        const r = { tunedModelName: t.baseModel };
        !((n = t.config) === null || n === void 0) && n.preTunedModelCheckpointId && (r.checkpointId = t.config.preTunedModelCheckpointId);
        const o = Object.assign(Object.assign({}, t), { preTunedModel: r });
        return o.baseModel = void 0, await this.tuneInternal(o);
      } else {
        const r = Object.assign({}, t);
        return await this.tuneInternal(r);
      }
      else {
        const r = Object.assign({}, t), o = await this.tuneMldevInternal(r);
        let i = "";
        return o.metadata !== void 0 && o.metadata.tunedModel !== void 0 ? i = o.metadata.tunedModel : o.name !== void 0 && o.name.includes("/operations/") && (i = o.name.split("/operations/")[0]), {
          name: i,
          state: ws.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, n, r, o;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = fw(e);
      return s = L("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => Os(d));
    } else {
      const c = dw(e);
      return s = L("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => jh(d));
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = gw(e);
      return s = L("tuningJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = _w(d), h = new pc();
        return Object.assign(h, f), h;
      });
    } else {
      const c = mw(e);
      return s = L("tunedModels", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = yw(d), h = new pc();
        return Object.assign(h, f), h;
      });
    }
  }
  async cancel(e) {
    var t, n, r, o;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ow(e);
      return s = L("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = sw(d), h = new mc();
        return Object.assign(h, f), h;
      });
    } else {
      const c = rw(e);
      return s = L("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = iw(d), h = new mc();
        return Object.assign(h, f), h;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = cw(e, e);
      return o = L("tuningJobs", s._url), i = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => Os(u));
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async tuneMldevInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = uw(e);
      return o = L("tunedModels", s._url), i = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => Sw(u));
    }
  }
}, Cw = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, ww = 1024 * 1024 * 8, Iw = 3, bw = 1e3, Pw = 2, ri = "x-goog-upload-status";
async function Rw(e, t, n, r) {
  var o;
  const i = await ep(e, t, n, r), s = await i?.json();
  if (((o = i?.headers) === null || o === void 0 ? void 0 : o[ri]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return s.file;
}
async function xw(e, t, n, r) {
  var o;
  const i = await ep(e, t, n, r), s = await i?.json();
  if (((o = i?.headers) === null || o === void 0 ? void 0 : o[ri]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = jf(s), c = new V_();
  return Object.assign(c, u), c;
}
async function ep(e, t, n, r) {
  var o, i, s;
  let u = t;
  const c = r?.baseUrl || ((o = n.clientOptions.httpOptions) === null || o === void 0 ? void 0 : o.baseUrl);
  if (c) {
    const m = new URL(c), g = new URL(t);
    g.protocol = m.protocol, g.host = m.host, g.port = m.port, u = g.toString();
  }
  let d = 0, f = 0, h = new bs(new Response()), p = "upload";
  for (d = e.size; f < d; ) {
    const m = Math.min(ww, d - f), g = e.slice(f, f + m);
    f + m >= d && (p += ", finalize");
    let _ = 0, v = bw;
    for (; _ < Iw; ) {
      const C = Object.assign(Object.assign({}, r?.headers || {}), {
        "X-Goog-Upload-Command": p,
        "X-Goog-Upload-Offset": String(f),
        "Content-Length": String(m)
      });
      if (h = await n.request({
        path: "",
        body: g,
        httpMethod: "POST",
        httpOptions: Object.assign(Object.assign({}, r), {
          apiVersion: "",
          baseUrl: u,
          headers: C
        })
      }), !((i = h?.headers) === null || i === void 0) && i[ri]) break;
      _++, await Nw(v), v = v * Pw;
    }
    if (f += m, ((s = h?.headers) === null || s === void 0 ? void 0 : s[ri]) !== "active") break;
    if (d <= f) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return h;
}
async function Mw(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function Nw(e) {
  return new Promise((t) => setTimeout(t, e));
}
var kw = class {
  async upload(e, t, n, r) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await Rw(e, t, n, r);
  }
  async uploadToFileSearchStore(e, t, n, r) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await xw(e, t, n, r);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await Mw(e);
  }
}, Dw = class {
  create(e, t, n) {
    return new $w(e, t, n);
  }
}, $w = class {
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
}, Vc = "x-goog-api-key", Lw = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(Vc) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(Vc, this.apiKey);
    }
  }
}, Uw = class {
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
    const n = h_(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const r = new Lw(this.apiKey);
    this.apiClient = new NE({
      auth: r,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: "gl-node/web",
      uploader: new kw(),
      downloader: new Cw()
    }), this.models = new ZE(this.apiClient), this.live = new KE(this.apiClient, r, new Dw()), this.batches = new Wv(this.apiClient), this.chats = new MA(this.models, this.apiClient), this.caches = new PA(this.apiClient), this.files = new HA(this.apiClient), this.operations = new jE(this.apiClient), this.authTokens = new yC(this.apiClient), this.tunings = new Ew(this.apiClient), this.fileSearchStores = new wC(this.apiClient);
  }
};
function Jc(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function oi(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function tn(e) {
  return { text: String(e || "") };
}
function Fw(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? { inlineData: {
    mimeType: t[1],
    data: t[2]
  } } : null;
}
function Ow(e) {
  if (typeof e == "string") return [tn(e)];
  if (!Array.isArray(e)) return [tn("")];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "text" ? tn(n.text || "") : n.type === "image_url" && n.image_url?.url ? Fw(n.image_url.url) : null).filter(Boolean);
  return t.length ? t : [tn("")];
}
function Kc() {
  return {
    role: "user",
    parts: [tn("")]
  };
}
function jr(e, t = "model") {
  if (!e?.parts?.length) return null;
  const n = oi(e);
  return n ? (n.role || (n.role = t), n) : null;
}
function qw(e) {
  return !!e?.parts?.some((t) => typeof t?.thoughtSignature == "string" && t.thoughtSignature);
}
function Bw(e) {
  return !!e?.parts?.some((t) => t?.functionCall?.name);
}
function Wc(e, t, n = 0) {
  if (!e?.functionCall?.name) return "";
  const r = String(e.functionCall.id || "").trim();
  return r ? `id:${r}` : [
    String(n),
    String(e.functionCall.name || ""),
    String(t)
  ].join("\0");
}
function Gw(e, t) {
  const n = e?.functionCall || {}, r = t?.functionCall || {}, o = n.args && typeof n.args == "object" && !Array.isArray(n.args) ? n.args : {}, i = r.args && typeof r.args == "object" && !Array.isArray(r.args) ? r.args : {};
  return {
    ...e,
    ...t,
    ...e?.thoughtSignature && !t?.thoughtSignature ? { thoughtSignature: e.thoughtSignature } : {},
    functionCall: {
      ...n,
      ...r,
      args: {
        ...o,
        ...i
      }
    }
  };
}
function Hw(e = [], t = "") {
  const n = e.map((f) => jr(f, "model")).filter(Boolean);
  if (!n.length) return null;
  const r = [...n].reverse().find((f) => qw(f)) || null, o = [...n].reverse().find((f) => Bw(f)) || null, i = r || o || n[n.length - 1], s = n.indexOf(i), u = oi(i);
  if (!u?.parts?.length) return n[n.length - 1];
  if (o) {
    const f = /* @__PURE__ */ new Map(), h = [];
    n.forEach((m, g) => {
      m.parts.forEach((_, v) => {
        const C = Wc(_, v, g);
        if (!C) return;
        f.has(C) || h.push(C);
        const b = f.get(C);
        b ? f.set(C, Gw(b, _)) : f.set(C, oi(_));
      });
    });
    const p = /* @__PURE__ */ new Set();
    u.parts = u.parts.map((m, g) => {
      const _ = Wc(m, g, s);
      return _ ? (p.add(_), f.get(_) || m) : m;
    }), h.forEach((m) => {
      p.has(m) || (u.parts.push(f.get(m)), p.add(m));
    });
  }
  const c = String(t || ""), d = u.parts.filter((f) => !(typeof f?.text == "string" && !f?.thought));
  return u.parts = c ? [{ text: c }, ...d] : d, u.parts.length ? u : n[n.length - 1];
}
function zc(e) {
  const t = e?.candidates?.[0]?.content?.parts || [], n = t.filter((r) => !r?.thought && typeof r?.text == "string" && r.text).map((r) => r.text).join(`
`);
  return n || t.length ? n : typeof e?.text == "string" && e.text ? e.text : "";
}
function tp(e) {
  const t = Array.isArray(e?.functionCalls) ? e.functionCalls : [], n = (e?.candidates?.[0]?.content?.parts || []).map((r) => r?.functionCall || r).filter((r) => r && r.name);
  return t.length ? t : n;
}
function np(e) {
  try {
    return JSON.stringify(e?.args || {});
  } catch {
    return "{}";
  }
}
function Yc(e) {
  try {
    const t = JSON.parse(String(e || "{}"));
    return t && typeof t == "object" && !Array.isArray(t) ? t : null;
  } catch {
    return null;
  }
}
function Vw(e, t) {
  const n = Yc(e), r = Yc(t);
  return n && r ? JSON.stringify({
    ...n,
    ...r
  }) : String(t || "").trim() || String(e || "{}");
}
function Jw(e, t = "google-tool") {
  return tp(e).map((n, r) => {
    const o = String(n.id || "").trim();
    return {
      id: o || `${t}-${r + 1}`,
      name: n.name || "",
      arguments: np(n),
      ...o ? {} : { providerId: "" }
    };
  }).filter((n) => n.name);
}
function Kw(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  let r = 0;
  function o(s, u, c, d) {
    return s.name = String(u.name || s.name || "").trim(), s.arguments = Vw(s.arguments, d), c && (n.set(c, s), s.id !== c ? s.providerId = c : delete s.providerId), s;
  }
  function i(s) {
    return tp(s).forEach((u) => {
      const c = String(u?.name || "").trim();
      if (!c) return;
      const d = String(u?.id || "").trim(), f = np(u);
      let h = d ? n.get(d) : null;
      h ? o(h, u, d, f) : (h = {
        id: d || `${e}-${++r}`,
        name: c,
        arguments: f,
        ...d ? {} : { providerId: "" }
      }, t.push(h)), d && n.set(d, h);
    }), t.map((u) => ({ ...u }));
  }
  return { append: i };
}
function Ww(e = []) {
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
function zw(e) {
  switch (e) {
    case "minimal":
      return Pn.MINIMAL;
    case "high":
      return Pn.HIGH;
    case "medium":
      return Pn.MEDIUM;
    default:
      return Pn.LOW;
  }
}
function Xc(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function Yw(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  if (t.length)
    return [...new Set(t)].join(`

`);
}
function Xw(e) {
  const t = e?.providerPayload?.googleContent;
  return jr(t, "model");
}
function Qw(e) {
  const t = e?.providerPayload?.googleContents;
  if (!Array.isArray(t) || !t.length) {
    const n = Xw(e);
    return n ? [n] : [];
  }
  return t.map((n) => jr(n, "model")).filter(Boolean);
}
function Ma(e = []) {
  const t = (Array.isArray(e) ? e : []).map((n) => jr(n, "model")).filter(Boolean);
  if (t.length)
    return {
      googleContent: t[t.length - 1],
      googleContents: t
    };
}
function Zw(e) {
  const t = e?.candidates?.[0]?.content;
  return Ma(t ? [t] : []);
}
function jw(e) {
  return Ma(e ? [e] : []);
}
function rp(e) {
  try {
    if (typeof e?.getHistory == "function") return e.getHistory(!1);
  } catch {
    return [];
  }
  return Array.isArray(e?.history) ? oi(e.history) || [] : [];
}
function eI(e, t = 0) {
  return rp(e).slice(Math.max(0, t)).filter((n) => n?.role === "model").map((n) => jr(n, "model")).filter(Boolean);
}
function tI(e) {
  const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = [], o = (e || []).filter((s) => s.role === "user" || s.role === "assistant" || s.role === "tool");
  o.forEach((s) => {
    (s.tool_calls || []).forEach((u) => {
      u.id && u.function?.name && t.set(u.id, u.function.name), u.id && Object.prototype.hasOwnProperty.call(u, "providerToolCallId") && n.set(u.id, String(u.providerToolCallId || "").trim());
    });
  });
  for (let s = 0; s < o.length; s += 1) {
    const u = o[s];
    if (u.role === "tool") {
      const c = [];
      let d = s;
      for (; d < o.length && o[d].role === "tool"; ) {
        const f = o[d], h = String(f.tool_call_id || "").trim(), p = n.has(h) ? n.get(h) : h;
        c.push({ functionResponse: {
          ...p ? { id: p } : {},
          name: String(f.toolName || f.tool_name || "").trim() || t.get(h) || "tool_result",
          response: Jc(f.content)
        } }), d += 1;
      }
      r.push({
        role: "user",
        parts: c
      }), s = d - 1;
      continue;
    }
    if (u.role === "assistant") {
      const c = Qw(u);
      if (c.length) {
        r.push(...c);
        continue;
      }
    }
    if (u.role === "assistant" && Array.isArray(u.tool_calls) && u.tool_calls.length) {
      r.push({
        role: "model",
        parts: [...u.content ? [tn(u.content)] : [], ...u.tool_calls.map((c) => ({ functionCall: {
          ...(() => {
            const d = Object.prototype.hasOwnProperty.call(c, "providerToolCallId") ? String(c.providerToolCallId || "").trim() : String(c.id || "").trim();
            return d ? { id: d } : {};
          })(),
          name: c.function.name,
          args: Jc(c.function.arguments)
        } }))]
      });
      continue;
    }
    r.push({
      role: u.role === "assistant" ? "model" : "user",
      parts: Ow(u.content)
    });
  }
  if (!r.length) return {
    history: [],
    latestMessage: Kc().parts
  };
  const i = r[r.length - 1];
  return i.role === "user" && i.parts?.length ? {
    history: r.slice(0, -1),
    latestMessage: i.parts
  } : {
    history: r,
    latestMessage: Kc().parts
  };
}
function nI(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Qc(e, t) {
  return `${String(e || "")}${String(t || "")}`;
}
var rI = class {
  constructor(e) {
    this.config = e, this.supportsSessionToolLoop = !0, this.activeChat = null, this.sessionReasoning = null, this.toolCallResponseSequence = 0, this.client = new Uw({
      apiKey: e.apiKey,
      httpOptions: {
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 900 * 1e3
      }
    });
  }
  buildChatPayload(e, t = ie("google", this.config, e.reasoning)) {
    const n = t, r = tI(e.messages), o = Array.isArray(e.tools) ? e.tools : [], i = Yw(e), s = {
      ...i ? { systemInstruction: i } : {},
      temperature: e.temperature,
      ...e.maxTokens ? { maxOutputTokens: e.maxTokens } : {}
    };
    if (n.mode === "off" ? s.thinkingConfig = {
      includeThoughts: !1,
      thinkingBudget: 0
    } : n.mode === "on" && n.profileId.startsWith("google-gemini-2.5-") ? s.thinkingConfig = {
      includeThoughts: Z(n),
      thinkingBudget: n.budgetTokens
    } : n.mode === "on" ? s.thinkingConfig = {
      includeThoughts: Z(n),
      thinkingLevel: zw(n.effort)
    } : Z(n) && (s.thinkingConfig = { includeThoughts: !0 }), o.length && (s.tools = [{ functionDeclarations: o.map((u) => ({
      name: u.function.name,
      description: u.function.description,
      parameters: u.function.parameters
    })) }]), o.length) {
      const u = String(e.toolChoice || "auto").trim();
      s.toolConfig = { functionCallingConfig: u === "none" ? { mode: bn.NONE } : u === "auto" ? { mode: bn.AUTO } : u === "required" ? { mode: bn.ANY } : {
        mode: bn.ANY,
        allowedFunctionNames: [u]
      } };
    }
    return {
      createPayload: {
        model: this.config.model,
        history: r.history,
        config: s
      },
      sendPayload: { message: r.latestMessage }
    };
  }
  inspectRequest(e, t = {}) {
    const n = t.effectiveReasoning || ie("google", this.config, e.reasoning), r = t.payload || this.buildChatPayload(e, n), o = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return Or({
      provider: "google",
      model: this.config.model,
      transport: "google-genai-sdk",
      url: `${o}/models/${encodeURIComponent(this.config.model || "")}:generateContent`,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.config.apiKey || ""
      },
      body: {
        chatCreate: r.createPayload,
        sendMessage: r.sendPayload,
        stream: typeof e.onStreamProgress == "function"
      },
      sdk: typeof e.onStreamProgress == "function" ? "client.chats.create(...).sendMessageStream" : "client.chats.create(...).sendMessage",
      effectiveConfig: Ot(e, {
        reasoning: n,
        effort: r.createPayload.config?.thinkingConfig?.thinkingLevel,
        budgetTokens: r.createPayload.config?.thinkingConfig?.thinkingBudget,
        controlFields: r.createPayload.config?.thinkingConfig ? { thinkingConfig: r.createPayload.config.thinkingConfig } : {}
      })
    });
  }
  inspectSendRequest(e, t, n) {
    const r = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return Or({
      provider: "google",
      model: this.config.model,
      transport: "google-genai-sdk",
      url: `${r}/models/${encodeURIComponent(this.config.model || "")}:generateContent`,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.config.apiKey || ""
      },
      body: {
        sendMessage: e,
        stream: typeof t.onStreamProgress == "function"
      },
      sdk: typeof t.onStreamProgress == "function" ? "activeChat.sendMessageStream" : "activeChat.sendMessage",
      effectiveConfig: Ot(t, {
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
  async sendThroughChat(e, t, n, r) {
    let o, i, s, u = [];
    const c = `google-tool-${++this.toolCallResponseSequence}`, d = Kw(c);
    let f = null;
    const h = n.signal ? {
      ...this.sessionConfig || {},
      abortSignal: n.signal
    } : void 0, p = {
      ...t,
      ...h ? { config: h } : {}
    }, m = typeof n.onStreamProgress == "function", g = rp(e).length;
    if (m) {
      const C = await e.sendMessageStream(p), b = /* @__PURE__ */ new Map();
      let P = "", R = null;
      const D = [];
      for await (const A of C) {
        R = A;
        const U = A?.candidates?.[0]?.content;
        U?.parts?.length && D.push(U), Z(r) && Xc(A).forEach(($, H) => {
          const z = `${$.label}:${H}`;
          b.set(z, Qc(b.get(z) || "", $.text));
        }), u = d.append(A);
        const x = zc(A);
        P = Qc(P, x), nI(n, {
          text: P,
          thoughts: Array.from(b.values()).filter(Boolean).map(($, H) => ({
            label: `思考块 ${H + 1}`,
            text: $
          })),
          ...u.length ? {
            toolCalls: u,
            toolCallDraft: !0
          } : {}
        });
      }
      o = {
        ...R || {},
        functionCalls: u
      }, f = Hw(D, P) || o?.candidates?.[0]?.content || null, i = Array.from(b.values()).filter(Boolean).map((A, U) => ({
        label: `思考块 ${U + 1}`,
        text: A
      })), s = P;
    } else
      o = await e.sendMessage(p), i = Z(r) ? Xc(o) : [], s = zc(o);
    const _ = m ? u : Jw(o, c), v = eI(e, g);
    return {
      text: s,
      toolCalls: _,
      thoughts: i,
      finishReason: o.candidates?.[0]?.finishReason || "STOP",
      model: o.modelVersion || this.config.model,
      provider: "google",
      providerPayload: Ma(v) || jw(f) || Zw(o)
    };
  }
  async chat(e) {
    const t = ie("google", this.config, e.reasoning), n = (Array.isArray(e.toolResponses) && e.toolResponses.length || String(e.finalAnswerReminderText || "").trim()) && this.sessionReasoning ? this.sessionReasoning : t;
    if (Array.isArray(e.toolResponses) && e.toolResponses.length) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const i = { message: Ww(e.toolResponses) };
      return {
        ...await this.sendThroughChat(this.activeChat, i, e, n),
        requestInspection: this.inspectSendRequest(i, e, n)
      };
    }
    const r = String(e.finalAnswerReminderText || "").trim();
    if (r) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const i = { message: [tn(r)] };
      return {
        ...await this.sendThroughChat(this.activeChat, i, e, n),
        requestInspection: this.inspectSendRequest(i, e, n)
      };
    }
    const o = this.createChat(e, n);
    return this.activeChat = o.chat, this.sessionConfig = o.sessionConfig, this.sessionReasoning = n, {
      ...await this.sendThroughChat(this.activeChat, o.sendPayload, e, n),
      requestInspection: o.requestInspection
    };
  }
};
function V(e, t, n, r, o) {
  if (r === "m") throw new TypeError("Private method is not writable");
  if (r === "a" && !o) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !o : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return r === "a" ? o.call(e, n) : o ? o.value = n : t.set(e, n), n;
}
function w(e, t, n, r) {
  if (n === "a" && !r) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? r : n === "a" ? r.call(e) : r ? r.value : t.get(e);
}
var op = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return op = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
};
function qs(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Bs = (e) => {
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
}, be = class Gs extends G {
  constructor(t, n, r, o) {
    super(`${Gs.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.requestID = o?.get("x-request-id"), this.error = n;
    const i = n;
    this.code = i?.code, this.param = i?.param, this.type = i?.type;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new wi({
      message: r,
      cause: Bs(n)
    });
    const i = n?.error;
    return t === 400 ? new ip(t, i, r, o) : t === 401 ? new sp(t, i, r, o) : t === 403 ? new ap(t, i, r, o) : t === 404 ? new lp(t, i, r, o) : t === 409 ? new up(t, i, r, o) : t === 422 ? new cp(t, i, r, o) : t === 429 ? new dp(t, i, r, o) : t >= 500 ? new fp(t, i, r, o) : new Gs(t, i, r, o);
  }
}, Ze = class extends be {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, wi = class extends be {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Na = class extends wi {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, ip = class extends be {
}, sp = class extends be {
}, ap = class extends be {
}, lp = class extends be {
}, up = class extends be {
}, cp = class extends be {
}, dp = class extends be {
}, fp = class extends be {
}, hp = class extends G {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, pp = class extends G {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, vr = class extends Error {
  constructor(e) {
    super(e);
  }
}, mp = class extends be {
  constructor(e, t, n) {
    let r = "OAuth2 authentication error", o;
    if (t && typeof t == "object") {
      const i = t;
      o = i.error;
      const s = i.error_description;
      s && typeof s == "string" ? r = s : o && (r = o);
    }
    super(e, t, r, n), this.error_code = o;
  }
}, oI = class extends G {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, iI = /^[a-z][a-z0-9+.-]*:/i, sI = (e) => iI.test(e), ke = (e) => (ke = Array.isArray, ke(e)), Zc = ke;
function ka(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function jc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function aI(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function ts(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var lI = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new G(`${e} must be an integer`);
  if (t < 0) throw new G(`${e} must be a positive integer`);
  return t;
}, uI = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, eo = (e) => new Promise((t) => setTimeout(t, e)), Sn = "6.44.0", cI = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function dI() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var fI = () => {
  const e = dI();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Sn,
    "X-Stainless-OS": td(Deno.build.os),
    "X-Stainless-Arch": ed(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Sn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Sn,
    "X-Stainless-OS": td(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": ed(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = hI();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Sn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Sn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function hI() {
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
var ed = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", td = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), nd, pI = () => nd ?? (nd = fI());
function gp() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function yp(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function _p(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return yp({
    start() {
    },
    async pull(n) {
      const { done: r, value: o } = await t.next();
      r ? n.close() : n.enqueue(o);
    },
    async cancel() {
      await t.return?.();
    }
  });
}
function vp(e) {
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
async function rd(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var mI = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), Ap = "RFC3986", Tp = (e) => String(e), od = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: Tp
};
var Hs = (e, t) => (Hs = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), Hs(e, t)), ct = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), ns = 1024, gI = (e, t, n, r, o) => {
  if (e.length === 0) return e;
  let i = e;
  if (typeof e == "symbol" ? i = Symbol.prototype.toString.call(e) : typeof e != "string" && (i = String(e)), n === "iso-8859-1") return escape(i).replace(/%u[0-9a-f]{4}/gi, function(u) {
    return "%26%23" + parseInt(u.slice(2), 16) + "%3B";
  });
  let s = "";
  for (let u = 0; u < i.length; u += ns) {
    const c = i.length >= ns ? i.slice(u, u + ns) : i, d = [];
    for (let f = 0; f < c.length; ++f) {
      let h = c.charCodeAt(f);
      if (h === 45 || h === 46 || h === 95 || h === 126 || h >= 48 && h <= 57 || h >= 65 && h <= 90 || h >= 97 && h <= 122 || o === "RFC1738" && (h === 40 || h === 41)) {
        d[d.length] = c.charAt(f);
        continue;
      }
      if (h < 128) {
        d[d.length] = ct[h];
        continue;
      }
      if (h < 2048) {
        d[d.length] = ct[192 | h >> 6] + ct[128 | h & 63];
        continue;
      }
      if (h < 55296 || h >= 57344) {
        d[d.length] = ct[224 | h >> 12] + ct[128 | h >> 6 & 63] + ct[128 | h & 63];
        continue;
      }
      f += 1, h = 65536 + ((h & 1023) << 10 | c.charCodeAt(f) & 1023), d[d.length] = ct[240 | h >> 18] + ct[128 | h >> 12 & 63] + ct[128 | h >> 6 & 63] + ct[128 | h & 63];
    }
    s += d.join("");
  }
  return s;
};
function yI(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function id(e, t) {
  if (ke(e)) {
    const n = [];
    for (let r = 0; r < e.length; r += 1) n.push(t(e[r]));
    return n;
  }
  return t(e);
}
var Sp = {
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
}, Ep = function(e, t) {
  Array.prototype.push.apply(e, ke(t) ? t : [t]);
}, sd, pe = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: gI,
  encodeValuesOnly: !1,
  format: Ap,
  formatter: Tp,
  indices: !1,
  serializeDate(e) {
    return (sd ?? (sd = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function _I(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var rs = {};
function Cp(e, t, n, r, o, i, s, u, c, d, f, h, p, m, g, _, v, C) {
  let b = e, P = C, R = 0, D = !1;
  for (; (P = P.get(rs)) !== void 0 && !D; ) {
    const H = P.get(e);
    if (R += 1, typeof H < "u") {
      if (H === R) throw new RangeError("Cyclic object value");
      D = !0;
    }
    typeof P.get(rs) > "u" && (R = 0);
  }
  if (typeof d == "function" ? b = d(t, b) : b instanceof Date ? b = p?.(b) : n === "comma" && ke(b) && (b = id(b, function(H) {
    return H instanceof Date ? p?.(H) : H;
  })), b === null) {
    if (i) return c && !_ ? c(t, pe.encoder, v, "key", m) : t;
    b = "";
  }
  if (_I(b) || yI(b)) {
    if (c) {
      const H = _ ? t : c(t, pe.encoder, v, "key", m);
      return [g?.(H) + "=" + g?.(c(b, pe.encoder, v, "value", m))];
    }
    return [g?.(t) + "=" + g?.(String(b))];
  }
  const A = [];
  if (typeof b > "u") return A;
  let U;
  if (n === "comma" && ke(b))
    _ && c && (b = id(b, c)), U = [{ value: b.length > 0 ? b.join(",") || null : void 0 }];
  else if (ke(d)) U = d;
  else {
    const H = Object.keys(b);
    U = f ? H.sort(f) : H;
  }
  const x = u ? String(t).replace(/\./g, "%2E") : String(t), $ = r && ke(b) && b.length === 1 ? x + "[]" : x;
  if (o && ke(b) && b.length === 0) return $ + "[]";
  for (let H = 0; H < U.length; ++H) {
    const z = U[H], ge = typeof z == "object" && typeof z.value < "u" ? z.value : b[z];
    if (s && ge === null) continue;
    const se = h && u ? z.replace(/\./g, "%2E") : z, X = ke(b) ? typeof n == "function" ? n($, se) : $ : $ + (h ? "." + se : "[" + se + "]");
    C.set(e, R);
    const Q = /* @__PURE__ */ new WeakMap();
    Q.set(rs, C), Ep(A, Cp(ge, X, n, r, o, i, s, u, n === "comma" && _ && ke(b) ? null : c, d, f, h, p, m, g, _, v, Q));
  }
  return A;
}
function vI(e = pe) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || pe.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = Ap;
  if (typeof e.format < "u") {
    if (!Hs(od, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const r = od[n];
  let o = pe.filter;
  (typeof e.filter == "function" || ke(e.filter)) && (o = e.filter);
  let i;
  if (e.arrayFormat && e.arrayFormat in Sp ? i = e.arrayFormat : "indices" in e ? i = e.indices ? "indices" : "repeat" : i = pe.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  const s = typeof e.allowDots > "u" ? e.encodeDotInKeys ? !0 : pe.allowDots : !!e.allowDots;
  return {
    addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : pe.addQueryPrefix,
    allowDots: s,
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
    filter: o,
    format: n,
    formatter: r,
    serializeDate: typeof e.serializeDate == "function" ? e.serializeDate : pe.serializeDate,
    skipNulls: typeof e.skipNulls == "boolean" ? e.skipNulls : pe.skipNulls,
    sort: typeof e.sort == "function" ? e.sort : null,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : pe.strictNullHandling
  };
}
function AI(e, t = {}) {
  let n = e;
  const r = vI(t);
  let o, i;
  typeof r.filter == "function" ? (i = r.filter, n = i("", n)) : ke(r.filter) && (i = r.filter, o = i);
  const s = [];
  if (typeof n != "object" || n === null) return "";
  const u = Sp[r.arrayFormat], c = u === "comma" && r.commaRoundTrip;
  o || (o = Object.keys(n)), r.sort && o.sort(r.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let p = 0; p < o.length; ++p) {
    const m = o[p];
    r.skipNulls && n[m] === null || Ep(s, Cp(n[m], m, u, c, r.allowEmptyArrays, r.strictNullHandling, r.skipNulls, r.encodeDotInKeys, r.encode ? r.encoder : null, r.filter, r.sort, r.allowDots, r.serializeDate, r.format, r.formatter, r.encodeValuesOnly, r.charset, d));
  }
  const f = s.join(r.delimiter);
  let h = r.addQueryPrefix === !0 ? "?" : "";
  return r.charsetSentinel && (r.charset === "iso-8859-1" ? h += "utf8=%26%2310003%3B&" : h += "utf8=%E2%9C%93&"), f.length > 0 ? h + f : "";
}
function TI(e) {
  return AI(e, { arrayFormat: "brackets" });
}
function SI(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var ad;
function Da(e) {
  let t;
  return (ad ?? (t = new globalThis.TextEncoder(), ad = t.encode.bind(t)))(e);
}
var ld;
function ud(e) {
  let t;
  return (ld ?? (t = new globalThis.TextDecoder(), ld = t.decode.bind(t)))(e);
}
var Be, Ge, Ii = class {
  constructor() {
    Be.set(this, void 0), Ge.set(this, void 0), V(this, Be, new Uint8Array(), "f"), V(this, Ge, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Da(e) : e;
    V(this, Be, SI([w(this, Be, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = EI(w(this, Be, "f"), w(this, Ge, "f"))) != null; ) {
      if (r.carriage && w(this, Ge, "f") == null) {
        V(this, Ge, r.index, "f");
        continue;
      }
      if (w(this, Ge, "f") != null && (r.index !== w(this, Ge, "f") + 1 || r.carriage)) {
        n.push(ud(w(this, Be, "f").subarray(0, w(this, Ge, "f") - 1))), V(this, Be, w(this, Be, "f").subarray(w(this, Ge, "f")), "f"), V(this, Ge, null, "f");
        continue;
      }
      const o = w(this, Ge, "f") !== null ? r.preceding - 1 : r.preceding, i = ud(w(this, Be, "f").subarray(0, o));
      n.push(i), V(this, Be, w(this, Be, "f").subarray(r.index), "f"), V(this, Ge, null, "f");
    }
    return n;
  }
  flush() {
    return w(this, Be, "f").length ? this.decode(`
`) : [];
  }
};
Be = /* @__PURE__ */ new WeakMap(), Ge = /* @__PURE__ */ new WeakMap();
Ii.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Ii.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function EI(e, t) {
  for (let o = t ?? 0; o < e.length; o++) {
    if (e[o] === 10) return {
      preceding: o,
      index: o + 1,
      carriage: !1
    };
    if (e[o] === 13) return {
      preceding: o,
      index: o + 1,
      carriage: !0
    };
  }
  return null;
}
function CI(e) {
  for (let r = 0; r < e.length - 1; r++) {
    if (e[r] === 10 && e[r + 1] === 10 || e[r] === 13 && e[r + 1] === 13) return r + 2;
    if (e[r] === 13 && e[r + 1] === 10 && r + 3 < e.length && e[r + 2] === 13 && e[r + 3] === 10) return r + 4;
  }
  return -1;
}
var ii = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, cd = (e, t, n) => {
  if (e) {
    if (aI(ii, e)) return e;
    Ee(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(ii))}`);
  }
};
function Ar() {
}
function bo(e, t, n) {
  return !t || ii[e] > ii[n] ? Ar : t[e].bind(t);
}
var wI = {
  error: Ar,
  warn: Ar,
  info: Ar,
  debug: Ar
}, dd = /* @__PURE__ */ new WeakMap();
function Ee(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return wI;
  const r = dd.get(t);
  if (r && r[0] === n) return r[1];
  const o = {
    error: bo("error", t, n),
    warn: bo("warn", t, n),
    info: bo("info", t, n),
    debug: bo("debug", t, n)
  };
  return dd.set(t, [n, o]), o;
}
var Yt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "api-key" || t.toLowerCase() === "x-api-key" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), dr, qr = class Tr {
  constructor(t, n, r) {
    this.iterator = t, dr.set(this, void 0), this.controller = n, V(this, dr, r, "f");
  }
  static fromSSEResponse(t, n, r, o) {
    let i = !1;
    const s = r ? Ee(r) : console;
    async function* u() {
      if (i) throw new G("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let c = !1;
      try {
        for await (const d of II(t, n))
          if (!c) {
            if (d.data.startsWith("[DONE]")) {
              c = !0;
              continue;
            }
            if (d.event === null || !d.event.startsWith("thread.")) {
              let f;
              try {
                f = JSON.parse(d.data);
              } catch (h) {
                throw s.error("Could not parse message into JSON:", d.data), s.error("From chunk:", d.raw), h;
              }
              if (f && f.error) throw new be(void 0, f.error, void 0, t.headers);
              yield o ? {
                event: d.event,
                data: f
              } : f;
            } else {
              let f;
              try {
                f = JSON.parse(d.data);
              } catch (h) {
                throw console.error("Could not parse message into JSON:", d.data), console.error("From chunk:", d.raw), h;
              }
              if (d.event == "error") throw new be(void 0, f.error, f.message, void 0);
              yield {
                event: d.event,
                data: f
              };
            }
          }
        c = !0;
      } catch (d) {
        if (qs(d)) return;
        throw d;
      } finally {
        c || n.abort();
      }
    }
    return new Tr(u, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    async function* i() {
      const u = new Ii(), c = vp(t);
      for await (const d of c) for (const f of u.decode(d)) yield f;
      for (const d of u.flush()) yield d;
    }
    async function* s() {
      if (o) throw new G("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let u = !1;
      try {
        for await (const c of i())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (qs(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Tr(s, n, r);
  }
  [(dr = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], r = this.iterator(), o = (i) => ({ next: () => {
      if (i.length === 0) {
        const s = r.next();
        t.push(s), n.push(s);
      }
      return i.shift();
    } });
    return [new Tr(() => o(t), this.controller, w(this, dr, "f")), new Tr(() => o(n), this.controller, w(this, dr, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return yp({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: i } = await n.next();
          if (i) return r.close();
          const s = Da(JSON.stringify(o) + `
`);
          r.enqueue(s);
        } catch (o) {
          r.error(o);
        }
      },
      async cancel() {
        await n.return?.();
      }
    });
  }
};
async function* II(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new G("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new G("Attempted to iterate over a response with no body");
  const n = new PI(), r = new Ii(), o = vp(e.body);
  for await (const i of bI(o)) for (const s of r.decode(i)) {
    const u = n.decode(s);
    u && (yield u);
  }
  for (const i of r.flush()) {
    const s = n.decode(i);
    s && (yield s);
  }
}
async function* bI(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Da(n) : n;
    let o = new Uint8Array(t.length + r.length);
    o.set(t), o.set(r, t.length), t = o;
    let i;
    for (; (i = CI(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var PI = class {
  constructor() {
    this.event = null, this.data = [], this.chunks = [];
  }
  decode(e) {
    if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
      if (!this.event && !this.data.length) return null;
      const o = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      return this.event = null, this.data = [], this.chunks = [], o;
    }
    if (this.chunks.push(e), e.startsWith(":")) return null;
    let [t, n, r] = RI(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function RI(e, t) {
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
async function wp(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: i } = t, s = await (async () => {
    if (t.options.stream)
      return Ee(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : qr.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Ip(await n.json(), n) : await n.text();
  })();
  return Ee(e).debug(`[${r}] response parsed`, Yt({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: s,
    durationMs: Date.now() - i
  })), s;
}
function Ip(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var Sr, bp = class Pp extends Promise {
  constructor(t, n, r = wp) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, Sr.set(this, void 0), V(this, Sr, t, "f");
  }
  _thenUnwrap(t) {
    return new Pp(w(this, Sr, "f"), this.responsePromise, async (n, r) => Ip(t(await this.parseResponse(n, r), r), r.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(w(this, Sr, "f"), t))), this.parsedPromise;
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
Sr = /* @__PURE__ */ new WeakMap();
var Po, bi = class {
  constructor(e, t, n, r) {
    Po.set(this, void 0), V(this, Po, e, "f"), this.options = r, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new G("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await w(this, Po, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(Po = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, xI = class extends bp {
  constructor(e, t, n) {
    super(e, t, async (r, o) => new n(r, o.response, await wp(r, o), o.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, qt = class extends bi {
  constructor(e, t, n, r) {
    super(e, t, n, r), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, te = class extends bi {
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
        ...ka(this.options.query),
        after: t
      }
    } : null;
  }
}, we = class extends bi {
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
        ...ka(this.options.query),
        after: e
      }
    } : null;
  }
}, bt = class extends bi {
  constructor(e, t, n, r) {
    super(e, t, n, r), this.data = n.data || [], this.has_more = n.has_more || !1, this.next = n.next || null;
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
        ...ka(this.options.query),
        after: e
      }
    } : null;
  }
}, MI = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, NI = "urn:ietf:params:oauth:grant-type:token-exchange", kI = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? gp();
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
      grant_type: NI,
      subject_token: await this.config.provider.getToken(),
      subject_token_type: MI[this.config.provider.tokenType],
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
      let s;
      try {
        s = JSON.parse(i);
      } catch {
      }
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new mp(t.status, s, t.headers) : be.generate(t.status, s, `Token exchange failed with status ${t.status}`, t.headers);
    }
    const n = await t.json(), r = n.expires_in || 3600, o = Date.now() + r * 1e3;
    return this.cachedToken = {
      token: n.access_token,
      expiresAt: o
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
}, Rp = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Nr(e, t, n) {
  return Rp(), new File(e, t ?? "unknown_file", n);
}
function Go(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var $a = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Pi = async (e, t) => Vs(e.body) ? {
  ...e,
  body: await xp(e.body, t)
} : e, ht = async (e, t) => ({
  ...e,
  body: await xp(e.body, t)
}), fd = /* @__PURE__ */ new WeakMap();
function DI(e) {
  const t = typeof e == "function" ? e : e.fetch, n = fd.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const o = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new o(i).text();
    } catch {
      return !0;
    }
  })();
  return fd.set(t, r), r;
}
var xp = async (e, t) => {
  if (!await DI(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([r, o]) => Js(n, r, o))), n;
}, Mp = (e) => e instanceof Blob && "name" in e, $I = (e) => typeof e == "object" && e !== null && (e instanceof Response || $a(e) || Mp(e)), Vs = (e) => {
  if ($I(e)) return !0;
  if (Array.isArray(e)) return e.some(Vs);
  if (e && typeof e == "object") {
    for (const t in e) if (Vs(e[t])) return !0;
  }
  return !1;
}, Js = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, Nr([await n.blob()], Go(n)));
    else if ($a(n)) e.append(t, Nr([await new Response(_p(n)).blob()], Go(n)));
    else if (Mp(n)) e.append(t, n, Go(n));
    else if (Array.isArray(n)) await Promise.all(n.map((r) => Js(e, t + "[]", r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([r, o]) => Js(e, `${t}[${r}]`, o)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, Np = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", LI = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Np(e), UI = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function FI(e, t, n) {
  if (Rp(), e = await e, LI(e))
    return e instanceof File ? e : Nr([await e.arrayBuffer()], e.name);
  if (UI(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Nr(await Ks(o), t, n);
  }
  const r = await Ks(e);
  if (t || (t = Go(e)), !n?.type) {
    const o = r.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof o == "string" && (n = {
      ...n,
      type: o
    });
  }
  return Nr(r, t, n);
}
async function Ks(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (Np(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if ($a(e)) for await (const n of e) t.push(...await Ks(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${OI(e)}`);
  }
  return t;
}
function OI(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var k = class {
  constructor(e) {
    this._client = e;
  }
};
function kp(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var hd = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), qI = (e = kp) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const i = [], s = n.reduce((f, h, p) => {
    /[?#]/.test(h) && (o = !0);
    const m = r[p];
    let g = (o ? encodeURIComponent : e)("" + m);
    return p !== r.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? hd) ?? hd)?.toString) && (g = m + "", i.push({
      start: f.length + h.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), f + h + (p === r.length ? "" : g);
  }, ""), u = s.split(/[?#]/, 1)[0], c = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) i.push({
    start: d.index,
    length: d[0].length,
    error: `Value "${d[0]}" can't be safely passed as a path parameter`
  });
  if (i.sort((f, h) => f.start - h.start), i.length > 0) {
    let f = 0;
    const h = i.reduce((p, m) => {
      const g = " ".repeat(m.start - f), _ = "^".repeat(m.length);
      return f = m.start + m.length, p + g + _;
    }, "");
    throw new G(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${s}
${h}`);
  }
  return s;
}, T = /* @__PURE__ */ qI(kp), Dp = class extends k {
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/chat/completions/${e}/messages`, te, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
function si(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function La(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function to(e) {
  return e?.$brand === "auto-parseable-tool";
}
function BI(e, t) {
  return !t || !$p(t) ? {
    ...e,
    choices: e.choices.map((n) => (Lp(n.message.tool_calls), {
      ...n,
      message: {
        ...n.message,
        parsed: null,
        ...n.message.tool_calls ? { tool_calls: n.message.tool_calls } : void 0
      }
    }))
  } : Ua(e, t);
}
function Ua(e, t) {
  const n = e.choices.map((r) => {
    if (r.finish_reason === "length") throw new hp();
    if (r.finish_reason === "content_filter") throw new pp();
    return Lp(r.message.tool_calls), {
      ...r,
      message: {
        ...r.message,
        ...r.message.tool_calls ? { tool_calls: r.message.tool_calls?.map((o) => HI(t, o)) ?? void 0 } : void 0,
        parsed: r.message.content && !r.message.refusal ? GI(t, r.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function GI(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function HI(e, t) {
  const n = e.tools?.find((r) => si(r) && r.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: to(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function VI(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((r) => si(r) && r.function?.name === t.function.name);
  return si(n) && (to(n) || n?.function.strict || !1);
}
function $p(e) {
  return La(e.response_format) ? !0 : e.tools?.some((t) => to(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function Lp(e) {
  for (const t of e || []) if (t.type !== "function") throw new G(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function JI(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new G(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new G(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var ai = (e) => e?.role === "assistant", Up = (e) => e?.role === "tool", Ws, Ho, Vo, Er, Cr, Jo, wr, vt, Ir, li, ui, En, Fp, Fa = class {
  constructor() {
    Ws.add(this), this.controller = new AbortController(), Ho.set(this, void 0), Vo.set(this, () => {
    }), Er.set(this, () => {
    }), Cr.set(this, void 0), Jo.set(this, () => {
    }), wr.set(this, () => {
    }), vt.set(this, {}), Ir.set(this, !1), li.set(this, !1), ui.set(this, !1), En.set(this, !1), V(this, Ho, new Promise((e, t) => {
      V(this, Vo, e, "f"), V(this, Er, t, "f");
    }), "f"), V(this, Cr, new Promise((e, t) => {
      V(this, Jo, e, "f"), V(this, wr, t, "f");
    }), "f"), w(this, Ho, "f").catch(() => {
    }), w(this, Cr, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, w(this, Ws, "m", Fp).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (w(this, Vo, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return w(this, Ir, "f");
  }
  get errored() {
    return w(this, li, "f");
  }
  get aborted() {
    return w(this, ui, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(e, t) {
    return (w(this, vt, "f")[e] || (w(this, vt, "f")[e] = [])).push({ listener: t }), this;
  }
  off(e, t) {
    const n = w(this, vt, "f")[e];
    if (!n) return this;
    const r = n.findIndex((o) => o.listener === t);
    return r >= 0 && n.splice(r, 1), this;
  }
  once(e, t) {
    return (w(this, vt, "f")[e] || (w(this, vt, "f")[e] = [])).push({
      listener: t,
      once: !0
    }), this;
  }
  emitted(e) {
    return new Promise((t, n) => {
      V(this, En, !0, "f"), e !== "error" && this.once("error", n), this.once(e, t);
    });
  }
  async done() {
    V(this, En, !0, "f"), await w(this, Cr, "f");
  }
  _emit(e, ...t) {
    if (w(this, Ir, "f")) return;
    e === "end" && (V(this, Ir, !0, "f"), w(this, Jo, "f").call(this));
    const n = w(this, vt, "f")[e];
    if (n && (w(this, vt, "f")[e] = n.filter((r) => !r.once), n.forEach(({ listener: r }) => r(...t))), e === "abort") {
      const r = t[0];
      !w(this, En, "f") && !n?.length && Promise.reject(r), w(this, Er, "f").call(this, r), w(this, wr, "f").call(this, r), this._emit("end");
      return;
    }
    if (e === "error") {
      const r = t[0];
      !w(this, En, "f") && !n?.length && Promise.reject(r), w(this, Er, "f").call(this, r), w(this, wr, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
Ho = /* @__PURE__ */ new WeakMap(), Vo = /* @__PURE__ */ new WeakMap(), Er = /* @__PURE__ */ new WeakMap(), Cr = /* @__PURE__ */ new WeakMap(), Jo = /* @__PURE__ */ new WeakMap(), wr = /* @__PURE__ */ new WeakMap(), vt = /* @__PURE__ */ new WeakMap(), Ir = /* @__PURE__ */ new WeakMap(), li = /* @__PURE__ */ new WeakMap(), ui = /* @__PURE__ */ new WeakMap(), En = /* @__PURE__ */ new WeakMap(), Ws = /* @__PURE__ */ new WeakSet(), Fp = function(t) {
  if (V(this, li, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new Ze()), t instanceof Ze)
    return V(this, ui, !0, "f"), this._emit("abort", t);
  if (t instanceof G) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new G(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new G(String(t)));
};
function KI(e) {
  return typeof e.parse == "function";
}
var Pe, zs, ci, Ys, Xs, Qs, Op, qp, WI = 10, Bp = class extends Fa {
  constructor() {
    super(...arguments), Pe.add(this), this._chatCompletions = [], this.messages = [];
  }
  _addChatCompletion(e) {
    this._chatCompletions.push(e), this._emit("chatCompletion", e);
    const t = e.choices[0]?.message;
    return t && this._addMessage(t), e;
  }
  _addMessage(e, t = !0) {
    if ("content" in e || (e.content = null), this.messages.push(e), t) {
      if (this._emit("message", e), Up(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (ai(e) && e.tool_calls)
        for (const n of e.tool_calls) n.type === "function" && this._emit("functionToolCall", n.function);
    }
  }
  async finalChatCompletion() {
    await this.done();
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    if (!e) throw new G("stream ended without producing a ChatCompletion");
    return e;
  }
  async finalContent() {
    return await this.done(), w(this, Pe, "m", zs).call(this);
  }
  async finalMessage() {
    return await this.done(), w(this, Pe, "m", ci).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), w(this, Pe, "m", Ys).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), w(this, Pe, "m", Xs).call(this);
  }
  async totalUsage() {
    return await this.done(), w(this, Pe, "m", Qs).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = w(this, Pe, "m", ci).call(this);
    t && this._emit("finalMessage", t);
    const n = w(this, Pe, "m", zs).call(this);
    n && this._emit("finalContent", n);
    const r = w(this, Pe, "m", Ys).call(this);
    r && this._emit("finalFunctionToolCall", r);
    const o = w(this, Pe, "m", Xs).call(this);
    o != null && this._emit("finalFunctionToolCallResult", o), this._chatCompletions.some((i) => i.usage) && this._emit("totalUsage", w(this, Pe, "m", Qs).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), w(this, Pe, "m", Op).call(this, t);
    const o = await e.chat.completions.create({
      ...t,
      stream: !1
    }, {
      ...n,
      signal: this.controller.signal
    });
    return this._connected(), this._addChatCompletion(Ua(o, t));
  }
  async _runChatCompletion(e, t, n) {
    for (const r of t.messages) this._addMessage(r, !1);
    return await this._createChatCompletion(e, t, n);
  }
  async _runTools(e, t, n) {
    const r = "tool", { tool_choice: o = "auto", stream: i, ...s } = t, u = typeof o != "string" && o.type === "function" && o?.function?.name, { maxChatCompletions: c = WI } = n || {}, d = t.tools.map((p) => {
      if (to(p)) {
        if (!p.$callback) throw new G("Tool given to `.runTools()` that does not have an associated function");
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
    }), f = {};
    for (const p of d) p.type === "function" && (f[p.function.name || p.function.function.name] = p.function);
    const h = "tools" in t ? d.map((p) => p.type === "function" ? {
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
        tool_choice: o,
        tools: h,
        messages: [...this.messages]
      }, n)).choices[0]?.message;
      if (!m) throw new G("missing message in ChatCompletion response");
      if (!m.tool_calls?.length) return;
      for (const g of m.tool_calls) {
        if (g.type !== "function") continue;
        const _ = g.id, { name: v, arguments: C } = g.function, b = f[v];
        if (b) {
          if (u && u !== v) {
            const A = `Invalid tool_call: ${JSON.stringify(v)}. ${JSON.stringify(u)} requested. Please try again`;
            this._addMessage({
              role: r,
              tool_call_id: _,
              content: A
            });
            continue;
          }
        } else {
          const A = `Invalid tool_call: ${JSON.stringify(v)}. Available options are: ${Object.keys(f).map((U) => JSON.stringify(U)).join(", ")}. Please try again`;
          this._addMessage({
            role: r,
            tool_call_id: _,
            content: A
          });
          continue;
        }
        let P;
        try {
          P = KI(b) ? await b.parse(C) : C;
        } catch (A) {
          const U = A instanceof Error ? A.message : String(A);
          this._addMessage({
            role: r,
            tool_call_id: _,
            content: U
          });
          continue;
        }
        const R = await b.function(P, this), D = w(this, Pe, "m", qp).call(this, R);
        if (this._addMessage({
          role: r,
          tool_call_id: _,
          content: D
        }), u) return;
      }
    }
  }
};
Pe = /* @__PURE__ */ new WeakSet(), zs = function() {
  return w(this, Pe, "m", ci).call(this).content ?? null;
}, ci = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (ai(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new G("stream ended without producing a ChatCompletionMessage with role=assistant");
}, Ys = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (ai(n) && n?.tool_calls?.length) for (let r = n.tool_calls.length - 1; r >= 0; r--) {
      const o = n.tool_calls[r];
      if (o?.type === "function") return o.function;
    }
  }
}, Xs = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (Up(n) && n.content != null && typeof n.content == "string" && this.messages.some((r) => r.role === "assistant" && r.tool_calls?.some((o) => o.type === "function" && o.id === n.tool_call_id))) return n.content;
  }
}, Qs = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, Op = function(t) {
  if (t.n != null && t.n > 1) throw new G("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, qp = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var zI = class Gp extends Bp {
  static runTools(t, n, r) {
    const o = new Gp(), i = {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return o._run(() => o._runTools(t, n, i)), o;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), ai(t) && t.content && this._emit("content", t.content);
  }
}, Ae = {
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
}, YI = class extends Error {
}, XI = class extends Error {
};
function QI(e, t = Ae.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return ZI(e.trim(), t);
}
var ZI = (e, t) => {
  const n = e.length;
  let r = 0;
  const o = (p) => {
    throw new YI(`${p} at position ${r}`);
  }, i = (p) => {
    throw new XI(`${p} at position ${r}`);
  }, s = () => (h(), r >= n && o("Unexpected end of input"), e[r] === '"' ? u() : e[r] === "{" ? c() : e[r] === "[" ? d() : e.substring(r, r + 4) === "null" || Ae.NULL & t && n - r < 4 && "null".startsWith(e.substring(r)) ? (r += 4, null) : e.substring(r, r + 4) === "true" || Ae.BOOL & t && n - r < 4 && "true".startsWith(e.substring(r)) ? (r += 4, !0) : e.substring(r, r + 5) === "false" || Ae.BOOL & t && n - r < 5 && "false".startsWith(e.substring(r)) ? (r += 5, !1) : e.substring(r, r + 8) === "Infinity" || Ae.INFINITY & t && n - r < 8 && "Infinity".startsWith(e.substring(r)) ? (r += 8, 1 / 0) : e.substring(r, r + 9) === "-Infinity" || Ae.MINUS_INFINITY & t && 1 < n - r && n - r < 9 && "-Infinity".startsWith(e.substring(r)) ? (r += 9, -1 / 0) : e.substring(r, r + 3) === "NaN" || Ae.NAN & t && n - r < 3 && "NaN".startsWith(e.substring(r)) ? (r += 3, NaN) : f()), u = () => {
    const p = r;
    let m = !1;
    for (r++; r < n && (e[r] !== '"' || m && e[r - 1] === "\\"); )
      m = e[r] === "\\" ? !m : !1, r++;
    if (e.charAt(r) == '"') try {
      return JSON.parse(e.substring(p, ++r - Number(m)));
    } catch (g) {
      i(String(g));
    }
    else if (Ae.STR & t) try {
      return JSON.parse(e.substring(p, r - Number(m)) + '"');
    } catch {
      return JSON.parse(e.substring(p, e.lastIndexOf("\\")) + '"');
    }
    o("Unterminated string literal");
  }, c = () => {
    r++, h();
    const p = {};
    try {
      for (; e[r] !== "}"; ) {
        if (h(), r >= n && Ae.OBJ & t) return p;
        const m = u();
        h(), r++;
        try {
          const g = s();
          Object.defineProperty(p, m, {
            value: g,
            writable: !0,
            enumerable: !0,
            configurable: !0
          });
        } catch (g) {
          if (Ae.OBJ & t) return p;
          throw g;
        }
        h(), e[r] === "," && r++;
      }
    } catch {
      if (Ae.OBJ & t) return p;
      o("Expected '}' at end of object");
    }
    return r++, p;
  }, d = () => {
    r++;
    const p = [];
    try {
      for (; e[r] !== "]"; )
        p.push(s()), h(), e[r] === "," && r++;
    } catch {
      if (Ae.ARR & t) return p;
      o("Expected ']' at end of array");
    }
    return r++, p;
  }, f = () => {
    if (r === 0) {
      e === "-" && Ae.NUM & t && o("Not sure what '-' is");
      try {
        return JSON.parse(e);
      } catch (m) {
        if (Ae.NUM & t) try {
          return e[e.length - 1] === "." ? JSON.parse(e.substring(0, e.lastIndexOf("."))) : JSON.parse(e.substring(0, e.lastIndexOf("e")));
        } catch {
        }
        i(String(m));
      }
    }
    const p = r;
    for (e[r] === "-" && r++; e[r] && !",]}".includes(e[r]); ) r++;
    r == n && !(Ae.NUM & t) && o("Unterminated number literal");
    try {
      return JSON.parse(e.substring(p, r));
    } catch {
      e.substring(p, r) === "-" && Ae.NUM & t && o("Not sure what '-' is");
      try {
        return JSON.parse(e.substring(p, e.lastIndexOf("e")));
      } catch (g) {
        i(String(g));
      }
    }
  }, h = () => {
    for (; r < n && [
      32,
      10,
      13,
      9
    ].includes(e.charCodeAt(r)); ) r++;
  };
  return s();
}, pd = (e) => QI(e, Ae.ALL ^ Ae.NUM), fe, _t, yn, kt, os, Ro, is, ss, as, xo, ls, md, Hp = class Zs extends Bp {
  constructor(t) {
    super(), fe.add(this), _t.set(this, void 0), yn.set(this, void 0), kt.set(this, void 0), V(this, _t, t, "f"), V(this, yn, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return w(this, kt, "f");
  }
  static fromReadableStream(t) {
    const n = new Zs(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createChatCompletion(t, n, r) {
    const o = new Zs(n);
    return o._run(() => o._runChatCompletion(t, {
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
  async _createChatCompletion(t, n, r) {
    super._createChatCompletion;
    const o = r?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), w(this, fe, "m", os).call(this);
    const i = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...r,
      signal: this.controller.signal
    });
    this._connected();
    for await (const s of i) w(this, fe, "m", is).call(this, s);
    if (i.controller.signal?.aborted) throw new Ze();
    return this._addChatCompletion(w(this, fe, "m", xo).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), w(this, fe, "m", os).call(this), this._connected();
    const o = qr.fromReadableStream(t, this.controller);
    let i;
    for await (const s of o)
      i && i !== s.id && this._addChatCompletion(w(this, fe, "m", xo).call(this)), w(this, fe, "m", is).call(this, s), i = s.id;
    if (o.controller.signal?.aborted) throw new Ze();
    return this._addChatCompletion(w(this, fe, "m", xo).call(this));
  }
  [(_t = /* @__PURE__ */ new WeakMap(), yn = /* @__PURE__ */ new WeakMap(), kt = /* @__PURE__ */ new WeakMap(), fe = /* @__PURE__ */ new WeakSet(), os = function() {
    this.ended || V(this, kt, void 0, "f");
  }, Ro = function(n) {
    let r = w(this, yn, "f")[n.index];
    return r || (r = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, w(this, yn, "f")[n.index] = r, r);
  }, is = function(n) {
    if (this.ended) return;
    const r = w(this, fe, "m", md).call(this, n);
    this._emit("chunk", n, r);
    for (const o of n.choices) {
      const i = r.choices[o.index];
      o.delta.content != null && i.message?.role === "assistant" && i.message?.content && (this._emit("content", o.delta.content, i.message.content), this._emit("content.delta", {
        delta: o.delta.content,
        snapshot: i.message.content,
        parsed: i.message.parsed
      })), o.delta.refusal != null && i.message?.role === "assistant" && i.message?.refusal && this._emit("refusal.delta", {
        delta: o.delta.refusal,
        snapshot: i.message.refusal
      }), o.logprobs?.content != null && i.message?.role === "assistant" && this._emit("logprobs.content.delta", {
        content: o.logprobs?.content,
        snapshot: i.logprobs?.content ?? []
      }), o.logprobs?.refusal != null && i.message?.role === "assistant" && this._emit("logprobs.refusal.delta", {
        refusal: o.logprobs?.refusal,
        snapshot: i.logprobs?.refusal ?? []
      });
      const s = w(this, fe, "m", Ro).call(this, i);
      i.finish_reason && (w(this, fe, "m", as).call(this, i), s.current_tool_call_index != null && w(this, fe, "m", ss).call(this, i, s.current_tool_call_index));
      for (const u of o.delta.tool_calls ?? [])
        s.current_tool_call_index !== u.index && (w(this, fe, "m", as).call(this, i), s.current_tool_call_index != null && w(this, fe, "m", ss).call(this, i, s.current_tool_call_index)), s.current_tool_call_index = u.index;
      for (const u of o.delta.tool_calls ?? []) {
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
  }, ss = function(n, r) {
    if (w(this, fe, "m", Ro).call(this, n).done_tool_calls.has(r)) return;
    const o = n.message.tool_calls?.[r];
    if (!o) throw new Error("no tool call snapshot");
    if (!o.type) throw new Error("tool call snapshot missing `type`");
    if (o.type === "function") {
      const i = w(this, _t, "f")?.tools?.find((s) => si(s) && s.function.name === o.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: o.function.name,
        index: r,
        arguments: o.function.arguments,
        parsed_arguments: to(i) ? i.$parseRaw(o.function.arguments) : i?.function.strict ? JSON.parse(o.function.arguments) : null
      });
    } else o.type;
  }, as = function(n) {
    const r = w(this, fe, "m", Ro).call(this, n);
    if (n.message.content && !r.content_done) {
      r.content_done = !0;
      const o = w(this, fe, "m", ls).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: o ? o.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !r.refusal_done && (r.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !r.logprobs_content_done && (r.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !r.logprobs_refusal_done && (r.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, xo = function() {
    if (this.ended) throw new G("stream has ended, this shouldn't happen");
    const n = w(this, kt, "f");
    if (!n) throw new G("request ended without sending any chunks");
    return V(this, kt, void 0, "f"), V(this, yn, [], "f"), jI(n, w(this, _t, "f"));
  }, ls = function() {
    const n = w(this, _t, "f")?.response_format;
    return La(n) ? n : null;
  }, md = function(n) {
    var r, o, i, s;
    let u = w(this, kt, "f");
    const { choices: c, ...d } = n;
    u ? Object.assign(u, d) : u = V(this, kt, {
      ...d,
      choices: []
    }, "f");
    for (const { delta: f, finish_reason: h, index: p, logprobs: m = null, ...g } of n.choices) {
      let _ = u.choices[p];
      if (_ || (_ = u.choices[p] = {
        finish_reason: h,
        index: p,
        message: {},
        logprobs: m,
        ...g
      }), m) if (!_.logprobs) _.logprobs = Object.assign({}, m);
      else {
        const { content: A, refusal: U, ...x } = m;
        Object.assign(_.logprobs, x), A && ((r = _.logprobs).content ?? (r.content = []), _.logprobs.content.push(...A)), U && ((o = _.logprobs).refusal ?? (o.refusal = []), _.logprobs.refusal.push(...U));
      }
      if (h && (_.finish_reason = h, w(this, _t, "f") && $p(w(this, _t, "f")))) {
        if (h === "length") throw new hp();
        if (h === "content_filter") throw new pp();
      }
      if (Object.assign(_, g), !f) continue;
      const { content: v, refusal: C, function_call: b, role: P, tool_calls: R, ...D } = f;
      if (Object.assign(_.message, D), C && (_.message.refusal = (_.message.refusal || "") + C), P && (_.message.role = P), b && (_.message.function_call ? (b.name && (_.message.function_call.name = b.name), b.arguments && ((i = _.message.function_call).arguments ?? (i.arguments = ""), _.message.function_call.arguments += b.arguments)) : _.message.function_call = b), v && (_.message.content = (_.message.content || "") + v, !_.message.refusal && w(this, fe, "m", ls).call(this) && (_.message.parsed = pd(_.message.content))), R) {
        _.message.tool_calls || (_.message.tool_calls = []);
        for (const { index: A, id: U, type: x, function: $, ...H } of R) {
          const z = (s = _.message.tool_calls)[A] ?? (s[A] = {});
          Object.assign(z, H), U && (z.id = U), x && (z.type = x), $ && (z.function ?? (z.function = {
            name: $.name ?? "",
            arguments: ""
          })), $?.name && (z.function.name = $.name), $?.arguments && (z.function.arguments += $.arguments, VI(w(this, _t, "f"), z) && (z.function.parsed_arguments = pd(z.function.arguments)));
        }
      }
    }
    return u;
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let r = !1;
    return this.on("chunk", (o) => {
      const i = n.shift();
      i ? i.resolve(o) : t.push(o);
    }), this.on("end", () => {
      r = !0;
      for (const o of n) o.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (o) => {
      r = !0;
      for (const i of n) i.reject(o);
      n.length = 0;
    }), this.on("error", (o) => {
      r = !0;
      for (const i of n) i.reject(o);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : r ? {
        value: void 0,
        done: !0
      } : new Promise((o, i) => n.push({
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
  toReadableStream() {
    return new qr(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
function jI(e, t) {
  const { id: n, choices: r, created: o, model: i, system_fingerprint: s, ...u } = e;
  return BI({
    ...u,
    id: n,
    choices: r.map(({ message: c, finish_reason: d, index: f, logprobs: h, ...p }) => {
      if (!d) throw new G(`missing finish_reason for choice ${f}`);
      const { content: m = null, function_call: g, tool_calls: _, ...v } = c, C = c.role;
      if (!C) throw new G(`missing role for choice ${f}`);
      if (g) {
        const { arguments: b, name: P } = g;
        if (b == null) throw new G(`missing function_call.arguments for choice ${f}`);
        if (!P) throw new G(`missing function_call.name for choice ${f}`);
        return {
          ...p,
          message: {
            content: m,
            function_call: {
              arguments: b,
              name: P
            },
            role: C,
            refusal: c.refusal ?? null
          },
          finish_reason: d,
          index: f,
          logprobs: h
        };
      }
      return _ ? {
        ...p,
        index: f,
        finish_reason: d,
        logprobs: h,
        message: {
          ...v,
          role: C,
          content: m,
          refusal: c.refusal ?? null,
          tool_calls: _.map((b, P) => {
            const { function: R, type: D, id: A, ...U } = b, { arguments: x, name: $, ...H } = R || {};
            if (A == null) throw new G(`missing choices[${f}].tool_calls[${P}].id
${Mo(e)}`);
            if (D == null) throw new G(`missing choices[${f}].tool_calls[${P}].type
${Mo(e)}`);
            if ($ == null) throw new G(`missing choices[${f}].tool_calls[${P}].function.name
${Mo(e)}`);
            if (x == null) throw new G(`missing choices[${f}].tool_calls[${P}].function.arguments
${Mo(e)}`);
            return {
              ...U,
              id: A,
              type: D,
              function: {
                ...H,
                name: $,
                arguments: x
              }
            };
          })
        }
      } : {
        ...p,
        message: {
          ...v,
          content: m,
          role: C,
          refusal: c.refusal ?? null
        },
        finish_reason: d,
        index: f,
        logprobs: h
      };
    }),
    created: o,
    model: i,
    object: "chat.completion",
    ...s ? { system_fingerprint: s } : {}
  }, t);
}
function Mo(e) {
  return JSON.stringify(e);
}
var eb = class js extends Hp {
  static fromReadableStream(t) {
    const n = new js(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static runTools(t, n, r) {
    const o = new js(n), i = {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return o._run(() => o._runTools(t, n, i)), o;
  }
}, Oa = class extends k {
  constructor() {
    super(...arguments), this.messages = new Dp(this._client);
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
    return this._client.get(T`/chat/completions/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/chat/completions/${e}`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chat/completions", te, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/chat/completions/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  parse(e, t) {
    return JI(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => Ua(n, e));
  }
  runTools(e, t) {
    return e.stream ? eb.runTools(this._client, e, t) : zI.runTools(this._client, e, t);
  }
  stream(e, t) {
    return Hp.createChatCompletion(this._client, e, t);
  }
};
Oa.Messages = Dp;
var qa = class extends k {
  constructor() {
    super(...arguments), this.completions = new Oa(this._client);
  }
};
qa.Completions = Oa;
var Vp = class extends k {
  create(e, t) {
    return this._client.post("/organization/admin_api_keys", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/organization/admin_api_keys/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/admin_api_keys", te, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/organization/admin_api_keys/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Jp = class extends k {
  list(e = {}, t) {
    return this._client.getAPIList("/organization/audit_logs", we, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Kp = class extends k {
  create(e, t) {
    return this._client.post("/organization/certificates", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t = {}, n) {
    return this._client.get(T`/organization/certificates/${e}`, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/organization/certificates/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/certificates", we, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/organization/certificates/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  activate(e, t) {
    return this._client.getAPIList("/organization/certificates/activate", qt, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t) {
    return this._client.getAPIList("/organization/certificates/deactivate", qt, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Wp = class extends k {
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
}, zp = class extends k {
  create(e, t) {
    return this._client.post("/organization/invites", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/organization/invites/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/invites", we, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/organization/invites/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Yp = class extends k {
  create(e, t) {
    return this._client.post("/organization/roles", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/organization/roles/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/organization/roles/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/roles", bt, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/organization/roles/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Xp = class extends k {
  create(e, t) {
    return this._client.post("/organization/spend_alerts", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/organization/spend_alerts/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/organization/spend_alerts/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/spend_alerts", we, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/organization/spend_alerts/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Qp = class extends k {
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
}, Zp = class extends k {
  create(e, t, n) {
    return this._client.post(T`/organization/groups/${e}/roles`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { group_id: r } = t;
    return this._client.get(T`/organization/groups/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/organization/groups/${e}/roles`, bt, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { group_id: r } = t;
    return this._client.delete(T`/organization/groups/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, jp = class extends k {
  create(e, t, n) {
    return this._client.post(T`/organization/groups/${e}/users`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { group_id: r } = t;
    return this._client.get(T`/organization/groups/${r}/users/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/organization/groups/${e}/users`, bt, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { group_id: r } = t;
    return this._client.delete(T`/organization/groups/${r}/users/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Ri = class extends k {
  constructor() {
    super(...arguments), this.users = new jp(this._client), this.roles = new Zp(this._client);
  }
  create(e, t) {
    return this._client.post("/organization/groups", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/organization/groups/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/organization/groups/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/groups", bt, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/organization/groups/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
Ri.Users = jp;
Ri.Roles = Zp;
var em = class extends k {
  retrieve(e, t, n) {
    const { project_id: r } = t;
    return this._client.get(T`/organization/projects/${r}/api_keys/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/api_keys`, we, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r } = t;
    return this._client.delete(T`/organization/projects/${r}/api_keys/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, tm = class extends k {
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/certificates`, we, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  activate(e, t, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/certificates/activate`, qt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/certificates/deactivate`, qt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, nm = class extends k {
  retrieve(e, t) {
    return this._client.get(T`/organization/projects/${e}/data_retention`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/organization/projects/${e}/data_retention`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, rm = class extends k {
  retrieve(e, t) {
    return this._client.get(T`/organization/projects/${e}/hosted_tool_permissions`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/organization/projects/${e}/hosted_tool_permissions`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, om = class extends k {
  retrieve(e, t) {
    return this._client.get(T`/organization/projects/${e}/model_permissions`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/organization/projects/${e}/model_permissions`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/organization/projects/${e}/model_permissions`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, im = class extends k {
  listRateLimits(e, t = {}, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/rate_limits`, we, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  updateRateLimit(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(T`/organization/projects/${r}/rate_limits/${e}`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, sm = class extends k {
  create(e, t, n) {
    return this._client.post(T`/projects/${e}/roles`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r } = t;
    return this._client.get(T`/projects/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(T`/projects/${r}/roles/${e}`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/projects/${e}/roles`, bt, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r } = t;
    return this._client.delete(T`/projects/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, am = class extends k {
  create(e, t, n) {
    return this._client.post(T`/organization/projects/${e}/service_accounts`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r } = t;
    return this._client.get(T`/organization/projects/${r}/service_accounts/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(T`/organization/projects/${r}/service_accounts/${e}`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/service_accounts`, we, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r } = t;
    return this._client.delete(T`/organization/projects/${r}/service_accounts/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, lm = class extends k {
  create(e, t, n) {
    return this._client.post(T`/organization/projects/${e}/spend_alerts`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r } = t;
    return this._client.get(T`/organization/projects/${r}/spend_alerts/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(T`/organization/projects/${r}/spend_alerts/${e}`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/spend_alerts`, we, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r } = t;
    return this._client.delete(T`/organization/projects/${r}/spend_alerts/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, um = class extends k {
  create(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(T`/projects/${r}/groups/${e}/roles`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r, group_id: o } = t;
    return this._client.get(T`/projects/${r}/groups/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.getAPIList(T`/projects/${r}/groups/${e}/roles`, bt, {
      query: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r, group_id: o } = t;
    return this._client.delete(T`/projects/${r}/groups/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Ba = class extends k {
  constructor() {
    super(...arguments), this.roles = new um(this._client);
  }
  create(e, t, n) {
    return this._client.post(T`/organization/projects/${e}/groups`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.get(T`/organization/projects/${r}/groups/${e}`, {
      query: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/groups`, bt, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r } = t;
    return this._client.delete(T`/organization/projects/${r}/groups/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
Ba.Roles = um;
var cm = class extends k {
  create(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(T`/projects/${r}/users/${e}/roles`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r, user_id: o } = t;
    return this._client.get(T`/projects/${r}/users/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.getAPIList(T`/projects/${r}/users/${e}/roles`, bt, {
      query: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r, user_id: o } = t;
    return this._client.delete(T`/projects/${r}/users/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Ga = class extends k {
  constructor() {
    super(...arguments), this.roles = new cm(this._client);
  }
  create(e, t, n) {
    return this._client.post(T`/organization/projects/${e}/users`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r } = t;
    return this._client.get(T`/organization/projects/${r}/users/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(T`/organization/projects/${r}/users/${e}`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/users`, we, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r } = t;
    return this._client.delete(T`/organization/projects/${r}/users/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
Ga.Roles = cm;
var We = class extends k {
  constructor() {
    super(...arguments), this.users = new Ga(this._client), this.serviceAccounts = new am(this._client), this.apiKeys = new em(this._client), this.rateLimits = new im(this._client), this.modelPermissions = new om(this._client), this.hostedToolPermissions = new rm(this._client), this.groups = new Ba(this._client), this.roles = new sm(this._client), this.dataRetention = new nm(this._client), this.spendAlerts = new lm(this._client), this.certificates = new tm(this._client);
  }
  create(e, t) {
    return this._client.post("/organization/projects", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/organization/projects/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/organization/projects/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/projects", we, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  archive(e, t) {
    return this._client.post(T`/organization/projects/${e}/archive`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
We.Users = Ga;
We.ServiceAccounts = am;
We.APIKeys = em;
We.RateLimits = im;
We.ModelPermissions = om;
We.HostedToolPermissions = rm;
We.Groups = Ba;
We.Roles = sm;
We.DataRetention = nm;
We.SpendAlerts = lm;
We.Certificates = tm;
var dm = class extends k {
  create(e, t, n) {
    return this._client.post(T`/organization/users/${e}/roles`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { user_id: r } = t;
    return this._client.get(T`/organization/users/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/organization/users/${e}/roles`, bt, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { user_id: r } = t;
    return this._client.delete(T`/organization/users/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Ha = class extends k {
  constructor() {
    super(...arguments), this.roles = new dm(this._client);
  }
  retrieve(e, t) {
    return this._client.get(T`/organization/users/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/organization/users/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/users", we, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/organization/users/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
Ha.Roles = dm;
var ze = class extends k {
  constructor() {
    super(...arguments), this.auditLogs = new Jp(this._client), this.adminAPIKeys = new Vp(this._client), this.usage = new Qp(this._client), this.invites = new zp(this._client), this.users = new Ha(this._client), this.groups = new Ri(this._client), this.roles = new Yp(this._client), this.dataRetention = new Wp(this._client), this.spendAlerts = new Xp(this._client), this.certificates = new Kp(this._client), this.projects = new We(this._client);
  }
};
ze.AuditLogs = Jp;
ze.AdminAPIKeys = Vp;
ze.Usage = Qp;
ze.Invites = zp;
ze.Users = Ha;
ze.Groups = Ri;
ze.Roles = Yp;
ze.DataRetention = Wp;
ze.SpendAlerts = Xp;
ze.Certificates = Kp;
ze.Projects = We;
var Va = class extends k {
  constructor() {
    super(...arguments), this.organization = new ze(this._client);
  }
};
Va.Organization = ze;
var fm = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* tb(e) {
  if (!e) return;
  if (fm in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const i of o) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Zc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const i = Zc(r[1]) ? r[1] : [r[1]];
    let s = !1;
    for (const u of i)
      u !== void 0 && (t && !s && (s = !0, yield [o, null]), yield [o, u]);
  }
}
var O = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [i, s] of tb(r)) {
      const u = i.toLowerCase();
      o.has(u) || (t.delete(i), o.add(u)), s === null ? (t.delete(i), n.add(u)) : (t.append(i, s), n.delete(u));
    }
  }
  return {
    [fm]: !0,
    values: t,
    nulls: n
  };
}, hm = class extends k {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: O([{ Accept: "application/octet-stream" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, pm = class extends k {
  create(e, t) {
    return this._client.post("/audio/transcriptions", ht({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, mm = class extends k {
  create(e, t) {
    return this._client.post("/audio/translations", ht({
      body: e,
      ...t,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, no = class extends k {
  constructor() {
    super(...arguments), this.transcriptions = new pm(this._client), this.translations = new mm(this._client), this.speech = new hm(this._client);
  }
};
no.Transcriptions = pm;
no.Translations = mm;
no.Speech = hm;
var gm = class extends k {
  create(e, t) {
    return this._client.post("/batches", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/batches/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/batches", te, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(T`/batches/${e}/cancel`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, ym = class extends k {
  create(e, t) {
    return this._client.post("/assistants", {
      body: e,
      ...t,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/assistants/${e}`, {
      ...t,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/assistants/${e}`, {
      body: t,
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/assistants", te, {
      query: e,
      ...t,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/assistants/${e}`, {
      ...t,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, _m = class extends k {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, vm = class extends k {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, xi = class extends k {
  constructor() {
    super(...arguments), this.sessions = new _m(this._client), this.transcriptionSessions = new vm(this._client);
  }
};
xi.Sessions = _m;
xi.TranscriptionSessions = vm;
var Am = class extends k {
  create(e, t) {
    return this._client.post("/chatkit/sessions", {
      body: e,
      ...t,
      headers: O([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(T`/chatkit/sessions/${e}/cancel`, {
      ...t,
      headers: O([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Tm = class extends k {
  retrieve(e, t) {
    return this._client.get(T`/chatkit/threads/${e}`, {
      ...t,
      headers: O([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chatkit/threads", we, {
      query: e,
      ...t,
      headers: O([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/chatkit/threads/${e}`, {
      ...t,
      headers: O([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  listItems(e, t = {}, n) {
    return this._client.getAPIList(T`/chatkit/threads/${e}/items`, we, {
      query: t,
      ...n,
      headers: O([{ "OpenAI-Beta": "chatkit_beta=v1" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Mi = class extends k {
  constructor() {
    super(...arguments), this.sessions = new Am(this._client), this.threads = new Tm(this._client);
  }
};
Mi.Sessions = Am;
Mi.Threads = Tm;
var Sm = class extends k {
  create(e, t, n) {
    return this._client.post(T`/threads/${e}/messages`, {
      body: t,
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { thread_id: r } = t;
    return this._client.get(T`/threads/${r}/messages/${e}`, {
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { thread_id: r, ...o } = t;
    return this._client.post(T`/threads/${r}/messages/${e}`, {
      body: o,
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/threads/${e}/messages`, te, {
      query: t,
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { thread_id: r } = t;
    return this._client.delete(T`/threads/${r}/messages/${e}`, {
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Em = class extends k {
  retrieve(e, t, n) {
    const { thread_id: r, run_id: o, ...i } = t;
    return this._client.get(T`/threads/${r}/runs/${o}/steps/${e}`, {
      query: i,
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t, n) {
    const { thread_id: r, ...o } = t;
    return this._client.getAPIList(T`/threads/${r}/runs/${e}/steps`, te, {
      query: o,
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, nb = (e) => {
  if (typeof Buffer < "u") {
    const t = Buffer.from(e, "base64");
    return Array.from(new Float32Array(t.buffer, t.byteOffset, t.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const t = atob(e), n = t.length, r = new Uint8Array(n);
    for (let o = 0; o < n; o++) r[o] = t.charCodeAt(o);
    return Array.from(new Float32Array(r.buffer));
  }
}, Dt = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, Ce, nn, ea, ft, Ko, nt, rn, xn, Qt, di, He, Wo, zo, kr, br, Pr, gd, yd, _d, vd, Ad, Td, Sd, Dr = class extends Fa {
  constructor() {
    super(...arguments), Ce.add(this), ea.set(this, []), ft.set(this, {}), Ko.set(this, {}), nt.set(this, void 0), rn.set(this, void 0), xn.set(this, void 0), Qt.set(this, void 0), di.set(this, void 0), He.set(this, void 0), Wo.set(this, void 0), zo.set(this, void 0), kr.set(this, void 0);
  }
  [(ea = /* @__PURE__ */ new WeakMap(), ft = /* @__PURE__ */ new WeakMap(), Ko = /* @__PURE__ */ new WeakMap(), nt = /* @__PURE__ */ new WeakMap(), rn = /* @__PURE__ */ new WeakMap(), xn = /* @__PURE__ */ new WeakMap(), Qt = /* @__PURE__ */ new WeakMap(), di = /* @__PURE__ */ new WeakMap(), He = /* @__PURE__ */ new WeakMap(), Wo = /* @__PURE__ */ new WeakMap(), zo = /* @__PURE__ */ new WeakMap(), kr = /* @__PURE__ */ new WeakMap(), Ce = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
    const e = [], t = [];
    let n = !1;
    return this.on("event", (r) => {
      const o = t.shift();
      o ? o.resolve(r) : e.push(r);
    }), this.on("end", () => {
      n = !0;
      for (const r of t) r.resolve(void 0);
      t.length = 0;
    }), this.on("abort", (r) => {
      n = !0;
      for (const o of t) o.reject(r);
      t.length = 0;
    }), this.on("error", (r) => {
      n = !0;
      for (const o of t) o.reject(r);
      t.length = 0;
    }), {
      next: async () => e.length ? {
        value: e.shift(),
        done: !1
      } : n ? {
        value: void 0,
        done: !0
      } : new Promise((r, o) => t.push({
        resolve: r,
        reject: o
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
    const t = new nn();
    return t._run(() => t._fromReadableStream(e)), t;
  }
  async _fromReadableStream(e, t) {
    const n = t?.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const r = qr.fromReadableStream(e, this.controller);
    for await (const o of r) w(this, Ce, "m", br).call(this, o);
    if (r.controller.signal?.aborted) throw new Ze();
    return this._addRun(w(this, Ce, "m", Pr).call(this));
  }
  toReadableStream() {
    return new qr(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, t, n, r) {
    const o = new nn();
    return o._run(() => o._runToolAssistantStream(e, t, n, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  async _createToolAssistantStream(e, t, n, r) {
    const o = r?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort()));
    const i = {
      ...n,
      stream: !0
    }, s = await e.submitToolOutputs(t, i, {
      ...r,
      signal: this.controller.signal
    });
    this._connected();
    for await (const u of s) w(this, Ce, "m", br).call(this, u);
    if (s.controller.signal?.aborted) throw new Ze();
    return this._addRun(w(this, Ce, "m", Pr).call(this));
  }
  static createThreadAssistantStream(e, t, n) {
    const r = new nn();
    return r._run(() => r._threadAssistantStream(e, t, {
      ...n,
      headers: {
        ...n?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), r;
  }
  static createAssistantStream(e, t, n, r) {
    const o = new nn();
    return o._run(() => o._runAssistantStream(e, t, n, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  currentEvent() {
    return w(this, Wo, "f");
  }
  currentRun() {
    return w(this, zo, "f");
  }
  currentMessageSnapshot() {
    return w(this, nt, "f");
  }
  currentRunStepSnapshot() {
    return w(this, kr, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(w(this, ft, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(w(this, Ko, "f"));
  }
  async finalRun() {
    if (await this.done(), !w(this, rn, "f")) throw Error("Final run was not received.");
    return w(this, rn, "f");
  }
  async _createThreadAssistantStream(e, t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort()));
    const o = {
      ...t,
      stream: !0
    }, i = await e.createAndRun(o, {
      ...n,
      signal: this.controller.signal
    });
    this._connected();
    for await (const s of i) w(this, Ce, "m", br).call(this, s);
    if (i.controller.signal?.aborted) throw new Ze();
    return this._addRun(w(this, Ce, "m", Pr).call(this));
  }
  async _createAssistantStream(e, t, n, r) {
    const o = r?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort()));
    const i = {
      ...n,
      stream: !0
    }, s = await e.create(t, i, {
      ...r,
      signal: this.controller.signal
    });
    this._connected();
    for await (const u of s) w(this, Ce, "m", br).call(this, u);
    if (s.controller.signal?.aborted) throw new Ze();
    return this._addRun(w(this, Ce, "m", Pr).call(this));
  }
  static accumulateDelta(e, t) {
    for (const [n, r] of Object.entries(t)) {
      if (!e.hasOwnProperty(n)) {
        e[n] = r;
        continue;
      }
      let o = e[n];
      if (o == null) {
        e[n] = r;
        continue;
      }
      if (n === "index" || n === "type") {
        e[n] = r;
        continue;
      }
      if (typeof o == "string" && typeof r == "string") o += r;
      else if (typeof o == "number" && typeof r == "number") o += r;
      else if (ts(o) && ts(r)) o = this.accumulateDelta(o, r);
      else if (Array.isArray(o) && Array.isArray(r)) {
        if (o.every((i) => typeof i == "string" || typeof i == "number")) {
          o.push(...r);
          continue;
        }
        for (const i of r) {
          if (!ts(i)) throw new Error(`Expected array delta entry to be an object but got: ${i}`);
          const s = i.index;
          if (s == null)
            throw console.error(i), new Error("Expected array delta entry to have an `index` property");
          if (typeof s != "number") throw new Error(`Expected array delta entry \`index\` property to be a number but got ${s}`);
          const u = o[s];
          u == null ? o.push(i) : o[s] = this.accumulateDelta(u, i);
        }
        continue;
      } else throw Error(`Unhandled record type: ${n}, deltaValue: ${r}, accValue: ${o}`);
      e[n] = o;
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
nn = Dr, br = function(t) {
  if (!this.ended)
    switch (V(this, Wo, t, "f"), w(this, Ce, "m", _d).call(this, t), t.event) {
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
        w(this, Ce, "m", Sd).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        w(this, Ce, "m", yd).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        w(this, Ce, "m", gd).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, Pr = function() {
  if (this.ended) throw new G("stream has ended, this shouldn't happen");
  if (!w(this, rn, "f")) throw Error("Final run has not been received");
  return w(this, rn, "f");
}, gd = function(t) {
  const [n, r] = w(this, Ce, "m", Ad).call(this, t, w(this, nt, "f"));
  V(this, nt, n, "f"), w(this, Ko, "f")[n.id] = n;
  for (const o of r) {
    const i = n.content[o.index];
    i?.type == "text" && this._emit("textCreated", i.text);
  }
  switch (t.event) {
    case "thread.message.created":
      this._emit("messageCreated", t.data);
      break;
    case "thread.message.in_progress":
      break;
    case "thread.message.delta":
      if (this._emit("messageDelta", t.data.delta, n), t.data.delta.content) for (const o of t.data.delta.content) {
        if (o.type == "text" && o.text) {
          let i = o.text, s = n.content[o.index];
          if (s && s.type == "text") this._emit("textDelta", i, s.text);
          else throw Error("The snapshot associated with this text delta is not text or missing");
        }
        if (o.index != w(this, xn, "f")) {
          if (w(this, Qt, "f")) switch (w(this, Qt, "f").type) {
            case "text":
              this._emit("textDone", w(this, Qt, "f").text, w(this, nt, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", w(this, Qt, "f").image_file, w(this, nt, "f"));
              break;
          }
          V(this, xn, o.index, "f");
        }
        V(this, Qt, n.content[o.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (w(this, xn, "f") !== void 0) {
        const o = t.data.content[w(this, xn, "f")];
        if (o) switch (o.type) {
          case "image_file":
            this._emit("imageFileDone", o.image_file, w(this, nt, "f"));
            break;
          case "text":
            this._emit("textDone", o.text, w(this, nt, "f"));
            break;
        }
      }
      w(this, nt, "f") && this._emit("messageDone", t.data), V(this, nt, void 0, "f");
  }
}, yd = function(t) {
  const n = w(this, Ce, "m", vd).call(this, t);
  switch (V(this, kr, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const r = t.data.delta;
      if (r.step_details && r.step_details.type == "tool_calls" && r.step_details.tool_calls && n.step_details.type == "tool_calls") for (const o of r.step_details.tool_calls) o.index == w(this, di, "f") ? this._emit("toolCallDelta", o, n.step_details.tool_calls[o.index]) : (w(this, He, "f") && this._emit("toolCallDone", w(this, He, "f")), V(this, di, o.index, "f"), V(this, He, n.step_details.tool_calls[o.index], "f"), w(this, He, "f") && this._emit("toolCallCreated", w(this, He, "f")));
      this._emit("runStepDelta", t.data.delta, n);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      V(this, kr, void 0, "f"), t.data.step_details.type == "tool_calls" && w(this, He, "f") && (this._emit("toolCallDone", w(this, He, "f")), V(this, He, void 0, "f")), this._emit("runStepDone", t.data, n);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, _d = function(t) {
  w(this, ea, "f").push(t), this._emit("event", t);
}, vd = function(t) {
  switch (t.event) {
    case "thread.run.step.created":
      return w(this, ft, "f")[t.data.id] = t.data, t.data;
    case "thread.run.step.delta":
      let n = w(this, ft, "f")[t.data.id];
      if (!n) throw Error("Received a RunStepDelta before creation of a snapshot");
      let r = t.data;
      if (r.delta) {
        const o = nn.accumulateDelta(n, r.delta);
        w(this, ft, "f")[t.data.id] = o;
      }
      return w(this, ft, "f")[t.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      w(this, ft, "f")[t.data.id] = t.data;
      break;
  }
  if (w(this, ft, "f")[t.data.id]) return w(this, ft, "f")[t.data.id];
  throw new Error("No snapshot available");
}, Ad = function(t, n) {
  let r = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, r];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let o = t.data;
      if (o.delta.content) for (const i of o.delta.content) if (i.index in n.content) {
        let s = n.content[i.index];
        n.content[i.index] = w(this, Ce, "m", Td).call(this, i, s);
      } else
        n.content[i.index] = i, r.push(i);
      return [n, r];
    case "thread.message.in_progress":
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (n) return [n, r];
      throw Error("Received thread message event with no existing snapshot");
  }
  throw Error("Tried to accumulate a non-message event");
}, Td = function(t, n) {
  return nn.accumulateDelta(n, t);
}, Sd = function(t) {
  switch (V(this, zo, t.data, "f"), t.event) {
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
      V(this, rn, t.data, "f"), w(this, He, "f") && (this._emit("toolCallDone", w(this, He, "f")), V(this, He, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var Ja = class extends k {
  constructor() {
    super(...arguments), this.steps = new Em(this._client);
  }
  create(e, t, n) {
    const { include: r, ...o } = t;
    return this._client.post(T`/threads/${e}/runs`, {
      query: { include: r },
      body: o,
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { thread_id: r } = t;
    return this._client.get(T`/threads/${r}/runs/${e}`, {
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { thread_id: r, ...o } = t;
    return this._client.post(T`/threads/${r}/runs/${e}`, {
      body: o,
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/threads/${e}/runs`, te, {
      query: t,
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { thread_id: r } = t;
    return this._client.post(T`/threads/${r}/runs/${e}/cancel`, {
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const r = await this.create(e, t, n);
    return await this.poll(r.id, { thread_id: e }, n);
  }
  createAndStream(e, t, n) {
    return Dr.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  async poll(e, t, n) {
    const r = O([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const { data: o, response: i } = await this.retrieve(e, t, {
        ...n,
        headers: {
          ...n?.headers,
          ...r
        }
      }).withResponse();
      switch (o.status) {
        case "queued":
        case "in_progress":
        case "cancelling":
          let s = 5e3;
          if (n?.pollIntervalMs) s = n.pollIntervalMs;
          else {
            const u = i.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (s = c);
            }
          }
          await eo(s);
          break;
        case "requires_action":
        case "incomplete":
        case "cancelled":
        case "completed":
        case "failed":
        case "expired":
          return o;
      }
    }
  }
  stream(e, t, n) {
    return Dr.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  submitToolOutputs(e, t, n) {
    const { thread_id: r, ...o } = t;
    return this._client.post(T`/threads/${r}/runs/${e}/submit_tool_outputs`, {
      body: o,
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0,
      __security: { bearerAuth: !0 }
    });
  }
  async submitToolOutputsAndPoll(e, t, n) {
    const r = await this.submitToolOutputs(e, t, n);
    return await this.poll(r.id, t, n);
  }
  submitToolOutputsStream(e, t, n) {
    return Dr.createToolAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
};
Ja.Steps = Em;
var Ni = class extends k {
  constructor() {
    super(...arguments), this.runs = new Ja(this._client), this.messages = new Sm(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/threads", {
      body: e,
      ...t,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/threads/${e}`, {
      ...t,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/threads/${e}`, {
      body: t,
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/threads/${e}`, {
      ...t,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  createAndRun(e, t) {
    return this._client.post("/threads/runs", {
      body: e,
      ...t,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
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
    return Dr.createThreadAssistantStream(e, this._client.beta.threads, t);
  }
};
Ni.Runs = Ja;
Ni.Messages = Sm;
var Jn = class extends k {
  constructor() {
    super(...arguments), this.realtime = new xi(this._client), this.chatkit = new Mi(this._client), this.assistants = new ym(this._client), this.threads = new Ni(this._client);
  }
};
Jn.Realtime = xi;
Jn.ChatKit = Mi;
Jn.Assistants = ym;
Jn.Threads = Ni;
var Cm = class extends k {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    });
  }
}, wm = class extends k {
  retrieve(e, t, n) {
    const { container_id: r } = t;
    return this._client.get(T`/containers/${r}/files/${e}/content`, {
      ...n,
      headers: O([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Ka = class extends k {
  constructor() {
    super(...arguments), this.content = new wm(this._client);
  }
  create(e, t, n) {
    return this._client.post(T`/containers/${e}/files`, Pi({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t, n) {
    const { container_id: r } = t;
    return this._client.get(T`/containers/${r}/files/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/containers/${e}/files`, te, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { container_id: r } = t;
    return this._client.delete(T`/containers/${r}/files/${e}`, {
      ...n,
      headers: O([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
Ka.Content = wm;
var Wa = class extends k {
  constructor() {
    super(...arguments), this.files = new Ka(this._client);
  }
  create(e, t) {
    return this._client.post("/containers", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/containers/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/containers", te, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/containers/${e}`, {
      ...t,
      headers: O([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
Wa.Files = Ka;
var Im = class extends k {
  create(e, t, n) {
    const { include: r, ...o } = t;
    return this._client.post(T`/conversations/${e}/items`, {
      query: { include: r },
      body: o,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { conversation_id: r, ...o } = t;
    return this._client.get(T`/conversations/${r}/items/${e}`, {
      query: o,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/conversations/${e}/items`, we, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { conversation_id: r } = t;
    return this._client.delete(T`/conversations/${r}/items/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, za = class extends k {
  constructor() {
    super(...arguments), this.items = new Im(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/conversations", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/conversations/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/conversations/${e}`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/conversations/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
};
za.Items = Im;
var bm = class extends k {
  create(e, t) {
    const n = !!e.encoding_format;
    let r = n ? e.encoding_format : "base64";
    n && Ee(this._client).debug("embeddings/user defined encoding_format:", e.encoding_format);
    const o = this._client.post("/embeddings", {
      body: {
        ...e,
        encoding_format: r
      },
      ...t,
      __security: { bearerAuth: !0 }
    });
    return n ? o : (Ee(this._client).debug("embeddings/decoding base64 embeddings from base64"), o._thenUnwrap((i) => (i && i.data && i.data.forEach((s) => {
      const u = s.embedding;
      s.embedding = nb(u);
    }), i)));
  }
}, Pm = class extends k {
  retrieve(e, t, n) {
    const { eval_id: r, run_id: o } = t;
    return this._client.get(T`/evals/${r}/runs/${o}/output_items/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t, n) {
    const { eval_id: r, ...o } = t;
    return this._client.getAPIList(T`/evals/${r}/runs/${e}/output_items`, te, {
      query: o,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Ya = class extends k {
  constructor() {
    super(...arguments), this.outputItems = new Pm(this._client);
  }
  create(e, t, n) {
    return this._client.post(T`/evals/${e}/runs`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { eval_id: r } = t;
    return this._client.get(T`/evals/${r}/runs/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/evals/${e}/runs`, te, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { eval_id: r } = t;
    return this._client.delete(T`/evals/${r}/runs/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { eval_id: r } = t;
    return this._client.post(T`/evals/${r}/runs/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
Ya.OutputItems = Pm;
var Xa = class extends k {
  constructor() {
    super(...arguments), this.runs = new Ya(this._client);
  }
  create(e, t) {
    return this._client.post("/evals", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/evals/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/evals/${e}`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/evals", te, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/evals/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
};
Xa.Runs = Ya;
var Rm = class extends k {
  create(e, t) {
    return this._client.post("/files", ht({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(T`/files/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/files", te, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/files/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  content(e, t) {
    return this._client.get(T`/files/${e}/content`, {
      ...t,
      headers: O([{ Accept: "application/binary" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
  async waitForProcessing(e, { pollInterval: t = 5e3, maxWait: n = 1800 * 1e3 } = {}) {
    const r = /* @__PURE__ */ new Set([
      "processed",
      "error",
      "deleted"
    ]), o = Date.now();
    let i = await this.retrieve(e);
    for (; !i.status || !r.has(i.status); )
      if (await eo(t), i = await this.retrieve(e), Date.now() - o > n) throw new Na({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return i;
  }
}, xm = class extends k {
}, Mm = class extends k {
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
}, Qa = class extends k {
  constructor() {
    super(...arguments), this.graders = new Mm(this._client);
  }
};
Qa.Graders = Mm;
var Nm = class extends k {
  create(e, t, n) {
    return this._client.getAPIList(T`/fine_tuning/checkpoints/${e}/permissions`, qt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t = {}, n) {
    return this._client.get(T`/fine_tuning/checkpoints/${e}/permissions`, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/fine_tuning/checkpoints/${e}/permissions`, we, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { fine_tuned_model_checkpoint: r } = t;
    return this._client.delete(T`/fine_tuning/checkpoints/${r}/permissions/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Za = class extends k {
  constructor() {
    super(...arguments), this.permissions = new Nm(this._client);
  }
};
Za.Permissions = Nm;
var km = class extends k {
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/fine_tuning/jobs/${e}/checkpoints`, te, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, ja = class extends k {
  constructor() {
    super(...arguments), this.checkpoints = new km(this._client);
  }
  create(e, t) {
    return this._client.post("/fine_tuning/jobs", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/fine_tuning/jobs/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/fine_tuning/jobs", te, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(T`/fine_tuning/jobs/${e}/cancel`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  listEvents(e, t = {}, n) {
    return this._client.getAPIList(T`/fine_tuning/jobs/${e}/events`, te, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  pause(e, t) {
    return this._client.post(T`/fine_tuning/jobs/${e}/pause`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  resume(e, t) {
    return this._client.post(T`/fine_tuning/jobs/${e}/resume`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
};
ja.Checkpoints = km;
var Kn = class extends k {
  constructor() {
    super(...arguments), this.methods = new xm(this._client), this.jobs = new ja(this._client), this.checkpoints = new Za(this._client), this.alpha = new Qa(this._client);
  }
};
Kn.Methods = xm;
Kn.Jobs = ja;
Kn.Checkpoints = Za;
Kn.Alpha = Qa;
var Dm = class extends k {
}, el = class extends k {
  constructor() {
    super(...arguments), this.graderModels = new Dm(this._client);
  }
};
el.GraderModels = Dm;
var $m = class extends k {
  createVariation(e, t) {
    return this._client.post("/images/variations", ht({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  edit(e, t) {
    return this._client.post("/images/edits", ht({
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
}, Lm = class extends k {
  retrieve(e, t) {
    return this._client.get(T`/models/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e) {
    return this._client.getAPIList("/models", qt, {
      ...e,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/models/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Um = class extends k {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Fm = class extends k {
  accept(e, t, n) {
    return this._client.post(T`/realtime/calls/${e}/accept`, {
      body: t,
      ...n,
      headers: O([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  hangup(e, t) {
    return this._client.post(T`/realtime/calls/${e}/hangup`, {
      ...t,
      headers: O([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  refer(e, t, n) {
    return this._client.post(T`/realtime/calls/${e}/refer`, {
      body: t,
      ...n,
      headers: O([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  reject(e, t = {}, n) {
    return this._client.post(T`/realtime/calls/${e}/reject`, {
      body: t,
      ...n,
      headers: O([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Om = class extends k {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, ki = class extends k {
  constructor() {
    super(...arguments), this.clientSecrets = new Om(this._client), this.calls = new Fm(this._client);
  }
};
ki.ClientSecrets = Om;
ki.Calls = Fm;
function rb(e, t) {
  return !t || !ib(t) ? {
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
  } : qm(e, t);
}
function qm(e, t) {
  const n = e.output.map((o) => {
    if (o.type === "function_call") return {
      ...o,
      parsed_arguments: lb(t, o)
    };
    if (o.type === "message") {
      const i = o.content.map((s) => s.type === "output_text" ? {
        ...s,
        parsed: ob(t, s.text)
      } : s);
      return {
        ...o,
        content: i
      };
    }
    return o;
  }), r = Object.assign({}, e, { output: n });
  return Object.getOwnPropertyDescriptor(e, "output_text") || ta(r), Object.defineProperty(r, "output_parsed", {
    enumerable: !0,
    get() {
      for (const o of r.output)
        if (o.type === "message") {
          for (const i of o.content) if (i.type === "output_text" && i.parsed !== null) return i.parsed;
        }
      return null;
    }
  }), r;
}
function ob(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function ib(e) {
  return !!La(e.text?.format);
}
function sb(e) {
  return e?.$brand === "auto-parseable-tool";
}
function ab(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function lb(e, t) {
  const n = ab(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: sb(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function ta(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const r of n.content) r.type === "output_text" && t.push(r.text);
  e.output_text = t.join("");
}
var _n, No, $t, ko, Ed, Cd, wd, Id, ub = class Bm extends Fa {
  constructor(t) {
    super(), _n.add(this), No.set(this, void 0), $t.set(this, void 0), ko.set(this, void 0), V(this, No, t, "f");
  }
  static createResponse(t, n, r) {
    const o = new Bm(n);
    return o._run(() => o._createOrRetrieveResponse(t, n, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  async _createOrRetrieveResponse(t, n, r) {
    const o = r?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), w(this, _n, "m", Ed).call(this);
    let i, s = null;
    "response_id" in n ? (i = await t.responses.retrieve(n.response_id, { stream: !0 }, {
      ...r,
      signal: this.controller.signal,
      stream: !0
    }), s = n.starting_after ?? null) : i = await t.responses.create({
      ...n,
      stream: !0
    }, {
      ...r,
      signal: this.controller.signal
    }), this._connected();
    for await (const u of i) w(this, _n, "m", Cd).call(this, u, s);
    if (i.controller.signal?.aborted) throw new Ze();
    return w(this, _n, "m", wd).call(this);
  }
  [(No = /* @__PURE__ */ new WeakMap(), $t = /* @__PURE__ */ new WeakMap(), ko = /* @__PURE__ */ new WeakMap(), _n = /* @__PURE__ */ new WeakSet(), Ed = function() {
    this.ended || V(this, $t, void 0, "f");
  }, Cd = function(n, r) {
    if (this.ended) return;
    const o = (s, u) => {
      (r == null || u.sequence_number > r) && this._emit(s, u);
    }, i = w(this, _n, "m", Id).call(this, n);
    switch (o("event", n), n.type) {
      case "response.output_text.delta": {
        const s = i.output[n.output_index];
        if (!s) throw new G(`missing output at index ${n.output_index}`);
        if (s.type === "message") {
          const u = s.content[n.content_index];
          if (!u) throw new G(`missing content at index ${n.content_index}`);
          if (u.type !== "output_text") throw new G(`expected content to be 'output_text', got ${u.type}`);
          o("response.output_text.delta", {
            ...n,
            snapshot: u.text
          });
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const s = i.output[n.output_index];
        if (!s) throw new G(`missing output at index ${n.output_index}`);
        s.type === "function_call" && o("response.function_call_arguments.delta", {
          ...n,
          snapshot: s.arguments
        });
        break;
      }
      default:
        o(n.type, n);
        break;
    }
  }, wd = function() {
    if (this.ended) throw new G("stream has ended, this shouldn't happen");
    const n = w(this, $t, "f");
    if (!n) throw new G("request ended without sending any events");
    V(this, $t, void 0, "f");
    const r = cb(n, w(this, No, "f"));
    return V(this, ko, r, "f"), r;
  }, Id = function(n) {
    let r = w(this, $t, "f");
    if (!r) {
      if (n.type !== "response.created") throw new G(`When snapshot hasn't been set yet, expected 'response.created' event, got ${n.type}`);
      return r = V(this, $t, n.response, "f"), r;
    }
    switch (n.type) {
      case "response.output_item.added":
        r.output.push(n.item);
        break;
      case "response.content_part.added": {
        const o = r.output[n.output_index];
        if (!o) throw new G(`missing output at index ${n.output_index}`);
        const i = o.type, s = n.part;
        i === "message" && s.type !== "reasoning_text" ? o.content.push(s) : i === "reasoning" && s.type === "reasoning_text" && (o.content || (o.content = []), o.content.push(s));
        break;
      }
      case "response.output_text.delta": {
        const o = r.output[n.output_index];
        if (!o) throw new G(`missing output at index ${n.output_index}`);
        if (o.type === "message") {
          const i = o.content[n.content_index];
          if (!i) throw new G(`missing content at index ${n.content_index}`);
          if (i.type !== "output_text") throw new G(`expected content to be 'output_text', got ${i.type}`);
          i.text += n.delta;
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const o = r.output[n.output_index];
        if (!o) throw new G(`missing output at index ${n.output_index}`);
        o.type === "function_call" && (o.arguments += n.delta);
        break;
      }
      case "response.reasoning_text.delta": {
        const o = r.output[n.output_index];
        if (!o) throw new G(`missing output at index ${n.output_index}`);
        if (o.type === "reasoning") {
          const i = o.content?.[n.content_index];
          if (!i) throw new G(`missing content at index ${n.content_index}`);
          if (i.type !== "reasoning_text") throw new G(`expected content to be 'reasoning_text', got ${i.type}`);
          i.text += n.delta;
        }
        break;
      }
      case "response.completed":
        V(this, $t, n.response, "f");
        break;
    }
    return r;
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let r = !1;
    return this.on("event", (o) => {
      const i = n.shift();
      i ? i.resolve(o) : t.push(o);
    }), this.on("end", () => {
      r = !0;
      for (const o of n) o.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (o) => {
      r = !0;
      for (const i of n) i.reject(o);
      n.length = 0;
    }), this.on("error", (o) => {
      r = !0;
      for (const i of n) i.reject(o);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : r ? {
        value: void 0,
        done: !0
      } : new Promise((o, i) => n.push({
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
  async finalResponse() {
    await this.done();
    const t = w(this, ko, "f");
    if (!t) throw new G("stream ended without producing a ChatCompletion");
    return t;
  }
};
function cb(e, t) {
  return rb(e, t);
}
var Gm = class extends k {
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/responses/${e}/input_items`, te, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Hm = class extends k {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Di = class extends k {
  constructor() {
    super(...arguments), this.inputItems = new Gm(this._client), this.inputTokens = new Hm(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && ta(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(T`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((r) => ("object" in r && r.object === "response" && ta(r), r));
  }
  delete(e, t) {
    return this._client.delete(T`/responses/${e}`, {
      ...t,
      headers: O([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => qm(n, e));
  }
  stream(e, t) {
    return ub.createResponse(this._client, e, t);
  }
  cancel(e, t) {
    return this._client.post(T`/responses/${e}/cancel`, {
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
Di.InputItems = Gm;
Di.InputTokens = Hm;
var Vm = class extends k {
  retrieve(e, t) {
    return this._client.get(T`/skills/${e}/content`, {
      ...t,
      headers: O([{ Accept: "application/binary" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Jm = class extends k {
  retrieve(e, t, n) {
    const { skill_id: r } = t;
    return this._client.get(T`/skills/${r}/versions/${e}/content`, {
      ...n,
      headers: O([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, tl = class extends k {
  constructor() {
    super(...arguments), this.content = new Jm(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(T`/skills/${e}/versions`, Pi({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: r } = t;
    return this._client.get(T`/skills/${r}/versions/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/skills/${e}/versions`, te, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { skill_id: r } = t;
    return this._client.delete(T`/skills/${r}/versions/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
tl.Content = Jm;
var $i = class extends k {
  constructor() {
    super(...arguments), this.content = new Vm(this._client), this.versions = new tl(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", Pi({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(T`/skills/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/skills/${e}`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/skills", te, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/skills/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
};
$i.Content = Vm;
$i.Versions = tl;
var Km = class extends k {
  create(e, t, n) {
    return this._client.post(T`/uploads/${e}/parts`, ht({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, nl = class extends k {
  constructor() {
    super(...arguments), this.parts = new Km(this._client);
  }
  create(e, t) {
    return this._client.post("/uploads", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(T`/uploads/${e}/cancel`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  complete(e, t, n) {
    return this._client.post(T`/uploads/${e}/complete`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
nl.Parts = Km;
var db = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((o) => o.status === "rejected");
  if (n.length) {
    for (const o of n) console.error(o.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const r = [];
  for (const o of t) o.status === "fulfilled" && r.push(o.value);
  return r;
}, Wm = class extends k {
  create(e, t, n) {
    return this._client.post(T`/vector_stores/${e}/file_batches`, {
      body: t,
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.get(T`/vector_stores/${r}/file_batches/${e}`, {
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.post(T`/vector_stores/${r}/file_batches/${e}/cancel`, {
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const r = await this.create(e, t);
    return await this.poll(e, r.id, n);
  }
  listFiles(e, t, n) {
    const { vector_store_id: r, ...o } = t;
    return this._client.getAPIList(T`/vector_stores/${r}/file_batches/${e}/files`, te, {
      query: o,
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async poll(e, t, n) {
    const r = O([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const { data: o, response: i } = await this.retrieve(t, { vector_store_id: e }, {
        ...n,
        headers: r
      }).withResponse();
      switch (o.status) {
        case "in_progress":
          let s = 5e3;
          if (n?.pollIntervalMs) s = n.pollIntervalMs;
          else {
            const u = i.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (s = c);
            }
          }
          await eo(s);
          break;
        case "failed":
        case "cancelled":
        case "completed":
          return o;
      }
    }
  }
  async uploadAndPoll(e, { files: t, fileIds: n = [] }, r) {
    if (t == null || t.length == 0) throw new Error("No `files` provided to process. If you've already uploaded files you should use `.createAndPoll()` instead");
    const o = r?.maxConcurrency ?? 5, i = Math.min(o, t.length), s = this._client, u = t.values(), c = [...n];
    async function d(f) {
      for (let h of f) {
        const p = await s.files.create({
          file: h,
          purpose: "assistants"
        }, r);
        c.push(p.id);
      }
    }
    return await db(Array(i).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, zm = class extends k {
  create(e, t, n) {
    return this._client.post(T`/vector_stores/${e}/files`, {
      body: t,
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.get(T`/vector_stores/${r}/files/${e}`, {
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { vector_store_id: r, ...o } = t;
    return this._client.post(T`/vector_stores/${r}/files/${e}`, {
      body: o,
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/vector_stores/${e}/files`, te, {
      query: t,
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.delete(T`/vector_stores/${r}/files/${e}`, {
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const r = await this.create(e, t, n);
    return await this.poll(e, r.id, n);
  }
  async poll(e, t, n) {
    const r = O([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const o = await this.retrieve(t, { vector_store_id: e }, {
        ...n,
        headers: r
      }).withResponse(), i = o.data;
      switch (i.status) {
        case "in_progress":
          let s = 5e3;
          if (n?.pollIntervalMs) s = n.pollIntervalMs;
          else {
            const u = o.response.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (s = c);
            }
          }
          await eo(s);
          break;
        case "failed":
        case "completed":
          return i;
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
    return this._client.getAPIList(T`/vector_stores/${r}/files/${e}/content`, qt, {
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Li = class extends k {
  constructor() {
    super(...arguments), this.files = new zm(this._client), this.fileBatches = new Wm(this._client);
  }
  create(e, t) {
    return this._client.post("/vector_stores", {
      body: e,
      ...t,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/vector_stores/${e}`, {
      ...t,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/vector_stores/${e}`, {
      body: t,
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/vector_stores", te, {
      query: e,
      ...t,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/vector_stores/${e}`, {
      ...t,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  search(e, t, n) {
    return this._client.getAPIList(T`/vector_stores/${e}/search`, qt, {
      body: t,
      method: "post",
      ...n,
      headers: O([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
Li.Files = zm;
Li.FileBatches = Wm;
var Ym = class extends k {
  create(e, t) {
    return this._client.post("/videos", ht({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(T`/videos/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/videos", we, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/videos/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  createCharacter(e, t) {
    return this._client.post("/videos/characters", ht({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  downloadContent(e, t = {}, n) {
    return this._client.get(T`/videos/${e}/content`, {
      query: t,
      ...n,
      headers: O([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
  edit(e, t) {
    return this._client.post("/videos/edits", ht({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  extend(e, t) {
    return this._client.post("/videos/extensions", ht({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  getCharacter(e, t) {
    return this._client.get(T`/videos/characters/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  remix(e, t, n) {
    return this._client.post(T`/videos/${e}/remix`, Pi({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Cn, Xm, Yo, Qm = class extends k {
  constructor() {
    super(...arguments), Cn.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, r = 300) {
    return await this.verifySignature(e, t, n, r), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, r = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    w(this, Cn, "m", Xm).call(this, n);
    const o = O([t]).values, i = w(this, Cn, "m", Yo).call(this, o, "webhook-signature"), s = w(this, Cn, "m", Yo).call(this, o, "webhook-timestamp"), u = w(this, Cn, "m", Yo).call(this, o, "webhook-id"), c = parseInt(s, 10);
    if (isNaN(c)) throw new vr("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > r) throw new vr("Webhook timestamp is too old");
    if (c > d + r) throw new vr("Webhook timestamp is too new");
    const f = i.split(" ").map((g) => g.startsWith("v1,") ? g.substring(3) : g), h = n.startsWith("whsec_") ? Buffer.from(n.replace("whsec_", ""), "base64") : Buffer.from(n, "utf-8"), p = u ? `${u}.${s}.${e}` : `${s}.${e}`, m = await crypto.subtle.importKey("raw", h, {
      name: "HMAC",
      hash: "SHA-256"
    }, !1, ["verify"]);
    for (const g of f) try {
      const _ = Buffer.from(g, "base64");
      if (await crypto.subtle.verify("HMAC", m, _, new TextEncoder().encode(p))) return;
    } catch {
      continue;
    }
    throw new vr("The given webhook signature does not match the expected signature");
  }
};
Cn = /* @__PURE__ */ new WeakSet(), Xm = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, Yo = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const r = t.get(n);
  if (r == null) throw new Error(`Missing required header: ${n}`);
  return r;
};
var na, rl, Xo, Zm, fb = "workload-identity-auth", W = class {
  constructor({ baseURL: e = Dt("OPENAI_BASE_URL"), apiKey: t = Dt("OPENAI_API_KEY") ?? null, adminAPIKey: n = Dt("OPENAI_ADMIN_KEY") ?? null, organization: r = Dt("OPENAI_ORG_ID") ?? null, project: o = Dt("OPENAI_PROJECT_ID") ?? null, webhookSecret: i = Dt("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: s, ...u } = {}) {
    na.add(this), Xo.set(this, void 0), this.completions = new Cm(this), this.chat = new qa(this), this.embeddings = new bm(this), this.files = new Rm(this), this.images = new $m(this), this.audio = new no(this), this.moderations = new Um(this), this.models = new Lm(this), this.fineTuning = new Kn(this), this.graders = new el(this), this.vectorStores = new Li(this), this.webhooks = new Qm(this), this.beta = new Jn(this), this.batches = new gm(this), this.uploads = new nl(this), this.admin = new Va(this), this.responses = new Di(this), this.realtime = new ki(this), this.conversations = new za(this), this.evals = new Xa(this), this.containers = new Wa(this), this.skills = new $i(this), this.videos = new Ym(this);
    const c = {
      apiKey: t,
      adminAPIKey: n,
      organization: r,
      project: o,
      webhookSecret: i,
      workloadIdentity: s,
      ...u,
      baseURL: e || "https://api.openai.com/v1"
    };
    if (t && s) throw new G("The `apiKey` and `workloadIdentity` options are mutually exclusive");
    if (!t && !n && !s) throw new G("Missing credentials. Please pass an `apiKey`, `workloadIdentity`, `adminAPIKey`, or set the `OPENAI_API_KEY` or `OPENAI_ADMIN_KEY` environment variable.");
    if (!c.dangerouslyAllowBrowser && cI()) throw new G(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = c.baseURL, this.timeout = c.timeout ?? rl.DEFAULT_TIMEOUT, this.logger = c.logger ?? console;
    const d = "warn";
    this.logLevel = d, this.logLevel = cd(c.logLevel, "ClientOptions.logLevel", this) ?? cd(Dt("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? d, this.fetchOptions = c.fetchOptions, this.maxRetries = c.maxRetries ?? 2, this.fetch = c.fetch ?? gp(), V(this, Xo, mI, "f");
    const f = Dt("OPENAI_CUSTOM_HEADERS");
    if (f) {
      const h = {};
      for (const p of f.split(`
`)) {
        const m = p.indexOf(":");
        m >= 0 && (h[p.substring(0, m).trim()] = p.substring(m + 1).trim());
      }
      c.defaultHeaders = O([h, c.defaultHeaders]);
    }
    this._options = c, s && (this._workloadIdentityAuth = new kI(s, this.fetch)), this.apiKey = typeof t == "string" ? t : null, this.adminAPIKey = n, this.organization = r, this.project = o, this.webhookSecret = i;
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
    return O([t.bearerAuth ? await this.bearerAuth(e) : null, t.adminAPIKeyAuth ? await this.adminAPIKeyAuth(e) : null]);
  }
  async bearerAuth(e) {
    if (this._workloadIdentityAuth) return O([{ Authorization: `Bearer ${await this._workloadIdentityAuth.getToken()}` }]);
    if (this.apiKey != null)
      return O([{ Authorization: `Bearer ${this.apiKey}` }]);
  }
  async adminAPIKeyAuth(e) {
    if (this.adminAPIKey != null)
      return O([{ Authorization: `Bearer ${this.adminAPIKey}` }]);
  }
  stringifyQuery(e) {
    return TI(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Sn}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${op()}`;
  }
  makeStatusError(e, t, n, r) {
    return be.generate(e, t, n, r);
  }
  async _callApiKey() {
    const e = this._options.apiKey;
    if (typeof e != "function") return !1;
    let t;
    try {
      t = await e();
    } catch (n) {
      throw n instanceof G ? n : new G(`Failed to get token from 'apiKey' function: ${n.message}`, { cause: n });
    }
    if (typeof t != "string" || !t) throw new G(`Expected 'apiKey' function argument to return a string but it returned ${t}`);
    return this.apiKey = t, !0;
  }
  buildURL(e, t, n) {
    const r = !w(this, na, "m", Zm).call(this) && n || this.baseURL, o = sI(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), s = Object.fromEntries(o.searchParams);
    return (!jc(i) || !jc(s)) && (t = {
      ...s,
      ...i,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (o.search = this.stringifyQuery(t)), o.toString();
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
    return this.request(Promise.resolve(n).then((r) => ({
      method: e,
      path: t,
      ...r
    })));
  }
  request(e, t = null) {
    return new bp(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const r = await e, o = r.maxRetries ?? this.maxRetries;
    t == null && (t = o), await this.prepareOptions(r);
    const { req: i, url: s, timeout: u } = await this.buildRequest(r, { retryCount: o - t });
    await this.prepareRequest(i, {
      url: s,
      options: r
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, f = Date.now();
    if (Ee(this).debug(`[${c}] sending request`, Yt({
      retryOfRequestLogID: n,
      method: r.method,
      url: s,
      options: r,
      headers: i.headers
    })), r.signal?.aborted) throw new Ze();
    const h = r.__security ?? { bearerAuth: !0 }, p = new AbortController(), m = await this.fetchWithAuth(s, i, u, p, h).catch(Bs), g = Date.now();
    if (m instanceof globalThis.Error) {
      const v = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new Ze();
      const C = qs(m) || /timed? ?out/i.test(String(m) + ("cause" in m ? String(m.cause) : ""));
      if (t)
        return Ee(this).info(`[${c}] connection ${C ? "timed out" : "failed"} - ${v}`), Ee(this).debug(`[${c}] connection ${C ? "timed out" : "failed"} (${v})`, Yt({
          retryOfRequestLogID: n,
          url: s,
          durationMs: g - f,
          message: m.message
        })), this.retryRequest(r, t, n ?? c);
      throw Ee(this).info(`[${c}] connection ${C ? "timed out" : "failed"} - error; no more retries left`), Ee(this).debug(`[${c}] connection ${C ? "timed out" : "failed"} (error; no more retries left)`, Yt({
        retryOfRequestLogID: n,
        url: s,
        durationMs: g - f,
        message: m.message
      })), m instanceof mp || m instanceof oI ? m : C ? new Na() : new wi({
        message: hb(m),
        cause: m
      });
    }
    const _ = `[${c}${d}${[...m.headers.entries()].filter(([v]) => v === "x-request-id").map(([v, C]) => ", " + v + ": " + JSON.stringify(C)).join("")}] ${i.method} ${s} ${m.ok ? "succeeded" : "failed"} with status ${m.status} in ${g - f}ms`;
    if (!m.ok) {
      if (m.status === 401 && this._workloadIdentityAuth && h.bearerAuth && !r.__metadata?.hasStreamingBody && !r.__metadata?.workloadIdentityTokenRefreshed)
        return await rd(m.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
          ...r,
          __metadata: {
            ...r.__metadata,
            workloadIdentityTokenRefreshed: !0
          }
        }, t, n ?? c);
      const v = await this.shouldRetry(m);
      if (t && v) {
        const D = `retrying, ${t} attempts remaining`;
        return await rd(m.body), Ee(this).info(`${_} - ${D}`), Ee(this).debug(`[${c}] response error (${D})`, Yt({
          retryOfRequestLogID: n,
          url: m.url,
          status: m.status,
          headers: m.headers,
          durationMs: g - f
        })), this.retryRequest(r, t, n ?? c, m.headers);
      }
      const C = v ? "error; no more retries left" : "error; not retryable";
      Ee(this).info(`${_} - ${C}`);
      const b = await m.text().catch((D) => Bs(D).message), P = uI(b), R = P ? void 0 : b;
      throw Ee(this).debug(`[${c}] response error (${C})`, Yt({
        retryOfRequestLogID: n,
        url: m.url,
        status: m.status,
        headers: m.headers,
        message: R,
        durationMs: Date.now() - f
      })), this.makeStatusError(m.status, P, R, m.headers);
    }
    return Ee(this).info(_), Ee(this).debug(`[${c}] response start`, Yt({
      retryOfRequestLogID: n,
      url: m.url,
      status: m.status,
      headers: m.headers,
      durationMs: g - f
    })), {
      response: m,
      options: r,
      controller: p,
      requestLogID: c,
      retryOfRequestLogID: n,
      startTime: f
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
    return new xI(this, n, e);
  }
  async fetchWithAuth(e, t, n, r, o = {
    bearerAuth: !0,
    adminAPIKeyAuth: !0
  }) {
    if (this._workloadIdentityAuth && o.bearerAuth) {
      const i = t.headers, s = i.get("Authorization");
      if (!s || s === `Bearer ${fb}`) {
        const u = await this._workloadIdentityAuth.getToken();
        i.set("Authorization", `Bearer ${u}`);
      }
    }
    return await this.fetchWithTimeout(e, t, n, r);
  }
  async fetchWithTimeout(e, t, n, r) {
    const { signal: o, method: i, ...s } = t || {}, u = this._makeAbort(r);
    o && o.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && s.body instanceof globalThis.ReadableStream || typeof s.body == "object" && s.body !== null && Symbol.asyncIterator in s.body, f = {
      signal: r.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...s
    };
    i && (f.method = i.toUpperCase());
    try {
      return await this.fetch.call(void 0, e, f);
    } finally {
      clearTimeout(c);
    }
  }
  async shouldRetry(e) {
    const t = e.headers.get("x-should-retry");
    return t === "true" ? !0 : t === "false" ? !1 : e.status === 408 || e.status === 409 || e.status === 429 || e.status >= 500;
  }
  async retryRequest(e, t, n, r) {
    let o;
    const i = r?.get("retry-after-ms");
    if (i) {
      const u = parseFloat(i);
      Number.isNaN(u) || (o = u);
    }
    const s = r?.get("retry-after");
    if (s && !o) {
      const u = parseFloat(s);
      Number.isNaN(u) ? o = Date.parse(s) - Date.now() : o = u * 1e3;
    }
    if (o === void 0) {
      const u = e.maxRetries ?? this.maxRetries;
      o = this.calculateDefaultRetryTimeoutMillis(t, u);
    }
    return await eo(o), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const o = t - e;
    return Math.min(0.5 * Math.pow(2, o), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: r, path: o, query: i, defaultBaseURL: s } = n, u = this.buildURL(o, i, s);
    "timeout" in n && lI("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
    const { bodyHeaders: c, body: d, isStreamingBody: f } = this.buildBody({ options: n });
    return f && (e.__metadata = {
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
    let o = {};
    this.idempotencyHeader && t !== "get" && (e.idempotencyKey || (e.idempotencyKey = this.defaultIdempotencyKey()), o[this.idempotencyHeader] = e.idempotencyKey);
    const i = O([
      o,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(r),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...pI(),
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
    const n = O([t]), r = typeof globalThis.ReadableStream < "u" && e instanceof globalThis.ReadableStream, o = !r && (typeof e == "string" || e instanceof ArrayBuffer || ArrayBuffer.isView(e) || typeof globalThis.Blob < "u" && e instanceof globalThis.Blob || e instanceof URLSearchParams || e instanceof FormData);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || r ? {
      bodyHeaders: void 0,
      body: e,
      isStreamingBody: !o
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: _p(e),
      isStreamingBody: !0
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e),
      isStreamingBody: !1
    } : {
      ...w(this, Xo, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
rl = W, Xo = /* @__PURE__ */ new WeakMap(), na = /* @__PURE__ */ new WeakSet(), Zm = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
W.OpenAI = rl;
W.DEFAULT_TIMEOUT = 6e5;
W.OpenAIError = G;
W.APIError = be;
W.APIConnectionError = wi;
W.APIConnectionTimeoutError = Na;
W.APIUserAbortError = Ze;
W.NotFoundError = lp;
W.ConflictError = up;
W.RateLimitError = dp;
W.BadRequestError = ip;
W.AuthenticationError = sp;
W.InternalServerError = fp;
W.PermissionDeniedError = ap;
W.UnprocessableEntityError = cp;
W.InvalidWebhookSignatureError = vr;
W.toFile = FI;
W.Completions = Cm;
W.Chat = qa;
W.Embeddings = bm;
W.Files = Rm;
W.Images = $m;
W.Audio = no;
W.Moderations = Um;
W.Models = Lm;
W.FineTuning = Kn;
W.Graders = el;
W.VectorStores = Li;
W.Webhooks = Qm;
W.Beta = Jn;
W.Batches = gm;
W.Uploads = nl;
W.Admin = Va;
W.Responses = Di;
W.Realtime = ki;
W.Conversations = za;
W.Evals = Xa;
W.Containers = Wa;
W.Skills = $i;
W.Videos = Ym;
function hb(e) {
  if (pb(e)) return "Connection error. This may be caused by passing an undici dispatcher, such as ProxyAgent, that is incompatible with the fetch implementation. If you are using undici's ProxyAgent, pass the fetch implementation from the same undici package: import { fetch, ProxyAgent } from 'undici'; new OpenAI({ fetch, fetchOptions: { dispatcher: new ProxyAgent(...) } });";
}
function pb(e) {
  let t = e;
  for (let n = 0; n < 8 && t && typeof t == "object"; n++) {
    const r = t;
    if (r.code === "UND_ERR_INVALID_ARG" && typeof r.message == "string" && r.message.includes("invalid onRequestStart method")) return !0;
    t = r.cause;
  }
  return !1;
}
function bd(e = "", t = 0) {
  let n = 0;
  for (let r = t - 1; r >= 0 && e[r] === "\\"; r -= 1) n += 1;
  return n % 2 === 1;
}
function mb(e = "") {
  return /^[0-9a-fA-F]{4}$/.test(e);
}
function gb(e = "") {
  return /^[dD][89a-bA-B][0-9a-fA-F]{2}$/.test(e);
}
function yb(e = "") {
  return /^[dD][c-fC-F][0-9a-fA-F]{2}$/.test(e);
}
function _b(e = "") {
  const t = String(e ?? "");
  let n = "", r = 0;
  for (; r < t.length; ) {
    const o = t.slice(r, r + 2), i = t.slice(r + 2, r + 6);
    if (o !== "\\u" || bd(t, r) || !mb(i)) {
      n += t[r] || "", r += 1;
      continue;
    }
    const s = r + 6, u = t.slice(s + 2, s + 6);
    if (gb(i) && t.slice(s, s + 2) === "\\u" && !bd(t, s) && yb(u)) {
      const c = Number.parseInt(i, 16), d = Number.parseInt(u, 16), f = 65536 + (c - 55296 << 10) + (d - 56320);
      n += String.fromCodePoint(f), r += 12;
      continue;
    }
    n += String.fromCharCode(Number.parseInt(i, 16)), r += 6;
  }
  return n;
}
function vb(e = "") {
  let t = String(e ?? "").trim();
  return t.endsWith(",") && (t = t.slice(0, -1).trimEnd()), t.startsWith('\\"') && (t = t.slice(2)), t.endsWith('\\"') && (t = t.slice(0, -2)), t.startsWith('"') && (t = t.slice(1)), t.endsWith('"') && (t = t.slice(0, -1)), _b(t.replace(/\r\n/g, `
`).replace(/\\r/g, "\r").replace(/\\n/g, `
`).replace(/\\t/g, "	").replace(/\\"/g, '"')).replace(/\\\\/g, "\\");
}
function Ab(e = "") {
  return String(e || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function ol(e = "", t = "", n = 0) {
  const r = new RegExp(`(^|[^A-Za-z0-9_])(?:\\\\?")?${Ab(t)}(?:\\\\?")?\\s*:`, "i"), o = String(e || "").slice(Math.max(0, n)).match(r);
  if (!o || o.index === void 0) return null;
  const i = o[1]?.length || 0;
  return {
    key: t,
    index: Math.max(0, n) + o.index + i,
    end: Math.max(0, n) + o.index + o[0].length
  };
}
function Tb(e = "", t = [], n = 0) {
  return t.map((r) => ol(e, r, n)).filter(Boolean).sort((r, o) => r.index - o.index)[0] || null;
}
function it(e = "", t = "", n = []) {
  const r = String(e || ""), o = ol(r, t);
  if (!o) return;
  let i = o.end;
  for (; /\s/.test(r[i] || ""); ) i += 1;
  r[i] === '"' && (i += 1);
  const s = Tb(r, n.filter((d) => d !== t), i);
  let u = s ? s.index : r.length;
  if (s) {
    const d = r.lastIndexOf(",", s.index);
    d >= i && (u = d);
  }
  let c = r.slice(i, u).trim();
  return s || (c = c.replace(/\}\s*$/, "").trimEnd()), vb(c);
}
function At(e = "") {
  const t = String(e ?? "").trim();
  return /^-?\d+(?:\.\d+)?$/.test(t) ? Number(t) : /^true$/i.test(t) ? !0 : /^false$/i.test(t) ? !1 : /^null$/i.test(t) ? null : t;
}
var Rr = {
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
}, Sb = [
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
function Pd(e = "", t = [], n = []) {
  for (const r of t) {
    const o = it(e, r, n);
    if (o !== void 0) return o;
  }
}
function Eb(e = "", t = "") {
  if (t === "Read") {
    const n = Rr.Read, r = {};
    return n.forEach((o, i) => {
      const s = it(e, o, n.slice(i + 1));
      s !== void 0 && (r[o] = At(s));
    }), r.filePath === void 0 && r.path !== void 0 && (r.filePath = r.path, delete r.path), r.filePath === void 0 && r.scope !== void 0 && (r.filePath = r.scope, delete r.scope), Object.keys(r).length ? r : null;
  }
  if (t === "Write") {
    const n = {}, r = Pd(e, ["filePath", "path"], ["content"]), o = it(e, "content", []);
    return r !== void 0 && (n.filePath = At(r)), o !== void 0 && (n.content = At(o)), Object.keys(n).length ? n : null;
  }
  if (t === "Edit") {
    const n = {}, r = Pd(e, ["filePath", "path"], ["edits"]), o = it(e, "edits", []);
    return r !== void 0 && (n.filePath = At(r)), o !== void 0 && (n.edits = At(o)), Object.keys(n).length ? n : null;
  }
  if (t === "Grep") {
    const n = Rr.Grep, r = {};
    return n.forEach((o) => {
      const i = it(e, o, n.filter((s) => s !== o));
      i !== void 0 && (r[o] = At(i));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.path === void 0 && r.scope !== void 0 && (r.path = r.scope), Object.keys(r).length ? r : null;
  }
  if (t === "MemoryGrep") {
    const n = Rr.MemoryGrep, r = {};
    return n.forEach((o) => {
      const i = it(e, o, n.filter((s) => s !== o));
      i !== void 0 && (r[o] = At(i));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.path === void 0 && r.scope !== void 0 && (r.path = r.scope), r.regex === void 0 && r.useRegex !== void 0 && (r.regex = r.useRegex), Object.keys(r).length ? r : null;
  }
  if (t === "ChatHistory") {
    const n = Rr.ChatHistory, r = {};
    return n.forEach((o) => {
      const i = it(e, o, n.filter((s) => s !== o));
      i !== void 0 && (r[o] = At(i));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.regex === void 0 && r.useRegex !== void 0 && (r.regex = r.useRegex), Object.keys(r).length ? r : null;
  }
  return null;
}
function Cb(e = "", t = "") {
  const n = String(e || "").trim();
  if (!n) return null;
  try {
    const s = JSON.parse(n);
    if (s && typeof s == "object" && !Array.isArray(s)) return s;
  } catch {
  }
  const r = Eb(n, t);
  if (r) return r;
  const o = Rr[t] || Sb, i = {};
  return o.forEach((s, u) => {
    const c = it(n, s, o.slice(u + 1));
    c !== void 0 && (i[s] = At(c));
  }), Object.keys(i).length ? i : null;
}
function wb(e = "", t = "") {
  const n = Cb(e, t);
  return n ? JSON.stringify(n) : "";
}
function jm(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function ot(e, t, n) {
  const r = String(n || "").trim();
  r && e.push({
    label: t,
    text: r
  });
}
function $e(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function ee(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function eg(e) {
  if (typeof e == "string") return e;
  if (e == null) return "{}";
  try {
    return JSON.stringify(e);
  } catch {
    return "{}";
  }
}
function tg(e, t = "") {
  if (e && typeof e == "object" && !Array.isArray(e)) return JSON.stringify(e);
  const n = typeof e == "string" ? e : eg(e);
  return wb(n, t) || JSON.stringify(jm(n));
}
function Ib(e = "") {
  const t = String(e || ""), n = ol(t, "arguments");
  if (!n) return "";
  let r = n.end;
  for (; /\s/.test(t[r] || ""); ) r += 1;
  const o = t[r] || "";
  return o === "{" ? t.slice(r).replace(/\}\s*$/, "").trimEnd() : o === '"' ? t.slice(r + 1).replace(/"\s*\}\s*$/, "").trimEnd() : t.slice(r).replace(/\}\s*$/, "").trimEnd();
}
function bb(e = "", t = 0) {
  const n = String(e || "").trim(), r = it(n, "name", ["id", "arguments"]) || it(n, "toolName", ["id", "arguments"]) || "", o = it(n, "id", [
    "name",
    "toolName",
    "arguments"
  ]) || `tool-call-${t + 1}`, i = Ib(n);
  return !r || !i ? null : {
    id: o,
    name: r,
    arguments: tg(i, r)
  };
}
function Pb(e, t = 0, n = "openai-tool") {
  if (!ee(e)) return null;
  const r = ee(e.function) ? e.function : null, o = String(r?.name || "").trim();
  if (!o) return null;
  const i = $e(e) || {};
  return delete i.index, i.id = String(i.id || `${n}-${t + 1}`), i.type = "function", i.function = {
    ...$e(r) || {},
    name: o,
    arguments: eg(r.arguments)
  }, i;
}
function Br(e = [], t = "openai-tool") {
  return (Array.isArray(e) ? e : []).map((n, r) => Pb(n, r, t)).filter(Boolean);
}
function Gr(e, t) {
  return Array.isArray(e) ? e.some((n) => Gr(n, t)) : ee(e) ? Object.entries(e).some(([n, r]) => String(n || "").replace(/[_-]/g, "").toLowerCase() === "thoughtsignature" ? t(r) : (Array.isArray(r) || ee(r)) && Gr(r, t)) : !1;
}
function Rb(e) {
  return Gr(e, (t) => typeof t == "string" && t.length > 0);
}
function ra(e) {
  return Gr(e, () => !0);
}
function xb(e) {
  return Gr(e, (t) => typeof t != "string" || t.length === 0);
}
function Mb(e = {}) {
  return Array.isArray(e?.tool_calls) && e.tool_calls.some((t) => Rb(t));
}
var Rd = /* @__PURE__ */ new WeakSet();
function il(e) {
  if (!ee(e)) return null;
  const t = $e(e) || {};
  if (typeof t.content == "string" && /<tool_call\b/i.test(t.content) && (t.content = jt(Zt(t.content).cleaned)), Array.isArray(t.tool_calls)) {
    const n = Br(t.tool_calls);
    n.length ? t.tool_calls = n : delete t.tool_calls;
  }
  return t;
}
function sl(e = [], t = "openai-tool") {
  return Br(e, t).map((n, r) => ({
    id: n.id || `${t}-${Date.now()}-${r + 1}`,
    name: n.function.name,
    arguments: n.function.arguments
  }));
}
function al(e) {
  return typeof e == "string" ? e : Array.isArray(e) ? e.map((t) => t ? typeof t == "string" ? t : t.text || t.content || "" : "").filter(Boolean).join(`
`) : "";
}
function Zt(e = "") {
  const t = [];
  return {
    cleaned: String(e || "").replace(/<think>([\s\S]*?)<\/think>/gi, (n, r) => (ot(t, "思考块", r), "")).trim(),
    thoughts: t
  };
}
function jt(e = "") {
  const t = String(e || ""), n = t.search(/<tool_call\b/i);
  return n < 0 ? t.trim() : t.slice(0, n).trim();
}
function oa(e = "") {
  const t = String(e || "");
  return /<tool_call\b/i.test(t) ? [{
    id: "tagged-json-draft",
    name: t.match(/["']?name["']?\s*:\s*["']([^"']+)/i)?.[1] || "工具调用",
    arguments: "{}",
    draft: !0
  }] : [];
}
function Xt(e, t, n) {
  if (t) {
    if (typeof t == "string") {
      ot(e, n, t);
      return;
    }
    if (Array.isArray(t)) {
      t.forEach((r) => Xt(e, r, n));
      return;
    }
    typeof t == "object" && (typeof t.text == "string" && ot(e, n, t.text), typeof t.content == "string" && ot(e, n, t.content), typeof t.reasoning_content == "string" && ot(e, n, t.reasoning_content), typeof t.thinking == "string" && ot(e, n, t.thinking), Array.isArray(t.summary) && t.summary.forEach((r) => {
      if (typeof r == "string") {
        ot(e, "推理摘要", r);
        return;
      }
      r && typeof r == "object" && ot(e, "推理摘要", r.text || r.content || "");
    }));
  }
}
function Lt(e = {}, t = {}) {
  const n = [];
  return Xt(n, e.reasoning_content, "推理文本"), Xt(n, e.reasoning, "推理文本"), Xt(n, e.reasoning_text, "推理文本"), Xt(n, e.thinking, "思考块"), Xt(n, t.reasoning_content, "推理文本"), Xt(n, t.reasoning, "推理文本"), Array.isArray(e.content) && e.content.forEach((r) => {
    if (!(!r || typeof r != "object")) {
      if (r.type === "reasoning_text") {
        ot(n, "推理文本", r.text);
        return;
      }
      if (r.type === "summary_text") {
        ot(n, "推理摘要", r.text);
        return;
      }
      (r.type === "thinking" || r.type === "reasoning" || r.type === "reasoning_content") && ot(n, "思考块", r.text || r.content || r.reasoning || "");
    }
  }), n;
}
function $r(e = "") {
  const t = [/<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g], n = [];
  return t.forEach((r) => {
    [...e.matchAll(r)].forEach((o, i) => {
      try {
        const s = JSON.parse(o[1]);
        n.push({
          id: s.id || `tool-call-${i + 1}`,
          name: String(s.name || ""),
          arguments: tg(s.arguments, s.name)
        });
      } catch {
        const s = bb(o[1], i);
        s && n.push(s);
      }
    });
  }), n.filter((r) => r.name);
}
function ll(e) {
  const t = e?.providerPayload?.openaiCompatibleMessage;
  return !t || typeof t != "object" || Array.isArray(t) ? null : il(t);
}
function Nb(e = []) {
  for (let t = e.length - 1; t >= 0; t -= 1) if (e[t]?.role === "user") return t;
  return -1;
}
function kb(e = {}) {
  const t = Br(e?.tool_calls);
  if (t.length) return t;
  const n = Br(ll(e)?.tool_calls);
  return n.length ? n : [];
}
function Db(e = "") {
  return /deepseek/i.test(String(e || ""));
}
function $b(e = "") {
  return /claude/i.test(String(e || ""));
}
function Lb(e = "") {
  return Ta(e) === "openai";
}
function ng(e = {}, t = {}) {
  return t.mode !== "on" && t.mode !== "off" ? e : t.profileId === "kimi-k3" ? (e.reasoning_effort = t.mode === "off" ? "off" : t.effort, e) : t.profileId === "deepseek-thinking" ? (e.thinking = { type: t.mode === "off" ? "disabled" : "enabled" }, t.mode === "on" && (e.reasoning_effort = t.effort), e) : (String(t.profileId || "").startsWith("openai-") && (e.reasoning_effort = t.mode === "off" ? "none" : t.effort), e);
}
function rg(e = [], t = "") {
  if (!$b(t)) return e;
  let n = -1;
  for (let o = e.length - 1; o >= 0; o -= 1) if (typeof e[o]?.role == "string") {
    n = o;
    break;
  }
  const r = e[n]?.role;
  return n < 0 || r === "user" || r !== "system" && r !== "assistant" ? e : e.map((o, i) => i === n ? {
    ...o,
    role: "user"
  } : o);
}
function xd(e, t = "") {
  return !ee(e) || !Db(t) || !Array.isArray(e.tool_calls) || !e.tool_calls.length || Object.prototype.hasOwnProperty.call(e, "reasoning_content") ? e : {
    ...e,
    reasoning_content: ""
  };
}
var ia = /* @__PURE__ */ new Set([
  "content",
  "refusal",
  "arguments",
  "reasoning_content",
  "reasoning_text",
  "thinking",
  "text"
]);
function Ub(e = [], t = []) {
  const n = Array.isArray(e) ? e.map((r) => $e(r) || {}) : [];
  return (Array.isArray(t) ? t : []).forEach((r, o) => {
    const i = $e(r) || {}, s = Number.isInteger(Number(r?.index)) ? Number(r.index) : o, u = n[s];
    n[s] = ee(u) ? ro(u, i, "tool_call") : i;
  }), n.filter((r) => r !== void 0);
}
function ro(e, t, n = "") {
  if (t === void 0) return e;
  if (e === void 0) return $e(t);
  if (t === null && ia.has(String(n || ""))) return e;
  if (n === "tool_calls" && Array.isArray(e) && Array.isArray(t)) return Ub(e, t);
  if (typeof e == "string" && typeof t == "string")
    return ia.has(String(n || "")) ? e === t ? e : t.startsWith(e) ? t : e.startsWith(t) ? e : `${e}${t}` : e === t ? e : $e(t);
  if (Array.isArray(e) && Array.isArray(t)) return e.concat($e(t) || []);
  if (ee(e) && ee(t)) {
    const r = { ...e };
    return Object.entries(t).forEach(([o, i]) => {
      r[o] = ro(r[o], i, o);
    }), r;
  }
  return $e(t);
}
function fi(e = {}, t = {}) {
  const n = ee(e) ? $e(e) || {} : {}, r = ee(t) ? $e(t) || {} : {};
  return delete r.message, delete r.finish_reason, delete r.index, delete r.logprobs, delete r.delta, Object.entries(r).forEach(([o, i]) => {
    n[o] = ro(n[o], i, o);
  }), n.role || (n.role = "assistant"), il(n) || { role: "assistant" };
}
function Lr(e, t = {}) {
  const n = il(fi(e, t));
  if (!(!n || typeof n != "object" || Array.isArray(n)))
    return { openaiCompatibleMessage: n };
}
function Fb(e = {}, t = {}) {
  return ee(e) ? ee(t) ? ro($e(e) || {}, t, "") : $e(e) : $e(t);
}
function sa(e, t = "") {
  const n = Array.isArray(e.messages) ? e.messages : [], r = Nb(n), o = [];
  let i = !1;
  n.forEach((u, c) => {
    if (i) {
      if (u?.role === "tool") return;
      i = !1;
    }
    const d = u?.role === "assistant", f = d ? u?.providerPayload?.openaiCompatibleMessage : null, h = ig(Array.isArray(f?.tool_calls) && f.tool_calls.some((C) => ra(C)) ? f.tool_calls : d && Array.isArray(u?.tool_calls) && u.tool_calls.some((C) => ra(C)) ? u.tool_calls : null);
    if (h) {
      const C = ee(f) ? f : u;
      (!ee(C) || !Rd.has(C)) && (ee(C) && Rd.add(C), console.warn("[LittleWhiteBox/OpenAI-compatible] skipped corrupted signed tool-call history", {
        code: "openai_compatible_signed_tool_call_history_corrupted",
        toolIndex: h.index,
        toolName: h.toolName,
        reason: h.reason
      })), i = !0;
      return;
    }
    const p = d ? Br(u?.tool_calls) : [], m = d ? ll(u) : null, g = Array.isArray(m?.tool_calls) ? m.tool_calls : [], _ = g.length > 0 && Mb(m);
    if (g.length && c > r) {
      o.push(xd({
        ...m,
        ...p.length && !_ ? { tool_calls: p } : {}
      }, t));
      return;
    }
    const v = {
      role: u.role,
      content: u.content
    };
    u.role === "tool" && u.tool_call_id && (v.tool_call_id = u.tool_call_id), _ ? v.tool_calls = g : p.length && (v.tool_calls = p), o.push(xd(v, t));
  });
  const s = String(e.systemPrompt || "").trim();
  return s && o[0]?.role !== "system" && o.unshift({
    role: "system",
    content: s
  }), rg(o, t);
}
function Md(e) {
  const t = (e.tools || []).map((o) => [`- ${o.function.name}: ${o.function.description || ""}`.trim(), `  参数 JSON Schema: ${JSON.stringify(o.function.parameters || {})}`].join(`
`)).join(`
`), n = String(e.toolChoice || "auto").trim() || "auto", r = n === "required" ? "本轮必须调用工具，不得只返回正文。" : n === "none" ? "本轮不得调用工具，不得输出 <tool_call> 标签。" : n === "auto" ? "请根据任务判断是否需要调用工具。" : `本轮必须调用工具 ${n}，不得调用其他工具，也不得只返回正文。`;
  return [
    e.systemPrompt || "",
    "如果你需要调用工具，不要使用原生 tool calling 字段。",
    r,
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
function aa(e, t = "") {
  const n = /* @__PURE__ */ new Map(), r = [];
  return (Array.isArray(e.messages) ? e.messages : []).forEach((o) => {
    if (o.role === "assistant") {
      const i = kb(o);
      if (i.length) {
        const s = ll(o), u = typeof s?.content == "string" ? s.content : String(o.content || ""), c = i.map((d, f) => {
          const h = d.function?.name || "", p = d.id || `tool-call-${f + 1}`;
          return h && n.set(p, h), `<tool_call>${JSON.stringify({
            id: p,
            name: h,
            arguments: jm(d.function?.arguments || "{}")
          })}</tool_call>`;
        }).join(`
`);
        r.push({
          role: "assistant",
          content: [u, c].filter(Boolean).join(`

`)
        });
        return;
      }
    }
    if (o.role === "tool") {
      const i = String(o.toolName || o.tool_name || "").trim() || n.get(o.tool_call_id || "") || "unknown_tool";
      o.tool_call_id && n.delete(o.tool_call_id);
      const s = String(o.content || "");
      r.push({
        role: "user",
        content: [
          "<tool_result>",
          "这是系统工具执行结果，不是用户新发言。",
          `name: ${i}`,
          "content:",
          s,
          "</tool_result>"
        ].join(`
`)
      });
      return;
    }
    r.push({
      role: o.role,
      content: o.content
    });
  }), !r.length || r[0].role !== "system" ? r.unshift({
    role: "system",
    content: Md(e)
  }) : r[0] = {
    ...r[0],
    content: Md({
      ...e,
      systemPrompt: r[0].content || e.systemPrompt
    })
  }, rg(r, t);
}
function Nd(e, t, n) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: Z(n) ? t.thoughts : [] } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function fr(e, t = []) {
  return Z(e) ? t : [];
}
function og(e, t, n) {
  !e || !t || n === void 0 || (e[t] = ro(e[t], n, t));
}
function hi(e, t, n) {
  if (!(!e || !t || n === void 0)) {
    if (ee(n)) {
      const r = ee(e[t]) ? { ...e[t] } : {};
      Object.entries(n).forEach(([o, i]) => {
        hi(r, o, i);
      }), e[t] = r;
      return;
    }
    if (typeof n == "string" && ia.has(t)) {
      e[t] = typeof e[t] == "string" ? `${e[t]}${n}` : n;
      return;
    }
    n === "" && e[t] || og(e, t, n);
  }
}
function Ob(e, t = []) {
  !Array.isArray(t) || !t.length || (Array.isArray(e.tool_calls) || (e.tool_calls = []), t.forEach((n) => {
    const r = Number(n?.index ?? 0), o = { ...e.tool_calls[r] || {} };
    Object.entries(n || {}).forEach(([i, s]) => {
      if (i !== "index" && !(i === "function" && s == null)) {
        if (i === "function" && ee(s)) {
          o.function = ee(o.function) ? { ...o.function } : {}, Object.entries(s).forEach(([u, c]) => {
            hi(o.function, u, c);
          });
          return;
        }
        hi(o, i, s);
      }
    }), e.tool_calls[r] = o;
  }));
}
function la(e, t = {}) {
  if (!e || !t || typeof t != "object") return;
  Object.entries(t).forEach(([r, o]) => {
    r === "delta" || r === "finish_reason" || r === "index" || r === "logprobs" || og(e, r, o);
  });
  const n = ee(t.delta) ? t.delta : {};
  Object.entries(n).forEach(([r, o]) => {
    if (r === "tool_calls") {
      Ob(e, o);
      return;
    }
    hi(e, r, o);
  });
}
function Mn(e = {}) {
  return al(e?.content);
}
function Nn(e = {}) {
  return sl(e?.tool_calls || []);
}
function qb(e) {
  if (typeof e != "string" || !e.trim()) return !1;
  try {
    return ee(JSON.parse(e));
  } catch {
    return !1;
  }
}
function ig(e) {
  if (!Array.isArray(e) || !e.some((t) => ra(t))) return null;
  for (let t = 0; t < e.length; t += 1) {
    const n = e[t], r = ee(n?.function) ? n.function : null, o = String(r?.name || "").trim();
    let i = "";
    if (!ee(n) || !r ? i = "invalid_function_shape" : o ? qb(r.arguments) ? xb(n) && (i = "invalid_thought_signature") : i = "invalid_function_arguments" : i = "missing_function_name", i) return {
      index: t,
      toolName: o,
      reason: i
    };
  }
  return null;
}
function kn(e = {}) {
  const t = ig(e?.tool_calls);
  if (!t) return;
  const n = /* @__PURE__ */ new Error("openai_compatible_signed_tool_call_corrupted");
  throw n.toolIndex = t.index, n.toolName = t.toolName, n.reason = t.reason, n;
}
async function Bb(e, t) {
  const n = e.body?.getReader?.();
  if (!n) throw new Error("openai_compatible_stream_missing_body");
  const r = new TextDecoder();
  let o = "";
  const i = /\r?\n\r?\n/;
  for (; ; ) {
    const { done: u, value: c } = await n.read();
    if (u) break;
    for (o += r.decode(c, { stream: !0 }); ; ) {
      const d = o.match(i);
      if (!d || typeof d.index != "number") break;
      const f = d.index, h = o.slice(0, f);
      o = o.slice(f + d[0].length);
      const p = h.split(/\r?\n/).filter((m) => m.startsWith("data:")).map((m) => m.slice(5).trimStart()).join(`
`).trim();
      !p || p === "[DONE]" || t(JSON.parse(p));
    }
  }
  const s = o.trim();
  if (s && s !== "[DONE]") {
    const u = s.split(/\r?\n/).filter((c) => c.startsWith("data:")).map((c) => c.slice(5).trimStart()).join(`
`).trim();
    u && u !== "[DONE]" && t(JSON.parse(u));
  }
}
var Gb = class {
  constructor(e) {
    this.config = e, this.client = new W({
      apiKey: e.apiKey,
      baseURL: String(e.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e, t = ie("openai-compatible", this.config, e.reasoning)) {
    const n = t, r = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, o = !r && Array.isArray(e.tools) && e.tools.length ? e.tools : null, i = {
      model: this.config.model,
      messages: r ? aa(e, this.config.model) : sa(e, this.config.model),
      ...o ? {
        tools: o,
        tool_choice: e.toolChoice || "auto"
      } : {},
      ...e.maxTokens ? Lb(this.config.model) ? { max_completion_tokens: e.maxTokens } : { max_tokens: e.maxTokens } : {}
    };
    return !Qr({
      ...this.config,
      provider: "openai-compatible"
    }, n) && typeof e.temperature == "number" && (i.temperature = e.temperature), ng(i, n);
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", r = t.effectiveReasoning || ie("openai-compatible", this.config, e.reasoning), o = {
      ...t.body || this.buildRequestBody(e, r),
      ...n ? { stream: !0 } : {}
    }, i = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), s = {
      ...Object.hasOwn(o, "reasoning_effort") ? { reasoning_effort: o.reasoning_effort } : {},
      ...Object.hasOwn(o, "thinking") ? { thinking: o.thinking } : {}
    };
    return { ...Or({
      provider: "openai-compatible",
      model: this.config.model,
      transport: "openai-compatible",
      url: `${i}/chat/completions`,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.config.apiKey ? `Bearer ${this.config.apiKey}` : ""
      },
      body: o,
      sdk: n ? "client.chat.completions.create(..., { stream: true })" : "client.chat.completions.create",
      effectiveConfig: Ot(e, {
        reasoning: r,
        effort: o.reasoning_effort,
        controlFields: s
      })
    }) };
  }
  async streamNativeChatCompletions(e, t, n) {
    const r = `${String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, "")}/chat/completions`, o = await fetch(r, {
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
    if (!o.ok) {
      const g = await o.text().catch(() => ""), _ = new Error(g || `openai_compatible_stream_http_${o.status}`);
      throw _.status = o.status, _;
    }
    const i = { role: "assistant" };
    let s = "stop", u = this.config.model;
    await Bb(o, (g) => {
      u = g?.model || u;
      const _ = g?.choices?.[0];
      la(i, _), _?.finish_reason && (s = _.finish_reason);
      const v = Zt(Mn(i)), C = Nn(i), b = C.length ? C : oa(v.cleaned);
      Nd(e, {
        text: C.length ? v.cleaned : jt(v.cleaned),
        thoughts: fr(n, Lt(i, _).concat(v.thoughts)),
        ...b.length ? { toolCalls: b } : {},
        ...!C.length && b.length ? { toolCallDraft: !0 } : {}
      }, n);
    }), kn(i);
    const c = Lr(i), d = Nn(i), f = Zt(Mn(i)), h = Lt(i, {});
    f.thoughts.forEach((g) => h.push(g));
    const p = d.length ? [] : $r(f.cleaned), m = [...d, ...p];
    return {
      text: d.length ? f.cleaned : jt(f.cleaned),
      toolCalls: m,
      thoughts: fr(n, h),
      finishReason: s,
      model: u,
      provider: "openai-compatible",
      providerPayload: c
    };
  }
  async chat(e) {
    const t = ie("openai-compatible", this.config, e.reasoning), n = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, r = typeof e.onStreamProgress == "function", o = this.buildRequestBody(e, t), i = this.inspectRequest(e, {
      body: o,
      effectiveReasoning: t
    }), s = async (C) => {
      try {
        return await C(o);
      } catch (b) {
        throw b && typeof b == "object" && (b.requestInspection = i), b;
      }
    };
    if (r) {
      if (!n) return {
        ...await s((X) => this.streamNativeChatCompletions(e, X, t)),
        requestInspection: i
      };
      const C = await s((X) => this.client.chat.completions.create({
        ...X,
        stream: !0
      }, { signal: e.signal })), b = { role: "assistant" };
      let P = "stop", R = this.config.model, D;
      for await (const X of C) {
        R = X.model || R;
        const Q = X.choices?.[0];
        la(b, Q), Q?.finish_reason && (P = Q.finish_reason);
        const Se = Zt(Mn(b)), Ue = Nn(b), re = Ue.length ? Ue : oa(Se.cleaned);
        Nd(e, {
          text: Ue.length ? Se.cleaned : jt(Se.cleaned),
          thoughts: fr(t, Lt(b, Q).concat(Se.thoughts)),
          ...re.length ? { toolCalls: re } : {},
          ...!Ue.length && re.length ? { toolCallDraft: !0 } : {}
        }, t);
      }
      const A = (typeof C.finalChatCompletion == "function" ? await C.finalChatCompletion() : null)?.choices?.[0] || null, U = A?.message || b;
      kn(U);
      const x = Fb(b, fi(U, A || {}));
      kn(x), D = Lr(x);
      const $ = Nn(x), H = Zt(Mn(x)), z = Lt(x, A || {});
      H.thoughts.forEach((X) => z.push(X));
      const ge = $.length ? [] : $r(H.cleaned), se = [...$, ...ge];
      return {
        text: $.length ? H.cleaned : jt(H.cleaned),
        toolCalls: se,
        thoughts: fr(t, z),
        finishReason: P,
        model: R,
        provider: "openai-compatible",
        providerPayload: D,
        requestInspection: i
      };
    }
    const u = await s((C) => this.client.chat.completions.create(C, { signal: e.signal })), c = u.choices?.[0] || {}, d = c.message || {};
    kn(d);
    const f = Lt(d, c), h = sl(d.tool_calls || []), p = Zt(al(d.content));
    p.thoughts.forEach((C) => f.push(C));
    const m = h.length ? [] : $r(p.cleaned), g = [...h, ...m], _ = h.length ? p.cleaned : jt(p.cleaned), v = fi(d, c);
    return {
      text: _,
      toolCalls: g,
      thoughts: fr(t, f),
      finishReason: c.finish_reason || "stop",
      model: u.model || this.config.model,
      provider: "openai-compatible",
      providerPayload: Lr(v),
      requestInspection: i
    };
  }
};
function ul(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function sg(e, t) {
  return {
    type: "message",
    role: e,
    content: Hb(t)
  };
}
function pi(e) {
  return {
    role: "assistant",
    content: typeof e == "string" ? e : ""
  };
}
function Hb(e) {
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
function mi(e, t, n) {
  const r = String(n || "").trim();
  r && e.push({
    label: t,
    text: r
  });
}
function kd(e, t = [], n = {}) {
  (t || []).forEach((r) => {
    if (!(!r || typeof r != "object")) {
      if (r.type === "reasoning_text") {
        mi(e, n.reasoning || "推理文本", r.text);
        return;
      }
      r.type === "summary_text" && mi(e, n.summary || "推理摘要", r.text);
    }
  });
}
function Vb(e = []) {
  const t = [];
  return (e || []).forEach((n) => {
    !n || typeof n != "object" || n.type === "reasoning" && (kd(t, n.content, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }), kd(t, n.summary, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }));
  }), t;
}
function Jb(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function Kb(e) {
  if (typeof e?.output_text == "string" && e.output_text.trim()) return e.output_text.trim();
  const t = [];
  return (Array.isArray(e?.output) ? e.output : []).forEach((n) => {
    if (!(!n || typeof n != "object")) {
      if (n.type === "message" && Array.isArray(n.content)) {
        n.content.forEach((r) => {
          if (!(!r || typeof r != "object")) {
            if (r.type === "output_text" && typeof r.text == "string" && r.text.trim()) {
              t.push(r.text.trim());
              return;
            }
            r.type === "refusal" && typeof r.refusal == "string" && r.refusal.trim() && t.push(r.refusal.trim());
          }
        });
        return;
      }
      typeof n.text == "string" && n.text.trim() && t.push(n.text.trim());
    }
  }), t.join(`
`).trim();
}
function Wb(e) {
  if (e && typeof e == "object" && !Array.isArray(e) && !Object.prototype.hasOwnProperty.call(e, "choices") && Array.isArray(e.output)) return;
  const t = /* @__PURE__ */ new Error("当前端点返回的不是 Responses API，请改用 OpenAI 兼容。");
  throw t.name = "OpenAIResponsesEndpointMismatchError", t.code = "OPENAI_RESPONSES_ENDPOINT_MISMATCH", t;
}
function zb(e) {
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
        t.push(...ul(n.providerPayload.openAIResponseOutput) || []);
        continue;
      }
      if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
        n.content?.trim() && t.push(pi(n.content)), n.tool_calls.forEach((r, o) => {
          t.push({
            type: "function_call",
            call_id: r.id || `function_call_${o + 1}`,
            name: r.function?.name || "",
            arguments: r.function?.arguments || "{}",
            status: "completed"
          });
        });
        continue;
      }
      if (n.role === "assistant") {
        t.push(pi(n.content || ""));
        continue;
      }
      t.push(n.role === "user" ? sg(n.role, n.content || "") : {
        role: n.role,
        content: typeof n.content == "string" ? n.content : ""
      });
    }
  return t;
}
function Yb(e) {
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
      t.push(...ul(n.providerPayload.openAIResponseOutput) || []);
      continue;
    }
    if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
      n.content?.trim() && t.push(pi(n.content)), n.tool_calls.forEach((r, o) => {
        t.push({
          type: "function_call",
          call_id: r.id || `function_call_${o + 1}`,
          name: r.function?.name || "",
          arguments: r.function?.arguments || "{}",
          status: "completed"
        });
      });
      continue;
    }
    if (n.role === "assistant") {
      t.push(pi(n.content || ""));
      continue;
    }
    t.push(n.role === "user" ? sg(n.role, n.content || "") : {
      role: n.role,
      content: typeof n.content == "string" ? n.content : ""
    });
  }
  return t;
}
function Xb(e) {
  try {
    return new URL(String(e || "https://api.openai.com/v1")).hostname === "api.openai.com";
  } catch {
    return !1;
  }
}
function Qb(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return t.includes("instructions") || t.includes("unsupported") || t.includes("unknown parameter") || t.includes("invalid input");
}
function Zb(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function us(e, t) {
  const [n = "0", r = "0"] = String(e || "").split(":"), [o = "0", i = "0"] = String(t || "").split(":");
  return Number(n) - Number(o) || Number(r) - Number(i);
}
var jb = class {
  constructor(e) {
    this.config = e, this.client = new W({
      apiKey: e.apiKey,
      baseURL: String(e.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e, t = !1, n = ie("openai-responses", this.config, e.reasoning)) {
    const r = n, o = {
      model: this.config.model,
      instructions: t ? void 0 : Jb(e) || void 0,
      input: t ? Yb(e) : zb(e),
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
    return !Qr({
      ...this.config,
      provider: "openai-responses"
    }, r) && typeof e.temperature == "number" && (o.temperature = e.temperature), r.mode === "on" || r.mode === "off" ? o.reasoning = {
      effort: r.mode === "off" ? "none" : r.effort,
      ...r.mode === "on" && Z(r) ? { summary: "auto" } : {}
    } : Z(r) && (o.reasoning = { summary: "auto" }), r.mode !== "off" && r.profileId.startsWith("openai-") && (o.include = ["reasoning.encrypted_content"]), o;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", r = t.legacySystemInInput === !0, o = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), i = t.effectiveReasoning || ie("openai-responses", this.config, e.reasoning), s = t.body || this.buildRequestBody(e, r, i);
    return Or({
      provider: "openai-responses",
      model: this.config.model,
      transport: "openai-responses",
      url: `${o}/responses`,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.config.apiKey ? `Bearer ${this.config.apiKey}` : ""
      },
      body: s,
      sdk: n ? "client.responses.stream" : "client.responses.create",
      effectiveConfig: Ot(e, {
        reasoning: i,
        effort: s.reasoning?.effort,
        controlFields: {
          ...s.reasoning ? { reasoning: s.reasoning } : {},
          ...s.include ? { include: s.include } : {}
        }
      })
    });
  }
  async chat(e) {
    const t = ie("openai-responses", this.config, e.reasoning), n = [], r = () => ({
      ...n.at(-1)?.inspection || {},
      requestCount: n.length,
      fallbackCount: Math.max(0, n.length - 1),
      requests: n.map(({ reason: m, inspection: g }, _) => ({
        index: _ + 1,
        reason: m,
        request: g.request,
        effectiveConfig: g.effectiveConfig
      }))
    }), o = (m) => (m && typeof m == "object" && (m.requestInspection = r()), m), i = (m) => {
      Wb(m);
      const g = m.output;
      return {
        output: g,
        thoughts: Z(t) ? Vb(g) : [],
        toolCalls: g.filter((_) => _.type === "function_call" && _.name).map((_, v) => ({
          id: _.call_id || `response-tool-${v + 1}`,
          name: _.name || "",
          arguments: _.arguments || "{}"
        })),
        text: Kb(m)
      };
    }, s = (m, g, _) => {
      const v = this.inspectRequest(e, {
        body: m,
        legacySystemInInput: g,
        effectiveReasoning: t
      });
      n.push({
        reason: _,
        inspection: v
      });
    }, u = async (m = !1, g = "initial") => {
      const _ = this.buildRequestBody(e, m, t);
      s(_, m, g);
      try {
        return await this.client.responses.create(_, { signal: e.signal });
      } catch (v) {
        throw o(v);
      }
    }, c = async (m = !1, g = "initial") => {
      const _ = this.buildRequestBody(e, m, t);
      s(_, m, g);
      try {
        const v = this.client.responses.stream(_, { signal: e.signal }), C = /* @__PURE__ */ new Map(), b = /* @__PURE__ */ new Map(), P = /* @__PURE__ */ new Map(), R = () => {
          const D = [];
          Z(t) && (Array.from(b.entries()).sort(([A], [U]) => us(A, U)).forEach(([, A]) => mi(D, "推理文本", A)), Array.from(P.entries()).sort(([A], [U]) => us(A, U)).forEach(([, A]) => mi(D, "推理摘要", A))), Zb(e, {
            text: Array.from(C.entries()).sort(([A], [U]) => us(A, U)).map(([, A]) => A).join(`
`).trim(),
            thoughts: D
          });
        };
        return v.on("response.output_text.delta", (D) => {
          const A = `${D.output_index}:${D.content_index}`;
          C.set(A, `${C.get(A) || ""}${D.delta}`), R();
        }), v.on("response.reasoning_text.delta", (D) => {
          const A = `${D.output_index}:${D.content_index}`;
          b.set(A, `${b.get(A) || ""}${D.delta}`), R();
        }), v.on("response.reasoning_summary_text.delta", (D) => {
          const A = `${D.output_index}:${D.summary_index}`;
          P.set(A, `${P.get(A) || ""}${D.delta}`), R();
        }), await v.finalResponse();
      } catch (v) {
        throw o(v);
      }
    }, d = !Xb(this.config.baseUrl), f = typeof e.onStreamProgress == "function" ? c : u;
    let h, p;
    try {
      h = await f(!1, "initial"), p = i(h);
    } catch (m) {
      if (!d || !Qb(m)) throw o(m);
      h = await f(!0, "legacy_system_error");
      try {
        p = i(h);
      } catch (g) {
        throw o(g);
      }
    }
    if (d && n.length < 2 && !p.text && !p.toolCalls.length) {
      h = await f(!0, "empty_response");
      try {
        p = i(h);
      } catch (m) {
        throw o(m);
      }
    }
    return {
      text: p.text,
      toolCalls: p.toolCalls,
      thoughts: p.thoughts,
      finishReason: h.incomplete_details?.reason || h.status || "stop",
      model: h.model || this.config.model,
      provider: "openai-responses",
      providerPayload: p.output.length ? { openAIResponseOutput: ul(p.output) || [] } : void 0,
      requestInspection: r()
    };
  }
};
async function e0(e, t) {
  const n = e.body?.getReader?.();
  if (!n) throw new Error("host_chat_completions_stream_missing_body");
  const r = new TextDecoder();
  let o = "";
  const i = /\r?\n\r?\n/, s = (c) => {
    const d = c.split(/\r?\n/).filter((f) => f.startsWith("data:")).map((f) => f.slice(5).trimStart()).join(`
`).trim();
    !d || d === "[DONE]" || t(JSON.parse(d));
  };
  for (; ; ) {
    const { done: c, value: d } = await n.read();
    if (c) break;
    for (o += r.decode(d, { stream: !0 }); ; ) {
      const f = o.match(i);
      if (!f || typeof f.index != "number") break;
      const h = o.slice(0, f.index);
      o = o.slice(f.index + f[0].length), s(h);
    }
  }
  const u = o.trim();
  u && s(u);
}
var Wn = "openai", cl = "claude", dl = "makersuite", t0 = "/api/backends/chat-completions/status", n0 = "/api/backends/chat-completions/generate", ag = Object.freeze({
  [cl]: "https://api.anthropic.com/v1",
  [dl]: "https://generativelanguage.googleapis.com"
}), ua = null;
function r0(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function o0(e = "") {
  return Ta(e) === "openai";
}
function i0(e, t) {
  const n = r0(e);
  return t === "claude" ? !n || /\/v\d[\w.-]*$/i.test(n) ? n : `${n}/v1` : t === "makersuite" ? n.replace(/\/v\d[\w.-]*$/i, "") : n;
}
function s0(e) {
  ua = typeof e == "function" ? e : null;
}
async function lg() {
  if (!ua) throw new Error("宿主请求头未注册，无法调用酒馆后端。");
  return {
    "Content-Type": "application/json",
    ...await Promise.resolve(ua() || {}),
    Accept: "application/json"
  };
}
function a0(e = {}) {
  const t = {};
  return Object.entries(e || {}).forEach(([n, r]) => {
    t[n] = /authorization|csrf|token|api[-_]?key/i.test(n) ? "[redacted]" : r;
  }), t;
}
async function oo(e = {}, t = !1) {
  const n = await lg(), r = {
    url: n0,
    method: "POST",
    headers: a0(n),
    body: {
      ...e,
      stream: !!t
    }
  };
  return Object.defineProperty(r, "rawHeaders", {
    value: n,
    enumerable: !1
  }), r;
}
function l0(e = "") {
  return /^\s*(?:<!DOCTYPE\s+html\b|<html\b)/i.test(String(e || ""));
}
function u0(e = "") {
  return /invalid csrf token/i.test(String(e || ""));
}
function c0() {
  return "酒馆当前页面的 CSRF token 已失效，请按 F5 刷新并重新进入酒馆后再试。";
}
function Dd(e = "", t = 10) {
  const n = Number.parseInt(String(e || ""), t);
  return Number.isInteger(n) && n >= 0 && n <= 1114111 ? String.fromCodePoint(n) : "";
}
function $d(e = "") {
  return String(e || "").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#x([0-9a-f]+);?/gi, (t, n) => Dd(n, 16)).replace(/&#([0-9]+);?/g, (t, n) => Dd(n));
}
function d0(e = "") {
  const t = String(e || ""), n = $d((t.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/\s+/g, " ").trim(), r = $d(t.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(), o = n || r;
  return o.length > 240 ? `${o.slice(0, 237)}...` : o;
}
function f0(e = null) {
  const t = Number(e?.status), n = String(e?.statusText || "").trim();
  let r = "";
  try {
    r = String(e?.headers?.get?.("content-type") || "").trim();
  } catch {
    r = "";
  }
  return {
    status: Number.isFinite(t) && t > 0 ? t : 0,
    statusText: n,
    contentType: r
  };
}
function h0(e = {}) {
  return e.status ? `HTTP ${e.status}${e.statusText ? ` ${e.statusText}` : ""}` : "";
}
function Fn(e = "", t = "", n = null) {
  if (u0(e)) return c0();
  const r = f0(n);
  if (l0(e) || /\btext\/html\b/i.test(r.contentType)) {
    const o = h0(r), i = d0(e);
    return [
      "酒馆后端返回了非 JSON 的 HTML 页面",
      o ? `（${o}）` : "",
      i ? `：${i}` : ""
    ].join("");
  }
  return String(e || t || "").trim();
}
function ug(e = {}, t = Wn) {
  const n = i0(e.baseUrl, t), r = String(e.apiKey || "").trim(), o = ag[t] || "", i = n || (r ? o : ""), s = { chat_completion_source: t || "openai" };
  return i && (s.reverse_proxy = i), r && (s.proxy_password = r), s;
}
function p0(e = {}) {
  return Object.keys(e).forEach((t) => {
    (e[t] === void 0 || e[t] === "") && delete e[t];
  }), e;
}
function m0(e = {}, t = Wn) {
  return ug(e, t);
}
function fl(e = {}, t = {}, n = [], r = !1, o = Wn) {
  const i = t.maxTokens, s = o === "openai" && o0(e.model);
  return p0({
    ...ug(e, o),
    stream: !!r,
    messages: n,
    model: e.model,
    max_tokens: s ? void 0 : i,
    max_completion_tokens: s ? i : void 0,
    temperature: t.temperature,
    tools: Array.isArray(t.tools) && t.tools.length ? t.tools : void 0,
    tool_choice: Array.isArray(t.tools) && t.tools.length ? t.toolChoice || "auto" : void 0,
    use_sysprompt: o === "openai" ? void 0 : !0
  });
}
function g0(e = {}, t = {}, n = [], r = !1) {
  return fl(e, t, n, r, Wn);
}
function y0(e = {}, t = {}, n = [], r = !1) {
  return fl(e, t, n, r, cl);
}
function _0(e = {}, t = {}, n = [], r = !1) {
  return fl(e, t, n, r, dl);
}
async function v0(e = {}, t = Wn, n = {}) {
  const r = await fetch(t0, {
    method: "POST",
    headers: await lg(),
    body: JSON.stringify(m0(e, t)),
    signal: n.signal
  }), o = await r.text();
  let i = null;
  try {
    i = o ? JSON.parse(o) : {};
  } catch (u) {
    throw new Error(`酒馆后端模型列表拉取失败：${Fn(o, String(u?.message || u), r)}`);
  }
  if (!r.ok || i?.error) {
    const u = Fn(i?.message || i?.error?.message || o, `HTTP ${r.status}`, r);
    throw new Error(`酒馆后端模型列表拉取失败：${u}`);
  }
  const s = Array.isArray(i?.data) ? i.data.map((u) => String(u?.id || u?.name || "").trim()).filter(Boolean) : [];
  return [...new Set(s)];
}
async function hl(e = {}, t = {}) {
  const n = await oo(e, !1);
  typeof t.onRequest == "function" && t.onRequest(n);
  const r = await fetch(n.url, {
    method: n.method,
    headers: n.rawHeaders || n.headers,
    body: JSON.stringify(n.body),
    signal: t.signal
  }), o = await r.text();
  let i = null;
  try {
    i = o ? JSON.parse(o) : {};
  } catch (s) {
    const u = /* @__PURE__ */ new Error(`酒馆后端生成失败：${Fn(o, String(s?.message || s), r)}`);
    throw u.status = r.status, u.body = o, u;
  }
  if (!r.ok || i?.error) {
    const s = Fn(i?.error?.message || i?.message || o, `HTTP ${r.status}`, r), u = /* @__PURE__ */ new Error(`酒馆后端生成失败：${s}`);
    throw u.status = r.status, u.error = i?.error, u;
  }
  return i;
}
async function pl(e = {}, t, n = {}) {
  const r = await oo(e, !0);
  typeof n.onRequest == "function" && n.onRequest(r);
  const o = await fetch(r.url, {
    method: r.method,
    headers: r.rawHeaders || r.headers,
    body: JSON.stringify(r.body),
    signal: n.signal
  });
  if (!o.ok) {
    const i = await o.text().catch(() => ""), s = new Error(Fn(i, `酒馆后端流式生成失败：HTTP ${o.status}`, o));
    throw s.status = o.status, s.body = i, s;
  }
  typeof n.onResponseAccepted == "function" && n.onResponseAccepted(), await e0(o, (i) => {
    if (i?.error) {
      const s = Fn(i.error?.message || i.message || JSON.stringify(i.error), "酒馆后端流式生成失败");
      throw new Error(s);
    }
    t(i);
  });
}
function an(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function A0(e) {
  const t = String(e || "").trim();
  if (!t || t === "auto") return "auto";
  if (t === "required") return "any";
  if (t === "none") return "none";
  throw new Error(`酒馆托管 Claude 不支持 tool_choice：${t}。仅支持 auto/required/none。`);
}
function T0(e = {}, t = {}, n = ie("sillytavern-claude", e, t.reasoning)) {
  if (!(Array.isArray(t.tools) && t.tools.length > 0)) return {
    toolChoice: void 0,
    reasoningDisabledForForcedTool: !1
  };
  const r = A0(t.toolChoice), o = n.profileId === "sillytavern-claude-manual" || n.profileId === "sillytavern-claude-adaptive-conditional";
  return {
    toolChoice: r,
    reasoningDisabledForForcedTool: r === "any" && n.mode === "on" && o
  };
}
var S0 = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function Do(e = {}, t = {}, n = {}, r) {
  const o = r || ie("sillytavern-claude", e, t.reasoning);
  return n.reasoningDisabledForForcedTool ? {
    ...o,
    mode: "off",
    output: "hide"
  } : o;
}
function E0(e = {}, t = {}, n = {}) {
  return Ot(e, {
    reasoning: n,
    effort: n.mode === "on" ? n.effort : "",
    controlFields: t.controlFields || {}
  });
}
function C0(e = {}, t = {}) {
  return { toolChoice: String(t.toolChoice || "") };
}
function cg(e = "") {
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
function w0(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    if (!n) return null;
    const r = cg(t.function.arguments || "{}");
    return {
      type: "tool_use",
      id: String(t.id || n),
      name: n,
      input: r.input,
      ...r.ok ? {} : {
        invalidInputJson: r.raw,
        inputParseError: r.error
      }
    };
  }).filter(Boolean);
}
function I0(e = []) {
  const t = Array.isArray(e) ? an(e) : null;
  return Array.isArray(t) && t.length ? t : null;
}
function b0(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((o) => {
    if (!o || typeof o != "object") return;
    const i = an(o) || {}, s = I0(i?.providerPayload?.anthropicContent), u = w0(i.tool_calls);
    delete i.providerPayload, i.role === "assistant" && s && u.length ? (delete i.tool_calls, i.content = s.filter((c) => c?.type !== "tool_use").concat(u)) : i.role === "assistant" && s && (delete i.tool_calls, i.content = s), n.push(i);
  });
  const r = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return r.trim() && !(n[0]?.role === "system" && n[0]?.content === r) && n.unshift({
    role: "system",
    content: r
  }), n;
}
function P0(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    if (!t || typeof t != "object") return null;
    if (t.type === "text") return {
      type: "text",
      text: String(t.text || "")
    };
    if (t.type === "tool_use" && t.name) {
      if (t.inputJson !== void 0) {
        const r = cg(t.inputJson);
        return {
          type: "tool_use",
          id: String(t.id || t.name),
          name: String(t.name),
          input: r.input,
          ...r.ok ? {} : {
            invalidInputJson: r.raw,
            inputParseError: r.error
          }
        };
      }
      const n = an(t.input);
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
    } : an(t) || null;
  }).filter(Boolean);
}
function R0(e = []) {
  return e.map((t) => !t || typeof t != "object" ? null : t.type === "tool_use" && t.name ? {
    type: "tool_use",
    id: t.id,
    name: t.name,
    input: an(t.input) || {}
  } : an(t) || null).filter(Boolean);
}
function x0(e = []) {
  const t = Array.isArray(e) ? e : [], n = t.filter((i) => i?.type === "text").map((i) => i.text || "").join(`
`), r = t.filter((i) => i?.type === "thinking" || i?.type === "redacted_thinking").map((i) => ({
    label: i.type === "thinking" ? "思考块" : "已脱敏思考块",
    text: i.type === "thinking" ? i.thinking || "" : i.data || ""
  })).filter((i) => i.text), o = t.filter((i) => i?.type === "tool_use" && i.name).map((i, s) => ({
    id: i.id || `st-claude-tool-${s + 1}`,
    name: i.name,
    arguments: i.inputJson !== void 0 ? i.inputJson : JSON.stringify(i.input || {})
  }));
  return {
    text: n,
    thoughts: r,
    ...o.length ? {
      toolCalls: o,
      toolCallDraft: !0
    } : {}
  };
}
function dg(e = [], t = {}) {
  const n = P0(e), r = n.filter((o) => o.type === "tool_use" && o.name).map((o, i) => ({
    id: o.id || `st-claude-tool-${i + 1}`,
    name: o.name,
    arguments: o.invalidInputJson !== void 0 ? o.invalidInputJson : JSON.stringify(o.input || {})
  }));
  return {
    text: n.filter((o) => o.type === "text").map((o) => o.text || "").join(`
`),
    toolCalls: r,
    thoughts: t.includeReasoningOutput === !1 ? [] : n.filter((o) => o.type === "thinking" || o.type === "redacted_thinking").map((o) => ({
      label: o.type === "thinking" ? "思考块" : "已脱敏思考块",
      text: o.type === "thinking" ? o.thinking || "" : o.data || ""
    })).filter((o) => o.text),
    finishReason: t.finishReason || "stop",
    model: t.model || "",
    provider: "sillytavern-claude",
    providerPayload: n.length ? { anthropicContent: R0(n) } : void 0
  };
}
function M0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function N0(e, t, n = {}) {
  const r = [];
  let o = "stop", i = n.model || "";
  const s = (c, d = {}) => {
    const f = Number.isInteger(Number(c)) ? Number(c) : r.length;
    return r[f] ? r[f] = {
      ...r[f],
      ...d
    } : r[f] = { ...d }, r[f];
  }, u = () => {
    const c = x0(r);
    M0(e, {
      text: c.text,
      thoughts: Z(t) ? c.thoughts : [],
      ...Array.isArray(c.toolCalls) ? { toolCalls: c.toolCalls } : {},
      ...c.toolCallDraft ? { toolCallDraft: !0 } : {}
    });
  };
  return {
    accept(c = {}) {
      if (c?.message?.model && (i = c.message.model), c.type === "content_block_start") {
        s(c.index, an(c.content_block) || {}), u();
        return;
      }
      if (c.type === "content_block_delta") {
        const d = s(c.index), f = c.delta || {};
        f.type === "text_delta" ? (d.type = d.type || "text", d.text = `${d.text || ""}${f.text || ""}`) : f.type === "input_json_delta" ? (d.type = d.type || "tool_use", d.inputJson = `${d.inputJson || ""}${f.partial_json || ""}`) : f.type === "thinking_delta" ? (d.type = d.type || "thinking", d.thinking = `${d.thinking || ""}${f.thinking || ""}`) : f.type === "signature_delta" && (d.signature = `${d.signature || ""}${f.signature || ""}`), u();
        return;
      }
      c.type === "message_delta" && (o = c.delta?.stop_reason || o);
    },
    result() {
      return dg(r, {
        finishReason: o,
        model: i,
        includeReasoningOutput: Z(t)
      });
    }
  };
}
var k0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return b0(e);
  }
  resolveToolProtocol(e, t) {
    return T0(this.config, e, t);
  }
  buildPayload(e, t = this.resolveToolProtocol(e), n = Do(this.config, e, t)) {
    const r = typeof e.onStreamProgress == "function", o = this.buildMessages(e), i = {
      ...e,
      toolChoice: t.toolChoice,
      reasoning: n,
      temperature: Qr({
        ...this.config,
        provider: "sillytavern-claude"
      }, n) ? void 0 : e.temperature
    }, s = y0(this.config, i, o, r);
    return n.mode === "on" ? (s.reasoning_effort = n.effort, s.include_reasoning = Z(n)) : n.mode === "off" ? (s.reasoning_effort = "auto", s.include_reasoning = !1) : (s.reasoning_effort = "auto", s.include_reasoning = Z(n)), s;
  }
  async inspectRequest(e, t = {}) {
    const n = ie("sillytavern-claude", this.config, e.reasoning), r = t.protocol || this.resolveToolProtocol(e, n), o = t.effectiveReasoning || Do(this.config, e, r, n), i = await oo(t.payload || this.buildPayload(e, r, o), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(i, r, e, o);
  }
  buildRequestInspection(e, t = {}, n = {}, r = Do(this.config, n, t)) {
    const o = {
      ...Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {},
      ...Object.hasOwn(e?.body || {}, "include_reasoning") ? { include_reasoning: e.body.include_reasoning } : {}
    };
    return {
      provider: "sillytavern-claude",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: sn(e),
      effectiveConfig: {
        ...C0(n, t),
        ...E0(n, {
          ...t,
          controlFields: o
        }, r)
      },
      ...t.reasoningDisabledForForcedTool ? { notices: [S0] } : {}
    };
  }
  async chat(e) {
    const t = ie("sillytavern-claude", this.config, e.reasoning), n = typeof e.onStreamProgress == "function", r = this.resolveToolProtocol(e, t), o = Do(this.config, e, r, t), i = this.buildPayload(e, r, o);
    let s = null;
    const u = (c) => {
      s = this.buildRequestInspection(c, r, e, o);
    };
    try {
      if (n) {
        const d = N0(e, o, this.config);
        return await pl(i, (f) => {
          d.accept(f);
        }, {
          signal: e.signal,
          onRequest: u
        }), {
          ...d.result(),
          requestInspection: s
        };
      }
      const c = await hl(i, {
        signal: e.signal,
        onRequest: u
      });
      return {
        ...dg(Array.isArray(c?.content) ? c.content : [{
          type: "text",
          text: c?.choices?.[0]?.message?.content || ""
        }], {
          finishReason: c?.stop_reason || c?.choices?.[0]?.finish_reason || "stop",
          model: c?.model || this.config.model,
          includeReasoningOutput: Z(o)
        }),
        requestInspection: s
      };
    } catch (c) {
      throw s && c && typeof c == "object" && (c.requestInspection = s), c;
    }
  }
};
function ml(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function On(e) {
  if (typeof e == "string") return {
    role: "model",
    parts: e ? [{ text: e }] : []
  };
  if (!e || typeof e != "object") return {
    role: "model",
    parts: []
  };
  const t = ml(e) || {};
  return t.role = t.role || "model", t.parts = Array.isArray(t.parts) ? t.parts : [], t;
}
function D0(e) {
  const t = Array.isArray(e?.providerPayload?.googleContents) ? e.providerPayload.googleContents : [];
  if (t.length) return t.map((o) => On(o)).filter((o) => Array.isArray(o.parts) && o.parts.length);
  const n = e?.providerPayload?.googleContent, r = On(n);
  return r.parts.length ? [r] : [];
}
function $0(e = {}) {
  const t = String(e?.mimeType || "").trim(), n = String(e?.data || "").trim();
  if (!t || !n) return null;
  const r = `data:${t};base64,${n}`;
  return t.startsWith("image/") ? {
    type: "image_url",
    image_url: { url: r }
  } : t.startsWith("video/") ? {
    type: "video_url",
    video_url: { url: r }
  } : t.startsWith("audio/") ? {
    type: "audio_url",
    audio_url: { url: r }
  } : null;
}
function L0(e = {}, t = 0) {
  const n = On(e);
  if (!n.parts.length) return null;
  const r = {
    role: n.role === "user" ? "user" : "assistant",
    content: []
  }, o = n.parts.find((s) => !s?.thought && typeof s?.text == "string" && typeof s?.thoughtSignature == "string" && s.thoughtSignature)?.thoughtSignature || "", i = [];
  return n.parts.forEach((s) => {
    if (!s || typeof s != "object") return;
    if (!s.thought && typeof s.text == "string" && s.text) {
      r.content.push({
        type: "text",
        text: s.text
      });
      return;
    }
    if (s.functionCall?.name) {
      i.push({
        id: String(s.functionCall.id || `st-google-tool-${t + 1}-${i.length + 1}`),
        type: "function",
        function: {
          name: String(s.functionCall.name || ""),
          arguments: JSON.stringify(s.functionCall.args || {})
        },
        ...typeof s.thoughtSignature == "string" && s.thoughtSignature ? { signature: s.thoughtSignature } : {}
      });
      return;
    }
    const u = $0(s.inlineData);
    u && r.content.push(u);
  }), i.length && r.content.push({
    type: "tool_calls",
    tool_calls: i
  }), o && r.content.some((s) => s?.type === "text") && (r.signature = o), r.content.length ? r : null;
}
function U0(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((o) => {
    if (!o || typeof o != "object") return;
    const i = D0(o);
    if (o.role === "assistant" && i.length) {
      i.forEach((u, c) => {
        const d = L0(u, c);
        d && n.push(d);
      });
      return;
    }
    const s = ml(o) || {};
    delete s.providerPayload, n.push(s);
  });
  const r = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return r.trim() && !(n[0]?.role === "system" && n[0]?.content === r) && n.unshift({
    role: "system",
    content: r
  }), n;
}
function fg(e = {}) {
  return On(e?.responseContent || e?.candidates?.[0]?.content || "");
}
function hg(e = {}) {
  return (e.parts || []).filter((t) => !t?.thought && typeof t?.text == "string" && t.text).map((t) => t.text).join(`
`);
}
function pg(e = {}) {
  return (e.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function mg(e = {}) {
  return (e.parts || []).map((t) => t?.functionCall || null).filter((t) => t?.name).map((t, n) => ({
    id: t.id || `st-google-tool-${n + 1}`,
    name: t.name,
    arguments: JSON.stringify(t.args || {})
  }));
}
function F0(e, t) {
  const n = String(t || ""), r = String(e || "");
  return n ? !r || n.startsWith(r) ? n : r.endsWith(n) ? r : `${r}${n}` : r;
}
function O0(e = [], t = []) {
  const n = Array.isArray(e) ? [...e] : [];
  return t.forEach((r) => {
    const o = [
      r.id || "",
      r.name || "",
      r.arguments || ""
    ].join("\0");
    n.some((i) => [
      i.id || "",
      i.name || "",
      i.arguments || ""
    ].join("\0") === o) || n.push(r);
  }), n;
}
function gg(e) {
  const t = On(e);
  return t.parts.length ? {
    googleContent: t,
    googleContents: [t]
  } : void 0;
}
function q0(e = {}, t = {}) {
  const n = fg(e), r = e?.choices?.[0]?.message?.content || "";
  return {
    text: hg(n) || r,
    toolCalls: mg(n),
    thoughts: t.includeReasoningOutput === !1 ? [] : pg(n),
    finishReason: e?.candidates?.[0]?.finishReason || e?.choices?.[0]?.finish_reason || t.finishReason || "STOP",
    model: e?.model || e?.modelVersion || t.model || "",
    provider: "sillytavern-google",
    providerPayload: gg(n)
  };
}
function B0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function G0(e, t, n = {}) {
  let r = "", o = [], i = [], s = "STOP", u = n.model || "";
  const c = [];
  return {
    accept(d = {}) {
      u = d.model || d.modelVersion || u, s = d?.candidates?.[0]?.finishReason || s;
      const f = fg(d);
      f.parts.length && c.push(...ml(f.parts) || []), r = F0(r, hg(f)), o = O0(o, mg(f));
      const h = Z(t) ? pg(f) : [];
      h.length && (i = h), B0(e, {
        text: r,
        thoughts: i,
        ...o.length ? {
          toolCalls: o,
          toolCallDraft: !0
        } : {}
      });
    },
    result() {
      const d = On({
        role: "model",
        parts: c.length ? c : r ? [{ text: r }] : []
      });
      return {
        text: r,
        toolCalls: o,
        thoughts: i,
        finishReason: s,
        model: u,
        provider: "sillytavern-google",
        providerPayload: gg(d)
      };
    }
  };
}
var H0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return U0(e);
  }
  buildPayload(e, t = ie("sillytavern-google", this.config, e.reasoning)) {
    const n = t, r = typeof e.onStreamProgress == "function", o = this.buildMessages(e), i = _0(this.config, e, o, r);
    return n.mode === "on" ? (i.reasoning_effort = n.effort, i.include_reasoning = Z(n)) : n.mode === "off" ? (i.reasoning_effort = "min", i.include_reasoning = !1) : (i.reasoning_effort = "auto", i.include_reasoning = Z(n)), i;
  }
  async inspectRequest(e, t = {}) {
    const n = t.effectiveReasoning || ie("sillytavern-google", this.config, e.reasoning), r = await oo(t.payload || this.buildPayload(e, n), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(r, e, n);
  }
  buildRequestInspection(e, t = {}, n = ie("sillytavern-google", this.config, t.reasoning)) {
    const r = {
      ...Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {},
      ...Object.hasOwn(e?.body || {}, "include_reasoning") ? { include_reasoning: e.body.include_reasoning } : {}
    };
    return {
      provider: "sillytavern-google",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: sn(e),
      effectiveConfig: Ot(t, {
        reasoning: n,
        effort: e?.body?.reasoning_effort,
        controlFields: r
      })
    };
  }
  async chat(e) {
    const t = ie("sillytavern-google", this.config, e.reasoning), n = typeof e.onStreamProgress == "function", r = this.buildPayload(e, t);
    let o = null;
    const i = (s) => {
      o = this.buildRequestInspection(s, e, t);
    };
    try {
      if (n) {
        const s = G0(e, t, this.config);
        return await pl(r, (u) => {
          s.accept(u);
        }, {
          signal: e.signal,
          onRequest: i
        }), {
          ...s.result(),
          requestInspection: o
        };
      }
      return {
        ...q0(await hl(r, {
          signal: e.signal,
          onRequest: i
        }), {
          model: this.config.model,
          includeReasoningOutput: Z(t)
        }),
        requestInspection: o
      };
    } catch (s) {
      throw o && s && typeof s == "object" && (s.requestInspection = o), s;
    }
  }
};
function V0(e, t, n) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: Z(n) ? t.thoughts : [] } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function cs(e, t = []) {
  const n = Zt(e);
  return {
    thinkTagged: n,
    cleanedText: t.length ? n.cleaned : jt(n.cleaned)
  };
}
function J0(e) {
  const t = String(e?.message || e || "");
  return /Cannot read properties of null \(reading ['"]function['"]\)/i.test(t) || /reading ['"]function['"]/i.test(t) || /badresponsestatuscode/i.test(t);
}
var K0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0 ? aa(e, this.config.model) : sa(e, this.config.model);
  }
  buildPayload(e, t = !1, n = ie("sillytavern-openai-compatible", this.config, e.reasoning)) {
    const r = n, o = t ? aa(e, this.config.model) : sa(e, this.config.model), i = {
      ...e,
      temperature: Qr({
        ...this.config,
        provider: "sillytavern-openai-compatible"
      }, r) ? void 0 : e.temperature
    };
    return ng(g0(this.config, t ? {
      ...i,
      tools: void 0,
      toolChoice: void 0
    } : i, o, typeof e.onStreamProgress == "function"), r);
  }
  async inspectRequest(e, t = {}) {
    const n = t.effectiveReasoning || ie("sillytavern-openai-compatible", this.config, e.reasoning), r = await oo(t.payload || this.buildPayload(e, !!t.taggedMode, n), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(r, e, n);
  }
  buildRequestInspection(e, t = {}, n = ie("sillytavern-openai-compatible", this.config, t.reasoning)) {
    const r = {
      ...Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {},
      ...Object.hasOwn(e?.body || {}, "thinking") ? { thinking: e.body.thinking } : {}
    };
    return {
      provider: "sillytavern-openai-compatible",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: sn(e),
      effectiveConfig: Ot(t, {
        reasoning: n,
        effort: e?.body?.reasoning_effort,
        controlFields: r
      })
    };
  }
  async streamChat(e, t, n, r = {}) {
    const o = { role: "assistant" };
    let i = "stop", s = this.config.model;
    await pl(t, (p) => {
      s = p?.model || s;
      const m = p?.choices?.[0] || {};
      la(o, m), m.finish_reason && (i = m.finish_reason);
      const g = Nn(o), { thinkTagged: _, cleanedText: v } = cs(Mn(o), g), C = g.length ? g : oa(_.cleaned);
      V0(e, {
        text: v,
        thoughts: Z(n) ? Lt(o, m).concat(_.thoughts) : [],
        ...C.length ? { toolCalls: C } : {},
        ...!g.length && C.length ? { toolCallDraft: !0 } : {}
      }, n);
    }, {
      signal: e.signal,
      onRequest: r.onRequest,
      onResponseAccepted: r.onResponseAccepted
    }), kn(o);
    const u = Nn(o), { thinkTagged: c, cleanedText: d } = cs(Mn(o), u), f = Lt(o, {});
    c.thoughts.forEach((p) => f.push(p));
    const h = u.length ? [] : $r(c.cleaned);
    return {
      text: d,
      toolCalls: [...u, ...h],
      thoughts: Z(n) ? f : [],
      finishReason: i,
      model: s,
      provider: "sillytavern-openai-compatible",
      providerPayload: Lr(o)
    };
  }
  async nonStreamingChat(e, t, n, r = {}) {
    const o = await hl(t, {
      signal: e.signal,
      onRequest: r.onRequest
    }), i = o.choices?.[0] || {}, s = i.message || {};
    kn(s);
    const u = Lt(s, i), c = sl(s.tool_calls || []), { thinkTagged: d, cleanedText: f } = cs(al(s.content), c);
    d.thoughts.forEach((m) => u.push(m));
    const h = c.length ? [] : $r(d.cleaned), p = fi(s, i);
    return {
      text: f,
      toolCalls: [...c, ...h],
      thoughts: Z(n) ? u : [],
      finishReason: i.finish_reason || "stop",
      model: o.model || this.config.model,
      provider: "sillytavern-openai-compatible",
      providerPayload: Lr(p)
    };
  }
  async chat(e) {
    const t = ie("sillytavern-openai-compatible", this.config, e.reasoning), n = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, r = Array.isArray(e.tools) && e.tools.length > 0, o = async (s, u = {}) => {
      let c = null;
      const d = (f) => {
        c = this.buildRequestInspection(f, e, t);
      };
      try {
        return {
          ...typeof e.onStreamProgress == "function" ? await this.streamChat(e, s, t, {
            onRequest: d,
            onResponseAccepted: u.onResponseAccepted
          }) : await this.nonStreamingChat(e, s, t, { onRequest: d }),
          requestInspection: c
        };
      } catch (f) {
        throw c && f && typeof f == "object" && (f.requestInspection = c), f;
      }
    }, i = this.buildPayload(e, n, t);
    try {
      return await o(i);
    } catch (s) {
      if (e.allowToolProtocolFallback === !1 || n || !r || !J0(s)) throw s;
    }
    return typeof e.onToolProtocolFallback == "function" && e.onToolProtocolFallback({
      provider: "sillytavern-openai-compatible",
      fromToolMode: "native",
      toToolMode: "tagged-json",
      reason: "malformed_native_tool_host_error"
    }), await o(this.buildPayload(e, !0, t));
  }
}, Ld = 900 * 1e3, Ud = Object.freeze([{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}]), W0 = Object.freeze([
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
function z0(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function Ve(e, t = 1) {
  const n = typeof e == "string" && !e.trim() ? t : e, r = Number(n);
  return Number.isFinite(r) ? Math.max(0, Math.min(2, r)) : Ve(t, 1);
}
function Un(e = {}) {
  return e.sendTemperature !== !1;
}
function Fd(e = {}) {
  return Un(e) ? Ve(e.temperature, 1) : void 0;
}
function Od(e = "", t = {}) {
  return t && typeof t == "object" && t[e] ? t[e] : W0.find((n) => n.value === e)?.label || e || "未配置";
}
function Y0(e = {}, t = {}) {
  const n = hs(e || {});
  if (t.role === "delegate" && n.delegateConfig) {
    const d = n.delegateConfig.provider || "openai-compatible", f = (n.delegateConfig.modelConfigs || wn())[d] || wn()[d] || {}, h = {
      provider: d,
      baseUrl: String(f.baseUrl || ""),
      model: String(f.model || ""),
      maxTokens: ce(f.maxTokens)
    };
    return {
      currentPresetName: String(n.delegatePresetName || n.currentPresetName || ""),
      provider: d,
      baseUrl: String(f.baseUrl || ""),
      model: String(f.model || ""),
      apiKey: String(f.apiKey || ""),
      tavilyApiKey: ds(n.tavilyApiKey),
      tavilyBaseUrl: Qe(n.tavilyBaseUrl),
      temperature: Fd(f),
      sendTemperature: Un(f),
      maxTokens: ce(f.maxTokens),
      timeoutMs: Number(t.timeoutMs) || 9e5,
      toolMode: f.toolMode || "native",
      reasoning: en(h, f.reasoning)
    };
  }
  const r = oe(t.presetName || (t.role === "delegate" ? n.delegatePresetName : n.currentPresetName) || "默认"), o = n.presets?.[r] ? r : n.presets?.[n.currentPresetName] ? n.currentPresetName : yi, i = n.presets?.[o] || Me(), s = i.provider || n.provider || "openai-compatible", u = (i.modelConfigs || n.modelConfigs || wn())[s] || wn()[s] || {}, c = {
    provider: s,
    baseUrl: String(u.baseUrl || ""),
    model: String(u.model || ""),
    maxTokens: ce(u.maxTokens)
  };
  return {
    currentPresetName: String(o || ""),
    provider: s,
    baseUrl: String(u.baseUrl || ""),
    model: String(u.model || ""),
    apiKey: String(u.apiKey || ""),
    tavilyApiKey: ds(n.tavilyApiKey),
    tavilyBaseUrl: Qe(n.tavilyBaseUrl),
    temperature: Fd(u),
    sendTemperature: Un(u),
    maxTokens: ce(u.maxTokens),
    timeoutMs: Number(t.timeoutMs) || 9e5,
    toolMode: u.toolMode || "native",
    reasoning: en(c, u.reasoning)
  };
}
function X0(e = {}, t = {}) {
  if (!e.apiKey && !z0(e.provider)) throw new Error(t.missingApiKeyMessage || "请先填写当前模型配置的 API Key。");
  switch (Qf(e.reasoning || {}), e.provider) {
    case "sillytavern-openai-compatible":
      return new K0(e);
    case "sillytavern-claude":
      return new k0(e);
    case "sillytavern-google":
      return new H0(e);
    case "openai-responses":
      return new jb(e);
    case "anthropic":
      return new i_(e);
    case "google":
      return new rI(e);
    default:
      return new Gb(e);
  }
}
var Q0 = { chat: { exclude: [
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
] } }, Z0 = Object.freeze([
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
function dt(e, t, n = "") {
  if (e.replaceChildren(), n) {
    const r = document.createElement("option");
    r.value = "", r.textContent = n, e.appendChild(r);
  }
  t.forEach((r) => {
    const o = document.createElement("option");
    o.value = r.value, o.textContent = r.label, o.disabled = r.disabled === !0, e.appendChild(o);
  });
}
function $o(e = "", t = {}) {
  const n = on(t.reasoning), r = Xr({
    provider: e,
    baseUrl: t.baseUrl,
    model: t.model
  }), o = {
    reasoningMode: n.mode,
    reasoningEffort: "",
    reasoningBudgetTokens: void 0
  };
  if (r.intensity.kind === "effort") o.reasoningEffort = r.intensity.values.includes(n.effort) ? n.effort : r.intensity.defaultValue;
  else if (r.intensity.kind === "budget") {
    const i = n.budgetTokens, s = r.intensity.allowAuto && i === -1, u = Number.isInteger(i) && i >= r.intensity.min && i <= r.intensity.max;
    o.reasoningBudgetTokens = s || u ? i : r.intensity.defaultValue;
  }
  return o;
}
function qd(e = {}) {
  return on(e);
}
function Hr(e = []) {
  const t = [...new Set(e.filter(Boolean).map((o) => String(o).trim()).filter(Boolean))], n = Q0.chat, r = t.filter((o) => {
    const i = o.toLowerCase();
    return !n.exclude.some((s) => i.includes(s));
  });
  return r.length ? r : t;
}
function Lo(e = "") {
  return e === "delegate" ? "delegate" : "main";
}
function qn(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function j0(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function vn(e = "") {
  return e === "openai-compatible" || e === "sillytavern-openai-compatible";
}
function eP(e = "") {
  return e === "anthropic" || e === "sillytavern-claude";
}
function tP(e = "") {
  return e === "sillytavern-claude" ? cl : e === "sillytavern-google" ? dl : Wn;
}
function Vr(e = []) {
  return [...new Set(e.filter(Boolean).map((t) => String(t).trim()).filter(Boolean))];
}
function nP(e) {
  const t = qn(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return Vr([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return Vr([`${t}/v1/models`, `${t}/models`]);
}
function yg(e) {
  const t = qn(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return Vr([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return Vr([`${t}/v1/models`, `${t}/models`]);
}
function rP(e, t) {
  const n = qn(e);
  if (!n) return [];
  const r = n.endsWith("/v1beta") ? n.slice(0, -7) : n;
  return Vr([
    `${n}/models?key=${encodeURIComponent(t)}`,
    `${n}/models`,
    `${r}/v1beta/models?key=${encodeURIComponent(t)}`,
    `${r}/v1beta/models`,
    `${r}/models?key=${encodeURIComponent(t)}`,
    `${r}/models`
  ]);
}
function oP(e, t) {
  const n = [
    e?.error?.message,
    e?.message,
    e?.detail,
    e?.details,
    e?.error
  ].find((r) => typeof r == "string" && r.trim());
  return n ? n.trim() : String(t || "").trim().slice(0, 160);
}
async function iP(e, t = {}) {
  const n = await fetch(e, t), r = await n.text();
  let o = null, i = null;
  try {
    o = r ? JSON.parse(r) : {};
  } catch (s) {
    i = s;
  }
  return {
    ok: n.ok,
    status: n.status,
    url: e,
    data: o,
    rawText: r,
    parseError: i,
    errorSnippet: oP(o, r)
  };
}
function sP(e) {
  return Hr((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function _g(e) {
  return Hr((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function aP(e) {
  return Hr((e?.models || e?.data || []).map((t) => String(t?.id || t?.name || "")).map((t) => t.split("/").pop() || "").filter(Boolean));
}
async function Qo({ urls: e, requestOptionsList: t, extractModels: n, providerLabel: r }) {
  let o = null;
  for (const i of e) for (const s of t) {
    const u = await iP(i, s);
    if (!u.ok) {
      o = u;
      continue;
    }
    if (u.parseError) {
      o = {
        ...u,
        errorSnippet: "返回的不是 JSON"
      };
      continue;
    }
    const c = n(u.data);
    if (c.length) return c;
    o = {
      ...u,
      errorSnippet: "返回成功，但模型列表为空"
    };
  }
  if (o) {
    const i = o.url ? ` (${o.url})` : "", s = o.errorSnippet ? `：${o.errorSnippet}` : "";
    throw new Error(`${r} 拉取模型失败：${o.status || "unknown"}${s}${i}`);
  }
  throw new Error(`${r} 拉取模型失败：未获取到模型列表。`);
}
async function lP(e) {
  const t = String(e.apiKey || "").trim(), n = qn(e.baseUrl || ""), r = qn(n || ag.claude);
  if (t && r) try {
    return await Qo({
      urls: yg(r),
      requestOptionsList: [{ headers: {
        "x-api-key": t,
        "anthropic-version": "2023-06-01",
        Accept: "application/json"
      } }],
      extractModels: _g,
      providerLabel: "Anthropic"
    });
  } catch (o) {
    if (n) throw o;
  }
  return [...Z0];
}
async function Bd(e) {
  const t = e.provider, n = qn(e.baseUrl || ""), r = String(e.apiKey || "").trim();
  if (t === "sillytavern-claude") return Hr(await lP(e));
  if (j0(t)) return Hr(await v0(e, tP(t)));
  if (!r) throw new Error("请先填写 API Key。");
  if (!n) throw new Error("请先填写 Base URL。");
  return t === "google" ? await Qo({
    urls: rP(n, r),
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
    extractModels: aP,
    providerLabel: "Google AI"
  }) : eP(t) ? await Qo({
    urls: yg(n),
    requestOptionsList: [{ headers: {
      "x-api-key": r,
      "anthropic-version": "2023-06-01",
      Accept: "application/json"
    } }],
    extractModels: _g,
    providerLabel: "Anthropic"
  }) : await Qo({
    urls: nP(n),
    requestOptionsList: [{ headers: {
      Authorization: `Bearer ${r}`,
      Accept: "application/json"
    } }],
    extractModels: sP,
    providerLabel: t === "openai-responses" ? "OpenAI Responses" : "OpenAI-Compatible"
  });
}
function uP(e) {
  return e instanceof Error ? e.message : String(e || "unknown_error");
}
function gP(e = {}) {
  const { state: t, render: n, showToast: r, createRequestId: o = (y = "req") => `${y}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, saveConfig: i, reloadConfig: s, describeError: u = uP, getRuntimeSummaryText: c } = e;
  function d() {
    t.configFormSyncPending = !0;
  }
  function f(y, I = "main") {
    const S = String(y || "").trim() || "openai-compatible";
    return I === "delegate" ? `delegate:${S}` : S;
  }
  function h(y, I = "main") {
    return t.pullStateByProvider?.[f(y, I)] || {
      status: "idle",
      message: ""
    };
  }
  function p(y, I, S = "main") {
    t.pullStateByProvider = {
      ...t.pullStateByProvider || {},
      [f(y, S)]: I
    };
  }
  function m(y, I, S = "main") {
    t.modelOptionsByProvider = {
      ...t.modelOptionsByProvider || {},
      [f(y, S)]: Array.isArray(I) ? I : []
    };
  }
  function g(y, I = "main") {
    const S = f(y, I);
    return Array.isArray(t.modelOptionsByProvider?.[S]) ? t.modelOptionsByProvider[S] : [];
  }
  function _(y, I) {
    const S = t.config?.presets || {}, M = oe(y || I || "默认");
    return S[M] ? M : I && S[I] ? I : Object.keys(S)[0] || "默认";
  }
  function v(y, I) {
    const S = _(y, yi), M = I && typeof I == "object" ? I : Me(), B = M.provider || "openai-compatible", le = Je(M.modelConfigs || {}), j = le[B] || {}, ye = $o(B, j);
    return {
      delegatePresetName: S,
      delegateProvider: B,
      delegateModelConfigs: le,
      delegateBaseUrl: String(j.baseUrl || ""),
      delegateModel: String(j.model || ""),
      delegateApiKey: String(j.apiKey || ""),
      delegateTemperature: Ve(j.temperature, 1),
      delegateMaxTokens: ce(j.maxTokens),
      delegateSendTemperature: Un(j),
      delegateReasoningMode: ye.reasoningMode,
      delegateReasoningEffort: ye.reasoningEffort,
      delegateReasoningBudgetTokens: ye.reasoningBudgetTokens,
      delegateToolMode: j.toolMode || "native"
    };
  }
  function C(y = "openai-compatible", I = {}) {
    const S = Je(I || {})[y] || {}, M = $o(y, S);
    return {
      baseUrl: String(S.baseUrl || ""),
      model: String(S.model || ""),
      apiKey: String(S.apiKey || ""),
      temperature: Ve(S.temperature, 1),
      maxTokens: ce(S.maxTokens),
      sendTemperature: Un(S),
      ...M,
      toolMode: S.toolMode || "native"
    };
  }
  function b(y = "openai-compatible", I = {}) {
    const S = Je(I || {})[y] || {}, M = $o(y, S);
    return {
      delegateBaseUrl: String(S.baseUrl || ""),
      delegateModel: String(S.model || ""),
      delegateApiKey: String(S.apiKey || ""),
      delegateTemperature: Ve(S.temperature, 1),
      delegateMaxTokens: ce(S.maxTokens),
      delegateSendTemperature: Un(S),
      delegateReasoningMode: M.reasoningMode,
      delegateReasoningEffort: M.reasoningEffort,
      delegateReasoningBudgetTokens: M.reasoningBudgetTokens,
      delegateToolMode: S.toolMode || "native"
    };
  }
  function P(y, I, S = t.config) {
    const M = oe(y || "默认"), B = I && typeof I == "object" ? I : Me(), le = B.provider || "openai-compatible", j = Je(B.modelConfigs || {}), ye = C(le, j), _e = _(S?.delegatePresetName, M), ue = v(_e, S?.delegateConfig && typeof S.delegateConfig == "object" ? S.delegateConfig : (S?.presets || {})[_e] || B);
    return {
      currentPresetName: M,
      presetDraftName: M,
      provider: le,
      modelConfigs: j,
      ...ye,
      tavilyApiKey: String(S?.tavilyApiKey || ""),
      tavilyBaseUrl: Qe(S?.tavilyBaseUrl || "https://api.tavily.com"),
      permissionMode: In(B.permissionMode),
      jsApiPermission: St(S?.jsApiPermission),
      ...ue
    };
  }
  function R() {
    if (t.configDraft) return t.configDraft;
    const y = oe(t.config?.currentPresetName || "默认");
    return t.configDraft = P(y, (t.config?.presets || {})[y] || Me()), t.configDraft;
  }
  function D(y, I = {}) {
    const S = R(), M = I.provider || y.querySelector("#xb-assistant-provider")?.value || S.provider || "openai-compatible", B = I.delegateProvider || y.querySelector("#xb-assistant-delegate-provider")?.value || S.delegateProvider || "openai-compatible", le = y.querySelector("#xb-assistant-base-url")?.value.trim() || "", j = y.querySelector("#xb-assistant-model")?.value.trim() || "", ye = y.querySelector("#xb-assistant-delegate-base-url")?.value.trim() ?? S.delegateBaseUrl ?? "", _e = y.querySelector("#xb-assistant-delegate-model")?.value.trim() ?? S.delegateModel ?? "", ue = qd({
      mode: y.querySelector("#xb-assistant-reasoning-mode")?.value || S.reasoningMode,
      effort: y.querySelector("#xb-assistant-reasoning-effort")?.value || S.reasoningEffort,
      budgetTokens: y.querySelector("#xb-assistant-reasoning-budget")?.value ?? S.reasoningBudgetTokens
    }), Pt = qd({
      mode: y.querySelector("#xb-assistant-delegate-reasoning-mode")?.value || S.delegateReasoningMode,
      effort: y.querySelector("#xb-assistant-delegate-reasoning-effort")?.value || S.delegateReasoningEffort,
      budgetTokens: y.querySelector("#xb-assistant-delegate-reasoning-budget")?.value ?? S.delegateReasoningBudgetTokens
    }), ve = {
      baseUrl: le,
      model: j,
      apiKey: y.querySelector("#xb-assistant-api-key")?.value.trim() || "",
      temperature: Ve(y.querySelector("#xb-assistant-temperature")?.value, S.temperature ?? 1),
      maxTokens: ce(y.querySelector("#xb-assistant-max-tokens")?.value, S.maxTokens),
      sendTemperature: y.querySelector("#xb-assistant-send-temperature")?.checked ?? !!(S.sendTemperature ?? !0),
      reasoning: ue,
      toolMode: vn(M) ? y.querySelector("#xb-assistant-tool-mode")?.value || S.toolMode || "native" : void 0
    }, Ie = {
      baseUrl: ye,
      model: _e,
      apiKey: y.querySelector("#xb-assistant-delegate-api-key")?.value.trim() ?? S.delegateApiKey ?? "",
      temperature: Ve(y.querySelector("#xb-assistant-delegate-temperature")?.value, S.delegateTemperature ?? 1),
      maxTokens: ce(y.querySelector("#xb-assistant-delegate-max-tokens")?.value, S.delegateMaxTokens),
      sendTemperature: y.querySelector("#xb-assistant-delegate-send-temperature")?.checked ?? !!(S.delegateSendTemperature ?? !0),
      reasoning: Pt,
      toolMode: vn(B) ? y.querySelector("#xb-assistant-delegate-tool-mode")?.value || S.delegateToolMode || "native" : void 0
    }, Gt = {
      ...Je(S.modelConfigs || {}),
      [M]: {
        ...Je(S.modelConfigs || {})[M] || {},
        ...ve
      }
    }, mt = {
      ...Je(S.delegateModelConfigs || {}),
      [B]: {
        ...Je(S.delegateModelConfigs || {})[B] || {},
        ...Ie
      }
    };
    return {
      ...S,
      currentPresetName: S.currentPresetName,
      presetDraftName: oe(y.querySelector("#xb-assistant-preset-name")?.value),
      provider: M,
      modelConfigs: Gt,
      baseUrl: ve.baseUrl,
      model: ve.model,
      apiKey: ve.apiKey,
      temperature: ve.temperature,
      maxTokens: ve.maxTokens,
      sendTemperature: ve.sendTemperature,
      reasoningMode: ve.reasoning.mode,
      reasoningEffort: ve.reasoning.effort || "",
      reasoningBudgetTokens: ve.reasoning.budgetTokens,
      toolMode: ve.toolMode || S.toolMode || "native",
      tavilyApiKey: y.querySelector("#xb-assistant-tavily-api-key")?.value.trim() || "",
      tavilyBaseUrl: Qe(S.tavilyBaseUrl || "https://api.tavily.com"),
      permissionMode: In(y.querySelector("#xb-assistant-permission-mode")?.value || S.permissionMode),
      jsApiPermission: St(y.querySelector("#xb-assistant-jsapi-permission")?.value || S.jsApiPermission),
      delegatePresetName: _(y.querySelector("#xb-assistant-delegate-preset-select")?.value || S.delegatePresetName, S.currentPresetName),
      delegateProvider: B,
      delegateModelConfigs: mt,
      delegateBaseUrl: Ie.baseUrl,
      delegateModel: Ie.model,
      delegateApiKey: Ie.apiKey,
      delegateTemperature: Ie.temperature,
      delegateMaxTokens: Ie.maxTokens,
      delegateSendTemperature: Ie.sendTemperature,
      delegateReasoningMode: Ie.reasoning.mode,
      delegateReasoningEffort: Ie.reasoning.effort || "",
      delegateReasoningBudgetTokens: Ie.reasoning.budgetTokens,
      delegateToolMode: Ie.toolMode || S.delegateToolMode || "native"
    };
  }
  function A(y, I = {}) {
    return t.configDraft = D(y, I), t.configDirty = !0, t.configDraft;
  }
  function U(y = R()) {
    return {
      baseUrl: String(y.baseUrl || ""),
      model: String(y.model || ""),
      apiKey: String(y.apiKey || ""),
      temperature: Ve(y.temperature, 1),
      maxTokens: ce(y.maxTokens),
      sendTemperature: !!(y.sendTemperature ?? !0),
      reasoning: on({
        mode: y.reasoningMode,
        effort: y.reasoningEffort,
        budgetTokens: y.reasoningBudgetTokens
      }),
      toolMode: vn(y.provider) ? y.toolMode || "native" : void 0
    };
  }
  function x(y = R()) {
    return {
      baseUrl: String(y.delegateBaseUrl || ""),
      model: String(y.delegateModel || ""),
      apiKey: String(y.delegateApiKey || ""),
      temperature: Ve(y.delegateTemperature, 1),
      maxTokens: ce(y.delegateMaxTokens),
      sendTemperature: !!(y.delegateSendTemperature ?? !0),
      reasoning: on({
        mode: y.delegateReasoningMode,
        effort: y.delegateReasoningEffort,
        budgetTokens: y.delegateReasoningBudgetTokens
      }),
      toolMode: vn(y.delegateProvider) ? y.delegateToolMode || "native" : void 0
    };
  }
  function $(y = R()) {
    const I = y.delegateProvider || "openai-compatible", S = Je(y.delegateModelConfigs || {});
    return {
      provider: I,
      modelConfigs: {
        ...S,
        [I]: {
          ...S[I] || {},
          ...x(y)
        }
      }
    };
  }
  function H(y = R()) {
    return {
      provider: y.provider || "openai-compatible",
      baseUrl: y.baseUrl || "",
      model: y.model || "",
      apiKey: y.apiKey || "",
      tavilyApiKey: y.tavilyApiKey || "",
      tavilyBaseUrl: Qe(y.tavilyBaseUrl || "https://api.tavily.com"),
      temperature: y.sendTemperature === !1 ? void 0 : Ve(y.temperature, 1),
      sendTemperature: !!(y.sendTemperature ?? !0),
      maxTokens: ce(y.maxTokens),
      timeoutMs: Ld,
      toolMode: y.toolMode || "native",
      reasoning: en({
        provider: y.provider,
        baseUrl: y.baseUrl,
        model: y.model,
        maxTokens: ce(y.maxTokens)
      }, {
        mode: y.reasoningMode,
        effort: y.reasoningEffort,
        budgetTokens: y.reasoningBudgetTokens
      })
    };
  }
  function z(y = R()) {
    return {
      provider: y.delegateProvider || "openai-compatible",
      baseUrl: y.delegateBaseUrl || "",
      model: y.delegateModel || "",
      apiKey: y.delegateApiKey || "",
      tavilyApiKey: y.tavilyApiKey || "",
      tavilyBaseUrl: Qe(y.tavilyBaseUrl || "https://api.tavily.com"),
      temperature: y.delegateSendTemperature === !1 ? void 0 : Ve(y.delegateTemperature, 1),
      sendTemperature: !!(y.delegateSendTemperature ?? !0),
      maxTokens: ce(y.delegateMaxTokens),
      timeoutMs: Ld,
      toolMode: y.delegateToolMode || "native",
      reasoning: en({
        provider: y.delegateProvider,
        baseUrl: y.delegateBaseUrl,
        model: y.delegateModel,
        maxTokens: ce(y.delegateMaxTokens)
      }, {
        mode: y.delegateReasoningMode,
        effort: y.delegateReasoningEffort,
        budgetTokens: y.delegateReasoningBudgetTokens
      })
    };
  }
  function ge(y = {}) {
    const I = [];
    Object.entries(y.presets || {}).forEach(([le, j]) => {
      const ye = j?.provider || "openai-compatible", _e = j?.modelConfigs?.[ye] || {}, ue = en({
        provider: ye,
        baseUrl: _e.baseUrl,
        model: _e.model,
        maxTokens: ce(_e.maxTokens)
      }, _e.reasoning);
      ue.valid === !1 && I.push(`预设“${le}”：${ue.error}`);
    });
    const S = y.delegateConfig?.provider || "openai-compatible", M = y.delegateConfig?.modelConfigs?.[S] || {}, B = en({
      provider: S,
      baseUrl: M.baseUrl,
      model: M.model,
      maxTokens: ce(M.maxTokens)
    }, M.reasoning);
    return B.valid === !1 && I.push(`分身模型：${B.error}`), I;
  }
  function se(y = {}) {
    const I = (y.role === "delegate", R());
    return y.role === "delegate" ? z(I) : H(I);
  }
  function X(y) {
    R(), t.configDraft = {
      ...t.configDraft,
      presetDraftName: oe(y.querySelector("#xb-assistant-preset-name")?.value)
    };
  }
  function Q(y = R(), I = y.provider || "openai-compatible", S = "main") {
    const M = h(I, S);
    return typeof c == "function" ? c({
      state: t,
      draft: y,
      provider: I,
      pullState: M,
      providerLabel: Od(I)
    }) : `预设「${y.currentPresetName || "默认"}」 · ${Od(I)}`;
  }
  function Se(y, I, S) {
    const M = y?.querySelector?.(I);
    if (!M) return;
    const B = String(S?.status || "idle"), le = String(S?.message || "").trim();
    M.textContent = le, M.hidden = !le, M.classList.toggle("is-loading", B === "loading"), M.classList.toggle("is-success", B === "success"), M.classList.toggle("is-error", B === "error");
  }
  function Ue(y) {
    if (!y) return;
    const I = Lo(t.configPage);
    t.configPage = I, y.querySelectorAll("[data-config-page]").forEach((S) => {
      const M = Lo(S?.dataset?.configPage) === I;
      S.classList.toggle("is-active", M), S.setAttribute("aria-selected", M ? "true" : "false");
    }), y.querySelectorAll("[data-config-page-panel]").forEach((S) => {
      const M = Lo(S?.dataset?.configPagePanel) === I;
      S.toggleAttribute("hidden", !M);
    }), y.querySelector("#xb-assistant-delete-preset")?.toggleAttribute("hidden", I === "delegate");
  }
  function re(y, I = "main") {
    const S = R(), M = I === "delegate", B = M ? "#xb-assistant-delegate-reasoning" : "#xb-assistant-reasoning", le = M ? S.delegateProvider : S.provider, j = M ? S.delegateBaseUrl : S.baseUrl, ye = M ? S.delegateModel : S.model, _e = {
      mode: M ? S.delegateReasoningMode : S.reasoningMode,
      effort: M ? S.delegateReasoningEffort : S.reasoningEffort,
      budgetTokens: M ? S.delegateReasoningBudgetTokens : S.reasoningBudgetTokens
    }, ue = Xr({
      provider: le,
      baseUrl: j,
      model: ye
    }), Pt = $o(le, {
      baseUrl: j,
      model: ye,
      reasoning: _e
    }), ve = Pt.reasoningMode, Ie = Pt.reasoningEffort, Gt = Pt.reasoningBudgetTokens, mt = y.querySelector(`${B}-mode`), cn = y.querySelector(`${B}-capability`), dn = y.querySelector(`${B}-effort-wrap`), fn = y.querySelector(`${B}-effort`), hn = y.querySelector(`${B}-budget-wrap`), Ht = y.querySelector(`${B}-budget`);
    mt && (dt(mt, Ky(ue)), mt.value = ve), cn && (cn.textContent = ue.unsupportedReason || `能力配置：${ue.profileId}`), fn && (dt(fn, Wy(ue)), fn.value = Ie), dn && (dn.style.display = ve === "on" && ue.intensity.kind === "effort" ? "" : "none"), Ht && ue.intensity.kind === "budget" && (Ht.min = ue.intensity.allowAuto ? "-1" : String(ue.intensity.min), Ht.max = String(ue.intensity.max), Ht.value = String(Gt)), hn && (hn.style.display = ve === "on" && ue.intensity.kind === "budget" ? "" : "none");
  }
  function ae(y) {
    const I = y.querySelector("#xb-assistant-runtime");
    if (!I) return;
    const S = R(), M = t.configPage === "delegate", B = M ? S.delegateProvider : S.provider;
    I.textContent = Q(M ? {
      ...S,
      currentPresetName: "分身",
      provider: B
    } : S, B || "openai-compatible", M ? "delegate" : "main");
  }
  function un(y) {
    if (!t.config) return;
    Ue(y);
    const I = R(), S = I.provider || "openai-compatible", M = g(S), B = I.delegateProvider || "openai-compatible", le = g(B, "delegate"), j = y.querySelector("#xb-assistant-provider"), ye = y.querySelector("#xb-assistant-base-url"), _e = y.querySelector("#xb-assistant-model"), ue = y.querySelector("#xb-assistant-api-key"), Pt = y.querySelector("#xb-assistant-temperature"), ve = y.querySelector("#xb-assistant-send-temperature"), Ie = y.querySelector("#xb-assistant-tool-mode-wrap"), Gt = y.querySelector("#xb-assistant-tool-mode"), mt = y.querySelector("#xb-assistant-permission-mode"), cn = y.querySelector("#xb-assistant-jsapi-permission"), dn = y.querySelector("#xb-assistant-model-pulled"), fn = y.querySelector("#xb-assistant-max-tokens"), hn = y.querySelector("#xb-assistant-preset-select"), Ht = y.querySelector("#xb-assistant-preset-name"), Fi = y.querySelector("#xb-assistant-delegate-preset-select"), _l = y.querySelector("#xb-assistant-delegate-provider"), vl = y.querySelector("#xb-assistant-delegate-base-url"), Al = y.querySelector("#xb-assistant-delegate-model"), Tl = y.querySelector("#xb-assistant-delegate-api-key"), Sl = y.querySelector("#xb-assistant-tavily-api-key"), Oi = y.querySelector("#xb-assistant-delegate-model-pulled"), El = y.querySelector("#xb-assistant-delegate-max-tokens"), Cl = y.querySelector("#xb-assistant-delegate-tool-mode-wrap"), qi = y.querySelector("#xb-assistant-delegate-tool-mode");
    if (!hn || !Ht) return;
    const wl = (t.config.presetNames || []).map((Rt) => ({
      value: Rt,
      label: Rt
    }));
    dt(hn, wl), hn.value = I.currentPresetName || t.config.currentPresetName || "默认", Fi && (dt(Fi, wl), Fi.value = _(I.delegatePresetName, I.currentPresetName)), Ht.value = I.presetDraftName || I.currentPresetName || "默认", j && (j.value = S), ye && (ye.value = I.baseUrl || ""), _e && (_e.value = I.model || ""), ue && (ue.value = I.apiKey || ""), fn && (fn.value = String(ce(I.maxTokens))), Pt && (Pt.value = String(Ve(I.temperature, 1))), ve && (ve.checked = !!(I.sendTemperature ?? !0)), Sl && (Sl.value = I.tavilyApiKey || ""), Ie && (Ie.style.display = vn(S) ? "" : "none"), Gt && (dt(Gt, Ud), Gt.value = I.toolMode || "native"), mt && (dt(mt, Ug), mt.value = In(I.permissionMode)), cn && (dt(cn, Fg), cn.value = St(I.jsApiPermission)), re(y), dn && (dt(dn, M.map((Rt) => ({
      value: Rt,
      label: Rt
    })), "手动填写"), dn.value = M.includes(I.model) ? I.model : ""), _l && (_l.value = B), vl && (vl.value = I.delegateBaseUrl || ""), Al && (Al.value = I.delegateModel || ""), Tl && (Tl.value = I.delegateApiKey || "");
    const Il = y.querySelector("#xb-assistant-delegate-temperature"), bl = y.querySelector("#xb-assistant-delegate-send-temperature");
    El && (El.value = String(ce(I.delegateMaxTokens))), Il && (Il.value = String(Ve(I.delegateTemperature, 1))), bl && (bl.checked = !!(I.delegateSendTemperature ?? !0)), Cl && (Cl.style.display = vn(B) ? "" : "none"), qi && (dt(qi, Ud), qi.value = I.delegateToolMode || "native"), re(y, "delegate"), Oi && (dt(Oi, le.map((Rt) => ({
      value: Rt,
      label: Rt
    })), "手动填写"), Oi.value = le.includes(I.delegateModel) ? I.delegateModel : ""), Se(y, "#xb-assistant-model-pull-status", h(S)), Se(y, "#xb-assistant-delegate-model-pull-status", h(B, "delegate")), ae(y);
  }
  function vg(y) {
    if (typeof i != "function") return;
    const I = i(y);
    I && typeof I.catch == "function" && I.catch((S) => {
      r?.(u(S));
    });
  }
  function Ui(y, I, S) {
    y.querySelector(I)?.addEventListener("click", () => {
      const M = y.querySelector(S);
      M && (M.type = M.type === "password" ? "text" : "password");
    });
  }
  function Ag(y) {
    return {
      expectedUpdatedAt: Number(y?.updatedAt) || 0,
      workspaceFileName: y?.workspaceFileName || "",
      jsApiPermission: St(y?.jsApiPermission),
      tavilyApiKey: String(y?.tavilyApiKey || ""),
      tavilyBaseUrl: Qe(y?.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: y?.currentPresetName || "默认",
      delegatePresetName: y?.delegatePresetName || y?.currentPresetName || "默认",
      delegateConfig: y?.delegateConfig || {},
      delegateConfigured: y?.delegateConfigured === !0,
      presets: y?.presets || {}
    };
  }
  function gl(y, I = {}) {
    const S = hs(y), M = ge(S);
    if (M.length)
      return r?.(M[0]), !1;
    t.config = S;
    const B = oe(I.presetName || S.currentPresetName || "默认");
    return t.configDraft = P(B, S.presets?.[B] || Me(), S), d(), vg({
      requestId: o(I.requestPrefix || "save-config"),
      config: S,
      payload: Ag(S)
    }), !0;
  }
  function io(y, I = {}) {
    const S = A(y), M = oe(I.presetName || S.presetDraftName), B = oe(S.currentPresetName || t.config?.currentPresetName || "默认"), le = (t.config?.presets || {})[B] || Me(), j = Je(S.modelConfigs || le.modelConfigs || {}), ye = {
      ...le,
      provider: S.provider,
      permissionMode: In(S.permissionMode),
      modelConfigs: {
        ...j,
        [S.provider]: {
          ...j[S.provider] || {},
          ...U(S)
        }
      }
    }, _e = { ...t.config?.presets || {} };
    I.renameCurrentPreset && M !== B && delete _e[B], _e[M] = ye, gl({
      ...t.config,
      jsApiPermission: St(S.jsApiPermission),
      tavilyApiKey: String(S.tavilyApiKey || ""),
      tavilyBaseUrl: Qe(S.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: M,
      delegatePresetName: _(S.delegatePresetName, M),
      delegateConfig: $(S),
      delegateConfigured: I.configureDelegate === !0 || t.config?.delegateConfigured === !0,
      presets: _e
    }, {
      presetName: M,
      requestPrefix: I.requestPrefix
    });
  }
  function yl(y, I = "") {
    const S = oe(I || "默认"), M = typeof window < "u" && typeof window.prompt == "function" ? window.prompt(y, S) : S;
    return M === null ? "" : oe(M);
  }
  function Tg(y) {
    const I = yl("输入新预设名称：", `${A(y).currentPresetName || "默认"} 副本`);
    if (!I) {
      r?.("预设名称不能为空");
      return;
    }
    const S = y.querySelector("#xb-assistant-preset-name");
    S && (S.value = I, io(y, {
      presetName: I,
      requestPrefix: "create-preset"
    }));
  }
  function Sg(y) {
    const I = A(y), S = oe(I.currentPresetName || t.config?.currentPresetName || "默认"), M = yl("输入预设名称：", I.presetDraftName || S);
    if (!M) {
      r?.("预设名称不能为空");
      return;
    }
    if (M === S) return;
    const B = y.querySelector("#xb-assistant-preset-name");
    B && (B.value = M, io(y, {
      presetName: M,
      renameCurrentPreset: !0,
      requestPrefix: "rename-preset"
    }));
  }
  function Eg(y) {
    if (Object.keys(t.config?.presets || {}).length <= 1) {
      r?.("至少要保留一套预设");
      return;
    }
    const I = A(y), S = oe(t.configDraft?.currentPresetName || t.config?.currentPresetName || "默认"), M = { ...t.config?.presets || {} };
    delete M[S];
    const B = Object.keys(M)[0] || "默认";
    gl({
      ...t.config,
      jsApiPermission: St(I.jsApiPermission),
      tavilyApiKey: String(I.tavilyApiKey || t.config?.tavilyApiKey || ""),
      tavilyBaseUrl: Qe(I.tavilyBaseUrl || t.config?.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: B,
      delegatePresetName: _(I.delegatePresetName, B),
      delegateConfig: $(I),
      presets: M
    }, {
      presetName: B,
      requestPrefix: "delete-preset"
    }) && n?.();
  }
  function Cg(y) {
    y?.querySelector?.("[data-xb-agent-config-retry]")?.addEventListener("click", () => {
      s?.();
    }), y?.querySelector?.("[data-xb-agent-config-reload]")?.addEventListener("click", () => {
      t.configDraft = null, t.configDirty = !1, t.configExternalChangePending = !1, d(), n?.();
    }), y?.querySelector?.("#xb-assistant-provider") && (y.querySelector("#xb-assistant-provider")?.addEventListener("change", (I) => {
      const S = I.currentTarget.value, M = R().provider, B = A(y, { provider: M });
      t.configDraft = {
        ...B,
        provider: S,
        ...C(S, B.modelConfigs)
      }, d(), n?.();
    }), y.querySelector("#xb-assistant-preset-select")?.addEventListener("change", (I) => {
      const S = oe(I.currentTarget.value), M = (t.config?.presets || {})[S] || Me(), B = A(y);
      t.config = hs({
        ...t.config,
        jsApiPermission: St(B.jsApiPermission),
        currentPresetName: S,
        delegatePresetName: _(B.delegatePresetName, S),
        delegateConfig: $(B)
      }), t.configDraft = P(S, M, t.config), d(), n?.();
    }), y.querySelector("#xb-assistant-preset-name")?.addEventListener("input", () => {
      X(y);
    }), y.querySelector("#xb-assistant-base-url")?.addEventListener("input", () => {
      A(y), re(y), ae(y);
    }), y.querySelector("#xb-assistant-model")?.addEventListener("input", () => {
      A(y), re(y), ae(y);
    }), y.querySelector("#xb-assistant-api-key")?.addEventListener("input", () => {
      A(y);
    }), y.querySelector("#xb-assistant-max-tokens")?.addEventListener("input", () => {
      A(y);
    }), y.querySelector("#xb-assistant-temperature")?.addEventListener("input", () => {
      A(y);
    }), y.querySelector("#xb-assistant-send-temperature")?.addEventListener("change", () => {
      A(y);
    }), y.querySelector("#xb-assistant-tavily-api-key")?.addEventListener("input", () => {
      A(y);
    }), y.querySelector("#xb-assistant-model-pulled")?.addEventListener("change", (I) => {
      const S = I.currentTarget.value;
      if (!S) return;
      const M = y.querySelector("#xb-assistant-model");
      M && (M.value = S), A(y), re(y), ae(y);
    }), Ui(y, "#xb-assistant-toggle-key", "#xb-assistant-api-key"), Ui(y, "#xb-assistant-toggle-tavily-key", "#xb-assistant-tavily-api-key"), y.querySelector("#xb-assistant-delegate-provider")?.addEventListener("change", (I) => {
      const S = I.currentTarget.value, M = R().delegateProvider, B = A(y, { delegateProvider: M });
      t.configDraft = {
        ...B,
        delegateProvider: S,
        ...b(S, B.delegateModelConfigs)
      }, d(), n?.();
    }), y.querySelector("#xb-assistant-delegate-base-url")?.addEventListener("input", () => {
      A(y), re(y, "delegate"), ae(y);
    }), y.querySelector("#xb-assistant-delegate-model")?.addEventListener("input", () => {
      A(y), re(y, "delegate"), ae(y);
    }), y.querySelector("#xb-assistant-delegate-api-key")?.addEventListener("input", () => {
      A(y);
    }), y.querySelector("#xb-assistant-delegate-max-tokens")?.addEventListener("input", () => {
      A(y);
    }), y.querySelector("#xb-assistant-delegate-temperature")?.addEventListener("input", () => {
      A(y);
    }), y.querySelector("#xb-assistant-delegate-send-temperature")?.addEventListener("change", () => {
      A(y);
    }), y.querySelector("#xb-assistant-delegate-model-pulled")?.addEventListener("change", (I) => {
      const S = I.currentTarget.value;
      if (!S) return;
      const M = y.querySelector("#xb-assistant-delegate-model");
      M && (M.value = S), A(y), re(y, "delegate"), ae(y);
    }), Ui(y, "#xb-assistant-delegate-toggle-key", "#xb-assistant-delegate-api-key"), y.querySelector("#xb-assistant-reasoning-mode")?.addEventListener("change", () => {
      A(y), re(y), ae(y);
    }), y.querySelector("#xb-assistant-reasoning-effort")?.addEventListener("change", () => {
      A(y);
    }), y.querySelector("#xb-assistant-reasoning-budget")?.addEventListener("input", () => {
      A(y);
    }), y.querySelector("#xb-assistant-tool-mode")?.addEventListener("change", () => {
      A(y);
    }), y.querySelector("#xb-assistant-delegate-reasoning-mode")?.addEventListener("change", () => {
      A(y), re(y, "delegate"), ae(y);
    }), y.querySelector("#xb-assistant-delegate-reasoning-effort")?.addEventListener("change", () => {
      A(y);
    }), y.querySelector("#xb-assistant-delegate-reasoning-budget")?.addEventListener("input", () => {
      A(y);
    }), y.querySelector("#xb-assistant-delegate-tool-mode")?.addEventListener("change", () => {
      A(y);
    }), y.querySelector("#xb-assistant-permission-mode")?.addEventListener("change", () => {
      A(y);
    }), y.querySelector("#xb-assistant-jsapi-permission")?.addEventListener("change", () => {
      A(y);
    }), y.querySelector("#xb-assistant-delegate-preset-select")?.addEventListener("change", (I) => {
      const S = _(I.currentTarget?.value, t.configDraft?.currentPresetName || t.config?.currentPresetName || "默认"), M = (t.config?.presets || {})[S] || Me();
      t.configDraft = {
        ...A(y),
        ...v(S, M)
      }, d(), n?.();
    }), y.querySelectorAll("[data-config-page]").forEach((I) => {
      I.addEventListener("click", (S) => {
        A(y), t.configPage = Lo(S.currentTarget?.dataset?.configPage), Ue(y), un(y);
      });
    }), y.querySelector("#xb-assistant-pull-models")?.addEventListener("click", async () => {
      A(y), d();
      const I = se();
      p(I.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }), n?.();
      try {
        const S = await Bd(I);
        m(I.provider, S), p(I.provider, {
          status: "success",
          message: `已拉取 ${S.length} 个模型`
        });
      } catch (S) {
        m(I.provider, []), p(I.provider, {
          status: "error",
          message: u(S)
        });
      }
      d(), n?.();
    }), y.querySelector("#xb-assistant-delegate-pull-models")?.addEventListener("click", async () => {
      A(y), d();
      const I = se({ role: "delegate" });
      p(I.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }, "delegate"), n?.();
      try {
        const S = await Bd(I);
        m(I.provider, S, "delegate"), p(I.provider, {
          status: "success",
          message: `已拉取 ${S.length} 个模型`
        }, "delegate");
      } catch (S) {
        m(I.provider, [], "delegate"), p(I.provider, {
          status: "error",
          message: u(S)
        }, "delegate");
      }
      d(), n?.();
    }), y.querySelector("#xb-assistant-new-preset")?.addEventListener("click", () => {
      Tg(y);
    }), y.querySelector("#xb-assistant-rename-preset")?.addEventListener("click", () => {
      Sg(y);
    }), y.querySelector("#xb-assistant-save")?.addEventListener("click", () => {
      io(y);
    }), y.querySelector("#xb-assistant-delegate-save")?.addEventListener("click", () => {
      io(y, {
        requestPrefix: "save-delegate-config",
        configureDelegate: !0
      });
    }), y.querySelector("#xb-assistant-delete-preset")?.addEventListener("click", () => {
      Eg(y);
    }));
  }
  return {
    getActiveProviderConfig: se,
    syncConfigToForm: un,
    bindSettingsPanelEvents: Cg
  };
}
function xr(e = "") {
  return String(e || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function hr(e) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${{
    add: '<path d="M12 5v14" /><path d="M5 12h14" />',
    rename: '<path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />',
    save: '<path d="M5 21h14a1 1 0 0 0 1-1V7.5L16.5 4H5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1Z" /><path d="M8 21v-7h8v7" /><path d="M8 4v5h7" />',
    saving: '<path class="xb-assistant-save-spinner" d="M12 3a9 9 0 1 1-8.2 5.3" />',
    success: '<path d="M20 6 9 17l-5-5" />',
    error: '<path d="M18 6 6 18" /><path d="M6 6l12 12" />',
    delete: '<path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />'
  }[e] || ""}</svg>`;
}
function cP(e = {}) {
  const t = String(e?.status || "idle");
  return t === "saving" ? "saving" : t === "success" ? "success" : t === "error" ? "error" : "save";
}
function dP(e = {}) {
  const t = String(e?.status || "idle");
  return t === "saving" ? {
    className: "xb-assistant-save-button is-saving",
    title: "正在保存配置"
  } : t === "success" ? {
    className: "xb-assistant-save-button is-success",
    title: "配置已保存"
  } : t === "error" ? {
    className: "xb-assistant-save-button is-error",
    title: xr(e?.error || "保存失败")
  } : {
    className: "xb-assistant-save-button",
    title: "保存配置"
  };
}
function yP(e = {}) {
  const { configSave: t = {}, runtimeText: n = "", inlineToastText: r = "", showInlineToast: o = !0, showAssistantPermissions: i = !0, showDelegateSettings: s = !0, activePage: u = "main", delegatePresetHint: c = "DelegateRun 分身会使用这里的独立 API 配置；可以和主助手使用不同 Provider、Base URL、模型和 Tool 调用格式。", isBusy: d = !1, canDeletePreset: f = !0, configLoadError: h = "", configExternalChangePending: p = !1 } = e, m = String(h || "").trim(), g = dP(t), _ = cP(t), v = d || m || String(t?.status || "") === "saving" ? "disabled" : "", C = d || !f ? "disabled" : "", b = u === "delegate" ? "delegate" : "main", P = b === "main", R = b === "delegate", D = i ? `
            <label>
                <span>斜杠命令权限</span>
                <select id="xb-assistant-permission-mode"></select>
            </label>
            <label>
                <span>JavaScript API 权限</span>
                <select id="xb-assistant-jsapi-permission"></select>
            </label>` : "", A = s ? `
            <div class="xb-assistant-config-tabs" role="tablist" aria-label="API 配置分页">
                <button id="xb-assistant-config-tab-main" type="button" class="xb-assistant-config-tab ${P ? "is-active" : ""}" data-config-page="main" role="tab" aria-selected="${P ? "true" : "false"}">主助手 API</button>
                <button id="xb-assistant-config-tab-delegate" type="button" class="xb-assistant-config-tab ${R ? "is-active" : ""}" data-config-page="delegate" role="tab" aria-selected="${R ? "true" : "false"}">分身 API</button>
            </div>` : "", U = s ? `
            <div class="xb-assistant-config-page" data-config-page-panel="delegate" ${R ? "" : "hidden"}>
                <p class="xb-assistant-config-note">${xr(c)}</p>
                <div class="xb-assistant-preset-row">
                    <select id="xb-assistant-delegate-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                    <div class="xb-assistant-preset-tools is-single" aria-label="分身 API 预设操作">
                        <button id="xb-assistant-delegate-save" type="button" class="xb-assistant-icon-button ${g.className}" title="${g.title}" aria-label="${g.title}" ${v}>${hr(_)}</button>
                    </div>
                </div>
                <label>
                    <span>Provider</span>
                    <select id="xb-assistant-delegate-provider">
                        <option value="openai-responses">OpenAI Responses</option>
                        <option value="openai-compatible">OpenAI 兼容</option>
                        <option value="sillytavern-openai-compatible">酒馆 OpenAI 兼容</option>
                        <option value="sillytavern-claude">酒馆 Claude</option>
                        <option value="sillytavern-google">酒馆 Google AI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="google">Google AI</option>
                    </select>
                </label>
                <label>
                    <span>Base URL</span>
                    <input id="xb-assistant-delegate-base-url" type="text" />
                </label>
                <label>
                    <span>API Key</span>
                    <div class="xb-assistant-inline-input">
                        <input id="xb-assistant-delegate-api-key" type="password" />
                        <button id="xb-assistant-delegate-toggle-key" type="button" class="secondary ghost">显示</button>
                    </div>
                </label>
                <label>
                    <span>Model</span>
                    <input id="xb-assistant-delegate-model" type="text" />
                </label>
                <div class="xb-assistant-inline-input xb-assistant-model-row">
                    <label class="xb-assistant-grow">
                        <span>已拉取模型</span>
                        <select id="xb-assistant-delegate-model-pulled">
                            <option value="">手动填写</option>
                        </select>
                    </label>
                    <button id="xb-assistant-delegate-pull-models" type="button" class="secondary" ${d ? "disabled" : ""}>拉取模型</button>
                </div>
                <div class="xb-assistant-inline-status" id="xb-assistant-delegate-model-pull-status" aria-live="polite" hidden></div>
                <label>
                    <span>最大输出 Token</span>
                    <input id="xb-assistant-delegate-max-tokens" type="number" min="1" step="1" inputmode="numeric" />
                </label>
                <div class="xb-assistant-temperature-row">
                    <label>
                        <span>温度</span>
                        <input id="xb-assistant-delegate-temperature" type="number" min="0" max="2" step="0.05" />
                    </label>
                    <label class="xb-assistant-checkbox-row">
                        <span>允许传参</span>
                        <span class="xb-assistant-checkbox-control">
                            <input id="xb-assistant-delegate-send-temperature" type="checkbox" />
                        </span>
                    </label>
                </div>
                <label id="xb-assistant-delegate-tool-mode-wrap">
                    <span>Tool 调用格式</span>
                    <select id="xb-assistant-delegate-tool-mode"></select>
                </label>
                <label>
                    <span>Reasoning 模式</span>
                    <select id="xb-assistant-delegate-reasoning-mode"></select>
                    <small id="xb-assistant-delegate-reasoning-capability"></small>
                </label>
                <label id="xb-assistant-delegate-reasoning-effort-wrap">
                    <span>思考强度</span>
                    <select id="xb-assistant-delegate-reasoning-effort"></select>
                </label>
                <label id="xb-assistant-delegate-reasoning-budget-wrap">
                    <span>思考 Token 预算</span>
                    <input id="xb-assistant-delegate-reasoning-budget" type="number" step="1" inputmode="numeric" />
                    <small>支持 -1 时表示由模型自动决定</small>
                </label>
            </div>` : "";
  return `
        <section class="xb-assistant-config">
            <div class="xb-assistant-config-alert is-error" data-xb-agent-config-load-error ${m ? "" : "hidden"}>
                <span data-xb-agent-config-load-error-message>${xr(m)}</span>
                <button type="button" data-xb-agent-config-retry>重新读取</button>
            </div>
            <div class="xb-assistant-config-alert is-conflict" data-xb-agent-config-conflict ${m || !p ? "hidden" : ""}>
                <span>共享配置已在其他页面更新。当前未保存编辑仍保留；重新载入会放弃这些编辑。</span>
                <button type="button" data-xb-agent-config-reload>重新载入</button>
            </div>
            <fieldset class="xb-assistant-config-fields" data-xb-agent-config-fields ${m ? "disabled" : ""}>
            ${A}
            <div class="xb-assistant-config-page" data-config-page-panel="main" ${P ? "" : "hidden"}>
            <div class="xb-assistant-preset-row">
                <select id="xb-assistant-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                <input id="xb-assistant-preset-name" type="hidden" />
                <div class="xb-assistant-preset-tools" aria-label="API 预设操作">
                    <button id="xb-assistant-new-preset" type="button" class="xb-assistant-icon-button" title="新增预设" aria-label="新增预设" ${d ? "disabled" : ""}>${hr("add")}</button>
                    <button id="xb-assistant-rename-preset" type="button" class="xb-assistant-icon-button" title="重命名预设" aria-label="重命名预设" ${d ? "disabled" : ""}>${hr("rename")}</button>
                    <button id="xb-assistant-save" type="button" class="xb-assistant-icon-button ${g.className}" title="${g.title}" aria-label="${g.title}" ${v}>${hr(_)}</button>
                    <button id="xb-assistant-delete-preset" type="button" class="xb-assistant-icon-button" title="删除预设" aria-label="删除预设" ${C}>${hr("delete")}</button>
                </div>
            </div>
            <label>
                <span>Provider</span>
                <select id="xb-assistant-provider">
                    <option value="openai-responses">OpenAI Responses</option>
                    <option value="openai-compatible">OpenAI 兼容</option>
                    <option value="sillytavern-openai-compatible">酒馆 OpenAI 兼容</option>
                    <option value="sillytavern-claude">酒馆 Claude</option>
                    <option value="sillytavern-google">酒馆 Google AI</option>
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
                <button id="xb-assistant-pull-models" type="button" class="secondary" ${d ? "disabled" : ""}>拉取模型</button>
            </div>
            <div class="xb-assistant-inline-status" id="xb-assistant-model-pull-status" aria-live="polite" hidden></div>
            <label>
                <span>最大输出 Token</span>
                <input id="xb-assistant-max-tokens" type="number" min="1" step="1" inputmode="numeric" />
            </label>
            <div class="xb-assistant-temperature-row">
                <label>
                    <span>温度</span>
                    <input id="xb-assistant-temperature" type="number" min="0" max="2" step="0.05" />
                </label>
                <label class="xb-assistant-checkbox-row">
                    <span>允许传参</span>
                    <span class="xb-assistant-checkbox-control">
                        <input id="xb-assistant-send-temperature" type="checkbox" />
                    </span>
                </label>
            </div>
            <label>
                <span>Tavily API Key（全局）</span>
                <div class="xb-assistant-inline-input">
                    <input id="xb-assistant-tavily-api-key" type="password" />
                    <button id="xb-assistant-toggle-tavily-key" type="button" class="secondary ghost">显示</button>
                </div>
            </label>
            <label id="xb-assistant-tool-mode-wrap">
                <span>Tool 调用格式</span>
                <select id="xb-assistant-tool-mode"></select>
            </label>
            ${D}
            <label>
                <span>Reasoning 模式</span>
                <select id="xb-assistant-reasoning-mode"></select>
                <small id="xb-assistant-reasoning-capability"></small>
            </label>
            <label id="xb-assistant-reasoning-effort-wrap">
                <span>思考强度</span>
                <select id="xb-assistant-reasoning-effort"></select>
            </label>
            <label id="xb-assistant-reasoning-budget-wrap">
                <span>思考 Token 预算</span>
                <input id="xb-assistant-reasoning-budget" type="number" step="1" inputmode="numeric" />
                <small>支持 -1 时表示由模型自动决定</small>
            </label>
            </div>
            ${U}
            <div class="xb-assistant-runtime" id="xb-assistant-runtime">${xr(n)}</div>
            </fieldset>
            ${o ? `<div class="xb-assistant-toast xb-assistant-toast-inline" id="xb-assistant-toast" aria-live="polite">${xr(r)}</div>` : ""}
        </section>
    `;
}
var fP = [
  "你是小白X“四次元壁”的交流生成器。",
  "只完成本轮四次元壁回复，不调用工具，不编造外部事实。",
  "严格遵循后续提示词里的输出格式，优先输出可被解析的 <thinking> 与 <msg> 内容。"
].join(`
`);
function hP(e = {}) {
  return {
    msg1: String(e.msg1 || "").trim(),
    msg2: String(e.msg2 || "").trim(),
    msg3: String(e.msg3 || "").trim(),
    msg4: String(e.msg4 || "").trim()
  };
}
function pP(e = {}, t = {}) {
  const { msg1: n, msg2: r, msg3: o, msg4: i } = hP(e);
  return [
    n ? {
      role: "user",
      content: n
    } : null,
    r ? {
      role: "assistant",
      content: r
    } : null,
    o ? {
      role: "user",
      content: o
    } : null,
    i && !t.disableAssistantPrefill ? {
      role: "assistant",
      content: i
    } : null
  ].filter(Boolean);
}
function _P(e = {}) {
  s0(typeof e.requestHeadersProvider == "function" ? e.requestHeadersProvider : null);
}
async function vP(e = {}) {
  const t = Y0(Bg(e.config || {})), n = X0(t, { missingApiKeyMessage: "请先在小白agent的 API配置 里填写当前预设的 API Key。" }), r = !!e.stream && typeof e.onStreamProgress == "function", o = await n.chat({
    systemPrompt: fP,
    messages: pP(e.builtPrompt || {}, { disableAssistantPrefill: !!e.disableAssistantPrefill }),
    tools: [],
    temperature: t.temperature,
    maxTokens: t.maxTokens,
    reasoning: t.reasoning,
    signal: e.signal,
    onStreamProgress: r ? e.onStreamProgress : void 0
  });
  return {
    text: String(o?.text || ""),
    thoughts: Array.isArray(o?.thoughts) ? o.thoughts : [],
    provider: o?.provider || t.provider,
    model: o?.model || t.model,
    finishReason: o?.finishReason || ""
  };
}
export {
  yP as buildAgentSettingsPanelMarkup,
  _P as configureFourthWallAgent,
  gP as createAgentSettingsPanel,
  vP as generateFourthWallResponse,
  hs as normalizeAgentConfig
};
