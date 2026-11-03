import assert from 'node:assert/strict';
import test from 'node:test';
import { createTtsExternalSynthesis, readTtsVoices, ttsRequestSettings } from '../tts-external.js';
import { synthesizeV3 } from '../tts-api.js';

test('voice choices expose only public fields; per-request language and speed do not change global defaults', () => {
    const config = { volc: { appId: 'secret-id', accessKey: 'secret-key', defaultSpeaker: 'custom',
        speechRate: 1.2, explicitLanguage: 'zh-cn', mySpeakers: [{ value: 'custom', name: '老师', accessKey: 'private' }] } };
    const original = structuredClone(config);
    const choices = readTtsVoices(config);
    assert.ok(choices.voices.some(voice => voice.id === 'en_female_1' && voice.available));
    assert.ok(choices.voices.some(voice => voice.id === 'ja_female_1' && voice.available));
    assert.deepEqual(choices.voices.find(voice => voice.id === 'custom'), { id: 'custom', name: '老师', source: 'auth', available: true });
    assert.deepEqual(ttsRequestSettings(config, { speed: 0.8, language: 'en' }), { speed: 0.8, language: 'en' });
    assert.deepEqual(ttsRequestSettings(config, {}), { speed: 1.2, language: 'zh-cn' });
    assert.deepEqual(ttsRequestSettings(config, { language: '' }), { speed: 1.2, language: '' });
    assert.deepEqual(config, original);
    for (const speed of [NaN, Infinity, -1, 0, 2.1]) assert.throws(() => ttsRequestSettings(config, { speed }));
    config.volc.accessKey = '';
    assert.equal(readTtsVoices(config).voices.find(voice => voice.id === 'custom').available, false);
});

test('external synthesis honors caller cancellation, module shutdown and late cache resolution', async () => {
    const pending = [];
    const api = createTtsExternalSynthesis({ isEnabled: () => true,
        synthesize: (_text, options) => new Promise(resolve => pending.push({ resolve, signal: options.signal })) });
    const controller = new AbortController();
    const cancelled = api.synthesize('one', { signal: controller.signal });
    const shutdown = api.synthesize('two');
    controller.abort();
    assert.equal(pending[0].signal.aborted, true);
    assert.equal(pending[1].signal.aborted, false);
    api.dispose();
    assert.equal(pending[1].signal.aborted, true);
    const checks = [assert.rejects(cancelled, { name: 'AbortError' }), assert.rejects(shutdown, { name: 'AbortError' })];
    for (const request of pending) request.resolve(new Blob(['cached']));
    await Promise.all(checks);
    await assert.rejects(api.synthesize('three'));
    assert.equal(pending.length, 2);
});

test('V3 complete download sends request overrides and cancellation through fetch and releases its reader', async t => {
    const original = globalThis.fetch;
    t.after(() => { globalThis.fetch = original; });
    const controller = new AbortController();
    const params = { appId: 'id', accessKey: 'key', text: 'Hello', speaker: 'speaker', speechRate: -20,
        explicitLanguage: 'en', signal: controller.signal };
    const body = new Response('{"data":"b25l"}\n{"data":"dHdv","code":20000000,"usage":{"text_words":1}}').body;
    globalThis.fetch = async (url, options) => {
        assert.match(url, /^\/proxy\//);
        assert.equal(options.signal, controller.signal);
        const request = JSON.parse(options.body).req_params;
        assert.equal(request.audio_params.speech_rate, -20);
        assert.equal(JSON.parse(request.additions).explicit_language, 'en');
        return new Response(body);
    };
    const result = await synthesizeV3(params);
    assert.equal(await result.audioBlob.text(), 'onetwo');
    assert.deepEqual(result.usage, { text_words: 1 });
    assert.equal(body.locked, false);
    let requestStarted;
    const started = new Promise(resolve => { requestStarted = resolve; });
    globalThis.fetch = async (_url, options) => {
        requestStarted();
        return new Response(new ReadableStream({ start(stream) {
            options.signal.addEventListener('abort', () => stream.error(new DOMException('cancelled', 'AbortError')), { once: true });
        } }));
    };
    const download = synthesizeV3(params);
    const check = assert.rejects(download, { name: 'AbortError' });
    await started;
    controller.abort();
    await check;
});
