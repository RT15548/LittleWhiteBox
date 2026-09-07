<script setup lang="ts">
import type { LearningClientState } from '../types.js';
import LearningIcon from './LearningIcon.vue';
defineProps<{ state: LearningClientState }>();
const emit = defineEmits<{ action: [name: string, input?: Record<string, unknown>] }>();
function clock(value: number) { return `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`; }
</script>

<template>
    <section v-if="state.media.status !== 'idle'" class="learning-player" aria-label="课堂朗读">
        <p v-if="state.media.message" role="status">{{ state.media.message }}</p>
        <button v-if="!state.voices.enabled" type="button" @click="emit('action', 'tts-settings')">如何开启 TTS</button>
        <div v-if="state.media.key" class="learning-row">
            <LearningIcon name="sound" /><span>{{ state.media.status === 'loading' ? '正在生成声音…' : `${clock(state.media.position)} / ${clock(state.media.duration)}` }}</span>
            <button v-if="state.media.status === 'playing'" type="button" aria-label="暂停" @click="emit('action', 'pause')"><LearningIcon name="pause" /></button>
            <button v-else-if="['paused', 'ended', 'blocked'].includes(state.media.status)" type="button" :aria-label="state.media.status === 'ended' ? '再听一遍' : '继续播放'" :disabled="state.busy" @click="emit('action', 'resume')"><LearningIcon name="play" /></button>
            <button type="button" aria-label="停止" @click="emit('action', 'stop')"><LearningIcon name="stop" /></button>
            <button v-if="state.media.duration" type="button" @click="emit('action', 'rate', { value: state.media.rate === 1 ? 0.75 : 1 })">{{ state.media.rate }}×</button>
        </div>
        <input v-if="state.media.duration" type="range" min="0" :max="state.media.duration" step="0.1" :value="state.media.position" aria-label="当前声音片段播放位置" @change="emit('action', 'seek', { value: Number(($event.target as HTMLInputElement).value) })">
    </section>
</template>
