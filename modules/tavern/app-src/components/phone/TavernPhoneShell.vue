<script setup lang="ts">
const emit = defineEmits<{
    (event: 'close'): void;
}>();
</script>

<template>
  <section
    class="tavern-phone-device"
    role="dialog"
    aria-modal="true"
    aria-label="小白手机"
  >
    <button
      type="button"
      class="tavern-phone-side-button tavern-phone-side-button-power"
      aria-label="收起手机"
      @click="emit('close')"
    />
    <span class="tavern-phone-side-button tavern-phone-side-button-volume-up" />
    <span class="tavern-phone-side-button tavern-phone-side-button-volume-down" />
    <div class="tavern-phone-glass">
      <header class="tavern-phone-statusbar">
        <span class="tavern-phone-brand-mark">小白</span>
        <span
          class="tavern-phone-dynamic-island"
          aria-hidden="true"
        >
          <i />
        </span>
        <span
          class="tavern-phone-system-icons"
          aria-hidden="true"
        >
          <i class="tavern-phone-signal"><b /><b /><b /><b /></i>
          <i class="tavern-phone-wifi" />
          <i class="tavern-phone-battery"><b /></i>
        </span>
      </header>
      <main class="tavern-phone-screen">
        <slot />
      </main>
      <span
        class="tavern-phone-home-indicator"
        aria-hidden="true"
      />
    </div>
  </section>
</template>
