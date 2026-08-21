import test from 'node:test';
import assert from 'node:assert/strict';

import {
    findCharacterByName,
    findEnabledCharacterByName,
    isCharacterEnabled,
} from '../character-selection.js';

test('character selection skips disabled duplicates and keeps legacy records enabled', () => {
    const characters = [
        { id: 'disabled', name: '阿璃', aliases: ['小璃'], enabled: false },
        { id: 'enabled', name: '阿璃', aliases: ['璃璃'] },
    ];

    assert.equal(isCharacterEnabled(characters[0]), false);
    assert.equal(isCharacterEnabled(characters[1]), true);
    assert.equal(findEnabledCharacterByName('阿璃', characters), characters[1]);
    assert.equal(findEnabledCharacterByName('璃璃', characters), characters[1]);
    assert.equal(findEnabledCharacterByName('小璃', characters), undefined);
    assert.equal(findCharacterByName('小璃', characters), characters[0]);
});
