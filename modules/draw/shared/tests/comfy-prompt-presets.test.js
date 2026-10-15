import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { parseHTML } from 'linkedom';
import { buildProviderFixture } from './fixtures/provider-runtime-fixture.mjs';

const source = await buildProviderFixture('comfyui', { settingsPanel: true });
// Only host I/O is replaced; production form handlers, presets and request builder run unchanged.
// eslint-disable-next-line no-unsanitized/method -- Locally built production test bundle.
const api = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const html = await readFile(new URL('../../providers/comfyui/comfy-draw.html', import.meta.url), 'utf8');
const fieldPath = 'images[].post_prompt';

async function until(predicate) {
    for (let i = 0; i < 100; i++) {
        if (await predicate()) return;
        await new Promise(resolve => setTimeout(resolve, 5));
    }
    assert.fail('Panel operation did not settle');
}

function setup() {
    const { document, window } = parseHTML(html);
    // linkedom exposes select.value as read-only, unlike a browser.
    for (const select of document.querySelectorAll('select')) Object.defineProperty(select, 'value', {
        configurable: true, get() { return this.querySelector('option[selected]')?.value || this.querySelector('option')?.value || ''; },
        set(value) { for (const option of this.querySelectorAll('option')) option.toggleAttribute('selected', option.value === value); },
    });
    const notices = [], saves = [];
    Object.assign(globalThis, { document, window, requestAnimationFrame: () => 1, cancelAnimationFrame() {},
        confirm: () => true, toastr: Object.fromEntries(['error', 'warning', 'info', 'success'].map(k => [k, (...args) => notices.push([k, ...args])])),
        __review: { ctx: { chat: [] }, events: new Map(), states: [], saveSettings: async (_key, value) => { saves.push(value); return true; } },
    });
    api.configureFixtureSettings({ promptTemplateVersion: 11, promptPresets: [
        { id: 'a', name: 'A', topSystem: '', tagGuideContent: '', sceneRules: '', fieldDescriptions: '' },
        { id: 'b', name: 'B', topSystem: '', tagGuideContent: '', sceneRules: '', fieldDescriptions: JSON.stringify({ [fieldPath]: 'B instruction' }) },
    ], selectedPromptPresetId: 'a' });
    document.getElementById('comfy-prompt-chain').closest('details').open = true;
    // Preserve the browser's stable Event.target across the asynchronous file read.
    const fileInput = document.getElementById('comfy-prompt-preset-import');
    const listen = fileInput.addEventListener.bind(fileInput);
    fileInput.addEventListener = (type, handler) => listen(type, event => handler({ target: event.target }));
    api.mountFixtureSettings({ contentDocument: document });
    const element = id => document.getElementById(id);
    const field = () => document.querySelector(`textarea[data-path="${fieldPath}"]`);
    const edit = value => { field().value = value; field().dispatchEvent(new window.Event('input')); };
    const click = id => element(id).click();
    const save = async () => {
        click('comfy-prompts-save');
        await until(() => !element('comfy-prompts-save').disabled);
    };
    const select = async id => {
        element('comfy-prompt-preset-select').value = id;
        element('comfy-prompt-preset-select').dispatchEvent(new window.Event('change'));
        await until(() => field().value === (id === 'b' ? 'B instruction' : 'A instruction'));
    };
    const importPreset = async payload => {
        const input = element('comfy-prompt-preset-import');
        Object.defineProperty(input, 'files', { configurable: true, value: [{ name: 'import.json', text: async () => JSON.stringify(payload) }] });
        input.value = 'import.json';
        input.dispatchEvent(new window.Event('change'));
        await until(() => input.value === '');
    };
    return { document, window, notices, saves, element, field, edit, click, save, select, importPreset };
}

test('ComfyUI edited field descriptions survive save, preset switching and reach only request descriptions', async () => {
    const h = setup();
    const defaultDescription = h.field().value;
    h.edit('A instruction');
    await h.save();
    assert.equal(JSON.parse(h.saves.at(-1).customPrompts.fieldDescriptions)[fieldPath], 'A instruction');
    await h.select('b');
    await h.select('a');
    const prepared = await api.prepareScenePlannerInput({ messageText: 'Alice walks outside.', plannerProfile: api.COMFY_PLANNER_PROFILE,
        customPrompts: api.getSettings().customPrompts, expansionOptions: { runtime: { substituteParams: text => text } },
        agentCaller: async () => {}, agentOptions: { providerConfig: { provider: 'openai-compatible', model: 'fixture' } } });
    let requests = 0;
    const tasks = await api.executePreparedScenePlanner(prepared, { agentCaller: async ({ task }) => {
        requests++;
        const image = task.tools[0].function.parameters.properties.images.items;
        assert.equal(image.properties.post_prompt.description, 'A instruction');
        assert.equal(image.properties.post_prompt.type, 'string');
        assert.equal(image.required.includes('post_prompt'), false);
        assert.equal(task.toolChoice, 'required');
        return { result: { toolCalls: [{ name: task.tools[0].function.name, arguments: JSON.stringify({
            images: [{ index: 1, insert_after: 1, scene: 'garden', characters: [], post_prompt: 'sunlight' }],
        }) }] } };
    } });
    assert.equal(requests, 1);
    assert.equal(tasks[0].post_prompt, 'sunlight');
    h.field().parentElement.querySelector('button').click();
    assert.equal(h.field().value, defaultDescription);
    await h.save();
    assert.equal(api.getSettings().customPrompts.fieldDescriptions, '');
});

test('saving another setting or completing an older save cannot discard a newer description draft', async () => {
    const h = setup();
    h.edit('unsaved draft');
    h.element('comfy-show-floor').dispatchEvent(new h.window.Event('change'));
    await until(() => h.saves.length === 1);
    // Let the event handler finish its form refresh, not just storage.
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal(h.field().value, 'unsaved draft');
    const barrier = Promise.withResolvers();
    globalThis.__review.saveSettings = async (_key, value) => { await barrier.promise; h.saves.push(value); return true; };
    const saving = h.save();
    h.edit('newer draft');
    barrier.resolve(); await saving;
    assert.equal(h.field().value, 'newer draft');
    await h.save();
    assert.equal(JSON.parse(api.getSettings().customPrompts.fieldDescriptions)[fieldPath], 'newer draft');
});

test('prompt template import/export preserves descriptions without replacing existing presets', async t => {
    const h = setup();
    let blob;
    t.mock.method(URL, 'createObjectURL', value => { blob = value; return 'blob:fixture'; });
    t.mock.method(URL, 'revokeObjectURL', () => {});
    h.edit('exported draft');
    h.click('comfy-prompt-preset-export');
    const exported = JSON.parse(await blob.text());
    assert.equal(JSON.parse(exported.fieldDescriptions)[fieldPath], 'exported draft');
    const previous = structuredClone(api.getSettings().promptPresets);
    await h.importPreset(exported);
    assert.deepEqual(api.getSettings().promptPresets.slice(0, 2), previous);
    assert.equal(api.getSettings().promptPresets.length, 3);
    assert.equal(h.field().value, 'exported draft');
    h.click('comfy-prompts-reset-all');
    await h.save();
    assert.equal(api.getSettings().customPrompts.fieldDescriptions, '');
});

test('invalid imported field descriptions report failure without saving or replacing presets', async () => {
    const h = setup();
    const previous = structuredClone(api.getSettings().promptPresets);
    for (const fieldDescriptions of ['{bad', '[]', 'null', '{"images[].scene":42}', {}]) {
        const before = h.notices.length;
        await h.importPreset({ _type: 'comfy-draw-prompt-template', _version: 1, name: 'Invalid',
            topSystem: '', tagGuideContent: '', sceneRules: '', fieldDescriptions });
        assert.equal(h.notices.length, before + 1);
        assert.equal(h.notices.at(-1)[0], 'error');
        assert.deepEqual(api.getSettings().promptPresets, previous);
        assert.equal(h.saves.length, 0);
    }
});

test('a failed preset save retains the draft for retry without changing the saved description', async () => {
    const h = setup();
    h.edit('retryable draft');
    const save = globalThis.__review.saveSettings;
    globalThis.__review.saveSettings = async () => false;
    await h.save();
    assert.equal(h.field().value, 'retryable draft');
    assert.equal(api.getSettings().customPrompts.fieldDescriptions, '');
    globalThis.__review.saveSettings = save;
    await h.save();
    assert.equal(JSON.parse(api.getSettings().customPrompts.fieldDescriptions)[fieldPath], 'retryable draft');
});
