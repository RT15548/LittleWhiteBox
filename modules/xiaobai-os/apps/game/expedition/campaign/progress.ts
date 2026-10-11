import type { Campaign } from './types.js';
import { CAPTIVE_IDS } from '../content/people-places.js';
import { SUPPLIES_HANDOFF } from '../content/supplies.js';
import { hasReturned } from './rescue.js';

/** Current chapter progress is a projection, not a second saved quest log. */
export function chapterProgress(campaign: Campaign) {
    const f = new Set(campaign.facts);
    const awaitingReturn = CAPTIVE_IDS.filter(id => !hasReturned(campaign.facts, id));
    const supplies = f.has(SUPPLIES_HANDOFF.fact) ? 'collected' : SUPPLIES_HANDOFF.object.condition.all.every(id => f.has(id)) ? 'ready' : 'held';
    const phase = f.has('chapter_completed') ? 'free' : !f.has('briefed') ? 'briefing' : !f.has('crossroads_cleared') ? 'road'
        : !f.has('captives_released') ? 'release' : !f.has('captives_arrived') ? 'return'
        : supplies === 'held' ? 'warden' : supplies === 'ready' ? 'supplies' : 'finish';
    return { phase, awaitingReturn, supplies, optionalRoots: f.has('warden_defeated') && !f.has('roots_cleared') } as const;
}
