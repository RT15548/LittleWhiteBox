<script setup lang="ts">
import { computed } from 'vue';
import type { NpcId } from '../model.js';
import { characterPortrait } from './character-media.js';
const props = defineProps<{ person: NpcId }>();
const appearance = computed(() => ({ backgroundImage: `url(${characterPortrait(props.person)})` }));
</script>
<template><span class="island-portrait" aria-hidden="true" :style="appearance" /></template>
<style scoped>
.island-portrait{display:block;flex-shrink:0;aspect-ratio:1;width:42px;border-radius:50%;background-size:cover;background-position:50% 38%;background-repeat:no-repeat;background-color:#e1edf2;box-shadow:0 0 0 1px #4e78951a}
</style>
