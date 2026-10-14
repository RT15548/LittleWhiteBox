<script setup lang="ts">
import { ref } from 'vue';
import type { StoryPerson } from '../content/inner-city/people.js';
import { STORY_PORTRAITS } from './story-artwork.js';
import { DIALOGUE_COPY } from '../content/dialogue-copy.js';
defineProps<{ person: StoryPerson }>();
const failed = ref(false), attempt = ref(0);
function retry() { failed.value = false; attempt.value++; }
</script>

<template>
    <span class="ember-story-portrait" :class="{ 'is-failed': failed }">
        <img v-if="!failed" :key="attempt" :src="STORY_PORTRAITS[person]" alt="" width="418" height="560" loading="lazy" decoding="async" @error="failed = true">
        <button v-else type="button" @click="retry">{{ DIALOGUE_COPY.reloadArtwork }}</button>
    </span>
</template>

<style scoped>
.ember-story-portrait { float:left; display:block; width:142px; margin:0 14px 8px -4px; shape-outside:polygon(0 0,82% 0,90% 40%,100% 70%,90% 100%,0 100%); }
.ember-story-portrait img { display:block; width:100%; height:auto; }
.ember-story-portrait.is-failed { float:none; width:auto; margin:0 0 8px; }
.ember-story-portrait button { font-size:12px; min-height:32px; padding:4px 8px; background:transparent; }
@container (max-width:450px) { .ember-story-portrait { width:118px; margin-right:8px; } }
@media (max-height:480px) { .ember-story-portrait { width:clamp(68px,calc(40vh - 60px),110px); } }
</style>
