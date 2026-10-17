import {
    TASK_DIRECTIONS,
    TASK_DIRECTION_REWARD_RANGES,
    TASK_GRADES,
    TASK_GRADE_REWARD_RANGES,
    TASK_POSTURES,
    type TaskCandidate,
    type TaskCandidateDraft,
    type TaskDirection,
    type TaskBoardGrade,
    type TaskListingDraft,
    type TaskPosture,
} from '../../../domains/tasks/types.js';
import { normalizeTaskTiming } from '../../../domains/tasks/invariants.js';
import { extractTaskJsonValue } from './json-response.js';
import type {
    BoardCompileResult,
    CandidateCompileResult,
    TaskCompileItemReport,
    TaskCompileReason,
    TaskCompileResult,
} from './types.js';

type CollectionName = TaskCompileItemReport['collection'];
type UnknownRecord = Record<string, unknown>;

const BOARD_RESPONSE_LIMIT = 64_000;
const CANDIDATE_RESPONSE_LIMIT = 256_000;
const BOARD_INPUT_LIMIT = 12;
const CANDIDATE_INPUT_LIMIT = 8;
const CANDIDATE_OUTPUT_LIMIT = 4;

const BOARD_FIELDS = new Set([
    'grade', 'tags', 'posture', 'title', 'hook', 'objective', 'requirements',
    'location', 'timing', 'risk', 'reward',
]);
const CANDIDATE_FIELDS = new Set(['name', 'description', 'pitch', 'capability', 'risk']);

const REASON_HINTS: Readonly<Record<TaskCompileReason, string>> = {
    response_too_large: 'The provider response exceeded the parser limit.',
    response_truncated: 'Retry because the provider response was incomplete.',
    json_not_found: 'Return one complete JSON object.',
    root_must_be_object: 'Use a JSON object as the root value.',
    tasks_must_be_array: 'Set tasks to a JSON array.',
    candidates_must_be_array: 'Set candidates to a JSON array.',
    collection_exceeds_limit: 'Return no more than the documented collection limit.',
    item_must_be_object: 'Each collection item must be a JSON object.',
    required_field_missing: 'Supply every required non-empty field.',
    field_type_invalid: 'Use the documented JSON field types.',
    field_too_long: 'Shorten the field to its documented limit.',
    tags_invalid: 'Use one to four distinct non-empty string tags.',
    direction_invalid: 'Use a board direction as the first tag.',
    direction_duplicate: 'Return at most one task for each direction.',
    posture_invalid: 'Use one of the three documented intervention postures.',
    timing_invalid: 'Use a documented timing value compatible with the posture.',
    reward_invalid: 'Use a positive integer reward within the direction range.',
    grade_invalid: 'Use a documented board grade.',
    grade_reward_mismatch: 'Choose the grade whose range contains the reward.',
    candidate_name_duplicate: 'Candidate names must be distinct.',
};

class CompileFailure extends Error {
    readonly reason: TaskCompileReason;

    constructor(reason: TaskCompileReason) {
        super(reason);
        this.reason = reason;
    }
}

function isRecord(value: unknown): value is UnknownRecord {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function report(
    collection: CollectionName,
    index: number,
    reason: TaskCompileReason,
): TaskCompileItemReport {
    return { collection, index, id: '', reason, hint: REASON_HINTS[reason] };
}

function failed<T>(
    collection: CollectionName,
    reason: TaskCompileReason,
    warnings: readonly string[] = [],
): TaskCompileResult<T> {
    return {
        ok: false,
        status: 'failed',
        changed: false,
        applied: [],
        skipped: [report(collection, -1, reason)],
        warnings: [...new Set(warnings)],
        hint: REASON_HINTS[reason],
    };
}

function extractRoot(
    value: unknown,
    collection: CollectionName,
    maximumLength: number,
): { ok: true; root: UnknownRecord } | { ok: false; result: TaskCompileResult<never> } {
    const source = typeof value === 'string' ? value : String(value ?? '');
    if (source.length > maximumLength) {
        return { ok: false, result: failed(collection, 'response_too_large') };
    }
    const extracted = extractTaskJsonValue(source);
    if (!extracted.ok) {
        return { ok: false, result: failed(collection, extracted.reason) };
    }
    if (!isRecord(extracted.value)) {
        return { ok: false, result: failed(collection, 'root_must_be_object') };
    }
    return { ok: true, root: extracted.value };
}

function normalizeSingleLine(value: unknown, maximum: number, required = true): string {
    if (value === undefined) {
        if (required) {throw new CompileFailure('required_field_missing');}
        return '';
    }
    if (typeof value !== 'string') {throw new CompileFailure('field_type_invalid');}
    const normalized = value
        .normalize('NFKC')
        .replace(/[\u0000-\u001f\u007f-\u009f]/gu, ' ')
        .replace(/\s+/gu, ' ')
        .trim();
    if (required && !normalized) {throw new CompileFailure('required_field_missing');}
    if (Array.from(normalized).length > maximum) {throw new CompileFailure('field_too_long');}
    return normalized;
}

function normalizeBody(value: unknown, maximum: number): string {
    if (value === undefined) {throw new CompileFailure('required_field_missing');}
    if (typeof value !== 'string') {throw new CompileFailure('field_type_invalid');}
    const normalized = value
        .normalize('NFKC')
        .replace(/\r\n?/gu, '\n')
        .replace(/[\u0000-\u0009\u000b-\u001f\u007f-\u009f]/gu, ' ')
        .trim();
    if (!normalized) {throw new CompileFailure('required_field_missing');}
    if (Array.from(normalized).length > maximum) {throw new CompileFailure('field_too_long');}
    return normalized;
}

function hasUnknownFields(recordValue: UnknownRecord, fields: ReadonlySet<string>): boolean {
    return Object.keys(recordValue).some((key) => !fields.has(key));
}

function normalizeBoardTags(value: unknown): string[] {
    if (!Array.isArray(value) || value.length < 1 || value.length > 4) {
        throw new CompileFailure('tags_invalid');
    }
    try {
        const tags = value.map((tag) => normalizeSingleLine(tag, 16));
        if (new Set(tags).size !== tags.length) {throw new CompileFailure('tags_invalid');}
        return tags;
    } catch (error) {
        if (error instanceof CompileFailure && error.reason === 'direction_invalid') {throw error;}
        throw new CompileFailure('tags_invalid');
    }
}

function compileBoardItem(value: unknown, warnings: string[]): TaskListingDraft {
    if (!isRecord(value)) {throw new CompileFailure('item_must_be_object');}
    if (hasUnknownFields(value, BOARD_FIELDS)) {warnings.push('tasks_item_fields_ignored');}

    const tags = normalizeBoardTags(value.tags);
    const direction = tags[0] as TaskDirection;
    if (!TASK_DIRECTIONS.includes(direction)) {throw new CompileFailure('direction_invalid');}

    if (typeof value.grade !== 'string') {
        throw new CompileFailure(value.grade === undefined ? 'required_field_missing' : 'field_type_invalid');
    }
    const grade = normalizeSingleLine(value.grade, 6).toUpperCase() as TaskBoardGrade;
    if (!TASK_GRADES.includes(grade)) {throw new CompileFailure('grade_invalid');}

    if (typeof value.posture !== 'string') {
        throw new CompileFailure(value.posture === undefined ? 'required_field_missing' : 'field_type_invalid');
    }
    const posture = normalizeSingleLine(value.posture, 16) as TaskPosture;
    if (!TASK_POSTURES.includes(posture)) {throw new CompileFailure('posture_invalid');}

    if (value.reward === undefined) {throw new CompileFailure('required_field_missing');}
    if (typeof value.reward !== 'number') {throw new CompileFailure('field_type_invalid');}
    const reward = value.reward;
    if (!Number.isSafeInteger(reward) || reward <= 0) {throw new CompileFailure('reward_invalid');}
    const [directionMinimum, directionMaximum] = TASK_DIRECTION_REWARD_RANGES[direction];
    if (reward < directionMinimum || reward > directionMaximum) {
        throw new CompileFailure('reward_invalid');
    }
    const [gradeMinimum, gradeMaximum] = TASK_GRADE_REWARD_RANGES[grade];
    if (reward < gradeMinimum || reward > gradeMaximum) {
        throw new CompileFailure('grade_reward_mismatch');
    }

    let timing;
    try {timing = normalizeTaskTiming(value.timing);} catch {throw new CompileFailure('timing_invalid');}
    const specificTiming = timing.startsWith('特定时机：');
    if (posture === '易介入' && specificTiming) {throw new CompileFailure('timing_invalid');}

    const requirements = normalizeSingleLine(value.requirements, 64, false);
    return {
        grade,
        tags,
        posture,
        title: normalizeSingleLine(value.title, 12),
        hook: normalizeSingleLine(value.hook, 120),
        objective: normalizeSingleLine(value.objective, 48),
        ...(requirements ? { requirements } : {}),
        location: normalizeSingleLine(value.location, 48),
        timing,
        risk: normalizeSingleLine(value.risk, 64),
        reward,
    };
}

function normalizeCandidateItem(value: unknown, warnings?: string[]): TaskCandidateDraft {
    if (!isRecord(value)) {throw new CompileFailure('item_must_be_object');}
    if (warnings && hasUnknownFields(value, CANDIDATE_FIELDS)) {
        warnings.push('candidates_item_fields_ignored');
    }
    return {
        name: normalizeSingleLine(value.name, 120),
        description: normalizeBody(value.description, 2_000),
        pitch: normalizeBody(value.pitch, 2_000),
        capability: normalizeBody(value.capability, 2_000),
        risk: normalizeBody(value.risk, 2_000),
    };
}

function sameCandidates(
    drafts: readonly TaskCandidateDraft[],
    current: readonly TaskCandidate[],
): boolean {
    if (drafts.length !== current.length) {return false;}
    return drafts.every((draft, index) => {
        try {
            const existing = normalizeCandidateItem(current[index]);
            return draft.name === existing.name
                && draft.description === existing.description
                && draft.pitch === existing.pitch
                && draft.capability === existing.capability
                && draft.risk === existing.risk;
        } catch {
            return false;
        }
    });
}

function nameKey(name: string): string {
    return name.normalize('NFKC').replace(/\s+/gu, ' ').trim().toLocaleLowerCase();
}

export function compileTaskBoardResponse(
    value: unknown,
): BoardCompileResult {
    const extracted = extractRoot(value, 'tasks', BOARD_RESPONSE_LIMIT);
    if (!extracted.ok) {return extracted.result as BoardCompileResult;}
    const { root } = extracted;
    const warnings: string[] = [];
    if (Object.keys(root).some((key) => key !== 'tasks')) {warnings.push('tasks_root_fields_ignored');}
    if (!Array.isArray(root.tasks)) {return failed('tasks', 'tasks_must_be_array', warnings);}
    if (root.tasks.length > BOARD_INPUT_LIMIT) {
        return failed('tasks', 'collection_exceeds_limit', warnings);
    }

    const listings: TaskListingDraft[] = [];
    const applied: TaskCompileItemReport[] = [];
    const skipped: TaskCompileItemReport[] = [];
    const directions = new Set<TaskDirection>();
    for (let index = 0; index < root.tasks.length; index += 1) {
        try {
            const listing = compileBoardItem(root.tasks[index], warnings);
            const direction = listing.tags[0] as TaskDirection;
            if (directions.has(direction)) {throw new CompileFailure('direction_duplicate');}
            directions.add(direction);
            listings.push(listing);
            applied.push({ collection: 'tasks', index, id: '', changed: true });
        } catch (error) {
            const reason = error instanceof CompileFailure ? error.reason : 'field_type_invalid';
            skipped.push(report('tasks', index, reason));
        }
    }

    if (!listings.length) {
        if (!skipped.length) {skipped.push(report('tasks', -1, 'required_field_missing'));}
        return {
            ok: false,
            status: 'failed',
            changed: false,
            applied: [],
            skipped,
            warnings: [...new Set(warnings)],
            hint: REASON_HINTS[skipped[0].reason as TaskCompileReason],
        };
    }

    listings.sort((left, right) => (
        TASK_DIRECTIONS.indexOf(left.tags[0] as TaskDirection)
        - TASK_DIRECTIONS.indexOf(right.tags[0] as TaskDirection)
    ));
    const postures = {
        易介入: listings.filter((listing) => listing.posture === '易介入').length,
        中介入: listings.filter((listing) => listing.posture === '中介入').length,
        深介入: listings.filter((listing) => listing.posture === '深介入').length,
    };
    const completeDirections = listings.length === TASK_DIRECTIONS.length;
    const completePostures = postures.易介入 === 3 && postures.中介入 === 2 && postures.深介入 === 1;
    if (!completeDirections) {warnings.push('board_direction_quota_mismatch');}
    if (!completePostures) {warnings.push('board_posture_quota_mismatch');}
    const partial = skipped.length > 0 || !completeDirections || !completePostures;

    return {
        ok: true,
        status: partial ? 'partial' : 'updated',
        changed: true,
        applied,
        skipped,
        warnings: [...new Set(warnings)],
        data: { listings },
    };
}

export function compileTaskCandidateResponse(
    value: unknown,
    currentCandidates: readonly TaskCandidate[] = [],
): CandidateCompileResult {
    const extracted = extractRoot(value, 'candidates', CANDIDATE_RESPONSE_LIMIT);
    if (!extracted.ok) {return extracted.result as CandidateCompileResult;}
    const { root } = extracted;
    const warnings: string[] = [];
    if (Object.keys(root).some((key) => key !== 'candidates')) {
        warnings.push('candidates_root_fields_ignored');
    }
    if (!Array.isArray(root.candidates)) {
        return failed('candidates', 'candidates_must_be_array', warnings);
    }
    if (root.candidates.length > CANDIDATE_INPUT_LIMIT) {
        return failed('candidates', 'collection_exceeds_limit', warnings);
    }

    const candidates: TaskCandidateDraft[] = [];
    const sourceIndexes: number[] = [];
    const skipped: TaskCompileItemReport[] = [];
    const names = new Set<string>();
    for (let index = 0; index < root.candidates.length; index += 1) {
        try {
            const candidate = normalizeCandidateItem(root.candidates[index], warnings);
            const normalizedName = nameKey(candidate.name);
            if (names.has(normalizedName)) {throw new CompileFailure('candidate_name_duplicate');}
            names.add(normalizedName);
            if (candidates.length >= CANDIDATE_OUTPUT_LIMIT) {
                throw new CompileFailure('collection_exceeds_limit');
            }
            candidates.push(candidate);
            sourceIndexes.push(index);
        } catch (error) {
            const reason = error instanceof CompileFailure ? error.reason : 'field_type_invalid';
            skipped.push(report('candidates', index, reason));
        }
    }

    if (root.candidates.length > 0 && !candidates.length) {
        return {
            ok: false,
            status: 'failed',
            changed: false,
            applied: [],
            skipped,
            warnings: [...new Set(warnings)],
            hint: REASON_HINTS[skipped[0].reason as TaskCompileReason],
        };
    }

    const unchanged = sameCandidates(candidates, currentCandidates);
    const applied = candidates.map((_, index): TaskCompileItemReport => ({
        collection: 'candidates',
        index: sourceIndexes[index],
        id: unchanged ? currentCandidates[index].candidateId : '',
        changed: !unchanged,
    }));
    const partial = skipped.length > 0 || (candidates.length > 0 && candidates.length < 3);
    if (candidates.length > 0 && candidates.length < 3) {warnings.push('candidate_count_below_target');}

    return {
        ok: true,
        status: partial ? 'partial' : unchanged ? 'unchanged' : 'updated',
        changed: !unchanged,
        applied,
        skipped,
        warnings: [...new Set(warnings)],
        data: unchanged
            ? { mode: 'unchanged', candidates: currentCandidates }
            : { mode: 'replace', candidates },
    };
}
