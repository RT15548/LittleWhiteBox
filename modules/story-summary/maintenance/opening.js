import { MEMORY_COLLECTIONS } from './domain.js';
import { estimateConversationTokens, estimateTokenCount } from '../../agent-core/runtime/context-tokens.js';
import { unionRanges } from './ranges.js';
import { recordHandle } from './records.js';
import { MEMORY_PAGE_SIZE } from './limits.js';

/** The directory is lightweight; only budget-sized pages are projected into the opening. */
export function buildMemoryOpening({ task, read, maxTokens }) {
    const ranges = unionRanges([...task.pending, ...task.contextRanges]);
    const opening = { task, memory: [], memoryDirectory: MEMORY_COLLECTIONS.map(collection => {
        const total = read({ collection, ranges, limit: 0 }).total;
        return { collection, total, next: total ? { collection, ranges } : null };
    }) };
    const estimate = () => estimateConversationTokens({ messages: [{ role: 'user', content: JSON.stringify(opening) }] });
    let tokens = estimate();
    for (const collection of ['facts', 'events', 'anchors', 'characters', 'arcs', 'keywords', 'characterAliases']) {
        const directory = opening.memoryDirectory.find(item => item.collection === collection);
        let cursor;
        while (directory.next && tokens + 100 < maxTokens) {
            const page = read({ collection, ranges, limit: MEMORY_PAGE_SIZE, ...(cursor ? { cursor } : {}) });
            let supplied = 0;
            for (const record of page.items) {
                if (Object.hasOwn(record, 'excerpt')) break;
                const size = estimateTokenCount(JSON.stringify(JSON.stringify(record)));
                if (tokens + size + 100 > maxTokens) break;
                opening.memory.push(record); tokens += size; supplied++;
                cursor = recordHandle(record);
                directory.next = { collection, ranges, cursor };
            }
            if (supplied < page.items.length) break;
            directory.next = page.next ? { collection, ranges, cursor } : null;
            if (!page.items.length) break;
        }
    }
    while (opening.memory.length && estimate() > maxTokens) {
        const removed = opening.memory.pop();
        const directory = opening.memoryDirectory.find(item => item.collection === removed.collection);
        const previous = opening.memory.filter(item => item.collection === removed.collection).at(-1);
        directory.next = { collection: removed.collection, ranges, ...(previous ? { cursor: recordHandle(previous) } : {}) };
    }
    return opening;
}
