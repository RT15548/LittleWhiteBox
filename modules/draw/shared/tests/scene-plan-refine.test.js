import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolveActiveProviderConfig } from '../../../agent-core/provider-resolution.js';
import { normalizeCharacterLibrary } from '../character-library.js';
import { detectPresentCharacters } from '../present-characters.js';
import { buildContinuityEntries, stripEmptyCostumeText } from '../character-continuity.js';
import { prepareScenePlannerInput } from '../scene-planner.js';
import { executePreparedScenePlanner } from '../scene-planner-executor.js';
import { createScenePlannerEnvelope } from '../draw-run-coordinator.js';
import * as drawNodeEntry from '../../node-entry.js';
import {
    assertScenePlanRefine,
    normalizeScenePlanRefine,
    readRawPlanArguments,
    refineScenePlanTasks,
} from '../scene-plan-refine.js';

// Acceptance contracts (cost: background drawing silently skipped the "fill the costume the model left out" and de-duplication steps):
// - The finishing step runs inside executePreparedScenePlanner, the one function both the browser and the background Draw Run call,
//   and it is driven only by planner.refine, which travels inside the prepared snapshot.
// - Without planner.refine nothing changes (other image providers are unaffected).
// - The backend input check accepts a well-formed refine and rejects anything else.

const require = createRequire(import.meta.url);
// 校验函数用源码里的版本：不依赖已构建（并签名）的后台程序是否已经更新；后台程序是否导出它另有一条测试。
const runtime = { ...require('../../../../server-plugin/littlewhitebox-server/tests/runtime-fixture.js').bundle.drawRuntime, assertScenePlanRefine };
const { createEnvelopeValidator } = require('../../server/draw-runs/envelope.js');
const validate = createEnvelopeValidator(runtime);

const MIRA = { id: 'c1', name: 'Mira', type: 'girl', appearance: 'silver hair' };
const library = normalizeCharacterLibrary({ characters: [MIRA], groups: [] }).characters;
const text = 'Mira stands beside the sea.';
const presentCharacters = detectPresentCharacters(text, library);
const memoryRecords = [{ messageId: 1, timestamp: 1, continuityChars: [{ name: 'Mira', form: '', appear: '', costume: 'red coat, scarf', action: 'standing' }] }];
const entries = buildContinuityEntries({ records: memoryRecords, presentCharacters });
const providerConfig = resolveActiveProviderConfig({ provider: 'openai-compatible', modelConfigs: {
    'openai-compatible': { model: 'offline-model', baseUrl: 'https://model.invalid', apiKey: 'offline-fixture', sampling: {} },
} });

const prepare = (refine) => prepareScenePlannerInput({
    messageText: text, presentCharacters, maxImages: 1, maxPlanImages: 1, maxCharactersPerImage: 2,
    agentOptions: { providerConfig }, expansionOptions: { runtime: {} },
    ...(refine ? { refine } : {}),
});
const answer = (characters) => async () => ({
    providerConfig,
    result: { toolCalls: [{ name: 'submit_scene_plan', arguments: { images: [{ index: 1, insert_after: 1, title: 'sea', orientation: 'portrait', scene: 'sea, sunset', characters }] } }] },
});
const run = async (refine, characters) => executePreparedScenePlanner(await prepare(refine), { agentCaller: answer(characters) });
const FULL = { dedupe: true, continuity: { entries, maxEntries: 50 } };

test('the executor fills a costume the model left out from the remembered one, and marks it as not written when nothing can be filled', async () => {
    const [filled] = await run(FULL, [{ name: 'Mira', action: 'standing' }]);
    assert.equal(filled.chars[0].costume, 'red coat, scarf');
    const [unknown] = await run({ dedupe: true, continuity: { entries: [], maxEntries: 50 } }, [{ name: 'Mira', action: 'standing' }]);
    assert.equal(unknown.chars[0].costume, '');
    assert.equal(unknown.chars[0].costumeOmitted, true);
});

test('an explicitly empty costume stays empty, and the copied placeholder text is removed', async () => {
    const [bare] = await run(FULL, [{ name: 'Mira', costume: '', action: 'standing' }]);
    assert.equal(bare.chars[0].costume, '');
    assert.equal(bare.chars[0].costumeOmitted, undefined);
    const [copied] = await run(FULL, [{ name: 'Mira', costume: 'red coat, （空＝没穿）', action: 'standing' }]);
    assert.equal(copied.chars[0].costume, 'red coat');
});

test('the executor de-duplicates action and scene against the character, and leaves everything alone without refine', async () => {
    const characters = [{ name: 'Mira', costume: 'red coat', action: 'standing, red coat, silver hair' }];
    const [refined] = await run({ dedupe: true }, characters);
    assert.equal(refined.chars[0].action, 'standing');
    const [untouched] = await run(null, characters);
    assert.equal(untouched.chars[0].action, 'standing, red coat, silver hair');
});

test('refine travels inside the prepared snapshot and is cleaned up on the way', async () => {
    const prepared = await prepare({ dedupe: true, continuity: { entries: [...entries, 'not an entry'], maxEntries: 50 } });
    assert.equal(prepared.planner.refine.dedupe, true);
    assert.equal(prepared.planner.refine.continuity.entries.length, entries.length);
    assert.equal(Object.hasOwn((await prepare(null)).planner, 'refine'), false);
    assert.equal(normalizeScenePlanRefine({ dedupe: false }), null);
});

test('normalizeScenePlanRefine keeps the newest 500 entries, drops non-objects and clamps maxEntries', () => {
    const many = Array.from({ length: 520 }, (_, i) => ({ name: `n${i}` }));
    const { continuity } = normalizeScenePlanRefine({ continuity: { entries: [[], ...many, 'x'], maxEntries: 1e9 } });
    assert.equal(continuity.entries.length, 500);
    assert.equal(continuity.entries[0].name, 'n20');
    assert.equal(continuity.entries.at(-1).name, 'n519');
    assert.equal(continuity.maxEntries, 99999);
    assert.equal(normalizeScenePlanRefine({ continuity: { entries: [], maxEntries: 1.5 } }).continuity.maxEntries, 50);
    assert.doesNotThrow(() => assertScenePlanRefine({ continuity }));
    const cleaned = normalizeScenePlanRefine({ continuity: { entries: [{ name: 'a'.repeat(300), costume: 'c', junk: { deep: 1 }, at: 3, edited: true }], maxEntries: 5 } }).continuity.entries[0];
    assert.deepEqual(Object.keys(cleaned).sort(), ['at', 'costume', 'edited', 'name']);
    assert.equal(cleaned.name.length, 200);
});

test('refineScenePlanTasks does nothing without refine, and reads the raw arguments of the submit call', () => {
    const tasks = [{ index: 1, chars: [{ name: 'Mira', action: 'a' }] }];
    assert.equal(refineScenePlanTasks(tasks, { refine: null }), tasks);
    assert.deepEqual(readRawPlanArguments({ toolCalls: [{ name: 'other', arguments: { a: 1 } }, { name: 'submit_scene_plan', arguments: { b: 2 } }] }), { b: 2 });
    assert.equal(readRawPlanArguments({}), null);
});

test('assertScenePlanRefine accepts the real shape and rejects unknown keys, bad types and oversized lists', () => {
    assert.doesNotThrow(() => assertScenePlanRefine(FULL));
    assert.doesNotThrow(() => assertScenePlanRefine({ dedupe: true }));
    for (const bad of [null, [], { extra: 1 }, { dedupe: 'yes' }, { continuity: [] }, { continuity: { entries: {}, maxEntries: 5 } },
        { continuity: { entries: [], maxEntries: 0 } }, { continuity: { entries: [], maxEntries: 5, extra: 1 } },
        { continuity: { entries: ['x'], maxEntries: 5 } }, { continuity: { entries: [[]], maxEntries: 5 } },
        { continuity: { entries: [{ name: 'x'.repeat(201) }], maxEntries: 5 } }, { continuity: { entries: [{ name: 'a', extra: 1 }], maxEntries: 5 } },
        { continuity: { entries: [{ name: 'a', costume: 5 }], maxEntries: 5 } },
        { continuity: { entries: [], maxEntries: 100000 } }, { continuity: { entries: [], maxEntries: 1.5 } }, { continuity: { entries: new Array(501).fill({}), maxEntries: 5 } }]) {
        assert.throws(() => assertScenePlanRefine(bad), TypeError, JSON.stringify(bad)?.slice(0, 60));
    }
});

const recipe = { timeout: 5000, knownCharacters: [], positivePrefix: '', negativePrefix: '',
    apiBaseUrl: '', apiKey: 'offline-fixture', insecureTLS: false, requestDelay: { min: 1000, max: 1000 }, overrideSize: '',
    resolveForBackend: true, params: { model: 'nai-diffusion-4-full' }, autoLearnEnabled: false, autoLearnMode: 'new_only', seeds: [1] };
const envelopeFor = prepared => createScenePlannerEnvelope({ runId: 'run-refine-fixture', imageProvider: 'novelai', prepared, generationRecipe: recipe });

test('the background input check accepts a well-formed refine and rejects a malformed one', async () => {
    const accepted = validate(envelopeFor(await prepare(FULL)));
    assert.deepEqual(accepted.envelope.planner.refine.continuity.maxEntries, 50);
    assert.equal(accepted.envelope.planner.refine.dedupe, true);
    const bad = await prepare(FULL);
    bad.planner.refine.continuity.maxEntries = 'many';
    assert.throws(() => validate(envelopeFor(bad)), { status: 400 });
    const unknown = await prepare(FULL);
    unknown.planner.refine.something = 1;
    assert.throws(() => validate(envelopeFor(unknown)), { status: 400 });
    assert.equal(Object.hasOwn(validate(envelopeFor(await prepare(null))).envelope.planner, 'refine'), false);
});

test('the background runtime entry exports the refine check that the input validation calls', () => {
    assert.equal(typeof drawNodeEntry.assertScenePlanRefine, 'function');
    assert.throws(() => drawNodeEntry.assertScenePlanRefine({ nope: 1 }), TypeError);
});

test('oversized free text from the model or the page cannot stall the cleanup', () => {
    const started = Date.now();
    stripEmptyCostumeText(`（空＝没穿）${' '.repeat(200000)}z`);
    buildContinuityEntries({ records: [{ messageId: 1, timestamp: 1, continuityChars: [{ name: '(别名:'.repeat(50000), costume: 'z' }] }], presentCharacters });
    assert.ok(Date.now() - started < 1000);
});
