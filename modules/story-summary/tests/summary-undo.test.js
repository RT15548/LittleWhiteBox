import assert from 'node:assert/strict';
import test from 'node:test';

import { applyCharacterAliasUpdates } from '../data/character-aliases.js';
import {
    applyExactSummaryHistoryUndo,
    applySummaryUndo,
    buildSummaryUndo,
    normalizeSummaryUndo,
} from '../data/summary-undo.js';

function makeBaseline() {
    return {
        keywords: [{ text: '旧关键词', weight: '核心', _addedAt: 10 }],
        events: [{ id: 'evt-1', summary: '旧事件', participants: ['小红'], _addedAt: 10 }],
        characters: { main: [{ name: '小红', _addedAt: 10 }] },
        arcs: [{ name: '小红', trajectory: '尚未靠近', progress: 0.2, moments: [], _addedAt: 10 }],
        facts: [
            { id: 'f-1', s: '小红', p: '住处', o: '城南', _addedAt: 10 },
            { id: 'f-2', s: '乙', p: '身份', o: '学生', _addedAt: 10 },
        ],
        characterAliases: [],
    };
}

test('one batch undo restores all summary collections atomically', () => {
    const before = makeBaseline();
    const after = structuredClone(before);
    after.keywords = [{ text: '新关键词', weight: '重要', _addedAt: 20 }];
    after.events.push({ id: 'evt-2', summary: '新事件', participants: ['乙'], _addedAt: 20 });
    after.characters.main.push({ name: '丙', _addedAt: 20 });
    after.arcs[0] = { ...after.arcs[0], trajectory: '开始靠近', progress: 0.5 };
    after.facts[0] = { ...after.facts[0], o: '城北' };

    const restored = applySummaryUndo(after, buildSummaryUndo(before, after));
    assert.deepEqual(restored, before);
});

test('undo preserves unrelated manual additions', () => {
    const before = makeBaseline();
    const generated = structuredClone(before);
    generated.events.push({ id: 'evt-2', summary: 'AI 事件', participants: [], _addedAt: 20 });
    generated.facts[0] = { ...generated.facts[0], o: '城北' };
    const undo = buildSummaryUndo(before, generated);

    const current = structuredClone(generated);
    current.events.push({ id: 'evt-manual', summary: '人工事件', participants: [], _addedAt: 21 });
    current.facts.push({ id: 'f-manual', s: '丙', p: '身份', o: '医生', _addedAt: 21 });
    const restored = applySummaryUndo(current, undo);

    assert.deepEqual(restored.events, [before.events[0], current.events[2]]);
    assert.deepEqual(restored.facts, [...before.facts, current.facts[2]]);
});

test('manual edits to a touched item reject the whole undo without mutation', () => {
    const before = makeBaseline();
    const generated = structuredClone(before);
    generated.events[0] = { ...generated.events[0], summary: 'AI 改写' };
    generated.facts[0] = { ...generated.facts[0], o: '城北' };
    const undo = buildSummaryUndo(before, generated);
    const current = structuredClone(generated);
    current.events[0].summary = '人工改写';
    const snapshot = structuredClone(current);

    assert.equal(applySummaryUndo(current, undo), null);
    assert.deepEqual(current, snapshot);
});

test('alias canonicalization is part of the same undo record', () => {
    const before = makeBaseline();
    const merged = structuredClone(before);
    merged.events[0].summary = 'AI 新事件';
    merged.facts[0].o = '记者';
    const aliasResult = applyCharacterAliasUpdates(merged, [{
        to: '红叶',
        from: ['小红'],
        evidence: '#20 自报姓名',
    }], 20);
    const undo = buildSummaryUndo(before, aliasResult.json, { aliasChanged: true });

    assert.deepEqual(applySummaryUndo(aliasResult.json, undo), before);
});

test('manual edits after alias canonicalization reject the whole undo', () => {
    const before = makeBaseline();
    const merged = structuredClone(before);
    merged.facts[0].o = '记者';
    const aliasResult = applyCharacterAliasUpdates(merged, [{
        to: '红叶',
        from: ['小红'],
        evidence: '#20 自报姓名',
    }], 20);
    const undo = buildSummaryUndo(before, aliasResult.json, { aliasChanged: true });
    const current = structuredClone(aliasResult.json);
    current.facts[0].o = '人工改成摄影师';

    assert.equal(applySummaryUndo(current, undo), null);
    assert.equal(current.facts[0].o, '人工改成摄影师');
    assert.equal(current.facts[0].s, '红叶');
});

test('exact history rolls back to the legacy baseline before old best-effort handling', () => {
    const baseline = makeBaseline();
    const afterFirst = structuredClone(baseline);
    afterFirst.facts[0] = { ...afterFirst.facts[0], o: '城北' };
    const afterSecond = structuredClone(afterFirst);
    afterSecond.events.push({ id: 'evt-2', summary: '第二批', participants: [], _addedAt: 30 });
    const history = [
        { endMesId: 10 },
        {
            format: 1,
            previousEndMesId: 10,
            endMesId: 20,
            undo: buildSummaryUndo(baseline, afterFirst),
        },
        {
            format: 1,
            previousEndMesId: 20,
            endMesId: 30,
            undo: buildSummaryUndo(afterFirst, afterSecond),
        },
    ];

    const toBaseline = applyExactSummaryHistoryUndo(afterSecond, history, 10, 30);
    assert.equal(toBaseline.historyDiscontinuous, false);
    assert.equal(toBaseline.crossedLegacyHistory, false);
    assert.deepEqual(toBaseline.json, baseline);

    const acrossBaseline = applyExactSummaryHistoryUndo(afterSecond, history, 5, 30);
    assert.equal(acrossBaseline.historyDiscontinuous, false);
    assert.equal(acrossBaseline.crossedLegacyHistory, true);
    assert.equal(acrossBaseline.restoredEndMesId, 10);
    assert.deepEqual(acrossBaseline.json, baseline);
});

test('a broken history chain is rejected before any partial rollback', () => {
    const baseline = makeBaseline();
    const current = structuredClone(baseline);
    current.facts[0] = { ...current.facts[0], o: '城北' };
    const result = applyExactSummaryHistoryUndo(current, [{
        format: 1,
        previousEndMesId: 20,
        endMesId: 30,
        undo: buildSummaryUndo(baseline, current),
    }], 10, 30);

    assert.equal(result.historyDiscontinuous, true);
    assert.deepEqual(result.json, current);
});

test('invalid exact undo data is never downgraded to legacy history', () => {
    assert.equal(normalizeSummaryUndo({ version: 1, unknownField: true }), null);
    assert.equal(normalizeSummaryUndo({
        version: 1,
        eventChanges: [{ key: 'evt-1', index: 0, previous: null }],
    }), null);

    const current = makeBaseline();
    const result = applyExactSummaryHistoryUndo(current, [{
        format: 1,
        previousEndMesId: 10,
        endMesId: 20,
        undo: { version: 1, eventChanges: [{ key: 'evt-1', index: 0, previous: null }] },
    }], 10, 20);
    assert.equal(result.historyDiscontinuous, true);
    assert.equal(result.crossedLegacyHistory, false);
});

test('undo change keys must match the identity of their stored objects', () => {
    const mismatchedDelete = {
        version: 1,
        eventChanges: [{
            key: 'evt-fake',
            index: 0,
            previous: { id: 'evt-real', summary: '不应被插入' },
            generated: null,
        }],
    };

    assert.equal(normalizeSummaryUndo(mismatchedDelete), null);
    assert.equal(applySummaryUndo(makeBaseline(), mismatchedDelete), null);
});

test('exact first-batch undo reaches boundary -1 and preserves unrelated manual additions', () => {
    const before = {
        keywords: [],
        events: [],
        characters: { main: [] },
        arcs: [],
        facts: [],
        characterAliases: [],
    };
    const generated = structuredClone(before);
    generated.events.push({ id: 'evt-2', summary: '首批生成事件', participants: [], _addedAt: 20 });
    const current = structuredClone(generated);
    current.events.push({ id: 'evt-manual', summary: '人工新增事件', participants: [], _addedAt: 21 });
    const history = [{
        format: 1,
        previousEndMesId: -1,
        endMesId: 20,
        undo: buildSummaryUndo(before, generated),
    }];

    const result = applyExactSummaryHistoryUndo(current, history, -1, 20);
    assert.equal(result.historyDiscontinuous, false);
    assert.equal(result.restoredEndMesId, -1);
    assert.deepEqual(result.json.events, [current.events[1]]);
});
