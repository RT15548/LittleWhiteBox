import assert from 'node:assert/strict';
import test from 'node:test';

import {
    projectTavernBankActiveLadderTrack,
    projectTavernBankActivityRows,
    projectTavernBankDepositWithdrawalQuote,
    projectTavernBankDiceBidEvidence,
    projectTavernBankPositions,
    projectTavernBankRecordsSummary,
} from '../app-src/features/phone-os/apps/bank/tavern-bank-presentation';
import type {
    TavernBankActivityRecord,
    TavernBankDepositView,
    TavernBankFundView,
    TavernBankLadderGameView,
} from '../shared/bank/bank-types';

const deposit: TavernBankDepositView = {
    id: 'deposit-later',
    productId: 'short-term',
    name: '十回合定期',
    principal: 100,
    startTurn: 0,
    maturityTurn: 10,
    remainingRounds: 0,
    maturityAmount: 106,
    earlyWithdrawalAmount: 97,
};

const fund: TavernBankFundView = {
    id: 'fund-sooner',
    productId: 'steady-fund',
    name: '稳健理财',
    description: '稳健测试份额',
    riskLevel: 'low',
    principal: 200,
    startTurn: 0,
    maturityTurn: 6,
    remainingRounds: 0,
};

test('Bank position projection merges products by maturity and quotes matured deposits at full value', () => {
    assert.deepEqual(projectTavernBankDepositWithdrawalQuote(deposit), {
        matured: true,
        amount: 106,
        amountLabel: '106 币',
        actionLabel: '领取本息',
    });
    const positions = projectTavernBankPositions([deposit], [fund]);
    assert.deepEqual(positions.map((position) => [position.kind, position.id]), [
        ['fund', 'fund-sooner'],
        ['deposit', 'deposit-later'],
    ]);
});

test('Bank record projection keeps settlement evidence and calculates win rate from games only', () => {
    const records: TavernBankActivityRecord[] = [
        {
            sessionId: 'presentation-session',
            id: 'deposit-activity',
            sourceId: 'deposit-source',
            amountIn: 100,
            payout: 106,
            net: 6,
            anchorOrder: 1,
            createdAt: 1,
            detail: { kind: 'deposit', productId: 'short-term', outcome: 'matured' },
        },
        {
            sessionId: 'presentation-session',
            id: 'fund-activity',
            sourceId: 'fund-source',
            amountIn: 200,
            payout: 220,
            net: 20,
            anchorOrder: 2,
            createdAt: 2,
            detail: { kind: 'fund', productId: 'steady-fund', resolvedReturnBps: 1_000 },
        },
        {
            sessionId: 'presentation-session',
            id: 'dice-activity',
            sourceId: 'dice-source',
            amountIn: 10,
            payout: 0,
            net: -10,
            anchorOrder: 3,
            createdAt: 3,
            detail: {
                kind: 'dice',
                result: 'dealer-win',
                challenger: 'dealer',
                finalBid: { by: 'player', count: 10, face: 6 },
                bids: [{ by: 'player', count: 10, face: 6 }],
                playerDice: [1, 2, 3, 4, 5],
                dealerDice: [2, 3, 4, 5, 6],
            },
        },
        {
            sessionId: 'presentation-session',
            id: 'ladder-activity',
            sourceId: 'ladder-source',
            amountIn: 30,
            payout: 60,
            net: 30,
            anchorOrder: 4,
            createdAt: 4,
            detail: {
                kind: 'ladder',
                outcome: 'cashed-out',
                steps: [
                    { floor: 1, choice: 'safe', success: true, amountAfterStep: 36 },
                    { floor: 2, choice: 'risky', success: true, amountAfterStep: 60 },
                ],
            },
        },
    ];
    const rows = projectTavernBankActivityRows(records);
    assert.deepEqual(projectTavernBankRecordsSummary(rows), {
        netTotal: 46,
        netTotalLabel: '+46',
        gameCount: 2,
        winCount: 1,
        winRatioLabel: '50%',
    });
    const diceEvidence = rows[2].detailRows;
    assert.deepEqual(diceEvidence.slice(0, 3), [
        { label: '投入', value: '10 币' },
        { label: '返还', value: '0 币' },
        { label: '净额', value: '-10 币' },
    ]);
    assert.equal(diceEvidence.find((row) => row.label === '你的骰子')?.value, '1 · 2 · 3 · 4 · 5');
    assert.equal(diceEvidence.find((row) => row.label === '终注')?.value, '你叫 10 个 6');
    assert.equal(rows[3].detailRows.find((row) => row.label === '完整路线')?.value, '1层 稳健 36币 → 2层 搏命 60币');
});

test('Bank game projections expose dice evidence and all five active ladder floors', () => {
    assert.deepEqual(projectTavernBankDiceBidEvidence({
        playerDice: [1, 2, 2, 4, 6],
        count: 5,
        face: 2,
    }), {
        knownMatches: 3,
        dealerMinimum: 2,
    });
    const game: TavernBankLadderGameView = {
        kind: 'ladder',
        id: 'ladder-active',
        bet: 30,
        completedFloors: 2,
        cashoutAmount: 48,
        canCashOut: true,
        history: [
            { floor: 1, choice: 'safe', amountAfterSuccess: 36 },
            { floor: 2, choice: 'medium', amountAfterSuccess: 48 },
        ],
        nextChoices: [],
    };
    assert.deepEqual(projectTavernBankActiveLadderTrack(game), [
        { floor: 1, status: 'completed', choiceLabel: '稳健', amount: 36 },
        { floor: 2, status: 'completed', choiceLabel: '进取', amount: 48 },
        { floor: 3, status: 'current', choiceLabel: '', amount: null },
        { floor: 4, status: 'upcoming', choiceLabel: '', amount: null },
        { floor: 5, status: 'upcoming', choiceLabel: '', amount: null },
    ]);
});
