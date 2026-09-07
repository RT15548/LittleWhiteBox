import assert from 'node:assert/strict';
import test from 'node:test';
import { createSettingsRepository } from '../host/settings-repository.js';
import { createDefaultXiaobaiOsSettings } from '../host/settings-normalization.js';
import { mergeVisibleAppOrder, orderApps, resolveAppOrder } from '../shell/app-order.js';

test('user order survives repository restart, shares the settings queue and can reset to default', async () => {
    const root = { xiaobaiOs: createDefaultXiaobaiOsSettings() };
    let saves = 0;
    const adapter = { getExtensionSettings: () => root, saveSettings: () => { saves++; } };
    const repository = createSettingsRepository(adapter);
    await repository.prepare();
    const order = resolveAppOrder([]).reverse();
    await Promise.all([repository.setAppOrder(order), repository.setMapAutoMaintenance(false)]);
    assert.deepEqual(repository.read().appOrder, order);
    assert.equal(repository.read().apps.map.autoMaintenance, false);
    assert.equal(saves, 2);
    const reopened = createSettingsRepository(adapter);
    await reopened.prepare();
    assert.deepEqual(reopened.read().appOrder, order);
    assert.equal(saves, 2);
    await reopened.setAppOrder([]);
    assert.deepEqual(reopened.read().appOrder, []);
});

test('missing APPs append after saved choices, disabled APP slots survive visible rearrangement', () => {
    const defaults = resolveAppOrder([]);
    assert.deepEqual(resolveAppOrder(['world', 'messages']).slice(0, 2), ['world', 'messages']);
    assert.deepEqual(resolveAppOrder(['world', 'messages']).slice(2), defaults.filter(id => !['world', 'messages'].includes(id)));
    const reversed = [...defaults].reverse();
    const hidden = defaults[2];
    const visible = reversed.filter(id => id !== hidden);
    const merged = mergeVisibleAppOrder(defaults, visible);
    assert.equal(merged[2], hidden);
    assert.deepEqual(merged.filter(id => id !== hidden), visible);
    assert.deepEqual(orderApps(visible.map(id => ({ id })), merged).map(app => app.id), visible);
});

test('invalid writes leave preferences alone; failed host saves remain retryable without a readback', async () => {
    const root = { xiaobaiOs: createDefaultXiaobaiOsSettings() };
    let failed = true;
    let saves = 0;
    const repository = createSettingsRepository({ getExtensionSettings: () => root, saveSettings: () => {
        saves++;
        if (failed) { throw new Error('offline'); }
    } });
    for (const invalid of [['map', 'map'], ['not-an-app'], null, [5]]) {
        await assert.rejects(repository.setAppOrder(invalid), /invalid_app_order/);
    }
    assert.equal(saves, 0);
    assert.deepEqual(repository.read().appOrder, []);
    await assert.rejects(repository.setAppOrder(['map', 'world']), /offline/);
    assert.deepEqual(repository.read().appOrder, ['map', 'world']);
    failed = false;
    await repository.setAppOrder(['map', 'world']);
    assert.equal(saves, 2);
});
