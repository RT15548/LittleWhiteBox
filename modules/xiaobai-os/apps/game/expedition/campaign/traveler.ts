import { fault } from '../random.js';
import { member, object } from '../validation.js';
import { TRAVELER_AGE_IDS, type TravelerAge } from '../content/traveler-ages.js';

export const TRAVELER_GENDERS = ['male', 'female'] as const;
export const TRAVELER_NAME_LIMIT = 24;
export interface Traveler { name: string; gender: typeof TRAVELER_GENDERS[number]; appearanceAge?: TravelerAge }
export function parseTraveler(raw: unknown): Traveler {
    const value = object(raw);
    if (typeof value.name !== 'string' || !value.name.trim() || value.name.trim().length > TRAVELER_NAME_LIMIT || /[\r\n]/.test(value.name)) { fault('invalid'); }
    return { name: value.name.trim(), gender: member(value.gender, TRAVELER_GENDERS),
        ...value.appearanceAge === undefined ? {} : { appearanceAge: member(value.appearanceAge, TRAVELER_AGE_IDS) } };
}
