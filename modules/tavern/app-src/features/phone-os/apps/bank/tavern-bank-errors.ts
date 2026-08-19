import { TavernPhoneBoundaryError } from '../../../../../shared/phone-boundary';
import { TavernBankError } from '../../../../../shared/bank/bank-types';

export type TavernBankUiErrorKind = 'conflict' | 'timeline' | 'wallet' | 'ordinary';

export interface TavernBankUiError {
    kind: TavernBankUiErrorKind;
    message: string;
}

export function tavernBankUiError(error: unknown): TavernBankUiError {
    const message = error instanceof Error ? error.message : String(error || 'bank_action_failed');
    const code = error instanceof TavernBankError ? error.code : message.split(':', 1)[0];
    if (error instanceof TavernPhoneBoundaryError
        || code === 'phone_timeline_conflict'
        || code === 'bank_anchor_order_regression') {
        return { kind: 'timeline', message: '剧情时间线已经变化，这次操作没有提交。金库已刷新，请重新操作。' };
    }
    if (
        code === 'bank_revision_conflict'
        || code === 'bank_version_conflict'
        || code === 'bank_action_conflict'
        || code === 'bank_turn_regression'
    ) {
        return { kind: 'conflict', message: '金库已在其他页面更新，已为你刷新；请重新操作。' };
    }
    const staleStateMessages: Partial<Record<string, string>> = {
        bank_game_active: '牌桌上还有一局没结束，已刷新金库；请回到赌坊继续。',
        bank_game_missing: '这一局已经不在了，已刷新金库；请重新开始。',
        bank_game_invalid: '这一局的状态已经变化，已刷新金库；请重新操作。',
        bank_game_kind_conflict: '当前进行的不是这个玩法，已刷新金库；请重新操作。',
        bank_dice_bid_not_higher: '喊注必须高于上一口，已刷新牌面；请重新喊注。',
        bank_push_cashout_invalid: '这一把已经不能收手，已刷新金库；请重新操作。',
        bank_ladder_cashout_invalid: '现在还不能落袋，已刷新金库；请重新操作。',
    };
    if (staleStateMessages[code]) {
        return { kind: 'conflict', message: staleStateMessages[code]! };
    }
    if (code === 'economy_balance_insufficient') {
        return { kind: 'wallet', message: '小白币余额不足，没有扣款；已为你刷新余额。' };
    }
    const messages: Partial<Record<string, string>> = {
        bank_amount_out_of_range: '金额不在这款产品的可用范围内。',
        bank_amount_invalid: '请填写有效的整数金额。',
        bank_amount_overflow: '这个金额太大了，金库无法承接。',
        bank_product_missing: '找不到这款银行产品。',
        bank_product_invalid: '这款银行产品暂时不可用。',
        bank_dice_bid_invalid: '这一口喊注不合规则。',
        bank_dice_challenge_invalid: '现在不能开牌。',
        bank_ladder_choice_invalid: '请选择一个有效的档位。',
        bank_session_missing: '这段剧情已经不存在。',
    };
    return {
        kind: 'ordinary',
        message: messages[code] || '小白银行暂时无法完成操作，请稍后重试。',
    };
}
