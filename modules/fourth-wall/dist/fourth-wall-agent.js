var Im = Object.create, Jd = Object.defineProperty, bm = Object.getOwnPropertyDescriptor, Pm = Object.getOwnPropertyNames, Rm = Object.getPrototypeOf, xm = Object.prototype.hasOwnProperty, Ai = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), Mm = (e, t, n, r) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var o = Pm(t), i = 0, a = o.length, u; i < a; i++)
      u = o[i], !xm.call(e, u) && u !== n && Jd(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(r = bm(t, u)) || r.enumerable
      });
  return e;
}, Nm = (e, t, n) => (n = e != null ? Im(Rm(e)) : {}, Mm(t || !e || !e.__esModule ? Jd(n, "default", {
  value: e,
  enumerable: !0
}) : n, e)), km = "https://api.tavily.com";
function ps(e = "") {
  return String(e || "").trim();
}
function Ze(e = "") {
  return String(e || "").trim().replace(/\/+$/, "") || "https://api.tavily.com";
}
var SP = Object.freeze([
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
]), Dm = Object.freeze([Object.freeze({
  value: "hide",
  label: "隐藏"
}), Object.freeze({
  value: "show",
  label: "显示"
})]);
function $m(e = "") {
  return e === "on" || e === "off" ? e : "inherit";
}
function Wd(e = "") {
  return e === "show" ? "show" : "hide";
}
function Lm(e) {
  return String(e ?? "").trim().toLowerCase() || void 0;
}
function Um(e) {
  if (e == null || e === "") return;
  const t = Number(e);
  return Number.isFinite(t) ? Math.floor(t) : void 0;
}
function On(e = {}) {
  const t = e && typeof e == "object" ? e : {}, n = Lm(t.effort), r = Um(t.budgetTokens);
  return {
    mode: $m(t.mode),
    output: Wd(t.output),
    ...n ? { effort: n } : {},
    ...r !== void 0 ? { budgetTokens: r } : {}
  };
}
function j(e = {}) {
  return Wd(e?.output) === "show";
}
var zd = "openai-compatible", Ti = "默认", Yd = "default", Fm = "deny", St = 32e3, Om = Object.freeze([{
  value: "default",
  label: "默认权限"
}, {
  value: "full",
  label: "完全权限"
}]), qm = Object.freeze([{
  value: "deny",
  label: "禁止"
}, {
  value: "allow",
  label: "允许"
}]), gs = {
  "openai-responses": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: St,
    sendTemperature: !0
  },
  "openai-compatible": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: St,
    sendTemperature: !0,
    toolMode: "native"
  },
  "sillytavern-openai-compatible": {
    baseUrl: "",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: St,
    sendTemperature: !0,
    toolMode: "native"
  },
  "sillytavern-claude": {
    baseUrl: "",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 1,
    maxTokens: St,
    sendTemperature: !0
  },
  "sillytavern-google": {
    baseUrl: "",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: St,
    sendTemperature: !0
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 1,
    maxTokens: St,
    sendTemperature: !0
  },
  google: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: St,
    sendTemperature: !0
  }
};
function Cn() {
  return JSON.parse(JSON.stringify(gs));
}
function Re() {
  return {
    provider: zd,
    modelConfigs: Cn(),
    permissionMode: Yd
  };
}
function Xd(e = Re()) {
  const t = e && typeof e == "object" ? e : Re();
  return {
    provider: fa(t.provider),
    modelConfigs: Ke(t.modelConfigs || {})
  };
}
function In(e) {
  return e === "full" ? "full" : Yd;
}
function Et(e) {
  return e === "allow" ? "allow" : Fm;
}
function Ne(e, t = St) {
  const n = Number(e);
  if (!Number.isFinite(n) || n <= 0) {
    const r = Number(t);
    return Number.isFinite(r) && r > 0 ? Math.floor(r) : St;
  }
  return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n));
}
function ae(e) {
  return String(e || "").trim() || "默认";
}
function Ke(e = {}) {
  const t = Cn();
  return Object.keys(gs).forEach((n) => {
    const r = e && typeof e[n] == "object" ? e[n] : {}, o = gs[n];
    t[n] = {
      baseUrl: String(r.baseUrl ?? o.baseUrl ?? ""),
      model: String(r.model ?? o.model ?? ""),
      apiKey: String(r.apiKey ?? o.apiKey ?? ""),
      temperature: r.temperature ?? o.temperature,
      maxTokens: Ne(r.maxTokens, o.maxTokens),
      sendTemperature: typeof r.sendTemperature == "boolean" ? r.sendTemperature : o.sendTemperature,
      ..."toolMode" in o ? { toolMode: String(r.toolMode || o.toolMode || "native") } : {},
      reasoning: On(r.reasoning)
    };
  }), t;
}
function fa(e) {
  return typeof e == "string" && e.trim() ? e : zd;
}
function ha(e = {}, t) {
  return e && typeof e.presets == "object" && e.presets ? e.presets : e?.modelConfigs ? { [t]: {
    provider: e.provider || "openai-compatible",
    modelConfigs: e.modelConfigs,
    permissionMode: e.permissionMode
  } } : {};
}
function Qd(e = {}, t) {
  const n = {}, r = ha(e, t);
  return Object.entries(r).forEach(([o, i]) => {
    if (!i || typeof i != "object") return;
    const a = ae(o);
    n[a] = {
      provider: fa(i.provider),
      modelConfigs: Ke(i.modelConfigs || {}),
      permissionMode: In(i.permissionMode)
    };
  }), Object.keys(n).length || (n[Ti] = Re()), n;
}
function Zd(e, t) {
  const n = ae(t);
  return e[n] ? n : Object.keys(e)[0];
}
function jd(e, t, n) {
  const r = ae(t || n);
  return e[r] ? r : e[n] ? n : Object.keys(e)[0];
}
function pa(e = {}, t = Re()) {
  const n = Xd(t), r = e && typeof e == "object" ? e : {};
  return {
    provider: fa(r.provider || n.provider),
    modelConfigs: Ke(r.modelConfigs || n.modelConfigs)
  };
}
function ef(e = {}, t = {}, n = Ti, r = n) {
  if (e?.delegateConfigured === !1) return !1;
  if (r !== n) return !0;
  const o = e?.delegateConfig;
  if (!o || typeof o != "object" || Array.isArray(o) || !(typeof o.provider == "string" && o.provider.trim() || o.modelConfigs && typeof o.modelConfigs == "object" && Object.keys(o.modelConfigs).length)) return !1;
  if (e?.delegateConfigured === !0) return !0;
  const i = t[n] || Re(), a = Xd(i), u = pa(o, i);
  return JSON.stringify(u) !== JSON.stringify(a);
}
function Bm(e = {}, t, n, r, o) {
  const i = o(e?.[r]);
  if (i) return i;
  const a = ha(e, t), u = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(a || {})
  ].map(ae), c = /* @__PURE__ */ new Set();
  for (const d of u) {
    if (c.has(d)) continue;
    c.add(d);
    const h = o(a?.[d]?.[r]);
    if (h) return h;
  }
  return o(e?.delegateConfig?.[r]);
}
function Gm(e = {}, t, n) {
  const r = (u) => String(u || "").trim();
  if (r(e?.tavilyBaseUrl)) return Ze(e.tavilyBaseUrl);
  const o = ha(e, t), i = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(o || {})
  ].map(ae), a = /* @__PURE__ */ new Set();
  for (const u of i) {
    if (a.has(u)) continue;
    a.add(u);
    const c = o?.[u]?.tavilyBaseUrl;
    if (r(c)) return Ze(c);
  }
  return r(e?.delegateConfig?.tavilyBaseUrl) ? Ze(e.delegateConfig.tavilyBaseUrl) : km;
}
function tf(e = {}, t, n) {
  return {
    tavilyApiKey: Bm(e, t, n, "tavilyApiKey", ps),
    tavilyBaseUrl: Gm(e, t, n)
  };
}
function Hm(e = {}, t = {}) {
  const { defaultWorkspaceFileName: n = "", normalizeWorkspaceName: r = (p) => String(p || "") } = t, o = ae(e.currentPresetName || e.presetName || "默认"), i = Qd(e, o), a = Zd(i, e.currentPresetName), u = jd(i, e.delegatePresetName, a), c = i[u] || i[a] || Re(), d = pa(e.delegateConfig, c), h = ef(e, i, a, u), f = tf(e, o, a);
  return {
    enabled: !!e.enabled,
    workspaceFileName: r(e.workspaceFileName || n),
    jsApiPermission: Et(e.jsApiPermission),
    currentPresetName: a,
    delegatePresetName: u,
    delegateConfig: d,
    delegateConfigured: h,
    presets: i,
    tavilyApiKey: f.tavilyApiKey,
    tavilyBaseUrl: f.tavilyBaseUrl,
    updatedAt: Number(e.updatedAt) || 0,
    configVersion: Number(e.configVersion) || 0
  };
}
function qo(e = {}) {
  const t = ae(e.currentPresetName || e.presetDraftName || "默认"), n = Qd(e, t), r = Zd(n, e.currentPresetName), o = jd(n, e.delegatePresetName, r), i = n[r] || Re(), a = n[o] || i, u = pa(e.delegateConfig, a), c = ef(e, n, r, o), d = tf(e, t, r);
  return {
    workspaceFileName: String(e.workspaceFileName || ""),
    updatedAt: Number(e.updatedAt) || 0,
    jsApiPermission: Et(e.jsApiPermission),
    currentPresetName: r,
    delegatePresetName: o,
    delegateConfig: u,
    delegateConfigured: c,
    presetDraftName: ae(e.presetDraftName || r),
    presetNames: Object.keys(n),
    presets: n,
    provider: i.provider,
    modelConfigs: i.modelConfigs,
    permissionMode: In(i.permissionMode),
    tavilyApiKey: d.tavilyApiKey,
    tavilyBaseUrl: d.tavilyBaseUrl
  };
}
function U(e, t, n, r, o) {
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
var nf = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return nf = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
};
function Br(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var ms = (e) => {
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
}, K = class extends Error {
}, Je = class ys extends K {
  constructor(t, n, r, o, i) {
    super(`${ys.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.requestID = o?.get("request-id"), this.error = n, this.type = i ?? null;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new Si({
      message: r,
      cause: ms(n)
    });
    const i = n, a = i?.error?.type;
    return t === 400 ? new of(t, i, r, o, a) : t === 401 ? new sf(t, i, r, o, a) : t === 403 ? new af(t, i, r, o, a) : t === 404 ? new lf(t, i, r, o, a) : t === 409 ? new uf(t, i, r, o, a) : t === 422 ? new cf(t, i, r, o, a) : t === 429 ? new df(t, i, r, o, a) : t >= 500 ? new ff(t, i, r, o, a) : new ys(t, i, r, o, a);
  }
}, lt = class extends Je {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Si = class extends Je {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, rf = class extends Si {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, of = class extends Je {
}, sf = class extends Je {
}, af = class extends Je {
}, lf = class extends Je {
}, uf = class extends Je {
}, cf = class extends Je {
}, df = class extends Je {
}, ff = class extends Je {
}, Vm = /^[a-z][a-z0-9+.-]*:/i, Km = (e) => Vm.test(e), _s = (e) => (_s = Array.isArray, _s(e)), Pl = _s;
function vs(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function Rl(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Jm(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var Wm = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new K(`${e} must be an integer`);
  if (t < 0) throw new K(`${e} must be a positive integer`);
  return t;
}, hf = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, zm = (e) => new Promise((t) => setTimeout(t, e)), An = "0.91.1", Ym = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function Xm() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var Qm = () => {
  const e = Xm();
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
  const t = Zm();
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
function Zm() {
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
var xl = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Ml = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), Nl, jm = () => Nl ?? (Nl = Qm());
function ey() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function pf(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function gf(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return pf({
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
function ga(e) {
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
async function ty(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var ny = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function ry(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new K(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function oy(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var kl;
function ma(e) {
  let t;
  return (kl ?? (t = new globalThis.TextEncoder(), kl = t.encode.bind(t)))(e);
}
var Dl;
function $l(e) {
  let t;
  return (Dl ?? (t = new globalThis.TextDecoder(), Dl = t.decode.bind(t)))(e);
}
var Oe, qe, Yr = class {
  constructor() {
    Oe.set(this, void 0), qe.set(this, void 0), U(this, Oe, new Uint8Array(), "f"), U(this, qe, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? ma(e) : e;
    U(this, Oe, oy([w(this, Oe, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = iy(w(this, Oe, "f"), w(this, qe, "f"))) != null; ) {
      if (r.carriage && w(this, qe, "f") == null) {
        U(this, qe, r.index, "f");
        continue;
      }
      if (w(this, qe, "f") != null && (r.index !== w(this, qe, "f") + 1 || r.carriage)) {
        n.push($l(w(this, Oe, "f").subarray(0, w(this, qe, "f") - 1))), U(this, Oe, w(this, Oe, "f").subarray(w(this, qe, "f")), "f"), U(this, qe, null, "f");
        continue;
      }
      const o = w(this, qe, "f") !== null ? r.preceding - 1 : r.preceding, i = $l(w(this, Oe, "f").subarray(0, o));
      n.push(i), U(this, Oe, w(this, Oe, "f").subarray(r.index), "f"), U(this, qe, null, "f");
    }
    return n;
  }
  flush() {
    return w(this, Oe, "f").length ? this.decode(`
`) : [];
  }
};
Oe = /* @__PURE__ */ new WeakMap(), qe = /* @__PURE__ */ new WeakMap();
Yr.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Yr.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function iy(e, t) {
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
function sy(e) {
  for (let r = 0; r < e.length - 1; r++) {
    if (e[r] === 10 && e[r + 1] === 10 || e[r] === 13 && e[r + 1] === 13) return r + 2;
    if (e[r] === 13 && e[r + 1] === 10 && r + 3 < e.length && e[r + 2] === 13 && e[r + 3] === 10) return r + 4;
  }
  return -1;
}
var ni = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Ll = (e, t, n) => {
  if (e) {
    if (Jm(ni, e)) return e;
    be(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(ni))}`);
  }
};
function _r() {
}
function co(e, t, n) {
  return !t || ni[e] > ni[n] ? _r : t[e].bind(t);
}
var ay = {
  error: _r,
  warn: _r,
  info: _r,
  debug: _r
}, Ul = /* @__PURE__ */ new WeakMap();
function be(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return ay;
  const r = Ul.get(t);
  if (r && r[0] === n) return r[1];
  const o = {
    error: co("error", t, n),
    warn: co("warn", t, n),
    info: co("info", t, n),
    debug: co("debug", t, n)
  };
  return Ul.set(t, [n, o]), o;
}
var Qt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), Zn, Gr = class vr {
  constructor(t, n, r) {
    this.iterator = t, Zn.set(this, void 0), this.controller = n, U(this, Zn, r, "f");
  }
  static fromSSEResponse(t, n, r) {
    let o = !1;
    const i = r ? be(r) : console;
    async function* a() {
      if (o) throw new K("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let u = !1;
      try {
        for await (const c of ly(t, n)) {
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
            const d = hf(c.data) ?? c.data, h = d?.error?.type;
            throw new Je(void 0, d, void 0, t.headers, h);
          }
        }
        u = !0;
      } catch (c) {
        if (Br(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new vr(a, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    async function* i() {
      const u = new Yr(), c = ga(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
      for (const d of u.flush()) yield d;
    }
    async function* a() {
      if (o) throw new K("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let u = !1;
      try {
        for await (const c of i())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (Br(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new vr(a, n, r);
  }
  [(Zn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], r = this.iterator(), o = (i) => ({ next: () => {
      if (i.length === 0) {
        const a = r.next();
        t.push(a), n.push(a);
      }
      return i.shift();
    } });
    return [new vr(() => o(t), this.controller, w(this, Zn, "f")), new vr(() => o(n), this.controller, w(this, Zn, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return pf({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: i } = await n.next();
          if (i) return r.close();
          const a = ma(JSON.stringify(o) + `
`);
          r.enqueue(a);
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
async function* ly(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new K("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new K("Attempted to iterate over a response with no body");
  const n = new cy(), r = new Yr(), o = ga(e.body);
  for await (const i of uy(o)) for (const a of r.decode(i)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const i of r.flush()) {
    const a = n.decode(i);
    a && (yield a);
  }
}
async function* uy(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? ma(n) : n;
    let o = new Uint8Array(t.length + r.length);
    o.set(t), o.set(r, t.length), t = o;
    let i;
    for (; (i = sy(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var cy = class {
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
    let [t, n, r] = dy(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function dy(e, t) {
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
async function mf(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: i } = t, a = await (async () => {
    if (t.options.stream)
      return be(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : Gr.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : yf(await n.json(), n) : await n.text();
  })();
  return be(e).debug(`[${r}] response parsed`, Qt({
    retryOfRequestLogID: o,
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
var Ar, _f = class vf extends Promise {
  constructor(t, n, r = mf) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, Ar.set(this, void 0), U(this, Ar, t, "f");
  }
  _thenUnwrap(t) {
    return new vf(w(this, Ar, "f"), this.responsePromise, async (n, r) => yf(t(await this.parseResponse(n, r), r), r.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(w(this, Ar, "f"), t))), this.parsedPromise;
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
Ar = /* @__PURE__ */ new WeakMap();
var fo, Af = class {
  constructor(e, t, n, r) {
    fo.set(this, void 0), U(this, fo, e, "f"), this.options = r, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new K("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await w(this, fo, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(fo = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, fy = class extends _f {
  constructor(e, t, n) {
    super(e, t, async (r, o) => new n(r, o.response, await mf(r, o), o.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, Xr = class extends Af {
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
          ...vs(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...vs(this.options.query),
        after_id: e
      }
    } : null;
  }
}, Le = class extends Af {
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
        ...vs(this.options.query),
        page: e
      }
    } : null;
  }
}, Tf = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Dn(e, t, n) {
  return Tf(), new File(e, t ?? "unknown_file", n);
}
function Bo(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var Sf = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", ya = async (e, t, n = !0) => ({
  ...e,
  body: await py(e.body, t, n)
}), Fl = /* @__PURE__ */ new WeakMap();
function hy(e) {
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
var py = async (e, t, n = !0) => {
  if (!await hy(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const r = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([o, i]) => As(r, o, i, n))), r;
}, gy = (e) => e instanceof Blob && "name" in e, As = async (e, t, n, r) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let o = {};
      const i = n.headers.get("Content-Type");
      i && (o = { type: i }), e.append(t, Dn([await n.blob()], Bo(n, r), o));
    } else if (Sf(n)) e.append(t, Dn([await new Response(gf(n)).blob()], Bo(n, r)));
    else if (gy(n)) e.append(t, Dn([n], Bo(n, r), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((o) => As(e, t + "[]", o, r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([o, i]) => As(e, `${t}[${o}]`, i, r)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, Ef = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", my = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Ef(e), yy = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function _y(e, t, n) {
  if (Tf(), e = await e, t || (t = Bo(e, !0)), my(e))
    return e instanceof File && t == null && n == null ? e : Dn([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if (yy(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Dn(await Ts(o), t, n);
  }
  const r = await Ts(e);
  if (!n?.type) {
    const o = r.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof o == "string" && (n = {
      ...n,
      type: o
    });
  }
  return Dn(r, t, n);
}
async function Ts(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (Ef(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Sf(e)) for await (const n of e) t.push(...await Ts(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${vy(e)}`);
  }
  return t;
}
function vy(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var oe = class {
  constructor(e) {
    this._client = e;
  }
}, wf = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* Ay(e) {
  if (!e) return;
  if (wf in e) {
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
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, u]);
  }
}
var N = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [i, a] of Ay(r)) {
      const u = i.toLowerCase();
      o.has(u) || (t.delete(i), o.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [wf]: !0,
    values: t,
    nulls: n
  };
};
function Cf(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Ol = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Ty = (e = Cf) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const i = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (o = !0);
    const g = r[p];
    let y = (o ? encodeURIComponent : e)("" + g);
    return p !== r.length && (g == null || typeof g == "object" && g.toString === Object.getPrototypeOf(Object.getPrototypeOf(g.hasOwnProperty ?? Ol) ?? Ol)?.toString) && (y = g + "", i.push({
      start: h.length + f.length,
      length: y.length,
      error: `Value of type ${Object.prototype.toString.call(g).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === r.length ? "" : y);
  }, ""), u = a.split(/[?#]/, 1)[0], c = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) i.push({
    start: d.index,
    length: d[0].length,
    error: `Value "${d[0]}" can't be safely passed as a path parameter`
  });
  if (i.sort((h, f) => h.start - f.start), i.length > 0) {
    let h = 0;
    const f = i.reduce((p, g) => {
      const y = " ".repeat(g.start - h), _ = "^".repeat(g.length);
      return h = g.start + g.length, p + y + _;
    }, "");
    throw new K(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}, q = /* @__PURE__ */ Ty(Cf), If = class extends oe {
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
}, $r = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function Go(e) {
  return typeof e == "object" && e !== null && $r in e;
}
function bf(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const r of e) Go(r) && n.add(r[$r]);
  if (t) {
    for (const r of t)
      if (Go(r) && n.add(r[$r]), Array.isArray(r.content))
        for (const o of r.content) Go(o) && n.add(o[$r]);
  }
  return Array.from(n);
}
function Pf(e, t) {
  const n = bf(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function Sy(e) {
  return Go(e) ? { "x-stainless-helper": e[$r] } : {};
}
var Rf = class extends oe {
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/files?beta=true", Xr, {
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
    return this._client.post("/v1/files?beta=true", ya({
      body: r,
      ...t,
      headers: N([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        Sy(r.file),
        t?.headers
      ])
    }, this._client));
  }
}, xf = class extends oe {
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/models/${e}?beta=true`, {
      ...n,
      headers: N([{ ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", Xr, {
      query: r,
      ...t,
      headers: N([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Mf = class extends oe {
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
}, Nf = class extends oe {
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/agents/${e}/versions?beta=true`, Le, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, _a = class extends oe {
  constructor() {
    super(...arguments), this.versions = new Nf(this._client);
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
_a.Versions = Nf;
var kf = class extends oe {
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
    const { memory_store_id: r, view: o, betas: i, ...a } = t;
    return this._client.post(q`/v1/memory_stores/${r}/memories/${e}?beta=true`, {
      query: { view: o },
      body: a,
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
}, Df = class extends oe {
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
}, Ei = class extends oe {
  constructor() {
    super(...arguments), this.memories = new kf(this._client), this.memoryVersions = new Df(this._client);
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
Ei.Memories = kf;
Ei.MemoryVersions = Df;
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
function Lf(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function ql(e, t, n) {
  const r = Lf(t);
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
  } : Uf(e, t, n);
}
function Uf(e, t, n) {
  let r = null;
  const o = e.content.map((i) => {
    if (i.type === "text") {
      const a = Ey(t, i.text);
      r === null && (r = a);
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
    content: o,
    parsed_output: r
  };
}
function Ey(e, t) {
  const n = Lf(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new K(`Failed to parse structured output: ${r}`);
  }
}
var wy = (e) => {
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
      let a = "", u = !1;
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
          a += r + e[t], r = e[++t];
        } else
          a += r, r = e[++t];
      }
      r = e[++t], u || n.push({
        type: "string",
        value: a
      });
      continue;
    }
    if (r && /\s/.test(r)) {
      t++;
      continue;
    }
    let o = /[0-9]/;
    if (r && o.test(r) || r === "-" || r === ".") {
      let a = "";
      for (r === "-" && (a += r, r = e[++t]); r && o.test(r) || r === "."; )
        a += r, r = e[++t];
      n.push({
        type: "number",
        value: a
      });
      continue;
    }
    let i = /[a-z]/i;
    if (r && i.test(r)) {
      let a = "";
      for (; r && i.test(r) && t !== e.length; )
        a += r, r = e[++t];
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
}, Cy = (e) => {
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
}, Iy = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, Ff = (e) => JSON.parse(Iy(Cy(Tn(wy(e))))), Xe, Mt, pn, jn, ho, er, tr, po, nr, yt, rr, go, mo, Wt, yo, _o, or, Ki, Bl, vo, Ji, Wi, zi, Gl, Hl = "__json_buf";
function Vl(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var by = class Ss {
  constructor(t, n) {
    Xe.add(this), this.messages = [], this.receivedMessages = [], Mt.set(this, void 0), pn.set(this, null), this.controller = new AbortController(), jn.set(this, void 0), ho.set(this, () => {
    }), er.set(this, () => {
    }), tr.set(this, void 0), po.set(this, () => {
    }), nr.set(this, () => {
    }), yt.set(this, {}), rr.set(this, !1), go.set(this, !1), mo.set(this, !1), Wt.set(this, !1), yo.set(this, void 0), _o.set(this, void 0), or.set(this, void 0), vo.set(this, (r) => {
      if (U(this, go, !0, "f"), Br(r) && (r = new lt()), r instanceof lt)
        return U(this, mo, !0, "f"), this._emit("abort", r);
      if (r instanceof K) return this._emit("error", r);
      if (r instanceof Error) {
        const o = new K(r.message);
        return o.cause = r, this._emit("error", o);
      }
      return this._emit("error", new K(String(r)));
    }), U(this, jn, new Promise((r, o) => {
      U(this, ho, r, "f"), U(this, er, o, "f");
    }), "f"), U(this, tr, new Promise((r, o) => {
      U(this, po, r, "f"), U(this, nr, o, "f");
    }), "f"), w(this, jn, "f").catch(() => {
    }), w(this, tr, "f").catch(() => {
    }), U(this, pn, t, "f"), U(this, or, n?.logger ?? console, "f");
  }
  get response() {
    return w(this, yo, "f");
  }
  get request_id() {
    return w(this, _o, "f");
  }
  async withResponse() {
    U(this, Wt, !0, "f");
    const t = await w(this, jn, "f");
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
    for (const a of n.messages) i._addMessageParam(a);
    return U(i, pn, {
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
    }, w(this, vo, "f"));
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
      w(this, Xe, "m", Ji).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) w(this, Xe, "m", Wi).call(this, c);
      if (u.controller.signal?.aborted) throw new lt();
      w(this, Xe, "m", zi).call(this);
    } finally {
      o && i && o.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (U(this, yo, t, "f"), U(this, _o, t?.headers.get("request-id"), "f"), w(this, ho, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return w(this, rr, "f");
  }
  get errored() {
    return w(this, go, "f");
  }
  get aborted() {
    return w(this, mo, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (w(this, yt, "f")[t] || (w(this, yt, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const r = w(this, yt, "f")[t];
    if (!r) return this;
    const o = r.findIndex((i) => i.listener === n);
    return o >= 0 && r.splice(o, 1), this;
  }
  once(t, n) {
    return (w(this, yt, "f")[t] || (w(this, yt, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, r) => {
      U(this, Wt, !0, "f"), t !== "error" && this.once("error", r), this.once(t, n);
    });
  }
  async done() {
    U(this, Wt, !0, "f"), await w(this, tr, "f");
  }
  get currentMessage() {
    return w(this, Mt, "f");
  }
  async finalMessage() {
    return await this.done(), w(this, Xe, "m", Ki).call(this);
  }
  async finalText() {
    return await this.done(), w(this, Xe, "m", Bl).call(this);
  }
  _emit(t, ...n) {
    if (w(this, rr, "f")) return;
    t === "end" && (U(this, rr, !0, "f"), w(this, po, "f").call(this));
    const r = w(this, yt, "f")[t];
    if (r && (w(this, yt, "f")[t] = r.filter((o) => !o.once), r.forEach(({ listener: o }) => o(...n))), t === "abort") {
      const o = n[0];
      !w(this, Wt, "f") && !r?.length && Promise.reject(o), w(this, er, "f").call(this, o), w(this, nr, "f").call(this, o), this._emit("end");
      return;
    }
    if (t === "error") {
      const o = n[0];
      !w(this, Wt, "f") && !r?.length && Promise.reject(o), w(this, er, "f").call(this, o), w(this, nr, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", w(this, Xe, "m", Ki).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let o;
    r && (r.aborted && this.controller.abort(), o = this.controller.abort.bind(this.controller), r.addEventListener("abort", o));
    try {
      w(this, Xe, "m", Ji).call(this), this._connected(null);
      const i = Gr.fromReadableStream(t, this.controller);
      for await (const a of i) w(this, Xe, "m", Wi).call(this, a);
      if (i.controller.signal?.aborted) throw new lt();
      w(this, Xe, "m", zi).call(this);
    } finally {
      r && o && r.removeEventListener("abort", o);
    }
  }
  [(Mt = /* @__PURE__ */ new WeakMap(), pn = /* @__PURE__ */ new WeakMap(), jn = /* @__PURE__ */ new WeakMap(), ho = /* @__PURE__ */ new WeakMap(), er = /* @__PURE__ */ new WeakMap(), tr = /* @__PURE__ */ new WeakMap(), po = /* @__PURE__ */ new WeakMap(), nr = /* @__PURE__ */ new WeakMap(), yt = /* @__PURE__ */ new WeakMap(), rr = /* @__PURE__ */ new WeakMap(), go = /* @__PURE__ */ new WeakMap(), mo = /* @__PURE__ */ new WeakMap(), Wt = /* @__PURE__ */ new WeakMap(), yo = /* @__PURE__ */ new WeakMap(), _o = /* @__PURE__ */ new WeakMap(), or = /* @__PURE__ */ new WeakMap(), vo = /* @__PURE__ */ new WeakMap(), Xe = /* @__PURE__ */ new WeakSet(), Ki = function() {
    if (this.receivedMessages.length === 0) throw new K("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, Bl = function() {
    if (this.receivedMessages.length === 0) throw new K("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new K("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, Ji = function() {
    this.ended || U(this, Mt, void 0, "f");
  }, Wi = function(n) {
    if (this.ended) return;
    const r = w(this, Xe, "m", Gl).call(this, n);
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
        this._addMessageParam(r), this._addMessage(ql(r, w(this, pn, "f"), { logger: w(this, or, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", r.content.at(-1));
        break;
      case "message_start":
        U(this, Mt, r, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, zi = function() {
    if (this.ended) throw new K("stream has ended, this shouldn't happen");
    const n = w(this, Mt, "f");
    if (!n) throw new K("request ended without sending any chunks");
    return U(this, Mt, void 0, "f"), ql(n, w(this, pn, "f"), { logger: w(this, or, "f") });
  }, Gl = function(n) {
    let r = w(this, Mt, "f");
    if (n.type === "message_start") {
      if (r) throw new K(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!r) throw new K(`Unexpected event order, got ${n.type} before "message_start"`);
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
              const a = { ...o };
              if (Object.defineProperty(a, Hl, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i) try {
                a.input = Ff(i);
              } catch (u) {
                const c = new K(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${i}`);
                w(this, vo, "f").call(this, c);
              }
              r.content[n.index] = a;
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
    return new Gr(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, Of = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var Py = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
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
Wrap your summary in <summary></summary> tags.`, ir, gn, zt, de, Me, Fe, wt, Nt, sr, Kl, Es;
function Jl() {
  let e, t;
  return {
    promise: new Promise((n, r) => {
      e = n, t = r;
    }),
    resolve: e,
    reject: t
  };
}
var qf = class {
  constructor(e, t, n) {
    ir.add(this), this.client = e, gn.set(this, !1), zt.set(this, !1), de.set(this, void 0), Me.set(this, void 0), Fe.set(this, void 0), wt.set(this, void 0), Nt.set(this, void 0), sr.set(this, 0), U(this, de, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const r = ["BetaToolRunner", ...bf(t.tools, t.messages)].join(", ");
    U(this, Me, {
      ...n,
      headers: N([{ "x-stainless-helper": r }, n?.headers])
    }, "f"), U(this, Nt, Jl(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(gn = /* @__PURE__ */ new WeakMap(), zt = /* @__PURE__ */ new WeakMap(), de = /* @__PURE__ */ new WeakMap(), Me = /* @__PURE__ */ new WeakMap(), Fe = /* @__PURE__ */ new WeakMap(), wt = /* @__PURE__ */ new WeakMap(), Nt = /* @__PURE__ */ new WeakMap(), sr = /* @__PURE__ */ new WeakMap(), ir = /* @__PURE__ */ new WeakSet(), Kl = async function() {
    const t = w(this, de, "f").params.compactionControl;
    if (!t || !t.enabled) return !1;
    let n = 0;
    if (w(this, Fe, "f") !== void 0) try {
      const c = await w(this, Fe, "f");
      n = c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0) + c.usage.output_tokens;
    } catch {
      return !1;
    }
    const r = t.contextTokenThreshold ?? 1e5;
    if (n < r) return !1;
    const o = t.model ?? w(this, de, "f").params.model, i = t.summaryPrompt ?? Py, a = w(this, de, "f").params.messages;
    if (a[a.length - 1].role === "assistant") {
      const c = a[a.length - 1];
      if (Array.isArray(c.content)) {
        const d = c.content.filter((h) => h.type !== "tool_use");
        d.length === 0 ? a.pop() : c.content = d;
      }
    }
    const u = await this.client.beta.messages.create({
      model: o,
      messages: [...a, {
        role: "user",
        content: [{
          type: "text",
          text: i
        }]
      }],
      max_tokens: w(this, de, "f").params.max_tokens
    }, {
      signal: w(this, Me, "f").signal,
      headers: N([w(this, Me, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (u.content[0]?.type !== "text") throw new K("Expected text response for compaction");
    return w(this, de, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (w(this, gn, "f")) throw new K("Cannot iterate over a consumed stream");
    U(this, gn, !0, "f"), U(this, zt, !0, "f"), U(this, wt, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (w(this, de, "f").params.max_iterations && w(this, sr, "f") >= w(this, de, "f").params.max_iterations) break;
          U(this, zt, !1, "f"), U(this, wt, void 0, "f"), U(this, sr, (e = w(this, sr, "f"), e++, e), "f"), U(this, Fe, void 0, "f");
          const { max_iterations: n, compactionControl: r, ...o } = w(this, de, "f").params;
          if (o.stream ? (t = this.client.beta.messages.stream({ ...o }, w(this, Me, "f")), U(this, Fe, t.finalMessage(), "f"), w(this, Fe, "f").catch(() => {
          }), yield t) : (U(this, Fe, this.client.beta.messages.create({
            ...o,
            stream: !1
          }, w(this, Me, "f")), "f"), yield w(this, Fe, "f")), !await w(this, ir, "m", Kl).call(this)) {
            if (!w(this, zt, "f")) {
              const { role: a, content: u } = await w(this, Fe, "f");
              w(this, de, "f").params.messages.push({
                role: a,
                content: u
              });
            }
            const i = await w(this, ir, "m", Es).call(this, w(this, de, "f").params.messages.at(-1));
            if (i) w(this, de, "f").params.messages.push(i);
            else if (!w(this, zt, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!w(this, Fe, "f")) throw new K("ToolRunner concluded without a message from the server");
      w(this, Nt, "f").resolve(await w(this, Fe, "f"));
    } catch (t) {
      throw U(this, gn, !1, "f"), w(this, Nt, "f").promise.catch(() => {
      }), w(this, Nt, "f").reject(t), U(this, Nt, Jl(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? w(this, de, "f").params = e(w(this, de, "f").params) : w(this, de, "f").params = e, U(this, zt, !0, "f"), U(this, wt, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? U(this, Me, e(w(this, Me, "f")), "f") : U(this, Me, {
      ...w(this, Me, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = w(this, Me, "f").signal) {
    const t = await w(this, Fe, "f") ?? this.params.messages.at(-1);
    return t ? w(this, ir, "m", Es).call(this, t, e) : null;
  }
  done() {
    return w(this, Nt, "f").promise;
  }
  async runUntilDone() {
    if (!w(this, gn, "f")) for await (const e of this) ;
    return this.done();
  }
  get params() {
    return w(this, de, "f").params;
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
Es = async function(t, n = w(this, Me, "f").signal) {
  return w(this, wt, "f") !== void 0 ? w(this, wt, "f") : (U(this, wt, Ry(w(this, de, "f").params, t, {
    ...w(this, Me, "f"),
    signal: n
  }), "f"), w(this, wt, "f"));
};
async function Ry(e, t = e.messages.at(-1), n) {
  if (!t || t.role !== "assistant" || !t.content || typeof t.content == "string") return null;
  const r = t.content.filter((o) => o.type === "tool_use");
  return r.length === 0 ? null : {
    role: "user",
    content: await Promise.all(r.map(async (o) => {
      const i = e.tools.find((a) => ("name" in a ? a.name : a.mcp_server_name) === o.name);
      if (!i || !("run" in i)) return {
        type: "tool_result",
        tool_use_id: o.id,
        content: `Error: Tool '${o.name}' not found`,
        is_error: !0
      };
      try {
        let a = o.input;
        "parse" in i && i.parse && (a = i.parse(a));
        const u = await i.run(a, {
          toolUseBlock: o,
          signal: n?.signal
        });
        return {
          type: "tool_result",
          tool_use_id: o.id,
          content: u
        };
      } catch (a) {
        return {
          type: "tool_result",
          tool_use_id: o.id,
          content: a instanceof Of ? a.content : `Error: ${a instanceof Error ? a.message : String(a)}`,
          is_error: !0
        };
      }
    }))
  };
}
var Bf = class Gf {
  constructor(t, n) {
    this.iterator = t, this.controller = n;
  }
  async *decoder() {
    const t = new Yr();
    for await (const n of this.iterator) for (const r of t.decode(n)) yield JSON.parse(r);
    for (const n of t.flush()) yield JSON.parse(n);
  }
  [Symbol.asyncIterator]() {
    return this.decoder();
  }
  static fromResponse(t, n) {
    if (!t.body)
      throw n.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new K("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new K("Attempted to iterate over a response with no body");
    return new Gf(ga(t.body), n);
  }
}, Hf = class extends oe {
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
    return this._client.getAPIList("/v1/messages/batches?beta=true", Xr, {
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
    if (!r.results_url) throw new K(`No batch \`results_url\`; Has it finished processing? ${r.processing_status} - ${r.id}`);
    const { betas: o } = t ?? {};
    return this._client.get(r.results_url, {
      ...n,
      headers: N([{
        "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((i, a) => Bf.fromResponse(a.response, a.controller));
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
}, xy = ["claude-mythos-preview", "claude-opus-4-6"], Qr = class extends oe {
  constructor() {
    super(...arguments), this.batches = new Hf(this._client);
  }
  create(e, t) {
    const n = zl(e), { betas: r, ...o } = n;
    o.model in Wl && console.warn(`The model '${o.model}' is deprecated and will reach end-of-life on ${Wl[o.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), xy.includes(o.model) && o.thinking && o.thinking.type === "enabled" && console.warn(`Using Claude with ${o.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let i = this._client._options.timeout;
    if (!o.stream && i == null) {
      const u = $f[o.model] ?? void 0;
      i = this._client.calculateNonstreamingTimeout(o.max_tokens, u);
    }
    const a = Pf(o.tools, o.messages);
    return this._client.post("/v1/messages?beta=true", {
      body: o,
      timeout: i ?? 6e5,
      ...t,
      headers: N([
        { ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 },
        a,
        t?.headers
      ]),
      stream: n.stream ?? !1
    });
  }
  parse(e, t) {
    return t = {
      ...t,
      headers: N([{ "anthropic-beta": [...e.betas ?? [], "structured-outputs-2025-12-15"].toString() }, t?.headers])
    }, this.create(e, t).then((n) => Uf(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return by.createMessage(this, e, t);
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
    return new qf(this._client, e, t);
  }
};
function zl(e) {
  if (!e.output_format) return e;
  if (e.output_config?.format) throw new K("Both output_format and output_config.format were provided. Please use only output_config.format (output_format is deprecated).");
  const { output_format: t, ...n } = e;
  return {
    ...n,
    output_config: {
      ...e.output_config,
      format: t
    }
  };
}
Qr.Batches = Hf;
Qr.BetaToolRunner = qf;
Qr.ToolError = Of;
var Vf = class extends oe {
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
}, Kf = class extends oe {
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
}, wi = class extends oe {
  constructor() {
    super(...arguments), this.events = new Vf(this._client), this.resources = new Kf(this._client);
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
wi.Events = Vf;
wi.Resources = Kf;
var Jf = class extends oe {
  create(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.post(q`/v1/skills/${e}/versions?beta=true`, ya({
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
}, va = class extends oe {
  constructor() {
    super(...arguments), this.versions = new Jf(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.post("/v1/skills?beta=true", ya({
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
va.Versions = Jf;
var Wf = class extends oe {
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
}, Aa = class extends oe {
  constructor() {
    super(...arguments), this.credentials = new Wf(this._client);
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
Aa.Credentials = Wf;
var tt = class extends oe {
  constructor() {
    super(...arguments), this.models = new xf(this._client), this.messages = new Qr(this._client), this.agents = new _a(this._client), this.environments = new If(this._client), this.sessions = new wi(this._client), this.vaults = new Aa(this._client), this.memoryStores = new Ei(this._client), this.files = new Rf(this._client), this.skills = new va(this._client), this.userProfiles = new Mf(this._client);
  }
};
tt.Models = xf;
tt.Messages = Qr;
tt.Agents = _a;
tt.Environments = If;
tt.Sessions = wi;
tt.Vaults = Aa;
tt.MemoryStores = Ei;
tt.Files = Rf;
tt.Skills = va;
tt.UserProfiles = Mf;
var zf = class extends oe {
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
function Yf(e) {
  return e?.output_config?.format;
}
function Yl(e, t, n) {
  const r = Yf(t);
  return !t || !("parse" in (r ?? {})) ? {
    ...e,
    content: e.content.map((o) => o.type === "text" ? Object.defineProperty({ ...o }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : o),
    parsed_output: null
  } : Xf(e, t, n);
}
function Xf(e, t, n) {
  let r = null;
  const o = e.content.map((i) => {
    if (i.type === "text") {
      const a = My(t, i.text);
      return r === null && (r = a), Object.defineProperty({ ...i }, "parsed_output", {
        value: a,
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
function My(e, t) {
  const n = Yf(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new K(`Failed to parse structured output: ${r}`);
  }
}
var Qe, kt, mn, ar, Ao, lr, ur, To, cr, _t, dr, So, Eo, Yt, wo, Co, fr, Yi, Xl, Xi, Qi, Zi, ji, Ql, Zl = "__json_buf";
function jl(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var Ny = class ws {
  constructor(t, n) {
    Qe.add(this), this.messages = [], this.receivedMessages = [], kt.set(this, void 0), mn.set(this, null), this.controller = new AbortController(), ar.set(this, void 0), Ao.set(this, () => {
    }), lr.set(this, () => {
    }), ur.set(this, void 0), To.set(this, () => {
    }), cr.set(this, () => {
    }), _t.set(this, {}), dr.set(this, !1), So.set(this, !1), Eo.set(this, !1), Yt.set(this, !1), wo.set(this, void 0), Co.set(this, void 0), fr.set(this, void 0), Xi.set(this, (r) => {
      if (U(this, So, !0, "f"), Br(r) && (r = new lt()), r instanceof lt)
        return U(this, Eo, !0, "f"), this._emit("abort", r);
      if (r instanceof K) return this._emit("error", r);
      if (r instanceof Error) {
        const o = new K(r.message);
        return o.cause = r, this._emit("error", o);
      }
      return this._emit("error", new K(String(r)));
    }), U(this, ar, new Promise((r, o) => {
      U(this, Ao, r, "f"), U(this, lr, o, "f");
    }), "f"), U(this, ur, new Promise((r, o) => {
      U(this, To, r, "f"), U(this, cr, o, "f");
    }), "f"), w(this, ar, "f").catch(() => {
    }), w(this, ur, "f").catch(() => {
    }), U(this, mn, t, "f"), U(this, fr, n?.logger ?? console, "f");
  }
  get response() {
    return w(this, wo, "f");
  }
  get request_id() {
    return w(this, Co, "f");
  }
  async withResponse() {
    U(this, Yt, !0, "f");
    const t = await w(this, ar, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new ws(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, r, { logger: o } = {}) {
    const i = new ws(n, { logger: o });
    for (const a of n.messages) i._addMessageParam(a);
    return U(i, mn, {
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
    }, w(this, Xi, "f"));
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
      w(this, Qe, "m", Qi).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) w(this, Qe, "m", Zi).call(this, c);
      if (u.controller.signal?.aborted) throw new lt();
      w(this, Qe, "m", ji).call(this);
    } finally {
      o && i && o.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (U(this, wo, t, "f"), U(this, Co, t?.headers.get("request-id"), "f"), w(this, Ao, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return w(this, dr, "f");
  }
  get errored() {
    return w(this, So, "f");
  }
  get aborted() {
    return w(this, Eo, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (w(this, _t, "f")[t] || (w(this, _t, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const r = w(this, _t, "f")[t];
    if (!r) return this;
    const o = r.findIndex((i) => i.listener === n);
    return o >= 0 && r.splice(o, 1), this;
  }
  once(t, n) {
    return (w(this, _t, "f")[t] || (w(this, _t, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, r) => {
      U(this, Yt, !0, "f"), t !== "error" && this.once("error", r), this.once(t, n);
    });
  }
  async done() {
    U(this, Yt, !0, "f"), await w(this, ur, "f");
  }
  get currentMessage() {
    return w(this, kt, "f");
  }
  async finalMessage() {
    return await this.done(), w(this, Qe, "m", Yi).call(this);
  }
  async finalText() {
    return await this.done(), w(this, Qe, "m", Xl).call(this);
  }
  _emit(t, ...n) {
    if (w(this, dr, "f")) return;
    t === "end" && (U(this, dr, !0, "f"), w(this, To, "f").call(this));
    const r = w(this, _t, "f")[t];
    if (r && (w(this, _t, "f")[t] = r.filter((o) => !o.once), r.forEach(({ listener: o }) => o(...n))), t === "abort") {
      const o = n[0];
      !w(this, Yt, "f") && !r?.length && Promise.reject(o), w(this, lr, "f").call(this, o), w(this, cr, "f").call(this, o), this._emit("end");
      return;
    }
    if (t === "error") {
      const o = n[0];
      !w(this, Yt, "f") && !r?.length && Promise.reject(o), w(this, lr, "f").call(this, o), w(this, cr, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", w(this, Qe, "m", Yi).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let o;
    r && (r.aborted && this.controller.abort(), o = this.controller.abort.bind(this.controller), r.addEventListener("abort", o));
    try {
      w(this, Qe, "m", Qi).call(this), this._connected(null);
      const i = Gr.fromReadableStream(t, this.controller);
      for await (const a of i) w(this, Qe, "m", Zi).call(this, a);
      if (i.controller.signal?.aborted) throw new lt();
      w(this, Qe, "m", ji).call(this);
    } finally {
      r && o && r.removeEventListener("abort", o);
    }
  }
  [(kt = /* @__PURE__ */ new WeakMap(), mn = /* @__PURE__ */ new WeakMap(), ar = /* @__PURE__ */ new WeakMap(), Ao = /* @__PURE__ */ new WeakMap(), lr = /* @__PURE__ */ new WeakMap(), ur = /* @__PURE__ */ new WeakMap(), To = /* @__PURE__ */ new WeakMap(), cr = /* @__PURE__ */ new WeakMap(), _t = /* @__PURE__ */ new WeakMap(), dr = /* @__PURE__ */ new WeakMap(), So = /* @__PURE__ */ new WeakMap(), Eo = /* @__PURE__ */ new WeakMap(), Yt = /* @__PURE__ */ new WeakMap(), wo = /* @__PURE__ */ new WeakMap(), Co = /* @__PURE__ */ new WeakMap(), fr = /* @__PURE__ */ new WeakMap(), Xi = /* @__PURE__ */ new WeakMap(), Qe = /* @__PURE__ */ new WeakSet(), Yi = function() {
    if (this.receivedMessages.length === 0) throw new K("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, Xl = function() {
    if (this.receivedMessages.length === 0) throw new K("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new K("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, Qi = function() {
    this.ended || U(this, kt, void 0, "f");
  }, Zi = function(n) {
    if (this.ended) return;
    const r = w(this, Qe, "m", Ql).call(this, n);
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
        this._addMessageParam(r), this._addMessage(Yl(r, w(this, mn, "f"), { logger: w(this, fr, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", r.content.at(-1));
        break;
      case "message_start":
        U(this, kt, r, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, ji = function() {
    if (this.ended) throw new K("stream has ended, this shouldn't happen");
    const n = w(this, kt, "f");
    if (!n) throw new K("request ended without sending any chunks");
    return U(this, kt, void 0, "f"), Yl(n, w(this, mn, "f"), { logger: w(this, fr, "f") });
  }, Ql = function(n) {
    let r = w(this, kt, "f");
    if (n.type === "message_start") {
      if (r) throw new K(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!r) throw new K(`Unexpected event order, got ${n.type} before "message_start"`);
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
              const a = { ...o };
              Object.defineProperty(a, Zl, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i && (a.input = Ff(i)), r.content[n.index] = a;
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
    return new Gr(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, Qf = class extends oe {
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
    return this._client.getAPIList("/v1/messages/batches", Xr, {
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
    if (!n.results_url) throw new K(`No batch \`results_url\`; Has it finished processing? ${n.processing_status} - ${n.id}`);
    return this._client.get(n.results_url, {
      ...t,
      headers: N([{ Accept: "application/binary" }, t?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((r, o) => Bf.fromResponse(o.response, o.controller));
  }
}, Ta = class extends oe {
  constructor() {
    super(...arguments), this.batches = new Qf(this._client);
  }
  create(e, t) {
    e.model in eu && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${eu[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), ky.includes(e.model) && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const o = $f[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, o);
    }
    const r = Pf(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: N([r, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => Xf(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Ny.createMessage(this, e, t, { logger: this._client.logger ?? console });
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
}, ky = ["claude-mythos-preview", "claude-opus-4-6"];
Ta.Batches = Qf;
var Zf = class extends oe {
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/models/${e}`, {
      ...n,
      headers: N([{ ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/models", Xr, {
      query: r,
      ...t,
      headers: N([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Io = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, Cs, Sa, Ho, jf, Dy = "\\n\\nHuman:", $y = "\\n\\nAssistant:", le = class {
  constructor({ baseURL: e = Io("ANTHROPIC_BASE_URL"), apiKey: t = Io("ANTHROPIC_API_KEY") ?? null, authToken: n = Io("ANTHROPIC_AUTH_TOKEN") ?? null, ...r } = {}) {
    Cs.add(this), Ho.set(this, void 0);
    const o = {
      apiKey: t,
      authToken: n,
      ...r,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!o.dangerouslyAllowBrowser && Ym()) throw new K(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = o.baseURL, this.timeout = o.timeout ?? Sa.DEFAULT_TIMEOUT, this.logger = o.logger ?? console;
    const i = "warn";
    this.logLevel = i, this.logLevel = Ll(o.logLevel, "ClientOptions.logLevel", this) ?? Ll(Io("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? i, this.fetchOptions = o.fetchOptions, this.maxRetries = o.maxRetries ?? 2, this.fetch = o.fetch ?? ey(), U(this, Ho, ny, "f"), this._options = o, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
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
    return ry(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${An}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${nf()}`;
  }
  makeStatusError(e, t, n, r) {
    return Je.generate(e, t, n, r);
  }
  buildURL(e, t, n) {
    const r = !w(this, Cs, "m", jf).call(this) && n || this.baseURL, o = Km(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), a = Object.fromEntries(o.searchParams);
    return (!Rl(i) || !Rl(a)) && (t = {
      ...a,
      ...i,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (o.search = this.stringifyQuery(t)), o.toString();
  }
  _calculateNonstreamingTimeout(e) {
    if (3600 * e / 128e3 > 600) throw new K("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#streaming-responses for more details");
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
    return new _f(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const r = await e, o = r.maxRetries ?? this.maxRetries;
    t == null && (t = o), await this.prepareOptions(r);
    const { req: i, url: a, timeout: u } = await this.buildRequest(r, { retryCount: o - t });
    await this.prepareRequest(i, {
      url: a,
      options: r
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, h = Date.now();
    if (be(this).debug(`[${c}] sending request`, Qt({
      retryOfRequestLogID: n,
      method: r.method,
      url: a,
      options: r,
      headers: i.headers
    })), r.signal?.aborted) throw new lt();
    const f = new AbortController(), p = await this.fetchWithTimeout(a, i, u, f).catch(ms), g = Date.now();
    if (p instanceof globalThis.Error) {
      const _ = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new lt();
      const v = Br(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (t)
        return be(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - ${_}`), be(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (${_})`, Qt({
          retryOfRequestLogID: n,
          url: a,
          durationMs: g - h,
          message: p.message
        })), this.retryRequest(r, t, n ?? c);
      throw be(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - error; no more retries left`), be(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (error; no more retries left)`, Qt({
        retryOfRequestLogID: n,
        url: a,
        durationMs: g - h,
        message: p.message
      })), v ? new rf() : new Si({ cause: p });
    }
    const y = `[${c}${d}${[...p.headers.entries()].filter(([_]) => _ === "request-id").map(([_, v]) => ", " + _ + ": " + JSON.stringify(v)).join("")}] ${i.method} ${a} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${g - h}ms`;
    if (!p.ok) {
      const _ = await this.shouldRetry(p);
      if (t && _) {
        const P = `retrying, ${t} attempts remaining`;
        return await ty(p.body), be(this).info(`${y} - ${P}`), be(this).debug(`[${c}] response error (${P})`, Qt({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: g - h
        })), this.retryRequest(r, t, n ?? c, p.headers);
      }
      const v = _ ? "error; no more retries left" : "error; not retryable";
      be(this).info(`${y} - ${v}`);
      const E = await p.text().catch((P) => ms(P).message), b = hf(E), R = b ? void 0 : E;
      throw be(this).debug(`[${c}] response error (${v})`, Qt({
        retryOfRequestLogID: n,
        url: p.url,
        status: p.status,
        headers: p.headers,
        message: R,
        durationMs: Date.now() - h
      })), this.makeStatusError(p.status, b, R, p.headers);
    }
    return be(this).info(y), be(this).debug(`[${c}] response start`, Qt({
      retryOfRequestLogID: n,
      url: p.url,
      status: p.status,
      headers: p.headers,
      durationMs: g - h
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
    return new fy(this, n, e);
  }
  async fetchWithTimeout(e, t, n, r) {
    const { signal: o, method: i, ...a } = t || {}, u = this._makeAbort(r);
    o && o.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && a.body instanceof globalThis.ReadableStream || typeof a.body == "object" && a.body !== null && Symbol.asyncIterator in a.body, h = {
      signal: r.signal,
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
  async retryRequest(e, t, n, r) {
    let o;
    const i = r?.get("retry-after-ms");
    if (i) {
      const u = parseFloat(i);
      Number.isNaN(u) || (o = u);
    }
    const a = r?.get("retry-after");
    if (a && !o) {
      const u = parseFloat(a);
      Number.isNaN(u) ? o = Date.parse(a) - Date.now() : o = u * 1e3;
    }
    if (o === void 0) {
      const u = e.maxRetries ?? this.maxRetries;
      o = this.calculateDefaultRetryTimeoutMillis(t, u);
    }
    return await zm(o), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const o = t - e;
    return Math.min(0.5 * Math.pow(2, o), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  calculateNonstreamingTimeout(e, t) {
    if (36e5 * e / 128e3 > 6e5 || t != null && e > t) throw new K("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details");
    return 6e5;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: r, path: o, query: i, defaultBaseURL: a } = n, u = this.buildURL(o, i, a);
    "timeout" in n && Wm("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
        ...jm(),
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
      body: gf(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : w(this, Ho, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
Sa = le, Ho = /* @__PURE__ */ new WeakMap(), Cs = /* @__PURE__ */ new WeakSet(), jf = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
le.Anthropic = Sa;
le.HUMAN_PROMPT = Dy;
le.AI_PROMPT = $y;
le.DEFAULT_TIMEOUT = 6e5;
le.AnthropicError = K;
le.APIError = Je;
le.APIConnectionError = Si;
le.APIConnectionTimeoutError = rf;
le.APIUserAbortError = lt;
le.NotFoundError = lf;
le.ConflictError = uf;
le.RateLimitError = df;
le.BadRequestError = of;
le.AuthenticationError = sf;
le.InternalServerError = ff;
le.PermissionDeniedError = af;
le.UnprocessableEntityError = cf;
le.toFile = _y;
var Zr = class extends le {
  constructor() {
    super(...arguments), this.completions = new zf(this), this.messages = new Ta(this), this.models = new Zf(this), this.beta = new tt(this);
  }
};
Zr.Completions = zf;
Zr.Messages = Ta;
Zr.Models = Zf;
Zr.Beta = tt;
function ln(e) {
  if (Array.isArray(e)) return e.map((n) => ln(n));
  if (!e || typeof e != "object") return e;
  const t = {};
  return Object.entries(e).forEach(([n, r]) => {
    t[n] = /authorization|csrf|token|api[-_]?key|proxy_password|password/i.test(n) ? "[redacted]" : ln(r);
  }), t;
}
function qt(e = {}, t = {}) {
  const n = String(e.reasoning?.mode || "inherit"), r = e.reasoning?.output === "show" ? "show" : "hide", o = String(t.effectiveMode || n);
  return {
    reasoningRequestedMode: n,
    reasoningRequestedOutput: r,
    reasoningProfileId: String(t.profileId || e.reasoning?.profileId || "unsupported"),
    reasoningEffectiveMode: o,
    reasoningEffort: o === "on" ? String(t.effort ?? e.reasoning?.effort ?? "") : "",
    reasoningBudgetTokens: o === "on" && Number.isFinite(Number(t.budgetTokens ?? e.reasoning?.budgetTokens)) ? Number(t.budgetTokens ?? e.reasoning?.budgetTokens) : null,
    reasoningControlFields: ln(t.controlFields || {}),
    reasoningOutputVisible: o !== "off" && r === "show"
  };
}
function Hr(e = {}) {
  return {
    provider: e.provider || "",
    model: e.model || "",
    transport: e.transport || "sdk",
    request: ln({
      url: e.url || "",
      method: e.method || "POST",
      headers: e.headers || {},
      body: e.body || {},
      sdk: e.sdk || void 0
    }),
    ...e.effectiveConfig ? { effectiveConfig: e.effectiveConfig } : {}
  };
}
var Ly = Object.freeze({
  minimal: "最小",
  low: "低",
  medium: "中",
  high: "高",
  xhigh: "超高",
  max: "最大",
  min: "最小"
});
function Ci(e) {
  const t = e.intensity || { kind: "none" };
  return Object.freeze({
    ...e,
    modes: Object.freeze([...e.modes || ["inherit"]]),
    intensity: Object.freeze({
      ...t,
      ...Array.isArray(t.values) ? { values: Object.freeze([...t.values]) } : {}
    })
  });
}
function he(e, t, n, r, o = {}) {
  return Ci({
    profileId: e,
    modes: t,
    intensity: {
      kind: "effort",
      values: n,
      defaultValue: r
    },
    omitTemperatureWhenOn: o.omitTemperatureWhenOn === !0
  });
}
function Ea(e, t, n, r = {}) {
  return Ci({
    profileId: e,
    modes: t,
    intensity: {
      kind: "budget",
      min: n.min,
      max: n.max,
      defaultValue: n.defaultValue,
      allowAuto: n.allowAuto === !0
    },
    omitTemperatureWhenOn: r.omitTemperatureWhenOn === !0
  });
}
function Uy(e, t, n = {}) {
  return Ci({
    profileId: e,
    modes: t,
    intensity: { kind: "none" },
    omitTemperatureWhenOn: n.omitTemperatureWhenOn === !0
  });
}
var ut = Ci({
  profileId: "unsupported",
  modes: ["inherit"],
  intensity: { kind: "none" },
  omitTemperatureWhenOn: !1,
  unsupportedReason: "当前 Provider、传输方式与模型组合没有已验证的 Reasoning 控制协议。"
}), Xt = Object.freeze({
  latest: he("openai-gpt-5.6", [
    "inherit",
    "on",
    "off"
  ], [
    "low",
    "medium",
    "high",
    "xhigh",
    "max"
  ], "medium", { omitTemperatureWhenOn: !0 }),
  gpt55: he("openai-gpt-5.5", [
    "inherit",
    "on",
    "off"
  ], [
    "low",
    "medium",
    "high",
    "xhigh"
  ], "medium", { omitTemperatureWhenOn: !0 }),
  gpt52To54: he("openai-gpt-5.2-5.4", [
    "inherit",
    "on",
    "off"
  ], [
    "low",
    "medium",
    "high",
    "xhigh"
  ], "medium", { omitTemperatureWhenOn: !0 }),
  gpt51: he("openai-gpt-5.1", [
    "inherit",
    "on",
    "off"
  ], [
    "low",
    "medium",
    "high"
  ], "medium", { omitTemperatureWhenOn: !0 }),
  fixedMedium: he("openai-gpt-5.3-chat", ["inherit", "on"], ["medium"], "medium", { omitTemperatureWhenOn: !0 }),
  gpt5: he("openai-gpt-5", ["inherit", "on"], [
    "minimal",
    "low",
    "medium",
    "high"
  ], "medium", { omitTemperatureWhenOn: !0 }),
  oSeries: he("openai-o-series", ["inherit", "on"], [
    "low",
    "medium",
    "high"
  ], "medium", { omitTemperatureWhenOn: !0 })
}), Fy = /* @__PURE__ */ new Set([
  "o1",
  "o3-mini",
  "o3-mini-2025-01-31",
  "o4-mini",
  "o4-mini-2025-04-16",
  "o3",
  "o3-2025-04-16",
  "gpt-5",
  "gpt-5-2025-08-07",
  "gpt-5-mini",
  "gpt-5-mini-2025-08-07",
  "gpt-5-nano",
  "gpt-5-nano-2025-08-07",
  "gpt-5.1",
  "gpt-5.1-2025-11-13",
  "gpt-5.1-chat-latest",
  "gpt-5.2",
  "gpt-5.2-2025-12-11",
  "gpt-5.2-chat-latest",
  "gpt-5.3-chat-latest",
  "gpt-5.4",
  "gpt-5.4-2026-03-05",
  "gpt-5.4-mini",
  "gpt-5.4-mini-2026-03-17",
  "gpt-5.4-nano",
  "gpt-5.4-nano-2026-03-17",
  "gpt-5.5",
  "gpt-5.5-2026-04-23"
]), Oy = he("kimi-k3", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "max", { omitTemperatureWhenOn: !0 }), qy = Uy("kimi-k2.5-k2.6", [
  "inherit",
  "on",
  "off"
], { omitTemperatureWhenOn: !0 }), By = he("deepseek-thinking", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "high", { omitTemperatureWhenOn: !0 }), tu = he("anthropic-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { omitTemperatureWhenOn: !0 }), Gy = Ea("anthropic-manual", [
  "inherit",
  "on",
  "off"
], {
  min: 1024,
  max: 128e3,
  defaultValue: 8192
}, { omitTemperatureWhenOn: !0 }), Hy = he("sillytavern-claude-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "max"
], "high", { omitTemperatureWhenOn: !0 }), Vy = he("sillytavern-claude-adaptive-conditional", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "max"
], "high", { omitTemperatureWhenOn: !0 }), Ky = he("sillytavern-claude-manual", [
  "inherit",
  "on",
  "off"
], [
  "min",
  "low",
  "medium",
  "high",
  "max"
], "medium", { omitTemperatureWhenOn: !0 }), Jy = Ea("google-gemini-2.5-flash", [
  "inherit",
  "on",
  "off"
], {
  min: 1,
  max: 24576,
  defaultValue: -1,
  allowAuto: !0
}), Wy = Ea("google-gemini-2.5-pro", ["inherit", "on"], {
  min: 128,
  max: 32768,
  defaultValue: -1,
  allowAuto: !0
}), zy = he("google-gemini-3-flash", ["inherit", "on"], [
  "minimal",
  "low",
  "medium",
  "high"
], "high"), Yy = he("google-gemini-3-pro", ["inherit", "on"], ["low", "high"], "high"), Xy = he("sillytavern-google-2.5-flash", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "max"
], "medium"), Qy = he("sillytavern-google-2.5-pro", ["inherit", "on"], [
  "min",
  "low",
  "medium",
  "high",
  "max"
], "medium"), Zy = he("sillytavern-google-3-flash", ["inherit", "on"], [
  "min",
  "low",
  "medium",
  "high"
], "high"), jy = he("sillytavern-google-3-pro", ["inherit", "on"], ["low", "high"], "high");
function jr(e = "") {
  return String(e || "").trim().toLowerCase();
}
function Is(e = "") {
  const t = jr(e);
  return /^gpt-5\.6(?:[-.]|$)/.test(t) ? Xt.latest : /^gpt-5\.5(?:[-.]|$)/.test(t) ? Xt.gpt55 : /^gpt-5\.3-chat-latest(?:[-.]|$)/.test(t) ? Xt.fixedMedium : /^gpt-5\.(?:2|4)(?:[-.]|$)/.test(t) ? Xt.gpt52To54 : /^gpt-5\.1(?:[-.]|$)/.test(t) ? Xt.gpt51 : /^gpt-5(?:-(?:mini|nano))?(?:-|$)/.test(t) ? Xt.gpt5 : /^o(?:1|3|3-mini|4-mini)(?:-|$)/.test(t) ? Xt.oSeries : null;
}
function e_(e = "", t = "") {
  const n = jr(t), r = String(e || "").trim().toLowerCase();
  return /^kimi-k3(?:[.-]|$)/.test(n) ? Oy : /^kimi-k2[.-](?:5|6)(?:[.-]|$)/.test(n) ? qy : /^kimi-k2[.-]7(?:[.-]|$)/.test(n) ? ut : /^deepseek-(?:chat|reasoner|v3)/.test(n) || r.includes("api.deepseek.com") && n.startsWith("deepseek-") ? By : Is(n) || ut;
}
function nu(e = "", t = !1) {
  const n = jr(e);
  return /^claude-opus-4-7/.test(n) ? t ? Hy : tu : /^claude-(?:opus-4-6|sonnet-4-6)/.test(n) ? t ? Vy : tu : /^claude-(?:3-7|opus-4|sonnet-4|haiku-4-5)/.test(n) ? t ? Ky : Gy : ut;
}
function ru(e = "", t = !1) {
  const n = jr(e);
  return n.includes("image") ? ut : /^gemini-2\.5-flash/.test(n) ? t ? Xy : Jy : /^gemini-2\.5-pro/.test(n) ? t ? Qy : Wy : /^gemini-3(?:[.\d]*)?-flash/.test(n) ? t ? Zy : zy : /^gemini-3(?:[.\d]*)?-pro/.test(n) ? t ? jy : Yy : ut;
}
function eo(e = {}) {
  const t = String(e.provider || "").trim(), n = jr(e.model);
  switch (t) {
    case "openai-responses":
      return Is(n) || ut;
    case "openai-compatible":
      return e_(e.baseUrl, n);
    case "sillytavern-openai-compatible":
      return Fy.has(n) && Is(n) || ut;
    case "anthropic":
      return nu(n, !1);
    case "sillytavern-claude":
      return nu(n, !0);
    case "google":
      return ru(n, !1);
    case "sillytavern-google":
      return ru(n, !0);
    default:
      return ut;
  }
}
function t_(e = ut) {
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
function n_(e = ut) {
  return e.intensity?.kind !== "effort" ? [] : e.intensity.values.map((t) => ({
    value: t,
    label: Ly[t] || t
  }));
}
function es(e, t, n) {
  return {
    ...e,
    profileId: t.profileId,
    valid: !1,
    error: n
  };
}
function r_(e, t) {
  const n = { ...e };
  return delete n.effort, delete n.budgetTokens, t.intensity?.kind === "effort" ? {
    ...n,
    ...e.effort ? { effort: e.effort } : {}
  } : t.intensity?.kind === "budget" ? {
    ...n,
    ...e.budgetTokens !== void 0 ? { budgetTokens: e.budgetTokens } : {}
  } : n;
}
function $n(e = {}, t = {}) {
  const n = eo(e), r = r_(On(t), n);
  if (!n.modes.includes(r.mode)) return es(r, n, r.mode === "off" ? "当前模型不支持显式关闭 Reasoning。请选择“跟随模型默认”。" : n.unsupportedReason || "当前模型不支持显式开启 Reasoning。");
  if (r.mode !== "on") return {
    ...r,
    profileId: n.profileId,
    valid: !0
  };
  if (n.intensity.kind === "effort") {
    const o = r.effort || n.intensity.defaultValue;
    return n.intensity.values.includes(o) ? {
      ...r,
      effort: o,
      profileId: n.profileId,
      valid: !0
    } : es(r, n, `当前模型不支持 Reasoning 强度“${o}”。`);
  }
  if (n.intensity.kind === "budget") {
    const o = r.budgetTokens ?? n.intensity.defaultValue;
    return !(n.intensity.allowAuto && o === -1) && (!Number.isInteger(o) || o < n.intensity.min || o > n.intensity.max) ? es(r, n, `Reasoning Token 预算必须在 ${n.intensity.min}–${n.intensity.max} 之间${n.intensity.allowAuto ? "，或填写 -1 使用自动预算" : ""}。`) : {
      ...r,
      budgetTokens: o,
      profileId: n.profileId,
      valid: !0
    };
  }
  return {
    ...r,
    profileId: n.profileId,
    valid: !0
  };
}
var o_ = class extends Error {
  constructor(e = {}) {
    super(e.error || "当前模型不支持所选 Reasoning 配置。"), this.name = "ReasoningCapabilityError", this.code = "REASONING_CAPABILITY_UNSUPPORTED", this.profileId = e.profileId || "unsupported", this.reasoning = e;
  }
};
function eh(e = {}) {
  if (e.valid === !1) throw new o_(e);
  return e;
}
function xe(e = "", t = {}, n = {}) {
  return eh($n({
    provider: e,
    baseUrl: t.baseUrl,
    model: t.model
  }, n));
}
function to(e = {}, t = {}) {
  const n = eo(e);
  return t.mode === "on" && n.omitTemperatureWhenOn === !0;
}
function i_(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function s_(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? {
    mediaType: t[1],
    data: t[2]
  } : {
    mediaType: "",
    data: ""
  };
}
function th(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function a_(e) {
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
      const r = s_(n.image_url.url);
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
function l_(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function u_(e) {
  const t = e?.providerPayload?.anthropicContent;
  return Array.isArray(t) && t.length && th(t) || null;
}
function c_(e) {
  return Array.isArray(e?.content) && e.content.length ? { anthropicContent: th(e.content) || [] } : void 0;
}
function ou(e = {}) {
  return {
    type: "tool_result",
    tool_use_id: e.tool_call_id,
    content: e.content
  };
}
function iu(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    return n ? {
      type: "tool_use",
      id: t.id,
      name: n,
      input: i_(t.function.arguments)
    } : null;
  }).filter(Boolean);
}
function d_(e) {
  const t = [];
  for (let n = 0; n < e.length; n += 1) {
    const r = e[n];
    if (r.role !== "system") {
      if (r.role === "assistant") {
        const o = u_(r), i = iu(r.tool_calls);
        if (o && i.length) {
          t.push({
            role: "assistant",
            content: o.filter((a) => a?.type !== "tool_use").concat(i)
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
        const o = [ou(r)];
        for (; e[n + 1]?.role === "tool"; )
          n += 1, o.push(ou(e[n]));
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
          }] : [], ...iu(r.tool_calls)]
        });
        continue;
      }
      t.push({
        role: r.role,
        content: a_(r.content)
      });
    }
  }
  return t;
}
function bo(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function su(e = "") {
  return String(e || "https://api.anthropic.com").trim().replace(/\/+$/, "").replace(/\/v1$/i, "");
}
function f_(e = "auto", t = []) {
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
var h_ = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function au(e = {}, t = {}) {
  const n = Array.isArray(t.tools) ? t.tools : [], r = n.length ? f_(t.toolChoice, n) : void 0, o = xe("anthropic", e, t.reasoning), i = o.mode === "on" && o.profileId === "anthropic-manual" && (r?.type === "any" || r?.type === "tool");
  return {
    toolChoice: r,
    reasoning: o,
    effectiveReasoning: i ? {
      ...o,
      mode: "off"
    } : o,
    reasoningDisabledForForcedTool: i
  };
}
var p_ = class {
  constructor(e) {
    this.config = e, this.client = new Zr({
      apiKey: e.apiKey,
      baseURL: su(e.baseUrl),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e) {
    const t = au(this.config, e), n = t.effectiveReasoning, r = (Array.isArray(e.tools) ? e.tools : []).map((a) => ({
      name: a.function.name,
      description: a.function.description,
      input_schema: a.function.parameters
    })), o = l_(e), i = {
      model: this.config.model,
      system: o,
      messages: d_(e.messages),
      ...r.length ? {
        tools: r,
        tool_choice: t.toolChoice
      } : {},
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    if (!to({
      ...this.config,
      provider: "anthropic"
    }, n) && typeof e.temperature == "number" && (i.temperature = e.temperature), n.mode === "off") i.thinking = { type: "disabled" };
    else if (n.mode === "on" && n.profileId === "anthropic-adaptive")
      i.thinking = {
        type: "adaptive",
        display: j(n) ? "summarized" : "omitted"
      }, i.output_config = { effort: n.effort };
    else if (n.mode === "on" && n.profileId === "anthropic-manual") {
      if (Number.isFinite(Number(i.max_tokens)) && n.budgetTokens >= Number(i.max_tokens)) throw new Error("Anthropic 手动 thinking 的 Token 预算必须小于最大输出 Token。");
      i.thinking = {
        type: "enabled",
        budget_tokens: n.budgetTokens,
        display: j(n) ? "summarized" : "omitted"
      };
    }
    return i;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", r = su(this.config.baseUrl), o = t.body || this.buildRequestBody(e), i = au(this.config, e), a = i.effectiveReasoning;
    return {
      ...Hr({
        provider: "anthropic",
        model: this.config.model,
        transport: "anthropic-sdk",
        url: `${r}/v1/messages`,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.config.apiKey || ""
        },
        body: o,
        sdk: n ? "client.messages.stream" : "client.messages.create",
        effectiveConfig: qt(e, {
          profileId: i.reasoning.profileId,
          effectiveMode: a.mode,
          effort: o.output_config?.effort,
          budgetTokens: o.thinking?.budget_tokens,
          controlFields: {
            ...o.thinking ? { thinking: o.thinking } : {},
            ...o.output_config ? { output_config: o.output_config } : {}
          }
        })
      }),
      ...i.reasoningDisabledForForcedTool ? { notices: [h_] } : {}
    };
  }
  async chat(e) {
    const t = this.buildRequestBody(e), n = this.inspectRequest(e, { body: t });
    let r;
    if (typeof e.onStreamProgress == "function") {
      const i = this.client.messages.stream(t, { signal: e.signal }), a = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map();
      let c = "";
      const d = () => j(e.reasoning) ? Array.from(a.entries()).sort(([p], [g]) => p.localeCompare(g)).map(([p, g]) => ({
        label: p.startsWith("redacted:") ? "已脱敏思考块" : "思考块",
        text: g
      })).filter((p) => p.text) : [], h = () => Array.from(u.entries()).sort(([p], [g]) => Number(p) - Number(g)).map(([, p]) => ({
        id: p.id || "anthropic-tool-draft",
        name: p.name || "工具调用",
        arguments: p.inputJson || "{}",
        draft: !0
      })).filter((p) => p.name), f = () => {
        const p = h();
        p.length && bo(e, {
          text: c,
          thoughts: d(),
          toolCalls: p,
          toolCallDraft: !0
        });
      };
      i.on("text", (p, g) => {
        c = g || "", bo(e, {
          text: c,
          thoughts: d(),
          ...h().length ? {
            toolCalls: h(),
            toolCallDraft: !0
          } : {}
        });
      }), i.on("thinking", (p, g) => {
        a.set("thinking:0", g || ""), bo(e, {
          thoughts: d(),
          ...h().length ? {
            text: c,
            toolCalls: h(),
            toolCallDraft: !0
          } : {}
        });
      }), i.on("streamEvent", (p) => {
        if (p?.type === "content_block_start" && p.content_block?.type === "tool_use") {
          const g = p.content_block.input && typeof p.content_block.input == "object" ? p.content_block.input : {};
          u.set(p.index, {
            id: p.content_block.id || `anthropic-tool-draft-${p.index + 1}`,
            name: p.content_block.name || "工具调用",
            inputJson: Object.keys(g).length ? JSON.stringify(g) : ""
          }), f();
          return;
        }
        if (p?.type === "content_block_delta" && p.delta?.type === "input_json_delta") {
          const g = u.get(p.index) || {
            id: `anthropic-tool-draft-${p.index + 1}`,
            name: "工具调用",
            inputJson: ""
          };
          u.set(p.index, {
            ...g,
            inputJson: `${g.inputJson || ""}${p.delta.partial_json || ""}`
          }), f();
        }
      }), i.on("contentBlock", (p) => {
        p?.type === "redacted_thinking" && (a.set("redacted:0", p.data || ""), bo(e, {
          thoughts: d(),
          ...h().length ? {
            text: c,
            toolCalls: h(),
            toolCallDraft: !0
          } : {}
        }));
      }), r = await i.finalMessage();
    } else r = await this.client.messages.create(t, { signal: e.signal });
    const o = (r.content || []).filter((i) => i.type === "tool_use" && i.name).map((i, a) => ({
      id: i.id || `anthropic-tool-${a + 1}`,
      name: i.name,
      arguments: JSON.stringify(i.input || {})
    }));
    return {
      text: (r.content || []).filter((i) => i.type === "text").map((i) => i.text || "").join(`
`),
      toolCalls: o,
      thoughts: j(e.reasoning) ? (r.content || []).filter((i) => i.type === "thinking" || i.type === "redacted_thinking").map((i) => ({
        label: i.type === "thinking" ? "思考块" : "已脱敏思考块",
        text: i.type === "thinking" ? i.thinking || "" : i.data || ""
      })).filter((i) => i.text) : [],
      finishReason: r.stop_reason || "stop",
      model: r.model || this.config.model,
      provider: "anthropic",
      providerPayload: c_(r),
      requestInspection: n
    };
  }
}, g_ = /* @__PURE__ */ Ai(((e, t) => {
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
    var a = this;
    return this._timer = setTimeout(function() {
      a._attempts++, a._operationTimeoutCb && (a._timeout = setTimeout(function() {
        a._operationTimeoutCb(a._attempts);
      }, a._operationTimeout), a._options.unref && a._timeout.unref()), a._fn(a._attempts);
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
    for (var r = {}, o = null, i = 0, a = 0; a < this._errors.length; a++) {
      var u = this._errors[a], c = u.message, d = (r[c] || 0) + 1;
      r[c] = d, d >= i && (o = u, i = d);
    }
    return o;
  };
})), m_ = /* @__PURE__ */ Ai(((e) => {
  var t = g_();
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
    for (var i = [], a = 0; a < r.retries; a++) i.push(this.createTimeout(a, r));
    return n && n.forever && !i.length && i.push(this.createTimeout(a, r)), i.sort(function(u, c) {
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
    for (var a = 0; a < o.length; a++) {
      var u = o[a], c = n[u];
      n[u] = function(h) {
        var f = e.operation(r), p = Array.prototype.slice.call(arguments, 1), g = p.pop();
        p.push(function(y) {
          f.retry(y) || (y && (arguments[0] = f.mainError()), g.apply(this, arguments));
        }), f.attempt(function() {
          h.apply(n, p);
        });
      }.bind(n, c), n[u].options = r;
    }
  };
})), y_ = /* @__PURE__ */ Ai(((e, t) => {
  t.exports = m_();
})), __ = /* @__PURE__ */ Ai(((e, t) => {
  var n = y_(), r = [
    "Failed to fetch",
    "NetworkError when attempting to fetch resource.",
    "The Internet connection appears to be offline.",
    "Network request failed"
  ], o = class extends Error {
    constructor(c) {
      super(), c instanceof Error ? (this.originalError = c, { message: c } = c) : (this.originalError = new Error(c), this.originalError.stack = this.stack), this.name = "AbortError", this.message = c;
    }
  }, i = (c, d, h) => {
    const f = h.retries - (d - 1);
    return c.attemptNumber = d, c.retriesLeft = f, c;
  }, a = (c) => r.includes(c), u = (c, d) => new Promise((h, f) => {
    d = {
      onFailedAttempt: () => {
      },
      retries: 10,
      ...d
    };
    const p = n.operation(d);
    p.attempt(async (g) => {
      try {
        h(await c(g));
      } catch (y) {
        if (!(y instanceof Error)) {
          f(/* @__PURE__ */ new TypeError(`Non-error was thrown: "${y}". You should only throw errors.`));
          return;
        }
        if (y instanceof o)
          p.stop(), f(y.originalError);
        else if (y instanceof TypeError && !a(y.message))
          p.stop(), f(y);
        else {
          i(y, g, d);
          try {
            await d.onFailedAttempt(y);
          } catch (_) {
            f(_);
            return;
          }
          p.retry(y) || f(p.mainError());
        }
      }
    });
  });
  t.exports = u, t.exports.default = u, t.exports.AbortError = o;
})), lu = /* @__PURE__ */ Nm(__(), 1), v_ = void 0, A_ = void 0;
function T_() {
  return {
    geminiUrl: v_,
    vertexUrl: A_
  };
}
function S_(e, t, n, r) {
  var o, i;
  if (!e?.baseUrl) {
    const a = T_();
    return t ? (o = a.vertexUrl) !== null && o !== void 0 ? o : n : (i = a.geminiUrl) !== null && i !== void 0 ? i : r;
  }
  return e.baseUrl;
}
var It = class {
};
function $(e, t) {
  return e.replace(/\{([^}]+)\}/g, (n, r) => {
    if (Object.prototype.hasOwnProperty.call(t, r)) {
      const o = t[r];
      return o != null ? String(o) : "";
    } else throw new Error(`Key '${r}' not found in valueMap.`);
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
  const r = t[t.length - 1], o = e[r];
  if (o !== void 0) {
    if (!n || typeof n == "object" && Object.keys(n).length === 0 || n === o) return;
    if (typeof o == "object" && typeof n == "object" && o !== null && n !== null) Object.assign(o, n);
    else throw new Error(`Cannot set value for an existing key. Key: ${r}`);
  } else r === "_self" && typeof n == "object" && n !== null && !Array.isArray(n) ? Object.assign(e, n) : e[r] = n;
}
function s(e, t, n = void 0) {
  try {
    if (t.length === 1 && t[0] === "_self") return e;
    for (let r = 0; r < t.length; r++) {
      if (typeof e != "object" || e === null) return n;
      const o = t[r];
      if (o.endsWith("[]")) {
        const i = o.slice(0, -2);
        if (i in e) {
          const a = e[i];
          return Array.isArray(a) ? a.map((u) => s(u, t.slice(r + 1), n)) : n;
        } else return n;
      } else e = e[o];
    }
    return e;
  } catch (r) {
    if (r instanceof TypeError) return n;
    throw r;
  }
}
function E_(e, t) {
  for (const [n, r] of Object.entries(t)) {
    const o = n.split("."), i = r.split("."), a = /* @__PURE__ */ new Set();
    let u = -1;
    for (let c = 0; c < o.length; c++) if (o[c] === "*") {
      u = c;
      break;
    }
    if (u !== -1 && i.length > u) for (let c = u; c < i.length; c++) {
      const d = i[c];
      d !== "*" && !d.endsWith("[]") && !d.endsWith("[0]") && a.add(d);
    }
    bs(e, o, i, 0, a);
  }
}
function bs(e, t, n, r, o) {
  if (r >= t.length || typeof e != "object" || e === null) return;
  const i = t[r];
  if (i.endsWith("[]")) {
    const a = i.slice(0, -2), u = e;
    if (a in u && Array.isArray(u[a])) for (const c of u[a]) bs(c, t, n, r + 1, o);
  } else if (i === "*") {
    if (typeof e == "object" && e !== null && !Array.isArray(e)) {
      const a = e, u = Object.keys(a).filter((d) => !d.startsWith("_") && !o.has(d)), c = {};
      for (const d of u) c[d] = a[d];
      for (const [d, h] of Object.entries(c)) {
        const f = [];
        for (const p of n.slice(r)) p === "*" ? f.push(d) : f.push(p);
        l(a, f, h);
      }
      for (const d of u) delete a[d];
    }
  } else {
    const a = e;
    i in a && bs(a[i], t, n, r + 1, o);
  }
}
function wa(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function w_(e) {
  const t = {}, n = s(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const r = s(e, ["resourceName"]);
  return r != null && l(t, ["_url", "resourceName"], r), t;
}
function C_(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response", "generateVideoResponse"]);
  return a != null && l(t, ["response"], b_(a)), t;
}
function I_(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], P_(a)), t;
}
function b_(e) {
  const t = {}, n = s(e, ["generatedSamples"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((a) => R_(a))), l(t, ["generatedVideos"], i);
  }
  const r = s(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const o = s(e, ["raiMediaFilteredReasons"]);
  return o != null && l(t, ["raiMediaFilteredReasons"], o), t;
}
function P_(e) {
  const t = {}, n = s(e, ["videos"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((a) => x_(a))), l(t, ["generatedVideos"], i);
  }
  const r = s(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const o = s(e, ["raiMediaFilteredReasons"]);
  return o != null && l(t, ["raiMediaFilteredReasons"], o), t;
}
function R_(e) {
  const t = {}, n = s(e, ["video"]);
  return n != null && l(t, ["video"], L_(n)), t;
}
function x_(e) {
  const t = {}, n = s(e, ["_self"]);
  return n != null && l(t, ["video"], U_(n)), t;
}
function M_(e) {
  const t = {}, n = s(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function N_(e) {
  const t = {}, n = s(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function k_(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], D_(a)), t;
}
function D_(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = s(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function nh(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], $_(a)), t;
}
function $_(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = s(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function L_(e) {
  const t = {}, n = s(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const r = s(e, ["encodedVideo"]);
  r != null && l(t, ["videoBytes"], wa(r));
  const o = s(e, ["encoding"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function U_(e) {
  const t = {}, n = s(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const r = s(e, ["bytesBase64Encoded"]);
  r != null && l(t, ["videoBytes"], wa(r));
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
var uu;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(uu || (uu = {}));
var cu;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(cu || (cu = {}));
var du;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(du || (du = {}));
var Ft;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(Ft || (Ft = {}));
var fu;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(fu || (fu = {}));
var hu;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})(hu || (hu = {}));
var pu;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})(pu || (pu = {}));
var gu;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(gu || (gu = {}));
var mu;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(mu || (mu = {}));
var yu;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})(yu || (yu = {}));
var _u;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})(_u || (_u = {}));
var bn;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(bn || (bn = {}));
var Pn;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Pn || (Pn = {}));
var vu;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(vu || (vu = {}));
var Au;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})(Au || (Au = {}));
var Tu;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(Tu || (Tu = {}));
var Su;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(Su || (Su = {}));
var Eu;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(Eu || (Eu = {}));
var wu;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})(wu || (wu = {}));
var Cu;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Cu || (Cu = {}));
var Iu;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(Iu || (Iu = {}));
var bu;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(bu || (bu = {}));
var Pu;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(Pu || (Pu = {}));
var Ru;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(Ru || (Ru = {}));
var ri;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(ri || (ri = {}));
var xu;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(xu || (xu = {}));
var Mu;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(Mu || (Mu = {}));
var Nu;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(Nu || (Nu = {}));
var ku;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(ku || (ku = {}));
var Ps;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(Ps || (Ps = {}));
var Du;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})(Du || (Du = {}));
var $u;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})($u || ($u = {}));
var Lu;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(Lu || (Lu = {}));
var Uu;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(Uu || (Uu = {}));
var Fu;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(Fu || (Fu = {}));
var Ou;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})(Ou || (Ou = {}));
var qu;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})(qu || (qu = {}));
var Rs;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(Rs || (Rs = {}));
var Bu;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})(Bu || (Bu = {}));
var Gu;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(Gu || (Gu = {}));
var oi;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(oi || (oi = {}));
var Hu;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(Hu || (Hu = {}));
var Vu;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(Vu || (Vu = {}));
var Ku;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(Ku || (Ku = {}));
var Ju;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(Ju || (Ju = {}));
var Wu;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(Wu || (Wu = {}));
var zu;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(zu || (zu = {}));
var Yu;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(Yu || (Yu = {}));
var Xu;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(Xu || (Xu = {}));
var Qu;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})(Qu || (Qu = {}));
var Zu;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(Zu || (Zu = {}));
var ju;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})(ju || (ju = {}));
var ec;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(ec || (ec = {}));
var tc;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(tc || (tc = {}));
var nc;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(nc || (nc = {}));
var rc;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(rc || (rc = {}));
var oc;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(oc || (oc = {}));
var ic;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(ic || (ic = {}));
var sc;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(sc || (sc = {}));
var ac;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(ac || (ac = {}));
var lc;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(lc || (lc = {}));
var uc;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(uc || (uc = {}));
var cc;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(cc || (cc = {}));
var dc;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(dc || (dc = {}));
var Rn;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(Rn || (Rn = {}));
var xs = class {
  constructor(e) {
    const t = {};
    for (const n of e.headers.entries()) t[n[0]] = n[1];
    this.headers = t, this.responseInternal = e;
  }
  json() {
    return this.responseInternal.json();
  }
}, hr = class {
  get text() {
    var e, t, n, r, o, i, a, u;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning text from the first one.");
    let c = "", d = !1;
    const h = [];
    for (const f of (u = (a = (i = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) !== null && u !== void 0 ? u : []) {
      for (const [p, g] of Object.entries(f)) p !== "text" && p !== "thought" && p !== "thoughtSignature" && (g !== null || g !== void 0) && h.push(p);
      if (typeof f.text == "string") {
        if (typeof f.thought == "boolean" && f.thought) continue;
        d = !0, c += f.text;
      }
    }
    return h.length > 0 && console.warn(`there are non-text parts ${h} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), d ? c : void 0;
  }
  get data() {
    var e, t, n, r, o, i, a, u;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning data from the first one.");
    let c = "";
    const d = [];
    for (const h of (u = (a = (i = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) !== null && u !== void 0 ? u : []) {
      for (const [f, p] of Object.entries(h)) f !== "inlineData" && (p !== null || p !== void 0) && d.push(f);
      h.inlineData && typeof h.inlineData.data == "string" && (c += atob(h.inlineData.data));
    }
    return d.length > 0 && console.warn(`there are non-data parts ${d} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), c.length > 0 ? btoa(c) : void 0;
  }
  get functionCalls() {
    var e, t, n, r, o, i, a, u;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning function calls from the first one.");
    const c = (u = (a = (i = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) === null || u === void 0 ? void 0 : u.filter((d) => d.functionCall).map((d) => d.functionCall).filter((d) => d !== void 0);
    if (c?.length !== 0)
      return c;
  }
  get executableCode() {
    var e, t, n, r, o, i, a, u, c;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning executable code from the first one.");
    const d = (u = (a = (i = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) === null || u === void 0 ? void 0 : u.filter((h) => h.executableCode).map((h) => h.executableCode).filter((h) => h !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.code;
  }
  get codeExecutionResult() {
    var e, t, n, r, o, i, a, u, c;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning code execution result from the first one.");
    const d = (u = (a = (i = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) === null || u === void 0 ? void 0 : u.filter((h) => h.codeExecutionResult).map((h) => h.codeExecutionResult).filter((h) => h !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.output;
  }
}, fc = class {
}, hc = class {
}, F_ = class {
}, O_ = class {
}, q_ = class {
}, B_ = class {
}, pc = class {
}, gc = class {
}, mc = class {
}, G_ = class {
}, yc = class rh {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new rh();
    let o;
    const i = t;
    return n ? o = I_(i) : o = C_(i), Object.assign(r, o), r;
  }
}, _c = class {
}, vc = class {
}, Ac = class {
}, Tc = class {
}, H_ = class {
}, V_ = class {
}, K_ = class {
}, J_ = class oh {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new oh(), o = k_(t);
    return Object.assign(r, o), r;
  }
}, W_ = class {
}, z_ = class {
}, Y_ = class {
}, X_ = class {
}, Sc = class {
}, Q_ = class {
  get text() {
    var e, t, n;
    let r = "", o = !1;
    const i = [];
    for (const a of (n = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && n !== void 0 ? n : []) {
      for (const [u, c] of Object.entries(a)) u !== "text" && u !== "thought" && c !== null && i.push(u);
      if (typeof a.text == "string") {
        if (typeof a.thought == "boolean" && a.thought) continue;
        o = !0, r += a.text;
      }
    }
    return i.length > 0 && console.warn(`there are non-text parts ${i} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), o ? r : void 0;
  }
  get data() {
    var e, t, n;
    let r = "";
    const o = [];
    for (const i of (n = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && n !== void 0 ? n : []) {
      for (const [a, u] of Object.entries(i)) a !== "inlineData" && u !== null && o.push(a);
      i.inlineData && typeof i.inlineData.data == "string" && (r += atob(i.inlineData.data));
    }
    return o.length > 0 && console.warn(`there are non-data parts ${o} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), r.length > 0 ? btoa(r) : void 0;
  }
}, Z_ = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, j_ = class ih {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new ih(), o = nh(t);
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
function sh(e, t) {
  const n = Y(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function ah(e) {
  return Array.isArray(e) ? e.map((t) => ii(t)) : [ii(e)];
}
function ii(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function lh(e) {
  const t = ii(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function uh(e) {
  const t = ii(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function Ec(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function ch(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => Ec(t)) : [Ec(e)];
}
function Ms(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function wc(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function Cc(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function ve(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return Ms(e) ? e : {
    role: "user",
    parts: ch(e)
  };
}
function Ca(e, t) {
  if (!t) return [];
  if (e.isVertexAI() && Array.isArray(t)) return t.flatMap((n) => {
    const r = ve(n);
    return r.parts && r.parts.length > 0 && r.parts[0].text !== void 0 ? [r.parts[0].text] : [];
  });
  if (e.isVertexAI()) {
    const n = ve(t);
    return n.parts && n.parts.length > 0 && n.parts[0].text !== void 0 ? [n.parts[0].text] : [];
  }
  return Array.isArray(t) ? t.map((n) => ve(n)) : [ve(t)];
}
function De(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("contents are required");
  if (!Array.isArray(e)) {
    if (wc(e) || Cc(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [ve(e)];
  }
  const t = [], n = [], r = Ms(e[0]);
  for (const o of e) {
    const i = Ms(o);
    if (i != r) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (i) t.push(o);
    else {
      if (wc(o) || Cc(o)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(o);
    }
  }
  return r || t.push({
    role: "user",
    parts: ch(n)
  }), t;
}
function ev(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((r) => r !== "null");
  if (n.length === 1) t.type = Object.values(Ft).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : Ft.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const r of n) t.anyOf.push({ type: Object.values(Ft).includes(r.toUpperCase()) ? r.toUpperCase() : Ft.TYPE_UNSPECIFIED });
  }
}
function Ln(e) {
  const t = {}, n = ["items"], r = ["anyOf"], o = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const i = e.anyOf;
  i != null && i.length == 2 && (i[0].type === "null" ? (t.nullable = !0, e = i[1]) : i[1].type === "null" && (t.nullable = !0, e = i[0])), e.type instanceof Array && ev(e.type, t);
  for (const [a, u] of Object.entries(e))
    if (u != null)
      if (a == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(Ft).includes(u.toUpperCase()) ? u.toUpperCase() : Ft.TYPE_UNSPECIFIED;
      } else if (n.includes(a)) t[a] = Ln(u);
      else if (r.includes(a)) {
        const c = [];
        for (const d of u) {
          if (d.type == "null") {
            t.nullable = !0;
            continue;
          }
          c.push(Ln(d));
        }
        t[a] = c;
      } else if (o.includes(a)) {
        const c = {};
        for (const [d, h] of Object.entries(u)) c[d] = Ln(h);
        t[a] = c;
      } else {
        if (a === "additionalProperties") continue;
        t[a] = u;
      }
  return t;
}
function Ia(e) {
  return Ln(e);
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
function Hn(e) {
  if (e.functionDeclarations) for (const t of e.functionDeclarations)
    t.parameters && (Object.keys(t.parameters).includes("$schema") ? t.parametersJsonSchema || (t.parametersJsonSchema = t.parameters, delete t.parameters) : t.parameters = Ln(t.parameters)), t.response && (Object.keys(t.response).includes("$schema") ? t.responseJsonSchema || (t.responseJsonSchema = t.response, delete t.response) : t.response = Ln(t.response));
  return e;
}
function Vn(e) {
  if (e == null) throw new Error("tools is required");
  if (!Array.isArray(e)) throw new Error("tools is required and must be an array of Tools");
  const t = [];
  for (const n of e) t.push(n);
  return t;
}
function tv(e, t, n, r = 1) {
  const o = !t.startsWith(`${n}/`) && t.split("/").length === r;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : o ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : o ? `${n}/${t}` : t;
}
function bt(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return tv(e, t, "cachedContents");
}
function dh(e) {
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
function Gt(e) {
  return wa(e);
}
function nv(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function rv(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function ov(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function fh(e) {
  var t;
  let n;
  if (nv(e) && (n = e.name), !(ov(e) && (n = e.uri, n === void 0)) && !(rv(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const r = n.split("files/")[1].match(/[a-z0-9]+/);
      if (r === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = r[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function hh(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function ph(e) {
  for (const t of [
    "models",
    "tunedModels",
    "publisherModels"
  ]) if (iv(e, t)) return e[t];
  return [];
}
function iv(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function sv(e, t = {}) {
  const n = e, r = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (r.responseJsonSchema = n.outputSchema), t.behavior && (r.behavior = t.behavior), { functionDeclarations: [r] };
}
function av(e, t = {}) {
  const n = [], r = /* @__PURE__ */ new Set();
  for (const o of e) {
    const i = o.name;
    if (r.has(i)) throw new Error(`Duplicate function name ${i} found in MCP tools. Please ensure function names are unique.`);
    r.add(i);
    const a = sv(o, t);
    a.functionDeclarations && n.push(...a.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function gh(e, t) {
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
function lv(e) {
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
function mh(e) {
  if (typeof e != "object" || e === null) return {};
  const t = e, n = t.inlinedResponses;
  if (typeof n != "object" || n === null) return e;
  const r = n.inlinedResponses;
  if (!Array.isArray(r) || r.length === 0) return e;
  let o = !1;
  for (const i of r) {
    if (typeof i != "object" || i === null) continue;
    const a = i.response;
    if (!(typeof a != "object" || a === null) && a.embedding !== void 0) {
      o = !0;
      break;
    }
  }
  return o && (t.inlinedEmbedContentResponses = t.inlinedResponses, delete t.inlinedResponses), e;
}
function Kn(e, t) {
  const n = t;
  if (!e.isVertexAI()) {
    if (/batches\/[^/]+$/.test(n)) return n.split("/").pop();
    throw new Error(`Invalid batch job name: ${n}.`);
  }
  if (/^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/.test(n)) return n.split("/").pop();
  if (/^\d+$/.test(n)) return n;
  throw new Error(`Invalid batch job name: ${n}.`);
}
function yh(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function uv(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
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
function dv(e) {
  const t = {}, n = s(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const r = s(e, ["inlinedResponses", "inlinedResponses"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => Kv(a))), l(t, ["inlinedResponses"], i);
  }
  const o = s(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["inlinedEmbedContentResponses"], i);
  }
  return t;
}
function fv(e) {
  const t = {}, n = s(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const r = s(e, ["gcsDestination", "outputUriPrefix"]);
  r != null && l(t, ["gcsUri"], r);
  const o = s(e, ["bigqueryDestination", "outputUri"]);
  return o != null && l(t, ["bigqueryUri"], o), t;
}
function hv(e) {
  const t = {}, n = s(e, ["format"]);
  n != null && l(t, ["predictionsFormat"], n);
  const r = s(e, ["gcsUri"]);
  r != null && l(t, ["gcsDestination", "outputUriPrefix"], r);
  const o = s(e, ["bigqueryUri"]);
  if (o != null && l(t, ["bigqueryDestination", "outputUri"], o), s(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (s(e, ["inlinedResponses"]) !== void 0) throw new Error("inlinedResponses parameter is not supported in Vertex AI.");
  if (s(e, ["inlinedEmbedContentResponses"]) !== void 0) throw new Error("inlinedEmbedContentResponses parameter is not supported in Vertex AI.");
  return t;
}
function Vo(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata", "displayName"]);
  r != null && l(t, ["displayName"], r);
  const o = s(e, ["metadata", "state"]);
  o != null && l(t, ["state"], yh(o));
  const i = s(e, ["metadata", "createTime"]);
  i != null && l(t, ["createTime"], i);
  const a = s(e, ["metadata", "endTime"]);
  a != null && l(t, ["endTime"], a);
  const u = s(e, ["metadata", "updateTime"]);
  u != null && l(t, ["updateTime"], u);
  const c = s(e, ["metadata", "model"]);
  c != null && l(t, ["model"], c);
  const d = s(e, ["metadata", "output"]);
  return d != null && l(t, ["dest"], dv(mh(d))), t;
}
function Ns(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["displayName"]);
  r != null && l(t, ["displayName"], r);
  const o = s(e, ["state"]);
  o != null && l(t, ["state"], yh(o));
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
  f != null && l(t, ["src"], pv(f));
  const p = s(e, ["outputConfig"]);
  p != null && l(t, ["dest"], fv(mh(p)));
  const g = s(e, ["completionStats"]);
  return g != null && l(t, ["completionStats"], g), t;
}
function pv(e) {
  const t = {}, n = s(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const r = s(e, ["gcsSource", "uris"]);
  r != null && l(t, ["gcsUri"], r);
  const o = s(e, ["bigquerySource", "inputUri"]);
  return o != null && l(t, ["bigqueryUri"], o), t;
}
function gv(e, t) {
  const n = {};
  if (s(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (s(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (s(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const r = s(t, ["fileName"]);
  r != null && l(n, ["fileName"], r);
  const o = s(t, ["inlinedRequests"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Vv(e, a))), l(n, ["requests", "requests"], i);
  }
  return n;
}
function mv(e) {
  const t = {}, n = s(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const r = s(e, ["gcsUri"]);
  r != null && l(t, ["gcsSource", "uris"], r);
  const o = s(e, ["bigqueryUri"]);
  if (o != null && l(t, ["bigquerySource", "inputUri"], o), s(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (s(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function yv(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function _v(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Kn(e, r)), n;
}
function vv(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Kn(e, r)), n;
}
function Av(e) {
  const t = {}, n = s(e, ["content"]);
  n != null && l(t, ["content"], n);
  const r = s(e, ["citationMetadata"]);
  r != null && l(t, ["citationMetadata"], Tv(r));
  const o = s(e, ["tokenCount"]);
  o != null && l(t, ["tokenCount"], o);
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
    Array.isArray(p) && (p = p.map((g) => g)), l(t, ["safetyRatings"], p);
  }
  const f = s(e, ["urlContextMetadata"]);
  return f != null && l(t, ["urlContextMetadata"], f), t;
}
function Tv(e) {
  const t = {}, n = s(e, ["citationSources"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((o) => o)), l(t, ["citations"], r);
  }
  return t;
}
function _h(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => Zv(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function Sv(e, t) {
  const n = {}, r = s(e, ["displayName"]);
  if (t !== void 0 && r != null && l(t, ["batch", "displayName"], r), s(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const o = s(e, ["webhookConfig"]);
  return t !== void 0 && o != null && l(t, ["batch", "webhookConfig"], o), n;
}
function Ev(e, t) {
  const n = {}, r = s(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const o = s(e, ["dest"]);
  if (t !== void 0 && o != null && l(t, ["outputConfig"], hv(lv(o))), s(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function Ic(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["_url", "model"], Y(e, r));
  const o = s(t, ["src"]);
  o != null && l(n, ["batch", "inputConfig"], gv(e, gh(e, o)));
  const i = s(t, ["config"]);
  return i != null && Sv(i, n), n;
}
function wv(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["model"], Y(e, r));
  const o = s(t, ["src"]);
  o != null && l(n, ["inputConfig"], mv(gh(e, o)));
  const i = s(t, ["config"]);
  return i != null && Ev(i, n), n;
}
function Cv(e, t) {
  const n = {}, r = s(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["batch", "displayName"], r), n;
}
function Iv(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["_url", "model"], Y(e, r));
  const o = s(t, ["src"]);
  o != null && l(n, ["batch", "inputConfig"], kv(e, o));
  const i = s(t, ["config"]);
  return i != null && Cv(i, n), n;
}
function bv(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Kn(e, r)), n;
}
function Pv(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Kn(e, r)), n;
}
function Rv(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function xv(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function Mv(e, t) {
  const n = {}, r = s(t, ["contents"]);
  if (r != null) {
    let i = Ca(e, r);
    Array.isArray(i) && (i = i.map((a) => a)), l(n, [
      "requests[]",
      "request",
      "content"
    ], i);
  }
  const o = s(t, ["config"]);
  return o != null && (l(n, ["_self"], Nv(o, n)), E_(n, { "requests[].*": "requests[].request.*" })), n;
}
function Nv(e, t) {
  const n = {}, r = s(e, ["taskType"]);
  t !== void 0 && r != null && l(t, ["requests[]", "taskType"], r);
  const o = s(e, ["title"]);
  t !== void 0 && o != null && l(t, ["requests[]", "title"], o);
  const i = s(e, ["outputDimensionality"]);
  if (t !== void 0 && i != null && l(t, ["requests[]", "outputDimensionality"], i), s(e, ["mimeType"]) !== void 0) throw new Error("mimeType parameter is not supported in Gemini API.");
  if (s(e, ["autoTruncate"]) !== void 0) throw new Error("autoTruncate parameter is not supported in Gemini API.");
  if (s(e, ["documentOcr"]) !== void 0) throw new Error("documentOcr parameter is not supported in Gemini API.");
  if (s(e, ["audioTrackExtraction"]) !== void 0) throw new Error("audioTrackExtraction parameter is not supported in Gemini API.");
  return n;
}
function kv(e, t) {
  const n = {}, r = s(t, ["fileName"]);
  r != null && l(n, ["file_name"], r);
  const o = s(t, ["inlinedRequests"]);
  return o != null && l(n, ["requests"], Mv(e, o)), n;
}
function Dv(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function $v(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = s(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = s(e, ["name"]);
  if (o != null && l(t, ["name"], o), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Lv(e) {
  const t = {}, n = s(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = s(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), s(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function Uv(e, t, n) {
  const r = {}, o = s(t, ["systemInstruction"]);
  n !== void 0 && o != null && l(n, ["systemInstruction"], _h(ve(o)));
  const i = s(t, ["temperature"]);
  i != null && l(r, ["temperature"], i);
  const a = s(t, ["topP"]);
  a != null && l(r, ["topP"], a);
  const u = s(t, ["topK"]);
  u != null && l(r, ["topK"], u);
  const c = s(t, ["candidateCount"]);
  c != null && l(r, ["candidateCount"], c);
  const d = s(t, ["maxOutputTokens"]);
  d != null && l(r, ["maxOutputTokens"], d);
  const h = s(t, ["stopSequences"]);
  h != null && l(r, ["stopSequences"], h);
  const f = s(t, ["responseLogprobs"]);
  f != null && l(r, ["responseLogprobs"], f);
  const p = s(t, ["logprobs"]);
  p != null && l(r, ["logprobs"], p);
  const g = s(t, ["presencePenalty"]);
  g != null && l(r, ["presencePenalty"], g);
  const y = s(t, ["frequencyPenalty"]);
  y != null && l(r, ["frequencyPenalty"], y);
  const _ = s(t, ["seed"]);
  _ != null && l(r, ["seed"], _);
  const v = s(t, ["responseMimeType"]);
  v != null && l(r, ["responseMimeType"], v);
  const E = s(t, ["responseSchema"]);
  E != null && l(r, ["responseSchema"], Ia(E));
  const b = s(t, ["responseJsonSchema"]);
  if (b != null && l(r, ["responseJsonSchema"], b), s(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (s(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const R = s(t, ["safetySettings"]);
  if (n !== void 0 && R != null) {
    let Z = R;
    Array.isArray(Z) && (Z = Z.map((X) => jv(X))), l(n, ["safetySettings"], Z);
  }
  const P = s(t, ["tools"]);
  if (n !== void 0 && P != null) {
    let Z = Vn(P);
    Array.isArray(Z) && (Z = Z.map((X) => tA(Hn(X)))), l(n, ["tools"], Z);
  }
  const L = s(t, ["toolConfig"]);
  if (n !== void 0 && L != null && l(n, ["toolConfig"], eA(L)), s(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const S = s(t, ["cachedContent"]);
  n !== void 0 && S != null && l(n, ["cachedContent"], bt(e, S));
  const O = s(t, ["responseModalities"]);
  O != null && l(r, ["responseModalities"], O);
  const x = s(t, ["mediaResolution"]);
  x != null && l(r, ["mediaResolution"], x);
  const D = s(t, ["speechConfig"]);
  if (D != null && l(r, ["speechConfig"], ba(D)), s(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const H = s(t, ["thinkingConfig"]);
  H != null && l(r, ["thinkingConfig"], H);
  const z = s(t, ["imageConfig"]);
  z != null && l(r, ["imageConfig"], Hv(z));
  const ge = s(t, ["enableEnhancedCivicAnswers"]);
  if (ge != null && l(r, ["enableEnhancedCivicAnswers"], ge), s(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const Q = s(t, ["serviceTier"]);
  return n !== void 0 && Q != null && l(n, ["serviceTier"], Q), r;
}
function Fv(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["candidates"]);
  if (r != null) {
    let d = r;
    Array.isArray(d) && (d = d.map((h) => Av(h))), l(t, ["candidates"], d);
  }
  const o = s(e, ["modelVersion"]);
  o != null && l(t, ["modelVersion"], o);
  const i = s(e, ["promptFeedback"]);
  i != null && l(t, ["promptFeedback"], i);
  const a = s(e, ["responseId"]);
  a != null && l(t, ["responseId"], a);
  const u = s(e, ["usageMetadata"]);
  u != null && l(t, ["usageMetadata"], u);
  const c = s(e, ["modelStatus"]);
  return c != null && l(t, ["modelStatus"], c), t;
}
function Ov(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Kn(e, r)), n;
}
function qv(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Kn(e, r)), n;
}
function Bv(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], cv(n));
  const r = s(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function Gv(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = s(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function Hv(e) {
  const t = {}, n = s(e, ["aspectRatio"]);
  n != null && l(t, ["aspectRatio"], n);
  const r = s(e, ["imageSize"]);
  if (r != null && l(t, ["imageSize"], r), s(e, ["personGeneration"]) !== void 0) throw new Error("personGeneration parameter is not supported in Gemini API.");
  if (s(e, ["prominentPeople"]) !== void 0) throw new Error("prominentPeople parameter is not supported in Gemini API.");
  if (s(e, ["outputMimeType"]) !== void 0) throw new Error("outputMimeType parameter is not supported in Gemini API.");
  if (s(e, ["outputCompressionQuality"]) !== void 0) throw new Error("outputCompressionQuality parameter is not supported in Gemini API.");
  if (s(e, ["imageOutputOptions"]) !== void 0) throw new Error("imageOutputOptions parameter is not supported in Gemini API.");
  return t;
}
function Vv(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["request", "model"], Y(e, r));
  const o = s(t, ["contents"]);
  if (o != null) {
    let u = De(o);
    Array.isArray(u) && (u = u.map((c) => _h(c))), l(n, ["request", "contents"], u);
  }
  const i = s(t, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const a = s(t, ["config"]);
  return a != null && l(n, ["request", "generationConfig"], Uv(e, a, s(n, ["request"], {}))), n;
}
function Kv(e) {
  const t = {}, n = s(e, ["response"]);
  n != null && l(t, ["response"], Fv(n));
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["error"]);
  return o != null && l(t, ["error"], o), t;
}
function Jv(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  if (t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), s(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function Wv(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  t !== void 0 && o != null && l(t, ["_query", "pageToken"], o);
  const i = s(e, ["filter"]);
  return t !== void 0 && i != null && l(t, ["_query", "filter"], i), n;
}
function zv(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && Jv(n, t), t;
}
function Yv(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && Wv(n, t), t;
}
function Xv(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = s(e, ["operations"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Vo(a))), l(t, ["batchJobs"], i);
  }
  return t;
}
function Qv(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = s(e, ["batchPredictionJobs"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Ns(a))), l(t, ["batchJobs"], i);
  }
  return t;
}
function Zv(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = s(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], Dv(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], $v(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], yv(c));
  const d = s(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = s(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = s(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = s(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const g = s(e, ["toolCall"]);
  g != null && l(t, ["toolCall"], g);
  const y = s(e, ["toolResponse"]);
  y != null && l(t, ["toolResponse"], y);
  const _ = s(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function jv(e) {
  const t = {}, n = s(e, ["category"]);
  if (n != null && l(t, ["category"], n), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = s(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function eA(e) {
  const t = {}, n = s(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = s(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], Lv(r));
  const o = s(e, ["includeServerSideToolInvocations"]);
  return o != null && l(t, ["includeServerSideToolInvocations"], o), t;
}
function tA(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = s(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = s(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], Gv(o));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], Bv(i));
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
var Ct;
(function(e) {
  e.PAGED_ITEM_BATCH_JOBS = "batchJobs", e.PAGED_ITEM_MODELS = "models", e.PAGED_ITEM_TUNING_JOBS = "tuningJobs", e.PAGED_ITEM_FILES = "files", e.PAGED_ITEM_CACHED_CONTENTS = "cachedContents", e.PAGED_ITEM_FILE_SEARCH_STORES = "fileSearchStores", e.PAGED_ITEM_DOCUMENTS = "documents";
})(Ct || (Ct = {}));
var cn = class {
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
}, nA = class extends It {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new cn(Ct.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = Ic(this.apiClient, e), n = t._url, r = $("{model}:batchGenerateContent", n), o = t.batch.inputConfig.requests, i = o.requests, a = [];
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
    return o.requests = a, delete t.config, delete t._url, delete t._query, {
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
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = wv(this.apiClient, e);
      return a = $("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Ns(d));
    } else {
      const c = Ic(this.apiClient, e);
      return a = $("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => Vo(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Iv(this.apiClient, e);
      return o = $("{model}:asyncBatchEmbedContent", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => Vo(u));
    }
  }
  async get(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = qv(this.apiClient, e);
      return a = $("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Ns(d));
    } else {
      const c = Ov(this.apiClient, e);
      return a = $("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => Vo(d));
    }
  }
  async cancel(e) {
    var t, n, r, o;
    let i = "", a = {};
    if (this.apiClient.isVertexAI()) {
      const u = vv(this.apiClient, e);
      i = $("batchPredictionJobs/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: i,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = _v(this.apiClient, e);
      i = $("batches/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: i,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Yv(e);
      return a = $("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = Qv(d), f = new Sc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = zv(e);
      return a = $("batches", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = Xv(d), f = new Sc();
        return Object.assign(f, h), f;
      });
    }
  }
  async delete(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Pv(this.apiClient, e);
      return a = $("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => xv(d));
    } else {
      const c = bv(this.apiClient, e);
      return a = $("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => Rv(d));
    }
  }
};
function rA(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function oA(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function bc(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => bA(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function Pc(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => PA(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function iA(e, t) {
  const n = {}, r = s(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = s(e, ["expireTime"]);
  t !== void 0 && o != null && l(t, ["expireTime"], o);
  const i = s(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const a = s(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let h = De(a);
    Array.isArray(h) && (h = h.map((f) => bc(f))), l(t, ["contents"], h);
  }
  const u = s(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], bc(ve(u)));
  const c = s(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((f) => MA(f))), l(t, ["tools"], h);
  }
  const d = s(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], RA(d)), s(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function sA(e, t) {
  const n = {}, r = s(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = s(e, ["expireTime"]);
  t !== void 0 && o != null && l(t, ["expireTime"], o);
  const i = s(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const a = s(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let f = De(a);
    Array.isArray(f) && (f = f.map((p) => Pc(p))), l(t, ["contents"], f);
  }
  const u = s(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Pc(ve(u)));
  const c = s(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((p) => NA(p))), l(t, ["tools"], f);
  }
  const d = s(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], xA(d));
  const h = s(e, ["kmsKeyName"]);
  return t !== void 0 && h != null && l(t, ["encryption_spec", "kmsKeyName"], h), n;
}
function aA(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["model"], sh(e, r));
  const o = s(t, ["config"]);
  return o != null && iA(o, n), n;
}
function lA(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["model"], sh(e, r));
  const o = s(t, ["config"]);
  return o != null && sA(o, n), n;
}
function uA(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], bt(e, r)), n;
}
function cA(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], bt(e, r)), n;
}
function dA(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function fA(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function hA(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function pA(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = s(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = s(e, ["name"]);
  if (o != null && l(t, ["name"], o), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function gA(e) {
  const t = {}, n = s(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = s(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), s(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function mA(e) {
  const t = {}, n = s(e, ["description"]);
  n != null && l(t, ["description"], n);
  const r = s(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = s(e, ["parameters"]);
  o != null && l(t, ["parameters"], o);
  const i = s(e, ["parametersJsonSchema"]);
  i != null && l(t, ["parametersJsonSchema"], i);
  const a = s(e, ["response"]);
  a != null && l(t, ["response"], a);
  const u = s(e, ["responseJsonSchema"]);
  if (u != null && l(t, ["responseJsonSchema"], u), s(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return t;
}
function yA(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], bt(e, r)), n;
}
function _A(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], bt(e, r)), n;
}
function vA(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], rA(n));
  const r = s(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function AA(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = s(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function TA(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function SA(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function EA(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && TA(n, t), t;
}
function wA(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && SA(n, t), t;
}
function CA(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = s(e, ["cachedContents"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["cachedContents"], i);
  }
  return t;
}
function IA(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = s(e, ["cachedContents"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["cachedContents"], i);
  }
  return t;
}
function bA(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = s(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], hA(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], pA(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], oA(c));
  const d = s(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = s(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = s(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = s(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const g = s(e, ["toolCall"]);
  g != null && l(t, ["toolCall"], g);
  const y = s(e, ["toolResponse"]);
  y != null && l(t, ["toolResponse"], y);
  const _ = s(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function PA(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = s(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
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
function RA(e) {
  const t = {}, n = s(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = s(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], gA(r));
  const o = s(e, ["includeServerSideToolInvocations"]);
  return o != null && l(t, ["includeServerSideToolInvocations"], o), t;
}
function xA(e) {
  const t = {}, n = s(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = s(e, ["functionCallingConfig"]);
  if (r != null && l(t, ["functionCallingConfig"], r), s(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function MA(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = s(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = s(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], AA(o));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], vA(i));
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
function NA(e) {
  const t = {}, n = s(e, ["retrieval"]);
  n != null && l(t, ["retrieval"], n);
  const r = s(e, ["computerUse"]);
  if (r != null && l(t, ["computerUse"], r), s(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const o = s(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], o);
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], i);
  const a = s(e, ["codeExecution"]);
  a != null && l(t, ["codeExecution"], a);
  const u = s(e, ["enterpriseWebSearch"]);
  u != null && l(t, ["enterpriseWebSearch"], u);
  const c = s(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((g) => mA(g))), l(t, ["functionDeclarations"], p);
  }
  const d = s(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = s(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = s(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), s(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function kA(e, t) {
  const n = {}, r = s(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = s(e, ["expireTime"]);
  return t !== void 0 && o != null && l(t, ["expireTime"], o), n;
}
function DA(e, t) {
  const n = {}, r = s(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = s(e, ["expireTime"]);
  return t !== void 0 && o != null && l(t, ["expireTime"], o), n;
}
function $A(e, t) {
  const n = {}, r = s(t, ["name"]);
  r != null && l(n, ["_url", "name"], bt(e, r));
  const o = s(t, ["config"]);
  return o != null && kA(o, n), n;
}
function LA(e, t) {
  const n = {}, r = s(t, ["name"]);
  r != null && l(n, ["_url", "name"], bt(e, r));
  const o = s(t, ["config"]);
  return o != null && DA(o, n), n;
}
var UA = class extends It {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new cn(Ct.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = lA(this.apiClient, e);
      return a = $("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = aA(this.apiClient, e);
      return a = $("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
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
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = _A(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = yA(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
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
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = cA(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = fA(d), f = new Ac();
        return Object.assign(f, h), f;
      });
    } else {
      const c = uA(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = dA(d), f = new Ac();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = LA(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = $A(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
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
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = wA(e);
      return a = $("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = IA(d), f = new Tc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = EA(e);
      return a = $("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = CA(d), f = new Tc();
        return Object.assign(f, h), f;
      });
    }
  }
};
function Ot(e, t) {
  var n = {};
  for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var o = 0, r = Object.getOwnPropertySymbols(e); o < r.length; o++) t.indexOf(r[o]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[o]) && (n[r[o]] = e[r[o]]);
  return n;
}
function Rc(e) {
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
function J(e) {
  return this instanceof J ? (this.v = e, this) : new J(e);
}
function ct(e, t, n) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var r = n.apply(e, t || []), o, i = [];
  return o = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), u("next"), u("throw"), u("return", a), o[Symbol.asyncIterator] = function() {
    return this;
  }, o;
  function a(g) {
    return function(y) {
      return Promise.resolve(y).then(g, f);
    };
  }
  function u(g, y) {
    r[g] && (o[g] = function(_) {
      return new Promise(function(v, E) {
        i.push([
          g,
          _,
          v,
          E
        ]) > 1 || c(g, _);
      });
    }, y && (o[g] = y(o[g])));
  }
  function c(g, y) {
    try {
      d(r[g](y));
    } catch (_) {
      p(i[0][3], _);
    }
  }
  function d(g) {
    g.value instanceof J ? Promise.resolve(g.value.v).then(h, f) : p(i[0][2], g);
  }
  function h(g) {
    c("next", g);
  }
  function f(g) {
    c("throw", g);
  }
  function p(g, y) {
    g(y), i.shift(), i.length && c(i[0][0], i[0][1]);
  }
}
function dt(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof Rc == "function" ? Rc(e) : e[Symbol.iterator](), n = {}, r("next"), r("throw"), r("return"), n[Symbol.asyncIterator] = function() {
    return this;
  }, n);
  function r(i) {
    n[i] = e[i] && function(a) {
      return new Promise(function(u, c) {
        a = e[i](a), o(u, c, a.done, a.value);
      });
    };
  }
  function o(i, a, u, c) {
    Promise.resolve(c).then(function(d) {
      i({
        value: d,
        done: u
      });
    }, a);
  }
}
function FA(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : vh(n);
}
function vh(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function OA(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function xc(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let r = 0;
  for (; r < n; ) if (e[r].role === "user")
    t.push(e[r]), r++;
  else {
    const o = [];
    let i = !0;
    for (; r < n && e[r].role === "model"; )
      o.push(e[r]), i && !vh(e[r]) && (i = !1), r++;
    i ? t.push(...o) : t.pop();
  }
  return t;
}
var qA = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new BA(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, BA = class {
  constructor(e, t, n, r = {}, o = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = r, this.history = o, this.sendPromise = Promise.resolve(), OA(o);
  }
  async sendMessage(e) {
    var t;
    await this.sendPromise;
    const n = ve(e.message), r = this.modelsModule.generateContent({
      model: this.model,
      contents: this.getHistory(!0).concat(n),
      config: (t = e.config) !== null && t !== void 0 ? t : this.config
    });
    return this.sendPromise = (async () => {
      var o, i, a;
      const u = await r, c = (i = (o = u.candidates) === null || o === void 0 ? void 0 : o[0]) === null || i === void 0 ? void 0 : i.content, d = u.automaticFunctionCallingHistory, h = this.getHistory(!0).length;
      let f = [];
      d != null && (f = (a = d.slice(h)) !== null && a !== void 0 ? a : []);
      const p = c ? [c] : [];
      this.recordHistory(n, p, f);
    })(), await this.sendPromise.catch(() => {
      this.sendPromise = Promise.resolve();
    }), r;
  }
  async sendMessageStream(e) {
    var t;
    await this.sendPromise;
    const n = ve(e.message), r = this.modelsModule.generateContentStream({
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
    const t = e ? xc(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return ct(this, arguments, function* () {
      var r, o, i, a, u, c;
      const d = [];
      try {
        for (var h = !0, f = dt(e), p; p = yield J(f.next()), r = p.done, !r; h = !0) {
          a = p.value, h = !1;
          const g = a;
          if (FA(g)) {
            const y = (c = (u = g.candidates) === null || u === void 0 ? void 0 : u[0]) === null || c === void 0 ? void 0 : c.content;
            y !== void 0 && d.push(y);
          }
          yield yield J(g);
        }
      } catch (g) {
        o = { error: g };
      } finally {
        try {
          !h && !r && (i = f.return) && (yield J(i.call(f)));
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
    }), n && n.length > 0 ? this.history.push(...xc(n)) : this.history.push(e), this.history.push(...r);
  }
}, Ah = class Th extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, Th.prototype);
  }
};
function GA(e) {
  const t = {}, n = s(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function HA(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function VA(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "file"], fh(n)), t;
}
function KA(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function JA(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "file"], fh(n)), t;
}
function WA(e) {
  const t = {}, n = s(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function zA(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function YA(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && zA(n, t), t;
}
function XA(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = s(e, ["files"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["files"], i);
  }
  return t;
}
function QA(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["files"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => i)), l(t, ["files"], o);
  }
  return t;
}
var ZA = class extends It {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new cn(Ct.PAGED_ITEM_FILES, (n) => this.listInternal(n), await this.listInternal(t), t);
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
      const a = YA(e);
      return o = $("files", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = XA(u), d = new W_();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = GA(e);
      return o = $("upload/v1beta/files", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = HA(u), d = new z_();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = JA(e);
      return o = $("files/{file}", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
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
      const a = VA(e);
      return o = $("files/{file}", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = KA(u), d = new Y_();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = WA(e);
      return o = $("files:register", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = QA(u), d = new X_();
        return Object.assign(d, c), d;
      });
    }
  }
};
function Mc(e) {
  const t = {};
  if (s(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function jA(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Ko(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function eT(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => yT(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function tT(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => _T(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function nT(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function rT(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = s(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = s(e, ["name"]);
  if (o != null && l(t, ["name"], o), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function oT(e) {
  const t = {}, n = s(e, ["description"]);
  n != null && l(t, ["description"], n);
  const r = s(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = s(e, ["parameters"]);
  o != null && l(t, ["parameters"], o);
  const i = s(e, ["parametersJsonSchema"]);
  i != null && l(t, ["parametersJsonSchema"], i);
  const a = s(e, ["response"]);
  a != null && l(t, ["response"], a);
  const u = s(e, ["responseJsonSchema"]);
  if (u != null && l(t, ["responseJsonSchema"], u), s(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return t;
}
function iT(e) {
  const t = {}, n = s(e, ["modelSelectionConfig"]);
  n != null && l(t, ["modelConfig"], n);
  const r = s(e, ["responseJsonSchema"]);
  r != null && l(t, ["responseJsonSchema"], r);
  const o = s(e, ["audioTimestamp"]);
  o != null && l(t, ["audioTimestamp"], o);
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
  const g = s(e, ["responseMimeType"]);
  g != null && l(t, ["responseMimeType"], g);
  const y = s(e, ["responseModalities"]);
  y != null && l(t, ["responseModalities"], y);
  const _ = s(e, ["responseSchema"]);
  _ != null && l(t, ["responseSchema"], _);
  const v = s(e, ["routingConfig"]);
  v != null && l(t, ["routingConfig"], v);
  const E = s(e, ["seed"]);
  E != null && l(t, ["seed"], E);
  const b = s(e, ["speechConfig"]);
  b != null && l(t, ["speechConfig"], b);
  const R = s(e, ["stopSequences"]);
  R != null && l(t, ["stopSequences"], R);
  const P = s(e, ["temperature"]);
  P != null && l(t, ["temperature"], P);
  const L = s(e, ["thinkingConfig"]);
  L != null && l(t, ["thinkingConfig"], L);
  const S = s(e, ["topK"]);
  S != null && l(t, ["topK"], S);
  const O = s(e, ["topP"]);
  if (O != null && l(t, ["topP"], O), s(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return t;
}
function sT(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], jA(n));
  const r = s(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function aT(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = s(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function lT(e, t) {
  const n = {}, r = s(e, ["generationConfig"]);
  t !== void 0 && r != null && l(t, ["setup", "generationConfig"], r);
  const o = s(e, ["responseModalities"]);
  t !== void 0 && o != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], o);
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
  ], Pa(f));
  const p = s(e, ["thinkingConfig"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], p);
  const g = s(e, ["enableAffectiveDialog"]);
  t !== void 0 && g != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], g);
  const y = s(e, ["systemInstruction"]);
  t !== void 0 && y != null && l(t, ["setup", "systemInstruction"], eT(ve(y)));
  const _ = s(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let x = Vn(_);
    Array.isArray(x) && (x = x.map((D) => TT(Hn(D)))), l(t, ["setup", "tools"], x);
  }
  const v = s(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], AT(v));
  const E = s(e, ["inputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "inputAudioTranscription"], Mc(E));
  const b = s(e, ["outputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "outputAudioTranscription"], Mc(b));
  const R = s(e, ["realtimeInputConfig"]);
  t !== void 0 && R != null && l(t, ["setup", "realtimeInputConfig"], R);
  const P = s(e, ["contextWindowCompression"]);
  t !== void 0 && P != null && l(t, ["setup", "contextWindowCompression"], P);
  const L = s(e, ["proactivity"]);
  if (t !== void 0 && L != null && l(t, ["setup", "proactivity"], L), s(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const S = s(e, ["avatarConfig"]);
  t !== void 0 && S != null && l(t, ["setup", "avatarConfig"], S);
  const O = s(e, ["safetySettings"]);
  if (t !== void 0 && O != null) {
    let x = O;
    Array.isArray(x) && (x = x.map((D) => vT(D))), l(t, ["setup", "safetySettings"], x);
  }
  return n;
}
function uT(e, t) {
  const n = {}, r = s(e, ["generationConfig"]);
  t !== void 0 && r != null && l(t, ["setup", "generationConfig"], iT(r));
  const o = s(e, ["responseModalities"]);
  t !== void 0 && o != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], o);
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
  ], Pa(f));
  const p = s(e, ["thinkingConfig"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], p);
  const g = s(e, ["enableAffectiveDialog"]);
  t !== void 0 && g != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], g);
  const y = s(e, ["systemInstruction"]);
  t !== void 0 && y != null && l(t, ["setup", "systemInstruction"], tT(ve(y)));
  const _ = s(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let D = Vn(_);
    Array.isArray(D) && (D = D.map((H) => ST(Hn(H)))), l(t, ["setup", "tools"], D);
  }
  const v = s(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], v);
  const E = s(e, ["inputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "inputAudioTranscription"], E);
  const b = s(e, ["outputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "outputAudioTranscription"], b);
  const R = s(e, ["realtimeInputConfig"]);
  t !== void 0 && R != null && l(t, ["setup", "realtimeInputConfig"], R);
  const P = s(e, ["contextWindowCompression"]);
  t !== void 0 && P != null && l(t, ["setup", "contextWindowCompression"], P);
  const L = s(e, ["proactivity"]);
  t !== void 0 && L != null && l(t, ["setup", "proactivity"], L);
  const S = s(e, ["explicitVadSignal"]);
  t !== void 0 && S != null && l(t, ["setup", "explicitVadSignal"], S);
  const O = s(e, ["avatarConfig"]);
  t !== void 0 && O != null && l(t, ["setup", "avatarConfig"], O);
  const x = s(e, ["safetySettings"]);
  if (t !== void 0 && x != null) {
    let D = x;
    Array.isArray(D) && (D = D.map((H) => H)), l(t, ["setup", "safetySettings"], D);
  }
  return n;
}
function cT(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["setup", "model"], Y(e, r));
  const o = s(t, ["config"]);
  return o != null && l(n, ["config"], lT(o, n)), n;
}
function dT(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["setup", "model"], Y(e, r));
  const o = s(t, ["config"]);
  return o != null && l(n, ["config"], uT(o, n)), n;
}
function fT(e) {
  const t = {}, n = s(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function hT(e) {
  const t = {}, n = s(e, ["weightedPrompts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((o) => o)), l(t, ["weightedPrompts"], r);
  }
  return t;
}
function pT(e) {
  const t = {}, n = s(e, ["media"]);
  if (n != null) {
    let d = ah(n);
    Array.isArray(d) && (d = d.map((h) => Ko(h))), l(t, ["mediaChunks"], d);
  }
  const r = s(e, ["audio"]);
  r != null && l(t, ["audio"], Ko(uh(r)));
  const o = s(e, ["audioStreamEnd"]);
  o != null && l(t, ["audioStreamEnd"], o);
  const i = s(e, ["video"]);
  i != null && l(t, ["video"], Ko(lh(i)));
  const a = s(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = s(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = s(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function gT(e) {
  const t = {}, n = s(e, ["media"]);
  if (n != null) {
    let d = ah(n);
    Array.isArray(d) && (d = d.map((h) => h)), l(t, ["mediaChunks"], d);
  }
  const r = s(e, ["audio"]);
  r != null && l(t, ["audio"], uh(r));
  const o = s(e, ["audioStreamEnd"]);
  o != null && l(t, ["audioStreamEnd"], o);
  const i = s(e, ["video"]);
  i != null && l(t, ["video"], lh(i));
  const a = s(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = s(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = s(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function mT(e) {
  const t = {}, n = s(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const r = s(e, ["serverContent"]);
  r != null && l(t, ["serverContent"], r);
  const o = s(e, ["toolCall"]);
  o != null && l(t, ["toolCall"], o);
  const i = s(e, ["toolCallCancellation"]);
  i != null && l(t, ["toolCallCancellation"], i);
  const a = s(e, ["usageMetadata"]);
  a != null && l(t, ["usageMetadata"], ET(a));
  const u = s(e, ["goAway"]);
  u != null && l(t, ["goAway"], u);
  const c = s(e, ["sessionResumptionUpdate"]);
  c != null && l(t, ["sessionResumptionUpdate"], c);
  const d = s(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const h = s(e, ["voiceActivity"]);
  return h != null && l(t, ["voiceActivity"], wT(h)), t;
}
function yT(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = s(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], nT(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], rT(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], Ko(c));
  const d = s(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = s(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = s(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = s(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const g = s(e, ["toolCall"]);
  g != null && l(t, ["toolCall"], g);
  const y = s(e, ["toolResponse"]);
  y != null && l(t, ["toolResponse"], y);
  const _ = s(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function _T(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = s(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
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
function vT(e) {
  const t = {}, n = s(e, ["category"]);
  if (n != null && l(t, ["category"], n), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = s(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function AT(e) {
  const t = {}, n = s(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), s(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function TT(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = s(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = s(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], aT(o));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], sT(i));
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
function ST(e) {
  const t = {}, n = s(e, ["retrieval"]);
  n != null && l(t, ["retrieval"], n);
  const r = s(e, ["computerUse"]);
  if (r != null && l(t, ["computerUse"], r), s(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const o = s(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], o);
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], i);
  const a = s(e, ["codeExecution"]);
  a != null && l(t, ["codeExecution"], a);
  const u = s(e, ["enterpriseWebSearch"]);
  u != null && l(t, ["enterpriseWebSearch"], u);
  const c = s(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((g) => oT(g))), l(t, ["functionDeclarations"], p);
  }
  const d = s(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = s(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = s(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), s(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function ET(e) {
  const t = {}, n = s(e, ["promptTokenCount"]);
  n != null && l(t, ["promptTokenCount"], n);
  const r = s(e, ["cachedContentTokenCount"]);
  r != null && l(t, ["cachedContentTokenCount"], r);
  const o = s(e, ["candidatesTokenCount"]);
  o != null && l(t, ["responseTokenCount"], o);
  const i = s(e, ["toolUsePromptTokenCount"]);
  i != null && l(t, ["toolUsePromptTokenCount"], i);
  const a = s(e, ["thoughtsTokenCount"]);
  a != null && l(t, ["thoughtsTokenCount"], a);
  const u = s(e, ["totalTokenCount"]);
  u != null && l(t, ["totalTokenCount"], u);
  const c = s(e, ["promptTokensDetails"]);
  if (c != null) {
    let g = c;
    Array.isArray(g) && (g = g.map((y) => y)), l(t, ["promptTokensDetails"], g);
  }
  const d = s(e, ["cacheTokensDetails"]);
  if (d != null) {
    let g = d;
    Array.isArray(g) && (g = g.map((y) => y)), l(t, ["cacheTokensDetails"], g);
  }
  const h = s(e, ["candidatesTokensDetails"]);
  if (h != null) {
    let g = h;
    Array.isArray(g) && (g = g.map((y) => y)), l(t, ["responseTokensDetails"], g);
  }
  const f = s(e, ["toolUsePromptTokensDetails"]);
  if (f != null) {
    let g = f;
    Array.isArray(g) && (g = g.map((y) => y)), l(t, ["toolUsePromptTokensDetails"], g);
  }
  const p = s(e, ["trafficType"]);
  return p != null && l(t, ["trafficType"], p), t;
}
function wT(e) {
  const t = {}, n = s(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function CT(e, t) {
  const n = {}, r = s(e, ["apiKey"]);
  if (r != null && l(n, ["apiKey"], r), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function IT(e, t) {
  const n = {}, r = s(e, ["data"]);
  if (r != null && l(n, ["data"], r), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = s(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function bT(e, t) {
  const n = {}, r = s(e, ["content"]);
  r != null && l(n, ["content"], r);
  const o = s(e, ["citationMetadata"]);
  o != null && l(n, ["citationMetadata"], PT(o));
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
    let g = f;
    Array.isArray(g) && (g = g.map((y) => y)), l(n, ["safetyRatings"], g);
  }
  const p = s(e, ["urlContextMetadata"]);
  return p != null && l(n, ["urlContextMetadata"], p), n;
}
function PT(e, t) {
  const n = {}, r = s(e, ["citationSources"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => i)), l(n, ["citations"], o);
  }
  return n;
}
function RT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let a = De(i);
    Array.isArray(a) && (a = a.map((u) => Jn(u))), l(r, ["contents"], a);
  }
  return r;
}
function xT(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["tokensInfo"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(n, ["tokensInfo"], i);
  }
  return n;
}
function MT(e, t) {
  const n = {}, r = s(e, ["values"]);
  r != null && l(n, ["values"], r);
  const o = s(e, ["statistics"]);
  return o != null && l(n, ["statistics"], NT(o)), n;
}
function NT(e, t) {
  const n = {}, r = s(e, ["truncated"]);
  r != null && l(n, ["truncated"], r);
  const o = s(e, ["token_count"]);
  return o != null && l(n, ["tokenCount"], o), n;
}
function no(e, t) {
  const n = {}, r = s(e, ["parts"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => BS(a))), l(n, ["parts"], i);
  }
  const o = s(e, ["role"]);
  return o != null && l(n, ["role"], o), n;
}
function Jn(e, t) {
  const n = {}, r = s(e, ["parts"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => GS(a))), l(n, ["parts"], i);
  }
  const o = s(e, ["role"]);
  return o != null && l(n, ["role"], o), n;
}
function kT(e, t) {
  const n = {}, r = s(e, ["controlType"]);
  r != null && l(n, ["controlType"], r);
  const o = s(e, ["enableControlImageComputation"]);
  return o != null && l(n, ["computeControl"], o), n;
}
function DT(e, t) {
  const n = {};
  if (s(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (s(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (s(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function $T(e, t, n) {
  const r = {}, o = s(e, ["systemInstruction"]);
  t !== void 0 && o != null && l(t, ["systemInstruction"], Jn(ve(o)));
  const i = s(e, ["tools"]);
  if (t !== void 0 && i != null) {
    let u = i;
    Array.isArray(u) && (u = u.map((c) => Ch(c))), l(t, ["tools"], u);
  }
  const a = s(e, ["generationConfig"]);
  return t !== void 0 && a != null && l(t, ["generationConfig"], IS(a)), r;
}
function LT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = De(i);
    Array.isArray(u) && (u = u.map((c) => no(c))), l(r, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && DT(a), r;
}
function UT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = De(i);
    Array.isArray(u) && (u = u.map((c) => Jn(c))), l(r, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && $T(a, r), r;
}
function FT(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["totalTokens"]);
  o != null && l(n, ["totalTokens"], o);
  const i = s(e, ["cachedContentTokenCount"]);
  return i != null && l(n, ["cachedContentTokenCount"], i), n;
}
function OT(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["totalTokens"]);
  return o != null && l(n, ["totalTokens"], o), n;
}
function qT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function BT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function GT(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function HT(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function VT(e, t, n) {
  const r = {}, o = s(e, ["outputGcsUri"]);
  t !== void 0 && o != null && l(t, ["parameters", "storageUri"], o);
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
  const g = s(e, ["includeRaiReason"]);
  t !== void 0 && g != null && l(t, ["parameters", "includeRaiReason"], g);
  const y = s(e, ["language"]);
  t !== void 0 && y != null && l(t, ["parameters", "language"], y);
  const _ = s(e, ["outputMimeType"]);
  t !== void 0 && _ != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], _);
  const v = s(e, ["outputCompressionQuality"]);
  t !== void 0 && v != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], v);
  const E = s(e, ["addWatermark"]);
  t !== void 0 && E != null && l(t, ["parameters", "addWatermark"], E);
  const b = s(e, ["labels"]);
  t !== void 0 && b != null && l(t, ["labels"], b);
  const R = s(e, ["editMode"]);
  t !== void 0 && R != null && l(t, ["parameters", "editMode"], R);
  const P = s(e, ["baseSteps"]);
  return t !== void 0 && P != null && l(t, [
    "parameters",
    "editConfig",
    "baseSteps"
  ], P), r;
}
function KT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["referenceImages"]);
  if (a != null) {
    let c = a;
    Array.isArray(c) && (c = c.map((d) => zS(d))), l(r, ["instances[0]", "referenceImages"], c);
  }
  const u = s(t, ["config"]);
  return u != null && VT(u, r), r;
}
function JT(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Ii(a))), l(n, ["generatedImages"], i);
  }
  return n;
}
function WT(e, t, n) {
  const r = {}, o = s(e, ["taskType"]);
  t !== void 0 && o != null && l(t, ["requests[]", "taskType"], o);
  const i = s(e, ["title"]);
  t !== void 0 && i != null && l(t, ["requests[]", "title"], i);
  const a = s(e, ["outputDimensionality"]);
  if (t !== void 0 && a != null && l(t, ["requests[]", "outputDimensionality"], a), s(e, ["mimeType"]) !== void 0) throw new Error("mimeType parameter is not supported in Gemini API.");
  if (s(e, ["autoTruncate"]) !== void 0) throw new Error("autoTruncate parameter is not supported in Gemini API.");
  if (s(e, ["documentOcr"]) !== void 0) throw new Error("documentOcr parameter is not supported in Gemini API.");
  if (s(e, ["audioTrackExtraction"]) !== void 0) throw new Error("audioTrackExtraction parameter is not supported in Gemini API.");
  return r;
}
function zT(e, t, n) {
  const r = {};
  let o = s(n, ["embeddingApiType"]);
  if (o === void 0 && (o = "PREDICT"), o === "PREDICT") {
    const f = s(e, ["taskType"]);
    t !== void 0 && f != null && l(t, ["instances[]", "task_type"], f);
  } else if (o === "EMBED_CONTENT") {
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
  return r;
}
function YT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let d = Ca(e, i);
    Array.isArray(d) && (d = d.map((h) => h)), l(r, ["requests[]", "content"], d);
  }
  const a = s(t, ["content"]);
  a != null && no(ve(a));
  const u = s(t, ["config"]);
  u != null && WT(u, r);
  const c = s(t, ["model"]);
  return c !== void 0 && l(r, ["requests[]", "model"], Y(e, c)), r;
}
function XT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  let i = s(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const c = s(t, ["contents"]);
    if (c != null) {
      let d = Ca(e, c);
      Array.isArray(d) && (d = d.map((h) => h)), l(r, ["instances[]", "content"], d);
    }
  }
  let a = s(n, ["embeddingApiType"]);
  if (a === void 0 && (a = "PREDICT"), a === "EMBED_CONTENT") {
    const c = s(t, ["content"]);
    c != null && l(r, ["content"], Jn(ve(c)));
  }
  const u = s(t, ["config"]);
  return u != null && zT(u, r, n), r;
}
function QT(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["embeddings"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => u)), l(n, ["embeddings"], a);
  }
  const i = s(e, ["metadata"]);
  return i != null && l(n, ["metadata"], i), n;
}
function ZT(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions[]", "embeddings"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => MT(u))), l(n, ["embeddings"], a);
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
function jT(e, t) {
  const n = {}, r = s(e, ["endpoint"]);
  r != null && l(n, ["name"], r);
  const o = s(e, ["deployedModelId"]);
  return o != null && l(n, ["deployedModelId"], o), n;
}
function eS(e, t) {
  const n = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["fileUri"]);
  r != null && l(n, ["fileUri"], r);
  const o = s(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function tS(e, t) {
  const n = {}, r = s(e, ["id"]);
  r != null && l(n, ["id"], r);
  const o = s(e, ["args"]);
  o != null && l(n, ["args"], o);
  const i = s(e, ["name"]);
  if (i != null && l(n, ["name"], i), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function nS(e, t) {
  const n = {}, r = s(e, ["allowedFunctionNames"]);
  r != null && l(n, ["allowedFunctionNames"], r);
  const o = s(e, ["mode"]);
  if (o != null && l(n, ["mode"], o), s(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function rS(e, t) {
  const n = {}, r = s(e, ["description"]);
  r != null && l(n, ["description"], r);
  const o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
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
function oS(e, t, n, r) {
  const o = {}, i = s(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], no(ve(i)));
  const a = s(t, ["temperature"]);
  a != null && l(o, ["temperature"], a);
  const u = s(t, ["topP"]);
  u != null && l(o, ["topP"], u);
  const c = s(t, ["topK"]);
  c != null && l(o, ["topK"], c);
  const d = s(t, ["candidateCount"]);
  d != null && l(o, ["candidateCount"], d);
  const h = s(t, ["maxOutputTokens"]);
  h != null && l(o, ["maxOutputTokens"], h);
  const f = s(t, ["stopSequences"]);
  f != null && l(o, ["stopSequences"], f);
  const p = s(t, ["responseLogprobs"]);
  p != null && l(o, ["responseLogprobs"], p);
  const g = s(t, ["logprobs"]);
  g != null && l(o, ["logprobs"], g);
  const y = s(t, ["presencePenalty"]);
  y != null && l(o, ["presencePenalty"], y);
  const _ = s(t, ["frequencyPenalty"]);
  _ != null && l(o, ["frequencyPenalty"], _);
  const v = s(t, ["seed"]);
  v != null && l(o, ["seed"], v);
  const E = s(t, ["responseMimeType"]);
  E != null && l(o, ["responseMimeType"], E);
  const b = s(t, ["responseSchema"]);
  b != null && l(o, ["responseSchema"], Ia(b));
  const R = s(t, ["responseJsonSchema"]);
  if (R != null && l(o, ["responseJsonSchema"], R), s(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (s(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const P = s(t, ["safetySettings"]);
  if (n !== void 0 && P != null) {
    let X = P;
    Array.isArray(X) && (X = X.map((Ae) => YS(Ae))), l(n, ["safetySettings"], X);
  }
  const L = s(t, ["tools"]);
  if (n !== void 0 && L != null) {
    let X = Vn(L);
    Array.isArray(X) && (X = X.map((Ae) => rE(Hn(Ae)))), l(n, ["tools"], X);
  }
  const S = s(t, ["toolConfig"]);
  if (n !== void 0 && S != null && l(n, ["toolConfig"], tE(S)), s(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const O = s(t, ["cachedContent"]);
  n !== void 0 && O != null && l(n, ["cachedContent"], bt(e, O));
  const x = s(t, ["responseModalities"]);
  x != null && l(o, ["responseModalities"], x);
  const D = s(t, ["mediaResolution"]);
  D != null && l(o, ["mediaResolution"], D);
  const H = s(t, ["speechConfig"]);
  if (H != null && l(o, ["speechConfig"], ba(H)), s(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const z = s(t, ["thinkingConfig"]);
  z != null && l(o, ["thinkingConfig"], z);
  const ge = s(t, ["imageConfig"]);
  ge != null && l(o, ["imageConfig"], MS(ge));
  const Q = s(t, ["enableEnhancedCivicAnswers"]);
  if (Q != null && l(o, ["enableEnhancedCivicAnswers"], Q), s(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const Z = s(t, ["serviceTier"]);
  return n !== void 0 && Z != null && l(n, ["serviceTier"], Z), o;
}
function iS(e, t, n, r) {
  const o = {}, i = s(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], Jn(ve(i)));
  const a = s(t, ["temperature"]);
  a != null && l(o, ["temperature"], a);
  const u = s(t, ["topP"]);
  u != null && l(o, ["topP"], u);
  const c = s(t, ["topK"]);
  c != null && l(o, ["topK"], c);
  const d = s(t, ["candidateCount"]);
  d != null && l(o, ["candidateCount"], d);
  const h = s(t, ["maxOutputTokens"]);
  h != null && l(o, ["maxOutputTokens"], h);
  const f = s(t, ["stopSequences"]);
  f != null && l(o, ["stopSequences"], f);
  const p = s(t, ["responseLogprobs"]);
  p != null && l(o, ["responseLogprobs"], p);
  const g = s(t, ["logprobs"]);
  g != null && l(o, ["logprobs"], g);
  const y = s(t, ["presencePenalty"]);
  y != null && l(o, ["presencePenalty"], y);
  const _ = s(t, ["frequencyPenalty"]);
  _ != null && l(o, ["frequencyPenalty"], _);
  const v = s(t, ["seed"]);
  v != null && l(o, ["seed"], v);
  const E = s(t, ["responseMimeType"]);
  E != null && l(o, ["responseMimeType"], E);
  const b = s(t, ["responseSchema"]);
  b != null && l(o, ["responseSchema"], Ia(b));
  const R = s(t, ["responseJsonSchema"]);
  R != null && l(o, ["responseJsonSchema"], R);
  const P = s(t, ["routingConfig"]);
  P != null && l(o, ["routingConfig"], P);
  const L = s(t, ["modelSelectionConfig"]);
  L != null && l(o, ["modelConfig"], L);
  const S = s(t, ["safetySettings"]);
  if (n !== void 0 && S != null) {
    let ie = S;
    Array.isArray(ie) && (ie = ie.map((dn) => dn)), l(n, ["safetySettings"], ie);
  }
  const O = s(t, ["tools"]);
  if (n !== void 0 && O != null) {
    let ie = Vn(O);
    Array.isArray(ie) && (ie = ie.map((dn) => Ch(Hn(dn)))), l(n, ["tools"], ie);
  }
  const x = s(t, ["toolConfig"]);
  n !== void 0 && x != null && l(n, ["toolConfig"], nE(x));
  const D = s(t, ["labels"]);
  n !== void 0 && D != null && l(n, ["labels"], D);
  const H = s(t, ["cachedContent"]);
  n !== void 0 && H != null && l(n, ["cachedContent"], bt(e, H));
  const z = s(t, ["responseModalities"]);
  z != null && l(o, ["responseModalities"], z);
  const ge = s(t, ["mediaResolution"]);
  ge != null && l(o, ["mediaResolution"], ge);
  const Q = s(t, ["speechConfig"]);
  Q != null && l(o, ["speechConfig"], ba(Q));
  const Z = s(t, ["audioTimestamp"]);
  Z != null && l(o, ["audioTimestamp"], Z);
  const X = s(t, ["thinkingConfig"]);
  X != null && l(o, ["thinkingConfig"], X);
  const Ae = s(t, ["imageConfig"]);
  if (Ae != null && l(o, ["imageConfig"], NS(Ae)), s(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const Ye = s(t, ["modelArmorConfig"]);
  n !== void 0 && Ye != null && l(n, ["modelArmorConfig"], Ye);
  const me = s(t, ["serviceTier"]);
  return n !== void 0 && me != null && l(n, ["serviceTier"], me), o;
}
function Nc(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = De(i);
    Array.isArray(u) && (u = u.map((c) => no(c))), l(r, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && l(r, ["generationConfig"], oS(e, a, r)), r;
}
function kc(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = De(i);
    Array.isArray(u) && (u = u.map((c) => Jn(c))), l(r, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && l(r, ["generationConfig"], iS(e, a, r)), r;
}
function Dc(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["candidates"]);
  if (o != null) {
    let h = o;
    Array.isArray(h) && (h = h.map((f) => bT(f))), l(n, ["candidates"], h);
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
function $c(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["candidates"]);
  if (o != null) {
    let h = o;
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
function sS(e, t, n) {
  const r = {};
  if (s(e, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  if (s(e, ["negativePrompt"]) !== void 0) throw new Error("negativePrompt parameter is not supported in Gemini API.");
  const o = s(e, ["numberOfImages"]);
  t !== void 0 && o != null && l(t, ["parameters", "sampleCount"], o);
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
  const g = s(e, ["outputCompressionQuality"]);
  if (t !== void 0 && g != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], g), s(e, ["addWatermark"]) !== void 0) throw new Error("addWatermark parameter is not supported in Gemini API.");
  if (s(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const y = s(e, ["imageSize"]);
  if (t !== void 0 && y != null && l(t, ["parameters", "sampleImageSize"], y), s(e, ["enhancePrompt"]) !== void 0) throw new Error("enhancePrompt parameter is not supported in Gemini API.");
  return r;
}
function aS(e, t, n) {
  const r = {}, o = s(e, ["outputGcsUri"]);
  t !== void 0 && o != null && l(t, ["parameters", "storageUri"], o);
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
  const g = s(e, ["includeRaiReason"]);
  t !== void 0 && g != null && l(t, ["parameters", "includeRaiReason"], g);
  const y = s(e, ["language"]);
  t !== void 0 && y != null && l(t, ["parameters", "language"], y);
  const _ = s(e, ["outputMimeType"]);
  t !== void 0 && _ != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], _);
  const v = s(e, ["outputCompressionQuality"]);
  t !== void 0 && v != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], v);
  const E = s(e, ["addWatermark"]);
  t !== void 0 && E != null && l(t, ["parameters", "addWatermark"], E);
  const b = s(e, ["labels"]);
  t !== void 0 && b != null && l(t, ["labels"], b);
  const R = s(e, ["imageSize"]);
  t !== void 0 && R != null && l(t, ["parameters", "sampleImageSize"], R);
  const P = s(e, ["enhancePrompt"]);
  return t !== void 0 && P != null && l(t, ["parameters", "enhancePrompt"], P), r;
}
function lS(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["config"]);
  return a != null && sS(a, r), r;
}
function uS(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["config"]);
  return a != null && aS(a, r), r;
}
function cS(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => SS(u))), l(n, ["generatedImages"], a);
  }
  const i = s(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], Eh(i)), n;
}
function dS(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => Ii(u))), l(n, ["generatedImages"], a);
  }
  const i = s(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], wh(i)), n;
}
function fS(e, t, n) {
  const r = {}, o = s(e, ["numberOfVideos"]);
  if (t !== void 0 && o != null && l(t, ["parameters", "sampleCount"], o), s(e, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
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
  t !== void 0 && f != null && l(t, ["instances[0]", "lastFrame"], bi(f));
  const p = s(e, ["referenceImages"]);
  if (t !== void 0 && p != null) {
    let y = p;
    Array.isArray(y) && (y = y.map((_) => mE(_))), l(t, ["instances[0]", "referenceImages"], y);
  }
  if (s(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (s(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (s(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const g = s(e, ["webhookConfig"]);
  return t !== void 0 && g != null && l(t, ["webhookConfig"], g), r;
}
function hS(e, t, n) {
  const r = {}, o = s(e, ["numberOfVideos"]);
  t !== void 0 && o != null && l(t, ["parameters", "sampleCount"], o);
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
  const g = s(e, ["negativePrompt"]);
  t !== void 0 && g != null && l(t, ["parameters", "negativePrompt"], g);
  const y = s(e, ["enhancePrompt"]);
  t !== void 0 && y != null && l(t, ["parameters", "enhancePrompt"], y);
  const _ = s(e, ["generateAudio"]);
  t !== void 0 && _ != null && l(t, ["parameters", "generateAudio"], _);
  const v = s(e, ["lastFrame"]);
  t !== void 0 && v != null && l(t, ["instances[0]", "lastFrame"], ft(v));
  const E = s(e, ["referenceImages"]);
  if (t !== void 0 && E != null) {
    let L = E;
    Array.isArray(L) && (L = L.map((S) => yE(S))), l(t, ["instances[0]", "referenceImages"], L);
  }
  const b = s(e, ["mask"]);
  t !== void 0 && b != null && l(t, ["instances[0]", "mask"], gE(b));
  const R = s(e, ["compressionQuality"]);
  t !== void 0 && R != null && l(t, ["parameters", "compressionQuality"], R);
  const P = s(e, ["labels"]);
  if (t !== void 0 && P != null && l(t, ["labels"], P), s(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return r;
}
function pS(e, t) {
  const n = {}, r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = s(e, ["metadata"]);
  o != null && l(n, ["metadata"], o);
  const i = s(e, ["done"]);
  i != null && l(n, ["done"], i);
  const a = s(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = s(e, ["response", "generateVideoResponse"]);
  return u != null && l(n, ["response"], _S(u)), n;
}
function gS(e, t) {
  const n = {}, r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = s(e, ["metadata"]);
  o != null && l(n, ["metadata"], o);
  const i = s(e, ["done"]);
  i != null && l(n, ["done"], i);
  const a = s(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = s(e, ["response"]);
  return u != null && l(n, ["response"], vS(u)), n;
}
function mS(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["image"]);
  a != null && l(r, ["instances[0]", "image"], bi(a));
  const u = s(t, ["video"]);
  u != null && l(r, ["instances[0]", "video"], Ih(u));
  const c = s(t, ["source"]);
  c != null && AS(c, r);
  const d = s(t, ["config"]);
  return d != null && fS(d, r), r;
}
function yS(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["image"]);
  a != null && l(r, ["instances[0]", "image"], ft(a));
  const u = s(t, ["video"]);
  u != null && l(r, ["instances[0]", "video"], bh(u));
  const c = s(t, ["source"]);
  c != null && TS(c, r);
  const d = s(t, ["config"]);
  return d != null && hS(d, r), r;
}
function _S(e, t) {
  const n = {}, r = s(e, ["generatedSamples"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => wS(u))), l(n, ["generatedVideos"], a);
  }
  const o = s(e, ["raiMediaFilteredCount"]);
  o != null && l(n, ["raiMediaFilteredCount"], o);
  const i = s(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function vS(e, t) {
  const n = {}, r = s(e, ["videos"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => CS(u))), l(n, ["generatedVideos"], a);
  }
  const o = s(e, ["raiMediaFilteredCount"]);
  o != null && l(n, ["raiMediaFilteredCount"], o);
  const i = s(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function AS(e, t, n) {
  const r = {}, o = s(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const i = s(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], bi(i));
  const a = s(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], Ih(a)), r;
}
function TS(e, t, n) {
  const r = {}, o = s(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const i = s(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], ft(i));
  const a = s(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], bh(a)), r;
}
function SS(e, t) {
  const n = {}, r = s(e, ["_self"]);
  r != null && l(n, ["image"], kS(r));
  const o = s(e, ["raiFilteredReason"]);
  o != null && l(n, ["raiFilteredReason"], o);
  const i = s(e, ["_self"]);
  return i != null && l(n, ["safetyAttributes"], Eh(i)), n;
}
function Ii(e, t) {
  const n = {}, r = s(e, ["_self"]);
  r != null && l(n, ["image"], Sh(r));
  const o = s(e, ["raiFilteredReason"]);
  o != null && l(n, ["raiFilteredReason"], o);
  const i = s(e, ["_self"]);
  i != null && l(n, ["safetyAttributes"], wh(i));
  const a = s(e, ["prompt"]);
  return a != null && l(n, ["enhancedPrompt"], a), n;
}
function ES(e, t) {
  const n = {}, r = s(e, ["_self"]);
  r != null && l(n, ["mask"], Sh(r));
  const o = s(e, ["labels"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(n, ["labels"], i);
  }
  return n;
}
function wS(e, t) {
  const n = {}, r = s(e, ["video"]);
  return r != null && l(n, ["video"], hE(r)), n;
}
function CS(e, t) {
  const n = {}, r = s(e, ["_self"]);
  return r != null && l(n, ["video"], pE(r)), n;
}
function IS(e, t) {
  const n = {}, r = s(e, ["modelSelectionConfig"]);
  r != null && l(n, ["modelConfig"], r);
  const o = s(e, ["responseJsonSchema"]);
  o != null && l(n, ["responseJsonSchema"], o);
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
  const g = s(e, ["responseLogprobs"]);
  g != null && l(n, ["responseLogprobs"], g);
  const y = s(e, ["responseMimeType"]);
  y != null && l(n, ["responseMimeType"], y);
  const _ = s(e, ["responseModalities"]);
  _ != null && l(n, ["responseModalities"], _);
  const v = s(e, ["responseSchema"]);
  v != null && l(n, ["responseSchema"], v);
  const E = s(e, ["routingConfig"]);
  E != null && l(n, ["routingConfig"], E);
  const b = s(e, ["seed"]);
  b != null && l(n, ["seed"], b);
  const R = s(e, ["speechConfig"]);
  R != null && l(n, ["speechConfig"], R);
  const P = s(e, ["stopSequences"]);
  P != null && l(n, ["stopSequences"], P);
  const L = s(e, ["temperature"]);
  L != null && l(n, ["temperature"], L);
  const S = s(e, ["thinkingConfig"]);
  S != null && l(n, ["thinkingConfig"], S);
  const O = s(e, ["topK"]);
  O != null && l(n, ["topK"], O);
  const x = s(e, ["topP"]);
  if (x != null && l(n, ["topP"], x), s(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return n;
}
function bS(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function PS(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function RS(e, t) {
  const n = {}, r = s(e, ["authConfig"]);
  r != null && l(n, ["authConfig"], CT(r));
  const o = s(e, ["enableWidget"]);
  return o != null && l(n, ["enableWidget"], o), n;
}
function xS(e, t) {
  const n = {}, r = s(e, ["searchTypes"]);
  if (r != null && l(n, ["searchTypes"], r), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = s(e, ["timeRangeFilter"]);
  return o != null && l(n, ["timeRangeFilter"], o), n;
}
function MS(e, t) {
  const n = {}, r = s(e, ["aspectRatio"]);
  r != null && l(n, ["aspectRatio"], r);
  const o = s(e, ["imageSize"]);
  if (o != null && l(n, ["imageSize"], o), s(e, ["personGeneration"]) !== void 0) throw new Error("personGeneration parameter is not supported in Gemini API.");
  if (s(e, ["prominentPeople"]) !== void 0) throw new Error("prominentPeople parameter is not supported in Gemini API.");
  if (s(e, ["outputMimeType"]) !== void 0) throw new Error("outputMimeType parameter is not supported in Gemini API.");
  if (s(e, ["outputCompressionQuality"]) !== void 0) throw new Error("outputCompressionQuality parameter is not supported in Gemini API.");
  if (s(e, ["imageOutputOptions"]) !== void 0) throw new Error("imageOutputOptions parameter is not supported in Gemini API.");
  return n;
}
function NS(e, t) {
  const n = {}, r = s(e, ["aspectRatio"]);
  r != null && l(n, ["aspectRatio"], r);
  const o = s(e, ["imageSize"]);
  o != null && l(n, ["imageSize"], o);
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
function kS(e, t) {
  const n = {}, r = s(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["imageBytes"], Gt(r));
  const o = s(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function Sh(e, t) {
  const n = {}, r = s(e, ["gcsUri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = s(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["imageBytes"], Gt(o));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function bi(e, t) {
  const n = {};
  if (s(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  const r = s(e, ["imageBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], Gt(r));
  const o = s(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function ft(e, t) {
  const n = {}, r = s(e, ["gcsUri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = s(e, ["imageBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], Gt(o));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function DS(e, t, n, r) {
  const o = {}, i = s(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const a = s(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = s(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = s(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], hh(e, c)), o;
}
function $S(e, t, n, r) {
  const o = {}, i = s(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const a = s(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = s(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = s(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], hh(e, c)), o;
}
function LS(e, t, n) {
  const r = {}, o = s(t, ["config"]);
  return o != null && DS(e, o, r), r;
}
function US(e, t, n) {
  const r = {}, o = s(t, ["config"]);
  return o != null && $S(e, o, r), r;
}
function FS(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const i = s(e, ["_self"]);
  if (i != null) {
    let a = ph(i);
    Array.isArray(a) && (a = a.map((u) => ks(u))), l(n, ["models"], a);
  }
  return n;
}
function OS(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const i = s(e, ["_self"]);
  if (i != null) {
    let a = ph(i);
    Array.isArray(a) && (a = a.map((u) => Ds(u))), l(n, ["models"], a);
  }
  return n;
}
function qS(e, t) {
  const n = {}, r = s(e, ["maskMode"]);
  r != null && l(n, ["maskMode"], r);
  const o = s(e, ["segmentationClasses"]);
  o != null && l(n, ["maskClasses"], o);
  const i = s(e, ["maskDilation"]);
  return i != null && l(n, ["dilation"], i), n;
}
function ks(e, t) {
  const n = {}, r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = s(e, ["displayName"]);
  o != null && l(n, ["displayName"], o);
  const i = s(e, ["description"]);
  i != null && l(n, ["description"], i);
  const a = s(e, ["version"]);
  a != null && l(n, ["version"], a);
  const u = s(e, ["_self"]);
  u != null && l(n, ["tunedModelInfo"], oE(u));
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
  const g = s(e, ["topP"]);
  g != null && l(n, ["topP"], g);
  const y = s(e, ["topK"]);
  y != null && l(n, ["topK"], y);
  const _ = s(e, ["thinking"]);
  return _ != null && l(n, ["thinking"], _), n;
}
function Ds(e, t) {
  const n = {}, r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = s(e, ["displayName"]);
  o != null && l(n, ["displayName"], o);
  const i = s(e, ["description"]);
  i != null && l(n, ["description"], i);
  const a = s(e, ["versionId"]);
  a != null && l(n, ["version"], a);
  const u = s(e, ["deployedModels"]);
  if (u != null) {
    let p = u;
    Array.isArray(p) && (p = p.map((g) => jT(g))), l(n, ["endpoints"], p);
  }
  const c = s(e, ["labels"]);
  c != null && l(n, ["labels"], c);
  const d = s(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], iE(d));
  const h = s(e, ["defaultCheckpointId"]);
  h != null && l(n, ["defaultCheckpointId"], h);
  const f = s(e, ["checkpoints"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((g) => g)), l(n, ["checkpoints"], p);
  }
  return n;
}
function BS(e, t) {
  const n = {}, r = s(e, ["mediaResolution"]);
  r != null && l(n, ["mediaResolution"], r);
  const o = s(e, ["codeExecutionResult"]);
  o != null && l(n, ["codeExecutionResult"], o);
  const i = s(e, ["executableCode"]);
  i != null && l(n, ["executableCode"], i);
  const a = s(e, ["fileData"]);
  a != null && l(n, ["fileData"], eS(a));
  const u = s(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], tS(u));
  const c = s(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = s(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], IT(d));
  const h = s(e, ["text"]);
  h != null && l(n, ["text"], h);
  const f = s(e, ["thought"]);
  f != null && l(n, ["thought"], f);
  const p = s(e, ["thoughtSignature"]);
  p != null && l(n, ["thoughtSignature"], p);
  const g = s(e, ["videoMetadata"]);
  g != null && l(n, ["videoMetadata"], g);
  const y = s(e, ["toolCall"]);
  y != null && l(n, ["toolCall"], y);
  const _ = s(e, ["toolResponse"]);
  _ != null && l(n, ["toolResponse"], _);
  const v = s(e, ["partMetadata"]);
  return v != null && l(n, ["partMetadata"], v), n;
}
function GS(e, t) {
  const n = {}, r = s(e, ["mediaResolution"]);
  r != null && l(n, ["mediaResolution"], r);
  const o = s(e, ["codeExecutionResult"]);
  o != null && l(n, ["codeExecutionResult"], o);
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
  const g = s(e, ["videoMetadata"]);
  if (g != null && l(n, ["videoMetadata"], g), s(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (s(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (s(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return n;
}
function HS(e, t) {
  const n = {}, r = s(e, ["productImage"]);
  return r != null && l(n, ["image"], ft(r)), n;
}
function VS(e, t, n) {
  const r = {}, o = s(e, ["numberOfImages"]);
  t !== void 0 && o != null && l(t, ["parameters", "sampleCount"], o);
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
  const g = s(e, ["enhancePrompt"]);
  t !== void 0 && g != null && l(t, ["parameters", "enhancePrompt"], g);
  const y = s(e, ["labels"]);
  return t !== void 0 && y != null && l(t, ["labels"], y), r;
}
function KS(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["source"]);
  i != null && WS(i, r);
  const a = s(t, ["config"]);
  return a != null && VS(a, r), r;
}
function JS(e, t) {
  const n = {}, r = s(e, ["predictions"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => Ii(i))), l(n, ["generatedImages"], o);
  }
  return n;
}
function WS(e, t, n) {
  const r = {}, o = s(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const i = s(e, ["personImage"]);
  t !== void 0 && i != null && l(t, [
    "instances[0]",
    "personImage",
    "image"
  ], ft(i));
  const a = s(e, ["productImages"]);
  if (t !== void 0 && a != null) {
    let u = a;
    Array.isArray(u) && (u = u.map((c) => HS(c))), l(t, ["instances[0]", "productImages"], u);
  }
  return r;
}
function zS(e, t) {
  const n = {}, r = s(e, ["referenceImage"]);
  r != null && l(n, ["referenceImage"], ft(r));
  const o = s(e, ["referenceId"]);
  o != null && l(n, ["referenceId"], o);
  const i = s(e, ["referenceType"]);
  i != null && l(n, ["referenceType"], i);
  const a = s(e, ["maskImageConfig"]);
  a != null && l(n, ["maskImageConfig"], qS(a));
  const u = s(e, ["controlImageConfig"]);
  u != null && l(n, ["controlImageConfig"], kT(u));
  const c = s(e, ["styleImageConfig"]);
  c != null && l(n, ["styleImageConfig"], c);
  const d = s(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function Eh(e, t) {
  const n = {}, r = s(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const o = s(e, ["safetyAttributes", "scores"]);
  o != null && l(n, ["scores"], o);
  const i = s(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function wh(e, t) {
  const n = {}, r = s(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const o = s(e, ["safetyAttributes", "scores"]);
  o != null && l(n, ["scores"], o);
  const i = s(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function YS(e, t) {
  const n = {}, r = s(e, ["category"]);
  if (r != null && l(n, ["category"], r), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = s(e, ["threshold"]);
  return o != null && l(n, ["threshold"], o), n;
}
function XS(e, t) {
  const n = {}, r = s(e, ["image"]);
  return r != null && l(n, ["image"], ft(r)), n;
}
function QS(e, t, n) {
  const r = {}, o = s(e, ["mode"]);
  t !== void 0 && o != null && l(t, ["parameters", "mode"], o);
  const i = s(e, ["maxPredictions"]);
  t !== void 0 && i != null && l(t, ["parameters", "maxPredictions"], i);
  const a = s(e, ["confidenceThreshold"]);
  t !== void 0 && a != null && l(t, ["parameters", "confidenceThreshold"], a);
  const u = s(e, ["maskDilation"]);
  t !== void 0 && u != null && l(t, ["parameters", "maskDilation"], u);
  const c = s(e, ["binaryColorThreshold"]);
  t !== void 0 && c != null && l(t, ["parameters", "binaryColorThreshold"], c);
  const d = s(e, ["labels"]);
  return t !== void 0 && d != null && l(t, ["labels"], d), r;
}
function ZS(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["source"]);
  i != null && eE(i, r);
  const a = s(t, ["config"]);
  return a != null && QS(a, r), r;
}
function jS(e, t) {
  const n = {}, r = s(e, ["predictions"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => ES(i))), l(n, ["generatedMasks"], o);
  }
  return n;
}
function eE(e, t, n) {
  const r = {}, o = s(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const i = s(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], ft(i));
  const a = s(e, ["scribbleImage"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "scribble"], XS(a)), r;
}
function tE(e, t) {
  const n = {}, r = s(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const o = s(e, ["functionCallingConfig"]);
  o != null && l(n, ["functionCallingConfig"], nS(o));
  const i = s(e, ["includeServerSideToolInvocations"]);
  return i != null && l(n, ["includeServerSideToolInvocations"], i), n;
}
function nE(e, t) {
  const n = {}, r = s(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const o = s(e, ["functionCallingConfig"]);
  if (o != null && l(n, ["functionCallingConfig"], o), s(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function rE(e, t) {
  const n = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const r = s(e, ["computerUse"]);
  r != null && l(n, ["computerUse"], r);
  const o = s(e, ["fileSearch"]);
  o != null && l(n, ["fileSearch"], o);
  const i = s(e, ["googleSearch"]);
  i != null && l(n, ["googleSearch"], xS(i));
  const a = s(e, ["googleMaps"]);
  a != null && l(n, ["googleMaps"], RS(a));
  const u = s(e, ["codeExecution"]);
  if (u != null && l(n, ["codeExecution"], u), s(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const c = s(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((g) => g)), l(n, ["functionDeclarations"], p);
  }
  const d = s(e, ["googleSearchRetrieval"]);
  if (d != null && l(n, ["googleSearchRetrieval"], d), s(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const h = s(e, ["urlContext"]);
  h != null && l(n, ["urlContext"], h);
  const f = s(e, ["mcpServers"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((g) => g)), l(n, ["mcpServers"], p);
  }
  return n;
}
function Ch(e, t) {
  const n = {}, r = s(e, ["retrieval"]);
  r != null && l(n, ["retrieval"], r);
  const o = s(e, ["computerUse"]);
  if (o != null && l(n, ["computerUse"], o), s(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
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
    let g = d;
    Array.isArray(g) && (g = g.map((y) => rS(y))), l(n, ["functionDeclarations"], g);
  }
  const h = s(e, ["googleSearchRetrieval"]);
  h != null && l(n, ["googleSearchRetrieval"], h);
  const f = s(e, ["parallelAiSearch"]);
  f != null && l(n, ["parallelAiSearch"], f);
  const p = s(e, ["urlContext"]);
  if (p != null && l(n, ["urlContext"], p), s(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function oE(e, t) {
  const n = {}, r = s(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = s(e, ["createTime"]);
  o != null && l(n, ["createTime"], o);
  const i = s(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function iE(e, t) {
  const n = {}, r = s(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  r != null && l(n, ["baseModel"], r);
  const o = s(e, ["createTime"]);
  o != null && l(n, ["createTime"], o);
  const i = s(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function sE(e, t, n) {
  const r = {}, o = s(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const i = s(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const a = s(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), r;
}
function aE(e, t, n) {
  const r = {}, o = s(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const i = s(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const a = s(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), r;
}
function lE(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "name"], Y(e, o));
  const i = s(t, ["config"]);
  return i != null && sE(i, r), r;
}
function uE(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["config"]);
  return i != null && aE(i, r), r;
}
function cE(e, t, n) {
  const r = {}, o = s(e, ["outputGcsUri"]);
  t !== void 0 && o != null && l(t, ["parameters", "storageUri"], o);
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
  const g = s(e, ["numberOfImages"]);
  t !== void 0 && g != null && l(t, ["parameters", "sampleCount"], g);
  const y = s(e, ["mode"]);
  return t !== void 0 && y != null && l(t, ["parameters", "mode"], y), r;
}
function dE(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["image"]);
  i != null && l(r, ["instances[0]", "image"], ft(i));
  const a = s(t, ["upscaleFactor"]);
  a != null && l(r, [
    "parameters",
    "upscaleConfig",
    "upscaleFactor"
  ], a);
  const u = s(t, ["config"]);
  return u != null && cE(u, r), r;
}
function fE(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Ii(a))), l(n, ["generatedImages"], i);
  }
  return n;
}
function hE(e, t) {
  const n = {}, r = s(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const o = s(e, ["encodedVideo"]);
  o != null && l(n, ["videoBytes"], Gt(o));
  const i = s(e, ["encoding"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function pE(e, t) {
  const n = {}, r = s(e, ["gcsUri"]);
  r != null && l(n, ["uri"], r);
  const o = s(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["videoBytes"], Gt(o));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function gE(e, t) {
  const n = {}, r = s(e, ["image"]);
  r != null && l(n, ["_self"], ft(r));
  const o = s(e, ["maskMode"]);
  return o != null && l(n, ["maskMode"], o), n;
}
function mE(e, t) {
  const n = {}, r = s(e, ["image"]);
  r != null && l(n, ["image"], bi(r));
  const o = s(e, ["referenceType"]);
  return o != null && l(n, ["referenceType"], o), n;
}
function yE(e, t) {
  const n = {}, r = s(e, ["image"]);
  r != null && l(n, ["image"], ft(r));
  const o = s(e, ["referenceType"]);
  return o != null && l(n, ["referenceType"], o), n;
}
function Ih(e, t) {
  const n = {}, r = s(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const o = s(e, ["videoBytes"]);
  o != null && l(n, ["encodedVideo"], Gt(o));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["encoding"], i), n;
}
function bh(e, t) {
  const n = {}, r = s(e, ["uri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = s(e, ["videoBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], Gt(o));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function _E(e, t) {
  const n = {}, r = s(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["displayName"], r), n;
}
function vE(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && _E(n, t), t;
}
function AE(e, t) {
  const n = {}, r = s(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function TE(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = s(e, ["config"]);
  return r != null && AE(r, t), t;
}
function SE(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function EE(e, t) {
  const n = {}, r = s(e, ["customMetadata"]);
  if (t !== void 0 && r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["customMetadata"], i);
  }
  const o = s(e, ["chunkingConfig"]);
  return t !== void 0 && o != null && l(t, ["chunkingConfig"], o), n;
}
function wE(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], IE(a)), t;
}
function CE(e) {
  const t = {}, n = s(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = s(e, ["fileName"]);
  r != null && l(t, ["fileName"], r);
  const o = s(e, ["config"]);
  return o != null && EE(o, t), t;
}
function IE(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = s(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function bE(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function PE(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && bE(n, t), t;
}
function RE(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = s(e, ["fileSearchStores"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["fileSearchStores"], i);
  }
  return t;
}
function Ph(e, t) {
  const n = {}, r = s(e, ["mimeType"]);
  t !== void 0 && r != null && l(t, ["mimeType"], r);
  const o = s(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const i = s(e, ["customMetadata"]);
  if (t !== void 0 && i != null) {
    let u = i;
    Array.isArray(u) && (u = u.map((c) => c)), l(t, ["customMetadata"], u);
  }
  const a = s(e, ["chunkingConfig"]);
  return t !== void 0 && a != null && l(t, ["chunkingConfig"], a), n;
}
function xE(e) {
  const t = {}, n = s(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = s(e, ["config"]);
  return r != null && Ph(r, t), t;
}
function ME(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var NE = "Content-Type", kE = "X-Server-Timeout", DE = "User-Agent", $s = "x-goog-api-client", $E = "google-genai-sdk/1.50.1", LE = "v1beta1", UE = "v1beta", FE = /* @__PURE__ */ new Set(["us", "eu"]), OE = 5, qE = [
  408,
  429,
  500,
  502,
  503,
  504
], BE = class {
  constructor(e) {
    var t, n, r;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const o = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const i = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !i ? (o.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? o.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && FE.has(this.clientOptions.location) ? o.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (o.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), o.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : LE;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), o.apiVersion = (r = this.clientOptions.apiVersion) !== null && r !== void 0 ? r : UE, o.baseUrl = "https://generativelanguage.googleapis.com/";
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
    return !(t.baseUrl && t.baseUrlResourceScope === Rs.COLLECTION || this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
  }
  async request(e) {
    let t = this.clientOptions.httpOptions;
    e.httpOptions && (t = this.patchHttpOptions(this.clientOptions.httpOptions, e.httpOptions));
    const n = this.shouldPrependVertexProjectPath(e, t), r = this.constructUrl(e.path, t, n);
    if (e.queryParams) for (const [i, a] of Object.entries(e.queryParams)) r.searchParams.append(i, String(a));
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
        const a = setTimeout(() => o.abort(), t.timeout);
        a && typeof a.unref == "function" && a.unref();
      }
      r && r.addEventListener("abort", () => {
        o.abort();
      }), e.signal = i;
    }
    return t && t.extraBody !== null && GE(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await Lc(r), new xs(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await Lc(r), this.processStreamResponse(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  processStreamResponse(e) {
    return ct(this, arguments, function* () {
      var n;
      const r = (n = e?.body) === null || n === void 0 ? void 0 : n.getReader(), o = new TextDecoder("utf-8");
      if (!r) throw new Error("Response body is empty");
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
          const { done: c, value: d } = yield J(r.read());
          if (c) {
            if (i.trim().length > 0) throw new Error("Incomplete JSON segment at the end");
            break;
          }
          const h = o.decode(d, { stream: !0 });
          try {
            const g = JSON.parse(h);
            if ("error" in g) {
              const y = JSON.parse(JSON.stringify(g.error)), _ = y.status, v = y.code, E = `got status: ${_}. ${JSON.stringify(g)}`;
              if (v >= 400 && v < 600) throw new Ah({
                message: E,
                status: v
              });
            }
          } catch (g) {
            if (g.name === "ApiError") throw g;
          }
          i += h;
          let f = -1, p = 0;
          for (; ; ) {
            f = -1, p = 0;
            for (const _ of u) {
              const v = i.indexOf(_);
              v !== -1 && (f === -1 || v < f) && (f = v, p = _.length);
            }
            if (f === -1) break;
            const g = i.substring(0, f);
            i = i.substring(f + p);
            const y = g.trim();
            if (y.startsWith(a)) {
              const _ = y.substring(5).trim();
              try {
                yield yield J(new xs(new Response(_, {
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
      throw qE.includes(i.status) ? new Error(`Retryable HTTP Error: ${i.statusText}`) : new lu.AbortError(`Non-retryable exception ${i.statusText} sending request`);
    };
    return (0, lu.default)(o, { retries: ((n = r.attempts) !== null && n !== void 0 ? n : OE) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = $E + " " + this.clientOptions.userAgentExtra;
    return e[DE] = t, e[$s] = t, e[NE] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [r, o] of Object.entries(e.headers)) n.append(r, o);
      e.timeout && e.timeout > 0 && n.append(kE, String(Math.ceil(e.timeout / 1e3)));
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
    const a = (n = t?.mimeType) !== null && n !== void 0 ? n : i.type;
    if (a === void 0 || a === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    r.mimeType = a;
    const u = { file: r }, c = this.getFileName(e), d = $("upload/v1beta/files", u._url), h = await this.fetchUploadUrl(d, r.sizeBytes, r.mimeType, c, u, t?.httpOptions);
    return o.upload(e, h, this);
  }
  async uploadFileToFileSearchStore(e, t, n) {
    var r;
    const o = this.clientOptions.uploader, i = await o.stat(t), a = String(i.size), u = (r = n?.mimeType) !== null && r !== void 0 ? r : i.type;
    if (u === void 0 || u === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    const c = `upload/v1beta/${e}:uploadToFileSearchStore`, d = this.getFileName(t), h = {};
    n != null && Ph(n, h);
    const f = await this.fetchUploadUrl(c, a, u, d, h, n?.httpOptions);
    return o.uploadToFileSearchStore(t, f, this);
  }
  async downloadFile(e) {
    await this.clientOptions.downloader.download(e, this);
  }
  async fetchUploadUrl(e, t, n, r, o, i) {
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
      }, r ? { "X-Goog-Upload-File-Name": r } : {})
    };
    const c = await this.request({
      path: e,
      body: JSON.stringify(o),
      httpMethod: "POST",
      httpOptions: u
    });
    if (!c || !c?.headers) throw new Error("Server did not return an HttpResponse or the returned HttpResponse did not have headers.");
    const d = (a = c?.headers) === null || a === void 0 ? void 0 : a["x-goog-upload-url"];
    if (d === void 0) throw new Error("Failed to get upload url. Server did not return the x-google-upload-url in the headers");
    return d;
  }
};
async function Lc(e) {
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
    throw n >= 400 && n < 600 ? new Ah({
      message: o,
      status: n
    }) : new Error(o);
  }
}
function GE(e, t) {
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
  function r(i, a) {
    const u = Object.assign({}, i);
    for (const c in a) if (Object.prototype.hasOwnProperty.call(a, c)) {
      const d = a[c], h = u[c];
      d && typeof d == "object" && !Array.isArray(d) && h && typeof h == "object" && !Array.isArray(h) ? u[c] = r(h, d) : (h && d && typeof h != typeof d && console.warn(`includeExtraBodyToRequestInit:deepMerge: Type mismatch for key "${c}". Original type: ${typeof h}, New type: ${typeof d}. Overwriting.`), u[c] = d);
    }
    return u;
  }
  const o = r(n, t);
  e.body = JSON.stringify(o);
}
var HE = "mcp_used/unknown", VE = !1;
function Rh(e) {
  for (const t of e)
    if (KE(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return VE;
}
function xh(e) {
  var t;
  e[$s] = (((t = e[$s]) !== null && t !== void 0 ? t : "") + ` ${HE}`).trimStart();
}
function KE(e) {
  return e !== null && typeof e == "object" && e instanceof WE;
}
function JE(e) {
  return ct(this, arguments, function* (n, r = 100) {
    let o, i = 0;
    for (; i < r; ) {
      const a = yield J(n.listTools({ cursor: o }));
      for (const u of a.tools)
        yield yield J(u), i++;
      if (!a.nextCursor) break;
      o = a.nextCursor;
    }
  });
}
var WE = class Mh {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new Mh(t, n);
  }
  async initialize() {
    var t, n, r, o;
    if (this.mcpTools.length > 0) return;
    const i = {}, a = [];
    for (const h of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, dt(JE(h))), d; d = await c.next(), t = d.done, !t; u = !0) {
        o = d.value, u = !1;
        const f = o;
        a.push(f);
        const p = f.name;
        if (i[p]) throw new Error(`Duplicate function name ${p} found in MCP tools. Please ensure function names are unique.`);
        i[p] = h;
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
    this.mcpTools = a, this.functionNameToMcpClient = i;
  }
  async tool() {
    return await this.initialize(), av(this.mcpTools, this.config);
  }
  async callTool(t) {
    await this.initialize();
    const n = [];
    for (const r of t) if (r.name in this.functionNameToMcpClient) {
      const o = this.functionNameToMcpClient[r.name];
      let i;
      this.config.timeout && (i = { timeout: this.config.timeout });
      const a = await o.callTool({
        name: r.name,
        arguments: r.args
      }, void 0, i);
      n.push({ functionResponse: {
        name: r.name,
        response: a.isError ? { error: a } : a
      } });
    }
    return n;
  }
};
async function zE(e, t, n) {
  const r = new Z_();
  let o;
  n.data instanceof Blob ? o = JSON.parse(await n.data.text()) : o = JSON.parse(n.data), Object.assign(r, o), t(r);
}
var YE = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const r = this.apiClient.getWebsocketBaseUrl(), o = this.apiClient.getApiVersion(), i = ZE(this.apiClient.getDefaultHeaders()), a = `${r}/ws/google.ai.generativelanguage.${o}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((_) => {
      u = _;
    }), d = e.callbacks, h = function() {
      u({});
    }, f = this.apiClient, p = {
      onopen: h,
      onmessage: (_) => {
        zE(f, d.onmessage, _);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(_) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(_) {
      }
    }, g = this.webSocketFactory.create(a, QE(i), p);
    g.connect(), await c;
    const y = { setup: { model: Y(this.apiClient, e.model) } };
    return g.send(JSON.stringify(y)), new XE(g, this.apiClient);
  }
}, XE = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = hT(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = fT(e);
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
function QE(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function ZE(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var jE = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function ew(e, t, n) {
  const r = new Q_();
  let o;
  n.data instanceof Blob ? o = await n.data.text() : n.data instanceof ArrayBuffer ? o = new TextDecoder().decode(n.data) : o = n.data;
  const i = JSON.parse(o);
  if (e.isVertexAI()) {
    const a = mT(i);
    Object.assign(r, a);
  } else Object.assign(r, i);
  t(r);
}
var tw = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new YE(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, r, o, i, a;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const h = this.apiClient.getHeaders();
    e.config && e.config.tools && Rh(e.config.tools) && xh(h);
    const f = iw(h);
    if (this.apiClient.isVertexAI()) {
      const x = this.apiClient.getProject(), D = this.apiClient.getLocation(), H = this.apiClient.getApiKey(), z = !!x && !!D || !!H;
      this.apiClient.getCustomBaseUrl() && !z ? d = u : (d = `${u}/ws/google.cloud.aiplatform.${c}.LlmBidiService/BidiGenerateContent`, await this.auth.addAuthHeaders(f, d));
    } else {
      const x = this.apiClient.getApiKey();
      let D = "BidiGenerateContent", H = "key";
      x?.startsWith("auth_tokens/") && (console.warn("Warning: Ephemeral token support is experimental and may change in future versions."), c !== "v1alpha" && console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection."), D = "BidiGenerateContentConstrained", H = "access_token"), d = `${u}/ws/google.ai.generativelanguage.${c}.GenerativeService.${D}?${H}=${x}`;
    }
    let p = () => {
    };
    const g = new Promise((x) => {
      p = x;
    }), y = e.callbacks, _ = function() {
      var x;
      (x = y?.onopen) === null || x === void 0 || x.call(y), p({});
    }, v = this.apiClient, E = {
      onopen: _,
      onmessage: (x) => {
        ew(v, y.onmessage, x);
      },
      onerror: (t = y?.onerror) !== null && t !== void 0 ? t : function(x) {
      },
      onclose: (n = y?.onclose) !== null && n !== void 0 ? n : function(x) {
      }
    }, b = this.webSocketFactory.create(d, ow(f), E);
    b.connect(), await g;
    let R = Y(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && R.startsWith("publishers/")) {
      const x = this.apiClient.getProject(), D = this.apiClient.getLocation();
      x && D && (R = `projects/${x}/locations/${D}/` + R);
    }
    let P = {};
    this.apiClient.isVertexAI() && ((r = e.config) === null || r === void 0 ? void 0 : r.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [ri.AUDIO] } : e.config.responseModalities = [ri.AUDIO]), !((o = e.config) === null || o === void 0) && o.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    const L = (a = (i = e.config) === null || i === void 0 ? void 0 : i.tools) !== null && a !== void 0 ? a : [], S = [];
    for (const x of L) if (this.isCallableTool(x)) {
      const D = x;
      S.push(await D.tool());
    } else S.push(x);
    S.length > 0 && (e.config.tools = S);
    const O = {
      model: R,
      config: e.config,
      callbacks: e.callbacks
    };
    return this.apiClient.isVertexAI() ? P = dT(this.apiClient, O) : P = cT(this.apiClient, O), delete P.config, b.send(JSON.stringify(P)), new rw(b, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, nw = { turnComplete: !0 }, rw = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let n = [];
      try {
        n = De(t.turns), e.isVertexAI() || (n = n.map((r) => no(r)));
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
      if (!e.isVertexAI() && !("id" in r)) throw new Error(jE);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, nw), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: gT(e) } : t = { realtimeInput: pT(e) }, this.conn.send(JSON.stringify(t));
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
function ow(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function iw(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var Uc = 10;
function Fc(e) {
  var t, n, r;
  if (!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.disable) return !0;
  let o = !1;
  for (const a of (n = e?.tools) !== null && n !== void 0 ? n : []) if (Un(a)) {
    o = !0;
    break;
  }
  if (!o) return !0;
  const i = (r = e?.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls;
  return i && (i < 0 || !Number.isInteger(i)) || i == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", i), !0) : !1;
}
function Un(e) {
  return "callTool" in e && typeof e.callTool == "function";
}
function sw(e) {
  var t, n, r;
  return (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((o) => Un(o))) !== null && r !== void 0 ? r : !1;
}
function Oc(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((r, o) => {
    if (Un(r)) return;
    const i = r;
    i.functionDeclarations && i.functionDeclarations.length > 0 && n.push(o);
  }), n;
}
function qc(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var aw = class extends It {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = De(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = De(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const r = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: oi.EMBED_CONTENT
        });
        return await this.embedContentInternal(r);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: oi.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, r, o, i, a;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !sw(t) || Fc(t.config)) return await this.generateContentInternal(u);
      const c = Oc(t);
      if (c.length > 0) {
        const y = c.map((_) => `tools[${_}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${y}.`);
      }
      let d, h;
      const f = De(u.contents), p = (o = (r = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls) !== null && o !== void 0 ? o : Uc;
      let g = 0;
      for (; g < p && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const y = d.candidates[0].content, _ = [];
        for (const v of (a = (i = t.config) === null || i === void 0 ? void 0 : i.tools) !== null && a !== void 0 ? a : []) if (Un(v)) {
          const E = await v.callTool(d.functionCalls);
          _.push(...E);
        }
        g++, h = {
          role: "user",
          parts: _
        }, u.contents = De(u.contents), u.contents.push(y), u.contents.push(h), qc(u.config) && (f.push(y), f.push(h));
      }
      return qc(u.config) && (d.automaticFunctionCallingHistory = f), d;
    }, this.generateContentStream = async (t) => {
      var n, r, o, i, a;
      if (this.maybeMoveToResponseJsonSchem(t), Fc(t.config)) {
        const h = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(h);
      }
      const u = Oc(t);
      if (u.length > 0) {
        const h = u.map((f) => `tools[${f}]`).join(", ");
        throw new Error(`Incompatible tools found at ${h}. Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations" is not yet supported.`);
      }
      const c = (o = (r = (n = t?.config) === null || n === void 0 ? void 0 : n.toolConfig) === null || r === void 0 ? void 0 : r.functionCallingConfig) === null || o === void 0 ? void 0 : o.streamFunctionCallArguments, d = (a = (i = t?.config) === null || i === void 0 ? void 0 : i.automaticFunctionCalling) === null || a === void 0 ? void 0 : a.disable;
      if (c && !d) throw new Error("Running in streaming mode with 'streamFunctionCallArguments' enabled, this feature is not compatible with automatic function calling (AFC). Please set 'config.automaticFunctionCalling.disable' to true to disable AFC or leave 'config.toolConfig.functionCallingConfig.streamFunctionCallArguments' to be undefined or set to false to disable streaming function call arguments feature.");
      return await this.processAfcStream(t);
    }, this.generateImages = async (t) => await this.generateImagesInternal(t).then((n) => {
      var r;
      let o;
      const i = [];
      if (n?.generatedImages) for (const u of n.generatedImages) u && u?.safetyAttributes && ((r = u?.safetyAttributes) === null || r === void 0 ? void 0 : r.contentType) === "Positive Prompt" ? o = u?.safetyAttributes : i.push(u);
      let a;
      return o ? a = {
        generatedImages: i,
        positivePromptSafetyAttributes: o,
        sdkHttpResponse: n.sdkHttpResponse
      } : a = {
        generatedImages: i,
        sdkHttpResponse: n.sdkHttpResponse
      }, a;
    }), this.list = async (t) => {
      var n;
      const r = { config: Object.assign(Object.assign({}, { queryBase: !0 }), t?.config) };
      if (this.apiClient.isVertexAI() && !r.config.queryBase) {
        if (!((n = r.config) === null || n === void 0) && n.filter) throw new Error("Filtering tuned models list for Vertex AI is not currently supported");
        r.config.filter = "labels.tune-type:*";
      }
      return new cn(Ct.PAGED_ITEM_MODELS, (o) => this.listInternal(o), await this.listInternal(r), r);
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
      var n, r, o, i, a, u;
      if ((t.prompt || t.image || t.video) && t.source) throw new Error("Source and prompt/image/video are mutually exclusive. Please only use source.");
      return this.apiClient.isVertexAI() || (!((n = t.video) === null || n === void 0) && n.uri && (!((r = t.video) === null || r === void 0) && r.videoBytes) ? t.video = {
        uri: t.video.uri,
        mimeType: t.video.mimeType
      } : !((i = (o = t.source) === null || o === void 0 ? void 0 : o.video) === null || i === void 0) && i.uri && (!((u = (a = t.source) === null || a === void 0 ? void 0 : a.video) === null || u === void 0) && u.videoBytes) && (t.source.video = {
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
    const i = await Promise.all(o.map(async (u) => Un(u) ? await u.tool() : u)), a = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: i })
    };
    if (a.config.tools = i, e.config && e.config.tools && Rh(e.config.tools)) {
      const u = (r = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && r !== void 0 ? r : {};
      let c = Object.assign({}, u);
      Object.keys(c).length === 0 && (c = this.apiClient.getDefaultHeaders()), xh(c), a.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: c });
    }
    return a;
  }
  async initAfcToolsMap(e) {
    var t, n, r;
    const o = /* @__PURE__ */ new Map();
    for (const i of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (Un(i)) {
      const a = i, u = await a.tool();
      for (const c of (r = u.functionDeclarations) !== null && r !== void 0 ? r : []) {
        if (!c.name) throw new Error("Function declaration name is required.");
        if (o.has(c.name)) throw new Error(`Duplicate tool declaration name: ${c.name}`);
        o.set(c.name, a);
      }
    }
    return o;
  }
  async processAfcStream(e) {
    var t, n, r;
    const o = (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && r !== void 0 ? r : Uc;
    let i = !1, a = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, h) {
      return ct(this, arguments, function* () {
        for (var f, p, g, y, _, v; a < o; ) {
          i && (a++, i = !1);
          const P = yield J(c.processParamsMaybeAddMcpUsage(h)), L = yield J(c.generateContentStreamInternal(P)), S = [], O = [];
          try {
            for (var E = !0, b = (p = void 0, dt(L)), R; R = yield J(b.next()), f = R.done, !f; E = !0) {
              y = R.value, E = !1;
              const x = y;
              if (yield yield J(x), x.candidates && (!((_ = x.candidates[0]) === null || _ === void 0) && _.content)) {
                O.push(x.candidates[0].content);
                for (const D of (v = x.candidates[0].content.parts) !== null && v !== void 0 ? v : []) if (a < o && D.functionCall) {
                  if (!D.functionCall.name) throw new Error("Function call name was not returned by the model.");
                  if (d.has(D.functionCall.name)) {
                    const H = yield J(d.get(D.functionCall.name).callTool([D.functionCall]));
                    S.push(...H);
                  } else
                    throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${d.keys()}, mising tool: ${D.functionCall.name}`);
                }
              }
            }
          } catch (x) {
            p = { error: x };
          } finally {
            try {
              !E && !f && (g = b.return) && (yield J(g.call(b)));
            } finally {
              if (p) throw p.error;
            }
          }
          if (S.length > 0) {
            i = !0;
            const x = new hr();
            x.candidates = [{ content: {
              role: "user",
              parts: S
            } }], yield yield J(x);
            const D = [];
            D.push(...O), D.push({
              role: "user",
              parts: S
            }), h.contents = De(h.contents).concat(D);
          } else break;
        }
      });
    })(this, u, e);
  }
  async generateContentInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = kc(this.apiClient, e);
      return a = $("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = $c(d), f = new hr();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Nc(this.apiClient, e);
      return a = $("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = Dc(d), f = new hr();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = kc(this.apiClient, e);
      return a = $("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }), i.then(function(d) {
        return ct(this, arguments, function* () {
          var h, f, p, g;
          try {
            for (var y = !0, _ = dt(d), v; v = yield J(_.next()), h = v.done, !h; y = !0) {
              g = v.value, y = !1;
              const E = g, b = $c(yield J(E.json()), e);
              b.sdkHttpResponse = { headers: E.headers };
              const R = new hr();
              Object.assign(R, b), yield yield J(R);
            }
          } catch (E) {
            f = { error: E };
          } finally {
            try {
              !y && !h && (p = _.return) && (yield J(p.call(_)));
            } finally {
              if (f) throw f.error;
            }
          }
        });
      });
    } else {
      const c = Nc(this.apiClient, e);
      return a = $("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }), i.then(function(d) {
        return ct(this, arguments, function* () {
          var h, f, p, g;
          try {
            for (var y = !0, _ = dt(d), v; v = yield J(_.next()), h = v.done, !h; y = !0) {
              g = v.value, y = !1;
              const E = g, b = Dc(yield J(E.json()), e);
              b.sdkHttpResponse = { headers: E.headers };
              const R = new hr();
              Object.assign(R, b), yield yield J(R);
            }
          } catch (E) {
            f = { error: E };
          } finally {
            try {
              !y && !h && (p = _.return) && (yield J(p.call(_)));
            } finally {
              if (f) throw f.error;
            }
          }
        });
      });
    }
  }
  async embedContentInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = XT(this.apiClient, e, e);
      return a = $(uv(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = ZT(d, e), f = new fc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = YT(this.apiClient, e);
      return a = $("{model}:batchEmbedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = QT(d), f = new fc();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = uS(this.apiClient, e);
      return a = $("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = dS(d), f = new hc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = lS(this.apiClient, e);
      return a = $("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = cS(d), f = new hc();
        return Object.assign(f, h), f;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = KT(this.apiClient, e);
      return o = $("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = JT(u), d = new F_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = dE(this.apiClient, e);
      return o = $("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = fE(u), d = new O_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = KS(this.apiClient, e);
      return o = $("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = JS(u), d = new q_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = ZS(this.apiClient, e);
      return o = $("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = jS(u), d = new B_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = PS(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Ds(d));
    } else {
      const c = bS(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => ks(d));
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = US(this.apiClient, e);
      return a = $("{models_url}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = OS(d), f = new pc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = LS(this.apiClient, e);
      return a = $("{models_url}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = FS(d), f = new pc();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = uE(this.apiClient, e);
      return a = $("{model}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Ds(d));
    } else {
      const c = lE(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => ks(d));
    }
  }
  async delete(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = BT(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = HT(d), f = new gc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = qT(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = GT(d), f = new gc();
        return Object.assign(f, h), f;
      });
    }
  }
  async countTokens(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = UT(this.apiClient, e);
      return a = $("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = OT(d), f = new mc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = LT(this.apiClient, e);
      return a = $("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = FT(d), f = new mc();
        return Object.assign(f, h), f;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = RT(this.apiClient, e);
      return o = $("{model}:computeTokens", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = xT(u), d = new G_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = yS(this.apiClient, e);
      return a = $("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const h = gS(d), f = new yc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = mS(this.apiClient, e);
      return a = $("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const h = pS(d), f = new yc();
        return Object.assign(f, h), f;
      });
    }
  }
}, lw = class extends It {
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
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = N_(e);
      return a = $("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i;
    } else {
      const c = M_(e);
      return a = $("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
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
      const a = w_(e);
      return o = $("{resourceName}:fetchPredictOperation", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r;
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
};
function Bc(e) {
  const t = {};
  if (s(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function uw(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function cw(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function dw(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => Aw(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function fw(e, t, n) {
  const r = {}, o = s(t, ["expireTime"]);
  n !== void 0 && o != null && l(n, ["expireTime"], o);
  const i = s(t, ["newSessionExpireTime"]);
  n !== void 0 && i != null && l(n, ["newSessionExpireTime"], i);
  const a = s(t, ["uses"]);
  n !== void 0 && a != null && l(n, ["uses"], a);
  const u = s(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && l(n, ["bidiGenerateContentSetup"], vw(e, u));
  const c = s(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && l(n, ["fieldMask"], c), r;
}
function hw(e, t) {
  const n = {}, r = s(t, ["config"]);
  return r != null && l(n, ["config"], fw(e, r, n)), n;
}
function pw(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function gw(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = s(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = s(e, ["name"]);
  if (o != null && l(t, ["name"], o), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function mw(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], uw(n));
  const r = s(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function yw(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = s(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function _w(e, t) {
  const n = {}, r = s(e, ["generationConfig"]);
  t !== void 0 && r != null && l(t, ["setup", "generationConfig"], r);
  const o = s(e, ["responseModalities"]);
  t !== void 0 && o != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], o);
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
  ], Pa(f));
  const p = s(e, ["thinkingConfig"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], p);
  const g = s(e, ["enableAffectiveDialog"]);
  t !== void 0 && g != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], g);
  const y = s(e, ["systemInstruction"]);
  t !== void 0 && y != null && l(t, ["setup", "systemInstruction"], dw(ve(y)));
  const _ = s(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let x = Vn(_);
    Array.isArray(x) && (x = x.map((D) => Ew(Hn(D)))), l(t, ["setup", "tools"], x);
  }
  const v = s(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], Sw(v));
  const E = s(e, ["inputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "inputAudioTranscription"], Bc(E));
  const b = s(e, ["outputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "outputAudioTranscription"], Bc(b));
  const R = s(e, ["realtimeInputConfig"]);
  t !== void 0 && R != null && l(t, ["setup", "realtimeInputConfig"], R);
  const P = s(e, ["contextWindowCompression"]);
  t !== void 0 && P != null && l(t, ["setup", "contextWindowCompression"], P);
  const L = s(e, ["proactivity"]);
  if (t !== void 0 && L != null && l(t, ["setup", "proactivity"], L), s(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const S = s(e, ["avatarConfig"]);
  t !== void 0 && S != null && l(t, ["setup", "avatarConfig"], S);
  const O = s(e, ["safetySettings"]);
  if (t !== void 0 && O != null) {
    let x = O;
    Array.isArray(x) && (x = x.map((D) => Tw(D))), l(t, ["setup", "safetySettings"], x);
  }
  return n;
}
function vw(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["setup", "model"], Y(e, r));
  const o = s(t, ["config"]);
  return o != null && l(n, ["config"], _w(o, n)), n;
}
function Aw(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = s(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], pw(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], gw(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], cw(c));
  const d = s(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = s(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = s(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = s(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const g = s(e, ["toolCall"]);
  g != null && l(t, ["toolCall"], g);
  const y = s(e, ["toolResponse"]);
  y != null && l(t, ["toolResponse"], y);
  const _ = s(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function Tw(e) {
  const t = {}, n = s(e, ["category"]);
  if (n != null && l(t, ["category"], n), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = s(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function Sw(e) {
  const t = {}, n = s(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), s(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function Ew(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = s(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = s(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], yw(o));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], mw(i));
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
function ww(e) {
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
function Cw(e, t) {
  let n = null;
  const r = e.bidiGenerateContentSetup;
  if (typeof r == "object" && r !== null && "setup" in r) {
    const i = r.setup;
    typeof i == "object" && i !== null ? (e.bidiGenerateContentSetup = i, n = i) : delete e.bidiGenerateContentSetup;
  } else r !== void 0 && delete e.bidiGenerateContentSetup;
  const o = e.fieldMask;
  if (n) {
    const i = ww(n);
    if (Array.isArray(t?.lockAdditionalFields) && t?.lockAdditionalFields.length === 0) i ? e.fieldMask = i : delete e.fieldMask;
    else if (t?.lockAdditionalFields && t.lockAdditionalFields.length > 0 && o !== null && Array.isArray(o) && o.length > 0) {
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
      o.length > 0 && (u = o.map((d) => a.includes(d) ? `generationConfig.${d}` : d));
      const c = [];
      i && c.push(i), u.length > 0 && c.push(...u), c.length > 0 ? e.fieldMask = c.join(",") : delete e.fieldMask;
    } else delete e.fieldMask;
  } else o !== null && Array.isArray(o) && o.length > 0 ? e.fieldMask = o.join(",") : delete e.fieldMask;
  return e;
}
var Iw = class extends It {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const a = hw(this.apiClient, e);
      o = $("auth_tokens", a._url), i = a._query, delete a.config, delete a._url, delete a._query;
      const u = Cw(a, e.config);
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
function bw(e, t) {
  const n = {}, r = s(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function Pw(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = s(e, ["config"]);
  return r != null && bw(r, t), t;
}
function Rw(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function xw(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function Mw(e) {
  const t = {}, n = s(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const r = s(e, ["config"]);
  return r != null && xw(r, t), t;
}
function Nw(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = s(e, ["documents"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["documents"], i);
  }
  return t;
}
var kw = class extends It {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new cn(Ct.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Rw(e);
      return o = $("{name}", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
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
      const i = Pw(e);
      r = $("{name}", i._url), o = i._query, delete i._url, delete i._query, await this.apiClient.request({
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
      const a = Mw(e);
      return o = $("{parent}/documents", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = Nw(u), d = new H_();
        return Object.assign(d, c), d;
      });
    }
  }
}, Dw = class extends It {
  constructor(e, t = new kw(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new cn(Ct.PAGED_ITEM_FILE_SEARCH_STORES, (r) => this.listInternal(r), await this.listInternal(n), n);
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
      const a = vE(e);
      return o = $("fileSearchStores", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
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
      const a = SE(e);
      return o = $("{name}", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
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
      const i = TE(e);
      r = $("{name}", i._url), o = i._query, delete i._url, delete i._query, await this.apiClient.request({
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
      const a = PE(e);
      return o = $("fileSearchStores", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = RE(u), d = new V_();
        return Object.assign(d, c), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = xE(e);
      return o = $("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = ME(u), d = new K_();
        return Object.assign(d, c), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = CE(e);
      return o = $("{file_search_store_name}:importFile", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = wE(u), d = new J_();
        return Object.assign(d, c), d;
      });
    }
  }
}, Nh = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Nh = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
}, $w = () => Nh();
function Ls(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Us = (e) => {
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
}, et = class extends Error {
}, nt = class Fs extends et {
  constructor(t, n, r, o) {
    super(`${Fs.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.error = n;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new Pi({
      message: r,
      cause: Us(n)
    });
    const i = n;
    return t === 400 ? new Dh(t, i, r, o) : t === 401 ? new $h(t, i, r, o) : t === 403 ? new Lh(t, i, r, o) : t === 404 ? new Uh(t, i, r, o) : t === 409 ? new Fh(t, i, r, o) : t === 422 ? new Oh(t, i, r, o) : t === 429 ? new qh(t, i, r, o) : t >= 500 ? new Bh(t, i, r, o) : new Fs(t, i, r, o);
  }
}, Os = class extends nt {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Pi = class extends nt {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, kh = class extends Pi {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Dh = class extends nt {
}, $h = class extends nt {
}, Lh = class extends nt {
}, Uh = class extends nt {
}, Fh = class extends nt {
}, Oh = class extends nt {
}, qh = class extends nt {
}, Bh = class extends nt {
}, Lw = /^[a-z][a-z0-9+.-]*:/i, Uw = (e) => Lw.test(e), qs = (e) => (qs = Array.isArray, qs(e)), Gc = qs;
function Hc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Fw(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var Ow = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new et(`${e} must be an integer`);
  if (t < 0) throw new et(`${e} must be a positive integer`);
  return t;
}, qw = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Bw = (e) => new Promise((t) => setTimeout(t, e));
function Gw() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Gh(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Hw(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Gh({
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
function Hh(e) {
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
async function Vw(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const r = e.getReader(), o = r.cancel();
  r.releaseLock(), await o;
}
var Kw = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function Jw(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new et(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var Ww = "0.0.1", Vh = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function ts(e, t, n) {
  return Vh(), new File(e, t ?? "unknown_file", n);
}
function zw(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var Yw = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Kh = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", Xw = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Kh(e), Qw = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function Zw(e, t, n) {
  if (Vh(), e = await e, Xw(e))
    return e instanceof File ? e : ts([await e.arrayBuffer()], e.name);
  if (Qw(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), ts(await Bs(o), t, n);
  }
  const r = await Bs(e);
  if (t || (t = zw(e)), !n?.type) {
    const o = r.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof o == "string" && (n = Object.assign(Object.assign({}, n), { type: o }));
  }
  return ts(r, t, n);
}
async function Bs(e) {
  var t, n, r, o, i;
  let a = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) a.push(e);
  else if (Kh(e)) a.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Yw(e)) try {
    for (var u = !0, c = dt(e), d; d = await c.next(), t = d.done, !t; u = !0) {
      o = d.value, u = !1;
      const h = o;
      a.push(...await Bs(h));
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
    const h = (i = e?.constructor) === null || i === void 0 ? void 0 : i.name;
    throw new Error(`Unexpected data type: ${typeof e}${h ? `; constructor: ${h}` : ""}${jw(e)}`);
  }
  return a;
}
function jw(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var Ra = class {
  constructor(e) {
    this._client = e;
  }
};
Ra._key = [];
function Jh(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Vc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), eC = (e = Jh) => (function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const i = [], a = n.reduce((h, f, p) => {
    var g, y, _;
    /[?#]/.test(f) && (o = !0);
    const v = r[p];
    let E = (o ? encodeURIComponent : e)("" + v);
    return p !== r.length && (v == null || typeof v == "object" && v.toString === ((_ = Object.getPrototypeOf((y = Object.getPrototypeOf((g = v.hasOwnProperty) !== null && g !== void 0 ? g : Vc)) !== null && y !== void 0 ? y : Vc)) === null || _ === void 0 ? void 0 : _.toString)) && (E = v + "", i.push({
      start: h.length + f.length,
      length: E.length,
      error: `Value of type ${Object.prototype.toString.call(v).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === r.length ? "" : E);
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
    const f = i.reduce((p, g) => {
      const y = " ".repeat(g.start - h), _ = "^".repeat(g.length);
      return h = g.start + g.length, p + y + _;
    }, "");
    throw new et(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}), it = /* @__PURE__ */ eC(Jh), Wh = class extends Ra {
  create(e, t) {
    var n;
    const { api_version: r = this._client.apiVersion } = e, o = Ot(e, ["api_version"]);
    if ("model" in o && "agent_config" in o) throw new et("Invalid request: specified `model` and `agent_config`. If specifying `model`, use `generation_config`.");
    if ("agent" in o && "generation_config" in o) throw new et("Invalid request: specified `agent` and `generation_config`. If specifying `agent`, use `agent_config`.");
    return this._client.post(it`/${r}/interactions`, Object.assign(Object.assign({ body: o }, t), { stream: (n = e.stream) !== null && n !== void 0 ? n : !1 }));
  }
  delete(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.delete(it`/${r}/interactions/${e}`, n);
  }
  cancel(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.post(it`/${r}/interactions/${e}/cancel`, n);
  }
  get(e, t = {}, n) {
    var r;
    const o = t ?? {}, { api_version: i = this._client.apiVersion } = o, a = Ot(o, ["api_version"]);
    return this._client.get(it`/${i}/interactions/${e}`, Object.assign(Object.assign({ query: a }, n), { stream: (r = t?.stream) !== null && r !== void 0 ? r : !1 }));
  }
};
Wh._key = Object.freeze(["interactions"]);
var zh = class extends Wh {
}, Yh = class extends Ra {
  create(e, t) {
    const { api_version: n = this._client.apiVersion, webhook_id: r } = e, o = Ot(e, ["api_version", "webhook_id"]);
    return this._client.post(it`/${n}/webhooks`, Object.assign({
      query: { webhook_id: r },
      body: o
    }, t));
  }
  update(e, t, n) {
    const { api_version: r = this._client.apiVersion, update_mask: o } = t, i = Ot(t, ["api_version", "update_mask"]);
    return this._client.patch(it`/${r}/webhooks/${e}`, Object.assign({
      query: { update_mask: o },
      body: i
    }, n));
  }
  list(e = {}, t) {
    const n = e ?? {}, { api_version: r = this._client.apiVersion } = n, o = Ot(n, ["api_version"]);
    return this._client.get(it`/${r}/webhooks`, Object.assign({ query: o }, t));
  }
  delete(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.delete(it`/${r}/webhooks/${e}`, n);
  }
  get(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.get(it`/${r}/webhooks/${e}`, n);
  }
  ping(e, t = void 0, n) {
    const { api_version: r = this._client.apiVersion, body: o } = t ?? {};
    return this._client.post(it`/${r}/webhooks/${e}:ping`, Object.assign({ body: o }, n));
  }
  rotateSigningSecret(e, t = {}, n) {
    const r = t ?? {}, { api_version: o = this._client.apiVersion } = r, i = Ot(r, ["api_version"]);
    return this._client.post(it`/${o}/webhooks/${e}:rotateSigningSecret`, Object.assign({ body: i }, n));
  }
};
Yh._key = Object.freeze(["webhooks"]);
var Xh = class extends Yh {
};
function tC(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var Po;
function xa(e) {
  let t;
  return (Po ?? (t = new globalThis.TextEncoder(), Po = t.encode.bind(t)))(e);
}
var Ro;
function Kc(e) {
  let t;
  return (Ro ?? (t = new globalThis.TextDecoder(), Ro = t.decode.bind(t)))(e);
}
var Ri = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? xa(e) : e;
    this.buffer = tC([this.buffer, n]);
    const r = [];
    let o;
    for (; (o = nC(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (o.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = o.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (o.index !== this.carriageReturnIndex + 1 || o.carriage)) {
        r.push(Kc(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const i = this.carriageReturnIndex !== null ? o.preceding - 1 : o.preceding, a = Kc(this.buffer.subarray(0, i));
      r.push(a), this.buffer = this.buffer.subarray(o.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), r;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
Ri.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Ri.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function nC(e, t) {
  const o = t ?? 0, i = e.indexOf(10, o), a = e.indexOf(13, o);
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
var si = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Jc = (e, t, n) => {
  if (e) {
    if (Fw(si, e)) return e;
    Pe(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(si))}`);
  }
};
function Tr() {
}
function xo(e, t, n) {
  return !t || si[e] > si[n] ? Tr : t[e].bind(t);
}
var rC = {
  error: Tr,
  warn: Tr,
  info: Tr,
  debug: Tr
}, Wc = /* @__PURE__ */ new WeakMap();
function Pe(e) {
  var t;
  const n = e.logger, r = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return rC;
  const o = Wc.get(n);
  if (o && o[0] === r) return o[1];
  const i = {
    error: xo("error", n, r),
    warn: xo("warn", n, r),
    info: xo("info", n, r),
    debug: xo("debug", n, r)
  };
  return Wc.set(n, [r, i]), i;
}
var Zt = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), oC = class Sr {
  constructor(t, n, r) {
    this.iterator = t, this.controller = n, this.client = r;
  }
  static fromSSEResponse(t, n, r) {
    let o = !1;
    const i = r ? Pe(r) : console;
    function a() {
      return ct(this, arguments, function* () {
        var c, d, h, f;
        if (o) throw new et("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        o = !0;
        let p = !1;
        try {
          try {
            for (var g = !0, y = dt(iC(t, n)), _; _ = yield J(y.next()), c = _.done, !c; g = !0) {
              f = _.value, g = !1;
              const v = f;
              if (!p)
                if (v.data.startsWith("[DONE]")) {
                  p = !0;
                  continue;
                } else try {
                  yield yield J(JSON.parse(v.data));
                } catch (E) {
                  throw i.error("Could not parse message into JSON:", v.data), i.error("From chunk:", v.raw), E;
                }
            }
          } catch (v) {
            d = { error: v };
          } finally {
            try {
              !g && !c && (h = y.return) && (yield J(h.call(y)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (v) {
          if (Ls(v)) return yield J(void 0);
          throw v;
        } finally {
          p || n.abort();
        }
      });
    }
    return new Sr(a, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    function i() {
      return ct(this, arguments, function* () {
        var c, d, h, f;
        const p = new Ri(), g = Hh(t);
        try {
          for (var y = !0, _ = dt(g), v; v = yield J(_.next()), c = v.done, !c; y = !0) {
            f = v.value, y = !1;
            const E = f;
            for (const b of p.decode(E)) yield yield J(b);
          }
        } catch (E) {
          d = { error: E };
        } finally {
          try {
            !y && !c && (h = _.return) && (yield J(h.call(_)));
          } finally {
            if (d) throw d.error;
          }
        }
        for (const E of p.flush()) yield yield J(E);
      });
    }
    function a() {
      return ct(this, arguments, function* () {
        var c, d, h, f;
        if (o) throw new et("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        o = !0;
        let p = !1;
        try {
          try {
            for (var g = !0, y = dt(i()), _; _ = yield J(y.next()), c = _.done, !c; g = !0) {
              f = _.value, g = !1;
              const v = f;
              p || v && (yield yield J(JSON.parse(v)));
            }
          } catch (v) {
            d = { error: v };
          } finally {
            try {
              !g && !c && (h = y.return) && (yield J(h.call(y)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (v) {
          if (Ls(v)) return yield J(void 0);
          throw v;
        } finally {
          p || n.abort();
        }
      });
    }
    return new Sr(a, n, r);
  }
  [Symbol.asyncIterator]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], r = this.iterator(), o = (i) => ({ next: () => {
      if (i.length === 0) {
        const a = r.next();
        t.push(a), n.push(a);
      }
      return i.shift();
    } });
    return [new Sr(() => o(t), this.controller, this.client), new Sr(() => o(n), this.controller, this.client)];
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
          const { value: o, done: i } = await n.next();
          if (i) return r.close();
          const a = xa(JSON.stringify(o) + `
`);
          r.enqueue(a);
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
function iC(e, t) {
  return ct(this, arguments, function* () {
    var r, o, i, a;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new et("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new et("Attempted to iterate over a response with no body");
    const u = new aC(), c = new Ri(), d = Hh(e.body);
    try {
      for (var h = !0, f = dt(sC(d)), p; p = yield J(f.next()), r = p.done, !r; h = !0) {
        a = p.value, h = !1;
        const g = a;
        for (const y of c.decode(g)) {
          const _ = u.decode(y);
          _ && (yield yield J(_));
        }
      }
    } catch (g) {
      o = { error: g };
    } finally {
      try {
        !h && !r && (i = f.return) && (yield J(i.call(f)));
      } finally {
        if (o) throw o.error;
      }
    }
    for (const g of c.flush()) {
      const y = u.decode(g);
      y && (yield yield J(y));
    }
  });
}
function sC(e) {
  return ct(this, arguments, function* () {
    var n, r, o, i;
    try {
      for (var a = !0, u = dt(e), c; c = yield J(u.next()), n = c.done, !n; a = !0) {
        i = c.value, a = !1;
        const d = i;
        d != null && (yield yield J(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? xa(d) : d));
      }
    } catch (d) {
      r = { error: d };
    } finally {
      try {
        !a && !n && (o = u.return) && (yield J(o.call(u)));
      } finally {
        if (r) throw r.error;
      }
    }
  });
}
var aC = class {
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
    let [t, n, r] = lC(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function lC(e, t) {
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
async function uC(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: i } = t, a = await (async () => {
    var u;
    if (t.options.stream)
      return Pe(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : oC.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type"), d = (u = c?.split(";")[0]) === null || u === void 0 ? void 0 : u.trim();
    return d?.includes("application/json") || d?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
  })();
  return Pe(e).debug(`[${r}] response parsed`, Zt({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
var cC = class Qh extends Promise {
  constructor(t, n, r = uC) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, this.client = t;
  }
  _thenUnwrap(t) {
    return new Qh(this.client, this.responsePromise, async (n, r) => t(await this.parseResponse(n, r), r));
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
}, Zh = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* dC(e) {
  if (!e) return;
  if (Zh in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const i of o) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Gc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const i = Gc(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, u]);
  }
}
var pr = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [i, a] of dC(r)) {
      const u = i.toLowerCase();
      o.has(u) || (t.delete(i), o.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [Zh]: !0,
    values: t,
    nulls: n
  };
}, ns = (e) => {
  var t, n, r, o, i;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((i = (o = (r = globalThis.Deno.env) === null || r === void 0 ? void 0 : r.get) === null || o === void 0 ? void 0 : o.call(r, e)) === null || i === void 0 ? void 0 : i.trim()) || void 0;
}, jh, ep = class tp {
  constructor(t) {
    var n, r, o, i, a, u, c, { baseURL: d = ns("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: h = (n = ns("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: f = "v1beta" } = t, p = Ot(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const g = Object.assign(Object.assign({
      apiKey: h,
      apiVersion: f
    }, p), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = g.baseURL, this.timeout = (r = g.timeout) !== null && r !== void 0 ? r : tp.DEFAULT_TIMEOUT, this.logger = (o = g.logger) !== null && o !== void 0 ? o : console;
    const y = "warn";
    this.logLevel = y, this.logLevel = (a = (i = Jc(g.logLevel, "ClientOptions.logLevel", this)) !== null && i !== void 0 ? i : Jc(ns("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && a !== void 0 ? a : y, this.fetchOptions = g.fetchOptions, this.maxRetries = (u = g.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = g.fetch) !== null && c !== void 0 ? c : Gw(), this.encoder = Kw, this._options = g, this.apiKey = h, this.apiVersion = f, this.clientAdapter = g.clientAdapter;
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
    const n = pr([t.headers]);
    if (!(n.values.has("authorization") || n.values.has("x-goog-api-key"))) {
      if (this.apiKey) return pr([{ "x-goog-api-key": this.apiKey }]);
      if (this.clientAdapter && this.clientAdapter.isVertexAI()) return pr([await this.clientAdapter.getAuthHeaders()]);
    }
  }
  stringifyQuery(t) {
    return Jw(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Ww}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${$w()}`;
  }
  makeStatusError(t, n, r, o) {
    return nt.generate(t, n, r, o);
  }
  buildURL(t, n, r) {
    const o = !this.baseURLOverridden() && r || this.baseURL, i = Uw(t) ? new URL(t) : new URL(o + (o.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), a = this.defaultQuery(), u = Object.fromEntries(i.searchParams);
    return (!Hc(a) || !Hc(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), a), n)), typeof n == "object" && n && !Array.isArray(n) && (i.search = this.stringifyQuery(n)), i.toString();
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
    return new cC(this, this.makeRequest(t, n, void 0));
  }
  async makeRequest(t, n, r) {
    var o, i, a;
    const u = await t, c = (o = u.maxRetries) !== null && o !== void 0 ? o : this.maxRetries;
    n == null && (n = c), await this.prepareOptions(u);
    const { req: d, url: h, timeout: f } = await this.buildRequest(u, { retryCount: c - n });
    await this.prepareRequest(d, {
      url: h,
      options: u
    });
    const p = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), g = r === void 0 ? "" : `, retryOf: ${r}`, y = Date.now();
    if (Pe(this).debug(`[${p}] sending request`, Zt({
      retryOfRequestLogID: r,
      method: u.method,
      url: h,
      options: u,
      headers: d.headers
    })), !((i = u.signal) === null || i === void 0) && i.aborted) throw new Os();
    const _ = new AbortController(), v = await this.fetchWithTimeout(h, d, f, _).catch(Us), E = Date.now();
    if (v instanceof globalThis.Error) {
      const R = `retrying, ${n} attempts remaining`;
      if (!((a = u.signal) === null || a === void 0) && a.aborted) throw new Os();
      const P = Ls(v) || /timed? ?out/i.test(String(v) + ("cause" in v ? String(v.cause) : ""));
      if (n)
        return Pe(this).info(`[${p}] connection ${P ? "timed out" : "failed"} - ${R}`), Pe(this).debug(`[${p}] connection ${P ? "timed out" : "failed"} (${R})`, Zt({
          retryOfRequestLogID: r,
          url: h,
          durationMs: E - y,
          message: v.message
        })), this.retryRequest(u, n, r ?? p);
      throw Pe(this).info(`[${p}] connection ${P ? "timed out" : "failed"} - error; no more retries left`), Pe(this).debug(`[${p}] connection ${P ? "timed out" : "failed"} (error; no more retries left)`, Zt({
        retryOfRequestLogID: r,
        url: h,
        durationMs: E - y,
        message: v.message
      })), P ? new kh() : new Pi({ cause: v });
    }
    const b = `[${p}${g}] ${d.method} ${h} ${v.ok ? "succeeded" : "failed"} with status ${v.status} in ${E - y}ms`;
    if (!v.ok) {
      const R = await this.shouldRetry(v);
      if (n && R) {
        const x = `retrying, ${n} attempts remaining`;
        return await Vw(v.body), Pe(this).info(`${b} - ${x}`), Pe(this).debug(`[${p}] response error (${x})`, Zt({
          retryOfRequestLogID: r,
          url: v.url,
          status: v.status,
          headers: v.headers,
          durationMs: E - y
        })), this.retryRequest(u, n, r ?? p, v.headers);
      }
      const P = R ? "error; no more retries left" : "error; not retryable";
      Pe(this).info(`${b} - ${P}`);
      const L = await v.text().catch((x) => Us(x).message), S = qw(L), O = S ? void 0 : L;
      throw Pe(this).debug(`[${p}] response error (${P})`, Zt({
        retryOfRequestLogID: r,
        url: v.url,
        status: v.status,
        headers: v.headers,
        message: O,
        durationMs: Date.now() - y
      })), this.makeStatusError(v.status, S, O, v.headers);
    }
    return Pe(this).info(b), Pe(this).debug(`[${p}] response start`, Zt({
      retryOfRequestLogID: r,
      url: v.url,
      status: v.status,
      headers: v.headers,
      durationMs: E - y
    })), {
      response: v,
      options: u,
      controller: _,
      requestLogID: p,
      retryOfRequestLogID: r,
      startTime: y
    };
  }
  async fetchWithTimeout(t, n, r, o) {
    const i = n || {}, { signal: a, method: u } = i, c = Ot(i, ["signal", "method"]), d = this._makeAbort(o);
    a && a.addEventListener("abort", d, { once: !0 });
    const h = setTimeout(d, r), f = globalThis.ReadableStream && c.body instanceof globalThis.ReadableStream || typeof c.body == "object" && c.body !== null && Symbol.asyncIterator in c.body, p = Object.assign(Object.assign(Object.assign({ signal: o.signal }, f ? { duplex: "half" } : {}), { method: "GET" }), c);
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
  async retryRequest(t, n, r, o) {
    var i;
    let a;
    const u = o?.get("retry-after-ms");
    if (u) {
      const d = parseFloat(u);
      Number.isNaN(d) || (a = d);
    }
    const c = o?.get("retry-after");
    if (c && !a) {
      const d = parseFloat(c);
      Number.isNaN(d) ? a = Date.parse(c) - Date.now() : a = d * 1e3;
    }
    if (a === void 0) {
      const d = (i = t.maxRetries) !== null && i !== void 0 ? i : this.maxRetries;
      a = this.calculateDefaultRetryTimeoutMillis(n, d);
    }
    return await Bw(a), this.makeRequest(t, n - 1, r);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const i = n - t;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var r, o, i;
    const a = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: h } = a, f = this.buildURL(c, d, h);
    "timeout" in a && Ow("timeout", a.timeout), a.timeout = (r = a.timeout) !== null && r !== void 0 ? r : this.timeout;
    const { bodyHeaders: p, body: g } = this.buildBody({ options: a }), y = await this.buildHeaders({
      options: t,
      method: u,
      bodyHeaders: p,
      retryCount: n
    });
    return {
      req: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({
        method: u,
        headers: y
      }, a.signal && { signal: a.signal }), globalThis.ReadableStream && g instanceof globalThis.ReadableStream && { duplex: "half" }), g && { body: g }), (o = this.fetchOptions) !== null && o !== void 0 ? o : {}), (i = a.fetchOptions) !== null && i !== void 0 ? i : {}),
      url: f,
      timeout: a.timeout
    };
  }
  async buildHeaders({ options: t, method: n, bodyHeaders: r, retryCount: o }) {
    let i = {};
    this.idempotencyHeader && n !== "get" && (t.idempotencyKey || (t.idempotencyKey = this.defaultIdempotencyKey()), i[this.idempotencyHeader] = t.idempotencyKey);
    const a = await this.authHeaders(t);
    let u = pr([
      i,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent()
      },
      this._options.defaultHeaders,
      r,
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
    const r = pr([n]);
    return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && r.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: t
    } : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
      bodyHeaders: void 0,
      body: Hw(t)
    } : typeof t == "object" && r.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: r
    });
  }
};
ep.DEFAULT_TIMEOUT = 6e4;
var pe = class extends ep {
  constructor() {
    super(...arguments), this.interactions = new zh(this), this.webhooks = new Xh(this);
  }
};
jh = pe;
pe.GeminiNextGenAPIClient = jh;
pe.GeminiNextGenAPIClientError = et;
pe.APIError = nt;
pe.APIConnectionError = Pi;
pe.APIConnectionTimeoutError = kh;
pe.APIUserAbortError = Os;
pe.NotFoundError = Uh;
pe.ConflictError = Fh;
pe.RateLimitError = qh;
pe.BadRequestError = Dh;
pe.AuthenticationError = $h;
pe.InternalServerError = Bh;
pe.PermissionDeniedError = Lh;
pe.UnprocessableEntityError = Oh;
pe.toFile = Zw;
pe.Interactions = zh;
pe.Webhooks = Xh;
function fC(e, t) {
  const n = {}, r = s(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function hC(e, t) {
  const n = {}, r = s(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function pC(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function gC(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function mC(e, t, n) {
  const r = {};
  if (s(e, ["validationDataset"]) !== void 0) throw new Error("validationDataset parameter is not supported in Gemini API.");
  const o = s(e, ["tunedModelDisplayName"]);
  if (t !== void 0 && o != null && l(t, ["displayName"], o), s(e, ["description"]) !== void 0) throw new Error("description parameter is not supported in Gemini API.");
  const i = s(e, ["epochCount"]);
  t !== void 0 && i != null && l(t, [
    "tuningTask",
    "hyperparameters",
    "epochCount"
  ], i);
  const a = s(e, ["learningRateMultiplier"]);
  if (a != null && l(r, [
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
  return r;
}
function yC(e, t, n) {
  const r = {};
  let o = s(n, ["config", "method"]);
  if (o === void 0 && (o = "SUPERVISED_FINE_TUNING"), o === "SUPERVISED_FINE_TUNING") {
    const S = s(e, ["validationDataset"]);
    t !== void 0 && S != null && l(t, ["supervisedTuningSpec"], rs(S));
  } else if (o === "PREFERENCE_TUNING") {
    const S = s(e, ["validationDataset"]);
    t !== void 0 && S != null && l(t, ["preferenceOptimizationSpec"], rs(S));
  } else if (o === "DISTILLATION") {
    const S = s(e, ["validationDataset"]);
    t !== void 0 && S != null && l(t, ["distillationSpec"], rs(S));
  }
  const i = s(e, ["tunedModelDisplayName"]);
  t !== void 0 && i != null && l(t, ["tunedModelDisplayName"], i);
  const a = s(e, ["description"]);
  t !== void 0 && a != null && l(t, ["description"], a);
  let u = s(n, ["config", "method"]);
  if (u === void 0 && (u = "SUPERVISED_FINE_TUNING"), u === "SUPERVISED_FINE_TUNING") {
    const S = s(e, ["epochCount"]);
    t !== void 0 && S != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "epochCount"
    ], S);
  } else if (u === "PREFERENCE_TUNING") {
    const S = s(e, ["epochCount"]);
    t !== void 0 && S != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "epochCount"
    ], S);
  } else if (u === "DISTILLATION") {
    const S = s(e, ["epochCount"]);
    t !== void 0 && S != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "epochCount"
    ], S);
  }
  let c = s(n, ["config", "method"]);
  if (c === void 0 && (c = "SUPERVISED_FINE_TUNING"), c === "SUPERVISED_FINE_TUNING") {
    const S = s(e, ["learningRateMultiplier"]);
    t !== void 0 && S != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], S);
  } else if (c === "PREFERENCE_TUNING") {
    const S = s(e, ["learningRateMultiplier"]);
    t !== void 0 && S != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], S);
  } else if (c === "DISTILLATION") {
    const S = s(e, ["learningRateMultiplier"]);
    t !== void 0 && S != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], S);
  }
  let d = s(n, ["config", "method"]);
  if (d === void 0 && (d = "SUPERVISED_FINE_TUNING"), d === "SUPERVISED_FINE_TUNING") {
    const S = s(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && S != null && l(t, ["supervisedTuningSpec", "exportLastCheckpointOnly"], S);
  } else if (d === "PREFERENCE_TUNING") {
    const S = s(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && S != null && l(t, ["preferenceOptimizationSpec", "exportLastCheckpointOnly"], S);
  } else if (d === "DISTILLATION") {
    const S = s(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && S != null && l(t, ["distillationSpec", "exportLastCheckpointOnly"], S);
  }
  let h = s(n, ["config", "method"]);
  if (h === void 0 && (h = "SUPERVISED_FINE_TUNING"), h === "SUPERVISED_FINE_TUNING") {
    const S = s(e, ["adapterSize"]);
    t !== void 0 && S != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "adapterSize"
    ], S);
  } else if (h === "PREFERENCE_TUNING") {
    const S = s(e, ["adapterSize"]);
    t !== void 0 && S != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "adapterSize"
    ], S);
  } else if (h === "DISTILLATION") {
    const S = s(e, ["adapterSize"]);
    t !== void 0 && S != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "adapterSize"
    ], S);
  }
  let f = s(n, ["config", "method"]);
  if (f === void 0 && (f = "SUPERVISED_FINE_TUNING"), f === "SUPERVISED_FINE_TUNING") {
    const S = s(e, ["tuningMode"]);
    t !== void 0 && S != null && l(t, ["supervisedTuningSpec", "tuningMode"], S);
  } else if (f === "DISTILLATION") {
    const S = s(e, ["tuningMode"]);
    t !== void 0 && S != null && l(t, ["distillationSpec", "tuningMode"], S);
  }
  const p = s(e, ["customBaseModel"]);
  t !== void 0 && p != null && l(t, ["customBaseModel"], p);
  let g = s(n, ["config", "method"]);
  if (g === void 0 && (g = "SUPERVISED_FINE_TUNING"), g === "SUPERVISED_FINE_TUNING") {
    const S = s(e, ["batchSize"]);
    t !== void 0 && S != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "batchSize"
    ], S);
  } else if (g === "DISTILLATION") {
    const S = s(e, ["batchSize"]);
    t !== void 0 && S != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "batchSize"
    ], S);
  }
  let y = s(n, ["config", "method"]);
  if (y === void 0 && (y = "SUPERVISED_FINE_TUNING"), y === "SUPERVISED_FINE_TUNING") {
    const S = s(e, ["learningRate"]);
    t !== void 0 && S != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRate"
    ], S);
  } else if (y === "DISTILLATION") {
    const S = s(e, ["learningRate"]);
    t !== void 0 && S != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRate"
    ], S);
  }
  const _ = s(e, ["labels"]);
  t !== void 0 && _ != null && l(t, ["labels"], _);
  const v = s(e, ["beta"]);
  t !== void 0 && v != null && l(t, [
    "preferenceOptimizationSpec",
    "hyperParameters",
    "beta"
  ], v);
  const E = s(e, ["baseTeacherModel"]);
  t !== void 0 && E != null && l(t, ["distillationSpec", "baseTeacherModel"], E);
  const b = s(e, ["tunedTeacherModelSource"]);
  t !== void 0 && b != null && l(t, ["distillationSpec", "tunedTeacherModelSource"], b);
  const R = s(e, ["sftLossWeightMultiplier"]);
  t !== void 0 && R != null && l(t, [
    "distillationSpec",
    "hyperParameters",
    "sftLossWeightMultiplier"
  ], R);
  const P = s(e, ["outputUri"]);
  t !== void 0 && P != null && l(t, ["outputUri"], P);
  const L = s(e, ["encryptionSpec"]);
  return t !== void 0 && L != null && l(t, ["encryptionSpec"], L), r;
}
function _C(e, t) {
  const n = {}, r = s(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = s(e, ["preTunedModel"]);
  o != null && l(n, ["preTunedModel"], o);
  const i = s(e, ["trainingDataset"]);
  i != null && RC(i);
  const a = s(e, ["config"]);
  return a != null && mC(a, n), n;
}
function vC(e, t) {
  const n = {}, r = s(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = s(e, ["preTunedModel"]);
  o != null && l(n, ["preTunedModel"], o);
  const i = s(e, ["trainingDataset"]);
  i != null && xC(i, n, t);
  const a = s(e, ["config"]);
  return a != null && yC(a, n, t), n;
}
function AC(e, t) {
  const n = {}, r = s(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function TC(e, t) {
  const n = {}, r = s(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function SC(e, t, n) {
  const r = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const i = s(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const a = s(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), r;
}
function EC(e, t, n) {
  const r = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const i = s(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const a = s(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), r;
}
function wC(e, t) {
  const n = {}, r = s(e, ["config"]);
  return r != null && SC(r, n), n;
}
function CC(e, t) {
  const n = {}, r = s(e, ["config"]);
  return r != null && EC(r, n), n;
}
function IC(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const i = s(e, ["tunedModels"]);
  if (i != null) {
    let a = i;
    Array.isArray(a) && (a = a.map((u) => np(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function bC(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const i = s(e, ["tuningJobs"]);
  if (i != null) {
    let a = i;
    Array.isArray(a) && (a = a.map((u) => Gs(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function PC(e, t) {
  const n = {}, r = s(e, ["name"]);
  r != null && l(n, ["model"], r);
  const o = s(e, ["name"]);
  return o != null && l(n, ["endpoint"], o), n;
}
function RC(e, t) {
  const n = {};
  if (s(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (s(e, ["vertexDatasetResource"]) !== void 0) throw new Error("vertexDatasetResource parameter is not supported in Gemini API.");
  const r = s(e, ["examples"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => i)), l(n, ["examples", "examples"], o);
  }
  return n;
}
function xC(e, t, n) {
  const r = {};
  let o = s(n, ["config", "method"]);
  if (o === void 0 && (o = "SUPERVISED_FINE_TUNING"), o === "SUPERVISED_FINE_TUNING") {
    const a = s(e, ["gcsUri"]);
    t !== void 0 && a != null && l(t, ["supervisedTuningSpec", "trainingDatasetUri"], a);
  } else if (o === "PREFERENCE_TUNING") {
    const a = s(e, ["gcsUri"]);
    t !== void 0 && a != null && l(t, ["preferenceOptimizationSpec", "trainingDatasetUri"], a);
  } else if (o === "DISTILLATION") {
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
  return r;
}
function np(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
  const i = s(e, ["state"]);
  i != null && l(n, ["state"], dh(i));
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
  return p != null && l(n, ["tunedModel"], PC(p)), n;
}
function Gs(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
  const i = s(e, ["state"]);
  i != null && l(n, ["state"], dh(i));
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
  const g = s(e, ["tunedModel"]);
  g != null && l(n, ["tunedModel"], g);
  const y = s(e, ["preTunedModel"]);
  y != null && l(n, ["preTunedModel"], y);
  const _ = s(e, ["supervisedTuningSpec"]);
  _ != null && l(n, ["supervisedTuningSpec"], _);
  const v = s(e, ["preferenceOptimizationSpec"]);
  v != null && l(n, ["preferenceOptimizationSpec"], v);
  const E = s(e, ["distillationSpec"]);
  E != null && l(n, ["distillationSpec"], E);
  const b = s(e, ["tuningDataStats"]);
  b != null && l(n, ["tuningDataStats"], b);
  const R = s(e, ["encryptionSpec"]);
  R != null && l(n, ["encryptionSpec"], R);
  const P = s(e, ["partnerModelTuningSpec"]);
  P != null && l(n, ["partnerModelTuningSpec"], P);
  const L = s(e, ["customBaseModel"]);
  L != null && l(n, ["customBaseModel"], L);
  const S = s(e, ["evaluateDatasetRuns"]);
  if (S != null) {
    let me = S;
    Array.isArray(me) && (me = me.map((ie) => ie)), l(n, ["evaluateDatasetRuns"], me);
  }
  const O = s(e, ["experiment"]);
  O != null && l(n, ["experiment"], O);
  const x = s(e, ["fullFineTuningSpec"]);
  x != null && l(n, ["fullFineTuningSpec"], x);
  const D = s(e, ["labels"]);
  D != null && l(n, ["labels"], D);
  const H = s(e, ["outputUri"]);
  H != null && l(n, ["outputUri"], H);
  const z = s(e, ["pipelineJob"]);
  z != null && l(n, ["pipelineJob"], z);
  const ge = s(e, ["serviceAccount"]);
  ge != null && l(n, ["serviceAccount"], ge);
  const Q = s(e, ["tunedModelDisplayName"]);
  Q != null && l(n, ["tunedModelDisplayName"], Q);
  const Z = s(e, ["tuningJobState"]);
  Z != null && l(n, ["tuningJobState"], Z);
  const X = s(e, ["veoTuningSpec"]);
  X != null && l(n, ["veoTuningSpec"], X);
  const Ae = s(e, ["distillationSamplingSpec"]);
  Ae != null && l(n, ["distillationSamplingSpec"], Ae);
  const Ye = s(e, ["tuningJobMetadata"]);
  return Ye != null && l(n, ["tuningJobMetadata"], Ye), n;
}
function MC(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
  const i = s(e, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const a = s(e, ["done"]);
  a != null && l(n, ["done"], a);
  const u = s(e, ["error"]);
  return u != null && l(n, ["error"], u), n;
}
function rs(e, t) {
  const n = {}, r = s(e, ["gcsUri"]);
  r != null && l(n, ["validationDatasetUri"], r);
  const o = s(e, ["vertexDatasetResource"]);
  return o != null && l(n, ["validationDatasetUri"], o), n;
}
var NC = class extends It {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new cn(Ct.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
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
          state: Ps.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = TC(e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => Gs(d));
    } else {
      const c = AC(e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => np(d));
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = CC(e);
      return a = $("tuningJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = bC(d), f = new _c();
        return Object.assign(f, h), f;
      });
    } else {
      const c = wC(e);
      return a = $("tunedModels", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = IC(d), f = new _c();
        return Object.assign(f, h), f;
      });
    }
  }
  async cancel(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = hC(e);
      return a = $("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = gC(d), f = new vc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = fC(e);
      return a = $("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = pC(d), f = new vc();
        return Object.assign(f, h), f;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = vC(e, e);
      return o = $("tuningJobs", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => Gs(u));
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async tuneMldevInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = _C(e);
      return o = $("tunedModels", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => MC(u));
    }
  }
}, kC = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, DC = 1024 * 1024 * 8, $C = 3, LC = 1e3, UC = 2, ai = "x-goog-upload-status";
async function FC(e, t, n, r) {
  var o;
  const i = await rp(e, t, n, r), a = await i?.json();
  if (((o = i?.headers) === null || o === void 0 ? void 0 : o[ai]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return a.file;
}
async function OC(e, t, n, r) {
  var o;
  const i = await rp(e, t, n, r), a = await i?.json();
  if (((o = i?.headers) === null || o === void 0 ? void 0 : o[ai]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = nh(a), c = new j_();
  return Object.assign(c, u), c;
}
async function rp(e, t, n, r) {
  var o, i, a;
  let u = t;
  const c = r?.baseUrl || ((o = n.clientOptions.httpOptions) === null || o === void 0 ? void 0 : o.baseUrl);
  if (c) {
    const g = new URL(c), y = new URL(t);
    y.protocol = g.protocol, y.host = g.host, y.port = g.port, u = y.toString();
  }
  let d = 0, h = 0, f = new xs(new Response()), p = "upload";
  for (d = e.size; h < d; ) {
    const g = Math.min(DC, d - h), y = e.slice(h, h + g);
    h + g >= d && (p += ", finalize");
    let _ = 0, v = LC;
    for (; _ < $C; ) {
      const E = Object.assign(Object.assign({}, r?.headers || {}), {
        "X-Goog-Upload-Command": p,
        "X-Goog-Upload-Offset": String(h),
        "Content-Length": String(g)
      });
      if (f = await n.request({
        path: "",
        body: y,
        httpMethod: "POST",
        httpOptions: Object.assign(Object.assign({}, r), {
          apiVersion: "",
          baseUrl: u,
          headers: E
        })
      }), !((i = f?.headers) === null || i === void 0) && i[ai]) break;
      _++, await BC(v), v = v * UC;
    }
    if (h += g, ((a = f?.headers) === null || a === void 0 ? void 0 : a[ai]) !== "active") break;
    if (d <= h) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return f;
}
async function qC(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function BC(e) {
  return new Promise((t) => setTimeout(t, e));
}
var GC = class {
  async upload(e, t, n, r) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await FC(e, t, n, r);
  }
  async uploadToFileSearchStore(e, t, n, r) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await OC(e, t, n, r);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await qC(e);
  }
}, HC = class {
  create(e, t, n) {
    return new VC(e, t, n);
  }
}, VC = class {
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
}, zc = "x-goog-api-key", KC = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(zc) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(zc, this.apiKey);
    }
  }
}, JC = class {
  getNextGenClient() {
    var e;
    const t = this.httpOptions;
    if (this._nextGenClient === void 0) {
      const n = this.httpOptions;
      this._nextGenClient = new pe({
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
    const n = S_(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const r = new KC(this.apiKey);
    this.apiClient = new BE({
      auth: r,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: "gl-node/web",
      uploader: new GC(),
      downloader: new kC()
    }), this.models = new aw(this.apiClient), this.live = new tw(this.apiClient, r, new HC()), this.batches = new nA(this.apiClient), this.chats = new qA(this.models, this.apiClient), this.caches = new UA(this.apiClient), this.files = new ZA(this.apiClient), this.operations = new lw(this.apiClient), this.authTokens = new Iw(this.apiClient), this.tunings = new NC(this.apiClient), this.fileSearchStores = new Dw(this.apiClient);
  }
};
function Yc(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function li(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function on(e) {
  return { text: String(e || "") };
}
function WC(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? { inlineData: {
    mimeType: t[1],
    data: t[2]
  } } : null;
}
function zC(e) {
  if (typeof e == "string") return [on(e)];
  if (!Array.isArray(e)) return [on("")];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "text" ? on(n.text || "") : n.type === "image_url" && n.image_url?.url ? WC(n.image_url.url) : null).filter(Boolean);
  return t.length ? t : [on("")];
}
function Xc() {
  return {
    role: "user",
    parts: [on("")]
  };
}
function ro(e, t = "model") {
  if (!e?.parts?.length) return null;
  const n = li(e);
  return n ? (n.role || (n.role = t), n) : null;
}
function YC(e) {
  return !!e?.parts?.some((t) => typeof t?.thoughtSignature == "string" && t.thoughtSignature);
}
function XC(e) {
  return !!e?.parts?.some((t) => t?.functionCall?.name);
}
function Qc(e, t, n = 0) {
  if (!e?.functionCall?.name) return "";
  const r = String(e.functionCall.id || "").trim();
  return r ? `id:${r}` : [
    String(n),
    String(e.functionCall.name || ""),
    String(t)
  ].join("\0");
}
function QC(e, t) {
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
function ZC(e = [], t = "") {
  const n = e.map((h) => ro(h, "model")).filter(Boolean);
  if (!n.length) return null;
  const r = [...n].reverse().find((h) => YC(h)) || null, o = [...n].reverse().find((h) => XC(h)) || null, i = r || o || n[n.length - 1], a = n.indexOf(i), u = li(i);
  if (!u?.parts?.length) return n[n.length - 1];
  if (o) {
    const h = /* @__PURE__ */ new Map(), f = [];
    n.forEach((g, y) => {
      g.parts.forEach((_, v) => {
        const E = Qc(_, v, y);
        if (!E) return;
        h.has(E) || f.push(E);
        const b = h.get(E);
        b ? h.set(E, QC(b, _)) : h.set(E, li(_));
      });
    });
    const p = /* @__PURE__ */ new Set();
    u.parts = u.parts.map((g, y) => {
      const _ = Qc(g, y, a);
      return _ ? (p.add(_), h.get(_) || g) : g;
    }), f.forEach((g) => {
      p.has(g) || (u.parts.push(h.get(g)), p.add(g));
    });
  }
  const c = String(t || ""), d = u.parts.filter((h) => !(typeof h?.text == "string" && !h?.thought));
  return u.parts = c ? [{ text: c }, ...d] : d, u.parts.length ? u : n[n.length - 1];
}
function Zc(e) {
  const t = e?.candidates?.[0]?.content?.parts || [], n = t.filter((r) => !r?.thought && typeof r?.text == "string" && r.text).map((r) => r.text).join(`
`);
  return n || t.length ? n : typeof e?.text == "string" && e.text ? e.text : "";
}
function op(e) {
  const t = Array.isArray(e?.functionCalls) ? e.functionCalls : [], n = (e?.candidates?.[0]?.content?.parts || []).map((r) => r?.functionCall || r).filter((r) => r && r.name);
  return t.length ? t : n;
}
function ip(e) {
  try {
    return JSON.stringify(e?.args || {});
  } catch {
    return "{}";
  }
}
function jc(e) {
  try {
    const t = JSON.parse(String(e || "{}"));
    return t && typeof t == "object" && !Array.isArray(t) ? t : null;
  } catch {
    return null;
  }
}
function jC(e, t) {
  const n = jc(e), r = jc(t);
  return n && r ? JSON.stringify({
    ...n,
    ...r
  }) : String(t || "").trim() || String(e || "{}");
}
function eI(e, t = "google-tool") {
  return op(e).map((n, r) => {
    const o = String(n.id || "").trim();
    return {
      id: o || `${t}-${r + 1}`,
      name: n.name || "",
      arguments: ip(n),
      ...o ? {} : { providerId: "" }
    };
  }).filter((n) => n.name);
}
function tI(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  let r = 0;
  function o(a, u, c, d) {
    return a.name = String(u.name || a.name || "").trim(), a.arguments = jC(a.arguments, d), c && (n.set(c, a), a.id !== c ? a.providerId = c : delete a.providerId), a;
  }
  function i(a) {
    return op(a).forEach((u) => {
      const c = String(u?.name || "").trim();
      if (!c) return;
      const d = String(u?.id || "").trim(), h = ip(u);
      let f = d ? n.get(d) : null;
      f ? o(f, u, d, h) : (f = {
        id: d || `${e}-${++r}`,
        name: c,
        arguments: h,
        ...d ? {} : { providerId: "" }
      }, t.push(f)), d && n.set(d, f);
    }), t.map((u) => ({ ...u }));
  }
  return { append: i };
}
function nI(e = []) {
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
function rI(e) {
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
function ed(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function oI(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  if (t.length)
    return [...new Set(t)].join(`

`);
}
function iI(e) {
  const t = e?.providerPayload?.googleContent;
  return ro(t, "model");
}
function sI(e) {
  const t = e?.providerPayload?.googleContents;
  if (!Array.isArray(t) || !t.length) {
    const n = iI(e);
    return n ? [n] : [];
  }
  return t.map((n) => ro(n, "model")).filter(Boolean);
}
function Ma(e = []) {
  const t = (Array.isArray(e) ? e : []).map((n) => ro(n, "model")).filter(Boolean);
  if (t.length)
    return {
      googleContent: t[t.length - 1],
      googleContents: t
    };
}
function aI(e) {
  const t = e?.candidates?.[0]?.content;
  return Ma(t ? [t] : []);
}
function lI(e) {
  return Ma(e ? [e] : []);
}
function sp(e) {
  try {
    if (typeof e?.getHistory == "function") return e.getHistory(!1);
  } catch {
    return [];
  }
  return Array.isArray(e?.history) ? li(e.history) || [] : [];
}
function uI(e, t = 0) {
  return sp(e).slice(Math.max(0, t)).filter((n) => n?.role === "model").map((n) => ro(n, "model")).filter(Boolean);
}
function cI(e) {
  const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = [], o = (e || []).filter((a) => a.role === "user" || a.role === "assistant" || a.role === "tool");
  o.forEach((a) => {
    (a.tool_calls || []).forEach((u) => {
      u.id && u.function?.name && t.set(u.id, u.function.name), u.id && Object.prototype.hasOwnProperty.call(u, "providerToolCallId") && n.set(u.id, String(u.providerToolCallId || "").trim());
    });
  });
  for (let a = 0; a < o.length; a += 1) {
    const u = o[a];
    if (u.role === "tool") {
      const c = [];
      let d = a;
      for (; d < o.length && o[d].role === "tool"; ) {
        const h = o[d], f = String(h.tool_call_id || "").trim(), p = n.has(f) ? n.get(f) : f;
        c.push({ functionResponse: {
          ...p ? { id: p } : {},
          name: String(h.toolName || h.tool_name || "").trim() || t.get(f) || "tool_result",
          response: Yc(h.content)
        } }), d += 1;
      }
      r.push({
        role: "user",
        parts: c
      }), a = d - 1;
      continue;
    }
    if (u.role === "assistant") {
      const c = sI(u);
      if (c.length) {
        r.push(...c);
        continue;
      }
    }
    if (u.role === "assistant" && Array.isArray(u.tool_calls) && u.tool_calls.length) {
      r.push({
        role: "model",
        parts: [...u.content ? [on(u.content)] : [], ...u.tool_calls.map((c) => ({ functionCall: {
          ...(() => {
            const d = Object.prototype.hasOwnProperty.call(c, "providerToolCallId") ? String(c.providerToolCallId || "").trim() : String(c.id || "").trim();
            return d ? { id: d } : {};
          })(),
          name: c.function.name,
          args: Yc(c.function.arguments)
        } }))]
      });
      continue;
    }
    r.push({
      role: u.role === "assistant" ? "model" : "user",
      parts: zC(u.content)
    });
  }
  if (!r.length) return {
    history: [],
    latestMessage: Xc().parts
  };
  const i = r[r.length - 1];
  return i.role === "user" && i.parts?.length ? {
    history: r.slice(0, -1),
    latestMessage: i.parts
  } : {
    history: r,
    latestMessage: Xc().parts
  };
}
function dI(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function td(e, t) {
  return `${String(e || "")}${String(t || "")}`;
}
var fI = class {
  constructor(e) {
    this.config = e, this.supportsSessionToolLoop = !0, this.activeChat = null, this.toolCallResponseSequence = 0, this.client = new JC({
      apiKey: e.apiKey,
      httpOptions: {
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 900 * 1e3
      }
    });
  }
  buildChatPayload(e) {
    const t = xe("google", this.config, e.reasoning), n = cI(e.messages), r = Array.isArray(e.tools) ? e.tools : [], o = oI(e), i = {
      ...o ? { systemInstruction: o } : {},
      temperature: e.temperature,
      ...e.maxTokens ? { maxOutputTokens: e.maxTokens } : {}
    };
    if (t.mode === "off" ? i.thinkingConfig = {
      includeThoughts: !1,
      thinkingBudget: 0
    } : t.mode === "on" && t.profileId.startsWith("google-gemini-2.5-") ? i.thinkingConfig = {
      includeThoughts: j(t),
      thinkingBudget: t.budgetTokens
    } : t.mode === "on" && (i.thinkingConfig = {
      includeThoughts: j(t),
      thinkingLevel: rI(t.effort)
    }), r.length && (i.tools = [{ functionDeclarations: r.map((a) => ({
      name: a.function.name,
      description: a.function.description,
      parameters: a.function.parameters
    })) }]), r.length) {
      const a = String(e.toolChoice || "auto").trim();
      i.toolConfig = { functionCallingConfig: a === "none" ? { mode: bn.NONE } : a === "auto" ? { mode: bn.AUTO } : a === "required" ? { mode: bn.ANY } : {
        mode: bn.ANY,
        allowedFunctionNames: [a]
      } };
    }
    return {
      createPayload: {
        model: this.config.model,
        history: n.history,
        config: i
      },
      sendPayload: { message: n.latestMessage }
    };
  }
  inspectRequest(e, t = {}) {
    const n = t.payload || this.buildChatPayload(e), r = xe("google", this.config, e.reasoning), o = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return Hr({
      provider: "google",
      model: this.config.model,
      transport: "google-genai-sdk",
      url: `${o}/models/${encodeURIComponent(this.config.model || "")}:generateContent`,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.config.apiKey || ""
      },
      body: {
        chatCreate: n.createPayload,
        sendMessage: n.sendPayload,
        stream: typeof e.onStreamProgress == "function"
      },
      sdk: typeof e.onStreamProgress == "function" ? "client.chats.create(...).sendMessageStream" : "client.chats.create(...).sendMessage",
      effectiveConfig: qt(e, {
        profileId: r.profileId,
        effectiveMode: r.mode,
        effort: n.createPayload.config?.thinkingConfig?.thinkingLevel,
        budgetTokens: n.createPayload.config?.thinkingConfig?.thinkingBudget,
        controlFields: n.createPayload.config?.thinkingConfig ? { thinkingConfig: n.createPayload.config.thinkingConfig } : {}
      })
    });
  }
  inspectSendRequest(e, t) {
    const n = xe("google", this.config, t.reasoning), r = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return Hr({
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
      effectiveConfig: qt(t, {
        profileId: n.profileId,
        effectiveMode: n.mode,
        effort: this.sessionConfig?.thinkingConfig?.thinkingLevel,
        budgetTokens: this.sessionConfig?.thinkingConfig?.thinkingBudget,
        controlFields: this.sessionConfig?.thinkingConfig ? { thinkingConfig: this.sessionConfig.thinkingConfig } : {}
      })
    });
  }
  createChat(e) {
    const t = this.buildChatPayload(e);
    return {
      chat: this.client.chats.create(t.createPayload),
      sessionConfig: t.createPayload.config,
      sendPayload: t.sendPayload,
      requestInspection: this.inspectRequest(e, { payload: t })
    };
  }
  async sendThroughChat(e, t, n) {
    let r, o, i, a = [];
    const u = `google-tool-${++this.toolCallResponseSequence}`, c = tI(u);
    let d = null;
    const h = n.signal ? {
      ...this.sessionConfig || {},
      abortSignal: n.signal
    } : void 0, f = {
      ...t,
      ...h ? { config: h } : {}
    }, p = typeof n.onStreamProgress == "function", g = sp(e).length;
    if (p) {
      const v = await e.sendMessageStream(f), E = /* @__PURE__ */ new Map();
      let b = "", R = null;
      const P = [];
      for await (const L of v) {
        R = L;
        const S = L?.candidates?.[0]?.content;
        S?.parts?.length && P.push(S), j(n.reasoning) && ed(L).forEach((x, D) => {
          const H = `${x.label}:${D}`;
          E.set(H, td(E.get(H) || "", x.text));
        }), a = c.append(L);
        const O = Zc(L);
        b = td(b, O), dI(n, {
          text: b,
          thoughts: Array.from(E.values()).filter(Boolean).map((x, D) => ({
            label: `思考块 ${D + 1}`,
            text: x
          })),
          ...a.length ? {
            toolCalls: a,
            toolCallDraft: !0
          } : {}
        });
      }
      r = {
        ...R || {},
        functionCalls: a
      }, d = ZC(P, b) || r?.candidates?.[0]?.content || null, o = Array.from(E.values()).filter(Boolean).map((L, S) => ({
        label: `思考块 ${S + 1}`,
        text: L
      })), i = b;
    } else
      r = await e.sendMessage(f), o = j(n.reasoning) ? ed(r) : [], i = Zc(r);
    const y = p ? a : eI(r, u), _ = uI(e, g);
    return {
      text: i,
      toolCalls: y,
      thoughts: o,
      finishReason: r.candidates?.[0]?.finishReason || "STOP",
      model: r.modelVersion || this.config.model,
      provider: "google",
      providerPayload: Ma(_) || lI(d) || aI(r)
    };
  }
  async chat(e) {
    if (Array.isArray(e.toolResponses) && e.toolResponses.length) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const r = { message: nI(e.toolResponses) };
      return {
        ...await this.sendThroughChat(this.activeChat, r, e),
        requestInspection: this.inspectSendRequest(r, e)
      };
    }
    const t = String(e.finalAnswerReminderText || "").trim();
    if (t) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const r = { message: [on(t)] };
      return {
        ...await this.sendThroughChat(this.activeChat, r, e),
        requestInspection: this.inspectSendRequest(r, e)
      };
    }
    const n = this.createChat(e);
    return this.activeChat = n.chat, this.sessionConfig = n.sessionConfig, {
      ...await this.sendThroughChat(this.activeChat, n.sendPayload, e),
      requestInspection: n.requestInspection
    };
  }
};
function V(e, t, n, r, o) {
  if (r === "m") throw new TypeError("Private method is not writable");
  if (r === "a" && !o) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !o : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return r === "a" ? o.call(e, n) : o ? o.value = n : t.set(e, n), n;
}
function C(e, t, n, r) {
  if (n === "a" && !r) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? r : n === "a" ? r.call(e) : r ? r.value : t.get(e);
}
var ap = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return ap = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
};
function Hs(e) {
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
}, G = class extends Error {
}, Ce = class Ks extends G {
  constructor(t, n, r, o) {
    super(`${Ks.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.requestID = o?.get("x-request-id"), this.error = n;
    const i = n;
    this.code = i?.code, this.param = i?.param, this.type = i?.type;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new xi({
      message: r,
      cause: Vs(n)
    });
    const i = n?.error;
    return t === 400 ? new lp(t, i, r, o) : t === 401 ? new up(t, i, r, o) : t === 403 ? new cp(t, i, r, o) : t === 404 ? new dp(t, i, r, o) : t === 409 ? new fp(t, i, r, o) : t === 422 ? new hp(t, i, r, o) : t === 429 ? new pp(t, i, r, o) : t >= 500 ? new gp(t, i, r, o) : new Ks(t, i, r, o);
  }
}, je = class extends Ce {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, xi = class extends Ce {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Na = class extends xi {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, lp = class extends Ce {
}, up = class extends Ce {
}, cp = class extends Ce {
}, dp = class extends Ce {
}, fp = class extends Ce {
}, hp = class extends Ce {
}, pp = class extends Ce {
}, gp = class extends Ce {
}, mp = class extends G {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, yp = class extends G {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, Er = class extends Error {
  constructor(e) {
    super(e);
  }
}, _p = class extends Ce {
  constructor(e, t, n) {
    let r = "OAuth2 authentication error", o;
    if (t && typeof t == "object") {
      const i = t;
      o = i.error;
      const a = i.error_description;
      a && typeof a == "string" ? r = a : o && (r = o);
    }
    super(e, t, r, n), this.error_code = o;
  }
}, hI = class extends G {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, pI = /^[a-z][a-z0-9+.-]*:/i, gI = (e) => pI.test(e), ke = (e) => (ke = Array.isArray, ke(e)), nd = ke;
function ka(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function rd(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function mI(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function os(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var yI = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new G(`${e} must be an integer`);
  if (t < 0) throw new G(`${e} must be a positive integer`);
  return t;
}, _I = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, oo = (e) => new Promise((t) => setTimeout(t, e)), Sn = "6.44.0", vI = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function AI() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var TI = () => {
  const e = AI();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Sn,
    "X-Stainless-OS": id(Deno.build.os),
    "X-Stainless-Arch": od(Deno.build.arch),
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
    "X-Stainless-OS": id(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": od(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = SI();
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
function SI() {
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
var od = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", id = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), sd, EI = () => sd ?? (sd = TI());
function vp() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Ap(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Tp(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Ap({
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
function Sp(e) {
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
async function ad(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var wI = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), Ep = "RFC3986", wp = (e) => String(e), ld = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: wp
};
var Js = (e, t) => (Js = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), Js(e, t)), pt = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), is = 1024, CI = (e, t, n, r, o) => {
  if (e.length === 0) return e;
  let i = e;
  if (typeof e == "symbol" ? i = Symbol.prototype.toString.call(e) : typeof e != "string" && (i = String(e)), n === "iso-8859-1") return escape(i).replace(/%u[0-9a-f]{4}/gi, function(u) {
    return "%26%23" + parseInt(u.slice(2), 16) + "%3B";
  });
  let a = "";
  for (let u = 0; u < i.length; u += is) {
    const c = i.length >= is ? i.slice(u, u + is) : i, d = [];
    for (let h = 0; h < c.length; ++h) {
      let f = c.charCodeAt(h);
      if (f === 45 || f === 46 || f === 95 || f === 126 || f >= 48 && f <= 57 || f >= 65 && f <= 90 || f >= 97 && f <= 122 || o === "RFC1738" && (f === 40 || f === 41)) {
        d[d.length] = c.charAt(h);
        continue;
      }
      if (f < 128) {
        d[d.length] = pt[f];
        continue;
      }
      if (f < 2048) {
        d[d.length] = pt[192 | f >> 6] + pt[128 | f & 63];
        continue;
      }
      if (f < 55296 || f >= 57344) {
        d[d.length] = pt[224 | f >> 12] + pt[128 | f >> 6 & 63] + pt[128 | f & 63];
        continue;
      }
      h += 1, f = 65536 + ((f & 1023) << 10 | c.charCodeAt(h) & 1023), d[d.length] = pt[240 | f >> 18] + pt[128 | f >> 12 & 63] + pt[128 | f >> 6 & 63] + pt[128 | f & 63];
    }
    a += d.join("");
  }
  return a;
};
function II(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function ud(e, t) {
  if (ke(e)) {
    const n = [];
    for (let r = 0; r < e.length; r += 1) n.push(t(e[r]));
    return n;
  }
  return t(e);
}
var Cp = {
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
}, Ip = function(e, t) {
  Array.prototype.push.apply(e, ke(t) ? t : [t]);
}, cd, fe = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: CI,
  encodeValuesOnly: !1,
  format: Ep,
  formatter: wp,
  indices: !1,
  serializeDate(e) {
    return (cd ?? (cd = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function bI(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var ss = {};
function bp(e, t, n, r, o, i, a, u, c, d, h, f, p, g, y, _, v, E) {
  let b = e, R = E, P = 0, L = !1;
  for (; (R = R.get(ss)) !== void 0 && !L; ) {
    const H = R.get(e);
    if (P += 1, typeof H < "u") {
      if (H === P) throw new RangeError("Cyclic object value");
      L = !0;
    }
    typeof R.get(ss) > "u" && (P = 0);
  }
  if (typeof d == "function" ? b = d(t, b) : b instanceof Date ? b = p?.(b) : n === "comma" && ke(b) && (b = ud(b, function(H) {
    return H instanceof Date ? p?.(H) : H;
  })), b === null) {
    if (i) return c && !_ ? c(t, fe.encoder, v, "key", g) : t;
    b = "";
  }
  if (bI(b) || II(b)) {
    if (c) {
      const H = _ ? t : c(t, fe.encoder, v, "key", g);
      return [y?.(H) + "=" + y?.(c(b, fe.encoder, v, "value", g))];
    }
    return [y?.(t) + "=" + y?.(String(b))];
  }
  const S = [];
  if (typeof b > "u") return S;
  let O;
  if (n === "comma" && ke(b))
    _ && c && (b = ud(b, c)), O = [{ value: b.length > 0 ? b.join(",") || null : void 0 }];
  else if (ke(d)) O = d;
  else {
    const H = Object.keys(b);
    O = h ? H.sort(h) : H;
  }
  const x = u ? String(t).replace(/\./g, "%2E") : String(t), D = r && ke(b) && b.length === 1 ? x + "[]" : x;
  if (o && ke(b) && b.length === 0) return D + "[]";
  for (let H = 0; H < O.length; ++H) {
    const z = O[H], ge = typeof z == "object" && typeof z.value < "u" ? z.value : b[z];
    if (a && ge === null) continue;
    const Q = f && u ? z.replace(/\./g, "%2E") : z, Z = ke(b) ? typeof n == "function" ? n(D, Q) : D : D + (f ? "." + Q : "[" + Q + "]");
    E.set(e, P);
    const X = /* @__PURE__ */ new WeakMap();
    X.set(ss, E), Ip(S, bp(ge, Z, n, r, o, i, a, u, n === "comma" && _ && ke(b) ? null : c, d, h, f, p, g, y, _, v, X));
  }
  return S;
}
function PI(e = fe) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || fe.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = Ep;
  if (typeof e.format < "u") {
    if (!Js(ld, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const r = ld[n];
  let o = fe.filter;
  (typeof e.filter == "function" || ke(e.filter)) && (o = e.filter);
  let i;
  if (e.arrayFormat && e.arrayFormat in Cp ? i = e.arrayFormat : "indices" in e ? i = e.indices ? "indices" : "repeat" : i = fe.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  const a = typeof e.allowDots > "u" ? e.encodeDotInKeys ? !0 : fe.allowDots : !!e.allowDots;
  return {
    addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : fe.addQueryPrefix,
    allowDots: a,
    allowEmptyArrays: typeof e.allowEmptyArrays == "boolean" ? !!e.allowEmptyArrays : fe.allowEmptyArrays,
    arrayFormat: i,
    charset: t,
    charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : fe.charsetSentinel,
    commaRoundTrip: !!e.commaRoundTrip,
    delimiter: typeof e.delimiter > "u" ? fe.delimiter : e.delimiter,
    encode: typeof e.encode == "boolean" ? e.encode : fe.encode,
    encodeDotInKeys: typeof e.encodeDotInKeys == "boolean" ? e.encodeDotInKeys : fe.encodeDotInKeys,
    encoder: typeof e.encoder == "function" ? e.encoder : fe.encoder,
    encodeValuesOnly: typeof e.encodeValuesOnly == "boolean" ? e.encodeValuesOnly : fe.encodeValuesOnly,
    filter: o,
    format: n,
    formatter: r,
    serializeDate: typeof e.serializeDate == "function" ? e.serializeDate : fe.serializeDate,
    skipNulls: typeof e.skipNulls == "boolean" ? e.skipNulls : fe.skipNulls,
    sort: typeof e.sort == "function" ? e.sort : null,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : fe.strictNullHandling
  };
}
function RI(e, t = {}) {
  let n = e;
  const r = PI(t);
  let o, i;
  typeof r.filter == "function" ? (i = r.filter, n = i("", n)) : ke(r.filter) && (i = r.filter, o = i);
  const a = [];
  if (typeof n != "object" || n === null) return "";
  const u = Cp[r.arrayFormat], c = u === "comma" && r.commaRoundTrip;
  o || (o = Object.keys(n)), r.sort && o.sort(r.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let p = 0; p < o.length; ++p) {
    const g = o[p];
    r.skipNulls && n[g] === null || Ip(a, bp(n[g], g, u, c, r.allowEmptyArrays, r.strictNullHandling, r.skipNulls, r.encodeDotInKeys, r.encode ? r.encoder : null, r.filter, r.sort, r.allowDots, r.serializeDate, r.format, r.formatter, r.encodeValuesOnly, r.charset, d));
  }
  const h = a.join(r.delimiter);
  let f = r.addQueryPrefix === !0 ? "?" : "";
  return r.charsetSentinel && (r.charset === "iso-8859-1" ? f += "utf8=%26%2310003%3B&" : f += "utf8=%E2%9C%93&"), h.length > 0 ? f + h : "";
}
function xI(e) {
  return RI(e, { arrayFormat: "brackets" });
}
function MI(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var dd;
function Da(e) {
  let t;
  return (dd ?? (t = new globalThis.TextEncoder(), dd = t.encode.bind(t)))(e);
}
var fd;
function hd(e) {
  let t;
  return (fd ?? (t = new globalThis.TextDecoder(), fd = t.decode.bind(t)))(e);
}
var Be, Ge, Mi = class {
  constructor() {
    Be.set(this, void 0), Ge.set(this, void 0), V(this, Be, new Uint8Array(), "f"), V(this, Ge, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Da(e) : e;
    V(this, Be, MI([C(this, Be, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = NI(C(this, Be, "f"), C(this, Ge, "f"))) != null; ) {
      if (r.carriage && C(this, Ge, "f") == null) {
        V(this, Ge, r.index, "f");
        continue;
      }
      if (C(this, Ge, "f") != null && (r.index !== C(this, Ge, "f") + 1 || r.carriage)) {
        n.push(hd(C(this, Be, "f").subarray(0, C(this, Ge, "f") - 1))), V(this, Be, C(this, Be, "f").subarray(C(this, Ge, "f")), "f"), V(this, Ge, null, "f");
        continue;
      }
      const o = C(this, Ge, "f") !== null ? r.preceding - 1 : r.preceding, i = hd(C(this, Be, "f").subarray(0, o));
      n.push(i), V(this, Be, C(this, Be, "f").subarray(r.index), "f"), V(this, Ge, null, "f");
    }
    return n;
  }
  flush() {
    return C(this, Be, "f").length ? this.decode(`
`) : [];
  }
};
Be = /* @__PURE__ */ new WeakMap(), Ge = /* @__PURE__ */ new WeakMap();
Mi.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Mi.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function NI(e, t) {
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
function kI(e) {
  for (let r = 0; r < e.length - 1; r++) {
    if (e[r] === 10 && e[r + 1] === 10 || e[r] === 13 && e[r + 1] === 13) return r + 2;
    if (e[r] === 13 && e[r + 1] === 10 && r + 3 < e.length && e[r + 2] === 13 && e[r + 3] === 10) return r + 4;
  }
  return -1;
}
var ui = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, pd = (e, t, n) => {
  if (e) {
    if (mI(ui, e)) return e;
    Se(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(ui))}`);
  }
};
function wr() {
}
function Mo(e, t, n) {
  return !t || ui[e] > ui[n] ? wr : t[e].bind(t);
}
var DI = {
  error: wr,
  warn: wr,
  info: wr,
  debug: wr
}, gd = /* @__PURE__ */ new WeakMap();
function Se(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return DI;
  const r = gd.get(t);
  if (r && r[0] === n) return r[1];
  const o = {
    error: Mo("error", t, n),
    warn: Mo("warn", t, n),
    info: Mo("info", t, n),
    debug: Mo("debug", t, n)
  };
  return gd.set(t, [n, o]), o;
}
var jt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "api-key" || t.toLowerCase() === "x-api-key" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), gr, Vr = class Cr {
  constructor(t, n, r) {
    this.iterator = t, gr.set(this, void 0), this.controller = n, V(this, gr, r, "f");
  }
  static fromSSEResponse(t, n, r, o) {
    let i = !1;
    const a = r ? Se(r) : console;
    async function* u() {
      if (i) throw new G("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let c = !1;
      try {
        for await (const d of $I(t, n))
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
              if (h && h.error) throw new Ce(void 0, h.error, void 0, t.headers);
              yield o ? {
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
              if (d.event == "error") throw new Ce(void 0, h.error, h.message, void 0);
              yield {
                event: d.event,
                data: h
              };
            }
          }
        c = !0;
      } catch (d) {
        if (Hs(d)) return;
        throw d;
      } finally {
        c || n.abort();
      }
    }
    return new Cr(u, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    async function* i() {
      const u = new Mi(), c = Sp(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
      for (const d of u.flush()) yield d;
    }
    async function* a() {
      if (o) throw new G("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let u = !1;
      try {
        for await (const c of i())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (Hs(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Cr(a, n, r);
  }
  [(gr = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], r = this.iterator(), o = (i) => ({ next: () => {
      if (i.length === 0) {
        const a = r.next();
        t.push(a), n.push(a);
      }
      return i.shift();
    } });
    return [new Cr(() => o(t), this.controller, C(this, gr, "f")), new Cr(() => o(n), this.controller, C(this, gr, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Ap({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: i } = await n.next();
          if (i) return r.close();
          const a = Da(JSON.stringify(o) + `
`);
          r.enqueue(a);
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
async function* $I(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new G("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new G("Attempted to iterate over a response with no body");
  const n = new UI(), r = new Mi(), o = Sp(e.body);
  for await (const i of LI(o)) for (const a of r.decode(i)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const i of r.flush()) {
    const a = n.decode(i);
    a && (yield a);
  }
}
async function* LI(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Da(n) : n;
    let o = new Uint8Array(t.length + r.length);
    o.set(t), o.set(r, t.length), t = o;
    let i;
    for (; (i = kI(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var UI = class {
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
    let [t, n, r] = FI(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function FI(e, t) {
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
async function Pp(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: i } = t, a = await (async () => {
    if (t.options.stream)
      return Se(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : Vr.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Rp(await n.json(), n) : await n.text();
  })();
  return Se(e).debug(`[${r}] response parsed`, jt({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
function Rp(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var Ir, xp = class Mp extends Promise {
  constructor(t, n, r = Pp) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, Ir.set(this, void 0), V(this, Ir, t, "f");
  }
  _thenUnwrap(t) {
    return new Mp(C(this, Ir, "f"), this.responsePromise, async (n, r) => Rp(t(await this.parseResponse(n, r), r), r.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(C(this, Ir, "f"), t))), this.parsedPromise;
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
Ir = /* @__PURE__ */ new WeakMap();
var No, Ni = class {
  constructor(e, t, n, r) {
    No.set(this, void 0), V(this, No, e, "f"), this.options = r, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new G("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await C(this, No, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(No = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, OI = class extends xp {
  constructor(e, t, n) {
    super(e, t, async (r, o) => new n(r, o.response, await Pp(r, o), o.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, Bt = class extends Ni {
  constructor(e, t, n, r) {
    super(e, t, n, r), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, re = class extends Ni {
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
}, we = class extends Ni {
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
}, Pt = class extends Ni {
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
}, qI = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, BI = "urn:ietf:params:oauth:grant-type:token-exchange", GI = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? vp();
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
      grant_type: BI,
      subject_token: await this.config.provider.getToken(),
      subject_token_type: qI[this.config.provider.tokenType],
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
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new _p(t.status, a, t.headers) : Ce.generate(t.status, a, `Token exchange failed with status ${t.status}`, t.headers);
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
}, Np = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Lr(e, t, n) {
  return Np(), new File(e, t ?? "unknown_file", n);
}
function Jo(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var $a = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", ki = async (e, t) => Ws(e.body) ? {
  ...e,
  body: await kp(e.body, t)
} : e, mt = async (e, t) => ({
  ...e,
  body: await kp(e.body, t)
}), md = /* @__PURE__ */ new WeakMap();
function HI(e) {
  const t = typeof e == "function" ? e : e.fetch, n = md.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const o = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new o(i).text();
    } catch {
      return !0;
    }
  })();
  return md.set(t, r), r;
}
var kp = async (e, t) => {
  if (!await HI(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([r, o]) => zs(n, r, o))), n;
}, Dp = (e) => e instanceof Blob && "name" in e, VI = (e) => typeof e == "object" && e !== null && (e instanceof Response || $a(e) || Dp(e)), Ws = (e) => {
  if (VI(e)) return !0;
  if (Array.isArray(e)) return e.some(Ws);
  if (e && typeof e == "object") {
    for (const t in e) if (Ws(e[t])) return !0;
  }
  return !1;
}, zs = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, Lr([await n.blob()], Jo(n)));
    else if ($a(n)) e.append(t, Lr([await new Response(Tp(n)).blob()], Jo(n)));
    else if (Dp(n)) e.append(t, n, Jo(n));
    else if (Array.isArray(n)) await Promise.all(n.map((r) => zs(e, t + "[]", r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([r, o]) => zs(e, `${t}[${r}]`, o)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, $p = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", KI = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && $p(e), JI = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function WI(e, t, n) {
  if (Np(), e = await e, KI(e))
    return e instanceof File ? e : Lr([await e.arrayBuffer()], e.name);
  if (JI(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Lr(await Ys(o), t, n);
  }
  const r = await Ys(e);
  if (t || (t = Jo(e)), !n?.type) {
    const o = r.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof o == "string" && (n = {
      ...n,
      type: o
    });
  }
  return Lr(r, t, n);
}
async function Ys(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if ($p(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if ($a(e)) for await (const n of e) t.push(...await Ys(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${zI(e)}`);
  }
  return t;
}
function zI(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var k = class {
  constructor(e) {
    this._client = e;
  }
};
function Lp(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var yd = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), YI = (e = Lp) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const i = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (o = !0);
    const g = r[p];
    let y = (o ? encodeURIComponent : e)("" + g);
    return p !== r.length && (g == null || typeof g == "object" && g.toString === Object.getPrototypeOf(Object.getPrototypeOf(g.hasOwnProperty ?? yd) ?? yd)?.toString) && (y = g + "", i.push({
      start: h.length + f.length,
      length: y.length,
      error: `Value of type ${Object.prototype.toString.call(g).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === r.length ? "" : y);
  }, ""), u = a.split(/[?#]/, 1)[0], c = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) i.push({
    start: d.index,
    length: d[0].length,
    error: `Value "${d[0]}" can't be safely passed as a path parameter`
  });
  if (i.sort((h, f) => h.start - f.start), i.length > 0) {
    let h = 0;
    const f = i.reduce((p, g) => {
      const y = " ".repeat(g.start - h), _ = "^".repeat(g.length);
      return h = g.start + g.length, p + y + _;
    }, "");
    throw new G(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}, T = /* @__PURE__ */ YI(Lp), Up = class extends k {
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/chat/completions/${e}/messages`, re, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
function ci(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function La(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function io(e) {
  return e?.$brand === "auto-parseable-tool";
}
function XI(e, t) {
  return !t || !Fp(t) ? {
    ...e,
    choices: e.choices.map((n) => (Op(n.message.tool_calls), {
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
    if (r.finish_reason === "length") throw new mp();
    if (r.finish_reason === "content_filter") throw new yp();
    return Op(r.message.tool_calls), {
      ...r,
      message: {
        ...r.message,
        ...r.message.tool_calls ? { tool_calls: r.message.tool_calls?.map((o) => ZI(t, o)) ?? void 0 } : void 0,
        parsed: r.message.content && !r.message.refusal ? QI(t, r.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function QI(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function ZI(e, t) {
  const n = e.tools?.find((r) => ci(r) && r.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: io(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function jI(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((r) => ci(r) && r.function?.name === t.function.name);
  return ci(n) && (io(n) || n?.function.strict || !1);
}
function Fp(e) {
  return La(e.response_format) ? !0 : e.tools?.some((t) => io(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function Op(e) {
  for (const t of e || []) if (t.type !== "function") throw new G(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function eb(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new G(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new G(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var di = (e) => e?.role === "assistant", qp = (e) => e?.role === "tool", Xs, Wo, zo, br, Pr, Yo, Rr, At, xr, fi, hi, En, Bp, Fa = class {
  constructor() {
    Xs.add(this), this.controller = new AbortController(), Wo.set(this, void 0), zo.set(this, () => {
    }), br.set(this, () => {
    }), Pr.set(this, void 0), Yo.set(this, () => {
    }), Rr.set(this, () => {
    }), At.set(this, {}), xr.set(this, !1), fi.set(this, !1), hi.set(this, !1), En.set(this, !1), V(this, Wo, new Promise((e, t) => {
      V(this, zo, e, "f"), V(this, br, t, "f");
    }), "f"), V(this, Pr, new Promise((e, t) => {
      V(this, Yo, e, "f"), V(this, Rr, t, "f");
    }), "f"), C(this, Wo, "f").catch(() => {
    }), C(this, Pr, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, C(this, Xs, "m", Bp).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (C(this, zo, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return C(this, xr, "f");
  }
  get errored() {
    return C(this, fi, "f");
  }
  get aborted() {
    return C(this, hi, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(e, t) {
    return (C(this, At, "f")[e] || (C(this, At, "f")[e] = [])).push({ listener: t }), this;
  }
  off(e, t) {
    const n = C(this, At, "f")[e];
    if (!n) return this;
    const r = n.findIndex((o) => o.listener === t);
    return r >= 0 && n.splice(r, 1), this;
  }
  once(e, t) {
    return (C(this, At, "f")[e] || (C(this, At, "f")[e] = [])).push({
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
    V(this, En, !0, "f"), await C(this, Pr, "f");
  }
  _emit(e, ...t) {
    if (C(this, xr, "f")) return;
    e === "end" && (V(this, xr, !0, "f"), C(this, Yo, "f").call(this));
    const n = C(this, At, "f")[e];
    if (n && (C(this, At, "f")[e] = n.filter((r) => !r.once), n.forEach(({ listener: r }) => r(...t))), e === "abort") {
      const r = t[0];
      !C(this, En, "f") && !n?.length && Promise.reject(r), C(this, br, "f").call(this, r), C(this, Rr, "f").call(this, r), this._emit("end");
      return;
    }
    if (e === "error") {
      const r = t[0];
      !C(this, En, "f") && !n?.length && Promise.reject(r), C(this, br, "f").call(this, r), C(this, Rr, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
Wo = /* @__PURE__ */ new WeakMap(), zo = /* @__PURE__ */ new WeakMap(), br = /* @__PURE__ */ new WeakMap(), Pr = /* @__PURE__ */ new WeakMap(), Yo = /* @__PURE__ */ new WeakMap(), Rr = /* @__PURE__ */ new WeakMap(), At = /* @__PURE__ */ new WeakMap(), xr = /* @__PURE__ */ new WeakMap(), fi = /* @__PURE__ */ new WeakMap(), hi = /* @__PURE__ */ new WeakMap(), En = /* @__PURE__ */ new WeakMap(), Xs = /* @__PURE__ */ new WeakSet(), Bp = function(t) {
  if (V(this, fi, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new je()), t instanceof je)
    return V(this, hi, !0, "f"), this._emit("abort", t);
  if (t instanceof G) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new G(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new G(String(t)));
};
function tb(e) {
  return typeof e.parse == "function";
}
var Ie, Qs, pi, Zs, js, ea, Gp, Hp, nb = 10, Vp = class extends Fa {
  constructor() {
    super(...arguments), Ie.add(this), this._chatCompletions = [], this.messages = [];
  }
  _addChatCompletion(e) {
    this._chatCompletions.push(e), this._emit("chatCompletion", e);
    const t = e.choices[0]?.message;
    return t && this._addMessage(t), e;
  }
  _addMessage(e, t = !0) {
    if ("content" in e || (e.content = null), this.messages.push(e), t) {
      if (this._emit("message", e), qp(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (di(e) && e.tool_calls)
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
    return await this.done(), C(this, Ie, "m", Qs).call(this);
  }
  async finalMessage() {
    return await this.done(), C(this, Ie, "m", pi).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), C(this, Ie, "m", Zs).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), C(this, Ie, "m", js).call(this);
  }
  async totalUsage() {
    return await this.done(), C(this, Ie, "m", ea).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = C(this, Ie, "m", pi).call(this);
    t && this._emit("finalMessage", t);
    const n = C(this, Ie, "m", Qs).call(this);
    n && this._emit("finalContent", n);
    const r = C(this, Ie, "m", Zs).call(this);
    r && this._emit("finalFunctionToolCall", r);
    const o = C(this, Ie, "m", js).call(this);
    o != null && this._emit("finalFunctionToolCallResult", o), this._chatCompletions.some((i) => i.usage) && this._emit("totalUsage", C(this, Ie, "m", ea).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), C(this, Ie, "m", Gp).call(this, t);
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
    const r = "tool", { tool_choice: o = "auto", stream: i, ...a } = t, u = typeof o != "string" && o.type === "function" && o?.function?.name, { maxChatCompletions: c = nb } = n || {}, d = t.tools.map((p) => {
      if (io(p)) {
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
      const g = (await this._createChatCompletion(e, {
        ...a,
        tool_choice: o,
        tools: f,
        messages: [...this.messages]
      }, n)).choices[0]?.message;
      if (!g) throw new G("missing message in ChatCompletion response");
      if (!g.tool_calls?.length) return;
      for (const y of g.tool_calls) {
        if (y.type !== "function") continue;
        const _ = y.id, { name: v, arguments: E } = y.function, b = h[v];
        if (b) {
          if (u && u !== v) {
            const S = `Invalid tool_call: ${JSON.stringify(v)}. ${JSON.stringify(u)} requested. Please try again`;
            this._addMessage({
              role: r,
              tool_call_id: _,
              content: S
            });
            continue;
          }
        } else {
          const S = `Invalid tool_call: ${JSON.stringify(v)}. Available options are: ${Object.keys(h).map((O) => JSON.stringify(O)).join(", ")}. Please try again`;
          this._addMessage({
            role: r,
            tool_call_id: _,
            content: S
          });
          continue;
        }
        let R;
        try {
          R = tb(b) ? await b.parse(E) : E;
        } catch (S) {
          const O = S instanceof Error ? S.message : String(S);
          this._addMessage({
            role: r,
            tool_call_id: _,
            content: O
          });
          continue;
        }
        const P = await b.function(R, this), L = C(this, Ie, "m", Hp).call(this, P);
        if (this._addMessage({
          role: r,
          tool_call_id: _,
          content: L
        }), u) return;
      }
    }
  }
};
Ie = /* @__PURE__ */ new WeakSet(), Qs = function() {
  return C(this, Ie, "m", pi).call(this).content ?? null;
}, pi = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (di(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new G("stream ended without producing a ChatCompletionMessage with role=assistant");
}, Zs = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (di(n) && n?.tool_calls?.length) for (let r = n.tool_calls.length - 1; r >= 0; r--) {
      const o = n.tool_calls[r];
      if (o?.type === "function") return o.function;
    }
  }
}, js = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (qp(n) && n.content != null && typeof n.content == "string" && this.messages.some((r) => r.role === "assistant" && r.tool_calls?.some((o) => o.type === "function" && o.id === n.tool_call_id))) return n.content;
  }
}, ea = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, Gp = function(t) {
  if (t.n != null && t.n > 1) throw new G("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, Hp = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var rb = class Kp extends Vp {
  static runTools(t, n, r) {
    const o = new Kp(), i = {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return o._run(() => o._runTools(t, n, i)), o;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), di(t) && t.content && this._emit("content", t.content);
  }
}, _e = {
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
}, ob = class extends Error {
}, ib = class extends Error {
};
function sb(e, t = _e.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return ab(e.trim(), t);
}
var ab = (e, t) => {
  const n = e.length;
  let r = 0;
  const o = (p) => {
    throw new ob(`${p} at position ${r}`);
  }, i = (p) => {
    throw new ib(`${p} at position ${r}`);
  }, a = () => (f(), r >= n && o("Unexpected end of input"), e[r] === '"' ? u() : e[r] === "{" ? c() : e[r] === "[" ? d() : e.substring(r, r + 4) === "null" || _e.NULL & t && n - r < 4 && "null".startsWith(e.substring(r)) ? (r += 4, null) : e.substring(r, r + 4) === "true" || _e.BOOL & t && n - r < 4 && "true".startsWith(e.substring(r)) ? (r += 4, !0) : e.substring(r, r + 5) === "false" || _e.BOOL & t && n - r < 5 && "false".startsWith(e.substring(r)) ? (r += 5, !1) : e.substring(r, r + 8) === "Infinity" || _e.INFINITY & t && n - r < 8 && "Infinity".startsWith(e.substring(r)) ? (r += 8, 1 / 0) : e.substring(r, r + 9) === "-Infinity" || _e.MINUS_INFINITY & t && 1 < n - r && n - r < 9 && "-Infinity".startsWith(e.substring(r)) ? (r += 9, -1 / 0) : e.substring(r, r + 3) === "NaN" || _e.NAN & t && n - r < 3 && "NaN".startsWith(e.substring(r)) ? (r += 3, NaN) : h()), u = () => {
    const p = r;
    let g = !1;
    for (r++; r < n && (e[r] !== '"' || g && e[r - 1] === "\\"); )
      g = e[r] === "\\" ? !g : !1, r++;
    if (e.charAt(r) == '"') try {
      return JSON.parse(e.substring(p, ++r - Number(g)));
    } catch (y) {
      i(String(y));
    }
    else if (_e.STR & t) try {
      return JSON.parse(e.substring(p, r - Number(g)) + '"');
    } catch {
      return JSON.parse(e.substring(p, e.lastIndexOf("\\")) + '"');
    }
    o("Unterminated string literal");
  }, c = () => {
    r++, f();
    const p = {};
    try {
      for (; e[r] !== "}"; ) {
        if (f(), r >= n && _e.OBJ & t) return p;
        const g = u();
        f(), r++;
        try {
          const y = a();
          Object.defineProperty(p, g, {
            value: y,
            writable: !0,
            enumerable: !0,
            configurable: !0
          });
        } catch (y) {
          if (_e.OBJ & t) return p;
          throw y;
        }
        f(), e[r] === "," && r++;
      }
    } catch {
      if (_e.OBJ & t) return p;
      o("Expected '}' at end of object");
    }
    return r++, p;
  }, d = () => {
    r++;
    const p = [];
    try {
      for (; e[r] !== "]"; )
        p.push(a()), f(), e[r] === "," && r++;
    } catch {
      if (_e.ARR & t) return p;
      o("Expected ']' at end of array");
    }
    return r++, p;
  }, h = () => {
    if (r === 0) {
      e === "-" && _e.NUM & t && o("Not sure what '-' is");
      try {
        return JSON.parse(e);
      } catch (g) {
        if (_e.NUM & t) try {
          return e[e.length - 1] === "." ? JSON.parse(e.substring(0, e.lastIndexOf("."))) : JSON.parse(e.substring(0, e.lastIndexOf("e")));
        } catch {
        }
        i(String(g));
      }
    }
    const p = r;
    for (e[r] === "-" && r++; e[r] && !",]}".includes(e[r]); ) r++;
    r == n && !(_e.NUM & t) && o("Unterminated number literal");
    try {
      return JSON.parse(e.substring(p, r));
    } catch {
      e.substring(p, r) === "-" && _e.NUM & t && o("Not sure what '-' is");
      try {
        return JSON.parse(e.substring(p, e.lastIndexOf("e")));
      } catch (y) {
        i(String(y));
      }
    }
  }, f = () => {
    for (; r < n && [
      32,
      10,
      13,
      9
    ].includes(e.charCodeAt(r)); ) r++;
  };
  return a();
}, _d = (e) => sb(e, _e.ALL ^ _e.NUM), ce, vt, yn, Dt, as, ko, ls, us, cs, Do, ds, vd, Jp = class ta extends Vp {
  constructor(t) {
    super(), ce.add(this), vt.set(this, void 0), yn.set(this, void 0), Dt.set(this, void 0), V(this, vt, t, "f"), V(this, yn, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return C(this, Dt, "f");
  }
  static fromReadableStream(t) {
    const n = new ta(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createChatCompletion(t, n, r) {
    const o = new ta(n);
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
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), C(this, ce, "m", as).call(this);
    const i = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...r,
      signal: this.controller.signal
    });
    this._connected();
    for await (const a of i) C(this, ce, "m", ls).call(this, a);
    if (i.controller.signal?.aborted) throw new je();
    return this._addChatCompletion(C(this, ce, "m", Do).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), C(this, ce, "m", as).call(this), this._connected();
    const o = Vr.fromReadableStream(t, this.controller);
    let i;
    for await (const a of o)
      i && i !== a.id && this._addChatCompletion(C(this, ce, "m", Do).call(this)), C(this, ce, "m", ls).call(this, a), i = a.id;
    if (o.controller.signal?.aborted) throw new je();
    return this._addChatCompletion(C(this, ce, "m", Do).call(this));
  }
  [(vt = /* @__PURE__ */ new WeakMap(), yn = /* @__PURE__ */ new WeakMap(), Dt = /* @__PURE__ */ new WeakMap(), ce = /* @__PURE__ */ new WeakSet(), as = function() {
    this.ended || V(this, Dt, void 0, "f");
  }, ko = function(n) {
    let r = C(this, yn, "f")[n.index];
    return r || (r = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, C(this, yn, "f")[n.index] = r, r);
  }, ls = function(n) {
    if (this.ended) return;
    const r = C(this, ce, "m", vd).call(this, n);
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
      const a = C(this, ce, "m", ko).call(this, i);
      i.finish_reason && (C(this, ce, "m", cs).call(this, i), a.current_tool_call_index != null && C(this, ce, "m", us).call(this, i, a.current_tool_call_index));
      for (const u of o.delta.tool_calls ?? [])
        a.current_tool_call_index !== u.index && (C(this, ce, "m", cs).call(this, i), a.current_tool_call_index != null && C(this, ce, "m", us).call(this, i, a.current_tool_call_index)), a.current_tool_call_index = u.index;
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
  }, us = function(n, r) {
    if (C(this, ce, "m", ko).call(this, n).done_tool_calls.has(r)) return;
    const o = n.message.tool_calls?.[r];
    if (!o) throw new Error("no tool call snapshot");
    if (!o.type) throw new Error("tool call snapshot missing `type`");
    if (o.type === "function") {
      const i = C(this, vt, "f")?.tools?.find((a) => ci(a) && a.function.name === o.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: o.function.name,
        index: r,
        arguments: o.function.arguments,
        parsed_arguments: io(i) ? i.$parseRaw(o.function.arguments) : i?.function.strict ? JSON.parse(o.function.arguments) : null
      });
    } else o.type;
  }, cs = function(n) {
    const r = C(this, ce, "m", ko).call(this, n);
    if (n.message.content && !r.content_done) {
      r.content_done = !0;
      const o = C(this, ce, "m", ds).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: o ? o.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !r.refusal_done && (r.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !r.logprobs_content_done && (r.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !r.logprobs_refusal_done && (r.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, Do = function() {
    if (this.ended) throw new G("stream has ended, this shouldn't happen");
    const n = C(this, Dt, "f");
    if (!n) throw new G("request ended without sending any chunks");
    return V(this, Dt, void 0, "f"), V(this, yn, [], "f"), lb(n, C(this, vt, "f"));
  }, ds = function() {
    const n = C(this, vt, "f")?.response_format;
    return La(n) ? n : null;
  }, vd = function(n) {
    var r, o, i, a;
    let u = C(this, Dt, "f");
    const { choices: c, ...d } = n;
    u ? Object.assign(u, d) : u = V(this, Dt, {
      ...d,
      choices: []
    }, "f");
    for (const { delta: h, finish_reason: f, index: p, logprobs: g = null, ...y } of n.choices) {
      let _ = u.choices[p];
      if (_ || (_ = u.choices[p] = {
        finish_reason: f,
        index: p,
        message: {},
        logprobs: g,
        ...y
      }), g) if (!_.logprobs) _.logprobs = Object.assign({}, g);
      else {
        const { content: S, refusal: O, ...x } = g;
        Object.assign(_.logprobs, x), S && ((r = _.logprobs).content ?? (r.content = []), _.logprobs.content.push(...S)), O && ((o = _.logprobs).refusal ?? (o.refusal = []), _.logprobs.refusal.push(...O));
      }
      if (f && (_.finish_reason = f, C(this, vt, "f") && Fp(C(this, vt, "f")))) {
        if (f === "length") throw new mp();
        if (f === "content_filter") throw new yp();
      }
      if (Object.assign(_, y), !h) continue;
      const { content: v, refusal: E, function_call: b, role: R, tool_calls: P, ...L } = h;
      if (Object.assign(_.message, L), E && (_.message.refusal = (_.message.refusal || "") + E), R && (_.message.role = R), b && (_.message.function_call ? (b.name && (_.message.function_call.name = b.name), b.arguments && ((i = _.message.function_call).arguments ?? (i.arguments = ""), _.message.function_call.arguments += b.arguments)) : _.message.function_call = b), v && (_.message.content = (_.message.content || "") + v, !_.message.refusal && C(this, ce, "m", ds).call(this) && (_.message.parsed = _d(_.message.content))), P) {
        _.message.tool_calls || (_.message.tool_calls = []);
        for (const { index: S, id: O, type: x, function: D, ...H } of P) {
          const z = (a = _.message.tool_calls)[S] ?? (a[S] = {});
          Object.assign(z, H), O && (z.id = O), x && (z.type = x), D && (z.function ?? (z.function = {
            name: D.name ?? "",
            arguments: ""
          })), D?.name && (z.function.name = D.name), D?.arguments && (z.function.arguments += D.arguments, jI(C(this, vt, "f"), z) && (z.function.parsed_arguments = _d(z.function.arguments)));
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
    return new Vr(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
function lb(e, t) {
  const { id: n, choices: r, created: o, model: i, system_fingerprint: a, ...u } = e;
  return XI({
    ...u,
    id: n,
    choices: r.map(({ message: c, finish_reason: d, index: h, logprobs: f, ...p }) => {
      if (!d) throw new G(`missing finish_reason for choice ${h}`);
      const { content: g = null, function_call: y, tool_calls: _, ...v } = c, E = c.role;
      if (!E) throw new G(`missing role for choice ${h}`);
      if (y) {
        const { arguments: b, name: R } = y;
        if (b == null) throw new G(`missing function_call.arguments for choice ${h}`);
        if (!R) throw new G(`missing function_call.name for choice ${h}`);
        return {
          ...p,
          message: {
            content: g,
            function_call: {
              arguments: b,
              name: R
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
          ...v,
          role: E,
          content: g,
          refusal: c.refusal ?? null,
          tool_calls: _.map((b, R) => {
            const { function: P, type: L, id: S, ...O } = b, { arguments: x, name: D, ...H } = P || {};
            if (S == null) throw new G(`missing choices[${h}].tool_calls[${R}].id
${$o(e)}`);
            if (L == null) throw new G(`missing choices[${h}].tool_calls[${R}].type
${$o(e)}`);
            if (D == null) throw new G(`missing choices[${h}].tool_calls[${R}].function.name
${$o(e)}`);
            if (x == null) throw new G(`missing choices[${h}].tool_calls[${R}].function.arguments
${$o(e)}`);
            return {
              ...O,
              id: S,
              type: L,
              function: {
                ...H,
                name: D,
                arguments: x
              }
            };
          })
        }
      } : {
        ...p,
        message: {
          ...v,
          content: g,
          role: E,
          refusal: c.refusal ?? null
        },
        finish_reason: d,
        index: h,
        logprobs: f
      };
    }),
    created: o,
    model: i,
    object: "chat.completion",
    ...a ? { system_fingerprint: a } : {}
  }, t);
}
function $o(e) {
  return JSON.stringify(e);
}
var ub = class na extends Jp {
  static fromReadableStream(t) {
    const n = new na(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static runTools(t, n, r) {
    const o = new na(n), i = {
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
    super(...arguments), this.messages = new Up(this._client);
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
    return this._client.getAPIList("/chat/completions", re, {
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
    return eb(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => Ua(n, e));
  }
  runTools(e, t) {
    return e.stream ? ub.runTools(this._client, e, t) : rb.runTools(this._client, e, t);
  }
  stream(e, t) {
    return Jp.createChatCompletion(this._client, e, t);
  }
};
Oa.Messages = Up;
var qa = class extends k {
  constructor() {
    super(...arguments), this.completions = new Oa(this._client);
  }
};
qa.Completions = Oa;
var Wp = class extends k {
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
    return this._client.getAPIList("/organization/admin_api_keys", re, {
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
}, zp = class extends k {
  list(e = {}, t) {
    return this._client.getAPIList("/organization/audit_logs", we, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Yp = class extends k {
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
    return this._client.getAPIList("/organization/certificates/activate", Bt, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t) {
    return this._client.getAPIList("/organization/certificates/deactivate", Bt, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Xp = class extends k {
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
}, Qp = class extends k {
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
}, Zp = class extends k {
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
    return this._client.getAPIList("/organization/roles", Pt, {
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
}, jp = class extends k {
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
}, eg = class extends k {
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
}, tg = class extends k {
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
    return this._client.getAPIList(T`/organization/groups/${e}/roles`, Pt, {
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
}, ng = class extends k {
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
    return this._client.getAPIList(T`/organization/groups/${e}/users`, Pt, {
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
}, Di = class extends k {
  constructor() {
    super(...arguments), this.users = new ng(this._client), this.roles = new tg(this._client);
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
    return this._client.getAPIList("/organization/groups", Pt, {
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
Di.Users = ng;
Di.Roles = tg;
var rg = class extends k {
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
}, og = class extends k {
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/certificates`, we, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  activate(e, t, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/certificates/activate`, Bt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/certificates/deactivate`, Bt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, ig = class extends k {
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
}, sg = class extends k {
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
}, ag = class extends k {
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
}, lg = class extends k {
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
}, ug = class extends k {
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
    return this._client.getAPIList(T`/projects/${e}/roles`, Pt, {
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
}, cg = class extends k {
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
}, dg = class extends k {
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
}, fg = class extends k {
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
    return this._client.getAPIList(T`/projects/${r}/groups/${e}/roles`, Pt, {
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
    super(...arguments), this.roles = new fg(this._client);
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
    return this._client.getAPIList(T`/organization/projects/${e}/groups`, Pt, {
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
Ba.Roles = fg;
var hg = class extends k {
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
    return this._client.getAPIList(T`/projects/${r}/users/${e}/roles`, Pt, {
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
    super(...arguments), this.roles = new hg(this._client);
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
Ga.Roles = hg;
var We = class extends k {
  constructor() {
    super(...arguments), this.users = new Ga(this._client), this.serviceAccounts = new cg(this._client), this.apiKeys = new rg(this._client), this.rateLimits = new lg(this._client), this.modelPermissions = new ag(this._client), this.hostedToolPermissions = new sg(this._client), this.groups = new Ba(this._client), this.roles = new ug(this._client), this.dataRetention = new ig(this._client), this.spendAlerts = new dg(this._client), this.certificates = new og(this._client);
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
We.ServiceAccounts = cg;
We.APIKeys = rg;
We.RateLimits = lg;
We.ModelPermissions = ag;
We.HostedToolPermissions = sg;
We.Groups = Ba;
We.Roles = ug;
We.DataRetention = ig;
We.SpendAlerts = dg;
We.Certificates = og;
var pg = class extends k {
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
    return this._client.getAPIList(T`/organization/users/${e}/roles`, Pt, {
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
    super(...arguments), this.roles = new pg(this._client);
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
Ha.Roles = pg;
var ze = class extends k {
  constructor() {
    super(...arguments), this.auditLogs = new zp(this._client), this.adminAPIKeys = new Wp(this._client), this.usage = new eg(this._client), this.invites = new Qp(this._client), this.users = new Ha(this._client), this.groups = new Di(this._client), this.roles = new Zp(this._client), this.dataRetention = new Xp(this._client), this.spendAlerts = new jp(this._client), this.certificates = new Yp(this._client), this.projects = new We(this._client);
  }
};
ze.AuditLogs = zp;
ze.AdminAPIKeys = Wp;
ze.Usage = eg;
ze.Invites = Qp;
ze.Users = Ha;
ze.Groups = Di;
ze.Roles = Zp;
ze.DataRetention = Xp;
ze.SpendAlerts = jp;
ze.Certificates = Yp;
ze.Projects = We;
var Va = class extends k {
  constructor() {
    super(...arguments), this.organization = new ze(this._client);
  }
};
Va.Organization = ze;
var gg = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* cb(e) {
  if (!e) return;
  if (gg in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const i of o) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : nd(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const i = nd(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, u]);
  }
}
var F = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [i, a] of cb(r)) {
      const u = i.toLowerCase();
      o.has(u) || (t.delete(i), o.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [gg]: !0,
    values: t,
    nulls: n
  };
}, mg = class extends k {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: F([{ Accept: "application/octet-stream" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, yg = class extends k {
  create(e, t) {
    return this._client.post("/audio/transcriptions", mt({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, _g = class extends k {
  create(e, t) {
    return this._client.post("/audio/translations", mt({
      body: e,
      ...t,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, so = class extends k {
  constructor() {
    super(...arguments), this.transcriptions = new yg(this._client), this.translations = new _g(this._client), this.speech = new mg(this._client);
  }
};
so.Transcriptions = yg;
so.Translations = _g;
so.Speech = mg;
var vg = class extends k {
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
    return this._client.getAPIList("/batches", re, {
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
}, Ag = class extends k {
  create(e, t) {
    return this._client.post("/assistants", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/assistants/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/assistants/${e}`, {
      body: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/assistants", re, {
      query: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/assistants/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Tg = class extends k {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Sg = class extends k {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, $i = class extends k {
  constructor() {
    super(...arguments), this.sessions = new Tg(this._client), this.transcriptionSessions = new Sg(this._client);
  }
};
$i.Sessions = Tg;
$i.TranscriptionSessions = Sg;
var Eg = class extends k {
  create(e, t) {
    return this._client.post("/chatkit/sessions", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(T`/chatkit/sessions/${e}/cancel`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, wg = class extends k {
  retrieve(e, t) {
    return this._client.get(T`/chatkit/threads/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chatkit/threads", we, {
      query: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/chatkit/threads/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  listItems(e, t = {}, n) {
    return this._client.getAPIList(T`/chatkit/threads/${e}/items`, we, {
      query: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Li = class extends k {
  constructor() {
    super(...arguments), this.sessions = new Eg(this._client), this.threads = new wg(this._client);
  }
};
Li.Sessions = Eg;
Li.Threads = wg;
var Cg = class extends k {
  create(e, t, n) {
    return this._client.post(T`/threads/${e}/messages`, {
      body: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { thread_id: r } = t;
    return this._client.get(T`/threads/${r}/messages/${e}`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { thread_id: r, ...o } = t;
    return this._client.post(T`/threads/${r}/messages/${e}`, {
      body: o,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/threads/${e}/messages`, re, {
      query: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { thread_id: r } = t;
    return this._client.delete(T`/threads/${r}/messages/${e}`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Ig = class extends k {
  retrieve(e, t, n) {
    const { thread_id: r, run_id: o, ...i } = t;
    return this._client.get(T`/threads/${r}/runs/${o}/steps/${e}`, {
      query: i,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t, n) {
    const { thread_id: r, ...o } = t;
    return this._client.getAPIList(T`/threads/${r}/runs/${e}/steps`, re, {
      query: o,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, db = (e) => {
  if (typeof Buffer < "u") {
    const t = Buffer.from(e, "base64");
    return Array.from(new Float32Array(t.buffer, t.byteOffset, t.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const t = atob(e), n = t.length, r = new Uint8Array(n);
    for (let o = 0; o < n; o++) r[o] = t.charCodeAt(o);
    return Array.from(new Float32Array(r.buffer));
  }
}, $t = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, Ee, sn, ra, gt, Xo, ot, an, xn, tn, gi, He, Qo, Zo, Ur, Mr, Nr, Ad, Td, Sd, Ed, wd, Cd, Id, Fr = class extends Fa {
  constructor() {
    super(...arguments), Ee.add(this), ra.set(this, []), gt.set(this, {}), Xo.set(this, {}), ot.set(this, void 0), an.set(this, void 0), xn.set(this, void 0), tn.set(this, void 0), gi.set(this, void 0), He.set(this, void 0), Qo.set(this, void 0), Zo.set(this, void 0), Ur.set(this, void 0);
  }
  [(ra = /* @__PURE__ */ new WeakMap(), gt = /* @__PURE__ */ new WeakMap(), Xo = /* @__PURE__ */ new WeakMap(), ot = /* @__PURE__ */ new WeakMap(), an = /* @__PURE__ */ new WeakMap(), xn = /* @__PURE__ */ new WeakMap(), tn = /* @__PURE__ */ new WeakMap(), gi = /* @__PURE__ */ new WeakMap(), He = /* @__PURE__ */ new WeakMap(), Qo = /* @__PURE__ */ new WeakMap(), Zo = /* @__PURE__ */ new WeakMap(), Ur = /* @__PURE__ */ new WeakMap(), Ee = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
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
    const t = new sn();
    return t._run(() => t._fromReadableStream(e)), t;
  }
  async _fromReadableStream(e, t) {
    const n = t?.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const r = Vr.fromReadableStream(e, this.controller);
    for await (const o of r) C(this, Ee, "m", Mr).call(this, o);
    if (r.controller.signal?.aborted) throw new je();
    return this._addRun(C(this, Ee, "m", Nr).call(this));
  }
  toReadableStream() {
    return new Vr(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, t, n, r) {
    const o = new sn();
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
    }, a = await e.submitToolOutputs(t, i, {
      ...r,
      signal: this.controller.signal
    });
    this._connected();
    for await (const u of a) C(this, Ee, "m", Mr).call(this, u);
    if (a.controller.signal?.aborted) throw new je();
    return this._addRun(C(this, Ee, "m", Nr).call(this));
  }
  static createThreadAssistantStream(e, t, n) {
    const r = new sn();
    return r._run(() => r._threadAssistantStream(e, t, {
      ...n,
      headers: {
        ...n?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), r;
  }
  static createAssistantStream(e, t, n, r) {
    const o = new sn();
    return o._run(() => o._runAssistantStream(e, t, n, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  currentEvent() {
    return C(this, Qo, "f");
  }
  currentRun() {
    return C(this, Zo, "f");
  }
  currentMessageSnapshot() {
    return C(this, ot, "f");
  }
  currentRunStepSnapshot() {
    return C(this, Ur, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(C(this, gt, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(C(this, Xo, "f"));
  }
  async finalRun() {
    if (await this.done(), !C(this, an, "f")) throw Error("Final run was not received.");
    return C(this, an, "f");
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
    for await (const a of i) C(this, Ee, "m", Mr).call(this, a);
    if (i.controller.signal?.aborted) throw new je();
    return this._addRun(C(this, Ee, "m", Nr).call(this));
  }
  async _createAssistantStream(e, t, n, r) {
    const o = r?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort()));
    const i = {
      ...n,
      stream: !0
    }, a = await e.create(t, i, {
      ...r,
      signal: this.controller.signal
    });
    this._connected();
    for await (const u of a) C(this, Ee, "m", Mr).call(this, u);
    if (a.controller.signal?.aborted) throw new je();
    return this._addRun(C(this, Ee, "m", Nr).call(this));
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
      else if (os(o) && os(r)) o = this.accumulateDelta(o, r);
      else if (Array.isArray(o) && Array.isArray(r)) {
        if (o.every((i) => typeof i == "string" || typeof i == "number")) {
          o.push(...r);
          continue;
        }
        for (const i of r) {
          if (!os(i)) throw new Error(`Expected array delta entry to be an object but got: ${i}`);
          const a = i.index;
          if (a == null)
            throw console.error(i), new Error("Expected array delta entry to have an `index` property");
          if (typeof a != "number") throw new Error(`Expected array delta entry \`index\` property to be a number but got ${a}`);
          const u = o[a];
          u == null ? o.push(i) : o[a] = this.accumulateDelta(u, i);
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
sn = Fr, Mr = function(t) {
  if (!this.ended)
    switch (V(this, Qo, t, "f"), C(this, Ee, "m", Sd).call(this, t), t.event) {
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
        C(this, Ee, "m", Id).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        C(this, Ee, "m", Td).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        C(this, Ee, "m", Ad).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, Nr = function() {
  if (this.ended) throw new G("stream has ended, this shouldn't happen");
  if (!C(this, an, "f")) throw Error("Final run has not been received");
  return C(this, an, "f");
}, Ad = function(t) {
  const [n, r] = C(this, Ee, "m", wd).call(this, t, C(this, ot, "f"));
  V(this, ot, n, "f"), C(this, Xo, "f")[n.id] = n;
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
          let i = o.text, a = n.content[o.index];
          if (a && a.type == "text") this._emit("textDelta", i, a.text);
          else throw Error("The snapshot associated with this text delta is not text or missing");
        }
        if (o.index != C(this, xn, "f")) {
          if (C(this, tn, "f")) switch (C(this, tn, "f").type) {
            case "text":
              this._emit("textDone", C(this, tn, "f").text, C(this, ot, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", C(this, tn, "f").image_file, C(this, ot, "f"));
              break;
          }
          V(this, xn, o.index, "f");
        }
        V(this, tn, n.content[o.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (C(this, xn, "f") !== void 0) {
        const o = t.data.content[C(this, xn, "f")];
        if (o) switch (o.type) {
          case "image_file":
            this._emit("imageFileDone", o.image_file, C(this, ot, "f"));
            break;
          case "text":
            this._emit("textDone", o.text, C(this, ot, "f"));
            break;
        }
      }
      C(this, ot, "f") && this._emit("messageDone", t.data), V(this, ot, void 0, "f");
  }
}, Td = function(t) {
  const n = C(this, Ee, "m", Ed).call(this, t);
  switch (V(this, Ur, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const r = t.data.delta;
      if (r.step_details && r.step_details.type == "tool_calls" && r.step_details.tool_calls && n.step_details.type == "tool_calls") for (const o of r.step_details.tool_calls) o.index == C(this, gi, "f") ? this._emit("toolCallDelta", o, n.step_details.tool_calls[o.index]) : (C(this, He, "f") && this._emit("toolCallDone", C(this, He, "f")), V(this, gi, o.index, "f"), V(this, He, n.step_details.tool_calls[o.index], "f"), C(this, He, "f") && this._emit("toolCallCreated", C(this, He, "f")));
      this._emit("runStepDelta", t.data.delta, n);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      V(this, Ur, void 0, "f"), t.data.step_details.type == "tool_calls" && C(this, He, "f") && (this._emit("toolCallDone", C(this, He, "f")), V(this, He, void 0, "f")), this._emit("runStepDone", t.data, n);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, Sd = function(t) {
  C(this, ra, "f").push(t), this._emit("event", t);
}, Ed = function(t) {
  switch (t.event) {
    case "thread.run.step.created":
      return C(this, gt, "f")[t.data.id] = t.data, t.data;
    case "thread.run.step.delta":
      let n = C(this, gt, "f")[t.data.id];
      if (!n) throw Error("Received a RunStepDelta before creation of a snapshot");
      let r = t.data;
      if (r.delta) {
        const o = sn.accumulateDelta(n, r.delta);
        C(this, gt, "f")[t.data.id] = o;
      }
      return C(this, gt, "f")[t.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      C(this, gt, "f")[t.data.id] = t.data;
      break;
  }
  if (C(this, gt, "f")[t.data.id]) return C(this, gt, "f")[t.data.id];
  throw new Error("No snapshot available");
}, wd = function(t, n) {
  let r = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, r];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let o = t.data;
      if (o.delta.content) for (const i of o.delta.content) if (i.index in n.content) {
        let a = n.content[i.index];
        n.content[i.index] = C(this, Ee, "m", Cd).call(this, i, a);
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
}, Cd = function(t, n) {
  return sn.accumulateDelta(n, t);
}, Id = function(t) {
  switch (V(this, Zo, t.data, "f"), t.event) {
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
      V(this, an, t.data, "f"), C(this, He, "f") && (this._emit("toolCallDone", C(this, He, "f")), V(this, He, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var Ka = class extends k {
  constructor() {
    super(...arguments), this.steps = new Ig(this._client);
  }
  create(e, t, n) {
    const { include: r, ...o } = t;
    return this._client.post(T`/threads/${e}/runs`, {
      query: { include: r },
      body: o,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { thread_id: r } = t;
    return this._client.get(T`/threads/${r}/runs/${e}`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { thread_id: r, ...o } = t;
    return this._client.post(T`/threads/${r}/runs/${e}`, {
      body: o,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/threads/${e}/runs`, re, {
      query: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { thread_id: r } = t;
    return this._client.post(T`/threads/${r}/runs/${e}/cancel`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const r = await this.create(e, t, n);
    return await this.poll(r.id, { thread_id: e }, n);
  }
  createAndStream(e, t, n) {
    return Fr.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  async poll(e, t, n) {
    const r = F([n?.headers, {
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
          let a = 5e3;
          if (n?.pollIntervalMs) a = n.pollIntervalMs;
          else {
            const u = i.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (a = c);
            }
          }
          await oo(a);
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
    return Fr.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  submitToolOutputs(e, t, n) {
    const { thread_id: r, ...o } = t;
    return this._client.post(T`/threads/${r}/runs/${e}/submit_tool_outputs`, {
      body: o,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
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
    return Fr.createToolAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
};
Ka.Steps = Ig;
var Ui = class extends k {
  constructor() {
    super(...arguments), this.runs = new Ka(this._client), this.messages = new Cg(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/threads", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/threads/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/threads/${e}`, {
      body: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/threads/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  createAndRun(e, t) {
    return this._client.post("/threads/runs", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
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
    return Fr.createThreadAssistantStream(e, this._client.beta.threads, t);
  }
};
Ui.Runs = Ka;
Ui.Messages = Cg;
var Wn = class extends k {
  constructor() {
    super(...arguments), this.realtime = new $i(this._client), this.chatkit = new Li(this._client), this.assistants = new Ag(this._client), this.threads = new Ui(this._client);
  }
};
Wn.Realtime = $i;
Wn.ChatKit = Li;
Wn.Assistants = Ag;
Wn.Threads = Ui;
var bg = class extends k {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    });
  }
}, Pg = class extends k {
  retrieve(e, t, n) {
    const { container_id: r } = t;
    return this._client.get(T`/containers/${r}/files/${e}/content`, {
      ...n,
      headers: F([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Ja = class extends k {
  constructor() {
    super(...arguments), this.content = new Pg(this._client);
  }
  create(e, t, n) {
    return this._client.post(T`/containers/${e}/files`, ki({
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
    return this._client.getAPIList(T`/containers/${e}/files`, re, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { container_id: r } = t;
    return this._client.delete(T`/containers/${r}/files/${e}`, {
      ...n,
      headers: F([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
Ja.Content = Pg;
var Wa = class extends k {
  constructor() {
    super(...arguments), this.files = new Ja(this._client);
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
    return this._client.getAPIList("/containers", re, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/containers/${e}`, {
      ...t,
      headers: F([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
Wa.Files = Ja;
var Rg = class extends k {
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
    super(...arguments), this.items = new Rg(this._client);
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
za.Items = Rg;
var xg = class extends k {
  create(e, t) {
    const n = !!e.encoding_format;
    let r = n ? e.encoding_format : "base64";
    n && Se(this._client).debug("embeddings/user defined encoding_format:", e.encoding_format);
    const o = this._client.post("/embeddings", {
      body: {
        ...e,
        encoding_format: r
      },
      ...t,
      __security: { bearerAuth: !0 }
    });
    return n ? o : (Se(this._client).debug("embeddings/decoding base64 embeddings from base64"), o._thenUnwrap((i) => (i && i.data && i.data.forEach((a) => {
      const u = a.embedding;
      a.embedding = db(u);
    }), i)));
  }
}, Mg = class extends k {
  retrieve(e, t, n) {
    const { eval_id: r, run_id: o } = t;
    return this._client.get(T`/evals/${r}/runs/${o}/output_items/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t, n) {
    const { eval_id: r, ...o } = t;
    return this._client.getAPIList(T`/evals/${r}/runs/${e}/output_items`, re, {
      query: o,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Ya = class extends k {
  constructor() {
    super(...arguments), this.outputItems = new Mg(this._client);
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
    return this._client.getAPIList(T`/evals/${e}/runs`, re, {
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
Ya.OutputItems = Mg;
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
    return this._client.getAPIList("/evals", re, {
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
var Ng = class extends k {
  create(e, t) {
    return this._client.post("/files", mt({
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
    return this._client.getAPIList("/files", re, {
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
      headers: F([{ Accept: "application/binary" }, t?.headers]),
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
      if (await oo(t), i = await this.retrieve(e), Date.now() - o > n) throw new Na({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return i;
  }
}, kg = class extends k {
}, Dg = class extends k {
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
    super(...arguments), this.graders = new Dg(this._client);
  }
};
Qa.Graders = Dg;
var $g = class extends k {
  create(e, t, n) {
    return this._client.getAPIList(T`/fine_tuning/checkpoints/${e}/permissions`, Bt, {
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
    super(...arguments), this.permissions = new $g(this._client);
  }
};
Za.Permissions = $g;
var Lg = class extends k {
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/fine_tuning/jobs/${e}/checkpoints`, re, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, ja = class extends k {
  constructor() {
    super(...arguments), this.checkpoints = new Lg(this._client);
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
    return this._client.getAPIList("/fine_tuning/jobs", re, {
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
    return this._client.getAPIList(T`/fine_tuning/jobs/${e}/events`, re, {
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
ja.Checkpoints = Lg;
var zn = class extends k {
  constructor() {
    super(...arguments), this.methods = new kg(this._client), this.jobs = new ja(this._client), this.checkpoints = new Za(this._client), this.alpha = new Qa(this._client);
  }
};
zn.Methods = kg;
zn.Jobs = ja;
zn.Checkpoints = Za;
zn.Alpha = Qa;
var Ug = class extends k {
}, el = class extends k {
  constructor() {
    super(...arguments), this.graderModels = new Ug(this._client);
  }
};
el.GraderModels = Ug;
var Fg = class extends k {
  createVariation(e, t) {
    return this._client.post("/images/variations", mt({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  edit(e, t) {
    return this._client.post("/images/edits", mt({
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
}, Og = class extends k {
  retrieve(e, t) {
    return this._client.get(T`/models/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e) {
    return this._client.getAPIList("/models", Bt, {
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
}, qg = class extends k {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Bg = class extends k {
  accept(e, t, n) {
    return this._client.post(T`/realtime/calls/${e}/accept`, {
      body: t,
      ...n,
      headers: F([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  hangup(e, t) {
    return this._client.post(T`/realtime/calls/${e}/hangup`, {
      ...t,
      headers: F([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  refer(e, t, n) {
    return this._client.post(T`/realtime/calls/${e}/refer`, {
      body: t,
      ...n,
      headers: F([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  reject(e, t = {}, n) {
    return this._client.post(T`/realtime/calls/${e}/reject`, {
      body: t,
      ...n,
      headers: F([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Gg = class extends k {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Fi = class extends k {
  constructor() {
    super(...arguments), this.clientSecrets = new Gg(this._client), this.calls = new Bg(this._client);
  }
};
Fi.ClientSecrets = Gg;
Fi.Calls = Bg;
function fb(e, t) {
  return !t || !pb(t) ? {
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
  } : Hg(e, t);
}
function Hg(e, t) {
  const n = e.output.map((o) => {
    if (o.type === "function_call") return {
      ...o,
      parsed_arguments: yb(t, o)
    };
    if (o.type === "message") {
      const i = o.content.map((a) => a.type === "output_text" ? {
        ...a,
        parsed: hb(t, a.text)
      } : a);
      return {
        ...o,
        content: i
      };
    }
    return o;
  }), r = Object.assign({}, e, { output: n });
  return Object.getOwnPropertyDescriptor(e, "output_text") || oa(r), Object.defineProperty(r, "output_parsed", {
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
function hb(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function pb(e) {
  return !!La(e.text?.format);
}
function gb(e) {
  return e?.$brand === "auto-parseable-tool";
}
function mb(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function yb(e, t) {
  const n = mb(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: gb(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function oa(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const r of n.content) r.type === "output_text" && t.push(r.text);
  e.output_text = t.join("");
}
var _n, Lo, Lt, Uo, bd, Pd, Rd, xd, _b = class Vg extends Fa {
  constructor(t) {
    super(), _n.add(this), Lo.set(this, void 0), Lt.set(this, void 0), Uo.set(this, void 0), V(this, Lo, t, "f");
  }
  static createResponse(t, n, r) {
    const o = new Vg(n);
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
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), C(this, _n, "m", bd).call(this);
    let i, a = null;
    "response_id" in n ? (i = await t.responses.retrieve(n.response_id, { stream: !0 }, {
      ...r,
      signal: this.controller.signal,
      stream: !0
    }), a = n.starting_after ?? null) : i = await t.responses.create({
      ...n,
      stream: !0
    }, {
      ...r,
      signal: this.controller.signal
    }), this._connected();
    for await (const u of i) C(this, _n, "m", Pd).call(this, u, a);
    if (i.controller.signal?.aborted) throw new je();
    return C(this, _n, "m", Rd).call(this);
  }
  [(Lo = /* @__PURE__ */ new WeakMap(), Lt = /* @__PURE__ */ new WeakMap(), Uo = /* @__PURE__ */ new WeakMap(), _n = /* @__PURE__ */ new WeakSet(), bd = function() {
    this.ended || V(this, Lt, void 0, "f");
  }, Pd = function(n, r) {
    if (this.ended) return;
    const o = (a, u) => {
      (r == null || u.sequence_number > r) && this._emit(a, u);
    }, i = C(this, _n, "m", xd).call(this, n);
    switch (o("event", n), n.type) {
      case "response.output_text.delta": {
        const a = i.output[n.output_index];
        if (!a) throw new G(`missing output at index ${n.output_index}`);
        if (a.type === "message") {
          const u = a.content[n.content_index];
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
        const a = i.output[n.output_index];
        if (!a) throw new G(`missing output at index ${n.output_index}`);
        a.type === "function_call" && o("response.function_call_arguments.delta", {
          ...n,
          snapshot: a.arguments
        });
        break;
      }
      default:
        o(n.type, n);
        break;
    }
  }, Rd = function() {
    if (this.ended) throw new G("stream has ended, this shouldn't happen");
    const n = C(this, Lt, "f");
    if (!n) throw new G("request ended without sending any events");
    V(this, Lt, void 0, "f");
    const r = vb(n, C(this, Lo, "f"));
    return V(this, Uo, r, "f"), r;
  }, xd = function(n) {
    let r = C(this, Lt, "f");
    if (!r) {
      if (n.type !== "response.created") throw new G(`When snapshot hasn't been set yet, expected 'response.created' event, got ${n.type}`);
      return r = V(this, Lt, n.response, "f"), r;
    }
    switch (n.type) {
      case "response.output_item.added":
        r.output.push(n.item);
        break;
      case "response.content_part.added": {
        const o = r.output[n.output_index];
        if (!o) throw new G(`missing output at index ${n.output_index}`);
        const i = o.type, a = n.part;
        i === "message" && a.type !== "reasoning_text" ? o.content.push(a) : i === "reasoning" && a.type === "reasoning_text" && (o.content || (o.content = []), o.content.push(a));
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
        V(this, Lt, n.response, "f");
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
    const t = C(this, Uo, "f");
    if (!t) throw new G("stream ended without producing a ChatCompletion");
    return t;
  }
};
function vb(e, t) {
  return fb(e, t);
}
var Kg = class extends k {
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/responses/${e}/input_items`, re, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Jg = class extends k {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Oi = class extends k {
  constructor() {
    super(...arguments), this.inputItems = new Kg(this._client), this.inputTokens = new Jg(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && oa(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(T`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((r) => ("object" in r && r.object === "response" && oa(r), r));
  }
  delete(e, t) {
    return this._client.delete(T`/responses/${e}`, {
      ...t,
      headers: F([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => Hg(n, e));
  }
  stream(e, t) {
    return _b.createResponse(this._client, e, t);
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
Oi.InputItems = Kg;
Oi.InputTokens = Jg;
var Wg = class extends k {
  retrieve(e, t) {
    return this._client.get(T`/skills/${e}/content`, {
      ...t,
      headers: F([{ Accept: "application/binary" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, zg = class extends k {
  retrieve(e, t, n) {
    const { skill_id: r } = t;
    return this._client.get(T`/skills/${r}/versions/${e}/content`, {
      ...n,
      headers: F([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, tl = class extends k {
  constructor() {
    super(...arguments), this.content = new zg(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(T`/skills/${e}/versions`, ki({
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
    return this._client.getAPIList(T`/skills/${e}/versions`, re, {
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
tl.Content = zg;
var qi = class extends k {
  constructor() {
    super(...arguments), this.content = new Wg(this._client), this.versions = new tl(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", ki({
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
    return this._client.getAPIList("/skills", re, {
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
qi.Content = Wg;
qi.Versions = tl;
var Yg = class extends k {
  create(e, t, n) {
    return this._client.post(T`/uploads/${e}/parts`, mt({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, nl = class extends k {
  constructor() {
    super(...arguments), this.parts = new Yg(this._client);
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
nl.Parts = Yg;
var Ab = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((o) => o.status === "rejected");
  if (n.length) {
    for (const o of n) console.error(o.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const r = [];
  for (const o of t) o.status === "fulfilled" && r.push(o.value);
  return r;
}, Xg = class extends k {
  create(e, t, n) {
    return this._client.post(T`/vector_stores/${e}/file_batches`, {
      body: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.get(T`/vector_stores/${r}/file_batches/${e}`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.post(T`/vector_stores/${r}/file_batches/${e}/cancel`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const r = await this.create(e, t);
    return await this.poll(e, r.id, n);
  }
  listFiles(e, t, n) {
    const { vector_store_id: r, ...o } = t;
    return this._client.getAPIList(T`/vector_stores/${r}/file_batches/${e}/files`, re, {
      query: o,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async poll(e, t, n) {
    const r = F([n?.headers, {
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
          let a = 5e3;
          if (n?.pollIntervalMs) a = n.pollIntervalMs;
          else {
            const u = i.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (a = c);
            }
          }
          await oo(a);
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
    const o = r?.maxConcurrency ?? 5, i = Math.min(o, t.length), a = this._client, u = t.values(), c = [...n];
    async function d(h) {
      for (let f of h) {
        const p = await a.files.create({
          file: f,
          purpose: "assistants"
        }, r);
        c.push(p.id);
      }
    }
    return await Ab(Array(i).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, Qg = class extends k {
  create(e, t, n) {
    return this._client.post(T`/vector_stores/${e}/files`, {
      body: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.get(T`/vector_stores/${r}/files/${e}`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { vector_store_id: r, ...o } = t;
    return this._client.post(T`/vector_stores/${r}/files/${e}`, {
      body: o,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/vector_stores/${e}/files`, re, {
      query: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.delete(T`/vector_stores/${r}/files/${e}`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const r = await this.create(e, t, n);
    return await this.poll(e, r.id, n);
  }
  async poll(e, t, n) {
    const r = F([n?.headers, {
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
          let a = 5e3;
          if (n?.pollIntervalMs) a = n.pollIntervalMs;
          else {
            const u = o.response.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (a = c);
            }
          }
          await oo(a);
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
    return this._client.getAPIList(T`/vector_stores/${r}/files/${e}/content`, Bt, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Bi = class extends k {
  constructor() {
    super(...arguments), this.files = new Qg(this._client), this.fileBatches = new Xg(this._client);
  }
  create(e, t) {
    return this._client.post("/vector_stores", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/vector_stores/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/vector_stores/${e}`, {
      body: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/vector_stores", re, {
      query: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/vector_stores/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  search(e, t, n) {
    return this._client.getAPIList(T`/vector_stores/${e}/search`, Bt, {
      body: t,
      method: "post",
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
Bi.Files = Qg;
Bi.FileBatches = Xg;
var Zg = class extends k {
  create(e, t) {
    return this._client.post("/videos", mt({
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
    return this._client.post("/videos/characters", mt({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  downloadContent(e, t = {}, n) {
    return this._client.get(T`/videos/${e}/content`, {
      query: t,
      ...n,
      headers: F([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
  edit(e, t) {
    return this._client.post("/videos/edits", mt({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  extend(e, t) {
    return this._client.post("/videos/extensions", mt({
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
    return this._client.post(T`/videos/${e}/remix`, ki({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, wn, jg, jo, em = class extends k {
  constructor() {
    super(...arguments), wn.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, r = 300) {
    return await this.verifySignature(e, t, n, r), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, r = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    C(this, wn, "m", jg).call(this, n);
    const o = F([t]).values, i = C(this, wn, "m", jo).call(this, o, "webhook-signature"), a = C(this, wn, "m", jo).call(this, o, "webhook-timestamp"), u = C(this, wn, "m", jo).call(this, o, "webhook-id"), c = parseInt(a, 10);
    if (isNaN(c)) throw new Er("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > r) throw new Er("Webhook timestamp is too old");
    if (c > d + r) throw new Er("Webhook timestamp is too new");
    const h = i.split(" ").map((y) => y.startsWith("v1,") ? y.substring(3) : y), f = n.startsWith("whsec_") ? Buffer.from(n.replace("whsec_", ""), "base64") : Buffer.from(n, "utf-8"), p = u ? `${u}.${a}.${e}` : `${a}.${e}`, g = await crypto.subtle.importKey("raw", f, {
      name: "HMAC",
      hash: "SHA-256"
    }, !1, ["verify"]);
    for (const y of h) try {
      const _ = Buffer.from(y, "base64");
      if (await crypto.subtle.verify("HMAC", g, _, new TextEncoder().encode(p))) return;
    } catch {
      continue;
    }
    throw new Er("The given webhook signature does not match the expected signature");
  }
};
wn = /* @__PURE__ */ new WeakSet(), jg = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, jo = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const r = t.get(n);
  if (r == null) throw new Error(`Missing required header: ${n}`);
  return r;
};
var ia, rl, ei, tm, Tb = "workload-identity-auth", W = class {
  constructor({ baseURL: e = $t("OPENAI_BASE_URL"), apiKey: t = $t("OPENAI_API_KEY") ?? null, adminAPIKey: n = $t("OPENAI_ADMIN_KEY") ?? null, organization: r = $t("OPENAI_ORG_ID") ?? null, project: o = $t("OPENAI_PROJECT_ID") ?? null, webhookSecret: i = $t("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: a, ...u } = {}) {
    ia.add(this), ei.set(this, void 0), this.completions = new bg(this), this.chat = new qa(this), this.embeddings = new xg(this), this.files = new Ng(this), this.images = new Fg(this), this.audio = new so(this), this.moderations = new qg(this), this.models = new Og(this), this.fineTuning = new zn(this), this.graders = new el(this), this.vectorStores = new Bi(this), this.webhooks = new em(this), this.beta = new Wn(this), this.batches = new vg(this), this.uploads = new nl(this), this.admin = new Va(this), this.responses = new Oi(this), this.realtime = new Fi(this), this.conversations = new za(this), this.evals = new Xa(this), this.containers = new Wa(this), this.skills = new qi(this), this.videos = new Zg(this);
    const c = {
      apiKey: t,
      adminAPIKey: n,
      organization: r,
      project: o,
      webhookSecret: i,
      workloadIdentity: a,
      ...u,
      baseURL: e || "https://api.openai.com/v1"
    };
    if (t && a) throw new G("The `apiKey` and `workloadIdentity` options are mutually exclusive");
    if (!t && !n && !a) throw new G("Missing credentials. Please pass an `apiKey`, `workloadIdentity`, `adminAPIKey`, or set the `OPENAI_API_KEY` or `OPENAI_ADMIN_KEY` environment variable.");
    if (!c.dangerouslyAllowBrowser && vI()) throw new G(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = c.baseURL, this.timeout = c.timeout ?? rl.DEFAULT_TIMEOUT, this.logger = c.logger ?? console;
    const d = "warn";
    this.logLevel = d, this.logLevel = pd(c.logLevel, "ClientOptions.logLevel", this) ?? pd($t("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? d, this.fetchOptions = c.fetchOptions, this.maxRetries = c.maxRetries ?? 2, this.fetch = c.fetch ?? vp(), V(this, ei, wI, "f");
    const h = $t("OPENAI_CUSTOM_HEADERS");
    if (h) {
      const f = {};
      for (const p of h.split(`
`)) {
        const g = p.indexOf(":");
        g >= 0 && (f[p.substring(0, g).trim()] = p.substring(g + 1).trim());
      }
      c.defaultHeaders = F([f, c.defaultHeaders]);
    }
    this._options = c, a && (this._workloadIdentityAuth = new GI(a, this.fetch)), this.apiKey = typeof t == "string" ? t : null, this.adminAPIKey = n, this.organization = r, this.project = o, this.webhookSecret = i;
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
    return F([t.bearerAuth ? await this.bearerAuth(e) : null, t.adminAPIKeyAuth ? await this.adminAPIKeyAuth(e) : null]);
  }
  async bearerAuth(e) {
    if (this._workloadIdentityAuth) return F([{ Authorization: `Bearer ${await this._workloadIdentityAuth.getToken()}` }]);
    if (this.apiKey != null)
      return F([{ Authorization: `Bearer ${this.apiKey}` }]);
  }
  async adminAPIKeyAuth(e) {
    if (this.adminAPIKey != null)
      return F([{ Authorization: `Bearer ${this.adminAPIKey}` }]);
  }
  stringifyQuery(e) {
    return xI(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Sn}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${ap()}`;
  }
  makeStatusError(e, t, n, r) {
    return Ce.generate(e, t, n, r);
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
    const r = !C(this, ia, "m", tm).call(this) && n || this.baseURL, o = gI(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), a = Object.fromEntries(o.searchParams);
    return (!rd(i) || !rd(a)) && (t = {
      ...a,
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
    return new xp(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const r = await e, o = r.maxRetries ?? this.maxRetries;
    t == null && (t = o), await this.prepareOptions(r);
    const { req: i, url: a, timeout: u } = await this.buildRequest(r, { retryCount: o - t });
    await this.prepareRequest(i, {
      url: a,
      options: r
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, h = Date.now();
    if (Se(this).debug(`[${c}] sending request`, jt({
      retryOfRequestLogID: n,
      method: r.method,
      url: a,
      options: r,
      headers: i.headers
    })), r.signal?.aborted) throw new je();
    const f = r.__security ?? { bearerAuth: !0 }, p = new AbortController(), g = await this.fetchWithAuth(a, i, u, p, f).catch(Vs), y = Date.now();
    if (g instanceof globalThis.Error) {
      const v = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new je();
      const E = Hs(g) || /timed? ?out/i.test(String(g) + ("cause" in g ? String(g.cause) : ""));
      if (t)
        return Se(this).info(`[${c}] connection ${E ? "timed out" : "failed"} - ${v}`), Se(this).debug(`[${c}] connection ${E ? "timed out" : "failed"} (${v})`, jt({
          retryOfRequestLogID: n,
          url: a,
          durationMs: y - h,
          message: g.message
        })), this.retryRequest(r, t, n ?? c);
      throw Se(this).info(`[${c}] connection ${E ? "timed out" : "failed"} - error; no more retries left`), Se(this).debug(`[${c}] connection ${E ? "timed out" : "failed"} (error; no more retries left)`, jt({
        retryOfRequestLogID: n,
        url: a,
        durationMs: y - h,
        message: g.message
      })), g instanceof _p || g instanceof hI ? g : E ? new Na() : new xi({
        message: Sb(g),
        cause: g
      });
    }
    const _ = `[${c}${d}${[...g.headers.entries()].filter(([v]) => v === "x-request-id").map(([v, E]) => ", " + v + ": " + JSON.stringify(E)).join("")}] ${i.method} ${a} ${g.ok ? "succeeded" : "failed"} with status ${g.status} in ${y - h}ms`;
    if (!g.ok) {
      if (g.status === 401 && this._workloadIdentityAuth && f.bearerAuth && !r.__metadata?.hasStreamingBody && !r.__metadata?.workloadIdentityTokenRefreshed)
        return await ad(g.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
          ...r,
          __metadata: {
            ...r.__metadata,
            workloadIdentityTokenRefreshed: !0
          }
        }, t, n ?? c);
      const v = await this.shouldRetry(g);
      if (t && v) {
        const L = `retrying, ${t} attempts remaining`;
        return await ad(g.body), Se(this).info(`${_} - ${L}`), Se(this).debug(`[${c}] response error (${L})`, jt({
          retryOfRequestLogID: n,
          url: g.url,
          status: g.status,
          headers: g.headers,
          durationMs: y - h
        })), this.retryRequest(r, t, n ?? c, g.headers);
      }
      const E = v ? "error; no more retries left" : "error; not retryable";
      Se(this).info(`${_} - ${E}`);
      const b = await g.text().catch((L) => Vs(L).message), R = _I(b), P = R ? void 0 : b;
      throw Se(this).debug(`[${c}] response error (${E})`, jt({
        retryOfRequestLogID: n,
        url: g.url,
        status: g.status,
        headers: g.headers,
        message: P,
        durationMs: Date.now() - h
      })), this.makeStatusError(g.status, R, P, g.headers);
    }
    return Se(this).info(_), Se(this).debug(`[${c}] response start`, jt({
      retryOfRequestLogID: n,
      url: g.url,
      status: g.status,
      headers: g.headers,
      durationMs: y - h
    })), {
      response: g,
      options: r,
      controller: p,
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
    return new OI(this, n, e);
  }
  async fetchWithAuth(e, t, n, r, o = {
    bearerAuth: !0,
    adminAPIKeyAuth: !0
  }) {
    if (this._workloadIdentityAuth && o.bearerAuth) {
      const i = t.headers, a = i.get("Authorization");
      if (!a || a === `Bearer ${Tb}`) {
        const u = await this._workloadIdentityAuth.getToken();
        i.set("Authorization", `Bearer ${u}`);
      }
    }
    return await this.fetchWithTimeout(e, t, n, r);
  }
  async fetchWithTimeout(e, t, n, r) {
    const { signal: o, method: i, ...a } = t || {}, u = this._makeAbort(r);
    o && o.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && a.body instanceof globalThis.ReadableStream || typeof a.body == "object" && a.body !== null && Symbol.asyncIterator in a.body, h = {
      signal: r.signal,
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
  async retryRequest(e, t, n, r) {
    let o;
    const i = r?.get("retry-after-ms");
    if (i) {
      const u = parseFloat(i);
      Number.isNaN(u) || (o = u);
    }
    const a = r?.get("retry-after");
    if (a && !o) {
      const u = parseFloat(a);
      Number.isNaN(u) ? o = Date.parse(a) - Date.now() : o = u * 1e3;
    }
    if (o === void 0) {
      const u = e.maxRetries ?? this.maxRetries;
      o = this.calculateDefaultRetryTimeoutMillis(t, u);
    }
    return await oo(o), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const o = t - e;
    return Math.min(0.5 * Math.pow(2, o), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: r, path: o, query: i, defaultBaseURL: a } = n, u = this.buildURL(o, i, a);
    "timeout" in n && yI("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    let o = {};
    this.idempotencyHeader && t !== "get" && (e.idempotencyKey || (e.idempotencyKey = this.defaultIdempotencyKey()), o[this.idempotencyHeader] = e.idempotencyKey);
    const i = F([
      o,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(r),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...EI(),
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
    const n = F([t]), r = typeof globalThis.ReadableStream < "u" && e instanceof globalThis.ReadableStream, o = !r && (typeof e == "string" || e instanceof ArrayBuffer || ArrayBuffer.isView(e) || typeof globalThis.Blob < "u" && e instanceof globalThis.Blob || e instanceof URLSearchParams || e instanceof FormData);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || r ? {
      bodyHeaders: void 0,
      body: e,
      isStreamingBody: !o
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: Tp(e),
      isStreamingBody: !0
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e),
      isStreamingBody: !1
    } : {
      ...C(this, ei, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
rl = W, ei = /* @__PURE__ */ new WeakMap(), ia = /* @__PURE__ */ new WeakSet(), tm = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
W.OpenAI = rl;
W.DEFAULT_TIMEOUT = 6e5;
W.OpenAIError = G;
W.APIError = Ce;
W.APIConnectionError = xi;
W.APIConnectionTimeoutError = Na;
W.APIUserAbortError = je;
W.NotFoundError = dp;
W.ConflictError = fp;
W.RateLimitError = pp;
W.BadRequestError = lp;
W.AuthenticationError = up;
W.InternalServerError = gp;
W.PermissionDeniedError = cp;
W.UnprocessableEntityError = hp;
W.InvalidWebhookSignatureError = Er;
W.toFile = WI;
W.Completions = bg;
W.Chat = qa;
W.Embeddings = xg;
W.Files = Ng;
W.Images = Fg;
W.Audio = so;
W.Moderations = qg;
W.Models = Og;
W.FineTuning = zn;
W.Graders = el;
W.VectorStores = Bi;
W.Webhooks = em;
W.Beta = Wn;
W.Batches = vg;
W.Uploads = nl;
W.Admin = Va;
W.Responses = Oi;
W.Realtime = Fi;
W.Conversations = za;
W.Evals = Xa;
W.Containers = Wa;
W.Skills = qi;
W.Videos = Zg;
function Sb(e) {
  if (Eb(e)) return "Connection error. This may be caused by passing an undici dispatcher, such as ProxyAgent, that is incompatible with the fetch implementation. If you are using undici's ProxyAgent, pass the fetch implementation from the same undici package: import { fetch, ProxyAgent } from 'undici'; new OpenAI({ fetch, fetchOptions: { dispatcher: new ProxyAgent(...) } });";
}
function Eb(e) {
  let t = e;
  for (let n = 0; n < 8 && t && typeof t == "object"; n++) {
    const r = t;
    if (r.code === "UND_ERR_INVALID_ARG" && typeof r.message == "string" && r.message.includes("invalid onRequestStart method")) return !0;
    t = r.cause;
  }
  return !1;
}
function Md(e = "", t = 0) {
  let n = 0;
  for (let r = t - 1; r >= 0 && e[r] === "\\"; r -= 1) n += 1;
  return n % 2 === 1;
}
function wb(e = "") {
  return /^[0-9a-fA-F]{4}$/.test(e);
}
function Cb(e = "") {
  return /^[dD][89a-bA-B][0-9a-fA-F]{2}$/.test(e);
}
function Ib(e = "") {
  return /^[dD][c-fC-F][0-9a-fA-F]{2}$/.test(e);
}
function bb(e = "") {
  const t = String(e ?? "");
  let n = "", r = 0;
  for (; r < t.length; ) {
    const o = t.slice(r, r + 2), i = t.slice(r + 2, r + 6);
    if (o !== "\\u" || Md(t, r) || !wb(i)) {
      n += t[r] || "", r += 1;
      continue;
    }
    const a = r + 6, u = t.slice(a + 2, a + 6);
    if (Cb(i) && t.slice(a, a + 2) === "\\u" && !Md(t, a) && Ib(u)) {
      const c = Number.parseInt(i, 16), d = Number.parseInt(u, 16), h = 65536 + (c - 55296 << 10) + (d - 56320);
      n += String.fromCodePoint(h), r += 12;
      continue;
    }
    n += String.fromCharCode(Number.parseInt(i, 16)), r += 6;
  }
  return n;
}
function Pb(e = "") {
  let t = String(e ?? "").trim();
  return t.endsWith(",") && (t = t.slice(0, -1).trimEnd()), t.startsWith('\\"') && (t = t.slice(2)), t.endsWith('\\"') && (t = t.slice(0, -2)), t.startsWith('"') && (t = t.slice(1)), t.endsWith('"') && (t = t.slice(0, -1)), bb(t.replace(/\r\n/g, `
`).replace(/\\r/g, "\r").replace(/\\n/g, `
`).replace(/\\t/g, "	").replace(/\\"/g, '"')).replace(/\\\\/g, "\\");
}
function Rb(e = "") {
  return String(e || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function ol(e = "", t = "", n = 0) {
  const r = new RegExp(`(^|[^A-Za-z0-9_])(?:\\\\?")?${Rb(t)}(?:\\\\?")?\\s*:`, "i"), o = String(e || "").slice(Math.max(0, n)).match(r);
  if (!o || o.index === void 0) return null;
  const i = o[1]?.length || 0;
  return {
    key: t,
    index: Math.max(0, n) + o.index + i,
    end: Math.max(0, n) + o.index + o[0].length
  };
}
function xb(e = "", t = [], n = 0) {
  return t.map((r) => ol(e, r, n)).filter(Boolean).sort((r, o) => r.index - o.index)[0] || null;
}
function at(e = "", t = "", n = []) {
  const r = String(e || ""), o = ol(r, t);
  if (!o) return;
  let i = o.end;
  for (; /\s/.test(r[i] || ""); ) i += 1;
  r[i] === '"' && (i += 1);
  const a = xb(r, n.filter((d) => d !== t), i);
  let u = a ? a.index : r.length;
  if (a) {
    const d = r.lastIndexOf(",", a.index);
    d >= i && (u = d);
  }
  let c = r.slice(i, u).trim();
  return a || (c = c.replace(/\}\s*$/, "").trimEnd()), Pb(c);
}
function Tt(e = "") {
  const t = String(e ?? "").trim();
  return /^-?\d+(?:\.\d+)?$/.test(t) ? Number(t) : /^true$/i.test(t) ? !0 : /^false$/i.test(t) ? !1 : /^null$/i.test(t) ? null : t;
}
var kr = {
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
}, Mb = [
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
function Nd(e = "", t = [], n = []) {
  for (const r of t) {
    const o = at(e, r, n);
    if (o !== void 0) return o;
  }
}
function Nb(e = "", t = "") {
  if (t === "Read") {
    const n = kr.Read, r = {};
    return n.forEach((o, i) => {
      const a = at(e, o, n.slice(i + 1));
      a !== void 0 && (r[o] = Tt(a));
    }), r.filePath === void 0 && r.path !== void 0 && (r.filePath = r.path, delete r.path), r.filePath === void 0 && r.scope !== void 0 && (r.filePath = r.scope, delete r.scope), Object.keys(r).length ? r : null;
  }
  if (t === "Write") {
    const n = {}, r = Nd(e, ["filePath", "path"], ["content"]), o = at(e, "content", []);
    return r !== void 0 && (n.filePath = Tt(r)), o !== void 0 && (n.content = Tt(o)), Object.keys(n).length ? n : null;
  }
  if (t === "Edit") {
    const n = {}, r = Nd(e, ["filePath", "path"], ["edits"]), o = at(e, "edits", []);
    return r !== void 0 && (n.filePath = Tt(r)), o !== void 0 && (n.edits = Tt(o)), Object.keys(n).length ? n : null;
  }
  if (t === "Grep") {
    const n = kr.Grep, r = {};
    return n.forEach((o) => {
      const i = at(e, o, n.filter((a) => a !== o));
      i !== void 0 && (r[o] = Tt(i));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.path === void 0 && r.scope !== void 0 && (r.path = r.scope), Object.keys(r).length ? r : null;
  }
  if (t === "MemoryGrep") {
    const n = kr.MemoryGrep, r = {};
    return n.forEach((o) => {
      const i = at(e, o, n.filter((a) => a !== o));
      i !== void 0 && (r[o] = Tt(i));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.path === void 0 && r.scope !== void 0 && (r.path = r.scope), r.regex === void 0 && r.useRegex !== void 0 && (r.regex = r.useRegex), Object.keys(r).length ? r : null;
  }
  if (t === "ChatHistory") {
    const n = kr.ChatHistory, r = {};
    return n.forEach((o) => {
      const i = at(e, o, n.filter((a) => a !== o));
      i !== void 0 && (r[o] = Tt(i));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.regex === void 0 && r.useRegex !== void 0 && (r.regex = r.useRegex), Object.keys(r).length ? r : null;
  }
  return null;
}
function kb(e = "", t = "") {
  const n = String(e || "").trim();
  if (!n) return null;
  try {
    const a = JSON.parse(n);
    if (a && typeof a == "object" && !Array.isArray(a)) return a;
  } catch {
  }
  const r = Nb(n, t);
  if (r) return r;
  const o = kr[t] || Mb, i = {};
  return o.forEach((a, u) => {
    const c = at(n, a, o.slice(u + 1));
    c !== void 0 && (i[a] = Tt(c));
  }), Object.keys(i).length ? i : null;
}
function Db(e = "", t = "") {
  const n = kb(e, t);
  return n ? JSON.stringify(n) : "";
}
function nm(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function st(e, t, n) {
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
function rm(e) {
  if (typeof e == "string") return e;
  if (e == null) return "{}";
  try {
    return JSON.stringify(e);
  } catch {
    return "{}";
  }
}
function om(e, t = "") {
  if (e && typeof e == "object" && !Array.isArray(e)) return JSON.stringify(e);
  const n = typeof e == "string" ? e : rm(e);
  return Db(n, t) || JSON.stringify(nm(n));
}
function $b(e = "") {
  const t = String(e || ""), n = ol(t, "arguments");
  if (!n) return "";
  let r = n.end;
  for (; /\s/.test(t[r] || ""); ) r += 1;
  const o = t[r] || "";
  return o === "{" ? t.slice(r).replace(/\}\s*$/, "").trimEnd() : o === '"' ? t.slice(r + 1).replace(/"\s*\}\s*$/, "").trimEnd() : t.slice(r).replace(/\}\s*$/, "").trimEnd();
}
function Lb(e = "", t = 0) {
  const n = String(e || "").trim(), r = at(n, "name", ["id", "arguments"]) || at(n, "toolName", ["id", "arguments"]) || "", o = at(n, "id", [
    "name",
    "toolName",
    "arguments"
  ]) || `tool-call-${t + 1}`, i = $b(n);
  return !r || !i ? null : {
    id: o,
    name: r,
    arguments: om(i, r)
  };
}
function Ub(e, t = 0, n = "openai-tool") {
  if (!ee(e)) return null;
  const r = ee(e.function) ? e.function : null, o = String(r?.name || "").trim();
  if (!o) return null;
  const i = $e(e) || {};
  return delete i.index, i.id = String(i.id || `${n}-${t + 1}`), i.type = "function", i.function = {
    ...$e(r) || {},
    name: o,
    arguments: rm(r.arguments)
  }, i;
}
function Kr(e = [], t = "openai-tool") {
  return (Array.isArray(e) ? e : []).map((n, r) => Ub(n, r, t)).filter(Boolean);
}
function Jr(e, t) {
  return Array.isArray(e) ? e.some((n) => Jr(n, t)) : ee(e) ? Object.entries(e).some(([n, r]) => String(n || "").replace(/[_-]/g, "").toLowerCase() === "thoughtsignature" ? t(r) : (Array.isArray(r) || ee(r)) && Jr(r, t)) : !1;
}
function Fb(e) {
  return Jr(e, (t) => typeof t == "string" && t.length > 0);
}
function sa(e) {
  return Jr(e, () => !0);
}
function Ob(e) {
  return Jr(e, (t) => typeof t != "string" || t.length === 0);
}
function qb(e = {}) {
  return Array.isArray(e?.tool_calls) && e.tool_calls.some((t) => Fb(t));
}
var kd = /* @__PURE__ */ new WeakSet();
function il(e) {
  if (!ee(e)) return null;
  const t = $e(e) || {};
  if (typeof t.content == "string" && /<tool_call\b/i.test(t.content) && (t.content = rn(nn(t.content).cleaned)), Array.isArray(t.tool_calls)) {
    const n = Kr(t.tool_calls);
    n.length ? t.tool_calls = n : delete t.tool_calls;
  }
  return t;
}
function sl(e = [], t = "openai-tool") {
  return Kr(e, t).map((n, r) => ({
    id: n.id || `${t}-${Date.now()}-${r + 1}`,
    name: n.function.name,
    arguments: n.function.arguments
  }));
}
function al(e) {
  return typeof e == "string" ? e : Array.isArray(e) ? e.map((t) => t ? typeof t == "string" ? t : t.text || t.content || "" : "").filter(Boolean).join(`
`) : "";
}
function nn(e = "") {
  const t = [];
  return {
    cleaned: String(e || "").replace(/<think>([\s\S]*?)<\/think>/gi, (n, r) => (st(t, "思考块", r), "")).trim(),
    thoughts: t
  };
}
function rn(e = "") {
  const t = String(e || ""), n = t.search(/<tool_call\b/i);
  return n < 0 ? t.trim() : t.slice(0, n).trim();
}
function aa(e = "") {
  const t = String(e || "");
  return /<tool_call\b/i.test(t) ? [{
    id: "tagged-json-draft",
    name: t.match(/["']?name["']?\s*:\s*["']([^"']+)/i)?.[1] || "工具调用",
    arguments: "{}",
    draft: !0
  }] : [];
}
function en(e, t, n) {
  if (t) {
    if (typeof t == "string") {
      st(e, n, t);
      return;
    }
    if (Array.isArray(t)) {
      t.forEach((r) => en(e, r, n));
      return;
    }
    typeof t == "object" && (typeof t.text == "string" && st(e, n, t.text), typeof t.content == "string" && st(e, n, t.content), typeof t.reasoning_content == "string" && st(e, n, t.reasoning_content), typeof t.thinking == "string" && st(e, n, t.thinking), Array.isArray(t.summary) && t.summary.forEach((r) => {
      if (typeof r == "string") {
        st(e, "推理摘要", r);
        return;
      }
      r && typeof r == "object" && st(e, "推理摘要", r.text || r.content || "");
    }));
  }
}
function Ut(e = {}, t = {}) {
  const n = [];
  return en(n, e.reasoning_content, "推理文本"), en(n, e.reasoning, "推理文本"), en(n, e.reasoning_text, "推理文本"), en(n, e.thinking, "思考块"), en(n, t.reasoning_content, "推理文本"), en(n, t.reasoning, "推理文本"), Array.isArray(e.content) && e.content.forEach((r) => {
    if (!(!r || typeof r != "object")) {
      if (r.type === "reasoning_text") {
        st(n, "推理文本", r.text);
        return;
      }
      if (r.type === "summary_text") {
        st(n, "推理摘要", r.text);
        return;
      }
      (r.type === "thinking" || r.type === "reasoning" || r.type === "reasoning_content") && st(n, "思考块", r.text || r.content || r.reasoning || "");
    }
  }), n;
}
function Or(e = "") {
  const t = [/<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g], n = [];
  return t.forEach((r) => {
    [...e.matchAll(r)].forEach((o, i) => {
      try {
        const a = JSON.parse(o[1]);
        n.push({
          id: a.id || `tool-call-${i + 1}`,
          name: String(a.name || ""),
          arguments: om(a.arguments, a.name)
        });
      } catch {
        const a = Lb(o[1], i);
        a && n.push(a);
      }
    });
  }), n.filter((r) => r.name);
}
function ll(e) {
  const t = e?.providerPayload?.openaiCompatibleMessage;
  return !t || typeof t != "object" || Array.isArray(t) ? null : il(t);
}
function Bb(e = []) {
  for (let t = e.length - 1; t >= 0; t -= 1) if (e[t]?.role === "user") return t;
  return -1;
}
function Gb(e = {}) {
  const t = Kr(e?.tool_calls);
  if (t.length) return t;
  const n = Kr(ll(e)?.tool_calls);
  return n.length ? n : [];
}
function Hb(e = "") {
  return /deepseek/i.test(String(e || ""));
}
function Vb(e = "") {
  return /claude/i.test(String(e || ""));
}
function im(e = [], t = "") {
  if (!Vb(t)) return e;
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
function Dd(e, t = "") {
  return !ee(e) || !Hb(t) || !Array.isArray(e.tool_calls) || !e.tool_calls.length || Object.prototype.hasOwnProperty.call(e, "reasoning_content") ? e : {
    ...e,
    reasoning_content: ""
  };
}
var la = /* @__PURE__ */ new Set([
  "content",
  "refusal",
  "arguments",
  "reasoning_content",
  "reasoning_text",
  "thinking",
  "text"
]);
function Kb(e = [], t = []) {
  const n = Array.isArray(e) ? e.map((r) => $e(r) || {}) : [];
  return (Array.isArray(t) ? t : []).forEach((r, o) => {
    const i = $e(r) || {}, a = Number.isInteger(Number(r?.index)) ? Number(r.index) : o, u = n[a];
    n[a] = ee(u) ? ao(u, i, "tool_call") : i;
  }), n.filter((r) => r !== void 0);
}
function ao(e, t, n = "") {
  if (t === void 0) return e;
  if (e === void 0) return $e(t);
  if (t === null && la.has(String(n || ""))) return e;
  if (n === "tool_calls" && Array.isArray(e) && Array.isArray(t)) return Kb(e, t);
  if (typeof e == "string" && typeof t == "string")
    return la.has(String(n || "")) ? e === t ? e : t.startsWith(e) ? t : e.startsWith(t) ? e : `${e}${t}` : e === t ? e : $e(t);
  if (Array.isArray(e) && Array.isArray(t)) return e.concat($e(t) || []);
  if (ee(e) && ee(t)) {
    const r = { ...e };
    return Object.entries(t).forEach(([o, i]) => {
      r[o] = ao(r[o], i, o);
    }), r;
  }
  return $e(t);
}
function mi(e = {}, t = {}) {
  const n = ee(e) ? $e(e) || {} : {}, r = ee(t) ? $e(t) || {} : {};
  return delete r.message, delete r.finish_reason, delete r.index, delete r.logprobs, delete r.delta, Object.entries(r).forEach(([o, i]) => {
    n[o] = ao(n[o], i, o);
  }), n.role || (n.role = "assistant"), il(n) || { role: "assistant" };
}
function qr(e, t = {}) {
  const n = il(mi(e, t));
  if (!(!n || typeof n != "object" || Array.isArray(n)))
    return { openaiCompatibleMessage: n };
}
function Jb(e = {}, t = {}) {
  return ee(e) ? ee(t) ? ao($e(e) || {}, t, "") : $e(e) : $e(t);
}
function ua(e, t = "") {
  const n = Array.isArray(e.messages) ? e.messages : [], r = Bb(n), o = [];
  let i = !1;
  n.forEach((u, c) => {
    if (i) {
      if (u?.role === "tool") return;
      i = !1;
    }
    const d = u?.role === "assistant", h = d ? u?.providerPayload?.openaiCompatibleMessage : null, f = am(Array.isArray(h?.tool_calls) && h.tool_calls.some((E) => sa(E)) ? h.tool_calls : d && Array.isArray(u?.tool_calls) && u.tool_calls.some((E) => sa(E)) ? u.tool_calls : null);
    if (f) {
      const E = ee(h) ? h : u;
      (!ee(E) || !kd.has(E)) && (ee(E) && kd.add(E), console.warn("[LittleWhiteBox/OpenAI-compatible] skipped corrupted signed tool-call history", {
        code: "openai_compatible_signed_tool_call_history_corrupted",
        toolIndex: f.index,
        toolName: f.toolName,
        reason: f.reason
      })), i = !0;
      return;
    }
    const p = d ? Kr(u?.tool_calls) : [], g = d ? ll(u) : null, y = Array.isArray(g?.tool_calls) ? g.tool_calls : [], _ = y.length > 0 && qb(g);
    if (y.length && c > r) {
      o.push(Dd({
        ...g,
        ...p.length && !_ ? { tool_calls: p } : {}
      }, t));
      return;
    }
    const v = {
      role: u.role,
      content: u.content
    };
    u.role === "tool" && u.tool_call_id && (v.tool_call_id = u.tool_call_id), _ ? v.tool_calls = y : p.length && (v.tool_calls = p), o.push(Dd(v, t));
  });
  const a = String(e.systemPrompt || "").trim();
  return a && o[0]?.role !== "system" && o.unshift({
    role: "system",
    content: a
  }), im(o, t);
}
function $d(e) {
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
function ca(e, t = "") {
  const n = /* @__PURE__ */ new Map(), r = [];
  return (Array.isArray(e.messages) ? e.messages : []).forEach((o) => {
    if (o.role === "assistant") {
      const i = Gb(o);
      if (i.length) {
        const a = ll(o), u = typeof a?.content == "string" ? a.content : String(o.content || ""), c = i.map((d, h) => {
          const f = d.function?.name || "", p = d.id || `tool-call-${h + 1}`;
          return f && n.set(p, f), `<tool_call>${JSON.stringify({
            id: p,
            name: f,
            arguments: nm(d.function?.arguments || "{}")
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
      const a = String(o.content || "");
      r.push({
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
    r.push({
      role: o.role,
      content: o.content
    });
  }), !r.length || r[0].role !== "system" ? r.unshift({
    role: "system",
    content: $d(e)
  }) : r[0] = {
    ...r[0],
    content: $d({
      ...e,
      systemPrompt: r[0].content || e.systemPrompt
    })
  }, im(r, t);
}
function Ld(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: j(e.reasoning) ? t.thoughts : [] } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function mr(e, t = []) {
  return j(e.reasoning) ? t : [];
}
function sm(e, t, n) {
  !e || !t || n === void 0 || (e[t] = ao(e[t], n, t));
}
function yi(e, t, n) {
  if (!(!e || !t || n === void 0)) {
    if (ee(n)) {
      const r = ee(e[t]) ? { ...e[t] } : {};
      Object.entries(n).forEach(([o, i]) => {
        yi(r, o, i);
      }), e[t] = r;
      return;
    }
    if (typeof n == "string" && la.has(t)) {
      e[t] = typeof e[t] == "string" ? `${e[t]}${n}` : n;
      return;
    }
    n === "" && e[t] || sm(e, t, n);
  }
}
function Wb(e, t = []) {
  !Array.isArray(t) || !t.length || (Array.isArray(e.tool_calls) || (e.tool_calls = []), t.forEach((n) => {
    const r = Number(n?.index ?? 0), o = { ...e.tool_calls[r] || {} };
    Object.entries(n || {}).forEach(([i, a]) => {
      if (i !== "index" && !(i === "function" && a == null)) {
        if (i === "function" && ee(a)) {
          o.function = ee(o.function) ? { ...o.function } : {}, Object.entries(a).forEach(([u, c]) => {
            yi(o.function, u, c);
          });
          return;
        }
        yi(o, i, a);
      }
    }), e.tool_calls[r] = o;
  }));
}
function da(e, t = {}) {
  if (!e || !t || typeof t != "object") return;
  Object.entries(t).forEach(([r, o]) => {
    r === "delta" || r === "finish_reason" || r === "index" || r === "logprobs" || sm(e, r, o);
  });
  const n = ee(t.delta) ? t.delta : {};
  Object.entries(n).forEach(([r, o]) => {
    if (r === "tool_calls") {
      Wb(e, o);
      return;
    }
    yi(e, r, o);
  });
}
function Mn(e = {}) {
  return al(e?.content);
}
function Nn(e = {}) {
  return sl(e?.tool_calls || []);
}
function zb(e) {
  if (typeof e != "string" || !e.trim()) return !1;
  try {
    return ee(JSON.parse(e));
  } catch {
    return !1;
  }
}
function am(e) {
  if (!Array.isArray(e) || !e.some((t) => sa(t))) return null;
  for (let t = 0; t < e.length; t += 1) {
    const n = e[t], r = ee(n?.function) ? n.function : null, o = String(r?.name || "").trim();
    let i = "";
    if (!ee(n) || !r ? i = "invalid_function_shape" : o ? zb(r.arguments) ? Ob(n) && (i = "invalid_thought_signature") : i = "invalid_function_arguments" : i = "missing_function_name", i) return {
      index: t,
      toolName: o,
      reason: i
    };
  }
  return null;
}
function kn(e = {}) {
  const t = am(e?.tool_calls);
  if (!t) return;
  const n = /* @__PURE__ */ new Error("openai_compatible_signed_tool_call_corrupted");
  throw n.toolIndex = t.index, n.toolName = t.toolName, n.reason = t.reason, n;
}
async function Yb(e, t) {
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
      const h = d.index, f = o.slice(0, h);
      o = o.slice(h + d[0].length);
      const p = f.split(/\r?\n/).filter((g) => g.startsWith("data:")).map((g) => g.slice(5).trimStart()).join(`
`).trim();
      !p || p === "[DONE]" || t(JSON.parse(p));
    }
  }
  const a = o.trim();
  if (a && a !== "[DONE]") {
    const u = a.split(/\r?\n/).filter((c) => c.startsWith("data:")).map((c) => c.slice(5).trimStart()).join(`
`).trim();
    u && u !== "[DONE]" && t(JSON.parse(u));
  }
}
var Xb = class {
  constructor(e) {
    this.config = e, this.client = new W({
      apiKey: e.apiKey,
      baseURL: String(e.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e) {
    const t = xe("openai-compatible", this.config, e.reasoning), n = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, r = !n && Array.isArray(e.tools) && e.tools.length ? e.tools : null, o = {
      model: this.config.model,
      messages: n ? ca(e, this.config.model) : ua(e, this.config.model),
      ...r ? {
        tools: r,
        tool_choice: e.toolChoice || "auto"
      } : {},
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    return !to({
      ...this.config,
      provider: "openai-compatible"
    }, t) && typeof e.temperature == "number" && (o.temperature = e.temperature), (t.mode === "on" || t.mode === "off") && (t.profileId.startsWith("openai-") || t.profileId === "kimi-k3" ? o.reasoning_effort = t.mode === "off" ? t.profileId === "kimi-k3" ? "off" : "none" : t.effort : t.profileId === "kimi-k2.5-k2.6" ? o.thinking = { type: t.mode === "off" ? "disabled" : "enabled" } : t.profileId === "deepseek-thinking" && (o.thinking = { type: t.mode === "off" ? "disabled" : "enabled" }, t.mode === "on" && (o.reasoning_effort = t.effort))), o;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", r = {
      ...t.body || this.buildRequestBody(e),
      ...n ? { stream: !0 } : {}
    }, o = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), i = xe("openai-compatible", this.config, e.reasoning), a = {
      ...Object.hasOwn(r, "reasoning_effort") ? { reasoning_effort: r.reasoning_effort } : {},
      ...Object.hasOwn(r, "thinking") ? { thinking: r.thinking } : {}
    };
    return { ...Hr({
      provider: "openai-compatible",
      model: this.config.model,
      transport: "openai-compatible",
      url: `${o}/chat/completions`,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.config.apiKey ? `Bearer ${this.config.apiKey}` : ""
      },
      body: r,
      sdk: n ? "client.chat.completions.create(..., { stream: true })" : "client.chat.completions.create",
      effectiveConfig: qt(e, {
        profileId: i.profileId,
        effectiveMode: i.mode,
        effort: r.reasoning_effort,
        controlFields: a
      })
    }) };
  }
  async streamNativeChatCompletions(e, t) {
    const n = `${String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, "")}/chat/completions`, r = await fetch(n, {
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
      const g = await r.text().catch(() => ""), y = new Error(g || `openai_compatible_stream_http_${r.status}`);
      throw y.status = r.status, y;
    }
    const o = { role: "assistant" };
    let i = "stop", a = this.config.model;
    await Yb(r, (g) => {
      a = g?.model || a;
      const y = g?.choices?.[0];
      da(o, y), y?.finish_reason && (i = y.finish_reason);
      const _ = nn(Mn(o)), v = Nn(o), E = v.length ? v : aa(_.cleaned);
      Ld(e, {
        text: v.length ? _.cleaned : rn(_.cleaned),
        thoughts: mr(e, Ut(o, y).concat(_.thoughts)),
        ...E.length ? { toolCalls: E } : {},
        ...!v.length && E.length ? { toolCallDraft: !0 } : {}
      });
    }), kn(o);
    const u = qr(o), c = Nn(o), d = nn(Mn(o)), h = Ut(o, {});
    d.thoughts.forEach((g) => h.push(g));
    const f = c.length ? [] : Or(d.cleaned), p = [...c, ...f];
    return {
      text: c.length ? d.cleaned : rn(d.cleaned),
      toolCalls: p,
      thoughts: mr(e, h),
      finishReason: i,
      model: a,
      provider: "openai-compatible",
      providerPayload: u
    };
  }
  async chat(e) {
    const t = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, n = typeof e.onStreamProgress == "function", r = this.buildRequestBody(e), o = this.inspectRequest(e, { body: r }), i = async (v) => {
      try {
        return await v(r);
      } catch (E) {
        throw E && typeof E == "object" && (E.requestInspection = o), E;
      }
    };
    if (n) {
      if (!t) return {
        ...await i((Q) => this.streamNativeChatCompletions(e, Q)),
        requestInspection: o
      };
      const v = await i((Q) => this.client.chat.completions.create({
        ...Q,
        stream: !0
      }, { signal: e.signal })), E = { role: "assistant" };
      let b = "stop", R = this.config.model, P;
      for await (const Q of v) {
        R = Q.model || R;
        const Z = Q.choices?.[0];
        da(E, Z), Z?.finish_reason && (b = Z.finish_reason);
        const X = nn(Mn(E)), Ae = Nn(E), Ye = Ae.length ? Ae : aa(X.cleaned);
        Ld(e, {
          text: Ae.length ? X.cleaned : rn(X.cleaned),
          thoughts: mr(e, Ut(E, Z).concat(X.thoughts)),
          ...Ye.length ? { toolCalls: Ye } : {},
          ...!Ae.length && Ye.length ? { toolCallDraft: !0 } : {}
        });
      }
      const L = (typeof v.finalChatCompletion == "function" ? await v.finalChatCompletion() : null)?.choices?.[0] || null, S = L?.message || E;
      kn(S);
      const O = Jb(E, mi(S, L || {}));
      kn(O), P = qr(O);
      const x = Nn(O), D = nn(Mn(O)), H = Ut(O, L || {});
      D.thoughts.forEach((Q) => H.push(Q));
      const z = x.length ? [] : Or(D.cleaned), ge = [...x, ...z];
      return {
        text: x.length ? D.cleaned : rn(D.cleaned),
        toolCalls: ge,
        thoughts: mr(e, H),
        finishReason: b,
        model: R,
        provider: "openai-compatible",
        providerPayload: P,
        requestInspection: o
      };
    }
    const a = await i((v) => this.client.chat.completions.create(v, { signal: e.signal })), u = a.choices?.[0] || {}, c = u.message || {};
    kn(c);
    const d = Ut(c, u), h = sl(c.tool_calls || []), f = nn(al(c.content));
    f.thoughts.forEach((v) => d.push(v));
    const p = h.length ? [] : Or(f.cleaned), g = [...h, ...p], y = h.length ? f.cleaned : rn(f.cleaned), _ = mi(c, u);
    return {
      text: y,
      toolCalls: g,
      thoughts: mr(e, d),
      finishReason: u.finish_reason || "stop",
      model: a.model || this.config.model,
      provider: "openai-compatible",
      providerPayload: qr(_),
      requestInspection: o
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
function lm(e, t) {
  return {
    type: "message",
    role: e,
    content: Qb(t)
  };
}
function _i(e) {
  return {
    role: "assistant",
    content: typeof e == "string" ? e : ""
  };
}
function Qb(e) {
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
function vi(e, t, n) {
  const r = String(n || "").trim();
  r && e.push({
    label: t,
    text: r
  });
}
function Ud(e, t = [], n = {}) {
  (t || []).forEach((r) => {
    if (!(!r || typeof r != "object")) {
      if (r.type === "reasoning_text") {
        vi(e, n.reasoning || "推理文本", r.text);
        return;
      }
      r.type === "summary_text" && vi(e, n.summary || "推理摘要", r.text);
    }
  });
}
function Zb(e = []) {
  const t = [];
  return (e || []).forEach((n) => {
    !n || typeof n != "object" || n.type === "reasoning" && (Ud(t, n.content, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }), Ud(t, n.summary, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }));
  }), t;
}
function jb(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function e0(e) {
  const t = e?.choices?.[0]?.message?.content;
  if (typeof t == "string" && t.trim()) return t.trim();
  if (typeof e?.output_text == "string" && e.output_text.trim()) return e.output_text.trim();
  const n = [];
  return (Array.isArray(e?.output) ? e.output : []).forEach((r) => {
    if (!(!r || typeof r != "object")) {
      if (r.type === "message" && Array.isArray(r.content)) {
        r.content.forEach((o) => {
          if (!(!o || typeof o != "object")) {
            if (o.type === "output_text" && typeof o.text == "string" && o.text.trim()) {
              n.push(o.text.trim());
              return;
            }
            o.type === "refusal" && typeof o.refusal == "string" && o.refusal.trim() && n.push(o.refusal.trim());
          }
        });
        return;
      }
      typeof r.text == "string" && r.text.trim() && n.push(r.text.trim());
    }
  }), n.join(`
`).trim();
}
function t0(e) {
  const t = e?.choices?.[0], n = t?.message?.content, r = String(t?.finish_reason || "");
  if (typeof n != "string" || !n.trim()) return null;
  const o = n.toLowerCase();
  return !o.includes("proxy error") || !o.includes("/responses") && !r.toLowerCase().includes("proxy error") ? null : n.trim();
}
function n0(e) {
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
        n.content?.trim() && t.push(_i(n.content)), n.tool_calls.forEach((r, o) => {
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
        t.push(_i(n.content || ""));
        continue;
      }
      t.push(n.role === "user" ? lm(n.role, n.content || "") : {
        role: n.role,
        content: typeof n.content == "string" ? n.content : ""
      });
    }
  return t;
}
function r0(e) {
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
      n.content?.trim() && t.push(_i(n.content)), n.tool_calls.forEach((r, o) => {
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
      t.push(_i(n.content || ""));
      continue;
    }
    t.push(n.role === "user" ? lm(n.role, n.content || "") : {
      role: n.role,
      content: typeof n.content == "string" ? n.content : ""
    });
  }
  return t;
}
function o0(e) {
  try {
    return new URL(String(e || "https://api.openai.com/v1")).hostname === "api.openai.com";
  } catch {
    return !1;
  }
}
function i0(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return t.includes("instructions") || t.includes("unsupported") || t.includes("unknown parameter") || t.includes("invalid input");
}
function s0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function fs(e, t) {
  const [n = "0", r = "0"] = String(e || "").split(":"), [o = "0", i = "0"] = String(t || "").split(":");
  return Number(n) - Number(o) || Number(r) - Number(i);
}
var a0 = class {
  constructor(e) {
    this.config = e, this.client = new W({
      apiKey: e.apiKey,
      baseURL: String(e.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e, t = !1) {
    const n = xe("openai-responses", this.config, e.reasoning), r = {
      model: this.config.model,
      instructions: t ? void 0 : jb(e) || void 0,
      input: t ? r0(e) : n0(e),
      ...Array.isArray(e.tools) && e.tools.length ? {
        tools: e.tools.map((o) => ({
          type: "function",
          name: o.function.name,
          description: o.function.description,
          parameters: o.function.parameters
        })),
        tool_choice: e.toolChoice || "auto"
      } : {},
      ...e.maxTokens ? { max_output_tokens: e.maxTokens } : {}
    };
    return !to({
      ...this.config,
      provider: "openai-responses"
    }, n) && typeof e.temperature == "number" && (r.temperature = e.temperature), (n.mode === "on" || n.mode === "off") && (r.reasoning = {
      effort: n.mode === "off" ? "none" : n.effort,
      ...n.mode === "on" && j(n) ? { summary: "auto" } : {}
    }, n.mode === "on" && (r.include = ["reasoning.encrypted_content"])), r;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", r = t.legacySystemInInput === !0, o = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), i = t.body || this.buildRequestBody(e, r), a = xe("openai-responses", this.config, e.reasoning);
    return Hr({
      provider: "openai-responses",
      model: this.config.model,
      transport: "openai-responses",
      url: `${o}/responses`,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.config.apiKey ? `Bearer ${this.config.apiKey}` : ""
      },
      body: i,
      sdk: n ? "client.responses.stream" : "client.responses.create",
      effectiveConfig: qt(e, {
        profileId: a.profileId,
        effectiveMode: i.reasoning?.effort === "none" ? "off" : i.reasoning ? "on" : "inherit",
        effort: i.reasoning?.effort,
        controlFields: {
          ...i.reasoning ? { reasoning: i.reasoning } : {},
          ...i.include ? { include: i.include } : {}
        }
      })
    });
  }
  async chat(e) {
    let t = this.inspectRequest(e);
    const n = (c) => {
      const d = t0(c);
      if (d) {
        const f = new Error(d);
        throw f.name = "ProxyEndpointError", f.rawDisplay = d, f;
      }
      const h = Array.isArray(c.output) ? c.output : [];
      return {
        output: h,
        thoughts: j(e.reasoning) ? Zb(h) : [],
        toolCalls: h.filter((f) => f.type === "function_call" && f.name).map((f, p) => ({
          id: f.call_id || `response-tool-${p + 1}`,
          name: f.name || "",
          arguments: f.arguments || "{}"
        })),
        text: e0(c)
      };
    }, r = async (c = !1) => {
      const d = this.buildRequestBody(e, c);
      return t = this.inspectRequest(e, {
        body: d,
        legacySystemInInput: c
      }), await this.client.responses.create(d, { signal: e.signal });
    }, o = async (c = !1) => {
      const d = this.buildRequestBody(e, c);
      t = this.inspectRequest(e, {
        body: d,
        legacySystemInInput: c
      });
      const h = this.client.responses.stream(d, { signal: e.signal }), f = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map(), y = () => {
        const _ = [];
        j(e.reasoning) && (Array.from(p.entries()).sort(([v], [E]) => fs(v, E)).forEach(([, v]) => vi(_, "推理文本", v)), Array.from(g.entries()).sort(([v], [E]) => fs(v, E)).forEach(([, v]) => vi(_, "推理摘要", v))), s0(e, {
          text: Array.from(f.entries()).sort(([v], [E]) => fs(v, E)).map(([, v]) => v).join(`
`).trim(),
          thoughts: _
        });
      };
      return h.on("response.output_text.delta", (_) => {
        const v = `${_.output_index}:${_.content_index}`;
        f.set(v, `${f.get(v) || ""}${_.delta}`), y();
      }), h.on("response.reasoning_text.delta", (_) => {
        const v = `${_.output_index}:${_.content_index}`;
        p.set(v, `${p.get(v) || ""}${_.delta}`), y();
      }), h.on("response.reasoning_summary_text.delta", (_) => {
        const v = `${_.output_index}:${_.summary_index}`;
        g.set(v, `${g.get(v) || ""}${_.delta}`), y();
      }), await h.finalResponse();
    }, i = !o0(this.config.baseUrl);
    let a, u;
    try {
      a = typeof e.onStreamProgress == "function" ? await o(!1) : await r(!1), u = n(a), i && !u.text && !u.toolCalls.length && (a = typeof e.onStreamProgress == "function" ? await o(!0) : await r(!0), u = n(a));
    } catch (c) {
      if (!i || !i0(c)) throw c;
      a = typeof e.onStreamProgress == "function" ? await o(!0) : await r(!0), u = n(a);
    }
    return {
      text: u.text,
      toolCalls: u.toolCalls,
      thoughts: u.thoughts,
      finishReason: a.incomplete_details?.reason || a.status || "stop",
      model: a.model || this.config.model,
      provider: "openai-responses",
      providerPayload: u.output.length ? { openAIResponseOutput: ul(u.output) || [] } : void 0,
      requestInspection: t
    };
  }
};
async function l0(e, t) {
  const n = e.body?.getReader?.();
  if (!n) throw new Error("host_chat_completions_stream_missing_body");
  const r = new TextDecoder();
  let o = "";
  const i = /\r?\n\r?\n/, a = (c) => {
    const d = c.split(/\r?\n/).filter((h) => h.startsWith("data:")).map((h) => h.slice(5).trimStart()).join(`
`).trim();
    !d || d === "[DONE]" || t(JSON.parse(d));
  };
  for (; ; ) {
    const { done: c, value: d } = await n.read();
    if (c) break;
    for (o += r.decode(d, { stream: !0 }); ; ) {
      const h = o.match(i);
      if (!h || typeof h.index != "number") break;
      const f = o.slice(0, h.index);
      o = o.slice(h.index + h[0].length), a(f);
    }
  }
  const u = o.trim();
  u && a(u);
}
var Yn = "openai", cl = "claude", dl = "makersuite", u0 = "/api/backends/chat-completions/status", c0 = "/api/backends/chat-completions/generate", um = Object.freeze({
  [cl]: "https://api.anthropic.com/v1",
  [dl]: "https://generativelanguage.googleapis.com"
}), cm = null;
function d0(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function f0(e, t) {
  const n = d0(e);
  return t === "claude" ? !n || /\/v\d[\w.-]*$/i.test(n) ? n : `${n}/v1` : t === "makersuite" ? n.replace(/\/v\d[\w.-]*$/i, "") : n;
}
function h0(e) {
  cm = typeof e == "function" ? e : null;
}
async function dm() {
  return {
    "Content-Type": "application/json",
    ...await Promise.resolve(cm?.() || {}),
    Accept: "application/json"
  };
}
function p0(e = {}) {
  const t = {};
  return Object.entries(e || {}).forEach(([n, r]) => {
    t[n] = /authorization|csrf|token|api[-_]?key/i.test(n) ? "[redacted]" : r;
  }), t;
}
async function lo(e = {}, t = !1) {
  const n = await dm(), r = {
    url: c0,
    method: "POST",
    headers: p0(n),
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
function g0(e = "") {
  return /^\s*(?:<!DOCTYPE\s+html\b|<html\b)/i.test(String(e || ""));
}
function m0(e = "") {
  return /invalid csrf token/i.test(String(e || ""));
}
function y0() {
  return "酒馆当前页面的 CSRF token 已失效，请按 F5 刷新并重新进入酒馆后再试。";
}
function Fd(e = "", t = 10) {
  const n = Number.parseInt(String(e || ""), t);
  return Number.isInteger(n) && n >= 0 && n <= 1114111 ? String.fromCodePoint(n) : "";
}
function Od(e = "") {
  return String(e || "").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#x([0-9a-f]+);?/gi, (t, n) => Fd(n, 16)).replace(/&#([0-9]+);?/g, (t, n) => Fd(n));
}
function _0(e = "") {
  const t = String(e || ""), n = Od((t.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/\s+/g, " ").trim(), r = Od(t.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(), o = n || r;
  return o.length > 240 ? `${o.slice(0, 237)}...` : o;
}
function v0(e = null) {
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
function A0(e = {}) {
  return e.status ? `HTTP ${e.status}${e.statusText ? ` ${e.statusText}` : ""}` : "";
}
function qn(e = "", t = "", n = null) {
  if (m0(e)) return y0();
  const r = v0(n);
  if (g0(e) || /\btext\/html\b/i.test(r.contentType)) {
    const o = A0(r), i = _0(e);
    return [
      "酒馆后端返回了非 JSON 的 HTML 页面",
      o ? `（${o}）` : "",
      i ? `：${i}` : ""
    ].join("");
  }
  return String(e || t || "").trim();
}
function fm(e = {}, t = Yn) {
  const n = f0(e.baseUrl, t), r = String(e.apiKey || "").trim(), o = um[t] || "", i = n || (r ? o : ""), a = { chat_completion_source: t || "openai" };
  return i && (a.reverse_proxy = i), r && (a.proxy_password = r), a;
}
function T0(e = {}) {
  return Object.keys(e).forEach((t) => {
    (e[t] === void 0 || e[t] === "") && delete e[t];
  }), e;
}
function S0(e = {}, t = Yn) {
  return fm(e, t);
}
function fl(e = {}, t = {}, n = [], r = !1, o = Yn) {
  return T0({
    ...fm(e, o),
    stream: !!r,
    messages: n,
    model: e.model,
    max_tokens: t.maxTokens,
    temperature: t.temperature,
    tools: Array.isArray(t.tools) && t.tools.length ? t.tools : void 0,
    tool_choice: Array.isArray(t.tools) && t.tools.length ? t.toolChoice || "auto" : void 0,
    use_sysprompt: o === "openai" ? void 0 : !0
  });
}
function E0(e = {}, t = {}, n = [], r = !1) {
  return fl(e, t, n, r, Yn);
}
function w0(e = {}, t = {}, n = [], r = !1) {
  return fl(e, t, n, r, cl);
}
function C0(e = {}, t = {}, n = [], r = !1) {
  return fl(e, t, n, r, dl);
}
async function I0(e = {}, t = Yn, n = {}) {
  const r = await fetch(u0, {
    method: "POST",
    headers: await dm(),
    body: JSON.stringify(S0(e, t)),
    signal: n.signal
  }), o = await r.text();
  let i = null;
  try {
    i = o ? JSON.parse(o) : {};
  } catch (u) {
    throw new Error(`酒馆后端模型列表拉取失败：${qn(o, String(u?.message || u), r)}`);
  }
  if (!r.ok || i?.error) {
    const u = qn(i?.message || i?.error?.message || o, `HTTP ${r.status}`, r);
    throw new Error(`酒馆后端模型列表拉取失败：${u}`);
  }
  const a = Array.isArray(i?.data) ? i.data.map((u) => String(u?.id || u?.name || "").trim()).filter(Boolean) : [];
  return [...new Set(a)];
}
async function hl(e = {}, t = {}) {
  const n = await lo(e, !1);
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
  } catch (a) {
    const u = /* @__PURE__ */ new Error(`酒馆后端生成失败：${qn(o, String(a?.message || a), r)}`);
    throw u.status = r.status, u.body = o, u;
  }
  if (!r.ok || i?.error) {
    const a = qn(i?.error?.message || i?.message || o, `HTTP ${r.status}`, r), u = /* @__PURE__ */ new Error(`酒馆后端生成失败：${a}`);
    throw u.status = r.status, u.error = i?.error, u;
  }
  return i;
}
async function pl(e = {}, t, n = {}) {
  const r = await lo(e, !0);
  typeof n.onRequest == "function" && n.onRequest(r);
  const o = await fetch(r.url, {
    method: r.method,
    headers: r.rawHeaders || r.headers,
    body: JSON.stringify(r.body),
    signal: n.signal
  });
  if (!o.ok) {
    const i = await o.text().catch(() => ""), a = new Error(qn(i, `酒馆后端流式生成失败：HTTP ${o.status}`, o));
    throw a.status = o.status, a.body = i, a;
  }
  typeof n.onResponseAccepted == "function" && n.onResponseAccepted(), await l0(o, (i) => {
    if (i?.error) {
      const a = qn(i.error?.message || i.message || JSON.stringify(i.error), "酒馆后端流式生成失败");
      throw new Error(a);
    }
    t(i);
  });
}
function un(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function b0(e) {
  const t = String(e || "").trim();
  if (!t || t === "auto") return "auto";
  if (t === "required") return "any";
  if (t === "none") return "none";
  throw new Error(`酒馆托管 Claude 不支持 tool_choice：${t}。仅支持 auto/required/none。`);
}
function P0(e = {}, t = {}) {
  if (!(Array.isArray(t.tools) && t.tools.length > 0)) return {
    toolChoice: void 0,
    reasoningDisabledForForcedTool: !1
  };
  const n = b0(t.toolChoice), r = xe("sillytavern-claude", e, t.reasoning), o = r.profileId === "sillytavern-claude-manual" || r.profileId === "sillytavern-claude-adaptive-conditional";
  return {
    toolChoice: n,
    reasoningDisabledForForcedTool: n === "any" && r.mode === "on" && o
  };
}
var R0 = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function x0(e = {}, t = {}, n = {}) {
  const r = xe("sillytavern-claude", e, t.reasoning), o = n.reasoningDisabledForForcedTool ? "off" : r.mode;
  return qt(t, {
    profileId: r.profileId,
    effectiveMode: o,
    effort: o === "on" ? r.effort : "",
    controlFields: n.controlFields || {}
  });
}
function M0(e = {}, t = {}) {
  return { toolChoice: String(t.toolChoice || "") };
}
function hm(e = "") {
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
function N0(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    if (!n) return null;
    const r = hm(t.function.arguments || "{}");
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
function k0(e = []) {
  const t = Array.isArray(e) ? un(e) : null;
  return Array.isArray(t) && t.length ? t : null;
}
function D0(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((o) => {
    if (!o || typeof o != "object") return;
    const i = un(o) || {}, a = k0(i?.providerPayload?.anthropicContent), u = N0(i.tool_calls);
    delete i.providerPayload, i.role === "assistant" && a && u.length ? (delete i.tool_calls, i.content = a.filter((c) => c?.type !== "tool_use").concat(u)) : i.role === "assistant" && a && (delete i.tool_calls, i.content = a), n.push(i);
  });
  const r = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return r.trim() && !(n[0]?.role === "system" && n[0]?.content === r) && n.unshift({
    role: "system",
    content: r
  }), n;
}
function $0(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    if (!t || typeof t != "object") return null;
    if (t.type === "text") return {
      type: "text",
      text: String(t.text || "")
    };
    if (t.type === "tool_use" && t.name) {
      if (t.inputJson !== void 0) {
        const r = hm(t.inputJson);
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
      const n = un(t.input);
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
    } : un(t) || null;
  }).filter(Boolean);
}
function L0(e = []) {
  return e.map((t) => !t || typeof t != "object" ? null : t.type === "tool_use" && t.name ? {
    type: "tool_use",
    id: t.id,
    name: t.name,
    input: un(t.input) || {}
  } : un(t) || null).filter(Boolean);
}
function U0(e = []) {
  const t = Array.isArray(e) ? e : [], n = t.filter((i) => i?.type === "text").map((i) => i.text || "").join(`
`), r = t.filter((i) => i?.type === "thinking" || i?.type === "redacted_thinking").map((i) => ({
    label: i.type === "thinking" ? "思考块" : "已脱敏思考块",
    text: i.type === "thinking" ? i.thinking || "" : i.data || ""
  })).filter((i) => i.text), o = t.filter((i) => i?.type === "tool_use" && i.name).map((i, a) => ({
    id: i.id || `st-claude-tool-${a + 1}`,
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
function pm(e = [], t = {}) {
  const n = $0(e), r = n.filter((o) => o.type === "tool_use" && o.name).map((o, i) => ({
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
    providerPayload: n.length ? { anthropicContent: L0(n) } : void 0
  };
}
function F0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function O0(e, t = {}) {
  const n = [];
  let r = "stop", o = t.model || "";
  const i = (u, c = {}) => {
    const d = Number.isInteger(Number(u)) ? Number(u) : n.length;
    return n[d] ? n[d] = {
      ...n[d],
      ...c
    } : n[d] = { ...c }, n[d];
  }, a = () => {
    const u = U0(n);
    F0(e, {
      text: u.text,
      thoughts: j(e.reasoning) ? u.thoughts : [],
      ...Array.isArray(u.toolCalls) ? { toolCalls: u.toolCalls } : {},
      ...u.toolCallDraft ? { toolCallDraft: !0 } : {}
    });
  };
  return {
    accept(u = {}) {
      if (u?.message?.model && (o = u.message.model), u.type === "content_block_start") {
        i(u.index, un(u.content_block) || {}), a();
        return;
      }
      if (u.type === "content_block_delta") {
        const c = i(u.index), d = u.delta || {};
        d.type === "text_delta" ? (c.type = c.type || "text", c.text = `${c.text || ""}${d.text || ""}`) : d.type === "input_json_delta" ? (c.type = c.type || "tool_use", c.inputJson = `${c.inputJson || ""}${d.partial_json || ""}`) : d.type === "thinking_delta" ? (c.type = c.type || "thinking", c.thinking = `${c.thinking || ""}${d.thinking || ""}`) : d.type === "signature_delta" && (c.signature = `${c.signature || ""}${d.signature || ""}`), a();
        return;
      }
      u.type === "message_delta" && (r = u.delta?.stop_reason || r);
    },
    result() {
      return pm(n, {
        finishReason: r,
        model: o,
        includeReasoningOutput: j(e.reasoning)
      });
    }
  };
}
var q0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return D0(e);
  }
  resolveToolProtocol(e) {
    return P0(this.config, e);
  }
  buildPayload(e, t = this.resolveToolProtocol(e)) {
    const n = xe("sillytavern-claude", this.config, e.reasoning), r = typeof e.onStreamProgress == "function", o = this.buildMessages(e), i = t.reasoningDisabledForForcedTool ? {
      ...n,
      mode: "off"
    } : n, a = {
      ...e,
      toolChoice: t.toolChoice,
      reasoning: i,
      temperature: to({
        ...this.config,
        provider: "sillytavern-claude"
      }, i) ? void 0 : e.temperature
    }, u = w0(this.config, a, o, r);
    return i.mode === "on" ? (u.reasoning_effort = i.effort, u.include_reasoning = j(i)) : i.mode === "off" && (u.reasoning_effort = "auto"), u;
  }
  async inspectRequest(e, t = {}) {
    const n = this.resolveToolProtocol(e), r = await lo(t.payload || this.buildPayload(e, n), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(r, n, e);
  }
  buildRequestInspection(e, t = {}, n = {}) {
    const r = {
      ...Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {},
      ...Object.hasOwn(e?.body || {}, "include_reasoning") ? { include_reasoning: e.body.include_reasoning } : {}
    };
    return {
      provider: "sillytavern-claude",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: ln(e),
      effectiveConfig: {
        ...M0(n, t),
        ...x0(this.config, n, {
          ...t,
          controlFields: r
        })
      },
      ...t.reasoningDisabledForForcedTool ? { notices: [R0] } : {}
    };
  }
  async chat(e) {
    const t = typeof e.onStreamProgress == "function", n = this.resolveToolProtocol(e), r = this.buildPayload(e, n);
    let o = null;
    const i = (a) => {
      o = this.buildRequestInspection(a, n, e);
    };
    try {
      if (t) {
        const u = O0(e, this.config);
        return await pl(r, (c) => {
          u.accept(c);
        }, {
          signal: e.signal,
          onRequest: i
        }), {
          ...u.result(),
          requestInspection: o
        };
      }
      const a = await hl(r, {
        signal: e.signal,
        onRequest: i
      });
      return {
        ...pm(Array.isArray(a?.content) ? a.content : [{
          type: "text",
          text: a?.choices?.[0]?.message?.content || ""
        }], {
          finishReason: a?.stop_reason || a?.choices?.[0]?.finish_reason || "stop",
          model: a?.model || this.config.model,
          includeReasoningOutput: j(e.reasoning)
        }),
        requestInspection: o
      };
    } catch (a) {
      throw o && a && typeof a == "object" && (a.requestInspection = o), a;
    }
  }
};
function gl(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function Bn(e) {
  if (typeof e == "string") return {
    role: "model",
    parts: e ? [{ text: e }] : []
  };
  if (!e || typeof e != "object") return {
    role: "model",
    parts: []
  };
  const t = gl(e) || {};
  return t.role = t.role || "model", t.parts = Array.isArray(t.parts) ? t.parts : [], t;
}
function B0(e) {
  const t = Array.isArray(e?.providerPayload?.googleContents) ? e.providerPayload.googleContents : [];
  if (t.length) return t.map((o) => Bn(o)).filter((o) => Array.isArray(o.parts) && o.parts.length);
  const n = e?.providerPayload?.googleContent, r = Bn(n);
  return r.parts.length ? [r] : [];
}
function G0(e = {}) {
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
function H0(e = {}, t = 0) {
  const n = Bn(e);
  if (!n.parts.length) return null;
  const r = {
    role: n.role === "user" ? "user" : "assistant",
    content: []
  }, o = n.parts.find((a) => !a?.thought && typeof a?.text == "string" && typeof a?.thoughtSignature == "string" && a.thoughtSignature)?.thoughtSignature || "", i = [];
  return n.parts.forEach((a) => {
    if (!a || typeof a != "object") return;
    if (!a.thought && typeof a.text == "string" && a.text) {
      r.content.push({
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
    const u = G0(a.inlineData);
    u && r.content.push(u);
  }), i.length && r.content.push({
    type: "tool_calls",
    tool_calls: i
  }), o && r.content.some((a) => a?.type === "text") && (r.signature = o), r.content.length ? r : null;
}
function V0(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((o) => {
    if (!o || typeof o != "object") return;
    const i = B0(o);
    if (o.role === "assistant" && i.length) {
      i.forEach((u, c) => {
        const d = H0(u, c);
        d && n.push(d);
      });
      return;
    }
    const a = gl(o) || {};
    delete a.providerPayload, n.push(a);
  });
  const r = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return r.trim() && !(n[0]?.role === "system" && n[0]?.content === r) && n.unshift({
    role: "system",
    content: r
  }), n;
}
function gm(e = {}) {
  return Bn(e?.responseContent || e?.candidates?.[0]?.content || "");
}
function mm(e = {}) {
  return (e.parts || []).filter((t) => !t?.thought && typeof t?.text == "string" && t.text).map((t) => t.text).join(`
`);
}
function ym(e = {}) {
  return (e.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function _m(e = {}) {
  return (e.parts || []).map((t) => t?.functionCall || null).filter((t) => t?.name).map((t, n) => ({
    id: t.id || `st-google-tool-${n + 1}`,
    name: t.name,
    arguments: JSON.stringify(t.args || {})
  }));
}
function K0(e, t) {
  const n = String(t || ""), r = String(e || "");
  return n ? !r || n.startsWith(r) ? n : r.endsWith(n) ? r : `${r}${n}` : r;
}
function J0(e = [], t = []) {
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
function vm(e) {
  const t = Bn(e);
  return t.parts.length ? {
    googleContent: t,
    googleContents: [t]
  } : void 0;
}
function W0(e = {}, t = {}) {
  const n = gm(e), r = e?.choices?.[0]?.message?.content || "";
  return {
    text: mm(n) || r,
    toolCalls: _m(n),
    thoughts: t.includeReasoningOutput === !1 ? [] : ym(n),
    finishReason: e?.candidates?.[0]?.finishReason || e?.choices?.[0]?.finish_reason || t.finishReason || "STOP",
    model: e?.model || e?.modelVersion || t.model || "",
    provider: "sillytavern-google",
    providerPayload: vm(n)
  };
}
function z0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Y0(e, t = {}) {
  let n = "", r = [], o = [], i = "STOP", a = t.model || "";
  const u = [];
  return {
    accept(c = {}) {
      a = c.model || c.modelVersion || a, i = c?.candidates?.[0]?.finishReason || i;
      const d = gm(c);
      d.parts.length && u.push(...gl(d.parts) || []), n = K0(n, mm(d)), r = J0(r, _m(d));
      const h = j(e.reasoning) ? ym(d) : [];
      h.length && (o = h), z0(e, {
        text: n,
        thoughts: o,
        ...r.length ? {
          toolCalls: r,
          toolCallDraft: !0
        } : {}
      });
    },
    result() {
      const c = Bn({
        role: "model",
        parts: u.length ? u : n ? [{ text: n }] : []
      });
      return {
        text: n,
        toolCalls: r,
        thoughts: o,
        finishReason: i,
        model: a,
        provider: "sillytavern-google",
        providerPayload: vm(c)
      };
    }
  };
}
var X0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return V0(e);
  }
  buildPayload(e) {
    const t = xe("sillytavern-google", this.config, e.reasoning), n = typeof e.onStreamProgress == "function", r = this.buildMessages(e), o = C0(this.config, e, r, n);
    return t.mode === "on" ? (o.reasoning_effort = t.effort, o.include_reasoning = j(t)) : t.mode === "off" && (o.reasoning_effort = "min", o.include_reasoning = !1), o;
  }
  async inspectRequest(e, t = {}) {
    const n = await lo(t.payload || this.buildPayload(e), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n, e);
  }
  buildRequestInspection(e, t = {}) {
    const n = xe("sillytavern-google", this.config, t.reasoning), r = {
      ...Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {},
      ...Object.hasOwn(e?.body || {}, "include_reasoning") ? { include_reasoning: e.body.include_reasoning } : {}
    };
    return {
      provider: "sillytavern-google",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: ln(e),
      effectiveConfig: qt(t, {
        profileId: n.profileId,
        effectiveMode: n.mode,
        effort: e?.body?.reasoning_effort,
        controlFields: r
      })
    };
  }
  async chat(e) {
    const t = typeof e.onStreamProgress == "function", n = this.buildPayload(e);
    let r = null;
    const o = (i) => {
      r = this.buildRequestInspection(i, e);
    };
    try {
      if (t) {
        const i = Y0(e, this.config);
        return await pl(n, (a) => {
          i.accept(a);
        }, {
          signal: e.signal,
          onRequest: o
        }), {
          ...i.result(),
          requestInspection: r
        };
      }
      return {
        ...W0(await hl(n, {
          signal: e.signal,
          onRequest: o
        }), {
          model: this.config.model,
          includeReasoningOutput: j(e.reasoning)
        }),
        requestInspection: r
      };
    } catch (i) {
      throw r && i && typeof i == "object" && (i.requestInspection = r), i;
    }
  }
};
function Q0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: j(e.reasoning) ? t.thoughts : [] } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function hs(e, t = []) {
  const n = nn(e);
  return {
    thinkTagged: n,
    cleanedText: t.length ? n.cleaned : rn(n.cleaned)
  };
}
function Z0(e) {
  const t = String(e?.message || e || "");
  return /Cannot read properties of null \(reading ['"]function['"]\)/i.test(t) || /reading ['"]function['"]/i.test(t) || /badresponsestatuscode/i.test(t);
}
var j0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0 ? ca(e, this.config.model) : ua(e, this.config.model);
  }
  buildPayload(e, t = !1) {
    const n = xe("sillytavern-openai-compatible", this.config, e.reasoning), r = t ? ca(e, this.config.model) : ua(e, this.config.model), o = {
      ...e,
      temperature: to({
        ...this.config,
        provider: "sillytavern-openai-compatible"
      }, n) ? void 0 : e.temperature
    }, i = E0(this.config, t ? {
      ...o,
      tools: void 0,
      toolChoice: void 0
    } : o, r, typeof e.onStreamProgress == "function");
    return n.mode === "on" ? i.reasoning_effort = n.effort : n.mode === "off" && (i.reasoning_effort = "none"), i;
  }
  async inspectRequest(e, t = {}) {
    const n = await lo(t.payload || this.buildPayload(e, !!t.taggedMode), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n, e);
  }
  buildRequestInspection(e, t = {}) {
    const n = xe("sillytavern-openai-compatible", this.config, t.reasoning);
    return {
      provider: "sillytavern-openai-compatible",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: ln(e),
      effectiveConfig: qt(t, {
        profileId: n.profileId,
        effectiveMode: n.mode,
        effort: e?.body?.reasoning_effort,
        controlFields: Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {}
      })
    };
  }
  async streamChat(e, t, n = {}) {
    const r = { role: "assistant" };
    let o = "stop", i = this.config.model;
    await pl(t, (f) => {
      i = f?.model || i;
      const p = f?.choices?.[0] || {};
      da(r, p), p.finish_reason && (o = p.finish_reason);
      const g = Nn(r), { thinkTagged: y, cleanedText: _ } = hs(Mn(r), g), v = g.length ? g : aa(y.cleaned);
      Q0(e, {
        text: _,
        thoughts: j(e.reasoning) ? Ut(r, p).concat(y.thoughts) : [],
        ...v.length ? { toolCalls: v } : {},
        ...!g.length && v.length ? { toolCallDraft: !0 } : {}
      });
    }, {
      signal: e.signal,
      onRequest: n.onRequest,
      onResponseAccepted: n.onResponseAccepted
    }), kn(r);
    const a = Nn(r), { thinkTagged: u, cleanedText: c } = hs(Mn(r), a), d = Ut(r, {});
    u.thoughts.forEach((f) => d.push(f));
    const h = a.length ? [] : Or(u.cleaned);
    return {
      text: c,
      toolCalls: [...a, ...h],
      thoughts: j(e.reasoning) ? d : [],
      finishReason: o,
      model: i,
      provider: "sillytavern-openai-compatible",
      providerPayload: qr(r)
    };
  }
  async nonStreamingChat(e, t, n = {}) {
    const r = await hl(t, {
      signal: e.signal,
      onRequest: n.onRequest
    }), o = r.choices?.[0] || {}, i = o.message || {};
    kn(i);
    const a = Ut(i, o), u = sl(i.tool_calls || []), { thinkTagged: c, cleanedText: d } = hs(al(i.content), u);
    c.thoughts.forEach((p) => a.push(p));
    const h = u.length ? [] : Or(c.cleaned), f = mi(i, o);
    return {
      text: d,
      toolCalls: [...u, ...h],
      thoughts: j(e.reasoning) ? a : [],
      finishReason: o.finish_reason || "stop",
      model: r.model || this.config.model,
      provider: "sillytavern-openai-compatible",
      providerPayload: qr(f)
    };
  }
  async chat(e) {
    const t = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, n = Array.isArray(e.tools) && e.tools.length > 0, r = async (i, a = {}) => {
      let u = null;
      const c = (d) => {
        u = this.buildRequestInspection(d, e);
      };
      try {
        return {
          ...typeof e.onStreamProgress == "function" ? await this.streamChat(e, i, {
            onRequest: c,
            onResponseAccepted: a.onResponseAccepted
          }) : await this.nonStreamingChat(e, i, { onRequest: c }),
          requestInspection: u
        };
      } catch (d) {
        throw u && d && typeof d == "object" && (d.requestInspection = u), d;
      }
    }, o = this.buildPayload(e, t);
    try {
      return await r(o);
    } catch (i) {
      if (e.allowToolProtocolFallback === !1 || t || !n || !Z0(i)) throw i;
    }
    return typeof e.onToolProtocolFallback == "function" && e.onToolProtocolFallback({
      provider: "sillytavern-openai-compatible",
      fromToolMode: "native",
      toToolMode: "tagged-json",
      reason: "malformed_native_tool_host_error"
    }), await r(this.buildPayload(e, !0));
  }
}, qd = 900 * 1e3, Bd = Object.freeze([{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}]), eP = Object.freeze([
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
function tP(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function Ve(e, t = 1) {
  const n = typeof e == "string" && !e.trim() ? t : e, r = Number(n);
  return Number.isFinite(r) ? Math.max(0, Math.min(2, r)) : Ve(t, 1);
}
function Fn(e = {}) {
  return e.sendTemperature !== !1;
}
function Gd(e = {}) {
  return Fn(e) ? Ve(e.temperature, 1) : void 0;
}
function Hd(e = "", t = {}) {
  return t && typeof t == "object" && t[e] ? t[e] : eP.find((n) => n.value === e)?.label || e || "未配置";
}
function nP(e = {}, t = {}) {
  const n = qo(e || {});
  if (t.role === "delegate" && n.delegateConfig) {
    const d = n.delegateConfig.provider || "openai-compatible", h = (n.delegateConfig.modelConfigs || Cn())[d] || Cn()[d] || {}, f = {
      provider: d,
      baseUrl: String(h.baseUrl || ""),
      model: String(h.model || "")
    };
    return {
      currentPresetName: String(n.delegatePresetName || n.currentPresetName || ""),
      provider: d,
      baseUrl: String(h.baseUrl || ""),
      model: String(h.model || ""),
      apiKey: String(h.apiKey || ""),
      tavilyApiKey: ps(n.tavilyApiKey),
      tavilyBaseUrl: Ze(n.tavilyBaseUrl),
      temperature: Gd(h),
      sendTemperature: Fn(h),
      maxTokens: Ne(h.maxTokens),
      timeoutMs: Number(t.timeoutMs) || 9e5,
      toolMode: h.toolMode || "native",
      reasoning: $n(f, h.reasoning)
    };
  }
  const r = ae(t.presetName || (t.role === "delegate" ? n.delegatePresetName : n.currentPresetName) || "默认"), o = n.presets?.[r] ? r : n.presets?.[n.currentPresetName] ? n.currentPresetName : Ti, i = n.presets?.[o] || Re(), a = i.provider || n.provider || "openai-compatible", u = (i.modelConfigs || n.modelConfigs || Cn())[a] || Cn()[a] || {}, c = {
    provider: a,
    baseUrl: String(u.baseUrl || ""),
    model: String(u.model || "")
  };
  return {
    currentPresetName: String(o || ""),
    provider: a,
    baseUrl: String(u.baseUrl || ""),
    model: String(u.model || ""),
    apiKey: String(u.apiKey || ""),
    tavilyApiKey: ps(n.tavilyApiKey),
    tavilyBaseUrl: Ze(n.tavilyBaseUrl),
    temperature: Gd(u),
    sendTemperature: Fn(u),
    maxTokens: Ne(u.maxTokens),
    timeoutMs: Number(t.timeoutMs) || 9e5,
    toolMode: u.toolMode || "native",
    reasoning: $n(c, u.reasoning)
  };
}
function rP(e = {}, t = {}) {
  if (!e.apiKey && !tP(e.provider)) throw new Error(t.missingApiKeyMessage || "请先填写当前模型配置的 API Key。");
  switch (eh(e.reasoning || {}), e.provider) {
    case "sillytavern-openai-compatible":
      return new j0(e);
    case "sillytavern-claude":
      return new q0(e);
    case "sillytavern-google":
      return new X0(e);
    case "openai-responses":
      return new a0(e);
    case "anthropic":
      return new p_(e);
    case "google":
      return new fI(e);
    default:
      return new Xb(e);
  }
}
var oP = { chat: { exclude: [
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
] } }, iP = Object.freeze([
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
function rt(e, t, n = "") {
  if (e.replaceChildren(), n) {
    const r = document.createElement("option");
    r.value = "", r.textContent = n, e.appendChild(r);
  }
  t.forEach((r) => {
    const o = document.createElement("option");
    o.value = r.value, o.textContent = r.label, o.disabled = r.disabled === !0, e.appendChild(o);
  });
}
function Fo(e = "", t = {}) {
  const n = On(t.reasoning), r = eo({
    provider: e,
    baseUrl: t.baseUrl,
    model: t.model
  }), o = {
    reasoningMode: r.modes.includes(n.mode) ? n.mode : "inherit",
    reasoningOutput: n.output,
    reasoningEffort: "",
    reasoningBudgetTokens: void 0
  };
  if (r.intensity.kind === "effort") o.reasoningEffort = r.intensity.values.includes(n.effort) ? n.effort : r.intensity.defaultValue;
  else if (r.intensity.kind === "budget") {
    const i = n.budgetTokens, a = r.intensity.allowAuto && i === -1, u = Number.isInteger(i) && i >= r.intensity.min && i <= r.intensity.max;
    o.reasoningBudgetTokens = a || u ? i : r.intensity.defaultValue;
  }
  return o;
}
function Vd(e = "", t = {}, n = {}) {
  const r = On(n), o = eo({
    provider: e,
    baseUrl: t.baseUrl,
    model: t.model
  });
  return {
    mode: r.mode,
    output: r.output,
    ...o.intensity.kind === "effort" && r.effort ? { effort: r.effort } : {},
    ...o.intensity.kind === "budget" && r.budgetTokens !== void 0 ? { budgetTokens: r.budgetTokens } : {}
  };
}
function Wr(e = []) {
  const t = [...new Set(e.filter(Boolean).map((o) => String(o).trim()).filter(Boolean))], n = oP.chat, r = t.filter((o) => {
    const i = o.toLowerCase();
    return !n.exclude.some((a) => i.includes(a));
  });
  return r.length ? r : t;
}
function Oo(e = "") {
  return e === "delegate" ? "delegate" : "main";
}
function Gn(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function sP(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function vn(e = "") {
  return e === "openai-compatible" || e === "sillytavern-openai-compatible";
}
function aP(e = "") {
  return e === "anthropic" || e === "sillytavern-claude";
}
function lP(e = "") {
  return e === "sillytavern-claude" ? cl : e === "sillytavern-google" ? dl : Yn;
}
function zr(e = []) {
  return [...new Set(e.filter(Boolean).map((t) => String(t).trim()).filter(Boolean))];
}
function uP(e) {
  const t = Gn(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return zr([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return zr([`${t}/v1/models`, `${t}/models`]);
}
function Am(e) {
  const t = Gn(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return zr([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return zr([`${t}/v1/models`, `${t}/models`]);
}
function cP(e, t) {
  const n = Gn(e);
  if (!n) return [];
  const r = n.endsWith("/v1beta") ? n.slice(0, -7) : n;
  return zr([
    `${n}/models?key=${encodeURIComponent(t)}`,
    `${n}/models`,
    `${r}/v1beta/models?key=${encodeURIComponent(t)}`,
    `${r}/v1beta/models`,
    `${r}/models?key=${encodeURIComponent(t)}`,
    `${r}/models`
  ]);
}
function dP(e, t) {
  const n = [
    e?.error?.message,
    e?.message,
    e?.detail,
    e?.details,
    e?.error
  ].find((r) => typeof r == "string" && r.trim());
  return n ? n.trim() : String(t || "").trim().slice(0, 160);
}
async function fP(e, t = {}) {
  const n = await fetch(e, t), r = await n.text();
  let o = null, i = null;
  try {
    o = r ? JSON.parse(r) : {};
  } catch (a) {
    i = a;
  }
  return {
    ok: n.ok,
    status: n.status,
    url: e,
    data: o,
    rawText: r,
    parseError: i,
    errorSnippet: dP(o, r)
  };
}
function hP(e) {
  return Wr((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function Tm(e) {
  return Wr((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function pP(e) {
  return Wr((e?.models || e?.data || []).map((t) => String(t?.id || t?.name || "")).map((t) => t.split("/").pop() || "").filter(Boolean));
}
async function ti({ urls: e, requestOptionsList: t, extractModels: n, providerLabel: r }) {
  let o = null;
  for (const i of e) for (const a of t) {
    const u = await fP(i, a);
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
    const i = o.url ? ` (${o.url})` : "", a = o.errorSnippet ? `：${o.errorSnippet}` : "";
    throw new Error(`${r} 拉取模型失败：${o.status || "unknown"}${a}${i}`);
  }
  throw new Error(`${r} 拉取模型失败：未获取到模型列表。`);
}
async function gP(e) {
  const t = String(e.apiKey || "").trim(), n = Gn(e.baseUrl || ""), r = Gn(n || um.claude);
  if (t && r) try {
    return await ti({
      urls: Am(r),
      requestOptionsList: [{ headers: {
        "x-api-key": t,
        "anthropic-version": "2023-06-01",
        Accept: "application/json"
      } }],
      extractModels: Tm,
      providerLabel: "Anthropic"
    });
  } catch (o) {
    if (n) throw o;
  }
  return [...iP];
}
async function Kd(e) {
  const t = e.provider, n = Gn(e.baseUrl || ""), r = String(e.apiKey || "").trim();
  if (t === "sillytavern-claude") return Wr(await gP(e));
  if (sP(t)) return Wr(await I0(e, lP(t)));
  if (!r) throw new Error("请先填写 API Key。");
  if (!n) throw new Error("请先填写 Base URL。");
  return t === "google" ? await ti({
    urls: cP(n, r),
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
    extractModels: pP,
    providerLabel: "Google AI"
  }) : aP(t) ? await ti({
    urls: Am(n),
    requestOptionsList: [{ headers: {
      "x-api-key": r,
      "anthropic-version": "2023-06-01",
      Accept: "application/json"
    } }],
    extractModels: Tm,
    providerLabel: "Anthropic"
  }) : await ti({
    urls: uP(n),
    requestOptionsList: [{ headers: {
      Authorization: `Bearer ${r}`,
      Accept: "application/json"
    } }],
    extractModels: hP,
    providerLabel: t === "openai-responses" ? "OpenAI Responses" : "OpenAI-Compatible"
  });
}
function mP(e) {
  return e instanceof Error ? e.message : String(e || "unknown_error");
}
function EP(e = {}) {
  const { state: t, render: n, showToast: r, createRequestId: o = (m = "req") => `${m}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, saveConfig: i, reloadConfig: a, describeError: u = mP, getRuntimeSummaryText: c } = e;
  function d() {
    t.configFormSyncPending = !0;
  }
  function h(m, I = "main") {
    const A = String(m || "").trim() || "openai-compatible";
    return I === "delegate" ? `delegate:${A}` : A;
  }
  function f(m, I = "main") {
    return t.pullStateByProvider?.[h(m, I)] || {
      status: "idle",
      message: ""
    };
  }
  function p(m, I, A = "main") {
    t.pullStateByProvider = {
      ...t.pullStateByProvider || {},
      [h(m, A)]: I
    };
  }
  function g(m, I, A = "main") {
    t.modelOptionsByProvider = {
      ...t.modelOptionsByProvider || {},
      [h(m, A)]: Array.isArray(I) ? I : []
    };
  }
  function y(m, I = "main") {
    const A = h(m, I);
    return Array.isArray(t.modelOptionsByProvider?.[A]) ? t.modelOptionsByProvider[A] : [];
  }
  function _(m, I) {
    const A = t.config?.presets || {}, M = ae(m || I || "默认");
    return A[M] ? M : I && A[I] ? I : Object.keys(A)[0] || "默认";
  }
  function v(m, I) {
    const A = _(m, Ti), M = I && typeof I == "object" ? I : Re(), B = M.provider || "openai-compatible", te = Ke(M.modelConfigs || {}), ne = te[B] || {}, ye = Fo(B, ne);
    return {
      delegatePresetName: A,
      delegateProvider: B,
      delegateModelConfigs: te,
      delegateBaseUrl: String(ne.baseUrl || ""),
      delegateModel: String(ne.model || ""),
      delegateApiKey: String(ne.apiKey || ""),
      delegateTemperature: Ve(ne.temperature, 1),
      delegateMaxTokens: Ne(ne.maxTokens),
      delegateSendTemperature: Fn(ne),
      delegateReasoningMode: ye.reasoningMode,
      delegateReasoningOutput: ye.reasoningOutput,
      delegateReasoningEffort: ye.reasoningEffort,
      delegateReasoningBudgetTokens: ye.reasoningBudgetTokens,
      delegateToolMode: ne.toolMode || "native"
    };
  }
  function E(m = "openai-compatible", I = {}) {
    const A = Ke(I || {})[m] || {}, M = Fo(m, A);
    return {
      baseUrl: String(A.baseUrl || ""),
      model: String(A.model || ""),
      apiKey: String(A.apiKey || ""),
      temperature: Ve(A.temperature, 1),
      maxTokens: Ne(A.maxTokens),
      sendTemperature: Fn(A),
      ...M,
      toolMode: A.toolMode || "native"
    };
  }
  function b(m = "openai-compatible", I = {}) {
    const A = Ke(I || {})[m] || {}, M = Fo(m, A);
    return {
      delegateBaseUrl: String(A.baseUrl || ""),
      delegateModel: String(A.model || ""),
      delegateApiKey: String(A.apiKey || ""),
      delegateTemperature: Ve(A.temperature, 1),
      delegateMaxTokens: Ne(A.maxTokens),
      delegateSendTemperature: Fn(A),
      delegateReasoningMode: M.reasoningMode,
      delegateReasoningOutput: M.reasoningOutput,
      delegateReasoningEffort: M.reasoningEffort,
      delegateReasoningBudgetTokens: M.reasoningBudgetTokens,
      delegateToolMode: A.toolMode || "native"
    };
  }
  function R(m, I, A = t.config) {
    const M = ae(m || "默认"), B = I && typeof I == "object" ? I : Re(), te = B.provider || "openai-compatible", ne = Ke(B.modelConfigs || {}), ye = E(te, ne), Ue = _(A?.delegatePresetName, M), se = v(Ue, A?.delegateConfig && typeof A.delegateConfig == "object" ? A.delegateConfig : (A?.presets || {})[Ue] || B);
    return {
      currentPresetName: M,
      presetDraftName: M,
      provider: te,
      modelConfigs: ne,
      ...ye,
      tavilyApiKey: String(A?.tavilyApiKey || ""),
      tavilyBaseUrl: Ze(A?.tavilyBaseUrl || "https://api.tavily.com"),
      permissionMode: In(B.permissionMode),
      jsApiPermission: Et(A?.jsApiPermission),
      ...se
    };
  }
  function P() {
    if (t.configDraft) return t.configDraft;
    const m = ae(t.config?.currentPresetName || "默认");
    return t.configDraft = R(m, (t.config?.presets || {})[m] || Re()), t.configDraft;
  }
  function L(m, I = {}) {
    const A = P(), M = I.provider || m.querySelector("#xb-assistant-provider")?.value || A.provider || "openai-compatible", B = I.delegateProvider || m.querySelector("#xb-assistant-delegate-provider")?.value || A.delegateProvider || "openai-compatible", te = m.querySelector("#xb-assistant-base-url")?.value.trim() || "", ne = m.querySelector("#xb-assistant-model")?.value.trim() || "", ye = m.querySelector("#xb-assistant-delegate-base-url")?.value.trim() ?? A.delegateBaseUrl ?? "", Ue = m.querySelector("#xb-assistant-delegate-model")?.value.trim() ?? A.delegateModel ?? "", se = Vd(M, {
      baseUrl: te,
      model: ne
    }, {
      mode: m.querySelector("#xb-assistant-reasoning-mode")?.value || A.reasoningMode,
      output: m.querySelector("#xb-assistant-reasoning-output")?.value || A.reasoningOutput,
      effort: m.querySelector("#xb-assistant-reasoning-effort")?.value || A.reasoningEffort,
      budgetTokens: m.querySelector("#xb-assistant-reasoning-budget")?.value ?? A.reasoningBudgetTokens
    }), ht = Vd(B, {
      baseUrl: ye,
      model: Ue
    }, {
      mode: m.querySelector("#xb-assistant-delegate-reasoning-mode")?.value || A.delegateReasoningMode,
      output: m.querySelector("#xb-assistant-delegate-reasoning-output")?.value || A.delegateReasoningOutput,
      effort: m.querySelector("#xb-assistant-delegate-reasoning-effort")?.value || A.delegateReasoningEffort,
      budgetTokens: m.querySelector("#xb-assistant-delegate-reasoning-budget")?.value ?? A.delegateReasoningBudgetTokens
    }), ue = {
      baseUrl: te,
      model: ne,
      apiKey: m.querySelector("#xb-assistant-api-key")?.value.trim() || "",
      temperature: Ve(m.querySelector("#xb-assistant-temperature")?.value, A.temperature ?? 1),
      maxTokens: Ne(m.querySelector("#xb-assistant-max-tokens")?.value, A.maxTokens),
      sendTemperature: m.querySelector("#xb-assistant-send-temperature")?.checked ?? !!(A.sendTemperature ?? !0),
      reasoning: se,
      toolMode: vn(M) ? m.querySelector("#xb-assistant-tool-mode")?.value || A.toolMode || "native" : void 0
    }, Te = {
      baseUrl: ye,
      model: Ue,
      apiKey: m.querySelector("#xb-assistant-delegate-api-key")?.value.trim() ?? A.delegateApiKey ?? "",
      temperature: Ve(m.querySelector("#xb-assistant-delegate-temperature")?.value, A.delegateTemperature ?? 1),
      maxTokens: Ne(m.querySelector("#xb-assistant-delegate-max-tokens")?.value, A.delegateMaxTokens),
      sendTemperature: m.querySelector("#xb-assistant-delegate-send-temperature")?.checked ?? !!(A.delegateSendTemperature ?? !0),
      reasoning: ht,
      toolMode: vn(B) ? m.querySelector("#xb-assistant-delegate-tool-mode")?.value || A.delegateToolMode || "native" : void 0
    }, Ht = {
      ...Ke(A.modelConfigs || {}),
      [M]: {
        ...Ke(A.modelConfigs || {})[M] || {},
        ...ue
      }
    }, Vt = {
      ...Ke(A.delegateModelConfigs || {}),
      [B]: {
        ...Ke(A.delegateModelConfigs || {})[B] || {},
        ...Te
      }
    };
    return {
      ...A,
      currentPresetName: A.currentPresetName,
      presetDraftName: ae(m.querySelector("#xb-assistant-preset-name")?.value),
      provider: M,
      modelConfigs: Ht,
      baseUrl: ue.baseUrl,
      model: ue.model,
      apiKey: ue.apiKey,
      temperature: ue.temperature,
      maxTokens: ue.maxTokens,
      sendTemperature: ue.sendTemperature,
      reasoningMode: ue.reasoning.mode,
      reasoningOutput: ue.reasoning.output,
      reasoningEffort: ue.reasoning.effort || "",
      reasoningBudgetTokens: ue.reasoning.budgetTokens,
      toolMode: ue.toolMode || A.toolMode || "native",
      tavilyApiKey: m.querySelector("#xb-assistant-tavily-api-key")?.value.trim() || "",
      tavilyBaseUrl: Ze(A.tavilyBaseUrl || "https://api.tavily.com"),
      permissionMode: In(m.querySelector("#xb-assistant-permission-mode")?.value || A.permissionMode),
      jsApiPermission: Et(m.querySelector("#xb-assistant-jsapi-permission")?.value || A.jsApiPermission),
      delegatePresetName: _(m.querySelector("#xb-assistant-delegate-preset-select")?.value || A.delegatePresetName, A.currentPresetName),
      delegateProvider: B,
      delegateModelConfigs: Vt,
      delegateBaseUrl: Te.baseUrl,
      delegateModel: Te.model,
      delegateApiKey: Te.apiKey,
      delegateTemperature: Te.temperature,
      delegateMaxTokens: Te.maxTokens,
      delegateSendTemperature: Te.sendTemperature,
      delegateReasoningMode: Te.reasoning.mode,
      delegateReasoningOutput: Te.reasoning.output,
      delegateReasoningEffort: Te.reasoning.effort || "",
      delegateReasoningBudgetTokens: Te.reasoning.budgetTokens,
      delegateToolMode: Te.toolMode || A.delegateToolMode || "native"
    };
  }
  function S(m, I = {}) {
    return t.configDraft = L(m, I), t.configDirty = !0, t.configDraft;
  }
  function O(m = P()) {
    return {
      baseUrl: String(m.baseUrl || ""),
      model: String(m.model || ""),
      apiKey: String(m.apiKey || ""),
      temperature: Ve(m.temperature, 1),
      maxTokens: Ne(m.maxTokens),
      sendTemperature: !!(m.sendTemperature ?? !0),
      reasoning: On({
        mode: m.reasoningMode,
        output: m.reasoningOutput,
        effort: m.reasoningEffort,
        budgetTokens: m.reasoningBudgetTokens
      }),
      toolMode: vn(m.provider) ? m.toolMode || "native" : void 0
    };
  }
  function x(m = P()) {
    return {
      baseUrl: String(m.delegateBaseUrl || ""),
      model: String(m.delegateModel || ""),
      apiKey: String(m.delegateApiKey || ""),
      temperature: Ve(m.delegateTemperature, 1),
      maxTokens: Ne(m.delegateMaxTokens),
      sendTemperature: !!(m.delegateSendTemperature ?? !0),
      reasoning: On({
        mode: m.delegateReasoningMode,
        output: m.delegateReasoningOutput,
        effort: m.delegateReasoningEffort,
        budgetTokens: m.delegateReasoningBudgetTokens
      }),
      toolMode: vn(m.delegateProvider) ? m.delegateToolMode || "native" : void 0
    };
  }
  function D(m = P()) {
    const I = m.delegateProvider || "openai-compatible", A = Ke(m.delegateModelConfigs || {});
    return {
      provider: I,
      modelConfigs: {
        ...A,
        [I]: {
          ...A[I] || {},
          ...x(m)
        }
      }
    };
  }
  function H(m = P()) {
    return {
      provider: m.provider || "openai-compatible",
      baseUrl: m.baseUrl || "",
      model: m.model || "",
      apiKey: m.apiKey || "",
      tavilyApiKey: m.tavilyApiKey || "",
      tavilyBaseUrl: Ze(m.tavilyBaseUrl || "https://api.tavily.com"),
      temperature: m.sendTemperature === !1 ? void 0 : Ve(m.temperature, 1),
      sendTemperature: !!(m.sendTemperature ?? !0),
      maxTokens: Ne(m.maxTokens),
      timeoutMs: qd,
      toolMode: m.toolMode || "native",
      reasoning: $n({
        provider: m.provider,
        baseUrl: m.baseUrl,
        model: m.model
      }, {
        mode: m.reasoningMode,
        output: m.reasoningOutput,
        effort: m.reasoningEffort,
        budgetTokens: m.reasoningBudgetTokens
      })
    };
  }
  function z(m = P()) {
    return {
      provider: m.delegateProvider || "openai-compatible",
      baseUrl: m.delegateBaseUrl || "",
      model: m.delegateModel || "",
      apiKey: m.delegateApiKey || "",
      tavilyApiKey: m.tavilyApiKey || "",
      tavilyBaseUrl: Ze(m.tavilyBaseUrl || "https://api.tavily.com"),
      temperature: m.delegateSendTemperature === !1 ? void 0 : Ve(m.delegateTemperature, 1),
      sendTemperature: !!(m.delegateSendTemperature ?? !0),
      maxTokens: Ne(m.delegateMaxTokens),
      timeoutMs: qd,
      toolMode: m.delegateToolMode || "native",
      reasoning: $n({
        provider: m.delegateProvider,
        baseUrl: m.delegateBaseUrl,
        model: m.delegateModel
      }, {
        mode: m.delegateReasoningMode,
        output: m.delegateReasoningOutput,
        effort: m.delegateReasoningEffort,
        budgetTokens: m.delegateReasoningBudgetTokens
      })
    };
  }
  function ge(m = P(), I = "main") {
    const A = I === "delegate" ? {
      label: "分身模型：",
      provider: m.delegateProvider,
      baseUrl: m.delegateBaseUrl,
      model: m.delegateModel,
      reasoning: {
        mode: m.delegateReasoningMode,
        output: m.delegateReasoningOutput,
        effort: m.delegateReasoningEffort,
        budgetTokens: m.delegateReasoningBudgetTokens
      }
    } : {
      label: "主模型：",
      provider: m.provider,
      baseUrl: m.baseUrl,
      model: m.model,
      reasoning: {
        mode: m.reasoningMode,
        output: m.reasoningOutput,
        effort: m.reasoningEffort,
        budgetTokens: m.reasoningBudgetTokens
      }
    }, M = $n(A, A.reasoning);
    return M.valid === !1 ? `${A.label}${M.error}` : "";
  }
  function Q(m = {}) {
    const I = (m.role === "delegate", P());
    return m.role === "delegate" ? z(I) : H(I);
  }
  function Z(m) {
    P(), t.configDraft = {
      ...t.configDraft,
      presetDraftName: ae(m.querySelector("#xb-assistant-preset-name")?.value)
    };
  }
  function X(m = P(), I = m.provider || "openai-compatible", A = "main") {
    const M = f(I, A);
    return typeof c == "function" ? c({
      state: t,
      draft: m,
      provider: I,
      pullState: M,
      providerLabel: Hd(I)
    }) : `预设「${m.currentPresetName || "默认"}」 · ${Hd(I)}`;
  }
  function Ae(m, I, A) {
    const M = m?.querySelector?.(I);
    if (!M) return;
    const B = String(A?.status || "idle"), te = String(A?.message || "").trim();
    M.textContent = te, M.hidden = !te, M.classList.toggle("is-loading", B === "loading"), M.classList.toggle("is-success", B === "success"), M.classList.toggle("is-error", B === "error");
  }
  function Ye(m) {
    if (!m) return;
    const I = Oo(t.configPage);
    t.configPage = I, m.querySelectorAll("[data-config-page]").forEach((A) => {
      const M = Oo(A?.dataset?.configPage) === I;
      A.classList.toggle("is-active", M), A.setAttribute("aria-selected", M ? "true" : "false");
    }), m.querySelectorAll("[data-config-page-panel]").forEach((A) => {
      const M = Oo(A?.dataset?.configPagePanel) === I;
      A.toggleAttribute("hidden", !M);
    }), m.querySelector("#xb-assistant-delete-preset")?.toggleAttribute("hidden", I === "delegate");
  }
  function me(m, I = "main") {
    const A = P(), M = I === "delegate", B = M ? "#xb-assistant-delegate-reasoning" : "#xb-assistant-reasoning", te = M ? A.delegateProvider : A.provider, ne = M ? A.delegateBaseUrl : A.baseUrl, ye = M ? A.delegateModel : A.model, Ue = {
      mode: M ? A.delegateReasoningMode : A.reasoningMode,
      output: M ? A.delegateReasoningOutput : A.reasoningOutput,
      effort: M ? A.delegateReasoningEffort : A.reasoningEffort,
      budgetTokens: M ? A.delegateReasoningBudgetTokens : A.reasoningBudgetTokens
    }, se = eo({
      provider: te,
      baseUrl: ne,
      model: ye
    }), ht = Fo(te, {
      baseUrl: ne,
      model: ye,
      reasoning: Ue
    });
    M ? Object.assign(A, {
      delegateReasoningMode: ht.reasoningMode,
      delegateReasoningOutput: ht.reasoningOutput,
      delegateReasoningEffort: ht.reasoningEffort,
      delegateReasoningBudgetTokens: ht.reasoningBudgetTokens
    }) : Object.assign(A, ht);
    const ue = M ? A.delegateReasoningMode : A.reasoningMode, Te = M ? A.delegateReasoningOutput : A.reasoningOutput, Ht = M ? A.delegateReasoningEffort : A.reasoningEffort, Vt = M ? A.delegateReasoningBudgetTokens : A.reasoningBudgetTokens, Kt = m.querySelector(`${B}-mode`), fn = m.querySelector(`${B}-capability`), Xn = m.querySelector(`${B}-effort-wrap`), Jt = m.querySelector(`${B}-effort`), Qn = m.querySelector(`${B}-budget-wrap`), Rt = m.querySelector(`${B}-budget`), hn = m.querySelector(`${B}-output`);
    Kt && (rt(Kt, t_(se)), Kt.value = ue), fn && (fn.textContent = se.unsupportedReason || `能力配置：${se.profileId}`), Jt && (rt(Jt, n_(se)), Jt.value = Ht), Xn && (Xn.style.display = ue === "on" && se.intensity.kind === "effort" ? "" : "none"), Rt && se.intensity.kind === "budget" && (Rt.min = se.intensity.allowAuto ? "-1" : String(se.intensity.min), Rt.max = String(se.intensity.max), Rt.value = String(Vt)), Qn && (Qn.style.display = ue === "on" && se.intensity.kind === "budget" ? "" : "none"), hn && (rt(hn, Dm), hn.value = Te);
  }
  function ie(m) {
    const I = m.querySelector("#xb-assistant-runtime");
    if (!I) return;
    const A = P(), M = t.configPage === "delegate", B = M ? A.delegateProvider : A.provider;
    I.textContent = X(M ? {
      ...A,
      currentPresetName: "分身",
      provider: B
    } : A, B || "openai-compatible", M ? "delegate" : "main");
  }
  function dn(m) {
    if (!t.config) return;
    Ye(m);
    const I = P(), A = I.provider || "openai-compatible", M = y(A), B = I.delegateProvider || "openai-compatible", te = y(B, "delegate"), ne = m.querySelector("#xb-assistant-provider"), ye = m.querySelector("#xb-assistant-base-url"), Ue = m.querySelector("#xb-assistant-model"), se = m.querySelector("#xb-assistant-api-key"), ht = m.querySelector("#xb-assistant-temperature"), ue = m.querySelector("#xb-assistant-send-temperature"), Te = m.querySelector("#xb-assistant-tool-mode-wrap"), Ht = m.querySelector("#xb-assistant-tool-mode"), Vt = m.querySelector("#xb-assistant-permission-mode"), Kt = m.querySelector("#xb-assistant-jsapi-permission"), fn = m.querySelector("#xb-assistant-model-pulled"), Xn = m.querySelector("#xb-assistant-max-tokens"), Jt = m.querySelector("#xb-assistant-preset-select"), Qn = m.querySelector("#xb-assistant-preset-name"), Rt = m.querySelector("#xb-assistant-delegate-preset-select"), hn = m.querySelector("#xb-assistant-delegate-provider"), vl = m.querySelector("#xb-assistant-delegate-base-url"), Al = m.querySelector("#xb-assistant-delegate-model"), Tl = m.querySelector("#xb-assistant-delegate-api-key"), Sl = m.querySelector("#xb-assistant-tavily-api-key"), Hi = m.querySelector("#xb-assistant-delegate-model-pulled"), El = m.querySelector("#xb-assistant-delegate-max-tokens"), wl = m.querySelector("#xb-assistant-delegate-tool-mode-wrap"), Vi = m.querySelector("#xb-assistant-delegate-tool-mode");
    if (!Jt || !Qn) return;
    const Cl = (t.config.presetNames || []).map((xt) => ({
      value: xt,
      label: xt
    }));
    rt(Jt, Cl), Jt.value = I.currentPresetName || t.config.currentPresetName || "默认", Rt && (rt(Rt, Cl), Rt.value = _(I.delegatePresetName, I.currentPresetName)), Qn.value = I.presetDraftName || I.currentPresetName || "默认", ne && (ne.value = A), ye && (ye.value = I.baseUrl || ""), Ue && (Ue.value = I.model || ""), se && (se.value = I.apiKey || ""), Xn && (Xn.value = String(Ne(I.maxTokens))), ht && (ht.value = String(Ve(I.temperature, 1))), ue && (ue.checked = !!(I.sendTemperature ?? !0)), Sl && (Sl.value = I.tavilyApiKey || ""), Te && (Te.style.display = vn(A) ? "" : "none"), Ht && (rt(Ht, Bd), Ht.value = I.toolMode || "native"), Vt && (rt(Vt, Om), Vt.value = In(I.permissionMode)), Kt && (rt(Kt, qm), Kt.value = Et(I.jsApiPermission)), me(m), fn && (rt(fn, M.map((xt) => ({
      value: xt,
      label: xt
    })), "手动填写"), fn.value = M.includes(I.model) ? I.model : ""), hn && (hn.value = B), vl && (vl.value = I.delegateBaseUrl || ""), Al && (Al.value = I.delegateModel || ""), Tl && (Tl.value = I.delegateApiKey || "");
    const Il = m.querySelector("#xb-assistant-delegate-temperature"), bl = m.querySelector("#xb-assistant-delegate-send-temperature");
    El && (El.value = String(Ne(I.delegateMaxTokens))), Il && (Il.value = String(Ve(I.delegateTemperature, 1))), bl && (bl.checked = !!(I.delegateSendTemperature ?? !0)), wl && (wl.style.display = vn(B) ? "" : "none"), Vi && (rt(Vi, Bd), Vi.value = I.delegateToolMode || "native"), me(m, "delegate"), Hi && (rt(Hi, te.map((xt) => ({
      value: xt,
      label: xt
    })), "手动填写"), Hi.value = te.includes(I.delegateModel) ? I.delegateModel : ""), Ae(m, "#xb-assistant-model-pull-status", f(A)), Ae(m, "#xb-assistant-delegate-model-pull-status", f(B, "delegate")), ie(m);
  }
  function ml(m) {
    if (typeof i != "function") return;
    const I = i(m);
    I && typeof I.catch == "function" && I.catch((A) => {
      r?.(u(A));
    });
  }
  function Gi(m, I, A) {
    m.querySelector(I)?.addEventListener("click", () => {
      const M = m.querySelector(A);
      M && (M.type = M.type === "password" ? "text" : "password");
    });
  }
  function yl(m) {
    return {
      expectedUpdatedAt: Number(m?.updatedAt) || 0,
      workspaceFileName: m?.workspaceFileName || "",
      jsApiPermission: Et(m?.jsApiPermission),
      tavilyApiKey: String(m?.tavilyApiKey || ""),
      tavilyBaseUrl: Ze(m?.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: m?.currentPresetName || "默认",
      delegatePresetName: m?.delegatePresetName || m?.currentPresetName || "默认",
      delegateConfig: m?.delegateConfig || {},
      delegateConfigured: m?.delegateConfigured === !0,
      presets: m?.presets || {}
    };
  }
  function uo(m, I = {}) {
    const A = S(m), M = ge(A, I.configureDelegate === !0 ? "delegate" : "main");
    if (M) {
      r?.(M);
      return;
    }
    const B = ae(I.presetName || A.presetDraftName), te = ae(A.currentPresetName || t.config?.currentPresetName || "默认"), ne = (t.config?.presets || {})[te] || Re(), ye = Ke(A.modelConfigs || ne.modelConfigs || {}), Ue = {
      ...ne,
      provider: A.provider,
      permissionMode: In(A.permissionMode),
      modelConfigs: {
        ...ye,
        [A.provider]: {
          ...ye[A.provider] || {},
          ...O(A)
        }
      }
    }, se = { ...t.config?.presets || {} };
    I.renameCurrentPreset && B !== te && delete se[te], se[B] = Ue, t.config = qo({
      ...t.config,
      jsApiPermission: Et(A.jsApiPermission),
      tavilyApiKey: String(A.tavilyApiKey || ""),
      tavilyBaseUrl: Ze(A.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: B,
      delegatePresetName: _(A.delegatePresetName, B),
      delegateConfig: D(A),
      delegateConfigured: I.configureDelegate === !0 || t.config?.delegateConfigured === !0,
      presets: se
    }), t.configDraft = R(B, Ue, t.config), d(), ml({
      requestId: o(I.requestPrefix || "save-config"),
      config: t.config,
      payload: yl(t.config)
    });
  }
  function _l(m, I = "") {
    const A = ae(I || "默认"), M = typeof window < "u" && typeof window.prompt == "function" ? window.prompt(m, A) : A;
    return M === null ? "" : ae(M);
  }
  function Sm(m) {
    const I = _l("输入新预设名称：", `${S(m).currentPresetName || "默认"} 副本`);
    if (!I) {
      r?.("预设名称不能为空");
      return;
    }
    const A = m.querySelector("#xb-assistant-preset-name");
    A && (A.value = I, uo(m, {
      presetName: I,
      requestPrefix: "create-preset"
    }));
  }
  function Em(m) {
    const I = S(m), A = ae(I.currentPresetName || t.config?.currentPresetName || "默认"), M = _l("输入预设名称：", I.presetDraftName || A);
    if (!M) {
      r?.("预设名称不能为空");
      return;
    }
    if (M === A) return;
    const B = m.querySelector("#xb-assistant-preset-name");
    B && (B.value = M, uo(m, {
      presetName: M,
      renameCurrentPreset: !0,
      requestPrefix: "rename-preset"
    }));
  }
  function wm(m) {
    if (Object.keys(t.config?.presets || {}).length <= 1) {
      r?.("至少要保留一套预设");
      return;
    }
    const I = S(m), A = ae(t.configDraft?.currentPresetName || t.config?.currentPresetName || "默认"), M = { ...t.config?.presets || {} };
    delete M[A];
    const B = Object.keys(M)[0] || "默认", te = M[B] || Re();
    t.config = qo({
      ...t.config,
      jsApiPermission: Et(I.jsApiPermission),
      tavilyApiKey: String(I.tavilyApiKey || t.config?.tavilyApiKey || ""),
      tavilyBaseUrl: Ze(I.tavilyBaseUrl || t.config?.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: B,
      delegatePresetName: _(I.delegatePresetName, B),
      delegateConfig: D(I),
      presets: M
    }), t.configDraft = R(B, te, t.config), d(), ml({
      requestId: o("delete-preset"),
      config: t.config,
      payload: yl(t.config)
    }), n?.();
  }
  function Cm(m) {
    m?.querySelector?.("[data-xb-agent-config-retry]")?.addEventListener("click", () => {
      a?.();
    }), m?.querySelector?.("[data-xb-agent-config-reload]")?.addEventListener("click", () => {
      t.configDraft = null, t.configDirty = !1, t.configExternalChangePending = !1, d(), n?.();
    }), m?.querySelector?.("#xb-assistant-provider") && (m.querySelector("#xb-assistant-provider")?.addEventListener("change", (I) => {
      const A = I.currentTarget.value, M = P().provider, B = S(m, { provider: M });
      t.configDraft = {
        ...B,
        provider: A,
        ...E(A, B.modelConfigs)
      }, d(), n?.();
    }), m.querySelector("#xb-assistant-preset-select")?.addEventListener("change", (I) => {
      const A = ae(I.currentTarget.value), M = (t.config?.presets || {})[A] || Re(), B = S(m);
      t.config = qo({
        ...t.config,
        jsApiPermission: Et(B.jsApiPermission),
        currentPresetName: A,
        delegatePresetName: _(B.delegatePresetName, A),
        delegateConfig: D(B)
      }), t.configDraft = R(A, M, t.config), d(), n?.();
    }), m.querySelector("#xb-assistant-preset-name")?.addEventListener("input", () => {
      Z(m);
    }), m.querySelector("#xb-assistant-base-url")?.addEventListener("input", () => {
      S(m), me(m), ie(m);
    }), m.querySelector("#xb-assistant-model")?.addEventListener("input", () => {
      S(m), me(m), ie(m);
    }), m.querySelector("#xb-assistant-api-key")?.addEventListener("input", () => {
      S(m);
    }), m.querySelector("#xb-assistant-max-tokens")?.addEventListener("input", () => {
      S(m);
    }), m.querySelector("#xb-assistant-temperature")?.addEventListener("input", () => {
      S(m);
    }), m.querySelector("#xb-assistant-send-temperature")?.addEventListener("change", () => {
      S(m);
    }), m.querySelector("#xb-assistant-tavily-api-key")?.addEventListener("input", () => {
      S(m);
    }), m.querySelector("#xb-assistant-model-pulled")?.addEventListener("change", (I) => {
      const A = I.currentTarget.value;
      if (!A) return;
      const M = m.querySelector("#xb-assistant-model");
      M && (M.value = A), S(m), me(m), ie(m);
    }), Gi(m, "#xb-assistant-toggle-key", "#xb-assistant-api-key"), Gi(m, "#xb-assistant-toggle-tavily-key", "#xb-assistant-tavily-api-key"), m.querySelector("#xb-assistant-delegate-provider")?.addEventListener("change", (I) => {
      const A = I.currentTarget.value, M = P().delegateProvider, B = S(m, { delegateProvider: M });
      t.configDraft = {
        ...B,
        delegateProvider: A,
        ...b(A, B.delegateModelConfigs)
      }, d(), n?.();
    }), m.querySelector("#xb-assistant-delegate-base-url")?.addEventListener("input", () => {
      S(m), me(m, "delegate"), ie(m);
    }), m.querySelector("#xb-assistant-delegate-model")?.addEventListener("input", () => {
      S(m), me(m, "delegate"), ie(m);
    }), m.querySelector("#xb-assistant-delegate-api-key")?.addEventListener("input", () => {
      S(m);
    }), m.querySelector("#xb-assistant-delegate-max-tokens")?.addEventListener("input", () => {
      S(m);
    }), m.querySelector("#xb-assistant-delegate-temperature")?.addEventListener("input", () => {
      S(m);
    }), m.querySelector("#xb-assistant-delegate-send-temperature")?.addEventListener("change", () => {
      S(m);
    }), m.querySelector("#xb-assistant-delegate-model-pulled")?.addEventListener("change", (I) => {
      const A = I.currentTarget.value;
      if (!A) return;
      const M = m.querySelector("#xb-assistant-delegate-model");
      M && (M.value = A), S(m), me(m, "delegate"), ie(m);
    }), Gi(m, "#xb-assistant-delegate-toggle-key", "#xb-assistant-delegate-api-key"), m.querySelector("#xb-assistant-reasoning-mode")?.addEventListener("change", () => {
      S(m), me(m), ie(m);
    }), m.querySelector("#xb-assistant-reasoning-effort")?.addEventListener("change", () => {
      S(m);
    }), m.querySelector("#xb-assistant-reasoning-budget")?.addEventListener("input", () => {
      S(m);
    }), m.querySelector("#xb-assistant-reasoning-output")?.addEventListener("change", () => {
      S(m);
    }), m.querySelector("#xb-assistant-tool-mode")?.addEventListener("change", () => {
      S(m);
    }), m.querySelector("#xb-assistant-delegate-reasoning-mode")?.addEventListener("change", () => {
      S(m), me(m, "delegate"), ie(m);
    }), m.querySelector("#xb-assistant-delegate-reasoning-effort")?.addEventListener("change", () => {
      S(m);
    }), m.querySelector("#xb-assistant-delegate-reasoning-budget")?.addEventListener("input", () => {
      S(m);
    }), m.querySelector("#xb-assistant-delegate-reasoning-output")?.addEventListener("change", () => {
      S(m);
    }), m.querySelector("#xb-assistant-delegate-tool-mode")?.addEventListener("change", () => {
      S(m);
    }), m.querySelector("#xb-assistant-permission-mode")?.addEventListener("change", () => {
      S(m);
    }), m.querySelector("#xb-assistant-jsapi-permission")?.addEventListener("change", () => {
      S(m);
    }), m.querySelector("#xb-assistant-delegate-preset-select")?.addEventListener("change", (I) => {
      const A = _(I.currentTarget?.value, t.configDraft?.currentPresetName || t.config?.currentPresetName || "默认"), M = (t.config?.presets || {})[A] || Re();
      t.configDraft = {
        ...S(m),
        ...v(A, M)
      }, d(), n?.();
    }), m.querySelectorAll("[data-config-page]").forEach((I) => {
      I.addEventListener("click", (A) => {
        S(m), t.configPage = Oo(A.currentTarget?.dataset?.configPage), Ye(m), dn(m);
      });
    }), m.querySelector("#xb-assistant-pull-models")?.addEventListener("click", async () => {
      S(m), d();
      const I = Q();
      p(I.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }), n?.();
      try {
        const A = await Kd(I);
        g(I.provider, A), p(I.provider, {
          status: "success",
          message: `已拉取 ${A.length} 个模型`
        });
      } catch (A) {
        g(I.provider, []), p(I.provider, {
          status: "error",
          message: u(A)
        });
      }
      d(), n?.();
    }), m.querySelector("#xb-assistant-delegate-pull-models")?.addEventListener("click", async () => {
      S(m), d();
      const I = Q({ role: "delegate" });
      p(I.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }, "delegate"), n?.();
      try {
        const A = await Kd(I);
        g(I.provider, A, "delegate"), p(I.provider, {
          status: "success",
          message: `已拉取 ${A.length} 个模型`
        }, "delegate");
      } catch (A) {
        g(I.provider, [], "delegate"), p(I.provider, {
          status: "error",
          message: u(A)
        }, "delegate");
      }
      d(), n?.();
    }), m.querySelector("#xb-assistant-new-preset")?.addEventListener("click", () => {
      Sm(m);
    }), m.querySelector("#xb-assistant-rename-preset")?.addEventListener("click", () => {
      Em(m);
    }), m.querySelector("#xb-assistant-save")?.addEventListener("click", () => {
      uo(m);
    }), m.querySelector("#xb-assistant-delegate-save")?.addEventListener("click", () => {
      uo(m, {
        requestPrefix: "save-delegate-config",
        configureDelegate: !0
      });
    }), m.querySelector("#xb-assistant-delete-preset")?.addEventListener("click", () => {
      wm(m);
    }));
  }
  return {
    getActiveProviderConfig: Q,
    syncConfigToForm: dn,
    bindSettingsPanelEvents: Cm
  };
}
function Dr(e = "") {
  return String(e || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function yr(e) {
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
function yP(e = {}) {
  const t = String(e?.status || "idle");
  return t === "saving" ? "saving" : t === "success" ? "success" : t === "error" ? "error" : "save";
}
function _P(e = {}) {
  const t = String(e?.status || "idle");
  return t === "saving" ? {
    className: "xb-assistant-save-button is-saving",
    title: "正在保存配置"
  } : t === "success" ? {
    className: "xb-assistant-save-button is-success",
    title: "配置已保存"
  } : t === "error" ? {
    className: "xb-assistant-save-button is-error",
    title: Dr(e?.error || "保存失败")
  } : {
    className: "xb-assistant-save-button",
    title: "保存配置"
  };
}
function wP(e = {}) {
  const { configSave: t = {}, runtimeText: n = "", inlineToastText: r = "", showInlineToast: o = !0, showAssistantPermissions: i = !0, showDelegateSettings: a = !0, activePage: u = "main", delegatePresetHint: c = "DelegateRun 分身会使用这里的独立 API 配置；可以和主助手使用不同 Provider、Base URL、模型和 Tool 调用格式。", isBusy: d = !1, canDeletePreset: h = !0, configLoadError: f = "", configExternalChangePending: p = !1 } = e, g = String(f || "").trim(), y = _P(t), _ = yP(t), v = d || g || String(t?.status || "") === "saving" ? "disabled" : "", E = d || !h ? "disabled" : "", b = u === "delegate" ? "delegate" : "main", R = b === "main", P = b === "delegate", L = i ? `
            <label>
                <span>斜杠命令权限</span>
                <select id="xb-assistant-permission-mode"></select>
            </label>
            <label>
                <span>JavaScript API 权限</span>
                <select id="xb-assistant-jsapi-permission"></select>
            </label>` : "", S = a ? `
            <div class="xb-assistant-config-tabs" role="tablist" aria-label="API 配置分页">
                <button id="xb-assistant-config-tab-main" type="button" class="xb-assistant-config-tab ${R ? "is-active" : ""}" data-config-page="main" role="tab" aria-selected="${R ? "true" : "false"}">主助手 API</button>
                <button id="xb-assistant-config-tab-delegate" type="button" class="xb-assistant-config-tab ${P ? "is-active" : ""}" data-config-page="delegate" role="tab" aria-selected="${P ? "true" : "false"}">分身 API</button>
            </div>` : "", O = a ? `
            <div class="xb-assistant-config-page" data-config-page-panel="delegate" ${P ? "" : "hidden"}>
                <p class="xb-assistant-config-note">${Dr(c)}</p>
                <div class="xb-assistant-preset-row">
                    <select id="xb-assistant-delegate-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                    <div class="xb-assistant-preset-tools is-single" aria-label="分身 API 预设操作">
                        <button id="xb-assistant-delegate-save" type="button" class="xb-assistant-icon-button ${y.className}" title="${y.title}" aria-label="${y.title}" ${v}>${yr(_)}</button>
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
                <label>
                    <span>思考内容</span>
                    <select id="xb-assistant-delegate-reasoning-output"></select>
                    <small>只控制界面展示；隐藏时仍保留续轮所需签名</small>
                </label>
            </div>` : "";
  return `
        <section class="xb-assistant-config">
            <div class="xb-assistant-config-alert is-error" data-xb-agent-config-load-error ${g ? "" : "hidden"}>
                <span data-xb-agent-config-load-error-message>${Dr(g)}</span>
                <button type="button" data-xb-agent-config-retry>重新读取</button>
            </div>
            <div class="xb-assistant-config-alert is-conflict" data-xb-agent-config-conflict ${g || !p ? "hidden" : ""}>
                <span>共享配置已在其他页面更新。当前未保存编辑仍保留；重新载入会放弃这些编辑。</span>
                <button type="button" data-xb-agent-config-reload>重新载入</button>
            </div>
            <fieldset class="xb-assistant-config-fields" data-xb-agent-config-fields ${g ? "disabled" : ""}>
            ${S}
            <div class="xb-assistant-config-page" data-config-page-panel="main" ${R ? "" : "hidden"}>
            <div class="xb-assistant-preset-row">
                <select id="xb-assistant-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                <input id="xb-assistant-preset-name" type="hidden" />
                <div class="xb-assistant-preset-tools" aria-label="API 预设操作">
                    <button id="xb-assistant-new-preset" type="button" class="xb-assistant-icon-button" title="新增预设" aria-label="新增预设" ${d ? "disabled" : ""}>${yr("add")}</button>
                    <button id="xb-assistant-rename-preset" type="button" class="xb-assistant-icon-button" title="重命名预设" aria-label="重命名预设" ${d ? "disabled" : ""}>${yr("rename")}</button>
                    <button id="xb-assistant-save" type="button" class="xb-assistant-icon-button ${y.className}" title="${y.title}" aria-label="${y.title}" ${v}>${yr(_)}</button>
                    <button id="xb-assistant-delete-preset" type="button" class="xb-assistant-icon-button" title="删除预设" aria-label="删除预设" ${E}>${yr("delete")}</button>
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
            ${L}
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
            <label>
                <span>思考内容</span>
                <select id="xb-assistant-reasoning-output"></select>
                <small>只控制界面展示；隐藏时仍保留续轮所需签名</small>
            </label>
            </div>
            ${O}
            <div class="xb-assistant-runtime" id="xb-assistant-runtime">${Dr(n)}</div>
            </fieldset>
            ${o ? `<div class="xb-assistant-toast xb-assistant-toast-inline" id="xb-assistant-toast" aria-live="polite">${Dr(r)}</div>` : ""}
        </section>
    `;
}
var vP = [
  "你是小白X“四次元壁”的交流生成器。",
  "只完成本轮四次元壁回复，不调用工具，不编造外部事实。",
  "严格遵循后续提示词里的输出格式，优先输出可被解析的 <thinking> 与 <msg> 内容。"
].join(`
`);
function AP(e = {}) {
  return {
    msg1: String(e.msg1 || "").trim(),
    msg2: String(e.msg2 || "").trim(),
    msg3: String(e.msg3 || "").trim(),
    msg4: String(e.msg4 || "").trim()
  };
}
function TP(e = {}, t = {}) {
  const { msg1: n, msg2: r, msg3: o, msg4: i } = AP(e);
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
function CP(e = {}) {
  h0(typeof e.requestHeadersProvider == "function" ? e.requestHeadersProvider : null);
}
async function IP(e = {}) {
  const t = nP(Hm(e.config || {})), n = rP(t, { missingApiKeyMessage: "请先在小白agent的 API配置 里填写当前预设的 API Key。" }), r = !!e.stream && typeof e.onStreamProgress == "function", o = await n.chat({
    systemPrompt: vP,
    messages: TP(e.builtPrompt || {}, { disableAssistantPrefill: !!e.disableAssistantPrefill }),
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
  wP as buildAgentSettingsPanelMarkup,
  CP as configureFourthWallAgent,
  EP as createAgentSettingsPanel,
  IP as generateFourthWallResponse,
  qo as normalizeAgentConfig
};
