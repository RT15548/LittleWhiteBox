import assert from 'node:assert/strict';
import test from 'node:test';
import { selectL1Evidence } from '../vector/retrieval/l1-evidence-selection.js';
import { buildTemporalTurnCarrier } from '../vector/retrieval/temporal-turn-carrier.js';
import { admitDirectEvidenceItems } from '../generate/direct-evidence-packing.js';

function fixture(rows, count = 1) {
    const parents = Array.from({ length: count }, (_, i) => ({ event: { id: `evt-${i}`, summary: `事件 (#${i + 1})` } }));
    const data = { chunksByFloor: new Map(), chunkVectorsById: new Map(), eventVectorsById: new Map() };
    for (const parent of parents) data.eventVectorsById.set(parent.event.id, { vector: [1, 0, 0] });
    for (const [index, row] of rows.entries()) {
        const chunk = { chunkId: `c-${index}`, floor: row.floor || 0, chunkIdx: index,
            text: row.text || `片段${index}`, speaker: row.speaker, isUser: row.isUser };
        if (!data.chunksByFloor.has(chunk.floor)) data.chunksByFloor.set(chunk.floor, []);
        data.chunksByFloor.get(chunk.floor).push(chunk);
        if (row.vector) data.chunkVectorsById.set(chunk.chunkId, { vector: row.vector });
    }
    return { parents, data };
}

test('event background survives low current-query similarity; lexical passages compete without a dense veto', async () => {
    const { parents, data } = fixture([
        { vector: [1, 0, 0], text: '当时受到威胁，无法赴约' },
        { vector: [0, 1, 0], text: '后来因此不再信任她' },
        { vector: [0, 0, 1], text: '蓝色信封的编号是七号' },
        { vector: [-1, -1, 0], text: '完全无关' },
    ]);
    const result = await selectL1Evidence(parents, data, { queryVector: [0, 1, 0], lexicalScores: [{ chunkId: 'c-2', score: 5 }] });
    assert.deepEqual(new Set(result.items.map(item => item.chunkId)), new Set(['c-0', 'c-1', 'c-2']));
    assert.equal(result.items.find(item => item.chunkId === 'c-0').evidenceLane, 'event');
    assert.equal(result.items.every(item => item.ownerEventId === 'evt-0'), true);
    assert.equal(result.stats.lexicalItems, 1);
    assert.equal(result.items.some(item => 'vector' in item || 'atom' in item), false);
});

test('MMR diversifies additional passages without treating separate sources as duplicates', async () => {
    const { parents, data } = fixture([
        { vector: [0.95, 0.31225, 0], text: '约定' },
        { vector: [0.945, 0.32707, 0], text: '相似的约定' },
        { vector: [0.94, -0.34117, 0], text: '另一角度' },
        { vector: [0.95, 0.31225, 0], text: '约定' },
    ]);
    const result = await selectL1Evidence(parents, data, { queryVector: [0, 0, 1] });
    assert.deepEqual(result.items.slice(0, 2).map(item => item.chunkId), ['c-0', 'c-2']);
    assert.equal(new Set(result.items.map(item => item.chunkId)).size, result.items.length);
});

test('overlapping ranges allocate shared sources in actual rounds before the 4000-token budget', async () => {
    const { parents, data } = fixture([
        { floor: 0, vector: [1, 0, 0] },
        { floor: 1, vector: [0, 0, 1] },
        { floor: 2, vector: [0.8, 0, 0.6], text: '第二个事件唯一的证据' },
        ...Array.from({ length: 20 }, (_, i) => ({ floor: i + 3, vector: [1, 0, 0] })),
    ], 23);
    parents[0].event.summary = '第一个事件 (#1-3)';
    parents.splice(1, 1);
    data.eventVectorsById.set('evt-2', { vector: [0.8, 0, 0.6] });
    const result = await selectL1Evidence(parents, data, { queryVector: [0, 0, 1] });
    assert.equal(result.items[1].chunkId, 'c-2');
    assert.equal(result.items[1].ownerEventId, 'evt-2');
    assert.equal(new Set(result.items.map(item => item.chunkId)).size, result.items.length);
    const budget = { used: 0, max: 4000 };
    const admitted = admitDirectEvidenceItems(result.items.map((chunk, index) => ({
        id: chunk.chunkId, floor: chunk.floor, score: 1 / (index + 1), tokenCost: 200,
        owner: { event: { id: chunk.ownerEventId } },
    })), budget, { floorOverheadTokens: 10 });
    assert.ok(admitted.some(item => item.id === 'c-2'));
    assert.ok(admitted.length < result.items.length);
    assert.ok(budget.used <= 4000);
});

test('identical words from different speakers or turns survive; overlapping events cannot duplicate a source', async () => {
    const { parents, data } = fixture([
        { floor: 0, speaker: 'Alice', vector: [1, 0, 0], text: '我没有拿走钥匙。' },
        { floor: 1, speaker: 'Bob', vector: [1, 0, 0], text: '我没有拿走钥匙。' },
        { floor: 2, speaker: 'Alice', vector: [1, 0, 0], text: '我没有拿走钥匙。' },
    ], 2);
    for (const parent of parents) parent.event.summary = '寻找钥匙 (#1-3)';
    const result = await selectL1Evidence(parents, data, { queryVector: [1, 0, 0] });
    assert.deepEqual(result.items.map(item => [item.speaker, item.floor]), [['Alice', 0], ['Bob', 1], ['Alice', 2]]);
    assert.equal(new Set(result.items.map(item => item.chunkId)).size, 3);
});

test('all selected owners can participate beyond the old first-twenty cap, with at most three passages per lane', async () => {
    const { parents, data } = fixture(Array.from({ length: 30 * 12 }, (_, i) => ({ floor: Math.floor(i / 12), vector: [1, 1, 0] })), 30);
    const result = await selectL1Evidence(parents, data, { queryVector: [0, 1, 0] });
    assert.equal(new Set(result.items.map(item => item.ownerEventId)).size, 30);
    assert.deepEqual(result.items.slice(0, 30).map(item => item.ownerEventId), parents.map(parent => parent.event.id));
    assert.ok(result.items.slice(0, 30).every(item => item.evidenceLane === 'event'));
    assert.deepEqual(result.items.slice(30, 60).map(item => item.ownerEventId), parents.map(parent => parent.event.id));
    assert.ok(result.items.slice(30, 60).every(item => item.evidenceLane === 'conversation'));
    for (const parent of parents) {
        for (const lane of ['event', 'conversation']) assert.ok(result.items.filter(item => item.ownerEventId === parent.event.id && item.evidenceLane === lane).length <= 3);
    }
    assert.ok(result.items.length > 60);
});

test('partial vectors retain usable lexical evidence and report degradation; unselected floors stay out', async () => {
    const { parents, data } = fixture([{ vector: [1, 0, 0] }, {}, { floor: 9, vector: [1, 0, 0] }]);
    const result = await selectL1Evidence(parents, data, { queryVector: [0, 1, 0], lexicalScores: [{ chunkId: 'c-1', score: 1 }] });
    assert.equal(result.status, 'partial-vectors');
    assert.equal(result.stats.missingVectors, 1);
    assert.deepEqual(result.items.map(item => item.chunkId), ['c-0', 'c-1']);
    assert.equal(result.stats.sourceCandidates, 2);
});

test('exact-time carrier survives low semantic relevance but does not gain ordinary budget eligibility', async () => {
    const { parents, data } = fixture([{ vector: [1, 0, 0] }, { vector: [0, 1, 0], text: '113年11月20日03:38 约定' }]);
    const result = await selectL1Evidence(parents, data, { queryVector: [1, 0, 0], temporalCarrier: { marker: '113年11月20日03:38' } });
    const carrier = result.items.find(item => item.chunkId === 'c-1');
    assert.equal(carrier._directEvidenceTemporalCarrier, true);
    assert.equal(carrier._directEvidencePassedMinScore, false);
});

test('event background cannot steal the selected exact-time passage on the same speaker floor', async () => {
    const marker = '113年11月20日03:38';
    const { parents, data } = fixture([
        { vector: [1, 0, 0], isUser: false, text: '走廊里挂着旧画。' },
        { vector: [0, 0.4, Math.sqrt(0.84)], isUser: false, text: 'Alice 说：不要把钥匙交给陌生人。' },
    ]);
    const temporalCarrier = buildTemporalTurnCarrier({
        chat: [{ is_user: false, mes: marker + ' Alice 说：不要把钥匙交给陌生人。' }],
        query: marker + ' Alice 对用户说了什么？', userName: '用户', queryFloor: 1,
    });
    const result = await selectL1Evidence(parents, data, { queryVector: [0, 1, 0], temporalCarrier });
    assert.equal(result.status, 'applied');
    assert.deepEqual(result.items.map(item => item.chunkId), ['c-0', 'c-1']);
    assert.equal(result.items[0]._directEvidenceTemporalCarrier, false);
    assert.equal(result.items[1]._directEvidenceTemporalCarrier, true);
    assert.equal(result.items[1]._directEvidencePassedMinScore, false);
    assert.equal(result.stats.temporalProtectedCandidates, 1);
    const pack = protectedMax => admitDirectEvidenceItems(result.items.map((chunk, index) => ({
        id: chunk.chunkId, floor: chunk.floor, score: 1 / (index + 1), tokenCost: 100,
        temporal: chunk._directEvidenceTemporalCarrier, ordinaryEligible: chunk._directEvidencePassedMinScore,
    })), { used: 0, max: 4000 }, { protectedBudget: { used: 0, max: protectedMax } });
    assert.deepEqual(pack(1600).map(item => item.id), ['c-1', 'c-0']);
    assert.deepEqual(pack(0).map(item => item.id), ['c-0']);
});

test('an exact-time winner keeps its identity when an overlapping owner selects it through the event lane', async () => {
    const { parents, data } = fixture([
        { vector: [1, 0, 0], text: '背景' },
        { vector: [0, 0.4, Math.sqrt(0.84)], text: '113年11月20日03:38 约定' },
    ], 2);
    parents[1].event.summary = '重叠事件 (#1)';
    data.eventVectorsById.set('evt-1', { vector: [0, 0.4, Math.sqrt(0.84)] });
    const result = await selectL1Evidence(parents, data, {
        queryVector: [0, 1, 0], temporalCarrier: { marker: '113年11月20日03:38' },
    });
    const protectedItems = result.items.filter(item => item._directEvidenceTemporalCarrier);
    assert.equal(protectedItems.length, 1);
    assert.equal(protectedItems[0].chunkId, 'c-1');
    assert.equal(protectedItems[0].ownerEventId, 'evt-1');
    assert.equal(protectedItems[0].evidenceLane, 'event');
});

test('temporal candidates remain bounded and excess low-score floors cannot bypass ordinary eligibility', async () => {
    const { parents, data } = fixture(Array.from({ length: 10 }, (_, floor) => ({
        floor, vector: [0, 0, 1], text: '113年11月20日03:38 约定',
    })));
    parents[0].event.summary = '很多时间标记 (#1-10)';
    const result = await selectL1Evidence(parents, data, {
        queryVector: [0, 1, 0], temporalCarrier: { marker: '113年11月20日03:38' },
    });
    assert.equal(result.items.length, 2);
    assert.ok(result.items.every(item => item._directEvidenceTemporalCarrier && !item._directEvidencePassedMinScore));
});

test('bounded diversity work retains lexical and exact-time routes in a large dense candidate pool', async () => {
    const { parents, data } = fixture([
        ...Array.from({ length: 1500 }, () => ({ vector: [1, 1, 0] })),
        { vector: [0, 0, 1], text: '蓝色信封，编号七号' },
        { text: '113年11月20日03:38 没有向量的原文' },
    ]);
    const result = await selectL1Evidence(parents, data, {
        queryVector: [0, 1, 0], lexicalScores: [{ chunkId: 'c-1500', score: 10 }],
        temporalCarrier: { marker: '113年11月20日03:38' },
    });
    assert.ok(result.items.some(item => item.chunkId === 'c-1500'));
    assert.equal(result.items.find(item => item.chunkId === 'c-1501')._directEvidenceTemporalCarrier, true);
    assert.equal(result.status, 'partial-vectors');
    // Work counters expose the performance contract without wall-clock thresholds.
    assert.ok(result.stats.maxMmrCandidates > 0 && result.stats.maxMmrCandidates <= 96);
    assert.ok(result.stats.mmrComparisons > 0 && result.stats.mmrComparisons < 2000);
});

test('shared shortlists refill past claimed sources so later owners still receive all their rounds', async () => {
    const { parents, data } = fixture(Array.from({ length: 300 }, () => ({ vector: [1, 1, 0] })), 30);
    for (const parent of parents) parent.event.summary = '重叠事件 (#1)';
    const result = await selectL1Evidence(parents, data, { queryVector: [0, 1, 0] });
    assert.equal(result.items.length, 180);
    assert.equal(new Set(result.items.map(item => item.chunkId)).size, 180);
    for (const parent of parents) assert.equal(result.items.filter(item => item.ownerEventId === parent.event.id).length, 6);
    assert.ok(result.stats.maxMmrCandidates <= 96);
    assert.ok(result.stats.mmrComparisons < 60_000);
});

test('fusion happens before shortlisting so a joint hit is not lost behind two separate channel heads', async () => {
    const { parents, data } = fixture([
        ...Array.from({ length: 32 }, () => ({ vector: [0.9, 0, Math.sqrt(0.19)] })),
        ...Array.from({ length: 32 }, () => ({ vector: [0, 0, 1] })),
        { vector: [0.6, 0, 0.8], text: '两个通道都命中的证据' },
    ]);
    data.eventVectorsById.set('evt-0', { vector: [0, 1, 0] });
    const result = await selectL1Evidence(parents, data, {
        queryVector: [1, 0, 0], lexicalScores: [
            ...Array.from({ length: 32 }, (_, index) => ({ chunkId: `c-${32 + index}`, score: 100 - index })),
            { chunkId: 'c-64', score: 1 },
        ],
    });
    assert.equal(result.items[0].chunkId, 'c-64');
    assert.equal(result.items[0].evidenceLane, 'conversation');
});

test('cancelled or released sessions stop local selection without returning late evidence', async () => {
    const { parents, data } = fixture([{ vector: [1, 0, 0] }]);
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(selectL1Evidence(parents, data, { signal: controller.signal }), { name: 'AbortError' });
    await assert.rejects(selectL1Evidence(parents, data, { isCurrent: () => false }), { name: 'AbortError' });
});

test('selection yields during a wide event and observes cancellation before producing output', async (t) => {
    let clock = 0;
    t.mock.method(performance, 'now', () => clock += 10);
    const { parents, data } = fixture(Array.from({ length: 1500 }, () => ({ vector: [1, 1, 0] })));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 0);
    try {
        await assert.rejects(selectL1Evidence(parents, data, { queryVector: [0, 1, 0], signal: controller.signal }), { name: 'AbortError' });
    } finally {
        clearTimeout(timer);
    }
});
