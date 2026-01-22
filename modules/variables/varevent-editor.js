/**
 * @file modules/variables/varevent-editor.js
 * @description 条件规则编辑器与 varevent 运行时（常驻模块）
 */

import { getContext } from "../../../../../extensions.js";
import { getLocalVariable } from "../../../../../variables.js";
import { createModuleEvents } from "../../core/event-manager.js";
import { replaceXbGetVarInString } from "./var-commands.js";

const MODULE_ID = 'vareventEditor';
const LWB_EXT_ID = 'LittleWhiteBox-fork';
const LWB_VAREVENT_PROMPT_KEY = 'LWB_varevent_display';
const EDITOR_STYLES_ID = 'lwb-varevent-editor-styles';
const TAG_RE_VAREVENT = /<\s*varevent[^>]*>([\s\S]*?)<\s*\/\s*varevent\s*>/gi;

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
let origEmitMap = new WeakMap();

function debounce(fn, wait = 100) { let t = null; return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(null, args), wait); }; }

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
        if (legacy && typeof legacy === 'object') { writeCharExtBumpAliases(legacy); return legacy; }
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
    } catch {}
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
                try { if (new RegExp(k.slice(1, last), k.slice(last + 1)).test(rhs)) return Number(v); } catch {}
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

export function parseVareventEvents(innerText) {
    const evts = [], lines = String(innerText || '').split(/\r?\n/);
    let cur = null;
    const flush = () => { if (cur) { evts.push(cur); cur = null; } };
    const isStopLine = (t) => !t ? false : /^\[\s*event\.[^\]]+]\s*$/i.test(t) || /^(condition|display|js_execute)\s*:/i.test(t) || /^<\s*\/\s*varevent\s*>/i.test(t);
    const findUnescapedQuote = (str, q) => { for (let i = 0; i < str.length; i++) if (str[i] === q && str[i - 1] !== '\\') return i; return -1; };
    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i], line = raw.trim(); if (!line) continue;
        const header = /^\[\s*event\.([^\]]+)]\s*$/i.exec(line);
        if (header) { flush(); cur = { id: String(header[1]).trim() }; continue; }
        const m = /^(condition|display|js_execute)\s*:\s*(.*)$/i.exec(line);
        if (m) {
            const key = m[1].toLowerCase(); let valPart = m[2] ?? ''; if (!cur) cur = {};
            let value = ''; const ltrim = valPart.replace(/^\s+/, ''), firstCh = ltrim[0];
            if (firstCh === '"' || firstCh === "'") {
                const quote = firstCh; let after = ltrim.slice(1), endIdx = findUnescapedQuote(after, quote);
                if (endIdx !== -1) value = after.slice(0, endIdx);
                else { value = after + '\n'; while (++i < lines.length) { const ln = lines[i], pos = findUnescapedQuote(ln, quote); if (pos !== -1) { value += ln.slice(0, pos); break; } value += ln + '\n'; } }
                value = value.replace(/\\"/g, '"').replace(/\\'/g, "'");
            } else { value = valPart; let j = i + 1; while (j < lines.length) { const nextTrim = lines[j].trim(); if (isStopLine(nextTrim)) break; value += '\n' + lines[j]; j++; } i = j - 1; }
            if (key === 'condition') cur.condition = value; else if (key === 'display') cur.display = value; else if (key === 'js_execute') cur.js = value;
        }
    }
    flush(); return evts;
}

export function evaluateCondition(expr) {
    const isNumericLike = (v) => v != null && /^-?\d+(?:\.\d+)?$/.test(String(v).trim());
    // Used by eval() expression; keep in scope.
    // eslint-disable-next-line no-unused-vars
    function VAR(path) {
        try {
            const p = String(path ?? '').replace(/\[(\d+)\]/g, '.$1'), seg = p.split('.').map(s => s.trim()).filter(Boolean);
            if (!seg.length) return ''; const root = getLocalVariable(seg[0]);
            if (seg.length === 1) { if (root == null) return ''; return typeof root === 'object' ? JSON.stringify(root) : String(root); }
            let obj; if (typeof root === 'string') { try { obj = JSON.parse(root); } catch { return undefined; } } else if (root && typeof root === 'object') obj = root; else return undefined;
            let cur = obj; for (let i = 1; i < seg.length; i++) { cur = cur?.[/^\d+$/.test(seg[i]) ? Number(seg[i]) : seg[i]]; if (cur === undefined) return undefined; }
            return cur == null ? '' : typeof cur === 'object' ? JSON.stringify(cur) : String(cur);
        } catch { return undefined; }
    }
    // Used by eval() expression; keep in scope.
    // eslint-disable-next-line no-unused-vars
    const VAL = (t) => String(t ?? '');
    // Used by eval() expression; keep in scope.
    // eslint-disable-next-line no-unused-vars
    function REL(a, op, b) {
        if (isNumericLike(a) && isNumericLike(b)) { const A = Number(String(a).trim()), B = Number(String(b).trim()); if (op === '>') return A > B; if (op === '>=') return A >= B; if (op === '<') return A < B; if (op === '<=') return A <= B; }
        else { const A = String(a), B = String(b); if (op === '>') return A > B; if (op === '>=') return A >= B; if (op === '<') return A < B; if (op === '<=') return A <= B; }
        return false;
    }
    try {
        let processed = expr.replace(/var\(`([^`]+)`\)/g, 'VAR("$1")').replace(/val\(`([^`]+)`\)/g, 'VAL("$1")');
        processed = processed.replace(/(VAR\(".*?"\)|VAL\(".*?"\))\s*(>=|<=|>|<)\s*(VAR\(".*?"\)|VAL\(".*?"\))/g, 'REL($1,"$2",$3)');
        // eslint-disable-next-line no-eval -- intentional: user-defined expression evaluation
        return !!eval(processed);
    } catch { return false; }
}

export async function runJS(code) {
    const ctx = getContext();
    try {
        const STscriptProxy = async (command) => { if (!command) return; if (command[0] !== '/') command = '/' + command; const { executeSlashCommands, substituteParams } = getContext(); return await executeSlashCommands?.(substituteParams ? substituteParams(command) : command, true); };
        // eslint-disable-next-line no-new-func -- intentional: user-defined async script
        const fn = new Function('ctx', 'getVar', 'setVar', 'console', 'STscript', `return (async()=>{ ${code}\n })();`);
        const getVar = (k) => getLocalVariable(k);
        const setVar = (k, v) => { getContext()?.variables?.local?.set?.(k, v); };
        return await fn(ctx, getVar, setVar, console, (typeof window !== 'undefined' && window?.STscript) || STscriptProxy);
    } catch (err) { console.error('[LWB:runJS]', err); }
}

export async function runST(code) {
    try { if (!code) return; if (code[0] !== '/') code = '/' + code; const { executeSlashCommands, substituteParams } = getContext() || {}; return await executeSlashCommands?.(substituteParams ? substituteParams(code) : code, true); }
    catch (err) { console.error('[LWB:runST]', err); }
}

async function buildVareventReplacement(innerText, dryRun, executeJs = false) {
    try {
        const evts = parseVareventEvents(innerText); if (!evts.length) return '';
        let chosen = null;
        for (let i = evts.length - 1; i >= 0; i--) {
            const ev = evts[i], condStr = String(ev.condition ?? '').trim(), condOk = condStr ? evaluateCondition(condStr) : true;
            if (!((ev.display && String(ev.display).trim()) || (ev.js && String(ev.js).trim()))) continue;
            if (condOk) { chosen = ev; break; }
        }
        if (!chosen) return '';
        let out = chosen.display ? String(chosen.display).replace(/^\n+/, '').replace(/\n+$/, '') : '';
        if (!dryRun && executeJs && chosen.js && String(chosen.js).trim()) { try { await runJS(chosen.js); } catch {} }
        return out;
    } catch { return ''; }
}

export async function replaceVareventInString(text, dryRun = false, executeJs = false) {
    if (!text || text.indexOf('<varevent') === -1) return text;
    const replaceAsync = async (input, regex, repl) => { let out = '', last = 0; regex.lastIndex = 0; let m; while ((m = regex.exec(input))) { out += input.slice(last, m.index); out += await repl(...m); last = regex.lastIndex; } return out + input.slice(last); };
    return await replaceAsync(text, TAG_RE_VAREVENT, (m, inner) => buildVareventReplacement(inner, dryRun, executeJs));
}

export function enqueuePendingVareventBlock(innerText, sourceInfo) {
    try { const ctx = getContext(), meta = ctx?.chatMetadata || {}, list = (meta.LWB_PENDING_VAREVENT_BLOCKS ||= []); list.push({ inner: String(innerText || ''), source: sourceInfo || 'unknown', turn: (ctx?.chat?.length ?? 0), ts: Date.now() }); ctx?.saveMetadataDebounced?.(); } catch {}
}

export function drainPendingVareventBlocks() {
    try { const ctx = getContext(), meta = ctx?.chatMetadata || {}, list = Array.isArray(meta.LWB_PENDING_VAREVENT_BLOCKS) ? meta.LWB_PENDING_VAREVENT_BLOCKS.slice() : []; meta.LWB_PENDING_VAREVENT_BLOCKS = []; ctx?.saveMetadataDebounced?.(); return list; } catch { return []; }
}

export async function executeQueuedVareventJsAfterTurn() {
    const blocks = drainPendingVareventBlocks(); if (!blocks.length) return;
    for (const item of blocks) {
        try {
            const evts = parseVareventEvents(item.inner); if (!evts.length) continue;
            let chosen = null;
            for (let j = evts.length - 1; j >= 0; j--) { const ev = evts[j], condStr = String(ev.condition ?? '').trim(); if (!(condStr ? evaluateCondition(condStr) : true)) continue; if (!(ev.js && String(ev.js).trim())) continue; chosen = ev; break; }
            if (chosen) { try { await runJS(String(chosen.js ?? '').trim()); } catch {} }
        } catch {}
    }
}

let _scanRunning = false;
async function runImmediateVarEvents() {
    if (_scanRunning) return; _scanRunning = true;
    try {
        const wiList = getContext()?.world_info || [];
        for (const entry of wiList) {
            const content = String(entry?.content ?? ''); if (!content || content.indexOf('<varevent') === -1) continue;
            TAG_RE_VAREVENT.lastIndex = 0; let m;
            while ((m = TAG_RE_VAREVENT.exec(content)) !== null) {
                const evts = parseVareventEvents(m[1] ?? '');
                for (const ev of evts) { if (!(String(ev.condition ?? '').trim() ? evaluateCondition(String(ev.condition ?? '').trim()) : true)) continue; if (String(ev.display ?? '').trim()) await runST(`/sys "${String(ev.display ?? '').trim().replace(/"/g, '\\"')}"`); if (String(ev.js ?? '').trim()) await runJS(String(ev.js ?? '').trim()); }
            }
        }
    } catch {} finally { setTimeout(() => { _scanRunning = false; }, 0); }
}
const runImmediateVarEventsDebounced = debounce(runImmediateVarEvents, 30);

function installWIHiddenTagStripper() {
    const ctx = getContext(), ext = ctx?.extensionSettings; if (!ext) return;
    ext.regex = Array.isArray(ext.regex) ? ext.regex : [];
    ext.regex = ext.regex.filter(r => !['lwb-varevent-stripper', 'lwb-varevent-replacer'].includes(r?.id) && !['LWB_VarEventStripper', 'LWB_VarEventReplacer'].includes(r?.scriptName));
    ctx?.saveSettingsDebounced?.();
}

  function registerWIEventSystem() {
      const { eventSource, event_types: evtTypes } = getContext() || {};
      if (evtTypes?.CHAT_COMPLETION_PROMPT_READY) {
          const lateChatReplacementHandler = async (data) => {
            try {
                if (data?.dryRun) return;
                const chat = data?.chat;
                if (!Array.isArray(chat)) return;
                for (const msg of chat) {
                    if (typeof msg?.content === 'string') {
                        if (msg.content.includes('<varevent')) {
                            TAG_RE_VAREVENT.lastIndex = 0;
                            let mm;
                            while ((mm = TAG_RE_VAREVENT.exec(msg.content)) !== null) {
                                enqueuePendingVareventBlock(mm[1] ?? '', 'chat.content');
                            }
                            msg.content = await replaceVareventInString(msg.content, false, false);
                        }
                        if (msg.content.indexOf('{{xbgetvar::') !== -1) {
                            msg.content = replaceXbGetVarInString(msg.content);
                        }
                    }
                    if (Array.isArray(msg?.content)) {
                        for (const part of msg.content) {
                            if (part?.type === 'text' && typeof part.text === 'string') {
                                if (part.text.includes('<varevent')) {
                                    TAG_RE_VAREVENT.lastIndex = 0;
                                    let mm;
                                    while ((mm = TAG_RE_VAREVENT.exec(part.text)) !== null) {
                                        enqueuePendingVareventBlock(mm[1] ?? '', 'chat.content[].text');
                                    }
                                    part.text = await replaceVareventInString(part.text, false, false);
                                }
                                if (part.text.indexOf('{{xbgetvar::') !== -1) {
                                    part.text = replaceXbGetVarInString(part.text);
                                }
                            }
                        }
                    }
                    if (typeof msg?.mes === 'string') {
                        if (msg.mes.includes('<varevent')) {
                            TAG_RE_VAREVENT.lastIndex = 0;
                            let mm;
                            while ((mm = TAG_RE_VAREVENT.exec(msg.mes)) !== null) {
                                enqueuePendingVareventBlock(mm[1] ?? '', 'chat.mes');
                            }
                            msg.mes = await replaceVareventInString(msg.mes, false, false);
                        }
                        if (msg.mes.indexOf('{{xbgetvar::') !== -1) {
                            msg.mes = replaceXbGetVarInString(msg.mes);
                        }
                    }
                }
              } catch {}
          };
          try {
              if (eventSource && typeof eventSource.makeLast === 'function') {
                  eventSource.makeLast(evtTypes.CHAT_COMPLETION_PROMPT_READY, lateChatReplacementHandler);
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
                  if (data?.dryRun) return;

                if (typeof data?.prompt === 'string') {
                    if (data.prompt.includes('<varevent')) {
                        TAG_RE_VAREVENT.lastIndex = 0;
                        let mm;
                        while ((mm = TAG_RE_VAREVENT.exec(data.prompt)) !== null) {
                            enqueuePendingVareventBlock(mm[1] ?? '', 'prompt');
                        }
                        data.prompt = await replaceVareventInString(data.prompt, false, false);
                    }
                    if (data.prompt.indexOf('{{xbgetvar::') !== -1) {
                        data.prompt = replaceXbGetVarInString(data.prompt);
                    }
                }
            } catch {}
        });
    }
    if (evtTypes?.GENERATION_ENDED) {
        events?.on(evtTypes.GENERATION_ENDED, async () => {
            try {
                getContext()?.setExtensionPrompt?.(LWB_VAREVENT_PROMPT_KEY, '', 0, 0, false);      
                const ctx = getContext();
                const chat = ctx?.chat || [];
                const lastMsg = chat[chat.length - 1];    
                if (lastMsg && !lastMsg.is_user) {
                    await executeQueuedVareventJsAfterTurn();
                } else {

                    drainPendingVareventBlocks();
                }
            } catch {}
        });
    }    
    if (evtTypes?.CHAT_CHANGED) {
        events?.on(evtTypes.CHAT_CHANGED, () => {
            try {
                getContext()?.setExtensionPrompt?.(LWB_VAREVENT_PROMPT_KEY, '', 0, 0, false);
                drainPendingVareventBlocks();
                runImmediateVarEventsDebounced();
            } catch {}
        });
    }
    if (evtTypes?.APP_READY) {
        events?.on(evtTypes.APP_READY, () => {
            try {
                runImmediateVarEventsDebounced();
            } catch {}
        });
    }
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
    // Template-only UI markup.
    // eslint-disable-next-line no-unsanitized/property
    el: (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; },
    setActive(listLike, idx) { (Array.isArray(listLike) ? listLike : U.qa(document, listLike)).forEach((el, i) => el.classList.toggle('active', i === idx)); },
    toast: { ok: (m) => window?.toastr?.success?.(m), warn: (m) => window?.toastr?.warning?.(m), err: (m) => window?.toastr?.error?.(m) },
    drag(modal, overlay, header) {
        try { modal.style.position = 'absolute'; modal.style.left = '50%'; modal.style.top = '50%'; modal.style.transform = 'translate(-50%,-50%)'; } catch {}
        let dragging = false, sx = 0, sy = 0, sl = 0, st = 0;
        const onDown = (e) => { if (!(e instanceof PointerEvent) || e.button !== 0) return; dragging = true; const r = modal.getBoundingClientRect(), ro = overlay.getBoundingClientRect(); modal.style.left = (r.left - ro.left) + 'px'; modal.style.top = (r.top - ro.top) + 'px'; modal.style.transform = ''; sx = e.clientX; sy = e.clientY; sl = parseFloat(modal.style.left) || 0; st = parseFloat(modal.style.top) || 0; window.addEventListener('pointermove', onMove, { passive: true }); window.addEventListener('pointerup', onUp, { once: true }); e.preventDefault(); };
        const onMove = (e) => { if (!dragging) return; let nl = sl + e.clientX - sx, nt = st + e.clientY - sy; const maxL = (overlay.clientWidth || overlay.getBoundingClientRect().width) - modal.offsetWidth, maxT = (overlay.clientHeight || overlay.getBoundingClientRect().height) - modal.offsetHeight; modal.style.left = Math.max(0, Math.min(maxL, nl)) + 'px'; modal.style.top = Math.max(0, Math.min(maxT, nt)) + 'px'; };
        const onUp = () => { dragging = false; window.removeEventListener('pointermove', onMove); };
        header.addEventListener('pointerdown', onDown);
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
    stripOuter(s) { let t = String(s || '').trim(); if (!t.startsWith('(') || !t.endsWith(')')) return t; let i = 0, d = 0, q = null; while (i < t.length) { const c = t[i]; if (q) { if (c === q && t[i - 1] !== '\\') q = null; i++; continue; } if (c === '"' || c === "'" || c === '`') { q = c; i++; continue; } if (c === '(') d++; else if (c === ')') d--; i++; } return d === 0 ? t.slice(1, -1).trim() : t; },
    stripOuterWithFlag(s) { let t = String(s || '').trim(); if (!t.startsWith('(') || !t.endsWith(')')) return { text: t, wrapped: false }; let i = 0, d = 0, q = null; while (i < t.length) { const c = t[i]; if (q) { if (c === q && t[i - 1] !== '\\') q = null; i++; continue; } if (c === '"' || c === "'" || c === '`') { q = c; i++; continue; } if (c === '(') d++; else if (c === ')') d--; i++; } return d === 0 ? { text: t.slice(1, -1).trim(), wrapped: true } : { text: t, wrapped: false }; },
    splitTopWithOps(s) { const out = []; let i = 0, start = 0, d = 0, q = null, pendingOp = null; while (i < s.length) { const c = s[i]; if (q) { if (c === q && s[i - 1] !== '\\') q = null; i++; continue; } if (c === '"' || c === "'" || c === '`') { q = c; i++; continue; } if (c === '(') { d++; i++; continue; } if (c === ')') { d--; i++; continue; } if (d === 0 && (s.slice(i, i + 2) === '&&' || s.slice(i, i + 2) === '||')) { const seg = s.slice(start, i).trim(); if (seg) out.push({ op: pendingOp, expr: seg }); pendingOp = s.slice(i, i + 2); i += 2; start = i; continue; } i++; } const tail = s.slice(start).trim(); if (tail) out.push({ op: pendingOp, expr: tail }); return out; },
    parseComp(s) { const t = P.stripOuter(s), m = t.match(/^var\(\s*([`'"])([\s\S]*?)\1\s*\)\s*(==|!=|>=|<=|>|<)\s*(val|var)\(\s*([`'"])([\s\S]*?)\5\s*\)$/); if (!m) return null; return { lhs: m[2], op: m[3], rhsIsVar: m[4] === 'var', rhs: m[6] }; },
    hasBinary: (s) => /\|\||&&/.test(s),
    paren: (s) => (s.startsWith('(') && s.endsWith(')')) ? s : `(${s})`,
    wrapBack: (s) => { const t = String(s || '').trim(); return /^([`'"]).*\1$/.test(t) ? t : '`' + t.replace(/`/g, '\\`') + '`'; },
    buildVar: (name) => `var(${P.wrapBack(name)})`,
    buildVal(v) { const t = String(v || '').trim(); return /^([`'"]).*\1$/.test(t) ? `val(${t})` : `val(${P.wrapBack(t)})`; },
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
    getEventBlockHTML(index) {
        return `<div class="lwb-ve-event-title">事件 #<span class="lwb-ve-idx">${index}</span><span class="lwb-ve-close" title="删除事件" style="margin-left:auto;">✕</span></div><div class="lwb-ve-section"><div class="lwb-ve-label">执行条件</div><div class="lwb-ve-condgroups"></div><button type="button" class="lwb-ve-btn lwb-ve-add-group"><i class="fa-solid fa-plus"></i>添加条件小组</button></div><div class="lwb-ve-section"><div class="lwb-ve-label">将显示世界书内容（可选）</div><textarea class="lwb-ve-text lwb-ve-display" placeholder="例如：&lt;Info&gt;……&lt;/Info&gt;"></textarea></div><div class="lwb-ve-section"><div class="lwb-ve-label">将执行stscript命令或JS代码（可选）</div><textarea class="lwb-ve-text lwb-ve-js" placeholder="stscript:/setvar key=foo 1 | /run SomeQR 或 直接JS"></textarea><div style="margin-top:6px; display:flex; gap:8px; flex-wrap:wrap;"><button type="button" class="lwb-ve-btn lwb-ve-gen-st">常用st控制</button></div></div>`;
    },
    getConditionRowHTML() {
        return `<select class="lwb-ve-input lwb-ve-mini lwb-ve-lop" style="display:none;"><option value="||">或</option><option value="&&" selected>和</option></select><select class="lwb-ve-input lwb-ve-mini lwb-ve-ctype"><option value="vv">比较值</option><option value="vvv">比较变量</option></select><input class="lwb-ve-input lwb-ve-var" placeholder="变量名称"/><select class="lwb-ve-input lwb-ve-mini lwb-ve-op"><option value="==">等于</option><option value="!=">不等于</option><option value=">=">大于或等于</option><option value="<=">小于或等于</option><option value=">">大于</option><option value="<">小于</option></select><span class="lwb-ve-vals"><span class="lwb-ve-valwrap"><input class="lwb-ve-input lwb-ve-val" placeholder="值"/></span></span><span class="lwb-ve-varrhs" style="display:none;"><span class="lwb-ve-valvarwrap"><input class="lwb-ve-input lwb-ve-valvar" placeholder="变量B名称"/></span></span><button type="button" class="lwb-ve-btn ghost lwb-ve-del">删除</button>`;
    },
    makeConditionGroup() {
        const g = U.el('div', 'lwb-ve-condgroup', `<div class="lwb-ve-group-title"><select class="lwb-ve-input lwb-ve-mini lwb-ve-group-lop" style="display:none;"><option value="&&">和</option><option value="||">或</option></select><span class="lwb-ve-group-name">小组</span><span style="flex:1 1 auto;"></span><button type="button" class="lwb-ve-btn ghost lwb-ve-del-group">删除小组</button></div><div class="lwb-ve-conds"></div><button type="button" class="lwb-ve-btn lwb-ve-add-cond"><i class="fa-solid fa-plus"></i>添加条件</button>`);
        const conds = g.querySelector('.lwb-ve-conds');
        g.querySelector('.lwb-ve-add-cond')?.addEventListener('click', () => { try { UI.addConditionRow(conds, {}); } catch {} });
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
        try {
            const groupWrap = block.querySelector('.lwb-ve-condgroups'); if (!groupWrap) return;
            // Template-only UI markup.
            // eslint-disable-next-line no-unsanitized/property
            groupWrap.innerHTML = '';
            const top = P.splitTopWithOps(condStr);
            top.forEach((seg, idxSeg) => {
                const { text } = P.stripOuterWithFlag(seg.expr), g = UI.makeConditionGroup(); groupWrap.appendChild(g);
                const glopSel = g.querySelector('.lwb-ve-group-lop'); if (glopSel) { glopSel.style.display = idxSeg === 0 ? 'none' : ''; if (idxSeg > 0) glopSel.value = seg.op || '&&'; }
                const name = g.querySelector('.lwb-ve-group-name'); if (name) name.textContent = ('ABCDEFGHIJKLMNOPQRSTUVWXYZ'[idxSeg] || (idxSeg + 1)) + ' 小组';
                const rows = P.splitTopWithOps(P.stripOuter(text)); let first = true; const cw = g.querySelector('.lwb-ve-conds');
                rows.forEach(r => { const comp = P.parseComp(r.expr); if (!comp) return; UI.addConditionRow(cw, { lop: first ? null : (r.op || '&&'), lhs: comp.lhs, op: comp.op, rhsIsVar: comp.rhsIsVar, rhs: comp.rhs }); first = false; });
            });
        } catch {}
    },
    createEventBlock(index) {
        const block = U.el('div', 'lwb-ve-event', UI.getEventBlockHTML(index));
        block.querySelector('.lwb-ve-event-title .lwb-ve-close')?.addEventListener('click', () => { block.remove(); block.dispatchEvent(new CustomEvent('lwb-refresh-idx', { bubbles: true })); });
        const groupWrap = block.querySelector('.lwb-ve-condgroups'), addGroupBtn = block.querySelector('.lwb-ve-add-group');
        const refreshGroupOpsAndNames = () => { U.qa(groupWrap, '.lwb-ve-condgroup').forEach((g, i) => { const glop = g.querySelector('.lwb-ve-group-lop'); if (glop) { glop.style.display = i === 0 ? 'none' : ''; if (i > 0 && !glop.value) glop.value = '&&'; } const nm = g.querySelector('.lwb-ve-group-name'); if (nm) nm.textContent = ('ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i] || (i + 1)) + ' 小组'; }); };
        const createGroup = () => { const g = UI.makeConditionGroup(); UI.addConditionRow(g.querySelector('.lwb-ve-conds'), {}); g.querySelector('.lwb-ve-del-group')?.addEventListener('click', () => { g.remove(); refreshGroupOpsAndNames(); }); return g; };
        addGroupBtn.addEventListener('click', () => { groupWrap.appendChild(createGroup()); refreshGroupOpsAndNames(); });
        groupWrap.appendChild(createGroup()); refreshGroupOpsAndNames();
        block.querySelector('.lwb-ve-gen-st')?.addEventListener('click', () => openActionBuilder(block));
        return block;
    },
    refreshEventIndices(eventsWrap) {
        U.qa(eventsWrap, '.lwb-ve-event').forEach((el, i) => {
            const idxEl = el.querySelector('.lwb-ve-idx'); if (!idxEl) return;
            idxEl.textContent = String(i + 1); idxEl.style.cursor = 'pointer'; idxEl.title = '点击修改显示名称';
            if (!idxEl.dataset.clickbound) { idxEl.dataset.clickbound = '1'; idxEl.addEventListener('click', () => { const cur = idxEl.textContent || '', name = prompt('输入事件显示名称：', cur) ?? ''; if (name) idxEl.textContent = name; }); }
        });
    },
    processEventBlock(block, idx) {
        const displayName = String(block.querySelector('.lwb-ve-idx')?.textContent || '').trim();
        const id = (displayName && /^\w[\w.-]*$/.test(displayName)) ? displayName : String(idx + 1).padStart(4, '0');
        const lines = [`[event.${id}]`]; let condStr = '', hasAny = false;
        const groups = U.qa(block, '.lwb-ve-condgroup');
        for (let gi = 0; gi < groups.length; gi++) {
            const g = groups[gi], rows = U.qa(g, '.lwb-ve-conds .lwb-ve-row'); let groupExpr = '', groupHas = false;
            for (const r of rows) {
                const v = r.querySelector('.lwb-ve-var')?.value?.trim?.() || '', op = r.querySelector('.lwb-ve-op')?.value || '==', ctype = r.querySelector('.lwb-ve-ctype')?.value || 'vv'; if (!v) continue;
                let rowExpr = '';
                if (ctype === 'vv') { const ins = U.qa(r, '.lwb-ve-vals .lwb-ve-val'), exprs = []; for (const inp of ins) { const val = (inp?.value || '').trim(); if (!val) continue; exprs.push(`${P.buildVar(v)} ${op} ${P.buildVal(val)}`); } if (exprs.length === 1) rowExpr = exprs[0]; else if (exprs.length > 1) rowExpr = '(' + exprs.join(' || ') + ')'; }
                else { const ins = U.qa(r, '.lwb-ve-varrhs .lwb-ve-valvar'), exprs = []; for (const inp of ins) { const rhs = (inp?.value || '').trim(); if (!rhs) continue; exprs.push(`${P.buildVar(v)} ${op} ${P.buildVar(rhs)}`); } if (exprs.length === 1) rowExpr = exprs[0]; else if (exprs.length > 1) rowExpr = '(' + exprs.join(' || ') + ')'; }
                if (!rowExpr) continue;
                const lop = r.querySelector('.lwb-ve-lop')?.value || '&&';
                if (!groupHas) { groupExpr = rowExpr; groupHas = true; } else { if (lop === '&&') { const left = P.hasBinary(groupExpr) ? P.paren(groupExpr) : groupExpr, right = P.hasBinary(rowExpr) ? P.paren(rowExpr) : rowExpr; groupExpr = `${left} && ${right}`; } else { groupExpr = `${groupExpr} || ${(P.hasBinary(rowExpr) ? P.paren(rowExpr) : rowExpr)}`; } }
            }
            if (!groupHas) continue;
            const glop = g.querySelector('.lwb-ve-group-lop')?.value || '&&', wrap = P.hasBinary(groupExpr) ? P.paren(groupExpr) : groupExpr;
            if (!hasAny) { condStr = wrap; hasAny = true; } else condStr = glop === '&&' ? `${condStr} && ${wrap}` : `${condStr} || ${wrap}`;
        }
        const disp = block.querySelector('.lwb-ve-display')?.value ?? '', js = block.querySelector('.lwb-ve-js')?.value ?? '', dispCore = String(disp).replace(/^\n+|\n+$/g, '');
        if (!dispCore && !js) return { lines: [] };
        if (condStr) lines.push(`condition: ${condStr}`);
        if (dispCore !== '') lines.push('display: "' + ('\n' + dispCore + '\n').replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"');
        if (js !== '') lines.push(`js_execute: ${JSON.stringify(js)}`);
        return { lines };
    },
};

export function openVarEditor(entryEl, uid) {
    const textarea = (uid ? document.getElementById(`world_entry_content_${uid}`) : null) || entryEl?.querySelector?.('textarea[name="content"]');
    if (!textarea) { U.toast.warn('未找到内容输入框，请先展开该条目的编辑抽屉'); return; }
    const overlay = U.el('div', 'lwb-ve-overlay'), modal = U.el('div', 'lwb-ve-modal'); overlay.appendChild(modal); modal.style.pointerEvents = 'auto'; modal.style.zIndex = '10010';
    const header = U.el('div', 'lwb-ve-header', `<span>条件规则编辑器</span><span class="lwb-ve-close">✕</span>`);
    const tabs = U.el('div', 'lwb-ve-tabs'), tabsCtrl = U.el('div'); tabsCtrl.style.cssText = 'margin-left:auto;display:inline-flex;gap:6px;';
    const btnAddTab = U.el('button', 'lwb-ve-btn', '+组'), btnDelTab = U.el('button', 'lwb-ve-btn ghost', '-组');
    tabs.appendChild(tabsCtrl); tabsCtrl.append(btnAddTab, btnDelTab);
    const body = U.el('div', 'lwb-ve-body'), footer = U.el('div', 'lwb-ve-footer');
    const btnCancel = U.el('button', 'lwb-ve-btn', '取消'), btnOk = U.el('button', 'lwb-ve-btn primary', '确认');
    footer.append(btnCancel, btnOk); modal.append(header, tabs, body, footer); U.drag(modal, overlay, header);
    const pagesWrap = U.el('div'); body.appendChild(pagesWrap);
    const addEventBtn = U.el('button', 'lwb-ve-btn', '<i class="fa-solid fa-plus"></i> 添加事件'); addEventBtn.type = 'button'; addEventBtn.style.cssText = 'background: var(--SmartThemeBlurTintColor); border: 1px solid var(--SmartThemeBorderColor); cursor: pointer; margin-right: 5px;';
    const bumpBtn = U.el('button', 'lwb-ve-btn lwb-ve-gen-bump', 'bump数值映射设置');
    const tools = U.el('div', 'lwb-ve-toolbar'); tools.append(addEventBtn, bumpBtn); body.appendChild(tools);
    bumpBtn.addEventListener('click', () => openBumpAliasBuilder(null));
    const wi = document.getElementById('WorldInfo'), wiIcon = document.getElementById('WIDrawerIcon');
    const wasPinned = !!wi?.classList.contains('pinnedOpen'); let tempPinned = false;
    if (wi && !wasPinned) { wi.classList.add('pinnedOpen'); tempPinned = true; } if (wiIcon && !wiIcon.classList.contains('drawerPinnedOpen')) wiIcon.classList.add('drawerPinnedOpen');
    const closeEditor = () => { try { const pinChecked = !!document.getElementById('WI_panel_pin')?.checked; if (tempPinned && !pinChecked) { wi?.classList.remove('pinnedOpen'); wiIcon?.classList.remove('drawerPinnedOpen'); } } catch {} overlay.remove(); };
    btnCancel.addEventListener('click', closeEditor); header.querySelector('.lwb-ve-close')?.addEventListener('click', closeEditor);
    const TAG_RE = { varevent: /<varevent>([\s\S]*?)<\/varevent>/gi }, originalText = String(textarea.value || ''), vareventBlocks = [];
    TAG_RE.varevent.lastIndex = 0; let mm; while ((mm = TAG_RE.varevent.exec(originalText)) !== null) vareventBlocks.push({ inner: mm[1] ?? '' });
    const pageInitialized = new Set();
    const makePage = () => { const page = U.el('div', 'lwb-ve-page'), eventsWrap = U.el('div'); page.appendChild(eventsWrap); return { page, eventsWrap }; };
    const renderPage = (pageIdx) => {
        const tabEls = U.qa(tabs, '.lwb-ve-tab'); U.setActive(tabEls, pageIdx);
        const current = vareventBlocks[pageIdx], evts = (current && typeof current.inner === 'string') ? (parseVareventEvents(current.inner) || []) : [];
        let page = U.qa(pagesWrap, '.lwb-ve-page')[pageIdx]; if (!page) { page = makePage().page; pagesWrap.appendChild(page); }
        U.qa(pagesWrap, '.lwb-ve-page').forEach(el => el.classList.remove('active')); page.classList.add('active');
        let eventsWrap = page.querySelector(':scope > div'); if (!eventsWrap) { eventsWrap = U.el('div'); page.appendChild(eventsWrap); }
        const init = () => {
            // Template-only UI markup.
            // eslint-disable-next-line no-unsanitized/property
            eventsWrap.innerHTML = '';
            if (!evts.length) eventsWrap.appendChild(UI.createEventBlock(1));
            else evts.forEach((_ev, i) => { const block = UI.createEventBlock(i + 1); try { const condStr = String(_ev.condition || '').trim(); if (condStr) UI.parseConditionIntoUI(block, condStr); const disp = String(_ev.display || ''), dispEl = block.querySelector('.lwb-ve-display'); if (dispEl) dispEl.value = disp.replace(/^\r?\n/, '').replace(/\r?\n$/, ''); const js = String(_ev.js || ''), jsEl = block.querySelector('.lwb-ve-js'); if (jsEl) jsEl.value = js; } catch {} eventsWrap.appendChild(block); });
            UI.refreshEventIndices(eventsWrap); eventsWrap.addEventListener('lwb-refresh-idx', () => UI.refreshEventIndices(eventsWrap));
        };
        if (!pageInitialized.has(pageIdx)) { init(); pageInitialized.add(pageIdx); } else if (!eventsWrap.querySelector('.lwb-ve-event')) init();
    };
    pagesWrap._lwbRenderPage = renderPage;
    addEventBtn.addEventListener('click', () => { const active = pagesWrap.querySelector('.lwb-ve-page.active'), eventsWrap = active?.querySelector(':scope > div'); if (!eventsWrap) return; eventsWrap.appendChild(UI.createEventBlock(eventsWrap.children.length + 1)); eventsWrap.dispatchEvent(new CustomEvent('lwb-refresh-idx', { bubbles: true })); });
    if (vareventBlocks.length === 0) { const tab = U.el('div', 'lwb-ve-tab active', '组 1'); tabs.insertBefore(tab, tabsCtrl); const { page, eventsWrap } = makePage(); pagesWrap.appendChild(page); page.classList.add('active'); eventsWrap.appendChild(UI.createEventBlock(1)); UI.refreshEventIndices(eventsWrap); tab.addEventListener('click', () => { U.qa(tabs, '.lwb-ve-tab').forEach(el => el.classList.remove('active')); tab.classList.add('active'); U.qa(pagesWrap, '.lwb-ve-page').forEach(el => el.classList.remove('active')); page.classList.add('active'); }); }
    else { vareventBlocks.forEach((_b, i) => { const tab = U.el('div', 'lwb-ve-tab' + (i === 0 ? ' active' : ''), `组 ${i + 1}`); tab.addEventListener('click', () => renderPage(i)); tabs.insertBefore(tab, tabsCtrl); }); renderPage(0); }
    btnAddTab.addEventListener('click', () => { const newIdx = U.qa(tabs, '.lwb-ve-tab').length; vareventBlocks.push({ inner: '' }); const tab = U.el('div', 'lwb-ve-tab', `组 ${newIdx + 1}`); tab.addEventListener('click', () => pagesWrap._lwbRenderPage(newIdx)); tabs.insertBefore(tab, tabsCtrl); pagesWrap._lwbRenderPage(newIdx); });
    btnDelTab.addEventListener('click', () => { const tabEls = U.qa(tabs, '.lwb-ve-tab'); if (tabEls.length <= 1) { U.toast.warn('至少保留一组'); return; } const activeIdx = tabEls.findIndex(t => t.classList.contains('active')), idx = activeIdx >= 0 ? activeIdx : 0; U.qa(pagesWrap, '.lwb-ve-page')[idx]?.remove(); tabEls[idx]?.remove(); vareventBlocks.splice(idx, 1); const rebind = U.qa(tabs, '.lwb-ve-tab'); rebind.forEach((t, i) => { const nt = t.cloneNode(true); nt.textContent = `组 ${i + 1}`; nt.addEventListener('click', () => pagesWrap._lwbRenderPage(i)); tabs.replaceChild(nt, t); }); pagesWrap._lwbRenderPage(Math.max(0, Math.min(idx, rebind.length - 1))); });
    btnOk.addEventListener('click', () => {
        const pageEls = U.qa(pagesWrap, '.lwb-ve-page'); if (pageEls.length === 0) { closeEditor(); return; }
        const builtBlocks = [], seenIds = new Set();
        pageEls.forEach((p) => { const wrap = p.querySelector(':scope > div'), blks = wrap ? U.qa(wrap, '.lwb-ve-event') : [], lines = ['<varevent>']; let hasEvents = false; blks.forEach((b, j) => { const r = UI.processEventBlock(b, j); if (r.lines.length > 0) { const idLine = r.lines[0], mm = idLine.match(/^\[\s*event\.([^\]]+)\]/i), id = mm ? mm[1] : `evt_${j + 1}`; let use = id, k = 2; while (seenIds.has(use)) use = `${id}_${k++}`; if (use !== id) r.lines[0] = `[event.${use}]`; seenIds.add(use); lines.push(...r.lines); hasEvents = true; } }); if (hasEvents) { lines.push('</varevent>'); builtBlocks.push(lines.join('\n')); } });
        const oldVal = textarea.value || '', originals = [], RE = { varevent: /<varevent>([\s\S]*?)<\/varevent>/gi }; RE.varevent.lastIndex = 0; let m; while ((m = RE.varevent.exec(oldVal)) !== null) originals.push({ start: m.index, end: RE.varevent.lastIndex });
        let acc = '', pos = 0; const minLen = Math.min(originals.length, builtBlocks.length);
        for (let i = 0; i < originals.length; i++) { const { start, end } = originals[i]; acc += oldVal.slice(pos, start); if (i < minLen) acc += builtBlocks[i]; pos = end; } acc += oldVal.slice(pos);
        if (builtBlocks.length > originals.length) { const extras = builtBlocks.slice(originals.length).join('\n\n'); acc = acc.replace(/\s*$/, ''); if (acc && !/(?:\r?\n){2}$/.test(acc)) acc += (/\r?\n$/.test(acc) ? '' : '\n') + '\n'; acc += extras; }
        acc = acc.replace(/(?:\r?\n){3,}/g, '\n\n'); textarea.value = acc; try { window?.jQuery?.(textarea)?.trigger?.('input'); } catch {}
        U.toast.ok('已更新条件规则到该世界书条目'); closeEditor();
    });
    document.body.appendChild(overlay);
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
        // eslint-disable-next-line no-unsanitized/property
        row.innerHTML = `<select class="lwb-ve-input lwb-ve-mini lwb-act-type"></select><div class="lwb-ve-fields" style="flex:1; display:grid; grid-template-columns: 1fr 1fr; gap:6px;"></div><button type="button" class="lwb-ve-btn ghost lwb-ve-del">??</button>`;
        const typeSel = row.querySelector('.lwb-act-type');
        const fields = row.querySelector('.lwb-ve-fields');
        row.querySelector('.lwb-ve-del').addEventListener('click', () => row.remove());
        // Template-only UI markup.
        // eslint-disable-next-line no-unsanitized/property
        typeSel.innerHTML = TYPES.map(a => `<option value="${a.value}">${a.label}</option>`).join('');
        const renderFields = () => {
            const def = TYPES.find(a => a.value === typeSel.value);
            // Template-only UI markup.
            // eslint-disable-next-line no-unsanitized/property
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
    ui.btnOk.addEventListener('click', async () => { try { const rows = U.qa(list, '.lwb-ve-row'), items = rows.map(r => { const ins = U.qa(r, '.lwb-ve-input').map(i => i.value); return { scope: (ins[0] || '').trim(), phrase: (ins[1] || '').trim(), val: Number(ins[2] || 0) }; }).filter(x => x.phrase), next = {}; for (const it of items) { const bucket = it.scope ? (next[it.scope] ||= {}) : (next._global ||= {}); bucket[it.phrase] = Number.isFinite(it.val) ? it.val : 0; } await setBumpAliasStore(next); U.toast.ok('Bump 映射已保存到角色卡'); ui.wrap.remove(); } catch {} });
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

function observeWIEntriesForEditorButton() {
    try { LWBVE.obs?.disconnect(); LWBVE.obs = null; } catch {}
    const root = document.getElementById('WorldInfo') || document.body;
    const cb = (() => { let t = null; return () => { clearTimeout(t); t = setTimeout(() => tryInjectButtons(root), 100); }; })();
    const obs = new MutationObserver(() => cb()); try { obs.observe(root, { childList: true, subtree: true }); } catch {} LWBVE.obs = obs;
}

export function initVareventEditor() {
    if (initialized) return; initialized = true;
    events = createModuleEvents(MODULE_ID);
    injectEditorStyles();
    installWIHiddenTagStripper();
    registerWIEventSystem();
    observeWIEntriesForEditorButton();
    setTimeout(() => tryInjectButtons(document.body), 600);
    if (typeof window !== 'undefined') { window.LWBVE = LWBVE; window.openVarEditor = openVarEditor; window.openActionBuilder = openActionBuilder; window.openBumpAliasBuilder = openBumpAliasBuilder; window.parseVareventEvents = parseVareventEvents; window.getBumpAliasStore = getBumpAliasStore; window.setBumpAliasStore = setBumpAliasStore; window.clearBumpAliasStore = clearBumpAliasStore; }
    LWBVE.installed = true;
}

export function cleanupVareventEditor() {
    if (!initialized) return;
    events?.cleanup(); events = null;
    U.qa(document, '.lwb-ve-overlay').forEach(el => el.remove());
    U.qa(document, '.lwb-var-editor-button').forEach(el => el.remove());
    document.getElementById(EDITOR_STYLES_ID)?.remove();
    try { getContext()?.setExtensionPrompt?.(LWB_VAREVENT_PROMPT_KEY, '', 0, 0, false); } catch {}
    try { const { eventSource } = getContext() || {}; const orig = eventSource && origEmitMap.get(eventSource); if (orig) { eventSource.emit = orig; origEmitMap.delete(eventSource); } } catch {}
    try { LWBVE.obs?.disconnect(); LWBVE.obs = null; } catch {}
    if (typeof window !== 'undefined') LWBVE.installed = false;
    initialized = false;
}

// 供 variables-core.js 复用的解析工具
export { stripYamlInlineComment, OP_MAP, TOP_OP_RE };

export { MODULE_ID, LWBVE };
