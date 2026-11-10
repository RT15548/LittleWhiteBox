import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeCharacterLibrary } from '../character-library.js';
import { detectPresentCharacters } from '../present-characters.js';
import { buildContinuityBlockForRequest, buildContinuityFromImageRecords } from '../character-continuity.js';
import { buildScenePlannerTask } from '../scene-planner.js';

// Acceptance contracts (cost: outfit memory silently never reaches the planner, or a form change keeps the old outfit):
// - Memory is keyed by the library's official name: alias, "名称（别名: …）" and expanded form names all land on one entry.
// - A character mentioned only by alias in the body still gets its remembered outfit.
// - The latest image wins as a whole (form + outfit); an outfit-less form keeps only the form, so a silent body does not fall back to the first form.

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
// Real planner snapshots always carry an action key; a snapshot without one and with nothing else is the legacy revocation shape.
const snapshot = (timestamp, ...chars) => ({ timestamp, continuityChars: chars.map(char => ({ action: 'standing', ...char })) });
const names = state => state.entries.map(entry => entry.name);

test('alias, annotated name and official name share one memory entry under the official name', () => {
    const present = detectPresentCharacters('渔行歌站在窗前，Al在旁边', library(SI, ALICE));
    const state = buildContinuityFromImageRecords([
        snapshot(1, { name: '司盈昃', form: '人形', appear: '', costume: 'white robe' }),
        snapshot(2, { name: '司盈昃（别名: 渔行歌）', form: '', appear: 'tall man', costume: 'black robe' }),
        snapshot(3, { name: '渔行歌', form: '人形', appear: '', costume: 'grey robe' }),
        snapshot(4, { name: 'Al', form: '', appear: '', costume: 'blue dress' }),
    ], { characters: present });
    assert.deepEqual(names(state).sort(), ['Alice', '司盈昃']);
    assert.equal(state.entries.find(entry => entry.name === '司盈昃').costume, 'grey robe');
    assert.equal(state.entries.find(entry => entry.name === 'Alice').costume, 'blue dress');
});

test('a character mentioned only by alias still gets its remembered outfit, with its form', () => {
    const text = '渔行歌站在窗前。';
    const block = buildContinuityBlockForRequest({
        records: [snapshot(1, { name: '司盈昃', form: '人形', appear: '', costume: 'white robe' })],
        presentCharacters: detectPresentCharacters(text, library(SI)),
        bodyText: text,
    });
    assert.match(block, /^- 司盈昃｜form: 人形｜costume: white robe$/m);
    assert.ok(block.includes('形态和这里的 form 不同'), 'the form-change rule is part of the block');
});

test('the latest image replaces form and outfit together; an outfit-less form keeps only the form', () => {
    const present = detectPresentCharacters('渔行歌', library(SI));
    const records = [
        snapshot(1, { name: '司盈昃', form: '人形', appear: '', costume: 'black robe' }),
        snapshot(2, { name: '司盈昃', form: '龙形', appear: '', costume: '' }),
    ];
    const dragon = buildContinuityFromImageRecords(records, { characters: present });
    assert.deepEqual(dragon.entries.map(({ name, form, costume }) => [name, form, costume]), [['司盈昃', '龙形', '']], 'old outfit gone, form kept');
    const back = buildContinuityFromImageRecords([...records, snapshot(3, { name: '司盈昃', form: '人形', appear: '', costume: 'grey robe' })], { characters: present });
    assert.deepEqual(back.entries.map(({ name, form, costume }) => [name, form, costume]), [['司盈昃', '人形', 'grey robe']]);
});

test('a dragon without outfit is remembered as the form, so a silent body does not fall back to the first form', () => {
    const text = '渔行歌盘在石台上，没有说话。';
    const block = buildContinuityBlockForRequest({
        records: [snapshot(1, { name: '司盈昃', form: '龙形', appear: '', costume: '' })],
        presentCharacters: detectPresentCharacters(text, library(SI)),
        bodyText: text,
    });
    assert.match(block, /^- 司盈昃｜form: 龙形｜costume: （空＝没穿）$/m);
    assert.ok(block.includes('form 沿用这里列出的'), 'the block tells the model to keep the last form when the body is silent');
});

test('editing a prompt revokes the whole snapshot, form included; single-form characters stay as before', () => {
    const present = detectPresentCharacters('渔行歌 Alice', library(SI, ALICE));
    const state = buildContinuityFromImageRecords([
        snapshot(1, { name: '司盈昃', form: '龙形', appear: '', costume: '' }, { name: 'Alice', form: '', appear: '', costume: 'red coat' }),
        snapshot(2, { name: '司盈昃', revoked: true }, { name: 'Alice', revoked: true }),
    ], { characters: present });
    assert.deepEqual(names(state), []);
});

test('characters outside the library keep their own name and appearance memory', () => {
    const present = detectPresentCharacters('韩枫走过。', library(SI));
    const state = buildContinuityFromImageRecords([
        snapshot(1, { name: '韩枫', form: '', appear: 'old man', costume: 'brown coat' }),
    ], { characters: present });
    assert.deepEqual(state.entries.map(({ name, appear, costume }) => [name, appear, costume]), [['韩枫', 'old man', 'brown coat']]);
});

test('annotated names with ASCII or full-width brackets fold into the official name; other brackets are left alone', () => {
    const present = detectPresentCharacters('Al', library(ALICE));
    const state = buildContinuityFromImageRecords([
        snapshot(1, { name: 'Alice(别名: Al)', appear: '', costume: 'red coat' }),
        snapshot(2, { name: 'Alice（别名：Al, Ally）', appear: '', costume: 'blue coat' }),
        snapshot(3, { name: 'Alice（Al）', appear: '', costume: 'green coat' }),
    ], { characters: present });
    assert.deepEqual(state.entries.map(({ name, costume }) => [name, costume]).sort(), [['Alice', 'blue coat'], ['Alice（Al）', 'green coat']]);
});

// Cost: a paid image can combine the current form with clothes from a disabled/deleted form.
// A latest snapshot with an unavailable form must not reach planning or revive an older snapshot;
// other characters and the saved image records remain unchanged.
for (const [label, character, lastForm] of [
    ['disabled extra form', { ...SI, forms: [{ ...SI.forms[0], enabled: false }] }, '龙形'],
    ['disabled first form', { ...SI, formDisabled: true }, '人形'],
    ['deleted extra form', { ...SI, forms: [] }, '龙形'],
    ['renamed form', { ...SI, forms: [{ ...SI.forms[0], name: '兽形' }] }, '龙形'],
    ['all forms disabled', { ...SI, formDisabled: true, forms: [{ ...SI.forms[0], enabled: false }] }, '龙形'],
]) test(`unavailable continuity form: ${label}`, async () => {
    const bodyText = '司盈昃与Alice站在窗前。';
    const presentCharacters = detectPresentCharacters(bodyText, library(character, ALICE));
    const otherRecord = snapshot(3, { name: 'Alice', costume: 'blue dress' });
    const records = [
        snapshot(1, { name: SI.name, form: '人形', costume: 'old grey robe' }),
        snapshot(2, { name: SI.name, form: lastForm, costume: 'gold neck armor' }),
        otherRecord,
    ];
    const savedRecords = structuredClone(records);
    const args = { records, presentCharacters, bodyText };
    const continuityText = buildContinuityBlockForRequest(args);
    const expected = buildContinuityBlockForRequest({ ...args, records: [otherRecord] });
    assert.equal(continuityText, expected);
    assert.equal(buildContinuityBlockForRequest({ ...args, records: records.slice(0, 2) }), '');
    const plannerOptions = { messageText: bodyText, presentCharacters, maxImages: 1,
        expansionOptions: { runtime: { substituteParams: text => text } } };
    assert.deepEqual(
        await buildScenePlannerTask({ ...plannerOptions, continuityText }),
        await buildScenePlannerTask({ ...plannerOptions, continuityText: expected }),
    );
    assert.deepEqual(records, savedRecords);
});

test('current forms, pre-form snapshots and unregistered characters remain eligible', () => {
    const bodyText = '渔行歌与Alice、韩枫站在窗前。';
    const presentCharacters = detectPresentCharacters(bodyText, library(SI, ALICE));
    for (const char of [
        { name: SI.name, form: '龙形', costume: '' },
        { name: SI.name, costume: 'grey robe' },
        { name: 'Alice', costume: 'blue dress' },
        { name: '韩枫', appear: 'old man', costume: 'brown coat' },
    ]) {
        assert.notEqual(buildContinuityBlockForRequest({ records: [snapshot(1, char)], presentCharacters, bodyText }), '');
    }
});

test('the legacy revocation shape { name, appear: "", costume: "" } (no action, no revoked) still deletes the memory', () => {
    const present = detectPresentCharacters('渔行歌 Alice', library(SI, ALICE));
    const legacy = (timestamp, ...chars) => ({ timestamp, continuityChars: chars });
    const state = buildContinuityFromImageRecords([
        snapshot(1, { name: '司盈昃', form: '龙形', appear: '', costume: 'black robe' }, { name: 'Alice', form: '', appear: '', costume: 'red coat' }),
        legacy(2, { name: '司盈昃', appear: '', costume: '' }, { name: 'Alice', appear: '', costume: '' }),
    ], { characters: present });
    assert.deepEqual(names(state), [], 'both memories are deleted');
    // Real snapshots always carry action, so an empty costume there still means "not wearing"; user edits are flagged and mean the same.
    const bare = buildContinuityFromImageRecords([
        snapshot(1, { name: 'Alice', form: '', appear: '', costume: 'red coat' }),
        snapshot(2, { name: 'Alice', form: '', appear: '', costume: '' }),
    ], { characters: present });
    assert.deepEqual(bare.entries.map(entry => [entry.name, entry.costume]), [['Alice', '']]);
    const edited = buildContinuityFromImageRecords([
        snapshot(1, { name: 'Alice', form: '', appear: '', costume: 'red coat' }),
        legacy(2, { name: 'Alice', form: '', appear: '', costume: '', edited: true }),
    ], { characters: present });
    assert.deepEqual(edited.entries.map(entry => [entry.name, entry.costume, entry.edited]), [['Alice', '', true]]);
});
