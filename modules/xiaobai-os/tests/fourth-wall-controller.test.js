import assert from 'node:assert/strict';
import test from 'node:test';

import {
    createDefaultFourthWallChatState,
    createDefaultFourthWallGlobalSettings,
} from '../apps/fourth-wall/domain/defaults.js';
import { createFourthWallController } from '../apps/fourth-wall/host/controller.js';
import { createFourthWallGenerationRuntime } from '../apps/fourth-wall/host/generation-runtime.js';
import { createFourthWallContextService, createGatewayContextService } from '../apps/fourth-wall/host/context-service.js';
import { OpenAIResponsesAdapter } from '../../agent-core/adapters/openai-responses.js';

function smallContext() {
    return createFourthWallContextService({ count: async () => 100, summarize: async () => { throw new Error('unexpected summary'); } });
}

function flushAsyncWork() {
    return new Promise(resolve => globalThis.setTimeout(resolve, 0));
}

const binding = { chatIdentity: 'chat:a', sessionId: 'default' };
function seedLongHistory(harness) {
    harness.state.chat.sessions[0].history = Array.from({ length: 24 }, (_, i) => ({
        role: i % 2 ? 'ai' : 'user', content: `history-${i}`, ts: 100 + i,
    }));
}

test('summary failure retries the saved pending message without adding it twice', async () => {
    let attempt = 0;
    const h = createHarness({ contextService: createFourthWallContextService({
        count: async request => request.messages.some(m => m.content.includes('history-0')) ? 128000 : 100,
        summarize: async () => { if (++attempt === 1) { throw new Error('summary failed'); } return { text: 'NEW_MEMORY' }; },
    }) });
    seedLongHistory(h);
    await h.controller.activate({ post: (type, payload) => h.posts.push({ type, payload }) });
    assert.deepEqual(await h.controller.handleMessage({ type: 'fourth-wall/send', requestId: 'one', payload: { ...binding, content: 'pending' } }), { accepted: true });
    await flushAsyncWork();
    assert.equal(h.requests.length, 0);
    assert.equal(h.state.chat.sessions[0].memory, '');
    assert.equal(h.state.chat.sessions[0].archivedCount, 0);
    assert.equal(h.posts.at(-1).payload.status, 'error');
    await h.controller.handleMessage({ type: 'fourth-wall/retry', requestId: 'retry', payload: binding });
    await flushAsyncWork();
    assert.equal(h.requests.length, 1);
    assert.equal(h.state.chat.sessions[0].memory, 'NEW_MEMORY');
    assert.equal(h.state.chat.sessions[0].archivedCount, 14);
    assert.equal(h.state.chat.sessions[0].history.filter(m => m.content === 'pending').length, 1);
    assert.ok(h.requests[0].builtPrompt.msg3.includes('NEW_MEMORY'));
    assert.ok(!h.requests[0].builtPrompt.msg3.includes('history-0'));
    h.requests[0].resolve({ text: '<msg>reply</msg>' });
    await flushAsyncWork();
});

test('manual summary is immediately acknowledged, is cancellable, and never generates a reply', async () => {
    let resolveSummary, started;
    const summaryStarted = new Promise(resolve => { started = resolve; });
    const h = createHarness({ contextService: createFourthWallContextService({
        count: async () => 100,
        summarize: () => new Promise(resolve => { resolveSummary = resolve; started(); }),
    }) });
    seedLongHistory(h);
    await h.controller.activate({ post: (type, payload) => h.posts.push({ type, payload }) });
    assert.deepEqual(await h.controller.handleMessage({ type: 'fourth-wall/summarize', payload: binding }), { accepted: true });
    await summaryStarted;
    await h.controller.handleMessage({ type: 'fourth-wall/cancel', payload: binding });
    resolveSummary({ text: 'LATE_MEMORY' });
    await flushAsyncWork();
    assert.equal(h.state.chat.sessions[0].memory, '');
    assert.equal(h.requests.length, 0);
    await h.controller.handleMessage({ type: 'fourth-wall/summarize', payload: binding });
    await flushAsyncWork();
    resolveSummary({ text: 'SAVED_MEMORY' });
    await flushAsyncWork();
    assert.equal(h.state.chat.sessions[0].memory, 'SAVED_MEMORY');
    assert.equal(h.requests.length, 0);
});

test('automatic summary refusal keeps official memory and originals and does not start a reply', async () => {
    const h = createHarness({ contextService: createFourthWallContextService({
        count: async request => request.messages.some(m => m.content.includes('history-0')) ? 128000 : 100,
        summarize: async () => ({ text: 'I cannot help with that request.', finishReason: 'refusal' }),
    }) });
    seedLongHistory(h);
    h.state.chat.sessions[0].memory = 'OFFICIAL_MEMORY';
    const history = structuredClone(h.state.chat.sessions[0].history);
    await h.controller.activate({ post: (type, payload) => h.posts.push({ type, payload }) });
    await h.controller.handleMessage({ type: 'fourth-wall/send', payload: { ...binding, content: 'pending' } });
    await flushAsyncWork();
    assert.equal(h.requests.length, 0);
    assert.equal(h.state.chat.sessions[0].memory, 'OFFICIAL_MEMORY');
    assert.equal(h.state.chat.sessions[0].archivedCount, 0);
    assert.deepEqual(h.state.chat.sessions[0].history.slice(0, -1), history);
    assert.equal(h.state.chat.sessions[0].history.at(-1).content, 'pending');
    assert.equal(h.mutations.length, 1);
    assert.equal(h.posts.at(-1).payload.status, 'error');
});

test('Responses completed refusals survive gateway projection and block manual and automatic memory commits', async t => {
    const refusal = 'I cannot summarize this conversation.';
    const summary = `We discussed the phrase "${refusal}" and agreed to keep practising.`;
    for (const manual of [true, false]) {
        for (const mode of ['refusal', 'mixed', 'ordinary summary']) {
            await t.test(`${manual ? 'manual' : 'automatic'}: ${mode}`, async t => {
                t.mock.method(globalThis, 'fetch', async (url, options) => {
                    assert.ok(String(url).startsWith('/api/tokenizers/openai/count?'), 'no real network requests');
                    return Response.json({ token_count: options.body.includes('history-0') ? 128000 : 100 });
                });
                const adapter = new OpenAIResponsesAdapter({ apiKey: 'test-only-not-used', model: 'gpt-4.1' });
                let refuse = mode !== 'ordinary summary';
                const sources = [];
                // Keep the real Responses parser and Fourth Wall gateway projection; replace only network I/O.
                adapter.client.responses.create = async body => {
                    sources.push(structuredClone(body.input));
                    const content = refuse ? [{ type: 'refusal', refusal }] : [{ type: 'output_text', text: summary }];
                    if (refuse && mode === 'mixed') { content.unshift({ type: 'output_text', text: 'Partial summary.' }); }
                    return { status: 'completed',
                        ...(refuse && mode === 'mixed' ? { output_text: 'Partial summary.' } : {}),
                        output: [{ id: 'msg_summary', type: 'message', role: 'assistant', status: 'completed', content }] };
                };
                const h = createHarness({ contextService: createGatewayContextService({ run: request => adapter.chat(request) }) });
                seedLongHistory(h);
                h.state.chat.sessions[0].memory = 'OFFICIAL_MEMORY';
                const original = structuredClone(h.state.chat.sessions[0]);
                await h.controller.activate({ post: (type, payload) => h.posts.push({ type, payload }) });
                await h.controller.handleMessage({ type: manual ? 'fourth-wall/summarize' : 'fourth-wall/send',
                    payload: { ...binding, content: 'pending' } });
                await flushAsyncWork();
                if (refuse) {
                    assert.equal(h.posts.at(-1).payload.status, 'error');
                    assert.equal(h.requests.length, 0, 'a refused summary must not release the reply');
                    assert.equal(h.state.chat.sessions[0].memory, original.memory);
                    assert.equal(h.state.chat.sessions[0].archivedCount, 0);
                    assert.deepEqual(h.state.chat.sessions[0].history.slice(0, original.history.length), original.history);
                    assert.equal(h.state.chat.sessions[0].history.length, original.history.length + (manual ? 0 : 1));
                    assert.equal(h.mutations.length, manual ? 0 : 1, 'only the pending user input may be saved');
                    assert.equal(sources.length, 1);
                    refuse = false;
                    await h.controller.handleMessage({ type: manual ? 'fourth-wall/summarize' : 'fourth-wall/retry', payload: binding });
                    await flushAsyncWork();
                    assert.deepEqual(sources[1], sources[0], 'retry still has the old memory and all departing originals');
                }
                assert.equal(h.state.chat.sessions[0].memory, summary, 'quoting refusal text is not itself a refusal');
                assert.equal(h.state.chat.sessions[0].archivedCount, 14);
                assert.deepEqual(h.state.chat.sessions[0].history.slice(0, original.history.length), original.history);
                assert.equal(h.state.chat.sessions[0].history.filter(m => m.content === 'pending').length, manual ? 0 : 1);
                assert.equal(h.requests.length, manual ? 0 : 1);
                h.controller.deactivate('done');
            });
        }
    }
});

test('input cancellation waits for storage and restores only definitively unsaved inputs', async t => {
    for (const outcome of ['before-write', 'confirmed', 'failed', 'unconfirmed']) {
        await t.test(outcome, async () => {
            const h = createHarness();
            await h.controller.activate({ post: (type, payload) => h.posts.push({ type, payload }) });
            let release;
            const gate = new Promise(resolve => { release = resolve; });
            if (outcome === 'before-write') { h.state.beforeMutationCommit = () => gate; }
            else { h.state.writeMutation = () => gate; }
            if (outcome === 'failed') { h.state.failMutationAt = 1; }
            if (outcome === 'unconfirmed') { h.state.unconfirmedMutationAt = 1; }
            await h.controller.handleMessage({ type: 'fourth-wall/send', payload: { ...binding, content: 'recover me' } });
            await flushAsyncWork();
            assert.deepEqual(await h.controller.handleMessage({ type: 'fourth-wall/cancel', payload: binding }), { cancelled: true });
            assert.deepEqual(await h.controller.handleMessage({ type: 'fourth-wall/cancel', payload: binding }), { cancelled: false });
            assert.equal(h.posts.filter(item => item.payload.status === 'cancelled').length, 0);
            await assert.rejects(h.controller.handleMessage({ type: 'fourth-wall/send', payload: { ...binding, content: 'too early' } }), /已有/);
            release();
            await flushAsyncWork();
            const cancellations = h.posts.filter(item => item.payload.status === 'cancelled');
            assert.equal(cancellations.length, 1);
            const cancelled = cancellations[0].payload;
            const unsaved = outcome === 'before-write' || outcome === 'failed';
            assert.equal(cancelled.inputDraft, unsaved ? 'recover me' : undefined);
            if (unsaved) { assert.deepEqual(h.state.chat.sessions[0].history, []); }
            if (outcome === 'confirmed') {
                assert.equal(h.state.chat.sessions[0].history.at(-1).content, 'recover me');
                assert.equal(h.posts.findLast(item => item.type === 'fourth-wall/state').payload.state.history.messages.at(-1).content, 'recover me');
            }
            if (outcome === 'unconfirmed') { assert.match(cancelled.message, /保存结果未确认.*原输入：recover me/); }
            assert.equal(h.requests.length, 0);
            h.state.writeMutation = null;
            h.state.beforeMutationCommit = null;
            await h.controller.handleMessage({ type: 'fourth-wall/send', payload: { ...binding, content: 'next' } });
            await flushAsyncWork();
            assert.equal(h.requests.length, 1);
            h.controller.deactivate('done');
        });
    }
});

test('cancelling before input initialization restores the draft without attempting storage', async () => {
    const h = createHarness();
    await h.controller.activate({ post: (type, payload) => h.posts.push({ type, payload }) });
    const send = h.controller.handleMessage({ type: 'fourth-wall/send', payload: { ...binding, content: 'early cancel' } });
    const cancel = h.controller.handleMessage({ type: 'fourth-wall/cancel', payload: binding });
    await Promise.all([send, cancel]);
    await flushAsyncWork();
    assert.equal(h.state.mutationAttempts, 0);
    assert.equal(h.posts.at(-1).payload.inputDraft, 'early cancel');
    assert.equal(h.requests.length, 0);
});

test('cancelling regeneration does not restore an already saved user message as a new draft', async () => {
    const h = createHarness();
    h.state.chat.sessions[0].history = [{ role: 'user', content: 'existing', ts: 1 }, { role: 'ai', content: 'answer', ts: 2 }];
    await h.controller.activate({ post: (type, payload) => h.posts.push({ type, payload }) });
    const regenerate = h.controller.handleMessage({ type: 'fourth-wall/regenerate', payload: binding });
    await h.controller.handleMessage({ type: 'fourth-wall/cancel', payload: binding });
    await regenerate;
    await flushAsyncWork();
    assert.equal(h.posts.at(-1).payload.inputDraft, undefined);
    assert.equal(h.state.chat.sessions[0].history.length, 2);
});

test('summary save rejects changed sources and unconfirmed writes before generation', async () => {
    for (const kind of ['changed-source', 'unconfirmed', 'session-switch']) {
        let finish;
        const h = createHarness({ secondSession: true, contextService: createFourthWallContextService({
            count: async request => request.messages.some(m => m.content.includes('history-0')) ? 128000 : 100,
            summarize: () => new Promise(resolve => { finish = resolve; }),
        }) });
        seedLongHistory(h);
        await h.controller.activate({ post: (type, payload) => h.posts.push({ type, payload }) });
        await h.controller.handleMessage({ type: 'fourth-wall/send', payload: { ...binding, content: 'pending' } });
        await flushAsyncWork();
        if (kind === 'changed-source') { h.state.chat.sessions[0].history[0].content = 'edited elsewhere'; }
        if (kind === 'unconfirmed') { h.state.unconfirmedMutationAt = 2; }
        if (kind === 'session-switch') {
            await h.controller.handleMessage({ type: 'fourth-wall/switch-session', payload: { ...binding, targetSessionId: 'second' } });
        }
        finish({ text: 'CANDIDATE' });
        await flushAsyncWork();
        assert.equal(h.requests.length, 0, kind);
        assert.equal(h.state.chat.sessions[0].history.length, 25);
        if (kind !== 'unconfirmed') { assert.equal(h.state.chat.sessions[0].memory, ''); }
    }
});

test('the single task owns input saving and rejects concurrent sends', async () => {
    const h = createHarness();
    await h.controller.activate({ post: (type, payload) => h.posts.push({ type, payload }) });
    let release;
    h.state.beforeMutationCommit = () => new Promise(resolve => { release = resolve; });
    await h.controller.handleMessage({ type: 'fourth-wall/send', payload: { ...binding, content: 'one' } });
    await assert.rejects(h.controller.handleMessage({ type: 'fourth-wall/send', payload: { ...binding, content: 'two' } }), /已有/);
    await flushAsyncWork();
    h.controller.deactivate('closed');
    release();
    await flushAsyncWork();
    assert.deepEqual(h.state.chat.sessions[0].history, []);
    assert.equal(h.requests.length, 0);
});

test('memory edits reject stale source documents even when history has not changed', async () => {
    const h = createHarness();
    const initial = await h.controller.activate();
    h.state.chat.sessions[0].memory = 'edited in another tab';
    await assert.rejects(h.controller.handleMessage({ type: 'fourth-wall/save-memory', payload: {
        ...binding, revision: initial.history.revision, expectedContent: '', content: 'stale editor',
    } }), /记忆已变化/);
    assert.equal(h.state.chat.sessions[0].memory, 'edited in another tab');
});

test('concurrent Prefill changes cannot make counted and generated requests diverge', async () => {
    const h = createHarness();
    await h.controller.activate({post: (type, payload) => h.posts.push({type, payload})});
    const accepted = h.controller.handleMessage({type:'fourth-wall/send',payload:{...binding,content:'preserve input'}});
    h.state.chat.settings.disableAssistantPrefill = true;
    await accepted;
    await flushAsyncWork();
    assert.equal(h.requests.length, 0);
    assert.equal(h.state.chat.sessions[0].history.length, 0);
    assert.equal(h.posts.at(-1).payload.inputDraft, 'preserve input');
});

test('an empty chat can view memory, page, change global settings and send without a premature sidecar write', async () => {
    const h = createHarness({emptyRead: true});
    let initial = await h.controller.activate();
    assert.deepEqual(await h.controller.handleMessage({type:'fourth-wall/read-memory',payload:{...binding,revision:initial.history.revision}}), {content:''});
    assert.deepEqual((await h.controller.handleMessage({type:'fourth-wall/history-page',payload:{...binding,revision:initial.history.revision,direction:'latest'}})).messages, []);
    initial = await h.controller.handleMessage({type:'fourth-wall/refresh',payload:binding});
    assert.equal(initial.chat.activeSessionId, 'default');
    await h.controller.handleMessage({type:'fourth-wall/update-global-settings',payload:{...binding,patch:{image:{enablePrompt:true}}}});
    assert.equal(h.mutations.length, 0);
    await h.controller.handleMessage({type:'fourth-wall/send',payload:{...binding,content:'first input'}});
    await flushAsyncWork();
    assert.equal(h.mutations.length, 1);
    assert.equal(h.requests.length, 1);
    h.controller.deactivate('done');
});

test('background commentary shares budget preparation and skips a failed summary without looping', async () => {
    let handler, modelCalls = 0, summaries = 0;
    let chat = createDefaultFourthWallChatState(1);
    chat.sessions[0].history = Array.from({ length: 24 }, (_, i) => ({role: i % 2 ? 'ai' : 'user', content: `history-${i}`, ts: i + 1}));
    const before = structuredClone(chat);
    const settings = createDefaultFourthWallGlobalSettings();
    settings.commentary = {enabled: true, probability: 99};
    const controller = createFourthWallController({
        chatRepository: {
            prepareCurrentChatFourthWall: async () => structuredClone(chat),
            readCurrentChatFourthWall: () => structuredClone(chat),
            mutateCurrentChatFourthWall: async action => { chat = action(structuredClone(chat)); return structuredClone(chat); },
        },
        settingsRepository: {read: () => ({apps: {fourthWall: settings}}), mutateFourthWall: async () => {}},
        getChatIdentity: () => 'chat:a', getChatSnapshot: () => ({chatIdentity: 'chat:a', messages: []}),
        loadAgentConfig: () => ({}), generateResponse: async () => { modelCalls++; return {text: '<msg>aside</msg>'}; },
        contextService: createFourthWallContextService({count: async () => 128000, summarize: async () => { summaries++; throw new Error('expected summary failure'); }}),
        commentary: {
            subscribe: next => { handler = next; return () => {}; },
            capture: () => ({chatIdentity: 'chat:a', kind: 'ai_message', text: 'RP', messageIndex: 0, chatSnapshot: {messages: []}}),
            random: () => 0, now: () => 200000,
            setTimer: callback => { queueMicrotask(callback); return 1; }, clearTimer: () => {},
        },
    });
    controller.startBackground();
    assert.equal(await handler({kind: 'ai_message'}), false);
    assert.equal(await handler({kind: 'ai_message'}), false);
    assert.equal(summaries, 1);
    assert.equal(modelCalls, 0);
    assert.deepEqual(chat, before);
    controller.stopBackground();
});

function createHarness({ secondSession = false, prepareChat = null, contextService = smallContext(), emptyRead = false } = {}) {
    const state = {
        chatIdentity: 'chat:a',
        chat: createDefaultFourthWallChatState(1000),
        mutationAttempts: 0,
        failMutationAt: 0,
        unconfirmedMutationAt: 0,
        beforeMutationCommit: null,
        writeMutation: null,
    };
    if (secondSession) {
        state.chat.sessions.push({
            id: 'second',
            name: 'Second',
            createdAt: 1001,
            history: [],
            memory: '', archivedCount: 0,
        });
    }
    const mutations = [];
    const posts = [];
    const requests = [];
    const globalSettings = createDefaultFourthWallGlobalSettings();
    let timestamp = 2000;

    const controller = createFourthWallController({
        contextService,
        chatRepository: {
            prepareCurrentChatFourthWall: async () => prepareChat
                ? await prepareChat(state)
                : structuredClone(state.chat),
            readCurrentChatFourthWall: () => emptyRead && mutations.length === 0 ? null : structuredClone(state.chat),
            async mutateCurrentChatFourthWall(mutator, options = {}) {
                state.mutationAttempts += 1;
                const next = mutator(structuredClone(state.chat));
                await state.beforeMutationCommit?.();
                await options.beforeCommit?.();
                await state.writeMutation?.();
                if (state.mutationAttempts === state.failMutationAt) {
                    throw new Error('save failed');
                }
                state.chat = structuredClone(next);
                mutations.push(structuredClone(next));
                if (state.mutationAttempts === state.unconfirmedMutationAt) {
                    throw Object.assign(new Error('save result unconfirmed'), {
                        code: 'SAVE_UNCONFIRMED',
                        uncertain: true,
                    });
                }
                return structuredClone(next);
            },
        },
        settingsRepository: {
            read: () => ({ apps: { fourthWall: structuredClone(globalSettings) } }),
            async mutateFourthWall(mutator) {
                return mutator(structuredClone(globalSettings));
            },
        },
        getChatIdentity: () => ({ key: state.chatIdentity }),
        getChatSnapshot: () => ({
            chatIdentity: state.chatIdentity,
            userName: 'User',
            characterName: 'Character',
            messages: [],
        }),
        generateResponse(options) {
            return new Promise((resolve, reject) => {
                requests.push({ ...options, resolve, reject });
            });
        },
        loadAgentConfig: async () => ({ provider: 'test' }),
        now: () => ++timestamp,
    });

    return { controller, mutations, posts, requests, state };
}

async function activateAndSend(harness) {
    await harness.controller.activate({
        post: (type, payload) => harness.posts.push({ type, payload }),
    });
    await harness.controller.handleMessage({
        type: 'fourth-wall/send',
        requestId: 'request-1',
        payload: {
            chatIdentity: 'chat:a',
            sessionId: 'default',
            content: 'hello',
        },
    });
    await flushAsyncWork();
    assert.equal(harness.requests.length, 1);
    return harness.requests[0];
}

test('streaming is temporary and a final response is persisted exactly once', async () => {
    const harness = createHarness();
    const request = await activateAndSend(harness);

    assert.deepEqual(harness.state.chat.sessions[0].history.map(message => message.content), ['hello']);
    request.onStreamProgress({ text: '<thinking>draft</thinking><msg>partial</msg>' });
    assert.deepEqual(harness.state.chat.sessions[0].history.map(message => message.content), ['hello']);
    assert.equal(harness.posts.at(-1).payload.text, 'partial');

    request.resolve({ text: '<thinking>done</thinking><msg>final answer</msg>' });
    await flushAsyncWork();

    assert.deepEqual(harness.state.chat.sessions[0].history.map(message => message.content), [
        'hello',
        'final answer',
    ]);
    assert.equal(harness.mutations.length, 2);
    assert.equal(harness.posts.filter(item => item.payload.status === 'complete').length, 1);
});

test('a final save failure leaves the generated reply observable but unpersisted', async () => {
    const harness = createHarness();
    harness.state.failMutationAt = 2;
    const request = await activateAndSend(harness);

    request.resolve({ text: '<msg>unsaved answer</msg>' });
    await flushAsyncWork();

    assert.deepEqual(harness.state.chat.sessions[0].history.map(message => message.content), ['hello']);
    const failure = harness.posts.find(item => item.payload.kind === 'save');
    assert.equal(failure.payload.status, 'error');
    assert.equal(failure.payload.draft.text, 'unsaved answer');
    assert.match(failure.payload.message, /未保存/);
});

test('an unconfirmed final save keeps and republishes the candidate without duplicating the draft', async () => {
    const harness = createHarness();
    harness.state.unconfirmedMutationAt = 2;
    const request = await activateAndSend(harness);

    request.resolve({ text: '<msg>possibly saved answer</msg>' });
    await flushAsyncWork();

    assert.deepEqual(harness.state.chat.sessions[0].history.map(message => message.content), [
        'hello',
        'possibly saved answer',
    ]);
    const retainedState = harness.posts.findLast(item => item.type === 'fourth-wall/state');
    assert.equal(retainedState.payload.state.history.messages.at(-1).content, 'possibly saved answer');
    const failure = harness.posts.find(item => item.payload.kind === 'save');
    assert.equal(failure.payload.draft, undefined);
    assert.match(failure.payload.message, /保存结果未确认/);
});

test('cancelled generation ignores late progress and final results', async () => {
    const harness = createHarness();
    const request = await activateAndSend(harness);

    const result = await harness.controller.handleMessage({
        type: 'fourth-wall/cancel',
        payload: { chatIdentity: 'chat:a', sessionId: 'default' },
    });
    const postsAfterCancel = harness.posts.length;
    request.onStreamProgress({ text: '<msg>late progress</msg>' });
    request.resolve({ text: '<msg>late final</msg>' });
    await flushAsyncWork();

    assert.deepEqual(result, { cancelled: true });
    assert.equal(harness.posts.length, postsAfterCancel);
    assert.deepEqual(harness.state.chat.sessions[0].history.map(message => message.content), ['hello']);
});

test('closing while a completed generation waits to commit prevents the AI result from being saved', async () => {
    const harness = createHarness();
    const request = await activateAndSend(harness);
    let releaseCommit;
    let markCommitStarted;
    const commitStarted = new Promise(resolve => { markCommitStarted = resolve; });
    const commitGate = new Promise(resolve => { releaseCommit = resolve; });
    harness.state.beforeMutationCommit = async () => {
        markCommitStarted();
        await commitGate;
    };

    request.resolve({ text: '<msg>stale final</msg>' });
    await commitStarted;
    harness.controller.deactivate('closed');
    releaseCommit();
    await flushAsyncWork();
    await flushAsyncWork();

    assert.deepEqual(harness.state.chat.sessions[0].history.map(message => message.content), ['hello']);
    assert.equal(harness.posts.some(item => item.payload.status === 'complete'), false);
});

test('chat switch, session switch, and deactivation invalidate old results', async (context) => {
    const cases = [
        {
            name: 'chat switch',
            setup: () => createHarness(),
            invalidate: async (harness) => { harness.state.chatIdentity = 'chat:b'; },
        },
        {
            name: 'session switch',
            setup: () => createHarness({ secondSession: true }),
            invalidate: async (harness) => {
                await harness.controller.handleMessage({
                    type: 'fourth-wall/switch-session',
                    payload: {
                        chatIdentity: 'chat:a',
                        sessionId: 'default',
                        targetSessionId: 'second',
                    },
                });
            },
        },
        {
            name: 'deactivation',
            setup: () => createHarness(),
            invalidate: async (harness) => { harness.controller.deactivate('closed'); },
        },
    ];

    for (const item of cases) {
        await context.test(item.name, async () => {
            const harness = item.setup();
            const request = await activateAndSend(harness);
            await item.invalidate(harness);
            const mutationCount = harness.mutations.length;

            request.onStreamProgress({ text: '<msg>late progress</msg>' });
            request.resolve({ text: '<msg>late final</msg>' });
            await flushAsyncWork();

            assert.equal(harness.mutations.length, mutationCount);
            assert.equal(
                harness.state.chat.sessions.some(session => session.history.some(message => message.role === 'ai')),
                false,
            );
        });
    }
});

test('closing the foreground invalidates an activation that is still preparing chat data', async () => {
    let finishPreparation;
    const harness = createHarness({
        prepareChat: state => new Promise(resolve => {
            finishPreparation = () => resolve(structuredClone(state.chat));
        }),
    });
    const pending = harness.controller.activate();

    await Promise.resolve();
    harness.controller.cancelForeground('closed');
    finishPreparation();

    await assert.rejects(pending, /聊天已切换/);
    await assert.rejects(
        harness.controller.handleMessage({
            type: 'fourth-wall/refresh',
            payload: { chatIdentity: 'chat:a' },
        }),
        /未激活/,
    );
});

test('a request from an old activation cannot continue in a reopened view of the same chat', async () => {
    const harness = createHarness();
    await harness.controller.activate({
        post: (type, payload) => harness.posts.push({ type, payload }),
    });
    let releaseMutation;
    let markMutationStarted;
    const mutationStarted = new Promise(resolve => { markMutationStarted = resolve; });
    const mutationGate = new Promise(resolve => { releaseMutation = resolve; });
    harness.state.beforeMutationCommit = async () => {
        markMutationStarted();
        await mutationGate;
    };

    const staleSend = harness.controller.handleMessage({
        type: 'fourth-wall/send',
        requestId: 'stale-send',
        payload: {
            chatIdentity: 'chat:a',
            sessionId: 'default',
            content: 'already being saved',
        },
    });
    await mutationStarted;
    harness.controller.deactivate('closed');
    const reopenedPosts = [];
    await harness.controller.activate({
        post: (type, payload) => reopenedPosts.push({ type, payload }),
    });

    releaseMutation();
    assert.deepEqual(await staleSend, { accepted: true });
    await flushAsyncWork();

    assert.equal(harness.requests.length, 0);
    assert.deepEqual(reopenedPosts, []);
    assert.deepEqual(harness.state.chat.sessions[0].history, []);
});

test('an abort-shaped provider failure settles the generation instead of leaving it running', async () => {
    const cancelled = [];
    const runtime = createFourthWallGenerationRuntime({
        loadAgentConfig: async () => ({}),
        generateResponse: async () => {
            const error = new Error('provider aborted');
            error.name = 'AbortError';
            throw error;
        },
    });

    const run = runtime.start({
        requestId: 'request-abort',
        builtPrompt: { msg1: '', msg2: '', msg3: '', msg4: '' },
        stream: false,
        disableAssistantPrefill: false,
        onCancelled: reason => cancelled.push(reason),
    });

    assert.deepEqual(await run.done, { status: 'cancelled' });
    assert.equal(runtime.isRunning(), false);
    assert.deepEqual(cancelled, ['aborted']);
});

test('Fourth Wall no longer owns an Agent settings action', async () => {
    const harness = createHarness();
    await harness.controller.activate({
        post: (type, payload) => harness.posts.push({ type, payload }),
    });

    await assert.rejects(harness.controller.handleMessage({
        type: 'fourth-wall/open-agent-settings',
        payload: { chatIdentity: 'chat:a', sessionId: 'default' },
    }), /unsupported_fourth_wall_action/);
});

test('a real commentary event prepares a new chat before generating and saving', async () => {
    let chat = null;
    let commentaryHandler;
    let prepareCalls = 0;
    const shown = [];
    const globalSettings = createDefaultFourthWallGlobalSettings();
    globalSettings.commentary = { enabled: true, probability: 99 };
    const controller = createFourthWallController({
        contextService: smallContext(),
        chatRepository: {
            async prepareCurrentChatFourthWall() {
                prepareCalls += 1;
                chat = createDefaultFourthWallChatState(1000);
                return structuredClone(chat);
            },
            readCurrentChatFourthWall: () => chat ? structuredClone(chat) : null,
            async mutateCurrentChatFourthWall(mutator) {
                chat = mutator(structuredClone(chat));
                return structuredClone(chat);
            },
        },
        settingsRepository: {
            read: () => ({ apps: { fourthWall: structuredClone(globalSettings) } }),
            mutateFourthWall: async mutator => mutator(structuredClone(globalSettings)),
        },
        getChatIdentity: () => ({ key: 'chat:new' }),
        getChatSnapshot: () => ({
            chatIdentity: 'chat:new',
            userName: 'User',
            characterName: 'Character',
            userAvatar: '',
            characterAvatar: '',
            messages: [],
        }),
        generateResponse: async () => ({ text: '<msg>new chat aside</msg>' }),
        loadAgentConfig: async () => ({}),
        commentary: {
            subscribe(handler) {
                commentaryHandler = handler;
                return () => {};
            },
            capture: () => ({
                chatIdentity: 'chat:new',
                messageIndex: 0,
                text: 'new message',
                kind: 'ai_message',
                chatSnapshot: {
                    chatIdentity: 'chat:new',
                    userName: 'User',
                    characterName: 'Character',
                    userAvatar: '',
                    characterAvatar: '',
                    messages: [],
                },
            }),
            show: text => shown.push(text),
            random: () => 0,
            now: () => 200000,
            setTimer(callback) {
                queueMicrotask(callback);
                return 1;
            },
            clearTimer: () => {},
        },
    });

    controller.startBackground();
    assert.equal(await commentaryHandler({ kind: 'ai_message' }), true);

    assert.equal(prepareCalls, 1);
    assert.equal(chat.sessions[0].history.at(-1).content, '(glanced at the last line) new chat aside');
    assert.deepEqual(shown, ['new chat aside']);
    controller.stopBackground();
});
