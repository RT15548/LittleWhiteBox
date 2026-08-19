import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeAgentSettings } from '../../../agent-core/config.js';
import {
    getProviderLabel,
    getToolModeLabel,
    isSillyTavernProvider,
    resolveActiveProviderConfig,
} from '../../../agent-core/provider-resolution.js';
import {
    callDrawScenePlannerAgent,
    getLastDrawAgentDiagnostic,
    resetDrawAgentRuntimeForTests,
    resolveDrawAgentContext,
} from '../draw-agent.js';
import { generateAndParseScenePlan } from '../scene-planner.js';
import { createSubmitScenePlanTool } from '../scene-plan-contract.js';

function buildSettings(model, apiKey = 'main-key') {
    return {
        currentPresetName: '主预设',
        delegatePresetName: '分身预设',
        presets: {
            主预设: {
                provider: 'openai-compatible',
                modelConfigs: {
                    'openai-compatible': {
                        baseUrl: 'https://main.example/v1',
                        model,
                        apiKey,
                        temperature: 0.4,
                        maxTokens: 4567,
                        toolMode: 'native',
                        reasoning: {
                            mode: 'on',
                            effort: 'high',
                            output: 'hide',
                        },
                    },
                },
            },
            分身预设: {
                provider: 'anthropic',
                modelConfigs: {
                    anthropic: { model: 'delegate-model', apiKey: 'delegate-key' },
                },
            },
        },
    };
}

function createFakeCore(captured) {
    return {
        normalizeAgentSettings,
        resolveActiveProviderConfig,
        isSillyTavernProvider,
        getProviderLabel,
        getToolModeLabel,
        setHostChatCompletionsRequestHeadersProvider: (provider) => {
            captured.headersProvider = provider;
        },
        createAgentAdapter: (providerConfig) => {
            captured.providerConfigs.push(providerConfig);
            return {
                chat: async (task) => {
                    captured.tasks.push(task);
                    return {
                        toolCalls: [{ name: 'submit_scene_plan', arguments: '{}' }],
                        finishReason: 'tool_calls',
                        requestInspection: {
                            request: {
                                headers: { Authorization: 'Bearer super-secret' },
                                body: { api_key: 'sk-secret' },
                            },
                            effectiveConfig: {
                                toolChoice: 'required',
                                reasoningRequestedMode: 'on',
                                reasoningRequestedOutput: 'hide',
                                reasoningProfileId: 'openai-gpt-5.6',
                                reasoningEffectiveMode: 'on',
                                reasoningEffort: 'high',
                                reasoningBudgetTokens: null,
                                reasoningControlFields: { reasoning_effort: 'high' },
                                reasoningOutputVisible: false,
                            },
                        },
                    };
                },
            };
        },
    };
}

function buildValidScenePlanResult() {
    return {
        toolCalls: [{
            id: 'valid-call',
            name: 'submit_scene_plan',
            arguments: JSON.stringify({
                mindful_prelude: {
                    user_insight: '开门动作。',
                    therapeutic_commitment: '忠实呈现。',
                    visual_plan: {
                        reasoning: '动作适合定格。',
                        moments: [{
                            moment: '1',
                            anchor_target: '阿璃推开门。',
                            char_count: '0',
                            known_chars: [],
                            unknown_chars: [],
                            composition: '室内中景。',
                        }],
                    },
                },
                images: [{
                    index: 1,
                    anchor: '阿璃推开门。',
                    scene: 'opening door, indoor',
                    characters: [],
                }],
            }),
        }],
        finishReason: 'tool_calls',
    };
}

test('draw agent reads the latest main preset every request and never selects delegate config', async () => {
    resetDrawAgentRuntimeForTests();
    const captured = { providerConfigs: [], tasks: [], headersProvider: null };
    let readCount = 0;
    const dependencies = {
        getAgentSettings: async () => {
            readCount += 1;
            return buildSettings(readCount === 1 ? 'gpt-5.6' : 'gpt-5.6-2026-08-07');
        },
        requestHeadersProvider: () => ({ 'X-CSRF-Token': 'fresh' }),
    };
    const loadAgentCore = async () => createFakeCore(captured);
    const task = {
        systemPrompt: 'system',
        messages: [{ role: 'user', content: 'plan' }],
        tools: [createSubmitScenePlanTool()],
        toolChoice: 'auto',
        onStreamProgress: () => {},
    };

    await callDrawScenePlannerAgent({ task, dependencies, loadAgentCore, timeout: 5000 });
    await callDrawScenePlannerAgent({ task, dependencies, loadAgentCore, timeout: 5000 });

    assert.equal(readCount, 2);
    assert.deepEqual(captured.providerConfigs.map((config) => config.model), ['gpt-5.6', 'gpt-5.6-2026-08-07']);
    assert.equal(captured.providerConfigs.some((config) => config.model === 'delegate-model'), false);
    assert.equal(captured.tasks[0].toolChoice, 'required');
    assert.equal(captured.tasks[0].allowToolProtocolFallback, false);
    assert.equal(Object.hasOwn(captured.tasks[0], 'onStreamProgress'), false);
    assert.equal(captured.tasks[0].temperature, 0.4);
    assert.equal(captured.tasks[0].maxTokens, 4567);
    assert.deepEqual(captured.tasks[0].reasoning, {
        mode: 'on',
        output: 'hide',
        effort: 'high',
        profileId: 'openai-gpt-5.6',
        valid: true,
    });
    assert.equal(captured.headersProvider, null);
    const diagnostic = getLastDrawAgentDiagnostic();
    assert.equal(diagnostic.toolCallCount, 1);
    assert.equal(diagnostic.stage, 'request');
    assert.equal(diagnostic.status, 'running');
    assert.equal(diagnostic.presetName, '主预设');
    assert.equal(diagnostic.reasoningRequestedMode, 'on');
    assert.equal(diagnostic.reasoningEffectiveMode, 'on');
    assert.equal(diagnostic.reasoningProfileId, 'openai-gpt-5.6');
    assert.equal(diagnostic.reasoningEffort, 'high');
    assert.equal(diagnostic.reasoningOutputVisible, false);
    assert.deepEqual(diagnostic.reasoningControlFields, { reasoning_effort: 'high' });
    // Diagnostics are redacted at the Draw boundary and never persisted.
    assert.equal(diagnostic.request.request.headers.Authorization, '[redacted]');
    assert.equal(diagnostic.request.request.body.api_key, '[redacted]');
});

test('scene planner corrects schema failures with canonical provider history in one request scope', async () => {
    resetDrawAgentRuntimeForTests();
    const tasks = [];
    let adapterCreateCount = 0;
    const providerPayload = {
        openaiCompatibleMessage: {
            role: 'assistant',
            tool_calls: [{
                id: 'invalid-call',
                type: 'function',
                function: { name: 'submit_scene_plan', arguments: '{}' },
            }],
        },
    };
    const responses = [{
        toolCalls: [{ id: 'invalid-call', name: 'submit_scene_plan', arguments: '{}' }],
        providerPayload,
        finishReason: 'tool_calls',
    }, buildValidScenePlanResult()];

    const result = await generateAndParseScenePlan({
        messageText: '阿璃推开门。',
        maxImages: 1,
        expansionOptions: { runtime: { substituteParams: (text) => text } },
        agentOptions: {
            dependencies: { getAgentSettings: async () => buildSettings('correction-model') },
            loadAgentCore: async () => ({
                createAgentAdapter: () => {
                    adapterCreateCount += 1;
                    return {
                        chat: async (task) => {
                            tasks.push(task);
                            return responses[tasks.length - 1];
                        },
                    };
                },
            }),
        },
    });

    assert.equal(adapterCreateCount, 1);
    assert.equal(tasks.length, 2);
    assert.equal(tasks[0].signal, tasks[1].signal);
    const correctionHistory = tasks[1].messages.slice(-2);
    assert.equal(correctionHistory[0].role, 'assistant');
    assert.deepEqual(correctionHistory[0].providerPayload, providerPayload);
    assert.equal(correctionHistory[0].tool_calls[0].id, 'invalid-call');
    assert.equal(correctionHistory[1].role, 'tool');
    assert.equal(correctionHistory[1].tool_call_id, 'invalid-call');
    assert.equal(JSON.parse(correctionHistory[1].content).error.code, 'TOOL_ARGUMENTS_SCHEMA_INVALID');
    assert.equal(result[0].scene, 'opening door, indoor');
    const diagnostic = getLastDrawAgentDiagnostic();
    assert.equal(diagnostic.status, 'success');
    assert.equal(diagnostic.attemptCount, 2);
    assert.equal(diagnostic.correctionCount, 1);
});

test('Google scene planner corrections stay in the active session and preserve provider call ids', async () => {
    resetDrawAgentRuntimeForTests();
    const settings = buildSettings('unused');
    settings.presets['主预设'].provider = 'google';
    settings.presets['主预设'].modelConfigs.google = {
        model: 'gemini-test',
        apiKey: 'google-key',
    };
    const tasks = [];
    const responses = [{
        provider: 'google',
        toolCalls: [{
            id: 'internal-call',
            providerId: 'provider-call-7',
            name: 'wrong_tool',
            arguments: '{}',
        }],
    }, buildValidScenePlanResult()];

    const result = await generateAndParseScenePlan({
        messageText: '阿璃推开门。',
        maxImages: 1,
        expansionOptions: { runtime: { substituteParams: (text) => text } },
        agentOptions: {
            dependencies: { getAgentSettings: async () => settings },
            loadAgentCore: async () => ({
                createAgentAdapter: () => ({
                    supportsSessionToolLoop: true,
                    chat: async (task) => {
                        tasks.push(task);
                        return responses[tasks.length - 1];
                    },
                }),
            }),
        },
    });

    assert.equal(tasks.length, 2);
    assert.equal(Object.hasOwn(tasks[1], 'messages'), false);
    assert.equal(tasks[1].toolResponses.length, 1);
    assert.equal(tasks[1].toolResponses[0].id, 'internal-call');
    assert.equal(tasks[1].toolResponses[0].providerId, 'provider-call-7');
    assert.equal(tasks[1].toolResponses[0].name, 'wrong_tool');
    assert.equal(tasks[1].toolResponses[0].response.error.code, 'TOOL_CALL_NAME_INVALID');
    assert.equal(result.length, 1);
});

test('scene planner stops immediately after the same validation error repeats', async () => {
    resetDrawAgentRuntimeForTests();
    let callCount = 0;
    let adapterCreateCount = 0;
    await assert.rejects(() => generateAndParseScenePlan({
        messageText: '阿璃推开门。',
        maxImages: 1,
        expansionOptions: { runtime: { substituteParams: (text) => text } },
        agentOptions: {
            dependencies: { getAgentSettings: async () => buildSettings('repeated-error-model') },
            loadAgentCore: async () => ({
                createAgentAdapter: () => {
                    adapterCreateCount += 1;
                    return {
                        chat: async () => {
                            callCount += 1;
                            return {
                                toolCalls: [{
                                    id: `invalid-${callCount}`,
                                    name: 'submit_scene_plan',
                                    arguments: '{}',
                                }],
                            };
                        },
                    };
                },
            }),
        },
    }), (error) => error.code === 'TOOL_ARGUMENTS_SCHEMA_INVALID');

    assert.equal(adapterCreateCount, 1);
    assert.equal(callCount, 2);
    const diagnostic = getLastDrawAgentDiagnostic();
    assert.equal(diagnostic.attemptCount, 2);
    assert.equal(diagnostic.correctionCount, 2);
    assert.equal(diagnostic.status, 'error');
});

test('scene planner performs at most three requests for changing validation failures', async () => {
    resetDrawAgentRuntimeForTests();
    const responses = [
        { toolCalls: [] },
        { toolCalls: [{ id: 'wrong', name: 'wrong_tool', arguments: '{}' }] },
        { toolCalls: [{ id: 'invalid', name: 'submit_scene_plan', arguments: '{}' }] },
    ];
    let callCount = 0;
    await assert.rejects(() => generateAndParseScenePlan({
        messageText: '阿璃推开门。',
        maxImages: 1,
        expansionOptions: { runtime: { substituteParams: (text) => text } },
        agentOptions: {
            dependencies: { getAgentSettings: async () => buildSettings('attempt-limit-model') },
            loadAgentCore: async () => ({
                createAgentAdapter: () => ({
                    chat: async () => {
                        const response = responses[callCount];
                        callCount += 1;
                        return response;
                    },
                }),
            }),
        },
    }), (error) => error.code === 'TOOL_ARGUMENTS_SCHEMA_INVALID');
    assert.equal(callCount, 3);
    assert.equal(getLastDrawAgentDiagnostic().correctionCount, 3);
});

test('draw diagnostics use adapter-effective reasoning and isolate notices by request and provider', async () => {
    resetDrawAgentRuntimeForTests();
    const notice = '本次请求已关闭 Reasoning。';
    const claudeSettings = buildSettings('unused', '');
    claudeSettings.presets['主预设'].provider = 'sillytavern-claude';
    claudeSettings.presets['主预设'].modelConfigs['sillytavern-claude'] = {
        model: 'claude-sonnet-4-5',
        apiKey: '',
        toolMode: 'native',
        reasoning: { mode: 'on', effort: 'high', output: 'hide' },
    };
    const task = {
        messages: [{ role: 'user', content: 'plan' }],
        tools: [createSubmitScenePlanTool()],
    };
    const createCore = (requestInspection) => ({
        setHostChatCompletionsRequestHeadersProvider: () => {},
        createAgentAdapter: () => ({
            chat: async () => ({
                toolCalls: [{ name: 'submit_scene_plan', arguments: '{}' }],
                requestInspection,
            }),
        }),
    });
    const claudeDependencies = {
        getAgentSettings: async () => claudeSettings,
        requestHeadersProvider: () => ({}),
    };

    await callDrawScenePlannerAgent({
        task,
        dependencies: claudeDependencies,
        loadAgentCore: async () => createCore({
            notices: [notice],
            effectiveConfig: {
                toolChoice: 'any',
                reasoningRequestedMode: 'on',
                reasoningRequestedOutput: 'hide',
                reasoningProfileId: 'sillytavern-claude-manual',
                reasoningEffectiveMode: 'off',
                reasoningEffort: '',
                reasoningBudgetTokens: null,
                reasoningControlFields: { reasoning_effort: 'auto' },
                reasoningOutputVisible: false,
            },
        }),
    });

    const diagnostic = getLastDrawAgentDiagnostic();
    assert.equal(diagnostic.status, 'running');
    assert.equal(diagnostic.reasoningRequestedMode, 'on');
    assert.equal(diagnostic.reasoningEffectiveMode, 'off');
    assert.equal(diagnostic.reasoningEffort, '');
    assert.equal(diagnostic.reasoningOutputVisible, false);
    assert.deepEqual(diagnostic.reasoningControlFields, { reasoning_effort: 'auto' });
    assert.equal(diagnostic.toolChoice, 'any');
    assert.deepEqual(diagnostic.notices, [notice]);

    const openAiSettings = buildSettings('gpt-5.6');
    const openAiDependencies = { getAgentSettings: async () => openAiSettings };
    await callDrawScenePlannerAgent({
        task,
        dependencies: openAiDependencies,
        loadAgentCore: async () => createCore({
            effectiveConfig: {
                toolChoice: 'required',
                reasoningRequestedMode: 'on',
                reasoningRequestedOutput: 'hide',
                reasoningProfileId: 'openai-gpt-5.6',
                reasoningEffectiveMode: 'on',
                reasoningEffort: 'high',
                reasoningBudgetTokens: null,
                reasoningControlFields: { reasoning_effort: 'high' },
                reasoningOutputVisible: false,
            },
        }),
    });
    assert.deepEqual(getLastDrawAgentDiagnostic().notices, []);
});

test('draw agent validates missing direct credentials while allowing hosted providers without keys', async () => {
    const loadAgentCore = async () => createFakeCore({ providerConfigs: [], tasks: [] });
    await assert.rejects(() => resolveDrawAgentContext({
        dependencies: {
            getAgentSettings: async () => buildSettings('model', ''),
            requestHeadersProvider: () => ({}),
        },
        loadAgentCore,
    }), (error) => error.code === 'API_KEY_MISSING');

    const hostedSettings = buildSettings('hosted-model', '');
    hostedSettings.presets['主预设'].provider = 'sillytavern-google';
    hostedSettings.presets['主预设'].modelConfigs['sillytavern-google'] = {
        model: 'hosted-model',
        apiKey: '',
    };
    const captured = { providerConfigs: [], tasks: [], headersProvider: null };
    const context = await resolveDrawAgentContext({
        dependencies: {
            getAgentSettings: async () => hostedSettings,
            requestHeadersProvider: () => ({ 'X-CSRF-Token': 'fresh' }),
        },
        loadAgentCore: async () => createFakeCore(captured),
    });
    assert.equal(context.providerConfig.provider, 'sillytavern-google');
    assert.equal(context.providerConfig.model, 'hosted-model');
    assert.equal(captured.headersProvider()['X-CSRF-Token'], 'fresh');
});

test('draw agent preserves timeout, cancellation, and provider failure boundaries', async () => {
    const task = {
        messages: [{ role: 'user', content: 'plan' }],
        tools: [createSubmitScenePlanTool()],
    };
    const dependencies = {
        getAgentSettings: async () => buildSettings('boundary-model'),
        requestHeadersProvider: () => ({}),
    };
    const loadCoreWithChat = (chat) => async () => ({
        setHostChatCompletionsRequestHeadersProvider: () => {},
        createAgentAdapter: () => ({ chat }),
    });

    await assert.rejects(() => callDrawScenePlannerAgent({
        task,
        dependencies,
        timeout: 10,
        loadAgentCore: loadCoreWithChat(({ signal }) => new Promise((resolve, reject) => {
            signal.addEventListener('abort', () => {
                const error = new Error('aborted');
                error.name = 'AbortError';
                reject(error);
            }, { once: true });
        })),
    }), (error) => error.code === 'REQUEST_TIMEOUT');

    const controller = new AbortController();
    controller.abort();
    await assert.rejects(() => callDrawScenePlannerAgent({
        task,
        dependencies,
        signal: controller.signal,
        loadAgentCore: loadCoreWithChat(async ({ signal }) => {
            assert.equal(signal.aborted, true);
            const error = new Error('aborted');
            error.name = 'AbortError';
            throw error;
        }),
    }), (error) => error.code === 'REQUEST_ABORTED');

    const delayedController = new AbortController();
    delayedController.abort();
    await assert.rejects(() => callDrawScenePlannerAgent({
        task,
        dependencies,
        timeout: 10,
        signal: delayedController.signal,
        loadAgentCore: loadCoreWithChat(async () => {
            await new Promise((resolve) => setTimeout(resolve, 20));
            const error = new Error('aborted after provider cleanup');
            error.name = 'AbortError';
            throw error;
        }),
    }), (error) => error.code === 'REQUEST_ABORTED');

    await assert.rejects(() => callDrawScenePlannerAgent({
        task,
        dependencies,
        loadAgentCore: loadCoreWithChat(async () => {
            throw new Error('provider unavailable');
        }),
    }), (error) => error.code === 'PROVIDER_REQUEST_FAILED');

    // A provider error must not be reclassified as a timeout just because it says "timed out",
    // and an already typed domain error must survive untouched.
    await assert.rejects(() => callDrawScenePlannerAgent({
        task,
        dependencies,
        signal: AbortSignal.abort(),
        loadAgentCore: loadCoreWithChat(async () => {
            throw new Error('upstream request timed out');
        }),
    }), (error) => error.code === 'REQUEST_ABORTED');
});

test('every scene planner failure stage lands in this request own diagnostic', async () => {
    const planOptions = {
        messageText: '阿璃推开门。',
        maxImages: 1,
        expansionOptions: { runtime: { substituteParams: (text) => text } },
    };
    const settings = buildSettings('diagnostic-model');
    const dependencies = { getAgentSettings: async () => settings, requestHeadersProvider: () => ({}) };

    const expectDiagnostic = async (run, { code, stage }) => {
        resetDrawAgentRuntimeForTests();
        await assert.rejects(run, (error) => error.code === code);
        const diagnostic = getLastDrawAgentDiagnostic();
        assert.equal(diagnostic.status, 'error', `${code} 必须写入诊断`);
        assert.equal(diagnostic.stage, stage);
        assert.equal(diagnostic.errorCode, code);
    };

    // Prompt macro failure.
    await expectDiagnostic(() => generateAndParseScenePlan({
        ...planOptions,
        expansionOptions: {
            runtime: {
                substituteParams: () => {
                    throw new Error('宏解析炸了');
                },
            },
        },
    }), { code: 'PROMPT_EXPANSION_FAILED', stage: 'prompt' });

    // Configuration pre-check failure (no model on the shared main preset).
    await expectDiagnostic(() => generateAndParseScenePlan({
        ...planOptions,
        agentOptions: {
            dependencies: { getAgentSettings: async () => buildSettings('') },
            loadAgentCore: async () => {
                throw new Error('bundle must not load before the preset is valid');
            },
        },
    }), { code: 'MODEL_MISSING', stage: 'config' });

    // Settings storage and hosted request-header loading stay in the configuration boundary.
    await expectDiagnostic(() => generateAndParseScenePlan({
        ...planOptions,
        agentOptions: {
            dependencies: {
                getAgentSettings: async () => {
                    throw new Error('settings module unavailable');
                },
            },
        },
    }), { code: 'AGENT_SETTINGS_LOAD_FAILED', stage: 'config' });

    const hostedSettings = buildSettings('hosted-model', '');
    hostedSettings.presets['主预设'].provider = 'sillytavern-claude';
    hostedSettings.presets['主预设'].modelConfigs['sillytavern-claude'] = {
        model: 'hosted-model',
        apiKey: '',
    };
    await expectDiagnostic(() => generateAndParseScenePlan({
        ...planOptions,
        agentOptions: {
            dependencies: {
                getAgentSettings: async () => hostedSettings,
                requestHeadersProvider: () => ({}),
            },
            loadAgentCore: async () => ({
                setHostChatCompletionsRequestHeadersProvider: () => {
                    throw new Error('request headers module unavailable');
                },
            }),
        },
    }), { code: 'HOST_REQUEST_HEADERS_LOAD_FAILED', stage: 'config' });

    // Cancellation.
    await expectDiagnostic(() => generateAndParseScenePlan({
        ...planOptions,
        signal: AbortSignal.abort(),
        agentOptions: {
            dependencies,
            loadAgentCore: async () => ({
                setHostChatCompletionsRequestHeadersProvider: () => {},
                createAgentAdapter: () => ({
                    chat: async () => {
                        const error = new Error('aborted');
                        error.name = 'AbortError';
                        throw error;
                    },
                }),
            }),
        },
    }), { code: 'REQUEST_ABORTED', stage: 'request' });

    // Timeout.
    await expectDiagnostic(() => generateAndParseScenePlan({
        ...planOptions,
        timeout: 10,
        agentOptions: {
            dependencies,
            loadAgentCore: async () => ({
                setHostChatCompletionsRequestHeadersProvider: () => {},
                createAgentAdapter: () => ({
                    chat: ({ signal }) => new Promise((_resolve, reject) => {
                        signal.addEventListener('abort', () => {
                            const error = new Error('aborted');
                            error.name = 'AbortError';
                            reject(error);
                        }, { once: true });
                    }),
                }),
            }),
        },
    }), { code: 'REQUEST_TIMEOUT', stage: 'request' });

    // Provider failure.
    await expectDiagnostic(() => generateAndParseScenePlan({
        ...planOptions,
        agentOptions: {
            dependencies,
            loadAgentCore: async () => ({
                setHostChatCompletionsRequestHeadersProvider: () => {},
                createAgentAdapter: () => ({
                    chat: async () => {
                        throw new Error('provider unavailable');
                    },
                }),
            }),
        },
    }), { code: 'PROVIDER_REQUEST_FAILED', stage: 'request' });

    // Tool contract failure after a successful transport round trip.
    await expectDiagnostic(() => generateAndParseScenePlan({
        ...planOptions,
        agentOptions: {
            dependencies,
            loadAgentCore: async () => ({
                setHostChatCompletionsRequestHeadersProvider: () => {},
                createAgentAdapter: () => ({
                    chat: async () => ({ toolCalls: [], finishReason: 'stop' }),
                }),
            }),
        },
    }), { code: 'TOOL_CALL_MISSING', stage: 'parse' });
});

test('a stale slower request never overwrites the newest request diagnostic', async () => {
    resetDrawAgentRuntimeForTests();
    const dependencies = {
        getAgentSettings: async () => buildSettings('concurrent-model'),
        requestHeadersProvider: () => ({}),
    };
    const task = { messages: [{ role: 'user', content: 'plan' }], tools: [createSubmitScenePlanTool()] };
    const loadCore = (delayMs, toolName) => async () => ({
        setHostChatCompletionsRequestHeadersProvider: () => {},
        createAgentAdapter: () => ({
            chat: async () => {
                await new Promise((resolve) => setTimeout(resolve, delayMs));
                return { toolCalls: [{ name: toolName, arguments: '{}' }], finishReason: 'tool_calls' };
            },
        }),
    });

    const slow = callDrawScenePlannerAgent({ task, dependencies, loadAgentCore: loadCore(40, 'slow_tool') });
    await new Promise((resolve) => setTimeout(resolve, 5));
    const fast = callDrawScenePlannerAgent({ task, dependencies, loadAgentCore: loadCore(1, 'fast_tool') });
    await Promise.all([slow, fast]);

    assert.deepEqual(getLastDrawAgentDiagnostic().toolNames, ['fast_tool']);
});
