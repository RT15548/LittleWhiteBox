const SESSION_STORAGE_KEY = 'littlewhitebox.assistant.session.v2';
const MAX_PERSISTED_MESSAGES = 60;
const MAX_PERSISTED_CONTENT_CHARS = 16000;

function trimPersistedContent(content) {
    const text = String(content || '');
    if (text.length <= MAX_PERSISTED_CONTENT_CHARS) return text;
    return `${text.slice(0, MAX_PERSISTED_CONTENT_CHARS)}\n\n[内容过长，已截断保存]`;
}

function serializeMessage(message, normalizeAttachments, normalizeThoughtBlocks) {
    const approvalRequest = message?.approvalRequest && typeof message.approvalRequest === 'object'
        ? {
            id: String(message.approvalRequest.id || ''),
            kind: String(message.approvalRequest.kind || ''),
            command: String(message.approvalRequest.command || ''),
            status: String(message.approvalRequest.status || ''),
        }
        : null;
    return {
        role: message.role,
        content: trimPersistedContent(message.content),
        attachments: normalizeAttachments(message.attachments).map((attachment) => ({
            kind: attachment.kind,
            name: attachment.name,
            type: attachment.type,
            size: attachment.size,
        })),
        toolCallId: message.toolCallId || '',
        toolName: message.toolName || '',
        toolCalls: Array.isArray(message.toolCalls)
            ? message.toolCalls.map((toolCall) => ({
                id: toolCall.id || '',
                name: toolCall.name || '',
                arguments: trimPersistedContent(toolCall.arguments || '{}'),
            }))
            : [],
        thoughts: normalizeThoughtBlocks(message.thoughts).map((item) => ({
            label: item.label,
            text: trimPersistedContent(item.text),
        })),
        approvalRequest: approvalRequest && approvalRequest.status && approvalRequest.status !== 'pending'
            ? approvalRequest
            : undefined,
    };
}

function normalizeRestoredMessage(message, deps) {
    const { normalizeAttachments, normalizeThoughtBlocks, createRequestId } = deps;
    if (!message || typeof message !== 'object') return null;
    if (!['user', 'assistant', 'tool'].includes(message.role)) return null;
    const approvalRequest = message.approvalRequest && typeof message.approvalRequest === 'object'
        ? {
            id: String(message.approvalRequest.id || ''),
            kind: String(message.approvalRequest.kind || ''),
            command: String(message.approvalRequest.command || ''),
            status: String(message.approvalRequest.status || ''),
        }
        : undefined;
    return {
        role: message.role,
        content: String(message.content || ''),
        attachments: normalizeAttachments(message.attachments),
        toolCallId: message.toolCallId ? String(message.toolCallId) : undefined,
        toolName: message.toolName ? String(message.toolName) : undefined,
        toolCalls: Array.isArray(message.toolCalls)
            ? message.toolCalls
                .filter((toolCall) => toolCall && typeof toolCall === 'object' && toolCall.name)
                .map((toolCall) => ({
                    id: String(toolCall.id || createRequestId('tool')),
                    name: String(toolCall.name || ''),
                    arguments: String(toolCall.arguments || '{}'),
                }))
            : undefined,
        thoughts: normalizeThoughtBlocks(message.thoughts),
        approvalRequest: approvalRequest?.status && approvalRequest.status !== 'pending'
            ? approvalRequest
            : undefined,
    };
}

function isPersistableMessage(message) {
    if (!message || typeof message !== 'object') return false;
    if (message.streaming) return false;
    if (message.approvalRequest?.status === 'pending') return false;
    return true;
}

export function createSessionStore(deps) {
    const {
        state,
        storage = globalThis.localStorage,
        safeJsonParse,
        createRequestId,
        normalizeAttachments,
        normalizeThoughtBlocks,
        getActiveContextMessages,
    } = deps;

    function persistSession() {
        try {
            const activeMessages = getActiveContextMessages()
                .filter(isPersistableMessage)
                .slice(-MAX_PERSISTED_MESSAGES);
            const summary = trimPersistedContent(state.historySummary || '');
            if (!activeMessages.length && !summary) {
                storage.removeItem(SESSION_STORAGE_KEY);
                return;
            }
            storage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
                messages: activeMessages.map((message) => serializeMessage(message, normalizeAttachments, normalizeThoughtBlocks)),
                historySummary: summary,
                sidebarCollapsed: state.sidebarCollapsed,
            }));
        } catch {
            // Ignore localStorage failures.
        }
    }

    function restoreSession() {
        try {
            const raw = storage.getItem(SESSION_STORAGE_KEY);
            const parsed = safeJsonParse(raw, {});
            state.messages = Array.isArray(parsed.messages)
                ? parsed.messages
                    .map((message) => normalizeRestoredMessage(message, {
                        normalizeAttachments,
                        normalizeThoughtBlocks,
                        createRequestId,
                    }))
                    .filter(Boolean)
                : [];
            state.historySummary = String(parsed.historySummary || '');
            state.archivedTurnCount = 0;
            state.sidebarCollapsed = parsed.sidebarCollapsed !== undefined ? !!parsed.sidebarCollapsed : true;
        } catch {
            state.messages = [];
            state.historySummary = '';
            state.archivedTurnCount = 0;
            state.sidebarCollapsed = true;
        }
    }

    return {
        persistSession,
        restoreSession,
    };
}
