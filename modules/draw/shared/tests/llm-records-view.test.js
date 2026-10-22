// 场景规划“最近记录”查看器：纯函数（筛选 / 摘要 / 返回整理）与 DOM 行为。
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

import {
    buildReturnAttempts,
    buildToolCallSections,
    createLlmRecordsView,
    describeRecord,
    filterRecords,
    formatDuration,
} from '../llm-records-view.js';

const output = (extra = {}) => JSON.stringify({
    toolCalls: [{ name: 'submit_scene_plan', arguments: { images: [{ index: 1, scene: 'door' }] } }],
    text: '好的',
    finishReason: 'tool_calls',
    thoughts: '先看门',
    usage: { total_tokens: 9 },
    ...extra,
});

const SUCCESS = {
    id: 3, timestamp: new Date(2026, 9, 21, 9, 5, 7).getTime(), durationMs: 2400, status: 'success', provider: 'openai-compatible', model: 'gpt-x',
    imageTaskCount: 2, finishReason: 'tool_calls', attempts: [{ attempt: 1, durationMs: 2300, finishReason: 'tool_calls', modelOutput: output(), modelOutputTruncated: false }],
    request: { request: { body: { model: 'gpt-x' } } }, notices: ['已改用 native 模式'],
};
const FAILURE = {
    id: 2, timestamp: 1, durationMs: 900, status: 'error', errorCode: 'TOOL_ARGUMENTS_SCHEMA_INVALID', provider: 'p', model: 'm', retryCount: 1,
    attempts: [
        { attempt: 1, durationMs: 400, finishReason: 'tool_calls', toolCallCount: 1 },
        { attempt: 2, retry: 1, durationMs: 500, errorCode: 'AGENT_RESPONSE_INCOMPLETE', finishReason: 'length', responseInfo: { choices: 0 }, partialTextHead: '半截', partialTextLength: 120, rawAssistantMessage: { role: 'assistant' } },
    ],
    validationFailures: [{ attempt: 1, errorCode: 'TOOL_ARGUMENTS_SCHEMA_INVALID', errorMessage: '缺少 scene', errorPath: 'images[0].scene', errorRule: 'required', modelOutput: output({ text: '错的' }) }],
};
const RUNNING = { id: 4, status: 'running', attempts: [] };

test('filterRecords lists every record by default, failures only when asked', () => {
    const all = [RUNNING, SUCCESS, FAILURE];
    assert.deepEqual(filterRecords(all).map(r => r.id), [4, 3, 2]);
    assert.deepEqual(filterRecords(all, { failedOnly: true }).map(r => r.id), [2]);
    assert.deepEqual(filterRecords(null), []);
});

test('describeRecord summarises status, time, model and the useful numbers', () => {
    const ok = describeRecord(SUCCESS);
    assert.equal(ok.status, 'success');
    assert.equal(ok.time, '09:05:07');
    assert.equal(ok.model, 'openai-compatible / gpt-x');
    assert.deepEqual(ok.meta, ['2.4 秒', '2 张图', 'finish: tool_calls']);
    const bad = describeRecord(FAILURE);
    assert.equal(bad.status, 'error');
    assert.deepEqual(bad.meta, ['900 毫秒', '重试 1 次', 'TOOL_ARGUMENTS_SCHEMA_INVALID']);
    assert.equal(describeRecord(RUNNING).statusLabel, '进行中');
    assert.equal(formatDuration(-1), '');
});

test('buildReturnAttempts turns a successful output into tool call, text, thoughts and usage', () => {
    const [attempt] = buildReturnAttempts(SUCCESS);
    assert.equal(attempt.tone, 'ok');
    assert.deepEqual(attempt.sections.map(s => s.title), ['工具调用 submit_scene_plan', '文本', '思考', '用量']);
    assert.deepEqual(attempt.sections[0].value, { images: [{ index: 1, scene: 'door' }] });
    assert.equal(attempt.sections[1].text, '好的');
});

test('buildReturnAttempts joins validation failures and failed requests to their attempt', () => {
    const [first, second] = buildReturnAttempts(FAILURE);
    assert.equal(first.tone, 'warn');
    assert.equal(first.sections[0].title, '校验失败');
    assert.equal(first.sections[0].value.path, 'images[0].scene');
    assert.ok(first.sections.some(s => s.title === '文本' && s.text === '错的'), '校验失败时的返回来自 validationFailures');
    assert.equal(second.tone, 'error');
    assert.equal(second.label, '第 2 次请求（重试 1）');
    assert.deepEqual(second.sections.map(s => s.title), ['失败原因', '供应商回复摘要', '已收到的文本（前 2 字，共 120 字）', '供应商原始消息']);
});

test('a truncated or non-JSON model output is shown as raw text with a notice', () => {
    const [attempt] = buildReturnAttempts({ attempts: [{ attempt: 1, modelOutput: '{"text":"半', modelOutputTruncated: true }] });
    assert.equal(attempt.sections[0].kind, 'text');
    assert.match(attempt.sections[0].title, /已截断/);
    const [stringArgs] = buildReturnAttempts({ attempts: [{ attempt: 1, modelOutput: JSON.stringify({ toolCalls: [{ name: 't', arguments: '{"a":1}' }, { name: 'u', arguments: '{bad' }] }) }] });
    assert.deepEqual(stringArgs.sections.map(s => [s.kind, s.value ?? s.text]), [['json', { a: 1 }], ['text', '{bad']]);
});

function mount(records) {
    const { document, window } = parseHTML('<!doctype html><html><head></head><body><div id="box"></div></body></html>');
    const live = { records };
    const view = createLlmRecordsView({ document, container: document.getElementById('box'), getRecords: () => live.records });
    const $$ = selector => Array.from(document.querySelectorAll(selector));
    return { document, window, view, live, $$ };
}

test('the view lists successes and failures, and the checkbox narrows it to failures only', () => {
    const { view, window, $$, document } = mount([RUNNING, SUCCESS, FAILURE]);
    assert.deepEqual($$('.lr-record').map(r => r.getAttribute('data-status')), ['running', 'success', 'error']);
    assert.match(document.querySelector('.lr-toolbar').textContent, /3 \/ 3 条/);
    const checkbox = document.querySelector('.lr-toolbar input');
    checkbox.checked = true;
    checkbox.dispatchEvent(new window.Event('change', { bubbles: true }));
    assert.deepEqual($$('.lr-record').map(r => r.getAttribute('data-status')), ['error']);
    assert.equal(view.isFailedOnly(), true);
});

test('records are folded by default and expose return, request and raw JSON sections', () => {
    const { $$ } = mount([SUCCESS]);
    const record = $$('.lr-record')[0];
    assert.equal(record.hasAttribute('open'), false);
    assert.deepEqual($$('.lr-sec > summary').map(s => s.textContent), ['模型返回', '请求', '原始 JSON']);
    assert.ok($$('.lr-pre').some(pre => pre.textContent.includes('"scene": "door"')));
    assert.ok($$('.lr-pre').some(pre => pre.textContent.includes('"gpt-x"')), '请求内容在“请求”一节里');
});

test('story text is inserted as text, never as HTML', () => {
    const evil = { ...SUCCESS, attempts: [{ attempt: 1, modelOutput: output({ text: '<img src=x onerror=alert(1)>' }) }] };
    const { $$ } = mount([evil]);
    assert.equal($$('img').length, 0);
    assert.ok($$('.lr-pre').some(pre => pre.textContent.includes('<img src=x')));
});

test('empty states explain what to do, and re-rendering follows the latest records', () => {
    const { view, live, document } = mount([]);
    assert.match(document.querySelector('.lr-empty').textContent, /暂无请求记录/);
    live.records = [SUCCESS];
    view.render();
    assert.equal(document.querySelectorAll('.lr-record').length, 1);
    const checkbox = document.querySelector('.lr-toolbar input');
    checkbox.checked = true;
    view.render();
    assert.match(document.querySelector('.lr-empty').textContent, /没有失败的记录/);
});

test('a blocked reply shows the provider block reason instead of the generic error code', () => {
    assert.deepEqual(describeRecord({ status: 'error', errorCode: 'PROVIDER_REQUEST_FAILED', blockReason: 'PROHIBITED_CONTENT' }).meta, ['PROHIBITED_CONTENT']);
});

test('the style is added once and destroy empties the container', () => {
    const { view, document } = mount([SUCCESS]);
    assert.equal(document.querySelectorAll('#xb-llm-records-style').length, 1);
    createLlmRecordsView({ document, container: document.getElementById('box'), getRecords: () => [] });
    assert.equal(document.querySelectorAll('#xb-llm-records-style').length, 1);
    view.destroy();
    assert.equal(document.getElementById('box').children.length, 0);
});

test('custom tool calls get their own section with arguments, result or error', () => {
    const record = {
        ...SUCCESS,
        customToolCalls: [
            { attempt: 1, name: 'note', arguments: { content: 'x' }, result: '{"ok":true}', durationMs: 12 },
            { attempt: 2, name: 'boom', arguments: {}, error: '工具炸了', durationMs: 3 },
        ],
    };
    const sections = buildToolCallSections(record);
    assert.equal(sections.length, 2);
    assert.match(sections[0].title, /1\. note · 第 1 次请求后 · 12 毫秒/);
    assert.deepEqual(sections[0].value, { arguments: { content: 'x' }, result: '{"ok":true}' });
    assert.match(sections[1].title, /出错/);
    assert.deepEqual(sections[1].value, { arguments: {}, error: '工具炸了' });
    assert.deepEqual(buildToolCallSections(SUCCESS), []);
    const { $$ } = mount([record]);
    assert.deepEqual($$('.lr-sec > summary').map(s => s.textContent), ['模型返回', '自定义工具调用', '请求', '原始 JSON']);
    assert.ok($$('.lr-pre').some(pre => pre.textContent.includes('工具炸了')));
});
