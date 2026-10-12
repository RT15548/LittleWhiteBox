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
    const apps = registry.list().map(app => app.id);
    if (apps.length) { await executor.execute(TOOLS_LOAD, { apps }, 'load', -1); }
    return { executor, operations, surface, call: (name, args) => executor.execute(name, args, String(++sequence), sequence) };
}

function largeResultRegistry(read) {
    const registry = createManagementRegistry();
    const tools = [{ effect: 'read', label: 'Read', target: () => '', definition: { type: 'function', function: {
        name: 'LargeRead', description: '', parameters: { type: 'object', properties: {} },
    } } }];
    registry.register({
        id: 'fixture', label: 'Fixture', prompt: '', tools,
        async open() {
            return {
                prompt: '', initial: {},
                tools,
                async execute() { return { ok: true, status: 'read', data: read() }; },
            };
        },
    });
    return registry;
}

const storyCases = [
    { label: 'a single floor without to', texts: ['字'.repeat(MANAGEMENT_READ_CHARS * 2 + 1)] },
    { label: 'long Unicode and escaped text across floors', texts: [
        '字'.repeat(MANAGEMENT_READ_CHARS - 1) + '🙂',
        '<p>她说："好。🙂" & {信件}</p>\n'.repeat(1600), '', '末楼',
    ] },
    { label: 'more floors than one page', texts: Array.from({ length: ADMINISTRATOR_POLICY.chatReadFloors + 3 }, (_, floor) => `楼层-${floor}`) },
];
for (const { label, texts } of storyCases) {
    test(`ChatRead follows its returned next directly and preserves ${label}`, async () => {
        const messages = texts.map(mes => ({ mes, swipe_id: 0, is_system: true }));
        const before = structuredClone(messages);
        const h = await fixture(messages);
        const joined = texts.map(() => ''), floors = new Set();
        let args = texts.length === 1 ? { from: 0 } : { from: 0, to: texts.length - 1 };
        let calls = 0;
        do {
            const response = await h.call('ChatRead', args);
            assert.equal(response.status, 'read');
            const page = response.data;
            assert.ok(Array.isArray(page.items));
            assert.ok(page.items.length > 0 && page.items.length <= ADMINISTRATOR_POLICY.chatReadFloors);
            assert.ok(page.items.reduce((chars, item) => chars + item.text.length, 0) <= MANAGEMENT_READ_CHARS);
            for (const item of page.items) {
                assert.equal(item.offset, joined[item.floor].length);
                assert.equal(item.totalChars, texts[item.floor].length);
                joined[item.floor] += item.text;
                floors.add(item.floor);
            }
            assert.equal(page.complete, page.next === null);
            args = page.next;
            assert.ok(++calls < 100);
        } while (args);
        assert.ok(calls > 1);
        assert.deepEqual(joined, texts);
        assert.deepEqual([...floors], texts.map((_, floor) => floor));
        assert.deepEqual(h.surface.messages, before);
        assert.equal(h.operations.length, calls);
        assert.ok(h.operations.every(op => !Object.hasOwn(op, 'text') && !Object.hasOwn(op, 'data')));
    });
}

test('a full page ending at floor 6 exposes the next range and permits overlapping rereads', async () => {
    const h = await fixture(Array.from({ length: 9 }, () => ({ mes: '原'.repeat(MANAGEMENT_READ_CHARS / 6), swipe_id: 0 })));
    const first = await h.call('ChatRead', { from: 1, to: 8 });
    assert.equal(first.status, 'read');
    assert.deepEqual(first.data.items.map(item => item.floor), [1, 2, 3, 4, 5, 6]);
    assert.deepEqual(first.data.next, { from: 7, to: 8, offset: 0 });
    const next = await h.call('ChatRead', first.data.next);
    assert.equal(next.status, 'read');
    assert.deepEqual(next.data.items.map(item => item.floor), [7, 8]);
    assert.equal(next.data.complete, true);
    const repeated = await h.call('ChatRead', { from: 6, to: 8 });
    assert.equal(repeated.status, 'read');
    assert.deepEqual(repeated.data.items.map(item => item.floor), [6, 7, 8]);
    const single = await h.call('ChatRead', { from: 6 });
    assert.equal(single.status, 'read');
    assert.equal(single.data.items[0].text, h.surface.messages[6].mes);
});

test('escaped search snippets keep their matches and direct continuation together', async () => {
    const h = await fixture(Array.from({ length: ADMINISTRATOR_POLICY.chatSearchMatches + 2 }, () => ({ mes: 'needle' + '<>&{}'.repeat(100) })));
    const floors = [];
    let args = { query: 'needle' };
    do {
        const response = await h.call('ChatSearch', args);
        assert.equal(response.status, 'read');
        assert.ok(Array.isArray(response.data.items));
        floors.push(...response.data.items.map(item => item.floor));
        assert.equal(response.data.complete, response.data.next === null);
        args = response.data.next;
        assert.ok(h.operations.length < 10);
    } while (args);
    assert.deepEqual(floors, h.surface.messages.map((_, floor) => floor));
});

test('continuing a near-budget result does not evict its source; details expire with that source', async () => {
    const registry = largeResultRegistry(() => '原'.repeat(ADMINISTRATOR_POLICY.evidenceChars - 1000));
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

test('structured story pages retain captured evidence for the UI and reject edited source continuations', async () => {
    const h = await fixture([{ mes: '<p>原文</p>'.repeat(1800), swipe_id: 0 }]);
    const first = await h.call('ChatRead', { from: 0 });
    const { receipt, ...original } = first;
    assert.ok(first.data.next);
    h.surface.messages[0].mes = '已修改';
    h.surface.messages[0].swipe_id++;
    let serialized = '', offset = 0;
    do {
        const page = h.executor.evidence(receipt.id, offset);
        assert.ok(page.text.length <= MANAGEMENT_READ_CHARS);
        serialized += page.text;
        offset = page.nextOffset;
    } while (offset !== null);
    assert.deepEqual(JSON.parse(serialized), original);
    const failed = await h.call('ChatRead', first.data.next);
    assert.equal(failed.status, 'failed');
    const fresh = await h.call('ChatRead', { from: 0 });
    assert.equal(fresh.data.items[0].text, h.surface.messages[0].mes);
    const other = await fixture(h.surface.messages);
    assert.throws(() => other.executor.evidence(receipt.id));
});

test('generic result pages reconstruct captured data and stay scoped to their original run', async () => {
    const original = { text: '<p>她说："好。🙂" & {信件}</p>\n'.repeat(1800) };
    let current = original;
    const registry = largeResultRegistry(() => current);
    const h = await fixture([], registry);
    const first = await h.call('LargeRead', {});
    const reference = first.data.reference;
    assert.ok(reference);
    current = { text: 'modified' };
    const repeated = await h.call('ToolResultRead', { reference });
    assert.equal(repeated.data.text, first.data.text);
    assert.equal(repeated.data.reference, reference);
    let response = first, serialized = '', calls = 0;
    do {
        const page = response.data;
        assert.equal(response.status, 'read');
        assert.equal(page.reference, reference);
        assert.equal(page.offset, serialized.length);
        assert.ok(page.text.length <= MANAGEMENT_READ_CHARS);
        assert.equal(h.executor.evidence(response.receipt.id).text, page.text);
        serialized += page.text;
        if (page.nextOffset === null) { break; }
        response = await h.call('ToolResultRead', { reference, offset: page.nextOffset });
        assert.ok(++calls < 100);
    } while (true);
    assert.deepEqual(JSON.parse(serialized), { ok: true, status: 'read', data: original });
    const other = await fixture([], registry);
    assert.equal((await other.call('ToolResultRead', { reference })).status, 'failed');
});
