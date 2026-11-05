import { AnthropicAdapter } from './adapters/anthropic.js';
import { GoogleAdapter } from './adapters/google.js';
import { OpenAICompatibleAdapter } from './adapters/openai-compatible.js';
import { OpenAIResponsesAdapter } from './adapters/openai-responses.js';
import { SillyTavernClaudeAdapter } from './adapters/sillytavern-claude.js';
import { SillyTavernGoogleAdapter } from './adapters/sillytavern-google.js';
import { SillyTavernOpenAICompatibleAdapter } from './adapters/sillytavern-openai-compatible.js';
import { SillyTavernVertexAdapter } from './adapters/sillytavern-vertex.js';
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
    assertRuntimeReasoning(providerConfig.reasoning || {});
    switch (providerConfig.provider) {
        case 'sillytavern-openai-compatible':
            return createSillyTavernAdapter(SillyTavernOpenAICompatibleAdapter, providerConfig, options);
        case 'sillytavern-claude':
            return createSillyTavernAdapter(SillyTavernClaudeAdapter, providerConfig, options);
        case 'sillytavern-google':
            return createSillyTavernAdapter(SillyTavernGoogleAdapter, providerConfig, options);
        case 'sillytavern-vertex':
            return createSillyTavernAdapter(SillyTavernVertexAdapter, providerConfig, options);
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
