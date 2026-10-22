// Frozen upstream a32c28d0 message format. Keep this reader while those saved chats
// are supported. Conversion happens only at the record parsing boundary; runtime
// records carry neither the former offsets nor their prose hashes.
export interface RequestV1 {
    action: string;
    stat: string;
    difficulty: 'easy' | 'ordinary' | 'hard' | 'very_hard' | 'nearly_impossible';
    character?: string;
    stakes?: string;
}
interface RecordV1 {
    id: string;
    request: RequestV1;
    roll: number;
    dc: number;
    outcome: 'critical_failure' | 'failure' | 'success' | 'critical_success';
    offset: number;
    prefixDigest: string;
}

export function readRequestV1(value: unknown): RequestV1 {
    if (!value || typeof value !== 'object' || Array.isArray(value)) { throw new TypeError('dice_request_object_required'); }
    const input = value as Record<string, unknown>;
    const fields = { action: [true, 240], stat: [true, 120], character: [false, 120], stakes: [false, 240] } as const;
    if (Object.keys(input).some(key => key !== 'difficulty' && !Object.hasOwn(fields, key))) {
        throw new TypeError('dice_request_unknown_field');
    }
    if (typeof input.difficulty !== 'string' || !['easy', 'ordinary', 'hard', 'very_hard', 'nearly_impossible'].includes(input.difficulty)) {
        throw new TypeError('dice_request_difficulty_invalid');
    }
    const result: Record<string, string> = {};
    for (const [key, [required, maxLength]] of Object.entries(fields)) {
        if (!Object.hasOwn(input, key) && !required) { continue; }
        const raw = input[key];
        if (typeof raw !== 'string' || !raw.trim() || raw.trim().length > maxLength) {
            throw new TypeError(`dice_request_${key}_invalid`);
        }
        result[key] = raw.trim();
    }
    return { action: result.action, stat: result.stat, difficulty: input.difficulty as RequestV1['difficulty'],
        ...(result.character === undefined ? {} : { character: result.character }),
        ...(result.stakes === undefined ? {} : { stakes: result.stakes }) };
}

export function readDiceChecksV1(value: unknown) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) { throw new TypeError('dice_records_invalid'); }
    const input = value as Record<string, unknown>;
    if (input.schemaVersion !== 1 || Object.keys(input).length !== 2 || !Array.isArray(input.checks) || input.checks.length > 8) {
        throw new TypeError('dice_records_invalid');
    }
    const ids = new Set<string>();
    let previousOffset = -1;
    const checks = input.checks.map((item: unknown) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) { throw new TypeError('dice_record_invalid'); }
        const record = item as RecordV1;
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
        return { rule: 'd20' as const, id: record.id, request: readRequestV1(record.request), roll: record.roll, dc: record.dc, outcome: record.outcome };
    });
    return checks;
}
