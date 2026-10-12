<script setup lang="ts">
import { computed } from 'vue';
import { COPY as c, MEMORY_COPY } from './copy.js';
import { keepsakePlacements, memoryOrder } from './memories.js';
import { projectBlueprint, type Project } from './domain.js';
import KeepsakeIcon from './KeepsakeIcon.vue';
const props = defineProps<{ project: Project }>();
const gifts = computed(() => keepsakePlacements(projectBlueprint(props.project), props.project.rooms, props.project.memories));
</script>
<template>
    <p>{{ c.memoryProgress(project.memories.length) }}</p>
    <ol class="build-memory-album">
        <li v-for="id in memoryOrder(project.seed)" :key="id" :data-build-memory-id="id" :data-memory-earned="project.memories.includes(id)" :data-memory-displayed="gifts.some(g => g.id === id)">
            <KeepsakeIcon :memory="id" /><div><strong>{{ MEMORY_COPY[id].title }}</strong><p>{{ project.memories.includes(id) ? MEMORY_COPY[id].thanks : MEMORY_COPY[id].wish }}</p><small>{{ project.memories.includes(id) ? gifts.some(g => g.id === id) ? c.memoryPlaced(gifts.find(g => g.id === id)!.part.kind) : c.memoryStored : c.memoryLocked }}</small></div><span aria-hidden="true">{{ project.memories.includes(id) ? '✓' : '○' }}</span>
        </li>
    </ol>
    <p class="build-memory-note">{{ c.memoryCollection }}</p>
</template>
