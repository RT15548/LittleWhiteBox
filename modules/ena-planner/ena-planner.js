import { extension_settings } from '../../../../../extensions.js';
import { getRequestHeaders, saveSettingsDebounced, substituteParamsExtended } from '../../../../../../script.js';
import { getStorySummaryForEna } from '../story-summary/story-summary.js';

const EXT_NAME = 'ena-planner';

/** -------------------------
 * Default settings
 * --------------------------*/
function getDefaultSettings() {
  return {
    enabled: true,
    skipIfPlotPresent: true,

    // Chat history: tags to strip from AI responses (besides <think>)
    chatExcludeTags: ['行动选项', 'UpdateVariable', 'StatusPlaceHolderImpl'],

    // Worldbook: always read character-linked lorebooks by default
    // User can also opt-in to include global worldbooks
    includeGlobalWorldbooks: false,
    excludeWorldbookPosition4: true,
    // Worldbook entry names containing these strings will be excluded
    worldbookExcludeNames: ['mvu_update'],

    // Plot extraction
    plotCount: 2,

    // Planner prompts (designer)
    promptBlocks: [
      {
        id: crypto?.randomUUID?.() ?? String(Date.now()),
        role: 'system',
        name: 'Ena Planner System',
        content: `（把你的"规划的提示词.txt"粘贴到这里）
要求：输出 <plot>...</plot> 与 <note>...</note>，如有思考请放在 <think>...</think>（会被自动剔除）。`
      },
      {
        id: crypto?.randomUUID?.() ?? String(Date.now() + 1),
        role: 'assistant',
        name: 'Assistant Seed (optional)',
        content: ''
      }
    ],
    // Saved prompt templates: { name: promptBlocks[] }
    promptTemplates: {},

    // Planner API
    api: {
      channel: 'openai',
      baseUrl: '',
      prefixMode: 'auto',
      customPrefix: '',
      apiKey: '',
      model: '',
      stream: false,
      temperature: 1,
      top_p: 1,
      top_k: 0,
      presence_penalty: '',
      frequency_penalty: '',
      max_tokens: ''
    },

    // Logs
    logsPersist: true,
    logsMax: 20
  };
}

/** -------------------------
 * Local state
 * --------------------------*/
const state = {
  isPlanning: false,
  bypassNextSend: false,
  lastInjectedText: '',
  logs: []
};

/** -------------------------
 * Helpers
 * --------------------------*/
function ensureSettings() {
  extension_settings[EXT_NAME] = extension_settings[EXT_NAME] ?? getDefaultSettings();
  const d = getDefaultSettings();
  const s = extension_settings[EXT_NAME];

  function deepMerge(target, src) {
    for (const k of Object.keys(src)) {
      if (src[k] && typeof src[k] === 'object' && !Array.isArray(src[k])) {
        target[k] = target[k] ?? {};
        deepMerge(target[k], src[k]);
      } else if (target[k] === undefined) {
        target[k] = src[k];
      }
    }
  }
  deepMerge(s, d);

  // Migration: remove old keys that are no longer needed
  delete s.includeCharacterLorebooks;
  delete s.includeCharDesc;
  delete s.includeCharPersonality;
  delete s.includeCharScenario;
  delete s.includeVectorRecall;
  delete s.historyMessageCount;
  delete s.worldbookActivationMode;

  return s;
}

function toastInfo(msg) {
  if (window.toastr?.info) return window.toastr.info(msg);
  console.log('[EnaPlanner]', msg);
}
function toastWarn(msg) {
  if (window.toastr?.warning) return window.toastr.warning(msg);
  console.warn('[EnaPlanner]', msg);
}
function toastErr(msg) {
  if (window.toastr?.error) return window.toastr.error(msg);
  console.error('[EnaPlanner]', msg);
}

function clampLogs() {
  const s = ensureSettings();
  if (state.logs.length > s.logsMax) state.logs = state.logs.slice(0, s.logsMax);
}

function persistLogsMaybe() {
  const s = ensureSettings();
  if (!s.logsPersist) return;
  try {
    localStorage.setItem('ena_planner_logs', JSON.stringify(state.logs.slice(0, s.logsMax)));
  } catch {}
}

function loadPersistedLogsMaybe() {
  const s = ensureSettings();
  if (!s.logsPersist) return;
  try {
    const raw = localStorage.getItem('ena_planner_logs');
    if (raw) state.logs = JSON.parse(raw) || [];
  } catch {
    state.logs = [];
  }
}

function nowISO() {
  return new Date().toISOString();
}

function normalizeUrlBase(u) {
  if (!u) return '';
  return u.replace(/\/+$/g, '');
}

function getDefaultPrefixByChannel(channel) {
  if (channel === 'gemini') return '/v1beta';
  return '/v1';
}

function buildApiPrefix() {
  const s = ensureSettings();
  if (s.api.prefixMode === 'custom' && s.api.customPrefix?.trim()) return s.api.customPrefix.trim();
  return getDefaultPrefixByChannel(s.api.channel);
}

function buildUrl(path) {
  const s = ensureSettings();
  const base = normalizeUrlBase(s.api.baseUrl);
  const prefix = buildApiPrefix();
  const p = prefix.startsWith('/') ? prefix : `/${prefix}`;
  const finalPrefix = p.replace(/\/+$/g, '');
  const finalPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${finalPrefix}${finalPath}`;
}

function setSendUIBusy(busy) {
  const sendBtn = document.getElementById('send_but') || document.getElementById('send_button');
  const textarea = document.getElementById('send_textarea');
  if (sendBtn) sendBtn.disabled = !!busy;
  if (textarea) textarea.disabled = !!busy;
}

function escapeHtml(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/**
 * Universal tap handler — works on both desktop (click) and mobile (touch).
 * Prevents ghost double-fires by tracking the last trigger time.
 * On touch devices, fires on touchend for zero delay; on desktop, fires on click.
 */
function _addUniversalTap(el, fn) {
  if (!el) return;
  let lastTrigger = 0;
  const guard = (e) => {
    const now = Date.now();
    if (now - lastTrigger < 400) return; // debounce
    lastTrigger = now;
    e.preventDefault();
    e.stopPropagation();
    fn(e);
  };
  el.addEventListener('click', guard);
  el.addEventListener('touchend', guard, { passive: false });
}

function safeStringify(val) {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  try { return JSON.stringify(val, null, 2); } catch { return String(val); }
}

/** -------------------------
 * ST context helpers
 * --------------------------*/
function getContextSafe() {
  try { return window.SillyTavern?.getContext?.() ?? null; } catch { return null; }
}

function getCurrentCharSafe() {
  try {
    // Method 1: via getContext()
    const ctx = getContextSafe();
    if (ctx) {
      const cid = ctx.characterId ?? ctx.this_chid;
      const chars = ctx.characters;
      if (chars && cid != null && chars[cid]) return chars[cid];
    }
    // Method 2: global this_chid + characters
    const st = window.SillyTavern;
    if (st) {
      const chid = st.this_chid ?? window.this_chid;
      const chars = st.characters ?? window.characters;
      if (chars && chid != null && chars[chid]) return chars[chid];
    }
    // Method 3: bare globals (some ST versions)
    if (window.this_chid != null && window.characters) {
      return window.characters[window.this_chid] ?? null;
    }
  } catch {}
  return null;
}

/** -------------------------
 * Character card — always include desc/personality/scenario
 * --------------------------*/
function formatCharCardBlock(charObj) {
  if (!charObj) return '';
  const name = charObj?.name ?? '';
  const description = charObj?.description ?? '';
  const personality = charObj?.personality ?? '';
  const scenario = charObj?.scenario ?? '';

  const parts = [];
  parts.push(`【角色卡】${name}`.trim());
  if (description) parts.push(`【description】\n${description}`);
  if (personality) parts.push(`【personality】\n${personality}`);
  if (scenario) parts.push(`【scenario】\n${scenario}`);
  return parts.join('\n\n');
}

/** -------------------------
 * Chat history — ALL unhidden, AI responses ONLY
 * Strip: unclosed think blocks, configurable tags
 * --------------------------*/
function cleanAiMessageText(text) {
  let out = String(text ?? '');

  // 1) Strip everything before and including </think> (handles unclosed think blocks)
  //    Pattern: content without opening <think> followed by </think>
  out = out.replace(/^[\s\S]*?<\/think>/i, '');

  // 2) Also strip properly wrapped <think>...</think> blocks
  out = out.replace(/<think\b[^>]*>[\s\S]*?<\/think>/gi, '');
  out = out.replace(/<thinking\b[^>]*>[\s\S]*?<\/thinking>/gi, '');

  // 3) Strip user-configured exclude tags
  //    NOTE: JS \b does NOT work after CJK characters, so we use [^>]*> instead.
  //    Order matters: try block match first (greedy), then mop up orphan open/close tags.
  const s = ensureSettings();
  const tags = s.chatExcludeTags ?? [];
  for (const tag of tags) {
    if (!tag) continue;
    const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // First: match full block <tag ...>...</tag>
    const blockRe = new RegExp(`<${escaped}[^>]*>[\\s\\S]*?<\\/${escaped}>`, 'gi');
    out = out.replace(blockRe, '');
    // Then: mop up any orphan closing tags </tag>
    const closeRe = new RegExp(`<\\/${escaped}>`, 'gi');
    out = out.replace(closeRe, '');
    // Finally: mop up orphan opening or self-closing tags <tag ...> or <tag/>
    const openRe = new RegExp(`<${escaped}(?:[^>]*)\\/?>`, 'gi');
    out = out.replace(openRe, '');
  }

  return out.trim();
}

function collectRecentChatSnippet(chat, maxMessages) {
  if (!Array.isArray(chat) || chat.length === 0) return '';

  // Filter: not system, not hidden, and NOT user messages (AI only)
  const aiMessages = chat.filter(m =>
    !m?.is_system && !m?.is_user && !m?.extra?.hidden
  );

  if (!aiMessages.length) return '';

  // If maxMessages specified, only take the last N
  const selected = (maxMessages && maxMessages > 0)
    ? aiMessages.slice(-maxMessages)
    : aiMessages;

  const lines = [];
  for (const m of selected) {
    const name = m?.name ? `${m.name}` : 'assistant';
    const raw = (m?.mes ?? '').trim();
    if (!raw) continue;
    const cleaned = cleanAiMessageText(raw);
    if (!cleaned) continue;
    lines.push(`[${name}] ${cleaned}`);
  }

  if (!lines.length) return '';
  return `<chat_history>\n${lines.join('\n')}\n</chat_history>`;
}

function getCachedStorySummary() {
    return getStorySummaryForEna();
}

/** -------------------------
 * Plot extraction
 * --------------------------*/
function extractLastNPlots(chat, n) {
  if (!Array.isArray(chat) || chat.length === 0) return [];
  const want = Math.max(0, Number(n) || 0);
  if (!want) return [];

  const plots = [];
  const plotRe = /<plot\b[^>]*>[\s\S]*?<\/plot>/gi;

  for (let i = chat.length - 1; i >= 0; i--) {
    const text = chat[i]?.mes ?? '';
    if (!text) continue;
    const matches = [...text.matchAll(plotRe)];
    for (let j = matches.length - 1; j >= 0; j--) {
      plots.push(matches[j][0]);
      if (plots.length >= want) return plots;
    }
  }
  return plots;
}

function formatPlotsBlock(plotList) {
  if (!Array.isArray(plotList) || plotList.length === 0) return '';
  // plotList is [newest, ..., oldest] from extractLastNPlots
  // Reverse to chronological: oldest first, newest last
  const chrono = [...plotList].reverse();
  const lines = [];
  chrono.forEach((p, idx) => {
    lines.push(`【plot -${chrono.length - idx}】\n${p}`);
  });
  return `<previous_plots>\n${lines.join('\n\n')}\n</previous_plots>`;
}

/** -------------------------
 * Vector recall — always include if present
 * --------------------------*/
function formatVectorRecallBlock(extensionPrompts) {
  // ST's extensionPrompts is actually an object (key-value map), not an array.
  // Most entries are ST internals — we only want actual vector recall / RAG data.
  if (!extensionPrompts) return '';

  // Known ST internal keys to skip (handled elsewhere or irrelevant)
  const skipKeys = new Set([
    'QUIET_PROMPT', 'PERSONA_DESCRIPTION', 'TEMP_USER_MESSAGE',
    'DEPTH_PROMPT', '2_floating_prompt', 'main', '__STORY_STRING__',
    'LWB_varevent_display'
  ]);

  const entries = Array.isArray(extensionPrompts)
    ? extensionPrompts.map((v, i) => [String(i), v])
    : Object.entries(extensionPrompts);
  if (!entries.length) return '';

  const lines = [];
  for (const [key, p] of entries) {
    if (!p) continue;
    if (typeof key === 'string' && skipKeys.has(key)) continue;
    // Skip worldbook depth entries — handled by worldbook block
    if (typeof key === 'string' && /^customDepthWI/i.test(key)) continue;
    // Skip 小白X (LittleWhiteBox) compressed chat/memory keys
    // These start with 'ÿ' (U+00FF) or 'LWB' and contain chat history already handled elsewhere
    if (typeof key === 'string' && (key.startsWith('ÿ') || key.startsWith('\u00ff') || key.startsWith('LWB'))) continue;
    // Skip long hex-like keys (worldbook entries injected via ST internal mechanism)
    if (typeof key === 'string' && /^\u0001/.test(key)) continue;

    // Extract text content — handle string, .value, .content, or nested content array
    let textContent = '';
    if (typeof p === 'string') {
      textContent = p;
    } else if (typeof p?.value === 'string') {
      textContent = p.value;
    } else if (typeof p?.content === 'string') {
      textContent = p.content;
    } else if (Array.isArray(p?.content)) {
      const parts = [];
      for (const seg of p.content) {
        if (seg?.type === 'text' && seg?.text) parts.push(seg.text);
        else if (seg?.type === 'image_url') parts.push('[image_url]');
        else if (seg?.type === 'video_url') parts.push('[video_url]');
      }
      textContent = parts.join(' ');
    }

    const t = textContent.trim();
    // Skip short/garbage entries (e.g. "---", empty strings)
    if (!t || t.length < 30) continue;
    const role = typeof p?.role === 'number'
      ? ['system', 'user', 'assistant'][p.role] ?? 'system'
      : (p?.role ?? 'system');
    lines.push(`[${role}] ${t}`);
  }

  if (!lines.length) return '';
  return `<vector_recall>\n${lines.join('\n')}\n</vector_recall>`;
}

/** -------------------------
 * Worldbook — read via ST API (like idle-watcher)
 * Always read character-linked worldbooks.
 * Optionally include global worldbooks.
 * Activation: constant (blue) + keyword scan (green) only.
 * --------------------------*/

async function getCharacterWorldbooks() {
  const ctx = getContextSafe();
  const charObj = getCurrentCharSafe();
  const worldNames = [];

  // From character object (multiple paths)
  if (charObj) {
    const paths = [
      charObj?.data?.extensions?.world,
      charObj?.world,
      charObj?.data?.character_book?.name,
    ];
    for (const w of paths) {
      if (w && !worldNames.includes(w)) worldNames.push(w);
    }
  }

  // From context
  if (ctx) {
    try {
      const cid = ctx.characterId ?? ctx.this_chid;
      const chars = ctx.characters ?? window.characters;
      if (chars && cid != null) {
        const c = chars[cid];
        const paths = [
          c?.data?.extensions?.world,
          c?.world,
        ];
        for (const w of paths) {
          if (w && !worldNames.includes(w)) worldNames.push(w);
        }
      }
    } catch {}

    // ST context may expose chat-linked worldbooks via world_names
    try {
      if (ctx.worldNames && Array.isArray(ctx.worldNames)) {
        for (const w of ctx.worldNames) {
          if (w && !worldNames.includes(w)) worldNames.push(w);
        }
      }
    } catch {}
  }

  // Fallback: try ST's selected character world info
  try {
    const sw = window.selected_world_info;
    if (typeof sw === 'string' && sw && !worldNames.includes(sw)) {
      worldNames.push(sw);
    }
  } catch {}

  // Fallback: try reading from chat metadata
  try {
    const chat = ctx?.chat ?? [];
    if (chat.length > 0 && chat[0]?.extra?.world) {
      const w = chat[0].extra.world;
      if (!worldNames.includes(w)) worldNames.push(w);
    }
  } catch {}

  console.log('[EnaPlanner] Character worldbook names found:', worldNames);
  return worldNames.filter(Boolean);
}

async function getGlobalWorldbooks() {
  // Try to get the list of currently active global worldbooks
  try {
    // ST stores active worldbooks in world_info settings
    const ctx = getContextSafe();
    if (ctx?.world_info?.globalSelect) {
      return Array.isArray(ctx.world_info.globalSelect) ? ctx.world_info.globalSelect : [];
    }
  } catch {}

  // Fallback: try window.selected_world_info
  try {
    if (window.selected_world_info && Array.isArray(window.selected_world_info)) {
      return window.selected_world_info;
    }
  } catch {}

  return [];
}

async function getWorldbookData(worldName) {
  if (!worldName) return null;
  try {
    const response = await fetch('/api/worldinfo/get', {
      method: 'POST',
      headers: getRequestHeaders(),
      body: JSON.stringify({ name: worldName }),
    });
    if (response.ok) {
      const data = await response.json();
      // ST returns { entries: {...} } or { entries: [...] }
      let entries = data?.entries;
      if (entries && !Array.isArray(entries)) {
        entries = Object.values(entries);
      }
      return { name: worldName, entries: entries || [] };
    }
  } catch (e) {
    console.warn(`[EnaPlanner] Failed to load worldbook "${worldName}":`, e);
  }
  return null;
}

function keywordPresent(text, kw) {
  if (!kw) return false;
  return text.toLowerCase().includes(kw.toLowerCase());
}

function matchSelective(entry, scanText) {
  const keys = Array.isArray(entry?.key) ? entry.key.filter(Boolean) : [];
  const keys2 = Array.isArray(entry?.keysecondary) ? entry.keysecondary.filter(Boolean) : [];

  const total = keys.length;
  const hit = keys.reduce((acc, kw) => acc + (keywordPresent(scanText, kw) ? 1 : 0), 0);

  let ok = false;
  const logic = entry?.selectiveLogic ?? 0;
  if (logic === 0) ok = (total === 0) ? true : hit > 0;       // and_any
  else if (logic === 1) ok = (total === 0) ? true : hit < total; // not_all
  else if (logic === 2) ok = (total === 0) ? true : hit === 0;  // not_any
  else if (logic === 3) ok = (total === 0) ? true : hit === total; // and_all

  if (!ok) return false;

  if (keys2.length) {
    const hit2 = keys2.reduce((acc, kw) => acc + (keywordPresent(scanText, kw) ? 1 : 0), 0);
    if (hit2 <= 0) return false;
  }
  return true;
}

function sortWorldEntries(entries) {
  // Sort to mimic ST insertion order within our worldbook block.
  // Position priority: 0 (before char def) → 1 (after char def) → 4 (system depth)
  // Within pos=4: depth descending (bigger depth = further from chat = earlier)
  // Same position+depth: order ascending (higher order = closer to chat_history = later)
  const posPriority = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 };
  return [...entries].sort((a, b) => {
    const pa = posPriority[Number(a?.position ?? 0)] ?? 99;
    const pb = posPriority[Number(b?.position ?? 0)] ?? 99;
    if (pa !== pb) return pa - pb;
    // For same position (especially pos=4): bigger depth = earlier
    const da = Number(a?.depth ?? 0);
    const db = Number(b?.depth ?? 0);
    if (da !== db) return db - da;
    // Same position+depth: order ascending (smaller order first, bigger order later)
    const oa = Number(a?.order ?? 0);
    const ob = Number(b?.order ?? 0);
    return oa - ob;
  });
}

async function buildWorldbookBlock(scanText) {
  const s = ensureSettings();

  // 1. Always get character-linked worldbooks
  const charWorldNames = await getCharacterWorldbooks();

  // 2. Optionally get global worldbooks
  let globalWorldNames = [];
  if (s.includeGlobalWorldbooks) {
    globalWorldNames = await getGlobalWorldbooks();
  }

  // Deduplicate
  const allWorldNames = [...new Set([...charWorldNames, ...globalWorldNames])];

  if (!allWorldNames.length) {
    console.log('[EnaPlanner] No worldbooks to load');
    return '';
  }

  console.log('[EnaPlanner] Loading worldbooks:', allWorldNames);

  // Fetch all worldbook data
  const worldbookResults = await Promise.all(allWorldNames.map(name => getWorldbookData(name)));
  const allEntries = [];

  for (const wb of worldbookResults) {
    if (!wb || !wb.entries) continue;
    for (const entry of wb.entries) {
      if (!entry) continue;
      allEntries.push({ ...entry, _worldName: wb.name });
    }
  }

  // Filter: not disabled
  let entries = allEntries.filter(e => !e?.disable && !e?.disabled);

  // Filter: exclude entries whose name contains any of the configured exclude patterns
  const nameExcludes = s.worldbookExcludeNames ?? ['mvu_update'];
  entries = entries.filter(e => {
    const comment = String(e?.comment || e?.name || e?.title || '');
    for (const pat of nameExcludes) {
      if (pat && comment.includes(pat)) return false;
    }
    return true;
  });

  // Filter: exclude position=4 if configured
  if (s.excludeWorldbookPosition4) {
    entries = entries.filter(e => Number(e?.position) !== 4);
  }

  if (!entries.length) return '';

  // Activation: constant (blue) + keyword scan (green) only
  const active = [];
  for (const e of entries) {
    // Blue light: constant entries always included
    if (e?.constant) {
      active.push(e);
      continue;
    }
    // Green light: keyword-triggered entries
    if (matchSelective(e, scanText)) {
      active.push(e);
      continue;
    }
  }

  if (!active.length) return '';

  // Build EJS context for rendering worldbook templates
  const ejsCtx = buildEjsContext();

  const sorted = sortWorldEntries(active);
  const parts = [];
  for (const e of sorted) {
    const comment = e?.comment || e?.name || e?.title || '';
    const head = `【WorldBook:${e._worldName}】${comment ? ' ' + comment : ''}`.trim();
    let body = String(e?.content ?? '').trim();
    if (!body) continue;

    // Try EJS rendering if the entry contains EJS tags
    if (body.includes('<%')) {
      body = renderEjsTemplate(body, ejsCtx);
    }

    parts.push(`${head}\n${body}`);
  }

  if (!parts.length) return '';
  return `<worldbook>\n${parts.join('\n\n---\n\n')}\n</worldbook>`;
}

/** -------------------------
 * EJS rendering for worldbook entries
 * --------------------------*/
function getChatVariables() {
  // Try multiple paths to get ST chat variables
  try {
    const ctx = getContextSafe();
    if (ctx?.chatMetadata?.variables) return ctx.chatMetadata.variables;
  } catch {}
  try {
    if (window.chat_metadata?.variables) return window.chat_metadata.variables;
  } catch {}
  try {
    const ctx = getContextSafe();
    if (ctx?.chat_metadata?.variables) return ctx.chat_metadata.variables;
  } catch {}
  return {};
}

function buildEjsContext() {
  const vars = getChatVariables();

  // getvar: read a chat variable (supports dot-path for nested objects)
  function getvar(name) {
    if (!name) return '';
    // Direct lookup first
    if (vars[name] !== undefined) return vars[name];
    // Try dot-path traversal
    const parts = String(name).split('.');
    let cur = vars;
    for (const p of parts) {
      if (cur == null || typeof cur !== 'object') return '';
      cur = cur[p];
    }
    return cur ?? '';
  }

  // setvar: write a chat variable (no-op for our purposes, just to avoid errors)
  function setvar(name, value) {
    if (name) vars[name] = value;
    return value;
  }

  // Compute common derived values that entries might reference
  const fire = Number(getvar('stat_data.蒂娜.火')) || 0;
  const ice = Number(getvar('stat_data.蒂娜.冰')) || 0;
  const dark = Number(getvar('stat_data.蒂娜.暗')) || 0;
  const light = Number(getvar('stat_data.蒂娜.光')) || 0;
  const maxAttrValue = Math.max(fire, ice, dark, light);

  return {
    getvar, setvar,
    fire, ice, dark, light,
    maxAttrValue,
    Number, Math, JSON, String, Array, Object, parseInt, parseFloat,
    console: { log: () => {}, warn: () => {}, error: () => {} },
  };
}

function renderEjsTemplate(template, ctx) {
  // Try window.ejs first (ST loads this library)
  if (window.ejs?.render) {
    try {
      return window.ejs.render(template, ctx, { async: false });
    } catch (e) {
      console.warn('[EnaPlanner] EJS render failed, trying fallback:', e?.message);
    }
  }

  // Fallback: manual <%_ ... _%> / <%= ... %> processing
  try {
    return evalEjsFallback(template, ctx);
  } catch (e) {
    console.warn('[EnaPlanner] EJS fallback failed:', e?.message);
    return template; // Return raw if all fails
  }
}

function evalEjsFallback(template, ctx) {
  // Build a function from the EJS template
  let fnBody = 'let __out = "";\n';

  // Create local variable declarations from context
  for (const [k, v] of Object.entries(ctx)) {
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k)) {
      fnBody += `const ${k} = __ctx['${k}'];\n`;
    }
  }

  // Also add _ object with set method for _.set() patterns
  fnBody += 'const _ = { set: function() {} };\n';

  // Parse EJS template
  let pos = 0;
  const src = template;
  while (pos < src.length) {
    const tagStart = src.indexOf('<%', pos);
    if (tagStart === -1) {
      // Rest is plain text
      fnBody += `__out += ${JSON.stringify(src.slice(pos))};\n`;
      break;
    }

    // Text before tag
    if (tagStart > pos) {
      fnBody += `__out += ${JSON.stringify(src.slice(pos, tagStart))};\n`;
    }

    const tagEnd = src.indexOf('%>', tagStart);
    if (tagEnd === -1) {
      fnBody += `__out += ${JSON.stringify(src.slice(tagStart))};\n`;
      break;
    }

    let inner = src.slice(tagStart + 2, tagEnd);
    // Strip whitespace control chars
    if (inner.startsWith('_')) inner = inner.slice(1);
    if (inner.endsWith('_')) inner = inner.slice(0, -1);

    if (inner.startsWith('=')) {
      // Output expression
      fnBody += `__out += String(${inner.slice(1).trim()});\n`;
    } else if (inner.startsWith('-')) {
      // HTML-escaped output
      fnBody += `__out += String(${inner.slice(1).trim()});\n`;
    } else {
      // Code block
      fnBody += inner.trim() + '\n';
    }

    pos = tagEnd + 2;
  }

  fnBody += 'return __out;';

  const fn = new Function('__ctx', fnBody);
  return fn(ctx);
}

/** -------------------------
 * Template rendering helpers
 * --------------------------*/
async function prepareEjsEnv() {
  try {
    const et = window.EjsTemplate;
    if (!et) return null;
    const fn = et.prepareContext || et.preparecontext;
    if (typeof fn !== 'function') return null;
    return await fn.call(et, {});
  } catch { return null; }
}

async function evalEjsIfPossible(text, env) {
  try {
    const et = window.EjsTemplate;
    if (!et || !env) return text;
    const fn = et.evalTemplate || et.evaltemplate;
    if (typeof fn !== 'function') return text;
    return await fn.call(et, text, env);
  } catch { return text; }
}

function substituteMacrosViaST(text) {
  try { return substituteParamsExtended(text); } catch { return text; }
}

function deepGet(obj, path) {
  if (!obj || !path) return undefined;
  const parts = path.split('.').filter(Boolean);
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function resolveGetMessageVariableMacros(text, messageVars) {
  return text.replace(/{{\s*get_message_variable::([^}]+)\s*}}/g, (_, rawPath) => {
    const path = String(rawPath || '').trim();
    if (!path) return '';
    return safeStringify(deepGet(messageVars, path));
  });
}

function getLatestMessageVarTable() {
  try {
    if (window.Mvu?.getMvuData) {
      return window.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    }
  } catch {}
  try {
    const getVars = window.TavernHelper?.getVariables || window.Mvu?.getMvuData;
    if (typeof getVars === 'function') {
      return getVars({ type: 'message', message_id: 'latest' });
    }
  } catch {}
  return {};
}

async function renderTemplateAll(text, env, messageVars) {
  let out = String(text ?? '');
  out = await evalEjsIfPossible(out, env);
  out = substituteMacrosViaST(out);
  out = resolveGetMessageVariableMacros(out, messageVars);
  return out;
}

/** -------------------------
 * Planner response filtering
 * --------------------------*/
function stripThinkBlocks(text) {
  let out = String(text ?? '');
  out = out.replace(/<think\b[^>]*>[\s\S]*?<\/think>/gi, '');
  out = out.replace(/<thinking\b[^>]*>[\s\S]*?<\/thinking>/gi, '');
  return out.trim();
}

function extractPlotAndNoteInOrder(text) {
  const src = String(text ?? '');
  const blocks = [];
  const re = /<(plot|note)\b[^>]*>[\s\S]*?<\/\1>/gi;
  let m;
  while ((m = re.exec(src)) !== null) {
    blocks.push(m[0]);
  }
  return blocks.join('\n\n').trim();
}

function filterPlannerForInput(rawFull) {
  const noThink = stripThinkBlocks(rawFull);
  const onlyPN = extractPlotAndNoteInOrder(noThink);
  if (onlyPN) return onlyPN;
  return noThink;
}

/** -------------------------
 * Planner API calls
 * --------------------------*/
async function fetchModels() {
  const s = ensureSettings();
  if (!s.api.baseUrl) throw new Error('请先填写 API URL');
  if (!s.api.apiKey) throw new Error('请先填写 API KEY');

  const url = buildUrl('/models');
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      ...getRequestHeaders(),
      Authorization: `Bearer ${s.api.apiKey}`
    }
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`拉取模型失败: ${res.status} ${text}`.slice(0, 300));
  }

  const data = await res.json();
  const list = Array.isArray(data?.data) ? data.data : [];
  return list.map(x => x?.id).filter(Boolean);
}

async function callPlanner(messages) {
  const s = ensureSettings();
  if (!s.api.baseUrl) throw new Error('未配置 API URL');
  if (!s.api.apiKey) throw new Error('未配置 API KEY');
  if (!s.api.model) throw new Error('未选择模型');

  const url = buildUrl('/chat/completions');

  const body = {
    model: s.api.model,
    messages,
    stream: !!s.api.stream
  };

  const t = Number(s.api.temperature);
  if (!Number.isNaN(t)) body.temperature = t;
  const tp = Number(s.api.top_p);
  if (!Number.isNaN(tp)) body.top_p = tp;
  const tk = Number(s.api.top_k);
  if (!Number.isNaN(tk) && tk > 0) body.top_k = tk;
  const pp = s.api.presence_penalty === '' ? null : Number(s.api.presence_penalty);
  if (pp != null && !Number.isNaN(pp)) body.presence_penalty = pp;
  const fp = s.api.frequency_penalty === '' ? null : Number(s.api.frequency_penalty);
  if (fp != null && !Number.isNaN(fp)) body.frequency_penalty = fp;
  const mt = s.api.max_tokens === '' ? null : Number(s.api.max_tokens);
  if (mt != null && !Number.isNaN(mt) && mt > 0) body.max_tokens = mt;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...getRequestHeaders(),
      Authorization: `Bearer ${s.api.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`规划请求失败: ${res.status} ${text}`.slice(0, 500));
  }

  if (!s.api.stream) {
    const data = await res.json();
    return String(data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? '');
  }

  // SSE stream
  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buf = '';
  let full = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const chunks = buf.split('\n\n');
    buf = chunks.pop() ?? '';

    for (const ch of chunks) {
      const lines = ch.split('\n').map(x => x.trim()).filter(Boolean);
      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (payload === '[DONE]') continue;
        try {
          const j = JSON.parse(payload);
          const delta = j?.choices?.[0]?.delta;
          const piece = delta?.content ?? delta?.text ?? '';
          if (piece) full += piece;
        } catch {}
      }
    }
  }
  return full;
}

/** -------------------------
 * Build planner messages
 * --------------------------*/
function getPromptBlocksByRole(role) {
  const s = ensureSettings();
  return (s.promptBlocks || []).filter(b => b?.role === role && String(b?.content ?? '').trim());
}

async function buildPlannerMessages(rawUserInput) {
  const s = ensureSettings();
  const ctx = getContextSafe();
  const chat = ctx?.chat ?? window.SillyTavern?.chat ?? [];
  const extPrompts = ctx?.extensionPrompts ?? {};
  const charObj = getCurrentCharSafe();
  const env = await prepareEjsEnv();
  const messageVars = getLatestMessageVarTable();

  const enaSystemBlocks = getPromptBlocksByRole('system');
  const enaAssistantBlocks = getPromptBlocksByRole('assistant');
  const enaUserBlocks = getPromptBlocksByRole('user');

  const charBlockRaw = formatCharCardBlock(charObj);

  // --- Story summary (cached from previous generation via interceptor) ---
  const cachedSummary = getCachedStorySummary();

  // --- Chat history: last 2 AI messages (floors N-1 & N-3) ---
  // Two messages instead of one to avoid cross-device cache miss:
  // story_summary cache is captured during main AI generation, so if
  // user switches device and triggers Ena before a new generation,
  // having N-3 as backup context prevents a gap.
  const recentChatRaw = collectRecentChatSnippet(chat, 2);

  const plotsRaw = formatPlotsBlock(extractLastNPlots(chat, s.plotCount));
  const vectorRaw = formatVectorRecallBlock(extPrompts);

  // Build scanText for worldbook keyword activation
  const scanText = [charBlockRaw, cachedSummary, recentChatRaw, vectorRaw, plotsRaw, rawUserInput].join('\n\n');

  const worldbookRaw = await buildWorldbookBlock(scanText);

  // Render templates/macros
  const charBlock = await renderTemplateAll(charBlockRaw, env, messageVars);
  const recentChat = await renderTemplateAll(recentChatRaw, env, messageVars);
  const plots = await renderTemplateAll(plotsRaw, env, messageVars);
  const vector = await renderTemplateAll(vectorRaw, env, messageVars);
  const storySummary = cachedSummary.trim().length > 30 ? await renderTemplateAll(cachedSummary, env, messageVars) : '';
  const worldbook = await renderTemplateAll(worldbookRaw, env, messageVars);
  const userInput = await renderTemplateAll(rawUserInput, env, messageVars);

  const messages = [];

  // 1) Ena system prompts
  for (const b of enaSystemBlocks) {
    const content = await renderTemplateAll(b.content, env, messageVars);
    messages.push({ role: 'system', content });
  }

  // 2) Character card
  if (String(charBlock).trim()) messages.push({ role: 'system', content: charBlock });

  // 3) Worldbook
  if (String(worldbook).trim()) messages.push({ role: 'system', content: worldbook });

  // 3.5) Cached story summary (小白X 剧情记忆 from previous turn)
  if (storySummary.trim()) {
    messages.push({ role: 'system', content: `<story_summary>\n${storySummary}\n</story_summary>` });
  }

  // 4) Chat history (last 2 AI responses — floors N-1 & N-3)
  if (String(recentChat).trim()) messages.push({ role: 'system', content: recentChat });

  // 5) Vector recall
  if (String(vector).trim()) messages.push({ role: 'system', content: vector });

  // 6) Previous plots
  if (String(plots).trim()) messages.push({ role: 'system', content: plots });

  // 7) User input (with friendly framing)
  const userMsgContent = `以下是玩家的最新指令哦~:\n[${userInput}]`;
  messages.push({ role: 'user', content: userMsgContent });

  // Extra user blocks before user message
  for (const b of enaUserBlocks) {
    const content = await renderTemplateAll(b.content, env, messageVars);
    messages.splice(Math.max(0, messages.length - 1), 0, { role: 'system', content: `【extra-user-block】\n${content}` });
  }

  // 8) Assistant blocks
  for (const b of enaAssistantBlocks) {
    const content = await renderTemplateAll(b.content, env, messageVars);
    messages.push({ role: 'assistant', content });
  }

  return { messages, meta: { charBlockRaw, worldbookRaw, recentChatRaw, vectorRaw, cachedSummaryLen: cachedSummary.length, plotsRaw } };
}

/** -------------------------
 * Logs UI — Issue #3: proper formatting
 * --------------------------*/
function createLogModalHTML() {
  return `
<style>
  .ep-log-modal {
    display:none; position:fixed; inset:0; z-index:99999;
    background:rgba(0,0,0,0.6); overflow:hidden;
  }
  .ep-log-modal.open { display:flex; align-items:center; justify-content:center; }
  .ep-log-card {
    background:var(--SmartThemeBotMesBlurTintColor, #1a1a2e);
    color:var(--SmartThemeBodyColor, #ccc);
    border:1px solid var(--SmartThemeBorderColor, #444);
    border-radius:10px; display:flex; flex-direction:column;
    width:min(95vw, 820px); max-height:85vh; overflow:hidden;
  }
  .ep-log-head {
    display:flex; justify-content:space-between; align-items:center;
    padding:10px 14px; border-bottom:1px solid var(--SmartThemeBorderColor, #444);
    flex-shrink:0; flex-wrap:wrap; gap:8px;
  }
  .ep-log-head .title { font-weight:bold; font-size:15px; }
  .ep-log-body {
    overflow-y:auto; padding:10px 14px; flex:1; min-height:0;
    -webkit-overflow-scrolling:touch;
  }
  .ep-log-item { margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px; }
  .ep-log-item .meta { font-size:12px; opacity:0.8; display:flex; justify-content:space-between; }
  .ep-log-error { color:#f66; font-size:13px; margin:4px 0; }
  .ep-log-pre {
    white-space:pre-wrap; word-break:break-all; font-size:12px;
    max-height:300px; overflow:auto; background:rgba(0,0,0,0.3);
    padding:8px; border-radius:6px; margin-top:4px;
    -webkit-overflow-scrolling:touch;
  }
  @media (max-width:600px) {
    .ep-log-card { width:100vw; max-height:100vh; border-radius:0; }
    .ep-log-head { padding:8px 10px; }
    .ep-log-head .title { font-size:14px; }
    .ep-log-body { padding:8px 10px; }
    .ep-log-pre { font-size:11px; max-height:200px; }
  }
  /* Mobile-friendly touch targets for all Ena buttons */
  .ep-touch-btn {
    touch-action: manipulation;
    -webkit-tap-highlight-color: rgba(255,255,255,0.15);
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    min-height: 38px;
    position: relative;
    z-index: 10;
  }
</style>
<div class="ep-log-modal" id="ep_log_modal">
  <div class="ep-log-card">
    <div class="ep-log-head">
      <div class="title">Ena Planner Logs</div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="menu_button ep-touch-btn" id="ep_log_export">导出 JSON</button>
        <button class="menu_button ep-touch-btn" id="ep_log_clear">清空</button>
        <button class="menu_button ep-touch-btn" id="ep_log_close">✕ 关闭</button>
      </div>
    </div>
    <div class="ep-log-body" id="ep_log_body"></div>
  </div>
</div>`;
}

function renderLogs() {
  const body = document.getElementById('ep_log_body');
  if (!body) return;

  if (!state.logs.length) {
    body.innerHTML = `<div style="opacity:.75;">暂无日志（发送一次消息后就会记录）。</div>`;
    return;
  }

  const html = state.logs.map((log, idx) => {
    const t = log.time ?? '';
    const title = log.ok ? 'OK' : 'ERROR';
    const model = log.model ?? '';
    const err = log.error ?? '';

    // Format request messages for readable display
    const reqDisplay = (log.requestMessages ?? []).map((m, i) => {
      return `--- Message #${i + 1} [${m.role}] ---\n${m.content ?? '(empty)'}`;
    }).join('\n\n');

    return `
<div class="ep-log-item">
  <div class="meta">
    <span>#${idx + 1} · ${title} · ${t} · ${model}</span>
    <span>${log.ok ? '✅' : '❌'}</span>
  </div>
  ${err ? `<div class="ep-log-error">${escapeHtml(err)}</div>` : ''}

  <details>
    <summary>发出去的 messages（完整）</summary>
    <pre class="ep-log-pre">${escapeHtml(reqDisplay)}</pre>
  </details>

  <details>
    <summary>规划 AI 原始完整回复（含 &lt;think&gt;）</summary>
    <pre class="ep-log-pre">${escapeHtml(String(log.rawReply ?? ''))}</pre>
  </details>

  <details open>
    <summary>写回输入框的版本（已剔除 think，只保留 plot+note）</summary>
    <pre class="ep-log-pre">${escapeHtml(String(log.filteredReply ?? ''))}</pre>
  </details>
</div>`;
  }).join('');

  body.innerHTML = html;
}

function openLogModal() {
  const m = document.getElementById('ep_log_modal');
  if (!m) return;
  m.classList.add('open');
  renderLogs();
}
function closeLogModal() {
  const m = document.getElementById('ep_log_modal');
  if (!m) return;
  m.classList.remove('open');
}

/** -------------------------
 * Settings UI — Issue #1: use inline-drawer for collapsible
 * --------------------------*/
function createSettingsHTML() {
  const s = ensureSettings();
  const channel = s.api.channel;

  return `
<style>
  .ep-tabs { display:flex; gap:4px; margin-bottom:10px; flex-wrap:wrap; }
  .ep-tab { padding:6px 14px; cursor:pointer; border:1px solid var(--SmartThemeBorderColor,#444); border-radius:6px; font-size:13px; opacity:0.7; }
  .ep-tab.active { opacity:1; background:var(--SmartThemeBorderColor,#444); }
  .ep-panel { display:none; }
  .ep-panel.active { display:block; }
  .ep-row { display:flex; gap:10px; margin-bottom:8px; flex-wrap:wrap; }
  .ep-col { flex:1; min-width:140px; }
  .ep-col.wide { flex:2; min-width:200px; }
  .ep-hint { font-size:11px; opacity:0.6; margin-top:2px; }
  .ep-hint-box { font-size:12px; opacity:0.75; background:rgba(255,255,255,0.05); padding:8px; border-radius:6px; margin:8px 0; }
  .ep-divider { border-top:1px solid var(--SmartThemeBorderColor,#444); margin:10px 0; }
  .ep-actions { display:flex; gap:8px; margin:10px 0; flex-wrap:wrap; }
  .ep-badge-inline { display:inline-flex; align-items:center; gap:4px; font-size:12px; margin-left:8px; }
  .ep-badge-inline .dot { width:8px; height:8px; border-radius:50%; }
  .ep-badge-inline.ok .dot { background:#4caf50; }
  .ep-badge-inline.warn .dot { background:#ff9800; }
  #ena_planner_panel label { display:block; font-size:13px; margin-bottom:3px; }
  #ena_planner_panel select,
  #ena_planner_panel input[type="text"],
  #ena_planner_panel input[type="password"],
  #ena_planner_panel input[type="number"] {
    width:100%; padding:6px 8px; border-radius:4px; border:1px solid var(--SmartThemeBorderColor,#444);
    background:var(--SmartThemeBotMesBlurTintColor,#1a1a2e); color:var(--SmartThemeBodyColor,#ccc); font-size:13px;
  }
  #ena_planner_panel .menu_button { display:inline-block; white-space:nowrap; }
  .ep-prompt-block { border:1px solid var(--SmartThemeBorderColor,#444); border-radius:6px; padding:8px; margin-bottom:8px; }
  .ep-prompt-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; flex-wrap:wrap; gap:6px; }
  .ep-prompt-block textarea { width:100%; background:var(--SmartThemeBotMesBlurTintColor,#1a1a2e); color:var(--SmartThemeBodyColor,#ccc); border:1px solid var(--SmartThemeBorderColor,#444); border-radius:4px; padding:6px; font-size:12px; }
</style>
<div style="padding:4px 0;">
  <div style="display:flex;align-items:center;margin-bottom:8px;">
    <b style="font-size:15px;">Ena Planner</b>
    <span class="ep-badge-inline ${s.enabled ? 'ok' : 'warn'}">
      <span class="dot"></span>
      <span>${s.enabled ? 'Enabled' : 'Disabled'}</span>
    </span>
  </div>

  <div class="ep-tabs">
    <div class="ep-tab active" data-ep-tab="general">总览</div>
    <div class="ep-tab" data-ep-tab="api">API</div>
    <div class="ep-tab" data-ep-tab="prompt">提示词</div>
    <div class="ep-tab" data-ep-tab="debug">调试</div>
  </div>

  <!-- GENERAL TAB -->
  <div class="ep-panel active" data-ep-panel="general">
    <div class="ep-row">
      <div class="ep-col">
        <label>启用</label>
        <select id="ep_enabled">
          <option value="true" ${s.enabled ? 'selected' : ''}>启用</option>
          <option value="false" ${!s.enabled ? 'selected' : ''}>关闭</option>
        </select>
        <div class="ep-hint">开启后：你点发送/回车，会先走"规划模型"，把规划结果写回输入框再发送。</div>
      </div>
      <div class="ep-col">
        <label>避免重复规划（推荐开启）</label>
        <select id="ep_skip_plot">
          <option value="true" ${s.skipIfPlotPresent ? 'selected' : ''}>输入含 &lt;plot&gt; 就跳过规划</option>
          <option value="false" ${!s.skipIfPlotPresent ? 'selected' : ''}>不跳过（不建议）</option>
        </select>
        <div class="ep-hint">防止"原始+规划文本"再次被拦截规划。</div>
      </div>
    </div>

    <div class="ep-divider"></div>

    <div class="ep-row">
      <div class="ep-col">
        <label>全局世界书</label>
        <select id="ep_include_global_wb">
          <option value="false" ${!s.includeGlobalWorldbooks ? 'selected' : ''}>仅角色绑定世界书</option>
          <option value="true" ${s.includeGlobalWorldbooks ? 'selected' : ''}>额外包含全局世界书</option>
        </select>
        <div class="ep-hint">角色绑定的世界书总是会读取。这里选择是否额外包含全局世界书。</div>
      </div>
      <div class="ep-col">
        <label>排除 position=4 (深度注入)</label>
        <select id="ep_wb_pos4">
          <option value="true" ${s.excludeWorldbookPosition4 ? 'selected' : ''}>排除</option>
          <option value="false" ${!s.excludeWorldbookPosition4 ? 'selected' : ''}>不排除</option>
        </select>
      </div>
    </div>

    <div class="ep-row">
      <div class="ep-col wide">
        <label>排除条目名称（逗号分隔）</label>
        <input type="text" id="ep_wb_exclude_names" placeholder="mvu_update" value="${escapeHtml((s.worldbookExcludeNames ?? []).join(', '))}" />
        <div class="ep-hint">条目名称/备注包含这些字符串的条目会被排除。</div>
      </div>
    </div>

    <div class="ep-row">
      <div class="ep-col">
        <label>抓取最近 plot 数量（倒序抓）</label>
        <input type="number" id="ep_plot_n" min="0" step="1" value="${Number(s.plotCount) || 0}" />
      </div>
    </div>

    <div class="ep-hint-box">
      <b>自动行为说明：</b><br/>
      · 聊天片段：自动读取所有未隐藏的 AI 回复（不含用户输入）<br/>
      · 自动剔除 &lt;think&gt; 以前的内容（含未包裹的思考段落）<br/>
      · 角色卡字段（desc/personality/scenario）：有就全部加入<br/>
      · 向量召回（extensionPrompts）：有就自动加入<br/>
      · 世界书激活：常驻（蓝灯）+ 关键词触发（绿灯）
    </div>

    <div class="ep-divider"></div>

    <div class="ep-row">
      <div class="ep-col wide">
        <label>前文排除标签（逗号分隔）</label>
        <input type="text" id="ep_exclude_tags" placeholder="行动选项, UpdateVariable, StatusPlaceHolderImpl" value="${escapeHtml((s.chatExcludeTags ?? []).join(', '))}" />
        <div class="ep-hint">这些 XML 标签及其内容会从聊天历史中剔除。自闭合标签（如 &lt;Tag/&gt;）也会被移除。</div>
      </div>
    </div>

    <div class="ep-actions">
      <button class="menu_button ep-touch-btn" id="ep_open_logs">查看 Logs</button>
      <button class="menu_button ep-touch-btn" id="ep_test_planner">测试规划请求</button>
    </div>
  </div>

  <!-- API TAB -->
  <div class="ep-panel" data-ep-panel="api">
    <div class="ep-row">
      <div class="ep-col">
        <label>渠道</label>
        <select id="ep_api_channel">
          <option value="openai" ${channel === 'openai' ? 'selected' : ''}>OpenAI 兼容</option>
          <option value="gemini" ${channel === 'gemini' ? 'selected' : ''}>Gemini 兼容</option>
          <option value="claude" ${channel === 'claude' ? 'selected' : ''}>Claude 兼容</option>
        </select>
        <div class="ep-hint">影响默认前缀：OpenAI/Claude → /v1，Gemini → /v1beta</div>
      </div>
      <div class="ep-col wide">
        <label>API URL（base）</label>
        <input type="text" id="ep_api_base" placeholder="https://your-api.example.com" value="${escapeHtml(s.api.baseUrl)}" />
      </div>
    </div>

    <div class="ep-row">
      <div class="ep-col">
        <label>端点前缀</label>
        <select id="ep_prefix_mode">
          <option value="auto" ${s.api.prefixMode === 'auto' ? 'selected' : ''}>自动（按渠道）</option>
          <option value="custom" ${s.api.prefixMode === 'custom' ? 'selected' : ''}>自定义</option>
        </select>
      </div>
      <div class="ep-col">
        <label>自定义前缀</label>
        <input type="text" id="ep_prefix_custom" placeholder="/v1" value="${escapeHtml(s.api.customPrefix)}" />
      </div>
    </div>

    <div class="ep-row">
      <div class="ep-col wide">
        <label>API KEY</label>
        <input type="password" id="ep_api_key" placeholder="sk-..." value="${escapeHtml(s.api.apiKey)}" />
      </div>
    </div>

    <div class="ep-row">
      <div class="ep-col">
        <label>模型</label>
        <input type="text" id="ep_model" placeholder="gpt-4.1-mini / gemini-3-flash ..." value="${escapeHtml(s.api.model)}" />
      </div>
      <div class="ep-col">
        <label>流式</label>
        <select id="ep_stream">
          <option value="true" ${s.api.stream ? 'selected' : ''}>开启</option>
          <option value="false" ${!s.api.stream ? 'selected' : ''}>关闭</option>
        </select>
      </div>
    </div>

    <div class="ep-actions">
      <button class="menu_button" id="ep_fetch_models">拉取模型列表</button>
      <button class="menu_button" id="ep_test_conn">测试连接</button>
    </div>

    <div class="ep-divider"></div>

    <div class="ep-row">
      <div class="ep-col">
        <label>temperature</label>
        <input type="number" id="ep_temp" step="0.1" value="${Number(s.api.temperature)}" />
      </div>
      <div class="ep-col">
        <label>top_p</label>
        <input type="number" id="ep_top_p" step="0.05" value="${Number(s.api.top_p)}" />
      </div>
      <div class="ep-col">
        <label>top_k</label>
        <input type="number" id="ep_top_k" step="1" value="${Number(s.api.top_k) || 0}" />
      </div>
    </div>

    <div class="ep-row">
      <div class="ep-col">
        <label>presence_penalty</label>
        <input type="text" id="ep_pp" value="${escapeHtml(s.api.presence_penalty)}" />
      </div>
      <div class="ep-col">
        <label>frequency_penalty</label>
        <input type="text" id="ep_fp" value="${escapeHtml(s.api.frequency_penalty)}" />
      </div>
      <div class="ep-col">
        <label>max_tokens</label>
        <input type="text" id="ep_mt" value="${escapeHtml(s.api.max_tokens)}" />
      </div>
    </div>
  </div>

  <!-- PROMPT TAB -->
  <div class="ep-panel" data-ep-panel="prompt">
    <div class="ep-hint">新增多条提示词块，选择 role（system/user/assistant）。系统块放最前面；assistant 块放最后。</div>

    <div class="ep-row" style="gap:4px;flex-wrap:wrap;margin-bottom:6px;">
      <select id="ep_tpl_select" style="flex:1;min-width:120px;">
        <option value="">-- 选择模板 --</option>
        ${Object.keys(s.promptTemplates || {}).map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join('')}
      </select>
      <button class="menu_button" id="ep_tpl_save" title="覆盖现在模板">储存</button>
      <button class="menu_button" id="ep_tpl_saveas" title="另存模板">另存</button>
      <button class="menu_button" id="ep_tpl_delete" title="删除现在模板">删除</button>
    </div>

    <div id="ep_prompt_list"></div>
    <div class="ep-actions">
      <button class="menu_button" id="ep_add_prompt">新增提示词块</button>
      <button class="menu_button" id="ep_reset_prompt">重置为默认</button>
    </div>
  </div>

  <!-- DEBUG TAB -->
  <div class="ep-panel" data-ep-panel="debug">
    <div class="ep-hint-box">
      <b>工作原理：</b><br/>
      · 规划时会锁定发送按钮<br/>
      · Log 静默记录，只有出错才弹提示<br/>
      · 写回版本：剔除 &lt;think&gt;，只保留 &lt;plot&gt;+&lt;note&gt;<br/>
      · 前文自动剔除 &lt;think&gt; 以前内容和排除标签内容
    </div>
    <div class="ep-actions">
      <button class="menu_button" id="ep_debug_worldbook">诊断世界书读取</button>
      <button class="menu_button" id="ep_debug_char">诊断角色卡读取</button>
    </div>
    <pre class="ep-log-pre" id="ep_debug_output" style="max-height:300px;overflow:auto;font-size:12px;display:none;"></pre>
  </div>
</div>`;
}

function renderPromptDesigner() {
  const s = ensureSettings();
  const list = document.getElementById('ep_prompt_list');
  if (!list) return;

  const blocks = s.promptBlocks || [];
  const rows = blocks.map((b, idx) => {
    const role = b.role || 'system';
    return `
<div class="ep-prompt-block">
  <div class="ep-prompt-head">
    <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
      <input type="text" class="text_pole ep_pb_name" data-id="${b.id}" placeholder="名称" value="${escapeHtml(b.name ?? '')}" style="min-width:180px;" />
      <select class="ep_pb_role" data-id="${b.id}">
        <option value="system" ${role === 'system' ? 'selected' : ''}>system</option>
        <option value="user" ${role === 'user' ? 'selected' : ''}>user</option>
        <option value="assistant" ${role === 'assistant' ? 'selected' : ''}>assistant</option>
      </select>
    </div>
    <div style="display:flex; gap:6px;">
      <button class="menu_button ep_pb_up" data-id="${b.id}" ${idx === 0 ? 'disabled' : ''}>↑</button>
      <button class="menu_button ep_pb_down" data-id="${b.id}" ${idx === blocks.length - 1 ? 'disabled' : ''}>↓</button>
      <button class="menu_button ep_pb_del" data-id="${b.id}">删除</button>
    </div>
  </div>
  <textarea class="text_pole ep_pb_content" data-id="${b.id}" rows="6" placeholder="内容...">${escapeHtml(b.content ?? '')}</textarea>
</div>`;
  }).join('');

  list.innerHTML = rows || `<div style="opacity:.75;">暂无提示词块</div>`;
}

function bindSettingsUI() {
  const settingsEl = document.getElementById('ena_planner_settings');
  if (!settingsEl) return;

  // Tabs
  settingsEl.querySelectorAll('.ep-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      settingsEl.querySelectorAll('.ep-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const id = tab.getAttribute('data-ep-tab');
      settingsEl.querySelectorAll('.ep-panel').forEach(p => p.classList.remove('active'));
      const panel = settingsEl.querySelector(`.ep-panel[data-ep-panel="${id}"]`);
      if (panel) panel.classList.add('active');
      if (id === 'prompt') renderPromptDesigner();
    });
  });

  function save() { saveSettingsDebounced(); }

  // General
  document.getElementById('ep_enabled')?.addEventListener('change', (e) => {
    const s = ensureSettings();
    s.enabled = e.target.value === 'true';
    save();
    toastInfo(`Ena Planner: ${s.enabled ? '启用' : '关闭'}`);
    // Update badge
    const badge = document.querySelector('.ep-badge-inline');
    if (badge) {
      badge.className = `ep-badge-inline ${s.enabled ? 'ok' : 'warn'}`;
      badge.querySelector('span:last-child').textContent = s.enabled ? 'Enabled' : 'Disabled';
    }
  });

  document.getElementById('ep_skip_plot')?.addEventListener('change', (e) => {
    ensureSettings().skipIfPlotPresent = e.target.value === 'true'; save();
  });

  document.getElementById('ep_include_global_wb')?.addEventListener('change', (e) => {
    ensureSettings().includeGlobalWorldbooks = e.target.value === 'true'; save();
  });

  document.getElementById('ep_wb_pos4')?.addEventListener('change', (e) => {
    ensureSettings().excludeWorldbookPosition4 = e.target.value === 'true'; save();
  });

  document.getElementById('ep_wb_exclude_names')?.addEventListener('change', (e) => {
    const raw = e.target.value ?? '';
    ensureSettings().worldbookExcludeNames = raw.split(',').map(t => t.trim()).filter(Boolean);
    save();
  });

  document.getElementById('ep_plot_n')?.addEventListener('change', (e) => {
    ensureSettings().plotCount = Number(e.target.value) || 0; save();
  });

  document.getElementById('ep_exclude_tags')?.addEventListener('change', (e) => {
    const raw = e.target.value ?? '';
    ensureSettings().chatExcludeTags = raw.split(',').map(t => t.trim()).filter(Boolean);
    save();
  });

  // Logs — unified pointer handler for desktop + mobile
  const logBtn = document.getElementById('ep_open_logs');
  if (logBtn) {
    _addUniversalTap(logBtn, () => openLogModal());
  }

  document.getElementById('ep_test_planner')?.addEventListener('click', async () => {
    try {
      const fake = '（测试输入）我想让你帮我规划下一步剧情。';
      await runPlanningOnce(fake, true);
      toastInfo('测试完成：去 Logs 查看。');
    } catch (e) { toastErr(String(e?.message ?? e)); }
  });

  // API
  document.getElementById('ep_api_channel')?.addEventListener('change', (e) => { ensureSettings().api.channel = e.target.value; save(); });
  document.getElementById('ep_api_base')?.addEventListener('change', (e) => { ensureSettings().api.baseUrl = e.target.value.trim(); save(); });
  document.getElementById('ep_prefix_mode')?.addEventListener('change', (e) => { ensureSettings().api.prefixMode = e.target.value; save(); });
  document.getElementById('ep_prefix_custom')?.addEventListener('change', (e) => { ensureSettings().api.customPrefix = e.target.value.trim(); save(); });
  document.getElementById('ep_api_key')?.addEventListener('change', (e) => { ensureSettings().api.apiKey = e.target.value; save(); });
  document.getElementById('ep_model')?.addEventListener('change', (e) => { ensureSettings().api.model = e.target.value.trim(); save(); });
  document.getElementById('ep_stream')?.addEventListener('change', (e) => { ensureSettings().api.stream = e.target.value === 'true'; save(); });
  document.getElementById('ep_temp')?.addEventListener('change', (e) => { ensureSettings().api.temperature = Number(e.target.value); save(); });
  document.getElementById('ep_top_p')?.addEventListener('change', (e) => { ensureSettings().api.top_p = Number(e.target.value); save(); });
  document.getElementById('ep_top_k')?.addEventListener('change', (e) => { ensureSettings().api.top_k = Number(e.target.value) || 0; save(); });
  document.getElementById('ep_pp')?.addEventListener('change', (e) => { ensureSettings().api.presence_penalty = e.target.value.trim(); save(); });
  document.getElementById('ep_fp')?.addEventListener('change', (e) => { ensureSettings().api.frequency_penalty = e.target.value.trim(); save(); });
  document.getElementById('ep_mt')?.addEventListener('change', (e) => { ensureSettings().api.max_tokens = e.target.value.trim(); save(); });

  document.getElementById('ep_test_conn')?.addEventListener('click', async () => {
    try {
      const models = await fetchModels();
      toastInfo(`连接成功：${models.length} 个模型`);
    } catch (e) { toastErr(String(e?.message ?? e)); }
  });

  document.getElementById('ep_fetch_models')?.addEventListener('click', async () => {
    try {
      const models = await fetchModels();
      toastInfo(`拉取成功：${models.length} 个模型`);
      state.logs.unshift({
        time: nowISO(), ok: true, model: 'GET /models',
        requestMessages: [], rawReply: safeStringify(models), filteredReply: safeStringify(models)
      });
      clampLogs(); persistLogsMaybe();
      openLogModal(); renderLogs();
    } catch (e) { toastErr(String(e?.message ?? e)); }
  });

  // Prompt designer
  document.getElementById('ep_add_prompt')?.addEventListener('click', () => {
    const s = ensureSettings();
    s.promptBlocks.push({
      id: crypto?.randomUUID?.() ?? String(Date.now()),
      role: 'system', name: 'New Block', content: ''
    });
    save(); renderPromptDesigner();
  });

  document.getElementById('ep_reset_prompt')?.addEventListener('click', () => {
    extension_settings[EXT_NAME].promptBlocks = getDefaultSettings().promptBlocks;
    save(); renderPromptDesigner();
  });

  // Template management
  document.getElementById('ep_tpl_save')?.addEventListener('click', () => {
    const sel = document.getElementById('ep_tpl_select');
    const name = sel?.value;
    if (!name) { toastWarn('请先选择一个模板再储存'); return; }
    const s = ensureSettings();
    if (!s.promptTemplates) s.promptTemplates = {};
    s.promptTemplates[name] = JSON.parse(JSON.stringify(s.promptBlocks || []));
    save();
    toastInfo(`模板「${name}」已覆盖保存`);
  });
  document.getElementById('ep_tpl_select')?.addEventListener('change', (e) => {
    const name = e.target.value;
    if (!name) return; // 选的是占位符，不做事
    const s = ensureSettings();
    const tpl = s.promptTemplates?.[name];
    if (!tpl) { toastWarn('模板不存在'); return; }
    s.promptBlocks = JSON.parse(JSON.stringify(tpl)).map(b => ({
        ...b, id: crypto?.randomUUID?.() ?? String(Date.now() + Math.random())
    }));
    save(); renderPromptDesigner();
    toastInfo(`模板「${name}」已载入`);
  });
  document.getElementById('ep_tpl_saveas')?.addEventListener('click', () => {
    const name = prompt('请输入新模板名称：');
    if (!name || !name.trim()) return;
    const s = ensureSettings();
    if (!s.promptTemplates) s.promptTemplates = {};
    s.promptTemplates[name.trim()] = JSON.parse(JSON.stringify(s.promptBlocks || []));
    save();
    refreshTemplateSelect(name.trim()); // 刷新并选中新模板
    toastInfo(`模板「${name.trim()}」已保存`);
  });

  document.getElementById('ep_tpl_delete')?.addEventListener('click', () => {
    const sel = document.getElementById('ep_tpl_select');
    const name = sel?.value;
    if (!name) { toastWarn('请先选择要删除的模板'); return; }
    if (!confirm(`确定删除模板「${name}」？`)) return;
    const s = ensureSettings();
    if (s.promptTemplates) delete s.promptTemplates[name];
    save();
    refreshTemplateSelect();
    toastInfo(`模板「${name}」已删除`);
  });

  function refreshTemplateSelect(selectName) {
    const sel = document.getElementById('ep_tpl_select');
    if (!sel) return;
    const s = ensureSettings();
    const names = Object.keys(s.promptTemplates || {});
    sel.innerHTML = '<option value="">-- 选择模板 --</option>' +
        names.map(n => `<option value="${escapeHtml(n)}" ${n === selectName ? 'selected' : ''}>${escapeHtml(n)}</option>`).join('');
  }

  document.getElementById('ep_prompt_list')?.addEventListener('input', (e) => {
    const s = ensureSettings();
    const id = e.target?.getAttribute?.('data-id');
    if (!id) return;
    const b = s.promptBlocks.find(x => x.id === id);
    if (!b) return;
    if (e.target.classList.contains('ep_pb_name')) b.name = e.target.value;
    if (e.target.classList.contains('ep_pb_content')) b.content = e.target.value;
    save();
  });

  document.getElementById('ep_prompt_list')?.addEventListener('change', (e) => {
    const s = ensureSettings();
    const id = e.target?.getAttribute?.('data-id');
    if (!id) return;
    const b = s.promptBlocks.find(x => x.id === id);
    if (!b) return;
    if (e.target.classList.contains('ep_pb_role')) b.role = e.target.value;
    save();
  });

  document.getElementById('ep_prompt_list')?.addEventListener('click', (e) => {
    const s = ensureSettings();
    const id = e.target?.getAttribute?.('data-id');
    if (!id) return;
    const idx = s.promptBlocks.findIndex(x => x.id === id);
    if (idx < 0) return;

    if (e.target.classList.contains('ep_pb_del')) {
      s.promptBlocks.splice(idx, 1); save(); renderPromptDesigner();
    }
    if (e.target.classList.contains('ep_pb_up') && idx > 0) {
      [s.promptBlocks[idx - 1], s.promptBlocks[idx]] = [s.promptBlocks[idx], s.promptBlocks[idx - 1]];
      save(); renderPromptDesigner();
    }
    if (e.target.classList.contains('ep_pb_down') && idx < s.promptBlocks.length - 1) {
      [s.promptBlocks[idx + 1], s.promptBlocks[idx]] = [s.promptBlocks[idx], s.promptBlocks[idx + 1]];
      save(); renderPromptDesigner();
    }
  });

  // Debug buttons
  document.getElementById('ep_debug_worldbook')?.addEventListener('click', async () => {
    const out = document.getElementById('ep_debug_output');
    if (!out) return;
    out.style.display = 'block';
    out.textContent = '正在诊断世界书读取...\n';
    try {
      const charWb = await getCharacterWorldbooks();
      out.textContent += `角色世界书名称: ${JSON.stringify(charWb)}\n`;
      const globalWb = await getGlobalWorldbooks();
      out.textContent += `全局世界书名称: ${JSON.stringify(globalWb)}\n`;
      const all = [...new Set([...charWb, ...globalWb])];
      for (const name of all) {
        const data = await getWorldbookData(name);
        const count = data?.entries?.length ?? 0;
        const enabled = data?.entries?.filter(e => !e?.disable && !e?.disabled)?.length ?? 0;
        out.textContent += `  "${name}": ${count} 条目, ${enabled} 已启用\n`;
      }
      if (!all.length) {
        out.textContent += '⚠️ 未找到任何世界书。请检查角色卡是否绑定了世界书。\n';
        // Extra diagnostics
        const charObj = getCurrentCharSafe();
        out.textContent += `charObj存在: ${!!charObj}\n`;
        if (charObj) {
          out.textContent += `charObj.world: ${charObj?.world}\n`;
          out.textContent += `charObj.data.extensions.world: ${charObj?.data?.extensions?.world}\n`;
        }
        const ctx = getContextSafe();
        out.textContent += `ctx存在: ${!!ctx}\n`;
        if (ctx) {
          out.textContent += `ctx.characterId: ${ctx?.characterId}\n`;
          out.textContent += `ctx.this_chid: ${ctx?.this_chid}\n`;
        }
      }
    } catch (e) { out.textContent += `错误: ${e?.message ?? e}\n`; }
  });

  document.getElementById('ep_debug_char')?.addEventListener('click', () => {
    const out = document.getElementById('ep_debug_output');
    if (!out) return;
    out.style.display = 'block';
    const charObj = getCurrentCharSafe();
    if (!charObj) {
      out.textContent = '⚠️ 未检测到角色。\n';
      const ctx = getContextSafe();
      out.textContent += `ctx: ${!!ctx}, ctx.characterId: ${ctx?.characterId}, ctx.this_chid: ${ctx?.this_chid}\n`;
      out.textContent += `window.this_chid: ${window.this_chid}\n`;
      out.textContent += `window.characters count: ${window.characters?.length ?? 'N/A'}\n`;
      return;
    }
    const block = formatCharCardBlock(charObj);
    out.textContent = `角色名: ${charObj?.name}\n`;
    out.textContent += `desc长度: ${(charObj?.description ?? '').length}\n`;
    out.textContent += `personality长度: ${(charObj?.personality ?? '').length}\n`;
    out.textContent += `scenario长度: ${(charObj?.scenario ?? '').length}\n`;
    out.textContent += `world: ${charObj?.world ?? charObj?.data?.extensions?.world ?? '(无)'}\n`;
    out.textContent += `---\n${block.slice(0, 500)}...\n`;
  });
}

function injectUI() {
  ensureSettings();
  loadPersistedLogsMaybe();

  if (document.getElementById('ena_planner_settings')) return;

  // 动态注入 tab 按钮
  const menuBar = document.querySelector('.settings-menu-vertical');
  if (!menuBar) return;
  if (!menuBar.querySelector('[data-target="ena-planner"]')) {
    const tabDiv = document.createElement('div');
    tabDiv.className = 'menu-tab';
    tabDiv.setAttribute('data-target', 'ena-planner');
    tabDiv.setAttribute('style', 'border-bottom:1px solid #303030;');
    tabDiv.innerHTML = '<span class="vertical-text">剧情规划</span>';
    menuBar.appendChild(tabDiv);
  }

  // 动态注入面板容器
  const contentArea = document.querySelector('.settings-content');
  if (!contentArea) return;
  if (!document.getElementById('ena_planner_panel')) {
    const panel = document.createElement('div');
    panel.id = 'ena_planner_panel';
    panel.className = 'ena-planner settings-section';
    contentArea.appendChild(panel);
  }

  const container = document.getElementById('ena_planner_panel');
  if (!container) return;

  const wrap = document.createElement('div');
  wrap.innerHTML = createSettingsHTML();
  container.appendChild(wrap.firstElementChild);

  // Log modal
  if (!document.getElementById('ep_log_modal')) {
    const modalWrap = document.createElement('div');
    modalWrap.innerHTML = createLogModalHTML();
    while (modalWrap.firstChild) document.body.appendChild(modalWrap.firstChild);

    _addUniversalTap(document.getElementById('ep_log_close'), () => closeLogModal());
    const logModal = document.getElementById('ep_log_modal');
    if (logModal) {
      _addUniversalTap(logModal, (e) => { if (e.target === logModal) closeLogModal(); });
    }
    document.getElementById('ep_log_clear')?.addEventListener('click', () => {
      state.logs = []; persistLogsMaybe(); renderLogs();
    });
    document.getElementById('ep_log_export')?.addEventListener('click', () => {
      try {
        const blob = new Blob([JSON.stringify(state.logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `ena-planner-logs-${Date.now()}.json`; a.click();
        URL.revokeObjectURL(url);
      } catch (e) { toastErr('导出失败：' + String(e?.message ?? e)); }
    });
  }

  bindSettingsUI();
}

/** -------------------------
 * Planning runner + logging
 * --------------------------*/
async function runPlanningOnce(rawUserInput, silent = false) {
  const s = ensureSettings();

  const log = {
    time: nowISO(), ok: false, model: s.api.model,
    requestMessages: [], rawReply: '', filteredReply: '', error: ''
  };

  try {
    const { messages } = await buildPlannerMessages(rawUserInput);
    log.requestMessages = messages;

    const rawReply = await callPlanner(messages);
    log.rawReply = rawReply;

    const filtered = filterPlannerForInput(rawReply);
    log.filteredReply = filtered;
    log.ok = true;

    state.logs.unshift(log); clampLogs(); persistLogsMaybe();
    return { rawReply, filtered };
  } catch (e) {
    log.error = String(e?.message ?? e);
    state.logs.unshift(log); clampLogs(); persistLogsMaybe();
    if (!silent) toastErr(log.error);
    throw e;
  }
}

/** -------------------------
 * Intercept send
 * --------------------------*/
function getSendTextarea() { return document.getElementById('send_textarea'); }
function getSendButton() { return document.getElementById('send_but') || document.getElementById('send_button'); }

function shouldInterceptNow() {
  const s = ensureSettings();
  if (!s.enabled || state.isPlanning) return false;
  const ta = getSendTextarea();
  if (!ta) return false;
  const txt = String(ta.value ?? '').trim();
  if (!txt) return false;
  if (state.bypassNextSend) return false;
  if (s.skipIfPlotPresent && /<plot\b/i.test(txt)) return false;
  return true;
}

async function doInterceptAndPlanThenSend() {
  const ta = getSendTextarea();
  const btn = getSendButton();
  if (!ta || !btn) return;

  const raw = String(ta.value ?? '').trim();
  if (!raw) return;

  state.isPlanning = true;
  setSendUIBusy(true);

  try {
    toastInfo('Ena Planner：正在规划…');
    const { filtered } = await runPlanningOnce(raw, false);
    const merged = `${raw}\n\n${filtered}`.trim();
    ta.value = merged;
    state.lastInjectedText = merged;

    state.bypassNextSend = true;
    btn.click();
  } finally {
    state.isPlanning = false;
    setSendUIBusy(false);
    setTimeout(() => { state.bypassNextSend = false; }, 800);
  }
}

function installSendInterceptors() {
  document.addEventListener('click', (e) => {
    const btn = getSendButton();
    if (!btn) return;
    if (e.target !== btn && !btn.contains(e.target)) return;
    if (!shouldInterceptNow()) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    doInterceptAndPlanThenSend().catch(err => toastErr(String(err?.message ?? err)));
  }, true);

  document.addEventListener('keydown', (e) => {
    const ta = getSendTextarea();
    if (!ta || e.target !== ta) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      if (!shouldInterceptNow()) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      doInterceptAndPlanThenSend().catch(err => toastErr(String(err?.message ?? err)));
    }
  }, true);
}

export function initEnaPlanner() {
    ensureSettings();
    loadPersistedLogsMaybe();

    const tryInject = () => {
        if (document.querySelector('.settings-menu-vertical')) {
            injectUI();
            installSendInterceptors();
        } else {
            setTimeout(tryInject, 500);
        }
    };
    tryInject();
}
