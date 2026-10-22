import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { OpenAICompatibleAdapter } from '../../../agent-core/adapters/openai-compatible.js';
import { createDefaultLayout, addBlock, createCustomBlock } from '../scene-planner-layout.js';
import { createPromptLayoutEditor } from '../prompt-layout-editor.js';
import { callDrawScenePlannerAgentRuntime, getDrawAgentDiagnosticHistory, resetDrawAgentRuntimeForTests } from '../draw-agent-runtime.js';
import { createSubmitScenePlanTool } from '../scene-plan-tool.js';
import { createDrawAgentSettingsSurface } from '../agent-settings-surface.js';
import { DEFAULT_TOOL_CODE } from '../custom-tools.js';

// Acceptance contracts:
// Provider errors/refusals must not retain echoed credentials in diagnostics (credential disclosure).
// Undo belongs to one preset, even when host selection changes (overwriting another preset).
// Preset-row saves and background refreshes preserve newer form edits on every outcome (lost edits).
// Tool drafts belong to their preset, even when imported messages share an id (wrong executable code).

test('tool drafts cannot cross preset ownership with the same block id', t => {
    const { document } = parseHTML('<html><body><div id="editor"></div></body></html>');
    const block = createCustomBlock({ content: 'tool', tool: { code: 'return { name: "private_a", action() {} };' } });
    const layouts = { A: addBlock(createDefaultLayout(), block), B: addBlock(createDefaultLayout(), { ...block, tool: undefined }) };
    let owner = 'A';
    const container = document.getElementById('editor');
    const editor = createPromptLayoutEditor({ document, container, getOwnerKey: () => owner, getLayout: () => layouts[owner], onChange: next => { layouts[owner] = next; } });
    t.after(() => editor.destroy());
    const toggle = checked => {
        container.querySelector(`[data-block-id="${block.id}"] [data-ple-field="main"]`).dispatchEvent(new document.defaultView.Event('click', { bubbles: true }));
        const node = container.querySelector('[data-ple-field="tool-toggle"]');
        node.checked = checked;
        node.dispatchEvent(new document.defaultView.Event('change', { bubbles: true }));
    };
    editor.render();
    toggle(false);
    owner = 'B';
    editor.render();
    toggle(true);
    assert.equal(layouts.B.blocks.find(item => item.id === block.id).tool.code, DEFAULT_TOOL_CODE);
    owner = 'A';
    editor.render();
    toggle(true);
    assert.equal(layouts.A.blocks.find(item => item.id === block.id).tool.code, block.tool.code);
});

test('provider refusal reason and redacted request survive in draw history', async () => {
    resetDrawAgentRuntimeForTests();
    const providerConfig = { provider: 'openai-compatible', baseUrl: 'https://invalid.example/v1', model: 'stub', apiKey: 'secret-fixture', toolMode: 'native' };
    await assert.rejects(callDrawScenePlannerAgentRuntime({
        providerConfig,
        task: { messages: [{ role: 'user', content: 'A book' }], tools: [createSubmitScenePlanTool()] },
        agentCore: { createAgentAdapter(config) {
            const adapter = new OpenAICompatibleAdapter(config);
            adapter.client.chat.completions.create = async () => ({ choices: [{ finish_reason: 'content_filter', message: { content: '' } }] });
            return adapter;
        } },
    }), { code: 'PROVIDER_REQUEST_FAILED' });
    const [record] = getDrawAgentDiagnosticHistory();
    assert.equal(record.blockReason, 'content_filter');
    assert.equal(record.attempts[0].blockReason, 'content_filter');
    assert.ok(record.request);
    assert.equal(JSON.stringify(record).includes('secret-fixture'), false);
});

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
    test(`API preset save preserves submitted edits and rejects stale background refresh on ${outcome}`, async (t) => {
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
        const input = root.querySelector('#xb-assistant-model');
        input.value = 'newer-model';
        input.dispatchEvent(new window.Event('input', { bubbles: true }));
        root.querySelector('#xb-assistant-save').dispatchEvent(new window.Event('click', { bubbles: true }));
        assert.equal(surface.getState().configSave.status, 'saving');
        await surface.refresh({ background: true });
        assert.equal(loads, 2);
        finishRefresh();
        await pendingRefresh;
        assert.equal(surface.getState().configDirty, true);
        finishSave();
        await new Promise(resolve => setTimeout(resolve, 0));
        assert.equal(surface.getState().configSave.status, outcome === 'success' ? 'success' : 'error');
        assert.equal(surface.getState().configDirty, outcome !== 'success');
        if (outcome !== 'success') {
            await surface.refresh({ background: true });
            assert.equal(loads, 2);
        } else {
            assert.equal(stored.presets.A.modelConfigs['openai-compatible'].model, 'newer-model');
        }
        assert.equal(root.querySelector('#xb-assistant-model').value, 'newer-model');
        assert.equal(surface.getState().configDraft.model, 'newer-model');
    });
}
