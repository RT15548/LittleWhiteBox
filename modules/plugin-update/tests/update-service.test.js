import assert from 'node:assert/strict';
import test from 'node:test';

import { createPluginUpdateService, PLUGIN_UPDATE_STATUS } from '../update-service.js';

function jsonResponse(data, { status = 200, text = '', statusText = '' } = {}) {
    return {
        ok: status >= 200 && status < 300,
        status,
        statusText,
        async json() {
            return data;
        },
        async text() {
            return text;
        },
    };
}

function createService(fetchImpl, cachedType = null) {
    return createPluginUpdateService({
        extensionFolderId: 'LittleWhiteBox',
        fetchImpl,
        getCachedExtensionType: () => cachedType,
        getRequestHeaders: () => ({ 'Content-Type': 'application/json' }),
    });
}

test('an unavailable host extension type leaves update state unknown without making a request', async () => {
    let requests = 0;
    const service = createService(async () => {
        requests++;
        return jsonResponse({ isUpToDate: false });
    });

    const result = await service.check();

    assert.equal(result.status, PLUGIN_UPDATE_STATUS.UNKNOWN);
    assert.equal(requests, 0);
});

test('version checks use the same external id and global scope as the native extension manager', async () => {
    let request = null;
    const service = createService(async (path, options) => {
        request = { path, body: JSON.parse(options.body) };
        return jsonResponse({ isUpToDate: false, currentCommitHash: 'old' });
    }, 'global');

    const result = await service.check();

    assert.equal(result.status, PLUGIN_UPDATE_STATUS.AVAILABLE);
    assert.deepEqual(request, {
        path: '/api/extensions/version',
        body: { extensionName: '/LittleWhiteBox', global: true },
    });
});

test('an up-to-date local repository resolves to current', async () => {
    const service = createService(async () => jsonResponse({ isUpToDate: true }), 'local');

    const result = await service.check();

    assert.equal(result.status, PLUGIN_UPDATE_STATUS.CURRENT);
});

test('installation uses the native update protocol and reports a pulled revision', async () => {
    let request = null;
    const service = createService(async (path, options) => {
        request = { path, body: JSON.parse(options.body) };
        return jsonResponse({ isUpToDate: false, shortCommitHash: 'abc1234' });
    }, 'local');

    const result = await service.install();

    assert.equal(result.status, PLUGIN_UPDATE_STATUS.UPDATED);
    assert.deepEqual(request, {
        path: '/api/extensions/update',
        body: { extensionName: '/LittleWhiteBox', global: false },
    });
});

test('installation preserves native update failures for the plugin UI', async () => {
    const service = createService(
        async () => jsonResponse(null, { status: 403, text: 'Forbidden' }),
        'global',
    );

    const result = await service.install();

    assert.equal(result.status, PLUGIN_UPDATE_STATUS.FAILED);
    assert.equal(result.errorText, 'Forbidden');
});
