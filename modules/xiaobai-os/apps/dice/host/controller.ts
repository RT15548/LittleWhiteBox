import type { ScopedChatStore, XiaobaiOsFileControls } from '../../../kernel/contracts.js';
import type { XiaobaiOsAppActivationContext, XiaobaiOsAppRuntime } from '../../../types.js';
import type { DicePartition } from '../partition.js';
import type { DiceClientState } from '../types.js';

export function createDiceController(store: ScopedChatStore<DicePartition>, files: XiaobaiOsFileControls,
    ensureDisplay: () => Promise<void>, cancel: () => void): XiaobaiOsAppRuntime & { disable(): Promise<void> } {
    let activation: XiaobaiOsAppActivationContext | null = null;
    const state = (): DiceClientState => ({ chatIdentity: store.peekCurrent()?.identityKey ?? '',
        enabled: store.peekCurrent()?.value?.actionChecksEnabled ?? false,
        fileState: files.getFileState(), pending: files.hasPendingCommit('dice') });
    const emit = () => activation?.post('dice/state', { state: state() });
    let subscriptions: (() => void)[] = [];

    async function setEnabled(enabled: boolean, guard = () => true): Promise<void> {
        const identity = state().chatIdentity;
        const current = () => !!identity && state().chatIdentity === identity && guard();
        if (enabled) { await ensureDisplay(); }
        if (!current()) { throw new Error('聊天或页面已切换。'); }
        const result = await store.transact(transaction => {
            const current = transaction.currentOrInitial();
            if (current.actionChecksEnabled !== enabled) { transaction.replace({ ...current, actionChecksEnabled: enabled }); }
        }, { retainFailedCandidate: true, commitGuard: current });
        if (!current()) { throw new Error('聊天或页面已切换。'); }
        if (result.status !== 'confirmed' && result.status !== 'unchanged') {
            throw new Error(result.status === 'unconfirmed' ? '开关尚未确认保存，请先核实文件状态。' : '开关未保存，请重试或重新加载文件。');
        }
        if (!enabled) { cancel(); }
        emit();
    }

    return {
        async activate(context) { activation = context; await store.read(); return state(); },
        deactivate() { activation = null; },
        cancelForeground() { activation = null; },
        startBackground() {
            if (subscriptions.length) { return; }
            subscriptions = [store.subscribe(() => { if (!state().enabled) { cancel(); } emit(); }), files.subscribeFileState(emit)];
        },
        stopBackground() { subscriptions.splice(0).forEach(unsubscribe => unsubscribe()); activation = null; cancel(); },
        async handleMessage(message) {
            const payload = message.payload as { chatIdentity?: string; enabled?: boolean } | undefined;
            const owner = activation;
            if (!owner?.isCurrent() || payload?.chatIdentity !== state().chatIdentity) { throw new Error('聊天或页面已切换。'); }
            if (message.type === 'dice/set-enabled') {
                if (typeof payload?.enabled !== 'boolean') { throw new Error('开关值无效。'); }
                await setEnabled(payload.enabled, () => activation === owner && owner.isCurrent());
            } else if (message.type === 'dice/retry-file') { await files.retryPending(); }
            else if (message.type === 'dice/adopt-file') { await files.adoptServerState(); }
            else { throw new Error('未知的 Dice 操作。'); }
            return state();
        },
        disable: () => setEnabled(false),
    };
}
