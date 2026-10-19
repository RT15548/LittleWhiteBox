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
