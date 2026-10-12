<script setup lang="ts">
import { ref } from 'vue';
import { useAppLayer } from '../../../shell/app-src/navigation/app-navigation.js';
import type { LearningApproval } from '../application/approval.js';
import { LEARNING_APPROVAL_COPY as copy } from './learning-copy.js';

const props = defineProps<{ approval: LearningApproval; pending: boolean }>();
const emit = defineEmits<{ action: [name: string, input: Record<string, unknown>] }>();
const layer = ref<HTMLElement | null>(null);
const decide = (approved: boolean) => emit('action', 'approve-operation', { id: props.approval.id, approved });
useAppLayer(layer, () => decide(false));
</script>

<template>
    <div ref="layer" class="learning-confirm-shade" @keydown.esc.stop.prevent="decide(false)">
        <section role="alertdialog" aria-labelledby="learning-approval-title" aria-describedby="learning-approval-detail" class="learning-confirm">
            <h2 id="learning-approval-title">{{ copy.title }}</h2>
            <p>{{ approval.title }}</p>
            <p id="learning-approval-detail">{{ copy.detail }}</p>
            <div class="learning-row">
                <button autofocus type="button" :disabled="pending" @click="decide(false)">{{ copy.decline }}</button>
                <button type="button" class="learning-primary" :disabled="pending" @click="decide(true)">{{ copy.accept }}</button>
            </div>
        </section>
    </div>
</template>
