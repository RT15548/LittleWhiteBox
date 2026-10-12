import { createAgentAdapter } from '../../agent-core/provider-config.js';
import { pullModelsForProvider } from '../../agent-core/ui/settings-panel.js';
import { setHostChatCompletionsRequestHeadersProvider } from '../../../shared/host-llm/chat-completions/client.js';

type UnknownRecord = Record<string, unknown>;

export interface XiaobaiOsAgentRunRequest {
    providerConfig: UnknownRecord;
    systemPrompt: string;
    messages: readonly UnknownRecord[];
    tools?: readonly UnknownRecord[];
    temperature?: number;
    maxTokens?: number;
    reasoning?: UnknownRecord;
    signal?: AbortSignal;
    onStreamProgress?: (snapshot: UnknownRecord) => void;
    toolResponses?: readonly UnknownRecord[];
    finalAnswerReminderText?: string;
}

export interface XiaobaiOsAgentSession {
    readonly supportsSessionToolLoop: boolean;
    run: (request: Omit<XiaobaiOsAgentRunRequest, 'providerConfig'>) => Promise<UnknownRecord>;
}

export function configureXiaobaiOsAgent(
    options: { requestHeadersProvider?: (() => Record<string, string>) | null } = {},
): void {
    setHostChatCompletionsRequestHeadersProvider(
        typeof options.requestHeadersProvider === 'function' ? options.requestHeadersProvider : null,
    );
}

export function openXiaobaiOsAgentSession(providerConfigValue: UnknownRecord): XiaobaiOsAgentSession {
    const providerConfig = providerConfigValue || {};
    const adapter = createAgentAdapter(providerConfig);
    return Object.freeze({
        supportsSessionToolLoop: adapter.supportsSessionToolLoop === true,
        async run(request: Omit<XiaobaiOsAgentRunRequest, 'providerConfig'>): Promise<UnknownRecord> {
            return await adapter.chat({
                systemPrompt: String(request.systemPrompt || ''),
                messages: Array.isArray(request.messages) ? request.messages : [],
                tools: Array.isArray(request.tools) ? request.tools : [],
                temperature: request.temperature,
                maxTokens: request.maxTokens,
                reasoning: request.reasoning,
                signal: request.signal,
                onStreamProgress: request.onStreamProgress,
                toolResponses: request.toolResponses,
                finalAnswerReminderText: request.finalAnswerReminderText,
            }) as UnknownRecord;
        },
    });
}

export async function runXiaobaiOsAgent(request: XiaobaiOsAgentRunRequest): Promise<UnknownRecord> {
    return await openXiaobaiOsAgentSession(request.providerConfig).run(request);
}

export async function pullXiaobaiOsAgentModels(
    providerConfig: UnknownRecord,
    options: { signal?: AbortSignal } = {},
): Promise<string[]> {
    return await pullModelsForProvider(providerConfig, { signal: options.signal });
}

export async function testXiaobaiOsAgentConnection(
    providerConfig: UnknownRecord,
    options: { signal?: AbortSignal } = {},
): Promise<{ provider: string; model: string; latencyMs: number }> {
    const startedAt = globalThis.performance?.now?.() ?? Date.now();
    const adapter = createAgentAdapter(providerConfig);
    const result = await adapter.chat({
        systemPrompt: '这是一次由用户主动发起的连接测试。只回复 OK。',
        messages: [{ role: 'user', content: 'OK' }],
        tools: [],
        temperature: undefined,
        maxTokens: 1600,
        reasoning: providerConfig.reasoning,
        signal: options.signal,
    }) as UnknownRecord;
    const endedAt = globalThis.performance?.now?.() ?? Date.now();
    return {
        provider: String(result.provider || providerConfig.provider || ''),
        model: String(result.model || providerConfig.model || ''),
        latencyMs: Math.max(0, Math.round(endedAt - startedAt)),
    };
}
