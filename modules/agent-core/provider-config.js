import { AnthropicAdapter } from './adapters/anthropic.js';
import { GoogleAdapter } from './adapters/google.js';
import { OpenAICompatibleAdapter } from './adapters/openai-compatible.js';
import { OpenAIResponsesAdapter } from './adapters/openai-responses.js';
import { SillyTavernClaudeAdapter } from './adapters/sillytavern-claude.js';
import { SillyTavernGoogleAdapter } from './adapters/sillytavern-google.js';
import { SillyTavernOpenAICompatibleAdapter } from './adapters/sillytavern-openai-compatible.js';
import { isSillyTavernProvider } from './provider-resolution.js';
import { assertRuntimeReasoning } from './reasoning-capabilities.js';

export * from './provider-resolution.js';

export function createAgentAdapter(providerConfig = {}, options = {}) {
    if (!providerConfig.apiKey && !isSillyTavernProvider(providerConfig.provider)) {
        throw new Error(options.missingApiKeyMessage || '请先填写当前模型配置的 API Key。');
    }
    assertRuntimeReasoning(providerConfig.reasoning || {});
    switch (providerConfig.provider) {
        case 'sillytavern-openai-compatible':
            return new SillyTavernOpenAICompatibleAdapter(providerConfig);
        case 'sillytavern-claude':
            return new SillyTavernClaudeAdapter(providerConfig);
        case 'sillytavern-google':
            return new SillyTavernGoogleAdapter(providerConfig);
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
