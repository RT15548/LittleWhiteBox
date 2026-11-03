import assert from 'node:assert/strict';
import test from 'node:test';

import {
    createShopPublishedContracts,
    createShopShelf,
    getShopContract,
    getShopShelfContract,
    listShopPublishedContracts,
    listShopShelfContracts,
} from '../domains/shop/catalog.js';
import { normalizeShopParameters, parseShopEffectReceipt, validateShopDomain } from '../domains/shop/invariants.js';
import {
    activateShopItem,
    createEmptyShopState,
    createShopEffectReceipt,
    deactivateShopItem,
    deliverShopEffects,
    getShopCasToken,
    isShopActivationActive,
    projectShopState,
    purchaseShopItem,
    shopRemainingApplications,
} from '../domains/shop/timeline.js';

function dependencies() {
    let sequence = 0;
    return {
        now: () => 1_000 + sequence,
        createEventId: () => `shop-event-${++sequence}`,
    };
}

function command(domain, actionId, fields = {}) {
    return { ...getShopCasToken(domain), actionId, ...fields };
}

function buyAndActivate(domain, deps, itemId, activationId, parameters = {}) {
    domain = purchaseShopItem(domain, command(domain, `buy-${activationId}`, { itemId }), deps).domain;
    return activateShopItem(domain, command(domain, `use-${activationId}`, {
        itemId,
        activationId,
        parameters,
    }), deps).domain;
}

function deliver(domain, deps, actionId) {
    return deliverShopEffects(domain, command(domain, actionId, {
        receipt: createShopEffectReceipt(domain),
    }), deps);
}

test('published contracts and the current shelf have separate immutable ownership', () => {
    assert.equal(listShopPublishedContracts().length, 25);
    assert.equal(listShopShelfContracts().length, 25);
    assert.throws(() => getShopContract('missing'), error => error.code === 'shop_item_missing');
    const flower = getShopContract('flower');
    assert.throws(
        () => createShopPublishedContracts([flower, { ...flower }]),
        error => error.code === 'shop_invalid_catalog',
    );
    const shelfWithoutFlower = createShopShelf(
        listShopShelfContracts().map(item => item.id).filter(id => id !== flower.id),
    );
    assert.throws(
        () => getShopShelfContract(flower.id, shelfWithoutFlower),
        error => error.code === 'shop_item_not_for_sale',
    );
    assert.equal(getShopContract(flower.id), flower);
    assert.deepEqual(
        normalizeShopParameters(flower, { targetName: '  Ａ\u0000\n　Ｂ  ', ignored: 'not persisted' }),
        { targetName: 'A B' },
    );
});

test('schema v2 stores actions only and rejects the removed Assistant-floor format', () => {
    const deps = dependencies();
    let domain = createEmptyShopState();
    domain = purchaseShopItem(domain, command(domain, 'buy-flower', { itemId: 'flower' }), deps).domain;
    domain = activateShopItem(domain, command(domain, 'use-flower', {
        itemId: 'flower', activationId: 'flower-a', parameters: { targetName: '艾拉' },
    }), deps).domain;

    assert.equal(domain.schemaVersion, 2);
    assert.equal(Object.hasOwn(domain.events[0], 'assistantTurn'), false);
    assert.doesNotThrow(() => validateShopDomain(domain));
    const oldShape = structuredClone(domain);
    oldShape.events[0].assistantTurn = 3;
    assert.throws(() => validateShopDomain(oldShape), error => error.code === 'shop_invalid_domain');
});

test('a finite effect consumes exactly one application per delivered new reply and expires once', () => {
    const deps = dependencies();
    let domain = buyAndActivate(
        createEmptyShopState(), deps, 'no-anger-sticker', 'sticker-a', { targetName: '艾拉' },
    );
    const item = getShopContract('no-anger-sticker');

    for (let index = 1; index <= 5; index += 1) {
        const receipt = createShopEffectReceipt(domain);
        assert.deepEqual(receipt.activeActivationIds, ['sticker-a']);
        domain = deliverShopEffects(domain, command(domain, `reply-${index}`, { receipt }), deps).domain;
        const activation = projectShopState(domain).activations[0];
        assert.equal(activation.appliedCount, index);
        assert.equal(shopRemainingApplications(activation, item), 5 - index);
        assert.equal(isShopActivationActive(activation, item), index < 5);
    }

    const transition = createShopEffectReceipt(domain);
    assert.deepEqual(transition, {
        schemaVersion: 1,
        activeActivationIds: [],
        transitionActivationIds: ['sticker-a'],
    });
    domain = deliverShopEffects(domain, command(domain, 'reply-expiration', { receipt: transition }), deps).domain;
    assert.deepEqual(createShopEffectReceipt(domain), {
        schemaVersion: 1,
        activeActivationIds: [],
        transitionActivationIds: [],
    });
});

test('manual effects close only by command while permanent effects never consume a counter', () => {
    const deps = dependencies();
    let domain = buyAndActivate(
        createEmptyShopState(), deps, 'privacy-camera', 'camera-a', { targetName: '艾拉' },
    );
    domain = deactivateShopItem(domain, command(domain, 'close-camera', {
        itemId: 'privacy-camera', activationId: 'camera-a',
    }), deps).domain;
    assert.deepEqual(createShopEffectReceipt(domain).transitionActivationIds, ['camera-a']);
    domain = deliver(domain, deps, 'deliver-close').domain;
    assert.deepEqual(createShopEffectReceipt(domain).transitionActivationIds, []);

    domain = buyAndActivate(domain, deps, 'absolute-obedience', 'obedience-a', { targetName: '艾拉' });
    const before = domain.events.length;
    const result = deliver(domain, deps, 'deliver-permanent');
    assert.equal(result.created, false);
    assert.equal(result.event, null);
    assert.equal(result.domain.events.length, before);
    assert.deepEqual(createShopEffectReceipt(result.domain).activeActivationIds, ['obedience-a']);
});

test('delivery replay is idempotent before CAS and a forged receipt cannot consume effects', () => {
    const deps = dependencies();
    let domain = buyAndActivate(createEmptyShopState(), deps, 'flower', 'flower-a', { targetName: '艾拉' });
    const receipt = createShopEffectReceipt(domain);
    domain = deliverShopEffects(domain, command(domain, 'reply-one', { receipt }), deps).domain;
    const replay = deliverShopEffects(domain, {
        expectedRevision: 0,
        expectedEventId: '',
        actionId: 'reply-one',
        receipt,
    }, deps);
    assert.equal(replay.created, false);
    assert.equal(replay.domain.events.length, domain.events.length);

    assert.throws(() => deliverShopEffects(domain, command(domain, 'forged', {
        receipt: { schemaVersion: 1, activeActivationIds: ['flower-a'], transitionActivationIds: [] },
    }), deps), error => error.code === 'shop_effect_receipt_invalid');
});

test('receipt parsing rejects unknown fields, duplicates and overlapping roles', () => {
    assert.deepEqual(parseShopEffectReceipt({
        schemaVersion: 1,
        activeActivationIds: ['a'],
        transitionActivationIds: [],
    }).activeActivationIds, ['a']);
    for (const receipt of [
        { schemaVersion: 1, activeActivationIds: ['a', 'a'], transitionActivationIds: [] },
        { schemaVersion: 1, activeActivationIds: ['a'], transitionActivationIds: ['a'] },
        { schemaVersion: 1, activeActivationIds: [], transitionActivationIds: [], extra: true },
    ]) {
        assert.throws(() => parseShopEffectReceipt(receipt), error => error.code === 'shop_effect_receipt_invalid');
    }
});

test('inventory, consumed items and delivery counts have no conversation input to rewind', () => {
    const deps = dependencies();
    let domain = buyAndActivate(createEmptyShopState(), deps, 'flower', 'flower-a', { targetName: '艾拉' });
    domain = deliver(domain, deps, 'reply-one').domain;
    const committed = structuredClone(projectShopState(domain));

    const hostMessages = [{ role: 'user' }, { role: 'assistant' }, { role: 'assistant' }];
    hostMessages.splice(1);

    assert.deepEqual(projectShopState(domain), committed);
    assert.equal(committed.inventory.flower.quantity, 0);
    assert.equal(committed.activations[0].appliedCount, 1);
    assert.equal(isShopActivationActive(committed.activations[0], getShopContract('flower')), false);
});
