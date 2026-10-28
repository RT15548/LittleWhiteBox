import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { parseHTML } from 'linkedom';
import { createApiPresetBar } from '../api-presets-ui.js';

// Acceptance: the API config presets use the same shared list as the draw-params presets - draggable / keyboard-sortable,
// collapsible to the current one - and every change (including the order) goes out through one commit that the host
// persists; a failed commit must leave the list and the active credentials exactly as they were.
const FIELDS = ['host', 'auth'];
const PRESETS = [
    { id: 'one', name: 'One', config: { host: 'h1', auth: 'k1' } },
    { id: 'two', name: 'Two', config: { host: 'h2', auth: 'k2' } },
    { id: 'three', name: 'Three', config: { host: 'h3', auth: 'k3' } },
];

function fixture(t, { active = 'one', commitResult = () => true, confirm = () => true, prompt = () => 'Renamed' } = {}) {
    const { document, window } = parseHTML('<html><body><fieldset id="form"><div id="presets"></div></fieldset></body></html>');
    const storage = new Map();
    window.localStorage = { getItem: key => (storage.has(key) ? storage.get(key) : null), setItem: (key, value) => storage.set(key, String(value)) };
    const state = { apiPresets: structuredClone(PRESETS), activeApiPresetId: active };
    const commits = [];
    const prompts = [];
    const confirms = [];
    const bar = createApiPresetBar({
        document,
        container: document.querySelector('#presets'),
        form: document.querySelector('#form'),
        fields: FIELDS,
        defaults: { host: '', auth: '' },
        getState: () => state,
        readConfig: () => ({ ...state.apiPresets.find(preset => preset.id === state.activeApiPresetId).config }),
        getEffectiveConfig: () => ({ ...state.apiPresets.find(preset => preset.id === state.activeApiPresetId).config }),
        onCommit: async (change) => {
            commits.push(structuredClone(change));
            const ok = await commitResult(change);
            if (ok) {
                state.apiPresets = change.apiPresets;
                state.activeApiPresetId = change.activeApiPresetId;
            }
            return ok;
        },
        confirm: (message) => { confirms.push(message); return confirm(message); },
        prompt: (message, fallback) => { prompts.push([message, fallback]); return prompt(message, fallback); },
    });
    t.after(() => bar.destroy());
    const rows = () => Array.from(document.querySelectorAll('.preset-row'));
    const ids = () => rows().map(row => row.dataset.presetId);
    const click = node => node.dispatchEvent(new window.Event('click', { bubbles: true }));
    const rowButton = (id, selector) => document.querySelector(`.preset-row[data-preset-id="${id}"] ${selector}`);
    const row = id => document.querySelector(`.preset-row[data-preset-id="${id}"]`);
    // 在某一行的名称输入框里改名：聚焦、改字、离开
    const rename = (id, value) => {
        const input = rowButton(id, '.preset-row-name');
        input.dispatchEvent(new window.Event('focusin', { bubbles: true }));
        input.value = value;
        input.dispatchEvent(new window.Event('focusout', { bubbles: true }));
        return input;
    };
    const press = (id, key) => {
        const event = new window.Event('keydown', { bubbles: true, cancelable: true });
        event.key = key;
        rowButton(id, '[data-preset-drag]').dispatchEvent(event);
        return event;
    };
    return { bar, document, window, state, commits, prompts, confirms, storage, rows, ids, click, rowButton, row, rename, press };
}

test('renders the presets as a list in saved order with the active one marked, plus the header buttons and a collapse toggle', t => {
    const h = fixture(t, { active: 'two' });
    assert.deepEqual(h.ids(), ['one', 'two', 'three']);
    assert.equal(h.document.querySelector('.preset-row.selected').dataset.presetId, 'two');
    assert.ok(h.document.querySelector('[data-preset-drag]'));
    assert.ok(h.document.querySelector('[data-action="save-as"]'));
    assert.ok(h.document.querySelector('[data-action="overwrite"]'));
    assert.ok(h.document.querySelector('.preset-list-toggle'));
    assert.equal(h.document.querySelector('select'), null);
    // 行菜单只有删除（改名在名称输入框里；另存为 / 覆盖保存在标题行）
    assert.deepEqual(
        Array.from(h.rowButton('one', '.char-menu').querySelectorAll('[role="menuitem"]')).map(item => item.dataset.presetAction),
        ['delete'],
    );
});

test('keyboard Down / Up on a handle commits the new array order only; the active preset and the form config are untouched', async t => {
    const h = fixture(t);
    assert.equal(h.press('one', 'ArrowDown').defaultPrevented, true);
    await nextTurn();
    assert.equal(h.commits.length, 1);
    const [commit] = h.commits;
    assert.equal(commit.reason, 'reorder');
    assert.deepEqual(commit.apiPresets.map(preset => preset.id), ['two', 'one', 'three']);
    assert.equal(commit.activeApiPresetId, 'one');
    assert.equal(commit.config, null);
    // 排序不改任何预设的内容
    assert.deepEqual(commit.apiPresets.find(preset => preset.id === 'one'), PRESETS[0]);
    assert.deepEqual(h.ids(), ['two', 'one', 'three']);
    assert.equal(h.document.querySelector('.preset-row.selected').dataset.presetId, 'one');

    h.press('three', 'ArrowUp');
    await nextTurn();
    assert.deepEqual(h.state.apiPresets.map(preset => preset.id), ['two', 'three', 'one']);
    assert.deepEqual(h.ids(), ['two', 'three', 'one']);
    // 到边界不再提交
    h.press('two', 'ArrowUp');
    await nextTurn();
    assert.equal(h.commits.length, 2);
});

test('a failed reorder leaves the list and the stored order unchanged', async t => {
    const h = fixture(t, { commitResult: () => false });
    h.press('one', 'ArrowDown');
    await nextTurn();
    assert.equal(h.commits.length, 1);
    assert.deepEqual(h.ids(), ['one', 'two', 'three']);
    assert.deepEqual(h.state.apiPresets.map(preset => preset.id), ['one', 'two', 'three']);
    assert.equal(h.document.querySelector('[role="status"]').dataset.state, 'error');
});

test('no second change is accepted while one is still being saved', async t => {
    const pending = Promise.withResolvers();
    const h = fixture(t, { commitResult: () => pending.promise });
    h.press('one', 'ArrowDown');
    h.press('two', 'ArrowDown');
    h.click(h.row('two'));
    h.rename('three', 'Busy');
    h.click(h.document.querySelector('[data-action="save-as"]'));
    assert.equal(h.commits.length, 1);
    assert.equal(h.document.querySelector('#form').hasAttribute('disabled'), true);
    pending.resolve(true);
    await nextTurn();
    assert.equal(h.document.querySelector('#form').hasAttribute('disabled'), false);
});

test('the collapse button shows only the current preset without drag handles, and the choice is remembered', t => {
    const h = fixture(t, { active: 'two' });
    const toggle = h.document.querySelector('.preset-list-toggle');
    h.click(toggle);
    assert.deepEqual(h.ids(), ['two']);
    assert.equal(h.document.querySelector('[data-preset-drag]'), null);
    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(h.storage.get('xb-draw-list-collapsed:api-presets'), '1');
    // 折叠时行菜单仍可用（删除当前项）
    assert.ok(h.rowButton('two', '[data-preset-action="delete"]'));
    h.click(toggle);
    assert.deepEqual(h.ids(), ['one', 'two', 'three']);
    assert.equal(h.storage.get('xb-draw-list-collapsed:api-presets'), '0');
});

test('picking another row selects that preset and applies its config in one commit; picking the active row does nothing', async t => {
    const h = fixture(t);
    h.click(h.row('one'));
    await nextTurn();
    assert.equal(h.commits.length, 0);
    h.click(h.rowButton('three', '.preset-row-name'));
    await nextTurn();
    assert.equal(h.commits.length, 0, '点名称是改名，不切换');
    h.click(h.row('three'));
    await nextTurn();
    assert.equal(h.commits.length, 1);
    assert.equal(h.commits[0].reason, 'select');
    assert.equal(h.commits[0].activeApiPresetId, 'three');
    assert.deepEqual(h.commits[0].config, { host: 'h3', auth: 'k3' });
    assert.equal(h.document.querySelector('.preset-row.selected').dataset.presetId, 'three');
});

test('renaming in place renames that row (not the active one) without touching the active preset or the form', async t => {
    const h = fixture(t);
    h.rename('three', '  Renamed ');
    await nextTurn();
    assert.deepEqual(h.prompts, [], '不再弹 prompt');
    assert.equal(h.commits.length, 1);
    assert.equal(h.commits[0].reason, 'rename');
    assert.equal(h.commits[0].activeApiPresetId, 'one');
    assert.equal(h.commits[0].config, null);
    assert.deepEqual(h.commits[0].apiPresets.map(preset => preset.name), ['One', 'Two', 'Renamed']);
    assert.equal(h.rowButton('three', '.preset-row-name').value, 'Renamed');
});

test('a duplicate, empty or unchanged name, or a failed commit, puts the old name back', async t => {
    const h = fixture(t);
    h.rename('two', 'One');
    await nextTurn();
    assert.equal(h.rowButton('two', '.preset-row-name').value, 'Two', '重名被拒：重绘回原名');
    assert.equal(h.document.querySelector('[role="status"]').dataset.state, 'error');
    assert.equal(h.rename('two', '   ').value, 'Two');
    assert.equal(h.rename('two', 'Two').value, 'Two');
    await nextTurn();
    assert.equal(h.commits.length, 0);

    const failing = fixture(t, { commitResult: () => false });
    failing.rename('two', 'Nope');
    await nextTurn();
    assert.equal(failing.commits.length, 1);
    assert.equal(failing.rowButton('two', '.preset-row-name').value, 'Two', '保存失败：列表回到原名');
});

test('deleting a non-active row keeps the active preset and form; deleting the active row switches to its neighbour with that config', async t => {
    const h = fixture(t);
    h.click(h.rowButton('three', '[data-preset-action="delete"]'));
    await nextTurn();
    assert.deepEqual(h.confirms, ['删除 API 预设「Three」？']);
    assert.equal(h.commits[0].reason, 'delete');
    assert.equal(h.commits[0].activeApiPresetId, 'one');
    assert.equal(h.commits[0].config, null);
    assert.deepEqual(h.ids(), ['one', 'two']);

    h.click(h.rowButton('one', '[data-preset-action="delete"]'));
    await nextTurn();
    assert.equal(h.commits[1].activeApiPresetId, 'two');
    assert.deepEqual(h.commits[1].config, { host: 'h2', auth: 'k2' });
    assert.deepEqual(h.ids(), ['two']);

    // 只剩一条：不提交，给出提示
    h.click(h.rowButton('two', '[data-preset-action="delete"]'));
    await nextTurn();
    assert.equal(h.commits.length, 2);
});

test('cancelling a delete writes nothing', async t => {
    const h = fixture(t, { confirm: () => false });
    h.click(h.rowButton('two', '[data-preset-action="delete"]'));
    await nextTurn();
    assert.equal(h.commits.length, 0);
    assert.deepEqual(h.ids(), ['one', 'two', 'three']);
});
