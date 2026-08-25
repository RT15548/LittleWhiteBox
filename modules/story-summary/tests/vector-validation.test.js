import test from 'node:test';
import assert from 'node:assert/strict';

import { assertFiniteVector } from '../vector/storage/vector-validation.js';

test('storage boundary accepts arrays and typed arrays with finite values', () => {
    assert.equal(assertFiniteVector([1, 2], 'vector'), 2);
    assert.equal(assertFiniteVector(new Float32Array([1, 2]), 'vector', 2), 2);
});

test('storage boundary rejects zero dimensions, mixed dimensions and non-finite values', () => {
    assert.throws(() => assertFiniteVector([], 'vector'));
    assert.throws(() => assertFiniteVector([1], 'vector', 2));
    assert.throws(() => assertFiniteVector([1, Number.NaN], 'vector'));
    assert.throws(() => assertFiniteVector([1, Number.POSITIVE_INFINITY], 'vector'));
    assert.throws(() => assertFiniteVector([Number.MAX_VALUE], 'vector'));
});
