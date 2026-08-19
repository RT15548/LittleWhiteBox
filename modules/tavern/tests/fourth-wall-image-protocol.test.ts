import assert from 'node:assert/strict';
import test from 'node:test';

type FourthWallImageProtocol = {
    cancelFourthWallImageRequests: () => void;
    handleGenerate: (
        data: Record<string, unknown>,
        postToFrame: (payload: Record<string, unknown>) => void,
    ) => Promise<void>;
};

async function loadFourthWallImageProtocol(): Promise<FourthWallImageProtocol> {
    return await import('../../fourth-wall/fw-image-protocol.js') as unknown as FourthWallImageProtocol;
}

async function waitFor(predicate: () => boolean): Promise<void> {
    for (let index = 0; index < 40; index += 1) {
        if (predicate()) {return;}
        await new Promise<void>((resolve) => setImmediate(resolve));
    }
    assert.fail('condition_not_reached');
}

test('closing fourth wall aborts its pending iframe image requests without posting a stale result', async () => {
    const { cancelFourthWallImageRequests, handleGenerate } = await loadFourthWallImageProtocol();
    const originalWindow = (globalThis as unknown as { window?: unknown }).window;
    let providerSignal: AbortSignal | undefined;
    (globalThis as unknown as { window: unknown }).window = {
        xiaobaixDraw: {
            generateSharedImage: ({ signal }: { signal: AbortSignal }) => new Promise<string>((resolve, reject) => {
                providerSignal = signal;
                signal.addEventListener('abort', () => {
                    reject(new DOMException('图片生成已取消', 'AbortError'));
                }, { once: true });
                void resolve;
            }),
        },
    };
    const posted: Array<Record<string, unknown>> = [];

    try {
        const request = handleGenerate(
            { requestId: 'fw-image-request', tags: '1girl, rain' },
            (payload: Record<string, unknown>) => posted.push(payload),
        );
        await waitFor(() => !!providerSignal);
        cancelFourthWallImageRequests();
        await request;

        assert.equal(providerSignal?.aborted, true);
        assert.deepEqual(posted, []);
    } finally {
        cancelFourthWallImageRequests();
        (globalThis as unknown as { window?: unknown }).window = originalWindow;
    }
});
