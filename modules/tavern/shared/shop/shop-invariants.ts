import {
    findTavernShopItem,
} from './shop-catalog';
import {
    normalizeTavernShopParameters,
    tavernShopActivationKey,
    type TavernShopActivation,
    type TavernShopInventoryState,
    type TavernShopItem,
} from './shop-types';

export type TavernShopStateInvariantViolationCode =
    | 'item-unknown'
    | 'entry-item-mismatch'
    | 'purchase-limit'
    | 'activation-id-duplicate'
    | 'activation-item-mismatch'
    | 'parameters-invalid'
    | 'activation-lifecycle-invalid'
    | 'activation-overlap';

export interface TavernShopStateInvariantViolation {
    code: TavernShopStateInvariantViolationCode;
    itemId: string;
    activationId?: string;
}

interface TavernShopActivationInterval {
    startsAtTurn: number;
    endsAtTurn: number | null;
}

function hasCanonicalParameters(item: TavernShopItem, parameters: Record<string, string>): boolean {
    try {
        const normalized = normalizeTavernShopParameters(item, parameters);
        const parameterKeys = Object.keys(parameters).sort();
        const normalizedKeys = Object.keys(normalized).sort();
        return (
            JSON.stringify(parameterKeys) === JSON.stringify(normalizedKeys)
            && normalizedKeys.every((key) => parameters[key] === normalized[key])
        );
    } catch {
        return false;
    }
}

/**
 * Lifetime intervals are half-open. A manual close on the same turn as the
 * activation is valid but has an empty interval, so it cannot overlap another
 * activation. Infinite effects use a null end.
 */
function activationInterval(
    item: TavernShopItem,
    activation: TavernShopActivation,
): TavernShopActivationInterval | null {
    const hasAnyEndField = activation.endedAtTurn !== undefined
        || activation.endedAtOrder !== undefined
        || activation.endedAt !== undefined
        || activation.endReason !== undefined;
    if (hasAnyEndField) {
        if (
            item.duration.kind !== 'manual'
            || activation.endedAtTurn === undefined
            || activation.endedAtOrder === undefined
            || activation.endedAt === undefined
            || activation.endReason !== 'manual'
            || activation.endedAtTurn < activation.startsAtTurn
            || activation.endedAtOrder < activation.activatedAtOrder
            || activation.endedAt < activation.activatedAt
        ) {
            return null;
        }
    }
    if (item.duration.kind === 'turns') {
        return {
            startsAtTurn: activation.startsAtTurn,
            endsAtTurn: activation.startsAtTurn + item.duration.rounds,
        };
    }
    if (item.duration.kind === 'manual') {
        return {
            startsAtTurn: activation.startsAtTurn,
            endsAtTurn: activation.endedAtTurn ?? null,
        };
    }
    return {
        startsAtTurn: activation.startsAtTurn,
        endsAtTurn: null,
    };
}

function intervalsOverlap(left: TavernShopActivationInterval, right: TavernShopActivationInterval): boolean {
    const leftEndsAfterRightStarts = left.endsAtTurn === null || left.endsAtTurn > right.startsAtTurn;
    const rightEndsAfterLeftStarts = right.endsAtTurn === null || right.endsAtTurn > left.startsAtTurn;
    return left.startsAtTurn < (right.endsAtTurn ?? Number.POSITIVE_INFINITY)
        && right.startsAtTurn < (left.endsAtTurn ?? Number.POSITIVE_INFINITY)
        && leftEndsAfterRightStarts
        && rightEndsAfterLeftStarts;
}

/**
 * Shared pure Shop state contract. It validates the complete retained history
 * in an inventory snapshot, not just which activation happens to be active
 * at the current turn.
 */
export function findTavernShopStateInvariantViolation(
    state: TavernShopInventoryState,
): TavernShopStateInvariantViolation | null {
    const activationIds = new Set<string>();
    for (const itemId of Object.keys(state.items || {}).sort()) {
        const entry = state.items[itemId];
        const item = findTavernShopItem(itemId);
        if (!item) {return { code: 'item-unknown', itemId };}
        if (!entry || entry.itemId !== itemId) {return { code: 'entry-item-mismatch', itemId };}
        if (
            item.purchaseLimit !== undefined
            && entry.quantity + entry.activations.length > item.purchaseLimit
        ) {
            return { code: 'purchase-limit', itemId };
        }

        const validActivations: Array<{
            activation: TavernShopActivation;
            interval: TavernShopActivationInterval;
            key: string;
        }> = [];
        for (const activation of entry.activations) {
            if (activationIds.has(activation.id)) {
                return { code: 'activation-id-duplicate', itemId, activationId: activation.id };
            }
            activationIds.add(activation.id);
            if (activation.itemId !== itemId) {
                return { code: 'activation-item-mismatch', itemId, activationId: activation.id };
            }
            if (!hasCanonicalParameters(item, activation.parameters)) {
                return { code: 'parameters-invalid', itemId, activationId: activation.id };
            }
            const interval = activationInterval(item, activation);
            if (!interval) {
                return { code: 'activation-lifecycle-invalid', itemId, activationId: activation.id };
            }
            validActivations.push({
                activation,
                interval,
                key: tavernShopActivationKey(item, activation.parameters),
            });
        }
        for (let leftIndex = 0; leftIndex < validActivations.length; leftIndex += 1) {
            for (let rightIndex = leftIndex + 1; rightIndex < validActivations.length; rightIndex += 1) {
                const left = validActivations[leftIndex];
                const right = validActivations[rightIndex];
                const sameScope = item.stacking === 'global-single' || left.key === right.key;
                if (sameScope && intervalsOverlap(left.interval, right.interval)) {
                    return { code: 'activation-overlap', itemId, activationId: right.activation.id };
                }
            }
        }
    }
    return null;
}
