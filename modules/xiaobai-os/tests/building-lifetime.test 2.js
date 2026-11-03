import assert from 'node:assert/strict';
import test from 'node:test';
import { withSceneLifetime } from '../apps/game/building/scene/lifetime.ts';

test('a scene releases its partial construction on failure and preserves the original cause', () => {
    const released = [], failure = new Error();
    assert.throws(() => withSceneLifetime(lifetime => {
        lifetime.own({ dispose: () => released.push('renderer') });
        lifetime.own({ dispose: () => released.push('materials') });
        throw failure;
    }), error => error === failure);
    assert.deepEqual(released, ['materials', 'renderer']);
});

test('scene disposal finishes all releases even when one fails, without releasing twice', () => {
    const released = [], failure = new Error();
    const dispose = withSceneLifetime(lifetime => {
        lifetime.defer(() => released.push('canvas'));
        lifetime.defer(() => { released.push('renderer'); throw failure; });
        lifetime.defer(() => released.push('observers'));
        return lifetime.dispose;
    });
    assert.throws(dispose, error => error instanceof globalThis.AggregateError && error.errors[0] === failure);
    dispose();
    assert.deepEqual(released, ['observers', 'renderer', 'canvas']);
});
