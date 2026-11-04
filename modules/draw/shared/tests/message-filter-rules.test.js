import assert from 'node:assert/strict';
import test from 'node:test';
import { isRuleKept, normalizeMessageFilterRules } from '../message-filter-rules.js';
import { normalizeSharedDrawSettings } from '../draw-settings.js';
import { createSceneSource } from '../scene-source.js';

// 存储约定：只有勾选了 keep 才写入 keep: true，其余规则保持 { start, end }。
test('only keep === true is stored; every other value falls back to the plain rule', () => {
    const rules = normalizeMessageFilterRules([
        { start: '<a>', end: '</a>' },
        { start: '<b>', end: '</b>', keep: false },
        { start: '<c>', end: '</c>', keep: 'yes' },
        { start: '<d>', end: '</d>', keep: true, extra: 1 },
        { end: '</e>', keep: true },
        null,
        'text',
    ]);
    assert.deepEqual(rules, [
        { start: '<a>', end: '</a>' },
        { start: '<b>', end: '</b>' },
        { start: '<c>', end: '</c>' },
        { start: '<d>', end: '</d>', keep: true },
        { start: '', end: '</e>', keep: true },
    ]);
    assert.deepEqual(rules.map(isRuleKept), [false, false, false, true, true]);
    assert.deepEqual(normalizeMessageFilterRules(undefined), []);
});

test('shared draw settings keep the keep flag through normalization and stay unchanged without it', () => {
    const saved = normalizeSharedDrawSettings({ messageFilterRules: [
        { start: '<x>', end: '</x>' },
        { start: '<div>', end: '</div>', keep: true },
    ] });
    assert.deepEqual(saved.messageFilterRules, [
        { start: '<x>', end: '</x>' },
        { start: '<div>', end: '</div>', keep: true },
    ]);
    // 二次规范化结果不变（保存/读取往返）。
    assert.deepEqual(normalizeSharedDrawSettings(saved).messageFilterRules, saved.messageFilterRules);
    assert.deepEqual(normalizeSharedDrawSettings({}).messageFilterRules, []);
});

// scene-source.js 内联了一份 keep 判断（不能多 import 文件）；这里保证它和 isRuleKept 对任何取值的结论一致。
test('scene-source treats every keep value exactly like isRuleKept', () => {
    const original = '前。<div>里面。</div>后。';
    for (const keep of [true, false, 'true', 'yes', 1, 0, null, undefined]) {
        const rule = { start: '<div>', end: '</div>', keep };
        const result = createSceneSource(original, { filterRules: [rule] });
        assert.equal(result.content.includes('里面。'), isRuleKept(rule), `keep=${String(keep)}`);
    }
});
