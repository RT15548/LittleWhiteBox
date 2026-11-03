import assert from 'node:assert/strict';
import test from 'node:test';
import { selectL1Evidence } from '../vector/retrieval/l1-evidence-selection.js';
import { buildTemporalTurnCarrier } from '../vector/retrieval/temporal-turn-carrier.js';
import { admitDirectEvidenceItems, buildRankRelevance } from '../generate/direct-evidence-packing.js';

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

test('visible originals are excluded before lane selection, including temporal and lexical matches', async () => {
    const marker = '113年11月20日03:38';
    const { data } = fixture([0, 1, 2, 3].map(floor => ({ floor, vector: [1, 0, 0], text: marker })));
    const parents = [{ event: { id: 'event', summary: 'range (#1-4)' } }];
    const options = { queryVector: [1, 0, 0], hiddenThrough: 1,
        sourceTurns: [{ floor: 2, contextFloor: 1 }, { floor: 0 }],
        lexicalScores: [{ chunkId: 'c-3', score: 100 }], temporalCarrier: { marker } };
    const result = await selectL1Evidence(parents, data, options);
    assert.deepEqual(new Set(result.items.map(item => item.floor)), new Set([0, 1]));
    assert.equal(result.stats.sourceCandidates, 2);
    const visible = await selectL1Evidence(parents, data, { ...options, hiddenThrough: -1 });
    assert.deepEqual(visible.items, []);
    assert.equal(visible.stats.sourceCandidates, 0);
    const hidden = await selectL1Evidence(parents, data, { ...options, hiddenThrough: 3 });
    assert.equal(hidden.stats.sourceCandidates, 4);
});

test('summary similarity alone cannot admit irrelevant background; query and lexical detail survive', async () => {
    const { parents, data } = fixture([
        { vector: [1, 0, 0], text: '当时受到威胁，无法赴约' },
        { vector: [0, 1, 0], text: '后来因此不再信任她' },
        { vector: [0, 0, 1], text: '蓝色信封的编号是七号' },
        { vector: [-1, -1, 0], text: '完全无关' },
    ]);
    const result = await selectL1Evidence(parents, data, { queryVector: [0, 1, 0], lexicalScores: [{ chunkId: 'c-2', score: 5 }] });
    assert.deepEqual(new Set(result.items.map(item => item.chunkId)), new Set(['c-1', 'c-2']));
    assert.equal(result.items.some(item => 'ownerEventId' in item || 'eventScore' in item), false);
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
    const result = await selectL1Evidence(parents, data, { queryVector: [1, 0, 0] });
    assert.ok(result.items.some(item => item.chunkId === 'c-2'));
    assert.ok(result.items.some(item => item.chunkId === 'c-3'));
    assert.equal(new Set(result.items.map(item => item.chunkId)).size, result.items.length);
});

test('overlapping ranges cannot duplicate or reorder query evidence', async () => {
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
    const reversed = await selectL1Evidence([...parents].reverse(), data, { queryVector: [0, 0, 1] });
    assert.deepEqual(result.items, reversed.items);
    assert.equal(new Set(result.items.map(item => item.chunkId)).size, result.items.length);
    const budget = { used: 0, max: 4000 };
    const admitted = admitDirectEvidenceItems(result.items.map((chunk, index) => ({
        id: chunk.chunkId, floor: chunk.floor, score: 1 / (index + 1), tokenCost: 200,
        owner: { event: { id: chunk.ownerEventId } },
    })), budget, { floorOverheadTokens: 10 });
    assert.ok(admitted.some(item => item.id === 'c-2'));
    assert.equal(budget.used, admitted.length * 210);
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

test('three query-oriented lanes share a tight budget without duplicate sources', async () => {
    const { parents, data } = fixture(Array.from({ length: 30 * 12 }, (_, i) => ({ floor: Math.floor(i / 12), vector: [1, 1, 0] })), 30);
    const result = await selectL1Evidence(parents, data, { queryVector: [0, 1, 0],
        sourceTurns: Array.from({ length: 30 }, (_, floor) => ({ floor })) });
    assert.equal(new Set(result.items.map(item => item.floor)).size, 30);
    assert.ok(result.items.length <= 270);
    assert.equal(new Set(result.items.map(item => item.chunkId)).size, result.items.length);
    assert.equal(result.stats.queryItems + result.stats.floorItems + result.stats.conversationItems, result.items.length);
    const relevance = buildRankRelevance(result.items, item => item.chunkId);
    const budget = { used: 0, max: 1800 };
    const admitted = admitDirectEvidenceItems(result.items.map(chunk => ({
        id: chunk.chunkId, floor: chunk.floor, lane: chunk.evidenceLane,
        score: relevance.get(chunk.chunkId), tokenCost: 200, owner: { event: { id: chunk.ownerEventId } },
    })), budget);
    assert.deepEqual(admitted.map(item => item.lane),
        [...Array(3).fill('query'), ...Array(3).fill('floor'), ...Array(3).fill('conversation')]);
    assert.equal(budget.used, 1800);
});

test('lane rotation drains empty or short lanes without losing the other lane or its order', async () => {
    for (const [events, conversations] of [[0, 0], [0, 8], [8, 0], [3, 8], [8, 3]]) {
        const { parents, data } = fixture(Array.from({ length: events + conversations }, (_, floor) => ({
            floor, vector: floor < events ? [1, 0, 0] : [0, 1, 0],
        })), events + conversations);
        const result = await selectL1Evidence(parents, data, { queryVector: [0, 1, 0],
            lexicalScores: Array.from({ length: events }, (_, i) => ({ chunkId: `c-${i}`, score: 1 })) });
        assert.equal(result.items.length, events + conversations);
        assert.equal(new Set(result.items.map(item => item.chunkId)).size, events + conversations);
        for (const lane of ['query', 'floor', 'conversation']) {
            const floors = result.items.filter(item => item.evidenceLane === lane).map(item => item.floor);
            assert.deepEqual(floors, [...floors].sort((a, b) => a - b));
        }
    }
});

test('partial vectors retain usable lexical evidence and report degradation; unselected floors stay out', async () => {
    const { parents, data } = fixture([{ vector: [1, 0, 0] }, {}, { floor: 9, vector: [1, 0, 0] }]);
    const result = await selectL1Evidence(parents, data, { queryVector: [0, 1, 0], lexicalScores: [{ chunkId: 'c-1', score: 1 }] });
    assert.equal(result.status, 'partial-vectors');
    assert.equal(result.stats.missingVectors, 1);
    assert.deepEqual(result.items.map(item => item.chunkId), ['c-1']);
    assert.equal(result.stats.sourceCandidates, 2);
});

test('exact-time carrier survives low semantic relevance but does not gain ordinary budget eligibility', async () => {
    const { parents, data } = fixture([{ vector: [1, 0, 0] }, { vector: [0, 1, 0], text: '113年11月20日03:38 约定' }]);
    const result = await selectL1Evidence(parents, data, { queryVector: [1, 0, 0], temporalCarrier: { marker: '113年11月20日03:38' } });
    const carrier = result.items.find(item => item.chunkId === 'c-1');
    assert.equal(carrier._directEvidenceTemporalCarrier, true);
    assert.equal(carrier._directEvidencePassedMinScore, false);
});

test('irrelevant background cannot steal exact-time protection on the same speaker floor', async () => {
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
    assert.deepEqual(result.items.map(item => item.chunkId), ['c-1']);
    assert.equal(result.items[0]._directEvidenceTemporalCarrier, true);
    assert.equal(result.items[0]._directEvidencePassedMinScore, false);
    assert.equal(result.stats.temporalProtectedCandidates, 1);
    const pack = protectedMax => admitDirectEvidenceItems(result.items.map((chunk, index) => ({
        id: chunk.chunkId, floor: chunk.floor, score: 1 / (index + 1), tokenCost: 100,
        temporal: chunk._directEvidenceTemporalCarrier, ordinaryEligible: chunk._directEvidencePassedMinScore,
    })), { used: 0, max: 4000 }, { protectedBudget: { used: 0, max: protectedMax } });
    assert.deepEqual(pack(1600).map(item => item.id), ['c-1']);
    assert.deepEqual(pack(0).map(item => item.id), []);
});

test('an exact-time winner is unique across overlapping source ranges', async () => {
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
    assert.equal(protectedItems[0]._directEvidencePassedMinScore, false);
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

test('duplicating an event range cannot multiply passage quotas or change selection', async () => {
    const { parents, data } = fixture(Array.from({ length: 300 }, () => ({ vector: [1, 1, 0] })), 30);
    for (const parent of parents) parent.event.summary = '重叠事件 (#1)';
    const result = await selectL1Evidence(parents, data, { queryVector: [0, 1, 0] });
    const single = await selectL1Evidence(parents.slice(0, 1), data, { queryVector: [0, 1, 0] });
    assert.deepEqual(result.items, single.items);
    assert.equal(new Set(result.items.map(item => item.chunkId)).size, result.items.length);
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
    assert.equal(result.items.find(item => item.evidenceLane === 'conversation').chunkId, 'c-64');
});

test('query evidence prioritizes multiple strong passages from one parent ahead of weaker parent heads', async () => {
    const { parents, data } = fixture([
        { floor: 0, vector: [1, 0, 0] },
        { floor: 0, vector: [0, 1, 0] },
        { floor: 0, vector: [0, 0.99, 0.1] },
        { floor: 0, vector: [0, 0.98, 0.2] },
        { floor: 1, vector: [0.8, 0.6, 0] },
        { floor: 2, vector: [0, 0, 1] },
        { floor: 9, vector: [0, 1, 0] },
    ], 3);
    const result = await selectL1Evidence(parents, data, {
        queryVector: [0, 1, 0], lexicalScores: [{ chunkId: 'c-5', score: 100 }],
    });
    assert.deepEqual(result.items.slice(0, 3).map(item => item.chunkId), ['c-1', 'c-2', 'c-3']);
    assert.ok(result.items.slice(0, 3).every(item => item.evidenceLane === 'query'));
    assert.equal(result.items.some(item => item.chunkId === 'c-6'), false);
    assert.equal(result.items.some(item => item.chunkId === 'c-0'), false);
    assert.ok(result.items.some(item => item.chunkId === 'c-5'));
    const queryScores = result.items.filter(item => item.evidenceLane === 'query').map(item => item.queryScore);
    assert.deepEqual(queryScores, [...queryScores].sort((a, b) => b - a));
});

test('query promotion preserves exact-time protection without preassigning a display owner', async () => {
    const { parents, data } = fixture([
        { vector: [1, 0, 0] }, { vector: [0, 1, 0], text: '113年11月20日03:38 约定' },
    ], 2);
    parents[1].event.summary = '重叠事件 (#1)';
    data.eventVectorsById.set('evt-1', { vector: [0, 1, 0] });
    const result = await selectL1Evidence(parents, data, {
        queryVector: [0, 1, 0], temporalCarrier: { marker: '113年11月20日03:38' },
    });
    const promoted = result.items[0];
    assert.equal(promoted.chunkId, 'c-1');
    assert.equal(promoted.evidenceLane, 'query');
    assert.equal('ownerEventId' in promoted, false);
    assert.equal(promoted._directEvidenceTemporalCarrier, true);
    assert.equal(result.items.filter(item => item.chunkId === 'c-1').length, 1);
    assert.equal(result.stats.temporalProtectedCandidates, 1);
});

test('cancelled or released sessions stop local selection without returning late evidence', async () => {
    const { parents, data } = fixture([{ vector: [1, 0, 0] }]);
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(selectL1Evidence(parents, data, { signal: controller.signal }), { name: 'AbortError' });
    await assert.rejects(selectL1Evidence(parents, data, { isCurrent: () => false }), { name: 'AbortError' });
});

test('first-rerank source turns survive absent L2 and preserve preceding USER context only when supplied', async () => {
    const { data } = fixture([
        { floor: 71, vector: [0, 1, 0], isUser: true },
        { floor: 72, vector: [0, 0.9, 0.1] },
        { floor: 73, vector: [0, 1, 0] },
    ]);
    const result = await selectL1Evidence([], data, {
        queryVector: [0, 1, 0], sourceTurns: [{ floor: 72, contextFloor: 71 }],
    });
    assert.deepEqual(new Set(result.items.map(item => item.floor)), new Set([71, 72]));
    assert.equal(result.status, 'applied');
    const withoutContext = await selectL1Evidence([], data, { queryVector: [0, 1, 0], sourceTurns: [{ floor: 72 }] });
    assert.deepEqual(withoutContext.items.map(item => item.floor), [72]);
});

test('later passages from the first reranked turn stay ahead of weaker turn heads', async () => {
    const { parents, data } = fixture([
        ...Array.from({ length: 9 }, (_, floor) => ({ floor, vector: [1, 0, 0] })),
        ...[0.9, 0.8, 0.7, 0.6].map(score => ({ floor: 72, vector: [score, Math.sqrt(1 - score * score), 0] })),
        { floor: 74, vector: [0.95, Math.sqrt(1 - 0.95 ** 2), 0] },
    ], 9);
    const result = await selectL1Evidence(parents, data, {
        queryVector: [1, 0, 0], sourceTurns: [{ floor: 72 }, { floor: 74 }],
    });
    assert.deepEqual(result.items.slice(3, 6).map(item => item.chunkId), ['c-9', 'c-10', 'c-11']);
    assert.ok(result.items.slice(6).some(item => item.floor === 74));
    assert.ok(result.items.slice(6).some(item => item.chunkId === 'c-12'));
});

test('floor rerank order reaches admission independently of L2 order and event vectors', async () => {
    const { parents, data } = fixture([
        ...Array.from({ length: 9 }, (_, floor) => ({ floor, vector: [0, 1, 0] })),
        { floor: 72, vector: [0, 0.7, 0.7] },
        { floor: 74, vector: [0, 0.8, 0.6] },
    ], 9);
    const options = { queryVector: [0, 1, 0], sourceTurns: [{ floor: 72 }, { floor: 74 }] };
    const result = await selectL1Evidence(parents, data, options);
    const floorHits = result.items.filter(item => item.evidenceLane === 'floor');
    assert.deepEqual(floorHits.map(item => item.floor), [72, 74]);
    const packed = admitDirectEvidenceItems(result.items.map((item, i) => ({
        id: item.chunkId, floor: item.floor, score: 1 / (i + 1), tokenCost: 100,
    })), { used: 0, max: 400 });
    assert.equal(packed.at(-1).floor, 72);
    data.eventVectorsById.clear();
    for (const parent of parents) parent.event.summary = `Changed subject (#${Number(parent.event.id.slice(4)) + 1})`;
    const reordered = await selectL1Evidence([...parents].reverse(), data, options);
    assert.deepEqual(result.items, reordered.items);
    assert.equal(reordered.status, 'applied');
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
