import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import {
    clearEmbeddingFailureNotice, clearRecallFailureNotice, notifyRecallFailure,
    notifySummaryStartupFailure, notifyUnconfirmedMemory, runClearWithFeedback,
    createRecallRetryNotice,
} from '../user-feedback.js';
import { recallFailureNotice } from '../generate/recall-failure.js';
import { createRecallPrefetchCoordinator } from '../generate/recall-prefetch.js';
import { runRequiredRecall } from '../generate/required-recall.js';

// Only the host toast/console boundary is replaced. Exercise the real policy,
// including replacement of blocked-send notices and loaded-memory ownership.
const originalToastr = globalThis.toastr;
const originalError = console.error;
let shown, visible, errors;
const recall = () => notifyRecallFailure(recallFailureNotice(null, { code: 'RECALL_EMBEDDING_FAILED' }));

beforeEach(() => {
    clearEmbeddingFailureNotice();
    clearRecallFailureNotice();
    shown = []; visible = new Set(); errors = [];
    const show = level => (_message, _title, options) => {
        const toast = { level, options, finish() { visible.delete(toast); } };
        shown.push(toast); visible.add(toast);
        return toast;
    };
    globalThis.toastr = {
        warning: show('warning'), error: show('error'), info: show('info'),
        clear(toast, options) {
            // Never clear unrelated host notifications, even if ours expired.
            assert.ok(toast);
            assert.equal(options.force, true);
        },
    };
    console.error = (...args) => errors.push(args);
});

after(() => {
    clearEmbeddingFailureNotice();
    clearRecallFailureNotice();
    if (originalToastr === undefined) delete globalThis.toastr;
    else globalThis.toastr = originalToastr;
    console.error = originalError;
});

test('only an unconfirmed save warns, once per loaded memory even after repeated reports', () => {
    const owner = {};
    for (const state of ['ready', 'saving', 'source_invalid']) {
        assert.equal(notifyUnconfirmedMemory(state, owner), false);
    }
    assert.equal(shown.length, 0);
    assert.equal(notifyUnconfirmedMemory('unconfirmed', owner), true);
    assert.equal(notifyUnconfirmedMemory('unconfirmed', owner), true);
    clearRecallFailureNotice(); // Reopening/toggling is not a new save or memory load.
    notifyUnconfirmedMemory('unconfirmed', owner);
    assert.equal(shown.length, 1);
    assert.equal(shown[0].level, 'error');
    notifyUnconfirmedMemory('unconfirmed', {});
    assert.equal(shown.length, 2);
});

test('a recall retry notice is shown once, survives waiting, and clears only its own run', () => {
    const unrelated = toastr.info('unrelated');
    const first = createRecallRetryNotice();
    first.show(); first.show();
    assert.equal(shown.length, 2);
    assert.equal(shown[1].level, 'info');
    assert.equal(shown[1].options.timeOut, 0);
    assert.equal(shown[1].options.extendedTimeOut, 0);
    const second = createRecallRetryNotice();
    second.show();
    first.clear(); first.clear();
    assert.deepEqual([...visible], [unrelated, shown[2]]);
    second.clear();
    second.show(); // A dismissed/finished run cannot nag again on the next retry.
    assert.equal(shown.length, 3);
    assert.deepEqual([...visible], [unrelated]);
});

test('replacing an expired failure and cleaning up never remove unrelated notices', () => {
    const unrelated = toastr.info('unrelated');
    recall();
    visible.delete(shown[1]); // The native timeout already removed it.
    recall();
    assert.equal(visible.size, 2);
    clearEmbeddingFailureNotice();
    clearRecallFailureNotice();
    assert.deepEqual([...visible], [unrelated]);
});

for (const cause of [
    { kind: 'http', status: 401 }, { kind: 'http', status: 403 },
    { kind: 'http', status: 429 }, { kind: 'http', status: 404 },
    { kind: 'configuration' }, { kind: 'invalid_response' }, {}, null,
]) {
    test(`each blocked send refreshes one visible reason, without cooldown: ${JSON.stringify(cause)}`, async () => {
        const unrelated = toastr.info('unrelated');
        const error = cause === null ? new Error('storage failure')
            : Object.assign(new Error('query failed', {
                cause: Object.assign(new Error(), { embeddingFailure: cause }),
            }), { code: 'RECALL_EMBEDDING_FAILED' });
        const context = { chatId: 'chat', chat: [] };
        const coordinator = createRecallPrefetchCoordinator({
            getContext: () => context, prepare: async () => { throw error; },
        });
        let stopped = 0;
        for (let attempt = 0; attempt < 2; attempt++) {
            const { slot: run } = coordinator.join({ chatId: context.chatId, type: 'normal' });
            await runRequiredRecall({ coordinator, run,
                commit: () => assert.fail('failed recall cannot commit'),
                abort: () => { stopped++; },
                onFailure: failure => notifyRecallFailure(recallFailureNotice(run.cancelReason, failure)),
            });
            assert.equal(stopped, attempt + 1);
            assert.equal(shown.length, attempt + 2);
            assert.equal(shown.at(-1).options.preventDuplicates, false);
            assert.deepEqual([...visible], [unrelated, shown.at(-1)]);
        }
    });
}

for (const kind of ['vectors', 'anchors']) {
    test(`${kind}: failed clearing has one failure receipt, preserves the cause and never retries`, async () => {
        const failure = new Error('storage failure');
        let calls = 0;
        await runClearWithFeedback({ kind, isCurrent: () => true, reportUnconfirmed: () => false,
            clear: async () => { calls++; throw failure; },
            refresh: () => assert.fail('no successful clear to refresh'),
        });
        assert.equal(calls, 1);
        assert.deepEqual(shown.map(toast => toast.level), ['error']);
        assert.equal(errors[0][1], failure);
    });

    test(`${kind}: failed statistics refresh does not report a failed data clear`, async () => {
        let cleared = false;
        await runClearWithFeedback({ kind, isCurrent: () => true, reportUnconfirmed: () => false,
            clear: async () => { cleared = true; return true; },
            refresh: async () => { throw new Error('statistics failure'); },
        });
        assert.equal(cleared, true);
        assert.deepEqual(shown.map(toast => toast.level), ['warning']);
    });
}

test('successful clearing refreshes and confirms once; skipped queued work stays silent', async () => {
    let refreshed = 0;
    const options = { kind: 'vectors', isCurrent: () => true, reportUnconfirmed: () => false,
        refresh: async () => { refreshed++; } };
    for (const result of [false, undefined]) {
        await runClearWithFeedback({ ...options, clear: async () => result });
    }
    assert.equal(shown.length, 0);
    await runClearWithFeedback({ ...options, clear: async () => true });
    assert.equal(refreshed, 1);
    assert.deepEqual(shown.map(toast => toast.level), ['info']);
});

test('old-chat operations do not publish success or failure into another chat', async () => {
    for (const failed of [false, true]) {
        await runClearWithFeedback({ kind: 'anchors', isCurrent: () => false, reportUnconfirmed: () => false,
            clear: async () => { if (failed) throw new Error('late failure'); return true; },
            refresh: () => assert.fail('old chat must not refresh current chat'),
        });
    }
    assert.equal(shown.length, 0);
    assert.equal(errors.length, 1);
});

test('a clear blocked by save uncertainty uses the safety notice, not an extra generic error', async () => {
    const owner = {};
    notifyUnconfirmedMemory('unconfirmed', owner);
    await runClearWithFeedback({ kind: 'anchors', isCurrent: () => true,
        reportUnconfirmed: () => notifyUnconfirmedMemory('unconfirmed', owner),
        clear: async () => { throw new Error('blocked'); }, refresh() {},
    });
    assert.equal(shown.length, 1);
});

test('a startup failure is visible and keeps its original diagnostic cause', () => {
    const failure = new Error('initialization failure');
    notifySummaryStartupFailure(failure);
    assert.deepEqual(shown.map(toast => toast.level), ['error']);
    assert.equal(errors[0][1], failure);
});

test('suppressing a duplicate or obsolete startup notice still preserves its cause', () => {
    const failure = new Error('initialization failure');
    notifySummaryStartupFailure(failure, false);
    assert.equal(shown.length, 0);
    assert.equal(errors[0][1], failure);
});
