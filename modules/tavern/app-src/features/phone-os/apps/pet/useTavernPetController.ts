import {
    computed,
    onScopeDispose,
    ref,
    watch,
    type ComputedRef,
    type Ref,
} from 'vue';
import { captureTavernPhoneBoundary } from '../../../../../shared/phone-boundary';
import {
    commitTavernPetChatResponse,
    getTavernPetSnapshot,
    getTavernPetPendingEvolutionRequest,
    getTavernPetPrivateSnapshotForChat,
    interactWithTavernPet,
    letTavernPetLeave,
    lureTavernPet,
    renameTavernPet,
    resolveTavernPetEvolution,
    resolveTavernPetMoment,
    setTavernPetInterferenceEnabled,
    skipTavernPetMoment,
} from '../../../../../shared/pet/pet-service';
import {
    buildTavernPetChatMessages,
    buildTavernPetEvolutionMessages,
    normalizeTavernPetPlayerText,
    parseTavernPetChatResponse,
    parseTavernPetEvolutionVerdict,
    tavernPetChatProfile,
    tavernPetStaticEvolutionVerdict,
} from '../../../../../shared/pet/pet-chat';
import type {
    TavernPetAvailableAction,
    TavernPetInteractionId,
    TavernPetJournalRecord,
    TavernPetMomentChoiceId,
    TavernPetMomentId,
    TavernPetMutationBoundary,
    TavernPetMutationResult,
    TavernPetView,
} from '../../../../../shared/pet/pet-types';
import {
    runTavernOnce,
    type TavernRunOnceOptions,
    type TavernRunOnceResult,
} from '../../../../runtime/run-once';
import { resolveXbTavernProviderConfig } from '../../../../runtime/provider';
import {
    isTavernPetAbortError,
    tavernPetUiError,
} from './tavern-pet-errors';
import {
    projectTavernPetJournalRows,
    tavernPetCurrentUtterance,
    TAVERN_PET_REBUFF_FACE,
    type TavernPetUtterancePresentation,
} from './tavern-pet-presentation';

type TavernPetModelRunner = (options: TavernRunOnceOptions) => Promise<TavernRunOnceResult>;
type TavernPetMutationKind = Exclude<TavernPetInteractionId, 'chat'>
    | 'rename' | 'toggle-interference' | 'leave' | 'resolve-moment' | 'skip-moment';

export interface TavernPetControllerOptions {
    selectedSessionId: Ref<string>;
    agentConfig: Ref<Record<string, unknown>>;
    memoryEditorMode: Ref<'preview' | 'edit'>;
    characterArchiveBusy: ComputedRef<boolean>;
    acceptedRollbackBusy: ComputedRef<boolean>;
    wallet: {
        refreshAfterEconomyDomainChange: () => void | Promise<void>;
    };
    showToast?: (message: string, options?: { tone?: 'info' | 'warning'; durationMs?: number }) => void;
    openApiSettings?: () => void;
    runModel?: TavernPetModelRunner;
}

interface TavernPetMutationOwner {
    sessionId: string;
    actionKey: string;
    epoch: number;
}

interface TavernPetModelOwner {
    sessionId: string;
    key: string;
    epoch: number;
    controller: AbortController;
}

function emptyTavernPetView(): TavernPetView {
    return {
        revision: 0,
        versionId: '',
        existence: 'undiscovered',
        displayName: '暗室空着',
        pendingEvolution: false,
        interferenceEnabled: true,
        nest: { coins: 0, curios: [] },
        availableActions: [],
    };
}

function createActionId(kind: string): string {
    const randomId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    return `phone-pet:${kind}:${randomId}`;
}

function cloneSerializable<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

function isTavernPetHomeNoticeJournal(entry: TavernPetJournalRecord): boolean {
    if (entry.detail.kind === 'milestone') {
        return entry.detail.milestoneId !== 'arrival';
    }
    return entry.detail.kind === 'event' && Boolean(entry.notificationText);
}

export function useTavernPetController(options: TavernPetControllerOptions) {
    const view = ref<TavernPetView>(emptyTavernPetView());
    const journal = ref<ReturnType<typeof projectTavernPetJournalRows>>([]);
    const loading = ref(false);
    const loadError = ref('');
    const actionError = ref('');
    const chatError = ref('');
    const status = ref('');
    const homeNotice = ref(false);
    const busyAction = ref('');
    const chatRequestKey = ref('');
    const chatInput = ref('');
    const nestOpen = ref(false);
    const namingOpen = ref(false);
    const nameDraft = ref('');
    const latestJournalId = ref('');
    const leaveConfirmOpen = ref(false);
    const temporaryUtterance = ref<TavernPetUtterancePresentation | null>(null);
    const murmurVisible = ref(true);
    let readSequence = 0;
    let stateRevision = 0;
    let preparedSessionId = '';
    let mutationOwner: TavernPetMutationOwner | null = null;
    let mutationEpoch = 0;
    let chatOwner: TavernPetModelOwner | null = null;
    let chatEpoch = 0;
    let evolutionOwner: TavernPetModelOwner | null = null;
    let evolutionEpoch = 0;
    let evolutionRetryRequested = false;
    let pendingLookup = false;
    let pendingScheduleQueued = false;
    let disposed = false;
    let knownPendingMomentId = '';
    let knownPendingEvolution = false;
    let murmurTimer: ReturnType<typeof setTimeout> | null = null;
    const seenJournalIds = new Set<string>();
    const modelRunner = options.runModel || runTavernOnce;

    const utterance = computed<TavernPetUtterancePresentation>(() => (
        temporaryUtterance.value
        || tavernPetCurrentUtterance(view.value, latestJournalId.value)
    ));
    const hasCustomName = computed(() => Boolean(
        view.value.specimenLabel
        && view.value.displayName !== view.value.specimenLabel
        && view.value.phase !== 'egg'
    ));
    const delegateProvider = computed(() => resolveXbTavernProviderConfig(
        options.agentConfig.value || {},
        { role: 'delegate' },
    ));
    const delegateModelReady = computed(() => delegateProvider.value.readiness.ok);
    const isChatWaiting = computed(() => Boolean(chatRequestKey.value));

    function currentSessionId(): string {
        return String(options.selectedSessionId.value || '').trim();
    }

    function clearMurmurTimer(): void {
        if (murmurTimer !== null) {clearTimeout(murmurTimer);}
        murmurTimer = null;
    }

    function armMurmur(murmur = ''): void {
        clearMurmurTimer();
        murmurVisible.value = !murmur;
        if (!murmur) {return;}
        murmurTimer = setTimeout(() => {
            murmurTimer = null;
            murmurVisible.value = true;
        }, 3_000);
    }

    function cancelChatRequest(): void {
        chatEpoch += 1;
        chatOwner?.controller.abort();
        chatOwner = null;
        chatRequestKey.value = '';
    }

    function cancelEvolutionRequest(retryAfterCancel = false): void {
        if (!evolutionOwner) {return;}
        if (retryAfterCancel) {evolutionRetryRequested = true;}
        evolutionEpoch += 1;
        evolutionOwner.controller.abort();
        evolutionOwner = null;
    }

    function resetState(): void {
        readSequence += 1;
        stateRevision += 1;
        mutationEpoch += 1;
        preparedSessionId = '';
        cancelChatRequest();
        evolutionRetryRequested = false;
        cancelEvolutionRequest();
        clearMurmurTimer();
        pendingLookup = false;
        pendingScheduleQueued = false;
        knownPendingMomentId = '';
        knownPendingEvolution = false;
        seenJournalIds.clear();
        view.value = emptyTavernPetView();
        journal.value = [];
        loading.value = false;
        loadError.value = '';
        actionError.value = '';
        chatError.value = '';
        status.value = '';
        homeNotice.value = false;
        chatInput.value = '';
        nestOpen.value = false;
        namingOpen.value = false;
        nameDraft.value = '';
        latestJournalId.value = '';
        leaveConfirmOpen.value = false;
        temporaryUtterance.value = null;
        murmurVisible.value = true;
    }

    function baseInteractionBlockedReason(): string {
        if (!currentSessionId()) {return '请先进入一个会话。';}
        if (options.acceptedRollbackBusy.value
            || options.memoryEditorMode.value === 'edit'
            || options.characterArchiveBusy.value
        ) {
            return '住户的数据正在整理，暂时不能碰它。';
        }
        if (loading.value) {return '住户的数据还在读取。';}
        if (loadError.value) {return '住户的数据暂时读不到。';}
        return '';
    }

    const interactionBlockedReason = computed(baseInteractionBlockedReason);

    function findAction(actionId: TavernPetInteractionId): TavernPetAvailableAction | null {
        return view.value.availableActions.find((action) => action.id === actionId) || null;
    }

    function actionBlockedReason(action: TavernPetAvailableAction): string {
        const blocked = baseInteractionBlockedReason();
        if (blocked) {return blocked;}
        if (mutationOwner || busyAction.value) {return '它还在反应……';}
        if (isChatWaiting.value) {return '它正在想怎么回答你。';}
        return action.enabled ? '' : action.reason;
    }

    const chatBlockedReason = computed(() => {
        const blocked = baseInteractionBlockedReason();
        if (blocked) {return blocked;}
        if (isChatWaiting.value) {return '它正在想怎么回答你。';}
        if (mutationOwner) {return '它还在反应……';}
        if (view.value.phase === 'egg') {return '';}
        if (!delegateModelReady.value) {return '还没有配置分身模型。';}
        const action = findAction('chat');
        if (action) {return action.enabled ? '' : action.reason;}
        return '它还没破壳';
    });
    const canSubmitChat = computed(() => (
        !chatBlockedReason.value && Boolean(String(chatInput.value || '').trim())
    ));

    function applyPetSnapshot(
        nextView: TavernPetView,
        nextJournal: readonly TavernPetJournalRecord[],
        input: { baseline?: boolean; clearTemporary?: boolean } = {},
    ): void {
        view.value = nextView;
        journal.value = projectTavernPetJournalRows(nextJournal);
        latestJournalId.value = nextJournal[0]?.id || '';
        const nextPendingMomentId = nextView.pendingMoment?.id || '';
        const nextPendingEvolution = nextView.pendingEvolution === true;
        if (input.baseline) {
            knownPendingMomentId = nextPendingMomentId;
            knownPendingEvolution = nextPendingEvolution;
            nextJournal.forEach((entry) => seenJournalIds.add(entry.id));
        } else {
            if ((nextPendingMomentId && nextPendingMomentId !== knownPendingMomentId)
                || (nextPendingEvolution && !knownPendingEvolution)
            ) {
                homeNotice.value = true;
            }
            knownPendingMomentId = nextPendingMomentId;
            knownPendingEvolution = nextPendingEvolution;
        }
        if (nextView.existence !== 'present') {
            nestOpen.value = false;
            namingOpen.value = false;
            nameDraft.value = '';
            leaveConfirmOpen.value = false;
        }
        if (input.clearTemporary !== false) {temporaryUtterance.value = null;}
    }

    async function refreshPet(input: {
        baseline?: boolean;
        visibleLoading?: boolean;
        clearTemporary?: boolean;
    } = {}): Promise<{ view: TavernPetView; journal: TavernPetJournalRecord[] } | null> {
        const sessionId = currentSessionId();
        const sequence = ++readSequence;
        const readStateRevision = stateRevision;
        if (!sessionId) {
            resetState();
            return null;
        }
        if (input.visibleLoading !== false) {loading.value = true;}
        loadError.value = '';
        try {
            const snapshot = await getTavernPetSnapshot(sessionId);
            if (sequence !== readSequence
                || readStateRevision !== stateRevision
                || sessionId !== currentSessionId()
            ) {return null;}
            applyPetSnapshot(snapshot.view, snapshot.journal, input);
            preparedSessionId = sessionId;
            return snapshot;
        } catch (error) {
            if (sequence !== readSequence
                || readStateRevision !== stateRevision
                || sessionId !== currentSessionId()
            ) {return null;}
            loadError.value = tavernPetUiError(error).message;
            return null;
        } finally {
            if (sequence === readSequence) {loading.value = false;}
        }
    }

    async function preparePet(): Promise<void> {
        const sessionId = currentSessionId();
        actionError.value = '';
        chatError.value = '';
        status.value = '';
        await refreshPet({ baseline: preparedSessionId !== sessionId });
        schedulePendingEvolution();
    }

    function notifyJournal(records: readonly TavernPetJournalRecord[]): void {
        [...records]
            .sort((left, right) => left.createdAt - right.createdAt || left.id.localeCompare(right.id))
            .forEach((entry) => {
                if (seenJournalIds.has(entry.id)) {return;}
                seenJournalIds.add(entry.id);
                if (entry.notificationText) {
                    options.showToast?.(entry.notificationText, { durationMs: 4_800 });
                }
            });
    }

    function applyMutationResult(result: TavernPetMutationResult): void {
        stateRevision += 1;
        readSequence += 1;
        loading.value = false;
        applyPetSnapshot(result.view, result.journal);
        const activityId = result.actionRecord?.activityId || '';
        if (activityId && result.actionRecord?.sourceSessionId === currentSessionId()) {
            notifyJournal(result.journal.filter((entry) => entry.id === activityId));
        }
    }

    async function refreshWalletAfterCommit(sessionId: string): Promise<void> {
        try {
            await options.wallet.refreshAfterEconomyDomainChange();
        } catch {
            if (sessionId !== currentSessionId()) {return;}
            status.value = '操作已经完成，余额显示稍后刷新。';
            options.showToast?.(status.value, { tone: 'warning', durationMs: 4_200 });
        }
    }

    function mutationBoundary(
        sessionId: string,
        actionId: string,
        boundary: Awaited<ReturnType<typeof captureTavernPhoneBoundary>>,
        expectedRevision: number,
        expectedVersionId: string,
    ): TavernPetMutationBoundary {
        return {
            sessionId,
            boundary,
            actionId,
            expectedRevision,
            expectedVersionId,
        };
    }

    async function recoverMutationError(error: unknown, owns: () => boolean): Promise<void> {
        const uiError = tavernPetUiError(error);
        if (!owns()) {return;}
        actionError.value = uiError.message;
        if (uiError.kind === 'conflict' || uiError.kind === 'wallet') {
            stateRevision += 1;
            await Promise.allSettled([
                refreshPet({ visibleLoading: false }),
                options.wallet.refreshAfterEconomyDomainChange(),
            ]);
        }
    }

    async function runMutation(
        kind: TavernPetMutationKind,
        execute: (boundary: TavernPetMutationBoundary) => Promise<TavernPetMutationResult>,
    ): Promise<TavernPetMutationResult | null> {
        const blocked = baseInteractionBlockedReason();
        if (blocked) {
            actionError.value = blocked;
            return null;
        }
        const sessionId = currentSessionId();
        if (!sessionId || mutationOwner || chatOwner) {return null;}
        cancelEvolutionRequest(true);
        const owner = { sessionId, actionKey: kind, epoch: mutationEpoch };
        mutationOwner = owner;
        busyAction.value = kind;
        actionError.value = '';
        status.value = '';
        temporaryUtterance.value = null;
        const expectedRevision = view.value.revision;
        const expectedVersionId = view.value.versionId;
        const owns = () => mutationOwner === owner
            && owner.epoch === mutationEpoch
            && sessionId === currentSessionId();
        try {
            const boundary = await captureTavernPhoneBoundary(sessionId);
            if (!owns()) {return null;}
            const lateBlocked = baseInteractionBlockedReason();
            if (lateBlocked) {
                actionError.value = lateBlocked;
                return null;
            }
            if (view.value.revision !== expectedRevision || view.value.versionId !== expectedVersionId) {
                actionError.value = '情况变了。已经替你刷新住户和钱包。';
                return null;
            }
            const result = await execute(mutationBoundary(
                sessionId,
                createActionId(kind),
                boundary,
                expectedRevision,
                expectedVersionId,
            ));
            if (!owns()) {return null;}
            applyMutationResult(result);
            const committedJournal = result.actionRecord?.activityId
                ? result.journal.find((entry) => entry.id === result.actionRecord?.activityId)
                : null;
            if (committedJournal?.detail.kind === 'chat' && committedJournal.detail.murmur) {
                armMurmur(committedJournal.detail.murmur);
            } else {
                armMurmur('');
            }
            void refreshWalletAfterCommit(sessionId);
            return owns() ? result : null;
        } catch (error) {
            if (owns()) {await recoverMutationError(error, owns);}
            return null;
        } finally {
            if (mutationOwner === owner) {
                mutationOwner = null;
                busyAction.value = '';
            }
            schedulePendingEvolution();
        }
    }

    function giftReaction(kind: TavernPetMutationKind): void {
        const current = view.value;
        if (current.existence !== 'present') {return;}
        const egg = current.phase === 'egg';
        const reactions = kind === 'feed'
            ? egg
                ? [
                    { face: '(🥚)', text: '壳轻轻晃了一下。像是高兴。', motion: 'bounce' as const },
                    { face: '(🥚)', text: '里面传出很轻的磕碰声。', motion: 'shake' as const },
                ]
                : [
                    { face: current.currentFace || '·', text: '它把食物拖进了角落。', motion: 'approach' as const },
                    { face: current.currentFace || '·', text: '它把碗底舔出了一个亮圈。', motion: 'stare' as const },
                    { face: current.currentFace || '·', text: '食物少了三分之一。它什么都没承认。', motion: 'turn-away' as const },
                ]
            : [
                { face: current.currentFace || '·', text: '它把玩具拨来拨去。', motion: 'bounce' as const },
                { face: current.currentFace || '·', text: '它把玩具压在身下，慢慢推到窝边。', motion: 'approach' as const },
                { face: current.currentFace || '·', text: '它把玩具藏进了窝里，又拿出来。', motion: 'hide' as const },
            ];
        const reaction = reactions[Math.floor(Math.random() * reactions.length)];
        temporaryUtterance.value = {
            key: `pet-gift:${kind}:${Date.now()}`,
            face: reaction.face,
            text: reaction.text,
            motion: reaction.motion,
        };
        armMurmur('');
    }

    async function performAction(actionId: TavernPetInteractionId): Promise<TavernPetMutationResult | null> {
        const action = findAction(actionId);
        if (!action) {return null;}
        const blocked = actionBlockedReason(action);
        if (blocked) {
            actionError.value = blocked;
            return null;
        }
        if (actionId === 'chat') {
            await sendChat();
            return null;
        }
        if (actionId === 'lure') {
            return await runMutation('lure', (boundary) => lureTavernPet(boundary));
        }
        const result = await runMutation(actionId, (boundary) => interactWithTavernPet({
            ...boundary,
            interactionId: actionId,
        }));
        if (result) {giftReaction(actionId);}
        return result;
    }

    function touchStage(): void {
        const current = view.value;
        const reactions = current.existence === 'undiscovered'
            ? [{ face: '◌', text: '暗室里什么都没有。', motion: 'none' as const }]
            : current.phase === 'egg'
                ? [
                    { face: '(🥚)', text: '……咚。', motion: 'shake' as const },
                    { face: '(🥚)', text: '（蛋壳里面蹭了一下）', motion: 'bounce' as const },
                    { face: '(🥚)', text: '( •̀ _ •́ )?', motion: 'stare' as const },
                ]
                : [
                    { face: current.currentFace || '·', text: '它看了你一眼。', motion: 'stare' as const },
                    { face: current.currentFace || '·', text: '它往前蹭了一点。', motion: 'approach' as const },
                    { face: current.currentFace || '·', text: '它把脸藏了一下。', motion: 'hide' as const },
                    { face: current.currentFace || '·', text: '它轻轻晃了晃。', motion: 'shake' as const },
                ];
        const reaction = reactions[Math.floor(Math.random() * reactions.length)];
        temporaryUtterance.value = {
            key: `pet-touch:${Date.now()}`,
            face: reaction.face,
            text: reaction.text,
            motion: reaction.motion,
        };
        armMurmur('');
    }

    async function resolveMoment(
        momentId: TavernPetMomentId,
        choiceId: TavernPetMomentChoiceId,
    ): Promise<TavernPetMutationResult | null> {
        if (view.value.pendingMoment?.id !== momentId) {return null;}
        return await runMutation('resolve-moment', (boundary) => resolveTavernPetMoment({
            ...boundary,
            momentId,
            choiceId,
        }));
    }

    async function skipMoment(momentId: TavernPetMomentId): Promise<TavernPetMutationResult | null> {
        if (view.value.pendingMoment?.id !== momentId) {return null;}
        return await runMutation('skip-moment', (boundary) => skipTavernPetMoment({ ...boundary, momentId }));
    }

    function openNest(): void {
        if (view.value.existence !== 'present') {return;}
        nestOpen.value = true;
    }

    function clearHomeNotice(): void {
        homeNotice.value = false;
    }

    function closeNest(force = false): void {
        if (!force && (mutationOwner || busyAction.value)) {return;}
        nestOpen.value = false;
    }

    function openNaming(): void {
        if (view.value.phase !== 'juvenile' && view.value.phase !== 'adult') {return;}
        actionError.value = '';
        nameDraft.value = hasCustomName.value ? view.value.displayName : '';
        namingOpen.value = true;
    }

    function closeNaming(): void {
        namingOpen.value = false;
        nameDraft.value = '';
    }

    function deactivatePet(): void {
        closeNaming();
        closeNest(true);
        closeLeaveConfirmation();
    }

    function openLeaveConfirmation(): void {
        if (view.value.existence !== 'present' || mutationOwner || chatOwner || busyAction.value) {return;}
        actionError.value = '';
        leaveConfirmOpen.value = true;
    }

    function closeLeaveConfirmation(): void {
        if (busyAction.value !== 'leave') {leaveConfirmOpen.value = false;}
    }

    async function confirmPetLeave(): Promise<TavernPetMutationResult | null> {
        if (!leaveConfirmOpen.value) {return null;}
        const result = await runMutation('leave', async (boundary) => await letTavernPetLeave(boundary));
        if (result) {
            leaveConfirmOpen.value = false;
            closeNest();
        }
        return result;
    }

    async function submitName(value = nameDraft.value): Promise<TavernPetMutationResult | null> {
        const result = await runMutation('rename', (boundary) => renameTavernPet({
            ...boundary,
            petName: value,
        }));
        if (result) {closeNaming();}
        return result;
    }

    async function restoreSpecimenName(): Promise<TavernPetMutationResult | null> {
        return await submitName('');
    }

    async function setInterferenceEnabled(enabled: boolean): Promise<TavernPetMutationResult | null> {
        return await runMutation('toggle-interference', (boundary) => setTavernPetInterferenceEnabled({
            ...boundary,
            enabled,
        }));
    }

    function beginChatRequest(key: string): TavernPetModelOwner | null {
        const sessionId = currentSessionId();
        if (!sessionId || chatOwner) {return null;}
        cancelEvolutionRequest(true);
        const owner: TavernPetModelOwner = {
            sessionId,
            key,
            epoch: chatEpoch,
            controller: new AbortController(),
        };
        chatOwner = owner;
        chatRequestKey.value = key;
        return owner;
    }

    function ownsChatRequest(owner: TavernPetModelOwner): boolean {
        return chatOwner === owner
            && owner.epoch === chatEpoch
            && owner.sessionId === currentSessionId();
    }

    function finishChatRequest(owner: TavernPetModelOwner): void {
        if (chatOwner !== owner) {return;}
        chatOwner = null;
        chatRequestKey.value = '';
    }

    function beginEvolutionRequest(key: string): TavernPetModelOwner | null {
        const sessionId = currentSessionId();
        if (!sessionId || evolutionOwner) {return null;}
        const owner: TavernPetModelOwner = {
            sessionId,
            key,
            epoch: evolutionEpoch,
            controller: new AbortController(),
        };
        evolutionOwner = owner;
        return owner;
    }

    function ownsEvolutionRequest(owner: TavernPetModelOwner): boolean {
        return evolutionOwner === owner
            && owner.epoch === evolutionEpoch
            && owner.sessionId === currentSessionId();
    }

    function finishEvolutionRequest(owner: TavernPetModelOwner): void {
        if (evolutionOwner === owner) {evolutionOwner = null;}
    }

    function showTemporaryChatFailure(message: string): void {
        temporaryUtterance.value = {
            key: `pet-chat-failure:${Date.now()}`,
            face: TAVERN_PET_REBUFF_FACE,
            text: message,
            motion: 'turn-away',
        };
        armMurmur('');
    }

    function showEggChatResponse(): void {
        const replies = ['……咚。', '（蛋壳里面蹭了一下）', '( •̀ _ •́ )?', '它没有听懂，只把壳转了一点。'];
        const text = replies[Math.floor(Math.random() * replies.length)];
        temporaryUtterance.value = {
            key: `pet-egg-reply:${Date.now()}`,
            face: '(🥚)',
            text,
            motion: text === '……咚。' ? 'shake' : 'bounce',
        };
        armMurmur('');
    }

    function cancelChat(): void {
        if (!chatOwner) {return;}
        cancelChatRequest();
        chatError.value = '';
        schedulePendingEvolution();
    }

    function openApiSettings(): void {
        options.openApiSettings?.();
    }

    async function sendChat(): Promise<void> {
        chatError.value = '';
        const blocked = chatBlockedReason.value;
        if (blocked) {
            chatError.value = blocked;
            return;
        }
        const playerText = normalizeTavernPetPlayerText(chatInput.value);
        chatInput.value = playerText;
        if (!playerText) {
            chatError.value = '先跟它说点什么。';
            return;
        }
        if (view.value.phase === 'egg') {
            showEggChatResponse();
            chatInput.value = '';
            return;
        }
        const actionId = createActionId('chat');
        const owner = beginChatRequest(actionId);
        if (!owner) {return;}
        actionError.value = '';
        status.value = '';
        temporaryUtterance.value = null;
        try {
            const snapshot = await getTavernPetPrivateSnapshotForChat(owner.sessionId);
            if (!ownsChatRequest(owner)) {return;}
            if (!snapshot
                || snapshot.companion.revision !== view.value.revision
                || snapshot.companion.versionId !== view.value.versionId
            ) {
                chatError.value = '它在你等回复的时候变了主意。';
                stateRevision += 1;
                await refreshPet({ visibleLoading: false });
                return;
            }
            const modelResult = await modelRunner({
                agentConfig: cloneSerializable(options.agentConfig.value || {}),
                providerRole: 'delegate',
                messages: buildTavernPetChatMessages({
                    state: snapshot.companion.state,
                    recentJournal: snapshot.recentJournal,
                    playerText,
                }),
                tools: [],
                toolChoice: 'none',
                signal: owner.controller.signal,
                promptDiagnostics: { channel: 'phone-pet', operation: 'chat' },
            });
            if (!ownsChatRequest(owner)) {return;}
            const parsed = parseTavernPetChatResponse(modelResult.text, snapshot.companion.state);
            parsed.warnings.forEach((warning) => {
                console.warn('[LittleWhiteBox/tavern] Pet chat response warning', warning);
            });
            const boundary = await captureTavernPhoneBoundary(owner.sessionId);
            if (!ownsChatRequest(owner)) {return;}
            const result = await commitTavernPetChatResponse({
                sessionId: owner.sessionId,
                boundary,
                actionId,
                expectedRevision: snapshot.companion.revision,
                expectedVersionId: snapshot.companion.versionId,
                playerText,
                response: parsed.response,
                responseProfile: tavernPetChatProfile(snapshot.companion.state),
            });
            if (!ownsChatRequest(owner)) {return;}
            applyMutationResult(result);
            chatInput.value = '';
            chatError.value = '';
            temporaryUtterance.value = null;
            armMurmur(parsed.response.murmur || '');
            schedulePendingEvolution();
        } catch (error) {
            if (!ownsChatRequest(owner) || isTavernPetAbortError(error)) {return;}
            const uiError = tavernPetUiError(error, 'chat');
            chatError.value = uiError.message;
            showTemporaryChatFailure(uiError.message);
            if (uiError.kind === 'conflict') {
                stateRevision += 1;
                await Promise.allSettled([
                    refreshPet({ visibleLoading: false, clearTemporary: false }),
                    options.wallet.refreshAfterEconomyDomainChange(),
                ]);
            }
        } finally {
            finishChatRequest(owner);
            schedulePendingEvolution();
        }
    }

    function pendingEvolutionBlocked(): boolean {
        return disposed
            || !view.value.pendingEvolution
            || !currentSessionId()
            || options.memoryEditorMode.value === 'edit'
            || options.characterArchiveBusy.value
            || options.acceptedRollbackBusy.value
            || Boolean(mutationOwner)
            || Boolean(chatOwner)
            || Boolean(evolutionOwner);
    }

    async function processPendingEvolution(): Promise<void> {
        if (disposed || pendingLookup || pendingEvolutionBlocked()) {return;}
        pendingLookup = true;
        const sessionId = currentSessionId();
        try {
            const request = await getTavernPetPendingEvolutionRequest(sessionId);
            if (!request || sessionId !== currentSessionId() || pendingEvolutionBlocked()) {return;}
            const owner = beginEvolutionRequest(request.requestId);
            if (!owner) {return;}
            try {
                let verdict = '';
                let usedFallback = false;
                if (!delegateModelReady.value) {
                    verdict = tavernPetStaticEvolutionVerdict(request);
                    usedFallback = true;
                } else {
                    try {
                        const modelResult = await modelRunner({
                            agentConfig: cloneSerializable(options.agentConfig.value || {}),
                            providerRole: 'delegate',
                            messages: buildTavernPetEvolutionMessages(request),
                            tools: [],
                            toolChoice: 'none',
                            signal: owner.controller.signal,
                            promptDiagnostics: { channel: 'phone-pet', operation: 'evolution' },
                        });
                        if (!ownsEvolutionRequest(owner)) {return;}
                        verdict = parseTavernPetEvolutionVerdict(modelResult.text);
                    } catch (error) {
                        if (!ownsEvolutionRequest(owner) || isTavernPetAbortError(error)) {return;}
                        verdict = tavernPetStaticEvolutionVerdict(request);
                        usedFallback = true;
                    }
                }
                const result = await resolveTavernPetEvolution({
                    sessionId: owner.sessionId,
                    requestId: request.requestId,
                    verdict,
                    usedFallback,
                });
                if (!ownsEvolutionRequest(owner)) {return;}
                applyMutationResult(result);
            } catch (error) {
                if (!ownsEvolutionRequest(owner) || isTavernPetAbortError(error)) {return;}
                const uiError = tavernPetUiError(error);
                if (uiError.kind === 'conflict') {
                    stateRevision += 1;
                    await refreshPet({ visibleLoading: false });
                } else {
                    console.warn('[LittleWhiteBox/tavern] Pet evolution resolution failed', error);
                }
            } finally {
                finishEvolutionRequest(owner);
            }
        } catch (error) {
            if (sessionId === currentSessionId() && !isTavernPetAbortError(error)) {
                console.warn('[LittleWhiteBox/tavern] Pet pending evolution read failed', error);
            }
        } finally {
            const retryCancelledEvolution = evolutionRetryRequested;
            evolutionRetryRequested = false;
            pendingLookup = false;
            if (retryCancelledEvolution) {schedulePendingEvolution();}
        }
    }

    function schedulePendingEvolution(): void {
        if (disposed || pendingScheduleQueued) {return;}
        pendingScheduleQueued = true;
        void Promise.resolve().then(async () => {
            pendingScheduleQueued = false;
            if (disposed) {return;}
            await processPendingEvolution();
        });
    }

    async function refreshAfterPetDomainChange(
        journalIds: readonly string[] = [],
    ): Promise<void> {
        const sessionId = currentSessionId();
        if (!sessionId) {return;}
        stateRevision += 1;
        const snapshot = await refreshPet({ visibleLoading: false });
        if (sessionId !== currentSessionId()) {return;}
        const journalIdSet = new Set(journalIds);
        const changedRecords = (snapshot?.journal || []).filter((record) => journalIdSet.has(record.id));
        if (changedRecords.some(isTavernPetHomeNoticeJournal)) {
            homeNotice.value = true;
        }
        const sourceLocalRecords = changedRecords.filter((record) => (
            record.sourceSessionId === sessionId
        ));
        notifyJournal(sourceLocalRecords);
        const latest = sourceLocalRecords.find((record) => record.id === latestJournalId.value);
        if (latest?.detail.kind === 'chat' && latest.detail.murmur) {
            armMurmur(latest.detail.murmur);
        }
        schedulePendingEvolution();
    }

    async function refreshAfterEconomyDomainChange(): Promise<void> {
        if (!currentSessionId()) {return;}
        stateRevision += 1;
        await refreshPet({ visibleLoading: false });
    }

    watch(options.selectedSessionId, () => {
        resetState();
        if (currentSessionId()) {void preparePet();}
    }, { immediate: true });
    watch([
        () => view.value.pendingEvolution,
        options.memoryEditorMode,
        options.characterArchiveBusy,
        options.acceptedRollbackBusy,
    ], schedulePendingEvolution);
    watch([
        options.memoryEditorMode,
        options.characterArchiveBusy,
        options.acceptedRollbackBusy,
    ], () => {
        if (options.memoryEditorMode.value === 'edit'
            || options.characterArchiveBusy.value
            || options.acceptedRollbackBusy.value
        ) {
            mutationEpoch += 1;
            cancelChatRequest();
            cancelEvolutionRequest(true);
        }
    });
    onScopeDispose(() => {
        disposed = true;
        readSequence += 1;
        mutationEpoch += 1;
        cancelChatRequest();
        evolutionRetryRequested = false;
        cancelEvolutionRequest();
        clearMurmurTimer();
    });

    return {
        actionBlockedReason,
        actionError,
        journal,
        busyAction,
        cancelChat,
        canSubmitChat,
        chatBlockedReason,
        chatError,
        chatInput,
        clearHomeNotice,
        deactivatePet,
        closeNaming,
        closeNest,
        closeLeaveConfirmation,
        delegateModelReady,
        hasCustomName,
        homeNotice,
        interactionBlockedReason,
        isChatWaiting,
        loadError,
        leaveConfirmOpen,
        loading,
        murmurVisible,
        nameDraft,
        namingOpen,
        nestOpen,
        openNaming,
        openNest,
        openLeaveConfirmation,
        openApiSettings,
        performAction,
        preparePet,
        refreshAfterEconomyDomainChange,
        refreshAfterPetDomainChange,
        refreshPet,
        restoreSpecimenName,
        resolveMoment,
        confirmPetLeave,
        sendChat,
        setInterferenceEnabled,
        skipMoment,
        status,
        submitName,
        touchStage,
        utterance,
        view,
    };
}
