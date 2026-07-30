import db, {
    tavernEconomyAccountsTable,
    tavernEconomyTransactionsTable,
    tavernMessagesTable,
    tavernPetActionsTable,
    tavernPetCompanionTable,
    tavernPetJournalTable,
    tavernSessionsTable,
    type TavernSessionRecord,
} from '../session-db';
import {
    ensureTavernEconomyInCurrentDbTransaction,
    postTavernEconomyTransactionInCurrentDbTransaction,
} from '../economy/economy-service';
import {
    TAVERN_PLAYER_ACCOUNT_ID,
    TAVERN_SYSTEM_SINK_ACCOUNT_ID,
    type TavernEconomyTransactionRecord,
} from '../economy/economy-types';
import {
    assertTavernPhoneBoundaryInCurrentTransaction,
    tavernPhoneBoundaryAnchorOrder,
} from '../phone-boundary';
import {
    canonicalTavernPetStaticVerdict,
    isTavernPetVerdictText,
    renderTavernPetMilestoneJournal,
    renderTavernPetStatusJournal,
} from './pet-copy';
import {
    normalizeTavernPetChatResponse,
    normalizeTavernPetPlayerText,
} from './pet-chat';
import {
    assertTavernPetStateInvariant,
    parseCanonicalTavernPetActionRecord,
    parseCanonicalTavernPetCompanionRecord,
    parseCanonicalTavernPetJournalRecord,
} from './pet-invariants';
import {
    drawTavernPetOrigin,
    tavernPetRandomSource,
    type TavernPetRandomSource,
} from './pet-random';
import {
    applyTavernPetChatResponse,
    applyTavernPetInteraction,
    createTavernPetLuringState,
    renameTavernPetState,
    resolveTavernPetEvolutionState,
    setTavernPetInterferenceState,
    TAVERN_PET_INTERACTION_COSTS,
    wakeTavernPetState,
} from './pet-rules';
import {
    TAVERN_PET_COMPANION_ID,
    TAVERN_PET_INSUFFICIENT_FUNDS_REASON,
    type CommitTavernPetChatResponseInput,
    type InteractWithTavernPetInput,
    type LetTavernPetLeaveInput,
    type LureTavernPetInput,
    type RenameTavernPetInput,
    type ResolveTavernPetEvolutionInput,
    type SetTavernPetInterferenceInput,
    type TavernPetActionReceipt,
    type TavernPetActionRecord,
    type TavernPetCompanionReceipt,
    type TavernPetCompanionRecord,
    type TavernPetEvolutionRequest,
    type TavernPetInteractionId,
    type TavernPetJournalDraft,
    type TavernPetJournalRecord,
    type TavernPetMutationBoundary,
    type TavernPetMutationResult,
    type TavernPetPrivateChatSnapshot,
    type TavernPetState,
    type TavernPetStateAction,
    type WakeTavernPetInput,
    throwTavernPetError,
} from './pet-types';
import { createTavernPetView } from './pet-view';

const DEFAULT_JOURNAL_LIMIT = 30;
const MAX_JOURNAL_LIMIT = 100;
const RECENT_MEMORY_JOURNAL_PAGE_SIZE = 16;
const RECENT_MEMORY_JOURNAL_LIMIT = 5;

interface TavernPetPaymentSpec {
    idempotencyKey: string;
    amount: number;
    kind: 'pet_upkeep' | 'pet_wake';
    title: string;
    note: string;
    sourceId: string;
}

interface TavernPetPlayerMutationPlan {
    action: TavernPetStateAction;
    state: TavernPetState;
    journal?: TavernPetJournalDraft;
}

interface TavernPetPlayerMutationOptions {
    payment: TavernPetPaymentSpec | null;
    replayMatches: (record: TavernPetActionRecord) => boolean;
    build: (input: {
        current: TavernPetCompanionRecord | null;
        session: TavernSessionRecord;
        currentPetTurn: number;
        playerBalance: number;
    }) => TavernPetPlayerMutationPlan;
}

interface TavernPetJournalRangeCollection {
    reverse(): TavernPetJournalRangeCollection;
    limit(amount: number): TavernPetJournalRangeCollection;
    toArray(): Promise<TavernPetJournalRecord[]>;
}

interface TavernPetJournalReadTable {
    orderBy(index: string): TavernPetJournalRangeCollection;
    where(index: string): {
        between(
            lower: unknown,
            upper: unknown,
            includeLower?: boolean,
            includeUpper?: boolean,
        ): TavernPetJournalRangeCollection;
    };
    bulkGet(ids: readonly string[]): Promise<Array<TavernPetJournalRecord | undefined>>;
}

interface TavernPetClearTable {
    clear(): Promise<void>;
}

export interface ListTavernPetJournalOptions {
    limit?: number;
    beforeCreatedAt?: number | null;
    sourceSessionId?: string;
}

function now(): number {
    return Date.now();
}

function createId(prefix: string): string {
    return [prefix, String(now()), Math.random().toString(36).slice(2, 9)].join('-');
}

function clone<T>(value: T): T {
    if (typeof structuredClone === 'function') {return structuredClone(value);}
    return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeSessionId(value = ''): string {
    const sessionId = String(value || '').trim();
    if (!sessionId || [...sessionId].length > 240) {throwTavernPetError('pet_session_required');}
    return sessionId;
}

function normalizeActionId(value = ''): string {
    const actionId = String(value || '').trim();
    if (!actionId || [...actionId].length > 240) {throwTavernPetError('pet_action_required');}
    return actionId;
}

function normalizeExpectedRevision(value: unknown): number {
    const revision = Number(value);
    if (!Number.isSafeInteger(revision) || revision < 0) {
        throwTavernPetError('pet_revision_invalid', String(value));
    }
    return revision;
}

function normalizeExpectedVersionId(value: unknown, expectedRevision: number): string {
    const versionId = String(value ?? '').trim();
    if (expectedRevision === 0) {
        if (versionId) {throwTavernPetError('pet_version_id_invalid', versionId);}
        return '';
    }
    if (!versionId || [...versionId].length > 240) {
        throwTavernPetError('pet_version_id_invalid', versionId);
    }
    return versionId;
}

function normalizeTurn(value: unknown): number {
    const turn = Number(value);
    if (!Number.isSafeInteger(turn) || turn < 0) {throwTavernPetError('pet_turn_invalid', String(value));}
    return turn;
}

function sessionTurn(session: TavernSessionRecord): number {
    return normalizeTurn(session.state?.turn ?? 0);
}

function normalizeVisibleText(
    value: unknown,
    maximum: number,
    options: { allowEmpty?: boolean; preserveNewlines?: boolean } = {},
): string {
    let text = String(value ?? '')
        .normalize('NFKC')
        .replace(/\r\n?/gu, '\n')
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/gu, '');
    text = options.preserveNewlines
        ? text.replace(/[^\S\n]+/gu, ' ').replace(/ *\n */gu, '\n')
        : text.replace(/\s+/gu, ' ');
    text = text.trim();
    if ((!options.allowEmpty && !text) || [...text].length > maximum) {
        throwTavernPetError('pet_chat_invalid', String(maximum));
    }
    return text;
}

function normalizePetName(value: unknown): string | undefined {
    const text = normalizeVisibleText(value, 12, { allowEmpty: true });
    if (!text) {return undefined;}
    if (/[\n\r]/u.test(text)) {throwTavernPetError('pet_name_invalid');}
    return text;
}

function normalizePlayerText(value: unknown): string {
    const text = normalizeTavernPetPlayerText(value);
    if (!text) {throwTavernPetError('pet_chat_invalid', 'player-text');}
    return text;
}

type TavernPetDirectInteractionId = Exclude<TavernPetInteractionId, 'lure' | 'chat' | 'wake'>;

function isTavernPetDirectInteractionId(value: unknown): value is TavernPetDirectInteractionId {
    return value === 'feed'
        || value === 'tap-shell'
        || value === 'play-bgm'
        || value === 'pat'
        || value === 'hit'
        || value === 'toy';
}

function isTavernPetPaidInteractionId(
    value: TavernPetDirectInteractionId,
): value is 'feed' | 'toy' {
    return value === 'feed' || value === 'toy';
}

function sameJson(left: unknown, right: unknown): boolean {
    return JSON.stringify(left) === JSON.stringify(right);
}

function normalizeMutationBoundary(input: TavernPetMutationBoundary): TavernPetMutationBoundary & {
    sourceAnchorOrder: number;
} {
    const expectedRevision = normalizeExpectedRevision(input.expectedRevision);
    return {
        sessionId: normalizeSessionId(input.sessionId),
        boundary: input.boundary,
        actionId: normalizeActionId(input.actionId),
        expectedRevision,
        expectedVersionId: normalizeExpectedVersionId(input.expectedVersionId, expectedRevision),
        sourceAnchorOrder: tavernPhoneBoundaryAnchorOrder(input.boundary),
    };
}

function companionReceipt(record: TavernPetCompanionRecord | null): TavernPetCompanionReceipt | null {
    if (!record) {return null;}
    return {
        id: record.id,
        revision: record.revision,
        versionId: record.versionId,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}

function actionReceipt(record: TavernPetActionRecord | null): TavernPetActionReceipt | null {
    if (!record) {return null;}
    return {
        id: record.id,
        revision: record.revision,
        sourceSessionId: record.sourceSessionId,
        sourceTurn: record.sourceTurn,
        sourceAnchorOrder: record.sourceAnchorOrder,
        action: clone(record.action),
        ...(record.activityId ? { activityId: record.activityId } : {}),
        createdAt: record.createdAt,
    };
}

export async function getTavernPetCompanionInCurrentDbTransaction(): Promise<TavernPetCompanionRecord | null> {
    const row = await tavernPetCompanionTable.get(TAVERN_PET_COMPANION_ID);
    return row ? parseCanonicalTavernPetCompanionRecord(row) : null;
}

export async function findTavernPetActionInCurrentDbTransaction(
    actionId: string,
): Promise<TavernPetActionRecord | null> {
    const row = await tavernPetActionsTable.get(normalizeActionId(actionId));
    return row ? parseCanonicalTavernPetActionRecord(row) : null;
}

async function listJournalInCurrentTransaction(
    options: ListTavernPetJournalOptions = {},
): Promise<TavernPetJournalRecord[]> {
    const limit = Math.min(
        MAX_JOURNAL_LIMIT,
        Math.max(1, Math.floor(Number(options.limit) || DEFAULT_JOURNAL_LIMIT)),
    );
    const before = Number(options.beforeCreatedAt);
    const hasBefore = options.beforeCreatedAt !== null
        && options.beforeCreatedAt !== undefined
        && Number.isSafeInteger(before)
        && before >= 0;
    const sourceSessionId = options.sourceSessionId === undefined
        ? ''
        : normalizeSessionId(options.sourceSessionId);
    const table = tavernPetJournalTable as unknown as TavernPetJournalReadTable;
    const rows = sourceSessionId
        ? await table
            .where('[sourceSessionId+createdAt+id]')
            .between(
                [sourceSessionId, 0, ''],
                hasBefore
                    ? [sourceSessionId, before, '']
                    : [sourceSessionId, Number.MAX_SAFE_INTEGER, '\uffff'],
                true,
                !hasBefore,
            )
            .reverse()
            .limit(limit)
            .toArray()
        : await (hasBefore
            ? table
                .where('[createdAt+id]')
                .between([0, ''], [before, ''], true, false)
            : table.orderBy('[createdAt+id]'))
            .reverse()
            .limit(limit)
            .toArray();
    return rows.map((row) => parseCanonicalTavernPetJournalRecord(row));
}

async function listRecentPetMemoriesInCurrentTransaction(): Promise<TavernPetJournalRecord[]> {
    const table = tavernPetJournalTable as unknown as TavernPetJournalReadTable;
    const memories: TavernPetJournalRecord[] = [];
    let upper: [number, string] = [Number.MAX_SAFE_INTEGER, '\uffff'];
    let includeUpper = true;
    while (memories.length < RECENT_MEMORY_JOURNAL_LIMIT) {
        const page = await table
            .where('[createdAt+id]')
            .between([0, ''], upper, true, includeUpper)
            .reverse()
            .limit(RECENT_MEMORY_JOURNAL_PAGE_SIZE)
            .toArray();
        if (!page.length) {break;}
        for (const row of page) {
            const journal = parseCanonicalTavernPetJournalRecord(row);
            if (journal.detail.kind !== 'chat') {memories.push(journal);}
            if (memories.length >= RECENT_MEMORY_JOURNAL_LIMIT) {break;}
        }
        if (memories.length >= RECENT_MEMORY_JOURNAL_LIMIT || page.length < RECENT_MEMORY_JOURNAL_PAGE_SIZE) {
            break;
        }
        const oldest = page.at(-1);
        if (!oldest) {break;}
        upper = [oldest.createdAt, oldest.id];
        includeUpper = false;
    }
    return memories;
}

async function currentPlayerBalanceInTransaction(sessionId: string): Promise<number> {
    const account = await tavernEconomyAccountsTable.get([sessionId, TAVERN_PLAYER_ACCOUNT_ID]);
    if (!account || !Number.isSafeInteger(account.balance) || account.balance < 0) {
        throwTavernPetError('pet_state_invalid', 'player-balance');
    }
    return account.balance;
}

async function buildMutationResultInCurrentTransaction(input: {
    session: TavernSessionRecord;
    current: TavernPetCompanionRecord | null;
    actionRecord: TavernPetActionRecord | null;
    replay: boolean;
    changed: boolean;
}): Promise<TavernPetMutationResult> {
    const [journal, playerBalance] = await Promise.all([
        listJournalInCurrentTransaction(),
        currentPlayerBalanceInTransaction(input.session.id),
    ]);
    return {
        companion: companionReceipt(input.current),
        actionRecord: actionReceipt(input.actionRecord),
        view: createTavernPetView({
            companion: input.current,
            journal,
            playerBalance,
        }),
        playerBalance,
        journal: clone(journal),
        replay: input.replay,
        changed: input.changed,
    };
}

async function findPaymentTransaction(
    sessionId: string,
    idempotencyKey: string,
): Promise<TavernEconomyTransactionRecord | null> {
    const rows = await tavernEconomyTransactionsTable
        .where('[sessionId+idempotencyKey]')
        .equals([sessionId, idempotencyKey])
        .toArray();
    return rows[0] || null;
}

function assertPaymentTransaction(
    transaction: TavernEconomyTransactionRecord | null,
    sessionId: string,
    sourceAnchorOrder: number,
    payment: TavernPetPaymentSpec,
): TavernEconomyTransactionRecord {
    if (!transaction
        || transaction.sessionId !== sessionId
        || transaction.idempotencyKey !== payment.idempotencyKey
        || transaction.fromAccountId !== TAVERN_PLAYER_ACCOUNT_ID
        || transaction.toAccountId !== TAVERN_SYSTEM_SINK_ACCOUNT_ID
        || transaction.amount !== payment.amount
        || transaction.kind !== payment.kind
        || transaction.title !== payment.title
        || transaction.note !== payment.note
        || transaction.sourceDomain !== 'pet'
        || transaction.sourceId !== payment.sourceId
        || transaction.anchorOrder !== sourceAnchorOrder
    ) {
        throwTavernPetError('pet_action_conflict', payment.idempotencyKey);
    }
    return transaction;
}

async function assertReplayArtifacts(
    replay: TavernPetActionRecord,
    payment: TavernPetPaymentSpec | null,
): Promise<void> {
    const journalRows = (await tavernPetJournalTable
        .where('sourceActionId')
        .equals(replay.id)
        .toArray())
        .map((row) => parseCanonicalTavernPetJournalRecord(row));
    if (replay.activityId) {
        const journal = journalRows[0] || null;
        if (!journal
            || journalRows.length !== 1
            || journal.id !== replay.activityId
            || journal.sourceSessionId !== replay.sourceSessionId
            || journal.sourceTurn !== replay.sourceTurn
            || journal.sourceAnchorOrder !== replay.sourceAnchorOrder
        ) {
            throwTavernPetError('pet_action_conflict', replay.id);
        }
    } else if (journalRows.length) {
        throwTavernPetError('pet_action_conflict', replay.id);
    }
    if (payment) {
        assertPaymentTransaction(
            await findPaymentTransaction(replay.sourceSessionId, payment.idempotencyKey),
            replay.sourceSessionId,
            replay.sourceAnchorOrder,
            payment,
        );
    }
}

function buildCompanion(input: {
    current: TavernPetCompanionRecord | null;
    state: TavernPetState;
    timestamp: number;
}): TavernPetCompanionRecord {
    assertTavernPetStateInvariant(input.state);
    return parseCanonicalTavernPetCompanionRecord({
        id: TAVERN_PET_COMPANION_ID,
        revision: input.current ? input.current.revision + 1 : 1,
        versionId: createId('pet-companion'),
        state: clone(input.state),
        createdAt: input.current?.createdAt ?? input.timestamp,
        updatedAt: input.timestamp,
    });
}

function buildJournal(input: {
    id: string;
    sourceActionId: string;
    sourceSessionId: string;
    sourceTurn: number;
    sourceAnchorOrder: number;
    petTurn: number;
    draft: TavernPetJournalDraft;
    timestamp: number;
}): TavernPetJournalRecord {
    return parseCanonicalTavernPetJournalRecord({
        id: input.id,
        sourceActionId: input.sourceActionId,
        sourceSessionId: input.sourceSessionId,
        sourceTurn: input.sourceTurn,
        sourceAnchorOrder: input.sourceAnchorOrder,
        petTurn: input.petTurn,
        detail: clone(input.draft.detail),
        coinDelta: input.draft.coinDelta,
        ...(input.draft.notificationText ? { notificationText: input.draft.notificationText } : {}),
        createdAt: input.timestamp,
    });
}

function buildAction(input: {
    id: string;
    companion: TavernPetCompanionRecord;
    sourceSessionId: string;
    sourceTurn: number;
    sourceAnchorOrder: number;
    action: TavernPetStateAction;
    activityId?: string;
    timestamp: number;
}): TavernPetActionRecord {
    return parseCanonicalTavernPetActionRecord({
        id: input.id,
        revision: input.companion.revision,
        sourceSessionId: input.sourceSessionId,
        sourceTurn: input.sourceTurn,
        sourceAnchorOrder: input.sourceAnchorOrder,
        action: clone(input.action),
        ...(input.activityId ? { activityId: input.activityId } : {}),
        createdAt: input.timestamp,
    });
}

export async function appendTavernPetTransitionInCurrentDbTransaction(input: {
    current: TavernPetCompanionRecord | null;
    actionId: string;
    sourceSessionId: string;
    sourceTurn: number;
    sourceAnchorOrder: number;
    action: TavernPetStateAction;
    state: TavernPetState;
    journal?: TavernPetJournalDraft;
    timestamp?: number;
}): Promise<{
    companion: TavernPetCompanionRecord;
    action: TavernPetActionRecord;
    journal: TavernPetJournalRecord | null;
}> {
    const timestamp = input.timestamp ?? now();
    const companion = buildCompanion({
        current: input.current,
        state: input.state,
        timestamp,
    });
    const activityId = input.journal ? createId('pet-journal') : undefined;
    const action = buildAction({
        id: normalizeActionId(input.actionId),
        companion,
        sourceSessionId: normalizeSessionId(input.sourceSessionId),
        sourceTurn: normalizeTurn(input.sourceTurn),
        sourceAnchorOrder: normalizeTurn(input.sourceAnchorOrder),
        action: input.action,
        ...(activityId ? { activityId } : {}),
        timestamp,
    });
    const journal = input.journal && activityId
        ? buildJournal({
            id: activityId,
            sourceActionId: action.id,
            sourceSessionId: action.sourceSessionId,
            sourceTurn: action.sourceTurn,
            sourceAnchorOrder: action.sourceAnchorOrder,
            petTurn: companion.state.petTurn,
            draft: input.journal,
            timestamp,
        })
        : null;
    await (tavernPetActionsTable as unknown as {
        add(record: TavernPetActionRecord): Promise<unknown>;
    }).add(action);
    if (journal) {
        await (tavernPetJournalTable as unknown as {
            add(record: TavernPetJournalRecord): Promise<unknown>;
        }).add(journal);
    }
    await tavernPetCompanionTable.put(companion);
    return { companion: clone(companion), action: clone(action), journal: journal ? clone(journal) : null };
}

function assertCompanionCas(
    current: TavernPetCompanionRecord | null,
    expectedRevision: number,
    expectedVersionId: string,
): void {
    if (!current) {
        if (expectedRevision !== 0) {
            throwTavernPetError('pet_revision_conflict', [String(expectedRevision), 'empty'].join(':'));
        }
        if (expectedVersionId) {throwTavernPetError('pet_version_conflict', expectedVersionId);}
        return;
    }
    if (current.revision !== expectedRevision) {
        throwTavernPetError(
            'pet_revision_conflict',
            [String(expectedRevision), String(current.revision)].join(':'),
        );
    }
    if (current.versionId !== expectedVersionId) {
        throwTavernPetError('pet_version_conflict', [expectedVersionId, current.versionId].join(':'));
    }
}

async function runTavernPetPlayerMutation(
    boundaryInput: TavernPetMutationBoundary,
    options: TavernPetPlayerMutationOptions,
): Promise<TavernPetMutationResult> {
    const input = normalizeMutationBoundary(boundaryInput);
    return await db.transaction(
        'rw',
        tavernMessagesTable,
        tavernSessionsTable,
        tavernPetCompanionTable,
        tavernPetActionsTable,
        tavernPetJournalTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        async () => {
            const session = await tavernSessionsTable.get(input.sessionId);
            if (!session) {throwTavernPetError('pet_session_missing', input.sessionId);}
            const replay = await findTavernPetActionInCurrentDbTransaction(input.actionId);
            if (replay) {
                if (replay.sourceSessionId !== input.sessionId
                    || replay.sourceAnchorOrder !== input.sourceAnchorOrder
                    || !options.replayMatches(replay)
                ) {
                    throwTavernPetError('pet_action_conflict', input.actionId);
                }
                await ensureTavernEconomyInCurrentDbTransaction(input.sessionId);
                await assertReplayArtifacts(replay, options.payment);
                const current = await getTavernPetCompanionInCurrentDbTransaction();
                if (!current) {throwTavernPetError('pet_history_invalid', 'replay-companion-missing');}
                return await buildMutationResultInCurrentTransaction({
                    session,
                    current,
                    actionRecord: replay,
                    replay: true,
                    changed: false,
                });
            }
            await assertTavernPhoneBoundaryInCurrentTransaction(input.sessionId, input.boundary);
            const current = await getTavernPetCompanionInCurrentDbTransaction();
            assertCompanionCas(current, input.expectedRevision, input.expectedVersionId);
            const economy = await ensureTavernEconomyInCurrentDbTransaction(input.sessionId);
            const plan = options.build({
                current,
                session,
                currentPetTurn: current?.state.petTurn ?? 0,
                playerBalance: economy.playerBalance,
            });
            if (options.payment) {
                const transaction = await postTavernEconomyTransactionInCurrentDbTransaction({
                    sessionId: input.sessionId,
                    idempotencyKey: options.payment.idempotencyKey,
                    fromAccountId: TAVERN_PLAYER_ACCOUNT_ID,
                    toAccountId: TAVERN_SYSTEM_SINK_ACCOUNT_ID,
                    amount: options.payment.amount,
                    kind: options.payment.kind,
                    title: options.payment.title,
                    note: options.payment.note,
                    sourceDomain: 'pet',
                    sourceId: options.payment.sourceId,
                    anchorOrder: input.sourceAnchorOrder,
                }, { touchSessionOnCreate: false });
                assertPaymentTransaction(
                    transaction,
                    input.sessionId,
                    input.sourceAnchorOrder,
                    options.payment,
                );
            }
            const appended = await appendTavernPetTransitionInCurrentDbTransaction({
                current,
                actionId: input.actionId,
                sourceSessionId: input.sessionId,
                sourceTurn: sessionTurn(session),
                sourceAnchorOrder: input.sourceAnchorOrder,
                action: plan.action,
                state: plan.state,
                ...(plan.journal ? { journal: plan.journal } : {}),
            });
            await tavernSessionsTable.update(input.sessionId, { updatedAt: now() });
            return await buildMutationResultInCurrentTransaction({
                session,
                current: appended.companion,
                actionRecord: appended.action,
                replay: false,
                changed: true,
            });
        },
    );
}

function upkeepPayment(actionId: string, sourceId: 'lure' | 'feed' | 'toy'): TavernPetPaymentSpec {
    const amount = TAVERN_PET_INTERACTION_COSTS[sourceId];
    return {
        idempotencyKey: sourceId === 'lure'
            ? ['pet', 'lure', actionId].join(':')
            : ['pet', 'upkeep', actionId].join(':'),
        amount,
        kind: 'pet_upkeep',
        title: sourceId === 'lure' ? '放下住户食物' : sourceId === 'feed' ? '投喂住户' : '给住户玩具',
        note: sourceId === 'lure' ? '在暗室角落放下一点食物。' : sourceId === 'feed' ? '给住户投喂食物。' : '给住户一个玩具。',
        sourceId,
    };
}

function wakePayment(actionId: string): TavernPetPaymentSpec {
    return {
        idempotencyKey: ['pet', 'wake', actionId].join(':'),
        amount: TAVERN_PET_INTERACTION_COSTS.wake,
        kind: 'pet_wake',
        title: '唤醒住户',
        note: '让休眠的住户重新活动。',
        sourceId: 'wake',
    };
}

export async function getCurrentTavernPetView(sessionId = '') {
    return (await getTavernPetSnapshot(sessionId)).view;
}

/**
 * Reads the Companion projection and its observable Journal from one database
 * transaction so a Phone refresh cannot combine different Companion revisions.
 */
export async function getTavernPetSnapshot(sessionId = ''): Promise<{
    view: ReturnType<typeof createTavernPetView>;
    journal: TavernPetJournalRecord[];
}> {
    const id = normalizeSessionId(sessionId);
    return await db.transaction(
        'rw',
        tavernSessionsTable,
        tavernPetCompanionTable,
        tavernPetJournalTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        async () => {
            const session = await tavernSessionsTable.get(id);
            if (!session) {throwTavernPetError('pet_session_missing', id);}
            const [companion, journal, economy] = await Promise.all([
                getTavernPetCompanionInCurrentDbTransaction(),
                listJournalInCurrentTransaction(),
                ensureTavernEconomyInCurrentDbTransaction(id),
            ]);
            return {
                view: createTavernPetView({
                    companion,
                    journal,
                    playerBalance: economy.playerBalance,
                }),
                journal: clone(journal),
            };
        },
    );
}

export async function getTavernPetPrivateSnapshotForChat(
    sessionId = '',
): Promise<TavernPetPrivateChatSnapshot | null> {
    const id = normalizeSessionId(sessionId);
    return await db.transaction(
        'r',
        tavernSessionsTable,
        tavernPetCompanionTable,
        tavernPetJournalTable,
        async () => {
            const [session, companion, recentJournal] = await Promise.all([
                tavernSessionsTable.get(id),
                getTavernPetCompanionInCurrentDbTransaction(),
                listRecentPetMemoriesInCurrentTransaction(),
            ]);
            if (!session) {throwTavernPetError('pet_session_missing', id);}
            if (!companion) {return null;}
            return { companion: clone(companion), recentJournal: clone(recentJournal) };
        },
    );
}

export async function getTavernPetPendingEvolutionRequest(
    sessionId = '',
): Promise<TavernPetEvolutionRequest | null> {
    const id = normalizeSessionId(sessionId);
    const [session, companion] = await Promise.all([
        tavernSessionsTable.get(id),
        getTavernPetCompanionInCurrentDbTransaction(),
    ]);
    if (!session) {throwTavernPetError('pet_session_missing', id);}
    return companion?.state.pendingEvolution ? clone(companion.state.pendingEvolution) : null;
}

export async function listTavernPetJournal(
    options: ListTavernPetJournalOptions = {},
): Promise<TavernPetJournalRecord[]> {
    return clone(await listJournalInCurrentTransaction(options));
}

export async function listTavernPetJournalByIds(
    journalIds: readonly string[] = [],
): Promise<TavernPetJournalRecord[]> {
    const ids = [...new Set(journalIds.map((value) => String(value || '').trim()).filter(Boolean))];
    if (!ids.length) {return [];}
    const rows = await (tavernPetJournalTable as unknown as TavernPetJournalReadTable).bulkGet(ids);
    return rows.flatMap((row) => row ? [parseCanonicalTavernPetJournalRecord(row)] : []);
}

export async function lureTavernPet(
    rawInput: LureTavernPetInput,
    random: TavernPetRandomSource = tavernPetRandomSource,
): Promise<TavernPetMutationResult> {
    const input = normalizeMutationBoundary(rawInput);
    const payment = upkeepPayment(input.actionId, 'lure');
    return await runTavernPetPlayerMutation(input, {
        payment,
        replayMatches: (record) => record.action.kind === 'lure',
        build: ({ current, playerBalance }) => {
            if (current) {throwTavernPetError('pet_state_exists');}
            if (payment.amount > playerBalance) {
                throwTavernPetError('pet_interaction_unavailable', TAVERN_PET_INSUFFICIENT_FUNDS_REASON);
            }
            const origin = drawTavernPetOrigin(random);
            return {
                action: { kind: 'lure', origin: clone(origin) },
                state: createTavernPetLuringState({ origin, petTurn: 0 }),
            };
        },
    });
}

export async function interactWithTavernPet(
    rawInput: InteractWithTavernPetInput,
): Promise<TavernPetMutationResult> {
    const input = normalizeMutationBoundary(rawInput);
    const rawInteractionId: unknown = rawInput.interactionId;
    if (!isTavernPetDirectInteractionId(rawInteractionId)) {
        throwTavernPetError('pet_interaction_invalid', String(rawInteractionId));
    }
    const interactionId = rawInteractionId;
    const cost = TAVERN_PET_INTERACTION_COSTS[interactionId];
    const payment = isTavernPetPaidInteractionId(interactionId)
        ? upkeepPayment(input.actionId, interactionId)
        : null;
    return await runTavernPetPlayerMutation(input, {
        payment,
        replayMatches: (record) => record.action.kind === 'interact'
            && record.action.interactionId === interactionId,
        build: ({ current, currentPetTurn, playerBalance }) => {
            if (!current) {throwTavernPetError('pet_state_missing');}
            if (cost > playerBalance) {
                throwTavernPetError('pet_interaction_unavailable', TAVERN_PET_INSUFFICIENT_FUNDS_REASON);
            }
            const transition = applyTavernPetInteraction(current.state, interactionId, currentPetTurn);
            return {
                action: { kind: 'interact', interactionId },
                state: transition.state,
            };
        },
    });
}

export async function wakeTavernPet(
    rawInput: WakeTavernPetInput,
): Promise<TavernPetMutationResult> {
    const input = normalizeMutationBoundary(rawInput);
    const payment = wakePayment(input.actionId);
    return await runTavernPetPlayerMutation(input, {
        payment,
        replayMatches: (record) => record.action.kind === 'wake',
        build: ({ current, currentPetTurn, playerBalance }) => {
            if (!current) {throwTavernPetError('pet_state_missing');}
            if (payment.amount > playerBalance) {
                throwTavernPetError('pet_interaction_unavailable', TAVERN_PET_INSUFFICIENT_FUNDS_REASON);
            }
            const state = wakeTavernPetState(current.state, currentPetTurn);
            return {
                action: { kind: 'wake' },
                state,
                journal: renderTavernPetStatusJournal('woke', state),
            };
        },
    });
}

export async function renameTavernPet(
    rawInput: RenameTavernPetInput,
): Promise<TavernPetMutationResult> {
    const input = normalizeMutationBoundary(rawInput);
    let petName: string | undefined;
    try {
        petName = normalizePetName(rawInput.petName);
    } catch (error) {
        if (error instanceof Error) {throwTavernPetError('pet_name_invalid', error.message);}
        throw error;
    }
    return await runTavernPetPlayerMutation(input, {
        payment: null,
        replayMatches: (record) => record.action.kind === 'rename'
            && record.action.petName === petName,
        build: ({ current }) => {
            if (!current) {throwTavernPetError('pet_state_missing');}
            return {
                action: { kind: 'rename', ...(petName ? { petName } : {}) },
                state: renameTavernPetState(current.state, petName),
            };
        },
    });
}

export async function setTavernPetInterferenceEnabled(
    rawInput: SetTavernPetInterferenceInput,
): Promise<TavernPetMutationResult> {
    const input = normalizeMutationBoundary(rawInput);
    const enabled = rawInput.enabled === true;
    return await runTavernPetPlayerMutation(input, {
        payment: null,
        replayMatches: (record) => record.action.kind === 'toggle-interference'
            && record.action.enabled === enabled,
        build: ({ current }) => {
            if (!current) {throwTavernPetError('pet_state_missing');}
            return {
                action: { kind: 'toggle-interference', enabled },
                state: setTavernPetInterferenceState(current.state, enabled),
            };
        },
    });
}

export async function commitTavernPetChatResponse(
    rawInput: CommitTavernPetChatResponseInput,
): Promise<TavernPetMutationResult> {
    const input = normalizeMutationBoundary(rawInput);
    const playerText = normalizePlayerText(rawInput.playerText);
    const rawResponse = clone(rawInput.response);
    return await runTavernPetPlayerMutation(input, {
        payment: null,
        replayMatches: (record) => record.action.kind === 'chat'
            && record.action.playerText === playerText
            && sameJson(record.action.response, rawResponse),
        build: ({ current, currentPetTurn }) => {
            if (!current) {throwTavernPetError('pet_state_missing');}
            const response = normalizeTavernPetChatResponse(rawResponse, current.state);
            const transition = applyTavernPetChatResponse(
                current.state,
                currentPetTurn,
                playerText,
                response,
            );
            return {
                action: {
                    kind: 'chat',
                    playerText,
                    response,
                    appliedAxes: transition.appliedAxes,
                },
                state: transition.state,
                journal: {
                    detail: {
                        kind: 'chat',
                        playerText,
                        petText: response.text,
                        face: response.face,
                        motion: response.motion,
                        ...(response.murmur ? { murmur: response.murmur } : {}),
                    },
                    coinDelta: 0,
                },
            };
        },
    });
}

export async function resolveTavernPetEvolution(
    rawInput: ResolveTavernPetEvolutionInput,
): Promise<TavernPetMutationResult> {
    const sessionId = normalizeSessionId(rawInput.sessionId);
    const requestId = normalizeActionId(rawInput.requestId);
    const verdict = normalizeVisibleText(rawInput.verdict, 80);
    if (!isTavernPetVerdictText(verdict)) {throwTavernPetError('pet_chat_invalid', 'verdict');}
    const usedFallback = rawInput.usedFallback === true;
    const actionId = ['pet', 'evolution', requestId].join(':');
    return await db.transaction(
        'rw',
        tavernMessagesTable,
        tavernSessionsTable,
        tavernPetCompanionTable,
        tavernPetActionsTable,
        tavernPetJournalTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        async () => {
            const session = await tavernSessionsTable.get(sessionId);
            if (!session) {throwTavernPetError('pet_session_missing', sessionId);}
            await ensureTavernEconomyInCurrentDbTransaction(sessionId);
            const replay = await findTavernPetActionInCurrentDbTransaction(actionId);
            if (replay) {
                if (replay.action.kind !== 'resolve-evolution'
                    || replay.action.requestId !== requestId
                ) {
                    throwTavernPetError('pet_action_conflict', actionId);
                }
                await assertReplayArtifacts(replay, null);
                const current = await getTavernPetCompanionInCurrentDbTransaction();
                if (!current) {throwTavernPetError('pet_history_invalid', 'evolution-companion-missing');}
                return await buildMutationResultInCurrentTransaction({
                    session,
                    current,
                    actionRecord: replay,
                    replay: true,
                    changed: false,
                });
            }
            const current = await getTavernPetCompanionInCurrentDbTransaction();
            if (!current) {throwTavernPetError('pet_state_missing');}
            const pending = current.state.pendingEvolution;
            if (!pending || pending.requestId !== requestId) {
                throwTavernPetError('pet_evolution_stale', requestId);
            }
            if (usedFallback && verdict !== canonicalTavernPetStaticVerdict(pending.personaId)) {
                throwTavernPetError('pet_chat_invalid', 'fallback-verdict');
            }
            const state = resolveTavernPetEvolutionState(current.state, requestId);
            const journal = renderTavernPetMilestoneJournal({
                milestoneId: pending.milestoneId,
                state,
                petTurn: pending.sourcePetTurn,
                sourceAnchorOrder: pending.sourceAnchorOrder,
                personaId: pending.personaId,
                verdict,
            });
            const appended = await appendTavernPetTransitionInCurrentDbTransaction({
                current,
                actionId,
                sourceSessionId: pending.sourceSessionId,
                sourceTurn: pending.sourceTurn,
                sourceAnchorOrder: pending.sourceAnchorOrder,
                action: { kind: 'resolve-evolution', requestId, verdict, usedFallback },
                state,
                journal,
            });
            return await buildMutationResultInCurrentTransaction({
                session,
                current: appended.companion,
                actionRecord: appended.action,
                replay: false,
                changed: true,
            });
        },
    );
}

export async function letTavernPetLeave(
    rawInput: LetTavernPetLeaveInput,
): Promise<TavernPetMutationResult> {
    const sessionId = normalizeSessionId(rawInput.sessionId);
    const expectedRevision = normalizeExpectedRevision(rawInput.expectedRevision);
    const expectedVersionId = normalizeExpectedVersionId(rawInput.expectedVersionId, expectedRevision);
    return await db.transaction(
        'rw',
        tavernMessagesTable,
        tavernSessionsTable,
        tavernPetCompanionTable,
        tavernPetActionsTable,
        tavernPetJournalTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        async () => {
            const session = await tavernSessionsTable.get(sessionId);
            if (!session) {throwTavernPetError('pet_session_missing', sessionId);}
            await assertTavernPhoneBoundaryInCurrentTransaction(sessionId, rawInput.boundary);
            const current = await getTavernPetCompanionInCurrentDbTransaction();
            assertCompanionCas(current, expectedRevision, expectedVersionId);
            await ensureTavernEconomyInCurrentDbTransaction(sessionId);
            await Promise.all([
                (tavernPetCompanionTable as unknown as TavernPetClearTable).clear(),
                (tavernPetActionsTable as unknown as TavernPetClearTable).clear(),
                (tavernPetJournalTable as unknown as TavernPetClearTable).clear(),
            ]);
            await tavernSessionsTable.update(sessionId, { updatedAt: now() });
            return await buildMutationResultInCurrentTransaction({
                session,
                current: null,
                actionRecord: null,
                replay: false,
                changed: Boolean(current),
            });
        },
    );
}
