import assert from 'node:assert/strict';
import test from 'node:test';

import {
    GAME_MAX_PAYOUT,
    gameAmountAtBps,
    multiplyGameAmount,
} from '../domains/game/money.js';
import {
    createGameRandomSource,
    createGameSequenceRandom,
    nextGameRandomInt,
    rollGameDie,
    shuffleGameValues,
} from '../domains/game/random.js';
import {
    advanceGameDiceGame,
    gameBinomialAtLeastProbability,
    challengeGameDiceGame,
    countGameDiceBidMatches,
    countGameDiceMatches,
    createGameDiceGame,
    createGameDiceGameView,
    getGameDiceBidProbabilityForDealer,
    getGameDiceDealerResponsePolicy,
    getGameDiceOpponentBidCredibility,
    isGameDiceBidHigher,
    listGameLegalDiceBids,
    respondToGameDicePlayerBid,
} from '../domains/game/games/dice-bluff.js';
import {
    cashOutGamePushGame,
    createGamePushGame,
    createGamePushGameView,
    drawGamePushCard,
} from '../domains/game/games/push-your-luck.js';
import {
    GAME_LADDER_MAX_FLOORS,
    calculateGameLadderRiskBase,
    calculateGameLadderSuccessAmount,
    cashOutGameLadderGame,
    createGameLadderGame,
    createGameLadderGameView,
    listGameLadderOptions,
    stepGameLadderGame,
} from '../domains/game/games/risk-ladder.js';

function trackedRandom(values, options = {}) {
    const sequence = [...values];
    const bounds = [];
    let cursor = 0;
    return {
        bounds,
        source: createGameRandomSource((maxExclusive) => {
            bounds.push(maxExclusive);
            if (sequence.length === 0 || (!options.repeat && cursor >= sequence.length)) {
                throw new Error('unexpected random draw');
            }
            const value = sequence[cursor % sequence.length];
            cursor += 1;
            return value;
        }),
    };
}

function diceGame(overrides = {}) {
    return {
        id: 'dice-1',
        bet: 50,
        playerDice: [2, 2, 3, 4, 5],
        dealerDice: [2, 3, 4, 5, 6],
        bids: [],
        ...overrides,
    };
}

function pushGame(deck) {
    return {
        id: 'push-1',
        bet: 50,
        deck,
        drawIndex: 0,
        revealedCoins: 0,
        cashoutAmount: 0,
    };
}

test('game money and random boundaries reject unsafe values', () => {
    assert.equal(GAME_MAX_PAYOUT, 50_000);
    assert.equal(gameAmountAtBps(101, 600), 107);
    assert.equal(multiplyGameAmount(101, 5, 4), 126);
    assert.throws(() => multiplyGameAmount(30_000, 2, 1), /game_amount_overflow/);
    assert.throws(() => gameAmountAtBps('100', 600), /game_amount_invalid/);

    let calls = 0;
    const invalid = createGameRandomSource(() => {
        calls += 1;
        return 2;
    });
    assert.throws(() => nextGameRandomInt(invalid, 2), /game_random_invalid/);
    assert.throws(() => nextGameRandomInt(invalid, 0), /game_random_invalid/);
    assert.equal(calls, 1);
    const sequence = createGameSequenceRandom([0, 5, 2]);
    assert.deepEqual([rollGameDie(sequence), rollGameDie(sequence), rollGameDie(sequence)], [1, 6, 3]);
    assert.throws(() => rollGameDie(sequence), /game_random_exhausted/);
    assert.deepEqual(shuffleGameValues(['a', 'b', 'c'], createGameSequenceRandom([0, 0])), ['b', 'c', 'a']);
});

test('dice creation consumes ten draws only after validating the bet', () => {
    const random = trackedRandom([0, 1, 2, 3, 4, 5, 0, 1, 2, 3]);
    const game = createGameDiceGame({ id: 'dice-start', bet: 50 }, random.source);
    assert.deepEqual(game.playerDice, [1, 2, 3, 4, 5]);
    assert.deepEqual(game.dealerDice, [6, 1, 2, 3, 4]);
    assert.deepEqual(random.bounds, Array(10).fill(6));

    const untouched = trackedRandom([0]);
    assert.throws(() => createGameDiceGame({ id: 'bad', bet: 51 }, untouched.source), /game_amount_out_of_range/);
    assert.deepEqual(untouched.bounds, []);
});

test('dice wildcards, bid ordering, and dealer probability preserve the game contract', () => {
    const game = diceGame({
        playerDice: [1, 3, 3, 4, 5],
        dealerDice: [1, 3, 2, 2, 6],
    });
    assert.equal(countGameDiceMatches(game.playerDice, 3), 3);
    assert.equal(countGameDiceBidMatches(game, { face: 3 }), 5);
    assert.equal(isGameDiceBidHigher({ count: 2, face: 2 }, { count: 1, face: 6 }), true);
    assert.deepEqual(listGameLegalDiceBids({ count: 1, face: 5 }).slice(0, 2), [
        { count: 1, face: 6 },
        { count: 2, face: 2 },
    ]);
    assert.equal(gameBinomialAtLeastProbability(5, 1 / 3, 0), 1);
    assert.equal(getGameDiceBidProbabilityForDealer([3, 3, 3, 3, 3], { count: 1, face: 3 }), 1);
});

test('dice dealer raises on its own faces instead of the cheapest legal bid', () => {
    // Holding five 3s, the dealer must press with its own face rather than
    // announce a 4 it does not hold at all.
    const raise = getGameDiceDealerResponsePolicy([3, 3, 3, 3, 3], { count: 1, face: 3 });
    assert.deepEqual(raise, { kind: 'raise', dealerBid: { count: 2, face: 3 } });

    // Wildcards count toward the dealer's own face when it picks the raise.
    assert.deepEqual(getGameDiceDealerResponsePolicy([1, 1, 6, 6, 6], { count: 4, face: 6 }), {
        kind: 'raise', dealerBid: { count: 5, face: 6 },
    });

    // The choice is driven by the hidden hand, so the same player bid draws
    // different faces from different dealer hands.
    const fromThrees = getGameDiceDealerResponsePolicy([3, 3, 3, 3, 3], { count: 2, face: 6 });
    const fromTwos = getGameDiceDealerResponsePolicy([2, 2, 3, 4, 5], { count: 2, face: 6 });
    assert.notDeepEqual(fromThrees.dealerBid, fromTwos.dealerBid);
});

test('dice dealer does not challenge bids the player is guaranteed to hold', () => {
    // A player holding three 6s bids {3,6}. The dealer holds no 6 at all, so a
    // model that assumes the player bids at random rates this at 21% and
    // challenges - and loses every time, because the bid cannot fail.
    const dealerDice = [2, 2, 3, 4, 5];
    const playerBid = { count: 3, face: 6 };
    assert.ok(getGameDiceBidProbabilityForDealer(dealerDice, playerBid) < 0.25);
    assert.ok(getGameDiceOpponentBidCredibility(dealerDice, playerBid) > 0.4);
    assert.notEqual(getGameDiceDealerResponsePolicy(dealerDice, playerBid).kind, 'challenge');

    // Crediting part of the count to the bidder never exceeds their five dice.
    assert.equal(getGameDiceOpponentBidCredibility(dealerDice, { count: 10, face: 6 }), 0);
});

test('dice dealer weighs challenging against the raise it would have to make', () => {
    // Credibility alone (0.33) would not trigger a challenge here; the dealer
    // challenges because every raise left to it is worth almost nothing.
    const dealerDice = [2, 3, 4, 5, 6];
    const playerBid = { count: 6, face: 2 };
    assert.ok(getGameDiceOpponentBidCredibility(dealerDice, playerBid) > 0.3);
    assert.deepEqual(getGameDiceDealerResponsePolicy(dealerDice, playerBid), { kind: 'challenge' });

    // With no legal raise at all the dealer can only challenge.
    assert.deepEqual(getGameDiceDealerResponsePolicy(dealerDice, { count: 10, face: 6 }), {
        kind: 'challenge',
    });
});

test('dice dealer settles or raises with only the required random draw', () => {
    const raiseRandom = trackedRandom([]);
    const raised = respondToGameDicePlayerBid(
        diceGame({ dealerDice: [3, 3, 3, 3, 3] }),
        { count: 1, face: 3 },
        raiseRandom.source,
    );
    assert.equal(raised.kind, 'continued');
    assert.deepEqual(raiseRandom.bounds, []);

    const challengeRandom = trackedRandom([]);
    const challenged = respondToGameDicePlayerBid(
        diceGame({ dealerDice: [2, 2, 3, 4, 5] }),
        { count: 5, face: 6 },
        challengeRandom.source,
    );
    assert.equal(challenged.kind, 'settled');
    assert.deepEqual(getGameDiceDealerResponsePolicy([2, 2, 3, 4, 5], { count: 5, face: 6 }), {
        kind: 'challenge',
    });
    assert.deepEqual(challengeRandom.bounds, []);

    // Only a genuine coin-flip spot consumes randomness.
    const middleRandom = trackedRandom([1]);
    const middle = respondToGameDicePlayerBid(
        diceGame({ dealerDice: [2, 2, 3, 4, 5] }),
        { count: 3, face: 6 },
        middleRandom.source,
    );
    assert.equal(getGameDiceDealerResponsePolicy([2, 2, 3, 4, 5], { count: 3, face: 6 }).kind, 'random');
    assert.equal(middle.kind, 'continued');
    assert.deepEqual(middleRandom.bounds, [2]);
});

test('dice challenges settle both sides and reject illegal actions before randomness', () => {
    const playerWin = challengeGameDiceGame(diceGame({
        playerDice: [2, 2, 2, 2, 2],
        dealerDice: [3, 3, 3, 3, 3],
        bids: [
            { by: 'player', count: 9, face: 6 },
            { by: 'dealer', count: 10, face: 6 },
        ],
    }));
    assert.equal(playerWin.outcome, 'player-win');
    assert.equal(playerWin.payout, 90);
    assert.throws(
        () => advanceGameDiceGame(diceGame(), { kind: 'challenge' }, trackedRandom([]).source),
        /game_dice_challenge_invalid/,
    );

    const illegalRandom = trackedRandom([1]);
    assert.throws(() => respondToGameDicePlayerBid(diceGame({
        bids: [
            { by: 'player', count: 1, face: 2 },
            { by: 'dealer', count: 2, face: 2 },
        ],
    }), { count: 2, face: 2 }, illegalRandom.source), /game_dice_bid_not_higher/);
    assert.deepEqual(illegalRandom.bounds, []);
});

test('dice public views are independent and never expose dealer dice', () => {
    const game = diceGame({ dealerDice: [6, 6, 6, 6, 6] });
    const original = structuredClone(game);
    const view = createGameDiceGameView(game);
    assert.equal(Object.hasOwn(view, 'dealerDice'), false);
    assert.equal(JSON.stringify(view).includes('dealerDice'), false);
    view.playerDice[0] = 5;
    view.legalBids[0].count = 9;
    assert.deepEqual(game, original);
});

test('push persists one shuffled deck, advances coins, and settles bombs or cashout', () => {
    const shuffledRandom = trackedRandom(Array(9).fill(0));
    const shuffled = createGamePushGame({ id: 'push-shuffled' }, shuffledRandom.source);
    assert.deepEqual(shuffledRandom.bounds, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
    assert.equal(shuffled.deck.filter(card => card === 'coin').length, 7);
    assert.equal(shuffled.deck.filter(card => card === 'bomb').length, 3);

    const game = pushGame(['coin', 'bomb', 'coin', 'coin', 'coin', 'coin', 'coin', 'coin', 'bomb', 'bomb']);
    assert.throws(() => cashOutGamePushGame(game), /game_push_cashout_invalid/);
    const coin = drawGamePushCard(game);
    assert.equal(coin.kind, 'continued');
    if (coin.kind !== 'continued') {assert.fail('first card should continue');}
    assert.equal(coin.game.cashoutAmount, 50);
    assert.deepEqual(cashOutGamePushGame(coin.game), {
        gameId: 'push-1', outcome: 'cashed-out', payout: 50, revealedCoins: 1,
    });
    assert.deepEqual(drawGamePushCard(coin.game), {
        kind: 'settled',
        settlement: { gameId: 'push-1', outcome: 'busted', payout: 0, revealedCoins: 1 },
    });
});

test('push public view exposes exact risk without deck references', () => {
    const game = pushGame(['coin', 'bomb', 'coin', 'coin', 'coin', 'coin', 'coin', 'coin', 'bomb', 'bomb']);
    const coin = drawGamePushCard(game);
    if (coin.kind !== 'continued') {assert.fail('first card should continue');}
    const original = structuredClone(coin.game);
    const view = createGamePushGameView(coin.game);
    assert.equal(view.nextBombProbabilityBps, 3_333);
    assert.equal(Object.hasOwn(view, 'deck'), false);
    assert.equal(JSON.stringify(view).includes('deck'), false);
    view.legalActions[0] = 'cash-out';
    assert.deepEqual(coin.game, original);
});

test('ladder uses exact multipliers and records terminal failed attempts', () => {
    assert.deepEqual(listGameLadderOptions().map(option => [option.choice, option.successProbabilityBps]), [
        ['safe', 8_000],
        ['medium', 5_500],
        ['risky', 3_000],
    ]);
    assert.equal(calculateGameLadderRiskBase(30), 27);
    assert.equal(calculateGameLadderSuccessAmount(27, 'safe'), 33);
    assert.equal(calculateGameLadderSuccessAmount(49_000, 'risky'), GAME_MAX_PAYOUT);

    const game = createGameLadderGame({ id: 'ladder-history', bet: 30 });
    assert.throws(() => cashOutGameLadderGame(game), /game_ladder_cashout_invalid/);
    const first = stepGameLadderGame(game, 'safe', createGameSequenceRandom([7_999]));
    if (first.kind !== 'continued') {assert.fail('first step should continue');}
    const failed = stepGameLadderGame(first.game, 'medium', createGameSequenceRandom([5_500]));
    assert.deepEqual(failed, {
        kind: 'settled',
        settlement: {
            gameId: 'ladder-history',
            outcome: 'failed',
            payout: 0,
            steps: [
                { floor: 1, choice: 'safe', success: true, amountAfterStep: 33 },
                { floor: 2, choice: 'medium', success: false, amountAfterStep: 0 },
            ],
        },
    });
});

test('ladder settles at floor five or payout cap and public views are deep copies', () => {
    const random = trackedRandom([0], { repeat: true });
    let game = createGameLadderGame({ id: 'ladder-clear', bet: 30 });
    for (let floor = 1; floor < GAME_LADDER_MAX_FLOORS; floor += 1) {
        const transition = stepGameLadderGame(game, 'safe', random.source);
        if (transition.kind !== 'continued') {assert.fail(`settled at floor ${floor}`);}
        game = transition.game;
    }
    const cleared = stepGameLadderGame(game, 'safe', random.source);
    assert.equal(cleared.kind, 'settled');
    assert.equal(cleared.settlement.outcome, 'cleared');

    const viewGame = stepGameLadderGame(
        createGameLadderGame({ id: 'ladder-view', bet: 30 }),
        'safe',
        createGameSequenceRandom([0]),
    );
    if (viewGame.kind !== 'continued') {assert.fail('first step should continue');}
    const original = structuredClone(viewGame.game);
    const view = createGameLadderGameView(viewGame.game);
    assert.equal(view.cashoutAmount, 33);
    view.steps[0].amountAfterSuccess = 999;
    assert.deepEqual(viewGame.game, original);
});
