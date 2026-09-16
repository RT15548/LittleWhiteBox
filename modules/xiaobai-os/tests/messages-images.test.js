import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { createMessagesMedia } from '../apps/messages/host/media-adapter.js';
import { createMessagesController } from '../apps/messages/host/controller.js';
import { createMessagesRuntime } from '../apps/messages/host/runtime.js';
import { harness, photo } from './helpers/messages-harness.js';
import { extractImageFromResponse, formatImageBase64 } from '../../draw/providers/novelai/novel-image-response.js';

const png = photo.upload.dataUrl.split(',')[1];
const message = { id: 'image', payload: { type: 'image', description: '茶杯', generationPrompt: 'teacup' } };
const status = () => ({ enabled: true, ready: true });

test('real PNG response format displays after generation and cache hits without another generation', async () => {
    const returned = await extractImageFromResponse(Uint8Array.from(atob(png), char => char.charCodeAt(0)), () => {throw Error('not a ZIP');});
    assert.equal(returned, png);
    let cached = null; let generations = 0;
    const media = createMessagesMedia(() => ({ xiaobaixDraw: {
        getStatus: status, checkGeneratedImageCache: async () => cached,
        generateSharedImage: async () => {generations++; cached = returned; return returned;},
    } }));
    for (const requestId of ['first', 'reopened']) {
        assert.equal(await media.image(message, { requestId }), photo.upload.dataUrl);
    }
    assert.equal(generations, 1);
});

test('existing raster data URLs retain their MIME and unsafe generation results are rejected', async () => {
    for (const mime of ['image/jpeg', 'image/webp', 'image/gif']) {
        const result = formatImageBase64('AAAA', mime);
        const media = createMessagesMedia(() => ({ xiaobaixDraw: { getStatus: status,
            checkGeneratedImageCache: async () => result, generateSharedImage: async () => {throw Error('cache missed');},
        } }));
        assert.equal(await media.image(message, { requestId: mime }), result);
    }
    // eslint-disable-next-line no-script-url -- Verify that script URLs cannot become an image source.
    for (const result of ['https://example.test/tracker.png', 'javascript:alert(1)', 'data:text/html;base64,AAAA', 'data:image/svg+xml;base64,AAAA']) {
        const media = createMessagesMedia(() => ({ xiaobaixDraw: { getStatus: status,
            checkGeneratedImageCache: async () => null, generateSharedImage: async () => result,
        } }));
        await assert.rejects(media.image(message, { requestId: 'invalid' }), /messages_image_invalid/);
    }
});

test('cancelling one image request suppresses late progress/results without cancelling its replacement', async () => {
    const runs = []; const progress = [];
    const media = createMessagesMedia(() => ({ xiaobaixDraw: { getStatus: status,
        checkGeneratedImageCache: async () => null,
        generateSharedImage: options => new Promise(resolve => {runs.push({ ...options, resolve });}),
    } }));
    const first = media.image(message, { requestId: 'old', onProgress: (...event) => progress.push(event) });
    const rejected = assert.rejects(first, /messages_media_cancelled/);
    await setImmediate();
    runs[0].onProgress('queued', 2);
    assert.deepEqual(progress.at(-1), ['queued', 2, undefined]);
    media.cancelImage('old');
    const second = media.image(message, { requestId: 'new' });
    await setImmediate();
    const count = progress.length;
    runs[0].onProgress('generating'); runs[0].resolve(png);
    media.cancelImage('old');
    assert.equal(progress.length, count);
    assert.equal(runs[0].signal.aborted, true); assert.equal(runs[1].signal.aborted, false);
    runs[1].resolve(png);
    await rejected; assert.equal(await second, photo.upload.dataUrl);
});

test('image controller forwards correlated queue progress and provider failures instead of masking them', async () => {
    const h = await harness();
    h.response = () => ({ text: JSON.stringify({ replies: [message.payload] }) });
    await h.send('甲', 'send');
    const selected = h.service.current().messages.at(-1);
    const media = createMessagesMedia(() => ({ xiaobaixDraw: { getStatus: status,
        checkGeneratedImageCache: async () => null,
        generateSharedImage: async ({ onProgress }) => {onProgress('queued', 3); throw Error('HTTP 429: 绘图请求过于频繁');},
    } }));
    const runtime = createMessagesRuntime({ ...h.deps, identity: () => h.identity, isGenerating: () => false, changed() {} });
    const controller = createMessagesController({ ...h.deps, runtime, media, identity: () => h.identity,
        context: { ...h.deps.context, knownPeople: () => [] }, isGenerating: () => false,
        subscribeGeneration: () => () => {}, subscribeChat: () => () => {},
    });
    const events = [];
    controller.activate({ isCurrent: () => true, post: (type, payload) => events.push({ type, payload }) });
    await assert.rejects(controller.handleMessage({ type: 'messages/image/generate', payload: {
        chatIdentity: h.identity, messageId: selected.id, mediaRequestId: 'request-1',
    } }), /HTTP 429: 绘图请求过于频繁/);
    assert.deepEqual(events.find(event => event.payload.status === 'queued'), { type: 'messages/image-progress',
        payload: { messageId: selected.id, mediaRequestId: 'request-1', status: 'queued', ahead: 3, delay: undefined } });
    controller.deactivate(); await runtime.stop();
});
