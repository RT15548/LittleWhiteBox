import type { XiaobaiOsAppActivationContext, XiaobaiOsAppRuntime } from '../../../types.js';
import type { AgentCapability } from '../../../capabilities/agent/index.js';
import type { IslandService } from './service.js';
import type { IslandMemory } from './agent/memory-store.js';
import { measureGmContext, runIslandGm } from './agent/runner.js';
import { interpretPlayerIntent } from './agent/intent-runner.js';
import { RULES } from './content.js';
import { identifier, integer, member, object, parseOperation, text } from './validation.js';
import { fail, savesUncertain } from './fault.js';
import { parsePlayerIdentity } from './identity.js';

const PULSE_MILLISECONDS = 200;
const CHECKPOINT_MILLISECONDS = 5000;
// Only wholly superseded plans count toward the limit; any applied prefix is progress.
const MAX_EMPTY_PLANS = 3;
const PLAN_PAUSE_MILLISECONDS = 3000;
// A cancelled or quietly superseded plan is not a failure the player needs to see.
const QUIET_PLAN_ENDINGS = ['island_stale', 'island_unavailable', 'island_cancelled'];

type PlanReason = 'response' | 'decision';
interface Failure { code: string; message: string }
interface Activation { identity: string; post: XiaobaiOsAppActivationContext['post']; leaving: boolean }

export function withIslandRuntime(primary: XiaobaiOsAppRuntime, service: IslandService, memory: IslandMemory, agent: AgentCapability,
    identity: () => string, idle: () => boolean): XiaobaiOsAppRuntime {
    let activation: Activation | null = null;
    // Persistence-bound requests (read, start, confirm) take turns; movement and play never wait on them.
    let busy = false;
    let interpreting: AbortController | null = null;
    let planning: AbortController | null = null, planReason: PlanReason | null = null;
    let planFault: Failure | null = null;
    let planHold = false, responseQueued = false, emptyPlans = 0, nextPlanAt = 0, viewStamp = 0;
    let live = false, timer: ReturnType<typeof setInterval> | null = null, lastPulse = 0, lastCheckpoint = 0;
    // People deciding what to do next is ordinary background life; only a reply to the player is shown as waiting.
    const view = () => {
        const state = service.view();
        // Work flags can change without touching the world. Order the entire snapshot, including delayed acknowledgements.
        return { ...state, stamp: ++viewStamp, busy: busy || state.busy, thinking: planReason === 'response' || !!interpreting, interpreting: !!interpreting,
            memoryPending: memory.pending(), planFault: planFault?.code ?? null };
    };
    const settledView = () => ({ ...view(), busy: false });
    const current = () => activation && identity() === activation.identity ? activation : null;
    const guardFor = (a: Activation, saving = false) => () => current() === a && (saving || !a.leaving) && idle();
    function publish(a = current()) { if (a && current() === a && !a.leaving) { a.post('game/island/state', { chatIdentity: a.identity, state: view() }); } }
    function report(error: unknown, a = current(), actionId?: string) {
        const code = (error as { code?: string })?.code ?? 'island_failed', message = error instanceof Error ? error.message : String(error);
        if (a && current() === a && !a.leaving) { a.post('game/island/error', { chatIdentity: a.identity, code, message, ...(actionId ? { actionId } : {}) }); }
    }

    async function checkpoint() {
        const a = current();
        if (!a || a.leaving) { return; }
        lastCheckpoint = Date.now();
        try { await service.checkpoint(guardFor(a, true)); } catch (error) { report(error, a); }
        publish(a);
    }
    function startPlan(reason: PlanReason) {
        const a = current();
        if (!a || a.leaving || planning) { if (planning && reason === 'response') { responseQueued = true; } return; }
        const active = new AbortController(); planning = active; planReason = reason; publish(a);
        const ownsPlan = () => current() === a && planning === active && !active.signal.aborted && !a.leaving;
        const planGuard = () => ownsPlan() && idle();
        service.plan(reason, work => runIslandGm(work, { agent, memory, signal: active.signal, guard: planGuard }), planGuard).then(result => {
            if (!ownsPlan()) { return; }
            emptyPlans = result.applied ? 0 : emptyPlans + 1;
            if (!result.applied) {
                nextPlanAt = Date.now() + PLAN_PAUSE_MILLISECONDS;
                if (emptyPlans >= MAX_EMPTY_PLANS) { fail('agent_empty'); }
            }
        }).catch((error: unknown) => {
            if (!ownsPlan()) { return; }
            const code = (error as { code?: string })?.code ?? '';
            if (QUIET_PLAN_ENDINGS.includes(code)) { nextPlanAt = Date.now() + PLAN_PAUSE_MILLISECONDS; return; }
            planFault = { code: code || 'island_failed', message: error instanceof Error ? error.message : String(error) };
            // Model failures belong to conversation, not the room's global recovery banner.
            // Save failures still need the client's uncertainty/recovery tracking.
            if (savesUncertain(code)) { report(error, a); }
        }).finally(() => {
            if (!ownsPlan()) { return; }
            planning = null; planReason = null;
            publish(a);
            if (responseQueued && !planFault && !planHold) { responseQueued = false; startPlan('response'); }
        });
    }
    // Decisions are asked for in the background; the world has already moved on by the time they return.
    function planWhenDue(now: number) {
        if (planning || planFault || planHold || now < nextPlanAt) { return; }
        if (service.awaitingPlan()) { startPlan('decision'); }
    }
    function pulse() {
        const now = Date.now(), elapsed = now - lastPulse; lastPulse = now;
        if (!live || !current() || !idle()) { return; }
        if (service.tick(elapsed)) { publish(); planWhenDue(now); }
        if (now - lastCheckpoint >= CHECKPOINT_MILLISECONDS) { void checkpoint(); }
    }
    function startTimer() { if (!timer) { lastPulse = lastCheckpoint = Date.now(); timer = setInterval(pulse, PULSE_MILLISECONDS); } }
    function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
    function stopLive() { service.steer(null); live = false; stopTimer(); }
    function stopWork() {
        interpreting?.abort(); planning?.abort();
        interpreting = null; planning = null; planReason = null; responseQueued = false;
    }
    async function leave() {
        const a = current();
        stopLive(); stopWork();
        if (!a) { return; }
        a.leaving = true;
        try { await service.checkpoint(guardFor(a, true)); } finally { if (activation === a) { activation = null; } }
    }

    return { ...primary,
        async activate(context) {
            const result = await primary.activate?.(context);
            stopWork(); stopLive();
            activation = { identity: identity(), post: context.post, leaving: false }; startTimer();
            return result;
        },
        async handleMessage(message) {
            if (!message.type.startsWith('game/island/')) { return primary.handleMessage?.(message); }
            const p = object(message.payload), a = current();
            if (!a || p.chatIdentity !== a.identity) { fail('identity'); }
            if (a.leaving) { fail('stale'); }
            const guard = guardFor(a);
            switch (message.type) {
                case 'game/island/cancel': stopWork(); planHold = true; publish(a); return view();
                case 'game/island/steer': {
                    const x = Number(p.x), y = Number(p.y);
                    if (!Number.isFinite(x) || !Number.isFinite(y)) { fail('invalid'); }
                    if (!live && (x || y)) { return {}; }
                    service.steer(x || y ? { x, y } : null); return {};
                }
                case 'game/island/live': {
                    const next = p.active === true;
                    if (next && !live) { lastPulse = Date.now(); }
                    if (!next && live) { service.steer(null); void checkpoint(); }
                    live = next; return {};
                }
                case 'game/island/act': {
                    service.player({ id: identifier(p.actionId) }, parseOperation(p.operation), guard);
                    publish(a); return settledView();
                }
                case 'game/island/context':
                    return { usage: await service.scene(work => measureGmContext(work, { agent, memory, signal: new AbortController().signal, guard })) };
                case 'game/island/dismiss-intent': service.dismissIntent(identifier(p.intentId)); publish(a); return settledView();
                case 'game/island/accept-intent':
                    service.acceptIntent({ id: identifier(p.actionId), generation: integer(p.revision) }, guard); publish(a); return settledView();
                case 'game/island/think': {
                    // Asking for a response or a retry is an explicit request: it lifts any hold and clears a shown failure.
                    planHold = false; planFault = null; emptyPlans = 0; nextPlanAt = 0;
                    if (member(p.reason, ['response', 'decision']) === 'response') { startPlan('response'); } else { planWhenDue(Date.now()); }
                    return view();
                }
                case 'game/island/interpret': {
                    const request = { id: identifier(p.actionId), generation: integer(p.revision) }, input = text(p.text, RULES.maxSpeechCharacters);
                    if (!guard() || request.generation !== service.generation) { fail('stale'); }
                    if (interpreting) { fail('busy'); }
                    const active = new AbortController(); interpreting = active; publish(a);
                    const ownsRequest = () => current() === a && interpreting === active && !active.signal.aborted && !a.leaving;
                    const activeGuard = () => ownsRequest() && idle();
                    const options = { agent, memory, signal: active.signal, guard: activeGuard };
                    void service.interpret(request, input,
                        (work, value, clarifications) => interpretPlayerIntent(work, value, options, clarifications), activeGuard)
                        .catch((error: unknown) => { if (ownsRequest()) { report(error, a, request.id); } })
                        .finally(() => {
                            if (!ownsRequest()) { return; }
                            interpreting = null; publish(a);
                        });
                    return view();
                }
                case 'game/island/history': return service.history(integer(p.after), integer(p.limit, 1, 100));
            }
            if (message.type === 'game/island/read' && busy) { return view(); }
            if (busy) { fail('busy'); }
            busy = true;
            try {
                if (message.type === 'game/island/settings') { a.post('os/navigate', { appId: 'agent-api' }); return settledView(); }
                if (message.type === 'game/island/read') { await service.refresh(); return settledView(); }
                if (message.type === 'game/island/confirm') {
                    if (memory.pending()) { await memory.confirm(guard); } else { await service.confirm(guard); }
                    await service.refresh(); return settledView();
                }
                if (message.type === 'game/island/start') {
                    stopWork(); planFault = null; planHold = false; emptyPlans = 0; nextPlanAt = 0;
                    await service.start({ id: identifier(p.actionId), revision: integer(p.revision) }, member(p.mode, ['start', 'restart']), parsePlayerIdentity(p.identity), guard);
                    lastCheckpoint = Date.now(); return settledView();
                }
                fail('invalid');
            } finally { busy = false; publish(a); }
        },
        async deactivate(reason) { try { await leave(); } finally { await primary.deactivate?.(reason); } },
        async cancelForeground(reason) { try { await leave(); } finally { await primary.cancelForeground?.(reason); } },
        async cancelAll(reason) { stopWork(); stopLive(); await primary.cancelAll?.(reason); },
        async handleChatChanged() { stopWork(); stopLive(); activation = null; await primary.handleChatChanged?.(); },
        async stopBackground() { stopWork(); stopLive(); await primary.stopBackground?.(); },
    };
}
export type IslandHostView = ReturnType<IslandService['view']> & { stamp: number; thinking: boolean; interpreting: boolean; memoryPending: boolean; planFault: string | null };
