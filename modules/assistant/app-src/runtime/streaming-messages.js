export function createStreamingMessageController(deps) {
    const {
        state,
        render,
        persistSession,
        createRequestId,
        filterThoughtsForCurrentTurn,
    } = deps;

    let streamRenderScheduled = false;
    let lastStreamPersistAt = 0;

    function normalizeToolCalls(toolCalls) {
        if (!Array.isArray(toolCalls)) return [];
        return toolCalls
            .filter((toolCall) => toolCall && typeof toolCall === 'object' && toolCall.name)
            .map((toolCall, index) => ({
                id: String(toolCall.id || createRequestId(`tool-${index + 1}`)),
                name: String(toolCall.name || ''),
                arguments: typeof toolCall.arguments === 'string'
                    ? toolCall.arguments
                    : JSON.stringify(toolCall.arguments || {}),
            }));
    }

    function scheduleStreamRender({ persist = false } = {}) {
        const now = Date.now();
        if (persist || now - lastStreamPersistAt >= 1500) {
            persistSession();
            lastStreamPersistAt = now;
        }
        if (streamRenderScheduled) return;
        streamRenderScheduled = true;
        const flush = () => {
            streamRenderScheduled = false;
            render();
        };
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(flush);
            return;
        }
        setTimeout(flush, 16);
    }

    function createStreamingAssistantMessage() {
        const message = {
            role: 'assistant',
            content: '',
            thoughts: [],
            streaming: true,
        };
        state.messages.push(message);
        render();
        return message;
    }

    function updateStreamingAssistantMessage(message, patch = {}) {
        if (!message) return;
        if (typeof patch.content === 'string') {
            message.content = patch.content;
        }
        if (patch.providerPayload && typeof patch.providerPayload === 'object') {
            message.providerPayload = patch.providerPayload;
        }
        if (Array.isArray(patch.thoughts)) {
            message.thoughts = filterThoughtsForCurrentTurn(patch.thoughts, message);
        }
        if (Array.isArray(patch.toolCalls)) {
            message.toolCalls = normalizeToolCalls(patch.toolCalls);
        }
        if (typeof patch.streaming === 'boolean') {
            message.streaming = patch.streaming;
        }
    }

    function finalizeStreamingAssistantMessage(message, patch = {}) {
        if (!message) return;
        updateStreamingAssistantMessage(message, {
            ...patch,
            streaming: false,
        });
        scheduleStreamRender({ persist: true });
    }

    return {
        createStreamingAssistantMessage,
        finalizeStreamingAssistantMessage,
        normalizeToolCalls,
        scheduleStreamRender,
        updateStreamingAssistantMessage,
    };
}
