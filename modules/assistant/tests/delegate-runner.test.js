import test from 'node:test';
import assert from 'node:assert/strict';

import { TOOL_DEFINITIONS, TOOL_NAMES } from '../app-src/tooling.js';
import {
    createDelegateRunner,
    filterDelegateToolDefinitions,
} from '../../agent-core/runtime/delegate-runner.js';

function safeJsonParse(text, fallback = {}) {
    try {
        return JSON.parse(text || '{}');
    } catch {
        return fallback;
    }
}

function makeRunner(adapter, options = {}) {
    return createDelegateRunner({
        createAdapter: () => adapter,
        executeToolCall: options.executeToolCall || (async () => ({ ok: true })),
        getActiveProviderConfig: () => ({
            provider: 'test',
            temperature: 0.2,
            maxTokens: 1000,
            reasoning: { mode: 'inherit', output: 'hide' },
            ...(options.providerConfig || {}),
        }),
        getSystemPrompt: () => options.systemPrompt || 'base system prompt',
        resolveToolDefinitions: () => options.toolDefinitions || TOOL_DEFINITIONS,
        safeJsonParse,
        isAbortError: (error) => String(error?.message || error || '') === 'tool_aborted',
        TOOL_NAMES,
        maxRounds: options.maxRounds || 4,
    });
}

test('filterDelegateToolDefinitions removes delegate and plan tools only', () => {
    const filteredNames = filterDelegateToolDefinitions(TOOL_DEFINITIONS, TOOL_NAMES)
        .map((definition) => definition.function?.name)
        .filter(Boolean);

    assert.equal(filteredNames.includes(TOOL_NAMES.DELEGATE_RUN), false);
    assert.equal(filteredNames.includes(TOOL_NAMES.PLAN_CREATE), false);
    assert.equal(filteredNames.includes(TOOL_NAMES.PLAN_UPDATE), false);
    assert.equal(filteredNames.includes(TOOL_NAMES.PLAN_LIST), false);
    assert.equal(filteredNames.includes(TOOL_NAMES.PLAN_GET), false);
    assert.equal(filteredNames.includes(TOOL_NAMES.READ), true);
    assert.equal(filteredNames.includes(TOOL_NAMES.RUN_SLASH_COMMAND), true);
});

test('DelegateRun completes from a direct model answer', async () => {
    let seenTask = null;
    const adapter = {
        chat: async (task) => {
            seenTask = task;
            return {
                text: '子任务完成：没有发现风险。',
                toolCalls: [],
            };
        },
    };
    const runner = makeRunner(adapter);

    const result = await runner.runDelegate({
        task: '检查一个独立问题',
        context: '只需要静态判断',
        deliverable: '返回结论',
    }, { controller: new AbortController() });

    assert.equal(result.ok, true);
    assert.equal(result.status, 'completed');
    assert.match(result.result, /子任务完成/);
    assert.equal(result.rounds, 1);
    assert.equal(result.toolCallCount, 0);
    assert.equal(Object.hasOwn(result, 'task'), false);
    assert.equal(seenTask.messages[0].role, 'system');
    assert.match(seenTask.messages[0].content, /子任务执行规则/);
    assert.match(seenTask.messages[1].content, /\[Task\]/);
    assert.equal(typeof seenTask.onStreamProgress, 'function');
    assert.equal(seenTask.tools.some((tool) => tool.function?.name === TOOL_NAMES.DELEGATE_RUN), false);
});

test('DelegateRun can use a separate delegate provider config', async () => {
    let seenProviderConfig = null;
    const adapter = {
        chat: async () => ({
            text: 'delegate result',
            toolCalls: [],
        }),
    };
    const runner = createDelegateRunner({
        createAdapter: (providerConfig) => {
            seenProviderConfig = providerConfig;
            return adapter;
        },
        executeToolCall: async () => ({ ok: true }),
        getActiveProviderConfig: () => ({
            provider: 'main',
            model: 'main-model',
            temperature: 0.2,
            maxTokens: 1000,
            reasoning: { mode: 'inherit', output: 'hide' },
        }),
        getDelegateProviderConfig: () => ({
            provider: 'delegate',
            model: 'delegate-model',
            temperature: 0.1,
            maxTokens: 2000,
            reasoning: { mode: 'inherit', output: 'hide' },
        }),
        getSystemPrompt: () => 'base system prompt',
        resolveToolDefinitions: () => TOOL_DEFINITIONS,
        safeJsonParse,
        isAbortError: () => false,
        TOOL_NAMES,
        maxRounds: 2,
    });

    const result = await runner.runDelegate({ task: 'review chapter' });

    assert.equal(result.ok, true);
    assert.equal(seenProviderConfig.provider, 'delegate');
    assert.equal(seenProviderConfig.model, 'delegate-model');
});

test('DelegateRun does not impose a separate context cap', async () => {
    let seenUserPrompt = '';
    const adapter = {
        chat: async (task) => {
            seenUserPrompt = task.messages[1].content;
            return {
                text: '长上下文已收到。',
                toolCalls: [],
            };
        },
    };
    const runner = makeRunner(adapter);
    const tail = 'LONG_CONTEXT_TAIL';
    const result = await runner.runDelegate({
        task: '检查长上下文',
        context: `${'x'.repeat(12000)}${tail}`,
    }, { controller: new AbortController() });

    assert.equal(result.ok, true);
    assert.match(seenUserPrompt, new RegExp(tail));
});

test('DelegateRun strips main orchestration guidance from child system prompt', async () => {
    let seenSystemPrompt = '';
    const adapter = {
        chat: async (task) => {
            seenSystemPrompt = task.messages[0].content;
            return {
                text: '完成。',
                toolCalls: [],
            };
        },
    };
    const runner = makeRunner(adapter, {
        systemPrompt: [
            '# Tool Usage Guidance',
            '## Using Plans',
            ' - Use PlanCreate for multi-step work.',
            ' - Use PlanUpdate after finishing.',
            '',
            '## Using Delegates',
            ' - Use DelegateRun for independent subtasks.',
            '',
            '# Behavior Guidelines',
            ' - Be specific.',
        ].join('\n'),
    });

    const result = await runner.runDelegate({
        task: '检查分身提示词',
    }, { controller: new AbortController() });

    assert.equal(result.ok, true);
    assert.doesNotMatch(seenSystemPrompt, /Use PlanCreate/);
    assert.doesNotMatch(seenSystemPrompt, /Use PlanUpdate/);
    assert.doesNotMatch(seenSystemPrompt, /Use DelegateRun/);
    assert.match(seenSystemPrompt, /不默认知道主对话/);
    assert.match(seenSystemPrompt, /# Behavior Guidelines/);
    assert.match(seenSystemPrompt, /子任务执行规则/);
});

test('DelegateRun respects the already enabled tool surface', () => {
    const withoutJsApi = TOOL_DEFINITIONS.filter((tool) => tool.function?.name !== TOOL_NAMES.RUN_JAVASCRIPT_API);
    const filteredNames = filterDelegateToolDefinitions(withoutJsApi, TOOL_NAMES)
        .map((definition) => definition.function?.name)
        .filter(Boolean);

    assert.equal(filteredNames.includes(TOOL_NAMES.RUN_JAVASCRIPT_API), false);
    assert.equal(filteredNames.includes(TOOL_NAMES.READ), true);
});

test('DelegateRun feeds tool results back into the child conversation', async () => {
    let round = 0;
    const executed = [];
    const adapter = {
        chat: async (task) => {
            round += 1;
            if (round === 1) {
                return {
                    text: '',
                    toolCalls: [{
                        id: 'call-read',
                        name: TOOL_NAMES.READ,
                        arguments: JSON.stringify({ filePath: 'local/a.txt', scope: 'local' }),
                    }],
                };
            }
            assert.equal(task.messages.some((message) => message.role === 'tool' && message.tool_call_id === 'call-read'), true);
            return {
                text: '读取完成，local/a.txt 内容正常。',
                toolCalls: [],
            };
        },
    };
    const runner = makeRunner(adapter, {
        executeToolCall: async (toolCall, args) => {
            executed.push({ name: toolCall.name, args });
            return {
                ok: true,
                path: args.filePath,
                content: 'demo',
            };
        },
    });

    const result = await runner.runDelegate({
        task: '读取 local/a.txt 并判断是否正常',
    }, { controller: new AbortController() });

    assert.equal(result.ok, true);
    assert.equal(result.status, 'completed');
    assert.equal(result.toolCallCount, 1);
    assert.deepEqual(executed, [{
        name: TOOL_NAMES.READ,
        args: { filePath: 'local/a.txt', scope: 'local' },
    }]);
    assert.equal(result.toolTrace.length, 1);
    assert.equal(result.toolTrace[0].name, TOOL_NAMES.READ);
    assert.equal(result.toolTrace[0].ok, true);
    assert.equal(Object.hasOwn(result, 'task'), false);
});

test('DelegateRun emits UI-only progress events while using tools', async () => {
    let round = 0;
    const progressEvents = [];
    const adapter = {
        chat: async () => {
            round += 1;
            if (round === 1) {
                return {
                    text: '',
                    toolCalls: [{
                        id: 'call-read-progress',
                        name: TOOL_NAMES.READ,
                        arguments: JSON.stringify({ filePath: 'local/progress.txt', scope: 'local' }),
                    }],
                };
            }
            return {
                text: 'progress done',
                toolCalls: [],
            };
        },
    };
    const runner = makeRunner(adapter, {
        executeToolCall: async () => ({
            ok: true,
            summary: '读取完成。',
        }),
    });

    const result = await runner.runDelegate({
        task: '验证进度事件',
    }, {
        controller: new AbortController(),
        onDelegateProgress: (event) => {
            progressEvents.push(event);
        },
    });

    assert.equal(result.ok, true);
    assert.deepEqual(progressEvents.map((event) => event.type), [
        'started',
        'round_start',
        'model_result',
        'tool_start',
        'tool_result',
        'round_start',
        'model_result',
        'completed',
    ]);
    assert.equal(progressEvents.find((event) => event.type === 'tool_start').toolName, TOOL_NAMES.READ);
    assert.match(progressEvents.find((event) => event.type === 'tool_start').argsSummary, /local\/progress\.txt/);
    assert.match(progressEvents.find((event) => event.type === 'tool_result').summary, /读取完成/);
});

test('DelegateRun uses session tool responses when the adapter supports them', async () => {
    let round = 0;
    const seenTasks = [];
    const adapter = {
        supportsSessionToolLoop: true,
        chat: async (task) => {
            seenTasks.push(task);
            round += 1;
            if (round === 1) {
                return {
                    text: '',
                    toolCalls: [{
                        id: 'call-read-session',
                        name: TOOL_NAMES.READ,
                        arguments: JSON.stringify({ filePath: 'local/session.txt', scope: 'local' }),
                    }],
                };
            }
            assert.equal(Array.isArray(task.toolResponses), true);
            assert.equal(Object.hasOwn(task, 'messages'), false);
            assert.deepEqual(task.toolResponses, [{
                id: 'call-read-session',
                name: TOOL_NAMES.READ,
                response: {
                    ok: true,
                    content: 'session loop ok',
                },
            }]);
            return {
                text: 'session 工具回传正常。',
                toolCalls: [],
            };
        },
    };
    const runner = makeRunner(adapter, {
        executeToolCall: async () => ({
            ok: true,
            content: 'session loop ok',
        }),
    });

    const result = await runner.runDelegate({
        task: '验证 session tool loop',
    }, { controller: new AbortController() });

    assert.equal(result.ok, true);
    assert.equal(result.status, 'completed');
    assert.equal(result.toolCallCount, 1);
    assert.equal(Array.isArray(seenTasks[0].messages), true);
    assert.equal(Object.hasOwn(result, 'task'), false);
});

test('DelegateRun recognizes Google providerPayload function calls without direct toolCalls', async () => {
    let round = 0;
    const executed = [];
    const adapter = {
        chat: async (task) => {
            round += 1;
            if (round === 1) {
                return {
                    text: '',
                    providerPayload: {
                        googleContent: {
                            role: 'model',
                            parts: [{
                                functionCall: {
                                    id: 'google-read',
                                    name: TOOL_NAMES.READ,
                                    args: { filePath: 'local/google.txt', scope: 'local' },
                                },
                            }],
                        },
                    },
                };
            }
            assert.equal(task.messages.some((message) => message.role === 'tool' && message.tool_call_id === 'google-read'), true);
            return {
                text: 'Google 工具调用已完成。',
                toolCalls: [],
            };
        },
    };
    const runner = makeRunner(adapter, {
        providerConfig: { provider: 'google' },
        executeToolCall: async (toolCall, args) => {
            executed.push({ name: toolCall.name, args });
            return { ok: true, content: 'google ok' };
        },
    });

    const result = await runner.runDelegate({
        task: '验证 Google fallback 工具调用',
    }, { controller: new AbortController() });

    assert.equal(result.ok, true);
    assert.deepEqual(executed, [{
        name: TOOL_NAMES.READ,
        args: { filePath: 'local/google.txt', scope: 'local' },
    }]);
    assert.equal(result.toolCallCount, 1);
    assert.equal(Object.hasOwn(result, 'task'), false);
});

test('DelegateRun rejects hidden delegate and plan calls inside the child run', async () => {
    let round = 0;
    let executed = false;
    const adapter = {
        chat: async (task) => {
            round += 1;
            if (round === 1) {
                return {
                    text: '',
                    toolCalls: [{
                        id: 'call-plan',
                        name: TOOL_NAMES.PLAN_CREATE,
                        arguments: JSON.stringify({ title: '不该创建' }),
                    }],
                };
            }
            return {
                text: '已经确认隐藏工具不可用。',
                toolCalls: [],
            };
        },
    };
    const runner = makeRunner(adapter, {
        executeToolCall: async () => {
            executed = true;
            return { ok: true };
        },
    });

    const result = await runner.runDelegate({
        task: '尝试调用隐藏工具',
    }, { controller: new AbortController() });

    assert.equal(executed, false);
    assert.equal(result.ok, true);
    assert.equal(result.toolTrace[0].ok, false);
    assert.equal(result.toolTrace[0].error, 'delegate_tool_not_available');
    assert.equal(Object.hasOwn(result, 'task'), false);
});

test('DelegateRun propagates abort errors', async () => {
    const adapter = {
        chat: async () => {
            throw new Error('tool_aborted');
        },
    };
    const runner = makeRunner(adapter);

    await assert.rejects(
        () => runner.runDelegate({ task: '会被取消的任务' }, { controller: new AbortController() }),
        /tool_aborted/,
    );
});
