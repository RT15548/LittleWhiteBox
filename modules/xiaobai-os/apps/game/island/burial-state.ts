import type { Experience, Journey, PersonId } from './model.js';

// The burial/removal experiences are the only lasting facts. This index belongs to
// one in-memory history array and disappears with it; cloned worlds rebuild it.
const indexes = new WeakMap<Experience[], { cursor: number; buried: Map<PersonId, number> }>();
export function buriedBodies(world: Pick<Journey, 'experiences'>): ReadonlyMap<PersonId, number> {
    let index = indexes.get(world.experiences);
    if (!index) { index = { cursor: 0, buried: new Map() }; indexes.set(world.experiences, index); }
    while (index.cursor < world.experiences.length) {
        const event = world.experiences[index.cursor++], payload = event.payload;
        if (payload.kind === 'body_buried') { index.buried.set(payload.subject, event.sequence); }
        if (payload.kind === 'body_exhumed') { index.buried.delete(payload.subject); }
    }
    return index.buried;
}
