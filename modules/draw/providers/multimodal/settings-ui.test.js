import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { parseHTML } from 'linkedom';
import { apiFieldsFor, createDefaultSettings, validateConnection } from './settings-model.js';
import { createSettingsRepository } from './settings-repository.js';
import { bindSettingsPresetList } from './settings-preset-list.js';
import { bindTestView } from './settings-test-view.js';
import { bindImageApiFields } from './settings-image-api.js';
import { createApiPresetPage } from '../../shared/api-preset-page.js';
import { pullModelsForProvider } from '../../../agent-core/model-list.js';
import { setHostChatCompletionsRequestHeadersProvider } from '../../../../shared/host-llm/chat-completions/client.js';

const PAGE = readFileSync(new URL('./settings.html', import.meta.url), 'utf8');
const IMAGE = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN3sAAAAASUVORK5CYII=';

test('Responses preset writes validate before prompting, and discovery sends the current draft by the chosen route', async t => {
    const { document } = parseHTML(PAGE);
    const previousOption = document.defaultView.Option;
    document.defaultView.Option = function Option(label, value) {
        const node = document.createElement('option');
        node.value = value;
        node.textContent = label;
        return node;
    };
    t.after(() => { document.defaultView.Option = previousOption; });
    const query = selector => document.querySelector(selector);
    const provider = 'openai', fields = apiFieldsFor(provider);
    let sendMode = 'frontend', writes = 0, prompts = 0, focusCount = 0;
    let persisted = createDefaultSettings(provider);
    const baseUrl = 'https://offline.invalid/custom/v1', apiKey = 'offline-draft-key';
    const model = query('[name="responsesModel"]');
    model.focus = () => { focusCount++; };
    query('[name="apiBaseUrl"]').value = baseUrl;
    query('[name="apiKey"]').value = apiKey;
    setHostChatCompletionsRequestHeadersProvider(() => ({ 'X-Test-CSRF': 'offline-token' }));
    t.after(() => setHostChatCompletionsRequestHeadersProvider(null));
    const data = [{ id: 'luna' }, { id: 'luna-image' }, { id: 'luna-image' }];
    const network = t.mock.method(globalThis, 'fetch', async () => Response.json({ data }));
    const binding = bindImageApiFields({ document, provider, report: () => {}, getSendMode: () => sendMode,
        pullModels: pullModelsForProvider });
    binding.fill(persisted);
    const page = createApiPresetPage({
        presetOptions: { fields, normalizeConfig: value => validateConnection(provider, { ...persisted.apiPresets[0].config, ...value }) },
        getSettings: () => persisted, getSettingsDocument: () => document, querySettings: query,
        containerSelector: '#mm-api-presets', panelSelector: '[data-page="api"]', formSelector: '#mm-api-form',
        readConfig: () => ({ apiBaseUrl: baseUrl, apiKey, timeout: 180000, sendMode, ...binding.read() }),
        fillConfig: binding.fill, validateForm: binding.validate,
        prompt: () => { prompts++; return 'Responses preset'; },
        persist: async change => { writes++; change(persisted); return true; },
        createListView: () => ({ refresh() {}, destroy() {} }),
    });
    t.after(() => { page.destroy(); binding.destroy(); });
    page.ensureBar();
    query('[data-image-api="responses"]').click();
    for (const action of ['overwrite', 'save-as']) {
        query(`[data-action="${action}"]`).click();
        await nextTurn();
    }
    assert.equal(writes, 0);
    assert.equal(prompts, 0);
    assert.equal(focusCount, 2);
    assert.equal(model.getAttribute('aria-invalid'), 'true');
    for (sendMode of ['frontend', 'backend']) {
        query('#mm-pull-models').click();
        await nextTurn();
        assert.deepEqual([...query('#mm-model-list').querySelectorAll('option')].map(option => option.value).filter(Boolean), ['luna', 'luna-image']);
    }
    const [[direct, directInit], [host, hostInit]] = network.mock.calls.map(call => call.arguments);
    assert.equal(direct, `${baseUrl}/models`);
    assert.equal(directInit.headers.Authorization, `Bearer ${apiKey}`);
    assert.equal(host, '/api/backends/chat-completions/status');
    assert.deepEqual(JSON.parse(hostInit.body), { chat_completion_source: 'openai', reverse_proxy: baseUrl, proxy_password: apiKey });
    assert.equal(network.mock.callCount(), 2);
    model.value = 'manual-caller';
    query('[data-action="save-as"]').click();
    await nextTurn();
    assert.equal(writes, 1);
    assert.equal(persisted.apiPresets.find(preset => preset.id === persisted.activeApiPresetId).config.responsesModel, 'manual-caller');
    query('[data-image-api="images"]').click();
    query('[data-action="overwrite"]').click();
    await nextTurn();
    const saved = persisted.apiPresets.find(preset => preset.id === persisted.activeApiPresetId).config;
    assert.equal(saved.imageApi, 'images');
    assert.equal(saved.responsesModel, 'manual-caller');
    binding.fill(saved);
    query('[data-image-api="responses"]').click();
    assert.equal(binding.read().responsesModel, 'manual-caller');
    assert.deepEqual(await pullModelsForProvider({ provider: 'openai-responses', baseUrl, apiKey }), ['luna']);
});

test('saving a prompt leaves later edits dirty until the user saves them', async () => {
    const { window, document } = parseHTML(PAGE);
    window.confirm = () => true;
    window.prompt = () => null;
    const root = document.querySelector('[data-presets="prompt"]');
    const saved = { promptPresets: [{ id: 'p', name: 'P', opening: 'original' }], selectedPromptPresetId: 'p' };
    const firstSave = Promise.withResolvers();
    let text, pending = firstSave.promise;
    const list = bindSettingsPresetList({ root, label: 'Prompt', getState: () => saved,
        persist: async mutator => { await pending; mutator(saved); },
        listKey: 'promptPresets', selectionKey: 'selectedPromptPresetId',
        readFields: () => ({ opening: text }), fillFields: fields => { text = fields.opening; },
    });
    try {
        const save = root.querySelector('[data-preset-action="save"]');
        text = 'first';
        save.click();
        text = 'first and second';
        firstSave.resolve();
        await nextTurn();
        assert.equal(saved.promptPresets[0].opening, 'first');
        assert.equal(text, 'first and second');
        assert.equal(list.isDirty(), true);
        pending = undefined;
        save.click();
        await nextTurn();
        assert.equal(saved.promptPresets[0].opening, 'first and second');
        assert.equal(list.isDirty(), false);
    } finally { list.destroy(); }
});

test('parameter presets save drafts, survive failed writes, switch and delete safely', async () => {
    const { window, document } = parseHTML(PAGE);
    const provider = 'gemini';
    let persisted;
    let failure = false;
    let name = 'Portrait';
    window.prompt = () => name;
    window.confirm = () => true;
    const settings = createSettingsRepository(() => ({ getStrict: async () => null, setAndSave: async (_key, value) => {
        if (failure) throw Error('unavailable');
        persisted = value;
    } }));
    const root = document.querySelector('[data-presets="params"]');
    const input = document.querySelector('[name="positivePrefix"]');
    let fields;
    const bar = bindSettingsPresetList({ root, label: 'Parameters', getState: () => settings.get(provider),
        persist: mutator => settings.update(provider, mutator), listKey: 'paramsPresets', selectionKey: 'selectedParamsPresetId',
        readFields: () => ({ ...fields, positivePrefix: input.value }),
        fillFields: value => { fields = value; input.value = value.positivePrefix; },
    });
    const action = async action => { root.querySelector(`[data-preset-action="${action}"]`).click(); await nextTurn(); };
    const selectPreset = async id => {
        root.querySelector(`.preset-row[data-preset-id="${id}"]`).click();
        await nextTurn();
    };
    input.value = 'Watercolor';
    assert.equal(bar.isDirty(), true);
    await action('add');
    const portrait = persisted.selectedParamsPresetId;
    assert.notEqual(portrait, 'default');
    assert.equal(persisted.paramsPresets[1].positivePrefix, 'Watercolor');
    input.value = 'Unsaved';
    failure = true;
    await action('save');
    assert.equal(input.value, 'Unsaved');
    assert.equal(persisted.paramsPresets[1].positivePrefix, 'Watercolor');
    assert.ok(root.querySelector('[role="status"]').classList.contains('error'));
    failure = false;
    name = 'Illustration';
    const renameInput = root.querySelector('[aria-current="true"] input');
    renameInput.dispatchEvent(new window.Event('focusin', { bubbles: true }));
    renameInput.value = name;
    renameInput.dispatchEvent(new window.Event('change', { bubbles: true }));
    renameInput.dispatchEvent(new window.Event('focusout', { bubbles: true }));
    await nextTurn();
    assert.equal(persisted.paramsPresets[1].name, name);
    assert.equal(input.value, 'Unsaved');
    await selectPreset('default');
    assert.equal(persisted.selectedParamsPresetId, 'default');
    assert.equal(input.value, '');
    await selectPreset(portrait);
    assert.equal(input.value, 'Watercolor');
    root.querySelector(`[data-preset-action="delete"][data-preset-id="${portrait}"]`).click();
    await nextTurn();
    assert.deepEqual(persisted.paramsPresets.map(item => item.id), ['default']);
    assert.equal(persisted.selectedParamsPresetId, 'default');
    bar.destroy();
});

test('uploaded references reach only the current test request; removed and closed references do not leak', async () => {
    const { window, document } = parseHTML(PAGE);
    window.HTMLElement.prototype.scrollIntoView = () => {};
    const provider = 'openai';
    const settings = createDefaultSettings(provider);
    const image = new Blob([Uint8Array.from(atob(IMAGE), character => character.charCodeAt(0))], { type: 'image/png' });
    const inputs = [];
    let finish;
    const binding = bindTestView({ document, provider, getSettings: () => settings, report: () => {},
        readBlob: async blob => `data:${blob.type};base64,${IMAGE}`,
        loadRuntime: async () => ({ generateTestImage: (id, input) => {
            assert.equal(id, provider);
            inputs.push(input);
            return new Promise(resolve => { finish = resolve; });
        } }),
    });
    const $ = id => document.getElementById(id);
    const upload = async files => {
        $('mm-reference-files').files = files;
        $('mm-reference-files').dispatchEvent(new window.Event('change'));
        await nextTurn();
    };
    await upload([new Blob(['fake'], { type: 'text/html' }), image]);
    assert.equal($('mm-references').children.length, 0);
    await upload([image, image]);
    assert.equal($('mm-references').children.length, 2);
    $('mm-references').querySelector('button').click();
    $('mm-prompt').value = 'Retain the frame';
    $('mm-generate').click();
    await nextTurn();
    assert.deepEqual(inputs[0].referenceImages, [{ mimeType: 'image/png', data: IMAGE }]);
    assert.equal(inputs[0].prompt, 'Retain the frame');
    assert.equal(Object.hasOwn(inputs[0].settings, 'referenceImages'), false);
    $('mm-cancel').click();
    assert.equal(inputs[0].signal.aborted, true);
    finish({ images: [image] });
    await nextTurn();
    assert.equal($('mm-test-results').children.length, 1);
    $('mm-test-results').querySelector('button').click();
    await nextTurn();
    assert.equal($('mm-references').children.length, 2);
    binding.destroy();
    assert.equal($('mm-references').children.length, 0);
    assert.equal($('mm-test-results').children.length, 0);
});
