import assert from 'node:assert/strict';
import test from 'node:test';
import { createStorySummaryMessageDecorator } from '../features/story-summary/message-buttons.js';
import { getStorySummaryRuntimeOptions } from '../features/story-summary/runtime-options.js';
import { inspectTauriTavernEnvironment } from '../environment.js';
import { createHideStateController } from '../../../modules/story-summary/hide-state.js';
import { setChatStorySummaryEnabled } from '../../../modules/story-summary/data/chat-toggle.js';

// Test the bounded mount lease, not DOM selectors or synthetic business events.
function presentation(initiallyEnabled = false) {
    let enabled = initiallyEnabled;
    const listeners = new Set();
    const mount = createStorySummaryMessageDecorator({
        isEnabled: () => enabled,
        mountButton(floor, mesid) {
            const button = { mesid };
            floor.buttons.add(button);
            return () => floor.buttons.delete(button);
        },
        subscribeToggle(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    });
    return {
        mount, listeners,
        toggle(value) {
            enabled = value;
            for (const listener of listeners) listener();
        },
    };
}

test('resident summary buttons follow toggles immediately without duplicates', () => {
    const view = presentation();
    const floors = [{ buttons: new Set() }, { buttons: new Set() }];
    const releases = floors.map((floor, index) => view.mount(floor, index));
    assert.deepEqual(floors.map(floor => floor.buttons.size), [0, 0]);
    view.toggle(true);
    const originalButtons = floors.map(floor => [...floor.buttons][0]);
    view.toggle(true);
    assert.deepEqual(floors.map(floor => floor.buttons.size), [1, 1]);
    floors.forEach((floor, index) => assert.equal([...floor.buttons][0], originalButtons[index]));
    view.toggle(false);
    assert.deepEqual(floors.map(floor => floor.buttons.size), [0, 0]);
    view.toggle(true);
    assert.deepEqual(floors.map(floor => floor.buttons.size), [1, 1]);
    releases.forEach(release => release());
    assert.equal(view.listeners.size, 0);
    assert.deepEqual(floors.map(floor => floor.buttons.size), [0, 0]);
});

test('unmount releases listeners and remount uses the current enabled state', () => {
    const view = presentation(true);
    const oldFloor = { buttons: new Set() };
    const release = view.mount(oldFloor, 7);
    release();
    release();
    assert.equal(view.listeners.size, 0);
    view.toggle(false);
    const newFloor = { buttons: new Set() };
    const releaseNew = view.mount(newFloor, 7);
    assert.equal(newFloor.buttons.size, 0);
    view.toggle(true);
    assert.equal(oldFloor.buttons.size, 0);
    assert.equal(newFloor.buttons.size, 1);
    assert.equal([...newFloor.buttons][0].mesid, 7);
    releaseNew();
    assert.equal(view.listeners.size, 0);
});

test('a failed initial button mount does not retain its toggle subscription', () => {
    const listeners = new Set();
    const failure = new Error();
    const mount = createStorySummaryMessageDecorator({
        isEnabled: () => true,
        mountButton() { throw failure; },
        subscribeToggle(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    });
    assert.throws(() => mount({}, 3), error => error === failure);
    assert.equal(listeners.size, 0);
});

test('ordinary SillyTavern receives no save override', () => {
    assert.deepEqual(getStorySummaryRuntimeOptions(inspectTauriTavernEnvironment(undefined)), { ownsMessageButtons: true });
});

test('TT saves restored message flags together with summary metadata in either rendering mode', async () => {
    for (const managed of [false, true]) {
        const context = {
            chatId: 'summary-save-test',
            chat: [{ mes: 'kept text', is_system: true, xb_summary_hidden: true },
                { mes: 'tail', is_system: false }, { mes: 'manual hide', is_system: true }],
            chatMetadata: { extensions: { LittleWhiteBox: { storySummary: { retained: true } } } },
            async saveMetadata() { throw new Error('Metadata-only save cannot persist message flags'); },
            async saveChat() {
                persisted = structuredClone({ chat: this.chat, metadata: this.chatMetadata });
                saves++;
            },
        };
        let saves = 0;
        let persisted;
        const hide = createHideStateController({
            getState: () => context,
            renderMessage() {}, refresh() {},
        });
        setChatStorySummaryEnabled(context.chatMetadata, 'LittleWhiteBox', false);
        await hide.clear({ persist: false });
        const options = getStorySummaryRuntimeOptions(inspectTauriTavernEnvironment({
            abiVersion: 1,
            api: { chatSurface: { isManagedOwnershipRequired: () => managed } },
        }));
        assert.equal(options.ownsMessageButtons, !managed);
        await options.saveChatState(context);
        assert.equal(saves, 1);
        assert.deepEqual(persisted.chat.map(message => message.is_system), [false, false, true]);
        assert.deepEqual(persisted.chat.map(message => message.mes), ['kept text', 'tail', 'manual hide']);
        assert.equal(persisted.metadata.extensions.LittleWhiteBox.storySummaryEnabled, false);
        assert.deepEqual(persisted.metadata.extensions.LittleWhiteBox.storySummary, { retained: true });
    }
});

test('TT save errors propagate without retrying or using a metadata-only fallback', async () => {
    const failure = new Error();
    let calls = 0;
    const context = {
        async saveChat() { calls++; throw failure; },
        async saveMetadata() { assert.fail('Unexpected fallback'); },
    };
    await assert.rejects(getStorySummaryRuntimeOptions(inspectTauriTavernEnvironment({ abiVersion: 1 })).saveChatState(context), error => error === failure);
    assert.equal(calls, 1);
});
