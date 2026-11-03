import assert from 'node:assert/strict';
import test from 'node:test';

import { createShopMessageReceipts } from '../apps/shop/host/message-receipts.js';
import { SHOP_EFFECT_RECEIPT_VERSION } from '../domains/shop/types.js';

const receipt = {
    schemaVersion: SHOP_EFFECT_RECEIPT_VERSION,
    activeActivationIds: ['activation-flower'],
    transitionActivationIds: [],
};

function createSurface() {
    return {
        identityKey: 'character:1:chat-a',
        messages: [
            { is_user: true, mes: '你好' },
            {
                is_user: false,
                mes: '回复',
                extra: { existing: 'message' },
                swipe_id: 0,
                swipe_info: [{ extra: { existing: 'swipe' } }],
            },
        ],
    };
}

test('binding a receipt updates the exact Assistant message and its active swipe synchronously', () => {
    const surface = createSurface();
    const receipts = createShopMessageReceipts({ captureChatSurface: () => surface });

    const binding = receipts.bind({
        chatIdentity: surface.identityKey,
        messageId: 1,
        receipt,
    });

    assert.deepEqual(surface.messages[1].extra.xiaobaiOsShopEffects, receipt);
    assert.deepEqual(surface.messages[1].swipe_info[0].extra.xiaobaiOsShopEffects, receipt);
    assert.deepEqual(receipts.captureConversation().messages[1].shopEffectReceipt, receipt);
    assert.equal(surface.messages[1].extra.existing, 'message');
    assert.equal(surface.messages[1].swipe_info[0].extra.existing, 'swipe');

    binding.rollback();
    assert.equal(Object.hasOwn(surface.messages[1].extra, 'xiaobaiOsShopEffects'), false);
    assert.equal(Object.hasOwn(surface.messages[1].swipe_info[0].extra, 'xiaobaiOsShopEffects'), false);
});

test('conversation capture can recover the current swipe receipt when message extra has none', () => {
    const surface = createSurface();
    surface.messages[1].swipe_info[0].extra.xiaobaiOsShopEffects = structuredClone(receipt);
    const receipts = createShopMessageReceipts({ captureChatSurface: () => surface });

    assert.deepEqual(receipts.captureConversation(), {
        identityKey: surface.identityKey,
        messages: [
            { role: 'user', content: '你好' },
            { role: 'assistant', content: '回复', shopEffectReceipt: receipt },
        ],
    });
});

test('binding refuses a changed chat or a non-Assistant target', () => {
    const surface = createSurface();
    const receipts = createShopMessageReceipts({ captureChatSurface: () => surface });

    assert.throws(() => receipts.bind({
        chatIdentity: 'character:2:chat-b',
        messageId: 1,
        receipt,
    }), /shop_generation_chat_changed/);
    assert.throws(() => receipts.bind({
        chatIdentity: surface.identityKey,
        messageId: 0,
        receipt,
    }), /shop_generation_chat_changed/);
});
