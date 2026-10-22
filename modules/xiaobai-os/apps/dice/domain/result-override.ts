import { sha256 } from 'js-sha256';
import type { ActionCheckRecord } from './check-records.js';
import { COC7_LEVELS, type Coc7Result } from './coc7.js';

type RolledResult = { rule: 'd20'; roll: number; outcome: Extract<ActionCheckRecord, { rule: 'd20' }>['outcome'] }
    | ({ rule: 'coc7' } & Pick<Coc7Result, 'roll' | 'units' | 'tens' | 'level' | 'verdict'>);
export interface DiceResultOverride {
    basis: string;
    version: string;
    result: RolledResult;
}

/** Fixed adjudication data, not property order or the editable prose around a check. */
export function checkBasis(record: ActionCheckRecord): string {
    if (record.basis) { return record.basis; }
    const resolution = record.rule === 'coc7' ? record.resolution : undefined;
    return sha256(JSON.stringify([record.rule, Object.keys(record.request).sort().map(key =>
        [key, record.request[key as keyof typeof record.request]]),
        record.rule === 'd20' ? record.dc : [record.result.value, record.result.threshold,
            resolution ? [resolution.kind, resolution.kind === 'mapped' ? resolution.input : resolution.reason] : null]]));
}

export function createResultOverride(record: ActionCheckRecord, version: string): DiceResultOverride {
    const result: RolledResult = record.rule === 'd20'
        ? { rule: record.rule, roll: record.roll, outcome: record.outcome }
        : { rule: record.rule, roll: record.result.roll, units: record.result.units, tens: record.result.tens,
            level: record.result.level, verdict: record.result.verdict };
    return { basis: checkBasis(record), version, result };
}

export function applyResultOverride(record: ActionCheckRecord, override: DiceResultOverride | undefined): ActionCheckRecord {
    if (!override || override.basis !== checkBasis(record)) { return record; }
    if (record.rule === 'd20' && override.result.rule === 'd20') {
        return { ...record, roll: override.result.roll, outcome: override.result.outcome };
    }
    if (record.rule === 'coc7' && override.result.rule === 'coc7') {
        const { rule: _rule, ...result } = override.result;
        return { ...record, result: { ...record.result, ...result } };
    }
    throw new TypeError('dice_override_invalid');
}

export function parseResultOverride(value: unknown): DiceResultOverride {
    const invalid = (): never => { throw new TypeError('dice_override_invalid'); };
    if (!value || typeof value !== 'object' || Array.isArray(value)) { return invalid(); }
    const entry = value as DiceResultOverride;
    if (Object.keys(entry).sort().join(',') !== 'basis,result,version'
        || typeof entry.version !== 'string' || !entry.version || !/^[a-f0-9]{64}$/.test(entry.basis)) { return invalid(); }
    const result = entry.result;
    if (!result || typeof result !== 'object' || !Number.isInteger(result.roll)) { return invalid(); }
    if (result.rule === 'd20') {
        if (Object.keys(result).sort().join(',') !== 'outcome,roll,rule' || result.roll < 1 || result.roll > 20
            || !['critical_failure', 'failure', 'success', 'critical_success'].includes(result.outcome)) { return invalid(); }
    } else if (result.rule === 'coc7') {
        if (Object.keys(result).sort().join(',') !== 'level,roll,rule,tens,units,verdict'
            || ![result.units, result.tens].every(n => Number.isInteger(n) && n >= 0 && n <= 9)
            || result.roll !== (result.tens * 10 + result.units || 100) || !COC7_LEVELS.includes(result.level)
            || !['achieved', 'not_achieved'].includes(result.verdict)) { return invalid(); }
    } else { return invalid(); }
    return structuredClone(entry);
}
