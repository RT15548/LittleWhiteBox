import { AnthropicAdapter } from './adapters/anthropic.js';
import { GoogleAdapter } from './adapters/google.js';
import { OpenAICompatibleAdapter } from './adapters/openai-compatible.js';
import { OpenAIResponsesAdapter } from './adapters/openai-responses.js';
import { SillyTavernClaudeAdapter } from './adapters/sillytavern-claude.js';
import { SillyTavernGoogleAdapter } from './adapters/sillytavern-google.js';
import { SillyTavernOpenAICompatibleAdapter } from './adapters/sillytavern-openai-compatible.js';
import { isSillyTavernProvider } from './provider-resolution.js';
import { assertRuntimeReasoning } from './reasoning-capabilities.js';
import { assertHostChatCompletionsClient } from '../../shared/host-llm/chat-completions/client.js';

export * from './provider-resolution.js';

function createSillyTavernAdapter(Adapter, providerConfig, options) {
    if (!Object.hasOwn(options, 'hostClient')) {
        return new Adapter(providerConfig);
    }
    return new Adapter(
        providerConfig,
        assertHostChatCompletionsClient(options.hostClient),
    );
}

export function createAgentAdapter(providerConfig = {}, options = {}) {
    if (!providerConfig.apiKey && !isSillyTavernProvider(providerConfig.provider)) {
        throw new Error(options.missingApiKeyMessage || '请先填写当前模型配置的 API Key。');
    }
    assertRuntimeReasoning(providerConfig.reasoning || {});
    switch (providerConfig.provider) {
        case 'sillytavern-openai-compatible':
            return createSillyTavernAdapter(SillyTavernOpenAICompatibleAdapter, providerConfig, options);
        case 'sillytavern-claude':
            return createSillyTavernAdapter(SillyTavernClaudeAdapter, providerConfig, options);
        case 'sillytavern-google':
            return createSillyTavernAdapter(SillyTavernGoogleAdapter, providerConfig, options);
        case 'openai-responses':
            return new OpenAIResponsesAdapter(providerConfig);
        case 'anthropic':
            return new AnthropicAdapter(providerConfig);
        case 'google':
            return new GoogleAdapter(providerConfig);
        case 'openai-compatible':
        default:
            return new OpenAICompatibleAdapter(providerConfig);
    }
}
