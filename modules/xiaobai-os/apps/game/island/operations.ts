import type { Authority, Journey, Landscape, Operation, PersonId } from './model.js';
import { RULES } from './content.js';
import { fail } from './fault.js';
import { assertAuthority } from './scene.js';
import { canStand, canTravel, withinReach, itemPosition, perceives } from './space.js';
import { record } from './experience.js';
import { parseOperation } from './validation.js';
import { beginConstruction, workDuration } from './work.js';
import { accessibleItem, carriedWeight, carryLimit } from './inventory.js';
import { ITEMS, WEAR_SLOTS } from './survival-content.js';
import { cooperationHistory } from './cooperation.js';
import { acceptOffer, canOffer, declineOffer } from './handoff.js';
import { dragRoute, placeBody } from './remains.js';
import { careDuration, respondToCare, settleCare } from './care.js';
import { buriedBodies } from './burial-state.js';
import { offerContact, releaseContact, respondToContact, settleContacts } from './contact.js';
import { beginStrike, stopForConflict } from './conflict.js';

export function canTake(world: Journey, actor: PersonId, itemId: string, land: Landscape): boolean {
    const item = Object.hasOwn(world.items, itemId) ? world.items[itemId] : null, position = itemPosition(world, itemId);
    if (!item || !position || !withinReach(world.people[actor].position, position)
        || !perceives(world, actor, position, 'sight', land)) { return false; }
    if (carriedWeight(world, actor) + ITEMS[item.kind].kilograms * item.quantity + (item.water?.millilitres ?? 0) / 1000 > carryLimit(world, actor)) { return false; }
    // A living holder is a physical counterparty, not an ownership permission flag.
    return item.location.kind === 'ground' || world.people[item.location.person].body.kind === 'dead' && !buriedBodies(world).has(item.location.person);
}

export function operate(source: Journey, authority: Authority, actor: PersonId, operation: Operation, land: Landscape): Journey {
    operation = parseOperation(operation);
    assertAuthority(source, authority, actor, land);
    const world = structuredClone(source), person = world.people[actor];
    if (operation.kind === 'intend') {
        if (actor === 'player' || authority.kind !== 'gm') { fail('authority'); }
        record(world, { kind: 'intention', actor, text: operation.text }, person.position, 'self', land, [actor]);
        return world;
    }
    if (operation.kind === 'say' || operation.kind === 'declare') {
        if (!operation.text.trim() || operation.text.length > RULES.maxSpeechCharacters) { fail('invalid'); }
        if (operation.kind === 'declare') {
            cooperationHistory(world.experiences).check(actor, operation.choice);
            if (operation.choice.kind === 'residence' && !canStand(operation.choice.position, land)) { fail('blocked'); }
            if (operation.choice.kind === 'support' && (operation.choice.person === actor || !world.people[operation.choice.person])) { fail('invalid'); }
            record(world, { kind: 'declaration', actor, text: operation.text, choice: operation.choice }, person.position, 'sound', land, [actor]);
        } else { record(world, { kind: 'speech', actor, text: operation.text }, person.position, 'sound', land, [actor]); }
        return world;
    }
    if (operation.kind === 'cancel') {
        releaseContact(world, actor, land);
        placeBody(world, actor, land);
        if (person.activity) { person.activity = null; record(world, { kind: 'interrupted', actor }, person.position, 'sight', land, [actor]); }
        settleCare(world, land);
        settleContacts(world, land);
        return world;
    }
    if (operation.kind === 'accept_contact' || operation.kind === 'decline_contact') {
        respondToContact(world, actor, operation.from, operation.kind === 'accept_contact', land); return world;
    }
    if (operation.kind === 'accept_care' || operation.kind === 'decline_care') {
        respondToCare(world, actor, operation.from, operation.kind === 'accept_care', land); return world;
    }
    if (operation.kind === 'accept') { acceptOffer(world, actor, operation.from, land); return world; }
    if (operation.kind === 'decline_offer') { declineOffer(world, actor, operation.from, land); return world; }
    if (operation.kind === 'guard') {
        stopForConflict(world, actor, land);
        person.activity = { kind: 'guard', until: world.clock + operation.seconds };
        record(world, { kind: 'started', actor, activity: 'guard' }, person.position, 'sight', land, [actor]);
        return world;
    }
    // Pointing somewhere else while walking changes the destination; it is not a new departure.
    const retargeting = operation.kind === 'travel' && person.activity?.kind === 'travel';
    if (retargeting) { person.activity = null; }
    if (person.activity) { fail('occupied'); }
    switch (operation.kind) {
        case 'offer_contact': offerContact(world, actor, operation.to, operation.form, land); break;
        case 'strike': beginStrike(world, actor, operation.to, operation.form, land); break;
        case 'offer_care':
            if (operation.to === actor) { fail('invalid'); }
            careDuration(world, actor, operation.to, operation.wound, operation.treatment, land);
            person.activity = structuredClone(operation);
            record(world, { kind: 'care_offered', actor, to: operation.to, wound: operation.wound, treatment: operation.treatment.kind }, person.position, 'self', land, [actor, operation.to]);
            break;
        case 'drag':
            dragRoute(world, actor, operation.subject, operation.route, land);
            person.activity = structuredClone(operation);
            record(world, { kind: 'body_handling', actor, subject: operation.subject, stage: 'started' }, world.people[operation.subject].position, 'sight', land, [actor]);
            break;
        case 'offer':
            if (!canOffer(world, actor, operation.to, operation.item, operation.units, land)) { fail('unavailable'); }
            person.activity = { ...operation };
            record(world, { kind: 'offered', actor, to: operation.to, item: operation.item, form: world.items[operation.item].kind, units: operation.units }, person.position, 'sight', land, [actor, operation.to]);
            break;
        case 'travel': {
            if (!operation.route.length || operation.route.length > RULES.maxRoutePoints) { fail('invalid'); }
            let from = person.position;
            for (const point of operation.route) {
                if (!canTravel(from, point, land)) { fail('blocked'); }
                from = point;
            }
            person.activity = { kind: 'travel', route: structuredClone(operation.route) };
            if (!retargeting) { record(world, { kind: 'departed', actor }, person.position, 'sight', land, [actor]); }
            break;
        }
        case 'rest':
            if (!Number.isSafeInteger(operation.seconds) || operation.seconds < 1 || operation.seconds > RULES.maxAdvanceSeconds) { fail('invalid'); }
            person.activity = { kind: 'rest', until: world.clock + operation.seconds };
            record(world, { kind: 'started', actor, activity: 'rest' }, person.position, 'sight', land, [actor]); break;
        case 'take':
            if (!canTake(world, actor, operation.item, land)) { fail('unavailable'); }
            person.activity = { kind: 'take', item: operation.item, until: world.clock + RULES.takeSeconds };
            record(world, { kind: 'started', actor, activity: 'take' }, person.position, 'sight', land, [actor]); break;
        case 'drop': {
            const item = Object.hasOwn(world.items, operation.item) ? world.items[operation.item] : null;
            if (!item?.quantity || item.location.kind === 'ground' || item.location.kind === 'dressing' || item.location.person !== actor) { fail('unavailable'); }
            item.location = { kind: 'ground', position: { ...person.position } };
            record(world, { kind: 'dropped', actor, item: operation.item }, person.position, 'sight', land, [actor]); break;
        }
        case 'work':
            person.activity = { kind: 'work', task: operation.task, remaining: workDuration(world, actor, operation.task, land) };
            record(world, { kind: 'started', actor, activity: 'work' }, person.position, 'sight', land, [actor]); break;
        case 'construct':
            beginConstruction(world, actor, operation.site);
            record(world, { kind: 'started', actor, activity: 'construct' }, person.position, 'sight', land, [actor]); break;
        case 'wear': case 'unwear': {
            const item = accessibleItem(world, actor, operation.item), slot = WEAR_SLOTS[item.kind];
            if (!slot || item.location.kind === 'ground' || operation.kind === 'wear' && item.location.kind !== 'carried'
                || operation.kind === 'unwear' && item.location.kind !== 'worn') { fail('conditions'); }
            if (operation.kind === 'wear' && Object.values(world.items).some(i => i.quantity && i.location.kind === 'worn'
                && i.location.person === actor && WEAR_SLOTS[i.kind] === slot)) { fail('conditions'); }
            item.location = { kind: operation.kind === 'wear' ? 'worn' : 'carried', person: actor };
            record(world, { kind: operation.kind === 'wear' ? 'worn' : 'unworn', actor, item: operation.item }, person.position, 'sight', land, [actor]);
            break;
        }
    }
    return world;
}
