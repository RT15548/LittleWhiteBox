import { getShopContract, getShopShelfContract } from './catalog.js';
import { createStorageId } from '../../kernel/identity.js';
import {
    normalizeShopParameters,
    parseShopEffectReceipt,
    shopActivationKey,
    validateShopDomain,
} from './invariants.js';
import {
    SHOP_EFFECT_RECEIPT_VERSION,
    SHOP_SCHEMA_VERSION,
    ShopError,
    type ActivateShopItemInput,
    type DeactivateShopItemInput,
    type DeliverShopEffectsInput,
    type PurchaseShopItemInput,
    type ShopAction,
    type ShopActivation,
    type ShopCasToken,
    type ShopItemContract,
    type ShopCommandContext,
    type ShopCommandDependencies,
    type ShopCommandResult,
    type ShopDeliveryResult,
    type ShopDomainV2,
    type ShopEffectReceipt,
    type ShopEvent,
    type ShopStateProjection,
} from './types.js';

const MAX_DATE_MS = 8_640_000_000_000_000;

function defaultCreateEventId(): string {
    return `shop-event-${createStorageId()}`;
}

function normalizeId(value: unknown, code: 'shop_action_required' | 'shop_activation_id_required'): string {
    const id = String(value ?? '').trim();
    if (!id || Array.from(id).length > 200 || /[\u0000-\u001f\u007f-\u009f]/u.test(id)) {
        throw new ShopError(code);
    }
    return id;
}

function normalizeContext(input: ShopCommandContext): ShopCommandContext {
    if (
        !Number.isSafeInteger(input.expectedRevision)
        || input.expectedRevision < 0
        || typeof input.expectedEventId !== 'string'
        || (input.expectedRevision === 0) !== (input.expectedEventId === '')
    ) {
        throw new ShopError('shop_invalid_context', 'shop command CAS token is invalid');
    }
    return {
        actionId: normalizeId(input.actionId, 'shop_action_required'),
        expectedRevision: input.expectedRevision,
        expectedEventId: input.expectedEventId,
    };
}

function sameStringArray(left: readonly string[], right: readonly string[]): boolean {
    return left.length === right.length && left.every((value, index) => value === right[index]);
}

function sameAction(left: ShopAction, right: ShopAction): boolean {
    if (left.kind !== right.kind) {return false;}
    if (left.kind === 'deliver' && right.kind === 'deliver') {
        return sameStringArray(left.consumedActivationIds, right.consumedActivationIds)
            && sameStringArray(left.transitionActivationIds, right.transitionActivationIds);
    }
    if (left.kind === 'deliver' || right.kind === 'deliver' || left.itemId !== right.itemId) {return false;}
    if (left.kind === 'purchase' || right.kind === 'purchase') {return left.kind === right.kind;}
    if (left.activationId !== right.activationId) {return false;}
    if (left.kind === 'deactivate' || right.kind === 'deactivate') {return left.kind === right.kind;}
    const leftKeys = Object.keys(left.parameters).sort();
    const rightKeys = Object.keys(right.parameters).sort();
    return leftKeys.length === rightKeys.length
        && leftKeys.every((key, index) => key === rightKeys[index] && left.parameters[key] === right.parameters[key]);
}

function replayExisting(
    domain: ShopDomainV2,
    actionId: string,
    action: ShopAction,
): ShopCommandResult | null {
    const existing = domain.events.find((event) => event.actionId === actionId);
    if (!existing) {return null;}
    if (!sameAction(existing.action, action)) {
        throw new ShopError('shop_action_conflict', 'actionId was reused with a different normalized action');
    }
    const current = structuredClone(domain);
    return {
        domain: current,
        event: structuredClone(existing),
        projection: projectShopState(current),
        created: false,
    };
}

function assertCas(domain: ShopDomainV2, context: ShopCommandContext): void {
    const currentRevision = domain.events.length;
    const currentEventId = domain.events.at(-1)?.eventId || '';
    if (context.expectedRevision !== currentRevision) {
        throw new ShopError('shop_revision_conflict', 'shop revision changed');
    }
    if (context.expectedEventId !== currentEventId) {
        throw new ShopError('shop_event_id_conflict', 'shop event head changed');
    }
}

function appendEvent(
    domain: ShopDomainV2,
    context: ShopCommandContext,
    action: ShopAction,
    { now = Date.now, createEventId = defaultCreateEventId }: ShopCommandDependencies,
): ShopCommandResult {
    assertCas(domain, context);
    const eventId = String(createEventId() || '').trim();
    const createdAt = now();
    if (!eventId || Array.from(eventId).length > 200 || domain.events.some((event) => event.eventId === eventId)) {
        throw new ShopError('shop_invalid_context', 'event id is missing, too long or duplicated');
    }
    if (!Number.isSafeInteger(createdAt) || createdAt < 0 || createdAt > MAX_DATE_MS) {
        throw new ShopError('shop_invalid_context', 'event timestamp is invalid');
    }
    const event: ShopEvent = {
        revision: domain.events.length + 1,
        eventId,
        actionId: context.actionId,
        action: structuredClone(action),
        createdAt,
    };
    const next: ShopDomainV2 = {
        schemaVersion: SHOP_SCHEMA_VERSION,
        events: [...structuredClone(domain.events), event],
    };
    validateShopDomain(next);
    return {
        domain: next,
        event: structuredClone(event),
        projection: projectShopState(next),
        created: true,
    };
}

export function createEmptyShopState(): ShopDomainV2 {
    return { schemaVersion: SHOP_SCHEMA_VERSION, events: [] };
}

export function getShopCasToken(domain: ShopDomainV2): ShopCasToken {
    validateShopDomain(domain);
    return {
        expectedRevision: domain.events.length,
        expectedEventId: domain.events.at(-1)?.eventId || '',
    };
}

export function isShopActivationActive(
    activation: ShopActivation,
    item: Readonly<ShopItemContract>,
): boolean {
    if (item.duration.kind === 'permanent') {return true;}
    if (item.duration.kind === 'manual') {return activation.deactivatedByEventId === undefined;}
    return activation.appliedCount < item.duration.applications;
}

export function shopRemainingApplications(
    activation: ShopActivation,
    item: Readonly<ShopItemContract>,
): number | null {
    if (item.duration.kind !== 'replies') {return null;}
    return Math.max(0, item.duration.applications - activation.appliedCount);
}

function hasPendingTransition(activation: ShopActivation, item: Readonly<ShopItemContract>): boolean {
    if (activation.transitionDeliveredByEventId) {return false;}
    if (item.duration.kind === 'replies') {
        return activation.appliedCount === item.duration.applications && !!item.expirationRule;
    }
    return item.duration.kind === 'manual' && !!activation.deactivatedByEventId && !!item.deactivationRule;
}

/** Replays immutable Shop facts; current chat length is deliberately not an input. */
export function projectShopState(domain: ShopDomainV2): ShopStateProjection {
    validateShopDomain(domain);
    const projection: ShopStateProjection = {
        revision: domain.events.length,
        eventId: domain.events.at(-1)?.eventId || '',
        inventory: {},
        activations: [],
    };
    const activationById = new Map<string, ShopActivation>();
    for (const event of domain.events) {
        const action = event.action;
        if (action.kind === 'purchase') {
            const inventory = projection.inventory[action.itemId] || {
                itemId: action.itemId,
                quantity: 0,
                purchasedCount: 0,
            };
            inventory.quantity += 1;
            inventory.purchasedCount += 1;
            projection.inventory[action.itemId] = inventory;
            continue;
        }
        if (action.kind === 'activate') {
            const inventory = projection.inventory[action.itemId];
            if (!inventory) {throw new ShopError('shop_invalid_domain', 'validated inventory disappeared');}
            inventory.quantity -= 1;
            const activation: ShopActivation = {
                activationId: action.activationId,
                itemId: action.itemId,
                parameters: { ...action.parameters },
                activatedByEventId: event.eventId,
                activatedAtRevision: event.revision,
                appliedCount: 0,
            };
            projection.activations.push(activation);
            activationById.set(activation.activationId, activation);
            continue;
        }
        if (action.kind === 'deactivate') {
            const activation = activationById.get(action.activationId);
            if (!activation) {throw new ShopError('shop_invalid_domain', 'validated deactivation target disappeared');}
            activation.deactivatedByEventId = event.eventId;
            continue;
        }
        for (const activationId of action.consumedActivationIds) {
            const activation = activationById.get(activationId);
            if (!activation) {throw new ShopError('shop_invalid_domain', 'validated delivery target disappeared');}
            activation.appliedCount += 1;
        }
        for (const activationId of action.transitionActivationIds) {
            const activation = activationById.get(activationId);
            if (!activation) {throw new ShopError('shop_invalid_domain', 'validated transition target disappeared');}
            activation.transitionDeliveredByEventId = event.eventId;
        }
    }
    return projection;
}

/** Selects effects for one new Assistant reply without consuming them. */
export function createShopEffectReceipt(domain: ShopDomainV2): ShopEffectReceipt {
    const projection = projectShopState(domain);
    const activeActivationIds: string[] = [];
    const transitionActivationIds: string[] = [];
    for (const activation of projection.activations) {
        const item = getShopContract(activation.itemId);
        if (isShopActivationActive(activation, item)) {activeActivationIds.push(activation.activationId);}
        if (hasPendingTransition(activation, item)) {transitionActivationIds.push(activation.activationId);}
    }
    return { schemaVersion: SHOP_EFFECT_RECEIPT_VERSION, activeActivationIds, transitionActivationIds };
}

function assertSameReceipt(actual: ShopEffectReceipt, expected: ShopEffectReceipt): void {
    if (
        !sameStringArray(actual.activeActivationIds, expected.activeActivationIds)
        || !sameStringArray(actual.transitionActivationIds, expected.transitionActivationIds)
    ) {
        throw new ShopError('shop_effect_receipt_invalid', 'effect receipt no longer matches Shop state');
    }
}

export function deliverShopEffects(
    domain: ShopDomainV2,
    input: DeliverShopEffectsInput,
    dependencies: ShopCommandDependencies = {},
): ShopDeliveryResult {
    validateShopDomain(domain);
    const context = normalizeContext(input);
    const receipt = parseShopEffectReceipt(input.receipt);
    const projection = projectShopState(domain);
    const consumedActivationIds = receipt.activeActivationIds.filter((activationId) => {
        const activation = projection.activations.find(entry => entry.activationId === activationId);
        return !!activation && getShopContract(activation.itemId).duration.kind === 'replies';
    });
    const action: ShopAction = {
        kind: 'deliver',
        consumedActivationIds,
        transitionActivationIds: receipt.transitionActivationIds,
    };
    if (consumedActivationIds.length > 0 || receipt.transitionActivationIds.length > 0) {
        const replay = replayExisting(domain, context.actionId, action);
        if (replay) {return replay;}
    }
    assertCas(domain, context);
    assertSameReceipt(receipt, createShopEffectReceipt(domain));
    if (consumedActivationIds.length === 0 && receipt.transitionActivationIds.length === 0) {
        return {
            domain: structuredClone(domain),
            event: null,
            projection,
            created: false,
        };
    }
    return appendEvent(domain, context, action, dependencies);
}

export function purchaseShopItem(
    domain: ShopDomainV2,
    input: PurchaseShopItemInput,
    dependencies: ShopCommandDependencies = {},
): ShopCommandResult {
    validateShopDomain(domain);
    const item = getShopContract(input.itemId);
    const context = normalizeContext(input);
    const action: ShopAction = { kind: 'purchase', itemId: item.id };
    const replay = replayExisting(domain, context.actionId, action);
    if (replay) {return replay;}
    getShopShelfContract(item.id);
    assertCas(domain, context);
    const purchasedCount = projectShopState(domain).inventory[item.id]?.purchasedCount || 0;
    if (item.purchaseLimit !== undefined && purchasedCount >= item.purchaseLimit) {
        throw new ShopError('shop_purchase_limit_reached', `purchase limit reached: ${item.id}`);
    }
    return appendEvent(domain, context, action, dependencies);
}

export function activateShopItem(
    domain: ShopDomainV2,
    input: ActivateShopItemInput,
    dependencies: ShopCommandDependencies = {},
): ShopCommandResult {
    validateShopDomain(domain);
    const item = getShopContract(input.itemId);
    const context = normalizeContext(input);
    const activationId = normalizeId(input.activationId, 'shop_activation_id_required');
    const parameters = normalizeShopParameters(item, input.parameters);
    const action: ShopAction = { kind: 'activate', itemId: item.id, activationId, parameters };
    const replay = replayExisting(domain, context.actionId, action);
    if (replay) {return replay;}
    assertCas(domain, context);
    const projection = projectShopState(domain);
    if (projection.activations.some((activation) => activation.activationId === activationId)) {
        throw new ShopError('shop_activation_id_conflict', `activationId already exists: ${activationId}`);
    }
    if ((projection.inventory[item.id]?.quantity || 0) < 1) {
        throw new ShopError('shop_quantity_insufficient', `no inventory available: ${item.id}`);
    }
    const key = shopActivationKey(item, parameters);
    const duplicate = projection.activations.some((activation) => (
        activation.itemId === item.id
        && isShopActivationActive(activation, item)
        && (item.stacking === 'global-single' || shopActivationKey(item, activation.parameters) === key)
    ));
    if (duplicate) {throw new ShopError('shop_activation_duplicate', `effect is already active: ${item.id}`);}
    return appendEvent(domain, context, action, dependencies);
}

export function deactivateShopItem(
    domain: ShopDomainV2,
    input: DeactivateShopItemInput,
    dependencies: ShopCommandDependencies = {},
): ShopCommandResult {
    validateShopDomain(domain);
    const item = getShopContract(input.itemId);
    const context = normalizeContext(input);
    const activationId = normalizeId(input.activationId, 'shop_activation_id_required');
    const action: ShopAction = { kind: 'deactivate', itemId: item.id, activationId };
    const replay = replayExisting(domain, context.actionId, action);
    if (replay) {return replay;}
    assertCas(domain, context);
    const activation = projectShopState(domain).activations.find((entry) => entry.activationId === activationId);
    if (!activation || activation.itemId !== item.id) {
        throw new ShopError('shop_activation_missing', `activation does not exist for item: ${activationId}`);
    }
    if (item.duration.kind !== 'manual') {
        throw new ShopError('shop_activation_not_manual', `item is not manually closable: ${item.id}`);
    }
    if (!isShopActivationActive(activation, item)) {
        throw new ShopError('shop_activation_not_active', `activation is already closed: ${activationId}`);
    }
    return appendEvent(domain, context, action, dependencies);
}
