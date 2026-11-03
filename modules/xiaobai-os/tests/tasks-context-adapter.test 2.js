import assert from 'node:assert/strict';
import test from 'node:test';

import { selectPromptCharacters } from '../host/prompt-context/character-source.js';

function context(character) {
    return {
        chatId: 'chat-a',
        groupId: null,
        characterId: 0,
        characters: [character],
        name1: '玩家',
        name2: '向导',
        chat: [],
    };
}

test('task generation includes a single-chat character only when SillyTavern provides a stable avatar key', () => {
    assert.deepEqual(selectPromptCharacters(context({ name: '无稳定身份的向导' })), []);

    assert.deepEqual(selectPromptCharacters(context({ avatar: 'guide.png', name: '向导' })), [{
        characterKey: 'guide.png',
        displayName: '向导',
        description: '',
        personality: '',
        scenario: '',
    }]);
});
