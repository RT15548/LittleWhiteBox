import { getContext } from '../../../../../../extensions.js';
import { getLocalVariable, setLocalVariable } from '../../../../../../variables.js';
import { extractStateBlocks, computeStateSignature, parseStateBlock } from './parser.js';
import { generateSemantic } from './semantic.js';
import { validate, setRule, loadRulesFromMeta, saveRulesToMeta } from './guard.js';

/**
 * =========================
 * Path / JSON helpers
 * =========================
 */
function splitPath(path) {
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
            segs.push(/^\d+$/.test(val.trim()) ? Number(val.trim()) : val.trim());
        } else {
            buf += ch;
            i++;
        }
    }
    if (buf) segs.push(/^\d+$/.test(buf) ? Number(buf) : buf);
    return segs;
}

function normalizePath(path) {
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
    try { return structuredClone(obj); } catch {
        try { return JSON.parse(JSON.stringify(obj)); } catch { return obj; }
    }
}

/**
 * =========================
 * Variable getters/setters (local vars)
 * =========================
 */
function getVar(path) {
    const segs = splitPath(path);
    if (!segs.length) return undefined;

    const rootRaw = getLocalVariable(String(segs[0]));
    if (segs.length === 1) return safeParse(rootRaw);

    let obj = safeParse(rootRaw);
    if (!obj || typeof obj !== 'object') return undefined;

    for (let i = 1; i < segs.length; i++) {
        obj = obj?.[segs[i]];
        if (obj === undefined) return undefined;
    }
    return obj;
}

function setVar(path, value) {
    const segs = splitPath(path);
    if (!segs.length) return;

    const rootName = String(segs[0]);

    if (segs.length === 1) {
        const toStore = (value && typeof value === 'object') ? safeJSON(value) : String(value ?? '');
        setLocalVariable(rootName, toStore);
        return;
    }

    let root = safeParse(getLocalVariable(rootName));
    if (!root || typeof root !== 'object') {
        root = typeof segs[1] === 'number' ? [] : {};
    }

    let cur = root;
    for (let i = 1; i < segs.length - 1; i++) {
        const key = segs[i];
        const nextKey = segs[i + 1];
        if (cur[key] == null || typeof cur[key] !== 'object') {
            cur[key] = typeof nextKey === 'number' ? [] : {};
        }
        cur = cur[key];
    }
    cur[segs[segs.length - 1]] = value;

    setLocalVariable(rootName, safeJSON(root));
}

function delVar(path) {
    const segs = splitPath(path);
    if (!segs.length) return;

    const rootName = String(segs[0]);

    if (segs.length === 1) {
        setLocalVariable(rootName, '');
        return;
    }

    let root = safeParse(getLocalVariable(rootName));
    if (!root || typeof root !== 'object') return;

    let cur = root;
    for (let i = 1; i < segs.length - 1; i++) {
        cur = cur?.[segs[i]];
        if (!cur || typeof cur !== 'object') return;
    }

    const lastKey = segs[segs.length - 1];
    if (Array.isArray(cur) && typeof lastKey === 'number') {
        cur.splice(lastKey, 1);
    } else {
        delete cur[lastKey];
    }

    setLocalVariable(rootName, safeJSON(root));
}

function pushVar(path, value) {
    const segs = splitPath(path);
    if (!segs.length) return { ok: false, reason: 'invalid-path' };

    const rootName = String(segs[0]);

    if (segs.length === 1) {
        let arr = safeParse(getLocalVariable(rootName));
        // ✅ 类型检查：必须是数组或不存在
        if (arr !== undefined && !Array.isArray(arr)) {
            return { ok: false, reason: 'not-array' };
        }
        if (!Array.isArray(arr)) arr = [];
        const items = Array.isArray(value) ? value : [value];
        arr.push(...items);
        setLocalVariable(rootName, safeJSON(arr));
        return { ok: true };
    }

    let root = safeParse(getLocalVariable(rootName));
    if (!root || typeof root !== 'object') {
        root = typeof segs[1] === 'number' ? [] : {};
    }

    let cur = root;
    for (let i = 1; i < segs.length - 1; i++) {
        const key = segs[i];
        const nextKey = segs[i + 1];
        if (cur[key] == null || typeof cur[key] !== 'object') {
            cur[key] = typeof nextKey === 'number' ? [] : {};
        }
        cur = cur[key];
    }

    const lastKey = segs[segs.length - 1];
    let arr = cur[lastKey];

    // ✅ 类型检查：必须是数组或不存在
    if (arr !== undefined && !Array.isArray(arr)) {
        return { ok: false, reason: 'not-array' };
    }
    if (!Array.isArray(arr)) arr = [];

    const items = Array.isArray(value) ? value : [value];
    arr.push(...items);
    cur[lastKey] = arr;

    setLocalVariable(rootName, safeJSON(root));
    return { ok: true };
}

function popVar(path, value) {
    const segs = splitPath(path);
    if (!segs.length) return { ok: false, reason: 'invalid-path' };

    const rootName = String(segs[0]);
    let root = safeParse(getLocalVariable(rootName));

    if (segs.length === 1) {
        if (!Array.isArray(root)) {
            return { ok: false, reason: 'not-array' };
        }
        const toRemove = Array.isArray(value) ? value : [value];
        for (const v of toRemove) {
            const vStr = safeJSON(v);
            const idx = root.findIndex(x => safeJSON(x) === vStr);
            if (idx !== -1) root.splice(idx, 1);
        }
        setLocalVariable(rootName, safeJSON(root));
        return { ok: true };
    }

    if (!root || typeof root !== 'object') {
        return { ok: false, reason: 'not-array' };
    }

    let cur = root;
    for (let i = 1; i < segs.length - 1; i++) {
        cur = cur?.[segs[i]];
        if (!cur || typeof cur !== 'object') {
            return { ok: false, reason: 'path-not-found' };
        }
    }

    const lastKey = segs[segs.length - 1];
    let arr = cur[lastKey];

    if (!Array.isArray(arr)) {
        return { ok: false, reason: 'not-array' };
    }

    const toRemove = Array.isArray(value) ? value : [value];
    for (const v of toRemove) {
        const vStr = safeJSON(v);
        const idx = arr.findIndex(x => safeJSON(x) === vStr);
        if (idx !== -1) arr.splice(idx, 1);
    }

    setLocalVariable(rootName, safeJSON(root));
    return { ok: true };
}

/**
 * =========================
 * Storage (chat_metadata.extensions.LittleWhiteBox)
 * =========================
 */
const EXT_ID = 'LittleWhiteBox';
const ERR_VAR_NAME = 'LWB_STATE_ERRORS';
const LOG_KEY = 'stateLogV2';
const CKPT_KEY = 'stateCkptV2';


/**
 * 写入状态错误到本地变量（覆盖写入）
 */
function writeStateErrorsToLocalVar(lines) {
    try {
        const text = Array.isArray(lines) && lines.length
            ? lines.map(s => `- ${String(s)}`).join('\n')
            : '';
        setLocalVariable(ERR_VAR_NAME, text);
    } catch {}
}

function getLwbExtMeta() {
    const ctx = getContext();
    const meta = ctx?.chatMetadata || (ctx.chatMetadata = {});
    meta.extensions ||= {};
    meta.extensions[EXT_ID] ||= {};
    return meta.extensions[EXT_ID];
}

function getStateLog() {
    const ext = getLwbExtMeta();
    ext[LOG_KEY] ||= { version: 1, floors: {} };
    return ext[LOG_KEY];
}

function getCheckpointStore() {
    const ext = getLwbExtMeta();
    ext[CKPT_KEY] ||= { version: 1, every: 50, points: {} };
    return ext[CKPT_KEY];
}

function saveWalRecord(floor, signature, rules, ops) {
    const log = getStateLog();
    log.floors[String(floor)] = {
        signature: String(signature || ''),
        rules: Array.isArray(rules) ? deepClone(rules) : [],
        ops: Array.isArray(ops) ? deepClone(ops) : [],
        ts: Date.now(),
    };
    getContext()?.saveMetadataDebounced?.();
}

/**
 * checkpoint = 执行完 floor 后的全量变量+规则
 */
function saveCheckpointIfNeeded(floor) {
    const ckpt = getCheckpointStore();
    const every = Number(ckpt.every) || 50;

    // floor=0 也可以存，但一般没意义；你可按需调整
    if (floor < 0) return;
    if (every <= 0) return;
    if (floor % every !== 0) return;

    const ctx = getContext();
    const meta = ctx?.chatMetadata || {};
    const vars = deepClone(meta.variables || {});
    // 2.0 rules 存在 chatMetadata 里（guard.js 写入的位置）
    const rules = deepClone(meta.LWB_RULES_V2 || {});

    ckpt.points[String(floor)] = { vars, rules, ts: Date.now() };
    ctx?.saveMetadataDebounced?.();
}

/**
 * =========================
 * Applied signature map (idempotent)
 * =========================
 */
const LWB_STATE_APPLIED_KEY = 'LWB_STATE_APPLIED_KEY';

function getAppliedMap() {
    const meta = getContext()?.chatMetadata || {};
    meta[LWB_STATE_APPLIED_KEY] ||= {};
    return meta[LWB_STATE_APPLIED_KEY];
}

export function clearStateAppliedFor(floor) {
    try {
        delete getAppliedMap()[floor];
        getContext()?.saveMetadataDebounced?.();
    } catch {}
}

export function clearStateAppliedFrom(floorInclusive) {
    try {
        const map = getAppliedMap();
        for (const k of Object.keys(map)) {
            if (Number(k) >= floorInclusive) delete map[k];
        }
        getContext()?.saveMetadataDebounced?.();
    } catch {}
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

/**
 * =========================
 * Core: apply one message text (<state>...) => update vars + rules + wal + checkpoint
 * =========================
 */
export function applyStateForMessage(messageId, messageContent) {
    const ctx = getContext();
    const chatId = ctx?.chatId || '';

    loadRulesFromMeta();

    const text = String(messageContent ?? '');
    const signature = computeStateSignature(text);
    const blocks = extractStateBlocks(text);
    // ✅ 统一：只要没有可执行 blocks，就视为本层 state 被移除
    if (!signature || blocks.length === 0) {
        clearStateAppliedFor(messageId);
        writeStateErrorsToLocalVar([]);
        // delete WAL record
        try {
            const ext = getLwbExtMeta();
            const log = ext[LOG_KEY];
            if (log?.floors) delete log.floors[String(messageId)];
            getContext()?.saveMetadataDebounced?.();
        } catch {}
        return { atoms: [], errors: [], skipped: false };
    }

    const appliedMap = getAppliedMap();
    if (appliedMap[messageId] === signature) {
        return { atoms: [], errors: [], skipped: true };
    }
    const atoms = [];
    const errors = [];
    let idx = 0;

    const mergedRules = [];
    const mergedOps = [];

    for (const block of blocks) {
        const parsed = parseStateBlock(block);
        mergedRules.push(...(parsed?.rules || []));
        mergedOps.push(...(parsed?.ops || []));
    }

    if (blocks.length) {
        // ✅ WAL：一次写入完整的 rules/ops
        saveWalRecord(messageId, signature, mergedRules, mergedOps);

        // ✅ rules 一次性注册
        let rulesTouched = false;
        for (const { path, rule } of mergedRules) {
            if (path && rule && Object.keys(rule).length) {
                setRule(normalizePath(path), rule);
                rulesTouched = true;
            }
        }
        if (rulesTouched) saveRulesToMeta();

        const execOps = buildExecOpsWithIndexDeleteReorder(mergedOps);

        // 执行操作（用 execOps）
        for (const opItem of execOps) {
            const { path, op, value, delta, warning } = opItem;
            if (!path) continue;
            if (warning) errors.push(`[${path}] ${warning}`);

            const absPath = normalizePath(path);
            const oldValue = getVar(path);

            const guard = validate(op, absPath, op === 'inc' ? delta : value, oldValue);
            if (!guard.allow) {
                errors.push(`${path}: ${guard.reason || '\u88ab\u89c4\u5219\u62d2\u7edd'}`);
                continue;
            }

            // 记录修正信息
            if (guard.note) {
                if (op === 'inc') {
                    const raw = Number(delta);
                    const rawTxt = Number.isFinite(raw) ? `${raw >= 0 ? '+' : ''}${raw}` : String(delta ?? '');
                    errors.push(`${path}: ${rawTxt} ${guard.note}`);
                } else {
                    errors.push(`${path}: ${guard.note}`);
                }
            }

            let execOk = true;
            let execReason = '';

            try {
                switch (op) {
                    case 'set':
                        setVar(path, guard.value);
                        break;
                    case 'inc':
                        // guard.value 对 inc 是最终 nextValue
                        setVar(path, guard.value);
                        break;
                    case 'push': {
                        const result = pushVar(path, guard.value);
                        if (!result.ok) { execOk = false; execReason = result.reason; }
                        break;
                    }
                    case 'pop': {
                        const result = popVar(path, guard.value);
                        if (!result.ok) { execOk = false; execReason = result.reason; }
                        break;
                    }
                    case 'del':
                        delVar(path);
                        break;
                    default:
                        execOk = false;
                        execReason = `未知 op=${op}`;
                }
            } catch (e) {
                execOk = false;
                execReason = e?.message || String(e);
            }

            if (!execOk) {
                errors.push(`[${path}] 失败: ${execReason}`);
                continue;
            }

            const newValue = getVar(path);

            atoms.push({
                atomId: `sa-${messageId}-${idx}`,
                chatId,
                floor: messageId,
                idx,
                path,
                op,
                oldValue,
                newValue,
                delta: op === 'inc' ? delta : undefined,
                semantic: generateSemantic(path, op, oldValue, newValue, delta, value),
                timestamp: Date.now(),
            });

            idx++;
        }
    }

    appliedMap[messageId] = signature;
    getContext()?.saveMetadataDebounced?.();

    // ✅ checkpoint：执行完该楼后，可选存一次全量
    saveCheckpointIfNeeded(messageId);

    // Write error list to local variable
    writeStateErrorsToLocalVar(errors);

    return { atoms, errors, skipped: false };
}

/**
 * =========================
 * Restore / Replay (for rollback & rebuild)
 * =========================
 */

/**
 * 恢复到 targetFloor 执行完成后的变量状态（含规则）
 * - 使用最近 checkpoint，然后 replay WAL
 * - 不依赖消息文本 <state>（避免被正则清掉）
 */
export async function restoreStateV2ToFloor(targetFloor) {
    const ctx = getContext();
    const meta = ctx?.chatMetadata || {};
    const floor = Number(targetFloor);

    if (!Number.isFinite(floor) || floor < 0) {
        // floor < 0 => 清空
        meta.variables = {};
        meta.LWB_RULES_V2 = {};
        ctx?.saveMetadataDebounced?.();
        return { ok: true, usedCheckpoint: null };
    }

    const log = getStateLog();
    const ckpt = getCheckpointStore();
    const points = ckpt.points || {};
    const available = Object.keys(points)
        .map(Number)
        .filter(n => Number.isFinite(n) && n <= floor)
        .sort((a, b) => b - a);

    const ck = available.length ? available[0] : null;

    // 1) 恢复 checkpoint 或清空基线
    if (ck != null) {
        const snap = points[String(ck)];
        meta.variables = deepClone(snap?.vars || {});
        meta.LWB_RULES_V2 = deepClone(snap?.rules || {});
    } else {
        meta.variables = {};
        meta.LWB_RULES_V2 = {};
    }

    ctx?.saveMetadataDebounced?.();

    // 2) 从 meta 载入规则到内存（guard.js 的内存表）
    loadRulesFromMeta();

    let rulesTouchedAny = false;

    // 3) replay WAL: (ck+1 .. floor)
    const start = ck == null ? 0 : (ck + 1);
    for (let f = start; f <= floor; f++) {
        const rec = log.floors?.[String(f)];
        if (!rec) continue;

        // 先应用 rules
        const rules = Array.isArray(rec.rules) ? rec.rules : [];
        let touched = false;
        for (const r of rules) {
            const p = r?.path;
            const rule = r?.rule;
            if (p && rule && typeof rule === 'object') {
                setRule(normalizePath(p), rule);
                touched = true;
            }
        }
        if (touched) rulesTouchedAny = true;

        // 再应用 ops（不产出 atoms、不写 wal）
        const ops = Array.isArray(rec.ops) ? rec.ops : [];
        const execOps = buildExecOpsWithIndexDeleteReorder(ops);
        for (const opItem of execOps) {
            const path = opItem?.path;
            const op = opItem?.op;
            if (!path || !op) continue;

            const absPath = normalizePath(path);
            const oldValue = getVar(path);

            const payload = (op === 'inc') ? opItem.delta : opItem.value;
            const guard = validate(op, absPath, payload, oldValue);
            if (!guard.allow) continue;

            try {
                switch (op) {
                    case 'set':
                        setVar(path, guard.value);
                        break;
                    case 'inc':
                        setVar(path, guard.value);
                        break;
                    case 'push': {
                        const result = pushVar(path, guard.value);
                        if (!result.ok) {/* ignore */}
                        break;
                    }
                    case 'pop': {
                        const result = popVar(path, guard.value);
                        if (!result.ok) {/* ignore */}
                        break;
                    }
                    case 'del':
                        delVar(path);
                        break;
                }
            } catch {
                // ignore replay errors
            }
        }
    }

    if (rulesTouchedAny) {
        saveRulesToMeta();
    }

    // 4) 清理 applied signature：floor 之后都要重新计算
    clearStateAppliedFrom(floor + 1);

    ctx?.saveMetadataDebounced?.();
    return { ok: true, usedCheckpoint: ck };
}

/**
 * 删除 floor >= fromFloor 的 2.0 持久化数据：
 * - WAL: stateLogV2.floors
 * - checkpoint: stateCkptV2.points
 * - applied signature: LWB_STATE_APPLIED_KEY
 *
 * 用于 MESSAGE_DELETED 等“物理删除消息”场景，避免 WAL/ckpt 无限膨胀。
 */
export async function trimStateV2FromFloor(fromFloor) {
    const start = Number(fromFloor);
    if (!Number.isFinite(start)) return { ok: false };

    const ctx = getContext();
    const meta = ctx?.chatMetadata || {};
    meta.extensions ||= {};
    meta.extensions[EXT_ID] ||= {};

    const ext = meta.extensions[EXT_ID];

    // 1) WAL
    const log = ext[LOG_KEY];
    if (log?.floors && typeof log.floors === 'object') {
        for (const k of Object.keys(log.floors)) {
            const f = Number(k);
            if (Number.isFinite(f) && f >= start) {
                delete log.floors[k];
            }
        }
    }

    // 2) Checkpoints
    const ckpt = ext[CKPT_KEY];
    if (ckpt?.points && typeof ckpt.points === 'object') {
        for (const k of Object.keys(ckpt.points)) {
            const f = Number(k);
            if (Number.isFinite(f) && f >= start) {
                delete ckpt.points[k];
            }
        }
    }

    // 3) Applied signatures（floor>=start 都要重新算）
    try {
        clearStateAppliedFrom(start);
    } catch {}

    ctx?.saveMetadataDebounced?.();
    return { ok: true };
}
