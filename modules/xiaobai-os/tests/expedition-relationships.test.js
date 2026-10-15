import assert from 'node:assert/strict';
import test from 'node:test';
import { traveler } from './fixtures/expedition-traveler.js';
import { createCampaign, recordFact } from '../apps/game/expedition/campaign/rules.ts';
import { relationshipBand, settleAffection } from '../apps/game/expedition/campaign/relationships.ts';
import { buildConversationPrompt, conversationContext } from '../apps/game/expedition/narrative/prompt.ts';
import { generateConversation } from '../apps/game/expedition/narrative/conversation.ts';
import { validateExpedition } from '../apps/game/expedition/partition.ts';
import { emptyExpedition } from '../apps/game/expedition/domain.ts';
import { parseRelationshipProfile, projectRelationship } from '../apps/game/expedition/narrative/relationship-profile.ts';
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

test('stage projection preserves unlocked memories and disclosed intel while current psychology follows affection', async () => {
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
    assert.deepEqual(low.stage.psychology, canon.relationship.zero);
    assert.deepEqual(high.stage.psychology, canon.relationship.bands[4].psychology);
    assert.deepEqual(low.stage.personalPast, high.stage.personalPast); assert.equal(low.stage.secret, null);
    assert.equal(low.stage.disclosedSecret, high.stage.secret); assert.ok(!low.actions.includes('share_secret'));
    assert.ok(campaign.facts.includes('bajin_intel'));
    for (const person of ['kouzi', 'anian']) {
        campaign.relationships[person] = { affection: 100, highestBand: 4 };
        assert.ok(!conversationContext(campaign, person).actions.includes('share_secret'));
    }
});

test('all residents receive only their current six-axis scale, including a distinct zero baseline, without changing the save', async () => {
    const campaign = create();
    for (const person of ['sanniang', 'kouzi', 'anian', 'laobai']) {
        const canon = await loadCanon(person, signal());
        assert.equal(canon.relationship.bands.length, 5);
        for (const affection of [0, 1, 20, 21, 40, 41, 60, 61, 80, 81, 100]) {
            campaign.relationships[person] = { affection, highestBand: 4 };
            const before = structuredClone(campaign);
            const { story } = inspectNarrativePrompt(buildConversationPrompt(campaign, person, 'question', canon));
            const expected = affection === 0 ? canon.relationship.zero : canon.relationship.bands[relationshipBand(affection)].psychology;
            assert.deepEqual(story.stage.psychology, expected);
            // These are model-facing data keys, not prose assertions.
            assert.deepEqual(Object.keys(story.stage).sort(), ['disclosedSecret', 'personalPast', 'psychology', 'secret', 'shadow']);
            assert.deepEqual(Object.keys(story.stage.psychology).sort(), ['位置', '渴求', '占有', '防御', '让渡', '力量关系'].sort());
            assert.ok(Object.values(story.stage.psychology).every(value => typeof value === 'string' && value.trim()));
            assert.deepEqual(campaign, before);
            assert.equal(projectRelationship(canon.relationship, affection).name, canon.relationship.bands[relationshipBand(affection)].name);
        }
        assert.notDeepEqual(canon.relationship.zero, canon.relationship.bands[0].psychology);
    }
    for (const person of ['bajin', 'changyounian']) {
        const canon = await loadCanon(person, signal());
        assert.equal(canon.relationship, null);
        assert.equal(inspectNarrativePrompt(buildConversationPrompt(campaign, person, 'question', canon)).story.stage, null);
    }
    const data = emptyExpedition(); data.active = campaign;
    const saved = JSON.parse(JSON.stringify(data));
    validateExpedition(saved); assert.deepEqual(saved, data);
});

test('psychological scale does not depend on rescue completion or manufacture a shared relationship history', async () => {
    const campaign = create(), person = 'sanniang', canon = await loadCanon(person, signal());
    campaign.relationships[person] = { affection: 90, highestBand: 4 };
    const before = inspectNarrativePrompt(buildConversationPrompt(campaign, person, 'question', canon));
    recordFact(campaign, 'chapter_completed', [person]);
    const stored = structuredClone(campaign);
    const after = inspectNarrativePrompt(buildConversationPrompt(campaign, person, 'question', canon));
    assert.deepEqual(after.story.stage.psychology, before.story.stage.psychology);
    assert.notDeepEqual(after.story.events, before.story.events);
    assert.deepEqual(campaign, stored);
    assert.equal(campaign.conversations[person].length, 0);
});

test('authoring markers select psychology independently of chapter text; missing axes and duplicate bands report invalid canon', () => {
    // Exact markers are an external authoring format. Values are fixture data, not source/prose matching.
    const axes = ['position', 'longing', 'possession', 'defense', 'surrender', 'balance'];
    const section = (id, omit = '') => `<!-- relationship:${id} -->\n`
        + (id === 'zero' ? '' : `<!-- field:name -->\nlabel-${id}\n`)
        + axes.filter(axis => axis !== omit).map(axis => `<!-- field:${axis} -->\n${axis}:${id}\n`).join('')
        + '<!-- /relationship -->\n';
    const document = ['zero', 0, 1, 2, 3, 4].map(id => section(id)).join('');
    const profile = parseRelationshipProfile(document);
    assert.deepEqual(parseRelationshipProfile(`# arbitrary heading\n${document}\n<!-- stage:2:0 -->\n<!-- field:memory -->\nother chapter\n<!-- /stage -->`), profile);
    assert.equal(Object.values(profile.zero)[0], 'position:zero');
    for (const invalid of [document + section(2), document + section('zero'), document.replace(section(3), section(3, 'defense')), document.replace(section('zero'), '')]) {
        assert.throws(() => parseRelationshipProfile(invalid), { code: 'expedition_narrative_unavailable' });
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
