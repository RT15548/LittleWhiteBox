import assert from 'node:assert/strict';
import test from 'node:test';

import { createFourthWallCommentaryRuntime } from '../apps/fourth-wall/host/commentary-runtime.js';

function immediateTimer(callback) {
    queueMicrotask(callback);
    return 1;
}

test('commentary accepts an event once per cooldown period', async () => {
    let currentTime = 200000;
    const committed = [];
    const shown = [];
    const runtime = createFourthWallCommentaryRuntime({
        getSettings: () => ({ enabled: true, probability: 30 }),
        capture: event => ({ event }),
        generate: async () => ' a comment ',
        commit: async (_captured, text) => committed.push(text),
        show: text => shown.push(text),
        random: () => 0,
        now: () => currentTime,
        setTimer: immediateTimer,
        clearTimer: () => {},
        cooldownMs: 180000,
    });

    assert.equal(await runtime.handleEvent({ kind: 'ai_message' }), true);
    currentTime += 1000;
    assert.equal(await runtime.handleEvent({ kind: 'ai_message' }), false);
    currentTime += 180000;
    assert.equal(await runtime.handleEvent({ kind: 'ai_message' }), true);
    assert.deepEqual(committed, ['a comment', 'a comment']);
    assert.deepEqual(shown, ['a comment', 'a comment']);
});

test('commentary rejects the exact upper probability boundary', async () => {
    let captures = 0;
    const runtime = createFourthWallCommentaryRuntime({
        getSettings: () => ({ enabled: true, probability: 30 }),
        capture: () => { captures += 1; return {}; },
        generate: async () => 'comment',
        commit: async () => {},
        random: () => 0.3,
        now: () => 200000,
        setTimer: immediateTimer,
        clearTimer: () => {},
    });

    assert.equal(await runtime.handleEvent({ kind: 'ai_message' }), false);
    assert.equal(captures, 0);
});

test('cancelling a commentary task discards a late model result', async () => {
    let resolveGeneration;
    let generationStarted = false;
    let commits = 0;
    let hides = 0;
    const runtime = createFourthWallCommentaryRuntime({
        getSettings: () => ({ enabled: true, probability: 99 }),
        capture: () => ({ chatIdentity: 'chat:a' }),
        generate: async () => {
            generationStarted = true;
            return await new Promise((resolve) => { resolveGeneration = resolve; });
        },
        commit: async () => { commits += 1; },
        hide: () => { hides += 1; },
        random: () => 0,
        now: () => 200000,
        setTimer: immediateTimer,
        clearTimer: () => {},
    });

    const pending = runtime.handleEvent({ kind: 'ai_message' });
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(generationStarted, true);
    assert.equal(runtime.cancel(), true);
    resolveGeneration('late comment');

    assert.equal(await pending, false);
    assert.equal(commits, 0);
    assert.equal(hides, 1);
});

test('cancelling while asynchronous capture prepares data prevents generation', async () => {
    let finishCapture;
    let generations = 0;
    const runtime = createFourthWallCommentaryRuntime({
        getSettings: () => ({ enabled: true, probability: 99 }),
        capture: () => new Promise(resolve => { finishCapture = resolve; }),
        generate: async () => { generations += 1; return 'must not run'; },
        commit: async () => {},
        random: () => 0,
        now: () => 200000,
        setTimer: immediateTimer,
        clearTimer: () => {},
    });

    const pending = runtime.handleEvent({ kind: 'ai_message' });
    await Promise.resolve();
    assert.equal(runtime.cancel(), true);
    finishCapture({ chatIdentity: 'chat:a' });

    assert.equal(await pending, false);
    assert.equal(generations, 0);
});
