import type { XiaobaiOsAppActivationContext, XiaobaiOsAppRuntime } from '../../../types.js';
import { expeditionId, parseCommand } from './partition.js';
import { fault } from './random.js';
import type { ExpeditionService } from './service.js';
import { member } from './validation.js';
import { PARTICIPANT_IDS } from './content/participants.js';

export function withExpeditionRuntime(primary: XiaobaiOsAppRuntime, service: ExpeditionService, identity: () => string): XiaobaiOsAppRuntime {
    let activation: { identity: string; post: XiaobaiOsAppActivationContext['post'] } | null = null, busy = false;
    let unsubscribe: (() => void) | undefined, conversation: AbortController | null = null;
    const detach = () => { activation = null; };
    const cancel = () => { conversation?.abort(); detach(); service.stopMemory(); };
    function publish() {
        if (!activation || busy && !conversation || identity() !== activation.identity) { return; }
        try { activation.post('game/expedition/state', { chatIdentity: activation.identity, state: service.view() }); }
        catch (error) {
            if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
                && (error.code === 'expedition_data_invalid' || error.code.startsWith('expedition_save_'))) {
                activation.post('game/expedition/error', { chatIdentity: activation.identity, code: error.code }); return;
            }
            throw error;
        }
    }
    return { ...primary,
        async activate(context) { const result = await primary.activate?.(context); activation = { identity: identity(), post: context.post }; return result; },
        async handleMessage(message) {
            if (!message.type.startsWith('game/expedition/')) { return primary.handleMessage?.(message); }
            const payload = message.payload as Record<string, unknown>, current = activation;
            if (!current || !payload || payload.chatIdentity !== current.identity || identity() !== current.identity) { fault('identity'); }
            if (message.type === 'game/expedition/cancel') { conversation?.abort(); return service.view(); }
            // A reattached view may inspect the in-flight request; it cannot start another.
            if (message.type === 'game/expedition/read' && busy) { return service.view(); }
            if (busy) { fault('unavailable'); }
            busy = true; const guard = () => identity() === current.identity;
            try {
                if (message.type === 'game/expedition/read') { return await service.refresh(); }
                if (message.type === 'game/expedition/confirm') { return await service.confirm(guard); }
                if (message.type === 'game/expedition/retry-memory') { return await service.retryMemory(member(payload.person, PARTICIPANT_IDS), guard); }
                if (message.type === 'game/expedition/rebuild') { return await service.rebuild(expeditionId(payload.actionId), guard); }
                if (message.type === 'game/expedition/talk' || message.type === 'game/expedition/regenerate') {
                    const controller = new AbortController(); conversation = controller;
                    try { return await service.converse({ actionId: expeditionId(payload.actionId), revision: payload.revision as number,
                        person: member(payload.person, PARTICIPANT_IDS), text: payload.text as string,
                        ...(message.type === 'game/expedition/regenerate' ? { regenerate: expeditionId(payload.turnId) } : {}) }, guard, controller.signal); }
                    finally { if (conversation === controller) { conversation = null; } }
                }
                if (message.type !== 'game/expedition/act') { fault('invalid'); }
                return await service.act({ actionId: expeditionId(payload.actionId), revision: payload.revision as number, command: parseCommand(payload.command) }, guard);
            } catch (error) {
                // This optional game's data must not take the entire Game App down.
                if (error && typeof error === 'object' && 'code' in error && error.code === 'partition_invalid') { fault('data_invalid', error); }
                throw error;
            } finally { busy = false; publish(); }
        },
        async deactivate(reason) { detach(); await primary.deactivate?.(reason); },
        async cancelForeground(reason) { detach(); await primary.cancelForeground?.(reason); },
        async cancelAll(reason) { cancel(); await primary.cancelAll?.(reason); },
        async handleChatChanged() { cancel(); await primary.handleChatChanged?.(); },
        async startBackground() { await primary.startBackground?.(); unsubscribe ??= service.subscribe(publish); },
        async stopBackground() { cancel(); unsubscribe?.(); unsubscribe = undefined; await primary.stopBackground?.(); },
    };
}
