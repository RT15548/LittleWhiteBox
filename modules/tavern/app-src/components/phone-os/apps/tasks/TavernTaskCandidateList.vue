<script setup lang="ts">
import type { TavernTaskCandidate } from '../../../../../shared/tasks/task-types';

defineProps<{
    candidates: TavernTaskCandidate[];
    busy: boolean;
}>();

const emit = defineEmits<{
    (event: 'select', candidate: TavernTaskCandidate): void;
}>();
</script>

<template>
  <div
    v-if="candidates.length"
    class="tavern-task-candidate-list"
  >
    <article
      v-for="candidate in candidates"
      :key="candidate.id"
      class="tavern-task-candidate-card"
    >
      <header>
        <span>{{ candidate.name.slice(0, 1) }}</span>
        <div>
          <strong>{{ candidate.name }}</strong>
          <small>{{ candidate.capability }}</small>
        </div>
      </header>
      <p>{{ candidate.pitch }}</p>
      <dl>
        <div><dt>档案</dt><dd>{{ candidate.description }}</dd></div>
        <div><dt>风险</dt><dd>{{ candidate.risk }}</dd></div>
      </dl>
      <button
        type="button"
        :disabled="busy"
        @click="emit('select', candidate)"
      >
        选定执行人
      </button>
    </article>
  </div>
  <div
    v-else
    class="tavern-task-candidates-empty"
  >
    <strong>目前没有合适的应征者</strong>
    <p>稍后可以重新招募。</p>
  </div>
</template>
