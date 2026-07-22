<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
    label: string;
    usage: number | null;
    canClear: boolean;
    busy: boolean;
    mobile?: boolean;
}>(), {
    mobile: false,
});

const emit = defineEmits<{
    (event: 'clear'): void;
}>();

const normalizedUsage = computed(() => {
    if (props.usage === null || !Number.isFinite(Number(props.usage))) {
        return props.canClear ? 0.12 : 0;
    }
    return Math.max(0, Math.min(1, Number(props.usage)));
});
const fillStyle = computed<Record<string, string>>(() => ({
    '--assistant-context-fill': `${Math.round(normalizedUsage.value * 100)}%`,
}));
const buttonTitle = computed(() => {
    if (props.busy) {return `${props.label} · 助手运行中，暂不能清空对话`;}
    if (!props.canClear) {return `${props.label} · 暂无可清空的助手对话`;}
    return `${props.label} · 点击清空助手对话`;
});
</script>

<template>
  <button
    type="button"
    class="assistant-context-button"
    :class="[
      {
        'chat-mobile-icon-button': mobile,
        'chat-mobile-utility-button': mobile,
        'is-near-limit': normalizedUsage >= 0.88,
      },
    ]"
    :style="fillStyle"
    :title="buttonTitle"
    :aria-label="buttonTitle"
    :disabled="!canClear"
    @click="emit('clear')"
  >
    <span
      class="assistant-context-orb"
      aria-hidden="true"
    >
      <span class="assistant-context-orb-fill" />
    </span>
  </button>
</template>
