import { computed, onScopeDispose, ref, watch, type ComputedRef, type Ref } from 'vue';
import type { XbTavernContext } from '../../../../../shared/message-assembler';
import { getLatestTavernMessage } from '../../../../../shared/session-db';
import {
    getTavernTaskBoard,
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
    generateTavernTaskRecipe,
    type TavernTaskBoardRecord,
    type TavernTaskCandidate,
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
    const publishDraft = ref<TavernTaskPublishDraft>(emptyPublishDraft());
    let dataRequestSequence = 0;
    let detailRequestSequence = 0;
    let actionRequestSequence = 0;
    let boardRequest: { sessionId: string; controller: AbortController } | null = null;
    let candidateRequest: { sessionId: string; taskId: string; controller: AbortController } | null = null;
    const pendingActionIds = new Map<string, string>();

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
            const [nextBoard, nextTasks] = await Promise.all([
                getTavernTaskBoard(sessionId),
                listCurrentTavernTasks(sessionId),
            ]);
            if (requestSequence !== dataRequestSequence || sessionId !== currentSessionId()) {return;}
            board.value = nextBoard;
            tasks.value = sortTavernTasksByRecent(nextTasks);
            if (selectedTask.value) {
                selectedTask.value = nextTasks.find((task) => task.taskId === selectedTask.value?.taskId) || null;
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

    async function currentAnchorOrder(sessionId: string): Promise<number> {
        return Number((await getLatestTavernMessage(sessionId))?.order ?? -1);
    }

    function knownBoardExclusions(layers: TavernTaskPromptLayers) {
        return {
            excludedTitles: [...new Set([
                ...(board.value?.listings || []).map((listing) => listing.title),
                ...tasks.value.map((task) => task.title),
            ])],
            excludedIssuerNames: layers.knownNames,
        };
    }

    async function refreshTaskBoard(): Promise<void> {
        const blocked = interactionBlockedReason.value;
        const sessionId = currentSessionId();
        if (blocked || !sessionId || boardRefreshing.value) {
            boardError.value = blocked;
            return;
        }
        boardRequest?.controller.abort();
        const controller = new AbortController();
        boardRequest = { sessionId, controller };
        const expectedRevision = Number(board.value?.revision) || 0;
        const contextSnapshot = cloneSerializable(options.effectiveContext.value || {});
        const agentConfig = cloneSerializable(options.agentConfig.value || {});
        const taskSnapshot = cloneSerializable(tasks.value);
        const recipe = generateTavernTaskRecipe();
        boardRefreshing.value = true;
        boardError.value = '';
        try {
            const anchorOrder = await currentAnchorOrder(sessionId);
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
                anchorOrder,
                listings,
            });
            if (controller.signal.aborted || sessionId !== currentSessionId()) {return;}
            board.value = nextBoard;
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
        callback: (anchorOrder: number) => Promise<TavernTaskVersionRecord>,
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
            const anchorOrder = await currentAnchorOrder(operationSessionId);
            if (requestSequence !== actionRequestSequence || operationSessionId !== currentSessionId()) {return null;}
            const version = await callback(anchorOrder);
            if (
                requestSequence !== actionRequestSequence
                || operationSessionId !== currentSessionId()
                || version.sessionId !== operationSessionId
            ) {return null;}
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
        const version = await runTaskMutation(sessionId, `accept:${listing.id}`, (anchorOrder) => {
            operationKey = `accept:${JSON.stringify([
                sessionId,
                boardSnapshot.generationId,
                boardSnapshot.revision,
                listing.id,
                anchorOrder,
            ])}`;
            return acceptTavernTaskListing({
                sessionId,
                boardId: boardSnapshot.generationId,
                generationId: boardSnapshot.generationId,
                boardRevision: boardSnapshot.revision,
                listingId: listing.id,
                anchorOrder,
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
        const version = await runTaskMutation(sessionId, 'publish', (anchorOrder) => {
            operationKey = `publish:${JSON.stringify([
                sessionId,
                anchorOrder,
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
                anchorOrder,
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
            const anchorOrder = await currentAnchorOrder(sessionId);
            const operationKey = `candidates:${JSON.stringify([
                sessionId,
                taskSnapshot.taskId,
                taskSnapshot.revision,
                anchorOrder,
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
                candidates,
                anchorOrder,
                actionId: actionIdFor(operationKey),
            });
            if (controller.signal.aborted || sessionId !== currentSessionId()) {return null;}
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
        const version = await runTaskMutation(sessionId, `select:${task.taskId}:${candidate.id}`, (anchorOrder) => {
            operationKey = `select:${JSON.stringify([
                sessionId,
                task.taskId,
                task.revision,
                candidate.id,
                anchorOrder,
            ])}`;
            return selectTavernTaskCandidate({
                sessionId,
                taskId: task.taskId,
                expectedRevision: task.revision,
                candidateId: candidate.id,
                anchorOrder,
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
        const version = await runTaskMutation(sessionId, `withdraw:${task.taskId}`, (anchorOrder) => {
            operationKey = `withdraw:${JSON.stringify([
                sessionId,
                task.taskId,
                task.revision,
                anchorOrder,
            ])}`;
            return cancelTavernTask({
                sessionId,
                taskId: task.taskId,
                expectedRevision: task.revision,
                anchorOrder,
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
        if (candidateRequest && candidateRequest.taskId !== id) {
            candidateRequest.controller.abort();
            candidateRequest = null;
            candidateTaskId.value = '';
        }
        candidateError.value = '';
        if (!sessionId || !id) {
            selectedTask.value = null;
            taskTimeline.value = [];
            timelineHasMore.value = false;
            return;
        }
        if (reset) {
            timelineLoading.value = true;
            timelineError.value = '';
            taskTimeline.value = [];
        }
        try {
            const [current, versions] = await Promise.all([
                getCurrentTavernTask(sessionId, id),
                listTavernTaskVersions(sessionId, id, { offset: 0, limit: TASK_TIMELINE_PAGE_SIZE }),
            ]);
            if (requestSequence !== detailRequestSequence || sessionId !== currentSessionId()) {return;}
            selectedTask.value = current;
            taskTimeline.value = versions;
            timelineHasMore.value = versions.length === TASK_TIMELINE_PAGE_SIZE;
        } catch (error) {
            if (requestSequence !== detailRequestSequence || sessionId !== currentSessionId()) {return;}
            timelineError.value = tavernTaskRequestErrorText(error);
        } finally {
            if (requestSequence === detailRequestSequence) {timelineLoading.value = false;}
        }
    }

    async function loadMoreTaskTimeline(): Promise<void> {
        const sessionId = currentSessionId();
        const taskId = selectedTask.value?.taskId || '';
        if (!sessionId || !taskId || !timelineHasMore.value || timelineLoadingMore.value) {return;}
        const requestSequence = detailRequestSequence;
        timelineLoadingMore.value = true;
        timelineError.value = '';
        try {
            const versions = await listTavernTaskVersions(sessionId, taskId, {
                offset: taskTimeline.value.length,
                limit: TASK_TIMELINE_PAGE_SIZE,
            });
            if (requestSequence !== detailRequestSequence || sessionId !== currentSessionId()) {return;}
            const revisions = new Set(taskTimeline.value.map((item) => item.revision));
            taskTimeline.value = [
                ...taskTimeline.value,
                ...versions.filter((item) => !revisions.has(item.revision)),
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
        historyTasks,
        interactionBlockedReason,
        isListingAccepted,
        loadMoreTaskTimeline,
        loadTaskDetail,
        prepareTasks,
        publishDraft,
        publishDraftTask,
        publishedTasks,
        recruitTaskCandidates,
        refreshTaskBoard,
        refreshTaskData,
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
