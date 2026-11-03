import assert from 'node:assert/strict';
import test from 'node:test';

import { createMapSettingsRuntime } from '../apps/map/host/settings-runtime.js';

function createHarness(initial = { autoMaintenance: false }) {
    let mapSettings = initial;
    let listener = null;
    let mutationInstalledListener = null;
    const calls = [];
    const settings = {
        read: () => ({ enabled: true, apps: { map: mapSettings } }),
        subscribe(next) {
            listener = next;
            return () => {listener = null;};
        },
        subscribeMutationInstalled(next) {
            mutationInstalledListener = next;
            return () => {mutationInstalledListener = null;};
        },
    };
    const runtime = createMapSettingsRuntime({
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
            mapSettings = next;
            mutationInstalledListener?.({ enabled, apps: { map: next } });
        },
        publish(next) {
            mapSettings = next;
            listener?.({ enabled: true, apps: { map: next } });
        },
    };
}

test('turning off automatic maintenance invalidates automatic Map work immediately', () => {
    const harness = createHarness({ autoMaintenance: true });
    harness.runtime.startBackground();
    harness.install({ autoMaintenance: false });
    harness.publish({ autoMaintenance: false });

    assert.deepEqual(harness.calls, [
        ['invalidate-automatic', 'map', 'automatic-disabled'],
    ]);
});

test('an installed OS disable mutation fences all Map requests', () => {
    const harness = createHarness({ autoMaintenance: true });
    harness.runtime.startBackground();
    harness.install({ autoMaintenance: true }, false);

    assert.deepEqual(harness.calls, [
        ['cancel-requested', 'map', 'os-disabled'],
        ['invalidate-automatic', 'map', 'os-disabled'],
    ]);
});

test('start is idempotent and stop releases subscriptions and Map work', () => {
    const harness = createHarness();
    harness.runtime.startBackground();
    harness.runtime.startBackground();
    harness.runtime.stopBackground();

    assert.deepEqual(harness.calls, [
        ['cancel-requested', 'map', 'stopped'],
        ['invalidate-automatic', 'map', 'stopped'],
    ]);
});
