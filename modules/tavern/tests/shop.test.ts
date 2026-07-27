import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';

import db, {
    appendTavernMessage,
    branchTavernSession,
    createTavernSession,
    deleteTavernSession,
    getLatestTavernMessage,
    updateTavernSessionState,
    tavernEconomyAccountsTable,
    tavernEconomyTransactionsTable,
    tavernSessionsTable,
    tavernShopStateVersionsTable,
} from '../shared/session-db';
import {
    captureTavernPhoneBoundary,
    type TavernExpectedPhoneBoundary,
} from '../shared/phone-boundary';
import {
    getTavernPlayerBalance,
    postTavernEconomyTransaction,
} from '../shared/economy/economy-service';
import {
    TAVERN_PLAYER_ACCOUNT_ID,
    TAVERN_SYSTEM_MINT_ACCOUNT_ID,
    TAVERN_SYSTEM_SINK_ACCOUNT_ID,
} from '../shared/economy/economy-types';
import {
    activateTavernShopItem,
    deactivateTavernShopItem,
    getCurrentTavernShopState,
    getTavernShopStateAtAnchor,
    purchaseTavernShopItem,
} from '../shared/shop/shop-service';
import {
    findTavernShopItem,
    getTavernShopItem,
    listTavernShopCatalog,
} from '../shared/shop/shop-catalog';
import {
    isTavernShopActivationActive,
    normalizeTavernShopParameters,
    tavernShopRemainingRounds,
    TAVERN_SHOP_CURRENT_MARKER,
    type TavernShopInventoryState,
} from '../shared/shop/shop-types';
import {
    buildTavernShopPromptBlock,
    buildTavernShopRuntimeDepthEntries,
    listTavernShopActiveEffects,
    placeTavernShopPromptBlockBeforeCurrentUser,
    TAVERN_SHOP_PROMPT_DEPTH_ORDER,
    TAVERN_SHOP_PROMPT_LAYER,
} from '../shared/shop/shop-prompt';
import {
    describeTavernAcceptedEconomicRestoreImpact,
    restoreTavernAcceptedEconomicStateToFloor,
} from '../shared/accepted-economic-state';
import type { XbTavernMessage } from '../shared/message-assembler';

async function resetDb() {
    await db.delete();
    await db.open();
}

async function boundaryForTest(input: {
    sessionId: string;
    anchorOrder?: number;
    boundary?: TavernExpectedPhoneBoundary;
}): Promise<TavernExpectedPhoneBoundary> {
    if (Object.prototype.hasOwnProperty.call(input, 'boundary')) {return input.boundary ?? null;}
    const desiredAnchor = Math.max(0, Math.floor(Number(input.anchorOrder) || 0));
    let latest = await getLatestTavernMessage(input.sessionId);
    while (Number(latest?.order ?? -1) + 1 < desiredAnchor) {
        const nextOrder = Number(latest?.order ?? -1) + 1;
        latest = await appendTavernMessage(input.sessionId, {
            role: nextOrder % 2 === 0 ? 'user' : 'assistant',
            content: `商店测试剧情 ${nextOrder}`,
        });
    }
    if (Number(latest?.order ?? -1) + 1 !== desiredAnchor) {
        throw new Error(`test_phone_boundary_regression:${desiredAnchor}`);
    }
    return await captureTavernPhoneBoundary(input.sessionId);
}

type ShopActionInput<T extends { boundary: TavernExpectedPhoneBoundary; expectedRevision: number; expectedVersionId: string }> =
    Omit<T, 'boundary' | 'expectedRevision' | 'expectedVersionId'> & {
        anchorOrder?: number;
        boundary?: TavernExpectedPhoneBoundary;
        expectedRevision?: number;
        expectedVersionId?: string;
    };

async function currentShopCas(sessionId: string) {
    const current = await getCurrentTavernShopState(sessionId);
    return {
        expectedRevision: current?.revision ?? 0,
        expectedVersionId: current?.versionId ?? '',
    };
}

async function purchaseItem(input: ShopActionInput<Parameters<typeof purchaseTavernShopItem>[0]>) {
    const cas = await currentShopCas(input.sessionId);
    const { anchorOrder: _anchorOrder, boundary: _boundary, ...rest } = input;
    return await purchaseTavernShopItem({
        ...rest,
        boundary: await boundaryForTest(input),
        expectedRevision: input.expectedRevision ?? cas.expectedRevision,
        expectedVersionId: input.expectedVersionId ?? cas.expectedVersionId,
    });
}

async function activateItem(input: ShopActionInput<Parameters<typeof activateTavernShopItem>[0]>) {
    const cas = await currentShopCas(input.sessionId);
    const { anchorOrder: _anchorOrder, boundary: _boundary, ...rest } = input;
    return await activateTavernShopItem({
        ...rest,
        boundary: await boundaryForTest(input),
        expectedRevision: input.expectedRevision ?? cas.expectedRevision,
        expectedVersionId: input.expectedVersionId ?? cas.expectedVersionId,
    });
}

async function deactivateItem(input: ShopActionInput<Parameters<typeof deactivateTavernShopItem>[0]>) {
    const cas = await currentShopCas(input.sessionId);
    const { anchorOrder: _anchorOrder, boundary: _boundary, ...rest } = input;
    return await deactivateTavernShopItem({
        ...rest,
        boundary: await boundaryForTest(input),
        expectedRevision: input.expectedRevision ?? cas.expectedRevision,
        expectedVersionId: input.expectedVersionId ?? cas.expectedVersionId,
    });
}

async function topUpPlayer(input: { sessionId: string; amount: number; key: string; anchorOrder?: number }) {
    return await postTavernEconomyTransaction({
        sessionId: input.sessionId,
        idempotencyKey: input.key,
        fromAccountId: TAVERN_SYSTEM_MINT_ACCOUNT_ID,
        toAccountId: TAVERN_PLAYER_ACCOUNT_ID,
        amount: input.amount,
        kind: 'test_top_up',
        title: '测试充值',
        sourceDomain: 'test',
        sourceId: input.key,
        anchorOrder: Math.max(0, Math.floor(Number(input.anchorOrder) || 0)),
    });
}

function activationState(input: {
    itemId: string;
    parameters?: Record<string, string>;
    startsAtTurn?: number;
    activationId?: string;
    quantity?: number;
}): TavernShopInventoryState {
    return {
        items: {
            [input.itemId]: {
                itemId: input.itemId,
                quantity: input.quantity ?? 0,
                activations: [{
                    id: input.activationId || 'activation-secret-1',
                    itemId: input.itemId,
                    parameters: input.parameters || {},
                    startsAtTurn: input.startsAtTurn ?? 2,
                    activatedAtOrder: 3,
                    activatedAt: 1_000,
                }],
            },
        },
    };
}

test('shop catalog is a reviewed static list of twenty five items', () => {
    const catalog = listTavernShopCatalog();
    assert.equal(catalog.length, 25);
    const ids = new Set<string>();
    for (const item of catalog) {
        assert.ok(item.id && !ids.has(item.id), `duplicate item id ${item.id}`);
        ids.add(item.id);
        assert.ok(item.name && item.icon && item.description, `display copy missing on ${item.id}`);
        assert.ok(Number.isSafeInteger(item.price) && item.price > 0, `price invalid on ${item.id}`);
        assert.ok(item.injection.trim(), `injection missing on ${item.id}`);
        if (item.duration.kind === 'turns') {
            assert.ok(item.duration.rounds >= 1, `rounds invalid on ${item.id}`);
        }
    }
    assert.equal(getTavernShopItem('reality-decree').purchaseLimit, 1);
    assert.equal(getTavernShopItem('identity-card').stacking, 'global-single');
    assert.equal(getTavernShopItem('invisibility-cloak').stacking, 'global-single');
    assert.equal(getTavernShopItem('absolute-obedience').duration.kind, 'permanent');
    assert.equal(findTavernShopItem('not-an-item'), null);
    assert.throws(() => getTavernShopItem('not-an-item'), /shop_item_missing/);
    assert.throws(() => getTavernShopItem(''), /shop_item_id_required/);
});

test('shop activation lifetime follows main-rp turn semantics', () => {
    const flower = getTavernShopItem('flower');
    const sticker = getTavernShopItem('no-anger-sticker');
    const camera = getTavernShopItem('privacy-camera');
    const obedience = getTavernShopItem('absolute-obedience');
    const base = {
        id: 'a1',
        itemId: flower.id,
        parameters: { targetName: '艾拉' },
        startsAtTurn: 2,
        activatedAtOrder: 1,
        activatedAt: 1,
    };
    assert.equal(isTavernShopActivationActive(base, flower, 1), false);
    assert.equal(isTavernShopActivationActive(base, flower, 2), true);
    assert.equal(isTavernShopActivationActive(base, flower, 3), false);
    const five = { ...base, itemId: sticker.id };
    for (let turn = 2; turn <= 6; turn += 1) {
        assert.equal(isTavernShopActivationActive(five, sticker, turn), true, `turn ${turn}`);
    }
    assert.equal(isTavernShopActivationActive(five, sticker, 7), false);
    assert.equal(tavernShopRemainingRounds(five, sticker, 2), 5);
    assert.equal(tavernShopRemainingRounds(five, sticker, 6), 1);
    const manual = { ...base, itemId: camera.id };
    assert.equal(isTavernShopActivationActive(manual, camera, 999), true);
    assert.equal(tavernShopRemainingRounds(manual, camera, 999), null);
    const permanent = { ...base, itemId: obedience.id };
    assert.equal(isTavernShopActivationActive(permanent, obedience, 9_999), true);
    assert.equal(tavernShopRemainingRounds(permanent, obedience, 9_999), null);
    const ended = { ...manual, endedAtTurn: 5, endedAtOrder: 9, endedAt: 2, endReason: 'manual' as const };
    assert.equal(isTavernShopActivationActive(ended, camera, 5), false);
});

test('shop parameters are normalized length-capped text', () => {
    const flower = getTavernShopItem('flower');
    const normalized = normalizeTavernShopParameters(flower, { targetName: '  艾　拉\n  测试  ' });
    assert.equal(normalized.targetName, '艾 拉 测试');
    const overlong = normalizeTavernShopParameters(flower, { targetName: '啊'.repeat(100) });
    assert.equal(overlong.targetName.length, 40);
    assert.throws(() => normalizeTavernShopParameters(flower, {}), /shop_parameters_invalid/);
    assert.throws(() => normalizeTavernShopParameters(flower, { targetName: '   ' }), /shop_parameters_invalid/);
    const cloak = getTavernShopItem('invisibility-cloak');
    assert.deepEqual(normalizeTavernShopParameters(cloak, { targetName: '被忽略的输入' }), {});
});

test('placeTavernShopPromptBlockBeforeCurrentUser repairs the final ordering deterministically', () => {
    const block = buildTavernShopPromptBlock(
        activationState({ itemId: 'flower', parameters: { targetName: '艾拉' }, startsAtTurn: 0 }),
        0,
    );
    const messages: XbTavernMessage[] = [
        { role: 'system', content: '世界设定' },
        { role: 'user', content: '第一轮' },
        { role: 'assistant', content: '回应' },
        { role: 'system', content: '状态层A\n\n状态层B' },
        { role: 'user', content: '当前输入' },
    ];
    const placed = placeTavernShopPromptBlockBeforeCurrentUser(messages, block, 4);
    const userIndex = placed.findIndex((message) => message.content === '当前输入');
    const before = placed[userIndex - 1];
    assert.equal(before.role, 'system');
    assert.ok(before.content.startsWith('状态层A'));
    assert.ok(before.content.endsWith(block), 'shop block must be the last block before the current user message');
    assert.deepEqual(placeTavernShopPromptBlockBeforeCurrentUser(placed, block, 4), placed, 'placement must be idempotent');

    const stale: XbTavernMessage[] = [
        { role: 'system', content: `设定\n\n${block}\n\n其他` },
        { role: 'user', content: '当前输入' },
    ];
    const repaired = placeTavernShopPromptBlockBeforeCurrentUser(stale, block, 1);
    assert.equal(repaired.length, 2);
    assert.equal(repaired[0].role, 'system');
    assert.equal(repaired[0].content.split(block).length - 1, 1);
    assert.ok(repaired[0].content.includes('设定'));
    assert.ok(repaired[0].content.includes('其他'));
    assert.ok(repaired[0].content.endsWith(block));

    const depthZeroUserAfterCurrent: XbTavernMessage[] = [
        { role: 'system', content: '设定' },
        { role: 'user', content: '真正当前 USER' },
        { role: 'assistant', content: '工具调用前置' },
        { role: 'user', content: 'depth-0 user after current USER' },
    ];
    const boundaryPlaced = placeTavernShopPromptBlockBeforeCurrentUser(depthZeroUserAfterCurrent, block, 1);
    const currentBoundaryIndex = boundaryPlaced.findIndex((message) => message.content === '真正当前 USER');
    const laterUserIndex = boundaryPlaced.findIndex((message) => message.content === 'depth-0 user after current USER');
    assert.ok(currentBoundaryIndex > 0);
    assert.ok(laterUserIndex > currentBoundaryIndex);
    assert.ok(String(boundaryPlaced[currentBoundaryIndex - 1]?.content || '').endsWith(block));
    assert.ok(!String(boundaryPlaced[laterUserIndex - 1]?.content || '').endsWith(block));

    assert.deepEqual(placeTavernShopPromptBlockBeforeCurrentUser(messages, '', 4), messages);
    assert.throws(
        () => placeTavernShopPromptBlockBeforeCurrentUser([{ role: 'system', content: '设定' }], block, null),
        /shop_prompt_current_user_boundary_missing/,
    );
    assert.throws(
        () => placeTavernShopPromptBlockBeforeCurrentUser(messages, block, 0),
        /shop_prompt_current_user_boundary_missing/,
    );
});

test('shop purchase posts wallet and inventory in one transaction', async () => {
    await resetDb();
    const session = await createTavernSession({ title: 'Shop purchase' });
    const result = await purchaseItem({ sessionId: session.id, itemId: 'flower', actionId: 'buy-flower-1' });
    assert.equal(result.replay, false);
    assert.equal(result.record.revision, 1);
    assert.equal(result.record.currentMarker, TAVERN_SHOP_CURRENT_MARKER);
    assert.equal(result.record.anchorOrder, 0);
    assert.equal(result.record.state.items.flower.quantity, 1);
    assert.equal(result.playerBalance, 50);
    assert.equal(await getTavernPlayerBalance(session.id), 50);
    const current = await getCurrentTavernShopState(session.id);
    assert.equal(current?.versionId, result.record.versionId);
    const transaction = await tavernEconomyTransactionsTable.get([session.id, result.transaction.id]);
    assert.equal(transaction?.kind, 'shop_purchase');
    assert.equal(transaction?.sourceDomain, 'shop');
    assert.equal(transaction?.sourceId, 'flower');
    assert.equal(transaction?.fromAccountId, TAVERN_PLAYER_ACCOUNT_ID);
    assert.equal(transaction?.toAccountId, TAVERN_SYSTEM_SINK_ACCOUNT_ID);
    assert.equal(transaction?.amount, 50);
});

test('a failed shop purchase changes neither wallet nor inventory', async () => {
    await resetDb();
    const session = await createTavernSession({ title: 'Shop poor' });
    await assert.rejects(
        purchaseItem({ sessionId: session.id, itemId: 'gift-box', actionId: 'buy-gift-poor' }),
        /economy_balance_insufficient/,
    );
    assert.equal(await getCurrentTavernShopState(session.id), null);
    assert.equal(await tavernShopStateVersionsTable.where('sessionId').equals(session.id).count(), 0);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count(), 0);
    assert.equal(await tavernEconomyAccountsTable.where('sessionId').equals(session.id).count(), 0);
});

test('shop purchase retries replay without charging twice', async () => {
    await resetDb();
    const session = await createTavernSession({ title: 'Shop replay' });
    const originalBoundary = await captureTavernPhoneBoundary(session.id);
    const first = await purchaseItem({
        sessionId: session.id,
        itemId: 'flower',
        actionId: 'buy-flower-retry',
        boundary: originalBoundary,
    });
    await appendTavernMessage(session.id, { role: 'user', content: '提交成功后，剧情继续前进。' });
    const retry = await purchaseItem({
        sessionId: session.id,
        itemId: 'flower',
        actionId: 'buy-flower-retry',
        boundary: originalBoundary,
        expectedRevision: 0,
        expectedVersionId: '',
    });
    assert.equal(retry.replay, true);
    assert.equal(retry.record.versionId, first.record.versionId);
    assert.equal(retry.actionRecord.versionId, first.record.versionId);
    assert.equal(await getTavernPlayerBalance(session.id), 50);
    assert.equal(await tavernShopStateVersionsTable.where('sessionId').equals(session.id).count(), 1);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count(), 2);
    await assert.rejects(
        purchaseItem({
            sessionId: session.id,
            itemId: 'gift-box',
            actionId: 'buy-flower-retry',
            boundary: originalBoundary,
        }),
        /shop_action_conflict/,
    );
});

test('shop replay returns the current head while preserving the historical action record', async () => {
    await resetDb();
    const session = await createTavernSession({ title: 'Shop replay current head' });
    const boundary = await captureTavernPhoneBoundary(session.id);
    const first = await purchaseTavernShopItem({
        sessionId: session.id,
        itemId: 'flower',
        actionId: 'replay-head-first',
        boundary,
        expectedRevision: 0,
        expectedVersionId: '',
    });
    const second = await purchaseTavernShopItem({
        sessionId: session.id,
        itemId: 'flower',
        actionId: 'replay-head-second',
        boundary,
        expectedRevision: first.record.revision,
        expectedVersionId: first.record.versionId,
    });
    const replay = await purchaseTavernShopItem({
        sessionId: session.id,
        itemId: 'flower',
        actionId: 'replay-head-first',
        boundary,
        expectedRevision: 0,
        expectedVersionId: '',
    });
    assert.equal(replay.replay, true);
    assert.equal(replay.record.versionId, second.record.versionId);
    assert.equal(replay.record.revision, 2);
    assert.equal(replay.actionRecord.versionId, first.record.versionId);
    assert.equal(replay.actionRecord.revision, 1);
});

test('shop purchase rejects stale revision and version id snapshots', async () => {
    await resetDb();
    const session = await createTavernSession({ title: 'Shop CAS' });
    const first = await purchaseItem({ sessionId: session.id, itemId: 'flower', actionId: 'buy-flower-cas' });
    await assert.rejects(
        purchaseItem({
            sessionId: session.id,
            itemId: 'flower',
            actionId: 'buy-flower-stale-revision',
            expectedRevision: 0,
            expectedVersionId: '',
        }),
        /shop_revision_conflict/,
    );
    await assert.rejects(
        purchaseItem({
            sessionId: session.id,
            itemId: 'flower',
            actionId: 'buy-flower-stale-version',
            expectedRevision: first.record.revision,
            expectedVersionId: 'shop-version-stale',
        }),
        /shop_version_conflict/,
    );
    assert.equal(await tavernShopStateVersionsTable.where('sessionId').equals(session.id).count(), 1);
    assert.equal(await getTavernPlayerBalance(session.id), 50);
});

test('shop activation consumes stock starts at the current turn and survives refresh', async () => {
    await resetDb();
    const session = await createTavernSession({ title: 'Shop activate' });
    await assert.rejects(
        activateItem({
            sessionId: session.id,
            itemId: 'flower',
            parameters: { targetName: '艾拉' },
            actionId: 'use-flower-empty',
        }),
        /shop_quantity_insufficient/,
    );
    await purchaseItem({ sessionId: session.id, itemId: 'flower', actionId: 'buy-flower-use' });
    const used = await activateItem({
        sessionId: session.id,
        itemId: 'flower',
        parameters: { targetName: '艾拉' },
        actionId: 'use-flower-1',
    });
    assert.equal(used.replay, false);
    assert.equal(used.activation.startsAtTurn, 0);
    assert.equal(used.record.revision, 2);
    assert.equal(used.record.state.items.flower.quantity, 0);
    assert.equal(used.record.state.items.flower.activations.length, 1);
    const refreshed = await getCurrentTavernShopState(session.id);
    assert.equal(refreshed?.state.items.flower.activations[0]?.id, used.activation.id);
    await updateTavernSessionState(session.id, { turn: 1 });
    const expired = await getCurrentTavernShopState(session.id);
    assert.equal(listTavernShopActiveEffects(expired?.state, 1).length, 0);
});

test('shop activation rejects duplicate active effects without consuming stock', async () => {
    await resetDb();
    const session = await createTavernSession({ title: 'Shop duplicate' });
    await purchaseItem({ sessionId: session.id, itemId: 'flower', actionId: 'buy-flower-a' });
    await purchaseItem({ sessionId: session.id, itemId: 'flower', actionId: 'buy-flower-b' });
    await activateItem({
        sessionId: session.id,
        itemId: 'flower',
        parameters: { targetName: '艾拉' },
        actionId: 'use-flower-a',
    });
    await assert.rejects(
        activateItem({
            sessionId: session.id,
            itemId: 'flower',
            parameters: { targetName: '艾拉' },
            actionId: 'use-flower-duplicate',
        }),
        /shop_activation_duplicate/,
    );
    let current = await getCurrentTavernShopState(session.id);
    assert.equal(current?.revision, 3);
    assert.equal(current?.state.items.flower.quantity, 1);
    const second = await activateItem({
        sessionId: session.id,
        itemId: 'flower',
        parameters: { targetName: '贝尔' },
        actionId: 'use-flower-b',
    });
    assert.equal(second.record.state.items.flower.activations.length, 2);

    await topUpPlayer({ sessionId: session.id, amount: 1_000, key: 'top-up-duplicate' });
    await purchaseItem({ sessionId: session.id, itemId: 'identity-card', actionId: 'buy-id-a' });
    await purchaseItem({ sessionId: session.id, itemId: 'identity-card', actionId: 'buy-id-b' });
    await activateItem({
        sessionId: session.id,
        itemId: 'identity-card',
        parameters: { identity: '邻国王子的旧友' },
        actionId: 'use-id-a',
    });
    await assert.rejects(
        activateItem({
            sessionId: session.id,
            itemId: 'identity-card',
            parameters: { identity: '远行商人' },
            actionId: 'use-id-duplicate',
        }),
        /shop_activation_duplicate/,
    );
    current = await getCurrentTavernShopState(session.id);
    assert.equal(current?.state.items['identity-card'].quantity, 1);
    assert.equal(current?.state.items['identity-card'].activations.length, 1);
});

test('shop deactivation is only allowed for active manual effects', async () => {
    await resetDb();
    const session = await createTavernSession({ title: 'Shop deactivate' });
    await topUpPlayer({ sessionId: session.id, amount: 2_000, key: 'top-up-deactivate' });
    await purchaseItem({ sessionId: session.id, itemId: 'absolute-obedience', actionId: 'buy-obedience' });
    const obedience = await activateItem({
        sessionId: session.id,
        itemId: 'absolute-obedience',
        parameters: { targetName: '艾拉' },
        actionId: 'use-obedience',
    });
    await assert.rejects(
        deactivateItem({
            sessionId: session.id,
            itemId: 'absolute-obedience',
            activationId: obedience.activation.id,
            actionId: 'stop-obedience',
        }),
        /shop_activation_not_manual/,
    );

    await purchaseItem({ sessionId: session.id, itemId: 'privacy-camera', actionId: 'buy-camera' });
    const camera = await activateItem({
        sessionId: session.id,
        itemId: 'privacy-camera',
        parameters: { targetName: '艾拉' },
        actionId: 'use-camera',
    });
    const preStop = await getCurrentTavernShopState(session.id);
    const stopped = await deactivateItem({
        sessionId: session.id,
        itemId: 'privacy-camera',
        activationId: camera.activation.id,
        actionId: 'stop-camera',
    });
    assert.equal(stopped.replay, false);
    assert.equal(stopped.activation.endReason, 'manual');
    assert.equal(stopped.activation.endedAtTurn, 0);
    const retry = await deactivateItem({
        sessionId: session.id,
        itemId: 'privacy-camera',
        activationId: camera.activation.id,
        actionId: 'stop-camera',
        expectedRevision: Number(preStop?.revision),
        expectedVersionId: String(preStop?.versionId || ''),
    });
    assert.equal(retry.replay, true);
    assert.equal(retry.record.versionId, stopped.record.versionId);
    await assert.rejects(
        deactivateItem({
            sessionId: session.id,
            itemId: 'privacy-camera',
            activationId: camera.activation.id,
            actionId: 'stop-camera-again',
        }),
        /shop_activation_not_active/,
    );
    await assert.rejects(
        deactivateItem({
            sessionId: session.id,
            itemId: 'privacy-camera',
            activationId: 'shop-activation-missing',
            actionId: 'stop-camera-missing',
        }),
        /shop_activation_missing/,
    );
    assert.equal(await getTavernPlayerBalance(session.id), 600);
});

test('era gate closing records one manual ending at the current story boundary', async () => {
    await resetDb();
    const session = await createTavernSession({ title: 'Shop era return' });
    await topUpPlayer({ sessionId: session.id, amount: 2_000, key: 'top-up-era-gate' });
    await purchaseItem({ sessionId: session.id, itemId: 'era-gate', actionId: 'buy-era-gate' });
    const activated = await activateItem({
        sessionId: session.id,
        itemId: 'era-gate',
        parameters: { era: '十年前的小镇' },
        actionId: 'use-era-gate',
    });
    const returned = await deactivateItem({
        sessionId: session.id,
        itemId: 'era-gate',
        activationId: activated.activation.id,
        actionId: 'return-era-gate',
    });
    assert.equal(returned.activation.endReason, 'manual');
    assert.equal(returned.activation.endedAtOrder, returned.record.anchorOrder);
});

test('shop purchase limit is enforced inside the same transaction', async () => {
    await resetDb();
    const session = await createTavernSession({ title: 'Shop limit' });
    await topUpPlayer({ sessionId: session.id, amount: 4_000, key: 'top-up-limit' });
    const first = await purchaseItem({ sessionId: session.id, itemId: 'reality-decree', actionId: 'buy-decree-1' });
    assert.equal(first.playerBalance, 2_100);
    await assert.rejects(
        purchaseItem({ sessionId: session.id, itemId: 'reality-decree', actionId: 'buy-decree-2' }),
        /shop_purchase_limit_reached/,
    );
    assert.equal(await getTavernPlayerBalance(session.id), 2_100);
    const current = await getCurrentTavernShopState(session.id);
    assert.equal(current?.state.items['reality-decree'].quantity, 1);
});

test('shop state follows anchors and accepted rollback restores shop and wallet together', async () => {
    await resetDb();
    const session = await createTavernSession({ title: 'Shop rollback' });
    await purchaseItem({ sessionId: session.id, itemId: 'flower', actionId: 'buy-flower-rollback' });
    await topUpPlayer({ sessionId: session.id, amount: 1_000, key: 'top-up-rollback' });
    await activateItem({
        sessionId: session.id,
        itemId: 'flower',
        parameters: { targetName: '艾拉' },
        actionId: 'use-flower-rollback',
        anchorOrder: 2,
    });
    await purchaseItem({ sessionId: session.id, itemId: 'gift-box', actionId: 'buy-gift-rollback', anchorOrder: 2 });
    assert.equal(await getTavernPlayerBalance(session.id), 930);

    const atZero = await getTavernShopStateAtAnchor(session.id, 0);
    assert.equal(atZero?.revision, 1);
    assert.equal(atZero?.state.items.flower.quantity, 1);
    assert.equal(atZero?.state.items.flower.activations.length, 0);
    const atTwo = await getTavernShopStateAtAnchor(session.id, 2);
    assert.equal(atTwo?.revision, 3);

    const impact = await describeTavernAcceptedEconomicRestoreImpact(session.id, 0);
    assert.equal(impact.shop.changed, true);
    assert.equal(impact.shop.deletedVersionCount, 2);
    assert.equal(impact.shop.affectedItemCount, 2);
    assert.equal(impact.economy.changed, true);

    await restoreTavernAcceptedEconomicStateToFloor(session.id, 0);
    const restored = await getCurrentTavernShopState(session.id);
    assert.equal(restored?.revision, 1);
    assert.equal(restored?.currentMarker, TAVERN_SHOP_CURRENT_MARKER);
    assert.equal(restored?.state.items.flower.quantity, 1);
    assert.equal(restored?.state.items.flower.activations.length, 0);
    assert.equal(await getTavernPlayerBalance(session.id), 1_050);
    const keys = (await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).toArray())
        .map((transaction) => transaction.idempotencyKey);
    assert.ok(!keys.includes('shop:purchase:buy-gift-rollback'));
    assert.equal(await tavernShopStateVersionsTable.where('sessionId').equals(session.id).count(), 1);
});

test('accepted rollback is atomic when the shop step fails mid-transaction', async () => {
    await resetDb();
    const session = await createTavernSession({ title: 'Shop rollback atomic' });
    await purchaseItem({ sessionId: session.id, itemId: 'flower', actionId: 'buy-flower-atomic' });
    await activateItem({
        sessionId: session.id,
        itemId: 'flower',
        parameters: { targetName: '艾拉' },
        actionId: 'use-flower-atomic',
        anchorOrder: 2,
    });
    await topUpPlayer({ sessionId: session.id, amount: 500, key: 'top-up-atomic', anchorOrder: 2 });
    const epochBefore = Number((await tavernSessionsTable.get(session.id))?.taskBoardEpoch);
    await tavernSessionsTable.update(session.id, { updatedAt: 12_345 });
    const balanceBefore = await getTavernPlayerBalance(session.id);

    const table = tavernShopStateVersionsTable as unknown as { bulkDelete: (keys: unknown) => Promise<unknown> };
    const originalBulkDelete = table.bulkDelete;
    table.bulkDelete = async () => { throw new Error('injected_shop_restore_failure'); };
    try {
        await assert.rejects(
            restoreTavernAcceptedEconomicStateToFloor(session.id, 0),
            /injected_shop_restore_failure/,
        );
    } finally {
        table.bulkDelete = originalBulkDelete;
    }

    const current = await getCurrentTavernShopState(session.id);
    assert.equal(current?.revision, 2);
    assert.equal(current?.state.items.flower.activations.length, 1);
    assert.equal(await getTavernPlayerBalance(session.id), balanceBefore);
    assert.equal(Number((await tavernSessionsTable.get(session.id))?.taskBoardEpoch), epochBefore);
    assert.equal(Number((await tavernSessionsTable.get(session.id))?.updatedAt), 12_345);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count(), 3);
});

test('shop writes reject a moved phone boundary before touching state', async () => {
    await resetDb();
    const session = await createTavernSession({ title: 'Shop boundary' });
    const stale = await captureTavernPhoneBoundary(session.id);
    await appendTavernMessage(session.id, { role: 'user', content: '剧情推进了' });
    await assert.rejects(
        purchaseItem({
            sessionId: session.id,
            itemId: 'flower',
            actionId: 'buy-flower-stale-boundary',
            boundary: stale,
        }),
        /phone_timeline_conflict/,
    );
    assert.equal(await getCurrentTavernShopState(session.id), null);
    assert.equal(await tavernEconomyAccountsTable.where('sessionId').equals(session.id).count(), 0);
});

test('shop state versions follow branch and delete lifecycle', async () => {
    await resetDb();
    const source = await createTavernSession({ title: 'Shop branch source' });
    await purchaseItem({ sessionId: source.id, itemId: 'flower', actionId: 'buy-flower-branch' });
    await activateItem({
        sessionId: source.id,
        itemId: 'flower',
        parameters: { targetName: '艾拉' },
        actionId: 'use-flower-branch',
    });
    const branch = await branchTavernSession(source.id);
    assert.ok(branch?.id && branch.id !== source.id);
    const sourceRows = await tavernShopStateVersionsTable.where('sessionId').equals(source.id).toArray();
    const branchRows = await tavernShopStateVersionsTable.where('sessionId').equals(String(branch?.id)).toArray();
    assert.equal(sourceRows.length, 2);
    assert.deepEqual(
        branchRows.map((row) => row.revision).sort(),
        sourceRows.map((row) => row.revision).sort(),
    );
    assert.equal(branchRows.filter((row) => row.currentMarker === TAVERN_SHOP_CURRENT_MARKER).length, 1);
    assert.deepEqual(
        branchRows.find((row) => row.revision === 2)?.state,
        sourceRows.find((row) => row.revision === 2)?.state,
    );
    await deleteTavernSession(source.id);
    assert.equal(await tavernShopStateVersionsTable.where('sessionId').equals(source.id).count(), 0);
    assert.equal(await tavernShopStateVersionsTable.where('sessionId').equals(String(branch?.id)).count(), 2);
});

test('shop runtime depth entries project the current state as one depth-1 system entry', async () => {
    await resetDb();
    const session = await createTavernSession({ title: 'Shop depth entries' });
    assert.deepEqual(await buildTavernShopRuntimeDepthEntries({ sessionId: session.id, currentTurn: 0 }), []);
    await purchaseItem({ sessionId: session.id, itemId: 'no-anger-sticker', actionId: 'buy-sticker-depth' });
    await activateItem({
        sessionId: session.id,
        itemId: 'no-anger-sticker',
        parameters: { targetName: '艾拉' },
        actionId: 'use-sticker-depth',
    });
    const entries = await buildTavernShopRuntimeDepthEntries({ sessionId: session.id, currentTurn: 0 });
    assert.equal(entries.length, 1);
    assert.equal(entries[0].depth, 1);
    assert.equal(entries[0].role, 'system');
    assert.equal(entries[0].order, TAVERN_SHOP_PROMPT_DEPTH_ORDER);
    assert.equal(entries[0].layer, TAVERN_SHOP_PROMPT_LAYER);
    assert.deepEqual(await buildTavernShopRuntimeDepthEntries({ sessionId: session.id, currentTurn: 5 }), []);
});
