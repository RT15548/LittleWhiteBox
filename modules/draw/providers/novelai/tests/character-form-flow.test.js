import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { register } from 'node:module';
import test from 'node:test';
import { parseHTML } from 'linkedom';

// Real-flow contract (cost: the 添加形态 button silently did nothing because the redraw re-read the old DOM over the new draft):
// - Opening a character for edit and clicking 添加形态 redraws the card with two form cards: the first keeps the typed values, the second is blank and expanded.
// - Clicking 删除 on the blank second form returns to the plain single layout with the first form's values intact.
// The page script itself is loaded against the real novel-draw.html markup; only the SillyTavern host module (lib.js) is stubbed.

register('./host-lib-hook.mjs', import.meta.url);

const pageUrl = new URL('../novel-draw.html', import.meta.url);
const { window, document } = parseHTML(readFileSync(pageUrl, 'utf8').replace(/<script[\s\S]*?<\/script>/g, ''));

// linkedom's <select> only has a value getter; the page assigns it (filters, dropdown resets).
const selectProto = Object.getPrototypeOf(document.createElement('select'));
Object.defineProperty(selectProto, 'value', {
    configurable: true,
    get() {
        const options = Array.from(this.querySelectorAll('option'));
        return (options.find(option => option.hasAttribute('selected')) ?? options[0])?.getAttribute('value') ?? options[0]?.textContent ?? '';
    },
    set(next) {
        for (const option of this.querySelectorAll('option')) {
            if ((option.getAttribute('value') ?? option.textContent) === String(next)) option.setAttribute('selected', '');
            else option.removeAttribute('selected');
        }
    },
});

const posted = [];
const noop = () => {};
Object.assign(window, {
    parent: { postMessage: (message) => posted.push(message) },
    matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop }),
    requestAnimationFrame: (callback) => setTimeout(callback, 0),
    cancelAnimationFrame: clearTimeout,
    alert: noop,
    confirm: () => true,
    scrollTo: noop,
});
window.location ??= new URL('http://localhost/');
const globals = {
    window, document, parent: window.parent, navigator: window.navigator ?? { userAgent: 'node' },
    HTMLElement: window.HTMLElement, Element: window.Element, Node: window.Node, Event: window.Event,
    CustomEvent: window.CustomEvent, MutationObserver: window.MutationObserver,
    ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
    IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
    requestAnimationFrame: window.requestAnimationFrame, cancelAnimationFrame: window.cancelAnimationFrame,
    alert: window.alert, confirm: window.confirm, getComputedStyle: window.getComputedStyle ?? (() => ({})),
    matchMedia: window.matchMedia,
};
for (const [key, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
}

const character = {
    id: 'c1', name: '阿璃', aliases: [], type: 'girl', appearance: 'silver hair', negativeTags: '', danbooruTag: '', enabled: true,
    outfits: [{ name: '白裙', tags: 'white dress' }], dynamicStates: [{ name: '害羞', tags: 'blush' }],
};

async function bootPage() {
    await import('../novel-draw-page.js');
    await new Promise((resolve) => setTimeout(resolve, 50));
    const origin = window.location.origin;
    window.dispatchEvent(Object.assign(new window.Event('message'), {
        origin, source: window.parent,
        data: { source: 'LittleWhiteBox-NovelDraw', type: 'INIT_DATA', settings: { characterTags: [character], characterGroups: [] }, cacheStats: {} },
    }));
    await new Promise((resolve) => setTimeout(resolve, 50));
}

const click = (element) => element.dispatchEvent(new window.Event('click', { bubbles: true, cancelable: true }));
const flush = () => new Promise((resolve) => setTimeout(resolve, 20));

test('add-form / remove-form drive the real character edit card', async () => {
    await bootPage();
    const list = document.getElementById('nd_char_list');
    assert.ok(list.querySelector('.char-card'), 'character card rendered');

    click(list.querySelector('[data-action="edit"]'));
    await flush();
    const editing = () => list.querySelector('.char-card.editing');
    assert.ok(editing(), 'card is in edit mode');
    assert.equal(editing().querySelectorAll('.char-form').length, 0, 'plain single layout before adding a form');
    editing().querySelector('.char-edit-appearance').value = 'silver hair, typed after open';

    click(editing().querySelector('[data-action="add-form"]'));
    await flush();
    const forms = Array.from(editing().querySelectorAll('.char-form'));
    assert.equal(forms.length, 2, 'two form cards after clicking 添加形态');
    assert.equal(forms[0].querySelector('.char-edit-appearance').value, 'silver hair, typed after open');
    assert.equal(forms[0].querySelector('.char-outfit-name').value, '白裙');
    assert.equal(forms[1].querySelector('.char-edit-appearance').value, '');
    assert.equal(forms[1].querySelectorAll('.named-tag-item').length, 0);
    assert.ok(!forms[1].classList.contains('is-folded') && !forms[1].classList.contains('is-collapsed'), 'the new form is expanded');

    click(forms[1].querySelector('[data-action="remove-form"]'));
    await flush();
    assert.equal(editing().querySelectorAll('.char-form').length, 0, 'back to the plain layout after removing the blank form');
    assert.equal(editing().querySelector('.char-edit-appearance').value, 'silver hair, typed after open');
    assert.ok(editing().querySelector('[data-action="add-form"]'));
});
