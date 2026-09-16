/**
 * Build the semantic inputs owned by one recall run.
 *
 * Event rerank needs the bounded three-message text plus the current USER text
 * for its separate exact-time rule. Local L1 selection uses the final weighted
 * dense-retrieval vector, not another text-rerank request.
 */
export function buildSemanticRecallInputs(bundle, queryVector) {
    const query = String(bundle?.rerankQuery || '').trim();
    return {
        eventRerank: {
            query,
            temporalQuery: String(bundle?.focusQuery || '').trim(),
        },
        directEvidence: {
            queryVector,
        },
    };
}
