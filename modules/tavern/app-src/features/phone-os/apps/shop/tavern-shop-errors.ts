import { TavernPhoneBoundaryError } from '../../../../../shared/phone-boundary';
import { TavernShopError } from '../../../../../shared/shop/shop-types';

export type TavernShopUiErrorKind = 'conflict' | 'timeline' | 'wallet' | 'ordinary';

export interface TavernShopUiError {
    kind: TavernShopUiErrorKind;
    message: string;
}

export function tavernShopUiError(error: unknown): TavernShopUiError {
    const message = error instanceof Error ? error.message : String(error || 'shop_action_failed');
    const code = error instanceof TavernShopError ? error.code : message.split(':', 1)[0];
    if (error instanceof TavernPhoneBoundaryError || code === 'phone_timeline_conflict') {
        return { kind: 'timeline', message: '剧情时间线已经变化，这次操作没有提交。背包已刷新，请关闭后重新操作。' };
    }
    if (code === 'shop_revision_conflict' || code === 'shop_version_conflict') {
        return { kind: 'conflict', message: '背包已在其他页面更新，已为你刷新；请关闭后重新操作。' };
    }
    const staleStateMessages: Partial<Record<string, string>> = {
        shop_purchase_limit_reached: '限购状态已经变化，已刷新背包；请关闭后重新操作。',
        shop_quantity_insufficient: '这件道具的库存已经变化，已刷新背包；请关闭后重新操作。',
        shop_activation_duplicate: '同一目标上的同款效果仍在生效，已刷新背包；请关闭后重新操作。',
        shop_activation_missing: '这个生效记录已经不存在，已刷新背包；请关闭后重新操作。',
        shop_activation_not_active: '这个效果已经结束，已刷新背包；请关闭后重新操作。',
    };
    if (staleStateMessages[code]) {
        return { kind: 'conflict', message: staleStateMessages[code]! };
    }
    if (code === 'economy_balance_insufficient') {
        return { kind: 'wallet', message: '小白币余额不足，没有扣款；已为你刷新余额。' };
    }
    const messages: Partial<Record<string, string>> = {
        shop_activation_not_manual: '这个效果不能手动关闭。',
        shop_parameters_invalid: '请完整填写道具需要的信息。',
        shop_item_missing: '商品目录中找不到这件道具。',
        shop_session_missing: '这段剧情已经不存在。',
        shop_action_conflict: '这次操作与已经提交的记录不一致，请重新打开确认框。',
        shop_anchor_order_regression: '剧情位置已经变化，这次操作没有提交。',
    };
    return {
        kind: 'ordinary',
        message: messages[code] || '规则当铺暂时无法完成操作，请稍后重试。',
    };
}
