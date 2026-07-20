import { computed, onScopeDispose, ref, watch, type ComputedRef, type Ref } from 'vue';
import type { XbTavernContext } from '../../../../../shared/message-assembler';
import {
    getTavernTaskBoardState,
    replaceTavernTaskBoard,
} from '../../../../../shared/tasks/task-board';
import {
    acceptTavernTaskListing,
    cancelTavernTask,
    getCurrentTavernTask,
    listCurrentTavernTasks,
    listTavernTaskVersions,
    publishTavernTask,
    selectTavernTaskCandidate,
    updateTavernTaskCandidates,
} from '../../../../../shared/tasks/task-service';
import {
    captureTavernTaskPhoneBoundary,
    tavernTaskPhoneBoundaryAnchorOrder,
} from '../../../../../shared/tasks/task-phone-boundary';
import {
    generateTavernTaskRecipe,
    type TavernTaskBoardRecord,
    type TavernTaskCandidate,
    type TavernTaskExpectedPhoneBoundary,
    type TavernTaskGrade,
    type TavernTaskListing,
    type TavernTaskVersionRecord,
} from '../../../../../shared/tasks/task-types';
import { runTavernOnce } from '../../../../runtime/run-once';
import {
    buildTavernTaskPromptLayers,
    type TavernTaskPromptLayers,
} from './tavern-task-context';
import {
    buildTavernTaskBoardRequestMessages,
    buildTavernTaskCandidatesRequestMessages,
} from './tavern-task-prompts';
import {
    parseTavernTaskBoardGenerationResponse,
    parseTavernTaskCandidatesGenerationResponse,
    tavernTaskRequestErrorText,
} from './tavern-task-response';
import { sortTavernTasksByRecent } from './tavern-task-presentation';

const TASK_TIMELINE_PAGE_SIZE = 20;
const TASK_HISTORY_PAGE_SIZE = 20;
const TASK_BOARD_TERMINAL_TITLE_LIMIT = 12;

export interface TavernTaskPublishDraft {
    title: string;
    objective: string;
    requirements: string;
    location: string;
    risk: string;
    reward: string;
    tags: string;
}

export interface TavernTasksControllerOptions {
    selectedSessionId: Ref<string>;
    effectiveContext: ComputedRef<XbTavernContext>;
    agentConfig: Ref<Record<string, unknown>>;
    chatRunning: Ref<boolean>;
    chatCancelling: Ref<boolean>;
    memoryEditorMode: Ref<'preview' | 'edit'>;
    characterArchiveBusy: ComputedRef<boolean>;
    onEconomyChanged?: () => void | Promise<void>;
}

function emptyPublishDraft(): TavernTaskPublishDraft {
    return {
        title: '',
        objective: '',
        requirements: '',
        location: '',
        risk: '',
        reward: '',
        tags: '',
    };
}

function cloneSerializable<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

function isAbortError(error: unknown): boolean {
    return !!error && typeof error === 'object' && String((error as { name?: string }).name || '') === 'AbortError';
}

function normalizeTags(value = ''): string[] {
    return [...new Set(String(value || '').split(/[，,、\n]/u).map((item) => item.trim()).filter(Boolean))].slice(0, 8);
}

export function useTavernTasksController(options: TavernTasksControllerOptions) {
    const board = ref<TavernTaskBoardRecord | null>(null);
    const tasks = ref<TavernTaskVersionRecord[]>([]);
    const dataLoading = ref(false);
    const dataError = ref('');
    const boardRefreshing = ref(false);
    const boardError = ref('');
    const candidateTaskId = ref('');
    const candidateError = ref('');
    const actionKey = ref('');
    const actionError = ref('');
    const selectedTask = ref<TavernTaskVersionRecord | null>(null);
    const taskTimeline = ref<TavernTaskVersionRecord[]>([]);
    const timelineLoading = ref(false);
    const timelineLoadingMore = ref(false);
    const timelineError = ref('');
    const timelineHasMore = ref(false);
    const detailLoading = ref(false);
    const detailError = ref('');
    const detailResolved = ref(false);
    const historyLoadingMore = ref(false);
    const historyHasMore = ref(false);
    const historyError = ref('');
    const publishDraft = ref<TavernTaskPublishDraft>(emptyPublishDraft());
    let dataRequestSequence = 0;
    let detailRequestSequence = 0;
    let actionRequestSequence = 0;
    let boardRequest: { sessionId: string; controller: AbortController } | null = null;
    let candidateRequest: { sessionId: string; taskId: string; controller: AbortController } | null = null;
    const pendingActionIds = new Map<string, string>();
    let mutationRevision = 0;
    let boardEpoch = 1;
    let detailTaskId = '';

    function actionIdFor(operationKey: string): string {
        const existing = pendingActionIds.get(operationKey);
        if (existing) {return existing;}
        const randomId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
        const actionId = `phone-task:${randomId}`;
        pendingActionIds.set(operationKey, actionId);
        return actionId;
    }

    function finishAction(operationKey: string, succeeded: boolean): void {
        if (succeeded) {pendingActionIds.delete(operationKey);}
    }

    const activeTasks = computed(() => sortTavernTasksByRecent(tasks.value.filter((task) => task.status === 'active')));
    const publishedTasks = computed(() => sortTavernTasksByRecent(tasks.value.filter((task) => (
        task.issuer.kind === 'player' && (task.status === 'recruiting' || task.status === 'active')
    ))));
    const historyTasks = computed(() => sortTavernTasksByRecent(tasks.value.filter((task) => (
        task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled'
    ))));
    const interactionBlockedReason = computed(() => {
        if (!currentSessionId()) {return '请先进入一个会话。';}
        if (options.chatRunning.value || options.chatCancelling.value) {return '角色正在回复，任务终端暂时锁定。';}
        if (options.memoryEditorMode.value === 'edit') {return '请先退出记忆编辑，再操作任务终端。';}
        if (options.characterArchiveBusy.value) {return '角色档案正在同步，任务终端暂时锁定。';}
        return '';
    });

    function currentSessionId(): string {
        return String(options.selectedSessionId.value || '').trim();
    }

    function cancelTransientRequests() {
        boardRequest?.controller.abort();
        candidateRequest?.controller.abort();
        boardRequest = null;
        candidateRequest = null;
        boardRefreshing.value = false;
        candidateTaskId.value = '';
    }

    function resetTaskState() {
        dataRequestSequence += 1;
        detailRequestSequence += 1;
        actionRequestSequence += 1;
        cancelTransientRequests();
        board.value = null;
        tasks.value = [];
        dataLoading.value = false;
        dataError.value = '';
        boardError.value = '';
        candidateError.value = '';
        actionKey.value = '';
        actionError.value = '';
        selectedTask.value = null;
        taskTimeline.value = [];
        timelineLoading.value = false;
        timelineLoadingMore.value = false;
        timelineError.value = '';
        timelineHasMore.value = false;
        detailLoading.value = false;
        detailError.value = '';
        detailResolved.value = false;
        historyLoadingMore.value = false;
        historyHasMore.value = false;
        historyError.value = '';
        mutationRevision += 1;
        boardEpoch = 1;
        detailTaskId = '';
        publishDraft.value = emptyPublishDraft();
        pendingActionIds.clear();
    }

    function mergeCurrentTask(task: TavernTaskVersionRecord) {
        tasks.value = sortTavernTasksByRecent([
            task,
            ...tasks.value.filter((item) => item.taskId !== task.taskId),
        ]);
        if (selectedTask.value?.taskId === task.taskId) {selectedTask.value = task;}
        if (taskTimeline.value.some((item) => item.taskId === task.taskId)) {
            taskTimeline.value = [
                task,
                ...taskTimeline.value.filter((item) => item.revision !== task.revision),
            ].sort((left, right) => right.revision - left.revision);
        }
    }

    function markMutation(): void {
        mutationRevision += 1;
    }

    function terminalTasks(rows: TavernTaskVersionRecord[]): TavernTaskVersionRecord[] {
        return rows.filter((task) => ['completed', 'failed', 'cancelled'].includes(task.status));
    }

    async function refreshTaskData(): Promise<void> {
        const sessionId = currentSessionId();
        const requestSequence = ++dataRequestSequence;
        if (!sessionId) {
            resetTaskState();
            return;
        }
        dataLoading.value = true;
        dataError.value = '';
        try {
            for (;;) {
                const readMutationRevision = mutationRevision;
                const [nextBoardState, liveTasks, recentTerminalTasks] = await Promise.all([
                    getTavernTaskBoardState(sessionId),
                    listCurrentTavernTasks(sessionId, { statuses: ['active', 'recruiting'] }),
                    listCurrentTavernTasks(sessionId, {
                        statuses: ['completed', 'failed', 'cancelled'],
                        limit: TASK_HISTORY_PAGE_SIZE,
                    }),
                ]);
                if (requestSequence !== dataRequestSequence || sessionId !== currentSessionId()) {return;}
                if (readMutationRevision !== mutationRevision) {continue;}
                if (nextBoardState.epoch >= boardEpoch) {
                    boardEpoch = nextBoardState.epoch;
                    board.value = nextBoardState.board;
                }
                const nextTasks = sortTavernTasksByRecent([...liveTasks, ...recentTerminalTasks]);
                tasks.value = nextTasks;
                historyHasMore.value = recentTerminalTasks.length === TASK_HISTORY_PAGE_SIZE;
                if (selectedTask.value) {
                    selectedTask.value = nextTasks.find((task) => task.taskId === selectedTask.value?.taskId)
                        || selectedTask.value;
                }
                break;
            }
        } catch (error) {
            if (requestSequence !== dataRequestSequence || sessionId !== currentSessionId()) {return;}
            dataError.value = tavernTaskRequestErrorText(error);
        } finally {
            if (requestSequence === dataRequestSequence) {dataLoading.value = false;}
        }
    }

    async function prepareTasks(): Promise<void> {
        actionError.value = '';
        await refreshTaskData();
    }

    async function currentPhoneBoundary(sessionId: string): Promise<{
        boundary: TavernTaskExpectedPhoneBoundary;
        anchorOrder: number;
    }> {
        const boundary = await captureTavernTaskPhoneBoundary(sessionId);
        return {
            boundary,
            anchorOrder: tavernTaskPhoneBoundaryAnchorOrder(boundary),
        };
    }

    function phoneBoundaryKey(boundary: TavernTaskExpectedPhoneBoundary): string {
        return boundary
            ? `${boundary.messageId}:${boundary.order}:${boundary.timelineRevision}`
            : 'empty-story';
    }

    function knownBoardExclusions(layers: TavernTaskPromptLayers) {
        return {
            excludedTitles: [...new Set([
                ...(board.value?.listings || []).map((listing) => listing.title),
                ...tasks.value
                    .filter((task) => task.status === 'active' || task.status === 'recruiting')
                    .map((task) => task.title),
                ...terminalTasks(sortTavernTasksByRecent(tasks.value))
                    .slice(0, TASK_BOARD_TERMINAL_TITLE_LIMIT)
                    .map((task) => task.title),
            ])],
            excludedIssuerNames: layers.knownNames,
        };
    }

    async function refreshTaskBoard(): Promise<void> {
        const blocked = interactionBlockedReason.value;
        const sessionId = currentSessionId();
        if (blocked || !sessionId || boardRefreshing.value || dataLoading.value) {
            boardError.value = blocked || (dataLoading.value ? '任务数据仍在读取，请稍候。' : '');
            return;
        }
        boardRequest?.controller.abort();
        const controller = new AbortController();
        boardRequest = { sessionId, controller };
        const expectedRevision = Number(board.value?.revision) || 0;
        const expectedEpoch = boardEpoch;
        const contextSnapshot = cloneSerializable(options.effectiveContext.value || {});
        const agentConfig = cloneSerializable(options.agentConfig.value || {});
        const taskSnapshot = cloneSerializable(tasks.value);
        const recipe = generateTavernTaskRecipe();
        boardRefreshing.value = true;
        boardError.value = '';
        try {
            const { boundary, anchorOrder } = await currentPhoneBoundary(sessionId);
            const layers = await buildTavernTaskPromptLayers({
                sessionId,
                anchorOrder,
                contextSnapshot,
                queryText: '地下委托、工作机会、当前危机、地点与可行动线索',
            });
            if (controller.signal.aborted || sessionId !== currentSessionId()) {return;}
            const exclusions = knownBoardExclusions(layers);
            const result = await runTavernOnce({
                agentConfig,
                providerRole: 'delegate',
                messages: buildTavernTaskBoardRequestMessages({
                    layers,
                    currentTasks: taskSnapshot,
                    recipe,
                    excludedTitles: exclusions.excludedTitles,
                }),
                tools: [],
                toolChoice: 'none',
                signal: controller.signal,
                promptDiagnostics: { channel: 'phone-tasks', operation: 'refresh-board' },
            });
            if (controller.signal.aborted || sessionId !== currentSessionId()) {return;}
            const listings = parseTavernTaskBoardGenerationResponse(result.text, exclusions);
            const nextBoard = await replaceTavernTaskBoard({
                sessionId,
                expectedRevision,
                expectedEpoch,
                boundary,
                listings,
            });
            if (controller.signal.aborted || sessionId !== currentSessionId()) {return;}
            markMutation();
            if (nextBoard.epoch > boardEpoch) {
                boardEpoch = nextBoard.epoch;
                board.value = nextBoard;
            }
        } catch (error) {
            if (!isAbortError(error) && sessionId === currentSessionId()) {
                boardError.value = tavernTaskRequestErrorText(error);
            }
        } finally {
            if (boardRequest?.controller === controller) {
                boardRequest = null;
                boardRefreshing.value = false;
            }
        }
    }

    function isListingAccepted(listing: TavernTaskListing): boolean {
        const boardId = board.value?.generationId;
        return !!boardId && tasks.value.some((task) => (
            task.sourceBoardId === boardId && task.sourceListingId === listing.id
        ));
    }

    async function runTaskMutation(
        sessionId: string,
        key: string,
        callback: (input: {
            boundary: TavernTaskExpectedPhoneBoundary;
            anchorOrder: number;
        }) => Promise<TavernTaskVersionRecord>,
        economyChanged = false,
    ): Promise<TavernTaskVersionRecord | null> {
        const blocked = interactionBlockedReason.value;
        const operationSessionId = String(sessionId || '').trim();
        if (!operationSessionId || operationSessionId !== currentSessionId()) {return null;}
        if (blocked || actionKey.value) {
            actionError.value = blocked || '另一项任务操作仍在处理。';
            return null;
        }
        const requestSequence = ++actionRequestSequence;
        actionKey.value = key;
        actionError.value = '';
        try {
            const boundary = await currentPhoneBoundary(operationSessionId);
            if (requestSequence !== actionRequestSequence || operationSessionId !== currentSessionId()) {return null;}
            const version = await callback(boundary);
            if (
                requestSequence !== actionRequestSequence
                || operationSessionId !== currentSessionId()
                || version.sessionId !== operationSessionId
            ) {return null;}
            markMutation();
            mergeCurrentTask(version);
            if (economyChanged) {
                await options.onEconomyChanged?.();
                if (requestSequence !== actionRequestSequence || operationSessionId !== currentSessionId()) {return null;}
            }
            return version;
        } catch (error) {
            if (requestSequence === actionRequestSequence && operationSessionId === currentSessionId()) {
                actionError.value = tavernTaskRequestErrorText(error);
            }
            return null;
        } finally {
            if (requestSequence === actionRequestSequence && actionKey.value === key) {actionKey.value = '';}
        }
    }

    async function acceptListing(listing: TavernTaskListing): Promise<TavernTaskVersionRecord | null> {
        const sessionId = currentSessionId();
        const boardSnapshot = board.value;
        if (!sessionId || !boardSnapshot || isListingAccepted(listing)) {return null;}
        const playerName = String(options.effectiveContext.value.user?.name || '玩家');
        let operationKey = '';
        const version = await runTaskMutation(sessionId, `accept:${listing.id}`, ({ boundary, anchorOrder }) => {
            operationKey = `accept:${JSON.stringify([
                sessionId,
                boardSnapshot.generationId,
                boardSnapshot.revision,
                boardSnapshot.epoch,
                listing.id,
                anchorOrder,
                phoneBoundaryKey(boundary),
            ])}`;
            return acceptTavernTaskListing({
                sessionId,
                boardId: boardSnapshot.generationId,
                generationId: boardSnapshot.generationId,
                boardRevision: boardSnapshot.revision,
                boardEpoch: boardSnapshot.epoch,
                listingId: listing.id,
                boundary,
                actionId: actionIdFor(operationKey),
                playerName,
            });
        }, true);
        if (operationKey) {finishAction(operationKey, !!version);}
        return version;
    }

    async function publishDraftTask(): Promise<TavernTaskVersionRecord | null> {
        const sessionId = currentSessionId();
        const draft = cloneSerializable(publishDraft.value);
        if (!sessionId) {return null;}
        if (!draft.title.trim() || !draft.objective.trim() || !draft.location.trim()) {
            actionError.value = '标题、目标与地点必须填写完整。';
            return null;
        }
        const reward = Number(draft.reward);
        if (!Number.isSafeInteger(reward) || reward <= 0) {
            actionError.value = '报酬必须是正整数。';
            return null;
        }
        const tags = normalizeTags(draft.tags);
        const playerName = String(options.effectiveContext.value.user?.name || '玩家');
        let operationKey = '';
        const version = await runTaskMutation(sessionId, 'publish', ({ boundary, anchorOrder }) => {
            operationKey = `publish:${JSON.stringify([
                sessionId,
                anchorOrder,
                phoneBoundaryKey(boundary),
                draft.title,
                draft.objective,
                draft.requirements,
                draft.location,
                draft.risk,
                reward,
                tags,
            ])}`;
            return publishTavernTask({
                sessionId,
                title: draft.title,
                objective: draft.objective,
                requirements: draft.requirements,
                location: draft.location,
                risk: draft.risk,
                reward,
                boundary,
                actionId: actionIdFor(operationKey),
                playerName,
                grade: 'CUSTOM' as TavernTaskGrade,
                tags,
            });
        }, true);
        if (operationKey) {finishAction(operationKey, !!version);}
        if (version) {publishDraft.value = emptyPublishDraft();}
        return version;
    }

    async function recruitTaskCandidates(task: TavernTaskVersionRecord): Promise<TavernTaskVersionRecord | null> {
        const blocked = interactionBlockedReason.value;
        const sessionId = currentSessionId();
        if (blocked || !sessionId || candidateTaskId.value) {
            candidateError.value = blocked || '另一份招募请求仍在处理中。';
            return null;
        }
        candidateRequest?.controller.abort();
        const controller = new AbortController();
        candidateRequest = { sessionId, taskId: task.taskId, controller };
        const taskSnapshot = cloneSerializable(task);
        const contextSnapshot = cloneSerializable(options.effectiveContext.value || {});
        const agentConfig = cloneSerializable(options.agentConfig.value || {});
        candidateTaskId.value = task.taskId;
        candidateError.value = '';
        try {
            const { boundary, anchorOrder } = await currentPhoneBoundary(sessionId);
            const operationKey = `candidates:${JSON.stringify([
                sessionId,
                taskSnapshot.taskId,
                taskSnapshot.revision,
                anchorOrder,
                phoneBoundaryKey(boundary),
            ])}`;
            const layers = await buildTavernTaskPromptLayers({
                sessionId,
                anchorOrder,
                contextSnapshot,
                queryText: `${task.title}\n${task.objective}\n${task.requirements || ''}\n${task.location}`,
            });
            if (controller.signal.aborted || sessionId !== currentSessionId()) {return null;}
            const result = await runTavernOnce({
                agentConfig,
                providerRole: 'delegate',
                messages: buildTavernTaskCandidatesRequestMessages({ layers, task: taskSnapshot }),
                tools: [],
                toolChoice: 'none',
                signal: controller.signal,
                promptDiagnostics: { channel: 'phone-tasks', operation: 'recruit-candidates', taskId: task.taskId },
            });
            if (controller.signal.aborted || sessionId !== currentSessionId()) {return null;}
            const candidates = parseTavernTaskCandidatesGenerationResponse(result.text, {
                knownNames: layers.knownNames,
            });
            const version = await updateTavernTaskCandidates({
                sessionId,
                taskId: taskSnapshot.taskId,
                expectedRevision: taskSnapshot.revision,
                expectedVersionId: taskSnapshot.versionId,
                candidates,
                boundary,
                actionId: actionIdFor(operationKey),
            });
            if (controller.signal.aborted || sessionId !== currentSessionId()) {return null;}
            markMutation();
            mergeCurrentTask(version);
            finishAction(operationKey, true);
            return version;
        } catch (error) {
            if (!isAbortError(error) && sessionId === currentSessionId()) {
                candidateError.value = tavernTaskRequestErrorText(error);
            }
            return null;
        } finally {
            if (candidateRequest?.controller === controller) {
                candidateRequest = null;
                candidateTaskId.value = '';
            }
        }
    }

    async function selectCandidate(
        task: TavernTaskVersionRecord,
        candidate: TavernTaskCandidate,
    ): Promise<TavernTaskVersionRecord | null> {
        const sessionId = currentSessionId();
        if (!sessionId || task.sessionId !== sessionId) {return null;}
        let operationKey = '';
        const version = await runTaskMutation(sessionId, `select:${task.taskId}:${candidate.id}`, ({ boundary, anchorOrder }) => {
            operationKey = `select:${JSON.stringify([
                sessionId,
                task.taskId,
                task.revision,
                task.versionId,
                candidate.id,
                anchorOrder,
                phoneBoundaryKey(boundary),
            ])}`;
            return selectTavernTaskCandidate({
                sessionId,
                taskId: task.taskId,
                expectedRevision: task.revision,
                expectedVersionId: task.versionId,
                candidateId: candidate.id,
                boundary,
                actionId: actionIdFor(operationKey),
            });
        });
        if (operationKey) {finishAction(operationKey, !!version);}
        return version;
    }

    async function withdrawTask(task: TavernTaskVersionRecord): Promise<TavernTaskVersionRecord | null> {
        const sessionId = currentSessionId();
        if (!sessionId || task.sessionId !== sessionId) {return null;}
        let operationKey = '';
        const version = await runTaskMutation(sessionId, `withdraw:${task.taskId}`, ({ boundary, anchorOrder }) => {
            operationKey = `withdraw:${JSON.stringify([
                sessionId,
                task.taskId,
                task.revision,
                task.versionId,
                anchorOrder,
                phoneBoundaryKey(boundary),
            ])}`;
            return cancelTavernTask({
                sessionId,
                taskId: task.taskId,
                expectedRevision: task.revision,
                expectedVersionId: task.versionId,
                boundary,
                actionId: actionIdFor(operationKey),
            });
        }, true);
        if (operationKey) {finishAction(operationKey, !!version);}
        return version;
    }

    async function loadTaskDetail(taskId = '', reset = true): Promise<void> {
        const sessionId = currentSessionId();
        const id = String(taskId || '').trim();
        const requestSequence = ++detailRequestSequence;
        detailTaskId = id;
        if (candidateRequest && candidateRequest.taskId !== id) {
            candidateRequest.controller.abort();
            candidateRequest = null;
            candidateTaskId.value = '';
        }
        candidateError.value = '';
        selectedTask.value = null;
        detailResolved.value = false;
        detailError.value = '';
        if (!sessionId || !id) {
            taskTimeline.value = [];
            timelineHasMore.value = false;
            detailLoading.value = false;
            return;
        }
        detailLoading.value = true;
        if (reset) {
            timelineLoading.value = true;
            timelineError.value = '';
            taskTimeline.value = [];
        }
        const stillCurrent = () => requestSequence === detailRequestSequence
            && sessionId === currentSessionId()
            && id === detailTaskId;
        const readCurrent = async () => {
            for (;;) {
                const readMutationRevision = mutationRevision;
                const current = await getCurrentTavernTask(sessionId, id);
                if (!stillCurrent()) {return undefined;}
                if (readMutationRevision !== mutationRevision) {continue;}
                return current;
            }
        };
        const readTimeline = async () => {
            for (;;) {
                const readMutationRevision = mutationRevision;
                const versions = await listTavernTaskVersions(sessionId, id, {
                    offset: 0,
                    limit: TASK_TIMELINE_PAGE_SIZE,
                });
                if (!stillCurrent()) {return undefined;}
                if (readMutationRevision !== mutationRevision) {continue;}
                return versions;
            }
        };
        const currentPromise = readCurrent()
            .then((current) => {
                if (!stillCurrent() || current === undefined) {return;}
                selectedTask.value = current;
                detailResolved.value = true;
            })
            .catch((error) => {
                if (stillCurrent()) {detailError.value = tavernTaskRequestErrorText(error);}
            })
            .finally(() => {
                if (stillCurrent()) {detailLoading.value = false;}
            });
        const timelinePromise = readTimeline()
            .then((versions) => {
                if (!stillCurrent() || versions === undefined) {return;}
                taskTimeline.value = versions;
                timelineHasMore.value = versions.length === TASK_TIMELINE_PAGE_SIZE;
            })
            .catch(() => {
                if (stillCurrent()) {timelineError.value = '记录暂时无法加载，请稍后重试。';}
            })
            .finally(() => {
                if (stillCurrent()) {timelineLoading.value = false;}
            });
        await Promise.all([currentPromise, timelinePromise]);
    }

    async function loadMoreTaskTimeline(): Promise<void> {
        const sessionId = currentSessionId();
        const taskId = selectedTask.value?.taskId || '';
        if (!sessionId || !taskId || !timelineHasMore.value || timelineLoadingMore.value) {return;}
        const requestSequence = detailRequestSequence;
        const readMutationRevision = mutationRevision;
        timelineLoadingMore.value = true;
        timelineError.value = '';
        try {
            const versions = await listTavernTaskVersions(sessionId, taskId, {
                offset: taskTimeline.value.length,
                limit: TASK_TIMELINE_PAGE_SIZE,
            });
            if (
                requestSequence !== detailRequestSequence
                || sessionId !== currentSessionId()
                || readMutationRevision !== mutationRevision
            ) {return;}
            const versionIds = new Set(taskTimeline.value.map((item) => item.versionId));
            taskTimeline.value = [
                ...taskTimeline.value,
                ...versions.filter((item) => !versionIds.has(item.versionId)),
            ];
            timelineHasMore.value = versions.length === TASK_TIMELINE_PAGE_SIZE;
        } catch (error) {
            if (requestSequence !== detailRequestSequence || sessionId !== currentSessionId()) {return;}
            timelineError.value = tavernTaskRequestErrorText(error);
        } finally {
            if (requestSequence === detailRequestSequence) {timelineLoadingMore.value = false;}
        }
    }

    function taskById(taskId = ''): TavernTaskVersionRecord | null {
        const id = String(taskId || '').trim();
        return tasks.value.find((task) => task.taskId === id) || null;
    }

    async function loadMoreHistory(): Promise<void> {
        const sessionId = currentSessionId();
        if (!sessionId || historyLoadingMore.value || !historyHasMore.value) {return;}
        const requestSequence = dataRequestSequence;
        const readMutationRevision = mutationRevision;
        const currentTerminal = terminalTasks(tasks.value);
        historyLoadingMore.value = true;
        historyError.value = '';
        try {
            const rows = await listCurrentTavernTasks(sessionId, {
                statuses: ['completed', 'failed', 'cancelled'],
                offset: currentTerminal.length,
                limit: TASK_HISTORY_PAGE_SIZE,
            });
            if (
                requestSequence !== dataRequestSequence
                || sessionId !== currentSessionId()
                || readMutationRevision !== mutationRevision
            ) {return;}
            const known = new Set(tasks.value.map((task) => task.versionId));
            tasks.value = sortTavernTasksByRecent([
                ...tasks.value,
                ...rows.filter((task) => !known.has(task.versionId)),
            ]);
            historyHasMore.value = rows.length === TASK_HISTORY_PAGE_SIZE;
        } catch (error) {
            if (requestSequence === dataRequestSequence && sessionId === currentSessionId()) {
                historyError.value = tavernTaskRequestErrorText(error);
            }
        } finally {
            historyLoadingMore.value = false;
        }
    }

    async function refreshAfterTaskDomainChange(): Promise<void> {
        const currentDetailId = detailTaskId;
        markMutation();
        await refreshTaskData();
        if (currentDetailId && currentDetailId === detailTaskId) {
            await loadTaskDetail(currentDetailId);
        }
    }

    watch(options.selectedSessionId, resetTaskState);
    onScopeDispose(cancelTransientRequests);

    return {
        acceptListing,
        actionError,
        actionKey,
        activeTasks,
        board,
        boardError,
        boardRefreshing,
        cancelTransientRequests,
        candidateError,
        candidateTaskId,
        dataError,
        dataLoading,
        detailError,
        detailLoading,
        detailResolved,
        historyError,
        historyHasMore,
        historyLoadingMore,
        historyTasks,
        interactionBlockedReason,
        isListingAccepted,
        loadMoreTaskTimeline,
        loadMoreHistory,
        loadTaskDetail,
        prepareTasks,
        publishDraft,
        publishDraftTask,
        publishedTasks,
        recruitTaskCandidates,
        refreshTaskBoard,
        refreshTaskData,
        refreshAfterTaskDomainChange,
        selectedTask,
        selectCandidate,
        taskById,
        tasks,
        taskTimeline,
        timelineError,
        timelineHasMore,
        timelineLoading,
        timelineLoadingMore,
        withdrawTask,
    };
}
