<script setup lang="ts">
defineProps<{
    isHome: boolean;
}>();

const emit = defineEmits<{
    (event: 'home'): void;
    (event: 'close'): void;
}>();
</script>

<template>
  <footer
    class="tavern-phone-system-navigation"
    :class="{ 'is-home': isHome }"
    aria-label="手机系统导航"
  >
    <span
      class="tavern-phone-system-navigation-spacer"
      aria-hidden="true"
    />
    <button
      type="button"
      class="tavern-phone-home-control"
      :class="{ 'is-home': isHome }"
      :aria-label="isHome ? '当前位于手机桌面' : '回到手机桌面'"
      :aria-current="isHome ? 'page' : undefined"
      @click="emit('home')"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="m5.5 11.2 6.5-5.4 6.5 5.4v6.35a1.7 1.7 0 0 1-1.7 1.7H7.2a1.7 1.7 0 0 1-1.7-1.7V11.2Z" />
        <path d="M9.5 19.1v-4.8h5v4.8" />
      </svg>
      <span aria-hidden="true" />
    </button>
    <button
      type="button"
      class="tavern-phone-dismiss-control"
      aria-label="收起手机"
      title="收起手机"
      @click="emit('close')"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="m6.5 9.25 5.5 5.5 5.5-5.5" />
        <path d="M8.25 18.5h7.5" />
      </svg>
    </button>
  </footer>
</template>
