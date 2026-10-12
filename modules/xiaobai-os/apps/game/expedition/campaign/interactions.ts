import { COURTYARD } from '../content/courtyard.js';
import { segmentComplete } from '../content/courtyard-encounters.js';
import type { SceneObject } from '../content/world-types.js';
import { reachableInteractions, visibleInteractions } from '../world/exploration.js';
import type { Campaign } from './types.js';

export function campaignObjectVisible(campaign: Campaign, object: SceneObject) {
    if (object.kind === 'reward') {
        const reward = campaign.rewards[object.node]; return !!reward?.offers.length && reward.scene === campaign.location.scene;
    }
    return object.kind !== 'rest' || campaign.location.scene !== 'waterway'
        || segmentComplete('waterway_approach', new Set(campaign.facts), campaign.completedSegments);
}
export function campaignWorldInteractions(campaign: Campaign, reachable = false) {
    const scene = COURTYARD[campaign.location.scene], facts = new Set(campaign.facts);
    return (reachable ? reachableInteractions(scene, campaign.location, facts) : visibleInteractions(scene, facts))
        .filter(i => i.kind === 'exit' || campaignObjectVisible(campaign, i.target));
}
export function canRebuildLoadout(campaign: Campaign) {
    return campaign.phase === 'exploration' && (COURTYARD[campaign.location.scene].safe
        || campaignWorldInteractions(campaign, true).some(i => i.kind === 'object' && i.target.kind === 'rest'));
}
