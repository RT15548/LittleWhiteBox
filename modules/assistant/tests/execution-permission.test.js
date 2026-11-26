import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createAssistantRuntime } from '../app-src/runtime.js';
import { TOOL_NAMES, getAssistantToolDefinitions, formatToolResultDisplay } from '../app-src/tooling.js';
import { normalizeSlashCommand, shouldRequireSlashCommandApproval } from '../app-src/slash-command-policy.js';
import { runJavaScriptApi } from '../runtime-src/jsapi-runtime.js';

const manifest = JSON.parse(await readFile(new URL('../st-jsapi-manifest.json', import.meta.url), 'utf8'));
const tool = (name, args) => ({ text: '', toolCalls: [{ id: name, name, arguments: JSON.stringify(args) }] });
const js = code => tool(TOOL_NAMES.RUN_JAVASCRIPT_API, { code, purpose: 'Isolated permission check', expectedOutput: 'Fixture result' });
const done = { text: 'Finished.', toolCalls: [] };
const operations = () => [
    tool(TOOL_NAMES.RUN_SLASH_COMMAND, { command: '/echo fixture' }),
    js('return ctx.chatMetadata.count;'),
    js('ctx.chatMetadata.count += 1; return ctx.chatMetadata.count;'),
    js('return globalThis.Math.max(1, 2);'),
    done,
];

function harness(t, { mode, enabled, role = 'main', approve = true, nextMode }) {
    t.mock.method(console, 'info', () => {});
    t.mock.method(globalThis, 'fetch', async () => Response.json(manifest));
    const run = { id: 'permissions', controller: new AbortController(), toolRequestIds: new Set(), workspaceBaseline: [] };
    const state = { config: { permissionMode: mode }, activeRun: run, messages: [{ role: 'user', content: 'Inspect the isolated fixture.' }], archivedTurnCount: 0,
        archivedSkillIds: role === 'delegate' ? ['builtin-planning'] : [] };
    const approvals = [], dispatched = [], requests = [], pendingApprovals = new Map(), pendingToolCalls = new Map();
    const ctx = { chatMetadata: { count: 0 } };
    const queues = { main: role === 'main' ? operations() : [tool(TOOL_NAMES.DELEGATE_RUN, { task: 'Inspect fixture' }), done],
        delegate: role === 'delegate' ? operations() : [] };
    let sequence = 0;
    const runtime = createAssistantRuntime({
        state, TOOL_NAMES, pendingApprovals, pendingToolCalls,
        render() {
            if (!state.pendingApproval || approvals.some(item => item.id === state.pendingApproval.id)) return;
            const approval = state.pendingApproval;
            approvals.push(approval);
            queueMicrotask(() => pendingApprovals.get(approval.id).resolve(approve));
        },
        persistSession() {}, createRequestId: () => 'permission-' + (++sequence),
        safeJsonParse: JSON.parse, describeError: error => error.message, formatToolResultDisplay,
        normalizeAttachments: () => [], normalizeThoughtBlocks: () => [], buildUserContentParts: message => message.content,
        normalizeSlashCommand, shouldRequireSlashCommandApproval: command => shouldRequireSlashCommandApproval(command, state.config.permissionMode),
        buildSlashApprovalResult: (_command, approved) => ({ ok: approved, approved, skipped: !approved }),
        buildJsApiApprovalResult: (_args, approved) => ({ ok: approved, approved, skipped: !approved }),
        getActiveProviderConfig: () => ({ provider: 'openai-compatible' }), getDelegateProviderConfig: () => ({ provider: 'openai-compatible', model: 'delegate-fixture' }),
        getToolDefinitions: options => getAssistantToolDefinitions({ ...options, jsApiEnabled: enabled }), isJsApiEnabled: () => enabled,
        SYSTEM_PROMPT: '', MAX_CONTEXT_TOKENS: 100000, SUMMARY_TRIGGER_TOKENS: 90000, REQUEST_TIMEOUT_MS: 1000,
        isAbortError: error => error.name === 'AbortError',
        createAdapter: config => {
            const target = config.model === 'delegate-fixture' ? 'delegate' : 'main';
            return { async chat(request) {
                requests.push({ role: target, messages: structuredClone(request.messages || []) });
                if (nextMode && queues[target].length === 3) state.config.permissionMode = nextMode;
                assert.ok(queues[target].length, 'No unplanned model retries');
                return queues[target].shift();
            } };
        },
        post(type, payload) {
            if (type !== 'xb-assistant:tool-call') return;
            dispatched.push(payload);
            const result = payload.name === TOOL_NAMES.RUN_JAVASCRIPT_API
                ? runJavaScriptApi({ ...payload.arguments, manifest, ctx, st: {}, signal: run.controller.signal })
                : Promise.resolve({ ok: true, pipe: 'fixture' });
            void result.then(value => pendingToolCalls.get(payload.requestId).resolve(value),
                error => pendingToolCalls.get(payload.requestId).reject(error));
        },
    });
    return { state, approvals, dispatched, requests, ctx, start: () => runtime.runAssistantLoop(run) };
}

// 验收：两种执行权限下，JS禁用都不能执行；完全权限不逐条审批，默认权限保留原审批。代价：越权执行或审批风暴。
test('execution mode governs slash and enabled JS for main and delegate, without overriding JS denial', async t => {
    for (const role of ['main', 'delegate']) for (const mode of ['default', 'full']) for (const enabled of [false, true]) {
        const h = harness(t, { role, mode, enabled });
        await h.start();
        assert.equal(h.approvals.length, mode === 'full' ? 0 : enabled ? 3 : 1, JSON.stringify({ role, mode, enabled }));
        assert.equal(h.dispatched.filter(call => call.name === TOOL_NAMES.RUN_SLASH_COMMAND).length, 1);
        assert.equal(h.dispatched.filter(call => call.name === TOOL_NAMES.RUN_JAVASCRIPT_API).length, enabled ? 3 : 0);
        assert.equal(h.ctx.chatMetadata.count, enabled ? 1 : 0);
        const receipts = h.requests.filter(request => request.role === role).at(-1).messages.filter(message => message.role === 'tool')
            .map(message => JSON.parse(message.content));
        const denied = role === 'main' ? 'jsapi_permission_denied' : 'delegate_tool_not_available';
        assert.equal(receipts.filter(result => result.error === denied).length, enabled ? 0 : 3);
        if (mode === 'full') assert.equal(receipts.some(result => result.approval), false, 'Automatic execution must not claim per-call approval');
    }
});

// 验收：拒绝仍不派发；切换回默认权限后的调用重新确认，不沿用旧信任。代价：越权执行。
test('decline prevents dispatch and changing presets does not retain full permission', async t => {
    const declined = harness(t, { mode: 'default', enabled: true, approve: false });
    await declined.start();
    assert.equal(declined.dispatched.length, 1); // Only the recognized read.
    assert.equal(declined.ctx.chatMetadata.count, 0);
    const switched = harness(t, { mode: 'full', enabled: true, nextMode: 'default' });
    await switched.start();
    assert.equal(switched.approvals.length, 2); // Effect and unresolved call after switching.
    assert.equal(switched.ctx.chatMetadata.count, 1);
});
