import type { XiaobaiOsAppRuntime, XiaobaiOsAppActivationContext } from '../../../types.js';
import type { BuildingService } from './service.js';
import { fault } from './domain.js';
import { buildingId, parseCommand } from './partition.js';
import type { XiaobaiOsSettingsRepository } from '../../../host/settings-repository.js';

/** Feature composition at Game's registration boundary, not in the wagering controller. */
export function withBuildingRuntime(primary: XiaobaiOsAppRuntime, building: BuildingService, identity: () => string,
    settings: Pick<XiaobaiOsSettingsRepository, 'setGameBuildingSound'>): XiaobaiOsAppRuntime {
    let activation: { identity: string; post: XiaobaiOsAppActivationContext['post'] } | null = null;
    let busy = false;
    let unsubscribe: (() => void) | undefined;
    function cancel() { activation = null; }
    function publish() {
        if (!activation || busy || identity() !== activation.identity) { return; }
        activation.post('game/building/state', { chatIdentity: activation.identity, state: building.view() });
    }
    return {
        ...primary,
        async activate(context) {
            const result = await primary.activate?.(context);
            activation = { identity: identity(), post: context.post };
            return result;
        },
        async handleMessage(message) {
            if (!message.type.startsWith('game/building/')) { return primary.handleMessage?.(message); }
            const payload = message.payload as Record<string, unknown>;
            const current = activation;
            if (!current || !payload || payload.chatIdentity !== current.identity || identity() !== current.identity) { fault('identity'); }
            if (busy) { fault('unavailable'); }
            busy = true;
            // Closing a window must not invalidate an authorized save or its later recovery.
            const guard = () => identity() === current.identity;
            try {
                if (message.type === 'game/building/read') { return await building.refresh(); }
                if (message.type === 'game/building/confirm') { return await building.confirm(guard); }
                if (message.type === 'game/building/sound') {
                    if (typeof payload.enabled !== 'boolean') { fault('invalid'); }
                    await settings.setGameBuildingSound(payload.enabled);
                    return building.view();
                }
                if (message.type !== 'game/building/act') { fault('invalid'); }
                return await building.act({ actionId: buildingId(payload.actionId), revision: payload.revision as number,
                    command: parseCommand(payload.command) }, guard);
            } finally { busy = false; publish(); }
        },
        async deactivate(reason) { cancel(); await primary.deactivate?.(reason); },
        async cancelForeground(reason) { cancel(); await primary.cancelForeground?.(reason); },
        async cancelAll(reason) { cancel(); await primary.cancelAll?.(reason); },
        async handleChatChanged() { cancel(); await primary.handleChatChanged?.(); },
        async startBackground() { await primary.startBackground?.(); unsubscribe ??= building.subscribe(publish); },
        async stopBackground() { cancel(); unsubscribe?.(); unsubscribe = undefined; await primary.stopBackground?.(); },
    };
}
