import {
    getShopContract,
    listShopPublishedContracts,
    listShopShelfContracts,
} from '../../../domains/shop/catalog.js';
import { isShopActivationActive, shopRemainingApplications } from '../../../domains/shop/timeline.js';
import type { ShopServiceView } from '../application/service.js';
import type { ShopActivationView, ShopClientState, ShopClientStatus } from '../types.js';

const CATEGORY_LABELS: Readonly<Record<string, string>> = Object.freeze({
    emotion: '情绪',
    memory: '记忆',
    information: '知悉',
    behavior: '行为',
    scene: '场景',
    ultimate: '至高',
    'world-cognition': '认知',
    physics: '现实',
});

function durationLabel(duration: ReturnType<typeof listShopPublishedContracts>[number]['duration']): string {
    if (duration.kind === 'manual') {return '持续至手动关闭';}
    if (duration.kind === 'permanent') {return '永久生效';}
    return duration.applications === 1 ? '作用于下一条新回复' : `作用于接下来 ${duration.applications} 条新回复`;
}

function resolveStatus(
    view: ShopServiceView,
): { status: ShopClientStatus; message: string } {
    if (view.writeState === 'loading') {
        return { status: 'loading', message: '' };
    }
    if (view.writeState === 'conflict') {
        return { status: 'conflict', message: '服务器上的存档与当前内容不同，请刷新酒馆后再继续。' };
    }
    if (view.writeState === 'unconfirmed') {
        return { status: 'unconfirmed', message: '还不确定上次是否保存成功，暂时不能购买或使用商品。请先检查保存。' };
    }
    if (view.writeState === 'saving') {
        return { status: 'saving', message: '正在保存商品和账目…' };
    }
    if (view.writeState === 'failed') {
        return { status: 'blocked', message: '商店数据暂时无法读取，请稍后重试。' };
    }
    return { status: 'ready', message: '' };
}

function activationView(
    activation: ShopServiceView['projection']['activations'][number],
): ShopActivationView {
    const item = getShopContract(activation.itemId);
    const active = isShopActivationActive(activation, item);
    const closed = item.duration.kind === 'manual' && activation.deactivatedByEventId !== undefined;
    const remaining = shopRemainingApplications(activation, item);
    const state = active ? 'active' : closed ? 'closed' : 'expired';
    const stateLabel = active
        ? remaining === null
            ? item.duration.kind === 'manual' ? '持续生效中' : '永久生效'
            : `剩余 ${remaining} 条新回复`
        : closed ? '已关闭' : '已结束';
    return {
        activationId: activation.activationId,
        itemId: item.id,
        name: item.name,
        icon: item.icon,
        parameters: item.inputs.map((input) => ({
            label: input.label,
            value: activation.parameters[input.key] || '',
        })),
        durationLabel: durationLabel(item.duration),
        state,
        stateLabel,
        canDeactivate: active && item.duration.kind === 'manual',
    };
}

export function presentShopState({
    chatIdentity,
    serviceView,
    generationActive,
}: {
    chatIdentity: string;
    serviceView: ShopServiceView;
    generationActive: boolean;
}): ShopClientState {
    const status = resolveStatus(serviceView);
    const shelfIds = new Set(listShopShelfContracts().map(item => item.id));
    return {
        chatIdentity,
        currency: '小白币',
        balance: serviceView.balance,
        revision: serviceView.projection.revision,
        eventId: serviceView.projection.eventId,
        ...status,
        generationActive,
        catalog: listShopPublishedContracts().map((item) => {
            const inventory = serviceView.projection.inventory[item.id];
            return {
                id: item.id,
                name: item.name,
                icon: item.icon,
                category: item.category,
                categoryLabel: CATEGORY_LABELS[item.category] || item.category,
                price: item.price,
                description: item.description,
                duration: item.duration.kind,
                durationLabel: durationLabel(item.duration),
                onShelf: shelfIds.has(item.id),
                inputs: item.inputs.map((input) => ({
                    key: input.key,
                    label: input.label,
                    placeholder: input.placeholder,
                    maxLength: input.maxLength,
                })),
                purchaseLimit: item.purchaseLimit ?? null,
                purchasedCount: inventory?.purchasedCount || 0,
                quantity: inventory?.quantity || 0,
            };
        }),
        activations: serviceView.projection.activations.map(activationView),
    };
}
