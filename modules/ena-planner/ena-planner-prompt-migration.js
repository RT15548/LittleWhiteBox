// Upgrade boundary for upstream's saved assistant-prefill blocks. Remove when
// pre-user-tail configurations are no longer supported; never run during planning.
export function migratePlannerPromptConfig(config) {
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
