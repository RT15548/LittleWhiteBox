<script setup lang="ts">
import { computed } from 'vue';
import type { NpcId } from '../model.js';
import { APPEARANCE } from './cast-appearance.js';
import atlas from '../assets/cast-portraits.jpg?url&no-inline';
import yePortrait from '../assets/characters/ye-portrait.png?url&no-inline';
const props = defineProps<{ person: NpcId }>();
const appearance = computed(() => {
    if (props.person === 'ye') { return { backgroundImage: `url(${yePortrait})`, backgroundSize: 'cover', backgroundPosition: '50% 38%' }; }
    const cell = APPEARANCE[props.person].portrait!;
    return { backgroundImage: `url(${atlas})`, backgroundPosition: `${cell[0] * 50}% ${cell[1] * 100}%` };
});
</script>
<template><span class="island-portrait" aria-hidden="true" :style="appearance" /></template>
<style scoped>
.island-portrait{display:block;flex-shrink:0;aspect-ratio:1;width:42px;border-radius:50%;background-size:300% 200%;background-repeat:no-repeat;background-color:#d7e7dd;box-shadow:0 0 0 1px #759d8320}
</style>
