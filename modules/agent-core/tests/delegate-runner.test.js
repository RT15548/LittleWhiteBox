import test from 'node:test';
import assert from 'node:assert/strict';
import { createDelegateRunner } from '../runtime/delegate-runner.js';

// A rejected preparation is not a model round and cannot consume the final-answer reminder.
// Changed context must rebuild both prompt and retained provider history, even with identical tools.
test('request preparation retry preserves the reminder and replays refreshed context without counting a model round', async () => {
    const requests = [], events = [], toolContexts = [];
    let revision = 1;
    let discardedReminder;
    const runner = createDelegateRunner({
        createAdapter: () => ({
            supportsSessionToolLoop: true,
            async chat(task) {
                requests.push(structuredClone({
                    messages: task.messages,
                    systemPrompt: task.systemPrompt,
                    tools: task.tools,
                    toolResponses: task.toolResponses,
                    finalAnswerReminderText: task.finalAnswerReminderText,
                }));
                if (requests.length === 1) return { toolCalls: [{ id: 'read', name: 'Read', arguments: '{}' }] };
                if (requests.length === 2) return { text: '' };
                assert.equal(requests.length, 3, 'Preparation retries must not dispatch a model request');
                return { text: 'done' };
            },
        }),
        getActiveProviderConfig: () => ({}),
        getRequestContext: () => ({ revision }),
        getSystemPrompt: context => `fixture-context-${context.revision}`,
        resolveToolDefinitions: context => {
            toolContexts.push(context.revision);
            return [{ function: { name: 'Read' } }];
        },
        async prepareRequest(task, messages, _run, context) {
            assert.equal(context.revision, revision);
            assert.equal(messages[0].content, task.systemPrompt);
            if (requests.length === 2 && revision === 1) {
                discardedReminder = task.finalAnswerReminderText;
                assert.ok(discardedReminder);
                revision = 2;
                return null;
            }
            return task;
        },
        executeToolCall: async () => ({ ok: true }),
        safeJsonParse: JSON.parse,
        isAbortError: error => error.name === 'AbortError',
        TOOL_NAMES: {},
    });
    const result = await runner.runDelegate({ task: 'Fixture task' }, {
        controller: new AbortController(),
        onDelegateProgress: event => events.push(event),
    });

    assert.equal(result.ok, true);
    assert.equal(result.rounds, 3);
    assert.equal(result.toolCallCount, 1);
    assert.equal(requests.length, 3);
    assert.equal(requests[1].toolResponses.length, 1, 'Unchanged context can continue the provider session');
    const replay = requests[2];
    assert.deepEqual(replay.tools, requests[1].tools);
    assert.equal(replay.toolResponses, undefined);
    assert.equal(replay.finalAnswerReminderText, undefined);
    assert.equal(replay.messages[0].content, replay.systemPrompt);
    assert.ok(replay.systemPrompt.includes('fixture-context-2'));
    assert.equal(replay.systemPrompt.includes('fixture-context-1'), false);
    assert.equal(replay.messages.filter(message => message.content === discardedReminder).length, 1);
    assert.equal(replay.messages.filter(message => message.role === 'system').length, 2);
    assert.equal(replay.messages.filter(message => message.role === 'tool').length, 1);
    assert.deepEqual(toolContexts, [1, 1, 1, 2]);
    assert.deepEqual(events.filter(event => event.type === 'round_start').map(event => event.round), [1, 2, 3]);
});

function retryHarness({ respond, retryEnabled = true, onWait = () => {}, prepareRequest, executeToolCall } = {}) {
    const requests = [], events = [], waits = [], executions = [];
    const controller = new AbortController();
    let revision = 1;
    const runner = createDelegateRunner({
        createAdapter: () => ({
            supportsSessionToolLoop: true,
            async chat(task) {
                requests.push(structuredClone({
                    messages: task.messages, tools: task.tools, systemPrompt: task.systemPrompt,
                    toolResponses: task.toolResponses, finalAnswerReminderText: task.finalAnswerReminderText,
                }));
                return respond(task, requests.length);
            },
        }),
        // The runner owns neither transient classification nor the retry limit.
        // This immediate controller tests the injected request boundary without timers.
        ...(retryEnabled ? { createRequestRetry: () => {
            let attempts = 0;
            return {
                get attempts() { return attempts; },
                reset() { attempts = 0; },
                async wait(error, signal) {
                    signal.throwIfAborted();
                    if (error.status !== 500 || attempts >= 3) return false;
                    waits.push(++attempts);
                    await onWait({ controller, setRevision: value => { revision = value; } });
                    signal.throwIfAborted();
                    return true;
                },
            };
        } } : {}),
        getActiveProviderConfig: () => ({}),
        getRequestContext: () => ({ revision }),
        getSystemPrompt: context => `fixture-context-${context.revision}`,
        resolveToolDefinitions: () => [{ function: { name: 'Write' } }],
        prepareRequest,
        executeToolCall: async (...args) => {
            executions.push(args[0].id);
            return executeToolCall ? executeToolCall(...args) : { ok: true, receipt: 'write-complete' };
        },
        safeJsonParse: JSON.parse,
        isAbortError: error => error.name === 'AbortError',
        TOOL_NAMES: {},
    });
    return { requests, events, waits, executions, controller,
        start: () => runner.runDelegate({ task: 'Fixture task' }, {
            controller, onDelegateProgress: event => events.push(event),
        }) };
}

const transientFailure = () => Object.assign(new Error('fixture-provider-failure'), { status: 500 });

test('delegate retries only failed model requests, replays completed tools and preserves its final-answer reminder', async () => {
    let reminder;
    const h = retryHarness({
        respond(task, request) {
            if (request === 1) return { toolCalls: [{ id: 'write-once', name: 'Write', arguments: '{}' }] };
            if (request === 2 || request === 4) {
                task.onStreamProgress({ text: 'discarded-attempt', thoughts: [{ text: 'discarded-thought' }],
                    toolCalls: [{ id: 'discarded-call', name: 'Write', arguments: '{}' }], toolCallDraft: true });
                if (request === 4) reminder = task.finalAnswerReminderText;
                throw transientFailure();
            }
            if (request === 3) return { text: '' };
            assert.equal(request, 5);
            return { text: 'done' };
        },
    });
    const result = await h.start();
    assert.equal(result.ok, true);
    assert.equal(result.rounds, 3);
    assert.equal(result.toolCallCount, 1);
    assert.deepEqual(h.executions, ['write-once']);
    assert.deepEqual(h.waits, [1, 1], 'Each successful request restores the next request retry allowance');
    assert.deepEqual(h.events.filter(event => event.type === 'round_start').map(event => event.round), [1, 2, 3]);
    assert.equal(h.requests[1].toolResponses.length, 1);
    assert.ok(reminder);
    for (const replay of [h.requests[2], h.requests[4]]) {
        assert.equal(replay.toolResponses, undefined);
        assert.equal(replay.finalAnswerReminderText, undefined);
        const replies = replay.messages.filter(message => message.role === 'tool');
        assert.equal(replies.length, 1);
        assert.equal(replies[0].tool_call_id, 'write-once');
        assert.deepEqual(JSON.parse(replies[0].content), { ok: true, receipt: 'write-complete' });
        assert.deepEqual(replay.messages.flatMap(message => (message.tool_calls || []).map(call => call.id)), ['write-once']);
        assert.equal(replay.messages.some(message => message.content === 'discarded-attempt'), false);
    }
    assert.equal(h.requests[4].messages.filter(message => message.content === reminder).length, 1);
});

test('delegate retry allowance survives request-context re-preparation without counting additional rounds', async () => {
    let prepareCount = 0;
    const h = retryHarness({
        respond: () => { throw transientFailure(); },
        onWait: ({ setRevision }) => setRevision(2),
        prepareRequest(task) {
            prepareCount++;
            return prepareCount === 2 ? null : task;
        },
    });
    const result = await h.start();
    assert.equal(result.ok, false);
    assert.equal(h.requests.length, 4);
    assert.equal(prepareCount, 5);
    assert.deepEqual(h.waits, [1, 2, 3]);
    assert.equal(result.rounds, 1);
    assert.equal(h.events.filter(event => event.type === 'round_start').length, 1);
    assert.notEqual(h.requests[1].systemPrompt, h.requests[0].systemPrompt);
    assert.equal(h.requests[2].systemPrompt, h.requests[1].systemPrompt);
});

test('delegate without the retry hook keeps its single-attempt behavior', async () => {
    const h = retryHarness({ retryEnabled: false, respond: () => { throw transientFailure(); } });
    assert.equal((await h.start()).ok, false);
    assert.equal(h.requests.length, 1);
    assert.deepEqual(h.waits, []);
});

test('delegate stop during retry wait prevents another request', async () => {
    const h = retryHarness({ respond: () => { throw transientFailure(); },
        onWait: ({ controller }) => controller.abort() });
    await assert.rejects(h.start(), { name: 'AbortError' });
    assert.equal(h.requests.length, 1);
    assert.deepEqual(h.waits, [1]);
});

test('delegate preparation and tool failures never enter model retry', async t => {
    for (const stage of ['prepare', 'tool']) await t.test(stage, async () => {
        const failure = transientFailure();
        const h = retryHarness({
            respond: () => ({ toolCalls: [{ id: 'write-once', name: 'Write', arguments: '{}' }] }),
            ...(stage === 'prepare' ? { prepareRequest: () => { throw failure; } }
                : { executeToolCall: () => { throw failure; } }),
        });
        if (stage === 'prepare') assert.equal((await h.start()).ok, false);
        else await assert.rejects(h.start(), error => error === failure);
        assert.equal(h.requests.length, stage === 'prepare' ? 0 : 1);
        assert.deepEqual(h.waits, []);
        assert.deepEqual(h.executions, stage === 'prepare' ? [] : ['write-once']);
    });
});

