import assert from 'node:assert/strict';
import test from 'node:test';

import {
    NovelImageResponseError,
    extractImageFromResponse,
    readImageResponse,
} from '../novel-image-response.js';

function createZipLoader(chunks) {
    return async () => ({
        async loadAsync() {
            return {
                files: {
                    'image.webp': {
                        name: 'image.webp',
                        internalStream() {
                            const handlers = {};
                            return {
                                on(event, handler) {
                                    handlers[event] = handler;
                                    return this;
                                },
                                pause() {},
                                resume() {
                                    chunks.forEach(chunk => handlers.data?.(chunk));
                                    handlers.end?.();
                                },
                            };
                        },
                    },
                },
            };
        },
    });
}

test('rejects a response declared above 128 MiB before reading it', async () => {
    const response = new Response(new Uint8Array([1]), {
        headers: { 'Content-Length': String(128 * 1024 * 1024 + 1) },
    });

    await assert.rejects(readImageResponse(response), NovelImageResponseError);
});

test('cancels an active browser response stream', async () => {
    const response = new Response(new ReadableStream({ start() {} }));
    const controller = new AbortController();
    const pending = readImageResponse(response, controller.signal);

    controller.abort();

    await assert.rejects(pending, error => error.name === 'AbortError');
});

test('preserves the MIME type of raw images', async () => {
    const jpeg = new Uint8Array([0xFF, 0xD8, 0xFF, 0x00]);
    const result = await extractImageFromResponse(jpeg, () => {
        throw new Error('ZIP loader should not run');
    });

    assert.equal(result, `data:image/jpeg;base64,${btoa(String.fromCharCode(...jpeg))}`);
});

test('classifies malformed upstream bodies as invalid ZIP responses', async () => {
    await assert.rejects(
        extractImageFromResponse(new Uint8Array([1, 2, 3]), async () => ({
            async loadAsync() { throw new Error('malformed'); },
        })),
        NovelImageResponseError,
    );
});

test('streams ZIP output and preserves its MIME type', async () => {
    const webp = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
    ]);
    const result = await extractImageFromResponse(new Uint8Array([0x50, 0x4B]), createZipLoader([webp]));

    assert.equal(result, `data:image/webp;base64,${btoa(String.fromCharCode(...webp))}`);
});

test('stops ZIP extraction when decompressed output exceeds 128 MiB', async () => {
    const oversizedChunk = { byteLength: 128 * 1024 * 1024 + 1 };

    await assert.rejects(
        extractImageFromResponse(new Uint8Array([0x50, 0x4B]), createZipLoader([oversizedChunk])),
        NovelImageResponseError,
    );
});
