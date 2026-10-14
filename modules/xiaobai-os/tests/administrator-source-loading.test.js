import assert from 'node:assert/strict';
import test from 'node:test';
import { administratorHarness, settled, COMMON_TOOL_NAMES } from './administrator-harness.js';
import { createAdministratorToolExecutor } from '../apps/administrator/agent/tool-executor.js';
import { createAdministratorChatReader } from '../apps/administrator/host/chat-reader.js';
import { ADMINISTRATOR_SOURCE_PACKAGE, SOURCE_TOOL_NAMES as N } from '../apps/administrator/agent/source-tools.js';
import { OS_SOURCE_ROOT as ROOT, OS_SOURCE_RELATIVE_ROOT, OS_SOURCE_LIMITS as LIMITS } from '../apps/administrator/domain/source-code.js';
import { TOOLS_LOAD } from '../apps/administrator/agent/tool-loader.js';
import { extensionFolderPath } from '../../../core/constants.js';
import { ADMINISTRATOR_POLICY } from '../apps/administrator/domain/policy.js';

const names = tools => tools.map(tool => tool.function.name);
const sourceNames = names(ADMINISTRATOR_SOURCE_PACKAGE.tools.map(tool => tool.definition));
const call = (name, args = {}) => ({ toolCalls: [{ id: 'call', name, arguments: JSON.stringify(args) }] });
const result = (messages, name) => JSON.parse(messages.findLast(message => message.role === 'tool' && message.toolName === name).content);

function sourceFetch(t, text = 'before\nneedle\nafter') {
    const path = `${ROOT}/index.ts`, requests = [];
    t.mock.method(globalThis, 'fetch', async (url, options) => {
        requests.push({ url, options });
        if (url === `/${extensionFolderPath}/modules/assistant/assistant-file-manifest.json`) {
            return Response.json({ version: 2, files: [{ source: 'littlewhitebox', relativePath: `${OS_SOURCE_RELATIVE_ROOT}/index.ts` }] });
        }
        assert.equal(url, `/${path}`);
        return new Response(text);
    });
    return { path, requests };
}

test('source is a lazy administrator-owned package, not business management data or a common tool', async t => {
    const h = await administratorHarness(), fetched = sourceFetch(t, ('"\\🙂'.repeat(100) + '\n').repeat(LIMITS.lines));
    const abort = new AbortController(), operations = [];
    const reader = createAdministratorChatReader(h.capture, () => abort.signal);
    const executor = await createAdministratorToolExecutor({ registry: h.registry, reader, signal: abort.signal,
        readEnvironment: h.readEnvironment, operations, guard: reader.isCurrent, onChange() {},
        async saveReceipts() { assert.fail('source tools cannot write business records'); },
    });
    assert.deepEqual(names(executor.getTools()), COMMON_TOOL_NAMES);
    assert.equal(h.registry.get(ADMINISTRATOR_SOURCE_PACKAGE.id), undefined);
    const initial = structuredClone(executor.data);
    assert.equal((await executor.execute(N.read, { filePath: fetched.path }, 'before', 0)).code, 'tool_not_loaded');
    assert.equal(fetched.requests.length, 0);
    const loaded = await executor.execute(TOOLS_LOAD, { apps: [ADMINISTRATOR_SOURCE_PACKAGE.id] }, 'load', 0);
    assert.equal(loaded.ok, true);
    assert.deepEqual(loaded.data.tools, [...COMMON_TOOL_NAMES, ...sourceNames]);
    assert.deepEqual(executor.data, initial);
    assert.equal(fetched.requests.length, 0);
    const read = await executor.execute(N.read, { filePath: fetched.path }, 'read', 0);
    assert.equal(read.ok, true);
    assert.ok(read.data.returnedLines > 0);
    assert.equal(read.data.hasMoreAfter, true);
    assert.ok(read.data.nextOffset > 1);
    assert.equal(read.receipt.appId, ADMINISTRATOR_SOURCE_PACKAGE.id);
    assert.equal(read.receipt.status, 'read');
    // Source pages retain their own continuation even when JSON escaping exceeds the ordinary result-page budget.
    assert.equal(read.data.reference, undefined);
    assert.equal(operations.length, 2);
    const snapshot = executor.getTools();
    await executor.execute(TOOLS_LOAD, { apps: [ADMINISTRATOR_SOURCE_PACKAGE.id] }, 'again', 0);
    assert.deepEqual(executor.getTools(), snapshot);
});

test('the model loop loads, searches and reads on successive requests, then retains the package across reload until clearing', async t => {
    const h = await administratorHarness(), fetched = sourceFetch(t);
    const business = structuredClone(h.state.persisted.partitions);
    let step = 0;
    h.state.generate = async request => {
        switch (++step) {
            case 1:
                assert.deepEqual(names(request.tools), COMMON_TOOL_NAMES);
                return call(TOOLS_LOAD, { apps: [ADMINISTRATOR_SOURCE_PACKAGE.id] });
            case 2:
                assert.deepEqual(names(request.tools), [...COMMON_TOOL_NAMES, ...sourceNames]);
                assert.equal(fetched.requests.length, 0);
                return call(N.grep, { pattern: 'needle', path: ROOT });
            case 3: {
                const found = result(request.messages, N.grep);
                assert.equal(found.ok, true);
                return call(N.read, { filePath: found.data.items[0].path, offset: found.data.items[0].line });
            }
            default:
                assert.equal(result(request.messages, N.read).data.content, '2\tneedle\n3\tafter');
                return { text: 'done' };
        }
    };
    await h.request('send', { text: 'inspect source' }); await settled(h.runtime);
    assert.equal(h.repository.read().turns[0].status, 'finished', h.runtime.error());
    assert.equal(step, 4);
    assert.equal(new Set(h.state.requests.map(request => request.systemPrompt)).size, 1);
    for (const [id, partition] of Object.entries(business)) {
        if (id !== ADMINISTRATOR_SOURCE_PACKAGE.id) { assert.deepEqual(h.state.persisted.partitions[id], partition); }
    }
    const summarized = structuredClone(h.conversation.read());
    summarized.summary = { text: 'inspected source', throughId: summarized.turns.at(-1).id, throughToolMessage: null };
    await h.conversation.save(summarized, () => true);
    const before = fetched.requests.length;
    const reloaded = await administratorHarness(h.state.persisted.partitions);
    assert.equal(fetched.requests.length, before);
    let resumed = 0;
    reloaded.state.generate = async request => {
        assert.deepEqual(names(request.tools), [...COMMON_TOOL_NAMES, ...sourceNames]);
        return ++resumed === 1 ? call(N.read, { filePath: fetched.path }) : { text: 'done' };
    };
    await reloaded.request('send', { text: 'continue inspection' }); await settled(reloaded.runtime);
    assert.equal(reloaded.repository.read().turns.at(-1).status, 'finished', reloaded.runtime.error());
    assert.deepEqual(reloaded.repository.read().turns.at(-1).toolMessages.flatMap(message => message.toolCalls ?? []).map(call => call.name), [N.read]);
    await reloaded.request('clear');
    reloaded.state.generate = async request => { assert.deepEqual(names(request.tools), COMMON_TOOL_NAMES); return { text: 'done' }; };
    await reloaded.request('send', { text: 'new conversation' }); await settled(reloaded.runtime);
    assert.equal(reloaded.repository.read().turns[0].status, 'finished', reloaded.runtime.error());
});

test('a source read in the same model response as its first load is not dispatched', async t => {
    const h = await administratorHarness(), fetched = sourceFetch(t);
    let step = 0;
    h.state.generate = async request => {
        if (++step === 1) { return { toolCalls: [
            ...call(TOOLS_LOAD, { apps: [ADMINISTRATOR_SOURCE_PACKAGE.id] }).toolCalls,
            { ...call(N.read, { filePath: fetched.path }).toolCalls[0], id: 'read' },
        ] }; }
        assert.equal(result(request.messages, N.read).code, 'tool_not_loaded');
        assert.deepEqual(names(request.tools), [...COMMON_TOOL_NAMES, ...sourceNames]);
        return { text: 'done' };
    };
    await h.request('send', { text: 'inspect' }); await settled(h.runtime);
    assert.equal(h.repository.read().turns[0].status, 'finished', h.runtime.error());
    assert.equal(fetched.requests.length, 0);
});

test('assistant-size Grep context keeps its evidence and nextOffset rather than disappearing at the generic cache budget', async t => {
    const h = await administratorHarness(), fetched = sourceFetch(t, (`needle${'x'.repeat(LIMITS.lineChars)}\n`).repeat(LIMITS.matches + 10));
    const abort = new AbortController(), reader = createAdministratorChatReader(h.capture, () => abort.signal);
    const executor = await createAdministratorToolExecutor({ registry: h.registry, reader, signal: abort.signal,
        readEnvironment: h.readEnvironment, operations: [], guard: reader.isCurrent, onChange() {},
        loadedApps: [ADMINISTRATOR_SOURCE_PACKAGE.id],
        async saveReceipts() { assert.fail('source lookup cannot write records'); },
    });
    const grep = await executor.execute(N.grep, { pattern: 'needle', path: fetched.path, contextLines: LIMITS.contextLines }, 'grep', 0);
    assert.equal(grep.ok, true);
    assert.equal(grep.data.items.length, LIMITS.matches);
    assert.equal(grep.data.nextOffset, LIMITS.matches);
    assert.equal(grep.data.truncated, true);
    assert.ok(JSON.stringify(grep).length > ADMINISTRATOR_POLICY.evidenceChars);
    assert.ok(executor.evidence(grep.receipt.id).text.length);
    assert.equal(fetched.requests.length, 2);
});
