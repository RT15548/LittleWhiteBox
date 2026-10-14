import { PERSON_IDS, type EventPayload, type Experience, type Journey, type Landscape, type PersonId, type Point } from './model.js';
import { witnesses } from './space.js';

export function record(world: Journey, payload: EventPayload, position: Point, sense: 'sight' | 'sound' | 'self', land: Landscape,
    participants: readonly PersonId[] = []): Experience {
    const heard = new Set([...(sense === 'self' ? [] : witnesses(world, position, sense, land)), ...participants]);
    const event: Experience = { sequence: world.experiences.length + 1, at: world.clock, position: { ...position },
        audience: PERSON_IDS.filter(id => heard.has(id)), payload: structuredClone(payload) };
    world.experiences.push(event);
    return event;
}

export function knownExperiences(world: Journey, people: readonly PersonId[]): Experience[] {
    return world.experiences.filter(e => people.some(id => e.audience.includes(id)));
}

export function knownDeclarations(world: Journey, observer: PersonId) {
    const current = new Map<string, Experience>();
    for (const event of knownExperiences(world, [observer])) {
        const p = event.payload;
        if (p.kind !== 'declaration' || p.choice.kind !== 'residence' && p.choice.kind !== 'support') { continue; }
        const subject = p.choice.kind === 'support' ? `support:${p.choice.person}` : 'residence';
        current.set(`${p.actor}:${subject}`, event);
    }
    return [...current.values()].map(e => structuredClone(e));
}
