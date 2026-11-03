import assert from 'node:assert/strict';
import test from 'node:test';
import { LEARNING_SELECTION_LIMIT, parseLearningSelection } from '../domains/learning/notes.js';

test('a quotation preserves exact original whitespace and UTF-16 offsets, including non-BMP characters', () => {
    const text = 'A 🌳 gives shade.';
    const material = { id: 'm1', paragraphs: [{ id: 'p1', text }] };
    const selection = { materialId: 'm1', paragraphId: 'p1', start: 1, end: 5, quote: text.slice(1, 5) };
    assert.deepEqual(parseLearningSelection(selection, [material]), selection);
    assert.throws(() => parseLearningSelection({ ...selection, start: 2 }, [material]));
    assert.throws(() => parseLearningSelection({ ...selection, quote: 'a different passage' }, [material]));
});

test('empty and over-limit quotations are rejected before becoming a classroom reference', () => {
    for (const quote of ['  ', 'x'.repeat(LEARNING_SELECTION_LIMIT + 1)]) {
        const material = { id: 'm1', paragraphs: [{ id: 'p1', text: quote }] };
        assert.throws(() => parseLearningSelection({ materialId: 'm1', paragraphId: 'p1', start: 0, end: quote.length, quote }, [material]));
    }
});
