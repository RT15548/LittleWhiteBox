import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { parseHTML } from 'linkedom';

// Acceptance (leaked Blob URLs / late UI updates): leaving a card cancels its request,
// releases displayed media, and prevents late progress, success or partial results from undoing cleanup.
// Cancelling in a live card must still display paid partial images; restoring a cached page must allow new work.
const docs = parseHTML(readFileSync(new URL('../../../../docs/media-api.html', import.meta.url), 'utf8')).document;

function example(kind) {
    const { document, window } = parseHTML(`<html><body>${docs.querySelector(`#${kind}-example`).textContent}</body></html>`);
    const requests = [];
    const urls = new Set();
    let created = 0;
    const run = (_input, options) => new Promise((resolve, reject) => requests.push({ options, resolve, reject }));
    const form = document.querySelector('form');
    const inputs = Object.fromEntries([...form.querySelectorAll('[name]')].map(input => [input.name, input]));
    Object.defineProperty(form, 'elements', { value: inputs });
    if (kind === 'draw') inputs.prompt.value = 'dynamic prompt';
    else {
        inputs.text.value = 'dynamic speech';
        inputs.speaker.add = option => inputs.speaker.append(option);
        const player = document.querySelector('audio');
        player.pause = () => {};
        player.load = () => {};
    }
    runInNewContext(document.querySelector('script').textContent, {
        document,
        window: {
            addEventListener: window.addEventListener.bind(window),
            parent: {
                xiaobaixDraw: { generate: request => run(request.prompt, request) },
                xiaobaixTts: {
                    getVoices: () => ({ voices: [{ id: 'fixture', name: 'Fixture', available: true }], defaultVoice: 'fixture' }),
                    synthesize: run,
                },
            },
        },
        AbortController,
        Option: function (label, value) {
            const option = document.createElement('option'); option.textContent = label; option.value = value;
            return option;
        },
        URL: {
            createObjectURL() { const url = `blob:fixture-${++created}`; urls.add(url); return url; },
            revokeObjectURL: url => urls.delete(url),
        },
    });
    return {
        document, requests, urls,
        get created() { return created; },
        submit: () => form.onsubmit({ preventDefault() {} }),
        cancel: () => document.querySelector(`#${kind}-cancel`).onclick(),
        hide: () => window.dispatchEvent(new window.Event('pagehide')),
        show: () => window.dispatchEvent(new window.Event('pageshow')),
    };
}

const result = kind => kind === 'draw' ? { images: [new Blob(['image'])] } : new Blob(['audio']);

for (const kind of ['draw', 'tts']) {
    test(`${kind} example: pagehide cleanup survives late progress, success and cancellation results`, async () => {
        for (const outcome of ['partial', 'success']) {
            const card = example(kind);
            const first = card.submit();
            card.requests[0].resolve(result(kind));
            await first;
            assert.equal(card.urls.size, 1);

            const pending = card.submit();
            const request = card.requests[1];
            card.hide();
            assert.equal(request.options.signal.aborted, true);
            assert.equal(card.urls.size, 0);
            const afterCleanup = card.document.body.innerHTML;
            request.options.onProgress({ state: 'receiving', receivedBytes: 100 });
            if (outcome === 'success') request.resolve(result(kind));
            else request.reject(Object.assign(new Error('cancelled'), { code: 'aborted', partialResult: { images: [new Blob(['partial'])] } }));
            await pending;
            assert.equal(card.document.body.innerHTML, afterCleanup);
            assert.equal(card.created, 1);
            assert.equal(card.urls.size, 0);
            card.hide();
            assert.equal(card.urls.size, 0);
        }
    });

    test(`${kind} example: a restored card can submit again without accepting an earlier request`, async () => {
        const card = example(kind);
        const first = card.submit();
        card.hide();
        await card.submit();
        assert.equal(card.requests.length, 1);
        card.show();
        const second = card.submit();
        assert.equal(card.requests.length, 2);
        card.requests[0].resolve(result(kind));
        await first;
        assert.equal(card.created, 0);
        card.cancel();
        assert.equal(card.requests[1].options.signal.aborted, true);
        card.requests[1].resolve(result(kind));
        await second;
        assert.equal(card.created, 1);
        card.hide();
        assert.equal(card.urls.size, 0);
    });
}

test('draw example: cancelling on the active page still shows partial images and releases them on pagehide', async () => {
    const card = example('draw');
    const pending = card.submit();
    card.cancel();
    assert.equal(card.requests[0].options.signal.aborted, true);
    card.requests[0].reject(Object.assign(new Error('cancelled'), {
        code: 'aborted', partialResult: { images: [new Blob(['partial-1']), new Blob(['partial-2'])] },
    }));
    await pending;
    assert.equal(card.document.querySelectorAll('img').length, 2);
    assert.equal(card.urls.size, 2);
    card.hide();
    assert.equal(card.document.querySelectorAll('img').length, 0);
    assert.equal(card.urls.size, 0);
});
