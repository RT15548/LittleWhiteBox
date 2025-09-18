import { extension_settings, getContext } from "../../../extensions.js";
import { saveSettingsDebounced, eventSource, event_types } from "../../../../script.js";
import { callGenericPopup, POPUP_TYPE } from "../../../popup.js";

const EXT_ID = "LittleWhiteBox";
const C = {
  MAX_HISTORY: 10, CHECK: 200, DEBOUNCE: 300, CLEAN: 300000,
  TARGET: "/api/backends/chat-completions/generate", TIMEOUT: 30,
  ASSOC_DELAY: 1000, REQ_WINDOW: 30000
};
const S = {
  active: false, isPreview: false, isLong: false, isHistoryUiBound: false, previewData: null, previewIds: new Set(),
  interceptedIds: [], history: [], listeners: [], resolve: null, reject: null,
  sendBtnWasDisabled: false, longPressTimer: null, longPressDelay: 1000, chatLenBefore: 0,
  restoreLong: null, cleanTimer: null, previewAbort: null, tailAPI: null
};

const $q = (sel) => $(sel), ON = (e, c) => eventSource.on(e, c), OFF = (e, c) => eventSource.removeListener(e, c);
const now = () => Date.now(), geEnabled = () => { try { return ("isXiaobaixEnabled" in window) ? !!window.isXiaobaixEnabled : true; } catch { return true; } };
const debounce = (fn, w) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), w); }; };
const safeJson = (t) => { try { return JSON.parse(t); } catch { return null; } };

/* 读取文本：仅在可安全读取的类型上使用 */
const readText = async (b) => {
  try {
    if (!b) return "";
    if (typeof b === "string") return b;
    if (b instanceof Blob) return await b.text();
    if (b instanceof URLSearchParams) return b.toString();
    if (typeof b === "object" && typeof b.text === "function") return await b.text();
  } catch {}
  return "";
};

/* 判定 body 是否“可重复读取”，避免误消费一次性流导致 502 */
function isSafeBody(body) {
  if (!body) return true;
  return (
    typeof body === "string" ||
    body instanceof Blob ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body) ||
    (typeof FormData !== "undefined" && body instanceof FormData)
  );
}

/* 在不消费一次性流的前提下尝试读取请求体 */
async function safeReadBodyFromInput(input, options) {
  try {
    if (input instanceof Request) {
      return await readText(input.clone());
    }
    const body = options?.body;
    if (!isSafeBody(body)) return "";
    return await readText(body);
  } catch {
    return "";
  }
}

const isGen = (u) => String(u || "").includes(C.TARGET);
const isTarget = async (input, opt = {}) => {
  try {
    const url = input instanceof Request ? input.url : input;
    if (!isGen(url)) return false;
    const text = await safeReadBodyFromInput(input, opt);
    return text ? text.includes('"messages"') : true;
  } catch {
    return input instanceof Request ? isGen(input.url) : isGen(input);
  }
};
const getSettings = () => {
  const d = extension_settings[EXT_ID] || (extension_settings[EXT_ID] = {});
  d.preview = d.preview || { enabled: false, timeoutSeconds: C.TIMEOUT };
  d.recorded = d.recorded || { enabled: true };
  d.preview.timeoutSeconds = C.TIMEOUT;
  return d;
};

/* ultra-light tail hook for eventSource.emit: 尾位固定 + 最小侵入 */
function installEventSourceTail(es) {
  if (!es || es.__lw_tailInstalled) return es?.__lw_tailAPI || null;

  const SYM = {
    MW_STACK: Symbol.for("lwbox.es.emitMiddlewareStack"),
    BASE: Symbol.for("lwbox.es.emitBase"),
    ORIG_DESC: Symbol.for("lwbox.es.emit.origDesc"),
    COMPOSED: Symbol.for("lwbox.es.emit.composed"),
    ID: Symbol.for("lwbox.middleware.identity"),
  };

  const getFnFromDesc = (d) => {
    try {
      if (typeof d?.value === "function") return d.value;
      if (typeof d?.get === "function") {
        const v = d.get.call(es);
        if (typeof v === "function") return v;
      }
    } catch {}
    return es.emit?.bind?.(es) || es.emit;
  };
  const compose = (base, stack) => stack.reduce((acc, mw) => mw(acc), base);

  const tails = new Map();
  const addTail = (ev, fn) => {
    if (typeof fn !== "function") return () => {};
    const arr = tails.get(ev) || [];
    arr.push(fn);
    tails.set(ev, arr);
    return () => {
      const a = tails.get(ev);
      if (!a) return;
      const i = a.indexOf(fn);
      if (i >= 0) a.splice(i, 1);
    };
  };
  const runTails = (ev, args) => {
    const arr = tails.get(ev);
    if (!arr?.length) return;
    for (const h of arr.slice()) {
      try { h(...args); } catch (e) { console.error("[lw tail]", e); }
    }
  };

  const makeTailMw = () => {
    const mw = (next) => function patchedEmit(ev, ...args) {
      let r;
      try { r = next.call(this, ev, ...args); }
      catch (e) { queueMicrotask(() => runTails(ev, args)); throw e; }
      if (r && typeof r.then === "function") r.finally(() => runTails(ev, args));
      else queueMicrotask(() => runTails(ev, args));
      return r;
    };
    Object.defineProperty(mw, SYM.ID, { value: true });
    return Object.freeze(mw);
  };

  const ensureAccessor = () => {
    try {
      const d = Object.getOwnPropertyDescriptor(es, "emit");
      if (!es[SYM.ORIG_DESC]) es[SYM.ORIG_DESC] = d || null;
      es[SYM.BASE] ||= getFnFromDesc(d);
      Object.defineProperty(es, "emit", {
        configurable: true,
        enumerable: d?.enumerable ?? true,
        get() { return reapply(); },
        set(v) { if (typeof v === "function") { es[SYM.BASE] = v; queueMicrotask(reapply); } }
      });
    } catch {}
  };

  const reapply = () => {
    try {
      const base =
        es[SYM.BASE] ||
        getFnFromDesc(Object.getOwnPropertyDescriptor(es, "emit")) ||
        es.emit.bind(es);
      const stack = es[SYM.MW_STACK] || (es[SYM.MW_STACK] = []);
      let idx = stack.findIndex((m) => m && m[SYM.ID]);
      if (idx === -1) { stack.push(makeTailMw()); idx = stack.length - 1; }
      if (idx !== stack.length - 1) {
        const mw = stack[idx];
        stack.splice(idx, 1);
        stack.push(mw);
      }
      const composed = compose(base, stack) || base;
      if (!es[SYM.COMPOSED] || es[SYM.COMPOSED]._base !== base || es[SYM.COMPOSED]._stack !== stack) {
        composed._base = base; composed._stack = stack;
        es[SYM.COMPOSED] = composed;
      }
      return es[SYM.COMPOSED];
    } catch { return es.emit; }
  };

  ensureAccessor();
  queueMicrotask(reapply);

  const api = {
    onLast: (e, h) => addTail(e, h),
    removeLast: (e, h) => {
      const a = tails.get(e);
      if (!a) return;
      const i = a.indexOf(h);
      if (i >= 0) a.splice(i, 1);
    },
    uninstall() {
      try {
        const s = es[SYM.MW_STACK];
        const i = Array.isArray(s) ? s.findIndex((m) => m && m[SYM.ID]) : -1;
        if (i >= 0) s.splice(i, 1);
        const orig = es[SYM.ORIG_DESC];
        if (orig) {
          try { Object.defineProperty(es, "emit", orig); }
          catch { Object.defineProperty(es, "emit", { configurable: true, enumerable: true, writable: true, value: es[SYM.BASE] || es.emit }); }
        } else {
          Object.defineProperty(es, "emit", { configurable: true, enumerable: true, writable: true, value: es[SYM.BASE] || es.emit });
        }
      } catch {}
      delete es.__lw_tailInstalled;
      delete es.__lw_tailAPI;
      tails.clear();
    }
  };

  Object.defineProperty(es, "__lw_tailInstalled", { value: true });
  Object.defineProperty(es, "__lw_tailAPI", { value: api });

  return api;
}

/* fetch guard: 尾位固定 + 最小侵入 */
let __installed = false;
const MW_KEY = Symbol.for("lwbox.fetchMiddlewareStack");
const BASE_KEY = Symbol.for("lwbox.fetchBase");
const ORIG_KEY = Symbol.for("lwbox.fetch.origDesc");
const CMP_KEY = Symbol.for("lwbox.fetch.composed");
const ID = Symbol.for("lwbox.middleware.identity");

const getFetchFromDesc = (d) => {
  try {
    if (typeof d?.value === "function") return d.value;
    if (typeof d?.get === "function") {
      const v = d.get.call(window);
      if (typeof v === "function") return v;
    }
  } catch {}
  return globalThis.fetch;
};
const compose = (base, stack) => stack.reduce((acc, mw) => mw(acc), base);

/* 给记录加上超时保护，防止阻塞真实请求 */
const withTimeout = (p, ms = 200) => {
  try {
    return Promise.race([p, new Promise((r) => setTimeout(r, ms))]);
  } catch {
    return p;
  }
};

const ensureAccessor = () => {
  try {
    const d = Object.getOwnPropertyDescriptor(window, "fetch");
    if (!window[ORIG_KEY]) window[ORIG_KEY] = d || null;
    window[BASE_KEY] ||= getFetchFromDesc(d);
    Object.defineProperty(window, "fetch", {
      configurable: true,
      enumerable: d?.enumerable ?? true,
      get() { return reapply(); },
      set(v) { if (typeof v === "function") { window[BASE_KEY] = v; queueMicrotask(reapply); } }
    });
  } catch {}
};
const reapply = () => {
  try {
    const base = window[BASE_KEY] || getFetchFromDesc(Object.getOwnPropertyDescriptor(window, "fetch"));
    const stack = window[MW_KEY] || (window[MW_KEY] = []);
    let idx = stack.findIndex((m) => m && m[ID]);
    if (idx === -1) { stack.push(makeMw()); idx = stack.length - 1; }
    if (idx !== stack.length - 1) {
      const mw = stack[idx];
      window[MW_KEY].splice(idx, 1);
      window[MW_KEY].push(mw);
    }
    const composed = compose(base, stack) || base;
    if (!window[CMP_KEY] || window[CMP_KEY]._base !== base || window[CMP_KEY]._stack !== stack) {
      composed._base = base; composed._stack = stack;
      window[CMP_KEY] = composed;
    }
    return window[CMP_KEY];
  } catch { return globalThis.fetch; }
};

function makeMw() {
  const mw = (next) => async function f(input, options = {}) {
    try {
      if (await isTarget(input, options)) {
        if (S.isPreview || S.isLong) {
          const url = input instanceof Request ? input.url : input;
          return interceptPreview(url, options).catch(() =>
            new Response(JSON.stringify({ error: { message: "拦截失败，请手动中止消息生成。" } }), { status: 200, headers: { "Content-Type": "application/json" } })
          );
        } else {
          try { await withTimeout(recordReal(input, options)); } catch {}
        }
      }
    } catch {}
    return Reflect.apply(next, this, arguments);
  };
  Object.defineProperty(mw, ID, { value: true, enumerable: false });
  return Object.freeze(mw);
}
function installFetch() {
  if (__installed) return; __installed = true;
  try {
    window[MW_KEY] ||= [];
    window[BASE_KEY] ||= getFetchFromDesc(Object.getOwnPropertyDescriptor(window, "fetch"));
    ensureAccessor();
    if (!window[MW_KEY].some((m) => m && m[ID])) window[MW_KEY].push(makeMw());
    else {
      const i = window[MW_KEY].findIndex((m) => m && m[ID]);
      if (i !== window[MW_KEY].length - 1) {
        const mw = window[MW_KEY][i];
        window[MW_KEY].splice(i, 1);
        window[MW_KEY].push(mw);
      }
    }
    queueMicrotask(reapply);
    window.addEventListener("pageshow", reapply, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") reapply();
    }, { passive: true });
    window.addEventListener("focus", reapply, { passive: true });
  } catch (e) { console.error("[LittleWhiteBox] fetch guard err", e); }
}
function uninstallFetch() {
  if (!__installed) return;
  try {
    const s = window[MW_KEY];
    const i = Array.isArray(s) ? s.findIndex((m) => m && m[ID]) : -1;
    if (i >= 0) s.splice(i, 1);
    const others = Array.isArray(window[MW_KEY]) && window[MW_KEY].length;
    const orig = window[ORIG_KEY];
    if (!others) {
      if (orig) {
        try { Object.defineProperty(window, "fetch", orig); }
        catch { Object.defineProperty(window, "fetch", { configurable: true, enumerable: true, writable: true, value: window[BASE_KEY] || globalThis.fetch }); }
      } else {
        Object.defineProperty(window, "fetch", { configurable: true, enumerable: true, writable: true, value: window[BASE_KEY] || globalThis.fetch });
      }
    } else {
      reapply();
    }
  } catch (e) { console.error("[LittleWhiteBox] fetch guard uninstall err", e); }
  __installed = false;
}
const setupFetch = () => { if (!S.active) { installFetch(); S.active = true; } };
const restoreFetch = () => { if (S.active) { uninstallFetch(); S.active = false; } };
const updateFetchState = () => { const st = getSettings(), need = (st.preview.enabled || st.recorded.enabled); if (need && !S.active) setupFetch(); if (!need && S.active) restoreFetch(); };

/* record/history */
const pushHistory = (r) => { S.history.unshift(r); if (S.history.length > C.MAX_HISTORY) S.history.length = C.MAX_HISTORY; };
const extractUser = (ms) => { if (!Array.isArray(ms)) return ""; for (let i = ms.length - 1; i >= 0; i--) if (ms[i]?.role === "user") return ms[i].content || ""; return ""; };
async function recordReal(input, options) {
  try {
    const url = input instanceof Request ? input.url : input;
    const body = await safeReadBodyFromInput(input, options);
    if (!body) return;
    const data = safeJson(body) || {}, ctx = getContext();
    pushHistory({
      url, method: options?.method || (input instanceof Request ? input.method : "POST"), requestData: data, messages: data.messages || [],
      model: data.model || "Unknown", timestamp: now(), messageId: ctx.chat?.length || 0,
      characterName: ctx.characters?.[ctx.characterId]?.name || "Unknown", userInput: extractUser(data.messages || []), isRealRequest: true
    });
    setTimeout(() => { if (S.history[0] && !S.history[0].associatedMessageId) S.history[0].associatedMessageId = ctx.chat?.length || 0; }, C.ASSOC_DELAY);
  } catch {}
}
const findRec = (id) => {
  if (!S.history.length) return null;
  const preds = [(r) => r.associatedMessageId === id, (r) => r.messageId === id, (r) => r.messageId === id - 1, (r) => Math.abs(r.messageId - id) <= 1];
  for (const p of preds) { const m = S.history.find(p); if (m) return m; }
  const cs = S.history.filter((r) => r.messageId <= id + 2);
  return cs.length ? cs.sort((a, b) => b.messageId - a.messageId)[0] : S.history[0];
};

/* preview intercept */
// 精简后的持续拦截：仅弹窗与伪响应；不进行 DOM 拦截/劫持/记录等
async function interceptPreview(url, options) {
  const body = await safeReadBodyFromInput(url, options);
  const data = safeJson(body) || {};
  const userInput = extractUser(data?.messages || []);
  S.previewData = {
    url,
    method: options?.method || "POST",
    requestData: data,
    messages: data?.messages || [],
    model: data?.model || "Unknown",
    timestamp: now(),
    userInput,
    isPreview: true
  };

  if (S.isLong) {
    setTimeout(() => {
      displayPreview(S.previewData);
    }, 100);
  } else if (S.resolve) {
    S.resolve({ success: true, data: S.previewData });
    S.resolve = S.reject = null;
  }

  // 单次拦截保持原行为：空内容；持续拦截返回“这是已拦截消息”
  const payload = S.isLong
    ? {
        choices: [{ message: { content: "【小白X】已拦截消息" }, finish_reason: "stop" }],
        intercepted: true
      }
    : {
        choices: [{ message: { content: "" }, finish_reason: "stop" }]
      };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

/* DOM bypass + push hijack —— 保留用于单次拦截，不用于持续拦截 */
let __mo = null;
const startBypass = () => {
  if (__mo) return; const chat = document.querySelector("#chat"); if (!chat) return;
  __mo = new MutationObserver((muts) => {
    if (!S.isPreview && !S.isLong) return;
    for (const m of muts) m.addedNodes?.forEach((n) => {
      if (n instanceof HTMLElement && n.classList.contains("mes")) {
        const id = parseInt(n.getAttribute("mesid") || ""); if (!Number.isNaN(id)) recordInterceptedId(id); n.remove();
      }
    });
  });
  __mo.observe(chat, { childList: true, subtree: true });
};
const stopBypass = () => { if (__mo) { try { __mo.disconnect(); } catch {} __mo = null; } };
function hijackPush() {
  const ctx = getContext(), orig = ctx.chat.push, before = ctx.chat.length; startBypass();
  ctx.chat.push = function (...items) {
    const s = this.length, res = orig.apply(this, items);
    if (S.isPreview || S.isLong) for (let i = 0; i < items.length; i++) { const id = s + i; S.previewIds.add(id); if (S.isPreview) recordInterceptedId(id); }
    return res;
  };
  return function restore() {
    ctx.chat.push = orig; stopBypass();
    if (S.previewIds.size) {
      const ids = [...S.previewIds].sort((a, b) => b - a);
      ids.forEach((id) => { if (id < ctx.chat.length) ctx.chat.splice(id, 1); $(`#chat .mes[mesid="${id}"]`).remove(); });
      while (ctx.chat.length > before) ctx.chat.pop();
      S.previewIds.clear();
    }
  };
}
const waitIntercept = () => new Promise((resolve, reject) => {
  const t = setTimeout(() => { if (S.resolve) { S.resolve({ success: false, error: `等待超时 (${getSettings().preview.timeoutSeconds}秒)` }); S.resolve = S.reject = null; } }, getSettings().preview.timeoutSeconds * 1000);
  S.resolve = (v) => { clearTimeout(t); resolve(v); }; S.reject = (e) => { clearTimeout(t); reject(e); };
});

/* mirror/format */
const MIRROR = { MERGE: "merge", MERGE_TOOLS: "merge_tools", SEMI: "semi", SEMI_TOOLS: "semi_tools", STRICT: "strict", STRICT_TOOLS: "strict_tools", SINGLE: "single" };
const roleMap = { system: { label: "SYSTEM:", color: "#F7E3DA" }, user: { label: "USER:", color: "#F0ADA7" }, assistant: { label: "ASSISTANT:", color: "#6BB2CC" } };
const colorXml = (t) => (typeof t === "string" ? t.replace(/<([^>]+)>/g, '<span style="color:#999; font-weight:bold;">&lt;$1&gt;</span>') : t);
const getNames = (req) => {
  const n = { charName: String(req?.char_name || ""), userName: String(req?.user_name || ""), groupNames: Array.isArray(req?.group_names) ? req.group_names.map(String) : [] };
  n.startsWithGroupName = (m) => n.groupNames.some((g) => String(m || "").startsWith(`${g}: `));
  return n;
};
const toText = (m) => {
  const c = m?.content;
  if (typeof c === "string") return c;
  if (Array.isArray(c)) return c.map((p) => p?.type === "text" ? String(p.text || "") : p?.type === "image_url" ? "[image]" : p?.type === "video_url" ? "[video]" : typeof p === "string" ? p : (typeof p?.content === "string" ? p.content : "")).filter(Boolean).join("\n\n");
  return String(c || "");
};
const applyName = (m, n) => {
  const { role, name } = m; let t = toText(m);
  if (role === "system" && name === "example_assistant") { if (n.charName && !t.startsWith(`${n.charName}: `) && !n.startsWithGroupName(t)) t = `${n.charName}: ${t}`; }
  else if (role === "system" && name === "example_user") { if (n.userName && !t.startsWith(`${n.userName}: `)) t = `${n.userName}: ${t}`; }
  else if (name && role !== "system" && !t.startsWith(`${name}: `)) t = `${name}: ${t}`;
  return { ...m, content: t, name: undefined };
};
function mergeMessages(messages, names, { strict = false, placeholders = false, single = false, tools = false } = {}) {
  if (!Array.isArray(messages)) return [];
  let mapped = messages.map((m) => applyName({ ...m }, names)).map((x) => {
    const m = { ...x };
    if (!tools) { if (m.role === "tool") m.role = "user"; delete m.tool_calls; delete m.tool_call_id; }
    if (single) {
      if (m.role === "assistant") { const t = String(m.content || ""); if (names.charName && !t.startsWith(`${names.charName}: `) && !names.startsWithGroupName(t)) m.content = `${names.charName}: ${t}`; }
      if (m.role === "user") { const t = String(m.content || ""); if (names.userName && !t.startsWith(`${names.userName}: `)) m.content = `${names.userName}: ${t}`; }
      m.role = "user";
    }
    return m;
  });
  const squash = (arr) => {
    const out = [];
    for (const m of arr) {
      if (out.length && out[out.length - 1].role === m.role && String(m.content || "").length && m.role !== "tool") out[out.length - 1].content += `\n\n${m.content}`;
      else out.push(m);
    }
    return out;
  };
  let sq = squash(mapped);
  if (strict) {
    for (let i = 0; i < sq.length; i++) if (i > 0 && sq[i].role === "system") sq[i].role = "user";
    if (placeholders) {
      if (!sq.length) sq.push({ role: "user", content: "[Start a new chat]" });
      else if (sq[0].role === "system" && (sq.length === 1 || sq[1].role !== "user")) sq.splice(1, 0, { role: "user", content: "[Start a new chat]" });
      else if (sq[0].role !== "system" && sq[0].role !== "user") sq.unshift({ role: "user", content: "[Start a new chat]" });
    }
    return squash(sq);
  }
  if (!sq.length) sq.push({ role: "user", content: "[Start a new chat]" });
  return sq;
}
function mirror(requestData) {
  try {
    let type = String(requestData?.custom_prompt_post_processing || "").toLowerCase();
    const source = String(requestData?.chat_completion_source || "").toLowerCase();
    if (source === "perplexity") type = MIRROR.STRICT;
    const names = getNames(requestData || {}), src = Array.isArray(requestData?.messages) ? JSON.parse(JSON.stringify(requestData.messages)) : [];
    const mk = (o) => mergeMessages(src, names, o);
    switch (type) {
      case MIRROR.MERGE: return mk({ strict: false });
      case MIRROR.MERGE_TOOLS: return mk({ strict: false, tools: true });
      case MIRROR.SEMI: return mk({ strict: true });
      case MIRROR.SEMI_TOOLS: return mk({ strict: true, tools: true });
      case MIRROR.STRICT: return mk({ strict: true, placeholders: true });
      case MIRROR.STRICT_TOOLS: return mk({ strict: true, placeholders: true, tools: true });
      case MIRROR.SINGLE: return mk({ strict: true, single: true });
      default: return src;
    }
  } catch { return Array.isArray(requestData?.messages) ? requestData.messages : []; }
}
const finalMsgs = (d) => { try { if (d?.requestData?.messages) return mirror(d.requestData); if (Array.isArray(d?.messages)) return d.messages; return []; } catch { return Array.isArray(d?.messages) ? d.messages : []; } };
const formatPreview = (d) => {
  const msgs = finalMsgs(d); let out = `↓酒馆日志↓(已整理好json格式使其更具可读性) (${msgs.length}):\n${"-".repeat(30)}\n`;
  msgs.forEach((m, i) => {
    const txt = m.content || "", rm = roleMap[m.role] || { label: `${String(m.role || "").toUpperCase()}:`, color: "#FFF" };
    out += `<div style="color:${rm.color};font-weight:bold;margin-top:${i ? "15px" : "0"};">${rm.label}</div>`;
    out += /<[^>]+>/g.test(txt) ? `<pre style="white-space:pre-wrap;margin:5px 0;color:${rm.color};">${colorXml(txt)}</pre>` : `<div style="margin:5px 0;color:${rm.color};white-space:pre-wrap;">${txt}</div>`;
  });
  return out;
};

// 仅保留 messages 字段（其余全部隐藏）
const stripTop = (o) => {
  try {
    if (!o || typeof o !== "object") return o;
    if (Array.isArray(o)) return o;
    const messages = Array.isArray(o.messages) ? JSON.parse(JSON.stringify(o.messages)) : undefined;
    return typeof messages !== "undefined" ? { messages } : {};
  } catch { return {}; }
};

const formatRaw = (d) => {
  try {
    const hasReq = Array.isArray(d?.requestData?.messages), hasMsgs = !hasReq && Array.isArray(d?.messages);
    let obj;
    if (hasReq) { const req = JSON.parse(JSON.stringify(d.requestData)); try { req.messages = mirror(req); } catch {} obj = req; }
    else if (hasMsgs) { const fake = { ...(d || {}), messages: d.messages }; let mm = null; try { mm = mirror(fake); } catch {} obj = { ...(d || {}), messages: mm || d.messages }; }
    else obj = d?.requestData ?? d;
    obj = stripTop(obj);
    return colorXml(JSON.stringify(obj, null, 2));
  } catch { try { return colorXml(String(d)); } catch { return ""; } }
};
const buildPreviewHtml = (d) => {
  const formatted = formatPreview(d), raw = formatRaw(d);
  return `<div class="message-preview-container"><div class="message-preview-content-box"><div class="mp-state-formatted">${formatted}</div><pre class="mp-state-raw" style="display:none; white-space:pre-wrap; margin-top:8px;">${raw}</pre></div></div>`;
};
const toggleRaw = (e) => {
  const btn = e?.currentTarget, dlg = btn?.closest(".popup"), box = dlg?.querySelector(".message-preview-content-box");
  const f = box?.querySelector(".mp-state-formatted"), r = box?.querySelector(".mp-state-raw"); if (!(f && r)) return;
  const showRaw = r.style.display === "none"; r.style.display = showRaw ? "block" : "none"; f.style.display = showRaw ? "none" : "block"; btn.textContent = showRaw ? "切换整理格式" : "切换原始格式";
};
const openPopup = async (html, title) => {
  await callGenericPopup(html, POPUP_TYPE.TEXT, title, { wide: true, large: true, customButtons: [{ text: "切换原始格式", classes: ["interactable", "popup-button-toggle-raw"], action: toggleRaw }] });
};
const displayPreview = async (d) => { try { await openPopup(buildPreviewHtml(d), "消息拦截"); } catch { toastr.error("显示拦截失败"); } };

/* UI/send */
const disableSend = (dis = true) => {
  const $b = $q("#send_but");
  if (dis) { S.sendBtnWasDisabled = $b.prop("disabled"); $b.prop("disabled", true).off("click.preview-block").on("click.preview-block", (e) => { e.preventDefault(); e.stopImmediatePropagation(); return false; }); }
  else { $b.prop("disabled", S.sendBtnWasDisabled).off("click.preview-block"); S.sendBtnWasDisabled = false; }
};
const triggerSend = () => {
  const $b = $q("#send_but"), $t = $q("#send_textarea"), txt = String($t.val() || ""); if (!txt.trim()) return false;
  const was = $b.prop("disabled"); $b.prop("disabled", false); $b[0].dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window })); if (was) $b.prop("disabled", true); return true;
};

/* preview actions */
async function showPreview() {
  let restore = null, toast = null, backup = null;
  try {
    const set = getSettings(); if (!set.preview.enabled || !geEnabled()) return toastr.warning("消息拦截功能未启用");
    const text = String($q("#send_textarea").val() || "").trim(); if (!text) return toastr.error("请先输入消息内容");
    backup = text; disableSend(true);
    S.isPreview = true; S.previewData = null; S.previewIds.clear(); S.previewAbort = new AbortController();
    restore = hijackPush();
    toast = toastr.info(`正在拦截请求...（${set.preview.timeoutSeconds}秒超时）`, "消息拦截", { timeOut: 0, tapToDismiss: false });
    if (!triggerSend()) throw new Error("无法触发发送事件");
    const res = await waitIntercept().catch((e) => ({ success: false, error: e?.message || e }));
    if (toast) { toastr.clear(toast); toast = null; }
    if (res.success) { await displayPreview(res.data); toastr.success("拦截成功！", "", { timeOut: 3000 }); }
    else toastr.error(`拦截失败: ${res.error}`, "", { timeOut: 5000 });
  } catch (e) {
    if (toast) toastr.clear(toast); toastr.error(`拦截异常: ${e.message}`, "", { timeOut: 5000 });
  } finally {
    try { S.previewAbort?.abort("拦截结束"); } catch {} S.previewAbort = null;
    if (S.resolve) S.resolve({ success: false, error: "拦截已取消" }); S.resolve = S.reject = null;
    try { restore?.(); } catch {}
    S.isPreview = false; S.previewData = null; disableSend(false); if (backup) $q("#send_textarea").val(backup);
  }
}
async function showHistoryPreview(messageId) {
  try {
    const set = getSettings(); if (!set.recorded.enabled || !geEnabled()) return;
    const rec = findRec(messageId);
    if (rec?.messages?.length || rec?.requestData?.messages?.length) await openPopup(buildPreviewHtml({ ...rec, isHistoryPreview: true, targetMessageId: messageId }), `消息历史查看 - 第 ${messageId + 1} 条消息`);
    else toastr.warning(`未找到第 ${messageId + 1} 条消息的API请求记录`);
  } catch { toastr.error("查看历史消息失败"); }
}
const addHistoryButtonsDebounced = debounce(() => {
  const set = getSettings(); if (!set.recorded.enabled || !geEnabled()) return;
  $(".mes_history_preview").remove();
  $("#chat .mes").each(function () {
    const id = parseInt($(this).attr("mesid")), isUser = $(this).attr("is_user") === "true";
    if (id <= 0 || isUser) return;
    const btn = $(`<div class="mes_btn mes_history_preview" title="查看历史API请求"><i class="fa-regular fa-note-sticky"></i></div>`).on("click", (e) => { e.preventDefault(); e.stopPropagation(); showHistoryPreview(id); });
    if (window.registerButtonToSubContainer && window.registerButtonToSubContainer(id, btn[0])) return;
    $(this).find(".flex-container.flex1.alignitemscenter").append(btn);
  });
}, C.DEBOUNCE);

/* small utils */
const cleanupMemory = () => {
  if (S.history.length > C.MAX_HISTORY) S.history = S.history.slice(0, C.MAX_HISTORY);
  S.previewIds.clear(); S.previewData = null; $(".mes_history_preview").each(function () { if (!$(this).closest(".mes").length) $(this).remove(); });
  if (!S.isLong) S.interceptedIds = [];
};
function onLast(ev, handler) {
  if (typeof eventSource.makeLast === "function") {
    eventSource.makeLast(ev, handler);
    S.listeners.push({ e: ev, h: handler, off: () => {} });
    return;
  }
  if (S.tailAPI?.onLast) {
    const off = S.tailAPI.onLast(ev, handler);
    S.listeners.push({ e: ev, h: handler, off });
    return;
  }
  const tail = (...args) => queueMicrotask(() => { try { handler(...args); } catch (e) { console.error("[lw tail]", e); } });
  eventSource.on(ev, tail);
  S.listeners.push({ e: ev, h: tail, off: () => eventSource.removeListener?.(ev, tail) });
}
const addEvents = () => {
  removeEvents();
  [
    { e: event_types.MESSAGE_RECEIVED, h: addHistoryButtonsDebounced },
    { e: event_types.CHARACTER_MESSAGE_RENDERED, h: addHistoryButtonsDebounced },
    { e: event_types.USER_MESSAGE_RENDERED, h: addHistoryButtonsDebounced },
    { e: event_types.CHAT_CHANGED, h: () => { S.history = []; setTimeout(addHistoryButtonsDebounced, C.CHECK); } },
    { e: event_types.MESSAGE_RECEIVED, h: (messageId) => setTimeout(() => { const r = S.history.find((x) => !x.associatedMessageId && now() - x.timestamp < C.REQ_WINDOW); if (r) r.associatedMessageId = messageId; }, 100) },
  ].forEach(({ e, h }) => onLast(e, h));
  const late = (payload) => {
    try {
      const ctx = getContext();
      pushHistory({
        url: C.TARGET, method: "POST", requestData: payload, messages: payload?.messages || [], model: payload?.model || "Unknown",
        timestamp: now(), messageId: ctx.chat?.length || 0, characterName: ctx.characters?.[ctx.characterId]?.name || "Unknown",
        userInput: extractUser(payload?.messages || []), isRealRequest: true, source: "settings_ready",
      });
    } catch {}
    queueMicrotask(() => updateFetchState());
  };
  if (typeof eventSource.makeLast === "function") { eventSource.makeLast(event_types.CHAT_COMPLETION_SETTINGS_READY, late); S.listeners.push({ e: event_types.CHAT_COMPLETION_SETTINGS_READY, h: late, off: () => {} }); }
  else if (S.tailAPI?.onLast) { const off = S.tailAPI.onLast(event_types.CHAT_COMPLETION_SETTINGS_READY, late); S.listeners.push({ e: event_types.CHAT_COMPLETION_SETTINGS_READY, h: late, off }); }
  else { ON(event_types.CHAT_COMPLETION_SETTINGS_READY, late); S.listeners.push({ e: event_types.CHAT_COMPLETION_SETTINGS_READY, h: late, off: () => OFF(event_types.CHAT_COMPLETION_SETTINGS_READY, late) }); queueMicrotask(() => { try { OFF(event_types.CHAT_COMPLETION_SETTINGS_READY, late); } catch {} try { ON(event_types.CHAT_COMPLETION_SETTINGS_READY, late); } catch {} }); }
};
const removeEvents = () => { S.listeners.forEach(({ e, h, off }) => { if (typeof off === "function") { try { off(); } catch {} } else { try { OFF(e, h); } catch {} } }); S.listeners = []; };

/* long mode —— 精简版：不再劫持 DOM/push/记录，仅切换状态与UI提示 */
const toggleLong = () => {
  S.isLong = !S.isLong;
  const $b = $q("#message_preview_btn");
  if (S.isLong) {
    $b.css("color", "red");
    toastr.info("持续拦截已开启", "", { timeOut: 2000 });
  } else {
    $b.css("color", "");
    toastr.info("持续拦截已关闭", "", { timeOut: 2000 });
  }
};
const bindBtn = () => {
  const $b = $q("#message_preview_btn");
  $b.on("mousedown touchstart", () => { S.longPressTimer = setTimeout(() => toggleLong(), S.longPressDelay); });
  $b.on("mouseup touchend mouseleave", () => { if (S.longPressTimer) { clearTimeout(S.longPressTimer); S.longPressTimer = null; } });
  $b.on("click", () => { if (S.longPressTimer) { clearTimeout(S.longPressTimer); S.longPressTimer = null; return; } if (!S.isLong) showPreview(); });
};
const recordInterceptedId = (id) => { if ((S.isPreview || S.isLong) && !S.interceptedIds.includes(id)) S.interceptedIds.push(id); };

async function deleteMessageById(id) {
  try {
    const ctx = getContext();
    /* global deleteLastMessage */
    if (id === ctx.chat?.length - 1) { if (typeof deleteLastMessage === "function") { await deleteLastMessage(); return true; } }
    if (ctx.chat && ctx.chat[id]) { ctx.chat.splice(id, 1); $(`#chat .mes[mesid="${id}"]`).remove(); if (ctx.chat_metadata) ctx.chat_metadata.tainted = true; return true; }
    const el = $(`#chat .mes[mesid="${id}"]`); if (el.length) { el.remove(); return true; }
    return false;
  } catch { return false; }
}
async function deleteInterceptedMessages() {
  try {
    if (!S.interceptedIds.length) return;
    const ids = [...S.interceptedIds].sort((a, b) => b - a); let n = 0;
    for (const id of ids) if (await deleteMessageById(id)) n++;
    S.interceptedIds = []; try { if (typeof saveChatConditional === "function") await saveChatConditional(); } catch {}
    if (n) toastr.success(`拦截模式下的 ${n} 条消息已自动删除`, "", { timeOut: 2000 });
  } catch { toastr.error("删除拦截消息失败"); }
}

/* lifecycle */
function cleanup() {
  removeEvents(); restoreFetch(); disableSend(false);
  $(".mes_history_preview").remove(); $("#message_preview_btn").remove(); cleanupMemory();
  Object.assign(S, { resolve: null, reject: null, isPreview: false, isLong: false, interceptedIds: [], chatLenBefore: 0, sendBtnWasDisabled: false });
  if (S.longPressTimer) { clearTimeout(S.longPressTimer); S.longPressTimer = null; }
  if (S.restoreLong) { try { S.restoreLong(); } catch {} S.restoreLong = null; }
  stopBypass();
}
function initMessagePreview() {
  try {
    cleanup(); S.tailAPI = installEventSourceTail(eventSource);
    const set = getSettings();
    const btn = $(`<div id="message_preview_btn" class="fa-regular fa-note-sticky interactable" title="预览消息"></div>`);
    $("#send_but").before(btn); bindBtn();
    $("#xiaobaix_preview_enabled").prop("checked", set.preview.enabled).on("change", function () {
      if (!geEnabled()) return; set.preview.enabled = $(this).prop("checked"); saveSettingsDebounced();
      $("#message_preview_btn").toggle(set.preview.enabled);
      if (set.preview.enabled) { if (!S.cleanTimer) S.cleanTimer = setInterval(cleanupMemory, C.CLEAN); }
      else { if (S.cleanTimer) { clearInterval(S.cleanTimer); S.cleanTimer = null; } }
      updateFetchState();
      if (!set.preview.enabled && set.recorded.enabled) { addEvents(); addHistoryButtonsDebounced(); }
    });
    $("#xiaobaix_recorded_enabled").prop("checked", set.recorded.enabled).on("change", function () {
      if (!geEnabled()) return; set.recorded.enabled = $(this).prop("checked"); saveSettingsDebounced();
      if (set.recorded.enabled) { addEvents(); addHistoryButtonsDebounced(); }
      else { $(".mes_history_preview").remove(); S.history.length = 0; if (!set.preview.enabled) removeEvents(); }
      updateFetchState();
    });
    if (!set.preview.enabled) $("#message_preview_btn").hide();
    updateFetchState(); if (set.recorded.enabled) addHistoryButtonsDebounced();
    if (set.preview.enabled || set.recorded.enabled) addEvents();
    if (window.registerModuleCleanup) window.registerModuleCleanup("messagePreview", cleanup);
    if (set.preview.enabled) S.cleanTimer = setInterval(cleanupMemory, C.CLEAN);
  } catch { toastr.error("模块初始化失败"); }
}

window.addEventListener("beforeunload", cleanup);
window.messagePreviewCleanup = cleanup;

export { initMessagePreview, addHistoryButtonsDebounced, cleanup };
