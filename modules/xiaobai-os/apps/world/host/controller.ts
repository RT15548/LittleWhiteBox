import type { MaintenanceRunner } from '../../../capabilities/maintenance/runner.js';
import type { XiaobaiOsAppActivationContext, XiaobaiOsAppRuntime } from '../../../types.js';
import type { WorldService } from '../application/service.js';
import type { WorldClientState } from '../types.js';
import { worldSkippedMessage, worldStatusMessage } from './status.js';

interface Dependencies {
    world: WorldService;
    maintenance: Pick<MaintenanceRunner, 'startRebuild' | 'cancelRequested' | 'invalidateAutomatic' | 'getStatus' | 'subscribeStatus'>;
    getChatIdentity(): string;
    checkAgent(): Promise<boolean>;
}

export function createWorldController({ world, maintenance, getChatIdentity, checkAgent }: Dependencies): XiaobaiOsAppRuntime {
    let activation: { chatIdentity: string; context: XiaobaiOsAppActivationContext; busy: boolean } | null = null;
    let unsubscribeData: (() => void) | undefined;
    let unsubscribeStatus: (() => void) | undefined;
    function state(): WorldClientState {
        const chatIdentity = getChatIdentity();
        const view = world.readCurrent();
        if (!chatIdentity || view.chatIdentity !== chatIdentity) { throw new Error('聊天已切换，请重新打开世界。'); }
        const status = maintenance.getStatus('world', chatIdentity);
        const recovered = !view.pendingSave && view.writeState === 'ready' && status.reason === 'save-unconfirmed';
        return { chatIdentity, world: view.world, writeState: view.writeState, pendingSave: view.pendingSave,
            maintenance: recovered ? 'idle' : status.state,
            message: recovered ? '已加载保存的新闻。'
                : status.message === 'unchanged' && view.writeState === 'ready' && !view.world.news.length
                    ? '还没有新闻，等故事展开后再来看看。'
                    : worldStatusMessage(view.writeState, status, view.pendingSave) };
    }
    const isCurrent = (current: NonNullable<typeof activation>) => activation === current
        && current.context.isCurrent() && getChatIdentity() === current.chatIdentity;
    function publish(): void {
        if (activation && isCurrent(activation)) {
            try { activation.context.post('world/state', { state: state() }); }
            catch { activation.context.post('world/error', { message: '新闻暂时加载不了，请重试。' }); }
        }
    }
    function cancel(reason: string): void {
        maintenance.cancelRequested('world', reason);
        maintenance.invalidateAutomatic('world', reason);
    }
    function start() {
        const result = maintenance.startRebuild('world');
        return result.status === 'skipped' ? worldSkippedMessage(result.reason)
            : result.status === 'busy' ? '新闻正在更新，请稍候。' : '';
    }
    const deactivate = () => { activation = null; };
    return {
        activate(context) {
            const initial = state();
            activation = { chatIdentity: initial.chatIdentity, context, busy: false };
            return initial;
        },
        deactivate,
        cancelForeground: deactivate,
        cancelAll(reason) { cancel(reason); deactivate(); },
        handleWindowClosed(reason) { cancel(reason); deactivate(); },
        handleChatChanged() { cancel('chat-changed'); deactivate(); },
        startBackground() {
            unsubscribeData ??= world.subscribe(publish);
            unsubscribeStatus ??= maintenance.subscribeStatus((id, identity) => {
                if (id === 'world' && identity === getChatIdentity()) { publish(); }
            });
        },
        stopBackground() {
            cancel('world-stopped');
            deactivate();
            unsubscribeData?.(); unsubscribeStatus?.();
            unsubscribeData = undefined; unsubscribeStatus = undefined;
        },
        async handleMessage(message) {
            const payload = message.payload as { chatIdentity?: unknown; enabled?: unknown } | undefined;
            const current = activation;
            if (!current || !isCurrent(current) || payload?.chatIdentity !== current.chatIdentity) {
                throw new Error('聊天已切换，请重新打开世界。');
            }
            if (current.busy) { throw new Error('正在处理上一次操作，请稍候。'); }
            const storageIdentityKey = world.readCurrent().identityKey;
            current.busy = true;
            let notice = '';
            const guard = () => isCurrent(current);
            try {
                if (message.type === 'world/read') { await world.refreshCurrent(); }
                else if (message.type === 'world/confirm-save') {
                    const subscribedBefore = world.readCurrent().world.subscribed;
                    const recovery = await world.confirmPending();
                    if (!guard()) { throw new Error('页面已切换。'); }
                    if (recovery.status === 'confirmed' && !subscribedBefore && world.readCurrent().world.subscribed) {
                        notice = start();
                    }
                }
                else if (message.type === 'world/adopt-server-state') { await world.adoptServerState(); }
                else {
                    if (world.readCurrent().writeState !== 'ready') { throw new Error('请先按页面提示加载新闻或检查保存。'); }
                    if (message.type === 'world/refresh') { notice = start(); }
                    else if (message.type === 'world/subscribe' || message.type === 'world/background') {
                        if (typeof payload.enabled !== 'boolean') { throw new Error('开关值无效。'); }
                        const key = message.type === 'world/subscribe' ? 'subscribed' : 'injectToStory';
                        const before = world.readCurrent().world[key];
                        if (key === 'subscribed' && payload.enabled && !before) {
                            let ready = false;
                            try { ready = await checkAgent(); } catch { /* Report only application-owned text. */ }
                            if (!ready) { throw new Error('请先在 API 应用中配置可用的模型。'); }
                        }
                        if (!guard()) { throw new Error('页面已切换，本次操作已停止。'); }
                        if (key === 'subscribed' && !payload.enabled) { cancel('unsubscribed'); }
                        try { await world.setPreference(storageIdentityKey, key, payload.enabled, guard); }
                        catch { throw new Error('还不确定设置是否保存成功，请先检查保存。'); }
                        if (!guard()) { throw new Error('页面已切换。'); }
                        if (key === 'subscribed' && payload.enabled && !before) { notice = start(); }
                    } else { throw new Error('未知的世界操作。'); }
                }
                if (!guard()) { throw new Error('页面已切换。'); }
                return { state: state(), message: notice };
            } finally { current.busy = false; }
        },
    };
}
