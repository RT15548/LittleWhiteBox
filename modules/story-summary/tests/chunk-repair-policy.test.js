import test from 'node:test';
import assert from 'node:assert/strict';
import { selectChunksForRepair } from '../vector/pipeline/chunk-repair-policy.js';

// 保护补齐契约：从已选定的材料中只请求缺失/无效配对。
// 直接检查交给向量化的片段，避免依赖宿主、LLM 或数据库模拟。
const fingerprint = 'test:model';
const chunk = (floor, index, text) => ({ chunkId: `c-${floor}-${index}`, floor, chunkIdx: index, text });
const vector = (item, overrides = {}) => ({ chunkId: item.chunkId, valid: true, fingerprint, ...overrides });

test('已有完整配对不重算', () => {
    const stored = [chunk(0, 0, '旧剧情与状态栏'), chunk(0, 1, '旧状态栏尾部')];
    const vectors = stored.map(item => vector(item));
    assert.deepEqual(selectChunksForRepair(stored, stored, vectors, fingerprint), []);
    assert.deepEqual(selectChunksForRepair([], stored, vectors, fingerprint), []);
});

test('缺失、损坏或指纹不符的向量用已存片段补，包括新过滤结果中消失的片段', () => {
    const stored = [
        chunk(0, 0, '已存的完整文本'),
        chunk(0, 1, '新规则不再保留的片段'),
        chunk(1, 0, '向量模型不符的片段'),
        chunk(2, 0, '有效片段'),
    ];
    const vectors = [
        vector(stored[1], { valid: false }),
        vector(stored[2], { fingerprint: 'old:model' }),
        vector(stored[3]),
    ];
    assert.deepEqual(selectChunksForRepair(stored, stored, vectors, fingerprint), stored.slice(0, 3));
});

test('材料缺失时从正文补片段，同 ID 的孤立向量不能算完整', () => {
    const expected = [chunk(0, 0, '现有剧情'), chunk(0, 1, '缺失的片段材料')];
    const stored = [expected[0]];
    const vectors = expected.map(item => vector(item));
    assert.deepEqual(selectChunksForRepair(expected, stored, vectors, fingerprint), [expected[1]]);
});

test('1000 楼仅补中间与末尾六楼的缺漏，其余向量不重算', () => {
    const expected = Array.from({ length: 1000 }, (_, floor) => chunk(floor, 0, `正文 ${floor}`));
    const missingMaterials = new Set([200, 500, 999]);
    const missingVectors = new Set([201, 501, 998]);
    const stored = expected.filter(item => !missingMaterials.has(item.floor));
    const vectors = stored.filter(item => !missingVectors.has(item.floor)).map(item => vector(item));
    const result = selectChunksForRepair(expected, stored, vectors, fingerprint);
    assert.deepEqual(result.map(item => item.floor).sort((a, b) => a - b), [200, 201, 500, 501, 998, 999]);
    assert.ok(result.every(item => item.text === `正文 ${item.floor}`));
});
