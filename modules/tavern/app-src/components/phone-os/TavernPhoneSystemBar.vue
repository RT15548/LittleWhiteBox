<script setup lang="ts">
import type { TavernPhonePresentationMode } from '../../features/phone-os/phone-os-types';

defineProps<{
    mode: TavernPhonePresentationMode;
    appName?: string;
    isHome: boolean;
}>();

const emit = defineEmits<{
    (event: 'close'): void;
    (event: 'home'): void;
}>();
</script>

<template>
  <header
    class="tavern-phone-systembar"
    :class="[`is-${mode}`]"
  >
    <button
      v-if="!isHome"
      type="button"
      class="tavern-phone-system-home"
      aria-label="回到手机桌面"
      title="回到手机桌面"
      @click="emit('home')"
    >
      <span
        class="material-symbols-rounded"
        aria-hidden="true"
      >home_app_logo</span>
    </button>
    <span
      v-else
      class="tavern-phone-brand-mark"
    >小白</span>
    <span class="tavern-phone-system-title">{{ appName || 'Phone OS' }}</span>
    <div class="tavern-phone-system-actions">
      <span
        class="tavern-phone-system-icons"
        aria-hidden="true"
      >
        <i class="tavern-phone-signal"><b /><b /><b /><b /></i>
        <i class="tavern-phone-battery"><b /></i>
      </span>
      <button
        type="button"
        class="tavern-phone-system-close"
        aria-label="收起手机"
        title="收起手机"
        @click="emit('close')"
      >
        <span
          class="material-symbols-rounded"
          aria-hidden="true"
        >keyboard_arrow_down</span>
      </button>
    </div>
  </header>
</template>
