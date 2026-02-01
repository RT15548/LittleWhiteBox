// ═══════════════════════════════════════════════════════════════════════════
// Story Summary - 主入口（最终版）
//
// 稳定目标：
// 1) "聊天时隐藏已总结" 永远只隐藏"已总结"部分，绝不影响未总结部分
// 2) 关闭隐藏 = 暴力全量 unhide，确保立刻恢复
// 3) 开启隐藏 / 改Y / 切Chat / 收新消息：先全量 unhide，再按边界重新 hide
// 4) Prompt 注入位置稳定：永远插在"最后一条 user 消息"之前
// 5) 注入回归 extension_prompts + IN_CHAT + depth（动态计算）
// ═══════════════════════════════════════════════════════════════════════════

import { getContext } from "../../../../../extensions.js";
import {
    eventSource,
    event_types,
    extension_prompts,
    extension_prompt_types,
    extension_prompt_roles,
} from "../../../../../../script.js";
import { extensionFolderPath } from "../../core/constants.js";
import { xbLog, CacheRegistry } from "../../core/debug-core.js";
import { postToIframe, isTrustedMessage } from "../../core/iframe-messaging.js";
import { CommonSettingStorage } from "../../core/server-storage.js";

// config/store
import { getSettings, getSummaryPanelConfig, getVectorConfig, saveVectorConfig } from "./data/config.js";
import {
    getSummaryStore,
    saveSummaryStore,
    calcHideRange,
    rollbackSummaryIfNeeded,
    clearSummaryData,
} from "./data/store.js";

// prompt text builder
import {
    buildVectorPromptText,
    buildNonVectorPromptText,
} from "./generate/prompt.js";

// summary generation
import { runSummaryGeneration } from "./generate/generator.js";

// vector service
import {
    embed,
    getEngineFingerprint,
    checkLocalModelStatus,
    downloadLocalModel,
    cancelDownload,
    deleteLocalModelCache,
    testOnlineService,
    fetchOnlineModels,
    isLocalModelLoaded,
    DEFAULT_LOCAL_MODEL,
} from "./vector/embedder.js";

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
} from "./vector/chunk-store.js";

import {
    buildIncrementalChunks,
    getChunkBuildStatus,
    chunkMessage,
    syncOnMessageDeleted,
    syncOnMessageSwiped,
    syncOnMessageReceived,
} from "./vector/chunk-builder.js";
import { initStateIntegration, rebuildStateVectors } from "./vector/state-integration.js";
import { clearStateVectors, getStateAtomsCount, getStateVectorsCount } from "./vector/state-store.js";

// vector io
import { exportVectors, importVectors } from "./vector/vector-io.js";

// ═══════════════════════════════════════════════════════════════════════════
// 常量
// ═══════════════════════════════════════════════════════════════════════════

const MODULE_ID = "storySummary";
const SUMMARY_CONFIG_KEY = "storySummaryPanelConfig";
const iframePath = `${extensionFolderPath}/modules/story-summary/story-summary.html`;
const VALID_SECTIONS = ["keywords", "events", "characters", "arcs", "world"];
const MESSAGE_EVENT = "message";

// ═══════════════════════════════════════════════════════════════════════════
// 状态变量
// ═══════════════════════════════════════════════════════════════════════════

let summaryGenerating = false;
let overlayCreated = false;
let frameReady = false;
let currentMesId = null;
let pendingFrameMessages = [];
let eventsRegistered = false;
let vectorGenerating = false;
let vectorCancelled = false;
let vectorAbortController = null;

// ★ 用户消息缓存（解决 GENERATION_STARTED 时 chat 尚未包含用户消息的问题）
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
    if (e.target?.closest?.("#send_but")) {
        captureUserInput();
    }
}

function onSendKeydown(e) {
    if (e.key === "Enter" && !e.shiftKey && e.target?.closest?.("#send_textarea")) {
        captureUserInput();
    }
}

let hideApplyTimer = null;
const HIDE_APPLY_DEBOUNCE_MS = 250;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 向量提醒节流
let lastVectorWarningAt = 0;
const VECTOR_WARNING_COOLDOWN_MS = 120000; // 2分钟内不重复提醒

const EXT_PROMPT_KEY = "LittleWhiteBox_StorySummary";

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

function setSummaryGenerating(flag) {
    summaryGenerating = !!flag;
    postToFrame({ type: "GENERATION_STATE", isGenerating: summaryGenerating });
}

function isSummaryGenerating() {
    return summaryGenerating;
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
    const stateAtomsCount = getStateAtomsCount();
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
            stateAtoms: stateAtomsCount,
            stateVectors: stateVectorsCount,
        },
        mismatch,
    });
}

async function sendLocalModelStatusToFrame(modelId) {
    if (!modelId) {
        const cfg = getVectorConfig();
        modelId = cfg?.local?.modelId || DEFAULT_LOCAL_MODEL;
    }
    const status = await checkLocalModelStatus(modelId);
    postToFrame({
        type: "VECTOR_LOCAL_MODEL_STATUS",
        status: status.status,
        message: status.message,
    });
}

async function handleDownloadLocalModel(modelId) {
    try {
        postToFrame({ type: "VECTOR_LOCAL_MODEL_STATUS", status: "downloading", message: "下载中..." });

        await downloadLocalModel(modelId, (percent) => {
            postToFrame({ type: "VECTOR_LOCAL_MODEL_PROGRESS", percent });
        });

        postToFrame({ type: "VECTOR_LOCAL_MODEL_STATUS", status: "ready", message: "已就绪" });
    } catch (e) {
        if (e.message === "下载已取消") {
            postToFrame({ type: "VECTOR_LOCAL_MODEL_STATUS", status: "not_downloaded", message: "已取消" });
        } else {
            postToFrame({ type: "VECTOR_LOCAL_MODEL_STATUS", status: "error", message: e.message });
        }
    }
}

function handleCancelDownload() {
    cancelDownload();
    postToFrame({ type: "VECTOR_LOCAL_MODEL_STATUS", status: "not_downloaded", message: "已取消" });
}

async function handleDeleteLocalModel(modelId) {
    try {
        await deleteLocalModelCache(modelId);
        postToFrame({ type: "VECTOR_LOCAL_MODEL_STATUS", status: "not_downloaded", message: "未下载" });
    } catch (e) {
        postToFrame({ type: "VECTOR_LOCAL_MODEL_STATUS", status: "error", message: e.message });
    }
}

async function handleTestOnlineService(provider, config) {
    try {
        postToFrame({ type: "VECTOR_ONLINE_STATUS", status: "downloading", message: "连接中..." });
        const result = await testOnlineService(provider, config);
        postToFrame({
            type: "VECTOR_ONLINE_STATUS",
            status: "success",
            message: `连接成功 (${result.dims}维)`,
        });
    } catch (e) {
        postToFrame({ type: "VECTOR_ONLINE_STATUS", status: "error", message: e.message });
    }
}

async function handleFetchOnlineModels(config) {
    try {
        postToFrame({ type: "VECTOR_ONLINE_STATUS", status: "downloading", message: "拉取中..." });
        const models = await fetchOnlineModels(config);
        postToFrame({ type: "VECTOR_ONLINE_MODELS", models });
        postToFrame({ type: "VECTOR_ONLINE_STATUS", status: "success", message: `找到 ${models.length} 个模型` });
    } catch (e) {
        postToFrame({ type: "VECTOR_ONLINE_STATUS", status: "error", message: e.message });
    }
}

async function handleGenerateVectors(vectorCfg) {
    if (vectorGenerating) return;

    if (!vectorCfg?.enabled) {
        postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "L1", current: -1, total: 0 });
        postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "L2", current: -1, total: 0 });
        return;
    }

    const { chatId, chat } = getContext();
    if (!chatId || !chat?.length) return;

    if (vectorCfg.engine === "online") {
        if (!vectorCfg.online?.key || !vectorCfg.online?.model) {
            postToFrame({ type: "VECTOR_ONLINE_STATUS", status: "error", message: "请配置在线服务 API" });
            return;
        }
    }

    if (vectorCfg.engine === "local") {
        const modelId = vectorCfg.local?.modelId || DEFAULT_LOCAL_MODEL;
        const status = await checkLocalModelStatus(modelId);
        if (status.status !== "ready") {
            postToFrame({ type: "VECTOR_LOCAL_MODEL_STATUS", status: "downloading", message: "正在加载模型..." });
            try {
                await downloadLocalModel(modelId, (percent) => {
                    postToFrame({ type: "VECTOR_LOCAL_MODEL_PROGRESS", percent });
                });
                postToFrame({ type: "VECTOR_LOCAL_MODEL_STATUS", status: "ready", message: "已就绪" });
            } catch (e) {
                xbLog.error(MODULE_ID, "模型加载失败", e);
                postToFrame({ type: "VECTOR_LOCAL_MODEL_STATUS", status: "error", message: e.message });
                return;
            }
        }
    }

    vectorGenerating = true;
    vectorCancelled = false;
    vectorAbortController?.abort?.();
    vectorAbortController = new AbortController();

    const fingerprint = getEngineFingerprint(vectorCfg);
    const isLocal = vectorCfg.engine === "local";
    const batchSize = isLocal ? 5 : 25;
    const concurrency = isLocal ? 1 : 2;

    // L0 向量重建
    try {
        await rebuildStateVectors(chatId, vectorCfg);
    } catch (e) {
        xbLog.error(MODULE_ID, "L0 向量重建失败", e);
        // 不阻塞，继续 L1/L2
    }

    await clearAllChunks(chatId);
    await updateMeta(chatId, { lastChunkFloor: -1, fingerprint });

    const allChunks = [];
    for (let floor = 0; floor < chat.length; floor++) {
        const chunks = chunkMessage(floor, chat[floor]);
        allChunks.push(...chunks);
    }

    if (allChunks.length > 0) {
        await saveChunks(chatId, allChunks);
    }

    const l1Texts = allChunks.map((c) => c.text);
    const l1Batches = [];
    for (let i = 0; i < l1Texts.length; i += batchSize) {
        l1Batches.push({
            phase: "L1",
            texts: l1Texts.slice(i, i + batchSize),
            startIdx: i,
        });
    }

    const store = getSummaryStore();
    const events = store?.json?.events || [];

    // L2: 全量重建（先清空再重建，保持与 L1 一致性）
    await clearEventVectors(chatId);

    const l2Pairs = events
        .map((e) => ({ id: e.id, text: `${e.title || ""} ${e.summary || ""}`.trim() }))
        .filter((p) => p.text);

    const l2Batches = [];
    for (let i = 0; i < l2Pairs.length; i += batchSize) {
        const batch = l2Pairs.slice(i, i + batchSize);
        l2Batches.push({
            phase: "L2",
            texts: batch.map((p) => p.text),
            ids: batch.map((p) => p.id),
            startIdx: i,
        });
    }

    const l1Total = allChunks.length;
    const l2Total = events.length;
    let l1Completed = 0;
    let l2Completed = 0;

    postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "L1", current: 0, total: l1Total });
    postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "L2", current: l2Completed, total: l2Total });

    let rateLimitWarned = false;

    const allTasks = [...l1Batches, ...l2Batches];
    const l1Vectors = new Array(l1Texts.length);
    const l2VectorItems = [];

    let taskIndex = 0;

    async function worker() {
        while (taskIndex < allTasks.length) {
            if (vectorCancelled) break;
            if (vectorAbortController?.signal?.aborted) break;

            const i = taskIndex++;
            if (i >= allTasks.length) break;

            const task = allTasks[i];

            try {
                const vectors = await embed(task.texts, vectorCfg, { signal: vectorAbortController.signal });

                if (task.phase === "L1") {
                    for (let j = 0; j < vectors.length; j++) {
                        l1Vectors[task.startIdx + j] = vectors[j];
                    }
                    l1Completed += task.texts.length;
                    postToFrame({
                        type: "VECTOR_GEN_PROGRESS",
                        phase: "L1",
                        current: Math.min(l1Completed, l1Total),
                        total: l1Total,
                    });
                } else {
                    for (let j = 0; j < vectors.length; j++) {
                        l2VectorItems.push({ eventId: task.ids[j], vector: vectors[j] });
                    }
                    l2Completed += task.texts.length;
                    postToFrame({
                        type: "VECTOR_GEN_PROGRESS",
                        phase: "L2",
                        current: Math.min(l2Completed, l2Total),
                        total: l2Total,
                    });
                }
            } catch (e) {
                if (e?.name === "AbortError") {
                    xbLog.warn(MODULE_ID, "向量生成已取消（AbortError）");
                    break;
                }

                xbLog.error(MODULE_ID, `${task.phase} batch 向量化失败`, e);

                const msg = String(e?.message || e);
                const isRateLike = /429|403|rate|limit|quota/i.test(msg);
                if (isRateLike && !rateLimitWarned) {
                    rateLimitWarned = true;
                    executeSlashCommand("/echo severity=warning 向量生成遇到速率/配额限制，已进入自动重试。");
                }

                vectorCancelled = true;
                vectorAbortController?.abort?.();
                break;
            }
        }
    }

    await Promise.all(
        Array(Math.min(concurrency, allTasks.length))
            .fill(null)
            .map(() => worker())
    );

    if (vectorCancelled || vectorAbortController?.signal?.aborted) {
        postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "L1", current: -1, total: 0 });
        postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "L2", current: -1, total: 0 });
        vectorGenerating = false;
        return;
    }

    if (allChunks.length > 0 && l1Vectors.filter(Boolean).length > 0) {
        const chunkVectorItems = allChunks
            .map((chunk, idx) => (l1Vectors[idx] ? { chunkId: chunk.chunkId, vector: l1Vectors[idx] } : null))
            .filter(Boolean);
        await saveChunkVectors(chatId, chunkVectorItems, fingerprint);
        await updateMeta(chatId, { lastChunkFloor: chat.length - 1 });
    }

    if (l2VectorItems.length > 0) {
        await saveEventVectorsToDb(chatId, l2VectorItems, fingerprint);
    }

    // 更新 fingerprint（无论之前是否匹配）
    await updateMeta(chatId, { fingerprint });

    postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "L1", current: -1, total: 0 });
    postToFrame({ type: "VECTOR_GEN_PROGRESS", phase: "L2", current: -1, total: 0 });
    await sendVectorStatsToFrame();

    vectorGenerating = false;
    vectorCancelled = false;
    vectorAbortController = null;

    xbLog.info(MODULE_ID, `向量生成完成: L1=${l1Vectors.filter(Boolean).length}, L2=${l2VectorItems.length}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// L2 自动增量向量化（总结完成后调用）
// ═══════════════════════════════════════════════════════════════════════════

async function autoVectorizeNewEvents(newEventIds) {
    if (!newEventIds?.length) return;

    const vectorCfg = getVectorConfig();
    if (!vectorCfg?.enabled) return;

    const { chatId } = getContext();
    if (!chatId) return;

    // 本地模型未加载时跳过（不阻塞总结流程）
    if (vectorCfg.engine === "local") {
        const modelId = vectorCfg.local?.modelId || DEFAULT_LOCAL_MODEL;
        if (!isLocalModelLoaded(modelId)) {
            xbLog.warn(MODULE_ID, "L2 自动向量化跳过：本地模型未加载");
            return;
        }
    }

    const store = getSummaryStore();
    const events = store?.json?.events || [];
    const newEventIdSet = new Set(newEventIds);

    // 只取本次新增的 events
    const newEvents = events.filter((e) => newEventIdSet.has(e.id));
    if (!newEvents.length) return;

    const pairs = newEvents
        .map((e) => ({ id: e.id, text: `${e.title || ""} ${e.summary || ""}`.trim() }))
        .filter((p) => p.text);

    if (!pairs.length) return;

    try {
        const fingerprint = getEngineFingerprint(vectorCfg);
        const batchSize = vectorCfg.engine === "local" ? 5 : 25;

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
        // 不抛出，不阻塞总结流程
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

    // 找出被删除的 eventIds
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

    // 节流：2分钟内不重复提醒
    const now = Date.now();
    if (now - lastVectorWarningAt < VECTOR_WARNING_COOLDOWN_MS) return;

    const { chat, chatId } = getContext();
    if (!chatId || !chat?.length) return;

    const store = getSummaryStore();
    const totalFloors = chat.length;
    const totalEvents = store?.json?.events?.length || 0;

    // 如果没有总结数据，不需要向量
    if (totalEvents === 0) return;

    const meta = await getMeta(chatId);
    const stats = await getStorageStats(chatId);
    const fingerprint = getEngineFingerprint(vectorCfg);

    const issues = [];

    // 指纹不匹配
    if (meta.fingerprint && meta.fingerprint !== fingerprint) {
        issues.push('向量引擎/模型已变更');
    }

    // L1 不完整
    const chunkFloorGap = totalFloors - 1 - (meta.lastChunkFloor ?? -1);
    if (chunkFloorGap > 0) {
        issues.push(`${chunkFloorGap} 层片段未向量化`);
    }

    // L2 不完整
    const eventVectorGap = totalEvents - stats.eventVectors;
    if (eventVectorGap > 0) {
        issues.push(`${eventVectorGap} 个事件未向量化`);
    }

    if (issues.length > 0) {
        lastVectorWarningAt = now;
        await executeSlashCommand(`/echo severity=warning 向量数据不完整：${issues.join('、')}。请打开剧情总结面板点击"生成向量"。`);
    }
}

async function handleClearVectors() {
    const { chatId } = getContext();
    if (!chatId) return;

    await clearEventVectors(chatId);
    await clearAllChunks(chatId);
    await clearStateVectors(chatId);
    await updateMeta(chatId, { lastChunkFloor: -1 });
    await sendVectorStatsToFrame();
    await executeSlashCommand('/echo severity=info 向量数据已清除。如需恢复召回功能，请重新点击"生成向量"。');
    xbLog.info(MODULE_ID, "向量数据已清除");
}

async function maybeAutoBuildChunks() {
    const cfg = getVectorConfig();
    if (!cfg?.enabled) return;

    const { chat, chatId } = getContext();
    if (!chatId || !chat?.length) return;

    const status = await getChunkBuildStatus();
    if (status.pending <= 0) return;

    if (cfg.engine === "local") {
        const modelId = cfg.local?.modelId || DEFAULT_LOCAL_MODEL;
        if (!isLocalModelLoaded(modelId)) return;
    }

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

// ═══════════════════════════════════════════════════════════════════════════
// 面板数据发送
// ═══════════════════════════════════════════════════════════════════════════

async function sendSavedConfigToFrame() {
    try {
        const savedConfig = await CommonSettingStorage.get(SUMMARY_CONFIG_KEY, null);
        if (savedConfig) {
            postToFrame({ type: "LOAD_PANEL_CONFIG", config: savedConfig });
        }
    } catch (e) {
        xbLog.warn(MODULE_ID, "加载面板配置失败", e);
    }
}

async function sendFrameBaseData(store, totalFloors) {
    const boundary = await getHideBoundaryFloor(store);
    const range = calcHideRange(boundary);
    const hiddenCount = (store?.hideSummarizedHistory && range) ? (range.end + 1) : 0;

    const lastSummarized = store?.lastSummarizedMesId ?? -1;
    postToFrame({
        type: "SUMMARY_BASE_DATA",
        stats: {
            totalFloors,
            summarizedUpTo: lastSummarized + 1,
            eventsCount: store?.json?.events?.length || 0,
            pendingFloors: totalFloors - lastSummarized - 1,
            hiddenCount,
        },
        hideSummarized: store?.hideSummarizedHistory || false,
        keepVisibleCount: store?.keepVisibleCount ?? 3,
    });
}

function sendFrameFullData(store, totalFloors) {
    const lastSummarized = store?.lastSummarizedMesId ?? -1;
    if (store?.json) {
        postToFrame({
            type: "SUMMARY_FULL_DATA",
            payload: {
                keywords: store.json.keywords || [],
                events: store.json.events || [],
                characters: store.json.characters || { main: [], relationships: [] },
                arcs: store.json.arcs || [],
                world: store.json.world || [],
                lastSummarizedMesId: lastSummarized,
            },
        });
    } else {
        postToFrame({ type: "SUMMARY_CLEARED", payload: { totalFloors } });
    }
}

function openPanelForMessage(mesId) {
    createOverlay();
    showOverlay();

    const { chat } = getContext();
    const store = getSummaryStore();
    const totalFloors = chat.length;

    sendFrameBaseData(store, totalFloors);
    sendFrameFullData(store, totalFloors);
    setSummaryGenerating(summaryGenerating);

    sendVectorConfigToFrame();
    sendVectorStatsToFrame();

    const cfg = getVectorConfig();
    const modelId = cfg?.local?.modelId || DEFAULT_LOCAL_MODEL;
    sendLocalModelStatusToFrame(modelId);
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
    const store = getSummaryStore();
    if (!store?.hideSummarizedHistory) return;

    // 先全量 unhide，杜绝历史残留
    await unhideAllMessages();

    const boundary = await getHideBoundaryFloor(store);
    if (boundary < 0) return;

    const range = calcHideRange(boundary);
    if (!range) return;

    await executeSlashCommand(`/hide ${range.start}-${range.end}`);
}

function applyHideStateDebounced() {
    clearTimeout(hideApplyTimer);
    hideApplyTimer = setTimeout(() => {
        applyHideState().catch((e) => xbLog.warn(MODULE_ID, "applyHideState failed", e));
    }, HIDE_APPLY_DEBOUNCE_MS);
}

async function clearHideState() {
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
    setSummaryGenerating(true);

    for (let attempt = 1; attempt <= 3; attempt++) {
        const result = await runSummaryGeneration(targetMesId, configForRun, {
            onStatus: (text) => postToFrame({ type: "SUMMARY_STATUS", statusText: text }),
            onError: (msg) => postToFrame({ type: "SUMMARY_ERROR", message: msg }),
            onComplete: async ({ merged, endMesId, newEventIds }) => {
                postToFrame({
                    type: "SUMMARY_FULL_DATA",
                    payload: {
                        keywords: merged.keywords || [],
                        events: merged.events || [],
                        characters: merged.characters || { main: [], relationships: [] },
                        arcs: merged.arcs || [],
                        world: merged.world || [],
                        lastSummarizedMesId: endMesId,
                    },
                });

                applyHideStateDebounced();
                updateFrameStatsAfterSummary(endMesId, merged);

                // L2 自动增量向量化
                await autoVectorizeNewEvents(newEventIds);
            },
        });

        if (result.success) {
            setSummaryGenerating(false);
            return;
        }

        if (attempt < 3) await sleep(1000);
    }

    setSummaryGenerating(false);
    await executeSlashCommand("/echo severity=error 剧情总结失败（已自动重试 3 次）。请稍后再试。");
}

function updateFrameStatsAfterSummary(endMesId, merged) {
    const { chat } = getContext();
    const totalFloors = Array.isArray(chat) ? chat.length : 0;
    const store = getSummaryStore();
    const range = calcHideRange(endMesId);
    const hiddenCount = store?.hideSummarizedHistory && range ? range.end + 1 : 0;

    postToFrame({
        type: "SUMMARY_BASE_DATA",
        stats: {
            totalFloors,
            summarizedUpTo: endMesId + 1,
            eventsCount: merged.events?.length || 0,
            pendingFloors: totalFloors - endMesId - 1,
            hiddenCount,
        },
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// iframe 消息处理
// ═══════════════════════════════════════════════════════════════════════════

function handleFrameMessage(event) {
    const iframe = document.getElementById("xiaobaix-story-summary-iframe");
    if (!isTrustedMessage(event, iframe, "LittleWhiteBox-StoryFrame")) return;

    const data = event.data;

    switch (data.type) {
        case "FRAME_READY": {
            frameReady = true;
            flushPendingFrameMessages();
            setSummaryGenerating(summaryGenerating);
            sendSavedConfigToFrame();
            sendVectorConfigToFrame();
            sendVectorStatsToFrame();

            const cfg = getVectorConfig();
            const modelId = cfg?.local?.modelId || DEFAULT_LOCAL_MODEL;
            sendLocalModelStatusToFrame(modelId);
            break;
        }

        case "SETTINGS_OPENED":
        case "FULLSCREEN_OPENED":
        case "EDITOR_OPENED":
            $(".xb-ss-close-btn").hide();
            break;

        case "SETTINGS_CLOSED":
        case "FULLSCREEN_CLOSED":
        case "EDITOR_CLOSED":
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
            setSummaryGenerating(false);
            postToFrame({ type: "SUMMARY_STATUS", statusText: "已停止" });
            break;

        case "VECTOR_DOWNLOAD_MODEL":
            handleDownloadLocalModel(data.modelId);
            break;

        case "VECTOR_CANCEL_DOWNLOAD":
            handleCancelDownload();
            break;

        case "VECTOR_DELETE_MODEL":
            handleDeleteLocalModel(data.modelId);
            break;

        case "VECTOR_CHECK_LOCAL_MODEL":
            sendLocalModelStatusToFrame(data.modelId);
            break;

        case "VECTOR_TEST_ONLINE":
            handleTestOnlineService(data.provider, data.config);
            break;

        case "VECTOR_FETCH_MODELS":
            handleFetchOnlineModels(data.config);
            break;

        case "VECTOR_GENERATE":
            if (data.config) saveVectorConfig(data.config);
            handleGenerateVectors(data.config);
            break;

        case "VECTOR_CLEAR":
            handleClearVectors();
            break;

        case "VECTOR_CANCEL_GENERATE":
            vectorCancelled = true;
            try { vectorAbortController?.abort?.(); } catch {}
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

        case "REQUEST_VECTOR_STATS":
            sendVectorStatsToFrame();
            break;

        case "REQUEST_CLEAR": {
            const { chat, chatId } = getContext();
            clearSummaryData(chatId);
            postToFrame({
                type: "SUMMARY_CLEARED",
                payload: { totalFloors: Array.isArray(chat) ? chat.length : 0 },
            });
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

            if (VALID_SECTIONS.includes(data.section)) {
                store.json[data.section] = data.data;
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
            const store = getSummaryStore();
            if (!store) break;

            store.hideSummarizedHistory = !!data.enabled;
            saveSummaryStore();

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
            const store = getSummaryStore();
            if (!store) break;

            const oldCount = store.keepVisibleCount ?? 3;
            const newCount = Math.max(0, Math.min(50, parseInt(data.count) || 3));
            if (newCount === oldCount) break;

            store.keepVisibleCount = newCount;
            saveSummaryStore();

            (async () => {
                if (store.hideSummarizedHistory) {
                    await applyHideState();
                }
                const { chat } = getContext();
                await sendFrameBaseData(store, Array.isArray(chat) ? chat.length : 0);
            })();
            break;
        }

        case "SAVE_PANEL_CONFIG":
            if (data.config) {
                CommonSettingStorage.set(SUMMARY_CONFIG_KEY, data.config);
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

    setSummaryGenerating(true);

    await runSummaryGeneration(mesId, config, {
        onStatus: (text) => postToFrame({ type: "SUMMARY_STATUS", statusText: text }),
        onError: (msg) => postToFrame({ type: "SUMMARY_ERROR", message: msg }),
        onComplete: async ({ merged, endMesId, newEventIds }) => {
            postToFrame({
                type: "SUMMARY_FULL_DATA",
                payload: {
                    keywords: merged.keywords || [],
                    events: merged.events || [],
                    characters: merged.characters || { main: [], relationships: [] },
                    arcs: merged.arcs || [],
                    world: merged.world || [],
                    lastSummarizedMesId: endMesId,
                },
            });

            applyHideStateDebounced();
            updateFrameStatsAfterSummary(endMesId, merged);

            // L2 自动增量向量化
            await autoVectorizeNewEvents(newEventIds);
        },
    });

    setSummaryGenerating(false);
}

// ═══════════════════════════════════════════════════════════════════════════
// 消息事件
// ═══════════════════════════════════════════════════════════════════════════

async function handleChatChanged() {
    const { chat } = getContext();
    const newLength = Array.isArray(chat) ? chat.length : 0;

    await rollbackSummaryIfNeeded();
    initButtonsForAll();

    const store = getSummaryStore();
    
    if (store?.hideSummarizedHistory) {
        await applyHideState();
    }

    if (frameReady) {
        await sendFrameBaseData(store, newLength);
        sendFrameFullData(store, newLength);
    }

    // 检测向量完整性并提醒（仅提醒，不自动操作）
    setTimeout(() => checkVectorIntegrityAndWarn(), 2000);
}

async function handleMessageDeleted() {
    const { chat, chatId } = getContext();
    const newLength = chat?.length || 0;

    await rollbackSummaryIfNeeded();
    await syncOnMessageDeleted(chatId, newLength);
    applyHideStateDebounced();
}

async function handleMessageSwiped() {
    const { chat, chatId } = getContext();
    const lastFloor = (chat?.length || 1) - 1;

    await syncOnMessageSwiped(chatId, lastFloor);
    initButtonsForAll();
    applyHideStateDebounced();
}

async function handleMessageReceived() {
    const { chat, chatId } = getContext();
    const lastFloor = (chat?.length || 1) - 1;
    const message = chat?.[lastFloor];
    const vectorConfig = getVectorConfig();

    initButtonsForAll();

    // 向量全量生成中时跳过 L1 sync（避免竞争写入）
    if (vectorGenerating) return;

    await syncOnMessageReceived(chatId, lastFloor, message, vectorConfig);
    await maybeAutoBuildChunks();

    applyHideStateDebounced();
    setTimeout(() => maybeAutoRunSummary("after_ai"), 1000);
}

function handleMessageSent() {
    initButtonsForAll();
    setTimeout(() => maybeAutoRunSummary("before_user"), 1000);
}

async function handleMessageUpdated() {
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

    const excludeLastAi = type === "swipe" || type === "regenerate";
    const vectorCfg = getVectorConfig();

    clearExtensionPrompt();

    // ★ 保留：判断是否使用缓存的用户消息（30秒内有效）
    let pendingUserMessage = null;
    if (type === "normal" && lastSentUserMessage && (Date.now() - lastSentTimestamp < 30000)) {
        pendingUserMessage = lastSentUserMessage;
    }
    // 用完清空
    lastSentUserMessage = null;
    lastSentTimestamp = 0;

    const { chat, chatId } = getContext();
    const chatLen = Array.isArray(chat) ? chat.length : 0;
    if (chatLen === 0) return;

    const store = getSummaryStore();

    // 1) boundary：
    // - 向量开：meta.lastChunkFloor（若无则回退 lastSummarizedMesId）
    // - 向量关：lastSummarizedMesId
    let boundary = -1;
    if (vectorCfg?.enabled) {
        const meta = chatId ? await getMeta(chatId) : null;
        boundary = meta?.lastChunkFloor ?? -1;
        if (boundary < 0) boundary = store?.lastSummarizedMesId ?? -1;
    } else {
        boundary = store?.lastSummarizedMesId ?? -1;
    }
    if (boundary < 0) return;

    // 2) depth：倒序插入，从末尾往前数
    // 最小为 1，避免插入到最底部导致 AI 看到的最后是总结
    const depth = Math.max(2, chatLen - boundary - 1);
    if (depth < 0) return;

    // 3) 构建注入文本（保持原逻辑）
    let text = "";
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
    if (!text.trim()) return;

    // 4) 写入 extension_prompts
    // 获取用户配置的 role
    const cfg = getSummaryPanelConfig();
    const roleKey = cfg.trigger?.role || 'system';
    const role = ROLE_MAP[roleKey] || extension_prompt_roles.SYSTEM;

    extension_prompts[EXT_PROMPT_KEY] = {
        value: text,
        position: extension_prompt_types.IN_CHAT,
        depth,
        role,
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// 事件注册
// ═══════════════════════════════════════════════════════════════════════════

function registerEvents() {
    if (eventsRegistered) return;
    eventsRegistered = true;

    CacheRegistry.register(MODULE_ID, {
        name: "待发送消息队列",
        getSize: () => pendingFrameMessages.length,
        getBytes: () => {
            try {
                return JSON.stringify(pendingFrameMessages || []).length * 2;
            } catch {
                return 0;
            }
        },
        clear: () => {
            pendingFrameMessages = [];
            frameReady = false;
        },
    });

    initButtonsForAll();

    eventSource.on(event_types.CHAT_CHANGED, () => setTimeout(handleChatChanged, 80));
    eventSource.on(event_types.MESSAGE_DELETED, () => setTimeout(handleMessageDeleted, 50));
    eventSource.on(event_types.MESSAGE_RECEIVED, () => setTimeout(handleMessageReceived, 150));
    eventSource.on(event_types.MESSAGE_SENT, () => setTimeout(handleMessageSent, 150));
    eventSource.on(event_types.MESSAGE_SENT, handleMessageSentForRecall);
    eventSource.on(event_types.MESSAGE_SWIPED, () => setTimeout(handleMessageSwiped, 100));
    eventSource.on(event_types.MESSAGE_UPDATED, () => setTimeout(handleMessageUpdated, 100));
    eventSource.on(event_types.MESSAGE_EDITED, () => setTimeout(handleMessageUpdated, 100));
    eventSource.on(event_types.USER_MESSAGE_RENDERED, (data) => setTimeout(() => handleMessageRendered(data), 50));
    eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, (data) => setTimeout(() => handleMessageRendered(data), 50));

    // 用户输入捕获（原生捕获阶段）
    document.addEventListener("pointerdown", onSendPointerdown, true);
    document.addEventListener("keydown", onSendKeydown, true);

    // 注入链路
    eventSource.on(event_types.GENERATION_STARTED, handleGenerationStarted);
    eventSource.on(event_types.GENERATION_STOPPED, clearExtensionPrompt);
    eventSource.on(event_types.GENERATION_ENDED, clearExtensionPrompt);
}

function unregisterEvents() {
    CacheRegistry.unregister(MODULE_ID);
    eventsRegistered = false;

    $(".xiaobaix-story-summary-btn").remove();
    hideOverlay();

    clearExtensionPrompt();

    document.removeEventListener("pointerdown", onSendPointerdown, true);
    document.removeEventListener("keydown", onSendKeydown, true);
}

// ═══════════════════════════════════════════════════════════════════════════
// Toggle 监听
// ═══════════════════════════════════════════════════════════════════════════

$(document).on("xiaobaix:storySummary:toggle", (_e, enabled) => {
    if (enabled) {
        registerEvents();
        initButtonsForAll();
    } else {
        unregisterEvents();
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// 初始化
// ═══════════════════════════════════════════════════════════════════════════

jQuery(() => {
    if (!getSettings().storySummary?.enabled) return;
    registerEvents();
    initStateIntegration();
});
