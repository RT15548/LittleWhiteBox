import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeCharacterLibrary } from '../character-library.js';
import { detectPresentCharacters } from '../present-characters.js';
import {
    buildContinuityBlockForRequest,
    buildContinuityFromImageRecords,
    buildContinuityMemoryView,
    continuityAfterTagEdit,
    DEFAULT_MAX_ENTRIES,
} from '../character-continuity.js';

// Acceptance contracts (cost: a character who took clothes off gets dressed again, or a new character is silently treated as undressed):
// - A character's memory is the costume of the latest image they were drawn in, as is; an empty costume is a value meaning "not wearing", for every character.
// - A character with no entry at all is new: the block has no line for them. An entry is never dropped just because it is empty.
// - Only appear (characters outside the library) is kept when a later snapshot omits it; only a revoked snapshot deletes a memory.
// - The memory view says which floor each value came from.
// - How many characters are remembered is a setting (default 50); past it the character not seen for longest is dropped.

const SI = { id: 'c1', name: '司盈昃', aliases: ['渔行歌'], type: 'boy', appearance: 'tall man', outfits: [{ name: '灰袍', tags: 'grey robe' }] };
const ALICE = { id: 'c2', name: 'Alice', type: 'girl', appearance: 'silver hair' };
const library = (...characters) => normalizeCharacterLibrary({ characters, groups: [] }).characters;
// Real planner snapshots always carry an action key (a snapshot without one and with nothing else is the legacy revocation shape).
const record = (messageId, ...chars) => ({ messageId, timestamp: messageId, continuityChars: chars.map(char => ({ action: 'standing', ...char })) });
const si = (costume, form = '') => ({ name: '司盈昃', form, appear: '', costume });
const blockFor = (records, text, ...characters) => buildContinuityBlockForRequest({
    records, presentCharacters: detectPresentCharacters(text, library(...characters)), bodyText: text,
});

test('an empty costume of a single-form known character stays as "not wearing" and the block says so', () => {
    const block = blockFor([record(1, si('grey robe')), record(2, si(''))], '渔行歌泡在池里。', SI);
    assert.match(block, /^- 司盈昃｜costume: （空＝没穿）$/m);
    assert.ok(!block.includes('grey robe'), 'the older outfit is gone');
    assert.match(block, /正文没写穿上，就保持没穿/);
});

test('the latest image wins both ways: dressed -> bare -> dressed', () => {
    const present = detectPresentCharacters('渔行歌', library(SI));
    const costumeAfter = records => buildContinuityFromImageRecords(records, { characters: present }).entries[0].costume;
    assert.equal(costumeAfter([record(1, si('grey robe')), record(2, si(''))]), '');
    assert.equal(costumeAfter([record(1, si('grey robe')), record(2, si('')), record(3, si('white robe'))]), 'white robe');
});

test('a character that was never drawn has no entry and no line', () => {
    const block = blockFor([record(1, si('grey robe'))], '渔行歌和Alice在一起。', SI, ALICE);
    assert.match(block, /^- 司盈昃｜/m);
    assert.ok(!block.includes('Alice｜'), 'Alice is new: no entry');
});

test('outside the library: appear survives an omission, costume does not', () => {
    const present = detectPresentCharacters('韩枫走过。', library(SI));
    const [entry] = buildContinuityFromImageRecords([
        record(1, { name: '韩枫', form: '', appear: 'old man', costume: 'brown coat' }),
        record(2, { name: '韩枫', form: '', appear: '', costume: '' }),
    ], { characters: present }).entries;
    assert.deepEqual([entry.appear, entry.costume], ['old man', '']);
});

test('only a revoked snapshot deletes a memory (the memory panel clear button)', () => {
    const present = detectPresentCharacters('渔行歌', library(SI));
    const records = [record(1, si('grey robe')), { messageId: 2, timestamp: 2, continuityChars: [{ name: '司盈昃', revoked: true }] }];
    assert.deepEqual(buildContinuityFromImageRecords(records, { characters: present }).entries, []);
});

test('editing a character prompt (clearing or rewriting) skips only that image and keeps the earlier memory', () => {
    const present = detectPresentCharacters('司盈昃 Alice', library(SI, ALICE));
    const alice = costume => ({ name: 'Alice', form: '', appear: '', costume, action: 'standing' });
    const imageRecord = {
        continuityChars: [{ ...si('grey robe'), action: 'standing' }, alice('red coat')],
        characterPrompts: [{ prompt: 'a' }, { prompt: 'b' }],
    };
    // Snapshots are replayed exactly as saved: no test helper may add an action key to them.
    const replay = (...chars) => buildContinuityFromImageRecords([
        { messageId: 1, timestamp: 1, continuityChars: [alice('blue coat'), { ...si('grey robe'), action: 'standing' }] },
        { messageId: 2, timestamp: 2, continuityChars: chars },
    ], { characters: present }).entries;
    const memory = entries => Object.fromEntries(entries.map(({ name, costume }) => [name, costume]));
    for (const [label, second] of [['cleared', ''], ['rewritten', 'c']]) {
        const edited = continuityAfterTagEdit(imageRecord, [{ prompt: 'a' }, { prompt: second }]);
        assert.deepEqual(edited[0], imageRecord.continuityChars[0], `${label}: an untouched prompt keeps its snapshot`);
        assert.deepEqual(edited[1], { name: 'Alice', costume: '', costumeOmitted: true, tagEdited: true, action: '' }, `${label}: the edited one is skipped`);
        assert.deepEqual(memory(replay(...edited)), { Alice: 'blue coat', 司盈昃: 'grey robe' }, `${label}: the earlier memory survives`);
    }
    const wasEmpty = continuityAfterTagEdit({ continuityChars: [alice('x')], characterPrompts: [{ prompt: '' }] }, [{ prompt: 'new' }]);
    assert.deepEqual(wasEmpty, [{ name: 'Alice', costume: '', costumeOmitted: true, tagEdited: true, action: '' }], 'filling in a prompt that was empty is an edit too');
});

test('the memory view lists the most recent characters first, hand edits count as newest', () => {
    const characters = detectPresentCharacters('渔行歌 Alice', library(SI, ALICE));
    const records = [record(3, { name: 'Alice', form: '', appear: '', costume: 'red coat' }), record(5, si('a')), record(8, { name: 'Alice', form: '', appear: '', costume: 'blue coat' })];
    assert.deepEqual(buildContinuityMemoryView(records, [], { characters, beforeMessageId: 99 }).map(row => row.name), ['Alice', '司盈昃']);
    const edited = buildContinuityMemoryView(records, [{ name: '司盈昃', form: '', appear: '', costume: 'x', at: 9 }], { characters, beforeMessageId: 99 });
    assert.deepEqual(edited.map(row => row.name), ['司盈昃', 'Alice']);
});

test('the memory view reports the floor each value came from', () => {
    const rows = buildContinuityMemoryView([
        record(11, si('a'), { name: 'Alice', form: '', appear: '', costume: 'red coat' }),
        record(12, si('b')),
    ], [], { characters: detectPresentCharacters('渔行歌 Alice', library(SI, ALICE)), beforeMessageId: 99 });
    assert.deepEqual(rows.map(row => [row.name, row.floor]).sort(), [['Alice', 11], ['司盈昃', 12]]);
});

test('the remembered-character cap is configurable and drops the one seen longest ago', () => {
    const records = ['韩枫', '秦月', '赵云', '钱多'].map((name, index) => record(index + 1, { name, form: '', appear: 'x', costume: `coat ${index}` }));
    const present = detectPresentCharacters('渔行歌', library(SI));
    assert.deepEqual(buildContinuityFromImageRecords(records, { characters: present, maxEntries: 2 }).entries.map(entry => entry.name), ['赵云', '钱多']);
    assert.equal(buildContinuityFromImageRecords(records, { characters: present }).entries.length, 4, 'the default is generous');
    assert.equal(buildContinuityFromImageRecords(records, { characters: present, maxEntries: 0 }).entries.length, 4, 'an invalid cap falls back to the default');
    assert.equal(DEFAULT_MAX_ENTRIES, 50);
});
