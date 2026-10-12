import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldSendOnEnter } from '../shell/app-src/input/composer-keyboard.js';

test('chat composers send only on plain desktop Enter, never a mobile newline or IME confirmation', () => {
    const enter = { key: 'Enter', keyCode: 13, shiftKey: false, ctrlKey: false, altKey: false, metaKey: false, isComposing: false };
    assert.equal(shouldSendOnEnter(enter, false, false), true);
    assert.equal(shouldSendOnEnter(enter, false, true), false);
    assert.equal(shouldSendOnEnter(enter, true, false), false);
    for (const change of [{ key: 'a' }, { shiftKey: true }, { ctrlKey: true }, { altKey: true }, { metaKey: true }, { isComposing: true }, { keyCode: 229 }]) {
        assert.equal(shouldSendOnEnter({ ...enter, ...change }, false, false), false);
    }
});
