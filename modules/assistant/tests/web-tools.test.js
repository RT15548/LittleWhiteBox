import test from 'node:test';
import assert from 'node:assert/strict';
import { createAssistantRuntime } from '../app-src/runtime.js';
import { TOOL_NAMES, getAssistantToolDefinitions, formatToolResultDisplay } from '../app-src/tooling.js';
import { toolOutcome } from '../app-src/ui/tool-activity.js';
import { getWebSearchToolDefinition, getWebFetchToolDefinition } from '../../agent-core/web/tools.js';
import { TOOL_RESULT_PAGE_CHARS } from '../../agent-core/runtime/tool-result-pages.js';
import { estimateConversationTokens } from '../../agent-core/runtime/context-tokens.js';

// 验收：主助手和委托助手使用各自配置获得同一搜索/读取契约，未配置时不暴露；代价：协议错误、错误计费。
// 验收：正文、来源及部分失败证据完整进入下一轮与会话，失败不冒充成功；代价：证据丢失和错误结论。
// 验收：取消停止当前请求且不发下一请求，错误不泄露 Key、不自动重试；代价：泄露凭据、重复计费。
const urls = ['https://example.com/guide', 'https://example.org/reference'];
const text = 'Evidence from the requested page.';
const settings = (provider, key = 'fixture-secret') => ({ provider: 'openai-compatible', model: 'fixture',
    webProvider: provider, [`${provider}ApiKey`]: key });
const call = (name, args) => ({ text: '', toolCalls: [{ id: name, name, arguments: JSON.stringify(args) }] });
const done = { text: 'Verified.', toolCalls: [] };

function runtimeHarness(t, { config = settings('tavily'), delegateConfig = settings('exa'), steps, delegateSteps = [], session = false, jsApiEnabled = false }) {
    t.mock.method(console, 'info', () => {});
    const run = { id: 'web-test', controller: new AbortController(), toolRequestIds: new Set(), workspaceBaseline: [] };
    const state = { activeRun: run, messages: [{ role: 'user', content: 'Read the public reference.' }], archivedTurnCount: 0,
        archivedSkillIds: delegateSteps.length ? ['builtin-planning'] : [] };
    const requests = [], saved = [];
    let requestId = 0;
    const queues = { main: [...steps], delegate: [...delegateSteps] };
    const runtime = createAssistantRuntime({
        state, TOOL_NAMES, pendingToolCalls: new Map(), pendingApprovals: new Map(),
        render() {}, persistSession() { saved.push(JSON.parse(JSON.stringify(state.messages))); },
        createRequestId: () => `request-${++requestId}`, safeJsonParse: JSON.parse, describeError: error => error.message,
        formatToolResultDisplay, normalizeAttachments: () => [], normalizeThoughtBlocks: () => [],
        buildUserContentParts: message => message.content,
        getActiveProviderConfig: () => config, getDelegateProviderConfig: () => delegateConfig,
        getToolDefinitions: ({ role, skillIds }) => getAssistantToolDefinitions({ providerConfig: role === 'delegate' ? delegateConfig : config, jsApiEnabled, role, skillIds }),
        isJsApiEnabled: () => jsApiEnabled,
        SYSTEM_PROMPT: '', MAX_CONTEXT_TOKENS: 100000, SUMMARY_TRIGGER_TOKENS: 90000,
        REQUEST_TIMEOUT_MS: 1000,
        isAbortError: error => error.name === 'AbortError' || error.message === 'assistant_aborted',
        createAdapter: providerConfig => {
            const role = providerConfig === delegateConfig ? 'delegate' : 'main';
            return { supportsSessionToolLoop: session, async chat(task) {
                requests.push({ role, tools: task.tools, messages: structuredClone(task.messages || []), toolResponses: structuredClone(task.toolResponses || []) });
                assert.ok(queues[role].length, 'Unexpected model retry');
                const step = queues[role].shift();
                return typeof step === 'function' ? step(task) : step;
            } };
        },
        post() { assert.fail('Web tools must not dispatch to the workspace host'); },
    });
    return { run, state, requests, saved, runtime, queues, start: () => runtime.runAssistantLoop(run) };
}

test('both web definitions share the existing contracts and respect the selected channel and JS permission independently', () => {
    const expected = [getWebSearchToolDefinition(), getWebFetchToolDefinition()];
    for (const provider of ['tavily', 'exa']) {
        for (const jsApiEnabled of [true, false]) {
            for (const configured of [true, false]) {
                const providerConfig = { ...settings(provider, configured ? 'fixture-only' : ''),
                    [`${provider === 'tavily' ? 'exa' : 'tavily'}ApiKey`]: 'other-channel-only' };
                const tools = getAssistantToolDefinitions({ providerConfig, jsApiEnabled });
                const contracts = definitions => definitions.map(({ function: { name, parameters } }) => ({ name, parameters }));
                assert.deepEqual(contracts(tools.filter(tool => expected.some(item => item.function.name === tool.function.name))), configured ? contracts(expected) : []);
                assert.equal(tools.some(tool => tool.function.name === TOOL_NAMES.RUN_JAVASCRIPT_API), jsApiEnabled);
                assert.equal(tools.some(tool => tool.function.name === TOOL_NAMES.WRITE), true);
            }
        }
    }
});

// 验收：用户禁止 JS 时，即使模型沿用旧工具调用也不派发执行；代价：越权执行。
test('disabled JavaScript API stays blocked even if a model submits the tool call', async t => {
    const harness = runtimeHarness(t, { steps: [call(TOOL_NAMES.RUN_JAVASCRIPT_API, { code: 'return 1;' }), done] });
    await harness.start();
    const receipt = harness.requests.at(-1).messages.find(message => message.role === 'tool');
    assert.equal(JSON.parse(receipt.content).error, 'jsapi_permission_denied');
    assert.equal(harness.requests.every(request => !request.tools.some(tool => tool.function.name === TOOL_NAMES.RUN_JAVASCRIPT_API)), true);
});

for (const provider of ['tavily', 'exa']) {
    for (const role of ['main', 'delegate']) {
        test(`${role}: ${provider} search then fetch delivers complete sources to the next model round`, async t => {
            const config = settings(provider, `${role}-fixture-secret`), network = [];
            t.mock.method(globalThis, 'fetch', async (url, options) => {
                network.push(url);
                const body = JSON.parse(options.body);
                if (url.endsWith('/search')) {
                    assert.equal(body.query, 'reference');
                    if (provider === 'tavily') assert.equal(body.api_key, config.tavilyApiKey);
                    else assert.equal(options.headers['x-api-key'], config.exaApiKey);
                    return Response.json({ results: [{ title: 'Guide', url: urls[0], content: 'Excerpt', highlights: ['Excerpt'] }] });
                }
                assert.deepEqual(body.urls, [urls[0]]);
                if (provider === 'tavily') assert.equal(options.headers.Authorization, `Bearer ${config.tavilyApiKey}`);
                else assert.equal(options.headers['x-api-key'], config.exaApiKey);
                return Response.json({ results: [{ url: urls[0], title: 'Guide', raw_content: text, text }],
                    statuses: [{ id: urls[0], status: 'success' }] });
            });
            const steps = [call(TOOL_NAMES.WEB_SEARCH, { query: 'reference' }), call(TOOL_NAMES.WEB_FETCH, { urls: [urls[0]] }), done];
            const harness = runtimeHarness(t, role === 'main' ? { config, steps } : {
                config: settings('tavily', 'main-only'), delegateConfig: config,
                steps: [call(TOOL_NAMES.DELEGATE_RUN, { task: 'Read the reference' }), done], delegateSteps: steps,
            });
            await harness.start();
            const request = harness.requests.filter(item => item.role === role).at(-1);
            assert.ok(request.tools.some(tool => tool.function.name === TOOL_NAMES.WEB_FETCH));
            const receipt = request.messages.find(message => message.role === 'tool' && message.tool_call_id === TOOL_NAMES.WEB_FETCH);
            const result = JSON.parse(receipt.content);
            assert.deepEqual(result.results, [{ url: urls[0], title: 'Guide', text }]);
            assert.equal(result.ok, true);
            assert.equal(result.provider, provider);
            assert.equal(network.length, 2);
            assert.ok(harness.saved.length);
            if (role === 'main') assert.ok(harness.saved.at(-1).some(message => message.content === receipt.content));
            else assert.equal(JSON.parse(harness.state.messages.find(message => message.role === 'tool').content).ok, true);
        });
    }

    test(`${provider}: partial and total extraction failure retain evidence without retry or false success`, async t => {
        for (const partial of [true, false]) {
            let calls = 0;
            t.mock.method(globalThis, 'fetch', async () => {
                calls++;
                const failed = partial ? urls.slice(1) : urls;
                return Response.json({
                    results: partial ? [{ url: urls[0], title: 'Guide', raw_content: text, text }] : [],
                    failed_results: failed.map(url => ({ url, error: 'not found' })),
                    statuses: [...(partial ? [{ id: urls[0], status: 'success' }] : []),
                        ...failed.map(url => ({ id: url, status: 'error', error: { tag: 'not_found', httpStatusCode: 404 } }))],
                });
            });
            const harness = runtimeHarness(t, { config: settings(provider), steps: [call(TOOL_NAMES.WEB_FETCH, { urls }), done] });
            await harness.start();
            const message = harness.state.messages.find(item => item.role === 'tool');
            const result = JSON.parse(message.content);
            assert.equal(result.ok, false);
            assert.equal(result.error, 'web_extract_failed');
            assert.deepEqual(result.failedUrls, partial ? urls.slice(1) : urls);
            assert.equal(result.results.length, partial ? 1 : 0);
            assert.equal(toolOutcome(result, TOOL_NAMES.WEB_FETCH).status, partial ? 'partial' : 'failed');
            const display = formatToolResultDisplay(message);
            if (partial) {
                assert.ok(display.details.includes(text));
                assert.ok(display.details.includes(urls[0]));
            }
            assert.ok(display.details.includes(urls[1]));
            assert.ok(display.details.includes(result.failures[0].code));
            assert.equal(calls, 1);
        }
    });
}

test('provider failure preserves diagnostics, redacts credentials and does not retry', async t => {
    let calls = 0;
    t.mock.method(globalThis, 'fetch', async () => { calls++; return new Response('denied fixture-secret', { status: 401 }); });
    const harness = runtimeHarness(t, { steps: [call(TOOL_NAMES.WEB_FETCH, { urls }), done] });
    await harness.start();
    const message = harness.state.messages.find(item => item.role === 'tool');
    const result = JSON.parse(message.content);
    assert.equal(result.httpStatus, 401);
    assert.equal(result.error, 'web_http_failed');
    assert.equal(JSON.stringify(harness.state.messages).includes('fixture-secret'), false);
    assert.equal(toolOutcome(result, TOOL_NAMES.WEB_FETCH).status, 'failed');
    assert.equal(calls, 1);
});

test('unconfigured channels and invalid page targets cannot send a request', async t => {
    t.mock.method(globalThis, 'fetch', () => assert.fail('Rejected web call reached the network'));
    for (const [config, targets, expected] of [
        [settings('tavily', ''), urls, 'web_search_not_configured'],
        [settings('exa', ''), urls, 'web_search_not_configured'],
        [settings('tavily'), ['http://127.0.0.1/private'], 'web_url_invalid'],
        [settings('exa'), ['https://user:password@example.com/'], 'web_url_invalid'],
        [settings('tavily'), [], 'web_url_limit'],
    ]) {
        const harness = runtimeHarness(t, { config, steps: [call(TOOL_NAMES.WEB_FETCH, { urls: targets }), done] });
        await harness.start();
        const result = JSON.parse(harness.state.messages.find(message => message.role === 'tool').content);
        assert.equal(result.error, expected);
        assert.equal(result.ok, false);
    }
});

for (const name of [TOOL_NAMES.WEB_SEARCH, TOOL_NAMES.WEB_FETCH]) {
    test(`cancelling ${name} aborts the single request and leaves subsequent calls unexecuted`, async t => {
        let started, calls = 0, requestSignal;
        const ready = new Promise(resolve => { started = resolve; });
        t.mock.method(globalThis, 'fetch', (_url, { signal }) => {
            calls++;
            requestSignal = signal;
            started();
            return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true }));
        });
        const step = call(name, name === TOOL_NAMES.WEB_SEARCH ? { query: 'reference' } : { urls });
        step.toolCalls.push({ ...step.toolCalls[0], id: 'second' });
        const harness = runtimeHarness(t, { steps: [step] });
        const pending = harness.start();
        await ready;
        const [first, second] = harness.state.messages.at(-1).toolCalls;
        harness.runtime.cancelActiveRun();
        await assert.rejects(pending, { name: 'AbortError' });
        assert.equal(requestSignal.aborted, true);
        assert.equal(harness.runtime.getToolActivity(first), 'stopped');
        assert.equal(harness.runtime.getToolActivity(second), 'not-executed');
        assert.equal(harness.state.messages.some(message => message.role === 'tool'), false);
        assert.equal(calls, 1);
    });
}

// 验收：长网页只分批进入模型和会话，续读不得重新联网；代价：上下文超限、重复计费。
// 验收：结果引用只在所属主运行或委托内有效，跨运行和委托不能串读；代价：证据串用。
function latestToolResult(task) {
    return task.toolResponses?.at(-1)?.response
        ?? JSON.parse(task.messages.filter(message => message.role === 'tool').at(-1).content);
}

for (const role of ['main', 'delegate']) {
    for (const session of [false, true]) {
        test(`${role}: large web evidence stays paged in ${session ? 'session' : 'replay'} tool loops without a paid reread`, async t => {
            const provider = session ? 'exa' : 'tavily';
            const body = 'Public reference: alpha beta gamma delta epsilon 12345.\n'.repeat(26000) + 'END_OF_REFERENCE';
            let network = 0, reference;
            t.mock.method(globalThis, 'fetch', async () => {
                network++;
                return Response.json({ results: [{ url: urls[0], title: 'Guide', [session ? 'text' : 'raw_content']: body }],
                    statuses: [{ id: urls[0], status: 'success' }] });
            });
            const steps = [call(TOOL_NAMES.WEB_FETCH, { urls: [urls[0]] }), task => {
                const receipt = latestToolResult(task);
                assert.equal(receipt.ok, true);
                assert.ok(receipt.data.totalChars > 1_000_000);
                assert.ok(receipt.data.text.length <= TOOL_RESULT_PAGE_CHARS);
                assert.ok(receipt.data.nextOffset > 0);
                assert.equal(receipt.data.text.includes('END_OF_REFERENCE'), false);
                reference = receipt.data.reference;
                return call(TOOL_NAMES.TOOL_RESULT_READ, { reference, offset: receipt.data.totalChars - 100 });
            }, task => {
                const receipt = latestToolResult(task);
                assert.equal(receipt.data.reference, reference);
                assert.equal(receipt.data.nextOffset, null);
                assert.ok(receipt.data.text.includes('END_OF_REFERENCE'));
                return done;
            }];
            const config = settings(provider);
            const harness = runtimeHarness(t, role === 'main' ? { config, steps, session } : {
                delegateConfig: config, session, steps: [call(TOOL_NAMES.DELEGATE_RUN, { task: 'Read the reference' }), done], delegateSteps: steps,
            });
            await harness.start();
            assert.equal(network, 1);
            for (const request of harness.requests) {
                const messages = [...request.messages, ...request.toolResponses.map(item => ({ role: 'tool', content: JSON.stringify(item.response) }))];
                assert.ok(estimateConversationTokens({ messages, tools: request.tools, providerConfig: config }) < 30000);
            }
            assert.ok(JSON.stringify(harness.saved).length < body.length);
            if (role === 'main') {
                harness.state.messages.push({ role: 'user', content: 'Continue the old result.' });
                harness.queues.main.push(call(TOOL_NAMES.TOOL_RESULT_READ, { reference }), task => {
                    assert.equal(latestToolResult(task).error, 'tool_result_expired');
                    return done;
                });
                await harness.start();
                assert.equal(network, 1);
            }
        });
    }
}

test('main and successive delegates own distinct result references while the main result remains readable', async t => {
    const body = 'Reference facts. '.repeat(3000);
    let network = 0, mainReference, delegateReference;
    t.mock.method(globalThis, 'fetch', async () => {
        network++;
        return Response.json({ results: [{ url: urls[0], raw_content: body, text: body }], statuses: [{ id: urls[0], status: 'success' }] });
    });
    const delegate = call(TOOL_NAMES.DELEGATE_RUN, { task: 'Read this reference' });
    const harness = runtimeHarness(t, {
        steps: [call(TOOL_NAMES.WEB_FETCH, { urls: [urls[0]] }), task => {
            mainReference = latestToolResult(task).data.reference;
            return delegate;
        }, () => call(TOOL_NAMES.TOOL_RESULT_READ, { reference: delegateReference }), task => {
            assert.equal(latestToolResult(task).error, 'tool_result_expired');
            return delegate;
        }, () => call(TOOL_NAMES.TOOL_RESULT_READ, { reference: mainReference }), task => {
            assert.equal(latestToolResult(task).data.reference, mainReference);
            return done;
        }],
        delegateSteps: [call(TOOL_NAMES.WEB_FETCH, { urls: [urls[0]] }), task => {
            delegateReference = latestToolResult(task).data.reference;
            assert.notEqual(delegateReference, mainReference);
            return done;
        }, () => call(TOOL_NAMES.TOOL_RESULT_READ, { reference: delegateReference }), task => {
            assert.equal(latestToolResult(task).error, 'tool_result_expired');
            return call(TOOL_NAMES.TOOL_RESULT_READ, { reference: mainReference });
        }, task => {
            assert.equal(latestToolResult(task).error, 'tool_result_expired');
            return done;
        }],
    });
    await harness.start();
    assert.equal(network, 2);
});

test('paged partial extraction retains failure status and reconstructs all evidence through free continuations', async t => {
    const body = '网页正文😀'.repeat(5000);
    let network = 0, restored = '';
    t.mock.method(globalThis, 'fetch', async () => {
        network++;
        return Response.json({ results: [{ url: urls[0], raw_content: body }], failed_results: [{ url: urls[1], error: 'not found' }] });
    });
    const follow = task => {
        const receipt = latestToolResult(task);
        if (!restored) {
            assert.equal(toolOutcome(receipt, TOOL_NAMES.WEB_FETCH).status, 'partial');
            assert.equal(receipt.error, 'web_extract_failed');
        }
        restored += receipt.data.text;
        if (receipt.data.nextOffset === null) return done;
        return call(TOOL_NAMES.TOOL_RESULT_READ, { reference: receipt.data.reference, offset: receipt.data.nextOffset });
    };
    const harness = runtimeHarness(t, { steps: [call(TOOL_NAMES.WEB_FETCH, { urls }), follow, follow, follow, follow] });
    await harness.start();
    const complete = JSON.parse(restored);
    assert.equal(complete.results[0].text, body);
    assert.equal(complete.ok, false);
    assert.deepEqual(complete.failedUrls, [urls[1]]);
    assert.equal(network, 1);
});
