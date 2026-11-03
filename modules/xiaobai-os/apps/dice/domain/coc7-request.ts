import { ACTION_CHECK_REQUEST_FIELDS } from './action-check.js';
import { CHECK_CONSEQUENCE_FIELDS, type CheckConsequences } from './check-consequences.js';
import { parseCheckRequestFields } from './request-fields.js';

export const COC7_DIFFICULTIES = {
    easy: { kind: 'bonus', amount: 20, cap: 95 },
    regular: { kind: 'divisor', divisor: 1 },
    hard: { kind: 'divisor', divisor: 2 },
    extreme: { kind: 'divisor', divisor: 5 },
} as const;
export type Coc7Difficulty = keyof typeof COC7_DIFFICULTIES;
export interface Coc7Request extends CheckConsequences { action: string; stat: string; difficulty: Coc7Difficulty }

// Parser and model description share the complete field set and constraints.
export const COC7_REQUEST_FIELDS = {
    action: ACTION_CHECK_REQUEST_FIELDS.action,
    stat: { ...ACTION_CHECK_REQUEST_FIELDS.stat, description: 'Capability ID from the list below.' },
    difficulty: { type: 'enum', required: true, values: Object.keys(COC7_DIFFICULTIES), description: 'Difficulty of this specific objective.' },
    ...CHECK_CONSEQUENCE_FIELDS,
} as const;

export function parseCoc7Request(value: unknown): Coc7Request {
    return parseCheckRequestFields(value, COC7_REQUEST_FIELDS) as unknown as Coc7Request;
}
