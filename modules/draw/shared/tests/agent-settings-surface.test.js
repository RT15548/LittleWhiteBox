import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

import {
    buildDrawAgentSettingsSurfaceMarkup,
    createDrawAgentSettingsSurface,
} from '../agent-settings-surface.js';
import { normalizeAgentConfig } from '../../../agent-core/config.js';
import { createAgentSettingsPanel } from '../../../agent-core/ui/settings-panel.js';
import {
    buildAgentSettingsPanelMarkup,
    syncAgentSettingsPanelFeedback,
} from '../../../agent-core/ui/settings-markup.js';
import {
    loadSharedAgentSettings,
    loadSharedAgentSettingsResult,
    mergeSharedAgentSettings,
    publishSharedAgentSettingsChanged,
    saveSharedAgentSettings,
} from '../../../agent-core/settings-repository.js';

function buildStoredSettings(overrides = {}) {
    return {
        workspaceFileName: 'assistant-workspace.json',
        currentPresetName: '主配置',
        delegatePresetName: '分身配置',
        delegateConfigured: true,
        delegateConfig: {
            provider: 'google',
            modelConfigs: {
                google: { model: 'delegate-model', apiKey: 'delegate-key' },
            },
        },
        jsApiPermission: 'allow',
        updatedAt: 100,
        presets: {
            主配置: {
                provider: 'openai-compatible',
                permissionMode: 'full',
                modelConfigs: {
                    'openai-compatible': { model: 'old-model', apiKey: 'old-key' },
                },
            },
            分身配置: {
                provider: 'google',
                modelConfigs: {
                    google: { model: 'delegate-model', apiKey: 'delegate-key' },
                },
            },
        },
        ...overrides,
    };
}

function installDom() {
    const previous = {
        CustomEvent: globalThis.CustomEvent,
        document: globalThis.document,
        window: globalThis.window,
    };
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
    globalThis.CustomEvent = window.CustomEvent;
    return {
        document,
        window,
        restore() {
            globalThis.CustomEvent = previous.CustomEvent;
            globalThis.document = previous.document;
            globalThis.window = previous.window;
        },
    };
}

function flushTasks(delay = 0) {
    return new Promise(resolve => setTimeout(resolve, delay));
}

test('draw Agent API surface exposes the shared main-preset controls only', () => {
    const dom = installDom();
    const root = dom.document.querySelector('#root');
    try {
        // First-party markup under test.
        // eslint-disable-next-line no-unsanitized/property
        root.innerHTML = buildDrawAgentSettingsSurfaceMarkup({
            config: buildStoredSettings(),
            configSave: { status: 'idle' },
        });
        for (const controlId of [
            'xb-assistant-new-preset',
            'xb-assistant-rename-preset',
            'xb-assistant-save',
            'xb-assistant-delete-preset',
            'xb-assistant-provider',
            'xb-assistant-base-url',
            'xb-assistant-api-key',
            'xb-assistant-model',
            'xb-assistant-pull-models',
            'xb-assistant-max-tokens',
            'xb-assistant-temperature',
            'xb-assistant-tool-mode',
            'xb-assistant-reasoning-mode',
            'xb-assistant-reasoning-effort',
            'xb-assistant-reasoning-budget',
            'xb-assistant-reasoning-output',
        ]) {
            assert.ok(root.querySelector(`#${controlId}`));
        }
        assert.equal(root.querySelector('#xb-assistant-config-tab-delegate'), null);
        assert.equal(root.querySelector('#xb-assistant-permission-mode'), null);
        assert.equal(root.querySelector('#xb-assistant-jsapi-permission'), null);
    } finally {
        dom.restore();
    }
});

test('shared Agent reasoning controls follow the selected Provider and model without resetting model input', () => {
    const dom = installDom();
    const root = dom.document.querySelector('#root');
    const stored = buildStoredSettings({
        presets: {
            ...buildStoredSettings().presets,
            主配置: {
                provider: 'openai-compatible',
                modelConfigs: {
                    'openai-compatible': {
                        baseUrl: 'https://api.moonshot.ai/v1',
                        model: 'kimi-k3',
                        apiKey: 'kimi-key',
                        reasoning: {
                            mode: 'on',
                            effort: 'max',
                            output: 'hide',
                        },
                    },
                },
            },
        },
    });
    const state = {
        config: normalizeAgentConfig(stored),
        configDraft: null,
        configDirty: false,
        configExternalChangePending: false,
        configFormSyncPending: true,
        configPage: 'main',
        configSave: { status: 'idle', requestId: '', error: '' },
        modelOptionsByProvider: {},
        pullStateByProvider: {},
    };
    try {
        // First-party markup under test.
        // eslint-disable-next-line no-unsanitized/property
        root.innerHTML = buildAgentSettingsPanelMarkup();
        const panel = createAgentSettingsPanel({ state });
        panel.syncConfigToForm(root);

        const efforts = Array.from(root.querySelector('#xb-assistant-reasoning-effort').options)
            .map((option) => option.value);
        assert.deepEqual(efforts, ['low', 'high', 'max']);
        assert.equal(root.querySelector('#xb-assistant-reasoning-mode').value, 'on');
        assert.equal(root.querySelector('#xb-assistant-reasoning-mode option[value="off"]').disabled, false);
        assert.equal(root.querySelector('#xb-assistant-reasoning-output').value, 'hide');

        panel.bindSettingsPanelEvents(root);
        const modelInput = root.querySelector('#xb-assistant-model');
        modelInput.value = 'unknown-compatible-model';
        modelInput.selectionStart = 7;
        modelInput.selectionEnd = 7;
        modelInput.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
        assert.equal(modelInput.value, 'unknown-compatible-model');
        assert.equal(modelInput.selectionStart, 7);
        assert.equal(root.querySelector('#xb-assistant-reasoning-mode').value, 'on');
        assert.equal(root.querySelector('#xb-assistant-reasoning-mode option[value="on"]').disabled, false);
        assert.equal(root.querySelector('#xb-assistant-reasoning-mode option[value="off"]').disabled, false);
        assert.equal(root.querySelector('#xb-assistant-reasoning-output').value, 'hide');
        assert.equal(root.querySelector('#xb-assistant-reasoning-output option[value="show"]').disabled, false);
        assert.deepEqual(
            Array.from(root.querySelector('#xb-assistant-reasoning-effort').options)
                .map((option) => option.value),
            ['low', 'medium', 'high'],
        );
        assert.equal(root.querySelector('#xb-assistant-reasoning-effort').value, 'medium');

        modelInput.value = 'gpt-5.6';
        modelInput.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
        assert.deepEqual(
            Array.from(root.querySelector('#xb-assistant-reasoning-effort').options)
                .map((option) => option.value),
            ['low', 'medium', 'high', 'xhigh', 'max'],
        );
        assert.equal(root.querySelector('#xb-assistant-reasoning-mode').value, 'on');
        assert.equal(root.querySelector('#xb-assistant-reasoning-effort').value, 'medium');
        assert.equal(root.querySelector('#xb-assistant-reasoning-output option[value="show"]').disabled, false);
    } finally {
        dom.restore();
    }
});

test('shared Agent Provider switching keeps each Provider model and Reasoning draft isolated', () => {
    const dom = installDom();
    const root = dom.document.querySelector('#root');
    const stored = buildStoredSettings({
        presets: {
            ...buildStoredSettings().presets,
            主配置: {
                provider: 'openai-compatible',
                modelConfigs: {
                    'openai-compatible': {
                        baseUrl: 'https://api.moonshot.ai/v1',
                        model: 'kimi-k3',
                        apiKey: 'kimi-key',
                        reasoning: { mode: 'on', effort: 'max', output: 'hide' },
                    },
                    google: {
                        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
                        model: 'gemini-3-flash-preview',
                        apiKey: 'google-key',
                        reasoning: { mode: 'on', effort: 'minimal', output: 'show' },
                    },
                },
            },
        },
    });
    const state = {
        config: normalizeAgentConfig(stored),
        configDraft: null,
        configDirty: false,
        configExternalChangePending: false,
        configFormSyncPending: true,
        configPage: 'main',
        configSave: { status: 'idle', requestId: '', error: '' },
        modelOptionsByProvider: {},
        pullStateByProvider: {},
    };
    let panel;
    try {
        // First-party markup under test.
        // eslint-disable-next-line no-unsanitized/property
        root.innerHTML = buildAgentSettingsPanelMarkup();
        panel = createAgentSettingsPanel({
            state,
            render: () => panel.syncConfigToForm(root),
        });
        panel.syncConfigToForm(root);
        panel.bindSettingsPanelEvents(root);

        const providerSelect = root.querySelector('#xb-assistant-provider');
        providerSelect.value = 'google';
        providerSelect.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
        assert.equal(root.querySelector('#xb-assistant-model').value, 'gemini-3-flash-preview');
        assert.equal(root.querySelector('#xb-assistant-reasoning-mode').value, 'on');
        assert.equal(root.querySelector('#xb-assistant-reasoning-effort').value, 'minimal');
        assert.equal(root.querySelector('#xb-assistant-reasoning-output').value, 'show');

        providerSelect.value = 'openai-compatible';
        providerSelect.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
        assert.equal(root.querySelector('#xb-assistant-model').value, 'kimi-k3');
        assert.equal(root.querySelector('#xb-assistant-reasoning-mode').value, 'on');
        assert.equal(root.querySelector('#xb-assistant-reasoning-effort').value, 'max');
        assert.equal(root.querySelector('#xb-assistant-reasoning-output').value, 'hide');
    } finally {
        dom.restore();
    }
});

test('shared Agent settings keep explicit Reasoning usable for a custom OpenAI-compatible model name', () => {
    const dom = installDom();
    const root = dom.document.querySelector('#root');
    const stored = buildStoredSettings({
        presets: {
            ...buildStoredSettings().presets,
            主配置: {
                provider: 'openai-compatible',
                modelConfigs: {
                    'openai-compatible': {
                        model: 'relay/gpt-custom',
                        apiKey: 'compatible-key',
                        reasoning: { mode: 'on', effort: 'high', output: 'hide' },
                    },
                },
            },
        },
    });
    const state = {
        config: normalizeAgentConfig(stored),
        configDraft: null,
        configDirty: false,
        configExternalChangePending: false,
        configFormSyncPending: true,
        configPage: 'main',
        configSave: { status: 'idle', requestId: '', error: '' },
        modelOptionsByProvider: {},
        pullStateByProvider: {},
    };
    const saves = [];
    const toasts = [];
    try {
        // First-party markup under test.
        // eslint-disable-next-line no-unsanitized/property
        root.innerHTML = buildAgentSettingsPanelMarkup();
        const panel = createAgentSettingsPanel({
            state,
            saveConfig: (payload) => saves.push(payload),
            showToast: (message) => toasts.push(message),
        });
        panel.syncConfigToForm(root);
        panel.bindSettingsPanelEvents(root);

        const modelInput = root.querySelector('#xb-assistant-model');
        modelInput.value = 'custom-model-without-family-name';
        modelInput.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
        root.querySelector('#xb-assistant-save').click();

        assert.equal(saves.length, 1);
        assert.equal(toasts.length, 0);
        assert.equal(
            saves[0]?.config?.presets?.主配置?.modelConfigs?.['openai-compatible']?.model,
            'custom-model-without-family-name',
        );
    } finally {
        dom.restore();
    }
});

test('shared Agent settings validate hidden preset Reasoning before saving', () => {
    const dom = installDom();
    const root = dom.document.querySelector('#root');
    const stored = buildStoredSettings({
        presets: {
            ...buildStoredSettings().presets,
            隐藏配置: {
                provider: 'google',
                modelConfigs: {
                    google: {
                        model: 'private-google-model-alias',
                        apiKey: 'google-key',
                        reasoning: { mode: 'off', output: 'hide' },
                    },
                },
            },
        },
    });
    const state = {
        config: normalizeAgentConfig(stored),
        configDraft: null,
        configDirty: false,
        configExternalChangePending: false,
        configFormSyncPending: true,
        configPage: 'main',
        configSave: { status: 'idle', requestId: '', error: '' },
        modelOptionsByProvider: {},
        pullStateByProvider: {},
    };
    const saves = [];
    const toasts = [];
    try {
        // First-party markup under test.
        // eslint-disable-next-line no-unsanitized/property
        root.innerHTML = buildAgentSettingsPanelMarkup();
        const panel = createAgentSettingsPanel({
            state,
            saveConfig: (payload) => saves.push(payload),
            showToast: (message) => toasts.push(message),
        });
        panel.syncConfigToForm(root);
        panel.bindSettingsPanelEvents(root);
        root.querySelector('#xb-assistant-save').click();

        assert.equal(saves.length, 0);
        assert.match(toasts.at(-1), /预设“隐藏配置”.*不支持显式关闭 Reasoning/);
    } finally {
        dom.restore();
    }
});

test('preset deletion runs full Reasoning validation before committing', () => {
    const dom = installDom();
    const root = dom.document.querySelector('#root');
    const stored = buildStoredSettings({
        presets: {
            ...buildStoredSettings().presets,
            隐藏配置: {
                provider: 'google',
                modelConfigs: {
                    google: {
                        model: 'private-google-model-alias',
                        apiKey: 'google-key',
                        reasoning: { mode: 'off', output: 'hide' },
                    },
                },
            },
        },
    });
    const state = {
        config: normalizeAgentConfig(stored),
        configDraft: null,
        configDirty: false,
        configExternalChangePending: false,
        configFormSyncPending: true,
        configPage: 'main',
        configSave: { status: 'idle', requestId: '', error: '' },
        modelOptionsByProvider: {},
        pullStateByProvider: {},
    };
    const saves = [];
    const toasts = [];
    try {
        // First-party markup under test.
        // eslint-disable-next-line no-unsanitized/property
        root.innerHTML = buildAgentSettingsPanelMarkup();
        const panel = createAgentSettingsPanel({
            state,
            saveConfig: (payload) => saves.push(payload),
            showToast: (message) => toasts.push(message),
        });
        panel.syncConfigToForm(root);
        panel.bindSettingsPanelEvents(root);
        root.querySelector('#xb-assistant-delete-preset').click();

        assert.equal(saves.length, 0);
        assert.equal(state.config.currentPresetName, '主配置');
        assert.equal(Object.hasOwn(state.config.presets, '主配置'), true);
        assert.match(toasts.at(-1), /预设“隐藏配置”.*不支持显式关闭 Reasoning/);
    } finally {
        dom.restore();
    }
});

test('shared Agent settings validate delegate Reasoning before saving', () => {
    const dom = installDom();
    const root = dom.document.querySelector('#root');
    const stored = buildStoredSettings({
        delegateConfig: {
            provider: 'google',
            modelConfigs: {
                google: {
                    model: 'private-google-model-alias',
                    apiKey: 'google-key',
                    maxTokens: 8192,
                    reasoning: { mode: 'off', output: 'hide' },
                },
            },
        },
    });
    const state = {
        config: normalizeAgentConfig(stored),
        configDraft: null,
        configDirty: false,
        configExternalChangePending: false,
        configFormSyncPending: true,
        configPage: 'main',
        configSave: { status: 'idle', requestId: '', error: '' },
        modelOptionsByProvider: {},
        pullStateByProvider: {},
    };
    const saves = [];
    const toasts = [];
    try {
        // First-party markup under test.
        // eslint-disable-next-line no-unsanitized/property
        root.innerHTML = buildAgentSettingsPanelMarkup();
        const panel = createAgentSettingsPanel({
            state,
            saveConfig: (payload) => saves.push(payload),
            showToast: (message) => toasts.push(message),
        });
        panel.syncConfigToForm(root);
        panel.bindSettingsPanelEvents(root);
        root.querySelector('#xb-assistant-save').click();

        assert.equal(saves.length, 0);
        assert.match(toasts.at(-1), /分身模型.*不支持显式关闭 Reasoning/);
    } finally {
        dom.restore();
    }
});

test('shared Agent API panel disables failed loads, retries, and keeps partial markup safe', () => {
    const dom = installDom();
    const root = dom.document.querySelector('#root');
    const state = {
        config: normalizeAgentConfig(buildStoredSettings()),
        configDraft: null,
        configDirty: true,
        configExternalChangePending: true,
        configFormSyncPending: true,
        configPage: 'main',
        configSave: { status: 'idle', requestId: '', error: '' },
        modelOptionsByProvider: {},
        pullStateByProvider: {},
    };
    let retries = 0;
    let renders = 0;
    try {
        // First-party markup under test.
        // eslint-disable-next-line no-unsanitized/property
        root.innerHTML = buildAgentSettingsPanelMarkup({
            configLoadError: '<读取失败>',
            configExternalChangePending: true,
        });
        root.querySelector('#xb-assistant-base-url')?.remove();
        root.querySelector('#xb-assistant-tool-mode')?.remove();
        root.querySelector('#xb-assistant-reasoning-mode')?.remove();
        const panel = createAgentSettingsPanel({
            state,
            render: () => { renders += 1; },
            reloadConfig: () => { retries += 1; },
        });
        assert.doesNotThrow(() => panel.syncConfigToForm(root));
        assert.doesNotThrow(() => panel.bindSettingsPanelEvents(root));
        assert.equal(root.querySelector('[data-xb-agent-config-fields]').hasAttribute('disabled'), true);
        assert.equal(root.querySelector('[data-xb-agent-config-load-error-message]').textContent, '<读取失败>');

        root.querySelector('[data-xb-agent-config-retry]').click();
        assert.equal(retries, 1);
        syncAgentSettingsPanelFeedback(root, {
            configLoadError: '',
            configExternalChangePending: true,
        });
        assert.equal(root.querySelector('[data-xb-agent-config-fields]').hasAttribute('disabled'), false);
        assert.equal(root.querySelector('[data-xb-agent-config-conflict]').hidden, false);

        root.querySelector('[data-xb-agent-config-reload]').click();
        assert.equal(state.configDraft, null);
        assert.equal(state.configDirty, false);
        assert.equal(state.configExternalChangePending, false);
        assert.equal(renders, 1);
    } finally {
        dom.restore();
    }
});

test('draw Agent API edits preserve hidden assistant and delegate settings', () => {
    const current = buildStoredSettings();
    const next = mergeSharedAgentSettings(current, {
        currentPresetName: '主配置',
        presets: {
            ...current.presets,
            主配置: {
                ...current.presets.主配置,
                modelConfigs: {
                    'openai-compatible': { model: 'new-model', apiKey: 'new-key' },
                },
            },
        },
    }, { now: () => 1234 });

    assert.equal(next.presets.主配置.modelConfigs['openai-compatible'].model, 'new-model');
    assert.equal(next.jsApiPermission, 'allow');
    assert.equal(next.delegatePresetName, '分身配置');
    assert.equal(next.delegateConfigured, true);
    assert.equal(next.delegateConfig.modelConfigs.google.model, 'delegate-model');
    assert.equal(next.updatedAt, 1234);
});

test('draw Agent API performs a real DOM mount, edit, save, and local feedback reset', async () => {
    const dom = installDom();
    const root = dom.document.querySelector('#root');
    let stored = buildStoredSettings();
    const savedPatches = [];
    const surface = createDrawAgentSettingsSurface({
        getRoot: () => root,
        eventTarget: dom.window,
        saveStateResetMs: 5,
        loadSettings: async () => stored,
        saveSettings: async (patch) => {
            savedPatches.push(patch);
            stored = mergeSharedAgentSettings(stored, patch, { now: () => 200 });
            return { ok: true, config: stored };
        },
    });

    try {
        await surface.refresh();
        const panel = root.querySelector('.xb-assistant-config');
        const modelInput = root.querySelector('#xb-assistant-model');
        assert.ok(panel);
        assert.equal(modelInput.value, 'old-model');

        modelInput.value = 'new-model';
        modelInput.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
        assert.equal(surface.getState().configDirty, true);
        root.querySelector('#xb-assistant-save').click();
        await flushTasks();
        await flushTasks();

        assert.equal(savedPatches.length, 1);
        assert.equal(savedPatches[0].expectedUpdatedAt, 100);
        assert.equal(stored.presets.主配置.modelConfigs['openai-compatible'].model, 'new-model');
        assert.equal(surface.getState().configDirty, false);
        assert.equal(root.querySelector('.xb-assistant-config'), panel);
        await flushTasks(10);
        assert.equal(root.querySelector('.xb-assistant-config'), panel);
        assert.equal(root.querySelector('#xb-assistant-toast').textContent, '');
    } finally {
        surface.destroy();
        dom.restore();
    }
});

test('external changes refresh a clean surface but preserve a dirty draft until explicit reload', async () => {
    const dom = installDom();
    const root = dom.document.querySelector('#root');
    let stored = buildStoredSettings();
    const surface = createDrawAgentSettingsSurface({
        getRoot: () => root,
        eventTarget: dom.window,
        source: 'draw-test',
        loadSettings: async () => stored,
    });

    try {
        await surface.refresh();
        const modelInput = root.querySelector('#xb-assistant-model');
        modelInput.value = 'local-draft';
        modelInput.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
        stored = buildStoredSettings({
            updatedAt: 300,
            presets: {
                ...stored.presets,
                主配置: {
                    ...stored.presets.主配置,
                    modelConfigs: {
                        'openai-compatible': { model: 'external-model', apiKey: 'old-key' },
                    },
                },
            },
        });
        publishSharedAgentSettingsChanged({ source: 'assistant', updatedAt: 300 }, {
            eventTarget: dom.window,
        });
        await flushTasks();

        assert.equal(root.querySelector('#xb-assistant-model').value, 'local-draft');
        assert.equal(surface.getState().externalChangePending, true);
        assert.equal(root.querySelector('[data-draw-agent-settings-conflict]').hidden, false);

        root.querySelector('[data-draw-agent-settings-reload]').click();
        await flushTasks();
        await flushTasks();
        assert.equal(root.querySelector('#xb-assistant-model').value, 'external-model');
        assert.equal(surface.getState().externalChangePending, false);
    } finally {
        surface.destroy();
        dom.restore();
    }
});

test('shared Agent API persistence is atomic and rejects stale revisions', async () => {
    const cache = { settings: buildStoredSettings(), anotherFeature: { enabled: true } };
    const calls = [];
    const storage = {
        async get(key) { return cache[key]; },
        async setAndSave(key, value, options) {
            calls.push({ key, options });
            cache[key] = value;
            return true;
        },
    };

    const success = await saveSharedAgentSettings({
        expectedUpdatedAt: 100,
        currentPresetName: '主配置',
        presets: cache.settings.presets,
    }, {
        storage,
        silent: false,
        now: () => 5678,
        eventTarget: new EventTarget(),
    });

    assert.equal(success.ok, true);
    assert.equal(cache.anotherFeature.enabled, true);
    assert.equal(cache.settings.configVersion, 1);
    assert.equal(cache.settings.updatedAt, 5678);
    assert.deepEqual(calls, [{ key: 'settings', options: { silent: false } }]);

    const stale = await saveSharedAgentSettings({ expectedUpdatedAt: 100 }, { storage });
    assert.equal(stale.ok, false);
    assert.equal(stale.conflict, true);
    assert.equal(calls.length, 1);

    const original = buildStoredSettings();
    const failed = await saveSharedAgentSettings({}, {
        storage: {
            async get() { return original; },
            async setAndSave() { throw new Error('disk unavailable'); },
        },
        silent: false,
    });
    assert.equal(failed.ok, false);
    assert.equal(failed.error, 'disk unavailable');
    assert.equal(failed.config.updatedAt, original.updatedAt);

    const returnedFalse = await saveSharedAgentSettings({}, {
        storage: {
            async get() { return original; },
            async setAndSave() { return false; },
        },
    });
    assert.equal(returnedFalse.ok, false);
    assert.match(returnedFalse.error, /保存失败/);
    assert.equal(returnedFalse.config.updatedAt, original.updatedAt);

    let wroteAfterReadFailure = false;
    const readFailed = await saveSharedAgentSettings({}, {
        storage: {
            async get() { throw new Error('read unavailable'); },
            async setAndSave() { wroteAfterReadFailure = true; return true; },
        },
    });
    assert.equal(readFailed.ok, false);
    assert.equal(readFailed.config, null);
    assert.match(readFailed.error, /读取失败：read unavailable/);
    assert.equal(wroteAfterReadFailure, false);
});

test('shared Agent settings prefer strict storage reads and expose load failures without inventing defaults', async () => {
    let fallbackRead = false;
    const storage = {
        async get() {
            fallbackRead = true;
            return buildStoredSettings();
        },
        async getStrict() {
            throw new Error('backend unavailable');
        },
    };

    await assert.rejects(
        loadSharedAgentSettings({ storage }),
        /backend unavailable/,
    );
    const result = await loadSharedAgentSettingsResult({ storage });
    assert.equal(result.ok, false);
    assert.equal(result.config, null);
    assert.match(result.error, /共享 Agent API 配置读取失败：backend unavailable/);
    assert.equal(fallbackRead, false);
});

test('simultaneous shared Agent saves serialize before checking their revision', async () => {
    const cache = { settings: buildStoredSettings() };
    const storage = {
        async get(key) { return cache[key]; },
        async setAndSave(key, value) {
            await flushTasks(2);
            cache[key] = value;
            return true;
        },
    };
    const [first, second] = await Promise.all([
        saveSharedAgentSettings({ expectedUpdatedAt: 100 }, {
            storage,
            now: () => 101,
        }),
        saveSharedAgentSettings({ expectedUpdatedAt: 100 }, {
            storage,
            now: () => 102,
        }),
    ]);

    assert.equal(first.ok, true);
    assert.equal(second.ok, false);
    assert.equal(second.conflict, true);
    assert.equal(cache.settings.updatedAt, 101);
});

test('draw Agent API load failures are escaped and retryable', () => {
    const dom = installDom();
    const root = dom.document.querySelector('#root');
    try {
        // First-party escaped markup under test.
        // eslint-disable-next-line no-unsanitized/property
        root.innerHTML = buildDrawAgentSettingsSurfaceMarkup({
            loadError: '<script>bad()</script>',
        });
        assert.equal(root.querySelector('script'), null);
        assert.equal(root.querySelector('.draw-agent-settings-state span').textContent, '<script>bad()</script>');
        assert.ok(root.querySelector('[data-draw-agent-settings-retry]'));
    } finally {
        dom.restore();
    }
});
