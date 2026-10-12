import { computed, ref, shallowRef } from 'vue';
import type { XiaobaiOsFrameBridge } from '../../../shell/app-src/frame-bridge.js';
import type { Command } from './domain.js';
import type { BuildingRequest, BuildingView } from './service.js';
import { COPY, buildingErrorText } from './copy.js';
import { newBuildingId } from './partition.js';
import type { RecoveryJournal } from './recovery.js';
import type { Room } from './policy.js';

export function createBuildingClient(bridge: XiaobaiOsFrameBridge, chatIdentity: string, journal: RecoveryJournal) {
    const view = shallowRef<BuildingView | null>(null);
    const busy = ref(false), error = ref(''), generating = ref(false);
    const failed = shallowRef<BuildingRequest | null>(null);
    const recoveryBlocked = ref(false);
    const history = shallowRef<{ runId: string; revision: number; layouts: Room[][] } | null>(null);
    const canUndo = computed(() => !blocked.value && view.value?.active?.state !== 'abandoned' && history.value?.runId === view.value?.active?.id
        && history.value?.revision === view.value?.revision && !!history.value?.layouts.length);
    let disposed = false;
    let pushed: BuildingView | null = null;
    const blocked = computed(() => busy.value || recoveryBlocked.value || !!failed.value || !view.value?.ready || view.value.writeState !== 'ready' || view.value.pending);
    function apply(next: BuildingView) {
        if (disposed) { return; }
        view.value = next;
    }
    function restoreIntent() {
        const intent = journal.read(), state = view.value;
        if (!intent || !state?.ready) { return; }
        if ('retired' in intent) {
            if (state.writeState === 'ready' && !state.pending) {
                journal.clear();
                if (state.active?.id === intent.runId && state.revision === intent.revision) { error.value = COPY.retiredIntent; }
            }
            return;
        }
        if (state.active?.id === intent.runId && state.revision === intent.request.revision) { failed.value = intent.request; }
        else if (state.writeState === 'ready' && !state.pending) { journal.clear(); }
    }
    async function request(type: 'read' | 'confirm' | 'act' | 'sound', input?: BuildingRequest | { enabled: boolean }): Promise<boolean> {
        if (disposed || busy.value) { return false; }
        busy.value = true; pushed = null; generating.value = !!input && 'command' in input && input.command.type === 'start'; error.value = '';
        try {
            if (type === 'act' && input && 'command' in input && input.command.type !== 'start' && view.value?.active) {
                // Do not send a risky placement unless this exact intent can survive a hard reload.
                failed.value = input;
                journal.write({ runId: view.value.active.id, request: input });
            }
            const reply = await bridge.request(`game/building/${type}`, { chatIdentity, ...input }, 35000) as { result: BuildingView };
            const latest = pushed as BuildingView | null;
            apply(latest && latest.revision >= reply.result.revision ? latest : reply.result);
            restoreIntent(); recoveryBlocked.value = false;
            if (view.value?.writeState === 'ready' && !view.value.pending
                && (!failed.value || view.value.revision > failed.value.revision)) { failed.value = null; }
            return true;
        } catch (cause) {
            if (!disposed) {
                if (pushed) { apply(pushed); }
                if (type === 'sound') { throw cause; }
                error.value = buildingErrorText(cause);
                const code = cause && typeof cause === 'object' && 'code' in cause ? String(cause.code) : cause instanceof Error ? cause.message : '';
                if (code === 'building_recovery') { recoveryBlocked.value = true; }
                if (input && 'command' in input && (code.startsWith('building_save_') || code.startsWith('host_request_'))) { failed.value = input; }
                else if (type === 'act' && code !== 'building_recovery') {
                    // A definitive domain rejection did not accept the operation.
                    try { journal.clear(); failed.value = null; } catch (cause) { recoveryBlocked.value = true; error.value = buildingErrorText(cause); }
                }
            }
            return false;
        } finally { if (!disposed) { busy.value = false; generating.value = false; } }
    }
    const unsubscribe = bridge.subscribe(message => {
        if (disposed || message.type !== 'game/building/state') { return; }
        const payload = message.payload as { chatIdentity: string; state: BuildingView };
        if (payload.chatIdentity === chatIdentity) {
            if (busy.value) { pushed = payload.state; } else { apply(payload.state); }
        }
    });
    async function recover() {
        let retry = failed.value;
        if (!await request('confirm') || !view.value || view.value.writeState !== 'ready' || view.value.pending) { return; }
        retry ??= failed.value;
        // Retry only when confirmation proves the original command was not applied.
        if (retry && view.value.revision === retry.revision) { await request('act', retry); }
    }
    async function act(command: Command) {
        if (blocked.value) { return false; }
        const before = view.value!, previous = before.active?.rooms ? structuredClone(before.active.rooms) : null;
        const old = history.value?.runId === before.active?.id && history.value?.revision === before.revision ? history.value.layouts : [];
        const accepted = await request('act', { actionId: newBuildingId(), revision: before.revision, command });
        const after = view.value;
        if (accepted && previous && after && after.active?.id === before.active?.id && after.revision === before.revision + 1) {
            const layouts = command.type === 'restore' ? old.slice(0, -1)
                : ['put', 'remove', 'refit'].includes(command.type) ? [...old, previous] : [];
            history.value = { runId: before.active!.id, revision: after.revision, layouts };
        } else { history.value = null; }
        return accepted;
    }
    return { view, busy, error, generating, blocked, failed,
        notice: computed(() => error.value || (recoveryBlocked.value ? COPY.recoveryProblem : view.value?.writeState === 'conflict' ? COPY.conflict
            : view.value?.pending || view.value?.writeState === 'unconfirmed' ? COPY.saveProblem : '')),
        read: () => request('read'), recover,
        setSoundEnabled: (enabled: boolean) => request('sound', { enabled }),
        act, canUndo, undo: () => canUndo.value ? act({ type: 'restore', rooms: history.value!.layouts.at(-1)! }) : Promise.resolve(false),
        dispose() { disposed = true; unsubscribe(); },
    };
}
