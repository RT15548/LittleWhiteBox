import assert from 'node:assert/strict';
import test from 'node:test';
import { createCampaign } from '../apps/game/expedition/campaign/rules.ts';
import { generateConversation } from '../apps/game/expedition/narrative/conversation.ts';
import { buildConversationPrompt } from '../apps/game/expedition/narrative/prompt.ts';
import { PERFORMANCE_PROFILES, readPerformance } from '../apps/game/expedition/performance/catalog.ts';
import { PARTICIPANT_IDS } from '../apps/game/expedition/content/participants.ts';
import { EXPEDITION_PARTITION } from '../apps/game/expedition/partition.ts';
import { advanceExpedition, emptyExpedition } from '../apps/game/expedition/domain.ts';
import { traveler, journey } from './fixtures/expedition-traveler.js';
import { loadCanon, narrativeOptions, narrativeReply, inspectNarrativePrompt } from './fixtures/expedition-narrative.js';
import { decodeNarrativeReply } from '../apps/game/expedition/narrative/response.ts';

const signal = () => new AbortController().signal;
const campaign = () => createCampaign('performance', 7, 'blade', 'traveler', traveler);
const agent = body => ({ loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture' }, run: async () => ({ text: narrativeReply(body) }) }) });

test('optional performance cannot discard dialogue, affection or a valid game action', async () => {
    for (const performance of [undefined, null, {}, [], 'smile', { expression: 'unknown', gesture: 'nod' }, { expression: 'smile', gesture: 'teleport' }]) {
        const result = await generateConversation(agent({ reply: 'paid dialogue', action: 'briefing', affection: 'up', performance }), campaign(), 'sanniang', 'question', signal(), narrativeOptions);
        assert.equal(result.kind, 'dialogue'); assert.equal(result.reply, 'paid dialogue');
        assert.equal(result.action, 'briefing'); assert.equal(result.affection, 'up');
        assert.equal(result.performance, undefined);
        assert.equal(result.issue, performance == null ? undefined : 'performance_rejected');
    }
});

test('all participants expose their own available expressions and gestures', async () => {
    for (const person of PARTICIPANT_IDS) {
        const prompt = buildConversationPrompt(campaign(), person, 'question', await loadCanon(person, signal()));
        const data = inspectNarrativePrompt(prompt).operations;
        const options = PERFORMANCE_PROFILES[person];
        assert.ok(options);
        assert.deepEqual(data.performance, options);
        for (const expression of Object.keys(data.performance.expressions)) for (const gesture of Object.keys(data.performance.gestures)) {
            assert.deepEqual(readPerformance(person, { expression, gesture }), { expression, gesture });
        }
    }
});

test('another participant cannot use an expression for which their actor has no artwork', async () => {
    const performance = { expression: 'blush', gesture: 'nod' };
    assert.deepEqual(readPerformance('sanniang', performance), performance);
    const result = await generateConversation(agent({ reply: 'paid guard dialogue', performance }), campaign(), 'bajin', 'question', signal(), narrativeOptions);
    assert.equal(result.kind, 'dialogue'); assert.equal(result.reply, 'paid guard dialogue');
    assert.equal(result.performance, undefined); assert.equal(result.issue, 'performance_rejected');
});

test('a reply keeps its own performance through storage and model history; the next reply does not change it', async () => {
    const data = advanceExpedition(emptyExpedition(), { type: 'start', weapon: 'blade', outfit: 'traveler', ...journey }, 'start', 7);
    data.active.conversations.sanniang.push(
        { id: 'one', kind: 'dialogue', player: 'one', reply: 'first', action: null, performance: { expression: 'blush', gesture: 'tilt' }, scene: 'camp', facts: [] },
        { id: 'two', kind: 'dialogue', player: 'two', reply: 'second', action: null, performance: { expression: 'serious', gesture: 'none' }, scene: 'camp', facts: [] },
        { id: 'three', kind: 'dialogue', player: 'three', reply: 'third', action: null, issue: 'performance_rejected', scene: 'camp', facts: [] },
    );
    const parsed = EXPEDITION_PARTITION.parse(EXPEDITION_PARTITION.serialize(data));
    assert.equal(parsed.ok, true);
    assert.deepEqual(parsed.value.active.conversations, data.active.conversations);
    const prompt = buildConversationPrompt(parsed.value.active, 'sanniang', 'next', await loadCanon('sanniang', signal()));
    const replies = prompt.messages.filter(message => message.role === 'assistant').map(message => decodeNarrativeReply(message.content));
    assert.deepEqual(replies.map(reply => reply.controls.performance), [{ expression: 'blush', gesture: 'tilt' }, { expression: 'serious', gesture: 'none' }, null]);
});

test('each actor preserves its own accepted performance through the current save format and history', async () => {
    const data = advanceExpedition(emptyExpedition(), { type: 'start', weapon: 'blade', outfit: 'traveler', ...journey }, 'start', 7);
    for (const person of Object.keys(PERFORMANCE_PROFILES)) {
        data.active.conversations[person] = [{ id: 'actor-' + person, kind: 'dialogue', player: 'question', reply: 'answer',
            action: null, performance: { expression: 'neutral', gesture: 'gesture' }, scene: 'camp', facts: [] }];
    }
    const parsed = EXPEDITION_PARTITION.parse(EXPEDITION_PARTITION.serialize(data));
    assert.equal(parsed.ok, true);
    for (const person of Object.keys(PERFORMANCE_PROFILES)) {
        const original = data.active.conversations[person][0].performance;
        assert.deepEqual(parsed.value.active.conversations[person][0].performance, original);
        const prompt = buildConversationPrompt(parsed.value.active, person, 'next', await loadCanon(person, signal()));
        const reply = decodeNarrativeReply(prompt.messages.find(message => message.role === 'assistant').content);
        assert.deepEqual(reply.controls.performance, original);
    }
});
