import { PERSON_IDS, type Journey, type Landscape, type PersonId, type Point, type StrikeForm } from './model.js';
import { canTravel, distance, perceives } from './space.js';
import { GUARD, STRIKES } from './interaction-content.js';
import { record } from './experience.js';
import { fail } from './fault.js';
import { releaseContact, settleContacts } from './contact.js';
import { settleCare } from './care.js';
import { placeBody } from './remains.js';

export function strikeReach(world: Journey, actor: PersonId, to: PersonId, form: StrikeForm, land: Landscape) {
    const a = world.people[actor], b = world.people[to];
    return actor !== to && a.body.kind === 'living' && b.body.kind === 'living'
        && distance(a.position, b.position) <= STRIKES[form].reach
        && perceives(world, actor, b.position, 'sight', land) && canTravel(a.position, b.position, land);
}
function witnesses(world: Journey, actor: PersonId, to: PersonId, land: Landscape) {
    return PERSON_IDS.filter(id => id === actor || id === to || perceives(world, id, world.people[actor].position, 'sight', land)
        && perceives(world, id, world.people[to].position, 'sight', land));
}
export function beginStrike(world: Journey, actor: PersonId, to: PersonId, form: StrikeForm, land: Landscape) {
    if (!strikeReach(world, actor, to, form, land)) { fail('strike_reach'); }
    world.people[actor].activity = { kind: 'strike', to, form, until: world.clock + STRIKES[form].seconds };
    record(world, { kind: 'strike_started', actor, to, form }, world.people[actor].position, 'self', land, witnesses(world, actor, to, land));
}
// An emergency guard is an explicit decision to abandon one's current activity.
export function stopForConflict(world: Journey, actor: PersonId, land: Landscape) {
    releaseContact(world, actor, land); placeBody(world, actor, land);
    if (world.people[actor].activity) {
        world.people[actor].activity = null;
        record(world, { kind: 'interrupted', actor }, world.people[actor].position, 'sight', land, [actor]);
    }
    settleCare(world, land); settleContacts(world, land);
}
function strength(world: Journey, actor: PersonId) {
    const body = world.people[actor].body;
    if (body.kind === 'dead') { return 0; }
    const n = body.needs;
    return Math.max(.2, 1 - n.fatigue * .005 - n.skinWound * .3 - n.illness * .3 - Math.max(0, -n.energy) / 12000);
}
export function conflictTick(world: Journey, land: Landscape) {
    // Decide simultaneous outcomes before any result interrupts a participant or moves a target.
    const outcomes = PERSON_IDS.flatMap(actor => {
        const a = world.people[actor].activity;
        if (a?.kind !== 'strike' || a.until > world.clock) { return []; }
        const target = world.people[a.to];
        const outcome = !strikeReach(world, actor, a.to, a.form, land) ? 'missed'
            : target.activity?.kind === 'guard' && target.body.kind === 'living' && target.body.needs.fatigue < GUARD.fatigueLimit ? 'blocked' : 'hit';
        return [{ actor, to: a.to, form: a.form, outcome, strength: strength(world, actor),
            audience: witnesses(world, actor, a.to, land), from: { ...world.people[actor].position }, target: { ...target.position } }] as const;
    });
    const pushes = new Map<PersonId, Point>();
    for (const o of outcomes) { world.people[o.actor].activity = null; }
    for (const o of outcomes) {
        const actor = world.people[o.actor], target = world.people[o.to], rule = STRIKES[o.form];
        if (actor.body.kind === 'living') { actor.body.needs.fatigue = Math.min(100, actor.body.needs.fatigue + rule.fatigue); }
        if (target.body.kind === 'living' && o.outcome !== 'missed') {
            target.body.needs.fatigue = Math.min(100, target.body.needs.fatigue + rule.fatigue * .5);
            if (o.outcome === 'hit') {
                stopForConflict(world, o.to, land);
                target.body.needs.skinWound = Math.min(1, target.body.needs.skinWound + rule.wound * o.strength);
                const span = distance(o.from, o.target), displacement = rule.displacement * o.strength;
                if (span && displacement) {
                    const sum = pushes.get(o.to) ?? { x: 0, y: 0 };
                    sum.x += (o.target.x - o.from.x) / span * displacement;
                    sum.y += (o.target.y - o.from.y) / span * displacement;
                    pushes.set(o.to, sum);
                }
            }
        }
        record(world, { kind: 'strike_resolved', actor: o.actor, to: o.to, form: o.form, outcome: o.outcome }, o.from, 'self', land, o.audience);
    }
    for (const [id, sum] of pushes) {
        const target = world.people[id], next = { x: target.position.x + sum.x, y: target.position.y + sum.y };
        if (canTravel(target.position, next, land)) { target.position = next; }
    }
    for (const actor of PERSON_IDS) {
        const a = world.people[actor].activity;
        if (a?.kind === 'guard' && a.until <= world.clock) {
            world.people[actor].activity = null;
            record(world, { kind: 'interrupted', actor }, world.people[actor].position, 'sight', land, [actor]);
        }
    }
    settleCare(world, land); settleContacts(world, land);
}
