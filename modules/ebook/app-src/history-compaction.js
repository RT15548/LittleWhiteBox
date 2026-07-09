import { resolveConversationTokens } from '../../agent-core/runtime/context-tokens.js';
import { resetMessageWindow } from '../../agent-core/ui/message-windowing.js';

export const EBOOK_MAX_CONTEXT_TOKENS = 188000;
export const EBOOK_SUMMARY_TRIGGER_TOKENS = 158000;
export const EBOOK_DEFAULT_PRESERVED_TURNS = 2;
export const EBOOK_MIN_PRESERVED_TURNS = 1;

function isAbortError(error) {
    return error?.name === 'AbortError' || /abort/i.test(String(error?.message || error || ''));
}

function throwIfAborted(signal) {
    if (signal?.aborted) {
        const error = new Error('Context compaction aborted.');
        error.name = 'AbortError';
        throw error;
    }
}

export function splitEbookMessagesIntoTurns(messages = []) {
    const turns = [];
    let currentTurn = [];

    (messages || []).forEach((message) => {
        if (!message || !['user', 'assistant', 'tool'].includes(message.role)) return;
        if (message.role === 'user' && currentTurn.length) {
            turns.push(currentTurn);
            currentTurn = [message];
            return;
        }
        currentTurn.push(message);
    });

    if (currentTurn.length) {
        turns.push(currentTurn);
    }
    return turns.filter((turn) => turn.length);
}

export function createEbookHistoryCompactionController(deps = {}) {
    const {
        state,
        render = () => {},
        persistConversation = () => {},
        showToast = () => {},
        getActiveProviderConfig = () => ({}),
        buildProviderMessages = () => [],
        getToolDefinitions = () => [],
        onCompactionStart = () => {},
        onCompactionProgress = () => {},
        onCompactionComplete = () => {},
        onCompactionUnable = () => {},
        summaryTriggerTokens = EBOOK_SUMMARY_TRIGGER_TOKENS,
        defaultPreservedTurns = EBOOK_DEFAULT_PRESERVED_TURNS,
        minPreservedTurns = EBOOK_MIN_PRESERVED_TURNS,
    } = deps;

    async function estimateCurrentTokens() {
        const providerConfig = getActiveProviderConfig();
        const toolDefinitions = getToolDefinitions();
        return await resolveConversationTokens({
            messages: buildProviderMessages(),
            tools: Array.isArray(toolDefinitions) ? toolDefinitions : [],
            providerConfig,
        });
    }

    function getActiveContextMessages() {
        const turns = splitEbookMessagesIntoTurns(state.messages);
        const archivedCount = Math.min(state.archivedTurnCount, turns.length);
        return turns.slice(archivedCount).flat();
    }

    function pruneArchivedTurnsFromState() {
        const turns = splitEbookMessagesIntoTurns(state.messages);
        const archivedCount = Math.min(state.archivedTurnCount, turns.length);
        if (archivedCount <= 0) return false;
        state.messages = turns.slice(archivedCount).flat();
        state.archivedTurnCount = 0;
        state.historySummary = '';
        resetMessageWindow(state);
        return true;
    }

    function resetCompactionState() {
        state.archivedTurnCount = 0;
        state.historySummary = '';
    }

    async function ensureContextBudget(_adapter, signal) {
        throwIfAborted(signal);
        const initialTokens = await estimateCurrentTokens();
        if (initialTokens <= summaryTriggerTokens) {
            return;
        }
        throwIfAborted(signal);
        onCompactionStart({
            currentTokens: initialTokens,
            triggerTokens: summaryTriggerTokens,
            status: '正在释放较早对话，只保留最近创作上下文...',
        });

        for (const preservedTurns of [defaultPreservedTurns, minPreservedTurns]) {
            const turns = splitEbookMessagesIntoTurns(state.messages);
            const desiredArchivedTurnCount = Math.max(
                state.archivedTurnCount,
                turns.length - Math.min(preservedTurns, turns.length),
            );
            if (desiredArchivedTurnCount > state.archivedTurnCount) {
                throwIfAborted(signal);
                const previousStatus = state.status;
                state.status = '正在释放较早对话...';
                onCompactionProgress({
                    currentTokens: initialTokens,
                    triggerTokens: summaryTriggerTokens,
                    status: `正在只保留最近 ${preservedTurns} 轮创作上下文...`,
                });
                render();
                try {
                    throwIfAborted(signal);
                    state.archivedTurnCount = desiredArchivedTurnCount;
                    pruneArchivedTurnsFromState();
                    await persistConversation();
                } catch (error) {
                    state.status = previousStatus || '就绪';
                    render();
                    if (isAbortError(error)) return;
                    throw error;
                }
                state.status = previousStatus || '就绪';
                render();
                if (signal?.aborted) return;

                const currentTokens = await estimateCurrentTokens();
                throwIfAborted(signal);
                const status = currentTokens <= summaryTriggerTokens
                    ? `已只保留最近 ${preservedTurns} 轮创作上下文。`
                    : '最近创作上下文仍然过长，继续收缩...';
                onCompactionProgress({
                    currentTokens: initialTokens,
                    yieldTokens: currentTokens,
                    triggerTokens: summaryTriggerTokens,
                    status,
                });
                if (currentTokens <= summaryTriggerTokens) {
                    showToast(`已释放较早对话，只保留最近 ${preservedTurns} 轮。`);
                    onCompactionComplete({
                        currentTokens: initialTokens,
                        yieldTokens: currentTokens,
                        triggerTokens: summaryTriggerTokens,
                        status,
                    });
                    render();
                    return;
                }
                continue;
            }

            const currentTokens = await estimateCurrentTokens();
            throwIfAborted(signal);
            onCompactionProgress({
                currentTokens: initialTokens,
                yieldTokens: currentTokens,
                triggerTokens: summaryTriggerTokens,
                status: currentTokens <= summaryTriggerTokens
                    ? `已只保留最近 ${preservedTurns} 轮创作上下文。`
                    : '最近创作上下文仍然过长，继续收缩...',
            });
            if (currentTokens <= summaryTriggerTokens) {
                showToast(`已释放较早对话，只保留最近 ${preservedTurns} 轮。`);
                onCompactionComplete({
                    currentTokens: initialTokens,
                    yieldTokens: currentTokens,
                    triggerTokens: summaryTriggerTokens,
                    status: `已只保留最近 ${preservedTurns} 轮创作上下文。`,
                });
                render();
                return;
            }
        }

        showToast('当前这一轮上下文本身已经过长，请结束、拆分任务或重新开始。');
        onCompactionUnable({
            currentTokens: initialTokens,
            triggerTokens: summaryTriggerTokens,
            status: '当前这一轮过长，无法继续自动收缩。',
        });
        render();
    }

    return {
        ensureContextBudget,
        estimateCurrentTokens,
        getActiveContextMessages,
        pruneArchivedTurnsFromState,
        resetCompactionState,
    };
}
