import test from 'node:test';
import assert from 'node:assert/strict';
import { ref } from 'vue';

import { useTavernManagerDisplay } from '../app-src/components/chat/useTavernManagerDisplay';
import {
    isTavernManagerRunActive,
    TAVERN_MANAGER_HEARTBEAT_TIMEOUT_MS,
} from '../shared/manager-run-liveness';
import type { TavernManagerRunRecord } from '../shared/session-db';

function managerRun(patch: Partial<TavernManagerRunRecord> & Pick<TavernManagerRunRecord, 'id' | 'status'>): TavernManagerRunRecord {
    return {
        id: patch.id,
        sessionId: patch.sessionId || 'session-1',
        turn: patch.turn || 0,
        userOrder: patch.userOrder ?? -1,
        assistantOrder: patch.assistantOrder ?? -1,
        trigger: patch.trigger || 'accepted_turn',
        status: patch.status,
        createdAt: patch.createdAt || 1000,
        updatedAt: patch.updatedAt || 1000,
        provider: patch.provider,
        model: patch.model,
        inputSummary: patch.inputSummary,
        outputText: patch.outputText,
        parsedAction: patch.parsedAction,
        toolTrace: patch.toolTrace,
        changedFiles: patch.changedFiles,
        changedStates: patch.changedStates,
        error: patch.error,
    };
}

test('manager run activity requires a fresh heartbeat', () => {
    const now = 100000;
    const fresh = managerRun({
        id: 'fresh-running',
        status: 'running',
        updatedAt: now - TAVERN_MANAGER_HEARTBEAT_TIMEOUT_MS,
    });
    const expired = managerRun({
        id: 'expired-running',
        status: 'running',
        updatedAt: now - TAVERN_MANAGER_HEARTBEAT_TIMEOUT_MS - 1,
    });

    assert.equal(isTavernManagerRunActive(fresh, now), true);
    assert.equal(isTavernManagerRunActive(expired, now), false);
    assert.equal(isTavernManagerRunActive(managerRun({
        id: 'old-queued',
        status: 'queued',
        updatedAt: now - TAVERN_MANAGER_HEARTBEAT_TIMEOUT_MS * 10,
    }), now), true);
    assert.equal(isTavernManagerRunActive(managerRun({ id: 'completed', status: 'completed', updatedAt: now }), now), false);
});

test('stale floor 169 run cannot override completed floor 210 or keep the manager busy', () => {
    const now = 100000;
    const completed210 = managerRun({
        id: 'completed-210',
        status: 'completed',
        turn: 210,
        assistantOrder: 210,
        createdAt: now - 5000,
        updatedAt: now - 1000,
    });
    const stale169 = managerRun({
        id: 'stale-169',
        status: 'running',
        turn: 169,
        assistantOrder: 169,
        createdAt: now - 60000,
        updatedAt: now - TAVERN_MANAGER_HEARTBEAT_TIMEOUT_MS - 1,
    });
    const display = useTavernManagerDisplay({
        managerRuns: ref([completed210, stale169]),
        visibleRunLimit: 8,
    });
    display.managerStatusClock.value = now;

    assert.equal(display.currentManagerWorkRun.value?.id, completed210.id);
    assert.equal(display.managerBusy.value, false);
    assert.equal(display.archivedManagerRuns.value[0]?.id, stale169.id);
    assert.equal(stale169.status, 'running');
    assert.equal(display.managerRunDisplayStatus(stale169), 'interrupted');
    assert.equal(display.managerStatusLabel(stale169), '维护已中断');
    assert.equal(display.managerRunTone(stale169), 'danger');
    assert.equal(display.formatRunModelLine(stale169), '后台维护已中断');
    assert.match(display.formatRunActivityLine(stale169), /^维护已中断/);
    assert.match(display.formatRunMemoryLine(stale169), /维护中断/);
    assert.match(display.formatRunMapLine(stale169), /维护中断/);
    assert.equal(display.managerToolStatusLabel({ status: 'running' }, stale169), '已中断');
    assert.equal(display.managerToolTone({ status: 'running' }, stale169), 'is-error');
    assert.match(display.toolTraceSummary([{ status: 'running' }], stale169), /维护已中断/);
});

test('fresh background maintenance still overrides the latest completed run and blocks conflicts', () => {
    const now = 100000;
    const running211 = managerRun({
        id: 'running-211',
        status: 'running',
        turn: 211,
        assistantOrder: 211,
        createdAt: now - 5000,
        updatedAt: now - 1000,
    });
    const completed210 = managerRun({
        id: 'completed-210',
        status: 'completed',
        turn: 210,
        assistantOrder: 210,
        createdAt: now - 10000,
        updatedAt: now - 6000,
    });
    const display = useTavernManagerDisplay({
        managerRuns: ref([running211, completed210]),
        visibleRunLimit: 8,
    });
    display.managerStatusClock.value = now;

    assert.equal(display.currentManagerWorkRun.value?.id, running211.id);
    assert.equal(display.managerBusy.value, true);
});

test('manager display keeps the running oldest pair ahead of newer queued pairs', () => {
    const now = 100000;
    const queued3 = managerRun({
        id: 'queued-3',
        status: 'queued',
        assistantOrder: 3,
        createdAt: now - 500,
        updatedAt: now - 500,
    });
    const running1 = managerRun({
        id: 'running-1',
        status: 'running',
        assistantOrder: 1,
        createdAt: now - 5000,
        updatedAt: now - 1000,
    });
    const display = useTavernManagerDisplay({
        managerRuns: ref([queued3, running1]),
        visibleRunLimit: 8,
    });
    display.managerStatusClock.value = now;

    assert.equal(display.currentManagerWorkRun.value?.id, running1.id);
    assert.equal(display.archivedManagerRuns.value[0]?.id, queued3.id);
});
