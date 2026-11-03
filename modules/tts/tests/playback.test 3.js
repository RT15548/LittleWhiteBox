import assert from 'node:assert/strict';
import test from 'node:test';
import { TtsPlayer } from '../tts-player.js';
import { createTtsPlaybackOwnership } from '../tts-playback-ownership.js';
import { playTransientVoice, stopTransientVoice } from '../tts-playback-runtime.js';

function media(t) {
    const audios = [];
    const original = Object.getOwnPropertyDescriptor(globalThis, 'Audio');
    class AudioFixture {
        constructor() { this.paused = true; this.duration = 12; this.currentTime = 0; audios.push(this); }
        async play() {
            if (this.blocked) throw new DOMException('gesture required', 'NotAllowedError');
            this.paused = false; this.onplay?.();
        }
        pause() { const playing = !this.paused; this.paused = true; if (playing) this.onpause?.(); }
        end() { this.ended = true; this.onended?.(); }
    }
    Object.defineProperty(globalThis, 'Audio', { value: AudioFixture, configurable: true });
    const ownership = createTtsPlaybackOwnership();
    t.after(() => {
        ownership.dispose();
        if (original) Object.defineProperty(globalThis, 'Audio', original);
        else delete globalThis.Audio;
    });
    return { audios, ownership, player: () => new TtsPlayer({ ownership }) };
}
const item = id => ({ id, audioBlob: new Blob(['sound'], { type: 'audio/mpeg' }) });

test('explicit playback pauses another owner; late queue entries neither interrupt nor silently resume it', t => {
    const { audios, player } = media(t);
    const story = player(); const lesson = player(); const bubble = player();
    story.enqueue(item('story-one')); story.enqueue(item('story-two'));
    lesson.playNow(item('lesson'));
    assert.equal(audios[0].paused, true);
    assert.equal(story.length, 1);
    story.enqueue(item('story-three'));
    bubble.playNow(item('bubble'));
    assert.equal(audios[1].paused, true);
    // A stopped old owner must not release the bubble's ownership.
    lesson.clear();
    const automatic = player(); automatic.enqueue(item('automatic'));
    assert.equal(audios.length, 3);
    bubble.clear();
    story.enqueue(item('story-four'));
    automatic.enqueue(item('another-automatic'));
    assert.equal(audios.length, 3);
    story.resume();
    assert.equal(audios[0].paused, false);
    assert.equal(story.length, 3);
    audios[0].end();
    assert.equal(story.currentItem.id, 'story-two');
    assert.equal(audios.length, 4);
});

test('blocked playback retains the same item and queued continuation for an explicit gesture', async t => {
    const { audios, player } = media(t);
    const lesson = player();
    lesson.playNow(item('first'));
    lesson.pause(); audios[0].blocked = true;
    const events = [];
    lesson.onStateChange = event => events.push(event);
    lesson.enqueue(item('next'));
    lesson.resume();
    await Promise.resolve();
    assert.equal(events.at(-1), 'blocked');
    assert.equal(lesson.currentItem.id, 'first');
    assert.equal(lesson.length, 1);
    audios[0].blocked = false;
    lesson.resume();
    assert.equal(audios.length, 1);
    assert.equal(audios[0].paused, false);
    audios[0].end();
    assert.equal(lesson.currentItem.id, 'next');
});

test('late media callbacks cannot clear or advance a replacement item; disposed players reject late enqueues', t => {
    const { audios, player, ownership } = media(t);
    const lesson = player();
    lesson.playNow(item('old'));
    const stale = { ended: audios[0].onended, error: audios[0].onerror, play: audios[0].onplay };
    lesson.playNow(item('new'));
    stale.ended(); stale.error(); stale.play();
    assert.equal(lesson.currentItem.id, 'new');
    assert.equal(audios[1].paused, false);
    ownership.dispose();
    assert.equal(audios[1].paused, true);
    assert.equal(lesson.enqueue(item('late')), false);
    assert.equal(lesson.resume(), false);
});

test('streaming ownership keeps the paused item and discards callbacks from an aborted stream', t => {
    const { audios, player } = media(t);
    const original = Object.getOwnPropertyDescriptor(globalThis, 'MediaSource');
    const sources = [];
    class Source extends Blob {
        constructor() { super([]); this.events = {}; sources.push(this); }
        static isTypeSupported() { return true; }
        addEventListener(name, fn) { this.events[name] = fn; }
        addSourceBuffer() { return { addEventListener() {}, appendBuffer() {} }; }
    }
    Object.defineProperty(globalThis, 'MediaSource', { configurable: true, value: Source });
    t.after(() => { if (original) Object.defineProperty(globalThis, 'MediaSource', original); else delete globalThis.MediaSource; });
    const lesson = player(); const other = player();
    let aborted = 0; let fail;
    lesson.playNow({ id: 'stream', streamFactory: () => ({ abort() { aborted++; }, start(_append, _end, onError) { fail = onError; } }) });
    sources[0].events.sourceopen();
    other.playNow(item('other'));
    assert.equal(aborted, 0);
    assert.equal(audios[0].paused, true);
    lesson.resume();
    assert.equal(audios.length, 2);
    assert.equal(audios[1].paused, true);
    lesson.playNow(item('replacement'));
    fail(new Error('late failure'));
    assert.equal(aborted, 1);
    assert.equal(lesson.currentItem.id, 'replacement');
});

test('transient bubbles use the host owner even from a separately bundled caller, and cancel late synthesis', async t => {
    const { audios, player, ownership } = media(t);
    const original = Object.getOwnPropertyDescriptor(globalThis, 'window');
    let finish; let signal;
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { xiaobaixTts: {
        isEnabled: () => true,
        acquirePlayback: callback => ownership.register(callback),
        synthesize: (_text, options) => { signal = options.signal; return new Promise(resolve => { finish = resolve; }); },
    } } });
    t.after(() => { stopTransientVoice(); if (original) Object.defineProperty(globalThis, 'window', original); else delete globalThis.window; });
    const story = player(); const lesson = player();
    story.enqueue(item('story'));
    const events = [];
    const bubble = playTransientVoice('hello', '', { onState: event => events.push(event) });
    assert.equal(audios[0].paused, true);
    lesson.playNow(item('lesson'));
    assert.equal(signal.aborted, true);
    finish(new Blob(['late']));
    await Promise.resolve(); await Promise.resolve();
    bubble.stop();
    assert.equal(audios.length, 2);
    assert.equal(audios[1].paused, false);
    assert.equal(events.at(-1), 'stopped');
});
