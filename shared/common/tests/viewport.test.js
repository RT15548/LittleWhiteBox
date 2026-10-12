import assert from 'node:assert/strict';
import test from 'node:test';
import { observeViewport } from '../viewport.js';

test('viewport consumers refresh on size, orientation and visible-area movement, and release every listener on close', () => {
    const host = new EventTarget();
    host.visualViewport = new EventTarget();
    let updates = 0;
    const close = observeViewport(() => updates++, host);
    assert.equal(updates, 1);
    for (const [target, event] of [[host, 'resize'], [host, 'orientationchange'],
        [host.visualViewport, 'resize'], [host.visualViewport, 'scroll']]) {
        const previous = updates;
        target.dispatchEvent(new Event(event));
        assert.equal(updates, previous + 1);
    }
    close();
    const closedUpdates = updates;
    host.dispatchEvent(new Event('resize'));
    host.dispatchEvent(new Event('orientationchange'));
    host.visualViewport.dispatchEvent(new Event('resize'));
    host.visualViewport.dispatchEvent(new Event('scroll'));
    assert.equal(updates, closedUpdates);
    const closeAgain = observeViewport(() => updates++, host);
    const reopenedUpdates = updates;
    host.visualViewport.dispatchEvent(new Event('resize'));
    assert.equal(updates, reopenedUpdates + 1);
    closeAgain();
});
