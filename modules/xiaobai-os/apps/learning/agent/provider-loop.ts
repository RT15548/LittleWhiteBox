import { buildProviderMessagesFromHistory, filterThoughtsForTurn, resolveResultToolCalls } from '../../../../agent-core/runtime/protocol.js';
import { createStreamingMessageController } from '../../../../agent-core/runtime/streaming-messages.js';
import type { AgentMessage } from '../../../../agent-core/runtime/conversation.js';
import type { LearningMessage } from './messages.js';
import { estimateConversationTokens } from '../../../../agent-core/runtime/context-tokens.js';
import { isResponseTruncated } from '../../../../agent-core/runtime/response-completion.js';
import type { XiaobaiOsAgentSession } from '../../../capabilities/agent/gateway.js';
import { classifyProviderFailure } from '../../../capabilities/agent/provider-failure.js';
import { safePromptJson } from '../../../capabilities/maintenance/prompt-safety.js';
import type { LearningFailureDetails, LearningProgress } from '../application/feedback.js';
import { isLearningContextOverflow, learningHistoryMessage, learningTurnMessages, type LearningTurn } from './history.js';
import { LEARNING_PRESERVED_TURNS, LEARNING_SUMMARY_TRIGGER_TOKENS, summariseLearningHistory } from './history-compaction.js';

type RecordValue = Record<string, unknown>;
export type LearningLoopResult = { status: 'finished'; messages: RecordValue[]; removedTurns: number }
    | { status: 'failed'; reason: string; details: LearningFailureDetails } | { status: 'cancelled' };

/** Same text/tool continuation as ebook; classroom data validation belongs to the tools. */
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
    transcript?: LearningMessage[];
    onResponseStart?: (message: LearningMessage) => void;
    onResponseComplete?: (message: LearningMessage) => boolean;
    onMessages?: () => void;
}): Promise<LearningLoopResult> {
    const { signal, guard } = options;
    let agent = options.agent;
    const history = [...(options.history ?? [])];
    let summary = options.historySummary ?? '';
    let summaryExhausted = false;
    let removedTurns = 0;
    const state = { messages: options.transcript ?? [] };
    const outputStart = state.messages.length;
    const tools = new Set(options.tools.map(tool => String((tool.function as RecordValue).name)));
    let responses: RecordValue[] | undefined;
    let previousResult = '';
    let repeated = 0;
    let reminderSent = false;
    let pendingReminder = '';
    const finalReminder = 'The tool results are available. Reply to the learner with the outcome or the obstacle that needs their input.';
    const cancelled = () => signal.aborted || !guard();
    let open = true;
    const stream = createStreamingMessageController({ state, minRenderIntervalMs: 80,
        render: () => { if (open && !cancelled()) { options.onMessages?.(); } },
        filterThoughtsForCurrentTurn: (thoughts: unknown[], currentMessage: AgentMessage) => filterThoughtsForTurn(thoughts, state.messages, { currentMessage }),
    });
    const protocolMessages = () => buildProviderMessagesFromHistory(state.messages.slice(outputStart), {
        includeMessage: (message: AgentMessage) => message.role !== 'assistant' || !message.error && (!!message.content || !!message.toolCalls?.length),
    });
    const finishStream = () => {
        for (const message of state.messages.slice(outputStart)) {
            if (message.streaming) { stream.finalizeStreamingAssistantMessage(message); }
        }
    };
    signal.addEventListener('abort', finishStream, { once: true });
    let progress: LearningProgress = { stage: 'provider', round: 1 };
    const advance = (next: LearningProgress) => { progress = next; options.onProgress?.(next); };
    const failure = (reason: string, cause?: unknown): LearningLoopResult => cancelled() ? { status: 'cancelled' }
        : { status: 'failed', reason, details: { ...progress, cause } };
    const replay = (candidateSummary = summary, candidateHistory = history) => [
        ...(options.prefix ?? []), ...(candidateSummary ? [learningHistoryMessage(candidateSummary)] : []),
        ...candidateHistory.flatMap(learningTurnMessages), ...options.messages, ...protocolMessages()];
    const contextTokens = (candidateMessages = replay()) => estimateConversationTokens({
        messages: [{ role: 'system', content: options.systemPrompt }, ...candidateMessages],
        tools: [...options.tools], providerConfig: agent.providerConfig,
    });
    async function compact(round: number) {
        if (summaryExhausted) { return false; }
        advance({ stage: 'summary', round });
        // Prefer keeping recent exchanges verbatim, but a short oldest exchange alone may not shrink.
        for (let count = Math.max(1, history.length - LEARNING_PRESERVED_TURNS); count <= history.length; count++) {
            const next = await summariseLearningHistory({ summary, turns: history.slice(0, count),
                openSession: options.reopen!, signal, guard: () => !cancelled() });
            if (cancelled()) { return false; }
            // Compare complete teacher requests, preserving the real latest-user/tool replay boundary.
            if (contextTokens(replay(next, history.slice(count))) >= contextTokens()) { continue; }
            summary = next;
            history.splice(0, count); removedTurns += count;
            options.onCompact?.(count, summary);
            return true;
        }
        // Only this run owns this marker: tools cannot change the earlier exchanges being summarised.
        summaryExhausted = true;
        return false;
    }
    try {
        for (let round = 1; !cancelled(); round++) {
            if (cancelled()) { return { status: 'cancelled' }; }
            let result: RecordValue;
            let assistant: LearningMessage | null = null;
            try {
                let compacted = false;
                while (options.reopen && history.length && !summaryExhausted && contextTokens() > LEARNING_SUMMARY_TRIGGER_TOKENS) {
                    const changed = await compact(round);
                    if (cancelled()) { return { status: 'cancelled' }; }
                    if (!changed) { break; }
                    compacted = true;
                }
                if (compacted && (responses || pendingReminder)) { advance({ stage: 'session', round }); agent = await options.reopen!(); responses = undefined; pendingReminder = ''; }
                if (cancelled()) { return { status: 'cancelled' }; }
                advance({ stage: 'provider', round });
                const continueSession = agent.supportsSessionToolLoop && (responses !== undefined || !!pendingReminder);
                const requestMessages = continueSession ? [] : replay();
                assistant = stream.createStreamingAssistantMessage();
                options.onResponseStart?.(assistant);
                let streaming = true;
                try {
                    result = await agent.run({ systemPrompt: options.systemPrompt, tools: options.tools, signal,
                        messages: requestMessages,
                        ...(continueSession && responses ? { toolResponses: responses } : {}),
                        ...(continueSession && pendingReminder ? { finalAnswerReminderText: pendingReminder } : {}),
                        onStreamProgress: snapshot => {
                            if (!streaming || cancelled() || !assistant) { return; }
                            stream.updateStreamingAssistantMessage(assistant, { content: snapshot.text, thoughts: snapshot.thoughts, toolCalls: snapshot.toolCalls });
                            stream.scheduleStreamRender();
                        } });
                } finally { streaming = false; }
                pendingReminder = '';
            } catch (error) {
                if (cancelled()) { return { status: 'cancelled' }; }
                if (assistant) { assistant.error = true; stream.finalizeStreamingAssistantMessage(assistant); }
                if (progress.stage === 'summary') { return failure('learning_summary_failed', error); }
                if (isResponseTruncated(error)) { return failure('learning_response_truncated', error); }
                if (isLearningContextOverflow(error)) {
                    if (history.length && options.reopen) {
                        try { if (!await compact(round)) { return failure('learning_context_full', error); } }
                        catch (cause) { return failure('learning_summary_failed', cause); }
                        if (cancelled()) { return { status: 'cancelled' }; }
                        advance({ stage: 'session', round });
                        try { agent = await options.reopen(); }
                        catch (cause) { return failure(classifyProviderFailure(cause), cause); }
                        responses = undefined; pendingReminder = '';
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
                stream.finalizeStreamingAssistantMessage(assistant!, {
                    content: typeof result.text === 'string' && result.text ? result.text : assistant!.content,
                    ...(Array.isArray(result.thoughts) && result.thoughts.length ? { thoughts: result.thoughts } : {}),
                    toolCalls: calls, providerPayload: result.providerPayload,
                });
                if (result.refused === true) { return failure('provider-failed'); }
                if (!calls.length) {
                    const text = assistant!.content.trim();
                    if (!text && !assistant!.thoughts?.length) { state.messages.splice(state.messages.indexOf(assistant!), 1); }
                    if (!text && state.messages.some(message => message.role === 'tool') && !reminderSent) {
                        reminderSent = true;
                        responses = undefined;
                        pendingReminder = finalReminder;
                        state.messages.push({ role: 'user', content: finalReminder });
                        continue;
                    }
                    if (!text) { return failure('learning_empty_response'); }
                    if (options.onResponseComplete?.(assistant!) === false) { return failure('learning_help_undeclared'); }
                    stream.scheduleStreamRender();
                    return { status: 'finished', messages: protocolMessages(), removedTurns };
                }
                responses = [];
                for (const call of calls) {
                    if (cancelled()) { return { status: 'cancelled' }; }
                    advance({ stage: 'tools', round, tool: call.name });
                    const entry: AgentMessage = { role: 'tool', toolCallId: call.id, toolName: call.name, content: '', streaming: true };
                    state.messages.push(entry); stream.scheduleStreamRender();
                    let args: unknown = null;
                    try { args = JSON.parse(call.arguments); } catch { /* The owning tool records an invalid proposal. */ }
                    let value: unknown;
                    try { value = tools.has(call.name) ? await options.executeTool(call.name, args)
                        : { ok: false, message: 'Choose a tool from the supplied definitions.', tools: [...tools] }; }
                    catch (error) {
                        if (cancelled()) { return { status: 'cancelled' }; }
                        entry.error = true; entry.content = '工具执行中断，请查看本轮状态。'; entry.streaming = false;
                        stream.scheduleStreamRender();
                        return failure('learning_tool_failed', error);
                    }
                    if (cancelled()) { return { status: 'cancelled' }; }
                    entry.content = safePromptJson(value); entry.streaming = false;
                    stream.scheduleStreamRender();
                    responses.push({ id: call.id, name: call.name, response: value,
                        ...(Object.hasOwn(call, 'providerId') ? { providerId: call.providerId } : {}) });
                }
                options.onResponseComplete?.(assistant!);
                stream.scheduleStreamRender();
                const signature = JSON.stringify(calls.map((call, index) => ({ name: call.name, arguments: call.arguments, response: responses![index].response })));
                repeated = signature === previousResult ? repeated + 1 : 1;
                previousResult = signature;
                if (repeated >= 3) { return failure('learning_stalled'); }
            } catch (error) { return failure('learning_protocol_failed', error); }
        }
        return { status: 'cancelled' };
    } finally {
        open = false;
        signal.removeEventListener('abort', finishStream);
        finishStream();
    }
}
