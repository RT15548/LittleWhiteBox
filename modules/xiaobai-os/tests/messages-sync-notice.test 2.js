import assert from 'node:assert/strict';
import test from 'node:test';
import { createSettingsRepository } from '../host/settings-repository.js';
import { harness, controllerHarness } from './helpers/messages-harness.js';

async function failedSend(h, c, actionId = 'first') {
    h.failProjection = true;
    await c.command('send', { contactId: '甲', actionId, payload: { type: 'text', text: actionId } });
    await c.idle();
    return c.command('refresh');
}

test('opt-out persists across reopened controllers and chats; receipts and manual sync remain intact', async () => {
    const h = await harness(); const c = await controllerHarness(h);
    const initial = await failedSend(h, c);
    assert.equal(initial.settings.syncNoticeEnabled, true);
    assert.ok(initial.syncNotice.error);
    for (const action of ['sync', 'recover']) {
        await assert.rejects(c.command(action));
        const failed = await c.command('refresh');
        assert.ok(failed.syncNotice.error);
        assert.equal(failed.error, '');
    }
    const stored = structuredClone(h.persisted); const native = structuredClone(h.messages);
    const counters = [h.writes, h.publishes, h.apiCalls];
    const dismissed = await c.command('dismiss-sync-notice');
    assert.equal(dismissed.settings.syncNoticeEnabled, false);
    assert.deepEqual(dismissed.syncNotice.messageIds, initial.syncNotice.messageIds);
    assert.deepEqual(h.persisted, stored); assert.deepEqual(h.messages, native);
    assert.deepEqual([h.writes, h.publishes, h.apiCalls], counters);

    c.controller.deactivate();
    const reopenedSettings = createSettingsRepository({ getExtensionSettings: () => h.preferences, saveSettings() {} });
    assert.equal((await reopenedSettings.prepare()).apps.messages.syncNoticeEnabled, false);
    h.deps.getSettings = () => reopenedSettings.read().apps.messages;
    h.deps.saveSettings = async value => {await reopenedSettings.setMessagesSettings(value);};
    h.deps.subscribeSettings = reopenedSettings.subscribe;
    h.identity = 'another-chat';
    const reopened = await controllerHarness(h);
    assert.equal((await reopened.command('refresh')).settings.syncNoticeEnabled, false);
    h.failProjection = false;
    const synced = await reopened.command('sync');
    assert.deepEqual(synced.syncNotice.messageIds, []);
    assert.equal(synced.syncNotice.error, '');
    assert.equal(h.apiCalls, 1);
    reopened.controller.deactivate();
});

test('new unsynced messages stay visible in manual sync until the setting is re-enabled', async () => {
    const h = await harness(); const c = await controllerHarness(h);
    const first = await failedSend(h, c);
    await c.command('dismiss-sync-notice');
    h.failProjection = false; await c.command('sync');
    const second = await failedSend(h, c, 'second');
    assert.equal(second.syncNotice.messageIds.length, first.syncNotice.messageIds.length);
    assert.equal(second.settings.syncNoticeEnabled, false);
    const enabled = await c.command('settings', { settings: { ...second.settings, syncNoticeEnabled: true } });
    assert.equal(enabled.settings.syncNoticeEnabled, true);
    assert.deepEqual(enabled.syncNotice.messageIds, second.syncNotice.messageIds);
    c.controller.handleChatChanged();
    assert.equal(c.activate().settings.syncNoticeEnabled, true);
    c.controller.deactivate();
});

test('failed preference save keeps the reminder on and never changes delivery or other errors', async () => {
    const h = await harness(); const c = await controllerHarness(h);
    h.response = async () => {throw new Error('provider offline');};
    const failed = await failedSend(h, c);
    const before = structuredClone(h.preferences.xiaobaiOs);
    h.failSettingsSave = true;
    await assert.rejects(c.command('dismiss-sync-notice'));
    const after = await c.command('refresh');
    assert.equal(after.settings.syncNoticeEnabled, true);
    assert.deepEqual(h.preferences.xiaobaiOs, before);
    assert.deepEqual(after.sendFailure, failed.sendFailure);
    assert.deepEqual(after.syncNotice.messageIds, failed.syncNotice.messageIds);
    assert.ok(after.error);
    await assert.rejects(c.controller.handleMessage({ type: 'messages/dismiss-sync-notice', payload: { chatIdentity: 'another' } }));
    c.controller.deactivate();
});
