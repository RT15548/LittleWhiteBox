import assert from 'node:assert/strict';
import test from 'node:test';
import {
    NAMED_TAG_PREVIEW_LIMIT,
    applyLocalNamedTagEnabled,
    countEnabledNamedTags,
    isNamedTagEnabled,
    isNamedTagItemExpanded,
    normalizeNamedTagList,
    parseNamedTagLines,
    previewNamedTags,
    selectEnabledNamedTags,
    serializeNamedTagLines,
    stripNamedTagEnabled,
} from '../named-tag-items.js';

// Acceptance contracts (cost: a disabled outfit/state silently reaching the AI, or old data changing shape):
// - A missing `enabled` means on; only an explicit `false` disables, and only `false` is ever stored.
// - Folding is a UI rule: <2 items always expanded, >=2 folded unless explicitly expanded.

test('missing enabled means on; only false disables and only false is written', () => {
    assert.equal(isNamedTagEnabled({ name: 'a' }), true);
    assert.equal(isNamedTagEnabled({ name: 'a', enabled: true }), true);
    assert.equal(isNamedTagEnabled({ name: 'a', enabled: 0 }), true);
    assert.equal(isNamedTagEnabled({ name: 'a', enabled: false }), false);
    assert.deepEqual(normalizeNamedTagList([
        { name: ' 白裙 ', tags: ' white dress ' },
        { name: '睡衣', tags: 'pajamas', enabled: true },
        { name: '泳装', tags: 'swimsuit', enabled: false, expanded: true, junk: 1 },
        { name: '', tags: '' },
        { enabled: false },
        null,
    ]), [
        { name: '白裙', tags: 'white dress' },
        { name: '睡衣', tags: 'pajamas' },
        { name: '泳装', tags: 'swimsuit', enabled: false },
    ]);
    assert.deepEqual(normalizeNamedTagList(undefined), []);
    assert.deepEqual(normalizeNamedTagList('x'), []);
});

test('legacy data without enabled normalises byte-for-byte as before', () => {
    const legacy = [{ name: 'a', tags: 'b' }, { name: '', tags: 'only' }];
    assert.equal(JSON.stringify(normalizeNamedTagList(legacy)), JSON.stringify(legacy));
});

test('planner selection drops disabled items and the enabled key; counts follow', () => {
    const list = [{ name: 'on', tags: 't1' }, { name: 'off', tags: 't2', enabled: false }, { tags: 't3', enabled: true }];
    assert.deepEqual(selectEnabledNamedTags(list), [{ name: 'on', tags: 't1' }, { name: '', tags: 't3' }]);
    assert.equal(countEnabledNamedTags(list), 2);
    assert.equal(countEnabledNamedTags([{ name: 'off', tags: 'x', enabled: false }]), 0);
    assert.equal(countEnabledNamedTags(undefined), 0);
});

test('fold rule: 0-1 items expanded, 2+ folded unless explicitly expanded', () => {
    assert.equal(isNamedTagItemExpanded({}, 0), true);
    assert.equal(isNamedTagItemExpanded({}, 1), true);
    assert.equal(isNamedTagItemExpanded({ expanded: false }, 1), true);
    assert.equal(isNamedTagItemExpanded({}, 2), false);
    assert.equal(isNamedTagItemExpanded({ expanded: false }, 5), false);
    assert.equal(isNamedTagItemExpanded({ expanded: true }, 5), true);
    assert.equal(isNamedTagItemExpanded({ expanded: 'yes' }, 5), false);
});

test('header preview collapses whitespace, truncates by code point and has a placeholder', () => {
    assert.equal(previewNamedTags('  white   shirt,\n black skirt '), 'white shirt, black skirt');
    assert.equal(previewNamedTags(''), '（未填写 TAG）');
    const long = '😀'.repeat(NAMED_TAG_PREVIEW_LIMIT + 5);
    assert.equal(Array.from(previewNamedTags(long)).length, NAMED_TAG_PREVIEW_LIMIT + 1);
    assert.ok(previewNamedTags(long).endsWith('…'));
});

test('SD/ComfyUI text lines round-trip including disabled ("# ") entries', () => {
    const list = [
        { name: '校服', tags: 'white shirt' },
        { name: '睡衣', tags: 'pajamas = soft', enabled: false },
        { name: '', tags: 'bare tags' },
        { name: '', tags: 'off tags', enabled: false },
    ];
    const text = serializeNamedTagLines(list);
    assert.equal(text, '校服 = white shirt\n# 睡衣 = pajamas = soft\nbare tags\n# off tags');
    assert.deepEqual(parseNamedTagLines(text), list);
    // 旧格式（无 # 行）解析结果不变
    assert.deepEqual(parseNamedTagLines('校服 = white shirt\n\n  tag only  '), [
        { name: '校服', tags: 'white shirt' },
        { name: '', tags: 'tag only' },
    ]);
    // 没有空格的 # 不是停用标记
    assert.deepEqual(parseNamedTagLines('#hash = x'), [{ name: '#hash', tags: 'x' }]);
});

test('stripNamedTagEnabled drops the flag only; applyLocalNamedTagEnabled takes the switch from the local item with the same name', () => {
    assert.deepEqual(stripNamedTagEnabled([{ name: 'a', tags: 'b', enabled: false }, { name: 'c', tags: 'd' }]), [{ name: 'a', tags: 'b' }, { name: 'c', tags: 'd' }]);
    assert.deepEqual(stripNamedTagEnabled(undefined), []);
    const local = [{ name: ' a ', tags: 'x', enabled: false }, { name: 'a', tags: 'y' }, { name: 'z', tags: '1', enabled: false }];
    const incoming = [{ name: 'a', tags: '1', enabled: true }, { name: 'a', tags: '2' }, { name: 'a', tags: '3' }, { name: 'new', tags: '4', enabled: false }];
    assert.deepEqual(applyLocalNamedTagEnabled(incoming, local), [
        { name: 'a', tags: '1', enabled: false },
        { name: 'a', tags: '2' },
        { name: 'a', tags: '3' },
        { name: 'new', tags: '4' },
    ]);
    assert.deepEqual(applyLocalNamedTagEnabled(incoming, []), stripNamedTagEnabled(incoming));
});
