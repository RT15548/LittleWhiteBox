<script setup lang="ts">
import type { TavernTaskVersionRecord } from '../../../../../shared/tasks/task-types';
import TavernTaskList from './TavernTaskList.vue';

defineProps<{ tasks: TavernTaskVersionRecord[] }>();
const emit = defineEmits<{ (event: 'open', task: TavernTaskVersionRecord): void }>();
</script>

<template>
  <section class="tavern-task-root-view">
    <div class="tavern-task-section-intro">
      <span>LIVE OPERATIONS</span>
      <p>你承接的工作与已经选定执行人的发布任务。</p>
    </div>
    <TavernTaskList
      :tasks="tasks"
      empty-title="目前没有进行中的任务"
      empty-copy="从委托板接取一份工作，或发布任务并选定应征者。"
      @open="emit('open', $event)"
    />
  </section>
</template>
