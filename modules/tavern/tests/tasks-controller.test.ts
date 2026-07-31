import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { computed, effectScope, ref } from 'vue';
import Dexie from '../../../libs/dexie.mjs';

import db, {
    appendTavernMessage,
    createTavernSession,
    tavernTaskBoardsTable,
    tavernTaskVersionsTable,
} from '../shared/session-db';
import { replaceTavernTaskBoard } from '../shared/tasks/task-board';
import { captureTavernTaskPhoneBoundary } from '../shared/tasks/task-phone-boundary';
import {
    acceptTavernTaskListing,
    progressTavernTask,
} from '../shared/tasks/task-service';
import type { TavernTaskListing, TavernTaskVersionRecord } from '../shared/tasks/task-types';
import { resolveTavernTaskPublishAvailability } from '../app-src/features/phone-os/apps/tasks/tavern-task-publish-state';
import { useTavernTasksController } from '../app-src/features/phone-os/apps/tasks/useTavernTasksController';

function taskListings(): TavernTaskListing[] {
    const rows = [
        ['禁忌', 'B', 150, '易介入', '现在就行'],
        ['接触', 'C', 60, '易介入', '任意时候'],
        ['夹缝', 'C', 100, '易介入', '现在就行'],
        ['窥秘', 'C', 80, '中介入', '任意时候'],
        ['掠夺', 'C', 100, '中介入', '特定时机：下课后'],
        ['怪癖', 'D', 25, '深介入', '特定时机：入夜后'],
    ] as const;
    return rows.map(([direction, grade, reward, posture, timing], index) => ({
        id: `controller-listing-${index}`,
        grade,
        tags: [direction, '测试'],
        posture,
        title: `控制器委托 ${index}`,
        issuer: {
            id: `controller-issuer-${index}`,
            name: `委托人 ${index}`,
            description: '用于控制器行为测试。',
        },
        hook: '测试入口',
        objective: '验证读取不会倒退。',
        location: '测试区',
        timing,
        risk: '无',
        reward,
    }));
}

async function createActiveTask(sessionId: string): Promise<TavernTaskVersionRecord> {
    const board = await replaceTavernTaskBoard({
        sessionId,
        expectedRevision: 0,
        expectedEpoch: 1,
        boundary: null,
        listings: taskListings(),
    });
    return await acceptTavernTaskListing({
        sessionId,
        boardId: board.generationId,
        boardRevision: board.revision,
        boardEpoch: board.epoch,
        listingId: board.listings[0].id,
        boundary: null,
        actionId: 'controller-accept',
        taskId: 'controller-task',
    });
}

function createController(sessionId: string) {
    const scope = effectScope();
    const controller = scope.run(() => useTavernTasksController({
        selectedSessionId: ref(sessionId),
        effectiveContext: computed(() => ({})),
        agentConfig: ref({}),
        chatRunning: ref(false),
        chatCancelling: ref(false),
        memoryEditorMode: ref<'preview' | 'edit'>('preview'),
        characterArchiveBusy: computed(() => false),
        getNativeWorldInfoRuntime: async () => ({ timedState: { sticky: {}, cooldown: {} } }),
    }));
    if (!controller) {throw new Error('controller_scope_missing');}
    return { controller, scope };
}

function deferred<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, resolve, reject };
}

async function waitUntil(predicate: () => boolean): Promise<void> {
    for (let index = 0; index < 30; index += 1) {
        if (predicate()) {return;}
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
    throw new Error('condition_timeout');
}

test('task detail displays the current task while its timeline request is still pending', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Task detail split reads' });
    const task = await createActiveTask(session.id);
    const { controller, scope } = createController(session.id);
    const table = tavernTaskVersionsTable as unknown as { where(index: string): unknown };
    const originalWhere = table.where.bind(table);
    const timelineStarted = deferred<void>();
    const releaseTimeline = deferred<void>();

    const wrapTimelineCollection = (target: unknown): unknown => new Proxy(target as object, {
        get(current, property) {
            if (property === 'toArray') {
                return async () => {
                    timelineStarted.resolve();
                    await releaseTimeline.promise;
                    return await (current as { toArray(): Promise<unknown[]> }).toArray();
                };
            }
            const value = Reflect.get(current, property);
            if (typeof value === 'function') {
                return (...args: unknown[]) => wrapTimelineCollection(value.apply(current, args));
            }
            return value;
        },
    });
    table.where = ((index: string) => {
        const query = originalWhere(index);
        return index === '[sessionId+taskId+revision]' ? wrapTimelineCollection(query) : query;
    }) as typeof table.where;

    try {
        const loading = controller.loadTaskDetail(task.taskId);
        await timelineStarted.promise;
        await waitUntil(() => controller.selectedTask.value?.taskId === task.taskId);
        assert.equal(controller.detailLoading.value, false);
        assert.equal(controller.timelineLoading.value, true);
        releaseTimeline.reject(new Error('timeline_unavailable'));
        await loading;
        assert.equal(controller.selectedTask.value?.taskId, task.taskId);
        assert.equal(controller.timelineError.value, '记录暂时无法加载，请稍后重试。');
    } finally {
        table.where = originalWhere;
        releaseTimeline.resolve();
        scope.stop();
    }
});

test('a late task detail read cannot replace a newer version after a domain mutation', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Task detail stale read' });
    const task = await createActiveTask(session.id);
    const { controller, scope } = createController(session.id);
    const table = tavernTaskVersionsTable as unknown as { where(index: string): unknown };
    const originalWhere = table.where.bind(table);
    const staleReadStarted = deferred<void>();
    const releaseStaleRead = deferred<void>();
    let delayFirstCurrentRead = true;

    const wrapCurrentCollection = (target: unknown): unknown => new Proxy(target as object, {
        get(current, property) {
            if (property === 'toArray') {
                return async () => {
                    if (delayFirstCurrentRead) {
                        delayFirstCurrentRead = false;
                        staleReadStarted.resolve();
                        await releaseStaleRead.promise;
                        return [task];
                    }
                    return await (current as { toArray(): Promise<unknown[]> }).toArray();
                };
            }
            const value = Reflect.get(current, property);
            if (typeof value === 'function') {
                return (...args: unknown[]) => wrapCurrentCollection(value.apply(current, args));
            }
            return value;
        },
    });
    table.where = ((index: string) => {
        const query = originalWhere(index);
        return index === '[sessionId+taskId+currentMarker]' ? wrapCurrentCollection(query) : query;
    }) as typeof table.where;

    try {
        const staleLoad = controller.loadTaskDetail(task.taskId);
        await staleReadStarted.promise;
        const next = await progressTavernTask({
            sessionId: session.id,
            taskId: task.taskId,
            expectedRevision: task.revision,
            expectedVersionId: task.versionId,
            progressSummary: '本地 mutation 已经产生新版本。',
            anchorOrder: 1,
            actionId: 'controller-new-version',
        });
        const refresh = controller.refreshAfterTaskDomainChange();
        await waitUntil(() => controller.selectedTask.value?.versionId === next.versionId);
        releaseStaleRead.resolve();
        await Promise.all([refresh, staleLoad]);
        assert.equal(controller.selectedTask.value?.versionId, next.versionId);
    } finally {
        table.where = originalWhere;
        releaseStaleRead.resolve();
        scope.stop();
    }
});

test('a late board read cannot move the controller back to an older epoch', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Board stale read' });
    const first = await replaceTavernTaskBoard({
        sessionId: session.id,
        expectedRevision: 0,
        expectedEpoch: 1,
        boundary: null,
        generationId: 'board-controller-first',
        listings: taskListings(),
    });
    const { controller, scope } = createController(session.id);
    await controller.refreshTaskData();
    const table = tavernTaskBoardsTable as unknown as { get(id: string): Promise<unknown> };
    const originalGet = table.get.bind(table);
    const staleReadStarted = deferred<void>();
    const releaseStaleRead = deferred<void>();
    let delayFirstRead = true;
    table.get = async (id: string) => {
        const snapshot = await originalGet(id);
        if (!delayFirstRead) {return snapshot;}
        delayFirstRead = false;
        staleReadStarted.resolve();
        await releaseStaleRead.promise;
        return snapshot;
    };

    try {
        const staleRefresh = controller.refreshTaskData();
        await staleReadStarted.promise;
        const replacement = await (Dexie as unknown as {
            ignoreTransaction<T>(callback: () => Promise<T>): Promise<T>;
        }).ignoreTransaction(async () => {
            await appendTavernMessage(session.id, { role: 'user', content: '推进到下一段剧情。' });
            return await replaceTavernTaskBoard({
                sessionId: session.id,
                expectedRevision: first.revision,
                expectedEpoch: first.epoch,
                boundary: await captureTavernTaskPhoneBoundary(session.id),
                generationId: 'board-controller-second',
                listings: taskListings().map((listing) => ({ ...listing, title: `${listing.title} 新` })),
            });
        });
        const currentRefresh = controller.refreshAfterTaskDomainChange();
        await waitUntil(() => controller.board.value?.epoch === replacement.epoch);
        releaseStaleRead.resolve();
        await Promise.all([staleRefresh, currentRefresh]);
        assert.equal(controller.board.value?.generationId, replacement.generationId);
        assert.equal(controller.board.value?.epoch, replacement.epoch);
    } finally {
        table.get = originalGet;
        releaseStaleRead.resolve();
        scope.stop();
    }
});

test('task publishing stays blocked while wallet balance is refreshing or failed', () => {
    const base = {
        balance: 100,
        balanceError: '',
        balanceLoading: false,
        balanceReady: true,
        blockedReason: '',
        busy: false,
        reward: 20,
    };
    assert.equal(resolveTavernTaskPublishAvailability(base).canSubmit, true);
    assert.equal(resolveTavernTaskPublishAvailability({ ...base, balanceLoading: true }).canSubmit, false);
    assert.equal(resolveTavernTaskPublishAvailability({ ...base, balanceError: '钱包暂时无法读取' }).canSubmit, false);
    assert.equal(resolveTavernTaskPublishAvailability({ ...base, balanceReady: false }).canSubmit, false);
});
