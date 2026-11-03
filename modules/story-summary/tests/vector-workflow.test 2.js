import test from 'node:test';
import assert from 'node:assert/strict';

import { runVectorMaintenance } from '../vector/pipeline/vector-workflow.js';

// 保护维护入口的契约：L0 缺口不能阻止正文 L1 更新；取消必须停止后续 API 调用。
// 用阶段的可观察结果验证调度，API/存储的重试与事务由各自边界测试负责。
function makeStages(overrides = {}) {
    return {
        buildChunks: async () => ({ success: true, status: 'built', built: 6 }),
        repairEvents: async () => ({ success: true, repaired: 2 }),
        extract: async () => ({ built: 3, llmFailed: 0 }),
        vectorize: async () => ({ success: true, vectorized: 3 }),
        inspect: async () => ({ incomplete: 0, pending: 0 }),
        ...overrides,
    };
}

test('部分 L0 提取失败时，L1 已完成且成功锚点仍补向量', async () => {
    const result = await runVectorMaintenance(makeStages({
        extract: async () => ({ built: 3, llmFailed: 1 }),
        inspect: async () => ({ incomplete: 1, pending: 1 }),
    }));

    assert.equal(result.chunkResult.built, 6);
    assert.equal(result.llmFailed, 1);
    assert.equal(result.l0VectorResult.vectorized, 3);
    assert.equal(result.eventResult.repaired, 2);
    assert.equal(result.cancelled, false);
});

test('历史 L0 终态失败不阻止本轮及后续聊天的 L1 维护', async () => {
    let lastChunkFloor = 1;
    let totalFloors = 8;
    const stages = makeStages({
        buildChunks: async () => {
            const built = totalFloors - lastChunkFloor - 1;
            lastChunkFloor = totalFloors - 1;
            return { success: true, status: 'built', built };
        },
        extract: async () => ({ built: 0, llmFailed: 0 }),
        vectorize: async () => ({ success: true, vectorized: 0 }),
        inspect: async () => ({ incomplete: 1, pending: 0, terminalFail: 1 }),
    });

    const first = await runVectorMaintenance(stages);
    assert.equal(first.chunkResult.built, 6);
    assert.equal(lastChunkFloor, 7);
    totalFloors += 2;
    const next = await runVectorMaintenance(stages);
    assert.equal(next.chunkResult.built, 2);
    assert.equal(lastChunkFloor, 9);
    assert.equal(next.l0Status.terminalFail, 1);
    assert.equal(next.eventResult.repaired, 2);
});

test('L0 仍有后续批次时，本轮 L1 正常完成', async () => {
    const result = await runVectorMaintenance(makeStages({
        inspect: async () => ({ incomplete: 6, pending: 6 }),
    }));
    assert.equal(result.chunkResult.built, 6);
    assert.equal(result.l0Status.pending, 6);
});

test('L0 向量失败不影响已经完成的 L1 和 L0 提取成果', async () => {
    const result = await runVectorMaintenance(makeStages({
        vectorize: async () => ({ success: false, code: 'embedding_http_failed' }),
    }));
    assert.equal(result.chunkResult.built, 6);
    assert.equal(result.l0Result.built, 3);
    assert.equal(result.l0VectorResult.code, 'embedding_http_failed');
});

test('L0 提取抛异常也不会阻止本轮 L1 完成', async () => {
    let l1Saved = false;
    let l2Saved = false;
    await assert.rejects(runVectorMaintenance(makeStages({
        buildChunks: async () => {
            l1Saved = true;
            return { success: true, built: 6 };
        },
        repairEvents: async () => { l2Saved = true; return { success: true, repaired: 1 }; },
        extract: async () => { throw new Error('L0 storage failure'); },
    })), /L0 storage failure/);
    assert.equal(l1Saved, true);
    assert.equal(l2Saved, true);
});

test('L1 构建失败仍允许处理 L0，并保留 L1 的失败原因', async () => {
    const result = await runVectorMaintenance(makeStages({
        buildChunks: async () => ({ success: false, code: 'vector_write_failed', built: 0 }),
    }));
    assert.equal(result.chunkResult.code, 'vector_write_failed');
    assert.equal(result.l0VectorResult.vectorized, 3);
    assert.equal(result.eventResult.repaired, 2);
    assert.equal(result.cancelled, false);
});

test('开始前取消不触发任何阶段', async () => {
    const unexpected = async () => assert.fail('cancelled work must not run');
    const result = await runVectorMaintenance({
        buildChunks: unexpected, repairEvents: unexpected, extract: unexpected, vectorize: unexpected, inspect: unexpected,
        isCancelled: () => true,
    });
    assert.equal(result.cancelled, true);
});

test('L1 期间取消后不调用 L0', async () => {
    const result = await runVectorMaintenance(makeStages({
        buildChunks: async () => ({ success: false, status: 'cancelled', built: 0 }),
        repairEvents: async () => assert.fail('L2 must not run after cancellation'),
        extract: async () => assert.fail('L0 must not run after cancellation'),
    }));
    assert.equal(result.cancelled, true);
});

test('L1 完成后会话失效，不调用 L0 且保留已完成的结果', async () => {
    let cancelled = false;
    const result = await runVectorMaintenance(makeStages({
        buildChunks: async () => {
            cancelled = true;
            return { success: true, built: 6 };
        },
        extract: async () => assert.fail('stale session must not call L0'),
        repairEvents: async () => assert.fail('stale session must not call L2'),
        isCancelled: () => cancelled,
    }));
    assert.equal(result.chunkResult.built, 6);
    assert.equal(result.cancelled, true);
});

test('L2 缺口补齐失败不阻止 L0，保留本轮失败结果供告警复查', async () => {
    const result = await runVectorMaintenance(makeStages({
        repairEvents: async () => ({ success: false, repaired: 0, code: 'repair_failed' }),
    }));
    assert.equal(result.eventResult.code, 'repair_failed');
    assert.equal(result.l0Result.built, 3);
    assert.equal(result.l0VectorResult.vectorized, 3);
});

test('L2 期间取消会停止后续 L0 请求，保留已完成的 L1', async () => {
    const result = await runVectorMaintenance(makeStages({
        repairEvents: async () => ({ success: false, repaired: 1, cancelled: true }),
        extract: async () => assert.fail('cancelled work must not call L0'),
    }));
    assert.equal(result.cancelled, true);
    assert.equal(result.chunkResult.built, 6);
    assert.equal(result.eventResult.repaired, 1);
});

test('即使 L0 没有待办，每轮维护也检查 L1/L2 缺口', async () => {
    let l2Checks = 0;
    const stages = makeStages({
        buildChunks: async () => ({ success: true, built: 0, repaired: 1 }),
        repairEvents: async () => { l2Checks++; return { success: true, repaired: 1 }; },
        extract: async () => ({ built: 0, llmFailed: 0 }),
        vectorize: async () => ({ success: true, vectorized: 0 }),
    });
    const result = await runVectorMaintenance(stages);
    await runVectorMaintenance(stages);
    assert.equal(result.chunkResult.repaired, 1);
    assert.equal(result.eventResult.repaired, 1);
    assert.equal(l2Checks, 2);
});

test('L0 提取期间取消，不再调用 L0 向量 API', async () => {
    const result = await runVectorMaintenance(makeStages({
        extract: async () => ({ built: 0, cancelled: true }),
        vectorize: async () => assert.fail('cancelled extraction must not be vectorized'),
    }));
    assert.equal(result.chunkResult.built, 6);
    assert.equal(result.cancelled, true);
});
