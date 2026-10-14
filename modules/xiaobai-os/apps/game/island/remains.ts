import { PERSON_IDS, type Journey, type Landscape, type PersonId, type Point } from './model.js';
import { ITEMS } from './survival-content.js';
import { canTravel, withinReach, perceives } from './space.js';
import { accessibleItem } from './inventory.js';
import { record } from './experience.js';
import { fail } from './fault.js';

export function handlingBody(world: Journey, subject: PersonId): PersonId | null {
    return PERSON_IDS.find(id => {
        const a = world.people[id].activity;
        return a?.kind === 'drag' && a.subject === subject;
    }) ?? null;
}
export function reachableBody(world: Journey, actor: PersonId, subject: PersonId, land: Landscape) {
    const body = world.people[subject];
    return actor !== subject && body.body.kind === 'dead'
        && withinReach(world.people[actor].position, body.position)
        && perceives(world, actor, body.position, 'sight', land);
}
export function dragRoute(world: Journey, actor: PersonId, subject: PersonId, route: Point[], land: Landscape) {
    if (!reachableBody(world, actor, subject, land)) { fail('unavailable'); }
    const handler = handlingBody(world, subject);
    if (handler !== null && handler !== actor) { fail('body_held'); }
    let from = world.people[actor].position, body = world.people[subject].position;
    for (const to of route) {
        const next = { x: to.x + (body.x - from.x), y: to.y + (body.y - from.y) };
        if (!canTravel(from, to, land) || !canTravel(body, next, land)) { fail('blocked'); }
        from = to; body = next;
    }
}
export function placeBody(world: Journey, actor: PersonId, land: Landscape) {
    const a = world.people[actor].activity;
    if (a?.kind !== 'drag') { return; }
    world.people[actor].activity = null;
    record(world, { kind: 'body_handling', actor, subject: a.subject, stage: 'placed' }, world.people[a.subject].position, 'sight', land, [actor]);
}
export function coveringMaterial(kind: keyof typeof ITEMS): boolean {
    return !!(ITEMS[kind].materials.cover || ITEMS[kind].materials.fabric);
}
export function checkBodyCover(world: Journey, actor: PersonId, subject: PersonId, item: string, land: Landscape) {
    if (!reachableBody(world, actor, subject, land)) { fail('unavailable'); }
    if (handlingBody(world, subject) !== null) { fail('body_held'); }
    const material = accessibleItem(world, actor, item);
    if (material.location.kind === 'worn' || !coveringMaterial(material.kind)) { fail('conditions'); }
}
