import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeCharacterLibrary } from '../character-library.js';
import { detectPresentCharacters } from '../present-characters.js';
import { buildContinuityBlockForRequest, buildContinuityFromImageRecords } from '../character-continuity.js';

// Acceptance contracts (cost: a word the planner copied into costume once is fed back from memory every time):
// - The memory block shown to the planner drops costume words that the registered character's fixed look already has;
//   the stored memory stays as written.
// - Only registered characters are touched, and only against their own fixed look.
// - A costume that is nothing but fixed-look words is shown as "no clothes", the same as an empty costume.

const MIRA = { id: 'c1', name: 'Mira', type: 'girl', appearance: 'silver hair, small white dragon horns' };
const OTHER = { id: 'c2', name: 'Ken', type: 'boy', appearance: 'tall man' };
const present = text => detectPresentCharacters(text, normalizeCharacterLibrary({ characters: [MIRA, OTHER], groups: [] }).characters);
const snapshot = (name, costume) => ({ messageId: 1, timestamp: 1, continuityChars: [{ name, form: '', appear: '', costume }] });
const blockFor = (records, text) => buildContinuityBlockForRequest({ records, presentCharacters: present(text), bodyText: text });

test('words already in the fixed look are not shown again in the remembered costume', () => {
    const text = 'Mira walks by the sea.';
    const records = [snapshot('Mira', 'white coat, small_white_dragon_horns, long tail')];
    const block = blockFor(records, text);
    assert.match(block, /- Mira｜costume: white coat, long tail$/m);
    assert.ok(!block.includes('dragon_horns'));
    // the memory itself is untouched
    const characters = present(text);
    const { entries } = buildContinuityFromImageRecords(records, { knownNames: characters.map(character => character.name), characters });
    assert.equal(entries[0].costume, 'white coat, small_white_dragon_horns, long tail');
});

test('a costume made only of fixed-look words is shown as not wearing anything', () => {
    const block = blockFor([snapshot('Mira', 'small white dragon horns')], 'Mira stands.');
    assert.match(block, /- Mira｜costume: （空＝没穿）$/m);
});

test('other characters keep their words, and one character fixed look never trims another', () => {
    const text = 'Mira and Ken walk by the sea.';
    const records = [{ messageId: 1, timestamp: 1, continuityChars: [
        { name: 'Mira', form: '', appear: '', costume: 'white coat' },
        { name: 'Ken', form: '', appear: '', costume: 'small white dragon horns, grey robe' },
    ] }];
    const block = blockFor(records, text);
    assert.match(block, /- Ken｜costume: small white dragon horns, grey robe$/m);
    assert.match(block, /- Mira｜costume: white coat$/m);
});
