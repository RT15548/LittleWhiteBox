<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type {
    TavernTaskCandidate,
    TavernTaskListing,
    TavernTaskVersionRecord,
} from '../../../../../shared/tasks/task-types';
import { useTavernPhoneContext } from '../../../tavern-app-context';
import {
    TAVERN_PHONE_TASKS_APP_ID,
} from '../../../../features/phone-os/phone-os-types';
import {
    isTavernTaskRootPath,
    TAVERN_TASK_ACTIVE_PATH,
    TAVERN_TASK_BOARD_PATH,
    TAVERN_TASK_HISTORY_PATH,
    TAVERN_TASK_PUBLISHED_PATH,
    TAVERN_TASK_PUBLISH_PATH,
    tavernTaskDetailPath,
    tavernTaskIdFromPath,
    tavernTaskListingIdFromPath,
    tavernTaskListingPath,
    type TavernTaskRootPath,
} from '../../../../features/phone-os/apps/tasks/tavern-task-routes';
import { tavernTaskRewardLabel } from '../../../../features/phone-os/apps/tasks/tavern-task-presentation';
import TavernTaskActionDialog from './TavernTaskActionDialog.vue';
import TavernTaskActiveView from './TavernTaskActiveView.vue';
import TavernTaskBoardView from './TavernTaskBoardView.vue';
import TavernTaskHistoryView from './TavernTaskHistoryView.vue';
import TavernTaskOfferDetailView from './TavernTaskOfferDetailView.vue';
import TavernTaskPublishView from './TavernTaskPublishView.vue';
import TavernTaskPublishedView from './TavernTaskPublishedView.vue';
import TavernTaskDetailView from './TavernTaskDetailView.vue';

type TaskDialogState =
    | { kind: 'accept'; listing: TavernTaskListing }
    | { kind: 'publish' }
    | { kind: 'select'; task: TavernTaskVersionRecord; candidate: TavernTaskCandidate }
    | { kind: 'withdraw'; task: TavernTaskVersionRecord };

const phone = useTavernPhoneContext();
const dialog = ref<TaskDialogState | null>(null);
const rootTabs: Array<{ path: TavernTaskRootPath; label: string; count: () => number }> = [
    { path: TAVERN_TASK_BOARD_PATH, label: '委托', count: () => phone.tasks.board.value?.listings.length || 0 },
    { path: TAVERN_TASK_ACTIVE_PATH, label: '进行中', count: () => phone.tasks.activeTasks.value.length },
    { path: TAVERN_TASK_PUBLISHED_PATH, label: '发布', count: () => phone.tasks.publishedTasks.value.length },
    { path: TAVERN_TASK_HISTORY_PATH, label: '记录', count: () => phone.tasks.historyTasks.value.length },
];

const activePath = computed(() => (
    phone.os.activeRoute.value.kind === 'app' ? phone.os.activeRoute.value.path : ''
));
const listingId = computed(() => tavernTaskListingIdFromPath(activePath.value));
const taskId = computed(() => tavernTaskIdFromPath(activePath.value));
const activeListing = computed(() => (
    phone.tasks.board.value?.listings.find((listing) => listing.id === listingId.value) || null
));
const knownRoute = computed(() => (
    isTavernTaskRootPath(activePath.value)
    || activePath.value === TAVERN_TASK_PUBLISH_PATH
    || !!listingId.value
    || !!taskId.value
));
const dialogBusy = computed(() => !!phone.tasks.actionKey.value);
const dialogTitle = computed(() => {
    if (dialog.value?.kind === 'accept') {return '接取这份委托？';}
    if (dialog.value?.kind === 'publish') {return '发布并冻结报酬？';}
    if (dialog.value?.kind === 'select') {return `选定 ${dialog.value.candidate.name}？`;}
    return '撤回这份委托？';
});
const dialogMessage = computed(() => {
    if (dialog.value?.kind === 'accept') {return '接取后，这份委托会进入你的进行中任务。';}
    if (dialog.value?.kind === 'publish') {return '确认后任务进入招募中，报酬会由钱包托管，直到任务结算或撤回。';}
    if (dialog.value?.kind === 'select') {return '选定后任务立刻进入进行中，不能再撤回取回托管报酬。';}
    return '只有尚未选定执行人的任务可以撤回，全部托管报酬会退回钱包。';
});
const dialogDetails = computed(() => {
    const current = dialog.value;
    if (!current) {return [];}
    if (current.kind === 'accept') {
        return [
            current.listing.title,
            `发布者：${current.listing.issuer.name}`,
            `托管报酬：${tavernTaskRewardLabel(current.listing.reward)} 小白币`,
        ];
    }
    if (current.kind === 'publish') {
        return [
            phone.tasks.publishDraft.value.title || '未命名委托',
            `地点：${phone.tasks.publishDraft.value.location || '未填写'}`,
            `冻结报酬：${tavernTaskRewardLabel(Number(phone.tasks.publishDraft.value.reward))} 小白币`,
        ];
    }
    if (current.kind === 'select') {
        return [current.task.title, current.candidate.capability, `托管报酬：${tavernTaskRewardLabel(current.task.reward)} 小白币`];
    }
    return [current.task.title, `退款：${tavernTaskRewardLabel(current.task.reward)} 小白币`];
});
const dialogConfirmText = computed(() => {
    if (dialog.value?.kind === 'accept') {return '确认接取';}
    if (dialog.value?.kind === 'publish') {return '发布并托管';}
    if (dialog.value?.kind === 'select') {return '确认选定';}
    return '撤回并退款';
});
const dialogTone = computed<'default' | 'danger' | 'warning'>(() => (
    dialog.value?.kind === 'withdraw' ? 'danger' : dialog.value?.kind === 'publish' ? 'warning' : 'default'
));

function showRoot(path: TavernTaskRootPath) {
    phone.os.replaceAppRoute(TAVERN_PHONE_TASKS_APP_ID, path);
}

function openListing(listing: TavernTaskListing) {
    phone.tasks.actionError.value = '';
    phone.os.pushAppRoute(TAVERN_PHONE_TASKS_APP_ID, tavernTaskListingPath(listing.id), { listingId: listing.id });
}

function openTask(task: TavernTaskVersionRecord) {
    phone.tasks.actionError.value = '';
    phone.os.pushAppRoute(TAVERN_PHONE_TASKS_APP_ID, tavernTaskDetailPath(task.taskId), { taskId: task.taskId });
}

function openPublisher() {
    phone.tasks.actionError.value = '';
    phone.os.pushAppRoute(TAVERN_PHONE_TASKS_APP_ID, TAVERN_TASK_PUBLISH_PATH);
}

async function confirmDialog() {
    const current = dialog.value;
    if (!current) {return;}
    if (current.kind === 'accept') {
        const accepted = await phone.tasks.acceptListing(current.listing);
        if (!accepted) {return;}
        dialog.value = null;
        phone.os.back();
        showRoot(TAVERN_TASK_ACTIVE_PATH);
        return;
    }
    if (current.kind === 'publish') {
        const published = await phone.tasks.publishDraftTask();
        if (!published) {return;}
        dialog.value = null;
        phone.os.back();
        return;
    }
    if (current.kind === 'select') {
        const selected = await phone.tasks.selectCandidate(current.task, current.candidate);
        if (!selected) {return;}
        dialog.value = null;
        await phone.tasks.loadTaskDetail(selected.taskId);
        return;
    }
    const withdrawn = await phone.tasks.withdrawTask(current.task);
    if (!withdrawn) {return;}
    dialog.value = null;
    phone.os.back();
    showRoot(TAVERN_TASK_HISTORY_PATH);
}

async function recruit(task: TavernTaskVersionRecord) {
    const updated = await phone.tasks.recruitTaskCandidates(task);
    if (updated) {await phone.tasks.loadTaskDetail(updated.taskId);}
}

watch(taskId, (id) => {
    void phone.tasks.loadTaskDetail(id);
}, { immediate: true });

watch(dialog, (current) => {
    if (current) {phone.tasks.actionError.value = '';}
});
</script>

<template>
  <Transition
    :name="`tavern-phone-route-${phone.os.transitionDirection.value}`"
    mode="out-in"
  >
    <section
      v-if="isTavernTaskRootPath(activePath)"
      :key="activePath"
      class="tavern-phone-app tavern-tasks-app"
      :class="{ 'has-data-error': !!phone.tasks.dataError.value }"
    >
      <header class="tavern-tasks-head">
        <h2>任务</h2>
      </header>
      <nav
        class="tavern-task-tabs"
        aria-label="任务页面"
      >
        <button
          v-for="tab in rootTabs"
          :key="tab.path"
          type="button"
          :class="{ 'is-active': activePath === tab.path }"
          :aria-current="activePath === tab.path ? 'page' : undefined"
          @click="showRoot(tab.path)"
        >
          <span>{{ tab.label }}</span>
          <i v-if="tab.count()">{{ tab.count() > 99 ? '99+' : tab.count() }}</i>
        </button>
      </nav>
      <div
        v-if="phone.tasks.dataError.value"
        class="tavern-task-inline-alert tavern-task-root-alert"
        role="status"
      >
        <strong>任务记录读取失败</strong>
        <p>{{ phone.tasks.dataError.value }}</p>
      </div>
      <div class="tavern-task-content">
        <KeepAlive>
          <TavernTaskBoardView
            v-if="activePath === TAVERN_TASK_BOARD_PATH"
            :board="phone.tasks.board.value"
            :loading="phone.tasks.dataLoading.value"
            :refreshing="phone.tasks.boardRefreshing.value"
            :error="phone.tasks.boardError.value"
            :is-accepted="phone.tasks.isListingAccepted"
            @refresh="phone.tasks.refreshTaskBoard"
            @open="openListing"
          />
          <TavernTaskActiveView
            v-else-if="activePath === TAVERN_TASK_ACTIVE_PATH"
            :tasks="phone.tasks.activeTasks.value"
            @open="openTask"
          />
          <TavernTaskPublishedView
            v-else-if="activePath === TAVERN_TASK_PUBLISHED_PATH"
            :tasks="phone.tasks.publishedTasks.value"
            @open="openTask"
            @publish="openPublisher"
          />
          <TavernTaskHistoryView
            v-else
            :tasks="phone.tasks.historyTasks.value"
            :loading-more="phone.tasks.historyLoadingMore.value"
            :has-more="phone.tasks.historyHasMore.value"
            :error="phone.tasks.historyError.value"
            @open="openTask"
            @load-more="phone.tasks.loadMoreHistory"
          />
        </KeepAlive>
      </div>
    </section>

    <TavernTaskOfferDetailView
      v-else-if="listingId"
      key="task-listing-detail"
      :listing="activeListing"
      :accepted="!!activeListing && phone.tasks.isListingAccepted(activeListing)"
      :busy="phone.tasks.actionKey.value === `accept:${listingId}`"
      :error="phone.tasks.actionError.value"
      @back="phone.os.back"
      @accept="dialog = { kind: 'accept', listing: $event }"
    />

    <TavernTaskPublishView
      v-else-if="activePath === TAVERN_TASK_PUBLISH_PATH"
      key="task-publish"
      v-model:draft="phone.tasks.publishDraft.value"
      :balance="phone.wallet.balance.value"
      :balance-error="phone.wallet.balanceError.value"
      :balance-loading="phone.wallet.balanceLoading.value"
      :balance-ready="phone.wallet.balanceReady.value"
      :blocked-reason="phone.tasks.interactionBlockedReason.value"
      :busy="phone.tasks.actionKey.value === 'publish'"
      :error="phone.tasks.actionError.value"
      @back="phone.os.back"
      @submit="dialog = { kind: 'publish' }"
    />

    <TavernTaskDetailView
      v-else-if="taskId"
      key="task-formal-detail"
      :task="phone.tasks.selectedTask.value"
      :detail-loading="phone.tasks.detailLoading.value"
      :detail-error="phone.tasks.detailError.value"
      :detail-resolved="phone.tasks.detailResolved.value"
      :timeline="phone.tasks.taskTimeline.value"
      :timeline-loading="phone.tasks.timelineLoading.value"
      :timeline-loading-more="phone.tasks.timelineLoadingMore.value"
      :timeline-has-more="phone.tasks.timelineHasMore.value"
      :timeline-error="phone.tasks.timelineError.value"
      :candidate-busy="phone.tasks.candidateTaskId.value === taskId"
      :candidate-error="phone.tasks.candidateError.value"
      :action-busy="!!phone.tasks.actionKey.value"
      :action-error="phone.tasks.actionError.value"
      @back="phone.os.back"
      @recruit="recruit"
      @select="(task, candidate) => dialog = { kind: 'select', task, candidate }"
      @withdraw="dialog = { kind: 'withdraw', task: $event }"
      @load-more="phone.tasks.loadMoreTaskTimeline"
    />

    <section
      v-else-if="!knownRoute"
      key="task-route-missing"
      class="tavern-phone-app tavern-phone-route-missing"
    >
      <strong>任务页面暂时不可用</strong>
      <p>返回委托板后再试一次。</p>
      <button
        type="button"
        @click="showRoot(TAVERN_TASK_BOARD_PATH)"
      >
        返回委托板
      </button>
    </section>
  </Transition>

  <TavernTaskActionDialog
    v-if="dialog"
    :title="dialogTitle"
    :message="dialogMessage"
    :details="dialogDetails"
    :confirm-text="dialogConfirmText"
    :busy="dialogBusy"
    :error="phone.tasks.actionError.value"
    :tone="dialogTone"
    @cancel="dialog = null"
    @confirm="confirmDialog"
  />
</template>
