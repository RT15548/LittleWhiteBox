export const AGENT_POLICY = {
    inputTokens: 24000, outputTokens: 4000, rounds: 12, callsPerRound: 16,
    recentCharacters: 10000, pageSize: 20, chunkCharacters: 1500, recallHits: 6, embedBatch: 24,
    observationCharacters: 18000, statementPreviewCharacters: 240,
    queryCharacters: 1000, questionCharacters: 1000,
} as const;
