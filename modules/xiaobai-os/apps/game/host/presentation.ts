import type { GameServiceView } from '../application/service.js';
import type { GamePublicActivityRecord, GamePublicGameView } from '../../../domains/game/types.js';
import type {
    GameActiveGameView,
    GameClientState,
    GameClientStatus,
    GameRecordDetailView,
    GameRecordPageView,
    GameRecordView,
} from '../types.js';

import { gameInfo } from '../catalog.js';

const OUTCOME_LABELS: Readonly<Record<string, string>> = Object.freeze({
    'player-win': '你赢了',
    'dealer-win': '对方赢了',
    'cashed-out': '收手离桌',
    busted: '翻到了炸弹',
    cleared: '全部拿下',
    failed: '这一步没过',
    capped: '满载而归',
});

function resolveStatus(
    view: GameServiceView,
    economyReady: boolean,
): { status: GameClientStatus; message: string } {
    if (view.writeState === 'loading') {
        return { status: 'loading', message: '' };
    }
    if (view.writeState === 'conflict') {
        return { status: 'conflict', message: '服务器上的游戏记录与当前内容不同，请重新打开酒馆后继续。' };
    }
    if (view.writeState === 'unconfirmed') {
        return { status: 'unconfirmed', message: '还不确定上一局是否保存成功，检查保存后才能继续玩。' };
    }
    if (view.writeState === 'saving') {
        return { status: 'saving', message: '正在保存这一局，请稍候…' };
    }
    if (view.writeState === 'failed' && view.pendingCommit) {
        return { status: 'save-failed', message: '本局结果尚未保存。请重试保存后再继续游戏。' };
    }
    if (view.writeState === 'failed') {
        return { status: 'blocked', message: '游戏数据暂时无法读取，请稍后重试。' };
    }
    if (!economyReady) {
        return { status: 'blocked', message: '钱包还未开通，请重新加载。' };
    }
    return { status: 'ready', message: '' };
}

function presentActiveGame(game: GamePublicGameView | undefined): GameActiveGameView | null {
    if (!game) {return null;}
    if (game.kind === 'dice') {
        return {
            kind: 'dice',
            id: game.id,
            bet: game.bet,
            playerDice: [...game.playerDice],
            bids: game.bids.map((bid) => ({ count: bid.count, face: bid.face, by: bid.by })),
            legalActions: [...game.legalActions],
            legalBids: game.legalBids.map((bid) => ({ count: bid.count, face: bid.face })),
        };
    }
    if (game.kind === 'push') {
        return {
            kind: 'push',
            id: game.id,
            bet: game.bet,
            revealedCoins: game.revealedCoins,
            cashoutAmount: game.cashoutAmount,
            remainingCards: game.remainingCards,
            remainingBombs: game.remainingBombs,
            nextBombProbabilityBps: game.nextBombProbabilityBps,
            legalActions: [...game.legalActions],
        };
    }
    return {
        kind: 'ladder',
        id: game.id,
        bet: game.bet,
        riskBase: game.riskBase,
        completedFloors: game.completedFloors,
        cashoutAmount: game.cashoutAmount,
        canCashOut: game.canCashOut,
        steps: game.steps.map((step) => ({
            floor: step.floor,
            choice: step.choice,
            amountAfterSuccess: step.amountAfterSuccess,
        })),
        nextChoices: game.nextChoices.map((choice) => ({
            choice: choice.choice,
            successProbabilityBps: choice.successProbabilityBps,
            successAmount: choice.successAmount,
        })),
        legalActions: [...game.legalActions],
    };
}

function presentRecordDetail(record: GamePublicActivityRecord): GameRecordDetailView {
    const detail = record.detail;
    if (detail.kind === 'dice') {
        return {
            kind: 'dice',
            challenger: detail.challenger,
            finalBid: {
                count: detail.finalBid.count,
                face: detail.finalBid.face,
                by: detail.finalBid.by,
            },
            bids: detail.bids.map((bid) => ({ count: bid.count, face: bid.face, by: bid.by })),
            playerDice: [...detail.playerDice],
            dealerDice: [...detail.dealerDice],
            matchingDiceCount: detail.matchingDiceCount,
        };
    }
    if (detail.kind === 'push') {
        return { kind: 'push', revealedCoins: detail.revealedCoins };
    }
    return {
        kind: 'ladder',
        steps: detail.steps.map((step) => ({
            floor: step.floor,
            choice: step.choice,
            success: step.success,
            amountAfterStep: step.amountAfterStep,
        })),
    };
}

function presentRecord(record: GamePublicActivityRecord): GameRecordView {
    const game = record.detail.kind;
    return {
        id: record.id,
        gameId: record.sourceId,
        game,
        gameLabel: gameInfo(game).name,
        outcome: record.detail.outcome,
        outcomeLabel: OUTCOME_LABELS[record.detail.outcome] || record.detail.outcome,
        outcomeTone: record.net > 0 ? 'win' : record.net < 0 ? 'loss' : 'neutral',
        amountIn: record.amountIn,
        payout: record.payout,
        net: record.net,
        createdAt: record.createdAt,
        detail: presentRecordDetail(record),
    };
}

export function presentGameRecords(view: GameServiceView): GameRecordPageView {
    return {
        records: view.activities.map(presentRecord),
        offset: view.activityPage.offset,
        total: view.activityPage.total,
        hasMore: view.activityPage.hasMore,
    };
}

export function presentGameState({
    chatIdentity,
    serviceView,
    economyReady,
    generationActive,
}: {
    chatIdentity: string;
    serviceView: GameServiceView;
    economyReady: boolean;
    generationActive: boolean;
}): GameClientState {
    return {
        chatIdentity,
        currency: '小白币',
        balance: serviceView.balance,
        lockedAmount: serviceView.lockedAmount,
        revision: serviceView.revision,
        eventId: serviceView.eventId,
        ...resolveStatus(serviceView, economyReady),
        generationActive,
        activeGame: presentActiveGame(serviceView.activeGame),
        ...presentGameRecords(serviceView),
    };
}
