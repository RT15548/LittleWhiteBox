<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRaw } from 'vue';
import { useAppBack } from '../../../shell/app-src/navigation/app-navigation.js';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import type {
    TaskDetailPresentation,
    TaskHistoryPage,
    TaskPublishedForm,
    TaskRecord,
    TasksPresentation,
} from '../types.js';
import TaskDetail from './TaskDetail.vue';
import TaskPublishForm from './TaskPublishForm.vue';
import TasksActive from './TasksActive.vue';
import TasksBoard from './TasksBoard.vue';
import TasksHistory from './TasksHistory.vue';
import TasksPublished from './TasksPublished.vue';
import TasksSettings from './TasksSettings.vue';
import { mergeTaskHistoryPage } from './history-pagination.js';
import TaskIcon from './TaskIcon.vue';
import TaskListingDetail from './TaskListingDetail.vue';
import TaskRecruitment from './TaskRecruitment.vue';
import TaskConfirmDialog from './TaskConfirmDialog.vue';
import { taskLanes, taskMoney } from './task-display.js';
import './tasks.css';

type MainPage = 'board' | 'active' | 'published' | 'history';
type TasksPage = MainPage | 'settings' | 'publish' | 'detail' | 'listing' | 'recruit';
type Confirmation = { kind: 'publish'; form: TaskPublishedForm }
    | { kind: 'cancel'; task: TaskRecord }
    | { kind: 'assign'; task: TaskRecord; candidateId: string };
const REQUEST_TIMEOUT_MS = 35_000;
const props = defineProps<XiaobaiOsAppProps>();

function fallbackState(): TasksPresentation {
    return {
        chatIdentity: '',
        status: 'blocked',
        message: '任务状态未能载入。',
        writeState: 'ready',
        settings: { autoMaintenance: false },
        playerBalance: 0,
        generationActive: false,
        generation: { state: 'idle', kind: null, taskId: null, message: '' },
        board: null,
        active: [],
        recruiting: [],
        history: { items: [], nextCursor: null, hasMore: false },
        maintenance: { state: 'idle', message: '' },
    };
}

function initialState(value: unknown): TasksPresentation {
    return value && typeof value === 'object'
        ? structuredClone(toRaw(value as TasksPresentation))
        : fallbackState();
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function resultBody(response: unknown): unknown {
    return isRecord(response) ? response.result : null;
}

const state = ref(initialState(props.initialState));
const page = ref<TasksPage>('board');
const parents: Partial<Record<TasksPage, TasksPage>> = {};
const detail = ref<TaskDetailPresentation | null>(null);
const confirmation = ref<Confirmation | null>(null);
const cancellingReceived = computed(() => confirmation.value?.kind === 'cancel' && confirmation.value.task.source === 'received');
const selectedListing = ref<{ boardId: string; listingId: string } | null>(null);
const selectedTaskId = ref('');
const historySource = ref<'all' | 'received' | 'published'>('all');
const content = ref<HTMLElement | null>(null);
const pagePositions: Partial<Record<TasksPage, { scrollTop: number; focusKey: string }>> = {};
const lanes = computed(() => taskLanes(state.value));
const receivedActive = computed(() => lanes.value.received);
const publishedRecords = computed(() => lanes.value.published);
const recruitmentTask = computed(() => [...publishedRecords.value, ...state.value.history.items].find(task => task.taskId === selectedTaskId.value) ?? null);
const listing = computed(() => state.value.board?.boardId === selectedListing.value?.boardId
    ? state.value.board?.listings.find(item => item.listingId === selectedListing.value?.listingId) ?? null : null);
const isMainPage = computed(() => ['board', 'active', 'published', 'history'].includes(page.value));
const pageTitle = computed(() => ({ board: '任务', active: '任务', published: '任务', history: '任务', settings: '任务设置', publish: '发布委托', detail: '委托详情', listing: '委托详情', recruit: '招募执行者' })[page.value]);
let detailRequest = 0;
const boardBusy = computed(() => state.value.generation.state === 'running' && state.value.generation.kind === 'board');
const candidateBusyTaskId = computed(() => (
    state.value.generation.state === 'running' && state.value.generation.kind === 'candidates'
        ? state.value.generation.taskId ?? ''
        : ''
));
const writeBusy = ref(false);
const settingsBusy = ref(false);
const saveBusy = ref(false);
const detailBusy = ref(false);
const historyBusy = ref(false);
const errorMessage = ref('');
const actionMessage = ref('');
let stateVersion = 0;
let mounted = false;
let unsubscribe = () => {};

const requiresConfirmation = computed(() => state.value.status === 'unconfirmed');
const writeDisabledReason = computed(() => {
    if (writeBusy.value) {return '正在处理上一项任务操作';}
    if (state.value.status === 'loading') {return '任务数据正在准备';}
    if (state.value.status === 'saving') {return '任务与资金正在保存';}
    if (state.value.status === 'unconfirmed') {return '请先核实上一次保存结果';}
    if (state.value.status === 'conflict') {return '请先采用服务端数据';}
    if (state.value.status === 'blocked') {return state.value.message || '任务暂时不可用';}
    if (state.value.generationActive) {return '正在生成内容，请稍后';}
    return '';
});
const generationDisabledReason = computed(() => (
    writeDisabledReason.value || (state.value.maintenance.state === 'running' ? '正在更新任务' : '')
));
const maintenanceMessage = computed(() => state.value.maintenance.message);
function applyState(next: TasksPresentation): void {
    if (!next || typeof next.chatIdentity !== 'string') {return;}
    state.value = structuredClone(next);
    errorMessage.value = '';
    const displayedTask = detail.value?.task;
    if (page.value === 'detail' && displayedTask) {
        const latest = [...next.active, ...next.recruiting, ...next.history.items]
            .find(task => task.taskId === displayedTask.taskId);
        if (latest && latest.eventId !== displayedTask.eventId) {void openDetail(latest.taskId, true);}
    }
}

function stateFromBody(body: unknown): TasksPresentation | null {
    if (!isRecord(body)) {return null;}
    const candidate = isRecord(body.state) ? body.state : body;
    return typeof candidate.chatIdentity === 'string' ? candidate as unknown as TasksPresentation : null;
}

function readableError(error: unknown): string {
    const code = error instanceof Error ? error.message : String(error);
    if (code === 'tasks_insufficient_funds') {return '小白币余额不足，任务没有发布。';}
    if (code === 'tasks_state_changed' || code === 'tasks_listing_already_accepted') {return '任务状态已经变化，请按最新状态重试。';}
    if (code === 'tasks_terminal') {return '该任务已经结束，不能再次操作。';}
    if (code === 'tasks_publish_invalid' || code === 'tasks_request_invalid') {return '任务内容不完整或超出允许范围。';}
    if (code === 'tasks_write_blocked' || code === 'tasks_generation_active') {return '当前有生成或保存正在进行，请稍后重试。';}
    if (code === 'tasks_chat_changed') {return '聊天已经切换，请重新打开任务。';}
    if (code === 'host_request_timeout') {return '操作响应超时，结果可能稍后返回，请勿立即重复。';}
    return '任务操作未完成，请稍后重试。';
}

async function request(endpoint: string, payload: Record<string, unknown> = {}, timeout = REQUEST_TIMEOUT_MS): Promise<unknown> {
    return resultBody(await props.bridge.request(endpoint, {
        chatIdentity: state.value.chatIdentity,
        ...payload,
    }, timeout));
}

function applyResponseState(body: unknown, versionAtStart: number): void {
    if (stateVersion !== versionAtStart) {return;}
    const next = stateFromBody(body);
    if (next?.chatIdentity === state.value.chatIdentity) {applyState(next);}
}

function announce(message: string): void {
    actionMessage.value = message;
    errorMessage.value = '';
}

async function refreshBoard(): Promise<void> {
    if (boardBusy.value || generationDisabledReason.value) {return;}
    errorMessage.value = '';
    const version = stateVersion;
    try {
        const body = await request('tasks/refresh');
        if (!mounted) {return;}
        applyResponseState(body, version);
    } catch (error) {if (mounted) {errorMessage.value = readableError(error);}}
}

async function acceptListing(boardId: string, listingId: string): Promise<void> {
    if (writeDisabledReason.value) {return;}
    writeBusy.value = true;
    const version = stateVersion;
    try {
        const body = await request('tasks/board/accept', { boardId, listingId });
        applyResponseState(body, version);
        if (mounted && page.value === 'listing') {go('active');}
        announce('任务已接取，报酬已进入托管。');
    } catch (error) {errorMessage.value = readableError(error);}
    finally {writeBusy.value = false;}
}

async function recruit(task: TaskRecord): Promise<void> {
    if (candidateBusyTaskId.value || generationDisabledReason.value) {return;}
    errorMessage.value = '';
    const version = stateVersion;
    try {
        const body = await request('tasks/candidates/refresh', {
            taskId: task.taskId,
            expectedTaskRevision: task.taskRevision,
            expectedEventId: task.eventId,
        });
        if (!mounted) {return;}
        applyResponseState(body, version);
    } catch (error) {if (mounted) {errorMessage.value = readableError(error);}}
}

async function assignTask(task: TaskRecord, candidateId: string): Promise<void> {
    if (writeDisabledReason.value) {return;}
    writeBusy.value = true;
    const version = stateVersion;
    try {
        const body = await request('tasks/candidates/assign', {
            taskId: task.taskId,
            expectedTaskRevision: task.taskRevision,
            expectedEventId: task.eventId,
            candidateId,
        });
        applyResponseState(body, version);
        confirmation.value = null;
        if (mounted) {go('published');}
        announce('执行者已确认，任务进入进行中。');
    } catch (error) {errorMessage.value = readableError(error);}
    finally {writeBusy.value = false;}
}

async function cancelTask(task: TaskRecord): Promise<void> {
    if (writeDisabledReason.value) {return;}
    writeBusy.value = true;
    const version = stateVersion;
    try {
        const body = await request('tasks/cancel', {
            taskId: task.taskId,
            expectedTaskRevision: task.taskRevision,
            expectedEventId: task.eventId,
        });
        applyResponseState(body, version);
        confirmation.value = null;
        if (mounted) {go(task.source === 'received' ? 'active' : 'published');}
        announce(task.source === 'received' ? '已放弃任务，不会扣除小白币。' : '委托已取消，托管报酬已退回钱包。');
    } catch (error) {errorMessage.value = readableError(error);}
    finally {writeBusy.value = false;}
}

function requestPublish(form: TaskPublishedForm): void {
    if (!writeDisabledReason.value) {errorMessage.value = ''; confirmation.value = { kind: 'publish', form: structuredClone(form) };}
}

async function confirmPublish(): Promise<void> {
    const form = confirmation.value?.kind === 'publish' ? confirmation.value.form : null;
    if (!form || writeDisabledReason.value) {return;}
    writeBusy.value = true;
    const version = stateVersion;
    try {
        const body = await request('tasks/publish', { form: toRaw(form) });
        applyResponseState(body, version);
        confirmation.value = null;
        go('published');
        announce('任务已发布，报酬已锁入托管。');
    } catch (error) {errorMessage.value = readableError(error);}
    finally {writeBusy.value = false;}
}

async function setAutoMaintenance(enabled: boolean): Promise<void> {
    if (settingsBusy.value) {return;}
    settingsBusy.value = true;
    const version = stateVersion;
    try {
        const body = await request('tasks/settings/update', { autoMaintenance: enabled });
        applyResponseState(body, version);
        announce(enabled ? '已开启任务进展自动更新。' : '已关闭任务进展自动更新。');
    } catch (error) {errorMessage.value = readableError(error);}
    finally {settingsBusy.value = false;}
}

async function maintainOnce(): Promise<void> {
    if (state.value.maintenance.state === 'running' || generationDisabledReason.value) {return;}
    const version = stateVersion;
    try {
        const body = await request('tasks/maintenance/run');
        applyResponseState(body, version);
    } catch (error) {errorMessage.value = readableError(error);}
}

async function openDetail(taskId: string, refresh = false): Promise<void> {
    if (!refresh) {
        go('detail');
        detail.value = null;
        detailBusy.value = true;
    }
    const requestId = ++detailRequest;
    try {
        const body = await request('tasks/detail/read', { taskId });
        if (!mounted || requestId !== detailRequest) {return;}
        if (isRecord(body) && isRecord(body.task) && Array.isArray(body.timeline)) {
            detail.value = structuredClone(body as unknown as TaskDetailPresentation);
        }
    } catch (error) {if (mounted && requestId === detailRequest) {errorMessage.value = readableError(error);}}
    finally {if (mounted && requestId === detailRequest) {detailBusy.value = false;}}
}

async function loadMoreHistory(): Promise<void> {
    const cursor = state.value.history.nextCursor;
    if (!cursor || historyBusy.value) {return;}
    historyBusy.value = true;
    const boundary = { cursor, stateVersion };
    try {
        const body = await request('tasks/history/load-more', { cursor });
        if (mounted && isRecord(body) && Array.isArray(body.items)) {
            const pageResult = body as unknown as TaskHistoryPage;
            const merged = mergeTaskHistoryPage(state.value.history, pageResult, boundary, stateVersion);
            if (merged) {state.value.history = merged;}
        }
    } catch (error) {errorMessage.value = readableError(error);}
    finally {historyBusy.value = false;}
}

async function confirmSave(): Promise<void> {
    if (saveBusy.value) {return;}
    saveBusy.value = true;
    errorMessage.value = ''; actionMessage.value = '';
    const version = stateVersion;
    try {
        const body = await request('tasks/save/confirm');
        applyResponseState(body, version);
        if (isRecord(body) && body.confirmation === 'confirmed') { announce('保存已确认。'); }
    } catch (error) {errorMessage.value = readableError(error);}
    finally {saveBusy.value = false;}
}

async function adoptServer(): Promise<void> {
    if (saveBusy.value) {return;}
    saveBusy.value = true;
    errorMessage.value = ''; actionMessage.value = '';
    const version = stateVersion;
    try {
        const body = await request('tasks/save/adopt-server');
        applyResponseState(body, version);
        if (isRecord(body) && body.adoption === 'adopted') { announce('已采用服务端数据。'); }
    } catch (error) {errorMessage.value = readableError(error);}
    finally {saveBusy.value = false;}
}

async function retryRead(): Promise<void> {
    if (saveBusy.value) {return;}
    saveBusy.value = true;
    errorMessage.value = ''; actionMessage.value = '';
    const version = stateVersion;
    try { applyResponseState(await request('tasks/read'), version); }
    catch { errorMessage.value = '读取未完成，请检查存储连接后重试读取。'; }
    finally { saveBusy.value = false; }
}

function go(next: TasksPage, restore = false): void {
    actionMessage.value = '';
    if (next !== page.value && !restore) {
        parents[next] = ['board', 'active', 'published', 'history'].includes(next) ? 'board' : page.value;
    }
    pagePositions[page.value] = {
        scrollTop: content.value?.scrollTop ?? 0,
        focusKey: document.activeElement instanceof HTMLElement ? document.activeElement.dataset.navigationId ?? '' : '',
    };
    detailRequest += 1;
    page.value = next;
    void nextTick(() => {
        if (!mounted || page.value !== next) {return;}
        const position = restore ? pagePositions[next] : undefined;
        content.value?.scrollTo(0, position?.scrollTop ?? 0);
        const trigger = position?.focusKey
            ? Array.from(content.value?.closest('main')?.querySelectorAll<HTMLButtonElement>('button[data-navigation-id]') ?? [])
                .find(button => button.dataset.navigationId === position.focusKey)
            : undefined;
        (trigger ?? content.value)?.focus({ preventScroll: true });
    });
}

const back = useAppBack(() => {
    if (page.value === 'board') { return false; }
    go(parents[page.value] ?? 'board', true); return true;
});

function openListing(boardId: string, listingId: string): void {
    selectedListing.value = { boardId, listingId };
    go('listing');
}

function openPublished(task: TaskRecord): void {
    if (task.status === 'recruiting') {
        selectedTaskId.value = task.taskId;
        go('recruit');
    } else {void openDetail(task.taskId);}
}

function showPublishedHistory(): void {
    historySource.value = 'published';
    go('history');
    parents.history = 'published';
}

function askCancel(task: TaskRecord): void {
    errorMessage.value = '';
    confirmation.value = { kind: 'cancel', task };
}

function askAssign(task: TaskRecord, candidateId: string): void {
    errorMessage.value = '';
    confirmation.value = { kind: 'assign', task, candidateId };
}

function confirmAction(): void {
    const action = confirmation.value;
    if (!action) {return;}
    if (action.kind === 'publish') {void confirmPublish();}
    else if (action.kind === 'cancel') {void cancelTask(action.task);}
    else {void assignTask(action.task, action.candidateId);}
}


onMounted(() => {
    mounted = true;
    unsubscribe = props.bridge.subscribe((message) => {
        if (message.type === 'tasks/state') {
            const next = (message.payload as { state?: TasksPresentation } | undefined)?.state;
            if (next) {stateVersion += 1; applyState(next);}
        }
        if (message.type === 'tasks/error') {
            errorMessage.value = '任务状态暂时无法读取，请重新打开。';
        }
    });
    props.bridge.post('tasks/activate', { chatIdentity: state.value.chatIdentity });
});

onBeforeUnmount(() => {
    mounted = false;
    detailRequest += 1;
    unsubscribe();
    confirmation.value = null;
});
</script>

<template>
    <main class="tasks-app">
        <header class="tasks-app-header">
            <button v-if="!isMainPage" type="button" class="tasks-icon-button" aria-label="返回上一页" @click="back"><TaskIcon name="back" /></button>
            <h1>{{ pageTitle }}</h1>
            <div class="tasks-balance" aria-label="小白币余额"><strong>¤ {{ taskMoney(state.playerBalance) }}</strong></div>
            <button v-if="isMainPage" type="button" class="tasks-icon-button" aria-label="任务设置" data-navigation-id="settings" @click="go('settings')"><TaskIcon name="settings" /></button>
        </header>
        <div class="tasks-notices" aria-live="polite">
            <aside v-if="state.message || (errorMessage && !confirmation) || actionMessage" class="tasks-notice" :class="{ 'is-error': Boolean(errorMessage) || state.status === 'conflict' || state.status === 'blocked', 'is-warning': requiresConfirmation }" role="status">
                <div><p>{{ state.message || (confirmation ? '' : errorMessage) || actionMessage }}</p><button v-if="requiresConfirmation" type="button" :disabled="saveBusy" @click="confirmSave">{{ saveBusy ? '正在核实…' : '核实保存结果' }}</button><button v-else-if="state.status === 'conflict'" type="button" :disabled="saveBusy" @click="adoptServer">{{ saveBusy ? '正在采用…' : '采用服务端数据' }}</button><button v-else-if="state.status === 'blocked'" type="button" :disabled="saveBusy" @click="retryRead">{{ saveBusy ? '正在读取…' : '重试读取' }}</button></div>
                <button v-if="!state.message" type="button" class="tasks-icon-button" aria-label="关闭提示" @click="errorMessage = ''; actionMessage = ''"><TaskIcon name="close" /></button>
            </aside>
            <aside v-if="state.generation.message && !state.message" class="tasks-notice" role="status"><p>{{ state.generation.message }}</p></aside>
        </div>
        <div ref="content" class="tasks-content" tabindex="-1">
            <TasksBoard v-if="page === 'board'" :board="state.board" :busy="boardBusy" :disabled-reason="generationDisabledReason" @refresh="refreshBoard" @detail="openListing" />
            <TasksActive v-else-if="page === 'active'" :records="receivedActive" @detail="openDetail" @discover="go('board')" />
            <TasksPublished v-else-if="page === 'published'" :records="publishedRecords" :disabled-reason="writeDisabledReason" @open="openPublished" @publish="go('publish')" @history="showPublishedHistory" />
            <TasksHistory v-else-if="page === 'history'" :history="state.history" :loading="historyBusy" :source="historySource" @filter="historySource = $event" @detail="openDetail" @load-more="loadMoreHistory" />
            <TasksSettings v-else-if="page === 'settings'" :auto-maintenance="state.settings.autoMaintenance" :settings-busy="settingsBusy" :maintenance-busy="state.maintenance.state === 'running'" :maintenance-message="maintenanceMessage" :disabled-reason="generationDisabledReason" @update="setAutoMaintenance" @maintain="maintainOnce" />
            <TaskPublishForm v-else-if="page === 'publish'" :balance="state.playerBalance" :busy="writeBusy" :disabled-reason="writeDisabledReason" @submit="requestPublish" />
            <TaskListingDetail v-else-if="page === 'listing'" :listing="listing" :busy="writeBusy" :disabled-reason="writeDisabledReason" @accept="selectedListing && acceptListing(selectedListing.boardId, selectedListing.listingId)" />
            <TaskRecruitment v-else-if="page === 'recruit'" :task="recruitmentTask" :busy="writeBusy" :recruiting="Boolean(candidateBusyTaskId)" :disabled-reason="writeDisabledReason" :generation-disabled-reason="generationDisabledReason" @recruit="recruit" @assign="askAssign" @cancel="askCancel" @detail="openDetail" />
            <TaskDetail v-else :detail="detail" :loading="detailBusy" :busy="writeBusy" :disabled-reason="writeDisabledReason" @cancel="askCancel" />
        </div>
        <nav v-if="isMainPage" class="tasks-nav" aria-label="任务主导航">
            <button type="button" aria-label="发现委托" :aria-current="page === 'board' ? 'page' : undefined" @click="go('board')"><span><TaskIcon name="compass" /></span>发现</button>
            <button type="button" aria-label="我接的" :aria-current="page === 'active' ? 'page' : undefined" @click="go('active')"><span><TaskIcon name="ticket" /></span>我接的</button>
            <button type="button" aria-label="我发布" :aria-current="page === 'published' ? 'page' : undefined" @click="go('published')"><span><TaskIcon name="send" /><i v-if="state.recruiting.length" /></span>我发布</button>
            <button type="button" aria-label="记录" :aria-current="page === 'history' ? 'page' : undefined" @click="go('history')"><span><TaskIcon name="archive" /></span>记录</button>
        </nav>
        <TaskConfirmDialog v-if="confirmation" :title="confirmation.kind === 'publish' ? '确认发布' : confirmation.kind === 'cancel' ? (cancellingReceived ? '放弃任务？' : '取消委托？') : '确认执行者'" :confirm-label="confirmation.kind === 'publish' ? '托管并发布' : confirmation.kind === 'cancel' ? (cancellingReceived ? '确认放弃' : '取消并退款') : '确认委托'" :busy="writeBusy" :disabled-reason="writeDisabledReason" :error="errorMessage" @close="confirmation = null; errorMessage = ''" @confirm="confirmAction">
            <template v-if="confirmation.kind === 'publish'"><p class="tasks-confirm-name">{{ confirmation.form.title }}</p><strong class="tasks-confirm-amount">¤ {{ taskMoney(confirmation.form.reward) }}</strong><p>报酬将从钱包托管。发布后可招募执行者；任务结束前，你可以取消并全额退回报酬。</p></template>
            <template v-else-if="confirmation.kind === 'cancel'">
                <p class="tasks-confirm-name">{{ confirmation.task.title }}</p>
                <strong v-if="!cancellingReceived" class="tasks-confirm-amount">¤ {{ taskMoney(confirmation.task.reward) }}</strong>
                <p>{{ cancellingReceived ? '放弃后不再获得任务报酬，也不会扣除你的小白币。' : '取消后，托管报酬将全额退回你的钱包。' }}</p>
                <p>任务将移入记录，不再参与后续剧情提醒与进展更新。此操作无法撤销。</p>
            </template>
            <template v-else><p class="tasks-confirm-name">{{ confirmation.task.candidates.find(candidate => candidate.candidateId === (confirmation?.kind === 'assign' ? confirmation.candidateId : ''))?.name }}</p><p>确认后开始执行“{{ confirmation.task.title }}”。完成后，托管报酬将支付给执行者。</p></template>
        </TaskConfirmDialog>
    </main>
</template>
