import assert from 'node:assert/strict';
import { test } from 'node:test';
import { runVectorMaintenance } from '../vector/pipeline/vector-workflow.js';

// One maintenance pass must not buy another stage after a failure. Completed
// data and the actual failed stage remain visible to the caller for diagnosis.
function workflow(outcomes = {}) {
    const called = [];
    const values = {
        L1: { success: true, built: 2 },
        L2: { success: true, repaired: 3 },
        extraction: { built: 4, llmFailed: 0 },
        L0: { success: true, vectorized: 4 },
        inspection: { pending: 0, incomplete: 0 },
        ...outcomes,
    };
    const stage = name => async () => {
        called.push(name);
        if (values[name] instanceof Error) throw values[name];
        return values[name];
    };
    return {
        called, values,
        run: options => runVectorMaintenance({
            buildChunks: stage('L1'), repairEvents: stage('L2'),
            extract: stage('extraction'), vectorize: stage('L0'), inspect: stage('inspection'),
            ...options,
        }),
    };
}

test('successful maintenance preserves all stage results', async () => {
    const pass = workflow();
    const result = await pass.run();
    assert.deepEqual(pass.called, ['L1', 'L2', 'extraction', 'L0', 'inspection']);
    assert.equal(result.chunkResult, pass.values.L1);
    assert.equal(result.eventResult, pass.values.L2);
    assert.equal(result.l0Result, pass.values.extraction);
    assert.equal(result.l0VectorResult, pass.values.L0);
    assert.equal(result.l0Status, pass.values.inspection);
    assert.equal(result.cancelled, false);
});

for (const [failed, outcome, expected] of [
    ['L1', { success: false, code: 'embedding_timeout', repaired: 20 }, ['L1']],
    ['L2', { success: false, code: 'event_vector_write_failed', repaired: 20 }, ['L1', 'L2']],
    ['extraction', { built: 3, llmFailed: 1, failureCode: 'l0_timeout' }, ['L1', 'L2', 'extraction']],
]) test(`${failed} failure stops all later paid stages while retaining actual results`, async () => {
    const pass = workflow({ [failed]: outcome });
    const result = await pass.run();
    assert.deepEqual(pass.called, expected);
    assert.equal(result.chunkResult, pass.values.L1);
    assert.equal(result.eventResult, failed === 'L1' ? null : pass.values.L2);
    assert.equal(result.l0Result, failed === 'extraction' ? outcome : null);
    assert.equal(result.l0VectorResult, null);
    assert.equal(result.l0Status, null);
    assert.equal(result.llmFailed, failed === 'extraction' ? 1 : 0);
    assert.equal(result.cancelled, false);
});

for (const [cancelled, expected] of [
    ['L1', ['L1']],
    ['L2', ['L1', 'L2']],
    ['extraction', ['L1', 'L2', 'extraction']],
]) test(`${cancelled} cancellation is not misreported as a failed repair`, async () => {
    const pass = workflow({ [cancelled]: { cancelled: true } });
    const result = await pass.run();
    assert.deepEqual(pass.called, expected);
    assert.equal(result.cancelled, true);
    assert.equal(result.l0VectorResult, null);
});

test('vector storage failure retains its real outcome and only free inspection follows', async () => {
    const failed = { success: false, code: 'state_vector_write_failed', vectorized: 20 };
    const pass = workflow({ L0: failed });
    const result = await pass.run();
    assert.equal(result.l0VectorResult, failed);
    assert.equal(result.l0Status, pass.values.inspection);
    assert.equal(result.cancelled, false);
});

test('unexpected stage error propagates and cannot start a later paid stage', async () => {
    const failure = new Error('unclassified source failure');
    const pass = workflow({ L2: failure });
    await assert.rejects(pass.run(), error => error === failure);
    assert.deepEqual(pass.called, ['L1', 'L2']);
});
