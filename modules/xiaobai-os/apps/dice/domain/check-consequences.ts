import type { ActionCheckRecord } from './check-records.js';

export interface CheckConsequences { success?: string; failure?: string }

export const CHECK_CONSEQUENCE_FIELDS = {
    success: { required: false, maxLength: 240, description: 'A short consequence if the objective is achieved, in the story language. Shown on a successful result card.' },
    failure: { required: false, maxLength: 240, description: 'A short consequence if the objective is not achieved, in the story language. Shown on a failed result card.' },
} as const;

/** The recorded verdict, not a percentile success degree, selects the consequence. */
export function checkConsequence(record: ActionCheckRecord): string | undefined {
    const achieved = record.rule === 'coc7' ? record.result.verdict === 'achieved'
        : record.outcome === 'success' || record.outcome === 'critical_success';
    return achieved ? record.request.success : record.request.failure;
}
