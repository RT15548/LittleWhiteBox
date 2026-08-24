import assert from 'node:assert/strict';
import test from 'node:test';

import {
    listActiveSwipeDrawRunMarkers,
    persistedChatHasDeliverySlots,
    persistedChatHasDrawRunMarker,
    persistedDrawRunTargetMatches,
} from '../draw-run-markers.js';

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

test('delivery read-back follows deterministic slots after earlier messages reindex the target', () => {
    const persistedChat = [
        { chat_metadata: {} },
        {
            mes: 'Moved message. [image:slot-moved]',
            swipe_id: 0,
            swipes: ['Moved message. [image:slot-moved]'],
        },
    ];
    assert.equal(persistedChatHasDeliverySlots(
        persistedChat,
        { mode: 'slots', chatId: 'chat-1', messageId: '4', swipeIndex: 0 },
        ['slot-moved'],
    ), true);
});

test('pending Draw Run controls follow only the active swipe', () => {
    const marker = provider => ({
        version: 1,
        provider,
        sourceHash: 'hash',
        targetHash: 'target',
        createdAt: 1,
    });
    const message = {
        swipe_id: 1,
        extra: { xbDrawRuns: { 'run-test-201': marker('novelai') } },
        swipe_info: [
            { extra: { xbDrawRuns: { 'run-test-202': marker('novelai') } } },
            { extra: { xbDrawRuns: {
                'run-test-201': marker('novelai'),
            } } },
        ],
    };
    assert.deepEqual(
        listActiveSwipeDrawRunMarkers(message).map(entry => entry.runId),
        ['run-test-201'],
    );
});

test('terminal cleanup treats cancellation time as intent state, not target identity', () => {
    const persistedChat = [{
        mes: 'Hello.',
        extra: {
            xbDrawRuns: {
                'run-test-204': {
                    version: 1,
                    provider: 'novelai',
                    sourceHash: 'hash-1',
                    targetHash: 'target-1',
                    createdAt: 100,
                },
            },
        },
    }];
    const localMarker = {
        version: 1,
        provider: 'novelai',
        sourceHash: 'hash-1',
        targetHash: 'target-1',
        createdAt: 100,
        cancelRequestedAt: 200,
    };
    assert.equal(persistedDrawRunTargetMatches(
        persistedChat,
        'run-test-204',
        'Hello.',
        localMarker,
    ), true);
    assert.equal(persistedChatHasDrawRunMarker(
        persistedChat,
        'run-test-204',
        localMarker,
    ), false);
});
