import test from 'node:test';
import assert from 'node:assert/strict';

import {
    DEFAULT_JSAPI_PERMISSION,
    normalizeAgentConfig,
    normalizeAgentSettings,
} from '../../agent-core/config.js';
import { resolveActiveProviderConfig } from '../../agent-core/provider-config.js';

test('assistant settings default jsApiPermission to deny', () => {
    const settings = normalizeAgentSettings({});
    const config = normalizeAgentConfig({});

    assert.equal(settings.jsApiPermission, DEFAULT_JSAPI_PERMISSION);
    assert.equal(config.jsApiPermission, DEFAULT_JSAPI_PERMISSION);
});

test('assistant config preserves explicit jsApiPermission', () => {
    const settings = normalizeAgentSettings({
        jsApiPermission: 'allow',
    });
    const config = normalizeAgentConfig({
        jsApiPermission: 'allow',
    });

    assert.equal(settings.jsApiPermission, 'allow');
    assert.equal(config.jsApiPermission, 'allow');
});

test('assistant config can route delegates to a separate preset', () => {
    const config = normalizeAgentConfig({
        currentPresetName: '主助手',
        delegatePresetName: '审稿分身',
        presets: {
            主助手: {
                provider: 'openai-compatible',
                modelConfigs: {
                    'openai-compatible': {
                        baseUrl: 'https://main.example/v1',
                        model: 'main-model',
                        apiKey: 'main-key',
                    },
                },
            },
            审稿分身: {
                provider: 'google',
                modelConfigs: {
                    google: {
                        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
                        model: 'delegate-model',
                        apiKey: 'delegate-key',
                    },
                },
            },
        },
    });

    assert.equal(config.currentPresetName, '主助手');
    assert.equal(config.delegatePresetName, '审稿分身');
    assert.equal(resolveActiveProviderConfig(config).model, 'main-model');
    assert.equal(resolveActiveProviderConfig(config, { role: 'delegate' }).model, 'delegate-model');
});

test('assistant delegate config can override provider details directly', () => {
    const config = normalizeAgentConfig({
        currentPresetName: '主助手',
        presets: {
            主助手: {
                provider: 'openai-compatible',
                modelConfigs: {
                    'openai-compatible': {
                        baseUrl: 'https://main.example/v1',
                        model: 'main-model',
                        apiKey: 'main-key',
                    },
                },
            },
        },
        delegateConfig: {
            provider: 'openai-compatible',
            modelConfigs: {
                'openai-compatible': {
                    baseUrl: 'https://delegate.example/v1',
                    model: 'delegate-direct-model',
                    apiKey: 'delegate-key',
                    toolMode: 'tagged-json',
                },
            },
        },
    });
    const providerConfig = resolveActiveProviderConfig(config, { role: 'delegate' });

    assert.equal(providerConfig.baseUrl, 'https://delegate.example/v1');
    assert.equal(providerConfig.model, 'delegate-direct-model');
    assert.equal(providerConfig.toolMode, 'tagged-json');
});

test('assistant provider config can omit temperature while keeping the saved value', () => {
    const config = normalizeAgentConfig({
        currentPresetName: '写作',
        presets: {
            写作: {
                provider: 'openai-compatible',
                modelConfigs: {
                    'openai-compatible': {
                        baseUrl: 'https://main.example/v1',
                        model: 'main-model',
                        apiKey: 'main-key',
                        temperature: 0.85,
                        sendTemperature: false,
                    },
                },
            },
        },
        delegateConfig: {
            provider: 'anthropic',
            modelConfigs: {
                anthropic: {
                    baseUrl: 'https://delegate.example',
                    model: 'delegate-model',
                    apiKey: 'delegate-key',
                    temperature: 0.1,
                    sendTemperature: true,
                },
            },
        },
    });

    const savedProviderConfig = config.presets['写作'].modelConfigs['openai-compatible'];
    assert.equal(savedProviderConfig.temperature, 0.85);
    assert.equal(savedProviderConfig.sendTemperature, false);
    assert.equal(resolveActiveProviderConfig(config).temperature, undefined);
    assert.equal(resolveActiveProviderConfig(config).sendTemperature, false);
    assert.equal(resolveActiveProviderConfig(config, { role: 'delegate' }).temperature, 0.1);
    assert.equal(resolveActiveProviderConfig(config, { role: 'delegate' }).sendTemperature, true);
});

test('assistant config uses one global Tavily setting for main and delegate runs', () => {
    const config = normalizeAgentConfig({
        tavilyApiKey: 'global-tavily-key',
        tavilyBaseUrl: 'https://search.global.example/',
        currentPresetName: '主助手',
        presets: {
            主助手: {
                provider: 'openai-compatible',
                modelConfigs: {
                    'openai-compatible': {
                        baseUrl: 'https://main.example/v1',
                        model: 'main-model',
                        apiKey: 'main-key',
                    },
                },
            },
        },
        delegateConfig: {
            provider: 'google',
            modelConfigs: {
                google: {
                    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
                    model: 'delegate-model',
                    apiKey: 'delegate-key',
                },
            },
        },
    });

    assert.equal(resolveActiveProviderConfig(config).tavilyApiKey, 'global-tavily-key');
    assert.equal(resolveActiveProviderConfig(config).tavilyBaseUrl, 'https://search.global.example');
    assert.equal(resolveActiveProviderConfig(config, { role: 'delegate' }).tavilyApiKey, 'global-tavily-key');
    assert.equal(resolveActiveProviderConfig(config, { role: 'delegate' }).tavilyBaseUrl, 'https://search.global.example');
});

test('assistant config lifts legacy preset Tavily setting into the global field', () => {
    const config = normalizeAgentConfig({
        currentPresetName: '主助手',
        presets: {
            主助手: {
                provider: 'openai-compatible',
                tavilyApiKey: 'legacy-preset-tavily-key',
                tavilyBaseUrl: 'https://legacy.search.example/',
                modelConfigs: {
                    'openai-compatible': {
                        baseUrl: 'https://main.example/v1',
                        model: 'main-model',
                        apiKey: 'main-key',
                    },
                },
            },
        },
    });

    assert.equal(config.presets['主助手'].tavilyApiKey, undefined);
    assert.equal(config.tavilyApiKey, 'legacy-preset-tavily-key');
    assert.equal(resolveActiveProviderConfig(config, { role: 'delegate' }).tavilyApiKey, 'legacy-preset-tavily-key');
    assert.equal(resolveActiveProviderConfig(config).tavilyBaseUrl, 'https://legacy.search.example');
});
