'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');

const drawRuntime = require('../draw-runs/vendor/draw-run-runtime.cjs');
const { createDrawRunManager } = require('../draw-runs/draw-run-manager.js');
const { createEnvelopeValidator } = require('../draw-runs/envelope.js');

function createEnvelope(runId, overrides = {}) {
    const sourceText = 'Hello.';
    const sourceHash = drawRuntime.hashSceneSource(sourceText);
    const envelope = {
        version: 1,
        runId,
        sourceHash,
        imageProvider: 'sd-webui',
        planner: {
            prompt: { systemPrompt: 'system', messages: [{ role: 'user', content: 'content' }] },
            validationContext: {
                sceneSource: {
                    sourceText,
                    sourceHash,
                    content: sourceText,
                    numberedContent: sourceText,
                    points: [{ number: 1, offset: sourceText.length }],
                },
                effectiveMaxImages: 1,
                effectiveMaxCharactersPerImage: 1,
                centerMode: 'normalized',
            },
            presentCharacters: [],
        },
        agent: {
            channel: 'openai-compatible',
            providerConfig: {
                provider: 'openai-compatible',
                baseUrl: 'https://agent.example.test',
                model: 'test-model',
                apiKey: 'agent-secret',
                maxTokens: 1000,
                timeoutMs: 5000,
                toolMode: 'native',
                reasoning: { mode: 'off', output: 'hide' },
            },
        },
        generationRecipe: {
            host: 'https://sd.example.test',
            auth: 'image-secret',
            timeout: 5000,
            delayMs: 1000,
            params: {},
            positivePrefix: '',
            negativePrefix: '',
            knownCharacters: [],
            promptOverride: '',
            negativePromptOverride: '',
        },
    };
    return Object.assign(envelope, overrides);
}

function createImageJobService() {
    const jobs = new Map();
    const cancellations = [];
    return {
        jobs,
        cancellations,
        create(owner, body) {
            const key = `${owner}\0${body.requestId}`;
            jobs.set(key, { id: body.requestId, state: 'queued', body });
            return jobs.get(key);
        },
        get(owner, jobId) {
            return jobs.get(`${owner}\0${jobId}`) || null;
        },
        cancel(owner, jobId) {
            cancellations.push({ owner, jobId });
            return this.get(owner, jobId);
        },
    };
}

function createRuntime(overrides = {}) {
    return {
        ...drawRuntime,
        async executePreparedScenePlanner() {
            return [{ scene: 'portrait', chars: [], placement: { insertAfter: 1 } }];
        },
        compileDrawRunImages(_provider, scenePlan) {
            return {
                provider: 'sd-webui',
                context: { url: 'https://sd.example.test', auth: 'image-secret' },
                delay: { min: 1000, max: 1000 },
                items: [{ request: { payload: { prompt: 'portrait' } }, timeout: 5000 }],
                artifacts: [{
                    task: scenePlan[0],
                    tags: 'portrait',
                    promptData: { positive: 'portrait', negative: 'bad', characterPrompts: [] },
                }],
            };
        },
        ...overrides,
    };
}

function createManager({
    runtime = createRuntime(),
    imageJobService = createImageJobService(),
    managerOptions = {},
} = {}) {
    return {
        manager: createDrawRunManager({
            runtime,
            agentCore: { createAgentAdapter() {} },
            envelopeValidator: createEnvelopeValidator(drawRuntime),
            imageJobService,
            createHostClient() { throw new Error('host client must not be created for a direct channel'); },
            errorRetentionMs: 10_000,
            ...managerOptions,
        }),
        imageJobService,
    };
}

async function waitFor(predicate, timeoutMs = 1000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        const value = predicate();
        if (value) return value;
        await new Promise(resolve => setTimeout(resolve, 2));
    }
    assert.fail('Timed out waiting for Draw Run state');
}

test('Draw Run dispatch is idempotent and hands off a deterministic child manifest', async (t) => {
    const { manager, imageJobService } = createManager();
    t.after(() => manager.close());
    const envelope = createEnvelope('run-test-001');

    assert.equal(manager.create('alice', envelope, {}).state, 'queued');
    assert.equal(manager.create('alice', envelope, {}).id, 'run-test-001');
    const dispatched = await waitFor(() => {
        const run = manager.get('alice', 'run-test-001');
        return run?.state === 'dispatched' ? run : null;
    });

    assert.equal(imageJobService.jobs.size, 1);
    assert.equal(dispatched.childJobId, 'draw-run:run-test-001');
    assert.deepEqual(dispatched.handoffManifest.items[0], {
        index: 0,
        slotId: 'slot-draw-run-test-001-1',
        imgId: 'img-draw-run-test-001-1',
        insertOffset: 6,
        displayMetadata: {
            tags: 'portrait',
            positive: 'portrait',
            characterPrompts: [],
            negativePrompt: 'bad',
        },
    });
    assert.doesNotMatch(JSON.stringify(dispatched), /agent-secret|image-secret/);
    const conflicting = structuredClone(envelope);
    conflicting.planner.prompt.systemPrompt = 'different';
    assert.throws(
        () => manager.create('alice', conflicting, {}),
        error => error?.status === 409 && error?.code === 'draw_run_id_conflict',
    );
});

test('pre-child cancellation aborts planning without creating an image job', async (t) => {
    let planningStarted;
    const started = new Promise(resolve => { planningStarted = resolve; });
    const runtime = createRuntime({
        async executePreparedScenePlanner(_prepared, { signal }) {
            planningStarted();
            await new Promise((resolve, reject) => {
                signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { code: 'REQUEST_ABORTED' })), { once: true });
            });
        },
    });
    const { manager, imageJobService } = createManager({ runtime });
    t.after(() => manager.close());
    manager.create('alice', createEnvelope('run-test-002'), {});
    await started;

    assert.equal(manager.cancel('alice', 'run-test-002').state, 'cancelling');
    const cancelled = await waitFor(() => manager.get('alice', 'run-test-002')?.state === 'cancelled');
    assert.equal(cancelled, true);
    assert.equal(imageJobService.jobs.size, 0);
});

test('post-child cancellation preserves the dispatched manifest and forwards cancellation', async (t) => {
    const { manager, imageJobService } = createManager();
    t.after(() => manager.close());
    manager.create('alice', createEnvelope('run-test-003'), {});
    await waitFor(() => manager.get('alice', 'run-test-003')?.state === 'dispatched');

    const cancelled = manager.cancel('alice', 'run-test-003');
    assert.equal(cancelled.state, 'dispatched');
    assert.ok(cancelled.handoffManifest);
    assert.equal(Number.isFinite(cancelled.cancelRequestedAt), true);
    assert.deepEqual(imageJobService.cancellations, [{ owner: 'alice', jobId: 'draw-run:run-test-003' }]);
});

test('retained Draw Run failures redact Agent and image provider credentials', async (t) => {
    const runtime = createRuntime({
        compileDrawRunImages() {
            throw new Error('agent-secret, image-secret, pa%24%24word, and pa$$word must not escape');
        },
    });
    const { manager } = createManager({ runtime });
    t.after(() => manager.close());
    const envelope = createEnvelope('run-test-004');
    envelope.generationRecipe.host = 'https://user:pa%24%24word@sd.example.test';
    manager.create('alice', envelope, {});
    const failed = await waitFor(() => {
        const run = manager.get('alice', 'run-test-004');
        return run?.state === 'failed' ? run : null;
    });

    assert.match(failed.error.message, /\[redacted\]/);
    assert.doesNotMatch(JSON.stringify(failed), /agent-secret|image-secret|pa%24%24word|pa\$\$word/);
});

test('hosted Agent envelopes reject browser-carried API keys', () => {
    const envelope = createEnvelope('run-test-005');
    envelope.agent.channel = 'sillytavern-openai-compatible';
    envelope.agent.providerConfig.provider = 'sillytavern-openai-compatible';
    assert.throws(
        () => createEnvelopeValidator(drawRuntime)(envelope),
        error => error?.status === 400 && /must not include API keys/.test(error.message),
    );
});

test('closing the manager while planning prevents a late child job from being created', async () => {
    let releasePlanner;
    let planningStarted;
    const started = new Promise(resolve => { planningStarted = resolve; });
    const runtime = createRuntime({
        async executePreparedScenePlanner() {
            planningStarted();
            await new Promise(resolve => { releasePlanner = resolve; });
            return [{ scene: 'portrait', chars: [], placement: { insertAfter: 1 } }];
        },
    });
    const { manager, imageJobService } = createManager({ runtime });
    manager.create('alice', createEnvelope('run-test-006'), {});
    await started;

    manager.close();
    releasePlanner();
    await new Promise(resolve => setTimeout(resolve, 10));

    assert.equal(imageJobService.jobs.size, 0);
});

test('a disappeared child is retired without waiting for another API request', async (t) => {
    const imageJobService = createImageJobService();
    const { manager } = createManager({
        imageJobService,
        managerOptions: { childSweepIntervalMs: 5, errorRetentionMs: 0 },
    });
    t.after(() => manager.close());
    manager.create('alice', createEnvelope('run-test-007'), {});
    await waitFor(() => manager.get('alice', 'run-test-007')?.state === 'dispatched');

    imageJobService.jobs.delete('alice\0draw-run:run-test-007');
    await new Promise(resolve => setTimeout(resolve, 30));

    assert.equal(manager.get('alice', 'run-test-007'), null);
});
