import { buildProviderAssistantToolCallMessage, buildProviderToolResultMessage, resolveResultToolCalls } from '../../../../agent-core/runtime/protocol.js';
import { estimateConversationTokens } from '../../../../agent-core/runtime/context-tokens.js';
import type { XiaobaiOsAgentSession } from '../../../capabilities/agent/gateway.js';
import { classifyProviderFailure } from '../../../capabilities/agent/provider-failure.js';
import { safePromptJson } from '../../../capabilities/maintenance/prompt-safety.js';
import type { LearningFailureDetails, LearningProgress } from '../application/feedback.js';
import { isLearningContextOverflow, learningHistoryMessage, type LearningTurn } from './history.js';
import { LEARNING_PRESERVED_TURNS, LEARNING_SUMMARY_TRIGGER_TOKENS, summariseLearningHistory } from './history-compaction.js';

type RecordValue = Record<string, unknown>;
export type LearningLoopResult = { status: 'finished'; text: string; messages: RecordValue[]; removedTurns: number }
    | { status: 'failed'; reason: string; details: LearningFailureDetails } | { status: 'cancelled' };

/** Learning owns its finish semantics; provider-specific wire formats stay in Agent Core. */
export async function runLearningProviderLoop(options: {
    agent: XiaobaiOsAgentSession; systemPrompt: string; messages: readonly RecordValue[];
    tools: readonly RecordValue[]; signal: AbortSignal; guard: () => boolean;
    executeTool: (name: string, args: unknown) => unknown | Promise<unknown>;
    history?: readonly LearningTurn[];
    prefix?: readonly RecordValue[];
    historySummary?: string;
    reopen?: () => Promise<XiaobaiOsAgentSession>;
    onCompact?: (removed: number, summary: string) => void;
    onProgress?: (progress: LearningProgress) => void;
}): Promise<LearningLoopResult> {
    const { signal, guard } = options;
    let agent = options.agent;
    const history = [...(options.history ?? [])];
    let summary = options.historySummary ?? '';
    let summaryExhausted = false;
    let removedTurns = 0;
    const messages: RecordValue[] = [];
    const tools = new Set(options.tools.map(tool => String((tool.function as RecordValue).name)));
    let responses: RecordValue[] | undefined;
    let previousResult = '';
    let repeated = 0;
    const cancelled = () => signal.aborted || !guard();
    let progress: LearningProgress = { stage: 'provider', round: 1 };
    const advance = (next: LearningProgress) => { progress = next; options.onProgress?.(next); };
    const failure = (reason: string, cause?: unknown): LearningLoopResult => cancelled() ? { status: 'cancelled' }
        : { status: 'failed', reason, details: { ...progress, cause } };
    const replay = () => [...(options.prefix ?? []), ...(summary ? [learningHistoryMessage(summary)] : []),
        ...history.flatMap(turn => turn.messages), ...options.messages, ...messages];
    async function compact(round: number) {
        if (summaryExhausted) { return false; }
        advance({ stage: 'summary', round });
        // Prefer keeping recent exchanges verbatim, but a short oldest exchange alone may not shrink.
        for (let count = Math.max(1, history.length - LEARNING_PRESERVED_TURNS); count <= history.length; count++) {
            const next = await summariseLearningHistory({ summary, turns: history.slice(0, count),
                openSession: options.reopen!, signal, guard: () => !cancelled() });
            if (cancelled()) { return false; }
            if (next === null) { continue; }
            summary = next;
            history.splice(0, count); removedTurns += count;
            options.onCompact?.(count, summary);
            return true;
        }
        // Only this run owns this marker: tools cannot change the earlier exchanges being summarised.
        summaryExhausted = true;
        return false;
    }
    for (let round = 1; !cancelled(); round++) {
        if (cancelled()) { return { status: 'cancelled' }; }
        let result: RecordValue;
        try {
            let compacted = false;
            while (options.reopen && history.length && !summaryExhausted && estimateConversationTokens({
                messages: [{ role: 'system', content: options.systemPrompt }, ...replay()], tools: [...options.tools],
            }) > LEARNING_SUMMARY_TRIGGER_TOKENS) {
                const changed = await compact(round);
                if (cancelled()) { return { status: 'cancelled' }; }
                if (!changed) { break; }
                compacted = true;
            }
            if (compacted && responses) { advance({ stage: 'session', round }); agent = await options.reopen!(); responses = undefined; }
            if (cancelled()) { return { status: 'cancelled' }; }
            advance({ stage: 'provider', round });
            result = await agent.run({ systemPrompt: options.systemPrompt, tools: options.tools, signal,
                messages: agent.supportsSessionToolLoop && responses ? [] : replay(),
                ...(agent.supportsSessionToolLoop && responses ? { toolResponses: responses } : {}) });
        } catch (error) {
            if (cancelled()) { return { status: 'cancelled' }; }
            if (progress.stage === 'summary') { return failure('learning_summary_failed', error); }
            if (isLearningContextOverflow(error)) {
                if (history.length && options.reopen) {
                    try { if (!await compact(round)) { return failure('learning_context_full', error); } }
                    catch (cause) { return failure('learning_summary_failed', cause); }
                    if (cancelled()) { return { status: 'cancelled' }; }
                    advance({ stage: 'session', round });
                    try { agent = await options.reopen(); }
                    catch (cause) { return failure(classifyProviderFailure(cause), cause); }
                    responses = undefined;
                    round--;
                    continue;
                }
                return failure('learning_context_full', error);
            }
            return failure(classifyProviderFailure(error), error);
        }
        if (cancelled()) { return { status: 'cancelled' }; }
        try {
            const calls = resolveResultToolCalls(result, agent.providerConfig, { fallbackPrefix: `learning-${round}` });
            if (!calls.length) {
                const text = typeof result.text === 'string' ? result.text.trim() : '';
                if (!text) { return failure('learning_empty_response'); }
                messages.push({ role: 'assistant', content: text });
                return { status: 'finished', text, messages, removedTurns };
            }
            messages.push(buildProviderAssistantToolCallMessage(result, calls));
            responses = [];
            for (const call of calls) {
                if (cancelled()) { return { status: 'cancelled' }; }
                advance({ stage: 'tools', round, tool: call.name });
                let args: unknown = null;
                try { args = JSON.parse(call.arguments); } catch { /* The owning tool records an invalid proposal. */ }
                let value: unknown;
                try { value = tools.has(call.name) ? await options.executeTool(call.name, args)
                    : { ok: false, message: 'Choose a tool from the supplied definitions.', tools: [...tools] }; }
                catch (error) { return failure('learning_tool_failed', error); }
                if (cancelled()) { return { status: 'cancelled' }; }
                messages.push(buildProviderToolResultMessage({ toolCallId: call.id, toolName: call.name, content: safePromptJson(value) }));
                responses.push({ id: call.id, name: call.name, response: value,
                    ...(Object.hasOwn(call, 'providerId') ? { providerId: call.providerId } : {}) });
            }
            const signature = JSON.stringify(calls.map((call, index) => ({ name: call.name, arguments: call.arguments, response: responses![index].response })));
            repeated = signature === previousResult ? repeated + 1 : 1;
            previousResult = signature;
            if (repeated >= 3) { return failure('learning_stalled'); }
        } catch (error) { return failure('learning_protocol_failed', error); }
    }
    return { status: 'cancelled' };
}
