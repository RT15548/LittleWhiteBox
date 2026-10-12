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

test('Draw Run knownCharacters cap counts only effectively enabled characters: a closed group frees its share of the 500', async () => {
    const { selectEnabledCharacters, setGroupEnabled } = await import('../../../modules/draw/shared/character-library.js');
    const validate = createEnvelopeValidator(drawRuntime);
    const characters = Array.from({ length: 700 }, (_, index) => ({
        id: `c${index}`, name: `角色${index}`, enabled: true, type: 'girl', appearance: 'x', ...(index < 300 ? { groupId: 'big' } : {}),
    }));
    const library = { characters, groups: [{ id: 'big', name: '大组' }] };
    const envelopeWith = (library_) => {
        const envelope = createEnvelope('run-known-cap');
        envelope.generationRecipe.knownCharacters = selectEnabledCharacters(library_);
        return envelope;
    };
    // 700 个全开：发给后台会超过上限，被服务端拒绝
    assert.throws(() => validate(envelopeWith(library)), /knownCharacters must be an array with at most 500 entries/);
    // 关闭 300 人的分组后只发 400 个：通过，且角色自己的 enabled 没被动过
    const closed = setGroupEnabled(library, 'big', false);
    assert.equal(selectEnabledCharacters(closed).length, 400);
    assert.doesNotThrow(() => validate(envelopeWith(closed)));
    assert.ok(closed.characters.every(character => character.enabled === true));
    // 再开启后恢复为 700
    assert.equal(selectEnabledCharacters(setGroupEnabled(closed, 'big', true)).length, 700);
});

test('Draw Run accepts a frozen planner.retry and still rejects malformed or unknown planner keys', () => {
    const validate = createEnvelopeValidator(drawRuntime);
    const withRetry = createEnvelope('run-retry');
    withRetry.planner.retry = { maxRetries: 3, baseDelayMs: 2000 };
    const accepted = validate(withRetry);
    assert.deepEqual(accepted.envelope.planner.retry, { maxRetries: 3, baseDelayMs: 2000 });
    assert.doesNotThrow(() => validate(createEnvelope('run-no-retry')));
    assert.equal(Object.hasOwn(validate(createEnvelope('run-no-retry')).envelope.planner, 'retry'), false);

    for (const retry of [
        { maxRetries: 11, baseDelayMs: 2000 },
        { maxRetries: -1, baseDelayMs: 2000 },
        { maxRetries: 1.5, baseDelayMs: 2000 },
        { maxRetries: 3, baseDelayMs: 50 },
        { maxRetries: 3, baseDelayMs: 60_000 },
        { maxRetries: 3 },
        { maxRetries: 3, baseDelayMs: 2000, extra: true },
        'three',
        null,
    ]) {
        const envelope = createEnvelope('run-bad-retry');
        envelope.planner.retry = retry;
        assert.throws(() => validate(envelope), /planner\.retry/, JSON.stringify(retry));
    }
    const unknown = createEnvelope('run-unknown-key');
    unknown.planner.unexpected = 1;
    assert.throws(() => validate(unknown), /planner\.unexpected is not allowed/);
});

test('Draw Run permits absent or empty Agent keys without relaxing key type or model validation', () => {
    const validate = createEnvelopeValidator(drawRuntime);
    for (const apiKey of [undefined, '', '   ']) {
        const envelope = createEnvelope('run-no-agent-key');
        if (apiKey === undefined) delete envelope.agent.providerConfig.apiKey;
        else envelope.agent.providerConfig.apiKey = apiKey;
        assert.doesNotThrow(() => validate(envelope));
    }
    for (const patch of [{ apiKey: 42 }, { model: '' }]) {
        const envelope = createEnvelope('run-invalid-agent');
        Object.assign(envelope.agent.providerConfig, patch);
        assert.throws(() => validate(envelope), error => error.status === 400);
    }
});

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
        {},
        { planning_notes: ['another planning format'], review: { done: true } },
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
        tool.function.parameters.required = ['images', ...Object.keys(notes)];
        for (const [name, value] of Object.entries(notes)) {
            tool.function.parameters.properties[name] = Array.isArray(value)
                ? { type: 'array', items: { type: 'string' } }
                : { type: 'object', properties: { done: { type: 'boolean' } } };
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

test('backend dispatches repaired complete plans and keeps incomplete or invalid plans out of image jobs', async (t) => {
    const valid = JSON.stringify({ images: [{ insert_after: 1, scene: 'rain', characters: [] }] });
    const cases = [
        [valid.slice(0, -1), 'missing_root_closer'],
        [valid + '}]', 'trailing_closers'],
        [valid.slice(0, -2), null, 'TOOL_ARGUMENTS_INVALID_JSON'],
        [valid.replace('"insert_after":1', '"insert_after":99') + '}', null, 'INSERT_POINT_INVALID'],
    ];
    for (const [index, [rawArguments, kind, errorCode]] of cases.entries()) {
        let calls = 0;
        const { manager, imageJobService } = createManager({
            runtime: drawRuntime,
            managerOptions: {
                agentCore: {
                    createAgentAdapter: () => ({
                        async chat() {
                            calls += 1;
                            return { toolCalls: [{ name: 'submit_scene_plan', arguments: rawArguments }] };
                        },
                    }),
                },
            },
        });
        t.after(() => manager.close());
        const envelope = createEnvelope(`run-shell-repair-${index}`);
        manager.create('alice', envelope, {});
        const terminal = await waitFor(() => {
            const run = manager.get('alice', envelope.runId);
            return ['dispatched', 'failed'].includes(run?.state) ? run : null;
        });
        if (kind) {
            assert.equal(terminal.state, 'dispatched', JSON.stringify(terminal.error));
            assert.equal(calls, 1);
            assert.equal(terminal.progress.argumentRepair.kind, kind);
            assert.equal(terminal.progress.argumentRepair.originalArguments, rawArguments);
            assert.deepEqual(terminal.progress.validationFailures, []);
            const job = imageJobService.get('alice', terminal.childJobId);
            assert.equal(job.body.items.length, 1);
            assert.equal(job.body.items[0].request.payload.prompt, 'rain');
        } else {
            assert.equal(terminal.state, 'failed');
            assert.equal(terminal.error.code, errorCode);
            assert.equal(calls, 2);
            assert.equal(imageJobService.jobs.size, 0);
            assert.equal(Object.hasOwn(terminal.progress, 'argumentRepair'), false);
            assert.equal(JSON.parse(terminal.progress.validationFailures[0].modelOutput).toolCalls[0].arguments, rawArguments);
        }
    }
});

test('backend retries a failed Agent request using the frozen planner.retry and never retries without it', async (t) => {
    const valid = JSON.stringify({ images: [{ insert_after: 1, scene: 'rain', characters: [] }] });
    const cases = [
        // [名称, 冻结的 retry, 前几次失败, 期望终态, 期望调用次数]
        ['recovers', { maxRetries: 3, baseDelayMs: 100 }, 2, 'dispatched', 3],
        ['exhausted', { maxRetries: 2, baseDelayMs: 100 }, 99, 'failed', 3],
        ['no-retry-field', undefined, 1, 'failed', 1],
        ['zero-retries', { maxRetries: 0, baseDelayMs: 100 }, 1, 'failed', 1],
    ];
    for (const [name, retry, failures, expectedState, expectedCalls] of cases) {
        let calls = 0;
        const { manager } = createManager({
            runtime: drawRuntime,
            managerOptions: {
                agentCore: {
                    createAgentAdapter: () => ({
                        async chat() {
                            calls += 1;
                            if (calls <= failures) throw new Error('fetch failed');
                            return { toolCalls: [{ name: 'submit_scene_plan', arguments: valid }] };
                        },
                    }),
                },
            },
        });
        t.after(() => manager.close());
        const envelope = createEnvelope(`run-agent-retry-${name}`);
        if (retry) envelope.planner.retry = retry;
        manager.create('alice', envelope, {});
        const terminal = await waitFor(() => {
            const run = manager.get('alice', envelope.runId);
            return ['dispatched', 'failed'].includes(run?.state) ? run : null;
        }, 5000);
        assert.equal(terminal.state, expectedState, `${name}: ${JSON.stringify(terminal.error)}`);
        assert.equal(calls, expectedCalls, name);
        if (expectedState === 'failed') assert.equal(terminal.error.code, 'PROVIDER_REQUEST_FAILED', name);
    }
});

test('backend exposes which retry is running and keeps the failed attempts of earlier rounds', async (t) => {
    const valid = JSON.stringify({ images: [{ insert_after: 1, scene: 'rain', characters: [] }] });
    let calls = 0;
    const { manager } = createManager({
        runtime: drawRuntime,
        managerOptions: {
            agentCore: {
                createAgentAdapter: () => ({
                    async chat() {
                        calls += 1;
                        if (calls <= 2) throw new Error('fetch failed');
                        return { toolCalls: [{ name: 'submit_scene_plan', arguments: valid }] };
                    },
                }),
            },
        },
    });
    t.after(() => manager.close());
    const envelope = createEnvelope('run-retry-progress');
    envelope.planner.retry = { maxRetries: 3, baseDelayMs: 100 };
    manager.create('alice', envelope, {});
    const seen = [];
    await waitFor(() => {
        const run = manager.get('alice', envelope.runId);
        seen.push(structuredClone(run.progress));
        return ['dispatched', 'failed'].includes(run.state);
    }, 5000);
    const retrying = seen.filter(progress => progress.stage === 'retry');
    assert.deepEqual([...new Set(retrying.map(progress => JSON.stringify(progress.retry)))],
        [JSON.stringify({ current: 1, total: 3 }), JSON.stringify({ current: 2, total: 3 })]);
    // 重试等待阶段的 total 是“最多重试几次”，不能冒充 Agent 的尝试上限。
    assert.ok(retrying.every(progress => progress.maxAttempts === 3));
    const last = seen.at(-1);
    assert.equal(Object.hasOwn(last, 'retry'), false, '重试结束后不再带 retry');
    // 前两轮失败的尝试记录没有被后续轮次覆盖。
    assert.deepEqual(last.attempts.map(item => item.attempt), [1, 2, 3]);
    assert.deepEqual(last.attempts.map(item => Boolean(item.errorCode)), [true, true, false]);
});

test('active backend retry remains a retry in the frontend projection', async t => {
    const { getDrawRunProgressPhase } = await import('../../../modules/draw/shared/draw-run-ui-state.js');
    let release;
    const held = new Promise(resolve => { release = resolve; });
    let calls = 0;
    const { manager } = createManager({ runtime: drawRuntime, managerOptions: {
        agentCore: { createAgentAdapter: () => ({ async chat() {
            calls += 1;
            if (calls === 1) throw new Error('fetch failed');
            await held;
            return { toolCalls: [{ name: 'submit_scene_plan', arguments: JSON.stringify({ images: [
                { insert_after: 1, scene: 'rain', characters: [] },
            ] }) }] };
        } }) },
    } });
    t.after(() => { release(); manager.close(); });
    const envelope = createEnvelope('active-retry');
    envelope.planner.retry = { maxRetries: 3, baseDelayMs: 100 };
    manager.create('alice', envelope, {});
    await waitFor(() => calls === 2, 5000);
    const run = manager.get('alice', envelope.runId);
    assert.deepEqual(run.progress.retry, { current: 1, total: 3 });
    assert.equal(getDrawRunProgressPhase({ run }), 'retry');
});

test('backend dispatches a decorated tagged plan once and retains ambiguous-call diagnostics without dispatch', async (t) => {
    const agentCore = require('../draw-runs/vendor/agent-core-node.cjs');
    t.mock.method(console, 'log', () => {});
    const payload = JSON.stringify({ name: 'submit_scene_plan', arguments: {
        images: [{ insert_after: 1, scene: 'book cover, title: SUMMER', characters: [] }],
    } });
    const cases = [
        { body: `\`\`\`json\n${payload}\n\`\`\`\n</unexpected>[完成]<status value="[done]"/> "完成"` },
        { body: `${payload}}\n</｜｜DSML｜｜ parameter> ]\n[2 张已完成]` },
        { body: `${payload},\n${payload}`, ambiguous: true },
        { body: `${payload} "完成`, ambiguous: true },
        { body: `${payload.slice(0, -1)},"images":[]}}`, ambiguous: true },
    ];
    for (const [index, { body, ambiguous }] of cases.entries()) {
        const content = `<tool_call>${body}</tool_call>`;
        let calls = 0;
        const { manager, imageJobService } = createManager({
            runtime: drawRuntime,
            managerOptions: {
                agentCore: {
                    createAgentAdapter(config) {
                        const adapter = agentCore.createAgentAdapter(config);
                        adapter.client.chat.completions.create = async () => {
                            calls += 1;
                            return { choices: [{ message: { role: 'assistant', content }, finish_reason: 'stop' }] };
                        };
                        return adapter;
                    },
                },
            },
        });
        t.after(() => manager.close());
        const envelope = createEnvelope(`run-tagged-decoration-${index}`);
        envelope.agent.providerConfig.toolMode = 'tagged-json';
        manager.create('alice', envelope, {});
        const terminal = await waitFor(() => {
            const run = manager.get('alice', envelope.runId);
            return ['dispatched', 'failed'].includes(run?.state) ? run : null;
        });
        assert.equal(calls, 1);
        assert.deepEqual(terminal.progress.validationFailures, []);
        if (ambiguous) {
            assert.equal(terminal.state, 'failed');
            assert.equal(terminal.error.code, 'TAGGED_TOOL_CALL_INVALID');
            assert.equal(terminal.progress.attempts[0].rawAssistantMessage.content, content);
            assert.equal(imageJobService.jobs.size, 0);
        } else {
            assert.equal(terminal.state, 'dispatched');
            const job = imageJobService.get('alice', terminal.childJobId);
            assert.equal(job.body.items.length, 1);
            assert.equal(job.body.items[0].request.payload.prompt, 'book cover, title: SUMMER');
        }
    }
});

test('backend DSML failures retain protocol classification and deliver redacted originals to F12 once', async (t) => {
    const agentCore = require('../draw-runs/vendor/agent-core-node.cjs');
    const { logDrawRunPlannerDiagnostics } = await import('../../../modules/draw/shared/draw-run-debug.js');
    const logs = [];
    t.mock.method(console, 'log', (_label, details) => logs.push(details));
    const message = {
        role: 'assistant',
        content: 'Planning. <｜DSML｜function_calls><｜DSML｜invoke name="submit_scene_plan">'
            + '<｜DSML｜parameter name="images" string="false">[]',
        api_key: 'response-secret',
    };
    let calls = 0;
    const { manager, imageJobService } = createManager({
        runtime: drawRuntime,
        managerOptions: {
            agentCore: {
                createAgentAdapter(config) {
                    const adapter = agentCore.createAgentAdapter(config);
                    adapter.client.chat.completions.create = async () => {
                        calls += 1;
                        return { choices: [{ message, finish_reason: 'stop' }] };
                    };
                    return adapter;
                },
            },
        },
    });
    t.after(() => manager.close());
    const envelope = createEnvelope('run-dsml-diagnostic');
    envelope.agent.providerConfig.toolMode = 'tagged-json';
    manager.create('alice', envelope, {});
    const terminal = await waitFor(() => {
        const run = manager.get('alice', envelope.runId);
        return ['dispatched', 'failed'].includes(run?.state) ? run : null;
    });
    assert.equal(terminal.state, 'failed');
    assert.equal(terminal.error.code, 'DSML_TOOL_CALL_INVALID');
    assert.equal(calls, 1);
    assert.equal(imageJobService.jobs.size, 0);
    assert.deepEqual(terminal.progress.validationFailures, []);
    const [attempt] = terminal.progress.attempts;
    assert.equal(attempt.errorCode, terminal.error.code);
    assert.deepEqual(attempt.rawAssistantMessage, { ...message, api_key: '[redacted]' });
    const entries = [];
    const logger = { log: (_label, details) => entries.push(details) };
    logDrawRunPlannerDiagnostics(terminal, logger);
    logDrawRunPlannerDiagnostics(terminal, logger);
    assert.equal(entries.length, 1);
    assert.equal(entries[0].errorCode, 'DSML_TOOL_CALL_INVALID');
    assert.ok(Number.isInteger(entries[0].errorOffset));
    assert.deepEqual(entries[0].rawAssistantMessage, attempt.rawAssistantMessage);
    assert.deepEqual(logs.find(log => log.rawAssistantMessage).rawAssistantMessage, attempt.rawAssistantMessage);
    assert.doesNotMatch(JSON.stringify({ terminal, entries, logs }), /response-secret|agent-secret|image-secret/);
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
            postPrompt: '',
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

test('ComfyUI handoff preserves the post-prompt as redraw input rather than only flattened output', async (t) => {
    const task = { scene: 'portrait', chars: [], post_prompt: 'night sky', placement: { insertAfter: 1 } };
    const { manager, imageJobService } = createManager({ runtime: createRuntime({
        executePreparedScenePlanner: async () => [task],
        compileDrawRunImages: drawRuntime.compileDrawRunImages,
    }) });
    t.after(() => manager.close());
    const envelope = createEnvelope('run-post-prompt', { imageProvider: 'comfyui' });
    Object.assign(envelope.generationRecipe, {
        workflowMode: 'simple', seeds: [1], params: { model: 'fixture.safetensors' },
        customWorkflow: { json: '', nodePositive: '', nodeNegative: '', nodeWidth: '', nodeHeight: '', nodeSeed: '', nodeSaveImage: '' },
    });
    manager.create('alice', envelope, {});
    const run = await waitFor(() => {
        const current = manager.get('alice', envelope.runId);
        return current.state === 'dispatched' ? current : null;
    });
    const metadata = run.handoffManifest.items[0].displayMetadata;
    assert.equal(metadata.postPrompt, task.post_prompt);
    assert.equal(metadata.positive, 'portrait, night sky');
    const repeated = drawRuntime.compileDrawRunImages('comfyui', [{
        scene: metadata.tags, characterPrompts: metadata.characterPrompts,
        negativePrompt: metadata.negativePrompt, post_prompt: metadata.postPrompt,
    }], envelope.generationRecipe);
    assert.equal(repeated.artifacts[0].promptData.positive, metadata.positive);
    assert.equal(imageJobService.jobs.size, 1);
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
