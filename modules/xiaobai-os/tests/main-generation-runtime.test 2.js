import assert from 'node:assert/strict';
import test from 'node:test';

import { createMainGenerationRuntime } from '../host/main-generation-runtime.js';

function createHarness(hostGenerating = false) {
    let handlers = null;
    const states = [];
    const runtime = createMainGenerationRuntime({
        readHostGenerating: () => hostGenerating,
        subscribe(next) {
            handlers = next;
            return () => {handlers = null;};
        },
    });
    runtime.subscribe(active => states.push(active));
    runtime.startBackground();
    return {
        get handlers() {return handlers;},
        runtime,
        setHostGenerating(value) {hostGenerating = value; handlers.hostStateChanged();},
        states,
    };
}

test('startup during existing host activity stays guarded and publishes its eventual completion', () => {
    const harness = createHarness(true);
    assert.equal(harness.runtime.isActive(), true);
    assert.deepEqual(harness.states, [true]);
    harness.setHostGenerating(false);
    assert.equal(harness.runtime.isActive(), false);
    assert.deepEqual(harness.states, [true, false]);

    harness.setHostGenerating(true);
    harness.runtime.stopBackground();
    harness.runtime.subscribe(active => harness.states.push(active));
    harness.runtime.startBackground();
    assert.equal(harness.runtime.isActive(), true, 'restart samples existing host activity again');
    harness.handlers.started({ type: 'quiet', dryRun: false });
    assert.equal(harness.runtime.isActive(), false);
    harness.setHostGenerating(false);
});

test('a main request becomes active only after SillyTavern enters its real generation state', () => {
    const harness = createHarness();

    harness.handlers.started({ type: 'normal', dryRun: false });
    assert.equal(harness.runtime.isActive(), false);
    harness.setHostGenerating(true);
    assert.equal(harness.runtime.isActive(), true);
    harness.setHostGenerating(false);
    assert.equal(harness.runtime.isActive(), false);
    assert.deepEqual(harness.states, [true, false]);
});

test('a failed host preflight never locks the guard when no generation-ended event exists', () => {
    const harness = createHarness();

    harness.handlers.started({ type: 'normal', dryRun: false });
    harness.handlers.hostStateChanged();
    assert.equal(harness.runtime.isActive(), false);
    assert.deepEqual(harness.states, []);
});

test('quiet and dry-run requests cannot become main generations', () => {
    const harness = createHarness();

    harness.handlers.started({ type: 'quiet', dryRun: false });
    harness.setHostGenerating(true);
    assert.equal(harness.runtime.isActive(), false);
    harness.setHostGenerating(false);
    harness.handlers.started({ type: 'normal', dryRun: true });
    harness.setHostGenerating(true);
    assert.equal(harness.runtime.isActive(), false);
});

test('group wrapper state keeps the guard active across nested member generations', () => {
    const harness = createHarness();

    harness.handlers.started({ type: 'normal', dryRun: false });
    harness.handlers.groupStarted({ type: 'normal', dryRun: false });
    assert.equal(harness.runtime.isActive(), true);
    harness.handlers.started({ type: 'normal', dryRun: false });
    harness.setHostGenerating(false);
    assert.equal(harness.runtime.isActive(), true);
    harness.handlers.groupFinished();
    assert.equal(harness.runtime.isActive(), false);
    assert.deepEqual(harness.states, [true, false]);
});

test('chat changes and shutdown clear the main-generation guard', () => {
    const harness = createHarness();
    harness.handlers.groupStarted({ type: 'swipe', dryRun: false });
    harness.runtime.handleChatChanged();
    assert.equal(harness.runtime.isActive(), false);

    harness.handlers.groupStarted({ type: 'continue', dryRun: false });
    harness.runtime.stopBackground();
    assert.equal(harness.runtime.isActive(), false);
    assert.equal(harness.handlers, null);
});
