<script setup lang="ts">
import type { TavernTaskVersionRecord } from '../../../../../shared/tasks/task-types';
import TavernTaskList from './TavernTaskList.vue';

defineProps<{ tasks: TavernTaskVersionRecord[] }>();
const emit = defineEmits<{
    (event: 'open', task: TavernTaskVersionRecord): void;
    (event: 'publish'): void;
}>();
</script>

<template>
  <section class="tavern-task-root-view">
    <div class="tavern-task-published-actions">
      <div>
        <span>发布须知</span>
        <p>报酬会在发布时立即进入托管。</p>
      </div>
      <button
        type="button"
        @click="emit('publish')"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        ><path d="M12 5v14M5 12h14" /></svg>
        发布
      </button>
    </div>
    <TavernTaskList
      :tasks="tasks"
      empty-title="你还没有发布委托"
      empty-copy="写下目标与报酬，终端会替你招募合适的执行人。"
      @open="emit('open', $event)"
    />
  </section>
</template>
