import { extension_settings, getContext } from "../../../../extensions.js";
import { saveSettingsDebounced, eventSource, event_types } from "../../../../../script.js";
import { EXT_ID } from "../core/constants.js";

const C = { MAX_HISTORY: 10, CHECK: 200, DEBOUNCE: 300, CLEAN: 300000, TARGET: "/api/backends/chat-completions/generate", TIMEOUT: 30, ASSOC_DELAY: 1000, REQ_WINDOW: 30000 };
const S = { active: false, isPreview: false, isLong: false, isHistoryUiBound: false, previewData: null, previewIds: new Set(), interceptedIds: [], history: [], listeners: [], resolve: null, reject: null, sendBtnWasDisabled: false, longPressTimer: null, longPressDelay: 1000, chatLenBefore: 0, restoreLong: null, cleanTimer: null, previewAbort: null, tailAPI: null, genEndedOff: null, cleanupFallback: null, pendingPurge: false };

const $q = (sel) => $(sel);
const ON = (e, c) => eventSource.on(e, c);
const OFF = (e, c) => eventSource.removeListener(e, c);
const now = () => Date.now();
const geEnabled = () => { try { return ("isXiaobaixEnabled" in window) ? !!window.isXiaobaixEnabled : true; } catch { return true; } };
const debounce = (fn, w) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), w); }; };
const safeJson = (t) => { try { return JSON.parse(t); } catch { return null; } };

const readText = async (b) => { try { if (!b) return ""; if (typeof b === "string") return b; if (b instanceof Blob) return await b.text(); if (b instanceof URLSearchParams) return b.toString(); if (typeof b === "object" && typeof b.text === "function") return await b.text(); } catch { } return ""; };

function isSafeBody(body) { if (!body) return true; return (typeof body === "string" || body instanceof Blob || body instanceof URLSearchParams || body instanceof ArrayBuffer || ArrayBuffer.isView(body) || (typeof FormData !== "undefined" && body instanceof FormData)); }

async function safeReadBodyFromInput(input, options) { try { if (input instanceof Request) return await readText(input.clone()); const body = options?.body; if (!isSafeBody(body)) return ""; return await readText(body); } catch { return ""; } }

const isGen = (u) => String(u || "").includes(C.TARGET);
const isTarget = async (input, opt = {}) => { try { const url = input instanceof Request ? input.url : input; if (!isGen(url)) return false; const text = await safeReadBodyFromInput(input, opt); return text ? text.includes('"messages"') : true; } catch { return input instanceof Request ? isGen(input.url) : isGen(input); } };
const getSettings = () => { const d = extension_settings[EXT_ID] || (extension_settings[EXT_ID] = {}); d.preview = d.preview || { enabled: false, timeoutSeconds: C.TIMEOUT }; d.recorded = d.recorded || { enabled: true }; d.preview.timeoutSeconds = C.TIMEOUT; return d; };

function injectPreviewModalStyles() {
  if (document.getElementById('message-preview-modal-styles')) return;
  const style = document.createElement('style');
  style.id = 'message-preview-modal-styles';
  style.textContent = `
    .mp-overlay{position:fixed;inset:0;background:none;z-index:9999;display:flex;align-items:center;justify-content:center;pointer-events:none}
    .mp-modal{
      width:clamp(360px,55vw,860px);
      max-width:95vw;
      background:var(--SmartThemeBlurTintColor);
      border:2px solid var(--SmartThemeBorderColor);
      border-radius:10px;
      box-shadow:0 8px 16px var(--SmartThemeShadowColor);
      pointer-events:auto;
      display:flex;
      flex-direction:column;
      height:80vh;
      max-height:calc(100vh - 60px);
      resize:both;
      overflow:hidden;
    }
    .mp-header{display:flex;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--SmartThemeBorderColor);font-weight:600;cursor:move;flex-shrink:0}
    .mp-body{height:60vh;overflow:hidden;padding:10px;flex:1;min-height:160px}
    .mp-footer{display:flex;gap:8px;justify-content:flex-end;padding:12px 14px;border-top:1px solid var(--SmartThemeBorderColor);flex-shrink:0;max-width:100%;box-sizing:border-box}
    .mp-close{cursor:pointer}
    .mp-btn{cursor:pointer;border:1px solid var(--SmartThemeBorderColor);background:var(--SmartThemeBlurTintColor);padding:6px 10px;border-radius:6px}
    .mp-tabs{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-right:auto;min-width:0}
    .mp-tab-btn{padding:5px 10px;font-size:12px;line-height:1}
    .mp-tab-btn.active{background:var(--SmartThemeBorderColor);color:var(--SmartThemeBodyColor)}
    .mp-search-input{padding:4px 8px;border:1px solid var(--SmartThemeBorderColor);border-radius:4px;background:var(--SmartThemeShadowColor);color:inherit;font-size:12px;width:120px}
    .mp-search-btn{padding:4px 6px;font-size:12px;min-width:24px;text-align:center}
    .mp-search-info{font-size:12px;opacity:.8;white-space:nowrap}
    .message-preview-container{height:100%;min-height:0}
    .message-preview-content-box{height:100%;overflow:auto;box-sizing:border-box;max-width:100%}
    .mp-view{display:none;height:100%;min-height:0}
    .mp-view.active{display:block}
    .mp-state-raw,.mp-state-backend{margin:0;white-space:pre;tab-size:2;font-family:monospace;min-width:max-content}
    .mp-backend-note{padding:6px 10px;margin:0 0 10px;border:1px dashed var(--SmartThemeBorderColor);border-radius:6px;font-size:12px;opacity:.85}
    .mp-highlight{background-color:yellow;color:black;padding:1px 2px;border-radius:2px}
    .mp-highlight.current{background-color:orange;font-weight:bold}
    @media (max-width:999px){
      .mp-overlay{position:absolute;inset:0;align-items:flex-start}
      .mp-modal{width:100%;max-width:100%;max-height:100%;margin:0;border-radius:10px 10px 0 0;height:100vh;resize:none}
      .mp-header{padding:8px 14px}
      .mp-body{padding:8px}
      .mp-footer{padding:8px 14px;flex-wrap:wrap;gap:6px}
      .mp-search-input{width:150px}
    }
  `;
  document.head.appendChild(style);
}

function setupModalDrag(modal, overlay, header) {
  modal.style.position = 'absolute';
  modal.style.left = '50%';
  modal.style.top = '50%';
  modal.style.transform = 'translate(-50%, -50%)';

  let dragging = false, sx = 0, sy = 0, sl = 0, st = 0;

  function onDown(e) {
    if (!(e instanceof PointerEvent) || e.button !== 0) return;
    dragging = true;
    const overlayRect = overlay.getBoundingClientRect();
    const rect = modal.getBoundingClientRect();
    modal.style.left = (rect.left - overlayRect.left) + 'px';
    modal.style.top = (rect.top - overlayRect.top) + 'px';
    modal.style.transform = '';
    sx = e.clientX; sy = e.clientY;
    sl = parseFloat(modal.style.left) || 0;
    st = parseFloat(modal.style.top) || 0;
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp, { once: true });
    e.preventDefault();
  }

  function onMove(e) {
    if (!dragging) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    let nl = sl + dx, nt = st + dy;
    const maxLeft = (overlay.clientWidth || overlay.getBoundingClientRect().width) - modal.offsetWidth;
    const maxTop = (overlay.clientHeight || overlay.getBoundingClientRect().height) - modal.offsetHeight;
    nl = Math.max(0, Math.min(maxLeft, nl));
    nt = Math.max(0, Math.min(maxTop, nt));
    modal.style.left = nl + 'px';
    modal.style.top = nt + 'px';
  }

  function onUp() {
    dragging = false;
    window.removeEventListener('pointermove', onMove);
  }

  header.addEventListener('pointerdown', onDown);
}

function createMovableModal(title, content) {
  injectPreviewModalStyles();
  const overlay = document.createElement('div');
  overlay.className = 'mp-overlay';
  const modal = document.createElement('div');
  modal.className = 'mp-modal';
  const header = document.createElement('div');
  header.className = 'mp-header';
  // Template-only UI markup (title is escaped by caller).
  // eslint-disable-next-line no-unsanitized/property
  header.innerHTML = `<span>${title}</span><span class="mp-close">✕</span>`;
  const body = document.createElement('div');
  body.className = 'mp-body';
  // Content is already escaped before building the preview.
  // eslint-disable-next-line no-unsanitized/property
  body.innerHTML = content;
  const footer = document.createElement('div');
  footer.className = 'mp-footer';
  // Template-only UI markup.
  // eslint-disable-next-line no-unsanitized/property
  footer.innerHTML = `
    <div class="mp-tabs">
      <button class="mp-btn mp-tab-btn active" data-view="beautified" id="mp-view-beautified">美化</button>
      <button class="mp-btn mp-tab-btn" data-view="raw" id="mp-view-raw">原始JSON</button>
      <button class="mp-btn mp-tab-btn" data-view="backend" id="mp-view-backend">模拟后端</button>
    </div>
    <input type="text" class="mp-search-input" placeholder="搜索..." />
    <button class="mp-btn mp-search-btn" id="mp-search-prev">↑</button>
    <button class="mp-btn mp-search-btn" id="mp-search-next">↓</button>
    <span class="mp-search-info" id="mp-search-info"></span>
    <button class="mp-btn" id="mp-focus-search">搜索</button>
    <button class="mp-btn" id="mp-close">关闭</button>
  `;
  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  overlay.appendChild(modal);
  setupModalDrag(modal, overlay, header);

  let searchResults = [];
  let currentIndex = -1;
  const searchInput = footer.querySelector('.mp-search-input');
  const searchInfo = footer.querySelector('#mp-search-info');
  const prevBtn = footer.querySelector('#mp-search-prev');
  const nextBtn = footer.querySelector('#mp-search-next');
  const tabBtns = [...footer.querySelectorAll('.mp-tab-btn')];
  let activeView = 'beautified';

  const getActiveView = () => body.querySelector(`.mp-view[data-view="${activeView}"] .mp-view-content`) || body;

  function clearHighlights(root = getActiveView()) {
    root.querySelectorAll('.mp-highlight').forEach(el => {
      // Controlled markup generated locally.
      // eslint-disable-next-line no-unsanitized/property
      el.outerHTML = el.innerHTML;
    });
  }
  function performSearch(query) {
    const root = getActiveView();
    clearHighlights(root);
    searchResults = [];
    currentIndex = -1;
    if (!query.trim()) { searchInfo.textContent = ''; return; }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) { nodes.push(node); }
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    nodes.forEach(textNode => {
      const text = textNode.textContent;
      if (!text || !regex.test(text)) return;
      let html = text;
      let offset = 0;
      regex.lastIndex = 0;
      const matches = [...text.matchAll(regex)];
      matches.forEach((m) => {
        const start = m.index + offset;
        const end = start + m[0].length;
        const before = html.slice(0, start);
        const mid = html.slice(start, end);
        const after = html.slice(end);
        const span = `<span class="mp-highlight" data-search-index="${searchResults.length}">${mid}</span>`;
        html = before + span + after;
        offset += span.length - m[0].length;
        searchResults.push({});
      });
      const parent = textNode.parentElement;
      // Controlled markup generated locally.
      // eslint-disable-next-line no-unsanitized/property
      parent.innerHTML = parent.innerHTML.replace(text, html);
    });
    updateSearchInfo();
    if (searchResults.length > 0) { currentIndex = 0; highlightCurrent(); }
  }
  function updateSearchInfo() { if (!searchResults.length) searchInfo.textContent = searchInput.value.trim() ? '无结果' : ''; else searchInfo.textContent = `${currentIndex + 1}/${searchResults.length}`; }
  function highlightCurrent() {
    const root = getActiveView();
    root.querySelectorAll('.mp-highlight.current').forEach(el => el.classList.remove('current'));
    if (currentIndex >= 0 && currentIndex < searchResults.length) {
      const el = root.querySelector(`.mp-highlight[data-search-index="${currentIndex}"]`);
      if (el) { el.classList.add('current'); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }
  }
  function navigateSearch(direction) {
    if (!searchResults.length) return;
    if (direction === 'next') currentIndex = (currentIndex + 1) % searchResults.length;
    else currentIndex = currentIndex <= 0 ? searchResults.length - 1 : currentIndex - 1;
    updateSearchInfo();
    highlightCurrent();
  }
  let searchTimeout;
  searchInput.addEventListener('input', (e) => { clearTimeout(searchTimeout); searchTimeout = setTimeout(() => performSearch(e.target.value), 250); });
  searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); if (e.shiftKey) navigateSearch('prev'); else navigateSearch('next'); } else if (e.key === 'Escape') { searchInput.value = ''; performSearch(''); } });
  prevBtn.addEventListener('click', () => navigateSearch('prev'));
  nextBtn.addEventListener('click', () => navigateSearch('next'));
  footer.querySelector('#mp-focus-search')?.addEventListener('click', () => { searchInput.focus(); if (searchInput.value) navigateSearch('next'); });

  const setView = (view) => {
    activeView = view;
    body.querySelectorAll('.mp-view').forEach((el) => {
      el.classList.toggle('active', el.dataset.view === view);
    });
    tabBtns.forEach((btn) => btn.classList.toggle('active', btn.dataset.view === view));
    searchInput.value = '';
    clearHighlights();
    searchResults = [];
    currentIndex = -1;
    searchInfo.textContent = '';
  };
  tabBtns.forEach((btn) => btn.addEventListener('click', () => setView(btn.dataset.view || 'beautified')));

  const close = () => overlay.remove();
  header.querySelector('.mp-close').addEventListener('click', close);
  footer.querySelector('#mp-close').addEventListener('click', close);

  document.body.appendChild(overlay);
  return { overlay, modal, body, close };
}

const VIEW_MODES = {
  BEAUTIFIED: 'beautified',
  RAW: 'raw',
  BACKEND: 'backend',
};

const roleMap = { system: { label: "SYSTEM:", color: "#F7E3DA" }, user: { label: "USER:", color: "#F0ADA7" }, assistant: { label: "ASSISTANT:", color: "#6BB2CC" } };
const escapeHtml = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
const colorXml = (t) => {
  const safe = escapeHtml(t);
  return safe.replace(/&lt;([^&]+?)&gt;/g, '<span style="color:#999;font-weight:bold;">&lt;$1&gt;</span>');
};
const cloneJson = (value) => { try { return JSON.parse(JSON.stringify(value)); } catch { return value; } };
const getNames = (req) => {
  const n = {
    charName: String(req?.char_name || ""),
    userName: String(req?.user_name || ""),
    groupNames: Array.isArray(req?.group_names) ? req.group_names.map(String) : [],
  };
  n.startsWithGroupName = (m) => n.groupNames.some((g) => String(m || "").startsWith(`${g}: `));
  return n;
};
const rawMessages = (d) => {
  try {
    if (Array.isArray(d?.requestData?.messages)) return cloneJson(d.requestData.messages);
    if (Array.isArray(d?.messages)) return cloneJson(d.messages);
  } catch { }
  return [];
};
const displayContent = (content) => {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((part) => {
      if (typeof part === "string") return part;
      if (!part || typeof part !== "object") return "";
      if (part.type === "text") return String(part.text || "");
      if (part.type === "image_url") return "[image]";
      if (part.type === "video_url") return "[video]";
      if (part.type === "audio_url") return "[audio]";
      if (part.type === "tool_use") return "[tool_use]";
      if (part.type === "tool_result") return "[tool_result]";
      return JSON.stringify(part);
    }).filter(Boolean).join("\n\n");
  }
  try { return JSON.stringify(content ?? "", null, 2); } catch { return String(content ?? ""); }
};
const normalizeRole = (role) => {
  const value = String(role || "").toLowerCase();
  if (value === "model") return "assistant";
  if (value === "human") return "user";
  return value || "user";
};
const mergeMessagesLikeBackend = (messages, names, { strict = false, placeholders = false, single = false, tools = false } = {}) => {
  if (!Array.isArray(messages)) return [];
  const mergedMessages = [];
  const contentTokens = new Map();
  const cloned = messages.map((message) => {
    const msg = { ...message };
    const role = normalizeRole(msg.role);
    msg.role = role;
    if (!msg.content) msg.content = '';
    if (Array.isArray(msg.content)) {
      const text = msg.content.map((content) => {
        if (content?.type === 'text') return content.text;
        if (['image_url', 'video_url', 'audio_url'].includes(content?.type)) {
          const token = `__xbp_media_${contentTokens.size}__`;
          contentTokens.set(token, content);
          return token;
        }
        return '';
      }).join('\n\n');
      msg.content = text;
    }
    if (msg.role === 'system' && msg.name === 'example_assistant') {
      if (names.charName && !msg.content.startsWith(`${names.charName}: `) && !names.startsWithGroupName(msg.content)) {
        msg.content = `${names.charName}: ${msg.content}`;
      }
    }
    if (msg.role === 'system' && msg.name === 'example_user') {
      if (names.userName && !msg.content.startsWith(`${names.userName}: `)) {
        msg.content = `${names.userName}: ${msg.content}`;
      }
    }
    if (msg.name && msg.role !== 'system' && !msg.content.startsWith(`${msg.name}: `)) {
      msg.content = `${msg.name}: ${msg.content}`;
    }
    if (msg.role === 'tool' && !tools) {
      msg.role = 'user';
    }
    if (single) {
      if (msg.role === 'assistant' && names.charName && !msg.content.startsWith(`${names.charName}: `) && !names.startsWithGroupName(msg.content)) {
        msg.content = `${names.charName}: ${msg.content}`;
      }
      if (msg.role === 'user' && names.userName && !msg.content.startsWith(`${names.userName}: `)) {
        msg.content = `${names.userName}: ${msg.content}`;
      }
      msg.role = 'user';
    }
    delete msg.name;
    if (!tools) {
      delete msg.tool_calls;
      delete msg.tool_call_id;
    }
    return msg;
  });
  for (const message of cloned) {
    if (mergedMessages.length > 0 && mergedMessages[mergedMessages.length - 1].role === message.role && message.content && message.role !== 'tool') {
      mergedMessages[mergedMessages.length - 1].content += `\n\n${message.content}`;
    } else {
      mergedMessages.push(message);
    }
  }
  if (mergedMessages.length === 0) {
    mergedMessages.push({ role: 'user', content: 'Let\'s get started.' });
  }
  if (contentTokens.size > 0) {
    mergedMessages.forEach((message) => {
      if (!String(message.content || '').trim()) return;
      const splitContent = String(message.content).split('\n\n');
      if (!splitContent.some((part) => contentTokens.has(part))) return;
      const mergedContent = [];
      splitContent.forEach((content) => {
        if (contentTokens.has(content)) {
          mergedContent.push(contentTokens.get(content));
        } else if (mergedContent.length > 0 && mergedContent[mergedContent.length - 1]?.type === 'text') {
          mergedContent[mergedContent.length - 1].text += `\n\n${content}`;
        } else {
          mergedContent.push({ type: 'text', text: content });
        }
      });
      message.content = mergedContent;
    });
  }
  if (strict) {
    for (let i = 0; i < mergedMessages.length; i++) {
      if (i > 0 && mergedMessages[i].role === 'system') {
        mergedMessages[i].role = 'user';
      }
    }
    if (placeholders && mergedMessages.length) {
      if (mergedMessages[0].role === 'system' && (mergedMessages.length === 1 || mergedMessages[1].role !== 'user')) {
        mergedMessages.splice(1, 0, { role: 'user', content: 'Let\'s get started.' });
      } else if (mergedMessages[0].role !== 'system' && mergedMessages[0].role !== 'user') {
        mergedMessages.unshift({ role: 'user', content: 'Let\'s get started.' });
      }
    }
    return mergeMessagesLikeBackend(mergedMessages, names, { strict: false, placeholders, single: false, tools });
  }
  return mergedMessages;
};
const compactJson = (value) => {
  if (Array.isArray(value)) return value.map(compactJson);
  if (!value || typeof value !== 'object') return value;
  const out = {};
  Object.entries(value).forEach(([key, val]) => {
    if (val === undefined) return;
    out[key] = compactJson(val);
  });
  return out;
};
const convertClaudeTools = (tools, source) => {
  if (!Array.isArray(tools)) return [];
  return tools
    .filter(tool => tool?.type === 'function' && tool.function)
    .map(tool => ({
      name: tool.function.name,
      description: tool.function.description,
      input_schema: cloneJson(tool.function.parameters || {}),
      _note: source ? undefined : undefined,
    }))
    .map(tool => compactJson(tool));
};
const convertGoogleTools = (tools) => {
  if (!Array.isArray(tools) || !tools.length) return [];
  const functionDeclarations = [];
  const customTools = [];
  tools.forEach((tool) => {
    if (tool?.type === 'function' && tool.function) {
      const fn = cloneJson(tool.function);
      if (fn?.parameters?.$schema) delete fn.parameters.$schema;
      if (fn?.parameters?.properties && Object.keys(fn.parameters.properties).length === 0) delete fn.parameters;
      functionDeclarations.push(fn);
    } else if (tool?.type && tool[tool.type]) {
      customTools.push({ [tool.type]: cloneJson(tool[tool.type]) });
    }
  });
  if (functionDeclarations.length) return [{ function_declarations: functionDeclarations }];
  return customTools;
};
const buildOpenAiLikeBody = (req, messages) => {
  const body = {
    messages,
    model: req.model,
    temperature: req.temperature,
    max_tokens: req.max_tokens,
    max_completion_tokens: req.max_completion_tokens,
    stream: req.stream,
    presence_penalty: req.presence_penalty,
    frequency_penalty: req.frequency_penalty,
    top_p: req.top_p,
    top_k: req.top_k,
    stop: Array.isArray(req.stop) && req.stop.length ? req.stop : undefined,
    logit_bias: req.logit_bias,
    seed: req.seed,
    n: req.n,
  };
  if (Array.isArray(req.tools) && req.tools.length) {
    body.tools = cloneJson(req.tools);
    body.tool_choice = cloneJson(req.tool_choice);
  }
  if (req.json_schema) {
    body.response_format = {
      type: 'json_schema',
      json_schema: {
        name: req.json_schema.name,
        strict: req.json_schema.strict ?? true,
        schema: req.json_schema.value,
      },
    };
  }
  return compactJson(body);
};
const simulateBackendPayload = (d) => {
  const req = cloneJson(d?.requestData ?? d ?? {});
  const source = String(req?.chat_completion_source || '').toLowerCase();
  const names = getNames(req || {});
  const messages = Array.isArray(req.messages) ? cloneJson(req.messages) : [];
  const postProcessingType = String(req.custom_prompt_post_processing || '').toLowerCase();
  const postProcessed = postProcessingType
    ? mergeMessagesLikeBackend(messages, names, {
        strict: ['semi', 'semi_tools', 'strict', 'strict_tools', 'single'].includes(postProcessingType),
        placeholders: ['strict', 'strict_tools'].includes(postProcessingType),
        single: postProcessingType === 'single',
        tools: ['merge_tools', 'semi_tools', 'strict_tools'].includes(postProcessingType),
      })
    : messages;

  if (source === 'claude') {
    const useSysPrompt = Boolean(req.use_sysprompt);
    const useTools = Array.isArray(req.tools) && req.tools.length > 0;
    const systemPrompt = [];
    let working = cloneJson(postProcessed);
    if (useSysPrompt) {
      let i = 0;
      for (; i < working.length; i++) {
        if (normalizeRole(working[i]?.role) !== 'system') break;
        systemPrompt.push({ type: 'text', text: displayContent(working[i]?.content) });
      }
      working = working.slice(i);
      if (working.length === 0) {
        working.unshift({ role: 'user', content: 'Let\'s get started.' });
      }
    }
    if (req.assistant_prefill) {
      working.push({ role: 'assistant', content: [{ type: 'text', text: String(req.assistant_prefill).trimEnd() }] });
    }
    working = working.map((message) => {
      const out = { ...message, role: normalizeRole(message.role) };
      if (out.role === 'system') out.role = 'user';
      if (out.role === 'tool') {
        out.role = 'user';
        out.content = [{ type: 'tool_result', tool_use_id: out.tool_call_id, content: out.content }];
      } else if (typeof out.content === 'string') {
        out.content = [{ type: 'text', text: out.content || '\u200b' }];
      }
      delete out.name;
      delete out.tool_call_id;
      delete out.tool_calls;
      return out;
    });
    const result = {
      system: useSysPrompt ? systemPrompt : undefined,
      messages: working,
      model: req.model,
      max_tokens: req.max_tokens,
      stop_sequences: Array.isArray(req.stop) ? req.stop : [],
      temperature: req.temperature,
      top_p: req.top_p,
      top_k: req.top_k,
      stream: req.stream,
    };
    if (!useSysPrompt) delete result.system;
    if (useTools) {
      result.tool_choice = { type: req.tool_choice };
      result.tools = convertClaudeTools(req.tools, source);
    }
    if (req.json_schema) {
      const jsonTool = {
        name: req.json_schema.name,
        description: req.json_schema.description || 'Well-formed JSON object',
        input_schema: cloneJson(req.json_schema.value),
      };
      result.tools = [...(result.tools || []), jsonTool];
      result.tool_choice = { type: 'tool', name: req.json_schema.name };
    }
    return compactJson(result);
  }

  if (['google', 'gemini', 'makersuite', 'vertexai'].includes(source)) {
    const useSysPrompt = Boolean(req.use_sysprompt);
    const prompt = {
      contents: [],
      safetySettings: cloneJson(req.safety_settings || req.safetySettings || []),
      generationConfig: {
        stopSequences: Array.isArray(req.stop) && req.stop.length ? req.stop : undefined,
        candidateCount: 1,
        maxOutputTokens: req.max_output_tokens ?? req.max_tokens,
        temperature: req.temperature,
        topP: req.top_p,
        topK: req.top_k,
        responseMimeType: req.responseMimeType,
        responseSchema: req.responseSchema,
        seed: req.seed,
      },
    };
    const systemParts = [];
    let working = cloneJson(postProcessed);
    if (useSysPrompt) {
      while (working.length > 1 && normalizeRole(working[0]?.role) === 'system') {
        systemParts.push({ text: displayContent(working[0]?.content) });
        working.shift();
      }
    }
    const toPart = (message) => {
      const content = message?.content;
      if (Array.isArray(content)) {
        const parts = [];
        content.forEach((part) => {
          if (part?.type === 'text') parts.push({ text: String(part.text || '') });
        });
        return parts.length ? parts : [{ text: '' }];
      }
      return [{ text: displayContent(content) }];
    };
    working.forEach((message) => {
      const role = normalizeRole(message?.role);
      const normalizedRole = role === 'assistant' ? 'model' : 'user';
      if (role === 'system') {
        if (useSysPrompt) {
          systemParts.push({ text: displayContent(message?.content) });
          return;
        }
      }
      prompt.contents.push({
        role: normalizedRole,
        parts: toPart(message),
      });
    });
    if (systemParts.length) {
      prompt.systemInstruction = { parts: systemParts };
    }
    const tools = convertGoogleTools(req.tools);
    if (tools.length) {
      prompt.tools = tools;
    }
    const toolChoice = req.tool_choice;
    let functionCallingConfig;
    if (typeof toolChoice === 'string') {
      if (toolChoice === 'none') functionCallingConfig = { mode: 'NONE' };
      if (toolChoice === 'required') functionCallingConfig = { mode: 'ANY' };
      if (toolChoice === 'auto') functionCallingConfig = { mode: 'AUTO' };
    } else if (toolChoice?.function?.name) {
      functionCallingConfig = { mode: 'ANY', allowedFunctionNames: [toolChoice.function.name] };
    }
    if (functionCallingConfig) {
      prompt.toolConfig = { functionCallingConfig };
    }
    return compactJson(prompt);
  }

  return buildOpenAiLikeBody(req, postProcessed);
};
const formatPreview = (d) => {
  const msgs = rawMessages(d);
  let out = `↓请求消息↓(${msgs.length})\n${"-".repeat(30)}\n`;
  msgs.forEach((m, i) => {
    const txt = displayContent(m?.content);
    const safeTxt = escapeHtml(txt);
    const rm = roleMap[m.role] || { label: `${String(m.role || "").toUpperCase()}:`, color: "#FFF" };
    out += `<div style="color:${rm.color};font-weight:bold;margin-top:${i ? "15px" : "0"};">${rm.label}</div>`;
    out += /<[^>]+>/g.test(txt) ? `<pre style="white-space:pre-wrap;margin:5px 0;color:${rm.color};">${colorXml(txt)}</pre>` : `<div style="margin:5px 0;color:${rm.color};white-space:pre-wrap;">${safeTxt}</div>`;
  });
  return out;
};
const formatRaw = (d) => { try { const obj = cloneJson(d?.requestData ?? d); return colorXml(JSON.stringify(obj, null, 2)); } catch { try { return colorXml(String(d)); } catch { return ""; } } };
const formatBackend = (d) => { try { const obj = simulateBackendPayload(d); return colorXml(JSON.stringify(obj, null, 2)); } catch (error) { try { return colorXml(JSON.stringify({ error: error?.message || String(error) }, null, 2)); } catch { return ""; } } };
const buildPreviewHtml = (d) => {
  const formatted = formatPreview(d);
  const raw = formatRaw(d);
  const backend = formatBackend(d);
  return `<div class="message-preview-container">
    <div class="mp-view active" data-view="${VIEW_MODES.BEAUTIFIED}"><div class="message-preview-content-box mp-view-content">${formatted}</div></div>
    <div class="mp-view" data-view="${VIEW_MODES.RAW}"><div class="message-preview-content-box mp-view-content"><pre class="mp-state-raw">${raw}</pre></div></div>
    <div class="mp-view" data-view="${VIEW_MODES.BACKEND}"><div class="message-preview-content-box mp-view-content"><div class="mp-backend-note">模拟后端：前端按已知规则推演，尽量贴近酒馆后端真实发送格式。</div><pre class="mp-state-backend">${backend}</pre></div></div>
  </div>`;
};
const openPopup = async (html, title) => { createMovableModal(title, html); };
const displayPreview = async (d) => { try { await openPopup(buildPreviewHtml(d), "消息拦截"); } catch { toastr.error("显示拦截失败"); } };

const pushHistory = (r) => { S.history.unshift(r); if (S.history.length > C.MAX_HISTORY) S.history.length = C.MAX_HISTORY; };
const extractUser = (ms) => { if (!Array.isArray(ms)) return ""; for (let i = ms.length - 1; i >= 0; i--) if (ms[i]?.role === "user") return ms[i].content || ""; return ""; };

async function recordReal(input, options) {
  try {
    const url = input instanceof Request ? input.url : input;
    const body = await safeReadBodyFromInput(input, options);
    if (!body) return;
    const data = safeJson(body) || {}, ctx = getContext();
    pushHistory({ url, method: options?.method || (input instanceof Request ? input.method : "POST"), requestData: data, messages: data.messages || [], model: data.model || "Unknown", timestamp: now(), messageId: ctx.chat?.length || 0, characterName: ctx.characters?.[ctx.characterId]?.name || "Unknown", userInput: extractUser(data.messages || []), isRealRequest: true });
    setTimeout(() => { if (S.history[0] && !S.history[0].associatedMessageId) S.history[0].associatedMessageId = ctx.chat?.length || 0; }, C.ASSOC_DELAY);
  } catch { }
}

const findRec = (id) => {
  if (!S.history.length) return null;
  const preds = [(r) => r.associatedMessageId === id, (r) => r.messageId === id, (r) => r.messageId === id - 1, (r) => Math.abs(r.messageId - id) <= 1];
  for (const p of preds) { const m = S.history.find(p); if (m) return m; }
  const cs = S.history.filter((r) => r.messageId <= id + 2);
  return cs.length ? cs.sort((a, b) => b.messageId - a.messageId)[0] : S.history[0];
};

// Improved purgePreviewArtifacts - follows SillyTavern's batch delete pattern
async function purgePreviewArtifacts() {
  try {
    if (!S.pendingPurge) return;
    S.pendingPurge = false;
    const ctx = getContext();
    const chat = Array.isArray(ctx.chat) ? ctx.chat : [];
    const start = Math.max(0, Number(S.chatLenBefore) || 0);
    if (start >= chat.length) return;

    // 1. Remove DOM elements (following SillyTavern's pattern from #dialogue_del_mes_ok)
    const $chat = $('#chat');
    $chat.find(`.mes[mesid="${start}"]`).nextAll('.mes').addBack().remove();

    // 2. Truncate chat array
    chat.length = start;

    // 3. Update last_mes class
    $('#chat .mes').removeClass('last_mes');
    $('#chat .mes').last().addClass('last_mes');

    // 4. Save chat and emit MESSAGE_DELETED event (critical for other plugins)
    ctx.saveChat?.();
    await eventSource.emit(event_types.MESSAGE_DELETED, start);
  } catch (e) {
    console.error('[message-preview] purgePreviewArtifacts error', e);
  }
}



function oneShotOnLast(ev, handler) {
  const wrapped = (...args) => {
    try { handler(...args); } finally { off(); }
  };
  let off = () => { };
  if (typeof eventSource.makeLast === "function") {
    eventSource.makeLast(ev, wrapped);
    off = () => {
      try { eventSource.removeListener?.(ev, wrapped); } catch { }
      try { eventSource.off?.(ev, wrapped); } catch { }
    };
  } else if (S.tailAPI?.onLast) {
    const disposer = S.tailAPI.onLast(ev, wrapped);
    off = () => { try { disposer?.(); } catch { } };
  } else {
    eventSource.on(ev, wrapped);
    off = () => { try { eventSource.removeListener?.(ev, wrapped); } catch { } };
  }
  return off;
}

function installEventSourceTail(es) {
  if (!es || es.__lw_tailInstalled) return es?.__lw_tailAPI || null;
  const SYM = { MW_STACK: Symbol.for("lwbox.es.emitMiddlewareStack"), BASE: Symbol.for("lwbox.es.emitBase"), ORIG_DESC: Symbol.for("lwbox.es.emit.origDesc"), COMPOSED: Symbol.for("lwbox.es.emit.composed"), ID: Symbol.for("lwbox.middleware.identity") };
  const getFnFromDesc = (d) => { try { if (typeof d?.value === "function") return d.value; if (typeof d?.get === "function") { const v = d.get.call(es); if (typeof v === "function") return v; } } catch { } return es.emit?.bind?.(es) || es.emit; };
  const compose = (base, stack) => stack.reduce((acc, mw) => mw(acc), base);
  const tails = new Map();
  const addTail = (ev, fn) => { if (typeof fn !== "function") return () => { }; const arr = tails.get(ev) || []; arr.push(fn); tails.set(ev, arr); return () => { const a = tails.get(ev); if (!a) return; const i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); }; };
  const runTails = (ev, args) => { const arr = tails.get(ev); if (!arr?.length) return; for (const h of arr.slice()) { try { h(...args); } catch (e) { } } };
  const makeTailMw = () => { const mw = (next) => function patchedEmit(ev, ...args) { let r; try { r = next.call(this, ev, ...args); } catch (e) { queueMicrotask(() => runTails(ev, args)); throw e; } if (r && typeof r.then === "function") r.finally(() => runTails(ev, args)); else queueMicrotask(() => runTails(ev, args)); return r; }; Object.defineProperty(mw, SYM.ID, { value: true }); return Object.freeze(mw); };
  const ensureAccessor = () => { try { const d = Object.getOwnPropertyDescriptor(es, "emit"); if (!es[SYM.ORIG_DESC]) es[SYM.ORIG_DESC] = d || null; es[SYM.BASE] ||= getFnFromDesc(d); Object.defineProperty(es, "emit", { configurable: true, enumerable: d?.enumerable ?? true, get() { return reapply(); }, set(v) { if (typeof v === "function") { es[SYM.BASE] = v; queueMicrotask(reapply); } } }); } catch { } };
  const reapply = () => { try { const base = es[SYM.BASE] || getFnFromDesc(Object.getOwnPropertyDescriptor(es, "emit")) || es.emit.bind(es); const stack = es[SYM.MW_STACK] || (es[SYM.MW_STACK] = []); let idx = stack.findIndex((m) => m && m[SYM.ID]); if (idx === -1) { stack.push(makeTailMw()); idx = stack.length - 1; } if (idx !== stack.length - 1) { const mw = stack[idx]; stack.splice(idx, 1); stack.push(mw); } const composed = compose(base, stack) || base; if (!es[SYM.COMPOSED] || es[SYM.COMPOSED]._base !== base || es[SYM.COMPOSED]._stack !== stack) { composed._base = base; composed._stack = stack; es[SYM.COMPOSED] = composed; } return es[SYM.COMPOSED]; } catch { return es.emit; } };
  ensureAccessor();
  queueMicrotask(reapply);
  const api = { onLast: (e, h) => addTail(e, h), removeLast: (e, h) => { const a = tails.get(e); if (!a) return; const i = a.indexOf(h); if (i >= 0) a.splice(i, 1); }, uninstall() { try { const s = es[SYM.MW_STACK]; const i = Array.isArray(s) ? s.findIndex((m) => m && m[SYM.ID]) : -1; if (i >= 0) s.splice(i, 1); const orig = es[SYM.ORIG_DESC]; if (orig) { try { Object.defineProperty(es, "emit", orig); } catch { Object.defineProperty(es, "emit", { configurable: true, enumerable: true, writable: true, value: es[SYM.BASE] || es.emit }); } } else { Object.defineProperty(es, "emit", { configurable: true, enumerable: true, writable: true, value: es[SYM.BASE] || es.emit }); } } catch { } delete es.__lw_tailInstalled; delete es.__lw_tailAPI; tails.clear(); } };
  Object.defineProperty(es, "__lw_tailInstalled", { value: true });
  Object.defineProperty(es, "__lw_tailAPI", { value: api });
  return api;
}

let __installed = false;
const MW_KEY = Symbol.for("lwbox.fetchMiddlewareStack");
const BASE_KEY = Symbol.for("lwbox.fetchBase");
const ORIG_KEY = Symbol.for("lwbox.fetch.origDesc");
const CMP_KEY = Symbol.for("lwbox.fetch.composed");
const ID = Symbol.for("lwbox.middleware.identity");
const getFetchFromDesc = (d) => { try { if (typeof d?.value === "function") return d.value; if (typeof d?.get === "function") { const v = d.get.call(window); if (typeof v === "function") return v; } } catch { } return globalThis.fetch; };
const compose = (base, stack) => stack.reduce((acc, mw) => mw(acc), base);
const withTimeout = (p, ms = 200) => { try { return Promise.race([p, new Promise((r) => setTimeout(r, ms))]); } catch { return p; } };
const ensureAccessor = () => { try { const d = Object.getOwnPropertyDescriptor(window, "fetch"); if (!window[ORIG_KEY]) window[ORIG_KEY] = d || null; window[BASE_KEY] ||= getFetchFromDesc(d); Object.defineProperty(window, "fetch", { configurable: true, enumerable: d?.enumerable ?? true, get() { return reapply(); }, set(v) { if (typeof v === "function") { window[BASE_KEY] = v; queueMicrotask(reapply); } } }); } catch { } };
const reapply = () => { try { const base = window[BASE_KEY] || getFetchFromDesc(Object.getOwnPropertyDescriptor(window, "fetch")); const stack = window[MW_KEY] || (window[MW_KEY] = []); let idx = stack.findIndex((m) => m && m[ID]); if (idx === -1) { stack.push(makeMw()); idx = stack.length - 1; } if (idx !== window[MW_KEY].length - 1) { const mw = window[MW_KEY][idx]; window[MW_KEY].splice(idx, 1); window[MW_KEY].push(mw); } const composed = compose(base, stack) || base; if (!window[CMP_KEY] || window[CMP_KEY]._base !== base || window[CMP_KEY]._stack !== stack) { composed._base = base; composed._stack = stack; window[CMP_KEY] = composed; } return window[CMP_KEY]; } catch { return globalThis.fetch; } };
function makeMw() {
  const mw = (next) => async function f(input, options = {}) {
    try {
      if (await isTarget(input, options)) {
        if (S.isPreview || S.isLong) {
          const url = input instanceof Request ? input.url : input;
          return interceptPreview(url, options).catch(() => new Response(JSON.stringify({ error: { message: "拦截失败，请手动中止消息生成。" } }), { status: 200, headers: { "Content-Type": "application/json" } }));
        } else { try { await withTimeout(recordReal(input, options)); } catch { } }
      }
    } catch { }
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
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") reapply(); }, { passive: true });
    window.addEventListener("focus", reapply, { passive: true });
  } catch { }
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
  } catch { }
  __installed = false;
}
const setupFetch = () => { if (!S.active) { installFetch(); S.active = true; } };
const restoreFetch = () => { if (S.active) { uninstallFetch(); S.active = false; } };
const updateFetchState = () => { const st = getSettings(), need = (st.preview.enabled || st.recorded.enabled); if (need && !S.active) setupFetch(); if (!need && S.active) restoreFetch(); };

async function interceptPreview(url, options) {
  const body = await safeReadBodyFromInput(url, options);
  const data = safeJson(body) || {};
  const userInput = extractUser(data?.messages || []);
  const ctx = getContext();

  if (S.isLong) {
    const chat = Array.isArray(ctx.chat) ? ctx.chat : [];
    let start = chat.length;
    if (chat.length > 0 && chat[chat.length - 1]?.is_user === true) start = chat.length - 1;
    S.chatLenBefore = start;
    S.pendingPurge = true;
    oneShotOnLast(event_types.GENERATION_ENDED, () => setTimeout(() => purgePreviewArtifacts(), 0));
  }

  S.previewData = { url, method: options?.method || "POST", requestData: data, messages: data?.messages || [], model: data?.model || "Unknown", timestamp: now(), userInput, isPreview: true };
  if (S.isLong) { setTimeout(() => { displayPreview(S.previewData); }, 100); } else if (S.resolve) { S.resolve({ success: true, data: S.previewData }); S.resolve = S.reject = null; }
  const payload = S.isLong ? { choices: [{ message: { content: "【小白X】已拦截消息" }, finish_reason: "stop" }], intercepted: true } : { choices: [{ message: { content: "" }, finish_reason: "stop" }] };
  return new Response(JSON.stringify(payload), { status: 200, headers: { "Content-Type": "application/json" } });
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

const disableSend = (dis = true) => {
  const $b = $q("#send_but");
  if (dis) { S.sendBtnWasDisabled = $b.prop("disabled"); $b.prop("disabled", true).off("click.preview-block").on("click.preview-block", (e) => { e.preventDefault(); e.stopImmediatePropagation(); return false; }); }
  else { $b.prop("disabled", S.sendBtnWasDisabled).off("click.preview-block"); S.sendBtnWasDisabled = false; }
};
const triggerSend = () => {
  const $b = $q("#send_but"), $t = $q("#send_textarea"), txt = String($t.val() || ""); if (!txt.trim()) return false;
  const was = $b.prop("disabled"); $b.prop("disabled", false); $b[0].dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window })); if (was) $b.prop("disabled", true); return true;
};

async function showPreview() {
  let toast = null, backup = null;
  try {
    const set = getSettings(); if (!set.preview.enabled || !geEnabled()) return toastr.warning("消息拦截功能未启用");
    const text = String($q("#send_textarea").val() || "").trim(); if (!text) return toastr.error("请先输入消息内容");

    backup = text; disableSend(true);
    const ctx = getContext();
    S.chatLenBefore = Array.isArray(ctx.chat) ? ctx.chat.length : 0;
    S.isPreview = true; S.previewData = null; S.previewIds.clear(); S.previewAbort = new AbortController();
    S.pendingPurge = true;

    const endHandler = () => {
      try { if (S.genEndedOff) { S.genEndedOff(); S.genEndedOff = null; } } catch { }
      if (S.pendingPurge) {
        setTimeout(() => purgePreviewArtifacts(), 0);
      }
    };

    S.genEndedOff = oneShotOnLast(event_types.GENERATION_ENDED, endHandler);
    clearTimeout(S.cleanupFallback);
    S.cleanupFallback = setTimeout(() => {
      try { if (S.genEndedOff) { S.genEndedOff(); S.genEndedOff = null; } } catch { }
      purgePreviewArtifacts();
    }, 1500);

    toast = toastr.info(`正在拦截请求...（${set.preview.timeoutSeconds}秒超时）`, "消息拦截", { timeOut: 0, tapToDismiss: false });

    if (!triggerSend()) throw new Error("无法触发发送事件");

    const res = await waitIntercept().catch((e) => ({ success: false, error: e?.message || e }));
    if (toast) { toastr.clear(toast); toast = null; }
    if (res.success) { await displayPreview(res.data); toastr.success("拦截成功！", "", { timeOut: 3000 }); }
    else toastr.error(`拦截失败: ${res.error}`, "", { timeOut: 5000 });
  } catch (e) {
    if (toast) toastr.clear(toast); toastr.error(`拦截异常: ${e.message}`, "", { timeOut: 5000 });
  } finally {
    try { S.previewAbort?.abort("拦截结束"); } catch { } S.previewAbort = null;
    if (S.resolve) S.resolve({ success: false, error: "拦截已取消" }); S.resolve = S.reject = null;
    clearTimeout(S.cleanupFallback); S.cleanupFallback = null;
    S.isPreview = false; S.previewData = null;
    disableSend(false); if (backup) $q("#send_textarea").val(backup);
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

const cleanupMemory = () => {
  if (S.history.length > C.MAX_HISTORY) S.history = S.history.slice(0, C.MAX_HISTORY);
  S.previewIds.clear(); S.previewData = null; $(".mes_history_preview").each(function () { if (!$(this).closest(".mes").length) $(this).remove(); });
  if (!S.isLong) S.interceptedIds = [];
};

function onLast(ev, handler) {
  if (typeof eventSource.makeLast === "function") { eventSource.makeLast(ev, handler); S.listeners.push({ e: ev, h: handler, off: () => { } }); return; }
  if (S.tailAPI?.onLast) { const off = S.tailAPI.onLast(ev, handler); S.listeners.push({ e: ev, h: handler, off }); return; }
  const tail = (...args) => queueMicrotask(() => { try { handler(...args); } catch { } });
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
    } catch { }
    queueMicrotask(() => updateFetchState());
  };
  if (typeof eventSource.makeLast === "function") { eventSource.makeLast(event_types.CHAT_COMPLETION_SETTINGS_READY, late); S.listeners.push({ e: event_types.CHAT_COMPLETION_SETTINGS_READY, h: late, off: () => { } }); }
  else if (S.tailAPI?.onLast) { const off = S.tailAPI.onLast(event_types.CHAT_COMPLETION_SETTINGS_READY, late); S.listeners.push({ e: event_types.CHAT_COMPLETION_SETTINGS_READY, h: late, off }); }
  else { ON(event_types.CHAT_COMPLETION_SETTINGS_READY, late); S.listeners.push({ e: event_types.CHAT_COMPLETION_SETTINGS_READY, h: late, off: () => OFF(event_types.CHAT_COMPLETION_SETTINGS_READY, late) }); queueMicrotask(() => { try { OFF(event_types.CHAT_COMPLETION_SETTINGS_READY, late); } catch { } try { ON(event_types.CHAT_COMPLETION_SETTINGS_READY, late); } catch { } }); }
};
const removeEvents = () => { S.listeners.forEach(({ e, h, off }) => { if (typeof off === "function") { try { off(); } catch { } } else { try { OFF(e, h); } catch { } } }); S.listeners = []; };

const toggleLong = () => {
  S.isLong = !S.isLong;
  const $b = $q("#message_preview_btn");
  if (S.isLong) {
    $b.css("color", "red");
    toastr.info("持续拦截已开启", "", { timeOut: 2000 });
  } else {
    $b.css("color", "");
    S.pendingPurge = false;
    toastr.info("持续拦截已关闭", "", { timeOut: 2000 });
  }
};
const bindBtn = () => {
  const $b = $q("#message_preview_btn");
  $b.on("mousedown touchstart", () => { S.longPressTimer = setTimeout(() => toggleLong(), S.longPressDelay); });
  $b.on("mouseup touchend mouseleave", () => { if (S.longPressTimer) { clearTimeout(S.longPressTimer); S.longPressTimer = null; } });
  $b.on("click", () => { if (S.longPressTimer) { clearTimeout(S.longPressTimer); S.longPressTimer = null; return; } if (!S.isLong) showPreview(); });
};

const waitIntercept = () => new Promise((resolve, reject) => {
  const t = setTimeout(() => { if (S.resolve) { S.resolve({ success: false, error: `等待超时 (${getSettings().preview.timeoutSeconds}秒)` }); S.resolve = S.reject = null; } }, getSettings().preview.timeoutSeconds * 1000);
  S.resolve = (v) => { clearTimeout(t); resolve(v); }; S.reject = (e) => { clearTimeout(t); reject(e); };
});

function cleanup() {
  removeEvents(); restoreFetch(); disableSend(false);
  $(".mes_history_preview").remove(); $("#message_preview_btn").remove(); cleanupMemory();
  Object.assign(S, { resolve: null, reject: null, isPreview: false, isLong: false, interceptedIds: [], chatLenBefore: 0, sendBtnWasDisabled: false, pendingPurge: false });
  if (S.cleanTimer) { clearInterval(S.cleanTimer); S.cleanTimer = null; }
  if (S.longPressTimer) { clearTimeout(S.longPressTimer); S.longPressTimer = null; }
  if (S.restoreLong) { try { S.restoreLong(); } catch { } S.restoreLong = null; }
  if (S.genEndedOff) { try { S.genEndedOff(); } catch { } S.genEndedOff = null; }
  if (S.cleanupFallback) { clearTimeout(S.cleanupFallback); S.cleanupFallback = null; }
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
