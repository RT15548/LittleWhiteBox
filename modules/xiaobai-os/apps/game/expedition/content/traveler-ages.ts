export const TRAVELER_AGES = Object.freeze({
    twenties: '看起来20上下',
    thirties: '看起来30上下',
    forties: '看起来40上下',
    elder: '看起来是老者',
});
export type TravelerAge = keyof typeof TRAVELER_AGES;
export const TRAVELER_AGE_IDS = Object.keys(TRAVELER_AGES) as TravelerAge[];
