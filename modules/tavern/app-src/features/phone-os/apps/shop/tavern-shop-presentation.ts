import { listTavernShopCatalog } from '../../../../../shared/shop/shop-catalog';
import {
    isTavernShopActivationActive,
    tavernShopRemainingRounds,
    type TavernShopActivation,
    type TavernShopCategory,
    type TavernShopInventoryState,
    type TavernShopItem,
} from '../../../../../shared/shop/shop-types';

export interface TavernShopShelfRow {
    item: TavernShopItem;
    categoryLabel: string;
    durationLabel: string;
    purchaseLimitReached: boolean;
}

export interface TavernShopActivationRow {
    item: TavernShopItem;
    activation: TavernShopActivation;
    parameterSummary: string;
    durationLabel: string;
    remainingRounds: number | null;
    finalRound: boolean;
    canDeactivate: boolean;
}

export interface TavernShopInventoryRow {
    item: TavernShopItem;
    quantity: number;
    activationCount: number;
}

const CATEGORY_LABELS: Record<TavernShopCategory, string> = {
    emotion: '心绪之物',
    memory: '记忆之物',
    information: '耳目之物',
    behavior: '性情之物',
    scene: '境界之物',
    ultimate: '镇店之物',
    'world-cognition': '众目之物',
    physics: '造化之物',
};

export function tavernShopCategoryLabel(category: TavernShopCategory): string {
    return CATEGORY_LABELS[category];
}

export function tavernShopDurationLabel(item: TavernShopItem): string {
    if (item.duration.kind === 'turns') {
        return item.duration.rounds === 1 ? '一次性 · 下一主回合' : `${item.duration.rounds} 个主回合`;
    }
    if (item.duration.kind === 'manual') {return '持续生效 · 可关闭';}
    return '永久生效 · 不可关闭';
}

function parameterSummary(item: TavernShopItem, activation: TavernShopActivation): string {
    return item.inputs
        .map((input) => `${input.label}：${activation.parameters[input.key] || '—'}`)
        .join(' · ');
}

export function projectTavernShopShelf(state: TavernShopInventoryState): TavernShopShelfRow[] {
    return listTavernShopCatalog().map((item) => {
        const entry = state.items[item.id];
        const acquiredCount = (entry?.quantity || 0) + (entry?.activations.length || 0);
        return {
            item,
            categoryLabel: tavernShopCategoryLabel(item.category),
            durationLabel: tavernShopDurationLabel(item),
            purchaseLimitReached: item.purchaseLimit !== undefined && acquiredCount >= item.purchaseLimit,
        };
    });
}

export function projectTavernShopInventory(
    state: TavernShopInventoryState,
    currentTurn: number,
): {
    active: TavernShopActivationRow[];
    held: TavernShopInventoryRow[];
    exhausted: TavernShopInventoryRow[];
} {
    const active: TavernShopActivationRow[] = [];
    const held: TavernShopInventoryRow[] = [];
    const exhausted: TavernShopInventoryRow[] = [];
    for (const item of listTavernShopCatalog()) {
        const entry = state.items[item.id];
        if (!entry) {continue;}
        const activeActivations = entry.activations.filter((activation) => (
            isTavernShopActivationActive(activation, item, currentTurn)
        ));
        for (const activation of activeActivations) {
            const remainingRounds = tavernShopRemainingRounds(activation, item, currentTurn);
            active.push({
                item,
                activation,
                parameterSummary: parameterSummary(item, activation),
                durationLabel: item.duration.kind === 'turns'
                    ? `剩余 ${Math.max(0, Number(remainingRounds) || 0)} 个主回合`
                    : tavernShopDurationLabel(item),
                remainingRounds,
                finalRound: remainingRounds === 1,
                canDeactivate: item.duration.kind === 'manual',
            });
        }
        if (entry.quantity > 0) {
            held.push({ item, quantity: entry.quantity, activationCount: entry.activations.length });
        }
        if (entry.quantity === 0 && activeActivations.length === 0 && entry.activations.length > 0) {
            exhausted.push({ item, quantity: 0, activationCount: entry.activations.length });
        }
    }
    active.sort((left, right) => (
        left.activation.activatedAt - right.activation.activatedAt
        || left.activation.id.localeCompare(right.activation.id)
    ));
    return { active, held, exhausted };
}
