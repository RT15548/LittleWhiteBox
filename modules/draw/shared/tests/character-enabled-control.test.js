import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

import {
    createCharacterEnabledControl,
    getCharacterEnabledFromCard,
} from '../character-enabled-control.js';

test('character enabled control exposes its state and form collection follows toggles', () => {
    const { document, window } = parseHTML('<!doctype html><html><body></body></html>');
    const card = document.createElement('div');
    const control = createCharacterEnabledControl(document, card, {
        enabled: false,
        label: '角色 1 阿璃',
    });
    card.appendChild(control);

    const input = control.querySelector('input');
    assert.equal(input.getAttribute('aria-label'), '角色 1 阿璃启用状态');
    assert.equal(control.textContent, '已停用');
    assert.equal(card.classList.contains('character-disabled'), true);
    assert.equal(getCharacterEnabledFromCard(card), false);

    input.checked = true;
    input.dispatchEvent(new window.Event('change', { bubbles: true }));

    assert.equal(control.textContent, '已启用');
    assert.equal(card.classList.contains('character-disabled'), false);
    assert.equal(getCharacterEnabledFromCard(card), true);
});
