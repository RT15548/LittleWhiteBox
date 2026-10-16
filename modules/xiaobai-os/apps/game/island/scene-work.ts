import type { Journey, Landscape, NpcId, Operation, PersonId } from './model.js';
import { openScene, observe } from './scene.js';
import { operate } from './operations.js';
import { memoryScope } from './memory.js';
import { fail } from './fault.js';
import { awaitingDecision, decisionDetails } from './attention.js';
import { createAgentKnowledge } from './agent-knowledge.js';

// In-memory work segment. The caller may discard it; only finish() supplies a candidate.
// No provider session, map-wide context or raw state is exposed to its tools.
export function createSceneWork(source: Journey, anchor: PersonId, land: Landscape) {
    let candidate = structuredClone(source);
    const scene = openScene(candidate, anchor, land), readers = memoryScope(scene);
    const operations: { actor: NpcId; operation: Operation }[] = [];
    return {
        ...createAgentKnowledge(() => candidate, readers, land),
        scope: () => structuredClone(scene),
        due: () => awaitingDecision(candidate).filter(id => readers.includes(id)),
        decisions: () => decisionDetails(candidate).filter(d => readers.includes(d.actor)),
        act(actor: NpcId, operation: Operation) {
            const before = candidate.experiences.length;
            candidate = operate(candidate, { kind: 'gm', scene }, actor, operation, land);
            operations.push({ actor, operation: structuredClone(operation) });
            const { identity: _identity, ...self } = observe(candidate, actor, land).self;
            return { observer: actor, self,
                recorded: candidate.experiences.slice(before).map(e => ({ sequence: e.sequence, kind: e.payload.kind, audience: [...e.audience] })),
                due: awaitingDecision(candidate).filter(id => readers.includes(id)),
                decisions: decisionDetails(candidate).filter(d => readers.includes(d.actor)) };
        },
        finish() {
            if (!operations.length) { fail('invalid'); }
            return { world: structuredClone(candidate), operations: structuredClone(operations) };
        },
    };
}
