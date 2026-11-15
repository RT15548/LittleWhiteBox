import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { drawNotify } from '../draw-toast.js';

// Acceptance: supplier/error text is displayed as text, never executed as markup
// (credential exposure); Draw notices cannot alter/remove host notices (lost feedback).
test('draw feedback preserves host notices and treats provider text as text until expiry', t => {
    const { document } = parseHTML('<html><head></head><body><div id="toast-container">host notice</div></body></html>');
    const previous = globalThis.document;
    globalThis.document = document;
    t.after(() => { globalThis.document = previous; });
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const host = document.getElementById('toast-container');
    drawNotify.error('<img src=x onerror=alert(1)>', '<script>bad()</script>', { timeOut: 8000 });
    drawNotify.success('saved', undefined, { timeOut: 2500 });
    assert.equal(document.querySelectorAll('#xb-draw-toasts img, #xb-draw-toasts script').length, 0);
    assert.ok(document.getElementById('xb-draw-toasts').textContent.includes('<img src=x onerror=alert(1)>'));
    t.mock.timers.tick(2500);
    assert.equal(document.querySelectorAll('.xb-draw-toast').length, 1);
    t.mock.timers.tick(5500);
    assert.equal(document.getElementById('xb-draw-toasts'), null);
    assert.equal(document.getElementById('toast-container'), host);
    assert.equal(host.textContent, 'host notice');
});
