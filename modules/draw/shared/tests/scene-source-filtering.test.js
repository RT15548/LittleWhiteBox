import assert from 'node:assert/strict';
import test from 'node:test';
import { createSceneSource } from '../scene-source.js';

// Contract: filters may remove hidden blocks, never visible story text merely
// because a hidden block mentions another rule's opening tag. Placement offsets
// must still address the original message, not the filtered text.
const blockRules = [
    { start: '<state>', end: '</state>' },
    { start: '<plan>', end: '</plan>' },
    { start: '<aside>', end: '</aside>' },
];
for (const rules of [blockRules, [...blockRules].reverse(), [blockRules[0], { start: '', end: '<think>' }, ...blockRules.slice(1)]]) {
    test('a nested tag mention cannot join hidden sections across the story', () => {
        const story = ['她推开门。', '雨已经停了。'];
        const original = `<plan>稍后生成 <state> 标签。</plan>\n<aside>隐藏内容</aside>\n${story.join('\n')}\n<state>hp=1</state>`;
        const result = createSceneSource(original, { filterRules: rules });
        assert.equal(result.content, story.join('\n'));
        assert.equal(result.points.length, 2);
        result.points.forEach((point, index) => assert.ok(original.slice(0, point.offset).endsWith(story[index])));
    });
}

test('one-sided rules run on surviving text, not tag mentions inside removed blocks', () => {
    const cut = { start: '<cut>', end: '' };
    const block = { start: '<plan>', end: '</plan>' };
    for (const filterRules of [[cut, block], [block, cut]]) {
        assert.equal(createSceneSource('<plan>mention <cut></plan>正文。<cut>删去。', { filterRules }).content, '正文。');
    }
    assert.equal(createSceneSource('推理残留</think>正文。<state>隐藏</state>', {
        filterRules: [{ start: '', end: '</think>' }, blockRules[0]],
    }).content, '正文。');
});

test('an unclosed two-sided filter does not consume visible text or prevent other filters', () => {
    assert.equal(createSceneSource('前文 <state> 未闭合。<plan>隐藏</plan>后文。', {
        filterRules: blockRules,
    }).content, '前文 <state> 未闭合。后文。');
});
