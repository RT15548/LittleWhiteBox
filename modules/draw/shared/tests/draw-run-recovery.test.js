import assert from 'node:assert/strict';
import test from 'node:test';

import {
    DRAW_RUN_BLOCKED_RETRY_MS,
    DrawRunAdoptionRecoveryStatus,
    DrawRunPendingAdoptionAction,
    DrawRunRecoveryAction,
    planDrawRunAdoptionRetry,
    planDrawRunPollDelay,
    planDrawRunRecovery,
    planPendingAdoptionRecovery,
} from '../draw-run-recovery.js';
import { PendingJobAdoptionPhase, PendingJobState } from '../pending-image-jobs.js';

const NOW = 500_000;

function marker(runId = 'run-test-301', createdAt = NOW - 1_000) {
    return {
        runId,
        marker: { provider: 'novelai', sourceHash: 'hash-1', createdAt },
    };
}

function run(runId = 'run-test-301', state = 'dispatched') {
    return {
        id: runId,
        state,
        provider: 'novelai',
        sourceHash: 'hash-1',
        handoffManifest: { childJobId: `draw-run:${runId}` },
    };
}

function record(runId = 'run-test-301', overrides = {}) {
    const result = {
        jobId: `draw-run:${runId}`,
        originRunId: runId,
        originRunAckReady: true,
        state: PendingJobState.ACTIVE,
        createdAt: NOW - 1_000,
        chatTarget: { chatId: 'chat-1' },
        ...overrides,
    };
    if (result.state === PendingJobState.ADOPTING && !result.adoptionPhase) {
        result.adoptionPhase = PendingJobAdoptionPhase.PENDING;
    }
    return result;
}

test('a dispatched Draw Run is adopted until its journal is finalized', () => {
    const withoutJournal = planDrawRunRecovery({
        markers: [marker()],
        runs: [run()],
        records: [],
        now: NOW,
    });
    assert.deepEqual(withoutJournal.plan.map(entry => entry.action), [DrawRunRecoveryAction.ADOPT]);

    const withActiveJournal = planDrawRunRecovery({
        markers: [marker()],
        runs: [run()],
        records: [record()],
        now: NOW,
    });
    assert.deepEqual(
        withActiveJournal.plan.map(entry => entry.action),
        [DrawRunRecoveryAction.DROP_STALE_LOCAL_MARKER],
    );
});

test('an active journal proves server marker cleanup, so a stale tab only drops its local marker', () => {
    const staleTab = planDrawRunRecovery({
        markers: [marker()],
        runs: [run()],
        records: [record()],
        now: NOW,
    });
    assert.deepEqual(staleTab.plan.map(entry => entry.action), [
        DrawRunRecoveryAction.DROP_STALE_LOCAL_MARKER,
    ]);

    const result = planDrawRunRecovery({
        markers: [],
        runs: [run()],
        records: [record()],
        now: NOW,
    });
    assert.deepEqual(result.plan, []);
    assert.deepEqual(result.unclaimed, []);
});

test('a pending adoption abandons a missing run after the uncertainty window', () => {
    const recent = record('run-test-301', {
        state: PendingJobState.ADOPTING,
        originRunAckReady: false,
        createdAt: NOW - 119_999,
    });
    const withinWindow = planDrawRunRecovery({
        markers: [],
        runs: [],
        records: [recent],
        now: NOW,
    });
    assert.equal(withinWindow.plan[0].action, DrawRunRecoveryAction.WAIT);
    assert.equal(withinWindow.plan[0].reason, 'missing_run_uncertain');

    const expired = record('run-test-301', {
        state: PendingJobState.ADOPTING,
        originRunAckReady: false,
        createdAt: NOW - 120_000,
    });
    const withoutMarker = planDrawRunRecovery({
        markers: [],
        runs: [],
        records: [expired],
        now: NOW,
    });
    assert.equal(withoutMarker.plan[0].action, DrawRunRecoveryAction.ABANDON_ADOPTION);
    assert.equal(withoutMarker.plan[0].reason, 'run_missing');

    const withMarker = planDrawRunRecovery({
        markers: [marker('run-test-301', NOW - 120_000)],
        runs: [],
        records: [recent],
        now: NOW,
    });
    assert.equal(withMarker.plan[0].action, DrawRunRecoveryAction.ABANDON_ADOPTION);
});

test('a missing submission waits for the uncertainty window before clearing its marker', () => {
    const withinWindow = marker('run-test-302', NOW - 119_999);
    const expiredWindow = marker('run-test-303', NOW - 120_000);
    const result = planDrawRunRecovery({
        markers: [withinWindow, expiredWindow],
        runs: [],
        records: [],
        now: NOW,
    });
    assert.deepEqual(result.plan.map(entry => entry.action), [
        DrawRunRecoveryAction.WAIT,
        DrawRunRecoveryAction.CLEAR_MISSING_MARKER,
    ]);
});

test('backend Draw Runs without a marker or journal remain unclaimed and untouched', () => {
    const orphan = run('run-test-304');
    const result = planDrawRunRecovery({ markers: [], runs: [orphan], records: [], now: NOW });
    assert.deepEqual(result.plan, []);
    assert.deepEqual(result.unclaimed, [orphan]);
});

test('an expired child with a retained manifest still enters adoption instead of stranding its journal', () => {
    const result = planDrawRunRecovery({
        markers: [marker()],
        runs: [run('run-test-301', 'child_expired')],
        records: [record('run-test-301', { state: PendingJobState.ADOPTING })],
        now: NOW,
    });
    assert.deepEqual(result.plan.map(entry => entry.action), [DrawRunRecoveryAction.ADOPT]);
});

test('a dispatched child is never abandoned while its handoff manifest is unavailable', () => {
    const incompleteRun = {
        ...run(),
        childJobId: 'draw-run:run-test-301',
        handoffManifest: null,
    };
    const result = planDrawRunRecovery({
        markers: [marker()],
        runs: [incompleteRun],
        records: [record('run-test-301', { state: PendingJobState.ADOPTING })],
        now: NOW,
    });
    assert.equal(result.plan[0].action, DrawRunRecoveryAction.WAIT);
    assert.equal(result.plan[0].reason, 'handoff_manifest_missing');
    assert.equal(planDrawRunPollDelay(result.plan), DRAW_RUN_BLOCKED_RETRY_MS);
});

test('placing and ready records use persisted-chat recovery instead of stale local marker text', () => {
    for (const adoptionPhase of [PendingJobAdoptionPhase.PLACING, PendingJobAdoptionPhase.READY]) {
        const result = planDrawRunRecovery({
            markers: [marker()],
            runs: [run()],
            records: [record('run-test-301', {
                state: PendingJobState.ADOPTING,
                adoptionPhase,
            })],
            now: NOW,
        });
        assert.deepEqual(result.plan.map(entry => entry.action), [
            DrawRunRecoveryAction.RECOVER_ADOPTION,
        ]);

        const missingRun = planDrawRunRecovery({
            markers: [marker()],
            runs: [],
            records: [record('run-test-301', {
                state: PendingJobState.ADOPTING,
                adoptionPhase,
            })],
            now: NOW,
        });
        assert.equal(missingRun.plan[0].action, DrawRunRecoveryAction.RECOVER_ADOPTION);
    }
});

test('a slots adoption waits while its frozen target chat is not active', () => {
    const adopting = record('run-test-305', {
        state: PendingJobState.ADOPTING,
        chatTarget: { chatId: 'chat-a' },
        delivery: { mode: 'slots', chatId: 'chat-a', messageId: '4', swipeIndex: 0 },
    });
    const inactive = planDrawRunRecovery({
        markers: [],
        runs: [run('run-test-305')],
        records: [adopting],
        currentChatId: 'chat-b',
        now: NOW,
    });
    assert.equal(inactive.plan[0].action, DrawRunRecoveryAction.WAIT);
    assert.equal(inactive.plan[0].reason, 'target_chat_inactive');
    assert.deepEqual(inactive.unclaimed, []);

    const staleMarker = planDrawRunRecovery({
        markers: [marker('run-test-305')],
        runs: [run('run-test-305')],
        records: [adopting],
        currentChatId: 'chat-b',
        now: NOW,
    });
    assert.equal(staleMarker.plan[0].action, DrawRunRecoveryAction.WAIT);
    assert.equal(staleMarker.plan[0].reason, 'target_chat_inactive');

    const active = planDrawRunRecovery({
        markers: [],
        runs: [run('run-test-305')],
        records: [adopting],
        currentChatId: 'chat-a',
        now: NOW,
    });
    assert.equal(active.plan[0].action, DrawRunRecoveryAction.RECOVER_ADOPTION);
});

test('a gallery adoption also waits for its frozen source chat without periodic polling', () => {
    const adopting = record('run-test-306', {
        state: PendingJobState.ADOPTING,
        adoptionPhase: PendingJobAdoptionPhase.READY,
        chatTarget: { chatId: 'chat-a' },
        delivery: { mode: 'gallery', reason: 'source_changed' },
    });
    const inactive = planDrawRunRecovery({
        markers: [],
        runs: [run('run-test-306')],
        records: [adopting],
        currentChatId: 'chat-b',
        now: NOW,
    });
    assert.equal(inactive.plan[0].action, DrawRunRecoveryAction.WAIT);
    assert.equal(inactive.plan[0].reason, 'target_chat_inactive');
    assert.equal(planDrawRunPollDelay(inactive.plan), null);

    const active = planDrawRunRecovery({
        markers: [],
        runs: [run('run-test-306')],
        records: [adopting],
        currentChatId: 'chat-a',
        now: NOW,
    });
    assert.equal(active.plan[0].action, DrawRunRecoveryAction.RECOVER_ADOPTION);
});

test('pending adoption only falls back to gallery after persisted marker absence is confirmed', () => {
    assert.deepEqual(planPendingAdoptionRecovery({ persistedMarkerPresent: true }), {
        action: DrawRunPendingAdoptionAction.WAIT_FOR_TARGET,
        reason: 'marker_present',
    });
    assert.deepEqual(planPendingAdoptionRecovery({ persistedMarkerPresent: false }), {
        action: DrawRunPendingAdoptionAction.FALLBACK_TO_GALLERY,
        delivery: { mode: 'gallery', reason: 'target_missing' },
    });
});

test('adoption retry distinguishes an active lease from a stable blocked state', () => {
    assert.equal(planDrawRunAdoptionRetry({
        status: DrawRunAdoptionRecoveryStatus.LEASE_ACTIVE,
        leaseExpiresAt: NOW + 2_000,
    }, { now: NOW }), 2_010);
    assert.equal(planDrawRunAdoptionRetry({
        status: DrawRunAdoptionRecoveryStatus.LEASE_ACTIVE,
        leaseExpiresAt: NOW,
    }, { now: NOW }), DRAW_RUN_BLOCKED_RETRY_MS);
    assert.equal(planDrawRunAdoptionRetry({
        status: DrawRunAdoptionRecoveryStatus.BLOCKED,
        reason: 'marker_not_cleared',
    }, { now: NOW }), DRAW_RUN_BLOCKED_RETRY_MS);
    assert.equal(planDrawRunAdoptionRetry({
        status: DrawRunAdoptionRecoveryStatus.COMPLETED,
    }, { now: NOW }), null);

    assert.equal(planDrawRunPollDelay([
        { action: DrawRunRecoveryAction.WAIT, reason: 'run_in_progress' },
    ]), DRAW_RUN_BLOCKED_RETRY_MS);
});
