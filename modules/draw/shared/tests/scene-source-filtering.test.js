import assert from 'node:assert/strict';
import test from 'node:test';
import { createSceneSource } from '../scene-source.js';

// Filtering regression: a tag mentioned inside a hidden block was paired with a
// later closing tag, removing the intervening story from planning.
test('a tag mention inside a hidden block cannot swallow the story or shift its placement offsets', () => {
    const story = ['她推开门。', '雨已经停了。'];
    const original = `<plan>稍后生成 <state> 标签。</plan>\n${story.join('\n')}\n<state>hp=1</state>`;
    const result = createSceneSource(original, { filterRules: [
        { start: '<state>', end: '</state>' },
        { start: '<plan>', end: '</plan>' },
    ] });
    assert.equal(result.content, story.join('\n'));
    assert.equal(result.points.length, 2);
    result.points.forEach((point, index) => assert.ok(original.slice(0, point.offset).endsWith(story[index])));
});

// 规则的 keep 标记：缺省/false 沿用旧行为（片段整段删除），true 则保留给 AI 阅读，
// 但片段内部不生成插图点。

test('rules without keep, or with keep false, delete the span exactly as before', () => {
    const original = '她笑了。<think>内心。独白。</think>\n门开了。';
    const expected = '她笑了。\n门开了。';
    for (const rule of [{ start: '<think>', end: '</think>' }, { start: '<think>', end: '</think>', keep: false }]) {
        const result = createSceneSource(original, { filterRules: [rule] });
        assert.equal(result.content, expected);
        assert.equal(result.numberedContent, '她笑了。【插图点 1】\n门开了。【插图点 2】');
    }
});

test('a kept block stays readable but its inner sentence and line-break points are suppressed', () => {
    const original = '开场。\n<div>他说。她笑。\n再说。</div>\n后面。';
    const result = createSceneSource(original, { filterRules: [{ start: '<div>', end: '</div>', keep: true }] });
    assert.equal(result.content, original);
    // 片段内部（含句末与换行）没有点；片段后面的换行之后和文末照常有点。
    assert.equal(result.numberedContent, '开场。【插图点 1】\n<div>他说。她笑。\n再说。</div>\n【插图点 2】后面。【插图点 3】');
    assert.deepEqual(result.points.map((point) => point.number), [1, 2, 3]);
    // 插图偏移始终落在原文里：开场句末、片段后的换行之后、文末。
    assert.deepEqual(result.points.map((point) => point.offset), [
        '开场。'.length,
        original.indexOf('后面'),
        original.length,
    ]);
});

test('a point before a kept span is allowed, and a kept span ending the text gets no end point', () => {
    const original = '前文。<div>里面。</div>';
    const result = createSceneSource(original, { filterRules: [{ start: '<div>', end: '</div>', keep: true }] });
    assert.equal(result.content, original);
    assert.equal(result.numberedContent, '前文。【插图点 1】<div>里面。</div>');
    assert.deepEqual(result.points.map((point) => point.offset), [original.indexOf('<div>')]);
});

test('a message made only of a kept span has no insertion points', () => {
    const original = '<div>只有一段。还有一段。</div>';
    const result = createSceneSource(original, { filterRules: [{ start: '<div>', end: '</div>', keep: true }] });
    assert.equal(result.content, original);
    assert.deepEqual(result.points, []);
    assert.equal(result.numberedContent, original);
});

test('keep does not change span detection: a kept block still shields start tags inside it', () => {
    const story = ['她推开门。', '雨已经停了。'];
    const plan = '<plan>稍后生成 <state> 标签。</plan>';
    const original = `${plan}\n${story.join('\n')}\n<state>hp=1</state>`;
    const result = createSceneSource(original, { filterRules: [
        { start: '<state>', end: '</state>' },
        { start: '<plan>', end: '</plan>', keep: true },
    ] });
    // <plan> 里的 <state> 没有触发；末尾真正的 <state> 块仍被删除。
    assert.equal(result.content, `${plan}\n${story.join('\n')}`);
    assert.equal(result.numberedContent, `${plan}\n【插图点 1】她推开门。【插图点 2】\n雨已经停了。【插图点 3】`);
    assert.deepEqual(result.points.map((point) => point.offset), [
        original.indexOf('她推开门'),
        original.indexOf('她推开门') + story[0].length,
        original.indexOf('雨已经停了') + story[1].length,
    ]);
});

test('one-sided rules with keep: tail cut and head cut keep their text without inner points', () => {
    const tailOriginal = '正文。\n<!--note 一。二。';
    const tail = createSceneSource(tailOriginal, { filterRules: [{ start: '<!--note', end: '', keep: true }] });
    assert.equal(tail.content, tailOriginal);
    assert.equal(tail.numberedContent, '正文。【插图点 1】\n<!--note 一。二。');
    assert.deepEqual(tail.points.map((point) => point.offset), [3]);

    const headOriginal = '元数据一。二。-->\n正文。';
    const head = createSceneSource(headOriginal, { filterRules: [{ start: '', end: '-->', keep: true }] });
    assert.equal(head.content, headOriginal);
    assert.equal(head.numberedContent, '元数据一。二。-->\n【插图点 1】正文。【插图点 2】');
    assert.deepEqual(head.points.map((point) => point.offset), [headOriginal.indexOf('正文'), headOriginal.length]);

    // 不带 keep 时两种单边规则仍是删除。
    assert.equal(createSceneSource(tailOriginal, { filterRules: [{ start: '<!--note', end: '' }] }).content, '正文。');
    assert.equal(createSceneSource(headOriginal, { filterRules: [{ start: '', end: '-->' }] }).content, '正文。');
});

test('one-sided rules still run after block rules and can see kept text', () => {
    const original = '甲。<a>乙。x-cut 丙。</a>丁。';
    const result = createSceneSource(original, { filterRules: [
        { start: 'x-cut', end: '' },
        { start: '<a>', end: '</a>', keep: true },
    ] });
    // 先配对 <a>…</a>（保留），再在剩余文本里按单边规则从 x-cut 截断；被截断的片段末尾不出点。
    assert.equal(result.content, '甲。<a>乙。');
    assert.equal(result.numberedContent, '甲。【插图点 1】<a>乙。');
    assert.deepEqual(result.points.map((point) => point.offset), [original.indexOf('<a>')]);
});

test('kept and deleted rules can be mixed and numbering stays consecutive', () => {
    const original = '甲。<think>x。</think>\n<div>乙。丙。</div>\n丁。';
    const result = createSceneSource(original, { filterRules: [
        { start: '<think>', end: '</think>' },
        { start: '<div>', end: '</div>', keep: true },
    ] });
    assert.equal(result.content, '甲。\n<div>乙。丙。</div>\n丁。');
    assert.equal(result.numberedContent, '甲。【插图点 1】\n<div>乙。丙。</div>\n【插图点 2】丁。【插图点 3】');
    assert.deepEqual(result.points.map((point) => point.number), [1, 2, 3]);
    assert.equal(original.slice(0, result.points[0].offset), '甲。');
    assert.ok(original.slice(0, result.points[1].offset).endsWith('</div>\n'));
    assert.equal(result.points[2].offset, original.length);
});
