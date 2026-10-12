import assert from 'node:assert/strict';
import test from 'node:test';
import { createJoystick } from '../apps/game/expedition/joystick.ts';

// Pointer capture is the browser boundary. Ownership and output are tested without a renderer or a saved run.
function setup() {
    const captured = new Set(); let vector = [0, 0], engagements = 0;
    const surface = {
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
        setPointerCapture: id => captured.add(id),
        hasPointerCapture: id => captured.has(id),
        releasePointerCapture: id => captured.delete(id),
    };
    const stick = createJoystick((x, y) => vector = [x, y], () => engagements++);
    const event = (pointerId, clientX = 90, clientY = 50, button = 0) => ({ pointerId, clientX, clientY, button, currentTarget: surface });
    return { stick, event, captured, vector: () => vector, engagements: () => engagements };
}

test('a second contact cannot steal a held direction or stop the first finger when it leaves', () => {
    const t = setup(); t.stick.down(t.event(1)); assert.deepEqual(t.vector(), [1, 0]);
    t.stick.down(t.event(2, 10)); t.stick.move(t.event(2, 10));
    assert.deepEqual(t.vector(), [1, 0]); assert.deepEqual([...t.captured], [1]);
    t.stick.release(t.event(2)); assert.deepEqual(t.vector(), [1, 0]);
    t.stick.move(t.event(1, 10)); assert.deepEqual(t.vector(), [-1, 0]);
    assert.equal(t.engagements(), 1);
    t.stick.release(t.event(1)); assert.deepEqual(t.vector(), [0, 0]); assert.equal(t.captured.size, 0);
});

test('an owned drag keeps following outside the pad, with bounded diagonal output and a neutral center', () => {
    const t = setup(); t.stick.down(t.event(1, 50)); assert.deepEqual(t.vector(), [0, 0]);
    t.stick.move(t.event(1, -200, -200)); const [x, y] = t.vector();
    assert.ok(x < 0 && y < 0); assert.ok(Math.abs(Math.hypot(x, y) - 1) < .00001);
    t.stick.move(t.event(1, 50)); assert.deepEqual(t.vector(), [0, 0]);
});

test('cancel, capture loss and pause release ownership; stale old events cannot clear a new gesture', () => {
    for (const stop of ['release', 'clear']) {
        const t = setup(); t.stick.down(t.event(1)); t.stick[stop](t.event(1));
        assert.deepEqual(t.vector(), [0, 0]); assert.equal(t.captured.size, 0);
        t.stick.move(t.event(1)); assert.deepEqual(t.vector(), [0, 0]);
        t.stick.down(t.event(2, 10)); t.stick.release(t.event(1));
        assert.deepEqual(t.vector(), [-1, 0]); assert.deepEqual([...t.captured], [2]);
        t.stick.clear(); t.stick.clear(); assert.equal(t.captured.size, 0);
    }
});

test('secondary mouse buttons do not start a movement gesture', () => {
    const t = setup(); t.stick.down(t.event(1, 90, 50, 2));
    assert.deepEqual(t.vector(), [0, 0]); assert.equal(t.engagements(), 0); assert.equal(t.captured.size, 0);
});
