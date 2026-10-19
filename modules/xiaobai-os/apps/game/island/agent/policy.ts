export const AGENT_POLICY = {
    inputTokens: 158_000, contextRefreshTokens: 128_000, outputTokens: 4_000, rounds: 12, callsPerRound: 16,
    recentCharacters: 10_000, pageSize: 20, chunkCharacters: 1_500, recallHits: 6, embedBatch: 24,
    observationCharacters: 18_000, statementPreviewCharacters: 240,
    queryCharacters: 1_000, questionCharacters: 1_000,
} as const;
