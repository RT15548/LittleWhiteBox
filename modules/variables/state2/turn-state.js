import { parseJsonInput } from './json-input.js';
import { readRecord, readRecords, writeRecord, prefixDigests } from './records.js';
import { calculateRebuild, publishRebuild } from './rebuild.js';

// One replaceable submission per selected swipe. Ordinary API calls and body
// initialization never acquire this marker and are never targets of rollback.
const TURN_SCOPE = 'turn';
const ERRORS = {
    invalid_turn_target: '只能更新最后一条 AI 回复的当前 swipe',
    stale_turn_target: '目标回复或变量已变化，请重新更新变量',
    duplicate_turn_record: '本楼存在重复的变量提交记录',
};
function fail(code) { throw Object.assign(new Error(ERRORS[code]), { code }); }

export function createTurnStateApi({ context, prepare, save, receipt, notify }) {
    return function beginTurn({ floor, swipeId } = {}) {
        const ctx = context();
        const message = ctx?.chat?.[floor];
        if (!ctx?.chatId || !message || floor !== ctx.chat.length - 1 || message.is_user || message.is_system
            || swipeId !== (message.swipe_id ?? 0)) fail('invalid_turn_target');
        const runtime = prepare(ctx, context);
        const records = readRecords(ctx.chat);
        const previous = readRecord(message);
        const indices = (previous?.entries || []).flatMap((entry, index) => entry.scope === TURN_SCOPE ? [index] : []);
        if (indices.length > 1) fail('duplicate_turn_record');
        const slot = indices[0] ?? (previous?.entries.length || 0);
        const empty = { kind: 'call', source: 'json', scope: TURN_SCOPE, roots: [], ops: [] };
        // No submission on THIS floor means no rollback, not a search backwards.
        if (indices.length && previous.entries[slot].ops.length) {
            records[floor] = { ...previous, entries: previous.entries.map((entry, index) => index === slot ? empty : entry) };
            const rebuilt = calculateRebuild(ctx, records, runtime.roots);
            writeRecord(message, rebuilt.records[floor]);
            publishRebuild(ctx.chatMetadata, rebuilt);
            runtime.roots = rebuilt.roots;
            save(ctx, context);
        }
        // Only the submission's durable slot survives refresh; the in-flight
        // request and stale-result check exist for this call only.
        const identity = [ctx.chatId, ctx.characterId, ctx.groupId];
        const chat = ctx.chat, metadata = ctx.chatMetadata;
        const body = message.mes;
        const signature = () => JSON.stringify([
            prefixDigests(readRecords(chat)).at(-1),
            metadata.variables, metadata.LWB_RULES_V2,
        ]);
        const baseline = signature();
        let committed = false;
        function assertCurrent() {
            const current = context();
            if (committed || current?.chat !== chat || current.chatMetadata !== metadata
                || JSON.stringify([current.chatId, current.characterId, current.groupId]) !== JSON.stringify(identity)
                || current.chat.length - 1 !== floor || current.chat[floor] !== message
                || (message.swipe_id ?? 0) !== swipeId || message.mes !== body || signature() !== baseline) fail('stale_turn_target');
        }
        return {
            assertCurrent,
            commit(input) {
                const ops = parseJsonInput(input);
                assertCurrent();
                const entry = { ...empty, ops };
                const next = readRecords(ctx.chat);
                const current = next[floor] || { v: 1, entries: [] };
                const entries = current.entries.slice();
                entries[slot] = entry;
                next[floor] = { ...current, entries };
                const rebuilt = calculateRebuild(ctx, next, runtime.roots, entry);
                const result = receipt(rebuilt.result);
                // A rejected replacement leaves the already-rolled-back state
                // intact; never publish a partial new submission.
                if (result.errors.length) return { ...result, status: 'failed', changes: [], corrections: [] };
                writeRecord(message, rebuilt.records[floor]);
                publishRebuild(ctx.chatMetadata, rebuilt);
                runtime.roots = rebuilt.roots;
                committed = true;
                save(ctx, context);
                notify(result, floor, rebuilt.result.changes);
                return result;
            },
        };
    };
}
