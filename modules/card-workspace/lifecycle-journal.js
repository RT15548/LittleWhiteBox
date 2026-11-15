import db from '../assistant/shared/session-db.js';

// Only unfinished card rename/delete operations survive reload. The final
// completion removes the record; no history or additional schema is retained.
export const LIFECYCLE_JOURNAL_KEY = 'card-workspace-lifecycle';

export function createLifecycleJournal(database = db) {
    const table = database.table('meta');
    const read = async () => (await table.get(LIFECYCLE_JOURNAL_KEY))?.operations ?? [];
    return {
        read,
        // IndexedDB serializes this entire read/modify/write across tabs.
        // The transform is synchronous; network and UI work stay outside.
        update: transform => database.transaction('rw', table, async () => {
            const current = await read();
            const next = transform(current);
            if (next !== current) {
                if (next.length) await table.put({ key: LIFECYCLE_JOURNAL_KEY, operations: next });
                else await table.delete(LIFECYCLE_JOURNAL_KEY);
            }
            return next;
        }),
    };
}
