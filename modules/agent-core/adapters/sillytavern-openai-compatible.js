import {
    buildHostChatCompletionGenerateRequest,
    buildHostOpenAICompatibleGeneratePayload,
    createHostChatCompletion,
    streamHostChatCompletion,
} from '../../../shared/host-llm/chat-completions/client.js';
import {
    buildEffectiveReasoningConfig,
    redactRequestSecrets,
} from './request-inspection.js';
import {
    resolveTaskReasoning,
    shouldOmitTemperatureForReasoning,
} from '../reasoning-capabilities.js';
import { isReasoningOutputVisible } from '../reasoning-config.js';
import {
    accumulateStreamedAssistantSnapshot,
    applyOpenAICompatibleReasoningControls,
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
    stripTaggedToolCallsForDisplay,
} from './openai-compatible.js';

function emitStreamProgress(task, payload, effectiveReasoning) {
    if (typeof task.onStreamProgress !== 'function') return;
    task.onStreamProgress({
        ...(typeof payload.text === 'string' ? { text: payload.text } : {}),
        ...(Array.isArray(payload.thoughts)
            ? { thoughts: isReasoningOutputVisible(effectiveReasoning) ? payload.thoughts : [] }
            : {}),
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

    buildPayload(
        task,
        taggedMode = false,
        effectiveReasoning = resolveTaskReasoning(
            'sillytavern-openai-compatible',
            this.config,
            task.reasoning,
        ),
    ) {
        const reasoning = effectiveReasoning;
        const messages = taggedMode
            ? buildTaggedMessages(task, this.config.model)
            : buildNativeMessages(task, this.config.model);
        const effectiveTask = {
            ...task,
            temperature: shouldOmitTemperatureForReasoning(
                { ...this.config, provider: 'sillytavern-openai-compatible' },
                reasoning,
            ) ? undefined : task.temperature,
        };
        const payload = buildHostOpenAICompatibleGeneratePayload(
            this.config,
            taggedMode
                ? {
                    ...effectiveTask,
                    tools: undefined,
                    toolChoice: undefined,
                }
                : effectiveTask,
            messages,
            typeof task.onStreamProgress === 'function',
        );
        return applyOpenAICompatibleReasoningControls(payload, reasoning);
    }

    async inspectRequest(task, options = {}) {
        const effectiveReasoning = options.effectiveReasoning || resolveTaskReasoning(
            'sillytavern-openai-compatible',
            this.config,
            task.reasoning,
        );
        const payload = options.payload
            || this.buildPayload(task, !!options.taggedMode, effectiveReasoning);
        const request = await buildHostChatCompletionGenerateRequest(
            payload,
            typeof task.onStreamProgress === 'function',
        );
        return this.buildRequestInspection(request, task, effectiveReasoning);
    }

    buildRequestInspection(
        request,
        task = {},
        effectiveReasoning = resolveTaskReasoning(
            'sillytavern-openai-compatible',
            this.config,
            task.reasoning,
        ),
    ) {
        const controlFields = {
            ...(Object.hasOwn(request?.body || {}, 'reasoning_effort')
                ? { reasoning_effort: request.body.reasoning_effort }
                : {}),
            ...(Object.hasOwn(request?.body || {}, 'thinking')
                ? { thinking: request.body.thinking }
                : {}),
        };
        return {
            provider: 'sillytavern-openai-compatible',
            model: this.config.model,
            transport: 'sillytavern-chat-completions',
            request: redactRequestSecrets(request),
            effectiveConfig: buildEffectiveReasoningConfig(task, {
                reasoning: effectiveReasoning,
                effort: request?.body?.reasoning_effort,
                controlFields,
            }),
        };
    }

    async streamChat(task, payload, effectiveReasoning, options = {}) {
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
                thoughts: isReasoningOutputVisible(effectiveReasoning)
                    ? extractThoughtsFromMessage(assistantSnapshot, choice).concat(thinkTagged.thoughts)
                    : [],
                ...(progressToolCalls.length ? { toolCalls: progressToolCalls } : {}),
                ...(!standardToolCalls.length && progressToolCalls.length ? { toolCallDraft: true } : {}),
            }, effectiveReasoning);
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
            thoughts: isReasoningOutputVisible(effectiveReasoning) ? thoughts : [],
            finishReason: lastFinishReason,
            model: lastModel,
            provider: 'sillytavern-openai-compatible',
            providerPayload: buildProviderPayload(assistantSnapshot),
        };
    }

    async nonStreamingChat(task, payload, effectiveReasoning, options = {}) {
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
            thoughts: isReasoningOutputVisible(effectiveReasoning) ? thoughts : [],
            finishReason: choice.finish_reason || 'stop',
            model: response.model || this.config.model,
            provider: 'sillytavern-openai-compatible',
            providerPayload: buildProviderPayload(replayableMessage),
        };
    }

    async chat(task) {
        const effectiveReasoning = resolveTaskReasoning(
            'sillytavern-openai-compatible',
            this.config,
            task.reasoning,
        );
        const toolMode = this.config.toolMode || 'native';
        const isTaggedMode = toolMode === 'tagged-json' && Array.isArray(task.tools) && task.tools.length > 0;
        const hasTools = Array.isArray(task.tools) && task.tools.length > 0;
        const run = async (payload, options = {}) => {
            let requestInspection = null;
            const onRequest = (request) => {
                requestInspection = this.buildRequestInspection(request, task, effectiveReasoning);
            };
            try {
                const result = typeof task.onStreamProgress === 'function'
                    ? await this.streamChat(task, payload, effectiveReasoning, {
                        onRequest,
                        onResponseAccepted: options.onResponseAccepted,
                    })
                    : await this.nonStreamingChat(task, payload, effectiveReasoning, { onRequest });
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
        const payload = this.buildPayload(task, isTaggedMode, effectiveReasoning);

        try {
            return await run(payload);
        } catch (error) {
            if (task.allowToolProtocolFallback === false
                || isTaggedMode
                || !hasTools
                || !isMalformedNativeToolHostError(error)) {
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
        const fallbackPayload = this.buildPayload(task, true, effectiveReasoning);
        return await run(fallbackPayload);
    }
}
