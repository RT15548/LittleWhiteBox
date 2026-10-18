/* eslint-env node */
import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { effectScope, ref, shallowRef } from 'vue';
import { parseHTML } from 'linkedom';
import { useTavernManagerRunSync } from '../app-src/features/manager/useTavernManagerRunSync.ts';

// Contract: a first-seen run must update the list and refresh completed domains;
// missing timer history must not interrupt synchronization (invisible stale state).
test('first-seen live and completed runs synchronize without a previous timer record', () => {
    const previousWindow = globalThis.window, previousDocument = globalThis.document;
    const { window, document } = parseHTML('<html><body></body></html>');
    globalThis.window = window;
    globalThis.document = document;
    const scope = effectScope();
    try {
        const selectedSessionId = ref('');
        const managerRuns = shallowRef([]);
        const refreshed = [];
        const sync = scope.run(() => useTavernManagerRunSync({
            selectedSessionId, managerRuns, managerStatusClock: ref(0),
            refreshSettledDomains: async (sessionId, run) => { refreshed.push([sessionId, run.id]); },
            kickWorker: () => {},
        }));
        selectedSessionId.value = 'session';
        const run = { id: 'run', sessionId: 'session', turn: 1, userOrder: 0, assistantOrder: 1,
            trigger: 'accepted_turn', status: 'running', createdAt: 1, updatedAt: 1 };
        sync.acceptSavedRun('session', run);
        assert.equal(managerRuns.value[0].status, 'running');
        sync.acceptSavedRun('session', { ...run, status: 'completed', updatedAt: 2 });
        assert.equal(managerRuns.value[0].status, 'completed');
        assert.deepEqual(refreshed, [['session', 'run']]);
    } finally {
        scope.stop();
        globalThis.window = previousWindow;
        globalThis.document = previousDocument;
    }
});
