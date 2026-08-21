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

test('failed host Git checks stay unknown and never consult a second version source', async () => {
    const paths = [];
    const service = createService(async (path) => {
        paths.push(path);
        if (path === '/api/extensions/discover') {
            return jsonResponse([{ type: 'global', name: 'third-party/LittleWhiteBox' }]);
        }
        return jsonResponse(null, { status: 500, text: 'Internal Server Error' });
    });

    const result = await service.check();

    assert.equal(result.status, PLUGIN_UPDATE_STATUS.UNKNOWN);
    assert.deepEqual(paths, ['/api/extensions/discover', '/api/extensions/version']);
});

test('unknown install scope retries the other scope only after a location mismatch', async () => {
    const scopes = [];
    const service = createService(async (path, options) => {
        if (path === '/api/extensions/discover') return jsonResponse([]);
        const body = JSON.parse(options.body);
        scopes.push(body.global);
        return body.global
            ? jsonResponse({ isUpToDate: false, currentCommitHash: 'old' })
            : jsonResponse(null, { status: 404, text: 'Directory does not exist' });
    });

    const result = await service.check();

    assert.equal(result.status, PLUGIN_UPDATE_STATUS.AVAILABLE);
    assert.deepEqual(scopes, [false, true]);
});

test('a host 500 resolves to current when repository verification succeeds afterwards', async () => {
    const service = createService(async (path) => {
        if (path === '/api/extensions/discover') {
            return jsonResponse([{ type: 'global', name: 'third-party/LittleWhiteBox' }]);
        }
        if (path === '/api/extensions/update') {
            return jsonResponse(null, { status: 500, text: 'Internal Server Error' });
        }
        return jsonResponse({ isUpToDate: true, currentCommitHash: 'new' });
    });

    const result = await service.install();

    assert.equal(result.status, PLUGIN_UPDATE_STATUS.CURRENT);
    assert.equal(result.reloadRequired, true);
});

test('a host 500 remains failed when verification still finds an update', async () => {
    const service = createService(async (path) => {
        if (path === '/api/extensions/discover') {
            return jsonResponse([{ type: 'local', name: 'third-party/LittleWhiteBox' }]);
        }
        if (path === '/api/extensions/update') {
            return jsonResponse(null, { status: 500, text: 'pull failed' });
        }
        return jsonResponse({ isUpToDate: false, currentCommitHash: 'old' });
    });

    const result = await service.install();

    assert.equal(result.status, PLUGIN_UPDATE_STATUS.FAILED);
    assert.equal(result.errorText, 'pull failed');
});

test('an unverifiable server error is unconfirmed instead of failed', async () => {
    const service = createService(async (path) => {
        if (path === '/api/extensions/discover') return jsonResponse([]);
        return jsonResponse(null, { status: 500, text: 'Internal Server Error' });
    }, 'local');

    const result = await service.install();

    assert.equal(result.status, PLUGIN_UPDATE_STATUS.UNCONFIRMED);
    assert.equal(result.reloadRequired, true);
});

test('a known global permission error is definitive and does not try local update', async () => {
    let updateRequests = 0;
    const service = createService(async (path) => {
        if (path === '/api/extensions/discover') {
            return jsonResponse([{ type: 'global', name: 'third-party/LittleWhiteBox' }]);
        }
        if (path === '/api/extensions/update') {
            updateRequests++;
            return jsonResponse(null, { status: 403, text: 'Forbidden' });
        }
        return jsonResponse(null, { status: 500 });
    });

    const result = await service.install();

    assert.equal(result.status, PLUGIN_UPDATE_STATUS.FAILED);
    assert.equal(updateRequests, 1);
});

test('successful host responses distinguish current and updated repositories', async () => {
    let isUpToDate = true;
    const service = createService(async (path) => {
        if (path === '/api/extensions/discover') {
            return jsonResponse([{ type: 'local', name: 'third-party/LittleWhiteBox' }]);
        }
        if (path === '/api/extensions/update') return jsonResponse({ isUpToDate });
        throw new Error('verification should not run');
    });

    const current = await service.install();
    isUpToDate = false;
    const updated = await service.install();

    assert.equal(current.status, PLUGIN_UPDATE_STATUS.CURRENT);
    assert.equal(current.reloadRequired, false);
    assert.equal(updated.status, PLUGIN_UPDATE_STATUS.UPDATED);
    assert.equal(updated.reloadRequired, true);
});
