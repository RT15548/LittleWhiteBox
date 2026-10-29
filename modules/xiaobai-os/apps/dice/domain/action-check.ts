import { CHECK_CONSEQUENCE_FIELDS, type CheckConsequences } from './check-consequences.js';
import { parseCheckRequestFields } from './request-fields.js';

export const ACTION_CHECK_DC_RANGES = Object.freeze({
    easy: { min: 2, max: 5 }, ordinary: { min: 6, max: 10 }, hard: { min: 11, max: 15 },
    very_hard: { min: 16, max: 20 }, nearly_impossible: { min: 21, max: 21 },
} as const);
export type ActionCheckDifficulty = keyof typeof ACTION_CHECK_DC_RANGES;
export type ActionCheckOutcome = 'critical_failure' | 'failure' | 'success' | 'critical_success';

export interface ActionCheckRequest extends CheckConsequences {
    action: string;
    stat: string;
    difficulty: ActionCheckDifficulty;
    character?: string;
}

export interface ActionCheckResult {
    roll: number;
    dc: number;
    outcome: ActionCheckOutcome;
}

export const ACTION_CHECK_REQUEST_FIELDS = Object.freeze({
    action: { type: 'string', required: true, maxLength: 240, description: 'The attempt and objective.' },
    stat: { type: 'string', required: true, maxLength: 120, description: 'The ability used.' },
    difficulty: { type: 'enum', required: true, values: Object.keys(ACTION_CHECK_DC_RANGES), description: 'Difficulty of this specific objective.' },
    ...CHECK_CONSEQUENCE_FIELDS,
    character: { type: 'string', required: false, maxLength: 120, description: 'Acting character, if ambiguous.' },
} as const);

export function parseActionCheckRequest(value: unknown): ActionCheckRequest {
    return parseCheckRequestFields(value, ACTION_CHECK_REQUEST_FIELDS) as unknown as ActionCheckRequest;
}

export function resolveActionCheck(dc: number, roll: number): ActionCheckResult {
    // Saved production checks can have a DC outside today's first-roll table.
    if (!Number.isInteger(dc) || dc < 1 || !Number.isInteger(roll) || roll < 1 || roll > 20) {
        throw new TypeError('dice_result_invalid');
    }
    const outcome = roll === 1 ? 'critical_failure' : roll === 20 ? 'critical_success'
        : roll >= dc ? 'success' : 'failure';
    return { roll, dc, outcome };
}

function randomInteger(min: number, max: number, random: () => number): number {
    const sample = random();
    if (!Number.isFinite(sample) || sample < 0 || sample >= 1) { throw new TypeError('dice_random_invalid'); }
    return min + Math.floor(sample * (max - min + 1));
}

export function rollActionCheck(difficulty: ActionCheckDifficulty, random: () => number = Math.random): ActionCheckResult {
    if (!Object.hasOwn(ACTION_CHECK_DC_RANGES, difficulty)) { throw new TypeError('dice_request_difficulty_invalid'); }
    const { min, max } = ACTION_CHECK_DC_RANGES[difficulty];
    const dc = randomInteger(min, max, random);
    return rollAgainstDc(dc, random);
}

export function rollAgainstDc(dc: number, random: () => number = Math.random): ActionCheckResult {
    return resolveActionCheck(dc, randomInteger(1, 20, random));
}
