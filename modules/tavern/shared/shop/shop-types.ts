import type {
    TavernExpectedPhoneBoundary,
} from '../phone-boundary';

export const TAVERN_SHOP_CURRENT_MARKER = 'current' as const;

export type TavernShopDuration =
    | { kind: 'turns'; rounds: number }
    | { kind: 'manual' }
    | { kind: 'permanent' };

export type TavernShopCategory = 'emotion' | 'memory' | 'information' | 'behavior' | 'scene' | 'ultimate';

export type TavernShopInputKey = 'targetName' | 'identity';

export type TavernShopStacking = 'global-single' | 'per-parameters';

export interface TavernShopInputDefinition {
    key: TavernShopInputKey;
    label: string;
    placeholder: string;
    required: true;
    maxLength: number;
}

export interface TavernShopItem {
    id: string;
    name: string;
    icon: string;
    category: TavernShopCategory;
    price: number;
    description: string;
    duration: TavernShopDuration;
    inputs: readonly TavernShopInputDefinition[];
    stacking: TavernShopStacking;
    purchaseLimit?: number;
    injection: string;
}

export interface TavernShopActivation {
    id: string;
    itemId: string;
    parameters: Record<string, string>;
    startsAtTurn: number;
    activatedAtOrder: number;
    activatedAt: number;
    endedAtTurn?: number;
    endedAtOrder?: number;
    endedAt?: number;
    endReason?: 'manual';
}

export interface TavernShopInventoryEntry {
    itemId: string;
    quantity: number;
    activations: TavernShopActivation[];
}

export interface TavernShopInventoryState {
    items: Record<string, TavernShopInventoryEntry>;
}

export type TavernShopActionKind = 'purchase' | 'activate' | 'deactivate';

export interface TavernShopStateAction {
    kind: TavernShopActionKind;
    itemId: string;
    activationId?: string;
}

export interface TavernShopStateVersionRecord {
    sessionId: string;
    revision: number;
    versionId: string;
    currentMarker?: typeof TAVERN_SHOP_CURRENT_MARKER;
    actionId: string;
    action: TavernShopStateAction;
    anchorOrder: number;
    state: TavernShopInventoryState;
    createdAt: number;
    updatedAt: number;
}

export interface TavernShopRestoreImpact {
    changed: boolean;
    targetFloor: number;
    deletedVersionCount: number;
    affectedItemCount: number;
}

export type TavernShopErrorCode =
    | 'shop_session_required'
    | 'shop_session_missing'
    | 'shop_item_id_required'
    | 'shop_item_missing'
    | 'shop_action_required'
    | 'shop_action_conflict'
    | 'shop_revision_invalid'
    | 'shop_revision_conflict'
    | 'shop_version_id_invalid'
    | 'shop_version_conflict'
    | 'shop_anchor_order_invalid'
    | 'shop_anchor_order_regression'
    | 'shop_purchase_limit_reached'
    | 'shop_quantity_insufficient'
    | 'shop_parameters_invalid'
    | 'shop_activation_duplicate'
    | 'shop_activation_missing'
    | 'shop_activation_not_manual'
    | 'shop_activation_not_active'
    | 'shop_state_invalid';

export class TavernShopError extends Error {
    readonly code: TavernShopErrorCode;

    constructor(code: TavernShopErrorCode, detail = '') {
        super(detail ? `${code}:${detail}` : code);
        this.name = 'TavernShopError';
        this.code = code;
    }
}

export function throwTavernShopError(code: TavernShopErrorCode, detail = ''): never {
    throw new TavernShopError(code, detail);
}

export interface PurchaseTavernShopItemInput {
    sessionId: string;
    itemId: string;
    boundary: TavernExpectedPhoneBoundary;
    actionId: string;
    expectedRevision: number;
    expectedVersionId: string;
}

export interface ActivateTavernShopItemInput {
    sessionId: string;
    itemId: string;
    parameters: Record<string, unknown>;
    boundary: TavernExpectedPhoneBoundary;
    actionId: string;
    expectedRevision: number;
    expectedVersionId: string;
}

export interface DeactivateTavernShopItemInput {
    sessionId: string;
    itemId: string;
    activationId: string;
    boundary: TavernExpectedPhoneBoundary;
    actionId: string;
    expectedRevision: number;
    expectedVersionId: string;
}

export function normalizeTavernShopSessionId(value = ''): string {
    const sessionId = String(value || '').trim();
    if (!sessionId) {throwTavernShopError('shop_session_required');}
    return sessionId;
}

export function normalizeTavernShopAnchorOrder(value: unknown): number {
    const order = Number(value);
    if (!Number.isSafeInteger(order) || order < -1) {throwTavernShopError('shop_anchor_order_invalid', String(value));}
    return order;
}

export function normalizeTavernShopTurn(value: unknown): number {
    const turn = Math.floor(Number(value));
    if (!Number.isSafeInteger(turn) || turn < 0) {return 0;}
    return turn;
}

function normalizeLimitedText(value: unknown, limit: number): string {
    return String(value ?? '')
        .normalize('NFKC')
        .replace(/\r\n?/g, '\n')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, limit);
}

/**
 * User input only ever fills reviewed template slots as data. Values are
 * normalized, length-capped and reduced to the declared input keys.
 */
export function normalizeTavernShopParameters(
    item: TavernShopItem,
    rawParameters: Record<string, unknown> = {},
): Record<string, string> {
    const source = rawParameters && typeof rawParameters === 'object' && !Array.isArray(rawParameters)
        ? rawParameters
        : {};
    const parameters: Record<string, string> = {};
    for (const definition of item.inputs) {
        const value = normalizeLimitedText(source[definition.key], definition.maxLength);
        if (definition.required && !value) {
            throwTavernShopError('shop_parameters_invalid', `${item.id}:${definition.key}`);
        }
        if (value) {parameters[definition.key] = value;}
    }
    return parameters;
}

/** Canonical duplicate-activation key: itemId + normalized parameters. */
export function tavernShopActivationKey(
    item: TavernShopItem,
    parameters: Record<string, string>,
): string {
    const pairs = item.inputs.map((definition) => [definition.key, String(parameters[definition.key] || '')]);
    return `${item.id}${JSON.stringify(pairs)}`;
}

export function isTavernShopActivationActive(
    activation: TavernShopActivation,
    item: TavernShopItem,
    currentTurn: number,
): boolean {
    const turn = normalizeTavernShopTurn(currentTurn);
    const started = activation.startsAtTurn <= turn;
    const notManuallyEnded = activation.endedAtTurn === undefined;
    if (!started || !notManuallyEnded) {return false;}
    if (item.duration.kind !== 'turns') {return true;}
    return turn < activation.startsAtTurn + item.duration.rounds;
}

/** Remaining main-RP rounds for a turns-limited activation; never persisted. */
export function tavernShopRemainingRounds(
    activation: TavernShopActivation,
    item: TavernShopItem,
    currentTurn: number,
): number | null {
    if (item.duration.kind !== 'turns') {return null;}
    const turn = normalizeTavernShopTurn(currentTurn);
    return activation.startsAtTurn + item.duration.rounds - turn;
}

function normalizeActivation(value: unknown, itemId: string): TavernShopActivation {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throwTavernShopError('shop_state_invalid', 'activation');
    }
    const record = value as Record<string, unknown>;
    const id = String(record.id || '').trim();
    if (!id) {throwTavernShopError('shop_state_invalid', 'activation.id');}
    const startsAtTurn = Number(record.startsAtTurn);
    if (!Number.isSafeInteger(startsAtTurn) || startsAtTurn < 0) {
        throwTavernShopError('shop_state_invalid', 'activation.startsAtTurn');
    }
    const activatedAtOrder = normalizeTavernShopAnchorOrder(record.activatedAtOrder);
    const activatedAt = Number(record.activatedAt);
    if (!Number.isSafeInteger(activatedAt) || activatedAt <= 0) {
        throwTavernShopError('shop_state_invalid', 'activation.activatedAt');
    }
    const parameters: Record<string, string> = {};
    if (record.parameters && typeof record.parameters === 'object' && !Array.isArray(record.parameters)) {
        for (const [key, raw] of Object.entries(record.parameters as Record<string, unknown>)) {
            const text = String(key || '').trim();
            if (text) {parameters[text] = String(raw ?? '');}
        }
    }
    const hasEnded = record.endedAtTurn !== undefined
        || record.endedAtOrder !== undefined
        || record.endedAt !== undefined
        || record.endReason !== undefined;
    if (!hasEnded) {
        return {
            id,
            itemId,
            parameters,
            startsAtTurn,
            activatedAtOrder,
            activatedAt,
        };
    }
    const endedAtTurn = Number(record.endedAtTurn);
    if (!Number.isSafeInteger(endedAtTurn) || endedAtTurn < 0) {
        throwTavernShopError('shop_state_invalid', 'activation.endedAtTurn');
    }
    const endedAtOrder = normalizeTavernShopAnchorOrder(record.endedAtOrder);
    const endedAt = Number(record.endedAt);
    if (!Number.isSafeInteger(endedAt) || endedAt <= 0) {
        throwTavernShopError('shop_state_invalid', 'activation.endedAt');
    }
    if (record.endReason !== 'manual') {throwTavernShopError('shop_state_invalid', 'activation.endReason');}
    return {
        id,
        itemId,
        parameters,
        startsAtTurn,
        activatedAtOrder,
        activatedAt,
        endedAtTurn,
        endedAtOrder,
        endedAt,
        endReason: 'manual',
    };
}

export function normalizeTavernShopInventoryState(value: unknown): TavernShopInventoryState {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throwTavernShopError('shop_state_invalid', 'state');
    }
    const source = value as Record<string, unknown>;
    if (!source.items || typeof source.items !== 'object' || Array.isArray(source.items)) {
        throwTavernShopError('shop_state_invalid', 'items');
    }
    const items: Record<string, TavernShopInventoryEntry> = {};
    for (const [itemId, rawEntry] of Object.entries(source.items as Record<string, unknown>)) {
        const id = String(itemId || '').trim();
        if (!id || !rawEntry || typeof rawEntry !== 'object' || Array.isArray(rawEntry)) {
            throwTavernShopError('shop_state_invalid', `entry:${id}`);
        }
        const entry = rawEntry as Record<string, unknown>;
        if (String(entry.itemId || '') !== id) {throwTavernShopError('shop_state_invalid', `entry.itemId:${id}`);}
        const quantity = Number(entry.quantity);
        if (!Number.isSafeInteger(quantity) || quantity < 0) {
            throwTavernShopError('shop_state_invalid', `entry.quantity:${id}`);
        }
        if (!Array.isArray(entry.activations)) {throwTavernShopError('shop_state_invalid', `entry.activations:${id}`);}
        const activations = entry.activations.map((activation) => normalizeActivation(activation, id));
        const activationIds = new Set<string>();
        for (const activation of activations) {
            if (activationIds.has(activation.id)) {
                throwTavernShopError('shop_state_invalid', `activation.duplicate:${activation.id}`);
            }
            activationIds.add(activation.id);
        }
        items[id] = { itemId: id, quantity, activations };
    }
    return { items };
}

export function normalizeTavernShopStateVersionRecord(
    record: TavernShopStateVersionRecord,
): TavernShopStateVersionRecord {
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
        throwTavernShopError('shop_state_invalid', 'version');
    }
    const sessionId = normalizeTavernShopSessionId(record.sessionId);
    const revision = Number(record.revision);
    if (!Number.isSafeInteger(revision) || revision <= 0) {
        throwTavernShopError('shop_revision_invalid', String(record.revision));
    }
    const versionId = String(record.versionId || '').trim();
    if (!versionId || versionId.length > 220) {throwTavernShopError('shop_version_id_invalid', versionId);}
    if (record.currentMarker && record.currentMarker !== TAVERN_SHOP_CURRENT_MARKER) {
        throwTavernShopError('shop_state_invalid', 'currentMarker');
    }
    const actionId = String(record.actionId || '').trim();
    if (!actionId) {throwTavernShopError('shop_action_required');}
    const action = record.action && typeof record.action === 'object' && !Array.isArray(record.action)
        ? record.action as unknown as Record<string, unknown>
        : null;
    if (!action || !['purchase', 'activate', 'deactivate'].includes(String(action.kind || ''))) {
        throwTavernShopError('shop_state_invalid', 'action.kind');
    }
    const actionItemId = String(action.itemId || '').trim();
    if (!actionItemId) {throwTavernShopError('shop_state_invalid', 'action.itemId');}
    const actionActivationId = String(action.activationId || '').trim();
    const createdAt = Number(record.createdAt);
    const updatedAt = Number(record.updatedAt);
    if (!Number.isSafeInteger(createdAt) || createdAt <= 0 || !Number.isSafeInteger(updatedAt) || updatedAt <= 0) {
        throwTavernShopError('shop_state_invalid', 'version.timestamps');
    }
    return {
        sessionId,
        revision,
        versionId,
        ...(record.currentMarker === TAVERN_SHOP_CURRENT_MARKER
            ? { currentMarker: TAVERN_SHOP_CURRENT_MARKER }
            : {}),
        actionId,
        action: {
            kind: action.kind as TavernShopActionKind,
            itemId: actionItemId,
            ...(actionActivationId ? { activationId: actionActivationId } : {}),
        },
        anchorOrder: normalizeTavernShopAnchorOrder(record.anchorOrder),
        state: normalizeTavernShopInventoryState(record.state),
        createdAt,
        updatedAt,
    };
}
