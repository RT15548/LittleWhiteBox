// Upgrade boundary for upstream's saved assistant-prefill blocks. Remove when
// pre-user-tail configurations are no longer supported; never run during planning.
export function migratePlannerPromptConfig(config) {
    // Upstream <=3.1.10 stored private scanner options. Native scanning follows
    // the host settings; discard these at load, not during each planning run.
    delete config.includeGlobalWorldbooks;
    delete config.excludeWorldbookPosition4;
    delete config.worldbookExcludeNames;
    // The host now supplies the complete processed context, including history.
    delete config.chatExcludeTags;
    delete config.plotCount;
    const blockLists = [config.promptBlocks, ...Object.values(config.promptTemplates || {})];
    for (const blocks of blockLists) {
        if (!Array.isArray(blocks)) continue;
        for (const block of blocks) {
            if (block?.role !== 'assistant') continue;
            block.role = 'user';
        }
    }
    return config;
}
