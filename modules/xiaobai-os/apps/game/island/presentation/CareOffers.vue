<script setup lang="ts">
import type { IslandView } from '../service.js';
import type { Operation } from '../model.js';
import { COPY as c } from '../copy.js';
defineProps<{ observation: NonNullable<IslandView['player']>; disabled: boolean }>();
const emit = defineEmits<{ act: [operation: Operation] }>();
</script>
<template>
    <article v-for="offer in observation.careOffers.filter(o=>o.to==='player')" :key="offer.from" class="island-item">
        <strong>{{ c.careOfferedBy(offer.from) }}</strong><p>{{ c.wounds[offer.wound] }} · {{ c.treatments[offer.treatment] }}</p>
        <div class="island-item-actions"><button :disabled="disabled || !!observation.self.activity" @click="emit('act',{kind:'accept_care',from:offer.from})">{{ c.acceptCare }}</button><button :disabled="disabled" @click="emit('act',{kind:'decline_care',from:offer.from})">{{ c.declineCare }}</button></div>
        <small v-if="observation.self.activity">{{ c.careBusy }}</small>
    </article>
</template>
