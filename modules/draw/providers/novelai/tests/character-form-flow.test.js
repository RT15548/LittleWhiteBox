import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { register } from 'node:module';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { FORM_COPY, FORM_MAX_COUNT } from '../../../shared/character-edit-form.js';

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
const memoryStorage = new Map();
const globals = {
    localStorage: { getItem: key => memoryStorage.get(key) ?? null, setItem: (key, value) => memoryStorage.set(key, String(value)), removeItem: key => memoryStorage.delete(key) },
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

const GROUPS = [{ id: 'g1', name: '组一', enabled: true }, { id: 'g2', name: '组二', enabled: true }];
const character = {
    id: 'c1', name: '阿璃', groupId: 'g1', aliases: [], type: 'girl', appearance: 'silver hair', negativeTags: '', danbooruTag: '', enabled: true,
    outfits: [{ name: '白裙', tags: 'white dress' }], dynamicStates: [{ name: '害羞', tags: 'blush' }],
};

async function bootPage() {
    await import('../novel-draw-page.js');
    await new Promise((resolve) => setTimeout(resolve, 50));
    const origin = window.location.origin;
    window.dispatchEvent(Object.assign(new window.Event('message'), {
        origin, source: window.parent,
        data: { source: 'LittleWhiteBox-NovelDraw', type: 'INIT_DATA', settings: { characterTags: [character], characterGroups: GROUPS }, cacheStats: {} },
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

    // 添加形态在吸顶摘要行里（取消之后、启用 / 编辑图标之前）；表单正文里没有它，也没有那行长说明。
    const addButton = editing().querySelector('.char-card-summary [data-action="add-form"]');
    assert.ok(addButton, 'add-form button is in the sticky summary bar');
    assert.equal(editing().querySelectorAll('.char-edit-form [data-action="add-form"]').length, 0);
    assert.equal(editing().querySelectorAll('[data-action="add-form"]').length, 1);
    assert.equal(addButton.previousElementSibling.getAttribute('data-action'), 'cancel');
    assert.equal(addButton.nextElementSibling.getAttribute('data-action'), 'toggle-enabled');
    assert.equal(addButton.getAttribute('title'), FORM_COPY.hint);
    assert.equal(addButton.getAttribute('data-id'), 'c1');
    assert.match(addButton.getAttribute('aria-label'), /添加形态/);
    assert.equal(addButton.querySelector('i').getAttribute('class'), 'fa-solid fa-plus');
    assert.equal(addButton.querySelector('span').textContent, '添加形态');
    assert.ok(!editing().querySelector('.char-forms-add'));

    click(addButton);
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
    assert.ok(editing().querySelector('.char-card-summary [data-action="add-form"]'));
});

test('with two or more forms the bar button still adds one, and stops with the limit alert at the maximum', async () => {
    const list = document.getElementById('nd_char_list');
    const editing = () => list.querySelector('.char-card.editing');
    const alerts = [];
    globalThis.alert = (message) => alerts.push(message);
    const addButton = () => editing().querySelector('.char-card-summary [data-action="add-form"]');
    const count = () => editing().querySelectorAll('.char-form').length;
    assert.equal(count(), 0, 'previous test left the card in the single layout');
    click(addButton());
    await flush();
    assert.equal(count(), 2);
    assert.equal(editing().querySelectorAll('.char-forms [data-action="add-form"]').length, 0, 'no second add button in the forms section');
    click(addButton());
    await flush();
    assert.equal(count(), 3, 'a third form is added from the same bar button');
    while (count() < FORM_MAX_COUNT) {
        click(addButton());
        await flush();
    }
    assert.deepEqual(alerts, []);
    click(addButton());
    await flush();
    assert.equal(count(), FORM_MAX_COUNT, 'no form is added past the maximum');
    assert.deepEqual(alerts, [FORM_COPY.limit]);
});

test('the edit form has no 所属分组 dropdown: saving keeps the group, and drag-free paths (batch move, group add) still place characters', async () => {
    const list = document.getElementById('nd_char_list');
    const editing = () => list.querySelector('.char-card.editing');
    const groupOf = id => list.querySelector(`.char-card[data-id="${id}"]`)?.closest('.char-group')?.dataset.groupId;
    const lastSaved = () => posted.filter(message => message.type === 'SAVE_CHARACTER_TAGS').at(-1);

    click(editing().querySelector('[data-action="cancel"]'));
    await flush();
    assert.equal(groupOf('c1'), 'g1');
    click(list.querySelector('.char-card[data-id="c1"] [data-action="edit"]'));
    await flush();
    assert.equal(editing().querySelectorAll('.char-edit-group, [data-saved-group]').length, 0, 'no group dropdown in the edit form');
    assert.ok(!editing().textContent.includes('所属分组'));
    editing().querySelector('.char-edit-name').value = '阿璃改';
    click(editing().querySelector('[data-action="save"]'));
    await flush();
    const saved = lastSaved().characterTags.find(char => char.id === 'c1');
    assert.equal(saved.name, '阿璃改');
    assert.equal(saved.groupId, 'g1', 'saving leaves groupId untouched');
    assert.equal(groupOf('c1'), 'g1');

    // 多选 → 移到分组
    click(document.getElementById('nd_char_select_toggle'));
    await flush();
    const box = list.querySelector('.char-select[data-select-char="c1"]');
    box.checked = true;
    box.dispatchEvent(new window.Event('change', { bubbles: true }));
    document.getElementById('nd_batch_target').value = 'g2';
    click(document.querySelector('#nd_char_batch_bar [data-batch="move"]'));
    await flush();
    assert.equal(groupOf('c1'), 'g2', 'batch move puts the character into the target group');
    assert.equal(lastSaved().characterTags.find(char => char.id === 'c1').groupId, 'g2');
    click(document.querySelector('#nd_char_batch_bar [data-batch="exit"]'));
    await flush();

    // 分组头的“在本组添加”：新角色直接在该组里（并处于编辑状态）
    click(list.querySelector('[data-group-action="add"][data-group-id="g1"]'));
    await flush();
    const fresh = editing();
    assert.ok(fresh && fresh.dataset.id !== 'c1');
    assert.equal(fresh.closest('.char-group').dataset.groupId, 'g1');
    assert.equal(fresh.querySelectorAll('.char-edit-group').length, 0);
});
