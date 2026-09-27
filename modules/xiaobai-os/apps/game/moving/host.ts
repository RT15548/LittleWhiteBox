import type { XiaobaiOsAppRuntime, XiaobaiOsAppActivationContext } from '../../../types.js';
import type { MovingService } from './service.js';
import { movingFault } from './domain.js';
import { movingId, parseMovingCommand } from './partition.js';
import type { XiaobaiOsSettingsRepository } from '../../../host/settings-repository.js';

/** Feature composition at Game's registration boundary, not in the wagering controller. */
export function withMovingRuntime(primary: XiaobaiOsAppRuntime, moving: MovingService, identity: () => string,
    settings: Pick<XiaobaiOsSettingsRepository, 'setGameMovingSound'>): XiaobaiOsAppRuntime {
    let activation: { identity: string; post: XiaobaiOsAppActivationContext['post'] } | null = null;
    let busy = false;
    let unsubscribe: (() => void) | undefined;
    function cancel() { activation = null; }
    function publish() {
        if (!activation || busy || identity() !== activation.identity) { return; }
        activation.post('game/moving/state', { chatIdentity: activation.identity, state: moving.view() });
    }
    return {
        ...primary,
        async activate(context) {
            const result = await primary.activate?.(context);
            activation = { identity: identity(), post: context.post };
            return result;
        },
        async handleMessage(message) {
            if (!message.type.startsWith('game/moving/')) { return primary.handleMessage?.(message); }
            const payload = message.payload as Record<string, unknown>;
            const current = activation;
            if (!current || !payload || payload.chatIdentity !== current.identity || identity() !== current.identity) { movingFault('identity'); }
            if (busy) { movingFault('unavailable'); }
            busy = true;
            // Closing a window must not invalidate an authorized save or its later recovery.
            const guard = () => identity() === current.identity;
            try {
                if (message.type === 'game/moving/read') { return await moving.refresh(); }
                if (message.type === 'game/moving/confirm') { return await moving.confirm(guard); }
                if (message.type === 'game/moving/sound') {
                    if (typeof payload.enabled !== 'boolean') { movingFault('invalid'); }
                    await settings.setGameMovingSound(payload.enabled);
                    return moving.view();
                }
                if (message.type !== 'game/moving/act') { movingFault('invalid'); }
                return await moving.act({ actionId: movingId(payload.actionId), revision: payload.revision as number,
                    command: parseMovingCommand(payload.command) }, guard);
            } finally { busy = false; publish(); }
        },
        async deactivate(reason) { cancel(); await primary.deactivate?.(reason); },
        async cancelForeground(reason) { cancel(); await primary.cancelForeground?.(reason); },
        async cancelAll(reason) { cancel(); await primary.cancelAll?.(reason); },
        async handleChatChanged() { cancel(); await primary.handleChatChanged?.(); },
        async startBackground() { await primary.startBackground?.(); unsubscribe ??= moving.subscribe(publish); },
        async stopBackground() { cancel(); unsubscribe?.(); unsubscribe = undefined; await primary.stopBackground?.(); },
    };
}
