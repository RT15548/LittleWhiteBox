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

test('the summary bar badge lists every form type in order, and each form header badge follows its own type select', async () => {
    const list = document.getElementById('nd_char_list');
    const editing = () => list.querySelector('.char-card.editing');
    const badgeOf = id => list.querySelector(`.char-card[data-id="${id}"] .char-card-summary .char-type-badge`)?.textContent;
    const select = (root, value) => {
        root.querySelector('.char-edit-type').value = value;
        root.querySelector('.char-edit-type').dispatchEvent(new window.Event('change', { bubbles: true }));
    };

    click(editing().querySelector('[data-action="cancel"]'));
    await flush();
    assert.equal(badgeOf('c1'), 'girl', 'a single-form character keeps its one type');

    click(list.querySelector('.char-card[data-id="c1"] [data-action="edit"]'));
    await flush();
    click(editing().querySelector('[data-action="add-form"]'));
    await flush();
    const [first, second] = Array.from(editing().querySelectorAll('.char-form'));
    // 形态头部：名称输入框后面紧跟该形态自己的类型徽标（外观同摘要栏）。
    assert.equal(first.querySelector('.char-form-header > .char-form-name').nextElementSibling, first.querySelector('.char-form-type'));
    assert.ok(first.querySelector('.char-form-type').classList.contains('char-type-badge'));
    assert.equal(first.querySelector('.char-form-type').textContent, 'girl');
    select(first, 'boy');
    select(second, 'other');
    assert.equal(first.querySelector('.char-form-type').textContent, 'boy', 'live-updates when the form select changes');
    assert.equal(second.querySelector('.char-form-type').textContent, 'other');
    second.querySelector('.char-form-name').value = '兽形';
    select(second, 'custom');
    second.querySelector('.char-edit-type-custom').value = 'mature female';
    second.querySelector('.char-edit-type-custom').dispatchEvent(new window.Event('input', { bubbles: true }));
    assert.equal(second.querySelector('.char-form-type').textContent, 'mature', 'custom types use their first word');
    select(second, 'other');

    click(editing().querySelector('[data-action="save"]'));
    await flush();
    assert.equal(badgeOf('c1'), 'boy,other');
});

test('item and form headers: one … menu with 复制 / 停用·启用 / 删除; the menu never toggles fold, Esc closes it, and the copies and switches reach the saved character', async () => {
    const list = document.getElementById('nd_char_list');
    const editing = () => list.querySelector('.char-card.editing');
    const lastSaved = () => posted.filter(message => message.type === 'SAVE_CHARACTER_TAGS').at(-1).characterTags.find(char => char.id === 'c1');
    const press = (element, key) => {
        const event = new window.Event('keydown', { bubbles: true, cancelable: true });
        event.key = key;
        element.dispatchEvent(event);
    };
    const menuLabels = root => Array.from(root.querySelectorAll('[role="menuitem"] .char-menu-label')).map(node => node.textContent);

    click(list.querySelector('.char-card[data-id="c1"] [data-action="edit"]'));
    await flush();
    let forms = Array.from(editing().querySelectorAll('.char-form'));
    assert.equal(forms.length, 2);
    // 头部：启用开关是图标按钮，另有一个“…”菜单（复制、删除）
    for (const form of forms) {
        const header = form.querySelector('.char-form-header');
        assert.equal(header.querySelectorAll('.char-menu-button').length, 1);
        assert.equal(header.querySelectorAll('.btn-danger, .named-tag-switch').length, 0);
        assert.equal(header.querySelectorAll('.char-enabled-control[data-action="toggle-form-enabled"]').length, 1);
        assert.equal(header.querySelectorAll(':scope > .editor-item-delete').length, 0);
        assert.deepEqual(menuLabels(header), ['复制', '删除']);
    }

    // 点“…”只开菜单，不切换折叠；Esc 关闭
    const second = forms[1];
    const foldBefore = second.dataset.expanded;
    const menuButton = second.querySelector('.char-menu-button');
    click(menuButton);
    assert.equal(menuButton.getAttribute('aria-expanded'), 'true');
    assert.equal(second.querySelector('.char-menu').hasAttribute('hidden'), false);
    assert.equal(second.dataset.expanded, foldBefore, 'opening the menu does not toggle fold');
    press(document.documentElement, 'Escape');
    assert.equal(menuButton.getAttribute('aria-expanded'), 'false');
    assert.equal(second.querySelector('.char-menu').hasAttribute('hidden'), true);
    click(second.querySelector('.char-menu-wrap'));
    assert.equal(second.dataset.expanded, foldBefore, 'clicking the menu wrapper does not toggle fold either');

    // 停用第二个形态：只改 DOM，菜单文案翻转，仍可编辑
    click(second.querySelector('[data-action="toggle-form-enabled"]'));
    assert.equal(second.dataset.enabled, 'false');
    assert.ok(second.classList.contains('is-disabled'));
    const toggle = second.querySelector('.editor-item-enabled-toggle');
    assert.deepEqual([toggle.getAttribute('title'), toggle.getAttribute('aria-pressed'), toggle.classList.contains('active')], ['启用', 'false', false]);

    // 复制第二个形态：副本紧跟其后，名称加“副本”，展开且启用，原形态保持停用
    click(second.querySelector('[data-action="duplicate-form"]'));
    await flush();
    forms = Array.from(editing().querySelectorAll('.char-form'));
    assert.equal(forms.length, 3);
    assert.deepEqual(forms.map(form => form.querySelector('.char-form-name').getAttribute('value')), ['', '兽形', '兽形 副本']);
    assert.deepEqual(forms.map(form => form.dataset.enabled), ['true', 'false', 'true'], 'the copy is enabled even though the source is off');
    assert.equal(forms[2].dataset.expanded, 'true');
    assert.equal(forms[2].querySelector('.char-form-type').textContent, 'other', 'the copy keeps the type badge');
    assert.notEqual(forms[2].dataset.formKey, forms[1].dataset.formKey);

    // 停用第一个形态（角色顶层字段）
    click(forms[0].querySelector('[data-action="toggle-form-enabled"]'));

    // 服装条目：复制紧跟其后（名称加“副本”），再停用副本
    const outfitMenu = forms[0].querySelector('.char-outfit-editor-item');
    assert.deepEqual(menuLabels(outfitMenu.querySelector('.named-tag-header')), ['复制', '删除']);
    click(outfitMenu.querySelector('[data-action="duplicate-named-item"]'));
    await flush();
    const outfitRows = Array.from(forms[0].querySelectorAll('.char-outfit-editor-item'));
    assert.equal(outfitRows.length, 2);
    assert.equal(outfitRows[1].querySelector('.char-outfit-name').getAttribute('value'), '白裙 副本');
    assert.equal(outfitRows[1].dataset.expanded, 'true');
    click(outfitRows[1].querySelector('[data-action="toggle-named-enabled"]'));
    assert.equal(outfitRows[1].dataset.enabled, 'false');
    assert.equal(forms[0].querySelector('.char-edit-section[data-section="outfits"] .char-section-count').textContent, '1/2');

    click(editing().querySelector('[data-action="save"]'));
    await flush();
    const saved = lastSaved();
    assert.equal(saved.formDisabled, true, 'the first form flag is stored on the character itself');
    assert.deepEqual(saved.forms.map(form => [form.name, form.enabled]), [['兽形', false], ['兽形 副本', undefined]]);
    assert.notEqual(saved.forms[0].id, saved.forms[1].id, 'the copy gets its own id');
    assert.deepEqual(saved.outfits.map(item => [item.name, item.enabled]), [['白裙', undefined], ['白裙 副本', false]]);
    // 摘要栏只列启用形态的类型；形态数写成 启用/总数
    assert.equal(list.querySelector('.char-card[data-id="c1"] .char-type-badge').textContent, 'other');
    assert.match(list.querySelector('.char-card[data-id="c1"] .char-status').textContent, /1\/3 个形态/);
});

test('提示词模板 page: one 保存 (the preset bar), no bottom action row; 全部恢复默认 lives in the preset row menu and resets the form after a confirm', async () => {
    const html = readFileSync(pageUrl, 'utf8');
    assert.equal((html.match(/id="nd_prompt_preset_save"/g) || []).length, 1);
    for (const gone of ['nd_prompts_save', 'nd_prompts_reset_all', 'nd_prompts_status', '保存到当前预设']) {
        assert.equal(html.includes(gone), false, `${gone} is gone`);
    }
    assert.ok(html.includes('id="nd_prompt_preset_status"'), 'the one status line stays under the preset list');

    window.dispatchEvent(Object.assign(new window.Event('message'), {
        origin: window.location.origin, source: window.parent,
        data: {
            source: 'LittleWhiteBox-NovelDraw', type: 'INIT_DATA', cacheStats: {},
            defaultPrompts: { topSystem: '默认开场', sceneRules: '默认规则' },
            settings: {
                characterTags: [character], characterGroups: GROUPS,
                selectedPromptPresetId: 'p1',
                promptPresets: [
                    { id: 'p1', name: '预设一', topSystem: '自定义开场', sceneRules: '自定义规则' },
                    { id: 'p2', name: '预设二', topSystem: '另一个开场', sceneRules: '另一个规则' },
                ],
            },
        },
    }));
    await flush();
    const rows = Array.from(document.querySelectorAll('#nd_prompt_list .preset-row'));
    assert.ok(rows.length >= 1);
    const menuOf = row => Array.from(row.querySelectorAll('[role="menuitem"]')).map(item => item.dataset.presetAction);
    assert.deepEqual(menuOf(rows[0]), ['rename', 'duplicate', 'export', 'reset-defaults', 'delete']);
    assert.equal(rows[0].querySelector('[data-preset-action="reset-defaults"] .char-menu-label').textContent, '全部恢复默认');

    // 取消确认：什么也不动
    const asked = [];
    globalThis.confirm = (message) => { asked.push(message); return false; };
    document.getElementById('nd_prompt_system').value = '正在编辑的开场';
    click(rows[0].querySelector('[data-preset-action="reset-defaults"]'));
    assert.equal(asked.length, 1);
    assert.match(asked[0], /全部提示词（含请求结构）恢复为默认值/);
    assert.equal(document.getElementById('nd_prompt_system').value, '正在编辑的开场');

    // 确认：表单回到默认（只改表单，不发保存）
    globalThis.confirm = () => true;
    const savesBefore = posted.filter(message => message.type === 'SAVE_PROMPT_PRESET').length;
    click(rows[0].querySelector('[data-preset-action="reset-defaults"]'));
    assert.equal(document.getElementById('nd_prompt_system').value, '默认开场');
    assert.equal(document.getElementById('nd_prompt_format').value, '默认规则');
    assert.equal(posted.filter(message => message.type === 'SAVE_PROMPT_PRESET').length, savesBefore, 'needs 保存 to persist');
});

test('the group switch says 已开启 / 已关闭 in text, flips aria-pressed and keeps the disabled group look', async () => {
    window.dispatchEvent(Object.assign(new window.Event('message'), {
        origin: window.location.origin, source: window.parent,
        data: { source: 'LittleWhiteBox-NovelDraw', type: 'INIT_DATA', cacheStats: {}, settings: { characterTags: [character], characterGroups: GROUPS } },
    }));
    await flush();
    const list = document.getElementById('nd_char_list');
    const section = () => list.querySelector('.char-group[data-group-id="g1"]');
    const toggle = () => section().querySelector('[data-group-action="toggle-enabled"]');
    assert.equal(toggle().getAttribute('aria-pressed'), 'true');
    assert.ok(toggle().classList.contains('active'));
    assert.equal(toggle().querySelector('.char-switch-text').textContent, '已开启');
    assert.match(toggle().getAttribute('title'), /^已开启/);
    assert.equal(section().classList.contains('group-disabled'), false);

    click(toggle());
    await flush();
    assert.equal(toggle().getAttribute('aria-pressed'), 'false');
    assert.equal(toggle().classList.contains('active'), false);
    assert.equal(toggle().querySelector('.char-switch-text').textContent, '已关闭');
    assert.match(toggle().getAttribute('title'), /^已关闭/);
    assert.ok(toggle().querySelector('i').classList.contains('fa-toggle-off'));
    assert.ok(section().classList.contains('group-disabled'), 'dashed / dimmed group look is still driven by group-disabled');

    click(toggle());
    await flush();
    assert.equal(toggle().querySelector('.char-switch-text').textContent, '已开启');
});
