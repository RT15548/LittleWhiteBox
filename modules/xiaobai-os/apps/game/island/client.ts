import { computed, ref, shallowRef } from 'vue';
import { createStorageId } from '../../../kernel/identity.js';
import type { XiaobaiOsFrameBridge } from '../../../shell/app-src/frame-bridge.js';
import type { IslandHostView } from './host.js';
import type { GmContextUsage } from './agent/runner.js';
import type { Operation, Point } from './model.js';
import type { PlayerIdentity } from './characters.js';
import type { PlayerOperation } from './intent-work.js';
import type { ExperienceView } from './cooperation.js';
import { errorText } from './copy.js';
import { savesUncertain } from './fault.js';

export const startsActivity = (operation: Operation) => ['travel', 'drag', 'rest', 'take', 'work', 'construct', 'accept_care', 'strike', 'guard'].includes(operation.kind);
const needsResponse = (operation: Operation) => ['say', 'declare', 'offer', 'accept', 'decline_offer', 'offer_care', 'decline_care', 'offer_contact', 'accept_contact', 'decline_contact', 'strike', 'guard'].includes(operation.kind);
// Requests that write the partition take turns. Everything else is applied to the running world at once.
const EXCLUSIVE = ['read', 'start', 'confirm', 'settings'];
const WORLD_WRITES = new Set(['act', 'accept-intent', 'start']);
interface RequestState { id: string; type: string; waiting: boolean; completed: boolean; failure?: unknown; onCompleted?: () => void }

export function createIslandClient(bridge: XiaobaiOsFrameBridge, chatIdentity: string) {
    const view = shallowRef<IslandHostView | null>(null), busy = ref(false), error = ref(''), uncertain = ref(false);
    const failedRequest = ref<string | null>(null), dismissedGmFailure = ref(false);
    const gmFailure = computed(() => !dismissedGmFailure.value && view.value?.planFault && !view.value.pending && !view.value.memoryPending && !uncertain.value
        ? errorText({ code: view.value.planFault }) : '');
    let disposed = false, errorOwner: RequestState | null = null;
    const requests = new Set<RequestState>(), recovery = new Map<RequestState, 'transport' | 'save'>();
    let pendingInput: { id: string; accepted: () => void } | null = null;
    function release(request: RequestState) {
        if (!request.waiting && !recovery.has(request) && (request.type !== 'interpret' || request.completed || request.failure)) { requests.delete(request); }
    }
    function recovered(request: RequestState) {
        recovery.delete(request); uncertain.value = recovery.size > 0;
        if (errorOwner === request) { error.value = ''; failedRequest.value = null; errorOwner = null; }
        release(request);
    }
    function showFailure(cause: unknown, request: RequestState) {
        error.value = errorText(cause); failedRequest.value = request.type || null; errorOwner = request;
        const code = (cause as { code?: string })?.code ?? '';
        if (savesUncertain(code)) { recovery.set(request, 'save'); }
        uncertain.value = recovery.size > 0;
    }
    function apply(next: IslandHostView) {
        if (disposed) { return; }
        const completedRequests: RequestState[] = [];
        // Remember evidence even when a newer push replaces it before the request's timeout catch runs.
        for (const request of requests) {
            const completed = request.type === 'interpret' ? next.intent?.id === request.id || next.lastRequest === request.id
                : WORLD_WRITES.has(request.type) && next.lastRequest === request.id;
            if (!completed || request.completed) { continue; }
            request.completed = true; completedRequests.push(request);
            if (recovery.get(request) === 'transport' || request.type === 'interpret' && !request.failure) { recovered(request); }
            release(request);
        }
        if (!view.value || next.stamp >= view.value.stamp) {
            // A pulse/read of the same failure must not reopen a notice the player closed.
            if (next.journey !== view.value?.journey || next.planFault !== view.value?.planFault) { dismissedGmFailure.value = false; }
            view.value = next;
        }
        if (pendingInput?.id === next.lastRequest) { const accept = pendingInput.accepted; pendingInput = null; accept(); }
        for (const request of completedRequests) { request.onCompleted?.(); }
    }
    const unsubscribe = bridge.subscribe(message => {
        const p = message.payload as { chatIdentity?: string; actionId?: string } | undefined;
        if (disposed || p?.chatIdentity !== chatIdentity) { return; }
        if (message.type === 'game/island/state') { apply((message.payload as { state: IslandHostView }).state); }
        if (message.type === 'game/island/error') {
            const request: RequestState = [...requests].find(item => item.type === 'interpret' && item.id === p.actionId)
                ?? { id: p.actionId ?? '', type: '', waiting: false, completed: false };
            request.failure = message.payload;
            if (recovery.get(request) === 'transport') { recovered(request); }
            showFailure(message.payload, request); release(request);
        }
    });
    async function request(type: string, args: Record<string, unknown> = {}, onCompleted?: () => void) {
        const exclusive = EXCLUSIVE.includes(type);
        if (disposed || exclusive && busy.value) { return false; }
        // Also re-arm at the request boundary: a same-code failure can overtake the cleared-state acknowledgement.
        if (type === 'think' || type === 'start') { dismissedGmFailure.value = false; }
        if (exclusive) { busy.value = true; }
        if (!uncertain.value) { error.value = ''; failedRequest.value = null; errorOwner = null; }
        const payload = { chatIdentity, actionId: createStorageId(), revision: view.value?.revision ?? 0, ...args };
        const active: RequestState = { id: payload.actionId, type, waiting: true, completed: false, onCompleted };
        const confirming = type === 'confirm' ? [...recovery] : [];
        requests.add(active);
        try {
            const { result } = await bridge.request(`game/island/${type}`, payload, 35000) as { result: IslandHostView };
            apply(result);
            for (const [previous, kind] of confirming) { if (recovery.get(previous) === kind) { recovered(previous); } }
            if (type === 'start') { forgetInterpretations(); }
            return !active.failure;
        } catch (cause) {
            const code = (cause as { code?: string })?.code ?? '';
            if (code.startsWith('host_request_')) {
                if (active.completed) { return true; }
                // A correlated background error may arrive before the acknowledgement times out.
                if (active.failure) { return false; }
                if (WORLD_WRITES.has(type)) { recovery.set(active, 'transport'); }
            } else { active.failure = cause; }
            showFailure(cause, active);
            return false;
        } finally { active.waiting = false; release(active); if (exclusive) { busy.value = false; } }
    }
    function forgetInterpretations() {
        for (const request of requests) {
            if (request.type === 'interpret' && !request.waiting && !recovery.has(request)) { requests.delete(request); }
        }
    }
    const blocked = computed(() => busy.value || uncertain.value || view.value?.pending || view.value?.memoryPending || view.value?.writeState !== 'ready');
    // People nearby answer in the background. Asking returns at once; replies arrive as state pushes.
    function respond() { return view.value?.scene === 'alone' || request('think', { reason: 'response' }); }

    // A held direction is sent as it changes. Only the newest one matters, so a slow round trip never queues stale ones.
    let steerSent: Point | null = { x: 0, y: 0 }, steerWanted: Point = { x: 0, y: 0 }, steerInFlight = false, steerInput = 0;
    async function pumpSteering() {
        if (steerInFlight) { return; }
        steerInFlight = true;
        try {
            while (!disposed && (!steerSent || steerWanted.x !== steerSent.x || steerWanted.y !== steerSent.y)) {
                const direction = steerWanted, input = steerInput;
                try {
                    await bridge.request('game/island/steer', { chatIdentity, ...direction }, 5000);
                    steerSent = direction;
                } catch (cause) {
                    steerSent = null; error.value = errorText(cause);
                    // Do not retry this input. A newer queued input (especially release) still gets its own send.
                    if (steerInput === input) { break; }
                }
            }
        } finally { steerInFlight = false; }
    }
    function steer(x: number, y: number) {
        steerWanted = { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 }; steerInput++;
        void pumpSteering();
    }
    return { view, busy, error, blocked, uncertain, failedRequest, gmFailure,
        // UI-only dismissal: keep the host fault/automatic-retry hold and all save-recovery state intact.
        dismissGmFailure() { dismissedGmFailure.value = true; },
        read: () => request(uncertain.value ? 'confirm' : 'read'), recover: () => request('confirm'), settings: () => request('settings'),
        async history(after: number) {
            try {
                const { result } = await bridge.request('game/island/history', { chatIdentity, after, limit: 40 }, 35000) as { result: { entries: ExperienceView[]; next: number | null } };
                return result;
            } catch (cause) { error.value = errorText(cause); return null; }
        },
        start: (mode: 'start' | 'restart', identity: PlayerIdentity) => request('start', { mode, identity }),
        /** World-space direction of a held stick or key; (0, 0) stops. */
        steer,
        /** Whether time runs. The room is live while it is in front of the player with nothing covering the map. */
        async live(active: boolean) {
            if (!active) { steer(0, 0); }
            try { await bridge.request('game/island/live', { chatIdentity, active }, 5000); }
            catch (cause) { error.value = errorText(cause); }
        },
        async act(operation: Operation) {
            return !blocked.value && request('act', { operation }, () => { if (needsResponse(operation)) { void respond(); } });
        },
        async speak(text: string, accepted: () => void) {
            if (blocked.value) { return false; }
            const id = createStorageId(); pendingInput = { id, accepted };
            if (!await request('act', { actionId: id, operation: { kind: 'say', text } }, () => { void respond(); })) {
                if (!uncertain.value) { pendingInput = null; }
                return false;
            }
            return true;
        },
        async interpret(text: string) {
            if (blocked.value) { return false; }
            return request('interpret', { text, revision: view.value?.generation ?? 0 });
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
            if (!await request('accept-intent', { actionId: intent.id, revision: intent.generation }, () => { if (needsResponse(operation)) { void respond(); } })) {
                if (!uncertain.value) { pendingInput = null; }
                return null;
            }
            return operation;
        },
        /** Asks the people nearby to respond or decide again, e.g. after a failure. */
        async think() {
            if (blocked.value) { return false; }
            return request('think', { reason: view.value?.needsDecision ? 'decision' : 'response' });
        },
        async cancel() {
            try {
                const { result } = await bridge.request('game/island/cancel', { chatIdentity }, 35000) as { result: IslandHostView };
                apply(result); forgetInterpretations();
            } catch (cause) { error.value = errorText(cause); }
        },
        /** How full the people's next scene request is. Failures are returned to the asker, not shown as a room error. */
        async context(): Promise<{ usage: GmContextUsage } | { failure: string }> {
            try { return await bridge.request('game/island/context', { chatIdentity }, 35000).then(r => (r as { result: { usage: GmContextUsage } }).result); }
            catch (cause) { return { failure: errorText(cause) }; }
        },
        dispose() { disposed = true; pendingInput = null; unsubscribe(); },
    };
}
