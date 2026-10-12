<script setup lang="ts">
import { COPY as c } from './copy.js';
import type { delivery } from './delivery.js';
defineProps<{ result: ReturnType<typeof delivery> }>();
defineEmits<{ details: [] }>();
</script>
<template>
    <section class="build-delivery-brief" :aria-label="c.minimumTitle">
        <ul><li v-for="(met, key) in result.minimum" :key="key" :data-build-goal="key" :data-goal-met="met"><span aria-hidden="true">{{ met ? '✓' : '○' }}</span>{{ c.minimumGoals[key] }}</li></ul>
        <button type="button" data-build-action="brief" :aria-label="c.commission" @click="$emit('details')">{{ c.bonusProgress(result.wishes.filter(w => w.met).length) }}</button>
    </section>
</template>
