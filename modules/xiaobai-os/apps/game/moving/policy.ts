/** Product rules shared by generation, settlement and presentation. */
export const MOVING_POLICY = Object.freeze({
    chapterReward: 50,
    challengeFee: 50,
    challengePrize: 100,
    challengeWinsPerTier: 3,
    challengeMinimumPeak: 6,
    candidateLimit: 8192,
});

/** Ordered difficulty bands; analysis is assigned to the highest matching band. */
export const CHALLENGE_TIERS = [
    { id: 'hard', maxRandomWin: 1e-4, minTrapRatio: .4 },
    { id: 'expert', maxRandomWin: 1e-6, minTrapRatio: .45 },
    { id: 'extreme', maxRandomWin: 1e-7, minTrapRatio: .5 },
] as const;
export type ChallengeTier = typeof CHALLENGE_TIERS[number]['id'];
