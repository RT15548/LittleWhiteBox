// Story Summary - Generator
// 调用 LLM 生成总结

import { getContext } from "../../../../../../extensions.js";
import { xbLog } from "../../../core/debug-core.js";
import { formatErrorDetails } from '../../../core/error-details.js';
import {
    addSummarySnapshot,
    getFacts,
    getSummaryStore,
    mergeNewData,
    isSummaryConsumable,
} from "../data/store.js";
import { commitSummaryMemory, readSummaryMemory, waitForMemoryCommit } from '../data/memory-commit.js';
import { memorySaveError } from '../data/memory-copy.js';
import { SUMMARY_FEEDBACK_COPY } from '../feedback-copy.js';
import { formatCharacterAliasTableForAI } from "../data/character-aliases.js";
import {
    generateSummary,
    isSummaryGenerationCancelledError,
    parseSummaryJson,
} from "./llm.js";
import { applyTextFilterRules } from '../data/text-filter-rules.js';
import { getTextFilterRules } from '../data/config.js';
import { memoryPolicy } from '../data/memory-policy.js';
import { getSummarySourceEnd } from './source-boundary.js';
import { normalizeSummaryDelayFloors } from '../data/summary-delay.js';
import { prepareSummaryResult } from './summary-result.js';
import { formatModelArcProgress } from './arc-progress.js';
import { notifySummaryCommitted } from '../maintenance/notification.js';

const MODULE_ID = 'summaryGenerator';
const SUMMARY_SESSION_ID = 'xb9';

// ═══════════════════════════════════════════════════════════════════════════
// 辅助函数
// ═══════════════════════════════════════════════════════════════════════════

export function formatExistingSummaryForAI(store) {
    if (!store?.json) return "（空白，这是首次总结）";

    const data = store.json;
    const parts = [];

    if (data.events?.length) {
        parts.push("【已记录事件】");
        data.events.forEach(ev => parts.push(`[${ev.id}] ${ev.timeLabel ? `[${ev.timeLabel}] ` : ''}${ev.title}：${ev.summary}`));
    }

    if (data.characters?.main?.length) {
        const names = data.characters.main.map(m => typeof m === 'string' ? m : m.name);
        parts.push(`\n【主要角色】${names.join("、")}`);
    }

    const aliasTable = formatCharacterAliasTableForAI(data);
    if (aliasTable) {
        parts.push("\n【角色别名表】");
        parts.push(aliasTable);
    }

    if (data.arcs?.length) {
        parts.push("【角色弧光】");
        data.arcs.forEach(a => parts.push(`- ${a.name}：${a.trajectory}（progress: ${formatModelArcProgress(a.progress)}）`));
    }

    if (data.keywords?.length) {
        parts.push(`\n【关键词】${data.keywords.map(k => k.text).join("、")}`);
    }

    return parts.join("\n") || "（空白，这是首次总结）";
}

export function buildIncrementalSlice(targetMesId, lastSummarizedMesId, maxPerRun = 100, delayFloors = 0, filterRules = getTextFilterRules()) {
    const { chat, name1, name2 } = getContext();

    const start = Math.max(0, (lastSummarizedMesId ?? -1) + 1);
    const rawEnd = getSummarySourceEnd(chat, targetMesId, delayFloors);
    const end = Math.min(rawEnd, start + maxPerRun - 1);

    if (start > end) return { text: "", count: 0, range: "", endMesId: -1 };

    const userLabel = name1 || '用户';
    const charLabel = name2 || '角色';
    const slice = chat.slice(start, end + 1);

    const text = slice.map((m, i) => {
        const speaker = m.name || (m.is_user ? userLabel : charLabel);
        const filteredMessage = applyTextFilterRules(m.mes || '', filterRules);
        return `#${start + i + 1} 【${speaker}】\n${filteredMessage}`;
    }).join('\n\n');

    return { text, count: slice.length, range: `${start + 1}-${end + 1}楼`, endMesId: end };
}

// ═══════════════════════════════════════════════════════════════════════════
// 主生成函数
// ═══════════════════════════════════════════════════════════════════════════

function isSummaryRunInactive(signal, targetChatId) {
    return signal?.aborted || (targetChatId && getContext()?.chatId !== targetChatId);
}

function cancelledResult(onStatus, committed = false) {
    onStatus?.(committed ? "总结已保存，后续处理已停止" : SUMMARY_FEEDBACK_COPY.summaryStopped);
    return { success: committed, cancelled: true, committed };
}

function staleSourceResult(onStatus) {
    onStatus?.("对话或总结内容已变化，本次结果未保存");
    return { success: false, stale: true };
}

export async function runSummaryGeneration(mesId, config, callbacks = {}, runtime = {}) {
    const { onStatus, onError, onComplete } = callbacks;
    const { signal = null, targetChatId = getContext()?.chatId || null } = runtime;

    if (isSummaryRunInactive(signal, targetChatId)) {
        return cancelledResult(onStatus);
    }

    const store = getSummaryStore();
    if (!isSummaryConsumable(store, getContext().chat?.length || 0)) {
        onError?.("总结历史无法安全回滚：请导出当前总结，修正后重新导入，或清空总结数据");
        return { success: false, error: "summary_invalid" };
    }
    const lastSummarized = store?.lastSummarizedMesId ?? -1;
    const storeUpdatedAt = store?.updatedAt;
    const storeJsonAtStart = JSON.stringify(store?.json || {});
    const maxPerRun = config.trigger?.maxPerRun || 100;
    const delayFloors = normalizeSummaryDelayFloors(config.trigger?.delayFloors);
    const filterRules = structuredClone(getTextFilterRules());
    const slice = buildIncrementalSlice(mesId, lastSummarized, maxPerRun, delayFloors, filterRules);

    if (slice.count === 0) {
        const { chat } = getContext();
        onStatus?.(getSummarySourceEnd(chat, mesId) < Math.min(mesId, chat.length - 1)
            ? "末尾对话仍在更新，将在后续剧情开始后纳入总结" : "没有新的对话需要总结");
        return { success: true, noContent: true };
    }

    onStatus?.(`正在总结 ${slice.range}（${slice.count}楼新内容）...`);

    const existingSummary = formatExistingSummaryForAI(store);
    const existingFacts = getFacts();
    const existingEventCount = store?.json?.events?.length || 0;
    const useStream = config.trigger?.useStream !== false;

    let raw;
    try {
        raw = await generateSummary({
            existingSummary,
            existingFacts,
            newHistoryText: slice.text,
            historyRange: slice.range,
            existingEventCount,
            llmApi: {
                provider: config.api?.provider,
                url: config.api?.url,
                key: config.api?.key,
                model: config.api?.model,
            },
            genParams: config.gen || {},
            useStream,
            sessionId: SUMMARY_SESSION_ID,
            signal,
        });
        if (isSummaryRunInactive(signal, targetChatId)) {
            return cancelledResult(onStatus);
        }
        // Wait before revalidating or merging: a maintenance save may still be
        // publishing its receipt, or may restore the previous snapshot on failure.
        await waitForMemoryCommit(signal);
    } catch (err) {
        if (isSummaryGenerationCancelledError(err) || isSummaryRunInactive(signal, targetChatId)) {
            onStatus?.(SUMMARY_FEEDBACK_COPY.summaryStopped);
            return { success: false, cancelled: true };
        }
        xbLog.error(MODULE_ID, '生成失败', err);
        onError?.(`生成失败：${formatErrorDetails(err, { includeStack: false })}`);
        return { success: false, error: err };
    }

    if (isSummaryRunInactive(signal, targetChatId)) {
        return cancelledResult(onStatus);
    }
    // Revalidate the captured slice without expanding it when new messages make
    // more floors eligible. A shortened chat must still respect the delayed tail.
    const currentSlice = buildIncrementalSlice(slice.endMesId, lastSummarized, maxPerRun, delayFloors, filterRules);
    if (
        (store?.lastSummarizedMesId ?? -1) !== lastSummarized
        || store?.updatedAt !== storeUpdatedAt
        || JSON.stringify(store?.json || {}) !== storeJsonAtStart
        || currentSlice.endMesId !== slice.endMesId
        || currentSlice.text !== slice.text
    ) {
        return staleSourceResult(onStatus);
    }

    if (!raw?.trim()) {
        xbLog.error(MODULE_ID, 'AI返回为空');
        onError?.("AI返回为空");
        return { success: false, error: "empty" };
    }

    const decoded = parseSummaryJson(raw);
    if (!decoded) {
        xbLog.error(MODULE_ID, 'JSON解析失败');
        onError?.("AI未返回有效JSON");
        return { success: false, error: "parse" };
    }

    let parsed;
    try {
        parsed = prepareSummaryResult(decoded, {
            existingEvents: store?.json?.events || [],
            // Source markers are one-based; endMesId is zero-based.
            startFloor: slice.endMesId - slice.count + 2,
            endFloor: slice.endMesId + 1,
        });
    } catch (error) {
        const message = `返回的JSON不是有效总结：${error.message}`;
        xbLog.error(MODULE_ID, message);
        onError?.(message);
        return { success: false, error: "structure", message };
    }

    const mergeResult = mergeNewData(store?.json || {}, parsed, slice.endMesId, { returnMeta: true });
    const merged = mergeResult.json;
    const previous = readSummaryMemory();
    const next = structuredClone(previous);
    next.storySummary.lastSummarizedMesId = slice.endMesId;
    next.storySummary.json = merged;
    delete next.storySummary.pendingImportBoundary;
    next.storySummary.updatedAt = Date.now();
    addSummarySnapshot(next.storySummary, lastSummarized, slice.endMesId, mergeResult.undo, memoryPolicy(filterRules));

    try {
        await commitSummaryMemory(targetChatId, next, { previous, validate: () => {
            const latest = buildIncrementalSlice(slice.endMesId, lastSummarized, maxPerRun, delayFloors, filterRules);
            if (isSummaryRunInactive(signal, targetChatId) || latest.endMesId !== slice.endMesId || latest.text !== slice.text) {
                throw Object.assign(new Error('metadata_draft_conflict'), { code: 'metadata_draft_conflict' });
            }
        } });
    } catch (error) {
        xbLog.error(MODULE_ID, '总结持久化失败', error);
        onError?.(memorySaveError(error));
        return { success: false, error };
    }

    xbLog.info(MODULE_ID, `总结完成，已更新至 ${slice.endMesId + 1} 楼`);
    notifySummaryCommitted({ chatId: targetChatId, start: lastSummarized + 1, cutoff: slice.endMesId });

    if (parsed.factUpdates?.length) {
        xbLog.info(MODULE_ID, `Facts 更新: ${parsed.factUpdates.length} 条`);
    }

    const newEventIds = (parsed.events || []).map(e => e.id);
    const result = {
        success: true,
        committed: true,
        merged,
        endMesId: slice.endMesId,
        newEventIds,
        aliasChanged: !!mergeResult.aliasChanged,
    };
    onStatus?.(`总结已保存至 ${slice.endMesId + 1} 楼，正在更新检索数据…`);

    try {
        await onComplete?.({
            merged,
            store,
            targetChatId,
            signal,
            endMesId: slice.endMesId,
            newEventIds,
            aliasChanged: !!mergeResult.aliasChanged,
            factStats: { updated: parsed.factUpdates?.length || 0 },
        });
    } catch (error) {
        if (isSummaryGenerationCancelledError(error) || isSummaryRunInactive(signal, targetChatId)) {
            return cancelledResult(onStatus, true);
        }
        xbLog.warn(MODULE_ID, '总结已提交，但收尾任务失败', error);
        onError?.(`总结已保存，但后续处理失败：${formatErrorDetails(error, { includeStack: false })}`);
        return result;
    }

    if (isSummaryRunInactive(signal, targetChatId)) {
        return cancelledResult(onStatus, true);
    }

    onStatus?.(`总结完成，已保存至 ${slice.endMesId + 1} 楼`);
    return result;
}
