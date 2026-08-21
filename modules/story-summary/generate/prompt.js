// ═══════════════════════════════════════════════════════════════════════════
// Story Summary - Prompt Injection (v7 - L0 scene-based display)
//
// 命名规范：
// - 存储层用 L0/L1/L2/L3（StateAtom/Chunk/Event/Fact）
// - 装配层用语义名称：constraint/event/evidence/arc
//
// 架构变更（v5 → v6）：
// - 同楼层多个 L0 共享一对 L1（EvidenceGroup per-floor）
// - L0 展示文本直接使用 semantic 字段（v7: 场景摘要，纯自然语言）
// - 仅负责"构建注入文本"，不负责写入 extension_prompts
// - 注入发生在 story-summary.js：generate_interceptor 时写入 extension_prompts
// ═══════════════════════════════════════════════════════════════════════════

import { getContext } from "../../../../../../extensions.js";
import { xbLog } from "../../../core/debug-core.js";
import { getSummaryStore, getFacts } from "../data/store.js";
import { isRelationFact } from "../data/fact-predicates.js";
import { getVectorConfig, getSummaryPanelConfig, getSettings, DEFAULT_MEMORY_PROMPT_TEMPLATE } from "../data/config.js";
import {
    hydrateSelectedDirectEvidence,
    recallMemory,
    releaseDirectEvidenceContext,
} from "../vector/retrieval/recall.js";
import { getMeta } from "../vector/storage/chunk-store.js";
import { getStateAtoms } from "../vector/storage/state-store.js";
import { getEngineFingerprint } from "../vector/utils/embedder.js";
import { buildTrustedCharacters } from "../vector/retrieval/entity-lexicon.js";
import { filterConstraintsByRelevance } from "./constraint-filter.js";
import {
    getTemporalProtectionLimit,
    parseEventRange,
    TEMPORAL_PROTECTION_POLICY,
} from "../vector/retrieval/temporal-turn-carrier.js";
import {
    admitDirectEvidenceItems,
    buildRankRelevance,
} from "./direct-evidence-packing.js";
import { buildTemporalEventPackingOrder } from "./temporal-event-packing.js";

// Metrics
import { formatMetricsLog, detectIssues } from "../vector/retrieval/metrics.js";

const MODULE_ID = "summaryPrompt";

// ─────────────────────────────────────────────────────────────────────────────
// 预算常量
// ─────────────────────────────────────────────────────────────────────────────

const SHARED_POOL_MAX = 10000;
const CONSTRAINT_MAX = 2000;
const ARCS_MAX = 1500;
const EVENT_BUDGET_MAX = 5000;
const RELATED_EVENT_MAX = 500;
const UNSUMMARIZED_EVIDENCE_MAX = 2000;
const TOP_N_STAR = 5;

// L0 显示文本：分号拼接 vs 多行模式的阈值
const L0_JOINED_MAX_LENGTH = 120;

// ─────────────────────────────────────────────────────────────────────────────
// 工具函数
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 估算文本 token 数量
 * @param {string} text - 输入文本
 * @returns {number} token 估算值
 */
function estimateTokens(text) {
    if (!text) return 0;
    const s = String(text);
    const zh = (s.match(/[\u4e00-\u9fff]/g) || []).length;
    return Math.ceil(zh + (s.length - zh) / 4);
}

/**
 * 带预算限制的行追加
 * @param {string[]} lines - 行数组
 * @param {string} text - 要追加的文本
 * @param {object} state - 预算状态 {used, max}
 * @returns {boolean} 是否追加成功
 */
function pushWithBudget(lines, text, state) {
    const t = estimateTokens(text);
    if (state.used + t > state.max) return false;
    lines.push(text);
    state.used += t;
    return true;
}

/**
 * 清理事件摘要（移除楼层标记）
 * @param {string} summary - 事件摘要
 * @returns {string} 清理后的摘要
 */
function cleanSummary(summary) {
    return String(summary || "")
        .replace(/\s*\(#\d+(?:-\d+)?\)\s*$/, "")
        .trim();
}

/**
 * 标准化字符串
 * @param {string} s - 输入字符串
 * @returns {string} 标准化后的字符串
 */
function normalize(s) {
    return String(s || '')
        .normalize('NFKC')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim()
        .toLowerCase();
}

/**
 * 收集 L0 的实体集合（用于背景证据实体过滤）
 * 使用 edges.s/edges.t。
 * @param {object} l0
 * @returns {Set<string>}
 */
function collectL0Entities(l0) {
    const atom = l0?.atom || {};
    const set = new Set();

    const add = (v) => {
        const n = normalize(v);
        if (n) set.add(n);
    };

    for (const e of (atom.edges || [])) {
        add(e?.s);
        add(e?.t);
    }

    return set;
}

/**
 * 背景证据是否保留（按焦点实体过滤）
 * 规则：
 * 1) 无焦点实体：保留，由语义相关性决定准入
 * 2) edges 或文本命中焦点实体：保留
 * 否则过滤。
 * @param {object} l0
 * @param {Set<string>} focusSet
 * @returns {boolean}
 */
function shouldKeepEvidenceL0(l0, focusSet) {
    if (!focusSet?.size) return true;

    const entities = collectL0Entities(l0);
    for (const f of focusSet) {
        if (entities.has(f)) return true;
    }

    // 兼容旧数据：semantic 文本包含焦点实体
    const textNorm = normalize(l0?.atom?.semantic || l0?.text || '');
    for (const f of focusSet) {
        if (f && textNorm.includes(f)) return true;
    }
    return false;
}

/**
 * 获取事件排序键
 * @param {object} event - 事件对象
 * @returns {number} 排序键
 */
function getEventSortKey(event) {
    const r = parseEventRange(event?.summary);
    if (r) return r.start;
    const m = String(event?.id || "").match(/evt-(\d+)/);
    return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
}

/**
 * 重新编号事件文本
 * @param {string} text - 原始文本
 * @param {number} newIndex - 新编号
 * @returns {string} 重新编号后的文本
 */
function renumberEventText(text, newIndex) {
    const s = String(text || "");
    return s.replace(/^(\s*)\d+(\.\s*(?:【)?)/, `$1${newIndex}$2`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 系统前导与后缀
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 构建系统前导文本
 * @returns {string} 前导文本
 */
function buildMemoryPromptText(memoryBody) {
    const templateRaw = String(
        getSummaryPanelConfig()?.prompts?.memoryTemplate || DEFAULT_MEMORY_PROMPT_TEMPLATE
    );
    const template = templateRaw.trim() || DEFAULT_MEMORY_PROMPT_TEMPLATE;
    if (template.includes("{$剧情记忆}")) {
        return template.replaceAll("{$剧情记忆}", memoryBody);
    }
    return `${template}\n${memoryBody}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// [Constraints] L3 Facts 过滤与格式化
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 获取已知角色集合
 * @param {object} store - 存储对象
 * @returns {Set<string>} 角色名称集合（标准化后）
 */
function getKnownCharacters(store) {
    const { name1, name2 } = getContext();
    const names = buildTrustedCharacters(store, { name1, name2 }) || new Set();
    // Keep name1 in known-character filtering domain to avoid behavior regression
    // for L3 subject filtering (lexicon exclusion and filtering semantics are different concerns).
    if (name1) names.add(normalize(name1));
    return names;
}

/**
 * 解析关系谓词中的目标
 * @param {string} predicate - 谓词
 * @returns {string|null} 目标名称
 */
/**
 * Build people dictionary for constraints display.
 * Primary source: selected event participants; fallback: focus characters.
 *
 * @param {object|null} recallResult
 * @param {string[]} focusCharacters
 * @returns {Map<string, string>} normalize(name) -> display name
 */
function buildConstraintPeopleDict(recallResult, focusCharacters = []) {
    const dict = new Map();
    const add = (raw) => {
        const display = String(raw || '').trim();
        const key = normalize(display);
        if (!display || !key) return;
        if (!dict.has(key)) dict.set(key, display);
    };

    const selectedEvents = recallResult?.events || [];
    for (const item of selectedEvents) {
        const participants = item?.event?.participants || [];
        for (const p of participants) add(p);
    }

    if (dict.size === 0) {
        for (const f of (focusCharacters || [])) add(f);
    }

    return dict;
}

/**
 * Group filtered constraints into people/world buckets.
 * @param {object[]} facts
 * @param {Map<string, string>} peopleDict
 * @returns {{ people: Map<string, object[]>, world: object[] }}
 */
function groupConstraintsForDisplay(facts, peopleDict) {
    const people = new Map();
    const world = [];

    for (const f of (facts || [])) {
        const subjectNorm = normalize(f?.s);
        const displayName = peopleDict.get(subjectNorm);
        if (displayName) {
            if (!people.has(displayName)) people.set(displayName, []);
            people.get(displayName).push(f);
        } else {
            world.push(f);
        }
    }

    return { people, world };
}

function formatConstraintLine(f, includeSubject = false) {
    const subject = String(f?.s || '').trim();
    const predicate = String(f?.p || '').trim();
    const object = String(f?.o || '').trim();
    const trendRaw = String(f?.trend || '').trim();
    const hasSince = f?.since !== undefined && f?.since !== null;
    const since = hasSince ? ` (#${f.since + 1})` : '';
    const trend = isRelationFact(f) && trendRaw ? ` [${trendRaw}]` : '';
    if (includeSubject) {
        return `- ${subject} ${predicate}: ${object}${trend}${since}`;
    }
    return `- ${predicate}: ${object}${trend}${since}`;
}

/**
 * Render grouped constraints into structured human-readable lines.
 * @param {{ people: Map<string, object[]>, world: object[] }} grouped
 * @returns {string[]}
 */
function formatConstraintsStructured(grouped, order = 'desc') {
    const lines = [];
    const people = grouped?.people || new Map();
    const world = grouped?.world || [];
    const sorter = order === 'asc'
        ? ((a, b) => (a.since || 0) - (b.since || 0))
        : ((a, b) => (b.since || 0) - (a.since || 0));

    if (people.size > 0) {
        lines.push('people:');
        for (const [name, facts] of people.entries()) {
            lines.push(`  ${name}:`);
            const sorted = [...facts].sort(sorter);
            for (const f of sorted) {
                lines.push(`    ${formatConstraintLine(f, false)}`);
            }
        }
    }

    if (world.length > 0) {
        lines.push('world:');
        const sortedWorld = [...world].sort(sorter);
        for (const f of sortedWorld) {
            lines.push(`  ${formatConstraintLine(f, true)}`);
        }
    }

    return lines;
}

function tryConsumeConstraintLineBudget(line, budgetState) {
    const cost = estimateTokens(line);
    if (budgetState.used + cost > budgetState.max) return false;
    budgetState.used += cost;
    return true;
}

function selectConstraintsByBudgetDesc(grouped, budgetState) {
    const selectedPeople = new Map();
    const selectedWorld = [];
    const people = grouped?.people || new Map();
    const world = grouped?.world || [];

    if (people.size > 0) {
        if (!tryConsumeConstraintLineBudget('people:', budgetState)) {
            return { people: selectedPeople, world: selectedWorld };
        }
        for (const [name, facts] of people.entries()) {
            const header = `  ${name}:`;
            if (!tryConsumeConstraintLineBudget(header, budgetState)) {
                return { people: selectedPeople, world: selectedWorld };
            }
            const picked = [];
            const sorted = [...facts].sort((a, b) => (b.since || 0) - (a.since || 0));
            for (const f of sorted) {
                const line = `    ${formatConstraintLine(f, false)}`;
                if (!tryConsumeConstraintLineBudget(line, budgetState)) {
                    return { people: selectedPeople, world: selectedWorld };
                }
                picked.push(f);
            }
            selectedPeople.set(name, picked);
        }
    }

    if (world.length > 0) {
        if (!tryConsumeConstraintLineBudget('world:', budgetState)) {
            return { people: selectedPeople, world: selectedWorld };
        }
        const sortedWorld = [...world].sort((a, b) => (b.since || 0) - (a.since || 0));
        for (const f of sortedWorld) {
            const line = `  ${formatConstraintLine(f, true)}`;
            if (!tryConsumeConstraintLineBudget(line, budgetState)) {
                return { people: selectedPeople, world: selectedWorld };
            }
            selectedWorld.push(f);
        }
    }

    return { people: selectedPeople, world: selectedWorld };
}

// ─────────────────────────────────────────────────────────────────────────────
// 格式化函数
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 格式化弧光行
 * @param {object} arc - 弧光对象
 * @returns {string} 格式化后的行
 */
function formatArcLine(arc) {
    const moments = (arc.moments || [])
        .map(m => (typeof m === "string" ? m : m.text))
        .filter(Boolean);

    if (moments.length) {
        return `- ${arc.name}：${moments.join(" → ")}`;
    }
    return `- ${arc.name}：${arc.trajectory}`;
}

/**
 * 从 L0 获取展示文本
 *
 * v7: L0 的 semantic 字段已是纯自然语言场景摘要（60-100字），直接使用。
 *
 * @param {object} l0 - L0 对象
 * @returns {string} 场景描述文本
 */
function buildL0DisplayText(l0) {
    const atom = l0.atom || {};
    return String(atom.semantic || l0.text || '').trim() || '（未知锚点）';
}

/**
 * 格式化 L1 chunk 行
 * @param {object} chunk - L1 chunk 对象
 * @param {boolean} isUser - 是否为 USER 侧
 * @returns {string} 格式化后的行
 */
function formatL1Line(chunk, isUser) {
    const { name1, name2 } = getContext();
    const speaker = chunk.isUser ? (name1 || "用户") : (chunk.speaker || name2 || "角色");
    const text = String(chunk.text || "").trim();
    const symbol = isUser ? "┌" : "›";
    return `    ${symbol} #${chunk.floor + 1} [${speaker}] ${text}`;
}

/**
 * 格式化因果事件行
 * @param {object} causalItem - 因果事件项
 * @returns {string} 格式化后的行
 */
function formatCausalEventLine(causalItem) {
    const ev = causalItem?.event || {};
    const depth = Math.max(1, Math.min(9, causalItem?._causalDepth || 1));
    const indent = "  │" + "  ".repeat(depth - 1);
    const prefix = `${indent}├─ 前因`;

    const time = ev.timeLabel ? `【${ev.timeLabel}】` : "";
    const people = (ev.participants || []).join(" / ");
    const summary = cleanSummary(ev.summary);

    const r = parseEventRange(ev.summary);
    const floorHint = r ? `(#${r.start + 1}${r.end !== r.start ? `-${r.end + 1}` : ""})` : "";

    const lines = [];
    lines.push(`${prefix}${time}${people ? ` ${people}` : ""}`);
    const body = `${summary}${floorHint ? ` ${floorHint}` : ""}`.trim();
    lines.push(`${indent}  ${body}`);

    return lines.join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// L0 按楼层分组
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 将 L0 列表按楼层分组
 * @param {object[]} l0List - L0 对象列表
 * @returns {Map<number, object[]>} floor → L0 数组
 */
function groupL0ByFloor(l0List) {
    const map = new Map();
    for (const l0 of l0List) {
        const floor = l0.floor;
        if (!map.has(floor)) {
            map.set(floor, []);
        }
        map.get(floor).push(l0);
    }
    return map;
}

/**
 * Get all available L0 atoms in recent window and normalize to evidence shape.
 * @param {number} recentStart
 * @param {number} recentEnd
 * @returns {object[]}
 */
function getRecentWindowL0Atoms(recentStart, recentEnd) {
    if (!Number.isFinite(recentStart) || !Number.isFinite(recentEnd) || recentEnd < recentStart) return [];
    const atoms = getStateAtoms() || [];
    const out = [];
    for (const atom of atoms) {
        const floor = atom?.floor;
        const atomId = atom?.atomId;
        const semantic = String(atom?.semantic || '').trim();
        if (!Number.isFinite(floor)) continue;
        if (floor < recentStart || floor > recentEnd) continue;
        if (!atomId || !semantic) continue;
        out.push({
            id: atomId,
            floor,
            atom,
            similarity: 0,
            rerankScore: 0,
        });
    }
    return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// EvidenceGroup（per-floor：N个L0 + N个已入选L1）
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {object} EvidenceGroup
 * @property {number} floor - 楼层号
 * @property {object[]} l0Atoms - 该楼层所有被选中的 L0
 * @property {object[]} l1Chunks - 该楼层已入选的 L1 原文
 * @property {number} totalTokens - 整组 token 估算
 */

/**
 * 为一个楼层构建证据组
 *
 * 同楼层的 L0/L1 共享一个时间位置，允许仅有 L1 的证据组。
 *
 * @param {number} floor - 楼层号
 * @param {object[]} l0AtomsForFloor - 该楼层所有被选中的 L0
 * @param {object[]} l1ChunksForFloor - 该楼层已入选的 L1 原文
 * @returns {EvidenceGroup}
 */
function buildEvidenceGroup(floor, l0AtomsForFloor = [], l1ChunksForFloor = []) {
    const l1Chunks = [...new Map(
        (l1ChunksForFloor || [])
            .filter(chunk => chunk?.chunkId && String(chunk?.text || '').trim())
            .map(chunk => [chunk.chunkId, chunk])
    ).values()].sort((left, right) => (
        Number(left.floor) - Number(right.floor)
        || Number(left.chunkIdx || 0) - Number(right.chunkIdx || 0)
    ));

    // 计算整组 token 开销
    let totalTokens = 0;

    // 所有 L0 的显示文本
    for (const l0 of l0AtomsForFloor) {
        totalTokens += estimateTokens(buildL0DisplayText(l0));
    }
    // 固定开销：楼层前缀、📌 标记、分号等
    totalTokens += 10;

    for (const chunk of l1Chunks) {
        totalTokens += estimateTokens(formatL1Line(chunk, chunk.isUser === true));
    }

    return { floor, l0Atoms: l0AtomsForFloor, l1Chunks, totalTokens };
}

/**
 * Build recent-evidence group (L0 only, no L1 attachment).
 * @param {number} floor
 * @param {object[]} l0AtomsForFloor
 * @returns {object}
 */
function buildRecentEvidenceGroup(floor, l0AtomsForFloor) {
    let totalTokens = 0;
    for (const l0 of l0AtomsForFloor) {
        totalTokens += estimateTokens(buildL0DisplayText(l0));
    }
    totalTokens += 10;
    return { floor, l0Atoms: l0AtomsForFloor, l1Chunks: [], totalTokens };
}

/**
 * 格式化一个证据组为文本行数组
 *
 * 短行模式（拼接后 ≤ 120 字）：
 *   › #500 [📌] 小林整理会议记录；小周补充行动项；两人确认下周安排
 *     ┌ #499 [小周] ...
 *     › #500 [角色] ...
 *
 * 长行模式（拼接后 > 120 字）：
 *   › #500 [📌] 小林在图书馆归档旧资料
 *   │      小周核对目录并修正编号
 *   │      两人讨论借阅规则并更新说明
 *     ┌ #499 [小周] ...
 *     › #500 [角色] ...
 *
 * @param {EvidenceGroup} group - 证据组
 * @returns {string[]} 文本行数组
 */
function formatEvidenceGroup(group) {
    const displayTexts = group.l0Atoms.map(l0 => buildL0DisplayText(l0));

    const lines = [];

    if (displayTexts.length) {
        const joined = displayTexts.join('；');

        if (joined.length <= L0_JOINED_MAX_LENGTH) {
            lines.push(`  › #${group.floor + 1} [📌] ${joined}`);
        } else {
            lines.push(`  › #${group.floor + 1} [📌] ${displayTexts[0]}`);
            for (let i = 1; i < displayTexts.length; i++) {
                lines.push(`  │      ${displayTexts[i]}`);
            }
        }
    }

    for (const chunk of group.l1Chunks || []) {
        lines.push(formatL1Line(chunk, chunk.isUser === true));
    }

    return lines;
}

// ─────────────────────────────────────────────────────────────────────────────
// 事件证据：单条入选（按相关性），楼层分组只负责最终时间线呈现
// ─────────────────────────────────────────────────────────────────────────────
//
// 旧结构的两处错误已在此修正：
// 1. 收集阶段整楼 claim、预算阶段整楼装箱：超预算的组被丢弃后其中的证据
//    既进不了 DIRECT，也无法再挂到其他事件（claimed-but-dropped）。
// 2. 相关性准入单位是"楼"，不是"证据"：同楼层低相关证据可以蹭高相关证据
//    入选，反之高相关证据可能被同楼大块拖死。
// 现在：枚举 → 有界时间保护通道 → 普通相关性队列 → 入选后才写
// usedEvidenceIds → 按事件归属与楼层分组，仅用于按时间线呈现。

const DIRECT_EVIDENCE_FLOOR_OVERHEAD_TOKENS = 10;

function directEvidenceItemTokens(item) {
    if (item.kind === 'l0') {
        return estimateTokens(buildL0DisplayText(item.l0));
    }
    return estimateTokens(formatL1Line(item.chunk, item.chunk.isUser === true));
}

/**
 * 枚举所有可挂到已入选 DIRECT 事件的证据条目。
 * 归属（owner）= candidateRank 最小且楼层范围包含该条目的事件；
 * id 级去重，跨事件不重复枚举。
 */
function enumerateDirectEvidenceItems(
    selectedInPackingOrder,
    l0Selected,
    directL1Candidates,
    relevance,
) {
    const ownedRanges = selectedInPackingOrder
        .map(selected => {
            const range = parseEventRange(selected.event?.summary);
            return range ? { selected, range } : null;
        })
        .filter(Boolean);

    const findOwner = floor => (
        ownedRanges.find(({ range }) => floor >= range.start && floor <= range.end)?.selected || null
    );

    const l0Items = [];
    const seenL0Ids = new Set();
    for (const l0 of l0Selected || []) {
        const owner = findOwner(l0.floor);
        if (!owner) continue;
        const id = `l0:${l0.id}`;
        if (seenL0Ids.has(id)) continue;
        seenL0Ids.add(id);
        l0Items.push({
            kind: 'l0',
            id,
            floor: l0.floor,
            l0,
            owner,
            score: Number(relevance.l0ByFloor?.get(l0.floor) || 0),
            temporal: false,
        });
    }

    // fallback 通道（direct evidence 失败回退）的 L1 与其父 L0 捆绑：
    // 只有父楼层确实入选了 L0 时才允许该 L1 参与入选。
    const fallbackItems = [];
    const l1Items = [];
    const seenL1Ids = new Set();
    for (const chunk of directL1Candidates || []) {
        if (!chunk?.chunkId) continue;
        const id = `l1:${chunk.chunkId}`;
        if (seenL1Ids.has(id)) continue;

        const fallbackParentFloor = Number.isInteger(chunk?._directEvidenceFallbackParentFloor)
            ? chunk._directEvidenceFallbackParentFloor
            : null;
        const itemFloor = fallbackParentFloor ?? Number(chunk.floor);
        if (!Number.isInteger(itemFloor)) continue;
        const owner = findOwner(itemFloor);
        if (!owner) continue;
        seenL1Ids.add(id);

        const item = {
            kind: 'l1',
            id,
            floor: itemFloor,
            chunk,
            owner,
            score: Number(relevance.l1ByChunkId?.get(chunk.chunkId) || 0),
            temporal: chunk._directEvidenceTemporalCarrier === true,
            ordinaryEligible: chunk._directEvidencePassedMinScore !== false,
            fallbackParentFloor,
        };
        if (fallbackParentFloor != null) fallbackItems.push(item);
        else l1Items.push(item);
    }

    return { l0Items, l1Items, fallbackItems };
}

/**
 * 把已入选条目按事件归属组装成按楼层排序的证据组（呈现层）。
 */
function attachAdmittedEvidenceToEvents(admittedItems) {
    for (const item of admittedItems || []) {
        if (!item.owner.evidenceGroups) item.owner.evidenceGroups = [];
    }

    const byOwner = new Map();
    for (const item of admittedItems || []) {
        if (!byOwner.has(item.owner)) byOwner.set(item.owner, new Map());
        const floors = byOwner.get(item.owner);
        if (!floors.has(item.floor)) floors.set(item.floor, { l0Atoms: [], l1Chunks: [] });
        const bucket = floors.get(item.floor);
        if (item.kind === 'l0') bucket.l0Atoms.push(item.l0);
        else bucket.l1Chunks.push(item.chunk);
    }

    for (const [owner, floors] of byOwner) {
        const groups = [];
        for (const [floor, bucket] of floors) {
            const group = buildEvidenceGroup(floor, bucket.l0Atoms, bucket.l1Chunks);
            group.temporal = bucket.l1Chunks.some(chunk => chunk._directEvidenceTemporalCarrier === true);
            groups.push(group);
        }
        groups.sort((left, right) => left.floor - right.floor);
        owner.evidenceGroups = groups;
    }
}

function markEvidenceGroupUsed(group, usedEvidenceIds) {
    for (const l0 of group?.l0Atoms || []) usedEvidenceIds.add(`l0:${l0.id}`);
    for (const chunk of group?.l1Chunks || []) usedEvidenceIds.add(`l1:${chunk.chunkId}`);
}

function l1FallbackFromPairs(l1ByFloor) {
    const byId = new Map();
    for (const [parentFloor, pair] of l1ByFloor || []) {
        const normalizedParentFloor = Number(parentFloor);
        if (!Number.isInteger(normalizedParentFloor)) continue;
        for (const chunk of [pair?.userTop1, pair?.aiTop1]) {
            if (!chunk?.chunkId || byId.has(chunk.chunkId)) continue;
            byId.set(chunk.chunkId, {
                ...chunk,
                _directEvidenceFallbackParentFloor: normalizedParentFloor,
            });
        }
    }
    return [...byId.values()];
}

function unusedL1PairChunks(l1ByFloor, floor, usedEvidenceIds) {
    const pair = l1ByFloor.get(floor);
    return [pair?.userTop1, pair?.aiTop1].filter(chunk => (
        chunk?.chunkId && !usedEvidenceIds.has(`l1:${chunk.chunkId}`)
    ));
}

// ─────────────────────────────────────────────────────────────────────────────
// 事件格式化（L2 → EvidenceGroup 层级）
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 格式化事件（含 EvidenceGroup 证据）
 * @param {object} eventItem - 事件召回项
 * @param {number} idx - 编号
 * @param {EvidenceGroup[]} evidenceGroups - 该事件的证据组
 * @param {Map<string, object>} causalById - 因果事件索引
 * @returns {string} 格式化后的文本
 */
function formatEventWithEvidence(eventItem, idx, evidenceGroups, causalById) {
    const ev = eventItem?.event || eventItem || {};
    const time = ev.timeLabel || "";
    const title = String(ev.title || "").trim();
    const people = (ev.participants || []).join(" / ").trim();
    const summary = cleanSummary(ev.summary);

    const displayTitle = title || people || ev.id || "事件";
    const header = time ? `${idx}.【${time}】${displayTitle}` : `${idx}. ${displayTitle}`;

    const lines = [header];
    if (people && displayTitle !== people) lines.push(`  ${people}`);
    lines.push(`  ${summary}`);

    // 因果链
    for (const cid of ev.causedBy || []) {
        const c = causalById?.get(cid);
        if (c) lines.push(formatCausalEventLine(c));
    }

    // EvidenceGroup 证据
    for (const group of evidenceGroups) {
        lines.push(...formatEvidenceGroup(group));
    }

    return lines.join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// 非向量模式
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 构建非向量模式注入文本
 * @param {object} store - 存储对象
 * @returns {string} 注入文本
 */
function buildNonVectorPrompt(store) {
    const data = store.json || {};
    const sections = [];

    // [Constraints] L3 Facts (structured: people/world)
    const allFacts = getFacts().filter(f => !f.retracted);
    const nonVectorPeopleDict = buildConstraintPeopleDict(
        { events: data.events || [] },
        []
    );
    const nonVectorFocus = nonVectorPeopleDict.size > 0
        ? [...nonVectorPeopleDict.values()]
        : [...getKnownCharacters(store)];
    const nonVectorKnownCharacters = getKnownCharacters(store);
    const filteredConstraints = filterConstraintsByRelevance(
        allFacts,
        nonVectorFocus,
        nonVectorKnownCharacters,
        getContext().name1,
    );
    const groupedConstraints = groupConstraintsForDisplay(filteredConstraints, nonVectorPeopleDict);
    const constraintLines = formatConstraintsStructured(groupedConstraints, 'asc');

    if (constraintLines.length) {
        sections.push(`[定了的事] 已确立的事实\n${constraintLines.join("\n")}`);
    }

    // [Events] L2 Events
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

    // [Arcs]
    if (data.arcs?.length) {
        const lines = data.arcs.map(formatArcLine);
        sections.push(`[人物弧光]\n${lines.join("\n")}`);
    }

    if (!sections.length) return "";

    return buildMemoryPromptText(sections.join("\n\n"));
}

/**
 * 构建非向量模式注入文本（公开接口）
 * @returns {string} 注入文本
 */
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

    const cfg = getSummaryPanelConfig();
    if (cfg.trigger?.wrapperHead) text = cfg.trigger.wrapperHead + "\n" + text;
    if (cfg.trigger?.wrapperTail) text = text + "\n" + cfg.trigger.wrapperTail;

    return text;
}

// ─────────────────────────────────────────────────────────────────────────────
// 向量模式：预算装配
// ─────────────────────────────────────────────────────────────────────────────

function createEvidenceTraceRecorder(causalById) {
    const value = { final: [], prompt: [] };
    const units = { final: new Map(), prompt: new Map() };
    const anonymousIds = new WeakMap();
    let nextAnonymousId = 1;

    const objectUnitId = (prefix, item) => {
        const persistentId = String(item?.id || '').trim();
        if (persistentId) return `${prefix}:${persistentId}`;
        if (item && typeof item === 'object') {
            if (!anonymousIds.has(item)) anonymousIds.set(item, nextAnonymousId++);
            return `${prefix}:anonymous-${anonymousIds.get(item)}`;
        }
        return `${prefix}:anonymous-${nextAnonymousId++}`;
    };
    const addFloors = (target, unitId, rawFloors, source, score = null) => {
        if (!units[target]) return;
        const normalizedFloors = [...new Set((rawFloors || [])
            .map(Number)
            .filter(floor => Number.isInteger(floor) && floor >= 0))];
        if (!normalizedFloors.length) return;

        let unit = units[target].get(unitId);
        if (!unit) {
            unit = { rank: units[target].size + 1, floors: new Set() };
            units[target].set(unitId, unit);
        }
        for (const normalizedFloor of normalizedFloors) {
            if (unit.floors.has(normalizedFloor)) continue;
            unit.floors.add(normalizedFloor);
            value[target].push({
                floor: normalizedFloor,
                rank: unit.rank,
                unitId,
                score: Number.isFinite(score) ? score : null,
                source,
            });
        }
    };
    const floor = (target, rawFloor, source, score = null, unitId = null) => {
        const normalizedFloor = Number(rawFloor);
        if (!Number.isInteger(normalizedFloor) || normalizedFloor < 0) return;
        addFloors(target, unitId || `${source}:${normalizedFloor}`, [normalizedFloor], source, score);
    };
    const eventUnitId = item => objectUnitId('event', item);
    const event = (target, item, source, score = null, unitId = eventUnitId(item)) => {
        const range = parseEventRange(item?.summary);
        if (!range) return;
        const eventFloors = [];
        for (let current = range.start; current <= range.end; current++) {
            eventFloors.push(current);
        }
        addFloors(target, unitId, eventFloors, source, score);
    };
    const causal = (target, item) => {
        const unitId = eventUnitId(item);
        for (const eventId of (item?.causedBy || [])) {
            const cause = causalById?.get(eventId);
            event(target, cause?.event, 'causal', cause?.similarity ?? null, unitId);
        }
    };
    const eventEvidence = (target, item, rawFloor) => {
        floor(target, rawFloor, 'event-evidence', null, eventUnitId(item));
    };
    const fact = (target, item) => {
        floor(
            target,
            item?.since ?? item?._addedAt,
            'constraint',
            null,
            objectUnitId('constraint', item),
        );
    };
    const arc = (target, item) => {
        const floors = [];
        for (const moment of (item?.moments || [])) {
            if (typeof moment !== 'object' || moment == null) continue;
            if (!Number.isInteger(Number(moment._addedAt))) continue;
            floors.push(moment._addedAt);
        }
        if (!floors.length) floors.push(item?._addedAt);
        addFloors(target, objectUnitId('arc', item), floors, 'arc');
    };
    return { value, floor, event, causal, eventEvidence, fact, arc };
}

function factsInBudgetOrder(grouped) {
    const ordered = [];
    for (const facts of (grouped?.people || new Map()).values()) {
        ordered.push(...[...facts].sort((a, b) => (b.since || 0) - (a.since || 0)));
    }
    ordered.push(...[...(grouped?.world || [])].sort((a, b) => (b.since || 0) - (a.since || 0)));
    return ordered;
}

/**
 * 构建向量模式注入文本
 * @param {object} store - 存储对象
 * @param {object} recallResult - 召回结果
 * @param {Map<string, object>} causalById - 因果事件索引
 * @param {string[]} focusCharacters - 焦点人物
 * @param {object} meta - 元数据
 * @param {object} metrics - 指标对象
 * @param {{ captureEvidenceTrace?: boolean }} options - replay-only observation options
 * @returns {Promise<{promptText: string, injectionStats: object, metrics: object, evidenceTrace?: object}>}
 */
async function buildVectorPrompt(store, recallResult, causalById, focusCharacters, meta, metrics, options = {}) {
    const T_Start = performance.now();
    let deferredDirectEvidenceContext = recallResult?.directEvidenceContext || null;
    try {

    const data = store.json || {};
    const total = { used: 0, max: SHARED_POOL_MAX };
    const vectorConfig = getVectorConfig() || {};
    const summarizedEvidenceBudgetMax = vectorConfig.summarizedEvidenceBudget;
    const summarizedEvidenceBudget = { used: 0, max: summarizedEvidenceBudgetMax };
    const temporalEvidenceProtectionBudget = {
        used: 0,
        max: getTemporalProtectionLimit(
            summarizedEvidenceBudgetMax,
            TEMPORAL_PROTECTION_POLICY.maxEvidenceBudgetShare,
        ),
    };

    // 从 recallResult 解构
    const l0Selected = recallResult?.l0Selected || [];
    const l1ByFloor = recallResult?.l1ByFloor || new Map();
    const evidenceTrace = options.captureEvidenceTrace ? createEvidenceTraceRecorder(causalById) : null;

    // 装配结果
    const assembled = {
        constraints: { lines: [], tokens: 0 },
        directEvents: { lines: [], tokens: 0 },
        relatedEvents: { lines: [], tokens: 0 },
        distantEvidence: { lines: [], tokens: 0 },
        recentEvidence: { lines: [], tokens: 0 },
        arcs: { lines: [], tokens: 0 },
    };

    // 注入统计
    const injectionStats = {
        budget: { max: SHARED_POOL_MAX + summarizedEvidenceBudgetMax + UNSUMMARIZED_EVIDENCE_MAX, used: 0 },
        constraint: { count: 0, tokens: 0, filtered: 0 },
        arc: { count: 0, tokens: 0 },
        event: { selected: 0, tokens: 0 },
        directEvidence: { units: 0, l0: 0, l1: 0, tokens: 0 },
        distantEvidence: { units: 0, tokens: 0 },
        recentEvidence: { units: 0, tokens: 0 },
    };

    // DIRECT、远期与近期证据共享同一去重集合，L0 与 L1 都有稳定身份。
    const usedEvidenceIds = new Set();

    // ═══════════════════════════════════════════════════════════════════════
    // [Constraints] L3 Facts → 世界约束
    // ═══════════════════════════════════════════════════════════════════════

    const T_Constraint_Start = performance.now();

    const allFacts = getFacts();
    const knownCharacters = getKnownCharacters(store);
    const filteredConstraints = filterConstraintsByRelevance(
        allFacts,
        focusCharacters,
        knownCharacters,
        getContext().name1,
    );
    const constraintPeopleDict = buildConstraintPeopleDict(recallResult, focusCharacters);
    const groupedConstraints = groupConstraintsForDisplay(filteredConstraints, constraintPeopleDict);
    if (evidenceTrace) {
        for (const fact of factsInBudgetOrder(groupedConstraints)) evidenceTrace.fact('final', fact);
    }

    if (metrics) {
        metrics.constraint.total = allFacts.length;
        metrics.constraint.filtered = allFacts.length - filteredConstraints.length;
    }

    const constraintBudget = { used: 0, max: Math.min(CONSTRAINT_MAX, total.max - total.used) };
    const groupedSelectedConstraints = selectConstraintsByBudgetDesc(groupedConstraints, constraintBudget);
    if (evidenceTrace) {
        for (const fact of factsInBudgetOrder(groupedSelectedConstraints)) evidenceTrace.fact('prompt', fact);
    }
    const injectedConstraintFacts = (() => {
        let count = groupedSelectedConstraints.world.length;
        for (const facts of groupedSelectedConstraints.people.values()) {
            count += facts.length;
        }
        return count;
    })();
    const constraintLines = formatConstraintsStructured(groupedSelectedConstraints, 'asc');

    if (constraintLines.length) {
        assembled.constraints.lines.push(...constraintLines);
        assembled.constraints.tokens = constraintBudget.used;
        total.used += constraintBudget.used;
        injectionStats.constraint.count = assembled.constraints.lines.length;
        injectionStats.constraint.tokens = constraintBudget.used;
        injectionStats.constraint.filtered = allFacts.length - filteredConstraints.length;

        if (metrics) {
            metrics.constraint.injected = injectedConstraintFacts;
            metrics.constraint.tokens = constraintBudget.used;
            metrics.constraint.samples = assembled.constraints.lines.slice(0, 3).map(line =>
                line.length > 60 ? line.slice(0, 60) + '...' : line
            );
            metrics.timing.constraintFilter = Math.round(performance.now() - T_Constraint_Start);
        }
    } else if (metrics) {
        metrics.timing.constraintFilter = Math.round(performance.now() - T_Constraint_Start);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // [Arcs] 人物弧光
    // ═══════════════════════════════════════════════════════════════════════

    if (evidenceTrace && data.arcs?.length) {
        const { name1 } = getContext();
        const relevant = new Set(
            [String(name1 || "").trim(), ...(focusCharacters || [])]
                .map(s => String(s || "").trim())
                .filter(Boolean)
        );
        for (const arc of (data.arcs || [])) {
            const name = String(arc?.name || "").trim();
            if (name && relevant.has(name)) evidenceTrace.arc('final', arc);
        }
    }

    if (data.arcs?.length && total.used < total.max) {
        const { name1 } = getContext();
        const userName = String(name1 || "").trim();

        const relevant = new Set(
            [userName, ...(focusCharacters || [])]
                .map(s => String(s || "").trim())
                .filter(Boolean)
        );

        const filteredArcs = (data.arcs || []).filter(a => {
            const n = String(a?.name || "").trim();
            return n && relevant.has(n);
        });
        if (filteredArcs.length) {
            const arcBudget = { used: 0, max: Math.min(ARCS_MAX, total.max - total.used) };
            for (const a of filteredArcs) {
                const line = formatArcLine(a);
                if (!pushWithBudget(assembled.arcs.lines, line, arcBudget)) break;
                if (evidenceTrace) evidenceTrace.arc('prompt', a);
            }
            assembled.arcs.tokens = arcBudget.used;
            total.used += arcBudget.used;
            injectionStats.arc.count = assembled.arcs.lines.length;
            injectionStats.arc.tokens = arcBudget.used;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // [Events] L2 Events → 直接命中 + 相似命中 + 因果链 + EvidenceGroup
    // ═══════════════════════════════════════════════════════════════════════
    const candidates = (recallResult?.events || []).filter(e => e?.event?.summary);
    const eventRankingScore = item => Number.isFinite(item?._eventRerankScore)
        ? item._eventRerankScore
        : Number(item?.similarity || 0);
    const eventTraceSource = item => {
        if (item?._recallType === 'DIRECT') return 'direct-event';
        if (item?._recallType === 'CAUSAL') return 'causal-event';
        return 'related-event';
    };
    if (evidenceTrace) {
        for (const item of candidates) {
            evidenceTrace.event('final', item.event, eventTraceSource(item), eventRankingScore(item));
            evidenceTrace.causal('final', item.event);
        }
    }
    const eventBudget = { used: 0, max: Math.min(EVENT_BUDGET_MAX, total.max - total.used) };
    const relatedBudget = { used: 0, max: RELATED_EVENT_MAX };
    const selectedDirect = [];
    const selectedRelated = [];

    // L2 时间保护贯穿最终 Prompt：每个时间楼层只取普通相关性排名最高
    // 的事件，全局最多 5 个。超额事件留在普通队列，不放宽任何预算。
    const eventTemporalFloors = (recallResult?.eventTemporalFloors || []).filter(Number.isInteger);
    let temporalProtectedCount = 0;
    let temporalDroppedCount = 0;
    const temporalEventPacking = buildTemporalEventPackingOrder(candidates, eventTemporalFloors);
    const eventPackingOrder = temporalEventPacking.order;

    let eventBudgetRejected = 0;
    let eventRelatedBudgetRejected = 0;
    for (let packingIndex = 0; packingIndex < eventPackingOrder.length; packingIndex++) {
        const { candidateRank, temporal } = eventPackingOrder[packingIndex];
        const e = candidates[candidateRank];

        if (total.used >= total.max || eventBudget.used >= eventBudget.max) {
            if (temporal) {
                temporalDroppedCount++;
                eventBudgetRejected++;
                continue;
            }
            eventBudgetRejected += eventPackingOrder.length - packingIndex;
            break;
        }

        const isDirect = e._recallType === "DIRECT";
        if (!isDirect && relatedBudget.used >= relatedBudget.max) {
            if (temporal) temporalDroppedCount++;
            eventRelatedBudgetRejected++;
            continue;
        }

        const text = formatEventWithEvidence(e, 0, [], causalById);
        const cost = estimateTokens(text);
        const fitEventBudget = eventBudget.used + cost <= eventBudget.max;
        const fitRelatedBudget = isDirect || (relatedBudget.used + cost <= relatedBudget.max);

        if (total.used + cost > total.max || !fitEventBudget || !fitRelatedBudget) {
            if (temporal) temporalDroppedCount++;
            if (total.used + cost > total.max || !fitEventBudget) {
                eventBudgetRejected++;
                // A malformed/oversized protected event must not prevent a
                // later protected event from using the same protection path.
                if (temporal) continue;
                eventBudgetRejected += eventPackingOrder.length - packingIndex - 1;
                break;
            }
            eventRelatedBudgetRejected++;
            continue;
        }

        if (temporal) temporalProtectedCount++;
        const selected = {
            event: e.event,
            text,
            evidenceGroups: [],
            candidateRank,
        };
        (isDirect ? selectedDirect : selectedRelated).push(selected);

        injectionStats.event.selected++;
        injectionStats.event.tokens += cost;
        total.used += cost;
        eventBudget.used += cost;
        if (!isDirect) relatedBudget.used += cost;
    }

    if (metrics) {
        // 时间保护与预算截断风险统计：供"修复前数据可用于排障"的口径。
        metrics.event.temporalFloorsProtected = eventTemporalFloors.length;
        metrics.event.temporalProtected = temporalProtectedCount;
        metrics.event.temporalDropped = temporalDroppedCount;
        metrics.event.temporalWinners = temporalEventPacking.winnerCount;
        metrics.event.temporalProtectionCap = TEMPORAL_PROTECTION_POLICY.maxProtectedEvents;
        metrics.event.temporalOverflow = temporalEventPacking.overflowCount;
        metrics.event.budgetTruncated = {
            candidates: candidates.length,
            selected: injectionStats.event.selected,
            dropped: Math.max(0, candidates.length - injectionStats.event.selected),
            budgetRejected: eventBudgetRejected,
            relatedBudgetRejected: eventRelatedBudgetRejected,
        };
    }

    let directEvidenceL1 = Array.isArray(recallResult?.directEvidenceL1)
        ? recallResult.directEvidenceL1
        : null;
    let directEvidenceStatus = String(recallResult?.directEvidenceStatus || '');
    const selectedEvidenceOwners = [...selectedDirect, ...selectedRelated]
        .filter(selected => candidates[selected.candidateRank]?._evidenceEligible === true)
        .sort((left, right) => left.candidateRank - right.candidateRank);
    if (!directEvidenceL1 && recallResult?.directEvidenceContext) {
        const selectedEvidenceHits = selectedEvidenceOwners
            .map(selected => candidates[selected.candidateRank]);
        const result = await hydrateSelectedDirectEvidence(
            selectedEvidenceHits,
            recallResult.directEvidenceContext,
            metrics,
        );
        directEvidenceL1 = result.items;
        directEvidenceStatus = result.status;
        recallResult.directEvidenceL1 = directEvidenceL1;
        recallResult.directEvidenceStatus = directEvidenceStatus;
        recallResult.directEvidenceContext = null;
        deferredDirectEvidenceContext = null;
    }
    const directL1Candidates = directEvidenceStatus === 'applied'
        ? (directEvidenceL1 || [])
        : l1FallbackFromPairs(l1ByFloor);
    const directEvidenceRelevance = {
        l0ByFloor: buildRankRelevance(l0Selected, l0 => l0.floor),
        l1ByChunkId: directEvidenceStatus === 'applied'
            ? buildRankRelevance(directL1Candidates, chunk => chunk.chunkId)
            : new Map(),
    };

    // ── 单条证据入选 ──
    // 1) 枚举可挂到已入选 DIRECT 事件的 L0/L1 条目（id 级去重，归属第一个
    //    候选序事件）；2) 时间保护通道每层最多一条，且最多占实际证据池 40%；
    //    超额项撤销特权后回普通相关性队列；3) 入选后才写 usedEvidenceIds；
    //    4) 按事件/楼层分组仅供时间线呈现。
    const enumeration = enumerateDirectEvidenceItems(
        selectedEvidenceOwners,
        l0Selected,
        directL1Candidates,
        directEvidenceRelevance,
    );
    if (evidenceTrace) {
        for (const item of [...enumeration.l0Items, ...enumeration.l1Items, ...enumeration.fallbackItems]) {
            evidenceTrace.eventEvidence('final', item.owner.event, item.floor);
        }
    }

    const admittedEvidenceFloors = new Set();
    const evidenceAdmissionOptions = {
        admittedFloors: admittedEvidenceFloors,
        getTokenCost: directEvidenceItemTokens,
        floorOverheadTokens: DIRECT_EVIDENCE_FLOOR_OVERHEAD_TOKENS,
        protectedBudget: temporalEvidenceProtectionBudget,
    };
    const admittedItems = admitDirectEvidenceItems(
        [...enumeration.l0Items, ...enumeration.l1Items],
        summarizedEvidenceBudget,
        evidenceAdmissionOptions,
    );
    // fallback L1 与父 L0 捆绑：只有父楼层已入选 L0 才能入选
    const admittedFallbackItems = admitDirectEvidenceItems(
        enumeration.fallbackItems.filter(item => (
            admittedItems.some(admitted => admitted.kind === 'l0' && admitted.floor === item.floor)
        )),
        summarizedEvidenceBudget,
        evidenceAdmissionOptions,
    );

    const allAdmittedItems = [...admittedItems, ...admittedFallbackItems];
    for (const item of allAdmittedItems) {
        usedEvidenceIds.add(item.id);
        if (evidenceTrace) evidenceTrace.eventEvidence('prompt', item.owner.event, item.floor);
    }

    attachAdmittedEvidenceToEvents(allAdmittedItems);
    injectionStats.directEvidence.units = allAdmittedItems.reduce(
        (floors, item) => {
            floors.add(`${item.owner.candidateRank}:${item.floor}`);
            return floors;
        },
        new Set(),
    ).size;
    injectionStats.directEvidence.l0 = allAdmittedItems.filter(item => item.kind === 'l0').length;
    injectionStats.directEvidence.l1 = allAdmittedItems.filter(item => item.kind === 'l1').length;
    const directEvidenceEnumeratedCount = enumeration.l0Items.length
        + enumeration.l1Items.length
        + enumeration.fallbackItems.length;
    const directEvidenceTemporalProtectedItems = allAdmittedItems.filter(item => item.temporalProtected === true);

    for (const selected of [...selectedDirect, ...selectedRelated]) {
        selected.evidenceGroups = selected.evidenceGroups || [];
        const eventItem = candidates[selected.candidateRank];
        selected.text = formatEventWithEvidence(eventItem, 0, selected.evidenceGroups, causalById);
    }
    injectionStats.directEvidence.tokens = summarizedEvidenceBudget.used;
    const summarizedBudgetUsedByDirectEvidence = summarizedEvidenceBudget.used;
    // 该 ledger 在实际入选时计费，包含首次出现楼层的标题开销。
    const directEvidenceTemporalProtectedTokens = temporalEvidenceProtectionBudget.used;
    if (metrics?.evidence) {
        metrics.evidence.directEvidencePromptGroups = injectionStats.directEvidence.units;
        metrics.evidence.directEvidencePromptItems = injectionStats.directEvidence.l0 + injectionStats.directEvidence.l1;
        metrics.evidence.directEvidencePromptTokens = summarizedEvidenceBudget.used;
        // 单条入选后的枚举/入选/被预算跳过计数；claimed-but-dropped 在该
        // 结构下不可再现，任何丢弃都来自预算且会计入 skippedByBudget。
        metrics.evidence.directEvidenceEnumerated = directEvidenceEnumeratedCount;
        metrics.evidence.directEvidenceAdmitted = allAdmittedItems.length;
        metrics.evidence.directEvidenceSkippedByBudget = Math.max(
            0,
            directEvidenceEnumeratedCount - allAdmittedItems.length,
        );
        // 时间保护占用独立统计：用于观察时间命中是否挤压非时间证据。
        metrics.evidence.directEvidenceTemporalProtectedItems = directEvidenceTemporalProtectedItems.length;
        metrics.evidence.directEvidenceTemporalProtectedTokens = directEvidenceTemporalProtectedTokens;
        metrics.evidence.directEvidenceTemporalProtectionBudgetMax = temporalEvidenceProtectionBudget.max;
        metrics.evidence.summarizedBudgetUsedByDirectEvidence = summarizedBudgetUsedByDirectEvidence;
        metrics.evidence.summarizedBudgetMax = summarizedEvidenceBudget.max;
    }

    // 排序
    selectedDirect.sort((a, b) => getEventSortKey(a.event) - getEventSortKey(b.event));
    selectedRelated.sort((a, b) => getEventSortKey(a.event) - getEventSortKey(b.event));

    // 重新编号 + 星标
    const directEventTexts = selectedDirect.map((it, i) => {
        const numbered = renumberEventText(it.text, i + 1);
        return it.candidateRank < TOP_N_STAR ? `⭐${numbered}` : numbered;
    });

    const relatedEventTexts = selectedRelated.map((it, i) => {
        const numbered = renumberEventText(it.text, i + 1);
        return numbered;
    });

    assembled.directEvents.lines = directEventTexts;
    assembled.relatedEvents.lines = relatedEventTexts;

    if (evidenceTrace) {
        const selectedInBudgetOrder = [...selectedDirect, ...selectedRelated]
            .sort((a, b) => a.candidateRank - b.candidateRank);
        for (const item of selectedInBudgetOrder) {
            evidenceTrace.event('prompt', item.event, eventTraceSource(candidates[item.candidateRank]));
            evidenceTrace.causal('prompt', item.event);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // [Evidence - Distant] 远期证据（已总结范围，未被事件消费的 L0）
    // ═══════════════════════════════════════════════════════════════════════

    const lastSummarized = store.lastSummarizedMesId ?? -1;
    const lastChunkFloor = meta?.lastChunkFloor ?? -1;
    const uiCfg = getSummaryPanelConfig()?.ui || {};
    const parsedKeepVisible = Number.parseInt(uiCfg.keepVisibleCount, 10);
    const keepVisible = Number.isFinite(parsedKeepVisible)
        ? Math.max(0, Math.min(50, parsedKeepVisible))
        : 6;

    // 收集未被事件消费的 L0，按 rerankScore 降序
    const focusSetForEvidence = new Set((focusCharacters || []).map(normalize).filter(Boolean));

    const remainingL0 = l0Selected
        .filter(l0 => !usedEvidenceIds.has(`l0:${l0.id}`))
        .filter(l0 => shouldKeepEvidenceL0(l0, focusSetForEvidence))
        .sort((a, b) => (b.rerankScore || 0) - (a.rerankScore || 0));

    // 远期：floor <= lastSummarized
    const distantL0 = remainingL0.filter(l0 => l0.floor <= lastSummarized);

    // Build distant groups once; trace, admission and starvation attribution
    // must observe the exact same token costs.
    const distantRanked = [];
    for (const [floor, l0s] of groupL0ByFloor(distantL0)) {
        const group = buildEvidenceGroup(
            floor,
            l0s,
            unusedL1PairChunks(l1ByFloor, floor, usedEvidenceIds),
        );
        const bestScore = Math.max(...l0s.map(l0 => (l0.rerankScore ?? l0.similarity ?? 0)));
        distantRanked.push({ group, bestScore });
    }
    distantRanked.sort((a, b) => (b.bestScore - a.bestScore) || (a.group.floor - b.group.floor));
    if (evidenceTrace) {
        for (const item of distantRanked) {
            evidenceTrace.floor('final', item.group.floor, 'l0', item.bestScore);
        }
    }

    const acceptedDistantGroups = [];
    if (summarizedEvidenceBudget.used < summarizedEvidenceBudget.max) {
        for (const item of distantRanked) {
            const group = item.group;
            if (summarizedEvidenceBudget.used + group.totalTokens > summarizedEvidenceBudget.max) continue;
            summarizedEvidenceBudget.used += group.totalTokens;
            acceptedDistantGroups.push(group);
            if (evidenceTrace) evidenceTrace.floor('prompt', group.floor, 'l0');
            markEvidenceGroupUsed(group, usedEvidenceIds);
            injectionStats.distantEvidence.units++;
        }
    }

    acceptedDistantGroups.sort((a, b) => a.floor - b.floor);
    for (const group of acceptedDistantGroups) {
        const groupLines = formatEvidenceGroup(group);
        for (const line of groupLines) {
            assembled.distantEvidence.lines.push(line);
        }
    }

    const distantTokens = acceptedDistantGroups.reduce((sum, group) => sum + group.totalTokens, 0);
    assembled.distantEvidence.tokens = distantTokens;
    injectionStats.distantEvidence.tokens = distantTokens;
    if (metrics?.evidence) {
        const distantEvidenceStarved = distantRanked.length > 0 && acceptedDistantGroups.length === 0;
        const smallestDistantGroup = distantRanked.length
            ? Math.min(...distantRanked.map(item => item.group.totalTokens))
            : Number.POSITIVE_INFINITY;
        const capacityWithoutTemporalProtection = summarizedEvidenceBudget.max
            - Math.max(0, summarizedBudgetUsedByDirectEvidence - directEvidenceTemporalProtectedTokens);
        metrics.evidence.distantEvidenceStarved = distantEvidenceStarved;
        metrics.evidence.distantEvidenceStarvedByTemporalProtection = distantEvidenceStarved
            && directEvidenceTemporalProtectedTokens > 0
            && smallestDistantGroup <= capacityWithoutTemporalProtection;
        metrics.evidence.distantEvidenceDroppedByBudget = Math.max(
            0,
            distantRanked.length - acceptedDistantGroups.length,
        );
    }
    if (metrics?.evidence) {
        metrics.evidence.summarizedBudgetUsedFinal = summarizedEvidenceBudget.used;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // [Evidence - Recent] 近期证据（未总结范围，独立预算）
    // ═══════════════════════════════════════════════════════════════════════

    const recentStart = lastSummarized + 1;
    const recentEnd = lastChunkFloor - keepVisible;

    if (recentEnd >= recentStart) {
        const recentAllL0 = getRecentWindowL0Atoms(recentStart, recentEnd);
        const recentL0 = recentAllL0
            .filter(l0 => !usedEvidenceIds.has(`l0:${l0.id}`))
            .filter(l0 => l0.floor >= recentStart && l0.floor <= recentEnd);

        if (recentL0.length) {
            const recentBudget = { used: 0, max: UNSUMMARIZED_EVIDENCE_MAX };

            // Pick newest floors first, then output in chronological order.
            const recentFloorMap = groupL0ByFloor(recentL0);
            const recentRanked = [];
            for (const [floor, l0s] of recentFloorMap) {
                const group = buildRecentEvidenceGroup(floor, l0s);
                recentRanked.push({ group });
            }
            recentRanked.sort((a, b) => b.group.floor - a.group.floor);
            if (evidenceTrace) {
                for (const item of recentRanked) evidenceTrace.floor('final', item.group.floor, 'recent-l0');
            }

            const acceptedRecentGroups = [];
            for (const item of recentRanked) {
                const group = item.group;
                if (recentBudget.used + group.totalTokens > recentBudget.max) continue;
                recentBudget.used += group.totalTokens;
                acceptedRecentGroups.push(group);
                if (evidenceTrace) evidenceTrace.floor('prompt', group.floor, 'recent-l0');
                markEvidenceGroupUsed(group, usedEvidenceIds);
                injectionStats.recentEvidence.units++;
            }

            acceptedRecentGroups.sort((a, b) => a.floor - b.floor);
            for (const group of acceptedRecentGroups) {
                const groupLines = formatEvidenceGroup(group);
                for (const line of groupLines) {
                    assembled.recentEvidence.lines.push(line);
                }
            }

            assembled.recentEvidence.tokens = recentBudget.used;
            injectionStats.recentEvidence.tokens = recentBudget.used;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 按注入顺序拼接 sections
    // ═══════════════════════════════════════════════════════════════════════

    const T_Format_Start = performance.now();

    const sections = [];

    injectionStats.budget.used = total.used
        + summarizedEvidenceBudget.used
        + (assembled.recentEvidence.tokens || 0);

    if (assembled.constraints.lines.length) {
        sections.push(`[定了的事] 已确立的事实\n${assembled.constraints.lines.join("\n")}`);
    }
    if (assembled.directEvents.lines.length) {
        sections.push(`[印象深的事] 记得很清楚\n\n${assembled.directEvents.lines.join("\n\n")}`);
    }
    if (assembled.relatedEvents.lines.length) {
        sections.push(`[其他人的事] 别人经历的类似事\n\n${assembled.relatedEvents.lines.join("\n\n")}`);
    }
    if (assembled.distantEvidence.lines.length) {
        sections.push(`[零散记忆] 没归入事件的片段\n${assembled.distantEvidence.lines.join("\n")}`);
    }
    if (assembled.recentEvidence.lines.length) {
        sections.push(`[新鲜记忆] 还没总结的部分\n${assembled.recentEvidence.lines.join("\n")}`);
    }
    if (assembled.arcs.lines.length) {
        sections.push(`[这些人] 他们的弧光\n${assembled.arcs.lines.join("\n")}`);
    }

    if (!sections.length) {
        if (metrics) {
            metrics.timing.evidenceAssembly = Math.round(performance.now() - T_Start - (metrics.timing.constraintFilter || 0));
            metrics.timing.formatting = 0;
        }
        return {
            promptText: "",
            injectionStats,
            metrics,
            ...(evidenceTrace ? { evidenceTrace: evidenceTrace.value } : {}),
        };
    }

    const memoryBody = `<剧情记忆>\n\n${sections.join("\n\n")}\n\n</剧情记忆>`;
    const promptText = buildMemoryPromptText(memoryBody);

    if (metrics) {
        metrics.formatting.sectionsIncluded = [];
        if (assembled.constraints.lines.length) metrics.formatting.sectionsIncluded.push('constraints');
        if (assembled.directEvents.lines.length) metrics.formatting.sectionsIncluded.push('direct_events');
        if (assembled.relatedEvents.lines.length) metrics.formatting.sectionsIncluded.push('related_events');
        if (assembled.distantEvidence.lines.length) metrics.formatting.sectionsIncluded.push('distant_evidence');
        if (assembled.recentEvidence.lines.length) metrics.formatting.sectionsIncluded.push('recent_evidence');
        if (assembled.arcs.lines.length) metrics.formatting.sectionsIncluded.push('arcs');

        const formattingTime = Math.round(performance.now() - T_Format_Start);
        metrics.timing.formatting = formattingTime;

        const effectiveTotal = total.used
            + summarizedEvidenceBudget.used
            + (assembled.recentEvidence.tokens || 0);
        const effectiveLimit = SHARED_POOL_MAX
            + summarizedEvidenceBudget.max
            + UNSUMMARIZED_EVIDENCE_MAX;
        metrics.budget.total = effectiveTotal;
        metrics.budget.limit = effectiveLimit;
        metrics.budget.utilization = Math.round(effectiveTotal / effectiveLimit * 100);
        metrics.budget.breakdown = {
            constraints: assembled.constraints.tokens,
            events: injectionStats.event.tokens,
            directEvidence: injectionStats.directEvidence.tokens,
            distantEvidence: injectionStats.distantEvidence.tokens,
            recentEvidence: injectionStats.recentEvidence.tokens,
            arcs: assembled.arcs.tokens,
        };

        metrics.evidence.tokens = injectionStats.directEvidence.tokens
            + injectionStats.distantEvidence.tokens
            + injectionStats.recentEvidence.tokens;
        metrics.timing.evidenceAssembly = Math.round(
            performance.now() - T_Start - (metrics.timing.constraintFilter || 0) - formattingTime
        );

        const relevantFacts = Math.max(0, allFacts.length - (metrics.constraint.filtered || 0));
        metrics.quality.constraintCoverage = relevantFacts > 0
            ? Math.round((metrics.constraint.injected || 0) / relevantFacts * 100)
            : 100;

        // l1AttachRate：有 L1 挂载的唯一楼层占所有 L0 覆盖楼层的比例
        const l0Floors = new Set(l0Selected.map(l0 => l0.floor));
        const l0FloorsWithL1 = new Set();
        for (const floor of l0Floors) {
            const pair = l1ByFloor.get(floor);
            if (pair?.aiTop1 || pair?.userTop1) {
                l0FloorsWithL1.add(floor);
            }
        }
        metrics.quality.l1AttachRate = l0Floors.size > 0
            ? Math.round(l0FloorsWithL1.size / l0Floors.size * 100)
            : 0;

        metrics.quality.potentialIssues = detectIssues(metrics);
    }

    return {
        promptText,
        injectionStats,
        metrics,
        ...(evidenceTrace ? { evidenceTrace: evidenceTrace.value } : {}),
    };
    } finally {
        if (deferredDirectEvidenceContext) {
            await releaseDirectEvidenceContext(deferredDirectEvidenceContext, metrics);
        }
        if (recallResult?.directEvidenceContext === deferredDirectEvidenceContext) {
            recallResult.directEvidenceContext = null;
        }
    }
}

export async function buildVectorPromptForReplay(store, recallResult, causalById, focusCharacters, meta, metrics) {
    return await buildVectorPrompt(
        store,
        recallResult,
        causalById,
        focusCharacters,
        meta,
        metrics,
        { captureEvidenceTrace: true },
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 向量模式：召回 + 注入
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 构建向量模式注入文本。这里只计算，不发布 UI 日志、警告或 extension prompt。
 * 所有可观察副作用都由 generate interceptor 在认领本轮结果后提交。
 * @param {boolean} excludeLastAi - 是否排除最后的 AI 消息
 * @param {object} options - 计算选项
 * @returns {Promise<{text: string, logText: string, notice: object|null}>}
 */
export async function buildVectorPromptText(excludeLastAi = false, options = {}) {
    const { pendingUserMessage = null, signal = null } = options;

    if (!getSettings().storySummary?.enabled) {
        return { text: "", logText: "", notice: null };
    }

    const { chat } = getContext();
    const store = getSummaryStore();

    if (!store?.json) {
        return { text: "", logText: "", notice: null };
    }

    const allEvents = store.json.events || [];
    const lastIdx = store.lastSummarizedMesId ?? 0;
    const length = chat?.length || 0;

    if (lastIdx >= length) {
        return { text: "", logText: "", notice: null };
    }

    const vectorCfg = getVectorConfig();
    if (!vectorCfg?.enabled) {
        return { text: "", logText: "", notice: null };
    }

    const { chatId } = getContext();
    const meta = chatId ? await getMeta(chatId) : null;

    let recallResult = null;
    let causalById = new Map();

    try {
        recallResult = await recallMemory(allEvents, vectorCfg, {
            excludeLastAi,
            pendingUserMessage,
            signal,
            deferRuntimeRelease: true,
        });

        recallResult = {
            ...recallResult,
            events: recallResult?.events || [],
            l0Selected: recallResult?.l0Selected || [],
            l1ByFloor: recallResult?.l1ByFloor || new Map(),
            causalChain: recallResult?.causalChain || [],
            focusTerms: recallResult?.focusTerms || recallResult?.focusEntities || [],
            focusEntities: recallResult?.focusTerms || recallResult?.focusEntities || [], // compat alias
            focusCharacters: recallResult?.focusCharacters || [],
            metrics: recallResult?.metrics || null,
        };

        // 构建因果事件索引
        causalById = new Map(
            (recallResult.causalChain || [])
                .map(c => [c?.event?.id, c])
                .filter(x => x[0])
        );
    } catch (e) {
        if (recallResult?.directEvidenceContext) {
            await releaseDirectEvidenceContext(recallResult.directEvidenceContext, recallResult?.metrics);
        }
        if (recallResult?.directEvidenceContext) recallResult.directEvidenceContext = null;
        if (signal?.aborted) {
            return { text: "", logText: "", notice: null };
        }
        xbLog.error(MODULE_ID, "向量召回失败", e);
        throw e;
    }

    if (signal?.aborted) {
        if (recallResult?.directEvidenceContext) {
            await releaseDirectEvidenceContext(recallResult.directEvidenceContext, recallResult?.metrics);
            recallResult.directEvidenceContext = null;
        }
        return { text: "", logText: "", notice: null };
    }

    const hasRecallEvidence =
        (recallResult?.events?.length || 0) > 0 ||
        (recallResult?.l0Selected?.length || 0) > 0 ||
        (recallResult?.causalChain?.length || 0) > 0;

    let notice = null;
    if (!hasRecallEvidence) {
        const noVectorsGenerated = !meta?.fingerprint || (meta?.lastChunkFloor ?? -1) < 0;
        const fpMismatch = meta?.fingerprint && meta.fingerprint !== getEngineFingerprint(vectorCfg);

        if (fpMismatch) {
            notice = {
                issueCode: 'fingerprint_mismatch',
                message: '向量引擎已变更，请重新生成向量',
            };
        } else if (noVectorsGenerated) {
            notice = {
                issueCode: 'vectors_not_generated',
                message: '没有可用向量，请在剧情总结面板中生成向量',
            };
        }
        // 向量存在但本次未命中 → 静默跳过，不打扰用户
        return {
            text: "",
            logText: "\n[Vector Recall Empty]\nNo recall candidates / vectors not ready.\n",
            notice,
        };
    }

    const { promptText, metrics: promptMetrics } = await buildVectorPrompt(
        store,
        recallResult,
        causalById,
        recallResult?.focusCharacters || [],
        meta,
        recallResult?.metrics || null
    );
    if (signal?.aborted) {
        return { text: "", logText: "", notice: null };
    }

    const cfg = getSummaryPanelConfig();
    let finalText = String(promptText || "");
    if (cfg.trigger?.wrapperHead) finalText = cfg.trigger.wrapperHead + "\n" + finalText;
    if (cfg.trigger?.wrapperTail) finalText = finalText + "\n" + cfg.trigger.wrapperTail;

    const metricsLogText = promptMetrics ? formatMetricsLog(promptMetrics) : '';

    return {
        text: finalText,
        logText: metricsLogText,
        notice,
    };
}
