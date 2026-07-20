<script setup lang="ts">
import type { TavernTaskVersionRecord } from '../../../../../shared/tasks/task-types';
import {
    tavernTaskStatusLabel,
    tavernTaskStatusTone,
    tavernTaskTimestampLabel,
} from '../../../../features/phone-os/apps/tasks/tavern-task-presentation';

defineProps<{
    versions: TavernTaskVersionRecord[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    error: string;
}>();

const emit = defineEmits<{ (event: 'load-more'): void }>();
</script>

<template>
  <section class="tavern-task-timeline">
    <header>
      <span>进展记录</span>
      <strong>任务记录</strong>
    </header>
    <div
      v-if="loading"
      class="tavern-task-timeline-loading"
    >
      <span /><span /><span />
    </div>
    <ol v-else-if="versions.length">
      <li
        v-for="version in versions"
        :key="version.versionId"
        :class="`is-${tavernTaskStatusTone(version.status)}`"
      >
        <i />
        <div>
          <span>
            <strong>{{ tavernTaskStatusLabel(version.status) }}</strong>
            <time>{{ tavernTaskTimestampLabel(version.updatedAt) }}</time>
          </span>
          <p>{{ version.resultSummary || version.progressSummary || version.objective }}</p>
        </div>
      </li>
    </ol>
    <div
      v-if="error"
      class="tavern-task-inline-alert"
      role="status"
    >
      <p>{{ error }}</p>
    </div>
    <button
      v-if="hasMore"
      type="button"
      class="tavern-task-timeline-more"
      :disabled="loadingMore"
      @click="emit('load-more')"
    >
      {{ loadingMore ? '读取中' : '查看更早记录' }}
    </button>
  </section>
</template>
