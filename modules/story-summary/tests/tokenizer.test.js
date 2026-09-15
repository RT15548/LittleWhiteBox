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
// 覆盖两类回归：
//   1. 占位符在 segmentByScript 之前被抽出，否则会被拆成 other/latin 碎片后丢弃，
//      实体词永远到不了 unmaskTokens（查询侧词表因此丢实体 → 词法检索零命中）。
//   2. maskEntities 在不可变原文上取坐标、从后往前替换；否则同一实体的第 2 次及以后
//      会因坐标漂移替换到错误位置（切出垃圾串），紧邻占位符的实体会被误跳过。

const NAMES = {
    2: '甲乙',
    3: '甲乙丙',
    4: '甲乙丙丁',
    5: '甲乙丙丁戊',
    6: '甲乙丙丁戊己',
};

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

// ── 坐标漂移回归：同一实体重复出现，任意间隔都必须全部还原 ────────────────
// 旧实现下：间隔 < 7-L 会被 ±4 邻域误跳过（漏保护），间隔 >= 8-L 会错位替换（垃圾串）。
test('repeated entity is restored for every gap (length 2..6 x gap 0..9)', () => {
    for (const len of [2, 3, 4, 5, 6]) {
        const name = NAMES[len];
        injectEntities(new Set([name]));
        try {
            for (let gap = 0; gap <= 9; gap++) {
                const text = name + '走'.repeat(gap) + name;
                const tokens = tokenizeForIndex(text);
                const hits = tokens.filter(t => t === name).length;
                assert.equal(
                    hits,
                    2,
                    `len=${len} gap=${gap} 期望两个实体都进词表，实际 tokens=${JSON.stringify(tokens)}`,
                );
                // 不允许出现「吞掉实体前缀」的错位切片
                assert.ok(
                    tokens.every(t => !name.startsWith(t.slice(-2)) || t.length >= name.length),
                    `len=${len} gap=${gap} 出现错位切片 tokens=${JSON.stringify(tokens)}`,
                );
            }
        } finally {
            reset();
        }
    }
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

// ── 纯数字实体名：旧实现会匹配到占位符内部的序号数字 ──────────────────────
test('numeric entity names do not collide with placeholder digits', () => {
    injectEntities(new Set(['01', '雪照宁']));
    try {
        const tokens = tokenizeForIndex('雪照宁01雪照宁01');
        assert.equal(tokens.filter(t => t === '雪照宁').length, 2);
        assert.equal(tokens.filter(t => t === '01').length, 2);
    } finally {
        reset();
    }
});

test('case expansion and normalization do not consume neighboring names or words', () => {
    injectEntities(new Set(['İbrahim', 'Alice', 'Ann']));
    try {
        assert.deepEqual(tokenizeForIndex('İbrahim与Alice arrived'), ['i̇brahim', 'alice', 'arrived']);
        assert.deepEqual(tokenizeForIndex('Ａｌｉｃｅ arrived'), ['alice', 'arrived']);
        assert.deepEqual(tokenizeForIndex('anniversary celebration'), ['anniversary', 'celebration']);
    } finally {
        reset();
    }
});

test('an alias keeps its original spelling as a searchable term', () => {
    injectEntities(new Set(['黑衣人', '雪照宁']), new Map([['黑衣人', '雪照宁'], ['雪照宁', '雪照宁']]));
    try {
        assert.ok(tokenizeForIndex('黑衣人来了').includes('黑衣人'));
        assert.ok(!tokenizeForIndex('黑衣人来了').includes('雪照宁'));
    } finally {
        reset();
    }
});
