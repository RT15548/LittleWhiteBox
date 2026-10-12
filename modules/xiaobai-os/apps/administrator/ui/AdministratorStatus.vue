<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { AdministratorLive } from '../domain/types.js';
import { ADMINISTRATOR_COPY as C } from './copy.js';

const props = defineProps<{ phase: AdministratorLive['phase']; startedAt?: number }>();
const now = ref(Date.now());
const elapsed = computed(() => Math.max(0, Math.floor((now.value - (props.startedAt ?? now.value)) / 1000)));
watch(() => props.startedAt, (startedAt, _, cleanup) => {
    now.value = Date.now();
    if (startedAt === undefined) { return; }
    const timer = setInterval(() => { now.value = Date.now(); }, 1000);
    cleanup(() => clearInterval(timer));
}, { immediate: true });
</script>

<template>
    <div class="admin-live-status" :data-phase="phase">
        <span class="admin-working-dot" aria-hidden="true" />
        <span role="status" aria-live="polite">{{ C.phases[phase] }}</span>
        <time v-if="startedAt !== undefined" :datetime="`PT${elapsed}S`">{{ C.elapsed(elapsed) }}</time>
    </div>
</template>

<style scoped>
time { font-variant-numeric: tabular-nums; white-space: nowrap; }
</style>
