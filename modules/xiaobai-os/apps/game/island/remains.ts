import { PERSON_IDS, type Journey, type Landscape, type PersonId, type Point } from './model.js';
import { ITEMS, SANITATION } from './survival-content.js';
import { canTravel, withinReach, perceives, distance } from './space.js';
import { accessibleItem } from './inventory.js';
import { record } from './experience.js';
import { fail } from './fault.js';
import { buriedBodies } from './burial-state.js';
import { buildingGround } from './environment.js';

export function handlingBody(world: Journey, subject: PersonId): PersonId | null {
    return PERSON_IDS.find(id => {
        const a = world.people[id].activity;
        return a?.kind === 'drag' && a.subject === subject
            || a?.kind === 'work' && ((a.task.kind === 'bury_body' || a.task.kind === 'cover_body') && a.task.subject === subject
                || a.task.kind === 'exhume_body' && buriedBodies(world).get(subject) === a.task.grave);
    }) ?? null;
}
export function reachableBody(world: Journey, actor: PersonId, subject: PersonId, land: Landscape) {
    const body = world.people[subject];
    return actor !== subject && body.body.kind === 'dead' && !buriedBodies(world).has(subject)
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
    const handler = handlingBody(world, subject);
    if (handler !== null && handler !== actor) { fail('body_held'); }
    const material = accessibleItem(world, actor, item);
    if (material.location.kind === 'worn' || !coveringMaterial(material.kind)) { fail('conditions'); }
}

function diggingTool(world: Journey, actor: PersonId, tool: string) {
    const item = accessibleItem(world, actor, tool);
    if (!SANITATION.diggingTools.includes(item.kind)) { fail('digging_tool'); }
}
export function checkBurial(world: Journey, actor: PersonId, subject: PersonId, tool: string, land: Landscape) {
    if (!reachableBody(world, actor, subject, land)) { fail('unavailable'); }
    const handler = handlingBody(world, subject);
    if (handler !== null && handler !== actor) { fail('body_held'); }
    const position = world.people[subject].position;
    if (!buildingGround(position)) { fail('burial_ground'); }
    if (Object.values(world.resources).some(r => r.kind === 'seep' && distance(r.position, position) < SANITATION.waterSeparation)
        || Object.values(world.structures).some(s => s.water && distance(s.position, position) < SANITATION.waterSeparation)) { fail('burial_water'); }
    if ([...buriedBodies(world).keys()].some(id => distance(world.people[id].position, position) < SANITATION.graveRadius * 2)) { fail('burial_overlap'); }
    diggingTool(world, actor, tool);
}
export function checkExhumation(world: Journey, actor: PersonId, grave: number, tool: string, land: Landscape): PersonId {
    const subject = [...buriedBodies(world)].find(([, reference]) => reference === grave)?.[0];
    if (!subject || !withinReach(world.people[actor].position, world.people[subject].position)
        || !perceives(world, actor, world.people[subject].position, 'sight', land)) { fail('unavailable'); }
    const handler = handlingBody(world, subject);
    if (handler !== null && handler !== actor) { fail('body_held'); }
    diggingTool(world, actor, tool);
    return subject;
}
