import assert from 'node:assert/strict';
import test from 'node:test';

import {
    createEconomyCapabilityRegistrations,
    ECONOMY_READ_CAPABILITY,
    ECONOMY_TRANSACTION_CAPABILITY,
} from '../capabilities/economy/index.js';
import { createShopEffectDeliveryQueue } from '../apps/shop/application/effect-delivery-queue.js';
import { createShopService } from '../apps/shop/application/service.js';
import { createShopModule } from '../apps/shop/module.js';
import { SHOP_PARTITION } from '../apps/shop/partition.js';
import { ensureEconomy, postAction } from '../domains/economy/ledger.js';
import { createShopEffectReceipt, projectShopState } from '../domains/shop/timeline.js';
import { createCapabilityRegistry } from '../kernel/capability-registry.js';
import { XiaobaiOsPartitionRegistry } from '../kernel/partition-registry.js';
import { createTransactionCoordinator } from '../kernel/transaction-coordinator.js';

function deferred() {
    let resolve;
    const promise = new Promise(resolvePromise => { resolve = resolvePromise; });
    return { promise, resolve };
}

function initialLedger(chat, extraFunds) {
    const opened = ensureEconomy(undefined, {
        now: () => 100,
        createId: () => `opening-${chat}`,
    });
    if (!extraFunds) { return opened; }
    return postAction(opened, [{
        idempotencyKey: `test:grant:${chat}`,
        actionId: `test:grant:${chat}`,
        fromAccountId: 'system:mint',
        toAccountId: 'player',
        amount: extraFunds,
        kind: 'test_grant',
        title: '测试资金',
        sourceDomain: 'test',
        sourceId: chat,
    }], {
        now: () => 101,
        createId: () => `grant-${chat}`,
    }).ledger;
}

async function createHarness({ extraFunds = 0, initialShop, refreshShop = true } = {}) {
    const identities = {
        a: {
            identityKey: 'character:avatar-a.png:chat-a',
            binding: { kind: 'character', ownerLocator: 'avatar-a.png', chatId: 'chat-a' },
            reference: { formatVersion: 1, osId: 'shop-os-a' },
        },
        b: {
            identityKey: 'character:avatar-b.png:chat-b',
            binding: { kind: 'character', ownerLocator: 'avatar-b.png', chatId: 'chat-b' },
            reference: { formatVersion: 1, osId: 'shop-os-b' },
        },
    };
    const chats = new Map(Object.entries(identities).map(([key, identity]) => [key, {
        messages: [{ role: 'user', text: `开场 ${key}` }],
        persisted: {
            formatVersion: 1,
            osId: identity.reference.osId,
            binding: structuredClone(identity.binding),
            revision: 0,
            commitId: `initial-${key}`,
            partitions: {
                economy: initialLedger(key, extraFunds),
                ...(initialShop === undefined ? {} : { shop: structuredClone(initialShop) }),
            },
        },
    }]));
    const state = {
        current: 'a',
        generationActive: false,
        eventId: 0,
        activationId: 0,
        kernelId: 0,
        replaces: [],
        replaceImpl: null,
    };
    const currentIdentity = () => identities[state.current];
    const chatByOsId = osId => [...chats.values()].find(chat => chat.persisted?.osId === osId);
    const persist = candidate => {
        const chat = chatByOsId(candidate.osId);
        if (!chat) { throw new Error(`unknown sidecar: ${candidate.osId}`); }
        chat.persisted = structuredClone(candidate);
    };
    const storage = {
        async read(osId) {
            return structuredClone(chatByOsId(osId)?.persisted ?? null);
        },
        async replace(input) {
            state.replaces.push(structuredClone(input));
            if (state.replaceImpl) { return await state.replaceImpl(input); }
            persist(input.candidate);
            return { status: 'confirmed' };
        },
        async delete() { return 'deleted'; },
    };
    const chatReferences = {
        hasPending: () => false,
        capture: () => structuredClone(currentIdentity()),
        isCurrent: captured => captured.identityKey === currentIdentity().identityKey,
        async install() { return { status: 'confirmed' }; },
    };
    const capabilities = createCapabilityRegistry(createEconomyCapabilityRegistrations());
    const partitions = new XiaobaiOsPartitionRegistry();
    for (const registration of capabilities.partitions()) { partitions.register(registration); }
    partitions.register(SHOP_PARTITION);
    const coordinator = createTransactionCoordinator({
        storage,
        partitions,
        chatReferences,
        capabilityBinder: capabilities,
        createId: () => `shop-kernel-${++state.kernelId}`,
    });
    await capabilities.install({
        createStore: (registration, allowedCapabilities) =>
            coordinator.createScopedStore(registration, { allowedCapabilities }),
        files: coordinator,
    });
    const economy = capabilities.require(ECONOMY_READ_CAPABILITY);
    const store = coordinator.createScopedStore(SHOP_PARTITION, {
        allowedCapabilities: [ECONOMY_READ_CAPABILITY, ECONOMY_TRANSACTION_CAPABILITY],
    });
    const shop = createShopService(store, coordinator, economy, {
        getCurrentChatIdentity: () => currentIdentity().identityKey,
        now: () => 1_000 + state.eventId,
        createEventId: () => `shop-event-${++state.eventId}`,
        createActivationId: () => `shop-activation-${++state.activationId}`,
        isMainGenerationActive: () => state.generationActive,
    });
    if (refreshShop) { await shop.refreshCurrent(); }

    return {
        capabilities,
        chats,
        coordinator,
        economy,
        identities,
        persist,
        shop,
        state,
        currentChat: () => chats.get(state.current),
        async switchChat(chat) {
            state.current = chat;
            await shop.refreshCurrent();
        },
    };
}

function purchaseInput(view, actionId, itemId = 'flower') {
    return {
        actionId,
        itemId,
        expectedRevision: view.projection.revision,
        expectedEventId: view.projection.eventId,
    };
}

function activateInput(view, actionId, itemId, parameters = {}) {
    return {
        actionId,
        itemId,
        parameters,
        expectedRevision: view.projection.revision,
        expectedEventId: view.projection.eventId,
    };
}

function deactivateInput(view, actionId, itemId, activationId) {
    return {
        actionId,
        itemId,
        activationId,
        expectedRevision: view.projection.revision,
        expectedEventId: view.projection.eventId,
    };
}

test('Shop partition parser is strict', () => {
    assert.equal(SHOP_PARTITION.parse({ schemaVersion: 2, events: [] }).ok, true);
    assert.equal(SHOP_PARTITION.parse({ schemaVersion: 2, events: [], leaked: true }).ok, false);
    assert.equal(SHOP_PARTITION.parse({ schemaVersion: 1, events: [] }).ok, false);
});

test('Shop module declares both Economy capabilities without a ledger-breaking partition-only reset', () => {
    const module = createShopModule({
        getChatIdentity: () => null,
        isMainGenerationActive: () => false,
        subscribeGeneration: () => () => undefined,
    });
    assert.equal(module.partition, SHOP_PARTITION);
    assert.deepEqual(module.capabilities.map(capability => capability.id), [
        'economy.read',
        'economy.transaction',
        'prompt.injection',
    ]);
    assert.equal(module.clearData, undefined);
});

test('a corrupt Shop partition is isolated from Economy reads', async () => {
    const harness = await createHarness({
        initialShop: { schemaVersion: 2, events: [], leaked: true },
        refreshShop: false,
    });

    await harness.economy.refresh();
    assert.equal(harness.economy.getPlayerBalance(), 100);
    await assert.rejects(harness.shop.refreshCurrent(), error => error.code === 'partition_invalid');
    assert.equal(harness.economy.getPlayerBalance(), 100);
});

test('purchase commits Shop and caller-bound Economy in one sidecar replace', async () => {
    const harness = await createHarness();
    const purchased = await harness.shop.purchaseCurrent(
        purchaseInput(harness.shop.readCurrent(), 'buy-flower'),
    );

    assert.equal(harness.state.replaces.length, 1);
    assert.equal(purchased.balance, 50);
    assert.equal(purchased.projection.inventory.flower.quantity, 1);
    const candidate = harness.state.replaces[0].candidate;
    assert.equal(candidate.partitions.shop.events.length, 1);
    assert.equal(candidate.partitions.economy.transactions.length, 2);
    assert.equal(candidate.partitions.economy.transactions[1].sourceDomain, 'shop');
    assert.equal(candidate.partitions.economy.transactions[1].actionId, 'buy-flower');
    assert.deepEqual(harness.currentChat().persisted, candidate);
});

test('insufficient funds, stale CAS and replay do not publish extra candidates', async () => {
    const harness = await createHarness();
    const empty = harness.shop.readCurrent();

    await assert.rejects(
        harness.shop.purchaseCurrent(purchaseInput(empty, 'buy-gift', 'gift-box')),
        error => error.code === 'economy_insufficient_funds',
    );
    assert.equal(harness.state.replaces.length, 0);
    assert.equal(harness.shop.readCurrent().domain, null);

    const first = await harness.shop.purchaseCurrent(purchaseInput(empty, 'stable-purchase'));
    const replay = await harness.shop.purchaseCurrent(purchaseInput(empty, 'stable-purchase'));
    assert.equal(harness.state.replaces.length, 1);
    assert.equal(replay.balance, 50);
    assert.equal(replay.projection.inventory.flower.quantity, 1);
    assert.equal(replay.domain.events[0].eventId, first.domain.events[0].eventId);

    await assert.rejects(
        harness.shop.purchaseCurrent(purchaseInput(empty, 'stale-purchase')),
        error => error.code === 'shop_revision_conflict',
    );
    assert.equal(harness.state.replaces.length, 1);
});

test('a definite replace failure rolls back Shop and Economy publication', async () => {
    const harness = await createHarness();
    const before = structuredClone(harness.currentChat().persisted);
    harness.state.replaceImpl = async () => ({
        status: 'failed',
        error: { code: 'SAVE_UNAVAILABLE', message: 'save unavailable', retryable: true },
    });

    await assert.rejects(
        harness.shop.purchaseCurrent(purchaseInput(harness.shop.readCurrent(), 'failed-purchase')),
        error => error.code === 'SAVE_UNAVAILABLE',
    );

    assert.equal(harness.state.replaces.length, 1);
    assert.deepEqual(harness.currentChat().persisted, before);
    assert.equal(harness.shop.readCurrent().domain, null);
    assert.equal(harness.shop.readCurrent().balance, 100);
    assert.equal(harness.shop.getWriteState(), 'ready');
});

test('unconfirmed purchase stays unpublished and retry reuses the exact Kernel candidate', async () => {
    const harness = await createHarness();
    let preparedCandidate;
    harness.state.replaceImpl = async input => {
        preparedCandidate = structuredClone(input.candidate);
        return { status: 'unconfirmed', observed: structuredClone(harness.currentChat().persisted) };
    };

    await assert.rejects(
        harness.shop.purchaseCurrent(purchaseInput(harness.shop.readCurrent(), 'pending-purchase')),
        error => error.code === 'SAVE_UNCONFIRMED' && error.uncertain === true,
    );
    assert.equal(harness.shop.readCurrent().domain, null);
    assert.equal(harness.shop.readCurrent().balance, 100);
    assert.equal(harness.shop.getWriteState(), 'unconfirmed');

    await assert.rejects(
        harness.shop.purchaseCurrent(purchaseInput(harness.shop.readCurrent(), 'blocked-purchase')),
        error => error.code === 'storage_unconfirmed',
    );
    assert.equal(harness.state.replaces.length, 1);

    harness.state.replaceImpl = async input => {
        assert.deepEqual(input.candidate, preparedCandidate);
        harness.persist(input.candidate);
        return { status: 'confirmed' };
    };
    assert.deepEqual(await harness.shop.confirmPending(), { status: 'confirmed' });
    assert.equal(harness.state.replaces.length, 2);
    assert.equal(harness.shop.readCurrent().balance, 50);
    assert.equal(harness.shop.readCurrent().projection.inventory.flower.quantity, 1);
    assert.equal(harness.shop.readCurrent().domain.events[0].eventId, 'shop-event-1');
});

test('activate and deactivate are generation guarded and never append Economy transactions', async () => {
    const harness = await createHarness({ extraFunds: 1_200 });
    harness.state.generationActive = true;
    const purchased = await harness.shop.purchaseCurrent(
        purchaseInput(harness.shop.readCurrent(), 'buy-camera', 'privacy-camera'),
    );
    const transactionCount = harness.economy.getTransactionCount();

    await assert.rejects(harness.shop.activateCurrent(activateInput(
        purchased,
        'blocked-camera-use',
        'privacy-camera',
        { targetName: '艾拉' },
    )), /shop_main_generation_active/);
    assert.equal(harness.state.replaces.length, 1);

    harness.state.generationActive = false;
    const activated = await harness.shop.activateCurrent(activateInput(
        purchased,
        'use-camera',
        'privacy-camera',
        { targetName: '艾拉' },
    ));
    assert.equal(harness.economy.getTransactionCount(), transactionCount);

    harness.state.generationActive = true;
    await assert.rejects(harness.shop.deactivateCurrent(deactivateInput(
        activated,
        'blocked-camera-close',
        'privacy-camera',
        'shop-activation-1',
    )), /shop_main_generation_active/);
    assert.equal(harness.state.replaces.length, 2);

    harness.state.generationActive = false;
    const deactivated = await harness.shop.deactivateCurrent(deactivateInput(
        activated,
        'close-camera',
        'privacy-camera',
        'shop-activation-1',
    ));
    assert.equal(deactivated.projection.activations[0].deactivatedByEventId, 'shop-event-3');
    assert.equal(harness.economy.getTransactionCount(), transactionCount);
    assert.equal(harness.state.replaces.length, 3);
});

test('Shop state and delivery identity remain isolated by chat', async () => {
    const harness = await createHarness();
    await harness.shop.purchaseCurrent(purchaseInput(harness.shop.readCurrent(), 'purchase-a'));
    const chatA = structuredClone(harness.chats.get('a').persisted);

    await harness.switchChat('b');
    assert.equal(harness.shop.readCurrent().domain, null);
    assert.equal(harness.shop.readCurrent().balance, 100);
    await assert.rejects(harness.shop.commitDeliveryCurrent({
        chatIdentity: harness.identities.a.identityKey,
        actionId: 'delivery-from-a',
        receipt: { schemaVersion: 1, activeActivationIds: [], transitionActivationIds: [] },
    }), /shop_generation_chat_changed/);
    assert.equal(harness.state.replaces.length, 1);

    await harness.shop.purchaseCurrent(purchaseInput(harness.shop.readCurrent(), 'purchase-b'));
    assert.equal(harness.shop.readCurrent().projection.inventory.flower.quantity, 1);
    assert.deepEqual(harness.chats.get('a').persisted, chatA);

    await harness.switchChat('a');
    assert.equal(harness.shop.readCurrent().projection.inventory.flower.quantity, 1);
    assert.equal(harness.shop.readCurrent().domain.events[0].actionId, 'purchase-a');
});

test('in-memory delivery queue projects behind a slow sidecar write and then commits in order', async () => {
    const harness = await createHarness({ extraFunds: 100 });
    const purchased = await harness.shop.purchaseCurrent(
        purchaseInput(harness.shop.readCurrent(), 'buy-effect-flower'),
    );
    await harness.shop.activateCurrent(
        activateInput(purchased, 'use-effect-flower', 'flower', { targetName: '艾拉' }),
    );
    const saveStarted = deferred();
    const releaseSave = deferred();
    const deliveryCommitted = deferred();
    harness.state.replaceImpl = async input => {
        saveStarted.resolve();
        await releaseSave.promise;
        harness.persist(input.candidate);
        return { status: 'confirmed' };
    };
    const priorWrite = harness.shop.purchaseCurrent(
        purchaseInput(harness.shop.readCurrent(), 'slow-unrelated-purchase'),
    );
    await saveStarted.promise;
    const deliveries = createShopEffectDeliveryQueue({
        readCurrent: () => ({
            chatIdentity: harness.identities[harness.state.current].identityKey,
            domain: harness.shop.readCurrent().domain,
        }),
        async persist(delivery) {
            await harness.shop.commitDeliveryCurrent(delivery);
            deliveryCommitted.resolve();
        },
        now: () => 5_000,
    });
    const receipt = createShopEffectReceipt(deliveries.readCurrent(harness.identities.a.identityKey));

    deliveries.enqueue({
        chatIdentity: harness.identities.a.identityKey,
        actionId: 'reply-during-slow-save',
        receipt,
    });

    assert.equal(projectShopState(harness.shop.readCurrent().domain).activations[0].appliedCount, 0);
    assert.equal(projectShopState(deliveries.readCurrent(harness.identities.a.identityKey)).activations[0].appliedCount, 1);
    releaseSave.resolve();
    await priorWrite;
    await deliveryCommitted.promise;
    assert.equal(projectShopState(harness.shop.readCurrent().domain).activations[0].appliedCount, 1);
});

test('host message edits cannot rewind committed Shop or Economy facts', async () => {
    const harness = await createHarness();
    const purchased = await harness.shop.purchaseCurrent(
        purchaseInput(harness.shop.readCurrent(), 'durable-purchase'),
    );
    await harness.shop.activateCurrent(
        activateInput(purchased, 'durable-use', 'flower', { targetName: '艾拉' }),
    );
    const receipt = createShopEffectReceipt(harness.shop.readCurrent().domain);
    harness.currentChat().messages.push({ role: 'assistant', text: '原回复', shopEffectReceipt: receipt });
    await harness.shop.commitDeliveryCurrent({
        chatIdentity: harness.identities.a.identityKey,
        actionId: 'durable-delivery',
        receipt,
    });
    const committed = harness.shop.readCurrent();
    const replaces = harness.state.replaces.length;

    harness.currentChat().messages[0].text = '重写开场';
    harness.currentChat().messages.splice(1);

    assert.deepEqual(harness.shop.readCurrent(), committed);
    assert.equal(harness.state.replaces.length, replaces);
    assert.equal(committed.balance, 50);
    assert.equal(committed.projection.activations[0].appliedCount, 1);
});

test('a failed delivery replace keeps the committed Shop partition', async () => {
    const harness = await createHarness();
    const purchased = await harness.shop.purchaseCurrent(purchaseInput(harness.shop.readCurrent(), 'buy-failed'));
    await harness.shop.activateCurrent(activateInput(purchased, 'use-failed', 'flower', { targetName: '艾拉' }));
    const before = structuredClone(harness.currentChat().persisted);
    const receipt = createShopEffectReceipt(harness.shop.readCurrent().domain);
    harness.state.replaceImpl = async () => ({
        status: 'failed',
        error: { code: 'SAVE_UNAVAILABLE', message: 'save failed', retryable: true },
    });

    await assert.rejects(harness.shop.commitDeliveryCurrent({
        chatIdentity: harness.identities.a.identityKey,
        actionId: 'failed-reply',
        receipt,
    }), error => error.code === 'SAVE_UNAVAILABLE');
    assert.deepEqual(harness.currentChat().persisted, before);
    assert.equal(harness.shop.readCurrent().projection.activations[0].appliedCount, 0);
});
