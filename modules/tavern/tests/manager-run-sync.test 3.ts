import test from 'node:test';
import assert from 'node:assert/strict';

import {
    findNewlyTerminalTavernManagerRunIds,
    mergePersistedTavernManagerRunProjection,
    mergeTavernManagerRunHistory,
    projectTavernManagerProgress,
    projectTavernManagerRunListItem,
    shouldReconcileTavernManagerRun,
    tavernManagerRunVersion,
} from '../app-src/features/manager/manager-run-sync';
import type { TavernManagerRunRecord } from '../shared/session-db';

function run(
    status: TavernManagerRunRecord['status'],
    patch: Partial<TavernManagerRunRecord> = {},
): TavernManagerRunRecord {
    return {
        id: patch.id || `run-${status}`,
        sessionId: patch.sessionId || 'session-1',
        turn: patch.turn ?? 1,
        userOrder: patch.userOrder ?? 0,
        assistantOrder: patch.assistantOrder ?? 1,
        trigger: patch.trigger || 'accepted_turn',
        status,
        provider: patch.provider || '',
        model: patch.model || '',
        inputSummary: patch.inputSummary || '',
        outputText: patch.outputText || '',
        parsedAction: patch.parsedAction || '',
        toolTrace: patch.toolTrace,
        changedFiles: patch.changedFiles || [],
        changedStates: patch.changedStates || [],
        leaseOwnerId: patch.leaseOwnerId,
        leaseExpiresAt: patch.leaseExpiresAt,
        error: patch.error || '',
        createdAt: patch.createdAt ?? 1000,
        updatedAt: patch.updatedAt ?? 1000,
    };
}

test('only unfinished manager statuses require live synchronization', () => {
    assert.equal(shouldReconcileTavernManagerRun(run('queued')), true);
    assert.equal(shouldReconcileTavernManagerRun(run('running')), true);
    for (const status of ['completed', 'failed', 'cancelled', 'superseded'] as const) {
        assert.equal(shouldReconcileTavernManagerRun(run(status)), false, status);
    }
    assert.equal(shouldReconcileTavernManagerRun(null), false);
});

test('manager live synchronization treats its first snapshot as a baseline', () => {
    const recent = run('completed', { id: 'run-recent', updatedAt: 1000 });
    const terminal = run('failed', { id: 'run-terminal', updatedAt: 1100 });
    const queued = run('queued', { id: 'run-queued', updatedAt: 1200 });
    assert.deepEqual(findNewlyTerminalTavernManagerRunIds({
        initial: true,
        previousActiveIds: ['run-active'],
        previousRecentVersions: [[recent.id, tavernManagerRunVersion(recent)]],
        activeIds: [],
        recentRuns: [terminal, recent],
    }), []);

    assert.deepEqual(findNewlyTerminalTavernManagerRunIds({
        initial: false,
        previousActiveIds: ['run-active'],
        previousRecentVersions: [[recent.id, tavernManagerRunVersion(recent)]],
        activeIds: ['run-queued'],
        recentRuns: [terminal, recent, queued],
    }), ['run-active', 'run-terminal']);
});

test('a newer terminal version of the same manager run is observed again', () => {
    const failed = run('failed', { id: 'run-1', updatedAt: 2000 });
    const superseded = run('superseded', { id: failed.id, updatedAt: 2200 });

    assert.deepEqual(findNewlyTerminalTavernManagerRunIds({
        initial: false,
        previousActiveIds: [],
        previousRecentVersions: [[failed.id, tavernManagerRunVersion(failed)]],
        activeIds: [],
        recentRuns: [superseded],
    }), [failed.id]);
});

test('persisted heartbeats keep the latest ephemeral tool trace', () => {
    const latestTrace = [{ id: 'tool-1', status: 'resolved' }, { id: 'tool-2', status: 'running' }];
    const current = run('running', { id: 'run-1', updatedAt: 1600, toolTrace: latestTrace });
    const persisted = run('running', {
        id: current.id,
        updatedAt: 1400,
        leaseExpiresAt: 5000,
        toolTrace: undefined,
    });

    const projection = mergePersistedTavernManagerRunProjection(current, persisted);
    assert.deepEqual(projection.toolTrace, latestTrace);
    assert.equal(projection.updatedAt, 1600);
    assert.equal(projection.leaseExpiresAt, persisted.leaseExpiresAt);
    assert.equal(persisted.toolTrace, undefined);
});

test('terminal facts release live traces while stale live facts cannot revive them', () => {
    const live = run('running', {
        id: 'run-1',
        updatedAt: 1800,
        toolTrace: [{ id: 'live-tool', status: 'running' }],
    });
    const completed = run('completed', {
        id: live.id,
        updatedAt: 2000,
        toolTrace: [{ id: 'stored-tool', status: 'resolved' }],
    });
    assert.deepEqual(
        mergePersistedTavernManagerRunProjection(live, completed).toolTrace,
        completed.toolTrace,
    );
    assert.equal(
        mergePersistedTavernManagerRunProjection(completed, live).status,
        'completed',
    );
});

test('a genuinely newer requeue wins an older terminal observation', () => {
    const completed = run('completed', { id: 'run-1', updatedAt: 2000 });
    const requeued = run('queued', { id: completed.id, updatedAt: 2200 });
    assert.equal(
        mergePersistedTavernManagerRunProjection(completed, requeued).status,
        'queued',
    );
    assert.equal(
        mergePersistedTavernManagerRunProjection(requeued, completed).status,
        'queued',
    );
});

test('manager history keeps every active run and limits only settled history', () => {
    const active = Array.from({ length: 22 }, (_, index) => run(index % 2 ? 'queued' : 'running', {
        id: `active-${index}`,
        assistantOrder: index,
        updatedAt: 10_000 + index,
    }));
    const settled = Array.from({ length: 25 }, (_, index) => run('completed', {
        id: `settled-${index}`,
        updatedAt: 1000 + index,
    }));
    const merged = mergeTavernManagerRunHistory([], [...active, ...settled], 18);

    assert.equal(merged.filter((item) => shouldReconcileTavernManagerRun(item)).length, active.length);
    assert.equal(merged.filter((item) => !shouldReconcileTavernManagerRun(item)).length, 18);
    assert.equal(merged.length, active.length + 18);
});

test('manager list projection releases full tool payloads while preserving activity counts', () => {
    const largeThought = 'x'.repeat(100_000);
    const projected = projectTavernManagerRunListItem(run('completed', {
        outputText: largeThought,
        parsedAction: largeThought,
        toolTrace: [
            { id: 'tool-1', status: 'resolved', ok: true, thoughts: [{ text: largeThought }] },
            { id: 'tool-2', status: 'resolved', ok: false, preface: largeThought },
        ],
    }));

    assert.deepEqual(projected.toolTrace, { total: 2, failed: 1, running: 0 });
    assert.equal(projected.outputText?.length, 500);
    assert.equal(projected.parsedAction, '');
    assert.equal(JSON.stringify(projected).includes(largeThought), false);
});

test('late progress cannot revive a terminal manager run', () => {
    const progress = {
        sessionId: 'session-1',
        runId: 'run-1',
        activityAt: 2200,
        tools: [{ id: 'tool-1', status: 'running' }],
    };
    assert.equal(projectTavernManagerProgress(run('completed', { id: 'run-1' }), progress), null);
    assert.equal(projectTavernManagerProgress(run('failed', { id: 'run-1' }), progress), null);
    const projected = projectTavernManagerProgress(run('queued', { id: 'run-1' }), progress);
    assert.equal(projected?.status, 'running');
    assert.deepEqual(projected?.toolTrace, progress.tools);
});
