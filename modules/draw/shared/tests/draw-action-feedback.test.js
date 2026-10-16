import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { withDrawActionFeedback } from '../draw-action-feedback.js';

// Admission feedback must close the repeat-click window before storage I/O
// (duplicate paid requests), release on failure, and not overwrite newer task UI.
function fixture() {
    const { document } = parseHTML('<html><body><div class="xb-nd-img"><button data-action="retry-image"><span>draw</span></button></div></body></html>');
    const card = document.querySelector('.xb-nd-img');
    const button = card.querySelector('button');
    return { card, button, original: button.firstChild };
}

test('acknowledges and disables generation before the first asynchronous step', async () => {
    const { card, button, original } = fixture();
    let finish;
    const pending = withDrawActionFeedback(card, () => {
        assert.equal(button.disabled, true);
        assert.equal(button.getAttribute('aria-busy'), 'true');
        assert.notEqual(button.firstChild, original);
        return new Promise(resolve => { finish = resolve; });
    });
    assert.equal(button.disabled, true);
    finish(7);
    assert.equal(await pending, 7);
    assert.equal(button.disabled, false);
    assert.equal(button.hasAttribute('aria-busy'), false);
    assert.equal(button.firstChild, original);
});

test('a failed preparation restores a retryable control without hiding the error', async () => {
    const { button, original } = fixture();
    button.setAttribute('aria-label', 'original-action');
    const failure = new Error('storage failed');
    await assert.rejects(withDrawActionFeedback(button, () => { throw failure; }), error => error === failure);
    assert.equal(button.disabled, false);
    assert.equal(button.getAttribute('aria-label'), 'original-action');
    assert.equal(button.firstChild, original);
});

test('save-and-retry can enter generation without stacking or stranding disabled controls', async () => {
    const { card, button, original } = fixture();
    await withDrawActionFeedback(card, async () => {
        const progress = button.firstChild;
        await withDrawActionFeedback(card, async () => {
            assert.equal(button.firstChild, progress);
            assert.equal(button.disabled, true);
        });
        assert.equal(button.disabled, true);
    });
    assert.equal(button.disabled, false);
    assert.equal(button.firstChild, original);
});

test('settlement cannot restore stale controls over a newer task projection', async () => {
    const { card, button } = fixture();
    const replacement = button.ownerDocument.createElement('span');
    await withDrawActionFeedback(card, async () => {
        button.replaceChildren(replacement);
        button.disabled = true;
    });
    assert.equal(button.firstChild, replacement);
    assert.equal(button.disabled, true);
});

test('navigation to an existing image version stays usable; reroll is gated', async () => {
    const { card, button } = fixture();
    button.dataset.action = 'nav-next';
    card.dataset.currentIndex = '1';
    await withDrawActionFeedback(card, async () => assert.equal(button.disabled, false));
    card.dataset.currentIndex = '0';
    await withDrawActionFeedback(card, async () => assert.equal(button.disabled, true));
    assert.equal(button.disabled, false);
});
