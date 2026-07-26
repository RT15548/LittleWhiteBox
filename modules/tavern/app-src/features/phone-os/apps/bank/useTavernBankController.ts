import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';
import { captureTavernPhoneBoundary, type TavernExpectedPhoneBoundary } from '../../../../../shared/phone-boundary';
import {
    getCurrentTavernBankView,
    listTavernBankActivities,
    openTavernBankDeposit,
    withdrawTavernBankDepositEarly,
    openTavernBankFund,
    settleDueTavernBankPositions,
    startTavernBankDiceGame,
    bidTavernBankDiceGame,
    challengeTavernBankDiceGame,
    startTavernBankPushGame,
    drawTavernBankPushCard,
    cashOutTavernBankPushGame,
    startTavernBankLadderGame,
    stepTavernBankLadderGame,
    cashOutTavernBankLadderGame,
} from '../../../../../shared/bank/bank-service';
import type {
    TavernBankActivityRecord,
    TavernBankLadderChoice,
    TavernBankMutationResult,
    TavernBankView,
} from '../../../../../shared/bank/bank-types';
import { tavernBankUiError } from './tavern-bank-errors';
import {
    projectTavernBankActivityRows,
    projectTavernBankDepositProducts,
    projectTavernBankFundProducts,
    type TavernBankActivityRow,
} from './tavern-bank-presentation';

export type TavernBankActionKind =
    | 'deposit-open'
    | 'deposit-withdraw'
    | 'fund-open'
    | 'settle-due'
    | 'dice-start'
    | 'dice-bid'
    | 'dice-challenge'
    | 'push-start'
    | 'push-draw'
    | 'push-cash-out'
    | 'ladder-start'
    | 'ladder-step'
    | 'ladder-cash-out';

export interface TavernBankControllerOptions {
    selectedSessionId: Ref<string>;
    memoryEditorMode: Ref<'preview' | 'edit'>;
    characterArchiveBusy: ComputedRef<boolean>;
    acceptedRollbackBusy: ComputedRef<boolean>;
    wallet: {
        refreshAfterEconomyDomainChange: () => void | Promise<void>;
    };
    showToast?: (message: string, options?: { tone?: 'info' | 'warning'; durationMs?: number }) => void;
}

function emptyView(): TavernBankView {
    return { revision: 0, versionId: '', currentTurn: 0, deposits: [], investments: [] };
}

function createActionId(kind: TavernBankActionKind): string {
    return `phone-bank:${kind}:${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useTavernBankController(options: TavernBankControllerOptions) {
    const view = ref<TavernBankView>(emptyView());
    const activities = ref<TavernBankActivityRow[]>([]);
    const loading = ref(false);
    const loadError = ref('');
    const actionError = ref('');
    const status = ref('');
    const busyAction = ref('');
    const lastGameOutcome = ref<TavernBankActivityRecord | null>(null);
    let readSequence = 0;
    let mutationRevision = 0;
    let mutationOwner: { sessionId: string; actionKey: string } | null = null;
    let dismissedGameOutcomeId = '';

    const depositProducts = projectTavernBankDepositProducts();
    const fundProducts = projectTavernBankFundProducts();
    const deposits = computed(() => view.value.deposits);
    const investments = computed(() => view.value.investments);
    const activeGame = computed(() => view.value.activeGame || null);
    const currentTurn = computed(() => view.value.currentTurn);

    const interactionBlockedReason = computed(() => {
        if (!currentSessionId()) {return '请先进入一个会话。';}
        if (options.acceptedRollbackBusy.value) {return '剧情楼层正在回滚，银行暂时停止落账。';}
        if (options.memoryEditorMode.value === 'edit') {return '请先退出记忆编辑，再操作银行。';}
        if (options.characterArchiveBusy.value) {return '角色档案正在同步，银行暂时闭门。';}
        if (loading.value) {return '金库仍在清点，请稍候。';}
        if (loadError.value) {return '金库状态读取失败，请先重试。';}
        return '';
    });

    function currentSessionId(): string {
        return String(options.selectedSessionId.value || '').trim();
    }

    function resetState(): void {
        readSequence += 1;
        mutationRevision += 1;
        mutationOwner = null;
        view.value = emptyView();
        activities.value = [];
        loading.value = false;
        loadError.value = '';
        actionError.value = '';
        status.value = '';
        busyAction.value = '';
        lastGameOutcome.value = null;
        dismissedGameOutcomeId = '';
    }

    function isGameActivity(record: TavernBankActivityRecord): boolean {
        return record.detail.kind === 'dice'
            || record.detail.kind === 'push'
            || record.detail.kind === 'ladder';
    }

    function reconcileGameOutcome(
        nextView: TavernBankView,
        nextActivities: readonly TavernBankActivityRecord[],
    ): void {
        if (nextView.activeGame) {
            lastGameOutcome.value = null;
            return;
        }
        const latest = nextActivities.find(isGameActivity) || null;
        lastGameOutcome.value = latest && latest.id !== dismissedGameOutcomeId ? latest : null;
    }

    function invalidateMutationOwner(): void {
        mutationRevision += 1;
        mutationOwner = null;
        busyAction.value = '';
        status.value = '';
    }

    async function refreshBank(): Promise<void> {
        const sessionId = currentSessionId();
        const sequence = ++readSequence;
        const readMutationRevision = mutationRevision;
        if (!sessionId) {
            resetState();
            return;
        }
        loading.value = true;
        loadError.value = '';
        try {
            const [nextView, nextActivities] = await Promise.all([
                getCurrentTavernBankView(sessionId),
                listTavernBankActivities(sessionId, { limit: 50 }),
            ]);
            if (
                sequence !== readSequence
                || readMutationRevision !== mutationRevision
                || sessionId !== currentSessionId()
            ) {return;}
            view.value = nextView;
            activities.value = projectTavernBankActivityRows(nextActivities);
            reconcileGameOutcome(nextView, nextActivities);
        } catch (error) {
            if (
                sequence !== readSequence
                || readMutationRevision !== mutationRevision
                || sessionId !== currentSessionId()
            ) {return;}
            loadError.value = tavernBankUiError(error).message;
        } finally {
            if (sequence === readSequence) {loading.value = false;}
        }
    }

    async function prepareBank(): Promise<void> {
        actionError.value = '';
        status.value = '';
        await refreshBank();
        await settleDueIfMatured();
    }

    function hasMaturedPosition(): boolean {
        return view.value.deposits.some((deposit) => deposit.remainingRounds <= 0)
            || view.value.investments.some((fund) => fund.remainingRounds <= 0);
    }

    async function settleDueIfMatured(): Promise<void> {
        if (!currentSessionId() || interactionBlockedReason.value || busyAction.value || mutationOwner) {return;}
        if (!hasMaturedPosition()) {return;}
        await runAction('settle-due', 'settle-due', (boundary, actionId) => settleDueTavernBankPositions(
            mutationBoundary(currentSessionId(), boundary, actionId),
        ), '', { silentConcurrency: true });
    }

    function actionBlockedReason(): string {
        const blocked = interactionBlockedReason.value;
        if (blocked) {return blocked;}
        if (busyAction.value) {return '上一笔操作仍在提交。';}
        return '';
    }

    async function boundaryFor(sessionId: string): Promise<TavernExpectedPhoneBoundary | undefined> {
        const boundary = await captureTavernPhoneBoundary(sessionId);
        if (sessionId !== currentSessionId()) {return undefined;}
        return boundary;
    }

    async function recoverFromActionError(
        error: unknown,
        ownsMutation: () => boolean,
        behavior: { silentConcurrency?: boolean } = {},
    ): Promise<void> {
        const uiError = tavernBankUiError(error);
        const concurrencyError = uiError.kind === 'conflict' || uiError.kind === 'timeline';
        if (!behavior.silentConcurrency || !concurrencyError) {
            actionError.value = uiError.message;
        }
        if (uiError.kind === 'conflict' || uiError.kind === 'timeline') {
            mutationRevision += 1;
            await refreshBank();
        } else if (uiError.kind === 'wallet') {
            mutationRevision += 1;
            await refreshBank();
            if (!ownsMutation()) {return;}
            try {await options.wallet.refreshAfterEconomyDomainChange();} catch {
                if (ownsMutation()) {status.value = '钱包显示仍未刷新，重新打开钱包会再次读取。';}
            }
        }
    }

    function clearGameOutcome(): void {
        if (lastGameOutcome.value) {dismissedGameOutcomeId = lastGameOutcome.value.id;}
        lastGameOutcome.value = null;
    }

    async function runAction(
        kind: TavernBankActionKind,
        actionKey: string,
        execute: (boundary: TavernExpectedPhoneBoundary, actionId: string) => Promise<TavernBankMutationResult>,
        successMessage: string,
        behavior: { silentConcurrency?: boolean } = {},
    ): Promise<TavernBankMutationResult | null> {
        const blocked = actionBlockedReason();
        if (blocked) {
            actionError.value = blocked;
            return null;
        }
        const sessionId = currentSessionId();
        if (mutationOwner || !sessionId) {return null;}
        const boundary = await boundaryFor(sessionId);
        if (boundary === undefined || mutationOwner || sessionId !== currentSessionId()) {return null;}
        const lateBlocked = actionBlockedReason();
        if (lateBlocked) {
            actionError.value = lateBlocked;
            return null;
        }
        const owner = { sessionId, actionKey };
        mutationOwner = owner;
        busyAction.value = actionKey;
        actionError.value = '';
        status.value = '';
        const ownsMutation = () => mutationOwner === owner && sessionId === currentSessionId();
        try {
            const result = await execute(boundary, createActionId(kind));
            if (!ownsMutation()) {return null;}
            mutationRevision += 1;
            await refreshBank();
            if (!ownsMutation()) {return null;}
            if (successMessage) {options.showToast?.(successMessage);}
            try {
                await options.wallet.refreshAfterEconomyDomainChange();
            } catch {
                if (ownsMutation()) {
                    status.value = '操作已提交，但钱包显示刷新失败；重新打开钱包会再次读取。';
                    options.showToast?.(status.value, { tone: 'warning', durationMs: 4200 });
                }
            }
            return ownsMutation() ? result : null;
        } catch (error) {
            if (ownsMutation()) {await recoverFromActionError(error, ownsMutation, behavior);}
            return null;
        } finally {
            if (mutationOwner === owner) {
                mutationOwner = null;
                busyAction.value = '';
            }
        }
    }

    function mutationBoundary(sessionId: string, boundary: TavernExpectedPhoneBoundary, actionId: string) {
        return {
            sessionId,
            boundary,
            actionId,
            expectedRevision: view.value.revision,
            expectedVersionId: view.value.versionId,
        };
    }

    function openDeposit(productId: string, amount: number) {
        return runAction('deposit-open', `deposit-open:${productId}`, (boundary, actionId) => openTavernBankDeposit({
            ...mutationBoundary(currentSessionId(), boundary, actionId),
            productId,
            amount,
        }), '已存入定期。');
    }

    async function withdrawDeposit(positionId: string): Promise<TavernBankMutationResult | null> {
        const result = await runAction('deposit-withdraw', `deposit-withdraw:${positionId}`, (boundary, actionId) => withdrawTavernBankDepositEarly({
            ...mutationBoundary(currentSessionId(), boundary, actionId),
            positionId,
        }), '');
        if (result) {
            const settledActivity = result.activities.find((activity) => (
                activity.sourceId === positionId && activity.detail.kind === 'deposit'
            ));
            if (settledActivity && settledActivity.detail.kind === 'deposit') {
                options.showToast?.(settledActivity.detail.outcome === 'matured'
                    ? '定期已到期，本息已入账。'
                    : '已提前支取。');
            }
        }
        return result;
    }

    function openFund(productId: string, amount: number) {
        return runAction('fund-open', `fund-open:${productId}`, (boundary, actionId) => openTavernBankFund({
            ...mutationBoundary(currentSessionId(), boundary, actionId),
            productId,
            amount,
        }), '已买入理财。');
    }

    function startDice(bet: number) {
        return runAction('dice-start', 'dice-start', (boundary, actionId) => startTavernBankDiceGame({
            ...mutationBoundary(currentSessionId(), boundary, actionId),
            bet,
        }), '骰局开桌。');
    }

    function bidDice(gameId: string, count: number, face: number) {
        return runAction('dice-bid', `dice-bid:${gameId}`, (boundary, actionId) => bidTavernBankDiceGame({
            ...mutationBoundary(currentSessionId(), boundary, actionId),
            gameId,
            bid: { count, face },
        }), '');
    }

    function challengeDice(gameId: string) {
        return runAction('dice-challenge', `dice-challenge:${gameId}`, (boundary, actionId) => challengeTavernBankDiceGame({
            ...mutationBoundary(currentSessionId(), boundary, actionId),
            gameId,
        }), '开牌！');
    }

    function startPush() {
        return runAction('push-start', 'push-start', (boundary, actionId) => startTavernBankPushGame(
            mutationBoundary(currentSessionId(), boundary, actionId),
        ), '翻倍或收手，开局。');
    }

    function drawPush(gameId: string) {
        return runAction('push-draw', `push-draw:${gameId}`, (boundary, actionId) => drawTavernBankPushCard({
            ...mutationBoundary(currentSessionId(), boundary, actionId),
            gameId,
        }), '');
    }

    function cashOutPush(gameId: string) {
        return runAction('push-cash-out', `push-cash-out:${gameId}`, (boundary, actionId) => cashOutTavernBankPushGame({
            ...mutationBoundary(currentSessionId(), boundary, actionId),
            gameId,
        }), '已收手。');
    }

    function startLadder(bet: number) {
        return runAction('ladder-start', 'ladder-start', (boundary, actionId) => startTavernBankLadderGame({
            ...mutationBoundary(currentSessionId(), boundary, actionId),
            bet,
        }), '风险阶梯，起步。');
    }

    function stepLadder(gameId: string, choice: TavernBankLadderChoice) {
        return runAction('ladder-step', `ladder-step:${gameId}`, (boundary, actionId) => stepTavernBankLadderGame({
            ...mutationBoundary(currentSessionId(), boundary, actionId),
            gameId,
            choice,
        }), '');
    }

    function cashOutLadder(gameId: string) {
        return runAction('ladder-cash-out', `ladder-cash-out:${gameId}`, (boundary, actionId) => cashOutTavernBankLadderGame({
            ...mutationBoundary(currentSessionId(), boundary, actionId),
            gameId,
        }), '已落袋为安。');
    }

    async function refreshAfterBankDomainChange(): Promise<void> {
        if (!currentSessionId()) {return;}
        mutationRevision += 1;
        await refreshBank();
        await settleDueIfMatured();
    }

    watch(options.selectedSessionId, resetState);
    watch(options.acceptedRollbackBusy, (busy) => {
        if (busy) {invalidateMutationOwner();}
    });

    return {
        actionError,
        activeGame,
        activities,
        bidDice,
        busyAction,
        cashOutLadder,
        cashOutPush,
        challengeDice,
        clearGameOutcome,
        currentTurn,
        deposits,
        depositProducts,
        drawPush,
        fundProducts,
        interactionBlockedReason,
        investments,
        lastGameOutcome,
        loadError,
        loading,
        openDeposit,
        openFund,
        prepareBank,
        refreshAfterBankDomainChange,
        refreshBank,
        startDice,
        startLadder,
        startPush,
        status,
        stepLadder,
        view,
        withdrawDeposit,
    };
}
