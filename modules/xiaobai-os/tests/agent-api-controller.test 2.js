import assert from 'node:assert/strict';
import test from 'node:test';

import { createAgentApiController } from '../apps/agent-api/host/controller.js';

function flushTasks() {
    return new Promise(resolve => globalThis.setTimeout(resolve, 0));
}

function createHarness(overrides = {}) {
    const calls = { load: 0, save: 0, pull: 0, test: 0 };
    const posts = [];
    const gateway = {
        async loadConfig() {
            calls.load += 1;
            return { updatedAt: 10, currentPresetName: '默认' };
        },
        async saveConfig(patch) {
            calls.save += 1;
            return { ok: true, config: { ...patch, updatedAt: 11 } };
        },
        async pullModels() {
            calls.pull += 1;
            return ['model-a'];
        },
        async testConnection() {
            calls.test += 1;
            return { provider: 'test', model: 'model-a', latencyMs: 5 };
        },
        ...overrides,
    };
    const controller = createAgentApiController(gateway);
    return {
        calls,
        controller,
        gateway,
        posts,
        activate() {
            return controller.activate({ post: (type, payload) => posts.push({ type, payload }) });
        },
    };
}

test('opening Agent API returns a loading shell and never probes the provider', async () => {
    const harness = createHarness();
    const initial = harness.activate();

    assert.deepEqual(initial, { status: 'loading', config: null, message: '' });
    assert.deepEqual(harness.calls, { load: 0, save: 0, pull: 0, test: 0 });
    await flushTasks();

    assert.equal(harness.calls.load, 1);
    assert.equal(harness.calls.pull, 0);
    assert.equal(harness.calls.test, 0);
    assert.equal(harness.posts[0].type, 'agent-api/state');
    assert.equal(harness.posts[0].payload.state.status, 'ready');
});

test('model pull and connection test run only for their explicit frame actions', async () => {
    const harness = createHarness();
    harness.activate();
    await flushTasks();

    await harness.controller.handleMessage({
        type: 'agent-api/save',
        payload: { patch: { currentPresetName: '默认' } },
    });
    await harness.controller.handleMessage({
        type: 'agent-api/reload',
        payload: {},
    });
    assert.deepEqual(harness.calls, { load: 2, save: 1, pull: 0, test: 0 });

    const pulled = await harness.controller.handleMessage({
        type: 'agent-api/pull-models',
        payload: { providerConfig: { provider: 'test' } },
    });
    const tested = await harness.controller.handleMessage({
        type: 'agent-api/test-connection',
        payload: { providerConfig: { provider: 'test' } },
    });
    assert.deepEqual(pulled, { models: ['model-a'] });
    assert.equal(tested.model, 'model-a');
    assert.equal(harness.calls.pull, 1);
    assert.equal(harness.calls.test, 1);
});

test('leaving Agent API aborts active provider work', async () => {
    let observedSignal = null;
    const harness = createHarness({
        testConnection(_config, signal) {
            observedSignal = signal;
            return new Promise((_resolve, reject) => {
                signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true });
            });
        },
    });
    harness.activate();
    await flushTasks();

    const pending = harness.controller.handleMessage({
        type: 'agent-api/test-connection',
        payload: { providerConfig: { provider: 'test' } },
    });
    harness.controller.deactivate('route-left');

    assert.equal(observedSignal.aborted, true);
    await assert.rejects(pending, /aborted/);
});
