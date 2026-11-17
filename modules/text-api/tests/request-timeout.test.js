import test from 'node:test';
import assert from 'node:assert/strict';
import {
    applyPresetAction, assertSettings, createPreset, featureRequestTimeoutSec, normalizeRequestTimeoutSec,
    TEXT_API_VERSION, HOST_BINDING, DEFAULT_REQUEST_TIMEOUT_SEC, MIN_REQUEST_TIMEOUT_SEC, MAX_REQUEST_TIMEOUT_SEC,
} from '../model.js';

// Contracts: a slow model must be able to outlive the old fixed deadline, and
// one feature's deadline must never silently change another feature's.
const settings = () => ({
    version: TEXT_API_VERSION, presets: [createPreset('a', 'A'), createPreset('b', 'B')],
    bindings: { summary: HOST_BINDING, planner: 'a', outline: 'b' },
});

test('settings without a stored timeout keep the previous 180 second deadline for every feature', () => {
    assert.equal(DEFAULT_REQUEST_TIMEOUT_SEC, 180);
    for (const feature of ['summary', 'planner', 'outline']) assert.equal(featureRequestTimeoutSec(settings(), feature), 180);
    for (const value of [undefined, null, '', 'abc', Number.NaN]) assert.equal(normalizeRequestTimeoutSec(value), 180);
});

test('timeouts are whole seconds clamped to the supported range', () => {
    assert.equal(normalizeRequestTimeoutSec('900'), 900);
    assert.equal(normalizeRequestTimeoutSec(450.9), 450);
    assert.equal(normalizeRequestTimeoutSec(1), MIN_REQUEST_TIMEOUT_SEC);
    assert.equal(normalizeRequestTimeoutSec(999999), MAX_REQUEST_TIMEOUT_SEC);
});

test('a timeout applies to one feature, including the host binding, and survives later preset changes', () => {
    let next = applyPresetAction(settings(), 'summary', { type: 'request-timeout', seconds: '900' });
    assert.deepEqual(next.requestTimeouts, { summary: 900 });
    assert.equal(next.bindings.summary, HOST_BINDING);
    assert.equal(featureRequestTimeoutSec(next, 'planner'), 180);
    next = applyPresetAction(next, 'outline', { type: 'request-timeout', seconds: 5 });
    next = applyPresetAction(next, 'planner', { type: 'select', id: 'b' });
    next = applyPresetAction(next, 'planner', { type: 'delete', id: 'a' });
    next = applyPresetAction(next, 'summary', { type: 'save', id: 'b', preset: createPreset('b', 'B', { model: 'm' }) });
    assert.deepEqual(next.requestTimeouts, { summary: 900, outline: MIN_REQUEST_TIMEOUT_SEC });
});

test('stored timeouts outside the contract are rejected instead of being used', () => {
    for (const requestTimeouts of [{ summary: 5 }, { summary: '900' }, { summary: 900.5 }, { other: 900 }, [900], 'x']) {
        assert.throws(() => assertSettings({ ...settings(), requestTimeouts }));
    }
    assert.doesNotThrow(() => assertSettings({ ...settings(), requestTimeouts: { planner: 3600 } }));
});
