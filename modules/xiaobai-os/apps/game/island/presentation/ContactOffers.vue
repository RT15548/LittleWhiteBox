<script setup lang="ts">
import type { IslandView } from '../service.js';
import type { Operation } from '../model.js';
import { COPY as c } from '../copy.js';
defineProps<{ observation: NonNullable<IslandView['player']>; disabled: boolean }>();
const emit = defineEmits<{ act: [operation: Operation] }>();
</script>
<template>
    <article v-for="offer in observation.contactOffers.filter(o => o.to === 'player')" :key="offer.from" class="island-item">
        <strong>{{ c.contactOfferedBy(offer.from, offer.form) }}</strong>
        <div class="island-item-actions">
            <button :disabled="disabled || !!observation.self.activity" @click="emit('act', { kind: 'accept_contact', from: offer.from })">{{ c.acceptContact }}</button>
            <button :disabled="disabled" @click="emit('act', { kind: 'decline_contact', from: offer.from })">{{ c.declineContact }}</button>
        </div>
        <small v-if="observation.self.activity">{{ c.contactBusy }}</small>
    </article>
</template>
