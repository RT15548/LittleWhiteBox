import db, { sessionsTable, messagesTable } from './session-db.js';
import { normalizeLocalSources } from './local-sources.js';

const SESSION_ID = 'default';
let writeQueue = Promise.resolve();

function cloneJson(value) {
    if (value === undefined) return undefined;
    try {
        return JSON.parse(JSON.stringify(value));
    } catch {
        return undefined;
    }
}

function serializeMessage(message, normalizeAttachments, normalizeThoughtBlocks, order) {
    return {
        sessionId: SESSION_ID,
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

    function buildSnapshot() {
        const activeMessages = getActiveContextMessages()
            .filter(isPersistableMessage)
            .map((message, index) => serializeMessage(message, normalizeAttachments, normalizeThoughtBlocks, index));

        return {
            historySummary: String(state.historySummary || ''),
            sidebarCollapsed: state.sidebarCollapsed !== undefined ? !!state.sidebarCollapsed : true,
            localSources: normalizeLocalSources(state.localSources),
            isWorkspaceOpen: !!state.isWorkspaceOpen,
            workspaceWidth: Number.isFinite(Number(state.workspaceWidth)) ? Number(state.workspaceWidth) : 520,
            selectedSourceId: String(state.selectedSourceId || 'all') || 'all',
            selectedFilePath: String(state.selectedFilePath || ''),
            selectedTreePath: String(state.selectedTreePath || ''),
            fileSearchQuery: String(state.fileSearchQuery || ''),
            showModifiedOnly: !!state.showModifiedOnly,
            viewerMode: String(state.viewerMode || 'current'),
            mobileWorkspacePane: String(state.mobileWorkspacePane || 'tree') === 'viewer' ? 'viewer' : 'tree',
            treeExpandedKeys: Array.isArray(state.treeExpandedKeys) ? state.treeExpandedKeys.map((item) => String(item || '')).filter(Boolean) : [],
            messages: activeMessages,
        };
    }

    async function saveSnapshot(snapshot) {
        await db.transaction('rw', sessionsTable, messagesTable, async () => {
            await sessionsTable.put({
                id: SESSION_ID,
                updatedAt: Date.now(),
                historySummary: snapshot.historySummary,
                sidebarCollapsed: snapshot.sidebarCollapsed,
                localSources: snapshot.localSources,
                isWorkspaceOpen: snapshot.isWorkspaceOpen,
                workspaceWidth: snapshot.workspaceWidth,
                selectedSourceId: snapshot.selectedSourceId,
                selectedFilePath: snapshot.selectedFilePath,
                selectedTreePath: snapshot.selectedTreePath,
                fileSearchQuery: snapshot.fileSearchQuery,
                showModifiedOnly: snapshot.showModifiedOnly,
                viewerMode: snapshot.viewerMode,
                mobileWorkspacePane: snapshot.mobileWorkspacePane,
                treeExpandedKeys: snapshot.treeExpandedKeys,
            });
            await messagesTable.where('sessionId').equals(SESSION_ID).delete();
            if (snapshot.messages.length) {
                await messagesTable.bulkPut(snapshot.messages);
            }
        });
    }

    function describeSessionStoreError(error) {
        const message = String(error?.message || error || 'unknown_error').trim();
        const lowered = message.toLowerCase();
        if (
            error?.name === 'QuotaExceededError'
            || lowered.includes('quota')
            || lowered.includes('insufficient space')
            || lowered.includes('disk full')
        ) {
            return '浏览器存储空间不足';
        }
        return message || 'unknown_error';
    }

    function persistSession() {
        const snapshot = buildSnapshot();
        writeQueue = writeQueue
            .catch(() => {})
            .then(async () => {
                try {
                    await saveSnapshot(snapshot);
                    return { ok: true };
                } catch (error) {
                    console.error('[Assistant] 保存会话失败:', error);
                    return {
                        ok: false,
                        error: describeSessionStoreError(error),
                    };
                }
            });
        return writeQueue;
    }

    function clearSession() {
        writeQueue = writeQueue
            .catch(() => {})
            .then(async () => {
                try {
                    await messagesTable.where('sessionId').equals(SESSION_ID).delete();
                    await sessionsTable.delete(SESSION_ID);
                    return { ok: true };
                } catch (error) {
                    console.error('[Assistant] 清空会话失败:', error);
                    return {
                        ok: false,
                        error: describeSessionStoreError(error),
                    };
                }
            });
        return writeQueue;
    }

    async function restoreSession() {
        try {
            const session = await sessionsTable.get(SESSION_ID);
            if (!session) {
                state.messages = [];
                state.historySummary = '';
                state.archivedTurnCount = 0;
                state.sidebarCollapsed = true;
                state.localSources = [];
                state.isWorkspaceOpen = false;
                state.workspaceWidth = 520;
                state.selectedSourceId = 'all';
                state.selectedFilePath = '';
                state.selectedTreePath = '';
                state.fileSearchQuery = '';
                state.showModifiedOnly = false;
                state.viewerMode = 'current';
                state.mobileWorkspacePane = 'tree';
                state.treeExpandedKeys = [];
                return;
            }

            const messages = await messagesTable.where('sessionId').equals(SESSION_ID).toArray();
            messages.sort((left, right) => Number(left.order || 0) - Number(right.order || 0));

            state.messages = messages
                .map((message) => normalizeRestoredMessage(message, {
                    normalizeAttachments,
                    normalizeThoughtBlocks,
                    createRequestId,
                }))
                .filter(Boolean);
            state.historySummary = String(session.historySummary || '');
            state.archivedTurnCount = 0;
            state.sidebarCollapsed = session.sidebarCollapsed !== undefined ? !!session.sidebarCollapsed : true;
            state.localSources = normalizeLocalSources(session.localSources);
            state.isWorkspaceOpen = !!session.isWorkspaceOpen;
            state.workspaceWidth = Number.isFinite(Number(session.workspaceWidth)) ? Number(session.workspaceWidth) : 520;
            state.selectedSourceId = String(session.selectedSourceId || 'all') || 'all';
            state.selectedFilePath = String(session.selectedFilePath || '');
            state.selectedTreePath = String(session.selectedTreePath || '');
            state.fileSearchQuery = String(session.fileSearchQuery || '');
            state.showModifiedOnly = !!session.showModifiedOnly;
            state.viewerMode = String(session.viewerMode || 'current');
            state.mobileWorkspacePane = String(session.mobileWorkspacePane || 'tree') === 'viewer' ? 'viewer' : 'tree';
            state.treeExpandedKeys = Array.isArray(session.treeExpandedKeys)
                ? session.treeExpandedKeys.map((item) => String(item || '')).filter(Boolean)
                : [];
        } catch (error) {
            console.error('[Assistant] 恢复会话失败:', error);
            state.messages = [];
            state.historySummary = '';
            state.archivedTurnCount = 0;
            state.sidebarCollapsed = true;
            state.localSources = [];
            state.isWorkspaceOpen = false;
            state.workspaceWidth = 520;
            state.selectedSourceId = 'all';
            state.selectedFilePath = '';
            state.selectedTreePath = '';
            state.fileSearchQuery = '';
            state.showModifiedOnly = false;
            state.viewerMode = 'current';
            state.mobileWorkspacePane = 'tree';
            state.treeExpandedKeys = [];
        }
    }

    return {
        clearSession,
        persistSession,
        restoreSession,
    };
}
