import { normalizeTaskPublishedForm } from '../../../domains/tasks/invariants.js';
import type { TaskPublishedForm } from '../../../domains/tasks/types.js';
import type { XiaobaiOsHostFrameMessage } from '../../../host/frame-bridge.js';
import type { MaintenanceRunner } from '../../../capabilities/maintenance/runner.js';
import type { EconomyReadCapability } from '../../../capabilities/economy/index.js';
import type { XiaobaiOsSettingsRepository } from '../../../host/settings-repository.js';
import type {
    XiaobaiOsAppActivationContext,
    XiaobaiOsAppRuntime,
    XiaobaiOsChatIdentity,
} from '../../../types.js';
import type { TasksService, TasksServiceView } from '../application/service.js';
import type { TaskGenerationRequests } from '../generation/request.js';
import { createTaskGenerationRuntime } from '../generation/runtime.js';
import type { TasksPresentation, TasksSettings } from '../types.js';
import { presentTaskDetail, presentTaskHistory, presentTasksState } from './presentation.js';
import { observeBackgroundTask } from '../../../../../shared/common/async-errors.js';


type UnknownRecord = Record<string, unknown>;

interface TaskActivation {
    chatIdentity: string;
    post: XiaobaiOsAppActivationContext['post'];
}

type TaskControllerService = Pick<TasksService,
    | 'ensureReady'
    | 'readCurrent'
    | 'refreshCurrent'
    | 'createActionId'
    | 'acceptListing'
    | 'publish'
    | 'assignCandidate'
    | 'cancel'
    | 'cancelCommission'
    | 'readCommission'
    | 'getWriteState'
> & {
    confirmPending(): Promise<{ status: string }>;
    adoptServerState(): Promise<{ status: string }>;
};

export interface TaskControllerRuntimeDependencies {
    tasks: TaskControllerService;
    economy: EconomyReadCapability;
    generation: TaskGenerationRequests;
    settings: Pick<XiaobaiOsSettingsRepository, 'read' | 'setTasksAutoMaintenance' | 'subscribe'>;
    maintenance: Pick<
        MaintenanceRunner,
        'startManual' | 'cancelRequested' | 'invalidateAutomatic' | 'getStatus' | 'subscribeStatus'
    >;
    getChatIdentity: () => XiaobaiOsChatIdentity | { key?: unknown } | string | null;
    isMainGenerationActive: () => boolean;
    subscribeGeneration: (listener: (active: boolean) => void) => () => void;
    subscribeData: (listener: () => void) => () => void;
    schedule?: (task: () => void | Promise<void>) => void;
    report?: (error: unknown) => void;
}

function isRecord(value: unknown): value is UnknownRecord {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function identityKey(identity: ReturnType<TaskControllerRuntimeDependencies['getChatIdentity']>): string {
    return typeof identity === 'string' ? identity : String(identity?.key || '');
}

function requireId(value: unknown, code: string): string {
    const id = typeof value === 'string' ? value : '';
    if (!id || id !== id.trim() || Array.from(id).length > 160 || /[\u0000-\u001f\u007f-\u009f]/u.test(id)) {
        throw new Error(code);
    }
    return id;
}

function requireTaskCas(payload: UnknownRecord): {
    taskId: string;
    expectedTaskRevision: number;
    expectedEventId: string;
} {
    const revision = payload.expectedTaskRevision;
    if (!Number.isSafeInteger(revision) || Number(revision) < 1) {throw new Error('tasks_request_invalid');}
    return {
        taskId: requireId(payload.taskId, 'tasks_request_invalid'),
        expectedTaskRevision: Number(revision),
        expectedEventId: requireId(payload.expectedEventId, 'tasks_request_invalid'),
    };
}

function publicError(error: unknown): Error {
    const code = isRecord(error) && typeof error.code === 'string' ? error.code : '';
    if (code === 'economy_insufficient_funds') {return new Error('tasks_insufficient_funds');}
    if (code === 'SAVE_UNCONFIRMED' || code === 'storage_unconfirmed') {return new Error('tasks_save_unconfirmed');}
    if (code === 'SAVE_CONFLICT' || code === 'storage_conflict') {return new Error('tasks_save_conflict');}
    if (code === 'CHAT_CHANGED' || code === 'chat_changed') {return new Error('tasks_chat_changed');}
    if (code === 'task_listing_already_accepted') {return new Error('tasks_listing_already_accepted');}
    if (code === 'task_terminal') {return new Error('tasks_terminal');}
    if (code.startsWith('task_')) {return new Error('tasks_state_changed');}
    const message = error instanceof Error ? error.message : '';
    if (message === 'tasks_commit_guard_failed') {return new Error('tasks_state_changed');}
    return new Error('tasks_operation_failed');
}

export function createTaskControllerRuntime({
    tasks,
    economy,
    generation,
    settings,
    maintenance,
    getChatIdentity,
    isMainGenerationActive,
    subscribeGeneration,
    subscribeData,
    schedule = task => { globalThis.setTimeout(() => { observeBackgroundTask(task(), { source: import.meta.url, operation: "callback" }); }, 0); },
    report = error => console.error('[LittleWhiteBox] Tasks controller failed', error),
}: TaskControllerRuntimeDependencies): XiaobaiOsAppRuntime & {
    activate: NonNullable<XiaobaiOsAppRuntime['activate']>;
    handleMessage: NonNullable<XiaobaiOsAppRuntime['handleMessage']>;
} {
    let activation: TaskActivation | null = null;
    let preparation: { activation: TaskActivation; error: string } | null = null;
    let localWriteBusy = false;
    let unsubscribeData: (() => void) | null = null;
    let unsubscribeGeneration: (() => void) | null = null;
    let unsubscribeSettings: (() => void) | null = null;
    let unsubscribeMaintenance: (() => void) | null = null;

    const currentChatIdentity = () => identityKey(getChatIdentity());
    const backgroundGeneration = createTaskGenerationRuntime({
        requests: generation,
        getChatIdentity: currentChatIdentity,
        onChange: emitCurrentState,
        report,
    });

    function assertActivation(payload: UnknownRecord = {}): TaskActivation {
        if (!activation) {throw new Error('tasks_app_inactive');}
        const current = currentChatIdentity();
        if (!current || current !== activation.chatIdentity || String(payload.chatIdentity || '') !== current) {
            throw new Error('tasks_chat_changed');
        }
        return activation;
    }

    function assertSameActivation(expected: TaskActivation, payload: UnknownRecord): void {
        if (assertActivation(payload) !== expected) {throw new Error('tasks_page_changed');}
    }

    function serviceView(): TasksServiceView {
        const view = tasks.readCurrent();
        if (economy.isOpen()) {return view;}
        return {
            ...view,
            domain: null,
            records: [],
            playerBalance: 0,
        };
    }

    function taskSettings(): TasksSettings {
        return settings.read()?.apps.tasks ?? { autoMaintenance: false };
    }

    function buildState(chatIdentity: string): TasksPresentation {
        const view = serviceView();
        backgroundGeneration.reconcileSave(chatIdentity, !view.pendingSave && view.writeState === 'ready');
        const generationState = backgroundGeneration.getState(chatIdentity);
        const state = presentTasksState({
            chatIdentity,
            serviceView: view,
            settings: taskSettings(),
            economyReady: economy.isOpen(),
            generationActive: isMainGenerationActive() || generationState.state === 'running',
            generation: generationState,
            maintenanceStatus: maintenance.getStatus('tasks', chatIdentity),
        });
        if (state.status === 'unconfirmed' || state.status === 'conflict') {return state;}
        if (!preparation || preparation.activation !== activation || state.status === 'ready') {return state;}
        if (preparation.error) {return { ...state, status: 'blocked', message: preparation.error };}
        return { ...state, status: 'loading', message: '' };
    }

    function emitState(current = activation): TasksPresentation {
        if (!current) {throw new Error('tasks_app_inactive');}
        const state = buildState(current.chatIdentity);
        current.post('tasks/state', { state });
        return state;
    }

    function emitCurrentState(): void {
        const current = activation;
        if (!current || currentChatIdentity() !== current.chatIdentity) {return;}
        try {emitState(current);} catch (error) {
            report(error);
            current.post('tasks/error', { code: 'tasks_state_unavailable' });
        }
    }

    function schedulePreparation(current: TaskActivation): void {
        const pending = { activation: current, error: '' };
        preparation = pending;
        schedule(() => {
            if (preparation !== pending || activation !== current || currentChatIdentity() !== current.chatIdentity) {return;}
            void tasks.ensureReady(undefined, current.chatIdentity).then(() => economy.ensureOpen()).then(() => {
                if (preparation !== pending || activation !== current || currentChatIdentity() !== current.chatIdentity) {return;}
                preparation = null;
                emitState(current);
            }).catch((error) => {
                if (preparation !== pending || activation !== current || currentChatIdentity() !== current.chatIdentity) {return;}
                report(error);
                preparation = { activation: current, error: '任务数据暂时无法读取，请稍后重试。' };
                emitState(current);
            });
        });
    }

    function commitGuard(current: TaskActivation): boolean {
        return activation === current
            && currentChatIdentity() === current.chatIdentity
            && !isMainGenerationActive()
            && tasks.getWriteState() === 'ready';
    }

    function assertWritable(current: TaskActivation): void {
        if (localWriteBusy) {throw new Error('tasks_operation_busy');}
        if (backgroundGeneration.getState(current.chatIdentity).state === 'running' || isMainGenerationActive()) {
            throw new Error('tasks_generation_active');
        }
        if (tasks.getWriteState() !== 'ready') {throw new Error('tasks_write_blocked');}
        if (!economy.isOpen() || activation !== current || currentChatIdentity() !== current.chatIdentity) {
            throw new Error('tasks_state_unavailable');
        }
    }

    async function runLocal<T>(
        current: TaskActivation,
        payload: UnknownRecord,
        command: (actionId: string) => Promise<T>,
    ): Promise<{ result: T; state: TasksPresentation }> {
        assertWritable(current);
        localWriteBusy = true;
        const actionId = tasks.createActionId();
        try {
            const result = await command(actionId);
            assertSameActivation(current, payload);
            return { result, state: emitState(current) };
        } catch (error) {
            report(error);
            if (activation === current && currentChatIdentity() === current.chatIdentity) {emitCurrentState();}
            throw publicError(error);
        } finally {
            if (activation === current) {localWriteBusy = false;}
        }
    }

    function activate(context: XiaobaiOsAppActivationContext): TasksPresentation {
        cancelForeground('app-reactivated');
        const chatIdentity = currentChatIdentity();
        if (!chatIdentity) {throw new Error('tasks_chat_unavailable');}
        const current = { chatIdentity, post: context.post };
        activation = current;
        schedulePreparation(current);
        return buildState(chatIdentity);
    }

    function cancelForeground(_reason = 'route-left'): void {
        activation = null;
        preparation = null;
        localWriteBusy = false;
    }

    function cancelAll(reason: string): void {
        cancelForeground(reason);
        backgroundGeneration.cancelAll(reason);
    }

    async function handleMessage(message: XiaobaiOsHostFrameMessage): Promise<unknown> {
        const payload = isRecord(message.payload) ? message.payload : {};
        const current = assertActivation(payload);
        if (message.type === 'tasks/activate') {
            return emitState(current);
        }
        if (message.type === 'tasks/detail/read') {
            const taskId = requireId(payload.taskId, 'tasks_request_invalid');
            if (typeof payload.scopeId === 'string' && payload.scopeId !== tasks.readCurrent().currentScopeId) {
                const scopeId = requireId(payload.scopeId, 'tasks_request_invalid');
                const commission = tasks.readCommission(scopeId, taskId);
                return { ...presentTaskDetail({ ...serviceView(), domain: commission.domain,
                    records: [commission.record] }, taskId), originScopeId: scopeId,
                    sourceLabel: commission.domain.storyLabel || '旧聊天' };
            }
            return presentTaskDetail(serviceView(), taskId);
        }
        if (message.type === 'tasks/history/load-more') {
            const cursor = requireId(payload.cursor, 'tasks_history_cursor_invalid');
            return presentTaskHistory(serviceView().records, cursor);
        }
        if (message.type === 'tasks/refresh' || message.type === 'tasks/candidates/refresh') {
            assertWritable(current);
            if (maintenance.getStatus('tasks', current.chatIdentity).state === 'running') {
                throw new Error('tasks_generation_active');
            }
            if (message.type === 'tasks/refresh') {backgroundGeneration.startBoard(current.chatIdentity);}
            else {backgroundGeneration.startCandidates(current.chatIdentity, requireTaskCas(payload));}
            return { started: true, state: emitState(current) };
        }
        if (message.type === 'tasks/board/accept') {
            const boardId = requireId(payload.boardId, 'tasks_request_invalid');
            const listingId = requireId(payload.listingId, 'tasks_request_invalid');
            return runLocal(current, payload, actionId => tasks.acceptListing(
                { actionId, boardId, listingId },
                () => commitGuard(current),
            ));
        }
        if (message.type === 'tasks/publish') {
            let form: TaskPublishedForm;
            try {form = normalizeTaskPublishedForm(payload.form);} catch {throw new Error('tasks_publish_invalid');}
            return runLocal(current, payload, actionId => tasks.publish(
                { actionId, form },
                () => commitGuard(current),
            ));
        }
        if (message.type === 'tasks/candidates/assign') {
            const cas = requireTaskCas(payload);
            const candidateId = requireId(payload.candidateId, 'tasks_request_invalid');
            return runLocal(current, payload, actionId => tasks.assignCandidate(
                { actionId, ...cas, candidateId },
                () => commitGuard(current),
            ));
        }
        if (message.type === 'tasks/cancel') {
            const cas = requireTaskCas(payload);
            return runLocal(current, payload, actionId => tasks.cancel(
                { actionId, ...cas },
                () => commitGuard(current),
            ));
        }
        if (message.type === 'tasks/commission/cancel') {
            if (localWriteBusy || tasks.getWriteState() !== 'ready' || !economy.isOpen()) {
                throw new Error('tasks_write_blocked');
            }
            const scopeId = requireId(payload.scopeId, 'tasks_request_invalid');
            const cas = requireTaskCas(payload);
            localWriteBusy = true;
            try {
                const result = await tasks.cancelCommission({ actionId: tasks.createActionId(),
                    ...cas, scopeId });
                return { result, state: activation === current ? emitState(current) : null };
            } catch (error) {
                report(error);
                if (activation === current) {emitCurrentState();}
                throw publicError(error);
            } finally {localWriteBusy = false;}
        }
        if (message.type === 'tasks/settings/update') {
            if (typeof payload.autoMaintenance !== 'boolean') {throw new Error('tasks_request_invalid');}
            await settings.setTasksAutoMaintenance(payload.autoMaintenance);
            assertSameActivation(current, payload);
            return emitState(current);
        }
        if (message.type === 'tasks/maintenance/run') {
            assertWritable(current);
            const start = maintenance.startManual('tasks');
            return {
                started: start.status === 'started',
                status: start.status,
                state: emitState(current),
            };
        }
        if (message.type === 'tasks/save/confirm') {
            const confirmation = await tasks.confirmPending();
            assertSameActivation(current, payload);
            if (confirmation.status === 'confirmed' || confirmation.status === 'none') {schedulePreparation(current);}
            return { confirmation: confirmation.status, state: emitState(current) };
        }
        if (message.type === 'tasks/read') {
            preparation = null;
            await tasks.refreshCurrent();
            assertSameActivation(current, payload);
            if (!economy.isOpen()) {schedulePreparation(current);}
            return { state: emitState(current) };
        }
        if (message.type === 'tasks/save/adopt-server') {
            const adoption = await tasks.adoptServerState();
            assertSameActivation(current, payload);
            return { adoption: adoption.status, state: emitState(current) };
        }
        throw new Error('tasks_request_unknown');
    }

    function handleDataChange(): void { emitCurrentState(); }

    return Object.freeze({
        activate,
        deactivate: cancelForeground,
        cancelForeground,
        cancelAll,
        handleChatChanged() {
            cancelAll('chat-changed');
            maintenance.cancelRequested('tasks', 'chat-changed');
            maintenance.invalidateAutomatic('tasks', 'chat-changed');
        },
        handleMessage,
        startBackground() {
            unsubscribeData ||= subscribeData(handleDataChange);
            unsubscribeGeneration ||= subscribeGeneration((active) => {
                if (active) {backgroundGeneration.cancelAll('main-generation-started');}
                emitCurrentState();
            });
            unsubscribeSettings ||= settings.subscribe(emitCurrentState);
            unsubscribeMaintenance ||= maintenance.subscribeStatus((participantId, chatIdentity) => {
                if (participantId === 'tasks' && activation?.chatIdentity === chatIdentity) {emitCurrentState();}
            });
        },
        stopBackground() {
            unsubscribeData?.();
            unsubscribeGeneration?.();
            unsubscribeSettings?.();
            unsubscribeMaintenance?.();
            unsubscribeData = null;
            unsubscribeGeneration = null;
            unsubscribeSettings = null;
            unsubscribeMaintenance = null;
            cancelAll('stopped');
        },
    });
}
