import type { Campaign } from './campaign/types.js';
import type { Participant } from './content/participants.js';
import { CLOTHING_SLOTS, INITIAL_CLOTHING, type Clothing, type ClothingChange, type ClothingSlot } from './content/clothing.js';

/** Only the six field names and value types are structural; descriptions are model-authored. */
export function readClothingChange(value: unknown): { change?: ClothingChange; rejected: boolean } {
    if (value === undefined || value === null) { return { rejected: false }; }
    if (typeof value !== 'object' || Array.isArray(value)) { return { rejected: true }; }
    const change: ClothingChange = {};
    let rejected = false;
    for (const [key, description] of Object.entries(value)) {
        if (!Object.hasOwn(CLOTHING_SLOTS, key) || description !== null && typeof description !== 'string') { rejected = true; continue; }
        change[key as ClothingSlot] = description;
    }
    return { ...(Object.keys(change).length ? { change } : {}), rejected };
}

/** Summaries leave the original turns intact. Replacing a turn also replaces its clothing changes. */
export function currentClothing(campaign: Pick<Campaign, 'conversations'>, person: Participant): Clothing {
    const current = { ...INITIAL_CLOTHING[person] };
    for (const turn of campaign.conversations[person]) {
        if (turn.kind === 'dialogue' && turn.clothing) { Object.assign(current, turn.clothing); }
    }
    return current;
}

export function clothingDifference(campaign: Campaign, person: Participant, submitted?: ClothingChange): ClothingChange | undefined {
    if (!submitted) { return undefined; }
    const current = currentClothing(campaign, person);
    const change = Object.fromEntries(Object.entries(submitted).filter(([key, value]) => current[key as ClothingSlot] !== value)) as ClothingChange;
    return Object.keys(change).length ? change : undefined;
}
