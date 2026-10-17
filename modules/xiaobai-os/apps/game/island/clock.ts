import { PERSON_IDS, type Journey, type Landscape, type Needs, type PersonId } from './model.js';
import { RULES } from './content.js';
import { canTravel, distance, perceives } from './space.js';
import { isEnded, requireLivingWorld } from './world.js';
import { record } from './experience.js';
import { canTake } from './operations.js';
import { workTick } from './work.js';
import { physiologyTick, walkSpeedFactor } from './physiology.js';
import { discover, discoveryIndex } from './discovery.js';
import { cancelBrokenOffers } from './handoff.js';
import { placeBody } from './remains.js';
import { SURVIVAL } from './survival-content.js';
import { settleCare } from './care.js';
import { approachContacts, settleContacts } from './contact.js';
import { buriedBodies } from './burial-state.js';
import { conflictTick } from './conflict.js';

function contacts(world: Journey, land: Landscape) {
    return PERSON_IDS.map(a => PERSON_IDS.map(b => a !== b
        ? [world.people[b].body.kind === 'living' && perceives(world, a, world.people[b].position, 'sound', land),
            !buriedBodies(world).has(b) && perceives(world, a, world.people[b].position, 'sight', land)] : null));
}
function travelTick(world: Journey, actor: PersonId, land: Landscape): 'arrived' | 'interrupted' | null {
    const person = world.people[actor], activity = person.activity;
    if (activity?.kind !== 'travel' && activity?.kind !== 'drag') { return null; }
    const body = activity.kind === 'drag' ? world.people[activity.subject] : null;
    let remaining = RULES.walkMetresPerSecond * walkSpeedFactor(world, actor) * (body ? SURVIVAL.dragSpeedFactor : 1);
    while (activity.route.length && remaining > 0) {
        const target = activity.route[0], span = distance(person.position, target);
        const reached = span <= remaining;
        const next = reached ? { ...target } : { x: person.position.x + (target.x - person.position.x) * (remaining / span),
            y: person.position.y + (target.y - person.position.y) * (remaining / span) };
        const bodyNext = body ? { x: next.x + (body.position.x - person.position.x), y: next.y + (body.position.y - person.position.y) } : null;
        if (!canTravel(person.position, next, land) || body && bodyNext && !canTravel(body.position, bodyNext, land)) {
            placeBody(world, actor, land);
            person.activity = null; return 'interrupted';
        }
        if (body && bodyNext) { body.position = bodyNext; }
        person.position = next;
        // A partial segment spends this tick's entire movement budget. Multiplying
        // the fraction back can leave an unspendable subnormal remainder forever.
        remaining = reached ? remaining - span : 0;
        if (reached) { activity.route.shift(); }
    }
    if (!activity.route.length) {
        placeBody(world, actor, land);
        person.activity = null; return 'arrived';
    }
    return null;
}
function noticeBodies(world: Journey, land: Landscape) {
    for (const subject of PERSON_IDS) {
        if (world.people[subject].body.kind !== 'dead' || buriedBodies(world).has(subject)) { continue; }
        for (const actor of PERSON_IDS) {
            if (!perceives(world, actor, world.people[subject].position, 'sight', land)) { continue; }
            const known = world.experiences.some(e => e.audience.includes(actor)
                && (e.payload.kind === 'died' && e.payload.actor === subject || (e.payload.kind === 'noticed_body' || e.payload.kind === 'body_handling' || e.payload.kind === 'body_covered' || e.payload.kind === 'body_exhumed') && e.payload.subject === subject));
            if (!known) { record(world, { kind: 'noticed_body', actor, subject }, world.people[subject].position, 'sight', land, [actor]); }
        }
    }
}
function completeHandling(world: Journey, land: Landscape) {
    const attempts = new Map<string, PersonId[]>();
    for (const actor of PERSON_IDS) {
        const person = world.people[actor], a = person.activity;
        if (a?.kind === 'take' && a.until <= world.clock) {
            person.activity = null;
            if (!canTake(world, actor, a.item, land)) {
                record(world, { kind: 'take_unavailable', actor, item: a.item }, person.position, 'sight', land, [actor]);
            } else { attempts.set(a.item, [...(attempts.get(a.item) ?? []), actor]); }
        }
    }
    // All candidates at this world instant are collected before anyone receives the object.
    for (const [item, actors] of attempts) {
        const position = world.people[actors[0]].position;
        if (actors.length > 1) { record(world, { kind: 'contested', actors, item }, position, 'sight', land, actors); }
        else {
            world.items[item].location = { kind: 'carried', person: actors[0] };
            record(world, { kind: 'taken', actor: actors[0], item }, position, 'sight', land, actors);
        }
    }
}

// The living world's clock. It steps one game second in place and never waits for a decision:
// people without a plan stand still until their plan arrives, while everyone else keeps living.
// The caller owns pacing and persistence; the discovery index belongs to this world instance.
export function createWorldClock(world: Journey, land: Landscape) {
    const discoveries = discoveryIndex(world);
    return {
        /** Returns false once the journey has ended. */
        tick(): boolean {
            requireLivingWorld(world);
            const initialContacts = contacts(world, land);
            const before = Object.fromEntries(PERSON_IDS.map(id => {
                const body = world.people[id].body;
                return [id, body.kind === 'living' ? { ...body.needs } : null];
            })) as Record<PersonId, Needs | null>;
            world.clock++;
            const walked = approachContacts(world, land);
            const movement: { actor: PersonId; kind: 'arrived' | 'interrupted' }[] = [];
            for (const actor of PERSON_IDS) {
                const person = world.people[actor];
                if (person.body.kind === 'dead') { continue; }
                const from = person.position, kind = travelTick(world, actor, land);
                walked[actor] += distance(from, person.position);
                if (kind) { movement.push({ actor, kind }); }
            }
            // Observe results only after everybody has moved for this instant.
            for (const receipt of movement) { record(world, receipt, world.people[receipt.actor].position, 'sight', land, [receipt.actor]); }
            conflictTick(world, land);
            cancelBrokenOffers(world, land);
            settleCare(world, land);
            settleContacts(world, land);
            noticeBodies(world, land);
            workTick(world, land);
            completeHandling(world, land);
            discover(world, land, discoveries);
            physiologyTick(world, land, before, walked);
            if (isEnded(world)) { return false; }
            for (const actor of PERSON_IDS) {
                const person = world.people[actor];
                if (person.activity?.kind === 'rest' && person.activity.until <= world.clock) {
                    person.activity = null; record(world, { kind: 'rested', actor }, person.position, 'sight', land, [actor]);
                }
            }
            const currentContacts = contacts(world, land);
            currentContacts.forEach((row, a) => row.forEach((value, b) => {
                if (!value || !value.some((seen, sense) => seen && !initialContacts[a][b]?.[sense])) { return; }
                if (value[1] && !initialContacts[a][b]?.[1] && world.people[PERSON_IDS[a]].body.kind === 'living' && world.people[PERSON_IDS[b]].body.kind === 'living') {
                    record(world, { kind: 'encounter', actor: PERSON_IDS[a], subject: PERSON_IDS[b] }, world.people[PERSON_IDS[a]].position, 'self', land, [PERSON_IDS[a]]);
                }
            }));
            return true;
        },
    };
}
