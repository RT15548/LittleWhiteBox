import assert from 'node:assert/strict';
import { EXT_ID } from '../../core/constants.js';
import { eventVectorsTable } from '../../modules/story-summary/data/db.js';
import { buildSummaryUndo } from '../../modules/story-summary/data/summary-undo.js';
import {
    clearSummaryData,
    executeRollback,
    getSummaryStore,
    isSummaryConsumable,
    rollbackSummaryIfNeeded,
    rollbackSummaryOnce,
} from '../../modules/story-summary/data/store.js';
import { getNextEventId } from '../../modules/story-summary/generate/summary-result.js';
import {
    getAllEventVectors,
    saveEventVectors,
} from '../../modules/story-summary/vector/storage/chunk-store.js';
import { getContext, __setReplayContext } from './shims/extensions.js';
import { __setChatMetadata } from './shims/script.js';

// Exercise the real store and IndexedDB boundary: failed cleanup must not release
// event IDs, and failed metadata writes may lose derived vectors, never the story.
export async function runRollbackStorageCheck() {
    const previousSaveMetadata = getContext().saveMetadata;
    const empty = { keywords: [], events: [], characters: { main: [] }, arcs: [], facts: [], characterAliases: [] };
    const event = (id, summary, floor) => ({
        id, title: summary, summary, participants: [], causedBy: [], _addedAt: floor, memoryRole: '具体经历',
    });
    const first = { ...structuredClone(empty), events: [event('evt-1', '保留的故事', 19)] };
    const second = { ...structuredClone(first), events: [...first.events, event('evt-2', '撤销的故事', 39)] };
    const cases = ['manual-cleanup-failure', 'empty-cleanup-failure', 'automatic-cleanup-failure', 'swipe-cleanup-failure',
        'rollback-metadata-failure', 'clear-cleanup-failure', 'clear-metadata-failure'];

    try {
        for (const name of cases) {
            const chatId = `rollback-storage-${name}`;
            let metadataWrites = 0;
            let failMetadata = name.endsWith('metadata-failure');
            __setReplayContext({
                chatId,
                chat: Array.from({ length: name.startsWith('automatic') ? 39 : 40 }, () => ({ mes: '正文' })),
                saveMetadata: async () => {
                    if (failMetadata) throw new Error('simulated metadata persistence failure');
                    metadataWrites++;
                },
            });
            __setChatMetadata({ extensions: { [EXT_ID]: { storySummary: {
                json: structuredClone(second),
                lastSummarizedMesId: 39,
                summaryHistory: [
                    { format: 1, previousEndMesId: -1, endMesId: 19, undo: buildSummaryUndo(empty, first) },
                    { format: 1, previousEndMesId: 19, endMesId: 39, undo: buildSummaryUndo(first, second) },
                ],
            } } } });
            const store = getSummaryStore();
            const before = structuredClone(store);
            await saveEventVectors(chatId, [
                { eventId: 'evt-1', vector: [1, 0] },
                { eventId: 'evt-2', vector: [0, 1] },
            ], 'test');

            const failDeletion = (_key, record) => {
                if (record.chatId === chatId && record.eventId === 'evt-2') {
                    throw new Error('simulated vector deletion failure');
                }
            };
            if (!failMetadata) eventVectorsTable.hook('deleting', failDeletion);
            try {
                if (name.startsWith('clear')) {
                    await assert.rejects(clearSummaryData(chatId), /simulated/);
                } else if (name.startsWith('manual')) {
                    const result = await rollbackSummaryOnce(chatId);
                    assert.equal(result.success, false);
                    assert.equal(result.reason, 'event_vector_cleanup_failed');
                } else {
                    const result = name.startsWith('automatic')
                        ? await rollbackSummaryIfNeeded()
                        : name.startsWith('swipe')
                            ? await rollbackSummaryIfNeeded({ changedFromFloor: 39 })
                            : await executeRollback(chatId, store, name.startsWith('empty') ? -1 : 19);
                    assert.equal(result.status, 'failed', name);
                    assert.equal(result.reason, failMetadata ? 'metadata_persistence_failed' : 'event_vector_cleanup_failed');
                }
            } finally {
                eventVectorsTable.hook('deleting').unsubscribe(failDeletion);
            }

            assert.deepEqual(store.json, before.json, name);
            assert.deepEqual(store.summaryHistory, before.summaryHistory, name);
            assert.equal(store.lastSummarizedMesId, 39, name);
            assert.equal(getNextEventId(store.json.events), 3, 'failed rollback must not release evt-2');
            if (name.startsWith('automatic') || name.startsWith('swipe')) {
                assert.equal(store.summaryInvalid, true);
                assert.equal(isSummaryConsumable(store, 40), false);
                assert.equal(metadataWrites, 1, 'only the unusable-summary marker is persisted');
            } else {
                assert.deepEqual(store, before, name);
                assert.equal(metadataWrites, 0, name);
            }
            const vectorsAfterFailure = await getAllEventVectors(chatId);
            assert.equal(vectorsAfterFailure.some(item => item.eventId === 'evt-2'), !failMetadata, name);

            // Recovery uses the same entry point. New events may reuse IDs only
            // after cleanup succeeds; the old vector must then be absent.
            failMetadata = false;
            if (name.startsWith('clear')) {
                await clearSummaryData(chatId);
                assert.equal(store.lastSummarizedMesId, -1);
                assert.deepEqual(await getAllEventVectors(chatId), []);
            } else {
                const target = name.startsWith('empty') ? -1 : 19;
                const result = await executeRollback(chatId, store, target);
                assert.equal(result.status, 'rolled_back', name);
                assert.equal(store.lastSummarizedMesId, target);
                assert.notEqual(store.summaryInvalid, true);
                const vectors = await getAllEventVectors(chatId);
                assert.deepEqual(vectors.map(item => item.eventId), target < 0 ? [] : ['evt-1']);
                const reusedId = `evt-${getNextEventId(store.json?.events)}`;
                assert.equal(vectors.some(item => item.eventId === reusedId), false);
                store.json ||= structuredClone(empty);
                store.json.events.push(event(reusedId, '全新的故事', 39));
                await saveEventVectors(chatId, [{ eventId: reusedId, vector: [0.6, 0.8] }], 'test');
                const replacement = (await getAllEventVectors(chatId)).find(item => item.eventId === reusedId);
                assert.ok(Math.abs(replacement.vector[0] - 0.6) < 1e-6);
            }
        }
        return { cases: cases.length };
    } finally {
        __setReplayContext({ saveMetadata: previousSaveMetadata });
    }
}
