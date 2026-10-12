import type { Campaign } from './types.js';
import type { CourtyardPerson } from '../content/world-types.js';
import { random } from '../random.js';

export const RELATIONSHIP_RULES = Object.freeze({ minimum: 0, maximum: 100, changeMin: 2, changeMax: 4,
    bands: [0, 21, 41, 61, 81] as readonly number[] });
export interface Relationship { affection: number; highestBand: number }
export type AffectionDirection = 'up' | 'down' | null;
export function relationshipBand(affection: number) {
    return RELATIONSHIP_RULES.bands.filter(start => affection >= start).length - 1;
}
/** Called once inside the same transaction as the received reply. Failed saves retain that candidate. */
export function settleAffection(campaign: Campaign, person: CourtyardPerson, direction: AffectionDirection) {
    const relation = campaign.relationships[person], before = relation.affection;
    if (direction) {
        const amount = RELATIONSHIP_RULES.changeMin + Math.floor(random(campaign) * (RELATIONSHIP_RULES.changeMax - RELATIONSHIP_RULES.changeMin + 1));
        relation.affection = Math.max(0, Math.min(100, before + (direction === 'up' ? amount : -amount)));
        relation.highestBand = Math.max(relation.highestBand, relationshipBand(relation.affection));
    }
    return relation.affection - before;
}
