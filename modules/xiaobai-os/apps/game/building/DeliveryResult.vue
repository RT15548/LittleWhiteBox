<script setup lang="ts">
import { COPY as c } from './copy.js';
defineProps<{ award: number; disabled: boolean }>();
defineEmits<{ homes: []; start: [] }>();
</script>
<template>
    <section class="build-delivery-result" data-build-result="delivered" role="status">
        <h2>{{ c.delivered }}</h2><p :data-build-award="award">{{ c.earned(award) }} · {{ c.net(award) }}</p>
        <button type="button" class="build-primary" data-build-action="homes" :disabled="disabled" @click="$emit('homes')">{{ c.homes }}</button>
        <button type="button" data-build-action="start" :disabled="disabled" @click="$emit('start')">{{ c.another }}</button>
    </section>
</template>
