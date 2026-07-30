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
    listTavernPetJournalByIds,
    lureTavernPet,
    renameTavernPet,
    resolveTavernPetEvolution,
    setTavernPetInterferenceEnabled,
    wakeTavernPet,
} from '../../../../../shared/pet/pet-service';
import {
    buildTavernPetChatMessages,
    buildTavernPetEvolutionMessages,
    normalizeTavernPetPlayerText,
    parseTavernPetChatResponse,
    parseTavernPetEvolutionVerdict,
    tavernPetStaticEvolutionVerdict,
} from '../../../../../shared/pet/pet-chat';
import type {
    TavernPetAvailableAction,
    TavernPetInteractionId,
    TavernPetJournalRecord,
    TavernPetMutationBoundary,
    TavernPetMutationResult,
    TavernPetView,
} from '../../../../../shared/pet/pet-types';
import {
    runTavernOnce,
    type TavernRunOnceOptions,
    type TavernRunOnceResult,
} from '../../../../runtime/run-once';
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
type TavernPetMutationKind = Exclude<TavernPetInteractionId, 'chat'> | 'rename' | 'toggle-interference' | 'leave';
type TavernPetModelRequestKind = '' | 'chat' | 'evolution';

export interface TavernPetControllerOptions {
    selectedSessionId: Ref<string>;
    agentConfig: Ref<Record<string, unknown>>;
    chatRunning: Ref<boolean>;
    chatCancelling: Ref<boolean>;
    memoryEditorMode: Ref<'preview' | 'edit'>;
    characterArchiveBusy: ComputedRef<boolean>;
    acceptedRollbackBusy: ComputedRef<boolean>;
    wallet: {
        refreshAfterEconomyDomainChange: () => void | Promise<void>;
    };
    showToast?: (message: string, options?: { tone?: 'info' | 'warning'; durationMs?: number }) => void;
    runModel?: TavernPetModelRunner;
}

interface TavernPetMutationOwner {
    sessionId: string;
    actionKey: string;
    epoch: number;
}

interface TavernPetModelOwner {
    sessionId: string;
    kind: Exclude<TavernPetModelRequestKind, ''>;
    key: string;
    epoch: number;
    controller: AbortController;
}

function emptyTavernPetView(): TavernPetView {
    return {
        revision: 0,
        versionId: '',
        existence: 'undiscovered',
        dormant: false,
        displayName: '？？？',
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

export function useTavernPetController(options: TavernPetControllerOptions) {
    const view = ref<TavernPetView>(emptyTavernPetView());
    const journal = ref<ReturnType<typeof projectTavernPetJournalRows>>([]);
    const loading = ref(false);
    const loadError = ref('');
    const actionError = ref('');
    const chatError = ref('');
    const status = ref('');
    const busyAction = ref('');
    const modelRequestKind = ref<TavernPetModelRequestKind>('');
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
    let modelOwner: TavernPetModelOwner | null = null;
    let modelEpoch = 0;
    let pendingLookup = false;
    let pendingScheduleQueued = false;
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
        && view.value.phase !== 'luring'
    ));
    const isChatWaiting = computed(() => modelRequestKind.value === 'chat');
    const isModelWaiting = computed(() => modelRequestKind.value !== '');

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

    function cancelModelRequest(): void {
        modelEpoch += 1;
        modelOwner?.controller.abort();
        modelOwner = null;
        modelRequestKind.value = '';
    }

    function resetState(): void {
        readSequence += 1;
        stateRevision += 1;
        mutationEpoch += 1;
        preparedSessionId = '';
        cancelModelRequest();
        clearMurmurTimer();
        pendingLookup = false;
        pendingScheduleQueued = false;
        seenJournalIds.clear();
        view.value = emptyTavernPetView();
        journal.value = [];
        loading.value = false;
        loadError.value = '';
        actionError.value = '';
        chatError.value = '';
        status.value = '';
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
        if (modelRequestKind.value === 'chat') {return '它还在反应……';}
        return action.enabled ? '' : action.reason;
    }

    const chatBlockedReason = computed(() => {
        const blocked = baseInteractionBlockedReason();
        if (blocked) {return blocked;}
        if (options.chatRunning.value || options.chatCancelling.value) {return '角色正在回复';}
        if (mutationOwner || modelOwner) {return '它还在反应……';}
        const action = findAction('chat');
        if (action) {return action.enabled ? '' : action.reason;}
        if (view.value.dormant) {return '它睡着了';}
        return '它还不会说话';
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
        if (nextView.existence !== 'present') {
            nestOpen.value = false;
            namingOpen.value = false;
            nameDraft.value = '';
            leaveConfirmOpen.value = false;
        }
        if (input.clearTemporary !== false) {temporaryUtterance.value = null;}
        if (input.baseline) {
            nextJournal.forEach((entry) => seenJournalIds.add(entry.id));
        }
    }

    async function refreshPet(input: {
        baseline?: boolean;
        visibleLoading?: boolean;
        clearTemporary?: boolean;
    } = {}): Promise<void> {
        const sessionId = currentSessionId();
        const sequence = ++readSequence;
        const readStateRevision = stateRevision;
        if (!sessionId) {
            resetState();
            return;
        }
        if (input.visibleLoading !== false) {loading.value = true;}
        loadError.value = '';
        try {
            const snapshot = await getTavernPetSnapshot(sessionId);
            if (sequence !== readSequence
                || readStateRevision !== stateRevision
                || sessionId !== currentSessionId()
            ) {return;}
            applyPetSnapshot(snapshot.view, snapshot.journal, input);
            preparedSessionId = sessionId;
        } catch (error) {
            if (sequence !== readSequence
                || readStateRevision !== stateRevision
                || sessionId !== currentSessionId()
            ) {return;}
            loadError.value = tavernPetUiError(error).message;
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

    async function refreshWalletAfterCommit(owns: () => boolean): Promise<void> {
        try {
            await options.wallet.refreshAfterEconomyDomainChange();
        } catch {
            if (!owns()) {return;}
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
        if (!sessionId || mutationOwner || modelRequestKind.value === 'chat') {return null;}
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
            await refreshWalletAfterCommit(owns);
            schedulePendingEvolution();
            return owns() ? result : null;
        } catch (error) {
            if (owns()) {await recoverMutationError(error, owns);}
            return null;
        } finally {
            if (mutationOwner === owner) {
                mutationOwner = null;
                busyAction.value = '';
            }
        }
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
        if (actionId === 'wake') {
            return await runMutation('wake', (boundary) => wakeTavernPet(boundary));
        }
        return await runMutation(actionId, (boundary) => interactWithTavernPet({
            ...boundary,
            interactionId: actionId,
        }));
    }

    function openNest(): void {
        if (view.value.existence !== 'present' || view.value.phase === 'luring') {return;}
        nestOpen.value = true;
    }

    function closeNest(): void {
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
        closeNest();
        closeLeaveConfirmation();
    }

    function openLeaveConfirmation(): void {
        if (view.value.existence !== 'present' || mutationOwner || busyAction.value) {return;}
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

    function beginModelRequest(
        kind: Exclude<TavernPetModelRequestKind, ''>,
        key: string,
    ): TavernPetModelOwner | null {
        const sessionId = currentSessionId();
        if (!sessionId || modelOwner) {return null;}
        const owner: TavernPetModelOwner = {
            sessionId,
            kind,
            key,
            epoch: modelEpoch,
            controller: new AbortController(),
        };
        modelOwner = owner;
        modelRequestKind.value = kind;
        return owner;
    }

    function ownsModelRequest(owner: TavernPetModelOwner): boolean {
        return modelOwner === owner
            && owner.epoch === modelEpoch
            && owner.sessionId === currentSessionId();
    }

    function finishModelRequest(owner: TavernPetModelOwner): void {
        if (modelOwner !== owner) {return;}
        modelOwner = null;
        modelRequestKind.value = '';
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
        const actionId = createActionId('chat');
        const owner = beginModelRequest('chat', actionId);
        if (!owner) {return;}
        actionError.value = '';
        status.value = '';
        temporaryUtterance.value = null;
        try {
            const lateBlocked = baseInteractionBlockedReason();
            if (lateBlocked || options.chatRunning.value || options.chatCancelling.value) {
                chatError.value = lateBlocked || '角色正在回复';
                return;
            }
            const snapshot = await getTavernPetPrivateSnapshotForChat(owner.sessionId);
            if (!ownsModelRequest(owner)) {return;}
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
            if (!ownsModelRequest(owner)) {return;}
            const parsed = parseTavernPetChatResponse(modelResult.text, snapshot.companion.state);
            parsed.warnings.forEach((warning) => {
                console.warn('[LittleWhiteBox/tavern] Pet chat response warning', warning);
            });
            const boundary = await captureTavernPhoneBoundary(owner.sessionId);
            if (!ownsModelRequest(owner)) {return;}
            const result = await commitTavernPetChatResponse({
                sessionId: owner.sessionId,
                boundary,
                actionId,
                expectedRevision: snapshot.companion.revision,
                expectedVersionId: snapshot.companion.versionId,
                playerText,
                response: parsed.response,
            });
            if (!ownsModelRequest(owner)) {return;}
            applyMutationResult(result);
            chatInput.value = '';
            chatError.value = '';
            temporaryUtterance.value = null;
            armMurmur(parsed.response.murmur || '');
            schedulePendingEvolution();
        } catch (error) {
            if (!ownsModelRequest(owner) || isTavernPetAbortError(error)) {return;}
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
            finishModelRequest(owner);
            schedulePendingEvolution();
        }
    }

    function pendingEvolutionBlocked(): boolean {
        return !view.value.pendingEvolution
            || !currentSessionId()
            || options.chatRunning.value
            || options.chatCancelling.value
            || options.memoryEditorMode.value === 'edit'
            || options.characterArchiveBusy.value
            || options.acceptedRollbackBusy.value
            || Boolean(modelOwner);
    }

    async function processPendingEvolution(): Promise<void> {
        if (pendingLookup || pendingEvolutionBlocked()) {return;}
        pendingLookup = true;
        const sessionId = currentSessionId();
        try {
            const request = await getTavernPetPendingEvolutionRequest(sessionId);
            if (!request || sessionId !== currentSessionId() || pendingEvolutionBlocked()) {return;}
            const owner = beginModelRequest('evolution', request.requestId);
            if (!owner) {return;}
            try {
                let verdict = '';
                let usedFallback = false;
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
                    if (!ownsModelRequest(owner)) {return;}
                    verdict = parseTavernPetEvolutionVerdict(modelResult.text);
                } catch (error) {
                    if (!ownsModelRequest(owner) || isTavernPetAbortError(error)) {return;}
                    verdict = tavernPetStaticEvolutionVerdict(request);
                    usedFallback = true;
                }
                const result = await resolveTavernPetEvolution({
                    sessionId: owner.sessionId,
                    requestId: request.requestId,
                    verdict,
                    usedFallback,
                });
                if (!ownsModelRequest(owner)) {return;}
                applyMutationResult(result);
            } catch (error) {
                if (!ownsModelRequest(owner) || isTavernPetAbortError(error)) {return;}
                const uiError = tavernPetUiError(error);
                if (uiError.kind === 'conflict') {
                    stateRevision += 1;
                    await refreshPet({ visibleLoading: false });
                } else {
                    console.warn('[LittleWhiteBox/tavern] Pet evolution resolution failed', error);
                }
            } finally {
                finishModelRequest(owner);
            }
        } catch (error) {
            if (sessionId === currentSessionId() && !isTavernPetAbortError(error)) {
                console.warn('[LittleWhiteBox/tavern] Pet pending evolution read failed', error);
            }
        } finally {
            pendingLookup = false;
        }
    }

    function schedulePendingEvolution(): void {
        if (pendingScheduleQueued) {return;}
        pendingScheduleQueued = true;
        void Promise.resolve().then(async () => {
            pendingScheduleQueued = false;
            await processPendingEvolution();
        });
    }

    async function refreshAfterPetDomainChange(
        journalIds: readonly string[] = [],
    ): Promise<void> {
        const sessionId = currentSessionId();
        if (!sessionId) {return;}
        stateRevision += 1;
        await refreshPet({ visibleLoading: false });
        if (sessionId !== currentSessionId()) {return;}
        const records = await listTavernPetJournalByIds(journalIds);
        if (sessionId !== currentSessionId()) {return;}
        const sourceLocalRecords = records.filter((record) => record.sourceSessionId === sessionId);
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
        options.chatRunning,
        options.chatCancelling,
        options.memoryEditorMode,
        options.characterArchiveBusy,
        options.acceptedRollbackBusy,
    ], schedulePendingEvolution);
    watch([
        options.chatRunning,
        options.chatCancelling,
    ], () => {
        if (options.chatRunning.value || options.chatCancelling.value) {
            cancelModelRequest();
        }
    });
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
            cancelModelRequest();
        }
    });
    onScopeDispose(() => {
        readSequence += 1;
        mutationEpoch += 1;
        cancelModelRequest();
        clearMurmurTimer();
    });

    return {
        actionBlockedReason,
        actionError,
        journal,
        busyAction,
        canSubmitChat,
        chatBlockedReason,
        chatError,
        chatInput,
        deactivatePet,
        closeNaming,
        closeNest,
        closeLeaveConfirmation,
        hasCustomName,
        interactionBlockedReason,
        isChatWaiting,
        isModelWaiting,
        loadError,
        leaveConfirmOpen,
        loading,
        modelRequestKind,
        murmurVisible,
        nameDraft,
        namingOpen,
        nestOpen,
        openNaming,
        openNest,
        openLeaveConfirmation,
        performAction,
        preparePet,
        refreshAfterEconomyDomainChange,
        refreshAfterPetDomainChange,
        refreshPet,
        restoreSpecimenName,
        confirmPetLeave,
        sendChat,
        setInterferenceEnabled,
        status,
        submitName,
        utterance,
        view,
    };
}
