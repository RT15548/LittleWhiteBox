import assert from 'node:assert/strict';
import test from 'node:test';
import { mergeEditedFactsWithTimestamps } from '../data/fact-edits.js';

test('saving several new facts assigns distinct identities and preserves existing facts metadata', () => {
    const retained = { id: 'f-12', s: '甲', p: '职业', o: '医生', since: 2, _addedAt: 3, _isState: true };
    const removed = { id: 'f-20', s: '乙', p: '职业', o: '教师', since: 4, _addedAt: 5 };
    const existing = [retained, removed];
    const snapshot = structuredClone(existing);
    const edited = [
        { s: '甲', p: '职业', o: '船医' },
        ...['丙', '丁', '戊'].map(s => ({ s, p: '职业', o: '水手' })),
    ];
    const saved = mergeEditedFactsWithTimestamps(existing, edited, 30);
    assert.deepEqual(saved[0], { ...retained, o: '船医' });
    assert.equal(new Set(saved.map(f => f.id)).size, saved.length);
    assert.ok(saved.every(f => f.id && f.id !== removed.id));
    assert.ok(saved.slice(1).every(f => f.since === 30 && f._addedAt === 30));
    assert.deepEqual(saved.map(({ s, p, o }) => ({ s, p, o })), edited);
    assert.deepEqual(existing, snapshot);
    assert.deepEqual(mergeEditedFactsWithTimestamps(saved, edited, 40), saved);
});

test('new facts receive data-layer identities rather than trusting editor-supplied identities', () => {
    const existing = [{ id: 'f-7', s: '甲', p: '位置', o: '船上' }];
    const incoming = ['乙', '丙', '丁'].map(s => ({ id: 'f-7', s, p: '位置', o: '船上' }));
    const saved = mergeEditedFactsWithTimestamps(existing, incoming, 4);
    assert.equal(new Set(saved.map(f => f.id)).size, incoming.length);
    assert.ok(saved.every(f => f.id !== existing[0].id));
});
