// Session-owned checkpoints. Only the most recent successful summary is model context.
export function currentHistorySummary(state) {
    return state.compactions?.findLast(record => record.summary)?.summary || '';
}

// Messages record which checkpoints already existed when they were appended.
// This preserves marker order through pruning, editing and reloading without storing old tool bodies.
export function compactionPosition(state) {
    const count = state.compactions?.length || 0;
    return count ? { compactionEpoch: count } : {};
}

export function isTimelineCompaction(record) {
    return record.before !== undefined || !!record.error || !!record.skipped;
}

// Messages before this user predate every marker we remove, so their epochs stay valid.
export function rewindUserTurn(state, userIndex, keepUser) {
    const epoch = state.messages[userIndex].compactionEpoch || 0;
    const records = state.compactions || [];
    const compactions = records.slice(0, epoch);
    let priorSummary = '', archivedSkillIds = state.archivedSkillIds;
    for (const record of records.slice(epoch)) {
        if (record.turnStart) {
            priorSummary = record.turnStart.summary || priorSummary;
            archivedSkillIds = record.turnStart.archivedSkillIds;
            break;
        }
        if (record.summary) priorSummary = record.summary;
    }
    if (priorSummary) compactions.push({ summary: priorSummary });
    return { messages: state.messages.slice(0, userIndex + Number(keepUser)), compactions, archivedSkillIds };
}

export function restoreCompactions(session) {
    // Released sessions stored just the latest summary, without a timeline position or token counts.
    return session?.compactions ?? (session?.historySummary ? [{ summary: session.historySummary }] : []);
}
