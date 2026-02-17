// Story Summary - Generator
// 调用 LLM 生成总结

import { getContext } from "../../../../../../extensions.js";
import { xbLog } from "../../../core/debug-core.js";
import { getSummaryStore, saveSummaryStore, addSummarySnapshot, mergeNewData, getFacts } from "../data/store.js";
import { generateSummary, parseSummaryJson } from "./llm.js";
import { filterText } from "../vector/utils/text-filter.js";

const MODULE_ID = 'summaryGenerator';
const SUMMARY_SESSION_ID = 'xb9';
const MAX_CAUSED_BY = 2;

// ═══════════════════════════════════════════════════════════════════════════
// factUpdates 清洗
// ═══════════════════════════════════════════════════════════════════════════

function normalizeRelationPredicate(p) {
    if (/^对.+的看法$/.test(p)) return p;
    if (/^与.+的关系$/.test(p)) return p;
    return null;
}

function sanitizeFacts(parsed) {
    if (!parsed) return;

    const updates = Array.isArray(parsed.factUpdates) ? parsed.factUpdates : [];
    const ok = [];

    for (const item of updates) {
        const s = String(item?.s || '').trim();
        const pRaw = String(item?.p || '').trim();

        if (!s || !pRaw) continue;

        if (item.retracted === true) {
            ok.push({ s, p: pRaw, retracted: true });
            continue;
        }

        const o = String(item?.o || '').trim();
        if (!o) continue;

        const relP = normalizeRelationPredicate(pRaw);
        const isRel = !!relP;
        const fact = {
            s,
            p: isRel ? relP : pRaw,
            o,
            isState: !!item.isState,
        };

        if (isRel && item.trend) {
            const validTrends = ['破裂', '厌恶', '反感', '陌生', '投缘', '亲密', '交融'];
            if (validTrends.includes(item.trend)) {
                fact.trend = item.trend;
            }
        }

        ok.push(fact);
    }

    parsed.factUpdates = ok;
}


// ═══════════════════════════════════════════════════════════════════════════
// causedBy 清洗（事件因果边）
// ═══════════════════════════════════════════════════════════════════════════

function sanitizeEventsCausality(parsed, existingEventIds) {
    if (!parsed) return;

    const events = Array.isArray(parsed.events) ? parsed.events : [];
    if (!events.length) return;

    const idRe = /^evt-\d+$/;

    const newIds = new Set(
        events
            .map(e => String(e?.id || '').trim())
            .filter(id => idRe.test(id))
    );

    const allowed = new Set([...(existingEventIds || []), ...newIds]);

    for (const e of events) {
        const selfId = String(e?.id || '').trim();
        if (!idRe.test(selfId)) {
            e.causedBy = [];
            continue;
        }

        const raw = Array.isArray(e.causedBy) ? e.causedBy : [];
        const out = [];
        const seen = new Set();

        for (const x of raw) {
            const cid = String(x || '').trim();
            if (!idRe.test(cid)) continue;
            if (cid === selfId) continue;
            if (!allowed.has(cid)) continue;
            if (seen.has(cid)) continue;
            seen.add(cid);
            out.push(cid);
            if (out.length >= MAX_CAUSED_BY) break;
        }

        e.causedBy = out;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 辅助函数
// ═══════════════════════════════════════════════════════════════════════════

export function formatExistingSummaryForAI(store) {
    if (!store?.json) return "（空白，这是首次总结）";

    const data = store.json;
    const parts = [];

    if (data.events?.length) {
        parts.push("【已记录事件】");
        data.events.forEach((ev, i) => parts.push(`${i + 1}. [${ev.timeLabel}] ${ev.title}：${ev.summary}`));
    }

    if (data.characters?.main?.length) {
        const names = data.characters.main.map(m => typeof m === 'string' ? m : m.name);
        parts.push(`\n【主要角色】${names.join("、")}`);
    }

    if (data.arcs?.length) {
        parts.push("【角色弧光】");
        data.arcs.forEach(a => parts.push(`- ${a.name}：${a.trajectory}（进度${Math.round(a.progress * 100)}%）`));
    }

    if (data.keywords?.length) {
        parts.push(`\n【关键词】${data.keywords.map(k => k.text).join("、")}`);
    }

    return parts.join("\n") || "（空白，这是首次总结）";
}

export function getNextEventId(store) {
    const events = store?.json?.events || [];
    if (!events.length) return 1;

    const maxId = Math.max(...events.map(e => {
        const match = e.id?.match(/evt-(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }));

    return maxId + 1;
}

export function buildIncrementalSlice(targetMesId, lastSummarizedMesId, maxPerRun = 100) {
    const { chat, name1, name2 } = getContext();

    const start = Math.max(0, (lastSummarizedMesId ?? -1) + 1);
    const rawEnd = Math.min(targetMesId, chat.length - 1);
    const end = Math.min(rawEnd, start + maxPerRun - 1);

    if (start > end) return { text: "", count: 0, range: "", endMesId: -1 };

    const userLabel = name1 || '用户';
    const charLabel = name2 || '角色';
    const slice = chat.slice(start, end + 1);

    const text = slice.map((m, i) => {
        const speaker = m.name || (m.is_user ? userLabel : charLabel);
        const filteredMessage = filterText(m.mes || "");
        return `#${start + i + 1} 【${speaker}】\n${filteredMessage}`;
    }).join('\n\n');

    return { text, count: slice.length, range: `${start + 1}-${end + 1}楼`, endMesId: end };
}

// ═══════════════════════════════════════════════════════════════════════════
// 主生成函数
// ═══════════════════════════════════════════════════════════════════════════

export async function runSummaryGeneration(mesId, config, callbacks = {}) {
    const { onStatus, onError, onComplete } = callbacks;

    const store = getSummaryStore();
    const lastSummarized = store?.lastSummarizedMesId ?? -1;
    const maxPerRun = config.trigger?.maxPerRun || 100;
    const slice = buildIncrementalSlice(mesId, lastSummarized, maxPerRun);

    if (slice.count === 0) {
        onStatus?.("没有新的对话需要总结");
        return { success: true, noContent: true };
    }

    onStatus?.(`正在总结 ${slice.range}（${slice.count}楼新内容）...`);

    const existingSummary = formatExistingSummaryForAI(store);
    const existingFacts = getFacts();
    const nextEventId = getNextEventId(store);
    const existingEventCount = store?.json?.events?.length || 0;
    const useStream = config.trigger?.useStream !== false;

    let raw;
    try {
        raw = await generateSummary({
            existingSummary,
            existingFacts,
            newHistoryText: slice.text,
            historyRange: slice.range,
            nextEventId,
            existingEventCount,
            llmApi: {
                provider: config.api?.provider,
                url: config.api?.url,
                key: config.api?.key,
                model: config.api?.model,
            },
            genParams: config.gen || {},
            useStream,
            timeout: 120000,
            sessionId: SUMMARY_SESSION_ID,
        });
    } catch (err) {
        xbLog.error(MODULE_ID, '生成失败', err);
        onError?.(err?.message || "生成失败");
        return { success: false, error: err };
    }

    if (!raw?.trim()) {
        xbLog.error(MODULE_ID, 'AI返回为空');
        onError?.("AI返回为空");
        return { success: false, error: "empty" };
    }

    const parsed = parseSummaryJson(raw);
    if (!parsed) {
        xbLog.error(MODULE_ID, 'JSON解析失败');
        onError?.("AI未返回有效JSON");
        return { success: false, error: "parse" };
    }

    sanitizeFacts(parsed);
    const existingEventIds = new Set((store?.json?.events || []).map(e => e?.id).filter(Boolean));
    sanitizeEventsCausality(parsed, existingEventIds);

    const merged = mergeNewData(store?.json || {}, parsed, slice.endMesId);

    store.lastSummarizedMesId = slice.endMesId;
    store.json = merged;
    store.updatedAt = Date.now();
    addSummarySnapshot(store, slice.endMesId);
    saveSummaryStore();

    xbLog.info(MODULE_ID, `总结完成，已更新至 ${slice.endMesId + 1} 楼`);

    if (parsed.factUpdates?.length) {
        xbLog.info(MODULE_ID, `Facts 更新: ${parsed.factUpdates.length} 条`);
    }

    const newEventIds = (parsed.events || []).map(e => e.id);

    onComplete?.({
        merged,
        endMesId: slice.endMesId,
        newEventIds,
        factStats: { updated: parsed.factUpdates?.length || 0 },
    });

    return { success: true, merged, endMesId: slice.endMesId, newEventIds };
}
