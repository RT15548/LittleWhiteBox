import db, {
    commitTavernAssistantResponseForLatestUserInCurrentDbTransaction,
    tavernCommunicationContactsTable,
    tavernEconomyAccountsTable,
    tavernEconomyTransactionsTable,
    tavernManagerCandidatesTable,
    tavernMessagesTable,
    tavernPetActivitiesTable,
    tavernPetStateVersionsTable,
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
    createTavernPetRecordingRandomSource,
    tavernPetRandomSource,
    type TavernPetRandomSource,
} from './pet-random';
import { advanceTavernPetTurn } from './pet-rules';
import {
    appendTavernPetTransitionInCurrentDbTransaction,
    findTavernPetActionVersionInCurrentDbTransaction,
    getCurrentTavernPetStateVersionInCurrentDbTransaction,
} from './pet-service';
import {
    type TavernPetStateVersionRecord,
    type TavernPetTurnContext,
    throwTavernPetError,
} from './pet-types';

type PetStoryRangeCollection<T> = {
    reverse(): PetStoryRangeCollection<T>;
    filter(predicate: (value: T) => boolean): PetStoryRangeCollection<T>;
    limit(count: number): PetStoryRangeCollection<T>;
    first(): Promise<T | undefined>;
    toArray(): Promise<T[]>;
};

type PetStoryRangeTable<T> = {
    where(index: string): {
        between(
            lower: unknown,
            upper: unknown,
            includeLower?: boolean,
            includeUpper?: boolean,
        ): PetStoryRangeCollection<T>;
    };
};

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
    return await (tavernMessagesTable as unknown as PetStoryRangeTable<TavernMessageRecord>)
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

async function getLatestEconomyTransaction(
    sessionId: string,
): Promise<TavernEconomyTransactionRecord | null> {
    return await (tavernEconomyTransactionsTable as unknown as PetStoryRangeTable<TavernEconomyTransactionRecord>)
        .where('[sessionId+ledgerOrder]')
        .between(
            [sessionId, 0],
            [sessionId, Number.MAX_SAFE_INTEGER],
            true,
            true,
        )
        .reverse()
        .first() || null;
}

async function listEconomyTransactionsAfter(
    sessionId: string,
    ledgerOrder: number,
    latestLedgerOrder: number,
): Promise<TavernEconomyTransactionRecord[]> {
    if (latestLedgerOrder <= ledgerOrder) {return [];}
    return await (tavernEconomyTransactionsTable as unknown as PetStoryRangeTable<TavernEconomyTransactionRecord>)
        .where('[sessionId+ledgerOrder]')
        .between(
            [sessionId, ledgerOrder],
            [sessionId, latestLedgerOrder],
            false,
            true,
        )
        .toArray();
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
    current: TavernPetStateVersionRecord,
): string {
    return ['pet', 'evolution-request', sessionId, String(turn), current.versionId].join(':');
}

async function postTurnCoinEffect(
    sessionId: string,
    context: TavernPetTurnContext,
    outcome: ReturnType<typeof advanceTavernPetTurn>['outcome'],
): Promise<TavernEconomyTransactionRecord | null> {
    const effect = outcome.coinEffect;
    if (!effect) {
        if (outcome.activity?.coinDelta) {
            throwTavernPetError('pet_state_invalid', 'activity-coin-without-ledger');
        }
        return null;
    }
    const expectedDelta = effect.direction === 'debit' ? -effect.amount : effect.amount;
    if (outcome.activity?.coinDelta !== expectedDelta) {
        throwTavernPetError('pet_state_invalid', 'activity-coin-mismatch');
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
        note: outcome.activity?.detail.kind === 'event'
            ? outcome.activity.detail.renderedText
            : effect.title,
        sourceDomain: 'pet',
        sourceId: effect.sourceId,
        anchorOrder: context.anchorOrder,
    }, { touchSessionOnCreate: false });
}

export async function advanceTavernPetTurnInCurrentDbTransaction(input: {
    session: TavernSessionRecord;
    expectedUser: TavernMessageIdentity;
    assistantOrder: number;
    nextTurn: number;
    random?: TavernPetRandomSource;
}): Promise<TavernPetStateVersionRecord | null> {
    const current = await getCurrentTavernPetStateVersionInCurrentDbTransaction(input.session.id);
    if (!current || current.state.dormant) {return current;}
    const actionId = ['pet', 'turn', String(input.nextTurn)].join(':');
    const replay = await findTavernPetActionVersionInCurrentDbTransaction(input.session.id, actionId);
    if (replay) {
        if (replay.action.kind !== 'turn-advance'
            || replay.turn !== input.nextTurn
            || replay.anchorOrder !== input.assistantOrder
        ) {
            throwTavernPetError('pet_action_conflict', actionId);
        }
        return replay;
    }
    const [latestTransaction, playerAccount, knownTargetName] = await Promise.all([
        getLatestEconomyTransaction(input.session.id),
        tavernEconomyAccountsTable.get([input.session.id, TAVERN_PLAYER_ACCOUNT_ID]),
        resolveKnownTargetName(input.session.id, input.expectedUser.order),
    ]);
    const latestLedgerOrder = latestTransaction?.ledgerOrder ?? -1;
    const observedRows = await listEconomyTransactionsAfter(
        input.session.id,
        current.state.observedEconomyLedgerOrder,
        latestLedgerOrder,
    );
    const context: TavernPetTurnContext = {
        turn: input.nextTurn,
        anchorOrder: input.assistantOrder,
        latestEconomyLedgerOrder: latestLedgerOrder,
        recentExternalSpend: recentExternalSpend(observedRows),
        playerBalance: assertPlayerAccount(playerAccount).balance,
        knownTargetName,
        evolutionRequestId: evolutionRequestId(input.session.id, input.nextTurn, current),
    };
    const recording = createTavernPetRecordingRandomSource(input.random || tavernPetRandomSource);
    const transition = advanceTavernPetTurn(current.state, context, recording.random);
    if (!transition.changed) {return current;}
    await postTurnCoinEffect(input.session.id, context, transition.outcome);
    const committed = await appendTavernPetTransitionInCurrentDbTransaction({
        current,
        sessionId: input.session.id,
        actionId,
        action: {
            kind: 'turn-advance',
            context: clone(context),
            randomDraws: clone(recording.draws),
            outcome: clone(transition.outcome),
        },
        anchorOrder: input.assistantOrder,
        turn: input.nextTurn,
        state: transition.state,
        ...(transition.outcome.activity ? { activity: transition.outcome.activity } : {}),
    });
    return committed.record;
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
        tavernPetStateVersionsTable,
        tavernPetActivitiesTable,
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
