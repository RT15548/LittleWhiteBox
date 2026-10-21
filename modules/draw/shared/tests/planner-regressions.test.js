import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { OpenAICompatibleAdapter } from '../../../agent-core/adapters/openai-compatible.js';
import { createDefaultLayout, addBlock, createCustomBlock } from '../scene-planner-layout.js';
import { createPromptLayoutEditor } from '../prompt-layout-editor.js';
import { callDrawScenePlannerAgentRuntime, getDrawAgentDiagnosticHistory, resetDrawAgentRuntimeForTests } from '../draw-agent-runtime.js';
import { createSubmitScenePlanTool } from '../scene-plan-tool.js';
import { createDrawAgentSettingsSurface } from '../agent-settings-surface.js';

// Acceptance contracts:
// Provider errors/refusals must not retain echoed credentials in diagnostics (credential disclosure).
// Undo belongs to one preset, even when host selection changes (overwriting another preset).
// Preset-row saves and background refreshes preserve newer form edits on every outcome (lost edits).

for (const refused of [false, true]) {
    test(`provider ${refused ? 'refusal' : 'error body'} diagnostics exclude echoed API credentials`, async () => {
        resetDrawAgentRuntimeForTests();
        const fakeKey = 'sk-regression-NOT-A-REAL-KEY';
        const providerConfig = { provider: 'openai-compatible', baseUrl: 'https://invalid.example/v1', model: 'stub', apiKey: fakeKey, toolMode: 'tagged-json' };
        const invoke = () => callDrawScenePlannerAgentRuntime({
            providerConfig,
            task: { systemPrompt: 'Plan', messages: [{ role: 'user', content: 'A book' }], tools: [createSubmitScenePlanTool()] },
            agentCore: { createAgentAdapter(config) {
                const adapter = new OpenAICompatibleAdapter(config);
                adapter.client.chat.completions.create = async () => refused
                    ? { choices: [{ finish_reason: 'stop', message: { content: '', refusal: `Rejected ${fakeKey}` } }] }
                    : { error: { message: `Incorrect API key: ${fakeKey}` } };
                return adapter;
            } },
        });
        if (refused) await assert.rejects(invoke);
        else {
            const { result } = await invoke();
            assert.equal(result.responseInfo.hasError, true);
            assert.equal(result.responseInfo.choiceCount, 0);
        }
        const history = getDrawAgentDiagnosticHistory();
        assert.ok(history.length > 0);
        assert.equal(JSON.stringify(history).includes(fakeKey), false);
        assert.match(JSON.stringify(history), refused ? /"refused":true/ : /"hasError":true/);
    });
}

for (const renderAfterSwitch of [false, true]) {
    test(`undo cannot cross preset ownership, host render=${renderAfterSwitch}`, (t) => {
        const { document } = parseHTML('<html><body><div id="editor"></div></body></html>');
        const blockA = createCustomBlock({ content: 'A' }, [], () => 0.1);
        const blockB = createCustomBlock({ content: 'B' }, [], () => 0.2);
        const layouts = { A: addBlock(createDefaultLayout(), blockA), B: addBlock(createDefaultLayout(), blockB) };
        let selected = 'A';
        const container = document.getElementById('editor');
        const editor = createPromptLayoutEditor({ document, container, getOwnerKey: () => selected, getLayout: () => layouts[selected], onChange: next => { layouts[selected] = next; }, confirm: () => true });
        t.after(() => editor.destroy());
        editor.render();
        const click = selector => container.querySelector(selector).dispatchEvent(new document.defaultView.Event('click', { bubbles: true }));
        click(`[data-block-id="${blockA.id}"] [data-ple-field="main"]`);
        click(`[data-block-id="${blockA.id}"] [data-ple-field="delete"]`);
        assert.equal(layouts.A.blocks.some(block => block.id === blockA.id), false);
        const expectedB = structuredClone(layouts.B);
        selected = 'B';
        if (renderAfterSwitch) editor.render();
        click('[data-ple-undo]');
        assert.deepEqual(layouts.B, expectedB);
    });
}

for (const outcome of ['success', 'error', 'throw']) {
    test(`preset row save preserves edits and background refresh on ${outcome}`, async (t) => {
        const { document, window } = parseHTML('<html><body><div id="agent-root"></div></body></html>');
        const selectPrototype = window.HTMLSelectElement.prototype;
        const originalValue = Object.getOwnPropertyDescriptor(selectPrototype, 'value');
        Object.defineProperty(selectPrototype, 'value', {
            configurable: true,
            get() { return this.querySelector('option[selected]')?.value || ''; },
            set(value) { this.querySelectorAll('option').forEach(option => option.toggleAttribute('selected', option.value === String(value))); },
        });
        const originals = Object.fromEntries(['document', 'window', 'CustomEvent'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
        Object.assign(globalThis, { document, window, CustomEvent: window.CustomEvent });
        let stored = { currentPresetName: 'A', presets: { A: { provider: 'openai-compatible', modelConfigs: { 'openai-compatible': { model: 'saved-model' } } } } };
        let finishSave;
        let finishRefresh;
        let loads = 0;
        const root = document.getElementById('agent-root');
        const surface = createDrawAgentSettingsSurface({
            getRoot: () => root,
            loadSettings: async () => {
                loads += 1;
                if (loads === 2) return new Promise(resolve => { finishRefresh = () => resolve(stored); });
                return stored;
            },
            saveSettings: patch => new Promise((resolve, reject) => {
                finishSave = () => {
                    if (outcome === 'throw') reject(new Error('save failed'));
                    else if (outcome === 'error') resolve({ ok: false, error: 'save failed' });
                    else { stored = patch; resolve({ ok: true, config: patch }); }
                };
            }),
        });
        t.after(() => {
            surface.destroy();
            Object.defineProperty(selectPrototype, 'value', originalValue);
            for (const [key, descriptor] of Object.entries(originals)) {
                if (descriptor) Object.defineProperty(globalThis, key, descriptor);
                else delete globalThis[key];
            }
        });
        await surface.refresh();
        const pendingRefresh = surface.refresh({ background: true });
        root.querySelector('[data-preset-action="duplicate"]').dispatchEvent(new window.Event('click', { bubbles: true }));
        assert.equal(surface.getState().configSave.status, 'saving');
        await surface.refresh({ background: true });
        assert.equal(loads, 2);
        const input = root.querySelector('#xb-assistant-model');
        input.value = 'newer-model';
        input.dispatchEvent(new window.Event('input', { bubbles: true }));
        finishRefresh();
        await pendingRefresh;
        assert.equal(surface.getState().configDirty, true);
        finishSave();
        await new Promise(resolve => setTimeout(resolve, 0));
        assert.equal(surface.getState().configSave.status, outcome === 'success' ? 'success' : 'error');
        assert.equal(surface.getState().configDirty, true);
        await surface.refresh({ background: true });
        assert.equal(loads, 2);
        assert.equal(root.querySelector('#xb-assistant-model').value, 'newer-model');
        assert.equal(surface.getState().configDraft.model, 'newer-model');
    });
}
