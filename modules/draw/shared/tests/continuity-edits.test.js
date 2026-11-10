import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeCharacterLibrary } from '../character-library.js';
import { detectPresentCharacters } from '../present-characters.js';
import {
    applyContinuityEdits,
    buildContinuityMemoryView,
    createContinuityNameResolver,
    nextContinuityEditPosition,
    normalizeContinuityEdits,
    updateContinuityEdits,
} from '../character-continuity.js';

// Acceptance contracts (cost: a hand-edited outfit memory is ignored, keeps haunting later images, or leaks into other chats):
// - An edit replaces the whole remembered entry (outfit + form) of that character, under the library's official name.
// - It sits after the floors that existed when it was made: images drawn after it win; floors the request has not reached yet ignore it.
// - Removing a character deletes the memory; setting an empty outfit means "not wearing" and keeps the entry; a known character never keeps appear.
// - Corrupt stored edits never throw and never create entries.

const SI = { id: 'c1', name: '司盈昃', aliases: ['渔行歌'], type: 'boy', appearance: 'tall man', outfits: [{ name: '灰袍', tags: 'grey robe' }] };
const library = (...characters) => normalizeCharacterLibrary({ characters, groups: [] }).characters;
const known = detectPresentCharacters('渔行歌', library(SI));
const record = (messageId, ...chars) => ({ messageId, timestamp: messageId, continuityChars: chars });
const si = (costume, form = '') => ({ name: '司盈昃', form, appear: '', costume });
const view = (records, edits, options = {}) => buildContinuityMemoryView(records, edits, { characters: known, beforeMessageId: 99, ...options });
const edit = (fields, at = 2) => ({ name: '司盈昃', form: '', appear: '', costume: '', at, ...fields });

test('an edit replaces the remembered outfit and is flagged as edited', () => {
    const rows = view([record(1, si('grey robe', '人形'))], [edit({ costume: 'topless, bare chest', form: '人形' })]);
    assert.deepEqual(rows, [{ name: '司盈昃', form: '人形', appear: '', costume: 'topless, bare chest', known: true, edited: true, floor: null }]);
});

test('an image drawn after the edit wins over it', () => {
    const records = [record(1, si('grey robe')), record(5, si('blue dress'))];
    const [row] = view(records, [edit({ costume: 'topless' }, 2)]);
    assert.deepEqual([row.costume, row.edited], ['blue dress', false]);
});

test('an edit for floors the request has not reached yet is ignored', () => {
    const records = [record(1, si('grey robe'))];
    assert.equal(view(records, [edit({ costume: 'topless' }, 3)], { beforeMessageId: 2 })[0].costume, 'grey robe');
    assert.equal(view(records, [edit({ costume: 'topless' }, 3)], { beforeMessageId: 3 })[0].costume, 'topless');
    assert.equal(applyContinuityEdits(records, [edit({ costume: 'topless' }, 3)], { beforeMessageId: 2 }).length, 1);
});

test('records and edits interleave by floor without mutating the input', () => {
    const records = [record(1, si('a')), record(4, si('b'))];
    const frozen = JSON.stringify(records);
    const merged = applyContinuityEdits(records, [edit({ costume: 'x' }, 3)], { beforeMessageId: 9 });
    assert.deepEqual(merged.map(item => item.messageId), [1, 2.5, 4]);
    assert.equal(JSON.stringify(records), frozen);
});

test('removing deletes the memory; setting an empty outfit keeps the entry as "not wearing"', () => {
    const records = [record(1, si('grey robe', '人形'))];
    assert.deepEqual(view(records, [edit({ removed: true })]), []);
    assert.deepEqual(view(records, [edit({ removed: true, costume: 'grey robe', form: '人形' })]), [], 'a remove that still carries the old values deletes');
    const [bare] = view(records, [edit({})]);
    assert.deepEqual([bare.name, bare.costume, bare.edited], ['司盈昃', '', true]);
    const [formOnly] = view(records, [edit({ form: '龙形' })]);
    assert.deepEqual([formOnly.form, formOnly.costume], ['龙形', '']);
});

test('an alias is stored and shown under the official name, and a known character never keeps appear', () => {
    const resolver = createContinuityNameResolver(known);
    const edits = updateContinuityEdits([], { op: 'set', name: '渔行歌', appear: 'tall man', costume: 'topless', at: 2 }, { resolver });
    assert.equal(edits[0].name, '司盈昃');
    const rows = view([record(1, si('grey robe'))], edits);
    assert.deepEqual(rows.map(row => [row.name, row.appear, row.costume, row.known]), [['司盈昃', '', 'topless', true]]);
});

test('for a character outside the library an edit replaces appear and outfit as a whole', () => {
    const records = [record(1, { name: '韩枫', form: '', appear: 'short hair', costume: 'red coat' })];
    const [row] = view(records, [{ name: '韩枫', form: '', appear: 'long hair', costume: '', at: 2 }]);
    assert.deepEqual([row.appear, row.costume, row.known], ['long hair', '', false]);
});

test('normalizing keeps the latest edit per character, caps the count and survives corrupt input', () => {
    const many = Array.from({ length: 205 }, (_, index) => ({ name: `角色${index}`, costume: 'x', at: 1 }));
    const capped = normalizeContinuityEdits(many);
    assert.equal(capped.length, 200);
    assert.equal(capped.at(-1).name, '角色204');
    const deduped = normalizeContinuityEdits([edit({ costume: 'old' }), edit({ costume: 'new' })]);
    assert.deepEqual(deduped.map(item => item.costume), ['new']);
    const dirty = normalizeContinuityEdits([null, 'x', 7, [], { name: 5 }, { name: '  ' }, { name: 'ok', at: 'NaN', costume: 3 }, { name: 'neg', at: -4, removed: 'yes' }]);
    assert.deepEqual(dirty.map(item => [item.name, item.at, item.removed]), [['ok', 0, undefined], ['neg', 0, undefined]]);
    for (const raw of [undefined, null, 'oops', 42, {}]) assert.deepEqual(normalizeContinuityEdits(raw), []);
    assert.deepEqual(view([record(1, si('grey robe'))], 'oops').map(row => row.costume), ['grey robe']);
});

test('update ops: set / remove replace per character, reset clears, unknown ops change nothing', () => {
    const base = updateContinuityEdits([], { op: 'set', name: '司盈昃', costume: 'a', at: 2 });
    const removed = updateContinuityEdits(base, { op: 'remove', name: '司盈昃', at: 3 });
    assert.deepEqual(removed.map(item => [item.removed, item.at]), [[true, 3]]);
    assert.deepEqual(updateContinuityEdits(base, { op: 'reset' }), []);
    assert.deepEqual(updateContinuityEdits(base, { op: 'noop', name: 'x' }), base);
    assert.deepEqual(updateContinuityEdits(base, { op: 'set', name: ' ' }), base);
    assert.equal(nextContinuityEditPosition([record(1, si('a')), record(6, si('b'))]), 7);
    assert.equal(nextContinuityEditPosition([]), 0);
});
