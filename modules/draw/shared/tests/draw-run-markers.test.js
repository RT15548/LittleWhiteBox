import assert from 'node:assert/strict';
import test from 'node:test';

import { persistedChatHasDeliverySlots } from '../draw-run-markers.js';

test('delivery read-back maps ctx.chat message indexes across the persisted metadata header', () => {
    const persistedChat = [
        { chat_metadata: {} },
        { mes: 'First message.' },
        {
            mes: 'Second message. [image : slot-2]',
            swipe_id: 0,
            swipes: ['Second message. [image : slot-2]'],
        },
    ];
    assert.equal(persistedChatHasDeliverySlots(
        persistedChat,
        { mode: 'slots', chatId: 'chat-1', messageId: '1', swipeIndex: 0 },
        ['slot-2'],
    ), true);
});
