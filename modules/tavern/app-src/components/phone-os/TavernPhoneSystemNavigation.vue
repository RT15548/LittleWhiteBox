<script setup lang="ts">
defineProps<{
    isHome: boolean;
}>();

const emit = defineEmits<{
    (event: 'home'): void;
}>();
</script>

<template>
  <footer class="tavern-phone-system-navigation">
    <button
      type="button"
      class="tavern-phone-home-control"
      :class="{ 'is-home': isHome }"
      :disabled="isHome"
      :aria-label="isHome ? '当前位于手机桌面' : '回到手机桌面'"
      @click="emit('home')"
    >
      <span aria-hidden="true" />
    </button>
  </footer>
</template>
