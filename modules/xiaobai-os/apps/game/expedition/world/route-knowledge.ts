import type { Campaign } from '../campaign/types.js';
import type { CourtyardScene } from '../content/world-types.js';
import { isPerson, type Participant } from '../content/participants.js';

/** The home branch remains private even when the city-side waterway is shared. */
export function isPrivateWaterway(from: CourtyardScene, to: CourtyardScene) {
    return from === 'kouzi_home' && to === 'deep_waterway' || from === 'deep_waterway' && to === 'kouzi_home';
}
export function knownPersonRoutes(campaign: Campaign, person: Participant) {
    const knowledge = campaign.knowledge[person];
    const privateRoute = person === 'kouzi' || knowledge.includes('deep_route_agreed') || knowledge.includes('deep_route_walked');
    const waterway = privateRoute || campaign.facts.includes('deep_route_shared')
        || isPerson(person) && campaign.people[person].scene === 'deep_waterway';
    return {
        place: (scene: CourtyardScene) => scene !== 'deep_waterway' || waterway,
        exit: (from: CourtyardScene, to: CourtyardScene) => isPrivateWaterway(from, to) ? privateRoute
            : from !== 'deep_waterway' && to !== 'deep_waterway' || waterway,
    };
}
