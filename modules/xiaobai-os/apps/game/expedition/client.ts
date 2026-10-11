import { computed, ref, shallowRef } from 'vue';
import type { XiaobaiOsFrameBridge } from '../../../shell/app-src/frame-bridge.js';
import { COPY, errorText } from './copy.js';
import { newId } from './random.js';
import { parseCommand } from './partition.js';
import type { ExpeditionRequest, ExpeditionView } from './service.js';
import type { Command } from './types.js';
import type { Participant } from './content/participants.js';
import { CAMPAIGN_COPY } from './content/campaign-copy.js';

export function createExpeditionClient(bridge: XiaobaiOsFrameBridge, chatIdentity: string) {
    const view = shallowRef<ExpeditionView | null>(null), busy = ref(false), error = ref('');
    const failed = shallowRef<ExpeditionRequest | null>(null);
    const requestingTalk = ref(false), uncertainTalk = ref(false);
    const submission = shallowRef<(NonNullable<ExpeditionView['conversation']> & { status: 'sending' | 'failed' }) | null>(null);
    const replacingReply = shallowRef<{ person: Participant; turnId: string } | null>(null);
    const dismissedFailure = ref<string | null>(null);
    const conversationFailure = computed(() => view.value?.replyFailure?.actionId === dismissedFailure.value ? null : view.value?.replyFailure ?? null);
    const talking = computed(() => requestingTalk.value || !!view.value?.conversation);
    const readNeeded = ref(false);
    const dataInvalid = ref(false);
    let disposed = false;
    const pushed = shallowRef<ExpeditionView | null>(null);
    const conversationProgress = computed(() => {
        const live = (pushed.value ?? view.value)?.conversation;
        if (live) { return live; }
        return requestingTalk.value ? submission.value : null;
    });
    const blocked = computed(() => busy.value || talking.value || uncertainTalk.value || !!failed.value || !view.value?.ready || view.value.writeState !== 'ready' || view.value.pending);
    const atLeastAsRecent = (next: ExpeditionView, previous: ExpeditionView) => next.data.revision !== previous.data.revision
        ? next.data.revision > previous.data.revision : next.fileRevision >= previous.fileRevision;
    function apply(next: ExpeditionView) {
        if (disposed || view.value && !atLeastAsRecent(next, view.value)) { return; }
        const pending = submission.value;
        if (view.value?.data.active?.id !== next.data.active?.id || pending && next.data.active?.conversations[pending.person].some(turn => turn.id === pending.actionId)) { submission.value = null; }
        view.value = next;
    }
    const outgoing = computed(() => {
        if (submission.value) { return submission.value; }
        if (view.value?.conversation) { return { ...view.value.conversation, status: 'sending' as const }; }
        const failure = view.value?.replyFailure;
        if (!failure || failure.regenerating || view.value?.data.active?.conversations[failure.person].some(turn => turn.id === failure.actionId)) { return null; }
        return { actionId: failure.actionId, person: failure.person, text: failure.playerText, regenerating: false, status: 'failed' as const };
    });
    async function request(type: 'read' | 'act' | 'confirm' | 'rebuild' | 'retry-memory', input?: ExpeditionRequest, person?: Participant): Promise<boolean> {
        if (disposed || busy.value) { return false; }
        busy.value = true; pushed.value = null; error.value = '';
        try {
            const reply = await bridge.request(`game/expedition/${type}`, { chatIdentity, ...(type === 'rebuild' ? { actionId: newId() } : {}), ...input, ...(person ? { person } : {}) }, 35000) as { result: ExpeditionView };
            const latest = pushed.value;
            apply(latest && atLeastAsRecent(latest, reply.result) ? latest : reply.result);
            readNeeded.value = false; dataInvalid.value = false;
            if (view.value?.writeState === 'ready' && !view.value.pending && type !== 'read') { failed.value = null; }
            return true;
        } catch (cause) {
            if (!disposed) {
                readNeeded.value = true;
                if (pushed.value) { apply(pushed.value); } error.value = errorText(cause);
                const code = cause && typeof cause === 'object' && 'code' in cause ? String(cause.code) : '';
                dataInvalid.value = code === 'expedition_data_invalid';
                if (input && (code.startsWith('expedition_save_') || code.startsWith('host_request_'))) { failed.value = input; }
            }
            return false;
        } finally { pushed.value = null; if (!disposed) { busy.value = false; } }
    }
    const unsubscribe = bridge.subscribe(message => {
        if (disposed) { return; }
        if (message.type === 'game/expedition/error') {
            const payload = message.payload as { chatIdentity: string; code: string };
            if (payload.chatIdentity === chatIdentity) { error.value = errorText(payload); dataInvalid.value = payload.code === 'expedition_data_invalid'; }
            return;
        }
        if (message.type !== 'game/expedition/state') { return; }
        const payload = message.payload as { chatIdentity: string; state: ExpeditionView };
        if (payload.chatIdentity !== chatIdentity) { return; }
        if (busy.value) { pushed.value = payload.state; } else { pushed.value = null; apply(payload.state); }
    });
    async function recover() {
        const retry = failed.value;
        if (!await request('confirm') || !view.value || view.value.writeState !== 'ready' || view.value.pending) { return false; }
        if (retry && view.value.data.revision === retry.revision) { return request('act', retry); }
        failed.value = null; uncertainTalk.value = false; return true;
    }
    async function talk(person: Participant, text: string, turnId?: string) {
        if (blocked.value || disposed) { return false; }
        const actionId = newId();
        replacingReply.value = turnId ? { person, turnId } : null;
        submission.value = { actionId, person, text, regenerating: !!turnId, status: 'sending', phase: 'preparing', startedAt: Date.now() };
        requestingTalk.value = true; busy.value = true; error.value = ''; pushed.value = null;
        try {
            const reply = await bridge.request(turnId ? 'game/expedition/regenerate' : 'game/expedition/talk',
                { chatIdentity, actionId, revision: view.value!.data.revision, person, text, ...(turnId ? { turnId } : {}) }, 180000) as { result: ExpeditionView };
            const latest = pushed.value;
            apply(latest && atLeastAsRecent(latest, reply.result) ? latest : reply.result); return true;
        } catch (cause) {
            if (!disposed) {
                if (pushed.value) { apply(pushed.value); }
                const code = cause && typeof cause === 'object' && 'code' in cause ? String(cause.code) : cause instanceof Error ? cause.message : '';
                if (code === 'expedition_cancelled') { error.value = ''; return false; }
                uncertainTalk.value = code.startsWith('host_request_') || code.startsWith('expedition_save_');
                error.value = uncertainTalk.value ? CAMPAIGN_COPY.aiUnknown : view.value?.replyFailure?.actionId === actionId ? '' : errorText(cause);
            }
            return false;
        } finally {
            replacingReply.value = null;
            requestingTalk.value = false;
            pushed.value = null;
            if (!disposed) {
                busy.value = false;
                if (submission.value?.actionId === actionId) {
                    submission.value = turnId ? null : { ...submission.value, status: 'failed' };
                }
            }
        }
    }
    async function cancelTalk() {
        if (!talking.value) { return; }
        try { await bridge.request('game/expedition/cancel', { chatIdentity }, 35000); }
        catch (cause) { if (!disposed) { error.value = errorText(cause); } }
    }
    const recoveryRequired = computed(() => readNeeded.value || !!failed.value || uncertainTalk.value || !view.value || view.value.pending || view.value.writeState !== 'ready');
    return { view, busy, error, blocked, failed, talking, uncertainTalk, talk, outgoing, replacingReply, conversationProgress, cancelTalk, recoveryRequired, dataInvalid, conversationFailure,
        dismissConversationFailure() { dismissedFailure.value = view.value?.replyFailure?.actionId ?? null; },
        rebuild: () => request('rebuild'),
        retryMemory: (person: Participant) => blocked.value ? Promise.resolve(false) : request('retry-memory', undefined, person),
        dismissError() { if (!recoveryRequired.value) { error.value = ''; } },
        notice: computed(() => error.value || (view.value && (['failed', 'conflict', 'unconfirmed'].includes(view.value.writeState)
            || view.value.pending && view.value.writeState === 'ready') ? COPY.saveError : '')),
        read: () => request('read'), recover,
        act: (command: Command) => blocked.value ? Promise.resolve(false) : request('act', { actionId: newId(), revision: view.value!.data.revision, command: parseCommand(command) }),
        dispose() { disposed = true; unsubscribe(); },
    };
}
export type ExpeditionClient = ReturnType<typeof createExpeditionClient>;
