<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ text: string }>();
// Quotes only affect typography. Text remains literal, including incomplete quotes and HTML.
const parts = computed(() => props.text.split(/(「[^」]*」|『[^』]*』|“[^”]*”|"[^"\n]*")/gu));
</script>

<template><p class="island-dialogue-text" :class="{ 'has-dialogue': parts.length > 1 }"><span v-for="(part, index) in parts" :key="index" :class="{ voiced: index % 2 === 1 }">{{ part }}</span></p></template>

<style scoped>
.island-dialogue-text{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.9}
.has-dialogue{color:var(--island-muted)}
.voiced{color:var(--island-ink)}
</style>
