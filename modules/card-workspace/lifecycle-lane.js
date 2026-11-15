import { observeBackgroundTask } from '../../shared/common/async-errors.js';

const PREFIX = 'LittleWhiteBox_CardLane:';
const resultOf = request => new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
});

// Called synchronously inside the journal's short transaction. All pages thus
// reserve their cards in the same order. IndexedDB queues delete/open requests
// by database name: a later delete waits for this connection to close.
// These databases have NO stores or records. The live connection is the lane;
// completion deletes it, and closing a page releases it without leases/polling.
// No workspace/chat transaction is held while network work runs.
export function reserveCardLifecycle(avatars, factory = indexedDB) {
    const reservations = [...new Set(avatars)].map(avatar => {
        const name = PREFIX + encodeURIComponent(avatar);
        const removed = resultOf(factory.deleteDatabase(name));
        const opened = resultOf(factory.open(name));
        // Submit both requests before yielding the journal transaction.
        const ready = Promise.allSettled([removed, opened]).then(results => {
            const error = results.find(result => result.status === 'rejected');
            if (error) {
                if (results[1].status === 'fulfilled') results[1].value.close();
                throw error.reason;
            }
            return results[1].value;
        });
        return { name, ready };
    });
    const ready = Promise.allSettled(reservations.map(item => item.ready));
    function release(results) {
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') result.value.close();
            observeBackgroundTask(resultOf(factory.deleteDatabase(reservations[index].name)),
                { source: import.meta.url, operation: 'releaseCardLane' });
        });
    }
    return {
        async run(work) {
            const results = await ready;
            try {
                const error = results.find(result => result.status === 'rejected');
                if (error) throw error.reason;
                return await work();
            } finally { release(results); }
        },
        cancel() { observeBackgroundTask(ready.then(release), { source: import.meta.url, operation: 'cancelCardLane' }); },
    };
}
