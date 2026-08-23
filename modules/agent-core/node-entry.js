import { createAgentAdapter as createSharedAgentAdapter } from './provider-config.js';
import { isSillyTavernProvider } from './provider-resolution.js';

export {
    normalizeAgentConfig,
    normalizeAgentSettings,
} from './config.js';
export {
    AGENT_REQUEST_TIMEOUT_MS,
    PROVIDER_OPTIONS,
    getProviderLabel,
    getToolModeLabel,
    isSillyTavernProvider,
    resolveActiveProviderConfig,
} from './provider-resolution.js';
export { redactRequestSecrets } from './adapters/request-inspection.js';
export {
    getReasoningEffortOptions,
    getReasoningModeOptions,
    resolveReasoningCapability,
    resolveRuntimeReasoning,
} from './reasoning-capabilities.js';
export {
    REASONING_MODE_OPTIONS,
    normalizeReasoningConfig,
} from './reasoning-config.js';
export {
    buildProviderAssistantToolCallMessage,
    buildProviderToolResultMessage,
    resolveResultToolCalls,
} from './runtime/protocol.js';
export {
    assertHostChatCompletionsClient,
    createHostChatCompletionsClient,
} from '../../shared/host-llm/chat-completions/client.js';

export function createAgentAdapter(providerConfig = {}, options = {}) {
    if (isSillyTavernProvider(providerConfig.provider) && !Object.hasOwn(options, 'hostClient')) {
        throw new TypeError('Node 酒馆渠道必须注入当前 Draw Run 的 Host Client。');
    }
    return createSharedAgentAdapter(providerConfig, options);
}
