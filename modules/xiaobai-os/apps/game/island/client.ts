import { computed, ref, shallowRef } from 'vue';
import type { XiaobaiOsFrameBridge } from '../../../shell/app-src/frame-bridge.js';
import type { IslandHostView } from './host.js';
import type { Operation } from './model.js';
import type { PlayerOperation } from './intent-work.js';
import type { ExperienceView } from './cooperation.js';
import { errorText } from './copy.js';

export const startsActivity = (operation: Operation) => ['travel', 'drag', 'rest', 'take', 'work', 'construct'].includes(operation.kind);
const needsResponse = (operation: Operation) => ['say', 'declare', 'offer', 'accept'].includes(operation.kind);

export function createIslandClient(bridge: XiaobaiOsFrameBridge, chatIdentity: string) {
    const view = shallowRef<IslandHostView | null>(null), busy = ref(false), error = ref(''), uncertain = ref(false);
    const failedRequest = ref<string | null>(null);
    let disposed = false, pushed: IslandHostView | null = null;
    let pendingInput: { id: string; accepted: () => void } | null = null;
    function apply(next: IslandHostView) {
        if (disposed || view.value && next.revision < view.value.revision) { return; }
        view.value = next;
        if (pendingInput?.id === next.lastRequest) { const accept = pendingInput.accepted; pendingInput = null; accept(); }
    }
    const unsubscribe = bridge.subscribe(message => {
        if (message.type !== 'game/island/state') { return; }
        const p = message.payload as { chatIdentity: string; state: IslandHostView };
        if (p.chatIdentity !== chatIdentity) { return; }
        pushed = p.state; apply(p.state);
    });
    async function request(type: string, args: Record<string, unknown> = {}) {
        if (disposed || busy.value) { return false; }
        busy.value = true; error.value = ''; failedRequest.value = null; pushed = null;
        try {
            const { result } = await bridge.request(`game/island/${type}`, { chatIdentity, actionId: crypto.randomUUID(), revision: view.value?.revision ?? 0, ...args }, type === 'think' || type === 'interpret' ? 360000 : 35000) as { result: IslandHostView };
            const latest = pushed as IslandHostView | null;
            apply(latest && latest.revision >= result.revision ? latest : result); uncertain.value = false; return true;
        } catch (cause) {
            error.value = errorText(cause); failedRequest.value = type;
            const code = (cause as { code?: string })?.code ?? '';
            uncertain.value = code.startsWith('host_request_') || code.startsWith('island_save_') || code === 'island_memory_save';
            return false;
        } finally { busy.value = false; }
    }
    const blocked = computed(() => busy.value || view.value?.busy || uncertain.value || view.value?.pending || view.value?.memoryPending || view.value?.writeState !== 'ready');
    async function decisions() {
        // At most one pass through six separate locations. No time is consumed by thinking.
        for (let i = 0; i < 6 && view.value?.needsDecision; i++) {
            if (!await request('think', { reason: 'decision' })) { return false; }
        }
        return !view.value?.needsDecision;
    }
    const lastExperience = () => view.value?.recent.at(-1)?.sequence ?? 0;
    const responseDueSince = (sequence: number) => view.value?.recent.some(e => e.sequence > sequence && e.audience.includes('player')
        && ((e.payload.kind === 'speech' || e.payload.kind === 'declaration') && e.payload.actor !== 'player'
            || e.payload.kind === 'offered' && e.payload.to === 'player'));
    return { view, busy, error, blocked, uncertain, failedRequest,
        read: () => request('read'), recover: () => request('confirm'), settings: () => request('settings'),
        async history(after: number) {
            try {
                const { result } = await bridge.request('game/island/history', { chatIdentity, after, limit: 40 }, 35000) as { result: { entries: ExperienceView[]; next: number | null } };
                return result;
            } catch (cause) { error.value = errorText(cause); return null; }
        },
        async start(mode: 'start' | 'restart') { return await request('start', { mode }) && await decisions(); },
        async act(operation: Operation) {
            if (blocked.value || !await request('act', { operation })) { return false; }
            if (needsResponse(operation) && view.value?.scene !== 'alone') { return request('think', { reason: 'response' }); }
            return true;
        },
        async speak(text: string, accepted: () => void) {
            if (blocked.value) { return false; }
            const id = crypto.randomUUID(); pendingInput = { id, accepted };
            if (!await request('act', { actionId: id, operation: { kind: 'say', text } })) {
                if (!uncertain.value) { pendingInput = null; }
                return false;
            }
            return view.value?.scene === 'alone' || await request('think', { reason: 'response' });
        },
        async interpret(text: string) {
            if (blocked.value) { return false; }
            return request('interpret', { text });
        },
        async dismissIntent() {
            if (blocked.value || !view.value?.intent) { return false; }
            return request('dismiss-intent', { intentId: view.value.intent.id });
        },
        async acceptIntent(accepted: () => void): Promise<PlayerOperation | null> {
            const intent = view.value?.intent;
            if (blocked.value || intent?.result.kind !== 'action') { return null; }
            const operation = intent.result.operation;
            pendingInput = { id: intent.id, accepted };
            if (!await request('accept-intent', { actionId: intent.id, revision: intent.revision })) {
                if (!uncertain.value) { pendingInput = null; }
                return null;
            }
            if (needsResponse(operation) && view.value?.scene !== 'alone' && !await request('think', { reason: 'response' })) { return null; }
            return operation;
        },
        async advance(seconds: number) {
            const beforeChoices = lastExperience();
            if (blocked.value || !await decisions()) { return false; }
            if (responseDueSince(beforeChoices)) { return true; }
            const startedAt = view.value!.player!.clock;
            const playerWasActive = !!view.value!.player!.self.activity;
            // Continue through NPC-only completion boundaries, not through encounters or a
            // player's finished action. Each physical advance is saved before asking the GM.
            for (let boundary = 0; boundary < 6; boundary++) {
                const remaining = seconds - (view.value!.player!.clock - startedAt);
                if (remaining <= 0) { return true; }
                if (!await request('advance', { seconds: remaining })) { return false; }
                if (view.value?.step === 'contact') { return await decisions(); }
                if (view.value?.step !== 'decision' || view.value.phase !== 'living') { return true; }
                const beforeResponse = lastExperience();
                if (!await decisions()) { return false; }
                if (responseDueSince(beforeResponse)) { return true; }
                if (playerWasActive && !view.value?.player?.self.activity) { return true; }
            }
            return true;
        },
        async think() { if (blocked.value) { return false; } return view.value?.needsDecision ? decisions() : request('think', { reason: 'response' }); },
        async cancel() {
            try { await bridge.request('game/island/cancel', { chatIdentity }, 35000); }
            catch (cause) { error.value = errorText(cause); }
        },
        dispose() { disposed = true; pendingInput = null; unsubscribe(); },
    };
}
