import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { bindDeliveryPanel } from '../plugins/delivery/panel.js';
import { DEFAULT_REQUIREMENTS } from '../plugins/delivery/protocol.js';
import { createSettingsPopoverGroup } from '../app-src/ui/settings-popover-group.js';
import { bindApiPopover } from '../app-src/ui/api-entry.js';
import { buildAppMarkup } from '../app-src/ui/app-shell.js';

function mount(adapter) {
    const { document, window } = parseHTML(`<html><body>${buildAppMarkup({ config: {}, configSave: {} })}</body></html>`);
    const root = document.body;
    const bindPopover = createSettingsPopoverGroup(root);
    const openApi = bindApiPopover(root, bindPopover);
    const { refreshStatus: refresh } = bindDeliveryPanel(root, { getProviderConfig: () => ({ provider: 'google' }), ...adapter, bindPopover });
    const get = selector => root.querySelector(selector);
    const event = (name, extra) => Object.assign(new window.Event(name, { bubbles: true, cancelable: true }), extra);
    return { get, event, refresh, openApi, summary: get('#xb-assistant-delivery-summary'), text: get('#xb-assistant-delivery-requirements'),
        panel: get('#xb-assistant-delivery-popover'), enabled: get('[data-delivery-enabled]'), save: get('[data-delivery-save]') };
}

test('sidebar settings preserve drafts across dismissal; only saving changes running preferences', () => {
    let stored = { enabled: false, requirements: DEFAULT_REQUIREMENTS }, reject = true;
    const { get, event, summary, text, enabled, panel, save } = mount({ load: () => stored, save(value) {
        if (reject) throw new Error('storage full');
        stored = value;
    } });
    assert.ok(!get('#xb-assistant-api-popover').contains(panel));
    assert.ok(get('.xb-assistant-sidebar').contains(summary));
    summary.click(); enabled.checked = true; enabled.dispatchEvent(event('change'));
    text.value = 'test draft'; text.dispatchEvent(event('input'));
    const escape = event('keydown', { key: 'Escape' });
    text.dispatchEvent(escape);
    assert.ok(panel.hidden && escape.defaultPrevented);
    summary.click(); assert.equal(text.value, 'test draft'); assert.equal(save.disabled, false);
    save.click(); assert.ok(!stored.enabled && !save.disabled);
    reject = false; save.click(); assert.deepEqual(stored, { enabled: true, requirements: 'test draft' });
    get('[data-delivery-default]').click(); assert.equal(text.value, DEFAULT_REQUIREMENTS); assert.equal(enabled.checked, true);
    get('[data-delivery-discard]').click(); assert.equal(text.value, 'test draft'); assert.ok(save.disabled);
    get('#xb-assistant-api-summary').dispatchEvent(event('pointerdown')); assert.ok(panel.hidden);
});

test('host and keyboard activation share one popover and preserve the draft across preset changes', () => {
    let config = { provider: 'openai-compatible', toolMode: 'native' };
    const { get, event, summary, text, panel, refresh, openApi } = mount({ getProviderConfig: () => config,
        load: () => ({ enabled: true, requirements: 'saved' }), save: assert.fail });
    const api = get('#xb-assistant-api-popover'), notice = get('[data-delivery-availability]');
    summary.click(); text.value = 'unsaved'; text.dispatchEvent(event('input'));
    assert.ok(notice.hidden);
    openApi(); openApi(); assert.ok(panel.hidden && !api.hidden);
    config.toolMode = 'tagged-json'; refresh();
    summary.click(); assert.ok(!panel.hidden && api.hidden && notice.hidden); assert.equal(text.value, 'unsaved');
    config = { provider: 'google', toolMode: 'tagged-json' }; refresh();
    assert.ok(notice.hidden); // An inactive compatibility field does not change Gemini's native protocol.
    const escape = event('keydown', { key: 'Escape' }); text.dispatchEvent(escape);
    assert.ok(panel.hidden && api.hidden && escape.defaultPrevented);
});

test('unreadable preferences leave the shell available and require explicit reset and save to recover', () => {
    let persisted;
    const { get, summary, enabled, save } = mount({ load() { throw new Error('invalid settings'); }, save(value) { persisted = value; } });
    summary.click(); assert.ok(enabled.disabled); assert.ok(save.disabled);
    get('[data-delivery-default]').click(); assert.ok(!save.disabled && !enabled.disabled);
    assert.equal(persisted, undefined); save.click();
    assert.deepEqual(persisted, { enabled: false, requirements: DEFAULT_REQUIREMENTS });
});
