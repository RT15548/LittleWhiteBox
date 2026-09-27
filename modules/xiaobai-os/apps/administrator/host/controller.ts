import type { XiaobaiOsAppActivationContext, XiaobaiOsAppRuntime } from '../../../types.js';
import type { AdministratorState } from '../domain/types.js';
import { ADMINISTRATOR_POLICY as POLICY } from '../domain/policy.js';
import { object } from '../domain/data.js';
import type { AdministratorConversation } from '../application/conversation.js';
import type { AdministratorRuntime } from '../application/runtime.js';
import { administratorError } from '../ui/copy.js';

export function createAdministratorController(conversation: AdministratorConversation, runtime: AdministratorRuntime): XiaobaiOsAppRuntime & { emit(): void } {
    let activation: XiaobaiOsAppActivationContext | null = null;
    let busy: object | null = null;
    let localError = '';
    let lastStateKey = '';
    function state(live = runtime.live(), unsavedProcess = runtime.unsavedProcess()): AdministratorState {
        return { chatIdentity: conversation.identity(), page: conversation.page(), live, unsavedProcess, context: runtime.context(),
            error: localError || runtime.error(), corrupted: conversation.corrupted(), unsaved: conversation.unsaved(), submission: runtime.submission(), conflict: conversation.conflict() };
    }
    function emit() {
        if (!activation?.isCurrent()) { return; }
        const live = runtime.live(), unsavedProcess = runtime.unsavedProcess();
        const key = JSON.stringify([conversation.identity(), conversation.read().revision, !!live, unsavedProcess?.turnId, localError || runtime.error(), conversation.corrupted(), conversation.unsaved(), conversation.conflict(), runtime.submission()]);
        if (key !== lastStateKey) { lastStateKey = key; activation.post('administrator/state', { state: state(live, unsavedProcess) }); }
        else { activation.post('administrator/live', { live, context: runtime.context() }); }
    }
    async function exclusive(action: () => Promise<unknown>) {
        if (busy || runtime.busy()) { throw new Error('administrator_busy'); }
        const lease = {}, current = conversation.capture();
        busy = lease; localError = '';
        try {
            const result = await action();
            if (!current()) { throw new Error('administrator_context_changed'); }
            return result;
        }
        catch (error) { if (current()) { localError = administratorError(error); } throw new Error(administratorError(error)); }
        finally { if (busy === lease) { busy = null; emit(); } }
    }
    return {
        emit,
        async activate(context) {
            activation = context;
            const current = conversation.capture();
            if (!busy && !runtime.busy() && !conversation.unsaved()) { await conversation.refresh(); }
            if (!current() || activation !== context) { throw new Error('administrator_context_changed'); }
            if (!busy && !runtime.busy() && !conversation.unsaved()) {
                try { await runtime.confirmed(); }
                catch (error) {
                    if (!current()) { throw error; }
                    localError = administratorError(error);
                }
            }
            if (!current() || activation !== context) { throw new Error('administrator_context_changed'); }
            lastStateKey = ''; return state();
        },
        deactivate() { activation = null; },
        async handleMessage(message) {
            const payload = object(message.payload);
            if (!activation?.isCurrent() || payload.chatIdentity !== conversation.identity()) { throw new Error('administrator_context_changed'); }
            const guard = conversation.capture();
            switch (message.type) {
                case 'administrator/stop': runtime.stop(); return {};
                case 'administrator/page': {
                    if (payload.revision !== conversation.read().revision) { throw new Error('administrator_history_conflict'); }
                    const start = Number(payload.start);
                    if (!Number.isSafeInteger(start) || start < 0) { throw new Error('administrator_page_invalid'); }
                    return conversation.page(start);
                }
                case 'administrator/text': {
                    if (payload.revision !== conversation.read().revision) { throw new Error('administrator_history_conflict'); }
                    const turn = conversation.read().turns.find(t => t.id === payload.turnId);
                    if (!turn) { throw new Error('administrator_message_missing'); }
                    const text = payload.role === 'user' ? turn.user?.text ?? '' : turn.assistant ?? '';
                    const offset = Number(payload.offset ?? 0);
                    if (!Number.isSafeInteger(offset) || offset < 0 || offset > text.length) { throw new Error('administrator_page_invalid'); }
                    return { text: text.slice(offset, offset + POLICY.textBlock), offset, totalChars: text.length };
                }
                case 'administrator/process': {
                    if (payload.revision !== conversation.read().revision) { throw new Error('administrator_history_conflict'); }
                    return runtime.process(String(payload.turnId));
                }
                case 'administrator/operations': {
                    const turn = conversation.read().turns.find(t => t.id === payload.turnId);
                    if (!turn) { throw new Error('administrator_message_missing'); }
                    const offset = Number(payload.offset ?? 0);
                    if (!Number.isSafeInteger(offset) || offset < 0) { throw new Error('administrator_page_invalid'); }
                    return { items: turn.operations.slice(offset, offset + POLICY.pageSize), total: turn.operations.length, offset };
                }
                case 'administrator/evidence': return runtime.evidence(String(payload.reference), payload.offset);
                case 'administrator/send': return exclusive(async () => {
                    const turnId = await runtime.send(payload.submissionId, String(payload.text ?? ''), payload.image);
                    return { turnId, state: state() };
                });
                case 'administrator/regenerate': return exclusive(async () => {
                    if (conversation.unsaved()) { throw new Error('administrator_save_pending'); }
                    await runtime.regenerate(String(payload.turnId)); return state();
                });
                case 'administrator/check':
                case 'administrator/confirm': return exclusive(async () => { await conversation.confirm(guard, message.type === 'administrator/check'); await runtime.confirmed(); return state(); });
                case 'administrator/adopt': return exclusive(async () => {
                    runtime.stop(); await conversation.adopt();
                    try { await runtime.confirmed(false); }
                    finally { if (guard() && !conversation.unsaved()) { await runtime.reset(); } }
                    await runtime.prepareContext(); return state();
                });
                case 'administrator/delete': return exclusive(async () => {
                    if (payload.revision !== conversation.read().revision) { throw new Error('administrator_history_conflict'); }
                    await runtime.reset(); await conversation.deleteMessage(String(payload.turnId), String(payload.role), guard); await runtime.prepareContext(); return state();
                });
                case 'administrator/clear': return exclusive(async () => { await runtime.reset(); await conversation.clear(guard); await runtime.prepareContext(); return state(); });
                case 'administrator/refresh': return exclusive(async () => { await conversation.refresh(); return state(); });
                default: throw new Error('administrator_message_unknown');
            }
        },
        async handleChatChanged() {
            activation = null; conversation.reset(); busy = null; localError = ''; lastStateKey = '';
            await runtime.reset();
        },
        cancelAll: () => runtime.reset(),
        stopBackground: () => runtime.reset(),
    };
}
