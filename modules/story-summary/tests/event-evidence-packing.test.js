import assert from 'node:assert/strict';
import test from 'node:test';
import { packEventEvidence } from '../generate/event-evidence-packing.js';

function pack({ l0 = [], l1 = [], cause = '' } = {}) {
    const owner = { event: { id: 'evt-1', causedBy: cause ? ['evt-cause'] : [] }, label: '事件1' };
    const item = (kind, cost, index) => ({ id: `${kind}-${index}`, kind, floor: index, tokenCost: cost, score: 1 / (index + 1), owner });
    const budget = { used: 0, max: 4000 };
    const result = packEventEvidence({ l0Items: l0.map((n, i) => item('l0', n, i)),
        l1Items: l1.map((n, i) => item('l1', n, i)), causalOwners: [owner],
        causesById: new Map(cause ? [['evt-cause', { event: { id: 'evt-cause', summary: cause } }]] : []),
        budget, estimateTokens: text => text.length, getTokenCost: item => item.tokenCost,
        floorOverheadTokens: 0, protectedBudget: { used: 0, max: 1600 } });
    return { ...result, used: budget.used };
}

test('abundant L1 cannot starve eligible L0 or direct causes', () => {
    const result = pack({ l0: [900], l1: Array(30).fill(200), cause: '因'.repeat(200) });
    assert.equal(result.items.some(item => item.kind === 'l0'), true);
    assert.equal(result.causal.stats.bodies, 1);
    assert.ok(result.items.filter(item => item.kind === 'l1').length >= 10);
    assert.ok(result.used <= 4000);
    assert.equal(result.used, result.items.reduce((sum, item) => sum + item.tokenCost, 0) + result.causal.stats.tokens);
});

test('unused reservations flow to L1, and unused L1 capacity can admit more L0', () => {
    assert.equal(pack({ l1: Array(20).fill(200) }).used, 4000);
    const result = pack({ l0: Array(10).fill(300), l1: [200] });
    assert.equal(result.items.filter(item => item.kind === 'l0').length, 10);
    assert.equal(result.l0ProtectedTokens, 900);
    assert.equal(result.used, 3200);
});

test('oversized raw passages cannot evict reserved evidence or block later complete passages', () => {
    const result = pack({ l0: [400], l1: [3900, 100, 200], cause: '因'.repeat(100) });
    assert.deepEqual(result.items.filter(item => item.kind === 'l1').map(item => item.tokenCost), [100, 200]);
    assert.equal(result.causal.stats.bodies, 1);
});
