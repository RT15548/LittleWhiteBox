import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import showdown from 'showdown';
import { mountCheckCards, restoreCheckMarker } from '../apps/dice/host/check-marker-dom.ts';

const converter = new showdown.Converter();
function formatted(source) {
    return converter.makeHtml(source);
}
function fixture(source) {
    const { document } = parseHTML('<html><body><div id="message"></div></body></html>');
    const root = document.getElementById('message');
    // Repository-generated Markdown projection, never a stored message rewrite.
    // eslint-disable-next-line no-unsanitized/property
    root.innerHTML = formatted(source);
    const card = document.createElement('span');
    card.className = 'xb-dice-card'; card.dataset.diceRecord = 'one'; card.textContent = 'RESULT';
    return { root, card, cards: new Map([['one', card]]) };
}

// Stable contract: mounting/repainting replaces the marker node, not surrounding prose or wrappers.
for (const source of [
    '【1】之前。[dice:one]【8】之后。',
    '<div><p>【1】之前。</p>[dice:one]<p>【8】之后。</p></div>',
    '> 【1】之前。[dice:one]【8】之后。',
    '- 【1】之前。[dice:one]【8】之后。',
    '<details><summary>状态</summary>【1】之前。</details>\n\n[dice:one]\n\n【8】之后。',
]) {
    test(`marker replacement preserves text order and the surrounding DOM: ${source.slice(0, 25)}`, () => {
        const { root, card, cards } = fixture(source);
        const surrounding = [...root.querySelectorAll('*')];
        const expected = root.textContent.replace('[dice:one]', 'RESULT');
        assert.equal(mountCheckCards(root, cards).size, 1);
        assert.equal(root.textContent, expected);
        for (const node of surrounding) assert.ok(root.contains(node), 'preserve original wrappers and siblings');
        assert.equal(mountCheckCards(root, cards).size, 1);
        assert.equal(root.querySelectorAll('.xb-dice-card').length, 1);
        restoreCheckMarker(card);
        assert.equal(root.textContent, expected.replace('RESULT', '[dice:one]'));
        mountCheckCards(root, cards);
        assert.equal(root.textContent, expected);
    });
}

test('missing, removed or quoted markers do not attach a card to the bottom; moving a marker moves only the card', () => {
    const { root, card, cards } = fixture('【1】之前。[dice:one]【8】之后。');
    mountCheckCards(root, cards);
    // eslint-disable-next-line no-unsanitized/property -- Fixed fixture strings through the Markdown renderer.
    root.innerHTML = formatted('[dice:one]【1】之前。【8】之后。');
    mountCheckCards(root, cards);
    assert.equal(root.textContent, 'RESULT【1】之前。【8】之后。');
    for (const source of ['【1】之前。【8】之后。', '【1】[dice:unknown]【8】', '`[dice:one]`']) {
        // eslint-disable-next-line no-unsanitized/property -- Fixed fixture strings through the Markdown renderer.
        root.innerHTML = formatted(source);
        const before = root.innerHTML;
        assert.equal(mountCheckCards(root, cards).size, 0);
        assert.equal(root.innerHTML, before);
        assert.equal(card.isConnected, false);
    }
});

test('multiple markers in one text node retain their order and cannot consume marker-like card text', () => {
    const { root, card, cards } = fixture('【1】[dice:two]【5】[dice:one]【8】');
    const second = card.cloneNode(true); second.dataset.diceRecord = 'two'; second.textContent = 'SECOND';
    cards.set('two', second);
    card.textContent = 'RESULT [dice:two]';
    assert.equal(mountCheckCards(root, cards).size, 2);
    assert.equal(root.textContent, '【1】SECOND【5】RESULT [dice:two]【8】');
    assert.equal(mountCheckCards(root, cards).size, 2);
});

test('marker fragments separated by other content cannot consume wrappers, code or images', () => {
    const { root, cards } = fixture('<p>[dice:<img src="local.png">one]</p><p>[dice:<code>KEEP</code>one]</p><p>[dice:one]</p>');
    const paragraphs = [...root.querySelectorAll('p')];
    const before = paragraphs.slice(0, 2).map(node => node.innerHTML);
    assert.equal(mountCheckCards(root, cards).size, 1);
    assert.deepEqual(paragraphs.slice(0, 2).map(node => node.innerHTML), before);
    assert.equal(paragraphs[2].textContent, 'RESULT');
});
