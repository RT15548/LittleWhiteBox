import { PERSON_IDS, type ContactForm, type Journey, type Landscape, type PersonId } from './model.js';
import { canTravel, distance, perceives, withinReach } from './space.js';
import { record } from './experience.js';
import { fail } from './fault.js';
import { CAST, PLAYER_BODIES } from './characters.js';
import { CONTACTS, CONTACT_APPROACH_SPEED } from './interaction-content.js';

// One reciprocal activity per participant. No relationship score or enduring permission.
export function contactReach(world: Journey, a: PersonId, b: PersonId, land: Landscape) {
    const first = world.people[a], second = world.people[b];
    return a !== b && first.body.kind === 'living' && second.body.kind === 'living'
        && withinReach(first.position, second.position)
        && perceives(world, a, second.position, 'sight', land) && perceives(world, b, first.position, 'sight', land)
        && canTravel(first.position, second.position, land);
}
function audience(world: Journey, a: PersonId, b: PersonId, land: Landscape) {
    return PERSON_IDS.filter(id => id === a || id === b || perceives(world, id, world.people[a].position, 'sight', land)
        && perceives(world, id, world.people[b].position, 'sight', land));
}
function placement(world: Journey, actor: PersonId, from: PersonId, form: ContactForm) {
    const self = world.people[actor], other = world.people[from];
    const height = (id: PersonId) => id === 'player' ? PLAYER_BODIES[world.playerIdentity.gender].heightMetres : CAST[id].heightMetres;
    const jacket = (id: PersonId) => Object.values(world.items).some(i => i.quantity && i.kind === 'lifejacket' && i.location.kind === 'worn' && i.location.person === id);
    const gap = (height(actor) + height(from)) / 2 * CONTACTS[form].gapPerHeight
        + (CONTACTS[form].sideBySide ? 0 : (jacket(actor) ? .08 : 0) + (jacket(from) ? .08 : 0));
    const span = distance(self.position, other.position), dx = span ? (self.position.x - other.position.x) / span : 0,
        dy = span ? (self.position.y - other.position.y) / span : 1;
    const center = { x: (self.position.x + other.position.x) / 2, y: (self.position.y + other.position.y) / 2 };
    return [{ x: center.x + dx * gap / 2, y: center.y + dy * gap / 2 }, { x: center.x - dx * gap / 2, y: center.y - dy * gap / 2 }];
}
export function offerContact(world: Journey, actor: PersonId, to: PersonId, form: ContactForm, land: Landscape) {
    if (!contactReach(world, actor, to, land)) { fail('contact_reach'); }
    world.people[actor].activity = { kind: 'offer_contact', to, form };
    record(world, { kind: 'contact_offered', actor, to, form }, world.people[actor].position, 'self', land, audience(world, actor, to, land));
}
export function respondToContact(world: Journey, actor: PersonId, from: PersonId, accepted: boolean, land: Landscape) {
    const other = world.people[from], invitation = other.activity, self = world.people[actor];
    if (invitation?.kind !== 'offer_contact' || invitation.to !== actor || !contactReach(world, actor, from, land)) { fail('contact_offer'); }
    if (accepted) {
        if (self.activity) { fail('occupied'); }
        const [own, partner] = placement(world, actor, from, invitation.form);
        if (!canTravel(self.position, own, land) || !canTravel(other.position, partner, land)) { fail('blocked'); }
        self.activity = { kind: 'contact', with: from, form: invitation.form }; other.activity = { kind: 'contact', with: actor, form: invitation.form };
    } else { other.activity = null; }
    record(world, { kind: 'contact_response', actor, from, form: invitation.form, accepted }, self.position, 'self', land, audience(world, actor, from, land));
    settleContacts(world, land);
}
// Positions change only on the shared clock, preserving the GM's scene scope during a turn.
export function approachContacts(world: Journey, land: Landscape) {
    const walked = Object.fromEntries(PERSON_IDS.map(id => [id, 0])) as Record<PersonId, number>;
    for (const actor of PERSON_IDS) {
        const self = world.people[actor], a = self.activity;
        if (a?.kind !== 'contact' || PERSON_IDS.indexOf(actor) > PERSON_IDS.indexOf(a.with)) { continue; }
        const other = world.people[a.with], [own, partner] = placement(world, actor, a.with, a.form);
        if (!canTravel(self.position, own, land) || !canTravel(other.position, partner, land)) { releaseContact(world, actor, land); continue; }
        for (const [id, target] of [[actor, own], [a.with, partner]] as const) {
            const p = world.people[id], span = distance(p.position, target);
            const amount = Math.min(CONTACT_APPROACH_SPEED, span);
            walked[id] = amount;
            if (span) { p.position = { x: p.position.x + (target.x - p.position.x) * amount / span, y: p.position.y + (target.y - p.position.y) * amount / span }; }
        }
    }
    return walked;
}
export function releaseContact(world: Journey, actor: PersonId, land: Landscape) {
    const a = world.people[actor].activity;
    if (a?.kind !== 'contact') { return; }
    const other = world.people[a.with];
    world.people[actor].activity = null;
    if (other.activity?.kind === 'contact' && other.activity.with === actor) { other.activity = null; }
    record(world, { kind: 'contact_ended', actor, with: a.with, form: a.form }, world.people[actor].position, 'self', land, audience(world, actor, a.with, land));
}
export function settleContacts(world: Journey, land: Landscape, ending?: PersonId) {
    for (const actor of PERSON_IDS) {
        const a = world.people[actor].activity;
        if (a?.kind === 'offer_contact' && (actor === ending || a.to === ending || !contactReach(world, actor, a.to, land))) {
            world.people[actor].activity = null;
            record(world, { kind: 'interrupted', actor }, world.people[actor].position, 'self', land, [actor]);
        }
        if (a?.kind === 'contact') {
            const other = world.people[a.with].activity;
            if (actor === ending || a.with === ending || !contactReach(world, actor, a.with, land) || other?.kind !== 'contact' || other.with !== actor || other.form !== a.form) {
                releaseContact(world, actor, land);
            }
        }
    }
}
