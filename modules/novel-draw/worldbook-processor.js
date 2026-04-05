/**
 * WorldbookProcessor — novel-draw 高级模式世界书处理器
 *
 * 通过 LittleWhiteBox 的 WorldbookBridgeService 读取酒馆世界书条目，
 * 按灯状态（绿灯/蓝灯/禁用）过滤，在 token 预算内组装为 LLM 上下文。
 */

export class WorldbookProcessor {
    constructor() {}

    // ── bridge 访问 ──────────────────────────────────────────────

    _getBridge() {
        return window.xiaobaixWorldbookService ?? null;
    }

    /** 列出所有可用世界书名称 */
    async listAvailableWorldbooks() {
        const bridge = this._getBridge();
        if (!bridge) return [];
        try {
            return await bridge.listWorldbooks();
        } catch {
            return [];
        }
    }

    /**
     * 读取世界书条目并附加灯状态
     * @param {string} bookName
     * @returns {Promise<Array<{uid, comment, key, keysecondary, constant, disable, content, order, lampState}>>}
     */
    async getEntriesWithState(bookName) {
        const bridge = this._getBridge();
        if (!bridge) return [];

        const entries = await bridge.listEntries({ file: bookName });
        if (!entries?.length) return [];

        const enriched = await Promise.all(entries.map(async (e) => {
            let content = '';
            try {
                content = await bridge.getEntryField({
                    file: bookName, uid: String(e.uid), field: 'content',
                });
            } catch { /* entry may have been deleted */ }

            const isConstant = !!e.constant;
            const isDisabled = !!e.disable;
            let lampState = 'normal';
            if (isDisabled) lampState = 'disabled';
            else if (isConstant) lampState = 'constant';

            return {
                uid: e.uid,
                comment: e.comment || '',
                key: e.key || [],
                keysecondary: e.keysecondary || [],
                constant: isConstant,
                disable: isDisabled,
                content: content || '',
                order: e.order ?? 100,
                lampState,
            };
        }));

        return enriched;
    }

    // ── 过滤 ──────────────────────────────────────────────────

    /**
     * 按灯状态和关键词过滤条目
     * @param {Array} entries  getEntriesWithState 返回值
     * @param {string} contextText  当前场景文本 + 角色名
     * @param {'auto'|'all_active'} mode
     */
    filterEntries(entries, contextText, mode = 'auto') {
        const lowerCtx = contextText.toLowerCase();

        return entries.filter((entry) => {
            if (entry.disable) return false;
            if (entry.constant) return true;
            if (mode === 'all_active') return true;

            // auto 模式：蓝灯条目需关键词匹配
            const keys = [...(entry.key || []), ...(entry.keysecondary || [])];
            if (!keys.length) return false;

            return keys.some((kw) => {
                const k = kw.toLowerCase().trim();
                return k && lowerCtx.includes(k);
            });
        });
    }

    // ── 组装 ──────────────────────────────────────────────────

    /**
     * 将过滤后的条目按酒馆原生顺序组装为结构化文本
     * @param {Array} filteredEntries
     */
    assembleContent(filteredEntries) {
        // 按 order 升序排列（与酒馆世界书注入顺序一致）
        const sorted = [...filteredEntries].sort((a, b) =>
            (a.order ?? 100) - (b.order ?? 100)
        );

        const parts = sorted
            .map(e => e.content?.trim())
            .filter(Boolean);

        if (!parts.length) return '';
        return parts.join('\n');
    }

    // ── 完整管线 ──────────────────────────────────────────────

    /**
     * 一站式处理：读取 → 过滤 → 组装
     * @param {Object} options
     * @param {string[]} options.selectedBooks
     * @param {string}   options.contextText   当前消息文本 + 角色名
     * @param {number}   options.tokenBudget
     * @param {'auto'|'all_active'} options.keywordFilterMode
     */
    async processForScene(options) {
        const {
            selectedBooks = [],
            contextText = '',
            tokenBudget = 2000,
            keywordFilterMode = 'auto',
        } = options;

        if (!selectedBooks.length) return '';

        const results = await Promise.allSettled(
            selectedBooks.map(name => this.getEntriesWithState(name))
        );
        const allEntries = [];
        for (let i = 0; i < results.length; i++) {
            if (results[i].status === 'fulfilled') {
                allEntries.push(...results[i].value);
            } else {
                console.warn(`[novel-draw/WorldbookProcessor] Failed to read "${selectedBooks[i]}":`, results[i].reason);
            }
        }

        if (!allEntries.length) return '';

        const filtered = this.filterEntries(allEntries, contextText, keywordFilterMode);
        return this.assembleContent(filtered);
    }
}
