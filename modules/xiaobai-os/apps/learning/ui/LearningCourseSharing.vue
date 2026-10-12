<script setup lang="ts">
import type { LearningClientState } from '../types.js';
import { learningActionAvailable } from '../application/action-availability.js';
import { LEARNING_SHARING_COPY as copy } from './learning-copy.js';

const props = defineProps<{ state: LearningClientState; unit: NonNullable<LearningClientState['unit']>; disabled: boolean }>();
const emit = defineEmits<{ confirm: [name: string, input: Record<string, unknown>, text: string] }>();
function share() {
    emit('confirm', 'share-course', { unitId: props.unit.id, commitId: props.state.commitId, approved: true }, copy.confirm);
}
</script>

<template>
    <div v-if="unit.shared === false" class="learning-row">
        <span class="learning-muted">{{ copy.private }}</span>
        <button type="button" :disabled="disabled || !state.commitId || !learningActionAvailable('share-course', state)" @click="share">{{ copy.action }}</button>
    </div>
</template>
