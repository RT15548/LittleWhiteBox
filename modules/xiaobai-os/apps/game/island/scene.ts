import { PERSON_IDS, type Authority, type Experience, type Journey, type Landscape, type NpcId, type PersonId, type SceneScope } from './model.js';
import { perceives, perceivesStructure, witnesses, itemPosition, withinReach } from './space.js';
import { fail } from './fault.js';
import { requireLivingWorld } from './world.js';
import { knownDeclarations } from './experience.js';
import { weatherAt } from './environment.js';
import { knownPlaces } from './discovery.js';
import { knownAgreements } from './cooperation.js';
import { visibleOffers } from './handoff.js';
import { observeFood } from './food.js';
import { observeWater } from './water.js';

export function openScene(world: Journey, anchor: PersonId, land: Landscape): SceneScope {
    requireLivingWorld(world);
    if (!world.people[anchor] || world.people[anchor].body.kind === 'dead') { fail('dead'); }
    const local = witnesses(world, world.people[anchor].position, 'sound', land);
    const audience = new Set(local.flatMap(id => witnesses(world, world.people[id].position, 'sound', land)));
    const actors = local.filter((id): id is NpcId => id !== 'player');
    return { journey: world.id, clock: world.clock, anchor, actors, audience: PERSON_IDS.filter(id => audience.has(id)),
        mode: local.length === 1 ? 'alone' : audience.size === 2 ? 'private' : 'group',
        signature: JSON.stringify(PERSON_IDS.map(id => [id, world.people[id].position, world.people[id].body.kind])) };
}

export function assertAuthority(world: Journey, authority: Authority, actor: PersonId, land: Landscape) {
    requireLivingWorld(world);
    if (authority.kind === 'player') { if (actor !== 'player') { fail('authority'); } }
    else {
        const current = validateScene(world, authority.scene, land);
        if (actor === 'player' || !current.actors.includes(actor)) { fail('authority'); }
    }
    if (!world.people[actor] || world.people[actor].body.kind === 'dead') { fail('dead'); }
}

export function validateScene(world: Journey, scene: SceneScope, land: Landscape): SceneScope {
    const current = openScene(world, scene.anchor, land);
    if (JSON.stringify(current) !== JSON.stringify(scene)) { fail('stale_scene'); }
    return current;
}

// A view is a current observation, not a seven-person administrative snapshot.
export function observe(world: Journey, observer: PersonId, land: Landscape) {
    const self = world.people[observer];
    let intention: Experience | null = null;
    for (let i = world.experiences.length - 1; i >= 0; i--) {
        const event = world.experiences[i];
        if (event.payload.kind === 'intention' && event.payload.actor === observer) { intention = structuredClone(event); break; }
    }
    const people = PERSON_IDS.filter(id => id !== observer && perceives(world, observer, world.people[id].position, 'sight', land))
        .map(id => ({ id, position: { ...world.people[id].position },
            body: { kind: world.people[id].body.kind }, activity: world.people[id].activity?.kind ?? null,
            work: world.people[id].activity?.kind === 'work' ? world.people[id].activity.task.kind : null }));
    // Transient visible use, not inventory access or another persisted item location.
    const using = [observer, ...people.map(person => person.id)].flatMap(person => {
        const actor = world.people[person], activity = actor.activity;
        if (actor.body.kind !== 'living' || activity?.kind !== 'work') { return []; }
        const task = activity.task;
        if (task.kind !== 'drink' && task.kind !== 'eat') { return []; }
        const item = world.items[task.kind === 'drink' ? task.container : task.item];
        if (!item || item.quantity <= 0 || item.location.kind !== 'carried' || item.location.person !== person) { return []; }
        return [{ person, form: item.kind, wetness: item.wetness, units: 1 as const }];
    });
    const items = Object.entries(world.items).filter(([id, item]) => item.quantity > 0 && (item.location.kind === 'carried'
        ? item.location.person === observer || world.people[item.location.person].body.kind === 'dead' && perceives(world, observer, itemPosition(world, id)!, 'sight', land)
        : item.location.kind === 'worn' && item.location.person === observer || perceives(world, observer, itemPosition(world, id)!, 'sight', land)))
        .map(([id, item]) => {
            const { foodSince: _foodSince, water, ...visibleItem } = structuredClone(item), near = withinReach(self.position, itemPosition(world, id)!);
            return { id, ...visibleItem, water: observeWater(water, world.clock, near), food: observeFood(item, world.clock, near) };
        });
    const visible = <T extends { position: { x: number; y: number } }>(values: Record<string, T>) => Object.entries(values)
        .filter(([, v]) => perceives(world, observer, v.position, 'sight', land)).map(([id, v]) => ({ id, ...structuredClone(v) }));
    return { clock: world.clock, observer, self: structuredClone(self), people, items, using,
        intention, offers: visibleOffers(world, observer, land),
        resources: visible(world.resources), structures: Object.entries(world.structures)
            .filter(([, site]) => perceivesStructure(world, observer, site, land))
            .map(([id, { builder: _builder, water, ...site }]) => ({ id, ...structuredClone(site),
                water: observeWater(water, world.clock, withinReach(self.position, site.position)) })),
        waste: visible(world.waste).map(w => ({ id: w.id, position: w.position, kind: w.covered ? 'disturbed_ground' as const : w.kind })),
        weather: weatherAt(world), declarations: knownDeclarations(world, observer), agreements: knownAgreements(world, observer), knownPlaces: knownPlaces(world, observer) };
}
