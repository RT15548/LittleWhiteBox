import { readRequestV1, type RequestV1 } from './records-v1.js';

// Frozen schema 3: upstream 9e71caef, plus the optional D100 stakes field in
// b13d9608. Keep while these saved chats are supported; never parse new requests here.
interface PercentileRequestV3 {
    action: string; stat: string; difficulty: 'easy' | 'regular' | 'hard' | 'extreme'; stakes?: string;
}
interface PercentileResultV3 {
    value: number; units: number; tens: number; roll: number; threshold: number;
    level: 'fumble' | 'failure' | 'easy' | 'regular' | 'hard' | 'extreme' | 'critical';
    verdict: 'achieved' | 'not_achieved';
}
type ResolutionV3 = { kind: 'mapped'; input: string } | { kind: 'untrained'; reason: 'unknown' | 'ambiguous' };
export type CheckV3 = { rule: 'd20'; id: string; request: RequestV1; roll: number; dc: number;
    outcome: 'critical_failure' | 'failure' | 'success' | 'critical_success' }
    | { rule: 'coc7'; id: string; request: PercentileRequestV3; result: PercentileResultV3; resolution?: ResolutionV3 };

function readPercentileRequest(value: unknown): PercentileRequestV3 {
    if (!value || typeof value !== 'object' || Array.isArray(value)) { throw new TypeError('dice_record_invalid'); }
    const request = value as PercentileRequestV3;
    if (Object.keys(request).some(key => !['action', 'stat', 'difficulty', 'stakes'].includes(key))
        || !['easy', 'regular', 'hard', 'extreme'].includes(request.difficulty)) { throw new TypeError('dice_record_invalid'); }
    for (const [key, max] of [['action', 240], ['stat', 120], ['stakes', 240]] as const) {
        if (key === 'stakes' && !Object.hasOwn(request, key)) { continue; }
        const text = request[key];
        if (typeof text !== 'string' || !text.trim() || text.length > max) { throw new TypeError('dice_record_invalid'); }
    }
    return { ...request };
}

function readPercentileResult(value: unknown): PercentileResultV3 {
    const fields = ['value', 'units', 'tens', 'roll', 'threshold', 'level', 'verdict'];
    if (!value || typeof value !== 'object' || Array.isArray(value)) { throw new TypeError('dice_record_invalid'); }
    const result = value as PercentileResultV3;
    if (Object.keys(result).length !== fields.length || fields.some(key => !Object.hasOwn(result, key))
        || !Number.isSafeInteger(result.value) || result.value < 1
        || ![result.units, result.tens].every(n => Number.isInteger(n) && n >= 0 && n <= 9)
        || !Number.isInteger(result.roll) || result.roll < 1 || result.roll > 100
        || !Number.isSafeInteger(result.threshold) || result.threshold < 0
        || !['fumble', 'failure', 'easy', 'regular', 'hard', 'extreme', 'critical'].includes(result.level)
        || !['achieved', 'not_achieved'].includes(result.verdict)) { throw new TypeError('dice_record_invalid'); }
    return { ...result };
}

function readResolution(value: unknown): ResolutionV3 {
    if (!value || typeof value !== 'object' || Array.isArray(value)) { throw new TypeError('dice_record_invalid'); }
    const resolution = value as ResolutionV3;
    if (Object.keys(resolution).length === 2 && Object.hasOwn(resolution, 'kind')) {
        if (resolution.kind === 'mapped' && Object.hasOwn(resolution, 'input') && typeof resolution.input === 'string'
            && resolution.input.trim() && resolution.input.length <= 120) { return { ...resolution }; }
        if (resolution.kind === 'untrained' && Object.hasOwn(resolution, 'reason')
            && ['unknown', 'ambiguous'].includes(resolution.reason)) { return { ...resolution }; }
    }
    throw new TypeError('dice_record_invalid');
}

export function readDiceChecksV3(value: unknown): CheckV3[] {
    if (!value || typeof value !== 'object' || Array.isArray(value)) { throw new TypeError('dice_records_invalid'); }
    const input = value as Record<string, unknown>;
    if (input.schemaVersion !== 3 || Object.keys(input).length !== 2 || !Array.isArray(input.checks) || input.checks.length > 8) {
        throw new TypeError('dice_records_invalid');
    }
    const ids = new Set<string>();
    return input.checks.map((item: unknown) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) { throw new TypeError('dice_record_invalid'); }
        const record = item as CheckV3;
        const keys = record.rule === 'coc7' ? ['rule', 'id', 'request', 'result'] : ['rule', 'id', 'request', 'roll', 'dc', 'outcome'];
        if (record.rule === 'coc7' && Object.hasOwn(record, 'resolution')) { keys.push('resolution'); }
        if (Object.keys(record).length !== keys.length || keys.some(key => !Object.hasOwn(record, key))
            || typeof record.id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(record.id) || ids.has(record.id)) {
            throw new TypeError('dice_record_invalid');
        }
        ids.add(record.id);
        if (record.rule === 'coc7') {
            return { ...record, request: readPercentileRequest(record.request), result: readPercentileResult(record.result),
                ...(Object.hasOwn(record, 'resolution') ? { resolution: readResolution(record.resolution) } : {}) };
        }
        if (record.rule !== 'd20' || !Number.isInteger(record.roll) || record.roll < 1 || record.roll > 20
            || !Number.isInteger(record.dc) || record.dc < 1
            || !['critical_failure', 'failure', 'success', 'critical_success'].includes(record.outcome)) { throw new TypeError('dice_record_invalid'); }
        return { ...record, request: readRequestV1(record.request) };
    });
}
