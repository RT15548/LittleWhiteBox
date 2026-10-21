import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { parseHTML } from 'linkedom';
import { normalizeAgentConfig } from '../config.js';
import { createAgentSettingsPanel } from '../ui/settings-panel.js';

// Acceptance (persisted configuration): a failed rename must not create a second
// preset on the next save, or discard parameter edits made before/during the save.
function fixture(t, saveRename) {
    const { document, window } = parseHTML(`<html><body>
        <div id="xb-assistant-preset-list"></div>
        <input id="xb-assistant-preset-name" type="hidden">
        <input id="xb-assistant-provider">
        <input id="xb-assistant-model">
        <input id="xb-assistant-api-key">
        <button id="xb-assistant-save"></button>
    </body></html>`);
    const previous = { document: globalThis.document, window: globalThis.window };
    Object.assign(globalThis, { document, window });
    window.prompt = () => 'Renamed';
    const state = { config: normalizeAgentConfig({
        currentPresetName: 'A', delegatePresetName: 'A',
        presets: { A: {}, B: {} },
    }) };
    const saves = [];
    const panel = createAgentSettingsPanel({
        state, presetLayout: 'list',
        saveConfig(request) {
            saves.push(structuredClone(request.payload));
            return saves.length === 1 ? saveRename() : { ok: true };
        },
    });
    t.after(() => { panel.destroy(); Object.assign(globalThis, previous); });
    panel.syncConfigToForm(document.body);
    panel.bindSettingsPanelEvents(document.body);
    const click = selector => document.querySelector(selector).dispatchEvent(new window.Event('click', { bubbles: true }));
    const edit = value => {
        const input = document.querySelector('#xb-assistant-model');
        input.value = value;
        input.dispatchEvent(new window.Event('input'));
    };
    return {
        state, saves, edit,
        rename: () => click('[data-preset-name="A"] [data-preset-action="rename"]'),
        save: () => click('#xb-assistant-save'),
        name: () => document.querySelector('#xb-assistant-preset-name').value,
    };
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
