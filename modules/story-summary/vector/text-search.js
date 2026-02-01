// ═══════════════════════════════════════════════════════════════════════════
// Text Search - L2 事件文本检索（MiniSearch）
// 与向量检索互补，通过 RRF 融合
// ═══════════════════════════════════════════════════════════════════════════

import MiniSearch from '../../../libs/minisearch.mjs';

let idx = null;
let lastRevision = null;

/**
 * 中文逐字 + 英数字串分词
 */
function tokenize(text) {
    return String(text || '').match(/[\u4e00-\u9fff]|[a-zA-Z0-9]+/g) || [];
}

/**
 * 去掉 summary 末尾的楼层标记
 */
function stripFloorTag(s) {
    return String(s || '').replace(/\s*\(#\d+(?:-\d+)?\)\s*$/, '').trim();
}

/**
 * 构建/更新事件文本索引
 */
export function ensureEventTextIndex(events, revision) {
    if (!events?.length) {
        idx = null;
        lastRevision = null;
        return;
    }

    if (idx && revision === lastRevision) return;

    try {
        idx = new MiniSearch({
            fields: ['title', 'summary', 'participants'],
            storeFields: ['id'],
            tokenize,
        });

        idx.addAll(events.map(e => ({
            id: e.id,
            title: e.title || '',
            summary: stripFloorTag(e.summary),
            participants: (e.participants || []).join(' '),
        })));

        lastRevision = revision;
    } catch (e) {
        console.error('[text-search] Index build failed:', e);
        idx = null;
        lastRevision = null;
    }
}

/**
 * 文本检索事件
 */
export function searchEventsByText(queryText, limit = 80) {
    if (!idx || !queryText?.trim()) return [];

    try {
        const res = idx.search(queryText, {
            limit,
            boost: { title: 2, participants: 1.5, summary: 1 },
            fuzzy: 0.2,
            prefix: true,
        });
        return res.map((r, i) => ({ id: r.id, textRank: i + 1 }));
    } catch (e) {
        console.error('[text-search] Search failed:', e);
        return [];
    }
}

/**
 * 清理索引
 */
export function clearEventTextIndex() {
    idx = null;
    lastRevision = null;
}
