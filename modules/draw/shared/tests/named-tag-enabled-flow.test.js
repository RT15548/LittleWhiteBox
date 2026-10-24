import assert from 'node:assert/strict';
import test from 'node:test';
import {
    duplicateCharacters,
    exportCharacters,
    normalizeCharacter,
    normalizeCharacterLibrary,
    parseCharacterImport,
    planCharacterImport,
} from '../character-library.js';
import { detectPresentCharacters } from '../present-characters.js';
import { buildCharacterInfoForLLM, prepareScenePlannerInput } from '../scene-planner.js';
import { getNovelPlannerProfile } from '../../providers/novelai/novel-prompts.js';

// Acceptance contracts (cost: the AI is shown an outfit/state the user switched off, or a switch is lost on save/copy/import):
// - Each outfit / dynamic state carries its own `enabled`; missing = on, only `false` is stored.
// - The switch survives normalisation, duplication, export -> import and field-level import replace.
// - Disabled items never reach the scene planner input, whichever path produced the character list.

const SECRET = 'SECRET-DISABLED-TAGS';
const source = {
    id: 'a',
    name: 'Alice',
    appearance: 'silver hair',
    outfits: [
        { name: '白裙', tags: 'white dress' },
        { name: '泳装', tags: SECRET, enabled: false },
        { name: '睡衣', tags: 'pajamas', enabled: true },
    ],
    dynamicStates: [
        { name: '害羞', tags: 'blush' },
        { name: '哭泣', tags: `${SECRET}-state`, enabled: false },
    ],
};

test('normalizeCharacter keeps enabled:false only, defaulting old data to on', () => {
    const char = normalizeCharacter(source);
    assert.deepEqual(char.outfits, [
        { name: '白裙', tags: 'white dress' },
        { name: '泳装', tags: SECRET, enabled: false },
        { name: '睡衣', tags: 'pajamas' },
    ]);
    assert.deepEqual(char.dynamicStates, [{ name: '害羞', tags: 'blush' }, { name: '哭泣', tags: `${SECRET}-state`, enabled: false }]);
    const legacy = normalizeCharacter({ id: 'l', name: 'L', outfits: [{ name: 'x', tags: 'y' }], costumes: [{ name: 'ignored', tags: 'z' }] });
    assert.equal(JSON.stringify(legacy.outfits), '[{"name":"x","tags":"y"}]');
    // 旧字段别名 costumes / clothes 同样走同一套规范化
    assert.deepEqual(normalizeCharacter({ id: 'c', name: 'C', clothes: [{ name: 'k', tags: 'v', enabled: false }] }).outfits, [{ name: 'k', tags: 'v', enabled: false }]);
});

test('duplicate keeps each item switch and does not share nested objects with the original', () => {
    const library = normalizeCharacterLibrary({ characters: [source], groups: [] });
    const { library: next, newIds } = duplicateCharacters(library, ['a']);
    const copy = next.characters.find(char => char.id === newIds[0]);
    assert.deepEqual(copy.outfits, library.characters[0].outfits);
    assert.equal(copy.outfits[1].enabled, false);
    copy.outfits[1].enabled = true;
    assert.equal(library.characters[0].outfits[1].enabled, false);
});

test('export -> import round trip preserves the switches, and field-level replace takes the file value', () => {
    const library = normalizeCharacterLibrary({ characters: [source], groups: [] });
    const payload = JSON.parse(JSON.stringify(exportCharacters(library, { scope: 'all' })));
    assert.equal(payload.characters[0].outfits[1].enabled, false);
    assert.equal(Object.hasOwn(payload.characters[0].outfits[0], 'enabled'), false);

    const parsed = parseCharacterImport(payload);
    assert.deepEqual(parsed.entries[0].character.outfits, library.characters[0].outfits);

    // 本地同 id 角色里该服装是开的：导入文件里它是关的，字段级替换后应是关的
    const local = normalizeCharacterLibrary({ characters: [{ id: 'a', name: 'Alice', outfits: [{ name: '泳装', tags: SECRET }] }], groups: [] });
    const plan = planCharacterImport(local, parsed, { policy: 'replace' });
    assert.deepEqual(plan.library.characters[0].outfits, library.characters[0].outfits);
});

test('imported items with a non-boolean enabled are treated as on (only an explicit false disables)', () => {
    const parsed = parseCharacterImport({
        type: 'novel-draw-characters', version: 4,
        characters: [{ id: 'x', name: 'X', outfits: [{ name: 'a', tags: 'b', enabled: 'false' }, { name: 'c', tags: 'd', enabled: null }] }],
    });
    assert.deepEqual(parsed.entries[0].character.outfits, [{ name: 'a', tags: 'b' }, { name: 'c', tags: 'd' }]);
});

test('present characters carry only enabled outfits / states, without the enabled key', () => {
    const library = normalizeCharacterLibrary({ characters: [source], groups: [] });
    const [present] = detectPresentCharacters('Alice 走进了房间。', library);
    assert.deepEqual(present.outfits, [{ name: '白裙', tags: 'white dress' }, { name: '睡衣', tags: 'pajamas' }]);
    assert.deepEqual(present.dynamicStates, [{ name: '害羞', tags: 'blush' }]);
    assert.ok(!JSON.stringify(present).includes(SECRET));
});

test('planner character facts never mention disabled items, even when raw library items are passed in', () => {
    const text = buildCharacterInfoForLLM([{ ...source, type: 'girl' }]);
    assert.ok(!text.includes(SECRET));
    assert.ok(!text.includes('泳装'));
    assert.ok(!text.includes('哭泣'));
    assert.ok(text.includes('服装参考: 白裙=white dress； 睡衣=pajamas'));
    assert.ok(text.includes('害羞=blush'));
    // 全部停用 -> 整行省略，不留空的“服装参考:”
    const allOff = buildCharacterInfoForLLM([{ name: 'B', type: 'girl', outfits: [{ name: 'x', tags: 'y', enabled: false }] }]);
    assert.ok(!allOff.includes('服装参考'));
});

test('the prepared planner request (prompt sent to the model) excludes disabled items', async () => {
    const library = normalizeCharacterLibrary({ characters: [source], groups: [] });
    const present = detectPresentCharacters('Alice 走进了房间。', library);
    const snapshot = await prepareScenePlannerInput({
        messageText: 'Alice 走进了房间。',
        presentCharacters: present,
        promptDefaults: { topSystem: '你是画面规划助手。', tagGuideContent: '', sceneRules: '' },
        plannerProfile: getNovelPlannerProfile('nai-diffusion-4-5-full'),
        expansionOptions: { runtime: { substituteParams: text => text } },
        agentOptions: { providerConfig: { provider: 'openai-compatible', model: 'test-model' } },
    });
    const prompt = JSON.stringify(snapshot.planner.prompt);
    assert.ok(prompt.includes('white dress'));
    assert.ok(prompt.includes('blush'));
    assert.ok(!prompt.includes(SECRET));
    assert.ok(!JSON.stringify(snapshot.planner.presentCharacters).includes(SECRET));
});
