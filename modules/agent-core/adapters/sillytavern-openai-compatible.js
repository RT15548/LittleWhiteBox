import {
    buildHostChatCompletionGenerateRequest,
    buildHostOpenAICompatibleGeneratePayload,
    createHostChatCompletion,
    streamHostChatCompletion,
} from '../../../shared/host-llm/chat-completions/client.js';
import { redactRequestSecrets } from './request-inspection.js';
import {
    accumulateStreamedAssistantSnapshot,
    assertSignedToolCallsIntact,
    buildTaggedToolCallDraft,
    buildToolCallResultsFromOpenAI,
    buildNativeMessages,
    buildProviderPayload,
    buildReplayableAssistantMessage,
    buildTaggedMessages,
    extractTaggedToolCalls,
    extractThinkTaggedContent,
    extractThoughtsFromMessage,
    flattenTextContent,
    getStreamedSnapshotText,
    getStreamedSnapshotToolCalls,
    hasUnsupportedReasoningEffortCapability,
    isUnsupportedReasoningEffortError,
    markUnsupportedReasoningEffortCapability,
    stripTaggedToolCallsForDisplay,
} from './openai-compatible.js';

function emitStreamProgress(task, payload) {
    if (typeof task.onStreamProgress !== 'function') return;
    task.onStreamProgress({
        ...(typeof payload.text === 'string' ? { text: payload.text } : {}),
        ...(Array.isArray(payload.thoughts) ? { thoughts: payload.thoughts } : {}),
        ...(Array.isArray(payload.toolCalls) ? { toolCalls: payload.toolCalls } : {}),
        ...(payload.toolCallDraft ? { toolCallDraft: true } : {}),
    });
}

function cleanTextForToolMode(content, standardToolCalls = []) {
    const thinkTagged = extractThinkTaggedContent(content);
    return {
        thinkTagged,
        cleanedText: standardToolCalls.length
            ? thinkTagged.cleaned
            : stripTaggedToolCallsForDisplay(thinkTagged.cleaned),
    };
}

function isMalformedNativeToolHostError(error) {
    const message = String(error?.message || error || '');
    return /Cannot read properties of null \(reading ['"]function['"]\)/i.test(message)
        || /reading ['"]function['"]/i.test(message)
        || /badresponsestatuscode/i.test(message);
}

export class SillyTavernOpenAICompatibleAdapter {
    constructor(config) {
        this.config = config;
    }

    buildMessages(task) {
        const toolMode = this.config.toolMode || 'native';
        const isTaggedMode = toolMode === 'tagged-json' && Array.isArray(task.tools) && task.tools.length > 0;
        return isTaggedMode
            ? buildTaggedMessages(task, this.config.model)
            : buildNativeMessages(task, this.config.model);
    }

    buildPayload(task, taggedMode = false) {
        const messages = taggedMode
            ? buildTaggedMessages(task, this.config.model)
            : buildNativeMessages(task, this.config.model);
        const payload = buildHostOpenAICompatibleGeneratePayload(
            this.config,
            taggedMode
                ? {
                    ...task,
                    tools: undefined,
                    toolChoice: undefined,
                }
                : task,
            messages,
            typeof task.onStreamProgress === 'function',
        );
        if (task.reasoning?.enabled && hasUnsupportedReasoningEffortCapability(this.config)) {
            delete payload.reasoning_effort;
        }
        return payload;
    }

    async inspectRequest(task, options = {}) {
        const payload = options.payload || this.buildPayload(task, !!options.taggedMode);
        const request = await buildHostChatCompletionGenerateRequest(
            payload,
            typeof task.onStreamProgress === 'function',
        );
        return this.buildRequestInspection(request, task);
    }

    buildRequestInspection(request, task = {}) {
        const suppressedReasoningEffort = !!task.reasoning?.enabled
            && !Object.prototype.hasOwnProperty.call(request?.body || {}, 'reasoning_effort');
        return {
            provider: 'sillytavern-openai-compatible',
            model: this.config.model,
            transport: 'sillytavern-chat-completions',
            request: redactRequestSecrets(request),
            ...(suppressedReasoningEffort ? { degraded: ['reasoning_effort_unsupported'] } : {}),
        };
    }

    async streamChat(task, payload, options = {}) {
        const assistantSnapshot = {
            role: 'assistant',
        };
        let lastFinishReason = 'stop';
        let lastModel = this.config.model;

        await streamHostChatCompletion(payload, (event) => {
            lastModel = event?.model || lastModel;
            const choice = event?.choices?.[0] || {};
            accumulateStreamedAssistantSnapshot(assistantSnapshot, choice);

            if (choice.finish_reason) {
                lastFinishReason = choice.finish_reason;
            }

            const standardToolCalls = getStreamedSnapshotToolCalls(assistantSnapshot);
            const { thinkTagged, cleanedText } = cleanTextForToolMode(
                getStreamedSnapshotText(assistantSnapshot),
                standardToolCalls,
            );
            const progressToolCalls = standardToolCalls.length
                ? standardToolCalls
                : buildTaggedToolCallDraft(thinkTagged.cleaned);
            emitStreamProgress(task, {
                text: cleanedText,
                thoughts: extractThoughtsFromMessage(assistantSnapshot, choice).concat(thinkTagged.thoughts),
                ...(progressToolCalls.length ? { toolCalls: progressToolCalls } : {}),
                ...(!standardToolCalls.length && progressToolCalls.length ? { toolCallDraft: true } : {}),
            });
        }, {
            signal: task.signal,
            onRequest: options.onRequest,
            onResponseAccepted: options.onResponseAccepted,
        });

        assertSignedToolCallsIntact(assistantSnapshot);
        const standardToolCalls = getStreamedSnapshotToolCalls(assistantSnapshot);
        const { thinkTagged, cleanedText } = cleanTextForToolMode(
            getStreamedSnapshotText(assistantSnapshot),
            standardToolCalls,
        );
        const thoughts = extractThoughtsFromMessage(assistantSnapshot, {});
        thinkTagged.thoughts.forEach((item) => thoughts.push(item));
        const taggedToolCalls = standardToolCalls.length ? [] : extractTaggedToolCalls(thinkTagged.cleaned);

        return {
            text: cleanedText,
            toolCalls: [...standardToolCalls, ...taggedToolCalls],
            thoughts,
            finishReason: lastFinishReason,
            model: lastModel,
            provider: 'sillytavern-openai-compatible',
            providerPayload: buildProviderPayload(assistantSnapshot),
        };
    }

    async nonStreamingChat(task, payload, options = {}) {
        const response = await createHostChatCompletion(payload, { signal: task.signal, onRequest: options.onRequest });
        const choice = response.choices?.[0] || {};
        const message = choice.message || {};
        assertSignedToolCallsIntact(message);
        const thoughts = extractThoughtsFromMessage(message, choice);
        const standardToolCalls = buildToolCallResultsFromOpenAI(message.tool_calls || []);
        const contentText = flattenTextContent(message.content);
        const { thinkTagged, cleanedText } = cleanTextForToolMode(contentText, standardToolCalls);
        thinkTagged.thoughts.forEach((item) => thoughts.push(item));
        const taggedToolCalls = standardToolCalls.length ? [] : extractTaggedToolCalls(thinkTagged.cleaned);
        const replayableMessage = buildReplayableAssistantMessage(message, choice);

        return {
            text: cleanedText,
            toolCalls: [...standardToolCalls, ...taggedToolCalls],
            thoughts,
            finishReason: choice.finish_reason || 'stop',
            model: response.model || this.config.model,
            provider: 'sillytavern-openai-compatible',
            providerPayload: buildProviderPayload(replayableMessage),
        };
    }

    async chat(task) {
        const toolMode = this.config.toolMode || 'native';
        const isTaggedMode = toolMode === 'tagged-json' && Array.isArray(task.tools) && task.tools.length > 0;
        const hasTools = Array.isArray(task.tools) && task.tools.length > 0;
        const run = async (payload, options = {}) => {
            let requestInspection = null;
            const onRequest = (request) => {
                requestInspection = this.buildRequestInspection(request, task);
            };
            try {
                const result = typeof task.onStreamProgress === 'function'
                    ? await this.streamChat(task, payload, {
                        onRequest,
                        onResponseAccepted: options.onResponseAccepted,
                    })
                    : await this.nonStreamingChat(task, payload, { onRequest });
                return {
                    ...result,
                    requestInspection,
                };
            } catch (error) {
                if (requestInspection && error && typeof error === 'object') {
                    error.requestInspection = requestInspection;
                }
                throw error;
            }
        };
        const runWithReasoningEffortFallback = async (payload) => {
            let responseAccepted = false;
            try {
                return await run(payload, {
                    onResponseAccepted: () => {
                        responseAccepted = true;
                    },
                });
            } catch (error) {
                if (task.signal?.aborted
                    || responseAccepted
                    || !Object.prototype.hasOwnProperty.call(payload, 'reasoning_effort')
                    || !isUnsupportedReasoningEffortError(error)) {
                    throw error;
                }
                markUnsupportedReasoningEffortCapability(this.config);
                const fallbackPayload = { ...payload };
                delete fallbackPayload.reasoning_effort;
                return await run(fallbackPayload);
            }
        };
        const payload = this.buildPayload(task, isTaggedMode);

        try {
            return await runWithReasoningEffortFallback(payload);
        } catch (error) {
            if (isTaggedMode || !hasTools || !isMalformedNativeToolHostError(error)) {
                throw error;
            }
        }

        if (typeof task.onToolProtocolFallback === 'function') {
            task.onToolProtocolFallback({
                provider: 'sillytavern-openai-compatible',
                fromToolMode: 'native',
                toToolMode: 'tagged-json',
                reason: 'malformed_native_tool_host_error',
            });
        }
        const fallbackPayload = this.buildPayload(task, true);
        return await runWithReasoningEffortFallback(fallbackPayload);
    }
}
