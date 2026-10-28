import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { convertImageToJpeg } from '../gallery-image-codec.js';

// Contracts (cost: lost paid images / blocked image saves / retained decoded originals):
// - Conversion accepts base64 Data URLs with MIME parameters and produces JPEG or rejects, never reports an empty/non-JPEG result as success; an unavailable bitmap decoder uses the DOM decoder.
// - A hung conversion releases resources and the queue; late native callbacks cannot resume encoding or affect the next image.
const PNG = 'data:image/png;base64,AQID';
const JPEG = 'data:image/jpeg;base64,/9j/AA==';
const settle = () => setImmediate();

function browser(t) {
    const state = { mode: '', images: [], canvases: [], readers: [], bitmaps: [], late: null };
    const bitmap = () => {
        const value = { width: 2, height: 2, closed: false, close() { this.closed = true; } };
        state.bitmaps.push(value);
        return value;
    };
    const globals = {
        createImageBitmap: async blob => {
            assert.deepEqual([...new Uint8Array(await blob.arrayBuffer())], [1, 2, 3]);
            if (state.mode === 'bitmap-error') throw new Error('Decoder unavailable');
            if (state.mode === 'bitmap-pending') return new Promise(resolve => { state.late = () => resolve(bitmap()); });
            return bitmap();
        },
        Image: class {
            constructor() { this.src = ''; this.naturalWidth = 2; this.naturalHeight = 2; state.images.push(this); }
            decode() {
                if (state.mode === 'bitmap-only') return Promise.reject(new Error('DOM decoder unavailable'));
                if (state.mode === 'image-pending') return new Promise(resolve => { state.late = resolve; });
                return Promise.resolve();
            }
        },
        document: { createElement() {
            const canvas = { width: 0, height: 0,
                getContext: () => ({ fillRect() {}, drawImage() {} }),
                toBlob(callback) {
                    const complete = () => callback(new Blob(['jpeg'], { type: state.mode === 'wrong-format' ? 'image/png' : 'image/jpeg' }));
                    if (state.mode === 'blob-pending') state.late = complete;
                    else queueMicrotask(complete);
                },
            };
            state.canvases.push(canvas);
            return canvas;
        } },
        FileReader: class {
            constructor() { this.readyState = 0; this.aborted = false; state.readers.push(this); }
            readAsDataURL() {
                this.readyState = 1;
                const complete = () => { this.result = state.mode === 'empty-result' ? 'data:,' : JPEG; this.readyState = 2; this.onload(); };
                if (state.mode === 'reader-pending') state.late = complete;
                else queueMicrotask(complete);
            }
            abort() { this.aborted = true; this.readyState = 2; this.onabort(); }
        },
    };
    for (const [name, value] of Object.entries(globals)) {
        const previous = Object.getOwnPropertyDescriptor(globalThis, name);
        Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
        t.after(() => {
            if (previous) Object.defineProperty(globalThis, name, previous);
            else delete globalThis[name];
        });
    }
    return state;
}

test('JPEG conversion uses bitmap or DOM decoding and rejects invalid output', async t => {
    const state = browser(t);
    state.mode = 'bitmap-only';
    for (const input of [
        'data:image/png;base64,AQ\nID',
        'data:image/png;charset=utf-8;base64,AQID',
        'data:image/png;name=generated.png;base64,AQID',
        'data:image/png;charset=utf-8;name=generated.png;base64,AQID',
    ]) assert.equal(await convertImageToJpeg(input), JPEG);
    assert.ok(state.bitmaps.every(value => value.closed));
    state.mode = 'bitmap-error';
    assert.equal(await convertImageToJpeg(PNG), JPEG);
    assert.ok(state.images.every(value => value.src === ''));
    globalThis.createImageBitmap = undefined;
    state.mode = '';
    assert.equal(await convertImageToJpeg(PNG), JPEG);
    for (const mode of ['wrong-format', 'empty-result']) {
        state.mode = mode;
        await assert.rejects(convertImageToJpeg(PNG));
    }
    assert.equal(await convertImageToJpeg(JPEG), JPEG);
    assert.ok(state.canvases.every(value => value.width === 0 && value.height === 0));
});

test('hung conversions release the queue and dispose late native resources', async t => {
    const state = browser(t);
    t.mock.timers.enable({ apis: ['setTimeout'] });
    state.mode = 'bitmap-pending';
    const first = convertImageToJpeg(PNG);
    await settle();
    const lateBitmap = state.late;
    state.mode = '';
    t.mock.timers.runAll();
    assert.equal(await first, JPEG, 'bitmap timeout can finish through DOM decoding');
    const canvasCount = state.canvases.length;
    lateBitmap();
    await settle();
    assert.ok(state.bitmaps.every(value => value.closed));
    assert.equal(state.canvases.length, canvasCount, 'late bitmap never starts a new encoding');

    globalThis.createImageBitmap = undefined;
    for (const mode of ['image-pending', 'blob-pending', 'reader-pending']) {
        state.mode = mode;
        const failed = assert.rejects(convertImageToJpeg(PNG));
        await settle();
        const late = state.late;
        const next = convertImageToJpeg(PNG);
        state.mode = '';
        t.mock.timers.runAll();
        await failed;
        assert.equal(await next, JPEG, 'the next image is not blocked by the timed-out one');
        const readers = state.readers.length;
        late();
        await settle();
        assert.equal(state.readers.length, readers, 'late callbacks cannot restart the pipeline');
        assert.ok(state.images.every(value => value.src === ''));
        assert.ok(state.canvases.every(value => value.width === 0 && value.height === 0));
    }
    assert.ok(state.readers.some(value => value.aborted));
});
