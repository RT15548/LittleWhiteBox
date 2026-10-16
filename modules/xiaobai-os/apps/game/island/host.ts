import type { XiaobaiOsAppActivationContext, XiaobaiOsAppRuntime } from '../../../types.js';
import type { AgentCapability } from '../../../capabilities/agent/index.js';
import type { IslandService } from './service.js';
import type { IslandMemory } from './agent/memory-store.js';
import { runIslandGm } from './agent/runner.js';
import { interpretPlayerIntent } from './agent/intent-runner.js';
import { RULES } from './content.js';
import { identifier, integer, member, object, parseOperation, text } from './validation.js';
import { fail } from './fault.js';
import { parsePlayerIdentity } from './identity.js';

export function withIslandRuntime(primary: XiaobaiOsAppRuntime, service: IslandService, memory: IslandMemory, agent: AgentCapability,
    identity: () => string, idle: () => boolean): XiaobaiOsAppRuntime {
    let activation: { identity: string; post: XiaobaiOsAppActivationContext['post'] } | null = null;
    let controller: { abort: AbortController; kind: 'gm' | 'intent' } | null = null, busy = false;
    const view = () => ({ ...service.view(), busy: busy || service.view().busy, thinking: !!controller, interpreting: controller?.kind === 'intent', memoryPending: memory.pending() });
    const settledView = () => ({ ...view(), busy: false, thinking: false, interpreting: false });
    function publish() { if (activation && identity() === activation.identity) { activation.post('game/island/state', { chatIdentity: activation.identity, state: view() }); } }
    const detach = () => { activation = null; };
    const cancel = () => { controller?.abort.abort(); detach(); };
    return { ...primary,
        async activate(context) { const result = await primary.activate?.(context); activation = { identity: identity(), post: context.post }; return result; },
        async handleMessage(message) {
            if (!message.type.startsWith('game/island/')) { return primary.handleMessage?.(message); }
            const p = object(message.payload), current = activation;
            if (!current || p.chatIdentity !== current.identity || identity() !== current.identity) { fail('identity'); }
            if (message.type === 'game/island/cancel') { controller?.abort.abort(); return view(); }
            if (message.type === 'game/island/read' && busy) { return view(); }
            if (busy) { fail('busy'); }
            const guard = () => identity() === current.identity && idle();
            busy = true;
            try {
                if (message.type === 'game/island/settings') { current.post('os/navigate', { appId: 'agent-api' }); return settledView(); }
                if (message.type === 'game/island/read') { await service.refresh(); return settledView(); }
                if (message.type === 'game/island/confirm') {
                    if (memory.pending()) { await memory.confirm(guard); }
                    else { await service.confirm(guard); }
                    await service.refresh(); return settledView();
                }
                if (message.type === 'game/island/history') { return service.history(integer(p.after), integer(p.limit, 1, 100)); }
                if (message.type === 'game/island/dismiss-intent') { service.dismissIntent(identifier(p.intentId)); return settledView(); }
                const request = { id: identifier(p.actionId), revision: integer(p.revision) };
                switch (message.type) {
                    case 'game/island/start': await service.start(request, member(p.mode, ['start', 'restart']), parsePlayerIdentity(p.identity), guard); break;
                    case 'game/island/act': await service.player(request, parseOperation(p.operation), guard); break;
                    case 'game/island/advance': await service.elapse(request, integer(p.seconds, 1), guard); break;
                    case 'game/island/accept-intent': await service.acceptIntent(request, guard); break;
                    case 'game/island/interpret': case 'game/island/think': {
                        const active = new AbortController(); controller = { abort: active, kind: message.type === 'game/island/interpret' ? 'intent' : 'gm' }; publish();
                        try {
                            const activeGuard = () => guard() && !active.signal.aborted;
                            const options = { agent, memory, signal: active.signal, guard: activeGuard };
                            if (message.type === 'game/island/interpret') {
                                await service.interpret(request, text(p.text, RULES.maxSpeechCharacters), (work, input, clarifications) => interpretPlayerIntent(work, input, options, clarifications), activeGuard);
                            } else { await service.think(request, member(p.reason, ['response', 'decision']), work => runIslandGm(work, options), activeGuard); }
                        } catch (error) { if (active.signal.aborted) { fail('cancelled'); } throw error; }
                        finally { if (controller?.abort === active) { controller = null; } }
                        break;
                    }
                    default: fail('invalid');
                }
                return settledView();
            } finally { busy = false; publish(); }
        },
        async deactivate(reason) { detach(); await primary.deactivate?.(reason); },
        async cancelForeground(reason) { detach(); await primary.cancelForeground?.(reason); },
        async cancelAll(reason) { cancel(); await primary.cancelAll?.(reason); },
        async handleChatChanged() { cancel(); await primary.handleChatChanged?.(); },
        async stopBackground() { cancel(); await primary.stopBackground?.(); },
    };
}
export type IslandHostView = ReturnType<IslandService['view']> & { thinking: boolean; interpreting: boolean; memoryPending: boolean };
