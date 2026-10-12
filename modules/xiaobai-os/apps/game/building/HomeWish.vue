<script setup lang="ts">
import { COPY as c, MEMORY_COPY, MEMORY_NEEDS } from './copy.js';
import type { MemoryOpportunity } from './memories.js';
import KeepsakeIcon from './KeepsakeIcon.vue';
defineProps<{ opportunity: MemoryOpportunity | null; count: number; disabled: boolean }>();
defineEmits<{ remodel: []; remember: []; album: [] }>();
</script>
<template>
    <section class="build-home-wish" :aria-label="c.memories" :data-build-memory="opportunity?.id ?? 'complete'" :data-memory-ready="!!opportunity?.part">
        <header><strong>{{ opportunity ? MEMORY_COPY[opportunity.id].wish : c.memoryComplete }}</strong><button type="button" data-build-action="memories" @click="$emit('album')">{{ c.memoryProgress(count) }}</button></header>
        <p>{{ opportunity ? opportunity.need ? MEMORY_NEEDS[opportunity.need] : c.memoryReady : c.memoryFinished }}</p>
        <div v-if="opportunity" class="build-memory-reward"><KeepsakeIcon :memory="opportunity.id" /><span>{{ c.memoryReward(opportunity.id) }}</span></div>
        <div class="build-home-actions"><button type="button" :class="{ 'build-primary': !opportunity?.part }" :disabled="disabled" data-build-action="remodel" @click="$emit('remodel')">{{ c.remodel }}</button><button v-if="opportunity?.part" type="button" class="build-primary" :disabled="disabled" data-build-action="remember" @click="$emit('remember')">{{ c.remember }}</button></div>
    </section>
</template>
