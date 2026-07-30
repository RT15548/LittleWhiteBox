import db, {
    commitTavernAssistantResponseForLatestUserInCurrentDbTransaction,
    tavernCommunicationContactsTable,
    tavernEconomyAccountsTable,
    tavernEconomyTransactionsTable,
    tavernManagerCandidatesTable,
    tavernMessagesTable,
    tavernPetActionsTable,
    tavernPetCompanionTable,
    tavernPetJournalTable,
    tavernSessionsTable,
    type TavernAppendMessageInput,
    type TavernAssistantResponseCommitOptions,
    type TavernAssistantResponseCommitResult,
    type TavernCommunicationContactRecord,
    type TavernMessageIdentity,
    type TavernMessageRecord,
    type TavernSessionRecord,
} from '../session-db';
import {
    ensureTavernEconomyInCurrentDbTransaction,
    postTavernEconomyTransactionInCurrentDbTransaction,
} from '../economy/economy-service';
import {
    TAVERN_PLAYER_ACCOUNT_ID,
    TAVERN_SYSTEM_MINT_ACCOUNT_ID,
    TAVERN_SYSTEM_SINK_ACCOUNT_ID,
    type TavernEconomyAccountRecord,
    type TavernEconomyTransactionRecord,
} from '../economy/economy-types';
import {
    tavernPetRandomSource,
    type TavernPetRandomSource,
} from './pet-random';
import { advanceTavernPetTurn } from './pet-rules';
import {
    appendTavernPetTransitionInCurrentDbTransaction,
    findTavernPetActionInCurrentDbTransaction,
    getTavernPetCompanionInCurrentDbTransaction,
} from './pet-service';
import {
    parseCanonicalTavernPetActionRecord,
} from './pet-invariants';
import {
    type TavernPetActionRecord,
    type TavernPetCompanionRecord,
    type TavernPetTurnContext,
    throwTavernPetError,
} from './pet-types';

interface TavernStoryMessageRangeCollection {
    reverse(): TavernStoryMessageRangeCollection;
    filter(predicate: (message: TavernMessageRecord) => boolean): TavernStoryMessageRangeCollection;
    limit(amount: number): TavernStoryMessageRangeCollection;
    toArray(): Promise<TavernMessageRecord[]>;
}

interface TavernStoryMessageRangeTable {
    where(index: string): {
        between(
            lower: unknown,
            upper: unknown,
            includeLower?: boolean,
            includeUpper?: boolean,
        ): TavernStoryMessageRangeCollection;
    };
}

interface TavernPetActionRangeCollection {
    reverse(): TavernPetActionRangeCollection;
    first(): Promise<TavernPetActionRecord | undefined>;
}

interface TavernPetActionReadTable {
    where(index: string): {
        between(
            lower: unknown,
            upper: unknown,
            includeLower?: boolean,
            includeUpper?: boolean,
        ): TavernPetActionRangeCollection;
    };
}

interface TavernEconomyAnchorRangeCollection {
    toArray(): Promise<TavernEconomyTransactionRecord[]>;
}

interface TavernEconomyAnchorRangeTable {
    where(index: string): {
        between(
            lower: unknown,
            upper: unknown,
            includeLower?: boolean,
            includeUpper?: boolean,
        ): TavernEconomyAnchorRangeCollection;
    };
}

function clone<T>(value: T): T {
    if (typeof structuredClone === 'function') {return structuredClone(value);}
    return JSON.parse(JSON.stringify(value)) as T;
}

function sessionTurn(session: TavernSessionRecord): number {
    const turn = Number(session.state?.turn ?? 0);
    if (!Number.isSafeInteger(turn) || turn < 0) {
        throwTavernPetError('pet_turn_invalid', String(session.state?.turn));
    }
    return turn;
}

function normalizeContactName(value: unknown): string {
    return String(value || '')
        .normalize('NFKC')
        .replace(/[\u0000-\u001f\u007f-\u009f]/gu, '')
        .replace(/\s+/gu, ' ')
        .trim();
}

function countLiteralOccurrences(haystack: string, needle: string): number {
    const source = haystack.toLocaleLowerCase();
    const target = needle.toLocaleLowerCase();
    if (!target) {return 0;}
    let count = 0;
    let cursor = 0;
    while (cursor <= source.length - target.length) {
        const index = source.indexOf(target, cursor);
        if (index < 0) {break;}
        count += 1;
        cursor = index + Math.max(1, target.length);
    }
    return count;
}

async function recentStoryMessagesAtFloor(
    sessionId: string,
    floor: number,
): Promise<TavernMessageRecord[]> {
    return await (tavernMessagesTable as unknown as TavernStoryMessageRangeTable)
        .where('[sessionId+order]')
        .between([sessionId, 0], [sessionId, floor], true, true)
        .reverse()
        .filter((message) => !message.error && (message.role === 'user' || message.role === 'assistant'))
        .limit(6)
        .toArray();
}

async function resolveKnownTargetName(
    sessionId: string,
    expectedUserOrder: number,
): Promise<string> {
    const [contacts, messages] = await Promise.all([
        tavernCommunicationContactsTable.where('sessionId').equals(sessionId).toArray(),
        recentStoryMessagesAtFloor(sessionId, expectedUserOrder),
    ]);
    const names = [...new Set((contacts as TavernCommunicationContactRecord[])
        .map((contact) => normalizeContactName(contact.name))
        .filter((name) => [...name].length >= 1 && [...name].length <= 40)
        .filter((name) => !/[<>&]/u.test(name)))];
    const candidates = names.flatMap((name) => {
        let occurrences = 0;
        let lastOrder = -1;
        for (const message of messages) {
            const count = countLiteralOccurrences(String(message.content || ''), name);
            if (count > 0) {
                occurrences += count;
                lastOrder = Math.max(lastOrder, message.order);
            }
        }
        return occurrences > 0 ? [{ name, occurrences, lastOrder }] : [];
    });
    candidates.sort((left, right) => (
        right.occurrences - left.occurrences
        || right.lastOrder - left.lastOrder
        || left.name.localeCompare(right.name)
    ));
    return candidates[0]?.name || '';
}

function recentExternalSpend(rows: readonly TavernEconomyTransactionRecord[]): number {
    return rows.reduce((sum, row) => {
        if ((row.sourceDomain === 'shop' || row.sourceDomain === 'bank')
            && row.fromAccountId === TAVERN_PLAYER_ACCOUNT_ID
        ) {
            return sum + row.amount;
        }
        return sum;
    }, 0);
}

function assertPlayerAccount(
    account: TavernEconomyAccountRecord | undefined,
): TavernEconomyAccountRecord {
    if (!account
        || account.id !== TAVERN_PLAYER_ACCOUNT_ID
        || !Number.isSafeInteger(account.balance)
        || account.balance < 0
    ) {
        throwTavernPetError('pet_history_invalid', 'player-account');
    }
    return account;
}

function evolutionRequestId(
    sessionId: string,
    turn: number,
    current: TavernPetCompanionRecord,
): string {
    return ['pet', 'evolution-request', sessionId, String(turn), current.versionId].join(':');
}

async function previousSourceAction(
    sessionId: string,
    sourceAnchorOrder: number,
): Promise<TavernPetActionRecord | null> {
    const row = await (tavernPetActionsTable as unknown as TavernPetActionReadTable)
        .where('[sourceSessionId+sourceAnchorOrder+createdAt+id]')
        .between(
            [sessionId, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, ''],
            [sessionId, sourceAnchorOrder, Number.MIN_SAFE_INTEGER, ''],
            true,
            false,
        )
        .reverse()
        .first();
    return row ? parseCanonicalTavernPetActionRecord(row) : null;
}

async function sourceRecentExternalSpend(input: {
    sessionId: string;
    currentSourceAnchorOrder: number;
}): Promise<number> {
    const previous = await previousSourceAction(input.sessionId, input.currentSourceAnchorOrder);
    const lowerAnchorOrder = previous?.sourceAnchorOrder ?? -1;
    const rows = await (tavernEconomyTransactionsTable as unknown as TavernEconomyAnchorRangeTable)
        .where('[sessionId+anchorOrder+ledgerOrder]')
        .between(
            [input.sessionId, lowerAnchorOrder, Number.MAX_SAFE_INTEGER],
            [input.sessionId, input.currentSourceAnchorOrder, Number.MAX_SAFE_INTEGER],
            false,
            true,
        )
        .toArray();
    return recentExternalSpend(rows);
}

async function postTurnCoinEffect(
    sessionId: string,
    context: TavernPetTurnContext,
    outcome: ReturnType<typeof advanceTavernPetTurn>['outcome'],
): Promise<TavernEconomyTransactionRecord | null> {
    const effect = outcome.coinEffect;
    if (!effect) {
        if (outcome.journal?.coinDelta) {
            throwTavernPetError('pet_state_invalid', 'journal-coin-without-ledger');
        }
        return null;
    }
    const expectedDelta = effect.direction === 'debit' ? -effect.amount : effect.amount;
    if (outcome.journal?.coinDelta !== expectedDelta) {
        throwTavernPetError('pet_state_invalid', 'journal-coin-mismatch');
    }
    const fromAccountId = effect.direction === 'debit'
        ? TAVERN_PLAYER_ACCOUNT_ID
        : effect.kind === 'pet_return'
            ? TAVERN_SYSTEM_SINK_ACCOUNT_ID
            : TAVERN_SYSTEM_MINT_ACCOUNT_ID;
    const toAccountId = effect.direction === 'debit'
        ? TAVERN_SYSTEM_SINK_ACCOUNT_ID
        : TAVERN_PLAYER_ACCOUNT_ID;
    return await postTavernEconomyTransactionInCurrentDbTransaction({
        sessionId,
        idempotencyKey: effect.idempotencyKey,
        fromAccountId,
        toAccountId,
        amount: effect.amount,
        kind: effect.kind,
        title: effect.title,
        note: outcome.journal?.detail.kind === 'event'
            ? outcome.journal.detail.renderedText
            : effect.title,
        sourceDomain: 'pet',
        sourceId: effect.sourceId,
        anchorOrder: context.sourceAnchorOrder,
    }, { touchSessionOnCreate: false });
}

export async function advanceTavernPetTurnInCurrentDbTransaction(input: {
    session: TavernSessionRecord;
    expectedUser: TavernMessageIdentity;
    assistantOrder: number;
    nextTurn: number;
    random?: TavernPetRandomSource;
}): Promise<TavernPetCompanionRecord | null> {
    const current = await getTavernPetCompanionInCurrentDbTransaction();
    if (!current) {return null;}
    const actionId = ['pet', 'story', input.session.id, String(input.nextTurn)].join(':');
    const replay = await findTavernPetActionInCurrentDbTransaction(actionId);
    if (replay) {
        if (replay.action.kind !== 'turn-advance'
            || replay.sourceSessionId !== input.session.id
            || replay.sourceTurn !== input.nextTurn
        ) {
            throwTavernPetError('pet_action_conflict', actionId);
        }
        return current;
    }
    await ensureTavernEconomyInCurrentDbTransaction(input.session.id);
    const [playerAccount, knownTargetName, sourceSpend] = await Promise.all([
        tavernEconomyAccountsTable.get([input.session.id, TAVERN_PLAYER_ACCOUNT_ID]),
        resolveKnownTargetName(input.session.id, input.expectedUser.order),
        sourceRecentExternalSpend({
            sessionId: input.session.id,
            currentSourceAnchorOrder: input.expectedUser.order,
        }),
    ]);
    const context: TavernPetTurnContext = {
        sourceSessionId: input.session.id,
        sourceTurn: input.nextTurn,
        sourceAnchorOrder: input.assistantOrder,
        petTurn: current.state.petTurn + 1,
        recentExternalSpend: sourceSpend,
        playerBalance: assertPlayerAccount(playerAccount).balance,
        knownTargetName,
        evolutionRequestId: evolutionRequestId(input.session.id, input.nextTurn, current),
    };
    const transition = advanceTavernPetTurn(current.state, context, input.random || tavernPetRandomSource);
    if (!transition.changed) {throwTavernPetError('pet_state_invalid', 'global-turn-not-consumed');}
    await postTurnCoinEffect(input.session.id, context, transition.outcome);
    const committed = await appendTavernPetTransitionInCurrentDbTransaction({
        current,
        actionId,
        sourceSessionId: input.session.id,
        sourceTurn: input.nextTurn,
        sourceAnchorOrder: input.assistantOrder,
        action: {
            kind: 'turn-advance',
            context: clone(context),
            outcome: clone(transition.outcome),
        },
        state: transition.state,
        ...(transition.outcome.journal ? { journal: transition.outcome.journal } : {}),
    });
    return committed.companion;
}

export async function commitTavernAssistantResponseWithPetForLatestUser(
    sessionId: string,
    expectedUser: TavernMessageIdentity,
    message: TavernAppendMessageInput,
    options: TavernAssistantResponseCommitOptions,
    petOptions: { random?: TavernPetRandomSource } = {},
): Promise<TavernAssistantResponseCommitResult> {
    return await db.transaction(
        'rw',
        tavernMessagesTable,
        tavernSessionsTable,
        tavernManagerCandidatesTable,
        tavernCommunicationContactsTable,
        tavernPetCompanionTable,
        tavernPetActionsTable,
        tavernPetJournalTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        async () => {
            const before = await tavernSessionsTable.get(sessionId);
            if (!before) {throw new Error('session_missing');}
            const previousTurn = sessionTurn(before);
            const result = await commitTavernAssistantResponseForLatestUserInCurrentDbTransaction(
                sessionId,
                expectedUser,
                message,
                options,
            );
            const nextTurn = sessionTurn(result.session);
            if (nextTurn === previousTurn) {return result;}
            if (nextTurn !== previousTurn + 1) {
                throwTavernPetError(
                    'pet_turn_invalid',
                    [String(previousTurn), String(nextTurn)].join('->'),
                );
            }
            await advanceTavernPetTurnInCurrentDbTransaction({
                session: result.session,
                expectedUser,
                assistantOrder: result.assistantMessage.order,
                nextTurn,
                ...(petOptions.random ? { random: petOptions.random } : {}),
            });
            return result;
        },
    );
}
