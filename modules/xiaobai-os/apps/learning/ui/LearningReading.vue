<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import type { LearningClientState } from '../types.js';
import LearningGrading from './LearningGrading.vue';
import LearningCompletion from './LearningCompletion.vue';
import LearningWriteBox from './LearningWriteBox.vue';
import AnswerInput from './AnswerInput.vue';
import AttemptFeedback from './AttemptFeedback.vue';
import { createLearningAnswerDraft } from './answer-draft.js';
import ReadingParagraph from './ReadingParagraph.vue';
import { useLearningUnitSession } from './learning-session.js';
import LearningCompanionControl from './LearningCompanionControl.vue';
import { useLearningTextSelection } from './reading-selection.js';
import type { LearningSelection } from '../../../domains/learning/notes.js';
import { LEARNING_FLOW_COPY as flow } from './learning-copy.js';
import { LEARNING_PREPARATION_COPY as preparationCopy } from '../application/preparation-copy.js';
import { learningActionAvailable } from '../application/action-availability.js';
import type { LearningAnswer } from '../../../domains/learning/types.js';

type Unit = NonNullable<LearningClientState['unit']>;
const props = defineProps<{ state: LearningClientState; unit: Unit; disabled: boolean; pending: boolean }>();
const emit = defineEmits<{ action: [name: string, input?: Record<string, unknown>]; confirm: [name: string, input: Record<string, unknown>, text: string]; ask: [exerciseId: string | undefined, selection: LearningSelection]; record: [id: string]; assistant: [exerciseId: string] }>();
const root = ref<HTMLElement | null>(null);
const session = useLearningUnitSession(() => props.unit.id);
useLearningTextSelection(root, () => props.unit.materials, value => { session.value.selection = value; });
const stage = computed(() => props.unit.stage.stage);
const currentView = computed(() => {
    const selected = session.value.reading.view;
    return selected ?? (stage.value === 'complete' ? 'model' : ['writing', 'grading'].includes(stage.value) ? 'reading' : 'feedback');
});
const views = ['reading', 'feedback', 'model'] as const;
async function show(value: typeof views[number]) {
    const scroller = root.value?.closest<HTMLElement>('.learning-scroll');
    if (scroller) { session.value.reading.scrolls[currentView.value] = scroller.scrollTop; }
    session.value.reading.view = value;
    await nextTick();
    if (scroller) { scroller.scrollTop = session.value.reading.scrolls[value] ?? 0; }
}
const steps = [['writing', '阅读与写作'], ['grading', '统一批改'], ['revising', '修改'], ['model', '范文'], ['complete', '完成']] as const;
const stepIndex = computed(() => ({ writing: 0, grading: 1, revising: 2, reviewing: 3, model: 3, complete: 4 } as Record<string, number>)[stage.value] ?? 0);
const essays = computed(() => props.unit.exercises.filter(entry => !entry.paragraphId && entry.skill === 'writing' && entry.response.kind === 'text'));
const extras = computed(() => props.unit.exercises.filter(entry => !entry.paragraphId && !essays.value.includes(entry)));
watch([extras, () => extras.value.map(exercise => session.value.activityDrafts[exercise.id])], ([list]) => {
    for (const exercise of list) {
        const response = JSON.stringify(exercise.response);
        if (session.value.activityDrafts[exercise.id]?.response !== response) {
            session.value.activityDrafts[exercise.id] = { response, value: createLearningAnswerDraft(exercise.response) };
        }
    }
}, { immediate: true });
const extraAnswers = computed(() => extras.value.flatMap(exercise => {
    const attempt = props.unit.attempts.filter(entry => entry.exerciseId === exercise.id).at(-1);
    return attempt ? [{ exercise, attempt, feedback: props.unit.assessments.find(entry => entry.attemptId === attempt.id) }] : [];
}));
const canGrade = computed(() => props.unit.stage.exercises.some(row => row.status === 'grading' || row.status === 'reviewing'));
const missing = computed(() => props.unit.stage.exercises.filter(row => row.status === 'writing').map(row => row.exerciseId));
const copy = {
    goal: '本篇目标', progress: '学习进度', essay: '主题写作', essayLabel: '你的作文', essayPlaceholder: '写下你的看法和理由',
    authored: '语伴原创', adapted: '改写自', original: '原文', written: '已写', next: '继续写作',
};
const numbered = computed(() => { let number = 0; return props.unit.materials.map(material => ({ material, paragraphs: material.paragraphs.map(paragraph => ({ paragraph, number: ++number })) })); });

const action = (name: string, input?: Record<string, unknown>) => emit('action', name, input);
function submit(exerciseId: string, answer: LearningAnswer) {
    session.value.activityDrafts[exerciseId].submitted = { before: props.unit.attempts.filter(entry => entry.exerciseId === exerciseId).at(-1)?.id };
    action('submit', { unitId: props.unit.id, exerciseId, answer });
}
function locate(exerciseId: string) {
    const target = root.value?.querySelector<HTMLElement>(`[data-exercise-id="${CSS.escape(exerciseId)}"]`);
    target?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    target?.querySelector<HTMLElement>('textarea, button')?.focus({ preventScroll: true });
}

</script>

<template>
    <article ref="root" class="learning-reading">
        <nav class="learning-reading-nav" :aria-label="flow.navigation">
            <button
                v-for="value in views" :key="value" type="button" :aria-current="currentView === value ? 'page' : undefined"
                :disabled="value === 'model' && !unit.modelEssay" @click="show(value)"
            >
                {{ flow[value] }}
            </button>
        </nav>
        <LearningCompletion v-if="state.completions.some(entry => entry.unitId === unit.id)" :state="state" :unit-id="unit.id" :amount="unit.reward.amount" :label="flow.completed" :disabled="disabled" @action="action" />
        <template v-if="currentView === 'reading'">
            <header class="learning-reading-head">
                <details class="learning-reading-goal" :open="session.expanded.goal" @toggle="session.expanded.goal = ($event.target as HTMLDetailsElement).open">
                    <summary>{{ copy.goal }}</summary>
                    <strong>{{ unit.title }}</strong><p v-if="unit.goal">{{ unit.goal }}</p>
                </details>
                <LearningCompanionControl :name="state.teacher?.name" />
            </header>
            <section v-for="(entry, index) in numbered" :key="entry.material.id" class="learning-reading-material">
                <component :is="index === 0 ? 'h1' : 'h2'" tabindex="-1">{{ entry.material.title }}</component>
                <p class="learning-source">
                    <template v-if="entry.material.provenance.kind === 'authored'">{{ copy.authored }}</template>
                    <template v-else>{{ entry.material.provenance.kind === 'adapted' ? copy.adapted : copy.original }} <a :href="entry.material.provenance.url" target="_blank" rel="noopener noreferrer">{{ entry.material.provenance.title }}</a></template>
                </p>
                <ReadingParagraph
                    v-for="item in entry.paragraphs" :key="item.paragraph.id" :state="state" :unit="unit" :material-id="entry.material.id" :paragraph="item.paragraph" :number="item.number"
                    :disabled="disabled" @action="action" @ask="(id, selection) => emit('ask', id, selection)"
                />
            </section>
            <section v-for="essay in essays" :key="essay.id" class="learning-essay">
                <h2>{{ copy.essay }}</h2>
                <p class="learning-essay-prompt">{{ essay.prompt }}</p>
                <LearningWriteBox :state="state" :unit="unit" :exercise="essay" :disabled="disabled" :label="copy.essayLabel" :placeholder="copy.essayPlaceholder" tone="essay" @action="action" />
            </section>
            <section v-if="!essays.length" class="learning-essay">
                <h2>{{ copy.essay }}</h2>
                <p class="learning-muted">{{ state.preparation?.running ? preparationCopy.essay : preparationCopy.missingEssay }}</p>
            </section>
            <section v-for="exercise in extras" :key="exercise.id" class="learning-essay" :data-exercise-id="exercise.id">
                <h2>{{ exercise.prompt }}</h2>
                <AnswerInput v-if="session.activityDrafts[exercise.id]" v-model="session.activityDrafts[exercise.id].value" :response="exercise.response" :paragraphs="unit.materials.filter(material => exercise.materialIds.includes(material.id)).flatMap(material => material.paragraphs)" :disabled="disabled" @submit="answer => submit(exercise.id, answer)" />
                <AttemptFeedback v-for="entry in extraAnswers.filter(entry => entry.exercise.id === exercise.id)" :key="entry.attempt.id" :attempt="entry.attempt" :feedback="entry.feedback" :response="exercise.response" :paragraphs="unit.materials.flatMap(material => material.paragraphs)" :disabled="disabled" :reviewable="unit.attemptActions[entry.attempt.id].review" @action="action" />
            </section>
            <ol class="learning-steps" :aria-label="copy.progress">
                <li v-for="([id, label], index) in steps" :key="id" :class="{ 'is-done': index < stepIndex, 'is-current': index === stepIndex }" :aria-current="index === stepIndex ? 'step' : undefined">{{ label }}</li>
            </ol>
            <div v-if="stage === 'writing'" class="learning-stage-bar is-writing">
                <span>{{ copy.written }} {{ unit.stage.exercises.length - missing.length }} / {{ unit.stage.exercises.length }}</span>
                <button v-if="missing.length" type="button" @click="locate(missing[0])">{{ copy.next }}</button>
                <span v-else class="learning-muted">{{ unit.preparation.essay ? preparationCopy.missingNotes : preparationCopy.missingEssay }}</span>
            </div>
            <div v-if="canGrade" class="learning-stage-bar">
                <template v-if="state.pending?.purpose === 'grade'"><span class="learning-working-dot" aria-hidden="true" /><span>{{ flow.grading }}</span><button type="button" :disabled="pending" @click="emit('action', 'cancel')">{{ flow.stop }}</button></template>
                <button v-else type="button" class="learning-primary" :disabled="disabled || !learningActionAvailable('grade', state)" @click="emit('action', 'grade', { unitId: unit.id })">{{ flow.grade }}</button>
            </div>
            <button v-else-if="unit.assessments.length" type="button" class="learning-primary" @click="show('feedback')">{{ flow.feedback }}</button>
        </template>
        <LearningGrading v-else :view="currentView" :state="state" :unit="unit" :disabled="disabled || !learningActionAvailable('grade', state)" :pending="pending" @ask="id => emit('assistant', id)" @action="action" @confirm="(name, input, text) => emit('confirm', name, input, text)" @record="id => emit('record', id)" />
        <button v-if="currentView === 'feedback' && stage === 'complete'" type="button" class="learning-primary" @click="show('model')">{{ flow.viewModel }}</button>
    </article>
</template>
