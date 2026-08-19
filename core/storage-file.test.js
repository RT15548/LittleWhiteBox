import test from 'node:test';
import assert from 'node:assert/strict';

import { StorageFile } from './storage-file.js';

const response = (status, body = '') => ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => body,
});

const deferred = () => {
    let resolve;
    const promise = new Promise((done) => {
        resolve = done;
    });
    return { promise, resolve };
};

function createDebounceController() {
    let pending = null;
    return {
        debounce: (fn) => () => {
            pending = fn;
        },
        hasPending: () => pending !== null,
        flush: async () => {
            const fn = pending;
            pending = null;
            return await fn?.();
        },
    };
}

function createHarness(initial, onUpload = async () => response(200)) {
    const uploads = [];
    const debounceController = createDebounceController();
    const fetch = async (url, options = {}) => {
        if (url.startsWith('/user/files/')) {
            return response(200, JSON.stringify(initial));
        }
        if (url === '/api/files/upload' && options.method === 'POST') {
            const request = JSON.parse(options.body);
            const candidate = JSON.parse(atob(request.data));
            uploads.push(candidate);
            return await onUpload(candidate, uploads.length);
        }
        throw new Error(`Unexpected request: ${options.method || 'GET'} ${url}`);
    };
    const storage = new StorageFile('test.json', {
        fetch,
        debounce: debounceController.debounce,
        getRequestHeaders: () => ({ 'X-Test': '1' }),
    });
    return { storage, uploads, debounceController };
}

test('strict load accepts 404 as an empty file', async () => {
    const storage = new StorageFile('missing.json', {
        fetch: async () => response(404),
    });

    assert.deepEqual(await storage.load({ strict: true }), {});
});

test('strict load rejects non-404 HTTP failures', async () => {
    const storage = new StorageFile('unavailable.json', {
        fetch: async () => response(503),
    });

    await assert.rejects(storage.load({ strict: true }), /HTTP 503/);
});

test('a failed non-strict read does not poison a later strict retry', async () => {
    let attempts = 0;
    const storage = new StorageFile('retry.json', {
        fetch: async () => {
            attempts++;
            return attempts === 1 ? response(500) : response(200, '{"ready":true}');
        },
    });

    assert.deepEqual(await storage.load(), {});
    assert.deepEqual(await storage.load({ strict: true }), { ready: true });
    assert.equal(attempts, 2);
});

test('strict load rejects a non-object storage root', async () => {
    const storage = new StorageFile('invalid.json', {
        fetch: async () => response(200, '[]'),
    });

    await assert.rejects(storage.load({ strict: true }), /格式无效/);
});

test('failed atomic update does not expose or dirty the candidate', async () => {
    const { storage, uploads, debounceController } = createHarness(
        { stable: 'old' },
        async () => response(500),
    );
    await storage.load({ strict: true });

    const originalConsoleError = console.error;
    console.error = () => {};
    try {
        await assert.rejects(
            storage.updateAndSave(draft => {
                draft.stable = 'new';
                draft.added = true;
            }, { silent: false }),
            /500/,
        );
    } finally {
        console.error = originalConsoleError;
    }

    assert.deepEqual(await storage.load({ strict: true }), { stable: 'old' });
    assert.deepEqual(uploads, [{ stable: 'new', added: true }]);
    assert.equal(storage._dirtyVersion, storage._savedVersion);
    assert.equal(storage._retryTimer, null);
    assert.equal(debounceController.hasPending(), false);
});

test('failed atomic candidate is excluded from a pending ordinary save', async () => {
    const { storage, uploads, debounceController } = createHarness(
        { stable: true },
        async (_candidate, uploadNumber) => response(uploadNumber === 1 ? 500 : 200),
    );
    await storage.set('eventual', 'keep');

    const originalConsoleError = console.error;
    console.error = () => {};
    try {
        await assert.rejects(
            storage.updateAndSave(draft => {
                draft.rejected = true;
            }, { silent: false }),
            /500/,
        );
    } finally {
        console.error = originalConsoleError;
    }

    assert.deepEqual(await storage.load({ strict: true }), { stable: true, eventual: 'keep' });
    assert.equal(debounceController.hasPending(), true);
    await debounceController.flush();
    assert.deepEqual(uploads, [
        { stable: true, eventual: 'keep', rejected: true },
        { stable: true, eventual: 'keep' },
    ]);
});

test('concurrent atomic updates serialize against the latest committed cache', async () => {
    const firstUploadStarted = deferred();
    const releaseFirstUpload = deferred();
    const { storage, uploads } = createHarness({ count: 0 }, async (_candidate, uploadNumber) => {
        if (uploadNumber === 1) {
            firstUploadStarted.resolve();
            return await releaseFirstUpload.promise;
        }
        return response(200);
    });

    const first = storage.updateAndSave(draft => {
        draft.count++;
    }, { silent: false });
    await firstUploadStarted.promise;
    const second = storage.updateAndSave(draft => {
        draft.count++;
    }, { silent: false });

    await Promise.resolve();
    assert.deepEqual(uploads, [{ count: 1 }]);
    releaseFirstUpload.resolve(response(200));
    assert.deepEqual(await Promise.all([first, second]), [true, true]);
    assert.deepEqual(uploads, [{ count: 1 }, { count: 2 }]);
    assert.equal(await storage.getStrict('count'), 2);
});

test('waitForQueuedWrites includes an in-flight atomic commit', async () => {
    const uploadStarted = deferred();
    const releaseUpload = deferred();
    const { storage } = createHarness({ value: 'old' }, async () => {
        uploadStarted.resolve();
        return await releaseUpload.promise;
    });

    const update = storage.replaceAndSave({ value: 'new' }, { silent: false });
    await uploadStarted.promise;

    let idle = false;
    const waiting = storage.waitForQueuedWrites().then(() => {
        idle = true;
    });
    await Promise.resolve();
    assert.equal(idle, false);

    releaseUpload.resolve(response(200));
    await Promise.all([update, waiting]);
    assert.equal(idle, true);
    assert.equal(await storage.getStrict('value'), 'new');
});

test('waitForQueuedWrites also includes writes queued while it waits', async () => {
    const firstUploadStarted = deferred();
    const secondUploadStarted = deferred();
    const releaseFirstUpload = deferred();
    const releaseSecondUpload = deferred();
    const { storage } = createHarness({ count: 0 }, async (_candidate, uploadNumber) => {
        if (uploadNumber === 1) {
            firstUploadStarted.resolve();
            return await releaseFirstUpload.promise;
        }
        secondUploadStarted.resolve();
        return await releaseSecondUpload.promise;
    });

    const first = storage.updateAndSave(draft => {
        draft.count++;
    }, { silent: false });
    await firstUploadStarted.promise;

    let idle = false;
    const waiting = storage.waitForQueuedWrites().then(() => {
        idle = true;
    });
    const second = storage.updateAndSave(draft => {
        draft.count++;
    }, { silent: false });

    releaseFirstUpload.resolve(response(200));
    await secondUploadStarted.promise;
    assert.equal(idle, false);

    releaseSecondUpload.resolve(response(200));
    await Promise.all([first, second, waiting]);
    assert.equal(idle, true);
    assert.equal(await storage.getStrict('count'), 2);
});

test('debounce firing during an atomic update cannot upload stale cache', async () => {
    const atomicUploadStarted = deferred();
    const releaseAtomicUpload = deferred();
    const { storage, uploads, debounceController } = createHarness({ base: true }, async () => {
        atomicUploadStarted.resolve();
        return await releaseAtomicUpload.promise;
    });

    await storage.set('eventual', 'queued');
    assert.equal(debounceController.hasPending(), true);
    const atomic = storage.updateAndSave(draft => {
        draft.atomic = 'saved';
    }, { silent: false });
    await atomicUploadStarted.promise;

    assert.deepEqual(uploads, [{ base: true, eventual: 'queued', atomic: 'saved' }]);

    // 去抖在原子上传在途时触发：它必须排在原子提交之后，而不是抢跑上传旧缓存。
    // 因此这里不能先 await flush（会与未释放的上传互相等待），只能先排队再释放。
    const flushed = debounceController.flush();
    releaseAtomicUpload.resolve(response(200));
    await atomic;
    await flushed;
    assert.equal(uploads.length, 1);
    assert.deepEqual(await storage.load({ strict: true }), {
        base: true,
        eventual: 'queued',
        atomic: 'saved',
    });
});

test('debounced write queued during an atomic upload persists after that commit', async () => {
    const atomicUploadStarted = deferred();
    const releaseAtomicUpload = deferred();
    const { storage, uploads, debounceController } = createHarness({ base: true }, async (_candidate, uploadNumber) => {
        if (uploadNumber === 1) {
            atomicUploadStarted.resolve();
            return await releaseAtomicUpload.promise;
        }
        return response(200);
    });

    const atomic = storage.updateAndSave(draft => {
        draft.atomic = 'saved';
    }, { silent: false });
    await atomicUploadStarted.promise;
    const eventual = storage.set('eventual', 'queued');

    assert.deepEqual(uploads, [{ base: true, atomic: 'saved' }]);
    releaseAtomicUpload.resolve(response(200));
    await atomic;
    await eventual;
    assert.equal(debounceController.hasPending(), true);
    await debounceController.flush();

    assert.deepEqual(uploads, [
        { base: true, atomic: 'saved' },
        { base: true, atomic: 'saved', eventual: 'queued' },
    ]);
    assert.deepEqual(await storage.load({ strict: true }), {
        base: true,
        atomic: 'saved',
        eventual: 'queued',
    });
});
