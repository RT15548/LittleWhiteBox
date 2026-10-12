import test from 'node:test';
import assert from 'node:assert/strict';

import { buildVectorIntegrityIssues } from '../vector/integrity-policy.js';

const decisions = input => buildVectorIntegrityIssues(input).map(({ code, action }) => ({ code, action }));

test('temporary L1 gaps below five floors stay silent', () => {
    assert.deepEqual(buildVectorIntegrityIssues({ chunkFloorGap: 0 }), []);
    assert.deepEqual(buildVectorIntegrityIssues({ chunkFloorGap: 1 }), []);
    assert.deepEqual(buildVectorIntegrityIssues({ chunkFloorGap: 4 }), []);
});

test('an L1 gap of five floors warns', () => {
    assert.deepEqual(
        decisions({ chunkFloorGap: 5 }),
        [{ code: 'l1_gap', action: 'fill' }],
    );
});

test('fingerprint and unrepaired event-vector failures still warn immediately', () => {
    assert.deepEqual(
        decisions({
            fingerprintMismatch: true,
            chunkFloorGap: 2,
            missingEventVectorCount: 3,
        }),
        [
            { code: 'fingerprint_mismatch', action: 'rebuild' },
            { code: 'event_vectors_missing', action: 'fill' },
        ],
    );
});

test('temporary L0 gaps below five floors stay silent', () => {
    assert.deepEqual(buildVectorIntegrityIssues({ incompleteL0FloorCount: 1 }), []);
    assert.deepEqual(buildVectorIntegrityIssues({ incompleteL0FloorCount: 4 }), []);
});

test('an L0 gap of five floors warns', () => {
    assert.deepEqual(
        decisions({ incompleteL0FloorCount: 5 }),
        [{ code: 'l0_gap', action: 'fill' }],
    );
});

test('confirmed stored-cache inconsistency needs rebuild even when the progress watermark is current', () => {
    assert.deepEqual(decisions({ cacheInconsistent: true, chunkFloorGap: 0, incompleteL0FloorCount: 1 }), [
        { code: 'cache_inconsistent', action: 'rebuild' },
    ]);
});
