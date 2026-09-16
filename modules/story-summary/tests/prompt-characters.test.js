import assert from 'node:assert/strict';
import test from 'node:test';
import { projectStoryCharacters } from '../prompt-characters.js';

test('a retained alias remains available after summary content rolls back before its original floor', () => {
    const store = {
        lastSummarizedMesId: 20,
        json: {
            characters: { main: [{ name: 'Gojo Satoru', _addedAt: 20 }] },
            arcs: [],
            facts: [],
            // The mapping was learned in later content that has since been
            // removed. Identity vocabulary itself deliberately remains.
            characterAliases: [{ from: '五条悟', to: 'Gojo Satoru', _addedAt: 100 }],
        },
    };

    assert.deepEqual(projectStoryCharacters(store, {
        throughMessageIndex: 20,
        currentMessageIndex: 20,
        name: '五条悟',
    }), [{ name: 'Gojo Satoru', aliases: ['五条悟'], text: '' }]);
});
