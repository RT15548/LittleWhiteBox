/**
 * @file modules/variables/variables-core.js
 * @description 变量管理核心（受开关控制）
 * @description 包含 plot-log 解析、快照回滚、变量守护
 */

import { getContext } from "../../../../../extensions.js";
import { updateMessageBlock } from "../../../../../../script.js";
import { getLocalVariable, setLocalVariable } from "../../../../../variables.js";
import { createModuleEvents, event_types } from "../../core/event-manager.js";
import { xbLog, CacheRegistry } from "../../core/debug-core.js";
import {
    normalizePath,
    lwbSplitPathWithBrackets,
    splitPathSegments,
    ensureDeepContainer,
    setDeepValue,
    pushDeepValue,
    deleteDeepKey,
    getRootAndPath,
    joinPath,
    safeJSONStringify,
    maybeParseObject,
    deepClone,
} from "../../core/variable-path.js";
import {
    parseDirectivesTokenList,
    applyXbGetVarForMessage,
    parseValueForSet,  
} from "./var-commands.js";
import {
    preprocessBumpAliases,
    executeQueuedVareventJsAfterTurn,
    stripYamlInlineComment,
    OP_MAP,
    TOP_OP_RE,
} from "./varevent-editor.js";

/* ============= 模块常量 ============= */

const MODULE_ID = 'variablesCore';
const LWB_RULES_KEY = 'LWB_RULES';
const LWB_SNAP_KEY = 'LWB_SNAP';
const LWB_PLOT_APPLIED_KEY = 'LWB_PLOT_APPLIED_KEY';

// plot-log 标签正则
const TAG_RE_PLOTLOG = /<\s*plot-log[^>]*>([\s\S]*?)<\s*\/\s*plot-log\s*>/gi;

// 守护状态
const guardianState = {
    table: {},
    regexCache: {},
    bypass: false,
    origVarApi: null,
    lastMetaSyncAt: 0
};

// 事件管理器
let events = null;
let initialized = false;
let pendingSwipeApply = new Map();
let suppressUpdatedOnce = new Set();

CacheRegistry.register(MODULE_ID, {
    name: '变量系统缓存',
    getSize: () => {
        try {
            const applied = Object.keys(getAppliedMap() || {}).length;
            const snaps = Object.keys(getSnapMap() || {}).length;
            const rules = Object.keys(guardianState.table || {}).length;
            const regex = Object.keys(guardianState.regexCache || {}).length;
            const swipe = (typeof pendingSwipeApply !== 'undefined' && pendingSwipeApply?.size) ? pendingSwipeApply.size : 0;
            const sup = (typeof suppressUpdatedOnce !== 'undefined' && suppressUpdatedOnce?.size) ? suppressUpdatedOnce.size : 0;
            return applied + snaps + rules + regex + swipe + sup;
        } catch {
            return 0;
        }
    },
    // 新增：估算字节大小（用于 debug-panel 缓存统计）
    getBytes: () => {
        try {
            let total = 0;

            const snaps = getSnapMap();
            if (snaps && typeof snaps === 'object') {
                total += JSON.stringify(snaps).length * 2; // UTF-16
            }
            const applied = getAppliedMap();
            if (applied && typeof applied === 'object') {
                total += JSON.stringify(applied).length * 2; // UTF-16
            }
            const rules = guardianState.table;
            if (rules && typeof rules === 'object') {
                total += JSON.stringify(rules).length * 2; // UTF-16
            }

            const regex = guardianState.regexCache;
            if (regex && typeof regex === 'object') {
                total += JSON.stringify(regex).length * 2; // UTF-16
            }

            if (typeof pendingSwipeApply !== 'undefined' && pendingSwipeApply?.size) {
                total += JSON.stringify(Array.from(pendingSwipeApply)).length * 2; // UTF-16
            }
            if (typeof suppressUpdatedOnce !== 'undefined' && suppressUpdatedOnce?.size) {
                total += JSON.stringify(Array.from(suppressUpdatedOnce)).length * 2; // UTF-16
            }

            return total;
        } catch {
            return 0;
        }
    },
    clear: () => {
        try {
            const meta = getContext()?.chatMetadata || {};
            try { delete meta[LWB_PLOT_APPLIED_KEY]; } catch {}
            try { delete meta[LWB_SNAP_KEY]; } catch {}
        } catch {}
        try { guardianState.regexCache = {}; } catch {}
        try { pendingSwipeApply?.clear?.(); } catch {}
        try { suppressUpdatedOnce?.clear?.(); } catch {}
    },
    getDetail: () => {
        try {
            return {
                appliedSignatures: Object.keys(getAppliedMap() || {}).length,
                snapshots: Object.keys(getSnapMap() || {}).length,
                rulesTableKeys: Object.keys(guardianState.table || {}).length,
                rulesRegexCacheKeys: Object.keys(guardianState.regexCache || {}).length,
                pendingSwipeApply: (typeof pendingSwipeApply !== 'undefined' && pendingSwipeApply?.size) ? pendingSwipeApply.size : 0,
                suppressUpdatedOnce: (typeof suppressUpdatedOnce !== 'undefined' && suppressUpdatedOnce?.size) ? suppressUpdatedOnce.size : 0,
            };
        } catch {
            return {};
        }
    },
});

/* ============= 内部辅助函数 ============= */

function getMsgKey(msg) {
    return (typeof msg?.mes === 'string') ? 'mes'
         : (typeof msg?.content === 'string' ? 'content' : null);
}

function stripLeadingHtmlComments(s) {
    let t = String(s ?? '');
    t = t.replace(/^\uFEFF/, '');
    while (true) {
        const m = t.match(/^\s*<!--[\s\S]*?-->\s*/);
        if (!m) break;
        t = t.slice(m[0].length);
    }
    return t;
}

function normalizeOpName(k) {
    if (!k) return null;
    return OP_MAP[String(k).toLowerCase().trim()] || null;
}

/* ============= 应用签名追踪 ============= */

function getAppliedMap() {
    const meta = getContext()?.chatMetadata || {};
    const m = meta[LWB_PLOT_APPLIED_KEY];
    if (m && typeof m === 'object') return m;
    meta[LWB_PLOT_APPLIED_KEY] = {};
    return meta[LWB_PLOT_APPLIED_KEY];
}

function setAppliedSignature(messageId, sig) {
    const map = getAppliedMap();
    if (sig) map[messageId] = sig;
    else delete map[messageId];
    getContext()?.saveMetadataDebounced?.();
}

function clearAppliedFrom(messageIdInclusive) {
    const map = getAppliedMap();
    for (const k of Object.keys(map)) {
        const id = Number(k);
        if (!Number.isNaN(id) && id >= messageIdInclusive) {
            delete map[k];
        }
    }
    getContext()?.saveMetadataDebounced?.();
}

function clearAppliedFor(messageId) {
    const map = getAppliedMap();
    delete map[messageId];
    getContext()?.saveMetadataDebounced?.();
}

function computePlotSignatureFromText(text) {
    if (!text || typeof text !== 'string') return '';
    TAG_RE_PLOTLOG.lastIndex = 0;
    const chunks = [];
    let m;
    while ((m = TAG_RE_PLOTLOG.exec(text)) !== null) {
        chunks.push((m[0] || '').trim());
    }
    if (!chunks.length) return '';
    return chunks.join('\n---\n');
}

/* ============= Plot-Log 解析 ============= */

/**
 * 提取 plot-log 块
 */
function extractPlotLogBlocks(text) {
    if (!text || typeof text !== 'string') return [];
    const out = [];
    TAG_RE_PLOTLOG.lastIndex = 0;
    let m;
    while ((m = TAG_RE_PLOTLOG.exec(text)) !== null) {
        const inner = m[1] ?? '';
        if (inner.trim()) out.push(inner);
    }
    return out;
}

/**
 * 解析 plot-log 块内容
 */
function parseBlock(innerText) {
    // 预处理 bump 别名
    innerText = preprocessBumpAliases(innerText);
    const textForJsonToml = stripLeadingHtmlComments(innerText);

    const ops = { set: {}, push: {}, bump: {}, del: {} };
    const lines = String(innerText || '').split(/\r?\n/);
    const indentOf = (s) => s.length - s.trimStart().length;
    const stripQ = (s) => {
        let t = String(s ?? '').trim();
        if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
            t = t.slice(1, -1);
        }
        return t;
    };
    const norm = (p) => String(p || '').replace(/\[(\d+)\]/g, '.$1');

    // 守护指令记录
    const guardMap = new Map();

    const recordGuardDirective = (path, directives) => {
        const tokens = Array.isArray(directives)
            ? directives.map(t => String(t || '').trim()).filter(Boolean)
            : [];
        if (!tokens.length) return;
        const normalizedPath = norm(path);
        if (!normalizedPath) return;
        let bag = guardMap.get(normalizedPath);
        if (!bag) {
            bag = new Set();
            guardMap.set(normalizedPath, bag);
        }
        for (const tok of tokens) {
            if (tok) bag.add(tok);
        }
    };

    const extractDirectiveInfo = (rawKey) => {
        const text = String(rawKey || '').trim().replace(/:$/, '');
        if (!text) return { directives: [], remainder: '', original: '' };

        const directives = [];
        let idx = 0;
        while (idx < text.length) {
            while (idx < text.length && /\s/.test(text[idx])) idx++;
            if (idx >= text.length) break;
            if (text[idx] !== '$') break;
            const start = idx;
            idx++;
            while (idx < text.length && !/\s/.test(text[idx])) idx++;
            directives.push(text.slice(start, idx));
        }
        const remainder = text.slice(idx).trim();
        const seg = remainder || text;
        return { directives, remainder: seg, original: text };
    };

    const buildPathInfo = (rawKey, parentPath) => {
        const parent = String(parentPath || '').trim();
        const { directives, remainder, original } = extractDirectiveInfo(rawKey);
        const segTrim = String(remainder || original || '').trim();
        const curPathRaw = segTrim ? (parent ? `${parent}.${segTrim}` : segTrim) : parent;
        const guardTargetRaw = directives.length ? (segTrim ? curPathRaw : parent || curPathRaw) : '';
        return { directives, curPathRaw, guardTargetRaw, segment: segTrim };
    };

    // 操作记录函数
    const putSet = (top, path, value) => {
        ops.set[top] ||= {};
        ops.set[top][path] = value;
    };
    const putPush = (top, path, value) => {
        ops.push[top] ||= {};
        const arr = (ops.push[top][path] ||= []);
        Array.isArray(value) ? arr.push(...value) : arr.push(value);
    };
    const putBump = (top, path, delta) => {
        const n = Number(String(delta).replace(/^\+/, ''));
        if (!Number.isFinite(n)) return;
        ops.bump[top] ||= {};
        ops.bump[top][path] = (ops.bump[top][path] ?? 0) + n;
    };
    const putDel = (top, path) => {
        ops.del[top] ||= [];
        ops.del[top].push(path);
    };

    const finalizeResults = () => {
        const results = [];
        for (const [top, flat] of Object.entries(ops.set)) {
            if (flat && Object.keys(flat).length) {
                results.push({ name: top, operation: 'setObject', data: flat });
            }
        }
        for (const [top, flat] of Object.entries(ops.push)) {
            if (flat && Object.keys(flat).length) {
                results.push({ name: top, operation: 'push', data: flat });
            }
        }
        for (const [top, flat] of Object.entries(ops.bump)) {
            if (flat && Object.keys(flat).length) {
                results.push({ name: top, operation: 'bump', data: flat });
            }
        }
        for (const [top, list] of Object.entries(ops.del)) {
            if (Array.isArray(list) && list.length) {
                results.push({ name: top, operation: 'del', data: list });
            }
        }
        if (guardMap.size) {
            const guardList = [];
            for (const [path, tokenSet] of guardMap.entries()) {
                const directives = Array.from(tokenSet).filter(Boolean);
                if (directives.length) guardList.push({ path, directives });
            }
            if (guardList.length) {
                results.push({ operation: 'guard', data: guardList });
            }
        }
        return results;
    };

    // 解码键
    const decodeKey = (rawKey) => {
        const { directives, remainder, original } = extractDirectiveInfo(rawKey);
        const path = (remainder || original || String(rawKey)).trim();
        if (directives && directives.length) recordGuardDirective(path, directives);
        return path;
    };

    // 遍历节点
    const walkNode = (op, top, node, basePath = '') => {
        if (op === 'set') {
            if (node === null || node === undefined) return;
            if (typeof node !== 'object' || Array.isArray(node)) {
                putSet(top, norm(basePath), node);
                return;
            }
            for (const [rawK, v] of Object.entries(node)) {
                const k = decodeKey(rawK);
                const p = norm(basePath ? `${basePath}.${k}` : k);
                if (Array.isArray(v)) putSet(top, p, v);
                else if (v && typeof v === 'object') walkNode(op, top, v, p);
                else putSet(top, p, v);
            }
        } else if (op === 'push') {
            if (!node || typeof node !== 'object' || Array.isArray(node)) return;
            for (const [rawK, v] of Object.entries(node)) {
                const k = decodeKey(rawK);
                const p = norm(basePath ? `${basePath}.${k}` : k);
                if (Array.isArray(v)) {
                    for (const it of v) putPush(top, p, it);
                } else if (v && typeof v === 'object') {
                    walkNode(op, top, v, p);
                } else {
                    putPush(top, p, v);
                }
            }
        } else if (op === 'bump') {
            if (!node || typeof node !== 'object' || Array.isArray(node)) return;
            for (const [rawK, v] of Object.entries(node)) {
                const k = decodeKey(rawK);
                const p = norm(basePath ? `${basePath}.${k}` : k);
                if (v && typeof v === 'object' && !Array.isArray(v)) {
                    walkNode(op, top, v, p);
                } else {
                    putBump(top, p, v);
                }
            }
        } else if (op === 'del') {
            const acc = new Set();
            const collect = (n, base = '') => {
                if (Array.isArray(n)) {
                    for (const it of n) {
                        if (typeof it === 'string' || typeof it === 'number') {
                            const seg = typeof it === 'number' ? String(it) : decodeKey(it);
                            const full = base ? `${base}.${seg}` : seg;
                            if (full) acc.add(norm(full));
                        } else if (it && typeof it === 'object') {
                            collect(it, base);
                        }
                    }
                } else if (n && typeof n === 'object') {
                    for (const [rawK, v] of Object.entries(n)) {
                        const k = decodeKey(rawK);
                        const nextBase = base ? `${base}.${k}` : k;
                        if (v && typeof v === 'object') {
                            collect(v, nextBase);
                        } else {
                            const valStr = (v !== null && v !== undefined)
                                ? String(v).trim()
                                : '';
                            if (valStr) {
                                const full = nextBase ? `${nextBase}.${valStr}` : valStr;
                                acc.add(norm(full));
                            } else if (nextBase) {
                                acc.add(norm(nextBase));
                            }
                        }
                    }
                } else if (base) {
                    acc.add(norm(base));
                }
            };
            collect(node, basePath);
            for (const p of acc) {
                const std = p.replace(/\[(\d+)\]/g, '.$1');
                const parts = std.split('.').filter(Boolean);
                const t = parts.shift();
                const rel = parts.join('.');
                if (t) putDel(t, rel);
            }
        }
    };

    // 处理结构化数据（JSON/TOML）
    const processStructuredData = (data) => {
        const process = (d) => {
            if (!d || typeof d !== 'object') return;
            for (const [k, v] of Object.entries(d)) {
                const op = normalizeOpName(k);
                if (!op || v == null) continue;

                if (op === 'del' && Array.isArray(v)) {
                    for (const it of v) {
                        const std = String(it).replace(/\[(\d+)\]/g, '.$1');
                        const parts = std.split('.').filter(Boolean);
                        const top = parts.shift();
                        const rel = parts.join('.');
                        if (top) putDel(top, rel);
                    }
                    continue;
                }

                if (typeof v !== 'object') continue;

                for (const [rawTop, payload] of Object.entries(v)) {
                    const top = decodeKey(rawTop);
                    if (op === 'push') {
                        if (Array.isArray(payload)) {
                            for (const it of payload) putPush(top, '', it);
                        } else if (payload && typeof payload === 'object') {
                            walkNode(op, top, payload);
                        } else {
                            putPush(top, '', payload);
                        }
                    } else if (op === 'bump' && (typeof payload !== 'object' || Array.isArray(payload))) {
                        putBump(top, '', payload);
                    } else if (op === 'del') {
                        if (Array.isArray(payload) || (payload && typeof payload === 'object')) {
                            walkNode(op, top, payload, top);
                        } else {
                            const base = norm(top);
                            if (base) {
                                const hasValue = payload !== undefined && payload !== null
                                    && String(payload).trim() !== '';
                                const full = hasValue ? norm(`${base}.${payload}`) : base;
                                const std = full.replace(/\[(\d+)\]/g, '.$1');
                                const parts = std.split('.').filter(Boolean);
                                const t = parts.shift();
                                const rel = parts.join('.');
                                if (t) putDel(t, rel);
                            }
                        }
                    } else {
                        walkNode(op, top, payload);
                    }
                }
            }
        };

        if (Array.isArray(data)) {
            for (const entry of data) {
                if (entry && typeof entry === 'object') process(entry);
            }
        } else {
            process(data);
        }
        return true;
    };

    // 尝试 JSON 解析
    const tryParseJson = (text) => {
        const s = String(text || '').trim();
        if (!s || (s[0] !== '{' && s[0] !== '[')) return false;

        const relaxJson = (src) => {
            let out = '', i = 0, inStr = false, q = '', esc = false;
            const numRe = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;
            const bareRe = /[A-Za-z_$]|[^\x00-\x7F]/;

            while (i < src.length) {
                const ch = src[i];
                if (inStr) {
                    out += ch;
                    if (esc) esc = false;
                    else if (ch === '\\') esc = true;
                    else if (ch === q) { inStr = false; q = ''; }
                    i++;
                    continue;
                }
                if (ch === '"' || ch === "'") { inStr = true; q = ch; out += ch; i++; continue; }
                if (ch === ':') {
                    out += ch; i++;
                    let j = i;
                    while (j < src.length && /\s/.test(src[j])) { out += src[j]; j++; }
                    if (j >= src.length || !bareRe.test(src[j])) { i = j; continue; }
                    let k = j;
                    while (k < src.length && !/[,}\]\s:]/.test(src[k])) k++;
                    const tok = src.slice(j, k), low = tok.toLowerCase();
                    if (low === 'true' || low === 'false' || low === 'null' || numRe.test(tok)) {
                        out += tok;
                    } else {
                        out += `"${tok.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
                    }
                    i = k;
                    continue;
                }
                out += ch; i++;
            }
            return out;
        };

        const attempt = (src) => {
            try {
                const parsed = JSON.parse(src);
                return processStructuredData(parsed);
            } catch {
                return false;
            }
        };

        if (attempt(s)) return true;
        const relaxed = relaxJson(s);
        return relaxed !== s && attempt(relaxed);
    };

    // 尝试 TOML 解析
    const tryParseToml = (text) => {
        const src = String(text || '').trim();
        if (!src || !src.includes('[') || !src.includes('=')) return false;

        try {
            const parseVal = (raw) => {
                const v = String(raw ?? '').trim();
                if (v === 'true') return true;
                if (v === 'false') return false;
                if (/^-?\d+$/.test(v)) return parseInt(v, 10);
                if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
                if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
                    const inner = v.slice(1, -1);
                    return v.startsWith('"')
                        ? inner.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, '\\')
                        : inner;
                }
                if (v.startsWith('[') && v.endsWith(']')) {
                    try { return JSON.parse(v.replace(/'/g, '"')); } catch { return v; }
                }
                return v;
            };

            const L = src.split(/\r?\n/);
            let i = 0, curOp = '';

            while (i < L.length) {
                let line = L[i].trim();
                i++;
                if (!line || line.startsWith('#')) continue;

                const sec = line.match(/\[\s*([^\]]+)\s*\]$/);
                if (sec) {
                    curOp = normalizeOpName(sec[1]) || '';
                    continue;
                }
                if (!curOp) continue;

                const kv = line.match(/^([^=]+)=(.*)$/);
                if (!kv) continue;

                const keyRaw = kv[1].trim();
                const rhsRaw = kv[2];
                const hasTriple = rhsRaw.includes('"""') || rhsRaw.includes("'''");
                const rhs = hasTriple ? rhsRaw : stripYamlInlineComment(rhsRaw);
                const cleaned = stripQ(keyRaw);
                const { directives, remainder, original } = extractDirectiveInfo(cleaned);
                const core = remainder || original || cleaned;
                const segs = core.split('.').map(seg => stripQ(String(seg).trim())).filter(Boolean);

                if (!segs.length) continue;

                const top = segs[0];
                const rest = segs.slice(1);
                const relNorm = norm(rest.join('.'));

                if (directives && directives.length) {
                    recordGuardDirective(norm(segs.join('.')), directives);
                }

                if (!hasTriple) {
                    const value = parseVal(rhs);
                    if (curOp === 'set') putSet(top, relNorm, value);
                    else if (curOp === 'push') putPush(top, relNorm, value);
                    else if (curOp === 'bump') putBump(top, relNorm, value);
                    else if (curOp === 'del') putDel(top, relNorm || norm(segs.join('.')));
                }
            }
            return true;
        } catch {
            return false;
        }
    };

    // 尝试 JSON/TOML
    if (tryParseJson(textForJsonToml)) return finalizeResults();
    if (tryParseToml(textForJsonToml)) return finalizeResults();

    // YAML 解析
    let curOp = '';
    const stack = [];

    const readList = (startIndex, parentIndent) => {
        const out = [];
        let i = startIndex;
        for (; i < lines.length; i++) {
            const raw = lines[i];
            const t = raw.trim();
            if (!t) continue;
            const ind = indentOf(raw);
            if (ind <= parentIndent) break;
            const m = t.match(/^-+\s*(.+)$/);
            if (m) out.push(stripQ(stripYamlInlineComment(m[1])));
            else break;
        }
        return { arr: out, next: i - 1 };
    };

    const readBlockScalar = (startIndex, parentIndent, ch) => {
        const out = [];
        let i = startIndex;
        for (; i < lines.length; i++) {
            const raw = lines[i];
            const t = raw.trimEnd();
            const tt = raw.trim();
            const ind = indentOf(raw);

            if (!tt) { out.push(''); continue; }
            if (ind <= parentIndent) {
                const isKey = /^[^\s-][^:]*:\s*(?:\||>.*|.*)?$/.test(tt);
                const isListSibling = tt.startsWith('- ');
                const isTopOp = (parentIndent === 0) && TOP_OP_RE.test(tt);
                if (isKey || isListSibling || isTopOp) break;
                out.push(t);
                continue;
            }
            out.push(raw.slice(parentIndent + 2));
        }

        let text = out.join('\n');
        if (text.startsWith('\n')) text = text.slice(1);
        if (ch === '>') text = text.replace(/\n(?!\n)/g, ' ');
        return { text, next: i - 1 };
    };

    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const t = raw.trim();
        if (!t || t.startsWith('#')) continue;

        const ind = indentOf(raw);
        const mTop = TOP_OP_RE.exec(t);

        if (mTop && ind === 0) {
            curOp = OP_MAP[mTop[1].toLowerCase()] || '';
            stack.length = 0;
            continue;
        }
        if (!curOp) continue;

        while (stack.length && stack[stack.length - 1].indent >= ind) {
            stack.pop();
        }

        const mKV = t.match(/^([^:]+):\s*(.*)$/);
        if (mKV) {
            const key = mKV[1].trim();
            const rhs = String(stripYamlInlineComment(mKV[2])).trim();
            const parentInfo = stack.length ? stack[stack.length - 1] : null;
            const parentPath = parentInfo ? parentInfo.path : '';
            const inheritedDirs = parentInfo?.directives || [];
            const inheritedForChildren = parentInfo?.directivesForChildren || inheritedDirs;
            const info = buildPathInfo(key, parentPath);
            const combinedDirs = [...inheritedDirs, ...info.directives];
            const nextInherited = info.directives.length ? info.directives : inheritedForChildren;
            const effectiveGuardDirs = info.directives.length ? info.directives : inheritedDirs;

            if (effectiveGuardDirs.length && info.guardTargetRaw) {
                recordGuardDirective(info.guardTargetRaw, effectiveGuardDirs);
            }

            const curPathRaw = info.curPathRaw;
            const curPath = norm(curPathRaw);
            if (!curPath) continue;

            // 块标量
            if (rhs && (rhs[0] === '|' || rhs[0] === '>')) {
                const { text, next } = readBlockScalar(i + 1, ind, rhs[0]);
                i = next;
                const [top, ...rest] = curPath.split('.');
                const rel = rest.join('.');
                if (curOp === 'set') putSet(top, rel, text);
                else if (curOp === 'push') putPush(top, rel, text);
                else if (curOp === 'bump') putBump(top, rel, Number(text));
                continue;
            }

            // 空值（嵌套对象或列表）
            if (rhs === '') {
                stack.push({
                    indent: ind,
                    path: curPath,
                    directives: combinedDirs,
                    directivesForChildren: nextInherited
                });

                let j = i + 1;
                while (j < lines.length && !lines[j].trim()) j++;

                let handledList = false;
                let hasDeeper = false;

                if (j < lines.length) {
                    const t2 = lines[j].trim();
                    const ind2 = indentOf(lines[j]);

                    if (ind2 > ind && t2) {
                        hasDeeper = true;
                        if (/^-+\s+/.test(t2)) {
                            const { arr, next } = readList(j, ind);
                            i = next;
                            const [top, ...rest] = curPath.split('.');
                            const rel = rest.join('.');
                            if (curOp === 'set') putSet(top, rel, arr);
                            else if (curOp === 'push') putPush(top, rel, arr);
                            else if (curOp === 'del') {
                                for (const item of arr) putDel(top, rel ? `${rel}.${item}` : item);
                            }
                            else if (curOp === 'bump') {
                                for (const item of arr) putBump(top, rel, Number(item));
                            }
                            stack.pop();
                            handledList = true;
                            hasDeeper = false;
                        }
                    }
                }

                if (!handledList && !hasDeeper && curOp === 'del') {
                    const [top, ...rest] = curPath.split('.');
                    const rel = rest.join('.');
                    putDel(top, rel);
                    stack.pop();
                }
                continue;
            }

            // 普通值
            const [top, ...rest] = curPath.split('.');
            const rel = rest.join('.');
            if (curOp === 'set') {
                putSet(top, rel, stripQ(rhs));
            } else if (curOp === 'push') {
                putPush(top, rel, stripQ(rhs));
            } else if (curOp === 'del') {
                const val = stripQ(rhs);
                const normRel = norm(rel);
                const segs = normRel.split('.').filter(Boolean);
                const lastSeg = segs.length > 0 ? segs[segs.length - 1] : '';
                const pathEndsWithIndex = /^\d+$/.test(lastSeg);

                if (pathEndsWithIndex) {
                    putDel(top, normRel);
                } else {
                    const target = normRel ? `${normRel}.${val}` : val;
                    putDel(top, target);
                }
            } else if (curOp === 'bump') {
                putBump(top, rel, Number(stripQ(rhs)));
            }
            continue;
        }

        // 顶层列表项（del 操作）
        const mArr = t.match(/^-+\s*(.+)$/);
        if (mArr && stack.length === 0 && curOp === 'del') {
            const rawItem = stripQ(stripYamlInlineComment(mArr[1]));
            if (rawItem) {
                const std = String(rawItem).replace(/\[(\d+)\]/g, '.$1');
                const [top, ...rest] = std.split('.');
                const rel = rest.join('.');
                if (top) putDel(top, rel);
            }
            continue;
        }

        // 嵌套列表项
        if (mArr && stack.length) {
            const curPath = stack[stack.length - 1].path;
            const [top, ...rest] = curPath.split('.');
            const rel = rest.join('.');
            const val = stripQ(stripYamlInlineComment(mArr[1]));

            if (curOp === 'set') {
                const bucket = (ops.set[top] ||= {});
                const prev = bucket[rel];
                if (Array.isArray(prev)) prev.push(val);
                else if (prev !== undefined) bucket[rel] = [prev, val];
                else bucket[rel] = [val];
            } else if (curOp === 'push') {
                putPush(top, rel, val);
            } else if (curOp === 'del') {
                putDel(top, rel ? `${rel}.${val}` : val);
            } else if (curOp === 'bump') {
                putBump(top, rel, Number(val));
            }
        }
    }

    return finalizeResults();
}

/* ============= 变量守护与规则集 ============= */

function rulesGetTable() {
    return guardianState.table || {};
}

function rulesSetTable(t) {
    guardianState.table = t || {};
}

function rulesClearCache() {
    guardianState.table = {};
    guardianState.regexCache = {};
}

function rulesLoadFromMeta() {
    try {
        const meta = getContext()?.chatMetadata || {};
        const raw = meta[LWB_RULES_KEY];
        if (raw && typeof raw === 'object') {
            rulesSetTable(deepClone(raw));
            // 重建正则缓存
            for (const [p, node] of Object.entries(guardianState.table)) {
                if (node?.constraints?.regex?.source) {
                    const src = node.constraints.regex.source;
                    const flg = node.constraints.regex.flags || '';
                    try {
                        guardianState.regexCache[p] = new RegExp(src, flg);
                    } catch {}
                }
            }
        } else {
            rulesSetTable({});
        }
    } catch {
        rulesSetTable({});
    }
}

function rulesSaveToMeta() {
    try {
        const meta = getContext()?.chatMetadata || {};
        meta[LWB_RULES_KEY] = deepClone(guardianState.table || {});
        guardianState.lastMetaSyncAt = Date.now();
        getContext()?.saveMetadataDebounced?.();
    } catch {}
}

export function guardBypass(on) {
    guardianState.bypass = !!on;
}

function getRootValue(rootName) {
    try {
        const raw = getLocalVariable(rootName);
        if (raw == null) return undefined;
        if (typeof raw === 'string') {
            const s = raw.trim();
            if (s && (s[0] === '{' || s[0] === '[')) {
                try { return JSON.parse(s); } catch { return raw; }
            }
            return raw;
        }
        return raw;
    } catch {
        return undefined;
    }
}

function getValueAtPath(absPath) {
    try {
        const segs = lwbSplitPathWithBrackets(absPath);
        if (!segs.length) return undefined;

        const rootName = String(segs[0]);
        let cur = getRootValue(rootName);

        if (segs.length === 1) return cur;
        if (typeof cur === 'string') {
            const s = cur.trim();
            if (s && (s[0] === '{' || s[0] === '[')) {
                try { cur = JSON.parse(s); } catch { return undefined; }
            } else {
                return undefined;
            }
        }

        for (let i = 1; i < segs.length; i++) {
            cur = cur?.[segs[i]];
            if (cur === undefined) return undefined;
        }
        return cur;
    } catch {
        return undefined;
    }
}

function typeOfValue(v) {
    if (Array.isArray(v)) return 'array';
    const t = typeof v;
    if (t === 'object' && v !== null) return 'object';
    if (t === 'number') return 'number';
    if (t === 'string') return 'string';
    if (t === 'boolean') return 'boolean';
    if (v === null) return 'null';
    return 'scalar';
}

function ensureRuleNode(path) {
    const tbl = rulesGetTable();
    const p = normalizePath(path);
    const node = tbl[p] || (tbl[p] = {
        typeLock: 'unknown',
        ro: false,
        objectPolicy: 'none',
        arrayPolicy: 'lock',
        constraints: {},
        elementConstraints: null
    });
    return node;
}

function getRuleNode(path) {
    const tbl = rulesGetTable();
    return tbl[normalizePath(path)];
}

function setTypeLockIfUnknown(path, v) {
    const n = ensureRuleNode(path);
    if (!n.typeLock || n.typeLock === 'unknown') {
        n.typeLock = typeOfValue(v);
        rulesSaveToMeta();
    }
}

function clampNumberWithConstraints(v, node) {
    let out = Number(v);
    if (!Number.isFinite(out)) return { ok: false };

    const c = node?.constraints || {};
    if (Number.isFinite(c.min)) out = Math.max(out, c.min);
    if (Number.isFinite(c.max)) out = Math.min(out, c.max);

    return { ok: true, value: out };
}

function checkStringWithConstraints(v, node) {
    const s = String(v);
    const c = node?.constraints || {};

    if (Array.isArray(c.enum) && c.enum.length) {
        if (!c.enum.includes(s)) return { ok: false };
    }

    if (c.regex && c.regex.source) {
        let re = guardianState.regexCache[normalizePath(node.__path || '')];
        if (!re) {
            try {
                re = new RegExp(c.regex.source, c.regex.flags || '');
                guardianState.regexCache[normalizePath(node.__path || '')] = re;
            } catch {}
        }
        if (re && !re.test(s)) return { ok: false };
    }

    return { ok: true, value: s };
}

function getParentPath(absPath) {
    const segs = lwbSplitPathWithBrackets(absPath);
    if (segs.length <= 1) return '';
    return segs.slice(0, -1).map(s => String(s)).join('.');
}

function getEffectiveParentNode(p) {
    let parentPath = getParentPath(p);
    while (parentPath) {
        const pNode = getRuleNode(parentPath);
        if (pNode && (pNode.objectPolicy !== 'none' || pNode.arrayPolicy !== 'lock')) {
            return pNode;
        }
        parentPath = getParentPath(parentPath);
    }
    return null;
}

/**
 * 守护验证
 */
export function guardValidate(op, absPath, payload) {
    if (guardianState.bypass) return { allow: true, value: payload };

    const p = normalizePath(absPath);
    const node = getRuleNode(p) || {
        typeLock: 'unknown',
        ro: false,
        objectPolicy: 'none',
        arrayPolicy: 'lock',
        constraints: {}
    };

    // 只读检查
    if (node.ro) return { allow: false, reason: 'ro' };

    const parentPath = getParentPath(p);
    const parentNode = parentPath ? (getEffectiveParentNode(p) || { objectPolicy: 'none', arrayPolicy: 'lock' }) : null;
    const currentValue = getValueAtPath(p);

    // 删除操作
    if (op === 'delNode') {
        if (!parentPath) return { allow: false, reason: 'no-parent' };

        const parentValue = getValueAtPath(parentPath);
        const parentIsArray = Array.isArray(parentValue);
        const pp = getRuleNode(parentPath) || { objectPolicy: 'none', arrayPolicy: 'lock' };
        const lastSeg = p.split('.').pop() || '';
        const isIndex = /^\d+$/.test(lastSeg);

        if (parentIsArray || isIndex) {
            if (!(pp.arrayPolicy === 'shrink' || pp.arrayPolicy === 'list')) {
                return { allow: false, reason: 'array-no-shrink' };
            }
            return { allow: true };
        } else {
            if (!(pp.objectPolicy === 'prune' || pp.objectPolicy === 'free')) {
                return { allow: false, reason: 'object-no-prune' };
            }
            return { allow: true };
        }
    }

    // 推入操作
    if (op === 'push') {
        const arr = getValueAtPath(p);
        if (arr === undefined) {
            const lastSeg = p.split('.').pop() || '';
            const isIndex = /^\d+$/.test(lastSeg);
            if (parentPath) {
                const parentVal = getValueAtPath(parentPath);
                const pp = parentNode || { objectPolicy: 'none', arrayPolicy: 'lock' };
                if (isIndex) {
                    if (!Array.isArray(parentVal)) return { allow: false, reason: 'parent-not-array' };
                    if (!(pp.arrayPolicy === 'grow' || pp.arrayPolicy === 'list')) {
                        return { allow: false, reason: 'array-no-grow' };
                    }
                } else {
                    if (!(pp.objectPolicy === 'ext' || pp.objectPolicy === 'free')) {
                        return { allow: false, reason: 'object-no-ext' };
                    }
                }
            }
            const nn = ensureRuleNode(p);
            nn.typeLock = 'array';
            rulesSaveToMeta();
            return { allow: true, value: payload };
        }
        if (!Array.isArray(arr)) {
            if (node.typeLock !== 'unknown' && node.typeLock !== 'array') {
                return { allow: false, reason: 'type-locked-not-array' };
            }
            return { allow: false, reason: 'not-array' };
        }
        if (!(node.arrayPolicy === 'grow' || node.arrayPolicy === 'list')) {
            return { allow: false, reason: 'array-no-grow' };
        }
        return { allow: true, value: payload };
    }

    // 增量操作
    if (op === 'bump') {
        let d = Number(payload);
        if (!Number.isFinite(d)) return { allow: false, reason: 'delta-nan' };

        if (currentValue === undefined) {
            if (parentPath) {
                const lastSeg = p.split('.').pop() || '';
                const isIndex = /^\d+$/.test(lastSeg);
                if (isIndex) {
                    if (!(parentNode && (parentNode.arrayPolicy === 'grow' || parentNode.arrayPolicy === 'list'))) {
                        return { allow: false, reason: 'array-no-grow' };
                    }
                } else {
                    if (!(parentNode && (parentNode.objectPolicy === 'ext' || parentNode.objectPolicy === 'free'))) {
                        return { allow: false, reason: 'object-no-ext' };
                    }
                }
            }
        }

        const c = node?.constraints || {};
        const step = Number.isFinite(c.step) ? Math.abs(c.step) : Infinity;
        if (isFinite(step)) {
            if (d > step) d = step;
            if (d < -step) d = -step;
        }

        const cur = Number(currentValue);
        if (!Number.isFinite(cur)) {
            const base = 0 + d;
            const cl = clampNumberWithConstraints(base, node);
            if (!cl.ok) return { allow: false, reason: 'number-constraint' };
            setTypeLockIfUnknown(p, base);
            return { allow: true, value: cl.value };
        }

        const next = cur + d;
        const clamped = clampNumberWithConstraints(next, node);
        if (!clamped.ok) return { allow: false, reason: 'number-constraint' };
        return { allow: true, value: clamped.value };
    }

    // 设置操作
    if (op === 'set') {
        const exists = currentValue !== undefined;
        if (!exists) {
            if (parentNode) {
                const lastSeg = p.split('.').pop() || '';
                const isIndex = /^\d+$/.test(lastSeg);
                if (isIndex) {
                    if (!(parentNode.arrayPolicy === 'grow' || parentNode.arrayPolicy === 'list')) {
                        return { allow: false, reason: 'array-no-grow' };
                    }
                } else {
                    if (!(parentNode.objectPolicy === 'ext' || parentNode.objectPolicy === 'free')) {
                        return { allow: false, reason: 'object-no-ext' };
                    }
                }
            }
        }

        const incomingType = typeOfValue(payload);
        if (node.typeLock !== 'unknown' && node.typeLock !== incomingType) {
            return { allow: false, reason: 'type-locked-mismatch' };
        }

        if (incomingType === 'number') {
            let incoming = Number(payload);
            if (!Number.isFinite(incoming)) return { allow: false, reason: 'number-constraint' };

            const c = node?.constraints || {};
            const step = Number.isFinite(c.step) ? Math.abs(c.step) : Infinity;
            const curNum = Number(currentValue);
            const base = Number.isFinite(curNum) ? curNum : 0;

            if (isFinite(step)) {
                let diff = incoming - base;
                if (diff > step) diff = step;
                if (diff < -step) diff = -step;
                incoming = base + diff;
            }

            const clamped = clampNumberWithConstraints(incoming, node);
            if (!clamped.ok) return { allow: false, reason: 'number-constraint' };
            setTypeLockIfUnknown(p, incoming);
            return { allow: true, value: clamped.value };
        }

        if (incomingType === 'string') {
            const n2 = { ...node, __path: p };
            const ok = checkStringWithConstraints(payload, n2);
            if (!ok.ok) return { allow: false, reason: 'string-constraint' };
            setTypeLockIfUnknown(p, payload);
            return { allow: true, value: ok.value };
        }

        setTypeLockIfUnknown(p, payload);
        return { allow: true, value: payload };
    }

    return { allow: true, value: payload };
}

/**
 * 应用规则增量
 */
export function applyRuleDelta(path, delta) {
    const p = normalizePath(path);

    if (delta?.clear) {
        try {
            const tbl = rulesGetTable();
            if (tbl && Object.prototype.hasOwnProperty.call(tbl, p)) {
                delete tbl[p];
            }
            if (guardianState?.regexCache) {
                delete guardianState.regexCache[p];
            }
        } catch {}
    }

    const hasOther = !!(delta && (
        delta.ro ||
        delta.objectPolicy ||
        delta.arrayPolicy ||
        (delta.constraints && Object.keys(delta.constraints).length)
    ));

    if (hasOther) {
        const node = ensureRuleNode(p);
        if (delta.ro) node.ro = true;
        if (delta.objectPolicy) node.objectPolicy = delta.objectPolicy;
        if (delta.arrayPolicy) node.arrayPolicy = delta.arrayPolicy;

        if (delta.constraints) {
            const c = node.constraints || {};
            if (delta.constraints.min != null) c.min = Number(delta.constraints.min);
            if (delta.constraints.max != null) c.max = Number(delta.constraints.max);
            if (delta.constraints.enum) c.enum = delta.constraints.enum.slice();
            if (delta.constraints.regex) {
                c.regex = {
                    source: delta.constraints.regex.source,
                    flags: delta.constraints.regex.flags || ''
                };
                try {
                    guardianState.regexCache[p] = new RegExp(c.regex.source, c.regex.flags || '');
                } catch {}
            }
            if (delta.constraints.step != null) {
                c.step = Math.max(0, Math.abs(Number(delta.constraints.step)));
            }
            node.constraints = c;
        }
    }

    rulesSaveToMeta();
}

/**
 * 从树加载规则
 */
export function rulesLoadFromTree(valueTree, basePath) {
    const isObj = v => v && typeof v === 'object' && !Array.isArray(v);

    function stripDollarKeysDeep(val) {
        if (Array.isArray(val)) return val.map(stripDollarKeysDeep);
        if (isObj(val)) {
            const out = {};
            for (const k in val) {
                if (!Object.prototype.hasOwnProperty.call(val, k)) continue;
                if (String(k).trim().startsWith('$')) continue;
                out[k] = stripDollarKeysDeep(val[k]);
            }
            return out;
        }
        return val;
    }

    const rulesDelta = {};

    function walk(node, curAbs) {
        if (!isObj(node)) return;

        for (const key in node) {
            if (!Object.prototype.hasOwnProperty.call(node, key)) continue;
            const v = node[key];
            const keyStr = String(key).trim();

            if (!keyStr.startsWith('$')) {
                const childPath = curAbs ? `${curAbs}.${keyStr}` : keyStr;
                if (isObj(v)) walk(v, childPath);
                continue;
            }

            const rest = keyStr.slice(1).trim();
            if (!rest) continue;
            const parts = rest.split(/\s+/).filter(Boolean);
            if (!parts.length) continue;

            const targetToken = parts.pop();
            const dirs = parts.map(t =>
                String(t).trim().startsWith('$') ? String(t).trim() : ('$' + String(t).trim())
            );

            const baseNorm = normalizePath(curAbs || '');
            const tokenNorm = normalizePath(targetToken);
            const targetPath = (baseNorm && (tokenNorm === baseNorm || tokenNorm.startsWith(baseNorm + '.')))
                ? tokenNorm
                : (curAbs ? `${curAbs}.${targetToken}` : targetToken);
            const absPath = normalizePath(targetPath);
            const delta = parseDirectivesTokenList(dirs);

            if (!rulesDelta[absPath]) rulesDelta[absPath] = {};
            Object.assign(rulesDelta[absPath], delta);

            if (isObj(v)) walk(v, absPath);
        }
    }

    walk(valueTree, basePath || '');

    const cleanValue = stripDollarKeysDeep(valueTree);
    return { cleanValue, rulesDelta };
}

/**
 * 应用规则增量表
 */
export function applyRulesDeltaToTable(delta) {
    if (!delta || typeof delta !== 'object') return;
    for (const [p, d] of Object.entries(delta)) {
        applyRuleDelta(p, d);
    }
    rulesSaveToMeta();
}

/**
 * 安装变量 API 补丁
 */
function installVariableApiPatch() {
    try {
        const ctx = getContext();
        const api = ctx?.variables?.local;
        if (!api || guardianState.origVarApi) return;

        guardianState.origVarApi = {
            set: api.set?.bind(api),
            add: api.add?.bind(api),
            inc: api.inc?.bind(api),
            dec: api.dec?.bind(api),
            del: api.del?.bind(api)
        };

        if (guardianState.origVarApi.set) {
            api.set = (name, value) => {
                try {
                    if (guardianState.bypass) return guardianState.origVarApi.set(name, value);

                    let finalValue = value;
                    if (value && typeof value === 'object' && !Array.isArray(value)) {
                        const hasRuleKey = Object.keys(value).some(k => k.startsWith('$'));
                        if (hasRuleKey) {
                            const { cleanValue, rulesDelta } = rulesLoadFromTree(value, normalizePath(name));
                            finalValue = cleanValue;
                            applyRulesDeltaToTable(rulesDelta);
                        }
                    }

                    const res = guardValidate('set', normalizePath(name), finalValue);
                    if (!res.allow) return;
                    return guardianState.origVarApi.set(name, res.value);
                } catch {
                    return;
                }
            };
        }

        if (guardianState.origVarApi.add) {
            api.add = (name, delta) => {
                try {
                    if (guardianState.bypass) return guardianState.origVarApi.add(name, delta);

                    const res = guardValidate('bump', normalizePath(name), delta);
                    if (!res.allow) return;

                    const cur = Number(getValueAtPath(normalizePath(name)));
                    if (!Number.isFinite(cur)) {
                        return guardianState.origVarApi.set(name, res.value);
                    }

                    const next = res.value;
                    const diff = Number(next) - cur;
                    return guardianState.origVarApi.add(name, diff);
                } catch {
                    return;
                }
            };
        }

        if (guardianState.origVarApi.inc) {
            api.inc = (name) => api.add?.(name, 1);
        }

        if (guardianState.origVarApi.dec) {
            api.dec = (name) => api.add?.(name, -1);
        }

        if (guardianState.origVarApi.del) {
            api.del = (name) => {
                try {
                    if (guardianState.bypass) return guardianState.origVarApi.del(name);

                    const res = guardValidate('delNode', normalizePath(name));
                    if (!res.allow) return;
                    return guardianState.origVarApi.del(name);
                } catch {
                    return;
                }
            };
        }
    } catch {}
}

/**
 * 卸载变量 API 补丁
 */
function uninstallVariableApiPatch() {
    try {
        const ctx = getContext();
        const api = ctx?.variables?.local;
        if (!api || !guardianState.origVarApi) return;

        if (guardianState.origVarApi.set) api.set = guardianState.origVarApi.set;
        if (guardianState.origVarApi.add) api.add = guardianState.origVarApi.add;
        if (guardianState.origVarApi.inc) api.inc = guardianState.origVarApi.inc;
        if (guardianState.origVarApi.dec) api.dec = guardianState.origVarApi.dec;
        if (guardianState.origVarApi.del) api.del = guardianState.origVarApi.del;

        guardianState.origVarApi = null;
    } catch {}
}

/* ============= 快照/回滚 ============= */

function getSnapMap() {
    const meta = getContext()?.chatMetadata || {};
    if (!meta[LWB_SNAP_KEY]) meta[LWB_SNAP_KEY] = {};
    return meta[LWB_SNAP_KEY];
}

function getVarDict() {
    const meta = getContext()?.chatMetadata || {};
    return deepClone(meta.variables || {});
}

function setVarDict(dict) {
    try {
        guardBypass(true);
        const ctx = getContext();
        const meta = ctx?.chatMetadata || {};
        const current = meta.variables || {};
        const next = dict || {};

        // 清除不存在的变量
        for (const k of Object.keys(current)) {
            if (!(k in next)) {
                try { delete current[k]; } catch {}
                try { setLocalVariable(k, ''); } catch {}
            }
        }

        // 设置新值
        for (const [k, v] of Object.entries(next)) {
            let toStore = v;
            if (v && typeof v === 'object') {
                try { toStore = JSON.stringify(v); } catch { toStore = ''; }
            }
            try { setLocalVariable(k, toStore); } catch {}
        }

        meta.variables = deepClone(next);
        getContext()?.saveMetadataDebounced?.();
    } catch {} finally {
        guardBypass(false);
    }
}

function cloneRulesTableForSnapshot() {
    try {
        const table = rulesGetTable();
        if (!table || typeof table !== 'object') return {};
        return deepClone(table);
    } catch {
        return {};
    }
}

function applyRulesSnapshot(tableLike) {
    const safe = (tableLike && typeof tableLike === 'object') ? tableLike : {};
    rulesSetTable(deepClone(safe));

    if (guardianState?.regexCache) guardianState.regexCache = {};

    try {
        for (const [p, node] of Object.entries(guardianState.table || {})) {
            const c = node?.constraints?.regex;
            if (c && c.source) {
                try {
                    guardianState.regexCache[p] = new RegExp(c.source, c.flags || '');
                } catch {}
            }
        }
    } catch {}

    rulesSaveToMeta();
}

function normalizeSnapshotRecord(raw) {
    if (!raw || typeof raw !== 'object') return { vars: {}, rules: {} };
    if (Object.prototype.hasOwnProperty.call(raw, 'vars') || Object.prototype.hasOwnProperty.call(raw, 'rules')) {
        return {
            vars: (raw.vars && typeof raw.vars === 'object') ? raw.vars : {},
            rules: (raw.rules && typeof raw.rules === 'object') ? raw.rules : {}
        };
    }
    return { vars: raw, rules: {} };
}

function setSnapshot(messageId, snapDict) {
    if (messageId == null || messageId < 0) return;
    const snaps = getSnapMap();
    snaps[messageId] = deepClone(snapDict || {});
    getContext()?.saveMetadataDebounced?.();
}

function getSnapshot(messageId) {
    if (messageId == null || messageId < 0) return undefined;
    const snaps = getSnapMap();
    const snap = snaps[messageId];
    if (!snap) return undefined;
    return deepClone(snap);
}

function clearSnapshotsFrom(startIdInclusive) {
    if (startIdInclusive == null) return;
    try {
        guardBypass(true);
        const snaps = getSnapMap();
        for (const k of Object.keys(snaps)) {
            const id = Number(k);
            if (!Number.isNaN(id) && id >= startIdInclusive) {
                delete snaps[k];
            }
        }
        getContext()?.saveMetadataDebounced?.();
    } finally {
        guardBypass(false);
    }
}

function snapshotCurrentLastFloor() {
    try {
        const ctx = getContext();
        const chat = ctx?.chat || [];
        const lastId = chat.length ? chat.length - 1 : -1;
        if (lastId < 0) return;

        const dict = getVarDict();
        const rules = cloneRulesTableForSnapshot();
        setSnapshot(lastId, { vars: dict, rules });
    } catch {}
}

function snapshotPreviousFloor() {
    snapshotCurrentLastFloor();
}

function snapshotForMessageId(currentId) {
    try {
        if (typeof currentId !== 'number' || currentId < 0) return;
        const dict = getVarDict();
        const rules = cloneRulesTableForSnapshot();
        setSnapshot(currentId, { vars: dict, rules });
    } catch {}
}

function rollbackToPreviousOf(messageId) {
    const id = Number(messageId);
    if (Number.isNaN(id)) return;

    const prevId = id - 1;
    if (prevId < 0) return;

    const snap = getSnapshot(prevId);
    if (snap) {
        const normalized = normalizeSnapshotRecord(snap);
        try {
            guardBypass(true);
            setVarDict(normalized.vars || {});
            applyRulesSnapshot(normalized.rules || {});
        } finally {
            guardBypass(false);
        }
    }
}

function rebuildVariablesFromScratch() {
    try {
        setVarDict({});
        const chat = getContext()?.chat || [];
        for (let i = 0; i < chat.length; i++) {
            applyVariablesForMessage(i);
        }
    } catch {}
}

/* ============= 应用变量到消息 ============= */

/**
 * 将对象模式转换
 */
function asObject(rec) {
    if (rec.mode !== 'object') {
        rec.mode = 'object';
        rec.base = {};
        rec.next = {};
        rec.changed = true;
        delete rec.scalar;
    }
    return rec.next ?? (rec.next = {});
}

/**
 * 增量操作辅助
 */
function bumpAtPath(rec, path, delta) {
    const numDelta = Number(delta);
    if (!Number.isFinite(numDelta)) return false;

    if (!path) {
        if (rec.mode === 'scalar') {
            let base = Number(rec.scalar);
            if (!Number.isFinite(base)) base = 0;
            const next = base + numDelta;
            const nextStr = String(next);
            if (rec.scalar !== nextStr) {
                rec.scalar = nextStr;
                rec.changed = true;
                return true;
            }
        }
        return false;
    }

    const obj = asObject(rec);
    const segs = splitPathSegments(path);
    const { parent, lastKey } = ensureDeepContainer(obj, segs);
    const prev = parent?.[lastKey];

    if (Array.isArray(prev)) {
        if (prev.length === 0) {
            prev.push(numDelta);
            rec.changed = true;
            return true;
        }
        let base = Number(prev[0]);
        if (!Number.isFinite(base)) base = 0;
        const next = base + numDelta;
        if (prev[0] !== next) {
            prev[0] = next;
            rec.changed = true;
            return true;
        }
        return false;
    }

    if (prev && typeof prev === 'object') return false;

    let base = Number(prev);
    if (!Number.isFinite(base)) base = 0;
    const next = base + numDelta;
    if (prev !== next) {
        parent[lastKey] = next;
        rec.changed = true;
        return true;
    }
    return false;
}

/**
 * 解析标量数组
 */
function parseScalarArrayMaybe(str) {
    try {
        const v = JSON.parse(String(str ?? ''));
        return Array.isArray(v) ? v : null;
    } catch {
        return null;
    }
}

/**
 * 应用变量到消息
 */
async function applyVariablesForMessage(messageId) {
    try {
        const ctx = getContext();
        const msg = ctx?.chat?.[messageId];
        if (!msg) return;

        const debugOn = !!xbLog.isEnabled?.();
        const preview = (text, max = 220) => {
            try {
                const s = String(text ?? '').replace(/\s+/g, ' ').trim();
                return s.length > max ? s.slice(0, max) + '…' : s;
            } catch {
                return '';
            }
        };

        const rawKey = getMsgKey(msg);
        const rawTextForSig = rawKey ? String(msg[rawKey] ?? '') : '';
        const curSig = computePlotSignatureFromText(rawTextForSig);

        if (!curSig) {
            clearAppliedFor(messageId);
            return;
        }

        const appliedMap = getAppliedMap();
        if (appliedMap[messageId] === curSig) return;

        const raw = rawKey ? String(msg[rawKey] ?? '') : '';
        const blocks = extractPlotLogBlocks(raw);

        if (blocks.length === 0) {
            clearAppliedFor(messageId);
            return;
        }

        const ops = [];
        const delVarNames = new Set();
        let parseErrors = 0;
        let parsedPartsTotal = 0;
        let guardDenied = 0;
        const guardDeniedSamples = [];

        blocks.forEach((b, idx) => {
            let parts = [];
            try {
                parts = parseBlock(b);
            } catch (e) {
                parseErrors++;
                if (debugOn) {
                    try { xbLog.error(MODULE_ID, `plot-log 解析失败：楼层=${messageId} 块#${idx + 1} 预览=${preview(b)}`, e); } catch {}
                }
                return;
            }
            parsedPartsTotal += Array.isArray(parts) ? parts.length : 0;
            for (const p of parts) {
                if (p.operation === 'guard' && Array.isArray(p.data) && p.data.length > 0) {
                    ops.push({ operation: 'guard', data: p.data });
                    continue;
                }

                const name = p.name?.trim() || `varevent_${idx + 1}`;
                if (p.operation === 'setObject' && p.data && Object.keys(p.data).length) {
                    ops.push({ name, operation: 'setObject', data: p.data });
                } else if (p.operation === 'del' && Array.isArray(p.data) && p.data.length) {
                    ops.push({ name, operation: 'del', data: p.data });
                } else if (p.operation === 'push' && p.data && Object.keys(p.data).length) {
                    ops.push({ name, operation: 'push', data: p.data });
                } else if (p.operation === 'bump' && p.data && Object.keys(p.data).length) {
                    ops.push({ name, operation: 'bump', data: p.data });
                } else if (p.operation === 'delVar') {
                    delVarNames.add(name);
                }
            }
        });

        if (ops.length === 0 && delVarNames.size === 0) {
            if (debugOn) {
                try {
                    xbLog.warn(
                        MODULE_ID,
                        `plot-log 未产生可执行指令：楼层=${messageId} 块数=${blocks.length} 解析条目=${parsedPartsTotal} 解析失败=${parseErrors} 预览=${preview(blocks[0])}`
                    );
                } catch {}
            }
            setAppliedSignature(messageId, curSig);
            return;
        }

        // 构建变量记录
        const byName = new Map();

        for (const { name } of ops) {
            if (!name || typeof name !== 'string') continue;
            const { root } = getRootAndPath(name);

            if (!byName.has(root)) {
                const curRaw = getLocalVariable(root);
                const obj = maybeParseObject(curRaw);
                if (obj) {
                    byName.set(root, { mode: 'object', base: obj, next: { ...obj }, changed: false });
                } else {
                    byName.set(root, { mode: 'scalar', scalar: (curRaw ?? ''), changed: false });
                }
            }
        }

        const norm = (p) => String(p || '').replace(/\[(\d+)\]/g, '.$1');

        // 执行操作
        for (const op of ops) {
            // 守护指令
            if (op.operation === 'guard') {
                for (const entry of op.data) {
                    const path = typeof entry?.path === 'string' ? entry.path.trim() : '';
                    const tokens = Array.isArray(entry?.directives)
                        ? entry.directives.map(t => String(t || '').trim()).filter(Boolean)
                        : [];

                    if (!path || !tokens.length) continue;

                    try {
                        const delta = parseDirectivesTokenList(tokens);
                        if (delta) {
                            applyRuleDelta(normalizePath(path), delta);
                        }
                    } catch {}
                }
                rulesSaveToMeta();
                continue;
            }

            const { root, subPath } = getRootAndPath(op.name);
            const rec = byName.get(root);
            if (!rec) continue;

            // SET 操作
            if (op.operation === 'setObject') {
                for (const [k, v] of Object.entries(op.data)) {
                    const localPath = joinPath(subPath, k);
                    const absPath = localPath ? `${root}.${localPath}` : root;
                    const stdPath = normalizePath(absPath);

                    let allow = true;
                    let newVal = parseValueForSet(v);

                    const res = guardValidate('set', stdPath, newVal);
                    allow = !!res?.allow;
                    if ('value' in res) newVal = res.value;

                    if (!allow) {
                        guardDenied++;
                        if (debugOn && guardDeniedSamples.length < 8) guardDeniedSamples.push({ op: 'set', path: stdPath });
                        continue;
                    }

                    if (!localPath) {
                        if (newVal !== null && typeof newVal === 'object') {
                            rec.mode = 'object';
                            rec.next = deepClone(newVal);
                            rec.changed = true;
                        } else {
                            rec.mode = 'scalar';
                            rec.scalar = String(newVal ?? '');
                            rec.changed = true;
                        }
                        continue;
                    }

                    const obj = asObject(rec);
                    if (setDeepValue(obj, norm(localPath), newVal)) rec.changed = true;
                }
            }

            // DEL 操作
            else if (op.operation === 'del') {
                const obj = asObject(rec);
                const pending = [];

                for (const key of op.data) {
                    const localPath = joinPath(subPath, key);

                        if (!localPath) {
                            const res = guardValidate('delNode', normalizePath(root));
                            if (!res?.allow) {
                                guardDenied++;
                                if (debugOn && guardDeniedSamples.length < 8) guardDeniedSamples.push({ op: 'delNode', path: normalizePath(root) });
                                continue;
                            }

                        if (rec.mode === 'scalar') {
                            if (rec.scalar !== '') { rec.scalar = ''; rec.changed = true; }
                        } else {
                            if (rec.next && (Array.isArray(rec.next) ? rec.next.length > 0 : Object.keys(rec.next || {}).length > 0)) {
                                rec.next = Array.isArray(rec.next) ? [] : {};
                                rec.changed = true;
                            }
                        }
                        continue;
                    }

                    const absPath = `${root}.${localPath}`;
                    const res = guardValidate('delNode', normalizePath(absPath));
                    if (!res?.allow) {
                        guardDenied++;
                        if (debugOn && guardDeniedSamples.length < 8) guardDeniedSamples.push({ op: 'delNode', path: normalizePath(absPath) });
                        continue;
                    }

                    const normLocal = norm(localPath);
                    const segs = splitPathSegments(normLocal);
                    const last = segs[segs.length - 1];
                    const parentKey = segs.slice(0, -1).join('.');

                    pending.push({
                        normLocal,
                        isIndex: typeof last === 'number',
                        parentKey,
                        index: typeof last === 'number' ? last : null,
                    });
                }

                // 按索引分组（倒序删除）
                const arrGroups = new Map();
                const objDeletes = [];

                for (const it of pending) {
                    if (it.isIndex) {
                        const g = arrGroups.get(it.parentKey) || [];
                        g.push(it);
                        arrGroups.set(it.parentKey, g);
                    } else {
                        objDeletes.push(it);
                    }
                }

                for (const [, list] of arrGroups.entries()) {
                    list.sort((a, b) => b.index - a.index);
                    for (const it of list) {
                        if (deleteDeepKey(obj, it.normLocal)) rec.changed = true;
                    }
                }

                for (const it of objDeletes) {
                    if (deleteDeepKey(obj, it.normLocal)) rec.changed = true;
                }
            }

            // PUSH 操作
            else if (op.operation === 'push') {
                for (const [k, vals] of Object.entries(op.data)) {
                    const localPath = joinPath(subPath, k);
                    const absPathBase = localPath ? `${root}.${localPath}` : root;

                    let incoming = Array.isArray(vals) ? vals : [vals];
                    const filtered = [];

                    for (const v of incoming) {
                        const res = guardValidate('push', normalizePath(absPathBase), v);
                        if (!res?.allow) {
                            guardDenied++;
                            if (debugOn && guardDeniedSamples.length < 8) guardDeniedSamples.push({ op: 'push', path: normalizePath(absPathBase) });
                            continue;
                        }
                        filtered.push('value' in res ? res.value : v);
                    }

                    if (filtered.length === 0) continue;

                    if (!localPath) {
                        let arrRef = null;
                        if (rec.mode === 'object') {
                            if (Array.isArray(rec.next)) {
                                arrRef = rec.next;
                            } else if (rec.next && typeof rec.next === 'object' && Object.keys(rec.next).length === 0) {
                                rec.next = [];
                                arrRef = rec.next;
                            } else if (Array.isArray(rec.base)) {
                                rec.next = [...rec.base];
                                arrRef = rec.next;
                            } else {
                                rec.next = [];
                                arrRef = rec.next;
                            }
                        } else {
                            const parsed = parseScalarArrayMaybe(rec.scalar);
                            rec.mode = 'object';
                            rec.next = parsed ?? [];
                            arrRef = rec.next;
                        }

                        let changed = false;
                        for (const v of filtered) {
                            if (!arrRef.includes(v)) { arrRef.push(v); changed = true; }
                        }
                        if (changed) rec.changed = true;
                        continue;
                    }

                    const obj = asObject(rec);
                    if (pushDeepValue(obj, norm(localPath), filtered)) rec.changed = true;
                }
            }

            // BUMP 操作
            else if (op.operation === 'bump') {
                for (const [k, delta] of Object.entries(op.data)) {
                    const num = Number(delta);
                    if (!Number.isFinite(num)) continue;

                    const localPath = joinPath(subPath, k);
                    const absPath = localPath ? `${root}.${localPath}` : root;
                    const stdPath = normalizePath(absPath);

                    let allow = true;
                    let useDelta = num;

                    const res = guardValidate('bump', stdPath, num);
                    allow = !!res?.allow;
                    if (allow && 'value' in res && Number.isFinite(res.value)) {
                        let curr;
                        try {
                            const pth = norm(localPath || '');
                            if (!pth) {
                                if (rec.mode === 'scalar') curr = Number(rec.scalar);
                            } else {
                                const segs = splitPathSegments(pth);
                                const obj = asObject(rec);
                                const { parent, lastKey } = ensureDeepContainer(obj, segs);
                                curr = parent?.[lastKey];
                            }
                        } catch {}

                        const baseNum = Number(curr);
                        const targetNum = Number(res.value);
                        useDelta = (Number.isFinite(targetNum) ? targetNum : num) - (Number.isFinite(baseNum) ? baseNum : 0);
                    }

                    if (!allow) {
                        guardDenied++;
                        if (debugOn && guardDeniedSamples.length < 8) guardDeniedSamples.push({ op: 'bump', path: stdPath });
                        continue;
                    }
                    bumpAtPath(rec, norm(localPath || ''), useDelta);
                }
            }
        }

        // 检查是否有变化
        const hasChanges = Array.from(byName.values()).some(rec => rec?.changed === true);
        if (!hasChanges && delVarNames.size === 0) {
            if (debugOn) {
                try {
                    const denied = guardDenied ? `，被规则拦截=${guardDenied}` : '';
                    xbLog.warn(
                        MODULE_ID,
                        `plot-log 指令执行后无变化：楼层=${messageId} 指令数=${ops.length}${denied} 示例=${preview(JSON.stringify(guardDeniedSamples))}`
                    );
                } catch {}
            }
            setAppliedSignature(messageId, curSig);
            return;
        }

        // 保存变量
        for (const [name, rec] of byName.entries()) {
            if (!rec.changed) continue;
            try {
                if (rec.mode === 'scalar') {
                    setLocalVariable(name, rec.scalar ?? '');
                } else {
                    setLocalVariable(name, safeJSONStringify(rec.next ?? {}));
                }
            } catch {}
        }

        // 删除变量
        if (delVarNames.size > 0) {
            try {
                for (const v of delVarNames) {
                    try { setLocalVariable(v, ''); } catch {}
                }
                const meta = ctx?.chatMetadata;
                if (meta?.variables) {
                    for (const v of delVarNames) delete meta.variables[v];
                    ctx?.saveMetadataDebounced?.();
                    ctx?.saveSettingsDebounced?.();
                }
            } catch {}
        }

        setAppliedSignature(messageId, curSig);
    } catch {}
}

/* ============= 事件处理 ============= */

function getMsgIdLoose(payload) {
    if (payload && typeof payload === 'object') {
        if (typeof payload.messageId === 'number') return payload.messageId;
        if (typeof payload.id === 'number') return payload.id;
    }
    if (typeof payload === 'number') return payload;
    const chat = getContext()?.chat || [];
    return chat.length ? chat.length - 1 : undefined;
}

function getMsgIdStrict(payload) {
    if (payload && typeof payload === 'object') {
        if (typeof payload.id === 'number') return payload.id;
        if (typeof payload.messageId === 'number') return payload.messageId;
    }
    if (typeof payload === 'number') return payload;
    return undefined;
}

function bindEvents() {
    pendingSwipeApply = new Map();
    let lastSwipedId;
    suppressUpdatedOnce = new Set();

    // 消息发送
    events?.on(event_types.MESSAGE_SENT, async () => {
        try {
            snapshotCurrentLastFloor();
            const chat = getContext()?.chat || [];
            const id = chat.length ? chat.length - 1 : undefined;
            if (typeof id === 'number') {
                await applyVariablesForMessage(id);
                applyXbGetVarForMessage(id, true);
            }
        } catch {}
    });

    // 消息接收
    events?.on(event_types.MESSAGE_RECEIVED, async (data) => {
        try {
            const id = getMsgIdLoose(data);
            if (typeof id === 'number') {
                await applyVariablesForMessage(id);
                applyXbGetVarForMessage(id, true);
                await executeQueuedVareventJsAfterTurn();
            }
        } catch {}
    });

    // 用户消息渲染
    events?.on(event_types.USER_MESSAGE_RENDERED, async (data) => {
        try {
            const id = getMsgIdLoose(data);
            if (typeof id === 'number') {
                await applyVariablesForMessage(id);
                applyXbGetVarForMessage(id, true);
                snapshotForMessageId(id);
            }
        } catch {}
    });

    // 角色消息渲染
    events?.on(event_types.CHARACTER_MESSAGE_RENDERED, async (data) => {
        try {
            const id = getMsgIdLoose(data);
            if (typeof id === 'number') {
                await applyVariablesForMessage(id);
                applyXbGetVarForMessage(id, true);
                snapshotForMessageId(id);
            }
        } catch {}
    });

    // 消息更新
    events?.on(event_types.MESSAGE_UPDATED, async (data) => {
        try {
            const id = getMsgIdLoose(data);
            if (typeof id === 'number') {
                if (suppressUpdatedOnce.has(id)) {
                    suppressUpdatedOnce.delete(id);
                    return;
                }
                await applyVariablesForMessage(id);
                applyXbGetVarForMessage(id, true);
            }
        } catch {}
    });

    // 消息编辑
    events?.on(event_types.MESSAGE_EDITED, async (data) => {
        try {
            const id = getMsgIdLoose(data);
            if (typeof id === 'number') {
                clearAppliedFor(id);
                rollbackToPreviousOf(id);

                setTimeout(async () => {
                    await applyVariablesForMessage(id);
                    applyXbGetVarForMessage(id, true);

                    try {
                        const ctx = getContext();
                        const msg = ctx?.chat?.[id];
                        if (msg) updateMessageBlock(id, msg, { rerenderMessage: true });
                    } catch {}

                    try {
                        const ctx = getContext();
                        const es = ctx?.eventSource;
                        const et = ctx?.event_types;
                        if (es?.emit && et?.MESSAGE_UPDATED) {
                            suppressUpdatedOnce.add(id);
                            await es.emit(et.MESSAGE_UPDATED, id);
                        }
                    } catch {}

                    await executeQueuedVareventJsAfterTurn();
                }, 10);
            }
        } catch {}
    });

    // 消息滑动
    events?.on(event_types.MESSAGE_SWIPED, async (data) => {
        try {
            const id = getMsgIdLoose(data);
            if (typeof id === 'number') {
                lastSwipedId = id;
                clearAppliedFor(id);
                rollbackToPreviousOf(id);

                const tId = setTimeout(async () => {
                    pendingSwipeApply.delete(id);
                    await applyVariablesForMessage(id);
                    await executeQueuedVareventJsAfterTurn();
                }, 10);

                pendingSwipeApply.set(id, tId);
            }
        } catch {}
    });

    // 消息删除
    events?.on(event_types.MESSAGE_DELETED, (data) => {
        try {
            const id = getMsgIdStrict(data);
            if (typeof id === 'number') {
                rollbackToPreviousOf(id);
                clearSnapshotsFrom(id);
                clearAppliedFrom(id);
            }
        } catch {}
    });

    // 生成开始
    events?.on(event_types.GENERATION_STARTED, (data) => {
        try {
            snapshotPreviousFloor();

            // 取消滑动延迟
            const t = (typeof data === 'string' ? data : (data?.type || '')).toLowerCase();
            if (t === 'swipe' && lastSwipedId != null) {
                const tId = pendingSwipeApply.get(lastSwipedId);
                if (tId) {
                    clearTimeout(tId);
                    pendingSwipeApply.delete(lastSwipedId);
                }
            }
        } catch {}
    });

    // 聊天切换
    events?.on(event_types.CHAT_CHANGED, () => {
        try {
            rulesClearCache();
            rulesLoadFromMeta();

            const meta = getContext()?.chatMetadata || {};
            meta[LWB_PLOT_APPLIED_KEY] = {};
            getContext()?.saveMetadataDebounced?.();
        } catch {}
    });
}

/* ============= 初始化与清理 ============= */

/**
 * 初始化模块
 */
export function initVariablesCore() {
    try { xbLog.info('variablesCore', '变量系统启动'); } catch {}
    if (initialized) return;
    initialized = true;

    // 创建事件管理器
    events = createModuleEvents(MODULE_ID);

    // 加载规则
    rulesLoadFromMeta();

    // 安装 API 补丁
    installVariableApiPatch();

    // 绑定事件
    bindEvents();

    // 挂载全局函数（供 var-commands.js 使用）
    globalThis.LWB_Guard = {
        validate: guardValidate,
        loadRules: rulesLoadFromTree,
        applyDelta: applyRuleDelta,
        applyDeltaTable: applyRulesDeltaToTable,
        save: rulesSaveToMeta,
    };
}

/**
 * 清理模块
 */
export function cleanupVariablesCore() {
    try { xbLog.info('variablesCore', '变量系统清理'); } catch {}
    if (!initialized) return;

    // 清理事件
    events?.cleanup();
    events = null;

    // 卸载 API 补丁
    uninstallVariableApiPatch();

    // 清理规则
    rulesClearCache();

    // 清理全局函数
    delete globalThis.LWB_Guard;

    // 清理守护状态
    guardBypass(false);

    initialized = false;
}

/* ============= 导出 ============= */

export {
    MODULE_ID,
    // 解析
    parseBlock,
    applyVariablesForMessage,
    extractPlotLogBlocks,
    // 快照
    snapshotCurrentLastFloor,
    snapshotForMessageId,
    rollbackToPreviousOf,
    rebuildVariablesFromScratch,
    // 规则
    rulesGetTable,
    rulesSetTable,
    rulesLoadFromMeta,
    rulesSaveToMeta,
};
