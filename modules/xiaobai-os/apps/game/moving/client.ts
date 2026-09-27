import { computed, ref, shallowRef } from 'vue';
import type { XiaobaiOsFrameBridge } from '../../../shell/app-src/frame-bridge.js';
import type { MovingCommand } from './domain.js';
import type { MovingRequest, MovingView } from './service.js';
import { MOVING_COPY, movingErrorText } from './copy.js';
import { newMovingId } from './identity.js';

export function createMovingClient(bridge: XiaobaiOsFrameBridge, chatIdentity: string) {
    const view = shallowRef<MovingView | null>(null);
    const busy = ref(false), error = ref(''), generating = ref(false);
    const failed = shallowRef<MovingRequest | null>(null);
    let disposed = false;
    let pushed: MovingView | null = null;
    const blocked = computed(() => busy.value || !!failed.value || !view.value?.ready || view.value.writeState !== 'ready' || view.value.pending);
    function apply(next: MovingView) {
        if (disposed) { return; }
        view.value = next;
    }
    async function request(type: 'read' | 'confirm' | 'act' | 'sound', input?: MovingRequest | { enabled: boolean }): Promise<boolean> {
        if (disposed || busy.value) { return false; }
        busy.value = true; pushed = null; generating.value = !!input && 'command' in input && input.command.type === 'challenge'; error.value = '';
        try {
            const reply = await bridge.request(`game/moving/${type}`, { chatIdentity, ...input }, 35000) as { result: MovingView };
            const latest = pushed as MovingView | null;
            apply(latest && latest.revision >= reply.result.revision ? latest : reply.result);
            if (view.value?.writeState === 'ready' && !view.value.pending) { failed.value = null; }
            return true;
        } catch (cause) {
            if (!disposed) {
                if (pushed) { apply(pushed); }
                if (type === 'sound') { throw cause; }
                error.value = movingErrorText(cause);
                const code = cause && typeof cause === 'object' && 'code' in cause ? String(cause.code) : cause instanceof Error ? cause.message : '';
                if (input && 'command' in input && (code.startsWith('moving_save_') || code.startsWith('host_request_'))) { failed.value = input; }
            }
            return false;
        } finally { if (!disposed) { busy.value = false; generating.value = false; } }
    }
    const unsubscribe = bridge.subscribe(message => {
        if (disposed || message.type !== 'game/moving/state') { return; }
        const payload = message.payload as { chatIdentity: string; state: MovingView };
        if (payload.chatIdentity === chatIdentity) {
            if (busy.value) { pushed = payload.state; } else { apply(payload.state); }
        }
    });
    async function recover() {
        const retry = failed.value;
        if (!await request('confirm') || !view.value || view.value.writeState !== 'ready' || view.value.pending) { return; }
        // Retry only when confirmation proves the original command was not applied.
        if (retry && view.value.revision === retry.revision) { await request('act', retry); }
    }
    return { view, busy, error, generating, blocked, failed,
        notice: computed(() => error.value || (view.value?.writeState === 'conflict' ? MOVING_COPY.conflict
            : view.value?.pending || view.value?.writeState === 'unconfirmed' ? MOVING_COPY.saveProblem : '')),
        read: () => request('read'), recover,
        setSoundEnabled: (enabled: boolean) => request('sound', { enabled }),
        act: (command: MovingCommand) => blocked.value ? Promise.resolve(false) : request('act', {
            actionId: newMovingId(), revision: view.value!.revision, command,
        }),
        dispose() { disposed = true; unsubscribe(); },
    };
}
