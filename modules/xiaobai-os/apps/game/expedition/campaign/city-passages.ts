import type { Campaign } from './types.js';
import { CITY_PASSAGES, type CityPassage, type CityPassageId } from '../content/inner-city/passages.js';
import { INNER_CITY_FACTS } from '../content/inner-city/facts.js';
import { CITY_COPY } from '../content/inner-city/copy.js';
import { isPerson, isStoryPerson, participantName } from '../content/participants.js';
import { STORY_PEOPLE } from '../content/inner-city/people.js';
import { CITY_THREADS } from '../content/inner-city/progress.js';
import { reachablePeople } from '../world/people.js';

export function cityPassage(campaign: Campaign, id: string) {
    if (!Object.hasOwn(CITY_PASSAGES, id)) { return null; }
    const spec: CityPassage = CITY_PASSAGES[id as CityPassageId], facts = new Set(campaign.facts);
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
        body = `${CITY_COPY.reviewed}\n${INNER_CITY_FACTS[spec.fact]}`;
        if (resolved) { body += `\n\n${CITY_COPY.now}\n${INNER_CITY_FACTS[resolved as keyof typeof INNER_CITY_FACTS]}`; }
    }
    if (facts.has('heat_restored')) {
        if (id === 'heat_notice') { body = CITY_COPY.restoredNotice; }
        if (id === 'return_plan') { body = CITY_COPY.restoredPlan; }
        if (id === 'deep_receipt' && !missing.length && !resolved) { body += `\n\n${CITY_COPY.restoredDeep}`; }
    }
    return { ...spec, body, ready: !missing.length, read, operation };
}
