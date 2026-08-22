import assert from 'node:assert/strict';
import test from 'node:test';

import {
    buildNovelAIConnectionProbe,
    resolveNovelAIBackendImageApi,
    resolveNovelAIImageApi,
    snapshotNovelRequestConfig,
} from '../novel-request-config.js';

test('freezes request settings when a generation is submitted', () => {
    const settings = {
        apiBaseUrl: 'https://first.example',
        apiKey: 'first-key',
        sendMode: 'backend',
        insecureTLS: true,
        timeout: 120000,
        overrideSize: '832x1216',
    };
    const snapshot = snapshotNovelRequestConfig(settings, {}, 60000);

    settings.apiBaseUrl = 'https://second.example';
    settings.apiKey = 'second-key';
    settings.sendMode = 'frontend';
    settings.insecureTLS = false;
    settings.timeout = 5000;

    assert.deepEqual(snapshot, {
        apiBaseUrl: 'https://first.example',
        apiKey: 'first-key',
        sendMode: 'backend',
        insecureTLS: true,
        timeout: 120000,
        overrideSize: '832x1216',
    });
    assert.equal(Object.isFrozen(snapshot), true);
});

test('uses the request override and default timeout at submission time', () => {
    const snapshot = snapshotNovelRequestConfig(
        { apiKey: ' key ', timeout: 0, overrideSize: 'default' },
        { overrideSize: '1024x1024' },
        60000,
    );

    assert.equal(snapshot.apiKey, 'key');
    assert.equal(snapshot.timeout, 60000);
    assert.equal(snapshot.overrideSize, '1024x1024');
});

test('resolves legacy and V5 endpoints from an origin or either explicit image endpoint', () => {
    for (const baseUrl of [
        'https://image.novelai.net',
        'https://image.novelai.net/ai/generate-image',
        'https://image.novelai.net/ai/generate-image-stream',
    ]) {
        assert.equal(
            resolveNovelAIImageApi(baseUrl, 'image'),
            'https://image.novelai.net/ai/generate-image',
        );
        assert.equal(
            resolveNovelAIImageApi(baseUrl, 'msgpack-stream'),
            'https://image.novelai.net/ai/generate-image-stream',
        );
    }

    assert.equal(
        resolveNovelAIImageApi('https://proxy.example/base/ai/generate-image?token=abc', 'msgpack-stream'),
        'https://proxy.example/base/ai/generate-image-stream?token=abc',
    );
    assert.equal(
        resolveNovelAIImageApi('https://proxy.example/base?token=abc', 'image'),
        'https://proxy.example/base/ai/generate-image?token=abc',
    );
    assert.equal(
        resolveNovelAIImageApi('/proxy/novelai', 'image'),
        '/proxy/novelai/ai/generate-image',
    );
    assert.equal(
        resolveNovelAIImageApi('/proxy/novelai/ai/generate-image?token=abc', 'msgpack-stream'),
        '/proxy/novelai/ai/generate-image-stream?token=abc',
    );
});

test('resolves relative endpoints to an absolute URL before backend transport', () => {
    assert.equal(
        resolveNovelAIBackendImageApi('/proxy/novelai', 'msgpack-stream', 'https://tavern.example/chat/1'),
        'https://tavern.example/proxy/novelai/ai/generate-image-stream',
    );
    assert.throws(
        () => resolveNovelAIBackendImageApi('/proxy/novelai', 'image'),
        /完整 HTTP\(S\)/,
    );
});

test('builds connection probes on the frontend for each selected transport', () => {
    const legacy = buildNovelAIConnectionProbe('https://proxy.example', 'nai-diffusion-4-5-full');
    assert.equal(legacy.url, 'https://proxy.example/ai/generate-image');
    assert.equal(legacy.multipart, false);
    assert.equal(legacy.payload.model, 'nai-diffusion-3');

    const v5 = buildNovelAIConnectionProbe(
        'https://proxy.example/ai/generate-image',
        'nai-diffusion-5-curated',
    );
    assert.equal(v5.url, 'https://proxy.example/ai/generate-image-stream');
    assert.equal(v5.multipart, true);
    assert.equal(v5.payload.model, 'nai-diffusion-5-curated');
    assert.equal(v5.payload.parameters.params_version, 4);
    assert.equal(v5.payload.parameters.straight_alpha, true);
});
