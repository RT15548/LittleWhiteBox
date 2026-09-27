import { ECONOMY_TRANSACTION_CAPABILITY, type EconomyReadCapability } from '../../../capabilities/economy/index.js';
import type { PartitionStore, XiaobaiOsFileControls, XiaobaiOsFileState } from '../../../kernel/contracts.js';
import { advanceMoving, challengeProgress, completedStages, emptyMoving, movingFault, replayRun, type MovingCommand, type MovingData } from './domain.js';
import { CHAPTER_LEVELS, generateChallenge } from './levels.js';
import { MOVING_PARTITION, movingId } from './partition.js';
import { postMovingDifference, validateMovingEconomy } from './economy.js';
import { MOVING_POLICY } from './policy.js';
import type { MovingLevel } from './types.js';
import { newMovingId } from './identity.js';
import { DEFAULT_MOVING_SOUND_ENABLED } from '../settings.js';

export interface MovingView {
    revision: number;
    completed: number[];
    challenge: ReturnType<typeof challengeProgress>;
    active: MovingData['active'];
    board: ReturnType<typeof replayRun> | null;
    balance: number;
    award: number;
    writeState: XiaobaiOsFileState;
    pending: boolean;
    ready: boolean;
    soundEnabled: boolean;
}
export interface MovingRequest { actionId: string; revision: number; command: MovingCommand }

export function createMovingService(store: PartitionStore<MovingData>, files: XiaobaiOsFileControls, economy: EconomyReadCapability,
    dependencies: { generate?: typeof generateChallenge; seed?: () => number; id?: () => string;
        idle?: () => boolean; soundEnabled?: () => boolean } = {}) {
    const generate = dependencies.generate ?? generateChallenge;
    const seed = dependencies.seed ?? (() => crypto.getRandomValues(new Uint32Array(1))[0]);
    const id = dependencies.id ?? newMovingId;
    function view(): MovingView {
        const data = store.peekCurrent()?.value ?? emptyMoving();
        const receipt = data.receipts.find(entry => entry.runId === data.active?.id);
        return { revision: data.revision, completed: completedStages(data), challenge: challengeProgress(data), active: data.active,
            board: data.active ? replayRun(data.active) : null, balance: economy.getPlayerBalance(),
            award: receipt?.settlement?.outcome === 'won' && receipt.settlement.actionId === data.last?.id
                ? receipt.stage === null ? MOVING_POLICY.challengePrize : MOVING_POLICY.chapterReward : 0,
            writeState: files.getFileState(), pending: files.hasPendingCommit(MOVING_PARTITION.key), ready: economy.isOpen(),
            soundEnabled: dependencies.soundEnabled?.() ?? DEFAULT_MOVING_SOUND_ENABLED };
    }
    async function refresh() { await economy.refresh(); await store.read(); return view(); }
    async function act(input: MovingRequest, guard: () => boolean): Promise<MovingView> {
        movingId(input.actionId);
        if (!Number.isSafeInteger(input.revision) || input.revision < 0) { movingFault('invalid'); }
        const allowed = () => guard() && (dependencies.idle?.() ?? true);
        if (!allowed()) { movingFault('unavailable'); }
        // Read/check before expensive construction; transaction rechecks after the async boundary.
        const current = store.peekCurrent()?.value ?? emptyMoving();
        const replayed = current.last?.id === input.actionId;
        if (!replayed && current.revision !== input.revision) { movingFault('stale'); }
        let prepared: { id: string; level: MovingLevel } | undefined;
        if (!replayed && (input.command.type === 'start' || input.command.type === 'challenge')) {
            if (input.command.type === 'challenge') {
                if (completedStages(current).length !== CHAPTER_LEVELS.length) { movingFault('locked'); }
                if (view().balance < MOVING_POLICY.challengeFee) { movingFault('funds'); }
            }
            const runId = movingId(id());
            prepared = { id: runId, level: input.command.type === 'challenge'
                ? await generate(seed(), challengeProgress(current).tier) : CHAPTER_LEVELS[input.command.stage] };
            if (!allowed()) { movingFault('unavailable'); }
        }
        let preparedForUser = false;
        const result = await store.transact(transaction => {
            if (!allowed()) { movingFault('unavailable'); }
            const data = transaction.current ?? emptyMoving();
            const money = transaction.useCapability(ECONOMY_TRANSACTION_CAPABILITY);
            validateMovingEconomy(data, money);
            if (data.last?.id === input.actionId) {
                if (JSON.stringify(data.last.command) !== JSON.stringify(input.command)) { movingFault('identity'); }
                return;
            }
            if (data.revision !== input.revision) { movingFault('stale'); }
            if (input.command.type === 'challenge' && money.getPlayerBalance() < MOVING_POLICY.challengeFee) { movingFault('funds'); }
            const next = advanceMoving(data, input.command, input.actionId, prepared);
            postMovingDifference(data, next, money);
            validateMovingEconomy(next, money);
            transaction.replace(next);
            preparedForUser = true;
        }, {
            retainFailedCandidate: true,
            // Once accepted, this is a user-wallet action, not a chat-owned one.
            // A later explicit recovery must survive changing/closing its origin chat.
            commitGuard: () => (preparedForUser || guard()) && (dependencies.idle?.() ?? true),
        });
        if (result.status !== 'confirmed' && result.status !== 'unchanged') {
            throw Object.assign(new Error(`moving_save_${result.status}`), { code: `moving_save_${result.status}` });
        }
        return view();
    }
    return { view, refresh, act,
        async confirm(guard: () => boolean) {
            if (files.hasPendingCommit() && !files.hasPendingCommit(MOVING_PARTITION.key)) { movingFault('unavailable'); }
            const result = await files.retryPending({ beforeRetry: guard });
            if (!guard()) { movingFault('unavailable'); }
            if (result.status === 'confirmed' || result.status === 'none' || result.status === 'adopted') { await refresh(); }
            return view();
        },
        subscribe(listener: () => void) {
            const stops = [store.subscribe(listener), economy.subscribe(listener), files.subscribeFileState(listener)];
            return () => stops.forEach(stop => stop());
        },
    };
}
export type MovingService = ReturnType<typeof createMovingService>;
