import { normalizeThoughtBlocks } from '../../agent-core/runtime/protocol.js';
import { resetMessageWindow } from '../../agent-core/ui/message-windowing.js';
import db, { ebookMessagesTable, ebookSessionsTable } from '../shared/ebook-db.js';

let writeQueue = Promise.resolve();

function normalizeBookId(bookId = '') {
    return String(bookId || '').trim();
}

function isPersistableMessage(message = {}) {
    return message
        && ['user', 'assistant', 'tool'].includes(message.role)
        && !message.streaming
        && typeof message.content === 'string';
}

function cloneJson(value) {
    if (value === undefined) return undefined;
    try {
        return JSON.parse(JSON.stringify(value));
    } catch {
        return undefined;
    }
}

function serializeMessage(bookId, message = {}, order = 0) {
    return {
        bookId,
        order,
        role: message.role,
        content: String(message.content || ''),
        error: !!message.error,
        toolCallId: message.toolCallId ? String(message.toolCallId) : '',
        toolName: message.toolName ? String(message.toolName) : '',
        toolCalls: Array.isArray(message.toolCalls)
            ? message.toolCalls.map((toolCall) => ({
                id: String(toolCall?.id || ''),
                name: String(toolCall?.name || ''),
                arguments: String(toolCall?.arguments || '{}'),
            })).filter((toolCall) => toolCall.name)
            : [],
        providerPayload: cloneJson(message.providerPayload),
        toolDisplay: cloneJson(message.toolDisplay),
        thoughts: normalizeThoughtBlocks(message.thoughts),
        createdAt: Number(message.createdAt) || Date.now(),
    };
}

function normalizeRestoredMessage(message = {}) {
    if (!isPersistableMessage(message)) return null;
    return {
        role: message.role,
        content: String(message.content || ''),
        error: !!message.error,
        toolCallId: message.toolCallId ? String(message.toolCallId) : undefined,
        toolName: message.toolName ? String(message.toolName) : undefined,
        toolCalls: Array.isArray(message.toolCalls)
            ? message.toolCalls.map((toolCall) => ({
                id: String(toolCall?.id || ''),
                name: String(toolCall?.name || ''),
                arguments: String(toolCall?.arguments || '{}'),
            })).filter((toolCall) => toolCall.name)
            : undefined,
        providerPayload: cloneJson(message.providerPayload),
        toolDisplay: cloneJson(message.toolDisplay),
        thoughts: normalizeThoughtBlocks(message.thoughts),
        createdAt: Number(message.createdAt) || 0,
    };
}

function resetConversationUiState(state) {
    state.toolTrace = [];
    state.liveToolTurn = null;
    state.openToolTurnKeys = [];
    state.activeTurnStartIndex = -1;
    state.openThoughtKeys = [];
    state.editingMessageIndex = -1;
    state.messageActionFeedback = {};
    resetMessageWindow(state);
}

function resetConversationState(state) {
    state.messages = [];
    resetConversationUiState(state);
    state.historySummary = '';
    state.archivedTurnCount = 0;
}

export function createEbookConversationStore(options = {}) {
    const { state } = options;

    function buildSnapshot(bookId = state.book?.id) {
        const id = normalizeBookId(bookId);
        const messages = (state.messages || [])
            .filter(isPersistableMessage)
            .map((message, index) => serializeMessage(id, message, index));
        return {
            bookId: id,
            messages,
            updatedAt: Date.now(),
        };
    }

    async function saveSnapshot(snapshot) {
        if (!snapshot.bookId) return;
        await db.transaction('rw', ebookSessionsTable, ebookMessagesTable, async () => {
            await ebookSessionsTable.put({
                bookId: snapshot.bookId,
                historySummary: '',
                updatedAt: snapshot.updatedAt,
            });
            await ebookMessagesTable.where('bookId').equals(snapshot.bookId).delete();
            if (snapshot.messages.length) {
                await ebookMessagesTable.bulkPut(snapshot.messages);
            }
        });
    }

    function persistConversation(bookId = state.book?.id) {
        const snapshot = buildSnapshot(bookId);
        writeQueue = writeQueue
            .catch(() => {})
            .then(async () => {
                try {
                    await saveSnapshot(snapshot);
                    return { ok: true };
                } catch (error) {
                    console.error('[Ebook] 保存创作对话失败:', error);
                    return {
                        ok: false,
                        error: error?.message || String(error || 'save_failed'),
                    };
                }
            });
        return writeQueue;
    }

    async function restoreConversation(bookId = state.book?.id) {
        const id = normalizeBookId(bookId);
        if (!id) {
            resetConversationState(state);
            return;
        }
        try {
            const session = await ebookSessionsTable.get(id);
            if (!session) {
                resetConversationState(state);
                return;
            }
            const rows = await ebookMessagesTable.where('bookId').equals(id).toArray();
            rows.sort((left, right) => Number(left.order || 0) - Number(right.order || 0));
            state.messages = rows.map(normalizeRestoredMessage).filter(Boolean);
            resetConversationUiState(state);
            state.historySummary = '';
            state.archivedTurnCount = 0;
        } catch (error) {
            console.error('[Ebook] 恢复创作对话失败:', error);
            resetConversationState(state);
        }
    }

    async function clearConversation(bookId = state.book?.id) {
        const id = normalizeBookId(bookId);
        if (!id) return;
        await db.transaction('rw', ebookSessionsTable, ebookMessagesTable, async () => {
            await ebookMessagesTable.where('bookId').equals(id).delete();
            await ebookSessionsTable.delete(id);
        });
        if (state.book?.id === id) {
            resetConversationState(state);
        }
    }

    return {
        clearConversation,
        persistConversation,
        restoreConversation,
    };
}
