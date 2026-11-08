import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeCharacterLibrary } from '../character-library.js';
import { assembleCharacterPrompts } from '../character-prompts.js';
import { detectPresentCharacters } from '../present-characters.js';
import { buildContinuityFromImageRecords, fillOmittedCostumes, findOmittedCostumes } from '../character-continuity.js';
import { parseSubmittedScenePlan } from '../scene-plan-contract.js';

// Acceptance contracts (cost: a planner that skips the costume field entirely draws every character bare and writes "bare" into the memory):
// - What the model submitted tells "costume field not written" apart from "costume written as an empty string"; only the second means not wearing.
// - A character whose costume field was not written wears what the memory says for them (same form); an explicit empty string stays empty.
// - No memory, a different form, or an unnamed character: nothing is filled, as before. Nothing else in the plan changes.
// - Within one plan a later image continues from the earlier image's costume; the filled value is what gets remembered.

const LIN = { id: 'c1', name: '角色乙', type: 'girl', appearance: 'loli, pale hair' };
const SI = {
    id: 'c2', name: '司盈昃', aliases: ['渔行歌'], formName: '人形', type: 'boy', appearance: 'tall man',
    forms: [{ id: 'f-dragon', name: '龙形', type: 'no_humans', appearance: 'white dragon' }],
};
const library = (...characters) => normalizeCharacterLibrary({ characters, groups: [] }).characters;
const SOURCE = { sourceHash: 'h', points: [{ number: 1, offset: 0 }, { number: 2, offset: 1 }] };
const present = (text, ...characters) => detectPresentCharacters(text, library(...characters));
const record = (messageId, ...chars) => ({ messageId, timestamp: messageId, continuityChars: chars.map(char => ({ action: 'standing', ...char })) });
const parse = (images, presentCharacters) => parseSubmittedScenePlan({
    toolCalls: [{ name: 'submit_scene_plan', arguments: { images } }],
}, { presentCharacters, sceneSource: SOURCE }).tasks;
const image = (insertAfter, characters) => ({ insert_after: insertAfter, scene: 'indoors', characters });
const fill = (images, presentCharacters, records) => fillOmittedCostumes(parse(images, presentCharacters), {
    records, presentCharacters, omitted: findOmittedCostumes({ images }),
});
const costumes = tasks => tasks.map(task => task.chars.map(char => char.costume));

test('detection: a missing or null costume counts as not written, an explicit empty string does not', () => {
    const args = { images: [{ characters: [{ name: 'a' }, { name: 'b', costume: null }, { name: 'c', costume: '' }, { name: 'd', costume: 'sailor uniform' }] }, { characters: [] }] };
    assert.deepEqual(findOmittedCostumes(args), [[true, true, false, false], []]);
    assert.deepEqual(findOmittedCostumes(JSON.stringify(args)), [[true, true, false, false], []], 'a JSON string works too');
    assert.equal(findOmittedCostumes('not json'), null);
    assert.equal(findOmittedCostumes({ nope: 1 }), null);
    const lin = present('角色乙', LIN);
    const tasks = parse(args.images.slice(0, 1).map(image => ({ ...image, insert_after: 1, scene: 'x', characters: [{ name: '角色乙', action: 'a' }] })), lin);
    assert.deepEqual(fillOmittedCostumes(tasks, { records: [record(1, { name: '角色乙', costume: 'hanfu' })], presentCharacters: lin }), tasks, 'without detection nothing is filled');
});

test('an omitted costume continues the remembered outfit; an explicit empty string stays bare', () => {
    const lin = present('角色乙', LIN);
    const filled = fill([image(1, [{ name: '角色乙', action: 'standing' }]), image(2, [{ name: '角色乙', action: 'sitting', costume: '' }])],
        lin, [record(1, { name: '角色乙', costume: 'light yellow hanfu' })]);
    assert.deepEqual(costumes(filled), [['light yellow hanfu'], ['']]);
});

test('no memory, or a different form, fills nothing', () => {
    const lin = present('角色乙', LIN);
    assert.deepEqual(costumes(fill([image(1, [{ name: '角色乙', action: 'standing' }])], lin, [])), [['']]);

    const si = present('渔行歌', SI);
    const records = [record(1, { name: '司盈昃', form: '人形', costume: 'grey robe' })];
    const dragon = fill([image(1, [{ name: '渔行歌', form: '龙形', action: 'flying' }])], si, records);
    assert.equal(dragon[0].chars[0].form, '龙形');
    assert.equal(dragon[0].chars[0].costume, '', 'the human outfit is not copied onto the dragon form');
    const human = fill([image(1, [{ name: '渔行歌', action: 'walking' }])], si, records);
    assert.equal(human[0].chars[0].costume, 'grey robe', 'the alias resolves to the remembered character');
});

// A memory can legitimately have no form (images recorded before the form was remembered, or a memory edit saved with the form box
// left empty). The continuity block still tells the planner to build on it, so the fill reuses it too: a missing memory form means
// "not known", not "different". Only two known, different forms count as a form change.
test('a memory without a form is reused for the alias and for a remembered empty costume', () => {
    const si = present('渔行歌', SI);
    const fillOne = (character, records) => fill([image(1, [character])], si, records)[0].chars[0];
    const state = char => [char.form, char.costume, char.costumeOmitted ?? null];
    assert.deepEqual(state(fillOne({ name: '司盈昃', action: 'walking' }, [record(1, { name: '司盈昃', costume: 'nude' })])), ['人形', 'nude', null]);
    assert.deepEqual(state(fillOne({ name: '渔行歌', action: 'walking' }, [record(1, { name: '司盈昃', costume: 'grey robe' })])), ['人形', 'grey robe', null]);
    assert.deepEqual(state(fillOne({ name: '渔行歌', action: 'walking' }, [record(1, { name: '司盈昃', costume: '' })])), ['人形', '', null]);
    const known = [record(1, { name: '司盈昃', form: '人形', costume: 'nude' })];
    assert.deepEqual(state(fillOne({ name: '司盈昃', form: '龙形', action: 'flying' }, known)), ['龙形', '', true], 'two known, different forms never copy the costume across');
    assert.deepEqual(state(fillOne({ name: '司盈昃', form: '人形', action: 'walking' }, known)), ['人形', 'nude', null], 'the same form keeps working');
});

// Getting a new outfit written is the prompt's job (costume is required, the block asks for it on a clothing change); the fill never guesses
// from the action whether the character is changing clothes.
test('an omitted costume is filled from memory whatever the action says, dressing actions included', () => {
    const lin = present('角色乙', LIN);
    for (const action of ['standing, smiling', 'standing, adjusting clothes, smiling', '1.2::putting on:: flower wreath', 'getting dressed']) {
        const [task] = fill([image(1, [{ name: '角色乙', action }])], lin, [record(1, { name: '角色乙', costume: 'breastband, side-lying' })]);
        assert.deepEqual([task.chars[0].costume, task.chars[0].costumeOmitted ?? null], ['breastband, side-lying', null], action);
    }
});

test('inside one plan a later image continues from the earlier one, and a remembered bare state stays bare', () => {
    const lin = present('角色乙', LIN);
    const filled = fill([
        image(1, [{ name: '角色乙', action: 'standing', costume: 'white inner robe, pleated skirt' }]),
        image(2, [{ name: '角色乙', action: 'sitting' }]),
    ], lin, [record(1, { name: '角色乙', costume: 'hanfu' })]);
    assert.deepEqual(costumes(filled), [['white inner robe, pleated skirt'], ['white inner robe, pleated skirt']]);

    const bareMemory = fill([image(1, [{ name: '角色乙', action: 'standing' }])], lin,
        [record(1, { name: '角色乙', costume: 'hanfu' }), record(2, { name: '角色乙', costume: '' })]);
    assert.deepEqual(costumes(bareMemory), [['']], 'a character remembered as bare stays bare');
});

test('end to end: the filled costume reaches the character prompt that is drawn', () => {
    const lin = present('角色乙', LIN);
    const [task] = fill([image(1, [{ name: '角色乙', action: 'standing' }])], lin, [record(1, { name: '角色乙', costume: 'light yellow hanfu' })]);
    const [prompt] = assembleCharacterPrompts(task.chars, library(LIN));
    assert.match(prompt.prompt, /light yellow hanfu/);
});

// Acceptance contracts (cost: a character the planner stayed silent about is remembered as "not wearing", and the next image strips them):
// - An omitted costume that nothing could fill is marked costumeOmitted; replaying the marked snapshot changes no memory and creates none.
// - A written empty string stays "not wearing" (no marker). Without detection (omitted not an array) nothing is marked.
// - The "（空＝没穿）" placeholder a model copies into costume is removed before it can be remembered.
test('an omitted costume that cannot be filled is marked and skipped when the memory is replayed', () => {
    const si = present('渔行歌', SI);
    const records = [record(1, { name: '司盈昃', form: '人形', costume: 'grey robe' })];
    const planned = parse([image(1, [{ name: '渔行歌', form: '龙形', action: 'flying' }, { name: '渔行歌', form: '龙形', action: 'flying', costume: '' }])], si);
    const before = JSON.stringify(planned);
    const filled = fillOmittedCostumes(planned, { records, presentCharacters: si, omitted: [[true, false]] });
    assert.equal(JSON.stringify(planned), before, 'inputs are not mutated');
    assert.deepEqual(filled[0].chars.map(char => char.costumeOmitted), [true, undefined], 'only the omitted one is marked, an explicit empty string is not');
    assert.deepEqual(fillOmittedCostumes(planned, { records, presentCharacters: si, omitted: null }), planned, 'without detection nothing is marked');

    const [omittedChar] = filled[0].chars;
    const afterDragon = buildContinuityFromImageRecords([...records, record(2, omittedChar)], { characters: si });
    assert.deepEqual(afterDragon.entries.map(({ name, form, costume }) => [name, form, costume]), [['司盈昃', '人形', 'grey robe']], 'the marked snapshot changes nothing');
    const brandNew = buildContinuityFromImageRecords([record(1, { name: '角色乙', action: 'a', costume: '', costumeOmitted: true })], { characters: [] });
    assert.deepEqual(brandNew.entries, [], 'and creates no entry for a new character');
    const written = buildContinuityFromImageRecords([...records, record(2, { ...omittedChar, costumeOmitted: undefined, costume: '' })], { characters: si });
    assert.deepEqual(written.entries.map(({ form, costume }) => [form, costume]), [['龙形', '']], 'an unmarked empty costume still means not wearing');
});

test('end to end: a silent character stays unknown, and a silent plan does not wipe the earlier memory', () => {
    const lin = present('角色乙', LIN);
    const first = fill([image(1, [{ name: '角色乙', action: 'standing' }])], lin, []);
    assert.equal(first[0].chars[0].costumeOmitted, true);
    const stored = record(1, ...first[0].chars);
    assert.deepEqual(buildContinuityFromImageRecords([stored], { characters: lin }).entries, [], 'no memory is invented');
    const second = fill([image(1, [{ name: '角色乙', action: 'sitting' }])], lin, [stored, record(2, { name: '角色乙', costume: 'hanfu' })]);
    assert.deepEqual(costumes(second), [['hanfu']], 'later images continue from the real memory');

    const si = present('渔行歌', SI);
    const dragon = fill([image(1, [{ name: '渔行歌', form: '龙形', action: 'flying' }])], si, [record(1, { name: '司盈昃', form: '人形', costume: 'grey robe' })]);
    const replay = [record(1, { name: '司盈昃', form: '人形', costume: 'grey robe' }), record(2, ...dragon[0].chars)];
    const human = fill([image(1, [{ name: '渔行歌', action: 'walking' }])], si, replay);
    assert.deepEqual(costumes(human), [['grey robe']], 'the human outfit survived the silent dragon image');
});

test('the copied placeholder text is stripped from costume, with or without omission detection', () => {
    const lin = present('角色乙', LIN);
    const images = [image(1, [{ name: '角色乙', action: 'a', costume: '（空＝没穿）' }]), image(2, [{ name: '角色乙', action: 'b', costume: '（空＝没穿）, white robe' }])];
    const tasks = parse(images, lin);
    const frozen = JSON.stringify(tasks);
    assert.deepEqual(costumes(fillOmittedCostumes(tasks, { presentCharacters: lin })), [[''], ['white robe']]);
    assert.deepEqual(costumes(fillOmittedCostumes(tasks, { presentCharacters: lin, omitted: findOmittedCostumes({ images }) })), [[''], ['white robe']]);
    assert.equal(JSON.stringify(tasks), frozen, 'inputs are not mutated');
    assert.equal(fillOmittedCostumes(parse([image(1, [{ name: '角色乙', action: 'a', costume: 'hanfu' }])], lin), { presentCharacters: lin })[0].chars[0].costume, 'hanfu');
});

test('an omitted-and-unfilled costume keeps the remembered form and costume, but an unregistered character still updates its appearance', () => {
    const records = [
        record(1, { name: 'Mira', form: '', appear: 'black hair', costume: 'red coat' }),
        record(2, { name: 'Mira', form: '', appear: 'red eyes', costume: '', costumeOmitted: true }),
    ];
    const { entries } = buildContinuityFromImageRecords(records, { knownNames: [], characters: [] });
    assert.deepEqual(entries.map(entry => [entry.name, entry.appear, entry.costume]), [['Mira', 'red eyes', 'red coat']]);
});

test('an omitted-and-unfilled costume of a character with no memory creates no entry', () => {
    const records = [record(1, { name: 'Mira', form: '', appear: 'black hair', costume: '', costumeOmitted: true })];
    assert.deepEqual(buildContinuityFromImageRecords(records, { knownNames: [], characters: [] }).entries, []);
});
