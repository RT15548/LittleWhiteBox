import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { prepareTtsRequest } from '../tts-request.js';
import { buildTtsV3Body } from '../tts-request-body.js';
import { synthesizeV3 } from '../tts-api.js';
import { createTtsExternalSynthesis } from '../tts-external.js';

// Contracts: all explicit options reach the wire without changing defaults (wrong paid synthesis);
// MIME matches selected format (unplayable audio); unknown fields never submit; disable cancels (unwanted charge).
const config = () => ({ volc: { appId: 'app', accessKey: 'key', defaultSpeaker: 'auth-voice', speechRate: 1.5,
    disableMarkdownFilter: true, postProcessPitch: 8, emotionScale: 5, explicitLanguage: 'en', serverCacheEnabled: true } });
test('all auth options survive preparation and wire serialization, including false/zero/empty', () => {
    const saved = config(); const before = structuredClone(saved);
    const options = { speaker: 'other', resourceId: 'seed-tts-2.0', uid: 'caller', model: 'custom', format: 'wav', sampleRate: 16000,
        speechRate: 0, loudnessRate: 0, emotion: 'happy', emotionScale: 0, contextTexts: ['context'], explicitLanguage: '',
        disableMarkdownFilter: false, disableEmojiFilter: false, enableLanguageDetector: false,
        maxLengthToFilterParenthesis: 0, postProcessPitch: 0, cacheConfig: { text_type: 1, use_cache: false } };
    const params = prepareTtsRequest(saved, 'text', options);
    options.contextTexts.push('mutated');
    const body = buildTtsV3Body(params);
    assert.equal(body.user.uid, 'caller');
    assert.equal(body.req_params.model, 'custom');
    assert.deepEqual(body.req_params.audio_params, { format: 'wav', sample_rate: 16000, speech_rate: 0, loudness_rate: 0, emotion: 'happy', emotion_scale: 0 });
    assert.deepEqual(JSON.parse(body.req_params.additions), { context_texts: ['context'], explicit_language: '',
        disable_markdown_filter: false, disable_emoji_filter: false, enable_language_detector: false,
        max_length_to_filter_parenthesis: 0, post_process: { pitch: 0 }, cache_config: { text_type: 1, use_cache: false } });
    assert.deepEqual(saved, before);
});
test('unsupported free options and unknown auth fields fail instead of being ignored', () => {
    assert.throws(() => prepareTtsRequest(config(), 'x', { unknown: 1 }), { code: 'unsupported_field' });
    assert.throws(() => prepareTtsRequest(config(), 'x', { speaker: 'female_1', language: 'en' }), { code: 'unsupported_field' });
    assert.throws(() => prepareTtsRequest(config(), 'x', { speed: 1, speechRate: 0 }), { code: 'invalid_request' });
});

// Cache identity must track the effective wire payload (invisible wrong voice/content reuse).
test('every effective synthesis field participates in the local cache identity', () => {
    const source = readFileSync(new URL('../tts.js', import.meta.url), 'utf8');
    const start = source.indexOf('function buildCacheKey(');
    const end = source.indexOf('\nasync function getCacheStatsSafe', start);
    const key = runInNewContext(`(${source.slice(start, end)})`, { buildTtsV3Body, hashString: value => value });
    const params = prepareTtsRequest(config(), 'text', { emotion: 'happy' });
    const changes = { text: 'other', speaker: 'other', resourceId: 'seed-tts-2.0', uid: 'other', model: 'other',
        format: 'wav', sampleRate: 16000, speechRate: 0, loudnessRate: 1, emotion: '', emotionScale: 0,
        contextTexts: ['context'], explicitLanguage: '', disableMarkdownFilter: false, disableEmojiFilter: false,
        enableLanguageDetector: false, maxLengthToFilterParenthesis: 0, postProcessPitch: 0,
        cacheConfig: { use_cache: false }, appId: 'other' };
    for (const [field, value] of Object.entries(changes)) assert.notEqual(key({ ...params, [field]: value }), key(params), field);
});
test('downloaded audio has its requested MIME and provider errors cannot be reported as success', async t => {
    const original = globalThis.fetch;
    t.after(() => { globalThis.fetch = original; });
    globalThis.fetch = async () => new Response(JSON.stringify({ code: 20000000, data: btoa('audio') }) + '\n');
    const result = await synthesizeV3(prepareTtsRequest(config(), 'x', { format: 'wav' }));
    assert.equal(result.audioBlob.type, 'audio/wav');
    globalThis.fetch = async () => new Response(JSON.stringify({ code: 20000000, data: btoa('partial') }) + '\n' + JSON.stringify({ code: 45000000, message: 'provider failed' }));
    await assert.rejects(synthesizeV3(prepareTtsRequest(config(), 'x')), { code: 'provider_error' });
});
// A clean HTTP EOF without the provider's completion record must not become cached audio (invisible truncated result).
test('only completed audio is returned and cached, including completion without usage', async t => {
    const original = globalThis.fetch;
    t.after(() => { globalThis.fetch = original; });
    const source = readFileSync(new URL('../tts.js', import.meta.url), 'utf8');
    const start = source.indexOf('async function synthesizeAuthBlob(');
    const end = source.indexOf('\nexport function cleanupTts', start);
    let writes = 0;
    let calls = 0;
    let complete = false;
    const synthesize = runInNewContext(`(${source.slice(start, end)})`, {
        synthesizeV3, buildV3Headers: () => ({}), tryLoadLocalCache: async () => null,
        buildCacheKey: () => 'fixture', reportCacheWriteFailure: assert.fail,
        storeLocalCache: async () => { writes++; },
    });
    globalThis.fetch = async () => {
        calls++;
        const lines = [JSON.stringify({ code: 0, data: btoa('audio') })];
        if (complete) lines.push(JSON.stringify({ code: 20000000 }));
        // No trailing newline: completion still has to be consumed.
        return new Response(lines.join('\n'));
    };
    const states = [];
    const params = { ...prepareTtsRequest(config(), 'text'), onProgress: event => states.push(event.state) };
    await assert.rejects(synthesize(params, config()), { code: 'invalid_result' });
    assert.equal(writes, 0);
    assert.equal(states.includes('complete'), false);
    assert.equal(calls, 1);
    complete = true;
    const audio = await synthesize(params, config());
    assert.equal(await audio.text(), 'audio');
    assert.equal(writes, 1);
    assert.equal(states.at(-1), 'complete');
    assert.equal(calls, 2);
});

test('disposal cancels only owned synthesis and never starts another request', async () => {
    let calls = 0;
    const api = createTtsExternalSynthesis({ isEnabled: () => true, synthesize: (_text, { signal }) => new Promise((_resolve, reject) => {
        calls++; signal.addEventListener('abort', () => reject(new DOMException('cancelled', 'AbortError')), { once: true });
    }) });
    const pending = api.synthesize('x'); api.dispose();
    await assert.rejects(pending, { code: 'aborted' });
    await assert.rejects(api.synthesize('x'), { code: 'disabled' });
    assert.equal(calls, 1);
});
