import { buildCurrentPlansContextText } from '../../agent-core/current-plans.js';
import { createDelegateRunner } from '../../agent-core/runtime/delegate-runner.js';
import {
    buildProviderMessagesFromHistory,
    filterThoughtsForTurn,
    hasVisibleText,
    mergeThoughtBlocks,
    normalizeThoughtBlocks,
    normalizeToolCalls,
    resolveResultToolCalls,
} from '../../agent-core/runtime/protocol.js';
import { createStreamingMessageController } from '../../agent-core/runtime/streaming-messages.js';
import { createLightBrakeController } from '../../agent-core/runtime/light-brake.js';
import { resolveConversationTokens } from '../../agent-core/runtime/context-tokens.js';
import { buildTavilySearchTracePayload, isTavilyConfigured } from '../../agent-core/tavily-search.js';
import { resetMessageWindow } from '../../agent-core/ui/message-windowing.js';
import { upsertBookFile } from '../shared/ebook-db.js';
import {
    EBOOK_TOOL_NAMES,
    buildEbookToolFailureResult,
    createBookToolRuntime,
    describeEbookToolCall,
    ebookPlanLedger,
    formatEbookToolResult,
    getEbookToolDefinitions,
} from '../shared/book-tools.js';
import {
    EBOOK_MAX_CONTEXT_TOKENS,
    createEbookHistoryCompactionController,
    splitEbookMessagesIntoTurns,
} from './history-compaction.js';
import {
    buildBookContextPrompt,
    buildBookTurnContextPrompt,
    buildDelegateBookContextPrompt,
    EBOOK_DELEGATE_PROMPT,
    EBOOK_SYSTEM_PROMPT,
} from './prompts.js';
import { buildConversationContextMeterStateKey } from './renderer.js';
import { safeJsonParse, safeJsonStringify } from './text-utils.js';

const MAX_TOOL_ROUNDS = 48;
const EBOOK_STREAM_RENDER_INTERVAL_MS = 80;
function findLastUserMessageIndex(messages = []) {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
        if (messages[index]?.role === 'user') return index;
    }
    return -1;
}

function buildStoredAssistantToolCallMessage(result = {}, toolCalls = []) {
    return {
        role: 'assistant',
        content: String(result.text || ''),
        toolCalls: normalizeToolCalls(toolCalls),
        thoughts: normalizeThoughtBlocks(result.thoughts),
        providerPayload: result.providerPayload,
    };
}

function buildToolResultMessage({ toolCallId = '', toolName = '', toolResult, toolDisplay = null } = {}) {
    const message = {
        role: 'tool',
        toolCallId: String(toolCallId || ''),
        toolName: String(toolName || ''),
        content: safeJsonStringify(toolResult),
    };
    if (toolDisplay && typeof toolDisplay === 'object') {
        message.toolDisplay = toolDisplay;
    }
    return message;
}

function prefixLatestUserMessage(messages = [], contextText = '') {
    const context = String(contextText || '').trim();
    if (!context) return Array.isArray(messages) ? messages : [];
    const sourceMessages = Array.isArray(messages) ? messages : [];
    const latestUserIndex = findLastUserMessageIndex(sourceMessages);
    if (latestUserIndex < 0) return sourceMessages;
    return sourceMessages.map((message, index) => {
        if (index !== latestUserIndex || message?.role !== 'user') return message;
        return {
            ...message,
            content: [
                '[用户本轮请求]',
                String(message.content || ''),
                context,
            ].filter(Boolean).join('\n\n'),
        };
    });
}

export function buildEbookProviderMessagesFromHistory(messages = [], options = {}) {
    return buildProviderMessagesFromHistory(prefixLatestUserMessage(messages, options.latestUserContextText));
}

function buildToolTraceEntry(toolCall = {}, args = {}, result = {}) {
    const isDelegate = toolCall.name === EBOOK_TOOL_NAMES.DELEGATE_RUN;
    const isWebSearch = toolCall.name === EBOOK_TOOL_NAMES.WEB_SEARCH;
    return {
        id: String(toolCall.id || ''),
        name: toolCall.name,
        round: Number(toolCall.round) || 0,
        title: describeEbookToolCall(toolCall.name, args),
        ok: !(result && typeof result === 'object' && result.ok === false),
        summary: formatEbookToolResult(result),
        payload: isDelegate
            ? buildDelegateTracePayload(args)
            : isWebSearch
                ? buildTavilySearchTracePayload(result)
                : [],
    };
}

function buildDelegateTracePayload(args = {}) {
    return [
        ['任务', args.task],
        ['背景', args.context],
        ['交付', args.deliverable],
    ]
        .map(([label, value]) => ({
            label,
            text: String(value || '').trim(),
        }))
        .filter((item) => item.text);
}

function buildRunningToolTraceEntry(toolCall = {}, args = {}, round = 0) {
    const isDelegate = toolCall.name === EBOOK_TOOL_NAMES.DELEGATE_RUN;
    const isWebSearch = toolCall.name === EBOOK_TOOL_NAMES.WEB_SEARCH;
    return {
        id: String(toolCall.id || ''),
        name: toolCall.name,
        round: Number(round) || Number(toolCall.round) || 0,
        title: describeEbookToolCall(toolCall.name, args),
        ok: true,
        status: 'running',
        startedAt: Date.now(),
        summary: isDelegate
            ? '审稿分身工作中，等待返回。'
            : isWebSearch
                ? '联网搜索中，等待返回。'
                : '工具运行中，等待返回。',
        payload: isDelegate
            ? buildDelegateTracePayload(args)
            : isWebSearch
                ? buildTavilySearchTracePayload({ query: args.query })
                : [],
    };
}

function resolveRunningToolTraceEntry(entry = {}, toolCall = {}, args = {}, result = {}) {
    Object.assign(entry, buildToolTraceEntry(toolCall, args, result), {
        status: 'resolved',
        finishedAt: Date.now(),
    });
    if (Number(entry.startedAt)) {
        entry.elapsedMs = Math.max(0, Number(entry.finishedAt) - Number(entry.startedAt));
    }
    return entry;
}

function buildToolDisplayFromTrace(entry = {}) {
    if (!entry || typeof entry !== 'object') return null;
    return {
        title: String(entry.title || entry.name || ''),
        status: entry.status === 'running' ? 'running' : 'resolved',
        payload: Array.isArray(entry.payload) ? entry.payload : [],
        elapsedMs: Number(entry.elapsedMs) || 0,
    };
}

function buildDelegateProgressLabel(event = {}) {
    if (event.type === 'started') return '启动';
    if (event.type === 'round_start') return `第 ${Number(event.round) || 1} 轮`;
    if (event.type === 'model_result') return '模型';
    if (event.type === 'tool_start') return '工具';
    if (event.type === 'tool_result') return event.ok === false ? '失败' : '返回';
    if (event.type === 'completed') return '完成';
    return '进度';
}

function buildDelegateProgressText(event = {}) {
    const summary = String(event.summary || '').trim();
    if (event.type === 'tool_start') {
        const toolName = String(event.toolName || '工具');
        return summary || `${toolName} 已发起。`;
    }
    if (event.type === 'tool_result') {
        const toolName = String(event.toolName || '工具');
        const args = String(event.argsSummary || '').trim();
        const result = summary || (event.ok === false ? String(event.error || '工具失败') : '已返回');
        return args ? `${toolName} ${args}：${result}` : `${toolName}：${result}`;
    }
    return summary || '审稿分身工作中。';
}

function appendDelegateProgress(entry = {}, event = {}) {
    if (!entry || typeof entry !== 'object') return;
    entry.progress = [{
        label: buildDelegateProgressLabel(event),
        text: buildDelegateProgressText(event),
    }];
    entry.summary = buildDelegateProgressText(event);
}

function getToolArgumentSchemaHint(toolName = '') {
    if (toolName === EBOOK_TOOL_NAMES.EDIT) {
        return 'Expected Edit arguments: {"filePath":"book/...","edits":[{"oldString":"...","newString":"..."}]} or {"filePath":"book/...","edits":[{"startLine":1,"endLine":3,"newString":"..."}]} or {"filePath":"book/...","edits":[{"insertAtLine":4,"newString":"..."}]}';
    }
    if (toolName === EBOOK_TOOL_NAMES.WRITE) {
        return 'Expected Write arguments: {"filePath":"book/...","content":"..."}';
    }
    return 'Expected tool arguments must be a valid JSON object matching the tool schema.';
}

function extractPathFromRawArguments(rawArguments = '') {
    const text = String(rawArguments || '');
    const match = text.match(/"(?:filePath|path|fromPath)"\s*:\s*"([^"]*)"/);
    return match ? match[1] : '';
}

function buildInvalidToolArgumentsResult(toolCall = {}, error) {
    const rawArguments = String(toolCall?.arguments || '');
    return {
        ok: false,
        toolName: String(toolCall?.name || ''),
        path: extractPathFromRawArguments(rawArguments),
        error: 'invalid_tool_arguments',
        message: 'Tool arguments are not valid JSON. The tool was not executed. Rebuild the call with valid JSON arguments.',
        raw: error instanceof Error ? error.message : String(error || 'invalid_tool_arguments'),
        argumentLength: rawArguments.length,
        argumentPreview: rawArguments.slice(0, 500),
        schemaHint: getToolArgumentSchemaHint(toolCall?.name),
    };
}

function parseToolArguments(toolCall = {}) {
    try {
        const rawArguments = typeof toolCall.arguments === 'string' ? toolCall.arguments : '';
        const parsed = JSON.parse(rawArguments.trim() || '{}');
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error('tool_arguments_must_be_json_object');
        }
        return {
            ok: true,
            args: parsed,
        };
    } catch (error) {
        return {
            ok: false,
            args: {},
            result: buildInvalidToolArgumentsResult(toolCall, error),
        };
    }
}

function toolChangesBookFiles(toolName = '') {
    return [
        EBOOK_TOOL_NAMES.WRITE,
        EBOOK_TOOL_NAMES.EDIT,
        EBOOK_TOOL_NAMES.DELETE,
        EBOOK_TOOL_NAMES.MOVE,
        EBOOK_TOOL_NAMES.RENAME_BOOK,
    ].includes(toolName);
}

function isAbortError(error) {
    return error?.name === 'AbortError' || /aborted|assistant_aborted/i.test(String(error?.message || error || ''));
}

function findTurnUserMessageIndex(messages = [], fromIndex = 0) {
    for (let index = Math.min(fromIndex, messages.length - 1); index >= 0; index -= 1) {
        if (messages[index]?.role === 'user') return index;
    }
    return -1;
}

export function createEbookAgentRunner(deps = {}) {
    const {
        state,
        refreshBooksAndFiles,
        render,
        renderAgentSurface,
        renderPassiveSurface,
        renderToolTraceSurface,
        renderFilesSurface,
        renderEditorFileSurface,
        showToast,
        persistConversation,
        isEditorDirty,
        getActiveProviderConfig,
        createAdapter,
        renderProtocolNoticeSurface,
    } = deps;
    const renderStreamingSurface = typeof renderAgentSurface === 'function'
        ? () => {
            if (renderAgentSurface()) return;
            if (typeof renderPassiveSurface === 'function' && renderPassiveSurface()) return;
            render();
        }
        : render;
    const renderToolSurface = typeof renderToolTraceSurface === 'function'
        ? () => {
            if (!renderToolTraceSurface()) renderStreamingSurface();
        }
        : renderStreamingSurface;
    const renderBookFileSurfaces = () => {
        let rendered = false;
        if (typeof renderFilesSurface === 'function') {
            rendered = renderFilesSurface() || rendered;
        }
        if (typeof renderEditorFileSurface === 'function') {
            rendered = renderEditorFileSurface() || rendered;
        }
        if (!rendered) render();
    };

    async function buildCurrentPlansContext(bookId = state.book?.id) {
        if (!bookId) return '';
        return await buildCurrentPlansContextText({
            sessionId: bookId,
            ledger: ebookPlanLedger,
        });
    }

    function buildMessagesForRun(currentPlansText = '', options = {}) {
        const book = options.book || state.book;
        const contextPrompt = buildBookContextPrompt({
            files: state.files,
        });
        const turnContextPrompt = buildBookTurnContextPrompt({
            book,
            files: state.files,
            currentPlansText,
        });
        const extraSystemMessages = [
            String(options.lightBrakeText || '').trim(),
            String(options.finalAnswerReminderText || '').trim(),
        ]
            .filter(Boolean)
            .map((content) => ({ role: 'system', content }));
        const providerMessages = buildEbookProviderMessagesFromHistory(state.messages, {
            latestUserContextText: turnContextPrompt,
        });
        // Keep the stable cache prefix limited to the two fixed system messages.
        // Transient reminders are produced mid loop, so they belong at the replay tail.
        return [
            { role: 'system', content: EBOOK_SYSTEM_PROMPT },
            { role: 'system', content: contextPrompt },
            ...providerMessages,
            ...extraSystemMessages,
        ];
    }

    const COMPACTION_OVERLAY_MIN_VISIBLE_MS = 3000;
    let compactionOverlayHideTimer = null;
    let protocolNoticeHideTimer = null;

    function clearCompactionOverlayHideTimer() {
        if (compactionOverlayHideTimer) {
            globalThis.clearTimeout(compactionOverlayHideTimer);
            compactionOverlayHideTimer = null;
        }
    }

    function updateCompactionOverlay(patch = {}) {
        const previous = state.compactionOverlay || {};
        const nextId = patch.id || previous.id || `compaction-${Date.now()}`;
        const visibleSince = Number(patch.visibleSince)
            || (previous.id === nextId ? Number(previous.visibleSince) : 0)
            || Date.now();
        state.compactionOverlay = {
            active: true,
            resolved: false,
            currentTokens: 0,
            yieldTokens: 0,
            triggerTokens: 0,
            status: '正在释放较早对话...',
            ...previous,
            ...patch,
            id: nextId,
            visibleSince,
        };
    }

    function scheduleCompactionOverlayHide(delayMs = COMPACTION_OVERLAY_MIN_VISIBLE_MS) {
        const overlayId = state.compactionOverlay?.id || '';
        const visibleSince = Number(state.compactionOverlay?.visibleSince) || Date.now();
        const elapsedMs = Math.max(0, Date.now() - visibleSince);
        const waitMs = Math.max(0, delayMs - elapsedMs);
        clearCompactionOverlayHideTimer();
        compactionOverlayHideTimer = globalThis.setTimeout(() => {
            compactionOverlayHideTimer = null;
            if (!overlayId || state.compactionOverlay?.id !== overlayId) return;
            state.compactionOverlay = null;
            render();
        }, waitMs);
    }

    function clearProtocolNoticeHideTimer() {
        if (protocolNoticeHideTimer) {
            globalThis.clearTimeout(protocolNoticeHideTimer);
            protocolNoticeHideTimer = null;
        }
    }

    function showProtocolNotice(message = '工具协议异常，正在切换兼容模式重试…') {
        clearProtocolNoticeHideTimer();
        state.protocolNotice = {
            id: `protocol-notice-${Date.now()}`,
            message,
        };
        if (typeof renderProtocolNoticeSurface !== 'function' || !renderProtocolNoticeSurface()) {
            renderStreamingSurface();
        }
        const noticeId = state.protocolNotice.id;
        protocolNoticeHideTimer = globalThis.setTimeout(() => {
            protocolNoticeHideTimer = null;
            if (state.protocolNotice?.id !== noticeId) return;
            state.protocolNotice = null;
            if (typeof renderProtocolNoticeSurface !== 'function' || !renderProtocolNoticeSurface()) {
                renderStreamingSurface();
            }
        }, 1300);
    }

    const compactionController = createEbookHistoryCompactionController({
        state,
        render,
        showToast,
        persistConversation,
        getActiveProviderConfig,
        buildProviderMessages: () => buildMessagesForRun(''),
        getToolDefinitions: () => getEbookToolDefinitions({
            webSearchEnabled: isTavilyConfigured(getActiveProviderConfig()),
        }),
        onCompactionStart: (event = {}) => {
            clearCompactionOverlayHideTimer();
            updateCompactionOverlay({
                id: `compaction-${Date.now()}`,
                ...event,
            });
        },
        onCompactionProgress: (event = {}) => {
            updateCompactionOverlay(event);
        },
        onCompactionComplete: (event = {}) => {
            updateCompactionOverlay({
                ...event,
                resolved: true,
            });
            scheduleCompactionOverlayHide();
        },
        onCompactionUnable: (event = {}) => {
            updateCompactionOverlay(event);
            scheduleCompactionOverlayHide();
        },
    });

    const delegateRunner = createDelegateRunner({
        createAdapter,
        executeToolCall: async (toolCall, args, parentRun = {}) => {
            const runtime = createBookToolRuntime({
                getBookId: () => parentRun.bookId || state.book?.id,
                getSearchConfig: () => getActiveProviderConfig({ role: 'delegate' }),
                signal: parentRun?.controller?.signal,
                readOnly: true,
                isAbortError,
            });
            try {
                return await runtime.execute(toolCall.name, args);
            } catch (error) {
                if (isAbortError(error)) throw error;
                return buildEbookToolFailureResult(toolCall.name, args, error);
            }
        },
        getActiveProviderConfig,
        getDelegateProviderConfig: () => getActiveProviderConfig({ role: 'delegate' }),
        getSystemPrompt: () => EBOOK_DELEGATE_PROMPT,
        resolveToolDefinitions: () => getEbookToolDefinitions({
            readOnly: true,
            webSearchEnabled: isTavilyConfigured(getActiveProviderConfig({ role: 'delegate' })),
        }),
        safeJsonParse,
        isAbortError,
        TOOL_NAMES: EBOOK_TOOL_NAMES,
        maxRounds: 16,
    });

    async function runDelegate(args = {}, parentRun = {}) {
        let currentPlansText = '';
        try {
            currentPlansText = await buildCurrentPlansContext(parentRun.bookId || state.book?.id);
        } catch {
            currentPlansText = '';
        }
        const autoContext = buildDelegateBookContextPrompt({
            book: parentRun.book || state.book,
            files: state.files,
            currentPlansText,
        });
        const callerContext = String(args.context || '').trim();
        const context = [
            autoContext,
            callerContext ? `[主助手本次补充]\n${callerContext}` : '',
        ].filter(Boolean).join('\n\n');
        return await delegateRunner.runDelegate({ ...args, context }, parentRun);
    }

    async function runAgent(userText = '', options = {}) {
        const taskText = String(userText || '').trim();
        if (!taskText || state.isBusy || !state.book) return;
        const appendUserMessage = options.appendUserMessage !== false;
        const initialBookId = state.book.id;
        const controller = new AbortController();
        state.isBusy = true;
        state.isCancellingRun = false;
        state.activeController = controller;
        state.status = 'AI 正在阅读作品...';
        state.agentAutoScroll = true;
        state.agentForceScrollBottomOnce = true;
        resetMessageWindow(state);
        compactionController.resetCompactionState();
        clearCompactionOverlayHideTimer();
        state.compactionOverlay = null;
        state.toolTrace = [];
        state.liveToolTurn = null;
        state.editingMessageIndex = -1;
        if (appendUserMessage) {
            state.messages.push({ role: 'user', content: taskText });
        }
        state.activeTurnStartIndex = findLastUserMessageIndex(state.messages);
        render();
        try {
            if (isEditorDirty() && state.selectedPath) {
                await upsertBookFile(initialBookId, state.selectedPath, state.editorContent);
            }
            await refreshBooksAndFiles();
        } catch (error) {
            state.isBusy = false;
            state.isCancellingRun = false;
            state.activeController = null;
            state.status = '就绪';
            state.messages.push({
                role: 'assistant',
                content: `AI 操作失败：${error?.message || error}`,
                error: true,
            });
            await persistConversation?.(initialBookId);
            render();
            return;
        }
        if (controller.signal.aborted) {
            state.isBusy = false;
            state.isCancellingRun = false;
            state.activeController = null;
            state.status = '就绪';
            state.messages.push({ role: 'assistant', content: '已取消本次操作。', error: true });
            await persistConversation?.(initialBookId);
            render();
            return;
        }
        if (!state.book) {
            state.isBusy = false;
            state.isCancellingRun = false;
            state.activeController = null;
            state.status = '就绪';
            render();
            return;
        }
        const runBook = { ...state.book };
        const runBookId = runBook.id;
        await persistConversation?.(runBookId);

        const providerConfig = getActiveProviderConfig();
        let streamingAssistantMessage = null;

        function removeStreamingAssistantMessage(message = streamingAssistantMessage) {
            if (!message) return;
            const index = state.messages.indexOf(message);
            if (index >= 0) {
                state.messages.splice(index, 1);
            }
            if (message === streamingAssistantMessage) {
                streamingAssistantMessage = null;
            }
        }

        function filterThoughtsForCurrentTurn(thoughts = [], currentMessage = null) {
            const turns = splitEbookMessagesIntoTurns(state.messages);
            const currentTurn = turns.length ? turns[turns.length - 1] : [];
            return filterThoughtsForTurn(thoughts, currentTurn, {
                currentMessage,
            });
        }

        const {
            createStreamingAssistantMessage,
            finalizeStreamingAssistantMessage,
            scheduleStreamRender,
            updateStreamingAssistantMessage: updateStreamingMessage,
        } = createStreamingMessageController({
            state,
            render: renderStreamingSurface,
            persistSession: () => {
                void persistConversation?.(runBookId);
            },
            filterThoughtsForCurrentTurn,
            minRenderIntervalMs: EBOOK_STREAM_RENDER_INTERVAL_MS,
        });

        try {
            const adapter = createAdapter(providerConfig);
            const runtime = createBookToolRuntime({
                getBookId: () => runBookId,
                onFilesChanged: refreshBooksAndFiles,
                getSearchConfig: () => providerConfig,
                signal: controller.signal,
                isAbortError,
                runDelegate: async (args) => await runDelegate(args, { controller, bookId: runBookId, book: runBook }),
            });
            const tools = runtime.getToolDefinitions();
            const allowedToolNames = new Set(tools.map((definition) => definition.function.name));
            let sawToolExecution = false;
            let finalAnswerReminderSent = false;
            let pendingToolResponses = null;
            let pendingFinalAnswerReminderText = '';
            const providerMessageOptions = {
                finalAnswerReminderText: '',
            };
            const lightBrake = createLightBrakeController();

            function recordToolResultForLightBrake(toolCall = {}, toolResult = {}) {
                if (toolResult && typeof toolResult === 'object' && toolResult.ok === false) {
                    lightBrake.record(toolCall.name, toolResult.error || toolResult.message || 'tool_failed');
                    return;
                }
                lightBrake.reset();
            }

            async function buildReplayMessages() {
                let currentPlansText = '';
                try {
                    currentPlansText = await buildCurrentPlansContext(runBookId);
                } catch {
                    currentPlansText = '';
                }
                const messages = buildMessagesForRun(currentPlansText, {
                    book: runBook,
                    lightBrakeText: lightBrake.getMessage(),
                    finalAnswerReminderText: providerMessageOptions.finalAnswerReminderText,
                });
                providerMessageOptions.finalAnswerReminderText = '';
                return messages;
            }

            async function updateContextMeterFromRequest(messages = []) {
                if (!Array.isArray(messages) || !messages.length) return;
                const updateSerial = (Number(state.contextStatsRequestSerial) || 0) + 1;
                state.contextStatsRequestSerial = updateSerial;
                try {
                    const usedTokens = await resolveConversationTokens({
                        messages,
                        tools,
                        providerConfig,
                    });
                    const currentStateKey = buildConversationContextMeterStateKey(state, providerConfig);
                    if (
                        updateSerial !== state.contextStatsRequestSerial
                        || !Number.isFinite(usedTokens)
                        || controller.signal.aborted
                    ) return;
                    state.contextStats = {
                        usedTokens,
                        budgetTokens: EBOOK_MAX_CONTEXT_TOKENS,
                        summaryActive: false,
                        source: 'resolved',
                        stateKey: currentStateKey,
                        updatedAt: Date.now(),
                    };
                    renderStreamingSurface();
                } catch {
                    // The renderer keeps its local estimate if tokenizer counting is unavailable.
                }
            }

            function dropStreamingAssistantMessage() {
                removeStreamingAssistantMessage(streamingAssistantMessage);
            }

            function updateStreamingAssistantMessage(snapshot = {}) {
                const hasText = typeof snapshot.text === 'string';
                const hasThoughts = Array.isArray(snapshot.thoughts);
                if (!hasText && !hasThoughts) return;
                if (!streamingAssistantMessage) {
                    streamingAssistantMessage = createStreamingAssistantMessage();
                }
                updateStreamingMessage(streamingAssistantMessage, {
                    ...(hasText ? { content: snapshot.text } : {}),
                    ...(hasThoughts ? { thoughts: mergeThoughtBlocks(snapshot.thoughts) } : {}),
                });
                scheduleStreamRender();
            }

            for (let round = 1; round <= MAX_TOOL_ROUNDS; round += 1) {
                state.status = round === 1 ? 'AI 正在思考...' : `AI 正在处理工具结果（${round}/${MAX_TOOL_ROUNDS}）...`;
                renderStreamingSurface();
                let result;
                try {
                    const requestTask = {
                        systemPrompt: EBOOK_SYSTEM_PROMPT,
                        tools,
                        toolChoice: 'auto',
                        temperature: providerConfig.temperature,
                        maxTokens: providerConfig.maxTokens,
                        reasoning: {
                            enabled: providerConfig.reasoningEnabled,
                            effort: providerConfig.reasoningEffort,
                        },
                        signal: controller.signal,
                        onStreamProgress: updateStreamingAssistantMessage,
                        onToolProtocolFallback: () => {
                            showProtocolNotice();
                        },
                    };

                    if (Array.isArray(pendingToolResponses) && pendingToolResponses.length && adapter?.supportsSessionToolLoop) {
                        requestTask.toolResponses = pendingToolResponses;
                    } else if (pendingFinalAnswerReminderText && adapter?.supportsSessionToolLoop) {
                        requestTask.finalAnswerReminderText = pendingFinalAnswerReminderText;
                        pendingFinalAnswerReminderText = '';
                    } else {
                        await compactionController.ensureContextBudget(adapter, controller.signal);
                        requestTask.messages = await buildReplayMessages();
                        void updateContextMeterFromRequest(requestTask.messages);
                    }

                    console.info('[Ebook][ModelRequest] round:start', {
                        round,
                        provider: String(providerConfig?.provider || ''),
                        model: String(providerConfig?.model || ''),
                        toolMode: String(providerConfig?.toolMode || ''),
                        usesSessionToolLoop: !!adapter?.supportsSessionToolLoop,
                        usesToolResponses: Array.isArray(requestTask.toolResponses) && requestTask.toolResponses.length > 0,
                        toolResponseCount: Array.isArray(requestTask.toolResponses) ? requestTask.toolResponses.length : 0,
                        usesFinalAnswerReminder: !!requestTask.finalAnswerReminderText,
                        messageCount: Array.isArray(requestTask.messages) ? requestTask.messages.length : 0,
                    });
                    result = await adapter.chat(requestTask);
                    console.info('[Ebook][ModelRequest] round:result', {
                        round,
                        provider: String(providerConfig?.provider || ''),
                        finishReason: String(result?.finishReason || ''),
                        textLength: typeof result?.text === 'string' ? result.text.length : 0,
                        toolCallCount: Array.isArray(result?.toolCalls) ? result.toolCalls.length : 0,
                        hasProviderPayload: !!(result?.providerPayload && typeof result.providerPayload === 'object'),
                    });
                } catch (error) {
                    console.error('[Ebook][ModelRequest] round:error', {
                        round,
                        provider: String(providerConfig?.provider || ''),
                        model: String(providerConfig?.model || ''),
                        message: error instanceof Error ? error.message : String(error || ''),
                    });
                    if (streamingAssistantMessage) {
                        finalizeStreamingAssistantMessage(streamingAssistantMessage);
                        streamingAssistantMessage = null;
                    }
                    throw error;
                }

                const toolCalls = resolveResultToolCalls(result, providerConfig, {
                    fallbackPrefix: 'ebook-tool',
                });
                if (toolCalls.length) {
                    pendingToolResponses = null;
                    sawToolExecution = true;
                    const parsedToolCalls = toolCalls.map((toolCall) => ({
                        toolCall,
                        parsedArguments: parseToolArguments(toolCall),
                    }));
                    const storedToolCalls = parsedToolCalls.map(({ toolCall, parsedArguments }) => {
                        if (parsedArguments.ok) return toolCall;
                        const rawArguments = String(toolCall.arguments || '');
                        return {
                            ...toolCall,
                            arguments: safeJsonStringify({
                                invalidToolArguments: true,
                                argumentLength: rawArguments.length,
                                argumentPreview: rawArguments.slice(0, 500),
                            }),
                        };
                    });
                    const visibleText = String(result.text || streamingAssistantMessage?.content || '');
                    const visibleThoughts = filterThoughtsForCurrentTurn(
                        mergeThoughtBlocks(streamingAssistantMessage?.thoughts, result.thoughts),
                        streamingAssistantMessage,
                    );
                    dropStreamingAssistantMessage();
                    const storedAssistantToolMessage = buildStoredAssistantToolCallMessage({
                        ...result,
                        text: visibleText,
                        thoughts: visibleThoughts,
                    }, storedToolCalls);
                    state.liveToolTurn = storedAssistantToolMessage;
                    renderToolSurface();
                    const storedToolMessages = [];
                    const toolResponses = [];
                    for (const { toolCall, parsedArguments } of parsedToolCalls) {
                        if (controller.signal.aborted) throw new Error('assistant_aborted');
                        const args = parsedArguments.args;
                        const isDelegateTool = toolCall.name === EBOOK_TOOL_NAMES.DELEGATE_RUN;
                        const liveTraceEntry = isDelegateTool ? buildRunningToolTraceEntry(toolCall, args, round) : null;
                        if (liveTraceEntry) {
                            state.toolTrace.push(liveTraceEntry);
                            renderToolSurface();
                        }
                        let toolResult;
                        if (!allowedToolNames.has(toolCall.name)) {
                            toolResult = {
                                ok: false,
                                error: 'ebook_tool_not_available',
                                message: `${toolCall.name} 不在电纸书工具表中。`,
                            };
                        } else if (!parsedArguments.ok) {
                            toolResult = parsedArguments.result;
                        } else {
                            try {
                                if (isDelegateTool) {
                                    toolResult = await runDelegate(args, {
                                        controller,
                                        bookId: runBookId,
                                        book: runBook,
                                        onDelegateProgress: (event) => {
                                            appendDelegateProgress(liveTraceEntry, event);
                                            renderToolSurface();
                                        },
                                    });
                                } else {
                                    toolResult = await runtime.execute(toolCall.name, args);
                                }
                            } catch (error) {
                                if (isAbortError(error)) throw error;
                                toolResult = buildEbookToolFailureResult(toolCall.name, args, error);
                            }
                        }
                        const traceEntry = liveTraceEntry
                            ? resolveRunningToolTraceEntry(liveTraceEntry, { ...toolCall, round }, args, toolResult)
                            : buildToolTraceEntry({ ...toolCall, round }, args, toolResult);
                        if (!liveTraceEntry) {
                            state.toolTrace.push(traceEntry);
                        }
                        const toolMessage = buildToolResultMessage({
                            toolCallId: toolCall.id,
                            toolName: toolCall.name,
                            toolResult,
                            toolDisplay: isDelegateTool ? buildToolDisplayFromTrace(traceEntry) : null,
                        });
                        storedToolMessages.push(toolMessage);
                        toolResponses.push({
                            id: toolCall.id,
                            name: toolCall.name,
                            response: toolResult,
                        });
                        recordToolResultForLightBrake(toolCall, toolResult);
                        if (toolChangesBookFiles(toolCall.name)) {
                            renderBookFileSurfaces();
                        }
                        renderToolSurface();
                    }
                    state.messages.push(storedAssistantToolMessage, ...storedToolMessages);
                    await persistConversation?.(runBookId);
                    state.toolTrace = [];
                    state.liveToolTurn = null;
                    if (adapter?.supportsSessionToolLoop) {
                        pendingToolResponses = toolResponses;
                    }
                    continue;
                }

                pendingToolResponses = null;
                if (!hasVisibleText(result?.text) && sawToolExecution && !finalAnswerReminderSent) {
                    finalAnswerReminderSent = true;
                    const reminder = '你已经拿到了本轮全部工具结果。现在不要再调用任何工具，直接给出电纸书操作结论。';
                    dropStreamingAssistantMessage();
                    if (adapter?.supportsSessionToolLoop) {
                        pendingFinalAnswerReminderText = reminder;
                    } else {
                        providerMessageOptions.finalAnswerReminderText = reminder;
                    }
                    continue;
                }

                const text = String(result?.text || streamingAssistantMessage?.content || '').trim();
                if (!text) {
                    dropStreamingAssistantMessage();
                    throw new Error('模型没有返回有效结论。');
                }
                const finalMessage = {
                    role: 'assistant',
                    content: text,
                    thoughts: filterThoughtsForCurrentTurn(
                        mergeThoughtBlocks(streamingAssistantMessage?.thoughts, result.thoughts),
                        streamingAssistantMessage,
                    ),
                    providerPayload: result.providerPayload,
                };
                if (streamingAssistantMessage) {
                    finalizeStreamingAssistantMessage(streamingAssistantMessage, finalMessage);
                    streamingAssistantMessage = null;
                } else {
                    state.messages.push(finalMessage);
                }
                state.status = '就绪';
                await refreshBooksAndFiles();
                await persistConversation?.(runBookId);
                void buildReplayMessages()
                    .then((messages) => updateContextMeterFromRequest(messages))
                    .catch(() => {});
                return;
            }
            throw new Error('工具轮次达到上限，已停止。');
        } catch (error) {
            if (streamingAssistantMessage) {
                finalizeStreamingAssistantMessage(streamingAssistantMessage);
                streamingAssistantMessage = null;
            } else {
                const staleStreamingMessage = state.messages.find((message) => message?.streaming);
                if (staleStreamingMessage) finalizeStreamingAssistantMessage(staleStreamingMessage);
            }
            const message = isAbortError(error) ? '已取消本次操作。' : `AI 操作失败：${error?.message || error}`;
            state.messages.push({ role: 'assistant', content: message, error: true });
            state.status = '就绪';
            await persistConversation?.(runBookId);
        } finally {
            state.isBusy = false;
            state.isCancellingRun = false;
            state.activeController = null;
            state.toolTrace = [];
            state.liveToolTurn = null;
            state.activeTurnStartIndex = -1;
            await refreshBooksAndFiles().catch(() => {});
            render();
        }
    }

    function cancelActiveRun() {
        if (!state.isBusy || !state.activeController) return false;
        if (!state.isCancellingRun) {
            state.isCancellingRun = true;
            state.status = '正在停止...';
            renderStreamingSurface();
        }
        if (!state.activeController.signal?.aborted) {
            state.activeController.abort();
        }
        return true;
    }

    async function rerunFromMessageIndex(messageIndex = -1) {
        if (state.isBusy || !state.book) return {
            ok: false,
            error: 'ebook_busy',
        };
        const index = Number(messageIndex);
        if (!Number.isInteger(index) || index < 0) return {
            ok: false,
            error: 'message_index_invalid',
        };
        const targetMessage = state.messages[index];
        const turnUserIndex = targetMessage?.role === 'user'
            ? index
            : findTurnUserMessageIndex(state.messages, index - 1);
        const latestUserMessage = turnUserIndex >= 0 ? state.messages[turnUserIndex] : null;
        const taskText = String(latestUserMessage?.content || '').trim();
        if (!taskText) return {
            ok: false,
            error: 'rerun_user_message_missing',
        };
        state.messages = state.messages.slice(0, turnUserIndex + 1);
        state.toolTrace = [];
        state.liveToolTurn = null;
        state.editingMessageIndex = -1;
        await persistConversation?.(state.book.id);
        render();
        await runAgent(taskText, { appendUserMessage: false });
        return { ok: true };
    }

    return {
        cancelActiveRun,
        rerunFromMessageIndex,
        runAgent,
        runDelegate,
    };
}
