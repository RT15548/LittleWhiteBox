import assert from 'node:assert/strict';
import test from 'node:test';
import { readResponseCompletion } from '../../agent-core/runtime/response-completion.js';
import { summarizeAdministrator } from '../apps/administrator/agent/history.js';
import { summariseLearningHistory } from '../apps/learning/agent/history-compaction.js';
import { learningHistoryPrompt } from '../apps/learning/agent/history-prompt.js';
import { createFourthWallContextService, createGatewayContextService } from '../apps/fourth-wall/host/context-service.js';
import { summarizeConversation } from '../apps/game/expedition/narrative/memory.js';
import { createCampaign } from '../apps/game/expedition/campaign/rules.js';

// Acceptance contracts (cost: lost paid replies / memory corruption):
// - All summary consumers adopt plain-text summaries despite abnormal completion flags.
// - The original history and summary remain untouched until success.
// - Empty replies, refusals, cancellation and real API failures cannot replace memory or cause a paid retry.
// - Multi-batch compaction cannot commit a successful prefix when a later batch fails.
const memory = '合并后的记忆：保留 "yes" 和“原话”。';
const finished = memory;
const buildPrompt = session => ({ protocol: '', msg1: session.memory, msg2: '', msg3: '', msg4: '' });
const fourthWallSession = () => ({ id: 'offline', name: 'offline', createdAt: 0, memory: 'original memory', archivedCount: 0,
    history: Array.from({ length: 24 }, (_, i) => ({ role: i % 2 ? 'ai' : 'user', content: `事件${i}`, ts: i })) });

function harness(kind, respond, signal = new AbortController().signal) {
    const requests = [], commits = [];
    const run = async request => { requests.push(request); return respond(request); };
    if (kind === 'administrator') {
        const source = { summary: 'original memory', messages: [{ role: 'user', content: 'older request '.repeat(100) }] };
        return { source, requests, commits, execute: () => summarizeAdministrator({ ...source,
            gateway: { openSession: async () => ({ run }) }, config: {}, signal }) };
    }
    if (kind === 'workbench' || kind === 'companion') {
        const source = { summary: 'original memory', turns: [{ user: 'older request', status: 'finished',
            messages: [{ role: 'assistant', content: 'confirmed answer' }] }] };
        return { source, requests, commits, execute: () => summariseLearningHistory({ ...source, signal,
            systemPrompt: learningHistoryPrompt(kind), guard: () => true, openSession: async () => ({ run }) }) };
    }
    if (kind === 'fourth-wall') {
        const source = fourthWallSession();
        const context = createGatewayContextService({ run }, async () => ({ tokens: 100 }));
        return { source, requests, commits, async execute() {
            await context.prepare({ session: source, config: {}, manual: true, signal, buildPrompt,
                commit: async (text, archivedCount) => { commits.push({ text, archivedCount }); } });
            return commits.at(-1).text;
        } };
    }
    const source = createCampaign('summary-contract', 7, 'blade', 'traveler', { name: '旅人', gender: 'male', appearanceAge: 'twenties' });
    source.conversations.sanniang = Array.from({ length: 10 }, (_, i) => ({ id: `turn-${i}`, kind: 'dialogue',
        player: `question ${i}`, reply: `answer ${i}`, facts: [], scene: source.location.scene, action: null }));
    source.memories.sanniang = { throughId: 'turn-0', text: 'original memory' };
    const session = { run, providerConfig: {} };
    return { source, requests, commits, async execute() {
        const result = await summarizeConversation(session, source, 'sanniang', signal,
            async input => ({ tokens: input.messages.reduce((total, message) => total + String(message.content).length, 0) }));
        assert.equal(result.throughId, 'turn-4', 'The recent five exchanges remain unarchived');
        return result.text;
    } };
}

for (const kind of ['administrator', 'workbench', 'companion', 'fourth-wall', 'expedition']) {
    for (const reason of ['stop', 'length', undefined]) {
        test(`${kind} adopts plain-text memory after ${reason ?? 'missing completion'}`, async () => {
            const h = harness(kind, () => ({ ...readResponseCompletion('openai', reason), text: finished,
                thoughts: [{ text: 'native reasoning' }] }));
            const original = structuredClone(h.source);
            assert.equal(await h.execute(), memory);
            assert.equal(h.requests.length, 1);
            assert.equal(h.requests[0].maxTokens, undefined, 'The API output limit remains inherited');
            assert.deepEqual(h.source, original);
            if (kind === 'fourth-wall') assert.deepEqual(h.commits, [{ text: memory, archivedCount: 14 }]);
        });
    }

    for (const response of [
        { text: '', ...readResponseCompletion('openai', 'stop') },
        { text: finished, refused: true },
        ...(['workbench', 'companion'].includes(kind) ? [{ text: finished, toolCalls: [{ name: 'Write', arguments: '{}' }] }] : []),
    ]) {
        test(`${kind} does not adopt ${response.refused ? 'a refusal' : response.toolCalls ? 'a tool request' : 'an empty summary'}`, async () => {
            const h = harness(kind, () => response), original = structuredClone(h.source);
            await assert.rejects(h.execute());
            assert.deepEqual(h.source, original);
            assert.deepEqual(h.commits, []);
            assert.equal(h.requests.length, 1, 'No paid retry is authorized by an invalid summary');
        });
    }

    test(`${kind} ignores a late summary after cancellation`, async () => {
        const abort = new AbortController();
        const h = harness(kind, () => { abort.abort(); return { text: finished }; }, abort.signal);
        const original = structuredClone(h.source);
        await assert.rejects(h.execute(), error => error.name === 'AbortError' || error.code === 'expedition_cancelled');
        assert.deepEqual(h.source, original);
        assert.deepEqual(h.commits, []);
        assert.equal(h.requests.length, 1);
    });

    test(`${kind} propagates a real API failure without replacing memory or retrying`, async () => {
        const failure = Object.assign(new Error('offline provider failure'), { code: 'provider_error' });
        const h = harness(kind, () => { throw failure; }), original = structuredClone(h.source);
        await assert.rejects(h.execute(), error => error === failure || error.cause === failure);
        assert.deepEqual(h.source, original);
        assert.deepEqual(h.commits, []);
        assert.equal(h.requests.length, 1);
    });
}

test('fourth-wall keeps original memory if a later summary batch is empty', async () => {
    const session = fourthWallSession();
    session.history[0].content = 'x'.repeat(150000);
    const original = structuredClone(session), commits = [], requests = [];
    const context = createFourthWallContextService({
        count: async request => request.messages.reduce((total, message) => total + String(message.content).length, 0),
        summarize: async request => {
            requests.push(request);
            return { text: requests.length === 1 ? finished : '' };
        },
    });
    await assert.rejects(context.prepare({ session, config: {}, manual: true, signal: new AbortController().signal,
        buildPrompt, commit: async (...args) => { commits.push(args); } }));
    assert.equal(requests.length, 2);
    assert.deepEqual(commits, []);
    assert.deepEqual(session, original);
});
