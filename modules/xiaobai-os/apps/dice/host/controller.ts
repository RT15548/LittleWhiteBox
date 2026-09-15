import type { ScopedChatStore, XiaobaiOsFileControls } from '../../../kernel/contracts.js';
import type { XiaobaiOsAppActivationContext, XiaobaiOsAppRuntime } from '../../../types.js';
import type { DicePartition } from '../partition.js';
import type { DiceClientState } from '../types.js';

export function createDiceController(store: ScopedChatStore<DicePartition>, files: XiaobaiOsFileControls,
    ensureDisplay: () => Promise<void>, cancel: (feature: 'actionChecksEnabled' | 'encountersEnabled') => void): XiaobaiOsAppRuntime & { disable(): Promise<void> } {
    let activation: XiaobaiOsAppActivationContext | null = null;
    const state = (): DiceClientState => ({ chatIdentity: store.peekCurrent()?.identityKey ?? '',
        actionChecksEnabled: store.peekCurrent()?.value?.actionChecksEnabled ?? false,
        encountersEnabled: store.peekCurrent()?.value?.encountersEnabled ?? false,
        fileState: files.getFileState(), pending: files.hasPendingCommit('dice') });
    const emit = () => activation?.post('dice/state', { state: state() });
    let subscriptions: (() => void)[] = [];

    async function setEnabled(feature: 'actionChecksEnabled' | 'encountersEnabled', enabled: boolean, guard = () => true): Promise<void> {
        const identity = state().chatIdentity;
        const current = () => !!identity && state().chatIdentity === identity && guard();
        if (enabled && feature === 'actionChecksEnabled') {
            try { await ensureDisplay(); }
            catch (error) {
                console.error('[LittleWhiteBox] Dice display setup failed', error);
                throw new Error('行动检定暂时无法开启，请检查酒馆的正则扩展。');
            }
        }
        if (!current()) { throw new Error('聊天或页面已切换。'); }
        const result = await store.transact(transaction => {
            const current = transaction.currentOrInitial();
            if (current[feature] !== enabled) { transaction.replace({ ...current, [feature]: enabled }); }
        }, { retainFailedCandidate: true, commitGuard: current });
        if (!current()) { throw new Error('聊天或页面已切换。'); }
        if (result.status !== 'confirmed' && result.status !== 'unchanged') {
            throw new Error(result.status === 'unconfirmed' ? '还不确定设置是否保存成功，请先检查保存。' : '设置未能保存，请重试。');
        }
        if (!enabled) { cancel(feature); }
        emit();
    }

    return {
        async activate(context) { activation = context; await store.read(); return state(); },
        deactivate() { activation = null; },
        cancelForeground() { activation = null; },
        startBackground() {
            if (subscriptions.length) { return; }
            subscriptions = [store.subscribe(() => {
                for (const feature of ['actionChecksEnabled', 'encountersEnabled'] as const) { if (!state()[feature]) { cancel(feature); } }
                emit();
            }), files.subscribeFileState(emit)];
        },
        stopBackground() { subscriptions.splice(0).forEach(unsubscribe => unsubscribe()); activation = null; cancel('actionChecksEnabled'); cancel('encountersEnabled'); },
        async handleMessage(message) {
            const payload = message.payload as { chatIdentity?: string; feature?: string; enabled?: boolean } | undefined;
            const owner = activation;
            if (!owner?.isCurrent() || payload?.chatIdentity !== state().chatIdentity) { throw new Error('聊天或页面已切换。'); }
            if (message.type === 'dice/set-feature') {
                if (typeof payload?.enabled !== 'boolean' || !['actionChecksEnabled', 'encountersEnabled'].includes(payload.feature ?? '')) { throw new Error('开关值无效。'); }
                await setEnabled(payload.feature as 'actionChecksEnabled' | 'encountersEnabled', payload.enabled, () => activation === owner && owner.isCurrent());
            } else if (message.type === 'dice/retry-file') { await files.retryPending(); }
            else if (message.type === 'dice/adopt-file') { await files.adoptServerState(); }
            else { throw new Error('未知的 Dice 操作。'); }
            return state();
        },
        async disable() { await setEnabled('actionChecksEnabled', false); await setEnabled('encountersEnabled', false); },
    };
}
