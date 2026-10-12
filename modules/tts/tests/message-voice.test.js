import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';

import {
    enhanceMessageVoiceHtml,
    enhanceMessageVoiceTextNodes,
    hydrateMessageVoiceBubbles,
    releaseMessageVoiceBubbles,
    restoreMessageVoiceBubbles,
    stopMessageVoicePlayback,
} from '../tts-message-voice.js';

test('disabled TTS preserves ordinary chat voice markers', () => {
    const source = 'before [voice:happy:hello] after';
    assert.equal(enhanceMessageVoiceHtml(source, false), source);
});

test('voice aliases and optional emotion project to TTS-owned bubbles', () => {
    const result = enhanceMessageVoiceHtml('[语音:Happy:hello "there"] [voice:plain]', true);
    assert.match(result, /data-text="hello%20%22there%22"/);
    assert.match(result, /data-emotion="happy"/);
    assert.match(result, /data-text="plain" data-emotion=""/);
    assert.match(result, />2"<\/span>/);
});

test('a plain voice marker cannot consume a following emotional voice marker', () => {
    const source = '[voice:first line] [语音:Happy:second line]';
    const { document } = parseHTML(`<div>${enhanceMessageVoiceHtml(source, true)}</div>`);
    const bubbles = [...document.querySelectorAll('[data-xb-tts-message-voice]')];
    assert.deepEqual(bubbles.map(node => ({ text: decodeURIComponent(node.dataset.text), emotion: node.dataset.emotion })), [
        { text: 'first line', emotion: '' }, { text: 'second line', emotion: 'happy' },
    ]);
    restoreMessageVoiceBubbles(document);
    assert.equal(document.querySelector('div').textContent, source);
});

test('voice projection changes visible text without rewriting attributes or code examples', () => {
    const { document } = parseHTML('<div id="message" data-example="[voice:attribute]">before [voice:happy:hello]<code>[voice:hidden]</code></div>');
    const message = document.getElementById('message');

    assert.equal(enhanceMessageVoiceTextNodes(message, true), true);
    assert.equal(message.dataset.example, '[voice:attribute]');
    assert.equal(message.querySelector('code').textContent, '[voice:hidden]');
    assert.equal(message.querySelector('.xb-voice-bubble')?.dataset.text, 'hello');
});

test('hydrated voice bubble sends text and emotion to the TTS playback runtime', () => {
    const { document } = parseHTML(`<div id="message">${enhanceMessageVoiceHtml('[voice:Happy:hello]', true)}</div>`);
    const message = document.getElementById('message');
    const calls = [];

    hydrateMessageVoiceBubbles(message, {
        isEnabled: () => true,
        play(text, emotion, callbacks) {
            calls.push({ text, emotion });
            callbacks.onState('playing');
            return { stop() {} };
        },
    });
    message.querySelector('.xb-voice-bubble').click();

    assert.deepEqual(calls, [{ text: 'hello', emotion: 'happy' }]);
    assert.equal(message.querySelector('.xb-voice-bubble').classList.contains('playing'), true);
    stopMessageVoicePlayback();
});

test('content disposal releases its bubble without stopping another floor or retaining click handlers', () => {
    const { document } = parseHTML(`<div id="one">${enhanceMessageVoiceHtml('[voice:one]', true)}</div><div id="two">${enhanceMessageVoiceHtml('[voice:two]', true)}</div>`);
    const one = document.getElementById('one');
    const two = document.getElementById('two');
    const stopped = [];
    const options = {
        isEnabled: () => true,
        play: text => ({ stop: () => stopped.push(text) }),
    };
    hydrateMessageVoiceBubbles(one, options);
    hydrateMessageVoiceBubbles(two, options);
    const bubble = two.querySelector('[data-xb-tts-message-voice]');
    bubble.click();
    releaseMessageVoiceBubbles(one);
    assert.deepEqual(stopped, []);
    releaseMessageVoiceBubbles(two);
    assert.deepEqual(stopped, ['two']);
    assert.equal(bubble.onclick, null);
    releaseMessageVoiceBubbles(two);
    assert.deepEqual(stopped, ['two']);
});

test('TTS cleanup restores the exact original ordinary chat voice marker', () => {
    const source = '[语音:Happy:hello "there"]';
    const { document } = parseHTML(`<div id="message">${enhanceMessageVoiceHtml(source, true)}</div>`);
    const message = document.getElementById('message');

    restoreMessageVoiceBubbles(message);

    assert.equal(message.textContent, source);
});
