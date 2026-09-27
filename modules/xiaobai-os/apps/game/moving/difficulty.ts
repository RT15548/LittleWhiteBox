import { CHALLENGE_TIERS, MOVING_POLICY, type ChallengeTier } from './policy.js';
import type { analyzePuzzle } from './puzzle.js';

/** Algorithmic screening, not a prediction of human win rate. Bands do not overlap. */
export function classifyChallenge(analysis: ReturnType<typeof analyzePuzzle>): ChallengeTier | null {
    if (!analysis.solvable || analysis.minimumPeak < MOVING_POLICY.challengeMinimumPeak) { return null; }
    const trapRatio = analysis.losingBranches / analysis.branches;
    for (let index = CHALLENGE_TIERS.length - 1; index >= 0; index--) {
        const tier = CHALLENGE_TIERS[index];
        if (analysis.randomWinProbability <= tier.maxRandomWin && trapRatio >= tier.minTrapRatio) { return tier.id; }
    }
    return null;
}

export function challengeProgressForWins(wins: number) {
    const index = Math.min(Math.floor(wins / MOVING_POLICY.challengeWinsPerTier), CHALLENGE_TIERS.length - 1);
    const nextTier = CHALLENGE_TIERS[index + 1]?.id ?? null;
    return { wins, tier: CHALLENGE_TIERS[index].id, nextTier,
        winsToNext: nextTier ? (index + 1) * MOVING_POLICY.challengeWinsPerTier - wins : 0 };
}
