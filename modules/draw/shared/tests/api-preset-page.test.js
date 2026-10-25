import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { parseHTML } from 'linkedom';
import { createApiPresetPage } from '../api-preset-page.js';
import { normalizeApiPresetState } from '../api-presets.js';

// Acceptance: failed saves must not replace credentials or presets; concurrent
// saves share one gate; a late receipt must not overwrite a reopened form.
// These are persisted-configuration/data-loss boundaries, not UI-copy assertions.
// Rename must preserve credentials; delete must commit the replacement selection
// and credentials together, or leave both unchanged on failure (data-loss boundary).
function fixture(t, persistResult, { initialSettings, prompt, confirm } = {}) {
    const normalizeConfig = (raw = {}) => ({ host: String(raw.host || '').trim(), auth: String(raw.auth || '').trim() });
    const initial = initialSettings || {
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
        prompt, confirm,
    });
    t.after(() => page.destroy());
    return {
        page, initial, filled, open,
        settings: () => settings, form: () => document.querySelector('#form'),
        config: () => formConfig, writes: () => writes,
        click: async (action, value) => {
            page.ensureBar();
            if (action === 'rename') {
                // 改名是第一行（= 当前预设）名称输入框里的就地编辑：聚焦、改字、离开
                const input = document.querySelector('.preset-row .preset-row-name');
                const fire = type => input.dispatchEvent(new document.defaultView.Event(type, { bubbles: true }));
                fire('focusin');
                input.value = value;
                fire('focusout');
            } else {
                // 删除是预设行“…”菜单里的项（第一行 = 当前预设），其余是标题行按钮
                document.querySelector(action === 'delete' ? '[data-preset-action="delete"]' : `[data-action="${action}"]`).click();
            }
            await nextTurn();
        },
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

for (const success of [true, false]) {
    test(`renaming a migrated preset ${success ? 'persists its name' : 'rolls back'} without changing credentials`, async t => {
        const legacy = { host: 'https://legacy.invalid', auth: 'legacy-key' };
        const initialSettings = { ...legacy, ...normalizeApiPresetState(legacy, { fields: ['host', 'auth'] }) };
        const h = fixture(t, async () => success, { initialSettings });
        await h.click('rename', 'Renamed');
        assert.equal(h.settings().apiPresets.length, 1);
        assert.equal(h.settings().activeApiPresetId, initialSettings.activeApiPresetId);
        assert.equal(h.settings().apiPresets[0].name, success ? 'Renamed' : initialSettings.apiPresets[0].name);
        assert.equal(h.settings().auth, legacy.auth);
        assert.deepEqual(h.settings().apiPresets[0].config, legacy);
        assert.equal(h.filled.length, 0);
        if (!success) assert.deepEqual(h.settings(), initialSettings);
    });

    test(`deleting the selected API preset ${success ? 'switches config atomically' : 'preserves config on failure'}`, async t => {
        const first = { host: 'https://first.invalid', auth: 'first-key' };
        const second = { host: 'https://second.invalid', auth: 'second-key' };
        const initialSettings = {
            ...first, activeApiPresetId: 'first',
            apiPresets: [{ id: 'first', name: 'First', config: first }, { id: 'second', name: 'Second', config: second }],
        };
        const h = fixture(t, async () => success, { initialSettings, confirm: () => true });
        await h.click('delete');
        if (success) {
            assert.equal(h.settings().activeApiPresetId, 'second');
            assert.deepEqual(h.settings().apiPresets, initialSettings.apiPresets.slice(1));
            assert.equal(h.settings().auth, second.auth);
            assert.deepEqual(h.config(), second);
        } else {
            assert.deepEqual(h.settings(), initialSettings);
            assert.equal(h.filled.length, 0);
            assert.equal(h.config().auth, 'edited-key');
        }
    });
}
