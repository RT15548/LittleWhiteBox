import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { createApiPresetPage } from '../api-preset-page.js';

// Acceptance: failed saves must not replace credentials or presets; concurrent
// saves share one gate; a late receipt must not overwrite a reopened form.
// These are persisted-configuration/data-loss boundaries, not UI-copy assertions.
function fixture(t, persistResult) {
    const normalizeConfig = (raw = {}) => ({ host: String(raw.host || '').trim(), auth: String(raw.auth || '').trim() });
    const initial = {
        host: 'https://before.invalid', auth: 'before-key', unrelated: 7,
        activeApiPresetId: 'one',
        apiPresets: [{ id: 'one', name: 'One', config: { host: 'https://before.invalid', auth: 'before-key' } }],
    };
    let settings = structuredClone(initial), document, formConfig, writes = 0;
    const filled = [];
    const open = () => {
        ({ document } = parseHTML('<html><body><section id="api"><div id="presets"></div><fieldset id="form"></fieldset></section></body></html>'));
        formConfig = { host: 'https://edited.invalid', auth: 'edited-key' };
    };
    open();
    const page = createApiPresetPage({
        presetOptions: { fields: ['host', 'auth'], normalizeConfig },
        getSettings: () => settings,
        getSettingsDocument: () => document,
        querySettings: selector => document.querySelector(selector),
        containerSelector: '#presets', panelSelector: '#api', formSelector: '#form',
        readConfig: () => ({ ...formConfig }),
        fillConfig: config => { formConfig = { ...config }; filled.push(config); },
        persist: async mutator => {
            writes++;
            const draft = structuredClone(settings);
            mutator(draft);
            if (!await persistResult()) return false;
            settings = draft;
            return true;
        },
    });
    t.after(() => page.destroy());
    return {
        page, initial, filled, open,
        settings: () => settings, form: () => document.querySelector('#form'),
        config: () => formConfig, writes: () => writes,
    };
}

test('a failed API save keeps the active credentials and preset unchanged', async t => {
    const h = fixture(t, async () => false);
    assert.equal(await h.page.save(), false);
    assert.deepEqual(h.settings(), h.initial);
    assert.deepEqual(h.filled, []);
    assert.equal(h.config().auth, 'edited-key');
    assert.equal(h.form().hasAttribute('disabled'), false);
});

test('API preset and general saves share a gate and commit the config and preset together', async t => {
    const pending = Promise.withResolvers();
    const h = fixture(t, () => pending.promise);
    t.after(() => pending.resolve(false));
    const saving = h.page.save();
    assert.equal(h.form().hasAttribute('disabled'), true);
    assert.deepEqual(h.settings(), h.initial);
    let unrelatedSave = false;
    assert.equal(await h.page.runSave(() => { unrelatedSave = true; return true; }), false);
    assert.equal(await h.page.save(), false);
    assert.equal(unrelatedSave, false);
    assert.equal(h.writes(), 1);
    pending.resolve(true);
    assert.equal(await saving, true);
    assert.equal(h.settings().auth, 'edited-key');
    assert.equal(h.settings().apiPresets[0].config.auth, 'edited-key');
    assert.equal(h.settings().unrelated, 7);
    assert.deepEqual(h.filled, [{ host: 'https://edited.invalid', auth: 'edited-key' }]);
    assert.equal(h.form().hasAttribute('disabled'), false);
});

test('a late API save receipt cannot refill a newly opened settings document', async t => {
    const pending = Promise.withResolvers();
    const h = fixture(t, () => pending.promise);
    t.after(() => pending.resolve(false));
    const saving = h.page.save();
    h.page.destroy();
    h.open();
    h.page.ensureBar();
    pending.resolve(true);
    assert.equal(await saving, true);
    assert.deepEqual(h.filled, []);
    assert.equal(h.form().hasAttribute('disabled'), false);
});
