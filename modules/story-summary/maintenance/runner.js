import { loadSharedAgentSettings } from '../../agent-core/settings-repository.js';
import { resolveActiveProviderConfig, isSillyTavernProvider } from '../../agent-core/provider-resolution.js';
import { buildProviderAssistantToolCallMessage, buildProviderToolResultMessage, resolveResultToolCalls, dropInvalidatedThinkingFromMessage } from '../../agent-core/runtime/protocol.js';
import { getMemoryMaintenancePrompt, getMemoryChatPrompt, MEMORY_RESPONSE_REPAIR, MEMORY_SAVE_RECOVERY } from './prompt.js';
import { MEMORY_TOOLS, READ_MAINTENANCE_TOOL, RECOVER_MAINTENANCE_SAVE_TOOL } from './tools.js';
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
    onFinish, onRecover, readCurrent, summaryStyle, limits: requestedLimits = REVIEW_LIMITS, runId = memoryRunId(), createSummaryAdapter, countTokens } = {}) {
    const limits = { ...REVIEW_LIMITS, ...requestedLimits };
    const calls = [], receipts = [];
    const tools = [...(session ? MEMORY_TOOLS : []), ...(mode === 'chat' || readMaintenance ? [READ_MAINTENANCE_TOOL] : [])];
    const basePrompt = mode === 'chat' ? getMemoryChatPrompt(summaryStyle) : getMemoryMaintenancePrompt(summaryStyle);
    let systemPrompt = basePrompt, lastRequestPrompt;
    let messages = [], responses = null, outcome = { status: 'turn_limit', summary: '' }, failure = null;
    let finalRanges, summaryAdapter, rulesMeasurement;
    let correctionUsed = false, finalized = false, saveAttempted = false, recovery = null;
    const taskForModel = () => session?.task({ includeStaged: true }) || null;
    // Recovery belongs to this execution, not reusable or summarized conversation history.
    const requestPrompt = () => recovery
        ? `${systemPrompt}\n\n${MEMORY_SAVE_RECOVERY}\n${JSON.stringify({ saveState: recovery })}` : systemPrompt;
    const savedCount = () => session?.savedCount || 0;
    const stagedCount = () => session?.stagedCount || 0;
    const progress = action => onProgress({ runId, action, calls: calls.length, saved: savedCount(), staged: stagedCount() });
    const finishPayload = () => ({ session, calls, runId, mode });
    const recoveryState = error => ({ state: error.uncertain ? 'unknown' : 'not_saved', error: memoryRunError(error, config),
        saved: savedCount(), staged: stagedCount(), receiptIds: error.receiptIds || (error.receiptId ? [error.receiptId] : []),
        ...(error.records ? { records: error.records } : {}) });
    function acceptSave(saved) {
        requireMemory(saved?.current && saved.receipt, 'save_unavailable');
        session.acknowledge(saved);
        receipts.push(...(saved.receipts || [saved.receipt]).map(receipt => receipt.id));
        if (saved.outcome) outcome = { ...outcome, ...saved.outcome };
        finalRanges = saved.ranges;
        finalized = true;
        recovery = null;
        failure = null;
    }
    async function finish() {
        if (finalized || !session || !(mode === 'auto' || session.hasPending)) return true;
        if (!onFinish && !session.hasPending) return true;
        requireMemory(typeof onFinish === 'function', 'save_unavailable');
        session.conclude(outcome);
        saveAttempted = true;
        progress('saving');
        try {
            const saved = await onFinish(finishPayload());
            acceptSave(saved);
            return true;
        } catch (error) {
            if (error.confirmed && error.commitResult) {
                acceptSave(error.commitResult);
                failure = error;
                outcome = { ...outcome, status: 'failed', code: error.code, error: memoryRunError(error, config) };
                return true;
            }
            failure = error;
            if (!error.uncertain && (['conflict', 'cancelled'].includes(error.code)
                || signal?.aborted && error.code === 'metadata_not_saved')) {
                session.discard();
                finalized = true;
                recovery = null;
                outcome = { status: signal?.aborted || error.code === 'cancelled' ? 'cancelled' : 'failed',
                    code: error.code, error: memoryRunError(error, config), summary: '' };
                return true;
            }
            recovery = recoveryState(error);
            if (!tools.includes(RECOVER_MAINTENANCE_SAVE_TOOL)) tools.push(RECOVER_MAINTENANCE_SAVE_TOOL);
            rulesMeasurement = null;
            return false;
        }
    }

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
    const context = createMemoryContext({ config, signal, limits, countTokens, systemPrompt: requestPrompt, tools,
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
    async function executeTool(toolCall, editFailed) {
        if (toolCall.name === 'CompleteMaintenance' && editFailed) throw new MemoryMaintenanceError('edit_failed', '', 'from');
        const definition = tools.find(tool => tool.function.name === toolCall.name);
        requireMemory(definition, 'unknown_tool', toolCall.name, 'name');
        const args = JSON.parse(toolCall.arguments);
        if (['ReadMaintenance', 'RecoverMaintenanceSave'].includes(toolCall.name)) {
            const normalized = normalizeToolArguments(args, definition.function.parameters);
            validateToolArguments(normalized, definition.function.parameters);
            if (toolCall.name === 'ReadMaintenance') {
                requireMemory(typeof readMaintenance === 'function', 'diagnostics_unavailable');
                return await readMaintenance(normalized);
            }
            if (!recovery) return { state: finalized ? 'confirmed' : 'not_needed', saved: savedCount(), staged: stagedCount(), receiptIds: receipts };
            requireMemory(typeof onRecover === 'function', 'save_unavailable');
            if (normalized.action === 'retry') requireMemory(recovery.state === 'not_saved', 'save_retry_unconfirmed');
            progress('checking_save');
            try {
                const result = await onRecover({ ...finishPayload(), ...normalized });
                if (result.state === 'confirmed') {
                    acceptSave(result);
                    return { state: 'confirmed', saved: savedCount(), staged: stagedCount(), receiptIds: receipts };
                }
                recovery = { ...recovery, ...result, saved: savedCount(), staged: stagedCount() };
                return recovery;
            } catch (error) {
                if (error.confirmed && error.commitResult) {
                    acceptSave(error.commitResult);
                    failure = error;
                    return { state: 'confirmed', saved: savedCount(), staged: stagedCount(), receiptIds: receipts, error: memoryRunError(error, config) };
                }
                if (recovery.state === 'unknown' && error.code !== 'metadata_not_saved') error.uncertain = true;
                failure = error;
                recovery = recoveryState(error);
                return recovery;
            }
        }
        requireMemory(session, 'no_boundary');
        const repairingConflict = recovery?.state === 'not_saved' && recovery.error?.code === 'memory_updated';
        if ((recovery && !repairingConflict) || finalized) requireMemory(!['EditMemory', 'CompleteMaintenance'].includes(toolCall.name), 'save_recovery_required');
        const current = await readCurrent?.();
        requireMemory(!signal?.aborted, 'cancelled');
        const result = session.runTool(toolCall.name, args, current);
        if (repairingConflict && ['EditMemory', 'CompleteMaintenance'].includes(toolCall.name) && ['staged', 'unchanged'].includes(result.status)) {
            recovery = null;
            failure = null;
            saveAttempted = false;
        }
        return result;
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
            systemPrompt = `${basePrompt}\n\n${memoryChatMaterial(taskForModel(), limits.turns)}`;
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
            if (lastRequestPrompt !== undefined && lastRequestPrompt !== requestPrompt()) {
                messages = messages.map(dropInvalidatedThinkingFromMessage);
                responses = null;
            }
            let measured = await context.count(messages);
            if (measured.tokens >= Math.min(limits.compactTokens, limits.inputTokens)) {
                progress('compacting');
                const compacted = mode === 'chat' ? await context.compactChat(messages)
                    : await context.compact(messages, taskForModel(), limits.turns - calls.length);
                messages = compacted.messages;
                if (mode === 'auto') {
                    const first = JSON.parse(messages[0].content);
                    first.callsRemaining = limits.turns - calls.length;
                    messages[0].content = JSON.stringify(first);
                } else systemPrompt = `${basePrompt}\n\n${memoryChatMaterial(taskForModel(), limits.turns - calls.length)}`;
                measured = await context.count(messages);
                responses = null;
            }
            requireMemory(measured.tokens <= limits.inputTokens, 'input_limit');
            await reportContext(measured);
            onProgress({ runId, action: recovery ? 'checking_save' : 'thinking', calls: calls.length + 1, saved: savedCount(), staged: stagedCount() });
            const request = { systemPrompt: requestPrompt(), tools, toolChoice: 'auto', messages };
            lastRequestPrompt = request.systemPrompt;
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
                if (recovery) { outcome.summary = result.text; break; }
                outcome = { status: mode === 'auto' && session.task({ includeStaged: true }).pending.length ? 'partial' : 'completed', summary: result.text };
                if (!await finish() && !signal?.aborted && calls.length < limits.turns) {
                    responses = null;
                    continue;
                }
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
                    try { response = await executeTool(toolCall, editFailed); }
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
    // Cancellation/model failure still submits completed valid work once. A save
    // already attempted is resolved only through the explicit recovery path.
    if (!saveAttempted && !finalized && session && (mode === 'auto' || session.hasPending)) {
        try { await finish(); }
        catch (error) { failure = error; recovery = recoveryState(error); }
    }
    if (failure?.confirmed) outcome = { ...outcome, status: 'failed', code: failure.code, error: memoryRunError(failure, config) };
    if (recovery) outcome = { ...outcome, status: recovery.state === 'unknown' ? 'unconfirmed' : 'failed',
        code: recovery.error?.code, error: recovery.error };
    const questionIndex = messages.findLastIndex(message => message.role === 'user');
    return { ...outcome, mode, calls, runId, receipts, saved: savedCount(), staged: stagedCount(), ranges: finalRanges || session?.task() || null,
        messages, replayBeforeTurn: mode === 'chat' ? messages.slice(0, Math.max(0, questionIndex)) : [],
        ...(failure ? { error: { ...memoryRunError(failure, config), ...(failure.uncertain ? { uncertain: true } : {}),
            ...(failure.receiptId ? { receiptId: failure.receiptId } : {}) } } : {}) };
}
