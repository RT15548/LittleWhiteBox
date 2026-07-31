import type {
    TavernExpectedPhoneBoundary,
    TavernPhoneBoundary,
} from '../phone-boundary';

export const TAVERN_TASK_CURRENT_MARKER = 'current' as const;
export const TAVERN_TASK_PLAYER_PARTY_ID = 'player' as const;

export type TavernTaskPhoneBoundary = TavernPhoneBoundary;
export type TavernTaskExpectedPhoneBoundary = TavernExpectedPhoneBoundary;

export const TAVERN_TASK_GRADES = ['E', 'D', 'C', 'B', 'A', 'S', 'EX'] as const;
export type TavernTaskBoardGrade = typeof TAVERN_TASK_GRADES[number];
export type TavernTaskGrade = TavernTaskBoardGrade | 'CUSTOM';

export type TavernTaskStatus = 'recruiting' | 'active' | 'completed' | 'failed' | 'cancelled';
export type TavernTaskPartyKind = 'player' | 'world';
export const TAVERN_TASK_DIRECTIONS = ['禁忌', '接触', '夹缝', '窥秘', '掠夺', '怪癖'] as const;
export type TavernTaskDirection = typeof TAVERN_TASK_DIRECTIONS[number];
export const TAVERN_TASK_POSTURES = ['易介入', '中介入', '深介入'] as const;
export type TavernTaskPosture = typeof TAVERN_TASK_POSTURES[number];
export type TavernTaskTiming = '现在就行' | '任意时候' | `特定时机：${string}`;

export const TAVERN_TASK_DIRECTION_REWARD_RANGES: Readonly<Record<TavernTaskDirection, readonly [number, number]>> = {
    禁忌: [150, 350],
    接触: [40, 80],
    夹缝: [100, 200],
    窥秘: [60, 120],
    掠夺: [80, 150],
    怪癖: [15, 40],
};
export type TavernTaskMutationKind =
    | 'accept'
    | 'publish'
    | 'candidate_refresh'
    | 'select'
    | 'cancel'
    | 'progress'
    | 'complete'
    | 'fail';

export interface TavernTaskWorldParty {
    kind: 'world';
    id: string;
    name: string;
    description: string;
    pitch?: string;
    capability?: string;
    risk?: string;
}

export interface TavernTaskPlayerParty {
    kind: 'player';
    id: typeof TAVERN_TASK_PLAYER_PARTY_ID;
    name: string;
}

export type TavernTaskParty = TavernTaskWorldParty | TavernTaskPlayerParty;

export interface TavernTaskListing {
    id: string;
    grade: TavernTaskBoardGrade;
    tags: string[];
    /**
     * Compatibility: upstream boards and character archive v9 predate intervention metadata.
     * Remove the optional branch only when those records are no longer supported.
     */
    posture?: TavernTaskPosture;
    title: string;
    hook: string;
    objective: string;
    requirements?: string;
    location: string;
    /** Same compatibility boundary as posture. */
    timing?: TavernTaskTiming;
    risk: string;
    reward: number;
}

export interface TavernTaskBoardRecord {
    sessionId: string;
    generationId: string;
    revision: number;
    /** Session-owned, monotonically increasing CAS epoch. */
    epoch: number;
    anchorOrder: number;
    listings: TavernTaskListing[];
    generatedAt: number;
}

export interface TavernTaskBoardState {
    board: TavernTaskBoardRecord | null;
    revision: number;
    epoch: number;
}

export interface TavernTaskCandidate {
    id: string;
    name: string;
    description: string;
    pitch: string;
    capability: string;
    risk: string;
}

export interface TavernTaskVersionRecord {
    sessionId: string;
    taskId: string;
    revision: number;
    /** Non-reusable identity for this incarnation of the version. */
    versionId: string;
    currentMarker?: typeof TAVERN_TASK_CURRENT_MARKER;
    actionId: string;

    status: TavernTaskStatus;
    issuer: TavernTaskParty;
    assignee?: TavernTaskParty;
    reward: number;
    escrowAccountId: string;

    title: string;
    objective: string;
    requirements?: string;
    location: string;
    risk: string;
    grade: TavernTaskGrade;
    tags: string[];
    /** Present on generated world tasks accepted from current boards; absent on player-issued and pre-metadata records. */
    posture?: TavernTaskPosture;
    /** Same ownership and compatibility boundary as posture. */
    timing?: TavernTaskTiming;
    hook?: string;

    progressSummary: string;
    resultSummary: string;
    candidates: TavernTaskCandidate[];

    sourceBoardId?: string;
    sourceListingId?: string;
    sourceBoardRevision?: number;
    sourceBoardEpoch?: number;
    anchorOrder: number;
    createdAt: number;
    updatedAt: number;
}

export interface TavernTaskStagedAction {
    actionId: string;
    taskId: string;
    expectedRevision: number;
    expectedVersionId: string;
    resultVersionId?: string;
    kind: Extract<TavernTaskMutationKind, 'progress' | 'complete' | 'fail'>;
    anchorOrder: number;
    progressSummary?: string;
    resultSummary?: string;
}

export interface TavernTaskStagingContext {
    sessionId: string;
    anchorOrder: number;
    actions: TavernTaskStagedAction[];
    projected: Map<string, TavernTaskVersionRecord>;
    projectedByAction: Map<string, TavernTaskVersionRecord>;
}

export interface TavernTaskAnchorSnapshot {
    sessionId: string;
    anchorOrder: number;
    tasks: TavernTaskVersionRecord[];
}

export interface TavernTaskRestoreImpact {
    changed: boolean;
    targetFloor: number;
    deletedVersionCount: number;
    affectedTaskCount: number;
    clearedBoard: boolean;
}

export type TavernTaskErrorCode =
    | 'task_session_required'
    | 'task_session_missing'
    | 'task_board_missing'
    | 'task_board_revision_invalid'
    | 'task_board_revision_conflict'
    | 'task_board_epoch_invalid'
    | 'task_board_epoch_conflict'
    | 'task_board_generation_conflict'
    | 'task_board_empty'
    | 'task_board_payload_invalid'
    | 'task_board_listing_invalid'
    | 'task_board_listing_duplicate'
    | 'task_listing_missing'
    | 'task_listing_already_accepted'
    | 'task_action_required'
    | 'task_action_conflict'
    | 'task_id_required'
    | 'task_id_invalid'
    | 'task_missing'
    | 'task_revision_invalid'
    | 'task_revision_conflict'
    | 'task_version_id_invalid'
    | 'task_version_conflict'
    | 'task_status_invalid'
    | 'task_candidate_missing'
    | 'task_candidate_invalid'
    | 'task_candidate_duplicate'
    | 'task_candidates_invalid'
    | 'task_publish_invalid'
    | 'task_party_invalid'
    | 'task_text_invalid'
    | 'task_grade_invalid'
    | 'task_reward_invalid'
    | 'task_anchor_order_invalid'
    | 'task_anchor_order_regression'
    | 'task_timeline_conflict'
    | 'task_transition_invalid'
    | 'task_player_only'
    | 'task_task_not_recruiting'
    | 'task_task_not_active'
    | 'task_staging_invalid'
    | 'task_response_json_invalid'
    | 'task_response_shape_invalid'
    | 'task_response_items_invalid'
    | 'task_response_truncated'
    | 'task_response_invalid';

export class TavernTaskError extends Error {
    readonly code: TavernTaskErrorCode;

    constructor(code: TavernTaskErrorCode, detail = '') {
        super(detail ? `${code}:${detail}` : code);
        this.name = 'TavernTaskError';
        this.code = code;
    }
}

export function throwTavernTaskError(code: TavernTaskErrorCode, detail = ''): never {
    throw new TavernTaskError(code, detail);
}

export interface AcceptTavernTaskListingInput {
    sessionId: string;
    boardId?: string;
    generationId?: string;
    boardRevision: number;
    boardEpoch: number;
    listingId: string;
    boundary: TavernTaskExpectedPhoneBoundary;
    actionId: string;
    taskId?: string;
    playerName?: string;
}

export interface PublishTavernTaskInput {
    sessionId: string;
    title: string;
    objective: string;
    requirements?: string;
    location: string;
    risk?: string;
    reward: number;
    boundary: TavernTaskExpectedPhoneBoundary;
    actionId: string;
    taskId?: string;
    playerName?: string;
    grade?: TavernTaskGrade;
    tags?: string[];
}

export interface UpdateTavernTaskCandidatesInput {
    sessionId: string;
    taskId: string;
    expectedRevision: number;
    expectedVersionId: string;
    candidates: TavernTaskCandidate[];
    boundary: TavernTaskExpectedPhoneBoundary;
    actionId: string;
}

export interface SelectTavernTaskCandidateInput {
    sessionId: string;
    taskId: string;
    expectedRevision: number;
    expectedVersionId: string;
    candidateId: string;
    boundary: TavernTaskExpectedPhoneBoundary;
    actionId: string;
}

export interface CancelTavernTaskInput {
    sessionId: string;
    taskId: string;
    expectedRevision: number;
    expectedVersionId: string;
    boundary: TavernTaskExpectedPhoneBoundary;
    actionId: string;
}

export interface ProgressTavernTaskInput {
    sessionId: string;
    taskId: string;
    expectedRevision: number;
    expectedVersionId: string;
    progressSummary: string;
    anchorOrder: number;
    actionId: string;
}

export interface CompleteTavernTaskInput {
    sessionId: string;
    taskId: string;
    expectedRevision: number;
    expectedVersionId: string;
    resultSummary: string;
    anchorOrder: number;
    actionId: string;
}

export interface FailTavernTaskInput {
    sessionId: string;
    taskId: string;
    expectedRevision: number;
    expectedVersionId: string;
    resultSummary: string;
    anchorOrder: number;
    actionId: string;
}

export interface TaskBoardParseOptions {
    createId?: (prefix: string) => string;
    warn?: (message: string) => void;
}

export interface TaskCandidateParseOptions {
    createId?: (prefix: string) => string;
}

const MAX_SAFE_TEXT = 8_000;
const GENERATED_TASK_TEXT_LIMITS = {
    title: 12,
    hook: 120,
    tag: 16,
    objective: 48,
    requirements: 64,
    location: 48,
    timing: 40,
    risk: 64,
} as const;

export const TAVERN_TASK_GRADE_REWARD_RANGES: Readonly<Record<TavernTaskBoardGrade, readonly [number, number]>> = {
    E: [5, 15],
    D: [16, 40],
    C: [41, 100],
    B: [101, 250],
    A: [251, 600],
    S: [601, 1_500],
    EX: [1_501, 5_000],
};

function createLocalId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function text(value: unknown, limit: number, required = false): string {
    const normalized = String(value ?? '').replace(/\r\n?/g, '\n').trim().slice(0, limit);
    if (required && !normalized) {throwTavernTaskError('task_text_invalid');}
    return normalized;
}

function generatedTaskText(
    value: unknown,
    field: keyof typeof GENERATED_TASK_TEXT_LIMITS,
    required = true,
): string {
    if (value === undefined || value === null) {
        if (required) {throwTavernTaskError('task_board_listing_invalid', field);}
        return '';
    }
    if (typeof value !== 'string') {throwTavernTaskError('task_board_listing_invalid', field);}
    const normalized = value.replace(/\s+/gu, ' ').trim();
    const length = [...normalized].length;
    if ((required && !normalized) || length > GENERATED_TASK_TEXT_LIMITS[field]) {
        throwTavernTaskError('task_board_listing_invalid', field);
    }
    return normalized;
}

function sessionIdentifier(value: unknown): string {
    const id = String(value ?? '').replace(/\r\n?/g, '\n').trim();
    if (!id) {throwTavernTaskError('task_session_required');}
    return id;
}

function positiveSafeInteger(value: unknown, code: TavernTaskErrorCode): number {
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number <= 0) {throwTavernTaskError(code, String(value));}
    return number;
}

export function normalizeTavernTaskAnchorOrder(value: unknown): number {
    const order = Number(value);
    if (!Number.isSafeInteger(order) || order < -1) {throwTavernTaskError('task_anchor_order_invalid', String(value));}
    return order;
}

export function normalizeTavernTaskBoardGrade(value: unknown): TavernTaskBoardGrade {
    const grade = String(value || '').trim().toUpperCase() as TavernTaskBoardGrade;
    if (!TAVERN_TASK_GRADES.includes(grade)) {throwTavernTaskError('task_grade_invalid', String(value));}
    return grade;
}

export function normalizeTavernTaskGrade(value: unknown): TavernTaskGrade {
    const grade = String(value || '').trim().toUpperCase();
    if (grade === 'CUSTOM') {return 'CUSTOM';}
    return normalizeTavernTaskBoardGrade(grade);
}

export function normalizeTavernTaskReward(value: unknown): number {
    return positiveSafeInteger(value, 'task_reward_invalid');
}

export function normalizeTavernTaskTags(value: unknown): string[] {
    if (value === undefined || value === null) {return [];}
    if (!Array.isArray(value)) {throwTavernTaskError('task_board_listing_invalid', 'tags');}
    const tags = value
        .map((item) => text(item, 40, true))
        .filter(Boolean)
        .slice(0, 8);
    return [...new Set(tags)];
}

function normalizeGeneratedTaskTags(value: unknown): string[] {
    if (!Array.isArray(value) || value.length < 1 || value.length > 4) {
        throwTavernTaskError('task_board_listing_invalid', 'tags');
    }
    const tags = value.map((item) => generatedTaskText(item, 'tag'));
    if (new Set(tags).size !== tags.length) {
        throwTavernTaskError('task_board_listing_invalid', 'tags_duplicate');
    }
    return tags;
}

export function normalizeTavernTaskPosture(value: unknown): TavernTaskPosture {
    if (typeof value !== 'string') {throwTavernTaskError('task_board_listing_invalid', 'posture');}
    const posture = value.trim() as TavernTaskPosture;
    if (!TAVERN_TASK_POSTURES.includes(posture)) {
        throwTavernTaskError('task_board_listing_invalid', 'posture');
    }
    return posture;
}

export function normalizeTavernTaskTiming(value: unknown, posture?: TavernTaskPosture): TavernTaskTiming {
    const timing = generatedTaskText(value, 'timing');
    if (timing !== '现在就行' && timing !== '任意时候' && !/^特定时机：\S/u.test(timing)) {
        throwTavernTaskError('task_board_listing_invalid', 'timing');
    }
    if (posture === '易介入' && timing.startsWith('特定时机：')) {
        throwTavernTaskError('task_board_listing_invalid', 'easy_posture_timing');
    }
    return timing as TavernTaskTiming;
}

export function normalizeTavernTaskCandidate(value: unknown, idFallback = ''): TavernTaskCandidate {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throwTavernTaskError('task_candidate_invalid');
    }
    const record = value as Record<string, unknown>;
    const id = text(record.id, 160) || idFallback;
    if (!id) {throwTavernTaskError('task_candidate_invalid', 'id');}
    return {
        id,
        name: text(record.name, 120, true),
        description: text(record.description, 2_000, true),
        pitch: text(record.pitch, 2_000, true),
        capability: text(record.capability, 2_000, true),
        risk: text(record.risk, 2_000, true),
    };
}

export function normalizeTavernTaskCandidates(
    value: unknown,
    options: { min?: number; max?: number; allowEmpty?: boolean } = {},
): TavernTaskCandidate[] {
    if (!Array.isArray(value)) {throwTavernTaskError('task_candidates_invalid');}
    const max = options.max ?? Number.MAX_SAFE_INTEGER;
    const min = options.min ?? 0;
    if (value.length === 0 && options.allowEmpty === false) {
        throwTavernTaskError('task_candidates_invalid', '0');
    }
    if ((value.length !== 0 || options.allowEmpty === false) && (value.length < min || value.length > max)) {
        throwTavernTaskError('task_candidates_invalid', `${value.length}`);
    }
    const candidates = value.map((item, index) => normalizeTavernTaskCandidate(item, `candidate-${index + 1}`));
    const ids = new Set<string>();
    const names = new Set<string>();
    for (const candidate of candidates) {
        if (ids.has(candidate.id)) {throwTavernTaskError('task_candidate_duplicate', candidate.id);}
        ids.add(candidate.id);
        const name = normalizeComparisonText(candidate.name);
        if (names.has(name)) {throwTavernTaskError('task_candidate_duplicate', candidate.name);}
        names.add(name);
    }
    return candidates;
}

export function normalizeTavernTaskListing(value: unknown, idFallback = ''): TavernTaskListing {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throwTavernTaskError('task_board_listing_invalid');
    }
    const record = value as Record<string, unknown>;
    const id = text(record.id, 180) || idFallback;
    if (!id) {throwTavernTaskError('task_board_listing_invalid', 'id');}
    const requirements = generatedTaskText(record.requirements, 'requirements', false);
    if (typeof record.grade !== 'string') {throwTavernTaskError('task_board_listing_invalid', 'grade');}
    if (typeof record.reward !== 'number') {throwTavernTaskError('task_board_listing_invalid', 'reward');}
    const grade = normalizeTavernTaskBoardGrade(record.grade);
    const reward = normalizeTavernTaskReward(record.reward);
    const posture = normalizeTavernTaskPosture(record.posture);
    const timing = normalizeTavernTaskTiming(record.timing, posture);
    const tags = normalizeGeneratedTaskTags(record.tags);
    const direction = tags[0] as TavernTaskDirection | undefined;
    if (!direction || !TAVERN_TASK_DIRECTIONS.includes(direction)) {
        throwTavernTaskError('task_board_listing_invalid', 'direction');
    }
    const [directionMinimumReward, directionMaximumReward] = TAVERN_TASK_DIRECTION_REWARD_RANGES[direction];
    if (reward < directionMinimumReward || reward > directionMaximumReward) {
        throwTavernTaskError('task_reward_invalid', `${direction}:${reward}`);
    }
    const [minimumReward, maximumReward] = TAVERN_TASK_GRADE_REWARD_RANGES[grade];
    if (reward < minimumReward || reward > maximumReward) {
        throwTavernTaskError('task_reward_invalid', `${grade}:${reward}`);
    }
    return {
        id,
        grade,
        tags,
        posture,
        title: generatedTaskText(record.title, 'title'),
        hook: generatedTaskText(record.hook, 'hook'),
        objective: generatedTaskText(record.objective, 'objective'),
        ...(requirements ? { requirements } : {}),
        location: generatedTaskText(record.location, 'location'),
        timing,
        risk: generatedTaskText(record.risk, 'risk'),
        reward,
    };
}

export function normalizeTavernTaskListings(value: unknown, options: { min?: number; max?: number } = {}): TavernTaskListing[] {
    if (!Array.isArray(value)) {throwTavernTaskError('task_board_payload_invalid', 'tasks');}
    const max = options.max ?? Number.MAX_SAFE_INTEGER;
    const min = options.min ?? 0;
    if (value.length < min || value.length > max) {throwTavernTaskError('task_board_payload_invalid', `${value.length}`);}
    const listings = value.map((item, index) => normalizeTavernTaskListing(item, `listing-${index + 1}`));
    const ids = new Set<string>();
    for (const listing of listings) {
        if (ids.has(listing.id)) {throwTavernTaskError('task_board_listing_duplicate', listing.id);}
        ids.add(listing.id);
    }
    return listings;
}

function parseJsonCandidate(value: string): unknown {
    try {return JSON.parse(value);} catch { /* try one conservative repair */ }
    return JSON.parse(value.replace(/,(\s*[}\]])/g, '$1'));
}

function extractJsonValues(textValue: string): unknown[] {
    const source = String(textValue || '');
    const values: unknown[] = [];
    for (let start = 0; start < source.length; start += 1) {
        if (source[start] !== '{') {continue;}
        let depth = 0;
        let quoted = false;
        let escaped = false;
        for (let index = start; index < source.length; index += 1) {
            const character = source[index];
            if (quoted) {
                if (escaped) {escaped = false;}
                else if (character === '\\') {escaped = true;}
                else if (character === '"') {quoted = false;}
                continue;
            }
            if (character === '"') {quoted = true; continue;}
            if (character === '{') {depth += 1;}
            if (character === '}') {depth -= 1;}
            if (depth === 0) {
                try {values.push(parseJsonCandidate(source.slice(start, index + 1)));} catch { /* try next brace */ }
                start = index;
                break;
            }
        }
    }
    return values;
}

export function parseTavernTaskBoardResponse(value: string, options: TaskBoardParseOptions = {}): TavernTaskListing[] {
    const createId = options.createId || createLocalId;
    const warn = options.warn || ((message: string) => console.warn(`[LittleWhiteBox/tasks] ${message}`));
    const parsedValues = extractJsonValues(value);
    if (!parsedValues.length) {throwTavernTaskError('task_response_json_invalid');}
    let foundTasksArray = false;
    for (const parsed of parsedValues) {
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {continue;}
        const tasks = (parsed as Record<string, unknown>).tasks;
        if (!Array.isArray(tasks)) {continue;}
        foundTasksArray = true;
        const listings: TavernTaskListing[] = [];
        const directions = new Set<TavernTaskDirection>();
        for (let index = 0; index < tasks.length; index += 1) {
            try {
                const listing = normalizeTavernTaskListing(tasks[index], `listing-${index + 1}`);
                const direction = listing.tags[0] as TavernTaskDirection;
                if (directions.has(direction)) {throwTavernTaskError('task_board_listing_duplicate', direction);}
                directions.add(direction);
                listings.push({
                    ...listing,
                    id: createId('listing'),
                });
            } catch (error) {
                const detail = error instanceof Error ? error.message : String(error || 'invalid');
                warn(`task_board_listing_dropped:index=${index + 1}:${detail}`);
            }
        }
        if (listings.length) {
            listings.sort((left, right) => (
                TAVERN_TASK_DIRECTIONS.indexOf(left.tags[0] as TavernTaskDirection)
                - TAVERN_TASK_DIRECTIONS.indexOf(right.tags[0] as TavernTaskDirection)
            ));
            const missingDirections = TAVERN_TASK_DIRECTIONS.filter((direction) => !directions.has(direction));
            if (missingDirections.length) {
                warn(`task_board_direction_quota_mismatch:missing=${missingDirections.join(',')}`);
            }
            const counts = new Map(TAVERN_TASK_POSTURES.map((posture) => [
                posture,
                listings.filter((listing) => listing.posture === posture).length,
            ]));
            if (counts.get('易介入') !== 3 || counts.get('中介入') !== 2 || counts.get('深介入') !== 1) {
                warn(`task_board_posture_quota_mismatch:easy=${counts.get('易介入') || 0},medium=${counts.get('中介入') || 0},deep=${counts.get('深介入') || 0}`);
            }
            return listings;
        }
    }
    if (!foundTasksArray) {throwTavernTaskError('task_response_shape_invalid', 'tasks_must_be_array');}
    throwTavernTaskError('task_response_items_invalid', 'tasks');
}

export function parseTavernTaskCandidatesResponse(value: string, options: TaskCandidateParseOptions = {}): TavernTaskCandidate[] {
    const createId = options.createId || createLocalId;
    const parsedValues = extractJsonValues(value);
    if (!parsedValues.length) {throwTavernTaskError('task_response_json_invalid');}
    let foundCandidatesArray = false;
    for (const parsed of parsedValues) {
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {continue;}
        const candidates = (parsed as Record<string, unknown>).candidates;
        if (!Array.isArray(candidates)) {continue;}
        foundCandidatesArray = true;
        if (!candidates.length) {return [];}
        const normalized: TavernTaskCandidate[] = [];
        const names = new Set<string>();
        for (let index = 0; index < candidates.length; index += 1) {
            try {
                const candidate = normalizeTavernTaskCandidate(candidates[index], `candidate-${index + 1}`);
                const name = normalizeComparisonText(candidate.name);
                if (names.has(name)) {continue;}
                names.add(name);
                normalized.push({ ...candidate, id: createId('candidate') });
            } catch { /* keep other valid entries */ }
        }
        if (normalized.length) {return normalized;}
    }
    if (!foundCandidatesArray) {throwTavernTaskError('task_response_shape_invalid', 'candidates_must_be_array');}
    throwTavernTaskError('task_response_items_invalid', 'candidates');
}

export function normalizeTavernTaskBoardRecord(record: TavernTaskBoardRecord): TavernTaskBoardRecord {
    const sessionId = sessionIdentifier(record.sessionId);
    const generationId = text(record.generationId, 180, true);
    const revision = positiveSafeInteger(record.revision, 'task_board_revision_invalid');
    const epoch = positiveSafeInteger(record.epoch, 'task_board_epoch_invalid');
    const anchorOrder = normalizeTavernTaskAnchorOrder(record.anchorOrder);
    const generatedAt = positiveSafeInteger(record.generatedAt, 'task_board_payload_invalid');
    return {
        sessionId,
        generationId,
        revision,
        epoch,
        anchorOrder,
        listings: normalizeTavernTaskListings(record.listings),
        generatedAt,
    };
}

export function normalizeTavernTaskParty(value: unknown, options: { allowMissing?: boolean } = {}): TavernTaskParty | undefined {
    if ((value === undefined || value === null) && options.allowMissing) {return undefined;}
    if (!value || typeof value !== 'object' || Array.isArray(value)) {throwTavernTaskError('task_party_invalid');}
    const record = value as Record<string, unknown>;
    const kind = String(record.kind || '').trim();
    if (kind === 'player') {
        return {
            kind: 'player',
            id: TAVERN_TASK_PLAYER_PARTY_ID,
            name: text(record.name, 120) || '玩家',
        };
    }
    if (kind === 'world') {
        const pitch = text(record.pitch, 2_000);
        const capability = text(record.capability, 2_000);
        const risk = text(record.risk, 2_000);
        return {
            kind: 'world',
            id: text(record.id, 180, true),
            name: text(record.name, 120, true),
            description: text(record.description, 2_000, true),
            ...(pitch ? { pitch } : {}),
            ...(capability ? { capability } : {}),
            ...(risk ? { risk } : {}),
        };
    }
    throwTavernTaskError('task_party_invalid', kind);
}

export function normalizeTavernTaskVersionRecord(record: TavernTaskVersionRecord): TavernTaskVersionRecord {
    const issuer = normalizeTavernTaskParty(record.issuer);
    if (!issuer) {throwTavernTaskError('task_party_invalid', 'issuer');}
    const assignee = normalizeTavernTaskParty(record.assignee, { allowMissing: true });
    const statuses: TavernTaskStatus[] = ['recruiting', 'active', 'completed', 'failed', 'cancelled'];
    if (!statuses.includes(record.status)) {throwTavernTaskError('task_status_invalid', String(record.status));}
    if (record.currentMarker && record.currentMarker !== TAVERN_TASK_CURRENT_MARKER) {
        throwTavernTaskError('task_response_invalid', 'currentMarker');
    }
    if (record.status === 'recruiting' && issuer.kind !== 'player') {
        throwTavernTaskError('task_transition_invalid', 'recruiting_issuer');
    }
    if (record.status === 'cancelled' && issuer.kind !== 'player') {
        throwTavernTaskError('task_transition_invalid', 'cancelled_issuer');
    }
    if (record.status !== 'recruiting' && record.status !== 'cancelled' && !assignee) {
        throwTavernTaskError('task_transition_invalid', 'assignee_missing');
    }
    const currentMarker = record.currentMarker === TAVERN_TASK_CURRENT_MARKER
        ? TAVERN_TASK_CURRENT_MARKER
        : undefined;
    const posture = record.posture === undefined ? undefined : normalizeTavernTaskPosture(record.posture);
    const timing = record.timing === undefined ? undefined : normalizeTavernTaskTiming(record.timing, posture);
    if ((posture && !timing) || (!posture && timing)) {
        throwTavernTaskError('task_response_invalid', 'task_intervention_metadata');
    }
    return {
        ...record,
        sessionId: sessionIdentifier(record.sessionId),
        taskId: text(record.taskId, 180, true),
        revision: positiveSafeInteger(record.revision, 'task_revision_invalid'),
        versionId: text(record.versionId, 220, true),
        ...(currentMarker ? { currentMarker } : {}),
        actionId: text(record.actionId, 220, true),
        status: record.status,
        issuer,
        ...(assignee ? { assignee } : {}),
        reward: normalizeTavernTaskReward(record.reward),
        escrowAccountId: text(record.escrowAccountId, 220, true),
        title: text(record.title, 180, true),
        objective: text(record.objective, MAX_SAFE_TEXT, true),
        ...(text(record.requirements, MAX_SAFE_TEXT) ? { requirements: text(record.requirements, MAX_SAFE_TEXT) } : {}),
        location: text(record.location, 600, true),
        risk: text(record.risk, 2_000),
        grade: normalizeTavernTaskGrade(record.grade),
        tags: normalizeTavernTaskTags(record.tags),
        ...(posture ? { posture } : {}),
        ...(timing ? { timing } : {}),
        ...(text(record.hook, 2_000) ? { hook: text(record.hook, 2_000) } : {}),
        progressSummary: text(record.progressSummary, MAX_SAFE_TEXT),
        resultSummary: text(record.resultSummary, MAX_SAFE_TEXT),
        candidates: normalizeTavernTaskCandidates(record.candidates),
        ...(text(record.sourceBoardId, 180) ? { sourceBoardId: text(record.sourceBoardId, 180) } : {}),
        ...(text(record.sourceListingId, 180) ? { sourceListingId: text(record.sourceListingId, 180) } : {}),
        ...(record.sourceBoardRevision === undefined
            ? {}
            : { sourceBoardRevision: positiveSafeInteger(record.sourceBoardRevision, 'task_board_revision_invalid') }),
        ...(record.sourceBoardEpoch === undefined
            ? {}
            : { sourceBoardEpoch: positiveSafeInteger(record.sourceBoardEpoch, 'task_board_epoch_invalid') }),
        anchorOrder: normalizeTavernTaskAnchorOrder(record.anchorOrder),
        createdAt: positiveSafeInteger(record.createdAt, 'task_response_invalid'),
        updatedAt: positiveSafeInteger(record.updatedAt, 'task_response_invalid'),
    };
}

function normalizeComparisonText(value: unknown): string {
    return String(value || '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}
