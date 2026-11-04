import { bodyBlocks, readRecord, writeRecord, deriveEntryRoots } from './records.js';
import { decodeStoredVariable, getRootFromPath } from './executor.js';

export const LEGACY_CONVERSION_ERROR = 'legacy_conversion_failed';
const MESSAGE = '旧变量记录转换失败，原记录已保留';
const OPERATIONS = new Set(['set', 'inc', 'push', 'pop', 'del']);

function conversionError(cause) {
    return Object.assign(new Error(MESSAGE, { cause }), { code: LEGACY_CONVERSION_ERROR });
}

const validPath = item => item && typeof item.path === 'string' && item.path.trim();

function validateRules(rules) {
    for (const item of rules) {
        if (!validPath(item) || !item.rule || typeof item.rule !== 'object' || Array.isArray(item.rule)) {
            throw new Error('invalid_legacy_rule');
        }
    }
}

function validateEntry(old) {
    if (!old || !Array.isArray(old.ops) || !Array.isArray(old.rules) || typeof old.signature !== 'string') {
        throw new Error('invalid_legacy_record');
    }
    validateRules(old.rules);
    for (const item of old.ops) {
        if (!validPath(item) || !OPERATIONS.has(item.op)
            || (item.op === 'inc' && !Number.isFinite(item.delta))
            || (['set', 'push', 'pop'].includes(item.op) && !Object.hasOwn(item, 'value'))) {
            throw new Error('invalid_legacy_operation');
        }
    }
}

/** Released v1 body sync erased floor-zero call WAL, but left its checkpoint and rule claims. */
function stageInitialCheckpoint(ctx, log, replacements) {
    const message = ctx.chat[0];
    if (!message || Object.hasOwn(log.floors, '0') || replacements.has(message) || readRecord(message)) return;
    const store = ctx.chatMetadata.extensions.LittleWhiteBox.stateCkptV2;
    if (store?.version !== 1) return;
    const isObject = value => value && typeof value === 'object' && !Array.isArray(value);
    if (!isObject(store.points)) throw new Error('invalid_legacy_checkpoint');
    if (!Object.hasOwn(store.points, '0')) return;
    const initial = store.points['0'];
    if (!isObject(initial) || !isObject(initial.vars) || !isObject(initial.rules)) {
        throw new Error('invalid_legacy_checkpoint');
    }
    const rules = Object.entries(initial.rules).map(([path, rule]) => ({ path, rule: structuredClone(rule) }));
    validateRules(rules);
    const claimedRules = rules.filter(({ rule }) => Object.keys(rule).length);
    const roots = [...new Set(claimedRules.map(({ path }) => getRootFromPath(path)))];
    if (roots.some(root => !root)) throw new Error('invalid_legacy_checkpoint');
    if (!roots.length) return;
    // A later WAL claim cannot turn an unrelated native snapshot value into an initial request.
    const ops = roots.filter(root => Object.hasOwn(initial.vars, root)).map(root => ({
        path: root, op: 'set', source: 'text',
        value: decodeStoredVariable(structuredClone(initial.vars[root])) ?? '',
    }));
    // Checkpoint values were already admitted. Restore them before rules, especially readonly ones.
    replacements.set(message, { v: 1, entries: [
        { kind: 'call', source: 'text', blocks: [], rules: [], ops, roots },
        { kind: 'call', source: 'text', blocks: [], rules: claimedRules, ops: [], roots },
    ] });
}

/** Deployed v1 requests only. Retire when importing v1 archives is no longer supported. */
export function stageLegacyLog(ctx) {
    const log = ctx.chatMetadata?.extensions?.LittleWhiteBox?.stateLogV2;
    if (!log) return null;
    try {
        if (log.version !== 1 || !log.floors || typeof log.floors !== 'object' || Array.isArray(log.floors)) {
            throw new Error('unsupported_state_log');
        }
        const replacements = new Map();
        for (const [key, old] of Object.entries(log.floors)) {
            const floor = Number(key);
            if (!Number.isInteger(floor) || floor < 0) throw new Error('invalid_floor');
            if (floor >= ctx.chat.length) continue;
            if (readRecord(ctx.chat[floor])) continue;
            validateEntry(old);
            const entry = {
                kind: 'text', blocks: bodyBlocks(old.signature).map(block => block.digest),
                rules: structuredClone(old.rules),
                ops: structuredClone(old.ops).map(op => ({ ...op, source: 'text' })),
            };
            // Production stored successful-operation/rule ownership, including explicit empty scope.
            // Its older missing/non-array-roots fallback derives scope from all requests.
            entry.roots = Array.isArray(old.roots)
                ? old.roots.map(String).filter(Boolean)
                : [...deriveEntryRoots(entry)];
            replacements.set(ctx.chat[floor], { v: 1, entries: [entry] });
        }
        stageInitialCheckpoint(ctx, log, replacements);
        return replacements;
    } catch (cause) {
        throw conversionError(cause);
    }
}

/** Publish a validated conversion; staging also supplies a read-only view for input deduplication. */
export function convertLegacyLog(ctx, replacements = stageLegacyLog(ctx)) {
    if (!replacements) return false;
    try {
        for (const [message, record] of replacements) writeRecord(message, record);
        const ext = ctx.chatMetadata.extensions.LittleWhiteBox;
        delete ext.stateLogV2;
        delete ext.stateCkptV2;
        delete ctx.chatMetadata.LWB_STATE_APPLIED_KEY;
        return true;
    } catch (cause) {
        throw conversionError(cause);
    }
}
