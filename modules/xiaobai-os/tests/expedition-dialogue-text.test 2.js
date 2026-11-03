import assert from 'node:assert/strict';
import test from 'node:test';
import { segmentDialogue } from '../apps/game/expedition/performance/dialogue-text.ts';

// Display contract: speech is distinguished without rewriting the model's original text.
test('all four quotation styles distinguish speech while preserving narration and line breaks', () => {
    for (const [open, close] of [['「', '」'], ['『', '』'], ['“', '”'], ['"', '"']]) {
        const speech = `${open}先坐一坐。\n手给我看看？${close}`;
        const text = `我放下药碗。\n${speech}\n我笑了笑。`;
        const parts = segmentDialogue(text);
        assert.deepEqual(parts, [
            { text: '我放下药碗。\n', spoken: false },
            { text: speech, spoken: true },
            { text: '\n我笑了笑。', spoken: false },
        ]);
        assert.equal(parts.map(p => p.text).join(''), text);
    }
});

test('mixed and nested quotation styles keep complete spoken passages together', () => {
    const speeches = ['「她说『不用担心』，你听见了吗？」', '“Yes, she said "take care".”', '"真的？"', '『嗯。』'];
    const parts = segmentDialogue(speeches.join('\n'));
    assert.deepEqual(parts.filter(p => p.spoken).map(p => p.text), speeches);
    assert.equal(parts.map(p => p.text).join(''), speeches.join('\n'));
    assert.equal(segmentDialogue(speeches.join('')).map(p => p.text).join(''), speeches.join(''));
});

test('unpaired quotes, plain text and empty replies are displayed without requiring valid markup', () => {
    for (const text of ['', '我放下药碗。\n\n窗外下着雨。', '「还没有说完', '『还没有说完', '“还没有说完', '"还没有说完', '只有结尾」』”', '「不匹配”']) {
        const parts = segmentDialogue(text);
        assert.equal(parts.some(p => p.spoken), false);
        assert.equal(parts.map(p => p.text).join(''), text);
    }
    const text = '「先坐。\n『茶还热着。』\n我没说完“';
    const parts = segmentDialogue(text);
    assert.deepEqual(parts.filter(p => p.spoken).map(p => p.text), ['『茶还热着。』']);
    assert.equal(parts.map(p => p.text).join(''), text);
});
