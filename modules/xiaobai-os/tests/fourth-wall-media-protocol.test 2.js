import assert from 'node:assert/strict';
import test from 'node:test';

import { createFourthWallImageProtocol } from '../apps/fourth-wall/host/image-protocol.js';
import { createFourthWallVoiceProtocol } from '../apps/fourth-wall/host/voice-protocol.js';

test('image protocol reports unavailable capability without invoking generation', async () => {
    const protocol = createFourthWallImageProtocol({
        getFacade: () => ({ getStatus: () => ({ enabled: false, ready: false }) }),
    });

    assert.deepEqual(protocol.getCapabilities(), { available: false });
    assert.deepEqual(await protocol.check({ tags: '1girl, blue hair' }), {
        available: false,
        cached: null,
        tags: '1girl, blue hair',
    });
    await assert.rejects(
        protocol.generate({ requestId: 'image-1', tags: '1girl' }),
        /画图能力不可用/,
    );
});

test('image protocol normalizes cache keys and rejects a late cancelled result', async () => {
    let resolveGeneration;
    let generationOptions;
    const cacheChecks = [];
    const facade = {
        getStatus: () => ({ enabled: true, ready: true }),
        async checkGeneratedImageCache(options) {
            cacheChecks.push(options);
            return 'cached-image';
        },
        generateSharedImage(options) {
            generationOptions = options;
            return new Promise((resolve) => { resolveGeneration = resolve; });
        },
    };
    const protocol = createFourthWallImageProtocol({ getFacade: () => facade });

    assert.deepEqual(await protocol.check({ tags: 'nsfw: 1girl, blue hair, ' }), {
        available: true,
        cached: 'cached-image',
        tags: 'nsfw, 1girl, blue hair',
    });
    assert.deepEqual(cacheChecks, [{ prompt: 'nsfw, 1girl, blue hair', cacheNamespace: 'fourth-wall' }]);

    const pending = protocol.generate({ requestId: 'image-1', tags: '1girl, smile' });
    assert.equal(protocol.cancel('image-1'), true);
    assert.equal(generationOptions.signal.aborted, true);
    resolveGeneration('late-image');
    await assert.rejects(pending, error => error.name === 'AbortError');
    assert.equal(protocol.cancel('image-1'), false);
});

test('voice protocol reports unavailable capability and rejects playback', () => {
    const protocol = createFourthWallVoiceProtocol({ getFacade: () => undefined });

    assert.deepEqual(protocol.getCapabilities(), { available: false });
    assert.throws(
        () => protocol.play({ requestId: 'voice-1', text: 'hello' }),
        /TTS 能力不可用/,
    );
});

test('new voice playback stops the old handle and ignores its stale state', () => {
    const plays = [];
    const stopped = [];
    const states = [];
    const facade = {
        isEnabled: () => true,
        playTransient(text, emotion, options) {
            const record = { text, emotion, options };
            plays.push(record);
            return { stop: () => stopped.push(options.requestId) };
        },
    };
    const protocol = createFourthWallVoiceProtocol({ getFacade: () => facade });

    protocol.play({ requestId: 'voice-1', text: ' first ', emotion: 'happy', onState: state => states.push(state) });
    protocol.play({ requestId: 'voice-2', text: 'second', emotion: '', onState: state => states.push(state) });
    plays[0].options.onState('playing', {});
    plays[1].options.onState('ended', { duration: 123 });

    assert.deepEqual(stopped, ['voice-1']);
    assert.deepEqual(plays.map(item => [item.text, item.emotion]), [['first', 'happy'], ['second', '']]);
    assert.deepEqual(states, [
        { requestId: 'voice-1', state: 'stopped' },
        { requestId: 'voice-2', state: 'ended', duration: 123, message: undefined },
    ]);
    assert.equal(protocol.stop('voice-2'), false);
});

test('a synchronous TTS startup failure does not leave a phantom active request', () => {
    const states = [];
    let attempts = 0;
    const protocol = createFourthWallVoiceProtocol({
        getFacade: () => ({
            isEnabled: () => true,
            playTransient() {
                attempts += 1;
                if (attempts === 1) {
                    throw new Error('startup failed');
                }
                return { stop() {} };
            },
        }),
    });

    assert.throws(
        () => protocol.play({ requestId: 'voice-failed', text: 'first', onState: state => states.push(state) }),
        /startup failed/,
    );
    assert.deepEqual(
        protocol.play({ requestId: 'voice-ok', text: 'second', onState: state => states.push(state) }),
        { started: true, requestId: 'voice-ok' },
    );
    assert.deepEqual(states, []);
});
