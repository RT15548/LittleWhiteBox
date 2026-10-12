import assert from 'node:assert/strict';
import test from 'node:test';
import { traveler } from './fixtures/expedition-traveler.js';
import { createCampaign, recordFact } from '../apps/game/expedition/campaign/rules.ts';
import { relationshipBand, settleAffection } from '../apps/game/expedition/campaign/relationships.ts';
import { buildConversationPrompt, conversationContext } from '../apps/game/expedition/narrative/prompt.ts';
import { generateConversation } from '../apps/game/expedition/narrative/conversation.ts';
import { validateExpedition } from '../apps/game/expedition/partition.ts';
import { emptyExpedition } from '../apps/game/expedition/domain.ts';
import { loadCanon, narrativeOptions, narrativeReply, inspectNarrativePrompt } from './fixtures/expedition-narrative.js';

const create = () => createCampaign('relationship', 7, 'blade', 'traveler', traveler);
const signal = () => new AbortController().signal;

test('affection bands include their boundaries, clamp, and remember the highest unlocked band', () => {
    assert.deepEqual([0,20,21,40,41,60,61,80,81,100].map(relationshipBand), [0,0,1,1,2,2,3,3,4,4]);
    const campaign = create(), relation = campaign.relationships.laobai;
    relation.affection = 80; relation.highestBand = 3;
    settleAffection(campaign, 'laobai', 'up'); assert.equal(relation.highestBand, 4);
    for (let i = 0; i < 60; i++) settleAffection(campaign, 'laobai', 'down');
    assert.deepEqual(relation, { affection: 0, highestBand: 4 });
    for (let i = 0; i < 60; i++) settleAffection(campaign, 'laobai', 'up');
    assert.equal(relation.affection, 100);
    const before = structuredClone(campaign); settleAffection(campaign, 'laobai', null); assert.deepEqual(campaign, before);
    const data = emptyExpedition(); data.active = campaign; validateExpedition(data);
});

test('stage projection preserves unlocked memories and disclosed intel, but not current intimacy on a decrease', async () => {
    const campaign = create(), canon = await loadCanon('laobai', signal());
    const context = () => {
        const { story, operations } = inspectNarrativePrompt(buildConversationPrompt(campaign, 'laobai', 'question', canon));
        return { ...story, actions: Object.keys(operations.actions) };
    };
    assert.equal(context().stage.secret, null); assert.equal(context().stage.disclosedSecret, null);
    campaign.relationships.laobai = { affection: 81, highestBand: 4 };
    const high = context(); assert.ok(high.actions.includes('share_secret')); assert.equal(high.stage.secret, canon.stages[4].secret);
    assert.deepEqual(high.stage.personalPast, canon.stages.map(stage => stage.memory).filter(Boolean));
    recordFact(campaign, 'bajin_intel', ['laobai']);
    campaign.relationships.laobai.affection = 0;
    const low = context();
    assert.equal(low.stage.relationship, canon.stages[0].relationship); assert.equal(low.stage.intimacy, canon.stages[0].intimacy);
    assert.deepEqual(low.stage.personalPast, high.stage.personalPast); assert.equal(low.stage.secret, null);
    assert.equal(low.stage.disclosedSecret, high.stage.secret); assert.ok(!low.actions.includes('share_secret'));
    assert.ok(campaign.facts.includes('bajin_intel'));
    for (const person of ['kouzi', 'anian']) {
        campaign.relationships[person] = { affection: 100, highestBand: 4 };
        assert.ok(!conversationContext(campaign, person).actions.includes('share_secret'));
    }
});

test('malformed optional affection does not discard a valid paid reply; unoffered secret cannot be submitted', async () => {
    const agent = response => ({ loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture' }, run: async () => ({ text: narrativeReply(response) }) }) });
    for (const affection of [undefined, null, 'up', 'down', 100, 'UP', {}, ['up']]) {
        const result = await generateConversation(agent({ reply: 'ok', affection }), create(), 'laobai', 'hello', signal(), narrativeOptions);
        assert.equal(result.affection, affection === 'up' || affection === 'down' ? affection : null);
    }
    const denied = await generateConversation(agent({ reply: 'ok', affection: 'up', action: 'share_secret' }), create(), 'laobai', 'hello', signal(), narrativeOptions);
    assert.equal(denied.reply, 'ok'); assert.equal(denied.action, null); assert.equal(denied.issue, 'action_rejected');
});
