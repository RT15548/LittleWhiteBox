import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { PROVIDER_OPTIONS, resolveActiveProviderConfig } from '../../../agent-core/provider-resolution.js';
import { prepareScenePlannerInput } from '../scene-planner.js';
import { createScenePlannerEnvelope } from '../draw-run-coordinator.js';
import { submitProviderDrawRun } from '../draw-run-production.js';

const require = createRequire(import.meta.url);
const runtime = require('../../../../server-plugin/littlewhitebox-server/draw-runs/vendor/draw-run-runtime.cjs');
const { createEnvelopeValidator } = require('../../../../server-plugin/littlewhitebox-server/draw-runs/envelope.js');
const validate = createEnvelopeValidator(runtime);
const source = 'A character stands beside the sea.';

async function preparedFor(provider, sampling = {}) {
    const providerConfig = resolveActiveProviderConfig({ provider, modelConfigs: {
        [provider]: { model: 'offline-model', baseUrl: 'https://model.invalid', apiKey: 'offline-fixture', sampling },
    } });
    assert.equal(providerConfig.provider, provider);
    assert.equal(providerConfig.model, 'offline-model');
    return prepareScenePlannerInput({
        messageText: source, maxImages: 1, maxPlanImages: 1, maxCharactersPerImage: 1,
        agentOptions: { providerConfig }, expansionOptions: { runtime: {} },
    });
}

function recipeFor(provider) {
    const common = { timeout: 5000, knownCharacters: [], positivePrefix: '', negativePrefix: '' };
    if (provider === 'novelai') return { ...common,
        apiBaseUrl: '', apiKey: 'offline-fixture', insecureTLS: false,
        requestDelay: { min: 1000, max: 1000 }, overrideSize: '', resolveForBackend: true,
        params: { model: 'nai-diffusion-4-full' }, autoLearnEnabled: false, autoLearnMode: 'new_only', seeds: [1],
    };
    const local = { ...common, host: 'http://127.0.0.1:9999', auth: '', delayMs: 1000,
        params: {}, promptOverride: '', negativePromptOverride: '' };
    if (provider === 'sd-webui') return local;
    return { ...local, workflowMode: 'simple', seeds: [1], customWorkflow: {
        json: '', nodePositive: '', nodeNegative: '', nodeWidth: '', nodeHeight: '', nodeSeed: '', nodeSaveImage: '',
    } };
}

function envelopeFor(prepared, imageProvider = 'novelai') {
    return createScenePlannerEnvelope({ runId: 'run-contract-fixture', imageProvider, prepared,
        generationRecipe: recipeFor(imageProvider) });
}

// Exercise real config resolution and planner preparation against the unchanged server validator.
// Hand-written provider configs previously missed new settings leaking into the Draw Run protocol.
for (const imageProvider of ['novelai', 'sd-webui', 'comfyui']) {
    test(`${imageProvider}: every Agent route submits supported fields without changing model settings`, async t => {
        for (const { value: provider } of PROVIDER_OPTIONS) await t.test(provider, async () => {
            for (const sampling of [{}, { topP: { enabled: false, value: 0.83 } }, { topP: { enabled: true, value: 0.83 } }]) {
                const prepared = await preparedFor(provider, sampling);
                const original = structuredClone(prepared);
                const envelope = envelopeFor(prepared, imageProvider);
                assert.equal(Object.hasOwn(envelope.agent.providerConfig, 'sampling'), false);
                assert.equal(Object.hasOwn(envelope.agent.providerConfig, 'modelListAuth'), false);
                assert.doesNotThrow(() => validate(envelope));
                for (const key of ['provider', 'baseUrl', 'model', 'apiKey', 'temperature', 'sendTemperature',
                    'maxTokens', 'timeoutMs', 'toolMode', 'reasoning']) {
                    assert.deepEqual(envelope.agent.providerConfig[key], prepared.agent.providerConfig[key]);
                }
                assert.deepEqual(prepared, original, 'drawing must not change settings used by other Agent callers');
            }
        });
    });
}

test('background drawing submits with existing capabilities even when the model preset enables sampling', async t => {
    // The installed 3.0.0 server contract needs no new capability or version requirement.
    const status = { ready: true, version: '3.0.0', capabilities: [
        'draw-runs-v1', 'draw-run-runtime-v4', 'draw-work-cancellation-v1', 'draw-run-planner-retry-v1',
    ] };
    for (const provider of ['openai-compatible', 'anthropic']) await t.test(provider, async () => {
        const prepared = await preparedFor(provider, { topP: { enabled: true, value: 0.83 } });
        const original = structuredClone(prepared);
        const message = { mes: source, swipe_id: 0 };
        const ctx = { chatId: 'offline-chat', chat: [message] };
        let submissions = 0;
        const result = await submitProviderDrawRun({
            ctx, message, messageId: 0, provider: 'novelai', getCurrentContext: () => ctx,
            pendingJobsLoader: async () => [], statusLoader: async () => status,
            preparePlanner: async () => prepared, createGenerationRecipe: () => recipeFor('novelai'),
            submit: async input => {
                submissions += 1;
                const envelope = envelopeFor(input.prepared, input.imageProvider);
                validate(envelope);
                return { status: 'accepted', runId: envelope.runId };
            },
        });
        assert.equal(result.status, 'accepted');
        assert.equal(submissions, 1);
        assert.deepEqual(prepared, original);
    });
});

test('removing drawing-only unsupported settings does not hide an invalid required model field', async () => {
    const prepared = await preparedFor('anthropic');
    prepared.agent.providerConfig.model = '';
    assert.throws(() => validate(envelopeFor(prepared)), { status: 400, code: 'invalid_draw_run' });
});
