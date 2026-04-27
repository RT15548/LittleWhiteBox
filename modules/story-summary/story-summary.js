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
} from "../../../../../../script.js";
import { extensionFolderPath } from "../../core/constants.js";
import { xbLog, CacheRegistry } from "../../core/debug-core.js";
import { createModuleEvents } from "../../core/event-manager.js";
import { postToIframe, isTrustedMessage } from "../../core/iframe-messaging.js";

// config/store
import {
    getSettings,
    getSummaryPanelConfig,
    getVectorConfig,
    saveVectorConfig,
    saveSummaryPanelConfig,
    saveSummaryPanelConfigVerified,
    loadConfigFromServer,
} from "./data/config.js";
import {
    getSummaryStore,
    saveSummaryStore,
    calcHideRange,
    rollbackSummaryIfNeeded,
    rollbackSummaryOnce,
    clearSummaryData,
    getRollbackOnceTargetEndMesId,
    extractRelationshipsFromFacts,
} from "./data/store.js";

// prompt text builder
import {
    buildVectorPromptText,
    buildNonVectorPromptText,
} from "./generate/prompt.js";

// summary generation
import { runSummaryGeneration } from "./generate/generator.js";

// vector service
import { embed, getEngineFingerprint, testOnlineService } from "./vector/utils/embedder.js";
import { testL0Service } from "./vector/llm/llm-service.js";
import { testRerankService } from "./vector/llm/reranker.js";

// tokenizer
import { preload as preloadTokenizer, injectEntities, isReady as isTokenizerReady } from "./vector/utils/tokenizer.js";

// entity lexicon
import { buildEntityLexicon, buildDisplayNameMap } from "./vector/retrieval/entity-lexicon.js";

import {
    getMeta,
    updateMeta,
    saveEventVectors as saveEventVectorsToDb,
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
    syncOnMessageReceived,
} from "./vector/pipeline/chunk-builder.js";
import {
    incrementalExtractAtoms,
    clearAllAtomsAndVectors,
    cancelL0Extraction,
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
} from "./vector/storage/state-store.js";

// vector io
import { exportVectors, importVectors, backupToServer, restoreFromServer, fetchManifest, deleteServerBackup, isDeleteUnsupportedError, getBackupFilename } from "./vector/storage/vector-io.js";
import { clearAllVectorCaches, clearVectorCache, getAllVectorCacheStats, retainVectorCacheOnly, warmVectorCache } from "./vector/storage/vector-cache.js";

import { invalidateLexicalIndex, warmupIndex, addDocumentsForFloor, removeDocumentsByFloor, addEventDocuments } from "./vector/retrieval/lexical-index.js";

// ═══════════════════════════════════════════════════════════════════════════
// 常量
// ═══════════════════════════════════════════════════════════════════════════

const MODULE_ID = "storySummary";
const iframePath = `${extensionFolderPath}/modules/story-summary/story-summary.html`;
const VALID_SECTIONS = ["keywords", "events", "characters", "arcs", "facts"];
const MESSAGE_EVENT = "message";

// ═══════════════════════════════════════════════════════════════════════════
// 状态变量
// ═══════════════════════════════════════════════════════════════════════════

let overlayCreated = false;
let frameReady = false;
let currentMesId = null;
let pendingFrameMessages = [];
/** @type {ReturnType<typeof createModuleEvents>|null} */
let events = null;
let activeChatId = null;
let vectorCancelled = false;
let vectorAbortController = null;
let _lastBuiltPromptText = "";

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

// 用户消息缓存（解决 GENERATION_STARTED 时 chat 尚未包含用户消息的问题）
let lastSentUserMessage = null;
let lastSentTimestamp = 0;

function captureUserInput() {
    const text = $("#send_textarea").val();
    if (text?.trim()) {
        lastSentUserMessage = text.trim();
        lastSentTimestamp = Date.now();
    }
}

function onSendPointerdown(e) {
    markUserInteraction();
    if (e.target?.closest?.("#send_but")) {
        captureUserInput();
    }
}

function onSendKeydown(e) {
    markUserInteraction();
    if (e.key === "Enter" && !e.shiftKey && e.target?.closest?.("#send_textarea")) {
        captureUserInput();
    }
}

function onDocumentFocusIn() {
    markUserInteraction();
}

let hideApplyTimer = null;
const HIDE_APPLY_DEBOUNCE_MS = 250;
let lexicalWarmupTimer = null;
let autoL0BackfillTimer = null;
let vectorIntegrityTimer = null;
const autoSummaryTimers = new Map();
const LEXICAL_WARMUP_DEBOUNCE_MS = 8000;
const CHAT_CHANGE_LEXICAL_WARMUP_MS = 12000;
const AFTER_SEND_LEXICAL_WARMUP_MS = 30000;
const AUTO_SUMMARY_DELAY_MS = 8000;
const AUTO_L0_BACKFILL_DELAY_MS = 15000;
const BACKGROUND_VISIBLE_GRACE_MS = 6000;
const BACKGROUND_INTERACTION_GRACE_MS = 4000;
const BACKGROUND_VIEWPORT_GRACE_MS = 4000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let lastForegroundAt = Date.now();
let lastUserInteractionAt = 0;
let lastViewportChangeAt = 0;

function markUserInteraction() {
    lastUserInteractionAt = Date.now();
}

function markViewportChange() {
    lastViewportChangeAt = Date.now();
}

function getBackgroundQuietWaitMs() {
    if (document.hidden) return BACKGROUND_VISIBLE_GRACE_MS;
    const now = Date.now();
    const visibleWait = Math.max(0, BACKGROUND_VISIBLE_GRACE_MS - (now - lastForegroundAt));
    const interactionWait = Math.max(0, BACKGROUND_INTERACTION_GRACE_MS - (now - lastUserInteractionAt));
    const viewportWait = Math.max(0, BACKGROUND_VIEWPORT_GRACE_MS - (now - lastViewportChangeAt));
    return Math.max(visibleWait, interactionWait, viewportWait);
}

function handleVisibilityChangeForBackground() {
    if (!document.hidden) {
        lastForegroundAt = Date.now();
    }
}

function handleViewportChangeForBackground() {
    markViewportChange();
}

// 向量提醒节流
let lastVectorWarningAt = 0;
const VECTOR_WARNING_COOLDOWN_MS = 120000; // 2分钟内不重复提醒
let backupDeleteSupported = true;
let backupDeleteUnsupportedReason = '';

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

// ═══════════════════════════════════════════════════════════════════════════
// 生成状态管理
// ═══════════════════════════════════════════════════════════════════════════

function isSummaryGenerating() {
    return guard.isRunning('summary');
}

function notifySummaryState() {
    postToFrame({ type: "GENERATION_STATE", isGenerating: guard.isRunning('summary') });
}

// ═══════════════════════════════════════════════════════════════════════════
// iframe 通讯
// ═══════════════════════════════════════════════════════════════════════════

function postToFrame(payload) {
    const iframe = document.getElementById("xiaobaix-story-summary-iframe");
    if (!iframe?.contentWindow || !frameReady) {
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
        },
        mismatch,
    });
}

async function sendAnchorStatsToFrame() {
    const stats = await getAnchorStats();
    const atomsCount = getStateAtomsCount();
    postToFrame({ type: "ANCHOR_STATS", stats: { ...stats, atomsCount } });
}

async function handleAnchorGenerate() {
    const release = guard.acquire('anchor');
    if (!release) return;

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

        postToFrame({ type: "ANCHOR_GEN_PROGRESS", current: 0, total: 1, message: "分析中..." });

        const l0Result = await incrementalExtractAtoms(chatId, chat, (message, current, total) => {
            postToFrame({ type: "ANCHOR_GEN_PROGRESS", current, total, message });
        });

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
        const lastFloor = (chat?.length || 0) - 1;
        if (storageStats.chunks === 0 && lastFloor >= 0 && (meta.lastChunkFloor ?? -1) >= lastFloor) {
            await updateMeta(chatId, { lastChunkFloor: -1 });
            xbLog.warn(MODULE_ID, "Detected empty L1 chunks with full boundary, reset lastChunkFloor=-1");
        }

        postToFrame({ type: "ANCHOR_GEN_PROGRESS", current: 0, total: 1, message: "向量化 L1..." });
        const chunkResult = await buildIncrementalChunks({ vectorConfig: vectorCfg });

        // L1 rebuild only if new chunks were added (usually 0 in normal chat)
        if (chunkResult.built > 0) {
            invalidateLexicalIndex();
            scheduleLexicalWarmup();
        }

        await sendAnchorStatsToFrame();
        await sendVectorStatsToFrame();

        xbLog.info(MODULE_ID, "记忆锚点生成完成");
    } catch (e) {
        xbLog.error(MODULE_ID, "记忆锚点生成失败", e);
        await executeSlashCommand(`/echo severity=error 记忆锚点生成失败：${e.message}`);
    } finally {
        release();
        postToFrame({ type: "ANCHOR_GEN_PROGRESS", current: -1, total: 0 });
    }
}

async function handleAnchorClear() {
    const { chatId } = getContext();
    if (!chatId) return;

    await clearAllAtomsAndVectors(chatId);
    await sendAnchorStatsToFrame();
    await sendVectorStatsToFrame();

    await executeSlashCommand("/echo severity=info 记忆锚点已清空");
    xbLog.info(MODULE_ID, "记忆锚点已清空");
}

function handleAnchorCancel() {
    cancelL0Extraction();
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

async function handleGenerateVectors(vectorCfg) {
    const release = guard.acquire('vector');
    if (!release) return;

    try {
        if (!vectorCfg?.enabled) {
            postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "ALL", current: -1, total: 0 });
            return;
        }

        const { chatId, chat } = getContext();
        if (!chatId || !chat?.length) return;

        if (!vectorCfg.embeddingApi?.key) {
            postToFrame({ type: "VECTOR_ONLINE_STATUS", status: "error", message: "请配置 Embedding API Key" });
            return;
        }

        vectorCancelled = false;
        vectorAbortController = new AbortController();

        const fingerprint = getEngineFingerprint(vectorCfg);
        const batchSize = 20;

        await clearAllChunks(chatId);
        await clearEventVectors(chatId);
        await clearStateVectors(chatId);
        await updateMeta(chatId, { lastChunkFloor: -1, fingerprint });

        // Helper to embed with retry
        const embedWithRetry = async (texts, phase, currentBatchIdx, totalItems) => {
            while (true) {
                if (vectorCancelled) return null;
                try {
                    return await embed(texts, vectorCfg, { signal: vectorAbortController.signal });
                } catch (e) {
                    if (e?.name === "AbortError" || vectorCancelled) return null;
                    xbLog.error(MODULE_ID, `${phase} 向量化单次失败`, e);

                    // 等待 60 秒重试
                    const waitSec = 60;
                    for (let s = waitSec; s > 0; s--) {
                        if (vectorCancelled) return null;
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
        };

        const atoms = getStateAtoms();
        if (!atoms.length) {
            postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "L0", current: 0, total: 0, message: "L0 为空，跳过" });
        } else {
            postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "L0", current: 0, total: atoms.length, message: "L0 向量化..." });

            let l0Completed = 0;
            for (let i = 0; i < atoms.length; i += batchSize) {
                if (vectorCancelled) break;

                const batch = atoms.slice(i, i + batchSize);
                const semTexts = batch.map(a => a.semantic);
                const rTexts = batch.map(a => buildRAggregateText(a));

                const vectors = await embedWithRetry(semTexts.concat(rTexts), "L0", l0Completed, atoms.length);
                if (!vectors) break; // cancelled

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
                await saveStateVectors(chatId, items, fingerprint);
                l0Completed += batch.length;
                postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "L0", current: l0Completed, total: atoms.length });
            }
        }

        if (vectorCancelled) return;

        const allChunks = [];
        for (let floor = 0; floor < chat.length; floor++) {
            if (vectorCancelled) break;

            const message = chat[floor];
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
            await saveChunks(chatId, allChunks);

            let l1Completed = 0;
            for (let i = 0; i < allChunks.length; i += batchSize) {
                if (vectorCancelled) break;

                const batch = allChunks.slice(i, i + batchSize);
                const texts = batch.map(c => c.text);

                const vectors = await embedWithRetry(texts, "L1", l1Completed, allChunks.length);
                if (!vectors) break; // cancelled

                const items = batch.map((c, j) => ({
                    chunkId: c.chunkId,
                    vector: vectors[j],
                }));
                await saveChunkVectors(chatId, items, fingerprint);
                l1Vectors = l1Vectors.concat(items);
                l1Completed += batch.length;
                postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "L1", current: l1Completed, total: allChunks.length });
            }
        }

        if (vectorCancelled) return;

        const store = getSummaryStore();
        const events = store?.json?.events || [];

        const l2Pairs = events
            .map((e) => ({ id: e.id, text: `${e.title || ""} ${e.summary || ""}`.trim() }))
            .filter((p) => p.text);

        if (!l2Pairs.length) {
            postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "L2", current: 0, total: 0, message: "L2 为空，跳过" });
        } else {
            postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "L2", current: 0, total: l2Pairs.length, message: "L2 向量化..." });

            let l2Completed = 0;
            for (let i = 0; i < l2Pairs.length; i += batchSize) {
                if (vectorCancelled) break;

                const batch = l2Pairs.slice(i, i + batchSize);
                const texts = batch.map(p => p.text);

                const vectors = await embedWithRetry(texts, "L2", l2Completed, l2Pairs.length);
                if (!vectors) break; // cancelled

                const items = batch.map((p, idx) => ({
                    eventId: p.id,
                    vector: vectors[idx],
                }));
                await saveEventVectorsToDb(chatId, items, fingerprint);
                l2Completed += batch.length;
                postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "L2", current: l2Completed, total: l2Pairs.length });
            }
        }

        // Full rebuild completed: vector boundary should match latest floor.
        await updateMeta(chatId, { lastChunkFloor: chat.length - 1 });

        postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "ALL", current: -1, total: 0 });
        await sendVectorStatsToFrame();

        xbLog.info(MODULE_ID, `向量生成完成: L0=${atoms.length}, L1=${l1Vectors.length}, L2=${l2Pairs.length}`);
    } catch (e) {
        xbLog.error(MODULE_ID, '向量生成失败', e);
        postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "ALL", current: -1, total: 0 });
        await sendVectorStatsToFrame();
    } finally {
        release();
        vectorCancelled = false;
        vectorAbortController = null;
    }
}

async function handleClearVectors() {
    const { chatId } = getContext();
    if (!chatId) return;

    await clearEventVectors(chatId);
    await clearAllChunks(chatId);
    await clearStateVectors(chatId);
    // Reset both boundary and fingerprint so next incremental build starts from floor 0
    // without being blocked by stale engine fingerprint mismatch.
    await updateMeta(chatId, { lastChunkFloor: -1, fingerprint: null });
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
// L0 自动补提取（每收到新消息后检查并补提取缺失楼层）
// ═══════════════════════════════════════════════════════════════════════════

async function maybeAutoExtractL0() {
    const vectorCfg = getVectorConfig();
    if (!vectorCfg?.enabled) return;
    if (guard.isAnyRunning('anchor', 'vector')) return;

    const { chatId, chat } = getContext();
    if (!chatId || !chat?.length) return;

    const stats = await getAnchorStats();
    if (stats.pending <= 0) return;

    const release = guard.acquire('anchor');
    if (!release) return;

    try {
        const l0Result = await incrementalExtractAtoms(chatId, chat, null, { maxFloors: 20 });
        if (l0Result?.cancelled) return;

        // 为新提取的 L0 楼层构建 L1 chunks
        const chunkResult = await buildIncrementalChunks({ vectorConfig: vectorCfg });

        // L1 rebuild only if new chunks were added
        if (chunkResult.built > 0) {
            invalidateLexicalIndex();
            scheduleLexicalWarmup();
        }

        await sendAnchorStatsToFrame();
        await sendVectorStatsToFrame();

        xbLog.info(MODULE_ID, "自动 L0 补提取完成");
    } catch (e) {
        xbLog.error(MODULE_ID, "自动 L0 补提取失败", e);
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
    retainVectorCacheOnly(chatId || null);
    if (!vectorCfg?.enabled) {
        if (chatId) clearAllVectorCaches();
        return;
    }
    if (!chatId) return;
    warmVectorCache(chatId).catch((error) => {
        xbLog.warn(MODULE_ID, '向量热缓存预热失败', error);
    });
}

async function autoVectorizeNewEvents(newEventIds) {
    if (!newEventIds?.length) return;

    const vectorCfg = getVectorConfig();
    if (!vectorCfg?.enabled) return;

    const { chatId } = getContext();
    if (!chatId) return;

    const store = getSummaryStore();
    const events = store?.json?.events || [];
    const newEventIdSet = new Set(newEventIds);

    const newEvents = events.filter((e) => newEventIdSet.has(e.id));
    if (!newEvents.length) return;

    const pairs = newEvents
        .map((e) => ({ id: e.id, text: `${e.title || ""} ${e.summary || ""}`.trim() }))
        .filter((p) => p.text);

    if (!pairs.length) return;

    try {
        const fingerprint = getEngineFingerprint(vectorCfg);
        const batchSize = 20;

        for (let i = 0; i < pairs.length; i += batchSize) {
            const batch = pairs.slice(i, i + batchSize);
            const texts = batch.map((p) => p.text);

            const vectors = await embed(texts, vectorCfg);
            const items = batch.map((p, idx) => ({
                eventId: p.id,
                vector: vectors[idx],
            }));

            await saveEventVectorsToDb(chatId, items, fingerprint);
        }

        xbLog.info(MODULE_ID, `L2 自动增量完成: ${pairs.length} 个事件`);
        await sendVectorStatsToFrame();
    } catch (e) {
        xbLog.error(MODULE_ID, "L2 自动向量化失败", e);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// L2 跟随编辑同步（用户编辑 events 时调用）
// ═══════════════════════════════════════════════════════════════════════════

async function syncEventVectorsOnEdit(oldEvents, newEvents) {
    const vectorCfg = getVectorConfig();
    if (!vectorCfg?.enabled) return;

    const { chatId } = getContext();
    if (!chatId) return;

    const oldIds = new Set((oldEvents || []).map((e) => e.id).filter(Boolean));
    const newIds = new Set((newEvents || []).map((e) => e.id).filter(Boolean));

    const deletedIds = [...oldIds].filter((id) => !newIds.has(id));

    if (deletedIds.length > 0) {
        await deleteEventVectorsByIds(chatId, deletedIds);
        xbLog.info(MODULE_ID, `L2 同步删除: ${deletedIds.length} 个事件向量`);
        await sendVectorStatsToFrame();
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 向量完整性检测（仅提醒，不自动操作）
// ═══════════════════════════════════════════════════════════════════════════

async function checkVectorIntegrityAndWarn() {
    const vectorCfg = getVectorConfig();
    if (!vectorCfg?.enabled) return;

    const now = Date.now();
    if (now - lastVectorWarningAt < VECTOR_WARNING_COOLDOWN_MS) return;

    const { chat, chatId } = getContext();
    if (!chatId || !chat?.length) return;

    const store = getSummaryStore();
    const totalFloors = chat.length;
    const totalEvents = store?.json?.events?.length || 0;

    if (totalEvents === 0) return;

    const meta = await getMeta(chatId);
    const stats = await getStorageStats(chatId);
    const fingerprint = getEngineFingerprint(vectorCfg);

    const issues = [];

    if (meta.fingerprint && meta.fingerprint !== fingerprint) {
        issues.push('向量引擎/模型已变更');
    }

    const chunkFloorGap = totalFloors - 1 - (meta.lastChunkFloor ?? -1);
    if (chunkFloorGap > 0) {
        issues.push(`${chunkFloorGap} 层片段未向量化`);
    }

    const eventVectorGap = totalEvents - stats.eventVectors;
    if (eventVectorGap > 0) {
        issues.push(`${eventVectorGap} 个事件未向量化`);
    }

    if (issues.length > 0) {
        lastVectorWarningAt = now;
        await executeSlashCommand(`/echo severity=warning 向量数据不完整：${issues.join('、')}。请打开剧情总结面板点击"生成向量"。`);
    }
}

async function maybeAutoBuildChunks() {
    const cfg = getVectorConfig();
    if (!cfg?.enabled) return;

    const { chat, chatId } = getContext();
    if (!chatId || !chat?.length) return;

    const status = await getChunkBuildStatus();
    if (status.pending <= 0) return;

    try {
        await buildIncrementalChunks({ vectorConfig: cfg });
    } catch (e) {
        xbLog.error(MODULE_ID, "自动 L1 构建失败", e);
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
    $("#xiaobaix-story-summary-overlay").hide();
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
    if (!getSettings().storySummary?.enabled) return;
    const msg = document.querySelector(`#chat .mes[mesid="${mesId}"]`);
    if (!msg || msg.querySelector(".xiaobaix-story-summary-btn")) return;

    const btn = createSummaryBtn(mesId);
    if (window.registerButtonToSubContainer?.(mesId, btn)) return;

    msg.querySelector(".flex-container.flex1.alignitemscenter")?.appendChild(btn);
}

function initButtonsForAll() {
    if (!getSettings().storySummary?.enabled) return;
    $("#chat .mes").each((_, el) => {
        const mesId = el.getAttribute("mesid");
        if (mesId != null) addSummaryBtnToMessage(mesId);
    });
}

function initButtonForLatestMessage() {
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
        const savedConfig = await loadConfigFromServer();
        postToFrame({ type: "LOAD_PANEL_CONFIG", config: savedConfig });
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
    };
}

function setHideUiSettings(patch = {}) {
    const cfg = getSummaryPanelConfig() || {};
    const current = getHideUiSettings();
    const next = {
        ...cfg,
        ui: {
            hideSummarized: patch.hideSummarized !== undefined ? !!patch.hideSummarized : current.hideSummarized,
            keepVisibleCount: patch.keepVisibleCount !== undefined
                ? (() => {
                    const parsedKeep = Number.parseInt(patch.keepVisibleCount, 10);
                    return Number.isFinite(parsedKeep) ? Math.max(0, Math.min(50, parsedKeep)) : 6;
                })()
                : current.keepVisibleCount,
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
        canRollback: rollbackTargetEndMesId != null,
        rollbackTargetSummarizedUpTo: rollbackTargetEndMesId == null ? 0 : rollbackTargetEndMesId + 1,
        rollbackWillClearAll: rollbackTargetEndMesId != null && rollbackTargetEndMesId < 0,
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
            arcs: json.arcs.length,
            facts: json.facts.length,
        },
    };
}

async function importSummaryMemoryPackage(rawText) {
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
    if (!chatId) {
        throw new Error("当前没有打开聊天");
    }

    await clearAllAtomsAndVectors(chatId);
    await clearAllChunks(chatId);
    await clearEventVectors(chatId);
    await clearStateVectors(chatId);
    await updateMeta(chatId, { lastChunkFloor: -1, fingerprint: null });

    invalidateLexicalIndex();

    const store = getSummaryStore();
    if (!store) {
        throw new Error("无法读取当前聊天的总结存储");
    }

    store.json = importedJson;
    store.lastSummarizedMesId = -1;
    store.summaryHistory = [];
    store.updatedAt = Date.now();
    saveSummaryStore();

    _lastBuiltPromptText = "";

    refreshEntityLexiconAndWarmup();
    scheduleLexicalWarmup();

    await clearHideState();
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
    return _lastBuiltPromptText;
}

function parseRelationTargetFromPredicate(predicate) {
    const text = String(predicate || "").trim();
    if (!text.startsWith("对")) return null;
    const idx = text.indexOf("的", 1);
    if (idx <= 1) return null;
    return text.slice(1, idx).trim() || null;
}

function isRelationFactLike(fact) {
    if (!fact || fact.retracted) return false;
    return !!parseRelationTargetFromPredicate(fact.p);
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

    const nonRelationFacts = safeFacts.filter((f) => !isRelationFactLike(f));
    const oldRelationByKey = new Map();

    for (const fact of safeFacts) {
        const to = parseRelationTargetFromPredicate(fact?.p);
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
// - 向量：boundary = meta.lastChunkFloor（若为 -1 则回退到 lastSummarizedMesId）
// ═══════════════════════════════════════════════════════════════════════════

async function getHideBoundaryFloor(store) {
    // 没有总结时，不隐藏
    if (store?.lastSummarizedMesId == null || store.lastSummarizedMesId < 0) {
        return -1;
    }

    const vectorCfg = getVectorConfig();
    if (!vectorCfg?.enabled) {
        return store?.lastSummarizedMesId ?? -1;
    }

    const { chatId } = getContext();
    if (!chatId) return store?.lastSummarizedMesId ?? -1;

    const meta = await getMeta(chatId);
    const v = meta?.lastChunkFloor ?? -1;
    if (v >= 0) return v;
    return store?.lastSummarizedMesId ?? -1;
}

async function applyHideState() {
    if (!getSettings().storySummary?.enabled) return;
    const store = getSummaryStore();
    const ui = getHideUiSettings();
    if (!ui.hideSummarized) return;

    // 先全量 unhide，杜绝历史残留
    await unhideAllMessages();

    const boundary = await getHideBoundaryFloor(store);
    if (boundary < 0) return;

    const range = calcHideRange(boundary, ui.keepVisibleCount);
    if (!range) return;

    await executeSlashCommand(`/hide ${range.start}-${range.end}`);
}

function cancelHideApplyTimer() {
    clearTimeout(hideApplyTimer);
    hideApplyTimer = null;
}

function applyHideStateDebounced() {
    cancelHideApplyTimer();
    hideApplyTimer = setTimeout(() => {
        hideApplyTimer = null;
        if (!getSettings().storySummary?.enabled) return;
        if (!getHideUiSettings().hideSummarized) return;
        applyHideState().catch((e) => xbLog.warn(MODULE_ID, "applyHideState failed", e));
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

function scheduleAutoL0Backfill(delayMs = AUTO_L0_BACKFILL_DELAY_MS) {
    clearTimeout(autoL0BackfillTimer);
    const scheduledChatId = getContext().chatId || null;
    autoL0BackfillTimer = setTimeout(() => {
        autoL0BackfillTimer = null;
        if (isChatStale(scheduledChatId)) return;
        const quietWait = getBackgroundQuietWaitMs();
        if (quietWait > 0) {
            scheduleAutoL0Backfill(quietWait);
            return;
        }
        maybeAutoExtractL0();
    }, delayMs);
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
        checkVectorIntegrityAndWarn();
    }, delayMs);
}

function clearDeferredBackgroundTasks() {
    clearTimeout(lexicalWarmupTimer);
    lexicalWarmupTimer = null;
    clearTimeout(autoL0BackfillTimer);
    autoL0BackfillTimer = null;
    clearTimeout(vectorIntegrityTimer);
    vectorIntegrityTimer = null;
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
    if (!getSettings().storySummary?.enabled) return;

    const cfgAll = getSummaryPanelConfig();
    const trig = cfgAll.trigger || {};

    if (trig.timing === "manual") return;
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
    notifySummaryState();

    try {
        for (let attempt = 1; attempt <= 3; attempt++) {
            const result = await runSummaryGeneration(targetMesId, configForRun, {
                onStatus: (text) => postToFrame({ type: "SUMMARY_STATUS", statusText: text }),
                onError: (msg) => postToFrame({ type: "SUMMARY_ERROR", message: msg }),
                onComplete: async ({ merged, endMesId, newEventIds }) => {
                    const store = getSummaryStore();
                    postToFrame({ type: "SUMMARY_FULL_DATA", payload: buildFramePayload(store) });

                    // Incrementally add new events to the lexical index
                    if (newEventIds?.length) {
                        const allEvents = store?.json?.events || [];
                        const idSet = new Set(newEventIds);
                        addEventDocuments(allEvents.filter(e => idSet.has(e.id)));
                    }

                    if (getSettings().storySummary?.enabled && getHideUiSettings().hideSummarized) {
                        applyHideStateDebounced();
                    }
                    await updateFrameStatsAfterSummary(store);

                    await autoVectorizeNewEvents(newEventIds);
                },
            });

            if (result.success) {
                return;
            }

            if (attempt < 3) await sleep(1000);
        }

        await executeSlashCommand("/echo severity=error 剧情总结失败（已自动重试 3 次）。请稍后再试。");
    } finally {
        release();
        notifySummaryState();
    }
}

async function updateFrameStatsAfterSummary(store) {
    const { chat } = getContext();
    const totalFloors = Array.isArray(chat) ? chat.length : 0;
    await sendFrameBaseData(store, totalFloors);
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
            break;
        }

        case "SETTINGS_OPENED":
        case "FULLSCREEN_OPENED":
        case "EDITOR_OPENED":
        case "CONFIRM_OPENED":
            $(".xb-ss-close-btn").hide();
            break;

        case "SETTINGS_CLOSED":
        case "FULLSCREEN_CLOSED":
        case "EDITOR_CLOSED":
        case "CONFIRM_CLOSED":
            $(".xb-ss-close-btn").show();
            break;

        case "REQUEST_GENERATE": {
            const ctx = getContext();
            currentMesId = (ctx.chat?.length ?? 1) - 1;
            handleManualGenerate(currentMesId, data.config || {});
            break;
        }

        case "REQUEST_CANCEL":
            window.xiaobaixStreamingGeneration?.cancel?.("xb9");
            postToFrame({ type: "GENERATION_STATE", isGenerating: false });
            postToFrame({ type: "SUMMARY_STATUS", statusText: "已停止" });
            break;

        case "VECTOR_TEST_ONLINE":
            handleTestOnlineService(data.provider, data.config, data.target || "embedding");
            break;

        case "VECTOR_GENERATE":
            if (data.config) saveVectorConfig(data.config);
            maybePreloadTokenizer();
            refreshEntityLexiconAndWarmup();
            handleGenerateVectors(data.config);
            break;

        case "VECTOR_CLEAR":
            await handleClearVectors();
            break;

        case "VECTOR_CANCEL_GENERATE":
            vectorCancelled = true;
            cancelL0Extraction();
            try { vectorAbortController?.abort?.(); } catch { }
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
                    const result = await importSummaryMemoryPackage(data.text || "");
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
                        const result = await importVectors(file, (status) => {
                            postToFrame({ type: "VECTOR_IO_STATUS", status });
                        });
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
                    const result = await restoreFromServer((status) => {
                        postToFrame({ type: "VECTOR_IO_STATUS", status });
                    });
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
            await clearSummaryData(chatId);
            const totalFloors = Array.isArray(chat) ? chat.length : 0;
            const store = getSummaryStore();
            await sendFrameBaseData(store, totalFloors);
            sendFrameFullData(store, totalFloors);
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

            const result = await rollbackSummaryOnce(chatId);
            const totalFloors = Array.isArray(chat) ? chat.length : 0;
            const nextStore = getSummaryStore();
            await sendFrameBaseData(nextStore, totalFloors);
            sendFrameFullData(nextStore, totalFloors);

            if (!result.success) {
                await executeSlashCommand("/echo severity=error 回退总结失败，请稍后重试");
                break;
            }

            if (result.clearedAll) {
                await executeSlashCommand("/echo severity=info 已回退上一次总结，当前总结数据已清空");
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

            // 同步 L2 向量（删除被移除的事件）
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

        case "SAVE_PANEL_CONFIG":
            if (data.config) {
                try {
                    const previousVectorConfig = getVectorConfig();
                    const previousVectorFingerprint = previousVectorConfig?.enabled
                        ? getEngineFingerprint(previousVectorConfig)
                        : null;
                    const savedConfig = await saveSummaryPanelConfigVerified(data.config);
                    const nextVectorConfig = savedConfig?.vector || {};
                    const nextVectorFingerprint = nextVectorConfig?.enabled
                        ? getEngineFingerprint(nextVectorConfig)
                        : null;
                    const vectorCacheInvalidated =
                        !nextVectorConfig?.enabled ||
                        previousVectorFingerprint !== nextVectorFingerprint;
                    if (vectorCacheInvalidated) {
                        clearAllVectorCaches();
                    } else {
                        warmupActiveVectorCache();
                    }
                    postToFrame({
                        type: "PANEL_CONFIG_SAVE_RESULT",
                        success: true,
                        requestId: data.requestId || "",
                        config: savedConfig,
                    });
                    sendVectorConfigToFrame();
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
    notifySummaryState();

    try {
        await runSummaryGeneration(mesId, config, {
            onStatus: (text) => postToFrame({ type: "SUMMARY_STATUS", statusText: text }),
            onError: (msg) => postToFrame({ type: "SUMMARY_ERROR", message: msg }),
            onComplete: async ({ merged, endMesId, newEventIds }) => {
                const store = getSummaryStore();
                postToFrame({ type: "SUMMARY_FULL_DATA", payload: buildFramePayload(store) });

                // Incrementally add new events to the lexical index
                if (newEventIds?.length) {
                    const allEvents = store?.json?.events || [];
                    const idSet = new Set(newEventIds);
                    addEventDocuments(allEvents.filter(e => idSet.has(e.id)));
                }

                applyHideStateDebounced();
                await updateFrameStatsAfterSummary(store);

                await autoVectorizeNewEvents(newEventIds);
            },
        });
    } finally {
        release();
        notifySummaryState();
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 消息事件
// ═══════════════════════════════════════════════════════════════════════════

async function handleChatChanged() {
    if (!events) return;
    clearDeferredBackgroundTasks();
    _lastBuiltPromptText = "";  // ← 加这一行，切聊天时清掉旧 summary
    const { chat } = getContext();
    activeChatId = getContext().chatId || null;
    retainVectorCacheOnly(activeChatId);
    const newLength = Array.isArray(chat) ? chat.length : 0;

    await rollbackSummaryIfNeeded();
    initButtonsForAll();

    const store = getSummaryStore();

    if (getHideUiSettings().hideSummarized) {
        await applyHideState();
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

    scheduleVectorIntegrityCheck();
}

async function handleMessageDeleted(scheduledChatId) {
    if (isChatStale(scheduledChatId)) return;
    const { chat, chatId } = getContext();
    const newLength = chat?.length || 0;

    await rollbackSummaryIfNeeded();
    await syncOnMessageDeleted(chatId, newLength);

    // L0 同步：清理 floor >= newLength 的 atoms / index / vectors
    deleteStateAtomsFromFloor(newLength);
    deleteL0IndexFromFloor(newLength);
    if (chatId) {
        await deleteStateVectorsFromFloor(chatId, newLength);
    }

    invalidateLexicalIndex();
    scheduleLexicalWarmup();
    await sendAnchorStatsToFrame();
    await sendVectorStatsToFrame();

    applyHideStateDebounced();
}

async function handleMessageSwiped(scheduledChatId) {
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

async function handleMessageReceived(scheduledChatId) {
    if (isChatStale(scheduledChatId)) return;
    const { chat, chatId } = getContext();
    const lastFloor = (chat?.length || 1) - 1;
    const message = chat?.[lastFloor];
    const vectorConfig = getVectorConfig();

    initButtonsForAll();

    // Skip L1 sync while full vector generation is running
    if (guard.isRunning('vector')) return;

    const syncResult = await syncOnMessageReceived(chatId, lastFloor, message, vectorConfig, () => {
        sendAnchorStatsToFrame();
        sendVectorStatsToFrame();
    });

    // Incrementally update lexical index with built chunks (avoid re-read)
    if (syncResult?.chunks?.length) {
        addDocumentsForFloor(lastFloor, syncResult.chunks);
    }

    await maybeAutoBuildChunks();

    applyHideStateDebounced();
    scheduleAutoSummary("after_ai");

    // Refresh entity lexicon after new message (new roles may appear)
    refreshEntityLexiconAndWarmup();
    scheduleLexicalWarmup();

    // Auto backfill missing L0 (delay to avoid contention with current floor)
    scheduleAutoL0Backfill();
}

function handleMessageSent(scheduledChatId) {
    if (isChatStale(scheduledChatId)) return;
    initButtonForLatestMessage();
    scheduleLexicalWarmup(AFTER_SEND_LEXICAL_WARMUP_MS);
    scheduleAutoSummary("before_user");
}

async function handleMessageUpdated(scheduledChatId) {
    if (isChatStale(scheduledChatId)) return;
    await rollbackSummaryIfNeeded();
    initButtonsForAll();
    applyHideStateDebounced();
}

function handleMessageRendered(data) {
    const mesId = data?.element ? $(data.element).attr("mesid") : data?.messageId;
    if (mesId != null) addSummaryBtnToMessage(mesId);
    else initButtonsForAll();
}

// ═══════════════════════════════════════════════════════════════════════════
// 用户消息缓存（供向量召回使用）
// ═══════════════════════════════════════════════════════════════════════════

function handleMessageSentForRecall() {
    const { chat } = getContext();
    const lastMsg = chat?.[chat.length - 1];
    if (lastMsg?.is_user) {
        lastSentUserMessage = lastMsg.mes;
        lastSentTimestamp = Date.now();
    }
}

function clearExtensionPrompt() {
    delete extension_prompts[EXT_PROMPT_KEY];
}

// ═══════════════════════════════════════════════════════════════════════════
// Prompt 注入
// ═══════════════════════════════════════════════════════════════════════════

async function handleGenerationStarted(type, _params, isDryRun) {
    if (isDryRun) return;
    if (!getSettings().storySummary?.enabled) return;

    const T0 = performance.now();
    const timing = {
        tokenizer: 0,
        boundary: 0,
        buildPrompt: 0,
        writePrompt: 0,
    };
    const logTiming = (reason) => {
        const total = Math.round(performance.now() - T0);
        xbLog.info(
            MODULE_ID,
            `Prompt inject timing: type=${type || 'unknown'} reason=${reason} total=${total}ms `
            + `tokenizer=${timing.tokenizer}ms boundary=${timing.boundary}ms `
            + `build=${timing.buildPrompt}ms write=${timing.writePrompt}ms`
        );
    };

    const excludeLastAi = type === "swipe" || type === "regenerate";
    const vectorCfg = getVectorConfig();

    clearExtensionPrompt();

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

    // 判断是否使用缓存的用户消息（30秒内有效）
    let pendingUserMessage = null;
    if (type === "normal" && lastSentUserMessage && (Date.now() - lastSentTimestamp < 30000)) {
        pendingUserMessage = lastSentUserMessage;
    }
    // 用完清空
    lastSentUserMessage = null;
    lastSentTimestamp = 0;

    const { chat, chatId } = getContext();
    const chatLen = Array.isArray(chat) ? chat.length : 0;
    if (chatLen === 0) {
        logTiming('empty_chat');
        return;
    }

    const store = getSummaryStore();

    // 确定注入边界
    // - 向量开：meta.lastChunkFloor（若无则回退 lastSummarizedMesId）
    // - 向量关：lastSummarizedMesId
    let boundary = -1;
    const T_Boundary = performance.now();
    if (vectorCfg?.enabled) {
        const meta = chatId ? await getMeta(chatId) : null;
        boundary = meta?.lastChunkFloor ?? -1;
        if (boundary < 0) boundary = store?.lastSummarizedMesId ?? -1;
    } else {
        boundary = store?.lastSummarizedMesId ?? -1;
    }
    timing.boundary = Math.round(performance.now() - T_Boundary);
    if (boundary < 0) {
        logTiming('no_boundary');
        return;
    }

    // 计算深度：倒序插入，从末尾往前数
    // 最小为 MIN_INJECTION_DEPTH，避免插入太靠近底部
    const depth = Math.max(MIN_INJECTION_DEPTH, chatLen - boundary - 1);
    if (depth < 0) {
        logTiming('invalid_depth');
        return;
    }

    // 构建注入文本
    let text = "";
    const T_BuildPrompt = performance.now();
    if (vectorCfg?.enabled) {
        const r = await buildVectorPromptText(excludeLastAi, {
            postToFrame,
            echo: executeSlashCommand,
            pendingUserMessage,
        });
        text = r?.text || "";
    } else {
        text = buildNonVectorPromptText() || "";
    }
    timing.buildPrompt = Math.round(performance.now() - T_BuildPrompt);
    _lastBuiltPromptText = text;
    if (!text.trim()) {
        logTiming('empty_prompt');
        return;
    }

    // 获取用户配置的 role
    const cfg = getSummaryPanelConfig();
    const roleKey = cfg.trigger?.role || 'system';
    const role = ROLE_MAP[roleKey] || extension_prompt_roles.SYSTEM;

    // 写入 extension_prompts
    const T_WritePrompt = performance.now();
    extension_prompts[EXT_PROMPT_KEY] = {
        value: text,
        position: extension_prompt_types.IN_CHAT,
        depth,
        role,
    };
    timing.writePrompt = Math.round(performance.now() - T_WritePrompt);
    logTiming('injected');
}

// ═══════════════════════════════════════════════════════════════════════════
// 事件注册
// ═══════════════════════════════════════════════════════════════════════════

function scheduleWithChatGuard(fn, delay = 0) {
    const scheduledChatId = getContext().chatId;
    setTimeout(() => fn(scheduledChatId), delay);
}

function isChatStale(scheduledChatId) {
    if (!scheduledChatId || scheduledChatId !== activeChatId) return true;
    const { chatId } = getContext();
    return chatId !== scheduledChatId;
}

function registerEvents() {
    if (events) return;
    events = createModuleEvents(MODULE_ID);
    activeChatId = getContext().chatId || null;

    CacheRegistry.register(MODULE_ID, {
        name: "剧情总结运行缓存",
        getSize: () => {
            const vectorStats = getAllVectorCacheStats();
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
                    vectorCaches: getAllVectorCacheStats(),
                }).length * 2;
            } catch {
                return 0;
            }
        },
        getDetail: () => ({
            activeChatId,
            pendingFrameMessages: pendingFrameMessages.length,
            vectorCaches: getAllVectorCacheStats(),
        }),
        clear: () => {
            pendingFrameMessages = [];
            frameReady = false;
            clearAllVectorCaches();
        },
    });

    initButtonsForAll();

    events.on(event_types.CHAT_CHANGED, () => {
        activeChatId = getContext().chatId || null;
        scheduleWithChatGuard(handleChatChanged, 80);
    });
    events.on(event_types.MESSAGE_DELETED, () => scheduleWithChatGuard(handleMessageDeleted, 50));
    events.on(event_types.MESSAGE_RECEIVED, () => scheduleWithChatGuard(handleMessageReceived, 150));
    events.on(event_types.MESSAGE_SENT, () => scheduleWithChatGuard(handleMessageSent, 150));
    events.on(event_types.MESSAGE_SENT, handleMessageSentForRecall);
    events.on(event_types.MESSAGE_SWIPED, () => scheduleWithChatGuard(handleMessageSwiped, 100));
    events.on(event_types.MESSAGE_UPDATED, () => scheduleWithChatGuard(handleMessageUpdated, 100));
    events.on(event_types.MESSAGE_EDITED, () => scheduleWithChatGuard(handleMessageUpdated, 100));
    events.on(event_types.USER_MESSAGE_RENDERED, (data) => setTimeout(() => handleMessageRendered(data), 50));
    events.on(event_types.CHARACTER_MESSAGE_RENDERED, (data) => setTimeout(() => handleMessageRendered(data), 50));

    // 用户输入捕获（原生捕获阶段）
    document.addEventListener("pointerdown", onSendPointerdown, true);
    document.addEventListener("keydown", onSendKeydown, true);
    document.addEventListener("focusin", onDocumentFocusIn, true);
    document.addEventListener("visibilitychange", handleVisibilityChangeForBackground);
    window.addEventListener("resize", handleViewportChangeForBackground, { passive: true });
    window.visualViewport?.addEventListener?.("resize", handleViewportChangeForBackground, { passive: true });
    window.visualViewport?.addEventListener?.("scroll", handleViewportChangeForBackground, { passive: true });

    // 注入链路
    events.on(event_types.GENERATION_STARTED, handleGenerationStarted);
    events.on(event_types.GENERATION_STOPPED, clearExtensionPrompt);
    events.on(event_types.GENERATION_ENDED, clearExtensionPrompt);

    // 聊天删除时清理对应的服务器向量备份
    events.on(event_types.CHAT_DELETED, handleChatDeleted);
    events.on(event_types.GROUP_CHAT_DELETED, handleChatDeleted);
}

function unregisterEvents() {
    if (!events) return;
    CacheRegistry.unregister(MODULE_ID);
    clearAllVectorCaches();
    events.cleanup();
    events = null;
    activeChatId = null;
    cancelHideApplyTimer();
    clearDeferredBackgroundTasks();

    $(".xiaobaix-story-summary-btn").remove();
    hideOverlay();

    clearExtensionPrompt();

    document.removeEventListener("pointerdown", onSendPointerdown, true);
    document.removeEventListener("keydown", onSendKeydown, true);
    document.removeEventListener("focusin", onDocumentFocusIn, true);
    document.removeEventListener("visibilitychange", handleVisibilityChangeForBackground);
    window.removeEventListener("resize", handleViewportChangeForBackground);
    window.visualViewport?.removeEventListener?.("resize", handleViewportChangeForBackground);
    window.visualViewport?.removeEventListener?.("scroll", handleViewportChangeForBackground);
}

// ═══════════════════════════════════════════════════════════════════════════
// 聊天删除时自动清理服务器向量备份
// ═══════════════════════════════════════════════════════════════════════════

async function handleChatDeleted(chatId) {
    clearVectorCache(chatId);
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

function showBackupManagerModal(initialFiles) {
    document.getElementById('lwb-backup-manager-modal')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'lwb-backup-manager-modal';
    overlay.style.cssText = [
        'position:fixed', 'inset:0', 'background:rgba(0,0,0,.55)',
        'z-index:100000', 'display:flex', 'align-items:center', 'justify-content:center',
    ].join(';');

    const box = document.createElement('div');
    box.style.cssText = [
        'background:#fff', 'color:#222', 'border-radius:8px',
        'width:min(520px,92vw)', 'padding:18px',
        'max-height:80vh', 'display:flex', 'flex-direction:column',
        'box-shadow:0 8px 32px rgba(0,0,0,.35)', 'font-size:14px',
    ].join(';');

    // Header
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:10px';
    const title = document.createElement('span');
    title.style.cssText = 'font-weight:700;font-size:15px';
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
    btnClose.onclick = () => overlay.remove();

    btnRow.append(btnRefresh, btnClose);
    header.append(title, btnRow);

    // List area
    const listEl = document.createElement('div');
    listEl.id = 'lwb-backup-list';
    listEl.style.cssText = 'overflow-y:auto;flex:1;min-height:60px';

    // Status bar
    const statusEl = document.createElement('div');
    statusEl.id = 'lwb-backup-status';
    statusEl.style.cssText = 'margin-top:8px;font-size:0.82em;color:#666;min-height:1em';

    box.append(header, listEl, statusEl);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // Close on backdrop click
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

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
            row.style.cssText = [
                'display:flex', 'gap:8px', 'align-items:center', 'padding:6px 2px',
                'border-bottom:1px solid #e8e8e8', 'font-size:0.82em',
            ].join(';');

            const label = document.createElement('span');
            label.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#333';
            label.title = f.chatId || f.filename;
            label.textContent = f.chatId || f.filename;

            const size = document.createElement('span');
            size.style.cssText = 'white-space:nowrap;color:#555';
            size.textContent = f.size ? (f.size / 1024 / 1024).toFixed(2) + 'MB' : '?';

            const time = document.createElement('span');
            time.style.cssText = 'white-space:nowrap;color:#888';
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
        registerEvents();
        initButtonsForAll();
    } else {
        try {
            await clearHideState();
        } catch (e) {
            xbLog.warn(MODULE_ID, "clearHideState failed on toggle off", e);
        }
        unregisterEvents();
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// 初始化
// ═══════════════════════════════════════════════════════════════════════════

jQuery(() => {
    window.registerModuleCleanup?.(MODULE_ID, unregisterEvents);
    if (!getSettings().storySummary?.enabled) return;
    (async () => {
        await loadConfigFromServer();
        registerEvents();
        initStateIntegration();
        maybePreloadTokenizer();
    })().catch((e) => {
        xbLog.warn(MODULE_ID, "初始化前加载服务端配置失败，继续使用本地缓存", e);
        registerEvents();
        initStateIntegration();
        maybePreloadTokenizer();
    });
});
