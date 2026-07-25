import db, {
    tavernEconomyAccountsTable,
    tavernEconomyTransactionsTable,
    tavernMessagesTable,
    tavernSessionsTable,
    tavernShopStateVersionsTable,
    type TavernSessionRecord,
} from '../session-db';
import {
    postTavernEconomyTransactionInCurrentDbTransaction,
} from '../economy/economy-service';
import {
    TAVERN_PLAYER_ACCOUNT_ID,
    TAVERN_SYSTEM_SINK_ACCOUNT_ID,
    type TavernEconomyTransactionRecord,
} from '../economy/economy-types';
import {
    assertTavernPhoneBoundaryInCurrentTransaction,
    tavernPhoneBoundaryAnchorOrder,
} from '../phone-boundary';
import {
    getTavernShopItem,
} from './shop-catalog';
import {
    findTavernShopStateInvariantViolation,
} from './shop-invariants';
import {
    isTavernShopActivationActive,
    normalizeTavernShopAnchorOrder,
    normalizeTavernShopParameters,
    normalizeTavernShopSessionId,
    normalizeTavernShopStateVersionRecord,
    normalizeTavernShopTurn,
    throwTavernShopError,
    TAVERN_SHOP_CURRENT_MARKER,
    type ActivateTavernShopItemInput,
    type DeactivateTavernShopItemInput,
    type PurchaseTavernShopItemInput,
    type TavernShopActivation,
    type TavernShopInventoryState,
    type TavernShopStateAction,
    type TavernShopStateVersionRecord,
} from './shop-types';

type ShopRangeCollection<T> = {
    reverse(): ShopRangeCollection<T>;
    first(): Promise<T | undefined>;
    toArray(): Promise<T[]>;
};

type ShopRangeTable<T> = {
    where(index: string): {
        between(
            lower: unknown,
            upper: unknown,
            includeLower?: boolean,
            includeUpper?: boolean,
        ): ShopRangeCollection<T>;
    };
};

function now(): number {
    return Date.now();
}

function createId(prefix: string): string {
    return `${prefix}-${now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function clone<T>(value: T): T {
    if (typeof structuredClone === 'function') {return structuredClone(value);}
    return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeActionId(value = ''): string {
    const actionId = String(value || '').trim().slice(0, 220);
    if (!actionId) {throwTavernShopError('shop_action_required');}
    return actionId;
}

function normalizeExpectedRevision(value: unknown): number {
    const revision = Number(value);
    if (!Number.isSafeInteger(revision) || revision < 0) {
        throwTavernShopError('shop_revision_invalid', String(value));
    }
    return revision;
}

function normalizeExpectedVersionId(value: unknown, expectedRevision: number): string {
    const versionId = String(value ?? '').trim();
    if (expectedRevision === 0) {return '';}
    if (!versionId || versionId.length > 220) {
        throwTavernShopError('shop_version_id_invalid', versionId);
    }
    return versionId;
}

function normalizeActivationId(value = ''): string {
    const activationId = String(value || '').trim();
    if (!activationId) {throwTavernShopError('shop_activation_missing');}
    return activationId;
}

function sameJson(left: unknown, right: unknown): boolean {
    return JSON.stringify(left) === JSON.stringify(right);
}

async function findActionVersion(sessionId: string, actionId: string): Promise<TavernShopStateVersionRecord | null> {
    const rows = await tavernShopStateVersionsTable
        .where('[sessionId+actionId]')
        .equals([sessionId, actionId])
        .toArray();
    return rows[0] || null;
}

async function getCurrentVersionInTransaction(sessionId: string): Promise<TavernShopStateVersionRecord | null> {
    const rows = await tavernShopStateVersionsTable
        .where('[sessionId+currentMarker]')
        .equals([sessionId, TAVERN_SHOP_CURRENT_MARKER])
        .toArray();
    return rows[0] || null;
}

function assertVersionCas(
    current: TavernShopStateVersionRecord | null,
    expectedRevision: number,
    expectedVersionId: string,
): void {
    if (!current) {
        if (expectedRevision !== 0) {
            throwTavernShopError('shop_revision_conflict', `${expectedRevision}:empty`);
        }
        return;
    }
    if (current.revision !== expectedRevision) {
        throwTavernShopError('shop_revision_conflict', `${expectedRevision}:${current.revision}`);
    }
    if (current.versionId !== expectedVersionId) {
        throwTavernShopError('shop_version_conflict', `${expectedVersionId}:${current.versionId}`);
    }
}

function assertActionReplay(
    replay: TavernShopStateVersionRecord,
    matches: boolean,
    actionId: string,
): TavernShopStateVersionRecord {
    if (!matches) {throwTavernShopError('shop_action_conflict', actionId);}
    return replay;
}

function buildNextVersion(
    current: TavernShopStateVersionRecord | null,
    sessionId: string,
    actionId: string,
    action: TavernShopStateAction,
    anchorOrder: number,
    mutate: (state: TavernShopInventoryState) => void,
): TavernShopStateVersionRecord {
    if (current && anchorOrder < current.anchorOrder) {
        throwTavernShopError('shop_anchor_order_regression', `${anchorOrder}<${current.anchorOrder}`);
    }
    const state = current ? clone(current.state) : { items: {} };
    mutate(state);
    const timestamp = now();
    const next = normalizeTavernShopStateVersionRecord({
        sessionId,
        revision: current ? current.revision + 1 : 1,
        versionId: createId('shop-version'),
        currentMarker: TAVERN_SHOP_CURRENT_MARKER,
        actionId,
        action,
        anchorOrder,
        state,
        createdAt: timestamp,
        updatedAt: timestamp,
    } as TavernShopStateVersionRecord);
    const invariantViolation = findTavernShopStateInvariantViolation(next.state);
    if (invariantViolation) {
        const detail = `${invariantViolation.itemId}:${invariantViolation.activationId || ''}`;
        if (invariantViolation.code === 'purchase-limit') {
            throwTavernShopError('shop_purchase_limit_reached', invariantViolation.itemId);
        }
        if (invariantViolation.code === 'activation-overlap') {
            throwTavernShopError('shop_activation_duplicate', invariantViolation.itemId);
        }
        if (invariantViolation.code === 'parameters-invalid') {
            throwTavernShopError('shop_parameters_invalid', detail);
        }
        throwTavernShopError('shop_state_invalid', detail || invariantViolation.code);
    }
    return next;
}

async function appendVersionInTransaction(
    current: TavernShopStateVersionRecord | null,
    next: TavernShopStateVersionRecord,
): Promise<void> {
    if (current) {
        await tavernShopStateVersionsTable.put({ ...clone(current), currentMarker: undefined });
    }
    await (tavernShopStateVersionsTable as unknown as {
        add(record: TavernShopStateVersionRecord): Promise<unknown>;
    }).add(next);
}

async function touchSession(sessionId: string): Promise<void> {
    await tavernSessionsTable.update(sessionId, { updatedAt: now() });
}

function sessionTurn(session: TavernSessionRecord): number {
    return normalizeTavernShopTurn(session.state?.turn);
}

function findActivation(
    state: TavernShopInventoryState,
    itemId: string,
    activationId: string,
): TavernShopActivation | null {
    const entry = state.items[itemId];
    if (!entry) {return null;}
    return entry.activations.find((activation) => activation.id === activationId) || null;
}

export interface TavernShopPurchaseResult {
    record: TavernShopStateVersionRecord;
    actionRecord: TavernShopStateVersionRecord;
    transaction: TavernEconomyTransactionRecord;
    playerBalance: number;
    replay: boolean;
}

export interface TavernShopActivateResult {
    record: TavernShopStateVersionRecord;
    actionRecord: TavernShopStateVersionRecord;
    activation: TavernShopActivation;
    replay: boolean;
}

export interface TavernShopDeactivateResult {
    record: TavernShopStateVersionRecord;
    actionRecord: TavernShopStateVersionRecord;
    activation: TavernShopActivation;
    replay: boolean;
}

/** Read-only: the current inventory state version, or null for an empty backpack. */
export async function getCurrentTavernShopState(sessionId = ''): Promise<TavernShopStateVersionRecord | null> {
    const id = normalizeTavernShopSessionId(sessionId);
    const current = await getCurrentVersionInTransaction(id);
    return current ? clone(current) : null;
}

/** Read-only: the latest state version anchored at or before the given story floor. */
export async function getTavernShopStateAtAnchor(
    sessionId = '',
    anchorValue = -1,
): Promise<TavernShopStateVersionRecord | null> {
    const id = normalizeTavernShopSessionId(sessionId);
    const anchorOrder = normalizeTavernShopAnchorOrder(anchorValue);
    const row = await (tavernShopStateVersionsTable as unknown as ShopRangeTable<TavernShopStateVersionRecord>)
        .where('[sessionId+anchorOrder]')
        .between(
            [id, -1],
            [id, anchorOrder],
            true,
            true,
        )
        .reverse()
        .first();
    return row ? clone(row) : null;
}

function purchaseIdempotencyKey(actionId: string): string {
    return `shop:purchase:${actionId}`;
}

async function findPurchaseTransaction(
    sessionId: string,
    actionId: string,
): Promise<TavernEconomyTransactionRecord | null> {
    const rows = await tavernEconomyTransactionsTable
        .where('[sessionId+idempotencyKey]')
        .equals([sessionId, purchaseIdempotencyKey(actionId)])
        .toArray();
    return rows[0] || null;
}

export async function purchaseTavernShopItem(input: PurchaseTavernShopItemInput): Promise<TavernShopPurchaseResult> {
    const sessionId = normalizeTavernShopSessionId(input.sessionId);
    const item = getTavernShopItem(input.itemId);
    const actionId = normalizeActionId(input.actionId);
    const expectedRevision = normalizeExpectedRevision(input.expectedRevision);
    const expectedVersionId = normalizeExpectedVersionId(input.expectedVersionId, expectedRevision);
    const anchorOrder = normalizeTavernShopAnchorOrder(tavernPhoneBoundaryAnchorOrder(input.boundary));
    return await db.transaction(
        'rw',
        tavernMessagesTable,
        tavernSessionsTable,
        tavernShopStateVersionsTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        async () => {
            const session = await tavernSessionsTable.get(sessionId);
            if (!session) {throwTavernShopError('shop_session_missing', sessionId);}
            const replay = await findActionVersion(sessionId, actionId);
            if (replay) {
                assertActionReplay(replay,
                    replay.action.kind === 'purchase'
                    && replay.action.itemId === item.id
                    && replay.revision === expectedRevision + 1
                    && replay.anchorOrder === anchorOrder,
                actionId);
                const transaction = await findPurchaseTransaction(sessionId, actionId);
                if (
                    !transaction
                    || transaction.fromAccountId !== TAVERN_PLAYER_ACCOUNT_ID
                    || transaction.toAccountId !== TAVERN_SYSTEM_SINK_ACCOUNT_ID
                    || transaction.amount !== item.price
                    || transaction.kind !== 'shop_purchase'
                    || transaction.sourceDomain !== 'shop'
                    || transaction.sourceId !== item.id
                ) {
                    throwTavernShopError('shop_action_conflict', actionId);
                }
                const current = await getCurrentVersionInTransaction(sessionId);
                if (!current) {throwTavernShopError('shop_state_invalid', 'replay.current_missing');}
                return {
                    record: clone(current),
                    actionRecord: clone(replay),
                    transaction,
                    playerBalance: transaction.playerBalanceAfter,
                    replay: true,
                };
            }
            await assertTavernPhoneBoundaryInCurrentTransaction(sessionId, input.boundary);
            const current = await getCurrentVersionInTransaction(sessionId);
            assertVersionCas(current, expectedRevision, expectedVersionId);
            const next = buildNextVersion(current, sessionId, actionId, {
                kind: 'purchase',
                itemId: item.id,
            }, anchorOrder, (state) => {
                const entry = state.items[item.id] || { itemId: item.id, quantity: 0, activations: [] };
                state.items[item.id] = {
                    itemId: item.id,
                    quantity: entry.quantity + 1,
                    activations: [...entry.activations],
                };
            });
            const transaction = await postTavernEconomyTransactionInCurrentDbTransaction({
                sessionId,
                idempotencyKey: purchaseIdempotencyKey(actionId),
                fromAccountId: TAVERN_PLAYER_ACCOUNT_ID,
                toAccountId: TAVERN_SYSTEM_SINK_ACCOUNT_ID,
                amount: item.price,
                kind: 'shop_purchase',
                title: `购买 · ${item.name}`,
                note: `在规则当铺购入「${item.name}」。`,
                sourceDomain: 'shop',
                sourceId: item.id,
                anchorOrder,
            }, { touchSessionOnCreate: false });
            await appendVersionInTransaction(current, next);
            await touchSession(sessionId);
            return {
                record: clone(next),
                actionRecord: clone(next),
                transaction,
                playerBalance: transaction.playerBalanceAfter,
                replay: false,
            };
        },
    );
}

export async function activateTavernShopItem(input: ActivateTavernShopItemInput): Promise<TavernShopActivateResult> {
    const sessionId = normalizeTavernShopSessionId(input.sessionId);
    const item = getTavernShopItem(input.itemId);
    const actionId = normalizeActionId(input.actionId);
    const expectedRevision = normalizeExpectedRevision(input.expectedRevision);
    const expectedVersionId = normalizeExpectedVersionId(input.expectedVersionId, expectedRevision);
    const anchorOrder = normalizeTavernShopAnchorOrder(tavernPhoneBoundaryAnchorOrder(input.boundary));
    const parameters = normalizeTavernShopParameters(item, input.parameters);
    return await db.transaction(
        'rw',
        tavernMessagesTable,
        tavernSessionsTable,
        tavernShopStateVersionsTable,
        async () => {
            const session = await tavernSessionsTable.get(sessionId);
            if (!session) {throwTavernShopError('shop_session_missing', sessionId);}
            const replay = await findActionVersion(sessionId, actionId);
            if (replay) {
                assertActionReplay(replay,
                    replay.action.kind === 'activate'
                    && replay.action.itemId === item.id
                    && !!replay.action.activationId
                    && replay.revision === expectedRevision + 1
                    && replay.anchorOrder === anchorOrder,
                actionId);
                const activation = findActivation(replay.state, item.id, replay.action.activationId || '');
                if (!activation || !sameJson(activation.parameters, parameters)) {
                    throwTavernShopError('shop_action_conflict', actionId);
                }
                const current = await getCurrentVersionInTransaction(sessionId);
                if (!current) {throwTavernShopError('shop_state_invalid', 'replay.current_missing');}
                return {
                    record: clone(current),
                    actionRecord: clone(replay),
                    activation: clone(activation),
                    replay: true,
                };
            }
            await assertTavernPhoneBoundaryInCurrentTransaction(sessionId, input.boundary);
            const current = await getCurrentVersionInTransaction(sessionId);
            assertVersionCas(current, expectedRevision, expectedVersionId);
            const currentTurn = sessionTurn(session);
            const state = current ? clone(current.state) : { items: {} };
            const entry = state.items[item.id];
            if (!entry || entry.quantity < 1) {
                throwTavernShopError('shop_quantity_insufficient', item.id);
            }
            const activation: TavernShopActivation = {
                id: createId('shop-activation'),
                itemId: item.id,
                parameters,
                startsAtTurn: currentTurn,
                activatedAtOrder: anchorOrder,
                activatedAt: now(),
            };
            const next = buildNextVersion(current, sessionId, actionId, {
                kind: 'activate',
                itemId: item.id,
                activationId: activation.id,
            }, anchorOrder, (draft) => {
                const target = draft.items[item.id];
                if (!target) {throwTavernShopError('shop_quantity_insufficient', item.id);}
                draft.items[item.id] = {
                    itemId: item.id,
                    quantity: target.quantity - 1,
                    activations: [...target.activations, activation],
                };
            });
            await appendVersionInTransaction(current, next);
            await touchSession(sessionId);
            return {
                record: clone(next),
                actionRecord: clone(next),
                activation: clone(activation),
                replay: false,
            };
        },
    );
}

export async function deactivateTavernShopItem(input: DeactivateTavernShopItemInput): Promise<TavernShopDeactivateResult> {
    const sessionId = normalizeTavernShopSessionId(input.sessionId);
    const item = getTavernShopItem(input.itemId);
    const activationId = normalizeActivationId(input.activationId);
    const actionId = normalizeActionId(input.actionId);
    const expectedRevision = normalizeExpectedRevision(input.expectedRevision);
    const expectedVersionId = normalizeExpectedVersionId(input.expectedVersionId, expectedRevision);
    const anchorOrder = normalizeTavernShopAnchorOrder(tavernPhoneBoundaryAnchorOrder(input.boundary));
    return await db.transaction(
        'rw',
        tavernMessagesTable,
        tavernSessionsTable,
        tavernShopStateVersionsTable,
        async () => {
            const session = await tavernSessionsTable.get(sessionId);
            if (!session) {throwTavernShopError('shop_session_missing', sessionId);}
            const replay = await findActionVersion(sessionId, actionId);
            if (replay) {
                assertActionReplay(replay,
                    replay.action.kind === 'deactivate'
                    && replay.action.itemId === item.id
                    && replay.action.activationId === activationId
                    && replay.revision === expectedRevision + 1
                    && replay.anchorOrder === anchorOrder,
                actionId);
                const activation = findActivation(replay.state, item.id, activationId);
                if (!activation) {throwTavernShopError('shop_action_conflict', actionId);}
                const current = await getCurrentVersionInTransaction(sessionId);
                if (!current) {throwTavernShopError('shop_state_invalid', 'replay.current_missing');}
                return {
                    record: clone(current),
                    actionRecord: clone(replay),
                    activation: clone(activation),
                    replay: true,
                };
            }
            await assertTavernPhoneBoundaryInCurrentTransaction(sessionId, input.boundary);
            const current = await getCurrentVersionInTransaction(sessionId);
            assertVersionCas(current, expectedRevision, expectedVersionId);
            if (item.duration.kind !== 'manual') {
                throwTavernShopError('shop_activation_not_manual', item.id);
            }
            const state = current ? clone(current.state) : { items: {} };
            const activation = findActivation(state, item.id, activationId);
            if (!activation) {throwTavernShopError('shop_activation_missing', activationId);}
            const currentTurn = sessionTurn(session);
            if (!isTavernShopActivationActive(activation, item, currentTurn)) {
                throwTavernShopError('shop_activation_not_active', activationId);
            }
            const timestamp = now();
            const endedActivation: TavernShopActivation = {
                ...activation,
                endedAtTurn: currentTurn,
                endedAtOrder: anchorOrder,
                endedAt: timestamp,
                endReason: 'manual',
            };
            const next = buildNextVersion(current, sessionId, actionId, {
                kind: 'deactivate',
                itemId: item.id,
                activationId,
            }, anchorOrder, (draft) => {
                const target = draft.items[item.id];
                if (!target) {throwTavernShopError('shop_activation_missing', activationId);}
                draft.items[item.id] = {
                    itemId: item.id,
                    quantity: target.quantity,
                    activations: target.activations.map((row) => (row.id === activationId ? endedActivation : row)),
                };
            });
            await appendVersionInTransaction(current, next);
            await touchSession(sessionId);
            return {
                record: clone(next),
                actionRecord: clone(next),
                activation: clone(endedActivation),
                replay: false,
            };
        },
    );
}
