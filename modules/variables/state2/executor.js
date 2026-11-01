import { generateSemantic } from './semantic.js';
import { validate, setRule, replaceRules, getRulesSnapshot } from './guard-core.js';

export const EXECUTION_ERROR = Object.freeze({
    UNMANAGED_ROOT: 'unmanaged_root',
    RULE_REJECTED: 'rule_rejected',
    OPERATION_FAILED: 'operation_failed',
});
const EXECUTION_MESSAGES = {
    unmanaged: '根变量尚未纳入变量 2.0 管理',
    rejected: '被规则拒绝',
};

export function splitPath(path) {
    const s = String(path || '');
    const segs = [];
    let buf = '';
    let i = 0;

    while (i < s.length) {
        const ch = s[i];
        if (ch === '.') {
            if (buf) { segs.push(/^\d+$/.test(buf) ? Number(buf) : buf); buf = ''; }
            i++;
        } else if (ch === '[') {
            if (buf) { segs.push(/^\d+$/.test(buf) ? Number(buf) : buf); buf = ''; }
            i++;
            let val = '';
            if (s[i] === '"' || s[i] === "'") {
                const q = s[i++];
                while (i < s.length && s[i] !== q) val += s[i++];
                i++;
            } else {
                while (i < s.length && s[i] !== ']') val += s[i++];
            }
            if (s[i] === ']') i++;
            const normalizedBracketValue = val.trim();
            if (normalizedBracketValue === '*') {
                segs.push('[*]');
            } else {
                segs.push(/^\d+$/.test(normalizedBracketValue) ? Number(normalizedBracketValue) : normalizedBracketValue);
            }
        } else {
            buf += ch;
            i++;
        }
    }
    if (buf) segs.push(/^\d+$/.test(buf) ? Number(buf) : buf);
    return segs;
}

export function normalizePath(path) {
    return splitPath(path).map(String).join('.');
}

function safeJSON(v) {
    try { return JSON.stringify(v); } catch { return ''; }
}

function safeParse(s) {
    if (s == null || s === '') return undefined;
    if (typeof s !== 'string') return s;
    const t = s.trim();
    if (!t) return undefined;
    if (t[0] === '{' || t[0] === '[') {
        try { return JSON.parse(t); } catch { return s; }
    }
    if (/^-?\d+(?:\.\d+)?$/.test(t)) return Number(t);
    if (t === 'true') return true;
    if (t === 'false') return false;
    return s;
}

function deepClone(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    try { return structuredClone(obj); } catch {
        return JSON.parse(JSON.stringify(obj));
    }
}

// Normalize only newly owned payloads and touched array slots, never an existing root.
function jsonValue(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? (value === 0 ? 0 : value) : null;
    if (typeof value === 'function' || typeof value === 'symbol') return undefined;
    if (!value || typeof value !== 'object') return value;
    if (Array.isArray(value)) {
        for (let index = 0; index < value.length; index++) value[index] = jsonValue(value[index]) ?? null;
    } else {
        for (const key of Object.keys(value)) {
            const item = jsonValue(value[key]);
            if (item === undefined) delete value[key];
            else value[key] = item;
        }
    }
    return value;
}

/**
 * =========================
 * Variable getters/setters (local vars)
 * =========================
 */

export function getRootFromPath(path) {
    return String(splitPath(path)[0] ?? '').trim();
}

function sameValue(left, right) {
    if (left === right) return true;
    if (!left || !right || typeof left !== 'object' || typeof right !== 'object'
        || Array.isArray(left) !== Array.isArray(right)) return false;
    const keys = Object.keys(left);
    const otherKeys = Object.keys(right);
    return keys.length === otherKeys.length && (!Array.isArray(left) || left.length === right.length)
        && keys.every((key, index) => key === otherKeys[index] && sameValue(left[key], right[key]));
}

export function decodeStoredVariable(value) {
    const local = value?.trim?.() === '' || isNaN(Number(value)) ? (value || '') : Number(value);
    return safeParse(local);
}

export function encodeStoredVariable(value) {
    return value && typeof value === 'object' ? safeJSON(value) : String(value ?? '');
}

function ownValue(object, key) {
    return object != null && Object.hasOwn(object, key) ? object[key] : undefined;
}

function createVariableAccess(variables, memory, trackChanges) {
    // The replay store owns decoded roots. Only host writes serialize the whole root.
    const readRoot = name => memory ? ownValue(variables, name) : decodeStoredVariable(ownValue(variables, name));
    const writeRoot = (name, value) => {
        variables[name] = memory
            ? (value && typeof value === 'object' ? value : decodeStoredVariable(encodeStoredVariable(value)))
            : encodeStoredVariable(value);
    };
    function writeMember(parent, key, value) {
        if (!memory) { parent[key] = value; return true; }
        if (Array.isArray(parent)) {
            if (key === 'length') {
                const length = parent.length;
                parent.length = value;
                for (let index = length; index < parent.length; index++) parent[index] = null;
                return true;
            }
            if (!/^(0|[1-9]\d*)$/.test(String(key)) || Number(key) >= 4294967295) return false;
            for (let index = parent.length; index < Number(key); index++) parent[index] = null;
            parent[key] = value === undefined ? null : value;
        } else if (value === undefined) {
            delete parent[key];
        } else {
            parent[key] = value;
        }
        return true;
    }
    function getVar(path) {
        const segs = splitPath(path);
        if (!segs.length) return undefined;
        let value = readRoot(String(segs[0]));
        if (segs.length > 1 && (!value || typeof value !== 'object')) return undefined;
        for (let i = 1; i < segs.length; i++) value = ownValue(value, segs[i]);
        return value;
    }

    function parentAt(segs, create) {
        const name = String(segs[0]);
        let root = readRoot(name);
        let changed = false;
        if (!root || typeof root !== 'object') {
            if (!create) return null;
            root = typeof segs[1] === 'number' ? [] : {};
            changed = true;
        }
        let parent = root;
        let attached = true;
        for (let i = 1; i < segs.length - 1; i++) {
            const key = segs[i];
            let child = ownValue(parent, key);
            if (!child || typeof child !== 'object') {
                if (!create) return null;
                child = typeof segs[i + 1] === 'number' ? [] : {};
                const written = writeMember(parent, key, child);
                changed ||= attached && written;
                attached &&= written;
            }
            parent = child;
        }
        return { name, root, parent, key: segs[segs.length - 1], changed, attached };
    }

    function setVar(path, value) {
        const segs = splitPath(path);
        if (!segs.length) return { ok: true, changed: false };
        if (segs.length === 1) {
            const name = String(segs[0]);
            const existed = Object.hasOwn(variables, name);
            const previous = trackChanges ? readRoot(name) : undefined;
            writeRoot(name, memory && value && typeof value === 'object' ? jsonValue(value) : value);
            return { ok: true, changed: trackChanges && (!existed || !sameValue(previous, readRoot(name))) };
        }
        const target = parentAt(segs, true);
        const next = memory ? jsonValue(value) : value;
        const previous = ownValue(target.parent, target.key);
        const written = writeMember(target.parent, target.key, next);
        const changed = trackChanges && (target.changed || (target.attached && written && !sameValue(previous, ownValue(target.parent, target.key))));
        writeRoot(target.name, target.root);
        return { ok: true, changed };
    }

    function delVar(path) {
        const segs = splitPath(path);
        if (!segs.length) return { ok: true, changed: false };
        if (segs.length === 1) return setVar(path, undefined);
        const target = parentAt(segs, false);
        if (!target) return { ok: true, changed: false };
        let changed;
        if (Array.isArray(target.parent) && typeof target.key === 'number') {
            changed = target.key < target.parent.length;
            target.parent.splice(target.key, 1);
        } else {
            changed = Object.hasOwn(target.parent, target.key);
            delete target.parent[target.key];
        }
        writeRoot(target.name, target.root);
        return { ok: true, changed };
    }

    function pushVar(path, value) {
        const segs = splitPath(path);
        if (!segs.length) return { ok: false, reason: 'invalid-path' };
        const target = segs.length === 1 ? null : parentAt(segs, true);
        const name = String(segs[0]);
        let array = target ? ownValue(target.parent, target.key) : readRoot(name);
        if (array !== undefined && !Array.isArray(array)) return { ok: false, reason: 'not-array' };
        const created = !Array.isArray(array);
        if (created) array = [];
        const items = Array.isArray(value) ? value : [value];
        if (memory) jsonValue(items);
        array.push(...items);
        const written = !target || writeMember(target.parent, target.key, array);
        writeRoot(name, target ? target.root : array);
        return { ok: true, changed: !!target?.changed || ((!target || target.attached) && written && (created || items.length > 0)) };
    }

    function popVar(path, value) {
        const segs = splitPath(path);
        if (!segs.length) return { ok: false, reason: 'invalid-path' };
        const name = String(segs[0]);
        if (segs.length > 1) {
            const root = readRoot(name);
            if (!root || typeof root !== 'object') return { ok: false, reason: 'not-array' };
        }
        const target = segs.length === 1 ? null : parentAt(segs, false);
        if (segs.length > 1 && !target) return { ok: false, reason: 'path-not-found' };
        const array = target ? ownValue(target.parent, target.key) : readRoot(name);
        if (!Array.isArray(array)) return { ok: false, reason: 'not-array' };
        let changed = false;
        const items = Array.isArray(value) ? value : [value];
        for (const item of items) {
            const serialized = safeJSON(item);
            const index = array.findIndex(candidate => safeJSON(candidate) === serialized);
            if (index !== -1) {
                array.splice(index, 1);
                changed = true;
            }
        }
        writeRoot(name, target ? target.root : array);
        return { ok: true, changed };
    }

    return { getVar, setVar, delVar, pushVar, popVar };
}

function isIndexDeleteOp(opItem) {
    if (!opItem || opItem.op !== 'del') return false;
    const segs = splitPath(opItem.path);
    if (!segs.length) return false;
    const last = segs[segs.length - 1];
    return typeof last === 'number' && Number.isFinite(last);
}

function buildExecOpsWithIndexDeleteReorder(ops) {
    // 同一个数组的 index-del：按 parentPath 分组，组内 index 倒序
    // 其它操作：保持原顺序
    const groups = new Map(); // parentPath -> { order, items: [{...opItem, index}] }
    const groupOrder = new Map();
    let orderCounter = 0;

    const normalOps = [];

    for (const op of ops) {
        if (isIndexDeleteOp(op)) {
            const segs = splitPath(op.path);
            const idx = segs[segs.length - 1];
            const parentPath = segs.slice(0, -1).reduce((acc, s) => {
                if (typeof s === 'number') return acc + `[${s}]`;
                return acc ? `${acc}.${s}` : String(s);
            }, '');

            if (!groups.has(parentPath)) {
                groups.set(parentPath, []);
                groupOrder.set(parentPath, orderCounter++);
            }
            groups.get(parentPath).push({ op, idx });
        } else {
            normalOps.push(op);
        }
    }

    // 按“该数组第一次出现的顺序”输出各组（可预测）
    const orderedParents = Array.from(groups.keys()).sort((a, b) => (groupOrder.get(a) ?? 0) - (groupOrder.get(b) ?? 0));

    const reorderedIndexDeletes = [];
    for (const parent of orderedParents) {
        const items = groups.get(parent) || [];
        // 关键：倒序
        items.sort((a, b) => b.idx - a.idx);
        for (const it of items) reorderedIndexDeletes.push(it.op);
    }

    // ✅ 我们把“索引删除”放在最前面执行：这样它们永远按“原索引”删
    // （避免在同一轮里先删后 push 导致索引变化）
    return [...reorderedIndexDeletes, ...normalOps];
}


function applyOperation(access, op, path, value) {
    switch (op) {
        case 'set':
        case 'inc': return access.setVar(path, value);
        case 'del': return access.delVar(path);
        case 'push': return access.pushVar(path, value);
        case 'pop': return access.popVar(path, value);
        default: return { ok: false, reason: 'unknown-operation' };
    }
}

/** Synchronous request execution. The caller owns history, persistence and notifications. */
export function executeStateOperations(meta, rules, ops, {
    ownedRoots = new Set(), claimRoots = null, floor = 0, chatId = '', atomPrefix = 'sa',
    memory = false, report = true,
} = {}) {
    const variables = meta.variables ||= {};
    const access = createVariableAccess(variables, memory, memory && report);
    replaceRules(meta.LWB_RULES_V2 || {});
    const roots = new Set();
    for (const { path, rule } of rules) {
        if (path && rule && Object.keys(rule).length) {
            setRule(normalizePath(path), rule);
            const root = getRootFromPath(path);
            roots.add(root);
            if (!claimRoots || claimRoots.has(root)) ownedRoots.add(root);
        }
    }
    if (rules.length) meta.LWB_RULES_V2 = getRulesSnapshot();

    const atoms = [];
    const changes = [];
    const errors = [];
    const corrections = [];
    const messages = [];
    const unmanaged = new Set();
    const indexedOps = ops.map((item, index) => ({ ...item, index }));
    for (const item of buildExecOpsWithIndexDeleteReorder(indexedOps)) {
        const { path, op, value, delta, warning, index } = item;
        if (!path) continue;
        const root = getRootFromPath(path);
        const failure = (code, message) => {
            if (!report) return;
            errors.push({ code, index, path, message });
            messages.push(message);
        };
        if (item.source === 'json' && !ownedRoots.has(root)) {
            unmanaged.add(index);
            if (report) failure(EXECUTION_ERROR.UNMANAGED_ROOT, `${path}: ${EXECUTION_MESSAGES.unmanaged}`);
            continue;
        }
        if (report && warning) messages.push(`[${path}] ${warning}`);
        const currentValue = access.getVar(path);
        const oldValue = report ? deepClone(currentValue) : currentValue;
        const oldRoot = report && !memory ? variables[root] : undefined;
        // Records are immutable requests; neither guard coercion nor a later push may mutate them.
        const guarded = validate(op, normalizePath(path), deepClone(op === 'inc' ? delta : value), currentValue);
        if (!guarded.allow) {
            if (report) failure(EXECUTION_ERROR.RULE_REJECTED, `${path}: ${guarded.reason || EXECUTION_MESSAGES.rejected}`);
            continue;
        }
        if (report && (guarded.note || (op !== 'inc' && safeJSON(value) !== safeJSON(guarded.value)))) {
            corrections.push({ index, path, requested: deepClone(op === 'inc' ? delta : value), value: deepClone(guarded.value), note: guarded.note || '' });
        }
        if (report && guarded.note) {
            const raw = Number(delta);
            const deltaText = Number.isFinite(raw) ? `${raw >= 0 ? '+' : ''}${raw}` : String(delta ?? '');
            messages.push(`${path}: ${op === 'inc' ? deltaText + ' ' : ''}${guarded.note}`);
        }
        let outcome;
        try {
            outcome = applyOperation(access, op, path, guarded.value);
            if (!outcome.ok) {
                if (report) failure(EXECUTION_ERROR.OPERATION_FAILED, `[${path}] 失败: ${outcome.reason}`);
                continue;
            }
        } catch (error) {
            if (report) failure(EXECUTION_ERROR.OPERATION_FAILED, `[${path}] 失败: ${error.message}`);
            continue;
        }
        roots.add(root);
        if (!claimRoots || claimRoots.has(root)) ownedRoots.add(root);
        if (!report) continue;
        const newValue = deepClone(access.getVar(path));
        const atom = {
            atomId: `${atomPrefix}-${floor}-${atoms.length}`, chatId, floor, idx: atoms.length,
            path, op, oldValue, newValue, delta: op === 'inc' ? delta : undefined,
            semantic: generateSemantic(path, op, oldValue, newValue, delta, value),
            timestamp: Date.now(),
        };
        atoms.push(atom);
        if (memory ? outcome.changed : oldRoot !== variables[root]) {
            const actualDelta = op === 'inc' ? Number(newValue) - (Number(oldValue) || 0) : undefined;
            changes.push({ ...atom, index, delta: actualDelta,
                semantic: generateSemantic(path, op, oldValue, newValue, actualDelta, guarded.value) });
        }
    }
    // Preserve request order, including rule refusals and operation failures, not derived effects.
    const acceptedOps = ops.filter((_, index) => !unmanaged.has(index));
    return { atoms, changes, errors, corrections, messages, roots, acceptedOps };
}
