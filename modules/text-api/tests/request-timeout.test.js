import test from 'node:test';
import assert from 'node:assert/strict';
import { applyPresetAction, createPreset, HOST_BINDING, normalizeRequestTimeoutSec, resolveFeaturePreset } from '../model.js';
import { migrateLegacySettings } from '../migration.js';
import { generateText } from '../runtime.js';

// Contracts: (lost settings) only an explicit preset save publishes a deadline,
// and users of that preset share it. (wasted calls) each request keeps its own snapshot.
test('saving a named or built-in preset updates all its bindings, not its copies or earlier snapshots', () => {
    for (const id of ['summary-default', HOST_BINDING]) {
        let settings = migrateLegacySettings({});
        const bind = (feature, value) => applyPresetAction(settings, feature,
            value === HOST_BINDING ? { type: 'select-host' } : { type: 'select', id: value });
        settings = bind('summary', id);
        settings = bind('outline', id);
        const first = resolveFeaturePreset(settings, 'outline');
        const draft = resolveFeaturePreset(settings, 'summary');
        draft.requestTimeoutSec = 600;
        assert.equal(resolveFeaturePreset(settings, 'outline').requestTimeoutSec, 180);
        settings = applyPresetAction(settings, 'summary', { type: 'save', id, preset: draft });
        assert.equal(resolveFeaturePreset(settings, 'outline').requestTimeoutSec, 600);
        assert.equal(first.requestTimeoutSec, 180);
        settings = applyPresetAction(settings, 'planner', { type: 'add', id: 'copy', name: 'copy', preset: draft });
        assert.equal(resolveFeaturePreset(settings, 'planner').requestTimeoutSec, 600);
        settings = applyPresetAction(settings, 'planner', { type: 'save', id: 'copy', preset: { ...draft, requestTimeoutSec: 30 } });
        assert.equal(resolveFeaturePreset(settings, 'summary').requestTimeoutSec, 600);
        settings = bind('outline', 'copy');
        assert.equal(resolveFeaturePreset(settings, 'outline').requestTimeoutSec, 30);
    }
});

test('slow generation passes its preset deadline to the adapter and stops once at that deadline', async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const calls = [];
    const preset = createPreset('a', 'Slow', { provider: 'openai-compatible', model: 'demo',
        baseUrl: 'https://local.invalid', requestTimeoutSec: 600 });
    let signal;
    const run = generateText(preset, { messages: [] }, { createAdapter: config => ({
        chat(options) {
            calls.push(config.timeoutMs);
            signal = options.signal;
            return new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }));
        },
    }) });
    await Promise.resolve();
    preset.requestTimeoutSec = 30;
    t.mock.timers.tick(599999);
    assert.equal(signal.aborted, false);
    const stopped = assert.rejects(run, { name: 'AbortError' });
    t.mock.timers.tick(1);
    await stopped;
    assert.equal(signal.aborted, true);
    assert.deepEqual(calls, [600000]);
});

test('draft timeout stays within the supported whole-second range', () => {
    assert.deepEqual([NaN, 1, 450.9, 99999].map(normalizeRequestTimeoutSec), [180, 30, 450, 3600]);
});
