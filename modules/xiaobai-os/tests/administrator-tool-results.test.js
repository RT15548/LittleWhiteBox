import assert from 'node:assert/strict';
import test from 'node:test';
import { createAdministratorToolExecutor } from '../apps/administrator/agent/tool-executor.js';
import { createAdministratorChatReader } from '../apps/administrator/host/chat-reader.js';
import { ADMINISTRATOR_POLICY } from '../apps/administrator/domain/policy.js';
import { createManagementRegistry } from '../capabilities/management/index.js';
import { MANAGEMENT_READ_CHARS } from '../capabilities/management/read-page.js';
import { TOOLS_LOAD } from '../apps/administrator/agent/tool-loader.js';

async function fixture(messages = [], registry = createManagementRegistry()) {
    const surface = { identityKey: 'tool-results', playerName: 'Player', assistantName: 'Narrator', messages };
    const abort = new AbortController();
    const operations = [];
    const executor = await createAdministratorToolExecutor({
        registry, reader: createAdministratorChatReader(() => surface, () => abort.signal),
        readEnvironment: () => ({ observedAt: 1, apps: [], maintenance: [], mainChatGenerating: false,
            storage: { chat: { state: 'ready', hasPendingCommit: false }, user: { state: 'ready', hasPendingCommit: false } } }),
        operations, guard: () => !abort.signal.aborted,
        onChange() {}, async saveReceipts() { assert.fail('read tools must not save business data'); },
    });
    let sequence = 0;
    await executor.execute(TOOLS_LOAD, { apps: registry.list().map(app => app.id) }, 'load', -1);
    return { executor, operations, surface, call: (name, args) => executor.execute(name, args, String(++sequence), sequence) };
}

test('result continuation keeps one reference and cursor while reconstructing HTML and Unicode story pages', async () => {
    const original = '<p>她说："好。🙂"</p>\n'.repeat(2200);
    const h = await fixture([{ mes: original, swipe_id: 0, is_system: true }, { mes: '末楼', swipe_id: 0 }]);
    const texts = ['', ''];
    let args = { from: 0, to: 1 };
    let continuationCalls = 0;
    while (args) {
        let response = await h.call('ChatRead', args);
        const reference = response.data.reference;
        let result = response;
        if (reference) {
            const totalChars = response.data.totalChars;
            let serialized = '';
            do {
                const page = response.data;
                assert.equal(response.status, 'read');
                assert.equal(page.reference, reference);
                assert.equal(page.totalChars, totalChars);
                assert.equal(page.offset, serialized.length);
                assert.ok(page.text.length <= MANAGEMENT_READ_CHARS);
                assert.equal(h.executor.evidence(response.receipt.id).text, page.text);
                serialized += page.text;
                if (page.nextOffset === null) { break; }
                assert.equal(page.nextOffset, serialized.length);
                response = await h.call('ToolResultRead', { reference, offset: page.nextOffset });
                assert.ok(++continuationCalls < 100);
            } while (true);
            assert.equal(serialized.length, totalChars);
            result = JSON.parse(serialized);
        }
        for (const item of result.data.items) { texts[item.floor] += item.text; }
        args = result.data.next;
    }
    assert.ok(continuationCalls > 2);
    assert.deepEqual(texts, [original, '末楼']);
    assert.ok(h.operations.every(op => !Object.hasOwn(op, 'text') && !Object.hasOwn(op, 'data')));
});

test('continuing a near-budget result does not evict its source; details expire with that source', async () => {
    const registry = createManagementRegistry();
    const result = { ok: true, status: 'read', data: '原'.repeat(ADMINISTRATOR_POLICY.evidenceChars - 1000) };
    const tools = [{ effect: 'read', label: 'Read', target: () => '', definition: { type: 'function', function: {
        name: 'LargeRead', description: '', parameters: { type: 'object', properties: {} },
    } } }];
    registry.register({
        id: 'fixture', label: 'Fixture', prompt: '', tools,
        async open() {
            return {
                prompt: '', initial: {},
                tools,
                async execute() { return result; },
            };
        },
    });
    const h = await fixture([], registry);
    const first = await h.call('LargeRead', {});
    const reference = first.data.reference;
    assert.ok(reference);
    let continued;
    for (let index = 0; index < 5; index++) {
        continued = await h.call('ToolResultRead', { reference, offset: index * MANAGEMENT_READ_CHARS });
        assert.equal(continued.status, 'read');
        assert.equal(continued.data.reference, reference);
        assert.equal(h.executor.evidence(continued.receipt.id).text, continued.data.text);
        assert.equal(h.executor.evidence(reference).text, first.data.text);
    }
    const invalid = await h.call('ToolResultRead', { reference, offset: -1 });
    assert.equal(invalid.status, 'failed');
    assert.equal(h.executor.evidence(reference).text, first.data.text);
    const second = await h.call('LargeRead', {});
    assert.equal(second.status, 'read');
    assert.throws(() => h.executor.evidence(reference));
    assert.throws(() => h.executor.evidence(continued.receipt.id));
    assert.equal((await h.call('ToolResultRead', { reference, offset: 0 })).status, 'failed');
});

test('result continuation reads its captured content, and another run cannot access its reference', async () => {
    const h = await fixture([{ mes: '<p>原文</p>'.repeat(1800), swipe_id: 0 }]);
    const first = await h.call('ChatRead', { from: 0 });
    const reference = first.data.reference;
    assert.ok(reference);
    h.surface.messages[0].mes = '已修改';
    h.surface.messages[0].swipe_id++;
    const repeated = await h.call('ToolResultRead', { reference });
    assert.equal(repeated.data.text, first.data.text);
    assert.equal(repeated.data.reference, reference);
    const other = await fixture(h.surface.messages);
    assert.equal((await other.call('ToolResultRead', { reference })).status, 'failed');
});
