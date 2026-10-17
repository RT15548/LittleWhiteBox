import type { IslandView } from '../service.js';

/** Things that wait for the player's answer: offers, care, contact and anyone coming at them. */
export function playerRequests(observation: NonNullable<IslandView['player']>) {
    const threats = observation.threats.filter(t => t.to === 'player');
    const all = [...observation.offers, ...observation.careOffers, ...observation.contactOffers, ...threats].filter(o => o.to === 'player');
    return { threats, count: all.length };
}
