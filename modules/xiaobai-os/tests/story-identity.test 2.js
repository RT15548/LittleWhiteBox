import assert from 'node:assert/strict';
import test from 'node:test';
import { captureStoryIdentity } from '../host/story-identity.js';

test('character reordering does not change the story binding key', () => {
    const context = { chatId: 'chapter', characterId: 1,
        characters: { 1: { avatar: 'hero.png' }, 2: { avatar: 'other.png' } } };
    const original = captureStoryIdentity(context);
    context.characterId = 2;
    context.characters = { 1: { avatar: 'other.png' }, 2: { avatar: 'hero.png' } };
    assert.equal(captureStoryIdentity(context).key, original.key);
    assert.equal(original.key, 'character:hero.png:chapter');
    assert.equal(captureStoryIdentity({ chatId: 'chapter', characterId: 2, characters: {} }), null);
    assert.equal(captureStoryIdentity({ chatId: 'chapter', groupId: 'group-1' }).key, 'group:group-1:chapter');
});
