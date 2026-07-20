<script setup lang="ts">
import type { TavernTaskVersionRecord } from '../../../../../shared/tasks/task-types';
import TavernTaskList from './TavernTaskList.vue';

defineProps<{ tasks: TavernTaskVersionRecord[] }>();
const emit = defineEmits<{ (event: 'open', task: TavernTaskVersionRecord): void }>();
</script>

<template>
  <section class="tavern-task-root-view">
    <div class="tavern-task-section-intro">
      <span>CLOSED FILES</span>
      <p>已经完成、失败或在招募期撤回的正式记录。</p>
    </div>
    <TavernTaskList
      :tasks="tasks"
      empty-title="记录柜还是空的"
      empty-copy="任务进入终态后，会作为不可抹去的版本链保留在这里。"
      @open="emit('open', $event)"
    />
  </section>
</template>
