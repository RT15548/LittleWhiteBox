import assert from 'node:assert/strict';
import test from 'node:test';
import { createAdministratorChatReader } from '../apps/administrator/host/chat-reader.js';
import { MANAGEMENT_READ_CHARS } from '../capabilities/management/read-page.js';
import { createHideStateController } from '../../story-summary/hide-state.js';

function readerFixture(messages = Array.from({ length: 70 }, (_, i) => ({ mes: `楼层-${i}`, name: '旁白', swipe_id: 0 }))) {
    const surface = { identityKey: 'fixture', playerName: '玩家', assistantName: '旁白', messages };
    const abort = new AbortController();
    return { surface, abort, reader: createAdministratorChatReader(() => surface, () => abort.signal) };
}
test('administrator reads every floor including system and empty messages with original indices through pagination', async () => {
    const { surface, reader } = readerFixture();
    Object.assign(surface.messages[4], { is_system: true, is_user: false, name: 'System', extra: { type: 'generic' } });
    surface.messages[5].mes = '';
    for (const floor of [0, 4, 55, 69]) { const value = await reader.read({ from: floor }); assert.equal(value.items[0].floor, floor); assert.equal(value.items[0].text, `楼层-${floor}`); }
    const floors = []; let args = { from: 0, to: 69 };
    do { const value = await reader.read(args); floors.push(...value.items.map(item => item.floor)); args = value.next; } while (args);
    assert.deepEqual(floors, Array.from({ length: 70 }, (_, i) => i));
    const empty = await reader.read({ from: 5 });
    assert.deepEqual(empty.scanned, { from: 5, to: 5 }); assert.equal(empty.items[0].text, '');
    const system = await reader.search({ query: surface.messages[4].mes, from: 4, to: 4 });
    assert.deepEqual(system.items.map(item => item.floor), [4]);
    assert.equal(system.items[0].speaker, 'System');
});
test('summary hiding preserves searchable and readable original floors without changing host messages', async () => {
    const { surface, reader } = readerFixture([
        { mes: '我交出了信件。', name: '玩家', is_user: true, is_system: false },
        { mes: '收件人确认收到信件。', name: '旁白', is_user: false, is_system: false, swipe_id: 0 },
        { mes: '继续出发。', name: '玩家', is_user: true, is_system: false },
    ]);
    const beforeSearch = await reader.search({ query: '信件' });
    const beforeRead = await reader.read({ from: 0, to: 2 });
    assert.deepEqual(beforeSearch.items.map(item => item.floor), [0, 1]);
    assert.deepEqual(beforeRead.items.map(item => item.role), ['user', 'assistant', 'user']);
    const hiding = createHideStateController({
        getState: () => ({ chatId: surface.identityKey, chat: surface.messages, enabled: true,
            summaryBoundary: 1, useVectorBoundary: false, keepVisibleCount: 0 }),
        renderMessage() {}, refresh() {}, async save() {}, onError(error) { throw error; },
    });
    await hiding.reconcile();
    assert.deepEqual(surface.messages.map(item => item.is_system), [true, true, false]);
    const hiddenMessages = structuredClone(surface.messages);
    assert.equal(reader.isCurrent(), true);
    assert.deepEqual(await reader.search({ query: '信件' }), beforeSearch);
    assert.deepEqual(await reader.read({ from: 0, to: 2 }), beforeRead);
    assert.deepEqual(surface.messages, hiddenMessages);
});
test('long floor continuation reconstructs exact Unicode text; edited or swiped evidence cannot authorize a write', async () => {
    const { surface, reader } = readerFixture();
    const original = '字'.repeat(MANAGEMENT_READ_CHARS - 1) + '🙂'.repeat(15000);
    surface.messages[55].mes = original;
    surface.messages[55].is_system = true;
    let joined = '', args = { from: 55 };
    do { const result = await reader.read(args); joined += result.items[0].text; args = result.next; } while (args);
    assert.equal(joined, original); assert.equal(reader.isCurrent(), true);
    surface.messages[55].swipe_id = 1; assert.equal(reader.isCurrent(), false); assert.deepEqual(reader.staleEvidence(), { floors: [55], missingFloors: [] });
    await reader.read({ from: 55 }); assert.equal(reader.isCurrent(), true);
    surface.messages[55].mes += '改'; assert.equal(reader.isCurrent(), false);
});
test('literal search pages without shifted floors or regex injection; scans can be cancelled', async () => {
    const { surface, reader, abort } = readerFixture();
    surface.messages.forEach((m, i) => { m.mes = i === 55 ? 'İabc [x].*' : '[x].*'; m.is_system = i % 2 === 0; });
    let args = { query: '[x].*' }; const floors = [];
    do { const result = await reader.search(args); floors.push(...result.items.map(item => item.floor)); args = result.next; } while (args);
    assert.deepEqual(floors, Array.from({ length: 70 }, (_, i) => i));
    const result = await reader.search({ query: 'abc', from: 55, to: 55 }); assert.equal(result.items[0].snippet, 'İabc [x].*');
    const pending = reader.search({ query: 'none' }); abort.abort(); await assert.rejects(pending, error => error.name === 'AbortError');
});

test('continuing an edited floor cannot replace the earlier page evidence', async () => {
    for (const change of ['text', 'swipe']) {
        const { surface, reader } = readerFixture();
        surface.messages[55].mes = 'a'.repeat(MANAGEMENT_READ_CHARS * 2);
        surface.messages[55].is_system = true;
        const page = await reader.read({ from: 55 });
        if (change === 'text') { surface.messages[55].mes = 'b' + surface.messages[55].mes.slice(1); }
        else { surface.messages[55].swipe_id++; }
        await assert.rejects(reader.read(page.next));
        assert.equal(reader.isCurrent(), false);
        await reader.read({ from: 55 });
        assert.equal(reader.isCurrent(), true);
    }
});
