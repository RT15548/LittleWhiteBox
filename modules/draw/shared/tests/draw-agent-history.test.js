// 场景规划的“最近记录”：一次规划一条，成功的返回也保留，失败记录不会被后来的成功挤掉。
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
    getDrawAgentDiagnosticHistory,
    getLastDrawAgentDiagnostic,
    resetDrawAgentRuntimeForTests,
} from '../draw-agent.js';
import {
    DIAGNOSTIC_HISTORY_FAILURES,
    DIAGNOSTIC_HISTORY_RECENT,
    DIAGNOSTIC_MODEL_OUTPUT_MAX_CHARS,
    selectDiagnosticHistory,
} from '../draw-agent-runtime.js';
import { createSubmitScenePlanTool } from '../scene-plan-tool.js';

const SETTINGS = {
    currentPresetName: '主预设',
    presets: {
        主预设: {
            provider: 'openai-compatible',
            modelConfigs: { 'openai-compatible': { baseUrl: 'https://main.example/v1', model: 'm', apiKey: 'k', toolMode: 'native' } },
        },
    },
};

// reply(callIndex) 返回模型回复；返回 Error 时模拟供应商失败。
function createCore(reply) {
    let calls = 0;
    return {
        normalizeAgentSettings,
        resolveActiveProviderConfig,
        isSillyTavernProvider,
        getProviderLabel,
        getToolModeLabel,
        setHostChatCompletionsRequestHeadersProvider: () => {},
        createAgentAdapter: () => ({
            chat: async () => {
                const step = reply(calls);
                calls += 1;
                if (step instanceof Error) throw step;
                return step;
            },
        }),
    };
}

async function runPlanner(reply) {
    const task = { systemPrompt: 's', messages: [{ role: 'user', content: 'plan' }], tools: [createSubmitScenePlanTool()] };
    return callDrawScenePlannerAgent({
        task,
        dependencies: { getAgentSettings: async () => SETTINGS, requestHeadersProvider: () => ({}) },
        loadAgentCore: async () => createCore(reply),
        timeout: 5000,
    });
}

const okReply = (text = 'ok') => ({
    toolCalls: [{ id: 'c1', name: 'submit_scene_plan', arguments: JSON.stringify({ images: [{ index: 1, scene: text }] }) }],
    text,
    finishReason: 'tool_calls',
    usage: { total_tokens: 12 },
});

test('every planner run leaves one record, newest first, and a successful reply keeps its model output', async () => {
    resetDrawAgentRuntimeForTests();
    await runPlanner(() => okReply('first'));
    await runPlanner(() => okReply('second'));
    const history = getDrawAgentDiagnosticHistory();
    assert.equal(history.length, 2);
    assert.ok(history[0].id > history[1].id, '新的在前');
    assert.deepEqual(history[0], getLastDrawAgentDiagnostic(), '第一条就是“最近一次”');
    const output = JSON.parse(history[0].attempts[0].modelOutput);
    assert.equal(output.text, 'second');
    assert.equal(output.toolCalls[0].name, 'submit_scene_plan');
    assert.equal(output.finishReason, 'tool_calls');
    assert.deepEqual(output.usage, { total_tokens: 12 });
    assert.equal(history[0].attempts[0].modelOutputTruncated, false);
});

test('a failed run is recorded with its error and the history is empty after a reset', async (t) => {
    t.mock.method(console, 'log', () => {});
    resetDrawAgentRuntimeForTests();
    await assert.rejects(() => runPlanner(() => new Error('relay down')));
    const [record] = getDrawAgentDiagnosticHistory();
    assert.equal(record.status, 'error');
    assert.equal(record.errorCode, 'PROVIDER_REQUEST_FAILED');
    resetDrawAgentRuntimeForTests();
    assert.deepEqual(getDrawAgentDiagnosticHistory(), []);
});

test('failures stay in the history after many later successes, up to the failure limit', async (t) => {
    t.mock.method(console, 'log', () => {});
    resetDrawAgentRuntimeForTests();
    for (let i = 0; i < DIAGNOSTIC_HISTORY_FAILURES + 1; i += 1) {
        await assert.rejects(() => runPlanner(() => new Error(`fail ${i}`)));
    }
    for (let i = 0; i < DIAGNOSTIC_HISTORY_RECENT + 2; i += 1) await runPlanner(() => okReply(`ok ${i}`));
    const history = getDrawAgentDiagnosticHistory();
    const failures = history.filter(record => record.status === 'error');
    assert.equal(failures.length, DIAGNOSTIC_HISTORY_FAILURES, '较早的失败补到 5 条');
    assert.equal(history.length, DIAGNOSTIC_HISTORY_RECENT + DIAGNOSTIC_HISTORY_FAILURES);
    assert.ok(history.slice(0, DIAGNOSTIC_HISTORY_RECENT).every(record => record.status !== 'error'), '最近 10 条里没有失败');
    const ids = history.map(record => record.id);
    assert.deepEqual(ids, [...ids].sort((a, b) => b - a), '整体仍是新到旧');
    assert.deepEqual(failures.map(record => record.id), failures.map(record => record.id).sort((a, b) => b - a));
});

test('selectDiagnosticHistory keeps the recent window whole and only tops up with failures', () => {
    const record = (id, status) => ({ id, status });
    const records = [record(9, 'success'), record(8, 'error'), record(7, 'success'), record(6, 'error'), record(5, 'success'), record(4, 'error')];
    assert.deepEqual(selectDiagnosticHistory(records, { recent: 3, failures: 2 }).map(item => item.id), [9, 8, 7, 6]);
    assert.deepEqual(selectDiagnosticHistory(records, { recent: 3, failures: 1 }).map(item => item.id), [9, 8, 7]);
    assert.deepEqual(selectDiagnosticHistory(records, { recent: 10, failures: 5 }).map(item => item.id), [9, 8, 7, 6, 5, 4]);
    assert.deepEqual(selectDiagnosticHistory(null), []);
});

test('an oversized model output is truncated and flagged instead of growing the history without limit', async () => {
    resetDrawAgentRuntimeForTests();
    await runPlanner(() => okReply('x'.repeat(DIAGNOSTIC_MODEL_OUTPUT_MAX_CHARS * 2)));
    const [record] = getDrawAgentDiagnosticHistory();
    const attempt = record.attempts[0];
    assert.equal(attempt.modelOutput.length, DIAGNOSTIC_MODEL_OUTPUT_MAX_CHARS);
    assert.equal(attempt.modelOutputTruncated, true);
});

test('history records are redacted copies: secrets are masked and callers cannot mutate the stored record', async () => {
    resetDrawAgentRuntimeForTests();
    await runPlanner(() => ({
        ...okReply(),
        requestInspection: { request: { headers: { Authorization: 'Bearer secret' }, body: { api_key: 'sk-secret' } } },
    }));
    const [record] = getDrawAgentDiagnosticHistory();
    assert.equal(record.request.request.headers.Authorization, '[redacted]');
    assert.equal(record.request.request.body.api_key, '[redacted]');
    record.status = 'tampered';
    assert.notEqual(getDrawAgentDiagnosticHistory()[0].status, 'tampered');
});
