import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync, mkdtempSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { build } from 'esbuild';

function chromiumPath() {
    const candidates = process.platform === 'win32'
        ? [
            join(process.env.ProgramFiles || 'C:/Program Files', 'Google/Chrome/Application/chrome.exe'),
            join(process.env['ProgramFiles(x86)'] || 'C:/Program Files (x86)', 'Microsoft/Edge/Application/msedge.exe'),
        ]
        : ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
    return process.env.LWB_TEST_CHROMIUM || candidates.find(file => existsSync(file));
}

// Chromium's DevTools pipe uses NUL-delimited frames. No HTTP server or browser driver is needed.
async function* devToolsFrames(stream) {
    let data = '';
    for await (const chunk of stream.setEncoding('utf8')) {
        data += chunk;
        for (let end = data.indexOf('\0'); end >= 0; end = data.indexOf('\0')) {
            const frame = data.slice(0, end);
            data = data.slice(end + 1);
            yield JSON.parse(frame);
        }
    }
}

async function checkInBrowser() {
    const { encodeModelImage } = await import('../app-src/runtime/request-images.js');
    const cap = 3.5 * 1024 * 1024;
    const expect = (condition, description) => { if (!condition) throw new Error(description); };
    const bytes = async blob => new Uint8Array(await blob.arrayBuffer());
    const fromUrl = async url => (await fetch(url)).blob();
    const sameBlob = async (actual, expected) => {
        const left = await bytes(actual);
        const right = await bytes(expected);
        expect(actual.type === expected.type && left.length === right.length && left.every((byte, index) => byte === right[index]),
            `${expected.type}: image bytes or MIME type changed`);
    };
    const makeImage = async (width, height, type) => {
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ed391c';
        ctx.fillRect(0, 0, width, height);
        const blob = await canvas.convertToBlob({ type });
        expect(blob.type === type, `Browser could not create ${type} fixture`);
        return blob;
    };
    const inspect = async (source, result, type, width, height, pixelTest) => {
        expect(result.url?.startsWith(`data:${type};base64,`), `${source}: unexpected output MIME type`);
        const output = await fromUrl(result.url);
        expect(output.size > 0 && output.size <= cap, `${source}: encoded blob exceeds the byte cap`);
        const header = await bytes(output.slice(0, 4));
        expect(type === 'image/png' ? header.join() === '137,80,78,71' : header.slice(0, 3).join() === '255,216,255',
            `${source}: output bytes do not match ${type}`);
        const bitmap = await createImageBitmap(output);
        try {
            expect(bitmap.width === width && bitmap.height === height,
                `${source}: expected ${width}×${height}, got ${bitmap.width}×${bitmap.height}`);
            if (pixelTest) {
                const ctx = new OffscreenCanvas(1, 1).getContext('2d');
                ctx.drawImage(bitmap, 0, 0, 1, 1, 0, 0, 1, 1);
                expect(pixelTest(ctx.getImageData(0, 0, 1, 1).data), `${source}: unexpected top-left pixel`);
            }
        } finally {
            bitmap.close();
        }
    };

    for (const type of ['image/png', 'image/jpeg', 'image/webp']) {
        const small = await makeImage(12, 8, type);
        await sameBlob(await fromUrl((await encodeModelImage(small)).url), small);
        const portrait = type === 'image/webp';
        const source = await makeImage(portrait ? 1000 : 2000, portrait ? 2000 : 1000, type);
        const original = new Blob([await source.arrayBuffer()], { type });
        await inspect(type, await encodeModelImage(source), type === 'image/jpeg' ? type : 'image/png',
            portrait ? 784 : 1568, portrait ? 1568 : 784, ([r, g, b, a]) => r > 220 && g < 75 && b < 50 && a === 255);
        await sameBlob(source, original);
        const bitmap = await createImageBitmap(source);
        expect(bitmap.width === (portrait ? 1000 : 2000) && bitmap.height === (portrait ? 2000 : 1000), `${type}: original dimensions changed`);
        bitmap.close();
    }

    // A 2×1 GIF with a red first frame and a blue second frame.
    const gif = await fromUrl('data:image/gif;base64,R0lGODlhAgABAIEAAP8AAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQACgAAACwAAAAAAgABAAAIBQABAAgIACH5BAEKAAEALAAAAAACAAEAgQAA/wAAAAAAAAAAAAgFAAEACAgAOw==');
    const gifBefore = new Blob([await gif.arrayBuffer()], { type: gif.type });
    await inspect('GIF first frame', await encodeModelImage(gif), 'image/png', 2, 1,
        ([r, g, b, a]) => r === 255 && g === 0 && b === 0 && a === 255);
    await sameBlob(gif, gifBefore);

    // Deterministic RGB noise makes PNG larger than the cap without exceeding the dimension limit.
    // Leave the first rows transparent to check the JPEG fallback's white background.
    const canvas = new OffscreenCanvas(1200, 1200);
    const ctx = canvas.getContext('2d');
    const noisy = ctx.createImageData(canvas.width, canvas.height);
    let seed = 0x9e3779b9;
    for (let index = 64 * canvas.width * 4; index < noisy.data.length; index += 4) {
        seed ^= seed << 13;
        seed ^= seed >>> 17;
        seed ^= seed << 5;
        noisy.data[index] = seed & 255;
        noisy.data[index + 1] = (seed >>> 8) & 255;
        noisy.data[index + 2] = (seed >>> 16) & 255;
        noisy.data[index + 3] = 255;
    }
    ctx.putImageData(noisy, 0, 0);
    const overCap = await canvas.convertToBlob({ type: 'image/png' });
    expect(overCap.size > cap, 'PNG fixture must exceed the byte cap');
    await inspect('over-budget PNG', await encodeModelImage(overCap), 'image/jpeg', 1200, 1200,
        ([r, g, b, a]) => r >= 250 && g >= 250 && b >= 250 && a === 255);

    // Pad real canvas output to one byte above the cap to exercise final overflow.
    const convert = OffscreenCanvas.prototype.convertToBlob;
    try {
        OffscreenCanvas.prototype.convertToBlob = async function (options) {
            const blob = await convert.call(this, options);
            return new Blob([blob, new Uint8Array(cap + 1 - blob.size)], { type: blob.type });
        };
        const result = await encodeModelImage(gif);
        expect(result.tooLarge === true && !result.url, 'An over-budget final encoding must not produce an image URL');
    } finally {
        OffscreenCanvas.prototype.convertToBlob = convert;
    }

    await encodeModelImage(new Blob(['invalid PNG'], { type: 'image/png' })).then(
        () => { throw new Error('Corrupt image unexpectedly accepted'); },
        error => expect(error instanceof DOMException, 'Corrupt input should propagate the browser decode failure'),
    );
}

test('model image normalization uses the browser codecs and request-copy limits', { timeout: 30_000 }, async t => {
    const executable = chromiumPath();
    if (!executable) {
        t.skip('Chromium not installed; set LWB_TEST_CHROMIUM to its executable to run codec checks');
        return;
    }
    const { outputFiles: [script] } = await build({
        stdin: { contents: `globalThis.checkInBrowser = ${checkInBrowser.toString()};`, resolveDir: import.meta.dirname },
        bundle: true,
        platform: 'browser',
        write: false,
    });
    const profile = mkdtempSync(join(tmpdir(), 'lwb-model-images-'));
    const browser = spawn(executable, [
        '--headless', '--remote-debugging-pipe', '--disable-background-networking', '--no-first-run',
        `--user-data-dir=${profile}`, ...(process.getuid?.() === 0 ? ['--no-sandbox'] : []), 'about:blank',
    ], { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'] });
    const closed = new Promise(resolve => browser.once('close', resolve));
    t.after(async () => {
        browser.kill();
        await closed;
        await rm(profile, { recursive: true, force: true, maxRetries: 5 });
    });
    await once(browser, 'spawn');
    browser.stdio[3].on('error', error => browser.stdio[4].destroy(error));
    const frames = devToolsFrames(browser.stdio[4]);
    let id = 0;
    const command = async (method, params, sessionId) => {
        browser.stdio[3].write(`${JSON.stringify({ id: ++id, method, params, sessionId })}\0`);
        while (true) {
            const { done, value } = await frames.next();
            assert.ok(!done, `Chromium closed before replying to ${method}`);
            if (value.id !== id) continue;
            assert.equal(value.error, undefined, value.error?.message);
            return value.result;
        }
    };
    const { targetId } = await command('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await command('Target.attachToTarget', { targetId, flatten: true });
    const { exceptionDetails } = await command('Runtime.evaluate', {
        expression: `${script.text}\ncheckInBrowser()`, awaitPromise: true,
    }, sessionId);
    assert.equal(exceptionDetails, undefined, exceptionDetails?.exception?.description ?? exceptionDetails?.text);
});
