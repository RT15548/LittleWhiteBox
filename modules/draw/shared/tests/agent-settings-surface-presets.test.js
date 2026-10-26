import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { parseHTML } from 'linkedom';
import { buildDrawAgentSettingsSurfaceMarkup, createDrawAgentSettingsSurface } from '../agent-settings-surface.js';
import { buildAgentSettingsPanelMarkup } from '../../../agent-core/ui/settings-markup.js';

// Product contract from 4bec3cc5: drawing uses the repository-wide Agent API
// dropdown and actions, not the drawable parameter presets' sortable list.
test('drawing Agent API uses the same preset dropdown and actions as the shared panel', () => {
    const { document } = parseHTML(`<html><body>${buildDrawAgentSettingsSurfaceMarkup({})}</body></html>`);
    const shared = parseHTML(`<html><body>${buildAgentSettingsPanelMarkup({ showAssistantPermissions: false, showDelegateSettings: false, canDeletePreset: false })}</body></html>`).document;
    assert.equal(document.querySelector('.xb-assistant-preset-row').outerHTML,
        shared.querySelector('.xb-assistant-preset-row').outerHTML);
    assert.equal(document.querySelector('#xb-assistant-preset-select').tagName, 'SELECT');
    assert.equal(document.querySelector('#xb-assistant-preset-list'), null);
    assert.equal(document.querySelector('#xb-assistant-preset-collapse'), null);
    for (const action of ['new-preset', 'rename-preset', 'save', 'delete-preset']) {
        assert.ok(document.querySelector(`#xb-assistant-${action}`));
    }
});

// Acceptance (lost configuration / edits): a completed preset operation with no
// remaining edits resumes shared-config refresh, so the next save keeps presets
// added elsewhere. Genuine unsaved inputs survive receipts and block refresh.
for (const [operation, editing] of [
    ['rename', 'none'], ['create', 'none'], ['delete', 'none'],
    ['rename', 'before'], ['rename', 'during'], ['create', 'during'],
    ['rename', 'reverted'], ['rename', 'sampling'], ['rename', 'sampling-disabled'],
]) {
    test(`${operation}, edits=${editing}: preserve drafts without blocking a clean refresh`, async t => {
        const { document, window } = parseHTML('<html><body><div id="root"></div></body></html>');
        const prototype = window.HTMLSelectElement.prototype;
        const originalValue = Object.getOwnPropertyDescriptor(prototype, 'value');
        Object.defineProperty(prototype, 'value', {
            configurable: true,
            get() { return this.querySelector('option[selected]')?.value || ''; },
            set(value) { this.querySelectorAll('option').forEach(option => option.toggleAttribute('selected', option.value === String(value))); },
        });
        const originals = Object.fromEntries(['document', 'window', 'CustomEvent'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
        Object.assign(globalThis, { document, window, CustomEvent: window.CustomEvent });
        window.prompt = () => 'C';
        window.confirm = () => true;
        let stored = { currentPresetName: 'A', presets: {
            A: { provider: 'openai-compatible', modelConfigs: { 'openai-compatible': { model: 'saved' } } },
            B: {},
        } };
        let loads = 0;
        let finishSave;
        let submitted;
        const root = document.getElementById('root');
        const surface = createDrawAgentSettingsSurface({
            getRoot: () => root,
            loadSettings: async () => { loads += 1; return stored; },
            saveSettings: patch => new Promise(resolve => {
                submitted = structuredClone(patch);
                finishSave = () => { stored = patch; resolve({ ok: true, config: patch }); };
            }),
        });
        t.after(() => {
            surface.destroy();
            Object.defineProperty(prototype, 'value', originalValue);
            for (const [key, descriptor] of Object.entries(originals)) {
                if (descriptor) Object.defineProperty(globalThis, key, descriptor);
                else delete globalThis[key];
            }
        });
        const click = selector => root.querySelector(selector).dispatchEvent(new window.Event('click', { bubbles: true }));
        const edit = value => {
            const input = root.querySelector('#xb-assistant-model');
            input.value = value;
            input.dispatchEvent(new window.Event('input', { bubbles: true }));
        };
        await surface.refresh();
        if (editing === 'before') edit('unsaved');
        assert.equal(root.querySelector('#xb-assistant-preset-select').tagName, 'SELECT');
        assert.deepEqual(Array.from(root.querySelectorAll('#xb-assistant-preset-select option')).map(option => option.value), ['A', 'B']);
        assert.equal(root.querySelector('#xb-assistant-preset-list'), null);
        click({
            rename: '#xb-assistant-rename-preset',
            create: '#xb-assistant-new-preset',
            delete: '#xb-assistant-delete-preset',
        }[operation]);
        if (editing === 'during' || editing === 'reverted') edit('unsaved');
        if (editing === 'reverted') edit('saved');
        if (editing.startsWith('sampling')) {
            const toggle = root.querySelector('#xb-assistant-topP-enabled');
            const input = root.querySelector('#xb-assistant-topP');
            toggle.checked = true;
            toggle.dispatchEvent(new window.Event('change', { bubbles: true }));
            input.value = '0.7';
            input.dispatchEvent(new window.Event('input', { bubbles: true }));
            if (editing === 'sampling-disabled') {
                toggle.checked = false;
                toggle.dispatchEvent(new window.Event('change', { bubbles: true }));
            }
        }
        finishSave();
        await nextTurn();
        const dirty = editing !== 'none' && editing !== 'reverted';
        assert.equal(surface.getState().configDirty, dirty);
        assert.deepEqual(stored, submitted);
        stored = { ...stored, presets: { ...stored.presets, D: {} } };
        await surface.refresh({ background: true });
        assert.equal(loads, dirty ? 1 : 2);
        if (dirty) {
            if (editing.startsWith('sampling')) {
                assert.deepEqual(surface.getState().configDraft.sampling.topP, { enabled: editing === 'sampling', value: 0.7 });
            } else {
                assert.equal(surface.getState().configDraft.model, 'unsaved');
                assert.equal(root.querySelector('#xb-assistant-model').value, 'unsaved');
            }
        } else {
            assert.ok(surface.getState().config.presets.D);
            click('#xb-assistant-save');
            finishSave();
            await nextTurn();
            assert.ok(stored.presets.D);
        }
    });
}
