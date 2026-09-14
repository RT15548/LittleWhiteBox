export const ACTION_CHECK_DC = Object.freeze({
    easy: 5, ordinary: 10, hard: 15, very_hard: 20, nearly_impossible: 21,
});
export type ActionCheckDifficulty = keyof typeof ACTION_CHECK_DC;
export type ActionCheckOutcome = 'critical_failure' | 'failure' | 'success' | 'critical_success';

export interface ActionCheckRequest {
    action: string;
    stat: string;
    difficulty: ActionCheckDifficulty;
    character?: string;
    stakes?: string;
}

export interface ActionCheckResult {
    roll: number;
    dc: number;
    outcome: ActionCheckOutcome;
}

export const ACTION_CHECK_REQUEST_FIELDS = Object.freeze({
    action: { required: true, maxLength: 240 }, stat: { required: true, maxLength: 120 },
    character: { required: false, maxLength: 120 }, stakes: { required: false, maxLength: 240 },
});

export function parseActionCheckRequest(value: unknown): ActionCheckRequest {
    if (!value || typeof value !== 'object' || Array.isArray(value)) { throw new TypeError('dice_request_object_required'); }
    const input = value as Record<string, unknown>;
    if (Object.keys(input).some(key => key !== 'difficulty' && !Object.hasOwn(ACTION_CHECK_REQUEST_FIELDS, key))) {
        throw new TypeError('dice_request_unknown_field');
    }
    if (typeof input.difficulty !== 'string' || !Object.hasOwn(ACTION_CHECK_DC, input.difficulty)) {
        throw new TypeError('dice_request_difficulty_invalid');
    }
    const fields: Record<string, string> = {};
    for (const [key, spec] of Object.entries(ACTION_CHECK_REQUEST_FIELDS)) {
        if (!Object.hasOwn(input, key) && !spec.required) { continue; }
        const raw = input[key];
        if (typeof raw !== 'string' || !raw.trim() || raw.trim().length > spec.maxLength) {
            throw new TypeError(`dice_request_${key}_invalid`);
        }
        fields[key] = raw.trim();
    }
    return { action: fields.action, stat: fields.stat, difficulty: input.difficulty as ActionCheckDifficulty,
        ...(fields.character === undefined ? {} : { character: fields.character }),
        ...(fields.stakes === undefined ? {} : { stakes: fields.stakes }) };
}

export function resolveActionCheck(difficulty: ActionCheckDifficulty, roll: number): ActionCheckResult {
    if (!Object.hasOwn(ACTION_CHECK_DC, difficulty) || !Number.isInteger(roll) || roll < 1 || roll > 20) {
        throw new TypeError('dice_result_invalid');
    }
    const dc = ACTION_CHECK_DC[difficulty];
    const outcome = roll === 1 ? 'critical_failure' : roll === 20 ? 'critical_success'
        : roll >= dc ? 'success' : 'failure';
    return { roll, dc, outcome };
}

export function rollActionCheck(difficulty: ActionCheckDifficulty, random: () => number = Math.random): ActionCheckResult {
    const sample = random();
    if (!Number.isFinite(sample) || sample < 0 || sample >= 1) { throw new TypeError('dice_random_invalid'); }
    return resolveActionCheck(difficulty, Math.floor(sample * 20) + 1);
}
