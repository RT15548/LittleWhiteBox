// ═══════════════════════════════════════════════════════════════════════════
// Text Filter - 通用文本过滤
// 跳过用户定义的「起始→结束」区间
// ═══════════════════════════════════════════════════════════════════════════

import { getTextFilterRules } from '../../data/config.js';

/**
 * 转义正则特殊字符
 */
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 应用过滤规则
 * - start + end：删除 start...end（含边界）
 * - start 空 + end：从开头删到 end（含）
 * - start + end 空：从 start 删到结尾
 * - 两者都空：跳过
 */
export function applyTextFilterRules(text, rules) {
    if (!text || !rules?.length) return text;

    let result = text;

    for (const rule of rules) {
        const start = rule.start ?? '';
        const end = rule.end ?? '';

        if (!start && !end) continue;

        if (start && end) {
            // 标准区间：删除 start...end（含边界），非贪婪
            const regex = new RegExp(
                escapeRegex(start) + '[\\s\\S]*?' + escapeRegex(end),
                'gi'
            );
            result = result.replace(regex, '');
        } else if (start && !end) {
            // 从 start 到结尾
            const idx = result.toLowerCase().indexOf(start.toLowerCase());
            if (idx !== -1) {
                result = result.slice(0, idx);
            }
        } else if (!start && end) {
            // 从开头到 end（含）
            const idx = result.toLowerCase().indexOf(end.toLowerCase());
            if (idx !== -1) {
                result = result.slice(idx + end.length);
            }
        }
    }

    return result.trim();
}

/**
 * 便捷方法：使用当前配置过滤文本
 */
export function filterText(text) {
    return applyTextFilterRules(text, getTextFilterRules());
}
