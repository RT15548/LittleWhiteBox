/**
 * @file modules/variables/varevent-editor.js
 * @description 条件规则编辑器与 varevent 运行时（常驻模块）
 */

import { getContext } from "../../../../../extensions.js";
import { getLocalVariable, setLocalVariable } from "../../../../../variables.js";
import { createModuleEvents } from "../../core/event-manager.js";
import { executeSlashCommand } from '../../core/slash-command.js';
import { replaceXbGetVarInString, replaceXbGetVarYamlInString, replaceXbGetVarYamlIdxInString } from "./var-commands.js";
import { observeBackgroundTask } from '../../shared/common/async-errors.js';
import { conditionGroups, executeCondition, joinConditions, macroExpression, parseCondition } from './varevent/condition.js';
import { createEventDocument, findVareventBlocks, newEvent, newEventGroup, parseVareventEvents, serializeEventDocument } from './varevent/document.js';
import { createEventRun, removeLegacyEventQueue } from './varevent/run.js';
import { VAREVENT_COPY, eventErrorText } from './varevent/copy.js';


const MODULE_ID = 'vareventEditor';
const LWB_EXT_ID = 'LittleWhiteBox';
const LWB_VAREVENT_PROMPT_KEY = 'LWB_varevent_display';
const EDITOR_STYLES_ID = 'lwb-varevent-editor-styles';

const OP_ALIASES = {
    set: ['set', '记下', '記下', '记录', '記錄', '录入', '錄入', 'record'],
    push: ['push', '添入', '增录', '增錄', '追加', 'append'],
    bump: ['bump', '推移', '变更', '變更', '调整', '調整', 'adjust'],
    del: ['del', '遗忘', '遺忘', '抹去', '删除', '刪除', 'erase'],
};
const OP_MAP = {};
for (const [k, arr] of Object.entries(OP_ALIASES)) for (const a of arr) OP_MAP[a.toLowerCase()] = k;
const reEscape = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ALL_OP_WORDS = Object.values(OP_ALIASES).flat();
const OP_WORDS_PATTERN = ALL_OP_WORDS.map(reEscape).sort((a, b) => b.length - a.length).join('|');
const TOP_OP_RE = new RegExp(`^(${OP_WORDS_PATTERN})\\s*:\\s*$`, 'i');

let events = null;
let initialized = false;
let latePromptDispose = null;
const editorTimers = new Set();
const editorDisposers = new Set();

function stripYamlInlineComment(s) {
    const text = String(s ?? ''); if (!text) return '';
    let inSingle = false, inDouble = false, escaped = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (inSingle) { if (ch === "'") { if (text[i + 1] === "'") { i++; continue; } inSingle = false; } continue; }
        if (inDouble) { if (escaped) { escaped = false; continue; } if (ch === '\\') { escaped = true; continue; } if (ch === '"') inDouble = false; continue; }
        if (ch === "'") { inSingle = true; continue; }
        if (ch === '"') { inDouble = true; continue; }
        if (ch === '#') { const prev = i > 0 ? text[i - 1] : ''; if (i === 0 || /\s/.test(prev)) return text.slice(0, i); }
    }
    return text;
}

function readCharExtBumpAliases() {
    try {
        const ctx = getContext(); const id = ctx?.characterId ?? ctx?.this_chid; if (id == null) return {};
        const char = ctx?.getCharacter?.(id) ?? (Array.isArray(ctx?.characters) ? ctx.characters[id] : null);
        const bump = char?.data?.extensions?.[LWB_EXT_ID]?.variablesCore?.bumpAliases;
        if (bump && typeof bump === 'object') return bump;
        const legacy = char?.extensions?.[LWB_EXT_ID]?.variablesCore?.bumpAliases;
        if (legacy && typeof legacy === 'object') { observeBackgroundTask(writeCharExtBumpAliases(legacy), { source: import.meta.url, operation: "readCharExtBumpAliases" }); return legacy; }
        return {};
    } catch { return {}; }
}

async function writeCharExtBumpAliases(newStore) {
    try {
        const ctx = getContext(); const id = ctx?.characterId ?? ctx?.this_chid; if (id == null) return;
        if (typeof ctx?.writeExtensionField === 'function') {
            await ctx.writeExtensionField(id, LWB_EXT_ID, { variablesCore: { bumpAliases: structuredClone(newStore || {}) } });
            const char = ctx?.getCharacter?.(id) ?? (Array.isArray(ctx?.characters) ? ctx.characters[id] : null);
            if (char) {
                char.data = char.data && typeof char.data === 'object' ? char.data : {};
                char.data.extensions = char.data.extensions && typeof char.data.extensions === 'object' ? char.data.extensions : {};
                const ns = (char.data.extensions[LWB_EXT_ID] ||= {});
                ns.variablesCore = ns.variablesCore && typeof ns.variablesCore === 'object' ? ns.variablesCore : {};
                ns.variablesCore.bumpAliases = structuredClone(newStore || {});
            }
            typeof ctx?.saveCharacter === 'function' ? await ctx.saveCharacter() : ctx?.saveCharacterDebounced?.();
            return;
        }
        const char = ctx?.getCharacter?.(id) ?? (Array.isArray(ctx?.characters) ? ctx.characters[id] : null);
        if (char) {
            char.data = char.data && typeof char.data === 'object' ? char.data : {};
            char.data.extensions = char.data.extensions && typeof char.data.extensions === 'object' ? char.data.extensions : {};
            const ns = (char.data.extensions[LWB_EXT_ID] ||= {});
            ns.variablesCore = ns.variablesCore && typeof ns.variablesCore === 'object' ? ns.variablesCore : {};
            ns.variablesCore.bumpAliases = structuredClone(newStore || {});
        }
        typeof ctx?.saveCharacter === 'function' ? await ctx.saveCharacter() : ctx?.saveCharacterDebounced?.();
    } catch (caughtError) { console.warn({ source: import.meta.url, operation: "writeCharExtBumpAliases" }, caughtError); }
}

export function getBumpAliasStore() { return readCharExtBumpAliases(); }
export async function setBumpAliasStore(newStore) { await writeCharExtBumpAliases(newStore); }
export async function clearBumpAliasStore() { await writeCharExtBumpAliases({}); }

function getBumpAliasMap() { try { return getBumpAliasStore(); } catch { return {}; } }

function matchAlias(varOrKey, rhs) {
    const map = getBumpAliasMap();
    for (const scope of [map._global || {}, map[varOrKey] || {}]) {
        for (const [k, v] of Object.entries(scope)) {
            if (k.startsWith('/') && k.lastIndexOf('/') > 0) {
                const last = k.lastIndexOf('/');
                try { if (new RegExp(k.slice(1, last), k.slice(last + 1)).test(rhs)) return Number(v); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "matchAlias" }, caughtError); }
            } else if (rhs === k) return Number(v);
        }
    }
    return null;
}

export function preprocessBumpAliases(innerText) {
    const lines = String(innerText || '').split(/\r?\n/), out = [];
    let inBump = false; const indentOf = (s) => s.length - s.trimStart().length;
    const stack = []; let currentVarRoot = '';
    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i], t = raw.trim();
        if (!t) { out.push(raw); continue; }
        const ind = indentOf(raw), mTop = TOP_OP_RE.exec(t);
        if (mTop && ind === 0) { const opKey = OP_MAP[mTop[1].toLowerCase()] || ''; inBump = opKey === 'bump'; stack.length = 0; currentVarRoot = ''; out.push(raw); continue; }
        if (!inBump) { out.push(raw); continue; }
        while (stack.length && stack[stack.length - 1].indent >= ind) stack.pop();
        const mKV = t.match(/^([^:]+):\s*(.*)$/);
        if (mKV) {
            const key = mKV[1].trim(), val = String(stripYamlInlineComment(mKV[2])).trim();
            const parentPath = stack.length ? stack[stack.length - 1].path : '', curPath = parentPath ? `${parentPath}.${key}` : key;
            if (val === '') { stack.push({ indent: ind, path: curPath }); if (!parentPath) currentVarRoot = key; out.push(raw); continue; }
            let rhs = val.replace(/^["']|["']$/g, '');
            const num = matchAlias(key, rhs) ?? matchAlias(currentVarRoot, rhs) ?? matchAlias('', rhs);
            out.push(num !== null && Number.isFinite(num) ? raw.replace(/:\s*.*$/, `: ${num}`) : raw); continue;
        }
        const mArr = t.match(/^-\s*(.+)$/);
        if (mArr) {
            let rhs = String(stripYamlInlineComment(mArr[1])).trim().replace(/^["']|["']$/g, '');
            const leafKey = stack.length ? stack[stack.length - 1].path.split('.').pop() : '';
            const num = matchAlias(leafKey || currentVarRoot, rhs) ?? matchAlias(currentVarRoot, rhs) ?? matchAlias('', rhs);
            out.push(num !== null && Number.isFinite(num) ? raw.replace(/-\s*.*$/, `- ${num}`) : raw); continue;
        }
        out.push(raw);
    }
    return out.join('\n');
}

export { parseVareventEvents };

function reportEventError(kind, event, error) {
    console.warn({ source: import.meta.url, eventId: event?.id, kind }, error);
    if (typeof window !== 'undefined') window.toastr?.warning?.(eventErrorText(kind, event, error));
}

export function evaluateCondition(expr, event = {}) {
    try { return executeCondition(parseCondition(expr), getContext, getLocalVariable); }
    catch (error) { reportEventError(VAREVENT_COPY.conditionError, event, error); return false; }
}

function selectEvent(innerText) {
    let candidates;
    try { candidates = parseVareventEvents(innerText); }
    catch (error) { reportEventError(VAREVENT_COPY.conditionError, {}, error); return null; }
    for (const event of candidates.reverse()) {
        if (!String(event.display ?? '').trim() && !String(event.js ?? '').trim()) continue;
        if (!String(event.condition ?? '').trim() || evaluateCondition(event.condition, event)) return event;
    }
    return null;
}

export async function runJS(code, assertCurrent = () => {}, signal) {
    assertCurrent();
    const ctx = getContext();
    const guard = () => {
        assertCurrent();
        if (getContext()?.chatId !== ctx?.chatId || getContext()?.chat !== ctx?.chat) {
            throw new DOMException(VAREVENT_COPY.invalidRun, 'AbortError');
        }
    };
    const getVar = key => { guard(); return getLocalVariable(key); };
    const setVar = (key, value) => { guard(); return setLocalVariable(key, value); };
    const hostCalls = [];
    const executeHostCommand = async command => {
        guard();
        if (!command) return;
        let result;
        if (!signal && typeof window !== 'undefined' && typeof window.STscript === 'function') result = await window.STscript(command);
        else result = await executeSlashCommand(command, { signal, rawResult: true });
        guard();
        return result;
    };
    const STscriptProxy = command => {
        const call = executeHostCommand(command);
        // Existing action-builder snippets do not await STscript. Own their
        // completion without changing the user's script or leaving rejections loose.
        hostCalls.push(call.then(() => null, error => error));
        return call;
    };
    // eslint-disable-next-line no-new-func -- Existing user-authored event scripts run in the host page.
    const fn = new Function('ctx', 'getVar', 'setVar', 'console', 'STscript', `return (async()=>{ ${code}\n })();`);
    let result, failure;
    try { result = await fn(ctx, getVar, setVar, console, STscriptProxy); }
    catch (error) { failure = error; }
    while (hostCalls.length) {
        const errors = await Promise.all(hostCalls.splice(0));
        failure ||= errors.find(Boolean);
    }
    if (failure) throw failure;
    return result;
}

export async function runST(code) {
    if (!code) return;
    const ctx = getContext();
    if (code[0] !== '/') code = '/' + code;
    return await ctx.executeSlashCommands(ctx.substituteParams ? ctx.substituteParams(code) : code, true);
}

const eventRun = createEventRun({
    getContext, execute: runJS,
    report: (event, error) => reportEventError(VAREVENT_COPY.scriptError, event, error),
});

async function expandEvents(text, dryRun, executeJs, enqueue, source) {
    const blocks = findVareventBlocks(text);
    let output = '', cursor = 0;
    for (const block of blocks) {
        const event = selectEvent(block.inner);
        output += text.slice(cursor, block.start) + String(event?.display ?? '').replace(/^\n+|\n+$/g, '');
        cursor = block.end;
        if (!dryRun && event) {
            if (enqueue) enqueue(event, source);
            if (executeJs && event.js?.trim()) await runJS(event.js);
        }
    }
    return output + text.slice(cursor);
}

export async function replaceVareventInString(text, dryRun = false, executeJs = false) {
    return await expandEvents(String(text ?? ''), dryRun, executeJs, false);
}

export function enqueuePendingVareventBlock(innerText, sourceInfo) {
    eventRun.enqueue(selectEvent(innerText), sourceInfo);
}

export function drainPendingVareventBlocks() {
    eventRun.cancel();
    return [];
}

export function executeQueuedVareventJsAfterTurn() {
    return eventRun.flush();
}

function installWIHiddenTagStripper() {
    const ctx = getContext(), ext = ctx?.extensionSettings; if (!ext) return;
    ext.regex = Array.isArray(ext.regex) ? ext.regex : [];
    ext.regex = ext.regex.filter(r => !['lwb-varevent-stripper', 'lwb-varevent-replacer'].includes(r?.id) && !['LWB_VarEventStripper', 'LWB_VarEventReplacer'].includes(r?.scriptName));
    ctx?.saveSettingsDebounced?.();
}

async function replacePromptVariables(text, dryRun, sourceInfo, finalRequest = false, enqueue) {
    // Expansion is not enrollment. Request-ready hooks capture selections on the
    // actual payload; only GENERATE_AFTER_DATA can attach them to a reply run.
    if (!dryRun && finalRequest) text = await expandEvents(text, false, false, enqueue, sourceInfo);
    else if (!dryRun) {
        // Preserve script source until selection; prompt macros inside scripts must
        // not be captured early or rewritten by an unrelated assembly request.
        let output = '', cursor = 0;
        for (const block of findVareventBlocks(text)) {
            output += replaceReadMacros(text.slice(cursor, block.start)) + block.raw;
            cursor = block.end;
        }
        return output + replaceReadMacros(text.slice(cursor));
    }
    return replaceReadMacros(text);
}

function replaceReadMacros(text) {
    text = replaceXbGetVarInString(text);
    text = replaceXbGetVarYamlInString(text);
    return replaceXbGetVarYamlIdxInString(text);
}

async function replacePromptMessages(chat, replace) {
    for (const message of chat) {
        for (const key of ['content', 'mes']) {
            if (typeof message?.[key] === 'string') message[key] = await replace(message[key]);
        }
        if (Array.isArray(message?.content)) for (const part of message.content) {
            if (part?.type === 'text' && typeof part.text === 'string') part.text = await replace(part.text);
        }
    }
}

function registerWIEventSystem() {
    const { eventSource, event_types: evtTypes } = getContext() || {};
    const selections = new WeakMap();
    const capture = owner => {
        const selected = selections.get(owner) || [];
        selections.set(owner, selected);
        return (event, source) => selected.push({ event, source });
    };
    if (evtTypes?.CHAT_COMPLETION_PROMPT_READY) {
        const lateChatReplacementHandler = async (data) => {
            try {
                if (!initialized) return;
                const chat = data?.chat;
                if (!Array.isArray(chat)) return;
                const remember = data.dryRun ? undefined : capture(chat);
                await replacePromptMessages(chat, text => replacePromptVariables(text, data.dryRun, 'chat.content', true, remember));
            } catch (caughtError) { console.warn({ source: import.meta.url, operation: "lateChatReplacementHandler" }, caughtError); }
        };
        try {
            if (eventSource && typeof eventSource.makeLast === 'function') {
                eventSource.makeLast(evtTypes.CHAT_COMPLETION_PROMPT_READY, lateChatReplacementHandler);
                latePromptDispose = () => eventSource.removeListener(evtTypes.CHAT_COMPLETION_PROMPT_READY, lateChatReplacementHandler);
            } else {
                events?.on(evtTypes.CHAT_COMPLETION_PROMPT_READY, lateChatReplacementHandler);
            }
        } catch {
            events?.on(evtTypes.CHAT_COMPLETION_PROMPT_READY, lateChatReplacementHandler);
        }
    }
    if (evtTypes?.GENERATE_AFTER_COMBINE_PROMPTS) {
        events?.on(evtTypes.GENERATE_AFTER_COMBINE_PROMPTS, async (data) => {
            try {
                if (typeof data?.prompt === 'string') {
                    data.prompt = await replacePromptVariables(data.prompt, data.dryRun, 'prompt');
                }
            } catch (caughtError) { console.warn({ source: import.meta.url, operation: "registerWIEventSystem" }, caughtError); }
        });
    }
    const on = (key, handler) => { if (evtTypes?.[key]) events.on(evtTypes[key], handler); };
    on('TEXT_COMPLETION_SETTINGS_READY', async data => {
        if (typeof data?.prompt === 'string') {
            data.prompt = await replacePromptVariables(data.prompt, false, 'text.prompt', true, capture(data));
        }
    });
    on('GENERATE_AFTER_DATA', async (data, dryRun) => {
        if (!data || dryRun) return;
        const enqueue = eventRun.prepare();
        const owner = Array.isArray(data.prompt) ? data.prompt : data;
        for (const { event, source } of selections.get(owner) || []) enqueue?.(event, source);
        selections.delete(owner);
        const replace = text => replacePromptVariables(text, false, 'generation.prompt', true, enqueue);
        if (typeof data.prompt === 'string') data.prompt = await replace(data.prompt);
        else if (Array.isArray(data.prompt)) await replacePromptMessages(data.prompt, replace);
        if (typeof data.input === 'string') data.input = await replace(data.input);
    });
    on('GENERATION_STARTED', (type, options, dryRun) => eventRun.begin(type, options, dryRun));
    on('MESSAGE_RECEIVED', (id, type) => eventRun.received(id, type));
    on('GENERATION_ENDED', () => eventRun.ended());
    on('GENERATION_STOPPED', () => eventRun.cancel());
    for (const key of ['MESSAGE_SWIPED', 'MESSAGE_SWIPE_DELETED', 'MESSAGE_DELETED', 'MESSAGE_EDITED']) {
        on(key, id => eventRun.changed(key, id));
    }
    on('CHAT_CHANGED', () => {
        eventRun.cancel();
        removeLegacyEventQueue(getContext());
    });
}

const LWBVE = { installed: false, obs: null };

function injectEditorStyles() {
    if (document.getElementById(EDITOR_STYLES_ID)) return;
    const style = document.createElement('style'); style.id = EDITOR_STYLES_ID;
    style.textContent = `.lwb-ve-overlay{position:fixed;inset:0;background:none;z-index:9999;display:flex;align-items:center;justify-content:center;pointer-events:none}.lwb-ve-modal{width:650px;background:var(--SmartThemeBlurTintColor);border:2px solid var(--SmartThemeBorderColor);border-radius:10px;box-shadow:0 8px 16px var(--SmartThemeShadowColor);pointer-events:auto}.lwb-ve-header{display:flex;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--SmartThemeBorderColor);font-weight:600;cursor:move}.lwb-ve-tabs{display:flex;gap:6px;padding:8px 14px;border-bottom:1px solid var(--SmartThemeBorderColor)}.lwb-ve-tab{cursor:pointer;border:1px solid var(--SmartThemeBorderColor);background:var(--SmartThemeBlurTintColor);padding:4px 8px;border-radius:6px;opacity:.8}.lwb-ve-tab.active{opacity:1;border-color:var(--crimson70a)}.lwb-ve-page{display:none}.lwb-ve-page.active{display:block}.lwb-ve-body{height:60vh;overflow:auto;padding:10px}.lwb-ve-footer{display:flex;gap:8px;justify-content:flex-end;padding:12px 14px;border-top:1px solid var(--SmartThemeBorderColor)}.lwb-ve-section{margin:12px 0}.lwb-ve-label{font-size:13px;opacity:.7;margin:6px 0}.lwb-ve-row{gap:8px;align-items:center;margin:4px 0;padding-bottom:10px;border-bottom:1px dashed var(--SmartThemeBorderColor);display:flex;flex-wrap:wrap}.lwb-ve-input,.lwb-ve-text{box-sizing:border-box;background:var(--SmartThemeShadowColor);color:inherit;border:1px solid var(--SmartThemeUserMesBlurTintColor);border-radius:6px;padding:6px 8px}.lwb-ve-text{min-height:64px;resize:vertical;width:100%}.lwb-ve-input{width:260px}.lwb-ve-mini{width:70px!important;margin:0}.lwb-ve-op,.lwb-ve-ctype option{text-align:center}.lwb-ve-lop{width:70px!important;text-align:center}.lwb-ve-btn{cursor:pointer;border:1px solid var(--SmartThemeBorderColor);background:var(--SmartThemeBlurTintColor);padding:6px 10px;border-radius:6px}.lwb-ve-btn.primary{background:var(--crimson70a)}.lwb-ve-event{border:1px dashed var(--SmartThemeBorderColor);border-radius:8px;padding:10px;margin:10px 0}.lwb-ve-event-title{font-weight:600;display:flex;align-items:center;gap:8px}.lwb-ve-close{cursor:pointer}.lwb-var-editor-button.right_menu_button{display:inline-flex;align-items:center;margin-left:10px;transform:scale(1.5)}.lwb-ve-vals,.lwb-ve-varrhs{align-items:center;display:inline-flex;gap:6px}.lwb-ve-delval{transform:scale(.5)}.lwb-act-type{width:200px!important}.lwb-ve-condgroups{display:flex;flex-direction:column;gap:10px}.lwb-ve-condgroup{border:1px solid var(--SmartThemeBorderColor);border-radius:8px;padding:8px}.lwb-ve-group-title{display:flex;align-items:center;gap:8px;margin-bottom:6px}.lwb-ve-group-name{font-weight:600}.lwb-ve-group-lop{width:70px!important;text-align:center}.lwb-ve-add-group{margin-top:6px}@media (max-width:999px){.lwb-ve-overlay{position:absolute;inset:0;align-items:flex-start}.lwb-ve-modal{width:100%;max-height:100%;margin:0;border-radius:10px 10px 0 0}}`;
    document.head.appendChild(style);
}

const U = {
    qa: (root, sel) => Array.from((root || document).querySelectorAll(sel)),
    // eslint-disable-next-line no-unsanitized/property -- Template-only UI markup.
    el: (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; },
    setActive(listLike, idx) { (Array.isArray(listLike) ? listLike : U.qa(document, listLike)).forEach((el, i) => el.classList.toggle('active', i === idx)); },
    toast: { ok: (m) => window?.toastr?.success?.(m), warn: (m) => window?.toastr?.warning?.(m), err: (m) => window?.toastr?.error?.(m) },
    drag(modal, overlay, header) {
        try { modal.style.position = 'absolute'; modal.style.left = '50%'; modal.style.top = '50%'; modal.style.transform = 'translate(-50%,-50%)'; } catch (caughtError) { console.warn({ source: import.meta.url, operation: "drag" }, caughtError); }
        let dragging = false, sx = 0, sy = 0, sl = 0, st = 0;
        const onDown = (e) => { if (!(e instanceof PointerEvent) || e.button !== 0) return; dragging = true; const r = modal.getBoundingClientRect(), ro = overlay.getBoundingClientRect(); modal.style.left = (r.left - ro.left) + 'px'; modal.style.top = (r.top - ro.top) + 'px'; modal.style.transform = ''; sx = e.clientX; sy = e.clientY; sl = parseFloat(modal.style.left) || 0; st = parseFloat(modal.style.top) || 0; window.addEventListener('pointermove', onMove, { passive: true }); window.addEventListener('pointerup', onUp, { once: true }); e.preventDefault(); };
        const onMove = (e) => { if (!dragging) return; let nl = sl + e.clientX - sx, nt = st + e.clientY - sy; const maxL = (overlay.clientWidth || overlay.getBoundingClientRect().width) - modal.offsetWidth, maxT = (overlay.clientHeight || overlay.getBoundingClientRect().height) - modal.offsetHeight; modal.style.left = Math.max(0, Math.min(maxL, nl)) + 'px'; modal.style.top = Math.max(0, Math.min(maxT, nt)) + 'px'; };
        const onUp = () => { dragging = false; window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
        header.addEventListener('pointerdown', onDown);
        const dispose = () => { onUp(); header.removeEventListener('pointerdown', onDown); observer.disconnect(); editorDisposers.delete(dispose); };
        const observer = new MutationObserver(() => { if (!overlay.isConnected) dispose(); });
        observer.observe(document.body, { childList: true });
        editorDisposers.add(dispose);
    },
    mini(innerHTML, title = '编辑器') {
        const wrap = U.el('div', 'lwb-ve-overlay'), modal = U.el('div', 'lwb-ve-modal'); modal.style.maxWidth = '720px'; modal.style.pointerEvents = 'auto'; modal.style.zIndex = '10010'; wrap.appendChild(modal);
        const header = U.el('div', 'lwb-ve-header', `<span>${title}</span><span class="lwb-ve-close">✕</span>`), body = U.el('div', 'lwb-ve-body', innerHTML), footer = U.el('div', 'lwb-ve-footer');
        const btnCancel = U.el('button', 'lwb-ve-btn', '取消'), btnOk = U.el('button', 'lwb-ve-btn primary', '生成');
        footer.append(btnCancel, btnOk); modal.append(header, body, footer); U.drag(modal, wrap, header);
        btnCancel.addEventListener('click', () => wrap.remove()); header.querySelector('.lwb-ve-close')?.addEventListener('click', () => wrap.remove());
        document.body.appendChild(wrap); return { wrap, modal, body, btnOk, btnCancel };
    },
};

const P = {
    buildVar: name => macroExpression('var', name),
    buildVal: value => macroExpression('val', value),
};

function buildSTscriptFromActions(actionList) {
    const parts = [], jsEsc = (s) => String(s ?? '').replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${'), plain = (s) => String(s ?? '').trim();
    for (const a of actionList || []) {
        switch (a.type) {
            case 'var.set': parts.push(`/setvar key=${plain(a.key)} ${plain(a.value)}`); break;
            case 'var.bump': parts.push(`/addvar key=${plain(a.key)} ${Number(a.delta) || 0}`); break;
            case 'var.del': parts.push(`/flushvar ${plain(a.key)}`); break;
            case 'wi.enableUID': parts.push(`/setentryfield file=${plain(a.file)} uid=${plain(a.uid)} field=disable 0`); break;
            case 'wi.disableUID': parts.push(`/setentryfield file=${plain(a.file)} uid=${plain(a.uid)} field=disable 1`); break;
            case 'wi.setContentUID': parts.push(`/setentryfield file=${plain(a.file)} uid=${plain(a.uid)} field=content ${plain(a.content)}`); break;
            case 'wi.createContent': parts.push(plain(a.content) ? `/createentry file=${plain(a.file)} key=${plain(a.key)} ${plain(a.content)}` : `/createentry file=${plain(a.file)} key=${plain(a.key)}`); parts.push(`/setentryfield file=${plain(a.file)} uid={{pipe}} field=constant 1`); break;
            case 'qr.run': parts.push(`/run ${a.preset ? `${plain(a.preset)}.` : ''}${plain(a.label)}`); break;
            case 'custom.st': if (a.script) parts.push(...a.script.split('\n').map(s => s.trim()).filter(Boolean).map(c => c.startsWith('/') ? c : '/' + c)); break;
        }
    }
    return 'STscript(`' + jsEsc(parts.join(' | ')) + '`)';
}

const UI = {
    getEventBlockHTML() {
        return `<div class="lwb-ve-event-title">事件 #<span class="lwb-ve-idx"></span><span class="lwb-ve-close" title="删除事件" style="margin-left:auto;">✕</span></div><div class="lwb-ve-section"><div class="lwb-ve-label">执行条件</div><div class="lwb-ve-condgroups"></div><button type="button" class="lwb-ve-btn lwb-ve-add-group"><i class="fa-solid fa-plus"></i>添加条件小组</button></div><div class="lwb-ve-section"><div class="lwb-ve-label">将显示世界书内容（可选）</div><textarea class="lwb-ve-text lwb-ve-display" placeholder="例如：&lt;Info&gt;……&lt;/Info&gt;"></textarea></div><div class="lwb-ve-section"><div class="lwb-ve-label">将执行stscript命令或JS代码（可选）</div><textarea class="lwb-ve-text lwb-ve-js" placeholder="stscript:/setvar key=foo 1 | /run SomeQR 或 直接JS"></textarea><div style="margin-top:6px; display:flex; gap:8px; flex-wrap:wrap;"><button type="button" class="lwb-ve-btn lwb-ve-gen-st">常用st控制</button></div></div>`;
    },
    getConditionRowHTML() {
        return `<select class="lwb-ve-input lwb-ve-mini lwb-ve-lop" style="display:none;"><option value="||">或</option><option value="&&" selected>和</option></select><select class="lwb-ve-input lwb-ve-mini lwb-ve-ctype"><option value="vv">比较值</option><option value="vvv">比较变量</option></select><input class="lwb-ve-input lwb-ve-var" placeholder="变量名称"/><select class="lwb-ve-input lwb-ve-mini lwb-ve-op"><option value="==">等于</option><option value="!=">不等于</option><option value=">=">大于或等于</option><option value="<=">小于或等于</option><option value=">">大于</option><option value="<">小于</option></select><span class="lwb-ve-vals"><span class="lwb-ve-valwrap"><input class="lwb-ve-input lwb-ve-val" placeholder="值"/></span></span><span class="lwb-ve-varrhs" style="display:none;"><span class="lwb-ve-valvarwrap"><input class="lwb-ve-input lwb-ve-valvar" placeholder="变量B名称"/></span></span><button type="button" class="lwb-ve-btn ghost lwb-ve-del">删除</button>`;
    },
    makeConditionGroup() {
        const g = U.el('div', 'lwb-ve-condgroup', `<div class="lwb-ve-group-title"><select class="lwb-ve-input lwb-ve-mini lwb-ve-group-lop" style="display:none;"><option value="&&">和</option><option value="||">或</option></select><span class="lwb-ve-group-name">小组</span><span style="flex:1 1 auto;"></span><button type="button" class="lwb-ve-btn ghost lwb-ve-del-group">删除小组</button></div><div class="lwb-ve-conds"></div><button type="button" class="lwb-ve-btn lwb-ve-add-cond"><i class="fa-solid fa-plus"></i>添加条件</button>`);
        const conds = g.querySelector('.lwb-ve-conds');
        g.querySelector('.lwb-ve-add-cond')?.addEventListener('click', () => { try { UI.addConditionRow(conds, {}); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "makeConditionGroup" }, caughtError); } });
        g.querySelector('.lwb-ve-del-group')?.addEventListener('click', () => g.remove());
        return g;
    },
    refreshLopDisplay(container) { U.qa(container, '.lwb-ve-row').forEach((r, idx) => { const lop = r.querySelector('.lwb-ve-lop'); if (!lop) return; lop.style.display = idx === 0 ? 'none' : ''; if (idx > 0 && !lop.value) lop.value = '&&'; }); },
    setupConditionRow(row, onRowsChanged) {
        row.querySelector('.lwb-ve-del')?.addEventListener('click', () => { row.remove(); onRowsChanged?.(); });
        const ctype = row.querySelector('.lwb-ve-ctype'), vals = row.querySelector('.lwb-ve-vals'), rhs = row.querySelector('.lwb-ve-varrhs');
        ctype?.addEventListener('change', () => { if (ctype.value === 'vv') { vals.style.display = 'inline-flex'; rhs.style.display = 'none'; } else { vals.style.display = 'none'; rhs.style.display = 'inline-flex'; } });
    },
    createConditionRow(params, onRowsChanged) {
        const { lop, lhs, op, rhsIsVar, rhs } = params || {};
        const row = U.el('div', 'lwb-ve-row', UI.getConditionRowHTML());
        const lopSel = row.querySelector('.lwb-ve-lop'); if (lopSel) { if (lop == null) { lopSel.style.display = 'none'; lopSel.value = '&&'; } else { lopSel.style.display = ''; lopSel.value = String(lop || '&&'); } }
        const varInp = row.querySelector('.lwb-ve-var'); if (varInp && lhs != null) varInp.value = String(lhs);
        const opSel = row.querySelector('.lwb-ve-op'); if (opSel && op != null) opSel.value = String(op);
        const ctypeSel = row.querySelector('.lwb-ve-ctype'), valsWrap = row.querySelector('.lwb-ve-vals'), varRhsWrap = row.querySelector('.lwb-ve-varrhs');
        if (ctypeSel && valsWrap && varRhsWrap && (rhsIsVar != null || rhs != null)) {
            if (rhsIsVar) { ctypeSel.value = 'vvv'; valsWrap.style.display = 'none'; varRhsWrap.style.display = 'inline-flex'; const rhsInp = row.querySelector('.lwb-ve-varrhs .lwb-ve-valvar'); if (rhsInp && rhs != null) rhsInp.value = String(rhs); }
            else { ctypeSel.value = 'vv'; valsWrap.style.display = 'inline-flex'; varRhsWrap.style.display = 'none'; const rhsInp = row.querySelector('.lwb-ve-vals .lwb-ve-val'); if (rhsInp && rhs != null) rhsInp.value = String(rhs); }
        }
        UI.setupConditionRow(row, onRowsChanged || null); return row;
    },
    addConditionRow(container, params) { const row = UI.createConditionRow(params, () => UI.refreshLopDisplay(container)); container.appendChild(row); UI.refreshLopDisplay(container); return row; },
    parseConditionIntoUI(block, condStr) {
        const groupWrap = block.querySelector('.lwb-ve-condgroups');
        let groups;
        try { groups = conditionGroups(condStr); } catch { groups = null; }
        groupWrap.replaceChildren();
        if (!groups) {
            const label = U.el('label', 'lwb-ve-label'); label.textContent = VAREVENT_COPY.rawCondition;
            const input = U.el('textarea', 'lwb-ve-text lwb-ve-condition-source'); input.value = condStr;
            label.appendChild(input); groupWrap.appendChild(label);
            block.querySelector('.lwb-ve-add-group').style.display = 'none';
            return;
        }
        groups.forEach((group, index) => {
            const element = UI.makeConditionGroup(); groupWrap.appendChild(element);
            const operator = element.querySelector('.lwb-ve-group-lop');
            operator.style.display = index ? '' : 'none'; operator.value = group.operator || '&&';
            element.querySelector('.lwb-ve-group-name').textContent = `${index + 1} 小组`;
            group.rows.forEach(row => UI.addConditionRow(element.querySelector('.lwb-ve-conds'), row));
        });
    },
    createEventBlock(index, onRemove) {
        const block = U.el('div', 'lwb-ve-event', UI.getEventBlockHTML());
        block.querySelector('.lwb-ve-idx').textContent = index;
        block.querySelector('.lwb-ve-event-title .lwb-ve-close')?.addEventListener('click', () => { if (onRemove) onRemove(); else block.remove(); });
        const groupWrap = block.querySelector('.lwb-ve-condgroups'), addGroupBtn = block.querySelector('.lwb-ve-add-group');
        const refreshGroupOpsAndNames = () => { U.qa(groupWrap, '.lwb-ve-condgroup').forEach((g, i) => { const glop = g.querySelector('.lwb-ve-group-lop'); if (glop) { glop.style.display = i === 0 ? 'none' : ''; if (i > 0 && !glop.value) glop.value = '&&'; } const nm = g.querySelector('.lwb-ve-group-name'); if (nm) nm.textContent = ('ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i] || (i + 1)) + ' 小组'; }); };
        const createGroup = () => { const g = UI.makeConditionGroup(); UI.addConditionRow(g.querySelector('.lwb-ve-conds'), {}); g.querySelector('.lwb-ve-del-group')?.addEventListener('click', () => { g.remove(); refreshGroupOpsAndNames(); }); return g; };
        addGroupBtn.addEventListener('click', () => { groupWrap.appendChild(createGroup()); refreshGroupOpsAndNames(); });
        groupWrap.appendChild(createGroup()); refreshGroupOpsAndNames();
        block.querySelector('.lwb-ve-gen-st')?.addEventListener('click', () => openActionBuilder(block));
        return block;
    },
    refreshEventIndices(eventsWrap) {
        U.qa(eventsWrap, '.lwb-ve-event').forEach(el => {
            const idxEl = el.querySelector('.lwb-ve-idx'); if (!idxEl) return;
            idxEl.style.cursor = 'pointer'; idxEl.title = '点击修改显示名称';
            if (!idxEl.dataset.clickbound) { idxEl.dataset.clickbound = '1'; idxEl.addEventListener('click', () => { const cur = idxEl.textContent || '', name = prompt('输入事件显示名称：', cur) ?? ''; if (name) idxEl.textContent = name; }); }
        });
    },
    processEventBlock(block) {
        let condition = '';
        const raw = block.querySelector('.lwb-ve-condition-source');
        if (raw) condition = raw.value;
        else for (const group of U.qa(block, '.lwb-ve-condgroup')) {
            let expression = '';
            for (const row of U.qa(group, '.lwb-ve-conds .lwb-ve-row')) {
                const name = row.querySelector('.lwb-ve-var').value.trim();
                if (!name) continue;
                const operator = row.querySelector('.lwb-ve-op').value;
                const isVariable = row.querySelector('.lwb-ve-ctype').value === 'vvv';
                const value = row.querySelector(isVariable ? '.lwb-ve-valvar' : '.lwb-ve-val').value;
                if (isVariable && !value.trim()) continue;
                const comparison = `${P.buildVar(name)} ${operator} ${isVariable ? P.buildVar(value.trim()) : P.buildVal(value)}`;
                expression = joinConditions(expression, row.querySelector('.lwb-ve-lop').value || '&&', comparison);
            }
            if (expression) condition = joinConditions(condition, group.querySelector('.lwb-ve-group-lop').value || '&&', expression);
        }
        return {
            id: block.querySelector('.lwb-ve-idx').textContent,
            condition,
            display: block.querySelector('.lwb-ve-display').value,
            js: block.querySelector('.lwb-ve-js').value,
        };
    },
};

export function openVarEditor(entryEl, uid) {
    const textarea = (uid ? document.getElementById('world_entry_content_' + uid) : null) || entryEl?.querySelector?.('textarea[name="content"]');
    if (!textarea) { U.toast.warn('未找到内容输入框，请先展开该条目的编辑抽屉'); return; }
    let model;
    try { model = createEventDocument(String(textarea.value || '')); }
    catch (error) { reportEventError(VAREVENT_COPY.conditionError, {}, error); return; }
    if (!model.groups.length) model.groups.push(newEventGroup());
    let active = model.groups[0], views = new Map();
    const overlay = U.el('div', 'lwb-ve-overlay'), modal = U.el('div', 'lwb-ve-modal');
    overlay.appendChild(modal);
    const header = U.el('div', 'lwb-ve-header', '<span>条件规则编辑器</span><span class="lwb-ve-close">✕</span>');
    const tabs = U.el('div', 'lwb-ve-tabs'), body = U.el('div', 'lwb-ve-body'), footer = U.el('div', 'lwb-ve-footer');
    const cancel = U.el('button', 'lwb-ve-btn', '取消'), save = U.el('button', 'lwb-ve-btn primary', '确认');
    footer.append(cancel, save); modal.append(header, tabs, body, footer); U.drag(modal, overlay, header);
    const page = U.el('div', 'lwb-ve-page active'), eventList = U.el('div');
    page.appendChild(eventList); body.appendChild(page);
    const toolbar = U.el('div', 'lwb-ve-toolbar');
    const addEvent = U.el('button', 'lwb-ve-btn', '添加事件'), bump = U.el('button', 'lwb-ve-btn', 'bump数值映射设置');
    toolbar.append(addEvent, bump); body.appendChild(toolbar);
    bump.addEventListener('click', () => openBumpAliasBuilder(null));
    const wi = document.getElementById('WorldInfo'), wiIcon = document.getElementById('WIDrawerIcon');
    const wasPinned = !!wi?.classList.contains('pinnedOpen');
    if (wi && !wasPinned) wi.classList.add('pinnedOpen');
    wiIcon?.classList.add('drawerPinnedOpen');
    const close = () => {
        editorDisposers.delete(close);
        if (!wasPinned && !document.getElementById('WI_panel_pin')?.checked) {
            wi?.classList.remove('pinnedOpen'); wiIcon?.classList.remove('drawerPinnedOpen');
        }
        overlay.remove();
    };
    editorDisposers.add(close);
    cancel.addEventListener('click', close); header.querySelector('.lwb-ve-close').addEventListener('click', close);

    const flush = () => {
        for (const [event, view] of views) {
            const values = UI.processEventBlock(view.block);
            for (const key of ['id', 'condition', 'display', 'js']) {
                event.values[key] = values[key] !== view.initial[key] ? values[key] : view.baseline[key];
            }
        }
    };
    const render = () => {
        tabs.replaceChildren(); eventList.replaceChildren(); views = new Map();
        model.groups.forEach((group, index) => {
            const tab = U.el('div', 'lwb-ve-tab' + (group === active ? ' active' : ''));
            tab.textContent = '组 ' + (index + 1);
            tab.addEventListener('click', () => { flush(); active = group; render(); });
            tabs.appendChild(tab);
        });
        const controls = U.el('div'); controls.style.marginLeft = 'auto';
        const add = U.el('button', 'lwb-ve-btn', '+组'), remove = U.el('button', 'lwb-ve-btn ghost', '-组');
        controls.append(add, remove); tabs.appendChild(controls);
        add.addEventListener('click', () => { flush(); active = newEventGroup(); model.groups.push(active); render(); });
        remove.addEventListener('click', () => {
            if (model.groups.length === 1) { U.toast.warn('至少保留一组'); return; }
            flush(); const index = model.groups.indexOf(active); model.groups.splice(index, 1);
            active = model.groups[Math.min(index, model.groups.length - 1)]; render();
        });
        active.events.forEach(event => {
            const block = UI.createEventBlock(event.values.id, () => {
                flush(); active.events.splice(active.events.indexOf(event), 1); render();
            });
            block.querySelector('.lwb-ve-idx').textContent = event.values.id;
            if (event.values.condition?.trim()) UI.parseConditionIntoUI(block, event.values.condition);
            block.querySelector('.lwb-ve-display').value = String(event.values.display ?? '').replace(/^\r?\n/, '').replace(/\r?\n$/, '');
            block.querySelector('.lwb-ve-js').value = event.values.js ?? '';
            const error = U.el('div', 'lwb-ve-condition-error'); error.setAttribute('role', 'alert'); error.hidden = true;
            block.appendChild(error); eventList.appendChild(block);
            views.set(event, { block, initial: UI.processEventBlock(block), baseline: { ...event.values }, error });
        });
        UI.refreshEventIndices(eventList);
    };
    addEvent.addEventListener('click', () => {
        flush();
        let id = 1; const ids = new Set(active.events.map(event => event.values.id));
        while (ids.has(String(id))) id++;
        active.events.push(newEvent(id)); render();
    });
    save.addEventListener('click', () => {
        flush();
        for (const group of model.groups) for (const event of group.events) {
            let error = null;
            try {
                if ((!event.original || event.values.id !== event.original.id)
                    && (!event.values.id || /[\]\r\n]/.test(event.values.id))) throw new Error(VAREVENT_COPY.invalidName);
                if (event.values.condition !== event.original?.condition && event.values.condition?.trim()) parseCondition(event.values.condition);
            } catch (cause) { error = cause; }
            if (!error) continue;
            active = group; render();
            const view = views.get(event);
            view.error.hidden = false; view.error.textContent = VAREVENT_COPY.saveError;
            (view.block.querySelector('.lwb-ve-condition-source') || view.block.querySelector('.lwb-ve-var'))?.focus();
            return;
        }
        const output = serializeEventDocument(model);
        if (output !== textarea.value) {
            textarea.value = output;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
        close();
    });
    render(); document.body.appendChild(overlay);
}

export function openActionBuilder(block) {
    const TYPES = [
        { value: 'var.set', label: '变量: set', template: `<input class="lwb-ve-input" placeholder="变量名 key"/><input class="lwb-ve-input" placeholder="值 value"/>` },
        { value: 'var.bump', label: '变量: bump(+/-)', template: `<input class="lwb-ve-input" placeholder="变量名 key"/><input class="lwb-ve-input" placeholder="增量(整数，可负) delta"/>` },
        { value: 'var.del', label: '变量: del', template: `<input class="lwb-ve-input" placeholder="变量名 key"/>` },
        { value: 'wi.enableUID', label: '世界书: 启用条目(UID)', template: `<input class="lwb-ve-input" placeholder="世界书文件名 file（必填）"/><input class="lwb-ve-input" placeholder="条目UID（必填）"/>` },
        { value: 'wi.disableUID', label: '世界书: 禁用条目(UID)', template: `<input class="lwb-ve-input" placeholder="世界书文件名 file（必填）"/><input class="lwb-ve-input" placeholder="条目UID（必填）"/>` },
        { value: 'wi.setContentUID', label: '世界书: 设置内容(UID)', template: `<input class="lwb-ve-input" placeholder="世界书文件名 file（必填）"/><input class="lwb-ve-input" placeholder="条目UID（必填）"/><textarea class="lwb-ve-text" rows="3" placeholder="内容 content（可多行）"></textarea>` },
        { value: 'wi.createContent', label: '世界书: 新建条目(仅内容)', template: `<input class="lwb-ve-input" placeholder="世界书文件名 file（必填）"/><input class="lwb-ve-input" placeholder="条目 key（建议填写）"/><textarea class="lwb-ve-text" rows="4" placeholder="新条目内容 content（可留空）"></textarea>` },
        { value: 'qr.run', label: '快速回复（/run）', template: `<input class="lwb-ve-input" placeholder="预设名（可空） preset"/><input class="lwb-ve-input" placeholder="标签（label，必填）"/>` },
        { value: 'custom.st', label: '自定义ST命令', template: `<textarea class="lwb-ve-text" rows="4" placeholder="每行一条斜杠命令"></textarea>` },
    ];
    const ui = U.mini(`<div class="lwb-ve-section"><div class="lwb-ve-label">添加动作</div><div id="lwb-action-list"></div><button type="button" class="lwb-ve-btn" id="lwb-add-action">+动作</button></div>`, '常用st控制');
    const list = ui.body.querySelector('#lwb-action-list'), addBtn = ui.body.querySelector('#lwb-add-action');
    const addRow = (presetType) => {
        const row = U.el('div', 'lwb-ve-row');
        row.style.alignItems = 'flex-start';
        // Template-only UI markup.
        row.innerHTML = `<select class="lwb-ve-input lwb-ve-mini lwb-act-type"></select><div class="lwb-ve-fields" style="flex:1; display:grid; grid-template-columns: 1fr 1fr; gap:6px;"></div><button type="button" class="lwb-ve-btn ghost lwb-ve-del">??</button>`;
        const typeSel = row.querySelector('.lwb-act-type');
        const fields = row.querySelector('.lwb-ve-fields');
        row.querySelector('.lwb-ve-del').addEventListener('click', () => row.remove());
        // eslint-disable-next-line no-unsanitized/property -- Template-only UI markup.
        typeSel.innerHTML = TYPES.map(a => `<option value="${a.value}">${a.label}</option>`).join('');
        const renderFields = () => {
            const def = TYPES.find(a => a.value === typeSel.value);
            // eslint-disable-next-line no-unsanitized/property -- Template-only UI markup.
            fields.innerHTML = def ? def.template : '';
        };
        typeSel.addEventListener('change', renderFields);
        if (presetType) typeSel.value = presetType;
        renderFields();
        list.appendChild(row);
    };
    addBtn.addEventListener('click', () => addRow()); addRow();
    ui.btnOk.addEventListener('click', () => {
        const rows = U.qa(list, '.lwb-ve-row'), actions = [];
        for (const r of rows) { const type = r.querySelector('.lwb-act-type')?.value, inputs = U.qa(r, '.lwb-ve-fields .lwb-ve-input, .lwb-ve-fields .lwb-ve-text').map(i => i.value); if (type === 'var.set' && inputs[0]) actions.push({ type, key: inputs[0], value: inputs[1] || '' }); if (type === 'var.bump' && inputs[0]) actions.push({ type, key: inputs[0], delta: inputs[1] || '0' }); if (type === 'var.del' && inputs[0]) actions.push({ type, key: inputs[0] }); if ((type === 'wi.enableUID' || type === 'wi.disableUID') && inputs[0] && inputs[1]) actions.push({ type, file: inputs[0], uid: inputs[1] }); if (type === 'wi.setContentUID' && inputs[0] && inputs[1]) actions.push({ type, file: inputs[0], uid: inputs[1], content: inputs[2] || '' }); if (type === 'wi.createContent' && inputs[0]) actions.push({ type, file: inputs[0], key: inputs[1] || '', content: inputs[2] || '' }); if (type === 'qr.run' && inputs[1]) actions.push({ type, preset: inputs[0] || '', label: inputs[1] }); if (type === 'custom.st' && inputs[0]) { const cmds = inputs[0].split('\n').map(s => s.trim()).filter(Boolean).map(c => c.startsWith('/') ? c : '/' + c).join(' | '); if (cmds) actions.push({ type, script: cmds }); } }
        const jsCode = buildSTscriptFromActions(actions), jsBox = block?.querySelector?.('.lwb-ve-js'); if (jsCode && jsBox) jsBox.value = jsCode; ui.wrap.remove();
    });
}

export function openBumpAliasBuilder(block) {
    const ui = U.mini(`<div class="lwb-ve-section"><div class="lwb-ve-label">bump数值映射（每行一条：变量名(可空) | 短语或 /regex/flags | 数值）</div><div id="lwb-bump-list"></div><button type="button" class="lwb-ve-btn" id="lwb-add-bump">+映射</button></div>`, 'bump数值映射设置');
    const list = ui.body.querySelector('#lwb-bump-list'), addBtn = ui.body.querySelector('#lwb-add-bump');
    const addRow = (scope = '', phrase = '', val = '1') => { const row = U.el('div', 'lwb-ve-row', `<input class="lwb-ve-input" placeholder="变量名(可空=全局)" value="${scope}"/><input class="lwb-ve-input" placeholder="短语 或 /regex(例：/她(很)?开心/i)" value="${phrase}"/><input class="lwb-ve-input" placeholder="数值(整数，可负)" value="${val}"/><button type="button" class="lwb-ve-btn ghost lwb-ve-del">删除</button>`); row.querySelector('.lwb-ve-del').addEventListener('click', () => row.remove()); list.appendChild(row); };
    addBtn.addEventListener('click', () => addRow());
    try { const store = getBumpAliasStore() || {}; const addFromBucket = (scope, bucket) => { let n = 0; for (const [phrase, val] of Object.entries(bucket || {})) { addRow(scope, phrase, String(val)); n++; } return n; }; let prefilled = 0; if (store._global) prefilled += addFromBucket('', store._global); for (const [scope, bucket] of Object.entries(store || {})) if (scope !== '_global') prefilled += addFromBucket(scope, bucket); if (prefilled === 0) addRow(); } catch { addRow(); }
    ui.btnOk.addEventListener('click', async () => { try { const rows = U.qa(list, '.lwb-ve-row'), items = rows.map(r => { const ins = U.qa(r, '.lwb-ve-input').map(i => i.value); return { scope: (ins[0] || '').trim(), phrase: (ins[1] || '').trim(), val: Number(ins[2] || 0) }; }).filter(x => x.phrase), next = {}; for (const it of items) { const bucket = it.scope ? (next[it.scope] ||= {}) : (next._global ||= {}); bucket[it.phrase] = Number.isFinite(it.val) ? it.val : 0; } await setBumpAliasStore(next); U.toast.ok('Bump 映射已保存到角色卡'); ui.wrap.remove(); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "openBumpAliasBuilder" }, caughtError); } });
}

function tryInjectButtons(root) {
    const scope = root.closest?.('#WorldInfo') || document.getElementById('WorldInfo') || root;
    scope.querySelectorAll?.('.world_entry .alignitemscenter.flex-container .editor_maximize')?.forEach((maxBtn) => {
        const container = maxBtn.parentElement; if (!container || container.querySelector('.lwb-var-editor-button')) return;
        const entry = container.closest('.world_entry'), uid = entry?.getAttribute('data-uid') || entry?.dataset?.uid || (window?.jQuery ? window.jQuery(entry).data('uid') : undefined);
        const btn = U.el('div', 'right_menu_button interactable lwb-var-editor-button'); btn.title = '条件规则编辑器'; btn.innerHTML = '<i class="fa-solid fa-pen-ruler"></i>';
        btn.addEventListener('click', () => openVarEditor(entry || undefined, uid)); container.insertBefore(btn, maxBtn.nextSibling);
    });
}

function scheduleEditor(callback, delay) {
    const timer = setTimeout(() => { editorTimers.delete(timer); if (initialized) callback(); }, delay);
    editorTimers.add(timer);
    return timer;
}

function observeWIEntriesForEditorButton() {
    try { LWBVE.obs?.disconnect(); LWBVE.obs = null; } catch (caughtError) { console.warn({ source: import.meta.url, operation: "observeWIEntriesForEditorButton" }, caughtError); }
    const root = document.getElementById('WorldInfo') || document.body;
    const cb = (() => { let t = null; return () => { clearTimeout(t); editorTimers.delete(t); t = scheduleEditor(() => tryInjectButtons(root), 100); }; })();
    const obs = new MutationObserver(() => cb()); try { obs.observe(root, { childList: true, subtree: true }); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "observeWIEntriesForEditorButton" }, caughtError); } LWBVE.obs = obs;
}

export function initVareventEditor() {
    if (initialized) return; initialized = true;
    events = createModuleEvents(MODULE_ID);
    removeLegacyEventQueue(getContext());
    injectEditorStyles();
    installWIHiddenTagStripper();
    registerWIEventSystem();
    observeWIEntriesForEditorButton();
    scheduleEditor(() => tryInjectButtons(document.body), 600);
    if (typeof window !== 'undefined') { window.LWBVE = LWBVE; window.openVarEditor = openVarEditor; window.openActionBuilder = openActionBuilder; window.openBumpAliasBuilder = openBumpAliasBuilder; window.parseVareventEvents = parseVareventEvents; window.getBumpAliasStore = getBumpAliasStore; window.setBumpAliasStore = setBumpAliasStore; window.clearBumpAliasStore = clearBumpAliasStore; }
    LWBVE.installed = true;
}

export function cleanupVareventEditor() {
    if (!initialized) return;
    initialized = false;
    eventRun.cancel();
    latePromptDispose?.(); latePromptDispose = null;
    for (const timer of editorTimers) clearTimeout(timer);
    editorTimers.clear();
    for (const dispose of editorDisposers) dispose();
    events?.cleanup(); events = null;
    U.qa(document, '.lwb-ve-overlay').forEach(el => el.remove());
    U.qa(document, '.lwb-var-editor-button').forEach(el => el.remove());
    document.getElementById(EDITOR_STYLES_ID)?.remove();
    try { getContext()?.setExtensionPrompt?.(LWB_VAREVENT_PROMPT_KEY, '', 0, 0, false); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "cleanupVareventEditor" }, caughtError); }
    try { LWBVE.obs?.disconnect(); LWBVE.obs = null; } catch (caughtError) { console.warn({ source: import.meta.url, operation: "cleanupVareventEditor" }, caughtError); }
    if (typeof window !== 'undefined') LWBVE.installed = false;
    initialized = false;
}

// 供 variables-core.js 复用的解析工具
export { stripYamlInlineComment, OP_MAP, TOP_OP_RE };

export { MODULE_ID, LWBVE };
