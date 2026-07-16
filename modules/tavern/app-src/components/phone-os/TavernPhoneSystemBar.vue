<script setup lang="ts">
defineProps<{
    isHome: boolean;
}>();
</script>

<template>
  <header
    class="tavern-phone-systembar"
    :class="{ 'is-home': isHome }"
    aria-hidden="true"
  >
    <span class="tavern-phone-system-icons">
      <i class="tavern-phone-signal"><b /><b /><b /><b /></i>
      <i class="tavern-phone-battery"><b /></i>
    </span>
  </header>
</template>
