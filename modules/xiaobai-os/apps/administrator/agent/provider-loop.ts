import { resolveResultToolCalls } from '../../../../agent-core/runtime/protocol.js';
import type { AgentMessage } from '../../../../agent-core/runtime/conversation.js';
import type { XiaobaiOsAgentGateway } from '../../../capabilities/agent/gateway.js';
import { parseToolArguments, ToolArgumentsError } from '../../../capabilities/agent/tool-arguments.js';
import type { ManagementTool } from '../../../capabilities/management/index.js';
import { safePromptJson } from '../../../capabilities/maintenance/prompt-safety.js';
import { ADMINISTRATOR_POLICY as POLICY } from '../domain/policy.js';
import { TOOL_NOT_LOADED } from './tool-loader.js';
import { administratorToolCallKey } from '../application/identity.js';
import type { AdministratorContextUsage, AdministratorLive } from '../domain/types.js';
import { administratorContext, administratorTurnMessages, contextUsage, retainedAdministratorTurns, summarizeAdministrator,
    type AdministratorHistory, type AgentRecord } from './history.js';

// These are provider protocol errors, not a guessed window size or a generic HTTP 400.
export function isAdministratorContextOverflow(error: unknown): boolean {
    if (!error || typeof error !== 'object') { return false; }
    const value = error as { status?: number; code?: string; message?: string; error?: { code?: string } };
    return [value.code, value.error?.code].includes('context_length_exceeded')
        || [400, 413, 422].includes(value.status ?? 0) && /maximum context length|context (?:window|length).*(?:exceed|too (?:long|large))|prompt is too long|input token count.*exceeds/iu.test(value.message ?? '');
}

export async function runAdministratorLoop(options: {
    gateway: XiaobaiOsAgentGateway; config: unknown; system: string; prefix: AgentRecord[];
    request: AgentRecord; requestForCounting: AgentRecord; imageCount: number;
    getTools(): ManagementTool['definition'][]; state: AdministratorHistory; signal: AbortSignal;
    execute(name: string, args: unknown, callId: string, messageIndex: number): Promise<unknown>;
    save(): Promise<void>;
    onText(text: string): void; onPhase(phase: AdministratorLive['phase']): void;
    onContext(usage: AdministratorContextUsage): void;
    onToolPreview?(names: string[]): void;
}): Promise<string> {
    const { state, signal } = options;
    const turn = state.turns.at(-1)!;
    let agent = await options.gateway.openSession(options.config);
    let responses: AgentRecord[] | undefined;
    let overflowRetried = false;
    let rounds = 0;
    let previousTools: ManagementTool['definition'][] | undefined;
    const usage = (tools = options.getTools()) => {
        const projected = administratorContext(state, options.requestForCounting);
        return contextUsage(options.system, tools, options.prefix, projected, options.imageCount, agent.providerConfig);
    };
    async function save() {
        await options.save();
        signal.throwIfAborted();
    }
    async function compact(): Promise<boolean> {
        const before = usage().used;
        const retained = retainedAdministratorTurns(state);
        const last = retained.filter(item => item.turn !== turn || item.toolOffset < turn.toolMessages.length).at(-1);
        if (!last) { return false; }
        options.onPhase('summarizing');
        const text = await summarizeAdministrator({ gateway: options.gateway, config: options.config, signal,
            summary: state.summary?.text ?? '', messages: retained.flatMap(item => administratorTurnMessages(item.turn, item.toolOffset, item.turn === turn ? options.requestForCounting : undefined)) });
        signal.throwIfAborted();
        if (!text) { throw new Error('administrator_summary_failed'); }
        const previous = state.summary;
        state.summary = { text, throughId: last.turn.id, throughToolMessage: last.turn === turn ? turn.toolMessages.length : null };
        if (usage().used >= before) { state.summary = previous; throw new Error('administrator_summary_failed'); }
        await save();
        return true;
    }
    async function executeTools(result: AgentRecord, calls: NonNullable<AgentMessage['toolCalls']>, tools: ManagementTool['definition'][]) {
        options.onPhase('tools');
        const advertised = new Set(tools.map(tool => tool.function.name));
        const assistant: AgentMessage = { role: 'assistant', content: String(result.text ?? ''), toolCalls: calls,
            ...(result.providerPayload && typeof result.providerPayload === 'object' ? { providerPayload: result.providerPayload as AgentRecord } : {}) };
        const results: AgentMessage[] = calls.map(call => ({ role: 'tool', toolName: call.name, toolCallId: call.id,
            content: safePromptJson({ ok: false, status: 'failed', code: 'tool_not_executed' }) }));
        // A complete protocol group is saved before dispatch; placeholders explicitly mean no execution.
        turn.toolMessages.push(assistant, ...results);
        options.onText('');
        await save();
        const responses: AgentRecord[] = [];
        for (const [index, call] of calls.entries()) {
            signal.throwIfAborted();
            let args: Record<string, unknown> | undefined;
            let argumentFailure: ReturnType<ToolArgumentsError['result']> | undefined;
            try { args = parseToolArguments(call.arguments); }
            catch (error) {
                if (!(error instanceof ToolArgumentsError)) { throw error; }
                argumentFailure = error.result();
            }
            // Until the executor returns, no outcome is confirmed, including across write-receipt saves.
            results[index].content = safePromptJson({ ok: false, status: 'unconfirmed', code: 'tool_result_unconfirmed' });
            const value = advertised.has(call.name)
                ? argumentFailure ?? await options.execute(call.name, args, administratorToolCallKey(rounds, call.id), turn.toolMessages.indexOf(results[index])) : TOOL_NOT_LOADED;
            results[index].content = safePromptJson(value);
            responses.push({ id: call.id, name: call.name, response: value, ...(Object.hasOwn(call, 'providerId') ? { providerId: call.providerId } : {}) });
            await save();
        }
        return responses;
    }
    try {
        while (rounds < POLICY.maxToolRounds) {
            signal.throwIfAborted();
            const tools = options.getTools();
            const compacted = usage().used >= POLICY.summaryTrigger && await compact();
            const toolsChanged = previousTools && (previousTools.length !== tools.length || previousTools.some((tool, index) => tool !== tools[index]));
            if (responses && (compacted || agent.supportsSessionToolLoop && toolsChanged)) { agent = await options.gateway.openSession(options.config); responses = undefined; }
            const currentUsage = usage(tools); options.onContext(currentUsage);
            if (currentUsage.used > POLICY.inputBudget) { throw new Error('administrator_context_full'); }
            options.onPhase('waiting'); options.onText('');
            let result: AgentRecord;
            let streaming = true;
            let text = '', thoughts = '', callSnapshot = '';
            try {
                const native = agent.supportsSessionToolLoop && responses !== undefined;
                previousTools = tools;
                result = await agent.run({ systemPrompt: options.system, messages: native ? [] : [...options.prefix, ...administratorContext(state, options.request).messages],
                    tools, signal, ...(native ? { toolResponses: responses } : {}), onStreamProgress: snapshot => {
                        if (!streaming || signal.aborted) { return; }
                        const nextText = typeof snapshot.text === 'string' ? snapshot.text : text;
                        const nextThoughts = Array.isArray(snapshot.thoughts) ? snapshot.thoughts.map(item => String(item.text ?? '')).join('\n') : thoughts;
                        const nextCalls = Array.isArray(snapshot.toolCalls) ? JSON.stringify(snapshot.toolCalls) : callSnapshot;
                        // Native activity also covers reasoning with no visible summary. Other
                        // adapters expose partial/cumulative snapshots: only new content is evidence.
                        if (snapshot.activity === 'waiting' || snapshot.activity === 'thinking' || snapshot.activity === 'replying') {
                            options.onPhase(snapshot.activity);
                        } else if (snapshot.activity === 'tool-call' || nextCalls !== callSnapshot && Array.isArray(snapshot.toolCalls) && snapshot.toolCalls.length) {
                            options.onPhase('tools');
                        } else if (nextText && nextText !== text) { options.onPhase('replying'); }
                        else if (nextThoughts && nextThoughts !== thoughts) { options.onPhase('thinking'); }
                        text = nextText; thoughts = nextThoughts; callSnapshot = nextCalls;
                        options.onText(text);
                        if (Array.isArray(snapshot.toolCalls)) {
                            options.onToolPreview?.(snapshot.toolCalls.map(call => String(call.name ?? '')).filter(Boolean));
                        }
                    } });
            } catch (error) {
                streaming = false;
                if (!signal.aborted && !overflowRetried && isAdministratorContextOverflow(error) && await compact()) {
                    overflowRetried = true; agent = await options.gateway.openSession(options.config); responses = undefined; continue;
                }
                throw error;
            } finally { streaming = false; }
            rounds++;
            options.onToolPreview?.([]);
            signal.throwIfAborted();
            if (result.refused) { throw new Error('administrator_model_refused'); }
            const calls = resolveResultToolCalls(result, agent.providerConfig, { fallbackPrefix: `administrator-${rounds}` }) as NonNullable<AgentMessage['toolCalls']>;
            if (!calls.length) {
                const text = String(result.text ?? '').trim();
                if (!text) { throw new Error('administrator_empty_response'); }
                turn.assistant = text;
                turn.status = 'finished'; turn.error = '';
                if (result.providerPayload && typeof result.providerPayload === 'object') { turn.assistantPayload = result.providerPayload as AgentRecord; }
                options.onText(text);
                return text;
            }
            if (calls.length > 24) { throw new Error('administrator_tool_batch_too_large'); }
            responses = await executeTools(result, calls, tools);
        }
        throw new Error('administrator_tool_round_limit');
    } finally {
        options.onContext(usage());
    }
}
