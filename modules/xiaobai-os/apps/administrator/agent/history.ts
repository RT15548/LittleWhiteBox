import { estimateConversationTokens, estimateTokenCount } from '../../../../agent-core/runtime/context-tokens.js';
import { buildProviderMessagesFromHistory } from '../../../../agent-core/runtime/protocol.js';
import type { XiaobaiOsAgentGateway } from '../../../capabilities/agent/gateway.js';
import { safePromptJson } from '../../../capabilities/maintenance/prompt-safety.js';
import { ADMINISTRATOR_POLICY as POLICY } from '../domain/policy.js';
import type { AdministratorContextUsage, AdministratorData, AdministratorTurn } from '../domain/types.js';
import { ADMINISTRATOR_SUMMARY_PROMPT } from './prompt.js';
import { ADMINISTRATOR_REFERENCE_TEXT } from './reference-data.js';

export type AgentRecord = Record<string, unknown>;
export type AdministratorHistory = Pick<AdministratorData, 'turns' | 'summary'>;
export function administratorTurnMessages(turn: AdministratorTurn, toolOffset = 0, request?: AgentRecord): AgentRecord[] {
    return [
        ...(request ? [request] : turn.user ? [{ role: 'user', content: turn.user.text + (turn.user.image ? `\n${ADMINISTRATOR_REFERENCE_TEXT.image(turn.user.image.name)}` : '') }] : []),
        ...buildProviderMessagesFromHistory(turn.toolMessages.slice(toolOffset)),
        ...(turn.assistant ? [{ role: 'assistant', content: turn.assistant, ...(turn.assistantPayload ? { providerPayload: turn.assistantPayload } : {}) }] : []),
        ...(!request && (turn.operations.length || turn.status !== 'finished') ? [{ role: 'system', content: `${ADMINISTRATOR_REFERENCE_TEXT.operations}: ${safePromptJson({ status: turn.status, operations: turn.operations })}` }] : []),
    ];
}
export function retainedAdministratorTurns(data: AdministratorHistory) {
    const boundary = data.summary ? data.turns.findIndex(turn => turn.id === data.summary!.throughId) : -1;
    return data.turns.flatMap((turn, index) => index < boundary || index === boundary && data.summary?.throughToolMessage === null ? []
        : [{ turn, toolOffset: index === boundary ? data.summary!.throughToolMessage! : 0 }]);
}
/** One projection feeds replay and both parts of the context meter. */
export function administratorContext(data: AdministratorHistory, request?: AgentRecord) {
    const latest = data.turns.at(-1)?.id;
    const messages: AgentRecord[] = referenceSummary(data.summary?.text ?? '');
    let runtime: AgentRecord[] = [];
    for (const { turn, toolOffset } of retainedAdministratorTurns(data)) {
        const current = turn.id === latest;
        const projected = administratorTurnMessages(turn, toolOffset, current ? request : undefined);
        messages.push(...projected);
        if (current) {
            const userCount = request || turn.user ? 1 : 0;
            runtime = projected.slice(userCount, userCount + turn.toolMessages.length - toolOffset);
        }
    }
    return { messages, runtime };
}
export function historyBefore(data: AdministratorData, turnId: string) {
    const end = data.turns.findIndex(turn => turn.id === turnId);
    const boundary = data.summary ? data.turns.findIndex(turn => turn.id === data.summary!.throughId) : -1;
    // Regenerating an older reply cannot use a summary that includes that reply or later messages.
    const useSummary = boundary >= 0 && boundary < end;
    return { summary: useSummary ? data.summary : null, turns: data.turns.slice(0, end) };
}
export function referenceSummary(text: string): AgentRecord[] {
    return text ? [{ role: 'system', content: `${ADMINISTRATOR_REFERENCE_TEXT.summary}:\n${safePromptJson({ summary: text })}` }] : [];
}
export function contextUsage(system: string, tools: readonly AgentRecord[], prefix: readonly AgentRecord[], context: ReturnType<typeof administratorContext>, imageCount: number, providerConfig: AgentRecord): AdministratorContextUsage {
    const runtime = new Set(context.runtime);
    const entries = [
        ...[{ role: 'system', content: system }, ...prefix].map(message => ({ message, part: 1 })),
        ...context.messages.map(message => ({ message, part: runtime.has(message) ? 3 : 2 })),
    ];
    // Keep every role in place: native reasoning replay depends on the last USER,
    // even when measuring only one category. Tools use the actual request config.
    const count = (part: number) => estimateConversationTokens({ tools: [...tools], providerConfig,
        messages: entries.map(entry => entry.part <= part ? entry.message : { role: entry.message.role, content: '' }) });
    const toolTokens = count(0), rulesAndTools = count(1), withoutRuntime = count(2), total = count(3);
    const images = imageCount * POLICY.imageTokens;
    return { used: total + images, limit: POLICY.inputBudget, trigger: POLICY.summaryTrigger,
        rules: rulesAndTools - toolTokens, tools: toolTokens, history: withoutRuntime - rulesAndTools, runtime: total - withoutRuntime, images };
}
function summaryMessage({ role, content, tool_calls, tool_call_id, toolName, providerPayload }: AgentRecord): AgentRecord {
    const payload = providerPayload as {
        openaiCompatibleMessage?: AgentRecord;
        anthropicContent?: AgentRecord[];
        googleContent?: { parts?: AgentRecord[] };
        googleContents?: { parts?: AgentRecord[] }[];
    } | undefined;
    // Native payloads duplicate text and calls. Only their readable reasoning is summary material.
    // Google exposes the last content both individually and in the complete contents array.
    const google = payload?.googleContents ?? (payload?.googleContent ? [payload.googleContent] : []);
    const reasoning = [
        payload?.openaiCompatibleMessage?.reasoning_content,
        payload?.openaiCompatibleMessage?.reasoning_text,
        payload?.openaiCompatibleMessage?.reasoning,
        payload?.openaiCompatibleMessage?.thinking,
        ...(payload?.anthropicContent ?? []).filter(part => part.type === 'thinking').map(part => part.thinking),
        ...google.flatMap(item => (item.parts ?? []).filter(part => part.thought === true).map(part => part.text)),
    ].filter((text): text is string => typeof text === 'string' && text.length > 0).join('\n');
    return { role, content,
        ...(tool_calls ? { tool_calls } : {}),
        ...(tool_call_id ? { tool_call_id } : {}),
        ...(toolName ? { toolName } : {}),
        ...(reasoning ? { reasoning } : {}),
    };
}
export async function summarizeAdministrator(options: { gateway: XiaobaiOsAgentGateway; config: unknown; summary: string; messages: AgentRecord[]; signal: AbortSignal }): Promise<string | null> {
    const input = safePromptJson({ summary: options.summary, exchanges: options.messages.map(summaryMessage) });
    if (estimateTokenCount(ADMINISTRATOR_SUMMARY_PROMPT) + estimateTokenCount(input) >= POLICY.inputBudget) { throw new Error('administrator_context_full'); }
    const session = await options.gateway.openSession(options.config);
    const result = await session.run({ systemPrompt: ADMINISTRATOR_SUMMARY_PROMPT, messages: [{ role: 'user', content: input }], tools: [], signal: options.signal });
    const output = typeof result.text === 'string' ? result.text.trim() : '';
    if (result.refused || !output) { throw new Error('administrator_summary_failed'); }
    return estimateTokenCount(output) < estimateTokenCount(input) ? output : null;
}
