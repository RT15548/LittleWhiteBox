import { loadSharedAgentSettings } from '../../agent-core/settings-repository.js';
import { resolveActiveProviderConfig, isSillyTavernProvider } from '../../agent-core/provider-resolution.js';
import { buildProviderAssistantToolCallMessage, buildProviderToolResultMessage, resolveResultToolCalls } from '../../agent-core/runtime/protocol.js';
import { MEMORY_MAINTENANCE_PROMPT } from './prompt.js';
import { MEMORY_TOOLS } from './tools.js';
import { MemoryMaintenanceError, requireMemory } from './errors.js';
import { REVIEW_LIMITS } from './limits.js';
import { OPENING_TOKENS } from './limits.js';
import { createMemoryContext } from './context.js';
export { REVIEW_LIMITS } from './limits.js';

export async function createSharedMemoryAgent() {
    const settings = await loadSharedAgentSettings();
    const config = resolveActiveProviderConfig(settings);
    requireMemory(config.model?.trim() && (isSillyTavernProvider(config.provider) || config.baseUrl?.trim()), 'not_configured');
    const core = await import('../../agent-core/dist/agent-core-browser.js');
    const { getRequestHeaders } = await import('../../../../../../../script.js');
    core.setHostChatCompletionsRequestHeadersProvider(() => getRequestHeaders());
    return { adapter: core.createAgentAdapter(config), createSummaryAdapter: () => core.createAgentAdapter(config), config };
}

export const memoryRunId = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');

/** One conversation survives reads and confirmed writes until the Agent replies normally. */
export async function runMemoryAgent(session, { adapter, config, signal, onCall = () => {}, onProgress = () => {},
    onSave, onFinish, readCurrent, limits: requestedLimits = REVIEW_LIMITS, runId = memoryRunId(), createSummaryAdapter, countTokens } = {}) {
    const limits = { ...REVIEW_LIMITS, ...requestedLimits };
    const calls = [], receipts = [];
    let messages = [{ role: 'user', content: JSON.stringify({ ...session.initial(), callsRemaining: limits.turns }) }];
    let responses = null, outcome = { status: 'turn_limit', summary: '' }, failure = null;
    let finalRanges;
    let summaryAdapter;
    async function requestModel(target, request, measured, kind) {
        requireMemory(!signal?.aborted, 'cancelled');
        requireMemory(calls.length < limits.turns, 'turn_limit');
        requireMemory(measured.tokens <= limits.inputTokens, 'input_limit');
        const call = { turn: calls.length + 1, kind, inputTokens: measured.tokens, tokenSource: measured.source,
            startedAt: Date.now(), provider: config.provider, model: config.model };
        calls.push(call); // Failed/unknown requests also consume the safety limit.
        try {
            if (kind === 'maintenance') session.inputProvided();
            const result = await target.chat({ temperature: config.temperature, maxTokens: config.maxTokens,
                reasoning: config.reasoning, signal, captureRawAssistantMessage: true, ...request });
            call.usage = result.usage || null;
            return { result, call };
        } catch (error) { call.code = error.code || 'agent_failed'; throw error; }
        finally { call.durationMs = Date.now() - call.startedAt; }
    }
    const context = createMemoryContext({ config, signal, limits, countTokens,
        async summarize(request, measured) {
            requireMemory(typeof createSummaryAdapter === 'function', 'compaction_failed');
            summaryAdapter ||= createSummaryAdapter();
            requireMemory(summaryAdapter !== adapter, 'compaction_failed');
            const { result, call } = await requestModel(summaryAdapter, request, measured, 'compaction');
            onCall({ call, result, tools: [] });
            return result;
        },
    });
    try {
        let initialBudget = OPENING_TOKENS;
        let measured = await context.count(messages);
        let material = await context.count(messages, '', []);
        while ((material.tokens > OPENING_TOKENS || measured.tokens >= Math.min(limits.compactTokens, limits.inputTokens)) && initialBudget > 1) {
            initialBudget = Math.max(1, Math.floor(initialBudget / 2));
            messages = [{ role: 'user', content: JSON.stringify({ ...session.initial(initialBudget), callsRemaining: limits.turns }) }];
            measured = await context.count(messages);
            material = await context.count(messages, '', []);
        }
        requireMemory(material.tokens <= OPENING_TOKENS, 'input_limit');
        requireMemory(measured.tokens <= limits.inputTokens, 'input_limit');
        while (calls.length < limits.turns) {
            requireMemory(!signal?.aborted, 'cancelled');
            measured = await context.count(messages);
            if (measured.tokens >= limits.compactTokens) {
                onProgress({ runId, action: 'compacting', calls: calls.length, saved: session.operations.length });
                const compacted = await context.compact(messages, session.task(), limits.turns - calls.length);
                const first = JSON.parse(compacted.messages[0].content);
                first.callsRemaining = limits.turns - calls.length;
                compacted.messages[0].content = JSON.stringify(first);
                const counted = await context.count(compacted.messages);
                requireMemory(counted.tokens <= limits.inputTokens, 'input_limit');
                messages = compacted.messages; measured = counted;
                responses = null; // Native providers rebuild from the complete compacted conversation.
            }
            requireMemory(measured.tokens <= limits.inputTokens, 'input_limit');
            onProgress({ runId, action: 'thinking', calls: calls.length + 1, saved: session.operations.length });
            const request = { systemPrompt: MEMORY_MAINTENANCE_PROMPT, tools: MEMORY_TOOLS, toolChoice: 'auto',
                messages };
            if (adapter.supportsSessionToolLoop && responses) request.toolResponses = responses;
            const { result, call } = await requestModel(adapter, request, measured, 'maintenance');
            const toolCalls = resolveResultToolCalls(result, config);
            requireMemory(!signal?.aborted, 'cancelled');
            messages.push(buildProviderAssistantToolCallMessage(result, toolCalls));
            if (!toolCalls.length) {
                requireMemory(typeof result.text === 'string' && result.text.trim(), 'empty_response');
                onCall({ call, result, tools: [] });
                outcome = { status: session.task().pending.length ? 'partial' : 'completed', summary: result.text };
                break;
            }
            responses = [];
            let editFailed = false;
            // Even when the model lists completion first, all edits must save before any completion.
            const ordered = [...toolCalls.filter(tool => tool.name !== 'CompleteMaintenance'), ...toolCalls.filter(tool => tool.name === 'CompleteMaintenance')];
            for (const toolCall of ordered) {
                let response;
                const writes = ['EditMemory', 'CompleteMaintenance'].includes(toolCall.name);
                onProgress({ runId, action: writes ? 'editing' : 'reading', calls: calls.length, saved: session.operations.length });
                try {
                    if (toolCall.name === 'CompleteMaintenance' && editFailed) throw new MemoryMaintenanceError('edit_failed', '', 'from');
                    const current = toolCall.name === 'ReadMemory' ? await readCurrent?.() : undefined;
                    requireMemory(!signal?.aborted, 'cancelled');
                    response = session.runTool(toolCall.name, JSON.parse(toolCall.arguments), current);
                } catch (error) {
                    if (!(error instanceof MemoryMaintenanceError) && !(error instanceof SyntaxError)) throw error;
                    if (['conflict', 'cancelled'].includes(error.code)) throw error;
                    response = { status: 'error', code: error.code || 'invalid_json', field: error.field || 'arguments', message: error.message,
                        ...(error.rejected ? { rejected: error.rejected, unchecked: error.unchecked } : {}),
                        ...(error.records ? { records: error.records } : {}),
                        ...(error.expected ? { expected: error.expected } : {}) };
                }
                if (toolCall.name === 'EditMemory' && ['error', 'needs_fix'].includes(response.status)) editFailed = true;
                // Persistence errors stop the run; they are not tool mistakes to spend another model call on.
                if (response.status === 'staged') {
                    requireMemory(typeof onSave === 'function', 'save_unavailable');
                    try {
                        const saved = await onSave({ session, calls: [call], runId });
                        requireMemory(saved?.current && saved.receipt, 'save_unavailable');
                        session.acknowledge(saved.current);
                        receipts.push(saved.receipt.id);
                        response = { status: 'saved', changed: response.changed, receiptId: saved.receipt.id,
                            ...(toolCall.name === 'CompleteMaintenance' ? { task: session.task() } : {}) };
                    } catch (error) {
                        if (error.uncertain || !(error instanceof MemoryMaintenanceError)
                            || ['conflict', 'cancelled', 'pending_edit', 'save_unavailable', 'no_boundary'].includes(error.code)) throw error;
                        session.discard();
                        if (toolCall.name === 'EditMemory') editFailed = true;
                        response = { status: 'error', code: error.code, message: error.message,
                            ...(error.records ? { records: error.records } : {}), ...(error.field ? { field: error.field } : {}) };
                    }
                }
                response.callsRemaining = limits.turns - calls.length;
                responses.push({ id: toolCall.id, name: toolCall.name, response,
                    ...(Object.hasOwn(toolCall, 'providerId') ? { providerId: toolCall.providerId } : {}) });
                messages.push(buildProviderToolResultMessage({ toolCallId: toolCall.id, toolName: toolCall.name, content: JSON.stringify(response) }));
            }
            onCall({ call, result, tools: responses.map(({ name, response }) => ({ name, response })) });
        }
    } catch (error) {
        failure = error;
        outcome = { status: error.uncertain ? 'unconfirmed' : signal?.aborted ? 'cancelled'
            : ['turn_limit', 'input_limit'].includes(error.code) ? error.code : 'failed', code: error.code || 'agent_failed', summary: '' };
    }
    // Final text/status belongs to the same history group, not to a separate run database.
    if (onFinish && !failure?.uncertain) {
        session.conclude(outcome);
        try {
            const saved = await onFinish({ session, calls, runId });
            if (saved?.receipt) receipts.push(saved.receipt.id);
            if (saved?.receipt?.outcome) outcome = { ...outcome, ...saved.receipt.outcome };
            finalRanges = saved?.ranges;
        } catch (error) {
            failure = error;
            outcome = { status: error.uncertain ? 'unconfirmed' : 'failed', code: error.code || 'agent_failed', summary: outcome.summary };
        }
    }
    return { ...outcome, calls, runId, receipts, saved: session.operations.length, ranges: finalRanges || session.task(), ...(failure ? { error: failure } : {}) };
}
