<script setup lang="ts">
import type { TavernTaskVersionRecord } from '../../../../../shared/tasks/task-types';
import {
    tavernTaskCounterparty,
    tavernTaskRewardLabel,
    tavernTaskStatusLabel,
    tavernTaskStatusTone,
    tavernTaskTimestampLabel,
} from '../../../../features/phone-os/apps/tasks/tavern-task-presentation';

defineProps<{
    task: TavernTaskVersionRecord;
}>();

const emit = defineEmits<{
    (event: 'open'): void;
}>();
</script>

<template>
  <button
    type="button"
    class="tavern-task-card"
    :class="`is-${tavernTaskStatusTone(task.status)}`"
    @click="emit('open')"
  >
    <span class="tavern-task-card-head">
      <b :class="`is-${tavernTaskStatusTone(task.status)}`">{{ tavernTaskStatusLabel(task.status) }}</b>
      <time>{{ tavernTaskTimestampLabel(task.updatedAt) }}</time>
    </span>
    <strong>{{ task.title }}</strong>
    <p>
      {{ ['completed', 'failed', 'cancelled'].includes(task.status)
        ? (task.resultSummary || task.progressSummary || task.objective)
        : (task.progressSummary || task.resultSummary || task.objective) }}
    </p>
    <span class="tavern-task-card-foot">
      <small>{{ tavernTaskCounterparty(task) }}</small>
      <span>
        <b>{{ tavernTaskRewardLabel(task.reward) }}</b>
        <i>◈</i>
      </span>
    </span>
  </button>
</template>
