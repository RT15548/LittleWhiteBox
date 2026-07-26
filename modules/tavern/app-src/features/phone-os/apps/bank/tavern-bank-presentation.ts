import {
    getTavernBankDepositContract,
    getTavernBankFundContract,
    listTavernBankDepositProducts,
    listTavernBankFundProducts,
} from '../../../../../shared/bank/bank-products';
import {
    TAVERN_BANK_DICE_MIN_BET,
    TAVERN_BANK_DICE_MAX_BET,
    TAVERN_BANK_DICE_BET_STEP,
    TAVERN_BANK_DICE_PAYOUT_NUMERATOR,
    TAVERN_BANK_DICE_PAYOUT_DENOMINATOR,
    countTavernBankDiceMatches,
} from '../../../../../shared/bank/games/dice-bluff';
import {
    TAVERN_BANK_PUSH_BET,
} from '../../../../../shared/bank/games/push-your-luck';
import {
    TAVERN_BANK_LADDER_MIN_BET,
    TAVERN_BANK_LADDER_MAX_BET,
    TAVERN_BANK_LADDER_BET_STEP,
    TAVERN_BANK_LADDER_MAX_FLOORS,
} from '../../../../../shared/bank/games/risk-ladder';
import type {
    TavernBankActivityDetail,
    TavernBankActivityRecord,
    TavernBankBidFace,
    TavernBankDepositView,
    TavernBankDepositProduct,
    TavernBankFundView,
    TavernBankFundProduct,
    TavernBankLadderChoice,
    TavernBankLadderGameView,
} from '../../../../../shared/bank/bank-types';

export interface TavernBankDepositProductRow {
    product: TavernBankDepositProduct;
    lockLabel: string;
    interestLabel: string;
    penaltyLabel: string;
    amountLabel: string;
}

export interface TavernBankFundProductRow {
    product: TavernBankFundProduct;
    lockLabel: string;
    riskLabel: string;
    returnLabel: string;
    amountLabel: string;
}

const RISK_LABELS: Record<TavernBankFundProduct['riskLevel'], string> = {
    low: '低波动',
    medium: '中波动',
    high: '高波动',
};

const LADDER_CHOICE_LABELS: Record<TavernBankLadderChoice, string> = {
    safe: '稳健',
    medium: '进取',
    risky: '搏命',
};

export const TAVERN_BANK_DICE_BET_META = Object.freeze({
    min: TAVERN_BANK_DICE_MIN_BET,
    max: TAVERN_BANK_DICE_MAX_BET,
    step: TAVERN_BANK_DICE_BET_STEP,
});

export const TAVERN_BANK_LADDER_BET_META = Object.freeze({
    min: TAVERN_BANK_LADDER_MIN_BET,
    max: TAVERN_BANK_LADDER_MAX_BET,
    step: TAVERN_BANK_LADDER_BET_STEP,
    maxFloors: TAVERN_BANK_LADDER_MAX_FLOORS,
});

export const TAVERN_BANK_PUSH_BET_META = Object.freeze({
    bet: TAVERN_BANK_PUSH_BET,
});

export function tavernBankBpsPercentLabel(bps: number): string {
    const sign = bps > 0 ? '+' : bps < 0 ? '-' : '';
    const magnitude = Math.abs(bps) / 100;
    const text = Number.isInteger(magnitude)
        ? String(magnitude)
        : magnitude.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
    return `${sign}${text}%`;
}

export function tavernBankProbabilityLabel(bps: number): string {
    const magnitude = Math.max(0, Math.min(10_000, Math.floor(Number(bps) || 0))) / 100;
    const text = Number.isInteger(magnitude) ? String(magnitude) : magnitude.toFixed(1).replace(/\.0$/, '');
    return `${text}%`;
}

export function tavernBankLadderChoiceLabel(choice: TavernBankLadderChoice): string {
    return LADDER_CHOICE_LABELS[choice];
}

export interface TavernBankDepositWithdrawalQuote {
    matured: boolean;
    amount: number;
    amountLabel: string;
    actionLabel: string;
}

export function projectTavernBankDepositWithdrawalQuote(
    deposit: Pick<TavernBankDepositView, 'remainingRounds' | 'maturityAmount' | 'earlyWithdrawalAmount'>,
): TavernBankDepositWithdrawalQuote {
    const matured = deposit.remainingRounds <= 0;
    const amount = matured ? deposit.maturityAmount : deposit.earlyWithdrawalAmount;
    return {
        matured,
        amount,
        amountLabel: `${amount} 币`,
        actionLabel: matured ? '领取本息' : '提前支取',
    };
}

export type TavernBankPositionRow =
    | {
        kind: 'deposit';
        id: string;
        maturityTurn: number;
        remainingRounds: number;
        deposit: TavernBankDepositView;
        quote: TavernBankDepositWithdrawalQuote;
    }
    | {
        kind: 'fund';
        id: string;
        maturityTurn: number;
        remainingRounds: number;
        fund: TavernBankFundView;
    };

export function projectTavernBankPositions(
    deposits: readonly TavernBankDepositView[],
    investments: readonly TavernBankFundView[],
): TavernBankPositionRow[] {
    return [
        ...deposits.map((deposit): TavernBankPositionRow => ({
            kind: 'deposit',
            id: deposit.id,
            maturityTurn: deposit.maturityTurn,
            remainingRounds: deposit.remainingRounds,
            deposit,
            quote: projectTavernBankDepositWithdrawalQuote(deposit),
        })),
        ...investments.map((fund): TavernBankPositionRow => ({
            kind: 'fund',
            id: fund.id,
            maturityTurn: fund.maturityTurn,
            remainingRounds: fund.remainingRounds,
            fund,
        })),
    ].sort((left, right) => (
        left.maturityTurn - right.maturityTurn
        || left.kind.localeCompare(right.kind)
        || left.id.localeCompare(right.id)
    ));
}

export function projectTavernBankDiceBidEvidence(input: {
    playerDice: readonly (1 | 2 | 3 | 4 | 5 | 6)[];
    count: number;
    face: TavernBankBidFace;
}): { knownMatches: number; dealerMinimum: number } {
    const knownMatches = countTavernBankDiceMatches(input.playerDice, input.face);
    return {
        knownMatches,
        dealerMinimum: Math.max(0, Math.floor(Number(input.count) || 0) - knownMatches),
    };
}

export interface TavernBankLadderTrackRow {
    floor: number;
    status: 'completed' | 'current' | 'upcoming';
    choiceLabel: string;
    amount: number | null;
}

export function projectTavernBankActiveLadderTrack(
    game: Pick<TavernBankLadderGameView, 'completedFloors' | 'history'>,
): TavernBankLadderTrackRow[] {
    return Array.from({ length: TAVERN_BANK_LADDER_MAX_FLOORS }, (_unused, index) => {
        const floor = index + 1;
        const step = game.history.find((entry) => entry.floor === floor) || null;
        return {
            floor,
            status: step ? 'completed' : floor === game.completedFloors + 1 ? 'current' : 'upcoming',
            choiceLabel: step ? tavernBankLadderChoiceLabel(step.choice) : '',
            amount: step?.amountAfterSuccess ?? null,
        };
    });
}

export const TAVERN_BANK_DICE_PAYOUT_LABEL = `x${(
    TAVERN_BANK_DICE_PAYOUT_NUMERATOR / TAVERN_BANK_DICE_PAYOUT_DENOMINATOR
).toFixed(1)}`;

function lockLabel(rounds: number): string {
    return `锁定 ${rounds} 个主回合`;
}

function amountLabel(min: number, max: number): string {
    return `${min} ~ ${max} 小白币`;
}

export function projectTavernBankDepositProducts(): TavernBankDepositProductRow[] {
    return listTavernBankDepositProducts().map((product) => ({
        product,
        lockLabel: lockLabel(product.lockRounds),
        interestLabel: `到期利息 ${tavernBankBpsPercentLabel(product.interestBps)}`,
        penaltyLabel: `提前支取扣 ${tavernBankBpsPercentLabel(-product.earlyPenaltyBps)}`,
        amountLabel: amountLabel(product.minAmount, product.maxAmount),
    }));
}

export function projectTavernBankFundProducts(): TavernBankFundProductRow[] {
    return listTavernBankFundProducts().map((product) => ({
        product,
        lockLabel: lockLabel(product.lockRounds),
        riskLabel: RISK_LABELS[product.riskLevel],
        returnLabel: `到期回报 ${tavernBankBpsPercentLabel(product.returnRangeBps.min)} ~ ${tavernBankBpsPercentLabel(product.returnRangeBps.max)}`,
        amountLabel: amountLabel(product.minAmount, product.maxAmount),
    }));
}

export interface TavernBankActivityRow {
    record: TavernBankActivityRecord;
    title: string;
    outcomeLabel: string;
    netLabel: string;
    positive: boolean;
    negative: boolean;
    gameWon: boolean | null;
    detailRows: Array<{ label: string; value: string }>;
}

function activityTitle(detail: TavernBankActivityDetail): string {
    switch (detail.kind) {
        case 'deposit':
            return '存单结算';
        case 'fund':
            return '理财到期';
        case 'dice':
            return '骰局吹牛';
        case 'push':
            return '翻倍或收手';
        case 'ladder':
            return '风险阶梯';
        default:
            return '银行活动';
    }
}

function activityOutcomeLabel(detail: TavernBankActivityDetail): string {
    switch (detail.kind) {
        case 'deposit':
            return detail.outcome === 'matured' ? '到期兑付' : '提前支取';
        case 'fund':
            return `回报 ${tavernBankBpsPercentLabel(detail.resolvedReturnBps)}`;
        case 'dice':
            return detail.result === 'player-win' ? '你赢了这局' : '庄家赢了这局';
        case 'push':
            return detail.outcome === 'cashed-out'
                ? `收手 · 揭开 ${detail.revealedCoins} 金币`
                : detail.outcome === 'cleared'
                    ? `清盘 · 揭开 ${detail.revealedCoins} 金币`
                    : `踩雷 · 揭开 ${detail.revealedCoins} 金币`;
        case 'ladder':
            return detail.outcome === 'cashed-out'
                ? '落袋为安'
                : detail.outcome === 'failed'
                    ? '跌落阶梯'
                    : detail.outcome === 'capped'
                        ? '触顶封顶'
                        : '登顶清盘';
        default:
            return '';
    }
}

function activityGameWon(detail: TavernBankActivityDetail): boolean | null {
    switch (detail.kind) {
        case 'dice':
            return detail.result === 'player-win';
        case 'push':
            return detail.outcome !== 'busted';
        case 'ladder':
            return detail.outcome !== 'failed';
        default:
            return null;
    }
}

function signedAmountLabel(value: number): string {
    return `${value > 0 ? '+' : value < 0 ? '-' : ''}${Math.abs(value)} 币`;
}

function activityEvidenceRows(record: TavernBankActivityRecord): Array<{ label: string; value: string }> {
    const rows = [
        { label: '投入', value: `${record.amountIn} 币` },
        { label: '返还', value: `${record.payout} 币` },
        { label: '净额', value: signedAmountLabel(record.net) },
    ];
    const detail = record.detail;
    switch (detail.kind) {
        case 'deposit':
            rows.push(
                { label: '产品', value: getTavernBankDepositContract(detail.productId).name },
                { label: '方式', value: detail.outcome === 'matured' ? '到期兑付' : '提前支取' },
            );
            break;
        case 'fund':
            rows.push(
                { label: '产品', value: getTavernBankFundContract(detail.productId).name },
                { label: '实现回报', value: tavernBankBpsPercentLabel(detail.resolvedReturnBps) },
            );
            break;
        case 'dice':
            rows.push(
                { label: '你的骰子', value: detail.playerDice.join(' · ') },
                { label: '庄家骰子', value: detail.dealerDice.join(' · ') },
                {
                    label: '终注',
                    value: `${detail.finalBid.by === 'player' ? '你' : '庄家'}叫 ${detail.finalBid.count} 个 ${detail.finalBid.face}`,
                },
                {
                    label: '叫注过程',
                    value: detail.bids.map((bid) => (
                        `${bid.by === 'player' ? '你' : '庄家'} ${bid.count}×${bid.face}`
                    )).join(' → '),
                },
            );
            break;
        case 'push':
            rows.push({ label: '翻开金币', value: `${detail.revealedCoins} 枚` });
            break;
        case 'ladder':
            rows.push({
                label: '完整路线',
                value: detail.steps.map((step) => (
                    `${step.floor}层 ${tavernBankLadderChoiceLabel(step.choice)}${step.success ? ` ${step.amountAfterStep}币` : ' 失守'}`
                )).join(' → '),
            });
            break;
        default:
            break;
    }
    return rows;
}

export function projectTavernBankActivityRow(record: TavernBankActivityRecord): TavernBankActivityRow {
    const net = Number(record.net) || 0;
    return {
        record,
        title: activityTitle(record.detail),
        outcomeLabel: activityOutcomeLabel(record.detail),
        netLabel: `${net > 0 ? '+' : net < 0 ? '-' : ''}${Math.abs(net)}`,
        positive: net > 0,
        negative: net < 0,
        gameWon: activityGameWon(record.detail),
        detailRows: activityEvidenceRows(record),
    };
}

export function projectTavernBankActivityRows(records: readonly TavernBankActivityRecord[]): TavernBankActivityRow[] {
    return records.map(projectTavernBankActivityRow);
}

export interface TavernBankRecordsSummary {
    netTotal: number;
    netTotalLabel: string;
    gameCount: number;
    winCount: number;
    winRatioLabel: string;
}

export function projectTavernBankRecordsSummary(
    rows: readonly TavernBankActivityRow[],
): TavernBankRecordsSummary {
    const netTotal = rows.reduce((sum, row) => sum + (Number(row.record.net) || 0), 0);
    const games = rows.filter((row) => row.gameWon !== null);
    const winCount = games.filter((row) => row.gameWon === true).length;
    return {
        netTotal,
        netTotalLabel: `${netTotal > 0 ? '+' : netTotal < 0 ? '-' : ''}${Math.abs(netTotal)}`,
        gameCount: games.length,
        winCount,
        winRatioLabel: games.length ? `${Math.round((winCount / games.length) * 100)}%` : '--',
    };
}
