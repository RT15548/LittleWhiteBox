import { PERSON_IDS, type Journey, type Landscape, type PersonId, type Treatment, type Wound } from './model.js';
import { CARE } from './survival-content.js';
import { accessibleItem, createItem } from './inventory.js';
import { washingWater } from './hygiene.js';
import { weatherAt } from './environment.js';
import { withinReach, perceives } from './space.js';
import { fail } from './fault.js';
import { record } from './experience.js';

export const WOUND_FIELDS = { foot: { severity: 'footWound', dirt: 'footSoiling' }, skin: { severity: 'skinWound', dirt: 'skinSoiling' } } as const;
export function dressing(world: Journey, subject: PersonId, wound: Wound) {
    return Object.entries(world.items).find(([, i]) => i.quantity > 0 && i.location.kind === 'dressing' && i.location.person === subject && i.location.wound === wound);
}
export function careReach(world: Journey, actor: PersonId, subject: PersonId, land: Landscape) {
    return world.people[actor].body.kind === 'living' && world.people[subject].body.kind === 'living'
        && withinReach(world.people[actor].position, world.people[subject].position)
        && (actor === subject || perceives(world, actor, world.people[subject].position, 'sight', land));
}
export function careDuration(world: Journey, actor: PersonId, subject: PersonId, wound: Wound, treatment: Treatment, land: Landscape) {
    if (!careReach(world, actor, subject, land)) { fail('unavailable'); }
    const body = world.people[subject].body;
    if (body.kind !== 'living') { fail('dead'); }
    if (treatment.kind === 'uncover') {
        if (!dressing(world, subject, wound)) { fail('conditions'); }
        return CARE.uncoverSeconds;
    }
    if (body.needs[WOUND_FIELDS[wound].severity] <= 0) { fail('no_wound'); }
    if (treatment.kind === 'rinse') {
        const supply = washingWater(world, actor, treatment.supply, weatherAt(world).tide);
        if (!supply.clean || treatment.millilitres < CARE.rinseMl) { fail('care_water'); }
        if (supply.available < treatment.millilitres) { fail('unavailable'); }
        if (dressing(world, subject, wound)) { fail('covered_wound'); }
        return CARE.rinseSeconds;
    }
    const cloth = accessibleItem(world, actor, treatment.item);
    if (cloth.kind !== 'cloth' || !['ground', 'carried'].includes(cloth.location.kind)
        || cloth.soiling > CARE.cleanLimit || cloth.wetness > CARE.dressingMaxWetness) { fail('care_cloth'); }
    return CARE.dressSeconds;
}
export function requireCareConsent(world: Journey, actor: PersonId, subject: PersonId) {
    const receiving = world.people[subject].activity;
    if (subject !== actor && (receiving?.kind !== 'receive_care' || receiving.from !== actor)) { fail('care_consent'); }
}
export function respondToCare(world: Journey, subject: PersonId, from: PersonId, accepted: boolean, land: Landscape) {
    const helper = world.people[from], offer = helper.activity;
    if (from === subject || offer?.kind !== 'offer_care' || offer.to !== subject || !careReach(world, from, subject, land)) { fail('unavailable'); }
    if (accepted) {
        if (world.people[subject].activity) { fail('occupied'); }
        const remaining = careDuration(world, from, subject, offer.wound, offer.treatment, land);
        helper.activity = { kind: 'work', task: { kind: 'tend', subject, wound: offer.wound, treatment: offer.treatment }, remaining };
        world.people[subject].activity = { kind: 'receive_care', from };
    } else { helper.activity = null; }
    record(world, { kind: 'care_response', actor: subject, from, accepted }, world.people[subject].position, 'self', land, [subject, from]);
}
export function finishCare(world: Journey, actor: PersonId, subject: PersonId, wound: Wound, treatment: Treatment, land: Landscape) {
    const body = world.people[subject].body;
    if (body.kind !== 'living') { fail('dead'); }
    const old = dressing(world, subject, wound)?.[1];
    if (treatment.kind === 'rinse') {
        washingWater(world, actor, treatment.supply, weatherAt(world).tide).take(treatment.millilitres);
        body.needs[WOUND_FIELDS[wound].dirt] = CARE.cleanWoundDirt;
    } else {
        if (old) { old.location = { kind: 'ground', position: { ...world.people[subject].position } }; }
        if (treatment.kind === 'dress') {
            const cloth = world.items[treatment.item];
            let applied = cloth;
            if (cloth.quantity > 1) {
                cloth.quantity--;
                applied = world.items[createItem(world, actor, 'cloth', 1, cloth.wetness, cloth.soiling)];
            }
            applied.location = { kind: 'dressing', person: subject, wound };
        }
    }
    if (subject !== actor) { world.people[subject].activity = null; }
    record(world, { kind: 'tended', actor, subject, wound, treatment: treatment.kind }, world.people[subject].position, 'self', land, [actor, subject]);
}
// Reciprocal activities are the consent. No enduring permission or separate care queue.
export function settleCare(world: Journey, land: Landscape, ending?: PersonId) {
    for (const actor of PERSON_IDS) {
        const person = world.people[actor], a = person.activity;
        if (!a) { continue; }
        let broken = false;
        if (a.kind === 'offer_care') { broken = actor === ending || a.to === ending || !careReach(world, actor, a.to, land); }
        if (a.kind === 'receive_care') {
            const other = world.people[a.from].activity;
            broken = actor === ending || a.from === ending || !careReach(world, actor, a.from, land) || other?.kind !== 'work' || other.task.kind !== 'tend' || other.task.subject !== actor;
        }
        if (a.kind === 'work' && a.task.kind === 'tend' && a.task.subject !== actor) {
            const other = world.people[a.task.subject].activity;
            broken = actor === ending || a.task.subject === ending || !careReach(world, actor, a.task.subject, land) || other?.kind !== 'receive_care' || other.from !== actor;
        }
        if (broken) {
            person.activity = null;
            record(world, { kind: 'interrupted', actor }, person.position, 'self', land, [actor]);
        }
    }
}
