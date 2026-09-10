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
            tool: {
                type: 'function',
                function: {
                    name: 'submit_scene_plan',
                    description: 'Submit the image tasks.',
                    parameters: { type: 'object', required: ['images'], properties: { images: { type: 'array' } } },
                },
            },
            validationContext: {
                sceneSource: {
                    sourceText,
                    sourceHash,
                    content: sourceText,
                    numberedContent: sourceText,
                    points: [{ number: 1, offset: sourceText.length }],
                },
                effectiveMaxImages: 1,
                maxPlanImages: 1,
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

test('NovelAI Draw Run accepts the empty API base used for the official image endpoint', () => {
    const envelope = createEnvelope('run-test-novel-official', {
        imageProvider: 'novelai',
        generationRecipe: {
            apiBaseUrl: '',
            apiKey: 'novel-secret',
            insecureTLS: false,
            timeout: 60_000,
            requestDelay: { min: 15_000, max: 30_000 },
            overrideSize: 'default',
            resolveForBackend: true,
            params: {},
            positivePrefix: '',
            negativePrefix: '',
            knownCharacters: [],
            autoLearnEnabled: false,
            autoLearnMode: 'new_only',
            seeds: [1],
        },
    });
    assert.doesNotThrow(() => createEnvelopeValidator(drawRuntime)(envelope));
});

test('Draw Run accepts unspecified browser limits but rejects zero image delay before Planner execution', () => {
    const validate = createEnvelopeValidator(drawRuntime);
    const envelope = createEnvelope('run-test-default-limits');
    envelope.planner.validationContext.effectiveMaxImages = 0;
    envelope.planner.validationContext.effectiveMaxCharactersPerImage = 0;
    assert.doesNotThrow(() => validate(envelope));

    envelope.generationRecipe.delayMs = 0;
    assert.throws(() => validate(envelope), /generationRecipe\.delayMs must round to an integer/);
    envelope.generationRecipe.delayMs = 0.4;
    assert.throws(() => validate(envelope), /generationRecipe\.delayMs must round to an integer/);
    envelope.generationRecipe.delayMs = 0x80000000;
    assert.throws(() => validate(envelope), /generationRecipe\.delayMs must round to an integer/);
});

test('NovelAI V5 character limits are enforced at the Draw Run envelope boundary', () => {
    const validate = createEnvelopeValidator(drawRuntime);
    const envelope = createEnvelope('run-test-novel-v5-limit', {
        imageProvider: 'novelai',
        generationRecipe: {
            apiBaseUrl: '',
            apiKey: 'novel-secret',
            insecureTLS: false,
            timeout: 60_000,
            requestDelay: { min: 15_000, max: 30_000 },
            overrideSize: 'default',
            resolveForBackend: true,
            params: { model: 'nai-diffusion-5-full' },
            positivePrefix: '',
            negativePrefix: '',
            knownCharacters: [],
            autoLearnEnabled: false,
            autoLearnMode: 'new_only',
            seeds: [1],
        },
    });

    envelope.planner.validationContext.effectiveMaxCharactersPerImage = 22;
    assert.doesNotThrow(() => validate(envelope));
    envelope.planner.validationContext.effectiveMaxCharactersPerImage = 23;
    assert.throws(() => validate(envelope), /must be between 1 and 22/);
    envelope.planner.validationContext.effectiveMaxCharactersPerImage = 0;
    assert.throws(() => validate(envelope), /must be between 1 and 22/);
});

function createManager({
    runtime = createRuntime(),
    imageJobService = createImageJobService(),
    createHostClient = () => { throw new Error('host client must not be created for a direct channel'); },
    managerOptions = {},
} = {}) {
    return {
        manager: createDrawRunManager({
            runtime,
            agentCore: { createAgentAdapter() {} },
            envelopeValidator: createEnvelopeValidator(drawRuntime),
            imageJobService,
            createHostClient,
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

test('one backend runtime forwards changing browser planning schemas and executes the same images', async (t) => {
    const { createSubmitScenePlanTool } = await import('../../../modules/draw/shared/scene-plan-tool.js');
    const images = [{
        insert_after: 1, scene: 'rain',
        characterPrompts: [{ prompt: 'must not override the parsed characters' }],
        negative: 'must not override the recipe',
        characters: [{ name: '旅人', type: '女孩', appear: 'black hair', uc: null, nickname: 'ignored' }],
    }];
    const variants = [
        { mindful_prelude: { user_insight: '雨夜', visual_plan: '画旅人。' } },
        { planning_notes: ['another planning format'], review: { done: true } },
        {},
    ];
    const seenTools = [];
    const { manager, imageJobService } = createManager({
        runtime: drawRuntime,
        managerOptions: {
            agentCore: {
                createAgentAdapter() {
                    return {
                        async chat(task) {
                            seenTools.push(structuredClone(task.tools[0]));
                            return { toolCalls: [{
                                name: 'submit_scene_plan',
                                arguments: JSON.stringify({ ...variants[seenTools.length - 1], images }),
                            }] };
                        },
                    };
                },
            },
        },
    });
    t.after(() => manager.close());
    for (const [index, notes] of variants.entries()) {
        const envelope = createEnvelope(`run-notes-${index}`);
        const tool = createSubmitScenePlanTool({ maxImages: 1, insertPointCount: 1, centerMode: 'normalized' });
        if (index > 0) {
            delete tool.function.parameters.properties.mindful_prelude;
            tool.function.parameters.required = ['images', ...Object.keys(notes)];
            for (const [name, value] of Object.entries(notes)) {
                tool.function.parameters.properties[name] = Array.isArray(value)
                    ? { type: 'array', items: { type: 'string' } }
                    : { type: 'object', properties: { done: { type: 'boolean' } } };
            }
        }
        envelope.planner.tool = tool;
        manager.create('alice', envelope, {});
        const terminal = await waitFor(() => {
            const run = manager.get('alice', envelope.runId);
            return ['dispatched', 'failed'].includes(run?.state) ? run : null;
        });
        assert.equal(terminal.state, 'dispatched', JSON.stringify(terminal.error));
        assert.deepEqual(seenTools[index], tool);
        const job = imageJobService.get('alice', terminal.childJobId);
        assert.equal(job.body.items[0].request.payload.prompt, 'rain, 女孩, black hair');
        assert.equal(job.body.items[0].request.payload.negative_prompt, '');
        assert.equal(terminal.handoffManifest.items[0].imgId, `img-draw-${envelope.runId}-1`);
        assert.equal(terminal.handoffManifest.items[0].insertOffset, 6);
    }
    assert.equal(seenTools.length, variants.length);
});

test('a permissive supplied schema cannot bypass image placement validation or its diagnostic', async (t) => {
    let calls = 0;
    const fullModelNote = 'retain in failure diagnostics '.repeat(1000);
    const { manager, imageJobService } = createManager({
        runtime: drawRuntime,
        managerOptions: {
            agentCore: {
                createAgentAdapter() {
                    return {
                        async chat() {
                            calls += 1;
                            return { toolCalls: [{ name: 'submit_scene_plan', arguments: JSON.stringify({
                                planning_notes: { custom: fullModelNote },
                                images: [{ index: 1, insert_after: 42, scene: 'rain', characters: [] }],
                            }) }] };
                        },
                    };
                },
            },
        },
    });
    t.after(() => manager.close());
    manager.create('alice', createEnvelope('run-invalid-image'), {});
    const failed = await waitFor(() => {
        const run = manager.get('alice', 'run-invalid-image');
        return run?.state === 'failed' ? run : null;
    });
    assert.equal(failed.error.code, 'INSERT_POINT_INVALID');
    assert.equal(imageJobService.jobs.size, 0);
    assert.equal(calls, 2);
    const output = JSON.parse(failed.progress.validationFailures[0].modelOutput);
    assert.equal(JSON.parse(output.toolCalls[0].arguments).planning_notes.custom, fullModelNote);
    assert.equal(failed.progress.validationFailures[0].modelOutputTruncated, false);
    assert.equal(failed.progress.attempts.length, 2);
    assert.ok(failed.progress.attempts.every(attempt => attempt.durationMs >= 0));
    assert.equal(failed.progress.model, 'test-model');
});

test('Draw Run delivers unordered and shared placements as distinct images without a correction round', async (t) => {
    let calls = 0;
    const { manager } = createManager({
        runtime: drawRuntime,
        managerOptions: {
            agentCore: {
                createAgentAdapter: () => ({
                    async chat() {
                        calls += 1;
                        return { toolCalls: [{ name: 'submit_scene_plan', arguments: JSON.stringify({
                            images: [2, 1, 2].map((point, index) => ({
                                insert_after: point, scene: `image-${index}`, characters: [],
                            })),
                        }) }] };
                    },
                }),
            },
        },
    });
    t.after(() => manager.close());
    const envelope = createEnvelope('run-shared-placement');
    const sourceText = 'Hello.World.';
    envelope.sourceHash = drawRuntime.hashSceneSource(sourceText);
    Object.assign(envelope.planner.validationContext, {
        effectiveMaxImages: 3,
        maxPlanImages: 3,
        sceneSource: {
            sourceText, sourceHash: envelope.sourceHash, content: sourceText, numberedContent: sourceText,
            points: [{ number: 1, offset: 6 }, { number: 2, offset: 12 }],
        },
    });
    manager.create('alice', envelope, {});
    const run = await waitFor(() => {
        const current = manager.get('alice', envelope.runId);
        return ['dispatched', 'failed'].includes(current?.state) ? current : null;
    });
    assert.equal(run.state, 'dispatched', run.error?.message);
    assert.equal(calls, 1);
    assert.deepEqual(run.handoffManifest.items.map(item => item.insertOffset), [12, 6, 12]);
    assert.equal(new Set(run.handoffManifest.items.map(item => item.imgId)).size, 3);
});

test('Draw Run admits only a data-only submit_scene_plan tool with an images array', () => {
    const validate = createEnvelopeValidator(drawRuntime);
    for (const mutate of [
        envelope => { delete envelope.planner.tool; },
        envelope => { envelope.planner.tool.function.name = 'run_shell'; },
        envelope => { delete envelope.planner.tool.function.parameters.properties.images; },
        envelope => { envelope.planner.tool.function.parameters.required = []; },
        envelope => { envelope.planner.tool.function.parameters.properties.images.type = 'string'; },
        envelope => { envelope.planner.tool.function.parameters.properties.other = JSON.parse('{"__proto__":{}}'); },
    ]) {
        const envelope = createEnvelope('run-invalid-tool');
        mutate(envelope);
        assert.throws(() => validate(envelope), error => error.status === 400);
    }
    const original = createEnvelope('run-tool-copy');
    const admitted = validate(original).envelope;
    original.planner.tool.function.description = 'mutated after admission';
    assert.equal(admitted.planner.tool.function.description, 'Submit the image tasks.');
});

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

test('a later floor can dispatch images while an earlier floor is still planning', async (t) => {
    let releaseEarlierPlanner;
    const plannerStarts = [];
    const runtime = createRuntime({
        async executePreparedScenePlanner(prepared) {
            const label = prepared.planner.prompt.systemPrompt;
            plannerStarts.push(label);
            if (label === 'earlier') {
                await new Promise(resolve => { releaseEarlierPlanner = resolve; });
            }
            return [{ scene: label, chars: [], placement: { insertAfter: 1 } }];
        },
    });
    const { manager, imageJobService } = createManager({ runtime });
    t.after(() => manager.close());

    const earlier = createEnvelope('run-earlier-floor');
    earlier.planner.prompt.systemPrompt = 'earlier';
    const later = createEnvelope('run-later-floor');
    later.planner.prompt.systemPrompt = 'later';

    manager.create('alice', earlier, {});
    manager.create('alice', later, {});

    const laterDispatched = await waitFor(() => {
        const run = manager.get('alice', later.runId);
        return run?.state === 'dispatched' ? run : null;
    });
    assert.deepEqual(plannerStarts, ['earlier', 'later']);
    assert.equal(manager.get('alice', earlier.runId).state, 'planning');
    assert.equal(laterDispatched.childJobId, `draw-run:${later.runId}`);
    assert.ok(imageJobService.get('alice', `draw-run:${later.runId}`));
    assert.equal(imageJobService.get('alice', `draw-run:${earlier.runId}`), null);

    releaseEarlierPlanner();
    await waitFor(() => manager.get('alice', earlier.runId)?.state === 'dispatched');
});

test('Draw Run exposes bounded Planner validation diagnostics to its owner', async (t) => {
    const validationFailure = {
        attempt: 1,
        errorCode: 'TOOL_ARGUMENTS_SCHEMA_INVALID',
        errorMessage: 'images[0].characters must be an array',
        errorPath: 'images[0].characters',
        errorRule: 'must be an array',
        received: 'none',
        expected: [],
        modelOutput: '{"toolCalls":[{"name":"submit_scene_plan","arguments":"bad"}]}',
        modelOutputTruncated: false,
    };
    const runtime = createRuntime({
        async executePreparedScenePlanner(_prepared, { diagnostic }) {
            diagnostic.update({
                stage: 'correction',
                attemptCount: 1,
                progress: { total: 3 },
                validationFailures: [validationFailure],
            });
            return [{ scene: 'portrait', chars: [], placement: { insertAfter: 1 } }];
        },
    });
    const { manager } = createManager({ runtime });
    t.after(() => manager.close());

    manager.create('alice', createEnvelope('run-diagnostic'), {});
    const dispatched = await waitFor(() => {
        const run = manager.get('alice', 'run-diagnostic');
        return run?.state === 'dispatched' ? run : null;
    });

    assert.deepEqual(dispatched.progress.validationFailures, [validationFailure]);
});

test('pre-child cancellation aborts planning, disposes hosted credentials, and creates no image job', async (t) => {
    let planningStarted;
    const started = new Promise(resolve => { planningStarted = resolve; });
    let disposed = false;
    const runtime = createRuntime({
        async executePreparedScenePlanner(_prepared, { signal }) {
            planningStarted();
            await new Promise((resolve, reject) => {
                signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { code: 'REQUEST_ABORTED' })), { once: true });
            });
        },
    });
    const { manager, imageJobService } = createManager({
        runtime,
        createHostClient: () => ({
            client: {},
            dispose() { disposed = true; },
        }),
    });
    t.after(() => manager.close());
    const envelope = createEnvelope('run-test-002');
    envelope.agent.channel = 'sillytavern-openai-compatible';
    envelope.agent.providerConfig.provider = 'sillytavern-openai-compatible';
    envelope.agent.providerConfig.apiKey = 'cancelled-proxy-password';
    manager.create('alice', envelope, {});
    await started;

    assert.equal(manager.cancel('alice', 'run-test-002').state, 'cancelling');
    const cancelled = await waitFor(() => manager.get('alice', 'run-test-002')?.state === 'cancelled');
    assert.equal(cancelled, true);
    assert.equal(disposed, true);
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

test('retained compiler failures redact the image provider credentials still owned by that phase', async (t) => {
    let disposed = false;
    const runtime = createRuntime({
        compileDrawRunImages() {
            throw new Error('image-secret, pa%24%24word, and pa$$word must not escape');
        },
    });
    const { manager } = createManager({
        runtime,
        createHostClient: () => ({
            client: {},
            dispose() { disposed = true; },
        }),
    });
    t.after(() => manager.close());
    const envelope = createEnvelope('run-test-004');
    envelope.agent.channel = 'sillytavern-openai-compatible';
    envelope.agent.providerConfig.provider = 'sillytavern-openai-compatible';
    envelope.generationRecipe.host = 'https://user:pa%24%24word@sd.example.test';
    manager.create('alice', envelope, {});
    const failed = await waitFor(() => {
        const run = manager.get('alice', 'run-test-004');
        return run?.state === 'failed' ? run : null;
    });

    assert.equal(disposed, true);
    assert.match(failed.error.message, /\[redacted\]/);
    assert.doesNotMatch(JSON.stringify(failed), /image-secret|pa%24%24word|pa\$\$word/);
});

test('hosted Agent proxy passwords remain available only for the request-scoped Planner', async (t) => {
    const envelope = createEnvelope('run-test-005');
    envelope.agent.channel = 'sillytavern-openai-compatible';
    envelope.agent.providerConfig.provider = 'sillytavern-openai-compatible';
    envelope.agent.providerConfig.apiKey = 'proxy-password';
    const hostClient = { name: 'request-scoped-host-client' };
    let plannerApiKey = null;
    let plannerHostClient = null;
    let disposed = false;
    const runtime = createRuntime({
        async executePreparedScenePlanner(prepared, options) {
            plannerApiKey = prepared.agent.providerConfig.apiKey;
            plannerHostClient = options.hostClient;
            return [{ scene: 'portrait', chars: [], placement: { insertAfter: 1 } }];
        },
    });
    const { manager } = createManager({
        runtime,
        createHostClient: () => ({
            client: hostClient,
            dispose() { disposed = true; },
        }),
    });
    t.after(() => manager.close());

    manager.create('alice', envelope, {});
    const dispatched = await waitFor(() => {
        const run = manager.get('alice', 'run-test-005');
        return run?.state === 'dispatched' ? run : null;
    });

    assert.equal(plannerApiKey, 'proxy-password');
    assert.equal(plannerHostClient, hostClient);
    assert.equal(disposed, true);
    assert.doesNotMatch(JSON.stringify(dispatched), /proxy-password/);
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
    await waitFor(() => manager.get('alice', 'run-test-007') === null);

    assert.equal(manager.get('alice', 'run-test-007'), null);
});
