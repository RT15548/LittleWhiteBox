import { PERSON_IDS, type EventPayload, type Experience, type Journey, type NpcId } from './model.js';

function changesAttention(payload: EventPayload): boolean | null {
    if (payload.kind === 'encounter') { return true; }
    if (payload.kind === 'body_handling' && payload.stage === 'started') { return false; }
    if (['intention', 'speech', 'declaration', 'departed', 'started', 'dropped', 'worn', 'unworn', 'offered', 'received'].includes(payload.kind)) { return false; }
    return null;
}
function reactions({ payload, audience }: Experience) {
    const changes: { actor: NpcId; pending: boolean }[] = [];
    if (payload.kind === 'died' || payload.kind === 'noticed_body') {
        const deceased = payload.kind === 'died' ? payload.actor : payload.subject;
        for (const actor of audience) {
            if (actor !== 'player' && actor !== deceased) { changes.push({ actor, pending: true }); }
        }
    }
    if (payload.kind === 'offered' && payload.to !== 'player') { changes.push({ actor: payload.to, pending: true }); }
    const pending = changesAttention(payload);
    if ('actor' in payload && payload.actor !== 'player' && pending !== null) { changes.push({ actor: payload.actor, pending }); }
    return changes;
}

// Derived from lived encounters and subsequent choices; no persisted scheduler or second log.
// An advance owns this incremental index only until it commits its world candidate.
export function decisionIndex(world: Journey) {
    const pending = new Set<NpcId>(), resolved = new Set<NpcId>();
    for (let i = world.experiences.length - 1; i >= 0 && resolved.size < PERSON_IDS.length - 1; i--) {
        for (const change of reactions(world.experiences[i])) {
            if (resolved.has(change.actor)) { continue; }
            resolved.add(change.actor); if (change.pending) { pending.add(change.actor); }
        }
    }
    let cursor = world.experiences.length;
    return () => {
        while (cursor < world.experiences.length) {
            for (const change of reactions(world.experiences[cursor++])) {
                if (change.pending) { pending.add(change.actor); } else { pending.delete(change.actor); }
            }
        }
        return PERSON_IDS.filter((id): id is NpcId => id !== 'player' && world.people[id].body.kind === 'living' && (!world.people[id].activity || pending.has(id)));
    };
}
export function awaitingDecision(world: Journey): NpcId[] { return decisionIndex(world)(); }
