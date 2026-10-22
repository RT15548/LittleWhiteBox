import { parseActionCheckRequest, type ActionCheckRequest, type ActionCheckResult } from './action-check.js';
import { checkMarker, checkMarkerIds } from './check-marker.js';
import { upgradeDiceChecks } from '../storage/upgrade-records.js';
import { parseCoc7RecordedRequest, parseCoc7Resolution, type Coc7RecordedRequest, type Coc7Resolution } from './coc7-record.js';
import { parseCoc7Result, type Coc7Result } from './coc7.js';

export const MAX_ACTION_CHECKS = 8;
export const DICE_MESSAGE_KEY = 'xiaobaiOsDice';
export const DICE_RECORDS_SCHEMA_VERSION = 4;

interface CheckHistory {
    /** Unpartitioned context retained from an earlier saved check, not a result. */
    context?: string;
    /** Stable adjudication identity retained when a saved request is converted. */
    basis?: string;
}

export interface D20CheckRecord extends ActionCheckResult, CheckHistory {
    rule: 'd20';
    id: string;
    request: ActionCheckRequest;
}
export interface Coc7CheckRecord extends CheckHistory { rule: 'coc7'; id: string; request: Coc7RecordedRequest; result: Coc7Result; resolution?: Coc7Resolution }
export type ActionCheckRecord = D20CheckRecord | Coc7CheckRecord;
export interface DiceMessageRecords { schemaVersion: typeof DICE_RECORDS_SCHEMA_VERSION; checks: ActionCheckRecord[] }

export function parseDiceRecords(value: unknown): DiceMessageRecords {
    if (!value || typeof value !== 'object' || Array.isArray(value)) { throw new TypeError('dice_records_invalid'); }
    const raw = value as Record<string, unknown>;
    const input = raw.schemaVersion === 1 || raw.schemaVersion === 3
        ? { schemaVersion: DICE_RECORDS_SCHEMA_VERSION, checks: upgradeDiceChecks(raw) } : raw;
    if (input.schemaVersion !== DICE_RECORDS_SCHEMA_VERSION || Object.keys(input).length !== 2 || !Array.isArray(input.checks)
        || input.checks.length > MAX_ACTION_CHECKS) { throw new TypeError('dice_records_invalid'); }
    const ids = new Set<string>();
    const checks = input.checks.map((item: unknown) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) { throw new TypeError('dice_record_invalid'); }
        const record = item as ActionCheckRecord;
        const keys = record.rule === 'coc7' ? ['rule', 'id', 'request', 'result'] : ['rule', 'id', 'request', 'roll', 'dc', 'outcome'];
        if (record.rule === 'coc7' && Object.hasOwn(record, 'resolution')) { keys.push('resolution'); }
        if (Object.hasOwn(record, 'context')) {
            keys.push('context');
            if (typeof record.context !== 'string' || !record.context.trim() || record.context.length > 240) { throw new TypeError('dice_record_invalid'); }
        }
        if (Object.hasOwn(record, 'basis')) {
            keys.push('basis');
            if (typeof record.basis !== 'string' || !/^[a-f0-9]{64}$/.test(record.basis)) { throw new TypeError('dice_record_invalid'); }
        }
        if (Object.keys(record).length !== keys.length || keys.some(key => !Object.hasOwn(record, key))
            || typeof record.id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(record.id) || ids.has(record.id)) {
            throw new TypeError('dice_record_invalid');
        }
        ids.add(record.id);
        if (record.rule === 'coc7') {
            const request = parseCoc7RecordedRequest(record.request);
            return { ...record, request, result: parseCoc7Result(record.result),
                ...(Object.hasOwn(record, 'resolution') ? { resolution: parseCoc7Resolution(record.resolution) } : {}) };
        }
        if (record.rule !== 'd20' || !Number.isInteger(record.roll) || record.roll < 1 || record.roll > 20
            || !Number.isInteger(record.dc) || record.dc < 1
            || !['critical_failure', 'failure', 'success', 'critical_success'].includes(record.outcome)) {
            throw new TypeError('dice_record_invalid');
        }
        // Historical outcomes are stored facts, not recalculated from today's difficulty table.
        return { ...record, request: parseActionCheckRequest(record.request) };
    });
    return { schemaVersion: DICE_RECORDS_SCHEMA_VERSION, checks };
}

/**
 * The body chooses which saved results are referenced and their presentation order.
 * Unreferenced records remain history, including the number of checks already used.
 */
export function referencedActionChecks(body: string, checks: readonly ActionCheckRecord[]): ActionCheckRecord[] {
    const byId = new Map(checks.map(record => [record.id, record]));
    return Array.from(checkMarkerIds(body)).flatMap(id => {
        const record = byId.get(id);
        return record ? [record] : [];
    });
}

export function isCheckContinuationPoint(body: string, record: ActionCheckRecord): boolean {
    const marker = checkMarker(record.id);
    const offset = body.indexOf(marker);
    return offset !== -1 && !body.slice(offset + marker.length).trim();
}
