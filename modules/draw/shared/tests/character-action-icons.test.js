import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { createCharacterActionIcon, renderCharacterActionIcon } from '../character-action-icons.js';

// Acceptance contract (cost: the character cards' icons changing shape when the helper moved to a shared module):
// - The HTML strings are exactly what novel-draw-page.js used to build inline, and the DOM version draws the same shapes.

const EXPECTED = {
    enabled: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" /><path d="m8 12 3 3 5-6" /></svg>',
    disabled: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" /></svg>',
    edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>',
    delete: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>',
};

test('the HTML icons are byte-identical to the markup the character cards used before', () => {
    for (const [name, html] of Object.entries(EXPECTED)) assert.equal(renderCharacterActionIcon(name), html, name);
    assert.equal(renderCharacterActionIcon('nope'), '<svg viewBox="0 0 24 24" aria-hidden="true"></svg>');
});

test('the DOM icon draws the same shapes in the SVG namespace', () => {
    const { document } = parseHTML('<html><body></body></html>');
    for (const name of Object.keys(EXPECTED)) {
        const svg = createCharacterActionIcon(document, name);
        const html = parseHTML(`<html><body>${renderCharacterActionIcon(name)}</body></html>`).document.querySelector('svg');
        assert.equal(svg.getAttribute('viewBox'), '0 0 24 24');
        assert.equal(svg.getAttribute('aria-hidden'), 'true');
        assert.deepEqual(
            Array.from(svg.children, shape => [shape.tagName.toLowerCase(), Object.fromEntries(Array.from(shape.attributes, attr => [attr.name, attr.value]))]),
            Array.from(html.children, shape => [shape.tagName.toLowerCase(), Object.fromEntries(Array.from(shape.attributes, attr => [attr.name, attr.value]))]),
            name,
        );
    }
});
