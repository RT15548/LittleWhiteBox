import type { Journey, Landscape, Operation, WashSupply } from './model.js';
import { createAgentKnowledge } from './agent-knowledge.js';
import { operate } from './operations.js';
import { parseOperation, text } from './validation.js';
import { requireLivingWorld } from './world.js';
import { fail } from './fault.js';
import { observe } from './scene.js';
import { AGENT_POLICY } from './agent/policy.js';

function knownTargets(operation: PlayerOperation, view: ReturnType<typeof observe>) {
    const known = (id: string, values: { id: string }[]) => { if (!values.some(v => v.id === id)) { fail('unavailable'); } };
    const supply = (s: WashSupply) => { if (s.kind !== 'sea') { known(s.id, s.kind === 'container' ? view.items : [...view.resources, ...view.structures]); } };
    const op = operation.kind === 'work' ? operation.task : operation;
    if ('item' in op) { known(op.item, view.items); }
    if ('tool' in op) { known(op.tool, view.items); }
    if (op.kind === 'exhume_body' && !view.graves.some(g => g.grave === op.grave)) { fail('unavailable'); }
    if ('container' in op) { known(op.container, view.items); }
    if (op.kind === 'wash' || op.kind === 'wash_item') { supply(op.supply); }
    if (op.kind === 'tend' || op.kind === 'offer_care') {
        if (op.treatment.kind === 'rinse') { supply(op.treatment.supply); }
        if (op.treatment.kind === 'dress') { known(op.treatment.item, view.items); }
    }
    if ('materials' in op) { op.materials.forEach(m => known(m.item, view.items)); }
    if ('source' in op) { known(op.source, [...view.resources, ...view.structures]); }
    if ('site' in op) { known(op.site, view.structures); }
    if ('subject' in op && op.subject !== 'player') { known(op.subject, view.people); }
    if (op.kind === 'cover_waste') { known(op.waste, view.waste); }
    if (op.kind === 'ignite') { known(op.tinder, view.items); known(op.drill, view.items); }
}

export type PlayerOperation = Exclude<Operation, { kind: 'intend' }>;
export type IntentResult = { kind: 'action'; operation: PlayerOperation; seconds: number | null } | { kind: 'question'; text: string };
export interface IntentClarification { input: string; question: string }
export interface PlayerIntent { id: string; revision: number; text: string; clarifications: IntentClarification[]; result: IntentResult }

export function createIntentWork(source: Journey, land: Landscape) {
    requireLivingWorld(source);
    const world = structuredClone(source);
    let result: IntentResult | null = null;
    return {
        ...createAgentKnowledge(() => world, ['player'], land),
        journey: world.id,
        propose(raw: unknown) {
            if (result) { fail('intent_multiple'); }
            const operation = parseOperation(raw);
            if (operation.kind === 'intend') { fail('authority'); }
            knownTargets(operation, observe(world, 'player', land));
            // Validate against real rules, then discard the candidate without saving or elapsing.
            const next = operate(world, { kind: 'player' }, 'player', operation, land), activity = next.people.player.activity;
            const seconds = operation.kind === 'work' && activity?.kind === 'work' ? activity.remaining
                : operation.kind === 'rest' || operation.kind === 'take' || operation.kind === 'strike' || operation.kind === 'guard' ? (activity as { until: number }).until - world.clock
                    : operation.kind === 'construct' ? world.structures[operation.site].workLeft : null;
            result = { kind: 'action', operation, seconds };
            return { ready: true };
        },
        ask(raw: unknown) {
            if (result) { fail('intent_multiple'); }
            result = { kind: 'question', text: text(raw, AGENT_POLICY.questionCharacters) };
            return { ready: true };
        },
        done: () => result !== null,
        finish(): IntentResult { if (!result) { fail('agent_empty'); } return structuredClone(result); },
    };
}
