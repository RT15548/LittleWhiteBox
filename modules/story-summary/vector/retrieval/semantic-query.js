/**
 * Build the two semantic-ranking inputs owned by one recall run.
 *
 * Event rerank needs the bounded three-message text plus the current USER text
 * for its separate exact-time rule. Direct L1 needs that same full text and
 * the final weighted dense-retrieval vector.
 */
export function buildSemanticRecallInputs(bundle, queryVector) {
    const query = String(bundle?.rerankQuery || '').trim();
    return {
        eventRerank: {
            query,
            temporalQuery: String(bundle?.focusQuery || '').trim(),
        },
        directEvidence: {
            query,
            queryVector,
        },
    };
}
