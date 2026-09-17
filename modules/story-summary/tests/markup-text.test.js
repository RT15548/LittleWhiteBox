import assert from 'node:assert/strict';
import test from 'node:test';
import { stripMarkupTags } from '../vector/utils/markup-text.js';

test('format tags and attributes are excluded without deleting their prose', () => {
    assert.equal(stripMarkupTags('<x>正文</x>'), ' 正文 ');
    assert.equal(stripMarkupTags('<fictional_scenarios><场景>她回家了</场景></fictional_scenarios>'), '  她回家了  ');
    assert.equal(stripMarkupTags('<scene when="a > b" who=Alice enabled>故事</scene>'), ' 故事 ');
    assert.equal(stripMarkupTags("<ns:scene title='a > b'>one<br/>two</ns:scene>"), ' one two ');
    assert.equal(stripMarkupTags('one</x><y>two'), 'one  two');
});

test('plain comparisons, incomplete tags and unwrapped uses of tag names remain text', () => {
    for (const text of ['1 < 2 > 0', 'a < b && c > d', '<unfinished', 'fictional scenarios', '&lt;x&gt;', '原文\n照常保留']) {
        assert.equal(stripMarkupTags(text), text);
    }
});
