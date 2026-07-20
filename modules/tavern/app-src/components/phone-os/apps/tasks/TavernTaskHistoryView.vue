<script setup lang="ts">
import type { TavernTaskVersionRecord } from '../../../../../shared/tasks/task-types';
import TavernTaskList from './TavernTaskList.vue';

defineProps<{
    tasks: TavernTaskVersionRecord[];
    loadingMore: boolean;
    hasMore: boolean;
    error: string;
}>();
const emit = defineEmits<{
    (event: 'open', task: TavernTaskVersionRecord): void;
    (event: 'load-more'): void;
}>();
</script>

<template>
  <section class="tavern-task-root-view">
    <div class="tavern-task-section-intro">
      <span>最近记录</span>
      <p>已经完成、失败或撤回的任务会按时间保留在这里。</p>
    </div>
    <TavernTaskList
      :tasks="tasks"
      empty-title="记录柜还是空的"
      empty-copy="任务结束后，会出现在这里。"
      @open="emit('open', $event)"
    />
    <p
      v-if="error"
      class="tavern-task-inline-alert"
      role="status"
    >
      {{ error }}
    </p>
    <button
      v-if="hasMore"
      type="button"
      class="tavern-task-timeline-more"
      :disabled="loadingMore"
      @click="emit('load-more')"
    >
      {{ loadingMore ? '正在读取' : '查看更多记录' }}
    </button>
  </section>
</template>
