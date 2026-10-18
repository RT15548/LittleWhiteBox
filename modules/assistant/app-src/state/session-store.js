import { resetMessageWindow } from '../../../agent-core/ui/message-windowing.js';
import db, { metaTable, messagesTable, plansTable, sessionsTable } from './session-db.js';
import { describePersistenceError } from '../../shared/persistence-error.js';

const LEGACY_SESSION_ID = 'default';
const CURRENT_SESSION_META_KEY = 'currentSessionId';
let writeQueue = Promise.resolve();

function createAssistantSessionId() {
    return `asst-session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function cloneJson(value) {
    if (value === undefined) return undefined;
    try {
        return JSON.parse(JSON.stringify(value));
    } catch {
        return undefined;
    }
}

function serializeMessage(message, normalizeAttachments, normalizeThoughtBlocks, order, sessionId) {
    return {
        sessionId,
        order,
        role: message.role,
        content: String(message.content || ''),
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
                arguments: String(toolCall.arguments || '{}'),
                ...(Object.prototype.hasOwnProperty.call(toolCall || {}, 'providerId')
                    ? { providerId: String(toolCall.providerId || '') }
                    : {}),
            }))
            : [],
        thoughts: normalizeThoughtBlocks(message.thoughts).map((item) => ({
            label: item.label,
            text: item.text,
        })),
        providerPayload: cloneJson(message?.providerPayload),
    };
}

function normalizeRestoredMessage(message, deps) {
    const { normalizeAttachments, normalizeThoughtBlocks, createRequestId } = deps;
    if (!message || typeof message !== 'object') return null;
    if (!['user', 'assistant', 'tool'].includes(message.role)) return null;
    if (message.approvalRequest) return null;

    return {
        role: message.role,
        content: String(message.content || ''),
        attachments: normalizeAttachments(message.attachments || []),
        toolCallId: message.toolCallId ? String(message.toolCallId) : undefined,
        toolName: message.toolName ? String(message.toolName) : undefined,
        toolCalls: Array.isArray(message.toolCalls)
            ? message.toolCalls
                .filter((toolCall) => toolCall && typeof toolCall === 'object' && toolCall.name)
                .map((toolCall) => ({
                    id: String(toolCall.id || createRequestId('tool')),
                    name: String(toolCall.name || ''),
                    arguments: String(toolCall.arguments || '{}'),
                    ...(Object.prototype.hasOwnProperty.call(toolCall || {}, 'providerId')
                        ? { providerId: String(toolCall.providerId || '') }
                        : {}),
                }))
            : undefined,
        thoughts: normalizeThoughtBlocks(message.thoughts || []),
        providerPayload: cloneJson(message?.providerPayload),
    };
}

function isPersistableMessage(message) {
    if (!message || typeof message !== 'object') return false;
    if (message.streaming) return false;
    if (message.approvalRequest) return false;
    return true;
}

export function createSessionStore(deps) {
    const {
        state,
        createRequestId,
        normalizeAttachments,
        normalizeThoughtBlocks,
        getActiveContextMessages,
    } = deps;

    let currentSessionId = '';

    async function persistCurrentSessionId(sessionId) {
        const nextSessionId = String(sessionId || '').trim() || createAssistantSessionId();
        await metaTable.put({
            key: CURRENT_SESSION_META_KEY,
            value: nextSessionId,
            updatedAt: Date.now(),
        });
        currentSessionId = nextSessionId;
        state.assistantSessionId = currentSessionId;
        return currentSessionId;
    }

    async function resolveCurrentSessionId() {
        if (currentSessionId) return currentSessionId;

        const saved = await metaTable.get(CURRENT_SESSION_META_KEY);
        const savedSessionId = String(saved?.value || '').trim();
        if (savedSessionId) {
            currentSessionId = savedSessionId;
            state.assistantSessionId = currentSessionId;
            return currentSessionId;
        }

        const hasLegacySession = !!(await sessionsTable.get(LEGACY_SESSION_ID))
            || (await messagesTable.where('sessionId').equals(LEGACY_SESSION_ID).count()) > 0;
        return await persistCurrentSessionId(hasLegacySession ? LEGACY_SESSION_ID : createAssistantSessionId());
    }

    function getCurrentSessionIdSync() {
        if (!currentSessionId) {
            currentSessionId = String(state.assistantSessionId || '').trim() || LEGACY_SESSION_ID;
            state.assistantSessionId = currentSessionId;
        }
        return currentSessionId;
    }

    function buildSnapshot() {
        const sessionId = getCurrentSessionIdSync();
        const activeMessages = getActiveContextMessages()
            .filter(isPersistableMessage)
            .map((message, index) => serializeMessage(message, normalizeAttachments, normalizeThoughtBlocks, index, sessionId));

        return {
            sessionId,
            historySummary: String(state.historySummary || ''),
            messages: activeMessages,
        };
    }

    async function saveSnapshot(snapshot) {
        await db.transaction('rw', sessionsTable, messagesTable, async () => {
            await sessionsTable.put({
                id: snapshot.sessionId,
                updatedAt: Date.now(),
                historySummary: snapshot.historySummary,
            });
            await messagesTable.where('sessionId').equals(snapshot.sessionId).delete();
            if (snapshot.messages.length) {
                await messagesTable.bulkPut(snapshot.messages);
            }
        });
    }

    function persistSession() {
        const snapshot = buildSnapshot();
        writeQueue = writeQueue
            .catch((caughtError) => { console.warn({ source: import.meta.url, operation: "persistSession" }, caughtError); })
            .then(async () => {
                try {
                    await saveSnapshot(snapshot);
                    return { ok: true };
                } catch (error) {
                    console.error('[Assistant] 保存会话失败:', error);
                    return {
                        ok: false,
                        error: describePersistenceError(error),
                    };
                }
            });
        return writeQueue;
    }

    function clearSession() {
        writeQueue = writeQueue
            .catch((caughtError) => { console.warn({ source: import.meta.url, operation: "clearSession" }, caughtError); })
            .then(async () => {
                try {
                    const previousSessionId = await resolveCurrentSessionId();
                    const nextSessionId = createAssistantSessionId();
                    await db.transaction('rw', sessionsTable, messagesTable, plansTable, metaTable, async () => {
                        await messagesTable.where('sessionId').equals(previousSessionId).delete();
                        await sessionsTable.delete(previousSessionId);
                        await plansTable.where('sessionId').equals(previousSessionId).delete();
                        await metaTable.put({ key: CURRENT_SESSION_META_KEY, value: nextSessionId, updatedAt: Date.now() });
                    });
                    currentSessionId = nextSessionId;
                    state.assistantSessionId = nextSessionId;
                    state.messages = [];
                    state.historySummary = '';
                    state.archivedTurnCount = 0;
                    resetMessageWindow(state);
                    return {
                        ok: true,
                        sessionId: nextSessionId,
                        previousSessionId,
                    };
                } catch (error) {
                    console.error('[Assistant] 清空会话失败:', error);
                    return {
                        ok: false,
                        error: describePersistenceError(error),
                    };
                }
            });
        return writeQueue;
    }

    async function restoreSession() {
        const sessionId = await resolveCurrentSessionId();
        const session = await sessionsTable.get(sessionId);
        const messages = await messagesTable.where('sessionId').equals(sessionId).toArray();
        messages.sort((left, right) => Number(left.order || 0) - Number(right.order || 0));
        state.messages = messages.map(message => normalizeRestoredMessage(message, {
            normalizeAttachments, normalizeThoughtBlocks, createRequestId,
        })).filter(Boolean);
        state.historySummary = String(session?.historySummary || '');
        state.archivedTurnCount = 0;
        resetMessageWindow(state);
        state.sidebarCollapsed = true;
    }

    return {
        clearSession,
        persistSession,
        restoreSession,
    };
}
