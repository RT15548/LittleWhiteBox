import assert from 'node:assert/strict';
import test from 'node:test';
import { runSequentialImageBatch } from '../sequential-image-batch.js';

// A slow save, a full disk, or cancellation must never lose a returned image or buy the next one.
test('a returned image is delivered before cancellation can stop its siblings', async () => {
    const controller = new AbortController(), sent = [], saved = [], stopped = [];
    await runSequentialImageBatch({ count: 3, signal: controller.signal,
        request: async index => { sent.push(index); return 'paid'; },
        onItemReady: async ({ index }) => { await Promise.resolve(); controller.abort(); saved.push(index); },
        onItemSettled: ({ index }) => stopped.push(index) });
    assert.deepEqual([sent, saved, stopped], [[0], [0], [1, 2]]);
});

test('a failed delivery stops before another request is made', async () => {
    const sent = [];
    await assert.rejects(runSequentialImageBatch({ count: 3,
        request: async index => { sent.push(index); return 'paid'; },
        onItemReady: () => { throw Error('disk full'); } }), /disk full/);
    assert.deepEqual(sent, [0]);
});
