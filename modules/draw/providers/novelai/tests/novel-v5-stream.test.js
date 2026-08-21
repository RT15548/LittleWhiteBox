import assert from 'node:assert/strict';
import test from 'node:test';
import { encode } from '@msgpack/msgpack';
import { decode } from '../../../../../libs/msgpack.mjs';

import {
    NovelV5StreamError,
    readNovelV5ErrorText,
    readNovelV5FinalImage,
} from '../novel-v5-stream.js';

const PNG = Uint8Array.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x00,
]);

function frame(event) {
    const payload = encode(event);
    const bytes = new Uint8Array(payload.length + 4);
    new DataView(bytes.buffer).setUint32(0, payload.length, false);
    bytes.set(payload, 4);
    return bytes;
}

function responseFromChunks(chunks) {
    return new Response(new ReadableStream({
        start(controller) {
            for (const chunk of chunks) controller.enqueue(chunk);
            controller.close();
        },
    }));
}

test('reads split length-prefixed MessagePack events and returns the sample-zero final PNG', async () => {
    const intermediate = frame({
        event_type: 'intermediate',
        image: PNG,
        samp_ix: 0,
        step_ix: 1,
    });
    const final = frame({ event_type: 'final', image: PNG, samp_ix: 0 });
    const bytes = new Uint8Array(intermediate.length + final.length);
    bytes.set(intermediate, 0);
    bytes.set(final, intermediate.length);
    const chunks = [
        bytes.slice(0, 2),
        bytes.slice(2, intermediate.length + 3),
        bytes.slice(intermediate.length + 3),
    ];

    const image = await readNovelV5FinalImage(responseFromChunks(chunks), { decode });
    assert.deepEqual(image, PNG);
});

test('surfaces provider errors and rejects invalid sample or image data', async () => {
    await assert.rejects(
        readNovelV5FinalImage(responseFromChunks([
            frame({ event_type: 'error', message: 'quota exhausted', samp_ix: 0 }),
        ]), { decode }),
        error => error instanceof NovelV5StreamError
            && error.code === 'V5_PROVIDER_ERROR'
            && error.message === 'quota exhausted',
    );

    await assert.rejects(
        readNovelV5FinalImage(responseFromChunks([
            frame({ event_type: 'final', image: PNG, samp_ix: 1 }),
        ]), { decode }),
        /意外的样本编号：1/,
    );

    await assert.rejects(
        readNovelV5FinalImage(responseFromChunks([
            frame({ event_type: 'final', image: Uint8Array.of(1, 2, 3), samp_ix: 0 }),
        ]), { decode }),
        /没有有效的 PNG 图片/,
    );
});

test('rejects truncated, oversized, and final-less V5 streams', async () => {
    const truncated = frame({ event_type: 'final', image: PNG, samp_ix: 0 }).slice(0, 7);
    await assert.rejects(
        readNovelV5FinalImage(responseFromChunks([truncated]), { decode }),
        /帧结束前被截断/,
    );

    const oversizedHeader = new Uint8Array(4);
    new DataView(oversizedHeader.buffer).setUint32(0, 1024, false);
    await assert.rejects(
        readNovelV5FinalImage(responseFromChunks([oversizedHeader]), {
            decode,
            maxFrameBytes: 32,
        }),
        /无效的 MessagePack 帧长度/,
    );

    await assert.rejects(
        readNovelV5FinalImage(responseFromChunks([
            frame({ event_type: 'intermediate', image: PNG, samp_ix: 0, step_ix: 1 }),
        ]), { decode }),
        /没有 final 图片/,
    );
});

test('rejects unknown V5 events instead of silently accepting a changed protocol', async () => {
    await assert.rejects(
        readNovelV5FinalImage(responseFromChunks([
            frame({ event_type: 'future-event', samp_ix: 0 }),
        ]), { decode }),
        /未知事件：future-event/,
    );
});

test('cancels a pending stream read as soon as the request signal aborts', async () => {
    let cancelled = false;
    const response = new Response(new ReadableStream({
        cancel() {
            cancelled = true;
        },
    }));
    const controller = new AbortController();
    const pending = readNovelV5FinalImage(response, {
        decode,
        signal: controller.signal,
    });

    controller.abort();
    await assert.rejects(pending, error => error.name === 'AbortError');
    assert.equal(cancelled, true);
});

test('classifies a native response-stream failure as a transport error', async () => {
    const response = new Response(new ReadableStream({
        pull() {
            throw new Error('socket reset');
        },
    }));

    await assert.rejects(
        readNovelV5FinalImage(response, { decode }),
        error => error instanceof NovelV5StreamError
            && error.code === 'V5_STREAM_READ_FAILED'
            && /socket reset/.test(error.message),
    );
});

test('bounds V5 HTTP error bodies before they are turned into UI messages', async () => {
    const declaredTooLarge = new Response('provider error', {
        status: 500,
        headers: { 'Content-Length': '14' },
    });
    assert.equal(
        await readNovelV5ErrorText(declaredTooLarge, 4),
        'HTTP 500（错误响应超过 4 字节）',
    );

    const streamed = new Response('abcdef', { status: 500 });
    assert.equal(await readNovelV5ErrorText(streamed, 4), 'abcd\n…（错误响应已截断）');
});
