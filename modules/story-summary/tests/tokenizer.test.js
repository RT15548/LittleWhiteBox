import test from 'node:test';
import assert from 'node:assert/strict';

import {
    injectEntities,
    tokenize,
    tokenizeForIndex,
    reset,
} from '../vector/utils/tokenizer.js';

// 说明：node 环境没有加载 jieba WASM，亚洲段会走 tokenizeAsianFallback（标点分割 + CJK 片段），
// 不影响本文件覆盖的行为——实体保护发生在分段之前，与用哪个分词器无关。
//
// 覆盖回归：
//   占位符在 segmentByScript 之前被抽出，否则会被拆成 other/latin 碎片后丢弃，
//   实体词永远到不了 unmaskTokens（查询侧词表因此丢实体 → 词法检索零命中）。
//
// 注：maskEntities 的坐标漂移（同一实体重复出现时替换到错误位置）在后续提交修复，
//     其回归用例随该提交一并加入。

test('entity terms survive tokenization (regression: placeholder dropped by segmentByScript)', () => {
    injectEntities(new Set(['雪照宁', '林晚']));
    try {
        // 查询侧：焦点消息只有实体名时，修复前词表为空，词法检索必然零命中
        assert.deepEqual(tokenizeForIndex('雪照宁'), ['雪照宁']);

        // 查询侧：实体名与普通文本混排
        assert.ok(tokenizeForIndex('雪照宁现在在哪').includes('雪照宁'));
        assert.ok(tokenize('雪照宁现在在哪').includes('雪照宁'));
        assert.ok(tokenizeForIndex('林晚现在在哪').includes('林晚'));

        // 索引侧：同一句里的多个实体都要进词表
        const tokens = tokenizeForIndex('林晚走了，然后雪照宁还在');
        assert.ok(tokens.includes('林晚'));
        assert.ok(tokens.includes('雪照宁'));
    } finally {
        reset();
    }
});

test('non-CJK entities are restored as well', () => {
    injectEntities(new Set(['Alice']));
    try {
        assert.ok(tokenizeForIndex('Alice在吗').includes('alice'));
        assert.ok(tokenize('Alice在吗').includes('Alice'));
    } finally {
        reset();
    }
});

test('no entities injected: tokens stay clean (no placeholder leftovers)', () => {
    reset();
    const tokens = tokenizeForIndex('他们去了哪里');
    assert.ok(tokens.length > 0);
    assert.ok(tokens.every(t => !/[\uE000-\uE0FF]/.test(t)));
});

// ── 重叠候选：最长匹配优先 ────────────────────────────────────────────────
test('overlapping candidates: longest match wins', () => {
    injectEntities(new Set(['沈慕微', '沈慕']));
    try {
        const tokens = tokenizeForIndex('沈慕微来了');
        assert.ok(tokens.includes('沈慕微'));
        assert.ok(!tokens.includes('沈慕'));
    } finally {
        reset();
    }
});

// ── 紧邻实体：旧实现的 ±4 邻域判定会误跳过第二个 ──────────────────────────
test('adjacent entities are both protected', () => {
    injectEntities(new Set(['林晚', '雪照宁']));
    try {
        const tokens = tokenizeForIndex('林晚雪照宁');
        assert.ok(tokens.includes('林晚'));
        assert.ok(tokens.includes('雪照宁'));
    } finally {
        reset();
    }
});
