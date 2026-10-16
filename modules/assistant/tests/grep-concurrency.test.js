import test from 'node:test';
import assert from 'node:assert/strict';
import { loadAssistantGrep } from './helpers/grep-host.js';
import { createAdministratorSourceReader } from '../../xiaobai-os/apps/administrator/host/source-reader.ts';
import { OS_SOURCE_ROOT } from '../../xiaobai-os/apps/administrator/domain/source-code.ts';
import { toolOutcome, createToolActivityProjection } from '../app-src/ui/tool-activity.js';
import { TOOL_NAMES } from '../app-src/tooling.js';
import { createAssistantRuntime } from '../app-src/runtime.js';

// 验收：并发不改变命中、顺序、分页和作用域；代价：证据错误或越权读取。
// 验收：失败、取消不能报告搜全，写入不受只读展示影响；代价：误报及重复写入。
const bodies = ['before\nneedle a\nbetween\nneedle b\nafter', 'plain', 'NEEDLE c', 'needle d', 'plain'];
const paths = bodies.map((_, index) => `${OS_SOURCE_ROOT}/file-${index}.js`);
const entries = paths.map(publicPath => ({ publicPath, relativePath: publicPath.split('LittleWhiteBox/')[1], source: 'littlewhitebox' }));

function transport({ fail = -1, block = false, firstOnly = false } = {}) {
    const calls = [], aborted = [];
    let ready;
    const started = new Promise(resolve => { ready = resolve; });
    return { calls, aborted, started, async fetch(url, { signal } = {}) {
        if (String(url).endsWith('assistant-file-manifest.json')) {
            return Response.json({ version: 2, files: entries });
        }
        const index = paths.indexOf(String(url).replace(/^\//, ''));
        assert.notEqual(index, -1);
        calls.push(index);
        if (calls.length === 3) ready();
        await new Promise((resolve, reject) => {
            const onAbort = () => { clearTimeout(timer); aborted.push(index); reject(signal.reason); };
            const timer = block || firstOnly && index !== 0 ? null : setTimeout(() => {
                signal.removeEventListener('abort', onAbort); resolve();
            }, index === 0 ? 8 : 0);
            signal.addEventListener('abort', onAbort, { once: true });
        });
        return new Response(bodies[index], { status: index === fail ? 503 : 200 });
    } };
}

async function engine(t, name, network, signal, assertCurrent = () => {}) {
    if (name === 'administrator') return createAdministratorSourceReader({ fetch: network.fetch, signal, assertCurrent }).grep;
    t.mock.method(globalThis, 'fetch', network.fetch);
    t.mock.method(console, 'info', () => {});
    const grep = await loadAssistantGrep();
    return args => grep(args, { signal });
}

for (const name of ['assistant', 'administrator']) {
    test(`${name}: ordered content and file-count pages survive out-of-order responses`, async t => {
        const network = transport(), grep = await engine(t, name, network);
        const page = await grep({ pattern: 'needle', offset: 1, limit: 2, contextLines: 1 });
        assert.deepEqual(page.items.map(item => [item.path, item.line, item.text]), [
            [paths[0], 4, 'needle b'], [paths[2], 1, 'NEEDLE c'],
        ]);
        assert.equal(page.items[0].context, '  3: between\n> 4: needle b\n  5: after');
        assert.equal(page.scannedFiles, 3);
        assert.equal(page.matchesFound, 3);
        assert.equal(page.nextOffset, 3);
        assert.equal(page.truncated, true);
        assert.equal(page.searchComplete, false);
        for (const outputMode of ['count', 'files_with_matches']) {
            const files = await grep({ pattern: 'needle', outputMode, offset: 1, limit: 1 });
            assert.deepEqual(files.items, [{ path: paths[2], source: 'littlewhitebox', matchCount: 1 }]);
            assert.equal(files.nextOffset, 2);
            assert.equal(files.scannedFiles, 3);
        }
        const full = await grep({ pattern: 'needle', useRegex: false });
        assert.equal(full.searchComplete, true);
        assert.equal(full.totalMatches, 4);
        assert.equal(full.matchedFiles, 3);
        assert.equal(full.scannedFiles, 5);
    });

    test(`${name}: exact scope and include still filter before prefetch`, async t => {
        const network = transport(), grep = await engine(t, name, network);
        const result = await grep({ pattern: '^needle [ab]$', path: paths[0], include: '*.js', useRegex: true });
        assert.deepEqual(network.calls, [0]);
        assert.equal(result.totalMatches, 2);
        const excluded = await grep({ pattern: 'needle', include: '*.vue' });
        assert.equal(excluded.totalMatches, 0);
        assert.deepEqual(network.calls, [0]);
    });

    test(`${name}: file failure retains its cause and cannot claim complete totals`, async t => {
        const network = transport({ fail: 1 }), grep = await engine(t, name, network);
        const result = await grep({ pattern: 'needle' });
        assert.equal(result.items.length, 4);
        assert.equal(result.skippedFiles, 1);
        assert.deepEqual(result.skippedPaths, [paths[1]]);
        assert.match(result.readErrors[0].cause, /503/);
        assert.equal(result.searchComplete, false);
        assert.equal(Object.hasOwn(result, 'totalMatches'), false);
        assert.equal(Object.hasOwn(result, 'matchedFiles'), false);
    });

    test(`${name}: original result limit aborts unused prefetch without more requests`, async t => {
        const network = transport({ firstOnly: true }), grep = await engine(t, name, network);
        const result = await grep({ pattern: 'needle', limit: 1 });
        assert.equal(result.items.length, 1);
        assert.equal(result.scannedFiles, 1);
        assert.deepEqual(network.calls, [0, 1, 2]);
        assert.deepEqual(network.aborted, [1, 2]);
    });

    test(`${name}: cancellation terminates the window rather than skipping files`, async t => {
        const network = transport({ block: true }), controller = new AbortController();
        const grep = await engine(t, name, network, controller.signal);
        const pending = grep({ pattern: 'needle' });
        await network.started;
        controller.abort();
        await assert.rejects(pending, { name: 'AbortError' });
        assert.deepEqual(network.calls, [0, 1, 2]);
        assert.deepEqual(network.aborted, [0, 1, 2]);
    });
}

test('administrator: changed chat rejects the old search and cancels unused reads', async t => {
    const network = transport({ firstOnly: true });
    let valid = true;
    const grep = await engine(t, 'administrator', network, undefined, () => {
        if (!valid) throw new Error('administrator_context_changed');
    });
    const pending = grep({ pattern: 'needle' });
    await network.started;
    valid = false;
    await assert.rejects(pending, /administrator_context_changed/);
    assert.deepEqual(network.calls, [0, 1, 2]);
    assert.deepEqual(network.aborted, [1, 2]);
});

test('Grep timeout and cancellation are known failures; writes remain unconfirmed', () => {
    const timeout = { ok: false, error: 'tool_timeout' }, aborted = { ok: false, error: 'tool_aborted' };
    assert.equal(toolOutcome(timeout, TOOL_NAMES.GREP).status, 'failed');
    assert.equal(toolOutcome(aborted, TOOL_NAMES.GREP).status, 'stopped');
    for (const name of [TOOL_NAMES.WRITE, TOOL_NAMES.APPLY_PATCH, TOOL_NAMES.RUN_JAVASCRIPT_API]) {
        assert.equal(toolOutcome(timeout, name).status, 'unconfirmed');
        assert.equal(toolOutcome(aborted, name).status, 'unconfirmed');
    }
    const view = createToolActivityProjection()([
        { role: 'assistant', toolCalls: [{ id: 'grep', name: TOOL_NAMES.GREP, arguments: '{}' }] },
        { role: 'tool', toolName: TOOL_NAMES.GREP, toolCallId: 'grep', content: JSON.stringify(timeout) },
    ]);
    assert.equal(view.rows[0].status, 'failed');
    assert.equal(view.counts.failed, 1);
});

for (const name of [TOOL_NAMES.GREP, TOOL_NAMES.WRITE]) {
    test(`cancelled in-flight ${name} without a receipt keeps the correct activity`, async t => {
        t.mock.method(console, 'info', () => {});
        const run = { id: 'run', controller: new AbortController(), toolRequestIds: new Set(), workspaceBaseline: [] };
        const argumentsJson = name === TOOL_NAMES.WRITE ? JSON.stringify({ path: 'local/test.md', content: 'test' }) : '{}';
        const state = { activeRun: run, messages: [{ role: 'user', content: 'test' }], archivedTurnCount: 0 };
        let dispatched;
        const ready = new Promise(resolve => { dispatched = resolve; });
        const runtime = createAssistantRuntime({
            state, TOOL_NAMES, pendingToolCalls: new Map(), pendingApprovals: new Map(),
            render() {}, persistSession() {}, createRequestId: () => 'request',
            safeJsonParse: JSON.parse, describeError: error => error.message,
            normalizeAttachments: () => [], normalizeThoughtBlocks: () => [],
            buildUserContentParts: message => message.content,
            getActiveProviderConfig: () => ({ provider: 'openai-compatible', model: 'test' }),
            getToolDefinitions: () => [], SYSTEM_PROMPT: '', MAX_CONTEXT_TOKENS: 100000, SUMMARY_TRIGGER_TOKENS: 90000,
            MAX_TOOL_ROUNDS: 2, REQUEST_TIMEOUT_MS: 180000,
            isAbortError: error => error.message === 'tool_aborted',
            createAdapter: () => ({ async chat() { return { text: '', toolCalls: [
                { id: 'first', name, arguments: argumentsJson }, { id: 'second', name, arguments: argumentsJson },
            ] }; } }),
            post(type) { if (type === 'xb-assistant:tool-call') dispatched(); },
        });
        const pending = runtime.runAssistantLoop(run);
        await ready;
        const [first, second] = state.messages.at(-1).toolCalls;
        assert.equal(runtime.getToolActivity(first), 'running');
        runtime.cancelActiveRun();
        await assert.rejects(pending, /tool_aborted/);
        assert.equal(runtime.getToolActivity(first), name === TOOL_NAMES.GREP ? 'stopped' : 'unconfirmed');
        assert.equal(runtime.getToolActivity(second), 'not-executed');
        assert.equal(run.toolRequestIds.size, 0);
    });
}
