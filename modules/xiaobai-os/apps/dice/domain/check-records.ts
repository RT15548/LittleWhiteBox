import { sha256 } from 'js-sha256';
import { parseActionCheckRequest, type ActionCheckRequest, type ActionCheckResult } from './action-check.js';
import { checkMarker } from './check-marker.js';

export const MAX_ACTION_CHECKS = 8;
export const DICE_MESSAGE_KEY = 'xiaobaiOsDice';

export interface ActionCheckRecord extends ActionCheckResult {
    id: string;
    request: ActionCheckRequest;
    /** Original request boundary, used for continuation eligibility, never for UI placement. */
    offset: number;
    prefixDigest: string;
}
export interface DiceMessageRecords { schemaVersion: 1; checks: ActionCheckRecord[] }

export function parseDiceRecords(value: unknown): DiceMessageRecords {
    if (!value || typeof value !== 'object' || Array.isArray(value)) { throw new TypeError('dice_records_invalid'); }
    const input = value as Record<string, unknown>;
    if (input.schemaVersion !== 1 || Object.keys(input).length !== 2 || !Array.isArray(input.checks)
        || input.checks.length > MAX_ACTION_CHECKS) { throw new TypeError('dice_records_invalid'); }
    const ids = new Set<string>();
    let previousOffset = -1;
    const checks = input.checks.map((item: unknown) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) { throw new TypeError('dice_record_invalid'); }
        const record = item as ActionCheckRecord;
        const keys = ['id', 'request', 'roll', 'dc', 'outcome', 'offset', 'prefixDigest'];
        if (Object.keys(record).length !== keys.length || keys.some(key => !Object.hasOwn(record, key))
            || typeof record.id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(record.id) || ids.has(record.id)
            || !Number.isInteger(record.roll) || record.roll < 1 || record.roll > 20
            || !Number.isInteger(record.dc) || record.dc < 1
            || !['critical_failure', 'failure', 'success', 'critical_success'].includes(record.outcome)
            || !Number.isSafeInteger(record.offset) || record.offset < 0 || record.offset < previousOffset
            || typeof record.prefixDigest !== 'string' || !/^[a-f0-9]{64}$/.test(record.prefixDigest)) {
            throw new TypeError('dice_record_invalid');
        }
        ids.add(record.id);
        previousOffset = record.offset;
        // Historical outcomes are stored facts, not recalculated from today's difficulty table.
        return { ...record, request: parseActionCheckRequest(record.request) };
    });
    return { schemaVersion: 1, checks };
}

export function hasValidCheckAnchor(body: string, record: ActionCheckRecord): boolean {
    return body.startsWith(checkMarker(record.id), record.offset) && sha256(body.slice(0, record.offset)) === record.prefixDigest;
}

export function isCheckContinuationPoint(body: string, record: ActionCheckRecord): boolean {
    return hasValidCheckAnchor(body, record) && !body.slice(record.offset + checkMarker(record.id).length).trim();
}

export function createActionCheckRecord(body: string, id: string, request: ActionCheckRequest, result: ActionCheckResult): ActionCheckRecord {
    return { id, request, ...result, offset: body.length, prefixDigest: sha256(body) };
}
