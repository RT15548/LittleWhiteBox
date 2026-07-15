<script setup lang="ts">
import type { TavernPhonePresentationMode } from '../../features/phone-os/phone-os-types';

defineProps<{
    mode: TavernPhonePresentationMode;
}>();

const emit = defineEmits<{
    (event: 'close'): void;
}>();
</script>

<template>
  <section
    class="tavern-phone-device"
    :class="[`is-${mode}`]"
    role="document"
  >
    <button
      v-if="mode === 'desktop-device'"
      type="button"
      class="tavern-phone-side-button tavern-phone-side-button-power"
      aria-label="收起手机"
      title="收起手机"
      @click="emit('close')"
    />
    <span
      v-if="mode === 'desktop-device'"
      class="tavern-phone-side-button tavern-phone-side-button-volume-up"
      aria-hidden="true"
    />
    <span
      v-if="mode === 'desktop-device'"
      class="tavern-phone-side-button tavern-phone-side-button-volume-down"
      aria-hidden="true"
    />
    <div class="tavern-phone-glass">
      <slot />
    </div>
  </section>
</template>
