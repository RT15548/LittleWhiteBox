import assert from 'node:assert/strict';
import test from 'node:test';

import { createShopController } from '../apps/shop/host/controller.js';

function deferred() {
    let resolve;
    const promise = new Promise(resolvePromise => { resolve = resolvePromise; });
    return { promise, resolve };
}

function nextTask() {
    return new Promise(resolve => setTimeout(resolve, 0));
}

function emptyView(writeState = 'ready') {
    return {
        domain: null,
        projection: { revision: 0, eventId: '', inventory: {}, activations: [] },
        balance: 100,
        writeState,
    };
}

function createHarness({ economyOpened = true, writeState = 'ready' } = {}) {
    const host = {
        identity: { key: 'character:1:chat-a', chatId: 'chat-a' },
        posts: [],
    };
    let view = emptyView(writeState);
    let opened = economyOpened;
    let generationActive = false;
    let generationListener = null;
    let shopListener = null;
    let ensureCalls = 0;
    const commands = [];
    const shop = {
        readCurrent: () => structuredClone(view),
        async refreshCurrent() {return structuredClone(view);},
        async purchaseCurrent(input) {
            commands.push({ kind: 'purchase', input: structuredClone(input) });
            view = {
                ...view,
                balance: 50,
                projection: {
                    ...view.projection,
                    revision: 1,
                    eventId: 'shop-event-1',
                    inventory: { flower: { itemId: 'flower', quantity: 1, purchasedCount: 1 } },
                },
            };
            return structuredClone(view);
        },
        async activateCurrent(input) {
            commands.push({ kind: 'activate', input: structuredClone(input) });
            return structuredClone(view);
        },
        async deactivateCurrent(input) {
            commands.push({ kind: 'deactivate', input: structuredClone(input) });
            return structuredClone(view);
        },
        async commitDeliveryCurrent() {return structuredClone(view);},
        async confirmPending() {
            view = { ...view, writeState: 'ready' };
            return { status: 'confirmed' };
        },
        async adoptServerState() {return { status: 'adopted' };},
        getWriteState: () => view.writeState,
        subscribe(listener) {
            shopListener = listener;
            return () => {shopListener = null;};
        },
        dispose() {},
    };
    const economy = {
        isOpen: () => opened,
        async ensureOpen() {
            ensureCalls += 1;
            opened = true;
        },
    };
    const controller = createShopController({
        shop,
        economy,
        getChatIdentity: () => host.identity,
        isMainGenerationActive: () => generationActive,
        subscribeGeneration(listener) {
            generationListener = listener;
            return () => {generationListener = null;};
        },
    });
    controller.startBackground();
    return {
        commands,
        controller,
        host,
        shop,
        get ensureCalls() {return ensureCalls;},
        setGeneration(active) {
            generationActive = active;
            generationListener?.(active);
        },
        publishData(next, identity = host.identity.key) {
            if (identity !== host.identity.key) {return;}
            view = structuredClone(next);
            shopListener?.();
        },
    };
}

async function activate(harness, { waitForPreparation = true } = {}) {
    const initial = await harness.controller.activate({
        post(type, payload) {
            harness.host.posts.push({ type, payload });
            return true;
        },
    });
    if (!waitForPreparation) {return initial;}
    await nextTask();
    return harness.host.posts.findLast(post => post.type === 'shop/state')?.payload.state || initial;
}

test('shop prepares a missing Economy only and opens existing data immediately', async () => {
    const unopened = createHarness({ economyOpened: false });
    const fresh = await activate(unopened, { waitForPreparation: false });
    assert.equal(fresh.balance, 100);
    assert.equal(fresh.catalog.length, 25);
    assert.equal(fresh.status, 'loading');
    assert.equal(unopened.ensureCalls, 0);
    await nextTask();
    assert.equal(unopened.host.posts.findLast(post => post.type === 'shop/state').payload.state.status, 'ready');

    const existing = createHarness();
    const ready = await activate(existing, { waitForPreparation: false });
    assert.equal(ready.status, 'ready');
    assert.equal(existing.ensureCalls, 0);
    await nextTask();
    assert.equal(existing.ensureCalls, 0);
    assert.equal(existing.host.posts.length, 0);
});

test('purchase accepts only identity, CAS, action and item fields and publishes the confirmed state', async () => {
    const harness = createHarness();
    const initial = await activate(harness);
    const result = await harness.controller.handleMessage({
        type: 'shop/purchase',
        payload: {
            chatIdentity: harness.host.identity.key,
            expectedRevision: initial.revision,
            expectedEventId: initial.eventId,
            actionId: 'ui-buy-flower',
            itemId: 'flower',
            price: 1,
            trustedRule: 'not trusted',
        },
    });

    assert.deepEqual(harness.commands, [{
        kind: 'purchase',
        input: {
            expectedRevision: 0,
            expectedEventId: '',
            actionId: 'ui-buy-flower',
            itemId: 'flower',
        },
    }]);
    assert.equal(result.balance, 50);
    assert.equal(result.catalog.find(item => item.id === 'flower').quantity, 1);
    assert.equal(harness.host.posts.findLast(post => post.type === 'shop/state').payload.state.balance, 50);
});

test('shop rejects malformed CAS tokens before invoking the service', async () => {
    const cases = [
        { expectedRevision: '0', expectedEventId: '' },
        { expectedRevision: null, expectedEventId: '' },
        { expectedRevision: false, expectedEventId: '' },
        { expectedRevision: 0, expectedEventId: null },
        { expectedRevision: 1, expectedEventId: ' padded ' },
        { expectedRevision: 1, expectedEventId: 'x'.repeat(201) },
    ];
    for (const token of cases) {
        const harness = createHarness();
        await activate(harness);
        await assert.rejects(harness.controller.handleMessage({
            type: 'shop/purchase',
            payload: {
                chatIdentity: harness.host.identity.key,
                actionId: 'malformed-cas',
                itemId: 'flower',
                ...token,
            },
        }), /商店状态版本无效/);
        assert.deepEqual(harness.commands, []);
    }
});

test('shop controller serializes writes and invalidates the active page after a chat switch', async () => {
    const harness = createHarness();
    const initial = await activate(harness);
    const pending = deferred();
    harness.shop.purchaseCurrent = () => pending.promise;
    const payload = {
        chatIdentity: harness.host.identity.key,
        expectedRevision: initial.revision,
        expectedEventId: initial.eventId,
        actionId: 'pending-buy',
        itemId: 'flower',
    };
    const first = harness.controller.handleMessage({ type: 'shop/purchase', payload });
    await assert.rejects(
        harness.controller.handleMessage({ type: 'shop/purchase', payload: { ...payload, actionId: 'second-buy' } }),
        /已有商店操作正在处理/,
    );
    harness.host.identity = { key: 'character:2:chat-b', chatId: 'chat-b' };
    pending.resolve(emptyView());
    await assert.rejects(first, /聊天已切换/);
    harness.controller.handleChatChanged();
    await assert.rejects(
        harness.controller.handleMessage({ type: 'shop/refresh', payload: { chatIdentity: payload.chatIdentity } }),
        /商店 APP 未激活/,
    );
});

test('generation changes refresh Shop presentation without writing Shop data', async () => {
    const harness = createHarness();
    await activate(harness);
    harness.setGeneration(true);
    assert.equal(harness.host.posts.findLast(post => post.type === 'shop/state').payload.state.generationActive, true);

    const pushed = harness.host.posts.findLast(post => post.type === 'shop/state').payload.state;
    assert.equal(pushed.status, 'ready');
    assert.equal(harness.commands.length, 0);
});

test('background root commits publish the latest Shop revision and save state', async () => {
    const harness = createHarness();
    await activate(harness);
    const background = {
        ...emptyView('saving'),
        projection: { revision: 1, eventId: 'reply-event-1', inventory: {}, activations: [] },
    };

    harness.publishData(background);
    let pushed = harness.host.posts.findLast(post => post.type === 'shop/state').payload.state;
    assert.equal(pushed.revision, 1);
    assert.equal(pushed.status, 'saving');

    harness.publishData({ ...background, writeState: 'ready' });
    pushed = harness.host.posts.findLast(post => post.type === 'shop/state').payload.state;
    assert.equal(pushed.revision, 1);
    assert.equal(pushed.status, 'ready');

    const postCount = harness.host.posts.length;
    harness.publishData(background, 'character:2:chat-b');
    assert.equal(harness.host.posts.length, postCount);
});

test('an unconfirmed Shop save exposes the shared confirmation result', async () => {
    const harness = createHarness({ writeState: 'unconfirmed' });
    const initial = await activate(harness);
    assert.equal(initial.status, 'unconfirmed');
    const result = await harness.controller.handleMessage({
        type: 'shop/confirm-save',
        payload: { chatIdentity: harness.host.identity.key },
    });
    assert.equal(result.confirmation, 'confirmed');
    assert.equal(result.state.status, 'ready');
});
