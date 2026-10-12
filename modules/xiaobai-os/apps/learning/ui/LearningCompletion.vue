<script setup lang="ts">
import { computed } from 'vue';
import type { LearningClientState } from '../types.js';
import { LEARNING_REWARD_COPY as copy } from '../application/feedback.js';

const props = defineProps<{ state: LearningClientState; unitId: string; amount: number; label: string; disabled: boolean; quiet?: boolean }>();
const emit = defineEmits<{ action: [name: string, input?: Record<string, unknown>] }>();
const completion = computed(() => props.state.completions.find(entry => entry.unitId === props.unitId));
const status = computed(() => {
    const value = completion.value?.rewardStatus;
    if (value === 'paid') { return copy.paid; }
    if (value === 'retired') { return copy.retired; }
    if (!completion.value) { return copy.saving; }
    return props.state.walletOpen ? copy.pending : copy.needsWallet;
});
</script>

<template>
    <section class="learning-complete" role="status" aria-live="polite">
        <div v-if="!quiet" class="learning-complete-burst" aria-hidden="true"><span v-for="n in 8" :key="n" :style="{ '--i': n }" /></div>
        <p class="learning-complete-title">{{ label }}</p>
        <p v-if="completion?.rewardStatus !== 'retired'" class="learning-complete-amount"><strong>{{ completion?.rewardStatus === 'paid' ? '+' : '' }}{{ completion?.amount ?? amount }}</strong><span>小白币</span></p>
        <small>{{ status }}</small>
        <button
            v-if="completion && completion.rewardStatus !== 'paid' && completion.rewardStatus !== 'retired'" type="button" :disabled="disabled || state.walletStorage !== 'ready'"
            @click="emit('action', 'reward', { unitId, openWallet: !state.walletOpen })"
        >
            {{ state.walletOpen ? copy.claim : copy.openWallet }}
        </button>
    </section>
</template>
