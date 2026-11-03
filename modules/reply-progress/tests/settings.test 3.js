import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { mountReplyProgressSettings } from '../index.js';
import { prepareReplyProgressSettings, REPLY_PROGRESS_SETTINGS } from '../settings.js';

function mount(settings, runtime) {
    const { document, Event } = parseHTML('<html><body><div></div><textarea></textarea></body></html>');
    const anchor = document.querySelector('div');
    const textarea = document.querySelector('textarea');
    textarea.placeholder = 'original';
    let saves = 0;
    const view = mountReplyProgressSettings({ anchor, settings, saveSettings: () => saves++, runtime });
    const checkbox = document.querySelector('input[type="checkbox"]');
    return { document, Event, view, checkbox, textarea, saves: () => saves };
}

test('initializes the preference without overwriting a saved opt-out or other settings', () => {
    const fresh = {};
    assert.equal(prepareReplyProgressSettings(fresh).enabled, true);

    const saved = { [REPLY_PROGRESS_SETTINGS.key]: { enabled: false }, recorded: { enabled: false } };
    const original = saved[REPLY_PROGRESS_SETTINGS.key];
    assert.equal(prepareReplyProgressSettings(saved), original);
    assert.equal(original.enabled, false);
    assert.deepEqual(saved.recorded, { enabled: false });
});

test('the toggle saves its preference without changing the composer', () => {
    const settings = { enabled: true };
    const { checkbox, textarea, Event, saves } = mount(settings);
    assert.equal(checkbox.checked, true);
    assert.equal(checkbox.disabled, false);

    checkbox.checked = false;
    checkbox.dispatchEvent(new Event('change'));
    assert.equal(settings[REPLY_PROGRESS_SETTINGS.key].enabled, false);
    assert.equal(saves(), 1);
    assert.equal(textarea.placeholder, 'original');
    assert.equal(textarea.value, '');
});

test('the global switch disables the control without erasing its preference; reset restores the default', () => {
    const settings = { enabled: true, [REPLY_PROGRESS_SETTINGS.key]: { enabled: false } };
    const { checkbox, view, saves } = mount(settings);
    settings.enabled = false;
    view.syncEnabled();
    assert.equal(checkbox.disabled, true);
    assert.equal(checkbox.checked, false);
    assert.equal(saves(), 0);

    settings.enabled = true;
    view.syncEnabled();
    assert.equal(checkbox.disabled, false);
    assert.equal(checkbox.checked, false);

    view.resetDefaults();
    assert.equal(settings[REPLY_PROGRESS_SETTINGS.key].enabled, true);
    assert.equal(checkbox.checked, true);
    assert.equal(saves(), 1);
});

test('disposing the settings view removes its control and change listener', () => {
    const settings = { enabled: true };
    const { document, checkbox, view, Event, saves } = mount(settings);
    view.destroy();
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event('change'));
    assert.equal(document.querySelector('input[type="checkbox"]'), null);
    assert.equal(settings[REPLY_PROGRESS_SETTINGS.key].enabled, true);
    assert.equal(saves(), 0);
    assert.ok(document.querySelector('textarea'));
});

test('the preference, global switch and reset control the same runtime lifecycle', () => {
    const changes = [];
    const runtime = { setEnabled: value => changes.push(value), destroy: () => changes.push(null) };
    const settings = { enabled: true };
    const { checkbox, view, Event } = mount(settings, runtime);
    assert.deepEqual(changes, [true]);

    checkbox.checked = false;
    checkbox.dispatchEvent(new Event('change'));
    assert.deepEqual(changes, [true, false]);

    settings.enabled = false;
    view.syncEnabled();
    view.resetDefaults();
    assert.equal(settings.replyProgress.enabled, true);
    assert.equal(changes.at(-1), false);

    settings.enabled = true;
    view.syncEnabled();
    assert.equal(changes.at(-1), true);
    view.destroy();
    assert.equal(changes.at(-1), null);
});
