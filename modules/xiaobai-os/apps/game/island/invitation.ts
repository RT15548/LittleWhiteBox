import type { Journey, Operation, PersonId } from './model.js';
import { fail } from './fault.js';

/** Bind a response to the offered experience, so withdrawing and reoffering never reuses consent. */
export function invitationSequence(world: Journey, actor: PersonId, operation: Operation): number | null {
    switch (operation.kind) {
        case 'accept': case 'decline_offer':
        case 'accept_care': case 'decline_care':
        case 'accept_contact': case 'decline_contact': break;
        default: return null;
    }
    const kind = operation.kind === 'accept' || operation.kind === 'decline_offer' ? 'offer'
        : operation.kind === 'accept_care' || operation.kind === 'decline_care' ? 'offer_care' : 'offer_contact';
    const active = world.people[operation.from].activity;
    if (!active || (active.kind !== 'offer' && active.kind !== 'offer_care' && active.kind !== 'offer_contact')
        || active.kind !== kind || active.to !== actor) { fail('unavailable'); }
    for (let i = world.experiences.length - 1; i >= 0; i--) {
        const event = world.experiences[i], payload = event.payload;
        if (active.kind === 'offer' && payload.kind === 'offered' && payload.actor === operation.from) {
            if (payload.to !== actor || payload.item !== active.item || payload.units !== active.units) { fail('unavailable'); }
            return event.sequence;
        }
        if (active.kind === 'offer_care' && payload.kind === 'care_offered' && payload.actor === operation.from) {
            if (payload.to !== actor || payload.wound !== active.wound || payload.treatment !== active.treatment.kind) { fail('unavailable'); }
            return event.sequence;
        }
        if (active.kind === 'offer_contact' && payload.kind === 'contact_offered' && payload.actor === operation.from) {
            if (payload.to !== actor || payload.form !== active.form) { fail('unavailable'); }
            return event.sequence;
        }
    }
    return fail('unavailable');
}
