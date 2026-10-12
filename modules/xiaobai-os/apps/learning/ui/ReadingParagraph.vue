<script setup lang="ts">
import { computed } from 'vue';
import type { LearningClientState } from '../types.js';
import LearningWriteBox from './LearningWriteBox.vue';
import { useLearningUnitSession } from './learning-session.js';
import { LEARNING_SELECTION_LIMIT, type LearningSelection } from '../../../domains/learning/notes.js';
import { LEARNING_SELECTION_COPY as copy } from './reading-selection.js';
import LearningSelectionActions from './LearningSelectionActions.vue';
import { LEARNING_PREPARATION_COPY as preparationCopy } from '../application/preparation-copy.js';
import { LEARNING_SUMMARY_PROMPT } from '../../../domains/learning/preparation.js';

type Unit = NonNullable<LearningClientState['unit']>;
const props = defineProps<{
    state: LearningClientState; unit: Unit; materialId: string; paragraph: { id: string; text: string }; number: number;
    disabled: boolean;
}>();
const emit = defineEmits<{ action: [name: string, input?: Record<string, unknown>]; ask: [exerciseId: string | undefined, selection: LearningSelection] }>();
const explanation = computed(() => props.unit.explanations.find(entry => entry.materialId === props.materialId && entry.paragraphId === props.paragraph.id));
const summary = computed(() => props.unit.exercises.find(entry => entry.paragraphId === props.paragraph.id));
/** Saved means in the host's vocabulary book, so a bookmark that failed to save never shows as saved. */
const savedTerms = computed(() => new Set(props.state.savedTerms));
const saved = (term: string) => savedTerms.value.has(term);
const session = useLearningUnitSession(() => props.unit.id);
const knowledgeKey = computed(() => `knowledge:${props.materialId}:${props.paragraph.id}`);
const selection = computed(() => session.value.selection?.materialId === props.materialId && session.value.selection.paragraphId === props.paragraph.id ? session.value.selection : null);
function selectParagraph() {
    session.value.selection = { materialId: props.materialId, paragraphId: props.paragraph.id, start: 0, end: props.paragraph.text.length, quote: props.paragraph.text };
}
</script>

<template>
    <section class="learning-reading-paragraph" :data-paragraph-id="paragraph.id" :data-material-id="materialId">
        <p class="learning-reading-text"><span class="learning-reading-number" aria-hidden="true">{{ number }}</span><span data-learning-text :data-material-id="materialId" :data-paragraph-id="paragraph.id">{{ paragraph.text }}</span></p>
        <button type="button" class="learning-paragraph-quote" :disabled="[...paragraph.text].length > LEARNING_SELECTION_LIMIT" @click="selectParagraph">{{ copy.select }}</button>
        <LearningSelectionActions v-if="selection" :selection="selection" :disabled="disabled" @ask="emit('ask', summary?.id, selection)" @say="emit('action', 'say', { selection })" @dismiss="session.selection = null" />
        <details v-if="explanation" class="learning-knowledge" :open="session.expanded[knowledgeKey]" @toggle="session.expanded[knowledgeKey] = ($event.target as HTMLDetailsElement).open">
            <summary>本段知识<span v-if="explanation.terms.length"> · {{ explanation.terms.length }} 个词语</span></summary>
            <p class="learning-knowledge-text">{{ explanation.explanation }}</p>
            <ul v-if="explanation.terms.length" class="learning-terms">
                <li v-for="term in explanation.terms" :key="term.text">
                    <span><strong>{{ term.text }}</strong><small>{{ term.note }}</small></span>
                    <button
                        type="button" :disabled="disabled || saved(term.text)" :aria-pressed="saved(term.text)"
                        @click="emit('action', 'bookmark', { unitId: unit.id, materialId, paragraphId: paragraph.id, termText: term.text })"
                    >
                        {{ saved(term.text) ? '已收藏' : '收藏' }}
                    </button>
                </li>
            </ul>
        </details>
        <p v-else class="learning-muted learning-knowledge-pending">{{ state.preparation?.running ? preparationCopy.notes : preparationCopy.missingNotes }}</p>
        <LearningWriteBox
            v-if="summary" :state="state" :unit="unit" :exercise="summary" :disabled="disabled" :label="LEARNING_SUMMARY_PROMPT" placeholder="写下这段的大意，不必逐句翻译"
            @action="(name, input) => emit('action', name, input)"
        />
    </section>
</template>
