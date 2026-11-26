import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { normalizeAgentConfig } from '../config.js';
import { PROVIDER_OPTIONS, resolveActiveProviderConfig } from '../provider-resolution.js';
import { createAgentSettingsPanel } from '../ui/settings-panel.js';
import { buildAgentSettingsPanelMarkup } from '../ui/settings-markup.js';

// Acceptance (lost configuration / wrong model or credentials):
// - Changing only provider never changes ANY saved field, for main or delegate,
//   including empty values and options hidden by the current channel.
// - Edits in any channel update that preset, survive save/reload and never change
//   another preset or the other role. A failed save keeps the editable draft.
const preset = name => ({
    provider: 'openai-compatible', baseUrl: `https://${name}.invalid/v1`, apiKey: `${name}-key`, model: `${name}-alias`,
    temperature: 0, maxTokens: 1200, sendTemperature: false, toolMode: 'native', modelListAuth: 'bearer',
    reasoning: { mode: 'on', effort: 'xhigh', budgetTokens: 4096 },
    sampling: { topP: { enabled: true, value: 0.7 }, topK: { enabled: false, value: 8 } },
    vertex: { authMode: 'relay', projectId: 'saved-project', location: 'us-central1', serviceAccountJson: 'saved-json', streamFunctionCallArguments: false },
});

function fixture(t, overrides = {}, savedOk = true, markupOptions = {}) {
    const { document, window } = parseHTML(`<html><body>${buildAgentSettingsPanelMarkup(markupOptions)}</body></html>`);
    const prototype = window.HTMLSelectElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
    Object.defineProperty(prototype, 'value', { configurable: true,
        get() { return this.querySelector('option[selected]')?.value || ''; },
        set(value) { this.querySelectorAll('option').forEach(option => option.toggleAttribute('selected', option.value === String(value))); },
    });
    const globals = { document: globalThis.document, window: globalThis.window };
    Object.assign(globalThis, { document, window });
    let stored = normalizeAgentConfig({ currentPresetName: 'A', presets: {
        A: { ...preset('a'), ...overrides }, B: preset('b'),
    }, delegateConfigured: true, delegateConfig: { ...preset('delegate'), ...overrides } });
    const original = structuredClone(stored);
    const state = { config: stored };
    let submitted;
    const panel = createAgentSettingsPanel({ state, render: () => panel.syncConfigToForm(document.body),
        saveConfig: ({ payload }) => {
            submitted = structuredClone(payload);
            if (savedOk) stored = normalizeAgentConfig(JSON.parse(JSON.stringify(payload)));
            return { ok: savedOk, config: stored };
        } });
    panel.syncConfigToForm(document.body); panel.bindSettingsPanelEvents(document.body);
    t.after(() => { panel.destroy(); Object.defineProperty(prototype, 'value', descriptor); Object.assign(globalThis, globals); });
    const field = (scope, name) => document.getElementById(`xb-assistant-${scope === 'delegate' ? 'delegate-' : ''}${name}`);
    return { state, original, panel, stored: () => stored, submitted: () => submitted,
        edit(scope, name, value) {
            const input = field(scope, name); input.value = value;
            input.dispatchEvent(new window.Event(input.tagName === 'SELECT' ? 'change' : 'input'));
        },
        save(scope) { field(scope, 'save').dispatchEvent(new window.Event('click')); },
        reload() { state.config = stored; state.configDraft = null; panel.syncConfigToForm(document.body); },
        toggle(scope, name, checked) {
            const input = field(scope, name); input.checked = checked;
            input.dispatchEvent(new window.Event('change'));
        },
        field,
    };
}

// Image input belongs to each preset: the Assistant edits it per role, and surfaces
// without the control must keep whatever the preset already stores.
for (const scope of ['main', 'delegate']) {
    test(`${scope}: a running recipient keeps its last permission when the form switches routes`, t => {
        const h = fixture(t, {}, true, { showImageInput: true });
        const a = h.panel.bindImageInput({ role: scope });
        h.toggle(scope, 'model-image-input', false);
        if (scope === 'delegate') h.edit(scope, 'preset-select', 'B');
        else h.edit(scope, 'base-url', 'https://b.invalid/v1');
        h.toggle(scope, 'model-image-input', true);
        const b = h.panel.bindImageInput({ role: scope });
        assert.equal(a.enabled(), false);
        assert.equal(b.enabled(), true);
        b.release(); a.release();
    });
    test(`${scope}: image input defaults on and persists per role`, t => {
        const h = fixture(t, {}, true, { showImageInput: true });
        const other = scope === 'main' ? 'delegate' : 'main';
        assert.equal(h.field(scope, 'model-image-input').checked, true);
        assert.equal(h.panel.isImageInputEnabled({ role: scope }), true);
        h.toggle(scope, 'model-image-input', false);
        assert.equal(h.panel.isImageInputEnabled({ role: scope }), false);
        assert.equal(h.panel.isImageInputEnabled({ role: other }), true);
        h.save(scope);
        const saved = config => scope === 'main' ? config.presets.A : config.delegateConfig;
        assert.equal(saved(h.stored()).imageInput, false);
        assert.equal((scope === 'main' ? h.stored().delegateConfig : h.stored().presets.A).imageInput, true);
        h.reload();
        assert.equal(h.field(scope, 'model-image-input').checked, false);
        assert.equal(h.panel.isImageInputEnabled({ role: scope }), false);
    });
    test(`${scope}: surfaces without the image input control keep the stored value`, t => {
        const saved = config => scope === 'main' ? config.presets.A : config.delegateConfig;
        const plain = fixture(t, { imageInput: false });
        assert.equal(plain.field(scope, 'model-image-input'), null);
        plain.edit(scope, 'model', 'edited-alias');
        plain.save(scope);
        assert.equal(saved(plain.stored()).imageInput, false);
    });
}

for (const scope of ['main', 'delegate']) {
    for (const empty of [false, true]) {
        test(`${scope}: repeated provider switches preserve all ${empty ? 'empty' : 'populated'} fields`, t => {
            const h = fixture(t, empty ? { baseUrl: '', apiKey: '', model: '', reasoning: {} } : {});
            const initial = scope === 'main' ? h.original.presets.A : h.original.delegateConfig;
            const fields = { ...initial };
            delete fields.provider;
            for (const provider of [...PROVIDER_OPTIONS, ...PROVIDER_OPTIONS.toReversed()]) {
                h.edit(scope, 'provider', provider.value);
                h.save(scope);
                const saved = scope === 'main' ? h.stored().presets.A : h.stored().delegateConfig;
                assert.deepEqual(saved, { provider: provider.value, ...fields });
                assert.deepEqual(h.stored().presets.B, h.original.presets.B);
            }
            h.reload();
            h.save(scope);
            assert.deepEqual(scope === 'main' ? h.stored().presets.A : h.stored().delegateConfig,
                { ...fields, provider: PROVIDER_OPTIONS[0].value });
        });
    }
    for (const ok of [true, false]) {
        test(`${scope}: Vertex edits are the preset's values, including after a ${ok ? 'successful' : 'failed'} save`, t => {
            const h = fixture(t, {}, ok);
            h.edit(scope, 'provider', 'google-vertex');
            h.edit(scope, 'base-url', 'https://edited.invalid');
            h.edit(scope, 'api-key', 'edited-key');
            h.edit(scope, 'model', 'edited-alias');
            h.save(scope);
            h.edit(scope, 'provider', 'anthropic');
            h.save(scope);
            const submitted = scope === 'main' ? h.submitted().presets.A : h.submitted().delegateConfig;
            assert.equal(submitted.baseUrl, 'https://edited.invalid');
            assert.equal(submitted.apiKey, 'edited-key');
            assert.equal(submitted.model, 'edited-alias');
            const other = scope === 'main' ? h.submitted().delegateConfig : h.submitted().presets.A;
            assert.deepEqual(other, scope === 'main' ? h.original.delegateConfig : h.original.presets.A);
            const runtime = resolveActiveProviderConfig(h.submitted(), { role: scope });
            assert.equal(runtime.apiKey, 'edited-key');
            assert.equal(runtime.model, 'edited-alias');
        });
    }
}
