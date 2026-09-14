import type { BankServiceView } from '../application/service.js';
import type {
    BankActivityPageView,
    BankActivityView,
    BankClientState,
    BankClientStatus,
    BankFundPositionView,
    BankRiskView,
} from '../types.js';

const RISK_LABELS: Readonly<Record<BankRiskView, string>> = Object.freeze({
    low: '低风险',
    medium: '中风险',
    high: '高风险',
});

const STATUS_LABELS: Readonly<Record<BankClientStatus, string>> = Object.freeze({
    ready: '正常',
    saving: '正在保存',
    unconfirmed: '需要检查保存',
    conflict: '存档有变化',
    loading: '正在加载',
    blocked: '暂时不可用',
});

function bpsLabel(value: number): string {
    const percent = value / 100;
    return `${value >= 0 ? '+' : ''}${Number.isInteger(percent) ? percent : percent.toFixed(2)}%`;
}

function amountRangeLabel(minimum: number, maximum: number): string {
    return `${minimum.toLocaleString('zh-CN')} - ${maximum.toLocaleString('zh-CN')} 小白币`;
}

function status(
    view: BankServiceView,
): { status: BankClientStatus; statusLabel: string; message: string } {
    let next: BankClientStatus = 'ready';
    let message = '';
    if (view.writeState === 'loading') {
        next = 'loading';
    } else if (view.writeState === 'failed') {
        next = 'blocked';
        message = '银行数据暂时无法读取，请稍后重试。';
    } else if (view.writeState === 'conflict') {
        next = 'conflict';
        message = '服务器上的银行记录与当前内容不同，请刷新酒馆后再继续。';
    } else if (view.writeState === 'unconfirmed') {
        next = 'unconfirmed';
        message = '还不确定上次是否保存成功，暂时不能交易。请先检查保存。';
    } else if (view.writeState === 'saving') {
        next = 'saving';
        message = '正在保存银行记录和账目…';
    }
    return { status: next, statusLabel: STATUS_LABELS[next], message };
}

function activityView(
    activity: BankServiceView['activities'][number],
    view: BankServiceView,
): BankActivityView {
    const detail = activity.detail;
    const products = detail.kind === 'deposit' ? view.products.deposits : view.products.funds;
    const productName = products.find((product) => product.id === detail.productId)?.name || detail.productId;
    const resultLabel = detail.kind === 'deposit'
        ? detail.outcome === 'matured' ? '到期兑付' : '提前支取'
        : `到期收益 ${bpsLabel(detail.resolvedReturnBps)}`;
    return {
        id: activity.id,
        kind: detail.kind,
        kindLabel: detail.kind === 'deposit' ? '定期存单' : '浮动理财',
        productName,
        resultLabel,
        amountIn: activity.amountIn,
        payout: activity.payout,
        net: activity.net,
        netLabel: activity.net === 0 ? '持平' : `${activity.net > 0 ? '收益' : '损失'} ${Math.abs(activity.net)} 小白币`,
        assistantTurn: activity.assistantTurn,
        turnLabel: `第 ${activity.assistantTurn} 回合`,
        createdAt: activity.createdAt,
    };
}

export function presentBankActivityPage(view: BankServiceView): BankActivityPageView {
    return {
        activities: view.activities.map((activity) => activityView(activity, view)),
        activityPage: {
            offset: view.activityPage.offset,
            limit: view.activityPage.limit,
            total: view.activityPage.total,
            hasMore: view.activityPage.hasMore,
        },
    };
}

export function presentBankState({
    chatIdentity,
    serviceView,
    generationActive,
}: {
    chatIdentity: string;
    serviceView: BankServiceView;
    generationActive: boolean;
}): BankClientState {
    const deposits = serviceView.deposits.map((position) => ({
        id: position.id,
        productId: position.productId,
        name: position.name,
        principal: position.principal,
        remainingTurns: position.remainingTurns,
        maturityAmount: position.maturityAmount,
        earlyWithdrawalAmount: position.earlyWithdrawalAmount,
        claimable: position.claimable,
        status: position.claimable ? 'claimable' as const : 'locked' as const,
        statusLabel: position.claimable ? '可领取' : `剩余 ${position.remainingTurns} 回合`,
    }));
    const investments = serviceView.investments.map((position): BankFundPositionView => {
        const base = {
            id: position.id,
            productId: position.productId,
            name: position.name,
            description: position.description,
            riskLevel: position.riskLevel,
            riskLabel: RISK_LABELS[position.riskLevel],
            principal: position.principal,
            remainingTurns: position.remainingTurns,
        };
        if (!position.claimable) {
            return { ...base, claimable: false, status: 'locked', statusLabel: `剩余 ${position.remainingTurns} 回合` };
        }
        return {
            ...base,
            claimable: true,
            status: 'claimable',
            statusLabel: '可领取',
            resolvedReturnBps: position.resolvedReturnBps,
            returnLabel: bpsLabel(position.resolvedReturnBps),
            settlementAmount: position.settlementAmount,
        };
    });
    return {
        chatIdentity,
        currency: '小白币',
        balance: serviceView.balance,
        lockedAmount: serviceView.lockedAmount,
        currentTurn: serviceView.currentTurn,
        revision: serviceView.revision,
        eventId: serviceView.eventId,
        ...status(serviceView),
        generationActive,
        claimableCount: deposits.filter((position) => position.claimable).length
            + investments.filter((position) => position.claimable).length,
        products: {
            deposits: serviceView.products.deposits.map((product) => ({
                id: product.id,
                name: product.name,
                lockRounds: product.lockRounds,
                lockLabel: `${product.lockRounds} 次主剧情回复`,
                interestBps: product.interestBps,
                interestLabel: bpsLabel(product.interestBps),
                earlyPenaltyBps: product.earlyPenaltyBps,
                earlyPenaltyLabel: bpsLabel(-product.earlyPenaltyBps),
                minAmount: product.minAmount,
                maxAmount: product.maxAmount,
                amountLabel: amountRangeLabel(product.minAmount, product.maxAmount),
            })),
            funds: serviceView.products.funds.map((product) => ({
                id: product.id,
                name: product.name,
                description: product.description,
                lockRounds: product.lockRounds,
                lockLabel: `${product.lockRounds} 次主剧情回复`,
                returnMinBps: product.returnRangeBps.min,
                returnMaxBps: product.returnRangeBps.max,
                returnLabel: `${bpsLabel(product.returnRangeBps.min)} 至 ${bpsLabel(product.returnRangeBps.max)}`,
                riskLevel: product.riskLevel,
                riskLabel: RISK_LABELS[product.riskLevel],
                minAmount: product.minAmount,
                maxAmount: product.maxAmount,
                amountLabel: amountRangeLabel(product.minAmount, product.maxAmount),
            })),
        },
        deposits,
        investments,
        ...presentBankActivityPage(serviceView),
    };
}
