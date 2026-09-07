import assert from 'node:assert/strict';
import test from 'node:test';
import { TtsPlayer } from '../../tts/tts-player.js';
import { createTtsPlaybackOwnership } from '../../tts/tts-playback-ownership.js';
import { createTtsExternalSynthesis } from '../../tts/tts-external.js';
import { createLearningMedia } from '../apps/learning/host/media-adapter.js';

// Real TTS/player/learning transport with an Audio boundary fixture; no claim about audio quality.
function harness(t) {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'Audio');
    const audios = []; const calls = []; const events = []; const settings = [];
    const state = { enabled: true, current: true, blocked: false, synthesize: async () => new Blob(['sound']) };
    class AudioFixture {
        constructor() { this.paused = true; this.duration = 12; this.currentTime = 0; audios.push(this); }
        async play() {
            if (state.blocked) throw new DOMException('gesture required', 'NotAllowedError');
            this.paused = false; this.onplay?.();
        }
        pause() { const wasPlaying = !this.paused; this.paused = true; if (wasPlaying) this.onpause?.(); }
        end() { this.ended = true; this.onended?.(); }
    }
    Object.defineProperty(globalThis, 'Audio', { value: AudioFixture, configurable: true });
    const ownership = createTtsPlaybackOwnership();
    const speech = createTtsExternalSynthesis({ isEnabled: () => state.enabled, synthesize: (text, options) => {
        calls.push({ text, options }); return state.synthesize(text, options);
    } });
    const facade = {
        isEnabled: () => state.enabled,
        createPlayer: () => new TtsPlayer({ ownership }),
        getVoices: () => ({ defaultVoice: 'voice', voices: [{ id: 'voice', name: 'Teacher', source: 'free', available: true }] }),
        synthesize: speech.synthesize,
        openSettings() { settings.push(true); },
    };
    const media = createLearningMedia({ getFacade: () => facade, isCurrent: () => state.current, onState: next => events.push(next) });
    const story = facade.createPlayer();
    t.after(() => {
        media.stop(); ownership.dispose(); speech.dispose();
        if (original) Object.defineProperty(globalThis, 'Audio', original); else delete globalThis.Audio;
    });
    return { state, media, audios, calls, events, ownership, speech, story, settings };
}
const request = { key: 'exercise-one', text: 'A real teaching sentence.', voiceId: 'voice', language: 'en', speed: 1 };

test('disabled TTS is explained at the voice action without requests, popups or blocking text reading', async t => {
    const { state, media, calls, events, settings } = harness(t);
    state.enabled = false;
    assert.equal(media.capabilities().enabled, false);
    assert.equal(media.snapshot().status, 'idle');
    assert.equal(events.length, 0);
    await media.play(request);
    assert.equal(calls.length, 0);
    assert.equal(media.snapshot().status, 'unavailable');
    assert.equal(media.snapshot().message, '使用语音前，请先开启 TTS 模块');
    const count = events.length;
    media.capabilities(); media.snapshot();
    assert.equal(events.length, count);
    media.openSettings();
    assert.equal(settings.length, 0);
    assert.match(media.snapshot().message, /小白X.*启用 TTS 语音/);
    state.enabled = true;
    media.openSettings();
    assert.equal(settings.length, 1);
    assert.equal(calls.length, 0);
});

test('lesson speech uses original text, real media timing and local controls without clearing the story queue', async t => {
    const { media, audios, calls, events, story } = harness(t);
    const audioBlob = new Blob(['story']);
    story.enqueue({ id: 'one', audioBlob }); story.enqueue({ id: 'two', audioBlob });
    await media.play(request);
    assert.equal(audios[0].paused, true);
    assert.equal(story.length, 1);
    assert.equal(calls[0].text, request.text);
    assert.equal(calls[0].options.speaker, 'voice');
    assert.equal(calls[0].options.language, 'en');
    assert.equal(media.snapshot().duration, 0);
    audios[1].onloadedmetadata();
    assert.equal(media.snapshot().duration, 12);
    media.pause(); assert.equal(audios[1].paused, true);
    media.resume(); assert.equal(audios[1].paused, false);
    media.setRate(0.75);
    assert.equal(audios[1].playbackRate, 0.75);
    assert.equal(media.seek(5), true);
    assert.equal(media.snapshot().position, 5);
    audios[1].end();
    assert.equal(media.snapshot().status, 'ended');
    media.resume();
    assert.equal(audios[2].paused, false);
    assert.equal(calls.length, 1);
    // Public playback state cannot carry a hidden transcript in DOM-bound data.
    assert.ok(events.every(event => Object.keys(event).every(key => ['status', 'key', 'position', 'duration', 'rate', 'message'].includes(key))));
    media.stop();
    assert.equal(audios[2].paused, true);
    assert.equal(audios[0].paused, true);
    assert.equal(story.length, 1);
});

test('a replacement exercise and a changed classroom both suppress late audio', async t => {
    const { state, media, audios, calls } = harness(t);
    let finish;
    state.synthesize = () => new Promise(resolve => { finish = resolve; });
    const first = media.play(request);
    const completeOld = finish;
    const second = media.play({ ...request, key: 'two', text: '第二道听力题文稿' });
    assert.equal(calls[0].options.signal.aborted, true);
    completeOld(new Blob(['old'])); await first;
    assert.equal(media.snapshot().key, 'two');
    state.current = false;
    finish(new Blob(['new but cancelled'])); await second;
    assert.equal(audios.length, 0);
    assert.equal(media.snapshot().status, 'idle');
});

test('other explicit speech cancels a preparing lesson; disabling TTS also cancels and releases lesson resources', async t => {
    const { state, media, calls, audios, ownership, speech, story } = harness(t);
    let finish;
    state.synthesize = () => new Promise(resolve => { finish = resolve; });
    const loading = media.play(request);
    story.playNow({ id: 'story', audioBlob: new Blob(['story']) });
    assert.equal(calls[0].options.signal.aborted, true);
    finish(new Blob(['late'])); await loading;
    assert.equal(audios.length, 1);
    state.synthesize = async () => new Blob(['lesson']);
    await media.play(request);
    assert.equal(audios.length, 2);
    state.enabled = false; speech.dispose(); ownership.dispose();
    assert.equal(audios[1].paused, true);
    assert.equal(media.snapshot().status, 'idle');
});

test('browser playback rejection retries the existing audio, whereas synthesis errors stay local and safe', async t => {
    const { state, media, calls, audios } = harness(t);
    state.blocked = true;
    await media.play(request);
    assert.equal(media.snapshot().status, 'blocked');
    assert.equal(calls.length, 1);
    state.blocked = false;
    media.resume();
    assert.equal(calls.length, 1);
    assert.equal(audios.length, 1);
    assert.equal(media.snapshot().status, 'playing');
    state.synthesize = async () => { throw new Error('HTTP 400 private vendor diagnostics'); };
    await media.play({ ...request, key: 'failed' });
    assert.equal(media.snapshot().status, 'error');
    assert.equal(media.snapshot().message, '声音生成失败，请重试；不会重新出题或修改作答。');
});
