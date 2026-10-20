import { loadSharedAgentSettings } from '../../agent-core/settings-repository.js';
import { resolveActiveProviderConfig, isSillyTavernProvider } from '../../agent-core/provider-resolution.js';
import { buildProviderAssistantToolCallMessage, buildProviderToolResultMessage, resolveResultToolCalls, dropInvalidatedThinkingFromMessage } from '../../agent-core/runtime/protocol.js';
import { MEMORY_MAINTENANCE_PROMPT, MEMORY_CHAT_PROMPT, MEMORY_RESPONSE_REPAIR } from './prompt.js';
import { MEMORY_TOOLS, READ_MAINTENANCE_TOOL } from './tools.js';
import { normalizeToolArguments, validateToolArguments } from './arguments.js';
import { MemoryMaintenanceError, requireMemory } from './errors.js';
import { REVIEW_LIMITS, OPENING_TOKENS } from './limits.js';
import { createMemoryContext } from './context.js';
import { buildMemoryChatMessages, memoryChatMaterial, settleMemoryToolMessages } from './conversation.js';
import { memoryRunError, recordMemoryResponse, recordMemoryToolErrors } from './run-feedback.js';
export { REVIEW_LIMITS } from './limits.js';
export { estimateMemoryChatContext } from './conversation.js';

export async function createSharedMemoryAgent() {
    const settings = await loadSharedAgentSettings();
    const config = resolveActiveProviderConfig(settings);
    requireMemory(config.model?.trim() && (isSillyTavernProvider(config.provider) || config.baseUrl?.trim()), 'not_configured');
    const core = await import('../../agent-core/browser-entry.js');
    const { getRequestHeaders } = await import('../../../../../../../script.js');
    core.setHostChatCompletionsRequestHeadersProvider(() => getRequestHeaders());
    return { adapter: core.createAgentAdapter(config), createSummaryAdapter: () => core.createAgentAdapter(config), config };
}

export const memoryRunId = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');

/** A turn owns its provider session and write baseline; chat history is only material. */
export async function runMemoryAgent(session, { adapter, config, signal, onCall = () => {}, onProgress = () => {},
    onStream = () => {}, onContext = () => {}, mode = 'auto', question = '', history = [], readMaintenance,
    onSave, onFinish, readCurrent, limits: requestedLimits = REVIEW_LIMITS, runId = memoryRunId(), createSummaryAdapter, countTokens } = {}) {
    const limits = { ...REVIEW_LIMITS, ...requestedLimits };
    const calls = [], receipts = [];
    const tools = [...(session ? MEMORY_TOOLS : []), ...(mode === 'chat' || readMaintenance ? [READ_MAINTENANCE_TOOL] : [])];
    const basePrompt = mode === 'chat' ? MEMORY_CHAT_PROMPT : MEMORY_MAINTENANCE_PROMPT;
    let systemPrompt = basePrompt;
    let messages = [], responses = null, outcome = { status: 'turn_limit', summary: '' }, failure = null;
    let finalRanges, summaryAdapter, rulesMeasurement;
    let correctionUsed = false;
    const savedCount = () => session?.operations.length || 0;
    const progress = action => onProgress({ runId, action, calls: calls.length, saved: savedCount() });

    async function requestModel(target, request, measured, kind) {
        requireMemory(!signal?.aborted, 'cancelled');
        requireMemory(calls.length < limits.turns, 'turn_limit');
        requireMemory(measured.tokens <= limits.inputTokens, 'input_limit');
        const call = { turn: calls.length + 1, kind, stage: 'request', inputTokens: measured.tokens, tokenSource: measured.source,
            startedAt: Date.now(), provider: config.provider, model: config.model };
        calls.push(call);
        try {
            if (kind === 'maintenance') session?.inputProvided();
            const result = await target.chat({ temperature: config.temperature, maxTokens: config.maxTokens,
                reasoning: config.reasoning, signal, captureRawAssistantMessage: true,
                ...(kind === 'maintenance' ? { onStreamProgress: snapshot => onStream(snapshot) } : {}), ...request });
            recordMemoryResponse(call, result);
            return { result, call };
        } catch (error) {
            call.error = memoryRunError(error, config); call.code = call.error.code;
            onCall({ call, result: null, tools: [] });
            throw error;
        } finally { call.durationMs = Date.now() - call.startedAt; }
    }
    const context = createMemoryContext({ config, signal, limits, countTokens, systemPrompt: () => systemPrompt, tools,
        async summarize(request, measured) {
            requireMemory(typeof createSummaryAdapter === 'function', 'compaction_failed');
            summaryAdapter ||= createSummaryAdapter();
            requireMemory(summaryAdapter !== adapter, 'compaction_failed');
            const { result, call } = await requestModel(summaryAdapter, request, measured, 'compaction');
            onCall({ call, result, tools: [] });
            return result;
        },
    });
    async function reportContext(measured) {
        rulesMeasurement ||= await context.count([], basePrompt, tools);
        const rules = Math.min(measured.tokens, rulesMeasurement.tokens);
        let historyTokens = 0, materialTokens;
        if (mode === 'chat') {
            const start = messages.findLastIndex(message => message.role === 'user');
            const previous = await context.count(messages.slice(0, Math.max(0, start)), basePrompt, tools);
            historyTokens = Math.min(measured.tokens - rules, Math.max(0, previous.tokens - rulesMeasurement.tokens));
            materialTokens = measured.tokens - rules - historyTokens;
        } else {
            const opening = await context.count(messages.slice(0, 1), basePrompt, tools);
            materialTokens = Math.min(measured.tokens - rules, Math.max(0, opening.tokens - rulesMeasurement.tokens));
            historyTokens = measured.tokens - rules - materialTokens;
        }
        onContext({ used: measured.tokens, limit: limits.inputTokens, trigger: limits.compactTokens, source: measured.source,
            sections: { rules, history: historyTokens, material: materialTokens } });
    }
    async function executeTool(toolCall, call, editFailed) {
        if (toolCall.name === 'CompleteMaintenance' && editFailed) throw new MemoryMaintenanceError('edit_failed', '', 'from');
        const definition = tools.find(tool => tool.function.name === toolCall.name);
        requireMemory(definition, 'unknown_tool', toolCall.name, 'name');
        const args = JSON.parse(toolCall.arguments);
        if (toolCall.name === 'ReadMaintenance') {
            const normalized = normalizeToolArguments(args, definition.function.parameters);
            validateToolArguments(normalized, definition.function.parameters);
            requireMemory(typeof readMaintenance === 'function', 'diagnostics_unavailable');
            return await readMaintenance(normalized);
        }
        requireMemory(session, 'no_boundary');
        const current = ['ReadMemory', 'ReadSource', 'SearchSource'].includes(toolCall.name) ? await readCurrent?.() : undefined;
        requireMemory(!signal?.aborted, 'cancelled');
        const response = session.runTool(toolCall.name, args, current);
        if (response.status !== 'staged') return response;
        requireMemory(typeof onSave === 'function', 'save_unavailable');
        call.stage = 'saving';
        try {
            const saved = await onSave({ session, calls: [call], runId, mode });
            requireMemory(saved?.current && saved.receipt, 'save_unavailable');
            session.acknowledge(saved.current);
            receipts.push(saved.receipt.id);
            return { status: 'saved', changed: response.changed, receiptId: saved.receipt.id,
                ...(toolCall.name === 'CompleteMaintenance' ? { task: session.task() } : {}) };
        } catch (error) {
            if (error.uncertain || !(error instanceof MemoryMaintenanceError)
                || ['conflict', 'cancelled', 'invalid_history', 'pending_edit', 'save_unavailable', 'no_boundary'].includes(error.code)) throw error;
            session.discard();
            // Only a known domain conflict is repairable; transport/persistence failures escape.
            return toolError(error);
        }
    }
    function toolError(error) {
        return { status: 'error', ...memoryRunError(error, config),
            ...(error instanceof SyntaxError ? { code: 'invalid_arguments' } : {}), field: error.field || 'arguments',
            ...(error.rejected ? { rejected: error.rejected, unchecked: error.unchecked } : {}),
            ...(error.records ? { records: error.records } : {}), ...(error.expected ? { expected: error.expected } : {}) };
    }

    try {
        requireMemory(['auto', 'chat'].includes(mode), 'invalid_arguments', '', 'mode');
        if (mode === 'chat') {
            requireMemory(typeof question === 'string' && question.trim(), 'invalid_arguments', '', 'question');
            messages = buildMemoryChatMessages(question, history);
            systemPrompt = `${basePrompt}\n\n${memoryChatMaterial(session?.task() || null, limits.turns)}`;
        } else {
            requireMemory(session, 'no_boundary');
            let initialBudget = OPENING_TOKENS;
            messages = [{ role: 'user', content: JSON.stringify({ ...session.initial(), callsRemaining: limits.turns }) }];
            let measured = await context.count(messages), material = await context.count(messages, '', []);
            while ((material.tokens > OPENING_TOKENS || measured.tokens >= Math.min(limits.compactTokens, limits.inputTokens)) && initialBudget > 1) {
                initialBudget = Math.max(1, Math.floor(initialBudget / 2));
                messages = [{ role: 'user', content: JSON.stringify({ ...session.initial(initialBudget), callsRemaining: limits.turns }) }];
                measured = await context.count(messages); material = await context.count(messages, '', []);
            }
            requireMemory(material.tokens <= OPENING_TOKENS, 'input_limit');
            requireMemory(measured.tokens <= limits.inputTokens, 'input_limit');
        }
        while (calls.length < limits.turns) {
            requireMemory(!signal?.aborted, 'cancelled');
            let measured = await context.count(messages);
            if (measured.tokens >= Math.min(limits.compactTokens, limits.inputTokens)) {
                progress('compacting');
                const compacted = mode === 'chat' ? await context.compactChat(messages)
                    : await context.compact(messages, session.task(), limits.turns - calls.length);
                messages = compacted.messages;
                if (mode === 'auto') {
                    const first = JSON.parse(messages[0].content);
                    first.callsRemaining = limits.turns - calls.length;
                    messages[0].content = JSON.stringify(first);
                } else systemPrompt = `${basePrompt}\n\n${memoryChatMaterial(session?.task() || null, limits.turns - calls.length)}`;
                measured = await context.count(messages);
                responses = null;
            }
            requireMemory(measured.tokens <= limits.inputTokens, 'input_limit');
            await reportContext(measured);
            onProgress({ runId, action: 'thinking', calls: calls.length + 1, saved: savedCount() });
            const request = { systemPrompt, tools, toolChoice: 'auto', messages };
            if (adapter.supportsSessionToolLoop && responses) request.toolResponses = responses;
            const { result, call } = await requestModel(adapter, request, measured, 'maintenance');
            let toolCalls;
            try {
                requireMemory(!signal?.aborted, 'cancelled');
                toolCalls = resolveResultToolCalls(result, config);
                if (!toolCalls.length) requireMemory(typeof result.text === 'string' && result.text.trim(), 'empty_response');
            } catch (error) {
                call.error = memoryRunError(error, config); call.code = call.error.code;
                const rejected = (result.toolCalls || []).map(tool => ({ name: tool.name, arguments: tool.arguments,
                    response: { status: 'not_executed', ...call.error } }));
                recordMemoryToolErrors(call, rejected, config);
                onCall({ call, result, tools: rejected });
                if (!['AGENT_TOOL_ARGUMENTS_INVALID', 'empty_response'].includes(error.code)
                    || correctionUsed || signal?.aborted || calls.length >= limits.turns) throw error;
                correctionUsed = true;
                // Never replay the invalid native payload or execute even a partial batch.
                messages = [...messages.map(dropInvalidatedThinkingFromMessage),
                    { role: 'system', content: MEMORY_RESPONSE_REPAIR, memoryResponseRepair: true }];
                responses = null;
                continue;
            }
            requireMemory(!signal?.aborted, 'cancelled');
            onStream({ text: result.text || '', toolCalls });
            messages.push(buildProviderAssistantToolCallMessage(result, toolCalls));
            if (!toolCalls.length) {
                call.stage = 'finished';
                onCall({ call, result, tools: [] });
                outcome = { status: mode === 'auto' && session.task().pending.length ? 'partial' : 'completed', summary: result.text };
                await reportContext(await context.count(messages));
                break;
            }
            responses = [];
            let editFailed = false, activeId;
            const ordered = [...toolCalls.filter(tool => tool.name !== 'CompleteMaintenance'), ...toolCalls.filter(tool => tool.name === 'CompleteMaintenance')];
            try {
                for (const toolCall of ordered) {
                    activeId = toolCall.id;
                    call.stage = 'tools';
                    progress(['EditMemory', 'CompleteMaintenance'].includes(toolCall.name) ? 'editing' : 'reading');
                    requireMemory(!signal?.aborted, 'cancelled');
                    let response;
                    try { response = await executeTool(toolCall, call, editFailed); }
                    catch (error) {
                        if (error.uncertain || (!(error instanceof MemoryMaintenanceError) && !(error instanceof SyntaxError))
                            || ['conflict', 'cancelled', 'invalid_history', 'no_boundary', 'save_unavailable', 'pending_edit'].includes(error.code)) throw error;
                        response = toolError(error);
                    }
                    if (toolCall.name === 'EditMemory' && ['error', 'needs_fix'].includes(response.status)) editFailed = true;
                    response = { ...response, callsRemaining: limits.turns - calls.length };
                    responses.push({ id: toolCall.id, name: toolCall.name, arguments: toolCall.arguments, response,
                        ...(Object.hasOwn(toolCall, 'providerId') ? { providerId: toolCall.providerId } : {}) });
                    messages.push(buildProviderToolResultMessage({ toolCallId: toolCall.id, toolName: toolCall.name, content: JSON.stringify(response) }));
                    activeId = undefined;
                }
                call.stage = 'finished';
            } catch (error) {
                call.error = memoryRunError(error, config); call.code = call.error.code;
                settleMemoryToolMessages(messages, toolCalls, responses, { ...call.error, uncertain: error.uncertain }, activeId);
                throw error;
            } finally {
                recordMemoryToolErrors(call, responses, config);
                onCall({ call, result, tools: responses.map(({ name, arguments: args, response }) => ({ name, arguments: args, response })) });
            }
        }
        if (outcome.status === 'turn_limit') throw new MemoryMaintenanceError('turn_limit');
    } catch (error) {
        failure = error;
        const detail = memoryRunError(error, config);
        outcome = { status: error.uncertain ? 'unconfirmed' : signal?.aborted ? 'cancelled'
            : ['turn_limit', 'input_limit'].includes(error.code) ? error.code : 'failed', code: detail.code, error: detail, summary: '' };
    }
    // Read-only chat answers are not maintenance runs. Completion receipts count
    // as actual saved work even though they contain no record-edit operations.
    if (session && onFinish && !failure?.uncertain && (mode === 'auto' || receipts.length)) {
        session.conclude(outcome);
        try {
            const saved = await onFinish({ session, calls, runId, mode });
            if (saved?.receipt) receipts.push(saved.receipt.id);
            if (saved?.receipt?.outcome) outcome = { ...outcome, ...saved.receipt.outcome };
            finalRanges = saved?.ranges;
        } catch (error) {
            failure = error;
            const detail = memoryRunError(error, config);
            outcome = { status: error.uncertain ? 'unconfirmed' : 'failed', code: detail.code, error: detail, summary: outcome.summary };
        }
    }
    const questionIndex = messages.findLastIndex(message => message.role === 'user');
    return { ...outcome, mode, calls, runId, receipts, saved: savedCount(), ranges: finalRanges || session?.task() || null,
        messages, replayBeforeTurn: mode === 'chat' ? messages.slice(0, Math.max(0, questionIndex)) : [],
        ...(failure ? { error: { ...memoryRunError(failure, config), ...(failure.uncertain ? { uncertain: true } : {}),
            ...(failure.receiptId ? { receiptId: failure.receiptId } : {}) } } : {}) };
}
