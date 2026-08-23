import test from 'node:test';
import assert from 'node:assert/strict';

import {
    classifyMissingDrawRun,
    DrawRunSubmissionError,
    submitDrawRun,
} from '../draw-run-coordinator.js';
import {
    getDrawRunMarker,
    listDrawRunMarkers,
    setDrawRunMarker,
} from '../draw-run-markers.js';
import { createDrawRunId } from '../draw-run-identifiers.js';

function createMessage() {
    return {
        mes: 'Hello.',
        extra: {},
        swipe_id: 0,
        swipes: ['Hello.', 'Other.'],
        swipe_info: [{ extra: {} }, { extra: {} }],
    };
}

function syncMessage(message) {
    return () => {
        message.swipe_info[message.swipe_id].extra = structuredClone(message.extra);
        return true;
    };
}

function createPrepared(channel = 'sillytavern-openai-compatible') {
    return {
        version: 1,
        planner: {
            prompt: { systemPrompt: 'system', messages: [{ role: 'user', content: 'content' }] },
            validationContext: {
                sceneSource: {
                    sourceText: 'Hello.',
                    sourceHash: 'scene-source-test',
                    content: 'Hello.',
                    numberedContent: 'Hello.',
                    points: [{ number: 1, offset: 6 }],
                },
                effectiveMaxImages: 1,
                effectiveMaxCharactersPerImage: 1,
                centerMode: 'normalized',
            },
            presentCharacters: [],
        },
        agent: {
            channel,
            providerConfig: {
                provider: channel,
                baseUrl: '',
                model: 'test-model',
                apiKey: 'must-not-leave-browser',
                tavilyApiKey: 'also-secret',
                maxTokens: 1000,
                timeoutMs: 5000,
                toolMode: 'native',
                reasoning: { mode: 'off' },
            },
        },
    };
}

function response(status, body) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

test('Draw Run ids fall back to cryptographic random bytes when randomUUID is unavailable', () => {
    const runId = createDrawRunId({
        getRandomValues(bytes) {
            bytes.forEach((_value, index) => { bytes[index] = index; });
            return bytes;
        },
    });

    assert.equal(runId, '00010203-0405-4607-8809-0a0b0c0d0e0f');
});

test('Draw Run marker accessor mirrors active swipe and isolates inactive swipes', () => {
    const message = createMessage();
    const syncActiveSwipe = syncMessage(message);
    setDrawRunMarker({
        message,
        messageId: 0,
        runId: 'run-test-101',
        marker: { provider: 'novelai', sourceHash: 'hash-1', createdAt: 100 },
        syncActiveSwipe,
    });
    setDrawRunMarker({
        message,
        messageId: 0,
        swipeIndex: 1,
        runId: 'run-test-102',
        marker: { provider: 'comfyui', sourceHash: 'hash-2', createdAt: 200 },
        syncActiveSwipe,
    });

    assert.equal(message.swipe_info[0].extra.xbDrawRuns['run-test-101'].sourceHash, 'hash-1');
    assert.equal(Object.hasOwn(message.extra.xbDrawRuns, 'run-test-102'), false);
    assert.equal(getDrawRunMarker(message, 1, 'run-test-102').provider, 'comfyui');
    assert.deepEqual(listDrawRunMarkers(message).map(item => item.runId), ['run-test-101', 'run-test-102']);
});

test('a message without swipe_id treats only swipe zero as the active working copy', () => {
    const message = {
        mes: 'Hello.',
        extra: {},
        swipes: ['Hello.', 'Other.'],
        swipe_info: [{ extra: {} }, { extra: {} }],
    };
    setDrawRunMarker({
        message,
        messageId: 0,
        swipeIndex: 0,
        runId: 'run-test-105',
        marker: { provider: 'novelai', sourceHash: 'hash-1', createdAt: 100 },
    });
    setDrawRunMarker({
        message,
        messageId: 0,
        swipeIndex: 1,
        runId: 'run-test-106',
        marker: { provider: 'novelai', sourceHash: 'hash-2', createdAt: 200 },
    });

    assert.equal(message.extra.xbDrawRuns['run-test-105'].sourceHash, 'hash-1');
    assert.equal(message.swipe_info[0].extra.xbDrawRuns, undefined);
    assert.equal(message.swipe_info[1].extra.xbDrawRuns['run-test-106'].sourceHash, 'hash-2');
});

test('frontend submission confirms the marker before POST and strips hosted-channel secrets', async () => {
    const message = createMessage();
    const ctx = {
        chatId: 'chat-1',
        chat: [message],
        getRequestHeaders: () => ({ 'X-CSRF-Token': 'csrf' }),
    };
    const order = [];
    const result = await submitDrawRun({
        ctx,
        message,
        messageId: 0,
        originalMes: 'Hello.',
        prepared: createPrepared(),
        imageProvider: 'sd-webui',
        generationRecipe: { host: 'http://sd', auth: '', timeout: 1000 },
        runId: 'run-test-103',
        syncActiveSwipe: syncMessage(message),
        isMessageBeingEdited: () => false,
        saveAndConfirm: async ({ verify }) => {
            order.push('save');
            assert.equal(await verify([{}, structuredClone(message)]), true);
        },
        fetchImpl: async (_url, options) => {
            order.push('post');
            const envelope = JSON.parse(options.body);
            assert.equal(Object.hasOwn(envelope.agent.providerConfig, 'apiKey'), false);
            assert.equal(Object.hasOwn(envelope.agent.providerConfig, 'tavilyApiKey'), false);
            return response(202, { ok: true, run: { id: envelope.runId, state: 'queued' } });
        },
    });

    assert.deepEqual(order, ['save', 'post']);
    assert.equal(result.status, 'accepted');
    assert.ok(getDrawRunMarker(message, 0, 'run-test-103'));
});

test('an unconfirmed marker never posts a Draw Run and remains recoverable', async () => {
    const message = createMessage();
    const ctx = { chatId: 'chat-1', chat: [message], getRequestHeaders: () => ({}) };
    let fetchCount = 0;
    await assert.rejects(submitDrawRun({
        ctx,
        message,
        messageId: 0,
        originalMes: 'Hello.',
        prepared: createPrepared(),
        imageProvider: 'sd-webui',
        generationRecipe: {},
        runId: 'run-test-104',
        syncActiveSwipe: syncMessage(message),
        isMessageBeingEdited: () => false,
        saveAndConfirm: async () => { throw new Error('readback failed'); },
        fetchImpl: async () => { fetchCount += 1; },
    }), error => error instanceof DrawRunSubmissionError && error.uncertain === true);

    assert.equal(fetchCount, 0);
    assert.ok(getDrawRunMarker(message, 0, 'run-test-104'));
});

test('an explicit 4xx rejection removes and confirms removal of the marker', async () => {
    const message = createMessage();
    const ctx = { chatId: 'chat-1', chat: [message], getRequestHeaders: () => ({}) };
    let saveCount = 0;
    await assert.rejects(submitDrawRun({
        ctx,
        message,
        messageId: 0,
        originalMes: 'Hello.',
        prepared: createPrepared(),
        imageProvider: 'sd-webui',
        generationRecipe: {},
        runId: 'run-test-105',
        syncActiveSwipe: syncMessage(message),
        isMessageBeingEdited: () => false,
        saveAndConfirm: async ({ verify }) => {
            saveCount += 1;
            assert.equal(await verify([{}, structuredClone(message)]), true);
        },
        fetchImpl: async () => response(400, { ok: false, code: 'invalid_draw_run', error: 'invalid' }),
    }), error => error?.code === 'invalid_draw_run' && error?.status === 400);

    assert.equal(saveCount, 2);
    assert.equal(getDrawRunMarker(message, 0, 'run-test-105'), null);
});

test('missing Draw Runs stay uncertain for 120 seconds before marker cleanup', () => {
    assert.equal(classifyMissingDrawRun(1_000, 120_999), 'wait');
    assert.equal(classifyMissingDrawRun(1_000, 121_000), 'clear');
});

test('request-header acquisition failure remains a recoverable uncertain submission', async () => {
    const message = createMessage();
    const ctx = {
        chatId: 'chat-1',
        chat: [message],
        getRequestHeaders: () => { throw new Error('headers unavailable'); },
    };
    let fetchCount = 0;
    const result = await submitDrawRun({
        ctx,
        message,
        messageId: 0,
        originalMes: 'Hello.',
        prepared: createPrepared(),
        imageProvider: 'sd-webui',
        generationRecipe: {},
        runId: 'run-test-107',
        syncActiveSwipe: syncMessage(message),
        isMessageBeingEdited: () => false,
        saveAndConfirm: async ({ verify }) => {
            assert.equal(await verify([{}, structuredClone(message)]), true);
        },
        fetchImpl: async () => { fetchCount += 1; },
    });

    assert.equal(result.status, 'uncertain');
    assert.equal(fetchCount, 0);
    assert.ok(getDrawRunMarker(message, 0, 'run-test-107'));
});
