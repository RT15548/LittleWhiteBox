import assert from 'node:assert/strict';
import test from 'node:test';
import { isXiaobaiMasterEnabled } from '../runtime-gate.js';

test('story summary runtime starts only when the master switch is enabled', () => {
    assert.equal(isXiaobaiMasterEnabled({ window: { isXiaobaixEnabled: true } }), true);
    assert.equal(isXiaobaiMasterEnabled({ window: { isXiaobaixEnabled: false } }), false);
    assert.equal(isXiaobaiMasterEnabled({ window: {} }), true);
});
