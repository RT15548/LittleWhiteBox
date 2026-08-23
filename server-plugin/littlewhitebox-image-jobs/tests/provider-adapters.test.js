'use strict';

const assert = require('node:assert/strict');
const { afterEach, test } = require('node:test');

const comfyui = require('../providers/comfyui/adapter.js');
const sdWebUi = require('../providers/sd-webui/adapter.js');
const { readResponseBuffer } = require('../providers/upstream.js');

const ORIGINAL_FETCH = global.fetch;
const ORIGINAL_DATE_NOW = Date.now;
const PNG = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

afterEach(() => {
    global.fetch = ORIGINAL_FETCH;
    Date.now = ORIGINAL_DATE_NOW;
});

function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

test('SD WebUI strips a data URL prefix and preserves base URL query parameters', async () => {
    let requestedUrl;
    global.fetch = async (url) => {
        requestedUrl = new URL(url);
        return jsonResponse({ images: [`data:image/png;base64,${PNG.toString('base64')}`] });
    };

    const result = await sdWebUi.execute({
        context: { url: 'https://sd.example.test/proxy?token=secret', auth: 'user:pass' },
        item: { request: { payload: { prompt: 'test' } } },
        signal: new AbortController().signal,
    });

    assert.equal(requestedUrl.pathname, '/sdapi/v1/txt2img');
    assert.equal(requestedUrl.searchParams.get('token'), 'secret');
    assert.deepEqual(result, { buffer: PNG, mime: 'image/png' });
});

test('SD WebUI surfaces a non-JSON success response as an adapter failure', async () => {
    global.fetch = async () => new Response('not json');
    await assert.rejects(
        sdWebUi.execute({
            context: { url: 'https://sd.example.test', auth: '' },
            item: { request: { payload: { prompt: 'test' } } },
            signal: new AbortController().signal,
        }),
        SyntaxError,
    );
});

test('SD WebUI aborts only its HTTP request and never sends a global interrupt', async () => {
    const controller = new AbortController();
    const requests = [];
    let markStarted;
    const started = new Promise(resolve => { markStarted = resolve; });
    global.fetch = async (url, options = {}) => {
        const pathname = new URL(url).pathname;
        requests.push(pathname);
        markStarted();
        return await new Promise((resolve, reject) => {
            options.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })), { once: true });
        });
    };

    const pending = sdWebUi.execute({
        context: { url: 'https://sd.example.test', auth: '' },
        item: { request: { payload: { prompt: 'test' } } },
        signal: controller.signal,
    });
    await started;
    controller.abort();

    await assert.rejects(pending, error => error?.name === 'AbortError');
    assert.deepEqual(requests, ['/sdapi/v1/txt2img']);
});

test('ComfyUI preserves proxy base paths and selects only SaveImage output assets', async () => {
    const requested = [];
    const workflow = {
        1: { class_type: 'PreviewImage', inputs: {} },
        9: { class_type: 'SaveImage', inputs: {}, _meta: { title: 'Final output' } },
    };
    global.fetch = async (url) => {
        const parsed = new URL(url);
        requested.push(parsed);
        if (parsed.pathname.endsWith('/prompt')) return jsonResponse({ prompt_id: 'prompt-1' });
        if (parsed.pathname.includes('/history/')) {
            return jsonResponse({
                'prompt-1': {
                    status: { status_str: 'success' },
                    outputs: {
                        1: { images: [{ filename: 'preview.png', subfolder: 'temp', type: 'temp' }] },
                        9: { images: [{ filename: 'final.png', subfolder: 'images', type: 'output' }] },
                    },
                },
            });
        }
        if (parsed.pathname.endsWith('/view')) return new Response(PNG);
        throw new Error(`Unexpected ComfyUI request: ${parsed}`);
    };

    const normalized = comfyui.normalize(
        { url: 'https://comfy.example.test/base?token=secret' },
        [{ request: { workflow }, timeout: 1000 }],
        { parseTimeout: Number, parseUrl: String },
    );
    const result = await comfyui.execute({
        context: normalized.context,
        item: normalized.items[0],
        signal: new AbortController().signal,
    });
    const viewUrl = requested.find(url => url.pathname.endsWith('/view'));

    assert.deepEqual(requested.map(url => url.pathname), ['/base/prompt', '/base/history/prompt-1', '/base/view']);
    assert.equal(viewUrl.searchParams.get('token'), 'secret');
    assert.equal(viewUrl.searchParams.get('filename'), 'final.png');
    assert.equal(viewUrl.searchParams.get('subfolder'), 'images');
    assert.equal(viewUrl.searchParams.get('type'), 'output');
    assert.deepEqual(result, { buffer: PNG, mime: 'image/png' });
});

test('ComfyUI reports execution_error details', async () => {
    global.fetch = async (url) => {
        const pathname = new URL(url).pathname;
        if (pathname === '/prompt') return jsonResponse({ prompt_id: 'prompt-1' });
        return jsonResponse({
            'prompt-1': {
                status: {
                    status_str: 'error',
                    messages: [['execution_error', {
                        node_type: 'KSampler', node_id: '3', exception_type: 'RuntimeError', exception_message: 'CUDA failed',
                    }]],
                },
            },
        });
    };

    await assert.rejects(
        comfyui.execute({
            context: { url: 'https://comfy.example.test', auth: '' },
            item: { request: { workflow: { 9: { class_type: 'SaveImage' } }, preferredSaveImageNodeId: '' } },
            signal: new AbortController().signal,
        }),
        /KSampler \[3\] RuntimeError: CUDA failed/,
    );
});

test('ComfyUI reports a successful history entry that never exposes a SaveImage result', async () => {
    Date.now = (() => {
        let now = 0;
        return () => { now += 16_000; return now; };
    })();
    global.fetch = async (url) => {
        const pathname = new URL(url).pathname;
        if (pathname === '/prompt') return jsonResponse({ prompt_id: 'prompt-1' });
        return jsonResponse({
            'prompt-1': {
                status: { status_str: 'success' },
                outputs: { 1: { images: [{ filename: 'preview.png', type: 'temp' }] } },
            },
        });
    };

    await assert.rejects(
        comfyui.execute({
            context: { url: 'https://comfy.example.test', auth: '' },
            item: { request: { workflow: { 9: { class_type: 'SaveImage' } }, preferredSaveImageNodeId: '' } },
            signal: new AbortController().signal,
        }),
        /output directory/,
    );
});

test('ComfyUI deletes only its own queued prompt when execution is aborted', async () => {
    const controller = new AbortController();
    const requests = [];
    let markStarted;
    const started = new Promise(resolve => { markStarted = resolve; });
    global.fetch = async (url, options = {}) => {
        const pathname = new URL(url).pathname;
        requests.push(pathname);
        if (pathname === '/prompt') return jsonResponse({ prompt_id: 'prompt-1' });
        if (pathname === '/queue') return jsonResponse({});
        markStarted();
        return await new Promise((resolve, reject) => {
            options.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })), { once: true });
        });
    };

    const pending = comfyui.execute({
        context: { url: 'https://comfy.example.test', auth: '' },
        item: { request: { workflow: { 9: { class_type: 'SaveImage' } }, preferredSaveImageNodeId: '' } },
        signal: controller.signal,
    });
    await started;
    controller.abort();

    await assert.rejects(pending, error => error?.name === 'AbortError');
    assert.deepEqual(requests, ['/prompt', '/history/prompt-1', '/queue']);
});

test('bounded response reads cancel a chunked body before buffering past the limit', async () => {
    let cancelled = false;
    const body = new ReadableStream({
        start(controller) {
            controller.enqueue(Uint8Array.from([1, 2]));
            controller.enqueue(Uint8Array.from([3, 4]));
        },
        cancel() { cancelled = true; },
    });

    await assert.rejects(readResponseBuffer(new Response(body), 3), /exceeds the 3 byte limit/);
    assert.equal(cancelled, true);
});

test('bounded response reads reject an oversized declared content length before streaming', async () => {
    const body = new ReadableStream({
        start(controller) { controller.enqueue(Uint8Array.from([1])); controller.close(); },
    });
    const response = new Response(body, { headers: { 'Content-Length': '4096' } });

    // 正文只有 1 字节，仍然被拒说明拒绝来自 content-length 预检而不是流式累计。
    await assert.rejects(readResponseBuffer(response, 8), /exceeds the 8 byte limit/);
});

test('SD WebUI omits the Authorization header when no credentials are configured', async () => {
    const seen = [];
    global.fetch = async (url, options = {}) => {
        seen.push(options.headers);
        return jsonResponse({ images: [PNG.toString('base64')] });
    };

    await sdWebUi.execute({
        context: { url: 'https://sd.example.test', auth: '' },
        item: { request: { payload: { prompt: 'test' } } },
        signal: new AbortController().signal,
    });
    await sdWebUi.execute({
        context: { url: 'https://sd.example.test', auth: 'user:pass' },
        item: { request: { payload: { prompt: 'test' } } },
        signal: new AbortController().signal,
    });

    assert.equal(seen[0].Authorization, undefined);
    assert.equal(seen[1].Authorization, `Basic ${Buffer.from('user:pass').toString('base64')}`);
});

test('ComfyUI preserves a reverse proxy base path without any opt-in flag', async () => {
    const requested = [];
    global.fetch = async (url) => {
        const parsed = new URL(url);
        requested.push(parsed.pathname);
        if (parsed.pathname.endsWith('/prompt')) return jsonResponse({ prompt_id: 'p1' });
        if (parsed.pathname.includes('/history/')) {
            return jsonResponse({
                p1: { status: { status_str: 'success' }, outputs: { 9: { images: [{ filename: 'a.png', type: 'output' }] } } },
            });
        }
        return new Response(PNG);
    };

    const normalized = comfyui.normalize(
        { url: 'https://comfy.example.test/behind/proxy/' },
        [{ request: { workflow: { 9: { class_type: 'SaveImage' } } }, timeout: 1000 }],
        { parseTimeout: Number, parseUrl: String },
    );
    // context 里不再有 appendPath 这一维状态：Comfy 只有"保留基础路径"一种正确行为。
    assert.deepEqual(Object.keys(normalized.context).sort(), ['auth', 'url']);
    await comfyui.execute({
        context: normalized.context,
        item: normalized.items[0],
        signal: new AbortController().signal,
    });

    assert.deepEqual(requested, ['/behind/proxy/prompt', '/behind/proxy/history/p1', '/behind/proxy/view']);
});

test('ComfyUI normalize rejects workflows without a SaveImage node or with a mismatched preferred node', async () => {
    const options = { parseTimeout: Number, parseUrl: String };
    const context = { url: 'https://comfy.example.test' };

    const missing = comfyui.normalize(
        context,
        [{ request: { workflow: { 1: { class_type: 'PreviewImage' } } }, timeout: 1000 }],
        options,
    );
    assert.match(missing.error, /must contain a SaveImage node/);

    const mismatched = comfyui.normalize(
        context,
        [{ request: { workflow: { 9: { class_type: 'SaveImage' } }, preferredSaveImageNodeId: '1' }, timeout: 1000 }],
        options,
    );
    assert.match(mismatched.error, /must identify a SaveImage node/);

    const accepted = comfyui.normalize(
        context,
        [{ request: { workflow: { 9: { class_type: 'SaveImage' } }, preferredSaveImageNodeId: '9' }, timeout: 1000 }],
        options,
    );
    assert.equal(accepted.error, undefined);
    assert.equal(accepted.items[0].request.preferredSaveImageNodeId, '9');
});

test('ComfyUI prefers the explicitly selected SaveImage node over the highest scoring title', async () => {
    const workflow = {
        3: { class_type: 'SaveImage', _meta: { title: 'Final output' } },
        7: { class_type: 'SaveImage', _meta: { title: 'Draft' } },
    };
    global.fetch = async (url) => {
        const pathname = new URL(url).pathname;
        if (pathname === '/prompt') return jsonResponse({ prompt_id: 'prompt-1' });
        if (pathname.includes('/history/')) {
            return jsonResponse({
                'prompt-1': {
                    status: { status_str: 'success' },
                    outputs: {
                        3: { images: [{ filename: 'scored.png', type: 'output' }] },
                        7: { images: [{ filename: 'preferred.png', type: 'output' }] },
                    },
                },
            });
        }
        return new Response(PNG);
    };

    const capture = async (preferredSaveImageNodeId) => {
        let viewUrl;
        const originalFetch = global.fetch;
        global.fetch = async (url, options) => {
            const parsed = new URL(url);
            if (parsed.pathname === '/view') viewUrl = parsed;
            return originalFetch(url, options);
        };
        await comfyui.execute({
            context: { url: 'https://comfy.example.test', auth: '' },
            item: { request: { workflow, preferredSaveImageNodeId } },
            signal: new AbortController().signal,
        });
        global.fetch = originalFetch;
        return viewUrl.searchParams.get('filename');
    };

    assert.equal(await capture('7'), 'preferred.png');
    assert.equal(await capture(''), 'scored.png');
});

test('ComfyUI treats legacy history entries without a status field as finished', async () => {
    Date.now = (() => {
        let now = 0;
        return () => { now += 16_000; return now; };
    })();
    global.fetch = async (url) => {
        const pathname = new URL(url).pathname;
        if (pathname === '/prompt') return jsonResponse({ prompt_id: 'prompt-1' });
        return jsonResponse({ 'prompt-1': { outputs: {} } });
    };

    await assert.rejects(
        comfyui.execute({
            context: { url: 'https://comfy.example.test', auth: '' },
            item: { request: { workflow: { 9: { class_type: 'SaveImage' } }, preferredSaveImageNodeId: '' } },
            signal: new AbortController().signal,
        }),
        /output directory/,
    );
});

test('ComfyUI treats a completed history entry without status_str as finished', async () => {
    Date.now = (() => {
        let now = 0;
        return () => { now += 16_000; return now; };
    })();
    global.fetch = async (url) => {
        const pathname = new URL(url).pathname;
        if (pathname === '/prompt') return jsonResponse({ prompt_id: 'prompt-1' });
        return jsonResponse({ 'prompt-1': { status: { completed: true }, outputs: {} } });
    };

    await assert.rejects(
        comfyui.execute({
            context: { url: 'https://comfy.example.test', auth: '' },
            item: { request: { workflow: { 9: { class_type: 'SaveImage' } }, preferredSaveImageNodeId: '' } },
            signal: new AbortController().signal,
        }),
        /output directory/,
    );
});

test('NovelAI adapter validates the per-item transport and tags stream results with the agreed MIME type', async () => {
    const novelai = require('../providers/novelai/adapter.js');
    const options = { parseTimeout: Number, parseUrl: String };
    const url = 'https://api.novelai.test/ai/generate-image-stream';

    assert.match(novelai.normalize({ key: 'k' }, [{ request: { transport: 'carrier-pigeon', url, payload: {} }, timeout: 1000 }], options).error, /transport is invalid/);
    assert.match(novelai.normalize({}, [{ request: { transport: 'legacy-image', url, payload: {} }, timeout: 1000 }], options).error, /API key is required/);

    const normalized = novelai.normalize(
        { key: 'k', insecure: true },
        [
            { request: { transport: 'msgpack-stream', url, payload: { model: 'nai-diffusion-5-full' } }, timeout: 1000 },
            { request: { transport: 'legacy-image', url, payload: { model: 'nai-diffusion-4-full' } }, timeout: 1000 },
        ],
        options,
    );
    assert.equal(normalized.error, undefined);
    assert.deepEqual(normalized.context, { key: 'k', insecure: true });
    assert.deepEqual(normalized.items.map(item => item.kind), ['msgpack-stream', 'legacy-image']);

    const clientPath = require.resolve('../providers/novelai/client.js');
    const client = require(clientPath);
    const originalStream = client.readImageStreamBuffer;
    const originalGenerate = client.generateImageBuffer;
    client.readImageStreamBuffer = async () => ({ ok: true, buffer: PNG, mime: 'application/octet-stream' });
    client.generateImageBuffer = async () => ({ ok: true, buffer: PNG, mime: 'image/png' });
    delete require.cache[require.resolve('../providers/novelai/adapter.js')];
    const reloaded = require('../providers/novelai/adapter.js');
    try {
        const streamed = await reloaded.execute({
            context: normalized.context,
            item: normalized.items[0],
            signal: new AbortController().signal,
        });
        const legacy = await reloaded.execute({
            context: normalized.context,
            item: normalized.items[1],
            signal: new AbortController().signal,
        });
        // V5 流式结果必须带小白盒专属 MIME，前端据此判断要走 msgpack 解码。
        assert.equal(streamed.mime, 'application/vnd.littlewhitebox.novelai-msgpack');
        assert.equal(legacy.mime, 'image/png');
    } finally {
        client.readImageStreamBuffer = originalStream;
        client.generateImageBuffer = originalGenerate;
        delete require.cache[require.resolve('../providers/novelai/adapter.js')];
    }
});

test('NovelAI adapter converts an upstream failure into a coded adapter error', async () => {
    const clientPath = require.resolve('../providers/novelai/client.js');
    const client = require(clientPath);
    const original = client.generateImageBuffer;
    client.generateImageBuffer = async () => ({ ok: false, status: 429, error: 'rate limited' });
    delete require.cache[require.resolve('../providers/novelai/adapter.js')];
    const reloaded = require('../providers/novelai/adapter.js');
    try {
        await assert.rejects(
            reloaded.execute({
                context: { key: 'k', insecure: false },
                item: { request: { transport: 'legacy-image', url: 'https://api.novelai.test/ai/generate-image', payload: {} } },
                signal: new AbortController().signal,
            }),
            error => error.code === 'upstream_error' && error.status === 429 && /rate limited/.test(error.message),
        );
    } finally {
        client.generateImageBuffer = original;
        delete require.cache[require.resolve('../providers/novelai/adapter.js')];
    }
});
