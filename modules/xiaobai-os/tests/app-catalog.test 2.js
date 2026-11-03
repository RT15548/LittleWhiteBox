import assert from 'node:assert/strict';
import test from 'node:test';

import { createHostAppCatalog, XIAOBAI_OS_HOST_APP_IDS } from '../host/app-catalog.js';
import {
    createAppComponentLoader,
    XIAOBAI_OS_SHELL_APP_IDS,
    xiaobaiOsApps,
} from '../shell/app-catalog.js';

test('Host and Shell expose the same ordered APP catalog', () => {
    assert.deepEqual(XIAOBAI_OS_HOST_APP_IDS, XIAOBAI_OS_SHELL_APP_IDS);
    const modules = [...xiaobaiOsApps].reverse().map(app => ({
        descriptor: { id: app.id, name: app.name, description: app.description, accent: app.accent },
        capabilities: [],
        async install() { return {}; },
    }));
    assert.deepEqual(createHostAppCatalog(modules).map(module => module.descriptor.id), XIAOBAI_OS_HOST_APP_IDS);
    assert.throws(() => createHostAppCatalog(modules.slice(1)), /missing_host_apps/);
});

test('a rejected UI chunk can be loaded again instead of caching its rejection', async () => {
    let attempts = 0;
    const component = { name: 'RecoveredApp' };
    const loader = createAppComponentLoader(async () => {
        attempts += 1;
        if (attempts === 1) { throw new Error('chunk unavailable'); }
        return { default: component };
    });

    await assert.rejects(loader.load(), /chunk unavailable/);
    assert.equal(await loader.load(), component);
    assert.equal(attempts, 2);
});
