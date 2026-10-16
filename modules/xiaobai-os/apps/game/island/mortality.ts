import { PERSON_IDS, type DeathCause, type Journey, type Landscape, type PersonId } from './model.js';
import { record } from './experience.js';
import { requireLivingWorld } from './world.js';
import { placeBody } from './remains.js';
import { settleCare } from './care.js';
import { settleContacts } from './contact.js';

// Trusted simulation boundary, deliberately absent from player and GM operations.
// The hazard/physiology rules must establish lethality before calling this function.
export function settleDeath(source: Journey, actor: PersonId, cause: DeathCause, land: Landscape): Journey {
    requireLivingWorld(source);
    const world = structuredClone(source);
    applyDeath(world, actor, cause, land);
    return world;
}

export function applyDeath(world: Journey, actor: PersonId, cause: DeathCause, land: Landscape) {
    const person = world.people[actor];
    if (person.body.kind === 'dead') { return world; }
    placeBody(world, actor, land);
    for (const other of PERSON_IDS) {
        const activity = world.people[other].activity;
        if ((activity?.kind === 'offer' || activity?.kind === 'strike') && activity.to === actor) {
            world.people[other].activity = null;
            record(world, { kind: 'interrupted', actor: other }, world.people[other].position, 'sight', land, [other]);
        }
    }
    settleCare(world, land, actor);
    settleContacts(world, land, actor);
    const event = record(world, { kind: 'died', actor }, person.position, 'sight', land, [actor]);
    person.body = { kind: 'dead', death: event.sequence, cause };
    person.activity = null;
    // Items still refer to the very same body. No second corpse inventory or death counter.
}
