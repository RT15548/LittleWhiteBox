import assert from 'node:assert/strict';
import test from 'node:test';
import { logScenePlannerValidationFailure } from '../scene-planner-debug.js';
import { generateAndParseScenePlan } from '../scene-planner.js';
import { getLastDrawAgentDiagnostic } from '../draw-agent.js';
import { createAgentAdapter } from '../../../agent-core/provider-config.js';
import { resolveRuntimeReasoning } from '../../../agent-core/reasoning-capabilities.js';
import { setHostChatCompletionsRequestHeadersProvider } from '../../../../shared/host-llm/chat-completions/client.js';

test('F12 diagnostics bypass the real monitor hooks whether monitoring is enabled or disabled', async (t) => {
    const browserConsole = [];
    t.mock.method(console, 'log', (...args) => browserConsole.push(args));
    const { xbLog } = await import('../../../../core/debug-core.js');
    t.after(() => { xbLog.disable(); xbLog.clear(); });
    xbLog.enable();
    for (const enabled of [true, false]) {
        if (!enabled) xbLog.disable();
        logScenePlannerValidationFailure({
            attempt: 1,
            durationMs: 21000,
            errorCode: 'TOOL_ARGUMENTS_INVALID_JSON',
            modelOutput: JSON.stringify({ text: 'full model reply', toolCalls: [{ arguments: '{broken' }] }),
        });
        assert.deepEqual(xbLog.getAll(), []);
    }
    assert.equal(browserConsole.length, 2);
    for (const [prefix, details] of browserConsole) {
        assert.match(prefix, /\[Scene Planner\]/);
        assert.equal(details.llmResult.text, 'full model reply');
        assert.equal(details.llmResult.toolCalls[0].arguments, '{broken');
        assert.equal(details.durationMs, 21000);
    }
});

test('console failures do not affect drawing and old truncated backend diagnostics stay identifiable', () => {
    const entries = [];
    const failure = { modelOutput: '{partial', modelOutputTruncated: true };
    assert.equal(logScenePlannerValidationFailure(failure, {}, { log: (_label, details) => entries.push(details) }), true);
    assert.equal(entries[0].llmResult, '{partial');
    assert.equal(entries[0].llmResultTruncated, true);
    assert.equal(logScenePlannerValidationFailure(failure, {}, { log() { throw new Error('unavailable'); } }), false);
});

test('real JSON-compatible responses remain distinguishable in F12 after argument normalization', async (t) => {
    const entries = [];
    const requests = [];
    let responseMessage;
    t.mock.method(console, 'log', (...args) => entries.push(args));
    t.mock.method(globalThis, 'fetch', async (_url, options) => {
        requests.push(JSON.parse(options.body));
        return new Response(JSON.stringify({
            model: 'compat-test',
            choices: [{ message: responseMessage, finish_reason: 'stop' }],
        }), { headers: { 'Content-Type': 'application/json' } });
    });
    setHostChatCompletionsRequestHeadersProvider(() => ({}));
    t.after(() => setHostChatCompletionsRequestHeadersProvider(null));

    for (const provider of ['openai-compatible', 'sillytavern-openai-compatible']) {
        for (const [label, fields] of [
            ['missing', {}],
            ['null', { arguments: null }],
            ['malformed', { arguments: 'not JSON, but contains actual image tags' }],
            ['empty object', { arguments: {} }],
        ]) {
            await t.test(`${provider}: ${label}`, async () => {
                entries.length = 0;
                requests.length = 0;
                responseMessage = {
                    role: 'assistant',
                    content: 'Planning.\n<tool_call>' + JSON.stringify({
                        name: 'submit_scene_plan', ...fields,
                    }) + '</tool_call>\n' + 'Unparsed trailing content. '.repeat(5000),
                    provider_debug: { api_key: 'response-secret' },
                };
                const config = {
                    provider, model: 'compat-test', toolMode: 'tagged-json',
                    baseUrl: 'https://provider.example/v1', apiKey: 'request-secret',
                    reasoning: resolveRuntimeReasoning({ provider, model: 'compat-test' }, { mode: 'off' }),
                };
                await assert.rejects(generateAndParseScenePlan({
                    messageText: '雨停了。', maxImages: 1,
                    expansionOptions: { runtime: { substituteParams: text => text } },
                    agentOptions: { providerConfig: config },
                    agentCore: { createAgentAdapter },
                    logger: { error() {} },
                }), { code: 'TOOL_ARGUMENTS_SCHEMA_INVALID' });

                const failures = entries.map(([, details]) => details)
                    .filter(details => details.event === 'scene_planner_tool_validation_failed');
                assert.equal(failures.length, 2);
                assert.equal(requests.length, 2);
                for (const failure of failures) {
                    assert.equal(failure.toolMode, 'tagged-json');
                    assert.equal(failure.llmResult.toolCalls[0].arguments, '{}');
                    assert.equal(failure.llmResult.text, 'Planning.');
                    assert.equal(failure.llmResult.providerPayload.openaiCompatibleMessage.content, 'Planning.');
                    assert.deepEqual(failure.llmResult.rawAssistantMessage, {
                        ...responseMessage, provider_debug: { api_key: '[redacted]' },
                    });
                    assert.equal(failure.llmResultTruncated, false);
                }
                const savedDiagnostic = JSON.parse(getLastDrawAgentDiagnostic().validationFailures[0].modelOutput);
                assert.equal(savedDiagnostic.rawAssistantMessage.content, responseMessage.content);
                for (const request of requests) {
                    assert.equal(Object.hasOwn(request, 'captureRawAssistantMessage'), false);
                    assert.equal(Object.hasOwn(request, 'rawAssistantMessage'), false);
                    assert.equal(JSON.stringify(request).includes('Unparsed trailing content.'), false);
                    assert.equal(JSON.stringify(request).includes('response-secret'), false);
                }
            });
        }
    }
});
