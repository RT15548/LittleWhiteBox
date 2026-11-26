import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultSettings, getEffectiveParams, normalizeSettings, getSizeOptions } from './settings-model.js';
import { compileGemini, compileOpenAi, buildMultimodalRequest, createGenerationRecipe } from './compiler.js';
import { adaptedDirectInput, generationGuidance, naturalPlannerOptions } from './planning-input.js';
import { createSettingsRepository } from './settings-repository.js';
import { createSubmitScenePlanTool } from '../../shared/scene-plan-tool.js';
import { parseSubmittedScenePlan } from '../../shared/scene-plan-contract.js';
import { createSceneSource } from '../../shared/scene-source.js';
import { normalizeScenePlannerProfile } from '../../shared/scene-planner-profile.js';
import { prepareScenePlannerInput } from '../../shared/scene-planner.js';
import { createPreparedScenePlannerTask, executePreparedScenePlanner } from '../../shared/scene-planner-executor.js';
import { NON_EXPLICIT_ILLUSTRATION_INSTRUCTION } from './prompts.js';

const ref = { mimeType: 'image/png', data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN3sAAAAASUVORK5CYII=' };
const finalScene = 'Two fully clothed adults embrace beside a rain-streaked window.';
for (const provider of ['gemini', 'openai']) {
    test(`${provider}: a complete adapted description is the only upstream text`, () => {
        const settings = createDefaultSettings(provider);
        settings.paramsPresets[0].positivePrefix = 'RAW_STYLE';
        const original = { prompt: 'RAW_SCENE', negativePrompt: 'RAW_EXCLUSIONS', characterPrompts: [{ prompt: 'RAW_CHARACTER', uc: 'RAW_CHARACTER_EXCLUSION' }], referenceImages: [ref] };
        assert.deepEqual(JSON.parse(generationGuidance(settings, original)), {
            styleRequest: 'RAW_STYLE', exclusions: 'RAW_EXCLUSIONS', characters: original.characterPrompts, referenceImageCount: 1,
        });
        const adapted = adaptedDirectInput(original, [{ scene: finalScene, chars: [] }]);
        const request = buildMultimodalRequest(provider, { ...adapted, params: getEffectiveParams(provider, settings) });
        assert.equal(provider === 'gemini' ? request.payload.contents[0].parts[0].text : request.payload.prompt, finalScene);
        assert.deepEqual(request.referenceImages, [ref]);
        assert.equal(original.prompt, 'RAW_SCENE');
        assert.throws(() => buildMultimodalRequest(provider, { ...original, params: getEffectiveParams(provider, settings) }));
    });
    test(`${provider}: recipe cannot append raw character or preset text after planning`, () => {
        const settings = createDefaultSettings(provider);
        settings.paramsPresets[0].positivePrefix = 'RAW_PRESET';
        const recipe = createGenerationRecipe(provider, settings, { promptOverride: 'RAW_OVERRIDE', knownCharacters: [{ appearance: 'RAW_APPEARANCE' }], referenceImages: [ref] });
        const compile = provider === 'gemini' ? compileGemini : compileOpenAi;
        const batch = compile([{ scene: finalScene, chars: [], placement: { mode: 'tail' } }], recipe);
        const payload = batch.items[0].request.payload;
        assert.equal(provider === 'gemini' ? payload.contents[0].parts[0].text : payload.prompt, finalScene);
        assert.deepEqual(batch.artifacts[0].promptData.characterPrompts, []);
        assert.deepEqual(batch.items[0].request.referenceImages, [ref]);
        assert.throws(() => compile([{ scene: finalScene, chars: [{ appear: 'RAW_APPEARANCE' }] }], recipe));
    });
    test(`${provider}: settings roundtrip preserves shared control choices and parameter overrides`, () => {
        const settings = createDefaultSettings(provider);
        settings.overrideMaxImages = 0; settings.showFloatingButton = false;
        settings.paramsPresets[0].maxImages = 3;
        settings.promptPresets[0].sceneRules = 'atmospheric lighting';
        settings.overrideSize = provider === 'gemini' ? '16:9' : '1536x1024';
        const restored = normalizeSettings(provider, settings);
        assert.deepEqual(restored, settings);
        assert.equal(getEffectiveParams(provider, restored)[provider === 'gemini' ? 'aspectRatio' : 'size'], settings.overrideSize);
        const field = provider === 'gemini' ? 'aspectRatio' : 'size';
        const explicit = provider === 'gemini' ? '4:3' : '1024x1024';
        assert.equal(getEffectiveParams(provider, restored, { [field]: explicit })[field], explicit);
        assert.equal(getSizeOptions(provider)[0].value, 'default');
    });
    test(`${provider}: planner exposes complete scene rather than unadapted character fields`, () => {
        const settings = createDefaultSettings(provider);
        const options = naturalPlannerOptions(provider, settings);
        assert.ok(options.systemInstruction.length);
        assert.equal(options.plannerProfile.promptStyle, 'natural');
        const tool = createSubmitScenePlanTool({ profile: options.plannerProfile });
        assert.equal(tool.function.parameters.properties.images.items.properties.characters.maxItems, 0);
        const sceneSource = createSceneSource('A scene to illustrate.');
        const args = { images: [{ insert_after: 1, scene: finalScene, characters: [] }] };
        const result = { toolCalls: [{ name: 'submit_scene_plan', arguments: args }] };
        const parsed = parseSubmittedScenePlan(result, { sceneSource, promptStyle: 'natural', centerMode: 'none' });
        assert.equal(parsed.tasks[0].scene, finalScene);
        args.images[0].characters.push({ name: 'person', appear: 'RAW_CHARACTER' });
        assert.throws(() => parseSubmittedScenePlan(result, { sceneSource, promptStyle: 'natural', centerMode: 'none' }), error => error.code === 'TOOL_ARGUMENTS_SCHEMA_INVALID');
    });
}

test('old tag-based providers keep their existing character contract', () => {
    const profile = normalizeScenePlannerProfile({ imageModelName: 'existing' });
    assert.equal(profile.promptStyle, undefined);
    const characters = createSubmitScenePlanTool({ profile }).function.parameters.properties.images.items.properties.characters;
    assert.ok(characters.items.properties.appear);
    assert.notEqual(characters.maxItems, 0);
});

test('GPT Image presets default to JPEG without losing saved transparency or a selected format', () => {
    const settings = createDefaultSettings('openai');
    const [defaultPreset] = settings.paramsPresets;
    assert.equal(defaultPreset.params.outputFormat, 'jpeg');
    const previousParams = { ...defaultPreset.params };
    delete previousParams.outputFormat;
    settings.paramsPresets = [
        { ...defaultPreset, params: previousParams },
        { ...defaultPreset, id: 'transparent', name: 'Transparent', params: { ...previousParams, background: 'transparent' } },
        { ...defaultPreset, id: 'webp', name: 'WebP', params: { ...previousParams, outputFormat: 'webp' } },
    ];
    const loaded = normalizeSettings('openai', settings);
    assert.deepEqual(loaded.paramsPresets.map(item => item.params.outputFormat), ['jpeg', 'png', 'webp']);
    for (const [selectedParamsPresetId, format] of [['default', 'jpeg'], ['transparent', 'png'], ['webp', 'webp']]) {
        loaded.selectedParamsPresetId = selectedParamsPresetId;
        const batch = compileOpenAi([{ scene: finalScene }], createGenerationRecipe('openai', normalizeSettings('openai', loaded)));
        assert.equal(batch.items[0].request.payload.output_format, format);
    }
});

test('invalid or incomplete adaptation never yields an image request', () => {
    for (const tasks of [[], [{ scene: '' }], [{ scene: finalScene }, { scene: finalScene }], [{ scene: finalScene, chars: [{}] }]]) {
        assert.throws(() => adaptedDirectInput({ prompt: 'source' }, tasks));
    }
});

test('prepared natural planning retains its instruction and complete-scene contract across server transfer', async () => {
    const settings = createDefaultSettings('gemini');
    settings.paramsPresets[0].positivePrefix = 'RAW_STYLE_FIXTURE';
    const options = naturalPlannerOptions('gemini', settings, { negativePrompt: 'RAW_EXCLUSION_FIXTURE' });
    const prepared = await prepareScenePlannerInput({ ...options,
        messageText: 'A quiet scene in a room.', maxImages: 1,
        presentCharacters: [{ name: 'Alex', appearance: 'RAW_APPEARANCE_FIXTURE', outfits: [{ name: 'robe', tags: 'RAW_CLOTHING_FIXTURE' }] }],
        expansionOptions: { runtime: { substituteParams: text => text } },
        agentCaller: async () => undefined,
    });
    const transferred = JSON.parse(JSON.stringify(prepared));
    const task = createPreparedScenePlannerTask(transferred);
    assert.equal(task.systemPrompt, NON_EXPLICIT_ILLUSTRATION_INSTRUCTION);
    assert.equal(transferred.planner.validationContext.promptStyle, 'natural');
    assert.equal(transferred.planner.validationContext.centerMode, 'none');
    const documents = task.tools.slice(1).flatMap(tool => Object.values(tool.function.parameters.properties)
        .map(field => field.description)).join('\n');
    for (const source of ['RAW_STYLE_FIXTURE', 'RAW_EXCLUSION_FIXTURE', 'RAW_APPEARANCE_FIXTURE', 'RAW_CLOTHING_FIXTURE']) {
        assert.equal(documents.split(source).length - 1, 1);
    }
    const tasks = await executePreparedScenePlanner(transferred, { agentCaller: async () => ({ result: {
        toolCalls: [{ name: 'submit_scene_plan', arguments: { images: [{ insert_after: 1, scene: finalScene, characters: [] }] } }],
    } }), logger: () => undefined });
    const batch = compileGemini(tasks, createGenerationRecipe('gemini', settings));
    assert.equal(batch.items[0].request.payload.contents[0].parts[0].text, finalScene);
});

test('settings writes serialize mutators and publish only confirmed changes', async () => {
    let disk, fail = false;
    const repository = createSettingsRepository(() => ({ getStrict: async () => null, setAndSave: async (_key, value) => {
        if (fail) throw new Error('disk_failed');
        disk = structuredClone(value);
    } }));
    const states = [];
    const dispose = repository.subscribe('gemini', value => states.push(value));
    await Promise.all([
        repository.update('gemini', value => { value.mode = 'auto'; }),
        repository.update('gemini', value => { value.overrideMaxImages = 4; }),
    ]);
    assert.equal(repository.get('gemini').mode, 'auto');
    assert.equal(repository.get('gemini').overrideMaxImages, 4);
    assert.equal(states.length, 2);
    assert.equal(disk.apiKey, undefined);
    assert.equal(disk.apiBaseUrl, undefined);
    assert.equal(disk.apiPresets[0].config.apiBaseUrl, repository.get('gemini').apiBaseUrl);
    fail = true;
    await assert.rejects(repository.update('gemini', value => { value.mode = 'manual'; }));
    assert.equal(repository.get('gemini').mode, 'auto');
    assert.equal(states.length, 2);
    fail = false;
    await repository.update('gemini', value => { value.showFloorButton = false; });
    assert.equal(repository.get('gemini').showFloorButton, false);
    dispose();
});

test('API presets keep the transport, image API, and calling model together through saves and switches', async () => {
    let disk;
    const create = () => createSettingsRepository(() => ({
        getStrict: async () => structuredClone(disk),
        setAndSave: async (_key, value) => { disk = structuredClone(value); },
    }));
    const provider = 'openai';
    const repository = create();
    const settings = await repository.load(provider);
    assert.equal(settings.sendMode, 'frontend');
    assert.equal(settings.imageApi, 'images');
    await assert.rejects(repository.update(provider, draft => { draft.imageApi = 'responses'; }), { code: 'missing_responses_model' });
    assert.equal(disk, undefined);
    const switchTo = id => repository.update(provider, draft => {
        draft.activeApiPresetId = id;
        Object.assign(draft, draft.apiPresets.find(preset => preset.id === id).config);
    });
    await repository.update(provider, draft => {
        draft.apiPresets.push({ id: 'proxy', name: 'Proxy', config: { ...draft.apiPresets[0].config, sendMode: 'backend',
            imageApi: 'responses', responsesModel: '  relay-caller  ' } });
    });
    const transport = ({ sendMode, imageApi, responsesModel }) => ({ sendMode, imageApi, responsesModel });
    const proxy = { sendMode: 'backend', imageApi: 'responses', responsesModel: 'relay-caller' };
    assert.deepEqual(transport(await switchTo('proxy')), proxy);
    for (const field of Object.keys(proxy)) assert.equal(Object.hasOwn(disk, field), false);
    assert.deepEqual(transport(await create().load(provider)), proxy);
    assert.deepEqual(transport(await switchTo('default')), { sendMode: 'frontend', imageApi: 'images', responsesModel: '' });
});
