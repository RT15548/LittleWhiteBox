import test from 'node:test';
import assert from 'node:assert/strict';
import { maintenanceFixture, joinedEventPatch } from './fixtures/memory-maintenance.js';
import { editMemory } from '../maintenance/domain.js';
import { comparisonRows, presentMaintenanceReceipt } from '../maintenance/presentation.js';
import { readMaintenanceSource } from '../maintenance/source-view.js';
import { SOURCE_PAGE_CHARS } from '../maintenance/evidence.js';
import { projectMaintenanceReceipts } from '../maintenance/history.js';

function sample() {
    const fixture = maintenanceFixture();
    const merged = editMemory(fixture, { kind: 'merge', collection: 'events', key: 'evt-1', removeIds: ['evt-2'], patch: joinedEventPatch }, fixture.cutoff);
    const receipt = { id: 'review', cutoff: fixture.cutoff + 1, operations: [{ kind: 'merge', collection: 'events', key: 'evt-1', changes: merged.changes }],
        coverage: { supplied: [], missingAnchors: [{ floor: 18 }] } };
    return { ...fixture, receipt, store: { summaryHistory: [{ maintenance: [receipt] }] } };
}

test('display identifies records by narrative content without changing the stored receipt', () => {
    const fixture = sample();
    const previous = structuredClone(fixture.receipt);
    const result = presentMaintenanceReceipt(fixture.receipt, fixture);
    assert.equal(result.eventNames['evt-2'], fixture.json.events[1].title);
    assert.equal(result.coverage.missingAnchors[0].floor, 18);
    assert.deepEqual(result.operations, fixture.receipt.operations);
    assert.deepEqual(fixture.receipt, previous);
});

test('comparisons show only changed business fields and resolve causal references to event titles', () => {
    const fixture = sample();
    const result = presentMaintenanceReceipt(fixture.receipt, fixture);
    const redirect = result.operations[0].changes.find(change => change.key === 'evt-4');
    const rows = comparisonRows(redirect, result.eventNames);
    assert.deepEqual(rows.map(row => row.field), ['causedBy']);
    assert.equal(rows[0].before, fixture.json.events[1].title);
    assert.equal(rows[0].after, fixture.json.events[0].title);
    const full = comparisonRows(result.operations[0].changes[0], result.eventNames, true);
    assert.deepEqual(full.map(row => row.field), ['title', 'timeLabel', 'summary', 'participants', 'causedBy', 'memoryRole']);
});

test('all memory types have readable comparisons, including deletions and nested arc moments', () => {
    const records = {
        anchors: { semantic: '保留这段经历', edges: [{ s: '甲', r: '告别', t: '乙' }], where: '北京', floor: 1, atomId: 'hidden', quality: 1 },
        arcs: { name: '甲', trajectory: '逐渐信任', progress: 0.5, moments: [{ text: '交付钥匙', _addedAt: 10 }] },
        characters: '甲', facts: { s: '甲', p: '承诺', o: '保存旧书', since: 1, id: 'hidden', _addedAt: 10 },
        keywords: { text: '旧书', weight: '重要' }, characterAliases: { from: '旅人', to: '甲', evidence: '本人确认' },
    };
    for (const [collection, before] of Object.entries(records)) {
        const rows = comparisonRows({ collection, before, after: null });
        assert.ok(rows.length > 0);
        assert.ok(rows.every(row => typeof row.before === 'string' && typeof row.after === 'string'));
        assert.equal(rows.some(row => ['id', 'atomId', 'quality', '_addedAt'].includes(row.field)), false);
    }
    const moments = comparisonRows({ collection: 'arcs', before: records.arcs, after: null }).find(row => row.field === 'moments');
    assert.equal(moments.before, records.arcs.moments[0].text);
});

test('source viewing is read-only, paginates exactly and includes adjacent user and assistant context', () => {
    const fixture = sample();
    fixture.chat[17].mes = '甲'.repeat(SOURCE_PAGE_CHARS + 3);
    const before = structuredClone(fixture);
    const request = { chatId: fixture.chatId, receiptId: 'review', requestId: 1, floor: 18 };
    const first = readMaintenanceSource(fixture, request);
    const last = readMaintenanceSource(fixture, { ...request, offset: first.nextOffset });
    assert.equal(first.text + last.text, fixture.chat[17].mes);
    assert.equal(first.previousFloor, 17);
    assert.equal(first.nextFloor, 19);
    assert.equal(last.nextOffset, null);
    assert.equal(readMaintenanceSource(fixture, { ...request, floor: 17 }).role, 'user');
    assert.deepEqual(fixture, before);
});

test('source viewing refuses other chats, removed receipts, invalid cursors and floors beyond the review', () => {
    const fixture = sample();
    const request = { chatId: fixture.chatId, receiptId: 'review', requestId: 1, floor: 18 };
    for (const patch of [{ chatId: 'other' }, { receiptId: 'removed' }, { floor: 25 }, { floor: 0 }, { offset: -1 }, { offset: 99999 }]) {
        const result = readMaintenanceSource(fixture, { ...request, ...patch });
        assert.equal(result.status, 'unavailable');
        assert.equal(Object.hasOwn(result, 'text'), false);
    }
});

test('results paginate by run and retain saved edits with the final reply and status', () => {
    const coverage = { supplied: [{ floor: 1, start: 0, end: 10, view: 'story' }], missingAnchors: [] };
    const receipts = [
        { id: 'older', runId: 'old', operations: [], coverage },
        { id: 'one', runId: 'new', operations: [], summary: '修正', coverage },
        { id: 'two', runId: 'new', operations: [], summary: '已结束', outcome: { status: 'completed' }, coverage },
    ];
    const store = { summaryHistory: [{ maintenance: receipts }] };
    const page = projectMaintenanceReceipts(store, 0, 1);
    assert.equal(page.total, 2);
    assert.equal(page.next, 1);
    assert.deepEqual(page.runIds, ['new', 'old']);
    assert.deepEqual(page.items[0].receiptIds, ['two', 'one']);
    assert.equal(page.items[0].outcome.status, 'completed');
    assert.equal(page.items[0].summary, receipts[2].summary);
    assert.equal(page.items[0].coverage.supplied.length, 1);
    assert.equal(projectMaintenanceReceipts(store, page.next, 1).items[0].id, 'old');
});

test('reports never promote edit notes to a final reply, including interrupted and failed runs', () => {
    const coverage = { supplied: [], missingAnchors: [] };
    const edit = { id: 'edit', runId: 'run', operations: [], summary: 'working note', coverage };
    const final = { ...edit, id: 'final', outcome: { status: 'failed' }, summary: '' };
    for (const receipts of [[edit], [edit, final]]) {
        const store = { summaryHistory: [{ maintenance: receipts }] };
        const before = structuredClone(store);
        assert.equal(projectMaintenanceReceipts(store).items[0].summary, '');
        assert.deepEqual(store, before);
    }
});
