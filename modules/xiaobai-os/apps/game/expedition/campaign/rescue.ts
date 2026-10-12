import type { CourtyardFact, CourtyardPerson } from '../content/world-types.js';
import { PERSON_PLACES } from '../content/people-places.js';

/** Returning is a historical event, not the person's current location. The completed rescue entails both returns. */
export function hasReturned(facts: readonly CourtyardFact[], person: CourtyardPerson): boolean {
    const fact = PERSON_PLACES[person].returnFact;
    return fact !== null && (facts.includes('captives_arrived') || facts.includes(fact));
}

export function rescuePhase(facts: readonly CourtyardFact[], person: CourtyardPerson) {
    if (!PERSON_PLACES[person].returnFact) { return null; }
    return hasReturned(facts, person) ? 'returned' : facts.includes('captives_released') ? 'released' : 'confined';
}
