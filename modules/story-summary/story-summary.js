// ═══════════════════════════════════════════════════════════════════════════
// Story Summary - 主入口
//
// 稳定目标：
// 1) "聊天时隐藏已总结" 永远只隐藏"已总结"部分，绝不影响未总结部分
// 2) 关闭隐藏 = 暴力全量 unhide，确保立刻恢复
// 3) 开启隐藏 / 改Y / 切Chat / 收新消息：先全量 unhide，再按边界重新 hide
// 4) Prompt 注入：extension_prompts + IN_CHAT + depth（动态计算，最小为2）
// ═══════════════════════════════════════════════════════════════════════════

import { getContext } from "../../../../../extensions.js";
import {
    event_types,
    extension_prompts,
    extension_prompt_types,
    extension_prompt_roles,
    getRequestHeaders,
    chat_metadata,
} from "../../../../../../script.js";
import { EXT_ID, extensionFolderPath } from "../../core/constants.js";
import { xbLog, CacheRegistry } from "../../core/debug-core.js";
import { createModuleEvents } from "../../core/event-manager.js";
import { postToIframe, isTrustedMessage } from "../../core/iframe-messaging.js";
import { createMessageButtonOwnership } from "../../core/message-button-ownership.js";
import { initAfterAiGate, notifyAfterAiHint, registerAfterAiHandler } from "../../core/after-ai-gate.js";
import { getDefaultApiPrefix, resolveApiBaseUrl } from "../../shared/common/openai-url-utils.js";
import {
    commitIfSignalActive,
    mergeAbortSignals,
    runWithAbortDeadline,
} from "../../shared/common/abort-utils.js";
import {
    GENERATE_INTERCEPTOR_ORDER,
    registerGenerateInterceptor,
    unregisterGenerateInterceptor,
} from "../../shared/common/generate-interceptor.js";
import { scheduleDelayedNotice } from "../../shared/common/delayed-notice.js";
import {
    fetchHostOpenAICompatibleModels,
    setHostChatCompletionsRequestHeadersProvider,
} from "../../shared/host-llm/chat-completions/client.js";

// config/store
import {
    BUILTIN_SUMMARY_PROMPTS,
    getSettings,
    getSummaryPanelConfig,
    getVectorConfig,
    saveVectorConfig,
    saveSummaryPanelConfig,
    saveSummaryPanelConfigVerified,
    applySummaryPanelConfigSnapshot,
    loadConfigFromServer,
    readSummaryPanelConfigFromServer,
} from "./data/config.js";
import {
    getChatStorySummaryEnabled,
    resolveStorySummaryEnabled,
    setChatStorySummaryEnabled,
} from "./data/chat-toggle.js";
import {
    getSummaryStore,
    saveSummaryStore,
    saveSummaryStoreImmediately,
    calcHideRange,
    rollbackSummaryIfNeeded,
    rollbackSummaryOnce,
    clearSummaryData,
    getRollbackOnceTargetEndMesId,
    isSummaryConsumable,
    extractRelationshipsFromFacts,
} from "./data/store.js";
import { normalizeCharacterAliases } from "./data/character-aliases.js";
import { isRelationFact, parseRelationTarget } from "./data/fact-predicates.js";

// prompt text builder
import {
    buildVectorPromptText,
    buildNonVectorPromptText,
} from "./generate/prompt.js";
import {
    createRecallPrefetchCoordinator,
    getRecallPrefetchStartAction,
} from "./generate/recall-prefetch.js";
import { selectBestStoryMemoryResult } from "./generate/story-memory-result.js";

// summary generation
import { runSummaryGeneration } from "./generate/generator.js";
import { createSummaryGenerationCancelledError } from "./generate/llm.js";

// vector service
import { embed, getEngineFingerprint, testOnlineService } from "./vector/utils/embedder.js";
import { testL0Service } from "./vector/llm/llm-service.js";
import { testRerankService } from "./vector/llm/reranker.js";
import { buildVectorIntegrityIssues } from "./vector/integrity-policy.js";

// tokenizer
import { preload as preloadTokenizer, injectEntities, isReady as isTokenizerReady } from "./vector/utils/tokenizer.js";

// entity lexicon
import { buildEntityLexicon, buildDisplayNameMap } from "./vector/retrieval/entity-lexicon.js";

import {
    getMeta,
    updateMeta,
    saveEventVectors as saveEventVectorsToDb,
    getAllEventVectors,
    clearEventVectors,
    deleteEventVectorsByIds,
    clearAllChunks,
    saveChunks,
    saveChunkVectors,
    getStorageStats,
} from "./vector/storage/chunk-store.js";

import {
    buildIncrementalChunks,
    getChunkBuildStatus,
    chunkMessage,
    syncOnMessageDeleted,
    syncOnMessageSwiped,
} from "./vector/pipeline/chunk-builder.js";
import {
    incrementalExtractAtoms,
    clearAllAtomsAndVectors,
    getAnchorStats,
    initStateIntegration,
} from "./vector/pipeline/state-integration.js";
import {
    clearStateVectors,
    getStateAtoms,
    getStateAtomsCount,
    getStateVectorsCount,
    saveStateVectors,
    deleteStateAtomsFromFloor,
    deleteStateVectorsFromFloor,
    deleteL0IndexFromFloor,
    getL0Index,
} from "./vector/storage/state-store.js";

// vector io
import { exportVectors, importVectors, backupToServer, restoreFromServer, fetchManifest, deleteServerBackup, isDeleteUnsupportedError, getBackupFilename } from "./vector/storage/vector-io.js";
import {
    clearRecallRuntime,
    getRecallRuntimeStats,
    refreshRecallRuntime,
    retainRecallRuntimeOnly,
    shutdownRecallRuntime,
    warmRecallRuntime,
} from "./vector/runtime/runtime.js";
import {
    VECTOR_WRITE_SCOPES,
    cancelEmbeddingWriteTasks,
    cancelVectorWriteOperation,
    captureMaintenanceSnapshot,
    claimWarningCooldown,
    clearWarningCooldowns,
    clearWarningCooldownsForChat,
    invalidateMaintenanceEpoch,
    isMaintenanceSnapshotCurrent,
    isVectorWriteSessionCurrent,
    resumeVectorWriteCoordinator,
    runVectorConfigTransition,
    runVectorWriteTask,
    shutdownVectorWriteCoordinator,
    waitForVectorWrites,
} from "./vector/runtime/maintenance-coordinator.js";

import { invalidateLexicalIndex, warmupIndex, removeDocumentsByFloor, addEventDocuments } from "./vector/retrieval/lexical-index.js";

// ═══════════════════════════════════════════════════════════════════════════
// 常量
// ═══════════════════════════════════════════════════════════════════════════

const MODULE_ID = "storySummary";
const messageButtonOwnership = createMessageButtonOwnership();
const iframePath = `${extensionFolderPath}/modules/story-summary/story-summary.html`;
const VALID_SECTIONS = ["keywords", "events", "characters", "arcs", "facts"];
const MESSAGE_EVENT = "message";
const SUMMARY_MODEL_FETCH_PROVIDERS = new Set(["openai"]);
const SUMMARY_MODEL_FETCH_TIMEOUT_MS = 5000;
let chatSummaryStateChanging = false;
let activeSummaryExecution = null;

function getStorySummaryEnablement() {
    const context = getContext();
    const globalEnabled = Boolean(getSettings().storySummary?.enabled);
    const hasChat = Boolean(context?.chatId);
    const chatEnabled = hasChat
        ? getChatStorySummaryEnabled(chat_metadata, EXT_ID)
        : true;
    const effectiveEnabled = hasChat && resolveStorySummaryEnabled(globalEnabled, chatEnabled);
    return { context, hasChat, globalEnabled, chatEnabled, effectiveEnabled };
}

export function getStorySummaryChatState() {
    const { context, hasChat, globalEnabled, chatEnabled, effectiveEnabled } = getStorySummaryEnablement();
    const chat = context?.chat;
    const consumable = effectiveEnabled
        && isSummaryConsumable(getSummaryStore(), Array.isArray(chat) ? chat.length : 0);
    return {
        hasChat,
        chatId: context?.chatId || null,
        globalEnabled,
        chatEnabled,
        effectiveEnabled,
        consumable,
        changing: chatSummaryStateChanging,
    };
}

export function isStorySummaryEnabledForCurrentChat() {
    return getStorySummaryEnablement().effectiveEnabled;
}

export function isStorySummaryConsumableForCurrentChat() {
    const { context, effectiveEnabled } = getStorySummaryEnablement();
    if (!effectiveEnabled) return false;
    return isSummaryConsumable(
        getSummaryStore(),
        Array.isArray(context?.chat) ? context.chat.length : 0,
    );
}

function notifyStorySummaryChatState() {
    const state = getStorySummaryChatState();
    postToFrame({ type: "CHAT_SUMMARY_STATE", state });
    $(document).trigger("xiaobaix:storySummary:chat-state", [state]);
}

export async function setStorySummaryEnabledForCurrentChat(enabled) {
    if (chatSummaryStateChanging) {
        throw new Error("Story summary chat state is already changing");
    }
    const context = getContext();
    if (!context?.chatId) {
        throw new Error("No active chat");
    }

    const targetChatId = context.chatId;
    const targetMetadata = context.chatMetadata || chat_metadata;
    const previousEnabled = getChatStorySummaryEnabled(targetMetadata, EXT_ID);
    const nextEnabled = enabled !== false;
    if (previousEnabled === nextEnabled) {
        notifyStorySummaryChatState();
        return getStorySummaryChatState();
    }

    chatSummaryStateChanging = true;
    setChatStorySummaryEnabled(targetMetadata, EXT_ID, nextEnabled);
    if (!nextEnabled) {
        cancelActiveSummaryExecution();
        // 元数据已经在内存中生效；必须在首次 await 前封死旧召回的提交窗口。
        cancelRecallAndClearPrompt('chat-disabled');
    }

    try {
        notifyStorySummaryChatState();
        await context.saveMetadata();

        if (getContext()?.chatId === targetChatId && events) {
            await handleChatChanged();
        }
    } catch (error) {
        setChatStorySummaryEnabled(targetMetadata, EXT_ID, previousEnabled);
        if (getContext()?.chatId === targetChatId && events) {
            await handleChatChanged();
        }
        throw error;
    } finally {
        chatSummaryStateChanging = false;
        notifyStorySummaryChatState();
    }

    return getStorySummaryChatState();
}

function compactRecallRuntimeStatsForLog(statsList = getRecallRuntimeStats()) {
    if (!Array.isArray(statsList) || !statsList.length) return "[]";
    return statsList.map((item) => {
        const stats = item?.stats || item || {};
        return [
            `chat=${stats.chatId || "-"}`,
            `backend=${stats.backend || "-"}`,
            `owner=${stats.owner || "-"}`,
            `status=${stats.status || "-"}`,
            `ready=${stats.ready ? 1 : 0}`,
            `warming=${stats.warming ? 1 : 0}`,
            `chunks=${stats.chunks ?? "-"}`,
            `l1v=${stats.chunkVectors ?? "-"}`,
            `l2v=${stats.eventVectors ?? "-"}`,
            `l0v=${stats.stateVectors ?? "-"}`,
            `ver=${stats.version ?? "-"}`,
            `err=${stats.lastError || "-"}`,
        ].join(" ");
    }).join(" | ");
}

async function fetchSummaryModelsForUi(payload = {}) {
    const provider = String(payload?.provider || "").trim().toLowerCase() === "custom"
        ? "openai"
        : String(payload?.provider || "").trim().toLowerCase();
    const baseUrl = String(payload?.url || "").trim();
    const apiKey = String(payload?.apiKey || "").trim();

    if (!SUMMARY_MODEL_FETCH_PROVIDERS.has(provider)) {
        throw new Error("当前渠道不支持自动拉取模型");
    }
    if (!baseUrl) {
        throw new Error("请先填写 API URL");
    }
    if (!apiKey) {
        throw new Error("请先填写 API KEY");
    }

    const controller = new AbortController();
    const timeoutMs = Math.max(1000, Number(payload?.timeoutMs) || SUMMARY_MODEL_FETCH_TIMEOUT_MS);
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        setHostChatCompletionsRequestHeadersProvider(() => getRequestHeaders());
        return await fetchHostOpenAICompatibleModels({
            baseUrl: resolveApiBaseUrl(baseUrl, getDefaultApiPrefix(provider)),
            apiKey,
        }, { signal: controller.signal });
    } catch (error) {
        if (error?.name === "AbortError") {
            throw new Error(`请求超时（>${Math.floor(timeoutMs / 1000)}s）`);
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

function logRecallRuntimeCheckpoint(label, extra = "") {
    const suffix = extra ? ` ${extra}` : "";
    xbLog.info(MODULE_ID, `[RecallRuntime] ${label}${suffix} stats=${compactRecallRuntimeStatsForLog()}`);
}

function getCurrentRecallRuntimeStat(chatId, statsList = getRecallRuntimeStats()) {
    const list = Array.isArray(statsList) ? statsList : [];
    const current = list.find((item) => String(item?.chatId || "") === String(chatId || ""));
    if (current) return current;
    return {
        chatId: chatId || "",
        backend: "uninitialized",
        owner: "none",
        ready: false,
        warming: false,
        status: "cold",
        lastError: null,
        chunks: 0,
        chunkVectors: 0,
        eventVectors: 0,
        stateVectors: 0,
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// 状态变量
// ═══════════════════════════════════════════════════════════════════════════

let overlayCreated = false;
let frameReady = false;
let currentMesId = null;
let pendingFrameMessages = [];
let lastRecallLogText = "";
/** @type {ReturnType<typeof createModuleEvents>|null} */
let events = null;
let afterAiGateDispose = null;
let activeChatId = null;
let eventEditSyncToken = 0;

// 用户可主动取消的写入操作。取消只作用于同名操作，不连坐其他写任务。
const VECTOR_GENERATION_OPERATION = 'vector-generation';
const ANCHOR_GENERATION_OPERATION = 'anchor-generation';

// ═══════════════════════════════════════════════════════════════════════════
// TaskGuard — 互斥任务管理（summary / vector / anchor）
// ═══════════════════════════════════════════════════════════════════════════

class TaskGuard {
    #running = new Set();

    acquire(taskName) {
        if (this.#running.has(taskName)) return null;
        this.#running.add(taskName);
        let released = false;
        return () => {
            if (!released) {
                released = true;
                this.#running.delete(taskName);
            }
        };
    }

    isRunning(taskName) {
        return this.#running.has(taskName);
    }

    isAnyRunning(...taskNames) {
        return taskNames.some(t => this.#running.has(t));
    }
}

const guard = new TaskGuard();

let hideApplyTimer = null;
const HIDE_APPLY_DEBOUNCE_MS = 250;
let lexicalWarmupTimer = null;
let autoL0BackfillTimer = null;
let vectorIntegrityTimer = null;
// 完整性检查 / 延迟维护连续失败时的退避间隔（纯内存态，切聊天/停用/卸载即清零）。
let vectorIntegrityRetryDelayMs = 0;
let vectorMaintenanceRetryDelayMs = 0;
const pendingVectorMaintenanceByChat = new Map();
const autoSummaryTimers = new Map();
const LEXICAL_WARMUP_DEBOUNCE_MS = 3000;
const CHAT_CHANGE_LEXICAL_WARMUP_MS = 3000;
const AUTO_SUMMARY_DELAY_MS = 3000;
const AUTO_L0_BACKFILL_DELAY_MS = 5000;
const BACKGROUND_VISIBLE_GRACE_MS = 6000;
const VECTOR_RETRY_MAX_MS = 300000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let lastForegroundAt = Date.now();

function getBackgroundQuietWaitMs() {
    if (document.hidden) return BACKGROUND_VISIBLE_GRACE_MS;
    const now = Date.now();
    return Math.max(0, BACKGROUND_VISIBLE_GRACE_MS - (now - lastForegroundAt));
}

function handleVisibilityChangeForBackground() {
    if (!document.hidden) {
        lastForegroundAt = Date.now();
    }
}

function handleViewportChangeForBackground() {}

function isHostGenerating() {
    return !!document.body?.dataset?.generating;
}

/**
 * 后台任务（延迟维护、完整性检查）是否还该继续。
 * 模块已卸载、功能关闭、向量关闭或聊天已切走时一律停手。
 */
function isBackgroundWorkLive(chatId) {
    return !!events
        && !!getSettings().storySummary?.enabled
        && !!getVectorConfig()?.enabled
        && !isChatStale(chatId);
}

function rememberVectorMaintenance(chatId, floor = null, reason = 'unknown') {
    if (!chatId) return;
    invalidateMaintenanceEpoch();
    let entry = pendingVectorMaintenanceByChat.get(chatId);
    if (!entry) {
        entry = { floors: new Set(), reasons: new Set(), updatedAt: 0 };
        pendingVectorMaintenanceByChat.set(chatId, entry);
    }
    if (Number.isFinite(floor) && floor >= 0) entry.floors.add(Number(floor));
    entry.reasons.add(reason);
    entry.updatedAt = Date.now();
}

function clearVectorMaintenance(chatId = null) {
    if (chatId) pendingVectorMaintenanceByChat.delete(chatId);
    else pendingVectorMaintenanceByChat.clear();
}

function deferVectorIntegrityUntilMaintenance(chatId) {
    const entry = pendingVectorMaintenanceByChat.get(chatId);
    if (!entry) return false;
    entry.reasons.add('integrity-check');
    return true;
}

function finishVectorMaintenance(chatId, { forceIntegrityCheck = false } = {}) {
    const entry = pendingVectorMaintenanceByChat.get(chatId);
    const shouldCheckIntegrity = forceIntegrityCheck || entry?.reasons?.has('integrity-check');
    clearVectorMaintenance(chatId);
    vectorMaintenanceRetryDelayMs = 0;
    if (shouldCheckIntegrity && !isChatStale(chatId)) {
        scheduleVectorIntegrityCheck();
    }
}

/**
 * 维护任务被取消（配置切换 / 取消生成 / 卸载）时的收尾。
 * 必须保留待维护记录：里面可能挂着 deferVectorIntegrityUntilMaintenance 转交过来的
 * 'integrity-check' 责任，清掉就等于把那次完整性检查静默丢弃。
 */
function retryVectorMaintenanceAfterCancel(chatId) {
    if (!isBackgroundWorkLive(chatId)) return;
    scheduleAutoL0Backfill(AUTO_L0_BACKFILL_DELAY_MS, chatId);
}

/**
 * 维护任务因外部失败没做完时的收尾（embedding 请求超时、接口报错、写库异常）。
 * 与取消的区别只在退避：这里同样必须保留待维护记录，否则"没写成"会被当成"已写完"——
 * L1 缺口不足 L1_GAP_WARNING_THRESHOLD 层时完整性检查并不告警，数据就永久漏了。
 * 记录里补挂 'integrity-check'，等重试真正成功后由 finishVectorMaintenance 兑现那次检查。
 */
function retryVectorMaintenanceAfterFailure(chatId) {
    if (!isBackgroundWorkLive(chatId)) return;
    rememberVectorMaintenance(chatId, null, 'integrity-check');
    vectorMaintenanceRetryDelayMs = nextBackoffDelayMs(vectorMaintenanceRetryDelayMs);
    scheduleAutoL0Backfill(vectorMaintenanceRetryDelayMs, chatId);
}

const VECTOR_WARNING_COOLDOWN_MS = 120000; // 2分钟内不重复提醒
let backupDeleteSupported = true;
let backupDeleteUnsupportedReason = '';
let backupManagerCleanup = null;

const EXT_PROMPT_KEY = "LittleWhiteBox_StorySummary";
const MIN_INJECTION_DEPTH = 2;
const R_AGG_MAX_CHARS = 256;

function buildRAggregateText(atom) {
    const uniq = new Set();
    for (const edge of (atom?.edges || [])) {
        const r = String(edge?.r || "").trim();
        if (!r) continue;
        uniq.add(r);
    }
    const joined = [...uniq].join(" ; ");
    if (!joined) return String(atom?.semantic || "").trim();
    return joined.length > R_AGG_MAX_CHARS ? joined.slice(0, R_AGG_MAX_CHARS) : joined;
}

// ═══════════════════════════════════════════════════════════════════════════
// 分词器预热（依赖 tokenizer.js 内部状态机，支持失败重试）
// ═══════════════════════════════════════════════════════════════════════════

function maybePreloadTokenizer() {
    if (isTokenizerReady()) return;

    const vectorCfg = getVectorConfig();
    if (!vectorCfg?.enabled) return;

    preloadTokenizer()
        .then((ok) => {
            if (ok) {
                xbLog.info(MODULE_ID, "分词器预热成功");
            }
        })
        .catch((e) => {
            xbLog.warn(MODULE_ID, "分词器预热失败（将降级运行，可稀后重试）", e);
        });
}

// role 映射
const ROLE_MAP = {
    system: extension_prompt_roles.SYSTEM,
    user: extension_prompt_roles.USER,
    assistant: extension_prompt_roles.ASSISTANT,
};

// ═══════════════════════════════════════════════════════════════════════════
// 工具：执行斜杠命令
// ═══════════════════════════════════════════════════════════════════════════

async function executeSlashCommand(command) {
    try {
        const executeCmd =
            window.executeSlashCommands ||
            window.executeSlashCommandsOnChatInput ||
            (typeof SillyTavern !== "undefined" && SillyTavern.getContext()?.executeSlashCommands);

        if (executeCmd) {
            await executeCmd(command);
        } else if (typeof window.STscript === "function") {
            await window.STscript(command);
        }
    } catch (e) {
        xbLog.error(MODULE_ID, `执行命令失败: ${command}`, e);
    }
}

function getLastMessageId() {
    const { chat } = getContext();
    const len = Array.isArray(chat) ? chat.length : 0;
    return Math.max(-1, len - 1);
}

async function unhideAllMessages() {
    const last = getLastMessageId();
    if (last < 0) return;
    await executeSlashCommand(`/unhide 0-${last}`);
}

function applyHideRangeInMemory(range) {
    const { chat } = getContext();
    if (!Array.isArray(chat) || !range) return 0;

    let changed = 0;
    for (let messageId = range.start; messageId <= range.end; messageId++) {
        const message = chat[messageId];
        if (!message || message.is_system === true) continue;

        message.is_system = true;
        changed++;

        const messageBlock = $(`.mes[mesid="${messageId}"]`);
        if (messageBlock.length) {
            messageBlock.attr("is_system", "true");
        }
    }

    return changed;
}

// ═══════════════════════════════════════════════════════════════════════════
// 生成状态管理
// ═══════════════════════════════════════════════════════════════════════════

function isSummaryGenerating() {
    return guard.isRunning('summary');
}

function beginSummaryExecution() {
    const { chatId } = getContext();
    if (!chatId) return null;
    const execution = {
        chatId,
        controller: new AbortController(),
    };
    activeSummaryExecution = execution;
    return execution;
}

function cancelActiveSummaryExecution() {
    const execution = activeSummaryExecution;
    if (!execution || execution.controller.signal.aborted) return false;
    execution.controller.abort();
    cancelHideApplyTimer();
    return true;
}

function finishSummaryExecution(execution) {
    if (activeSummaryExecution === execution) {
        activeSummaryExecution = null;
    }
}

function isSummaryExecutionActive(execution) {
    return !!execution
        && !execution.controller.signal.aborted
        && activeSummaryExecution === execution
        && getContext()?.chatId === execution.chatId;
}

function assertSummaryExecutionActive(execution) {
    if (!isSummaryExecutionActive(execution)) {
        throw createSummaryGenerationCancelledError();
    }
}

function notifySummaryState() {
    postToFrame({ type: "GENERATION_STATE", isGenerating: guard.isRunning('summary') });
}

// ═══════════════════════════════════════════════════════════════════════════
// iframe 通讯
// ═══════════════════════════════════════════════════════════════════════════

function postToFrame(payload) {
    if (payload?.type === "RECALL_LOG") {
        lastRecallLogText = String(payload.text || "");
    }

    const iframe = document.getElementById("xiaobaix-story-summary-iframe");
    if (!iframe?.contentWindow) return;
    if (!frameReady) {
        pendingFrameMessages.push(payload);
        return;
    }
    postToIframe(iframe, payload, "LittleWhiteBox");
}

function flushPendingFrameMessages() {
    if (!frameReady) return;
    const iframe = document.getElementById("xiaobaix-story-summary-iframe");
    if (!iframe?.contentWindow) return;
    pendingFrameMessages.forEach((p) => postToIframe(iframe, p, "LittleWhiteBox"));
    pendingFrameMessages = [];
    sendAnchorStatsToFrame();
}

// ═══════════════════════════════════════════════════════════════════════════
// 向量功能：UI 交互/状态
// ═══════════════════════════════════════════════════════════════════════════

function sendVectorConfigToFrame() {
    const cfg = getVectorConfig();
    postToFrame({ type: "VECTOR_CONFIG", config: cfg });
}

async function sendVectorStatsToFrame() {
    const { chatId, chat } = getContext();
    if (!chatId) return;

    const store = getSummaryStore();
    const eventCount = store?.json?.events?.length || 0;
    const stats = await getStorageStats(chatId);
    const chunkStatus = await getChunkBuildStatus();
    const totalMessages = chat?.length || 0;
    const stateVectorsCount = await getStateVectorsCount(chatId);

    const cfg = getVectorConfig();
    let mismatch = false;
    if (cfg?.enabled && (stats.eventVectors > 0 || stats.chunks > 0)) {
        const fingerprint = getEngineFingerprint(cfg);
        const meta = await getMeta(chatId);
        mismatch = meta.fingerprint && meta.fingerprint !== fingerprint;
    }

    postToFrame({
        type: "VECTOR_STATS",
        stats: {
            eventCount,
            eventVectors: stats.eventVectors,
            chunkCount: stats.chunkVectors,
            builtFloors: chunkStatus.builtFloors,
            totalFloors: chunkStatus.totalFloors,
            totalMessages,
            stateVectors: stateVectorsCount,
            recallRuntime: getCurrentRecallRuntimeStat(chatId),
        },
        mismatch,
    });
}

async function sendAnchorStatsToFrame() {
    const stats = await getAnchorStats();
    const atomsCount = getStateAtomsCount();
    postToFrame({ type: "ANCHOR_STATS", stats: { ...stats, atomsCount } });
}

async function handleAnchorGenerateNow(targetChatId, writeSession) {
    if (
        getContext()?.chatId !== targetChatId
        || !isVectorWriteSessionCurrent(writeSession)
    ) return;
    try {
        const vectorCfg = getVectorConfig();
        if (!vectorCfg?.enabled) {
            await executeSlashCommand("/echo severity=warning 请先启用向量检索");
            return;
        }

        if (!vectorCfg.l0Api?.key) {
            postToFrame({ type: "VECTOR_ONLINE_STATUS", status: "error", message: "请配置 L0 API Key" });
            return;
        }

        const { chatId, chat } = getContext();
        if (!chatId || !chat?.length) return;
        const chatSnapshot = [...chat];

        postToFrame({ type: "ANCHOR_GEN_PROGRESS", current: 0, total: 1, message: "分析中..." });

        const l0Result = await incrementalExtractAtoms(
            chatId,
            chatSnapshot,
            (message, current, total) => {
                postToFrame({ type: "ANCHOR_GEN_PROGRESS", current, total, message });
            },
            {
                signal: writeSession.signal,
                shouldCancel: () => !isVectorWriteSessionCurrent(writeSession),
                // 用户显式点了生成：连后台已放弃的失败楼层也一并重试。
                retryFailedFloors: true,
            },
        );

        if (getContext()?.chatId !== targetChatId || !isVectorWriteSessionCurrent(writeSession)) return;
        if (l0Result?.cancelled) {
            await sendAnchorStatsToFrame();
            await sendVectorStatsToFrame();
            xbLog.info(MODULE_ID, "记忆锚点生成已取消");
            return;
        }

        // Self-heal: if chunks are empty but boundary looks "already built",
        // reset boundary so incremental L1 rebuild can start from floor 0.
        const [meta, storageStats] = await Promise.all([
            getMeta(chatId),
            getStorageStats(chatId),
        ]);
        if (!isVectorWriteSessionCurrent(writeSession)) return;
        const lastFloor = (chat?.length || 0) - 1;
        if (storageStats.chunks === 0 && lastFloor >= 0 && (meta.lastChunkFloor ?? -1) >= lastFloor) {
            await updateMeta(chatId, { lastChunkFloor: -1 });
            xbLog.warn(MODULE_ID, "Detected empty L1 chunks with full boundary, reset lastChunkFloor=-1");
        }

        postToFrame({ type: "ANCHOR_GEN_PROGRESS", current: 0, total: 1, message: "向量化 L1..." });
        const chunkResult = await buildIncrementalChunks({
            vectorConfig: vectorCfg,
            targetChatId,
            chatSnapshot,
            signal: writeSession.signal,
            shouldCancel: () => !isVectorWriteSessionCurrent(writeSession),
        });
        if (getContext()?.chatId !== targetChatId || !isVectorWriteSessionCurrent(writeSession)) return;
        if (chunkResult.status === 'cancelled') return;
        if (!chunkResult.success) {
            scheduleVectorIntegrityCheck(0);
            throw new Error(`L1 增量构建失败：${chunkResult.code || 'unknown'}`);
        }

        // L1 rebuild only if new chunks were added (usually 0 in normal chat)
        if (chunkResult.built > 0) {
            invalidateLexicalIndex();
            scheduleLexicalWarmup();
        }

        await sendAnchorStatsToFrame();
        await sendVectorStatsToFrame();

        xbLog.info(MODULE_ID, "记忆锚点生成完成");
    } catch (e) {
        if (e?.name === 'AbortError' || !isVectorWriteSessionCurrent(writeSession)) return;
        xbLog.error(MODULE_ID, "记忆锚点生成失败", e);
        await executeSlashCommand(`/echo severity=error 记忆锚点生成失败：${e.message}`);
    } finally {
        postToFrame({ type: "ANCHOR_GEN_PROGRESS", current: -1, total: 0 });
    }
}

async function handleAnchorGenerate() {
    const release = guard.acquire('anchor');
    if (!release) return;
    const targetChatId = getContext()?.chatId || '';
    try {
        return await runVectorWriteTask(
            {
                chatId: targetChatId,
                kind: 'manual-anchor-generation',
                scope: VECTOR_WRITE_SCOPES.EMBEDDING,
                operationId: ANCHOR_GENERATION_OPERATION,
            },
            (writeSession) => handleAnchorGenerateNow(targetChatId, writeSession),
        );
    } finally {
        release();
    }
}

async function handleAnchorClear() {
    const targetChatId = getContext()?.chatId || '';
    if (!targetChatId) return;

    await runVectorWriteTask(
        { chatId: targetChatId, kind: 'clear-anchors', scope: VECTOR_WRITE_SCOPES.IO },
        async () => {
            if (getContext()?.chatId !== targetChatId) return;
            await clearAllAtomsAndVectors(targetChatId);
        },
    );
    if (getContext()?.chatId !== targetChatId) return;
    await sendAnchorStatsToFrame();
    await sendVectorStatsToFrame();

    await executeSlashCommand("/echo severity=info 记忆锚点已清空");
    xbLog.info(MODULE_ID, "记忆锚点已清空");
}

function handleAnchorCancel() {
    cancelVectorWriteOperation(ANCHOR_GENERATION_OPERATION, 'Anchor generation cancelled');
    scheduleVectorIntegrityCheck(0);
    postToFrame({ type: "ANCHOR_GEN_PROGRESS", current: -1, total: 0 });
}

async function handleTestOnlineService(provider, config, target = "embedding") {
    try {
        postToFrame({ type: "VECTOR_ONLINE_STATUS", target, status: "downloading", message: "连接中..." });
        let result;
        if (target === "l0") result = await testL0Service(config);
        else if (target === "rerank") result = await testRerankService(config);
        else result = await testOnlineService(provider, config);
        postToFrame({
            type: "VECTOR_ONLINE_STATUS",
            target,
            status: "success",
            message: target === "embedding"
                ? `连接成功 (${result.dims}维)`
                : (result.message || "连接成功"),
        });
    } catch (e) {
        postToFrame({ type: "VECTOR_ONLINE_STATUS", target, status: "error", message: e.message });
    }
}

async function generateVectorsNow(vectorCfg, targetChatId, writeSession) {
    if (getContext()?.chatId !== targetChatId || !isVectorWriteSessionCurrent(writeSession)) return;
    try {
        if (!vectorCfg?.enabled) {
            postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "ALL", current: -1, total: 0 });
            return;
        }

        const { chatId, chat } = getContext();
        if (!chatId || !chat?.length) return;
        const chatSnapshot = [...chat];
        const atoms = structuredClone(getStateAtoms());
        const sourceEvents = structuredClone(getSummaryStore()?.json?.events || []);
        const isTargetActive = () => getContext()?.chatId === targetChatId && activeChatId === targetChatId;

        if (!vectorCfg.embeddingApi?.key) {
            postToFrame({ type: "VECTOR_ONLINE_STATUS", status: "error", message: "请配置 Embedding API Key" });
            return;
        }

        const operationSignal = writeSession.signal;
        const isCancelled = () => (
            operationSignal?.aborted
            || !isVectorWriteSessionCurrent(writeSession)
        );

        const fingerprint = getEngineFingerprint(vectorCfg);
        const batchSize = 20;

        await clearAllChunks(chatId);
        if (isCancelled()) return;
        await clearEventVectors(chatId);
        if (isCancelled()) return;
        await clearStateVectors(chatId);
        if (isCancelled()) return;
        await updateMeta(chatId, { lastChunkFloor: -1, fingerprint });
        if (isCancelled()) return;

        // Helper to embed with retry
        const embedWithRetry = async (texts, phase, currentBatchIdx, totalItems) => {
            for (let attempt = 1; attempt <= 3; attempt++) {
                if (isCancelled() || !isTargetActive()) return null;
                try {
                    const vectors = await embed(texts, vectorCfg, { signal: operationSignal });
                    if (
                        !Array.isArray(vectors)
                        || vectors.length < texts.length
                        || vectors.slice(0, texts.length).some(vector => !vector?.length)
                    ) {
                        throw new Error(`Embedding 响应数量不匹配: expect>=${texts.length}, got=${vectors?.length || 0}`);
                    }
                    return vectors;
                } catch (e) {
                    if (e?.name === "AbortError" || isCancelled() || !isTargetActive()) return null;
                    xbLog.error(MODULE_ID, `${phase} 向量化单次失败`, e);
                    if (attempt === 3) throw e;

                    // 等待 60 秒重试
                    const waitSec = 60;
                    for (let s = waitSec; s > 0; s--) {
                        if (isCancelled() || !isTargetActive()) return null;
                        postToFrame({
                            type: "VECTOR_GEN_PROGRESS",
                            phase,
                            current: currentBatchIdx,
                            total: totalItems,
                            message: `触发限流，${s}s 后重试...`
                        });
                        await new Promise(r => setTimeout(r, 1000));
                    }
                    postToFrame({ type: "VECTOR_GEN_PROGRESS", phase, current: currentBatchIdx, total: totalItems, message: "正在重试..." });
                }
            }
            return null;
        };

        if (!atoms.length) {
            postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "L0", current: 0, total: 0, message: "L0 为空，跳过" });
        } else {
            postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "L0", current: 0, total: atoms.length, message: "L0 向量化..." });

            let l0Completed = 0;
            for (let i = 0; i < atoms.length; i += batchSize) {
                if (isCancelled()) break;

                const batch = atoms.slice(i, i + batchSize);
                const semTexts = batch.map(a => a.semantic);
                const rTexts = batch.map(a => buildRAggregateText(a));

                const vectors = await embedWithRetry(semTexts.concat(rTexts), "L0", l0Completed, atoms.length);
                if (!vectors) break; // cancelled
                if (isCancelled() || !isTargetActive()) return;

                const split = semTexts.length;
                if (!Array.isArray(vectors) || vectors.length < split * 2) {
                    xbLog.error(MODULE_ID, `embed长度不匹配: expect>=${split * 2}, got=${vectors?.length || 0}`);
                    continue;
                }
                const semVectors = vectors.slice(0, split);
                const rVectors = vectors.slice(split, split + split);
                const items = batch.map((a, j) => ({
                    atomId: a.atomId,
                    floor: a.floor,
                    vector: semVectors[j],
                    rVector: rVectors[j] || semVectors[j],
                }));
                if (isCancelled()) return;
                await saveStateVectors(chatId, items, fingerprint);
                l0Completed += batch.length;
                postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "L0", current: l0Completed, total: atoms.length });
            }
        }

        if (isCancelled() || !isTargetActive()) return;

        const allChunks = [];
        for (let floor = 0; floor < chatSnapshot.length; floor++) {
            if (isCancelled()) break;

            const message = chatSnapshot[floor];
            if (!message) continue;

            const chunks = chunkMessage(floor, message);
            if (!chunks.length) continue;

            allChunks.push(...chunks);
        }

        let l1Vectors = [];
        if (!allChunks.length) {
            postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "L1", current: 0, total: 0, message: "L1 为空，跳过" });
        } else {
            postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "L1", current: 0, total: allChunks.length, message: "L1 向量化..." });
            if (isCancelled() || !isTargetActive()) return;
            await saveChunks(chatId, allChunks);

            let l1Completed = 0;
            for (let i = 0; i < allChunks.length; i += batchSize) {
                if (isCancelled()) break;

                const batch = allChunks.slice(i, i + batchSize);
                const texts = batch.map(c => c.text);

                const vectors = await embedWithRetry(texts, "L1", l1Completed, allChunks.length);
                if (!vectors) break; // cancelled
                if (isCancelled() || !isTargetActive()) return;

                const items = batch.map((c, j) => ({
                    chunkId: c.chunkId,
                    vector: vectors[j],
                }));
                if (isCancelled()) return;
                await saveChunkVectors(chatId, items, fingerprint);
                l1Vectors = l1Vectors.concat(items);
                l1Completed += batch.length;
                postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "L1", current: l1Completed, total: allChunks.length });
            }
        }

        if (isCancelled() || !isTargetActive()) return;

        const l2Pairs = sourceEvents
            .map((e) => ({ id: e.id, text: `${e.title || ""} ${e.summary || ""}`.trim() }))
            .filter((p) => p.text);

        if (!l2Pairs.length) {
            postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "L2", current: 0, total: 0, message: "L2 为空，跳过" });
        } else {
            postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "L2", current: 0, total: l2Pairs.length, message: "L2 向量化..." });

            let l2Completed = 0;
            for (let i = 0; i < l2Pairs.length; i += batchSize) {
                if (isCancelled()) break;

                const batch = l2Pairs.slice(i, i + batchSize);
                const texts = batch.map(p => p.text);

                const vectors = await embedWithRetry(texts, "L2", l2Completed, l2Pairs.length);
                if (!vectors) break; // cancelled
                if (isCancelled() || !isTargetActive()) return;

                const items = batch.map((p, idx) => ({
                    eventId: p.id,
                    vector: vectors[idx],
                }));
                if (isCancelled()) return;
                await saveEventVectorsToDb(chatId, items, fingerprint);
                l2Completed += batch.length;
                postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "L2", current: l2Completed, total: l2Pairs.length });
            }
        }

        // Full rebuild completed: vector boundary should match latest floor.
        if (isCancelled() || !isTargetActive()) return;
        await updateMeta(chatId, { lastChunkFloor: chatSnapshot.length - 1 });

        postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "ALL", current: -1, total: 0 });
        await sendVectorStatsToFrame();

        xbLog.info(MODULE_ID, `向量生成完成: L0=${atoms.length}, L1=${l1Vectors.length}, L2=${l2Pairs.length}`);
    } catch (e) {
        if (e?.name === 'AbortError' || !isVectorWriteSessionCurrent(writeSession)) return;
        xbLog.error(MODULE_ID, '向量生成失败', e);
        postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "ALL", current: -1, total: 0 });
        await sendVectorStatsToFrame();
    }
}

async function handleGenerateVectors() {
    const release = guard.acquire('vector');
    if (!release) return;
    const targetChatId = getContext()?.chatId || '';
    try {
        return await runVectorWriteTask(
            {
                chatId: targetChatId,
                kind: 'full-vector-generation',
                scope: VECTOR_WRITE_SCOPES.EMBEDDING,
                operationId: VECTOR_GENERATION_OPERATION,
            },
            (writeSession) => {
                const currentConfig = getVectorConfig();
                if (!currentConfig?.enabled) return;
                return generateVectorsNow(currentConfig, targetChatId, writeSession);
            },
        );
    } finally {
        release();
    }
}

async function handleClearVectors() {
    const targetChatId = getContext()?.chatId || '';
    if (!targetChatId) return;

    await runVectorWriteTask(
        { chatId: targetChatId, kind: 'clear-vectors', scope: VECTOR_WRITE_SCOPES.IO },
        async () => {
            if (getContext()?.chatId !== targetChatId) return;
            await clearEventVectors(targetChatId);
            await clearAllChunks(targetChatId);
            await clearStateVectors(targetChatId);
            // Reset both boundary and fingerprint so next incremental build starts from floor 0
            // without being blocked by stale engine fingerprint mismatch.
            await updateMeta(targetChatId, { lastChunkFloor: -1, fingerprint: null });
        },
    );
    if (getContext()?.chatId !== targetChatId) return;
    await sendVectorStatsToFrame();
    await executeSlashCommand('/echo severity=info 向量数据已清除。如需恢复召回功能，请重新点击"生成向量"。');
    xbLog.info(MODULE_ID, "向量数据已清除");
}

// ═══════════════════════════════════════════════════════════════════════════
// 实体词典注入 + 索引预热
// ═══════════════════════════════════════════════════════════════════════════

function refreshEntityLexiconAndWarmup() {
    const vectorCfg = getVectorConfig();
    if (!vectorCfg?.enabled) return;

    const store = getSummaryStore();
    const { name1, name2 } = getContext();

    const lexicon = buildEntityLexicon(store, { name1, name2 });
    const displayMap = buildDisplayNameMap(store, { name1, name2 });

    injectEntities(lexicon, displayMap);

    // 异步预建词法索引（不阻塞）
}

// ═══════════════════════════════════════════════════════════════════════════
// 延迟向量维护：AI 后只调度，5 秒后统一维护 L0/L1，避免影响宿主收尾。
// ═══════════════════════════════════════════════════════════════════════════

async function maybeRunDelayedVectorMaintenance(scheduledChatId = null) {
    const { chatId, chat } = getContext();
    const targetChatId = scheduledChatId || chatId;
    if (!targetChatId || !chatId || targetChatId !== chatId || !chat?.length) return;

    if (isHostGenerating() || guard.isAnyRunning('summary', 'anchor', 'vector')) {
        scheduleAutoL0Backfill(AUTO_L0_BACKFILL_DELAY_MS, targetChatId);
        return;
    }

    const pendingEntry = pendingVectorMaintenanceByChat.get(chatId);

    let stats;
    let chunkStatus;
    try {
        stats = await getAnchorStats();
        chunkStatus = await getChunkBuildStatus();
    } catch (e) {
        xbLog.error(MODULE_ID, "延迟向量维护状态检查失败", e);
        retryVectorMaintenanceAfterFailure(chatId);
        return;
    }
    const hasL0Work = stats.pending > 0;
    const hasL1Work = chunkStatus.pending > 0;

    if (!hasL0Work && !hasL1Work) {
        finishVectorMaintenance(chatId);
        return;
    }

    if (!pendingEntry && hasL0Work) {
        rememberVectorMaintenance(chatId, null, 'backfill');
    }

    const release = guard.acquire('anchor');
    if (!release) {
        scheduleAutoL0Backfill(AUTO_L0_BACKFILL_DELAY_MS, chatId);
        return;
    }

    try {
        const floorsText = pendingEntry?.floors?.size ? [...pendingEntry.floors].sort((a, b) => a - b).join(',') : '-';
        xbLog.info(MODULE_ID, `延迟向量维护开始 chat=${chatId} floors=${floorsText} l0Pending=${stats.pending} l1Pending=${chunkStatus.pending}`);

        const writeResult = await runVectorWriteTask({
            chatId,
            kind: 'delayed-maintenance',
            scope: VECTOR_WRITE_SCOPES.EMBEDDING,
        }, async (writeSession) => {
            const vectorCfg = getVectorConfig();
            const currentChat = getContext()?.chat;
            const chatSnapshot = Array.isArray(currentChat) ? [...currentChat] : [];
            if (!vectorCfg?.enabled) {
                return {
                    chunkResult: { success: true, status: 'disabled', built: 0 },
                    l0Result: null,
                    deferred: false,
                    stale: false,
                    cancelled: false,
                    disabled: true,
                };
            }
            if (isChatStale(chatId)) {
                return {
                    chunkResult: { success: false, status: 'failed', code: 'stale_chat', built: 0 },
                    l0Result: null,
                    deferred: false,
                    stale: true,
                    cancelled: false,
                };
            }
            if (!isVectorWriteSessionCurrent(writeSession)) {
                return { chunkResult: null, l0Result: null, deferred: false, stale: false, cancelled: true };
            }
            const chunkResult = hasL1Work
                ? await buildIncrementalChunks({
                    vectorConfig: vectorCfg,
                    targetChatId: chatId,
                    chatSnapshot,
                    signal: writeSession.signal,
                    shouldCancel: () => !isVectorWriteSessionCurrent(writeSession),
                })
                : { success: true, status: 'up_to_date', built: 0 };

            if (!isVectorWriteSessionCurrent(writeSession)) {
                return { chunkResult, l0Result: null, deferred: false, stale: false, cancelled: true };
            }

            let l0Result = null;
            if (hasL0Work) {
                if (isHostGenerating() || isChatStale(chatId)) {
                    return {
                        chunkResult,
                        l0Result,
                        deferred: !isChatStale(chatId),
                        stale: isChatStale(chatId),
                        cancelled: false,
                    };
                }
                const preferredFloors = pendingEntry?.floors ? [...pendingEntry.floors] : [];
                l0Result = await incrementalExtractAtoms(chatId, chatSnapshot, null, {
                    maxFloors: 20,
                    preferredFloors,
                    signal: writeSession.signal,
                    shouldCancel: () => !isVectorWriteSessionCurrent(writeSession),
                });
            }
            return { chunkResult, l0Result, deferred: false, stale: false, cancelled: false };
        });
        // writeResult 为空 = 任务在出队前就被取消（配置切换 / 取消生成 / 卸载）。
        if (!writeResult || writeResult.cancelled || writeResult.l0Result?.cancelled) {
            retryVectorMaintenanceAfterCancel(chatId);
            return;
        }
        const { chunkResult, l0Result, deferred, stale, disabled } = writeResult;

        if (disabled || stale) {
            clearVectorMaintenance(chatId);
            return;
        }

        if (deferred) {
            if (chunkResult.built > 0) {
                invalidateLexicalIndex();
                scheduleLexicalWarmup();
            }
            scheduleAutoL0Backfill(AUTO_L0_BACKFILL_DELAY_MS, chatId);
            return;
        }

        if (chunkResult.built > 0 || l0Result?.built > 0) {
            invalidateLexicalIndex();
            scheduleLexicalWarmup();
        }

        await sendAnchorStatsToFrame();
        await sendVectorStatsToFrame();
        const l0Failed = Number(l0Result?.failed || 0);
        if (chunkResult.success === false || l0Failed > 0) {
            // 真取消已在上面的 cancelled 分支返回，走到这里就是实打实的失败。
            // L0 失败同样要保留记录：失败楼层已标 fail，只有重跑维护才会被重新排进提取队列。
            retryVectorMaintenanceAfterFailure(chatId);
            xbLog.warn(MODULE_ID, `延迟向量维护未完成 l1=${chunkResult.success === false ? (chunkResult.code || 'unknown') : 'ok'} l0Failed=${l0Failed}，已保留待维护记录并退避重试`);
            return;
        }
        finishVectorMaintenance(chatId);

        xbLog.info(MODULE_ID, `延迟向量维护完成 l0=${l0Result?.built || 0} l1=${chunkResult.built || 0}`);
    } catch (e) {
        if (e?.name === 'AbortError') {
            retryVectorMaintenanceAfterCancel(chatId);
            return;
        }
        xbLog.error(MODULE_ID, "延迟向量维护失败", e);
        retryVectorMaintenanceAfterFailure(chatId);
    } finally {
        release();
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// Embedding 连接预热
// ═══════════════════════════════════════════════════════════════════════════

function warmupEmbeddingConnection() {
    const vectorCfg = getVectorConfig();
    if (!vectorCfg?.enabled) return;
    embed(['.'], vectorCfg, { timeout: 5000 }).catch(() => { });
}

function warmupActiveVectorCache() {
    const vectorCfg = getVectorConfig();
    const { chatId } = getContext();
    logRecallRuntimeCheckpoint("warmupActiveVectorCache:start", `chat=${chatId || "-"} enabled=${vectorCfg?.enabled ? 1 : 0}`);
    retainRecallRuntimeOnly(chatId || null).catch((error) => {
        xbLog.warn(MODULE_ID, '召回运行时清理非当前聊天缓存失败', error);
    });
    if (!vectorCfg?.enabled) {
        if (chatId) {
            logRecallRuntimeCheckpoint("warmupActiveVectorCache:clear-disabled", `chat=${chatId}`);
            clearRecallRuntime().catch((error) => {
                xbLog.warn(MODULE_ID, '召回运行时清理失败', error);
            });
        }
        return;
    }
    if (!chatId) return;
    warmRecallRuntime(chatId, { reason: 'active-chat-warmup' })
        .then((result) => {
            logRecallRuntimeCheckpoint("warmupActiveVectorCache:done", `chat=${chatId} skipped=${result?.skipped ? 1 : 0} status=${result?.stats?.status || '-'}`);
        })
        .catch((error) => {
            xbLog.warn(MODULE_ID, '召回运行时预热失败', error);
        })
        .finally(() => {
            if (activeChatId !== chatId) return;
            sendVectorStatsToFrame().catch(() => { });
        });
}

async function finishVectorConfigTransition(previousConfig, nextConfig, reason, writeSession) {
    const nextEnabled = !!nextConfig?.enabled;
    const configChanged = JSON.stringify(previousConfig || {}) !== JSON.stringify(nextConfig || {});
    if (!configChanged) return false;

    logRecallRuntimeCheckpoint('vectorConfig:shutdown-runtime', `reason=${reason} enabled=${nextEnabled ? 1 : 0}`);
    await shutdownRecallRuntime();
    if (
        isVectorWriteSessionCurrent(writeSession)
        && nextEnabled
        && isStorySummaryConsumableForCurrentChat()
    ) {
        scheduleVectorIntegrityCheck(0);
    }
    return true;
}

function changeVectorConfig(reason, applyChange) {
    const transition = runVectorConfigTransition(
        {
            chatId: getContext()?.chatId || '',
            reason: `Vector configuration changed: ${reason}`,
        },
        async (writeSession) => {
            const previousVectorConfig = getVectorConfig();
            const result = await applyChange();
            const nextVectorConfig = getVectorConfig();
            const changed = await finishVectorConfigTransition(
                previousVectorConfig,
                nextVectorConfig,
                reason,
                writeSession,
            );
            return { previousVectorConfig, nextVectorConfig, result, changed };
        },
    );
    cancelRecallAndClearPrompt('vector-config-changed');
    return transition;
}

async function rebuildActiveVectorCacheAfterSummary(execution) {
    assertSummaryExecutionActive(execution);
    const vectorCfg = getVectorConfig();
    if (!vectorCfg?.enabled) return;

    const chatId = execution.chatId;

    try {
        logRecallRuntimeCheckpoint("afterSummaryRefresh:start", `chat=${chatId}`);
        postToFrame({ type: "SUMMARY_STATUS", statusText: "记忆数据已更新，下次召回时加载。" });
        let result = await refreshRecallRuntime(chatId, { reason: 'after-summary' });
        assertSummaryExecutionActive(execution);
        if (result?.stale) {
            logRecallRuntimeCheckpoint("afterSummaryRefresh:retry", `chat=${chatId}`);
            result = await refreshRecallRuntime(chatId, { reason: 'after-summary-retry' });
            assertSummaryExecutionActive(execution);
        }
        if (result?.skipped) {
            xbLog.info(MODULE_ID, "大总结后召回运行时已标记待加载");
        } else if (!result?.ready) {
            xbLog.warn(MODULE_ID, "大总结后召回运行时状态更新未完成");
        } else {
            xbLog.info(MODULE_ID, "大总结后召回运行时已更新状态");
        }
        logRecallRuntimeCheckpoint("afterSummaryRefresh:done", `chat=${chatId} ready=${result?.ready ? 1 : 0} stale=${result?.stale ? 1 : 0}`);
        await sendVectorStatsToFrame();
    } catch (error) {
        if (!isSummaryExecutionActive(execution)) {
            await clearRecallRuntime(chatId);
            throw createSummaryGenerationCancelledError();
        }
        xbLog.warn(MODULE_ID, "大总结后刷新向量热缓存失败", error);
    }
}

function buildEventVectorText(event) {
    return `${event?.title || ""} ${event?.summary || ""}`.trim();
}

function buildEventLexicalSignature(event) {
    const participants = Array.isArray(event?.participants) ? event.participants.join(" ") : "";
    return `${event?.title || ""} ${participants} ${event?.summary || ""}`.trim();
}

async function collectMissingEventVectorPairs(chatId, events, fingerprint) {
    const existingVectors = await getAllEventVectors(chatId);
    const existingIds = new Set(existingVectors
        .filter(item => item?.fingerprint === fingerprint)
        .map(item => item?.eventId)
        .filter(Boolean));
    return (events || [])
        .filter(event => event?.id && !existingIds.has(event.id))
        .map(event => ({ id: event.id, text: buildEventVectorText(event) }))
        .filter(pair => pair.text);
}

async function autoVectorizeMissingEventsNow(store, execution, writeSession) {
    assertSummaryExecutionActive(execution);
    if (!isVectorWriteSessionCurrent(writeSession)) return;
    const vectorCfg = getVectorConfig();
    if (!vectorCfg?.enabled) return;

    const chatId = execution.chatId;
    const events = store?.json?.events || [];
    const fingerprint = getEngineFingerprint(vectorCfg);
    const meta = await getMeta(chatId);
    assertSummaryExecutionActive(execution);
    if (meta?.fingerprint && meta.fingerprint !== fingerprint) return;

    const pairs = await collectMissingEventVectorPairs(chatId, events, fingerprint);
    assertSummaryExecutionActive(execution);

    if (!pairs.length) return;

    try {
        const batchSize = 20;
        const signal = mergeAbortSignals(execution.controller.signal, writeSession.signal);

        for (let i = 0; i < pairs.length; i += batchSize) {
            const batch = pairs.slice(i, i + batchSize);
            const texts = batch.map((p) => p.text);

            const vectors = await embed(texts, vectorCfg, { signal });
            assertSummaryExecutionActive(execution);
            if (!isVectorWriteSessionCurrent(writeSession)) return;
            const items = batch.map((p, idx) => ({
                eventId: p.id,
                vector: vectors[idx],
            }));

            if (!isVectorWriteSessionCurrent(writeSession)) return;
            await saveEventVectorsToDb(chatId, items, fingerprint);
            assertSummaryExecutionActive(execution);
        }

        xbLog.info(MODULE_ID, `L2 自动增量完成: ${pairs.length} 个事件`);
        await sendVectorStatsToFrame();
    } catch (e) {
        assertSummaryExecutionActive(execution);
        if (e?.name === 'AbortError' || !isVectorWriteSessionCurrent(writeSession)) return;
        xbLog.error(MODULE_ID, "L2 自动向量化失败", e);
    }
}

async function autoVectorizeMissingEvents(store, execution) {
    assertSummaryExecutionActive(execution);
    return runVectorWriteTask(
        {
            chatId: execution.chatId,
            kind: 'summary-event-vectorization',
            scope: VECTOR_WRITE_SCOPES.EMBEDDING,
        },
        (writeSession) => autoVectorizeMissingEventsNow(store, execution, writeSession),
    );
}

async function repairMissingEventVectorsForCurrentChat() {
    const release = guard.acquire('vector');
    if (!release) return { success: false, repaired: 0, code: 'busy' };

    const targetChatId = getContext()?.chatId || null;
    try {
        if (!targetChatId) return { success: false, repaired: 0, code: 'disabled' };
        const result = await runVectorWriteTask(
            {
                chatId: targetChatId,
                kind: 'event-vector-repair',
                scope: VECTOR_WRITE_SCOPES.EMBEDDING,
            },
            async (writeSession) => {
                try {
                    const vectorCfg = getVectorConfig();
                    if (!vectorCfg?.enabled) return { success: false, repaired: 0, code: 'disabled' };

                    const events = structuredClone(getSummaryStore()?.json?.events || []);
                    if (!events.length) return { success: true, repaired: 0 };

                    const fingerprint = getEngineFingerprint(vectorCfg);
                    const meta = await getMeta(targetChatId);
                    if (!isVectorWriteSessionCurrent(writeSession)) {
                        return { success: false, repaired: 0, code: 'vector_config_changed' };
                    }
                    if (meta?.fingerprint && meta.fingerprint !== fingerprint) {
                        return { success: false, repaired: 0, code: 'fingerprint_mismatch' };
                    }

                    const pairs = await collectMissingEventVectorPairs(targetChatId, events, fingerprint);
                    if (!pairs.length) return { success: true, repaired: 0 };

                    let repaired = 0;
                    for (let i = 0; i < pairs.length; i += 20) {
                        const batch = pairs.slice(i, i + 20);
                        const vectors = await embed(batch.map(pair => pair.text), vectorCfg, { signal: writeSession.signal });
                        if (
                            getContext()?.chatId !== targetChatId
                            || !isStorySummaryEnabledForCurrentChat()
                            || !isVectorWriteSessionCurrent(writeSession)
                        ) return { success: false, repaired, code: 'vector_config_changed' };

                        const currentEvents = new Map((getSummaryStore()?.json?.events || [])
                            .filter(event => event?.id)
                            .map(event => [event.id, buildEventVectorText(event)]));
                        const items = batch
                            .map((pair, index) => ({ pair, vector: vectors[index] }))
                            .filter(item => currentEvents.get(item.pair.id) === item.pair.text)
                            .map(item => ({ eventId: item.pair.id, vector: item.vector }));
                        if (items.length > 0) {
                            if (!isVectorWriteSessionCurrent(writeSession)) {
                                return { success: false, repaired, code: 'vector_config_changed' };
                            }
                            await saveEventVectorsToDb(targetChatId, items, fingerprint);
                            repaired += items.length;
                        }
                    }

                    if (repaired > 0) {
                        xbLog.info(MODULE_ID, `L2 自动补齐完成: ${repaired} 个事件`);
                        await sendVectorStatsToFrame();
                    }
                    return { success: true, repaired };
                } catch (error) {
                    if (error?.name === 'AbortError' || !isVectorWriteSessionCurrent(writeSession)) {
                        return { success: false, repaired: 0, code: 'vector_config_changed' };
                    }
                    xbLog.warn(MODULE_ID, 'L2 自动补齐失败', error);
                    return { success: false, repaired: 0, code: 'repair_failed', error };
                }
            },
        );
        return result || { success: false, repaired: 0, code: 'vector_config_changed' };
    } catch (error) {
        xbLog.warn(MODULE_ID, 'L2 自动补齐失败', error);
        return { success: false, repaired: 0, code: 'repair_failed', error };
    } finally {
        release();
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// L2 跟随编辑同步（用户编辑 events 时调用）
// ═══════════════════════════════════════════════════════════════════════════

function syncEventVectorsOnEdit(oldEvents, newEvents) {
    const syncToken = ++eventEditSyncToken;
    const targetChatId = getContext()?.chatId || '';
    return syncEventVectorsOnEditNow(oldEvents, newEvents, syncToken, targetChatId);
}

function cancelPendingEventEditSync() {
    eventEditSyncToken += 1;
}

async function syncEventVectorsOnEditWrite(oldEvents, newEvents, syncToken, targetChatId, writeSession) {
    try {
        const vectorCfg = getVectorConfig();
        const { chatId } = getContext();
        if (!chatId || chatId !== targetChatId) return;
        if (
            syncToken !== eventEditSyncToken
            || isChatStale(chatId)
            || !isVectorWriteSessionCurrent(writeSession)
        ) return;

        const oldList = Array.isArray(oldEvents) ? oldEvents : [];
        const newList = Array.isArray(newEvents) ? newEvents : [];
        const sourceSignature = events => JSON.stringify((events || [])
            .filter(event => event?.id)
            .map(event => [event.id, buildEventLexicalSignature(event)])
            .sort(([a], [b]) => String(a).localeCompare(String(b))));
        if (sourceSignature(getSummaryStore()?.json?.events) !== sourceSignature(newList)) {
            invalidateLexicalIndex();
            scheduleLexicalWarmup();
            scheduleVectorIntegrityCheck(0);
            return;
        }
        const oldById = new Map(oldList.map((e) => [e?.id, e]).filter(([id]) => id));
        const newById = new Map(newList.map((e) => [e?.id, e]).filter(([id]) => id));
        const oldIds = new Set(oldById.keys());
        const newIds = new Set(newById.keys());

        const deletedIds = [...oldIds].filter((id) => !newIds.has(id));
        const lexicalChangedEvents = newList.filter((event) => {
            const oldEvent = oldById.get(event?.id);
            if (!oldEvent) return true;
            return buildEventLexicalSignature(oldEvent) !== buildEventLexicalSignature(event);
        });
        const vectorChangedEvents = newList.filter((event) => {
            const oldEvent = oldById.get(event?.id);
            if (!oldEvent) return true;
            return buildEventVectorText(oldEvent) !== buildEventVectorText(event);
        });
        if (syncToken !== eventEditSyncToken || isChatStale(chatId)) return;

        if (deletedIds.length > 0) {
            invalidateLexicalIndex();
            if (vectorCfg?.enabled) {
                if (!isVectorWriteSessionCurrent(writeSession)) return;
                await deleteEventVectorsByIds(chatId, deletedIds);
            }
            xbLog.info(MODULE_ID, `L2 同步删除: ${deletedIds.length} 个事件向量`);
        }

        if (lexicalChangedEvents.some((event) => !buildEventLexicalSignature(event))) {
            invalidateLexicalIndex();
        } else if (lexicalChangedEvents.length > 0) {
            addEventDocuments(lexicalChangedEvents);
        }

        if (vectorCfg?.enabled && vectorChangedEvents.length > 0) {
            const fingerprint = getEngineFingerprint(vectorCfg);
            const emptyVectorIds = vectorChangedEvents
                .filter((e) => e?.id && oldById.has(e.id) && !buildEventVectorText(e))
                .map((e) => e.id);
            const pairs = vectorChangedEvents
                .map((e) => ({ id: e.id, text: buildEventVectorText(e) }))
                .filter((e) => e.id && e.text);
            const batchSize = 20;

            if (emptyVectorIds.length > 0) {
                if (
                    syncToken !== eventEditSyncToken
                    || isChatStale(chatId)
                    || !isVectorWriteSessionCurrent(writeSession)
                ) return;
                await deleteEventVectorsByIds(chatId, emptyVectorIds);
            }

            for (let i = 0; i < pairs.length; i += batchSize) {
                if (
                    syncToken !== eventEditSyncToken
                    || isChatStale(chatId)
                    || !isVectorWriteSessionCurrent(writeSession)
                ) return;
                const batch = pairs.slice(i, i + batchSize);
                try {
                    const vectors = await embed(batch.map((p) => p.text), vectorCfg, { signal: writeSession.signal });
                    if (
                        !Array.isArray(vectors)
                        || vectors.length < batch.length
                        || vectors.slice(0, batch.length).some(vector => !vector?.length)
                    ) {
                        throw new Error(`Embedding 响应数量不匹配: expect>=${batch.length}, got=${vectors?.length || 0}`);
                    }
                    if (
                        syncToken !== eventEditSyncToken
                        || isChatStale(chatId)
                        || !isVectorWriteSessionCurrent(writeSession)
                    ) return;
                    const currentEventTexts = new Map((getSummaryStore()?.json?.events || [])
                        .filter(event => event?.id)
                        .map(event => [event.id, buildEventVectorText(event)]));
                    const items = batch
                        .map((pair, index) => ({ pair, vector: vectors[index] }))
                        .filter(item => currentEventTexts.get(item.pair.id) === item.pair.text)
                        .map(item => ({ eventId: item.pair.id, vector: item.vector }));
                    if (items.length > 0) {
                        if (!isVectorWriteSessionCurrent(writeSession)) return;
                        await saveEventVectorsToDb(chatId, items, fingerprint);
                    }
                    if (items.length !== batch.length) scheduleVectorIntegrityCheck(0);
                } catch (error) {
                    if (error?.name === 'AbortError' || !isVectorWriteSessionCurrent(writeSession)) return;
                    if (syncToken === eventEditSyncToken && !isChatStale(chatId)) {
                        const failedExistingIds = batch
                            .filter(pair => oldById.has(pair.id))
                            .map(pair => pair.id);
                        if (failedExistingIds.length > 0) {
                            try {
                                await deleteEventVectorsByIds(chatId, failedExistingIds);
                            } catch (cleanupError) {
                                xbLog.warn(MODULE_ID, 'L2 编辑失败后的旧向量清理失败', cleanupError);
                            }
                        }
                        scheduleVectorIntegrityCheck(0);
                    }
                    throw error;
                }
            }
        }

        if (lexicalChangedEvents.length > 0 || vectorChangedEvents.length > 0) {
            xbLog.info(MODULE_ID, `L2 同步刷新: ${lexicalChangedEvents.length} 个事件`);
        }

        if (deletedIds.length > 0 || lexicalChangedEvents.length > 0 || vectorChangedEvents.length > 0) {
            await sendVectorStatsToFrame();
        }
    } catch (e) {
        if (e?.name === 'AbortError' || !isVectorWriteSessionCurrent(writeSession)) return;
        xbLog.error(MODULE_ID, "L2 编辑同步失败", e);
        if (getContext()?.chatId === targetChatId) scheduleVectorIntegrityCheck(0);
    }
}

async function syncEventVectorsOnEditNow(oldEvents, newEvents, syncToken, targetChatId) {
    if (!targetChatId) return;
    return runVectorWriteTask(
        {
            chatId: targetChatId,
            kind: 'event-edit-sync',
            scope: VECTOR_WRITE_SCOPES.CONSISTENCY,
        },
        (writeSession) => syncEventVectorsOnEditWrite(
            oldEvents,
            newEvents,
            syncToken,
            targetChatId,
            writeSession,
        ),
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// 向量完整性检测与派生数据自动修复
// ═══════════════════════════════════════════════════════════════════════════

async function checkVectorIntegrityAndWarn({ allowEventRepair = true } = {}) {
    const vectorCfg = getVectorConfig();
    if (!vectorCfg?.enabled) return;
    if (guard.isAnyRunning('summary', 'vector', 'anchor')) {
        scheduleVectorIntegrityCheck(BACKGROUND_VISIBLE_GRACE_MS);
        return;
    }

    const { chat, chatId } = getContext();
    if (!chatId || !chat?.length) return;
    if (deferVectorIntegrityUntilMaintenance(chatId)) return;

    const snapshot = captureMaintenanceSnapshot(chatId);
    if (!snapshot) {
        scheduleVectorIntegrityCheck(BACKGROUND_VISIBLE_GRACE_MS);
        return;
    }

    const store = getSummaryStore();
    const totalFloors = chat.length;
    const sourceEvents = (store?.json?.events || []).map(event => ({
        id: event?.id,
        title: event?.title,
        summary: event?.summary,
    }));

    const meta = await getMeta(chatId);
    const fingerprint = getEngineFingerprint(vectorCfg);
    if (
        getContext()?.chatId !== chatId
        || !isMaintenanceSnapshotCurrent(snapshot)
    ) {
        scheduleVectorIntegrityCheck(BACKGROUND_VISIBLE_GRACE_MS);
        return;
    }

    const fingerprintMismatch = Boolean(meta.fingerprint && meta.fingerprint !== fingerprint);
    const chunkFloorGap = totalFloors - 1 - (meta.lastChunkFloor ?? -1);

    let missingEventPairs = [];
    if (!meta.fingerprint || meta.fingerprint === fingerprint) {
        missingEventPairs = await collectMissingEventVectorPairs(chatId, sourceEvents, fingerprint);
    }
    if (
        getContext()?.chatId !== chatId
        || !isMaintenanceSnapshotCurrent(snapshot)
    ) {
        scheduleVectorIntegrityCheck(BACKGROUND_VISIBLE_GRACE_MS);
        return;
    }
    if (allowEventRepair && missingEventPairs.length > 0) {
        await repairMissingEventVectorsForCurrentChat();
        if (getContext()?.chatId !== chatId) return;
        await checkVectorIntegrityAndWarn({ allowEventRepair: false });
        return;
    }
    const issues = buildVectorIntegrityIssues({
        fingerprintMismatch,
        chunkFloorGap,
        missingEventVectorCount: missingEventPairs.length,
    });

    if (issues.length > 0) {
        if (
            deferVectorIntegrityUntilMaintenance(chatId)
            || getContext()?.chatId !== chatId
            || !isMaintenanceSnapshotCurrent(snapshot)
        ) return;
        const eligible = issues.filter(issue => claimWarningCooldown(
            'integrity',
            chatId,
            issue.code,
            VECTOR_WARNING_COOLDOWN_MS,
        ));
        if (!eligible.length) return;
        await executeSlashCommand(`/echo severity=warning 向量数据不完整：${eligible.map(issue => issue.message).join('、')}。请打开剧情总结面板点击"生成向量"。`);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// Overlay 面板
// ═══════════════════════════════════════════════════════════════════════════

function createOverlay() {
    if (overlayCreated) return;
    overlayCreated = true;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent);
    const isNarrow = window.matchMedia?.("(max-width: 768px)").matches;
    const overlayHeight = (isMobile || isNarrow) ? "92.5vh" : "100vh";

    const $overlay = $(`
        <div id="xiaobaix-story-summary-overlay" style="
            position: fixed !important; inset: 0 !important;
            width: 100vw !important; height: ${overlayHeight} !important;
            z-index: 99999 !important; display: none; overflow: hidden !important;
        ">
            <div class="xb-ss-backdrop" style="
                position: absolute !important; inset: 0 !important;
                background: rgba(0,0,0,.55) !important;
                backdrop-filter: blur(4px) !important;
            "></div>
            <div class="xb-ss-frame-wrap" style="
                position: absolute !important; inset: 12px !important; z-index: 1 !important;
            ">
                <iframe id="xiaobaix-story-summary-iframe" class="xiaobaix-iframe"
                    src="${iframePath}"
                    style="width:100% !important; height:100% !important; border:none !important;
                           border-radius:12px !important; box-shadow:0 0 30px rgba(0,0,0,.4) !important;
                           background:#fafafa !important;">
                </iframe>
            </div>
            <button class="xb-ss-close-btn" style="
                position: absolute !important; top: 20px !important; right: 20px !important;
                z-index: 2 !important; width: 36px !important; height: 36px !important;
                border-radius: 50% !important; border: none !important;
                background: rgba(0,0,0,.6) !important; color: #fff !important;
                font-size: 20px !important; cursor: pointer !important;
                display: flex !important; align-items: center !important;
                justify-content: center !important;
            ">✕</button>
        </div>
    `);

    $overlay.on("click", ".xb-ss-backdrop, .xb-ss-close-btn", hideOverlay);
    document.body.appendChild($overlay[0]);
    window.addEventListener(MESSAGE_EVENT, handleFrameMessage);
}

function showOverlay() {
    if (!overlayCreated) createOverlay();
    $("#xiaobaix-story-summary-overlay").show();
}

function hideOverlay() {
    removeBackupManagerModal();
    document.getElementById("xiaobaix-story-summary-overlay")?.remove();
    overlayCreated = false;
    frameReady = false;
    pendingFrameMessages = [];
    window.removeEventListener(MESSAGE_EVENT, handleFrameMessage);
}

// ═══════════════════════════════════════════════════════════════════════════
// 楼层按钮
// ═══════════════════════════════════════════════════════════════════════════

function createSummaryBtn(mesId) {
    const btn = document.createElement("div");
    btn.className = "mes_btn xiaobaix-story-summary-btn";
    btn.title = "剧情总结";
    btn.dataset.mesid = mesId;
    btn.innerHTML = '<i class="fa-solid fa-chart-line"></i>';
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!getSettings().storySummary?.enabled) return;
        currentMesId = Number(mesId);
        openPanelForMessage(currentMesId);
    });
    return btn;
}

function addSummaryBtnToMessage(mesId) {
    if (!messageButtonOwnership.ownsButtons()) return;
    if (!getSettings().storySummary?.enabled) return;
    const msg = document.querySelector(`#chat .mes[mesid="${mesId}"]`);
    if (!msg || msg.querySelector(".xiaobaix-story-summary-btn")) return;

    const btn = createSummaryBtn(mesId);
    if (window.registerButtonToSubContainer?.(mesId, btn)) return;

    msg.querySelector(".flex-container.flex1.alignitemscenter")?.appendChild(btn);
}

export function configureStorySummaryRuntime({ ownsMessageButtons: nextOwnership = true } = {}) {
    messageButtonOwnership.configure(nextOwnership);
}

export function mountStorySummaryButton(message, mesId) {
    if (!getSettings().storySummary?.enabled || message.querySelector('.xiaobaix-story-summary-btn')) return;
    const button = createSummaryBtn(mesId);
    if (!window.registerButtonToSubContainer?.(mesId, button)) {
        message.querySelector('.flex-container.flex1.alignitemscenter')?.appendChild(button);
    }
    return () => button.remove();
}

function initButtonsForAll() {
    if (!messageButtonOwnership.ownsButtons()) return;
    if (!getSettings().storySummary?.enabled) return;
    $("#chat .mes").each((_, el) => {
        const mesId = el.getAttribute("mesid");
        if (mesId != null) addSummaryBtnToMessage(mesId);
    });
}

function initButtonForLatestMessage() {
    if (!messageButtonOwnership.ownsButtons()) return;
    if (!getSettings().storySummary?.enabled) return;
    const { chat } = getContext();
    const mesId = Array.isArray(chat) ? chat.length - 1 : null;
    if (mesId != null && mesId >= 0) addSummaryBtnToMessage(mesId);
}

// ═══════════════════════════════════════════════════════════════════════════
// 面板数据发送
// ═══════════════════════════════════════════════════════════════════════════

async function sendSavedConfigToFrame() {
    try {
        const loadedConfig = await readSummaryPanelConfigFromServer();
        const previousVectorConfig = getVectorConfig();
        const vectorChanged = JSON.stringify(previousVectorConfig || {})
            !== JSON.stringify(loadedConfig?.vector || {});
        const transition = vectorChanged
            ? await changeVectorConfig(
                'server-reload',
                () => applySummaryPanelConfigSnapshot(loadedConfig),
            )
            : null;
        const savedConfig = transition?.result
            || (vectorChanged ? getSummaryPanelConfig() : applySummaryPanelConfigSnapshot(loadedConfig));
        postToFrame({
            type: "LOAD_PANEL_CONFIG",
            config: savedConfig,
            builtInSummaryPrompts: BUILTIN_SUMMARY_PROMPTS,
        });
    } catch (e) {
        xbLog.warn(MODULE_ID, "加载面板配置失败", e);
    }
}

function getHideUiSettings() {
    const cfg = getSummaryPanelConfig() || {};
    const ui = cfg.ui || {};
    const parsedKeep = Number.parseInt(ui.keepVisibleCount, 10);
    const keepVisibleCount = Number.isFinite(parsedKeep) ? Math.max(0, Math.min(50, parsedKeep)) : 6;
    return {
        hideSummarized: !!ui.hideSummarized,
        keepVisibleCount,
        useVectorBoundary: ui.useVectorBoundary !== false,
    };
}

function setHideUiSettings(patch = {}) {
    const cfg = getSummaryPanelConfig() || {};
    const current = getHideUiSettings();
    const next = {
        ...cfg,
        ui: {
            ...(cfg.ui || {}),
            hideSummarized: patch.hideSummarized !== undefined ? !!patch.hideSummarized : current.hideSummarized,
            keepVisibleCount: patch.keepVisibleCount !== undefined
                ? (() => {
                    const parsedKeep = Number.parseInt(patch.keepVisibleCount, 10);
                    return Number.isFinite(parsedKeep) ? Math.max(0, Math.min(50, parsedKeep)) : 6;
                })()
                : current.keepVisibleCount,
            useVectorBoundary: patch.useVectorBoundary !== undefined
                ? !!patch.useVectorBoundary
                : current.useVectorBoundary,
        },
    };
    saveSummaryPanelConfig(next);
    return next.ui;
}

async function sendFrameBaseData(store, totalFloors) {
    const ui = getHideUiSettings();
    const boundary = await getHideBoundaryFloor(store);
    const range = calcHideRange(boundary, ui.keepVisibleCount);
    const hiddenCount = (ui.hideSummarized && range) ? (range.end + 1) : 0;

    const lastSummarized = store?.lastSummarizedMesId ?? -1;
    const rollbackTargetEndMesId = getRollbackOnceTargetEndMesId(store);
    postToFrame({
        type: "SUMMARY_BASE_DATA",
        stats: {
            totalFloors,
            summarizedUpTo: lastSummarized + 1,
            eventsCount: store?.json?.events?.length || 0,
            pendingFloors: totalFloors - lastSummarized - 1,
            hiddenCount,
        },
        hideSummarized: ui.hideSummarized,
        keepVisibleCount: ui.keepVisibleCount,
        useVectorBoundary: ui.useVectorBoundary,
        vectorEnabled: !!getVectorConfig()?.enabled,
        canRollback: rollbackTargetEndMesId != null,
        rollbackTargetSummarizedUpTo: rollbackTargetEndMesId == null ? 0 : rollbackTargetEndMesId + 1,
        rollbackWillResetBoundary: rollbackTargetEndMesId != null && rollbackTargetEndMesId < 0,
    });
}

function sendFrameFullData(store, totalFloors) {
    if (store?.json) {
        postToFrame({
            type: "SUMMARY_FULL_DATA",
            payload: buildFramePayload(store),
        });
    } else {
        postToFrame({ type: "SUMMARY_CLEARED", payload: { totalFloors } });
    }
}

function buildFramePayload(store) {
    const json = store?.json || {};
    const facts = json.facts || [];
    return {
        chatId: getContext().chatId || '',
        keywords: json.keywords || [],
        events: json.events || [],
        characters: {
            main: json.characters?.main || [],
            relationships: extractRelationshipsFromFacts(facts),
        },
        arcs: json.arcs || [],
        facts,
        lastSummarizedMesId: store?.lastSummarizedMesId ?? -1,
    };
}

async function copyTextToClipboard(text) {
    const value = String(text ?? "");
    if (!value) {
        throw new Error("没有可复制的内容");
    }

    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return;
    }

    const ta = document.createElement("textarea");
    ta.value = value;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand?.("copy");
    ta.remove();
    if (!ok) {
        throw new Error("浏览器不支持自动复制");
    }
}

function stripFloorMarker(summary) {
    return String(summary || "")
        .replace(/\s*\(#\d+(?:-\d+)?\)\s*$/, "")
        .trim();
}

function normalizeInternalFact(item) {
    const fact = item && typeof item === "object" ? item : {};
    const base = {
        id: String(fact?.id || "").trim(),
        s: String(fact?.s ?? "").trim(),
        p: String(fact?.p ?? "").trim(),
        o: String(fact?.o ?? "").trim(),
    };

    const stateValue = fact?._isState ?? fact?.isState;
    if (stateValue != null) {
        base._isState = !!stateValue;
    }

    const trendValue = String(fact?.trend ?? "").trim();
    if (trendValue) {
        base.trend = trendValue;
    }

    return base;
}

function normalizePortableFact(item) {
    const fact = item && typeof item === "object" ? item : {};
    const base = {
        id: String(fact?.id || "").trim(),
        s: String(fact?.人物名字 ?? "").trim(),
        p: String(fact?.种类 ?? "").trim(),
        o: String(fact?.描述 ?? "").trim(),
    };

    const stateValue = fact?._isState ?? fact?.isState ?? fact?.核心事实;
    if (stateValue != null) {
        base._isState = !!stateValue;
    }

    const trendValue = String(fact?.trend ?? fact?.趋势 ?? "").trim();
    if (trendValue) {
        base.trend = trendValue;
    }

    return base;
}

function serializePortableFact(fact) {
    const out = {
        人物名字: String(fact?.s || "").trim(),
        种类: String(fact?.p || "").trim(),
        描述: String(fact?.o || "").trim(),
    };

    if (fact?._isState != null) {
        out.核心事实 = !!fact._isState;
    }

    if (fact?.trend) {
        out.趋势 = String(fact.trend).trim();
    }

    return out;
}

function cloneSummaryJsonForPortability(json) {
    const src = json && typeof json === "object" ? json : {};
    const characters = src.characters && typeof src.characters === "object" ? src.characters : {};
    return {
        keywords: Array.isArray(src.keywords)
            ? src.keywords.map((item) => ({
                text: String(item?.text || "").trim(),
                weight: String(item?.weight || "").trim(),
            })).filter((item) => item.text)
            : [],
        events: Array.isArray(src.events)
            ? src.events.map((item) => ({
                id: String(item?.id || "").trim(),
                title: String(item?.title || "").trim(),
                timeLabel: String(item?.timeLabel || "").trim(),
                summary: stripFloorMarker(item?.summary),
                participants: Array.isArray(item?.participants)
                    ? item.participants.map((name) => String(name || "").trim()).filter(Boolean)
                    : [],
                type: String(item?.type || "").trim(),
                weight: String(item?.weight || "").trim(),
                causedBy: Array.isArray(item?.causedBy)
                    ? item.causedBy.map((id) => String(id || "").trim()).filter(Boolean)
                    : [],
            })).filter((item) => item.id || item.title || item.summary)
            : [],
        characters: {
            main: Array.isArray(characters.main)
                ? characters.main
                    .map((item) => typeof item === "string"
                        ? { name: String(item).trim() }
                        : { name: String(item?.name || "").trim() })
                    .filter((item) => item.name)
                : (Array.isArray(characters)
                    ? characters
                        .map((item) => typeof item === "string"
                            ? { name: String(item).trim() }
                            : { name: String(item?.name || "").trim() })
                        .filter((item) => item.name)
                    : []),
        },
        characterAliases: normalizeCharacterAliases(src.characterAliases)
            .map((item) => ({
                from: item.from,
                to: item.to,
                evidence: item.evidence,
            })),
        arcs: Array.isArray(src.arcs)
            ? src.arcs.map((item) => ({
                name: String(item?.name || "").trim(),
                trajectory: String(item?.trajectory || "").trim(),
                progress: Number.isFinite(Number(item?.progress)) ? Number(item.progress) : 0,
                moments: Array.isArray(item?.moments)
                    ? item.moments
                        .map((moment) => typeof moment === "string"
                            ? { text: String(moment).trim() }
                            : { text: String(moment?.text || "").trim() })
                        .filter((moment) => moment.text)
                    : [],
            })).filter((item) => item.name)
            : [],
        facts: Array.isArray(src.facts)
            ? src.facts.map(normalizeInternalFact).filter((item) => item.s && item.p && item.o)
            : [],
    };
}

function extractSummaryImportJson(raw) {
    if (!raw || typeof raw !== "object") {
        throw new Error("文件内容不是有效 JSON 对象");
    }

    const candidate =
        (raw.type === "LittleWhiteBoxStorySummaryMemory" && raw.data && typeof raw.data === "object" ? raw.data : null) ||
        (raw.storySummary?.json && typeof raw.storySummary.json === "object" ? raw.storySummary.json : null) ||
        (raw.json && typeof raw.json === "object" ? raw.json : null) ||
        raw;

    const hasSummaryShape =
        Array.isArray(candidate.keywords) ||
        Array.isArray(candidate.events) ||
        Array.isArray(candidate.arcs) ||
        Array.isArray(candidate.facts) ||
        (candidate.characters && typeof candidate.characters === "object");

    if (!hasSummaryShape) {
        throw new Error("未识别到可导入的总结数据");
    }

    const json = cloneSummaryJsonForPortability(candidate);
    json.facts = Array.isArray(candidate.facts)
        ? candidate.facts.map(normalizePortableFact).filter((item) => item.s && item.p && item.o)
        : [];
    return json;
}

function buildSummaryExportPackage(store) {
    const json = cloneSummaryJsonForPortability(store?.json || {});
    const data = {
        ...json,
        facts: json.facts.map(serializePortableFact),
    };
    return {
        type: "LittleWhiteBoxStorySummaryMemory",
        version: 1,
        exportedAt: new Date().toISOString(),
        data,
        counts: {
            keywords: json.keywords.length,
            events: json.events.length,
            characters: json.characters.main.length,
            aliases: json.characterAliases.length,
            arcs: json.arcs.length,
            facts: json.facts.length,
        },
    };
}

function pushSection(lines, title, items) {
    if (!items.length) return;
    if (lines.length) lines.push("");
    lines.push(`## ${title}`, "", ...items);
}

function formatSummaryCharacterName(item) {
    return String(typeof item === "string" ? item : item?.name || "").trim();
}

function formatSummaryProgress(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "0%";
    return `${Math.round(Math.max(0, Math.min(1, n)) * 100)}%`;
}

function formatStorySummaryMemoryText(store) {
    const json = cloneSummaryJsonForPortability(store?.json || {});
    const lines = [];

    pushSection(lines, "关键词", (json.keywords || [])
        .map((item) => {
            const text = String(item?.text || "").trim();
            if (!text) return "";
            const weight = String(item?.weight || "").trim();
            return `- ${text}${weight ? `（${weight}）` : ""}`;
        })
        .filter(Boolean));

    pushSection(lines, "事件时间线", (json.events || [])
        .map((event, index) => {
            const title = String(event?.title || "").trim() || `事件 ${index + 1}`;
            const timeLabel = String(event?.timeLabel || "").trim();
            const summary = stripFloorMarker(event?.summary);
            const participants = Array.isArray(event?.participants)
                ? event.participants.map((name) => String(name || "").trim()).filter(Boolean)
                : [];
            const meta = [
                timeLabel ? `时间：${timeLabel}` : "",
                participants.length ? `参与者：${participants.join("、")}` : "",
                event?.type ? `类型：${event.type}` : "",
                event?.weight ? `权重：${event.weight}` : "",
            ].filter(Boolean).join("；");
            return [
                `### ${title}`,
                meta,
                summary,
            ].filter(Boolean).join("\n");
        })
        .filter(Boolean));

    pushSection(lines, "主要角色", (json.characters?.main || [])
        .map(formatSummaryCharacterName)
        .filter(Boolean)
        .map((name) => `- ${name}`));

    pushSection(lines, "角色别名", normalizeCharacterAliases(json.characterAliases)
        .map((alias) => `- ${alias.to}：${alias.from}${alias.evidence ? `（${alias.evidence}）` : ""}`));

    pushSection(lines, "角色弧光", (json.arcs || [])
        .map((arc) => {
            const name = String(arc?.name || "").trim();
            if (!name) return "";
            const trajectory = String(arc?.trajectory || "").trim();
            const moments = Array.isArray(arc?.moments)
                ? arc.moments.map((moment) => String(moment?.text || "").trim()).filter(Boolean)
                : [];
            return [
                `### ${name}`,
                trajectory ? `${trajectory}（进度：${formatSummaryProgress(arc?.progress)}）` : `进度：${formatSummaryProgress(arc?.progress)}`,
                ...moments.map((moment) => `- ${moment}`),
            ].filter(Boolean).join("\n");
        })
        .filter(Boolean));

    pushSection(lines, "事实图谱", (json.facts || [])
        .map((fact) => {
            const subject = String(fact?.s || "").trim();
            const predicate = String(fact?.p || "").trim();
            const object = String(fact?.o || "").trim();
            if (!subject || !predicate || !object) return "";
            const trend = String(fact?.trend || "").trim();
            return `- ${subject}｜${predicate}｜${object}${trend ? `（趋势：${trend}）` : ""}`;
        })
        .filter(Boolean));

    return lines.join("\n").trim();
}

function stampImportedSummaryJson(json, boundary) {
    if (!json || typeof json !== "object" || !Number.isFinite(boundary) || boundary < 0) {
        return;
    }

    for (const item of (json.keywords || [])) {
        if (item && typeof item === "object") item._addedAt = boundary;
    }

    for (const item of (json.events || [])) {
        if (item && typeof item === "object") item._addedAt = boundary;
    }

    const mainCharacters = json.characters?.main || [];
    for (const item of mainCharacters) {
        if (item && typeof item === "object") item._addedAt = boundary;
    }

    for (const alias of (json.characterAliases || [])) {
        if (alias && typeof alias === "object") alias._addedAt = boundary;
    }

    for (const arc of (json.arcs || [])) {
        if (!arc || typeof arc !== "object") continue;
        arc._addedAt = boundary;
        for (const moment of (arc.moments || [])) {
            if (moment && typeof moment === "object") moment._addedAt = boundary;
        }
    }

    for (const fact of (json.facts || [])) {
        if (fact && typeof fact === "object") fact._addedAt = boundary;
    }
}

function applyImportedSummaryBoundary(store, boundary) {
    if (!store?.json || !Number.isFinite(boundary) || boundary < 0) {
        return false;
    }

    stampImportedSummaryJson(store.json, boundary);
    store.lastSummarizedMesId = boundary;
    store.summaryHistory = [{ endMesId: boundary }];
    delete store.pendingImportBoundary;
    store.updatedAt = Date.now();
    return true;
}

async function importSummaryMemoryPackage(rawText, targetChatId = '') {
    if (!String(rawText || "").trim()) {
        throw new Error("记忆包内容为空");
    }
    let parsed;
    try {
        parsed = JSON.parse(String(rawText));
    } catch {
        throw new Error("JSON 解析失败");
    }

    const importedJson = extractSummaryImportJson(parsed);
    const { chatId, chat } = getContext();
    if (!chatId || (targetChatId && chatId !== targetChatId)) {
        throw new Error("当前没有打开聊天");
    }
    const assertImportActive = () => {
        if (getContext()?.chatId !== chatId) {
            throw new Error("聊天已切换，已取消导入");
        }
    };

    const store = getSummaryStore();
    if (!store) {
        throw new Error("无法读取当前聊天的总结存储");
    }
    const previousStore = structuredClone(store);

    await updateMeta(chatId, { lastChunkFloor: -1, fingerprint: null });
    assertImportActive();
    await clearAllAtomsAndVectors(chatId);
    assertImportActive();
    await clearAllChunks(chatId);
    assertImportActive();
    await clearEventVectors(chatId);
    assertImportActive();
    await clearStateVectors(chatId);
    assertImportActive();

    invalidateLexicalIndex();

    store.json = importedJson;
    delete store.aliasMigrations;
    delete store.summaryInvalid;
    const importBoundary = (Array.isArray(chat) ? chat.length : 0) - 1;
    if (importBoundary >= 0) {
        applyImportedSummaryBoundary(store, importBoundary);
    } else {
        store.lastSummarizedMesId = -1;
        store.summaryHistory = [];
        store.pendingImportBoundary = true;
    }
    store.updatedAt = Date.now();
    let importCommitted = false;
    try {
        await saveSummaryStoreImmediately(chatId);
        importCommitted = true;
        assertImportActive();
    } catch (error) {
        if (!importCommitted) {
            for (const key of Object.keys(store)) delete store[key];
            Object.assign(store, previousStore);
        }
        throw error;
    }

    refreshEntityLexiconAndWarmup();
    scheduleLexicalWarmup();

    await clearHideState();
    assertImportActive();
    const totalFloors = Array.isArray(chat) ? chat.length : 0;
    await sendFrameBaseData(store, totalFloors);
    sendFrameFullData(store, totalFloors);
    await sendAnchorStatsToFrame();
    await sendVectorStatsToFrame();

    return {
        counts: {
            keywords: importedJson.keywords.length,
            events: importedJson.events.length,
            characters: importedJson.characters.main.length,
            arcs: importedJson.arcs.length,
            facts: importedJson.facts.length,
        },
    };
}

// Compatibility export for ena-planner.
// Returns a compact plain-text snapshot of story-summary memory.
export function getStorySummaryForEna() {
    if (!isStorySummaryConsumableForCurrentChat()) return "";
    return getStorySummaryMemoryText();
}

export function getStorySummaryMemoryText() {
    return formatStorySummaryMemoryText(getSummaryStore());
}

function getNextFactIdValue(facts) {
    let max = 0;
    for (const fact of facts || []) {
        const match = String(fact?.id || "").match(/^f-(\d+)$/);
        if (match) max = Math.max(max, Number.parseInt(match[1], 10) || 0);
    }
    return max + 1;
}

function mergeCharacterRelationshipsIntoFacts(existingFacts, relationships, floorHint = 0) {
    const safeFacts = Array.isArray(existingFacts) ? existingFacts : [];
    const safeRels = Array.isArray(relationships) ? relationships : [];

    const nonRelationFacts = safeFacts.filter((fact) => fact?.retracted || !isRelationFact(fact));
    const oldRelationByKey = new Map();

    for (const fact of safeFacts) {
        const to = parseRelationTarget(fact?.p);
        const from = String(fact?.s || "").trim();
        if (!from || !to) continue;
        oldRelationByKey.set(`${from}->${to}`, fact);
    }

    let nextFactId = getNextFactIdValue(safeFacts);
    const newRelationFacts = [];

    for (const rel of safeRels) {
        const from = String(rel?.from || "").trim();
        const to = String(rel?.to || "").trim();
        if (!from || !to) continue;

        const key = `${from}->${to}`;
        const oldFact = oldRelationByKey.get(key);
        const label = String(rel?.label || "").trim() || "未知";
        const trend = String(rel?.trend || "").trim() || "陌生";
        const id = oldFact?.id || `f-${nextFactId++}`;

        newRelationFacts.push({
            id,
            s: from,
            p: oldFact?.p || `对${to}的关系`,
            o: label,
            trend,
            since: oldFact?.since ?? floorHint,
            _addedAt: oldFact?._addedAt ?? floorHint,
        });
    }

    return [...nonRelationFacts, ...newRelationFacts];
}

function getCurrentFloorHint() {
    const { chat } = getContext();
    const lastFloor = (Array.isArray(chat) ? chat.length : 0) - 1;
    return Math.max(0, lastFloor);
}

function factKeyBySubjectPredicate(fact) {
    const s = String(fact?.s || "").trim();
    const p = String(fact?.p || "").trim();
    return `${s}::${p}`;
}

function mergeEditedFactsWithTimestamps(existingFacts, editedFacts, floorHint = 0) {
    const currentFacts = Array.isArray(existingFacts) ? existingFacts : [];
    const incomingFacts = Array.isArray(editedFacts) ? editedFacts : [];
    const oldMap = new Map(currentFacts.map((f) => [factKeyBySubjectPredicate(f), f]));

    let nextFactId = getNextFactIdValue(currentFacts);
    const merged = [];

    for (const fact of incomingFacts) {
        const s = String(fact?.s || "").trim();
        const p = String(fact?.p || "").trim();
        const o = String(fact?.o || "").trim();
        if (!s || !p || !o) continue;

        const key = `${s}::${p}`;
        const oldFact = oldMap.get(key);
        const since = oldFact?.since ?? fact?.since ?? floorHint;
        const addedAt = oldFact?._addedAt ?? fact?._addedAt ?? floorHint;

        const out = {
            id: oldFact?.id || fact?.id || `f-${nextFactId++}`,
            s,
            p,
            o,
            since,
            _addedAt: addedAt,
        };
        if (oldFact?._isState != null) out._isState = oldFact._isState;

        const mergedTrend = fact?.trend ?? oldFact?.trend;
        if (mergedTrend != null && String(mergedTrend).trim()) {
            out.trend = String(mergedTrend).trim();
        }
        merged.push(out);
    }

    return merged;
}

function openPanelForMessage(mesId) {
    createOverlay();
    showOverlay();

    const { chat } = getContext();
    const store = getSummaryStore();
    const totalFloors = chat.length;

    sendFrameBaseData(store, totalFloors);
    sendFrameFullData(store, totalFloors);
    notifySummaryState();

    sendVectorConfigToFrame();
    sendVectorStatsToFrame();
}

// ═══════════════════════════════════════════════════════════════════════════
// Hide/Unhide
// - 非向量：boundary = lastSummarizedMesId
// - 向量：boundary = meta.lastChunkFloor（若为 -1 或关闭向量边界隐藏，则回退到 lastSummarizedMesId）
// ═══════════════════════════════════════════════════════════════════════════

async function getHideBoundaryFloor(store) {
    // 没有总结时，不隐藏
    if (store?.lastSummarizedMesId == null || store.lastSummarizedMesId < 0) {
        return -1;
    }

    const vectorCfg = getVectorConfig();
    if (!vectorCfg?.enabled || getHideUiSettings().useVectorBoundary === false) {
        return store?.lastSummarizedMesId ?? -1;
    }

    const { chatId } = getContext();
    if (!chatId) return store?.lastSummarizedMesId ?? -1;

    const meta = await getMeta(chatId);
    const v = meta?.lastChunkFloor ?? -1;
    if (v >= 0) return v;
    return store?.lastSummarizedMesId ?? -1;
}

async function applyHideState({ reset = true } = {}) {
    if (!isStorySummaryConsumableForCurrentChat()) return;
    const store = getSummaryStore();
    const ui = getHideUiSettings();
    if (!ui.hideSummarized) return;

    const boundary = await getHideBoundaryFloor(store);
    if (boundary < 0) return;

    const range = calcHideRange(boundary, ui.keepVisibleCount);
    if (!range) return;

    if (reset) {
        // 仅在隐藏范围可能缩小时清理历史残留；普通后台维护只补 hide，避免短暂全展开。
        await unhideAllMessages();
        await executeSlashCommand(`/hide ${range.start}-${range.end}`);
        return;
    }

    const changed = applyHideRangeInMemory(range);
    if (changed > 0) {
        xbLog.info(MODULE_ID, `后台隐藏已同步到当前聊天状态：${range.start}-${range.end} changed=${changed}`);
    }
}

function cancelHideApplyTimer() {
    clearTimeout(hideApplyTimer);
    hideApplyTimer = null;
}

function applyHideStateDebounced({ reset = false } = {}) {
    cancelHideApplyTimer();
    hideApplyTimer = setTimeout(() => {
        hideApplyTimer = null;
        if (!isStorySummaryConsumableForCurrentChat()) return;
        if (!getHideUiSettings().hideSummarized) return;
        applyHideState({ reset }).catch((e) => xbLog.warn(MODULE_ID, "applyHideState failed", e));
    }, HIDE_APPLY_DEBOUNCE_MS);
}

function scheduleLexicalWarmup(delayMs = LEXICAL_WARMUP_DEBOUNCE_MS) {
    clearTimeout(lexicalWarmupTimer);
    const scheduledChatId = getContext().chatId || null;
    lexicalWarmupTimer = setTimeout(() => {
        lexicalWarmupTimer = null;
        if (isChatStale(scheduledChatId)) return;
        const quietWait = getBackgroundQuietWaitMs();
        if (quietWait > 0) {
            scheduleLexicalWarmup(quietWait);
            return;
        }
        warmupIndex();
    }, delayMs);
}

function scheduleAutoSummary(reason, delayMs = AUTO_SUMMARY_DELAY_MS) {
    const scheduledChatId = getContext().chatId || null;
    const previous = autoSummaryTimers.get(reason);
    if (previous) clearTimeout(previous);

    const timer = setTimeout(() => {
        autoSummaryTimers.delete(reason);
        if (isChatStale(scheduledChatId)) return;
        const quietWait = getBackgroundQuietWaitMs();
        if (quietWait > 0) {
            scheduleAutoSummary(reason, quietWait);
            return;
        }
        maybeAutoRunSummary(reason);
    }, delayMs);
    autoSummaryTimers.set(reason, timer);
}

function scheduleAutoL0Backfill(delayMs = AUTO_L0_BACKFILL_DELAY_MS, chatIdOverride = null) {
    clearTimeout(autoL0BackfillTimer);
    const scheduledChatId = chatIdOverride || getContext().chatId || null;
    autoL0BackfillTimer = setTimeout(() => {
        autoL0BackfillTimer = null;
        if (isChatStale(scheduledChatId)) return;
        const quietWait = getBackgroundQuietWaitMs();
        if (quietWait > 0) {
            scheduleAutoL0Backfill(quietWait, scheduledChatId);
            return;
        }
        maybeRunDelayedVectorMaintenance(scheduledChatId);
    }, delayMs);
}

/** 连续失败时 6s → 12s → 24s … 封顶 5min；成功后由调用方清零。 */
function nextBackoffDelayMs(currentMs) {
    return currentMs ? Math.min(currentMs * 2, VECTOR_RETRY_MAX_MS) : BACKGROUND_VISIBLE_GRACE_MS;
}

function scheduleVectorIntegrityCheck(delayMs = 2000) {
    clearTimeout(vectorIntegrityTimer);
    const scheduledChatId = getContext().chatId || null;
    vectorIntegrityTimer = setTimeout(() => {
        vectorIntegrityTimer = null;
        if (isChatStale(scheduledChatId)) return;
        const quietWait = getBackgroundQuietWaitMs();
        if (quietWait > 0) {
            scheduleVectorIntegrityCheck(quietWait);
            return;
        }
        checkVectorIntegrityAndWarn().then(() => {
            vectorIntegrityRetryDelayMs = 0;
        }, (error) => {
            xbLog.warn(MODULE_ID, '向量完整性检查失败', error);
            if (isBackgroundWorkLive(scheduledChatId)) {
                vectorIntegrityRetryDelayMs = nextBackoffDelayMs(vectorIntegrityRetryDelayMs);
                scheduleVectorIntegrityCheck(vectorIntegrityRetryDelayMs);
            }
        });
    }, delayMs);
}

function clearDeferredBackgroundTasks() {
    clearTimeout(lexicalWarmupTimer);
    lexicalWarmupTimer = null;
    clearTimeout(autoL0BackfillTimer);
    autoL0BackfillTimer = null;
    clearTimeout(vectorIntegrityTimer);
    vectorIntegrityTimer = null;
    vectorIntegrityRetryDelayMs = 0;
    vectorMaintenanceRetryDelayMs = 0;
    clearVectorMaintenance();
    for (const timer of autoSummaryTimers.values()) clearTimeout(timer);
    autoSummaryTimers.clear();
}

async function clearHideState() {
    cancelHideApplyTimer();
    // 暴力全量 unhide，确保立刻恢复
    await unhideAllMessages();
}

// ═══════════════════════════════════════════════════════════════════════════
// 自动总结
// ═══════════════════════════════════════════════════════════════════════════

async function maybeAutoRunSummary(reason) {
    const { chatId, chat } = getContext();
    if (!chatId || !Array.isArray(chat)) return;
    if (!isStorySummaryEnabledForCurrentChat()) return;
    if (!isStorySummaryConsumableForCurrentChat()) return;

    const cfgAll = getSummaryPanelConfig();
    const trig = cfgAll.trigger || {};

    if (!trig.enabled) return;
    if (trig.timing === "after_ai" && reason !== "after_ai") return;
    if (trig.timing === "before_user" && reason !== "before_user") return;

    if (isSummaryGenerating()) return;

    const store = getSummaryStore();
    const lastSummarized = store?.lastSummarizedMesId ?? -1;
    const pending = chat.length - lastSummarized - 1;
    if (pending < (trig.interval || 1)) return;

    await autoRunSummaryWithRetry(chat.length - 1, { api: cfgAll.api, gen: cfgAll.gen, trigger: trig });
}

async function autoRunSummaryWithRetry(targetMesId, configForRun) {
    const release = guard.acquire('summary');
    if (!release) return;
    const execution = beginSummaryExecution();
    if (!execution) {
        release();
        return;
    }
    notifySummaryState();

    try {
        let lastResult = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
            const result = await runSummaryGeneration(targetMesId, configForRun, {
                onStatus: (text) => postToFrame({ type: "SUMMARY_STATUS", statusText: text }),
                onError: (msg) => postToFrame({ type: "SUMMARY_ERROR", message: msg }),
                onComplete: async ({ newEventIds, aliasChanged, store }) => {
                    assertSummaryExecutionActive(execution);
                    postToFrame({ type: "SUMMARY_FULL_DATA", payload: buildFramePayload(store) });

                    // Incrementally add new events to the lexical index
                    if (aliasChanged) {
                        invalidateLexicalIndex();
                        refreshEntityLexiconAndWarmup();
                        scheduleLexicalWarmup();
                    } else if (newEventIds?.length) {
                        const allEvents = store?.json?.events || [];
                        const idSet = new Set(newEventIds);
                        addEventDocuments(allEvents.filter(e => idSet.has(e.id)));
                    }

                    if (isStorySummaryEnabledForCurrentChat() && getHideUiSettings().hideSummarized) {
                        applyHideStateDebounced();
                    }
                    await updateFrameStatsAfterSummary(store, execution);

                    await autoVectorizeMissingEvents(store, execution);
                    await rebuildActiveVectorCacheAfterSummary(execution);
                },
            }, {
                signal: execution.controller.signal,
                targetChatId: execution.chatId,
            });
            lastResult = result;

            if (result.cancelled) {
                if (result.committed && isStorySummaryConsumableForCurrentChat()) {
                    scheduleVectorIntegrityCheck();
                }
                return;
            }

            if (result.success) {
                if (isStorySummaryConsumableForCurrentChat()) scheduleVectorIntegrityCheck();
                return;
            }

            if (attempt < 3) await sleep(1000);
        }

        if (lastResult?.stale) {
            await executeSlashCommand("/echo severity=warning 对话在总结期间持续变化，本次结果未保存；下次触发时会重新总结。");
        } else {
            await executeSlashCommand("/echo severity=error 剧情总结失败（已自动重试 3 次）。请稍后再试。");
        }
    } finally {
        finishSummaryExecution(execution);
        release();
        notifySummaryState();
    }
}

async function updateFrameStatsAfterSummary(store, execution) {
    assertSummaryExecutionActive(execution);
    const { chat } = getContext();
    const totalFloors = Array.isArray(chat) ? chat.length : 0;
    await sendFrameBaseData(store, totalFloors);
    assertSummaryExecutionActive(execution);
}

// ═══════════════════════════════════════════════════════════════════════════
// iframe 消息处理
// ═══════════════════════════════════════════════════════════════════════════

async function handleFrameMessage(event) {
    const iframe = document.getElementById("xiaobaix-story-summary-iframe");
    if (!isTrustedMessage(event, iframe, "LittleWhiteBox-StoryFrame")) return;

    const data = event.data;

    switch (data.type) {
        case "FRAME_READY": {
            frameReady = true;
            flushPendingFrameMessages();
            notifySummaryState();
            sendSavedConfigToFrame();
            sendVectorConfigToFrame();
            sendVectorStatsToFrame();
            sendAnchorStatsToFrame();
            notifyStorySummaryChatState();
            break;
        }

        case "SETTINGS_OPENED":
        case "FULLSCREEN_OPENED":
        case "EDITOR_OPENED":
        case "CONFIRM_OPENED":
            $(".xb-ss-close-btn").hide();
            break;

        case "SETTINGS_CLOSED":
            removeBackupManagerModal();
            $(".xb-ss-close-btn").show();
            break;

        case "FULLSCREEN_CLOSED":
        case "EDITOR_CLOSED":
        case "CONFIRM_CLOSED":
            $(".xb-ss-close-btn").show();
            break;

        case "SET_CURRENT_CHAT_ENABLED": {
            try {
                await setStorySummaryEnabledForCurrentChat(data.enabled !== false);
            } catch (error) {
                xbLog.warn(MODULE_ID, "Failed to update current chat story summary state", error);
                postToFrame({ type: "SUMMARY_ERROR", message: "当前聊天开关未能保存，请重试" });
                notifyStorySummaryChatState();
            }
            break;
        }

        case "REQUEST_GENERATE": {
            if (!isStorySummaryEnabledForCurrentChat()) {
                postToFrame({ type: "SUMMARY_STATUS", statusText: "请先启用当前聊天的剧情总结" });
                notifyStorySummaryChatState();
                break;
            }
            if (!isStorySummaryConsumableForCurrentChat()) {
                postToFrame({ type: "SUMMARY_ERROR", message: "总结历史无法安全回滚：请导出当前总结，修正后重新导入，或清空总结数据" });
                break;
            }
            const ctx = getContext();
            currentMesId = (ctx.chat?.length ?? 1) - 1;
            handleManualGenerate(currentMesId, data.config || {});
            break;
        }

        case "REQUEST_CANCEL":
            if (cancelActiveSummaryExecution()) {
                postToFrame({ type: "SUMMARY_STATUS", statusText: "正在停止..." });
            }
            break;

        case "FETCH_SUMMARY_MODELS":
            (async () => {
                try {
                    const models = await fetchSummaryModelsForUi(data);
                    postToFrame({
                        type: "SUMMARY_MODELS",
                        requestId: data.requestId || "",
                        models,
                    });
                } catch (e) {
                    postToFrame({
                        type: "SUMMARY_MODELS_ERROR",
                        requestId: data.requestId || "",
                        message: String(e?.message || e || "拉取模型失败"),
                    });
                }
            })();
            break;

        case "VECTOR_TEST_ONLINE":
            handleTestOnlineService(data.provider, data.config, data.target || "embedding");
            break;

        case "VECTOR_GENERATE":
            if (data.config) {
                if (JSON.stringify(getVectorConfig() || {}) !== JSON.stringify(data.config || {})) {
                    await changeVectorConfig(
                        'vector-generate',
                        () => saveVectorConfig(data.config) || {},
                    );
                }
            }
            maybePreloadTokenizer();
            refreshEntityLexiconAndWarmup();
            handleGenerateVectors();
            break;

        case "VECTOR_CLEAR":
            await handleClearVectors();
            break;

        case "VECTOR_CANCEL_GENERATE":
            cancelVectorWriteOperation(VECTOR_GENERATION_OPERATION, 'Vector generation cancelled');
            scheduleVectorIntegrityCheck(0);
            postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "ALL", current: -1, total: 0 });
            break;

        case "ANCHOR_GENERATE":
            await handleAnchorGenerate();
            break;

        case "ANCHOR_CLEAR":
            await handleAnchorClear();
            break;

        case "ANCHOR_CANCEL":
            handleAnchorCancel();
            break;

        case "REQUEST_ANCHOR_STATS":
            sendAnchorStatsToFrame();
            break;

        case "REQUEST_RECALL_LOG":
            postToFrame({ type: "RECALL_LOG", text: lastRecallLogText });
            break;

        case "VECTOR_EXPORT":
            (async () => {
                try {
                    const result = await exportVectors((status) => {
                        postToFrame({ type: "VECTOR_IO_STATUS", status });
                    });
                    postToFrame({
                        type: "VECTOR_EXPORT_RESULT",
                        success: true,
                        filename: result.filename,
                        size: result.size,
                        chunkCount: result.chunkCount,
                        eventCount: result.eventCount,
                    });
                } catch (e) {
                    postToFrame({ type: "VECTOR_EXPORT_RESULT", success: false, error: e.message });
                }
            })();
            break;

        case "SUMMARY_COPY":
            (async () => {
                try {
                    const store = getSummaryStore();
                    const payload = buildSummaryExportPackage(store);
                    await copyTextToClipboard(JSON.stringify(payload, null, 2));
                    postToFrame({
                        type: "SUMMARY_COPY_RESULT",
                        success: true,
                        events: payload.counts.events,
                        facts: payload.counts.facts,
                    });
                } catch (e) {
                    postToFrame({ type: "SUMMARY_COPY_RESULT", success: false, error: e.message });
                }
            })();
            break;

        case "SUMMARY_IMPORT_TEXT":
            if (guard.isAnyRunning('summary', 'vector', 'anchor')) {
                postToFrame({ type: "SUMMARY_IMPORT_RESULT", success: false, error: "请等待当前总结/向量任务结束" });
                break;
            }
            (async () => {
                try {
                    const targetChatId = getContext()?.chatId || '';
                    const result = await runVectorWriteTask(
                        {
                            chatId: targetChatId,
                            kind: 'summary-import',
                            scope: VECTOR_WRITE_SCOPES.IO,
                        },
                        async () => {
                            if (getContext()?.chatId !== targetChatId) {
                                throw new Error('聊天已切换，已取消导入');
                            }
                            return importSummaryMemoryPackage(data.text || "", targetChatId);
                        },
                    );
                    if (!result) {
                        postToFrame({ type: "SUMMARY_IMPORT_RESULT", success: false, error: "导入已取消" });
                        return;
                    }
                    notifyStorySummaryChatState();
                    postToFrame({
                        type: "SUMMARY_IMPORT_RESULT",
                        success: true,
                        counts: result.counts,
                    });
                } catch (e) {
                    postToFrame({ type: "SUMMARY_IMPORT_RESULT", success: false, error: e.message });
                }
            })();
            break;

        case "VECTOR_IMPORT_PICK":
            // 在 parent 创建 file picker，避免 iframe 传大文件
            (async () => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".zip";

                input.onchange = async () => {
                    const file = input.files?.[0];
                    if (!file) {
                        postToFrame({ type: "VECTOR_IMPORT_RESULT", success: false, error: "未选择文件" });
                        return;
                    }

                    try {
                        const targetChatId = getContext()?.chatId || '';
                        const result = await runVectorWriteTask(
                            {
                                chatId: targetChatId,
                                kind: 'vector-import',
                                scope: VECTOR_WRITE_SCOPES.IO,
                            },
                            async (writeSession) => {
                                if (getContext()?.chatId !== targetChatId) {
                                    throw new Error('聊天已切换，已取消导入');
                                }
                                return importVectors(file, (status) => {
                                    postToFrame({ type: "VECTOR_IO_STATUS", status });
                                }, {
                                    targetChatId,
                                    signal: writeSession.signal,
                                    isCurrent: () => isVectorWriteSessionCurrent(writeSession),
                                });
                            },
                        );
                        if (!result) {
                            postToFrame({ type: "VECTOR_IMPORT_RESULT", success: false, error: "导入已取消" });
                            return;
                        }
                        postToFrame({
                            type: "VECTOR_IMPORT_RESULT",
                            success: true,
                            chunkCount: result.chunkCount,
                            eventCount: result.eventCount,
                            warnings: result.warnings,
                            fingerprintMismatch: result.fingerprintMismatch,
                        });
                        await sendVectorStatsToFrame();
                    } catch (e) {
                        postToFrame({ type: "VECTOR_IMPORT_RESULT", success: false, error: e.message });
                    }
                };

                input.click();
            })();
            break;
        case "VECTOR_BACKUP_SERVER":
            (async () => {
                try {
                    const result = await backupToServer((status) => {
                        postToFrame({ type: "VECTOR_IO_STATUS", status });
                    });
                    postToFrame({
                        type: "VECTOR_BACKUP_RESULT",
                        success: true,
                        size: result.size,
                        chunkCount: result.chunkCount,
                        eventCount: result.eventCount,
                    });
                } catch (e) {
                    postToFrame({ type: "VECTOR_BACKUP_RESULT", success: false, error: e.message });
                }
            })();
            break;

        case "VECTOR_RESTORE_SERVER":
            (async () => {
                try {
                    const targetChatId = getContext()?.chatId || '';
                    const result = await runVectorWriteTask(
                        {
                            chatId: targetChatId,
                            kind: 'vector-restore',
                            scope: VECTOR_WRITE_SCOPES.IO,
                        },
                        async (writeSession) => {
                            if (getContext()?.chatId !== targetChatId) {
                                throw new Error('聊天已切换，已取消恢复');
                            }
                            return restoreFromServer((status) => {
                                postToFrame({ type: "VECTOR_IO_STATUS", status });
                            }, {
                                targetChatId,
                                signal: writeSession.signal,
                                isCurrent: () => isVectorWriteSessionCurrent(writeSession),
                            });
                        },
                    );
                    if (!result) {
                        postToFrame({ type: "VECTOR_RESTORE_RESULT", success: false, error: "恢复已取消" });
                        return;
                    }
                    postToFrame({
                        type: "VECTOR_RESTORE_RESULT",
                        success: true,
                        chunkCount: result.chunkCount,
                        eventCount: result.eventCount,
                        warnings: result.warnings,
                        fingerprintMismatch: result.fingerprintMismatch,
                    });
                    await sendVectorStatsToFrame();
                } catch (e) {
                    postToFrame({ type: "VECTOR_RESTORE_RESULT", success: false, error: e.message });
                }
            })();
            break;

        case "VECTOR_LIST_BACKUPS":
            (async () => {
                try {
                    const files = await fetchManifest();
                    showBackupManagerModal(files);
                } catch (e) {
                    showBackupManagerModal([]);
                }
            })();
            break;

        case "REQUEST_VECTOR_STATS":
            sendVectorStatsToFrame();
            maybePreloadTokenizer();
            break;

        case "REQUEST_CLEAR": {
            if (guard.isAnyRunning('summary', 'vector', 'anchor')) {
                await executeSlashCommand("/echo severity=warning 当前有任务运行中，暂时不能清理总结数据");
                break;
            }
            const { chat, chatId } = getContext();
            cancelPendingEventEditSync();
            cancelRecallAndClearPrompt('summary-cleared');
            const cleared = await runVectorWriteTask(
                { chatId, kind: 'summary-clear', scope: VECTOR_WRITE_SCOPES.IO },
                async () => {
                    if (getContext()?.chatId !== chatId) return false;
                    await clearSummaryData(chatId);
                    return true;
                },
            );
            if (!cleared) break;
            lastRecallLogText = "";
            invalidateLexicalIndex();
            await clearHideState();
            const totalFloors = Array.isArray(chat) ? chat.length : 0;
            const store = getSummaryStore();
            await sendFrameBaseData(store, totalFloors);
            sendFrameFullData(store, totalFloors);
            notifyStorySummaryChatState();
            await executeSlashCommand("/echo severity=info 剧情总结数据已清空");
            break;
        }

        case "REQUEST_ROLLBACK_ONCE": {
            if (guard.isAnyRunning('summary', 'vector', 'anchor')) {
                await executeSlashCommand("/echo severity=warning 当前有任务运行中，暂时不能回退总结");
                break;
            }

            const { chat, chatId } = getContext();
            if (!chatId) break;

            const currentStore = getSummaryStore();
            const rollbackTargetEndMesId = getRollbackOnceTargetEndMesId(currentStore);
            if (rollbackTargetEndMesId == null) {
                await executeSlashCommand("/echo severity=info 当前没有可回退的总结快照");
                break;
            }

            cancelPendingEventEditSync();
            const result = await runVectorWriteTask(
                { chatId, kind: 'summary-rollback', scope: VECTOR_WRITE_SCOPES.CONSISTENCY },
                async () => {
                    if (getContext()?.chatId !== chatId) return null;
                    return rollbackSummaryOnce(chatId);
                },
            );
            if (!result) break;
            if (result.success) {
                invalidateLexicalIndex();
                if (getHideUiSettings().hideSummarized) {
                    if (result.clearedBoundary) {
                        await clearHideState();
                    } else {
                        await applyHideState({ reset: true });
                    }
                }
            }
            const totalFloors = Array.isArray(chat) ? chat.length : 0;
            const nextStore = getSummaryStore();
            await sendFrameBaseData(nextStore, totalFloors);
            sendFrameFullData(nextStore, totalFloors);
            notifyStorySummaryChatState();

            if (!result.success) {
                await executeSlashCommand("/echo severity=error 回退总结失败：数据已被修改或历史链不完整，未应用任何更改");
                break;
            }

            if (result.clearedBoundary) {
                const message = result.clearedAll
                    ? "已回退首次总结，当前总结数据已清空"
                    : "已回退首次总结；未被本次总结修改的内容已保留";
                await executeSlashCommand(`/echo severity=info ${message}`);
            } else {
                await executeSlashCommand(`/echo severity=info 已回退上一次总结，已总结楼层退回到 ${result.targetEndMesId + 1} 楼`);
            }
            break;
        }

        case "CLOSE_PANEL":
            hideOverlay();
            break;

        case "UPDATE_SECTION": {
            const store = getSummaryStore();
            if (!store) break;
            store.json ||= {};

            // 如果是 events，先记录旧数据用于同步向量
            const oldEvents = data.section === "events" ? [...(store.json.events || [])] : null;
            const oldFacts = data.section === "facts" ? [...(store.json.facts || [])] : null;

            if (VALID_SECTIONS.includes(data.section)) {
                store.json[data.section] = data.data;
            }
            if (data.section === "facts") {
                store.json.facts = mergeEditedFactsWithTimestamps(oldFacts, data.data, getCurrentFloorHint());
            }
            if (data.section === "characters") {
                const rels = data?.data?.relationships || [];
                const floorHint = getCurrentFloorHint();
                store.json.facts = mergeCharacterRelationshipsIntoFacts(store.json.facts, rels, floorHint);
            }
            store.updatedAt = Date.now();
            saveSummaryStore();

            // 同步 L2 检索索引（事件新增、编辑、删除）
            if (data.section === "events" && oldEvents) {
                syncEventVectorsOnEdit(oldEvents, data.data);
            }
            break;
        }

        case "TOGGLE_HIDE_SUMMARIZED": {
            setHideUiSettings({ hideSummarized: !!data.enabled });

            (async () => {
                if (data.enabled) {
                    await applyHideState();
                } else {
                    await clearHideState();
                }
            })();
            break;
        }

        case "UPDATE_KEEP_VISIBLE": {
            const oldCount = getHideUiSettings().keepVisibleCount;
            const parsedCount = Number.parseInt(data.count, 10);
            const newCount = Number.isFinite(parsedCount) ? Math.max(0, Math.min(50, parsedCount)) : 6;
            if (newCount === oldCount) break;

            setHideUiSettings({ keepVisibleCount: newCount });

            (async () => {
                if (getHideUiSettings().hideSummarized) {
                    await applyHideState();
                }
                const { chat } = getContext();
                const store = getSummaryStore();
                await sendFrameBaseData(store, Array.isArray(chat) ? chat.length : 0);
            })();
            break;
        }

        case "TOGGLE_USE_VECTOR_BOUNDARY": {
            setHideUiSettings({ useVectorBoundary: data.enabled !== false });

            (async () => {
                if (getHideUiSettings().hideSummarized) {
                    await applyHideState({ reset: true });
                }
                const { chat } = getContext();
                const store = getSummaryStore();
                await sendFrameBaseData(store, Array.isArray(chat) ? chat.length : 0);
            })();
            break;
        }

        case "SAVE_PANEL_CONFIG":
            if (data.config) {
                try {
                    const vectorChanged = Boolean(
                        data.config.vector
                        && JSON.stringify(getVectorConfig() || {}) !== JSON.stringify(data.config.vector || {})
                    );
                    let previousVectorConfig = getVectorConfig();
                    let savedConfig;
                    if (vectorChanged) {
                        const transition = await changeVectorConfig(
                            'panel-save',
                            () => saveSummaryPanelConfigVerified(data.config),
                        );
                        previousVectorConfig = transition?.previousVectorConfig || previousVectorConfig;
                        savedConfig = transition?.result || getSummaryPanelConfig();
                    } else {
                        savedConfig = await saveSummaryPanelConfigVerified(data.config);
                    }
                    const nextVectorConfig = savedConfig?.vector || {};
                    const vectorEnabledChanged = !!previousVectorConfig?.enabled !== !!nextVectorConfig?.enabled;
                    const vectorFingerprintChanged = !!previousVectorConfig?.enabled
                        && !!nextVectorConfig?.enabled
                        && getEngineFingerprint(previousVectorConfig) !== getEngineFingerprint(nextVectorConfig);
                    if (!vectorEnabledChanged && !vectorFingerprintChanged) {
                        logRecallRuntimeCheckpoint("savePanelConfig:warm-runtime", `chat=${getContext().chatId || "-"} invalidated=0`);
                        warmupActiveVectorCache();
                    }
                    postToFrame({
                        type: "PANEL_CONFIG_SAVE_RESULT",
                        success: true,
                        requestId: data.requestId || "",
                        config: savedConfig,
                    });
                    sendVectorConfigToFrame();
                    const hideUi = getHideUiSettings();
                    if (hideUi.hideSummarized && hideUi.useVectorBoundary && vectorEnabledChanged) {
                        await applyHideState({ reset: !!previousVectorConfig?.enabled });
                    }
                    {
                        const { chat } = getContext();
                        const store = getSummaryStore();
                        await sendFrameBaseData(store, Array.isArray(chat) ? chat.length : 0);
                    }
                } catch (e) {
                    xbLog.error(MODULE_ID, "保存面板配置失败", e);
                    postToFrame({
                        type: "PANEL_CONFIG_SAVE_RESULT",
                        success: false,
                        requestId: data.requestId || "",
                        error: e?.message || "保存失败",
                    });
                }
            }
            break;

        case "REQUEST_PANEL_CONFIG":
            sendSavedConfigToFrame();
            break;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 手动总结
// ═══════════════════════════════════════════════════════════════════════════

async function handleManualGenerate(mesId, config) {
    if (isSummaryGenerating()) {
        postToFrame({ type: "SUMMARY_STATUS", statusText: "上一轮总结仍在进行中..." });
        return;
    }

    const release = guard.acquire('summary');
    if (!release) return;
    const execution = beginSummaryExecution();
    if (!execution) {
        release();
        return;
    }
    notifySummaryState();

    try {
        const result = await runSummaryGeneration(mesId, config, {
            onStatus: (text) => postToFrame({ type: "SUMMARY_STATUS", statusText: text }),
            onError: (msg) => postToFrame({ type: "SUMMARY_ERROR", message: msg }),
            onComplete: async ({ newEventIds, aliasChanged, store }) => {
                assertSummaryExecutionActive(execution);
                postToFrame({ type: "SUMMARY_FULL_DATA", payload: buildFramePayload(store) });

                // Incrementally add new events to the lexical index
                if (aliasChanged) {
                    invalidateLexicalIndex();
                    refreshEntityLexiconAndWarmup();
                    scheduleLexicalWarmup();
                } else if (newEventIds?.length) {
                    const allEvents = store?.json?.events || [];
                    const idSet = new Set(newEventIds);
                    addEventDocuments(allEvents.filter(e => idSet.has(e.id)));
                }

                applyHideStateDebounced();
                await updateFrameStatsAfterSummary(store, execution);

                await autoVectorizeMissingEvents(store, execution);
                await rebuildActiveVectorCacheAfterSummary(execution);
            },
        }, {
            signal: execution.controller.signal,
            targetChatId: execution.chatId,
        });
        if (result.committed && isStorySummaryConsumableForCurrentChat()) {
            scheduleVectorIntegrityCheck();
        }
    } finally {
        finishSummaryExecution(execution);
        release();
        notifySummaryState();
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 消息事件
// ═══════════════════════════════════════════════════════════════════════════

async function handleChatChanged(scheduledChatId = getContext()?.chatId || '') {
    if (!events) return;
    if (isChatStale(scheduledChatId)) return;
    clearDeferredBackgroundTasks();
    lastRecallLogText = "";
    await waitForVectorWrites();
    if (isChatStale(scheduledChatId)) return;
    const { chat } = getContext();
    activeChatId = getContext().chatId || null;
    notifyStorySummaryChatState();
    initButtonsForAll();

    if (!isStorySummaryEnabledForCurrentChat()) {
        await deactivateCurrentChatStorySummary();
        notifyStorySummaryChatState();
        return;
    }

    logRecallRuntimeCheckpoint("chatChanged:before-retain", `chat=${activeChatId || "-"} length=${Array.isArray(chat) ? chat.length : 0}`);
    await retainRecallRuntimeOnly(activeChatId);
    if (isChatStale(scheduledChatId)) return;
    const newLength = Array.isArray(chat) ? chat.length : 0;

    const rollback = await runVectorWriteTask(
        {
            chatId: scheduledChatId,
            kind: 'chat-change-rollback',
            scope: VECTOR_WRITE_SCOPES.CONSISTENCY,
        },
        async () => {
            if (isChatStale(scheduledChatId)) return { status: 'stale' };
            const result = await rollbackSummaryIfNeeded();
            if (result.status !== 'failed' && !isChatStale(scheduledChatId)) {
                await reconcileVectorFloorsOnLoad(scheduledChatId, newLength);
            }
            return result;
        },
    );
    if (isChatStale(scheduledChatId)) return;
    if (!rollback) return;
    if (rollback.status === 'failed') {
        await deactivateCurrentChatStorySummary();
        notifyStorySummaryChatState();
        await executeSlashCommand('/echo severity=error 剧情总结无法安全回滚，已停止使用旧总结；请导出当前总结，修正后重新导入，或清空总结数据');
        return;
    }

    const store = getSummaryStore();

    if (getHideUiSettings().hideSummarized) {
        await applyHideState({ reset: false });
    }

    if (frameReady) {
        await sendFrameBaseData(store, newLength);
        sendFrameFullData(store, newLength);

        sendAnchorStatsToFrame();
        sendVectorStatsToFrame();
    }

    // 实体词典注入 + 索引预热
    refreshEntityLexiconAndWarmup();

    // Full lexical index rebuild on chat change
    invalidateLexicalIndex();
    scheduleLexicalWarmup(CHAT_CHANGE_LEXICAL_WARMUP_MS);

    // Embedding 连接预热（保持 TCP keep-alive，减少首次召回超时）
    warmupEmbeddingConnection();
    warmupActiveVectorCache();
    logRecallRuntimeCheckpoint("chatChanged:after-warm-request", `chat=${activeChatId || "-"}`);

    scheduleVectorIntegrityCheck();
    notifyStorySummaryChatState();
}

/**
 * 把派生数据与实际聊天长度对齐：丢弃 floor >= newLength 的 L1 chunk、L0 atom、
 * L0 索引与状态向量。纯粹由聊天长度推导，幂等。
 */
async function truncateVectorDataFromFloor(chatId, newLength) {
    if (!chatId || !(newLength >= 0)) return;
    await syncOnMessageDeleted(chatId, newLength);
    deleteStateAtomsFromFloor(newLength);
    deleteL0IndexFromFloor(newLength);
    await deleteStateVectorsFromFloor(chatId, newLength);
}

/**
 * 加载时兜底对账。删除同步现在跑在宿主等待链里，正常不会漏；这里只覆盖
 * 宿主崩溃、功能关闭期间被清空、第三方直接 emit 等遗留的越界派生数据。
 *
 * chatLength 为 0 同样要处理：ST 的四个 CHAT_CHANGED 都在 getChat()/printMessages()
 * 之后 emit，此刻长度 0 就是"聊天真的空了"，不存在"尚未载入"的中间态。
 * 先用 lastChunkFloor 与内存中的 atom 楼层做廉价判定，没有越界就不碰 DB。
 */
async function reconcileVectorFloorsOnLoad(chatId, chatLength) {
    if (!chatId || !(chatLength >= 0)) return false;
    const meta = await getMeta(chatId);
    const overflowChunks = (meta?.lastChunkFloor ?? -1) >= chatLength;
    const overflowAtoms = getStateAtoms().some((atom) => Number(atom?.floor) >= chatLength);
    // L0Index 必须单独看：status=empty/fail 的楼层没有 atom，getStateAtoms 查不出来。
    // 留着的话，以后复用同一楼层时会被 tryQueueFloor 当作已处理直接跳过。
    // chatLength 为 0 时这三条合起来就是"存在任何派生数据"，无需另开特例。
    const overflowIndex = Object.keys(getL0Index()?.byFloor || {})
        .some((key) => Number(key) >= chatLength);
    if (!overflowChunks && !overflowAtoms && !overflowIndex) return false;

    xbLog.warn(MODULE_ID, `加载对账：丢弃 floor >= ${chatLength} 的派生数据 chat=${chatId}`);
    await truncateVectorDataFromFloor(chatId, chatLength);
    return true;
}

async function handleMessageDeletedNow(scheduledChatId) {
    if (!isStorySummaryEnabledForCurrentChat()) return null;
    if (isChatStale(scheduledChatId)) return null;
    const { chat, chatId } = getContext();
    const newLength = chat?.length || 0;

    // 产品边界：只保证“删除末尾”或“从某层向后删除”的一致性。ST 编辑器中的
    // 单条中间删除会重排后续 mesId，但 MESSAGE_DELETED 只提供新长度；该低频操作不在支持范围。
    const rollback = await rollbackSummaryIfNeeded();
    // 回滚失败也要裁掉越界派生数据，否则 L0/L1 会一直指向已删楼层。
    await truncateVectorDataFromFloor(chatId, newLength);

    invalidateLexicalIndex();
    scheduleLexicalWarmup();
    await sendAnchorStatsToFrame();
    await sendVectorStatsToFrame();
    return rollback;
}

async function handleMessageDeleted(scheduledChatId) {
    const rollback = await runVectorWriteTask(
        {
            chatId: scheduledChatId,
            kind: 'message-delete-sync',
            scope: VECTOR_WRITE_SCOPES.CONSISTENCY,
        },
        () => handleMessageDeletedNow(scheduledChatId),
    );
    if (!rollback) return;
    // deactivate 内部会 waitForVectorWrites，必须留在写任务之外，否则自等死锁。
    if (rollback.status === 'failed') {
        await deactivateCurrentChatStorySummary();
        notifyStorySummaryChatState();
        await executeSlashCommand('/echo severity=error 剧情总结无法安全回滚，已停止使用旧总结；请导出当前总结，修正后重新导入，或清空总结数据');
        return;
    }
    applyHideStateDebounced({ reset: rollback.status === 'rolled_back' });
    notifyStorySummaryChatState();
}

async function handleMessageSwipedNow(scheduledChatId) {
    if (!isStorySummaryEnabledForCurrentChat()) return;
    if (isChatStale(scheduledChatId)) return;
    const { chat, chatId } = getContext();
    const lastFloor = (chat?.length || 1) - 1;

    await syncOnMessageSwiped(chatId, lastFloor);

    // L0 同步：清理 swipe 前该楼的 atoms / index / vectors
    deleteStateAtomsFromFloor(lastFloor);
    deleteL0IndexFromFloor(lastFloor);
    if (chatId) {
        await deleteStateVectorsFromFloor(chatId, lastFloor);
    }

    removeDocumentsByFloor(lastFloor);

    initButtonsForAll();
    applyHideStateDebounced();
    await sendAnchorStatsToFrame();
    await sendVectorStatsToFrame();
}

async function handleMessageSwiped(scheduledChatId) {
    return runVectorWriteTask(
        {
            chatId: scheduledChatId,
            kind: 'message-swipe-sync',
            scope: VECTOR_WRITE_SCOPES.CONSISTENCY,
        },
        () => handleMessageSwipedNow(scheduledChatId),
    );
}

async function handleMessageReceived(scheduledChatId, targetMesId = null) {
    if (!isStorySummaryConsumableForCurrentChat()) return;
    if (isChatStale(scheduledChatId)) return;
    const { chat, chatId } = getContext();
    const lastFloor = (chat?.length || 1) - 1;
    const floor = Number.isFinite(targetMesId) ? Number(targetMesId) : lastFloor;
    if (floor < 0 || floor > lastFloor) return;
    const message = chat?.[floor];
    if (!message || message.is_user) return;
    const vectorConfig = getVectorConfig();

    initButtonsForAll();

    applyHideStateDebounced();
    scheduleAutoSummary("after_ai");

    // Refresh entity lexicon after new message (new roles may appear)
    refreshEntityLexiconAndWarmup();

    if (vectorConfig?.enabled) {
        rememberVectorMaintenance(chatId, floor, 'after_ai');
        scheduleAutoL0Backfill(AUTO_L0_BACKFILL_DELAY_MS, chatId);
    }
}

function handleMessageSent(scheduledChatId) {
    if (isChatStale(scheduledChatId)) return;
    initButtonForLatestMessage();
    if (!isStorySummaryConsumableForCurrentChat()) return;
    scheduleAutoSummary("before_user");
}

/**
 * 正文被编辑。产品上将已总结楼层的编辑视为局部修正，不按 editedFloor 自动回滚 L2；
 * 若是改写剧情，由用户显式回滚总结后重新生成。rollbackSummaryIfNeeded 只处理先前已存在的长度越界。
 * 精确依赖原文的派生数据仍必须作废：
 * L0/L1 都是按旧文本算的，而等长编辑既不触发长度对账，L1 缺口不足告警阈值时
 * 完整性检查也发现不了 —— 不主动失效就会永久用着错文本的向量。
 * 失效范围只能到"受影响楼层"这个粒度：L1 靠 lastChunkFloor 单调推进，无法只补中间一层。
 */
async function handleMessageUpdated(scheduledChatId, messageId) {
    if (!isStorySummaryEnabledForCurrentChat()) return;
    if (isChatStale(scheduledChatId)) return;
    const parsedFloor = Number(messageId);
    const editedFloor = Number.isInteger(parsedFloor) && parsedFloor >= 0 ? parsedFloor : null;
    if (editedFloor === null) {
        xbLog.warn(MODULE_ID, `正文编辑事件缺少可用楼层号(${messageId})，跳过派生数据失效`);
    }
    const rollback = await runVectorWriteTask(
        {
            chatId: scheduledChatId,
            kind: 'message-update-rollback',
            scope: VECTOR_WRITE_SCOPES.CONSISTENCY,
        },
        async () => {
            if (isChatStale(scheduledChatId)) return { status: 'stale' };
            const result = await rollbackSummaryIfNeeded();
            // 回滚成功与否都要作废：旧文本的向量留着比缺失更糟。
            if (editedFloor !== null && !isChatStale(scheduledChatId)) {
                await truncateVectorDataFromFloor(scheduledChatId, editedFloor);
            }
            return result;
        },
    );
    if (isChatStale(scheduledChatId)) return;
    if (!rollback) return;
    if (rollback.status === 'failed') {
        await deactivateCurrentChatStorySummary();
        notifyStorySummaryChatState();
        await executeSlashCommand('/echo severity=error 剧情总结无法安全回滚，已停止使用旧总结；请导出当前总结，修正后重新导入，或清空总结数据');
        return;
    }
    if (editedFloor !== null) {
        invalidateLexicalIndex();
        scheduleLexicalWarmup();
        rememberVectorMaintenance(scheduledChatId, editedFloor, 'message_edited');
        scheduleAutoL0Backfill(AUTO_L0_BACKFILL_DELAY_MS, scheduledChatId);
    }
    initButtonsForAll();
    applyHideStateDebounced({ reset: false });
    notifyStorySummaryChatState();
}

function handleMessageRendered(data) {
    if (!getSettings().storySummary?.enabled) return;
    const mesId = data?.element ? $(data.element).attr("mesid") : data?.messageId;
    if (mesId != null) addSummaryBtnToMessage(mesId);
    else initButtonsForAll();
}

function clearExtensionPrompt() {
    delete extension_prompts[EXT_PROMPT_KEY];
}

// ═══════════════════════════════════════════════════════════════════════════
// Prompt 注入
// ═══════════════════════════════════════════════════════════════════════════

// 整轮硬截止：召回在宿主 generate_interceptor 的 await 内执行，必须有兜底，
// 不能把宿主发送流程无限卡住。30s 为初始护栏值，进入浏览器 E2E 后需结合
// 真实 p50/p95 与首 token 体感校准。
const STORY_SUMMARY_RECALL_DEADLINE_MS = 30000;
const SLOW_RECALL_NOTICE_DELAY_MS = 3000;
const RECALL_WARNING_COOLDOWN_MS = 10000;
const RECALL_REASONS_THAT_ABORT_GENERATION = new Set([
    'chat-changed',
    'disabled',
    'generation-stopped',
    'superseded',
    'unregistered',
]);

const recallPrefetch = createRecallPrefetchCoordinator({
    getContext,
    prepare: (type, signal) => prepareMemoryPrompt(type, signal),
    pollMs: 16,
    maxAgeMs: STORY_SUMMARY_RECALL_DEADLINE_MS,
});

function cancelActiveRecall(reason = 'cancelled', options = {}) {
    return recallPrefetch.cancel(reason, {
        abortDispatch: RECALL_REASONS_THAT_ABORT_GENERATION.has(reason),
        ...options,
    });
}

function cancelRecallAndClearPrompt(reason) {
    cancelActiveRecall(reason);
    clearExtensionPrompt();
}

/**
 * Prepare one memory prompt without publishing any observable result. This is
 * safe to start immediately after the host pushes the real USER object while
 * save/render continue in parallel.
 */
async function prepareMemoryPrompt(type, signal) {
    const T0 = performance.now();
    let preparedChatId = null;
    const timing = {
        tokenizer: 0,
        boundary: 0,
        buildPrompt: 0,
    };
    const finish = (reason, result = {}) => {
        const total = Math.round(performance.now() - T0);
        xbLog.info(
            MODULE_ID,
            `Prompt prepare timing: type=${type || 'unknown'} reason=${reason} total=${total}ms `
            + `tokenizer=${timing.tokenizer}ms boundary=${timing.boundary}ms `
            + `build=${timing.buildPrompt}ms`
        );
        return {
            text: '',
            logText: '',
            notice: null,
            publishRecallLog: false,
            chatId: preparedChatId,
            depth: null,
            role: null,
            timing: { ...timing, total },
            skipReason: reason,
            ...result,
        };
    };

    if (signal?.aborted) return finish('aborted_before_prepare');

    const excludeLastAi = type === "swipe" || type === "regenerate";
    const vectorCfg = getVectorConfig();

    // ★ 最后一道关卡：向量启用时，同步等待分词器就绪
    if (vectorCfg?.enabled && !isTokenizerReady()) {
        const T_Tokenizer = performance.now();
        try {
            await preloadTokenizer();
        } catch (e) {
            xbLog.warn(MODULE_ID, "生成前分词器预热失败，将使用降级分词", e);
        } finally {
            timing.tokenizer = Math.round(performance.now() - T_Tokenizer);
        }
    }
    if (signal?.aborted) return finish('aborted_after_tokenizer');

    const { chat, chatId } = getContext();
    preparedChatId = chatId || null;
    const chatLen = Array.isArray(chat) ? chat.length : 0;
    if (chatLen === 0) {
        return finish('empty_chat');
    }

    const store = getSummaryStore();

    // 确定注入边界
    // - 向量开：meta.lastChunkFloor（若无则回退 lastSummarizedMesId）
    // - 向量关：lastSummarizedMesId
    let boundary = -1;
    const T_Boundary = performance.now();
    if (vectorCfg?.enabled) {
        const meta = chatId ? await getMeta(chatId) : null;
        if (signal?.aborted) return finish('aborted_after_boundary_read');
        boundary = meta?.lastChunkFloor ?? -1;
        if (boundary < 0) boundary = store?.lastSummarizedMesId ?? -1;
    } else {
        boundary = store?.lastSummarizedMesId ?? -1;
    }
    // A restored/imported canonical summary has no floor vectors yet; inject it directly
    // until the next successful summary establishes a real floor boundary.
    const usePendingCanonicalSummary = boundary < 0 && store?.pendingImportBoundary && store?.json;
    if (usePendingCanonicalSummary) {
        boundary = chatLen - 1;
    }
    timing.boundary = Math.round(performance.now() - T_Boundary);
    if (boundary < 0) {
        return finish('no_boundary');
    }

    // 计算深度：倒序插入，从末尾往前数
    // 最小为 MIN_INJECTION_DEPTH，避免插入太靠近底部
    const depth = Math.max(MIN_INJECTION_DEPTH, chatLen - boundary - 1);
    if (depth < 0) {
        return finish('invalid_depth');
    }

    // 构建注入文本
    let text = "";
    let logText = '';
    let notice = null;
    let publishRecallLog = false;
    const T_BuildPrompt = performance.now();
    if (vectorCfg?.enabled && !usePendingCanonicalSummary) {
        const r = await buildVectorPromptText(excludeLastAi, {
            signal,
        });
        if (signal?.aborted) {
            return finish('aborted_after_build');
        }
        text = r?.text || "";
        logText = String(r?.logText || "");
        notice = r?.notice || null;
        publishRecallLog = true;
    } else {
        text = buildNonVectorPromptText() || "";
    }
    timing.buildPrompt = Math.round(performance.now() - T_BuildPrompt);

    // 获取用户配置的 role
    const cfg = getSummaryPanelConfig();
    const roleKey = cfg.trigger?.role || 'system';
    const role = ROLE_MAP[roleKey] || extension_prompt_roles.SYSTEM;

    return finish(text.trim() ? 'prepared' : 'empty_prompt', {
        text,
        logText,
        notice,
        publishRecallLog,
        depth,
        role,
    });
}

/**
 * Publish a prepared result. The generate interceptor is the sole caller, so a
 * prefetched run can never write a Prompt or warning before it is joined.
 */
async function commitMemoryPrompt(prepared, signal) {
    const isCurrent = () => {
        const currentChatId = getContext()?.chatId;
        return !!prepared
            && !signal?.aborted
            && String(prepared.chatId || '') === String(currentChatId || '')
            && isStorySummaryConsumableForCurrentChat();
    };
    if (!isCurrent()) return;

    const committedLog = commitIfSignalActive(signal, () => {
        if (prepared.publishRecallLog) {
            postToFrame({ type: 'RECALL_LOG', text: String(prepared.logText || '') });
        } else {
            lastRecallLogText = '';
        }
    });
    if (!committedLog) return;

    const { chatId } = getContext();
    if (
        prepared.notice?.message
        && claimWarningCooldown(
            'recall',
            chatId,
            prepared.notice.issueCode || 'recall_notice',
            RECALL_WARNING_COOLDOWN_MS,
        )
    ) {
        try {
            await executeSlashCommand(`/echo severity=warning ${prepared.notice.message}`);
        } catch (error) {
            xbLog.warn(MODULE_ID, '显示剧情记忆召回提示失败', error);
        }
    }

    if (!isCurrent() || !String(prepared.text || '').trim()) return;

    const T_WritePrompt = performance.now();
    const committedPrompt = commitIfSignalActive(signal, () => {
        extension_prompts[EXT_PROMPT_KEY] = {
            value: prepared.text,
            position: extension_prompt_types.IN_CHAT,
            depth: prepared.depth,
            role: prepared.role,
        };
    });
    if (!committedPrompt) return;

    xbLog.info(
        MODULE_ID,
        `Prompt commit timing: write=${Math.round(performance.now() - T_WritePrompt)}ms`,
    );
    return { text: prepared.text, recallLogText: lastRecallLogText };
}

// generate_interceptor 消费者：宿主在用户消息入楼渲染后、Prompt 组装前 await。
// 旧实现曾在过早的宿主事件中靠输入框缓存猜测焦点；现在直接读取真实 chat，
// 普通发送以最后一条用户消息为焦点。
async function runStorySummaryRecallInterceptor(_interceptorChat, _contextSize, _abort, type, runContext) {
    // 旧 Prompt 只在宿主真正走到 Prompt 组装前清理；提前召回不碰它。
    clearExtensionPrompt();
    if (!isStorySummaryConsumableForCurrentChat()) {
        cancelActiveRecall('disabled');
        return;
    }

    const { chat, chatId } = getContext();
    const normalizedType = type || 'normal';
    const lastMessage = Array.isArray(chat) ? chat.at(-1) : null;
    const focusRef = normalizedType === 'normal' && lastMessage?.is_user === true
        ? lastMessage
        : null;
    const { slot: run, path, remainingMs } = recallPrefetch.join({
        chatId,
        type: normalizedType,
        focusRef,
        runContext,
    });
    const waitStartedAt = performance.now();
    let joinStatus = 'pending';
    const cancelSlowNotice = scheduleDelayedNotice(
        () => executeSlashCommand('/echo severity=info 剧情记忆召回仍在处理中，请稍候。'),
        SLOW_RECALL_NOTICE_DELAY_MS,
        error => xbLog.warn(MODULE_ID, '显示剧情记忆召回状态失败', error),
    );
    try {
        const outcome = await runWithAbortDeadline(
            () => run.outcome,
            {
                controller: run.controller,
                timeoutMs: remainingMs,
                timeoutMessage: 'Story Summary recall deadline exceeded',
            },
        );
        if (!outcome?.ok) throw outcome?.error || new Error('Story Summary recall produced no outcome');

        const recallResult = await commitMemoryPrompt(outcome.value, run.controller.signal);
        joinStatus = String(recallResult?.text || '').trim() ? 'committed' : 'empty';
        if (String(recallResult?.text || '').trim()) {
            return selectBestStoryMemoryResult(recallResult);
        }
        return selectBestStoryMemoryResult(recallResult, getStorySummaryForEna());
    } catch (error) {
        // 截止或失败时 fail-open。显式取消的调用方已经清理 Prompt；旧任务
        // 不能在这里清掉替代它的新任务结果。后台残余任务也受最终写入闸门保护。
        if (run.cancelReason && run.cancelReason !== 'prefetch-timeout') {
            joinStatus = `cancelled:${run.cancelReason}`;
            xbLog.info(MODULE_ID, `召回已取消：${run.cancelReason}`);
        } else {
            joinStatus = 'failed';
            clearExtensionPrompt();
            const failureLog = `\n[Vector Recall Failed]\n${String(error?.stack || error?.message || error)}\n`;
            postToFrame({ type: 'RECALL_LOG', text: failureLog });
            xbLog.warn(MODULE_ID,
                `召回失败或达到 ${STORY_SUMMARY_RECALL_DEADLINE_MS}ms 硬截止，本轮跳过记忆注入`,
                error
            );
            const timedOut = run.cancelReason === 'prefetch-timeout' || run.controller.signal.aborted;
            const embeddingFailed = error?.code === 'RECALL_EMBEDDING_FAILED'
                || error?.code === 'RECALL_EMBEDDING_INVALID_RESPONSE';
            const issueCode = timedOut
                ? 'recall_timeout'
                : (embeddingFailed ? 'recall_embedding_failed' : 'recall_failed');
            const notice = timedOut
                ? '剧情记忆召回超过 30 秒，本轮已跳过。请检查嵌入 API、重排 API、网络和向量设置后重试。'
                : (embeddingFailed
                    ? '剧情记忆嵌入请求失败，本轮已跳过。请检查嵌入 API、网络和向量设置后重试。'
                    : '剧情记忆召回失败，本轮已跳过。请检查嵌入 API、重排 API、网络和向量设置后重试。');
            const { chatId } = getContext();
            if (claimWarningCooldown('recall', chatId, issueCode, RECALL_WARNING_COOLDOWN_MS)) {
                try {
                    await executeSlashCommand(`/echo severity=warning ${notice}`);
                } catch (noticeError) {
                    xbLog.warn(MODULE_ID, '显示剧情记忆召回失败提示失败', noticeError);
                }
            }
        }
        if (!runContext?.signal?.aborted) {
            return selectBestStoryMemoryResult(undefined, getStorySummaryForEna());
        }
    } finally {
        cancelSlowNotice();
        xbLog.info(
            MODULE_ID,
            `Recall join: path=${path} status=${joinStatus} `
            + `lead=${Math.max(0, Math.round((run.joinedAt || 0) - (run.computeStartedAt || run.joinedAt || 0)))}ms `
            + `wait=${Math.round(performance.now() - waitStartedAt)}ms`,
        );
        recallPrefetch.finish(run);
    }
}

function handleGenerationAfterCommands(type, params, isDryRun) {
    // Prompt Manager 的 dry-run 只组装预览，不能作废正在进行的真实生成。
    const action = getRecallPrefetchStartAction(type, params, isDryRun);
    if (action === 'ignore') return;

    // 新 Generate 只作废旧计算，不碰上一轮 Prompt；Prompt 的唯一清理点
    // 仍是上面的 generate interceptor。
    cancelActiveRecall('superseded');

    const normalizedType = type || 'normal';
    if (action !== 'watch') return;
    if (!isStorySummaryConsumableForCurrentChat() || !getVectorConfig()?.enabled) return;

    const { chatId, chat } = getContext();
    if (!chatId || !Array.isArray(chat)) return;
    recallPrefetch.startWatching({
        chatId,
        type: normalizedType,
        initialLength: chat.length,
        signal: params?.signal || null,
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 事件注册
// ═══════════════════════════════════════════════════════════════════════════

function scheduleWithChatGuard(fn, delay = 0, ...args) {
    const scheduledChatId = getContext().chatId;
    setTimeout(() => fn(scheduledChatId, ...args), delay);
}

/**
 * 正文变更事件（删除 / swipe / 编辑）：把一致性任务的 Promise 直接交回宿主。
 *
 * SillyTavern 用 `await eventSource.emit(...)` 派发这些事件，EventCenter 也会
 * 原样返回 handler 的返回值，所以宿主会等我们同步完再往下走 —— 聊天切换不可能
 * 插进来，任务内的 isChatStale 也就不会再静默跳过。原来的 setTimeout 主动脱离了
 * 这条等待链，才需要事后补偿。
 *
 * 先取消在飞的 embedding：正文已经变了，它正在处理的是失效文本；顺带避免宿主
 * 卡在长 embedding 队列后面。被取消的延迟维护由 retryVectorMaintenanceAfterCancel
 * 重排，不会丢活。
 */
function runContentChangeSync(handler, ...args) {
    const chatId = getContext()?.chatId || null;
    if (!chatId || !isStorySummaryEnabledForCurrentChat()) return undefined;
    cancelEmbeddingWriteTasks('Chat content changed');
    return handler(chatId, ...args).catch((error) => {
        xbLog.error(MODULE_ID, "正文变更同步失败", error);
    });
}

function isChatStale(scheduledChatId) {
    if (!scheduledChatId || scheduledChatId !== activeChatId) return true;
    const { chatId } = getContext();
    return chatId !== scheduledChatId;
}

function notifyStorySummaryAfterAi(data, source) {
    if (!isStorySummaryEnabledForCurrentChat()) return;
    const { chatId, chat } = getContext();
    if (!chatId || !Array.isArray(chat) || !chat.length) return;

    const messageId = source === "generation_ended"
        ? (chat.length - 1)
        : (typeof data === "number" ? data : data?.messageId ?? data?.mesId ?? (chat.length - 1));
    if (!Number.isFinite(messageId) || messageId < 0) return;

    const message = chat[messageId];
    if (!message || message.is_user) return;

    notifyAfterAiHint({
        chatId,
        messageId,
        source,
        kind: MODULE_ID,
    });
}

function registerAfterAiGateHandler() {
    initAfterAiGate();
    if (afterAiGateDispose) return;
    afterAiGateDispose = registerAfterAiHandler(MODULE_ID, async ({ chatId, messageId }) => {
        if (!isStorySummaryEnabledForCurrentChat()) return;
        if (activeChatId !== chatId) return;
        scheduleWithChatGuard(handleMessageReceived, 0, messageId);
    });
}

/**
 * 进行中的卸载。register 必须等它彻底结束：否则快速关开时
 * resumeVectorWriteCoordinator 会先放开写入，随后旧 teardown 的
 * shutdownRecallRuntime 又把新会话刚建立的 Runtime 关掉。
 */
let storySummaryTeardown = null;

async function registerEvents() {
    if (storySummaryTeardown) await storySummaryTeardown;
    if (events) return;
    resumeVectorWriteCoordinator();
    window.registerModuleCleanup?.(MODULE_ID, unregisterEvents);
    events = createModuleEvents(MODULE_ID);
    activeChatId = getContext().chatId || null;
    registerAfterAiGateHandler();

    CacheRegistry.register(MODULE_ID, {
        name: "剧情总结运行缓存",
        getSize: () => {
            const vectorStats = getRecallRuntimeStats();
            const vectorItems = vectorStats.reduce((sum, item) => (
                sum
                + Number(item.chunks || 0)
                + Number(item.chunkVectors || 0)
                + Number(item.eventVectors || 0)
                + Number(item.stateVectors || 0)
            ), 0);
            return pendingFrameMessages.length + vectorItems;
        },
        getBytes: () => {
            try {
                return JSON.stringify({
                    pendingFrameMessages,
                    lastRecallLogText,
                    recallRuntime: getRecallRuntimeStats(),
                }).length * 2;
            } catch {
                return 0;
            }
        },
        getDetail: () => ({
            activeChatId,
            pendingFrameMessages: pendingFrameMessages.length,
            hasRecallLog: Boolean(lastRecallLogText),
            recallRuntime: getRecallRuntimeStats(),
        }),
        clear: () => {
            pendingFrameMessages = [];
            lastRecallLogText = "";
            invalidateLexicalIndex();
            clearRecallRuntime().catch(() => {});
        },
    });

    initButtonsForAll();

    events.on(event_types.CHAT_CHANGED, () => {
        cancelRecallAndClearPrompt('chat-changed');
        cancelActiveSummaryExecution();
        cancelEmbeddingWriteTasks('Chat changed');
        cancelHideApplyTimer();
        activeChatId = getContext().chatId || null;
        scheduleWithChatGuard(handleChatChanged, 80);
    });
    events.on(event_types.MESSAGE_DELETED, () => runContentChangeSync(handleMessageDeleted));
    events.on(event_types.MESSAGE_RECEIVED, (data) => notifyStorySummaryAfterAi(data, "message_received"));
    events.on(event_types.MESSAGE_SENT, () => scheduleWithChatGuard(handleMessageSent, 150));
    events.on(event_types.MESSAGE_SWIPED, () => runContentChangeSync(handleMessageSwiped));
    // 只绑 MESSAGE_EDITED。宿主真实编辑（script.js messageEditDone、/messageupdate 等）
    // 一定先发 MESSAGE_EDITED 再发 MESSAGE_UPDATED；而"打开编辑器又取消"只发 MESSAGE_UPDATED
    // （script.js closeMessageEditor）。绑 MESSAGE_UPDATED 会让取消编辑也裁掉后续 L0/L1。
    events.on(event_types.MESSAGE_EDITED, (messageId) => runContentChangeSync(handleMessageUpdated, messageId));
    events.on(event_types.USER_MESSAGE_RENDERED, (data) => setTimeout(() => handleMessageRendered(data), 50));
    events.on(event_types.CHARACTER_MESSAGE_RENDERED, (data) => {
        notifyStorySummaryAfterAi(data, "character_message_rendered");
        setTimeout(() => handleMessageRendered(data), 50);
    });

    // 用户输入捕获已删除：普通发送的焦点直接来自已入楼的用户消息
    document.addEventListener("visibilitychange", handleVisibilityChangeForBackground);
    window.addEventListener("resize", handleViewportChangeForBackground, { passive: true });
    window.visualViewport?.addEventListener?.("resize", handleViewportChangeForBackground, { passive: true });
    window.visualViewport?.addEventListener?.("scroll", handleViewportChangeForBackground, { passive: true });

    // 普通发送在命令处理后开始等待真实 USER 对象入 chat；监听器同步返回，
    // 不阻塞宿主后续 push / save / render。
    events.on(event_types.GENERATION_AFTER_COMMANDS, handleGenerationAfterCommands);

    // 注入链路：interceptor 时点不变，只等待提前召回的剩余时间并提交 Prompt。
    registerGenerateInterceptor(
        'story-summary',
        runStorySummaryRecallInterceptor,
        GENERATE_INTERCEPTOR_ORDER.STORY_SUMMARY,
    );
    events.on(event_types.GENERATION_STOPPED, () => {
        const { chatId } = getContext();
        cancelActiveRecall('generation-stopped', {
            retainForJoin: true,
            chatId,
            // STOPPED 不携带生成类型；空槽用 null 表示仅匹配本聊天的下一次认领。
            type: null,
        });
        clearExtensionPrompt();
    });
    events.on(event_types.GENERATION_ENDED, (data) => {
        notifyStorySummaryAfterAi(data, "generation_ended");
        // stopGeneration() 会先触发 ENDED、再触发 STOPPED。这里不能销毁
        // 本轮身份，否则保存完成后到达的 interceptor 会重新 fallback 召回。
        clearExtensionPrompt();
    });

    // 聊天删除时清理对应的服务器向量备份
    events.on(event_types.CHAT_DELETED, handleChatDeleted);
    events.on(event_types.GROUP_CHAT_DELETED, handleChatDeleted);
}

async function unregisterEvents() {
    if (storySummaryTeardown) return storySummaryTeardown;
    storySummaryTeardown = runStorySummaryTeardown();
    try {
        await storySummaryTeardown;
    } finally {
        storySummaryTeardown = null;
    }
}

async function runStorySummaryTeardown() {
    cancelActiveSummaryExecution();
    cancelRecallAndClearPrompt('unregistered');
    invalidateLexicalIndex();
    const writerShutdown = shutdownVectorWriteCoordinator('Story Summary unregistered');
    clearWarningCooldowns();
    if (events) {
        CacheRegistry.unregister(MODULE_ID);
        events.cleanup();
        events = null;
        afterAiGateDispose?.();
        afterAiGateDispose = null;
        activeChatId = null;
        cancelHideApplyTimer();
        clearDeferredBackgroundTasks();

        messageButtonOwnership.runOwnedCleanup(() => $(".xiaobaix-story-summary-btn").remove());
        hideOverlay();

        unregisterGenerateInterceptor('story-summary');

        document.removeEventListener("visibilitychange", handleVisibilityChangeForBackground);
        window.removeEventListener("resize", handleViewportChangeForBackground);
        window.visualViewport?.removeEventListener?.("resize", handleViewportChangeForBackground);
        window.visualViewport?.removeEventListener?.("scroll", handleViewportChangeForBackground);
    }

    await writerShutdown;
    clearDeferredBackgroundTasks();
    logRecallRuntimeCheckpoint("unregisterEvents:shutdown-runtime");
    try {
        await shutdownRecallRuntime();
    } catch (error) {
        xbLog.warn(MODULE_ID, '召回运行时关闭失败', error);
    }
    notifyStorySummaryChatState();
}

async function deactivateCurrentChatStorySummary() {
    clearDeferredBackgroundTasks();
    cancelHideApplyTimer();
    cancelRecallAndClearPrompt('deactivated');
    cancelEmbeddingWriteTasks('Story Summary deactivated for current chat');
    lastRecallLogText = "";

    const targetChatId = activeChatId || getContext()?.chatId || '';
    invalidateLexicalIndex();
    await waitForVectorWrites();
    clearDeferredBackgroundTasks();
    if (targetChatId) await clearRecallRuntime(targetChatId);

    try {
        await clearHideState();
    } catch (error) {
        xbLog.warn(MODULE_ID, "Failed to restore hidden messages while disabling this chat", error);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 聊天删除时自动清理服务器向量备份
// ═══════════════════════════════════════════════════════════════════════════

async function handleChatDeleted(chatId) {
    logRecallRuntimeCheckpoint("chatDeleted:clear-runtime", `chat=${chatId || "-"}`);
    clearWarningCooldownsForChat(chatId);
    await clearRecallRuntime(chatId);
    try {
        const filename = getBackupFilename(chatId);
        await deleteServerBackup(filename, null);
        xbLog.info(MODULE_ID, `聊天删除，已清理服务器备份: ${filename}`);
    } catch (_) {
        // 文件不存在或宿主不支持删除，静默处理
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 备份管理 Modal（渲染在父窗口，确保层级在 settings modal 之上）
// ═══════════════════════════════════════════════════════════════════════════

function removeBackupManagerModal() {
    backupManagerCleanup?.();
    backupManagerCleanup = null;
    document.getElementById('lwb-backup-manager-modal')?.remove();
}

function showBackupManagerModal(initialFiles) {
    removeBackupManagerModal();
    const isNarrowViewport = window.matchMedia?.('(max-width: 640px)').matches || window.innerWidth <= 640;

    const overlay = document.createElement('div');
    overlay.id = 'lwb-backup-manager-modal';
    overlay.style.cssText = [
        'position:fixed', 'inset:0', 'background:rgba(0,0,0,.55)',
        'z-index:100000', 'display:flex', 'align-items:center', 'justify-content:center',
        'box-sizing:border-box', `padding:${isNarrowViewport ? '10px' : '16px'}`,
        'overflow:hidden',
    ].join(';');

    const viewport = window.visualViewport;
    const syncOverlayToViewport = () => {
        if (!viewport) return;
        overlay.style.inset = 'auto';
        overlay.style.left = `${viewport.offsetLeft}px`;
        overlay.style.top = `${viewport.offsetTop}px`;
        overlay.style.width = `${viewport.width}px`;
        overlay.style.height = `${viewport.height}px`;
    };
    if (viewport) {
        syncOverlayToViewport();
        viewport.addEventListener('resize', syncOverlayToViewport);
        viewport.addEventListener('scroll', syncOverlayToViewport);
        backupManagerCleanup = () => {
            viewport.removeEventListener('resize', syncOverlayToViewport);
            viewport.removeEventListener('scroll', syncOverlayToViewport);
        };
    }

    const box = document.createElement('div');
    box.style.cssText = [
        'background:#fff', 'color:#222', 'border-radius:8px',
        `width:${isNarrowViewport ? '100%' : 'min(520px,92vw)'}`,
        `padding:${isNarrowViewport ? '12px' : '18px'}`,
        `max-height:${isNarrowViewport ? 'calc(100dvh - 20px)' : '80vh'}`,
        'box-sizing:border-box', 'display:flex', 'flex-direction:column',
        'overflow:hidden',
        'box-shadow:0 8px 32px rgba(0,0,0,.35)', 'font-size:14px',
    ].join(';');

    // Header
    const header = document.createElement('div');
    header.style.cssText = [
        'display:flex', 'justify-content:space-between', 'align-items:center',
        'gap:8px', 'margin-bottom:10px', 'flex-shrink:0',
    ].join(';');
    const title = document.createElement('span');
    title.style.cssText = 'font-weight:700;font-size:15px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
    title.textContent = '服务器向量备份';
    const badge = document.createElement('span');
    badge.id = 'lwb-backup-badge';
    badge.style.cssText = 'opacity:0.5;font-size:0.85em;margin-left:4px';
    title.appendChild(badge);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:6px';

    const btnRefresh = document.createElement('button');
    btnRefresh.className = 'btn btn-sm';
    btnRefresh.textContent = '刷新';

    const btnClose = document.createElement('button');
    btnClose.className = 'btn btn-sm';
    btnClose.textContent = '✕';
    btnClose.onclick = removeBackupManagerModal;

    btnRow.append(btnRefresh, btnClose);
    header.append(title, btnRow);

    // List area
    const listEl = document.createElement('div');
    listEl.id = 'lwb-backup-list';
    listEl.style.cssText = 'overflow-y:auto;overflow-x:hidden;flex:1;min-height:60px;-webkit-overflow-scrolling:touch';

    // Status bar
    const statusEl = document.createElement('div');
    statusEl.id = 'lwb-backup-status';
    statusEl.style.cssText = 'margin-top:8px;font-size:0.82em;color:#666;min-height:1em;flex-shrink:0;word-break:break-word';

    box.append(header, listEl, statusEl);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // Close on backdrop click
    overlay.addEventListener('click', e => { if (e.target === overlay) removeBackupManagerModal(); });

    function setStatus(text, isError) {
        statusEl.textContent = text;
        statusEl.style.color = isError ? '#c00' : '#666';
    }

    function renderList(files) {
        badge.textContent = `(${files.length})`;
        if (!files.length) {
            listEl.innerHTML = '<div style="padding:12px;opacity:0.5;text-align:center">暂无备份记录</div>';
            return;
        }
        const sorted = [...files].sort((a, b) => new Date(b.backupTime) - new Date(a.backupTime));
        listEl.replaceChildren();
        sorted.forEach(f => {
            const row = document.createElement('div');
            row.style.cssText = isNarrowViewport
                ? [
                    'display:grid', 'grid-template-columns:1fr auto', 'gap:4px 8px',
                    'align-items:center', 'padding:8px 2px',
                    'border-bottom:1px solid #e8e8e8', 'font-size:0.82em',
                ].join(';')
                : [
                    'display:flex', 'gap:8px', 'align-items:center', 'padding:6px 2px',
                    'border-bottom:1px solid #e8e8e8', 'font-size:0.82em',
                ].join(';');

            const label = document.createElement('span');
            label.style.cssText = isNarrowViewport
                ? 'grid-column:1 / -1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#333'
                : 'flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#333';
            label.title = f.chatId || f.filename;
            label.textContent = f.chatId || f.filename;

            const size = document.createElement('span');
            size.style.cssText = 'white-space:nowrap;color:#555';
            size.textContent = f.size ? (f.size / 1024 / 1024).toFixed(2) + 'MB' : '?';

            const time = document.createElement('span');
            time.style.cssText = isNarrowViewport
                ? 'min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#888'
                : 'white-space:nowrap;color:#888';
            time.textContent = f.backupTime ? new Date(f.backupTime).toLocaleString() : '?';

            const btnDel = document.createElement('button');
            btnDel.className = 'btn btn-sm';
            btnDel.style.cssText = 'padding:1px 10px;flex-shrink:0;color:#c00;border-color:#c00';
            btnDel.textContent = '删';
            btnDel.onclick = async () => {
                if (!confirm(`确认删除此备份？\n${f.filename}`)) return;
                setStatus('删除中...');
                btnDel.disabled = true;
                try {
                    await deleteServerBackup(f.filename, f.serverPath);
                    setStatus('已删除');
                    const updated = await fetchManifest();
                    renderList(updated);
                } catch (e) {
                    if (isDeleteUnsupportedError(e)) {
                        backupDeleteSupported = false;
                        backupDeleteUnsupportedReason = e.message || '宿主不支持删除接口';
                        setStatus('⚠️ 只读模式：' + backupDeleteUnsupportedReason, true);
                        // 禁用所有删除按钮
                        listEl.querySelectorAll('button').forEach(b => { b.disabled = true; });
                    } else {
                        setStatus('删除失败: ' + (e.message || '未知'), true);
                        btnDel.disabled = false;
                    }
                }
            };

            row.append(label, size, time, btnDel);
            listEl.appendChild(row);
        });

        if (!backupDeleteSupported) {
            setStatus('⚠️ 只读模式：' + backupDeleteUnsupportedReason, true);
            listEl.querySelectorAll('button').forEach(b => { b.disabled = true; });
        }
    }

    btnRefresh.onclick = async () => {
        setStatus('加载中...');
        try {
            const files = await fetchManifest();
            renderList(files);
            setStatus('');
        } catch (e) {
            setStatus('加载失败: ' + e.message, true);
        }
    };

    renderList(initialFiles);
}

// ═══════════════════════════════════════════════════════════════════════════
// Toggle 监听
// ═══════════════════════════════════════════════════════════════════════════

$(document).on("xiaobaix:storySummary:toggle", async (_e, enabled) => {
    if (enabled) {
        await registerEvents();
        await handleChatChanged();
    } else {
        cancelActiveSummaryExecution();
        cancelRecallAndClearPrompt('disabled');
        await unregisterEvents();
        try {
            await clearHideState();
        } catch (e) {
            xbLog.warn(MODULE_ID, "clearHideState failed on toggle off", e);
        }
    }
    notifyStorySummaryChatState();
});

// ═══════════════════════════════════════════════════════════════════════════
// 初始化
// ═══════════════════════════════════════════════════════════════════════════

jQuery(() => {
    if (!getSettings().storySummary?.enabled) return;
    (async () => {
        try {
            await loadConfigFromServer();
        } catch (e) {
            xbLog.warn(MODULE_ID, "Failed to load server config before initialization; using local cache", e);
        }
        await registerEvents();
        initStateIntegration();
        maybePreloadTokenizer();
        await handleChatChanged();
    })().catch((e) => {
        xbLog.error(MODULE_ID, "Story summary initialization failed", e);
    });
});
