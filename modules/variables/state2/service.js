import { getContext } from '../../../../../../extensions.js';
import { parseJsonInput, publicOperationName, StateInputError } from './json-input.js';
import { executeStateOperations } from './executor.js';
import { replaceRules } from './guard-core.js';
import { bodyBlocks, readRecord, readRecords, writeRecord, ownedRoots, bodyUpdate, parseEntry, withEntry } from './records.js';
import { convertLegacyLog, stageLegacyLog, LEGACY_CONVERSION_ERROR } from './legacy-log.js';
import { calculateRebuild, publishRebuild, refreshLiveCheckpoint } from './rebuild.js';

export const SERVICE_ERROR = Object.freeze({
    NO_CHAT: 'no_chat', INVALID_FLOOR: 'invalid_floor',
    NOTIFY_FAILED: 'notification_failed', SAVE_FAILED: 'save_failed',
    LEGACY_CONVERSION_FAILED: LEGACY_CONVERSION_ERROR,
});
const MESSAGES = {
    [SERVICE_ERROR.NO_CHAT]: '请先打开有消息的聊天',
    [SERVICE_ERROR.INVALID_FLOOR]: '目标消息不存在',
    [SERVICE_ERROR.NOTIFY_FAILED]: '变量已更新，但更新通知未完成',
    [SERVICE_ERROR.SAVE_FAILED]: '变量已更新，但聊天保存未完成',
};
const ERROR_VAR = 'LWB_STATE_ERRORS';
let runtimes = new WeakMap();
let pendingSave;

function chatIdentity(ctx) {
    return JSON.stringify([ctx?.chatId, ctx?.characterId, ctx?.groupId]);
}

function reportSaveFailure(error) {
    console.error('[state2]', MESSAGES[SERVICE_ERROR.SAVE_FAILED], error);
    globalThis.toastr?.error(MESSAGES[SERVICE_ERROR.SAVE_FAILED]);
}

function flushSave() {
    if (!pendingSave) return;
    const pending = pendingSave;
    pendingSave = undefined;
    clearTimeout(pending.timer);
    const current = pending.context();
    if (current?.chat !== pending.ctx.chat || chatIdentity(current) !== pending.identity) {
        reportSaveFailure(new Error('chat_changed_before_save'));
        return;
    }
    try { Promise.resolve(current.saveChat()).catch(reportSaveFailure); }
    catch (error) { reportSaveFailure(error); }
}

function scheduleSave(ctx, context = getContext) {
    const identity = chatIdentity(ctx);
    if (pendingSave && (pendingSave.ctx.chat !== ctx.chat || pendingSave.identity !== identity)) flushSave();
    if (pendingSave) clearTimeout(pendingSave.timer);
    pendingSave = { ctx, identity, context, timer: setTimeout(flushSave, 1000) };
}

export function cleanupStateService() {
    flushSave();
    runtimes = new WeakMap();
}

function prepare(ctx, context = getContext, legacy) {
    if (!ctx?.chatMetadata || !Array.isArray(ctx.chat)) throw Object.assign(new Error(MESSAGES[SERVICE_ERROR.NO_CHAT]), { code: SERVICE_ERROR.NO_CHAT });
    if (convertLegacyLog(ctx, legacy)) scheduleSave(ctx, context);
    const identity = chatIdentity(ctx);
    let runtime = runtimes.get(ctx.chat);
    if (!runtime || runtime.identity !== identity) {
        runtime = { identity, roots: ownedRoots(readRecords(ctx.chat)) };
        runtimes.set(ctx.chat, runtime);
    }
    return runtime;
}

export function openStateChat(ctx = getContext()) {
    if (!ctx?.chatMetadata || !Array.isArray(ctx.chat)) return;
    const runtime = prepare(ctx);
    runtime.roots = ownedRoots(readRecords(ctx.chat));
}

function assertFloor(ctx, floor) {
    if (!ctx?.chatId || !ctx?.chat?.length) throw Object.assign(new Error(MESSAGES[SERVICE_ERROR.NO_CHAT]), { code: SERVICE_ERROR.NO_CHAT });
    if (!Number.isInteger(floor) || !ctx.chat[floor]) throw Object.assign(new Error(MESSAGES[SERVICE_ERROR.INVALID_FLOOR]), { code: SERVICE_ERROR.INVALID_FLOOR });
}

function emptyExecution() {
    return { atoms: [], changes: [], corrections: [], errors: [], messages: [], acceptedOps: [], roots: new Set() };
}

function legacyResult(result, skipped = false) {
    return { atoms: result.atoms, errors: result.messages, skipped };
}

function recordErrors(ctx, messages) {
    (ctx.chatMetadata.variables ||= {})[ERROR_VAR] = messages.map(message => `- ${message}`).join('\n');
}

function isExpectedError(error) {
    return error instanceof StateInputError || Object.values(SERVICE_ERROR).includes(error?.code);
}

function jsonResult(result) {
    const status = result.changes.length ? (result.errors.length ? 'partial' : 'success') : (result.errors.length ? 'failed' : 'noop');
    // Construct the detached receipt before publication; observers receive only execution objects.
    return structuredClone({
        status,
        changes: result.changes.map(({ index, path, op, oldValue, newValue, delta }) => ({
            index, path, op: publicOperationName(op), oldValue, newValue, ...(op === 'inc' ? { delta } : {}),
        })),
        corrections: result.corrections, errors: result.errors, warnings: [],
    });
}

/** Stage execution, admitted history and the caller's result before publishing any of them. */
function commitEntry(ctx, floor, entry, replaceBody, context, makeResult = legacyResult) {
    const runtime = prepare(ctx, context);
    const records = readRecords(ctx.chat);
    const staged = {
        variables: { ...ctx.chatMetadata.variables },
        LWB_RULES_V2: structuredClone(ctx.chatMetadata.LWB_RULES_V2 || {}),
        extensions: { ...ctx.chatMetadata.extensions, LittleWhiteBox: { ...ctx.chatMetadata.extensions?.LittleWhiteBox } },
    };
    let outcome;
    try {
        let record;
        let roots;
        if (replaceBody || floor !== ctx.chat.length - 1) {
            records[floor] = withEntry(records[floor], entry, replaceBody);
            // Replay performs intake at the new entry's actual position, using that same execution
            // both for the reported result and for the requests that may enter the record.
            const rebuilt = calculateRebuild(ctx, records, runtime.roots, entry);
            outcome = rebuilt.result || emptyExecution();
            record = rebuilt.records[floor];
            roots = rebuilt.roots;
            publishRebuild(staged, rebuilt);
        } else {
            outcome = executeStateOperations(staged, entry.rules || [], entry.ops, { ownedRoots: new Set(runtime.roots), floor, chatId: ctx.chatId });
            records[floor] = withEntry(records[floor], { ...entry, ops: outcome.acceptedOps });
            record = records[floor];
            roots = ownedRoots(records);
            refreshLiveCheckpoint({ ...ctx, chatMetadata: staged }, records, roots);
        }
        const result = makeResult(outcome);
        recordErrors({ chatMetadata: staged }, outcome.messages);
        // All fallible execution and receipt construction is complete before publication.
        writeRecord(ctx.chat[floor], record);
        ctx.chatMetadata.variables = staged.variables;
        ctx.chatMetadata.LWB_RULES_V2 = staged.LWB_RULES_V2;
        ctx.chatMetadata.extensions = staged.extensions;
        runtime.roots = roots;
        scheduleSave(ctx, context);
        return { outcome, result };
    } finally {
        replaceRules(ctx.chatMetadata.LWB_RULES_V2 || {});
    }
}

export function applyStateForMessage(floor, text, ctx = getContext()) {
    try {
        assertFloor(ctx, floor);
        const legacy = stageLegacyLog(ctx);
        const previous = readRecord(ctx.chat[floor]) || legacy?.get(ctx.chat[floor]);
        const update = bodyUpdate(previous, bodyBlocks(String(text ?? '')));
        // Use the staged historical boundary, but publish no conversion until new input is valid.
        const entry = update.kind === 'unchanged' ? null : parseEntry(update.blocks);
        prepare(ctx, getContext, legacy);
        if (update.kind === 'unchanged') return legacyResult(emptyExecution(), true);
        return commitEntry(ctx, floor, entry, update.kind === 'replace', getContext).result;
    } catch (error) {
        if (!isExpectedError(error)) throw error;
        return { atoms: [], errors: [error.message], skipped: false };
    }
}

export function rebuildStateV2(ctx = getContext()) {
    const runtime = prepare(ctx);
    const rebuilt = calculateRebuild(ctx, readRecords(ctx.chat), runtime.roots);
    publishRebuild(ctx.chatMetadata, rebuilt);
    runtime.roots = rebuilt.roots;
    scheduleSave(ctx);
    return { ok: true, usedCheckpoint: rebuilt.usedCheckpoint };
}

export function handleStateSwipe(floor, ctx = getContext(), selection) {
    assertFloor(ctx, floor);
    const legacy = stageLegacyLog(ctx);
    const message = ctx.chat[floor];
    const isNew = !selection && Number.isInteger(message.swipe_id) && message.swipe_id >= (message.swipes?.length || 0);
    const records = readRecords(ctx.chat).map((record, index) => record || legacy?.get(ctx.chat[index]));
    if (selection) records[floor] = readRecord(selection);
    let entry;
    if (isNew) records[floor] = undefined;
    else if (!records[floor]) {
        const blocks = bodyBlocks((selection || message).mes ?? message.content ?? '');
        if (blocks.length) entry = parseEntry(blocks);
    }
    const runtime = prepare(ctx, getContext, legacy);
    if (entry) records[floor] = withEntry(undefined, entry);
    const rebuilt = calculateRebuild(ctx, records, runtime.roots, entry);
    writeRecord(message, rebuilt.records[floor]);
    publishRebuild(ctx.chatMetadata, rebuilt);
    runtime.roots = rebuilt.roots;
    scheduleSave(ctx);
    return legacyResult(rebuilt.result || emptyExecution());
}

export function handleStateSwipeDeleted({ messageId, newSwipeId }, ctx = getContext()) {
    const message = ctx.chat?.[messageId];
    if (!message || !Number.isInteger(newSwipeId)) return;
    // 1.14 loads the selected swipe before this event; 1.18 loads it afterwards.
    // Only copy our record, never overwrite another module's live extras.
    return handleStateSwipe(messageId, ctx, {
        mes: message.swipes[newSwipeId], extra: message.swipe_info?.[newSwipeId]?.extra,
    });
}

export function createStateApi({ context = getContext, notify = () => {} } = {}) {
    function sendNotification(result, floor, atoms) {
        if (!atoms.length) return;
        try { notify({ messageId: floor, atoms }); }
        catch (error) {
            result.warnings.push({ code: SERVICE_ERROR.NOTIFY_FAILED, message: MESSAGES[SERVICE_ERROR.NOTIFY_FAILED], detail: String(error?.message || error) });
        }
    }
    function apply(input) {
        try {
            const ops = parseJsonInput(input);
            const ctx = context();
            const floor = (ctx?.chat?.length || 0) - 1;
            assertFloor(ctx, floor);
            const { outcome, result } = commitEntry(ctx, floor, { kind: 'call', source: 'json', roots: [], ops }, false, context, jsonResult);
            sendNotification(result, floor, outcome.changes);
            return result;
        } catch (error) {
            if (!isExpectedError(error)) throw error;
            const detail = error instanceof StateInputError ? error.toJSON() : { code: error.code, message: error.message };
            return { status: 'failed', changes: [], corrections: [], errors: [detail], warnings: [] };
        }
    }
    function applyText(text, options = {}) {
        try {
            const ctx = context();
            const floor = options.floor ?? (ctx?.chat?.length || 0) - 1;
            assertFloor(ctx, floor);
            const blocks = bodyBlocks(String(text ?? ''));
            const entry = parseEntry(blocks, 'call');
            prepare(ctx, context);
            if (!blocks.length) return legacyResult(emptyExecution(), true);
            const previous = readRecord(ctx.chat[floor]);
            const signature = JSON.stringify(entry.blocks);
            const bodySignature = JSON.stringify((previous?.entries || []).filter(item => item.kind === 'text').flatMap(item => item.blocks));
            // The preserved text adapter is content-idempotent, including the shared body/call
            // identity in deployed logs. Compare the complete continued body, not one fragment.
            if (bodySignature === signature || previous?.entries.some(item => item.kind === 'call' && item.source === 'text' && JSON.stringify(item.blocks) === signature)) {
                return legacyResult(emptyExecution(), true);
            }
            const { result } = commitEntry(ctx, floor, entry, false, context);
            if (!options.silent && result.atoms.length) {
                try { notify({ messageId: floor, atoms: result.atoms }); }
                catch (error) { result.errors.push(`${MESSAGES[SERVICE_ERROR.NOTIFY_FAILED]}: ${error.message}`); }
            }
            return result;
        } catch (error) {
            if (!isExpectedError(error)) throw error;
            return { atoms: [], errors: [error.message], skipped: false };
        }
    }
    return { apply, applyText };
}
