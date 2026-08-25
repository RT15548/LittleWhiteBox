import test from 'node:test';
import assert from 'node:assert/strict';

import { runAnchorPreparation } from '../vector/pipeline/anchor-workflow.js';

test('部分 L0 失败仍为成功锚点补向量，但不允许进入 L1', async () => {
    const calls = [];
    const result = await runAnchorPreparation({
        extract: async () => {
            calls.push('extract');
            return { built: 3, llmFailed: 1 };
        },
        vectorize: async () => {
            calls.push('vectorize');
            return { success: true, vectorized: 3 };
        },
        inspect: async () => ({ incomplete: 1, pending: 1 }),
    });

    assert.deepEqual(calls, ['extract', 'vectorize']);
    assert.equal(result.llmFailed, 1);
    assert.equal(result.canBuildL1, false);
});

test('L0 已完整时事实阶段不产生新锚点，只运行缺失向量阶段', async () => {
    let factStageCalls = 0;
    let vectorCalls = 0;
    const result = await runAnchorPreparation({
        extract: async () => {
            factStageCalls++;
            return { built: 0, llmFailed: 0, status: 'up_to_date' };
        },
        vectorize: async () => {
            vectorCalls++;
            return { success: true, vectorized: 2 };
        },
        inspect: async () => ({ incomplete: 0, pending: 0 }),
    });

    assert.equal(factStageCalls, 1);
    assert.equal(vectorCalls, 1);
    assert.equal(result.canBuildL1, true);
});

test('L0 向量失败保留 LLM 结果并阻止 L1', async () => {
    const result = await runAnchorPreparation({
        extract: async () => ({ built: 2, llmFailed: 0 }),
        vectorize: async () => ({ success: false, code: 'embedding_http_failed' }),
        inspect: async () => ({ incomplete: 0, pending: 0 }),
    });

    assert.equal(result.l0Result.built, 2);
    assert.equal(result.l0VectorResult.code, 'embedding_http_failed');
    assert.equal(result.canBuildL1, false);
});

test('本批成功但整聊天仍有待处理楼层时不允许构建 L1', async () => {
    const result = await runAnchorPreparation({
        extract: async () => ({ built: 20, llmFailed: 0 }),
        vectorize: async () => ({ success: true, vectorized: 20 }),
        inspect: async () => ({ incomplete: 6, pending: 6 }),
    });

    assert.equal(result.llmFailed, 0);
    assert.equal(result.l0Status.incomplete, 6);
    assert.equal(result.canBuildL1, false);
});
