<script setup lang="ts">
defineProps<{
    active: boolean;
    showTop: boolean;
    showBottom: boolean;
    extraClass?: string;
}>();

defineEmits<{
    (event: 'top'): void;
    (event: 'bottom'): void;
}>();
</script>

<template>
  <div
    class="chat-scroll-helpers"
    :class="[extraClass, { active }]"
  >
    <button
      type="button"
      :class="{ visible: showTop }"
      title="回到顶部"
      aria-label="回到顶部"
      @click="$emit('top')"
    >
      ▲
    </button>
    <button
      type="button"
      :class="{ visible: showBottom }"
      title="回到底部"
      aria-label="回到底部"
      @click="$emit('bottom')"
    >
      ▼
    </button>
  </div>
</template>
