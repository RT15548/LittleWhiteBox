<script setup lang="ts">
import type { TavernTaskVersionRecord } from '../../../../../shared/tasks/task-types';
import TavernTaskList from './TavernTaskList.vue';

defineProps<{ tasks: TavernTaskVersionRecord[] }>();
const emit = defineEmits<{ (event: 'open', task: TavernTaskVersionRecord): void }>();
</script>

<template>
  <section class="tavern-task-root-view">
    <TavernTaskList
      :tasks="tasks"
      empty-title="目前没有进行中的任务"
      empty-copy="接取或发布的任务会出现在这里。"
      @open="emit('open', $event)"
    />
  </section>
</template>
