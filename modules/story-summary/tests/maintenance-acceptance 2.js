// The real-model check records behavior; semantic judgments remain a separate human review.
export function protocolReport(turns) {
    const rejectedTurns = turns.filter(turn => turn.tools.some(({ response }) => ['error', 'needs_fix'].includes(response?.status))).length;
    return { turns: turns.length, rejectedTurns, savedEdits: turns.flatMap(turn => turn.tools)
        .filter(({ response }) => response?.status === 'saved').reduce((sum, { response }) => sum + response.changed, 0) };
}

/** What happened to each planted case; judging whether it is right stays with the reader. */
export function caseReport(cases, session) {
    const events = session.memory.json.events || [];
    const outcome = key => ({ key,
        operations: session.operations.filter(operation => operation.changes.some(change => change.key === key))
            .map(({ kind }) => ({ kind })) });
    return {
        summaryErrors: cases.summaryErrors.map(outcome),
        anchorErrors: cases.anchorErrors.map(outcome),
        correctControls: cases.correctControls.map(outcome),
        eventJoin: { remaining: cases.eventJoin.filter(key => events.some(event => event.id === key)) },
        causalRedirect: { key: cases.causalRedirect, causedBy: events.find(event => event.id === cases.causalRedirect)?.causedBy ?? null },
    };
}
