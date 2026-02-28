import { extension_settings } from '../../../../../extensions.js';
import { getRequestHeaders, saveSettingsDebounced, substituteParamsExtended } from '../../../../../../script.js';
import { getStorySummaryForEna } from '../story-summary/story-summary.js';
import { buildVectorPromptText } from '../story-summary/generate/prompt.js';
import { getVectorConfig } from '../story-summary/data/config.js';
import { extensionFolderPath } from '../../core/constants.js';
import { EnaPlannerStorage } from '../../core/server-storage.js';
import { postToIframe, isTrustedIframeEvent } from '../../core/iframe-messaging.js';
import { DEFAULT_PROMPT_BLOCKS, BUILTIN_TEMPLATES } from './ena-planner-presets.js';

const EXT_NAME = 'ena-planner';
const OVERLAY_ID = 'xiaobaix-ena-planner-overlay';
const HTML_PATH = `${extensionFolderPath}/modules/ena-planner/ena-planner.html`;
const VECTOR_RECALL_TIMEOUT_MS = 15000;
const PLANNER_REQUEST_TIMEOUT_MS = 90000;

/**
 * -------------------------
 * Default settings
 * --------------------------
 */
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
        // Planner response tags to keep, in source order (empty = keep full response)
        responseKeepTags: ['plot', 'note', 'plot-log', 'state'],

        // Planner prompts (designer)
        promptBlocks: structuredClone(DEFAULT_PROMPT_BLOCKS),
        // Saved prompt templates: { name: promptBlocks[] }
        promptTemplates: structuredClone(BUILTIN_TEMPLATES),
        // Currently selected prompt template name in UI
        activePromptTemplate: '',

        // Planner API
        api: {
            channel: 'openai',
            baseUrl: '',
            prefixMode: 'auto',
            customPrefix: '',
            apiKey: '',
            model: '',
            stream: true,
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

/**
 * -------------------------
 * Local state
 * --------------------------
 */
const state = {
    isPlanning: false,
    bypassNextSend: false,
    lastInjectedText: '',
    logs: []
};

let config = null;
let overlay = null;
let iframeMessageBound = false;
let sendListenersInstalled = false;
let sendClickHandler = null;
let sendKeydownHandler = null;

/**
 * -------------------------
 * Helpers
 * --------------------------
 */
function ensureSettings() {
    const d = getDefaultSettings();
    const s = config || structuredClone(d);

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
    if (!Array.isArray(s.responseKeepTags)) s.responseKeepTags = structuredClone(d.responseKeepTags);
    else s.responseKeepTags = normalizeResponseKeepTags(s.responseKeepTags);

    // Migration: remove old keys that are no longer needed
    delete s.includeCharacterLorebooks;
    delete s.includeCharDesc;
    delete s.includeCharPersonality;
    delete s.includeCharScenario;
    delete s.includeVectorRecall;
    delete s.historyMessageCount;
    delete s.worldbookActivationMode;

    config = s;
    return s;
}

function normalizeResponseKeepTags(tags) {
    const src = Array.isArray(tags) ? tags : [];
    const cleaned = [];
    for (const raw of src) {
        const t = String(raw || '')
            .trim()
            .replace(/^<+|>+$/g, '')
            .toLowerCase();
        if (!/^[a-z][a-z0-9_-]*$/.test(t)) continue;
        if (!cleaned.includes(t)) cleaned.push(t);
    }
    return cleaned;
}

async function loadConfig() {
    const loaded = await EnaPlannerStorage.get('config', null);
    config = (loaded && typeof loaded === 'object') ? loaded : getDefaultSettings();
    ensureSettings();
    state.logs = Array.isArray(await EnaPlannerStorage.get('logs', [])) ? await EnaPlannerStorage.get('logs', []) : [];

    if (extension_settings?.[EXT_NAME]) {
        delete extension_settings[EXT_NAME];
        saveSettingsDebounced?.();
    }
    return config;
}

async function saveConfigNow() {
    ensureSettings();
    await EnaPlannerStorage.set('config', config);
    await EnaPlannerStorage.set('logs', state.logs);
    try {
        return await EnaPlannerStorage.saveNow({ silent: false });
    } catch {
        return false;
    }
}

function toastInfo(msg) {
    if (window.toastr?.info) return window.toastr.info(msg);
    console.log('[EnaPlanner]', msg);
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
    state.logs = state.logs.slice(0, s.logsMax);
    EnaPlannerStorage.set('logs', state.logs).catch(() => {});
}

function loadPersistedLogsMaybe() {
    const s = ensureSettings();
    if (!s.logsPersist) state.logs = [];
}

function nowISO() {
    return new Date().toISOString();
}

function runWithTimeout(taskFactory, timeoutMs, timeoutMessage) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
        Promise.resolve()
            .then(taskFactory)
            .then(resolve)
            .catch(reject)
            .finally(() => clearTimeout(timer));
    });
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
    const escapedPrefix = finalPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const hasSameSuffix = !!finalPrefix && new RegExp(`${escapedPrefix}$`, 'i').test(base);
    const normalizedBase = hasSameSuffix ? base.slice(0, -finalPrefix.length) : base;
    return `${normalizedBase}${finalPrefix}${finalPath}`;
}

function setSendUIBusy(busy) {
    const sendBtn = document.getElementById('send_but') || document.getElementById('send_button');
    const textarea = document.getElementById('send_textarea');
    if (sendBtn) sendBtn.disabled = !!busy;
    if (textarea) textarea.disabled = !!busy;
}

function safeStringify(val) {
    if (val == null) return '';
    if (typeof val === 'string') return val;
    try { return JSON.stringify(val, null, 2); } catch { return String(val); }
}

/**
 * -------------------------
 * ST context helpers
 * --------------------------
 */
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
    } catch { }
    return null;
}

/**
 * -------------------------
 * Character card — always include desc/personality/scenario
 * --------------------------
 */
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

/**
 * -------------------------
 * Chat history — ALL unhidden, AI responses ONLY
 * Strip: unclosed think blocks, configurable tags
 * --------------------------
 */
function cleanAiMessageText(text) {
    let out = String(text ?? '');

    // 1) Strip properly wrapped <think>/<thinking> blocks only.
    out = out.replace(/<think\b[^>]*>[\s\S]*?<\/think>/gi, '');
    out = out.replace(/<thinking\b[^>]*>[\s\S]*?<\/thinking>/gi, '');

    // 2) Strip user-configured exclude tags
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
    const live = getStorySummaryForEna();
    const ctx = getContextSafe();
    const meta = ctx?.chatMetadata ?? window.chat_metadata;

    if (live && live.trim().length > 30) {
        // 拿到了新的，存起来
        if (meta) {
            meta.ena_cached_story_summary = live;
            saveSettingsDebounced();
        }
        return live;
    }

    // 没拿到（首轮/重启），从 chat_metadata 读上次的
    if (meta?.ena_cached_story_summary) {
        console.log('[EnaPlanner] Using persisted story summary from chat_metadata');
        return meta.ena_cached_story_summary;
    }

    return '';
}

/**
 * -------------------------
 * Plot extraction
 * --------------------------
 */
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

/**
 * -------------------------
 * Worldbook — read via ST API (like idle-watcher)
 * Always read character-linked worldbooks.
 * Optionally include global worldbooks.
 * Activation: constant (blue) + keyword scan (green) only.
 * --------------------------
 */

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
        } catch { }

        // ST context may expose chat-linked worldbooks via world_names
        try {
            if (ctx.worldNames && Array.isArray(ctx.worldNames)) {
                for (const w of ctx.worldNames) {
                    if (w && !worldNames.includes(w)) worldNames.push(w);
                }
            }
        } catch { }
    }

    // Fallback: try ST's selected character world info
    try {
        const sw = window.selected_world_info;
        if (typeof sw === 'string' && sw && !worldNames.includes(sw)) {
            worldNames.push(sw);
        }
    } catch { }

    // Fallback: try reading from chat metadata
    try {
        const chat = ctx?.chat ?? [];
        if (chat.length > 0 && chat[0]?.extra?.world) {
            const w = chat[0].extra.world;
            if (!worldNames.includes(w)) worldNames.push(w);
        }
    } catch { }

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
    } catch { }

    // Fallback: try window.selected_world_info
    try {
        if (window.selected_world_info && Array.isArray(window.selected_world_info)) {
            return window.selected_world_info;
        }
    } catch { }

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

/**
 * -------------------------
 * EJS rendering for worldbook entries
 * --------------------------
 */
function getChatVariables() {
  let vars = {};

  // 1) Chat-level variables
  try {
    const ctx = getContextSafe();
    if (ctx?.chatMetadata?.variables) vars = { ...ctx.chatMetadata.variables };
  } catch {}
  if (!Object.keys(vars).length) {
    try {
      if (window.chat_metadata?.variables) vars = { ...window.chat_metadata.variables };
    } catch {}
  }
  if (!Object.keys(vars).length) {
    try {
      const ctx = getContextSafe();
      if (ctx?.chat_metadata?.variables) vars = { ...ctx.chat_metadata.variables };
    } catch {}
  }

  // 2) Always merge message-level variables (some presets store vars here instead of chat-level)
  try {
    const msgVars = getLatestMessageVarTable();
    if (msgVars && typeof msgVars === 'object') {
      for (const key of Object.keys(msgVars)) {
        // Skip MVU internal metadata keys
        if (key === 'schema' || key === 'display_data' || key === 'delta_data') continue;
        if (vars[key] === undefined) {
          // Chat-level doesn't have this key at all — take from message-level
          vars[key] = msgVars[key];
        } else if (
          vars[key] && typeof vars[key] === 'object' && !Array.isArray(vars[key]) &&
          msgVars[key] && typeof msgVars[key] === 'object' && !Array.isArray(msgVars[key])
        ) {
          // Both have this key as objects — shallow merge (message-level fills gaps)
          for (const subKey of Object.keys(msgVars[key])) {
            if (vars[key][subKey] === undefined) {
              vars[key][subKey] = msgVars[key][subKey];
            }
          }
        }
      }
    }
  } catch {}

  return vars;
}

function buildEjsContext() {
    const vars = getChatVariables();

    // getvar: read a chat variable (supports dot-path for nested objects)
    function getvar(name) {
        if (!name) return '';
        let val;
        if (vars[name] !== undefined) {
            val = vars[name];
        } else {
            const parts = String(name).split('.');
            let cur = vars;
            for (const p of parts) {
                if (cur == null || typeof cur !== 'object') return '';
                cur = cur[p];
            }
            val = cur ?? '';
        }
        // 字符串布尔值转为真正的布尔值
        if (val === 'false' || val === 'False' || val === 'FALSE') return false;
        if (val === 'true' || val === 'True' || val === 'TRUE') return true;
        return val;
    }

    // setvar: write a chat variable (no-op for our purposes, just to avoid errors)
    function setvar(name, value) {
        if (name) vars[name] = value;
        return value;
    }

    return {
        getvar, setvar,
        vars,
        Number, Math, JSON, String, Array, Object, parseInt, parseFloat,
        console: { log: () => { }, warn: () => { }, error: () => { } },
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

    // Safe degradation when ejs is not available.
    console.warn('[EnaPlanner] window.ejs not available, skipping EJS rendering. Template returned as-is.');
    return template;
}

/**
 * -------------------------
 * Template rendering helpers
 * --------------------------
 */
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
    } catch { }
    try {
        const getVars = window.TavernHelper?.getVariables || window.Mvu?.getMvuData;
        if (typeof getVars === 'function') {
            return getVars({ type: 'message', message_id: 'latest' });
        }
    } catch { }
    return {};
}

async function renderTemplateAll(text, env, messageVars) {
    let out = String(text ?? '');
    out = await evalEjsIfPossible(out, env);
    out = substituteMacrosViaST(out);
    out = resolveGetMessageVariableMacros(out, messageVars);
    return out;
}

/**
 * -------------------------
 * Planner response filtering
 * --------------------------
 */
function stripThinkBlocks(text) {
    let out = String(text ?? '');
    out = out.replace(/<think\b[^>]*>[\s\S]*?<\/think>/gi, '');
    out = out.replace(/<thinking\b[^>]*>[\s\S]*?<\/thinking>/gi, '');
    return out.trim();
}

function extractSelectedBlocksInOrder(text, tagNames) {
    const names = normalizeResponseKeepTags(tagNames);
    if (!Array.isArray(names) || names.length === 0) return '';
    const src = String(text ?? '');
    const blocks = [];
    const escapedNames = names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const re = new RegExp(`<(${escapedNames.join('|')})\\b[^>]*>[\\s\\S]*?<\\/\\1>`, 'gi');
    let m;
    while ((m = re.exec(src)) !== null) {
        blocks.push(m[0]);
    }
    return blocks.join('\n\n').trim();
}

function filterPlannerForInput(rawFull) {
    const noThink = stripThinkBlocks(rawFull);
    const tags = ensureSettings().responseKeepTags;
    const selected = extractSelectedBlocksInOrder(noThink, tags);
    if (selected) return selected;
    return noThink;
}

function filterPlannerPreview(rawPartial) {
    return stripThinkBlocks(rawPartial);
}

/**
 * -------------------------
 * Planner API calls
 * --------------------------
 */
async function callPlanner(messages, options = {}) {
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PLANNER_REQUEST_TIMEOUT_MS);
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                ...getRequestHeaders(),
                Authorization: `Bearer ${s.api.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
            signal: controller.signal
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`规划请求失败: ${res.status} ${text}`.slice(0, 500));
        }

        if (!s.api.stream) {
            const data = await res.json();
            const text = String(data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? '');
            if (text) options?.onDelta?.(text, text);
            return text;
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
                        if (piece) {
                            full += piece;
                            options?.onDelta?.(piece, full);
                        }
                    } catch { }
                }
            }
        }
        return full;
    } catch (err) {
        if (controller.signal.aborted || err?.name === 'AbortError') {
            throw new Error(`规划请求超时（>${Math.floor(PLANNER_REQUEST_TIMEOUT_MS / 1000)}s）`);
        }
        throw err;
    } finally {
        clearTimeout(timeoutId);
    }
}

async function fetchModelsForUi() {
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

async function debugWorldbookForUi() {
    let out = '正在诊断世界书读取...\n';
    const charWb = await getCharacterWorldbooks();
    out += `角色世界书名称: ${JSON.stringify(charWb)}\n`;
    const globalWb = await getGlobalWorldbooks();
    out += `全局世界书名称: ${JSON.stringify(globalWb)}\n`;
    const all = [...new Set([...charWb, ...globalWb])];
    for (const name of all) {
        const data = await getWorldbookData(name);
        const count = data?.entries?.length ?? 0;
        const enabled = data?.entries?.filter(e => !e?.disable && !e?.disabled)?.length ?? 0;
        out += `  "${name}": ${count} 条目, ${enabled} 已启用\n`;
    }
    if (!all.length) {
        out += '⚠️ 未找到任何世界书。请检查角色卡是否绑定了世界书。\n';
        const charObj = getCurrentCharSafe();
        out += `charObj存在: ${!!charObj}\n`;
        if (charObj) {
            out += `charObj.world: ${charObj?.world}\n`;
            out += `charObj.data.extensions.world: ${charObj?.data?.extensions?.world}\n`;
        }
        const ctx = getContextSafe();
        out += `ctx存在: ${!!ctx}\n`;
        if (ctx) {
            out += `ctx.characterId: ${ctx?.characterId}\n`;
            out += `ctx.this_chid: ${ctx?.this_chid}\n`;
        }
    }
    return out;
}

function debugCharForUi() {
    const charObj = getCurrentCharSafe();
    if (!charObj) {
        const ctx = getContextSafe();
        return [
            '⚠️ 未检测到角色。',
            `ctx: ${!!ctx}, ctx.characterId: ${ctx?.characterId}, ctx.this_chid: ${ctx?.this_chid}`,
            `window.this_chid: ${window.this_chid}`,
            `window.characters count: ${window.characters?.length ?? 'N/A'}`
        ].join('\n');
    }
    const block = formatCharCardBlock(charObj);
    return [
        `角色名: ${charObj?.name}`,
        `desc长度: ${(charObj?.description ?? '').length}`,
        `personality长度: ${(charObj?.personality ?? '').length}`,
        `scenario长度: ${(charObj?.scenario ?? '').length}`,
        `world: ${charObj?.world ?? charObj?.data?.extensions?.world ?? '(无)'}`,
        `---\n${block.slice(0, 500)}...`
    ].join('\n');
}

/**
 * -------------------------
 * Build planner messages
 * --------------------------
 */
function getPromptBlocksByRole(role) {
    const s = ensureSettings();
    return (s.promptBlocks || []).filter(b => b?.role === role && String(b?.content ?? '').trim());
}

async function buildPlannerMessages(rawUserInput) {
    const s = ensureSettings();
    const ctx = getContextSafe();
    const chat = ctx?.chat ?? window.SillyTavern?.chat ?? [];
    const charObj = getCurrentCharSafe();
    const env = await prepareEjsEnv();
    const messageVars = getLatestMessageVarTable();

    const enaSystemBlocks = getPromptBlocksByRole('system');
    const enaAssistantBlocks = getPromptBlocksByRole('assistant');
    const enaUserBlocks = getPromptBlocksByRole('user');

    const charBlockRaw = formatCharCardBlock(charObj);

    // --- Story memory: try fresh vector recall with current user input ---
    let cachedSummary = '';
    let recallSource = 'none';
    try {
        const vectorCfg = getVectorConfig();
        if (vectorCfg?.enabled) {
            const result = await runWithTimeout(
                () => buildVectorPromptText(false, {
                    pendingUserMessage: rawUserInput,
                }),
                VECTOR_RECALL_TIMEOUT_MS,
                `向量召回超时（>${Math.floor(VECTOR_RECALL_TIMEOUT_MS / 1000)}s）`
            );
            cachedSummary = result?.text?.trim() || '';
            if (cachedSummary) recallSource = 'fresh';
        }
    } catch (e) {
        console.warn('[Ena] Fresh vector recall failed, falling back to cached data:', e);
    }
    if (!cachedSummary) {
        cachedSummary = getCachedStorySummary();
        if (cachedSummary) recallSource = 'stale';
    }
    console.log(`[Ena] Story memory source: ${recallSource}`);

    // --- Chat history: last 2 AI messages (floors N-1 & N-3) ---
    // Two messages instead of one to avoid cross-device cache miss:
    // story_summary cache is captured during main AI generation, so if
    // user switches device and triggers Ena before a new generation,
    // having N-3 as backup context prevents a gap.
    const recentChatRaw = collectRecentChatSnippet(chat, 2);

    const plotsRaw = formatPlotsBlock(extractLastNPlots(chat, s.plotCount));
    const vectorRaw = '';

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

    // 4) Chat history (last 2 AI responses — floors N-1 & N-3)
    if (String(recentChat).trim()) messages.push({ role: 'system', content: recentChat });

    // 4.5) Story memory (小白X <剧情记忆> — after chat context, before plots)
    if (storySummary.trim()) {
        messages.push({ role: 'system', content: `<story_summary>\n${storySummary}\n</story_summary>` });
    }

    // 5) Vector recall — merged into story_summary above, kept for compatibility
    // (vectorRaw is empty; this block intentionally does nothing)
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

/**
 * -------------------------
 * Planning runner + logging
 * --------------------------
 */
async function runPlanningOnce(rawUserInput, silent = false, options = {}) {
    const s = ensureSettings();

    const log = {
        time: nowISO(), ok: false, model: s.api.model,
        requestMessages: [], rawReply: '', filteredReply: '', error: ''
    };

    try {
        const { messages } = await buildPlannerMessages(rawUserInput);
        log.requestMessages = messages;

        const rawReply = await callPlanner(messages, options);
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

/**
 * -------------------------
 * Intercept send
 * --------------------------
 */
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
        const { filtered } = await runPlanningOnce(raw, false, {
            onDelta(_piece, full) {
                if (!state.isPlanning) return;
                if (!ensureSettings().api.stream) return;
                const preview = filterPlannerPreview(full);
                ta.value = `${raw}\n\n${preview}`.trim();
            }
        });
        const merged = `${raw}\n\n${filtered}`.trim();
        ta.value = merged;
        state.lastInjectedText = merged;

        state.bypassNextSend = true;
        btn.click();
    } catch (err) {
        ta.value = raw;
        state.lastInjectedText = '';
        throw err;
    } finally {
        state.isPlanning = false;
        setSendUIBusy(false);
        setTimeout(() => { state.bypassNextSend = false; }, 800);
    }
}

function installSendInterceptors() {
    if (sendListenersInstalled) return;
    sendClickHandler = (e) => {
        const btn = getSendButton();
        if (!btn) return;
        if (e.target !== btn && !btn.contains(e.target)) return;
        if (!shouldInterceptNow()) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        doInterceptAndPlanThenSend().catch(err => toastErr(String(err?.message ?? err)));
    };
    sendKeydownHandler = (e) => {
        const ta = getSendTextarea();
        if (!ta || e.target !== ta) return;
        if (e.key === 'Enter' && !e.shiftKey) {
            if (!shouldInterceptNow()) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            doInterceptAndPlanThenSend().catch(err => toastErr(String(err?.message ?? err)));
        }
    };
    document.addEventListener('click', sendClickHandler, true);
    document.addEventListener('keydown', sendKeydownHandler, true);
    sendListenersInstalled = true;
}

function uninstallSendInterceptors() {
    if (!sendListenersInstalled) return;
    if (sendClickHandler) document.removeEventListener('click', sendClickHandler, true);
    if (sendKeydownHandler) document.removeEventListener('keydown', sendKeydownHandler, true);
    sendClickHandler = null;
    sendKeydownHandler = null;
    sendListenersInstalled = false;
}

function getIframeConfigPayload() {
    const s = ensureSettings();
    return {
        ...s,
        logs: state.logs,
    };
}

function openSettings() {
    if (document.getElementById(OVERLAY_ID)) return;

    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: ${window.innerHeight}px;
        background: rgba(0,0,0,0.5);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    `;

    const iframe = document.createElement('iframe');
    iframe.src = HTML_PATH;
    iframe.style.cssText = `
        width: min(1200px, 96vw);
        height: min(980px, 94vh);
        max-height: calc(100% - 24px);
        border: none;
        border-radius: 12px;
        background: #1a1a1a;
    `;

    overlay.appendChild(iframe);
    document.body.appendChild(overlay);

    if (!iframeMessageBound) {
        // Guarded by isTrustedIframeEvent (origin + source).
        // eslint-disable-next-line no-restricted-syntax
        window.addEventListener('message', handleIframeMessage);
        iframeMessageBound = true;
    }
}

function closeSettings() {
    const overlayEl = document.getElementById(OVERLAY_ID);
    if (overlayEl) overlayEl.remove();
    overlay = null;
}

async function handleIframeMessage(ev) {
    const iframe = overlay?.querySelector('iframe');
    if (!isTrustedIframeEvent(ev, iframe)) return;
    if (!ev.data?.type?.startsWith('xb-ena:')) return;

    const { type, payload } = ev.data;
    switch (type) {
        case 'xb-ena:ready':
            postToIframe(iframe, { type: 'xb-ena:config', payload: getIframeConfigPayload() });
            break;
        case 'xb-ena:close':
            closeSettings();
            break;
        case 'xb-ena:save-config': {
            const requestId = payload?.requestId || '';
            const patch = (payload && typeof payload.patch === 'object') ? payload.patch : payload;
            Object.assign(ensureSettings(), patch || {});
            const ok = await saveConfigNow();
            if (ok) {
                postToIframe(iframe, {
                    type: 'xb-ena:config-saved',
                    payload: {
                        ...getIframeConfigPayload(),
                        requestId
                    }
                });
            } else {
                postToIframe(iframe, {
                    type: 'xb-ena:config-save-error',
                    payload: {
                        message: '保存失败',
                        requestId
                    }
                });
            }
            break;
        }
        case 'xb-ena:reset-prompt-default': {
            const requestId = payload?.requestId || '';
            const s = ensureSettings();
            s.promptBlocks = getDefaultSettings().promptBlocks;
            const ok = await saveConfigNow();
            if (ok) {
                postToIframe(iframe, {
                    type: 'xb-ena:config-saved',
                    payload: {
                        ...getIframeConfigPayload(),
                        requestId
                    }
                });
            } else {
                postToIframe(iframe, {
                    type: 'xb-ena:config-save-error',
                    payload: {
                        message: '重置失败',
                        requestId
                    }
                });
            }
            break;
        }
        case 'xb-ena:run-test': {
            try {
                const fake = payload?.text || '（测试输入）我想让你帮我规划下一步剧情。';
                await runPlanningOnce(fake, true);
                postToIframe(iframe, { type: 'xb-ena:test-done' });
                postToIframe(iframe, { type: 'xb-ena:logs', payload: { logs: state.logs } });
            } catch (err) {
                postToIframe(iframe, { type: 'xb-ena:test-error', payload: { message: String(err?.message ?? err) } });
            }
            break;
        }
        case 'xb-ena:logs-request':
            postToIframe(iframe, { type: 'xb-ena:logs', payload: { logs: state.logs } });
            break;
        case 'xb-ena:logs-clear':
            state.logs = [];
            await saveConfigNow();
            postToIframe(iframe, { type: 'xb-ena:logs', payload: { logs: state.logs } });
            break;
        case 'xb-ena:fetch-models': {
            try {
                const models = await fetchModelsForUi();
                postToIframe(iframe, { type: 'xb-ena:models', payload: { models } });
            } catch (err) {
                postToIframe(iframe, { type: 'xb-ena:models-error', payload: { message: String(err?.message ?? err) } });
            }
            break;
        }
        case 'xb-ena:debug-worldbook': {
            try {
                const output = await debugWorldbookForUi();
                postToIframe(iframe, { type: 'xb-ena:debug-output', payload: { output } });
            } catch (err) {
                postToIframe(iframe, { type: 'xb-ena:debug-output', payload: { output: String(err?.message ?? err) } });
            }
            break;
        }
        case 'xb-ena:debug-char': {
            const output = debugCharForUi();
            postToIframe(iframe, { type: 'xb-ena:debug-output', payload: { output } });
            break;
        }
    }
}

export async function initEnaPlanner() {
    await loadConfig();
    loadPersistedLogsMaybe();
    installSendInterceptors();
    window.xiaobaixEnaPlanner = { openSettings, closeSettings };
}

export function cleanupEnaPlanner() {
    uninstallSendInterceptors();
    closeSettings();
    if (iframeMessageBound) {
        window.removeEventListener('message', handleIframeMessage);
        iframeMessageBound = false;
    }
    delete window.xiaobaixEnaPlanner;
}
