import { ACTION_CHECK_REQUEST_FIELDS } from './action-check.js';
import { CHECK_CONSEQUENCE_FIELDS, type CheckConsequences } from './check-consequences.js';

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
    action: { type: 'string', ...ACTION_CHECK_REQUEST_FIELDS.action, description: 'The attempt and objective.' },
    stat: { type: 'string', ...ACTION_CHECK_REQUEST_FIELDS.stat, description: 'Capability ID from the list below.' },
    difficulty: { type: 'enum', required: true, values: Object.keys(COC7_DIFFICULTIES), description: 'Difficulty of this specific objective.' },
    success: { type: 'string', ...CHECK_CONSEQUENCE_FIELDS.success },
    failure: { type: 'string', ...CHECK_CONSEQUENCE_FIELDS.failure },
} as const;

export function parseCoc7Request(value: unknown): Coc7Request {
    if (!value || typeof value !== 'object' || Array.isArray(value)) { throw new TypeError('dice_request_object_required'); }
    const input = value as Record<string, unknown>;
    if (Object.keys(input).some(key => !Object.hasOwn(COC7_REQUEST_FIELDS, key))) { throw new TypeError('dice_request_unknown_field'); }
    const result: Record<string, string> = {};
    for (const [key, spec] of Object.entries(COC7_REQUEST_FIELDS)) {
        if (!Object.hasOwn(input, key) && !spec.required) { continue; }
        const raw = input[key];
        if (typeof raw !== 'string' || (spec.type === 'string' ? !raw.trim() || raw.trim().length > spec.maxLength : !(spec.values as readonly string[]).includes(raw))) {
            throw new TypeError(`dice_request_${key}_invalid`);
        }
        result[key] = spec.type === 'string' ? raw.trim() : raw;
    }
    return result as unknown as Coc7Request;
}
