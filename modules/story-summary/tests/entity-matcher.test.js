import test from 'node:test';
import assert from 'node:assert/strict';

import { extractEntitiesFromText } from '../vector/retrieval/entity-matcher.js';

test('entity matching prefers the longest candidate at each text position', () => {
    const lexicon = new Set(['林月', '林月儿']);
    const displayMap = new Map([
        ['林月', '林月'],
        ['林月儿', '林月儿'],
    ]);

    assert.deepEqual(
        extractEntitiesFromText('林月儿随后找到林月。', lexicon, displayMap),
        ['林月儿', '林月'],
    );
});

test('blocked USER names consume their full span without emitting a shorter character', () => {
    const lexicon = new Set(['林月']);
    const displayMap = new Map([['林月', '林月']]);

    assert.deepEqual(
        extractEntitiesFromText('林月儿正在回忆。', lexicon, displayMap, ['林月儿']),
        [],
    );
});
