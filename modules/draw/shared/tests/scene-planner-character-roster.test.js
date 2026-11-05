import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeCharacterLibrary } from '../character-library.js';
import { FORM_EXCLUSIVE_NOTE } from '../character-forms.js';
import { detectPresentCharacters } from '../present-characters.js';
import { FORM_ROSTER_NOTE, buildCharacterInfoForLLM } from '../scene-planner.js';

// Acceptance contracts (cost: the model copies "名称（别名: …）" as a name, the library no longer recognizes it, and the form is lost):
// - The roster gives the name line only the official name; aliases and forms are on their own lines.
// - The "keep the last form" wording is only written when a continuity block is sent; every other path keeps the shared sentence.

const SI = {
    id: 'c1',
    name: '司盈昃',
    aliases: ['渔行歌'],
    formName: '人形',
    type: 'boy',
    appearance: 'tall man',
    outfits: [{ name: '灰袍', tags: 'grey robe' }],
    forms: [{ name: '龙形', type: 'no_humans', appearance: 'white dragon' }],
};
const ALICE = { id: 'c2', name: 'Alice', aliases: ['Al'], type: 'girl', appearance: 'silver hair' };
const library = (...characters) => normalizeCharacterLibrary({ characters, groups: [] }).characters;

test('planner roster: official name alone on the name line, alias and form on their own lines', () => {
    const text = buildCharacterInfoForLLM(detectPresentCharacters('渔行歌与Al', library(SI, ALICE)));
    assert.match(text, /^- name: 司盈昃$/m);
    assert.match(text, /^ {2}别名: 渔行歌$/m);
    assert.match(text, /^ {2}form: 人形 \[boy\]$/m);
    assert.match(text, /^ {2}form: 龙形 \[no_humans\]$/m);
    assert.match(text, /^- name: Alice \[girl\]$/m);
    assert.ok(!/（别名/.test(text), 'no copyable 名称（别名: …） anywhere');
    assert.equal(text.split('不要写进 name').length - 1, 1, 'the name legend is written once');
    assert.ok(!buildCharacterInfoForLLM(detectPresentCharacters('Bob', library({ id: 'c3', name: 'Bob', type: 'boy', appearance: 'x' }))).includes('不要写进 name'));
});

test('multi-form note: "沿用前文画面里的形态" is only written when a continuity block is sent', () => {
    const present = detectPresentCharacters('渔行歌', library(SI));
    const withBlock = buildCharacterInfoForLLM(present, { hasContinuity: true });
    const without = buildCharacterInfoForLLM(present);
    assert.ok(withBlock.includes(FORM_ROSTER_NOTE) && !withBlock.includes(FORM_EXCLUSIVE_NOTE));
    assert.ok(without.includes(FORM_EXCLUSIVE_NOTE) && !without.includes(FORM_ROSTER_NOTE), 'SD / ComfyUI / continuity off keep the shared wording');
});
