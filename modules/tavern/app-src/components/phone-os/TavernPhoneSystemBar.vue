<script setup lang="ts">
import type { TavernPhonePresentationMode } from '../../features/phone-os/phone-os-types';

defineProps<{
    mode: TavernPhonePresentationMode;
    isHome: boolean;
}>();

const emit = defineEmits<{
    (event: 'close'): void;
}>();
</script>

<template>
  <header
    class="tavern-phone-systembar"
    :class="[`is-${mode}`, { 'is-home': isHome }]"
  >
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
