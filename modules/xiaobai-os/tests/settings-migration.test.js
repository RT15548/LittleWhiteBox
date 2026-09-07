import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { createSettingsRepository } from '../host/settings-repository.js';
import { createDefaultXiaobaiOsSettings } from '../host/settings-normalization.js';

async function loadFixture() {
    const text = await readFile(new URL('./fixtures/upstream-fourth-wall-settings.json', import.meta.url), 'utf8');
    return JSON.parse(text);
}

function createAdapter(settings, saveSettings = () => {}) {
    return {
        getExtensionSettings: () => settings,
        saveSettings,
    };
}

function createFourthWallSettings() {
    return {
        image: { enablePrompt: true },
        voice: { enabled: false },
        commentary: { enabled: true, probability: 42 },
        promptTemplates: {
            topuser: 'top',
            confirm: 'confirm',
            metaProtocol: 'meta',
            bottom: 'bottom',
        },
    };
}

function createCurrentSettings(enabled = true) {
    return {
        enabled,
        appOrder: [],
        apps: {
            fourthWall: createFourthWallSettings(),
            map: { autoMaintenance: false },
            tasks: { autoMaintenance: false },
        },
    };
}

test('enables a new OS entry without enabling automatic app features', async () => {
    for (const settings of [{}, { xiaobaiOs: {} }, { xiaobaiOs: createDefaultXiaobaiOsSettings() }]) {
        const repository = createSettingsRepository(createAdapter(settings));
        const current = await repository.prepare();

        assert.equal(current.enabled, true);
        assert.equal(current.apps.map.autoMaintenance, false);
        assert.equal(current.apps.tasks.autoMaintenance, false);
        assert.equal(current.apps.fourthWall.commentary.enabled, false);
        assert.equal(current.apps.fourthWall.image.enablePrompt, false);
        assert.equal(current.apps.fourthWall.voice.enabled, false);
        assert.deepEqual(repository.read(), current);
    }
});

test('keeps a saved OS opt-out and existing app preferences during preparation', async () => {
    const saved = createCurrentSettings(false);
    const settings = { xiaobaiOs: structuredClone(saved) };
    const repository = createSettingsRepository(createAdapter(settings));

    assert.deepEqual(await repository.prepare(), saved);
    assert.deepEqual(repository.read(), saved);
});

test('keeps an upstream opt-out when migrating to the default-enabled OS entry', async () => {
    for (const owner of ['fourthWall', 'dynamicPrompt']) {
        const settings = await loadFixture();
        settings[owner].enabled = false;
        if (owner === 'dynamicPrompt') delete settings.fourthWall;
        const repository = createSettingsRepository(createAdapter(settings));

        assert.equal((await repository.prepare()).enabled, false);
    }
});

test('moves the frozen upstream Fourth Wall preferences into OS without changing user choices', async () => {
    const settings = await loadFixture();
    let saves = 0;
    const repository = createSettingsRepository(createAdapter(settings, () => {saves += 1;}));

    const current = await repository.prepare();

    assert.equal(saves, 1);
    assert.equal(current.enabled, true);
    assert.deepEqual(current.apps.map, { autoMaintenance: false });
    assert.deepEqual(current.apps.tasks, { autoMaintenance: false });
    assert.deepEqual(current.apps.fourthWall, {
        image: { enablePrompt: true },
        voice: { enabled: true },
        commentary: { enabled: true, probability: 73 },
        promptTemplates: {
            topuser: 'custom top user',
            confirm: 'custom confirm',
            metaProtocol: 'custom meta protocol',
            bottom: 'custom bottom {{USER_INPUT}}',
        },
    });
    for (const key of repository.legacyKeys) assert.equal(Object.hasOwn(settings, key), false);
    assert.deepEqual(settings.unrelatedSetting, { keep: true });
});

test('uses dynamicPrompt only when the upstream Fourth Wall setting is absent', async () => {
    const settings = { dynamicPrompt: { enabled: true } };
    const repository = createSettingsRepository(createAdapter(settings));

    const current = await repository.prepare();

    assert.equal(current.enabled, true);
    assert.equal(Object.hasOwn(settings, 'dynamicPrompt'), false);
});

test('preserves the enabled choice from the observed minimal OS setting', async () => {
    const settings = {
        xiaobaiOs: {
            schemaVersion: 1,
            enabled: true,
        },
    };
    const repository = createSettingsRepository(createAdapter(settings));

    const current = await repository.prepare();

    assert.equal(current.enabled, true);
    assert.equal(Object.hasOwn(current, 'schemaVersion'), false);
    assert.deepEqual(current.apps.map, { autoMaintenance: false });
    assert.deepEqual(current.apps.tasks, { autoMaintenance: false });
    assert.equal(typeof current.apps.fourthWall.promptTemplates.bottom, 'string');
});

test('normalizes previously written OS settings without a root settings version', async () => {
    for (const schemaVersion of [1, 2, 3]) {
        const settings = {
            xiaobaiOs: {
                schemaVersion,
                enabled: true,
                apps: {
                    fourthWall: createFourthWallSettings(),
                    map: { enabled: false, autoMaintenance: true },
                    tasks: { enabled: true, autoMaintenance: true },
                    discardedTestApp: { enabled: true },
                },
            },
        };
        let saves = 0;
        const repository = createSettingsRepository(createAdapter(settings, () => {saves += 1;}));

        const current = await repository.prepare();

        assert.equal(saves, 1);
        assert.equal(current.enabled, true);
        assert.equal(Object.hasOwn(current, 'schemaVersion'), false);
        assert.deepEqual(current.apps.map, { autoMaintenance: true });
        assert.deepEqual(current.apps.tasks, { autoMaintenance: true });
        assert.equal(Object.hasOwn(current.apps, 'discardedTestApp'), false);
        assert.deepEqual(repository.read(), current);
    }
});

test('normalizes each app independently instead of rejecting the whole OS setting', async () => {
    const settings = {
        xiaobaiOs: {
            enabled: true,
            apps: {
                fourthWall: {
                    image: { enablePrompt: 'invalid' },
                    promptTemplates: { topuser: 'keep me' },
                },
                map: { autoMaintenance: true },
                tasks: { autoMaintenance: 'invalid' },
            },
        },
    };
    const repository = createSettingsRepository(createAdapter(settings));

    const current = await repository.prepare();

    assert.equal(current.enabled, true);
    assert.equal(current.apps.map.autoMaintenance, true);
    assert.equal(current.apps.tasks.autoMaintenance, false);
    assert.equal(current.apps.fourthWall.promptTemplates.topuser, 'keep me');
    assert.equal(typeof current.apps.fourthWall.image.enablePrompt, 'boolean');
    assert.equal(typeof current.apps.fourthWall.promptTemplates.bottom, 'string');
});

test('does not request another host save when settings are already canonical', async () => {
    const settings = { xiaobaiOs: createCurrentSettings() };
    let saves = 0;
    const repository = createSettingsRepository(createAdapter(settings, () => {saves += 1;}));

    const current = await repository.prepare();

    assert.deepEqual(current, createCurrentSettings());
    assert.equal(saves, 0);
});

test('updates OS and automatic-maintenance preferences through the common repository', async () => {
    const settings = { xiaobaiOs: createCurrentSettings(false) };
    let saves = 0;
    const repository = createSettingsRepository(createAdapter(settings, () => {saves += 1;}));
    await repository.prepare();

    assert.equal((await repository.setEnabled(true)).enabled, true);
    assert.deepEqual((await repository.setMapAutoMaintenance(true)).apps.map, { autoMaintenance: true });
    assert.deepEqual((await repository.setTasksAutoMaintenance(true)).apps.tasks, { autoMaintenance: true });

    assert.equal(saves, 3);
    assert.equal(settings.xiaobaiOs.enabled, true);
    assert.equal(settings.xiaobaiOs.apps.map.autoMaintenance, true);
    assert.equal(settings.xiaobaiOs.apps.tasks.autoMaintenance, true);
});

test('installs cancellation fences before publishing the new preference', async () => {
    const settings = { xiaobaiOs: createCurrentSettings() };
    const events = [];
    const repository = createSettingsRepository(createAdapter(settings, () => {events.push('save');}));
    await repository.prepare();
    repository.subscribeMutationInstalled(() => {events.push('fence');});
    repository.subscribe(() => {events.push('publish');});

    await repository.setMapAutoMaintenance(true);

    assert.deepEqual(events, ['fence', 'publish', 'save']);
});

test('rejects invalid mutation arguments without changing preferences', async () => {
    const settings = { xiaobaiOs: createCurrentSettings() };
    const repository = createSettingsRepository(createAdapter(settings));
    await repository.prepare();
    const before = structuredClone(settings.xiaobaiOs);

    assert.throws(() => repository.setEnabled('yes'), /enabled must be a boolean/);
    assert.throws(() => repository.setMapAutoMaintenance(null), /must be a boolean/);
    assert.throws(() => repository.setTasksAutoMaintenance(1), /must be a boolean/);
    assert.deepEqual(settings.xiaobaiOs, before);
});
