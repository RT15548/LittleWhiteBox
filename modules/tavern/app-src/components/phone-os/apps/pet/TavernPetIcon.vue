<script setup lang="ts">
import { computed } from 'vue';
import { useTavernPhoneContext } from '../../../tavern-app-context';

const phone = useTavernPhoneContext();
const view = computed(() => phone.pet.view.value);
const glyph = computed(() => {
    if (view.value.existence === 'undiscovered') {return '▓';}
    if (view.value.phase === 'luring') {return '·';}
    if (view.value.phase === 'egg') {return '🥚';}
    return view.value.currentFace || '·';
});
</script>

<template>
  <span
    class="tavern-pet-icon"
    :class="[
      `is-${view.existence}`,
      view.phase ? `is-${view.phase}` : '',
      { 'is-dormant': view.dormant },
    ]"
    aria-hidden="true"
  >
    <span class="tavern-pet-icon-glyph">{{ glyph }}</span>
    <small v-if="view.dormant">zZ</small>
  </span>
</template>
