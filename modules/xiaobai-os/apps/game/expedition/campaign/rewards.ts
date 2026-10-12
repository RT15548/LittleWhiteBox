import { CHAPTER_GROWTH, NEW_RELIC_NODES, RELIC_PAIRINGS, STARTER_RELICS, type RewardNode } from '../content/campaign-rewards.js';
import { compatibleRelics, RELIC_SPECS, relicReady } from '../relics.js';
import { sample } from '../random.js';
import type { Relic, RelicStack } from '../types.js';
import type { Campaign } from './types.js';

export function grantRewardNode(campaign: Campaign, node: RewardNode) {
    if (campaign.rewards[node]) { return; }
    const loadout = { weapon: campaign.weapon, oaths: [], relics: campaign.collection.filter(r => campaign.equipped.includes(r.id)) };
    const reserved = new Set(Object.values(campaign.rewards).flatMap(r => r.offers.map(o => o.id)));
    const fresh = NEW_RELIC_NODES.includes(node);
    const pool = compatibleRelics(campaign.weapon).flatMap(id => {
        const rank = campaign.collection.find(r => r.id === id)?.rank ?? 0;
        return !reserved.has(id) && rank < CHAPTER_GROWTH.rankCap && (!fresh || !rank) && relicReady(loadout, id)
            && (RELIC_SPECS[id].chapter === 0 || campaign.facts.includes('warden_defeated')) ? [{ id, rank: rank + 1 }] : [];
    });
    const offers: RelicStack[] = [];
    const choose = (ids: readonly Relic[]) => {
        const candidates = pool.filter(r => ids.includes(r.id) && !offers.some(o => o.id === r.id));
        const picked = sample(campaign, candidates, 1)[0]; if (picked) { offers.push(picked); }
    };
    if (node === 'crossroads') { for (const id of STARTER_RELICS[campaign.weapon]) { choose([id]); } }
    else {
        choose(campaign.equipped.flatMap(id => RELIC_PAIRINGS[id] ?? []));
        choose(pool.filter(r => ['guard', 'life'].includes(RELIC_SPECS[r.id].family)).map(r => r.id));
    }
    offers.push(...sample(campaign, pool.filter(r => !offers.some(o => o.id === r.id)), CHAPTER_GROWTH.choices - offers.length));
    campaign.rewards[node] = { scene: campaign.location.scene, offers };
}
export const rewardOffers = (campaign: Campaign) => campaign.rewardNode ? campaign.rewards[campaign.rewardNode]!.offers : [];
