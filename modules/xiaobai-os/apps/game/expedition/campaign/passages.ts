import type { Campaign } from './types.js';
import { findStoryPassage } from '../content/story-passages.js';
import { FACT_COPY } from '../content/campaign-copy.js';
import { CITY_COPY } from '../content/inner-city/copy.js';
import { isPerson, isStoryPerson, participantName } from '../content/participants.js';
import { STORY_PEOPLE } from '../content/inner-city/people.js';
import { CITY_THREADS } from '../content/inner-city/progress.js';
import { reachablePeople } from '../world/people.js';

export function campaignPassage(campaign: Campaign, id: string) {
    const spec = findStoryPassage(id), facts = new Set(campaign.facts);
    if (!spec) { return null; }
    const read = facts.has(spec.fact);
    const nearby = new Set(read ? [] : reachablePeople(campaign).map(item => item.target.id));
    // Companions must actually share the player's interaction space. Fixed residents
    // occupy their authored stage positions (for example, the other side of a table).
    const missing = read ? [] : (spec.witnesses ?? []).filter(person => isPerson(person) ? !nearby.has(person)
        : !isStoryPerson(person) || STORY_PEOPLE[person].scene !== campaign.location.scene);
    const resolved = CITY_THREADS.find(thread => spec.witnesses?.includes(thread.person))?.resolved.find(fact => facts.has(fact));
    let body = missing.length ? CITY_COPY.awaitWitness(missing.map(participantName).join('、')) : spec.body;
    let operation = !read && !missing.length ? spec.operation ?? null : null;
    if (!read && id === 'return_trial' && facts.has('bridge_cleared')) {
        body = CITY_COPY.trialAfterBridge;
        if (operation) { operation = { ...operation, setup: CITY_COPY.trialAfterBridgeSetup }; }
    }
    if (read) {
        body = `${CITY_COPY.reviewed}\n${FACT_COPY[spec.fact]}`;
        if (resolved) { body += `\n\n${CITY_COPY.now}\n${FACT_COPY[resolved]}`; }
    }
    if (facts.has('heat_restored')) {
        if (id === 'heat_notice') { body = CITY_COPY.restoredNotice; }
        if (id === 'return_plan') { body = CITY_COPY.restoredPlan; }
        if (id === 'deep_receipt' && !missing.length && !resolved) { body += `\n\n${CITY_COPY.restoredDeep}`; }
    }
    return { ...spec, body, ready: !missing.length, read, operation };
}
