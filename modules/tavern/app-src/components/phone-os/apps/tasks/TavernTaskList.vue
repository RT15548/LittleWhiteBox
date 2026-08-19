<script setup lang="ts">
import type { TavernTaskVersionRecord } from '../../../../../shared/tasks/task-types';
import TavernTaskCard from './TavernTaskCard.vue';

defineProps<{
    tasks: TavernTaskVersionRecord[];
    emptyTitle: string;
    emptyCopy: string;
}>();

const emit = defineEmits<{
    (event: 'open', task: TavernTaskVersionRecord): void;
}>();
</script>

<template>
  <div
    v-if="tasks.length"
    class="tavern-task-list"
  >
    <TavernTaskCard
      v-for="task in tasks"
      :key="task.taskId"
      :task="task"
      @open="emit('open', task)"
    />
  </div>
  <div
    v-else
    class="tavern-task-empty"
  >
    <span aria-hidden="true"><i /><i /><i /></span>
    <strong>{{ emptyTitle }}</strong>
    <p>{{ emptyCopy }}</p>
  </div>
</template>
