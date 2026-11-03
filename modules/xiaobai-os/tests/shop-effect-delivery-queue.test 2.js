import assert from 'node:assert/strict';
import test from 'node:test';

import { createShopEffectDeliveryQueue } from '../apps/shop/application/effect-delivery-queue.js';
import {
    activateShopItem,
    createEmptyShopState,
    createShopEffectReceipt,
    deliverShopEffects,
    getShopCasToken,
    projectShopState,
    purchaseShopItem,
} from '../domains/shop/timeline.js';

function command(domain, actionId, fields = {}) {
    return { ...getShopCasToken(domain), actionId, ...fields };
}

function activeDomain(itemId, parameters) {
    let sequence = 0;
    const dependencies = {
        now: () => 1_000 + sequence,
        createEventId: () => `event-${++sequence}`,
    };
    let domain = createEmptyShopState();
    domain = purchaseShopItem(domain, command(domain, `buy-${itemId}`, { itemId }), dependencies).domain;
    domain = activateShopItem(domain, command(domain, `use-${itemId}`, {
        activationId: `activation-${itemId}`,
        itemId,
        parameters,
    }), dependencies).domain;
    return { domain, dependencies };
}

function deferred() {
    let resolve;
    const promise = new Promise(resolvePromise => {resolve = resolvePromise;});
    return { promise, resolve };
}

function commit(domain, delivery, dependencies) {
    return deliverShopEffects(domain, command(domain, delivery.actionId, {
        receipt: delivery.receipt,
    }), dependencies).domain;
}

test('an admitted delivery changes the next effect projection before persistence finishes', async () => {
    const chatIdentity = 'character:1:chat-a';
    const active = activeDomain('flower', { targetName: '艾拉' });
    let persistedDomain = active.domain;
    const saveStarted = deferred();
    const releaseSave = deferred();
    const queue = createShopEffectDeliveryQueue({
        readCurrent: () => ({ chatIdentity, domain: persistedDomain }),
        async persist(delivery) {
            persistedDomain = commit(persistedDomain, delivery, active.dependencies);
            saveStarted.resolve();
            await releaseSave.promise;
        },
        now: () => 2_000,
    });
    const firstReceipt = createShopEffectReceipt(queue.readCurrent(chatIdentity));

    queue.enqueue({ chatIdentity, actionId: 'reply-one', receipt: firstReceipt });

    const nextReceipt = createShopEffectReceipt(queue.readCurrent(chatIdentity));
    assert.deepEqual(firstReceipt.activeActivationIds, ['activation-flower']);
    assert.deepEqual(nextReceipt.activeActivationIds, []);
    assert.equal(projectShopState(persistedDomain).activations[0].appliedCount, 0);

    await saveStarted.promise;
    assert.equal(projectShopState(persistedDomain).activations[0].appliedCount, 1);
    assert.equal(projectShopState(queue.readCurrent(chatIdentity)).activations[0].appliedCount, 1);
    releaseSave.resolve();
    await new Promise(resolve => globalThis.setImmediate(resolve));
    assert.equal(projectShopState(persistedDomain).activations[0].appliedCount, 1);
});

test('a failed head stays projected and pauses later delivery persistence until resumed', async () => {
    const chatIdentity = 'character:1:chat-a';
    const active = activeDomain('no-anger-sticker', { targetName: '艾拉' });
    let persistedDomain = active.domain;
    let attempt = 0;
    const attempts = [];
    const errors = [];
    const firstFailed = deferred();
    const allPersisted = deferred();
    const queue = createShopEffectDeliveryQueue({
        readCurrent: () => ({ chatIdentity, domain: persistedDomain }),
        async persist(delivery) {
            attempt += 1;
            attempts.push(delivery.actionId);
            if (attempt === 1) {
                firstFailed.resolve();
                throw new Error('save unavailable');
            }
            persistedDomain = commit(persistedDomain, delivery, active.dependencies);
            if (attempt === 3) {allPersisted.resolve();}
        },
        now: () => 2_000 + attempt,
        onError: (error, delivery) => errors.push({ error, delivery }),
    });
    const firstReceipt = createShopEffectReceipt(queue.readCurrent(chatIdentity));
    queue.enqueue({ chatIdentity, actionId: 'reply-one', receipt: firstReceipt });
    const secondReceipt = createShopEffectReceipt(queue.readCurrent(chatIdentity));
    queue.enqueue({ chatIdentity, actionId: 'reply-two', receipt: secondReceipt });

    await firstFailed.promise;
    await new Promise(resolve => globalThis.setImmediate(resolve));
    assert.deepEqual(attempts, ['reply-one']);
    assert.equal(projectShopState(persistedDomain).activations[0].appliedCount, 0);
    assert.equal(projectShopState(queue.readCurrent(chatIdentity)).activations[0].appliedCount, 2);
    assert.equal(errors.length, 1);

    queue.resume(chatIdentity);
    await allPersisted.promise;
    await new Promise(resolve => globalThis.setImmediate(resolve));
    assert.deepEqual(attempts, ['reply-one', 'reply-one', 'reply-two']);
    assert.equal(projectShopState(persistedDomain).activations[0].appliedCount, 2);
    assert.equal(projectShopState(queue.readCurrent(chatIdentity)).activations[0].appliedCount, 2);
});

test('a new admitted reply retries a lane that failed while the chat stayed open', async () => {
    const chatIdentity = 'character:1:chat-a';
    const active = activeDomain('no-anger-sticker', { targetName: '艾拉' });
    let persistedDomain = active.domain;
    let attempt = 0;
    const attempts = [];
    const firstFailed = deferred();
    const allPersisted = deferred();
    const queue = createShopEffectDeliveryQueue({
        readCurrent: () => ({ chatIdentity, domain: persistedDomain }),
        async persist(delivery) {
            attempt += 1;
            attempts.push(delivery.actionId);
            if (attempt === 1) {
                firstFailed.resolve();
                throw new Error('save unavailable');
            }
            persistedDomain = commit(persistedDomain, delivery, active.dependencies);
            if (attempt === 3) {allPersisted.resolve();}
        },
        now: () => 2_000 + attempt,
        onError: () => {},
    });
    queue.enqueue({
        chatIdentity,
        actionId: 'reply-one',
        receipt: createShopEffectReceipt(queue.readCurrent(chatIdentity)),
    });
    await firstFailed.promise;
    await new Promise(resolve => globalThis.setImmediate(resolve));

    queue.enqueue({
        chatIdentity,
        actionId: 'reply-two',
        receipt: createShopEffectReceipt(queue.readCurrent(chatIdentity)),
    });

    await allPersisted.promise;
    await new Promise(resolve => globalThis.setImmediate(resolve));
    assert.deepEqual(attempts, ['reply-one', 'reply-one', 'reply-two']);
    assert.equal(projectShopState(persistedDomain).activations[0].appliedCount, 2);
});

test('pending deliveries are isolated by chat identity', () => {
    const first = activeDomain('flower', { targetName: '艾拉' });
    const second = activeDomain('flower', { targetName: '贝塔' });
    const domains = new Map([
        ['character:1:chat-a', first.domain],
        ['character:2:chat-b', second.domain],
    ]);
    let currentIdentity = 'character:1:chat-a';
    const queue = createShopEffectDeliveryQueue({
        readCurrent: () => ({ chatIdentity: currentIdentity, domain: domains.get(currentIdentity) }),
        persist: () => new Promise(() => {}),
        now: () => 2_000,
    });
    queue.enqueue({
        chatIdentity: currentIdentity,
        actionId: 'chat-a-reply',
        receipt: createShopEffectReceipt(queue.readCurrent(currentIdentity)),
    });

    currentIdentity = 'character:2:chat-b';
    assert.deepEqual(
        createShopEffectReceipt(queue.readCurrent(currentIdentity)).activeActivationIds,
        ['activation-flower'],
    );
    currentIdentity = 'character:1:chat-a';
    assert.deepEqual(createShopEffectReceipt(queue.readCurrent(currentIdentity)).activeActivationIds, []);
});
