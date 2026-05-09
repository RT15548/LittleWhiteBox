/**
 * WorldbookProcessor — AI 画图共享世界书处理器
 *
 * 从上传的世界书条目中，按简化规则（常驻/普通关键词/禁用）过滤，组装为 LLM 上下文。
 */

export class WorldbookProcessor {

    /**
     * 按常驻、关键词和禁用状态过滤条目
     * @param {Array} entries  条目数组，需包含 key/keysecondary/constant/disable/content/order
     * @param {string} contextText  当前场景文本 + 角色名
     * @param {'auto'|'all_active'} mode
     */
    filterEntries(entries, contextText, mode = 'auto') {
        const lowerCtx = contextText.toLowerCase();

        return entries.filter((entry) => {
            if (entry.disable) return false;
            if (entry.constant) return true;
            if (mode === 'all_active') return true;

            // auto 模式：普通关键词条目需关键词匹配
            // 主关键词 (key): OR — 任一命中即可
            // 次关键词 (keysecondary): AND — 全部命中才算（且需主关键词先命中）
            const primary = (entry.key || []).filter(k => k.trim());
            const secondary = (entry.keysecondary || []).filter(k => k.trim());
            if (!primary.length && !secondary.length) return false;

            const matchKw = (kw) => lowerCtx.includes(kw.toLowerCase().trim());

            const primaryHit = primary.length === 0 || primary.some(matchKw);
            if (!primaryHit) return false;

            const secondaryHit = secondary.length === 0 || secondary.every(matchKw);
            return secondaryHit;
        });
    }

    /**
     * 将过滤后的条目按 order 升序组装为文本
     * @param {Array} filteredEntries
     */
    assembleContent(filteredEntries) {
        const sorted = [...filteredEntries].sort((a, b) =>
            (a.order ?? 100) - (b.order ?? 100)
        );

        return sorted
            .map(e => e.content?.trim())
            .filter(Boolean)
            .join('\n');
    }

    /**
     * 从条目数组处理：过滤 → 组装
     * @param {Object} options
     * @param {Array}  options.entries  条目数组
     * @param {string} options.contextText
     * @param {'auto'|'all_active'} options.keywordFilterMode
     */
    processFromEntries(options) {
        const {
            entries = [],
            contextText = '',
            keywordFilterMode = 'auto',
        } = options;

        if (!entries.length) return '';

        const filtered = this.filterEntries(entries, contextText, keywordFilterMode);
        return this.assembleContent(filtered);
    }
}
