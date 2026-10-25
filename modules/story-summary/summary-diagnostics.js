import { summaryFailureReason } from './summary-failure.js';

export const SUMMARY_DIAGNOSTIC_LIMIT = 30;
export const SUMMARY_DIAGNOSTIC_REASON_CHARS = 2000;

/** Page-lifetime evidence, independent of the dismissible UI status. */
export function createSummaryDiagnostics() {
    let records = [], sequence = 0, startedAt = Date.now(), evicted = false;
    const failure = error => {
        const reason = summaryFailureReason(error);
        return { reason: reason.slice(0, SUMMARY_DIAGNOSTIC_REASON_CHARS), reasonTruncated: reason.length > SUMMARY_DIAGNOSTIC_REASON_CHARS };
    };
    return {
        startRun(identity, automatic) {
            return { id: ++sequence, identity, automatic, attempt: 0 };
        },
        begin(run) {
            const record = { id: ++sequence, runId: run.id, automatic: run.automatic, attempt: ++run.attempt,
                startedAt: Date.now(), endedAt: null, stage: 'preparation', range: null,
                outcome: 'running', saveState: 'not_started' };
            records.push({ identity: run.identity, record });
            if (records.length > SUMMARY_DIAGNOSTIC_LIMIT) { records.shift(); evicted = true; }
            return record.id;
        },
        progress(id, { stage, range }) {
            const record = records.find(entry => entry.record.id === id)?.record;
            if (!record || record.endedAt !== null) return;
            record.stage = stage;
            if (range) record.range = { from: range.from, to: range.to };
            if (stage === 'saving') record.saveState = 'unconfirmed';
            if (stage === 'followup') record.saveState = 'confirmed';
        },
        finish(id, result) {
            const record = records.find(entry => entry.record.id === id)?.record;
            if (!record) return;
            record.endedAt = Date.now();
            record.outcome = result.cancelled ? 'cancelled' : result.stale ? 'stale'
                : result.noContent ? 'no_content' : result.success ? 'completed' : 'failed';
            if (result.committed) record.saveState = 'confirmed';
            else if (result.error?.uncertain) record.saveState = 'unconfirmed';
            else if (record.saveState === 'unconfirmed') record.saveState = 'not_saved';
            if (result.error) Object.assign(record, failure(result.error));
            if (result.followupError) {
                record.outcome = 'followup_failed';
                Object.assign(record, failure(result.followupError));
            }
        },
        read(identity, { offset = 0, limit = 10 } = {}) {
            const matching = records.filter(entry => entry.identity === identity).map(entry => entry.record).reverse();
            return { scope: 'page_session', startedAt, retentionLimit: SUMMARY_DIAGNOSTIC_LIMIT,
                historyMayBeTruncated: evicted, total: matching.length,
                next: offset + limit < matching.length ? offset + limit : null,
                attempts: structuredClone(matching.slice(offset, offset + limit)) };
        },
        clear() { records = []; startedAt = Date.now(); evicted = false; },
    };
}
