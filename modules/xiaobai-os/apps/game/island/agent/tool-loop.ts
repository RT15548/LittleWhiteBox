import type { XiaobaiOsAgentGateway } from '../../../../capabilities/agent/gateway.js';
import { parseToolArguments, ToolArgumentsError } from '../../../../capabilities/agent/tool-arguments.js';
import { buildProviderAssistantToolCallMessage, resolveResultToolCalls } from '../../../../../agent-core/runtime/protocol.js';
import { estimateConversationTokens } from '../../../../../agent-core/runtime/context-tokens.js';
import { fail, isActionFault } from '../fault.js';
import { AGENT_POLICY as P } from './policy.js';

type RecordValue = Record<string, unknown>;
export interface IslandAgentOptions {
    agent: XiaobaiOsAgentGateway; signal: AbortSignal; guard: () => boolean;
}
export async function runIslandToolLoop(options: IslandAgentOptions & {
    prompt: string; tools: RecordValue[]; initial: RecordValue;
    execute: (name: string, args: RecordValue) => Promise<unknown>;
    complete: () => boolean; terminal?: () => boolean;
}) {
    const { agent, signal, guard, execute, prompt, tools } = options;
    const config = await agent.loadConfig(), session = await agent.openSession(config);
    const messages: RecordValue[] = [{ role: 'user', content: JSON.stringify(options.initial) }];
    let responses: RecordValue[] | undefined;
    for (let round = 0; round < P.rounds; round++) {
        signal.throwIfAborted(); if (!guard()) { fail('stale'); }
        // Count the entire logical request, including tool schemas and retained tool exchanges,
        // even when the provider carries earlier exchanges in its own session.
        const used = estimateConversationTokens({ messages: [{ role: 'system', content: prompt }, ...messages], tools, providerConfig: session.providerConfig });
        if (used > P.inputTokens) { fail('context_full'); }
        const native = session.supportsSessionToolLoop && responses !== undefined;
        const result = await session.run({ systemPrompt: prompt, messages: native ? [] : messages,
            tools, ...(native ? { toolResponses: responses } : {}), signal, maxTokens: P.outputTokens });
        signal.throwIfAborted(); if (!guard()) { fail('stale'); }
        if (result.refused) { fail('agent_refused'); }
        const calls = resolveResultToolCalls(result, session.providerConfig, { fallbackPrefix: `island-${round}` });
        if (!calls.length) {
            if (!options.complete()) { fail('agent_empty'); }
            return;
        }
        if (calls.length > P.callsPerRound) { fail('agent_limit'); }
        messages.push(buildProviderAssistantToolCallMessage(result, calls)); responses = [];
        for (const call of calls) {
            let value: unknown;
            try { value = { ok: true, data: await execute(call.name, parseToolArguments(call.arguments)) }; }
            catch (error) {
                if (error instanceof ToolArgumentsError) { value = error.result(); }
                else if (isActionFault(error) || error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
                    && ['invalid', 'authority', 'memory_unavailable', 'embedding_config'].some(c => error.code === `island_${c}`)) {
                    value = { ok: false, code: error.code };
                } else { throw error; }
            }
            messages.push({ role: 'tool', tool_call_id: call.id, toolName: call.name, content: JSON.stringify(value) });
            responses.push({ id: call.id, name: call.name, response: value, ...(Object.hasOwn(call, 'providerId') ? { providerId: call.providerId } : {}) });
        }
        if (options.terminal?.()) { return; }
    }
    fail('agent_limit');
}
