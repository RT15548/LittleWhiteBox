import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildBoundedRerankQuery,
    RERANK_QUERY_MAX_CHARS,
} from '../vector/retrieval/rerank-query.js';

test('短 rerank query 保持原有焦点和上下文顺序', () => {
    assert.equal(
        buildBoundedRerankQuery('用户：现在的问题', ['用户：较早上下文', '角色：最近上下文']),
        '用户：现在的问题\n用户：较早上下文\n角色：最近上下文',
    );
});

test('超长上下文受硬上限约束并优先完整保留最近上下文', () => {
    const result = buildBoundedRerankQuery(
        'Q',
        ['O'.repeat(20), 'N'.repeat(10)],
        16,
    );

    assert.equal(result, `Q\n…OO\n${'N'.repeat(10)}`);
    assert.equal(result.length, 16);
});

test('焦点自身超限时保留其末尾且不发送无界 query', () => {
    const result = buildBoundedRerankQuery('A'.repeat(30) + '真正问题', ['context'], 12);

    assert.equal(result.length, 12);
    assert.ok(result.startsWith('…'));
    assert.ok(result.endsWith('真正问题'));
});

test('默认上限覆盖供应商拒绝的 7746 字符生产案例', () => {
    const result = buildBoundedRerankQuery(
        '用户：那个在丹房给你上药的姑娘，她头顶长着什么？',
        ['A'.repeat(6265), 'B'.repeat(1446)],
    );

    assert.equal(result.length, RERANK_QUERY_MAX_CHARS);
    assert.ok(result.startsWith('用户：那个在丹房给你上药的姑娘'));
    assert.ok(result.endsWith('B'.repeat(1446)));
});
