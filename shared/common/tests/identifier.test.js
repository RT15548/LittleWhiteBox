import test from 'node:test';
import assert from 'node:assert/strict';
import { createIdentifier } from '../identifier.js';

// Contract: on HTTP, IDs remain valid UUIDs and preserve independent entropy.
// Failure cost: requests or stored presets can collide or become unusable.
test('HTTP-compatible crypto generates UUID v4 identifiers without secure-context APIs', () => {
    let sequence = 0;
    const crypto = { getRandomValues(bytes) { bytes.fill(++sequence); return bytes; } };
    const first = createIdentifier(crypto), second = createIdentifier(crypto);
    assert.match(first, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    assert.notEqual(first, second);
});
