import assert from 'node:assert/strict';
import test from 'node:test';
import { indexedDB } from 'fake-indexeddb';

type DrawWindow = {
    xiaobaixDraw?: {
        getProvider: () => string;
        buildPromptData: (input: Record<string, unknown>) => Record<string, unknown>;
        prepareGeneration?: (input: Record<string, unknown>) => {
            fingerprint: Record<string, unknown>;
            execute: (input: {
                signal?: AbortSignal;
                onQueueStateChange?: (state: string, data?: Record<string, unknown>) => void;
            }) => Promise<string>;
        };
        generateImage?: (input: {
            prompt?: string;
            signal?: AbortSignal;
            onQueueStateChange?: (state: string, data?: Record<string, unknown>) => void;
        }) => Promise<string>;
    };
};

type ImageRuntime = {
    clearSharedImageRequests: () => void;
    generateSharedImage: (input: {
        prompt: string;
        cacheNamespace?: string;
        cache?: boolean;
        signal?: AbortSignal;
        onProgress?: (status: string, ahead?: number, delay?: number) => void;
    }) => Promise<string>;
};

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<T>((nextResolve, nextReject) => {
        resolve = nextResolve;
        reject = nextReject;
    });
    return { promise, reject, resolve };
}

async function waitFor(predicate: () => boolean): Promise<void> {
    for (let index = 0; index < 40; index += 1) {
        if (predicate()) { return; }
        await new Promise<void>((resolve) => setImmediate(resolve));
    }
    assert.fail('condition_not_reached');
}

async function loadImageRuntime(): Promise<ImageRuntime> {
    // eslint-disable-next-line no-unsanitized/method -- A test-only query isolates module-level request state.
    return await import(`../../draw/shared/generated-image-runtime.js?runtime-test=${Date.now()}-${Math.random()}`) as ImageRuntime;
}

async function readGeneratedImageCacheRecords(): Promise<Array<Record<string, unknown>>> {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('xb_draw_generated_images', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
    try {
        return await new Promise<Array<Record<string, unknown>>>((resolve, reject) => {
            const request = database.transaction('images', 'readonly').objectStore('images').getAll();
            request.onsuccess = () => resolve(request.result as Array<Record<string, unknown>>);
            request.onerror = () => reject(request.error);
        });
    } finally {
        database.close();
    }
}

test('shared image runtime deduplicates one effective request without coupling consumer cancellation', async () => {
    const originalIndexedDb = globalThis.indexedDB;
    const originalWindow = (globalThis as unknown as { window?: DrawWindow }).window;
    Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: indexedDB });
    const generation = deferred<string>();
    let providerCalls = 0;
    let providerSignal: AbortSignal | undefined;
    (globalThis as unknown as { window: DrawWindow }).window = {
        xiaobaixDraw: {
            getProvider: () => 'novelai',
            buildPromptData: ({ prompt }) => ({ positive: prompt, params: { seed: 1 } }),
            generateImage: async ({ signal }) => {
                providerCalls += 1;
                providerSignal = signal;
                return await generation.promise;
            },
        },
    };

    const runtime = await loadImageRuntime();
    try {
        const prompt = `dedupe-${Date.now()}`;
        const firstController = new AbortController();
        const secondController = new AbortController();
        const first = runtime.generateSharedImage({ prompt, signal: firstController.signal });
        const second = runtime.generateSharedImage({ prompt, signal: secondController.signal });
        await waitFor(() => providerCalls === 1);
        firstController.abort();
        await assert.rejects(first, { name: 'AbortError' });
        assert.equal(providerSignal?.aborted, false);
        generation.resolve('shared-base64');
        assert.equal(await second, 'shared-base64');
        assert.equal(providerCalls, 1);
    } finally {
        runtime.clearSharedImageRequests();
        Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: originalIndexedDb });
        (globalThis as unknown as { window?: DrawWindow }).window = originalWindow;
    }
});

test('shared image runtime reports the number of requests ahead instead of one-based queue position', async () => {
    const originalIndexedDb = globalThis.indexedDB;
    const originalWindow = (globalThis as unknown as { window?: DrawWindow }).window;
    Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: indexedDB });
    (globalThis as unknown as { window: DrawWindow }).window = {
        xiaobaixDraw: {
            getProvider: () => 'novelai',
            buildPromptData: ({ prompt }) => ({ positive: prompt }),
            generateImage: async ({ onQueueStateChange }) => {
                onQueueStateChange?.('queued', { ahead: 1, position: 2 });
                return 'queued-image';
            },
        },
    };

    const runtime = await loadImageRuntime();
    try {
        const progress: Array<{ status: string; ahead?: number }> = [];
        const result = await runtime.generateSharedImage({
            prompt: `queue-ahead-${Date.now()}`,
            cache: false,
            onProgress: (status, ahead) => progress.push({ status, ahead }),
        });
        assert.equal(result, 'queued-image');
        assert.deepEqual(progress, [{ status: 'queued', ahead: 1 }]);
    } finally {
        runtime.clearSharedImageRequests();
        Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: originalIndexedDb });
        (globalThis as unknown as { window?: DrawWindow }).window = originalWindow;
    }
});

test('generated image cache fingerprints provider, effective settings, and consumer namespace', async () => {
    const originalIndexedDb = globalThis.indexedDB;
    const originalWindow = (globalThis as unknown as { window?: DrawWindow }).window;
    Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: indexedDB });
    let provider = 'novelai';
    let seed = 1;
    let providerConfig: Record<string, unknown> = {
        version: 1,
        overrideSize: 'default',
        accidentalSecret: 'never-persist-provider-config',
    };
    let providerCalls = 0;
    (globalThis as unknown as { window: DrawWindow }).window = {
        xiaobaixDraw: {
            getProvider: () => provider,
            buildPromptData: ({ prompt }) => ({ positive: prompt, params: { seed } }),
            prepareGeneration: ({ prompt }) => {
                const capturedProvider = provider;
                const capturedSeed = seed;
                const capturedProviderConfig = structuredClone(providerConfig);
                return {
                    fingerprint: {
                        version: 1,
                        provider: capturedProvider,
                        promptData: { positive: prompt, params: { seed: capturedSeed } },
                        providerConfig: capturedProviderConfig,
                    },
                    execute: async () => `image-${++providerCalls}`,
                };
            },
        },
    };

    const runtime = await loadImageRuntime();
    try {
        const prompt = `fingerprint-${Date.now()}`;
        assert.equal(await runtime.generateSharedImage({ prompt, cacheNamespace: 'tavern' }), 'image-1');
        assert.equal(await runtime.generateSharedImage({ prompt, cacheNamespace: 'tavern' }), 'image-1');
        const cachedRecords = (await readGeneratedImageCacheRecords())
            .filter(record => record.prompt === prompt);
        assert.equal(cachedRecords.length, 1);
        assert.equal(Object.hasOwn(cachedRecords[0], 'fingerprint'), false);
        assert.doesNotMatch(JSON.stringify(cachedRecords), /never-persist-provider-config/);
        providerConfig = { version: 1, overrideSize: '832x1216' };
        assert.equal(await runtime.generateSharedImage({ prompt, cacheNamespace: 'tavern' }), 'image-2');
        seed = 2;
        assert.equal(await runtime.generateSharedImage({ prompt, cacheNamespace: 'tavern' }), 'image-3');
        provider = 'sdwebui';
        providerConfig = { version: 1, endpointHash: 'endpoint-safe' };
        assert.equal(await runtime.generateSharedImage({ prompt, cacheNamespace: 'tavern' }), 'image-4');
        assert.equal(await runtime.generateSharedImage({ prompt, cacheNamespace: 'fourth-wall' }), 'image-5');
        assert.equal(await runtime.generateSharedImage({ prompt, cacheNamespace: 'tavern', cache: false }), 'image-6');
        assert.equal(await runtime.generateSharedImage({ prompt, cacheNamespace: 'tavern', cache: false }), 'image-7');
        assert.equal(providerCalls, 7);
    } finally {
        runtime.clearSharedImageRequests();
        Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: originalIndexedDb });
        (globalThis as unknown as { window?: DrawWindow }).window = originalWindow;
    }
});

test('shared image runtime executes the same settings snapshot used for its cache key', async () => {
    const originalIndexedDb = globalThis.indexedDB;
    const originalWindow = (globalThis as unknown as { window?: DrawWindow }).window;
    Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: indexedDB });
    let size = '832x1216';
    const executionGate = deferred<void>();
    const executedSizes: string[] = [];
    (globalThis as unknown as { window: DrawWindow }).window = {
        xiaobaixDraw: {
            getProvider: () => 'novelai',
            buildPromptData: ({ prompt }) => ({ positive: prompt }),
            prepareGeneration: ({ prompt }) => {
                const capturedSize = size;
                return {
                    fingerprint: {
                        provider: 'novelai',
                        promptData: { positive: prompt },
                        providerConfig: { overrideSize: capturedSize },
                    },
                    execute: async () => {
                        await executionGate.promise;
                        executedSizes.push(capturedSize);
                        return `image-${capturedSize}`;
                    },
                };
            },
        },
    };

    const runtime = await loadImageRuntime();
    try {
        const prompt = `settings-race-${Date.now()}`;
        const first = runtime.generateSharedImage({ prompt });
        size = '1216x832';
        executionGate.resolve();
        assert.equal(await first, 'image-832x1216');
        assert.equal(await runtime.generateSharedImage({ prompt }), 'image-1216x832');
        assert.deepEqual(executedSizes, ['832x1216', '1216x832']);
    } finally {
        runtime.clearSharedImageRequests();
        Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: originalIndexedDb });
        (globalThis as unknown as { window?: DrawWindow }).window = originalWindow;
    }
});
