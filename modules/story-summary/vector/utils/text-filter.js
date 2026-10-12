// ═══════════════════════════════════════════════════════════════════════════
// Text Filter - 通用文本过滤
// 跳过用户定义的「起始→结束」区间
// ═══════════════════════════════════════════════════════════════════════════

import { getTextFilterRules } from '../../data/config.js';
import { stripMarkupTags } from './markup-text.js';
import { projectMessageProse } from './message-prose.js';

import { applyTextFilterRules } from '../../data/text-filter-rules.js';
export { applyTextFilterRules } from '../../data/text-filter-rules.js';

/**
 * 便捷方法：使用当前配置过滤文本
 */
export function filterText(text) {
    return applyTextFilterRules(text, getTextFilterRules());
}

// Queries and new L1 chunks share the same prose projection. Remove excluded
// blocks before stripping their delimiters; otherwise their contents would leak.
export function cleanRecallMessageText(text) {
    const filtered = filterText(text).replace(/<state>[\s\S]*?<\/state>/gi, '');
    return stripMarkupTags(projectMessageProse(filtered)).trim();
}
