import { PERSON_IDS, type Journey, type Landscape, type PersonId } from './model.js';
import { perceives, perceivesStructure } from './space.js';
import { record } from './experience.js';

export function knownPlaces(world: Journey, observer: PersonId) {
    return world.experiences.flatMap(event => event.payload.kind === 'discovered' && event.audience.includes(observer)
        ? [{ subject: { ...event.payload.subject }, position: { ...event.position }, observedAt: event.at }] : []);
}

export function discoveryIndex(world: Journey) {
    const known = new Set<string>();
    for (const e of world.experiences) {
        if (e.payload.kind !== 'discovered') { continue; }
        for (const actor of e.audience) { known.add(`${actor}:${e.payload.subject.kind}:${e.payload.subject.id}`); }
    }
    return known;
}
export function discover(world: Journey, land: Landscape, known: Set<string>) {
    for (const actor of PERSON_IDS) {
        if (world.people[actor].body.kind === 'dead') { continue; }
        for (const [id, source] of Object.entries(world.resources)) {
            if (known.has(`${actor}:resource:${id}`) || !perceives(world, actor, source.position, 'sight', land)) { continue; }
            record(world, { kind: 'discovered', actor, subject: { kind: 'resource', id, form: source.kind } }, source.position, 'self', land, [actor]);
            known.add(`${actor}:resource:${id}`);
        }
        for (const [id, site] of Object.entries(world.structures)) {
            if (known.has(`${actor}:structure:${id}`) || !perceivesStructure(world, actor, site, land)) { continue; }
            // Seeing the structure does not identify its builder or reveal its construction conversations.
            record(world, { kind: 'discovered', actor, subject: { kind: 'structure', id, form: site.kind } }, site.position, 'self', land, [actor]);
            known.add(`${actor}:structure:${id}`);
        }
    }
}
