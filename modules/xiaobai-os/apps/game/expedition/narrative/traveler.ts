import type { Traveler } from '../campaign/traveler.js';
import { TRAVELER_AGES } from '../content/traveler-ages.js';

export function travelerContext(traveler: Traveler) {
    return { name: traveler.name, gender: traveler.gender, adult: true,
        ...traveler.appearanceAge ? { appearanceAge: TRAVELER_AGES[traveler.appearanceAge] } : {} };
}
