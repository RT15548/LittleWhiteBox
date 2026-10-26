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

const hasKey = (value, key) => JSON.stringify(value).includes(`"${key}"`);
const exportPayload = library => JSON.parse(JSON.stringify(exportCharacters(library, { scope: 'all' })));
const fileOf = (characters, groups = []) => ({ type: 'novel-draw-characters', version: 4, groups, characters });

test('export carries no enabled key at character, item or group level (the switches are local-only)', () => {
    const library = normalizeCharacterLibrary({
        characters: [{ ...source, enabled: false, groupId: 'g' }, { id: 'b', name: 'Bob', enabled: false }],
        groups: [{ id: 'g', name: 'G', enabled: false }],
    });
    assert.equal(library.characters[0].enabled, false);
    assert.equal(library.characters[0].outfits[1].enabled, false);
    assert.equal(library.groups[0].enabled, false);
    const payload = exportPayload(library);
    assert.equal(hasKey(payload, 'enabled'), false);
    // 停用的条目照常导出（名称与 TAG 在），只是不带开关
    assert.deepEqual(payload.characters.find(char => char.id === 'a').outfits[1], { name: '泳装', tags: SECRET });
    assert.deepEqual(payload.groups, [{ id: 'g', name: 'G' }]);
    // 导出不改动本机库
    assert.equal(library.characters[0].outfits[1].enabled, false);
});

test('importing a file with or without enabled keys creates enabled characters, items and groups (a file cannot switch anything off)', () => {
    const plain = exportPayload(normalizeCharacterLibrary({ characters: [source], groups: [] }));
    const hostile = fileOf(
        [{ ...source, enabled: false, groupId: 'g', outfits: source.outfits.map(item => ({ ...item, enabled: false })) }],
        [{ id: 'g', name: 'G', enabled: false }],
    );
    for (const file of [plain, hostile]) {
        const parsed = parseCharacterImport(file);
        assert.equal(hasKey(parsed.entries[0].character, 'enabled'), false);
        const { library } = planCharacterImport({ characters: [], groups: [] }, parsed);
        const [created] = library.characters;
        assert.equal(created.enabled, true);
        assert.deepEqual(created.outfits, [
            { name: '白裙', tags: 'white dress' }, { name: '泳装', tags: SECRET }, { name: '睡衣', tags: 'pajamas' },
        ]);
        assert.equal(created.dynamicStates.some(item => 'enabled' in item), false);
        assert.equal(library.groups.some(group => 'enabled' in group), false);
    }
});

test('"import as disabled" is an import-time local choice for new characters only; their items stay enabled', () => {
    const parsed = parseCharacterImport(exportPayload(normalizeCharacterLibrary({ characters: [source], groups: [] })));
    const { library } = planCharacterImport({ characters: [], groups: [] }, parsed, { importNewAsDisabled: true });
    assert.equal(library.characters[0].enabled, false);
    assert.ok(library.characters[0].outfits.every(item => item.enabled !== false));
});

test('importing over an existing local entry keeps the LOCAL character, item and group switches', () => {
    const payload = exportPayload(normalizeCharacterLibrary({
        characters: [{
            id: 'a', name: 'Alice', appearance: 'new hair', groupId: 'g',
            outfits: [{ name: '白裙', tags: 'new white' }, { name: '泳装', tags: 'new swim' }, { name: '新装', tags: 'fresh' }],
            dynamicStates: [{ name: '害羞', tags: 'new blush' }],
        }],
        groups: [{ id: 'g', name: 'Crew' }],
    }));
    const local = normalizeCharacterLibrary({
        characters: [{
            id: 'a', name: 'Alice', enabled: false, groupId: 'lg',
            outfits: [{ name: '白裙', tags: 'old' }, { name: '泳装', tags: 'old', enabled: false }],
            dynamicStates: [{ name: '害羞', tags: 'old', enabled: false }],
        }],
        groups: [{ id: 'lg', name: 'crew', enabled: false }],
    });
    for (const options of [{}, { mode: 'existing-group', groupId: 'lg' }]) {
        const { library } = planCharacterImport(local, parseCharacterImport(payload), options);
        const [alice] = library.characters;
        assert.equal(alice.appearance, 'new hair');
        assert.equal(alice.enabled, false);
        assert.deepEqual(alice.outfits, [
            { name: '白裙', tags: 'new white' },
            { name: '泳装', tags: 'new swim', enabled: false },
            { name: '新装', tags: 'fresh' },
        ]);
        assert.deepEqual(alice.dynamicStates, [{ name: '害羞', tags: 'new blush', enabled: false }]);
        assert.equal(library.groups.length, 1);
        assert.equal(library.groups[0].enabled, false);
    }
    // 本机启用的保持启用，哪怕文件把同名角色 / 条目 / 分组标成停用
    const hostile = fileOf(
        [{ id: 'a', name: 'Alice', enabled: false, groupId: 'f', outfits: [{ name: '白裙', tags: 'x', enabled: false }] }],
        [{ id: 'f', name: 'Crew', enabled: false }],
    );
    const localOn = normalizeCharacterLibrary({
        characters: [{ id: 'a', name: 'Alice', groupId: 'lg', outfits: [{ name: '白裙', tags: 'old' }] }],
        groups: [{ id: 'lg', name: 'Crew' }],
    });
    const { library } = planCharacterImport(localOn, parseCharacterImport(hostile));
    assert.equal(library.characters[0].enabled, true);
    assert.deepEqual(library.characters[0].outfits, [{ name: '白裙', tags: 'x' }]);
    assert.equal('enabled' in library.groups[0], false);
});

test('name-matched replace (overwriteSameName) keeps local switches; same-named items pair up in order', () => {
    const file = fileOf([{ id: 'other', name: 'Alice', outfits: [{ name: 'x', tags: '1' }, { name: 'x', tags: '2' }, { name: 'x', tags: '3' }] }]);
    const local = normalizeCharacterLibrary({
        characters: [{ id: 'a', name: 'Alice', enabled: false, outfits: [{ name: 'x', tags: 'a', enabled: false }, { name: 'x', tags: 'b' }] }],
        groups: [],
    });
    const { library } = planCharacterImport(local, parseCharacterImport(file), { overwriteSameName: true });
    assert.equal(library.characters.length, 1);
    assert.equal(library.characters[0].id, 'a');
    assert.equal(library.characters[0].enabled, false);
    assert.deepEqual(library.characters[0].outfits.map(item => item.enabled === false), [true, false, false]);
});

test('groups are matched by name (case-insensitive): a same-name local group keeps its own switch, a new group is on', () => {
    const file = fileOf(
        [{ id: 'n1', name: 'N1', groupId: 'f1' }, { id: 'n2', name: 'N2', groupId: 'f2' }],
        [{ id: 'f1', name: 'Crew', enabled: false }, { id: 'f2', name: 'Fresh', enabled: false }],
    );
    const local = normalizeCharacterLibrary({ characters: [], groups: [{ id: 'lg', name: 'crew', enabled: false }] });
    const { library } = planCharacterImport(local, parseCharacterImport(file));
    assert.equal(library.groups.find(group => group.name === 'crew').enabled, false);
    assert.equal('enabled' in library.groups.find(group => group.name === 'Fresh'), false);
    assert.equal(library.characters.find(char => char.id === 'n1').groupId, 'lg');
});

test('export -> import onto the same library leaves every local switch as it was', () => {
    const library = normalizeCharacterLibrary({ characters: [{ ...source, enabled: false }], groups: [] });
    const { library: next } = planCharacterImport(library, parseCharacterImport(exportPayload(library)));
    assert.deepEqual(next.characters, library.characters);
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
    // 动态标签行：称呼与写入位置都不再叫“状态”，也不融入 action 一处。
    assert.ok(text.includes('\n  动态标签: 害羞=blush'));
    assert.ok(!text.includes('状态参考'));
    // 没有名字的条目回退成“动态标签”。
    assert.ok(buildCharacterInfoForLLM([{ name: 'C', type: 'girl', dynamicStates: [{ tags: 'straw hat' }] }]).includes('动态标签=straw hat'));
    // 全部停用 -> 整行省略，不留空的“服装参考:”
    const allOff = buildCharacterInfoForLLM([{ name: 'B', type: 'girl', outfits: [{ name: 'x', tags: 'y', enabled: false }] }]);
    assert.ok(!allOff.includes('服装参考'));
});

test('dynamic-tag legend is printed once under the roster header, only when someone has enabled dynamic tags', () => {
    const LEGEND = '（动态标签参考：可叠加的额外外观，按画面选用若干条，写进 action）';
    const countLegend = (text) => text.split(LEGEND).length - 1;
    const girl = (name, dynamicStates) => ({ name, type: 'girl', appearance: 'hair', dynamicStates });

    const several = buildCharacterInfoForLLM([
        girl('A', [{ name: '害羞', tags: 'blush' }]),
        girl('B', [{ name: '生气', tags: 'angry, frown' }]),
        girl('C', [{ name: '草帽', tags: 'straw hat' }]),
    ]);
    assert.equal(countLegend(several), 1);
    assert.ok(several.startsWith(`【已录入角色】\n${LEGEND}\n- A [girl]`));
    assert.ok(several.includes('\n  动态标签: 害羞=blush\n'));
    assert.ok(several.includes('\n  动态标签: 生气=angry, frown\n'));
    assert.ok(!several.includes('动态标签参考（'));

    assert.equal(countLegend(buildCharacterInfoForLLM([girl('A', []), girl('B')])), 0);
    assert.equal(countLegend(buildCharacterInfoForLLM([girl('A', [{ name: '哭泣', tags: 'crying', enabled: false }])])), 0);
    // 只有一个角色带启用的动态标签时仍只写一次，且位于清单开头。
    const mixed = buildCharacterInfoForLLM([girl('A'), girl('B', [{ name: '害羞', tags: 'blush' }])]);
    assert.equal(countLegend(mixed), 1);
    assert.ok(mixed.startsWith(`【已录入角色】\n${LEGEND}\n`));
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
