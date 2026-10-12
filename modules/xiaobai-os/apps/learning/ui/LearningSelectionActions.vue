<script setup lang="ts">
import type { LearningSelection } from '../../../domains/learning/notes.js';
import { LEARNING_SELECTION_COPY as copy } from './reading-selection.js';
defineProps<{ selection: LearningSelection; disabled: boolean }>();
defineEmits<{ ask: []; say: []; dismiss: [] }>();
</script>

<template>
    <div class="learning-selection">
        <blockquote>{{ selection.quote }}</blockquote>
        <div class="learning-row">
            <button type="button" @click="$emit('ask')">{{ copy.ask }}</button>
            <button type="button" :disabled="disabled || [...selection.quote].length > 1000" @click="$emit('say')">{{ copy.listen }}</button>
            <button type="button" @click="$emit('dismiss')">{{ copy.dismiss }}</button>
        </div>
    </div>
</template>
