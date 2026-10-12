'use strict';

const assert = require('node:assert/strict');
const { cp, mkdtemp, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { PassThrough, Readable } = require('node:stream');
const test = require('node:test');
const zlib = require('node:zlib');
const { encode } = require('@msgpack/msgpack');

const {
    NovelV5StreamError,
    readNovelV5FinalImage,
} = require('../providers/novelai/v5-stream.js');

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');

function frame(event) {
    const payload = Buffer.from(encode(event));
    const header = Buffer.alloc(4);
    header.writeUInt32BE(payload.length);
    return Buffer.concat([header, payload]);
}

function responseFromChunks(chunks, headers = {}) {
    const response = Readable.from(chunks);
    response.headers = headers;
    return response;
}

test('extracts only the sample-zero final PNG from split V5 MessagePack frames', async () => {
    const intermediate = frame({ event_type: 'intermediate', image: PNG, samp_ix: 0, step_ix: 1 });
    const final = frame({ event_type: 'final', image: PNG, samp_ix: 0 });
    const stream = Buffer.concat([intermediate, final]);
    const result = await readNovelV5FinalImage(responseFromChunks([
        stream.subarray(0, 2),
        stream.subarray(2, intermediate.length + 3),
        stream.subarray(intermediate.length + 3),
    ]));

    assert.deepEqual(result.buffer, PNG);
    assert.equal(result.streamBytes, stream.length);
});

test('decodes a compressed V5 stream from a non-compliant upstream', async () => {
    const stream = frame({ event_type: 'final', image: PNG, samp_ix: 0 });
    const result = await readNovelV5FinalImage(responseFromChunks(
        [zlib.gzipSync(stream)],
        { 'content-encoding': 'gzip' },
    ));

    assert.deepEqual(result.buffer, PNG);
    assert.equal(result.streamBytes, stream.length);
});

test('closes an upstream response that declares an unsupported compression', async () => {
    const response = responseFromChunks([], { 'content-encoding': 'compress' });

    await assert.rejects(
        readNovelV5FinalImage(response),
        /不支持的响应压缩：compress/,
    );
    assert.equal(response.destroyed, true);
});

test('loads and decodes from a copied plugin provider without installed packages', async () => {
    const tempDirectory = await mkdtemp(path.join(tmpdir(), 'lwb-novel-v5-parser-'));
    const sourceDirectory = path.resolve(__dirname, '../providers/novelai');
    const isolatedDirectory = path.join(tempDirectory, 'novelai');
    try {
        await cp(sourceDirectory, isolatedDirectory, { recursive: true });
        const isolated = require(path.join(isolatedDirectory, 'v5-stream.js'));
        const result = await isolated.readNovelV5FinalImage(responseFromChunks([
            frame({ event_type: 'final', image: PNG, samp_ix: 0 }),
        ]));
        assert.deepEqual(result.buffer, PNG);
    } finally {
        await rm(tempDirectory, { recursive: true, force: true });
    }
});

test('surfaces provider errors before validating their optional sample index', async () => {
    await assert.rejects(
        readNovelV5FinalImage(responseFromChunks([
            frame({ event_type: 'error', message: 'quota exhausted' }),
        ])),
        error => error instanceof NovelV5StreamError
            && error.code === 'V5_PROVIDER_ERROR'
            && error.message === 'quota exhausted',
    );
});

test('rejects invalid sample, event, and final image data', async () => {
    await assert.rejects(
        readNovelV5FinalImage(responseFromChunks([
            frame({ event_type: 'final', image: PNG, samp_ix: 1 }),
        ])),
        /样本编号：1/,
    );
    await assert.rejects(
        readNovelV5FinalImage(responseFromChunks([
            frame({ event_type: 'future-event', samp_ix: 0 }),
        ])),
        /未知事件：future-event/,
    );
    await assert.rejects(
        readNovelV5FinalImage(responseFromChunks([
            frame({ event_type: 'final', image: Uint8Array.of(1, 2, 3), samp_ix: 0 }),
        ])),
        /有效的 PNG 图片/,
    );
});

test('rejects truncated, oversized, and final-less V5 streams', async () => {
    const truncated = frame({ event_type: 'final', image: PNG, samp_ix: 0 }).subarray(0, 7);
    await assert.rejects(
        readNovelV5FinalImage(responseFromChunks([truncated])),
        /帧结束前被截断/,
    );

    const oversizedHeader = Buffer.alloc(4);
    oversizedHeader.writeUInt32BE(1024);
    await assert.rejects(
        readNovelV5FinalImage(responseFromChunks([oversizedHeader]), { maxFrameBytes: 32 }),
        /无效的 MessagePack 帧长度/,
    );

    await assert.rejects(
        readNovelV5FinalImage(responseFromChunks([
            frame({ event_type: 'intermediate', image: PNG, samp_ix: 0 }),
        ])),
        /没有 final 图片/,
    );

    await assert.rejects(
        readNovelV5FinalImage(responseFromChunks([
            frame({ event_type: 'final', image: PNG, samp_ix: 0 }),
        ]), { maxTotalBytes: 4 }),
        /超过 4 字节.*限制/,
    );
});

test('aborts a pending server-side V5 stream read immediately', async () => {
    const response = new PassThrough();
    response.headers = {};
    const controller = new AbortController();
    const pending = readNovelV5FinalImage(response, { signal: controller.signal });

    controller.abort();
    await assert.rejects(pending, error => error.name === 'AbortError');
    assert.equal(response.destroyed, true);
});

test('classifies an upstream Node stream failure as a V5 transport error', async () => {
    const response = new Readable({
        read() {
            this.destroy(new Error('socket reset'));
        },
    });
    response.headers = {};

    await assert.rejects(
        readNovelV5FinalImage(response),
        error => error instanceof NovelV5StreamError
            && error.code === 'V5_STREAM_READ_FAILED'
            && /socket reset/.test(error.message),
    );
});
