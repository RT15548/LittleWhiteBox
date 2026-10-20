import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

import {
    buildDrawAgentSettingsSurfaceMarkup,
    createDrawAgentSettingsSurface,
} from '../agent-settings-surface.js';
import { normalizeAgentConfig } from '../../../agent-core/config.js';
import { createAgentSettingsPanel } from '../../../agent-core/ui/settings-panel.js';
import { buildAgentSettingsPanelMarkup } from '../../../agent-core/ui/settings-markup.js';
import { createCardMenuController } from '../character-card-menu.js';
import { movePresetId } from '../preset-order.js';
import { createSortableList } from '../sortable-list.js';
import {
    loadSharedAgentSettings,
    loadSharedAgentSettingsResult,
    mergeSharedAgentSettings,
    saveSharedAgentSettings,
} from '../../../agent-core/settings-repository.js';
import {
    fetchHostOpenAICompatibleModels,
    setHostChatCompletionsRequestHeadersProvider,
} from '../../../../shared/host-llm/chat-completions/client.js';

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
            'xb-assistant-save',
            'xb-assistant-preset-list',
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
        ]) {
            assert.ok(root.querySelector(`#${controlId}`));
        }
        // 绘图页走预设列表布局：不再有下拉框和重命名 / 删除图标按钮（改在每行的“…”菜单里）
        for (const goneId of ['xb-assistant-preset-select', 'xb-assistant-rename-preset', 'xb-assistant-delete-preset']) {
            assert.equal(root.querySelector(`#${goneId}`), null);
        }
        assert.equal(root.querySelector('#xb-assistant-config-tab-delegate'), null);
        assert.equal(root.querySelector('#xb-assistant-permission-mode'), null);
        assert.equal(root.querySelector('#xb-assistant-jsapi-permission'), null);
        assert.equal(root.querySelector('#xb-assistant-reasoning-output'), null);
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
        assert.equal(root.querySelector('#xb-assistant-delegate-reasoning-output'), null);
        const panel = createAgentSettingsPanel({ state });
        panel.syncConfigToForm(root);

        const efforts = Array.from(root.querySelector('#xb-assistant-reasoning-effort').options)
            .map((option) => option.value);
        assert.deepEqual(efforts, ['low', 'high', 'max']);
        assert.equal(root.querySelector('#xb-assistant-reasoning-mode').value, 'on');
        assert.equal(root.querySelector('#xb-assistant-reasoning-mode option[value="off"]').disabled, false);
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
                        reasoning: { mode: 'on', effort: 'max' },
                    },
                    google: {
                        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
                        model: 'gemini-3-flash-preview',
                        apiKey: 'google-key',
                        reasoning: { mode: 'on', effort: 'minimal' },
                    },
                },
            },
        },
    });
    const state = {
        config: normalizeAgentConfig(stored),
        configDraft: null,
        configDirty: false,
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
        providerSelect.value = 'openai-compatible';
        providerSelect.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
        assert.equal(root.querySelector('#xb-assistant-model').value, 'kimi-k3');
        assert.equal(root.querySelector('#xb-assistant-reasoning-mode').value, 'on');
        assert.equal(root.querySelector('#xb-assistant-reasoning-effort').value, 'max');
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
                        reasoning: { mode: 'on', effort: 'high' },
                    },
                },
            },
        },
    });
    const state = {
        config: normalizeAgentConfig(stored),
        configDraft: null,
        configDirty: false,
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
                        reasoning: { mode: 'off' },
                    },
                },
            },
        },
    });
    const state = {
        config: normalizeAgentConfig(stored),
        configDraft: null,
        configDirty: false,
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
                        reasoning: { mode: 'off' },
                    },
                },
            },
        },
    });
    const state = {
        config: normalizeAgentConfig(stored),
        configDraft: null,
        configDirty: false,
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
                    reasoning: { mode: 'off' },
                },
            },
        },
    });
    const state = {
        config: normalizeAgentConfig(stored),
        configDraft: null,
        configDirty: false,
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

test('shared Agent API panel keeps load failures out of the form header', () => {
    const dom = installDom();
    const root = dom.document.querySelector('#root');
    const state = {
        config: normalizeAgentConfig(buildStoredSettings()),
        configDraft: null,
        configDirty: true,
        configFormSyncPending: true,
        configPage: 'main',
        configSave: { status: 'idle', requestId: '', error: '' },
        modelOptionsByProvider: {},
        pullStateByProvider: {},
    };
    try {
        // First-party markup under test.
        // eslint-disable-next-line no-unsanitized/property
        root.innerHTML = buildAgentSettingsPanelMarkup({
            configLoadError: '<读取失败>',
        });
        root.querySelector('#xb-assistant-base-url')?.remove();
        root.querySelector('#xb-assistant-tool-mode')?.remove();
        root.querySelector('#xb-assistant-reasoning-mode')?.remove();
        const panel = createAgentSettingsPanel({
            state,
        });
        assert.doesNotThrow(() => panel.syncConfigToForm(root));
        assert.doesNotThrow(() => panel.bindSettingsPanelEvents(root));
        assert.equal(root.querySelector('[data-xb-agent-config-fields]').hasAttribute('disabled'), true);
        assert.equal(root.querySelector('#xb-assistant-toast').textContent, '<读取失败>');
        assert.equal(root.querySelector('[data-xb-agent-config-retry]'), null);
        assert.equal(root.querySelector('[data-xb-agent-config-reload]'), null);
        assert.equal(root.querySelector('[data-xb-agent-config-conflict]'), null);
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

test('draw Agent API registers host request headers for its model pull client', async () => {
    const originalFetch = globalThis.fetch;
    const requests = [];
    globalThis.fetch = async (_url, options = {}) => {
        requests.push(options.headers);
        return {
            ok: true,
            status: 200,
            text: async () => JSON.stringify({ data: [] }),
        };
    };
    const surface = createDrawAgentSettingsSurface({
        requestHeadersProvider: () => ({ 'X-CSRF-Token': 'draw-settings-token' }),
    });

    try {
        await fetchHostOpenAICompatibleModels({});
        assert.equal(requests[0]['X-CSRF-Token'], 'draw-settings-token');
    } finally {
        surface.destroy();
        setHostChatCompletionsRequestHeadersProvider(null);
        globalThis.fetch = originalFetch;
    }
});

test('shared Agent API persistence uses the canonical settings document and atomic storage write', async () => {
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
        currentPresetName: '主配置',
        presets: cache.settings.presets,
    }, {
        storage,
        silent: false,
        now: () => 5678,
    });

    assert.equal(success.ok, true);
    assert.equal(cache.anotherFeature.enabled, true);
    assert.equal(cache.settings.configVersion, 1);
    assert.equal(cache.settings.updatedAt, 5678);
    assert.deepEqual(calls, [{ key: 'settings', options: { silent: false } }]);

    const later = await saveSharedAgentSettings({}, { storage, now: () => 5679 });
    assert.equal(later.ok, true);
    assert.equal(calls.length, 2);
    assert.equal(cache.settings.updatedAt, 5679);

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

// ───────────────────────── 预设列表布局 ─────────────────────────

const PRESET_KIT = {
    createSortableList,
    createMenuController: createCardMenuController,
    moveStep: movePresetId,
};

function threePresets(extra = {}) {
    const base = buildStoredSettings();
    return buildStoredSettings({
        presets: {
            主配置: base.presets.主配置,
            分身配置: base.presets.分身配置,
            第三配置: {
                provider: 'openai-compatible',
                modelConfigs: { 'openai-compatible': { model: 'third-model', apiKey: 'third-key' } },
            },
            ...extra,
        },
    });
}

function rowNames(root) {
    return Array.from(root.querySelectorAll('[data-preset-item]')).map(row => row.dataset.presetName);
}

function fire(dom, node, type, props = {}) {
    const event = new dom.window.Event(type, { bubbles: true, cancelable: true });
    Object.assign(event, props);
    node.dispatchEvent(event);
    return event;
}

function rowOf(root, name) {
    return Array.from(root.querySelectorAll('[data-preset-item]')).find(row => row.dataset.presetName === name);
}

async function mountListSurface(dom, initial, { saveSettings, saveStateResetMs = 5 } = {}) {
    const root = dom.document.querySelector('#root');
    const holder = { stored: initial, patches: [] };
    const toasts = [];
    const surface = createDrawAgentSettingsSurface({
        getRoot: () => root,
        saveStateResetMs,
        showToast: message => toasts.push(message),
        loadSettings: async () => holder.stored,
        saveSettings: saveSettings || (async (patch) => {
            holder.patches.push(patch);
            holder.stored = mergeSharedAgentSettings(holder.stored, patch, { now: () => 300 });
            return { ok: true, config: holder.stored };
        }),
    });
    await surface.refresh();
    return { root, surface, holder, toasts };
}

test('list layout markup renders one row per preset in order, marks the selected one and escapes names', () => {
    const names = ['甲', '<img src=x onerror=alert(1)>', 'a"b\'c&d'];
    const html = buildAgentSettingsPanelMarkup({
        presetLayout: 'list',
        presetNames: names,
        currentPresetName: names[1],
    });
    const dom = installDom();
    const root = dom.document.querySelector('#root');
    try {
        // First-party markup under test.
        // eslint-disable-next-line no-unsanitized/property
        root.innerHTML = html;
        assert.equal(root.querySelector('#xb-assistant-preset-select'), null);
        assert.equal(root.querySelector('img'), null);
        assert.deepEqual(rowNames(root), names);
        const selected = root.querySelectorAll('[data-preset-item].is-selected');
        assert.equal(selected.length, 1);
        assert.equal(selected[0].dataset.presetName, names[1]);
        assert.equal(root.querySelectorAll('[aria-current="true"]').length, 1);
        assert.equal(rowOf(root, names[1]).querySelector('.xb-assistant-preset-name').getAttribute('aria-current'), 'true');
        assert.equal(rowOf(root, names[1]).querySelector('.xb-assistant-preset-name').textContent, names[1]);
        // 头部：新建 + 保存；每行菜单：重命名 / 复制 / 删除（危险样式）
        assert.ok(root.querySelector('#xb-assistant-new-preset'));
        assert.ok(root.querySelector('#xb-assistant-save'));
        const menuActions = Array.from(rowOf(root, names[0]).querySelectorAll('[role="menuitem"]'))
            .map(item => item.dataset.presetAction);
        assert.deepEqual(menuActions, ['rename', 'duplicate', 'delete']);
        assert.ok(rowOf(root, names[0]).querySelector('[data-preset-action="delete"]').classList.contains('is-danger'));
        assert.equal(rowOf(root, names[0]).querySelector('[role="menu"]').hasAttribute('hidden'), true);
    } finally {
        dom.restore();
    }
});

test('list layout disables delete when only one preset remains; default layout still renders the select', () => {
    const dom = installDom();
    const root = dom.document.querySelector('#root');
    try {
        // First-party markup under test.
        // eslint-disable-next-line no-unsanitized/property
        root.innerHTML = buildAgentSettingsPanelMarkup({
            presetLayout: 'list',
            presetNames: ['唯一'],
            currentPresetName: '唯一',
            canDeletePreset: false,
        });
        assert.equal(root.querySelector('[data-preset-action="delete"]').hasAttribute('disabled'), true);
        assert.equal(root.querySelector('[data-preset-action="rename"]').hasAttribute('disabled'), false);

        // First-party markup under test.
        // eslint-disable-next-line no-unsanitized/property
        root.innerHTML = buildAgentSettingsPanelMarkup();
        assert.ok(root.querySelector('#xb-assistant-preset-select'));
        assert.ok(root.querySelector('#xb-assistant-rename-preset'));
        assert.ok(root.querySelector('#xb-assistant-delete-preset'));
        assert.equal(root.querySelector('#xb-assistant-preset-list'), null);
        assert.equal(root.querySelector('[data-preset-item]'), null);
        // 显式传默认值与不传完全一致
        assert.equal(buildAgentSettingsPanelMarkup({ presetLayout: 'select' }), buildAgentSettingsPanelMarkup());
    } finally {
        dom.restore();
    }
});

test('draw surface renders the preset list in config order and clicking a row loads that preset like the old select did', async () => {
    const dom = installDom();
    let mounted;
    try {
        mounted = await mountListSurface(dom, threePresets());
        const { root, surface } = mounted;
        assert.equal(root.querySelector('#xb-assistant-preset-select'), null);
        assert.deepEqual(rowNames(root), ['主配置', '分身配置', '第三配置']);
        assert.equal(root.querySelector('#xb-assistant-model').value, 'old-model');

        fire(dom, rowOf(root, '第三配置').querySelector('.xb-assistant-preset-name'), 'click');
        assert.equal(surface.getState().configDraft.currentPresetName, '第三配置');
        assert.equal(root.querySelector('#xb-assistant-model').value, 'third-model');
        assert.equal(rowOf(root, '第三配置').classList.contains('is-selected'), true);
        assert.equal(rowOf(root, '主配置').classList.contains('is-selected'), false);
        assert.equal(root.querySelectorAll('[aria-current="true"]').length, 1);
        // 选中只是本地切换，不落盘
        assert.equal(mounted.holder.patches.length, 0);

        // 再点已选中的一行不重填表单：未保存的编辑保留
        const modelInput = root.querySelector('#xb-assistant-model');
        modelInput.value = 'typed-but-unsaved';
        fire(dom, modelInput, 'input');
        fire(dom, rowOf(root, '第三配置').querySelector('.xb-assistant-preset-name'), 'click');
        assert.equal(root.querySelector('#xb-assistant-model').value, 'typed-but-unsaved');
    } finally {
        mounted?.surface.destroy();
        dom.restore();
    }
});

test('keyboard reorder persists only the new preset order and leaves the unsaved form draft alone', async () => {
    const dom = installDom();
    let mounted;
    try {
        mounted = await mountListSurface(dom, threePresets());
        const { root, surface, holder } = mounted;
        const modelInput = root.querySelector('#xb-assistant-model');
        modelInput.value = 'unsaved-edit';
        fire(dom, modelInput, 'input');
        assert.equal(surface.getState().configDirty, true);
        const draftBefore = surface.getState().configDraft;

        const handle = rowOf(root, '主配置').querySelector('[data-preset-drag]');
        fire(dom, handle, 'keydown', { key: 'ArrowDown' });
        // 乐观更新：保存还没返回，列表已是新顺序
        assert.deepEqual(rowNames(root), ['分身配置', '主配置', '第三配置']);
        await flushTasks();
        await flushTasks();

        assert.equal(holder.patches.length, 1);
        assert.deepEqual(Object.keys(holder.patches[0].presets), ['分身配置', '主配置', '第三配置']);
        assert.deepEqual(Object.keys(holder.stored.presets), ['分身配置', '主配置', '第三配置']);
        assert.equal(holder.patches[0].currentPresetName, '主配置');
        // 落盘的是已保存内容，不是表单草稿
        assert.equal(holder.stored.presets.主配置.modelConfigs['openai-compatible'].model, 'old-model');
        assert.equal(holder.stored.delegatePresetName, '分身配置');
        // 表单与草稿原样保留
        assert.equal(root.querySelector('#xb-assistant-model').value, 'unsaved-edit');
        assert.equal(surface.getState().configDraft, draftBefore);
        assert.equal(surface.getState().configDirty, true);
        assert.deepEqual(rowNames(root), ['分身配置', '主配置', '第三配置']);
        assert.deepEqual(surface.getState().config.presetNames, ['分身配置', '主配置', '第三配置']);

        // 边界上再按 ↑ 不动、不保存
        fire(dom, rowOf(root, '分身配置').querySelector('[data-preset-drag]'), 'keydown', { key: 'ArrowUp' });
        await flushTasks();
        assert.equal(holder.patches.length, 1);
    } finally {
        mounted?.surface.destroy();
        dom.restore();
    }
});

test('a failed reorder save rolls the list back to the saved order', async () => {
    const dom = installDom();
    let mounted;
    try {
        mounted = await mountListSurface(dom, threePresets(), {
            saveSettings: async () => ({ ok: false, error: '磁盘写入失败' }),
            saveStateResetMs: 5000, // 别让状态复位定时器抢在断言前
        });
        const { root, surface } = mounted;
        fire(dom, rowOf(root, '第三配置').querySelector('[data-preset-drag]'), 'keydown', { key: 'ArrowUp' });
        assert.deepEqual(rowNames(root), ['主配置', '第三配置', '分身配置']);
        await flushTasks();
        await flushTasks();
        assert.deepEqual(rowNames(root), ['主配置', '分身配置', '第三配置']);
        assert.deepEqual(surface.getState().config.presetNames, ['主配置', '分身配置', '第三配置']);
        assert.equal(surface.getState().configSave.status, 'error');
    } finally {
        mounted?.surface.destroy();
        dom.restore();
    }
});

test('reorder never writes global edits that switching rows carried into the in-memory config', () => {
    const dom = installDom();
    const root = dom.document.querySelector('#root');
    const stored = threePresets();
    const state = {
        config: normalizeAgentConfig(stored),
        configDraft: null,
        configDirty: false,
        configFormSyncPending: true,
        configPage: 'main',
        configSave: { status: 'idle', requestId: '', error: '' },
        modelOptionsByProvider: {},
        pullStateByProvider: {},
    };
    const saves = [];
    let panel;
    try {
        // First-party markup under test.
        // eslint-disable-next-line no-unsanitized/property
        root.innerHTML = buildAgentSettingsPanelMarkup({
            presetLayout: 'list',
            presetNames: state.config.presetNames,
            currentPresetName: state.config.currentPresetName,
        });
        panel = createAgentSettingsPanel({
            state,
            presetLayout: 'list',
            presetListKit: PRESET_KIT,
            render: () => panel.syncConfigToForm(root),
            saveConfig: (payload) => { saves.push(payload); return { ok: true }; },
        });
        panel.syncConfigToForm(root);
        panel.bindSettingsPanelEvents(root);

        // 未保存地把 JS API 权限改成 deny，再点另一行：state.config 里会掺进 deny
        const permission = root.querySelector('#xb-assistant-jsapi-permission');
        permission.value = 'deny';
        fire(dom, permission, 'change');
        fire(dom, rowOf(root, '分身配置').querySelector('.xb-assistant-preset-name'), 'click');
        assert.equal(state.config.jsApiPermission, 'deny');

        fire(dom, rowOf(root, '第三配置').querySelector('[data-preset-drag]'), 'keydown', { key: 'ArrowUp' });
        assert.equal(saves.length, 1);
        assert.equal(saves[0].payload.jsApiPermission, 'allow');
        assert.equal(saves[0].payload.currentPresetName, '主配置');
        assert.equal(saves[0].preserveDraft, true);
        assert.deepEqual(Object.keys(saves[0].payload.presets), ['主配置', '第三配置', '分身配置']);
        // 草稿里的未保存编辑仍在
        assert.equal(state.configDraft.jsApiPermission, 'deny');
        assert.equal(state.configDraft.currentPresetName, '分身配置');
    } finally {
        panel?.destroy();
        dom.restore();
    }
});

test('reorder is refused when integer-like preset names would be forced to the front', async () => {
    const dom = installDom();
    let mounted;
    try {
        const base = buildStoredSettings();
        mounted = await mountListSurface(dom, buildStoredSettings({
            currentPresetName: '2',
            delegatePresetName: '2',
            presets: { 2: base.presets.主配置, 乙: base.presets.分身配置, 甲: base.presets.分身配置 },
        }));
        const { root, holder, toasts } = mounted;
        assert.deepEqual(rowNames(root), ['2', '乙', '甲']);
        // “2” 想被挪到最后：对象键顺序存不住
        fire(dom, rowOf(root, '2').querySelector('[data-preset-drag]'), 'keydown', { key: 'ArrowDown' });
        await flushTasks();
        assert.equal(holder.patches.length, 0);
        assert.deepEqual(rowNames(root), ['2', '乙', '甲']);
        assert.match(toasts.at(-1), /纯数字/);
        // 非数字名称之间的顺序仍然可以调
        fire(dom, rowOf(root, '甲').querySelector('[data-preset-drag]'), 'keydown', { key: 'ArrowUp' });
        await flushTasks();
        await flushTasks();
        assert.equal(holder.patches.length, 1);
        assert.deepEqual(Object.keys(holder.stored.presets), ['2', '甲', '乙']);
    } finally {
        mounted?.surface.destroy();
        dom.restore();
    }
});

test('duplicate copies the saved content under a unique name right after the row, without touching the draft', async () => {
    const dom = installDom();
    let mounted;
    try {
        mounted = await mountListSurface(dom, threePresets({
            '主配置 副本': { provider: 'google', modelConfigs: { google: { model: 'taken' } } },
        }));
        const { root, surface, holder } = mounted;
        const modelInput = root.querySelector('#xb-assistant-model');
        modelInput.value = 'unsaved-edit';
        fire(dom, modelInput, 'input');

        fire(dom, rowOf(root, '主配置').querySelector('[data-preset-action="duplicate"]'), 'click');
        await flushTasks();
        await flushTasks();

        assert.equal(holder.patches.length, 1);
        const names = Object.keys(holder.stored.presets);
        assert.deepEqual(names, ['主配置', '主配置 副本 2', '分身配置', '第三配置', '主配置 副本']);
        assert.equal(holder.stored.presets['主配置 副本 2'].modelConfigs['openai-compatible'].model, 'old-model');
        // 副本是深拷贝
        assert.notEqual(holder.stored.presets['主配置 副本 2'], holder.stored.presets.主配置);
        assert.deepEqual(rowNames(root), names);
        assert.equal(root.querySelector('#xb-assistant-model').value, 'unsaved-edit');
        assert.equal(surface.getState().configDraft.currentPresetName, '主配置');
        assert.equal(rowOf(root, '主配置').classList.contains('is-selected'), true);
    } finally {
        mounted?.surface.destroy();
        dom.restore();
    }
});

test('rename keeps the row position, refuses an existing name and keeps the unsaved draft', async () => {
    const dom = installDom();
    let mounted;
    try {
        mounted = await mountListSurface(dom, threePresets());
        const { root, surface, holder, toasts } = mounted;
        const modelInput = root.querySelector('#xb-assistant-model');
        modelInput.value = 'unsaved-edit';
        fire(dom, modelInput, 'input');

        dom.window.prompt = () => '第三配置';
        fire(dom, rowOf(root, '分身配置').querySelector('[data-preset-action="rename"]'), 'click');
        await flushTasks();
        assert.equal(holder.patches.length, 0);
        assert.match(toasts.at(-1), /已存在同名预设/);

        dom.window.prompt = () => '  改名后  ';
        fire(dom, rowOf(root, '分身配置').querySelector('[data-preset-action="rename"]'), 'click');
        await flushTasks();
        await flushTasks();
        assert.equal(holder.patches.length, 1);
        assert.deepEqual(Object.keys(holder.stored.presets), ['主配置', '改名后', '第三配置']);
        // 分身预设名跟着改，当前预设不变
        assert.equal(holder.stored.delegatePresetName, '改名后');
        assert.equal(holder.stored.currentPresetName, '主配置');
        assert.deepEqual(rowNames(root), ['主配置', '改名后', '第三配置']);
        assert.equal(root.querySelector('#xb-assistant-model').value, 'unsaved-edit');
        assert.equal(surface.getState().configDraft.currentPresetName, '主配置');

        // 改名的是选中行：草稿里的名字跟着走，表单内容不动
        dom.window.prompt = () => '主配置改';
        fire(dom, rowOf(root, '主配置').querySelector('[data-preset-action="rename"]'), 'click');
        await flushTasks();
        await flushTasks();
        assert.deepEqual(Object.keys(holder.stored.presets), ['主配置改', '改名后', '第三配置']);
        assert.equal(holder.stored.currentPresetName, '主配置改');
        assert.equal(surface.getState().configDraft.currentPresetName, '主配置改');
        assert.equal(rowOf(root, '主配置改').classList.contains('is-selected'), true);
        assert.equal(root.querySelector('#xb-assistant-model').value, 'unsaved-edit');
    } finally {
        mounted?.surface.destroy();
        dom.restore();
    }
});

test('delete targets the clicked row, asks for confirmation and keeps the selection and draft when another row is removed', async () => {
    const dom = installDom();
    let mounted;
    try {
        mounted = await mountListSurface(dom, threePresets());
        const { root, surface, holder } = mounted;
        const modelInput = root.querySelector('#xb-assistant-model');
        modelInput.value = 'unsaved-edit';
        fire(dom, modelInput, 'input');

        dom.window.confirm = () => false;
        fire(dom, rowOf(root, '第三配置').querySelector('[data-preset-action="delete"]'), 'click');
        await flushTasks();
        assert.equal(holder.patches.length, 0);
        assert.deepEqual(rowNames(root), ['主配置', '分身配置', '第三配置']);

        dom.window.confirm = () => true;
        fire(dom, rowOf(root, '第三配置').querySelector('[data-preset-action="delete"]'), 'click');
        await flushTasks();
        await flushTasks();
        assert.equal(holder.patches.length, 1);
        assert.deepEqual(Object.keys(holder.stored.presets), ['主配置', '分身配置']);
        assert.deepEqual(rowNames(root), ['主配置', '分身配置']);
        assert.equal(rowOf(root, '主配置').classList.contains('is-selected'), true);
        assert.equal(root.querySelector('#xb-assistant-model').value, 'unsaved-edit');
        assert.equal(surface.getState().configDraft.currentPresetName, '主配置');
    } finally {
        mounted?.surface.destroy();
        dom.restore();
    }
});

test('deleting the selected row selects its neighbour; the last remaining preset cannot be deleted', async () => {
    const dom = installDom();
    let mounted;
    try {
        mounted = await mountListSurface(dom, threePresets());
        const { root, surface, holder, toasts } = mounted;
        dom.window.confirm = () => true;

        // 选中中间一行再删它：原位置顶上来的“第三配置”被选中，表单换成它的内容
        fire(dom, rowOf(root, '分身配置').querySelector('.xb-assistant-preset-name'), 'click');
        fire(dom, rowOf(root, '分身配置').querySelector('[data-preset-action="delete"]'), 'click');
        await flushTasks();
        await flushTasks();
        assert.deepEqual(Object.keys(holder.stored.presets), ['主配置', '第三配置']);
        // 选中只是草稿层面的切换：落盘的“当前预设”没被删，保持不变
        assert.equal(holder.stored.currentPresetName, '主配置');
        assert.equal(surface.getState().configDraft.currentPresetName, '第三配置');
        assert.equal(root.querySelector('#xb-assistant-model').value, 'third-model');
        assert.equal(rowOf(root, '第三配置').classList.contains('is-selected'), true);

        // 再删一个后只剩一套：剩下那行的删除项被禁用
        fire(dom, rowOf(root, '主配置').querySelector('[data-preset-action="delete"]'), 'click');
        await flushTasks();
        await flushTasks();
        assert.deepEqual(rowNames(root), ['第三配置']);
        const lastDelete = rowOf(root, '第三配置').querySelector('[data-preset-action="delete"]');
        assert.equal(lastDelete.hasAttribute('disabled'), true);
        // 即使被强行点到（去掉 disabled），也拒绝并提示，不保存
        const patchesBefore = holder.patches.length;
        lastDelete.removeAttribute('disabled');
        fire(dom, lastDelete, 'click');
        await flushTasks();
        assert.equal(holder.patches.length, patchesBefore);
        assert.match(toasts.at(-1), /至少要保留一套预设/);
        assert.deepEqual(rowNames(root), ['第三配置']);
    } finally {
        mounted?.surface.destroy();
        dom.restore();
    }
});

test('the row menu button opens and closes the shared card menu', async () => {
    const dom = installDom();
    let mounted;
    try {
        mounted = await mountListSurface(dom, threePresets());
        const { root } = mounted;
        const row = rowOf(root, '分身配置');
        const button = row.querySelector('[data-preset-action="menu"]');
        const menu = row.querySelector('[role="menu"]');
        assert.equal(menu.hasAttribute('hidden'), true);
        fire(dom, button, 'click');
        assert.equal(menu.hasAttribute('hidden'), false);
        assert.equal(button.getAttribute('aria-expanded'), 'true');
        assert.equal(menu.style.position, 'fixed');
        fire(dom, button, 'click');
        assert.equal(menu.hasAttribute('hidden'), true);
        assert.equal(button.getAttribute('aria-expanded'), 'false');
    } finally {
        mounted?.surface.destroy();
        dom.restore();
    }
});

test('while a save is in flight, row operations are ignored with a hint', async () => {
    const dom = installDom();
    let mounted;
    let release;
    try {
        mounted = await mountListSurface(dom, threePresets(), {
            saveSettings: () => new Promise((resolve) => { release = () => resolve({ ok: true, config: threePresets() }); }),
        });
        const { root, toasts } = mounted;
        fire(dom, rowOf(root, '主配置').querySelector('[data-preset-drag]'), 'keydown', { key: 'ArrowDown' });
        assert.deepEqual(rowNames(root), ['分身配置', '主配置', '第三配置']);
        // 保存未返回时再排一次：被拒绝，列表保持
        fire(dom, rowOf(root, '第三配置').querySelector('[data-preset-drag]'), 'keydown', { key: 'ArrowUp' });
        assert.deepEqual(rowNames(root), ['分身配置', '主配置', '第三配置']);
        assert.match(toasts.at(-1), /正在保存/);
        release();
        await flushTasks();
    } finally {
        mounted?.surface.destroy();
        dom.restore();
    }
});
