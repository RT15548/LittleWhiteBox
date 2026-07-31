<script setup lang="ts">
import type {
    TavernTaskCandidate,
    TavernTaskVersionRecord,
} from '../../../../../shared/tasks/task-types';
import {
    tavernTaskCounterparty,
    tavernTaskDirectionLabel,
    tavernTaskGradeLabel,
    tavernTaskRewardLabel,
    tavernTaskStatusLabel,
    tavernTaskStatusTone,
} from '../../../../features/phone-os/apps/tasks/tavern-task-presentation';
import TavernTaskCandidateList from './TavernTaskCandidateList.vue';
import TavernTaskTimeline from './TavernTaskTimeline.vue';

defineProps<{
    task: TavernTaskVersionRecord | null;
    detailLoading: boolean;
    detailError: string;
    detailResolved: boolean;
    timeline: TavernTaskVersionRecord[];
    timelineLoading: boolean;
    timelineLoadingMore: boolean;
    timelineHasMore: boolean;
    timelineError: string;
    candidateBusy: boolean;
    candidateError: string;
    actionBusy: boolean;
    actionError: string;
}>();

const emit = defineEmits<{
    (event: 'back'): void;
    (event: 'recruit', task: TavernTaskVersionRecord): void;
    (event: 'select', task: TavernTaskVersionRecord, candidate: TavernTaskCandidate): void;
    (event: 'withdraw', task: TavernTaskVersionRecord): void;
    (event: 'load-more'): void;
}>();
</script>

<template>
  <section class="tavern-phone-app tavern-task-detail-page">
    <header class="tavern-task-detail-head">
      <button
        type="button"
        class="tavern-phone-back-button"
        aria-label="返回任务列表"
        @click="emit('back')"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        ><path d="m15 4-8 8 8 8" /></svg>
      </button>
      <div>
        <strong>任务详情</strong>
      </div>
      <b v-if="task">{{ tavernTaskGradeLabel(task.grade) }}</b>
      <span v-else />
    </header>
    <div
      v-if="task"
      class="tavern-task-detail-scroll"
    >
      <article class="tavern-task-formal-record">
        <header>
          <span>{{ tavernTaskDirectionLabel(task) }}</span>
          <i :class="`is-${tavernTaskStatusTone(task.status)}`">{{ tavernTaskStatusLabel(task.status) }}</i>
          <h2>{{ task.title }}</h2>
        </header>
        <div class="tavern-task-formal-summary">
          <div>
            <span>报酬</span>
            <strong>{{ tavernTaskRewardLabel(task.reward) }} <i>◈</i></strong>
          </div>
          <div>
            <span>委托方</span>
            <strong>{{ tavernTaskCounterparty(task) }}</strong>
          </div>
        </div>
        <dl class="tavern-task-formal-fields">
          <div><dt>目标</dt><dd>{{ task.objective }}</dd></div>
          <div v-if="task.requirements">
            <dt>要求</dt><dd>{{ task.requirements }}</dd>
          </div>
          <div><dt>地点</dt><dd>{{ task.location }}</dd></div>
          <div v-if="task.posture">
            <dt>介入</dt><dd>{{ task.posture }}</dd>
          </div>
          <div v-if="task.timing">
            <dt>时机</dt><dd>{{ task.timing }}</dd>
          </div>
          <div v-if="task.risk">
            <dt>风险</dt><dd>{{ task.risk }}</dd>
          </div>
          <div><dt>当前进度</dt><dd>{{ task.progressSummary || '尚未开始' }}</dd></div>
          <div v-if="task.resultSummary">
            <dt>结算结果</dt><dd>{{ task.resultSummary }}</dd>
          </div>
        </dl>
        <div
          v-if="task.tags.length"
          class="tavern-task-dossier-tags"
        >
          <i
            v-for="tag in task.tags"
            :key="tag"
          >{{ tag }}</i>
        </div>
      </article>

      <section
        v-if="task.issuer.kind === 'player' && task.status === 'recruiting'"
        class="tavern-task-recruitment"
      >
        <header>
          <strong>应征者</strong>
          <button
            type="button"
            :disabled="candidateBusy || actionBusy"
            @click="emit('recruit', task)"
          >
            {{ candidateBusy ? '招募中' : task.candidates.length ? '重新招募' : '招募应征者' }}
          </button>
        </header>
        <div
          v-if="candidateError"
          class="tavern-task-inline-alert"
          role="status"
        >
          <p>{{ candidateError }}</p>
        </div>
        <TavernTaskCandidateList
          :candidates="task.candidates"
          :busy="candidateBusy || actionBusy"
          @select="emit('select', task, $event)"
        />
        <button
          type="button"
          class="tavern-task-withdraw-button"
          :disabled="candidateBusy || actionBusy"
          @click="emit('withdraw', task)"
        >
          撤回委托并退回报酬
        </button>
      </section>

      <div
        v-if="actionError"
        class="tavern-task-inline-alert"
        role="status"
      >
        <p>{{ actionError }}</p>
      </div>

      <TavernTaskTimeline
        :versions="timeline"
        :loading="timelineLoading"
        :loading-more="timelineLoadingMore"
        :has-more="timelineHasMore"
        :error="timelineError"
        @load-more="emit('load-more')"
      />
    </div>
    <div
      v-else-if="detailLoading"
      class="tavern-task-skeleton-list is-detail"
      aria-label="正在读取任务"
    >
      <span /><span /><span />
    </div>
    <div
      v-else-if="detailError"
      class="tavern-task-empty"
      role="status"
    >
      <strong>任务暂时无法读取</strong>
      <p>{{ detailError }}</p>
    </div>
    <div
      v-else-if="detailResolved"
      class="tavern-task-empty"
    >
      <strong>找不到这份委托</strong>
      <p>它可能已被其他时间线替换，返回列表重新读取。</p>
    </div>
  </section>
</template>
