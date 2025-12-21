/**
 * @file modules/variables/var-commands.js
 * @description 变量斜杠命令与宏替换，常驻模块
 */

import { getContext } from "../../../../../extensions.js";
import { getLocalVariable, setLocalVariable } from "../../../../../variables.js";
import { createModuleEvents, event_types } from "../../core/event-manager.js";
import {
    lwbSplitPathWithBrackets,
    lwbSplitPathAndValue,
    normalizePath,
    ensureDeepContainer,
    safeJSONStringify,
    maybeParseObject,
    valueToString,
    deepClone,
} from "../../core/variable-path.js";

const MODULE_ID = 'varCommands';
const TAG_RE_XBGETVAR = /\{\{xbgetvar::([^}]+)\}\}/gi;

let events = null;
let initialized = false;

function getMsgKey(msg) {
    return (typeof msg?.mes === 'string') ? 'mes'
         : (typeof msg?.content === 'string' ? 'content' : null);
}

export function parseValueForSet(value) {
    try {
        const t = String(value ?? '').trim();

        if (t.startsWith('{') || t.startsWith('[')) {
            try { return JSON.parse(t); } catch {}
        }

        const looksLikeJson = (t[0] === '{' || t[0] === '[') && /[:\],}]/.test(t);
        if (looksLikeJson && !t.includes('"') && t.includes("'")) {
            try { return JSON.parse(t.replace(/'/g, '"')); } catch {}
        }

        if (t === 'true' || t === 'false' || t === 'null') {
            return JSON.parse(t);
        }

        if (/^-?\d+(\.\d+)?$/.test(t)) {
            return JSON.parse(t);
        }

        return value;
    } catch {
        return value;
    }
}

function extractPathFromArgs(namedArgs, unnamedArgs) {
    try {
        if (namedArgs && typeof namedArgs.key === 'string' && namedArgs.key.trim()) {
            return String(namedArgs.key).trim();
        }
        const arr = Array.isArray(unnamedArgs) ? unnamedArgs : [unnamedArgs];
        const first = String(arr[0] ?? '').trim();
        const m = /^key\s*=\s*(.+)$/i.exec(first);
        return m ? m[1].trim() : first;
    } catch {
        return '';
    }
}

function hasTopLevelRuleKey(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
    return Object.keys(obj).some(k => String(k).trim().startsWith('$'));
}

function ensureAbsTargetPath(basePath, token) {
    const t = String(token || '').trim();
    if (!t) return String(basePath || '');
    const base = String(basePath || '');
    if (t === base || t.startsWith(base + '.')) return t;
    return base ? (base + '.' + t) : t;
}

function segmentsRelativeToBase(absPath, basePath) {
    const segs = lwbSplitPathWithBrackets(absPath);
    const baseSegs = lwbSplitPathWithBrackets(basePath);
    if (!segs.length || !baseSegs.length) return segs || [];
    const matches = baseSegs.every((b, i) => String(segs[i]) === String(b));
    return matches ? segs.slice(baseSegs.length) : segs;
}

function setDeepBySegments(target, segs, value) {
    let cur = target;
    for (let i = 0; i < segs.length; i++) {
        const isLast = i === segs.length - 1;
        const key = segs[i];
        if (isLast) {
            cur[key] = value;
        } else {
            const nxt = cur[key];
            if (typeof nxt === 'object' && nxt && !Array.isArray(nxt)) {
                cur = nxt;
            } else {
                cur[key] = {};
                cur = cur[key];
            }
        }
    }
}

export function lwbResolveVarPath(path) {
    try {
        const segs = lwbSplitPathWithBrackets(path);
        if (!segs.length) return '';

        const rootName = String(segs[0]);
        const rootRaw = getLocalVariable(rootName);

        if (segs.length === 1) {
            return valueToString(rootRaw);
        }

        const obj = maybeParseObject(rootRaw);
        if (!obj) return '';

        let cur = obj;
        for (let i = 1; i < segs.length; i++) {
            cur = cur?.[segs[i]];
            if (cur === undefined) return '';
        }

        return valueToString(cur);
    } catch {
        return '';
    }
}

export function replaceXbGetVarInString(s) {
    s = String(s ?? '');
    if (!s || s.indexOf('{{xbgetvar::') === -1) return s;

    TAG_RE_XBGETVAR.lastIndex = 0;
    return s.replace(TAG_RE_XBGETVAR, (_, p) => lwbResolveVarPath(p));
}

export function replaceXbGetVarInChat(chat) {
    if (!Array.isArray(chat)) return;

    for (const msg of chat) {
        try {
            const key = getMsgKey(msg);
            if (!key) continue;

            const old = String(msg[key] ?? '');
            if (old.indexOf('{{xbgetvar::') === -1) continue;

            msg[key] = replaceXbGetVarInString(old);
        } catch {}
    }
}

export function applyXbGetVarForMessage(messageId, writeback = true) {
    try {
        const ctx = getContext();
        const msg = ctx?.chat?.[messageId];
        if (!msg) return;

        const key = getMsgKey(msg);
        if (!key) return;

        const old = String(msg[key] ?? '');
        if (old.indexOf('{{xbgetvar::') === -1) return;

        const out = replaceXbGetVarInString(old);
        if (writeback && out !== old) {
            msg[key] = out;
        }
    } catch {}
}

export function parseDirectivesTokenList(tokens) {
    const out = {
        ro: false,
        objectPolicy: null,
        arrayPolicy: null,
        constraints: {},
        clear: false
    };

    for (const tok of tokens) {
        const t = String(tok || '').trim();
        if (!t) continue;

        if (t === '$ro') { out.ro = true; continue; }
        if (t === '$ext') { out.objectPolicy = 'ext'; continue; }
        if (t === '$prune') { out.objectPolicy = 'prune'; continue; }
        if (t === '$free') { out.objectPolicy = 'free'; continue; }
        if (t === '$grow') { out.arrayPolicy = 'grow'; continue; }
        if (t === '$shrink') { out.arrayPolicy = 'shrink'; continue; }
        if (t === '$list') { out.arrayPolicy = 'list'; continue; }

        if (t.startsWith('$min=')) {
            const num = Number(t.slice(5));
            if (Number.isFinite(num)) out.constraints.min = num;
            continue;
        }
        if (t.startsWith('$max=')) {
            const num = Number(t.slice(5));
            if (Number.isFinite(num)) out.constraints.max = num;
            continue;
        }
        if (t.startsWith('$range=')) {
            const m = t.match(/^\$range=\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]$/);
            if (m) {
                const a = Number(m[1]), b = Number(m[2]);
                if (Number.isFinite(a) && Number.isFinite(b)) {
                    out.constraints.min = Math.min(a, b);
                    out.constraints.max = Math.max(a, b);
                }
            }
            continue;
        }
        if (t.startsWith('$step=')) {
            const num = Number(t.slice(6));
            if (Number.isFinite(num)) {
                out.constraints.step = Math.max(0, Math.abs(num));
            }
            continue;
        }

        if (t.startsWith('$enum=')) {
            const m = t.match(/^\$enum=\{\s*([^}]+)\s*\}$/);
            if (m) {
                const vals = m[1].split(/[;；]/).map(s => s.trim()).filter(Boolean);
                if (vals.length) out.constraints.enum = vals;
            }
            continue;
        }

        if (t.startsWith('$match=')) {
            const raw = t.slice(7);
            if (raw.startsWith('/') && raw.lastIndexOf('/') > 0) {
                const last = raw.lastIndexOf('/');
                const pattern = raw.slice(1, last).replace(/\\\//g, '/');
                const flags = raw.slice(last + 1) || '';
                out.constraints.regex = { source: pattern, flags };
            }
            continue;
        }

        if (t === '$clear') { out.clear = true; continue; }
    }

    return out;
}

export function expandShorthandRuleObject(basePath, valueObj) {
    try {
        const base = String(basePath || '');
        const isObj = v => v && typeof v === 'object' && !Array.isArray(v);

        if (!isObj(valueObj)) return null;

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

        function formatPathWithBrackets(pathStr) {
            const segs = lwbSplitPathWithBrackets(String(pathStr || ''));
            let out = '';
            for (const s of segs) {
                if (typeof s === 'number') out += `[${s}]`;
                else out += out ? `.${s}` : `${s}`;
            }
            return out;
        }

        function assignDeep(dst, src) {
            for (const k in src) {
                if (!Object.prototype.hasOwnProperty.call(src, k)) continue;
                const v = src[k];
                if (v && typeof v === 'object' && !Array.isArray(v)) {
                    if (!dst[k] || typeof dst[k] !== 'object' || Array.isArray(dst[k])) {
                        dst[k] = {};
                    }
                    assignDeep(dst[k], v);
                } else {
                    dst[k] = v;
                }
            }
        }

        const rulesTop = {};
        const dataTree = {};

        function writeDataAt(relPathStr, val) {
            const abs = ensureAbsTargetPath(base, relPathStr);
            const relSegs = segmentsRelativeToBase(abs, base);
            if (relSegs.length) {
                setDeepBySegments(dataTree, relSegs, val);
            } else {
                if (val && typeof val === 'object' && !Array.isArray(val)) {
                    assignDeep(dataTree, val);
                } else {
                    dataTree['$root'] = val;
                }
            }
        }

        function walk(node, currentRelPathStr) {
            if (Array.isArray(node)) {
                const cleanedArr = node.map(stripDollarKeysDeep);
                if (currentRelPathStr) writeDataAt(currentRelPathStr, cleanedArr);
                for (let i = 0; i < node.length; i++) {
                    const el = node[i];
                    if (el && typeof el === 'object') {
                        const childRel = currentRelPathStr ? `${currentRelPathStr}.${i}` : String(i);
                        walk(el, childRel);
                    }
                }
                return;
            }

            if (!isObj(node)) {
                if (currentRelPathStr) writeDataAt(currentRelPathStr, node);
                return;
            }

            const cleaned = stripDollarKeysDeep(node);
            if (currentRelPathStr) writeDataAt(currentRelPathStr, cleaned);
            else assignDeep(dataTree, cleaned);

            for (const key in node) {
                if (!Object.prototype.hasOwnProperty.call(node, key)) continue;
                const v = node[key];
                const keyStr = String(key).trim();
                const isRule = keyStr.startsWith('$');

                if (!isRule) {
                    const childRel = currentRelPathStr ? `${currentRelPathStr}.${keyStr}` : keyStr;
                    if (v && typeof v === 'object') walk(v, childRel);
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
                const fullRelTarget = currentRelPathStr
                    ? `${currentRelPathStr}.${targetToken}`
                    : targetToken;

                const absTarget = ensureAbsTargetPath(base, fullRelTarget);
                const absDisplay = formatPathWithBrackets(absTarget);
                const ruleKey = `$ ${dirs.join(' ')} ${absDisplay}`.trim();
                rulesTop[ruleKey] = {};

                if (v !== undefined) {
                    const cleanedVal = stripDollarKeysDeep(v);
                    writeDataAt(fullRelTarget, cleanedVal);
                    if (v && typeof v === 'object') {
                        walk(v, fullRelTarget);
                    }
                }
            }
        }

        walk(valueObj, '');

        const out = {};
        assignDeep(out, rulesTop);
        assignDeep(out, dataTree);
        return out;
    } catch {
        return null;
    }
}

export function lwbAssignVarPath(path, value) {
    try {
        const segs = lwbSplitPathWithBrackets(path);
        if (!segs.length) return '';

        const rootName = String(segs[0]);
        let vParsed = parseValueForSet(value);

        if (vParsed && typeof vParsed === 'object') {
            try {
                if (globalThis.LWB_Guard?.loadRules) {
                    const res = globalThis.LWB_Guard.loadRules(vParsed, rootName);
                    if (res?.cleanValue !== undefined) vParsed = res.cleanValue;
                    if (res?.rulesDelta && typeof res.rulesDelta === 'object') {
                        if (globalThis.LWB_Guard?.applyDeltaTable) {
                            globalThis.LWB_Guard.applyDeltaTable(res.rulesDelta);
                        } else if (globalThis.LWB_Guard?.applyDelta) {
                            for (const [p, d] of Object.entries(res.rulesDelta)) {
                                globalThis.LWB_Guard.applyDelta(p, d);
                            }
                        }
                        globalThis.LWB_Guard.save?.();
                    }
                }
            } catch {}
        }

        const absPath = normalizePath(path);

        let guardOk = true;
        let guardVal = vParsed;
        try {
            if (globalThis.LWB_Guard?.validate) {
                const g = globalThis.LWB_Guard.validate('set', absPath, vParsed);
                guardOk = !!g?.allow;
                if ('value' in g) guardVal = g.value;
            }
        } catch {}

        if (!guardOk) return '';

        if (segs.length === 1) {
            if (guardVal && typeof guardVal === 'object') {
                setLocalVariable(rootName, safeJSONStringify(guardVal));
            } else {
                setLocalVariable(rootName, String(guardVal ?? ''));
            }
            return '';
        }

        const rootRaw = getLocalVariable(rootName);
        let obj;
        const parsed = maybeParseObject(rootRaw);
        if (parsed) {
            obj = deepClone(parsed);
        } else {
            // 若根变量不存在：A[0].x 这类路径期望根为数组
            obj = (typeof segs[1] === 'number') ? [] : {};
        }

        const { parent, lastKey } = ensureDeepContainer(obj, segs.slice(1));
        parent[lastKey] = guardVal;

        setLocalVariable(rootName, safeJSONStringify(obj));
        return '';
    } catch {
        return '';
    }
}

export function lwbAddVarPath(path, increment) {
    try {
        const segs = lwbSplitPathWithBrackets(path);
        if (!segs.length) return '';

        const currentStr = lwbResolveVarPath(path);
        const incStr = String(increment ?? '');

        const currentNum = Number(currentStr);
        const incNum = Number(incStr);
        const bothNumeric = currentStr !== '' && incStr !== '' 
            && Number.isFinite(currentNum) && Number.isFinite(incNum);

        const newValue = bothNumeric 
            ? (currentNum + incNum) 
            : (currentStr + incStr);

        lwbAssignVarPath(path, newValue);

        return valueToString(newValue);
    } catch {
        return '';
    }
}

/**
 * 删除变量或深层属性（支持点路径/中括号路径）
 * @param {string} path
 * @returns {string} 空字符串
 */
export function lwbDeleteVarPath(path) {
    try {
        const segs = lwbSplitPathWithBrackets(path);
        if (!segs.length) return '';

        const rootName = String(segs[0]);
        const absPath = normalizePath(path);

        // 只有根变量：对齐 /flushvar 的“清空”语义
        if (segs.length === 1) {
            try {
                if (globalThis.LWB_Guard?.validate) {
                    const g = globalThis.LWB_Guard.validate('delNode', absPath);
                    if (!g?.allow) return '';
                }
            } catch {}

            setLocalVariable(rootName, '');
            return '';
        }

        const rootRaw = getLocalVariable(rootName);
        const parsed = maybeParseObject(rootRaw);
        if (!parsed) return '';

        const obj = deepClone(parsed);
        const subSegs = segs.slice(1);

        let cur = obj;
        for (let i = 0; i < subSegs.length - 1; i++) {
            cur = cur?.[subSegs[i]];
            if (cur == null || typeof cur !== 'object') return '';
        }

        try {
            if (globalThis.LWB_Guard?.validate) {
                const g = globalThis.LWB_Guard.validate('delNode', absPath);
                if (!g?.allow) return '';
            }
        } catch {}

        const lastKey = subSegs[subSegs.length - 1];
        if (Array.isArray(cur)) {
            if (typeof lastKey === 'number' && lastKey >= 0 && lastKey < cur.length) {
                cur.splice(lastKey, 1);
            } else {
                const equal = (a, b) => a === b || a == b || String(a) === String(b);
                for (let i = cur.length - 1; i >= 0; i--) {
                    if (equal(cur[i], lastKey)) cur.splice(i, 1);
                }
            }
        } else {
            try { delete cur[lastKey]; } catch {}
        }

        setLocalVariable(rootName, safeJSONStringify(obj));
        return '';
    } catch {
        return '';
    }
}

/**
 * 向数组推入值（支持点路径/中括号路径）
 * @param {string} path
 * @param {*} value
 * @returns {string} 新数组长度（字符串）
 */
export function lwbPushVarPath(path, value) {
    try {
        const segs = lwbSplitPathWithBrackets(path);
        if (!segs.length) return '';

        const rootName = String(segs[0]);
        const absPath = normalizePath(path);
        const vParsed = parseValueForSet(value);

        // 仅根变量：将 root 视为数组
        if (segs.length === 1) {
            try {
                if (globalThis.LWB_Guard?.validate) {
                    const g = globalThis.LWB_Guard.validate('push', absPath, vParsed);
                    if (!g?.allow) return '';
                }
            } catch {}

            const rootRaw = getLocalVariable(rootName);
            let arr;
            try { arr = JSON.parse(rootRaw); } catch { arr = undefined; }
            if (!Array.isArray(arr)) arr = rootRaw != null && rootRaw !== '' ? [rootRaw] : [];
            arr.push(vParsed);
            setLocalVariable(rootName, safeJSONStringify(arr));
            return String(arr.length);
        }

        const rootRaw = getLocalVariable(rootName);
        let obj;
        const parsed = maybeParseObject(rootRaw);
        if (parsed) {
            obj = deepClone(parsed);
        } else {
            const firstSubSeg = segs[1];
            obj = typeof firstSubSeg === 'number' ? [] : {};
        }

        const { parent, lastKey } = ensureDeepContainer(obj, segs.slice(1));
        let arr = parent[lastKey];

        if (!Array.isArray(arr)) {
            arr = arr != null ? [arr] : [];
        }

        try {
            if (globalThis.LWB_Guard?.validate) {
                const g = globalThis.LWB_Guard.validate('push', absPath, vParsed);
                if (!g?.allow) return '';
            }
        } catch {}

        arr.push(vParsed);
        parent[lastKey] = arr;

        setLocalVariable(rootName, safeJSONStringify(obj));
        return String(arr.length);
    } catch {
        return '';
    }
}

function registerXbGetVarSlashCommand() {
    try {
        const ctx = getContext();
        const { SlashCommandParser, SlashCommand, SlashCommandArgument, ARGUMENT_TYPE } = ctx || {};

        if (!SlashCommandParser?.addCommandObject || !SlashCommand?.fromProps || !SlashCommandArgument?.fromProps) {
            return;
        }

        SlashCommandParser.addCommandObject(SlashCommand.fromProps({
            name: 'xbgetvar',
            returns: 'string',
            helpString: `
                <div>通过点/中括号路径获取嵌套的本地变量值</div>
                <div>支持 ["0"] 强制字符串键、[0] 数组索引</div>
                <div><strong>示例：</strong></div>
                <pre><code>/xbgetvar 人物状态.姓名</code></pre>
                <pre><code>/xbgetvar A[0].name | /echo {{pipe}}</code></pre>
            `,
            unnamedArgumentList: [
                SlashCommandArgument.fromProps({
                    description: '变量路径',
                    typeList: [ARGUMENT_TYPE.STRING],
                    isRequired: true,
                    acceptsMultiple: false,
                }),
            ],
            callback: (namedArgs, unnamedArgs) => {
                try {
                    const path = extractPathFromArgs(namedArgs, unnamedArgs);
                    return lwbResolveVarPath(String(path || ''));
                } catch {
                    return '';
                }
            },
        }));
    } catch {}
}

function registerXbSetVarSlashCommand() {
    try {
        const ctx = getContext();
        const { SlashCommandParser, SlashCommand, SlashCommandArgument, ARGUMENT_TYPE } = ctx || {};

        if (!SlashCommandParser?.addCommandObject || !SlashCommand?.fromProps || !SlashCommandArgument?.fromProps) {
            return;
        }

        function joinUnnamed(args) {
            if (Array.isArray(args)) {
                return args.filter(v => v != null).map(v => String(v)).join(' ').trim();
            }
            return String(args ?? '').trim();
        }

        function splitTokensBySpace(s) {
            return String(s || '').split(/\s+/).filter(Boolean);
        }

        function isDirectiveToken(tok) {
            const t = String(tok || '').trim();
            if (!t) return false;
            if (['$ro', '$ext', '$prune', '$free', '$grow', '$shrink', '$list', '$clear'].includes(t)) {
                return true;
            }
            if (/^\$(min|max|range|enum|match|step)=/.test(t)) {
                return true;
            }
            return false;
        }

        function parseKeyAndValue(namedArgs, unnamedArgs) {
            const unnamedJoined = joinUnnamed(unnamedArgs);
            const hasNamedKey = typeof namedArgs?.key === 'string' && namedArgs.key.trim().length > 0;

            if (hasNamedKey) {
                const keyRaw = namedArgs.key.trim();
                const keyParts = splitTokensBySpace(keyRaw);

                if (keyParts.length > 1 && keyParts.every((p, i) =>
                    isDirectiveToken(p) || i === keyParts.length - 1
                )) {
                    const directives = keyParts.slice(0, -1);
                    const realPath = keyParts[keyParts.length - 1];
                    return { directives, realPath, valueText: unnamedJoined };
                }

                if (isDirectiveToken(keyRaw)) {
                    const m = unnamedJoined.match(/^\S+/);
                    const realPath = m ? m[0] : '';
                    const valueText = realPath ? unnamedJoined.slice(realPath.length).trim() : '';
                    return { directives: [keyRaw], realPath, valueText };
                }

                return { directives: [], realPath: keyRaw, valueText: unnamedJoined };
            }

            const firstRaw = joinUnnamed(unnamedArgs);
            if (!firstRaw) return { directives: [], realPath: '', valueText: '' };

            const sp = lwbSplitPathAndValue(firstRaw);
            let head = String(sp.path || '').trim();
            let rest = String(sp.value || '').trim();
            const parts = splitTokensBySpace(head);

            if (parts.length > 1 && parts.every((p, i) =>
                isDirectiveToken(p) || i === parts.length - 1
            )) {
                const directives = parts.slice(0, -1);
                const realPath = parts[parts.length - 1];
                return { directives, realPath, valueText: rest };
            }

            if (isDirectiveToken(head)) {
                const m = rest.match(/^\S+/);
                const realPath = m ? m[0] : '';
                const valueText = realPath ? rest.slice(realPath.length).trim() : '';
                return { directives: [head], realPath, valueText };
            }

            return { directives: [], realPath: head, valueText: rest };
        }

        SlashCommandParser.addCommandObject(SlashCommand.fromProps({
            name: 'xbsetvar',
            returns: 'string',
            helpString: `
                <div>设置嵌套本地变量</div>
                <div>支持指令前缀：$ro, $min=, $max=, $list 等</div>
                <div><strong>示例：</strong></div>
                <pre><code>/xbsetvar A.B.C 123</code></pre>
                <pre><code>/xbsetvar key="$list 情节小结" ["item1"]</code></pre>
            `,
            unnamedArgumentList: [
                SlashCommandArgument.fromProps({
                    description: '变量路径或(指令 + 路径)',
                    typeList: [ARGUMENT_TYPE.STRING],
                    isRequired: true,
                    acceptsMultiple: false,
                }),
                SlashCommandArgument.fromProps({
                    description: '要设置的值',
                    typeList: [ARGUMENT_TYPE.STRING],
                    isRequired: false,
                    acceptsMultiple: false,
                }),
            ],
            callback: (namedArgs, unnamedArgs) => {
                try {
                    const parsed = parseKeyAndValue(namedArgs, unnamedArgs);
                    const directives = parsed.directives || [];
                    const realPath = String(parsed.realPath || '').trim();
                    let rest = String(parsed.valueText || '').trim();

                    if (!realPath) return '';

                    if (directives.length > 0 && globalThis.LWB_Guard?.applyDelta) {
                        const delta = parseDirectivesTokenList(directives);
                        const absPath = normalizePath(realPath);
                        globalThis.LWB_Guard.applyDelta(absPath, delta);
                        globalThis.LWB_Guard.save?.();
                    }

                    let toSet = rest;
                    try {
                        const parsedVal = parseValueForSet(rest);
                        if (parsedVal && typeof parsedVal === 'object' && !Array.isArray(parsedVal)) {
                            const expanded = expandShorthandRuleObject(realPath, parsedVal);
                            if (expanded && typeof expanded === 'object') {
                                toSet = safeJSONStringify(expanded) || rest;
                            }
                        }
                    } catch {}

                    lwbAssignVarPath(realPath, toSet);
                    return '';
                } catch {
                    return '';
                }
            },
        }));
    } catch {}
}

function registerXbAddVarSlashCommand() {
    try {
        const ctx = getContext();
        const { SlashCommandParser, SlashCommand, SlashCommandArgument, SlashCommandNamedArgument, ARGUMENT_TYPE } = ctx || {};

        if (!SlashCommandParser?.addCommandObject || !SlashCommand?.fromProps || !SlashCommandArgument?.fromProps) {
            return;
        }

        SlashCommandParser.addCommandObject(SlashCommand.fromProps({
            name: 'xbaddvar',
            returns: 'string',
            helpString: `
                <div>通过点路径增加变量值</div>
                <div>两者都为数字时执行加法，否则执行字符串拼接</div>
                <div><strong>示例：</strong></div>
                <pre><code>/xbaddvar key=人物状态.金币 100</code></pre>
                <pre><code>/xbaddvar A.B.count 1</code></pre>
                <pre><code>/xbaddvar 名字 _后缀</code></pre>
            `,
            namedArgumentList: [
                SlashCommandNamedArgument.fromProps({
                    name: 'key',
                    description: '变量路径',
                    typeList: [ARGUMENT_TYPE.STRING],
                    isRequired: false,
                }),
            ],
            unnamedArgumentList: [
                SlashCommandArgument.fromProps({
                    description: '路径+增量 或 仅增量',
                    typeList: [ARGUMENT_TYPE.STRING],
                    isRequired: true,
                }),
            ],
            callback: (namedArgs, unnamedArgs) => {
                try {
                    let path, increment;

                    const unnamedJoined = Array.isArray(unnamedArgs)
                        ? unnamedArgs.filter(v => v != null).map(String).join(' ').trim()
                        : String(unnamedArgs ?? '').trim();

                    if (namedArgs?.key && String(namedArgs.key).trim()) {
                        path = String(namedArgs.key).trim();
                        increment = unnamedJoined;
                    } else {
                        const sp = lwbSplitPathAndValue(unnamedJoined);
                        path = sp.path;
                        increment = sp.value;
                    }

                    if (!path) return '';

                    return lwbAddVarPath(path, increment);
                } catch {
                    return '';
                }
            },
        }));
    } catch {}
}

function registerXbDelVarSlashCommand() {
    try {
        const ctx = getContext();
        const { SlashCommandParser, SlashCommand, SlashCommandArgument, ARGUMENT_TYPE } = ctx || {};

        if (!SlashCommandParser?.addCommandObject || !SlashCommand?.fromProps || !SlashCommandArgument?.fromProps) {
            return;
        }

        SlashCommandParser.addCommandObject(SlashCommand.fromProps({
            name: 'xbdelvar',
            returns: 'string',
            helpString: `
                <div>删除变量或深层属性</div>
                <div><strong>示例：</strong></div>
                <pre><code>/xbdelvar 临时变量</code></pre>
                <pre><code>/xbdelvar 角色状态.临时buff</code></pre>
                <pre><code>/xbdelvar 背包[0]</code></pre>
            `,
            unnamedArgumentList: [
                SlashCommandArgument.fromProps({
                    description: '变量路径',
                    typeList: [ARGUMENT_TYPE.STRING],
                    isRequired: true,
                }),
            ],
            callback: (namedArgs, unnamedArgs) => {
                try {
                    const path = extractPathFromArgs(namedArgs, unnamedArgs);
                    if (!path) return '';
                    return lwbDeleteVarPath(path);
                } catch {
                    return '';
                }
            },
        }));
    } catch {}
}

function registerXbPushVarSlashCommand() {
    try {
        const ctx = getContext();
        const { SlashCommandParser, SlashCommand, SlashCommandArgument, SlashCommandNamedArgument, ARGUMENT_TYPE } = ctx || {};

        if (!SlashCommandParser?.addCommandObject || !SlashCommand?.fromProps || !SlashCommandArgument?.fromProps) {
            return;
        }

        SlashCommandParser.addCommandObject(SlashCommand.fromProps({
            name: 'xbpushvar',
            returns: 'string',
            helpString: `
                <div>向数组推入值</div>
                <div>返回新数组长度</div>
                <div><strong>示例：</strong></div>
                <pre><code>/xbpushvar key=背包 苹果</code></pre>
                <pre><code>/xbpushvar 角色.技能列表 火球术</code></pre>
            `,
            namedArgumentList: [
                SlashCommandNamedArgument.fromProps({
                    name: 'key',
                    description: '数组路径',
                    typeList: [ARGUMENT_TYPE.STRING],
                    isRequired: false,
                }),
            ],
            unnamedArgumentList: [
                SlashCommandArgument.fromProps({
                    description: '路径+值 或 仅值',
                    typeList: [ARGUMENT_TYPE.STRING],
                    isRequired: true,
                }),
            ],
            callback: (namedArgs, unnamedArgs) => {
                try {
                    let path, value;

                    const unnamedJoined = Array.isArray(unnamedArgs)
                        ? unnamedArgs.filter(v => v != null).map(String).join(' ').trim()
                        : String(unnamedArgs ?? '').trim();

                    if (namedArgs?.key && String(namedArgs.key).trim()) {
                        path = String(namedArgs.key).trim();
                        value = unnamedJoined;
                    } else {
                        const sp = lwbSplitPathAndValue(unnamedJoined);
                        path = sp.path;
                        value = sp.value;
                    }

                    if (!path) return '';
                    return lwbPushVarPath(path, value);
                } catch {
                    return '';
                }
            },
        }));
    } catch {}
}

function onMessageRendered(data) {
    try {
        if (globalThis.LWB_Guard?.validate) return;

        const id = typeof data === 'object' && data !== null
            ? (data.messageId ?? data.id ?? data)
            : data;

        if (typeof id === 'number') {
            applyXbGetVarForMessage(id, true);
        }
    } catch {}
}

export function initVarCommands() {
    if (initialized) return;
    initialized = true;

    events = createModuleEvents(MODULE_ID);

    registerXbGetVarSlashCommand();
    registerXbSetVarSlashCommand();
    registerXbAddVarSlashCommand();
    registerXbDelVarSlashCommand();
    registerXbPushVarSlashCommand();

    events.on(event_types.USER_MESSAGE_RENDERED, onMessageRendered);
    events.on(event_types.CHARACTER_MESSAGE_RENDERED, onMessageRendered);
    events.on(event_types.MESSAGE_UPDATED, onMessageRendered);
    events.on(event_types.MESSAGE_EDITED, onMessageRendered);
    events.on(event_types.MESSAGE_SWIPED, onMessageRendered);
}

export function cleanupVarCommands() {
    if (!initialized) return;

    events?.cleanup();
    events = null;

    initialized = false;
}

export {
    MODULE_ID,
};
