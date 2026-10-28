import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { register } from 'node:module';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { AUTO_SAVE_DELAY_MS } from '../../../shared/auto-save.js';
import { FORM_MAX_COUNT } from '../../../shared/character-edit-form.js';

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
let deferAck = false;
const waitingAcks = [];
function acknowledge(message, state = 'success') {
    window.dispatchEvent(Object.assign(new window.Event('message'), {
        origin: window.location.origin, source: window.parent,
        data: { source: 'LittleWhiteBox-NovelDraw', type: 'STATUS', state, target: 'char-tags', requestId: message.requestId },
    }));
}
const noop = () => {};
Object.assign(window, {
    // 宿主：对带 requestId 的角色保存（编辑区自动保存）回一条成功回执，页面据此串行保存。
    parent: {
        postMessage: (message) => {
            posted.push(structuredClone(message));
            if (message.type !== 'SAVE_CHARACTER_TAGS' || !message.requestId) return;
            if (deferAck) { waitingAcks.push(structuredClone(message)); return; }
            setTimeout(() => window.dispatchEvent(Object.assign(new window.Event('message'), {
                origin: window.location.origin, source: window.parent,
                data: { source: 'LittleWhiteBox-NovelDraw', type: 'STATUS', state: 'success', target: 'char-tags', requestId: message.requestId },
            })), 0);
        },
    },
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

async function bootPage(initialCharacter = character) {
    await import('../novel-draw-page.js');
    await new Promise((resolve) => setTimeout(resolve, 50));
    const origin = window.location.origin;
    window.dispatchEvent(Object.assign(new window.Event('message'), {
        origin, source: window.parent,
        data: { source: 'LittleWhiteBox-NovelDraw', type: 'INIT_DATA', settings: { characterTags: [initialCharacter], characterGroups: GROUPS }, cacheStats: {} },
    }));
    await new Promise((resolve) => setTimeout(resolve, 50));
}

const click = (element) => element.dispatchEvent(new window.Event('click', { bubbles: true, cancelable: true }));
const flush = () => new Promise((resolve) => setTimeout(resolve, 20));
// 点角色行展开 / 收起编辑区（没有编辑 / 保存 / 取消按钮）；收起时先自动保存，所以多等一会儿。
const settle = () => new Promise((resolve) => setTimeout(resolve, 40));
const openEditor = async (id) => { click(document.querySelector(`#nd_char_list .char-card[data-id="${id}"] .char-card-summary`)); await settle(); };
const closeEditor = async () => { click(document.querySelector('#nd_char_list .char-card.editing .char-card-summary')); await settle(); };

test('add-form / remove-form drive the real character edit card', async () => {
    await bootPage();
    const list = document.getElementById('nd_char_list');
    assert.ok(list.querySelector('.char-card'), 'character card rendered');

    await openEditor('c1');
    const editing = () => list.querySelector('.char-card.editing');
    assert.ok(editing(), 'card is in edit mode');
    assert.equal(editing().querySelectorAll('.char-form').length, 0, 'plain single layout before adding a form');
    editing().querySelector('.char-edit-appearance').value = 'silver hair, typed after open';

    const addButton = editing().querySelector('.char-card-summary [data-action="add-form"]');
    assert.equal(addButton.getAttribute('data-id'), 'c1');

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

test('adding forms preserves existing values and refuses additions past the maximum', async () => {
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
    assert.equal(alerts.length, 1, 'the refused addition is reported');
});

test('saving preserves the group while batch moves and group additions update it explicitly', async () => {
    const list = document.getElementById('nd_char_list');
    const editing = () => list.querySelector('.char-card.editing');
    const groupOf = id => list.querySelector(`.char-card[data-id="${id}"]`)?.closest('.char-group')?.dataset.groupId;
    const lastSaved = () => posted.filter(message => message.type === 'SAVE_CHARACTER_TAGS').at(-1);

    await closeEditor();
    assert.equal(groupOf('c1'), 'g1');
    await openEditor('c1');
    editing().querySelector('.char-edit-name').value = '阿璃改';
    await closeEditor();
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

// Contract: copying and disabling forms/items must persist independent identities and flags; failure corrupts character data.
test('form and item copies retain independent identities and enabled states when saved', async () => {
    await bootPage({
        ...structuredClone(character),
        forms: [{ id: 'beast', name: '兽形', type: 'other', appearance: 'fur', outfits: [], dynamicStates: [] }],
    });
    const list = document.getElementById('nd_char_list');
    const editing = () => list.querySelector('.char-card.editing');
    const lastSaved = () => posted.filter(message => message.type === 'SAVE_CHARACTER_TAGS').at(-1).characterTags.find(char => char.id === 'c1');
    const press = (element, key) => {
        const event = new window.Event('keydown', { bubbles: true, cancelable: true });
        event.key = key;
        element.dispatchEvent(event);
    };

    await openEditor('c1');
    let forms = Array.from(editing().querySelectorAll('.char-form'));
    assert.equal(forms.length, 2);

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

    // 停用第二个形态，仍可编辑和复制。
    click(second.querySelector('[data-action="toggle-form-enabled"]'));
    assert.equal(second.dataset.enabled, 'false');

    // 复制第二个形态：副本紧跟其后，名称加“副本”，展开且启用，原形态保持停用
    click(second.querySelector('[data-action="duplicate-form"]'));
    await flush();
    forms = Array.from(editing().querySelectorAll('.char-form'));
    assert.equal(forms.length, 3);
    assert.deepEqual(forms.map(form => form.querySelector('.char-form-name').getAttribute('value')), ['', '兽形', '兽形 副本']);
    assert.deepEqual(forms.map(form => form.dataset.enabled), ['true', 'false', 'true'], 'the copy is enabled even though the source is off');
    assert.equal(forms[2].dataset.expanded, 'true');
    assert.notEqual(forms[2].dataset.formKey, forms[1].dataset.formKey);

    // 停用第一个形态（角色顶层字段）
    click(forms[0].querySelector('[data-action="toggle-form-enabled"]'));

    // 服装条目：复制紧跟其后（名称加“副本”），再停用副本
    const outfitMenu = forms[0].querySelector('.char-outfit-editor-item');
    click(outfitMenu.querySelector('[data-action="duplicate-named-item"]'));
    await flush();
    const outfitRows = Array.from(forms[0].querySelectorAll('.char-outfit-editor-item'));
    assert.equal(outfitRows.length, 2);
    assert.equal(outfitRows[1].querySelector('.char-outfit-name').getAttribute('value'), '白裙 副本');
    assert.equal(outfitRows[1].dataset.expanded, 'true');
    click(outfitRows[1].querySelector('[data-action="toggle-named-enabled"]'));
    assert.equal(outfitRows[1].dataset.enabled, 'false');

    await closeEditor();
    const saved = lastSaved();
    assert.equal(saved.formDisabled, true, 'the first form flag is stored on the character itself');
    assert.deepEqual(saved.forms.map(form => [form.name, form.enabled]), [['兽形', false], ['兽形 副本', undefined]]);
    assert.notEqual(saved.forms[0].id, saved.forms[1].id, 'the copy gets its own id');
    assert.deepEqual(saved.outfits.map(item => [item.name, item.enabled]), [['白裙', undefined], ['白裙 副本', false]]);
    assert.equal(saved.forms[1].type, 'other', 'the copied form retains its type');
    assert.equal(saved.forms[1].appearance, 'fur', 'the copied form retains its content');
});

test('resetting a prompt preset requires confirmation and does not save over the existing preset', async () => {

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

    // 取消确认：什么也不动
    const asked = [];
    globalThis.confirm = (message) => { asked.push(message); return false; };
    document.getElementById('nd_prompt_system').value = '正在编辑的开场';
    click(rows[0].querySelector('[data-preset-action="reset-defaults"]'));
    assert.equal(asked.length, 1);
    assert.equal(document.getElementById('nd_prompt_system').value, '正在编辑的开场');

    // 确认：表单回到默认（只改表单，不发保存）
    globalThis.confirm = () => true;
    const savesBefore = posted.filter(message => message.type === 'SAVE_PROMPT_PRESET').length;
    click(rows[0].querySelector('[data-preset-action="reset-defaults"]'));
    assert.equal(document.getElementById('nd_prompt_system').value, '默认开场');
    assert.equal(document.getElementById('nd_prompt_format').value, '默认规则');
    assert.equal(posted.filter(message => message.type === 'SAVE_PROMPT_PRESET').length, savesBefore, 'needs 保存 to persist');
});

test('group names, 绘图参数 presets and 提示词模板 presets are renamed in place: no 重命名 button or menu item, same validation and save path as before', async () => {
    window.dispatchEvent(Object.assign(new window.Event('message'), {
        origin: window.location.origin, source: window.parent,
        data: {
            source: 'LittleWhiteBox-NovelDraw', type: 'INIT_DATA', cacheStats: {},
            settings: {
                characterTags: [character], characterGroups: GROUPS,
                selectedParamsPresetId: 'q1', paramsPresets: [{ id: 'q1', name: '参数一' }, { id: 'q2', name: '参数二' }],
                selectedPromptPresetId: 'p1', promptPresets: [{ id: 'p1', name: '预设一' }, { id: 'p2', name: '预设二' }],
            },
        },
    }));
    await flush();
    assert.equal(document.querySelector('[data-group-action="rename"]'), null);
    assert.equal(document.querySelector('[data-preset-action="rename"]'), null);
    const edit = (input, value) => {
        const fire = type => input.dispatchEvent(new window.Event(type, { bubbles: true, cancelable: true }));
        fire('focusin');
        input.value = value;
        fire('focusout');
    };

    // 分组：校验沿用 renameGroup，重名时提示并还原
    const groupName = id => document.querySelector(`#nd_char_list .char-group[data-group-id="${id}"] .char-group-name`);
    assert.equal(groupName('g1').tagName, 'INPUT');
    assert.equal(groupName('g1').value, '组一');
    const alerts = [];
    const alertBefore = globalThis.alert;
    globalThis.alert = message => alerts.push(message);
    edit(groupName('g1'), '组二');
    await flush();
    assert.equal(alerts.length, 1, '重名被拒绝并提示');
    assert.equal(groupName('g1').value, '组一', '输入框还原');
    posted.length = 0;
    edit(groupName('g1'), '  新组名 ');
    await flush();
    globalThis.alert = alertBefore;
    assert.equal(groupName('g1').value, '新组名');
    const saved = posted.filter(message => message.type === 'SAVE_CHARACTER_TAGS').at(-1);
    assert.deepEqual(saved.characterGroups.map(group => group.name), ['新组名', '组二']);
    assert.equal(alerts.length, 1);

    // 参数预设：本地改名后整份保存
    const rowName = (listId, id) => document.querySelector(`#${listId} .preset-row[data-preset-id="${id}"] .preset-row-name`);
    posted.length = 0;
    edit(rowName('nd_params_list', 'q2'), '参数二改');
    await flush();
    const paramsSave = posted.find(message => message.type === 'SAVE_PARAMS_PRESET');
    assert.deepEqual(paramsSave.paramsPresets.map(preset => preset.name), ['参数一', '参数二改']);
    assert.equal(paramsSave.selectedParamsPresetId, 'q1', '改名不切换当前预设');

    // 提示词模板预设：交给宿主改名
    posted.length = 0;
    const promptList = document.querySelector('#nd_prompt_list');
    promptList.querySelector('.preset-row-name').dispatchEvent(new window.Event('focusin', { bubbles: true }));
    const promptName = promptList.querySelector('.preset-row-name');
    promptName.value = '预设一改';
    promptName.dispatchEvent(new window.Event('focusout', { bubbles: true }));
    assert.deepEqual(posted.find(message => message.type === 'RENAME_PROMPT_PRESET'), { source: 'NovelDraw-Frame', type: 'RENAME_PROMPT_PRESET', id: 'p1', name: '预设一改' });
});

// ── 角色行点击展开 + 编辑区自动保存（真实页面：输入 → 等一会儿 → 已落盘）──────────────────────────
const saves = () => posted.filter(message => message.type === 'SAVE_CHARACTER_TAGS' && message.requestId);
const typeInto = (input, value) => {
    input.value = value;
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
};
const statusOf = () => document.querySelector('#nd_char_list .char-card.editing .char-save-status');
const afterDebounce = () => new Promise(resolve => setTimeout(resolve, AUTO_SAVE_DELAY_MS + 150));

test('click the row to open / close the editor (no pen button), and the row controls never toggle it', async () => {
    const list = document.getElementById('nd_char_list');
    if (list.querySelector('.char-card.editing')) await closeEditor();
    const summary = id => list.querySelector(`.char-card[data-id="${id}"] .char-card-summary`);
    assert.equal(list.querySelectorAll('.char-card.editing').length, 0);

    // 启用开关 / “…”菜单按钮：各管各的，不展开
    click(summary('c1').querySelector('[data-action="toggle-enabled"]'));
    await settle();
    click(summary('c1').querySelector('[data-action="menu"]'));
    await settle();
    assert.equal(list.querySelectorAll('.char-card.editing').length, 0, 'the enable switch and the … button do not open the editor');
    click(summary('c1').querySelector('[data-action="toggle-enabled"]')); // 还原
    await settle();

    click(summary('c1'));
    await settle();
    assert.equal(list.querySelectorAll('.char-card.editing').length, 1);
    assert.equal(list.querySelector('.char-card[data-id="c1"] [data-char-toggle]').getAttribute('aria-expanded'), 'true');

    click(list.querySelector('.char-card[data-id="c1"] .char-name'));
    await settle();
    assert.equal(list.querySelectorAll('.char-card.editing').length, 0, 'clicking the row again closes it');
    assert.equal(list.querySelector('.char-card[data-id="c1"] [data-char-toggle]').getAttribute('aria-expanded'), 'false');
});

test('typing then waiting persists the edit without redrawing the form; opening another row saves and switches (one editor at a time)', async () => {
    const list = document.getElementById('nd_char_list');
    const before = saves().length;
    await openEditor('c1');
    const nameInput = list.querySelector('.char-card.editing .char-edit-name');
    typeInto(nameInput, '阿璃·自动');
    await flush();
    assert.equal(saves().length, before, 'nothing is sent while the user is still typing');
    await afterDebounce();
    assert.equal(saves().length, before + 1, 'saved once after the pause');
    assert.equal(saves().at(-1).characterTags.find(char => char.id === 'c1').name, '阿璃·自动');
    assert.equal(list.querySelector('.char-card.editing .char-edit-name'), nameInput, 'the form was not redrawn (focus and caret stay)');
    assert.equal(list.querySelector('.char-card.editing .char-name').textContent, '阿璃·自动', 'the summary name follows');

    // 又改了一点就切到另一张：切换前立刻保存，编辑区换成另一张
    typeInto(nameInput, '阿璃·切换');
    click(document.getElementById('nd_char_add')); // 新建角色会换掉当前编辑区：先存好 c1
    await settle();
    assert.equal(saves().at(-1).characterTags.find(char => char.id === 'c1').name, '阿璃·切换', 'saved right before switching');
    assert.equal(list.querySelectorAll('.char-card.editing').length, 1);
    assert.notEqual(list.querySelector('.char-card.editing').dataset.id, 'c1');
    await closeEditor();
    assert.equal(list.querySelectorAll('.char-card.editing').length, 0);
});

test('losing focus saves at once; an invalid form is not saved, says why, and keeps the editor open', async () => {
    const list = document.getElementById('nd_char_list');
    await openEditor('c1');
    const card = () => list.querySelector('.char-card.editing');
    let before = saves().length;
    typeInto(card().querySelector('.char-edit-appearance'), 'silver hair, blur saved');
    card().querySelector('.char-edit-appearance').dispatchEvent(new window.Event('focusout', { bubbles: true }));
    await flush();
    assert.equal(saves().length, before + 1, 'blur flushes without waiting for the debounce');
    assert.equal(saves().at(-1).characterTags.find(char => char.id === 'c1').appearance, 'silver hair, blur saved');

    before = saves().length;
    typeInto(card().querySelector('.char-edit-name'), '  ');
    await afterDebounce();
    assert.equal(saves().length, before, 'an empty name is never sent');
    assert.equal(statusOf().dataset.state, 'invalid');
    click(card().querySelector('.char-card-summary'));
    await settle();
    assert.ok(card(), 'collapsing is refused while the form cannot be saved');
    typeInto(card().querySelector('.char-edit-name'), '阿璃');
    await closeEditor();
    assert.equal(list.querySelectorAll('.char-card.editing').length, 0);
    assert.equal(saves().at(-1).characterTags.find(char => char.id === 'c1').name, '阿璃', 'once valid again, collapsing saves it');
});

test('a new draft character: saved on the first valid name, dropped when collapsed while blank', async () => {
    const list = document.getElementById('nd_char_list');
    const idsSaved = () => (saves().at(-1)?.characterTags || []).map(char => char.id);
    click(document.getElementById('nd_char_add'));
    await settle();
    const card = () => list.querySelector('.char-card.editing');
    assert.ok(card(), 'a blank editor opens');
    const draftId = card().dataset.id;
    await closeEditor();
    assert.equal(list.querySelector(`.char-card[data-id="${draftId}"]`), null, 'a blank draft is dropped when collapsed');
    assert.ok(!idsSaved().includes(draftId));

    click(document.getElementById('nd_char_add'));
    await settle();
    const id = card().dataset.id;
    const before = saves().length;
    typeInto(card().querySelector('.char-edit-name'), '新角色甲');
    await afterDebounce();
    assert.equal(saves().length, before + 1);
    assert.ok(idsSaved().includes(id), 'the draft became a real character with the first save');
    await closeEditor();
    assert.ok(list.querySelector(`.char-card[data-id="${id}"]`), 'it stays in the list');
});

// Contract: closing with an in-flight save cannot discard a later edit; a
// failed acknowledgement must leave the exact draft available to retry.
for (const viaHost of [false, true]) {
    test(`close waits for the latest acknowledged edit (host request: ${viaHost})`, async () => {
        await bootPage();
        await openEditor('c1');
        const input = document.querySelector('.char-card.editing .char-edit-name');
        const closeCount = () => posted.filter(m => m.type === 'CLOSE').length;
        const before = closeCount();
        deferAck = true;
        typeInto(input, 'first pending value');
        await afterDebounce();
        assert.equal(waitingAcks.length, 1);
        typeInto(input, 'latest value before close');
        const close = () => viaHost ? window.dispatchEvent(Object.assign(new window.Event('message'), {
            origin: window.location.origin, source: window.parent,
            data: { source: 'LittleWhiteBox-NovelDraw', type: 'REQUEST_CLOSE' },
        })) : click(document.getElementById('nd_close'));
        close(); close();
        await flush();
        assert.equal(closeCount(), before);
        acknowledge(waitingAcks.shift());
        await flush();
        assert.equal(waitingAcks.length, 1);
        assert.equal(waitingAcks[0].characterTags.find(c => c.id === 'c1').name, 'latest value before close');
        assert.equal(closeCount(), before);
        acknowledge(waitingAcks.shift());
        await settle();
        assert.equal(closeCount(), before + 1);
        deferAck = false;
    });
}

test('failed close keeps the draft, and retry waits for its own acknowledgement', async () => {
    await bootPage();
    await openEditor('c1');
    const input = document.querySelector('.char-card.editing .char-edit-name');
    const count = () => posted.filter(m => m.type === 'CLOSE').length;
    const before = count();
    deferAck = true;
    typeInto(input, 'retained after failure');
    click(document.getElementById('nd_close'));
    await flush();
    const failed = waitingAcks.shift();
    acknowledge(failed, 'error');
    await flush();
    assert.equal(count(), before);
    assert.equal(input.value, 'retained after failure');
    assert.equal(statusOf().dataset.state, 'error');
    click(document.getElementById('nd_close'));
    await flush();
    acknowledge(failed); // a late receipt cannot release the new save
    await flush();
    assert.equal(count(), before);
    acknowledge(waitingAcks.shift());
    await settle();
    assert.equal(count(), before + 1);
    deferAck = false;
});

// Acceptance: real page controls dispatch the host protocol and settle receipts.
// Cost: inaccessible image deletion/export and silently unsaved JPEG preferences.
test('gallery controls dispatch commands and restore controls from host receipts', async () => {
    const receive = data => window.dispatchEvent(Object.assign(new window.Event('message'), {
        origin: window.location.origin, source: window.parent,
        data: { source: 'LittleWhiteBox-NovelDraw', ...data },
    }));
    receive({ type: 'INIT_DATA', settings: { characterTags: [], characterGroups: [], saveAsJpeg: true, imageTitleMode: 'none' } });
    const jpeg = document.getElementById('nd_save_as_jpeg');
    assert.equal(jpeg.checked, true);
    jpeg.checked = false;
    jpeg.dispatchEvent(new window.Event('change'));
    assert.equal(jpeg.disabled, true);
    assert.equal(posted.at(-1).type, 'SAVE_JPEG');
    assert.equal(posted.at(-1).saveAsJpeg, false);
    receive({ type: 'STATUS', target: 'jpeg', state: 'error', text: '', saveAsJpeg: true });
    assert.equal(jpeg.disabled, false);
    assert.equal(jpeg.checked, true);

    // Explicit refresh must settle only its own receipt; old/background replies
    // cannot report success for a failing refresh (cost: hidden cache-read failure).
    const refresh = document.getElementById('nd_refresh_stats');
    click(refresh);
    const firstRefresh = posted.at(-1);
    assert.equal(firstRefresh.type, 'REFRESH_CACHE_STATS');
    assert.equal(refresh.disabled, true);
    receive({ type: 'CACHE_DATA', ok: true });
    assert.equal(refresh.disabled, true);
    receive({ type: 'CACHE_DATA', requestId: firstRefresh.requestId, ok: false });
    assert.equal(refresh.disabled, false);
    assert.equal(document.getElementById('nd_gallery_notice').dataset.state, 'error');
    click(refresh);
    const secondRefresh = posted.at(-1);
    receive({ type: 'CACHE_DATA', requestId: firstRefresh.requestId, ok: true });
    assert.equal(refresh.disabled, true);
    receive({ type: 'CACHE_DATA', requestId: secondRefresh.requestId, ok: true });
    assert.equal(refresh.disabled, false);
    assert.equal(document.getElementById('nd_gallery_notice').dataset.state, 'success');
    click(document.getElementById('nd_gallery_notice_close'));

    click(document.getElementById('nd_batch'));
    assert.equal(document.getElementById('nd_batch_bar').style.display, 'flex');
    const thumb = document.createElement('div');
    thumb.dataset.imgid = 'selected-image';
    document.getElementById('nd_modal_thumbs').append(thumb);
    click(document.getElementById('nd_batch_select_all'));
    globalThis.confirm = () => true;
    click(document.getElementById('nd_batch_delete'));
    const deletion = posted.at(-1);
    assert.equal(deletion.type, 'BATCH_DELETE');
    assert.deepEqual(deletion.ids, ['selected-image']);
    assert.equal(document.getElementById('nd_batch_delete').disabled, true);
    receive({ type: 'BATCH_DELETED', requestId: deletion.requestId, deletedIds: [], failures: [{ id: 'selected-image', message: 'failure' }] });
    assert.equal(document.getElementById('nd_batch_delete').disabled, false);
    click(document.getElementById('nd_batch_download'));
    const download = posted.at(-1);
    assert.equal(download.type, 'BATCH_DOWNLOAD');
    assert.deepEqual(download.ids, ['selected-image']);
    receive({ type: 'BATCH_DOWNLOADED', requestId: download.requestId, blob: new Blob(['zip']), exportedIds: ['selected-image'], failures: [], remainingIds: [] });
    assert.ok(document.querySelector('#nd_zip_output a[download]'));
    click(document.getElementById('nd_batch_select_none'));
    const count = posted.length;
    click(document.getElementById('nd_batch_delete'));
    assert.equal(posted.length, count);
    click(document.getElementById('nd_batch_done'));
    assert.equal(document.getElementById('nd_batch_bar').style.display, 'none');
    assert.equal(posted.at(-1).type, 'BATCH_CANCEL_EXPORT');
    assert.equal(document.getElementById('nd_zip_output').childElementCount, 0);
});
