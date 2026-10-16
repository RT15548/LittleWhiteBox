import { PERSON_IDS, type EventPayload, type Experience, type Journey, type NpcId } from './model.js';

function changesAttention(payload: EventPayload): boolean | null {
    if (payload.kind === 'contact_offered' || payload.kind === 'contact_response' || payload.kind === 'contact_ended' || payload.kind === 'strike_started') { return false; }
    if (['encounter', 'need', 'accident'].includes(payload.kind)) { return true; }
    if (payload.kind === 'body_handling' && payload.stage === 'started') { return false; }
    if (['intention', 'speech', 'declaration', 'departed', 'started', 'dropped', 'worn', 'unworn', 'offered', 'received', 'offer_declined', 'care_offered', 'care_response'].includes(payload.kind)) { return false; }
    return null;
}
function reactions({ payload, audience }: Experience) {
    const changes: { actor: NpcId; pending: boolean }[] = [];
    if (payload.kind === 'strike_started' || payload.kind === 'strike_resolved') {
        for (const actor of audience) {
            if (actor !== 'player' && actor !== payload.actor) { changes.push({ actor, pending: true }); }
        }
    }
    if (payload.kind === 'contact_offered' && payload.to !== 'player') { changes.push({ actor: payload.to, pending: true }); }
    if (payload.kind === 'contact_response' && payload.from !== 'player') { changes.push({ actor: payload.from, pending: !payload.accepted }); }
    if (payload.kind === 'contact_ended' && payload.with !== 'player') { changes.push({ actor: payload.with, pending: true }); }
    if (payload.kind === 'died' || payload.kind === 'noticed_body' || payload.kind === 'body_buried' || payload.kind === 'body_exhumed') {
        const deceased = payload.kind === 'died' ? payload.actor : payload.subject;
        for (const actor of audience) {
            if (actor !== 'player' && actor !== deceased) { changes.push({ actor, pending: true }); }
        }
    }
    if ((payload.kind === 'offered' || payload.kind === 'care_offered') && payload.to !== 'player') { changes.push({ actor: payload.to, pending: true }); }
    if (payload.kind === 'care_response' && !payload.accepted && payload.from !== 'player') { changes.push({ actor: payload.from, pending: true }); }
    if (payload.kind === 'taken') {
        for (const actor of audience) { if (actor !== 'player' && actor !== payload.actor) { changes.push({ actor, pending: true }); } }
    }
    const pending = changesAttention(payload);
    if ('actor' in payload && payload.actor !== 'player' && pending !== null) { changes.push({ actor: payload.actor, pending }); }
    return changes;
}

// Derived from lived encounters and subsequent choices; no persisted scheduler or second log.
// An advance owns this incremental index only until it commits its world candidate.
export function decisionIndex(world: Journey) {
    const pending = new Set<NpcId>(), resolved = new Set<NpcId>();
    const triggers = new Map<NpcId, Experience>();
    for (let i = world.experiences.length - 1; i >= 0 && resolved.size < PERSON_IDS.length - 1; i--) {
        for (const change of reactions(world.experiences[i])) {
            if (resolved.has(change.actor)) { continue; }
            resolved.add(change.actor); if (change.pending) { pending.add(change.actor); triggers.set(change.actor, world.experiences[i]); }
        }
    }
    let cursor = world.experiences.length;
    const read = () => {
        while (cursor < world.experiences.length) {
            const event = world.experiences[cursor++];
            for (const change of reactions(event)) {
                if (change.pending) { pending.add(change.actor); triggers.set(change.actor, event); }
                else { pending.delete(change.actor); triggers.delete(change.actor); }
            }
        }
        return PERSON_IDS.filter((id): id is NpcId => id !== 'player' && world.people[id].body.kind === 'living' && (!world.people[id].activity || pending.has(id)));
    };
    return Object.assign(read, { details: () => read().map(actor => {
        const event = triggers.get(actor);
        return { actor, reason: event?.payload.kind ?? 'idle', source: event?.sequence ?? null,
            activity: structuredClone(world.people[actor].activity) };
    }) });
}
export function awaitingDecision(world: Journey): NpcId[] { return decisionIndex(world)(); }
export function decisionDetails(world: Journey) { return decisionIndex(world).details(); }
