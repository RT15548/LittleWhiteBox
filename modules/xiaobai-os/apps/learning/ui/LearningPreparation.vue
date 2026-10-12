<script setup lang="ts">
import type { LearningClientState } from '../types.js';
import { LEARNING_PREPARATION_COPY as copy } from '../application/preparation-copy.js';

defineProps<{ state: LearningClientState; disabled: boolean; pending: boolean }>();
const emit = defineEmits<{ action: [name: string, input?: Record<string, unknown>] }>();
</script>

<template>
    <section v-if="state.sourceChoice" class="learning-source-choice" aria-live="polite">
        <p>{{ state.sourceChoice === 'unconfigured' ? copy.noWeb : state.preparation?.message || copy.unavailable }}</p>
        <div class="learning-row">
            <button v-if="state.sourceChoice === 'unavailable'" type="button" class="learning-primary" :disabled="disabled" @click="emit('action', 'retry-source')">{{ copy.retry }}</button>
            <button v-else type="button" class="learning-primary" :disabled="pending" @click="emit('action', 'research-settings')">{{ copy.settings }}</button>
            <button v-if="state.preparation?.source !== 'authored'" type="button" :disabled="disabled" @click="emit('action', 'choose-original')">{{ copy.original }}</button>
            <button type="button" :disabled="pending" @click="emit('action', 'dismiss-source')">{{ state.unit ? copy.existing : copy.dismiss }}</button>
        </div>
        <button v-if="state.sourceChoice === 'unavailable' && state.preparation?.source !== 'authored'" type="button" :disabled="pending" @click="emit('action', 'research-settings')">{{ copy.settings }}</button>
    </section>
    <section v-else-if="!state.preparation?.running && (state.preparation || state.unit?.kind === 'reading-writing' && !state.unit.preparation.ready)" class="learning-preparation" aria-live="polite">
        <p v-if="state.preparation?.message" class="learning-turn-notice">{{ state.preparation.message }}</p>
        <div class="learning-row">
            <button v-if="state.unit?.kind === 'reading-writing' && !state.unit.preparation.ready" type="button" :disabled="disabled" @click="emit('action', 'resume-preparation', { unitId: state.unit.id })">{{ copy.resume }}</button>
        </div>
    </section>
</template>
