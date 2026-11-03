import assert from 'node:assert/strict';
import test from 'node:test';

import { createTaskSettingsRuntime } from '../apps/tasks/host/settings-runtime.js';

function createHarness(initial = { autoMaintenance: false }) {
    let taskSettings = initial;
    let listener = null;
    let installedListener = null;
    const calls = [];
    const settings = {
        read: () => ({ enabled: true, apps: { tasks: taskSettings } }),
        subscribe(next) {
            listener = next;
            return () => {listener = null;};
        },
        subscribeMutationInstalled(next) {
            installedListener = next;
            return () => {installedListener = null;};
        },
    };
    const runtime = createTaskSettingsRuntime({
        settings,
        maintenance: {
            cancelRequested: (id, reason) => calls.push(['cancel-requested', id, reason]),
            invalidateAutomatic: (id, reason) => calls.push(['invalidate-automatic', id, reason]),
        },
    });
    return {
        calls,
        runtime,
        install(next, enabled = true) {
            taskSettings = next;
            installedListener?.({ enabled, apps: { tasks: next } });
        },
        publish(next) {
            taskSettings = next;
            listener?.({ enabled: true, apps: { tasks: next } });
        },
    };
}

test('disabling Tasks automatic maintenance invalidates pending automatic work immediately', () => {
    const harness = createHarness({ autoMaintenance: true });
    harness.runtime.startBackground();
    harness.install({ autoMaintenance: false });
    harness.publish({ autoMaintenance: false });

    assert.deepEqual(harness.calls, [
        ['invalidate-automatic', 'tasks', 'automatic-disabled'],
    ]);
});

test('an installed OS disable mutation fences all Tasks maintenance work', () => {
    const harness = createHarness({ autoMaintenance: true });
    harness.runtime.startBackground();
    harness.install({ autoMaintenance: true }, false);

    assert.deepEqual(harness.calls, [
        ['cancel-requested', 'tasks', 'os-disabled'],
        ['invalidate-automatic', 'tasks', 'os-disabled'],
    ]);
});

test('start is idempotent and stop releases Tasks maintenance work', () => {
    const harness = createHarness();
    harness.runtime.startBackground();
    harness.runtime.startBackground();
    harness.runtime.stopBackground();

    assert.deepEqual(harness.calls, [
        ['cancel-requested', 'tasks', 'stopped'],
        ['invalidate-automatic', 'tasks', 'stopped'],
    ]);
});
