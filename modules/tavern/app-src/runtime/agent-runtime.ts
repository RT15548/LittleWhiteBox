import type { XbTavernMessage } from '../../shared/message-assembler';
import type { XbTavernResolvedProvider } from './provider';

export interface XbTavernCapabilityRegistry {
    tools: unknown[];
    toolChoice: 'auto' | 'none' | string;
}

export interface XbTavernAgentRuntime {
    provider: XbTavernResolvedProvider;
    capabilities: XbTavernCapabilityRegistry;
    buildChatTask(input: {
        messages: XbTavernMessage[];
        signal?: AbortSignal;
        onStreamProgress?: (snapshot: { text?: string; thoughts?: Array<{ label?: string; text?: string }> }) => void;
    }): {
        messages: XbTavernMessage[];
        tools: unknown[];
        toolChoice: 'auto' | 'none' | string;
        temperature: number;
        maxTokens: number | null;
        signal?: AbortSignal;
        onStreamProgress?: (snapshot: { text?: string; thoughts?: Array<{ label?: string; text?: string }> }) => void;
    };
}

export const EMPTY_XB_TAVERN_CAPABILITY_REGISTRY: XbTavernCapabilityRegistry = Object.freeze({
    tools: [],
    toolChoice: 'none',
});

export function createXbTavernAgentRuntime(
    provider: XbTavernResolvedProvider,
    capabilities: XbTavernCapabilityRegistry = EMPTY_XB_TAVERN_CAPABILITY_REGISTRY,
): XbTavernAgentRuntime {
    return {
        provider,
        capabilities,
        buildChatTask(input) {
            return {
                messages: input.messages,
                tools: capabilities.tools,
                toolChoice: capabilities.toolChoice,
                temperature: provider.temperature,
                maxTokens: provider.maxTokens,
                signal: input.signal,
                onStreamProgress: input.onStreamProgress,
            };
        },
    };
}
