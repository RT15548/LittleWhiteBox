<script setup lang="ts">
import { computed, watch } from 'vue';
import MessageMarkdown from '../../../shell/app-src/components/MessageMarkdown.vue';
import type { LearningClientState } from '../types.js';
import { learningWritingCount } from './workbench.js';
import { useLearningUnitSession } from './learning-session.js';
import { rememberLearningEditor as vRememberEditor } from './learning-editor.js';

type Unit = NonNullable<LearningClientState['unit']>;
const props = defineProps<{ state: LearningClientState; unit: Unit; exercise: Unit['exercises'][number]; disabled: boolean; label: string; placeholder: string; tone?: 'summary' | 'essay' }>();
const emit = defineEmits<{ action: [name: string, input?: Record<string, unknown>] }>();
const session = useLearningUnitSession(() => props.unit.id);
watch([session, () => props.exercise.id], () => { session.value.writing[props.exercise.id] ??= { text: '', rewriting: false, submitted: null }; }, { immediate: true });
const editor = computed(() => session.value.writing[props.exercise.id]);
const text = computed({ get: () => editor.value.text, set: value => { editor.value.text = value; } });
const rewriting = computed({ get: () => editor.value.rewriting, set: value => { editor.value.rewriting = value; } });
const draft = computed(() => props.unit.attempts.filter(entry => entry.exerciseId === props.exercise.id && entry.revisesAttemptId === undefined).at(-1));
const draftText = computed(() => draft.value?.answer.kind === 'text' ? draft.value.answer.text : '');
const editable = computed(() => !draft.value || rewriting.value);
const count = computed(() => learningWritingCount(text.value, props.state.language));
const savedCount = computed(() => learningWritingCount(draftText.value, props.state.language));
const reply = computed(() => props.state.workbenchConversation.summaryReviews.find(entry => entry.attemptId === draft.value?.id)?.text ?? '');
function submit() {
    if (props.disabled || !text.value.trim()) { return; }
    editor.value.submitted = { before: draft.value?.id, text: text.value };
    emit('action', 'submit', { unitId: props.unit.id, exerciseId: props.exercise.id, answer: { kind: 'text', text: text.value.trim() } });
}
function rewrite() { text.value = draftText.value; rewriting.value = true; }
</script>

<template>
    <div class="learning-write" :class="`is-${tone ?? 'summary'}`" :data-exercise-id="exercise.id">
        <p class="learning-write-label">{{ label }}</p>
        <form v-if="editable" @submit.prevent="submit">
            <textarea v-model="text" v-remember-editor="editor" :aria-label="label" :placeholder="placeholder" maxlength="4000" :rows="tone === 'essay' ? 8 : 3" @keydown.ctrl.enter.prevent="submit" @keydown.meta.enter.prevent="submit" />
            <div class="learning-write-foot">
                <small aria-live="polite">{{ count.count }} {{ count.unit }}</small>
                <button v-if="rewriting" type="button" @click="rewriting = false; text = ''">取消</button>
                <button type="submit" class="learning-primary" :disabled="disabled || !text.trim()">{{ draft ? '保存新稿' : '提交' }}</button>
            </div>
        </form>
        <template v-else-if="draft">
            <p class="learning-write-saved">{{ draftText }}</p>
            <div class="learning-write-foot">
                <small>已保存 · {{ savedCount.count }} {{ savedCount.unit }}</small>
                <button type="button" :disabled="disabled" @click="rewrite">重写</button>
            </div>
        </template>
        <MessageMarkdown v-if="reply" class="learning-markdown learning-write-reply" :text="reply" />
    </div>
</template>
