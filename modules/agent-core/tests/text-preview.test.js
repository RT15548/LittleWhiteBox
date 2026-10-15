import assert from 'node:assert/strict';
import test from 'node:test';
import { readTextPreview } from '../runtime/text-preview.js';

const limits = { lineLimit: 100, extraLines: 8, charLimit: 55_200, lineChars: 2000 };
function responseFor(text, chunkSize, headers = {}) {
    const bytes = new TextEncoder().encode(text);
    const state = { consumed: 0, cancelled: false };
    const body = new ReadableStream({
        pull(controller) {
            if (state.consumed === bytes.length) { controller.close(); return; }
            const end = Math.min(bytes.length, state.consumed + chunkSize);
            controller.enqueue(bytes.slice(state.consumed, end));
            state.consumed = end;
        },
        cancel() { state.cancelled = true; },
    }, { highWaterMark: 0 });
    return { response: new Response(body, { headers }), state, bytes };
}
const read = (response, options = {}) => readTextPreview(response, { ...limits, tail: false, assertCurrent() {}, ...options });

test('tail retains original line prefixes, including a huge final line, independently of byte boundaries', async () => {
    const cases = [
        ['before', `BEGIN_FINAL:${'x'.repeat(120_000)}:END_FINAL`],
        [...Array.from({ length: 70 }, (_, i) => `LINE_${i}:${'x'.repeat(1900)}`), `FINAL:${'y'.repeat(8000)}`],
    ];
    for (const original of cases) {
        for (const trailingNewline of [false, true]) {
            const lines = trailingNewline ? [...original, ''] : original;
            for (const chunkSize of [127, 8192, 65536]) {
                const { response, state, bytes } = responseFor(lines.join('\n'), chunkSize);
                const preview = await read(response, { tail: true });
                const retained = preview.text.split('\n');
                assert.deepEqual(retained, lines.slice(-retained.length).map(line => line.slice(0, limits.lineChars + 1)));
                assert.ok(preview.text.length <= limits.charLimit);
                assert.equal(preview.sizeBytes, bytes.length);
                assert.equal(state.consumed, bytes.length);
                assert.equal(state.cancelled, false);
                assert.equal(response.body.locked, false);
            }
        }
    }
});

test('an oversized single-line head reaches EOF without claiming a next line', async () => {
    const text = `BEGIN:${'正文😀'.repeat(30_000)}`;
    for (const chunkSize of [127, 8192, 65536]) {
        const { response, state, bytes } = responseFor(text, chunkSize);
        const preview = await read(response);
        assert.equal(preview.text, text.slice(0, limits.lineChars + 1));
        assert.equal(preview.truncated, false);
        assert.equal(preview.sizeBytes, bytes.length);
        assert.equal(state.consumed, bytes.length);
        assert.equal(state.cancelled, false);
    }
});

test('a huge first line followed by a newline establishes a real continuation and stops early', async () => {
    const first = 'x'.repeat(120_000);
    for (const remainder of ['', 'next\n' + 'last\n'.repeat(10_000)]) {
        const { response, state } = responseFor(`${first}\n${remainder}`, 511);
        const preview = await read(response);
        assert.equal(preview.text, `${first.slice(0, limits.lineChars + 1)}\n`);
        assert.equal(preview.truncated, true);
        assert.equal(preview.sizeBytes, null);
        assert.equal(state.cancelled, true);
        if (remainder) assert.ok(state.consumed < new TextEncoder().encode(`${first}\n${remainder}`).length);
    }
});

test('ordinary heads still stop early and retain complete lines before a partial fragment', async () => {
    const text = Array.from({ length: 1000 }, (_, i) => `line ${i}`).join('\n');
    const { response, state, bytes } = responseFor(text, 127, { 'content-length': String(text.length) });
    const preview = await read(response, { lineLimit: 2 });
    assert.equal(preview.truncated, true);
    assert.equal(preview.sizeBytes, bytes.length);
    assert.deepEqual(preview.text.split('\n').slice(0, 2), ['line 0', 'line 1']);
    assert.ok(state.consumed < bytes.length);
    assert.equal(state.cancelled, true);
});

test('empty lines, EOF, CRLF and split UTF-8 bytes preserve the original text in either direction', async () => {
    for (const text of ['', '\n', 'a\n', '中文😀\r\n\r\n末尾', 'a\n\nlast']) {
        for (const tail of [false, true]) {
            const { response, bytes } = responseFor(text, 1);
            const preview = await read(response, { tail });
            assert.equal(preview.text, text);
            assert.equal(preview.truncated, false);
            assert.equal(preview.sizeBytes, bytes.length);
        }
    }
    const empty = await read(new Response(null));
    assert.equal(empty.text, '');
    assert.equal(empty.sizeBytes, 0);
});

test('read, cancellation and current-context failures propagate and release the stream lock', async () => {
    for (const mode of ['read', 'cancel', 'context']) {
        const failure = new Error(mode);
        let current = true;
        const response = new Response(new ReadableStream({
            pull(controller) {
                if (mode === 'read') { controller.error(failure); return; }
                controller.enqueue(new TextEncoder().encode('one\ntwo\n'));
                if (mode === 'context') current = false;
            },
            cancel() { if (mode === 'cancel') throw failure; },
        }, { highWaterMark: 0 }));
        await assert.rejects(read(response, { lineLimit: 1, extraLines: 0,
            assertCurrent() { if (!current) throw failure; } }), error => error === failure);
        assert.equal(response.body.locked, false);
    }
});
