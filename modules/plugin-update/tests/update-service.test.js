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
