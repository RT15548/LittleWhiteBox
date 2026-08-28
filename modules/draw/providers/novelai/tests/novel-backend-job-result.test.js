import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import test from 'node:test';

import { IMAGE_BATCH_JOBS_CAPABILITY } from '../../../shared/backend-image-jobs.js';
import {
    decodeNovelBackendJobResult,
    hasNovelV5FinalImageCapability,
    NOVELAI_V5_FINAL_IMAGE_CAPABILITY,
} from '../novel-backend-job-result.js';

const PNG = Uint8Array.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x00,
]);

class TestFileReader {
    async readAsDataURL(blob) {
        try {
            const bytes = Buffer.from(await blob.arrayBuffer());
            this.result = `data:${blob.type};base64,${bytes.toString('base64')}`;
            this.onload?.();
        } catch (error) {
            this.error = error;
            this.onerror?.();
        }
    }
}

test('requires the explicit server-normalized NovelAI V5 result contract', () => {
    assert.equal(hasNovelV5FinalImageCapability({
        ready: true,
        capabilities: [IMAGE_BATCH_JOBS_CAPABILITY, NOVELAI_V5_FINAL_IMAGE_CAPABILITY],
    }), true);
    assert.equal(hasNovelV5FinalImageCapability({
        ready: true,
        capabilities: [IMAGE_BATCH_JOBS_CAPABILITY],
    }), false);
    assert.equal(hasNovelV5FinalImageCapability({
        ready: true,
        capabilities: [NOVELAI_V5_FINAL_IMAGE_CAPABILITY],
    }), false);
});

test('reads the server-normalized NovelAI background PNG without MessagePack decoding', async () => {
    const originalFileReader = globalThis.FileReader;
    globalThis.FileReader = TestFileReader;
    try {
        const result = await decodeNovelBackendJobResult({
            response: new Response(PNG, { headers: { 'Content-Type': 'image/png' } }),
            kind: 'msgpack-stream',
        });
        assert.equal(result, Buffer.from(PNG).toString('base64'));
    } finally {
        globalThis.FileReader = originalFileReader;
    }
});

test('preserves the MIME data URL for legacy NovelAI background images', async () => {
    const originalFileReader = globalThis.FileReader;
    globalThis.FileReader = TestFileReader;
    try {
        const jpeg = Uint8Array.of(0xFF, 0xD8, 0xFF, 0x00);
        const result = await decodeNovelBackendJobResult({
            response: new Response(jpeg, { headers: { 'Content-Type': 'image/jpeg' } }),
            kind: 'legacy-image',
        });
        assert.equal(result, `data:image/jpeg;base64,${Buffer.from(jpeg).toString('base64')}`);
    } finally {
        globalThis.FileReader = originalFileReader;
    }
});

test('rejects a stale backend that still returns the original V5 MessagePack stream', async () => {
    let cancelled = false;
    const response = {
        headers: new Headers({ 'Content-Type': 'application/vnd.littlewhitebox.novelai-msgpack' }),
        body: {
            async cancel() {
                cancelled = true;
            },
        },
    };
    await assert.rejects(
        decodeNovelBackendJobResult({
            response,
            kind: 'msgpack-stream',
        }),
        error => error.code === 'novelai_backend_result_contract_outdated'
            && error.discardBackendResult === true
            && /完整覆盖服务端插件/.test(error.message),
    );
    assert.equal(cancelled, true);
});
