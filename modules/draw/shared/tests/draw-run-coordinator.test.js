import test from 'node:test';
import assert from 'node:assert/strict';

import {
    clearDrawRunMarkerAndConfirm,
    classifyMissingDrawRun,
    DrawRunSubmissionError,
    submitDrawRun,
} from '../draw-run-coordinator.js';
import {
    createDrawRunMarker,
    getDrawRunAutomaticCompletion,
    getDrawRunMarker,
    listDrawRunMarkers,
    setDrawRunMarker,
} from '../draw-run-markers.js';
import { createDrawRunId } from '../draw-run-identifiers.js';
import { createSceneSource, hashSceneSource } from '../scene-source.js';
import { withConfirmableChatMutation } from '../confirmable-chat-save.js';

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

function confirmPersistedMessage(message, onRead) {
    return async ({ verify }) => {
        onRead?.();
        return {
            confirmed: await verify([{ chat_metadata: {} }, structuredClone(message)]),
        };
    };
}

function createPrepared(channel = 'sillytavern-openai-compatible', sourceText = 'Hello.') {
    const sceneSource = createSceneSource(sourceText);
    return {
        version: 1,
        planner: {
            prompt: { systemPrompt: 'system', messages: [{ role: 'user', content: 'content' }] },
            validationContext: {
                sceneSource,
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
                apiKey: 'proxy-password',
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
        marker: { provider: 'novelai', sourceHash: 'hash-1', targetHash: 'target-1', createdAt: 100 },
        syncActiveSwipe,
    });
    setDrawRunMarker({
        message,
        messageId: 0,
        swipeIndex: 1,
        runId: 'run-test-102',
        marker: { provider: 'comfyui', sourceHash: 'hash-2', targetHash: 'target-2', createdAt: 200 },
        syncActiveSwipe,
    });

    assert.equal(message.swipe_info[0].extra.xbDrawRuns['run-test-101'].sourceHash, 'hash-1');
    assert.equal(Object.hasOwn(message.extra.xbDrawRuns, 'run-test-102'), false);
    assert.equal(getDrawRunMarker(message, 1, 'run-test-102').provider, 'comfyui');
    assert.deepEqual(listDrawRunMarkers(message).map(item => item.runId), ['run-test-101', 'run-test-102']);
});

test('Draw Run marker preserves a validated cancellation intent across swipe mirroring', () => {
    const message = createMessage();
    const syncActiveSwipe = syncMessage(message);
    const marker = createDrawRunMarker({
        provider: 'novelai',
        sourceHash: 'hash-1',
        targetHash: 'target-1',
        createdAt: 100,
        cancelRequestedAt: 200,
    });
    setDrawRunMarker({
        message,
        messageId: 0,
        runId: 'run-test-111',
        marker,
        syncActiveSwipe,
    });
    assert.equal(getDrawRunMarker(message, 0, 'run-test-111').cancelRequestedAt, 200);
    assert.equal(message.swipe_info[0].extra.xbDrawRuns['run-test-111'].cancelRequestedAt, 200);
    assert.throws(() => createDrawRunMarker({
        provider: 'novelai', sourceHash: 'hash-1', targetHash: 'target-1', createdAt: 100, cancelRequestedAt: 0,
    }), /取消时间无效/);
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
        marker: { provider: 'novelai', sourceHash: 'hash-1', targetHash: 'target-1', createdAt: 100 },
    });
    setDrawRunMarker({
        message,
        messageId: 0,
        swipeIndex: 1,
        runId: 'run-test-106',
        marker: { provider: 'novelai', sourceHash: 'hash-2', targetHash: 'target-2', createdAt: 200 },
    });

    assert.equal(message.extra.xbDrawRuns['run-test-105'].sourceHash, 'hash-1');
    assert.equal(message.swipe_info[0].extra.xbDrawRuns, undefined);
    assert.equal(message.swipe_info[1].extra.xbDrawRuns['run-test-106'].sourceHash, 'hash-2');
});

test('frontend submission confirms the marker before POST and retains the hosted proxy password', async () => {
    const message = createMessage();
    const ctx = {
        chatId: 'chat-1',
        chat: [message],
        getRequestHeaders: () => ({ 'X-CSRF-Token': 'csrf' }),
    };
    const order = [];
    const result = await submitDrawRun({
        ctx,
        getCurrentContext: () => ctx,
        message,
        messageId: 0,
        targetHash: hashSceneSource(message.mes),
        prepared: createPrepared(),
        imageProvider: 'sd-webui',
        generationRecipe: { host: 'http://sd', auth: '', timeout: 1000 },
        runId: 'run-test-103',
        syncActiveSwipe: syncMessage(message),
        isMessageBeingEdited: () => false,
        readAndConfirm: confirmPersistedMessage(message, () => order.push('read')),
        saveAndConfirm: async ({ verify }) => {
            order.push('save');
            assert.equal(await verify([{ chat_metadata: {} }, structuredClone(message)]), true);
        },
        fetchImpl: async (_url, options) => {
            order.push('post');
            const envelope = JSON.parse(options.body);
            assert.equal(envelope.agent.providerConfig.apiKey, 'proxy-password');
            assert.equal(Object.hasOwn(envelope.agent.providerConfig, 'tavilyApiKey'), false);
            return response(202, { ok: true, run: { id: envelope.runId, state: 'queued' } });
        },
    });

    assert.deepEqual(order, ['read', 'save', 'post']);
    assert.equal(result.status, 'accepted');
    assert.ok(getDrawRunMarker(message, 0, 'run-test-103'));
});

test('submission waits for a pending host save without overwriting the persisted chat itself', async () => {
    const message = createMessage();
    const ctx = { chatId: 'chat-1', chat: [message], getRequestHeaders: () => ({}) };
    let reads = 0;
    let waits = 0;
    let saves = 0;

    const result = await submitDrawRun({
        ctx,
        getCurrentContext: () => ctx,
        message,
        messageId: 0,
        targetHash: hashSceneSource(message.mes),
        prepared: createPrepared(),
        imageProvider: 'sd-webui',
        generationRecipe: {},
        runId: 'run-test-local-save',
        syncActiveSwipe: syncMessage(message),
        isMessageBeingEdited: () => false,
        readAndConfirm: async ({ verify }) => {
            reads += 1;
            const persisted = reads < 3 ? { ...structuredClone(message), mes: 'older' } : structuredClone(message);
            return { confirmed: await verify([{ chat_metadata: {} }, persisted]) };
        },
        waitForLocalSave: async () => { waits += 1; },
        saveAndConfirm: async ({ verify }) => {
            saves += 1;
            assert.equal(await verify([{ chat_metadata: {} }, structuredClone(message)]), true);
        },
        fetchImpl: async () => response(202, { run: { id: 'run-test-local-save' } }),
    });

    assert.equal(result.status, 'accepted');
    assert.equal(reads, 3);
    assert.equal(waits, 2);
    assert.equal(saves, 1);
});

test('submission never saves over a persisted chat that remains different after host settling', async () => {
    const message = createMessage();
    const ctx = { chatId: 'chat-1', chat: [message], getRequestHeaders: () => ({}) };
    let saves = 0;
    let posts = 0;

    await assert.rejects(submitDrawRun({
        ctx,
        getCurrentContext: () => ctx,
        message,
        messageId: 0,
        targetHash: hashSceneSource(message.mes),
        prepared: createPrepared(),
        imageProvider: 'sd-webui',
        generationRecipe: {},
        runId: 'run-test-remote-change',
        syncActiveSwipe: syncMessage(message),
        isMessageBeingEdited: () => false,
        readAndConfirm: async ({ verify }) => ({
            confirmed: await verify([{ chat_metadata: {} }, { ...structuredClone(message), mes: 'remote edit' }]),
        }),
        waitForLocalSave: async () => {},
        saveAndConfirm: async () => { saves += 1; },
        fetchImpl: async () => { posts += 1; },
    }), error => error?.code === 'DRAW_RUN_TARGET_CHANGED');

    assert.equal(saves, 0);
    assert.equal(posts, 0);
    assert.equal(listDrawRunMarkers(message).length, 0);
});

test('an unconfirmed marker never posts a Draw Run and remains recoverable', async () => {
    const message = createMessage();
    const ctx = { chatId: 'chat-1', chat: [message], getRequestHeaders: () => ({}) };
    let fetchCount = 0;
    let saveCount = 0;
    await assert.rejects(submitDrawRun({
        ctx,
        getCurrentContext: () => ctx,
        message,
        messageId: 0,
        targetHash: hashSceneSource(message.mes),
        prepared: createPrepared(),
        imageProvider: 'sd-webui',
        generationRecipe: {},
        runId: 'run-test-104',
        syncActiveSwipe: syncMessage(message),
        isMessageBeingEdited: () => false,
        readAndConfirm: confirmPersistedMessage(message),
        saveAndConfirm: async ({ verify }) => {
            saveCount += 1;
            assert.equal(await verify([{ chat_metadata: {} }, structuredClone(message)]), true);
            throw new Error('readback failed');
        },
        fetchImpl: async () => { fetchCount += 1; },
    }), error => error instanceof DrawRunSubmissionError && error.uncertain === true);

    assert.equal(saveCount, 1);
    assert.equal(fetchCount, 0);
    assert.ok(getDrawRunMarker(message, 0, 'run-test-104'));
});

test('a write precondition conflict never posts and removes its unsaved local marker', async () => {
    const message = createMessage();
    const ctx = { chatId: 'chat-1', chat: [message], getRequestHeaders: () => ({}) };
    let fetchCount = 0;
    let saveCount = 0;
    await assert.rejects(submitDrawRun({
        ctx,
        getCurrentContext: () => ctx,
        message,
        messageId: 0,
        targetHash: hashSceneSource(message.mes),
        prepared: createPrepared(),
        imageProvider: 'sd-webui',
        generationRecipe: {},
        runId: 'run-test-114',
        syncActiveSwipe: syncMessage(message),
        isMessageBeingEdited: () => false,
        readAndConfirm: confirmPersistedMessage(message),
        saveAndConfirm: async ({ verify }) => {
            saveCount += 1;
            assert.equal(await verify([{ chat_metadata: {} }, structuredClone(message)]), true);
            const error = new Error('stale chat');
            error.reason = 'precondition_failed';
            error.saveAttempted = false;
            throw error;
        },
        fetchImpl: async () => { fetchCount += 1; },
    }), error => error?.code === 'DRAW_RUN_TARGET_CHANGED' && error.uncertain === false);

    assert.equal(saveCount, 1);
    assert.equal(fetchCount, 0);
    assert.equal(getDrawRunMarker(message, 0, 'run-test-114'), null);
});

test('an explicit 4xx rejection removes and confirms removal of the marker', async () => {
    const message = createMessage();
    const ctx = { chatId: 'chat-1', chat: [message], getRequestHeaders: () => ({}) };
    let saveCount = 0;
    await assert.rejects(submitDrawRun({
        ctx,
        getCurrentContext: () => ctx,
        message,
        messageId: 0,
        targetHash: hashSceneSource(message.mes),
        prepared: createPrepared(),
        imageProvider: 'sd-webui',
        generationRecipe: {},
        runId: 'run-test-105',
        syncActiveSwipe: syncMessage(message),
        isMessageBeingEdited: () => false,
        readAndConfirm: confirmPersistedMessage(message),
        saveAndConfirm: async ({ verify }) => {
            saveCount += 1;
            assert.equal(await verify([{ chat_metadata: {} }, structuredClone(message)]), true);
        },
        fetchImpl: async () => response(400, { ok: false, code: 'invalid_draw_run', error: 'invalid' }),
    }), error => error?.code === 'invalid_draw_run' && error?.status === 400);

    assert.equal(saveCount, 2);
    assert.equal(getDrawRunMarker(message, 0, 'run-test-105'), null);
});

test('an uncertain marker removal restores the local deletion handle for read-back recovery', async () => {
    const message = createMessage();
    const ctx = { chatId: 'chat-1', chat: [message], getRequestHeaders: () => ({}) };
    const marker = setDrawRunMarker({
        message,
        messageId: 0,
        runId: 'run-test-115',
        marker: {
            provider: 'novelai', sourceHash: 'hash-1', targetHash: 'target-1', createdAt: 100,
            automatic: true,
        },
        syncActiveSwipe: syncMessage(message),
    });

    await assert.rejects(clearDrawRunMarkerAndConfirm({
        ctx,
        message,
        messageId: 0,
        swipeIndex: 0,
        runId: 'run-test-115',
        marker,
        syncActiveSwipe: syncMessage(message),
        completeAutomatic: true,
        saveAndConfirm: async () => {
            assert.equal(getDrawRunAutomaticCompletion(message, 0, 'novelai'), true);
            throw new Error('readback lost');
        },
    }), /readback lost/);

    assert.deepEqual(getDrawRunMarker(message, 0, 'run-test-115'), marker);
    assert.equal(getDrawRunAutomaticCompletion(message, 0, 'novelai'), false);
});

test('successful automatic handoff replaces its marker with the existing provider auto-done fact', async () => {
    const message = createMessage();
    const ctx = { chatId: 'chat-1', chat: [message], getRequestHeaders: () => ({}) };
    const syncActiveSwipe = syncMessage(message);
    const marker = setDrawRunMarker({
        message,
        messageId: 0,
        runId: 'run-test-116',
        marker: {
            provider: 'sd-webui',
            sourceHash: 'hash-1',
            targetHash: 'target-1',
            createdAt: 100,
            automatic: true,
        },
        syncActiveSwipe,
    });
    const persistedBefore = structuredClone(message);

    await clearDrawRunMarkerAndConfirm({
        ctx,
        message,
        messageId: 0,
        swipeIndex: 0,
        runId: 'run-test-116',
        marker,
        syncActiveSwipe,
        completeAutomatic: true,
        saveAndConfirm: async ({ precondition, verify }) => {
            assert.equal(await precondition([{ chat_metadata: {} }, persistedBefore]), true);
            assert.equal(await verify([{ chat_metadata: {} }, structuredClone(message)]), true);
        },
    });

    assert.equal(getDrawRunMarker(message, 0, 'run-test-116'), null);
    assert.equal(message.extra.xb_sd_auto_done, true);
    assert.equal(message.swipe_info[0].extra.xb_sd_auto_done, true);
});

test('missing Draw Runs stay uncertain for 120 seconds before marker cleanup', () => {
    assert.equal(classifyMissingDrawRun(1_000, 120_999), 'wait');
    assert.equal(classifyMissingDrawRun(1_000, 121_000), 'clear');
});

test('a page farewell narrows only its interrupted Draw Run submission window to 20 seconds', () => {
    const farewell = { kind: 'run', id: 'run-test-farewell', at: 100_000 };
    assert.equal(classifyMissingDrawRun(1_000, 119_999, farewell), 'wait');
    assert.equal(classifyMissingDrawRun(1_000, 120_000, farewell), 'clear');
    assert.equal(classifyMissingDrawRun(1_000, 120_000), 'wait');
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
        getCurrentContext: () => ctx,
        message,
        messageId: 0,
        targetHash: hashSceneSource(message.mes),
        prepared: createPrepared(),
        imageProvider: 'sd-webui',
        generationRecipe: {},
        runId: 'run-test-107',
        syncActiveSwipe: syncMessage(message),
        isMessageBeingEdited: () => false,
        readAndConfirm: confirmPersistedMessage(message),
        saveAndConfirm: async ({ verify }) => {
            assert.equal(await verify([{ chat_metadata: {} }, structuredClone(message)]), true);
        },
        fetchImpl: async () => { fetchCount += 1; },
    });

    assert.equal(result.status, 'uncertain');
    assert.equal(fetchCount, 0);
    assert.ok(getDrawRunMarker(message, 0, 'run-test-107'));
});

test('a timed-out submission queries the deterministic run instead of hanging or reposting', async () => {
    const message = createMessage();
    const ctx = { chatId: 'chat-1', chat: [message], getRequestHeaders: () => ({}) };
    const methods = [];
    const result = await submitDrawRun({
        ctx,
        getCurrentContext: () => ctx,
        message,
        messageId: 0,
        targetHash: hashSceneSource(message.mes),
        prepared: createPrepared(),
        imageProvider: 'sd-webui',
        generationRecipe: {},
        runId: 'run-test-116',
        syncActiveSwipe: syncMessage(message),
        isMessageBeingEdited: () => false,
        readAndConfirm: confirmPersistedMessage(message),
        saveAndConfirm: async ({ verify }) => {
            assert.equal(await verify([{ chat_metadata: {} }, structuredClone(message)]), true);
        },
        requestTimeoutMs: 5,
        fetchImpl: async (_url, options) => {
            methods.push(options.method);
            if (options.method === 'GET') {
                return response(200, { ok: true, run: { id: 'run-test-116', state: 'queued' } });
            }
            return new Promise((_, reject) => {
                options.signal.addEventListener('abort', () => reject(new DOMException('timed out', 'AbortError')), { once: true });
            });
        },
    });

    assert.equal(result.status, 'accepted');
    assert.equal(result.recovered, true);
    assert.deepEqual(methods, ['POST', 'GET']);
});

test('submission derives the active swipe and rejects a plan prepared from another swipe', async () => {
    const message = createMessage();
    const ctx = { chatId: 'chat-1', chat: [message], getRequestHeaders: () => ({}) };
    let saveCount = 0;
    let fetchCount = 0;

    await assert.rejects(submitDrawRun({
        ctx,
        getCurrentContext: () => ctx,
        message,
        messageId: 0,
        targetHash: hashSceneSource(message.mes),
        swipeIndex: 1,
        prepared: createPrepared(undefined, 'Other.'),
        imageProvider: 'sd-webui',
        generationRecipe: {},
        runId: 'run-test-108',
        syncActiveSwipe: syncMessage(message),
        isMessageBeingEdited: () => false,
        saveAndConfirm: async () => { saveCount += 1; },
        fetchImpl: async () => { fetchCount += 1; },
    }), error => error?.code === 'DRAW_RUN_SOURCE_CHANGED');

    assert.equal(saveCount, 0);
    assert.equal(fetchCount, 0);
    assert.equal(listDrawRunMarkers(message).length, 0);
});

test('submission rejects an identical-text swipe switch after the click target was frozen', async () => {
    const message = createMessage();
    message.swipes[1] = message.mes;
    const ctx = { chatId: 'chat-1', chat: [message], getRequestHeaders: () => ({}) };
    message.swipe_id = 1;
    let saveCount = 0;
    let fetchCount = 0;

    await assert.rejects(submitDrawRun({
        ctx,
        getCurrentContext: () => ctx,
        message,
        messageId: 0,
        targetSwipeIndex: 0,
        targetHash: hashSceneSource(message.mes),
        prepared: createPrepared(),
        imageProvider: 'sd-webui',
        generationRecipe: {},
        runId: 'run-test-118',
        syncActiveSwipe: syncMessage(message),
        isMessageBeingEdited: () => false,
        saveAndConfirm: async () => { saveCount += 1; },
        fetchImpl: async () => { fetchCount += 1; },
    }), error => error?.code === 'DRAW_RUN_TARGET_CHANGED');

    assert.equal(saveCount, 0);
    assert.equal(fetchCount, 0);
    assert.equal(listDrawRunMarkers(message).length, 0);
});

test('submission writes the marker to the active swipe without accepting a target index', async () => {
    const message = createMessage();
    message.swipe_id = 1;
    message.mes = 'Other.';
    const ctx = { chatId: 'chat-1', chat: [message], getRequestHeaders: () => ({}) };

    await submitDrawRun({
        ctx,
        getCurrentContext: () => ctx,
        message,
        messageId: 0,
        targetHash: hashSceneSource(message.mes),
        prepared: createPrepared(undefined, 'Other.'),
        imageProvider: 'sd-webui',
        generationRecipe: {},
        runId: 'run-test-109',
        syncActiveSwipe: syncMessage(message),
        isMessageBeingEdited: () => false,
        readAndConfirm: confirmPersistedMessage(message),
        saveAndConfirm: async ({ verify }) => {
            assert.equal(await verify([{ chat_metadata: {} }, structuredClone(message)]), true);
        },
        fetchImpl: async () => response(202, { ok: true, run: { id: 'run-test-109', state: 'queued' } }),
    });

    assert.equal(getDrawRunMarker(message, 0, 'run-test-109'), null);
    assert.ok(getDrawRunMarker(message, 1, 'run-test-109'));
});

test('an existing active-swipe marker prevents another submission', async () => {
    const message = createMessage();
    const ctx = { chatId: 'chat-1', chat: [message], getRequestHeaders: () => ({}) };
    setDrawRunMarker({
        message,
        messageId: 0,
        runId: 'run-existing',
        marker: { provider: 'novelai', sourceHash: 'hash-existing', targetHash: 'target-existing', createdAt: 100 },
        syncActiveSwipe: syncMessage(message),
    });
    let saveCount = 0;
    let fetchCount = 0;

    await assert.rejects(submitDrawRun({
        ctx,
        getCurrentContext: () => ctx,
        message,
        messageId: 0,
        targetHash: hashSceneSource(message.mes),
        prepared: createPrepared(),
        imageProvider: 'sd-webui',
        generationRecipe: {},
        runId: 'run-test-112',
        syncActiveSwipe: syncMessage(message),
        isMessageBeingEdited: () => false,
        saveAndConfirm: async () => { saveCount += 1; },
        fetchImpl: async () => { fetchCount += 1; },
    }), error => error?.code === 'DRAW_RUN_ALREADY_PENDING');

    assert.equal(saveCount, 0);
    assert.equal(fetchCount, 0);
    assert.equal(listDrawRunMarkers(message).length, 1);
});

test('concurrent submissions recheck duplicate ownership inside the chat mutation queue', async () => {
    const message = createMessage();
    const ctx = { chatId: 'chat-1', chat: [message], getRequestHeaders: () => ({}) };
    const common = {
        ctx,
        getCurrentContext: () => ctx,
        message,
        messageId: 0,
        targetHash: hashSceneSource(message.mes),
        prepared: createPrepared(),
        imageProvider: 'sd-webui',
        generationRecipe: {},
        syncActiveSwipe: syncMessage(message),
        isMessageBeingEdited: () => false,
        readAndConfirm: confirmPersistedMessage(message),
        saveAndConfirm: async ({ verify }) => assert.equal(
            await verify([{ chat_metadata: {} }, structuredClone(message)]),
            true,
        ),
        fetchImpl: async (_url, options) => response(202, {
            run: { id: JSON.parse(options.body).runId },
        }),
    };

    const results = await Promise.allSettled([
        submitDrawRun({ ...common, runId: 'run-concurrent-a' }),
        submitDrawRun({ ...common, runId: 'run-concurrent-b' }),
    ]);

    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    const rejected = results.find(result => result.status === 'rejected');
    assert.equal(rejected?.reason?.code, 'DRAW_RUN_ALREADY_PENDING');
    assert.equal(listDrawRunMarkers(message).length, 1);
});

test('cancelling while submission waits for the chat mutation lock never writes a marker', async () => {
    const message = createMessage();
    const ctx = { chatId: 'chat-1', chat: [message], getRequestHeaders: () => ({}) };
    let releaseLock;
    let lockStarted;
    const started = new Promise(resolve => { lockStarted = resolve; });
    const held = withConfirmableChatMutation(ctx, async () => {
        lockStarted();
        await new Promise(resolve => { releaseLock = resolve; });
    });
    await started;

    const controller = new AbortController();
    let saveCount = 0;
    let fetchCount = 0;
    const submission = submitDrawRun({
        ctx,
        getCurrentContext: () => ctx,
        message,
        messageId: 0,
        targetHash: hashSceneSource(message.mes),
        prepared: createPrepared(),
        imageProvider: 'sd-webui',
        generationRecipe: {},
        runId: 'run-test-117',
        syncActiveSwipe: syncMessage(message),
        isMessageBeingEdited: () => false,
        saveAndConfirm: async () => { saveCount += 1; },
        fetchImpl: async () => { fetchCount += 1; },
        signal: controller.signal,
    });
    controller.abort();
    releaseLock();
    await held;

    await assert.rejects(submission, error => error?.code === 'DRAW_RUN_CANCELLED');
    assert.equal(saveCount, 0);
    assert.equal(fetchCount, 0);
    assert.equal(listDrawRunMarkers(message).length, 0);
});

test('submission rejects image-slot-only edits against the exact click-time target', async () => {
    const message = createMessage();
    message.mes = 'Hello.[image:old-slot]';
    message.swipes[0] = message.mes;
    const targetHash = hashSceneSource(message.mes);
    const prepared = createPrepared(undefined, 'Hello.');
    const ctx = { chatId: 'chat-1', chat: [message], getRequestHeaders: () => ({}) };
    message.mes = 'Hello.[image:new-slot]';
    message.swipes[0] = message.mes;
    let saveCount = 0;
    let fetchCount = 0;

    await assert.rejects(submitDrawRun({
        ctx,
        getCurrentContext: () => ctx,
        message,
        messageId: 0,
        targetHash,
        prepared,
        imageProvider: 'sd-webui',
        generationRecipe: {},
        runId: 'run-test-113',
        syncActiveSwipe: syncMessage(message),
        isMessageBeingEdited: () => false,
        saveAndConfirm: async () => { saveCount += 1; },
        fetchImpl: async () => { fetchCount += 1; },
    }), error => error?.code === 'DRAW_RUN_TARGET_CHANGED');

    assert.equal(saveCount, 0);
    assert.equal(fetchCount, 0);
    assert.equal(listDrawRunMarkers(message).length, 0);
});

test('submission requires live context and editing-state dependencies', async () => {
    const message = createMessage();
    const ctx = { chatId: 'chat-1', chat: [message], getRequestHeaders: () => ({}) };
    const base = {
        ctx,
        message,
        messageId: 0,
        targetHash: hashSceneSource(message.mes),
        prepared: createPrepared(),
        imageProvider: 'sd-webui',
        generationRecipe: {},
        runId: 'run-test-110',
        fetchImpl: async () => response(202, {}),
        saveAndConfirm: async () => {},
    };

    await assert.rejects(submitDrawRun({
        ...base,
        isMessageBeingEdited: () => false,
    }), /当前聊天上下文读取器/);
    await assert.rejects(submitDrawRun({
        ...base,
        getCurrentContext: () => ctx,
    }), /楼层编辑状态读取器/);
});
