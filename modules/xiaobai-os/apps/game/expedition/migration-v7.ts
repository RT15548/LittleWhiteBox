import { object } from './validation.js';
import { fault } from './random.js';
import { STORY_PERSON_IDS } from './content/inner-city/people.js';

/**
 * Compatibility: the user's retained V7 journey, frozen sample expedition-v7.json.
 * Only the participant dictionaries expand. Retire when importing V7 is explicitly retired.
 * No current Campaign assertion is used to pretend the old participant shape was current.
 */
const V7_PARTICIPANTS = ['sanniang', 'laobai', 'kouzi', 'anian', 'bajin', 'changyounian'];
function expand(value: unknown, create: () => unknown) {
    const record = object(value);
    if (Object.keys(record).length !== V7_PARTICIPANTS.length || V7_PARTICIPANTS.some(id => !Object.hasOwn(record, id))) { fault('invalid'); }
    for (const id of STORY_PERSON_IDS) { record[id] = create(); }
}
export function upgradeExpeditionV7(raw: unknown): unknown {
    const data = object(raw);
    if (data.formatVersion !== 7) { return raw; }
    if (data.active !== null) {
        const campaign = object(data.active);
        expand(campaign.conversations, () => []); expand(campaign.memories, () => null); expand(campaign.knowledge, () => []);
        if (campaign.lastReply !== undefined) { expand(object(object(campaign.lastReply).before).knowledge, () => []); }
    }
    if (data.last !== null) {
        const command = object(object(data.last).command);
        if (command.type === 'start' || command.type === 'restart') { delete command.chapter; }
    }
    data.formatVersion = 8;
    return data;
}
