import { HISTORY_PAGE_SIZE, HISTORY_WINDOW_LIMIT } from '../domain/context-policy.js';
import type { FourthWallChatState, FourthWallHistoryPage } from '../types.js';
import { jsonValuesEqual } from '../../../host/json-values-equal.js';

/** One foreground window. Revisions invalidate index-based edits/pages, never persist. */
export function createFourthWallHistoryView() {
    let revision = 0;
    let sessionId = '';
    let start = 0;
    let end = 0;
    let total = 0;
    let projected: FourthWallHistoryPage | null = null;

    function project(state: FourthWallChatState, changed = true): FourthWallHistoryPage {
        const session = state.sessions.find(item => item.id === state.activeSessionId)!;
        if (session.id !== sessionId) {
            sessionId = session.id;
            end = session.history.length;
            start = Math.max(0, end - HISTORY_PAGE_SIZE);
        } else if (end === total) {
            end = session.history.length;
            start = Math.max(0, Math.min(start, end), end - HISTORY_WINDOW_LIMIT);
        } else {
            end = Math.min(end, session.history.length);
            start = Math.min(start, Math.max(0, end - 1));
        }
        total = session.history.length;
        if (changed) { revision++; }
        projected = { sessionId, revision, start, total, messages: structuredClone(session.history.slice(start, end)) };
        return structuredClone(projected);
    }

    function assertRevision(value: unknown): void {
        if (value !== revision) { throw new Error('聊天记录已变化，请刷新后重试'); }
    }

    return {
        project, assertRevision,
        assertMessage(state: FourthWallChatState, index: number, expectedRevision: unknown) {
            assertRevision(expectedRevision);
            const expected = projected?.messages[index - projected.start];
            const current = state.sessions.find(item => item.id === sessionId)?.history[index];
            if (!expected || !jsonValuesEqual(expected, current)) { throw new Error('消息已变化，请刷新后重试'); }
        },
        page(state: FourthWallChatState, direction: unknown, expectedRevision: unknown) {
            assertRevision(expectedRevision);
            let from = start;
            let to = end;
            if (direction === 'earlier') {
                to = start;
                start = Math.max(0, start - HISTORY_PAGE_SIZE);
                from = start;
                end = Math.min(end, start + HISTORY_WINDOW_LIMIT);
            } else if (direction === 'later') {
                from = end;
                end = Math.min(total, end + HISTORY_PAGE_SIZE);
                to = end;
                start = Math.max(start, end - HISTORY_WINDOW_LIMIT);
            } else if (direction === 'latest') {
                end = total;
                start = Math.max(0, end - HISTORY_PAGE_SIZE);
                from = start; to = end;
            } else { throw new Error('历史分页方向无效'); }
            const window = project(state, false);
            return { ...window, start: from, messages: window.messages.slice(from - window.start, to - window.start) };
        },
        reset() { sessionId = ''; revision++; start = 0; end = 0; total = 0; },
    };
}
