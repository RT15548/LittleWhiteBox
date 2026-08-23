import assert from 'node:assert/strict';
import test from 'node:test';

import {
    classifyImageJobDeliveryTarget,
    commitImageJobDeliverySlotRemoval,
    findImageJobDeliverySlot,
    ImageJobDeliveryDeferredError,
    ImageJobDeliveryTargetState,
    requireImageJobDeliveryTarget,
    setImageJobDeliveryTargetText,
} from '../image-job-delivery-target.js';

test('delivery targets distinguish an unavailable chat from a removed message or slot', () => {
    const chat = [{ mes: 'story\n[image:slot-a]' }];
    const base = { targetChatId: 'chat-1', chat, messageId: 0, slotId: 'slot-a' };

    assert.equal(classifyImageJobDeliveryTarget({ ...base, currentChatId: 'chat-2' }).state, ImageJobDeliveryTargetState.UNAVAILABLE);
    assert.equal(classifyImageJobDeliveryTarget({ ...base, currentChatId: 'chat-1', chat: null }).state, ImageJobDeliveryTargetState.UNAVAILABLE);
    assert.equal(classifyImageJobDeliveryTarget({ ...base, currentChatId: 'chat-1', slotId: 'slot-b' }).state, ImageJobDeliveryTargetState.REMOVED);
    assert.equal(classifyImageJobDeliveryTarget({ ...base, currentChatId: 'chat-1' }).state, ImageJobDeliveryTargetState.ALIVE);
});

test('required delivery targets defer unavailable chats and ignore removed slots', () => {
    const chat = [{ mes: 'story' }];
    assert.equal(requireImageJobDeliveryTarget({
        currentChatId: 'chat-1', targetChatId: 'chat-1', chat, slotId: 'removed',
    }), null);
    assert.throws(() => requireImageJobDeliveryTarget({
        currentChatId: 'chat-2', targetChatId: 'chat-1', chat, slotId: 'slot-a',
    }), ImageJobDeliveryDeferredError);
});

test('slot identity survives message reindexing and resolves the real message', () => {
    const original = { mes: 'story\n[image:slot-a]' };
    const chat = [{ mes: 'new earlier message' }, original];
    const target = classifyImageJobDeliveryTarget({
        currentChatId: 'chat-1',
        targetChatId: 'chat-1',
        chat,
        messageId: 0,
        slotId: 'slot-a',
    });

    assert.equal(target.state, ImageJobDeliveryTargetState.ALIVE);
    assert.equal(target.message, original);
    assert.equal(target.messageId, 1);
});

test('slot identity searches every swipe and updates only the owning swipe', () => {
    const message = {
        mes: 'current swipe',
        swipe_id: 0,
        swipes: ['current swipe', 'older swipe\n[image:slot-a]'],
    };
    const target = findImageJobDeliverySlot([message], 'slot-a');

    assert.equal(target.messageId, 0);
    assert.equal(target.swipe, 1);
    assert.equal(target.isActiveSwipe, false);
    assert.equal(setImageJobDeliveryTargetText(target, 'older swipe'), true);
    assert.equal(message.mes, 'current swipe');
    assert.deepEqual(message.swipes, ['current swipe', 'older swipe']);
});

test('active message text wins over a stale active swipe snapshot', () => {
    const message = {
        mes: 'current text without the deleted slot',
        swipe_id: 0,
        swipes: ['stale text\n[image:deleted-slot]', 'older swipe\n[image:older-slot]'],
    };

    assert.equal(findImageJobDeliverySlot([message], 'deleted-slot'), null);
    const olderTarget = findImageJobDeliverySlot([message], 'older-slot');
    assert.equal(olderTarget?.swipe, 1);
    assert.equal(olderTarget?.isActiveSwipe, false);
});

test('updating a slot in active message text also synchronizes its swipe snapshot', () => {
    const message = {
        mes: 'current text\n[image:slot-a]',
        swipe_id: 1,
        swipes: ['older swipe', 'stale current text'],
    };
    const target = findImageJobDeliverySlot([message], 'slot-a');

    assert.equal(target?.swipe, 1);
    assert.equal(target?.isActiveSwipe, true);
    assert.equal(setImageJobDeliveryTargetText(target, 'updated current text'), true);
    assert.equal(message.mes, 'updated current text');
    assert.deepEqual(message.swipes, ['older swipe', 'updated current text']);
});

test('slot removal updates the owning swipe and persists even when some markers are already gone', async () => {
    const message = {
        mes: 'current swipe',
        swipe_id: 0,
        swipes: ['current swipe', 'older swipe\n[image:slot-a]'],
    };
    let saves = 0;
    await commitImageJobDeliverySlotRemoval({
        slotIds: ['slot-a', 'already-removed'],
        resolveTarget: slotId => findImageJobDeliverySlot([message], slotId),
        persist: async () => { saves++; },
    });

    assert.equal(message.mes, 'current swipe');
    assert.deepEqual(message.swipes, ['current swipe', 'older swipe']);
    assert.equal(saves, 1);
});

test('slot removal defers without mutating while any floor is being edited', async () => {
    const message = { mes: 'story\n[image:slot-a]' };
    let saves = 0;
    await assert.rejects(commitImageJobDeliverySlotRemoval({
        slotIds: ['slot-a'],
        resolveTarget: slotId => findImageJobDeliverySlot([message], slotId),
        isAnyEditing: () => true,
        persist: async () => { saves++; },
    }), ImageJobDeliveryDeferredError);

    assert.equal(message.mes, 'story\n[image:slot-a]');
    assert.equal(saves, 0);
});
