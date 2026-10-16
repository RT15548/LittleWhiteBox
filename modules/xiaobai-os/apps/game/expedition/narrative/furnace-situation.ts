import type { Campaign } from '../campaign/types.js';
import type { Participant } from '../content/participants.js';
import { FURNACE_FACTS, type FurnaceFact } from '../content/furnace/facts.js';

/** Public changes are current city life; private discoveries still require a witness. */
export function furnaceSituation(campaign: Campaign, person: Participant) {
    const facts = new Set(campaign.facts), known = new Set(campaign.knowledge[person]);
    const publicState: FurnaceFact | null = facts.has('city_rekindled') ? 'city_rekindled'
        : facts.has('division_works_started') ? 'division_works_started' : null;
    const situation: FurnaceFact[] = publicState ? [publicState] : [];
    if (!facts.has('city_rekindled')) {
        const latest = (['furnace_stilled', 'furnace_master_defeated', 'furnace_approach_ready', 'division_tested', 'division_plan_known', 'furnace_offer_heard', 'furnace_invited'] as const)
            .find(fact => facts.has(fact) && known.has(fact));
        if (latest) { situation.push(latest); }
    }
    return situation.map(id => ({ id, situation: FURNACE_FACTS[id] }));
}
