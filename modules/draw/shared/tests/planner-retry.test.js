import test from 'node:test';
import assert from 'node:assert/strict';

import {
    DEFAULT_PLANNER_MAX_RETRIES,
    DEFAULT_PLANNER_RETRY_BASE_DELAY_MS,
    MAX_PLANNER_MAX_RETRIES,
    PLANNER_RETRY_MAX_DELAY_MS,
    computePlannerRetryDelay,
    isRetryablePlannerError,
    normalizePlannerRetry,
    sleepWithAbort,
} from '../planner-retry.js';
import { ScenePlannerError } from '../scene-plan-contract.js';
import { logDrawRunPlannerDiagnostics, resetDrawRunPlannerFailureLogsForTests } from '../draw-run-debug.js';
import { createSceneSource } from '../scene-source.js';
import { createSubmitScenePlanTool } from '../scene-plan-tool.js';
import { executePreparedScenePlanner } from '../scene-planner-executor.js';
import { prepareScenePlannerInput } from '../scene-planner.js';
import { getLastDrawAgentDiagnostic, resetDrawAgentRuntimeForTests } from '../draw-agent-runtime.js';
import { formatPlannerRetryProgress, formatScenePlannerProgress, toScenePlannerProgress } from '../draw-capsule-copy.js';
import { formatDrawRunProgress } from '../draw-run-ui-state.js';

// ───────────── 纯函数 ─────────────

test('normalizePlannerRetry applies defaults, clamps and keeps zero', () => {
    assert.deepEqual(normalizePlannerRetry(undefined), {
        maxRetries: DEFAULT_PLANNER_MAX_RETRIES,
        baseDelayMs: DEFAULT_PLANNER_RETRY_BASE_DELAY_MS,
    });
    assert.equal(DEFAULT_PLANNER_MAX_RETRIES, 3);
    assert.equal(DEFAULT_PLANNER_RETRY_BASE_DELAY_MS, 2000);
    assert.equal(normalizePlannerRetry({ maxRetries: 0 }).maxRetries, 0);
    assert.equal(normalizePlannerRetry({ maxRetries: 7.9 }).maxRetries, 7);
    assert.equal(normalizePlannerRetry({ maxRetries: 99 }).maxRetries, MAX_PLANNER_MAX_RETRIES);
    assert.equal(normalizePlannerRetry({ maxRetries: -1 }).maxRetries, DEFAULT_PLANNER_MAX_RETRIES);
    assert.equal(normalizePlannerRetry({ maxRetries: 'abc' }).maxRetries, DEFAULT_PLANNER_MAX_RETRIES);
    assert.equal(normalizePlannerRetry({ baseDelayMs: 500 }).baseDelayMs, 500);
    assert.equal(normalizePlannerRetry({ baseDelayMs: 0 }).baseDelayMs, DEFAULT_PLANNER_RETRY_BASE_DELAY_MS);
    assert.equal(normalizePlannerRetry({ baseDelayMs: 999999 }).baseDelayMs, PLANNER_RETRY_MAX_DELAY_MS);
    assert.deepEqual(normalizePlannerRetry([1, 2]), normalizePlannerRetry(undefined));
});

test('normalizePlannerRetry treats null, empty string, booleans and NaN as not provided, never as zero retries', () => {
    // Number(null) / Number('') / Number(false) 都是 0，曾经会静默关闭重试。
    for (const missing of [undefined, null, '', '   ', false, true, NaN, 'abc', {}, [], Infinity]) {
        assert.equal(normalizePlannerRetry({ maxRetries: missing }).maxRetries, DEFAULT_PLANNER_MAX_RETRIES, String(missing));
        assert.equal(normalizePlannerRetry({ baseDelayMs: missing }).baseDelayMs, DEFAULT_PLANNER_RETRY_BASE_DELAY_MS, String(missing));
    }
    assert.equal(normalizePlannerRetry(null).maxRetries, DEFAULT_PLANNER_MAX_RETRIES);
    // 显式的 0 仍然表示不重试。
    assert.equal(normalizePlannerRetry({ maxRetries: 0 }).maxRetries, 0);
    assert.equal(normalizePlannerRetry({ maxRetries: '0' }).maxRetries, 0);
    assert.equal(normalizePlannerRetry({ maxRetries: -0 }).maxRetries, 0);
    // 可解析的非空字符串按数字处理。
    assert.equal(normalizePlannerRetry({ maxRetries: '3' }).maxRetries, 3);
    assert.equal(normalizePlannerRetry({ maxRetries: ' 5 ' }).maxRetries, 5);
    assert.equal(normalizePlannerRetry({ maxRetries: '99' }).maxRetries, MAX_PLANNER_MAX_RETRIES);
    assert.equal(normalizePlannerRetry({ maxRetries: '-2' }).maxRetries, DEFAULT_PLANNER_MAX_RETRIES);
    assert.equal(normalizePlannerRetry({ baseDelayMs: '750' }).baseDelayMs, 750);
    assert.equal(normalizePlannerRetry({ baseDelayMs: '0' }).baseDelayMs, DEFAULT_PLANNER_RETRY_BASE_DELAY_MS);
    // 设置页保存的值经过 JSON 往返后常见的形态。
    assert.deepEqual(JSON.parse(JSON.stringify(normalizePlannerRetry({ maxRetries: null, baseDelayMs: null }))), {
        maxRetries: DEFAULT_PLANNER_MAX_RETRIES,
        baseDelayMs: DEFAULT_PLANNER_RETRY_BASE_DELAY_MS,
    });
});

test('computePlannerRetryDelay doubles each time, caps at 30s and jitters within ±20%', () => {
    const mid = () => 0.5; // 抖动系数恰为 1.0
    const config = { baseDelayMs: 2000 };
    assert.deepEqual([1, 2, 3, 4, 5].map(n => computePlannerRetryDelay(n, config, mid)), [2000, 4000, 8000, 16000, 30000]);
    assert.equal(computePlannerRetryDelay(10, config, mid), PLANNER_RETRY_MAX_DELAY_MS);
    assert.equal(computePlannerRetryDelay(1, config, () => 0), 1600);
    assert.equal(computePlannerRetryDelay(1, config, () => 1), 2400);
    assert.equal(computePlannerRetryDelay(0, config, mid), 2000);
});

test('isRetryablePlannerError retries agent failures but not cancellation, config or client errors', () => {
    const coded = code => new ScenePlannerError('x', code);
    for (const code of ['REQUEST_TIMEOUT', 'PROVIDER_REQUEST_FAILED', 'DSML_TOOL_CALL_INVALID',
        'TAGGED_TOOL_CALL_INVALID', 'TOOL_CALL_MISSING', 'TOOL_ARGUMENTS_SCHEMA_INVALID', 'INSERT_POINT_INVALID']) {
        assert.equal(isRetryablePlannerError(coded(code)), true, code);
    }
    for (const code of ['REQUEST_ABORTED', 'MODEL_MISSING', 'AGENT_PRESET_INVALID', 'AGENT_CORE_LOAD_FAILED',
        'AGENT_CONTEXT_REQUIRED', 'EMPTY_MESSAGE', 'NO_INSERT_POINTS', 'IMAGE_LIMIT_EXCEEDED', 'PROMPT_EXPANSION_FAILED',
        'PREPARED_INPUT_INVALID', 'TOOL_CONTRACT_INVALID']) {
        assert.equal(isRetryablePlannerError(coded(code)), false, code);
    }
    const abort = new Error('x');
    abort.name = 'AbortError';
    assert.equal(isRetryablePlannerError(abort), false);
    assert.equal(isRetryablePlannerError(new TypeError('network down')), true);
    assert.equal(isRetryablePlannerError(null), false);
    for (const status of [400, 401, 403, 404, 422]) {
        const error = new ScenePlannerError('x', 'PROVIDER_REQUEST_FAILED', null, { cause: Object.assign(new Error('http'), { status }) });
        assert.equal(isRetryablePlannerError(error), false, `status ${status}`);
    }
    for (const status of [408, 429, 500, 502, 503, 529]) {
        const error = new ScenePlannerError('x', 'PROVIDER_REQUEST_FAILED', null, { cause: Object.assign(new Error('http'), { status }) });
        assert.equal(isRetryablePlannerError(error), true, `status ${status}`);
    }
});

test('isRetryablePlannerError reads the HTTP status from every place the adapters and wrappers put it', () => {
    const wrap = cause => new ScenePlannerError('x', 'PROVIDER_REQUEST_FAILED', null, { cause });
    // 适配器：宿主 Client / openai-compatible 手写 fetch / OpenAI、Anthropic、Google SDK 都直接设置 error.status，
    // 运行时包成 ScenePlannerError 后原错误在 cause；其它库常见 statusCode / response.status。
    const shapes = {
        'error.status': status => Object.assign(new Error('http'), { status }),
        'error.statusCode': status => Object.assign(new Error('http'), { statusCode: status }),
        'error.response.status': status => Object.assign(new Error('http'), { response: { status } }),
        'error.details.status': status => Object.assign(new Error('http'), { details: { status } }),
        'status as numeric string': status => Object.assign(new Error('http'), { status: String(status) }),
    };
    for (const [label, make] of Object.entries(shapes)) {
        for (const status of [400, 401, 403, 404, 405, 413, 422]) {
            assert.equal(isRetryablePlannerError(make(status)), false, `${label} ${status} (direct)`);
            assert.equal(isRetryablePlannerError(wrap(make(status))), false, `${label} ${status} (as cause)`);
        }
        for (const status of [408, 429, 500, 503]) {
            assert.equal(isRetryablePlannerError(wrap(make(status))), true, `${label} ${status} (as cause)`);
        }
    }
    // 多层 cause 也要找得到。
    const deep = wrap(wrap(Object.assign(new Error('http'), { status: 401 })));
    assert.equal(isRetryablePlannerError(deep), false);
    // 不是状态码的值不能被误认：布尔、空串、超范围数字。
    for (const junk of [true, '', null, 0, 99, 600, [401], {}]) {
        assert.equal(isRetryablePlannerError(Object.assign(new Error('x'), { status: junk })), true, String(junk));
    }
    // 循环引用的 cause 链不会死循环。
    const loop = new Error('loop');
    loop.cause = loop;
    assert.equal(isRetryablePlannerError(loop), true);
});

test('sleepWithAbort resolves after the delay and rejects immediately on abort', async () => {
    await sleepWithAbort(5, undefined);
    const controller = new AbortController();
    const pending = sleepWithAbort(10_000, controller.signal);
    controller.abort();
    await assert.rejects(pending, error => error.name === 'AbortError' && error.code === 'REQUEST_ABORTED');
    const already = new AbortController();
    already.abort();
    await assert.rejects(sleepWithAbort(5, already.signal), error => error.name === 'AbortError');
});

// ───────────── 执行器 ─────────────

function buildPrepared(retry, providerConfig = null) {
    const sceneSource = createSceneSource('The hero smiled. Then she left.');
    return {
        version: 1,
        planner: {
            prompt: { systemPrompt: 's', messages: [{ role: 'user', content: 'u' }] },
            tool: createSubmitScenePlanTool({ maxImages: 1, insertPointCount: sceneSource.points.length }),
            validationContext: {
                sceneSource,
                effectiveMaxImages: 1,
                maxPlanImages: 1,
                effectiveMaxCharactersPerImage: 0,
                centerMode: 'grid',
            },
            presentCharacters: [],
            ...(retry ? { retry } : {}),
        },
        agent: { channel: '', providerConfig },
    };
}

const VALID_RESULT = {
    result: {
        toolCalls: [{ name: 'submit_scene_plan', arguments: { images: [{ index: 1, insert_after: 1, scene: 'smile', characters: [] }] } }],
    },
    providerConfig: { provider: 'test', model: 'm' },
};

function scriptedCaller(steps) {
    const calls = [];
    const caller = async (request) => {
        calls.push(request);
        const step = steps[calls.length - 1] ?? steps.at(-1);
        if (step instanceof Error || step?.code) throw step;
        return step;
    };
    caller.calls = calls;
    return caller;
}

const failure = (code = 'PROVIDER_REQUEST_FAILED', extra = {}) => Object.assign(new ScenePlannerError('boom', code), extra);

test('executor retries a failed agent request with exponential backoff and then succeeds', async () => {
    const caller = scriptedCaller([failure(), failure('REQUEST_TIMEOUT'), VALID_RESULT]);
    const sleeps = [];
    const snapshots = [];
    const tasks = await executePreparedScenePlanner(buildPrepared({ maxRetries: 3, baseDelayMs: 100 }), {
        agentCaller: caller,
        sleep: async (ms) => { sleeps.push(ms); },
        random: () => 0.5,
        onDiagnosticUpdate: snapshot => snapshots.push(snapshot),
    });
    assert.equal(tasks.length, 1);
    assert.equal(caller.calls.length, 3);
    assert.deepEqual(sleeps, [100, 200]);
    // 假的 agentCaller 不经过真实运行时的 diagnostic.fail，这里只验证重试进度快照本身；
    // “失败后诊断由 error 改回 running”见下面使用真实运行时的用例。
    const waiting = snapshots.filter(snapshot => snapshot.stage === 'retry');
    assert.equal(waiting.length, 2);
    assert.ok(waiting.every(snapshot => snapshot.status === 'running' && snapshot.errorCode === '' && snapshot.stage === 'retry'));
    assert.deepEqual(waiting.map(snapshot => snapshot.progress.current), [1, 2]);
    assert.deepEqual(waiting.map(snapshot => snapshot.retryCount), [1, 2]);
    assert.equal(getLastDrawAgentDiagnostic().status, 'success');
});

test('executor gives up after maxRetries and reports the last error with how many retries were made', async (t) => {
    const logs = [];
    t.mock.method(console, 'log', (...args) => { logs.push(args); });
    const caller = scriptedCaller([failure()]);
    const sleeps = [];
    await assert.rejects(() => executePreparedScenePlanner(buildPrepared({ maxRetries: 2, baseDelayMs: 50 }), {
        agentCaller: caller,
        sleep: async (ms) => { sleeps.push(ms); },
        random: () => 0.5,
    }), (error) => {
        assert.equal(error.code, 'PROVIDER_REQUEST_FAILED', '错误码不变');
        assert.equal(error.message, 'boom（已自动重试 2 次）');
        assert.equal(error.details.retryCount, 2);
        return true;
    });
    assert.equal(caller.calls.length, 3);
    assert.deepEqual(sleeps, [50, 100]);
    const diagnostic = getLastDrawAgentDiagnostic();
    assert.equal(diagnostic.status, 'error');
    assert.equal(diagnostic.errorCode, 'PROVIDER_REQUEST_FAILED');
    assert.equal(diagnostic.errorMessage, 'boom（已自动重试 2 次）');
    assert.equal(diagnostic.retryCount, 2);
    // 重试日志直接写 console（F12 默认可见），不依赖默认关闭的 xbLog。
    const retryLogs = logs.filter(args => String(args[0]).startsWith('[Scene Planner] 请求失败，第'));
    assert.equal(retryLogs.length, 2);
    assert.match(retryLogs[0][0], /第 1\/2 次重试.*50ms/);
    assert.equal(retryLogs[1][1].retry, 2);
    assert.equal(retryLogs[1][1].maxRetries, 2);
    assert.equal(retryLogs[1][1].errorCode, 'PROVIDER_REQUEST_FAILED');
    assert.equal(retryLogs[1][1].requestId, diagnostic.id);
});

test('executor does not retry non-retryable failures', async () => {
    for (const error of [failure('MODEL_MISSING'), failure('REQUEST_ABORTED'),
        failure('PROVIDER_REQUEST_FAILED', { cause: Object.assign(new Error('401'), { status: 401 }) })]) {
        const caller = scriptedCaller([error]);
        const sleeps = [];
        await assert.rejects(() => executePreparedScenePlanner(buildPrepared({ maxRetries: 3, baseDelayMs: 50 }), {
            agentCaller: caller,
            sleep: async (ms) => { sleeps.push(ms); },
        }), caught => caught === error);
        assert.equal(caller.calls.length, 1);
        assert.deepEqual(sleeps, []);
        assert.ok(!error.message.includes('已自动重试'), '没重试过就不加次数');
        assert.ok(!error.details?.retryCount);
    }
});

test('executor does not retry when no retry setting is frozen or when maxRetries is 0', async () => {
    for (const retry of [undefined, { maxRetries: 0 }]) {
        const caller = scriptedCaller([failure()]);
        await assert.rejects(() => executePreparedScenePlanner(buildPrepared(retry), {
            agentCaller: caller,
            sleep: async () => assert.fail('must not sleep'),
        }), error => error.code === 'PROVIDER_REQUEST_FAILED');
        assert.equal(caller.calls.length, 1);
    }
});

test('executor stops waiting when the user cancels during backoff', async () => {
    const controller = new AbortController();
    const caller = scriptedCaller([failure()]);
    await assert.rejects(() => executePreparedScenePlanner(buildPrepared({ maxRetries: 3, baseDelayMs: 10_000 }), {
        agentCaller: caller,
        signal: controller.signal,
        random: () => 0.5,
        sleep: (ms, signal) => {
            queueMicrotask(() => controller.abort());
            return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true }));
        },
    }), error => error.code === 'REQUEST_ABORTED');
    assert.equal(caller.calls.length, 1);
    assert.equal(getLastDrawAgentDiagnostic().status, 'error');
});

test('executor does not start a retry when already cancelled', async () => {
    const controller = new AbortController();
    const caller = async () => { controller.abort(); throw failure(); };
    await assert.rejects(() => executePreparedScenePlanner(buildPrepared({ maxRetries: 3, baseDelayMs: 50 }), {
        agentCaller: caller,
        signal: controller.signal,
        sleep: async () => assert.fail('must not sleep'),
    }), error => error.code === 'PROVIDER_REQUEST_FAILED');
});

test('prepared snapshot freezes the retry setting only when one is provided, normalized', async () => {
    const base = {
        messageText: 'The hero smiled. Then she left.',
        maxImages: 1,
        expansionOptions: { runtime: { substituteParams: text => text } },
        agentCaller: async () => {},
    };
    const without = await prepareScenePlannerInput(base);
    assert.equal(Object.hasOwn(without.planner, 'retry'), false);
    const withRetry = await prepareScenePlannerInput({ ...base, plannerRetry: { maxRetries: 5 } });
    assert.deepEqual(withRetry.planner.retry, { maxRetries: 5, baseDelayMs: DEFAULT_PLANNER_RETRY_BASE_DELAY_MS });
    const clamped = await prepareScenePlannerInput({ ...base, plannerRetry: { maxRetries: 99 } });
    assert.equal(clamped.planner.retry.maxRetries, MAX_PLANNER_MAX_RETRIES);
    const zero = await prepareScenePlannerInput({ ...base, plannerRetry: { maxRetries: 0 } });
    assert.equal(zero.planner.retry.maxRetries, 0);
});

// ───────────── 真实 Agent 运行时 ─────────────

const RUNTIME_PROVIDER_CONFIG = Object.freeze({
    provider: 'test-provider',
    model: 'test-model',
    currentPresetName: '测试预设',
    toolMode: 'native',
    temperature: 0.5,
    maxTokens: 1000,
    reasoning: { mode: 'off', output: 'hide' },
});

const VALID_ADAPTER_REPLY = Object.freeze({
    toolCalls: [{
        id: 'plan-call',
        name: 'submit_scene_plan',
        arguments: JSON.stringify({ images: [{ index: 1, insert_after: 1, scene: 'smile', characters: [] }] }),
    }],
    finishReason: 'tool_calls',
});

/** 返回按顺序执行 steps 的假 adapter：Error 抛出，其它值作为回复。 */
function scriptedAdapterCore(steps) {
    const calls = [];
    return {
        calls,
        createAgentAdapter: () => ({
            chat: async (task) => {
                calls.push(task);
                const step = steps[calls.length - 1] ?? steps.at(-1);
                if (step instanceof Error) throw step;
                return structuredClone(step);
            },
        }),
    };
}

function quietConsole(t) {
    t.mock.method(console, 'log', () => {});
}

test('real runtime: a failed attempt is recorded as error, flips back to running while waiting to retry, then succeeds', async (t) => {
    quietConsole(t);
    resetDrawAgentRuntimeForTests();
    const core = scriptedAdapterCore([new TypeError('network down'), VALID_ADAPTER_REPLY]);
    const snapshots = [];
    const sleeps = [];
    const liveDuringWait = [];
    const tasks = await executePreparedScenePlanner(buildPrepared({ maxRetries: 2, baseDelayMs: 100 }, RUNTIME_PROVIDER_CONFIG), {
        agentCore: core,
        random: () => 0.5,
        sleep: async (ms) => {
            sleeps.push(ms);
            // 等待期间，界面读到的最新诊断必须是“重试中”，而不是上一次失败留下的 error。
            liveDuringWait.push(getLastDrawAgentDiagnostic());
        },
        onDiagnosticUpdate: snapshot => snapshots.push(snapshot),
    });
    assert.equal(tasks.length, 1);
    assert.equal(core.calls.length, 2);
    assert.deepEqual(sleeps, [100]);

    const errorIndex = snapshots.findIndex(snapshot => snapshot.status === 'error');
    const retryIndex = snapshots.findIndex(snapshot => snapshot.progress?.phase === 'retry');
    assert.ok(errorIndex >= 0, '真实运行时在失败时应记录 error');
    assert.equal(snapshots[errorIndex].errorCode, 'PROVIDER_REQUEST_FAILED');
    assert.equal(snapshots[errorIndex].terminationReason, 'provider_error');
    assert.ok(retryIndex > errorIndex, '重试等待快照应出现在失败记录之后');

    const retrySnapshot = snapshots[retryIndex];
    assert.equal(retrySnapshot.status, 'running');
    assert.equal(retrySnapshot.stage, 'retry');
    assert.equal(retrySnapshot.progress.phase, 'retry');
    assert.deepEqual([retrySnapshot.progress.current, retrySnapshot.progress.total], [1, 2]);
    assert.ok(!retrySnapshot.errorCode, 'errorCode 必须清空');
    assert.ok(!retrySnapshot.errorMessage, 'errorMessage 必须清空');
    assert.equal(retrySnapshot.terminationReason, '');

    // 等待开始之后不得再出现 error，直到成功。
    const afterRetry = snapshots.slice(retryIndex);
    assert.ok(afterRetry.every(snapshot => snapshot.status !== 'error'), JSON.stringify(afterRetry.map(snapshot => snapshot.status)));
    assert.equal(afterRetry.at(-1).status, 'success');
    // 只有重试之前出现过 error 快照：最后一次 error 一定早于重试快照。
    const lastErrorIndex = snapshots.map(snapshot => snapshot.status).lastIndexOf('error');
    assert.equal(lastErrorIndex, errorIndex);
    assert.ok(lastErrorIndex < retryIndex);

    // 重试请求进行期间一直显示“重试 1/2”，不会被运行时写回 analysis；成功之前每个快照都是 retry。
    const duringRetryRequest = afterRetry.filter(snapshot => snapshot.status !== 'success');
    assert.ok(duringRetryRequest.length > 1);
    assert.ok(duringRetryRequest.every(snapshot => snapshot.progress?.phase === 'retry' && snapshot.progress.current === 1 && snapshot.progress.total === 2),
        JSON.stringify(duringRetryRequest.map(snapshot => snapshot.progress)));

    assert.equal(liveDuringWait.length, 1);
    assert.equal(liveDuringWait[0].status, 'running');
    assert.equal(liveDuringWait[0].progress.phase, 'retry');
    assert.ok(!liveDuringWait[0].errorCode);
    assert.equal(getLastDrawAgentDiagnostic().status, 'success');
});

test('real runtime: attempts of failed rounds survive the retry, with unique attempt numbers and a retry index', async (t) => {
    quietConsole(t);
    resetDrawAgentRuntimeForTests();
    const core = scriptedAdapterCore([new TypeError('network down'), new TypeError('network down again'), VALID_ADAPTER_REPLY]);
    const snapshots = [];
    await executePreparedScenePlanner(buildPrepared({ maxRetries: 3, baseDelayMs: 100 }, RUNTIME_PROVIDER_CONFIG), {
        agentCore: core,
        random: () => 0.5,
        sleep: async () => {},
        onDiagnosticUpdate: snapshot => snapshots.push(snapshot),
    });
    assert.equal(core.calls.length, 3);
    // 第二轮开始之后，诊断里仍保留第一轮的失败记录（以前会被整体覆盖成只剩当前这一轮）。
    const final = getLastDrawAgentDiagnostic();
    assert.deepEqual(final.attempts.map(item => item.attempt), [1, 2, 3], 'attempt 号在整份诊断里唯一');
    assert.deepEqual(final.attempts.map(item => item.retry), [undefined, 1, 2]);
    assert.deepEqual(final.attempts.map(item => Boolean(item.errorCode)), [true, true, false]);
    // 等待重试期间（第二次失败之后、第三轮开始之前）也能看到前两轮的失败。
    const waiting = snapshots.filter(snapshot => snapshot.stage === 'retry').at(-1);
    assert.equal(waiting.attempts.length, 2);
    assert.ok(waiting.attempts.every(item => item.errorCode === 'PROVIDER_REQUEST_FAILED' || item.errorCode));
});

test('the retry wait reports which retry it is, and the display text carries it', () => {
    assert.deepEqual(toScenePlannerProgress({ progress: { phase: 'retry', current: 2, total: 3, delayMs: 400 } }), { phase: 'retry', retry: { current: 2, total: 3 } });
    assert.deepEqual(toScenePlannerProgress({ progress: { phase: 'retry' } }), { phase: 'retry' });
    assert.deepEqual(toScenePlannerProgress({ progress: { phase: 'retry', current: 0, total: 3 } }), { phase: 'retry' });
    assert.deepEqual(toScenePlannerProgress({ progress: { phase: 'correction', current: 2, total: 3 } }), { phase: 'correction' });
    assert.equal(formatScenePlannerProgress({ phase: 'retry', retry: { current: 2, total: 3 } }), '重2/3');
    // 楼层状态会把顶层 current/total 求和覆盖成图片张数：重试次数只认 retry 字段
    assert.equal(formatScenePlannerProgress({ phase: 'retry', retry: { current: 1, total: 3 }, current: 1, total: 4 }), '重1/3');
    assert.equal(formatScenePlannerProgress({ phase: 'retry', current: 1, total: 4 }), '重试', '没有 retry 字段时不拿顶层数字凑次数');
    assert.equal(formatScenePlannerProgress({ phase: 'retry' }), '重试');
    assert.equal(formatDrawRunProgress({ stage: 'retry', retry: { current: 1, total: 3 } }), '重1/3');
    assert.equal(formatDrawRunProgress({ run: { progress: { stage: 'retry', retry: { current: 3, total: 3 } } } }), '重3/3');
    assert.equal(formatDrawRunProgress({ stage: 'retry' }), '重试');
    assert.equal(formatPlannerRetryProgress(4, 3), '重试', '次数超过上限视为无效，退回无次数文案');
});

test('real runtime: cancelling while waiting to retry fails with REQUEST_ABORTED and never calls the agent again', async (t) => {
    quietConsole(t);
    resetDrawAgentRuntimeForTests();
    const controller = new AbortController();
    const core = scriptedAdapterCore([new TypeError('network down'), VALID_ADAPTER_REPLY]);
    const snapshots = [];
    let waited = 0;
    await assert.rejects(() => executePreparedScenePlanner(buildPrepared({ maxRetries: 3, baseDelayMs: 10_000 }, RUNTIME_PROVIDER_CONFIG), {
        agentCore: core,
        signal: controller.signal,
        random: () => 0.5,
        // 遵守 signal 的等待：真实 sleepWithAbort，在进入等待后立刻取消。
        sleep: (ms, signal) => {
            waited += 1;
            const pending = sleepWithAbort(ms, signal);
            queueMicrotask(() => controller.abort());
            return pending;
        },
        onDiagnosticUpdate: snapshot => snapshots.push(snapshot),
    }), error => error instanceof ScenePlannerError && error.code === 'REQUEST_ABORTED');
    assert.equal(waited, 1);
    assert.equal(core.calls.length, 1);
    const retrySeen = snapshots.some(snapshot => snapshot.progress?.phase === 'retry' && snapshot.status === 'running');
    assert.ok(retrySeen);
    const last = getLastDrawAgentDiagnostic();
    assert.equal(last.status, 'error');
    assert.equal(last.errorCode, 'REQUEST_ABORTED');
    assert.equal(last.terminationReason, 'abort');
    assert.equal(snapshots.at(-1).status, 'error');
});

test('real runtime: deterministic configuration and HTTP client errors are not retried', async (t) => {
    quietConsole(t);
    // 缺少 Provider 配置 / Agent Core：AGENT_CONTEXT_REQUIRED，重试结果一定相同。
    resetDrawAgentRuntimeForTests();
    let adapterCalls = 0;
    await assert.rejects(() => executePreparedScenePlanner(buildPrepared({ maxRetries: 3, baseDelayMs: 50 }, null), {
        sleep: async () => assert.fail('must not sleep'),
        agentCore: { createAgentAdapter: () => { adapterCalls += 1; return { chat: async () => VALID_ADAPTER_REPLY }; } },
    }), error => error.code === 'AGENT_CONTEXT_REQUIRED');
    assert.equal(adapterCalls, 0);

    // 适配器抛出的 HTTP 错误带 status（宿主 Client / SDK 的真实形态），经运行时包装后仍能识别为不可重试。
    for (const status of [401, 403, 404]) {
        resetDrawAgentRuntimeForTests();
        const core = scriptedAdapterCore([Object.assign(new Error(`HTTP ${status}`), { status })]);
        await assert.rejects(() => executePreparedScenePlanner(buildPrepared({ maxRetries: 3, baseDelayMs: 50 }, RUNTIME_PROVIDER_CONFIG), {
            agentCore: core,
            sleep: async () => assert.fail('must not sleep'),
        }), error => error.code === 'PROVIDER_REQUEST_FAILED');
        assert.equal(core.calls.length, 1, `status ${status}`);
    }

    // 429 / 503 仍然重试。
    resetDrawAgentRuntimeForTests();
    const retryable = scriptedAdapterCore([Object.assign(new Error('HTTP 503'), { status: 503 }), VALID_ADAPTER_REPLY]);
    const tasks = await executePreparedScenePlanner(buildPrepared({ maxRetries: 3, baseDelayMs: 50 }, RUNTIME_PROVIDER_CONFIG), {
        agentCore: retryable,
        sleep: async () => {},
    });
    assert.equal(tasks.length, 1);
    assert.equal(retryable.calls.length, 2);
});

test('real runtime: validation failures and corrections of failed rounds survive the retry with the same attempt numbering as attempts', async (t) => {
    quietConsole(t);
    resetDrawAgentRuntimeForTests();
    // 第 1 轮：第 1 次尝试校验失败（INSERT_POINT_INVALID）→ 纠错 → 第 2 次尝试网络失败（可重试）。
    // 第 2 轮：第 1 次尝试再次出现同一个校验失败 → 纠错 → 第 2 次尝试成功。
    const INVALID = { toolCalls: [{ id: 'bad', name: 'submit_scene_plan', arguments: JSON.stringify({ images: [{ index: 1, insert_after: 99, scene: 'smile', characters: [] }] }) }], finishReason: 'tool_calls' };
    // 最后一次回复少了根对象的右花括号：由参数修复补上，修复记录里的 attempt 也要用整份诊断里的编号。
    const UNCLOSED = { ...VALID_ADAPTER_REPLY, toolCalls: [{ ...VALID_ADAPTER_REPLY.toolCalls[0], arguments: VALID_ADAPTER_REPLY.toolCalls[0].arguments.slice(0, -1) }] };
    const core = scriptedAdapterCore([INVALID, new TypeError('network down'), INVALID, UNCLOSED]);
    const snapshots = [];
    const tasks = await executePreparedScenePlanner(buildPrepared({ maxRetries: 3, baseDelayMs: 100 }, RUNTIME_PROVIDER_CONFIG), {
        agentCore: core,
        random: () => 0.5,
        sleep: async () => {},
        onDiagnosticUpdate: snapshot => snapshots.push(snapshot),
    });
    assert.equal(tasks.length, 1);
    assert.equal(core.calls.length, 4);

    const final = getLastDrawAgentDiagnostic();
    assert.deepEqual(final.attempts.map(item => item.attempt), [1, 2, 3, 4]);
    // 两轮的校验失败都在，号码对得上 attempts（第 2 轮的第 1 次尝试 = 整份诊断里的第 3 次）。
    assert.deepEqual(final.validationFailures.map(item => [item.attempt, item.errorCode, item.retry]),
        [[1, 'INSERT_POINT_INVALID', undefined], [3, 'INSERT_POINT_INVALID', 1]]);
    assert.deepEqual(final.corrections.map(item => item.attempt), [1, 3]);
    assert.equal(final.argumentRepair.kind, 'missing_root_closer');
    assert.equal(final.argumentRepair.attempt, 4, '参数修复记录的 attempt 与 attempts 同一套编号');
    assert.equal(final.correctionCount, 2, 'correctionCount 与合并后的 corrections 一致');
    for (const record of [...final.validationFailures, ...final.corrections]) {
        assert.ok(final.attempts.some(item => item.attempt === record.attempt), `attempt ${record.attempt} 在 attempts 里有对应记录`);
    }
    // 重试等待期间（第 2 轮尚未开始）界面读到的也是第 1 轮的记录。
    const waiting = snapshots.find(snapshot => snapshot.stage === 'retry');
    assert.deepEqual(waiting.validationFailures.map(item => item.attempt), [1]);

    // 后台 Draw Run 的日志去重签名含 attempt：第 2 轮同类校验失败不能被第 1 轮的记录吞掉。
    resetDrawRunPlannerFailureLogsForTests();
    const entries = [];
    const logger = { log: (_prefix, details) => entries.push(details) };
    const run = { id: 'retry-debug-run', progress: { attempts: final.attempts, validationFailures: final.validationFailures } };
    assert.equal(logDrawRunPlannerDiagnostics(run, logger), 2);
    assert.equal(logDrawRunPlannerDiagnostics(run, logger), 0, '同一批记录再次到达不重复记录');
});

test('real runtime: feedbackSent of a retried round stays true when the round ends right after the correction (no later write of the array)', async (t) => {
    quietConsole(t);
    resetDrawAgentRuntimeForTests();
    // 运行时在 diagnostic.update 之后才把 failureRecord.feedbackSent 置 true；纠错后紧接着网络失败时再没有任何一次整数组写入，
    // 重试轮里的条目拷贝如果不跟着刷新，就会停在 false。
    const INVALID = { toolCalls: [{ id: 'bad', name: 'submit_scene_plan', arguments: JSON.stringify({ images: [{ index: 1, insert_after: 99, scene: 'smile', characters: [] }] }) }], finishReason: 'tool_calls' };
    const core = scriptedAdapterCore([INVALID, new TypeError('network down'), INVALID, new TypeError('network down again'), VALID_ADAPTER_REPLY]);
    const snapshots = [];
    await assert.rejects(executePreparedScenePlanner(buildPrepared({ maxRetries: 1, baseDelayMs: 100 }, RUNTIME_PROVIDER_CONFIG), {
        agentCore: core,
        random: () => 0.5,
        sleep: async () => {},
        onDiagnosticUpdate: snapshot => snapshots.push(snapshot),
    }));
    assert.equal(core.calls.length, 4, '重试用尽后不再请求');

    const final = getLastDrawAgentDiagnostic();
    assert.deepEqual(final.validationFailures.map(item => [item.attempt, item.retry ?? 0]), [[1, 0], [3, 1]]);
    assert.deepEqual(final.validationFailures.map(item => item.feedbackSent), [true, true], '两轮的校验失败都已把纠错反馈发给模型');
    assert.deepEqual(final.corrections.map(item => item.feedbackSent), [true, true]);
    // 界面收到的最后一个快照同样如此。
    assert.deepEqual(snapshots.at(-1).validationFailures.map(item => item.feedbackSent), [true, true]);
});

test('real runtime: feedbackSent of earlier rounds is still true in the diagnostic shown while waiting for the next retry', async (t) => {
    quietConsole(t);
    resetDrawAgentRuntimeForTests();
    const INVALID = { toolCalls: [{ id: 'bad', name: 'submit_scene_plan', arguments: JSON.stringify({ images: [{ index: 1, insert_after: 99, scene: 'smile', characters: [] }] }) }], finishReason: 'tool_calls' };
    // 第 1 轮：校验失败 → 纠错 → 网络失败；第 2 轮：校验失败 → 纠错 → 网络失败；第 3 轮成功。
    const core = scriptedAdapterCore([INVALID, new TypeError('network down'), INVALID, new TypeError('network down'), VALID_ADAPTER_REPLY]);
    const snapshots = [];
    await executePreparedScenePlanner(buildPrepared({ maxRetries: 3, baseDelayMs: 100 }, RUNTIME_PROVIDER_CONFIG), {
        agentCore: core,
        random: () => 0.5,
        sleep: async () => {},
        onDiagnosticUpdate: snapshot => snapshots.push(snapshot),
    });
    const waiting = snapshots.filter(snapshot => snapshot.stage === 'retry');
    assert.equal(waiting.length, 2);
    assert.deepEqual(waiting[1].validationFailures.map(item => [item.attempt, item.feedbackSent]), [[1, true], [3, true]]);
    assert.deepEqual(getLastDrawAgentDiagnostic().validationFailures.map(item => item.feedbackSent), [true, true]);
});
