// ═══════════════════════════════════════════════════════════════════════════
// Story Summary - Prompt Injection (Final Clean Version)
// - 仅负责“构建注入文本”，不负责写入 extension_prompts
// - 注入发生在 story-summary.js：GENERATION_STARTED 时写入 extension_prompts（IN_CHAT + depth）
// ═══════════════════════════════════════════════════════════════════════════

import { getContext } from "../../../../../../extensions.js";
import { xbLog } from "../../../core/debug-core.js";
import { getSummaryStore } from "../data/store.js";
import { getVectorConfig, getSummaryPanelConfig, getSettings } from "../data/config.js";
import { recallMemory, buildQueryText } from "../vector/recall.js";
import { getChunksByFloors, getAllChunkVectors, getAllEventVectors, getMeta } from "../vector/chunk-store.js";

const MODULE_ID = "summaryPrompt";

// ─────────────────────────────────────────────────────────────────────────────
// 召回失败提示节流（避免连续生成刷屏）
// ─────────────────────────────────────────────────────────────────────────────

let lastRecallFailAt = 0;
const RECALL_FAIL_COOLDOWN_MS = 10_000;

function canNotifyRecallFail() {
    const now = Date.now();
    if (now - lastRecallFailAt < RECALL_FAIL_COOLDOWN_MS) return false;
    lastRecallFailAt = now;
    return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// 预算常量（向量模式使用）
// ─────────────────────────────────────────────────────────────────────────────

const MAIN_BUDGET_MAX = 10000;   // 主装配预算（世界/事件/远期/弧光）
const RECENT_ORPHAN_MAX = 5000;  // [待整理] 独立预算
const TOTAL_BUDGET_MAX = 15000;  // 总预算（用于日志显示）
const L3_MAX = 2000;
const ARCS_MAX = 1500;
const TOP_N_STAR = 5;  // 相似度前N条加⭐

// ─────────────────────────────────────────────────────────────────────────────
// 工具函数
// ─────────────────────────────────────────────────────────────────────────────

function estimateTokens(text) {
    if (!text) return 0;
    const s = String(text);
    const zh = (s.match(/[\u4e00-\u9fff]/g) || []).length;
    return Math.ceil(zh + (s.length - zh) / 4);
}

function pushWithBudget(lines, text, state) {
    const t = estimateTokens(text);
    if (state.used + t > state.max) return false;
    lines.push(text);
    state.used += t;
    return true;
}

function cosineSimilarity(a, b) {
    if (!a?.length || !b?.length || a.length !== b.length) return 0;
    let dot = 0, nA = 0, nB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        nA += a[i] * a[i];
        nB += b[i] * b[i];
    }
    return nA && nB ? dot / (Math.sqrt(nA) * Math.sqrt(nB)) : 0;
}

// 从 summary 解析楼层范围：(#321-322) 或 (#321)
function parseFloorRange(summary) {
    if (!summary) return null;
    const match = String(summary).match(/\(#(\d+)(?:-(\d+))?\)/);
    if (!match) return null;
    const start = Math.max(0, parseInt(match[1], 10) - 1);
    const end = Math.max(0, (match[2] ? parseInt(match[2], 10) : parseInt(match[1], 10)) - 1);
    return { start, end };
}

// 去掉 summary 末尾楼层标记（按你要求：事件本体不显示楼层范围）
function cleanSummary(summary) {
    return String(summary || "")
        .replace(/\s*\(#\d+(?:-\d+)?\)\s*$/, "")
        .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// 系统前导与后缀
// ─────────────────────────────────────────────────────────────────────────────

function buildSystemPreamble() {
    return [
        "以上内容为因上下文窗口限制保留的可见历史",
        "以下【剧情记忆】是对可见与不可见历史的总结：",
        "• 【世界约束】记录着已确立的事实",
        "• 其余部分是过往经历的回忆碎片",
        "",
        "请内化这些记忆：",
    ].join("\n");
}

function buildPostscript() {
    return [
        "",
        "——",
    ].join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// 格式化函数
// ─────────────────────────────────────────────────────────────────────────────

function formatWorldLines(world) {
    return [...(world || [])]
        .sort((a, b) => (b.floor || 0) - (a.floor || 0))
        .map(w => `- ${w.topic}：${w.content}`);
}

function formatArcLine(a) {
    const moments = (a.moments || [])
        .map(m => (typeof m === "string" ? m : m.text))
        .filter(Boolean);

    if (moments.length) {
        return `- ${a.name}：${moments.join(" → ")}（当前：${a.trajectory}）`;
    }
    return `- ${a.name}：${a.trajectory}`;
}

// 完整 chunk 输出（支持 L0 虚拟 chunk）
function formatChunkFullLine(c) {
    const { name1, name2 } = getContext();

    // L0 虚拟 chunk
    if (c.isL0) {
        return `› #${c.floor + 1} [📌] ${String(c.text || "").trim()}`;
    }

    // L1 真实 chunk
    const speaker = c.isUser ? (name1 || "用户") : (name2 || "角色");
    return `› #${c.floor + 1} [${speaker}] ${String(c.text || "").trim()}`;
}

// 因果事件格式（仅作为“前因线索”展示，仍保留楼层提示）
function formatCausalEventLine(causalItem, causalById) {
    const ev = causalItem?.event || {};
    const depth = Math.max(1, Math.min(9, causalItem?._causalDepth || 1));
    const indent = "  │" + "  ".repeat(depth - 1);
    const prefix = `${indent}├─ 前因`;

    const time = ev.timeLabel ? `【${ev.timeLabel}】` : "";
    const people = (ev.participants || []).join(" / ");
    const summary = cleanSummary(ev.summary);

    const r = parseFloorRange(ev.summary);
    const floorHint = r ? `(#${r.start + 1}${r.end !== r.start ? `-${r.end + 1}` : ""})` : "";

    const lines = [];
    lines.push(`${prefix}${time}${people ? ` ${people}` : ""}`);
    const body = `${summary}${floorHint ? ` ${floorHint}` : ""}`.trim();
    lines.push(`${indent}  ${body}`);

    const evidence = causalItem._evidenceChunk;
    if (evidence) {
        const speaker = evidence.speaker || "角色";
        const preview = String(evidence.text || "");
        const clip = preview.length > 60 ? preview.slice(0, 60) + "..." : preview;
        lines.push(`${indent}  › #${evidence.floor + 1} [${speaker}] ${clip}`);
    }

    return lines.join("\n");
}
// ─────────────────────────────────────────────────────────────────────────────
// 装配日志（开发调试用）
// ─────────────────────────────────────────────────────────────────────────────

function formatInjectionLog(stats, details, recentOrphanStats = null) {
    const pct = (n, d) => (d > 0 ? Math.round((n / d) * 100) : 0);

    const lines = [
        '',
        '┌─────────────────────────────────────────────────────────────┐',
        '│ 【装配统计】                                                 │',
        '└─────────────────────────────────────────────────────────────┘',
        `  总预算: ${stats.budget.max} tokens | 已使用: ${stats.budget.used} tokens (${pct(stats.budget.used, stats.budget.max)}%)`,
        '',
    ];

    // [1] 世界约束
    lines.push(`  [1] 世界约束 (上限 2000)`);
    lines.push(`      选入: ${stats.world.count} 条 | 消耗: ${stats.world.tokens} tokens`);
    lines.push('');

    // [2] 核心经历 + 过往背景
    lines.push(`  [2] 核心经历 + 过往背景`);
    lines.push(`      事件: ${stats.events.selected} 条 | 消耗: ${stats.events.tokens} tokens`);

    // 证据统计（区分 L0 和 L1）
    const l0EvidenceCount = details.eventList?.filter(e => e.hasL0Evidence)?.length || 0;
    const l1EvidenceCount = (stats.evidence.attached || 0) - l0EvidenceCount;
    lines.push(`      证据: ${stats.evidence.attached} 条 (L0: ${l0EvidenceCount}, L1: ${l1EvidenceCount}) | 消耗: ${stats.evidence.tokens} tokens`);
    lines.push(`      核心: ${details.directCount || 0} 条 | 过往: ${details.similarCount || 0} 条`);
    lines.push('');

    // [3] 远期片段
    const l0OrphanCount = stats.orphans.l0Count || 0;
    const l1OrphanCount = (stats.orphans.injected || 0) - l0OrphanCount;
    lines.push(`  [3] 远期片段 (已总结范围)`);
    lines.push(`      选入: ${stats.orphans.injected} 条 (L0: ${l0OrphanCount}, L1: ${l1OrphanCount}) | 消耗: ${stats.orphans.tokens} tokens`);
    lines.push('');

    // [4] 待整理
    lines.push(`  [4] 待整理 (独立预算 5000)`);
    lines.push(`      选入: ${recentOrphanStats?.injected || 0} 条 | 消耗: ${recentOrphanStats?.tokens || 0} tokens`);
    lines.push(`      楼层: ${recentOrphanStats?.floorRange || 'N/A'}`);
    lines.push('');

    // [5] 人物弧光
    lines.push(`  [5] 人物弧光 (上限 1500)`);
    lines.push(`      选入: ${stats.arcs.count} 条 | 消耗: ${stats.arcs.tokens} tokens`);
    lines.push('');

    // 预算条形图
    lines.push('  【预算分布】');
    const total = stats.budget.max;
    const bar = (tokens, label) => {
        const width = Math.round((tokens / total) * 30);
        const pctStr = pct(tokens, total) + '%';
        return `  ${label.padEnd(6)} ${'█'.repeat(width).padEnd(30)} ${String(tokens).padStart(5)} (${pctStr})`;
    };
    lines.push(bar(stats.world.tokens, '约束'));
    lines.push(bar(stats.events.tokens + stats.evidence.tokens, '经历'));
    lines.push(bar(stats.orphans.tokens, '远期'));
    lines.push(bar(recentOrphanStats?.tokens || 0, '待整理'));
    lines.push(bar(stats.arcs.tokens, '弧光'));
    lines.push(bar(stats.budget.max - stats.budget.used, '剩余'));
    lines.push('');

    return lines.join('\n');
}

// 重写事件文本里的序号前缀：把 “{idx}. ” 或 “{idx}.【...】” 的 idx 替换
function renumberEventText(text, newIndex) {
    const s = String(text || "");
    // 匹配行首：  "12."  或  "12.【"
    return s.replace(/^(\s*)\d+(\.\s*(?:【)?)/, `$1${newIndex}$2`);
}

function getEventSortKey(ev) {
    const r = parseFloorRange(ev?.summary);
    if (r) return r.start; // 按事件出现楼层排序（最靠谱）
    const m = String(ev?.id || "").match(/evt-(\d+)/);
    return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
}

// ─────────────────────────────────────────────────────────────────────────────
// 非向量模式：全量总结注入（世界 + 事件 + 弧光）
// 仅在 GENERATION_STARTED 调用
// ─────────────────────────────────────────────────────────────────────────────

function buildNonVectorPrompt(store) {
    const data = store.json || {};
    const sections = [];

    if (data.world?.length) {
        const lines = formatWorldLines(data.world);
        sections.push(`[世界约束] 已确立的事实\n${lines.join("\n")}`);
    }

    if (data.events?.length) {
        const lines = data.events.map((ev, i) => {
            const time = ev.timeLabel || "";
            const title = ev.title || "";
            const people = (ev.participants || []).join(" / ");
            const summary = cleanSummary(ev.summary);
            const header = time ? `${i + 1}.【${time}】${title || people}` : `${i + 1}. ${title || people}`;
            return `${header}\n  ${summary}`;
        });
        sections.push(`[剧情记忆]\n\n${lines.join("\n\n")}`);
    }

    if (data.arcs?.length) {
        const lines = data.arcs.map(formatArcLine);
        sections.push(`[人物弧光]\n${lines.join("\n")}`);
    }

    if (!sections.length) return "";

    return (
        `${buildSystemPreamble()}\n` +
        `<剧情记忆>\n\n${sections.join("\n\n")}\n\n</剧情记忆>\n` +
        `${buildPostscript()}`
    );
}

export function buildNonVectorPromptText() {
    if (!getSettings().storySummary?.enabled) {
        return "";
    }

    const store = getSummaryStore();
    if (!store?.json) {
        return "";
    }

    let text = buildNonVectorPrompt(store);
    if (!text.trim()) {
        return "";
    }

    // wrapper（沿用面板设置）
    const cfg = getSummaryPanelConfig();
    if (cfg.trigger?.wrapperHead) text = cfg.trigger.wrapperHead + "\n" + text;
    if (cfg.trigger?.wrapperTail) text = text + "\n" + cfg.trigger.wrapperTail;

    return text;
}

// ─────────────────────────────────────────────────────────────
// 向量模式：预算装配（世界 → 事件(带证据) → 碎片 → 弧光）
// ─────────────────────────────────────────────────────────────

async function buildVectorPrompt(store, recallResult, causalById, queryEntities = [], meta = null) {
    const data = store.json || {};
    const total = { used: 0, max: MAIN_BUDGET_MAX };

    // ═══════════════════════════════════════════════════════════════════
    // 预装配各层内容（先计算预算，后按顺序拼接）
    // ═══════════════════════════════════════════════════════════════════

    const assembled = {
        world: { lines: [], tokens: 0 },
        arcs: { lines: [], tokens: 0 },
        events: { direct: [], similar: [] },
        orphans: { lines: [], tokens: 0 },
        recentOrphans: { lines: [], tokens: 0 },
    };

    const injectionStats = {
        budget: { max: TOTAL_BUDGET_MAX, used: 0 },
        world: { count: 0, tokens: 0 },
        arcs: { count: 0, tokens: 0 },
        events: { selected: 0, tokens: 0 },
        evidence: { attached: 0, tokens: 0 },
        orphans: { injected: 0, tokens: 0 },
    };

    const recentOrphanStats = {
        injected: 0,
        tokens: 0,
        floorRange: "N/A",
    };
    const details = {
        eventList: [],
        directCount: 0,
        similarCount: 0,
    };

    // ═══════════════════════════════════════════════════════════════════
    // [优先级 1] 世界约束 - 最高优先级
    // ═══════════════════════════════════════════════════════════════════
    const worldLines = formatWorldLines(data.world);
    if (worldLines.length) {
        const l3Budget = { used: 0, max: Math.min(L3_MAX, total.max - total.used) };
        for (const line of worldLines) {
            if (!pushWithBudget(assembled.world.lines, line, l3Budget)) break;
        }
        assembled.world.tokens = l3Budget.used;
        total.used += l3Budget.used;
        injectionStats.world.count = assembled.world.lines.length;
        injectionStats.world.tokens = l3Budget.used;
    }

    // ═══════════════════════════════════════════════════════════════════
    // [优先级 2] 人物弧光 - 预留预算（稍后再拼接到末尾）
    // ═══════════════════════════════════════════════════════════════════

    if (data.arcs?.length && total.used < total.max) {
        const { name1 } = getContext();
        const userName = String(name1 || "").trim();

        const relevant = new Set(
            [userName, ...(queryEntities || [])]
                .map(s => String(s || "").trim())
                .filter(Boolean)
        );

        const filtered = (data.arcs || []).filter(a => {
            const n = String(a?.name || "").trim();
            return n && relevant.has(n);
        });

        if (filtered.length) {
            const arcBudget = { used: 0, max: Math.min(ARCS_MAX, total.max - total.used) };
            for (const a of filtered) {
                const line = formatArcLine(a);
                if (!pushWithBudget(assembled.arcs.lines, line, arcBudget)) break;
            }
            assembled.arcs.tokens = arcBudget.used;
            total.used += arcBudget.used;
            injectionStats.arcs.count = assembled.arcs.lines.length;
            injectionStats.arcs.tokens = arcBudget.used;
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // [优先级 3] 事件 + 证据
    // ═══════════════════════════════════════════════════════════════════
    const recalledEvents = (recallResult?.events || []).filter(e => e?.event?.summary);
    const chunks = recallResult?.chunks || [];
    const usedChunkIds = new Set();

    function pickBestChunkForEvent(eventObj) {
        const range = parseFloorRange(eventObj?.summary);
        if (!range) return null;

        let best = null;
        for (const c of chunks) {
            if (usedChunkIds.has(c.chunkId)) continue;
            if (c.floor < range.start || c.floor > range.end) continue;
            if (!best || (c.similarity || 0) > (best.similarity || 0)) best = c;
        }
        return best;
    }

    function formatEventWithEvidence(e, idx, chunk) {
        const ev = e.event || {};
        const time = ev.timeLabel || "";
        const title = String(ev.title || "").trim();
        const people = (ev.participants || []).join(" / ").trim();
        const summary = cleanSummary(ev.summary);

        const displayTitle = title || people || ev.id || "事件";
        const header = time ? `${idx}.【${time}】${displayTitle}` : `${idx}. ${displayTitle}`;

        const lines = [header];
        if (people && displayTitle !== people) lines.push(`  ${people}`);
        lines.push(`  ${summary}`);

        for (const cid of ev.causedBy || []) {
            const c = causalById?.get(cid);
            if (c) lines.push(formatCausalEventLine(c, causalById));
        }

        if (chunk) {
            lines.push(`  ${formatChunkFullLine(chunk)}`);
        }

        return lines.join("\n");
    }

    // 候选按相似度从高到低（保证高分优先拥有证据）
    const candidates = [...recalledEvents].sort((a, b) => (b.similarity || 0) - (a.similarity || 0));

    const selectedDirect = [];  // { event, text, tokens, chunk, hasEvidence }
    const selectedSimilar = []; // { event, text, tokens, chunk, hasEvidence }

    for (let candidateRank = 0; candidateRank < candidates.length; candidateRank++) {
        const e = candidates[candidateRank];

        if (total.used >= total.max) break;

        const isDirect = e._recallType === "DIRECT";

        const bestChunk = pickBestChunkForEvent(e.event);

        // 先尝试“带证据”
        // idx 先占位写 0，后面统一按时间线重排后再改号
        let text = formatEventWithEvidence(e, 0, bestChunk);
        let cost = estimateTokens(text);
        let hasEvidence = !!bestChunk;
        let chosenChunk = bestChunk || null;

        // 塞不下就退化成“不带证据”
        if (total.used + cost > total.max) {
            text = formatEventWithEvidence(e, 0, null);
            cost = estimateTokens(text);
            hasEvidence = false;
            chosenChunk = null;

            if (total.used + cost > total.max) {
                continue;
            }
        }

        // 写入
        if (isDirect) {
            selectedDirect.push({ event: e.event, text, tokens: cost, chunk: chosenChunk, hasEvidence, candidateRank });
        } else {
            selectedSimilar.push({ event: e.event, text, tokens: cost, chunk: chosenChunk, hasEvidence, candidateRank });
        }

        injectionStats.events.selected++;
        total.used += cost;

        // tokens 拆分记账（事件本体 vs 证据）
        if (hasEvidence && bestChunk) {
            const chunkLine = formatChunkFullLine(bestChunk);
            const ct = estimateTokens(chunkLine);
            injectionStats.evidence.attached++;
            injectionStats.evidence.tokens += ct;
            usedChunkIds.add(bestChunk.chunkId);

            // 事件本体 tokens = cost - ct（粗略但够调试）
            injectionStats.events.tokens += Math.max(0, cost - ct);
        } else {
            injectionStats.events.tokens += cost;
        }

        details.eventList.push({
            title: e.event?.title || e.event?.id,
            isDirect,
            hasEvidence,
            tokens: cost,
            similarity: e.similarity || 0,
        });
    }

    // ═══════════════════════════════════════════════════════════════════
    // 重排：恢复时间线顺序（按楼层/evt 序号升序）
    // 并统一重编号（不重新 pick chunk，不重新格式化结构）
    // ═══════════════════════════════════════════════════════════════════

    selectedDirect.sort((a, b) => getEventSortKey(a.event) - getEventSortKey(b.event));
    selectedSimilar.sort((a, b) => getEventSortKey(a.event) - getEventSortKey(b.event));

    const selectedDirectTexts = selectedDirect.map((it, i) => {
        const numbered = renumberEventText(it.text, i + 1);
        return it.candidateRank < TOP_N_STAR ? `⭐${numbered}` : numbered;
    });

    const selectedSimilarTexts = selectedSimilar.map((it, i) => {
        const numbered = renumberEventText(it.text, i + 1);
        return it.candidateRank < TOP_N_STAR ? `⭐${numbered}` : numbered;
    });

    details.directCount = selectedDirect.length;
    details.similarCount = selectedSimilar.length;
    assembled.events.direct = selectedDirectTexts;
    assembled.events.similar = selectedSimilarTexts;

    // ═══════════════════════════════════════════════════════════════════
    // [优先级 4] 远期片段（已总结范围的 orphan chunks）
    // ═══════════════════════════════════════════════════════════════════
    const lastSummarized = store.lastSummarizedMesId ?? -1;
    const lastChunkFloor = meta?.lastChunkFloor ?? -1;
    const keepVisible = store.keepVisibleCount ?? 3;

    if (chunks.length && total.used < total.max) {
        const orphans = chunks
            .filter(c => !usedChunkIds.has(c.chunkId))
            .filter(c => c.floor <= lastSummarized)
            .sort((a, b) => (a.floor - b.floor) || ((a.chunkIdx ?? 0) - (b.chunkIdx ?? 0)));

        const l1Budget = { used: 0, max: total.max - total.used };

        for (const c of orphans) {
            const line = formatChunkFullLine(c);
            if (!pushWithBudget(assembled.orphans.lines, line, l1Budget)) break;
            injectionStats.orphans.injected++;
        }

        assembled.orphans.tokens = l1Budget.used;
        total.used += l1Budget.used;
        injectionStats.orphans.tokens = l1Budget.used;
    }

    // ═══════════════════════════════════════════════════════════════════
    // [独立预算] 待整理（未总结范围，独立 5000）
    // ═══════════════════════════════════════════════════════════════════

    // 近期范围：(lastSummarized, lastChunkFloor - keepVisible]
    const recentStart = lastSummarized + 1;
    const recentEnd = lastChunkFloor - keepVisible;

    if (chunks.length && recentEnd >= recentStart) {
        const recentOrphans = chunks
            .filter(c => !usedChunkIds.has(c.chunkId))
            .filter(c => c.floor >= recentStart && c.floor <= recentEnd)
            .sort((a, b) => (a.floor - b.floor) || ((a.chunkIdx ?? 0) - (b.chunkIdx ?? 0)));

        const recentBudget = { used: 0, max: RECENT_ORPHAN_MAX };

        for (const c of recentOrphans) {
            const line = formatChunkFullLine(c);
            if (!pushWithBudget(assembled.recentOrphans.lines, line, recentBudget)) break;
            recentOrphanStats.injected++;
        }

        assembled.recentOrphans.tokens = recentBudget.used;
        recentOrphanStats.tokens = recentBudget.used;
        recentOrphanStats.floorRange = `${recentStart + 1}~${recentEnd + 1}楼`;
    }

    // ═══════════════════════════════════════════════════════════════════
    // 按注入顺序拼接 sections
    // ═══════════════════════════════════════════════════════════════════

    const sections = [];

    // 1. 世界约束
    if (assembled.world.lines.length) {
        sections.push(`[世界约束] 已确立的事实\n${assembled.world.lines.join("\n")}`);
    }

    // 2. 核心经历
    if (assembled.events.direct.length) {
        sections.push(`[核心经历] 深刻的记忆\n\n${assembled.events.direct.join("\n\n")}`);
    }

    // 3. 过往背景
    if (assembled.events.similar.length) {
        sections.push(`[过往背景] 听别人说起或比较模糊的往事\n\n${assembled.events.similar.join("\n\n")}`);
    }

    // 4. 远期片段
    if (assembled.orphans.lines.length) {
        sections.push(`[远期片段] 记忆里残留的一些老画面\n${assembled.orphans.lines.join("\n")}`);
    }

    // 5. 待整理
    if (assembled.recentOrphans.lines.length) {
        sections.push(`[待整理] 最近发生但尚未梳理的原始记忆\n${assembled.recentOrphans.lines.join("\n")}`);
    }

    // 6. 人物弧光（最后注入，但预算已在优先级 2 预留）
    if (assembled.arcs.lines.length) {
        sections.push(`[人物弧光]\n${assembled.arcs.lines.join("\n")}`);
    }

    // ═══════════════════════════════════════════════════════════════════
    // 统计 & 返回
    // ═══════════════════════════════════════════════════════════════════

    // 总预算 = 主装配 + 待整理
    injectionStats.budget.used = total.used + (recentOrphanStats.tokens || 0);

    if (!sections.length) {
        return { promptText: "", injectionLogText: "", injectionStats };
    }

    const promptText =
        `${buildSystemPreamble()}\n` +
        `<剧情记忆>\n\n${sections.join("\n\n")}\n\n</剧情记忆>\n` +
        `${buildPostscript()}`;

    const injectionLogText = formatInjectionLog(injectionStats, details, recentOrphanStats);

    return { promptText, injectionLogText, injectionStats };
}

// ─────────────────────────────────────────────────────────────────────────────
// 因果证据补充（给 causalEvents 挂 evidence chunk）
// ─────────────────────────────────────────────────────────────────────────────

async function attachEvidenceToCausalEvents(causalEvents, eventVectorMap, chunkVectorMap, chunksMap) {
    for (const c of causalEvents) {
        c._evidenceChunk = null;

        const ev = c.event;
        if (!ev?.id) continue;

        const evVec = eventVectorMap.get(ev.id);
        if (!evVec?.length) continue;

        const range = parseFloorRange(ev.summary);
        if (!range) continue;

        const candidateChunks = [];
        for (const [chunkId, chunk] of chunksMap) {
            if (chunk.floor >= range.start && chunk.floor <= range.end) {
                const vec = chunkVectorMap.get(chunkId);
                if (vec?.length) candidateChunks.push({ chunk, vec });
            }
        }
        if (!candidateChunks.length) continue;

        let best = null;
        let bestSim = -1;
        for (const { chunk, vec } of candidateChunks) {
            const sim = cosineSimilarity(evVec, vec);
            if (sim > bestSim) {
                bestSim = sim;
                best = chunk;
            }
        }

        if (best && bestSim > 0.3) {
            c._evidenceChunk = {
                floor: best.floor,
                speaker: best.speaker,
                text: best.text,
                similarity: bestSim,
            };
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ✅ 向量模式：召回 + 注入（供 story-summary.js 在 GENERATION_STARTED 调用）
// ─────────────────────────────────────────────────────────────────────────────

export async function buildVectorPromptText(excludeLastAi = false, hooks = {}) {
    const { postToFrame = null, echo = null, pendingUserMessage = null } = hooks;
    if (!getSettings().storySummary?.enabled) {
        return { text: "", logText: "" };
    }

    const { chat } = getContext();
    const store = getSummaryStore();

    if (!store?.json) {
        return { text: "", logText: "" };
    }

    const allEvents = store.json.events || [];
    const lastIdx = store.lastSummarizedMesId ?? 0;
    const length = chat?.length || 0;

    if (lastIdx >= length) {
        return { text: "", logText: "" };
    }

    const vectorCfg = getVectorConfig();
    if (!vectorCfg?.enabled) {
        return { text: "", logText: "" };
    }

    const { chatId } = getContext();
    // meta 用于 lastChunkFloor（供 buildVectorPrompt 分桶）
    const meta = chatId ? await getMeta(chatId) : null;

    let recallResult = null;
    let causalById = new Map();

    try {
        const queryText = buildQueryText(chat, 2, excludeLastAi);
        recallResult = await recallMemory(queryText, allEvents, vectorCfg, {
            excludeLastAi,
            pendingUserMessage,
        });

        recallResult = {
            ...recallResult,
            events: recallResult?.events || [],
            chunks: recallResult?.chunks || [],
            causalEvents: recallResult?.causalEvents || [],
            queryEntities: recallResult?.queryEntities || [],
            logText: recallResult?.logText || "",
        };

        // 给因果事件挂证据（用于因果行展示）
        const causalEvents = recallResult.causalEvents || [];
        if (causalEvents.length > 0) {
            const { chatId } = getContext();
            if (chatId) {
                try {
                    const floors = new Set();
                    for (const c of causalEvents) {
                        const r = parseFloorRange(c.event?.summary);
                        if (!r) continue;
                        for (let f = r.start; f <= r.end; f++) floors.add(f);
                    }

                    const [chunks, chunkVecs, eventVecs] = await Promise.all([
                        getChunksByFloors(chatId, Array.from(floors)),
                        getAllChunkVectors(chatId),
                        getAllEventVectors(chatId),
                    ]);

                    const chunksMap = new Map(chunks.map(c => [c.chunkId, c]));
                    const chunkVectorMap = new Map(chunkVecs.map(v => [v.chunkId, v.vector]));
                    const eventVectorMap = new Map(eventVecs.map(v => [v.eventId, v.vector]));

                    await attachEvidenceToCausalEvents(causalEvents, eventVectorMap, chunkVectorMap, chunksMap);
                } catch (e) {
                    xbLog.warn(MODULE_ID, "Causal evidence attachment failed", e);
                }
            }
        }

        causalById = new Map(
            recallResult.causalEvents
                .map(c => [c?.event?.id, c])
                .filter(x => x[0])
        );
    } catch (e) {
        xbLog.error(MODULE_ID, "向量召回失败", e);

        // 显式提示（节流）
        if (echo && canNotifyRecallFail()) {
            const msg = String(e?.message || "未知错误").replace(/\s+/g, " ").slice(0, 200);
            await echo(`/echo severity=warning 向量召回失败：${msg}`);
        }

        // iframe 日志也写一份
        if (postToFrame) {
            postToFrame({
                type: "RECALL_LOG",
                text: `\n[Vector Recall Failed]\n${String(e?.stack || e?.message || e)}\n`,
            });
        }

        return { text: "", logText: `\n[Vector Recall Failed]\n${String(e?.stack || e?.message || e)}\n` };
    }

    // 成功但结果为空：也提示，并清空注入（不降级）
    const hasUseful =
        (recallResult?.events?.length || 0) > 0 ||
        (recallResult?.chunks?.length || 0) > 0 ||
        (recallResult?.causalEvents?.length || 0) > 0;

    if (!hasUseful) {
        if (echo && canNotifyRecallFail()) {
            await echo(
                "/echo severity=warning 向量召回失败：没有可用召回结果（请先在面板中生成向量，或检查指纹不匹配）"
            );
        }
        if (postToFrame) {
            postToFrame({
                type: "RECALL_LOG",
                text: "\n[Vector Recall Empty]\nNo recall candidates / vectors not ready.\n",
            });
        }
        return { text: "", logText: "\n[Vector Recall Empty]\nNo recall candidates / vectors not ready.\n" };
    }

    // 拼装向量 prompt
    const { promptText, injectionLogText } = await buildVectorPrompt(
        store,
        recallResult,
        causalById,
        recallResult?.queryEntities || [],
        meta
    );

    // wrapper（沿用面板设置）——必须补回，否则语义回退
    const cfg = getSummaryPanelConfig();
    let finalText = String(promptText || "");
    if (cfg.trigger?.wrapperHead) finalText = cfg.trigger.wrapperHead + "\n" + finalText;
    if (cfg.trigger?.wrapperTail) finalText = finalText + "\n" + cfg.trigger.wrapperTail;

    // 发给涌现窗口：召回报告 + 装配报告
    if (postToFrame) {
        const recallLog = recallResult.logText || "";
        postToFrame({ type: "RECALL_LOG", text: recallLog + (injectionLogText || "") });
    }

    return { text: finalText, logText: (recallResult.logText || "") + (injectionLogText || "") };
}
