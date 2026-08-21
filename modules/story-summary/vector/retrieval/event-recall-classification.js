// L2 事件的归属/DIRECT 分类：语义相关性、人物归属、证据触发三者解耦。
//
// - 归属（ownership）：focus（事件参与者∩查询窗口人物）/ other（明确谈别人）/
//   unknown（查询窗口没有可解析参与者，或事件无参与者）。仅描述人物事实，不做准入。
// - DIRECT 分类只表达归属：focus → DIRECT；other/unknown → RELATED。进入本分类前，
//   事件仍须先通过 recall.js 的 EVENT_MIN_SIMILARITY（0.60）候选门槛。
// - 语义分数只负责上游候选准入，不能把 unknown 偷换成 DIRECT。
// - evidenceEligible 是独立的证据扩展决策：focus 总是允许；unknown 只有
//   达到明确语义阈值才允许。它不会改变 RELATED 预算或伪造人物归属。

import { normalizeUserIdentityKey } from '../../data/character-aliases.js';

const DEFAULT_EVIDENCE_MIN_SIMILARITY = 0.70;

function normalizeName(value) {
    return String(value || '')
        .normalize('NFKC')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim()
        .toLowerCase();
}

/**
 * Resolve names explicitly found in the recent query window against the
 * trusted character pool. Pronouns and host names never create ownership.
 */
export function resolveFocusCharacters(
    explicitCharacters = [],
    trustedCharacters = new Set(),
    excludedCharacters = [],
) {
    const trusted = new Set([...trustedCharacters].map(normalizeName).filter(Boolean));
    const excluded = new Set((excludedCharacters || []).map(normalizeUserIdentityKey).filter(Boolean));
    const resolved = new Map();
    const add = value => {
        const display = String(value || '').trim();
        const key = normalizeName(display);
        const identityKey = normalizeUserIdentityKey(display);
        if (key && trusted.has(key) && !excluded.has(identityKey) && !resolved.has(key)) {
            resolved.set(key, display);
        }
    };
    for (const character of explicitCharacters || []) add(character);
    return [...resolved.values()];
}

export function eventOwnership(event, focusSet) {
    if (!focusSet?.size) return 'unknown';
    const participants = (event?.participants || [])
        .map(participant => normalizeName(participant))
        .filter(Boolean);
    if (!participants.length) return 'unknown';
    return participants.some(participant => focusSet.has(participant)) ? 'focus' : 'other';
}

export function classifyEventRecall(event, focusSet, similarity, options = {}) {
    const ownership = eventOwnership(event, focusSet);
    const recallType = ownership === 'focus' ? 'DIRECT' : 'RELATED';
    const evidenceMinSimilarity = Number.isFinite(options.evidenceMinSimilarity)
        ? options.evidenceMinSimilarity
        : DEFAULT_EVIDENCE_MIN_SIMILARITY;
    const evidenceEligible = ownership === 'focus'
        || (ownership === 'unknown' && similarity >= evidenceMinSimilarity);
    return {
        ownership,
        recallType,
        evidenceEligible,
    };
}
