/**
 * ============================================================================
 * Story Outline 模块 - 剧情地图系统
 * ============================================================================
 * 功能：生成和管理RPG式剧情世界，提供地图导航、NPC管理、短信系统、世界推演
 *
 * 分区：
 * 1. 导入与常量
 * 2. 通用工具
 * 3. JSON解析
 * 4. 存储管理
 * 5. LLM调用
 * 6. 世界书操作
 * 7. 剧情注入
 * 8. iframe通讯
 * 9. 请求处理器
 * 10. UI管理
 * 11. 事件与初始化
 * ============================================================================
 */

// ==================== 1. 导入与常量 ====================
import { extension_settings, saveMetadataDebounced } from "../../../../../extensions.js";
import { chat_metadata, name1, processCommands, eventSource, event_types as st_event_types } from "../../../../../../script.js";
import { loadWorldInfo, saveWorldInfo, world_names, world_info } from "../../../../../world-info.js";
import { getContext } from "../../../../../st-context.js";
import { streamingGeneration } from "../streaming-generation.js";
import { EXT_ID, extensionFolderPath } from "../../core/constants.js";
import { createModuleEvents, event_types } from "../../core/event-manager.js";
import { promptManager } from "../../../../../openai.js";
import {
    buildSmsMessages, buildSummaryMessages, buildSmsHistoryContent, buildExistingSummaryContent,
    buildNpcGenerationMessages, formatNpcToWorldbookContent, buildExtractStrangersMessages,
    buildWorldGenStep1Messages, buildWorldGenStep2Messages, buildWorldSimMessages, buildSceneSwitchMessages,
    buildInviteMessages, buildLocalMapGenMessages, buildLocalMapRefreshMessages, buildLocalSceneGenMessages,
    buildOverlayHtml, MOBILE_LAYOUT_STYLE, DESKTOP_LAYOUT_STYLE, getPromptConfigPayload, setPromptConfig
} from "./story-outline-prompt.js";

const events = createModuleEvents('storyOutline');
const IFRAME_PATH = `${extensionFolderPath}/modules/story-outline/story-outline.html`;
const STORAGE_KEYS = { global: 'LittleWhiteBox_StoryOutline_GlobalSettings', comm: 'LittleWhiteBox_StoryOutline_CommSettings' };
const STORY_OUTLINE_ID = 'lwb_story_outline';
const CHAR_CARD_UID = '__CHARACTER_CARD__';
const DEBUG_KEY = 'LittleWhiteBox_StoryOutline_Debug';

let overlayCreated = false, frameReady = false, currentMesId = null, pendingMsgs = [], presetCleanup = null, step1Cache = null;

// ==================== 2. 通用工具 ====================

/** 移动端检测 */
const isMobile = () => window.innerWidth < 550;

/** 安全执行函数 */
const safe = fn => { try { return fn(); } catch { return null; } };
const isDebug = () => {
    try { return localStorage.getItem(DEBUG_KEY) === '1'; } catch { return false; }
};

/** localStorage读写 */
const getStore = (k, def) => safe(() => JSON.parse(localStorage.getItem(k))) || def;
const setStore = (k, v) => safe(() => localStorage.setItem(k, JSON.stringify(v)));

/** 随机范围 */
const randRange = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

/**
 * 修复单个 JSON 字符串的语法问题
 * 仅在已提取的候选上调用，不做全局破坏性操作
 */
function fixJson(s) {
    if (!s || typeof s !== 'string') return s;

    let r = s.trim()
        // 统一引号：只转换弯引号
        .replace(/[""]/g, '"').replace(/['']/g, "'")
        // 修复键名后的错误引号：如 "key': → "key":
        .replace(/"([^"']+)'[\s]*:/g, '"$1":')
        .replace(/'([^"']+)"[\s]*:/g, '"$1":')
        // 修复单引号包裹的完整值：: 'value' → : "value"
        .replace(/:[\s]*'([^']*)'[\s]*([,}\]])/g, ':"$1"$2')
        // 修复无引号的键名
        .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
        // 移除尾随逗号
        .replace(/,[\s\n]*([}\]])/g, '$1')
        // 修复 undefined 和 NaN
        .replace(/:\s*undefined\b/g, ': null').replace(/:\s*NaN\b/g, ': null');

    // 补全未闭合的括号
    let braces = 0, brackets = 0, inStr = false, esc = false;
    for (const c of r) {
        if (esc) { esc = false; continue; }
        if (c === '\\' && inStr) { esc = true; continue; }
        if (c === '"') { inStr = !inStr; continue; }
        if (!inStr) {
            if (c === '{') braces++; else if (c === '}') braces--;
            if (c === '[') brackets++; else if (c === ']') brackets--;
        }
    }
    while (braces-- > 0) r += '}';
    while (brackets-- > 0) r += ']';
    return r;
}

/**
 * 从输入中提取 JSON（非破坏性扫描版）
 * 策略：
 * 1. 直接在原始字符串中扫描所有 {...} 结构
 * 2. 对每个候选单独清洗和解析
 * 3. 按有效属性评分，返回最佳结果
 */
function extractJson(input, isArray = false) {
    if (!input) return null;

    // 处理已经是对象的输入
    if (typeof input === 'object' && input !== null) {
        if (isArray && Array.isArray(input)) return input;
        if (!isArray && !Array.isArray(input)) {
            const content = input.choices?.[0]?.message?.content
                ?? input.choices?.[0]?.message?.reasoning_content
                ?? input.content ?? input.reasoning_content;
            if (content != null) return extractJson(String(content).trim(), isArray);
            if (!input.choices) return input;
        }
        return null;
    }

    // 预处理：只做最基本的清理
    const str = String(input).trim()
        .replace(/^\uFEFF/, '')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .replace(/\r\n?/g, '\n');
    if (!str) return null;

    const tryParse = s => { try { return JSON.parse(s); } catch { return null; } };
    const ok = (o, arr) => o != null && (arr ? Array.isArray(o) : typeof o === 'object' && !Array.isArray(o));

    // 评分函数：meta=10, world/maps=5, 其他=3
    const score = o => (o?.meta ? 10 : 0) + (o?.world ? 5 : 0) + (o?.maps ? 5 : 0) +
        (o?.truth ? 3 : 0) + (o?.onion_layers ? 3 : 0) + (o?.atmosphere ? 3 : 0) + (o?.trajectory ? 3 : 0) + (o?.user_guide ? 3 : 0);

    // 1. 直接尝试解析（最理想情况）
    let r = tryParse(str);
    if (ok(r, isArray) && score(r) > 0) return r;

    // 2. 扫描所有 {...} 或 [...] 结构
    const open = isArray ? '[' : '{';
    const candidates = [];

    for (let i = 0; i < str.length; i++) {
        if (str[i] !== open) continue;

        // 括号匹配找闭合位置
        let depth = 0, inStr = false, esc = false;
        for (let j = i; j < str.length; j++) {
            const c = str[j];
            if (esc) { esc = false; continue; }
            if (c === '\\' && inStr) { esc = true; continue; }
            if (c === '"') { inStr = !inStr; continue; }
            if (inStr) continue;
            if (c === '{' || c === '[') depth++;
            else if (c === '}' || c === ']') depth--;
            if (depth === 0) {
                candidates.push({ start: i, end: j, text: str.slice(i, j + 1) });
                i = j; // 跳过已处理的部分
                break;
            }
        }
    }

    // 3. 按长度排序（大的优先，更可能是完整对象）
    candidates.sort((a, b) => b.text.length - a.text.length);

    // 4. 尝试解析每个候选，记录最佳结果
    let best = null, bestScore = -1;

    for (const { text } of candidates) {
        // 直接解析
        r = tryParse(text);
        if (ok(r, isArray)) {
            const s = score(r);
            if (s > bestScore) { best = r; bestScore = s; }
            if (s >= 10) return r; // 有 meta 就直接返回
            continue;
        }

        // 修复后解析
        const fixed = fixJson(text);
        r = tryParse(fixed);
        if (ok(r, isArray)) {
            const s = score(r);
            if (s > bestScore) { best = r; bestScore = s; }
            if (s >= 10) return r;
        }
    }

    // 5. 返回最佳结果
    if (best) return best;

    // 6. 最后尝试：取第一个 { 到最后一个 } 之间的内容
    const firstBrace = str.indexOf('{');
    const lastBrace = str.lastIndexOf('}');
    if (!isArray && firstBrace !== -1 && lastBrace > firstBrace) {
        const chunk = str.slice(firstBrace, lastBrace + 1);
        r = tryParse(chunk) || tryParse(fixJson(chunk));
        if (ok(r, isArray)) return r;
    }

    return null;
}

export { extractJson };

// ==================== 4. 存储管理 ====================

/** 获取扩展设置 */
const getSettings = () => { const e = extension_settings[EXT_ID] ||= {}; e.storyOutline ||= { enabled: true }; return e; };

/** 获取剧情大纲存储 */
function getOutlineStore() {
    if (!chat_metadata) return null;
    const ext = chat_metadata.extensions ||= {}, lwb = ext[EXT_ID] ||= {};
    return lwb.storyOutline ||= {
        mapData: null, stage: 0, deviationScore: 0, simulationProgress: 0, simulationTarget: 5, playerLocation: '家',
        outlineData: { meta: null, world: null, outdoor: null, indoor: null, sceneSetup: null, strangers: null, contacts: null },
        dataChecked: { meta: true, world: true, outdoor: true, indoor: true, sceneSetup: true, strangers: false, contacts: false, characterContactSms: false }
    };
}

/** 全局/通讯设置读写 */
const getGlobalSettings = () => getStore(STORAGE_KEYS.global, { apiUrl: '', apiKey: '', model: '', mode: 'assist' });
const saveGlobalSettings = s => setStore(STORAGE_KEYS.global, s);
const getCommSettings = () => ({ historyCount: 50, npcPosition: 0, npcOrder: 100, ...getStore(STORAGE_KEYS.comm, {}) });
const saveCommSettings = s => setStore(STORAGE_KEYS.comm, s);

/** 获取角色卡信息 */
function getCharInfo() {
    const ctx = getContext(), char = ctx.characters?.[ctx.characterId];
    return {
        name: char?.name || char?.data?.name || char?.avatar || '角色卡',
        desc: String((char?.description ?? char?.data?.description ?? '') || '').trim() || '{{description}}'
    };
}

/** 获取角色卡短信历史 */
function getCharSmsHistory() {
    if (!chat_metadata) return null;
    const root = chat_metadata.LittleWhiteBox_StoryOutline ||= {};
    const h = root.characterContactSmsHistory ||= { messages: [], summarizedCount: 0, summaries: {} };
    h.messages ||= []; h.summarizedCount ||= 0; h.summaries ||= {};
    return h;
}

// ==================== 5. LLM调用 ====================


/** 调用LLM */
async function callLLM(promptOrMsgs, useRaw = false) {
    const { apiUrl, apiKey, model } = getGlobalSettings();

    const normalize = r => {
        if (r == null) return '';
        if (typeof r === 'string') return r;
        if (typeof r === 'object') {
            if (r.data && typeof r.data === 'object') return normalize(r.data);
            if (typeof r.text === 'string') return r.text;
            if (typeof r.response === 'string') return r.response;
            const inner = r.content?.trim?.() || r.reasoning_content?.trim?.() || r.choices?.[0]?.message?.content?.trim?.() || r.choices?.[0]?.message?.reasoning_content?.trim?.() || null;
            if (inner != null) return String(inner);
            return safe(() => JSON.stringify(r)) || String(r);
        }
        return String(r);
    };

    // 构建基础选项
    const opts = { nonstream: 'true', lock: 'on' };
    if (apiUrl?.trim()) Object.assign(opts, { api: 'openai', apiurl: apiUrl.trim(), ...(apiKey && { apipassword: apiKey }), ...(model && { model }) });

    if (useRaw) {
        const messages = Array.isArray(promptOrMsgs)
            ? promptOrMsgs
            : [{ role: 'user', content: String(promptOrMsgs || '').trim() }];

        // 直接把消息转成 top 参数格式，不做预处理
        // {$worldInfo} 和 {$historyN} 由 xbgenrawCommand 内部处理
        const roleMap = { user: 'user', assistant: 'assistant', system: 'sys' };
        const topParts = messages
            .filter(m => m?.role && typeof m.content === 'string' && m.content.trim())
            .map(m => {
                const role = roleMap[m.role] || m.role;
                return `${role}={${m.content}}`;
            });
        const topParam = topParts.join(';');

        opts.top = topParam;
        // 不设置 addon，让 xbgenrawCommand 自己处理 {$worldInfo} 占位符替换

        const raw = await streamingGeneration.xbgenrawCommand(opts, '');
        const text = normalize(raw).trim();

        if (isDebug()) {
            try {
                console.groupCollapsed('[StoryOutline] callLLM(useRaw via xbgenrawCommand)');
                console.log('opts.top.length', topParam.length);
                console.log('raw', raw);
                console.log('normalized.length', text.length);
                console.groupEnd();
            } catch { }
        }
        return text;
    }

    opts.as = 'user';
    opts.position = 'history';
    return normalize(await streamingGeneration.xbgenCommand(opts, promptOrMsgs)).trim();
}

/** 调用LLM并解析JSON */
async function callLLMJson({ messages, useRaw = true, isArray = false, validate }) {
    try {
        const result = await callLLM(messages, useRaw);
        if (isDebug()) {
            try {
                const s = String(result ?? '');
                console.groupCollapsed('[StoryOutline] callLLMJson');
                console.log({ useRaw, isArray, length: s.length });
                console.log('result.head', s.slice(0, 500));
                console.log('result.tail', s.slice(Math.max(0, s.length - 500)));
                console.groupEnd();
            } catch { }
        }
        const parsed = extractJson(result, isArray);
        if (isDebug()) {
            try {
                console.groupCollapsed('[StoryOutline] extractJson');
                console.log('parsed', parsed);
                console.log('validate', !!(parsed && validate?.(parsed)));
                console.groupEnd();
            } catch { }
        }
        if (parsed && validate(parsed)) return parsed;
    } catch { }
    return null;
}

// ==================== 6. 世界书操作 ====================

/** 获取角色卡绑定的世界书 */
async function getCharWorldbooks() {
    const ctx = getContext(), char = ctx.characters?.[ctx.characterId];
    if (!char) return [];
    const books = [], primary = char.data?.extensions?.world;
    if (primary && world_names?.includes(primary)) books.push(primary);
    (world_info?.charLore || []).find(e => e.name === char.avatar)?.extraBooks?.forEach(b => {
        if (world_names?.includes(b) && !books.includes(b)) books.push(b);
    });
    return books;
}

/** 根据UID查找条目 */
async function findEntry(uid) {
    const uidNum = parseInt(uid, 10);
    if (isNaN(uidNum)) return null;
    for (const book of await getCharWorldbooks()) {
        const data = await loadWorldInfo(book);
        if (data?.entries?.[uidNum]) return { bookName: book, entry: data.entries[uidNum], uidNumber: uidNum, worldData: data };
    }
    return null;
}

/** 根据名称搜索条目 */
async function searchEntry(name) {
    const nl = (name || '').toLowerCase().trim();
    for (const book of await getCharWorldbooks()) {
        const data = await loadWorldInfo(book);
        if (!data?.entries) continue;
        for (const [uid, entry] of Object.entries(data.entries)) {
            const keys = Array.isArray(entry.key) ? entry.key : [];
            if (keys.some(k => { const kl = (k || '').toLowerCase().trim(); return kl === nl || kl.includes(nl) || nl.includes(kl); }))
                return { uid: String(uid), bookName: book, entry };
        }
    }
    return null;
}

// ==================== 7. 剧情注入 ====================

/** 获取可见洋葱层级 */
const getVisibleLayers = stage => ['L1_The_Veil', 'L2_The_Distortion', 'L3_The_Law', 'L4_The_Agent', 'L5_The_Axiom'].slice(0, Math.min(Math.max(0, stage), 3) + 2);

/** 格式化剧情数据为提示词 */
function formatOutlinePrompt() {
    const store = getOutlineStore();
    if (!store?.outlineData) return "";

    const { outlineData: d, dataChecked: c, playerLocation } = store, stage = store.stage ?? 0;
    let text = "## Story Outline (剧情地图数据)\n\n", has = false;

    // 世界真相
    if (c?.meta && d.meta?.truth) {
        has = true;
        text += "### 世界真相 (World Truth)\n> 注意：以下信息仅供生成逻辑参考，不可告知玩家。\n";
        if (d.meta.truth.background) text += `* 背景真相: ${d.meta.truth.background}\n`;
        const dr = d.meta.truth.driver;
        if (dr) { if (dr.source) text += `* 驱动: ${dr.source}\n`; if (dr.target_end) text += `* 目的: ${dr.target_end}\n`; if (dr.tactic) text += `* 当前手段: ${dr.tactic}\n`; }

        // 当前气氛
        const atm = d.meta.atmosphere?.current;
        if (atm) {
            if (atm.environmental) text += `* 当前气氛: ${atm.environmental}\n`;
            if (atm.npc_attitudes) text += `* NPC态度: ${atm.npc_attitudes}\n`;
        }

        const onion = d.meta.onion_layers || d.meta.truth.onion_layers;
        if (onion) {
            text += "* 当前可见层级:\n";
            getVisibleLayers(stage).forEach(k => {
                const l = onion[k]; if (!l || !Array.isArray(l) || !l.length) return;
                const name = k.replace(/_/g, ' - ');
                l.forEach(i => { text += `  - [${name}] ${i.desc}: ${i.logic}\n`; });
            });
        }
        text += "\n";
    }

    // 世界资讯
    if (c?.world && d.world?.news?.length) { has = true; text += "### 世界资讯 (News)\n"; d.world.news.forEach(n => { text += `* ${n.title}: ${n.content}\n`; }); text += "\n"; }

    // 环境信息
    let mapC = "", locNode = null;
    if (c?.outdoor && d.outdoor) {
        if (d.outdoor.description) mapC += `> 大地图环境: ${d.outdoor.description}\n`;
        if (playerLocation && d.outdoor.nodes?.length) locNode = d.outdoor.nodes.find(n => n.name === playerLocation);
    }
    if (!locNode && c?.indoor && d.indoor?.nodes?.length && playerLocation) locNode = d.indoor.nodes.find(n => n.name === playerLocation);
    const indoorMap = (c?.indoor && playerLocation && d.indoor && typeof d.indoor === 'object' && !Array.isArray(d.indoor)) ? d.indoor[playerLocation] : null;
    const locText = indoorMap?.description || locNode?.info || '';
    if (playerLocation && locText) mapC += `\n> 当前地点 (${playerLocation}):\n${locText}\n`;
    if (c?.indoor && d.indoor && !locNode && !indoorMap && d.indoor.description) { mapC += d.indoor.name ? `\n> 当前地点: ${d.indoor.name}\n` : "\n> 局部区域:\n"; mapC += `${d.indoor.description}\n`; }
    if (mapC) { has = true; text += `### 环境信息 (Environment)\n${mapC}\n`; }

    // 周边人物
    let charC = "";
    if (c?.contacts && d.contacts?.length) { charC += "* 联络人:\n"; d.contacts.forEach(p => charC += `  - ${p.name}${p.location ? ` @ ${p.location}` : ''}: ${p.info || ''}\n`); }
    if (c?.strangers && d.strangers?.length) { charC += "* 陌路人:\n"; d.strangers.forEach(p => charC += `  - ${p.name}${p.location ? ` @ ${p.location}` : ''}: ${p.info || ''}\n`); }
    if (charC) { has = true; text += `### 周边人物 (Characters)\n${charC}\n`; }

    // 当前剧情
    if (c?.sceneSetup && d.sceneSetup) {
        const ss = d.sceneSetup.sideStory || d.sceneSetup.side_story || d.sceneSetup;
        if (ss && (ss.surface || ss.inner)) { has = true; text += "### 当前剧情 (Current Scene)\n"; if (ss.surface) text += `* 表象: ${ss.surface}\n`; if (ss.inner) text += `* 里层 (潜台词): ${ss.inner}\n`; text += "\n"; }
    }

    // 角色卡短信
    if (c?.characterContactSms) {
        const { name: charName } = getCharInfo(), hist = getCharSmsHistory();
        const sums = hist?.summaries || {}, sumKeys = Object.keys(sums).filter(k => k !== '_count').sort((a, b) => a - b);
        const msgs = hist?.messages || [], sc = hist?.summarizedCount || 0, rem = msgs.slice(sc);
        if (sumKeys.length || rem.length) {
            has = true; text += `### ${charName}短信记录\n`;
            if (sumKeys.length) text += `[摘要] ${sumKeys.map(k => sums[k]).join('；')}\n`;
            if (rem.length) text += rem.map(m => `${m.type === 'sent' ? '{{user}}' : charName}：${m.text}`).join('\n') + "\n";
            text += "\n";
        }
    }

    return has ? text.trim() : "";
}

/** 确保剧情大纲Prompt存在 */
function ensurePrompt() {
    if (!promptManager) return false;
    let prompt = promptManager.getPromptById(STORY_OUTLINE_ID);
    if (!prompt) {
        promptManager.addPrompt({ identifier: STORY_OUTLINE_ID, name: '剧情地图', role: 'system', content: '', system_prompt: false, marker: false, extension: true }, STORY_OUTLINE_ID);
        prompt = promptManager.getPromptById(STORY_OUTLINE_ID);
    }
    const char = promptManager.activeCharacter;
    if (!char) return true;
    const order = promptManager.getPromptOrderForCharacter(char);
    const exists = order.some(e => e.identifier === STORY_OUTLINE_ID);
    if (!exists) { const idx = order.findIndex(e => e.identifier === 'charDescription'); order.splice(idx !== -1 ? idx : 0, 0, { identifier: STORY_OUTLINE_ID, enabled: true }); }
    else { const entry = order.find(e => e.identifier === STORY_OUTLINE_ID); if (entry && !entry.enabled) entry.enabled = true; }
    promptManager.render?.(false);
    return true;
}

/** 更新剧情大纲Prompt内容 */
function updatePromptContent() {
    if (!promptManager) return;
    if (!getSettings().storyOutline?.enabled) { removePrompt(); return; }
    ensurePrompt();
    const store = getOutlineStore(), prompt = promptManager.getPromptById(STORY_OUTLINE_ID);
    if (!prompt) return;
    const { dataChecked } = store || {};
    const hasAny = dataChecked && Object.values(dataChecked).some(v => v === true);
    prompt.content = (!hasAny || !store) ? '' : (formatOutlinePrompt() || '');
    promptManager.render?.(false);
}

/** 移除剧情大纲Prompt */
function removePrompt() {
    if (!promptManager) return;
    const prompts = promptManager.serviceSettings?.prompts;
    if (prompts) { const idx = prompts.findIndex(p => p?.identifier === STORY_OUTLINE_ID); if (idx !== -1) prompts.splice(idx, 1); }
    const orders = promptManager.serviceSettings?.prompt_order;
    if (orders) orders.forEach(cfg => { if (cfg?.order) { const idx = cfg.order.findIndex(e => e?.identifier === STORY_OUTLINE_ID); if (idx !== -1) cfg.order.splice(idx, 1); } });
    promptManager.render?.(false);
}

/** 设置ST预设事件监听 */
function setupSTEvents() {
    if (presetCleanup) return;
    const onChanged = () => { if (getSettings().storyOutline?.enabled) setTimeout(() => { ensurePrompt(); updatePromptContent(); }, 100); };
    const onExport = preset => {
        if (!preset) return;
        if (preset.prompts) { const i = preset.prompts.findIndex(p => p?.identifier === STORY_OUTLINE_ID); if (i !== -1) preset.prompts.splice(i, 1); }
        if (preset.prompt_order) preset.prompt_order.forEach(c => { if (c?.order) { const i = c.order.findIndex(e => e?.identifier === STORY_OUTLINE_ID); if (i !== -1) c.order.splice(i, 1); } });
    };
    eventSource.on(st_event_types.OAI_PRESET_CHANGED_AFTER, onChanged);
    eventSource.on(st_event_types.OAI_PRESET_EXPORT_READY, onExport);
    presetCleanup = () => { try { eventSource.removeListener(st_event_types.OAI_PRESET_CHANGED_AFTER, onChanged); } catch { } try { eventSource.removeListener(st_event_types.OAI_PRESET_EXPORT_READY, onExport); } catch { } };
}

const injectOutline = () => updatePromptContent();

// ==================== 8. iframe通讯 ====================

/** 发送消息到iframe */
function postFrame(payload) {
    const iframe = document.getElementById("xiaobaix-story-outline-iframe");
    if (!iframe?.contentWindow || !frameReady) { pendingMsgs.push(payload); return; }
    iframe.contentWindow.postMessage({ source: "LittleWhiteBox", ...payload }, "*");
}

const flushPending = () => { if (!frameReady) return; const f = document.getElementById("xiaobaix-story-outline-iframe"); pendingMsgs.forEach(p => f?.contentWindow?.postMessage({ source: "LittleWhiteBox", ...p }, "*")); pendingMsgs = []; };

/** 发送设置到iframe */
function sendSettings() {
    const store = getOutlineStore(), { name: charName, desc: charDesc } = getCharInfo();
    postFrame({
        type: "LOAD_SETTINGS", globalSettings: getGlobalSettings(), commSettings: getCommSettings(),
        stage: store?.stage ?? 0, deviationScore: store?.deviationScore ?? 0, simulationProgress: store?.simulationProgress ?? 0,
        simulationTarget: store?.simulationTarget ?? 5, playerLocation: store?.playerLocation ?? '家',
        dataChecked: store?.dataChecked || {}, outlineData: store?.outlineData || {}, promptConfig: getPromptConfigPayload?.(),
        characterCardName: charName, characterCardDescription: charDesc,
        characterContactSmsHistory: getCharSmsHistory()
    });
}

const loadAndSend = () => { const s = getOutlineStore(); if (s?.mapData) postFrame({ type: "LOAD_MAP_DATA", mapData: s.mapData }); sendSettings(); };

// ==================== 9. 请求处理器 ====================

const reply = (type, reqId, data) => postFrame({ type, requestId: reqId, ...data });
const replyErr = (type, reqId, err) => reply(type, reqId, { error: err });

/** 获取当前气氛 */
function getAtmosphere(store) {
    return store?.outlineData?.meta?.atmosphere?.current || null;
}

/** 合并世界推演数据 */
function mergeSimData(orig, upd) {
    if (!upd) return orig;
    const r = JSON.parse(JSON.stringify(orig || {}));
    const um = upd?.meta || {}, ut = um.truth || upd?.truth, uo = um.onion_layers || ut?.onion_layers;
    const ua = um.atmosphere || upd?.atmosphere, utr = um.trajectory || upd?.trajectory;
    r.meta = r.meta || {}; r.meta.truth = r.meta.truth || {};
    if (ut?.driver?.tactic) r.meta.truth.driver = { ...r.meta.truth.driver, tactic: ut.driver.tactic };
    if (uo) { ['L1_The_Veil', 'L2_The_Distortion', 'L3_The_Law', 'L4_The_Agent', 'L5_The_Axiom'].forEach(l => { const v = uo[l]; if (Array.isArray(v) && v.length) { r.meta.onion_layers = r.meta.onion_layers || {}; r.meta.onion_layers[l] = v; } }); if (r.meta.truth?.onion_layers) delete r.meta.truth.onion_layers; }
    if (um.user_guide || upd?.user_guide) r.meta.user_guide = um.user_guide || upd.user_guide;
    // 更新 atmosphere
    if (ua) { r.meta.atmosphere = ua; }
    // 更新 trajectory
    if (utr) { r.meta.trajectory = utr; }
    if (upd?.world) r.world = upd.world;
    if (upd?.maps?.outdoor) { r.maps = r.maps || {}; r.maps.outdoor = r.maps.outdoor || {}; if (upd.maps.outdoor.description) r.maps.outdoor.description = upd.maps.outdoor.description; if (Array.isArray(upd.maps.outdoor.nodes)) { const on = r.maps.outdoor.nodes || []; upd.maps.outdoor.nodes.forEach(n => { const i = on.findIndex(x => x.name === n.name); if (i >= 0) on[i] = { ...n }; else on.push(n); }); r.maps.outdoor.nodes = on; } }
    return r;
}

/** 检查自动推演 */
async function checkAutoSim(reqId) {
    const store = getOutlineStore();
    if (!store || (store.simulationProgress || 0) < (store.simulationTarget ?? 5)) return;
    const data = { meta: store.outlineData?.meta || {}, world: store.outlineData?.world || null, maps: { outdoor: store.outlineData?.outdoor || null, indoor: store.outlineData?.indoor || null } };
    await handleSimWorld({ requestId: `wsim_auto_${Date.now()}`, currentData: JSON.stringify(data), isAuto: true });
}

// 验证器
const V = {
    sum: o => o?.summary, npc: o => o?.name && o?.aliases, arr: o => Array.isArray(o),
    scene: o => !!o?.review?.deviation && !!(o?.local_map || o?.scene_setup?.local_map),
    lscene: o => !!o?.side_story, inv: o => typeof o?.invite === 'boolean' && o?.reply,
    sms: o => typeof o?.reply === 'string' && o.reply.length > 0,
    wg1: d => !!d && typeof d === 'object',  // 只要是对象就行，后续会 normalize
    wg2: d => !!(d?.world && (d?.maps || d?.world?.maps)?.outdoor),
    wga: d => !!(d?.world && d?.maps?.outdoor), ws: d => !!d, w: o => !!o && typeof o === 'object',
    lm: o => !!o?.inside?.name && !!o?.inside?.description
};

// --- 处理器 ---

async function handleFetchModels({ apiUrl, apiKey }) {
    try {
        let models = [];
        if (!apiUrl) {
            for (const ep of ['/api/backends/chat-completions/models', '/api/openai/models']) {
                try { const r = await fetch(ep, { headers: { 'Content-Type': 'application/json' } }); if (r.ok) { const j = await r.json(); models = (j.data || j || []).map(m => m.id || m.name || m).filter(m => typeof m === 'string'); if (models.length) break; } } catch { }
            }
            if (!models.length) throw new Error('无法从酒馆获取模型列表');
        } else {
            const h = { 'Content-Type': 'application/json', ...(apiKey && { Authorization: `Bearer ${apiKey}` }) };
            const r = await fetch(apiUrl.replace(/\/$/, '') + '/models', { headers: h });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const j = await r.json();
            models = (j.data || j || []).map(m => m.id || m.name || m).filter(m => typeof m === 'string');
        }
        postFrame({ type: "FETCH_MODELS_RESULT", models });
    } catch (e) { postFrame({ type: "FETCH_MODELS_RESULT", error: e.message }); }
}

async function handleTestConn({ apiUrl, apiKey, model }) {
    try {
        if (!apiUrl) { for (const ep of ['/api/backends/chat-completions/status', '/api/openai/models', '/api/backends/chat-completions/models']) { try { if ((await fetch(ep, { headers: { 'Content-Type': 'application/json' } })).ok) { postFrame({ type: "TEST_CONN_RESULT", success: true, message: `连接成功${model ? ` (模型: ${model})` : ''}` }); return; } } catch { } } throw new Error('无法连接到酒馆API'); }
        const h = { 'Content-Type': 'application/json', ...(apiKey && { Authorization: `Bearer ${apiKey}` }) };
        if (!(await fetch(apiUrl.replace(/\/$/, '') + '/models', { headers: h })).ok) throw new Error('连接失败');
        postFrame({ type: "TEST_CONN_RESULT", success: true, message: `连接成功${model ? ` (模型: ${model})` : ''}` });
    } catch (e) { postFrame({ type: "TEST_CONN_RESULT", success: false, message: `连接失败: ${e.message}` }); }
}

async function handleCheckUid({ uid, requestId }) {
    const num = parseInt(uid, 10);
    if (!uid?.trim() || isNaN(num)) return replyErr("CHECK_WORLDBOOK_UID_RESULT", requestId, isNaN(num) ? 'UID必须是数字' : '请输入有效的UID');
    const books = await getCharWorldbooks();
    if (!books.length) return replyErr("CHECK_WORLDBOOK_UID_RESULT", requestId, '当前角色卡没有绑定世界书');
    for (const book of books) {
        const data = await loadWorldInfo(book), entry = data?.entries?.[num];
        if (entry) {
            const keys = Array.isArray(entry.key) ? entry.key : [];
            if (!keys.length) return replyErr("CHECK_WORLDBOOK_UID_RESULT", requestId, `在「${book}」中找到条目 UID ${uid}，但没有主要关键字`);
            return reply("CHECK_WORLDBOOK_UID_RESULT", requestId, { primaryKeys: keys, worldbook: book, comment: entry.comment || '' });
        }
    }
    replyErr("CHECK_WORLDBOOK_UID_RESULT", requestId, `在角色卡绑定的世界书中未找到 UID 为 ${uid} 的条目`);
}

async function handleSendSms({ requestId, contactName, worldbookUid, userMessage, chatHistory, summarizedCount }) {
    try {
        const ctx = getContext(), userName = name1 || ctx.name1 || '用户';
        let charContent = '', existSum = {}, sc = summarizedCount || 0;

        if (worldbookUid === CHAR_CARD_UID) {
            charContent = getCharInfo().desc;
            const h = getCharSmsHistory(); existSum = h?.summaries || {}; sc = summarizedCount ?? h?.summarizedCount ?? 0;
        } else if (worldbookUid) {
            const e = await findEntry(worldbookUid);
            if (e?.entry) {
                const c = e.entry.content || '', si = c.indexOf('[SMS_HISTORY_START]');
                charContent = si !== -1 ? c.substring(0, si).trim() : c;
                const [s, ed] = [c.indexOf('[SMS_HISTORY_START]'), c.indexOf('[SMS_HISTORY_END]')];
                if (s !== -1 && ed !== -1) { const p = safe(() => JSON.parse(c.substring(s + 19, ed).trim())); const si = p?.find?.(i => typeof i === 'string' && i.startsWith('SMS_summary:')); if (si) existSum = safe(() => JSON.parse(si.substring(12))) || {}; }
            }
        }

        let histText = '';
        const sumKeys = Object.keys(existSum).filter(k => k !== '_count').sort((a, b) => a - b);
        if (sumKeys.length) histText = `[之前的对话摘要] ${sumKeys.map(k => existSum[k]).join('；')}\n\n`;
        if (chatHistory?.length > 1) { const msgs = chatHistory.slice(sc, -1); if (msgs.length) histText += msgs.map(m => `${m.type === 'sent' ? userName : contactName}：${m.text}`).join('\n'); }

        const msgs = buildSmsMessages({ contactName, userName, storyOutline: formatOutlinePrompt(), historyCount: getCommSettings().historyCount || 50, smsHistoryContent: buildSmsHistoryContent(histText), userMessage, characterContent: charContent });
        const parsed = await callLLMJson({ messages: msgs, validate: V.sms });
        reply('SMS_RESULT', requestId, parsed?.reply ? { reply: parsed.reply } : { error: '生成回复失败，请调整重试' });
    } catch (e) { replyErr('SMS_RESULT', requestId, `生成失败: ${e.message}`); }
}

async function handleLoadSmsHistory({ worldbookUid }) {
    if (worldbookUid === CHAR_CARD_UID) { const h = getCharSmsHistory(); return postFrame({ type: 'LOAD_SMS_HISTORY_RESULT', worldbookUid, messages: h?.messages || [], summarizedCount: h?.summarizedCount || 0 }); }
    const store = getOutlineStore(), contact = store?.outlineData?.contacts?.find(c => c.worldbookUid === worldbookUid);
    if (contact?.smsHistory?.messages?.length) return postFrame({ type: 'LOAD_SMS_HISTORY_RESULT', worldbookUid, messages: contact.smsHistory.messages, summarizedCount: contact.smsHistory.summarizedCount || 0 });
    const e = await findEntry(worldbookUid); let msgs = [];
    if (e?.entry) { const c = e.entry.content || '', [s, ed] = [c.indexOf('[SMS_HISTORY_START]'), c.indexOf('[SMS_HISTORY_END]')]; if (s !== -1 && ed !== -1) { const p = safe(() => JSON.parse(c.substring(s + 19, ed).trim())); p?.forEach?.(i => { if (typeof i === 'string' && !i.startsWith('SMS_summary:')) { const idx = i.indexOf(':'); if (idx > 0) msgs.push({ type: i.substring(0, idx) === '{{user}}' ? 'sent' : 'received', text: i.substring(idx + 1) }); } }); } }
    postFrame({ type: 'LOAD_SMS_HISTORY_RESULT', worldbookUid, messages: msgs, summarizedCount: 0 });
}

async function handleSaveSmsHistory({ worldbookUid, messages, contactName, summarizedCount }) {
    if (worldbookUid === CHAR_CARD_UID) { const h = getCharSmsHistory(); if (!h) return; h.messages = Array.isArray(messages) ? messages : []; h.summarizedCount = summarizedCount || 0; if (!h.messages.length) { h.summarizedCount = 0; h.summaries = {}; } saveMetadataDebounced?.(); return; }
    const e = await findEntry(worldbookUid); if (!e) return;
    const { bookName, entry: en, worldData } = e; let c = en.content || ''; const cn = contactName || en.key?.[0] || '角色'; let existSum = '';
    const [s, ed] = [c.indexOf('[SMS_HISTORY_START]'), c.indexOf('[SMS_HISTORY_END]')];
    if (s !== -1 && ed !== -1) { const p = safe(() => JSON.parse(c.substring(s + 19, ed).trim())); existSum = p?.find?.(i => typeof i === 'string' && i.startsWith('SMS_summary:')) || ''; c = c.substring(0, s).trimEnd() + c.substring(ed + 17); }
    if (messages?.length) { const sc = summarizedCount || 0, simp = messages.slice(sc).map(m => `${m.type === 'sent' ? '{{user}}' : cn}:${m.text}`); const arr = existSum ? [existSum, ...simp] : simp; c = c.trimEnd() + `\n\n[SMS_HISTORY_START]\n${JSON.stringify(arr)}\n[SMS_HISTORY_END]`; }
    en.content = c.trim(); await saveWorldInfo(bookName, worldData);
}

async function handleCompressSms({ requestId, worldbookUid, messages, contactName, summarizedCount }) {
    const sc = summarizedCount || 0;
    try {
        const ctx = getContext(), userName = name1 || ctx.name1 || '用户';
        let e = null, existSum = {};

        if (worldbookUid === CHAR_CARD_UID) {
            const h = getCharSmsHistory(); existSum = h?.summaries || {};
            const keep = 4, toEnd = Math.max(sc, (messages?.length || 0) - keep);
            if (toEnd <= sc) return replyErr('COMPRESS_SMS_RESULT', requestId, '没有足够的新消息需要总结');
            const toSum = (messages || []).slice(sc, toEnd); if (toSum.length < 2) return replyErr('COMPRESS_SMS_RESULT', requestId, '需要至少2条消息才能进行总结');
            const convText = toSum.map(m => `${m.type === 'sent' ? userName : contactName}：${m.text}`).join('\n');
            const sumKeys = Object.keys(existSum).filter(k => k !== '_count').sort((a, b) => a - b);
            const existText = sumKeys.map(k => `${k}. ${existSum[k]}`).join('\n');
            const parsed = await callLLMJson({ messages: buildSummaryMessages({ existingSummaryContent: buildExistingSummaryContent(existText), conversationText: convText }), validate: V.sum });
            const sum = parsed?.summary?.trim?.(); if (!sum) return replyErr('COMPRESS_SMS_RESULT', requestId, 'ECHO：总结生成出错，请重试');
            const nextK = Math.max(0, ...Object.keys(existSum).filter(k => k !== '_count').map(k => parseInt(k, 10)).filter(n => !isNaN(n))) + 1;
            existSum[String(nextK)] = sum;
            if (h) { h.messages = Array.isArray(messages) ? messages : (h.messages || []); h.summarizedCount = toEnd; h.summaries = existSum; saveMetadataDebounced?.(); }
            return reply('COMPRESS_SMS_RESULT', requestId, { summary: sum, newSummarizedCount: toEnd });
        }

        e = await findEntry(worldbookUid);
        if (e?.entry) { const c = e.entry.content || '', [s, ed] = [c.indexOf('[SMS_HISTORY_START]'), c.indexOf('[SMS_HISTORY_END]')]; if (s !== -1 && ed !== -1) { const p = safe(() => JSON.parse(c.substring(s + 19, ed).trim())); const si = p?.find?.(i => typeof i === 'string' && i.startsWith('SMS_summary:')); if (si) existSum = safe(() => JSON.parse(si.substring(12))) || {}; } }

        const keep = 4, toEnd = Math.max(sc, messages.length - keep);
        if (toEnd <= sc) return replyErr('COMPRESS_SMS_RESULT', requestId, '没有足够的新消息需要总结');
        const toSum = messages.slice(sc, toEnd); if (toSum.length < 2) return replyErr('COMPRESS_SMS_RESULT', requestId, '需要至少2条消息才能进行总结');
        const convText = toSum.map(m => `${m.type === 'sent' ? userName : contactName}：${m.text}`).join('\n');
        const sumKeys = Object.keys(existSum).filter(k => k !== '_count').sort((a, b) => a - b);
        const existText = sumKeys.map(k => `${k}. ${existSum[k]}`).join('\n');
        const parsed = await callLLMJson({ messages: buildSummaryMessages({ existingSummaryContent: buildExistingSummaryContent(existText), conversationText: convText }), validate: V.sum });
        const sum = parsed?.summary?.trim?.(); if (!sum) return replyErr('COMPRESS_SMS_RESULT', requestId, 'ECHO：总结生成出错，请重试');
        const newSc = toEnd;

        if (e) {
            const { bookName, entry: en, worldData } = e; let c = en.content || ''; const cn = contactName || en.key?.[0] || '角色';
            const [s, ed] = [c.indexOf('[SMS_HISTORY_START]'), c.indexOf('[SMS_HISTORY_END]')]; if (s !== -1 && ed !== -1) c = c.substring(0, s).trimEnd() + c.substring(ed + 17);
            const nextK = Math.max(0, ...Object.keys(existSum).filter(k => k !== '_count').map(k => parseInt(k, 10)).filter(n => !isNaN(n))) + 1;
            existSum[String(nextK)] = sum;
            const rem = messages.slice(toEnd).map(m => `${m.type === 'sent' ? '{{user}}' : cn}:${m.text}`);
            const arr = [`SMS_summary:${JSON.stringify(existSum)}`, ...rem];
            c = c.trimEnd() + `\n\n[SMS_HISTORY_START]\n${JSON.stringify(arr)}\n[SMS_HISTORY_END]`;
            en.content = c.trim(); await saveWorldInfo(bookName, worldData);
        }
        reply('COMPRESS_SMS_RESULT', requestId, { summary: sum, newSummarizedCount: newSc });
    } catch (e) { replyErr('COMPRESS_SMS_RESULT', requestId, `压缩失败: ${e.message}`); }
}

async function handleCheckStrangerWb({ requestId, strangerName }) {
    const r = await searchEntry(strangerName);
    postFrame({ type: 'CHECK_STRANGER_WORLDBOOK_RESULT', requestId, found: !!r, ...(r && { worldbookUid: r.uid, worldbook: r.bookName, entryName: r.entry.comment || r.entry.key?.[0] || strangerName }) });
}

async function handleGenNpc({ requestId, strangerName, strangerInfo }) {
    try {
        const ctx = getContext(), char = ctx.characters?.[ctx.characterId];
        if (!char) return replyErr('GENERATE_NPC_RESULT', requestId, '未找到当前角色卡');
        const primary = char.data?.extensions?.world;
        if (!primary || !world_names?.includes(primary)) return replyErr('GENERATE_NPC_RESULT', requestId, '角色卡未绑定世界书，请先绑定世界书');
        const comm = getCommSettings();
        const msgs = buildNpcGenerationMessages({ strangerName, strangerInfo: strangerInfo || '(无描述)', storyOutline: formatOutlinePrompt(), historyCount: comm.historyCount || 50 });
        const npc = await callLLMJson({ messages: msgs, validate: V.npc });
        if (!npc?.name) return replyErr('GENERATE_NPC_RESULT', requestId, 'NPC 生成失败：无法解析 JSON 数据');
        const wd = await loadWorldInfo(primary); if (!wd) return replyErr('GENERATE_NPC_RESULT', requestId, `无法加载世界书: ${primary}`);
        const { createWorldInfoEntry } = await import("../../../../../world-info.js");
        const newE = createWorldInfoEntry(primary, wd); if (!newE) return replyErr('GENERATE_NPC_RESULT', requestId, '创建世界书条目失败');
        Object.assign(newE, { key: npc.aliases || [npc.name], comment: npc.name, content: formatNpcToWorldbookContent(npc), constant: false, selective: true, disable: false, position: typeof comm.npcPosition === 'number' ? comm.npcPosition : 0, order: typeof comm.npcOrder === 'number' ? comm.npcOrder : 100 });
        await saveWorldInfo(primary, wd, true);
        reply('GENERATE_NPC_RESULT', requestId, { success: true, npcData: npc, worldbookUid: String(newE.uid), worldbook: primary });
    } catch (e) { replyErr('GENERATE_NPC_RESULT', requestId, `生成失败: ${e.message}`); }
}

async function handleExtractStrangers({ requestId, existingContacts, existingStrangers }) {
    try {
        const comm = getCommSettings();
        const msgs = buildExtractStrangersMessages({ storyOutline: formatOutlinePrompt(), historyCount: comm.historyCount || 50, existingContacts: existingContacts || [], existingStrangers: existingStrangers || [] });
        const data = await callLLMJson({ messages: msgs, isArray: true, validate: V.arr });
        if (!Array.isArray(data)) return replyErr('EXTRACT_STRANGERS_RESULT', requestId, '提取失败：无法解析 JSON 数据');
        const strangers = data.filter(s => s?.name).map(s => ({ name: s.name, avatar: s.name[0] || '?', color: '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0'), location: s.location || '未知', info: s.info || '' }));
        reply('EXTRACT_STRANGERS_RESULT', requestId, { success: true, strangers });
    } catch (e) { replyErr('EXTRACT_STRANGERS_RESULT', requestId, `提取失败: ${e.message}`); }
}

async function handleSceneSwitch({ requestId, prevLocationName, prevLocationInfo, targetLocationName, targetLocationType, targetLocationInfo, playerAction }) {
    try {
        const store = getOutlineStore(), comm = getCommSettings(), mode = getGlobalSettings().mode || 'story';
        const msgs = buildSceneSwitchMessages({ prevLocationName: prevLocationName || '未知地点', prevLocationInfo: prevLocationInfo || '', targetLocationName: targetLocationName || '未知地点', targetLocationType: targetLocationType || 'sub', targetLocationInfo: targetLocationInfo || '', storyOutline: formatOutlinePrompt(), stage: store?.stage || 0, currentAtmosphere: getAtmosphere(store), historyCount: comm.historyCount || 50, playerAction: playerAction || '', mode });
        const data = await callLLMJson({ messages: msgs, validate: V.scene });
        if (!data || !V.scene(data)) return replyErr('SCENE_SWITCH_RESULT', requestId, '场景生成失败：无法解析 JSON 数据');
        const delta = data.review?.deviation?.score_delta || 0, old = store?.deviationScore || 0, newS = Math.min(100, Math.max(0, old + delta));
        if (store) { store.deviationScore = newS; if (targetLocationType !== 'home') store.simulationProgress = (store.simulationProgress || 0) + 1; saveMetadataDebounced?.(); }
        const lm = data.local_map || data.scene_setup?.local_map || null;
        reply('SCENE_SWITCH_RESULT', requestId, { success: true, sceneData: { review: data.review, localMap: lm, strangers: [], scoreDelta: delta, newScore: newS } });
        checkAutoSim(requestId);
    } catch (e) { replyErr('SCENE_SWITCH_RESULT', requestId, `场景切换失败: ${e.message}`); }
}

async function handleExecSlash({ command }) {
    try {
        if (typeof command !== 'string') return;
        for (const line of command.split(/\r?\n/).map(l => l.trim()).filter(Boolean)) {
            if (/^\/(send|sendas|as)\b/i.test(line)) await processCommands(line);
        }
    } catch (e) { console.warn('[Story Outline] Slash command failed:', e); }
}

async function handleSendInvite({ requestId, contactName, contactUid, targetLocation, smsHistory }) {
    try {
        const comm = getCommSettings();
        let charC = '';
        if (contactUid) { const es = Object.values(world_info?.entries || world_info || {}); charC = es.find(e => e.uid?.toString() === contactUid.toString())?.content || ''; }
        const msgs = buildInviteMessages({ contactName, userName: name1 || '{{user}}', targetLocation, storyOutline: formatOutlinePrompt(), historyCount: comm.historyCount || 50, smsHistoryContent: buildSmsHistoryContent(smsHistory || ''), characterContent: charC });
        const data = await callLLMJson({ messages: msgs, validate: V.inv });
        if (typeof data?.invite !== 'boolean') return replyErr('SEND_INVITE_RESULT', requestId, '邀请处理失败：无法解析 JSON 数据');
        reply('SEND_INVITE_RESULT', requestId, { success: true, inviteData: { accepted: data.invite, reply: data.reply, targetLocation } });
    } catch (e) { replyErr('SEND_INVITE_RESULT', requestId, `邀请处理失败: ${e.message}`); }
}

async function handleGenLocalMap({ requestId, outdoorDescription }) {
    try {
        const msgs = buildLocalMapGenMessages({ storyOutline: formatOutlinePrompt(), outdoorDescription: outdoorDescription || '', historyCount: getCommSettings().historyCount || 50 });
        const data = await callLLMJson({ messages: msgs, validate: V.lm });
        if (!data?.inside) return replyErr('GENERATE_LOCAL_MAP_RESULT', requestId, '局部地图生成失败：无法解析 JSON 数据');
        reply('GENERATE_LOCAL_MAP_RESULT', requestId, { success: true, localMapData: data.inside });
    } catch (e) { replyErr('GENERATE_LOCAL_MAP_RESULT', requestId, `局部地图生成失败: ${e.message}`); }
}

async function handleRefreshLocalMap({ requestId, locationName, currentLocalMap, outdoorDescription }) {
    try {
        const store = getOutlineStore(), comm = getCommSettings();
        const msgs = buildLocalMapRefreshMessages({ storyOutline: formatOutlinePrompt(), locationName: locationName || store?.playerLocation || '未知地点', locationInfo: currentLocalMap?.description || '', currentLocalMap: currentLocalMap || null, outdoorDescription: outdoorDescription || '', historyCount: comm.historyCount || 50, playerLocation: store?.playerLocation });
        const data = await callLLMJson({ messages: msgs, validate: V.lm });
        if (!data?.inside) return replyErr('REFRESH_LOCAL_MAP_RESULT', requestId, '局部地图刷新失败：无法解析 JSON 数据');
        reply('REFRESH_LOCAL_MAP_RESULT', requestId, { success: true, localMapData: data.inside });
    } catch (e) { replyErr('REFRESH_LOCAL_MAP_RESULT', requestId, `局部地图刷新失败: ${e.message}`); }
}

async function handleGenLocalScene({ requestId, locationName, locationInfo }) {
    try {
        const store = getOutlineStore(), comm = getCommSettings(), mode = getGlobalSettings().mode || 'story';
        const msgs = buildLocalSceneGenMessages({ storyOutline: formatOutlinePrompt(), locationName: locationName || store?.playerLocation || '未知地点', locationInfo: locationInfo || '', stage: store?.stage || 0, currentAtmosphere: getAtmosphere(store), historyCount: comm.historyCount || 50, mode, playerLocation: store?.playerLocation });
        const data = await callLLMJson({ messages: msgs, validate: V.lscene });
        if (!data || !V.lscene(data)) return replyErr('GENERATE_LOCAL_SCENE_RESULT', requestId, '局部剧情生成失败：无法解析 JSON 数据');
        if (store) { store.simulationProgress = (store.simulationProgress || 0) + 1; saveMetadataDebounced?.(); }
        const ssf = data.side_story || null, intro = ssf?.Introduce || ssf?.introduce || '';
        const ss = ssf ? (() => { const { Introduce, introduce: i2, story, ...rest } = ssf; return rest; })() : null;
        reply('GENERATE_LOCAL_SCENE_RESULT', requestId, { success: true, sceneSetup: { sideStory: ss, review: data.review || null }, introduce: intro, loc: locationName });
        checkAutoSim(requestId);
    } catch (e) { replyErr('GENERATE_LOCAL_SCENE_RESULT', requestId, `局部剧情生成失败: ${e.message}`); }
}

async function handleGenWorld({ requestId, playerRequests }) {
    try {
        const comm = getCommSettings(), mode = getGlobalSettings().mode || 'story', store = getOutlineStore();

        // 递归查找函数 - 在任意层级找到目标键
        const deepFind = (obj, key) => {
            if (!obj || typeof obj !== 'object') return null;
            if (obj[key] !== undefined) return obj[key];
            for (const v of Object.values(obj)) {
                const found = deepFind(v, key);
                if (found !== null) return found;
            }
            return null;
        };

        const normalizeStep1Data = (data) => {
            if (!data || typeof data !== 'object') return null;

            // 构建标准化结构，从任意位置提取数据
            const result = { meta: {} };

            // 提取 truth（可能在 meta.truth, data.truth, 或者 data 本身就是 truth）
            result.meta.truth = deepFind(data, 'truth')
                || (data.background && data.driver ? data : null)
                || { background: deepFind(data, 'background'), driver: deepFind(data, 'driver') };

            // 提取 onion_layers
            result.meta.onion_layers = deepFind(data, 'onion_layers') || {};

            // 统一洋葱层级为数组格式
            ['L1_The_Veil', 'L2_The_Distortion', 'L3_The_Law', 'L4_The_Agent', 'L5_The_Axiom'].forEach(k => {
                const v = result.meta.onion_layers[k];
                if (v && !Array.isArray(v) && typeof v === 'object') {
                    result.meta.onion_layers[k] = [v];
                }
            });

            // 提取 atmosphere
            result.meta.atmosphere = deepFind(data, 'atmosphere') || { reasoning: '', current: { environmental: '', npc_attitudes: '' } };

            // 提取 trajectory
            result.meta.trajectory = deepFind(data, 'trajectory') || { reasoning: '', ending: '' };

            // 提取 user_guide
            result.meta.user_guide = deepFind(data, 'user_guide') || { current_state: '', guides: [] };

            return result;
        };

        // 辅助模式
        if (mode === 'assist') {
            const msgs = buildWorldGenStep2Messages({ historyCount: comm.historyCount || 50, playerRequests, mode: 'assist' });
            const wd = await callLLMJson({ messages: msgs, validate: V.wga });
            if (!wd?.maps?.outdoor || !Array.isArray(wd.maps.outdoor.nodes)) return replyErr('GENERATE_WORLD_RESULT', requestId, '生成失败：返回数据缺少地图节点');
            if (store) { Object.assign(store, { stage: 0, deviationScore: 0, simulationProgress: 0, simulationTarget: randRange(3, 7) }); store.outlineData = { ...wd }; saveMetadataDebounced?.(); }
            return reply('GENERATE_WORLD_RESULT', requestId, { success: true, worldData: wd });
        }

        // Step 1
        postFrame({ type: 'GENERATE_WORLD_STATUS', requestId, message: '正在构思世界大纲 (Step 1/2)...' });
        const s1m = buildWorldGenStep1Messages({ historyCount: comm.historyCount || 50, playerRequests });
        const s1d = normalizeStep1Data(await callLLMJson({ messages: s1m, validate: V.wg1 }));

        // 简化验证 - 只要有基本数据就行
        if (!s1d?.meta) {
            return replyErr('GENERATE_WORLD_RESULT', requestId, 'Step 1 失败：无法解析大纲数据，请重试');
        }
        step1Cache = { step1Data: s1d, playerRequests: playerRequests || '' };

        // Step 2
        postFrame({ type: 'GENERATE_WORLD_STATUS', requestId, message: 'Step 1 完成，1 秒后开始构建世界细节 (Step 2/2)...' });
        await new Promise(r => setTimeout(r, 1000));
        postFrame({ type: 'GENERATE_WORLD_STATUS', requestId, message: '正在构建世界细节 (Step 2/2)...' });

        const s2m = buildWorldGenStep2Messages({ historyCount: comm.historyCount || 50, playerRequests, step1Data: s1d });
        const s2d = await callLLMJson({ messages: s2m, validate: V.wg2 });
        if (s2d?.world?.maps && !s2d?.maps) { s2d.maps = s2d.world.maps; delete s2d.world.maps; }
        if (!s2d?.world || !s2d?.maps) return replyErr('GENERATE_WORLD_RESULT', requestId, 'Step 2 失败：无法生成有效的地图');

        const final = { meta: s1d.meta, world: s2d.world, maps: s2d.maps, playerLocation: s2d.playerLocation };
        step1Cache = null;
        if (store) { Object.assign(store, { stage: 0, deviationScore: 0, simulationProgress: 0, simulationTarget: randRange(3, 7) }); store.outlineData = final; saveMetadataDebounced?.(); }
        reply('GENERATE_WORLD_RESULT', requestId, { success: true, worldData: final });
    } catch (e) { replyErr('GENERATE_WORLD_RESULT', requestId, `生成失败: ${e.message}`); }
}

async function handleRetryStep2({ requestId }) {
    try {
        if (!step1Cache?.step1Data?.meta) return replyErr('GENERATE_WORLD_RESULT', requestId, 'Step 2 重试失败：缺少 Step 1 数据，请重新开始生成');
        const comm = getCommSettings(), store = getOutlineStore(), s1d = step1Cache.step1Data, pr = step1Cache.playerRequests || '';

        postFrame({ type: 'GENERATE_WORLD_STATUS', requestId, message: '1 秒后重试构建世界细节 (Step 2/2)...' });
        await new Promise(r => setTimeout(r, 1000));
        postFrame({ type: 'GENERATE_WORLD_STATUS', requestId, message: '正在重试构建世界细节 (Step 2/2)...' });

        const s2m = buildWorldGenStep2Messages({ historyCount: comm.historyCount || 50, playerRequests: pr, step1Data: s1d });
        const s2d = await callLLMJson({ messages: s2m, validate: V.wg2 });
        if (s2d?.world?.maps && !s2d?.maps) { s2d.maps = s2d.world.maps; delete s2d.world.maps; }
        if (!s2d?.world || !s2d?.maps) return replyErr('GENERATE_WORLD_RESULT', requestId, 'Step 2 失败：无法生成有效的地图');

        const final = { meta: s1d.meta, world: s2d.world, maps: s2d.maps, playerLocation: s2d.playerLocation };
        step1Cache = null;
        if (store) { Object.assign(store, { stage: 0, deviationScore: 0, simulationProgress: 0, simulationTarget: randRange(3, 7) }); store.outlineData = final; saveMetadataDebounced?.(); }
        reply('GENERATE_WORLD_RESULT', requestId, { success: true, worldData: final });
    } catch (e) { replyErr('GENERATE_WORLD_RESULT', requestId, `Step 2 重试失败: ${e.message}`); }
}

async function handleSimWorld({ requestId, currentData, isAuto }) {
    try {
        const store = getOutlineStore(), mode = getGlobalSettings().mode || 'story';
        const msgs = buildWorldSimMessages({ mode, currentWorldData: currentData || '{}', historyCount: getCommSettings().historyCount || 50, deviationScore: store?.deviationScore || 0 });
        const data = await callLLMJson({ messages: msgs, validate: V.w });
        if (!data || !V.w(data)) return replyErr('SIMULATE_WORLD_RESULT', requestId, mode === 'assist' ? '世界推演失败：无法解析 JSON 数据（需包含 world 或 maps 字段）' : '世界推演失败：无法解析 JSON 数据');
        const orig = safe(() => JSON.parse(currentData)) || {}, merged = mergeSimData(orig, data);
        if (store) { store.stage = (store.stage || 0) + 1; store.simulationProgress = 0; store.simulationTarget = randRange(3, 7); saveMetadataDebounced?.(); }
        reply('SIMULATE_WORLD_RESULT', requestId, { success: true, simData: merged, isAuto: !!isAuto });
    } catch (e) { replyErr('SIMULATE_WORLD_RESULT', requestId, `推演失败: ${e.message}`); }
}

function handleSaveSettings(d) {
    if (d.globalSettings) saveGlobalSettings(d.globalSettings);
    if (d.commSettings) saveCommSettings(d.commSettings);
    const store = getOutlineStore();
    if (store) {
        ['stage', 'deviationScore', 'simulationProgress', 'simulationTarget', 'playerLocation'].forEach(k => { if (d[k] !== undefined) store[k] = d[k]; });
        if (d.dataChecked) store.dataChecked = d.dataChecked;
        if (d.allData) store.outlineData = d.allData;
        store.updatedAt = Date.now();
        saveMetadataDebounced?.();
    }
    injectOutline();
}

function handleSavePrompts(d) {
    if (!d?.promptConfig) return;
    setPromptConfig?.(d.promptConfig, true);
    postFrame({ type: "PROMPT_CONFIG_UPDATED", promptConfig: getPromptConfigPayload?.() });
}

function handleSaveContacts(d) {
    const store = getOutlineStore(); if (!store) return;
    store.outlineData ||= {};
    if (d.contacts) store.outlineData.contacts = d.contacts;
    if (d.strangers) store.outlineData.strangers = d.strangers;
    store.updatedAt = Date.now();
    saveMetadataDebounced?.();
    injectOutline();
}

function handleSaveAllData(d) {
    const store = getOutlineStore();
    if (store && d.allData) {
        store.outlineData = d.allData;
        if (d.playerLocation !== undefined) store.playerLocation = d.playerLocation;
        store.updatedAt = Date.now();
        saveMetadataDebounced?.();
        injectOutline();
    }
}

function handleSaveCharSmsHistory(d) {
    const h = getCharSmsHistory();
    if (!h) return;
    const sums = d?.summaries ?? d?.history?.summaries;
    if (!sums || typeof sums !== 'object' || Array.isArray(sums)) return;
    h.summaries = sums;
    saveMetadataDebounced?.();
    injectOutline();
}

// 处理器映射
const handlers = {
    FRAME_READY: () => { frameReady = true; flushPending(); loadAndSend(); },
    CLOSE_PANEL: hideOverlay,
    SAVE_MAP_DATA: d => { const s = getOutlineStore(); if (s && d.mapData) { s.mapData = d.mapData; s.updatedAt = Date.now(); saveMetadataDebounced?.(); } },
    GET_SETTINGS: sendSettings,
    SAVE_SETTINGS: handleSaveSettings,
    SAVE_PROMPTS: handleSavePrompts,
    SAVE_CONTACTS: handleSaveContacts,
    SAVE_ALL_DATA: handleSaveAllData,
    FETCH_MODELS: handleFetchModels,
    TEST_CONNECTION: handleTestConn,
    CHECK_WORLDBOOK_UID: handleCheckUid,
    SEND_SMS: handleSendSms,
    LOAD_SMS_HISTORY: handleLoadSmsHistory,
    SAVE_SMS_HISTORY: handleSaveSmsHistory,
    SAVE_CHAR_SMS_HISTORY: handleSaveCharSmsHistory,
    COMPRESS_SMS: handleCompressSms,
    CHECK_STRANGER_WORLDBOOK: handleCheckStrangerWb,
    GENERATE_NPC: handleGenNpc,
    EXTRACT_STRANGERS: handleExtractStrangers,
    SCENE_SWITCH: handleSceneSwitch,
    EXECUTE_SLASH_COMMAND: handleExecSlash,
    SEND_INVITE: handleSendInvite,
    GENERATE_WORLD: handleGenWorld,
    RETRY_WORLD_GEN_STEP2: handleRetryStep2,
    SIMULATE_WORLD: handleSimWorld,
    GENERATE_LOCAL_MAP: handleGenLocalMap,
    REFRESH_LOCAL_MAP: handleRefreshLocalMap,
    GENERATE_LOCAL_SCENE: handleGenLocalScene
};

const handleMsg = ({ data }) => { if (data?.source === "LittleWhiteBox-OutlineFrame") handlers[data.type]?.(data); };

// ==================== 10. UI管理 ====================

/** 指针拖拽 */
function setupDrag(el, { onStart, onMove, onEnd, shouldHandle }) {
    if (!el) return;
    let state = null;
    el.addEventListener('pointerdown', e => { if (shouldHandle && !shouldHandle()) return; e.preventDefault(); e.stopPropagation(); state = onStart(e); state.pointerId = e.pointerId; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', e => state && onMove(e, state));
    const end = () => { if (!state) return; onEnd?.(state); try { el.releasePointerCapture(state.pointerId); } catch { } state = null; };
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => el.addEventListener(ev, end));
}

/** 创建Overlay */
function createOverlay() {
    if (overlayCreated) return;
    overlayCreated = true;
    document.body.appendChild($(buildOverlayHtml(IFRAME_PATH))[0]);
    const overlay = document.getElementById("xiaobaix-story-outline-overlay"), wrap = overlay.querySelector(".xb-so-frame-wrap"), iframe = overlay.querySelector("iframe");
    const setPtr = v => iframe && (iframe.style.pointerEvents = v);

    // 拖拽
    setupDrag(overlay.querySelector(".xb-so-drag-handle"), {
        shouldHandle: () => !isMobile(),
        onStart(e) { const r = wrap.getBoundingClientRect(), ro = overlay.getBoundingClientRect(); wrap.style.left = (r.left - ro.left) + 'px'; wrap.style.top = (r.top - ro.top) + 'px'; wrap.style.transform = ''; setPtr('none'); return { sx: e.clientX, sy: e.clientY, sl: parseFloat(wrap.style.left), st: parseFloat(wrap.style.top) }; },
        onMove(e, s) { wrap.style.left = Math.max(0, Math.min(overlay.clientWidth - wrap.offsetWidth, s.sl + e.clientX - s.sx)) + 'px'; wrap.style.top = Math.max(0, Math.min(overlay.clientHeight - wrap.offsetHeight, s.st + e.clientY - s.sy)) + 'px'; },
        onEnd: () => setPtr('')
    });

    // 缩放
    setupDrag(overlay.querySelector(".xb-so-resize-handle"), {
        shouldHandle: () => !isMobile(),
        onStart(e) { const r = wrap.getBoundingClientRect(), ro = overlay.getBoundingClientRect(); wrap.style.left = (r.left - ro.left) + 'px'; wrap.style.top = (r.top - ro.top) + 'px'; wrap.style.transform = ''; setPtr('none'); return { sx: e.clientX, sy: e.clientY, sw: wrap.offsetWidth, sh: wrap.offsetHeight, ratio: wrap.offsetWidth / wrap.offsetHeight }; },
        onMove(e, s) { const dx = e.clientX - s.sx, dy = e.clientY - s.sy, delta = Math.abs(dx) > Math.abs(dy) ? dx : dy * s.ratio; let w = Math.max(400, Math.min(window.innerWidth * 0.95, s.sw + delta)), h = w / s.ratio; if (h > window.innerHeight * 0.9) { h = window.innerHeight * 0.9; w = h * s.ratio; } if (h < 300) { h = 300; w = h * s.ratio; } wrap.style.width = w + 'px'; wrap.style.height = h + 'px'; },
        onEnd: () => setPtr('')
    });

    // 移动端
    setupDrag(overlay.querySelector(".xb-so-resize-mobile"), {
        shouldHandle: () => isMobile(),
        onStart(e) { setPtr('none'); return { sy: e.clientY, sh: wrap.offsetHeight }; },
        onMove(e, s) { wrap.style.height = Math.max(200, Math.min(window.innerHeight * 0.9, s.sh + e.clientY - s.sy)) + 'px'; },
        onEnd: () => setPtr('')
    });

    window.addEventListener("message", handleMsg);
}

function updateLayout() {
    const wrap = document.querySelector(".xb-so-frame-wrap"); if (!wrap) return;
    const drag = document.querySelector(".xb-so-drag-handle"), resize = document.querySelector(".xb-so-resize-handle"), mobile = document.querySelector(".xb-so-resize-mobile");
    if (isMobile()) { if (drag) drag.style.display = 'none'; if (resize) resize.style.display = 'none'; if (mobile) mobile.style.display = 'flex'; wrap.style.cssText = MOBILE_LAYOUT_STYLE; }
    else { if (drag) drag.style.display = 'block'; if (resize) resize.style.display = 'block'; if (mobile) mobile.style.display = 'none'; wrap.style.cssText = DESKTOP_LAYOUT_STYLE; }
}

function showOverlay() { if (!overlayCreated) createOverlay(); frameReady = false; const f = document.getElementById("xiaobaix-story-outline-iframe"); if (f) f.src = IFRAME_PATH; updateLayout(); $("#xiaobaix-story-outline-overlay").show(); }
function hideOverlay() { $("#xiaobaix-story-outline-overlay").hide(); }

$(window).on('resize', () => { if ($("#xiaobaix-story-outline-overlay").is(':visible')) updateLayout(); });

// ==================== 11. 事件与初始化 ====================

let eventsRegistered = false;

function addBtnToMsg(mesId) {
    if (!getSettings().storyOutline?.enabled) return;
    const msg = document.querySelector(`#chat .mes[mesid="${mesId}"]`);
    if (!msg || msg.querySelector('.xiaobaix-story-outline-btn')) return;
    const btn = document.createElement('div');
    btn.className = 'mes_btn xiaobaix-story-outline-btn';
    btn.title = '剧情地图';
    btn.dataset.mesid = mesId;
    btn.innerHTML = '<i class="fa-regular fa-map"></i>';
    btn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); if (!getSettings().storyOutline?.enabled) return; currentMesId = Number(mesId); showOverlay(); loadAndSend(); });
    if (window.registerButtonToSubContainer?.(mesId, btn)) return;
    msg.querySelector('.flex-container.flex1.alignitemscenter')?.appendChild(btn);
}

function initBtns() {
    if (!getSettings().storyOutline?.enabled) return;
    $("#chat .mes").each((_, el) => { const id = el.getAttribute("mesid"); if (id != null) addBtnToMsg(id); });
}

function registerEvents() {
    if (eventsRegistered) return;
    eventsRegistered = true;

    initBtns();

    events.on(event_types.CHAT_CHANGED, () => { setTimeout(initBtns, 80); setTimeout(injectOutline, 100); });
    events.on(event_types.GENERATION_STARTED, injectOutline);

    const handler = d => setTimeout(() => {
        const id = d?.element ? $(d.element).attr("mesid") : d?.messageId;
        id == null ? initBtns() : addBtnToMsg(id);
    }, 50);

    events.onMany([
        event_types.USER_MESSAGE_RENDERED,
        event_types.CHARACTER_MESSAGE_RENDERED,
        event_types.MESSAGE_RECEIVED,
        event_types.MESSAGE_UPDATED,
        event_types.MESSAGE_SWIPED,
        event_types.MESSAGE_EDITED
    ], handler);

    setupSTEvents();
}

function cleanup() {
    events.cleanup();
    eventsRegistered = false;
    $(".xiaobaix-story-outline-btn").remove();
    hideOverlay();
    overlayCreated = false; frameReady = false; pendingMsgs = [];
    window.removeEventListener("message", handleMsg);
    document.getElementById("xiaobaix-story-outline-overlay")?.remove();
    removePrompt();
    if (presetCleanup) { presetCleanup(); presetCleanup = null; }
}

// ==================== Toggle 监听（始终注册）====================

$(document).on("xiaobaix:storyOutline:toggle", (_e, enabled) => {
    if (enabled) {
        registerEvents();
        initBtns();
        injectOutline();
    } else {
        cleanup();
    }
});

document.addEventListener('xiaobaixEnabledChanged', e => {
    if (!e?.detail?.enabled) {
        cleanup();
    } else if (getSettings().storyOutline?.enabled) {
        registerEvents();
        initBtns();
        injectOutline();
    }
});

// ==================== 初始化 ====================

jQuery(() => {
    if (!getSettings().storyOutline?.enabled) return;
    registerEvents();
    setTimeout(injectOutline, 200);
    window.registerModuleCleanup?.('storyOutline', cleanup);
});

export { cleanup };
