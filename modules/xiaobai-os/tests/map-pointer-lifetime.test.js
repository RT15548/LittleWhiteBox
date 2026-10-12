import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { trackMapPointerLifetime } from '../apps/map/ui/map-pointer-lifetime.js';

function fixture() {
    const { document, Event } = parseHTML('<html><body><div></div></body></html>');
    const target = document.querySelector('div');
    const cancelled = [];
    const lifetime = trackMapPointerLifetime(target, id => cancelled.push(id));
    function pointer(node, type, pointerId) {
        const event = new Event(type, { bubbles: true });
        event.pointerId = pointerId;
        node.dispatchEvent(event);
    }
    return { document, target, Event, cancelled, lifetime, pointer };
}

test('detached map pointers end on document capture loss or release, not on unrelated pointers', t => {
    const { document, target, cancelled, lifetime, pointer } = fixture();
    t.after(() => lifetime.dispose());
    pointer(target, 'pointerdown', 1);
    target.remove();
    pointer(document, 'pointerup', 9);
    assert.deepEqual(cancelled, []);
    pointer(document, 'lostpointercapture', 1);
    pointer(document, 'pointerup', 1);
    assert.deepEqual(cancelled, [1]);
    document.body.append(target);
    pointer(target, 'pointerdown', 2);
    target.remove();
    pointer(document, 'pointerup', 2);
    assert.deepEqual(cancelled, [1, 2]);
});

test('local pointer ends stay with the viewport and do not cancel twice', t => {
    const { target, cancelled, lifetime, pointer } = fixture();
    t.after(() => lifetime.dispose());
    for (const type of ['pointerup', 'pointercancel']) {
        pointer(target, 'pointerdown', 1);
        pointer(target, type, 1);
        pointer(target, 'lostpointercapture', 1);
    }
    assert.deepEqual(cancelled, []);
    pointer(target, 'pointerdown', 2);
    pointer(target, 'lostpointercapture', 2);
    assert.deepEqual(cancelled, [2]);
});

test('hiding cancels every active touch and disposal removes gesture subscriptions', () => {
    const { document, target, Event, cancelled, lifetime, pointer } = fixture();
    pointer(target, 'pointerdown', 1); pointer(target, 'pointerdown', 2);
    lifetime.cancel(); lifetime.cancel();
    assert.deepEqual(cancelled, [1, 2]);
    pointer(target, 'pointerdown', 3);
    Object.defineProperty(document, 'hidden', { value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    assert.deepEqual(cancelled, [1, 2, 3]);
    pointer(target, 'pointerdown', 4);
    lifetime.dispose();
    pointer(target, 'pointerdown', 5);
    pointer(document, 'pointerup', 5);
    assert.deepEqual(cancelled, [1, 2, 3, 4]);
});
