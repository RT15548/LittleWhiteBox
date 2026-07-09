<script setup lang="ts">
import { computed } from 'vue';
import type { TavernSaveFeedback } from '../tavern-app-context';

const props = withDefaults(defineProps<{
    status: TavernSaveFeedback['status'];
    error?: string;
    disabled?: boolean;
    type?: 'button' | 'submit';
    idleTitle?: string;
    savingTitle?: string;
    successTitle?: string;
    errorTitle?: string;
}>(), {
    error: '',
    disabled: false,
    type: 'button',
    idleTitle: '保存',
    savingTitle: '正在保存',
    successTitle: '已保存',
    errorTitle: '保存失败',
});

const emit = defineEmits<{
    click: [event: MouseEvent];
}>();

const title = computed(() => {
    if (props.status === 'saving') {return props.savingTitle;}
    if (props.status === 'success') {return props.successTitle;}
    if (props.status === 'error') {return props.error || props.errorTitle;}
    return props.idleTitle;
});

const stateClass = computed(() => ({
    'tavern-save-status-button': true,
    'is-saving': props.status === 'saving',
    'is-success': props.status === 'success',
    'is-error': props.status === 'error',
}));
</script>

<template>
  <button
    :type="type"
    :class="stateClass"
    :title="title"
    :aria-label="title"
    :disabled="disabled"
    @click="emit('click', $event)"
  >
    <svg
      v-if="status === 'saving'"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 3a9 9 0 1 1-8.2 5.3" />
    </svg>
    <svg
      v-else-if="status === 'success'"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
    <svg
      v-else-if="status === 'error'"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.3 4.2 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" />
    </svg>
    <svg
      v-else
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M5 21h14a1 1 0 0 0 1-1V7.5L16.5 4H5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1Z" />
      <path d="M8 21v-7h8v7" />
      <path d="M8 4v5h7" />
    </svg>
  </button>
</template>
