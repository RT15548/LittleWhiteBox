import assert from 'node:assert/strict';
import test from 'node:test';

function createStorage() {
    const values = new Map();
    return {
        getItem: key => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, String(value)),
        removeItem: key => values.delete(key),
    };
}

test('pagehide writes a farewell only when the page is actually leaving', async () => {
    const storage = createStorage();
    const originalAddEventListener = Object.getOwnPropertyDescriptor(globalThis, 'addEventListener');
    const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    let pagehideHandler = null;

    Object.defineProperty(globalThis, 'addEventListener', {
        configurable: true,
        value(type, handler) {
            if (type === 'pagehide') pagehideHandler = handler;
        },
    });
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });

    try {
        const farewell = await import('../page-farewell.js');
        farewell.trackPageJobLease('job-pagehide', 'lease-pagehide');
        assert.equal(typeof pagehideHandler, 'function');

        pagehideHandler({ persisted: true });
        assert.deepEqual(farewell.readPageFarewells({ storage }), []);

        pagehideHandler({ persisted: false });
        assert.deepEqual(farewell.readPageFarewells({ storage }).map(({ kind, id, leaseId }) => ({
            kind,
            id,
            leaseId,
        })), [{ kind: 'job', id: 'job-pagehide', leaseId: 'lease-pagehide' }]);
        farewell.untrackPageJobLease('job-pagehide', 'lease-pagehide');
    } finally {
        if (originalAddEventListener) {
            Object.defineProperty(globalThis, 'addEventListener', originalAddEventListener);
        } else {
            delete globalThis.addEventListener;
        }
        if (originalLocalStorage) {
            Object.defineProperty(globalThis, 'localStorage', originalLocalStorage);
        } else {
            delete globalThis.localStorage;
        }
    }
});
