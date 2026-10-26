import test from 'node:test';
import assert from 'node:assert/strict';
import { filterPlannerResponse as filter } from '../ena-planner-filter.js';

test('streaming preserves selected blocks and source order including an unfinished block', () => {
    assert.equal(filter('preface <plot>A</plot> other <note>B', ['note', 'plot'], { partial: true }), '<plot>A</plot>\n\n<note>B');
    assert.equal(filter('<plot-log>hidden</plot-log>', ['plot'], { partial: true }), '');
    assert.equal(filter('<plot-log>log</plot-log><plot>A', ['plot', 'plot-log'], { partial: true }), '<plot-log>log</plot-log>\n\n<plot>A');
});
test('streaming never exposes incomplete reasoning or partial tag names', () => {
    for (const input of ['<think>secret', '<thinking>secret', '<thi']) {
        assert.equal(filter(input, [], { partial: true }), '');
    }
    assert.equal(filter('<think>secret</think><plot>safe</pl', ['plot'], { partial: true }), '<plot>safe');
});
test('complete filtering preserves the existing no-selected-tags fallback', () => {
    assert.equal(filter('<think>secret</think>plain answer', ['plot']), 'plain answer');
    assert.equal(filter('intro<note>B</note><plot>A</plot>outro', ['plot', 'note']), '<note>B</note>\n\n<plot>A</plot>');
    assert.equal(filter('<think>secret</think><plot>A</plot>', []), '<plot>A</plot>');
});
