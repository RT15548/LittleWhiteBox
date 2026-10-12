import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';

import { normalizeAgentConfig } from '../../agent-core/config.js';
import { createAgentSettingsPanel } from '../../agent-core/ui/settings-panel.js';
import { buildAgentSettingsPanelMarkup } from '../../agent-core/ui/settings-markup.js';
import { loadSharedAgentSettings, saveSharedAgentSettings } from '../../agent-core/settings-repository.js';
import { resolveActiveProviderConfig } from '../../agent-core/provider-resolution.js';

test('shared main and delegate forms can clear stored keys and reload without restoring them', async () => {
    const dom = installDom();
    const root = dom.document.querySelector('#root');
    const preset = { provider: 'openai-compatible', modelConfigs: { 'openai-compatible': { apiKey: 'old-key' } } };
    let persisted = normalizeAgentConfig({ currentPresetName: 'test', presets: { test: preset, other: preset }, delegateConfig: preset, delegateConfigured: true });
    const storage = { getStrict: async () => structuredClone(persisted),
        async setAndSave(_key, value) { persisted = structuredClone(value); return true; } };
    const state = createPanelState(persisted);
    const { document } = parseHTML(`<html><body>${buildAgentSettingsPanelMarkup()}</body></html>`);
    root.replaceChildren(...document.body.childNodes);
    let saving;
    const panel = createAgentSettingsPanel({ state,
        saveConfig: request => { saving = saveSharedAgentSettings(request.payload, { storage }); },
    });
    try {
        panel.syncConfigToForm(root);
        panel.bindSettingsPanelEvents(root);
        for (const id of ['#xb-assistant-api-key', '#xb-assistant-delegate-api-key']) {
            assert.equal(root.querySelector(id).value, 'old-key');
            root.querySelector(id).value = '';
        }
        root.querySelector('#xb-assistant-save').click();
        assert.equal((await saving).ok, true);
        const loaded = await loadSharedAgentSettings({ storage });
        assert.equal(loaded.presets.other.modelConfigs['openai-compatible'].apiKey, 'old-key');
        for (const role of ['main', 'delegate']) assert.equal(resolveActiveProviderConfig(loaded, { role }).apiKey, '');
        state.config = normalizeAgentConfig(loaded);
        state.configDraft = null;
        state.configFormSyncPending = true;
        panel.syncConfigToForm(root);
        assert.equal(root.querySelector('#xb-assistant-api-key').value, '');
        assert.equal(root.querySelector('#xb-assistant-delegate-api-key').value, '');
        for (const [selectId, inputId] of [
            ['#xb-assistant-preset-select', '#xb-assistant-api-key'],
            ['#xb-assistant-delegate-preset-select', '#xb-assistant-delegate-api-key'],
        ]) {
            for (const [name, expectedKey] of [['other', 'old-key'], ['test', '']]) {
                const select = root.querySelector(selectId);
                select.value = name;
                select.dispatchEvent(new dom.document.defaultView.Event('change'));
                panel.syncConfigToForm(root);
                assert.equal(root.querySelector(inputId).value, expectedKey, `${selectId}: ${name}`);
            }
        }
    } finally { dom.restore(); }
});

function createPanelState(config) {
    return {
        config,
        configDraft: null,
        configDirty: false,
        configFormSyncPending: true,
        configPage: 'main',
        configSave: { status: 'idle', requestId: '', error: '' },
        modelOptionsByProvider: {},
        pullStateByProvider: {},
    };
}

test('Claude model-list auth stays independent across channels, presets and main/delegate saves', async () => {
    const dom = installDom();
    const root = dom.document.querySelector('#root');
    const main = { provider: 'anthropic', modelConfigs: { anthropic: { apiKey: 'main-key' } } };
    const delegate = { provider: 'sillytavern-claude', modelConfigs: { 'sillytavern-claude': { apiKey: 'delegate-key', modelListAuth: 'bearer' } } };
    let persisted = normalizeAgentConfig({ currentPresetName: 'main', presets: { main, other: main }, delegateConfig: delegate, delegateConfigured: true });
    const storage = { getStrict: async () => structuredClone(persisted),
        async setAndSave(_key, value) { persisted = structuredClone(value); return true; } };
    const state = createPanelState(persisted);
    const { document } = parseHTML(`<html><body>${buildAgentSettingsPanelMarkup()}</body></html>`);
    root.replaceChildren(...document.body.childNodes);
    let saving;
    const pulls = [];
    const panel = createAgentSettingsPanel({ state,
        saveConfig: request => { saving = saveSharedAgentSettings(request.payload, { storage }); },
        pullModels: async config => { pulls.push(config); return ['test-model']; },
    });
    const change = (id, value) => {
        const select = root.querySelector(id);
        select.value = value;
        select.dispatchEvent(new dom.document.defaultView.Event('change'));
        panel.syncConfigToForm(root);
    };
    try {
        panel.syncConfigToForm(root);
        panel.bindSettingsPanelEvents(root);
        assert.equal(root.querySelector('#xb-assistant-model-list-auth').value, 'x-api-key');
        assert.equal(root.querySelector('#xb-assistant-delegate-model-list-auth').value, 'bearer');
        change('#xb-assistant-model-list-auth', 'bearer');
        change('#xb-assistant-delegate-model-list-auth', 'x-api-key');
        for (const [prefix, provider, expected] of [
            ['#xb-assistant', 'anthropic', 'bearer'],
            ['#xb-assistant-delegate', 'sillytavern-claude', 'x-api-key'],
        ]) {
            change(`${prefix}-provider`, 'google');
            assert.equal(root.querySelector(`${prefix}-model-list-auth-wrap`).style.display, 'none');
            change(`${prefix}-provider`, provider);
            assert.equal(root.querySelector(`${prefix}-model-list-auth-wrap`).style.display, '');
            assert.equal(root.querySelector(`${prefix}-model-list-auth`).value, expected);
            root.querySelector(`${prefix}-pull-models`).click();
            await flushTasks();
            assert.equal(pulls.at(-1).modelListAuth, expected);
        }
        root.querySelector('#xb-assistant-save').click();
        assert.equal((await saving).ok, true);
        const loaded = await loadSharedAgentSettings({ storage });
        assert.equal(resolveActiveProviderConfig(loaded).modelListAuth, 'bearer');
        assert.equal(resolveActiveProviderConfig(loaded, { role: 'delegate' }).modelListAuth, 'x-api-key');
        state.config = normalizeAgentConfig(loaded);
        state.configDraft = null;
        panel.syncConfigToForm(root);
        for (const [preset, expected] of [['other', 'x-api-key'], ['main', 'bearer']]) {
            change('#xb-assistant-preset-select', preset);
            assert.equal(root.querySelector('#xb-assistant-model-list-auth').value, expected);
            assert.equal(root.querySelector('#xb-assistant-delegate-model-list-auth').value, 'x-api-key');
        }
    } finally { dom.restore(); }
});

function flushTasks() {
    return new Promise(resolve => globalThis.setTimeout(resolve, 0));
}

function mountAgentSettingsPanel(root) {
    const { document } = parseHTML(`<!doctype html><html><body>${buildAgentSettingsPanelMarkup({
        showAssistantPermissions: false,
        showDelegateSettings: false,
        showWebSettings: false,
    })}</body></html>`);
    root.replaceChildren(...document.body.childNodes);
}

function installDom() {
    const previousDocument = globalThis.document;
    const previousWindow = globalThis.window;
    const { document, window } = parseHTML('<!doctype html><html><body><div id="root"></div></body></html>');
    Object.defineProperty(window.HTMLSelectElement.prototype, 'value', {
        configurable: true,
        get() {
            return this.querySelector('option[selected]')?.value || '';
        },
        set(value) {
            const requested = String(value ?? '');
            this.querySelectorAll('option').forEach((option) => {
                option.toggleAttribute('selected', option.value === requested);
            });
        },
    });
    globalThis.document = document;
    globalThis.window = window;
    return {
        document,
        restore() {
            if (previousDocument === undefined) {delete globalThis.document;}
            else {globalThis.document = previousDocument;}
            if (previousWindow === undefined) {delete globalThis.window;}
            else {globalThis.window = previousWindow;}
        },
    };
}

test('OS Agent form preserves Agent Core fields that it intentionally hides', () => {
    const dom = installDom();
    const { document } = dom;
    const root = document.querySelector('#root');
    const config = normalizeAgentConfig({ tavilyApiKey: 'keep-tavily-secret' });
    const state = createPanelState(config);
    let savedPayload = null;
    mountAgentSettingsPanel(root);
    const panel = createAgentSettingsPanel({
        state,
        saveConfig: request => {savedPayload = request.payload;},
    });

    try {
        panel.syncConfigToForm(root);
        panel.bindSettingsPanelEvents(root);
        assert.equal(root.querySelector('#xb-assistant-tavily-api-key'), null);
        root.querySelector('#xb-assistant-save').click();
        assert.equal(savedPayload.tavilyApiKey, 'keep-tavily-secret');
    } finally {
        dom.restore();
    }
});

test('web provider selection and both keys survive preset changes, save/reopen and explicit clearing', async () => {
    const dom = installDom(), root = dom.document.querySelector('#root');
    const preset = { provider: 'openai-compatible', modelConfigs: {} };
    let persisted = normalizeAgentConfig({ currentPresetName: 'one', presets: { one: preset, two: preset }, tavilyApiKey: 'tavily-fixture' });
    const storage = { getStrict: async () => persisted, async setAndSave(_key, value) { persisted = value; return true; } };
    const state = createPanelState(persisted);
    const { document } = parseHTML(`<html><body>${buildAgentSettingsPanelMarkup()}</body></html>`);
    root.replaceChildren(...document.body.childNodes);
    let saving;
    const panel = createAgentSettingsPanel({ state, saveConfig: request => { saving = saveSharedAgentSettings(request.payload, { storage }); } });
    const change = (id, value, event = 'change') => {
        const input = root.querySelector(id); input.value = value;
        input.dispatchEvent(new dom.document.defaultView.Event(event));
    };
    try {
        panel.syncConfigToForm(root); panel.bindSettingsPanelEvents(root);
        assert.equal(root.querySelector('#xb-assistant-exa-key-wrap').style.display, 'none');
        change('#xb-assistant-web-provider', 'exa');
        change('#xb-assistant-exa-api-key', 'exa-fixture', 'input');
        change('#xb-assistant-preset-select', 'two');
        panel.syncConfigToForm(root);
        assert.equal(root.querySelector('#xb-assistant-web-provider').value, 'exa');
        assert.equal(root.querySelector('#xb-assistant-exa-api-key').value, 'exa-fixture');
        assert.equal(root.querySelector('#xb-assistant-tavily-key-wrap').style.display, 'none');
        root.querySelector('#xb-assistant-save').click();
        assert.equal((await saving).ok, true);
        state.config = normalizeAgentConfig(await loadSharedAgentSettings({ storage }));
        state.configDraft = null; state.configFormSyncPending = true;
        panel.syncConfigToForm(root);
        assert.equal(root.querySelector('#xb-assistant-exa-api-key').value, 'exa-fixture');
        change('#xb-assistant-web-provider', 'tavily');
        assert.equal(root.querySelector('#xb-assistant-tavily-api-key').value, 'tavily-fixture');
        change('#xb-assistant-tavily-api-key', '', 'input');
        root.querySelector('#xb-assistant-save').click(); await saving;
        assert.equal(persisted.tavilyApiKey, '');
        assert.equal(persisted.exaApiKey, 'exa-fixture');
        assert.equal(persisted.webProvider, 'tavily');
    } finally { dom.restore(); }
});


test('OS Agent form does not pull models until the user clicks the pull action', async () => {
    const dom = installDom();
    const { document } = dom;
    const root = document.querySelector('#root');
    const state = createPanelState(normalizeAgentConfig({}));
    let pullCalls = 0;
    mountAgentSettingsPanel(root);
    const panel = createAgentSettingsPanel({
        state,
        pullModels: async () => {
            pullCalls += 1;
            return ['model-a'];
        },
    });

    try {
        panel.syncConfigToForm(root);
        panel.bindSettingsPanelEvents(root);
        assert.equal(pullCalls, 0);
        root.querySelector('#xb-assistant-pull-models').click();
        await flushTasks();
        assert.equal(pullCalls, 1);
    } finally {
        dom.restore();
    }
});
