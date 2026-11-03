import assert from 'node:assert/strict';
import test from 'node:test';

import { createShopPromptRuntime } from '../apps/shop/host/prompt-runtime.js';
import {
    activateShopItem,
    createEmptyShopState,
    createShopEffectReceipt,
    deliverShopEffects,
    getShopCasToken,
    purchaseShopItem,
} from '../domains/shop/timeline.js';

function command(domain, actionId, fields = {}) {
    return { ...getShopCasToken(domain), actionId, ...fields };
}

function activeFlowerDomain() {
    let sequence = 0;
    const dependencies = {
        now: () => 1_000 + sequence,
        createEventId: () => `event-${++sequence}`,
    };
    let domain = createEmptyShopState();
    domain = purchaseShopItem(domain, command(domain, 'buy-flower', { itemId: 'flower' }), dependencies).domain;
    domain = activateShopItem(domain, command(domain, 'use-flower', {
        activationId: 'activation-flower',
        itemId: 'flower',
        parameters: { targetName: '艾拉' },
    }), dependencies).domain;
    return { domain, dependencies };
}

function createHarness({ domain: initialDomain, messages, enqueueDelivery = () => {} } = {}) {
    const active = activeFlowerDomain();
    let domain = initialDomain || active.domain;
    const snapshot = {
        identityKey: 'character:1:chat-a',
        messages: messages || [{ role: 'user', content: '你好' }],
    };
    const prompts = [];
    const errors = [];
    const bindings = [];
    const deliveries = [];
    let handlers = null;
    let captures = 0;
    let actionSequence = 0;
    const runtime = createShopPromptRuntime({
        captureConversation() {captures += 1; return structuredClone(snapshot);},
        readShop: chatIdentity => chatIdentity === snapshot.identityKey ? structuredClone(domain) : null,
        enqueueDelivery(input) {
            deliveries.push(structuredClone(input));
            enqueueDelivery(input);
        },
        bindReplyReceipt(input) {
            const message = snapshot.messages[input.messageId];
            if (!message || snapshot.identityKey !== input.chatIdentity) {throw new Error('invalid receipt message');}
            const hadReceipt = Object.hasOwn(message, 'shopEffectReceipt');
            const previous = structuredClone(message.shopEffectReceipt);
            message.shopEffectReceipt = structuredClone(input.receipt);
            bindings.push(structuredClone(input));
            return {
                rollback() {
                    if (hadReceipt) {message.shopEffectReceipt = structuredClone(previous);}
                    else {delete message.shopEffectReceipt;}
                },
            };
        },
        setPrompt: value => prompts.push(value),
        subscribe(next) {handlers = next; return () => {handlers = null;};},
        createActionId: () => `delivery-${++actionSequence}`,
        onError: error => errors.push(error),
    });
    runtime.startBackground();
    return {
        active,
        bindings,
        deliveries,
        errors,
        get captures() {return captures;},
        handlers: () => handlers,
        prompts,
        runtime,
        snapshot,
        setDomain(next) {domain = next;},
    };
}

test('MESSAGE_RECEIVED synchronously binds the receipt and admits delivery before returning', () => {
    const harness = createHarness();
    const handlers = harness.handlers();
    handlers.generationStarted({ type: 'normal', dryRun: false });
    handlers.intercept({ type: 'normal' });

    assert.match(harness.prompts.at(-1), /艾拉/);
    assert.equal(harness.deliveries.length, 0);
    handlers.requestBuilt();
    assert.equal(harness.prompts.at(-1), '');
    harness.snapshot.messages.push({ role: 'assistant', content: '新的回复' });
    const returned = handlers.messageReceived(1, 'normal');
    assert.equal(returned, undefined);
    assert.equal(harness.bindings.length, 1);
    assert.equal(harness.deliveries.length, 1);
    assert.equal(harness.deliveries[0].chatIdentity, 'character:1:chat-a');
    assert.deepEqual(harness.deliveries[0].receipt.activeActivationIds, ['activation-flower']);
    assert.deepEqual(harness.snapshot.messages[1].shopEffectReceipt, harness.deliveries[0].receipt);
    assert.deepEqual(harness.errors, []);
});

test('a rejected delivery admission rolls back the message receipt and reports the failure', () => {
    const failure = new Error('delivery admission failed');
    const harness = createHarness({ enqueueDelivery: () => {throw failure;} });
    const handlers = harness.handlers();
    handlers.generationStarted({ type: 'normal', dryRun: false });
    handlers.intercept({ type: 'normal' });
    harness.snapshot.messages.push({ role: 'assistant', content: '新的回复' });

    assert.equal(handlers.messageReceived(1, 'normal'), undefined);
    assert.deepEqual(harness.errors, [failure]);
    assert.equal(Object.hasOwn(harness.snapshot.messages[1], 'shopEffectReceipt'), false);
});

test('stopped, dry-run and empty generations never record an application', async () => {
    const harness = createHarness();
    const handlers = harness.handlers();
    handlers.generationStarted({ type: 'normal', dryRun: false });
    handlers.intercept({ type: 'normal' });
    handlers.generationStopped();
    harness.snapshot.messages.push({ role: 'assistant', content: '停止后留下的部分回复' });
    await handlers.messageReceived(1, 'normal');
    assert.equal(harness.deliveries.length, 0);

    handlers.generationStarted({ type: 'normal', dryRun: true });
    handlers.intercept({ type: 'normal' });
    await handlers.messageReceived(1, 'normal');
    assert.equal(harness.deliveries.length, 0);

    harness.snapshot.messages[1].content = '';
    handlers.generationStarted({ type: 'normal', dryRun: false });
    handlers.intercept({ type: 'normal' });
    handlers.generationEnded();
    await handlers.messageReceived(1, 'normal');
    assert.equal(harness.deliveries.length, 0);
});

test('regenerate captures the old receipt before deletion and attaches it without consuming again', async () => {
    const active = activeFlowerDomain();
    const receipt = createShopEffectReceipt(active.domain);
    const consumed = deliverShopEffects(active.domain, command(active.domain, 'reply-one', { receipt }), active.dependencies).domain;
    const harness = createHarness({
        domain: consumed,
        messages: [
            { role: 'user', content: '你好' },
            { role: 'assistant', content: '旧回复', shopEffectReceipt: receipt },
        ],
    });
    const handlers = harness.handlers();
    handlers.generationStarted({ type: 'regenerate', dryRun: false });
    harness.snapshot.messages.splice(1);
    handlers.intercept({ type: 'regenerate' });
    assert.match(harness.prompts.at(-1), /艾拉/);
    harness.snapshot.messages.push({ role: 'assistant', content: '重抽后的回复' });
    await handlers.messageReceived(1, 'normal');
    assert.equal(harness.bindings.length, 1);
    assert.equal(harness.deliveries.length, 0);
    assert.deepEqual(harness.bindings[0].receipt, receipt);
    assert.deepEqual(harness.errors, []);
});

test('swipe and continue read the existing receipt without a Shop write', async () => {
    const active = activeFlowerDomain();
    const receipt = createShopEffectReceipt(active.domain);
    const consumed = deliverShopEffects(active.domain, command(active.domain, 'reply-one', { receipt }), active.dependencies).domain;
    const harness = createHarness({
        domain: consumed,
        messages: [
            { role: 'user', content: '你好' },
            { role: 'assistant', content: '旧回复', shopEffectReceipt: receipt },
        ],
    });
    const handlers = harness.handlers();
    for (const mode of ['swipe', 'continue']) {
        handlers.generationStarted({ type: mode, dryRun: false });
        handlers.intercept({ type: mode });
        assert.match(harness.prompts.at(-1), /艾拉/);
        await handlers.messageReceived(1, mode);
    }
    assert.equal(harness.deliveries.length, 0);
    assert.equal(harness.bindings.length, 0);
});

test('a deleted effect-bearing message cannot return its receipt to the next reply', () => {
    const active = activeFlowerDomain();
    const receipt = createShopEffectReceipt(active.domain);
    const consumed = deliverShopEffects(active.domain, command(active.domain, 'reply-one', { receipt }), active.dependencies).domain;
    const harness = createHarness({ domain: consumed, messages: [{ role: 'user', content: '你好' }] });
    harness.handlers().generationStarted({ type: 'normal', dryRun: false });
    harness.handlers().intercept({ type: 'normal' });
    assert.equal(harness.prompts.at(-1), '');
    assert.equal(harness.deliveries.length, 0);
});

test('preflight failures, chat changes and shutdown cannot leave prompt or pending state', async () => {
    const harness = createHarness();
    const handlers = harness.handlers();
    assert.equal(harness.prompts.length, 0);
    handlers.intercept({ type: 'quiet' });
    assert.equal(harness.captures, 0);
    assert.equal(harness.prompts.at(-1), '');

    handlers.generationStarted({ type: 'normal', dryRun: false });
    handlers.intercept({ type: 'normal' });
    harness.runtime.handleChatChanged();
    await handlers.messageReceived(1, 'normal');
    assert.equal(harness.deliveries.length, 0);
    harness.runtime.stopBackground();
    assert.equal(harness.handlers(), null);
    assert.equal(harness.prompts.at(-1), '');
});
