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
// - 注入发生在 story-summary.js：GENERATION_STARTED 时写入 extension_prompts
// ═══════════════════════════════════════════════════════════════════════════

import { getContext } from "../../../../../../extensions.js";
import { xbLog } from "../../../core/debug-core.js";
import { getSummaryStore, getFacts, isRelationFact } from "../data/store.js";
import { getVectorConfig, getSummaryPanelConfig, getSettings, DEFAULT_MEMORY_PROMPT_TEMPLATE } from "../data/config.js";
import { recallMemory } from "../vector/retrieval/recall.js";
import { getMeta } from "../vector/storage/chunk-store.js";
import { getStateAtoms } from "../vector/storage/state-store.js";
import { getEngineFingerprint } from "../vector/utils/embedder.js";
import { buildTrustedCharacters } from "../vector/retrieval/entity-lexicon.js";

// Metrics
import { formatMetricsLog, detectIssues } from "../vector/retrieval/metrics.js";

const MODULE_ID = "summaryPrompt";

// ─────────────────────────────────────────────────────────────────────────────
// 召回失败提示节流
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
// 预算常量
// ─────────────────────────────────────────────────────────────────────────────

const SHARED_POOL_MAX = 10000;
const CONSTRAINT_MAX = 2000;
const ARCS_MAX = 1500;
const EVENT_BUDGET_MAX = 5000;
const RELATED_EVENT_MAX = 500;
const SUMMARIZED_EVIDENCE_MAX = 2000;
const UNSUMMARIZED_EVIDENCE_MAX = 2000;
const TOP_N_STAR = 5;

// L0 显示文本：分号拼接 vs 多行模式的阈值
const L0_JOINED_MAX_LENGTH = 120;
// 背景证据：无实体匹配时保留的最低相似度（与 recall.js CONFIG.EVENT_ENTITY_BYPASS_SIM 保持一致）

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
 * 解析事件摘要中的楼层范围
 * @param {string} summary - 事件摘要
 * @returns {{start: number, end: number}|null} 楼层范围
 */
function parseFloorRange(summary) {
    if (!summary) return null;
    const match = String(summary).match(/\(#(\d+)(?:-(\d+))?\)/);
    if (!match) return null;
    const start = Math.max(0, parseInt(match[1], 10) - 1);
    const end = Math.max(0, (match[2] ? parseInt(match[2], 10) : parseInt(match[1], 10)) - 1);
    return { start, end };
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
 * 1) 无焦点实体：保留
 * 2) similarity >= 0.70：保留（旁通）
 * 3) edges 命中焦点实体：保留
 * 否则过滤。
 * @param {object} l0
 * @param {Set<string>} focusSet
 * @returns {boolean}
 */
function shouldKeepEvidenceL0(l0, focusSet) {
    if (!focusSet?.size) return false;

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
    const r = parseFloorRange(event?.summary);
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
function parseRelationTarget(predicate) {
    const match = String(predicate || '').match(/^对(.+)的/);
    return match ? match[1] : null;
}

/**
 * 按相关性过滤 facts
 * @param {object[]} facts - 所有 facts
 * @param {string[]} focusCharacters - 焦点人物
 * @param {Set<string>} knownCharacters - 已知角色
 * @returns {object[]} 过滤后的 facts
 */
function filterConstraintsByRelevance(facts, focusCharacters, knownCharacters) {
    if (!facts?.length) return [];

    const focusSet = new Set((focusCharacters || []).map(normalize));

    return facts.filter(f => {
        if (f._isState === true) return true;

        if (isRelationFact(f)) {
            const from = normalize(f.s);
            const target = parseRelationTarget(f.p);
            const to = target ? normalize(target) : '';

            if (focusSet.has(from) || focusSet.has(to)) return true;
            return false;
        }

        const subjectNorm = normalize(f.s);
        if (knownCharacters.has(subjectNorm)) {
            return focusSet.has(subjectNorm);
        }

        return true;
    });
}

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
 * @param {boolean} isContext - 是否为上下文（USER 侧）
 * @returns {string} 格式化后的行
 */
function formatL1Line(chunk, isContext) {
    const { name1, name2 } = getContext();
    const speaker = chunk.isUser ? (name1 || "用户") : (chunk.speaker || name2 || "角色");
    const text = String(chunk.text || "").trim();
    const symbol = isContext ? "┌" : "›";
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

    const r = parseFloorRange(ev.summary);
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
// EvidenceGroup（per-floor：N个L0 + 共享一对L1）
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {object} EvidenceGroup
 * @property {number} floor - 楼层号
 * @property {object[]} l0Atoms - 该楼层所有被选中的 L0
 * @property {object|null} userL1 - USER 侧 top-1 L1 chunk（仅一份）
 * @property {object|null} aiL1 - AI 侧 top-1 L1 chunk（仅一份）
 * @property {number} totalTokens - 整组 token 估算
 */

/**
 * 为一个楼层构建证据组
 *
 * 同楼层多个 L0 共享一对 L1，避免 L1 重复输出。
 *
 * @param {number} floor - 楼层号
 * @param {object[]} l0AtomsForFloor - 该楼层所有被选中的 L0
 * @param {Map<number, object>} l1ByFloor - 楼层→L1配对映射
 * @returns {EvidenceGroup}
 */
function buildEvidenceGroup(floor, l0AtomsForFloor, l1ByFloor) {
    const pair = l1ByFloor.get(floor);
    const userL1 = pair?.userTop1 || null;
    const aiL1 = pair?.aiTop1 || null;

    // 计算整组 token 开销
    let totalTokens = 0;

    // 所有 L0 的显示文本
    for (const l0 of l0AtomsForFloor) {
        totalTokens += estimateTokens(buildL0DisplayText(l0));
    }
    // 固定开销：楼层前缀、📌 标记、分号等
    totalTokens += 10;

    // L1 仅算一次
    if (userL1) totalTokens += estimateTokens(formatL1Line(userL1, true));
    if (aiL1) totalTokens += estimateTokens(formatL1Line(aiL1, false));

    return { floor, l0Atoms: l0AtomsForFloor, userL1, aiL1, totalTokens };
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
    return { floor, l0Atoms: l0AtomsForFloor, userL1: null, aiL1: null, totalTokens };
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

    // L0 部分
    const joined = displayTexts.join('；');

    if (joined.length <= L0_JOINED_MAX_LENGTH) {
        // 短行：分号拼接为一行
        lines.push(`  › #${group.floor + 1} [📌] ${joined}`);
    } else {
        // 长行：每个 L0 独占一行，首行带楼层号
        lines.push(`  › #${group.floor + 1} [📌] ${displayTexts[0]}`);
        for (let i = 1; i < displayTexts.length; i++) {
            lines.push(`  │      ${displayTexts[i]}`);
        }
    }

    // L1 证据（仅一次）
    if (group.userL1) {
        lines.push(formatL1Line(group.userL1, true));
    }
    if (group.aiL1) {
        lines.push(formatL1Line(group.aiL1, false));
    }

    return lines;
}

// ─────────────────────────────────────────────────────────────────────────────
// 事件证据收集（per-floor 分组）
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 为事件收集范围内的 EvidenceGroup
 *
 * 同楼层多个 L0 归入同一组，共享一对 L1。
 *
 * @param {object} eventObj - 事件对象
 * @param {object[]} l0Selected - 所有选中的 L0
 * @param {Map<number, object>} l1ByFloor - 楼层→L1配对映射
 * @param {Set<string>} usedL0Ids - 已消费的 L0 ID 集合（会被修改）
 * @returns {EvidenceGroup[]} 该事件的证据组列表（按楼层排序）
 */
function collectEvidenceGroupsForEvent(eventObj, l0Selected, l1ByFloor, usedL0Ids) {
    const range = parseFloorRange(eventObj?.summary);
    if (!range) return [];

    // 收集范围内未消费的 L0，按楼层分组
    const floorMap = new Map();

    for (const l0 of l0Selected) {
        if (usedL0Ids.has(l0.id)) continue;
        if (l0.floor < range.start || l0.floor > range.end) continue;

        if (!floorMap.has(l0.floor)) {
            floorMap.set(l0.floor, []);
        }
        floorMap.get(l0.floor).push(l0);
        usedL0Ids.add(l0.id);
    }

    // 构建 groups
    const groups = [];
    for (const [floor, l0s] of floorMap) {
        groups.push(buildEvidenceGroup(floor, l0s, l1ByFloor));
    }

    // 按楼层排序
    groups.sort((a, b) => a.floor - b.floor);

    return groups;
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
        nonVectorKnownCharacters
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

/**
 * 构建向量模式注入文本
 * @param {object} store - 存储对象
 * @param {object} recallResult - 召回结果
 * @param {Map<string, object>} causalById - 因果事件索引
 * @param {string[]} focusCharacters - 焦点人物
 * @param {object} meta - 元数据
 * @param {object} metrics - 指标对象
 * @returns {Promise<{promptText: string, injectionStats: object, metrics: object}>}
 */
async function buildVectorPrompt(store, recallResult, causalById, focusCharacters, meta, metrics) {
    const T_Start = performance.now();

    const data = store.json || {};
    const total = { used: 0, max: SHARED_POOL_MAX };

    // 从 recallResult 解构
    const l0Selected = recallResult?.l0Selected || [];
    const l1ByFloor = recallResult?.l1ByFloor || new Map();

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
        budget: { max: SHARED_POOL_MAX + UNSUMMARIZED_EVIDENCE_MAX, used: 0 },
        constraint: { count: 0, tokens: 0, filtered: 0 },
        arc: { count: 0, tokens: 0 },
        event: { selected: 0, tokens: 0 },
        evidence: { l0InEvents: 0, l1InEvents: 0, tokens: 0 },
        distantEvidence: { units: 0, tokens: 0 },
        recentEvidence: { units: 0, tokens: 0 },
    };

    const eventDetails = {
        list: [],
        directCount: 0,
        relatedCount: 0,
    };

    // 已消费的 L0 ID 集合（事件区域消费后，evidence 区域不再重复）
    const usedL0Ids = new Set();

    // ═══════════════════════════════════════════════════════════════════════
    // [Constraints] L3 Facts → 世界约束
    // ═══════════════════════════════════════════════════════════════════════

    const T_Constraint_Start = performance.now();

    const allFacts = getFacts();
    const knownCharacters = getKnownCharacters(store);
    const filteredConstraints = filterConstraintsByRelevance(allFacts, focusCharacters, knownCharacters);
    const constraintPeopleDict = buildConstraintPeopleDict(recallResult, focusCharacters);
    const groupedConstraints = groupConstraintsForDisplay(filteredConstraints, constraintPeopleDict);

    if (metrics) {
        metrics.constraint.total = allFacts.length;
        metrics.constraint.filtered = allFacts.length - filteredConstraints.length;
    }

    const constraintBudget = { used: 0, max: Math.min(CONSTRAINT_MAX, total.max - total.used) };
    const groupedSelectedConstraints = selectConstraintsByBudgetDesc(groupedConstraints, constraintBudget);
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
    const eventHits = (recallResult?.events || []).filter(e => e?.event?.summary);

    const candidates = [...eventHits].sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
    const eventBudget = { used: 0, max: Math.min(EVENT_BUDGET_MAX, total.max - total.used) };
    const relatedBudget = { used: 0, max: RELATED_EVENT_MAX };
    // Once budget becomes tight, keep high-score L2 summaries and stop attaching evidence.
    let allowEventEvidence = true;

    const selectedDirect = [];
    const selectedRelated = [];

    for (let candidateRank = 0; candidateRank < candidates.length; candidateRank++) {
        const e = candidates[candidateRank];

        if (total.used >= total.max) break;
        if (eventBudget.used >= eventBudget.max) break;

        const isDirect = e._recallType === "DIRECT";
        if (!isDirect && relatedBudget.used >= relatedBudget.max) continue;

        // 硬规则：RELATED 事件不挂证据（不挂 L0/L1，只保留事件摘要）
        // DIRECT 才允许收集事件内证据组。
        const useEvidenceForThisEvent = isDirect && allowEventEvidence;
        const evidenceGroups = useEvidenceForThisEvent
            ? collectEvidenceGroupsForEvent(e.event, l0Selected, l1ByFloor, usedL0Ids)
            : [];

        // 格式化事件（含证据）
        const text = formatEventWithEvidence(e, 0, evidenceGroups, causalById);
        const cost = estimateTokens(text);
        const fitEventBudget = eventBudget.used + cost <= eventBudget.max;
        const fitRelatedBudget = isDirect || (relatedBudget.used + cost <= relatedBudget.max);

        // 预算检查：整个事件（含证据）作为原子单元
        // 约束：总预算 + 事件预算 + related 子预算（若 applicable）
        if (total.used + cost > total.max || !fitEventBudget || !fitRelatedBudget) {
            // 尝试不带证据的版本
            const textNoEvidence = formatEventWithEvidence(e, 0, [], causalById);
            const costNoEvidence = estimateTokens(textNoEvidence);
            const fitEventBudgetNoEvidence = eventBudget.used + costNoEvidence <= eventBudget.max;
            const fitRelatedBudgetNoEvidence = isDirect || (relatedBudget.used + costNoEvidence <= relatedBudget.max);

            if (total.used + costNoEvidence > total.max || !fitEventBudgetNoEvidence || !fitRelatedBudgetNoEvidence) {
                // 归还 usedL0Ids
                for (const group of evidenceGroups) {
                    for (const l0 of group.l0Atoms) {
                        usedL0Ids.delete(l0.id);
                    }
                }
                // Hard cap reached: no-evidence version also cannot fit total/event budget.
                // Keep ranking semantics (higher-score events first): stop here.
                if (total.used + costNoEvidence > total.max || !fitEventBudgetNoEvidence) {
                    break;
                }
                // Related sub-budget overflow: skip this related event and continue.
                continue;
            }

            // 放入不带证据的版本，归还已消费的 L0 ID
            for (const group of evidenceGroups) {
                for (const l0 of group.l0Atoms) {
                    usedL0Ids.delete(l0.id);
                }
            }
            // Enter summary-only mode after first budget conflict on evidence.
            if (useEvidenceForThisEvent && evidenceGroups.length > 0) {
                allowEventEvidence = false;
            }

            if (isDirect) {
                selectedDirect.push({
                    event: e.event, text: textNoEvidence, tokens: costNoEvidence,
                    evidenceGroups: [], candidateRank,
                });
            } else {
                selectedRelated.push({
                    event: e.event, text: textNoEvidence, tokens: costNoEvidence,
                    evidenceGroups: [], candidateRank,
                });
            }

            injectionStats.event.selected++;
            injectionStats.event.tokens += costNoEvidence;
            total.used += costNoEvidence;
            eventBudget.used += costNoEvidence;
            if (!isDirect) relatedBudget.used += costNoEvidence;

            eventDetails.list.push({
                title: e.event?.title || e.event?.id,
                isDirect,
                hasEvidence: false,
                tokens: costNoEvidence,
                similarity: e.similarity || 0,
                l0Count: 0,
                l1FloorCount: 0,
            });

            continue;
        }

        // 预算充足，放入完整版本
        let l0Count = 0;
        let l1FloorCount = 0;
        for (const group of evidenceGroups) {
            l0Count += group.l0Atoms.length;
            if (group.userL1 || group.aiL1) l1FloorCount++;
        }

        if (isDirect) {
            selectedDirect.push({
                event: e.event, text, tokens: cost,
                evidenceGroups, candidateRank,
            });
        } else {
            selectedRelated.push({
                event: e.event, text, tokens: cost,
                evidenceGroups, candidateRank,
            });
        }

        injectionStats.event.selected++;
        injectionStats.event.tokens += cost;
        injectionStats.evidence.l0InEvents += l0Count;
        injectionStats.evidence.l1InEvents += l1FloorCount;
        total.used += cost;
        eventBudget.used += cost;
        if (!isDirect) relatedBudget.used += cost;

        eventDetails.list.push({
            title: e.event?.title || e.event?.id,
            isDirect,
            hasEvidence: l0Count > 0,
            tokens: cost,
            similarity: e.similarity || 0,
            l0Count,
            l1FloorCount,
        });
    }

    // 排序
    selectedDirect.sort((a, b) => getEventSortKey(a.event) - getEventSortKey(b.event));
    selectedRelated.sort((a, b) => getEventSortKey(a.event) - getEventSortKey(b.event));

    // ═══════════════════════════════════════════════════════════════════
    // 邻近补挂：未被事件消费的 L0，距最近已选事件 ≤ 2 楼则补挂
    // 每个 L0 只挂最近的一个事件，不扩展事件范围，不产生重叠
    // ═══════════════════════════════════════════════════════════════════

    // 重新编号 + 星标
    const directEventTexts = selectedDirect.map((it, i) => {
        const numbered = renumberEventText(it.text, i + 1);
        return it.candidateRank < TOP_N_STAR ? `⭐${numbered}` : numbered;
    });

    const relatedEventTexts = selectedRelated.map((it, i) => {
        const numbered = renumberEventText(it.text, i + 1);
        return numbered;
    });

    eventDetails.directCount = selectedDirect.length;
    eventDetails.relatedCount = selectedRelated.length;
    assembled.directEvents.lines = directEventTexts;
    assembled.relatedEvents.lines = relatedEventTexts;

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
        .filter(l0 => !usedL0Ids.has(l0.id))
        .filter(l0 => shouldKeepEvidenceL0(l0, focusSetForEvidence))
        .sort((a, b) => (b.rerankScore || 0) - (a.rerankScore || 0));

    // 远期：floor <= lastSummarized
    const distantL0 = remainingL0.filter(l0 => l0.floor <= lastSummarized);

    if (distantL0.length && total.used < total.max) {
        const distantBudget = { used: 0, max: Math.min(SUMMARIZED_EVIDENCE_MAX, total.max - total.used) };

        // 先按分数挑组（高分优先），再按时间输出（楼层升序）
        const distantFloorMap = groupL0ByFloor(distantL0);
        const distantRanked = [];
        for (const [floor, l0s] of distantFloorMap) {
            const group = buildEvidenceGroup(floor, l0s, l1ByFloor);
            const bestScore = Math.max(...l0s.map(l0 => (l0.rerankScore ?? l0.similarity ?? 0)));
            distantRanked.push({ group, bestScore });
        }
        distantRanked.sort((a, b) => (b.bestScore - a.bestScore) || (a.group.floor - b.group.floor));

        const acceptedDistantGroups = [];
        for (const item of distantRanked) {
            const group = item.group;
            if (distantBudget.used + group.totalTokens > distantBudget.max) continue;
            distantBudget.used += group.totalTokens;
            acceptedDistantGroups.push(group);
            for (const l0 of group.l0Atoms) usedL0Ids.add(l0.id);
            injectionStats.distantEvidence.units++;
        }

        acceptedDistantGroups.sort((a, b) => a.floor - b.floor);
        for (const group of acceptedDistantGroups) {
            const groupLines = formatEvidenceGroup(group);
            for (const line of groupLines) {
                assembled.distantEvidence.lines.push(line);
            }
        }

        assembled.distantEvidence.tokens = distantBudget.used;
        total.used += distantBudget.used;
        injectionStats.distantEvidence.tokens = distantBudget.used;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // [Evidence - Recent] 近期证据（未总结范围，独立预算）
    // ═══════════════════════════════════════════════════════════════════════

    const recentStart = lastSummarized + 1;
    const recentEnd = lastChunkFloor - keepVisible;

    if (recentEnd >= recentStart) {
        const recentAllL0 = getRecentWindowL0Atoms(recentStart, recentEnd);
        const recentL0 = recentAllL0
            .filter(l0 => !usedL0Ids.has(l0.id))
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

            const acceptedRecentGroups = [];
            for (const item of recentRanked) {
                const group = item.group;
                if (recentBudget.used + group.totalTokens > recentBudget.max) continue;
                recentBudget.used += group.totalTokens;
                acceptedRecentGroups.push(group);
                for (const l0 of group.l0Atoms) usedL0Ids.add(l0.id);
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
        return { promptText: "", injectionStats, metrics };
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

        metrics.formatting.time = Math.round(performance.now() - T_Format_Start);
        metrics.timing.formatting = metrics.formatting.time;

        const effectiveTotal = total.used + (assembled.recentEvidence.tokens || 0);
        const effectiveLimit = SHARED_POOL_MAX + UNSUMMARIZED_EVIDENCE_MAX;
        metrics.budget.total = effectiveTotal;
        metrics.budget.limit = effectiveLimit;
        metrics.budget.utilization = Math.round(effectiveTotal / effectiveLimit * 100);
        metrics.budget.breakdown = {
            constraints: assembled.constraints.tokens,
            events: injectionStats.event.tokens,
            distantEvidence: injectionStats.distantEvidence.tokens,
            recentEvidence: injectionStats.recentEvidence.tokens,
            arcs: assembled.arcs.tokens,
        };

        metrics.evidence.tokens = injectionStats.distantEvidence.tokens + injectionStats.recentEvidence.tokens;
        metrics.evidence.recentSource = 'all_l0_window';
        metrics.evidence.recentL1Attached = 0;
        metrics.evidence.assemblyTime = Math.round(
            performance.now() - T_Start - (metrics.timing.constraintFilter || 0) - metrics.formatting.time
        );
        metrics.timing.evidenceAssembly = metrics.evidence.assemblyTime;

        const relevantFacts = Math.max(0, allFacts.length - (metrics.constraint.filtered || 0));
        metrics.quality.constraintCoverage = relevantFacts > 0
            ? Math.round((metrics.constraint.injected || 0) / relevantFacts * 100)
            : 100;
        metrics.quality.eventPrecisionProxy = metrics.event?.similarityDistribution?.mean || 0;

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

    return { promptText, injectionStats, metrics };
}

export async function buildVectorPromptForReplay(store, recallResult, causalById, focusCharacters, meta, metrics) {
    return await buildVectorPrompt(store, recallResult, causalById, focusCharacters, meta, metrics);
}

// ─────────────────────────────────────────────────────────────────────────────
// 向量模式：召回 + 注入
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 构建向量模式注入文本（公开接口）
 * @param {boolean} excludeLastAi - 是否排除最后的 AI 消息
 * @param {object} hooks - 钩子函数
 * @returns {Promise<{text: string, logText: string}>}
 */
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
    const meta = chatId ? await getMeta(chatId) : null;

    let recallResult = null;
    let causalById = new Map();

    try {
        recallResult = await recallMemory(allEvents, vectorCfg, {
            excludeLastAi,
            pendingUserMessage,
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
        xbLog.error(MODULE_ID, "向量召回失败", e);

        if (echo && canNotifyRecallFail()) {
            const msg = String(e?.message || "未知错误").replace(/\s+/g, " ").slice(0, 200);
            await echo(`/echo severity=warning 嵌入 API 请求失败：${msg}（本次跳过记忆召回）`);
        }

        if (postToFrame) {
            postToFrame({
                type: "RECALL_LOG",
                text: `\n[Vector Recall Failed]\n${String(e?.stack || e?.message || e)}\n`,
            });
        }

        return { text: "", logText: `\n[Vector Recall Failed]\n${String(e?.stack || e?.message || e)}\n` };
    }

    const hasUseful =
        (recallResult?.events?.length || 0) > 0 ||
        (recallResult?.l0Selected?.length || 0) > 0 ||
        (recallResult?.causalChain?.length || 0) > 0;

    if (!hasUseful) {
        const noVectorsGenerated = !meta?.fingerprint || (meta?.lastChunkFloor ?? -1) < 0;
        const fpMismatch = meta?.fingerprint && meta.fingerprint !== getEngineFingerprint(vectorCfg);

        if (fpMismatch) {
            if (echo && canNotifyRecallFail()) {
                await echo("/echo severity=warning 向量引擎已变更，请重新生成向量");
            }
        } else if (noVectorsGenerated) {
            if (echo && canNotifyRecallFail()) {
                await echo("/echo severity=warning 没有可用向量，请在剧情总结面板中生成向量");
            }
        }
        // 向量存在但本次未命中 → 静默跳过，不打扰用户

        if (postToFrame && (noVectorsGenerated || fpMismatch)) {
            postToFrame({
                type: "RECALL_LOG",
                text: "\n[Vector Recall Empty]\nNo recall candidates / vectors not ready.\n",
            });
        }
        return { text: "", logText: "\n[Vector Recall Empty]\nNo recall candidates / vectors not ready.\n" };
    }

    const { promptText, metrics: promptMetrics } = await buildVectorPrompt(
        store,
        recallResult,
        causalById,
        recallResult?.focusCharacters || [],
        meta,
        recallResult?.metrics || null
    );

    const cfg = getSummaryPanelConfig();
    let finalText = String(promptText || "");
    if (cfg.trigger?.wrapperHead) finalText = cfg.trigger.wrapperHead + "\n" + finalText;
    if (cfg.trigger?.wrapperTail) finalText = finalText + "\n" + cfg.trigger.wrapperTail;

    const metricsLogText = promptMetrics ? formatMetricsLog(promptMetrics) : '';

    if (postToFrame) {
        postToFrame({ type: "RECALL_LOG", text: metricsLogText });
    }

    return { text: finalText, logText: metricsLogText };
}
