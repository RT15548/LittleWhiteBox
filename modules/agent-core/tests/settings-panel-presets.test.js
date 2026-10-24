import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { parseHTML } from 'linkedom';
import { reactive } from 'vue';
import { normalizeAgentConfig } from '../config.js';
import { createAgentSettingsPanel } from '../ui/settings-panel.js';
import { createPresetListKit } from '../../draw/shared/preset-list-kit.js';

// Acceptance (lost configuration / edits): both layouts reject name collisions;
// cancellation writes nothing; failed changes never alter the next save; confirmed
// changes preserve newer parameter drafts and remap main/delegate references.
function fixture(t, saveRename, layout = 'list', wrapState = value => value) {
    const { document, window } = parseHTML(`<html><body>
        <button id="xb-assistant-preset-collapse"></button>
        <div id="xb-assistant-preset-list"></div>
        ${layout === 'select' ? '<input id="xb-assistant-preset-select">' : ''}
        <input id="xb-assistant-preset-name" type="hidden">
        <input id="xb-assistant-provider">
        <input id="xb-assistant-model">
        <input id="xb-assistant-api-key">
        <input id="xb-assistant-web-provider">
        <button id="xb-assistant-save"></button>
        <button id="xb-assistant-new-preset"></button>
        <button id="xb-assistant-rename-preset"></button>
        <button id="xb-assistant-delete-preset"></button>
    </body></html>`);
    const previous = { document: globalThis.document, window: globalThis.window };
    Object.assign(globalThis, { document, window });
    window.prompt = () => 'Renamed';
    window.confirm = () => true;
    const storage = new Map();
    window.localStorage = { getItem: key => (storage.has(key) ? storage.get(key) : null), setItem: (key, value) => storage.set(key, String(value)) };
    const state = wrapState({ config: normalizeAgentConfig({
        currentPresetName: 'A', delegatePresetName: 'A',
        webProvider: 'tavily',
        presets: { A: {}, B: {} },
    }) });
    const saves = [];
    const requests = [];
    const presetListKit = createPresetListKit();
    const panel = createAgentSettingsPanel({
        state, presetLayout: layout, presetListKit: layout === 'list' ? presetListKit : null,
        render: () => panel.syncConfigToForm(document.body),
        saveConfig(request) {
            requests.push(request);
            saves.push(structuredClone(request.payload));
            return saves.length === 1 ? saveRename() : { ok: true };
        },
    });
    t.after(() => { panel.destroy(); presetListKit.destroy(); Object.assign(globalThis, previous); });
    panel.syncConfigToForm(document.body);
    panel.bindSettingsPanelEvents(document.body);
    const click = selector => document.querySelector(selector).dispatchEvent(new window.Event('click', { bubbles: true }));
    const edit = value => {
        const input = document.querySelector('#xb-assistant-model');
        input.value = value;
        input.dispatchEvent(new window.Event('input'));
    };
    return {
        state, saves, requests, edit, panel, window, document, storage,
        change(id, value) {
            const input = document.getElementById(id);
            input.value = value;
            input.dispatchEvent(new window.Event('change'));
        },
        // 列表布局：在 A 行的名称输入框里改名（值取自 window.prompt 桩），下拉框布局仍点重命名按钮
        rename: () => {
            if (layout !== 'list') { click('#xb-assistant-rename-preset'); return; }
            const input = document.querySelector('.preset-row[data-preset-id="A"] .preset-row-name');
            input.dispatchEvent(new window.Event('focusin', { bubbles: true }));
            input.value = window.prompt();
            input.dispatchEvent(new window.Event('focusout', { bubbles: true }));
        },
        delete: () => click(layout === 'list' ? '[data-preset-action="delete"][data-preset-id="A"]' : '#xb-assistant-delete-preset'),
        create: () => click('#xb-assistant-new-preset'),
        save: () => click('#xb-assistant-save'),
        name: () => document.querySelector('#xb-assistant-preset-name').value,
    };
}

for (const layout of ['list', 'select']) {
    test(`${layout}: rename and create reject existing names without any write`, async t => {
        const h = fixture(t, () => ({ ok: true }), layout);
        h.window.prompt = () => 'B';
        h.rename(); h.create();
        await nextTurn();
        assert.equal(h.saves.length, 0);
        assert.deepEqual(Object.keys(h.state.config.presets), ['A', 'B']);
        assert.equal(h.name(), 'A');
        if (layout === 'list') assert.equal(h.document.querySelector('.preset-row[data-preset-id="A"] .preset-row-name').value, 'A', '重名被拒：输入框还原');
    });

    test(`${layout}: cancelling deletion does not change config or submit`, t => {
        const h = fixture(t, () => ({ ok: true }), layout);
        h.window.confirm = () => false;
        h.delete();
        assert.equal(h.saves.length, 0);
        assert.deepEqual(Object.keys(h.state.config.presets), ['A', 'B']);
    });

    for (const operation of ['rename', 'delete', 'create']) {
        for (const ok of [true, false]) {
            test(`${layout}: ${operation} ${ok ? 'success' : 'failure'} waits for matching host receipt`, async t => {
                const h = fixture(t, () => undefined, layout);
                h.edit('draft-before-save');
                h[operation]();
                assert.deepEqual(Object.keys(h.state.config.presets), ['A', 'B']);
                h.edit('draft-during-save');
                assert.equal(h.panel.completePresetSave('other-request', { ok: true }), false);
                const receipt = { ok, config: h.saves[0] };
                assert.equal(h.panel.completePresetSave(h.requests[0].requestId, receipt), true);
                assert.equal(h.panel.completePresetSave(h.requests[0].requestId, receipt), false);
                await nextTurn();
                h.save();
                const persisted = h.saves[1];
                if (!ok) {
                    assert.deepEqual(Object.keys(persisted.presets), ['A', 'B']);
                    assert.equal(persisted.currentPresetName, 'A');
                    assert.equal(persisted.presets.A.modelConfigs['openai-compatible'].model, 'draft-during-save');
                } else if (operation === 'rename') {
                    assert.deepEqual(Object.keys(persisted.presets), ['Renamed', 'B']);
                    assert.equal(persisted.delegatePresetName, 'Renamed');
                    assert.equal(persisted.presets.Renamed.modelConfigs['openai-compatible'].model, 'draft-during-save');
                } else if (operation === 'delete') {
                    assert.deepEqual(Object.keys(persisted.presets), ['B']);
                    assert.equal(persisted.currentPresetName, 'B');
                    assert.equal(persisted.delegatePresetName, 'B');
                } else {
                    assert.deepEqual(Object.keys(persisted.presets), ['A', 'Renamed', 'B']);
                    assert.equal(persisted.currentPresetName, 'Renamed');
                    assert.equal(h.saves[0].presets.Renamed.modelConfigs['openai-compatible'].model, 'draft-before-save');
                    assert.equal(persisted.presets.Renamed.modelConfigs['openai-compatible'].model, 'draft-during-save');
                }
            });
        }
    }
}

// Acceptance (unintended configuration writes): selecting a preset and then
// renaming it must not persist unsaved global fields, including with Vue state.
for (const [kind, wrapState] of [['plain', value => value], ['reactive', reactive]]) {
    test(`${kind}: rename after selection keeps unsaved globals outside persistence`, async t => {
        const h = fixture(t, () => undefined, 'select', wrapState);
        h.change('xb-assistant-web-provider', 'exa');
        h.change('xb-assistant-preset-select', 'B');
        h.rename();
        assert.equal(h.saves[0].webProvider, 'tavily');
        assert.equal(h.saves[0].currentPresetName, 'A');
        h.panel.completePresetSave(h.requests[0].requestId, { ok: true, config: h.saves[0] });
        await nextTurn();
        assert.equal(h.state.configDraft.webProvider, 'exa');
        assert.equal(h.state.configDirty, true);
        h.save();
        assert.equal(h.saves[1].webProvider, 'exa');
        assert.equal(h.saves[1].currentPresetName, 'Renamed');
    });
}

for (const [failure, saveRename] of [
    ['negative receipt', () => ({ ok: false })],
    ['synchronous throw', () => { throw new Error('save failed'); }],
    ['rejection', () => Promise.reject(new Error('save failed'))],
]) {
    test(`failed rename (${failure}) restores the name used by the next save`, async t => {
        const h = fixture(t, saveRename);
        h.edit('unsaved-model');
        h.rename();
        await nextTurn();
        assert.equal(h.name(), 'A');
        assert.equal(h.state.configDraft.currentPresetName, 'A');
        assert.equal(h.state.configDraft.delegatePresetName, 'A');
        h.save();
        assert.deepEqual(Object.keys(h.saves[1].presets), ['A', 'B']);
        assert.equal(h.saves[1].currentPresetName, 'A');
        assert.equal(h.saves[1].presets.A.modelConfigs['openai-compatible'].model, 'unsaved-model');
    });
}

test('rename failure preserves edits made while persistence was pending', async t => {
    const pending = Promise.withResolvers();
    const h = fixture(t, () => pending.promise);
    h.rename();
    h.edit('edited-during-save');
    pending.resolve({ ok: false });
    await nextTurn();
    assert.equal(h.name(), 'A');
    assert.equal(h.state.configDraft.currentPresetName, 'A');
    assert.equal(h.state.configDraft.delegatePresetName, 'A');
    h.save();
    assert.deepEqual(Object.keys(h.saves[1].presets), ['A', 'B']);
    assert.equal(h.saves[1].presets.A.modelConfigs['openai-compatible'].model, 'edited-during-save');
});

test('successful rename keeps the new name on the next save', async t => {
    const h = fixture(t, () => ({ ok: true }));
    h.rename();
    await nextTurn();
    h.save();
    assert.deepEqual(Object.keys(h.saves[1].presets), ['Renamed', 'B']);
    assert.equal(h.saves[1].currentPresetName, 'Renamed');
});

// Acceptance (the list must be reorderable and collapsible like the draw-params list, and a reorder must reach disk in
// the same transactional way as every other preset change): shared preset-list view, order = key order of `presets`.
const rowNames = document => Array.from(document.querySelectorAll('#xb-assistant-preset-list .preset-row')).map(row => row.dataset.presetId);
const pressOnHandle = (h, name, key) => {
    const handle = h.document.querySelector(`.preset-row[data-preset-id="${name}"] [data-preset-drag]`);
    const event = new h.window.Event('keydown', { bubbles: true, cancelable: true });
    event.key = key;
    handle.dispatchEvent(event);
    return event;
};

test('list: rows follow the config order with the current preset marked; picking a row switches the preset', async t => {
    const h = fixture(t, () => ({ ok: true }));
    assert.deepEqual(rowNames(h.document), ['A', 'B']);
    assert.equal(h.document.querySelector('.preset-row.selected').dataset.presetId, 'A');
    h.document.querySelector('.preset-row[data-preset-id="B"]').dispatchEvent(new h.window.Event('click', { bubbles: true }));
    assert.equal(h.document.querySelector('.preset-row.selected').dataset.presetId, 'B');
    assert.equal(h.state.config.currentPresetName, 'B');
    assert.equal(h.saves.length, 0); // 点选只切换表单，不落盘
});

test('list: the collapse button shows only the current preset (no drag handle) and the choice is remembered', t => {
    const h = fixture(t, () => ({ ok: true }));
    const toggle = h.document.querySelector('#xb-assistant-preset-collapse');
    assert.ok(h.document.querySelector('[data-preset-drag]'));
    toggle.dispatchEvent(new h.window.Event('click', { bubbles: true }));
    assert.deepEqual(rowNames(h.document), ['A']);
    assert.equal(h.document.querySelector('[data-preset-drag]'), null);
    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(h.storage.get('xb-draw-list-collapsed:agent-presets'), '1');
    toggle.dispatchEvent(new h.window.Event('click', { bubbles: true }));
    assert.deepEqual(rowNames(h.document), ['A', 'B']);
    assert.equal(toggle.getAttribute('aria-expanded'), 'true');
    assert.equal(h.storage.get('xb-draw-list-collapsed:agent-presets'), '0');
});

test('list: keyboard Down on a handle saves the new key order and the rows follow only after the host receipt', async t => {
    const h = fixture(t, () => undefined);
    assert.equal(pressOnHandle(h, 'A', 'ArrowDown').defaultPrevented, true);
    assert.equal(h.saves.length, 1);
    assert.deepEqual(Object.keys(h.saves[0].presets), ['B', 'A']);
    assert.equal(h.saves[0].currentPresetName, 'A');
    assert.deepEqual(rowNames(h.document), ['A', 'B']); // 回执前不改变预设表
    h.panel.completePresetSave(h.requests[0].requestId, { ok: true, config: h.saves[0] });
    await nextTurn();
    assert.deepEqual(h.state.config.presetNames, ['B', 'A']);
    assert.deepEqual(rowNames(h.document), ['B', 'A']);
    h.save();
    assert.deepEqual(Object.keys(h.saves[1].presets), ['B', 'A']);
});

test('list: a failed reorder leaves rows and the next save in the old order; moving past the edge does nothing', async t => {
    const h = fixture(t, () => undefined);
    pressOnHandle(h, 'A', 'ArrowDown');
    h.panel.completePresetSave(h.requests[0].requestId, { ok: false });
    await nextTurn();
    assert.deepEqual(rowNames(h.document), ['A', 'B']);
    pressOnHandle(h, 'A', 'ArrowUp'); // 已在最前
    pressOnHandle(h, 'B', 'ArrowDown'); // 已在最后
    assert.equal(h.saves.length, 1);
    h.save();
    assert.deepEqual(Object.keys(h.saves[1].presets), ['A', 'B']);
});

test('list: reordering is refused while another preset change is still pending', t => {
    const h = fixture(t, () => undefined);
    pressOnHandle(h, 'A', 'ArrowDown');
    pressOnHandle(h, 'B', 'ArrowUp');
    assert.equal(h.saves.length, 1);
});
