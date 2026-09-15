import { rollActionCheck } from '../domain/action-check.js';
import { createActionCheckRecord, hasValidCheckAnchor, MAX_ACTION_CHECKS, parseDiceRecords, type DiceMessageRecords } from '../domain/check-records.js';
import { parseActionCheck } from '../protocol/request.js';
import { checkMarker } from '../domain/check-marker.js';

export type PreparedActionCheck = { kind: 'none' } | { kind: 'invalid'; error: string }
    | { kind: 'candidate'; body: string; records: DiceMessageRecords };

/** No random call happens until the request, history and execution limit have been checked. */
export function prepareActionCheck(input: {
    body: string; generatedFrom: number; records?: unknown; id: string; random?: () => number;
}): PreparedActionCheck {
    const parsed = parseActionCheck(input.body, input.generatedFrom);
    if (parsed.kind !== 'request') { return parsed; }
    const records = input.records === undefined ? { schemaVersion: 1 as const, checks: [] } : parseDiceRecords(input.records);
    if (records.checks.length >= MAX_ACTION_CHECKS) { return { kind: 'invalid', error: 'dice_check_limit' }; }
    if (records.checks.some(record => !hasValidCheckAnchor(parsed.body, record))) {
        return { kind: 'invalid', error: 'dice_body_changed' };
    }
    const marker = checkMarker(input.id);
    if (records.checks.some(record => record.id === input.id)) { throw new TypeError('dice_record_id_invalid'); }
    const result = rollActionCheck(parsed.request.difficulty, input.random);
    const record = createActionCheckRecord(parsed.body, input.id, parsed.request, result);
    return { kind: 'candidate', body: parsed.body + marker + input.body.slice(parsed.end),
        records: { schemaVersion: 1, checks: [...records.checks, record] } };
}
