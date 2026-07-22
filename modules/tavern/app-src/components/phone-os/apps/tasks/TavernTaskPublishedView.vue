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
      <button
        type="button"
        @click="emit('publish')"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        ><path d="M12 5v14M5 12h14" /></svg>
        发布委托
      </button>
    </div>
    <TavernTaskList
      :tasks="tasks"
      empty-title="你还没有发布委托"
      empty-copy="发布后可在这里查看应征与进度。"
      @open="emit('open', $event)"
    />
  </section>
</template>
