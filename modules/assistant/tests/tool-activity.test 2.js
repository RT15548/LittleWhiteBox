import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { createToolActivityProjection, toolOutcome } from '../app-src/ui/tool-activity.js';
import { createToolProcess } from '../app-src/ui/tool-process.js';
import { createChatUi } from '../app-src/ui/chat-ui.js';
import { createAssistantRuntime } from '../app-src/runtime.js';
import { TOOL_NAMES } from '../app-src/tooling.js';

const call = (id, name = TOOL_NAMES.READ, args = {}) => ({ id, name, arguments: JSON.stringify(args) });
const assistant = calls => ({ role: 'assistant', content: '', toolCalls: calls });
const receipt = (call, result) => ({ role: 'tool', toolCallId: call.id, toolName: call.name, content: JSON.stringify(result) });

test('activity distinguishes successful reads, failures, declined actions and unknown delivery', () => {
    for (const [result, status] of [
        [{ path: 'a.js', content: 'private source' }, 'succeeded'],
        [{ ok: true }, 'succeeded'],
        [{ ok: false }, 'failed'],
        [{ ok: false, skipped: true }, 'skipped'],
        [{ ok: true, approved: false }, 'skipped'],
        [{ ok: false, execution: { isAborted: true } }, 'stopped'],
        [{ ok: false, error: 'tool_timeout' }, 'unconfirmed'],
        [{ ok: false, error: 'tool_aborted' }, 'unconfirmed'],
        [{ skippedFiles: 2, items: [] }, 'partial'],
        [null, 'unconfirmed'],
    ]) assert.equal(toolOutcome(result).status, status);
});

test('activity pairs receipts within a batch and never exposes raw search or JavaScript content', () => {
    const first = call('same', TOOL_NAMES.GREP, { pattern: 'needle' });
    const second = call('same', TOOL_NAMES.RUN_JAVASCRIPT_API, { code: 'private_source()', purpose: '检查设置' });
    const messages = [assistant([first]), receipt(first, { items: [{ text: 'private_match' }] }), assistant([second])];
    const project = createToolActivityProjection(() => 'queued');
    const initial = project(messages);
    assert.deepEqual(initial.rows.map(row => row.status), ['succeeded', 'queued']);
    assert.equal(initial.rows.some(row => [row.label, row.note].some(value => value?.includes('private_'))), false);
    const result = receipt(second, { ok: false, error: 'denied' });
    messages.push(result);
    assert.deepEqual(project(messages).counts, { total: 2, succeeded: 1, failed: 1, unresolved: 0 });
    result.content = '{';
    assert.equal(project(messages).rows.at(-1).status, 'unconfirmed');
});

test('live operations update in place and completed process content mounts only on demand', t => {
    const previousDocument = globalThis.document;
    const { document } = parseHTML('<html><body></body></html>');
    globalThis.document = document;
    t.after(() => { globalThis.document = previousDocument; });
    const first = call('one'), second = call('two');
    const messages = [assistant([first, second])];
    const project = createToolActivityProjection(current => current === first ? 'running' : 'queued');
    const view = createToolProcess({ project, renderText: text => document.createTextNode(text) });
    document.body.append(view.node);
    view.update(messages, true);
    const runningRow = view.node.querySelector('[data-status="running"]');
    const queuedRow = view.node.querySelector('[data-status="queued"]');
    messages.push(receipt(first, { content: 'source text'.repeat(10000) }));
    view.update(messages, true);
    // Keeping the existing rows preserves a user's selection while another operation finishes.
    assert.equal(view.node.querySelector('[data-status="succeeded"]'), runningRow);
    assert.equal(view.node.querySelector('[data-status="queued"]'), queuedRow);
    assert.equal(view.node.querySelectorAll('pre, details').length, 0);
    view.update(messages, false);
    assert.equal(view.node.querySelectorAll('[data-status]').length, 0);
    const toggle = view.node.querySelector('button');
    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
    toggle.click();
    assert.equal(view.node.querySelectorAll('[data-status]').length, 2);
    view.update(messages, false);
    assert.equal(toggle.getAttribute('aria-expanded'), 'true');
    toggle.click();
    assert.equal(view.node.querySelectorAll('[data-status]').length, 0);
});

test('a conversation keeps one process across tool rounds and leaves its final answer outside', t => {
    const previousDocument = globalThis.document;
    const { document } = parseHTML('<html><body><main></main></body></html>');
    globalThis.document = document;
    t.after(() => { globalThis.document = previousDocument; });
    const one = call('one'), two = call('two');
    const streaming = { role: 'assistant', content: 'checking', streaming: true };
    const state = { messages: [{ role: 'user', content: 'request' }, streaming], isBusy: true };
    const ui = createChatUi({ state, getToolActivity: () => 'running', normalizeThoughtBlocks: value => value || [],
        normalizeAttachments: value => value || [], renderAttachmentGallery() {} });
    const container = document.querySelector('main');
    ui.renderMessages(container);
    streaming.toolCalls = [one];
    streaming.streaming = false;
    ui.renderMessages(container);
    const process = container.querySelector('.xb-assistant-process');
    assert.ok(process);
    state.messages.push(receipt(one, { content: 'private_source' }), assistant([two]));
    ui.renderMessages(container);
    assert.equal(container.querySelectorAll('.xb-assistant-process').length, 1);
    assert.equal(container.querySelector('.xb-assistant-process'), process);
    assert.equal(container.querySelectorAll('[data-status]').length, 2);
    state.messages.push(receipt(two, { ok: false }), { role: 'assistant', content: 'final_answer' });
    state.isBusy = false;
    ui.renderMessages(container);
    assert.equal(process.querySelectorAll('[data-status]').length, 0);
    assert.equal(container.lastElementChild.dataset.messageIndex, String(state.messages.length - 1));
    process.querySelector('button').click();
    assert.equal(process.querySelectorAll('[data-status]').length, 2);
    assert.equal(container.textContent.includes('private_source'), false);
    ui.renderMessages(container);
    assert.equal(process.querySelector('button').getAttribute('aria-expanded'), 'true');
});

function runtimeHarness(calls, hooks = {}) {
    const state = { messages: [{ role: 'user', content: '检查' }], historySummary: '', archivedTurnCount: 0, ...hooks.state };
    const run = { id: 'activity', controller: new AbortController(), toolRequestIds: new Set() };
    state.activeRun = run;
    const pending = new Map(), approvals = new Map();
    let requests = 0, serial = 0;
    const runtime = createAssistantRuntime({
        state, pendingToolCalls: pending, pendingApprovals: approvals,
        render: () => hooks.render?.(state), persistSession() {}, showToast() {},
        createRequestId: () => `activity-${++serial}`,
        post: (type, payload) => hooks.post?.(type, payload, pending),
        flushPendingWorkspaceChanges: hooks.flushPendingWorkspaceChanges,
        safeJsonParse: JSON.parse, describeError: String, isAbortError: error => error.message === 'tool_aborted',
        normalizeSlashCommand: value => value, shouldRequireSlashCommandApproval: () => true,
        normalizeSlashSkillTrigger: value => value,
        buildSlashApprovalResult: () => ({ ok: false, skipped: true }),
        formatToolResultDisplay: () => ({}), buildTextWithAttachmentSummary: text => text,
        buildUserContentParts: message => message.content,
        normalizeAttachments: value => value || [], normalizeThoughtBlocks: value => value || [],
        getActiveProviderConfig: () => ({ provider: 'openai-compatible', model: 'fixture' }),
        SYSTEM_PROMPT: '', SUMMARY_SYSTEM_PROMPT: '', HISTORY_SUMMARY_PREFIX: '',
        MAX_CONTEXT_TOKENS: 258000, SUMMARY_TRIGGER_TOKENS: 228000,
        DEFAULT_PRESERVED_TURNS: 1, MIN_PRESERVED_TURNS: 1, MAX_TOOL_ROUNDS: 4, REQUEST_TIMEOUT_MS: 1000,
        TOOL_DEFINITIONS: [], TOOL_NAMES,
        createAdapter: () => ({ async chat(request) {
            if (requests++) return { text: '完成' };
            request.onStreamProgress({ text: '开始检查' });
            return { text: '开始检查', toolCalls: calls };
        } }),
    });
    return { runtime, state, run, approvals };
}

for (const autoRead of [false, true]) {
    test(`stopping before dispatch leaves ${autoRead ? 'automatic skill reads' : 'model tool calls'} unexecuted`, async () => {
        const entered = Promise.withResolvers(), flush = Promise.withResolvers();
        let dispatched = 0;
        const { runtime, state, run } = runtimeHarness([call('one')], {
            ...(autoRead ? { state: {
                messages: [{ role: 'user', content: '/fixture' }],
                runtime: { skillsCatalog: { skills: [{ id: 'fixture', enabled: true, slashTriggers: ['/fixture'] }] } },
            } } : {}),
            async flushPendingWorkspaceChanges() { entered.resolve(); await flush.promise; },
            post(type) { if (type === 'xb-assistant:tool-call') dispatched++; },
        });
        const finished = runtime.runAssistantLoop(run);
        await entered.promise;
        const project = createToolActivityProjection(runtime.getToolActivity);
        const statuses = () => project(state.messages).rows.filter(row => row.type === 'tool').map(row => row.status);
        assert.deepEqual(statuses(), ['preparing']);
        assert.equal(dispatched, 0);
        const rejected = assert.rejects(finished, /tool_aborted/);
        runtime.cancelActiveRun();
        flush.resolve();
        await rejected;
        state.activeRun = null;
        assert.equal(dispatched, 0);
        assert.deepEqual(statuses(), ['not-executed']);
    });
}

test('stopping a dispatched tool does not report success or pretend queued tools ran', async () => {
    const arrived = Promise.withResolvers();
    const harness = runtimeHarness([call('one'), call('two')], {
        post(type) { if (type === 'xb-assistant:tool-call') arrived.resolve(); },
    });
    const { runtime, state, run } = harness;
    const finished = runtime.runAssistantLoop(run);
    await arrived.promise;
    const storedCalls = state.messages.find(message => message.toolCalls)?.toolCalls;
    assert.deepEqual(storedCalls.map(runtime.getToolActivity), ['running', 'queued']);
    const rejected = assert.rejects(finished, /tool_aborted/);
    run.controller.abort();
    await rejected;
    state.activeRun = null;
    assert.deepEqual(storedCalls.map(runtime.getToolActivity), ['unconfirmed', 'not-executed']);
});

test('declined approval is visible as skipped without dispatching the operation', async () => {
    const arrived = Promise.withResolvers();
    const { runtime, state, run, approvals } = runtimeHarness([call('slash', TOOL_NAMES.RUN_SLASH_COMMAND, { command: '/test' })], {
        render(state) { if (state.pendingApproval) arrived.resolve(); },
        post() { assert.fail('a declined operation must not be dispatched'); },
    });
    const finished = runtime.runAssistantLoop(run);
    await arrived.promise;
    const storedCall = state.messages.find(message => message.toolCalls)?.toolCalls[0];
    assert.equal(runtime.getToolActivity(storedCall), 'approval');
    approvals.get(state.pendingApproval.id).resolve(false);
    await finished;
    const project = createToolActivityProjection(runtime.getToolActivity);
    assert.equal(project(state.messages).rows.find(row => row.type === 'tool').status, 'skipped');
});
