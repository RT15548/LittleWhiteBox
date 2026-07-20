export const TAVERN_TASK_CURRENT_MARKER = 'current' as const;
export const TAVERN_TASK_PLAYER_PARTY_ID = 'player' as const;

export const TAVERN_TASK_GRADES = ['E', 'D', 'C', 'B', 'A', 'S', 'EX'] as const;
export type TavernTaskBoardGrade = typeof TAVERN_TASK_GRADES[number];
export type TavernTaskGrade = TavernTaskBoardGrade | 'CUSTOM';

export type TavernTaskStatus = 'recruiting' | 'active' | 'completed' | 'failed' | 'cancelled';
export type TavernTaskPartyKind = 'player' | 'world';
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

export interface TavernTaskListingIssuer {
    id: string;
    name: string;
    description: string;
}

export interface TavernTaskListing {
    id: string;
    grade: TavernTaskBoardGrade;
    tags: string[];
    title: string;
    issuer: TavernTaskListingIssuer;
    hook: string;
    objective: string;
    requirements?: string;
    location: string;
    risk: string;
    reward: number;
}

export interface TavernTaskBoardRecord {
    sessionId: string;
    generationId: string;
    revision: number;
    anchorOrder: number;
    listings: TavernTaskListing[];
    generatedAt: number;
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
    hook?: string;

    progressSummary: string;
    resultSummary: string;
    candidates: TavernTaskCandidate[];

    sourceBoardId?: string;
    sourceListingId?: string;
    sourceBoardRevision?: number;
    anchorOrder: number;
    createdAt: number;
    updatedAt: number;
}

export interface TavernTaskStagedAction {
    actionId: string;
    taskId: string;
    expectedRevision: number;
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
    | 'task_transition_invalid'
    | 'task_player_only'
    | 'task_task_not_recruiting'
    | 'task_task_not_active'
    | 'task_staging_invalid'
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
    listingId: string;
    anchorOrder: number;
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
    anchorOrder: number;
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
    candidates: TavernTaskCandidate[];
    anchorOrder: number;
    actionId: string;
}

export interface SelectTavernTaskCandidateInput {
    sessionId: string;
    taskId: string;
    expectedRevision: number;
    candidateId: string;
    anchorOrder: number;
    actionId: string;
}

export interface CancelTavernTaskInput {
    sessionId: string;
    taskId: string;
    expectedRevision: number;
    anchorOrder: number;
    actionId: string;
}

export interface ProgressTavernTaskInput {
    sessionId: string;
    taskId: string;
    expectedRevision: number;
    progressSummary: string;
    anchorOrder: number;
    actionId: string;
}

export interface CompleteTavernTaskInput {
    sessionId: string;
    taskId: string;
    expectedRevision: number;
    resultSummary: string;
    anchorOrder: number;
    actionId: string;
}

export interface FailTavernTaskInput {
    sessionId: string;
    taskId: string;
    expectedRevision: number;
    resultSummary: string;
    anchorOrder: number;
    actionId: string;
}

export interface TaskBoardParseOptions {
    excludedTitles?: string[];
    excludedIssuerNames?: string[];
    existingTitles?: string[];
    knownNames?: string[];
    createId?: (prefix: string) => string;
}

export interface TaskCandidateParseOptions {
    excludedNames?: string[];
    knownNames?: string[];
    createId?: (prefix: string) => string;
}

const DEFAULT_BOARD_MIN_LISTINGS = 6;
const DEFAULT_BOARD_MAX_LISTINGS = 6;
const DEFAULT_CANDIDATE_MIN = 3;
const DEFAULT_CANDIDATE_MAX = 4;
const MAX_SAFE_TEXT = 8_000;

export const TAVERN_TASK_GRADE_REWARD_RANGES: Readonly<Record<TavernTaskBoardGrade, readonly [number, number]>> = {
    E: [5, 15],
    D: [16, 40],
    C: [41, 100],
    B: [101, 250],
    A: [251, 600],
    S: [601, 1_500],
    EX: [1_501, 5_000],
};

export type TavernTaskRecipeRole =
    | 'grounded'
    | 'investigation_social'
    | 'dangerous'
    | 'moral_gray'
    | 'strange'
    | 'wildcard';

export interface TavernTaskRecipeSlot {
    role: TavernTaskRecipeRole;
    archetype: string;
    instruction: string;
}

const TAVERN_TASK_RECIPE_POOLS: Readonly<Record<TavernTaskRecipeRole, readonly Omit<TavernTaskRecipeSlot, 'role'>[]>> = {
    grounded: [
        { archetype: 'delivery', instruction: '一项普通、贴地气的跑腿、运送或代办委托。' },
        { archetype: 'repair', instruction: '一项围绕修理、补给或恢复日常秩序的具体委托。' },
        { archetype: 'search', instruction: '一项看似普通但有明确对象与地点的寻找委托。' },
        { archetype: 'escort', instruction: '一项低调、现实且有明确终点的护送或陪同委托。' },
    ],
    investigation_social: [
        { archetype: 'investigation', instruction: '一项需要查证线索、辨别真假或追踪来源的调查委托。' },
        { archetype: 'negotiation', instruction: '一项需要谈判、斡旋或说服具体对象的社交委托。' },
        { archetype: 'infiltration-social', instruction: '一项需要以身份、关系或礼仪进入某个圈层的委托。' },
        { archetype: 'reputation', instruction: '一项围绕名誉、传闻或公开立场产生冲突的委托。' },
    ],
    dangerous: [
        { archetype: 'hunt', instruction: '一项存在明确人身危险的追捕、狩猎或清除委托。' },
        { archetype: 'rescue', instruction: '一项时间紧迫、环境危险的营救或撤离委托。' },
        { archetype: 'hazard-zone', instruction: '一项必须进入危险区域才能完成的委托。' },
        { archetype: 'defense', instruction: '一项需要抵御真实威胁、守住对象或地点的委托。' },
    ],
    moral_gray: [
        { archetype: 'smuggling', instruction: '一项涉及走私、规避监管或非法运输的灰色委托。' },
        { archetype: 'theft', instruction: '一项涉及盗取、掉包或秘密取回物品的委托。' },
        { archetype: 'blackmail', instruction: '一项涉及把柄、胁迫或利益交换的道德灰区委托。' },
        { archetype: 'sabotage', instruction: '一项需要破坏、误导或让某件事失败的灰色委托。' },
    ],
    strange: [
        { archetype: 'impossible-client', instruction: '一项委托人或受益者身份异常、但仍符合世界规则的古怪委托。' },
        { archetype: 'ritual-procedure', instruction: '一项步骤离奇、限制明确且不能随意省略的委托。' },
        { archetype: 'wrong-object', instruction: '一项围绕用途、归属或存在方式反常的物件展开的委托。' },
        { archetype: 'social-absurdity', instruction: '一项表面荒诞、实则会牵动真实关系与后果的委托。' },
    ],
    wildcard: [
        { archetype: 'world-specific', instruction: '自由发挥一项只有当前世界才会出现的具体委托。' },
        { archetype: 'faction-shift', instruction: '自由发挥一项会改变组织关系或地方局势的委托。' },
        { archetype: 'personal-stakes', instruction: '自由发挥一项小人物诉求会引出更大后果的委托。' },
        { archetype: 'unexpected-service', instruction: '自由发挥一项职业、服务或交换方式出人意料的委托。' },
    ],
};

function createLocalId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function text(value: unknown, limit: number, required = false): string {
    const normalized = String(value ?? '').replace(/\r\n?/g, '\n').trim().slice(0, limit);
    if (required && !normalized) {throwTavernTaskError('task_text_invalid');}
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
    const max = options.max ?? DEFAULT_CANDIDATE_MAX;
    const min = options.min ?? DEFAULT_CANDIDATE_MIN;
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
    const issuer = record.issuer && typeof record.issuer === 'object' && !Array.isArray(record.issuer)
        ? record.issuer as Record<string, unknown>
        : null;
    if (!issuer) {throwTavernTaskError('task_board_listing_invalid', 'issuer');}
    const requirements = text(record.requirements, MAX_SAFE_TEXT);
    const grade = normalizeTavernTaskBoardGrade(record.grade);
    const reward = normalizeTavernTaskReward(record.reward);
    const [minimumReward, maximumReward] = TAVERN_TASK_GRADE_REWARD_RANGES[grade];
    if (reward < minimumReward || reward > maximumReward) {
        throwTavernTaskError('task_reward_invalid', `${grade}:${reward}`);
    }
    return {
        id,
        grade,
        tags: normalizeTavernTaskTags(record.tags),
        title: text(record.title, 180, true),
        issuer: {
            id: text(issuer.id, 180) || `issuer-${id}`,
            name: text(issuer.name, 120, true),
            description: text(issuer.description, 2_000, true),
        },
        hook: text(record.hook, 2_000, true),
        objective: text(record.objective, MAX_SAFE_TEXT, true),
        ...(requirements ? { requirements } : {}),
        location: text(record.location, 600, true),
        risk: text(record.risk, 2_000, true),
        reward,
    };
}

export function normalizeTavernTaskListings(value: unknown, options: { min?: number; max?: number } = {}): TavernTaskListing[] {
    if (!Array.isArray(value)) {throwTavernTaskError('task_board_payload_invalid', 'tasks');}
    const max = options.max ?? DEFAULT_BOARD_MAX_LISTINGS;
    const min = options.min ?? DEFAULT_BOARD_MIN_LISTINGS;
    if (value.length < min || value.length > max) {throwTavernTaskError('task_board_payload_invalid', `${value.length}`);}
    const listings = value.map((item, index) => normalizeTavernTaskListing(item, `listing-${index + 1}`));
    const ids = new Set<string>();
    const titles = new Set<string>();
    for (const listing of listings) {
        if (ids.has(listing.id)) {throwTavernTaskError('task_board_listing_duplicate', listing.id);}
        ids.add(listing.id);
        const title = normalizeComparisonText(listing.title);
        if (titles.has(title)) {throwTavernTaskError('task_board_listing_duplicate', listing.title);}
        titles.add(title);
    }
    return listings;
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
                try {values.push(JSON.parse(source.slice(start, index + 1)));} catch { /* try next brace */ }
                start = index;
                break;
            }
        }
    }
    return values;
}

export function parseTavernTaskBoardResponse(value: string, options: TaskBoardParseOptions = {}): TavernTaskListing[] {
    const createId = options.createId || createLocalId;
    const excludedTitles = new Set([
        ...(options.excludedTitles || []),
        ...(options.existingTitles || []),
    ].map(normalizeComparisonText).filter(Boolean));
    const excludedIssuerNames = new Set([
        ...(options.excludedIssuerNames || []),
        ...(options.knownNames || []),
    ].map(normalizeComparisonText).filter(Boolean));
    for (const parsed of extractJsonValues(value)) {
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {continue;}
        const tasks = (parsed as Record<string, unknown>).tasks;
        if (!Array.isArray(tasks)) {continue;}
        try {
            const listings = normalizeTavernTaskListings(tasks, {
                min: DEFAULT_BOARD_MIN_LISTINGS,
                max: DEFAULT_BOARD_MAX_LISTINGS,
            });
            if (listings.some((listing) => excludedTitles.has(normalizeComparisonText(listing.title)))) {
                throwTavernTaskError('task_board_listing_duplicate', 'excluded_title');
            }
            if (listings.some((listing) => excludedIssuerNames.has(normalizeComparisonText(listing.issuer.name)))) {
                throwTavernTaskError('task_board_listing_invalid', 'excluded_issuer');
            }
            return listings.map((listing) => ({
                ...listing,
                id: createId('listing'),
                issuer: { ...listing.issuer, id: createId('issuer') },
            }));
        } catch {
            continue;
        }
    }
    throwTavernTaskError('task_response_invalid');
}

export function parseTavernTaskCandidatesResponse(value: string, options: TaskCandidateParseOptions = {}): TavernTaskCandidate[] {
    const createId = options.createId || createLocalId;
    const excludedNames = new Set([
        ...(options.excludedNames || []),
        ...(options.knownNames || []),
    ].map(normalizeComparisonText).filter(Boolean));
    for (const parsed of extractJsonValues(value)) {
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {continue;}
        const candidates = (parsed as Record<string, unknown>).candidates;
        if (!Array.isArray(candidates)) {continue;}
        try {
            const normalized = normalizeTavernTaskCandidates(candidates, {
                min: DEFAULT_CANDIDATE_MIN,
                max: DEFAULT_CANDIDATE_MAX,
                allowEmpty: true,
            });
            if (normalized.some((candidate) => excludedNames.has(normalizeComparisonText(candidate.name)))) {
                throwTavernTaskError('task_candidate_invalid', 'excluded_name');
            }
            return normalized.map((candidate) => ({ ...candidate, id: createId('candidate') }));
        } catch {
            continue;
        }
    }
    throwTavernTaskError('task_response_invalid');
}

export function normalizeTavernTaskBoardRecord(record: TavernTaskBoardRecord): TavernTaskBoardRecord {
    const sessionId = sessionIdentifier(record.sessionId);
    const generationId = text(record.generationId, 180, true);
    const revision = positiveSafeInteger(record.revision, 'task_board_revision_invalid');
    const anchorOrder = normalizeTavernTaskAnchorOrder(record.anchorOrder);
    const generatedAt = positiveSafeInteger(record.generatedAt, 'task_board_payload_invalid');
    return {
        sessionId,
        generationId,
        revision,
        anchorOrder,
        listings: normalizeTavernTaskListings(record.listings, {
            min: DEFAULT_BOARD_MIN_LISTINGS,
            max: DEFAULT_BOARD_MAX_LISTINGS,
        }),
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
    return {
        ...record,
        sessionId: sessionIdentifier(record.sessionId),
        taskId: text(record.taskId, 180, true),
        revision: positiveSafeInteger(record.revision, 'task_revision_invalid'),
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
        ...(text(record.hook, 2_000) ? { hook: text(record.hook, 2_000) } : {}),
        progressSummary: text(record.progressSummary, MAX_SAFE_TEXT),
        resultSummary: text(record.resultSummary, MAX_SAFE_TEXT),
        candidates: normalizeTavernTaskCandidates(record.candidates, {
            min: DEFAULT_CANDIDATE_MIN,
            max: DEFAULT_CANDIDATE_MAX,
            allowEmpty: true,
        }),
        ...(text(record.sourceBoardId, 180) ? { sourceBoardId: text(record.sourceBoardId, 180) } : {}),
        ...(text(record.sourceListingId, 180) ? { sourceListingId: text(record.sourceListingId, 180) } : {}),
        ...(record.sourceBoardRevision === undefined
            ? {}
            : { sourceBoardRevision: positiveSafeInteger(record.sourceBoardRevision, 'task_board_revision_invalid') }),
        anchorOrder: normalizeTavernTaskAnchorOrder(record.anchorOrder),
        createdAt: positiveSafeInteger(record.createdAt, 'task_response_invalid'),
        updatedAt: positiveSafeInteger(record.updatedAt, 'task_response_invalid'),
    };
}

function normalizeComparisonText(value: unknown): string {
    return String(value || '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

export function generateTavernTaskRecipe(options: { random?: () => number } = {}): TavernTaskRecipeSlot[] {
    const random = options.random || Math.random;
    const roles: TavernTaskRecipeRole[] = [
        'grounded',
        'investigation_social',
        'dangerous',
        'moral_gray',
        'strange',
        'wildcard',
    ];
    return roles.map((role) => {
        const pool = TAVERN_TASK_RECIPE_POOLS[role];
        const index = Math.min(pool.length - 1, Math.max(0, Math.floor(random() * pool.length)));
        return { role, ...pool[index] };
    });
}
