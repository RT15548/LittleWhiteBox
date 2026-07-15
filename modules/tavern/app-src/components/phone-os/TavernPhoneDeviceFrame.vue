<script setup lang="ts">
import type { TavernPhonePresentationMode } from '../../features/phone-os/phone-os-types';

defineProps<{
    mode: TavernPhonePresentationMode;
    viewportHeight: number;
    viewportOffsetLeft: number;
    viewportOffsetTop: number;
    viewportWidth: number;
}>();

const emit = defineEmits<{
    (event: 'close'): void;
}>();
</script>

<template>
  <section
    class="tavern-phone-device"
    :class="[`is-${mode}`]"
    :style="mode === 'mobile-fullscreen' && viewportHeight ? {
      '--phone-viewport-height': `${viewportHeight}px`,
      '--phone-viewport-offset-left': `${viewportOffsetLeft}px`,
      '--phone-viewport-offset-top': `${viewportOffsetTop}px`,
      '--phone-viewport-width': viewportWidth ? `${viewportWidth}px` : '100%',
    } : undefined"
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
