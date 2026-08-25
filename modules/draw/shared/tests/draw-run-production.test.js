import assert from 'node:assert/strict';
import test from 'node:test';

import {
    DrawRunProductionError,
    isDrawRunCancelledError,
    submitProviderDrawRun,
} from '../draw-run-production.js';
import { subscribeDrawRunActivity } from '../draw-run-activity.js';
import { formatDrawRunProgress, resolveDrawRunUiState } from '../draw-run-ui-state.js';
import { hashSceneSource } from '../scene-source.js';

function baseOptions(overrides = {}) {
    const message = { mes: 'hello', extra: {} };
    return {
        ctx: { chat: [message], getRequestHeaders: () => ({ token: 'test' }) },
        message,
        messageId: 0,
        provider: 'sd-webui',
        preparePlanner: async () => ({ planner: { validationContext: { effectiveMaxImages: 1 } } }),
        createGenerationRecipe: () => ({ recipe: true }),
        getCurrentContext: () => ({ chat: [message] }),
        syncActiveSwipe: () => true,
        isMessageBeingEdited: () => false,
        pendingJobsLoader: async () => [],
        ...overrides,
    };
}

test('Draw Run progress labels use real backend stages and item positions', () => {
    assert.equal(formatDrawRunProgress({ run: { progress: { stage: 'queued' } } }), '排队');
    assert.equal(formatDrawRunProgress({ stage: 'planning' }), '分析中');
    assert.equal(formatDrawRunProgress({ stage: 'queued', current: 1, total: 2 }), '排队');
    assert.equal(formatDrawRunProgress({ stage: 'progress', current: 1, total: 2 }), '1/2');
    assert.equal(formatDrawRunProgress({ stage: 'dispatched' }), '接回中');
    assert.equal(formatDrawRunProgress({ stage: 'delivering' }), '接回中');
    assert.equal(formatDrawRunProgress({ stage: 'reconnecting' }), '重连');
    assert.equal(formatDrawRunProgress({}), '生成中');
});

test('production entry refuses an old backend without running Planner or silently falling back', async () => {
    let prepared = 0;
    let submitted = 0;
    await assert.rejects(
        submitProviderDrawRun(baseOptions({
            statusLoader: async () => ({ ready: true, capabilities: ['image-batch-jobs-v1'] }),
            preparePlanner: async () => { prepared += 1; },
            submit: async () => { submitted += 1; },
        })),
        error => error instanceof DrawRunProductionError
            && error.code === 'DRAW_RUN_BACKEND_OUTDATED'
            && /不会退回浏览器规划/.test(error.message),
    );
    assert.equal(prepared, 0);
    assert.equal(submitted, 0);
});

test('a user abort during pre-marker preparation stays a cancellation and never submits', async () => {
    const controller = new AbortController();
    let submitted = 0;
    await assert.rejects(submitProviderDrawRun(baseOptions({
        signal: controller.signal,
        statusLoader: async () => ({ ready: true, capabilities: ['draw-runs-v1'] }),
        preparePlanner: async () => {
            controller.abort();
            throw new Error('provider request failed');
        },
        submit: async () => { submitted += 1; },
    })), error => isDrawRunCancelledError(error));
    assert.equal(submitted, 0);
});

test('switching image provider cannot start a second Draw Run on the same active swipe', async () => {
    const options = baseOptions();
    options.message.extra.xbDrawRuns = {
        'run-test-203': {
            version: 1,
            provider: 'novelai',
            sourceHash: 'hash-1',
            targetHash: 'target-1',
            createdAt: 100,
        },
    };
    let statusChecks = 0;
    await assert.rejects(
        submitProviderDrawRun({
            ...options,
            provider: 'sd-webui',
            statusLoader: async () => {
                statusChecks += 1;
                return { ready: true, capabilities: ['draw-runs-v1'] };
            },
        }),
        error => error?.code === 'DRAW_RUN_ALREADY_PENDING',
    );
    assert.equal(statusChecks, 0);
});

test('a persisted image journal with a live slot blocks replacement before Planner admission', async () => {
    let statusChecks = 0;
    let prepared = 0;
    await assert.rejects(
        submitProviderDrawRun(baseOptions({
            message: { mes: 'hello [image:slot-live]', extra: {} },
            pendingJobsLoader: async () => [{
                delivery: { mode: 'slots' },
                items: [{ slotId: 'slot-live' }],
            }],
            statusLoader: async () => {
                statusChecks += 1;
                return { ready: true, capabilities: ['draw-runs-v1'] };
            },
            preparePlanner: async () => { prepared += 1; },
        })),
        error => error?.code === 'DRAW_RUN_IMAGE_JOB_PENDING',
    );
    assert.equal(statusChecks, 0);
    assert.equal(prepared, 0);
});

test('a gallery-only journal or a user-deleted slot does not lock the current swipe', async () => {
    const submitted = [];
    const options = baseOptions({
        pendingJobsLoader: async () => [
            { delivery: { mode: 'gallery' }, items: [{ slotId: 'slot-gallery' }] },
            { delivery: { mode: 'slots' }, items: [{ slotId: 'slot-deleted' }] },
        ],
        statusLoader: async () => ({ ready: true, capabilities: ['draw-runs-v1'] }),
        submit: async value => {
            submitted.push(value);
            return { status: 'accepted', runId: 'run-test-207' };
        },
    });
    const result = await submitProviderDrawRun(options);
    assert.equal(result.status, 'accepted');
    assert.equal(submitted.length, 1);
});

test('production entry prepares and submits exactly once after capability admission', async () => {
    const calls = [];
    const prepared = { planner: { validationContext: { effectiveMaxImages: 2 } } };
    const result = await submitProviderDrawRun(baseOptions({
        automatic: true,
        statusLoader: async ({ getHeaders }) => {
            calls.push(['status', getHeaders()]);
            return { ready: true, capabilities: ['image-batch-jobs-v1', 'draw-runs-v1'] };
        },
        preparePlanner: async limits => {
            calls.push(['prepare', limits]);
            return prepared;
        },
        createGenerationRecipe: value => {
            calls.push(['recipe', value]);
            return { recipe: true };
        },
        submit: async options => {
            calls.push(['submit', options]);
            return { status: 'accepted', runId: 'run-test-204' };
        },
    }));
    assert.equal(result.status, 'accepted');
    assert.deepEqual(calls.map(call => call[0]), ['status', 'prepare', 'recipe', 'submit']);
    assert.deepEqual(calls[1][1], { maxPlanImages: 20 });
    assert.equal(calls[3][1].prepared, prepared);
    assert.deepEqual(calls[3][1].generationRecipe, { recipe: true });
    assert.equal(calls[3][1].imageProvider, 'sd-webui');
    assert.equal(calls[3][1].automatic, true);
    assert.equal(calls[3][1].targetHash, hashSceneSource('hello'));
});

test('production freezes the exact target before asynchronous admission and preparation', async () => {
    const options = baseOptions();
    const initialTargetHash = hashSceneSource(options.message.mes);
    const initialSwipeIndex = 0;
    let submittedOptions = null;

    await submitProviderDrawRun({
        ...options,
        statusLoader: async () => {
            options.message.swipe_id = 1;
            options.message.mes = 'changed while checking capability';
            return { ready: true, capabilities: ['draw-runs-v1'] };
        },
        submit: async value => {
            submittedOptions = value;
            return { status: 'accepted', runId: 'run-test-206' };
        },
    });

    assert.equal(submittedOptions.targetHash, initialTargetHash);
    assert.equal(submittedOptions.targetSwipeIndex, initialSwipeIndex);
    assert.notEqual(submittedOptions.targetHash, hashSceneSource(options.message.mes));
});

test('an accepted production submission wakes recovery without waiting for a browser lifecycle event', async () => {
    const activities = [];
    const dispose = subscribeDrawRunActivity(detail => activities.push(detail));
    try {
        await submitProviderDrawRun(baseOptions({
            statusLoader: async () => ({ ready: true, capabilities: ['draw-runs-v1'] }),
            submit: async () => ({ status: 'accepted', runId: 'run-test-205' }),
        }));
    } finally {
        dispose();
    }
    assert.deepEqual(activities, [{
        provider: 'sd-webui',
        messageId: 0,
        phase: 'accepted',
        runId: 'run-test-205',
        wakeRecovery: true,
    }]);
});

test('marker-driven UI keeps uncertain and cancelling states until the marker disappears', () => {
    assert.equal(resolveDrawRunUiState({
        currentState: 'submitting', pending: false, detail: { phase: 'reconciled' }, messageId: 1, provider: 'novelai',
    }), 'submitting');
    assert.equal(resolveDrawRunUiState({
        currentState: 'idle', pending: true, messageId: 1, provider: 'novelai',
    }), 'uncertain');
    assert.equal(resolveDrawRunUiState({
        currentState: 'uncertain', pending: true, detail: { phase: 'active' }, messageId: 1, provider: 'novelai',
    }), 'accepted');
    assert.equal(resolveDrawRunUiState({
        currentState: 'submitting', pending: true, detail: { phase: 'uncertain' }, messageId: 1, provider: 'novelai',
    }), 'uncertain');
    assert.equal(resolveDrawRunUiState({
        currentState: 'uncertain', pending: true, detail: { phase: 'reconciled' }, messageId: 1, provider: 'novelai',
    }), 'uncertain');
    assert.equal(resolveDrawRunUiState({
        currentState: 'accepted', pending: true, detail: { phase: 'cancelling' }, messageId: 1, provider: 'novelai',
    }), 'cancelling');
    assert.equal(resolveDrawRunUiState({
        currentState: 'cancelling', pending: false, messageId: 1, provider: 'novelai',
    }), 'idle');
});

test('a cancellation that reached neither chat nor backend returns the pending run to accepted', () => {
    assert.equal(resolveDrawRunUiState({
        currentState: 'cancelling',
        pending: true,
        detail: { provider: 'sd-webui', messageId: 3, phase: 'cancel_failed' },
        provider: 'sd-webui',
        messageId: 3,
    }), 'accepted');
});
